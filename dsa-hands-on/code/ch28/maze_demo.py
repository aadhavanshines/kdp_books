"""Find the shortest way through a maze and draw it."""

from grids import count_islands, shortest_route, word_ladder

maze = [
    "S..#......",
    ".#.#.####.",
    ".#...#....",
    ".####.#.#.",
    "......#.#G",
]
start, goal = (0, 0), (4, 9)
steps, path = shortest_route(maze, start, goal)
drawn = [list(row) for row in maze]
for r, c in path[1:-1]:
    drawn[r][c] = "*"
print(f"{steps} steps:")
for row in drawn:
    print("".join(row))

islands = ["##..#", "#...#", "..#..", "....#"]
print(count_islands(islands), "islands")
words = ["hot", "dot", "dog", "lot", "log", "cog"]
print(word_ladder("hit", "cog", words), "changes from hit to cog")
