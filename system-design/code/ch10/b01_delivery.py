"""Chapter 10: at-least-once delivery, and why consumers must be idempotent.

A producer sends payments through a queue. Acknowledgements are lost at
random, so the queue redelivers some messages. One consumer applies
every delivery; the other remembers message IDs and skips repeats.
"""

import random


def run(messages, idempotent, ack_loss=0.2, seed=5):
    rng = random.Random(seed)
    queue = [(f"m{i}", amount) for i, amount in enumerate(messages)]
    balance, seen, deliveries = 0, set(), 0
    while queue:
        msg_id, amount = queue.pop(0)
        deliveries += 1
        if not (idempotent and msg_id in seen):
            balance += amount  # the side effect
            seen.add(msg_id)
        if rng.random() < ack_loss:  # ack lost: the broker redelivers
            queue.append((msg_id, amount))
    return balance, deliveries


def exact_total(messages):
    return sum(messages)


def idempotent_total(messages):
    return run(messages, idempotent=True)[0]


SOLUTIONS = [idempotent_total, exact_total]
EXAMPLES = [(([10, 20, 30],), 60)]


def random_case(rng):
    return ([rng.randint(1, 50) for _ in range(rng.randint(0, 30))],)


def demo():
    payments = [25] * 1000
    for flag in (False, True):
        total, sent = run(payments, idempotent=flag)
        name = "idempotent consumer" if flag else "naive consumer     "
        print(f"{name}: {sent} deliveries, total {total} (expected 25000)")
