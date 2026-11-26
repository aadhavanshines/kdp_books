"""Fictional demo inputs for the workflows (every name, company and number is made up).

Usage: python3 demo-files/make_demo.py   (writes files next to this script)
"""
import csv
import random
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Font
from PIL import Image, ImageDraw, ImageFont
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table

HERE = Path(__file__).resolve().parent
random.seed(7)
ss = getSampleStyleSheet()
B, H, T = ss["BodyText"], ss["Heading2"], ss["Title"]


def pdf(name, items):
    SimpleDocTemplate(str(HERE / name), pagesize=letter, leftMargin=60, rightMargin=60).build(items)


# W9: a long annual report
sections = [
    ("Letter from the Director", "2026 was a year of recovery and growth for Maple Falls Parks and Recreation. Visits to our 14 parks rose to 1.92 million, up 11% from 1.73 million in 2025. Program enrollment reached 18,400, the highest on record. At the same time, rising costs and aging facilities mean difficult choices lie ahead, especially for the Riverside Pool and our maintenance staffing."),
    ("Budget Summary", "Total operating spending was $14.6 million against a budget of $14.1 million, an overspend of $0.5 million (3.5%). The overspend came mainly from seasonal staff wages (+$310,000) and emergency repairs at Riverside Pool (+$240,000). Program fees brought in $3.2 million, 4% above target. The capital budget of $5.8 million funded the new Oak Hill playground ($1.1 million) and trail resurfacing ($0.9 million); $2.4 million of capital work was delayed to 2027."),
    ("Visitor and Program Results", "Summer camps were full by April and the waiting list reached 640 children. Senior fitness classes grew 27%. Weekday use of tennis courts fell 9%, while pickleball bookings rose 64%. Satisfaction in the resident survey was 78% (2025: 81%), with cleanliness of restrooms the most common complaint (cited by 34% of dissatisfied residents)."),
    ("Facilities", "Riverside Pool, built in 1971, failed its structural inspection in August and closed three weeks early. Engineers estimate repair at $2.1 million or full replacement at $6.8 million; repair would extend its life by about 10 years. 41% of park restrooms are rated poor or very poor. Tree inventory: 22,300 trees, with 1,150 ash trees at risk from emerald ash borer."),
    ("Staffing", "The department has 112 full-time staff and hired 410 seasonal workers. Maintenance vacancies averaged 14% across the year; 9 of 38 maintenance positions were unfilled in December. Overtime cost $420,000, double the 2024 level. Exit interviews cite pay below neighboring cities by 8 to 12%."),
    ("Risks and Outlook for 2027", "Key risks are the Riverside Pool decision, which must be made by March 2027 to allow a summer opening, maintenance vacancies, and a state grant of $1.2 million for trails that expires if work does not start by June 30, 2027. The department will request a 6% budget increase for 2027, mostly for wages and restroom renovation."),
]
items = [Paragraph("Maple Falls Parks and Recreation: 2026 Annual Report", T), Spacer(1, 10)]
for i, (h, t) in enumerate(sections):
    items += [Paragraph(h, H), Paragraph(t, B), Spacer(1, 6)]
    items += [Paragraph(f"Further detail for this section is provided in Appendix {chr(65 + i)}. "
                        "Figures are unaudited and may be revised in the final financial statements.", B)]
    if i % 2 == 1:
        items.append(PageBreak())
pdf("parks-annual-report-2026.pdf", items)

# W10: an insurance letter (image)
img = Image.new("RGB", (1240, 1600), (252, 252, 250))
d = ImageDraw.Draw(img)
f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 28)
fb = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial Bold.ttf", 34)
lines = [("Summit Peak Health Insurance", fb), ("Date: November 20, 2026", f), ("Member: Alex Romero    Member ID: [removed]", f), ("", f),
         ("EXPLANATION OF BENEFITS - THIS IS NOT A BILL", fb), ("", f),
         ("Claim number: 2026-114-88731", f), ("Provider: Lakeview Imaging Center", f), ("Service date: October 14, 2026", f),
         ("Service: MRI, left knee, without contrast", f), ("", f),
         ("Amount billed:                          $1,260.00", f), ("Plan discount:                              $0.00", f),
         ("Amount paid by plan:                    $410.00", f), ("Amount you may owe the provider:    $850.00", f), ("", f),
         ("Remark code PA-04: Prior authorization was not on file for this", f),
         ("service. Benefits were reduced to the out-of-network rate.", f), ("", f),
         ("Your right to appeal: You may request a review within 180 days", f), ("of the date of this notice. Your provider may also submit a", f),
         ("request for retroactive authorization.", f), ("", f), ("Questions? Call Member Services at the number on your ID card.", f)]
y = 90
for t, ff in lines:
    d.text((90, y), t, font=ff, fill=(25, 25, 25))
    y += 52
img.save(HERE / "insurance-letter.png")

# W18: messy volunteer export
rows = [["Name", "Email", "Phone", "Signed up", "Shift"],
        ["maria lopez", "maria.lopez@example.com", "555.201.3344", "11/02/2026", "Sat AM"],
        ["MARIA LOPEZ", "Maria.Lopez@example.com", "(555) 201-3344", "2026-11-05", "Sat AM"],
        ["James O'Neil", "jamesoneil@example.com", "5552019988", "Nov 3 2026", "Tue PM"],
        ["priya shah", "priya.s@example.com", "555-201-7712", "3/11/2026", "Thu PM"],
        ["Tom  Becker", "tom.becker@example", "555 201 4410", "11-04-2026", "Sat AM"],
        ["Aisha Bello", "aisha.bello@example.com", "", "2026/11/06", "tue pm"],
        ["Chen Wei", "chen.wei@example.com", "555-201-6620", "11/07/26", "Thu PM"],
        ["james o'neil", "JamesONeil@example.com", "555-201-9988", "11/08/2026", "Sat PM"],
        ["Rosa Diaz", "rosa.diaz@example.com", "+1 555 201 5050", "8 Nov 2026", "Sat AM"],
        ["", "kevin.ng@example.com", "555-201-3131", "11/09/2026", "Tue PM"]]
with open(HERE / "volunteers-export.csv", "w", newline="") as fh:
    csv.writer(fh).writerows(rows)

# W19: an inherited budget workbook with two hidden problems
wb = Workbook()
ws = wb.active
ws.title = "Inputs"
ws.append(["Category", "Monthly amount"])
for c, a in [("Rent", 2400), ("Salaries", 18500), ("Software", 640), ("Marketing", 1500), ("Utilities", 380), ("Insurance", 290)]:
    ws.append([c, a])
ws2 = wb.create_sheet("Annual")
ws2.append(["Category", "Annual cost", "Share of total"])
for r in range(2, 8):
    ws2.append([f"=Inputs!A{r}", f"=Inputs!B{r}*12", f"=B{r}/B$9"])
ws2["A9"], ws2["B9"] = "Total", "=SUM(B2:B6)"           # problem 1: misses row 7 (Insurance)
ws2["A10"], ws2["B10"] = "With 3% raise", "=B9*1.03+2000"  # problem 2: unexplained hard-coded 2000
ws2["A1"].font = ws2["B1"].font = ws2["C1"].font = Font(bold=True)
wb.save(HERE / "office-budget-2027.xlsx")

# W24: survey comments
themes = {
    "Long wait for phone support": ["Waited 40 minutes on hold.", "Phone line is always busy at lunchtime.", "I gave up after 25 minutes on hold.", "Please add a callback option instead of hold music."],
    "Delivery was late": ["Order arrived 4 days after the promised date.", "Delivery estimate was wrong twice.", "Late again, third time this year.", "Tracking said delivered but it came the next day."],
    "Staff are friendly": ["Jenna in the Elm Street store was so helpful!", "Staff always remember my name.", "Friendly, patient people.", "The driver was polite and careful."],
    "App is confusing": ["Can't find my past orders in the app.", "The new app layout is confusing.", "App logs me out every day.", "Hard to change my delivery address in the app."],
    "Prices went up": ["Prices up a lot since spring.", "Delivery fee went from $4 to $7.", "Getting expensive compared to other shops."],
}
comments = []
for theme, texts in themes.items():
    n = {"Long wait for phone support": 14, "Delivery was late": 12, "Staff are friendly": 10, "App is confusing": 9, "Prices went up": 6}[theme]
    comments += [random.choice(texts) for _ in range(n)]
comments.append("The heater in my rental unit you installed sparks when it turns on. Please send someone.")
random.shuffle(comments)
with open(HERE / "survey-comments.csv", "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["Response ID", "Comment"])
    for i, c in enumerate(comments, 1):
        w.writerow([1000 + i, c])

# W26: syllabus
pdf("biology-syllabus.pdf", [Paragraph("Biology 101: Final Exam Topics", T)] + [Paragraph(t, B) for t in [
    "1. Cell structure and organelles", "2. Cell membrane and transport", "3. Cell respiration (glycolysis, Krebs cycle, electron transport chain)",
    "4. Photosynthesis", "5. DNA structure and replication", "6. Genetics: Mendel, Punnett squares, inheritance patterns",
    "7. Protein synthesis (transcription and translation)", "8. Evolution and natural selection", "9. Ecology: food webs and energy flow",
    "Exam: Wednesday December 16, 9am. 60 multiple-choice questions and 3 short essays. Allowed: calculator."]])

# W32: a month of bank transactions (descriptions only, no account numbers)
tx = [("2026-10-01", "RENT PAYMENT - OAKWOOD APTS", -1650.00), ("2026-10-02", "TRADER FRESH GROCERY", -86.40), ("2026-10-03", "STREAMFLIX MONTHLY", -15.99),
      ("2026-10-03", "CITY TRANSIT PASS", -98.00), ("2026-10-05", "BURGER BARN", -23.75), ("2026-10-06", "TRADER FRESH GROCERY", -112.18),
      ("2026-10-07", "TUNEBOX MUSIC", -10.99), ("2026-10-08", "SPARKLE ELECTRIC CO", -94.20), ("2026-10-09", "CORNER CAFE", -6.50),
      ("2026-10-10", "CORNER CAFE", -6.50), ("2026-10-11", "OUTDOOR GEAR CO", -189.00), ("2026-10-12", "TRADER FRESH GROCERY", -74.92),
      ("2026-10-13", "FITLIFE GYM", -49.00), ("2026-10-14", "CORNER CAFE", -7.25), ("2026-10-15", "PAYROLL DEPOSIT", 2875.00),
      ("2026-10-16", "THAI ORCHID RESTAURANT", -64.30), ("2026-10-17", "CLOUDSAVE STORAGE", -2.99), ("2026-10-18", "PHONE PLUS WIRELESS", -72.00),
      ("2026-10-19", "TRADER FRESH GROCERY", -98.66), ("2026-10-20", "CORNER CAFE", -6.50), ("2026-10-21", "RIDE NOW", -18.40),
      ("2026-10-22", "HOMEGOODS DEPOT", -134.99), ("2026-10-23", "PIZZA PALACE", -31.20), ("2026-10-24", "STREAMFLIX MONTHLY", -15.99),
      ("2026-10-25", "CORNER CAFE", -7.25), ("2026-10-26", "TRADER FRESH GROCERY", -91.05), ("2026-10-27", "CAR INSURANCE CO", -128.00),
      ("2026-10-28", "RIDE NOW", -22.10), ("2026-10-29", "SUSHI GO", -48.60), ("2026-10-30", "PAYROLL DEPOSIT", 2875.00),
      ("2026-10-31", "BOOKNOOK", -27.45)]
with open(HERE / "bank-october-2026.csv", "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["Date", "Description", "Amount"])
    w.writerows(tx)

# W44: bakery sales by month
with open(HERE / "bakery-sales.csv", "w", newline="") as fh:
    w = csv.writer(fh)
    w.writerow(["Month", "Year", "Bread", "Pastries", "Cakes", "Coffee"])
    base = {"Bread": 4200, "Pastries": 3100, "Cakes": 2600, "Coffee": 3800}
    for yr, growth in ((2025, 1.0), (2026, 1.09)):
        for i, m in enumerate(["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]):
            season = 1 + 0.25 * (m in ("Nov", "Dec")) - 0.12 * (m in ("Jan", "Feb"))
            w.writerow([m, yr] + [round(v * growth * season * random.uniform(0.93, 1.07)) for k, v in base.items()])

print("demo files written")
