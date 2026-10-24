import numpy as np

prices = np.array([45.0, 60.0, 24.0, 70.0, 35.0])
quantities = np.array([2, 1, 4, 1, 3])

print(prices.dtype, prices.shape)
print(prices * quantities)  # element by element
print((prices * quantities).sum())  # total
print(prices[prices > 40])  # a boolean mask selects items
print(np.round(prices * 1.08, 2))  # every price plus 8% tax

grid = np.arange(12).reshape(3, 4)
print(grid)
print(grid.sum(axis=0))  # down each column
print(grid.sum(axis=1))  # across each row
