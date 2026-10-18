# Chapter 12: Pretraining: The Big Run

All the pieces are now on the table: the data (Chapter 5), the learning method (Chapter 6), the Transformer design (Chapter 7), the scaling laws that tell you how big to go (Chapter 8), and the chips and buildings to run it on (Chapters 9 and 10). **Pretraining** is where they come together: a single, enormous training run, lasting weeks or months, that turns a randomly initialized network into a **base model** that has absorbed the patterns of trillions of tokens of text. This chapter follows such a run from planning to finish.

## Planning: Small Experiments Before the Big Bet

A frontier training run costs tens or hundreds of millions of dollars, and it can't simply be restarted if a decision turns out wrong. So months before it begins, teams run hundreds of smaller experiments:

- **The architecture**: how many layers, how wide, how many attention heads, dense or mixture of experts.
- **The tokenizer** and its vocabulary size.
- **The data mix**: what share of web text, code, math, books and other languages. Small models trained on different mixes show which recipe works best.
- **The hyperparameters**: the learning rate, batch size and their schedules, which are notoriously finicky.

Scaling laws then predict how the chosen recipe will perform at full size. Meta's Llama 3 team, for example, used scaling-law experiments to predict the final performance of its 405-billion-parameter model on reasoning tests before training it, and reported that the predictions were close.

## Splitting the Work: Parallelism

No single chip can hold a large model, let alone train it. The model and the work are divided among thousands of chips in several ways at once:

![Four ways to split training across chips: data parallelism gives each group of chips a different slice of the data; tensor parallelism splits each layer's calculations across chips; pipeline parallelism gives different layers to different chips, like an assembly line; and expert parallelism places different experts of a mixture-of-experts model on different chips.](images/diagram-parallelism.png)

- **Data parallelism.** Many copies of the model each process a different batch of text, then average what they learned. It's like a class of students each reading different chapters and pooling their notes.
- **Tensor parallelism.** A single layer's giant multiplications are split across several chips, which each do part of the sum.
- **Pipeline parallelism.** Different layers live on different chips, and batches flow through them like cars on an assembly line.
- **Expert parallelism.** In a mixture-of-experts model, different experts sit on different chips, and tokens are sent to wherever their chosen experts live.

Llama 3's largest model combined four kinds of parallelism across 16,384 GPUs. Getting them to work together efficiently, keeping every chip busy rather than waiting for data from another, is one of the hardest engineering problems in AI. A well-run job might keep the chips doing useful math 40% to 50% of the time; the rest is lost to communication and waiting.

## The Run Itself

Once training starts, a team watches it around the clock. The main gauge is the **loss curve**: the model's average error on the next token, which should fall steadily.

![A typical pretraining loss curve: the error falls quickly at first, then slowly and steadily for most of the run, with occasional sudden spikes that engineers must handle, and a final drop as the learning rate is lowered and the best data is added at the end.](images/diagram-loss-curve.png)

Things go wrong. Besides the hardware failures described in Chapter 10, the training itself can become unstable: the loss suddenly **spikes**, as if the model had been jolted. Sometimes it recovers on its own; sometimes the team must roll back to an earlier checkpoint, skip the batch of data that caused trouble, or lower the learning rate. Researchers have developed many techniques to keep training stable, and some labs now claim runs without any spikes at all: Moonshot AI reported that its one-trillion-parameter Kimi K2, trained on 15.5 trillion tokens with a new optimizer called MuonClip, had "zero training instability".

## The Phases of Pretraining

Pretraining isn't one uniform process. Modern runs typically have several phases:

1. **Main training.** The bulk of the tokens, mostly broad web text with code, math and books, usually with shorter passages of a few thousand tokens to save computation.
2. **Long-context extension.** Near the end, the model is trained on much longer documents so it can handle context windows of 128,000 tokens or more (Chapter 19). Llama 3 extended its context in six stages, using about 800 billion tokens.
3. **Annealing.** Finally, the learning rate is lowered gradually towards zero while the model is fed the highest-quality data: carefully chosen math, code and reference text. This last phase gives a surprisingly large boost.

> **Did You Know?** Training a frontier model is a team sport on an enormous scale. The paper describing Llama 3 lists several hundred core contributors, and many hundreds more people who helped. The Transformer paper, in 2017, had eight authors.

## What Does It Cost?

The most famous cost figure in AI comes from DeepSeek in China. In December 2024, it reported that the final training run of **DeepSeek-V3**, a mixture-of-experts model with 671 billion parameters (37 billion active per token), trained on 14.8 trillion tokens, took **2.788 million GPU-hours** on NVIDIA H800 chips. At an assumed rental price of $2 per GPU-hour, that is **about $5.6 million**.

When DeepSeek's R1 reasoning model, built on V3, went viral in January 2025, that number caused a sensation. Many assumed that frontier AI cost hundreds of millions to train, and on 27 January 2025 NVIDIA's stock lost about $589 billion in market value, the largest one-day loss for any company in history.

But the figure needs context, as DeepSeek itself noted. It covered only the final training run, not the earlier experiments and failed attempts, the salaries of its researchers or the cost of buying the chips. DeepSeek's key achievement was real efficiency: it used mixture of experts with many small experts, multi-head latent attention, and training in 8-bit numbers at an unprecedented scale. But "$6 million" was never the total cost of building a frontier AI lab.

## What Comes Out: The Base Model

At the end of pretraining, you have a **base model**: an extraordinarily knowledgeable text predictor, but not yet an assistant. Ask it a question and it may continue with more questions, as if it were writing a quiz. Type the start of a news story and it will finish it convincingly. It has absorbed grammar, facts, reasoning patterns, multiple languages and code, but it doesn't know that it's supposed to be helpful, honest or safe, or even that it is talking to someone.

> **In Plain Words:** Pretraining produces a brilliant mimic that has read almost everything, but doesn't yet know what you want from it. Turning it into a helpful assistant is the next stage.

That transformation, called **post-training**, is the subject of the next part of the book.

## Key Takeaways

- **Pretraining** is one huge training run, lasting weeks or months, that turns a random network into a knowledgeable **base model**.
- Teams plan with many small experiments and use scaling laws to predict the outcome.
- The work is split across thousands of chips using **data, tensor, pipeline and expert parallelism**.
- Training is watched through the loss curve; hardware failures and loss spikes are handled with checkpoints, rollbacks and careful design.
- Runs end with **long-context extension** and **annealing** on the best data.
- DeepSeek-V3's widely quoted $5.6 million covered only the final run's GPU rental, not the full cost.

## Sources and Further Reading

- Llama Team, Meta, "The Llama 3 Herd of Models," 2024 (scaling-law forecasting, 4D parallelism, long-context stages, annealing, contributor list). arxiv.org/abs/2407.21783
- DeepSeek-AI, "DeepSeek-V3 Technical Report," December 2024 (2.788M H800 GPU-hours, $5.576M, FP8 training). arxiv.org/abs/2412.19437
- Mohammad Shoeybi et al., "Megatron-LM: Training Multi-Billion Parameter Language Models Using Model Parallelism," 2019. arxiv.org/abs/1909.08053
- Yanping Huang et al., "GPipe: Efficient Training of Giant Neural Networks using Pipeline Parallelism," 2018. arxiv.org/abs/1811.06965
- Samyam Rajbhandari et al., "ZeRO: Memory Optimizations Toward Training Trillion Parameter Models," 2019. arxiv.org/abs/1910.02054
- Kimi Team, Moonshot AI, "Kimi K2: Open Agentic Intelligence," 2025 (MuonClip, 15.5T tokens). moonshotai.github.io/Kimi-K2
- Reuters and Bloomberg reporting on NVIDIA's market-value loss on 27 January 2025.
