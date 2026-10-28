"""Exercise 11.2: sort by several keys with a stable sort: sort by the
least important key first, then by the most important."""

people = [
    ("Ada", "Lisbon", 30),
    ("Bo", "Oslo", 25),
    ("Cy", "Lisbon", 25),
    ("Di", "Oslo", 30),
]
by_age_then_city = sorted(people, key=lambda p: p[1])  # city first
by_age_then_city.sort(key=lambda p: p[2])  # stable: cities stay ordered
for p in by_age_then_city:
    print(p)
print(by_age_then_city == sorted(people, key=lambda p: (p[2], p[1])))
