import pandas as pd
import pytest

from metrics import add_revenue, top_products

SAMPLE = pd.DataFrame(
    {
        "product": ["Lamp", "Mug", "Lamp"],
        "quantity": [2, 1, 1],
        "unit_price": [40.0, 10.0, 40.0],
        "discount": [0.0, 0.5, 0.1],
    }
)


def test_revenue_applies_discount():
    assert add_revenue(SAMPLE)["revenue"].tolist() == [80.0, 5.0, 36.0]


def test_input_is_not_changed():
    add_revenue(SAMPLE)
    assert "revenue" not in SAMPLE.columns


def test_top_products_order():
    top = top_products(SAMPLE, n=2)
    assert list(top.index) == ["Lamp", "Mug"]
    assert top["Lamp"] == pytest.approx(116.0)
