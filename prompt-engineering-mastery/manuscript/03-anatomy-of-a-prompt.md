# Chapter 3: The Anatomy of a Great Prompt

You now know that models need context and specificity. But what context, exactly? And how should it be organized? This chapter gives you a reusable blueprint that works for nearly any task on any model.

## The Six-Part Prompt Blueprint

A strong prompt usually contains some combination of six elements. Think of them as six questions you answer for the model:

| Element | Question it answers | Example |
| --- | --- | --- |
| Role | Who should the model be? | "You are a senior HR advisor." |
| Task | What exactly should it do? | "Draft a policy on remote work." |
| Context | What background does it need? | "We are a 40-person design agency in Toronto." |
| Instructions | How should it go about it? | "Cover eligibility, equipment, and hours." |
| Format | What should the output look like? | "Use headings, under 600 words." |
| Examples | What does good look like? | "Match the tone of this sample: ..." |

Not every prompt needs all six. A quick question may need only a task. A complex, repeated task benefits from all of them. Let's look at each.

### 1. Role

Giving the model a role sets its expertise, vocabulary, perspective, and standards.

```
You are an experienced pediatric nurse explaining things to
worried first-time parents.
```

Roles work because they activate relevant knowledge and a relevant style. "Explain inflation" gives a general answer. "As an economics teacher explaining to 12-year-olds, explain inflation" gives a very different, targeted one.

Make roles specific. "You are an expert" adds little. "You are a tax accountant who specializes in freelancers in the United Kingdom" adds a lot.

> **Tip:** A role is most powerful when combined with an audience. Who is speaking and who is listening together determine the right level of detail and tone.

### 2. Task

The task is the core action. State it clearly, with a strong verb: write, summarize, compare, classify, extract, translate, critique, plan, explain, rewrite, generate.

Vague tasks produce vague results:

- Vague: "Help me with my resume."
- Clear: "Rewrite the bullet points in my resume's work experience section so each starts with an action verb and includes a measurable result."

If there are several tasks, number them so none get skipped.

### 3. Context

Context is the background that the model cannot know on its own. It is usually the single biggest lever for improving output quality. Useful context includes:

- **Purpose:** Why do you need this? What will it be used for?
- **Audience:** Who will read it? What do they already know? What do they care about?
- **Situation:** Relevant facts, history, constraints, and stakes.
- **Source material:** Documents, data, notes, or prior drafts.

Compare:

```
Write an email declining the meeting.
```

```
Write an email declining a meeting invitation from a potential
vendor. Context: we already chose another supplier last week, but
we were impressed by their proposal and may need them next year.
I want to keep the relationship warm without giving false hope.
```

The second prompt produces an email you can actually send.

### 4. Instructions

Instructions describe how to do the task: steps to follow, points to cover, rules to obey, and things to avoid.

```
Instructions:
1. Start by summarizing the customer's complaint in one sentence.
2. Apologize once, sincerely, without excessive language.
3. Explain the refund process in plain terms.
4. Do not promise delivery dates.
5. End with a direct contact option.
```

Two principles make instructions more effective:

**Say what to do, not only what not to do.** "Don't be too formal" is weaker than "Write in a friendly, conversational tone, as if speaking to a colleague." Negative instructions leave the model guessing about what you do want. Use them for genuine hard limits, but pair them with positive guidance.

**Explain the reason behind a rule.** "Keep sentences short, because many readers use screen readers or read on mobile" helps the model apply the rule intelligently, including in situations you didn't anticipate.

### 5. Format

Specify the shape of the output: length, structure, style, and file type.

- Length: "in 3 sentences," "about 300 words," "no more than 5 bullet points."
- Structure: "a table with columns for Feature, Benefit, and Price."
- Style: "plain text without Markdown," "use H2 headings," "write in the second person."
- Machine-readable: "return valid JSON matching this schema."

Format instructions are some of the most reliably followed, so use them. They save you editing time.

### 6. Examples

Showing is often more effective than telling. One or more examples of the desired output, called **few-shot prompting**, communicate tone, length, structure, and quality in a way descriptions can't.

```
Write product taglines in this style:

Example 1 (our tea brand): "Slow down. Steep. Breathe."
Example 2 (our candle brand): "Light it. Let the day go."

Now write 5 taglines for a lightweight travel backpack.
```

Chapter 4 explores examples in depth, including how to avoid having the model copy them too closely.

## Putting It All Together

Here is a complete prompt using all six elements:

```
Role: You are a senior content strategist for B2B software
companies.

Task: Write a LinkedIn post announcing our new feature.

Context:
- Company: Taskorra, a project management tool for agencies.
- Feature: automatic time tracking that logs hours from calendar
  events and task activity.
- Audience: agency owners and operations managers who hate chasing
  timesheets.
- Goal: drive sign-ups for a free 14-day trial.

Instructions:
- Open with a relatable pain point, not the product name.
- Mention one concrete benefit with a number (teams save about
  3 hours per person per week in our beta).
- Avoid buzzwords like "game-changer" and "revolutionary".
- End with a clear call to action.

Format: 120-180 words, short paragraphs, no more than 2 emojis,
3 relevant hashtags at the end.

Example of our brand voice:
"Your team didn't start an agency to fill in spreadsheets.
We get it."
```

Notice that this prompt is longer than most people write. That is the point. A few extra minutes of writing replaces several rounds of back-and-forth and produces something you can use.

## Using Delimiters to Separate Parts

When a prompt contains instructions and material (an article, data, or a customer email), separate them clearly so the model knows which is which. Common delimiters include:

- Triple quotes: `"""text"""`
- Triple backticks for code or text blocks
- XML-style tags: `<article>...</article>`
- Headings and labels: `### Instructions`, `### Data`

```
Summarize the article in <article> tags in 3 bullet points for a
busy executive.

<article>
<paste article here>
</article>
```

Delimiters prevent confusion, especially when the material itself contains instructions or questions, and they are an important defense against prompt injection, which Chapter 19 discusses.

## Order Matters

For short prompts, order is flexible. For long prompts with large documents, a useful pattern is:

1. Role and overall task (brief).
2. Long documents or data.
3. Detailed instructions and the specific question at the end.

Placing the question after a long document tends to produce better answers than asking first and pasting fifty pages afterward, because the instructions are fresh when the model starts writing.

## The Prompt Checklist

Before sending an important prompt, run through this checklist:

- Did I state the task with a clear verb?
- Did I explain who it is for and why?
- Did I include the facts the model can't know?
- Did I say what good looks like (format, length, tone)?
- Did I show an example if style matters?
- Did I separate instructions from material?
- Did I tell the model what to do when information is missing?

> **Try It:** Take a prompt you often use and rewrite it using the six-part blueprint. Save the improved version in a notes file. You've just started your personal prompt library.

## Key Takeaways

- Great prompts combine Role, Task, Context, Instructions, Format, and Examples as needed.
- Context is usually the biggest lever for quality.
- Prefer positive instructions and explain the reasons behind rules.
- Use delimiters to separate instructions from content.
- For long documents, put the material first and the question last.
