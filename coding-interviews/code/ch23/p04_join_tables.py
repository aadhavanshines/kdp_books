"""23.4 Join Two Tables: orders.csv and customers.csv arrive as text.
Produce (order_id, customer_name, amount) for every order, sorted by
order_id; customers missing from the second table are "UNKNOWN"
(a left join)."""

import csv
import io


def join_tables(orders_csv, customers_csv):
    names = {}
    for row in csv.DictReader(io.StringIO(customers_csv)):
        names[row["customer_id"]] = row["name"]  # O(1) lookups later
    out = []
    for row in csv.DictReader(io.StringIO(orders_csv)):
        out.append(
            (
                int(row["order_id"]),
                names.get(row["customer_id"], "UNKNOWN"),
                float(row["amount"]),
            )
        )
    return sorted(out)


def join_tables_nested(orders_csv, customers_csv):
    customers = list(csv.DictReader(io.StringIO(customers_csv)))
    out = []
    for o in csv.DictReader(io.StringIO(orders_csv)):
        name = "UNKNOWN"
        for c in customers:  # O(orders x customers)
            if c["customer_id"] == o["customer_id"]:
                name = c["name"]
        out.append((int(o["order_id"]), name, float(o["amount"])))
    return sorted(out)


ORDERS = "order_id,customer_id,amount\n3,c2,9.50\n1,c1,20\n2,c9,5\n"
CUSTOMERS = 'customer_id,name\nc1,Asha\nc2,"Lee, Jordan"\n'
SOLUTIONS = [join_tables, join_tables_nested]
EXAMPLES = [
    (
        (ORDERS, CUSTOMERS),
        [(1, "Asha", 20.0), (2, "UNKNOWN", 5.0), (3, "Lee, Jordan", 9.5)],
    )
]


def random_case(rng):
    cust = {f"c{i}": rng.choice(["Ana", "Bo", "Cy, Jr"]) for i in range(4)}
    cl = ["customer_id,name"] + [f'{k},"{v}"' for k, v in cust.items()]
    ol = ["order_id,customer_id,amount"]
    for i in rng.sample(range(50), rng.randint(0, 8)):
        ol.append(f"{i},c{rng.randint(0, 6)},{rng.randint(1, 99)}")
    return ("\n".join(ol) + "\n", "\n".join(cl) + "\n")
