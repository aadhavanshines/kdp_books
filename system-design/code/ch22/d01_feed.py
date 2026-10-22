"""Chapter 22: a hybrid news feed.

Posts from ordinary users are pushed into followers' feeds when written
(fan-out on write). Posts from accounts with more than `threshold`
followers are pulled when a feed is read (fan-out on read).
"""

import heapq


class FeedService:
    def __init__(self, follows, threshold):
        self.follows = follows  # user -> set of accounts they follow
        self.followers = {}
        for user, accounts in follows.items():
            for a in accounts:
                self.followers.setdefault(a, set()).add(user)
        self.big = {
            a for a, f in self.followers.items() if len(f) > threshold
        }
        self.inbox = {}  # user -> list of (time, author, post)
        self.posts = {}  # author -> list of (time, author, post)
        self.writes = 0  # inbox writes performed

    def publish(self, t, author, post):
        item = (t, author, post)
        self.posts.setdefault(author, []).append(item)
        if author not in self.big:
            for f in self.followers.get(author, ()):
                self.inbox.setdefault(f, []).append(item)
                self.writes += 1

    def feed(self, user, n=10):
        lists = [self.inbox.get(user, [])]
        lists += [
            self.posts.get(a, [])
            for a in self.follows.get(user, ())
            if a in self.big
        ]
        return heapq.nlargest(n, (x for lst in lists for x in lst))


def run(follows, threshold, posts, reader):
    svc = FeedService(follows, threshold)
    for t, author, text in posts:
        svc.publish(t, author, text)
    return svc.feed(reader)


def run_pull_all(follows, threshold, posts, reader):
    mine = [p for p in posts if p[1] in follows.get(reader, set())]
    return sorted(mine, reverse=True)[:10]


SOLUTIONS = [run, run_pull_all]
EXAMPLES = [
    (
        (
            {"ann": {"bob", "star"}, "cy": {"star"}, "dee": {"star"}},
            1,
            [
                (1, "bob", "hi"),
                (2, "star", "new song"),
                (3, "bob", "lunch"),
            ],
            "ann",
        ),
        [(3, "bob", "lunch"), (2, "star", "new song"), (1, "bob", "hi")],
    )
]


def random_case(rng):
    users = [f"u{i}" for i in range(8)]
    follows = {
        u: set(rng.sample(users, rng.randint(0, 5))) - {u} for u in users
    }
    posts = [
        (t, rng.choice(users), f"p{t}") for t in range(rng.randint(0, 30))
    ]
    return (follows, rng.randint(0, 6), posts, rng.choice(users))


def demo():
    import random

    rng = random.Random(1)
    users = [f"u{i}" for i in range(2000)]
    follows = {u: set(rng.sample(users, 20)) for u in users}
    for u in users:
        follows[u].add("celebrity")  # everyone follows one big account
    posts = [
        (t, "celebrity" if t % 10 == 0 else rng.choice(users), "x")
        for t in range(1000)
    ]
    for name, threshold in [("push to everyone", 10**9), ("hybrid", 500)]:
        svc = FeedService(follows, threshold)
        for p in posts:
            svc.publish(*p)
        print(f"{name:<17} {svc.writes:>7,} inbox writes for 1,000 posts")
