"""Exercise 28.3: the fewest moves for a chess knight between two
squares of an 8 x 8 board: BFS on the implicit graph of knight moves."""

from collections import deque

MOVES = [
    (1, 2),
    (2, 1),
    (2, -1),
    (1, -2),
    (-1, -2),
    (-2, -1),
    (-2, 1),
    (-1, 2),
]


def knight_moves(start, goal):
    dist, queue = {start: 0}, deque([start])
    while queue:
        r, c = queue.popleft()
        if (r, c) == goal:
            return dist[r, c]
        for dr, dc in MOVES:
            n = (r + dr, c + dc)
            if 0 <= n[0] < 8 and 0 <= n[1] < 8 and n not in dist:
                dist[n] = dist[r, c] + 1
                queue.append(n)


print(knight_moves((0, 0), (7, 7)), knight_moves((0, 0), (1, 1)))
