import csv, collections, datetime as dt
rows = list(csv.DictReader(open('data/orders.csv')))
print('rows', len(rows))
for c in rows[0]:
    vals = [r[c] for r in rows]
    print(c, 'blank', sum(v.strip() == '' for v in vals), 'distinct', len(set(vals)))
print('ids dup', len(rows) - len({r['order_id'] for r in rows}))
for c in ('area', 'category', 'eggless', 'channel', 'product'):
    print(c, collections.Counter(r[c] for r in rows).most_common())
D = lambda r: dt.date.fromisoformat(r['date'])
ds = [D(r) for r in rows]
print('date range', min(ds), max(ds))
bymonth = collections.Counter(d.strftime('%Y-%m') for d in ds)
print(sorted(bymonth.items()))
am = [float(r['amount']) for r in rows]
print('amount min/max', min(am), max(am))

def week(a, b):
    sel = [r for r in rows if a <= D(r) <= b]
    return len(sel), sum(float(r['amount']) for r in sel), sel
d0, d1 = dt.date(2025, 10, 14), dt.date(2025, 10, 21)
n, s, sel = week(d0, d1)
print('Diwali 14-21 (8 days inclusive)', n, s)
# daily
daily = collections.defaultdict(lambda: [0, 0.0])
for r in rows:
    daily[D(r)][0] += 1; daily[D(r)][1] += float(r['amount'])
for d in sorted(daily): print(d, daily[d])
# 7-day windows
n7, s7, _ = week(dt.date(2025, 10, 14), dt.date(2025, 10, 20))
print('14-20 (7 days)', n7, s7)
