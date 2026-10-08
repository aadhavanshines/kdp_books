"""A web chat page for the support desk, plus a page for the owner.

Run:  uvicorn app:app --port 8000     then open http://localhost:8000
"""
import json
import sqlite3
import uuid

from claude_agent_sdk import (AssistantMessage, ClaudeSDKClient, ResultMessage, TextBlock,
                              ToolUseBlock)
from fastapi import FastAPI
from fastapi.responses import FileResponse
from pydantic import BaseModel

import store
from desk import AUDIT, HERE, Desk

app = FastAPI(title="Amudha's Home Bakes support")
chats = {}  # chat id -> connected ClaudeSDKClient (one per customer conversation)


class ChatIn(BaseModel):
    chat_id: str | None = None
    message: str


@app.get("/")
def page():
    return FileResponse(HERE / "static" / "index.html")


@app.get("/owner")
def owner_page():
    return FileResponse(HERE / "static" / "owner.html")


@app.post("/api/chat")
async def chat(body: ChatIn):
    chat_id = body.chat_id or uuid.uuid4().hex
    if chat_id not in chats:
        client = ClaudeSDKClient(options=Desk().options())
        await client.connect()
        chats[chat_id] = client
    client = chats[chat_id]
    await client.query(body.message[:2000])
    replies, actions, cost = [], [], 0.0
    async for message in client.receive_response():
        if isinstance(message, AssistantMessage):
            for block in message.content:
                if isinstance(block, TextBlock):
                    replies.append(block.text)
                elif isinstance(block, ToolUseBlock):
                    actions.append({"tool": block.name.split("__")[-1], "input": block.input})
        elif isinstance(message, ResultMessage):
            cost = message.total_cost_usd or 0
    return {"chat_id": chat_id, "reply": "\n\n".join(replies), "actions": actions,
            "cost_usd": round(cost, 4)}


@app.get("/api/owner")
def owner_data():
    db = sqlite3.connect(store.DB)
    db.row_factory = sqlite3.Row
    refunds = [dict(r) for r in db.execute("SELECT * FROM refunds ORDER BY id DESC")]
    tickets = [dict(r) for r in db.execute("SELECT * FROM tickets ORDER BY id DESC")]
    audit = [json.loads(line) for line in AUDIT.read_text().splitlines()[-20:]] \
        if AUDIT.exists() else []
    return {"refunds": refunds, "tickets": tickets, "audit": audit[::-1]}


@app.on_event("shutdown")
async def close_chats():
    for client in chats.values():
        await client.disconnect()
