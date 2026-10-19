"""Sets and dictionaries: O(1) average membership and lookup."""


def demo():
    seen = {3, 1}
    seen.add(2)
    print(2 in seen, sorted(seen))
    print({1, 2, 3} & {2, 3, 4}, {1, 2} | {5}, {1, 2, 3} - {2})

    stock = {"apples": 3}
    stock["pears"] = stock.get("pears", 0) + 5
    print(stock, stock.setdefault("plums", 0), stock)
    for name, qty in sorted(stock.items()):
        print(name, qty)
