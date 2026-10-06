import os
import threading
import time
from collections import defaultdict, deque

from flask import Flask, jsonify, render_template, request

from flashcards import FlashcardError, generate_flashcards, make_client, validate_notes

# 20,000 characters can be up to ~80 KB of JSON-escaped UTF-8; leave headroom.
MAX_REQUEST_BYTES = 200_000


class RateLimiter:
    """Sliding-window limiter: at most `limit` hits per `window` seconds per key."""

    def __init__(self, limit, window=60.0):
        self.limit, self.window = limit, window
        self.hits = defaultdict(deque)
        self.lock = threading.Lock()

    def allow(self, key):
        now = time.monotonic()
        with self.lock:
            q = self.hits[key]
            while q and now - q[0] > self.window:
                q.popleft()
            if len(q) >= self.limit:
                return False
            q.append(now)
            return True


def create_app(client=None, per_ip_limit=6, global_limit=30):
    """Create the app. Pass a client (e.g. a fake in tests) to skip the real one."""
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = MAX_REQUEST_BYTES
    per_ip = RateLimiter(per_ip_limit)
    overall = RateLimiter(global_limit)

    @app.after_request
    def security_headers(resp):
        resp.headers["Content-Security-Policy"] = (
            "default-src 'none'; script-src 'self'; style-src 'self'; "
            "connect-src 'self'; img-src 'self'; base-uri 'none'; "
            "form-action 'none'; frame-ancestors 'none'"
        )
        resp.headers["X-Content-Type-Options"] = "nosniff"
        resp.headers["X-Frame-Options"] = "DENY"
        resp.headers["Referrer-Policy"] = "no-referrer"
        return resp

    @app.errorhandler(413)
    def too_large(_):
        return jsonify(error="That request is too large. Please use shorter notes."), 413

    @app.get("/")
    def index():
        return render_template("index.html")

    @app.post("/api/flashcards")
    def flashcards():
        data = request.get_json(silent=True) or {}
        notes = data.get("notes") if isinstance(data, dict) else None
        try:
            notes = validate_notes(notes if isinstance(notes, str) else "")
            # Checked after validation so bad input doesn't use up the quota,
            # but before the (paid) API call. remote_addr only: X-Forwarded-For
            # is client-controlled and would let anyone dodge the limit.
            if not (per_ip.allow(request.remote_addr) and overall.allow("all")):
                resp = jsonify(
                    error="Too many requests. Please wait a minute and try again."
                )
                resp.status_code = 429
                resp.headers["Retry-After"] = "60"
                return resp
            cards = generate_flashcards(notes, client or make_client())
        except FlashcardError as e:
            return jsonify(error=str(e)), e.status
        return jsonify(flashcards=cards)

    return app


if __name__ == "__main__":
    # Local-only by default. To share on your home network, run:
    #   STUDY_BUDDY_HOST=0.0.0.0 python app.py
    # The Werkzeug debugger is never enabled: it allows remote code execution.
    create_app().run(
        host=os.environ.get("STUDY_BUDDY_HOST", "127.0.0.1"),
        port=int(os.environ.get("PORT", "5000")),
        debug=False,
    )
