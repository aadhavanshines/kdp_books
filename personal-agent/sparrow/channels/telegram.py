"""The Telegram channel: Sparrow as a Telegram bot.

It long-polls the Bot API (getUpdates), so it needs no public web
address, and answers with sendMessage. Only private chats are handled."""

from __future__ import annotations

import asyncio

import httpx

from ..gateway import Inbound

LIMIT = 4000  # Telegram's limit is 4,096 characters per message


def chunks(text: str, size: int = LIMIT) -> list[str]:
    parts = []
    while len(text) > size:
        cut = text.rfind("\n", 0, size)
        cut = cut if cut > size // 2 else size
        parts.append(text[:cut])
        text = text[cut:].lstrip("\n")
    return parts + [text]


class TelegramChannel:
    name = "telegram"

    def __init__(
        self,
        token: str,
        api_url: str = "https://api.telegram.org",
        client: httpx.AsyncClient | None = None,
    ):
        self.base = f"{api_url.rstrip('/')}/bot{token}"
        self.client = client or httpx.AsyncClient(timeout=40)
        self.offset = 0
        self.working: set[asyncio.Task] = set()

    async def send(self, chat_id: str, text: str) -> None:
        for part in chunks(text):
            response = await self.client.post(
                f"{self.base}/sendMessage",
                json={"chat_id": int(chat_id), "text": part},
            )
            response.raise_for_status()

    async def poll_once(self, gateway, wait: int = 25) -> int:
        """Fetch new updates and hand each message to the gateway."""
        response = await self.client.get(
            f"{self.base}/getUpdates",
            params={
                "offset": self.offset,
                "timeout": wait,
                "allowed_updates": '["message"]',
            },
            timeout=wait + 10,
        )
        response.raise_for_status()
        updates = response.json()["result"]
        for update in updates:
            self.offset = update["update_id"] + 1
            message = update.get("message") or {}
            chat, sender = message.get("chat", {}), message.get("from", {})
            if "text" not in message or chat.get("type") != "private":
                continue
            # Each message runs as its own task, so one slow answer
            # doesn't hold up other chats (the gateway keeps each
            # conversation in order)
            task = asyncio.create_task(
                gateway.handle(
                    Inbound(
                        "telegram",
                        str(sender["id"]),
                        sender.get("first_name", "someone"),
                        str(chat["id"]),
                        message["text"],
                    )
                )
            )
            self.working.add(task)
            task.add_done_callback(self.working.discard)
        return len(updates)

    async def drain(self) -> None:
        """Wait until every message received so far is answered."""
        while self.working:
            await asyncio.gather(*self.working)

    async def run(self, gateway) -> None:
        delay = 1
        while True:
            try:
                await self.poll_once(gateway)
                delay = 1
            except (httpx.HTTPError, KeyError, ValueError) as error:
                gateway.core.audit.log(
                    gateway.core.now(),
                    "channel_error",
                    channel=self.name,
                    error=repr(error),
                )
                await asyncio.sleep(delay)
                delay = min(delay * 2, 60)  # back off, up to a minute
