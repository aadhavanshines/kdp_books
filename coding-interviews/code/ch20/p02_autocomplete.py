"""20.2 Autocomplete: after each typed character, suggest up to three
product names that start with what has been typed so far, in
alphabetical order."""

from bisect import bisect_left


def autocomplete(products, typed):
    products = sorted(products)
    out = []
    prefix = ""
    for ch in typed:
        prefix += ch
        i = bisect_left(products, prefix)  # first name >= prefix
        out.append([p for p in products[i : i + 3] if p.startswith(prefix)])
    return out


def autocomplete_brute(products, typed):
    return [
        sorted(p for p in products if p.startswith(typed[: i + 1]))[:3]
        for i in range(len(typed))
    ]


SOLUTIONS = [autocomplete, autocomplete_brute]
EXAMPLES = [
    (
        (["mobile", "mouse", "moneypot", "monitor", "mousepad"], "mou"),
        [
            ["mobile", "moneypot", "monitor"],
            ["mobile", "moneypot", "monitor"],
            ["mouse", "mousepad"],
        ],
    ),
    ((["a"], "b"), [[]]),
]


def random_case(rng):
    def w():
        return "".join(rng.choice("ab") for _ in range(rng.randint(1, 4)))

    return ([w() for _ in range(rng.randint(0, 8))], w())
