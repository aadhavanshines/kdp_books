# Part II: Intermediate Techniques

# Chapter 5: Prompting for Reasoning

Language models can answer simple questions in a single step. But for problems that involve calculation, logic, planning, or weighing trade-offs, how you prompt for reasoning makes a dramatic difference. This chapter covers the techniques that help models think more carefully, and how those techniques change with modern reasoning models.

## Chain-of-Thought Prompting

**Chain-of-thought (CoT) prompting** asks the model to work through a problem step by step before giving its final answer. The simplest version adds a phrase such as "Think through this step by step."

Consider this question:

```
A store sells pens at 3 for $4. Maria buys 14 pens. The store
gives every 4th pen free (the free pens don't count toward the
3-for-$4 pricing). How much does she pay?
```

Asked to answer directly, a model may jump to a wrong number. Asked to reason first, it is more likely to work out how many pens are free, how many must be paid for, and how the pricing groups apply, before calculating the total.

Why does this work? Because the model generates text one piece at a time, writing out intermediate steps gives it "space" to work. Each step becomes part of the context that informs the next. Skipping straight to the answer forces it to compress all that reasoning into a single prediction.

### Structured Chain of Thought

For more control, separate the reasoning from the final answer:

```
Solve the problem below. First, reason through it inside
<thinking> tags. Then give only the final answer inside
<answer> tags.
```

This makes the output easier to read and to process automatically, and you can inspect the reasoning to see where errors occur.

### Guided Chain of Thought

You can also specify the steps the model should follow, which is useful when you know the right method:

```
Evaluate whether this job candidate meets our requirements.
Step 1: List each requirement from the job description.
Step 2: For each requirement, quote the relevant evidence from
the resume, or write "No evidence".
Step 3: Rate each requirement as Met, Partially Met, or Not Met.
Step 4: Give an overall recommendation with a one-paragraph
justification.
```

Guided reasoning makes the process transparent and consistent across many inputs, which is important for evaluations, audits, and decisions that people will review.

## Reasoning Models Change the Rules

As Chapter 2 explained, reasoning models think internally before they answer. Many assistants offer a "thinking" or "reasoning" mode, sometimes with selectable effort levels. With these models:

- **You usually don't need "think step by step."** They already do.
- **Avoid micromanaging the reasoning.** Very prescriptive step lists can sometimes reduce performance by forcing the model down a path less effective than the one it would have chosen. Prefer high-level guidance: "Consider several approaches before choosing one" or "Check your answer against all the constraints."
- **Invest in the problem description.** Clear goals, complete constraints, and explicit success criteria matter even more.
- **Ask for the final output you need**, not a transcript of thinking. The model's visible answer can be concise even when its internal reasoning was long.
- **Use them selectively.** Reasoning takes more time and often costs more. For simple tasks like rewriting an email, a standard model is faster and just as good.

> **Tip:** A good rule of thumb: use reasoning modes for problems where a smart person would need to sit and think, such as math, complex code, strategy, scheduling with many constraints, and tricky analysis. Use fast modes for tasks a smart person could do immediately.

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
Evaluate this draft against these criteria, scoring each 1-5 with
a one-line justification:
1. Clarity for a non-technical reader
2. Accuracy relative to the source document
3. Persuasiveness of the main argument
4. Appropriate length (target: 400-500 words)
Then revise to raise any score below 4.
```

## Considering Alternatives

Models tend to commit to the first approach that seems reasonable. You can widen their thinking explicitly:

```
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

- Chain-of-thought gives the model room to reason and improves accuracy on complex problems.
- Separate reasoning from final answers for clarity, and guide the steps when you know the method.
- With reasoning models, focus on goals and constraints rather than micromanaging the thinking.
- Decomposition, self-consistency, and reflection loops further improve reliability.
- Ask for alternatives, assumptions, and uncertainty to get honest, balanced reasoning.
