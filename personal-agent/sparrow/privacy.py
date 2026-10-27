"""The privacy router: find sensitive data before a request leaves the
machine, and swap it for placeholders that are swapped back locally.

The model sees <EMAIL_1>; your files, reminders and replies get the real
address. Detection here is by pattern, so it finds structured data
(cards, emails, phone numbers, keys), not names or free-text secrets."""

from __future__ import annotations

import re

PATTERNS = [
    (
        "KEY",
        re.compile(
            r"\b(?:sk-[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}"
            r"|AKIA[0-9A-Z]{16}|xox[baprs]-[A-Za-z0-9-]{10,})"
        ),
    ),
    (
        "PASSWORD",
        re.compile(
            r"(?i)\b(?:password|passcode|pin)\s*(?:is|:|=)\s*"
            r"(\S+?)(?=[.,;]?(?:\s|$))"
        ),
    ),
    ("EMAIL", re.compile(r"\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b")),
    (
        "IBAN",
        re.compile(
            r"\b[A-Z]{2}\d{2}(?: ?[A-Z0-9]{4}){2,7}(?: ?[A-Z0-9]{1,3})?\b"
        ),
    ),
    ("CARD", re.compile(r"\b\d(?:[ -]?\d){12,18}\b")),
    ("SSN", re.compile(r"\b\d{3}-\d{2}-\d{4}\b")),
    (
        "PHONE",
        re.compile(
            r"(?<![\w-])\+?\(?\d{1,4}\)?(?:[ .-]?\(?\d{2,4}\)?){2,5}\b"
        ),
    ),
]


def plausible(kind: str, value: str) -> bool:
    """Second checks that cut false alarms from the patterns above."""
    digits = re.sub(r"\D", "", value)
    if kind == "CARD":
        return 13 <= len(digits) <= 19 and luhn_ok(digits)
    if kind == "PHONE":
        separated = value.startswith("+") or re.search(r"[ .()-]", value)
        is_date = re.match(r"\d{4}-\d{2}-\d{2}", value)
        return 10 <= len(digits) <= 15 and bool(separated) and not is_date
    return True


def luhn_ok(digits: str) -> bool:
    total, double = 0, False
    for d in reversed(digits):
        n = int(d) * 2 if double else int(d)
        total += n - 9 if n > 9 else n
        double = not double
    return total % 10 == 0


class PrivacyRouter:
    def __init__(self, mode: str = "redact"):
        if mode not in ("redact", "block", "off"):
            raise ValueError("privacy must be redact, block or off")
        self.mode = mode
        self.real: dict[str, str] = {}  # placeholder -> real value
        self.fake: dict[str, str] = {}  # real value -> placeholder

    def findings(self, text: str) -> list[tuple[str, str]]:
        found = []
        for kind, pattern in PATTERNS:
            for match in pattern.finditer(text):
                value = match.group(match.lastindex or 0)
                if plausible(kind, value):
                    found.append((kind, value))
        return found

    def redact(self, text: str) -> str:
        """Replace each sensitive value with a stable placeholder."""
        if self.mode == "off" or not text:
            return text
        for kind, value in self.findings(text):
            if value not in self.fake:
                count = sum(p.startswith(f"<{kind}_") for p in self.real)
                placeholder = f"<{kind}_{count + 1}>"
                self.fake[value] = placeholder
                self.real[placeholder] = value
            text = text.replace(value, self.fake[value])
        return text

    def restore(self, text: str) -> str:
        """Put the real values back (only ever done on this machine)."""
        for placeholder, value in self.real.items():
            text = text.replace(placeholder, value)
        return text

    def restore_args(self, args: dict) -> dict:
        return {
            k: self.restore(v) if isinstance(v, str) else v
            for k, v in args.items()
        }

    def blocked(self, text: str) -> list[str]:
        """In 'block' mode: the kinds of data that stop a request."""
        if self.mode != "block":
            return []
        return sorted({kind for kind, _ in self.findings(text)})
