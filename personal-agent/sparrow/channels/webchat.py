"""The web chat channel: a chat page in your browser, for the owner.

It listens on 127.0.0.1 only and needs a secret token, given once in the
address (http://127.0.0.1:8765/?token=...) and kept by the page."""

from __future__ import annotations

import asyncio
import secrets
from pathlib import Path

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse, PlainTextResponse

from ..gateway import Inbound

PAGE = (Path(__file__).parent / "webchat.html").read_text()


class WebChatChannel:
    name = "web"

    def __init__(self, token: str):
        if not token or len(token) < 16:
            raise ValueError("The web chat token must be 16+ characters")
        self.token = token
        self.sockets: set[WebSocket] = set()
        self.app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
        self.gateway = None  # set by run(), or by a test
        self.working: set[asyncio.Task] = set()
        self.routes()

    def allowed(self, token: str | None) -> bool:
        return token is not None and secrets.compare_digest(
            token.encode(), self.token.encode()
        )

    def routes(self) -> None:
        @self.app.get("/")
        async def page(token: str | None = None):
            if not self.allowed(token):
                return PlainTextResponse("Not allowed.", status_code=403)
            return HTMLResponse(PAGE)

        @self.app.websocket("/ws")
        async def chat(socket: WebSocket, token: str | None = None):
            # A browser always says which page opened the socket. Only
            # Sparrow's own page may, so a web page you happen to visit
            # can't talk to Sparrow, even if it guessed the address.
            origin = socket.headers.get("origin")
            same_site = (
                origin is None
                or origin
                == f"{socket.url.scheme.replace('ws', 'http')}://"
                f"{socket.headers.get('host')}"
            )
            if not (self.allowed(token) and same_site):
                await socket.close(code=1008)  # policy violation
                return
            await socket.accept()
            self.sockets.add(socket)
            try:
                while True:
                    try:
                        data = await socket.receive_json()
                    except ValueError:  # not JSON: ignore it
                        continue
                    if not isinstance(data, dict):
                        continue
                    text = str(data.get("text", ""))[:8000]
                    if text.strip():
                        await socket.send_json({"typing": True})
                        task = asyncio.create_task(
                            self.gateway.handle(
                                Inbound(
                                    "web", "owner", "Owner", "owner", text
                                )
                            )
                        )
                        self.working.add(task)
                        task.add_done_callback(self.working.discard)
            except WebSocketDisconnect:
                pass
            finally:
                self.sockets.discard(socket)

    async def send(self, chat_id: str, text: str) -> None:
        for socket in list(self.sockets):
            try:
                await socket.send_json({"from": "sparrow", "text": text})
            except Exception:
                self.sockets.discard(socket)

    async def run(self, gateway, host: str, port: int) -> None:
        import uvicorn

        self.gateway = gateway
        config = uvicorn.Config(
            self.app, host=host, port=port, log_level="warning"
        )
        await uvicorn.Server(config).serve()
