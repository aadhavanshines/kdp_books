"""Look inside: which bucket each key lands in."""

from chained_map import ChainedMap

m = ChainedMap(buckets=4)
for key in [10, 7, 14]:  # a fourth key would make it resize
    m[key] = f"value {key}"
    print(f"hash({key}) % 4 = {hash(key) % 4}")
for k, bucket in enumerate(m._buckets):
    print("bucket", k, bucket)
