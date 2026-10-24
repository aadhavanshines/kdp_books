import sqlite3

import pandas as pd

conn = sqlite3.connect(":memory:")
pd.read_csv("../data/orders.csv").to_sql("orders", conn, index=False)
pd.read_csv("../data/customers.csv").to_sql("customers", conn, index=False)
print(
    pd.read_sql(
        """
SELECT c.segment, COUNT(DISTINCT o.customer_id) AS buyers,
       ROUND(AVG(o.quantity), 2) AS avg_qty
FROM orders AS o JOIN customers AS c USING (customer_id)
GROUP BY c.segment
""",
        conn,
    )
)
