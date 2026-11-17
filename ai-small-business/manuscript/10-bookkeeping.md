# Chapter 10: Bookkeeping Prep

This chapter is about the work *before* the bookkeeping: sorting receipts, categorizing spending, understanding reports and preparing good questions for your accountant. Claude is good at organizing and explaining numbers. It is not an accountant, and it can make arithmetic mistakes.

> **Check First:** Treat every figure Claude produces as a draft. Check totals with your spreadsheet or bookkeeping software, and take tax, payroll and legal questions to a qualified accountant. Remove account numbers before pasting statements.

## Workflow 51: Categorize Your Expenses

**Use it when:** you have a month of bank or card transactions to sort into categories.

> **Time Saved:** About 1 hour a month (from 75 minutes down to 15).

```
Here are my business transactions for [month], exported from my bank
(account numbers removed). Put each one into one of these categories:
[your categories, for example Ingredients, Packaging, Rent,
Utilities, Equipment, Marketing, Fees, Travel, Owner drawings,
Other]. Return a table: date, description, amount, category, and a
"?" for anything you're unsure about. Then total each category.
Show your totals so I can check them.

[paste or attach the transactions]
```

```result
| Date | Description | Amount | Category |
| Mar 2 | MILL FLOUR CO | 412.50 | Ingredients |
| Mar 3 | BOXRIGHT LTD | 96.00 | Packaging |
| Mar 4 | AMZN MKTP | 34.99 | ? (could be Equipment or Other) |
...
Totals: Ingredients 1,844.20; Packaging 310.00; ...
```

**Make it better:** give Claude your categories from your bookkeeping software, so the result can be copied straight across.

**Variations:**

- **Recurring payments:** ask Claude to list every subscription and regular payment, so you can cancel what you don't use.
- **Personal mixed in:** ask it to flag anything that looks personal rather than business.

## Workflow 52: Turn Receipt Photos Into a Table

**Use it when:** you have a pile of paper receipts and need them recorded.

> **Time Saved:** About 40 minutes per 30 receipts (from 50 down to 10).

```
I'm attaching photos of [number] receipts. For each, extract:
date, supplier, total, tax amount (if shown), and what it was for.
Put them in a table, sorted by date. If a receipt is unreadable or
a figure is unclear, write "CHECK" rather than guessing.
```

```result
| Date | Supplier | Total | Tax | For |
| Mar 5 | Valley Hardware | 47.80 | 7.97 | Shelf brackets |
| Mar 6 | City Parking | 6.00 | - | Parking, bank visit |
| Mar 9 | (unreadable) | CHECK | CHECK | - |
```

**Make it better:** photograph receipts flat, in good light, a few at a time. Then keep the originals as your bookkeeping rules require.

**Variations:**

- **Mileage log:** paste your trips and ask for a table with dates, purpose and miles.
- **Expense claims from staff:** ask for a table ready for approval.

## Workflow 53: Check an Invoice Before You Send It

**Use it when:** you are about to send an invoice and want to catch mistakes.

> **Time Saved:** About 10 minutes per invoice, and fewer awkward corrections.

```
Check this invoice before I send it. Look for: arithmetic errors in
line totals, tax and the grand total; missing information (invoice
number, date, due date, my business details, the client's details,
payment instructions); and anything unclear in the descriptions.
List problems first, then show the corrected figures with working.

[paste the invoice text, with bank details removed]
```

```result
Problems:
1. Line 3: 12 x $4.50 = $54.00, not $56.00.
2. Tax at 8% on $612.00 is $48.96; the invoice says $49.60.
3. No due date shown.
Corrected total: $612.00 + $48.96 = $660.96.
```

**Make it better:** ask Claude for a short, friendly payment-terms line to add to every invoice.

**Variations:**

- **Supplier invoice you received:** ask Claude to check it against your purchase order or quote.
- **Quote:** use the same prompt to check a quote before sending.

## Workflow 54: Build a Simple Cash Flow Forecast

**Use it when:** you want to see whether there will be enough money in the bank over the next few months.

> **Time Saved:** About 1.5 hours (from 2 hours down to 30 minutes).

```
Help me build a simple 12-week cash flow forecast. Money in the bank
today: [amount]. Expected money in each week: [sales estimates,
invoices due]. Money out: [rent, wages, suppliers, loans, tax
payments, with dates]. Show a weekly table: opening balance, money
in, money out, closing balance. Highlight any week where the balance
goes below [safety amount]. Then suggest three things I could do to
avoid those weeks.

[paste details or attach a spreadsheet]
```

```result
| Week | Opening | In | Out | Closing |
| 1 | 8,400 | 5,200 | 4,900 | 8,700 |
| 2 | 8,700 | 5,100 | 7,800 | 6,000 |
| 3 | 6,000 | 4,900 | 9,100 | 1,800 | <- below $3,000
...
Ideas: move the oven repair to week 5; ask Mill Flour Co. for 30-day
terms; send the café invoices weekly instead of monthly.
```

**Make it better:** ask Claude to turn the table into spreadsheet formulas (Workflow 60) so you can update it every Monday.

**Variations:**

- **Seasonal business:** ask for a 12-month forecast with your busy and quiet months.
- **Big purchase:** ask "what happens to the forecast if I buy a $6,000 van in week 4?"

## Workflow 55: Understand Your Profit and Loss Report

**Use it when:** your accountant sends a report and you nod along without really understanding it.

> **Time Saved:** About 45 minutes (from 1 hour down to 15), and better questions for your accountant.

```
Here is my profit and loss report for [period]. Explain it in plain
English: what each main line means, how this period compares with
[last period / same period last year], the three most important
things it tells me about my business, and five questions I should
ask my accountant. Don't give tax advice.

[paste or attach the report]
```

```result
In short: sales are up 12%, but profit is down 4%, because
ingredient costs rose faster than prices.
"Cost of sales" ($38,200): what you spent directly on making what
you sold - mainly flour, butter and packaging.
"Gross margin" (58%): for every $1 of sales, 58 cents is left after
those costs. Last year it was 63%...
Questions for your accountant: 1. Should we review our prices given
the margin drop? ...
```

**Make it better:** ask Claude to define every term in the report in a short glossary you can keep.

**Variations:**

- **Balance sheet:** use the same prompt for a balance sheet or cash flow statement.
- **Explaining to a partner:** ask for a five-bullet summary to share with a business partner.

## Workflow 56: Prepare for Your Accountant

**Use it when:** you have a meeting or year-end coming and want to arrive organized.

> **Time Saved:** About 1 hour (from 75 minutes down to 15), and possibly a smaller bill.

```
I'm meeting my accountant about [year-end / tax return / a specific
question]. My situation: [business type, structure, any changes this
year: new staff, equipment bought, moved premises, etc.]. Make me:
1) a checklist of documents and figures to bring; 2) a list of
questions to ask, most important first; 3) a list of things I
should tell them that they might not know.
```

```result
BRING
- Bank statements for all business accounts, April to March
- Receipts for the new oven ($11,500, bought in June)
- Payroll summaries for both new staff...
ASK
1. How should the new oven be treated for tax?
2. Should I be paying myself differently now the business has grown?
TELL THEM
- I started selling at the Saturday market in September.
```

> **Check First:** Claude can help you prepare, but your accountant decides how things are treated for tax.

**Make it better:** after the meeting, paste your notes and ask for a list of actions with dates.

**Variations:**

- **Choosing an accountant:** ask for questions to ask before you hire one.
- **Bookkeeping software:** ask for a list of questions to compare two packages.

## Workflow 57: Work Out the Price of a Product or Service

**Use it when:** you're not sure your prices cover your costs, or you're pricing something new.

> **Time Saved:** About 1 hour (from 75 minutes down to 15).

```
Help me work out a price for [product or service]. Costs per unit:
[materials, packaging, labor time and hourly cost]. Overheads per
month: [rent, utilities, insurance, etc.] and how many units I sell
per month: [number]. Competitors charge about [range]. I want a
profit margin of about [percentage]. Show your working step by step,
then suggest a price and two alternatives with their pros and cons.
```

```result
1. Direct cost per cake: ingredients $11.40 + box $1.80 + 1.5 hours
   labor at $18 = $40.20
2. Share of overheads: $3,600 / 300 units = $12.00
3. Total cost: $52.20
4. With a 30% margin: $52.20 / 0.70 = $74.57
Suggested price: $75. Alternatives: $69 (closer to competitors,
24% margin) or $85 (premium, needs a stronger story).
```

**Make it better:** check the arithmetic yourself or in a spreadsheet before changing your prices.

**Variations:**

- **Hourly rate for services:** ask Claude to work back from the income you need and the hours you can bill.
- **Bundles:** ask for the price of a bundle that still hits your margin.

## Workflow 58: Compare Supplier Quotes

**Use it when:** you have several quotes and they're hard to compare side by side.

> **Time Saved:** About 40 minutes (from 50 down to 10).

```
Compare these [number] quotes for [what]. Put them in a table:
supplier, price, what's included, delivery time, payment terms,
contract length, warranty or guarantee, and any hidden extras.
Then tell me which offers the best value for a business like mine,
what to ask each supplier before deciding, and anything that looks
like a red flag.

[paste or attach the quotes]
```

```result
| | BoxRight | PackCo | Greenwrap |
| Price (1,000 boxes) | $420 | $385 | $510 |
| Delivery | 5 days | 14 days | 7 days |
| Minimum order | 500 | 2,000 | 250 |
...
Best value: BoxRight - PackCo is cheaper per box, but its 2,000
minimum ties up $770 in stock.
Ask PackCo: can the minimum be lowered?
```

**Make it better:** ask for a short, polite email to the suppliers you don't choose.

**Variations:**

- **Insurance or utilities:** ask Claude to explain the differences in cover or terms in plain English.
- **Equipment:** ask for the total cost over three years, including servicing.

## Workflow 59: Write a Monthly Money Summary

**Use it when:** you want a one-page view of how the month went, for yourself or a business partner.

> **Time Saved:** About 45 minutes (from 1 hour down to 15).

```
Here are my figures for [month]: sales [amount and breakdown], main
costs [list], money in the bank at the start and end, unpaid
invoices [list], bills coming up [list]. Write a one-page money
summary: how the month went in three sentences, a small table of
key numbers compared with last month, three things to watch next
month, and one action to take this week.
```

```result
In three sentences: March sales were $21,400, up 6% on February.
Costs rose faster, mainly flour and energy, so profit was flat. Cash
in the bank is healthy at $9,100, but two café invoices ($1,850) are
overdue.
Action this week: chase the two overdue invoices (Workflow 26).
```

**Make it better:** keep each month's summary in your Project, and ask Claude every quarter "What trends do you see across these summaries?"

**Variations:**

- **For a bank or investor:** ask for a more formal version with clear headings.
- **For staff:** ask for a version that shares progress without private figures.

## Workflow 60: Get Help With Spreadsheet Formulas

**Use it when:** you know what you want your spreadsheet to do, but not the formula.

> **Time Saved:** About 30 minutes per problem (from 40 down to 10).

```
I'm using [Excel / Google Sheets]. My data: column A is [what],
column B is [what], column C is [what], rows 2 to [number]. I want
to [what you want, for example total sales per month, highlight
unpaid invoices over 30 days old]. Give me the exact formula, where
to put it, and explain in one sentence what each part does.
```

```result
In D2: =IF(AND(C2="Unpaid", TODAY()-B2>30), "OVERDUE", "")
Copy it down to D200.
- TODAY()-B2 works out how many days since the invoice date.
- AND(...) checks both that it's unpaid and older than 30 days.
- IF(...) shows "OVERDUE" when both are true, otherwise nothing.
```

**Make it better:** if the formula gives an error, paste the error message and a few rows of data, and ask Claude to fix it.

**Variations:**

- **Build a template:** ask Claude to design a simple sales tracker or stock sheet, with column names and formulas.
- **Clean up data:** ask for formulas to split names, fix dates or remove duplicates.
