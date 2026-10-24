import sqlite3

import pandas as pd

orders = pd.read_csv("../data/orders.csv")
with sqlite3.connect("shop.db") as conn:
    orders.to_sql("orders", conn, if_exists="replace", index=False)
    top = pd.read_sql(
        """SELECT region, COUNT(*) AS orders, SUM(quantity) AS units
           FROM orders GROUP BY region ORDER BY units DESC""",
        conn,
    )
print(top)
