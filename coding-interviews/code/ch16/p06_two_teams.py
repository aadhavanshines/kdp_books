"""16.6 Two Teams: can people 0..n-1 be split into two teams so that every
pair in `conflicts` ends up on different teams?"""

from itertools import product


def two_teams(n, conflicts):
    graph = [[] for _ in range(n)]
    for a, b in conflicts:
        graph[a].append(b)
        graph[b].append(a)
    team = [None] * n
    for person in range(n):
        if team[person] is not None:
            continue
        team[person] = 0
        stack = [person]
        while stack:
            p = stack.pop()
            for q in graph[p]:
                if team[q] is None:
                    team[q] = 1 - team[p]  # rivals go on the other team
                    stack.append(q)
                elif team[q] == team[p]:
                    return False
    return True


def two_teams_brute(n, conflicts):
    return any(
        all(t[a] != t[b] for a, b in conflicts)
        for t in product((0, 1), repeat=n)
    )


SOLUTIONS = [two_teams, two_teams_brute]
EXAMPLES = [
    ((4, [(0, 1), (1, 2), (2, 3), (3, 0)]), True),
    ((3, [(0, 1), (1, 2), (2, 0)]), False),
    ((1, []), True),
]


def random_case(rng):
    n = rng.randint(1, 8)
    edges = [
        (rng.randrange(n), rng.randrange(n))
        for _ in range(rng.randint(0, 8))
    ]
    return (n, [(a, b) for a, b in edges if a != b])
