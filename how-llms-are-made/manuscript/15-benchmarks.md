# Chapter 15: Measuring Intelligence: Benchmarks and Validation

Every new model is launched with a table of numbers: scores on tests with names like MMLU, GPQA, SWE-bench and Humanity's Last Exam, each a little higher than the competition's. What do these tests actually measure? How are they made? And why do experts treat them with a healthy dose of suspicion? This chapter explains how AI is measured, how a lab validates a new model step by step before releasing it, and why measuring it is so hard.

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

## A Map of the Main Benchmarks

There are hundreds of benchmarks. Most fall into a handful of families, each checking a different skill:

| Skill | Well-known benchmarks | What they check |
| --- | --- | --- |
| Knowledge | MMLU, MMLU-Pro, GPQA | Expert questions across many subjects |
| Math | GSM8K, MATH, AIME | From school word problems to competition math |
| Coding | HumanEval, SWE-bench, Terminal-Bench | Writing functions, fixing real bugs, working in a terminal |
| Agents | OSWorld, τ-bench, BrowseComp | Using a computer, serving customers, finding hard-to-find facts on the web |
| Long context | Needle in a haystack, RULER | Finding and combining facts in very long inputs |
| Vision | MMMU, ChartQA | College-level questions with images, reading charts |
| Factuality | TruthfulQA, SimpleQA | Avoiding popular myths and made-up answers |
| Hardest problems | Humanity's Last Exam, ARC-AGI, FrontierMath | Questions current models usually get wrong |
| Safety | HarmBench, WMDP, refusal tests | Resisting misuse, dangerous knowledge, over-refusal |

A few of these became famous. **GSM8K** (OpenAI, 2021) has about 8,500 grade-school math word problems; early GPT-3 models solved few of them, and today's models solve almost all. **HumanEval** (OpenAI, 2021) has 164 handwritten programming problems, each checked by running unit tests. **AIME**, the American Invitational Mathematics Examination, a real competition for top high-school students, became a favorite test of reasoning models because fresh problems are written every year, so they can't have been in the training data.

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

## Models Grading Models

Many useful tasks, such as writing an essay, summarizing a meeting or giving advice, have no single correct answer to check automatically. Asking people to grade thousands of answers is slow and expensive. So evaluators increasingly use a strong model as a **judge**: it reads the question, the answer and a grading guide, and gives a score or picks the better of two answers.

In 2023, **Lianmin Zheng** and colleagues at UC Berkeley tested this idea and found that GPT-4, acting as a judge, agreed with human preferences more than 80% of the time, about as often as two people agree with each other. They also found its biases: judges tend to prefer the first answer shown, longer answers, and answers written in their own style. Good evaluations swap the order of answers, use detailed grading guides, and regularly check the judge against human graders.

## How a Model Is Validated, Start to Finish

A public benchmark score is the tip of an iceberg. Before a frontier model is released, it goes through months of testing, in stages, each designed to catch different problems. The details differ between labs, but the overall process looks like this:

![How a model is validated: during training, checkpoints are tested on held-out text and quick benchmarks; after post-training, a large evaluation suite checks skills; safety teams and outside experts red-team it; people and judge models grade its answers; a limited release gathers real-world feedback; and after launch the model is monitored and its results are published in a system card.](images/diagram-validation.png)

1. **During training.** Teams watch the loss on **held-out** text that the model never trains on, to make sure it's learning general patterns rather than memorizing (Chapter 6). At regular checkpoints, they run a quick set of benchmarks, to spot problems early and to check that the model is improving as the scaling laws predicted (Chapter 12). A run that drifts off course can be stopped or fixed before more money is spent.
2. **After post-training: the skills suite.** The finished model runs through a large internal evaluation suite, often hundreds of tests covering knowledge, reasoning, math, coding, languages, long documents, images and tool use. It is compared with the lab's previous models and with competitors, using exactly the same prompts and scoring, so differences are real rather than artifacts of the setup. Teams also check for **regressions**: things the old model did well that the new one does worse.
3. **Behavior checks.** Does the model follow instructions and format answers correctly? Does it admit uncertainty instead of making things up? Is it sycophantic? Does it refuse harmful requests, without refusing harmless ones? Is it consistent across languages? Many of these are measured with judge models and specially written test conversations.
4. **Safety and dangerous-capability testing.** Specialist red teams and outside experts probe the model for risks such as helping with biological weapons or cyberattacks, test its resistance to jailbreaks and prompt injection, and look for signs of misalignment, such as deception, in agentic scenarios (Chapter 16). The results decide which safety level and safeguards the model needs under the lab's published framework. Government institutes also test some models before release: in November 2024, the US and UK AI safety institutes published the results of their joint pre-deployment testing of Anthropic's upgraded Claude 3.5 Sonnet.
5. **Human evaluation.** Expert graders, such as doctors, lawyers, programmers and writers, compare the new model's answers with older models' answers, often without knowing which is which, on realistic tasks from their own fields.
6. **Limited release.** The model is often first given to a small group of trusted testers or customers, or quietly tried out on a share of users in an **A/B test**, where some people get the new model and some the old, and the company compares satisfaction, errors and complaints. Some frontier models in 2026 were released first to vetted cybersecurity defenders.
7. **Launch and monitoring.** On release, the lab publishes a **model card** or **system card** describing the model's abilities, test results, safety findings and limits; for frontier models these can run to well over a hundred pages. After launch, it keeps monitoring for misuse, unexpected failures and changes in behavior, and can roll back an update if something goes wrong, as OpenAI did with its overly flattering GPT-4o update in April 2025 (Chapter 13).

Independent testers then add their own view. Groups such as Epoch AI, METR, Apollo Research and LMArena, and many academic researchers, run their own evaluations, often finding strengths and weaknesses the makers didn't report.

> **In Plain Words:** Validating a model is like certifying a new aircraft: lots of measurements during construction, a long series of tests on the finished product, specialist safety checks, test flights with a few passengers, and continued monitoring once it is in service.

## The Search for Harder Tests

As models pass test after test, researchers keep looking for questions that measure something new. One benchmark deserves special mention for asking a different question. **ARC-AGI**, created by the French researcher **François Chollet** in 2019, presents simple visual puzzles that most people can solve but that require adapting to something genuinely new, rather than recalling knowledge. For years, AI systems scored very poorly. In December 2024, OpenAI's o3 reasoning model made a leap, scoring 75.7% on its semi-private test under the cost limits, and 87.5% with far more computation. Chollet responded by building harder versions, a reminder that each time AI conquers a test, we learn something about what the test was really measuring.

## Key Takeaways

- **Benchmarks** are fixed sets of tasks with checkable answers that let models be compared.
- Tests quickly **saturate**: MMLU, GPQA and others went from hard to near-solved in a few years; Humanity's Last Exam was built to be harder.
- Real-work benchmarks such as **SWE-bench** measure practical skills like fixing code; METR measures how long a task an agent can complete.
- **LMArena** ranks models by public votes using Elo ratings, but rewards style as well as substance.
- **Contamination** and over-optimization (Goodhart's law) mean scores should be read with caution.
- Strong models are often used as **judges** to grade open-ended answers; they agree with people about as often as people agree with each other, but have biases.
- **Validation** happens in stages: held-out loss and quick benchmarks during training, a large skills suite and behavior checks after post-training, safety red-teaming and outside testing, human evaluation, limited release and A/B tests, then a system card and monitoring after launch.

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
- Karl Cobbe et al., "Training Verifiers to Solve Math Word Problems" (GSM8K), OpenAI, 2021. arxiv.org/abs/2110.14168
- Mark Chen et al., "Evaluating Large Language Models Trained on Code" (HumanEval), OpenAI, 2021. arxiv.org/abs/2107.03374
- Xiang Yue et al., "MMMU: A Massive Multi-discipline Multimodal Understanding and Reasoning Benchmark," 2023. arxiv.org/abs/2311.16502
- Tianbao Xie et al., "OSWorld: Benchmarking Multimodal Agents for Open-Ended Tasks in Real Computer Environments," 2024. arxiv.org/abs/2404.07972
- Stephanie Lin, Jacob Hilton, Owain Evans, "TruthfulQA: Measuring How Models Mimic Human Falsehoods," 2021. arxiv.org/abs/2109.07958; OpenAI, "Introducing SimpleQA," October 2024.
- Lianmin Zheng et al., "Judging LLM-as-a-Judge with MT-Bench and Chatbot Arena," NeurIPS 2023. arxiv.org/abs/2306.05685
- US AI Safety Institute and UK AI Safety Institute, "Pre-Deployment Evaluation of Anthropic's Upgraded Claude 3.5 Sonnet," 19 November 2024. nist.gov; aisi.gov.uk
- Margaret Mitchell et al., "Model Cards for Model Reporting," FAT* 2019. arxiv.org/abs/1810.03993
- Colin White et al., "LiveBench: A Challenging, Contamination-Free LLM Benchmark," 2024. arxiv.org/abs/2406.19314
