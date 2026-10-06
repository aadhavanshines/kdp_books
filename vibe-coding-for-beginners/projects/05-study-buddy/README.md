# Study Buddy

Paste your study notes, click **Make flashcards**, and Claude turns them into 5–10
question/answer cards. Click a card to flip it; use Previous/Next to move through the deck.

## Setup

```bash
python3 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
export ANTHROPIC_API_KEY="your-key-here"   # never put the key in code
python app.py
```

Open http://127.0.0.1:5000.

### Sharing on your home network

By default the app only listens on your own computer. To let classmates on the same
Wi-Fi use it:

```bash
STUDY_BUDDY_HOST=0.0.0.0 python app.py
```

Then they open `http://<your-computer's-LAN-IP>:5000`. Remember that every flashcard
request is paid for by your API key. The app limits each device to 6 requests/minute
(30/minute overall), but only share with people you trust, and stop the app when done.
It uses Flask's development server over plain HTTP, so don't expose it to the internet
(no port forwarding). Never run it with `flask run --debug` or `debug=True` when it is
reachable by others.

Optional: set `STUDY_BUDDY_MODEL` to use a different Claude model (default `claude-opus-5-5`).

## Tests

```bash
python -m pytest
```

Tests use a fake client, so they make no API calls and need no API key.

## How it works

- `flashcards.py` calls the Anthropic SDK with a JSON schema (`output_config.format`), so
  Claude's reply is guaranteed-shape JSON that is parsed with `json.loads`, not scraped from text.
- Friendly errors are shown for empty notes, notes over 20,000 characters, a missing
  `ANTHROPIC_API_KEY`, and failed or unusable API responses.
- `app.py` is the Flask app (`create_app(client=None)` lets tests inject a fake client).
