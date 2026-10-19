"""23.6 Config Diff: compare two nested configuration dictionaries and list
the changes as (dotted.path, kind, old, new), sorted by path, where kind
is "added", "removed" or "changed"."""


def config_diff(old, new, prefix=""):
    changes = []
    for key in sorted(set(old) | set(new)):
        path = f"{prefix}{key}"
        if key not in new:
            changes.append((path, "removed", old[key], None))
        elif key not in old:
            changes.append((path, "added", None, new[key]))
        elif isinstance(old[key], dict) and isinstance(new[key], dict):
            changes.extend(config_diff(old[key], new[key], path + "."))
        elif old[key] != new[key]:
            changes.append((path, "changed", old[key], new[key]))
    return changes


def apply_changes(old, changes):
    """Apply a diff to a copy of old; used to check config_diff."""
    import copy

    result = copy.deepcopy(old)
    for path, kind, _, new_value in changes:
        *parents, last = path.split(".")
        node = result
        for p in parents:
            node = node[p]
        if kind == "removed":
            del node[last]
        else:
            node[last] = new_value
    return result


SOLUTIONS = [config_diff]
OLD = {"db": {"host": "a.example", "port": 5432}, "debug": True}
NEW = {"db": {"host": "b.example", "port": 5432, "pool": 10}}
EXAMPLES = [
    (
        (OLD, NEW),
        [
            ("db.host", "changed", "a.example", "b.example"),
            ("db.pool", "added", None, 10),
            ("debug", "removed", True, None),
        ],
    ),
    (({}, {}), []),
]


def random_case(rng):
    def make(depth):
        return {
            k: (
                make(depth - 1)
                if depth and rng.random() < 0.3
                else rng.randint(0, 2)
            )
            for k in rng.sample("abcd", rng.randint(1, 3))
        }

    return (make(2), make(2))


def CHECK(args, result):
    old, new = args
    paths = [c[0] for c in result]
    return paths == sorted(paths) and apply_changes(old, result) == new
