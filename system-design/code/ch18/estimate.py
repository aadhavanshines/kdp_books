"""Chapter 18: key-value store estimates."""

from common.estimates import TB, human, peak, table


def demo():
    data = 100 * TB  # logical data
    copies = 3
    per_node = 4 * TB  # usable disk per node
    rps = 1_000_000  # reads + writes at peak
    nodes_for_space = -(-data * copies // per_node)
    nodes_for_load = -(-peak(rps, 1) // 20_000)  # 20K ops/s per node
    table(
        [
            ("data with 3 copies", human(data * copies, "B")),
            ("nodes for storage (4 TB each)", int(nodes_for_space)),
            ("nodes for 1M ops/s (20K each)", int(nodes_for_load)),
            (
                "cluster size (the larger)",
                int(max(nodes_for_space, nodes_for_load)),
            ),
        ]
    )
