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


def merged_k_values(lists):
    return list_values(merge_k([build_list(v) for v in lists]))


def merge_k_brute(lists):
    return sorted(v for lst in lists for v in lst)


SOLUTIONS = [merged_k_values, merge_k_brute]
EXAMPLES = [
    (([[2, 7, 9], [1, 8], [3, 4, 10]],), [1, 2, 3, 4, 7, 8, 9, 10]),
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
