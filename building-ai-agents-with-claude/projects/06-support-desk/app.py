"""A web chat page for the support desk, plus a page for the owner.

Run:  OWNER_PASSWORD=choose-one uvicorn app:app --port 8000
Then open http://localhost:8000 (customers) or /owner (Amudha).
"""

import json
import os
import secrets
import sqlite3
import uuid
from collections import OrderedDict
from contextlib import asynccontextmanager

from claude_agent_sdk import (
    AssistantMessage,
    ClaudeSDKClient,
    ResultMessage,
    TextBlock,
    ToolUseBlock,
)
from fastapi import Depends, FastAPI, HTTPException
from fastapi.responses import FileResponse
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from pydantic import BaseModel, Field

import store
from desk import AUDIT, HERE, Desk

MAX_OPEN_CHATS = 50  # each open chat keeps an agent running
chats = OrderedDict()  # chat id -> connected ClaudeSDKClient


@asynccontextmanager
async def lifespan(app):
    yield
    for client in chats.values():  # close every agent when the server stops
        await client.disconnect()


app = FastAPI(title="Amudha's Home Bakes support", lifespan=lifespan)
security = HTTPBasic()


def owner_only(credentials: HTTPBasicCredentials = Depends(security)):
    """The owner pages need the password in OWNER_PASSWORD."""
    expected = os.environ.get("OWNER_PASSWORD")
    if not expected:
        raise HTTPException(
            503, "Set OWNER_PASSWORD to use the owner pages."
        )
    if not secrets.compare_digest(credentials.password, expected):
        raise HTTPException(
            401, "Wrong password.", {"WWW-Authenticate": "Basic"}
        )


class ChatIn(BaseModel):
    chat_id: str | None = None
    message: str = Field(min_length=1, max_length=2000)


@app.get("/")
def page():
    return FileResponse(HERE / "static" / "index.html")


@app.get("/owner", dependencies=[Depends(owner_only)])
def owner_page():
    return FileResponse(HERE / "static" / "owner.html")


async def client_for(chat_id):
    """Find this chat's agent, or start one. If too many are open,
    close the oldest."""
    if chat_id in chats:
        chats.move_to_end(chat_id)
        return chats[chat_id]
    if len(chats) >= MAX_OPEN_CHATS:
        _, oldest = chats.popitem(last=False)
        await oldest.disconnect()
    client = ClaudeSDKClient(options=Desk().options())
    await client.connect()
    chats[chat_id] = client
    return client


@app.post("/api/chat")
async def chat(body: ChatIn):
    chat_id = body.chat_id or uuid.uuid4().hex
    client = await client_for(chat_id)
    await client.query(body.message)
    replies, actions, cost = [], [], 0.0
    async for message in client.receive_response():
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    replies.append(block.text)
                elif isinstance(block, ToolUseBlock):
                    name = block.name.split("__")[-1]
                    actions.append({"tool": name, "input": block.input})
        elif isinstance(message, ResultMessage):
            cost = message.total_cost_usd or 0
    return {
        "chat_id": chat_id,
        "reply": "\n\n".join(replies),
        "actions": actions,
        "cost_usd": round(cost, 4),
    }


@app.get("/api/owner", dependencies=[Depends(owner_only)])
def owner_data():
    db = sqlite3.connect(store.DB)
    db.row_factory = sqlite3.Row
    refunds = db.execute("SELECT * FROM refunds ORDER BY id DESC")
    tickets = db.execute("SELECT * FROM tickets ORDER BY id DESC")
    lines = AUDIT.read_text().splitlines()[-20:] if AUDIT.exists() else []
    return {
        "refunds": [dict(r) for r in refunds],
        "tickets": [dict(r) for r in tickets],
        "audit": [json.loads(line) for line in reversed(lines)],
    }
