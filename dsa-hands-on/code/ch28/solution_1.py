"""Exercise 28.1: the area of the largest island."""

from grids import neighbors


def largest_island(grid):
    seen, best = set(), 0
    for r in range(len(grid)):
        for c in range(len(grid[0])):
            if grid[r][c] != "#" or (r, c) in seen:
                continue
            seen.add((r, c))
            stack, area = [(r, c)], 0
            while stack:
                cell = stack.pop()
                area += 1
                for n in neighbors(grid, *cell):
                    if grid[n[0]][n[1]] == "#" and n not in seen:
                        seen.add(n)
                        stack.append(n)
            best = max(best, area)
    return best


print(largest_island(["##..#", "#...#", "..###", "....#"]))
