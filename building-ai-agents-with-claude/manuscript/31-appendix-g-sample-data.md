# Appendix G: Sample Data and Generator Scripts

Everything the projects need, apart from the code printed in the chapters, is here. Every business, person, email, order, receipt and number is fictional, written for this book. Type the small files in as they are; the larger files (the year of orders, the receipt photos and ShopMate's demo days) are made by the short scripts below, so you get exactly the data used in the book.

> **Tip:** You don't have to type all of this. Start with the files for the project you're working on. For the emails, ten or so are enough to try the inbox agent; just make sure you include the allergy complaint (002) and at least one scam (004 or 008).

## The Shared Helper: `watch.py` (Chapters 3 to 9)

Every project folder has the same small file that prints each step of the agent loop in colour. It uses the `rich` package you installed in Chapter 2.

```
@include projects/01-pantry-chef/watch.py
```

## Project 1: Pantry Chef

`pantry.json`:

```
@include projects/01-pantry-chef/pantry.json
```

## Project 2: Inbox Triage (and ShopMate)

The 24 emails, one file each in the `inbox` folder, named `001.txt` to `024.txt`. ShopMate uses the same emails, in `data/inbox`. The first three lines of each file are the headers the tools read.

`001.txt`:

```
@include projects/02-inbox-triage/inbox/001.txt
```

`002.txt`:

```
@include projects/02-inbox-triage/inbox/002.txt
```

`003.txt`:

```
@include projects/02-inbox-triage/inbox/003.txt
```

`004.txt`:

```
@include projects/02-inbox-triage/inbox/004.txt
```

`005.txt`:

```
@include projects/02-inbox-triage/inbox/005.txt
```

`006.txt`:

```
@include projects/02-inbox-triage/inbox/006.txt
```

`007.txt`:

```
@include projects/02-inbox-triage/inbox/007.txt
```

`008.txt`:

```
@include projects/02-inbox-triage/inbox/008.txt
```

`009.txt`:

```
@include projects/02-inbox-triage/inbox/009.txt
```

`010.txt`:

```
@include projects/02-inbox-triage/inbox/010.txt
```

`011.txt`:

```
@include projects/02-inbox-triage/inbox/011.txt
```

`012.txt`:

```
@include projects/02-inbox-triage/inbox/012.txt
```

`013.txt`:

```
@include projects/02-inbox-triage/inbox/013.txt
```

`014.txt`:

```
@include projects/02-inbox-triage/inbox/014.txt
```

`015.txt`:

```
@include projects/02-inbox-triage/inbox/015.txt
```

`016.txt`:

```
@include projects/02-inbox-triage/inbox/016.txt
```

`017.txt`:

```
@include projects/02-inbox-triage/inbox/017.txt
```

`018.txt`:

```
@include projects/02-inbox-triage/inbox/018.txt
```

`019.txt`:

```
@include projects/02-inbox-triage/inbox/019.txt
```

`020.txt`:

```
@include projects/02-inbox-triage/inbox/020.txt
```

`021.txt`:

```
@include projects/02-inbox-triage/inbox/021.txt
```

`022.txt`:

```
@include projects/02-inbox-triage/inbox/022.txt
```

`023.txt`:

```
@include projects/02-inbox-triage/inbox/023.txt
```

`024.txt`:

```
@include projects/02-inbox-triage/inbox/024.txt
```

## Project 3: Receipt Scanner

`make_receipts.py` draws each of the eight receipts as a small web page, photographs it with the Chromium browser, then adds the tilt, shadow and blur of a phone camera. It writes the photos to `receipts/` and the correct answers to `evals/truth.json`, which the grader uses. It needs `pip install pillow playwright`, then `playwright install chromium` to download the browser (or set `CHROMIUM_PATH` to one you already have).

```
@include projects/03-receipt-scanner/make_receipts.py
```

The rest of `agent.py` from Chapter 7, which writes the Excel sheet:

```
@include projects/03-receipt-scanner/agent.py::write_excel
```

## Project 4: Research Analyst

The six documents, in the `docs` folder.

`accountant-note.md`:

```
@include projects/04-research-analyst/docs/accountant-note.md
```

`competitor-notes.md`:

```
@include projects/04-research-analyst/docs/competitor-notes.md
```

`delivery-costs.md`:

```
@include projects/04-research-analyst/docs/delivery-costs.md
```

`rent-quotes.md`:

```
@include projects/04-research-analyst/docs/rent-quotes.md
```

`sales-summary.md`:

```
@include projects/04-research-analyst/docs/sales-summary.md
```

`survey-results.md`:

```
@include projects/04-research-analyst/docs/survey-results.md
```

## Project 5: Data Analyst (and the Launch Team and ShopMate)

`make_data.py` creates `data/orders.csv`: 3,448 orders with the patterns described in Chapter 9. It uses a fixed random seed, so you get exactly the same file as the book. Copy the result into the Launch Team's and ShopMate's `data` folders too.

```
@include projects/05-data-analyst/make_data.py
```

## Project 6: Support Desk

`policy.md`, the refund policy the agent follows:

```
@include projects/06-support-desk/policy.md
```

`store.py`, the sample orders and the database:

```
@include projects/06-support-desk/store.py
```

## Project 7: Kitchen Manager

`stock.start.json`, the starting stock. Copy it to `stock.json` before each run; the server changes `stock.json` when usage is recorded.

```
@include projects/07-stock-mcp/stock.start.json
```

## Project 8: Launch Team

`data/hamper-costs.json`, with the pricing rule. The team also uses `orders.csv` from Project 5 and `survey-results.md` from Project 4.

```
@include projects/08-launch-team/data/hamper-costs.json
```

## Project 9: ShopMate

`setup_demo.py` puts the shop's data into demo day 1 or day 2 (Chapter 19). It also writes the first week of October's orders, and needs `orders.csv` from Project 5, the 24 emails in `data/inbox`, and `stock.start.json` from Project 7 in `data/`.

```
@include projects/09-shopmate/setup_demo.py
```
