"""Chapter 27: geohash encoding and a nearby-places search.

A geohash interleaves longitude and latitude bits and writes them in
base 32. Nearby points usually share a prefix, so a search looks in the
point's cell and its eight neighbors, then filters by exact distance.
"""

import math

BASE32 = "0123456789bcdefghjkmnpqrstuvwxyz"


def encode(lat, lon, precision=6):
    lat_r, lon_r = [-90.0, 90.0], [-180.0, 180.0]
    bits, out, even = [], [], True
    while len(out) < precision:
        rng, val = (lon_r, lon) if even else (lat_r, lat)
        mid = (rng[0] + rng[1]) / 2
        if val >= mid:
            bits.append(1)
            rng[0] = mid
        else:
            bits.append(0)
            rng[1] = mid
        even = not even
        if len(bits) == 5:
            out.append(BASE32[int("".join(map(str, bits)), 2)])
            bits = []
    return "".join(out)


def cell_size(precision):
    """Height and width of a cell in degrees."""
    lon_bits = math.ceil(precision * 5 / 2)
    lat_bits = precision * 5 // 2
    return 180 / 2**lat_bits, 360 / 2**lon_bits


def neighbors(lat, lon, precision=6):
    dlat, dlon = cell_size(precision)
    return {
        encode(lat + i * dlat, lon + j * dlon, precision)
        for i in (-1, 0, 1)
        for j in (-1, 0, 1)
        if -90 <= lat + i * dlat <= 90
    }


def km(a, b):
    """Great-circle distance (haversine) in kilometers."""
    lat1, lon1, lat2, lon2 = map(math.radians, (*a, *b))
    h = (
        math.sin((lat2 - lat1) / 2) ** 2
        + math.cos(lat1) * math.cos(lat2) * math.sin((lon2 - lon1) / 2) ** 2
    )
    return 2 * 6371 * math.asin(math.sqrt(h))


def precision_for(lat, radius_km):
    """The finest precision whose cells are at least radius_km tall and
    wide at this latitude. Cells get narrower away from the equator, by
    a factor of cos(latitude), so a fixed precision is not safe."""
    for precision in range(9, 0, -1):
        h, w = cell_size(precision)
        width_km = w * 111.32 * math.cos(math.radians(abs(lat) + h))
        if min(h * 110.57, width_km) >= radius_km:
            return precision
    return 1


def nearby(places, point, radius_km):
    """places: list of (name, lat, lon). Search the 3 x 3 block of cells
    around the point, then keep places within radius_km."""
    precision = precision_for(point[0], radius_km)
    index = {}
    for name, lat, lon in places:
        index.setdefault(encode(lat, lon, precision), []).append(
            (name, lat, lon)
        )
    found = []
    for cell in neighbors(*point, precision):
        for name, lat, lon in index.get(cell, []):
            if km(point, (lat, lon)) <= radius_km:
                found.append(name)
    return sorted(found)


def nearby_brute(places, point, radius_km):
    return sorted(
        n for n, lat, lon in places if km(point, (lat, lon)) <= radius_km
    )


SOLUTIONS = [nearby, nearby_brute]
EXAMPLES = [
    (
        (
            [
                ("cafe", 51.5007, -0.1246),
                ("museum", 51.5194, -0.1270),
                ("park", 51.6, -0.3),
            ],
            (51.5033, -0.1196),
            3.0,
        ),
        ["cafe", "museum"],
    )
]


def random_case(rng):
    lat0, lon0 = rng.uniform(-60, 60), rng.uniform(-170, 170)
    places = [
        (
            f"p{i}",
            lat0 + rng.uniform(-0.1, 0.1),
            lon0 + rng.uniform(-0.1, 0.1),
        )
        for i in range(rng.randint(0, 40))
    ]
    return (places, (lat0, lon0), rng.choice([0.5, 1.0, 3.0]))


def test():
    assert (
        encode(57.64911, 10.40744, 11) == "u4pruydqqvj"
    )  # a well-known test vector
    h, w = cell_size(5)
    assert round(h * 111, 1) == 4.9 and round(w * 111, 1) == 4.9
    assert precision_for(0, 3.0) == 5 and precision_for(59, 3.0) == 4
