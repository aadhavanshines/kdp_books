# Appendix E: Model Names and Abbreviations Decoded

AI model names can look like secret codes: *Qwen3-235B-A22B-Instruct*, *gemma-4-E4B-it*, *Mixtral-8x7B*. This appendix explains what the parts of a name usually mean, then decodes every model, family and benchmark name used in this book. Where a company has never explained a name, the entry says so rather than guessing.

## How to Read a Model Name

Most names are built from a family name plus a few common parts. These are **conventions, not rules**: each company uses them a little differently, and the same letter or word can mean different things in different families. The table gives the usual meaning and an example from a family that uses it; always check the model card for the exact meaning.

| Part of the name | Example | Usual meaning |
| --- | --- | --- |
| Number + B or T | Llama 3 **70B** | Usually total parameters: B = billion, T = trillion |
| Number x number | Mixtral **8x7B** | In Mistral's naming, a mixture of experts: 8 experts of about 7 billion parameters each (shared parts make the real total smaller, about 47 billion) |
| A + number | Qwen3-235B-**A22B** | In families such as Qwen, active parameters per token in a mixture-of-experts model: 22 billion of 235 billion |
| E + number | Gemma 4 **E4B** | In Google's Gemma family, "effective" size: Google describes it as running with roughly the resources of a 4-billion-parameter model, though it stores more |
| Version number | Claude **3.5**, Llama **3.1** | Usually the generation; a decimal often means an improved release of the same generation, but companies number versions differently |
| Base | Llama-3-8B-**Base** | Usually the raw pretrained model, before post-training (Chapter 12) |
| Instruct, Chat, -it | gemma-4-31B-**it** | Usually post-trained to follow instructions and chat (Chapter 13); in Gemma's names, "it" means instruction-tuned |
| Thinking, Reasoning, R | Kimi K2 **Thinking**, DeepSeek-**R1** | Usually trained to reason step by step before answering (Chapter 14) |
| Zero | DeepSeek-R1-**Zero** | In DeepSeek-R1-Zero, trained without human-written reasoning examples, by reinforcement learning only; the name echoes DeepMind's AlphaZero, which also learned without human examples |
| Mini, Nano, Lite, Flash, Small | Gemini 3 **Flash** | Usually smaller, faster and cheaper versions; the exact size differs by company |
| Pro, Max, Ultra, Large | DeepSeek-V4-**Pro** | Usually larger, more capable and more expensive versions; "Pro" is a mid-tier name for some companies and a top tier for others |
| Preview, Experimental, Beta | **Preview** | Usually early access that may change before full release |
| Coder, Math, VL, Audio, Omni | Qwen3-**Coder** | Usually specialized for code, math, vision-language, audio, or all modalities |
| A date | V4-Flash-**0731** | Usually a snapshot from that date (here, 31 July); some companies use other date formats, such as 2507 for July 2025 |
| Context length | **-128k**, **-1M** | Usually the context window, in tokens (Chapter 19) |
| GGUF, AWQ, GPTQ, Q4, FP8, INT4 | model-**Q4_K_M**.gguf | Usually a quantized, compressed version and its file format (Chapter 18); these tags come from the tools that made the file, not from the model's maker |

Following Qwen's own convention, *Qwen3-235B-A22B-Instruct* reads: Qwen family, third generation, 235 billion parameters in total, 22 billion active per token, post-trained to follow instructions.

## Language Model Families

**Alpaca** (Stanford, 2023). Named after an animal related to the llama, because it was built by fine-tuning Meta's LLaMA. It started a fashion for camel-family names.

**BERT** (Google, 2018). *Bidirectional Encoder Representations from Transformers*: it reads text in both directions at once, rather than left to right.

**BLOOM** (BigScience, 2022). *BigScience Large Open-science Open-access Multilingual Language Model*.

**Bard** (Google, 2023). A bard is a poet and storyteller; Google's first chatbot, later replaced by Gemini.

**Chinchilla and Gopher** (DeepMind, 2021-2022). Animal names; the smaller Chinchilla beat the larger Gopher (Chapter 8).

**Claude** (Anthropic, 2023). Widely reported to honor Claude Shannon, the founder of information theory (Chapter 1). The tiers are named after literary forms of growing length: **Haiku** (a three-line poem: small and fast), **Sonnet** (fourteen lines: balanced) and **Opus** (a major work: the largest). Anthropic's **Fable** and **Mythos** models continue the literary theme; the company hasn't published a meaning beyond that.

**Codestral, Magistral, Mixtral** (Mistral AI). Blends of *Mistral* with *code*, *magistral* (masterly) and *mixture* (of experts).

**DeepSeek** (DeepSeek, from 2023). The company's name. **V** marks the main versions (V2, V3, V4); **R** marks reasoning models (R1).

**Doubao** (ByteDance). Chinese for, roughly, a "bean bun": a friendly everyday nickname.

**ELIZA** (MIT, 1966). Named after Eliza Doolittle, the flower seller taught to speak "properly" in George Bernard Shaw's play *Pygmalion*.

**ERNIE** (Baidu). *Enhanced Representation through kNowledge IntEgration*, and a playful companion to BERT (Bert and Ernie are friends on *Sesame Street*).

**Falcon** (Technology Innovation Institute, Abu Dhabi). The falcon is the national bird of the United Arab Emirates.

**Gemini** (Google DeepMind, 2023). Latin for "twins". According to Google, Jeff Dean chose it to represent the two teams that merged to build it, Google Brain and DeepMind, and as a nod to NASA's Project Gemini, which prepared the way for the Moon landings. The project's earlier code name was Titan. **Gemini 4 Argon**: a release name; Google hasn't explained it.

**Gemma** (Google DeepMind, 2024). Latin for "precious stone", a smaller sibling of Gemini.

**GLM** (Zhipu AI). *General Language Model*, the name of the 2021 Tsinghua University research design it began from.

**GPT** (OpenAI, 2018). *Generative Pre-trained Transformer*: it generates text, it is pre-trained on a large body of text before any task-specific training, and it is built on the Transformer.
- **InstructGPT**: GPT post-trained to follow instructions (Chapter 13).
- **ChatGPT**: the chat product built on GPT models.
- **GPT-4o**: the "o" stands for "omni", because it handles text, images and audio in one model.
- **o1, o3** (the "o-series"): OpenAI's reasoning models. OpenAI said it restarted the numbering at 1 to mark a new kind of model.
- **gpt-oss**: OpenAI's open-weight models; "oss" is the common abbreviation for open-source software.
- **GPT-6 Astra, Sol and Luna**: release names. OpenAI hasn't explained them; in Latin, *astra* means "stars", and *Sol* and *Luna* are the Sun and the Moon.

**Grok** (xAI, 2023). A word invented by Robert Heinlein in his 1961 novel *Stranger in a Strange Land*, meaning to understand something completely and intuitively.

**Hunyuan** (Tencent). A Chinese term from classical philosophy for the primordial unity from which everything arises.

**Jamba** (AI21 Labs, 2024). *Joint Attention and Mamba*: a hybrid of Transformer attention and Mamba layers (Chapter 7).

**Kimi** (Moonshot AI). A brand name; Moonshot hasn't published a meaning. **K2**: the second generation of the Kimi K models.

**LLaMA / Llama** (Meta, 2023). Originally *Large Language Model Meta AI*, written LLaMA; from Llama 2 onward, simply Llama.

**Mamba** (2023). Named after the fast snake. It grew out of a line of "structured state-space" models known as S4.

**Mistral** (Mistral AI, 2023). Named after the strong, cold wind that blows through southern France.

**MiniMax** (MiniMax, China). The company's name; in game theory, "minimax" is a strategy for minimizing the worst possible loss.

**Muse** (Meta, 2026). Meta's family name; in Greek myth, the Muses inspired the arts and sciences. **Spark**, **Glimmer** and **Open** distinguish versions.

**Nemotron** (NVIDIA). NVIDIA's name for its open model family; no official expansion.

**OLMo** (Allen Institute for AI, 2024). *Open Language Model*, reflecting that its data, code and checkpoints are all published.

**Phi** (Microsoft Research, 2023). The Greek letter φ; Microsoft hasn't published an expansion.

**Pythia** (EleutherAI, 2023). The priestess of the Oracle of Delphi in ancient Greece.

**Qwen** (Alibaba, 2023). Short for *Tongyi Qianwen*, roughly "truth from a thousand questions".

**Switch Transformer** (Google, 2021). A Transformer whose router "switches" each token to one expert (Chapter 7).

**Tülu** (Allen Institute for AI, 2023). A tülu is a hybrid camel, continuing the camel-family naming that followed LLaMA.

## Image, Video, Speech and Robot Models

**AlexNet** (2012). Named after its first author, Alex Krizhevsky.

**AlphaGo, AlphaFold** (DeepMind). DeepMind's "Alpha" series of systems that master a single hard problem: Go, protein folding.

**CLIP** (OpenAI, 2021). *Contrastive Language-Image Pre-training*: it learns by contrasting matching and mismatched image-caption pairs.

**DALL·E** (OpenAI, 2021). A blend of the painter Salvador **Dalí** and Pixar's robot **WALL·E**.

**Flamingo** (DeepMind, 2022). Named after the bird; part of DeepMind's habit of animal names.

**FLUX** (Black Forest Labs, 2024). A brand name; the word means "flow", and the models use flow matching (Chapter 25). The company hasn't published an expansion.

**Genie** (Google DeepMind). Named after the wish-granting spirit: describe a world and it appears.

**GPT Image** (OpenAI). OpenAI's image-generation models, built into its GPT models.

**Kling** (Kuaishou), **Seedance** (ByteDance), **Veo** (Google), **Runway Gen-4.5**, **Luma Ray**. Brand names for video models; "Gen" in Runway's names stands for *generation*.

**LLaVA** (2023). *Large Language and Vision Assistant*.

**Midjourney** (2022). The lab's brand name.

**Nano Banana** (Google, 2025). The playful code name under which Google's Gemini 2.5 Flash Image model was tested anonymously on LMArena; it became so popular that Google kept it.

**RT-2** (Google DeepMind, 2023). *Robotics Transformer 2*.

**Sora** (OpenAI, 2024). *Sora* is the Japanese word for "sky"; OpenAI hasn't explained the choice.

**Stable Diffusion** (2022). From *diffusion* (Chapter 25) and Stability AI, which funded its release.

**StyleGAN** (NVIDIA, 2018). A *style-based generative adversarial network*.

**Suno, Udio** (music). Brand names.

**VALL-E** (Microsoft, 2023). Its name echoes DALL·E; it generates voices rather than pictures.

**ViT** (Google, 2020). *Vision Transformer*.

**WaveNet** (DeepMind, 2016). A network that generates raw audio waveforms.

**Whisper** (OpenAI, 2022). A speech-recognition model; OpenAI hasn't explained the name.

**word2vec** (Google, 2013). "Word to vector": it turns each word into a list of numbers (Chapter 4).

## Agent and Tool Names

**AutoGPT** (2023). An autonomous agent loop around GPT-4. **Claude Code**, **Codex**, **Copilot**, **Devin** and **Operator** are product names for coding and computer-use agents (Chapter 20). **MCP**: *Model Context Protocol*. **A2A**: *Agent2Agent*.

## Chip Names

NVIDIA names its GPU generations after scientists, and the letter in a chip's name comes from the scientist:

- **V100**: Volta, after Alessandro Volta, inventor of the battery.
- **A100**: Ampere, after André-Marie Ampère, a founder of the science of electromagnetism.
- **H100, H200**: Hopper, after Grace Hopper, a pioneer of computer programming.
- **B200**: Blackwell, after David Blackwell, a statistician and the first Black scholar inducted into the US National Academy of Sciences.
- **Rubin**: Vera Rubin, the astronomer whose observations provided key evidence for dark matter. NVIDIA's **Grace** CPU is also named after Grace Hopper.

Other abbreviations: **GPU**, *graphics processing unit*; **TPU**, Google's *Tensor Processing Unit*; **HBM**, *high-bandwidth memory*; **NVLink**, NVIDIA's chip-to-chip connection; **EUV**, *extreme ultraviolet* (lithography).

## Benchmark Names

- **MMLU**: *Massive Multitask Language Understanding*.
- **GPQA**: *Graduate-level Google-Proof Q&A*.
- **GSM8K**: *Grade School Math*, about 8,000 (8K) problems.
- **AIME**: *American Invitational Mathematics Examination*.
- **HLE**: *Humanity's Last Exam*.
- **ARC-AGI**: *Abstraction and Reasoning Corpus for Artificial General Intelligence*.
- **SWE-bench**: a *software engineering* benchmark.
- **MMMU**: *Massive Multi-discipline Multimodal Understanding*.
- **WMDP**: *Weapons of Mass Destruction Proxy*.
- **HELM**: *Holistic Evaluation of Language Models*.
- **τ-bench**: its paper describes it as a benchmark for *tool-agent-user* interaction.
- **OSWorld**: tasks across real *operating systems*.
- **HumanEval**: coding problems written by humans to evaluate models.
