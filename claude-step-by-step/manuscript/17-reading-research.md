# Chapter 17: Reading, Understanding and Research

Reading is where Claude saves the most hours for the most people. A 60-page report becomes one page; a confusing letter becomes three plain sentences; a pile of product reviews becomes a table. These eight workflows cover the reading you probably do every week.

## Workflow 9: A Long PDF into a One-Page Brief

**For:** reports, policies, research papers, board packs. **You'll use:** file upload (Chapter 6). **Time:** 3 minutes.

```prompt
Turn this report into a one-page brief for my director, who has 2 minutes. Structure: the bottom line in two sentences; five key findings with the page number for each; three decisions or actions for us; and anything surprising or worrying. Plain English. Quote numbers exactly as they appear.
```

The page numbers are the secret. They let you (and your director) jump straight to the source to check any point. "Quote numbers exactly" stops Claude from rounding or recalculating. **Next:** "What does the report *not* say that we'd need to know before deciding?" **Make it repeatable:** Make it a skill called "Director brief."

## Workflow 10: Decode a Confusing Letter

**For:** insurance letters, tax notices, bank statements, letters from a landlord or school. **You'll use:** a photo of the letter. **Time:** 2 minutes.

```prompt
I got this letter from my health insurer and I don't understand it. In plain English: what is it saying, do I owe anything, is there a deadline, and what exactly should I do next? If anything is unclear, tell me what to ask them when I call.
```

```result
In plain English: your insurer has partly denied the claim for your MRI on October 14. They paid $410 of the $1,260 bill because the scan wasn't pre-approved.

Do you owe anything? Possibly $850, but not yet. The letter says this is an "Explanation of Benefits," not a bill.

Deadline: you can appeal within 180 days of the date on the letter. It is dated November 20, so the deadline is about May 19, 2027.

What to do next:
1. Ask your doctor's office whether they requested pre-approval. If they did, ask them to send the approval number to the insurer.
2. Don't pay the imaging center's bill until the appeal is decided. Call them and ask them to put the account on hold.
3. If the office didn't request approval, ask them to file a "retroactive authorization."

Questions to ask when you call: Was a prior authorization request received? Can the claim be reprocessed if the doctor sends one now? What's the reference number for my call?
```

**Make it repeatable:** Keep a "Household Paperwork" project so Claude can refer back to earlier letters from the same company.

## Workflow 11: Meeting Notes into Minutes and Actions

**For:** after any meeting with notes, a whiteboard or a recording transcript. **You'll use:** a photo of the whiteboard, or pasted notes. **Time:** 3 minutes.

```prompt
Turn these notes from today's PTA meeting into minutes: attendees, decisions made, and a table of actions with owner and due date. If an action has no owner or date, list it separately under "Needs an owner." Keep it under one page.
```

The "Needs an owner" section is what makes minutes useful: it shows exactly what will be forgotten unless someone takes it. **Next:** "Write a short email to the attendees with the minutes and a friendly reminder of their actions." **Make it repeatable:** A skill, or a project for the group with past minutes as examples.

## Workflow 12: Choose Between Products with Research

**For:** any purchase over about $200. **You'll use:** Research (Chapter 11). **Time:** 10 minutes, mostly waiting.

```prompt
Research: I need a laptop for a college student studying graphic design. Budget $1,200. Must run Adobe Photoshop and Illustrator smoothly, weigh under 4 lb, and last a full day on battery. Compare the 4 best current options on performance for design work, screen color accuracy, weight, battery life, and reliability complaints. Finish with a table and one recommendation, with sources.
```

**Next:** Click the sources for your top two choices and check the current price on the retailer's site. **Make it repeatable:** Keep the request as a template: "I need a [thing] for [who/what]. Budget [X]. Must [three must-haves]. Compare on [what matters]."

## Workflow 13: Prepare for a Doctor's Appointment

**For:** understanding a diagnosis, test result or treatment option, so you can ask better questions. **You'll use:** a chat; optionally a photo of the result (remove your ID numbers first). **Time:** 5 minutes.

```prompt
My doctor said my blood test shows "borderline high LDL cholesterol" (my LDL is 152). I'm 47, I don't smoke, and my father had a heart attack at 60. I see her again next week. Explain in plain English what this means, what usually affects it, and give me the 8 most useful questions to ask her. I won't make any changes without her advice.
```

The last sentence tells Claude how you'll use the answer, which keeps it useful rather than full of warnings. Claude explains the result, the usual factors (diet, exercise, genetics, other conditions), and gives you specific questions, such as whether your family history changes her advice. **Remember:** Claude helps you prepare; your doctor makes the decisions with you. **Make it repeatable:** An incognito chat (Chapter 10) if you'd rather this isn't kept in your history.

## Workflow 14: Catch Up on a Long Email Thread

**For:** coming back from vacation, or being added to a thread with 40 replies. **You'll use:** pasted text, or the Gmail connector (Chapter 12). **Time:** 2 minutes.

```prompt
Here's an email thread about our office move that I've just been added to. Tell me: what's been decided, what's still open, who's waiting on whom, and is anything waiting on me? Then suggest a short reply that shows I've caught up.
```

With the Gmail connector, you can say "Find the thread about the office move from this month" instead of pasting. **Make it repeatable:** Part of the weekday briefing in Workflow 47.

## Workflow 15: Check a Claim Before You Share It

**For:** a viral post, a surprising statistic, a "miracle" product, a news story that sounds too neat. **You'll use:** a chat with web search. **Time:** 3 minutes.

```prompt
A post going around says "Drinking a glass of warm lemon water every morning burns 300 extra calories a day." Search the web and check this. What do reliable sources say? Rate the claim as true, partly true, misleading or false, explain why in three sentences, and give me the sources.
```

**Tip:** Ask Claude to prefer sources such as government health agencies, universities and established news organizations, and to tell you if it can't find any reliable source at all. **Make it repeatable:** Save it as a skill called "Fact check" so you can paste any claim and get the same structured verdict.

## Workflow 16: Learn a New Topic in an Hour

**For:** a new job, a new hobby, a meeting on a subject you know nothing about. **You'll use:** a chat; Research for depth. **Time:** 30 to 60 minutes.

```prompt
I start a new job at a solar panel installer on Monday, in the office, not on roofs. I know nothing about solar. Give me a one-hour crash course: the 10 terms I'll hear most (with plain explanations), how a typical home installation works from first call to switch-on, the main things customers worry about, and 5 smart questions I could ask in my first week.
```

**Next:** "Quiz me on the 10 terms, one at a time, and tell me if I'm right." Then: "Make flashcards of these terms as an artifact." **Make it repeatable:** A "New Job" project where you add notes as you learn, so Claude builds on what you already know.
