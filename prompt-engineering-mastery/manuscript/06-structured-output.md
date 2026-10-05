# Chapter 6: Structured Output and Formatting

Much of the value of AI comes from output you can use directly: a table you can paste into a spreadsheet, JSON a program can read, a checklist you can follow, or a document with consistent headings. This chapter shows how to get structured output reliably.

## Why Structure Matters

Unstructured text is fine for conversation, but structure gives you:

- **Scannability:** Readers find what they need quickly.
- **Consistency:** Every output follows the same shape, which matters when you generate many.
- **Automation:** Programs can parse structured output and feed it into other systems.
- **Completeness:** A required structure forces the model to address every part.

## Tables

Tables are ideal for comparisons, plans, and data extraction:

```
Compare these three project management tools for a 10-person
marketing team. Output a table with columns: Tool, Best For,
Key Strength, Main Weakness, Approximate Price per User.
After the table, add a 2-sentence recommendation.
```

Tips for tables:

- Name the columns explicitly and in order.
- Keep cell content short; ask for details below the table if needed.
- For spreadsheets, ask for CSV output or a markdown table you can paste.

## Lists, Headings, and Templates

To get the same structure every time, give the model a template to fill in:

```
Summarize the meeting transcript using exactly this template:

**Meeting:** <title>
**Date:** <date>
**Attendees:** <names>

### Decisions
- <decision>

### Action Items
| Owner | Task | Due Date |
|---|---|---|

### Open Questions
- <question>

If a section has no content, write "None".
```

The final line matters. Without it, models may invent content to fill empty sections, or silently drop them.

## JSON for Applications

When output feeds into software, **JSON** (JavaScript Object Notation) is the most common format. A basic JSON prompt:

```
Extract the following fields from the email below and return
only valid JSON, with no other text:

{
  "customer_name": string,
  "order_number": string or null,
  "issue_type": one of ["billing", "shipping", "product", "other"],
  "urgency": one of ["low", "medium", "high"],
  "summary": string (max 20 words)
}

Email: """<email text>"""
```

Best practices for JSON prompts:

1. **Show the exact schema**, including field names, types, and allowed values.
2. **Specify how to handle missing data**, for example with `null`, an empty string, or "unknown".
3. **Constrain categories** with an explicit list of allowed values.
4. **Ask for JSON only**, without explanations or extra text before or after.
5. **Validate in code.** Always check that the output parses correctly and contains the expected fields.

### Structured Output Features

Most major AI platforms now offer **structured output** or **JSON mode** features through their APIs. With these, you provide a JSON Schema and the platform guarantees the output conforms to it. When available, use these features rather than relying on prompting alone, since they eliminate parsing errors. Prompting still matters, though: the schema guarantees the shape, but your instructions determine whether the content is correct.

Related **function calling** or **tool use** features let a model return structured arguments for a function you define. Chapter 17 covers these in depth.

## XML Tags

XML-style tags, such as `<summary>` and `</summary>`, are a flexible way to structure both inputs and outputs. They are easy for models to follow and easy for code to extract.

```
Analyze the customer review below.

<review>
<review text>
</review>

Respond in this format:
<sentiment>positive, negative, or mixed</sentiment>
<key_points>bulleted list of the main points</key_points>
<suggested_reply>a short, friendly reply</suggested_reply>
```

Tags are particularly useful when:

- You mix several documents in one prompt (`<contract>`, `<email>`, `<policy>`).
- You want reasoning separated from the answer (`<thinking>` and `<answer>`).
- You want to extract specific parts of a long response programmatically.

There's nothing special about particular tag names. Choose descriptive names and use them consistently.

## Markdown or Plain Text?

Chat interfaces render **markdown** (headings, bold, bullets) attractively, so assistants use it often. But markdown is not always what you want:

- For emails, text messages, and social posts, ask for **plain text**.
- For content going into a website or document editor, specify markdown, HTML, or plain text according to the destination.
- For voice assistants or text-to-speech, ask for natural spoken sentences with no formatting symbols.

```
Write the reply as plain text suitable for pasting into Gmail.
Do not use markdown symbols such as asterisks or pound signs.
```

> **Tip:** The style of your prompt influences the style of the response. If you want flowing prose without bullet points, write your prompt in prose, and say explicitly: "Write in full paragraphs; avoid bullet points."

## Controlling Length Reliably

Length is one of the hardest things to control precisely. Some techniques help:

- **Count structural units rather than words:** "3 paragraphs," "5 bullets," "2 sentences each."
- **Give a range:** "between 150 and 200 words" works better than "exactly 175 words."
- **Show an example** of the target length.
- **Ask for a revision:** "This is 340 words. Cut it to under 250 without losing the main points."
- **Measure with code** when exact counts matter, such as for SMS limits or ad character limits.

## Extracting Data from Messy Text

Structured prompting is excellent for turning messy inputs, like emails, PDFs, notes, and transcripts, into clean data:

```
From the job postings below, extract a table with columns:
Company, Job Title, Location, Remote (Yes/No/Hybrid),
Salary Range (or "Not listed"), Years of Experience Required.

Only use information explicitly stated in each posting.
Do not infer salaries.

<postings>
...
</postings>
```

The instructions "only use information explicitly stated" and "do not infer" are important. Without them, models may fill gaps with plausible guesses, which are hallucinations in a tidy table.

> **Warning:** Structured output looks authoritative. A neatly formatted table of invented numbers is more dangerous than an obviously vague paragraph. Spot-check extracted data against the source.

## Key Takeaways

- Structure improves scannability, consistency, completeness, and automation.
- Provide explicit templates and tell the model what to do with empty sections.
- For JSON, show the schema, constrain values, handle missing data, and validate in code. Use platform structured-output features when available.
- XML tags are a flexible way to organize both inputs and outputs.
- Match the format to the destination, and control length with structural units and ranges.
