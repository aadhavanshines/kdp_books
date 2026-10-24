"""Make every dataset used in this book. All data is fictional.

The random generator has a fixed seed, so every run, on every computer,
makes exactly the same files.
"""

import numpy as np
import pandas as pd

rng = np.random.default_rng(2026)
DAYS_2025 = pd.date_range("2025-01-01", "2025-12-31", freq="D")


def shop():
    """Larkspur Home, an online homeware shop: products, customers,
    orders, and a deliberately messy export of some orders."""
    catalog = {
        "Kitchen": [
            ("Chef Knife", 45.0),
            ("Cast Iron Pan", 60.0),
            ("Mug Set", 24.0),
        ],
        "Bedding": [
            ("Duvet Cover", 70.0),
            ("Pillow Pair", 35.0),
            ("Throw Blanket", 50.0),
        ],
        "Lighting": [
            ("Desk Lamp", 40.0),
            ("Floor Lamp", 120.0),
            ("String Lights", 18.0),
        ],
        "Decor": [
            ("Wall Clock", 32.0),
            ("Vase", 28.0),
            ("Picture Frame", 15.0),
        ],
        "Garden": [
            ("Planter", 22.0),
            ("Hose Reel", 55.0),
            ("Seed Kit", 12.0),
        ],
    }
    products = pd.DataFrame(
        [
            (name, cat, price, round(price * rng.uniform(0.45, 0.6), 2))
            for cat, items in catalog.items()
            for name, price in items
        ],
        columns=["product", "category", "list_price", "unit_cost"],
    )
    regions = ["North", "South", "East", "West"]
    customers = pd.DataFrame(
        {
            "customer_id": [f"C{i:04d}" for i in range(1, 1201)],
            "signup_date": pd.to_datetime("2023-01-01")
            + pd.to_timedelta(rng.integers(0, 1000, 1200), unit="D"),
            "region": rng.choice(regions, 1200, p=[0.3, 0.25, 0.25, 0.2]),
            "segment": rng.choice(
                ["Consumer", "Business"], 1200, p=[0.85, 0.15]
            ),
            "birth_year": rng.integers(1955, 2006, 1200),
        }
    )
    # Busier in November and December; garden goods sell in spring.
    month_weight = np.array(
        [0.8, 0.75, 0.9, 1.0, 1.05, 1.0, 0.95, 0.95, 1.0, 1.1, 1.6, 1.9]
    )
    rows = []
    for day in DAYS_2025:
        n = rng.poisson(
            14
            * month_weight[day.month - 1]
            * (1.15 if day.dayofweek >= 5 else 1.0)
        )
        for _ in range(n):
            cust = customers.iloc[rng.integers(0, 1200)]
            garden = 2.5 if day.month in (4, 5, 6) else 0.6
            cat_p = np.array([1.0, 1.0, 0.9, 0.8, garden])
            cat = rng.choice(list(catalog), p=cat_p / cat_p.sum())
            name, price = catalog[cat][rng.integers(0, 3)]
            discount = rng.choice([0.0, 0.1, 0.2], p=[0.7, 0.2, 0.1])
            qty = 1 + rng.poisson(
                0.4
                + discount * 2
                + (1.0 if cust.segment == "Business" else 0)
            )
            rows.append(
                (
                    day,
                    cust.customer_id,
                    cust.region,
                    rng.choice(
                        ["web", "app", "marketplace"], p=[0.5, 0.3, 0.2]
                    ),
                    cat,
                    name,
                    int(qty),
                    price,
                    discount,
                )
            )
    orders = pd.DataFrame(
        rows,
        columns=[
            "order_date",
            "customer_id",
            "region",
            "channel",
            "category",
            "product",
            "quantity",
            "unit_price",
            "discount",
        ],
    )
    orders.insert(
        0, "order_id", [f"L{i:05d}" for i in range(1, len(orders) + 1)]
    )

    raw = orders.sample(300, random_state=7).sort_values("order_id").copy()
    raw["region"] = [
        r.lower() if i % 4 == 0 else r + " " if i % 7 == 0 else r
        for i, r in enumerate(raw["region"])
    ]
    raw["unit_price"] = [f"${p:.2f}" for p in raw["unit_price"]]
    raw["order_date"] = [
        d.strftime("%d/%m/%Y" if i % 5 == 0 else "%Y-%m-%d")
        for i, d in enumerate(raw["order_date"])
    ]
    raw = raw.astype({"quantity": "object"})
    raw.loc[raw.index[::23], "quantity"] = None
    raw.loc[raw.index[50], "quantity"] = 400
    raw = pd.concat([raw, raw.iloc[[10, 20, 30]]]).sort_values("order_id")
    return products, customers, orders, raw


def survey():
    """A customer survey: ratings, a 0-10 'would you recommend' score
    and a free-text comment."""
    n = 800
    plan = rng.choice(["Basic", "Plus", "Pro"], n, p=[0.5, 0.3, 0.2])
    base = np.select([plan == "Basic", plan == "Plus"], [3.2, 3.7], 4.0)
    sat = np.clip(np.round(base + rng.normal(0, 0.9, n)), 1, 5).astype(int)
    recommend = np.clip(
        np.round(sat * 2 + rng.normal(0, 1.3, n)), 0, 10
    ).astype(int)
    good = ["easy to use", "great support", "fast delivery", "good value"]
    bad = ["too slow", "price is high", "support was slow", "confusing app"]
    comments = [
        rng.choice(good)
        if s >= 4
        else rng.choice(bad)
        if s <= 2
        else rng.choice(good + bad + [""])
        for s in sat
    ]
    return pd.DataFrame(
        {
            "respondent": range(1, n + 1),
            "date": rng.choice(
                pd.date_range("2025-09-01", "2025-09-30"), n
            ),
            "age_group": rng.choice(["18-29", "30-44", "45-59", "60+"], n),
            "plan": plan,
            "satisfaction": sat,
            "recommend": recommend,
            "comment": comments,
        }
    ).sort_values(["date", "respondent"])


def sessions():
    """An A/B test of a new checkout page: B converts a little better."""
    n = 20_000
    variant = rng.choice(["A", "B"], n)
    device = rng.choice(["desktop", "mobile"], n, p=[0.45, 0.55])
    rate = np.where(variant == "B", 0.046, 0.040) * np.where(
        device == "mobile", 0.85, 1.2
    )
    converted = rng.random(n) < rate
    revenue = np.where(converted, np.round(rng.gamma(3, 22, n), 2), 0.0)
    return pd.DataFrame(
        {
            "session": range(1, n + 1),
            "date": rng.choice(
                pd.date_range("2025-10-01", "2025-10-28"), n
            ),
            "variant": variant,
            "device": device,
            "pages": 1 + rng.poisson(np.where(converted, 6, 3)),
            "converted": converted.astype(int),
            "revenue": revenue,
        }
    )


def prices():
    """Daily closing prices for three fictional companies and an index."""
    days = pd.bdate_range("2024-01-01", "2025-12-31")
    market = rng.normal(0.0003, 0.009, len(days))
    out = {"date": days}
    for ticker, beta, vol, start in [
        ("ALDR", 0.8, 0.010, 52.0),
        ("BRKN", 1.4, 0.018, 31.0),
        ("CDLX", 0.5, 0.007, 120.0),
    ]:
        daily = beta * market + rng.normal(0.0002, vol, len(days))
        out[ticker] = np.round(start * np.exp(np.cumsum(daily)), 2)
    out["INDEX"] = np.round(1000 * np.exp(np.cumsum(market)), 2)
    return pd.DataFrame(out)


def health():
    """Daily fine-particle pollution (PM2.5) and clinic visits for
    breathing problems in three cities; visits follow pollution with a
    delay of about two days."""
    air, visits = [], []
    for city, level, size in [
        ("Avonford", 18, 1.0),
        ("Brightwater", 30, 1.6),
        ("Cedarvale", 12, 0.7),
    ]:
        doy = DAYS_2025.dayofyear.to_numpy()
        season = 1 + 0.45 * np.cos((doy - 15) / 365 * 2 * np.pi)
        pm = np.clip(
            level * season * rng.lognormal(0, 0.3, len(DAYS_2025)), 2, None
        )
        pm[rng.random(len(pm)) < 0.02] = np.nan  # sensor outages
        lagged = pd.Series(pm).ffill().shift(2).bfill().to_numpy()
        weekday = np.where(DAYS_2025.dayofweek == 6, 0.6, 1.0)
        mean = size * (8 + 0.35 * lagged) * weekday
        air += zip(DAYS_2025, [city] * len(pm), np.round(pm, 1))
        visits += zip(DAYS_2025, [city] * len(pm), rng.poisson(mean))
    return (
        pd.DataFrame(air, columns=["date", "city", "pm25"]),
        pd.DataFrame(visits, columns=["date", "city", "visits"]),
    )


def budget():
    """One household's bank transactions for 2025."""
    rows = []
    for day in DAYS_2025:
        if day.day == 1:
            rows += [
                (day, "SALARY BRIGHTCO LTD", 4200.00),
                (day, "RENT MAPLE HOUSING", -1450.00),
            ]
        if day.day == 15:
            rows.append(
                (
                    day,
                    "CITY POWER & WATER",
                    -round(90 + 40 * (day.month in (1, 2, 12, 7, 8)), 2),
                )
            )
        if day.dayofweek == 5:
            rows.append(
                (
                    day,
                    f"FRESHMART #{rng.integers(10, 40)}",
                    -round(rng.uniform(60, 140), 2),
                )
            )
        if rng.random() < 0.25:
            rows.append(
                (
                    day,
                    rng.choice(["CAFE LUMA", "BEAN & LEAF CAFE"]),
                    -round(rng.uniform(3, 9), 2),
                )
            )
        if rng.random() < 0.08:
            rows.append(
                (
                    day,
                    rng.choice(["METRO TRANSIT", "RIDESHARE TRIP"]),
                    -round(rng.uniform(2.5, 25), 2),
                )
            )
        if rng.random() < 0.05:
            rows.append(
                (day, "ONLINE STORE ORDER", -round(rng.uniform(15, 180), 2))
            )
        if day.day == 20:
            rows.append((day, "STREAMFLIX SUBSCRIPTION", -12.99))
    return pd.DataFrame(rows, columns=["date", "description", "amount"])


if __name__ == "__main__":
    products, customers, orders, raw = shop()
    products.to_csv("products.csv", index=False)
    customers.to_csv("customers.csv", index=False)
    orders.to_csv("orders.csv", index=False)
    raw.to_csv("orders_raw.csv", index=False)
    survey().to_csv("survey.csv", index=False)
    sessions().to_csv("sessions.csv", index=False)
    prices().to_csv("prices.csv", index=False)
    air, visits = health()
    air.to_csv("air_quality.csv", index=False)
    visits.to_csv("clinic_visits.csv", index=False)
    budget().to_csv("budget.csv", index=False)
    for name, table in [
        ("orders", orders),
        ("customers", customers),
        ("products", products),
        ("orders_raw", raw),
    ]:
        print(f"{name + '.csv':<18} {len(table):>6,} rows")
    print("survey.csv, sessions.csv, prices.csv, air_quality.csv,")
    print("clinic_visits.csv and budget.csv written too")
