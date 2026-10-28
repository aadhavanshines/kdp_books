# Appendix C: How the Benchmarks Were Run

Every timing in this book comes from running the benchmark listing printed with it. This appendix describes the computer, the method, and how to run the benchmarks yourself.

## The Computer

- A cloud virtual machine with 4 cores of an Intel Xeon processor at 2.80 GHz and 15 GB of memory
- Ubuntu 24.04 LTS
- Python 3.15.0 for every benchmark table and chart, except Chapter 33, which compares Python 3.12.3, 3.13.5, 3.14.8 and 3.15.0 (how each was built is described in that chapter)

A cloud machine shares its hardware with other machines, which adds noise to timings. The method below is designed to reduce it, and the book only draws conclusions from patterns that are much larger than the noise: growth ratios close to 2 or 4, and differences of several times between structures.

## The Method

All timings use the `bench` module from Chapter 3 (`code/common/bench.py`), which every chapter folder has a copy of:

- **`measure`** times an operation with `time.perf_counter`, repeating it until the total takes at least 20 milliseconds, so even operations of a tenth of a microsecond are timed accurately. It does this five times and keeps the **fastest** round, because noise from other programs only ever makes a run slower. Garbage collection is turned off while timing, so its pauses don't land at random in one measurement.
- When an operation changes its input, such as a sort, a `setup` function makes fresh input for every call, and only the operation itself is timed.
- **`doubling`** times an operation at a series of input sizes. It **interleaves** the rounds: each round times every size once, and each size keeps its fastest time across the rounds. A burst of background activity therefore affects one round of every size a little, instead of every round of one size.
- **`table`** prints the times with the ratio to the previous size, and **`chart`** draws them.

## Recording and Checking

The book's repository contains three tools for this, in the `tests` folder:

- `record_benchmarks.py` runs every benchmark listing once with Python 3.15 and saves both its printed table (the `.out` file shown in the book) and its chart, so the table and the chart always come from the same run.
- `run_listings.py` checks every listing in the book on all four versions of Python. Ordinary listings must print exactly their recorded output. Benchmarks run in a quick mode (`BENCH_QUICK=1`), which checks that they work without waiting for exact timings, since their numbers differ on every run.
- `record_versions.py` runs Chapter 33's suite on each version of Python in turn, three passes in rotation, and keeps each version's fastest time for each test.

## Running the Benchmarks Yourself

From the chapter's folder in the repository, with your virtual environment active (Chapter 2):

```
$ python bench_append.py
```

Expect different numbers: a faster or slower computer changes every time in the table. The ratios between rows and the shape of each chart should be close to the book's. If they're not, run the benchmark again with your other programs closed; if they're still different, you've found something interesting about your computer or your version of Python, and the benchmark is the tool to explore it.
