# Chapter 9: Customer Service

Customer service is where many companies see their first measurable AI return. The work is high-volume, mostly language, governed by policies, and easy to check. It is also where AI mistakes are most visible to customers, so the design choices matter.

## Three Levels of AI in Service

It helps to think of AI in customer service as three levels, each building on the one before.

**Level 1: Assist the agent.** AI drafts replies, summarizes long email threads, suggests answers from your knowledge base, and fills in after-call notes. A person sends every reply. This is the safest level and often delivers most of the value.

**Level 2: Answer simple questions directly.** A chat assistant on your website or an AI reply to email answers routine questions ("Where is my order?", "What are your opening hours?", "How do I return this?") without a person, and hands everything else to an agent with a summary.

**Level 3: Take actions.** An AI agent not only answers but acts: reschedules a delivery, issues a small refund, updates an address, within rules you set.

Most companies should start at Level 1, move routine questions to Level 2 once they have evidence of accuracy, and approach Level 3 carefully, one action at a time.

## Use Cases That Pay Back

### 1. Drafted Replies (Level 1)

AI reads the customer's message, looks up the relevant order or account, and drafts a reply for the agent to check and send.

- **Value:** lower handling time, so the same team handles more volume; faster responses.
- **Measure:** handling time per contact, time to first reply, adoption (share of drafts used).

### 2. Conversation Summaries and Routing

AI summarizes every new contact in one line, tags its topic and urgency, and routes it to the right team. Senior agents get the hard cases with the history already summarized.

- **Value:** less time reading, fewer misrouted contacts, faster handling of urgent issues.
- **Measure:** misrouting rate, time to resolution for complex cases.

### 3. Knowledge Answers for Agents

Agents ask a question in plain language ("What's the warranty on this boiler if it was installed by a non-certified fitter?") and get an answer from your policies and manuals, with the source.

- **Value:** faster answers, more consistent answers, faster training of new agents.
- **Measure:** time to competence for new hires, consistency in quality reviews.

### 4. Self-Service for Routine Questions (Level 2)

A website chat or email auto-reply that answers routine questions directly.

- **Value:** fewer contacts reaching agents ("deflection"), service outside working hours.
- **Measure:** share resolved without an agent, customer satisfaction on those contacts, and **the rate at which customers come back with the same issue**. A high "resolution" number means nothing if customers contact you again the next day.

### 5. Quality Review at Scale

Instead of a team leader reviewing 2 percent of conversations, AI can review all of them against your quality checklist and flag the ones that need a person's attention.

- **Value:** better coaching, earlier warning of problems, fewer complaints that escalate.
- **Measure:** complaints, escalations, quality scores over time.

## Northfield's Pilot Design

Northfield's flagship project was Level 1: drafted replies inside the help desk. The design choices that mattered most:

- **The draft appears automatically.** When an agent opens an email, the AI draft is already there in the reply box. No extra click, no separate window. This was the single biggest factor in adoption.
- **Sources are shown.** Under each draft, the agent sees which order, delivery record or policy the AI used. Checking became a matter of glancing at the source, not searching for it.
- **Easy feedback.** A thumbs-up or thumbs-down on every draft, with an optional note. The product owner reviewed the thumbs-down drafts weekly and adjusted the instructions.
- **Clear limits.** The AI was instructed never to promise delivery dates the system didn't show, never to offer credits or discounts, and to flag any email mentioning legal action, injury or a safety issue straight to a senior agent.

Here is a simplified version of the instructions Northfield gave the AI:

```
You draft replies to customer emails for Northfield Supply, a
building and plumbing supplies distributor. Customers are mostly
trade contractors. Write in a friendly, direct, professional tone.
Keep replies under 120 words unless the question needs more.

Use only the order, delivery, stock and account information provided
with each email, and the policies in the knowledge base. If the
information needed to answer is missing, write a short reply saying
we are checking and will come back by a specific time, and add an
internal note saying what is missing.

Never: promise a delivery date not shown in the delivery record;
offer credits, refunds or discounts; give technical installation
advice beyond the manufacturer's documents; guess.

If the email mentions legal action, injury, a safety issue, or a
complaint about a staff member, do not draft a reply. Add the tag
ESCALATE and a one-line summary for a senior agent.
```

## Moving to Level 2 Safely

After the pilot, Priya's team looked at which kinds of routine emails the agents almost never edited. Order-status questions where the delivery record was complete fell into that group: agents sent the draft unchanged 94 percent of the time, and quality review found almost no errors.

That became the evidence for the next step: sending those replies automatically, with three safeguards:

1. Only for one narrow type of question, where the data was complete.
2. Every automatic reply invited the customer to reply "agent" to reach a person.
3. A weekly review of a sample, and an alert if the re-contact rate rose.

This is the pattern to follow: **expand automation one narrow category at a time, on evidence, with a clear way back to a person.**

> **Warning:** Be honest with customers about when they are talking to AI. Some places now require it by law, and customers who discover it later feel deceived. A simple line such as "This reply was prepared by our AI assistant. Reply 'agent' to reach a member of our team" is enough.

## The Traps in Customer Service

- **Measuring deflection, not resolution.** A chatbot that "handles" 60 percent of contacts but leaves customers frustrated and calling back has made things worse. Always measure re-contact and satisfaction alongside deflection.
- **Hiding the human.** Making it hard to reach a person to push deflection numbers up damages loyalty. Make the way out obvious.
- **A stale knowledge base.** AI answers from your documents. If the returns policy changed in March and the document didn't, the AI will be confidently wrong. Someone must own the knowledge base.
- **Cutting staff before the evidence is in.** Reduce hiring for growth first, as Northfield did, then adjust staffing once results are stable. Cutting too early loses the experienced agents who handle the hard cases and teach the AI's instructions.

## Metrics to Track

| Metric | What it tells you |
| --- | --- |
| Adoption: share of AI drafts used | Whether agents trust and use the tool |
| Handling time per contact | Efficiency |
| Time to first reply | Customer experience |
| Edit rate: share of drafts changed before sending | AI quality, and where instructions need work |
| Re-contact rate within 7 days | Whether issues were really resolved |
| Customer satisfaction | The customer's view |
| Errors found in quality review | Safety |

## Key Points

- Start with AI assisting agents (Level 1), then move narrow, proven categories to self-service (Level 2), and approach autonomous actions (Level 3) with care.
- Put AI drafts where agents already work, show sources, and make feedback easy.
- Measure resolution and re-contact, not just deflection.
- Keep the knowledge base current and make a person easy to reach.
- Absorb growth before reducing staff, and let the evidence lead.

## Questions for Your Leadership Team

1. What share of our customer contacts are routine, and how do we know?
2. Who owns our knowledge base today, and how current is it?
3. What would customers say if they found out a reply was written by AI?
4. What evidence would we need before letting AI reply to customers without a person?
5. How do we measure whether a customer's problem was actually solved?
