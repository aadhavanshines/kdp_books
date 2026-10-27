"""Network egress: which web addresses Sparrow may reach, and a fetcher
that enforces it on every request and every redirect."""

from __future__ import annotations

import asyncio
import html
import ipaddress
import re
import socket
from pathlib import Path
from urllib.parse import urljoin, urlsplit

import httpx

from .config import EgressSettings
from .vault import Vault

MAX_BYTES = 300_000
MAX_CHARS = 8_000
MAX_REDIRECTS = 4


def host_matches(host: str, pattern: str) -> bool:
    """'example.com' matches itself; '*.example.com' its subdomains."""
    if pattern.startswith("*."):
        return host.endswith(pattern[1:])
    return host == pattern


def literal_ip(host: str):
    """The address a host means without asking DNS: '127.0.0.1', but
    also old forms such as '127.1', '2130706433' or '0x7f000001'."""
    host = host.strip("[]")
    try:
        return ipaddress.ip_address(host)
    except ValueError:
        pass
    if re.fullmatch(r"[0-9a-fx.]+", host):
        try:
            return ipaddress.ip_address(socket.inet_aton(host))
        except OSError:
            return None
    return None


def is_private(host: str) -> bool:
    if host in ("localhost", "localhost.localdomain"):
        return True
    ip = literal_ip(host)
    return ip is not None and not ip.is_global


async def system_resolve(host: str) -> list[str]:
    """Every address DNS gives for a host name."""
    infos = await asyncio.get_running_loop().getaddrinfo(host, None)
    return [info[4][0] for info in infos]


class EgressPolicy:
    def __init__(self, settings: EgressSettings, approved_file: Path):
        self.settings = settings
        self.approved_file = approved_file

    def approved(self) -> list[str]:
        if not self.approved_file.exists():
            return []
        return self.approved_file.read_text().split()

    def approve(self, host: str) -> None:
        self.approved_file.parent.mkdir(parents=True, exist_ok=True)
        with open(self.approved_file, "a") as f:
            f.write(host + "\n")

    def decide(self, url: str) -> tuple[str, str]:
        """('allow' | 'deny' | 'ask', reason)."""
        parts = urlsplit(url)
        host = (parts.hostname or "").lower()
        if parts.scheme not in ("http", "https") or not host:
            return "deny", "only http and https web addresses"
        # A denied name also denies all of its subdomains
        if any(
            host_matches(host, p) or host.endswith("." + p.lstrip("*."))
            for p in self.settings.deny
        ):
            return "deny", f"{host} is on the deny list"
        allowed = self.settings.allow + self.approved()
        if any(host_matches(host, p) for p in allowed):
            return "allow", f"{host} is allowed"
        if is_private(host):
            return "deny", f"{host} is a private network address"
        if self.settings.unknown == "deny":
            return "deny", f"{host} is not on the allow list"
        return "ask", f"{host} is new"


def html_to_text(page: str) -> str:
    page = re.sub(r"(?is)<(script|style|noscript)\b.*?</\1>", " ", page)
    page = re.sub(r"(?s)<!--.*?-->", " ", page)
    page = re.sub(r"(?i)<br\s*/?>|</(p|div|li|h\d|tr)>", "\n", page)
    page = re.sub(r"<[^>]+>", " ", page)
    page = html.unescape(page)
    lines = (" ".join(line.split()) for line in page.splitlines())
    return "\n".join(line for line in lines if line)


class Fetcher:
    def __init__(
        self,
        policy: EgressPolicy,
        vault: Vault,
        client: httpx.AsyncClient | None = None,
        resolve=None,
    ):
        self.policy = policy
        self.vault = vault
        self.client = client or httpx.AsyncClient(timeout=15)
        self.resolve = resolve or system_resolve

    async def private_target(self, host: str) -> str | None:
        """Why a name must not be fetched because DNS points it at a
        private address (such as localtest.me -> 127.0.0.1), or None.
        Hosts on the allow list in the settings may be private."""
        if literal_ip(host) or any(
            host_matches(host, p) for p in self.policy.settings.allow
        ):
            return None
        for address in await self.resolve(host):
            if not ipaddress.ip_address(address.split("%")[0]).is_global:
                return f"{host} leads to a private address ({address})"
        return None

    async def fetch(self, url: str) -> tuple[str, str]:
        """Return (status, text). Status is 'ok', 'deny', 'ask' or
        'error'; text is the page or the reason."""
        for _ in range(MAX_REDIRECTS + 1):
            verdict, reason = self.policy.decide(url)
            if verdict != "allow":
                return verdict, reason
            host = urlsplit(url).hostname
            try:
                if reason := await self.private_target(host):
                    return "deny", reason
                headers = self.vault.headers_for(host)
                async with self.client.stream(
                    "GET", url, headers=headers, follow_redirects=False
                ) as response:
                    if response.is_redirect:
                        url = urljoin(url, response.headers["location"])
                        continue  # the new address is checked again
                    data = bytearray()
                    async for chunk in response.aiter_bytes():
                        data += chunk
                        if len(data) >= MAX_BYTES:
                            break  # stop downloading, not just reading
            except (httpx.HTTPError, KeyError, OSError) as error:
                return "error", f"{type(error).__name__}: {error}"
            body = bytes(data[:MAX_BYTES]).decode(
                response.encoding or "utf-8", errors="replace"
            )
            if "html" in response.headers.get("content-type", ""):
                body = html_to_text(body)
            body = self.vault.scrub(body)[:MAX_CHARS]
            return "ok", f"HTTP {response.status_code}\n{body}"
        return "error", "too many redirects"
