"""Exercise 6.3: add remove(value), which deletes the first item equal
to value and raises ValueError if there is none, like list.remove()."""

from dynamic_array import DynamicArray


class RemovableArray(DynamicArray):
    def remove(self, value):
        for i in range(self._n):
            if self._data[i] == value:
                self.pop(i)  # pop() shifts the later items left
                return
        raise ValueError(f"{value!r} is not in the array")


a = RemovableArray()
for x in [3, 1, 4, 1, 5]:
    a.append(x)
a.remove(1)
print(a)
try:
    a.remove(9)
except ValueError as error:
    print("ValueError:", error)
