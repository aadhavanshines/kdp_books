"""Project 5: Study Buddy from Chapter 14. Claude's suite, the real SDK request shape, and the page."""
import json
import subprocess
import sys
import threading

import pytest
from conftest import PROJECTS

SRC = PROJECTS / "05-study-buddy"
CARDS = [{"question": f"Question {i}?", "answer": f"Answer {i}."} for i in range(1, 6)]


def test_claudes_own_suite():
    r = subprocess.run([sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", "tests"],
                       capture_output=True, text=True, cwd=SRC)
    assert r.returncode == 0, r.stdout


@pytest.fixture
def flashcards_module(monkeypatch):
    monkeypatch.syspath_prepend(str(SRC))
    for name in ("flashcards", "app"):
        sys.modules.pop(name, None)
    import flashcards
    return flashcards


def _sdk_client(handler):
    """A real anthropic client whose network layer is replaced by `handler`."""
    import anthropic
    import httpx2
    return anthropic.Anthropic(api_key="sk-test", max_retries=0,
                               http_client=httpx2.Client(transport=httpx2.MockTransport(handler)))


def test_real_sdk_request_shape(flashcards_module):
    import httpx2
    sent = {}

    def handler(request):
        sent["path"] = request.url.path
        sent["body"] = json.loads(request.content)
        return httpx2.Response(200, json={
            "id": "msg_1", "type": "message", "role": "assistant", "model": "claude-opus-5-5",
            "content": [{"type": "text", "text": json.dumps({"flashcards": CARDS})}],
            "stop_reason": "end_turn", "stop_sequence": None,
            "usage": {"input_tokens": 10, "output_tokens": 10}})

    cards = flashcards_module.generate_flashcards("Some notes.", _sdk_client(handler))
    assert cards == CARDS
    assert sent["path"] == "/v1/messages"
    fmt = sent["body"]["output_config"]["format"]
    assert fmt["type"] == "json_schema"
    assert fmt["schema"]["required"] == ["flashcards"]


@pytest.mark.parametrize("status,phrase", [(401, "rejected the API key"), (429, "wait a minute"),
                                          (500, "try again")])
def test_real_sdk_errors_become_friendly(flashcards_module, status, phrase):
    import httpx2
    kind = {401: "authentication_error", 429: "rate_limit_error", 500: "api_error"}[status]

    def handler(request):
        return httpx2.Response(status, json={"type": "error", "error": {"type": kind, "message": "x"}})

    with pytest.raises(flashcards_module.FlashcardError) as e:
        flashcards_module.generate_flashcards("Some notes.", _sdk_client(handler))
    assert phrase in str(e.value)
    assert "sk-test" not in str(e.value)


class FakeClient:
    """Stands in for anthropic.Anthropic so the page can be tested without an API key."""

    class _Messages:
        def create(self, **kwargs):
            class Block:
                type = "text"
                text = json.dumps({"flashcards": CARDS})

            class Resp:
                stop_reason = "end_turn"
                content = [Block()]
            return Resp()

    messages = _Messages()


@pytest.fixture
def server(flashcards_module):
    from werkzeug.serving import make_server
    import app as app_module
    srv = make_server("127.0.0.1", 0, app_module.create_app(client=FakeClient()))
    t = threading.Thread(target=srv.serve_forever, daemon=True)
    t.start()
    yield f"http://127.0.0.1:{srv.server_port}"
    srv.shutdown()


def test_page_flow(page, server):
    page.goto(server)
    page.click("#make")
    assert page.text_content("#message") == "Please paste some study notes first."
    page.fill("#notes", "Photosynthesis turns light energy into chemical energy.")
    page.click("#make")
    page.wait_for_selector("#card-view:not([hidden])")
    assert page.text_content("#counter") == "1 of 5"
    assert page.text_content("#card-text") == "Question 1?"
    assert page.is_disabled("#prev")
    page.click("#card")
    assert page.text_content("#card-text") == "Answer 1."
    page.click("#next")
    assert page.text_content("#counter") == "2 of 5"
    assert page.text_content("#card-text") == "Question 2?"  # a new card starts unflipped


def test_security_headers_and_rate_limit(server):
    import urllib.error
    import urllib.request
    r = urllib.request.urlopen(server)
    assert "default-src 'none'" in r.headers["Content-Security-Policy"]
    codes = []
    for _ in range(7):
        req = urllib.request.Request(server + "/api/flashcards", data=b'{"notes": "abc"}',
                                     headers={"Content-Type": "application/json"})
        try:
            codes.append(urllib.request.urlopen(req).status)
        except urllib.error.HTTPError as e:
            codes.append(e.code)
    assert codes == [200] * 6 + [429]


def test_debug_mode_is_off():
    source = (SRC / "app.py").read_text()
    assert "debug=True" not in source
