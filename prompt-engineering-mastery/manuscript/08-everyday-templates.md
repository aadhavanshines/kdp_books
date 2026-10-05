# Chapter 8: Prompt Patterns for Everyday Work

This chapter turns the techniques you've learned into ready-to-use patterns for the tasks people use AI for most: writing, summarizing, research, learning, analysis, planning, and communication. Adapt them freely. Each pattern is a starting point, not a script.

## Writing and Editing

### Drafting from Scratch

```
Write a <type of document> for <audience>.
Purpose: <what it should achieve>.
Key points to include:
- <point 1>
- <point 2>
- <point 3>
Tone: <adjectives>.
Length: <length>.
Avoid: <clichés, jargon, or topics to avoid>.
```

### Editing Your Own Writing

```
Edit the text below for clarity and concision. Keep my voice and
all factual content. Do not add new ideas.
After the edited version, list the 5 most significant changes you
made and why.

<text>
<your text>
</text>
```

Asking for a list of changes helps you learn and lets you reject edits you disagree with.

```
Example output (the list of changes):
1. Cut "I just wanted to reach out to say" to "I'm writing to".
2. Merged two sentences that repeated the deadline.
3. Moved the request to the first paragraph so it isn't missed.
4. Replaced "utilize" with "use".
5. Split a 48-word sentence into two.
```

### Changing Tone or Audience

```
Rewrite this technical update for <audience>. They care about
<what they care about>, not technical details. Keep it under
<length>. Preserve every date and number exactly.
```

### Overcoming the Blank Page

```
I need to write <document> about <topic>. I'm stuck. Ask me 5
questions that will help me figure out what I actually want to
say. After I answer, propose an outline.
```

## Summarizing

Summaries are only useful if they serve a purpose. Always say who the summary is for and what they'll do with it.

```
Summarize the document below for <audience>, who need to
<decision or action>.
Include:
1. The main conclusion in one sentence.
2. The 3-5 key points that support it.
3. Any risks, deadlines, or required actions.
Use only information from the document.

<document>
...
</document>
```

**Variants:**

- **Executive summary:** "3 bullet points a CEO can read in 20 seconds."
- **Progressive summary:** "Give a one-sentence summary, then a one-paragraph summary, then a detailed summary."
- **Focused summary:** "Summarize only what this report says about pricing."
- **Meeting notes:** Use the template from Chapter 6 with decisions, action items, and open questions.

## Research and Learning

### Explaining a New Topic

```
Explain <topic> to me. I have background in <your background> but
I'm new to this. Start with a simple analogy, then the core
concepts, then one real-world example. Finish with 3 questions
to check my understanding.
```

For example, asked to explain compound interest to someone with a background in cooking, a model replied:

```
Example output:
Think of a sourdough starter. You feed it, it grows, and next
time you feed the bigger starter, so it grows even more. Money
works the same way: interest is added to your savings, and next
year you earn interest on that bigger amount too...
Check your understanding:
1. Why does a balance grow faster in year 10 than in year 1?
```

### The Learning Plan

```
I want to learn <skill> well enough to <goal> in <time frame>,
with about <hours> per week. Create a week-by-week plan with
specific activities and free resources. Include a way to measure
progress each week.
```

### The Socratic Tutor

```
Act as a Socratic tutor for <subject>. Don't give me answers
directly. Ask guiding questions that help me work it out myself.
If I'm stuck after two attempts, give a small hint.
Today's problem: <problem>
```

### Research Starting Point

```
I'm researching <question>. Give me:
1. The main schools of thought or positions on this.
2. Key terms I should search for.
3. The types of sources that would be most authoritative.
4. Common misconceptions.
Flag anything you're uncertain about, and remind me to verify
facts and citations independently.
```

> **Warning:** When researching, prefer search-enabled tools that show their sources, and open the sources to confirm they say what the AI claims. Never cite a source you haven't checked.

## Analysis and Decisions

### Pros and Cons with Recommendation

```
I'm deciding between <option A> and <option B>.
My situation: <context>.
What matters most to me: <priorities in order>.
Compare the options against my priorities in a table, then
recommend one. List the assumptions behind your recommendation.
```

### Pre-Mortem

```
Imagine it's one year from now and <project/plan> has failed.
Write the 7 most likely reasons it failed, ranked by likelihood.
For each, suggest one early warning sign and one prevention step.
```

For a plan to launch a weekend food stall, the first lines of a pre-mortem answer might read:

```
Example output (first 3 of 7):
1. Not enough foot traffic at the chosen market.
   Warning sign: under 50 sales in the first two weekends.
   Prevention: visit the market on two weekends before booking
   and count passers-by per hour.
2. Costs higher than expected (permits, waste, packaging).
   Warning sign: margin below 40% after week one.
   Prevention: build a full cost sheet, including permits.
3. Owner burnout from weekday job plus weekends.
   Warning sign: skipping prep or opening late.
   Prevention: recruit a part-time helper before launch.
```

The pre-mortem is one of the most valuable prompts for any plan, because it bypasses the optimism bias that affects both humans and agreeable AI models.

### Devil's Advocate

```
Here is my argument: <argument>.
Take the strongest possible opposing position. Steelman it: make
the best case a smart, informed critic would make. Then tell me
which of your points I most need to address.
```

### Data Interpretation

```
Here is data from <source>: <paste data or attach file>.
1. Describe the main patterns and trends.
2. Point out anything surprising or anomalous.
3. Suggest 3 possible explanations for the main trend.
4. List what additional data would help confirm them.
Show any calculations you perform.
```

## Communication

### Difficult Email

```
Help me write an email to <recipient and relationship>.
Situation: <what happened>.
What I need: <outcome>.
Constraints: <what I can and can't offer>.
Tone: <e.g., firm but respectful>.
Write two versions: one more direct, one more diplomatic.
```

Here is the "direct" version for a request to a landlord to fix a broken heater:

```
Example output:
Subject: Heater repair needed by Friday

Hi Mr. Kumar,
The heater in my flat stopped working on Monday, and nights are
now below 10 C. Please arrange a repair by Friday, 18 October.
I'm available to let a technician in any weekday after 4 pm.
Thank you,
Arjun (Flat 3B)
```

### Preparing for a Conversation

```
I have a <meeting type> with <person/role> about <topic>.
My goal: <goal>. Their likely concerns: <concerns>.
Help me prepare: list my 3 key messages, the 5 toughest questions
they might ask with suggested answers, and a strong opening line.
```

### Role-Play Practice

```
Role-play as a <role, e.g., skeptical investor> so I can practice
<pitch/negotiation/interview>. Stay in character and respond
realistically, including pushback. After 6 exchanges, step out of
character and give me feedback on what I did well and what to
improve.
```

## Planning and Productivity

### Project Plan

```
Create a project plan for <project>.
Deadline: <date>. Team: <people and roles>. Budget: <amount>.
Output a table with phases, tasks, owners, durations, and
dependencies. Then list the top 5 risks with mitigations.
```

### Prioritization

```
Here is my task list: <tasks>.
My most important goal this week is <goal>. I have about <hours>
of focused time. Sort the tasks into: Do Today, Do This Week,
Delegate, and Drop. Explain your reasoning briefly for each.
```

### Turning Notes into Action

```
Here are my rough notes from <context>. Turn them into:
1. A clean summary.
2. A list of action items with owners (if mentioned).
3. Questions that need follow-up.
Don't add information that isn't in the notes.
```

## Building Your Personal Prompt Library

The patterns in this chapter will be most valuable when customized to your work. Start a personal prompt library:

1. Create a document or notes folder for prompts.
2. Each time a prompt produces excellent results, save it with a name, a description of when to use it, and placeholders for the parts that change.
3. Record notes about what you changed and why.
4. Turn your most-used prompts into persistent assistants using features like ChatGPT plugins, Claude Projects, or Gemini Gems, which the next part of this book covers.

> **Try It:** Pick the three tasks you do most often at work. Adapt a pattern from this chapter for each, test them on real work this week, and save the improved versions to your library.

## Key Takeaways

- Reusable patterns save time and make results consistent.
- Every summary, analysis, and draft is better when you state the audience and purpose.
- Pre-mortems, devil's advocate, and role-play prompts counter AI's tendency to agree.
- Build a personal prompt library and refine it continuously.
