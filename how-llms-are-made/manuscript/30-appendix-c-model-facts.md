# Appendix C: Model Fact Sheets

Quick reference for the major model families, as of October 2026. Model names and abbreviations are decoded in Appendix E.

**How to read these sheets.**

- "Total / active" gives the parameters of mixture-of-experts models.
- Each figure comes from the document named under **Source**: a technical report (an arXiv number) or the model card on Hugging Face (huggingface.co/ followed by the name given). Where the author could confirm a figure only in an announcement or press report, not in a technical report or model card, it is marked **(reported)**.
- Figures belong to the exact model named. Another version in the same family may differ in size, context length or license.
- **Status** uses four terms:
  - *Released*: generally available;
  - *Preview*: early access that may change;
  - *Limited*: available only to selected partners;
  - *Announced*: described but not yet available.
- **Licenses can differ between models in the same family**, and "open weights" does not mean "open source" (Chapter 21). Always check the license file of the exact model you download.

## Open-Weight Families

**Llama and Muse (Meta, United States)**
- LLaMA (February 2023; research license). Source: Touvron et al., "LLaMA: Open and Efficient Foundation Language Models," arXiv:2302.13971 (section 2).
- Llama 3.1 405B (July 2024; dense; 15.6T training tokens; Llama 3.1 Community License). Source: Llama Team, "The Llama 3 Herd of Models," arXiv:2407.21783 (sections 1 and 3); model card meta-llama/Llama-3.1-405B.
- Llama 4 Scout (about 109B total / 17B active, 10M context) and Maverick (about 400B / 17B) (April 2025; Llama 4 Community License). Source: Meta AI, "The Llama 4 herd," 5 April 2025; model card meta-llama/Llama-4-Scout-17B-16E-Instruct.
- Muse Spark Open (October 2026; 816B / 42B; 1M context; multimodal; Muse Model License). Status: Released (open weights). Source: model card meta-models/Muse-Spark-Open-816B-A42B; Hugging Face blog, "Welcome Muse Spark Open," 15 October 2026. License: Meta's custom Muse Model License, not an open-source license; check its attribution and commercial-use terms.
- Muse Glimmer (10 August 2026; dense, about 30B parameters; distilled from Muse Spark; Apache 2.0) (reported). Status: Released (open weights). Source: Meta's release on Hugging Face, as reported by SiliconANGLE and *The Register*, 10 August 2026; confirm the exact size in the model card.

**Mistral (Mistral AI, France)**
- Mistral 7B (September 2023; Apache 2.0). Source: Jiang et al., "Mistral 7B," arXiv:2310.06825; model card mistralai/Mistral-7B-v0.1.
- Mixtral 8x7B (December 2023; about 47B / 13B; Apache 2.0). Source: Jiang et al., "Mixtral of Experts," arXiv:2401.04088; model card mistralai/Mixtral-8x7B-v0.1.
- Mistral Large 4. Status: Preview (October 2026) (reported); open weights promised but not yet published, so no size or license is listed here.

**Qwen (Alibaba Cloud, China)**
- Qwen3 (April to May 2025; 0.6B to 235B / 22B; 36T tokens; 119 languages; thinking modes; Apache 2.0). Source: Yang et al., "Qwen3 Technical Report," arXiv:2505.09388; model card Qwen/Qwen3-235B-A22B.
- Qwen3.5 and Qwen3.6 open models. Status: Released (2026); larger "Max" models remain closed. No sizes are listed here because they vary by model; see each model card under huggingface.co/Qwen.
- Licenses: most open Qwen models use Apache 2.0; some earlier releases used Alibaba's own Qwen license.

**DeepSeek (DeepSeek, China)**
- DeepSeek-V3 (December 2024; 671B / 37B; 14.8T tokens). Source: DeepSeek-AI, "DeepSeek-V3 Technical Report," arXiv:2412.19437; model card deepseek-ai/DeepSeek-V3. License: code under MIT; the original V3 weights under the DeepSeek Model License, with later updates under MIT.
- DeepSeek-R1 (January 2025; MIT). Source: DeepSeek-AI, arXiv:2501.12948; Guo et al., *Nature* 645 (2025); model card deepseek-ai/DeepSeek-R1.
- DeepSeek-V4-Pro (about 1.6T / 49B) and V4-Flash (about 284B / 13B), with 1M-token context (MIT) (reported). Status: Preview, open weights (from April 2026). Source: DeepSeek's V4 release notes; confirm figures in the V4 model cards under huggingface.co/deepseek-ai, since press reports of V4-Flash's size vary.

**Gemma (Google DeepMind)**
- Gemma 3 (March 2025; up to 27B; images; 128K context; Gemma Terms of Use). Source: Gemma Team, "Gemma 3 Technical Report," arXiv:2503.19786; model card google/gemma-3-27b-it.
- Gemma 4 (from April 2026; E2B, E4B, 26B MoE with about 4B active, 31B dense, later a 12B; Apache 2.0, the first Gemma under a standard open-source license). Status: Released. Source: Google, Gemma 4 model card, ai.google.dev/gemma/docs/core/model_card_4.

**Phi (Microsoft Research)**
- Phi-4 (December 2024; 14B; mostly synthetic data; MIT). Source: Abdin et al., "Phi-4 Technical Report," arXiv:2412.08905; model card microsoft/phi-4.

**gpt-oss (OpenAI)**
- gpt-oss-120b (117B / 5.1B) and gpt-oss-20b (21B / 3.6B) (August 2025; reasoning; text only; Apache 2.0). Status: Released. Source: OpenAI, "gpt-oss-120b & gpt-oss-20b Model Card," arXiv:2508.10925; model cards openai/gpt-oss-120b and openai/gpt-oss-20b.

**Kimi (Moonshot AI, China)**
- Kimi K2 (July 2025; about 1T / 32B; 384 experts; 15.5T tokens; modified MIT license). Source: Kimi Team, "Kimi K2: Open Agentic Intelligence," arXiv:2507.20534; model card moonshotai/Kimi-K2-Instruct.
- K2 Thinking (November 2025) and K2.5 with vision (January 2026). Status: Released (reported). Sizes and licenses: see the individual model cards under huggingface.co/moonshotai.

**GLM (Zhipu AI / Z.ai, China)**
- GLM-4.5 (July 2025; 355B / 32B; MIT). Source: GLM-4.5 Team, "GLM-4.5: Agentic, Reasoning, and Coding (ARC) Foundation Models," arXiv:2508.06471; model card zai-org/GLM-4.5.
- GLM-5 (February 2026; about 744B / 40B; MIT). Status: Released. Source: Z.ai, model card zai-org/GLM-5.

**OLMo (Allen Institute for AI)**
- OLMo 3 (November 2025; 7B and 32B; Dolma 3, about 6T tokens) and OLMo 3.1 (December 2025). Fully open: weights, data, code and checkpoints. Apache 2.0. Status: Released. Source: AI2, "Olmo 3" technical report and announcement, 20 November 2025, allenai.org/olmo; model cards under huggingface.co/allenai.

**Other notable open models:** NVIDIA Nemotron; Falcon (TII); Grok-1 weights (xAI, March 2024, Apache 2.0); MiniMax; IBM Granite; BLOOM (BigScience, 2022, BigScience RAIL license).

## Closed Frontier Families

**GPT (OpenAI)**
- GPT-4 (March 2023), GPT-4o (May 2024), o1 (September 2024) and GPT-5 (August 2025): Released.
- GPT-6 Astra: unveiled as a limited preview on 3 September 2026; Released to the public from 4 September.
- GPT-6 Sol and Luna: Released (22 September 2026).
- GPT-6 became ChatGPT's default from 7 October 2026 (reported).
- Sources: OpenAI announcements and system cards, openai.com/index.

**Claude (Anthropic)**
- Haiku, Sonnet and Opus tiers since Claude 3 (March 2024).
- Claude 5.5 family (Opus 5.5, Sonnet 5.5, Haiku 5.5) and Claude Fable 5.1: Released.
- Claude Mythos 5.1: Limited (restricted partners).
- Sources: Anthropic announcements and system cards, anthropic.com/news; anthropic.com/claude-opus-5-5; anthropic.com/claude-haiku-5-5.

**Gemini (Google DeepMind)**
- Gemini 1.0 (December 2023), 1.5 (2024), 2.5 (2025) and Gemini 3 (November 2025): Released.
- Gemini 4 Argon: announced 30 September 2026, Limited at first (an initial group of cybersecurity defenders through Google's Fairwind program); Released globally from 13 October 2026.
- Sources: announcement date from Google's and Google DeepMind's posts on X and *TechCrunch*, 30 September 2026; global availability from Google's blog and the Gemini 4 Argon model card, 13 October 2026, blog.google and deepmind.google; Gemini model cards, deepmind.google/models/gemini.

**Grok (xAI)**
- Grok 4 (July 2025) and Grok 4.7 (September 2026): Released.
- Grok 5: Announced as in training, not released as of October 2026.
- Sources: xAI announcements, x.ai/news.

**Muse (Meta)**
- Muse Spark (April 2026): Released, closed.
- Muse Wonder and Muse Wonder Full (12 October 2026): Released to developers through Meta's Model API and Muse Code; Muse Wonder Full for Muse Code subscribers.
- Sources: Meta announcements, ai.meta.com.

**Others**: ByteDance Doubao; Baidu ERNIE; Tencent Hunyuan; Amazon Nova; Microsoft MAI; Cohere Command.

## Image, Video and Speech Models

- **Images:** GPT Image (OpenAI); Nano Banana family (Google); Midjourney V8; FLUX.2 (Black Forest Labs, with open-weight versions under their own licenses); Stable Diffusion (Stability AI, open weights under Stability's licenses).
- **Video:** Veo 3 and 3.1 (Google); Runway Gen-4.5; Kling 3.0 (Kuaishou); Seedance 2.0 (ByteDance); Luma Ray. Sora (OpenAI) was discontinued in 2026.
- **Speech:** Whisper (OpenAI, open weights, MIT); real-time voice modes in ChatGPT, Gemini and others; ElevenLabs voices.
- **Music:** Suno; Udio.
