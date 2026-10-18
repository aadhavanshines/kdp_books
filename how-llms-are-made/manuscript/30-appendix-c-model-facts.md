# Appendix C: Model Fact Sheets

Quick reference for the major model families, as of October 2026. Model names and abbreviations are decoded in Appendix E.

**How to read these sheets.**

- "Total / active" gives the parameters of mixture-of-experts models.
- Each figure comes from the document named under **Source**: a technical report, model card or official announcement. Where only press reports were available, the figure is marked "reported".
- **Status** uses four terms:
  - *Released*: generally available;
  - *Preview*: early access that may change;
  - *Limited*: available only to selected partners;
  - *Announced*: described but not yet available.
- **Licenses can differ between models in the same family**, and "open weights" does not mean "open source" (Chapter 21). Always check the license file of the exact model you download.

## Open-Weight Families

**Llama and Muse (Meta, United States)**
- LLaMA (February 2023; research license). Source: Touvron et al., "LLaMA," arXiv:2302.13971.
- Llama 3.1 405B (July 2024; dense; 15.6T training tokens; Llama 3.1 Community License). Source: Llama Team, "The Llama 3 Herd of Models," arXiv:2407.21783.
- Llama 4 Scout (about 109B total / 17B active, 10M context) and Maverick (about 400B / 17B) (April 2025; Llama 4 Community License). Source: Meta AI blog, "The Llama 4 herd," 5 April 2025.
- Muse Spark Open (October 2026; 816B / 42B; 1M context; multimodal; Muse Model License). Status: Released (open weights). Source: Meta, Muse Spark Open announcement and model card, 15 October 2026.
- Muse Glimmer (August 2026). Status: Released (open weights). Source: Meta announcement, August 2026.

**Mistral (Mistral AI, France)**
- Mistral 7B (September 2023; Apache 2.0). Source: Jiang et al., "Mistral 7B," arXiv:2310.06825.
- Mixtral 8x7B (December 2023; about 47B / 13B; Apache 2.0). Source: Jiang et al., "Mixtral of Experts," arXiv:2401.04088.
- Mistral Large 4. Status: Preview (October 2026); open weights promised but not yet published. Source: Mistral AI announcement, October 2026.

**Qwen (Alibaba Cloud, China)**
- Qwen3 (April to May 2025; 0.6B to 235B / 22B; 36T tokens; 119 languages; thinking modes; Apache 2.0). Source: Yang et al., "Qwen3 Technical Report," arXiv:2505.09388.
- Qwen3.5 and Qwen3.6 open models. Status: Released (2026); larger "Max" models remain closed. Source: Qwen model cards, huggingface.co/Qwen (reported sizes vary by model).
- Licenses: most open Qwen models use Apache 2.0; some earlier releases used Alibaba's own Qwen license.

**DeepSeek (DeepSeek, China)**
- DeepSeek-V3 (December 2024; 671B / 37B; 14.8T tokens). Source: DeepSeek-AI, "DeepSeek-V3 Technical Report," arXiv:2412.19437. License: code under MIT; the original V3 weights under the DeepSeek Model License, with later updates under MIT.
- DeepSeek-R1 (January 2025; MIT). Source: DeepSeek-AI, arXiv:2501.12948; *Nature* 645 (2025).
- DeepSeek-V4-Pro (about 1.6T / 49B) and V4-Flash (about 284B / 13B), with 1M-token context (MIT). Status: Preview, open weights (from April 2026). Source: DeepSeek V4 release notes and model cards, huggingface.co/deepseek-ai.

**Gemma (Google DeepMind)**
- Gemma 3 (March 2025; up to 27B; images; 128K context; Gemma Terms of Use). Source: Gemma Team, "Gemma 3 Technical Report," arXiv:2503.19786.
- Gemma 4 (from April 2026; E2B, E4B, 26B MoE with about 4B active, 31B dense, later a 12B; Apache 2.0, the first Gemma under a standard open-source license). Status: Released. Source: Google, Gemma 4 model card, ai.google.dev/gemma.

**Phi (Microsoft Research)**
- Phi-4 (December 2024; 14B; mostly synthetic data; MIT). Source: Abdin et al., "Phi-4 Technical Report," arXiv:2412.08905.

**gpt-oss (OpenAI)**
- gpt-oss-120b (117B / 5.1B) and gpt-oss-20b (21B / 3.6B) (August 2025; reasoning; text only; Apache 2.0). Status: Released. Source: OpenAI, "gpt-oss-120b & gpt-oss-20b Model Card," arXiv:2508.10925.

**Kimi (Moonshot AI, China)**
- Kimi K2 (July 2025; about 1T / 32B; 384 experts; 15.5T tokens; modified MIT license). Source: Kimi Team, "Kimi K2: Open Agentic Intelligence," arXiv:2507.20534.
- K2 Thinking (November 2025) and K2.5 with vision (January 2026). Status: Released. Source: Moonshot AI model cards, huggingface.co/moonshotai.

**GLM (Zhipu AI / Z.ai, China)**
- GLM-4.5 (July 2025; 355B / 32B; MIT). Source: GLM-4.5 Team, arXiv:2508.06471.
- GLM-5 (February 2026; about 744B / 40B; MIT). Status: Released. Source: Z.ai, GLM-5 model card, huggingface.co/zai-org.

**OLMo (Allen Institute for AI)**
- OLMo 3 (November 2025; 7B and 32B; Dolma 3, about 6T tokens) and OLMo 3.1 (December 2025). Fully open: weights, data, code and checkpoints. Apache 2.0. Status: Released. Source: AI2, "Olmo 3" report and announcement, allenai.org/olmo.

**Other notable open models:** NVIDIA Nemotron; Falcon (TII); Grok-1 weights (xAI, March 2024, Apache 2.0); MiniMax; IBM Granite; BLOOM (BigScience, 2022, BigScience RAIL license).

## Closed Frontier Families

**GPT (OpenAI)**
- GPT-4 (March 2023), GPT-4o (May 2024), o1 (September 2024) and GPT-5 (August 2025): Released.
- GPT-6 Astra: Limited at first (September 2026), first to vetted partners including cybersecurity defenders, then wider availability.
- GPT-6 Sol and Luna: Released (September 2026).
- GPT-6 became ChatGPT's default in October 2026.
- Sources: OpenAI announcements and system cards, openai.com/index.

**Claude (Anthropic)**
- Haiku, Sonnet and Opus tiers since Claude 3 (March 2024).
- Claude 5.5 family (Opus 5.5, Sonnet 5.5, Haiku 5.5) and Claude Fable 5.1: Released.
- Claude Mythos 5.1: Limited (restricted partners).
- Sources: Anthropic announcements and system cards, anthropic.com/news; anthropic.com/claude-opus-5-5; anthropic.com/claude-haiku-5-5.

**Gemini (Google DeepMind)**
- Gemini 1.0 (December 2023), 1.5 (2024), 2.5 (2025) and Gemini 3 (November 2025): Released.
- Gemini 4 Argon: announced in autumn 2026, Limited at first (trusted cybersecurity defenders through Google's Fairwind program), with a wider rollout following.
- Sources: Google blog, "Gemini 4 Argon," blog.google; Gemini model cards, deepmind.google/models/gemini.

**Grok (xAI)**
- Grok 4 (July 2025) and Grok 4.7 (September 2026): Released.
- Grok 5: Announced as in training, not released as of October 2026.
- Sources: xAI announcements, x.ai/news.

**Others**: Meta Muse Spark (closed version); ByteDance Doubao; Baidu ERNIE; Tencent Hunyuan; Amazon Nova; Microsoft MAI; Cohere Command.

## Image, Video and Speech Models

- **Images:** GPT Image (OpenAI); Nano Banana family (Google); Midjourney V8; FLUX.2 (Black Forest Labs, with open-weight versions under their own licenses); Stable Diffusion (Stability AI, open weights under Stability's licenses).
- **Video:** Veo 3 and 3.1 (Google); Runway Gen-4.5; Kling 3.0 (Kuaishou); Seedance 2.0 (ByteDance); Luma Ray. Sora (OpenAI) was discontinued in 2026.
- **Speech:** Whisper (OpenAI, open weights, MIT); real-time voice modes in ChatGPT, Gemini and others; ElevenLabs voices.
- **Music:** Suno; Udio.
