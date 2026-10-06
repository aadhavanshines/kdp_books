import json
import sys
from pathlib import Path
from types import SimpleNamespace

import anthropic
import httpx2 as httpx
import pytest

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from app import create_app  # noqa: E402


def reply(cards, stop_reason="end_turn", text=None):
    text = json.dumps({"flashcards": cards}) if text is None else text
    return SimpleNamespace(
        stop_reason=stop_reason,
        content=[SimpleNamespace(type="text", text=text)],
    )


class FakeClient:
    """Stands in for anthropic.Anthropic; records calls instead of hitting the API."""

    def __init__(self, response=None, error=None):
        self.calls = []
        self._response, self._error = response, error
        self.messages = SimpleNamespace(create=self._create)

    def _create(self, **kwargs):
        self.calls.append(kwargs)
        if self._error:
            raise self._error
        return self._response


CARDS = [{"question": f"Q{i}?", "answer": f"A{i}"} for i in range(6)]


def post(client, notes):
    return create_app(client).test_client().post("/api/flashcards", json={"notes": notes})


def test_index_page_renders():
    r = create_app(FakeClient()).test_client().get("/")
    assert r.status_code == 200
    assert b"Make flashcards" in r.data


def test_success_returns_cards_and_uses_json_schema():
    fake = FakeClient(reply(CARDS))
    r = post(fake, "Photosynthesis turns light into sugar.")
    assert r.status_code == 200
    assert r.get_json()["flashcards"] == CARDS
    call = fake.calls[0]
    assert call["output_config"]["format"]["type"] == "json_schema"
    assert "Photosynthesis" in call["messages"][0]["content"]


@pytest.mark.parametrize("notes", ["", "   \n ", None, 123])
def test_empty_notes_rejected_without_api_call(notes):
    fake = FakeClient(reply(CARDS))
    r = post(fake, notes)
    assert r.status_code == 400
    assert "paste some study notes" in r.get_json()["error"]
    assert fake.calls == []


def test_notes_over_limit_rejected_without_api_call():
    fake = FakeClient(reply(CARDS))
    r = post(fake, "x" * 20_001)
    assert r.status_code == 400
    assert "too long" in r.get_json()["error"]
    assert fake.calls == []


def test_notes_at_limit_accepted():
    assert post(FakeClient(reply(CARDS)), "x" * 20_000).status_code == 200


def test_missing_api_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)
    r = post(None, "some notes")
    assert r.status_code == 500
    assert "ANTHROPIC_API_KEY" in r.get_json()["error"]


def test_api_failure_gives_friendly_message():
    err = anthropic.APIConnectionError(request=httpx.Request("POST", "https://x"))
    r = post(FakeClient(error=err), "some notes")
    assert r.status_code == 502
    assert "try again" in r.get_json()["error"]


@pytest.mark.parametrize(
    "response",
    [
        reply(CARDS, stop_reason="refusal"),
        reply(CARDS, stop_reason="max_tokens"),
        reply(None, text="not json"),
        reply(None, text='{"wrong": 1}'),
        reply([]),
    ],
)
def test_bad_model_output_gives_friendly_message(response):
    r = post(FakeClient(response), "some notes")
    assert r.status_code == 502
    assert r.get_json()["error"]


def test_more_than_ten_cards_are_capped():
    many = [{"question": f"Q{i}", "answer": f"A{i}"} for i in range(15)]
    r = post(FakeClient(reply(many)), "some notes")
    assert len(r.get_json()["flashcards"]) == 10


def status_error(cls, code):
    req = httpx.Request("POST", "https://x")
    return cls("boom", response=httpx.Response(code, request=req), body=None)


def test_rejected_api_key_message():
    err = status_error(anthropic.AuthenticationError, 401)
    r = post(FakeClient(error=err), "some notes")
    assert r.status_code == 502
    msg = r.get_json()["error"]
    assert "rejected the API key" in msg and "ANTHROPIC_API_KEY" in msg


def test_rate_limit_message():
    err = status_error(anthropic.RateLimitError, 429)
    r = post(FakeClient(error=err), "some notes")
    assert r.status_code == 429
    assert "wait a minute" in r.get_json()["error"]


def test_other_api_errors_keep_general_message():
    err = status_error(anthropic.InternalServerError, 500)
    r = post(FakeClient(error=err), "some notes")
    assert r.status_code == 502
    msg = r.get_json()["error"]
    assert "try again" in msg and "API key" not in msg and "minute" not in msg


def test_per_ip_rate_limit_blocks_before_api_call():
    fake = FakeClient(reply(CARDS))
    c = create_app(fake, per_ip_limit=2).test_client()
    codes = [c.post("/api/flashcards", json={"notes": "n"}).status_code for _ in range(3)]
    assert codes == [200, 200, 429]
    assert len(fake.calls) == 2


def test_invalid_input_does_not_use_rate_limit_quota():
    c = create_app(FakeClient(reply(CARDS)), per_ip_limit=1).test_client()
    assert c.post("/api/flashcards", json={"notes": ""}).status_code == 400
    assert c.post("/api/flashcards", json={"notes": "n"}).status_code == 200


def test_oversized_request_rejected():
    r = create_app(FakeClient(reply(CARDS))).test_client().post(
        "/api/flashcards", json={"notes": "x" * 300_000}
    )
    assert r.status_code == 413


def test_non_object_json_body_is_handled():
    c = create_app(FakeClient(reply(CARDS))).test_client()
    assert c.post("/api/flashcards", json=["a"]).status_code == 400


def test_security_headers_present():
    r = create_app(FakeClient()).test_client().get("/")
    assert "script-src 'self'" in r.headers["Content-Security-Policy"]
    assert r.headers["X-Content-Type-Options"] == "nosniff"
