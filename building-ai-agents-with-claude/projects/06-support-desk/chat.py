"""Chat with the support desk in your terminal.  Run:  python chat.py
Type a message and press Enter. Type 'quit' to stop.
"""

import asyncio

from claude_agent_sdk import ClaudeSDKClient

from desk import Desk
from watch import console, show


async def main():
    async with ClaudeSDKClient(options=Desk().options()) as client:
        while True:
            message = console.input("[bold magenta]You:[/] ").strip()
            if message.lower() in ("quit", "exit", ""):
                break
            await client.query(message)
            async for reply in client.receive_response():
                show(reply)


if __name__ == "__main__":
    asyncio.run(main())
