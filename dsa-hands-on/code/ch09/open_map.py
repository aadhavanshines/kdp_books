"""A hash map with open addressing and linear probing.

All pairs live in one table. A key starts at slot hash(key) % size and,
if that slot is taken by another key, tries the next slot, and the next,
wrapping around. A deleted pair leaves a tombstone, so searches for keys
stored further along don't stop early. The table stays at most two
thirds full, counting tombstones, so there is always an empty slot.
"""

EMPTY = None
TOMBSTONE = object()  # marks a slot whose pair was deleted


class OpenMap:
    def __init__(self, size=8):
        self._slots = [EMPTY] * size  # each slot: EMPTY, TOMBSTONE or pair
        self._n = 0  # live pairs
        self._used = 0  # live pairs plus tombstones
        self.probes = 0  # slots examined, for experiments

    def __len__(self):
        return self._n

    def _find(self, key):
        """(slot index, found?) for key. If it isn't there, the index
        is where it should go: the first tombstone or empty slot seen."""
        size = len(self._slots)
        i = hash(key) % size
        free = None
        while True:
            self.probes += 1
            slot = self._slots[i]
            if slot is EMPTY:
                return (i if free is None else free), False
            if slot is TOMBSTONE:
                if free is None:
                    free = i
            elif slot[0] == key:
                return i, True
            i = (i + 1) % size  # linear probing: try the next slot

    def __getitem__(self, key):
        i, found = self._find(key)
        if not found:
            raise KeyError(key)
        return self._slots[i][1]

    def __setitem__(self, key, value):
        i, found = self._find(key)
        if found:
            self._slots[i] = (key, value)
            return
        if self._slots[i] is EMPTY:
            self._used += 1  # a tombstone reused doesn't add to the count
        self._slots[i] = (key, value)
        self._n += 1
        if self._used * 3 > len(self._slots) * 2:
            self._rehash()

    def __delitem__(self, key):
        i, found = self._find(key)
        if not found:
            raise KeyError(key)
        self._slots[i] = TOMBSTONE
        self._n -= 1

    def __contains__(self, key):
        return self._find(key)[1]

    def __iter__(self):
        for slot in self._slots:
            if slot is not EMPTY and slot is not TOMBSTONE:
                yield slot[0]

    def _rehash(self):
        """A fresh table for the live pairs, dropping the tombstones."""
        pairs = [
            s for s in self._slots if s is not EMPTY and s is not TOMBSTONE
        ]
        self._slots = [EMPTY] * max(8, 4 * len(pairs))
        self._n = self._used = 0
        for key, value in pairs:
            self[key] = value
