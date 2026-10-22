"""Chapter 29: payments with idempotency keys and a double-entry ledger.

Every transfer writes two entries that sum to zero. A client that times
out retries with the same idempotency key and gets the original result
instead of paying twice.
"""


class Ledger:
    def __init__(self):
        self.entries = []  # (transfer_id, account, amount in cents)
        self.results = {}  # idempotency key -> result

    def balance(self, account):
        return sum(a for _, acct, a in self.entries if acct == account)

    def transfer(
        self, key, source, dest, cents, allow_overdraft=("world",)
    ):
        if key in self.results:
            return self.results[key]  # a retry: same answer, no new money
        if cents <= 0:
            result = "rejected: amount must be positive"
        elif source not in allow_overdraft and self.balance(source) < cents:
            result = "rejected: insufficient funds"
        else:
            tid = len(self.results) + 1
            self.entries += [(tid, source, -cents), (tid, dest, cents)]
            result = f"ok: transfer {tid}"
        self.results[key] = result
        return result


def run(requests):
    ledger = Ledger()
    out = [ledger.transfer(*r) for r in requests]
    return out, {a: ledger.balance(a) for a in ("ana", "shop")}


SOLUTIONS = [run]
EXAMPLES = [
    (
        (
            [
                ("k1", "world", "ana", 5000),  # top up 50.00
                ("k2", "ana", "shop", 3000),
                ("k2", "ana", "shop", 3000),  # client retry after a timeout
                ("k3", "ana", "shop", 3000),  # a genuinely new payment
            ],
        ),
        (
            [
                "ok: transfer 1",
                "ok: transfer 2",
                "ok: transfer 2",
                "rejected: insufficient funds",
            ],
            {"ana": 2000, "shop": 3000},
        ),
    )
]


def test():
    import random

    rng = random.Random(4)
    ledger = Ledger()
    keys = [f"k{i}" for i in range(300)]
    for _ in range(2000):
        k = rng.choice(keys)  # many retries of the same keys
        a, b = rng.sample(["world", "ana", "ben", "shop"], 2)
        ledger.transfer(k, a, b, rng.randint(1, 500))
    assert sum(a for _, _, a in ledger.entries) == 0  # money is conserved
    for acct in ("ana", "ben", "shop"):
        assert ledger.balance(acct) >= 0
    ids = [t for t, _, _ in ledger.entries]
    assert len(ids) == 2 * len(set(ids))  # exactly two entries per transfer
