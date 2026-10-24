import pandas as pd

customers = pd.read_csv(
    "../data/customers.csv", parse_dates=["signup_date"]
)
recent = customers.query(
    "segment == 'Business' and signup_date >= '2025-01-01'"
)
print(len(recent))
print(
    recent.sort_values("signup_date").head(3)[
        ["customer_id", "signup_date"]
    ]
)
