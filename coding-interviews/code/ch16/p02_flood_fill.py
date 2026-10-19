"""16.2 Paint Bucket: recolor the region of same-colored cells that
contains (r, c), like a paint program's fill tool."""


def flood_fill(image, r, c, color):
    image = [row[:] for row in image]
    old = image[r][c]
    if old == color:
        return image
    stack = [(r, c)]
    while stack:
        r, c = stack.pop()
        if (
            0 <= r < len(image)
            and 0 <= c < len(image[0])
            and image[r][c] == old
        ):
            image[r][c] = color
            stack.extend([(r + 1, c), (r - 1, c), (r, c + 1), (r, c - 1)])
    return image


def flood_fill_recursive(image, r, c, color):
    image = [row[:] for row in image]
    old = image[r][c]

    def paint(r, c):
        if (
            0 <= r < len(image)
            and 0 <= c < len(image[0])
            and image[r][c] == old
        ):
            image[r][c] = color
            for dr, dc in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                paint(r + dr, c + dc)

    if old != color:
        paint(r, c)
    return image


SOLUTIONS = [flood_fill, flood_fill_recursive]
EXAMPLES = [
    (
        ([[1, 1, 1], [1, 1, 0], [1, 0, 1]], 1, 1, 2),
        [[2, 2, 2], [2, 2, 0], [2, 0, 1]],
    ),
    (([[0, 0]], 0, 0, 0), [[0, 0]]),
]


def random_case(rng):
    rows, cols = rng.randint(1, 5), rng.randint(1, 5)
    img = [[rng.randint(0, 2) for _ in range(cols)] for _ in range(rows)]
    return (
        img,
        rng.randrange(rows),
        rng.randrange(cols),
        rng.randint(0, 2),
    )
