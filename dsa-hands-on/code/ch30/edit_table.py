"""The full edit-distance table for kitten -> sitting. Each cell is the
distance between a prefix of one word and a prefix of the other."""

a, b = "kitten", "sitting"
table = [[0] * (len(b) + 1) for _ in range(len(a) + 1)]
for i in range(len(a) + 1):
    for j in range(len(b) + 1):
        if i == 0 or j == 0:
            table[i][j] = i + j
        elif a[i - 1] == b[j - 1]:
            table[i][j] = table[i - 1][j - 1]
        else:
            table[i][j] = 1 + min(
                table[i - 1][j - 1], table[i - 1][j], table[i][j - 1]
            )
print("      " + "  ".join(b))
for i, row in enumerate(table):
    label = a[i - 1] if i else " "
    print(f"{label}  " + "  ".join(map(str, row)))
