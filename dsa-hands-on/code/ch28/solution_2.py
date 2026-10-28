"""Exercise 28.2: the distance from every open cell to the nearest exit
"E", walls "#": one multi-source BFS from all exits at once."""

from collections import deque

from grids import neighbors

grid = ["E..#", "..#.", "....", "#..E"]
dist = {
    (r, c): 0
    for r, row in enumerate(grid)
    for c, x in enumerate(row)
    if x == "E"
}
queue = deque(dist)
while queue:
    cell = queue.popleft()
    for n in neighbors(grid, *cell):
        if grid[n[0]][n[1]] == "." and n not in dist:
            dist[n] = dist[cell] + 1
            queue.append(n)
for r, row in enumerate(grid):
    print(
        " ".join(
            row[c] if row[c] in "#E" else str(dist.get((r, c), "?"))
            for c in range(len(row))
        )
    )
