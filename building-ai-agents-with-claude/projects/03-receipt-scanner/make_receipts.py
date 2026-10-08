"""Create the sample receipt photos used in Chapter 7 (and their correct answers).

The receipts are fictional. Each is drawn as HTML, photographed with Chromium, then
tilted and shaded a little so it looks like a phone photo.
Usage: CHROMIUM_PATH=/path/to/chromium python make_receipts.py
"""
import json
import os
import random
from pathlib import Path

from PIL import Image, ImageFilter
from playwright.sync_api import sync_playwright

HERE = Path(__file__).parent

# shop, address, gstin, bill_no, date, items [(name, qty, rate)], gst_rate %, printed_total
RECEIPTS = [
    ("Sri Murugan Stores", "12 Bazaar Road, Mylapore, Chennai", "", "SM-4471", "02/10/2026",
     [("Toor dal 1kg", 2, 168.00), ("Basmati rice 5kg", 1, 545.00), ("Sunflower oil 1L", 2, 152.00),
      ("Sugar 1kg", 3, 46.00)], 0, None),
    ("Hotel Annapoorna Veg", "45 Anna Salai, Chennai 600002", "33AABCH1234F1Z5", "T7-0912",
     "03/10/2026", [("Mini tiffin", 2, 140.00), ("Ghee roast dosa", 1, 120.00),
                    ("Filter coffee", 3, 40.00)], 5, None),
    ("Kumaran Hardware", "8 Usman Road, T. Nagar, Chennai", "33AAFFK5521M1Z2", "KH/26/1188",
     "03/10/2026", [("Wall hook steel", 6, 35.00), ("Extension board 4-way", 1, 420.00),
                    ("Drill bit set", 1, 380.00)], 18, None),
    ("Velachery Health Pharmacy", "201 100 Feet Road, Velachery, Chennai", "33AACCM8899Q1Z1",
     "VLY-55102", "04/10/2026", [("Paracetamol 650 strip", 2, 30.50), ("ORS sachet", 5, 21.00),
                                 ("Hand sanitiser 500ml", 1, 189.00)], 12, None),
    ("Green Leaf Bakery Supplies", "3 Pycrofts Road, Royapettah, Chennai", "33AAGFG4410P1Z8",
     "GL-2026-332", "04/10/2026", [("Cocoa powder 1kg", 1, 720.00), ("Butter 500g", 4, 265.00),
                                   ("Cake boxes 8x8 (25)", 2, 310.00)], 18, None),
    # This bill's printed total is Rs. 100 more than its items and tax add up to.
    ("City Stationers", "77 Nungambakkam High Road, Chennai", "33AACFC7712R1Z4", "CS-90311",
     "05/10/2026", [("A4 paper ream", 2, 285.00), ("Ball pens (box of 10)", 2, 90.00),
                    ("Order book", 5, 60.00)], 18, "OFF_BY_100"),
    ("Hotel Annapoorna Veg", "45 Anna Salai, Chennai 600002", "33AABCH1234F1Z5", "T7-0912",
     "03/10/2026", [("Mini tiffin", 2, 140.00), ("Ghee roast dosa", 1, 120.00),
                    ("Filter coffee", 3, 40.00)], 5, None),   # the same bill, photographed twice
    ("Raja Auto Fuels", "GST Road, Pallavaram, Chennai", "", "PB-668201", "06/10/2026",
     [("Petrol (litres)", 12.5, 101.80)], 0, None),
]


def money(x):
    return f"{x:,.2f}"


def receipt_html(r, style):
    shop, addr, gstin, bill, date, items, gst, quirk = r
    subtotal = round(sum(q * p for _, q, p in items), 2)
    tax = round(subtotal * gst / 100, 2)
    total = round(subtotal + tax, 2) + (100 if quirk == "OFF_BY_100" else 0)
    rows = "".join(f"<tr><td>{n}</td><td class=r>{q:g}</td><td class=r>{money(p)}</td>"
                   f"<td class=r>{money(q * p)}</td></tr>" for n, q, p in items)
    taxrows = ""
    if gst:
        half = round(tax / 2, 2)
        taxrows = (f"<tr><td colspan=3>CGST {gst / 2:g}%</td><td class=r>{money(half)}</td></tr>"
                   f"<tr><td colspan=3>SGST {gst / 2:g}%</td><td class=r>{money(tax - half)}</td></tr>")
    font = style["font"]
    return f"""<!doctype html><html><head><meta charset=utf-8><style>
    body {{ margin:0; background:#fff; }}
    .rc {{ width:380px; padding:22px 20px 28px; background:{style['paper']}; color:#222;
           font: {font}; }}
    h1 {{ font-size:19px; text-align:center; margin:0 0 4px; letter-spacing:.5px; }}
    .c {{ text-align:center; font-size:12px; margin:1px 0; }}
    table {{ width:100%; border-collapse:collapse; font-size:13px; margin-top:8px; }}
    td, th {{ padding:3px 0; }} th {{ text-align:left; border-bottom:1px dashed #555; }}
    .r {{ text-align:right; }} .tot td {{ font-weight:bold; font-size:15px;
           border-top:1px dashed #555; padding-top:6px; }}
    hr {{ border:none; border-top:1px dashed #555; }}
    </style></head><body><div class=rc id=rc>
    <h1>{shop}</h1><p class=c>{addr}</p>
    {f'<p class=c>GSTIN: {gstin}</p>' if gstin else ''}
    <hr><p class=c>Bill No: {bill} &nbsp;&nbsp; Date: {date}</p>
    <table><tr><th>Item</th><th class=r>Qty</th><th class=r>Rate</th><th class=r>Amount</th></tr>
    {rows}
    <tr><td colspan=3>Sub total</td><td class=r>{money(subtotal)}</td></tr>{taxrows}
    <tr class=tot><td colspan=3>TOTAL (Rs.)</td><td class=r>{money(total)}</td></tr></table>
    <hr><p class=c>Paid by UPI. Thank you, visit again!</p></div></body></html>""", total


def photo(png, out, seed):
    """Make a clean screenshot look like a phone photo: tilt, shadow, slight blur."""
    rnd = random.Random(seed)
    img = Image.open(png).convert("RGB")
    angle = rnd.uniform(-4, 4)
    img = img.rotate(angle, expand=True, fillcolor=(120, 110, 95), resample=Image.BICUBIC)
    bg = Image.new("RGB", (img.width + 80, img.height + 80), (120, 110, 95))
    bg.paste(img, (40, 40))
    shade = Image.linear_gradient("L").resize(bg.size).point(lambda v: 255 - v // 6)
    bg = Image.composite(bg, Image.new("RGB", bg.size, (60, 55, 50)), shade)
    bg = bg.filter(ImageFilter.GaussianBlur(0.6))
    bg.save(out, quality=82)


def main():
    styles = [{"font": "14px 'DejaVu Sans Mono', monospace", "paper": "#fbfaf6"},
              {"font": "14px 'DejaVu Sans', sans-serif", "paper": "#fffdf3"},
              {"font": "14px 'DejaVu Serif', serif", "paper": "#f7f7f7"}]
    truth = {}
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=os.environ.get("CHROMIUM_PATH") or None)
        page = browser.new_page(device_scale_factor=2, viewport={"width": 420, "height": 900})
        for i, r in enumerate(RECEIPTS, 1):
            html, total = receipt_html(r, styles[i % 3])
            page.set_content(html)
            tmp = HERE / f"_tmp{i}.png"
            page.locator("#rc").screenshot(path=str(tmp))
            photo(tmp, HERE / "receipts" / f"receipt-{i:02d}.jpg", seed=i)
            tmp.unlink()
            shop, addr, gstin, bill, date, items, gst, quirk = r
            subtotal = round(sum(q * pr for _, q, pr in items), 2)
            truth[f"receipt-{i:02d}.jpg"] = {
                "shop": shop, "bill_no": bill, "date": date, "gstin": gstin,
                "subtotal": subtotal, "gst_rate": gst, "gst_amount": round(subtotal * gst / 100, 2),
                "total": total, "items": len(items),
                "should_flag": {"OFF_BY_100": "total_mismatch"}.get(quirk),
            }
        browser.close()
    truth["receipt-07.jpg"]["should_flag"] = "duplicate"
    (HERE / "evals" / "truth.json").write_text(json.dumps(truth, indent=1))


if __name__ == "__main__":
    main()
