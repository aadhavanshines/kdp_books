# Chapter 7: Memory That Lasts

The feature people notice first in a personal agent is that it remembers. Tell it your sister's birthday in October and it knows in November. But a model remembers nothing between turns: every turn starts from the prompt and nothing else. Memory is something you build around the model. This chapter builds it the way OpenClaw does, as plain Markdown files, with a search index so Sparrow can find old facts without putting them all in every prompt.

## Three Kinds of Memory

Sparrow keeps three kinds of memory, each with its own job:

- **The conversation** is the recent back-and-forth in one session, kept in a transcript file and sent with each new message (Chapter 9). It's short-term: `/new` starts afresh, and only the last twelve exchanges are sent.
- **Long-term memory** is `MEMORY.md`: durable facts, one per line with the date Sparrow learned them. "Priya's birthday is 14 November." "Prefers the window seat." The newest part of it is in every system prompt.
- **Daily notes** are files in `memory/`, one per day, such as `memory/2026-10-27.md`: a running log of what happened, with times. They're never in the prompt, but they're searchable.

Here is what they look like after a few days, with the search results you'll make possible in this chapter:

```
@include transcripts/memory-demo.txt
```

Both files are ordinary Markdown. You can open `MEMORY.md`, correct a fact that's wrong, delete one you don't want kept, or add one yourself. Sparrow will see your edit on the next search, because the index notices changed files.

> **Interesting Fact:** OpenClaw keeps memory the same way, in `MEMORY.md` and dated daily files in the workspace, rather than in a hidden database. Being able to read and edit what your agent "knows" turned out to be one of the things users valued most: it's easy to trust a memory you can inspect.

## Writing Memory

`sparrow/memory.py` starts with a helper and the class's setup:

```python
@include sparrow/memory.py#L1-L38
```

`append_line` adds a line to the end of a file. It checks that the file ends with a newline first, because you may have edited `MEMORY.md` by hand and left the last line without one; without the check, Sparrow's next fact would be glued onto yours.

The index is a separate SQLite database in `state/`, so it's Sparrow's own business; the Markdown files stay the source of truth. It has two tables. `chunks` is an **FTS5** table, SQLite's built-in full-text search: it stores text and finds rows by the words in them, ranked by relevance. Each memory line is one chunk, with its file name stored alongside (`UNINDEXED`, because nobody searches by file name). `indexed` records each file's modification time when it was last indexed. `check_same_thread=False` lets the connection be used from the worker threads that some tools run in. `close` closes the database when Sparrow is done with it; the tests check that nothing is ever left open.

```python
@include sparrow/memory.py#L40-L54
```

`remember` joins the fact into one line before saving it. That isn't just tidiness. The fact comes from the model, and the model may have read text from a web page or a file. A fact with a newline in it could add a second line that looks like a separate, older memory, or start a new Markdown heading. One fact, one line, with today's date, no tricks.

`note` appends a time-stamped line to today's daily note, creating it with a heading such as "Tuesday 27 October 2026" the first time.

## Searching Memory

The index keeps itself up to date:

```python
@include sparrow/memory.py#L56-L91
```

`refresh` runs before every search. For each memory file, it compares the file's modification time with the one in `indexed`; if they match, the file hasn't changed and is skipped. Otherwise, it deletes that file's old chunks and inserts one chunk per non-empty line, with leading list dashes, spaces and heading marks stripped. This is why your hand edits show up: you save `MEMORY.md`, its modification time changes, and the next search re-indexes it. With a year of daily notes and ten thousand facts, a full re-index takes about two seconds and a search about 16 milliseconds (Chapter 24 measures both); after the first search, only changed files are read.

```python
@include sparrow/memory.py#L93-L104
```

`search` splits the query into words and asks FTS5 for lines that contain *any* of them, best first. FTS5 has its own query language, with operators like `AND`, `NOT` and `*`, and a raw query such as `"what's up?"` or `NOT` would be a syntax error, or worse, a different query than intended. So each word is put in double quotes (with any double quotes inside removed), which makes FTS5 treat it as a plain word, and the words are joined with `OR`. Chapter 20 tests a list of awkward queries, including empty ones, quotes, stars, brackets and the word `NOT`, to make sure none of them can break a search.

`bm25` is FTS5's ranking function, a standard way to score how well a document matches: lines that contain more of the query's words, and rarer words, score better. It returns lower numbers for better matches, so `ORDER BY bm25(chunks)` puts the best first. Five results are plenty for the model to work with.

## Why Not Embeddings?

Many agents search memory with **embeddings**: they turn each fact and each question into a list of numbers that captures its meaning, so "When was my sister born?" can find "Priya's birthday is 14 November" without sharing a word. That's powerful, and OpenClaw can do it. Sparrow uses plain word search for three reasons: it needs no extra service or model; it gives the same results every time, which makes it easy to test; and the model compensates well. Claude knows that "sister" might be stored as a name, so it searches for "birthday" or "sister" or "Priya" in turn, as you'll see in the end-to-end runs. Chapter 27 shows where embeddings would fit if your memory grows large and you want them.

## Saving Before Forgetting

There's one more piece of memory, and it lives in the gateway: when you type `/new` to start a fresh conversation, Sparrow first gets one last turn with this instruction:

```python
@include sparrow/gateway.py#L34-L38
```

That turn can call `remember` for anything from the conversation that's worth keeping, such as a trip you mentioned in passing, before the transcript is archived. OpenClaw does the same before it compacts a long conversation. Chapter 9 shows where it's called, and Chapter 21 tests that the fact survives the reset.

## Key Takeaways

- A model remembers nothing between turns; memory is files and search that you build around it.
- Sparrow keeps the conversation, long-term facts in `MEMORY.md`, and daily notes, all as editable Markdown.
- An SQLite FTS5 index finds old facts by their words; it re-indexes only files that changed, so hand edits are picked up.
- Quote every word in a full-text query, so user text can never become query syntax.
- Keep each remembered fact to one line, and give Sparrow a chance to save facts before a conversation is cleared.
