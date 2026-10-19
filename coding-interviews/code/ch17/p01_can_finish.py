"""17.1 Can I Graduate? Courses 0..n-1; (a, b) means b must be taken
before a. Can every course be completed?"""

from collections import deque


def can_finish(n, prereqs):
    after = [[] for _ in range(n)]
    waiting_on = [0] * n  # unmet prerequisites per course
    for course, before in prereqs:
        after[before].append(course)
        waiting_on[course] += 1
    ready = deque(c for c in range(n) if waiting_on[c] == 0)
    taken = 0
    while ready:
        c = ready.popleft()
        taken += 1
        for nxt in after[c]:
            waiting_on[nxt] -= 1
            if waiting_on[nxt] == 0:
                ready.append(nxt)
    return taken == n  # anything left is stuck in a cycle


def can_finish_dfs(n, prereqs):
    graph = [[] for _ in range(n)]
    for course, before in prereqs:
        graph[before].append(course)
    state = [0] * n  # 0 unvisited, 1 on the current path, 2 done

    def has_cycle(c):
        if state[c] == 1:
            return True
        if state[c] == 2:
            return False
        state[c] = 1
        if any(has_cycle(nxt) for nxt in graph[c]):
            return True
        state[c] = 2
        return False

    return not any(has_cycle(c) for c in range(n))


SOLUTIONS = [can_finish, can_finish_dfs]
EXAMPLES = [
    ((2, [(1, 0)]), True),
    ((2, [(1, 0), (0, 1)]), False),
    ((3, []), True),
]


def random_case(rng):
    n = rng.randint(1, 7)
    return (
        n,
        [
            (rng.randrange(n), rng.randrange(n))
            for _ in range(rng.randint(0, 8))
        ],
    )
