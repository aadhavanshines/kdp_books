import csv, collections, datetime as dt, statistics as st
rows = list(csv.DictReader(open('data/orders.csv')))
for r in rows:
    r['d'] = dt.date.fromisoformat(r['date']); r['amt'] = float(r['amount']); r['q'] = float(r['quantity'])
def win(a, b): return [r for r in rows if a <= r['d'] <= b]
def tot(sel): return len(sel), sum(r['amt'] for r in sel)

# 1. Diwali vs normal
D0, D1 = dt.date(2025,10,14), dt.date(2025,10,21)
dw = win(D0, D1); n, s = tot(dw); days = 8
print('Diwali 8d orders, revenue, per-day', n, s, s/days, n/days)
print('Diwali 7d-equivalent revenue', s/days*7, 'orders', n/days*7)
xmas = (dt.date(2025,12,18), dt.date(2025,12,25))
normal = [r for r in rows if not (D0 <= r['d'] <= D1) and not (xmas[0] <= r['d'] <= xmas[1])]
nd = len({r['d'] for r in normal}); nn, ns = tot(normal)
print('Normal days', nd, 'per-week revenue', ns/nd*7, 'orders', nn/nd*7)
print('Uplift revenue %', (s/days)/(ns/nd)*100-100, 'orders %', (n/days)/(nn/nd)*100-100)
# all-days baseline incl. xmas, and 7 days before Diwali, and weekly medians
alld = [r for r in rows if not (D0 <= r['d'] <= D1)]
print('Baseline incl xmas per-week rev', tot(alld)[1]/len({r['d'] for r in alld})*7)
pre = win(dt.date(2025,10,7), dt.date(2025,10,13)); print('Week 7-13 Oct', tot(pre))
wk = collections.defaultdict(float)
for r in rows: wk[(r['d']-dt.date(2025,10,1)).days//7] += r['amt']
full = [v for k, v in wk.items() if k < 52]
print('median full-week revenue', st.median(full), 'mean', st.mean(full))
# Diwali uplift by category and by product
for key in ('category','product'):
    a = collections.Counter(); b = collections.Counter()
    for r in dw: a[r[key]] += r['amt']
    for r in normal: b[r[key]] += r['amt']/nd*7
    print(key, 'Diwali(8d) vs normal week rev')
    for k in sorted(a, key=lambda k:-a[k]): print('  ', k, a[k], round(b[k]), round(a[k]/b[k],2) if b[k] else None)

# 2. Best sellers, whole year, by revenue and units; and Diwali week
for label, sel in (('year', rows), ('diwali', dw), ('latest3m', win(dt.date(2026,7,1), dt.date(2026,9,30)))):
    c = collections.Counter(); rev = collections.Counter(); o = collections.Counter()
    for r in sel: c[r['product']] += r['q']; rev[r['product']] += r['amt']; o[r['product']] += 1
    print(label, 'by revenue:', [(k, v, o[k]) for k, v in rev.most_common()])
# hamper
h = [r for r in rows if r['category']=='hamper']
print('hampers', tot(h), 'by month', sorted(collections.Counter(r['d'].strftime('%Y-%m') for r in h).items()))
print('hamper in diwali', tot([r for r in dw if r['category']=='hamper']))
print('hamper avg price', tot(h)[1]/sum(r['q'] for r in h), 'qty values', collections.Counter(r['q'] for r in h))

# 3. Eggless share of cakes, Jul-Sep 2026
cl = [r for r in win(dt.date(2026,7,1), dt.date(2026,9,30)) if r['category']=='cake']
e = sum(r['eggless']=='yes' for r in cl)
print('cake orders Jul-Sep 2026', len(cl), 'eggless', e, round(e/len(cl)*100,1))
for m in ('2026-07','2026-08','2026-09'):
    c = [r for r in cl if r['d'].strftime('%Y-%m')==m]; print(m, len(c), sum(r['eggless']=='yes' for r in c), round(sum(r['eggless']=='yes' for r in c)/len(c)*100,1))
allc = [r for r in rows if r['category']=='cake']; print('full-year cake eggless %', round(sum(r['eggless']=='yes' for r in allc)/len(allc)*100,1))
ec = collections.Counter(r['product'] for r in cl if r['eggless']=='yes'); print('eggless cake by product', ec.most_common())
print('eggless share by category all-year', {c: round(sum(r['eggless']=='yes' for r in rows if r['category']==c)/sum(1 for r in rows if r['category']==c)*100,1) for c in ('cake','brownies','cupcakes','hamper')})
print('eggless share Oct-Dec 2025 cakes', round(sum(r['eggless']=='yes' for r in win(dt.date(2025,10,1),dt.date(2025,12,31)) if r['category']=='cake')/len([r for r in win(dt.date(2025,10,1),dt.date(2025,12,31)) if r['category']=='cake'])*100,1))

# 4. Area growth
def area_tot(a,b):
    c = collections.Counter(); o = collections.Counter()
    for r in win(a,b): c[r['area']] += r['amt']; o[r['area']] += 1
    return c, o
periods = {'Q4-25':(dt.date(2025,10,1),dt.date(2025,12,31)),'Q1-26':(dt.date(2026,1,1),dt.date(2026,3,31)),'Q2-26':(dt.date(2026,4,1),dt.date(2026,6,30)),'Q3-26':(dt.date(2026,7,1),dt.date(2026,9,30))}
res = {k: area_tot(*v) for k, v in periods.items()}
for a in sorted({r['area'] for r in rows}):
    print(a, 'orders', [res[k][1][a] for k in periods], 'revenue', [res[k][0][a] for k in periods],
          'Q3 vs Q4 orders %', round((res['Q3-26'][1][a]/res['Q4-25'][1][a]-1)*100,1), 'rev %', round((res['Q3-26'][0][a]/res['Q4-25'][0][a]-1)*100,1),
          'Q3 vs Q2 orders %', round((res['Q3-26'][1][a]/res['Q2-26'][1][a]-1)*100,1))
# H2 vs H1 and last 3 vs prior 3 months
for a in sorted({r['area'] for r in rows}):
    l3 = tot([r for r in win(dt.date(2026,7,1),dt.date(2026,9,30)) if r['area']==a]); p3 = tot([r for r in win(dt.date(2026,4,1),dt.date(2026,6,30)) if r['area']==a])
    y = tot([r for r in win(dt.date(2025,10,1),dt.date(2025,12,31)) if r['area']==a])
    print(a, 'latest3', l3, 'prior3', p3)
om = [r for r in rows if r['area']=='OMR']
print('OMR delivery charges', collections.Counter(r['delivery_charge'] for r in om), 'all', collections.Counter((r['area'], r['delivery_charge']) for r in rows))
print('monthly OMR', sorted(collections.Counter(r['d'].strftime('%Y-%m') for r in om).items()))
# area share of orders in Q3, and Diwali week
print('Diwali week orders by area', collections.Counter(r['area'] for r in dw))
