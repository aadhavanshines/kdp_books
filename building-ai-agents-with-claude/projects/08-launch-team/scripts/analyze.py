import csv, statistics
from collections import Counter, defaultdict
from datetime import date, timedelta

rows = list(csv.DictReader(open('data/orders.csv')))
for r in rows:
    r['d'] = date.fromisoformat(r['date'])
    r['amt'] = float(r['amount'])
    r['qty'] = float(r['quantity'])
    r['del'] = float(r['delivery_charge'])


def tot(rs):
    return len(rs), sum(r['amt'] for r in rs)


# --- Diwali week
s, e = date(2025, 10, 14), date(2025, 10, 21)
diw = [r for r in rows if s <= r['d'] <= e]
print('Diwali 14-21 Oct (8 days incl.):', tot(diw))
d7 = [r for r in rows if s <= r['d'] <= date(2025, 10, 20)]
print('14-20 Oct (7 days):', tot(d7))
for d in range(1, 31):
    day = date(2025, 10, d)
    print(day, tot([r for r in rows if r['d'] == day]))

# baseline: all days outside 14-21 Oct, scaled to 8 days and 7 days
other = [r for r in rows if not (s <= r['d'] <= e)]
ndays = (max(r['d'] for r in rows) - min(r['d'] for r in rows)).days + 1 - 8
n, a = tot(other)
print('non-Diwali days', ndays, 'orders/day', n / ndays, 'rev/day', a / ndays)
print('normal 8-day', n / ndays * 8, a / ndays * 8)
print('normal 7-day', n / ndays * 7, a / ndays * 7)
print('Diwali rev/day', tot(diw)[1] / 8, 'multiple', (tot(diw)[1] / 8) / (a / ndays))
# preceding 8 days and 7-13 Oct
prev = [r for r in rows if date(2025, 10, 6) <= r['d'] <= date(2025, 10, 13)]
print('prior 8 days 6-13 Oct', tot(prev))
# median weekly (Mon-start) revenue excl Diwali week
wk = defaultdict(float)
for r in rows:
    wk[r['d'] - timedelta(days=r['d'].weekday())] += r['amt']
print('weekly median', statistics.median(wk.values()), 'mean', statistics.mean(wk.values()))
# Diwali product mix
print('Diwali by category', Counter(r['category'] for r in diw))
print('Diwali hampers', [(r['d'].isoformat(), r['amt']) for r in rows if r['category'] == 'hamper' and s <= r['d'] <= e][:5])

# --- best sellers (whole period)
byp = defaultdict(lambda: [0, 0.0, 0.0])
for r in rows:
    p = byp[r['product']]
    p[0] += 1
    p[1] += r['qty']
    p[2] += r['amt']
print('\nBest sellers by orders / revenue (all 12 months):')
for k, v in sorted(byp.items(), key=lambda x: -x[1][0]):
    print(f'{k:35s} orders={v[0]:4d} qty={v[1]:7.1f} rev={v[2]:9.0f}')
print('\nDiwali week best sellers:')
dp = defaultdict(lambda: [0, 0.0])
for r in diw:
    dp[r['product']][0] += 1
    dp[r['product']][1] += r['amt']
for k, v in sorted(dp.items(), key=lambda x: -x[1][0]):
    print(f'{k:35s} orders={v[0]:4d} rev={v[1]:9.0f}')

# hampers
h = [r for r in rows if r['category'] == 'hamper']
print('\nhampers', len(h), Counter(r['product'] for r in h), 'avg amt', statistics.mean(r['amt'] / r['qty'] for r in h))
print('hamper by month', sorted(Counter(r['date'][:7] for r in h).items()))
print('hamper rating', statistics.mean(int(r['rating']) for r in h))
print('hamper areas', Counter(r['area'] for r in h))

# --- eggless share of cake orders latest 3 months (Jul-Sep 2026)
mx = max(r['d'] for r in rows)
print('\nlatest date', mx)
cut = date(2026, 7, 1)
cakes = [r for r in rows if r['category'] == 'cake' and r['d'] >= cut]
ey = sum(1 for r in cakes if r['eggless'] == 'yes')
print('cake orders Jul-Sep 2026', len(cakes), 'eggless', ey, ey / len(cakes) * 100)
for lbl, lo, hi in [('Jul', date(2026, 7, 1), date(2026, 7, 31)), ('Aug', date(2026, 8, 1), date(2026, 8, 31)), ('Sep', date(2026, 9, 1), date(2026, 9, 30))]:
    c = [r for r in rows if r['category'] == 'cake' and lo <= r['d'] <= hi]
    print(lbl, len(c), sum(1 for r in c if r['eggless'] == 'yes') / len(c) * 100)
# earlier 3 months for comparison, and by-quarter
for lbl, lo, hi in [('Oct-Dec25', date(2025, 10, 1), date(2025, 12, 31)), ('Jan-Mar26', date(2026, 1, 1), date(2026, 3, 31)), ('Apr-Jun26', date(2026, 4, 1), date(2026, 6, 30))]:
    c = [r for r in rows if r['category'] == 'cake' and lo <= r['d'] <= hi]
    print(lbl, len(c), round(sum(1 for r in c if r['eggless'] == 'yes') / len(c) * 100, 1))
# all categories eggless latest 3 months
al = [r for r in rows if r['d'] >= cut]
print('all-category eggless share Q', len(al), sum(1 for r in al if r['eggless'] == 'yes') / len(al) * 100)

# --- fastest growing area: first 3 vs last 3 months, and H1 vs H2
def area_stats(lo, hi):
    c = Counter()
    rv = defaultdict(float)
    for r in rows:
        if lo <= r['d'] <= hi:
            c[r['area']] += 1
            rv[r['area']] += r['amt']
    return c, rv

print('\nArea growth')
periods = {
    'first3 (Oct-Dec25)': (date(2025, 10, 1), date(2025, 12, 31)),
    'prev3 (Apr-Jun26)': (date(2026, 4, 1), date(2026, 6, 30)),
    'last3 (Jul-Sep26)': (date(2026, 7, 1), date(2026, 9, 30)),
    'H1 (Oct-Mar)': (date(2025, 10, 1), date(2026, 3, 31)),
    'H2 (Apr-Sep)': (date(2026, 4, 1), date(2026, 9, 30)),
}
st = {k: area_stats(*v) for k, v in periods.items()}
for a in sorted({r['area'] for r in rows}):
    line = f'{a:12s}'
    for k in periods:
        line += f' {k}: {st[k][0][a]:4d}/{st[k][1][a]:8.0f}'
    print(line)
print('growth last3 vs prev3 (orders, revenue), last3 vs first3, H2 vs H1')
for a in sorted({r['area'] for r in rows}):
    def g(x, y, i):
        return (st[x][i][a] / st[y][i][a] - 1) * 100
    print(f'{a:12s} prev->last orders {g("last3 (Jul-Sep26)", "prev3 (Apr-Jun26)", 0):6.1f}% rev {g("last3 (Jul-Sep26)", "prev3 (Apr-Jun26)", 1):6.1f}% | first->last orders {g("last3 (Jul-Sep26)", "first3 (Oct-Dec25)", 0):6.1f}% rev {g("last3 (Jul-Sep26)", "first3 (Oct-Dec25)", 1):6.1f}% | H2/H1 orders {g("H2 (Apr-Sep)", "H1 (Oct-Mar)", 0):6.1f}% rev {g("H2 (Apr-Sep)", "H1 (Oct-Mar)", 1):6.1f}%')
print('\nmonthly orders by area')
months = sorted({r['date'][:7] for r in rows})
print('month   ' + ' '.join(f'{a[:8]:>8s}' for a in sorted({r['area'] for r in rows})))
for mth in months:
    print(mth, ' '.join(f'{sum(1 for r in rows if r["date"][:7] == mth and r["area"] == a):8d}' for a in sorted({r['area'] for r in rows})))

# delivery charges by area, and amount vs delivery
print('\ndelivery charge by area', {a: sorted(Counter(r['del'] for r in rows if r['area'] == a).items()) for a in sorted({r['area'] for r in rows})})
# order value
print('avg order value', statistics.mean(r['amt'] for r in rows))
# 1kg cake price points
for p in sorted({r['product'] for r in rows if r['category'] == 'cake'}):
    u = sorted({round(r['amt'] / r['qty'], 1) for r in rows if r['product'] == p})
    print(p, 'unit price(s)', u[:6])
print('avg rating', statistics.mean(int(r['rating']) for r in rows))
print('channel share', {k: round(v / len(rows) * 100, 1) for k, v in Counter(r['channel'] for r in rows).items()})
