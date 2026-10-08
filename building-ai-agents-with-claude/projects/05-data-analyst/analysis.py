import os, json
import pandas as pd
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt

os.makedirs('output', exist_ok=True)
d = pd.read_csv('data/orders.csv', parse_dates=['date'])
d['m'] = d.date.dt.to_period('M').astype(str)
mr = d.groupby('m').amount.sum()
best = mr.idxmax()
tp = d.groupby('product').amount.sum().sort_values(ascending=False)
a = d[(d.date >= '2025-10-01') & (d.date <= '2025-12-31')].area.value_counts()
b = d[(d.date >= '2026-07-01') & (d.date <= '2026-09-30')].area.value_counts()
g = ((b - a) / a * 100).round(1).sort_values(ascending=False)
c = d[d.category == 'cake']


def es(s, e):
    x = c[(c.date >= s) & (c.date <= e)]
    return round((x.eggless == 'yes').mean() * 100, 1)


eg = {'oct_dec_2025': es('2025-10-01', '2025-12-31'),
      'jul_sep_2026': es('2026-07-01', '2026-09-30')}
rc = d.groupby('channel').rating.mean().round(2)
res = dict(monthly_revenue=mr.to_dict(), best_month=best,
           top_products=list(tp.index[:5]), top_revenue=tp.head(5).to_dict(),
           fastest_growing_area=g.index[0], area_growth_percent=g.to_dict(),
           orders_a=a.to_dict(), orders_b=b.to_dict(),
           eggless_share_percent=eg, rating_by_channel=rc.to_dict(),
           total=int(d.amount.sum()))
print(json.dumps(res, indent=1))

plt.figure(figsize=(9, 4.5)); mr.plot.bar(color='#c0763a')
plt.title('Monthly revenue (Rs.)'); plt.ylabel('Rs.'); plt.tight_layout()
plt.savefig('output/monthly-revenue.png', dpi=120); plt.close()
plt.figure(figsize=(8, 4.5)); g.plot.bar(color='#4a8f6a')
plt.title('Order growth: Oct-Dec 2025 vs Jul-Sep 2026 (%)'); plt.ylabel('%'); plt.tight_layout()
plt.savefig('output/area-growth.png', dpi=120); plt.close()
plt.figure(figsize=(9, 4.5)); tp.head(5)[::-1].plot.barh(color='#7a4fa0')
plt.title('Top 5 products by revenue (Rs.)'); plt.tight_layout()
plt.savefig('output/top-products.png', dpi=120); plt.close()
