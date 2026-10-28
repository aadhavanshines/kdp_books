"""Watch a list grow: its size in memory jumps, then stays put."""

import sys

items = []
last = sys.getsizeof(items)
print(f"empty list: {last} bytes")
for i in range(40):
    items.append(i)
    size = sys.getsizeof(items)
    if size != last:
        slots = (size - sys.getsizeof([])) // 8  # 8 bytes per reference
        print(f"length {len(items):>2}: {size:>3} bytes, room for {slots}")
        last = size
