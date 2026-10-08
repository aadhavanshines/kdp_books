import os, json
import pandas as pd, matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
os.makedirs('output', exist_ok=True)
d = pd.read_csv('data/orders.csv', parse_dates=['date'])
d['m'] = d.date.dt.strftime('%Y-%m')
mr = d.groupby('m').amount.sum(); best = mr.idxmax()
tp = d.groupby('product').amount.sum().sort_values(ascending=False)
a = d[d.date.between('2025-10-01', '2025-12-31')].area.value_counts()
b = d[d.date.between('2026-07-01', '2026-09-30')].area.value_counts()
g = ((b - a) / a * 100).round(1).sort_values(ascending=False)
c = d[d.category == 'cake']
def eg(s, e):
    x = c[c.date.between(s, e)]
    return round((x.eggless == 'yes').mean() * 100, 1)
egg = {'oct_dec_2025': eg('2025-10-01', '2025-12-31'), 'jul_sep_2026': eg('2026-07-01', '2026-09-30')}
rc = d.groupby('channel').rating.mean().round(2)
res = dict(monthly_revenue=mr.to_dict(), best_month=best, top_products=list(tp.index[:5]),
           top_rev=tp.head(5).to_dict(), fastest_growing_area=g.index[0],
           area_growth_percent=g.to_dict(), area_counts=dict(a=a.to_dict(), b=b.to_dict()),
           eggless_share_percent=egg, rating_by_channel=rc.to_dict(), total=int(d.amount.sum()))
print(json.dumps(res, indent=1))
plt.figure(figsize=(9, 4)); mr.plot.bar(color='#c0623b'); plt.title('Monthly revenue (Rs.)'); plt.tight_layout(); plt.savefig('output/monthly-revenue.png', dpi=120)
plt.figure(figsize=(7, 4)); g.plot.bar(color='#3b7a57'); plt.title('Order growth, Oct-Dec 2025 vs Jul-Sep 2026 (%)'); plt.xticks(rotation=0); plt.tight_layout(); plt.savefig('output/area-growth.png', dpi=120)
plt.figure(figsize=(8, 4)); tp.head(5)[::-1].plot.barh(color='#6b4aa0'); plt.title('Top 5 products by revenue (Rs.)'); plt.tight_layout(); plt.savefig('output/top-products.png', dpi=120)
