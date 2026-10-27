---
name: expense-log
description: Record an expense in expenses.csv and report totals by
  category for a month.
---
# Expense Log

The file `expenses.csv` has the header `date,amount,category,note`.

- To record an expense: read the file with read_file (create it with the
  header if it is missing), add one line with today's date, and save it
  with write_file. Use one of: food, transport, home, health, fun, other.
- To report totals for a month, run the skill's own script with
  run_command, from the files folder:

  python3 /skills/expense-log/totals.py 2026-10

  Then reply with the totals, largest first, and the grand total.
