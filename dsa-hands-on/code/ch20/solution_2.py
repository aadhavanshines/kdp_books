"""Exercise 20.2: the town judge. Everyone trusts the judge; the judge
trusts nobody. In a directed "trusts" graph that is the one vertex
with in-degree n - 1 and out-degree 0."""


def judge(n, trusts):
    score = [0] * (n + 1)  # in-degree minus out-degree
    for a, b in trusts:
        score[a] -= 1
        score[b] += 1
    for person in range(1, n + 1):
        if score[person] == n - 1:
            return person
    return -1


print(judge(3, [(1, 3), (2, 3)]))
print(judge(3, [(1, 3), (2, 3), (3, 1)]))
