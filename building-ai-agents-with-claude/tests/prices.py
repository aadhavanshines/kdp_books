"""List prices in US dollars per million tokens (Claude API, October 2026), and a cost
calculator that works from token counts. Use it when the SDK's own estimate can't be
trusted, for example for a model released after your SDK version."""

PRICES = {  # input, output, cache write (1 hour), cache read
    "claude-haiku-5-5": (0.10, 0.50, 0.20, 0.01),
    "claude-haiku-4-5": (1.00, 5.00, 2.00, 0.10),
    "claude-sonnet-5-5": (2.00, 10.00, 4.00, 0.10),
    "claude-opus-5-5": (4.00, 20.00, 8.00, 0.20),
}


def cost_from_usage(model_usage):
    """model_usage is ResultMessage.model_usage: {model: {inputTokens, outputTokens, ...}}."""
    total = 0.0
    for model, u in model_usage.items():
        key = next(k for k in PRICES if model.startswith(k))
        p_in, p_out, p_write, p_read = PRICES[key]
        total += (u.get("inputTokens", 0) * p_in + u.get("outputTokens", 0) * p_out
                  + u.get("cacheCreationInputTokens", 0) * p_write
                  + u.get("cacheReadInputTokens", 0) * p_read) / 1_000_000
    return round(total, 4)


def add_usage(total, model_usage):
    """Add one result's per-model token counts into a running total."""
    for model, u in (model_usage or {}).items():
        t = total.setdefault(model, {})
        for k in ("inputTokens", "outputTokens", "cacheCreationInputTokens", "cacheReadInputTokens"):
            t[k] = t.get(k, 0) + u.get(k, 0)
    return total
