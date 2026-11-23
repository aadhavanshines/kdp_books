# Chapter 10: Finance

Finance teams are often the most skeptical about AI, and for good reason. Finance runs on accuracy, audit trails and controls, and generative AI is known for confident mistakes. Yet finance also has some of the clearest, most measurable use cases in any company, because so much of its work is reading documents, matching data and explaining numbers.

The key is to use AI where checking is built into the process, and to keep it away from anything that needs a guaranteed-correct calculation without a check.

## A Rule for AI in Finance

> **Remember:** Let AI read, sort, draft and explain. Let your systems calculate. Let people approve.

Generative AI is good at reading messy documents and explaining numbers in words. It is not a reliable calculator unless it is using a proper calculation tool or spreadsheet behind the scenes. Totals, reconciliations and postings should come from your accounting systems or a spreadsheet, not from a model's text answer.

## Use Cases That Pay Back

### 1. Invoice and Document Processing

Suppliers send invoices as PDFs, scans, emails and spreadsheets in dozens of layouts. AI can read them, extract the supplier, invoice number, dates, line items, tax and totals, match them to purchase orders, and pass them to your payables system, flagging anything that doesn't match.

- **Value:** fewer hours of manual entry, fewer errors, faster processing, fewer late-payment penalties, more early-payment discounts captured.
- **Measure:** cost per invoice, invoices processed per person, exception rate, days to process.
- **Watch out:** this is a mature area with specialist products. Buy, don't build (Chapter 7). Keep the approval step and the three-way match in your system of record.

### 2. Collections and Credit Control

AI can draft collection emails that reflect each customer's history ("first reminder, good payer" reads differently from "third reminder, disputed invoice"), summarize disputes, and prioritize which accounts to call first.

- **Value:** lower days sales outstanding (DSO), less time per account, better customer relationships.
- **Measure:** DSO, share of overdue balance collected within 30 days, disputes resolved.

### 3. Month-End Commentary and Reporting

AI can draft the first version of the management commentary from the accounts: what changed, why, and what to watch. Analysts then check, correct and add judgment.

- **Value:** faster close, more time for analysis instead of writing.
- **Measure:** days to close, hours spent on reporting.
- **Watch out:** AI can describe what the numbers show. It cannot know why a number moved unless someone tells it. Feed it the explanations from budget holders, or it will invent plausible ones.

### 4. Expense and Policy Checks

AI can review expense claims against policy, flag unusual items and draft queries to the employee, so reviewers spend their time on the exceptions.

- **Value:** lower review cost, better compliance.
- **Measure:** review time per claim, policy breaches caught.

### 5. Analysis and Modeling Support

Finance analysts can use AI assistants to build spreadsheet formulas, write first-draft models, explore scenarios and explain variances. This is mostly personal productivity, but it adds up across a finance team.

- **Value:** analyst time.
- **Measure:** hard to measure directly; track turnaround on analysis requests.

### 6. Fraud and Anomaly Detection

This is mostly predictive AI (Chapter 1): models that learn normal patterns in payments, invoices and expenses and flag unusual ones, such as duplicate invoices, changed bank details or out-of-pattern payments.

- **Value:** risk reduction.
- **Measure:** anomalies flagged and confirmed; losses avoided.

## Northfield's Finance Plan

Northfield's finance team processed about 6,000 supplier invoices a month, with six people on payables. Invoice extraction scored 16 in Chapter 5 but waited for the finance system upgrade. Meanwhile, Marcus ran two smaller efforts.

**Collections drafting.** The credit controllers used the general assistant, with customer names replaced by account numbers, to draft collection emails based on each account's history. After two months, they estimated they were saving about four hours a week each and, more importantly, sending reminders on time instead of letting them slip. DSO fell by two days over the following quarter. On Northfield's receivables, that freed up a meaningful amount of cash. Marcus was careful to say the effect also reflected other changes and that he couldn't prove all of it came from AI.

**Commentary drafts.** An analyst exported the monthly figures and the budget holders' notes into a spreadsheet and asked the assistant to draft the commentary. It saved about a day each month. It also, twice in the first three months, produced an explanation that sounded right and wasn't, because no budget holder had explained the movement. The team added a rule: every explanation must come from a named person's note, or the draft must say "explanation needed."

That rule is worth copying. It turned a tool that could invent stories into one that highlighted the gaps.

## Starter Prompt: Variance Commentary

```
Below is our monthly results table (actual, budget, prior year) and
notes from budget holders explaining key movements. Draft management
commentary of no more than 300 words. Cover the three largest
variances against budget. For each, use only the explanation in the
budget holders' notes and name its source. If no note explains a
variance, write "Explanation needed from [department]" instead of
suggesting a reason. Do not recalculate any figures; use the numbers
in the table exactly as given.
```

## Controls and Audit

Finance leaders should apply the same control thinking to AI as to any other process:

- **Segregation of duties.** AI can prepare; a person approves. Never let the same AI workflow both create and approve a payment.
- **Audit trail.** Keep a record of what the AI produced, what the person changed, and who approved it. Many products do this automatically; check before you buy.
- **Bank details.** Treat any AI-processed change to supplier bank details as high risk. Fraudsters increasingly use AI-generated emails and documents to request changes. Keep a phone call to a known number as a required check.
- **Data handling.** Financial results before publication are inside information for listed companies. Treat them with the strictest data rules.
- **Your auditors.** Tell your external auditors early which processes use AI and how they are controlled. It is far easier than explaining after the fact.

## The Traps in Finance

- **Trusting AI arithmetic.** Use systems and spreadsheets for numbers; use AI for words.
- **Invented explanations.** Require a source for every reason given.
- **Building what you can buy.** Invoice processing and expense review have mature products.
- **Skipping the auditors.** Bring them in early.

## Metrics to Track

| Use case | Primary metric | Secondary metric |
| --- | --- | --- |
| Invoice processing | Cost per invoice | Exception rate, days to process |
| Collections | Days sales outstanding | Hours per account |
| Commentary | Days to close | Errors found in review |
| Expense checks | Review time per claim | Breaches caught |
| Anomaly detection | Confirmed anomalies | Losses avoided |

## Key Points

- Let AI read, sort, draft and explain; let systems calculate; let people approve.
- Invoice processing and collections are among the most measurable AI use cases in any company.
- Commentary drafts save time only if every explanation has a named source.
- Apply normal finance controls: segregation of duties, audit trails, strict checks on bank detail changes.
- Tell your auditors early.

## Questions for Your Leadership Team

1. How much does it cost us to process one supplier invoice today, end to end?
2. Where do our finance people spend time copying data from one place to another?
3. What controls would our auditors expect around AI-prepared figures and documents?
4. How would we detect an AI-generated fake request to change a supplier's bank details?
5. Which finance reports could be drafted by AI if every explanation came from a named owner?
