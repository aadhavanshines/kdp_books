import sqlite3

import pandas as pd

conn = sqlite3.connect(":memory:")  # a database that lives in memory
pd.read_csv("../data/orders.csv").to_sql("orders", conn, index=False)
pd.read_csv("../data/products.csv").to_sql("products", conn, index=False)


def sql(query):
    print(pd.read_sql(query, conn))
    print()


sql("""
SELECT category, COUNT(*) AS orders, ROUND(AVG(quantity), 2) AS avg_qty
FROM orders
WHERE channel = 'app'
GROUP BY category
HAVING COUNT(*) > 300
ORDER BY orders DESC
""")

sql("""
SELECT o.product,
       ROUND(SUM(o.quantity * (o.unit_price - p.unit_cost)), 0) AS profit
FROM orders AS o
JOIN products AS p ON p.product = o.product
GROUP BY o.product
ORDER BY profit DESC
LIMIT 3
""")

sql("""
SELECT * FROM (
  SELECT region, product, SUM(quantity) AS units,
         RANK() OVER (PARTITION BY region
                      ORDER BY SUM(quantity) DESC) AS rnk
  FROM orders
  GROUP BY region, product
) WHERE rnk = 1
""")
