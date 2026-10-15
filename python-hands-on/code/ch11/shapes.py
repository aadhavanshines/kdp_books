"""A small module of geometry helpers."""
import math

UNIT = "cm"


def circle_area(radius):
    return math.pi * radius ** 2


def rectangle_area(width, height):
    return width * height


if __name__ == "__main__":
    # This part runs only when you run shapes.py itself, not when it's imported.
    print("Testing shapes.py")
    print(f"{circle_area(1):.4f}")
