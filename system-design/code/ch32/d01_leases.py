"""Chapter 32: a job scheduler that survives worker crashes.

A worker leases a job for `lease` seconds and renews it with heartbeats.
If a worker dies, its lease expires and another worker picks the job
up, so every job finishes at least once. A fencing token (the lease
number) stops a slow old worker from overwriting newer results.
"""

import random


class Scheduler:
    def __init__(self, jobs, lease):
        self.lease = lease
        self.jobs = {
            j: {"state": "ready", "owner": None, "until": 0, "token": 0}
            for j in jobs
        }
        self.results = {}

    def acquire(self, worker, now):
        for job, info in self.jobs.items():
            expired = info["state"] == "running" and now >= info["until"]
            if info["state"] == "ready" or expired:
                info.update(
                    state="running", owner=worker, until=now + self.lease
                )
                info["token"] += 1
                return job, info["token"]
        return None

    def heartbeat(self, job, token, now):
        info = self.jobs[job]
        if (
            info["token"] == token
            and info["state"] == "running"
            and now < info["until"]
        ):
            info["until"] = now + self.lease
            return True
        return False

    def complete(self, job, token, result):
        info = self.jobs[job]
        if info["token"] != token:
            return False  # a newer lease exists: reject the stale write
        info["state"] = "done"
        self.results[job] = result
        return True


def simulate(seed, jobs=20, workers=4, lease=10):
    rng = random.Random(seed)
    sched = Scheduler(range(jobs), lease)
    held = {}  # worker -> (job, token, work left)
    now = 0
    while len(sched.results) < jobs and now < 10_000:
        now += 1
        for w in range(workers):
            if w in held:
                job, token, left = held[w]
                r = rng.random()
                if r < 0.02:
                    del held[w]  # the worker crashed
                elif r < 0.1:
                    pass  # a long GC pause: no heartbeat this tick
                elif left <= 1:
                    sched.complete(job, token, f"done by {w}")
                    del held[w]
                else:
                    if sched.heartbeat(job, token, now):
                        held[w] = (job, token, left - 1)
                    else:
                        del held[w]  # lost the lease: stop working
            else:
                got = sched.acquire(w, now)
                if got:
                    held[w] = (*got, rng.randint(3, 25))
    return sched


def test():
    for seed in range(40):
        s = simulate(seed)
        assert len(s.results) == 20  # every job finished
        assert all(info["state"] == "done" for info in s.jobs.values())
