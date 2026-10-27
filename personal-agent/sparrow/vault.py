"""The vault: API keys and tokens that tools may use but the model never
sees. Secrets are added to outgoing requests at the last moment, only for
the hosts they belong to, and scrubbed from anything going back."""

from __future__ import annotations

import os
import re
import stat
from pathlib import Path

PLACEHOLDER = re.compile(r"\$\{([A-Z0-9_]+)\}")


class Vault:
    def __init__(
        self, path: Path, for_hosts: dict[str, dict[str, str]] | None = None
    ):
        self.values: dict[str, str] = {}
        self.for_hosts = for_hosts or {}
        if path.exists():
            mode = stat.S_IMODE(path.stat().st_mode)
            if mode & 0o077:
                raise PermissionError(
                    f"{path} is readable by others; run: chmod 600 {path}"
                )
            for line in path.read_text().splitlines():
                name, sep, value = line.partition("=")
                if sep and not line.lstrip().startswith("#"):
                    self.values[name.strip()] = value.strip()

    def get(self, name: str) -> str | None:
        return self.values.get(name) or os.environ.get(name)

    def headers_for(self, host: str) -> dict[str, str]:
        """Headers to add for this host, with ${NAME} filled in."""
        templates = self.for_hosts.get(host, {})
        headers = {}
        for header, template in templates.items():

            def fill(match):
                value = self.get(match.group(1))
                if value is None:
                    raise KeyError(f"Secret {match.group(1)} is not set")
                return value

            headers[header] = PLACEHOLDER.sub(fill, template)
        return headers

    def scrub(self, text: str) -> str:
        """Replace any secret value that appears in text."""
        for name, value in self.values.items():
            if len(value) >= 6:
                text = text.replace(value, f"[secret {name}]")
        for templates in self.for_hosts.values():
            for template in templates.values():
                for name in PLACEHOLDER.findall(template):
                    value = self.get(name)
                    if value and len(value) >= 6:
                        text = text.replace(value, f"[secret {name}]")
        return text
