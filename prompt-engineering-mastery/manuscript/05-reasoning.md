# Part II: Intermediate Techniques

# Chapter 5: Prompting for Reasoning

Language models can answer simple questions in a single step. But for problems that involve calculation, logic, planning, or weighing trade-offs, how you prompt for reasoning makes a dramatic difference. This chapter shows how to get careful, reliable reasoning, and how the right approach depends on the kind of model you are using.

## Two Kinds of Models, Two Approaches

Today's AI assistants commonly distinguish between faster general-purpose models and models designed to spend additional computation on reasoning, often presented as a choice between a "fast" and a "thinking" (or "reasoning") mode:

- **Standard models** answer immediately. They are quick and inexpensive, and ideal for everyday writing, summarizing, and simple questions.
- **Reasoning models** think internally before they answer: they consider approaches, work through steps, and check their work, then show you only the result. They are slower but much stronger at math, logic, complex code, planning, and multi-step analysis.

| | Standard (fast) models | Reasoning (thinking) models |
| --- | --- | --- |
| Best for | Everyday tasks a smart person could do immediately | Problems a smart person would need to sit and think about |
| Say "think step by step"? | Yes, it often helps | No, they already do |
| Your main job | Give room to reason, or guide the steps | Define the goal, constraints, and how to verify |
| What to ask for | Visible steps, then the answer | A concise summary of key steps, then the answer |

The rest of this chapter starts with the modern approach for reasoning models, then covers the classic technique that still helps standard models, and finishes with methods that make any model more reliable.

## Prompting Reasoning Models: Goals, Constraints, and Verification

With a reasoning model, you don't need to teach it *how* to think. Your job is to define the problem so completely that its thinking goes in the right direction:

- **Describe the whole problem.** Include every fact, rule, and constraint. Missing information is still the most common cause of wrong answers.
- **State what success looks like.** "The schedule must satisfy all ten constraints" gives the model something to check against.
- **Ask it to verify.** "Check your answer against every condition before replying" encourages self-correction.
- **Avoid micromanaging.** Very prescriptive step lists can force the model down a worse path than the one it would choose. High-level guidance such as "consider more than one approach" works better.
- **Ask for the output you need, not a transcript of its thinking.** A concise summary of the key steps and assumptions is easier to check than pages of reasoning, and some providers block prompts that try to extract a model's internal reasoning.

Consider this problem:

```
A store sells pens for $1.50 each or $4 for a pack of 3. During a
promotion, every 4th pen a customer takes is free. Maria takes 14
pens and the cashier charges her the lowest possible price for the
pens she has to pay for. How much does she pay?
```

A good prompt for a reasoning model adds verification and a clear output format:

```
Solve the problem below. Before answering, check your result
against every condition in the problem. Reply with a short
summary of the key steps and any assumptions under the heading
"Key steps", then give the final answer on its own line starting
with "Answer:".

Problem: <paste the problem>
```

```
Example output:
Key steps
- Every 4th pen is free: pens 4, 8, and 12, so 3 are free.
- Maria pays for 14 - 3 = 11 pens.
- Packs are cheaper per pen ($1.33 vs $1.50), so: 3 packs
  (9 pens) for $12, plus 2 single pens for $3.
- Checked: 9 + 2 = 11 paid pens; no cheaper combination exists.
Answer: $15
```

The answer is easy to read, a program can find it by looking for the line starting with "Answer:", and the short summary lets you check the logic without wading through everything the model considered.

> **Tip:** Use reasoning modes for problems where a smart person would need to sit and think, such as math, complex code, strategy, scheduling with many constraints, and tricky analysis. For everyday tasks, a fast model is quicker and just as good.

## Classic Chain-of-Thought (for Standard Models)

**Chain-of-thought (CoT) prompting** asks a model to work through a problem step by step before giving its final answer. With standard models, simply adding "Think through this step by step" to the pen problem changes the result. Asked to answer directly, a fast model may jump to a wrong number; asked to reason first, it works out how many pens are free, how many must be paid for, and how the pricing applies.

Here is a typical step-by-step answer:

```
Example output:
1. Free pens: every 4th pen is free, so pens 4, 8, and 12 are
   free. That's 3 free pens.
2. Pens to pay for: 14 - 3 = 11.
3. Cheapest pricing: packs of 3 cost $4 (about $1.33 per pen),
   which beats $1.50 each. 11 pens = 3 packs (9 pens) + 2 single
   pens.
4. Cost: 3 x $4 = $12, plus 2 x $1.50 = $3.
Answer: Maria pays $15.
```

Why does this work? A standard model generates text one piece at a time. For standard models, explicitly generating intermediate steps can improve performance on some multi-step problems, because each generated step becomes part of the context for what follows. Jumping straight to the answer leaves no room for those intermediate results. Reasoning models do this work internally, which is why they don't need the instruction.

> **Note:** Older guides often suggest asking the model to reason inside `<thinking>` tags. Some providers may block prompts that explicitly request a model's internal reasoning. Use plain headings such as "Key steps" and "Answer:", or use the assistant's built-in reasoning mode instead.

### Guided Reasoning

When you know the right method, you can specify the steps the model should follow. This works with both kinds of models, and it's especially valuable for decisions that people will review:

```
Evaluate whether this job candidate meets our requirements.

<job_description>
<paste the job description>
</job_description>
<resume>
<paste the resume>
</resume>

Step 1: List each requirement from the job description.
Step 2: For each requirement, quote the relevant evidence from
the resume, or write "No evidence".
Step 3: Rate each requirement as Met, Partially Met, or Not Met.
Step 4: Give an overall recommendation with a one-paragraph
justification.
```

Guided reasoning makes the process transparent and consistent across many inputs, which is important for evaluations, audits, and decisions that people will review. Here the steps describe the *output* you need, evidence and ratings for each requirement, rather than how the model should think, so they help reasoning models too.

## Decomposition: Breaking Down Hard Problems

Some problems are too large to solve in one go even with reasoning. **Decomposition** splits a problem into sub-problems, solves each, and combines the results.

```
I want to decide whether to open a second location for my bakery.
First, break this decision into the 5-7 key sub-questions I need
to answer. Don't answer them yet.
```

Then work through the sub-questions one by one, possibly in separate prompts. This is related to prompt chaining from Chapter 4. A variant called **least-to-most prompting** solves the simplest sub-problem first and builds up, using each answer as input to the next.

## Self-Consistency: Asking More Than Once

Because outputs vary from run to run, you can improve reliability on reasoning tasks by generating several independent answers and choosing the most common one. This is called **self-consistency**.

In a chat interface, you can approximate it by regenerating the response a few times, or by asking:

```
Solve this problem three times independently using different
approaches. Then compare the answers. If they differ, figure out
which is correct and explain why.

Problem: <paste the problem>
```

Through an API, you can run the same prompt several times in parallel and take a majority vote automatically.

## Reflection and Critique Loops

**Reflection** asks the model to critique its own output and then improve it. A simple loop:

1. **Generate:** "Write a cover letter for this job."
2. **Critique:** "Act as a hiring manager reading 200 applications. List the 5 biggest weaknesses of this letter."
3. **Revise:** "Rewrite the letter to fix every weakness you listed."

This works better than asking for a perfect result in one shot, because critiquing and creating are different modes of thinking. Separating them gives the model a fresh perspective on its own draft.

For higher-stakes work, give the critic explicit criteria:

```
Evaluate the draft below against these criteria, scoring each 1-5
with a one-line justification:
1. Clarity for a non-technical reader
2. Accuracy relative to the source document
3. Persuasiveness of the main argument
4. Appropriate length (target: 400-500 words)
Then revise to raise any score below 4.

<source>
<paste the source document>
</source>
<draft>
<paste the draft>
</draft>
```

## Considering Alternatives

Models tend to commit to the first approach that seems reasonable. You can widen their thinking explicitly:

```
My problem: <describe the problem>
My situation: <budget, time, team, constraints>

Before recommending a solution, describe three genuinely different
approaches to this problem, with the main advantage and the main
risk of each. Then recommend one and explain why it beats the
others for my situation.
```

This **tree-of-thought** style exploration is valuable for strategy, design, and any problem with multiple viable paths.

## Asking for Assumptions and Uncertainty

Good reasoning makes its assumptions visible. Ask for them:

```
After your analysis, list:
- The assumptions you made that I should verify.
- Anything you are uncertain about, and how confident you are.
- What additional information would change your conclusion.
```

This turns a confident-sounding answer into an honest one and shows you exactly where to apply your own judgment.

## Common Reasoning Pitfalls

**Arithmetic errors.** Models still make calculation mistakes, especially with large numbers. For anything important, ask the model to use a code or calculator tool if available, or check the math yourself.

**Plausible but wrong logic.** A fluent chain of reasoning can still contain a flawed step. Read the reasoning, not just the conclusion.

**Leading questions.** If you ask, "Why is option A the best?", the model will tend to argue for A. Ask neutrally: "Compare options A and B."

**Agreeableness.** Models may abandon a correct answer when you push back. If you challenge an answer, ask it to re-examine the evidence rather than simply asserting that it's wrong. "Please double-check step 3" yields better results than "You're wrong."

> **Try It:** Find a decision you're facing at work or at home. Use the "three approaches, then recommend" prompt, followed by "list your assumptions and uncertainties." Compare this to simply asking "What should I do?"

## Key Takeaways

- Know which kind of model you're using: standard models benefit from step-by-step prompting; reasoning models think on their own.
- For reasoning models, define the goal, every constraint, and how to verify the answer, and ask for a concise summary of key steps rather than a transcript.
- Classic chain-of-thought still improves accuracy on standard models; avoid prompts that ask a model to expose its internal reasoning in special tags.
- Guide the steps when you know the method, especially for decisions people will review.
- Decomposition, self-consistency, and reflection loops further improve reliability.
- Ask for alternatives, assumptions, and uncertainty to get honest, balanced reasoning.
