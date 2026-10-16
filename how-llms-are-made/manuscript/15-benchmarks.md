# Chapter 15: Measuring Intelligence: Benchmarks and Leaderboards

Every new model is launched with a table of numbers: scores on tests with names like MMLU, GPQA, SWE-bench and Humanity's Last Exam, each a little higher than the competition's. What do these tests actually measure? How are they made? And why do experts treat them with a healthy dose of suspicion? This chapter explains how AI is measured, and why measuring it is so hard.

## Why Tests Matter

During pretraining, the loss tells you how well a model predicts text. But nobody uses a model to predict text; they use it to answer questions, write code and solve problems. So researchers build **benchmarks**: fixed sets of tasks with known answers, scored automatically, which let different models be compared fairly.

Benchmarks have driven AI progress for decades. The ImageNet challenge, with its 1.2 million labeled photos, was where AlexNet made its breakthrough in 2012 (Chapter 2). A good benchmark gives a whole field a shared target.

## The Benchmark Treadmill

Language model benchmarks follow a familiar life cycle: a test is created; it seems very hard; models improve rapidly; within a few years, top models score near the maximum and the test stops being useful. This is called **saturation**.

- **MMLU** (Massive Multitask Language Understanding), created by **Dan Hendrycks** and colleagues in 2020, has about 16,000 multiple-choice questions across 57 subjects, from law and medicine to history and physics. GPT-3 scored about 44% when it was published, well above guessing (25%) but far from experts. By 2024, top models scored around 90%, and it was effectively saturated.
- **GPQA** (2023) was designed to be "Google-proof": 448 very hard science questions written by PhD experts. Experts in the field answered about 65% correctly; skilled non-experts, with unlimited web access and over 30 minutes per question, managed only about 34%. Within two years, reasoning models were scoring above the experts.
- **Humanity's Last Exam** (2025), organized by the Center for AI Safety and Scale AI, gathered about 2,500 questions from nearly a thousand experts around the world, each chosen because frontier models of the time got it wrong. Early models scored in single digits; scores have risen quickly since.

![The benchmark treadmill: each new test starts with low AI scores, then scores rise steeply within a few years until the test is saturated near its maximum, and researchers create a harder one.](images/diagram-benchmarks.png)

> **Did You Know?** Some benchmark questions turn out to be wrong. When researchers re-checked MMLU, they found errors in a noticeable share of questions, including some subjects where a large fraction of the "correct" answers were mistaken. Near the top of a test, models may be "losing points" for disagreeing with a faulty answer key.

## Testing Real Work

As models became useful for real tasks, benchmarks followed:

- **SWE-bench** (2023), by **Carlos Jimenez**, **John Yang** and colleagues at Princeton, gives the model real bug reports from popular open-source Python projects on GitHub and asks it to fix the code, checking the result with the project's own tests. When it was published, the best model solved under 2% of the problems. A human-checked subset, **SWE-bench Verified** (2024), became the standard measure of AI coding agents, and top systems now solve the large majority.
- **Agent benchmarks** test whether a model can complete multistep tasks on a computer, such as booking a trip on a website, using a spreadsheet or researching a question on the web.
- **METR**, a research nonprofit, measures the length of tasks, timed by how long they take skilled humans, that AI agents can complete. In 2025, it reported that this "time horizon" had been doubling roughly every seven months for six years: from tasks of a few seconds to tasks of about an hour.

## Arena: Let the Public Decide

Fixed tests can't capture whether people actually *like* a model's answers. In 2023, researchers at UC Berkeley launched **Chatbot Arena** (later **LMArena**). Anyone can visit, type a prompt and see answers from two anonymous models side by side, then vote for the better one. Millions of votes are combined into a ranking using the **Elo** rating system, originally invented to rank chess players.

The Arena became one of the most watched leaderboards in AI. It has its own limits: votes reward style as well as substance, such as longer answers, friendly formatting and confident tone, and companies can test many private versions before release. In April 2025, Meta drew criticism after it emerged that the Llama 4 version ranked highly on the Arena was an "experimental chat version" tuned for conversation, not the one released to the public.

## Teaching to the Test

The economist Charles Goodhart gave his name to a principle that haunts AI evaluation: **when a measure becomes a target, it ceases to be a good measure.**

- **Contamination.** Benchmark questions and answers leak onto the web and into training data. A model that has seen the answers isn't showing intelligence, just memory. Labs try to remove test questions from training data (Chapter 5), but it's hard to be sure, and some studies have found models scoring much lower on freshly written versions of the same kind of question.
- **Over-optimization.** Labs naturally tune their models on the tests everyone watches, which can inflate scores without making models better at what people need.
- **Prompting differences.** Scores can change by several points depending on exactly how questions are phrased, how many examples are given and how answers are extracted, so comparisons between companies' self-reported numbers need care.

The response has been **held-out** and **private** tests, kept secret from the labs; benchmarks continually refreshed with new questions, such as LiveBench; and independent evaluators who test models themselves.

> **In Plain Words:** A benchmark score is like an exam grade. It tells you something real, but a student who has seen the exam paper, or crammed only for that exam, may not be as capable as the grade suggests.

## Measuring What Matters

The ultimate test is whether a model is useful and safe in the real world, which no single number captures. That's why serious evaluation now combines many approaches: standard benchmarks, human preference votes, expert red-teaming for dangerous capabilities (Chapter 16), measures of real-world task completion, and plain experience with the model over weeks of use.

One benchmark deserves special mention for asking a different question. **ARC-AGI**, created by the French researcher **François Chollet** in 2019, presents simple visual puzzles that most people can solve but that require adapting to something genuinely new, rather than recalling knowledge. For years, AI systems scored very poorly. In December 2024, OpenAI's o3 reasoning model made a leap, scoring 75.7% on its semi-private test under the cost limits, and 87.5% with far more computation. Chollet responded by building harder versions, a reminder that each time AI conquers a test, we learn something about what the test was really measuring.

## Key Takeaways

- **Benchmarks** are fixed sets of tasks with checkable answers that let models be compared.
- Tests quickly **saturate**: MMLU, GPQA and others went from hard to near-solved in a few years; Humanity's Last Exam was built to be harder.
- Real-work benchmarks such as **SWE-bench** measure practical skills like fixing code; METR measures how long a task an agent can complete.
- **LMArena** ranks models by public votes using Elo ratings, but rewards style as well as substance.
- **Contamination** and over-optimization (Goodhart's law) mean scores should be read with caution.

## Sources and Further Reading

- Dan Hendrycks et al., "Measuring Massive Multitask Language Understanding," 2020. arxiv.org/abs/2009.03300
- David Rein et al., "GPQA: A Graduate-Level Google-Proof Q&A Benchmark," 2023. arxiv.org/abs/2311.12022
- Long Phan et al., "Humanity's Last Exam," Center for AI Safety and Scale AI, 2025. arxiv.org/abs/2501.14249; lastexam.ai
- Aryo Pradipta Gema et al., "Are We Done with MMLU?," 2024 (errors in MMLU questions). arxiv.org/abs/2406.04127
- Carlos E. Jimenez et al., "SWE-bench: Can Language Models Resolve Real-World GitHub Issues?," ICLR 2024. arxiv.org/abs/2310.06770; OpenAI, "Introducing SWE-bench Verified," August 2024.
- Thomas Kwa et al., "Measuring AI Ability to Complete Long Tasks," METR, March 2025. arxiv.org/abs/2503.14499
- Wei-Lin Chiang et al., "Chatbot Arena: An Open Platform for Evaluating LLMs by Human Preference," 2024. arxiv.org/abs/2403.04132; lmarena.ai
- Reporting by *TechCrunch* and *The Verge* on the Llama 4 Arena version, April 2025.
- François Chollet, "On the Measure of Intelligence," 2019. arxiv.org/abs/1911.01547; ARC Prize, "OpenAI o3 Breakthrough High Score on ARC-AGI-Pub," December 2024. arcprize.org
- Colin White et al., "LiveBench: A Challenging, Contamination-Free LLM Benchmark," 2024. arxiv.org/abs/2406.19314
