"""A stand-in for the Telegram Bot API, for tests: it implements just
getUpdates and sendMessage, and lets a test play the part of users.

Run it as a server for system tests:
    python tests/fake_telegram.py 8081
"""

from __future__ import annotations

import asyncio
import sys

from fastapi import FastAPI, HTTPException, Request

TOKEN = "123456:TEST-TOKEN"


class FakeTelegram:
    def __init__(self, token: str = TOKEN):
        self.token = token
        self.updates: list[dict] = []
        self.sent: list[dict] = []
        self.next_id = 1
        self.arrived = asyncio.Event()
        self.app = FastAPI()
        self.routes()

    def user_says(
        self,
        user_id: int,
        text: str,
        name: str = "Asha",
        chat_type: str = "private",
    ) -> None:
        self.updates.append(
            {
                "update_id": self.next_id,
                "message": {
                    "message_id": self.next_id,
                    "text": text,
                    "from": {"id": user_id, "first_name": name},
                    "chat": {"id": user_id, "type": chat_type},
                },
            }
        )
        self.next_id += 1
        self.arrived.set()

    def routes(self) -> None:
        @self.app.get("/bot{token}/getUpdates")
        async def get_updates(
            token: str, offset: int = 0, timeout: int = 0
        ):
            if token != self.token:
                raise HTTPException(401, "Unauthorized")
            fresh = [u for u in self.updates if u["update_id"] >= offset]
            if not fresh and timeout:
                self.arrived.clear()
                try:
                    await asyncio.wait_for(
                        self.arrived.wait(), min(timeout, 2)
                    )
                except TimeoutError:
                    pass
                fresh = [
                    u for u in self.updates if u["update_id"] >= offset
                ]
            return {"ok": True, "result": fresh}

        @self.app.post("/bot{token}/sendMessage")
        async def send_message(token: str, request: Request):
            if token != self.token:
                raise HTTPException(401, "Unauthorized")
            body = await request.json()
            if len(body["text"]) > 4096:
                raise HTTPException(400, "message is too long")
            self.sent.append(body)
            return {"ok": True, "result": {"message_id": len(self.sent)}}

        # For system tests driving the server over HTTP
        @self.app.post("/test/say")
        async def say(request: Request):
            body = await request.json()
            self.user_says(
                body["user_id"], body["text"], body.get("name", "Asha")
            )
            return {"ok": True}

        @self.app.get("/test/sent")
        async def sent():
            return self.sent


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        FakeTelegram().app,
        host="127.0.0.1",
        port=int(sys.argv[1]),
        log_level="warning",
    )
