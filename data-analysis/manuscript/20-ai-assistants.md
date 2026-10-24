# Chapter 20: Using AI Assistants for Analysis, Safely

AI assistants that write code can speed up analysis a lot: they remember pandas syntax you've forgotten, draft charts, explain errors and suggest approaches. They can also produce code that runs perfectly and answers the wrong question. This chapter shows how to use them well: what to ask, what to check, and what never to paste in.

## What AI Assistants Are Good At

- **Syntax and recipes:** "How do I resample to weeks ending on Monday?", "How do I label bars in matplotlib?"
- **Explaining errors:** paste the error message and the few lines around it.
- **First drafts:** a chart, a cleaning step, a SQL query, which you then read and test.
- **Explaining code:** "Explain this groupby line by line."
- **Ideas:** "What are three ways to check whether this A/B test split is fair?"

They're weakest at things that depend on *your* data and *your* question: what a column really means, whether the answer is right, and which comparison is fair.

## A Plausible, Wrong Answer

Asked for "average order value by region", an assistant might suggest the first calculation below. It runs, and gives sensible-looking numbers:

```python
@include code/ch20/ai_suggestion.py
```

```
@include code/ch20/ai_suggestion.out
```

The suggested code averages each customer's orders first, then averages the customers. That's "the average customer's average order", a different question: it gives a customer with one order as much weight as one with twenty. Average order value is total revenue divided by the number of orders. The numbers are close, which is exactly what makes the mistake dangerous: in the West the two differ by almost $2, and nothing looks wrong.

The fix isn't to stop using assistants. It's to know your definitions, and to check.

## Checks That Catch Most Mistakes

```python
@include code/ch20/sanity_checks.py
```

```
@include code/ch20/sanity_checks.out
```

- **Parts add up to the whole.** Regional totals should sum to the overall total.
- **Nothing went missing.** The number of groups matches the number of distinct values.
- **Values are plausible.** Positive revenue, dates in range, shares between 0 and 1.
- **A tiny example by hand.** Compute the answer for three rows yourself and compare (Chapter 19).
- **A second method.** Compute the same number another way, such as SQL against pandas, or a loop against a vectorized version.

## How to Ask

- **Describe the data:** column names, types and a few example rows (made up or anonymized, if the data is sensitive).
- **Define the metric exactly:** "average order value = total revenue / number of orders".
- **Ask for explanations:** "explain each step", "what assumptions does this make?"
- **Ask for checks:** "add assertions that would catch a wrong result".

## What Never to Paste In

> **Warning:** Don't paste personal data (names, emails, addresses, health or financial details), confidential business data, passwords or access keys into an AI assistant unless your organization has approved that tool for that data. Describe the structure instead, or use a small made-up sample. Check your employer's policy first: many organizations have rules about which AI tools may see which data.

## Key Takeaways

- AI assistants are excellent for syntax, error messages, drafts and explanations.
- Code that runs isn't code that's right: define your metrics exactly and check the results.
- Parts-add-up, nothing-missing, plausibility, tiny examples and a second method catch most errors.
- Never paste sensitive data into a tool your organization hasn't approved for it.
