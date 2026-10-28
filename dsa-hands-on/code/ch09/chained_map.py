"""A hash map with separate chaining.

Each bucket is a small list of [key, value] pairs. A key's hash picks
its bucket; the bucket is searched with ==. When the average bucket
holds more than 0.75 pairs, the map doubles its buckets and rehashes.
"""


class ChainedMap:
    MAX_LOAD = 0.75

    def __init__(self, buckets=8):
        self._buckets = [[] for _ in range(buckets)]
        self._n = 0

    def __len__(self):
        return self._n

    def _bucket(self, key):
        return self._buckets[hash(key) % len(self._buckets)]

    def __getitem__(self, key):
        for pair in self._bucket(key):
            if pair[0] == key:
                return pair[1]
        raise KeyError(key)

    def __setitem__(self, key, value):
        bucket = self._bucket(key)
        for pair in bucket:
            if pair[0] == key:
                pair[1] = value  # an existing key: replace its value
                return
        bucket.append([key, value])
        self._n += 1
        if self._n > self.MAX_LOAD * len(self._buckets):
            self._rehash(2 * len(self._buckets))

    def __delitem__(self, key):
        bucket = self._bucket(key)
        for i, pair in enumerate(bucket):
            if pair[0] == key:
                bucket.pop(i)
                self._n -= 1
                return
        raise KeyError(key)

    def __contains__(self, key):
        return any(pair[0] == key for pair in self._bucket(key))

    def __iter__(self):
        for bucket in self._buckets:
            for key, _ in bucket:
                yield key

    def _rehash(self, size):
        """Move every pair into `size` new buckets."""
        pairs = [pair for bucket in self._buckets for pair in bucket]
        self._buckets = [[] for _ in range(size)]
        for key, value in pairs:
            self._bucket(key).append([key, value])
