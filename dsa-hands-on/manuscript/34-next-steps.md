# Chapter 34: Next Steps

You've built a dynamic array, linked lists, stacks and queues, two kinds of hash table, binary search, a shelf of sorting algorithms from bubble sort to radix sort, a heap, binary search trees and an AVL tree, a trie, union-find, graphs with BFS, DFS, topological sort, Dijkstra, Bellman-Ford, Kruskal and Prim, and an LRU cache. You've tested every one of them against a simpler, trusted version on thousands of random inputs, and timed them until the Big O on the page matched the numbers on your screen. And you've learned the patterns that turn most interview problems from a blank page into a familiar shape.

This last chapter is a map of where to go next.

## Keep the Habits

The structures matter less than three habits that run through every chapter:

- **Measure.** Before believing that something is fast or slow, time it, with the fastest of several runs, on inputs that double in size. The ratio column tells you the growth rate; the chart shows you where the crossover is.
- **Test against something simpler.** For every clever piece of code, there's a slow, obviously correct version: a built-in, a brute force, a model. Compare them on thousands of small random inputs, and keep the inputs small so that a failure is easy to debug.
- **Know what runs in C.** In Python, the biggest speedups often come from moving a loop into a built-in: `sorted`, `sum`, `set`, `dict`, `heapq`, `bisect`, `collections`. An O(n log n) sort in C beats an O(n) loop in Python for surprisingly large n, and the only way to know where the crossover is is to measure.

## Structures to Learn Next

Each of these builds directly on something in this book.

- **Fenwick trees and segment trees** (from prefix sums, Chapter 27). Prefix sums answer range sums in O(1), but a single change to the data means rebuilding them in O(n). These trees support both updating an item and querying a range in O(log n).
- **B-trees** (from Chapter 16's BST and Chapter 17's balancing). Instead of two children per node, a B-tree node holds hundreds of keys, sized to match a disk page, so a lookup among millions of rows reads only three or four pages. Most databases store their tables and indexes this way.
- **Skip lists** (from Chapter 7's linked lists). Linked lists with extra "express lanes" at random heights give O(log n) search on average, with simpler code than a balanced tree.
- **Bloom filters** (from Chapter 9's hashing). A bit array and several hash functions answer "is this item in the set?" with "definitely not" or "probably", using a small fraction of the memory of a real set. Databases use them to skip disk reads for keys that can't be there.
- **String algorithms.** Searching for a pattern in a text with Knuth-Morris-Pratt or with rolling hashes (Rabin-Karp), both O(n + m); and suffix arrays, which make any substring search a binary search (Chapter 10).
- **A\* search** (from Chapter 22's Dijkstra). Dijkstra's algorithm, guided by an estimate of the remaining distance, so it explores toward the goal first. It's the standard pathfinding algorithm in games and robotics.
- **Network flow and matching** (from Chapter 21's graph search). How much can flow through a network of pipes or links with capacities, and how to pair people with jobs; both are solved by repeated BFS.

## Practice

Interview skill comes from practice, and the most efficient practice is deliberate:

- **Practice by pattern.** Work through several problems of one pattern in a row, such as a week of sliding windows, until recognizing the signals in Chapter 24's table becomes automatic. Then mix the patterns, as a real interview does.
- **Time yourself.** Give yourself 30 to 40 minutes per problem, the length of a typical interview question. If you're stuck at the end, study a solution, then solve the problem again from scratch two or three days later.
- **Talk out loud.** Practice explaining your approach and its complexity before writing code. A friend, a recording or a rubber duck all work.
- **Test your solutions the way this book does.** Write the brute force, and stress test your solution against it. You'll find bugs that the examples in a problem statement don't reveal.

## Read the Source

The real-world boxes in this book point to the source code of CPython, Linux, Git and others. Reading code written by experienced programmers is one of the best ways to improve. Good places to start in CPython, all readable without knowing C deeply:

- `Lib/heapq.py` and `Lib/bisect.py`: the Python versions of the modules from Chapters 10 and 13, short and carefully commented.
- `Lib/functools.py`: the pure Python version of `lru_cache`, with its own linked list.
- `Lib/graphlib.py`: the topological sorter from Chapter 21.
- `Objects/listsort.txt`: Tim Peters' description of the sorting algorithm behind `sorted()`, one of the best design documents in any open-source project.
- `Objects/dictobject.c`: the comments at the top explain how Python's dictionary works, from the probing scheme of Chapter 9 to the compact layout.

## Use Your Code

All the code from this book is in the repository at **github.com/aadhavanshines/data-structures-and-algorithms-in-python-hands-on**, with its tests and benchmarks, ready to run on Python 3.12 to 3.15. Change it, break it, extend it: add `delete` to the trie, make the hash table shrink, run the benchmarks on your own computer and see whether your numbers tell the same story as the book's.

Thank you for building all of this with me. Good luck in your interviews, and enjoy the next fast program you write, because now you'll know why it's fast.
