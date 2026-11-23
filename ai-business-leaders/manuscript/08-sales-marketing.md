# Part III: AI Across Every Function

# Chapter 8: Sales and Marketing

The chapters in this part go through your business one function at a time. Each one covers the use cases that tend to pay back, the metrics that prove it, a short example, a starter prompt or two, and the traps to avoid. Read the chapters for the functions you lead, and skim the others so you know what your peers could be doing.

Sales and marketing are usually the first functions to adopt AI, because so much of the work is writing and research. They are also where it is easiest to produce a lot of activity without moving revenue. The test for every use case in this chapter is simple: does it help win more business, at better margins, faster?

## Use Cases That Pay Back

### 1. Faster Quotes and Proposals

For many businesses, the speed of a quote decides who wins the order. AI can turn a customer's email, drawing or request for proposal into a first-draft quote or proposal, using your product data, pricing rules and past proposals.

- **Value:** revenue (higher win rates on faster quotes) and cost (fewer hours per quote).
- **Measure:** quote turnaround time, quotes per salesperson per week, win rate.
- **Watch out:** pricing errors. Keep a person approving every price, and make the AI show which price list and rules it used.

### 2. Account Research and Meeting Preparation

Before a sales call or account review, AI can summarize the customer's order history, open issues, recent news and the notes from past meetings into one page.

- **Value:** better conversations, more cross-selling, less time preparing.
- **Measure:** preparation time; for a harder measure, revenue per account in the accounts where reps use it against a comparable group where they don't.
- **Watch out:** stale or wrong data in the CRM. AI makes bad data look convincing.

### 3. Follow-Up That Actually Happens

Many lost sales are simply forgotten. AI can draft follow-up emails after meetings, remind reps of open quotes, and suggest the next step for each opportunity.

- **Value:** revenue from deals that would otherwise go quiet.
- **Measure:** share of quotes followed up within 48 hours; conversion of quotes to orders.

### 4. Call Summaries and CRM Updates

AI can listen to sales calls (with the customer's consent, where the law requires it) and write the summary, action items and CRM update.

- **Value:** a few hours a week per rep returned to selling; a CRM that is actually up to date.
- **Measure:** time spent on admin; completeness of CRM records.
- **Watch out:** recording and consent rules differ by country and state. Check with legal before you start.

### 5. Content at Scale

Product descriptions, category pages, email campaigns, social posts and ad variations. This is the most common marketing use case, and for good reason: it is fast to start and easy to check.

- **Value:** cost (fewer agency or freelance hours), speed, and sometimes revenue through better search visibility and conversion.
- **Measure:** content produced per week, cost per piece, conversion rates on pages updated with AI against those not yet updated.
- **Watch out:** generic, same-sounding content. Give the AI your brand voice guide and real customer language, and have a person edit everything that is published.

### 6. Customer Insight

AI can read thousands of reviews, survey comments, sales call notes and support tickets and tell you what customers praise, complain about and ask for, in their own words.

- **Value:** better product, pricing and messaging decisions.
- **Measure:** this one is hard to measure directly. Treat it as decision support and judge it by the decisions it improves.

## Northfield: Product Descriptions as the Quick Win

Northfield's online catalog had 18,000 items. About 11,000 had only the manufacturer's code and a one-line name. Customers searching the website often couldn't find what they needed, and called a branch instead.

The marketing manager, with one of the AI champions, set up a simple process using the general AI assistant:

1. Export 200 products at a time from the product system to a spreadsheet: name, code, category, manufacturer specifications.
2. Ask the assistant to write a short, factual description for each, following a brand voice guide and a fixed structure (what it is, what it's used for, key specifications, what it works with).
3. A product specialist from the branch checks each batch, mostly for technical accuracy.
4. Import the approved descriptions back into the catalog.

Here is the prompt they used, with the product data attached:

```
You are writing product descriptions for a building and plumbing
supplies distributor. Our customers are contractors and serious
DIYers. For each product in the attached table, write a description
of 60 to 90 words with this structure: one sentence on what it is,
one on what it's typically used for, the key specifications as a
short list, and one sentence on compatible products if the data shows
any. Use only facts from the table. If a fact is missing, leave it
out; never guess a specification. Plain, practical English. No
marketing words like "premium," "innovative" or "best-in-class."
Return a table with the product code and the description.
```

In eight weeks, the team completed 6,400 descriptions, at about 90 seconds of checking time per product. The checkers found a factual error in about 3 percent of drafts, almost always where the manufacturer data itself was incomplete. Online searches that led to a product page rose, and calls to branches asking "do you stock..." fell noticeably. Marketing estimated that writing the same descriptions by hand would have cost about $95,000 in freelance fees. Actual cost: the assistant licenses they already had and about 160 hours of staff checking time.

It was exactly what a quick win should be: visible, fast, cheap and low-risk. It also changed the mood in the company. People had seen AI do real work.

> **Tip:** The instruction "use only facts from the table; never guess" is doing a lot of work in that prompt. For any factual content, tell the AI where its facts must come from and what to do when one is missing.

## Starter Prompt: Quote Follow-Up

```
Here are the details of a quote we sent 5 days ago with no reply:
[customer, contact name, what they asked for, quote value, delivery
time, any notes from the salesperson]. Draft a short, friendly
follow-up email from the salesperson. Ask one specific question that
makes it easy to reply. Do not offer a discount. Under 100 words.
```

## The Traps in Sales and Marketing

- **More content, same results.** AI makes content cheap, so companies produce much more of it. Customers notice the drop in quality. Measure results (conversion, leads, revenue), not output.
- **Automated outreach that damages your name.** AI can send thousands of personalized cold emails. Most of them will feel generated, and some will be wrong. Keep a person in the loop for anything sent to named customers, and follow the email marketing laws where you sell.
- **Pricing without guardrails.** Never let AI set or change prices for customers without human approval and clear rules.
- **Made-up claims.** AI will happily write that your product is "certified" or "the market leader." Every claim must be true and checked.

## Metrics to Track

| Use case | Primary metric | Secondary metric |
| --- | --- | --- |
| Quotes and proposals | Turnaround time | Win rate |
| Account preparation | Prep time per meeting | Revenue per account |
| Follow-up | Share followed up within 48 hours | Quote conversion |
| Call summaries | Admin hours per rep | CRM completeness |
| Content | Cost and time per piece | Conversion on updated pages |
| Customer insight | Decisions informed | Customer satisfaction trend |

## Key Points

- In sales and marketing, measure revenue, conversion and speed, not the amount of content produced.
- Faster quotes and reliable follow-up are often the highest-value use cases.
- Content at scale is a good quick win, if it is factual, on-brand and checked by a person.
- Keep people in charge of prices, claims and messages to named customers.

## Questions for Your Leadership Team

1. How fast do we quote today, and what do we lose when we are slow?
2. Where does our CRM data come from, and would we trust AI summaries built on it?
3. What content would we produce if it cost a fifth as much? Would it matter to customers?
4. What rules do we need for AI-written messages to customers?
5. What do our customers say about us in reviews and comments that we have never systematically read?
