"""11.6 Merge k Sorted Linked Lists."""

import heapq

from common.structures import ListNode, build_list, list_values


def merge_k(heads):
    heap = []
    for i, node in enumerate(heads):
        if node:
            heap.append((node.val, i, node))  # i breaks ties between nodes
    heapq.heapify(heap)
    dummy = tail = ListNode()
    while heap:
        _, i, node = heapq.heappop(heap)
        tail.next = tail = node
        if node.next:
            heapq.heappush(heap, (node.next.val, i, node.next))
    return dummy.next


def merge_k_main(lists):
    return list_values(merge_k([build_list(v) for v in lists]))


def merge_k_brute(lists):
    return sorted(v for lst in lists for v in lst)


SOLUTIONS = [merge_k_main, merge_k_brute]
EXAMPLES = [
    (([[1, 4, 5], [1, 3, 4], [2, 6]],), [1, 1, 2, 3, 4, 4, 5, 6]),
    (([],), []),
    (([[], [2]],), [2]),
]


def random_case(rng):
    return (
        [
            sorted(rng.randint(0, 9) for _ in range(rng.randint(0, 5)))
            for _ in range(rng.randint(0, 5))
        ],
    )
