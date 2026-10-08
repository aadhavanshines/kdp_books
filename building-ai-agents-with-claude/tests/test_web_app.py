"""The support desk's web app: who may see what. No model calls are made."""
import sys

import pytest
from fastapi.testclient import TestClient

from conftest import PROJECTS


@pytest.fixture
def client(monkeypatch):
    sys.path.insert(0, str(PROJECTS / "06-support-desk"))
    for name in ("app", "desk", "store", "watch"):
        sys.modules.pop(name, None)
    import app
    yield TestClient(app.app)
    sys.path.remove(str(PROJECTS / "06-support-desk"))


def test_chat_page_is_public(client):
    assert client.get("/").status_code == 200


def test_owner_pages_are_off_without_a_password(client, monkeypatch):
    monkeypatch.delenv("OWNER_PASSWORD", raising=False)
    assert client.get("/owner", auth=("amudha", "anything")).status_code == 503


def test_owner_pages_need_the_right_password(client, monkeypatch):
    monkeypatch.setenv("OWNER_PASSWORD", "s3cret")
    assert client.get("/owner").status_code == 401
    assert client.get("/owner", auth=("amudha", "wrong")).status_code == 401
    assert client.get("/owner", auth=("amudha", "s3cret")).status_code == 200
    assert client.get("/api/owner", auth=("amudha", "s3cret")).status_code == 200


def test_messages_must_be_sensible_sizes(client):
    assert client.post("/api/chat", json={"message": ""}).status_code == 422
    assert client.post("/api/chat", json={"message": "x" * 2001}).status_code == 422
