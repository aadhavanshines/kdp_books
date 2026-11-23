# Chapter 11: Operations and Supply Chain

Operations is where AI meets the physical world: stock, trucks, machines, warehouses, schedules. It is also where the older kind of AI, predictive models, still does much of the heavy lifting. Generative AI adds a new layer on top: reading the documents, emails and procedures that operations runs on, and helping people make decisions faster.

## Two Kinds of Operations AI

**Predictive AI** forecasts and optimizes: how much stock to hold, when a machine will need maintenance, the best delivery routes, how many staff a shift needs. These models need good historical data and usually come built into planning software or from specialist vendors.

**Generative AI** handles the language around operations: supplier emails, delivery exceptions, standard operating procedures, incident reports, shift handovers and the questions staff ask about all of them.

The strongest operations projects often combine the two. A forecasting model predicts a stock shortage; a generative AI assistant drafts the purchase request and the email to the supplier, and explains the forecast in plain words to the branch manager.

## Use Cases That Pay Back

### 1. Demand Forecasting and Stock Planning

Better forecasts mean less stock tied up in warehouses, fewer stockouts and fewer emergency orders.

- **Value:** working capital (less inventory), revenue (fewer lost sales from stockouts), cost (fewer expedited shipments).
- **Measure:** forecast accuracy, inventory days, stockout rate, expedited freight cost.
- **Watch out:** forecasting models need several years of clean sales history and break down when patterns change suddenly. Always let planners override the forecast, and track how often they do and why.

### 2. Supplier Communication and Exceptions

Late deliveries, short shipments, price changes and quality issues generate a constant stream of emails. AI can read incoming supplier messages, extract what changed (new date, new quantity, new price), update a tracker or flag it in your system, and draft the response.

- **Value:** buyer time, faster reaction to problems.
- **Measure:** time from supplier notice to action; buyer hours on admin.

### 3. Procedures and Knowledge for Front-Line Staff

Operations runs on procedures that few people read. AI assistants that answer questions from your procedures, safety documents and equipment manuals ("What's the lockout procedure for forklift 3?") help new staff become productive faster and reduce errors.

- **Value:** training time, fewer errors and incidents.
- **Measure:** time to competence, error and incident rates.
- **Watch out:** for safety-critical procedures, the AI should quote the source document exactly and link to it, not paraphrase.

### 4. Maintenance

Predictive maintenance uses sensor data to warn before equipment fails. Generative AI helps technicians by summarizing equipment history, suggesting likely causes from the manuals and past repair notes, and writing up the job.

- **Value:** less unplanned downtime, shorter repairs.
- **Measure:** unplanned downtime hours, mean time to repair.

### 5. Scheduling and Routing

Route optimization and workforce scheduling are classic optimization problems. Mature software exists for both, often with AI features. Generative AI can help planners explain and adjust plans in plain language.

- **Value:** fuel and driver hours, overtime, on-time delivery.
- **Measure:** cost per delivery, on-time rate, overtime hours.

### 6. Exception Handling With Agents

This is where AI agents may eventually pay back well: noticing that a truck is delayed, checking which customers are affected, proposing new delivery slots, drafting messages to customers, and, once trusted, rebooking automatically.

- **Value:** speed and customer experience.
- **Measure:** time to resolve exceptions, customer complaints about deliveries.
- **Watch out:** this is a Level 3 use case (Chapter 9). Start with the agent proposing actions for a person to approve.

## Northfield: Seasonal Stock, Approached Carefully

Seasonal stock prediction scored 14 in Chapter 5: high value, low feasibility. Northfield's sales data was spread across an old system and a newer one, with three years of history in one and two in the other. Weather mattered a lot (frost drives plumbing repairs) and the existing planning tool didn't use it.

Instead of a big AI project, the operations director did three modest things:

1. **Asked the existing vendor.** Northfield's inventory planning software had added a forecasting module that could include weather data. A three-month trial on 400 seasonal products cost little and needed no new integration.
2. **Fixed the data first.** IT merged the two sales histories into one clean dataset, a foundation project that also helped quote drafting.
3. **Tracked overrides.** Planners could override any forecast but had to choose a reason from a short list. This showed where the model was weak and where planners knew things the model didn't.

After a winter season, stockouts on the trial products fell, and inventory on them was slightly lower on average. The improvement was real but smaller than the vendor's brochure had promised. Northfield extended the module to all seasonal lines. The operations director's summary: "Not magic. A better tool, used carefully, on better data."

That is a fair description of most successful operations AI.

## Starter Prompt: Supplier Exception Triage

```
Below are 25 emails from suppliers received this week. For each, give
me one row in a table with: supplier, our PO number if mentioned,
what changed (delivery date, quantity, price, product, other), the
old and new values if stated, and how urgent it is (high if it
affects a customer order due in the next 7 days, according to the
open orders list attached). Do not guess any value that isn't in the
email. Sort by urgency.
```

## The Traps in Operations

- **Expecting generative AI to forecast.** Chat assistants are not forecasting engines. Use proper forecasting tools for forecasts, and generative AI for the words around them.
- **Ignoring planners' knowledge.** Experienced planners know about the big customer project, the road closure and the supplier who is always late. Design for their overrides and learn from them.
- **Paraphrased safety instructions.** For anything safety-critical, quote and link the source.
- **Agents before evidence.** Let agents propose before they act.

## Metrics to Track

| Use case | Primary metric | Secondary metric |
| --- | --- | --- |
| Forecasting | Forecast accuracy | Inventory days, stockouts |
| Supplier exceptions | Time from notice to action | Buyer admin hours |
| Procedures assistant | Time to competence | Errors and incidents |
| Maintenance | Unplanned downtime | Mean time to repair |
| Scheduling and routing | Cost per delivery | On-time rate |
| Exception agents | Time to resolve | Delivery complaints |

## Key Points

- Operations uses both predictive AI (forecasting, optimization, maintenance) and generative AI (documents, communication, knowledge).
- Look first at AI modules in the planning and operations software you already use.
- Fix and combine your data as a foundation; it pays off across many use cases.
- Keep planners in control and learn from their overrides.
- Quote, don't paraphrase, safety-critical procedures.

## Questions for Your Leadership Team

1. Where do stockouts, excess stock or expedited freight cost us most?
2. How clean and complete is our operational data, and who owns it?
3. Which operations procedures do new staff struggle with most?
4. What AI features have our planning and logistics vendors released that we haven't tried?
5. Which operational decisions would we be comfortable letting an agent propose? Which would we let it make?
