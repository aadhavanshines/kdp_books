"""20.3 Board Words: which of the given words can be traced on a letter
grid (moving up/down/left/right, no cell twice in a word)? Return them
sorted."""


def board_words(board, words):
    trie = {}
    for w in words:
        node = trie
        for ch in w:
            node = node.setdefault(ch, {})
        node["$"] = w
    rows, cols = len(board), len(board[0])
    found = set()

    def explore(r, c, node):
        ch = board[r][c]
        if ch not in node:
            return
        node = node[ch]
        if "$" in node:
            found.add(node["$"])
        board[r][c] = "#"  # in use
        for nr, nc in ((r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)):
            if 0 <= nr < rows and 0 <= nc < cols and board[nr][nc] != "#":
                explore(nr, nc, node)
        board[r][c] = ch

    for r in range(rows):
        for c in range(cols):
            explore(r, c, trie)
    return sorted(found)


def board_words_brute(board, words):
    import importlib.util
    from pathlib import Path

    path = Path(__file__).resolve().parent.parent / "ch15/p04_grid_word.py"
    spec = importlib.util.spec_from_file_location("gw", path)
    gw = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(gw)
    return sorted({w for w in words if w and gw.grid_word(board, w)})


SOLUTIONS = [board_words, board_words_brute]
EXAMPLES = [
    (
        (
            [list("cart"), list("aoen"), list("tpis")],
            ["cat", "cap", "pie", "rent", "spin"],
        ),
        ["cat", "pie", "rent"],
    ),
]


def random_case(rng):
    rows, cols = rng.randint(1, 3), rng.randint(1, 4)
    board = [[rng.choice("abc") for _ in range(cols)] for _ in range(rows)]
    words = [
        "".join(rng.choice("abc") for _ in range(rng.randint(1, 4)))
        for _ in range(rng.randint(1, 6))
    ]
    return (board, words)
