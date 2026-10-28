"""Watch the capacity double as items are appended."""

from dynamic_array import DynamicArray

a = DynamicArray()
for i in range(17):
    before = a._capacity
    a.append(i)
    if a._capacity != before:
        print(
            f"append #{i + 1:>2}: capacity {before:>2} -> "
            f"{a._capacity:>2}, {a.copies:>2} items copied so far"
        )
