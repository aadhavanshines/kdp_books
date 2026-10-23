"""Charts for the book, computed at build time from the tested models in
code/ (or, for real-world incidents, from the published figures listed in
research/facts.md). 300 DPI PNGs, 4.6 in wide, readable in grayscale."""
import sys
from pathlib import Path

import matplotlib

matplotlib.use("Agg")
import matplotlib.pyplot as plt  # noqa: E402
from matplotlib import font_manager  # noqa: E402

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "code"))

FONT_DIR = "/usr/share/fonts/truetype/liberation"
for name in ("LiberationSans-Regular.ttf", "LiberationSans-Bold.ttf",
             "LiberationSans-Italic.ttf"):
    font_manager.fontManager.addfont(f"{FONT_DIR}/{name}")

NAVY = "#1F3A5F"
MID = "#6E8096"
LIGHT = "#C9D3DF"
ORANGE = "#C25400"   # prints as a mid gray, distinct from navy

plt.rcParams.update({
    "font.family": "Liberation Sans",
    "font.size": 8.5,
    "axes.titlesize": 9.5,
    "axes.titleweight": "bold",
    "axes.labelsize": 8.5,
    "axes.edgecolor": "#555555",
    "axes.spines.top": False,
    "axes.spines.right": False,
    "xtick.labelsize": 8,
    "ytick.labelsize": 8,
    "legend.fontsize": 8,
    "legend.frameon": False,
})

WIDTH_IN = 4.6


def _save(fig, path):
    fig.tight_layout()
    fig.savefig(path, dpi=300, facecolor="white")
    plt.close(fig)


def pokemon_go(path):
    """Planned versus actual launch traffic (Google Cloud blog, 2016)."""
    fig, ax = plt.subplots(figsize=(WIDTH_IN, 2.3))
    labels = ["Planned\ntarget", "Planned\nworst case", "Actual\nlaunch traffic"]
    values = [1, 5, 50]
    bars = ax.barh(labels, values, color=[LIGHT, MID, NAVY], height=0.6)
    for bar, v in zip(bars, values):
        ax.text(v + 0.8, bar.get_y() + bar.get_height() / 2, f"{v}x",
                va="center", fontweight="bold")
    ax.invert_yaxis()
    ax.set_xlim(0, 58)
    ax.set_xlabel("traffic, relative to the planned target")
    _save(fig, path)


def hit_rate_curve(path):
    """ch06/b02_hit_rate: LRU hit rate against cache size, Zipf keys."""
    from ch06.b02_hit_rate import hit_rate

    sizes = [100, 300, 1_000, 3_000, 10_000, 30_000]
    rates = [hit_rate(s) * 100 for s in sizes]
    shares = [s / 100_000 * 100 for s in sizes]
    fig, ax = plt.subplots(figsize=(WIDTH_IN, 2.6))
    ax.plot(shares, rates, marker="o", color=NAVY, lw=1.8, ms=4)
    ax.set_xscale("log")
    ax.set_xticks(shares)
    ax.set_xticklabels([f"{x:g}%" for x in shares])
    ax.set_ylim(0, 100)
    ax.set_xlabel("cache size, as a share of all keys (log scale)")
    ax.set_ylabel("hit rate (%)")
    for x, y in zip(shares, rates):
        ax.annotate(f"{y:.0f}%", (x, y), textcoords="offset points",
                    xytext=(0, 7), ha="center", fontsize=7.5)
    ax.grid(axis="y", color="#E5E5E5", lw=0.6)
    _save(fig, path)


def retry_storm(path):
    """ch14/b01_retry: retries per 10 ms slot after an outage."""
    from ch14.b01_retry import retry_slots

    fig, axes = plt.subplots(2, 1, figsize=(WIDTH_IN, 3.4), sharex=True)
    for ax, jitter, title in [
        (axes[0], False, "Fixed backoff: up to {:,} retries in one 10 ms slot"),
        (axes[1], True, "Full jitter: the same retries, at most {:,} per slot"),
    ]:
        slots = retry_slots(jitter=jitter)
        xs = sorted(slots)
        ax.bar([x / 100 for x in xs], [slots[x] for x in xs], width=0.15,
               color=NAVY if not jitter else MID)
        ax.set_title(title.format(max(slots.values())), loc="left")
        ax.set_ylabel("retries per\n10 ms")
        ax.set_ylim(0, 1100)
    axes[1].set_xlabel("seconds after the outage ends (1,000 clients, 5 retries each)")
    _save(fig, path)


def latency_histogram(path):
    """ch15/b01_percentiles: why the mean hides the slow tail."""
    from ch15.b01_percentiles import percentile, sample_latencies

    lat = sample_latencies()
    mean = sum(lat) / len(lat)
    fig, ax = plt.subplots(figsize=(WIDTH_IN, 2.7))
    ax.hist(lat, bins=[x * 20 for x in range(0, 66)], color=LIGHT,
            edgecolor=MID, lw=0.4)
    ax.set_yscale("log")
    ax.set_xlabel("request latency (ms)")
    ax.set_ylabel("requests (log scale)")
    marks = [("p50", percentile(lat, 50)), ("mean", mean),
             ("p99", percentile(lat, 99))]
    for i, (name, v) in enumerate(marks):
        color = ORANGE if name == "mean" else NAVY
        ax.axvline(v, color=color, lw=1.4, ls="--" if name == "mean" else "-")
        ax.text(v + 12, 3e4 / (4 ** i), f"{name} {v:.0f} ms", color=color,
                fontweight="bold")
    ax.text(1000, 3, "2% slow requests\n(cache miss + disk)", ha="center",
            fontsize=7.5, color="#333333")
    _save(fig, path)


def abr_timeline(path):
    """ch25/d01_abr: bitrate chosen per segment, with the bandwidth."""
    from ch25.d01_abr import buffer_based, fixed_high, timeline

    trace = [12.0] * 20 + [1.5] * 20 + [10.0] * 20
    fig, axes = plt.subplots(2, 1, figsize=(WIDTH_IN, 3.6), sharex=True)
    xs = [i * 2 for i in range(len(trace))]
    for ax, fn, title in [
        (axes[0], fixed_high, "Always 8 Mbps: the buffer drains and playback freezes"),
        (axes[1], buffer_based, "Buffer-based ABR: quality drops, playback continues"),
    ]:
        points = timeline(trace, fn)
        ax.step(xs, trace, where="post", color=MID, lw=1.2, label="bandwidth")
        ax.step(xs, [r for r, _ in points], where="post", color=NAVY, lw=2,
                label="bitrate chosen")
        ax.set_title(title, loc="left")
        ax.set_ylabel("Mbps")
        ax.set_ylim(0, 14)
        ax.axvspan(40, 80, color="#EEEEEE", zorder=0)
    axes[0].text(60, 3.2, "slow patch", ha="center", fontsize=7.5)
    handles, names = axes[0].get_legend_handles_labels()
    fig.legend(handles, names, loc="upper center", ncol=2, bbox_to_anchor=(0.55, 1.0))
    axes[1].set_xlabel("seconds of video")
    fig.tight_layout(rect=(0, 0, 1, 0.94))
    fig.savefig(path, dpi=300, facecolor="white")
    plt.close(fig)


# Published durations (hours) of well-documented outages; see facts.md.
OUTAGES = [
    ("2012", "Knight Capital", 0.75, "45 minutes of runaway orders"),
    ("2017", "AWS S3 (us-east-1)", 4.3, "mistyped removal command"),
    ("2018", "GitHub", 24.2, "43-second network partition"),
    ("2019", "Cloudflare", 0.45, "one regex, deployed everywhere"),
    ("2021", "Fastly", 0.8, "latent bug + one customer's config"),
    ("2021", "Facebook", 6, "backbone withdrawn, DNS unreachable"),
    ("2021", "Roblox", 73, "overloaded shared Consul cluster"),
    ("2022", "Atlassian (some sites)", 14 * 24, "sites deleted by a script"),
]


def outage_durations(path):
    fig, ax = plt.subplots(figsize=(WIDTH_IN, 3.1))
    labels = [f"{n} ({y})" for y, n, _, _ in OUTAGES]
    hours = [h for _, _, h, _ in OUTAGES]
    bars = ax.barh(labels, hours, color=NAVY, height=0.6)
    ax.set_xscale("log")
    ax.set_xlim(0.2, 1500)
    ax.invert_yaxis()
    ax.set_xticks([0.25, 1, 6, 24, 24 * 14])
    ax.set_xticklabels(["15 min", "1 h", "6 h", "1 day", "2 weeks"])
    ax.minorticks_off()
    ax.set_xlabel("how long the incident lasted (log scale)")
    for bar, (_, _, h, why) in zip(bars, OUTAGES):
        inside = h > 50
        ax.text(0.24 if inside else h * 1.15, bar.get_y() + bar.get_height() / 2, why,
                va="center", fontsize=7.2, color="white" if inside else "#333333")
    _save(fig, path)


CHARTS = {
    "pokemon-go": pokemon_go,
    "hit-rate": hit_rate_curve,
    "retry-storm": retry_storm,
    "latency-histogram": latency_histogram,
    "abr-timeline": abr_timeline,
    "outages": outage_durations,
}


def build_charts(out_dir):
    out_dir = Path(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    for name, fn in CHARTS.items():
        fn(out_dir / f"chart-{name}.png")


if __name__ == "__main__":
    build_charts(ROOT / "manuscript" / "images")
