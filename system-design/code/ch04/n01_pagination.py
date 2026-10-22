"""Chapter 4: offset pagination versus cursor pagination.

A client pages through a feed, newest first, 3 items per page, while new
items keep arriving at the top. Offset pages shift and repeat items;
cursor pages ("items older than the last one I saw") don't.
"""


def offset_pages(feed_versions, page_size=3):
    """feed_versions[i] is the feed (newest first) when page i is read."""
    seen = []
    for i, feed in enumerate(feed_versions):
        seen.extend(feed[i * page_size : (i + 1) * page_size])
    return seen


def cursor_pages(feed_versions, page_size=3):
    seen, cursor = [], None  # cursor: the ID of the last item seen
    for feed in feed_versions:
        older = [x for x in feed if cursor is None or x < cursor]
        page = older[:page_size]
        seen.extend(page)
        if page:
            cursor = page[-1]
    return seen


def demo():
    # Item IDs grow over time; 2 new items arrive between page loads.
    base = list(range(20, 0, -1))
    versions = [base, [22, 21] + base, [24, 23, 22, 21] + base]
    print("offset pages:", offset_pages(versions))
    print("cursor pages:", cursor_pages(versions))


def test():
    base = list(range(30, 0, -1))
    versions = [list(range(30 + 2 * i, 30, -1)) + base for i in range(5)]
    got = cursor_pages(versions)
    assert got == list(range(30, 15, -1))  # no repeats, no gaps
    off = offset_pages(versions)
    assert len(off) != len(set(off))  # offsets repeat items
