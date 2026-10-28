"""Exercise 6.2: why shrink at a quarter full, not at half full?
Count the copies when a program appends and pops at the boundary."""


def copies(shrink_at, steps=1000):
    """Start full at 8 slots, then alternate append and pop."""
    n, capacity, total = 8, 8, 0
    for step in range(steps):
        if step % 2 == 0:  # append
            if n == capacity:
                total += n
                capacity *= 2
            n += 1
        else:  # pop
            n -= 1
            if n <= capacity * shrink_at:
                total += n
                capacity //= 2
    return total


print("shrink at half full:   ", copies(0.5), "copies")
print("shrink at quarter full:", copies(0.25), "copies")
