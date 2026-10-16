# Chapter 22: A Tour of the Open Models

This chapter is a guided tour of the most important open model families: who made them, what's special about each, and the ideas they introduced. Model versions change every few months, so the focus is on each family's story and design, with the latest releases noted as of October 2026. Appendix C collects the key numbers in one place.

When reading the numbers, remember two terms from Chapter 7. A **dense** model uses all its parameters for every token. A **mixture-of-experts (MoE)** model has a large total but activates only a fraction per token, written here as "total / active", for example "671B / 37B".

![A family tree of open models from 2023 to 2026: Meta's Llama and Muse, Mistral, Alibaba's Qwen, DeepSeek, Google's Gemma, Microsoft's Phi, Moonshot's Kimi, Zhipu's GLM, OpenAI's gpt-oss and AI2's OLMo, with the size of the largest model in each family growing over time.](images/diagram-open-models.png)

## Meta: Llama and Muse

**Who:** Meta's AI research groups, later Meta Superintelligence Labs.

**The story:** Meta's **LLaMA** (February 2023), in sizes from 7 to 65 billion parameters, showed that smaller models trained on more data could rival much larger ones: the 13-billion-parameter version beat the 175-billion-parameter GPT-3 on most benchmarks. After the weights leaked (Chapter 21), **Llama 2** (July 2023) was released for commercial use, and **Llama 3** (April 2024) and **Llama 3.1** (July 2024) followed, the latter including a 405-billion-parameter dense model trained on 15.6 trillion tokens: the first open model to compete with the frontier. Llama 3.2 added small models for phones and versions that could see images.

**Llama 4** (April 2025) was Meta's first mixture-of-experts family: **Scout** (17 billion active parameters, 16 experts, about 109 billion in total, with a 10-million-token context) and **Maverick** (17 billion active, 128 experts, about 400 billion in total), both natively multimodal and distilled from a much larger teacher. Its reception was mixed, and Meta reorganized its AI efforts. Its new lab launched the **Muse** family in 2026, initially closed. Meta then released open versions: **Muse Glimmer** in August 2026 and, in October 2026, **Muse Spark Open**, a natively multimodal MoE model of about 816 billion parameters with 42 billion active and a context of a million tokens, under a custom license.

**Why it matters:** Llama made open models mainstream. Thousands of fine-tuned variants, and many other companies' models, were built on it.

## Mistral AI

**Who:** A Paris startup founded in 2023 by **Arthur Mensch**, **Guillaume Lample** and **Timothée Lacroix**.

**The story:** **Mistral 7B** (September 2023, Apache 2.0) outperformed Llama 2 models twice its size, thanks to efficient attention tricks. **Mixtral 8x7B** (December 2023) brought mixture of experts to open models: eight experts per layer, two chosen for each token, about 47 billion parameters in total and 13 billion active, matching much larger dense models at a fraction of the running cost. Mistral has since released a range of open models, including Mistral Small, the coding model Codestral, and **Magistral** (June 2025), its first reasoning models, alongside commercial ones. In October 2026, it previewed **Mistral Large 4**, with open weights promised.

**Why it matters:** Mistral proved that a small, new lab could build world-class models, made mixture of experts popular in the open world, and became Europe's leading AI company. Its 2025 life-cycle environmental study (Chapter 11) set a new standard for transparency.

## Alibaba: Qwen

**Who:** Alibaba Cloud's Qwen team in China. ("Qwen" comes from *Tongyi Qianwen*, roughly "a thousand questions".)

**The story:** Qwen's first open models appeared in August 2023. The family grew rapidly into the most extensive in the open world: models from under a billion parameters to hundreds of billions, plus specialized versions for coding, math, vision and audio. **Qwen3** (April 2025) was trained on 36 trillion tokens covering 119 languages and dialects, in sizes from 0.6 billion parameters to a 235-billion-parameter MoE with 22 billion active, all under Apache 2.0. It introduced hybrid "thinking" and "non-thinking" modes in a single model, with a user-adjustable thinking budget. Releases continued at a rapid pace in 2026, including the Qwen3.5 and Qwen3.6 generations, which brought image understanding to more of the family, while Alibaba kept its largest "Max" versions closed.

**Why it matters:** Qwen became one of the most downloaded and most fine-tuned model families in the world, and the base for countless other models, including DeepSeek's distilled reasoning models.

## DeepSeek

**Who:** A Hangzhou lab founded in 2023 by **Liang Wenfeng**, funded by the quantitative hedge fund High-Flyer, which he co-founded.

**The story:** **DeepSeek-V2** (May 2024) introduced **multi-head latent attention** (MLA), which shrinks the KV cache, and a fine-grained mixture of experts. **DeepSeek-V3** (December 2024), at 671 billion parameters with 37 billion active, trained on 14.8 trillion tokens using 8-bit numbers, rivaled the best closed models of the time for a reported final training cost of about $5.6 million (Chapter 12). **DeepSeek-R1** (January 2025) brought open reasoning, with a detailed recipe including the self-taught R1-Zero (Chapter 14), under the permissive MIT license. It briefly topped Apple's App Store in the US and shook the stock market.

DeepSeek followed with steady updates, and in April 2026 previewed **DeepSeek-V4**, reported as two MoE models, V4-Pro, with about 1.6 trillion parameters and 49 billion active, and V4-Flash, with about 284 billion and 13 billion active, both with a million-token context and MIT licenses.

**Why it matters:** DeepSeek showed that efficiency could partly substitute for scale, and that a Chinese lab working under export restrictions could reach the frontier. Its architecture ideas, MLA and fine-grained MoE, were widely copied.

## Google: Gemma

**Who:** Google DeepMind.

**The story:** **Gemma** (February 2024) offered small open models built from the same research as Gemini. **Gemma 2** (2024) and **Gemma 3** (March 2025) added sizes up to 27 billion parameters, image understanding and 128,000-token context; **Gemma 3n** was designed for phones. **Gemma 4** (April 2026) moved to the permissive Apache 2.0 license for the first time, with "effective" 2- and 4-billion-parameter models for devices, a 26-billion-parameter MoE with about 4 billion active, and a 31-billion-parameter dense model.

**Why it matters:** Gemma brought frontier-lab techniques, especially distillation from much larger models, to small sizes, and spawned many specialized variants for medicine, safety and other domains.

## Microsoft: Phi

**Who:** Microsoft Research.

**The story:** The **Phi** models tested a bold idea: that small models trained on carefully chosen and synthetic "textbook-quality" data could punch far above their weight. **Phi-1** (2023), a 1.3-billion-parameter coding model, was introduced with the paper "Textbooks Are All You Need". **Phi-3-mini** (2024) ran on a phone while rivaling much larger models. **Phi-4** (December 2024), with 14 billion parameters, was trained largely on about 400 billion tokens of synthetic data, and later reasoning versions followed. They are released under the MIT license.

**Why it matters:** Phi made data quality, rather than size, the headline (Chapter 5).

## OpenAI: gpt-oss

**Who:** OpenAI, which had released no open language model since GPT-2 in 2019.

**The story:** In August 2025, OpenAI released **gpt-oss-120b** (117 billion parameters, 5.1 billion active) and **gpt-oss-20b** (21 billion, 3.6 billion active), open-weight reasoning models under Apache 2.0. The larger one runs on a single 80 GB GPU and the smaller on a computer with 16 GB of memory. OpenAI published safety testing in which it deliberately fine-tuned the model to be malicious and found it still didn't reach high-risk capability levels.

**Why it matters:** The best-known closed lab rejoined the open world, a sign of how important open models had become.

## Moonshot AI: Kimi

**Who:** A Beijing startup founded in 2023 by **Yang Zhilin**.

**The story:** **Kimi K2** (July 2025) was one of the first open models with a **trillion** parameters: 32 billion active per token, chosen from 384 experts, trained on 15.5 trillion tokens with Moonshot's MuonClip optimizer without training instability. Designed for agentic work, it was followed by **K2 Thinking** (November 2025), a reasoning version able to make hundreds of tool calls in a row, and **K2.5** (January 2026), which added vision.

**Why it matters:** Kimi showed that new optimizers could train trillion-parameter models stably, and helped make "agentic" ability a central goal for open models.

## Zhipu AI: GLM

**Who:** Zhipu AI (Z.ai), a company spun out of Tsinghua University in Beijing.

**The story:** The **GLM** ("General Language Model") family dates back to 2021 research at Tsinghua. **GLM-4.5** (July 2025), a 355-billion-parameter MoE with 32 billion active, was built for reasoning, coding and agents. **GLM-5** (February 2026), with about 744 billion parameters and 40 billion active, was released under the MIT license and claimed performance close to leading closed models, followed by further updates.

**Why it matters:** GLM is one of several Chinese families, alongside Qwen, DeepSeek, Kimi and MiniMax, that made China the largest source of open frontier-scale models by 2026.

## Allen Institute for AI: OLMo

**Who:** The Allen Institute for AI (AI2), a nonprofit in Seattle founded by the late Microsoft co-founder **Paul Allen**.

**The story:** **OLMo** (February 2024) was "truly open": weights, the full Dolma training data, the training code, logs and intermediate checkpoints. **OLMo 2** (2025) and **OLMo 3** (November 2025, 7 and 32 billion parameters, trained on about 6 trillion tokens of the Dolma 3 dataset) narrowed the gap with open-weight models that keep their data secret. AI2's **Tülu** recipes do the same for post-training (Chapter 13).

**Why it matters:** OLMo is what scientists use to study how models learn, because every step can be inspected and reproduced.

## More Families Worth Knowing

- **NVIDIA Nemotron**: open models and, unusually, much of their training data, including hybrid Mamba-Transformer designs built for speed (Chapter 7).
- **Falcon** (Technology Innovation Institute, Abu Dhabi): Falcon 180B (2023) was briefly the largest open model.
- **xAI Grok-1**: in March 2024, xAI released the weights of its original 314-billion-parameter MoE Grok model.
- **MiniMax**, **IBM Granite**, **Cohere Command** (open for research use), **BLOOM** and **Pythia** each fill important niches: very long context, business use, many languages, research.

## How People Choose an Open Model

- **Size versus hardware.** A phone runs models of 1 to 4 billion parameters; a laptop with plenty of memory, up to about 30 billion when quantized; a single data-center GPU, models of roughly 100 billion with few active parameters; the largest MoE models need a server full of GPUs.
- **License.** Apache 2.0 and MIT allow nearly anything; custom licenses need reading.
- **Languages and modalities.** Qwen covers 119 languages; some models see images and hear audio.
- **Reasoning.** Many families now offer thinking modes.
- **Openness.** For research, fully open models such as OLMo are unmatched.

> **Did You Know?** Open models have taken on a life of their own. On Hugging Face, many of the most downloaded models aren't the originals but community variants: quantized versions to fit on laptops, fine-tunes for role-play, medicine, law or a particular language, and "merges" that average the parameters of several models together, a strange technique that often works surprisingly well.

## Key Takeaways

- **Llama** made open models mainstream; Llama 4 introduced MoE, and Meta's Muse family followed in 2026.
- **Mistral** popularized open MoE with Mixtral; **Qwen** became the broadest and most-used family; **DeepSeek** showed efficiency at the frontier and published an open reasoning recipe.
- **Gemma** and **Phi** excel at small sizes; **gpt-oss** marked OpenAI's return to open weights.
- **Kimi K2** and **GLM-5** are trillion-scale and near-trillion-scale open MoE models; **OLMo** is fully open, including its data.
- Choose by hardware, license, languages, modalities and openness.

## Sources and Further Reading

- Hugo Touvron et al., "LLaMA: Open and Efficient Foundation Language Models," 2023. arxiv.org/abs/2302.13971; Llama Team, "The Llama 3 Herd of Models," 2024. arxiv.org/abs/2407.21783
- Meta AI, "The Llama 4 herd," 5 April 2025. ai.meta.com/blog/llama-4-multimodal-intelligence; Meta Superintelligence Labs, Muse Spark Open model card, October 2026. huggingface.co/meta-models
- Albert Q. Jiang et al., "Mistral 7B," 2023. arxiv.org/abs/2310.06825; "Mixtral of Experts," 2024. arxiv.org/abs/2401.04088; mistral.ai/news
- An Yang et al., "Qwen3 Technical Report," 2025. arxiv.org/abs/2505.09388; qwenlm.github.io
- DeepSeek-AI, "DeepSeek-V2," 2024. arxiv.org/abs/2405.04434; "DeepSeek-V3 Technical Report," 2024. arxiv.org/abs/2412.19437; "DeepSeek-R1," 2025. arxiv.org/abs/2501.12948; DeepSeek-V4 preview, April 2026. huggingface.co/deepseek-ai
- Gemma Team, Google DeepMind, "Gemma 3 Technical Report," 2025. arxiv.org/abs/2503.19786; Gemma 4 model card, 2026. ai.google.dev/gemma
- Marah Abdin et al., "Phi-4 Technical Report," 2024. arxiv.org/abs/2412.08905
- OpenAI, "Introducing gpt-oss," 5 August 2025; model card. arxiv.org/abs/2508.10925
- Kimi Team, "Kimi K2: Open Agentic Intelligence," 2025. arxiv.org/abs/2507.20534; moonshotai.github.io/Kimi-K2
- GLM-4.5 Team, Zhipu AI, "GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models," 2025. arxiv.org/abs/2508.06471; Z.ai, GLM-5 release, February 2026. huggingface.co/zai-org
- Dirk Groeneveld et al., "OLMo: Accelerating the Science of Language Models," 2024. arxiv.org/abs/2402.00838; AI2, "Olmo 3," November 2025. allenai.org/olmo
- xAI, "Open Release of Grok-1," 17 March 2024. x.ai/news/grok-os
- Ebtesam Almazrouei et al., "The Falcon Series of Open Language Models," 2023. arxiv.org/abs/2311.16867
