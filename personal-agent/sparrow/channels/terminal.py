"""The terminal channel: chat with Sparrow in the console, as the owner."""

from __future__ import annotations

import asyncio
import sys

from ..gateway import Inbound


class TerminalChannel:
    name = "terminal"

    def __init__(self, read_line=None, write=None):
        self.read_line = read_line or (lambda: sys.stdin.readline())
        self.write = write or (lambda text: print(text, flush=True))

    async def send(self, chat_id: str, text: str) -> None:
        self.write(f"\nSparrow: {text}\n")

    async def run(self, gateway) -> None:
        self.write(
            "Chatting with Sparrow. Type /help for commands, "
            "Ctrl+D to quit."
        )
        while True:
            line = await asyncio.to_thread(self.read_line)
            if not line:  # end of input
                return
            if line.strip():
                await gateway.handle(
                    Inbound(
                        "terminal", "owner", "Owner", "owner", line.strip()
                    )
                )
