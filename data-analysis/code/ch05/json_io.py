import json

import pandas as pd

products = pd.read_csv("../data/products.csv")
products.head(2).to_json("products.json", orient="records", indent=2)
print(open("products.json").read())

# Nested JSON, as many web services return it, flattened into columns
reply = json.loads("""
[{"id": 1, "customer": {"name": "Asha", "city": "Pune"}, "total": 42.5},
 {"id": 2, "customer": {"name": "Ben", "city": "Leeds"}, "total": 18.0}]
""")
print(pd.json_normalize(reply))
