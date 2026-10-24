import numpy as np

temps = np.array([[12, 15, 14, 18], [20, 22, 21, 19], [8, 9, 11, 10]])
print(temps.mean(axis=1))  # average per city (row)
print(temps.max(axis=0))  # warmest reading per day (column)
print((temps > 15).sum())  # readings above 15
