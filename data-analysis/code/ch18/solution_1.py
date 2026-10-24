import sqlite3

import pandas as pd

conn = sqlite3.connect(":memory:")
pd.read_csv("../data/orders.csv").to_sql("orders", conn, index=False)
print(
    pd.read_sql(
        """
SELECT strftime('%m', order_date) AS month, COUNT(*) AS orders
FROM orders
GROUP BY month
ORDER BY orders DESC
LIMIT 3
""",
        conn,
    )
)
