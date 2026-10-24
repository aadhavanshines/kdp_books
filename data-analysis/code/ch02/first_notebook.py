# %% [markdown]
# # My First Notebook
# A first look at Larkspur Home's orders.

# %%
import pandas as pd

orders = pd.read_csv("../data/orders.csv")
len(orders)

# %%
orders[["order_id", "product", "quantity", "unit_price"]].head(3)

# %%
orders["revenue"] = orders["quantity"] * orders["unit_price"]
by_category = orders.groupby("category")["revenue"].sum()
by_category.sort_values()

# %%
ax = by_category.sort_values().plot.barh(title="Revenue by category")
