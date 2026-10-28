"""Exercise 21.1: does an undirected graph have a cycle? In a DFS, a
visited neighbor that isn't the vertex we came from closes a loop."""


def has_cycle(graph):
    seen = set()
    for start in graph:
        if start in seen:
            continue
        stack = [(start, None)]
        while stack:
            v, came_from = stack.pop()
            if v in seen:
                return True
            seen.add(v)
            for w in graph[v]:
                if w != came_from:
                    stack.append((w, v))
    return False


path = {1: [2], 2: [1, 3], 3: [2]}
loop = {1: [2, 3], 2: [1, 3], 3: [2, 1]}
print(has_cycle(path), has_cycle(loop))
