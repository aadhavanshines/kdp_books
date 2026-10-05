# Chapter 4: Core Prompting Techniques

With the blueprint in hand, you are ready for the core techniques that every prompt engineer uses daily. Each one is simple. Together, they solve the majority of everyday prompting problems.

## Zero-Shot Prompting

**Zero-shot prompting** means asking the model to perform a task without giving any examples. Most everyday prompts are zero-shot:

```
Classify the sentiment of this review as Positive, Negative, or
Mixed: "The food was delicious but we waited 45 minutes."
```

Modern models are excellent zero-shot performers for common tasks. Start here. Add examples only when the output's style, format, or judgment doesn't match what you want.

## Few-Shot Prompting

**Few-shot prompting** includes a handful of input-output examples before the real task. The model infers the pattern and applies it.

```
Convert each customer message into a short support ticket title.

Message: "I've been charged twice for my March subscription!!"
Title: Duplicate charge - March subscription

Message: "the app crashes whenever i open the camera on my android"
Title: App crash on camera open - Android

Message: "How do I change the email address on my account?"
Title:
```

Few-shot prompting shines when:

- You need a specific format or style that is hard to describe.
- The task involves judgment calls, such as classification with subtle categories.
- You want consistent output across many inputs.

### Making Examples Work

**Use diverse examples.** If all your examples are short, positive, or about the same topic, the model will over-learn those features. Cover the range of inputs you expect, including edge cases.

**Keep examples consistent in format.** The model copies structure exactly, so inconsistencies in your examples become inconsistencies in your output.

**Three to five examples is usually enough.** More can help for complex tasks, but returns diminish quickly.

**Label examples clearly.** Wrapping them in tags such as `<example>` helps the model distinguish examples from instructions and from the real input.

**Watch for copying.** Models sometimes reuse phrases from examples too literally. If this happens, add an instruction such as "The examples show the style only; do not reuse their wording," or provide more varied examples.

## Role Prompting

As introduced in Chapter 3, assigning a role changes the perspective and expertise of the response. Some powerful role patterns:

**The expert:** "You are a structural engineer with 20 years of experience in residential renovations."

**The teacher:** "You are a patient tutor. Explain concepts step by step and check my understanding with a question at the end."

**The critic:** "You are a tough but fair editor at a major publisher. Point out every weakness in this chapter."

**The audience:** "Read this as a skeptical CFO who has 2 minutes. What questions would you ask?"

**Multiple perspectives:** "Evaluate this plan from three perspectives: a customer, a lawyer, and a competitor."

Role prompting is especially useful for critique, because models tend to be agreeable by default. Asking it to play a demanding reviewer produces much more useful feedback than "What do you think?"

## Being Specific About Output

Specify the output precisely, and the model will usually comply.

**Length:** Prefer concrete measures, like "3 bullet points" or "under 150 words," to vague ones such as "short." Note that models are better at counting paragraphs and bullet points than exact words.

**Structure:**

```
Format your answer as:
## Summary (2 sentences)
## Key Risks (bulleted list, max 5)
## Recommendation (1 paragraph)
```

**Tone and style:** Describe the tone with several adjectives and, ideally, an example. "Warm, direct, and slightly humorous, like a good podcast host" paints a clearer picture than "casual."

**Reading level:** "Write for a 10-year-old," "for a general adult audience," or "for specialists who know the jargon."

**What to exclude:** "No introduction or conclusion. Start directly with the first tip."

## Giving the Model Room to Ask Questions

When a task is complex and you're not sure whether you've provided everything, invite the model to ask:

```
I want you to help me write a business plan for a mobile dog
grooming service. Before you start, ask me up to 8 questions about
anything you need to know to make it specific to my situation.
```

This **ask-first** pattern turns the model into an interviewer, surfacing the context you forgot to include. It is one of the most useful techniques for beginners and experts alike.

## Iterative Refinement

Prompting is a conversation. The first answer is a starting point, and targeted feedback improves it quickly. Good follow-ups are specific:

- Weak: "Make it better."
- Strong: "The second paragraph is too technical for our audience. Replace the jargon with plain language and add one real-world example."

Useful refinement moves include:

- **Expand:** "Go deeper on point 3, with two examples."
- **Compress:** "Cut this to half the length, keeping the key numbers."
- **Redirect:** "This is too formal. Rewrite it as a friendly text message."
- **Constrain:** "Keep everything, but use only words a 12-year-old would know."
- **Vary:** "Give me 5 different versions with different opening lines."
- **Combine:** "Merge the opening of version 2 with the structure of version 4."

> **Tip:** When a conversation has gone off track after many corrections, it is often faster to start a new chat with an improved prompt that includes everything you learned. Long, messy chats carry confusion forward.

## Generating Options, Then Choosing

Instead of asking for one answer, ask for several and select or combine the best:

```
Give me 10 possible titles for this blog post. Vary the style:
some curiosity-driven, some benefit-driven, some direct.
Then mark the 3 you think are strongest and explain why.
```

This works because the first idea is rarely the best, for models or people. It is especially effective for creative work: names, headlines, hooks, slogans, and strategies.

## Asking for Self-Review

Models can often catch their own mistakes if you ask them to check:

```
Review your answer above. Check for factual errors, missing steps,
and anything that contradicts the requirements I gave. List any
problems you find, then provide a corrected version.
```

Self-review isn't foolproof, but it reliably improves quality for writing, code, and analysis. Chapter 5 develops this into more powerful reflection techniques.

## Prompt Chaining

Complex tasks often go better when split into a sequence of smaller prompts, with each output feeding into the next. This is called **prompt chaining**. For example, writing a research report might become:

1. "List the 8 key questions this report should answer."
2. "For each question, summarize what the attached sources say."
3. "Draft an outline based on these summaries."
4. "Write section 1 following the outline."
5. "Edit the full draft for consistency and clarity."

Chaining gives you a checkpoint at each step, where you can correct course before errors compound. It also lets each prompt focus on one thing, which models do better than juggling many things at once.

## The Core Techniques at a Glance

| Technique | Use it when |
| --- | --- |
| Zero-shot | The task is common and clear |
| Few-shot | Style, format, or judgment must match a pattern |
| Role prompting | You need expertise, perspective, or critique |
| Specific output | You need a particular length, shape, or tone |
| Ask-first | You're unsure what context is needed |
| Iterative refinement | The output is close but not right |
| Generate options | Creative or strategic choices |
| Self-review | Accuracy and completeness matter |
| Prompt chaining | The task has multiple distinct stages |

> **Try It:** Choose a writing task you have this week. Use the ask-first pattern to let the model interview you, then generate three options, choose the best, and refine it with two specific follow-ups. Compare the final result with what a single prompt gives you, and notice how much closer it is to what you wanted.

## Key Takeaways

- Start zero-shot; add examples when style or judgment must match a pattern.
- Diverse, consistent, clearly labeled examples work best.
- Roles add expertise and perspective, and they are especially useful for honest critique.
- Be concrete about length, structure, tone, and exclusions.
- Let the model ask questions, generate options, review its own work, and break large tasks into chains.
