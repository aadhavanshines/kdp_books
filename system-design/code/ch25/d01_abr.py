"""Chapter 25: adaptive bitrate (ABR) versus a fixed high bitrate.

The player downloads 2-second segments over a connection whose
bandwidth changes. A buffer-based rule picks a lower rendition when the
buffer runs low and a higher one when it is healthy.
"""

RENDITIONS = [0.4, 1.0, 2.5, 5.0, 8.0]  # megabits per second
SEGMENT = 2.0  # seconds of video per segment


def play(bandwidth, choose):
    """bandwidth: Mbps available for each segment download.
    Returns (seconds spent rebuffering, average bitrate)."""
    buffer, stalled, rates = 0.0, 0.0, []
    for bw in bandwidth:
        rate = choose(buffer)
        rates.append(rate)
        download = rate * SEGMENT / bw  # seconds to fetch this segment
        if download > buffer:
            stalled += download - buffer  # playback froze
            buffer = 0.0
        else:
            buffer -= download
        buffer = min(buffer + SEGMENT, 30.0)  # cap the buffer at 30 s
    return round(stalled, 1), round(sum(rates) / len(rates), 2)


def timeline(bandwidth, choose):
    """Like play(), but return (bitrate, buffer seconds after the
    segment) for every segment, for plotting."""
    buffer, out = 0.0, []
    for bw in bandwidth:
        rate = choose(buffer)
        buffer = max(0.0, buffer - rate * SEGMENT / bw)
        buffer = min(buffer + SEGMENT, 30.0)
        out.append((rate, buffer))
    return out


def fixed_high(buffer):
    return 8.0


def buffer_based(buffer):
    """Low buffer -> lowest quality; full buffer -> highest."""
    if buffer < 4:
        return RENDITIONS[0]
    step = min(len(RENDITIONS) - 1, int((buffer - 4) / 4) + 1)
    return RENDITIONS[step]


def demo():
    # 60 segments: good Wi-Fi, a slow patch (a train tunnel), then good again
    trace = [12.0] * 20 + [1.5] * 20 + [10.0] * 20
    for name, fn in [
        ("always 8 Mbps", fixed_high),
        ("buffer-based", buffer_based),
    ]:
        stall, avg = play(trace, fn)
        print(f"{name:<14} rebuffering {stall:>5.1f} s, average {avg} Mbps")


def test():
    import random

    rng = random.Random(8)
    for _ in range(200):
        trace = [rng.choice([0.8, 2, 4, 8, 15]) for _ in range(40)]
        assert play(trace, buffer_based)[0] <= play(trace, fixed_high)[0]
        for fn in (buffer_based, fixed_high):
            rates = [r for r, _ in timeline(trace, fn)]
            avg = round(sum(rates) / len(rates), 2)
            assert avg == play(trace, fn)[1]
