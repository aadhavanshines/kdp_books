import numpy as np

# Monthly sales (rows) for three stores (columns)
sales = np.array([[120, 95, 60], [130, 90, 75], [150, 110, 80]])
targets = np.array([125, 100, 70])  # one target per store

print(sales - targets)  # the 1-D targets stretch to every row
print(sales >= targets)
print((sales >= targets).mean(axis=0).round(2))  # months on target
print((sales / sales.sum(axis=1, keepdims=True)).round(2))  # shares
