"""Timing helpers used by every benchmark in this book (Chapter 3).

measure()  times one operation: the fastest of several rounds
doubling() times an operation for a series of input sizes
table()    prints the results, with the ratio between neighboring sizes
chart()    draws the results as a line chart and saves it as a PNG file
"""

import gc
import os
import time

# BENCH_QUICK=1 makes a quick, rough run: the book's checks use it to
# confirm that every benchmark works, without waiting for exact timings
QUICK = os.environ.get("BENCH_QUICK") == "1"


def measure(run, setup=None, *, rounds=5, min_time=0.02):
    """Seconds for one call of run(), the fastest of `rounds` rounds.

    Each round repeats the call until it has taken at least `min_time`
    seconds, so even very fast operations are timed accurately. If the
    operation changes its input (sorting, say), give setup(): it makes
    fresh input for every call, run(*setup()), and is not timed.
    """
    if QUICK:
        rounds, min_time = 1, 1e-9
    best = float("inf")
    for _ in range(rounds):
        gc.disable()  # garbage collection would add random pauses
        try:
            if setup is None:
                seconds = _batch(run, min_time)
            else:
                seconds = _fresh(run, setup, min_time)
        finally:
            gc.enable()
        best = min(best, seconds)
    return best


def _batch(run, min_time):
    """Time a loop of calls, doubling its length until it is long enough."""
    number = 1
    while True:
        start = time.perf_counter()
        for _ in range(number):
            run()
        total = time.perf_counter() - start
        if total >= min_time:
            return total / number
        number *= 2


def _fresh(run, setup, min_time):
    """Time one call at a time, each with fresh input from setup()."""
    calls, total = 0, 0.0
    while total < min_time:
        args = setup()
        start = time.perf_counter()
        run(*args)
        total += time.perf_counter() - start
        calls += 1
    return total / calls


def doubling(run, make_input, sizes, fresh=False, rounds=5, **options):
    """[(n, seconds), ...]: run(*make_input(n)) timed for each n.

    The input is made once per size and reused, unless fresh=True: then
    every call gets new input, for operations that change it. The rounds
    are interleaved: each round times every size once, and each size
    keeps its fastest round, so a burst of background activity on the
    computer can't spoil all the rounds of one size.
    """
    if QUICK:
        rounds = 1
    inputs = {} if fresh else {n: make_input(n) for n in sizes}
    best = dict.fromkeys(sizes, float("inf"))
    for _ in range(rounds):
        for n in sizes:
            if fresh:
                seconds = measure(
                    run, lambda n=n: make_input(n), rounds=1, **options
                )
            else:
                seconds = measure(
                    lambda n=n: run(*inputs[n]), rounds=1, **options
                )
            best[n] = min(best[n], seconds)
    return [(n, best[n]) for n in sizes]


UNITS = [  # (short name, long name, seconds in one unit)
    ("s", "seconds", 1),
    ("ms", "milliseconds", 1e-3),
    ("us", "microseconds", 1e-6),
    ("ns", "nanoseconds", 1e-9),
]


def unit_for(seconds):
    """The largest unit that gives a number of at least 1."""
    return next((u for u in UNITS if seconds >= u[2]), UNITS[-1])


def show_time(seconds):
    """A time with a sensible unit: '512 ns', '3.21 us', '45.6 ms'."""
    short, _, scale = unit_for(seconds)
    return f"{seconds / scale:.3g} {short}"


def table(results):
    """Print a table: one row per size, one column per series.

    `results` maps a name to [(n, seconds), ...]. The ratio after each
    time shows how much longer that size took than the one before: about
    2 when the time is proportional to n, about 4 when it grows with n
    squared, and about 1 when it doesn't depend on n.
    """
    names = list(results)
    widths = [max(16, len(name) + 2) for name in names]
    header = "".join(f"{name:>{w}}" for name, w in zip(names, widths))
    print(f"{'n':>10}" + header)
    sizes = [n for n, _ in results[names[0]]]
    for i, n in enumerate(sizes):
        row = f"{n:>10,}"
        for name, width in zip(names, widths):
            seconds = results[name][i][1]
            cell = show_time(seconds)
            if i:
                cell += f" x{seconds / results[name][i - 1][1]:.1f}"
            row += f"{cell:>{width}}"
        print(row)


def chart(results, filename, title, log=False):
    """Save a line chart of the results: time against n."""
    import matplotlib.pyplot as plt
    from matplotlib.ticker import StrMethodFormatter

    longest = max(s for rows in results.values() for _, s in rows)
    _, unit, scale = unit_for(longest)
    fig, ax = plt.subplots()
    for name, rows in results.items():
        sizes = [n for n, _ in rows]
        times = [s / scale for _, s in rows]
        ax.plot(sizes, times, "o-", label=name)
    if log:  # equal steps on the axes are equal multiples
        ax.set_xscale("log")
        ax.set_yscale("log")
    else:
        ax.xaxis.set_major_formatter(StrMethodFormatter("{x:,.0f}"))
    ax.set_xlabel("n (input size)")
    ax.set_ylabel(f"{unit} per call")
    ax.set_title(title)
    ax.legend()
    fig.tight_layout()
    fig.savefig(filename)
    plt.close(fig)
