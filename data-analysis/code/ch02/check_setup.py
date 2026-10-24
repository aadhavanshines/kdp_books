import matplotlib
import numpy
import openpyxl
import pandas

for module in (numpy, pandas, matplotlib, openpyxl):
    print(f"{module.__name__:<11} {module.__version__}")
