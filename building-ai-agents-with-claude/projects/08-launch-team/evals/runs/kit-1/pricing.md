# Diwali 2026 hamper pricing - Amudha's Home Bakes

Rule (data/hamper-costs.json): price >= cost / 0.6 (at least 40% margin), rounded UP to the next amount ending in 49 or 99. Margin = (price - cost) / price.

| Hamper | Items (cost in Rs) | Total cost (Rs) | Price (Rs) | Margin (Rs) | Margin % |
|---|---|---|---|---|---|
| Deepam (small) | Rasmalai cake jar (140); Badam milk cookies (200 g) (150); Festive gift box and ribbon (95); Diya and greeting card (40) | 425 | 749 | 324 | 43.3% |
| Jyothi (medium) | Mini chocolate truffle cake (500 g) (285); Walnut brownies (box of 6) (190); Kaju katli cookies (200 g) (175); Festive gift box and ribbon (95); Diya and greeting card (40) | 785 | 1349 | 564 | 41.8% |
| Jyothi Eggless (medium) | Rasmalai cake jar (140); Eggless walnut brownies (box of 6) (205); Kaju katli cookies (200 g) (175); Badam milk cookies (200 g) (150); Festive gift box and ribbon (95); Diya and greeting card (40) | 805 | 1349 | 544 | 40.3% |

## Working

### Deepam (small)
- Cost: 140 + 150 + 95 + 40 = 425
- Minimum price: 425 / 0.6 = 708.33
- Rounded up to next amount ending in 49 or 99: 749
- Margin: (749 - 425) / 749 = 43.3%

### Jyothi (medium)
- Cost: 285 + 190 + 175 + 95 + 40 = 785
- Minimum price: 785 / 0.6 = 1308.33
- Rounded up to next amount ending in 49 or 99: 1349
- Margin: (1349 - 785) / 1349 = 41.8%

### Jyothi Eggless (medium)
- Cost: 140 + 205 + 175 + 150 + 95 + 40 = 805
- Minimum price: 805 / 0.6 = 1341.67
- Rounded up to next amount ending in 49 or 99: 1349
- Margin: (1349 - 805) / 1349 = 40.3%
