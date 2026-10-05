# Appendix A: Quick-Reference Prompt Library

This appendix collects 50 ready-to-use prompts. Replace the parts in angle brackets with your own details, and add context generously; the more specific you are, the better the result.

## Writing

**1. First draft**

```
Write a <document type> for <audience> about <topic>. The goal is
to <purpose>. Include <key points>. Tone: <tone>. Length: <length>.
```

**2. Edit for clarity**

```
Edit this for clarity and concision without changing my voice or
meaning. Then list your 5 most important changes.
<text>
```

**3. Simplify**

```
Rewrite this so a 12-year-old could understand it, keeping all
the key facts: <text>
```

**4. Change tone**

```
Rewrite this message to sound <tone, e.g., warmer and more
confident> while keeping it under <length>: <text>
```

**5. Headlines**

```
Give me 10 headlines for this article. Mix curiosity, benefit,
and direct styles. Mark your top 3 and explain why.
<article summary>
```

**6. Outline**

```
Create a detailed outline for a <length> <document> on <topic>
for <audience>, with section headings and 2-3 key points each.
```

**7. Expand notes into prose**

```
Turn these bullet notes into well-written paragraphs. Don't add
facts that aren't in the notes. <notes>
```

**8. Critique**

```
Act as a demanding editor. Identify the 5 biggest weaknesses in
this draft, in order of importance, with specific fixes. <draft>
```

## Summarizing and Understanding

**9. Executive summary**

```
Summarize this in 3 bullet points for a busy executive deciding
<decision>. <document>
```

**10. Key takeaways and actions**

```
From this document, list: the main conclusion, 5 key facts, and
any actions or deadlines. Use only information in the text.
<document>
```

**11. Meeting notes**

```
Turn this transcript into notes with sections: Decisions, Action
Items (owner, task, due date), and Open Questions. Write "None"
for empty sections. <transcript>
```

**12. Explain like I'm new**

```
Explain <concept> to someone with a background in <field>. Use an
analogy, then an example, then 3 questions to check understanding.
```

**13. Compare documents**

```
Compare these two versions. List every substantive change in a
table: Section, Before, After, Significance.
<version 1> <version 2>
```

**14. Q&A from a document**

```
Answer my question using only the document below. Quote the
relevant passage first. If the answer isn't there, say so.
<document> Question: <question>
```

## Learning

**15. Learning plan**

```
Create a <weeks>-week plan to learn <skill> to the level of
<goal>, with <hours> hours per week, free resources, and weekly
milestones.
```

**16. Socratic tutor**

```
Be my Socratic tutor for <topic>. Ask guiding questions instead
of giving answers. Give a hint only after two wrong attempts.
```

**17. Quiz me**

```
Quiz me on <topic> with 10 questions of increasing difficulty,
one at a time. Explain each answer after I respond.
```

**18. Flashcards**

```
Create 20 flashcards from this material in a two-column table:
Question | Answer. <material>
```

## Analysis and Decisions

**19. Decision matrix**

```
Compare <options> against these criteria: <criteria with weights>.
Show a scored table, then recommend one and list your assumptions.
```

**20. Pre-mortem**

```
Imagine <plan> failed a year from now. List the 7 most likely
reasons, with an early warning sign and a prevention step for each.
```

**21. Devil's advocate**

```
Steelman the strongest case against this argument, then tell me
which objection I most need to address. <argument>
```

**22. SWOT analysis**

```
Create a SWOT analysis for <business/idea> in <market>. Be
specific to my situation: <context>.
```

**23. Root cause analysis**

```
Problem: <problem>. Use the "5 Whys" method to explore likely root
causes. Then suggest how to verify the most likely cause.
```

**24. Data insights**

```
Analyze this data. Describe key trends, anomalies, and 3 possible
explanations. Show calculations. Note what extra data would help.
<data>
```

## Communication

**25. Difficult email**

```
Write an email to <recipient> about <situation>. I need <outcome>.
Tone: <tone>. Give a direct version and a diplomatic version.
```

**26. Reply to a complaint**

```
Draft a reply to this customer complaint. Acknowledge the issue,
apologize once, explain next steps, and keep it under 150 words.
<complaint>
```

**27. Meeting prep**

```
I'm meeting <person> about <topic> to achieve <goal>. List my 3
key messages, their 5 likely objections with responses, and a
strong opening line.
```

**28. Role-play practice**

```
Role-play as <role> so I can practice <scenario>. Push back
realistically. After 6 exchanges, give me feedback.
```

**29. Presentation outline**

```
Create a 10-slide presentation outline on <topic> for <audience>.
For each slide: title, 3 bullet points, and a speaker note.
```

**30. Social post**

```
Write a <platform> post announcing <news> for <audience>. Hook in
the first line, one concrete detail, clear call to action, under
<length>.
```

## Career and Business

**31. Resume bullets**

```
Rewrite these resume bullets to start with action verbs and show
measurable results. Ask me for numbers if needed. <bullets>
```

**32. Cover letter**

```
Write a cover letter for <job> at <company>. Match my experience
<summary> to their top 3 requirements <requirements>. Under 300
words, confident, not generic.
```

**33. Interview prep**

```
List 10 likely interview questions for <role> at <company type>,
with strong answer frameworks based on my background: <summary>.
```

**34. Business idea validation**

```
Evaluate this business idea: <idea>. Cover target customers,
competition, risks, and the 3 cheapest ways to test demand.
```

**35. Marketing personas**

```
Create 3 customer personas for <product>, each with goals, pain
points, objections, and where they spend time online.
```

**36. Product description**

```
Write a product description for <product> with features
<features> for <audience>. 50-word paragraph plus 4 benefit
bullets. No hype words.
```

## Planning and Productivity

**37. Project plan**

```
Create a project plan for <project> due <date>, team <team>.
Table with phases, tasks, owners, durations, dependencies; then
top 5 risks with mitigations.
```

**38. Prioritize tasks**

```
My goal this week is <goal>, with <hours> focused hours. Sort
these tasks into Do Today, This Week, Delegate, Drop, with reasons.
<tasks>
```

**39. Break down a big task**

```
Break <large task> into steps that each take under 1 hour. Order
them logically and mark which can be done in parallel.
```

**40. Weekly review**

```
Here's what I did this week and my goals: <notes>. Summarize
progress, identify what's slipping, and suggest 3 priorities for
next week.
```

## Coding and Technical

**41. Explain code**

```
Explain what this code does, step by step, for a developer new to
the codebase. Flag edge cases and potential bugs. <code>
```

**42. Debug**

```
This code fails with the error below. Expected: <expected>.
I've tried: <attempts>. Find the cause and propose a fix.
<code> <error>
```

**43. Write tests**

```
Write unit tests for <function> covering normal cases, boundary
values, and invalid inputs, using <framework>. <code>
```

**44. Code review**

```
Review this code for correctness, security, and performance
issues, in that order. Explain each issue and suggest a fix.
<code>
```

**45. Spreadsheet formula**

```
In <Excel/Google Sheets>, column A has <data>, column B has
<data>. Write a formula that <goal>, and explain how it works.
```

## Prompts About Prompts

**46. Improve my prompt**

```
Review this prompt for ambiguity, missing context, and conflicting
instructions. Then rewrite it to be clearer. <prompt>
```

**47. Interview me first**

```
I want help with <task>. Before starting, ask me up to 8 questions
about anything you need to do it well.
```

**48. Generate a system prompt**

```
Write a system prompt for an AI assistant that <purpose> for
<users>. Include identity, audience, knowledge sources, response
style, boundaries, and two example exchanges.
```

**49. Create test cases**

```
Generate 20 diverse test inputs for this prompt, including edge
cases and tricky cases, with a note on what a good output must
do for each. <prompt>
```

**50. Diagnose a failure**

```
I gave you this prompt <prompt> and got this output <output>, but
I wanted <desired result>. Explain what in the prompt caused the
gap, and rewrite the prompt to fix it.
```
