import pandas as pd

# Two support teams; tickets are easy or hard.
tickets = pd.DataFrame(
    {
        "team": ["Red", "Red", "Blue", "Blue"],
        "kind": ["easy", "hard", "easy", "hard"],
        "tickets": [90, 10, 20, 80],
        "solved": [81, 5, 19, 48],
    }
)

overall = tickets.groupby("team")[["solved", "tickets"]].sum()
print((overall["solved"] / overall["tickets"]).round(2))
print()
tickets["rate"] = (tickets["solved"] / tickets["tickets"]).round(2)
print(tickets.pivot(index="kind", columns="team", values="rate"))
