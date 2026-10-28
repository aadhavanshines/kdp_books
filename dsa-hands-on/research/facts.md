# Facts, Real-World Uses and Their Sources

Checked October 2026. Primary sources (source code and official documentation) were read directly where this session's network allowed: CPython, OpenJDK, Go, Linux, Git, SQLite, PostgreSQL, Redis and V8 documentation or source on GitHub. For facts whose primary host was not reachable from the build machine (rfc-editor.org, cacm.acm.org, docs.python.org, sqlite.org, v8.dev), the same text was checked through the projects' GitHub repositories or through search results quoting the primary source, as noted.

| # | Fact used in the book | Chapter | Source (how checked) |
| --- | --- | --- | --- |
| 1 | CPython over-allocates lists: `new_allocated = (newsize + (newsize >> 3) + 6) & ~3`, growth pattern 0, 4, 8, 16, 24, 32, 40, 52, 64, 76. Matches `list_growth.out` | 4, 6 | CPython `Objects/listobject.c` (read) |
| 2 | Java's `ArrayList` grows by half its capacity (`oldCapacity >> 1`) | 6 | OpenJDK `java/util/ArrayList.java` (read) |
| 3 | Go slices double while small, then move toward 1.25x growth after a threshold of 256 | 6 | Go `src/runtime/slice.go`, `nextslicecap` (read) |
| 4 | `collections.deque` is a doubly linked list of blocks of 64 slots | 7, 8 | CPython `Modules/_collectionsmodule.c`, `BLOCKLEN 64` (read) |
| 5 | CPython's dict uses open addressing (not chaining) with a perturbed probe sequence, a compact layout (an index table plus an entries array, which keeps insertion order), and resizes at two thirds full | 9 | CPython `Objects/dictobject.c` comments, `USABLE_FRACTION` (read) |
| 6 | Java's `HashMap` uses chaining with load factor 0.75 and turns a bucket into a balanced tree when it holds 8 or more entries | 9 | OpenJDK `java/util/HashMap.java`, `TREEIFY_THRESHOLD = 8`, `DEFAULT_LOAD_FACTOR = 0.75f` (read) |
| 7 | Hashes of `str` and `bytes` are salted with a random value per process, enabled by default since Python 3.3, to defend against denial of service through inputs chosen to make dict insertion quadratic | 9 | CPython `Doc/reference/datamodel.rst` (`object.__hash__` note); `Doc/whatsnew/3.3.rst` (read) |
| 8 | `git bisect` uses binary search to find the commit that introduced a bug | 10 | Git `Documentation/git-bisect.adoc` (read) |
| 9 | Joshua Bloch (2006) showed that the binary search in many libraries, including Java's, overflowed in `(low + high) / 2` for arrays of about 2^30 or more elements | 10 | Google Research blog, "Extra, Extra - Read All About It: Nearly All Binary Searches and Mergesorts are Broken", 2 June 2006 (search results quoting the post) |
| 10 | Tim Peters rewrote `list.sort()` for Python 2.3 (the algorithm now called Timsort); since Python 3.11 it uses the "powersort" merge strategy of Munro and Wild | 12 | CPython `Doc/whatsnew/2.3.rst`; `Objects/listsort.txt` (read); bpo-34561 commit (search) |
| 11 | V8 (Chrome's JavaScript engine) switched `Array.prototype.sort` to TimSort in V8 v7.0 / Chrome 70 (September 2018), making it stable | 12 | V8 blog "Getting things sorted in V8", via the v8.dev repository on GitHub (read) |
| 12 | Go's `sort` package uses pattern-defeating quicksort (pdqsort) since Go 1.19 | 12 | Go `src/sort/zsortfunc.go`; Go 1.19 release notes in the golang/website repository (read) |
| 13 | Tony Hoare devised quicksort in 1959-60 as a visiting student in Moscow, to sort words for machine translation; published in Communications of the ACM in 1961 | 12 | Stanford and other histories (search) |
| 14 | asyncio's event loop keeps scheduled callbacks in a heap (`heapq.heappush(self._scheduled, timer)`) | 13 | CPython `Lib/asyncio/base_events.py` (read) |
| 15 | Linux uses red-black trees for I/O scheduler requests, high-resolution timers, virtual memory areas and epoll | 17 | Linux `Documentation/core-api/rbtree.rst` (read) |
| 16 | SQLite is "an external (disk-based) database using BTrees"; PostgreSQL's `CREATE INDEX` makes B-tree indexes by default | 17 | SQLite `src/btree.c` (read); PostgreSQL `doc/src/sgml/indices.sgml` (read) |
| 17 | The AVL tree (Adelson-Velsky and Landis, 1962) was the first self-balancing binary search tree | 17 | NIST Dictionary of Algorithms and Data Structures; Wikipedia (search) |
| 18 | Edward Fredkin named the trie in 1960, from the middle of "retrieval"; René de la Briandais described the idea in 1959 | 18 | Fredkin, "Trie Memory", CACM 3(9), 1960 (citation via search) |
| 19 | Tarjan (1975) proved union-find with path compression and union by rank runs in nearly constant time per operation (inverse Ackermann) | 19 | Tarjan, JACM 22(2) 1975 (search) |
| 20 | `graphlib.TopologicalSorter` has been in the standard library since Python 3.9 | 21 | CPython `Doc/library/graphlib.rst` (read) |
| 21 | Dijkstra designed his shortest-path algorithm in about twenty minutes in 1956, at a café in Amsterdam with his fiancée, without pencil and paper, for a demonstration of the ARMAC computer on a map of Dutch cities; published 1959 | 22 | Interview with Dijkstra (Philip Frana), Communications of the ACM 2010 (quoted in search results; cacm.acm.org unreachable from the build machine) |
| 22 | OSPF routers (RFC 2328) compute shortest-path trees with Dijkstra's algorithm; RIP (RFC 2453) is a distance-vector protocol from the Bellman-Ford family | 22 | RFC 2328, RFC 2453 (search results quoting the RFCs) |
| 23 | Borůvka (1926, for electrifying Moravia), Jarník (1930), Kruskal (1956) and Prim (1957, telephone networks) | 23 | Histories (search) |
| 24 | Richard Bellman chose the name "dynamic programming" to hide mathematical research from Secretary of Defense Charles Wilson | 29 | Bellman, *Eye of the Hurricane* (1984), as quoted in several sources (search). The book says "Bellman wrote" and notes that historians question the timeline |
| 25 | Git's default diff algorithm is Myers'; patience and histogram are options | 30 | Git `Documentation/diff-algorithm-option.adoc` (read) |
| 26 | Huffman found his coding method in a 1951 term paper for Robert Fano's course at MIT (students could write the paper instead of taking the final exam); published 1952. DEFLATE (zip, gzip, PNG) combines LZ77 with Huffman coding | 31 | Huffman's 1952 paper (citation via search); RFC 1951 (search results quoting it) |
| 27 | Python 3.11 added atomic groups and possessive quantifiers to `re` | 31 | CPython `Doc/whatsnew/3.11.rst` (read) |
| 28 | Redis evicts keys with an approximation of LRU, sampling a few keys (`maxmemory-samples`), because true LRU costs more memory | 32 | Redis docs, `content/develop/reference/eviction/index.md` (read) |
| 29 | Python 3.11: "between 10-60% faster than Python 3.10", 1.25x on average. Python 3.13: experimental free-threaded build (PEP 703) and experimental JIT (PEP 744), both off by default. Python 3.14: free-threaded build officially supported; new tail-calling interpreter 3-5% faster; JIT in Windows and macOS binaries. Python 3.15 (released 9 October 2026): JIT 7-8% faster than the standard interpreter on x86-64 Linux (geometric mean) | 33 | CPython `Doc/whatsnew/3.11.rst`, `3.14.rst`, `3.15.rst` (read); `3.13.rst` (via search) |
| 30 | KDP's 70% eBook royalty applies from $2.99 to $12.99 on Amazon.com since 7 July 2026 (for the listing, not the book) | listing | KDP help pages (search) |

## Not used (could not be confirmed well enough)

- The exact year Hoare first devised quicksort (sources give 1959 and 1960); the book says "around 1960".

## Added while writing

| # | Fact | Chapter | Source (how checked) |
| --- | --- | --- | --- |
| 31 | `timeit`'s documentation: "the min() of the result is probably the only number you should be interested in" | 3 | CPython `Doc/library/timeit.rst` (read) |
| 32 | Dict insertion order became an official part of the language in Python 3.7 | 4 | CPython `Doc/whatsnew/3.7.rst` (read) |
| 33 | PEP 8: do not rely on CPython's in-place string concatenation; use `''.join()` in performance-sensitive code | 4 | PEP 8, python/peps repository (read) |
| 34 | Linux's `include/linux/list.h`: "Circular doubly linked list implementation"; an initialized list head is an empty list | 7 | Linux source (read) |
| 35 | Linux `kfifo`: a generic kernel FIFO built on a ring buffer (sizes rounded to powers of 2) | 8 | LWN coverage of the kfifo rewrite (search) |
| 36 | Python 3.6 reimplemented dict "to use a more compact representation", 20% to 25% less memory than 3.5 | 9 | CPython `Doc/whatsnew/3.6.rst` (read) |
| 37 | Hash flooding: Klink and Wälde, 28C3 (December 2011), demonstrated against PHP, Python, Java, Ruby and V8; advisory oCERT-2011-003 | 9 | LWN article 474365; oCERT advisory (search) |
| 38 | Punched-card sorters sorted one column per pass; multi-column keys were sorted least significant column first (LSD radix sort) | 14 | Wikipedia "Punched card sorter"; Columbia University computing history pages; IBM 83 sorter manual (search) |
| 39 | Dijkstra posed the Dutch national flag problem in *A Discipline of Programming* (1976) | 12 | NIST DADS; Wikipedia (search) |
| 40 | CPython's sort extends short runs to a minimum length with binary insertion sort and reverses descending runs in place | 11, 12 | CPython `Objects/listsort.txt` (read) |
| 41 | Bloch's 2006 report: the bug in *Programming Pearls* went unnoticed for two decades; Java's own binary search had the same overflow | 10 | Google Research blog (search) |
| 42 | TCP flow control is a sliding window: the receiver advertises how many bytes it can still accept, and the sender keeps no more than that many unacknowledged bytes in flight; a zero window pauses the sender | 26 | IBM networking documentation; University of Washington CSE 461 lecture notes (search); RFC 9293 consolidated the TCP specification in 2022 |
| 43 | Summed-area tables: Frank Crow, "Summed-Area Tables for Texture Mapping" (SIGGRAPH 1984); renamed the "integral image" by Viola and Jones, whose 2001 face detector used it to sum rectangles with four lookups | 27 | Wikipedia "Summed-area table"; ImageJ wiki "Integral Image Filters" (search) |
| 44 | Myers' diff algorithm, "An O(ND) Difference Algorithm and Its Variations" (Algorithmica, 1986): running time grows with the size D of the difference; Needleman and Wunsch published their sequence-alignment DP in 1970 (*Journal of Molecular Biology*) | 30 | Citations confirmed via search; Git `Documentation/diff-algorithm-option.adoc` (read) for Git's options |
