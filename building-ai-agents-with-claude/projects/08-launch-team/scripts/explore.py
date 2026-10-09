import csv
from collections import Counter, defaultdict
from datetime import date, timedelta

rows = list(csv.DictReader(open('data/orders.csv')))
print('rows', len(rows))
for r in rows:
    r['d'] = date.fromisoformat(r['date'])
    r['amt'] = float(r['amount'])
    r['qty'] = float(r['quantity'])
ds = [r['d'] for r in rows]
print('range', min(ds), max(ds))
print('ids unique', len({r['order_id'] for r in rows}))
print('categories', Counter(r['category'] for r in rows))
print('areas', Counter(r['area'] for r in rows))
print('eggless', Counter(r['eggless'] for r in rows))
print('channels', Counter(r['channel'] for r in rows))
print('blank fields', {k: sum(1 for r in rows if r[k] == '') for k in rows[0] if k not in ('d', 'amt', 'qty')})
print('neg/zero amt', [r['order_id'] for r in rows if r['amt'] <= 0])
# by month
m = defaultdict(lambda: [0, 0.0])
for r in rows:
    k = r['date'][:7]
    m[k][0] += 1
    m[k][1] += r['amt']
for k in sorted(m):
    print(k, m[k])
# duplicates
c = Counter(r['order_id'] for r in rows)
print('dups', [k for k, v in c.items() if v > 1])
