"""Chapter 16: the core of a link shortener.

Codes come from a counter encoded in base 62. The counter starts at
62**6 so every generated code has 7 characters. Custom aliases share
the same namespace, so they must be checked for conflicts.
"""

import string

ALPHABET = string.digits + string.ascii_lowercase + string.ascii_uppercase
START = 62**6  # the smallest 7-character code


def base62(n):
    out = []
    while n:
        n, r = divmod(n, 62)
        out.append(ALPHABET[r])
    return "".join(reversed(out)) or "0"


class Shortener:
    def __init__(self, clock):
        self.clock = clock
        self.next_id = START
        self.links = {}  # code -> (long_url, expires_at or None)

    def create(self, url, alias=None, ttl=None):
        if alias is not None:
            if alias in self.links:
                raise ValueError(f"alias {alias!r} is taken")
            code = alias
        else:
            code = base62(self.next_id)
            self.next_id += 1
            while code in self.links:  # a custom alias already took it
                code = base62(self.next_id)
                self.next_id += 1
        expires = self.clock() + ttl if ttl else None
        self.links[code] = (url, expires)
        return code

    def resolve(self, code):
        """The long URL for a redirect, or None (404) if unknown/expired."""
        item = self.links.get(code)
        if item is None:
            return None
        url, expires = item
        if expires is not None and self.clock() >= expires:
            return None
        return url


def demo():
    now = [0]
    s = Shortener(lambda: now[0])
    a = s.create("https://example.com/articles/2026/10/system-design")
    b = s.create("https://example.com/sale", alias="sale", ttl=3600)
    print(a, "->", s.resolve(a))
    print(b, "->", s.resolve(b))
    now[0] = 3600
    print(b, "after an hour ->", s.resolve(b))
    try:
        s.create("https://example.com/other", alias="sale")
    except ValueError as err:
        print("error:", err)


def test():
    now = [0]
    s = Shortener(lambda: now[0])
    codes = [s.create(f"https://example.com/{i}") for i in range(5000)]
    assert len(set(codes)) == 5000 and all(len(c) == 7 for c in codes)
    clash = base62(s.next_id)  # someone takes the next code as an alias
    s.create("https://example.com/x", alias=clash)
    assert s.create("https://example.com/y") != clash
    assert s.resolve("nope") is None
