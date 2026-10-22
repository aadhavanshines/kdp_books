"""Chapter 23: reliable message sync for a chat conversation.

The server gives each message the next sequence number in its
conversation. Clients remember the last number they have and, after
reconnecting, fetch everything after it. A client retries a send with
the same client message ID, so the server can drop duplicates.
"""

import random


class ChatServer:
    def __init__(self):
        self.log = []  # (seq, sender, client_msg_id, text)
        self.ids = set()

    def send(self, sender, client_msg_id, text):
        if client_msg_id in self.ids:  # a retry of a message we stored
            return
        self.ids.add(client_msg_id)
        self.log.append((len(self.log) + 1, sender, client_msg_id, text))

    def since(self, seq):
        return self.log[seq:]


class Client:
    def __init__(self, name):
        self.name, self.messages, self.last_seq = name, [], 0

    def sync(self, server):
        for m in server.since(self.last_seq):
            self.messages.append(m)
            self.last_seq = m[0]


def simulate(seed, steps=300):
    rng = random.Random(seed)
    server = ChatServer()
    clients = [Client(n) for n in ("ana", "ben", "cy")]
    online = {c.name: True for c in clients}
    counter = 0
    for _ in range(steps):
        c = rng.choice(clients)
        r = rng.random()
        if r < 0.1:
            online[c.name] = not online[c.name]  # disconnect or reconnect
        elif r < 0.6:
            counter += 1
            mid = f"{c.name}-{counter}"
            server.send(c.name, mid, f"text {counter}")
            if rng.random() < 0.3:
                server.send(
                    c.name, mid, f"text {counter}"
                )  # retry after lost ack
        if online[c.name]:
            c.sync(server)
    for c in clients:
        c.sync(server)  # everyone reconnects at the end
    return server, clients


def test():
    for seed in range(30):
        server, clients = simulate(seed)
        for c in clients:
            assert (
                c.messages == server.log
            )  # same order, no gaps, no duplicates
        texts = [m[3] for m in server.log]
        assert len(texts) == len(set(texts))
