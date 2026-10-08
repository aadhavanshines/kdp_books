"""ShopMate's ops dashboard: today's brief, run history, cost and eval
scores.

Run:  uvicorn ops:app --port 8000     then open http://localhost:8000
"""

import json

from fastapi import FastAPI
from fastapi.responses import FileResponse

from config import HERE, OUT, PROMPT_VERSION, today
from runlog import history

app = FastAPI(title="ShopMate ops")


@app.get("/")
def page():
    return FileResponse(HERE / "static" / "ops.html")


@app.get("/health")
def health():
    """For uptime monitors: fails if the last run failed or there's an
    alert."""
    runs = history(1)
    ok = (
        bool(runs)
        and runs[-1]["status"] == "ok"
        and not (OUT / "ALERT.txt").exists()
    )
    return {"ok": ok, "last_run": runs[-1] if runs else None}


@app.get("/api/state")
def state():
    brief = (
        json.loads((OUT / "brief.json").read_text())
        if (OUT / "brief.json").exists()
        else None
    )
    evals = {}
    for f in sorted((HERE / "evals" / "results").glob("*.json")):
        r = json.loads(f.read_text())
        evals[r["model"]] = {
            "passed": r["passed"],
            "total": r["total"],
            "cost_usd": r["cost_usd"],
        }
    alert = (
        (OUT / "ALERT.txt").read_text()
        if (OUT / "ALERT.txt").exists()
        else None
    )
    return {
        "today": today(),
        "prompt_version": PROMPT_VERSION,
        "brief": brief,
        "runs": history(30),
        "evals": evals,
        "alert": alert,
    }
