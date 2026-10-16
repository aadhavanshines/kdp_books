# Chapter 14: Reasoning Models: Learning to Think

Ask an early chatbot a tricky math puzzle and it would answer instantly, often confidently wrong. It was producing an answer the way you might blurt out the first thing that comes to mind. Since late 2024, a new kind of model has changed that: **reasoning models**, which "think" before they answer, sometimes for seconds, sometimes for many minutes, working through a problem step by step, checking their work and trying different approaches. This chapter explains where the idea came from and how these models are trained.

## Thinking Out Loud

Every token a language model generates takes about the same amount of computation. So when a model blurts out "The answer is 42", it has spent only a few tokens' worth of thought on a problem that might deserve pages. A person solving a hard problem writes things down: intermediate results, partial attempts, checks.

In January 2022, **Jason Wei**, **Denny Zhou** and colleagues at Google showed that simply giving a model examples of step-by-step solutions in the prompt dramatically improved its performance on math word problems. They called it **chain-of-thought prompting**. A few months later, **Takeshi Kojima** and colleagues found something even simpler: adding the phrase "Let's think step by step" to a question made models noticeably better at reasoning.

Writing out the steps works because each step becomes part of the context for the next. The model can use its own written intermediate results, just as you use scrap paper.

## From a Trick to a Skill

Chain-of-thought prompting was a trick that users had to remember. The next step was to **train** models to reason well on their own, and to reward them for getting the answer right.

The key ingredient is **reinforcement learning with verifiable rewards**. Choose problems where the answer can be checked automatically: a math problem with a known numerical answer, a programming task with tests to pass, a logic puzzle with a unique solution. Then:

1. Let the model attempt each problem, writing out its reasoning, many times.
2. Check each final answer automatically.
3. Reward the reasoning paths that led to correct answers, and discourage those that didn't.
4. Repeat, on many thousands of problems.

![How reasoning models are trained: the model attempts a problem several times, writing out its reasoning; an automatic checker marks each final answer right or wrong; successful attempts are reinforced; over many rounds, the model learns longer and more careful reasoning strategies.](images/diagram-reasoning-rl.png)

Nobody tells the model *how* to reason. It discovers strategies, such as breaking a problem into parts, checking intermediate results, noticing mistakes and backtracking, simply because they lead to more correct answers.

## o1: The First Reasoning Model

On 12 September 2024, OpenAI released **o1**, the first widely available model trained this way. It thought, sometimes for a long time, before answering, and the improvement on hard problems was startling. On a qualifying exam for the International Mathematical Olympiad, OpenAI reported that its previous model, GPT-4o, solved 13% of problems; the o1 reasoning model solved 83%.

OpenAI also reported something important: o1's performance improved smoothly both with more reinforcement-learning training and with more **thinking time** at answer time. This was the new scaling law of Chapter 8: spending more computation while answering, not just while training, reliably bought better answers.

## DeepSeek-R1: The Recipe Goes Public

OpenAI didn't reveal how o1 was trained, and it hid the model's raw reasoning from users. In January 2025, the Chinese lab DeepSeek released **DeepSeek-R1**, an open-weight reasoning model that matched o1 on many tests, together with a paper describing exactly how it was made.

Its most striking experiment was **R1-Zero**: the team took their base model and applied reinforcement learning with only right-or-wrong rewards, with no examples of human reasoning at all. The model taught itself to reason. Its reasoning grew longer as training went on, and it spontaneously began re-checking its work and trying alternatives.

> **Did You Know?** The DeepSeek researchers described an "aha moment" in R1-Zero's training, in which the model, partway through solving a problem, wrote words to the effect of "Wait, wait. That's an aha moment I can flag here," and went back to re-evaluate its approach. Nobody had taught it to do this. In September 2025, a version of the R1 paper was published in *Nature*, the first major language model to go through full peer review; it reported that the reasoning training stage had cost about $294,000 on top of the base model.

DeepSeek used an efficient reinforcement-learning method of its own, **Group Relative Policy Optimization (GRPO)**, which scores each attempt against the average of a group of attempts at the same problem, avoiding the need for a separate model to judge answers. Within months, nearly every lab had a reasoning model: Anthropic's Claude 3.7 Sonnet (February 2025) was the first "hybrid" model that could answer instantly or think at length, as the user chose, and Google, Alibaba, xAI and others followed.

## Olympiad Gold

In July 2025, both Google DeepMind and OpenAI announced that experimental reasoning models had achieved **gold-medal-level** scores at the International Mathematical Olympiad, the world's most prestigious math competition for high-school students, solving five of the six problems and writing their proofs in ordinary language, within the same time limits as human contestants. Just a year earlier, the best AI systems had needed problems translated into special formal languages and days of computing. It was one of the clearest signs of how quickly reasoning had improved.

## Thinking Budgets and Effort

Thinking costs time and money: every reasoning token must be generated and paid for. So modern models let users and developers choose how hard the model should think, through settings with names like "effort", "thinking budget" or "reasoning level". An easy question gets a quick answer; a hard proof or a tricky bug gets minutes of reasoning. Some systems decide automatically how much thinking a question needs.

> **In Plain Words:** A reasoning model is a model that has been trained to use scrap paper, and rewarded for getting the right answer. The more scrap paper it's allowed, the better it does on hard problems.

## Do Models Really "Think"?

Reasoning models write text that looks like thinking: "Hmm, let me reconsider." Whether it is thinking, in a human sense, is a philosophical question. What's clear is that the written reasoning helps them get right answers, and that it has quirks:

- **Overthinking.** Models sometimes reason at great length about very simple questions.
- **Faithfulness.** The written reasoning doesn't always reflect what actually drove the answer. In 2025, Anthropic researchers found that reasoning models, given a hint about the answer, often used the hint without mentioning it in their reasoning. Reading a model's chain of thought is a valuable safety tool (Chapter 16), but not a perfect window into its mind.
- **Limits beyond checkable answers.** Reinforcement learning works best where answers can be verified: math, code, puzzles. Extending it to writing, judgment and open-ended research, where there's no answer key, is an active area of research, often using other AI models as judges.

## Key Takeaways

- **Chain-of-thought** prompting (2022) showed that writing out steps improves reasoning.
- **Reasoning models** are trained with reinforcement learning on problems whose answers can be **checked automatically**, and discover strategies like self-checking and backtracking on their own.
- OpenAI's **o1** (September 2024) was the first; **DeepSeek-R1** (January 2025) published an open recipe, including the self-taught **R1-Zero**.
- Performance improves with more **thinking time**, a new kind of scaling; users can often choose the effort level.
- In July 2025, AI reasoning models reached gold-medal level at the International Mathematical Olympiad.
- Written reasoning is useful but not always a faithful account of what drives the answer.

## Sources and Further Reading

- Jason Wei et al., "Chain-of-Thought Prompting Elicits Reasoning in Large Language Models," 2022. arxiv.org/abs/2201.11903
- Takeshi Kojima et al., "Large Language Models are Zero-Shot Reasoners," 2022. arxiv.org/abs/2205.11916
- OpenAI, "Learning to Reason with LLMs," 12 September 2024. openai.com/index/learning-to-reason-with-llms
- DeepSeek-AI, "DeepSeek-R1: Incentivizing Reasoning Capability in LLMs via Reinforcement Learning," January 2025. arxiv.org/abs/2501.12948
- Daya Guo et al., "DeepSeek-R1 incentivizes reasoning in LLMs through reinforcement learning," *Nature* 645 (2025). nature.com/articles/s41586-025-09422-z
- Zhihong Shao et al., "DeepSeekMath" (introducing GRPO), 2024. arxiv.org/abs/2402.03300
- Anthropic, "Claude 3.7 Sonnet and Claude Code," 24 February 2025. anthropic.com/news/claude-3-7-sonnet
- Google DeepMind, "Advanced version of Gemini with Deep Think officially achieves gold-medal standard at the International Mathematical Olympiad," July 2025. deepmind.google
- Yanda Chen et al., "Reasoning Models Don't Always Say What They Think," Anthropic, April 2025. anthropic.com/research/reasoning-models-dont-say-think
