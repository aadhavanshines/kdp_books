"""Exercise 9.3: why tombstones? Delete by emptying the slot instead,
and a key stored past it can no longer be found."""

from open_map import EMPTY, OpenMap


class BrokenOpenMap(OpenMap):
    def __delitem__(self, key):
        i, found = self._find(key)
        if not found:
            raise KeyError(key)
        self._slots[i] = EMPTY  # wrong: breaks the chain of probes
        self._n -= 1


for make in (OpenMap, BrokenOpenMap):
    m = make()
    for k in [0, 8, 16]:  # all start at slot 0: stored in slots 0, 1, 2
        m[k] = "here"
    del m[8]
    print(f"{make.__name__}: 16 in map? {16 in m}")
