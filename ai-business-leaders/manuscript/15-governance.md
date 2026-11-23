# Part IV: Governing and Scaling

# Chapter 15: Governance Without Bureaucracy

Governance has a bad name. To many managers it means committees, forms and delays. With AI, poor governance fails in two opposite directions. Too little, and you get data leaks, embarrassing mistakes in front of customers, and legal exposure. Too much, and every AI idea waits months for approval, so people use unapproved tools anyway and you get all the risk with none of the control.

Good AI governance is light where risk is low and careful where risk is high. This chapter shows how to set that up in a few weeks, with a one-page policy, a simple risk-tier system and a small group that meets once a month.

## The Three Parts of Light Governance

1. **A one-page AI use policy** that tells every employee what they can and can't do.
2. **Risk tiers** that decide how much review each AI use case needs.
3. **A small AI council** that approves higher-risk use cases, keeps a register of what is running, and reviews results.

## Part 1: The One-Page AI Use Policy

Most employees will never read a 20-page AI policy. They will read one page, especially if it is clear and practical. A good policy answers five questions:

1. **Which tools can I use?** Name the approved tools. Say how to request a new one.
2. **What information can I put into them?** Be specific about what is never allowed.
3. **What must I check?** The employee is responsible for anything they send, publish or decide using AI.
4. **When must I tell people AI was used?** For example, in customer communications or published content.
5. **Who do I ask?** A named person or mailbox.

Here is the core of Northfield's policy. The full version is in Appendix A.

> **Note:** **Use approved tools only:** [approved assistant] for general work; [help desk AI] in customer service. Ask IT to approve anything else; we aim to answer within five working days. **Never enter:** customer personal data in tools not approved for it; employee personal data; passwords or bank details; unannounced financial results; confidential deal or legal information. **Always check** facts, figures, names and anything sent outside the company. You are responsible for what you send. **Be open:** don't present AI output as a personal opinion or as checked by an expert unless it was. **Never** use AI to make decisions about hiring, pay, promotion or discipline. **Ask:** ai-help@[company].

Publish the policy, train people on it in under an hour, and update it every six months.

## Part 2: Risk Tiers

Not every AI use case deserves the same review. Sort them into three tiers.

### Tier 1: Low Risk (Self-Service)

- Personal productivity with approved tools: drafting, summarizing, research, brainstorming.
- Internal content where a person checks everything.
- No customer, employee or confidential data beyond what the approved tool is cleared for.

**Review needed:** none beyond following the policy. Teams just get on with it.

### Tier 2: Medium Risk (Light Review)

- AI output that reaches customers, suppliers or the public after a person checks it.
- AI connected to company systems or data.
- Use of personal data within an approved tool.
- New vendors or tools.

**Review needed:** a short checklist (below), completed by the project owner and signed off by IT and, where personal data is involved, the privacy lead. Target: a decision within two weeks.

### Tier 3: High Risk (Council Review)

- AI that takes actions on its own affecting customers, money or employees.
- AI involved in decisions about individuals: hiring, credit, pricing to individuals, access to services.
- Sensitive data at scale: health, financial, children's data.
- Uses where the law imposes specific obligations.

**Review needed:** the AI council approves, with legal input, a documented risk assessment and a monitoring plan. Target: a decision within four to six weeks.

Most use cases fall into Tiers 1 and 2. At Northfield, the product descriptions were Tier 1; the customer email pilot was Tier 2; the delivery rebooking agent, when it came, would be Tier 3.

## The Tier 2 Checklist

Ten questions, one page. If every answer is satisfactory, the project proceeds.

1. What does the AI do, and who checks its output?
2. What data does it use, and is the tool approved for that data?
3. Where is data processed and stored, and does the vendor use it for training?
4. Who can see the AI's outputs and the data it uses?
5. What could go wrong, and what would the effect be on a customer, employee or the company?
6. How will errors be noticed and corrected?
7. Will people know they are dealing with AI where that matters?
8. How do users report a problem?
9. How will we measure quality over time?
10. Who owns this use case, and who can switch it off?

## Part 3: The AI Council

A mid-sized company needs a small group, not a large committee. Northfield's AI council had six members:

- The chief operating officer (chair)
- The CFO
- The head of IT
- The legal and privacy lead
- One business leader with a live AI project (rotating)
- The AI program lead (the person who coordinates the portfolio)

It met for one hour a month and had four jobs:

1. **Approve Tier 3 use cases** and resolve any disputed Tier 2 decisions.
2. **Keep the AI register:** a simple list of every AI use case in production, its owner, tier, vendor, data used and latest results.
3. **Review results:** are pilots hitting their targets? Are production use cases still delivering?
4. **Update the policy** as tools, risks and rules change.

> **Tip:** The AI register is the most useful governance tool you can have, and the simplest. A spreadsheet is fine. When the board, an auditor, a regulator or a customer asks "Where do you use AI?", you can answer in minutes instead of weeks.

For a smaller company, the "council" can be the owner and one other person reviewing the register once a quarter.

## Principles Behind the Rules

Rules can't cover every situation. Give people a few principles they can apply when the policy is silent. Northfield used five:

1. **A person is accountable.** Every AI output that matters has a named person responsible for it.
2. **Check in proportion to impact.** The bigger the consequence of an error, the more careful the check.
3. **Be honest about AI.** Don't hide its use where people would reasonably want to know.
4. **Protect people's data.** Use the least data needed, in approved tools only.
5. **Be fair.** Don't use AI in ways that treat people unfairly, and check for it where decisions affect people.

## Monitoring What's Running

Governance doesn't end at approval. AI use cases can drift: a vendor changes the underlying model, your data changes, or a new kind of customer request appears that the instructions don't cover. For every Tier 2 and Tier 3 use case, monitor:

- **Quality:** a regular sample of outputs reviewed by a person.
- **Usage:** adoption, and unusual spikes or drops.
- **Complaints and flags:** from customers, staff and users.
- **Changes:** vendor notices about model or feature updates.

Set a threshold for each: the level at which the owner must investigate, and the level at which the use case is paused.

## What Good Looks Like

After six months, Northfield's governance looked like this:

- A one-page policy every office employee had been trained on.
- An approved assistant used weekly by about 60 percent of office staff.
- An AI register with 11 entries: 7 Tier 1, 3 Tier 2, 1 Tier 3 under review.
- An average of nine working days to approve a Tier 2 use case.
- No significant AI incidents, and two minor ones (a wrong delivery date sent to a customer, caught and corrected the same day; a draft product description that included a competitor's brand name) logged and used to improve instructions.

None of it required a new department or a thick binder.

## Key Points

- Good AI governance is light where risk is low and careful where risk is high.
- Publish a one-page AI use policy and train everyone on it.
- Sort use cases into three risk tiers with matching review: none, a short checklist, or council approval.
- A small AI council meeting monthly can approve high-risk uses, keep the AI register and review results.
- Give people principles for situations the rules don't cover.
- Monitor running use cases for quality, usage, complaints and vendor changes.

## Questions for Your Leadership Team

1. Do all our employees know which AI tools they may use and what they must never put into them?
2. How long does it take today to get an AI use case approved? Is that fast enough?
3. Who would be on our AI council?
4. Do we have a list of every AI use case running in our company today?
5. What are our principles for AI, in five lines or fewer?
