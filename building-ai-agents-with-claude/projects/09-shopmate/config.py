"""Settings for ShopMate, read from environment variables so the same code
runs on a laptop, in Docker and in GitHub Actions. Nothing secret is stored
in the code.
"""

import os
from pathlib import Path

HERE = Path(__file__).parent
DATA = Path(os.environ.get("SHOPMATE_DATA", HERE / "data"))
OUT = Path(os.environ.get("SHOPMATE_OUT", HERE / "out"))
MODEL = os.environ.get("SHOPMATE_MODEL", "claude-sonnet-5-5")
FALLBACK_MODEL = os.environ.get(
    "SHOPMATE_FALLBACK_MODEL", "claude-haiku-4-5"
)
BUDGET_USD = float(os.environ.get("SHOPMATE_BUDGET_USD", "0.75"))  # per run
PROMPT_VERSION = "brief-v4"  # change this whenever you change the prompt


def today():
    """The demo uses a fixed date from data/today.txt; real use takes the
    real date."""
    fixed = DATA / "today.txt"
    if fixed.exists():
        return fixed.read_text().strip()
    from datetime import date

    return date.today().isoformat()
