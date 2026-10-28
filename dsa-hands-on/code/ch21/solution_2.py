"""Exercise 21.2: split people into two teams so no two who dislike
each other share a team, or report that it can't be done."""

from search import two_colors

dislikes = [("Ann", "Bob"), ("Bob", "Cal"), ("Cal", "Dee"), ("Dee", "Eva")]
graph = {}
for a, b in dislikes:
    graph.setdefault(a, []).append(b)
    graph.setdefault(b, []).append(a)
colors = two_colors(graph)
for team in (0, 1):
    print(
        f"team {team + 1}:",
        sorted(p for p, c in colors.items() if c == team),
    )
graph["Eva"].append("Ann")  # a five-person loop
graph["Ann"].append("Eva")
print(two_colors(graph))
