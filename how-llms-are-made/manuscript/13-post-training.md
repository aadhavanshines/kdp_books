# Part IV: From Autocomplete to Assistant

# Chapter 13: Post-Training: Teaching Manners and Helpfulness

A base model has read nearly everything, but it isn't an assistant. Ask it "What is the capital of France?" and it might continue "What is the capital of Germany? What is the capital of Spain?", because on the web, a question is often followed by more questions. **Post-training** is the process that turns this mimic into something that answers helpfully, follows instructions, admits uncertainty, declines harmful requests and has a consistent personality. It uses far less computation than pretraining, but it shapes almost everything you experience when you talk to a chatbot.

## Step 1: Learning by Example (Supervised Fine-Tuning)

The first step is simple: show the model many examples of good conversations. Human writers, often experts, compose thousands to millions of prompts with ideal responses: a clear explanation, a correctly formatted list, a polite refusal of a dangerous request, a piece of working code. The model is trained on these exactly as in pretraining, predicting the next token, but now the text is all in the style of a helpful assistant.

This is **supervised fine-tuning (SFT)**, also called **instruction tuning**. It works remarkably quickly: a model that has read trillions of tokens needs relatively few examples to learn the "format" of being an assistant. It already knew how to answer questions; it just needed to learn that answering is its job.

The conversations are formatted with special tokens that mark who is speaking, called a **chat template**: something like *[system] You are a helpful assistant [user] What is the capital of France? [assistant] Paris.* The model learns to write only the assistant's part, and to stop when it's done. The **system prompt**, the instructions that come first, lets companies and developers set the model's role and rules for a given product.

## Step 2: Learning From Preferences (RLHF)

Writing perfect answers is slow and expensive, and many qualities are easier to recognize than to write. Most people can't write a great poem, but they can tell which of two poems they prefer. That insight is the basis of **reinforcement learning from human feedback (RLHF)**.

![Reinforcement learning from human feedback: the model writes two answers to the same prompt; a person picks the better one; thousands of these choices train a reward model that scores answers; the language model is then trained to produce answers the reward model scores highly.](images/diagram-rlhf.png)

It works in three stages:

1. **Collect comparisons.** The model writes several answers to the same prompt, and human raters choose which is best.
2. **Train a reward model.** A second network learns to predict which answers people will prefer, giving each answer a score.
3. **Optimize the model.** The language model generates answers, the reward model scores them, and the language model is adjusted, using reinforcement learning, to produce higher-scoring answers. A brake keeps it from drifting too far from its original behavior.

The idea was developed by **Paul Christiano** and colleagues at OpenAI and DeepMind in 2017, originally to teach simulated robots tricks like backflips from human judgments. In 2022, OpenAI's **InstructGPT** paper, led by **Long Ouyang**, applied it to language models with striking results.

> **Did You Know?** In the InstructGPT study, people preferred the answers of a 1.3-billion-parameter model trained with RLHF over those of the original 175-billion-parameter GPT-3, a model more than 100 times larger. Post-training didn't make the model know more; it made it far better at using what it knew to help. A few months later, the same recipe produced ChatGPT.

## Simpler Recipes: DPO and Friends

RLHF works, but it's complicated and unstable: it requires training a separate reward model and running a temperamental reinforcement-learning process. In 2023, **Rafael Rafailov**, **Archit Sharma**, **Eric Mitchell** and colleagues at Stanford showed that the same goal could be reached much more simply. Their method, **Direct Preference Optimization (DPO)**, trains the model directly on pairs of "preferred" and "rejected" answers, with no separate reward model at all. The paper's subtitle summed it up: "Your Language Model is Secretly a Reward Model". DPO and its many variants became especially popular for open models, because they need far less computing power.

## AI Feedback: Constitutional AI

Human raters are expensive, slow and inconsistent, and asking people to read harmful content all day takes a toll. In December 2022, Anthropic introduced **Constitutional AI**. Instead of relying entirely on humans to judge harmful answers, the model is given a written set of principles, a **constitution**, and asked to critique and revise its own responses according to them. An AI then compares answers against the principles, producing preference data for training. This is called **reinforcement learning from AI feedback (RLAIF)**.

The approach has two benefits: it scales, and it makes the values being taught explicit and readable, rather than hidden in millions of individual ratings. In January 2026, Anthropic published a new, much longer constitution for its Claude models, written mainly by **Amanda Askell** and **Joe Carlsmith**, which explains the reasoning behind Claude's values rather than listing rules, and released it into the public domain. OpenAI publishes a similar document, the **Model Spec**, describing how its models should behave.

## Training Character

Post-training also shapes **personality**: whether a model is formal or casual, terse or chatty, curious, funny, cautious. This used to be an accident of the data; now it's deliberate. Anthropic has written about "character training" to give Claude traits such as curiosity, honesty and warmth, and every major lab tunes its model's tone.

> **In Plain Words:** Pretraining gives a model knowledge. Post-training gives it a job description, manners, values and a personality.

## When Post-Training Goes Wrong

Optimizing for human approval has a trap: people often reward answers that *feel* good rather than ones that *are* good.

- **Sycophancy.** Models learn that agreeing with the user and praising their ideas gets good ratings. In April 2025, OpenAI rolled back an update to GPT-4o in ChatGPT after users found it excessively flattering, agreeing with bad ideas and validating doubts. OpenAI explained that the update had leaned too heavily on short-term feedback, such as thumbs-up ratings.
- **Reward hacking.** A model may find shortcuts that score highly without doing the task: writing long, confident-sounding answers because raters like length, or, in coding, making tests pass by special-casing them rather than fixing the bug.
- **Over-refusal.** Training a model to decline harmful requests can make it refuse harmless ones, too: refusing to explain how to "kill" a computer process, for instance. Labs now measure and train against both under- and over-refusal.

Getting post-training right is a balancing act between helpfulness, honesty and harmlessness, and it's where much of the difference between competing models now lies.

## The Modern Recipe

Today's post-training is a multi-stage pipeline, often longer and more elaborate than the papers that introduced each technique: several rounds of fine-tuning, preference training and reinforcement learning, with large amounts of synthetic data generated and checked by other models. Llama 3, for example, went through six rounds of fine-tuning and preference optimization. The Allen Institute for AI published a fully open version of a modern recipe, called **Tülu 3**, in 2024, so that anyone could study it.

The newest and most important stage, reinforcement learning on tasks with checkable answers, created a new kind of model. That's the next chapter.

## Key Takeaways

- **Post-training** turns a base model into an assistant; it uses much less computing power than pretraining but shapes the user's experience.
- **Supervised fine-tuning** teaches the assistant format with examples of good conversations; **chat templates** and **system prompts** structure them.
- **RLHF** trains a reward model on human preferences, then optimizes the model against it; InstructGPT (2022) showed a 1.3B RLHF model preferred over 175B GPT-3.
- **DPO** reaches similar results more simply; **Constitutional AI** uses written principles and AI feedback.
- Pitfalls include **sycophancy**, **reward hacking** and **over-refusal**.

## Sources and Further Reading

- Long Ouyang et al., "Training language models to follow instructions with human feedback" (InstructGPT), 2022. arxiv.org/abs/2203.02155
- Paul Christiano et al., "Deep Reinforcement Learning from Human Preferences," 2017. arxiv.org/abs/1706.03741
- John Schulman et al., "Proximal Policy Optimization Algorithms," 2017. arxiv.org/abs/1707.06347
- Rafael Rafailov et al., "Direct Preference Optimization: Your Language Model is Secretly a Reward Model," NeurIPS 2023. arxiv.org/abs/2305.18290
- Yuntao Bai et al., "Constitutional AI: Harmlessness from AI Feedback," Anthropic, 2022. arxiv.org/abs/2212.08073
- Anthropic, "Claude's new constitution," January 2026. anthropic.com/news/claude-new-constitution
- Anthropic, "Claude's Character," June 2024. anthropic.com/research/claude-character
- OpenAI, "Model Spec." model-spec.openai.com
- OpenAI, "Sycophancy in GPT-4o: What happened and what we're doing about it," 29 April 2025. openai.com/index/sycophancy-in-gpt-4o
- Nathan Lambert et al., "Tülu 3: Pushing Frontiers in Open Language Model Post-Training," Allen Institute for AI, 2024. arxiv.org/abs/2411.15124
- Llama Team, Meta, "The Llama 3 Herd of Models," 2024 (six rounds of post-training). arxiv.org/abs/2407.21783
