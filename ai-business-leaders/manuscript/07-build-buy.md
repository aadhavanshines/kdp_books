# Chapter 7: Build, Buy or Configure

Once you know what you want to do, you have to decide how to get it. AI vendors are multiplying faster than anyone can track, every software company has added "AI" to its product, and your IT team may be keen to build something themselves. This chapter gives you a way to cut through the choice.

## Four Ways to Get an AI Capability

There are four broad routes. Most companies use all four for different use cases.

**1. Use what you already have.** Many of the systems you already pay for (your email and office suite, your CRM, your help desk, your accounting system) now include AI features. Some are included in your current price; others are an add-on. This is often the fastest and cheapest route, and it is the first place to look.

**2. Buy a specialist product.** A company that does one thing well, such as AI for customer service, invoice processing or contract review. These products are usually faster to set up than building, come with features learned from many customers, and the vendor carries the maintenance. You pay for that in license fees and dependence on the vendor.

**3. Configure a general platform.** Take a general AI assistant or AI platform and set it up for your use case: write the instructions, connect it to your documents and systems, and design the workflow around it. Most business AI platforms now let non-programmers build simple assistants and automations this way. This sits between buying and building.

**4. Build your own.** Your developers, or a partner, use AI models directly through their programming interfaces and build a custom application. This gives you the most control and the best fit, at the highest cost and with ongoing maintenance.

## How to Choose

Ask these questions in order:

1. **Does a system we already use do this well enough?** If yes, start there. "Well enough" means it meets the pilot targets, not that it is the best on the market.
2. **Is this use case common across many companies?** Customer email, invoice processing, meeting notes and sales call summaries are common. Specialist products exist and are mature. Buy.
3. **Is this use case specific to how we work, and does it give us an edge?** Northfield's quote drafting depended on its own pricing rules, product range and customer terms. No product did it out of the box. Configure or build.
4. **Do we have the skills to maintain what we build?** A custom AI application is not a one-time project. Models change, prices change, your data changes. If you can't support it, don't build it.

A simple rule: **buy for the common, build for the differentiating, and configure for everything in between.**

## What Northfield Chose

| Use case | Route | Why |
| --- | --- | --- |
| Customer email replies | Buy: AI add-on to the help desk system Northfield already used | The help desk vendor's AI module drafted replies inside the agents' normal screen and could read order data through an existing connection. Fastest route to adoption. |
| Catalog product descriptions | Use what we have: the general AI assistant | A marketing task done in batches; needed no integration. |
| Quote drafting (next round) | Configure: a general AI platform connected to the product and pricing data | Specific to Northfield's pricing; no product fit. |
| Invoice data extraction (next round) | Buy: a specialist accounts payable product | A common problem with mature products. |

Notice the email choice. Northfield's IT architect had proposed building a custom tool. It would have been more flexible. But the business case showed that adoption was the biggest risk, and the help desk add-on put AI drafts directly where agents already worked. Fit with daily work beat technical flexibility.

## Evaluating Vendors

When you buy or configure, you will compare vendors. Most vendor evaluations focus too much on demos and too little on what happens after the contract is signed. Use a scorecard (Appendix A has a template) that covers six areas.

### 1. Fit and Results

- Does it do our use case well, on our data, not just in the demo?
- Will the vendor run a short test on a sample of our real work (anonymized if needed) before we sign?
- Can they show results from customers similar to us, with a reference we can call?

### 2. Integration

- How does it connect to our systems? Is the connection standard, or a custom project?
- Who builds and maintains the connection, and what happens when either system is upgraded?
- Can it work inside the tools our people already use?

### 3. Data and Security

- Where is our data processed and stored? In which countries?
- Does the vendor or the underlying model provider use our data to train models? (The answer should be no, in writing.)
- How long is our data kept, and can we have it deleted?
- What security certifications do they hold? Your IT team will know which ones matter.
- Which AI model or models do they use, and who provides them?

### 4. Control and Quality

- Can we set the AI's instructions, tone and limits ourselves?
- Can we see why the AI produced an answer, such as which documents it used?
- What reports does it give us on accuracy, usage and errors?
- Can a person review outputs before they reach customers? Can we choose which outputs need review?

### 5. Cost

- What is the full cost: licenses, usage, setup, integration, support, training?
- How will cost grow as our usage grows? Ask for a price at two and five times today's volume.
- What happens to price at renewal?

### 6. The Vendor Itself

- How long has the company existed, and how is it funded?
- What happens to our data and our configuration if they are acquired or close?
- How easily could we switch to another vendor? Can we export our instructions, data and history?

> **Warning:** Many AI startups are young and depend on another company's AI models. That is not a reason to avoid them, but it is a reason to keep contracts short (12 months is often wise in a fast-moving market), make sure you can export your data, and avoid building your whole process around a feature only one small vendor offers.

## Running a Fair Test

Never buy on the strength of a demo alone. Demos use the vendor's best examples. Instead:

1. Prepare a test set: 100 to 300 real examples of the work (emails, invoices, documents), with personal details removed if needed, and the correct answers.
2. Give the same test set to two or three shortlisted vendors.
3. Have your own people judge the results, without knowing which vendor produced which.
4. Score accuracy, but also how much editing each output needed and how clearly the tool showed its sources.

Northfield tested two help desk add-ons and one standalone product on 200 old emails. The standalone product produced slightly better drafts. The help desk add-on was close, much cheaper to connect, and fitted the agents' normal screen. Northfield chose the add-on and noted the standalone product as a fallback if quality fell short in the pilot.

## Contract Points to Watch

Before signing, have your legal team check:

- **Data use:** no training on your data; clear limits on retention; deletion on request.
- **Confidentiality:** your data, prompts, instructions and outputs are treated as confidential.
- **Output ownership:** you own what the AI produces for you.
- **Liability:** what the vendor accepts responsibility for if the AI causes harm, and what it excludes. Expect most vendors to limit this heavily.
- **Changes:** notice before the vendor changes the underlying model or features in ways that affect your results.
- **Exit:** export of your data and configuration in a usable format, and a reasonable transition period.
- **Term:** a shorter initial term, or a pilot clause that lets you stop if targets are not met.

## A Note on Building

If you do build, a few principles save a lot of pain:

- **Don't tie yourself to one model.** Design the application so you can switch AI models as better or cheaper ones appear. Your developers will know how.
- **Build the checking in from the start.** Logging, sampling, and a way for users to flag bad output.
- **Start narrow.** One use case, one team, done well, then extend.
- **Budget for running costs.** Usage fees, monitoring, updates when models change, and the people who look after it.

## Key Points

- There are four routes: use what you have, buy a specialist product, configure a general platform, or build your own.
- Buy for the common, build for what differentiates you, configure for the rest.
- Fit with daily work often matters more than technical flexibility, because adoption drives value.
- Evaluate vendors on fit, integration, data and security, control, full cost and the vendor's own stability.
- Test vendors on your own real work, judged blind, not on demos.
- Protect your data, your exit and your right to stop in the contract.

## Questions for Your Leadership Team

1. Which AI features are already included in systems we pay for, and are we using them?
2. Which of our use cases are common enough to buy, and which are truly specific to us?
3. Do we have the skills to maintain anything we build? If not, who would?
4. What are our non-negotiable contract terms for any AI vendor?
5. How will we test vendors on our own work before we sign?
