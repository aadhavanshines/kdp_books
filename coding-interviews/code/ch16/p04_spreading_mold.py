"""16.4 Spreading Mold: each minute, mold (2) spreads to fresh bread (1)
next to it (up, down, left, right). How many minutes until no fresh bread
is left? -1 if some can never be reached."""

from collections import deque


def spreading_mold(tray):
    rows, cols = len(tray), len(tray[0])
    tray = [row[:] for row in tray]
    queue = deque()
    fresh = 0
    for r in range(rows):
        for c in range(cols):
            if tray[r][c] == 2:
                queue.append((r, c, 0))  # every moldy cell starts at once
            elif tray[r][c] == 1:
                fresh += 1
    minutes = 0
    while queue:
        r, c, t = queue.popleft()
        minutes = max(minutes, t)
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and tray[nr][nc] == 1:
                tray[nr][nc] = 2
                fresh -= 1
                queue.append((nr, nc, t + 1))
    return minutes if fresh == 0 else -1


def spreading_mold_simulate(tray):
    tray = [row[:] for row in tray]
    minutes = 0
    while True:
        spread = []
        for r, row in enumerate(tray):
            for c, v in enumerate(row):
                if v == 1 and any(
                    0 <= nr < len(tray)
                    and 0 <= nc < len(row)
                    and tray[nr][nc] == 2
                    for nr, nc in (
                        (r + 1, c),
                        (r - 1, c),
                        (r, c + 1),
                        (r, c - 1),
                    )
                ):
                    spread.append((r, c))
        if not spread:
            break
        for r, c in spread:
            tray[r][c] = 2
        minutes += 1
    if any(1 in row for row in tray):
        return -1
    return minutes


SOLUTIONS = [spreading_mold, spreading_mold_simulate]
EXAMPLES = [
    (([[1, 1, 0, 2], [0, 1, 1, 1], [0, 0, 0, 1]],), 5),
    (([[2, 1, 0], [0, 0, 1]],), -1),
    (([[0, 2]],), 0),
]


def random_case(rng):
    rows, cols = rng.randint(1, 5), rng.randint(1, 5)
    return (
        [
            [rng.choice([0, 1, 1, 2]) for _ in range(cols)]
            for _ in range(rows)
        ],
    )
