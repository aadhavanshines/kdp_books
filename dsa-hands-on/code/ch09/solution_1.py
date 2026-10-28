"""Exercise 9.1: a Point class usable as a dict key. Equal points must
have equal hashes; hashing a tuple of the fields does it."""


class Point:
    __slots__ = ("x", "y")

    def __init__(self, x, y):
        self.x, self.y = x, y

    def __eq__(self, other):
        if not isinstance(other, Point):
            return NotImplemented
        return (self.x, self.y) == (other.x, other.y)

    def __hash__(self):
        return hash((self.x, self.y))

    def __repr__(self):
        return f"Point({self.x}, {self.y})"


names = {Point(0, 0): "origin", Point(3, 4): "P"}
print(names[Point(3, 4)])  # a different object, but equal: found
print(Point(1, 2) in {Point(1, 2)}, len({Point(1, 2), Point(1, 2)}))
