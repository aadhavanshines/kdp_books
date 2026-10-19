# Chapter 11: Linked Lists

A linked list stores items in nodes, each holding a value and a reference to the next node. Unlike a Python list, it can't jump to the 50th item; you must follow the links one by one. Interviewers like linked lists because they test careful pointer manipulation: the code is short, but one link changed in the wrong order loses the rest of the list.

## The Building Blocks

The problems in this chapter use a minimal node class, and two helpers that build a linked list from a Python list and read it back:

```python
@include code/common/structures.py::ListNode,build_list,list_values
```

Each example calls a small wrapper, such as `reversed_values`, which builds a linked list from the Python list you see, runs the solution, and returns the resulting values as a list.

## When to Use the Techniques

- **A dummy head node** removes special cases when the head itself might change (Problems 11.3 and 11.4).
- **Two pointers at different speeds** ("slow and fast") find the middle or detect a cycle in one pass, with O(1) memory (Problems 11.2 and 11.5).
- **Two pointers with a gap** find the k-th node from the end in one pass (Problem 11.4).
- **Reversing in place** is a building block for many harder problems (Problems 11.1 and 11.5).

> **Tip:** Draw the nodes and arrows. Before changing any `next` pointer, ask: "Do I still have a way to reach the node it used to point to?"

## 11.1 Reverse a Linked List (Easy)

Reverse a linked list and return its new head.

```
@include code/ch11/p01_reverse_list.examples.txt
```

**The idea.** Walk the list, turning each node's `next` pointer around to point at the previous node. Save the next node first, or you lose the rest of the list.

```python
@include code/ch11/p01_reverse_list.py::reverse_list
```

**Complexity:** O(n) time, O(1) space.

A recursive version is elegant but uses O(n) stack space, and fails for lists longer than Python's recursion limit:

```python
@include code/ch11/p01_reverse_list.py::reverse_list_recursive
```

## 11.2 Detect a Loop (Easy)

Does following `next` pointers from the head ever reach the same node twice?

```
@include code/ch11/p02_detect_loop.examples.txt
```

In the examples, the second argument is the position the last node links back to, or -1 for no loop.

**The easy idea.** Store each node in a set; a repeat means a loop. O(n) space.

**The better idea.** Floyd's "tortoise and hare": move one pointer one step at a time and another two steps. If there is a loop, the fast pointer eventually laps the slow one and they meet; if not, the fast pointer reaches the end.

```python
@include code/ch11/p02_detect_loop.py::has_loop
```

**Complexity:** O(n) time, O(1) space.

> **Follow-Up:** "Where does the loop start?" After the pointers meet, move one pointer back to the head and advance both one step at a time; they meet at the start of the loop.

## 11.3 Merge Two Sorted Linked Lists (Easy)

Merge two sorted linked lists into one sorted list by relinking the existing nodes.

```
@include code/ch11/p03_merge_lists.examples.txt
```

**The idea.** A dummy node in front of the result means you never need a special case for the first node. Repeatedly attach the smaller current node; when one list ends, attach the rest of the other.

```python
@include code/ch11/p03_merge_lists.py::merge_lists
```

**Complexity:** O(m + n) time, O(1) extra space.

## 11.4 Remove the k-th Node From the End (Medium)

Remove the k-th node from the end of a list (k = 1 is the last node) in a single pass.

```
@include code/ch11/p04_remove_kth_from_end.examples.txt
```

**The idea.** Start two pointers at a dummy node and move one of them k steps ahead. Then move both until the leading one reaches the last node: the trailing one is now just before the node to remove. The dummy node handles removing the head.

```python
@include code/ch11/p04_remove_kth_from_end.py::remove_from_end
```

**Complexity:** O(n) time, O(1) space.

## 11.5 Interleave a List (Medium)

Reorder a list L0, L1, ..., Ln into L0, Ln, L1, Ln-1, L2, ... by relinking nodes, in O(1) extra space.

```
@include code/ch11/p05_interleave.examples.txt
```

**Think first:** The new order alternates between the front half and the *reversed* back half.

**The idea.** Three steps you already know: find the middle with slow and fast pointers; reverse the second half; then weave the two halves together.

```python
@include code/ch11/p05_interleave.py::interleave
```

**Complexity:** O(n) time, O(1) space.

> **Interviewer's View:** Saying "this is three problems I know: middle, reverse, merge" before coding is a strong signal. It shows you decompose problems instead of improvising pointer moves.

## 11.6 Merge k Sorted Linked Lists (Hard)

Merge k sorted linked lists into one sorted list.

```
@include code/ch11/p06_merge_k_lists.examples.txt
```

**Brute force.** Collect all values, sort them and build a new list: O(N log N) for N nodes. Merging the lists one by one is O(N × k).

**The better idea.** Keep a min-heap of the current head of each list. Repeatedly pop the smallest node, attach it, and push its successor. The heap never holds more than k nodes. A position `i` is stored as a tie-breaker, because nodes themselves can't be compared.

```python
@include code/ch11/p06_merge_k_lists.py::merge_k
```

**Complexity:** O(N log k) time, O(k) extra space.

> **Follow-Up:** A divide-and-conquer approach merges the lists in pairs, then pairs of pairs, also in O(N log k), without a heap.

## Key Takeaways

- Save the next node before changing a pointer; draw the arrows.
- A dummy head node removes special cases at the front of the list.
- Slow and fast pointers find middles and cycles in O(1) space; a gap of k finds the k-th from the end.
- Harder problems combine simple steps: find the middle, reverse, merge.
