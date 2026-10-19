"""22.6 Flatten Iterator: iterate over the integers of an arbitrarily
nested list, e.g. [1, [2, [3, []]], 4] gives 1, 2, 3, 4, lazily."""


class Flattener:
    def __init__(self, nested):
        self.stack = [iter(nested)]  # one iterator per open list

    def __iter__(self):
        return self

    def __next__(self):
        while self.stack:
            try:
                item = next(self.stack[-1])
            except StopIteration:
                self.stack.pop()  # this list is finished
                continue
            if isinstance(item, list):
                self.stack.append(iter(item))
            else:
                return item
        raise StopIteration


def flatten_gen(nested):
    for item in nested:
        if isinstance(item, list):
            yield from flatten_gen(item)
        else:
            yield item


def flatten_main(nested):
    return list(Flattener(nested))


def flatten_recursive(nested):
    return list(flatten_gen(nested))


SOLUTIONS = [flatten_main, flatten_recursive]
EXAMPLES = [(([1, [2, [3, []]], 4],), [1, 2, 3, 4]), (([[], [[]]],), [])]


def random_case(rng):
    def make(depth):
        out = []
        for _ in range(rng.randint(0, 3)):
            if depth and rng.random() < 0.4:
                out.append(make(depth - 1))
            else:
                out.append(rng.randint(0, 9))
        return out

    return (make(4),)


def test():
    deep = [1]
    for _ in range(5000):  # deeper than Python's recursion limit
        deep = [deep]
    assert list(Flattener(deep)) == [1]
