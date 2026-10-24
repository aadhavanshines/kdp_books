"""Reusable calculations for the shop reports."""

import pandas as pd


def add_revenue(orders: pd.DataFrame) -> pd.DataFrame:
    """Return a copy with a revenue column: quantity x price, less
    the discount."""
    out = orders.copy()
    out["revenue"] = (
        out["quantity"] * out["unit_price"] * (1 - out["discount"])
    )
    return out


def top_products(orders: pd.DataFrame, n: int = 3) -> pd.Series:
    """The n products with the most revenue, largest first."""
    revenue = add_revenue(orders).groupby("product")["revenue"].sum()
    return revenue.nlargest(n)
