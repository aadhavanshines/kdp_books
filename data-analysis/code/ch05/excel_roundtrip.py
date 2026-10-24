import pandas as pd

products = pd.read_csv("../data/products.csv")
customers = pd.read_csv("../data/customers.csv")

# One workbook, two sheets
with pd.ExcelWriter("shop.xlsx") as writer:
    products.to_excel(writer, sheet_name="Products", index=False)
    customers.to_excel(writer, sheet_name="Customers", index=False)

sheets = pd.read_excel("shop.xlsx", sheet_name=None)  # None: every sheet
for name, table in sheets.items():
    print(f"{name}: {table.shape[0]} rows, {table.shape[1]} columns")
print(sheets["Products"].head(3))
