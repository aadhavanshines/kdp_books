# Appendix C: Model Fact Sheets

Quick reference for the major model families, as of October 2026. "Total / active" gives the parameters of mixture-of-experts models. Figures come from each maker's own papers, model cards and announcements; where only press reports were available, the figure is marked "reported". Check the listed documentation for the latest versions.

## Open-Weight Families

**Llama and Muse (Meta, United States)**
- First release: LLaMA, February 2023.
- Landmarks: Llama 3.1 405B (dense, 15.6T training tokens, 2024); Llama 4 Scout (about 109B total / 17B active, 10M context) and Maverick (about 400B / 17B), April 2025.
- Latest: Muse Glimmer (August 2026) and Muse Spark Open (October 2026; about 816B / 42B, 1M context, multimodal; reported).
- License: Llama and Muse community licenses (custom).
- Documentation: llama.com; ai.meta.com; huggingface.co/meta-llama

**Mistral (Mistral AI, France)**
- First release: Mistral 7B, September 2023.
- Landmarks: Mixtral 8x7B (about 47B / 13B, December 2023); Magistral reasoning models (2025).
- Latest: Mistral Large 4 previewed October 2026.
- License: Apache 2.0 for open models; some models commercial.
- Documentation: mistral.ai; docs.mistral.ai

**Qwen (Alibaba Cloud, China)**
- First release: August 2023.
- Landmarks: Qwen3 (April 2025; 0.6B to 235B / 22B; 36T tokens; 119 languages; thinking modes).
- Latest: Qwen3.5 and Qwen3.6 open releases (2026), with larger "Max" models closed.
- License: Apache 2.0 for most open models.
- Documentation: qwenlm.github.io; huggingface.co/Qwen

**DeepSeek (DeepSeek, China)**
- First release: DeepSeek LLM, late 2023.
- Landmarks: V2 (multi-head latent attention, 2024); V3 (671B / 37B, 14.8T tokens, December 2024); R1 open reasoning model (January 2025).
- Latest: V4 preview, April 2026 (V4-Pro about 1.6T / 49B; V4-Flash about 284B / 13B; 1M context; reported).
- License: MIT.
- Documentation: github.com/deepseek-ai; huggingface.co/deepseek-ai

**Gemma (Google DeepMind, United States and United Kingdom)**
- First release: February 2024.
- Landmarks: Gemma 3 (March 2025; up to 27B; images; 128K context); Gemma 3n for phones.
- Latest: Gemma 4 (April 2026; E2B, E4B, 26B MoE with about 4B active, 31B dense; Apache 2.0).
- Documentation: ai.google.dev/gemma

**Phi (Microsoft Research, United States)**
- First release: Phi-1, June 2023.
- Landmarks: Phi-3-mini (2024); Phi-4 (14B, December 2024, mostly synthetic data); reasoning versions (2025).
- License: MIT.
- Documentation: azure.microsoft.com; huggingface.co/microsoft

**gpt-oss (OpenAI, United States)**
- Release: August 2025.
- Sizes: gpt-oss-120b (117B / 5.1B) and gpt-oss-20b (21B / 3.6B); reasoning; text only.
- License: Apache 2.0.
- Documentation: openai.com/index/introducing-gpt-oss

**Kimi (Moonshot AI, China)**
- Landmarks: Kimi K2 (July 2025; about 1T / 32B; 384 experts; 15.5T tokens); K2 Thinking (November 2025); K2.5 with vision (January 2026).
- License: modified MIT.
- Documentation: moonshotai.github.io; huggingface.co/moonshotai

**GLM (Zhipu AI / Z.ai, China)**
- Landmarks: GLM-4.5 (July 2025; 355B / 32B); GLM-5 (February 2026; about 744B / 40B).
- License: MIT.
- Documentation: z.ai; huggingface.co/zai-org

**OLMo (Allen Institute for AI, United States)**
- First release: February 2024.
- Latest: OLMo 3 (November 2025; 7B and 32B; Dolma 3, about 6T tokens) and 3.1.
- Fully open: weights, data, code and checkpoints. License: Apache 2.0.
- Documentation: allenai.org/olmo

**Other notable open models:** NVIDIA Nemotron; Falcon (TII); Grok-1 weights (xAI, 2024); MiniMax; IBM Granite; BLOOM (BigScience, 2022).

## Closed Frontier Families

**GPT (OpenAI)**: GPT-4 (March 2023), GPT-4o (May 2024), o-series reasoning (from September 2024), GPT-5 (August 2025), GPT-6 Astra, Sol and Luna (September 2026). Documentation: openai.com; platform.openai.com/docs/models

**Claude (Anthropic)**: Claude (March 2023); Haiku, Sonnet and Opus tiers since Claude 3 (March 2024); current family Claude 5.5 (Opus 5.5, Sonnet 5.5, Haiku 5.5), with larger Claude Fable 5.1 and restricted Claude Mythos 5.1. Documentation: anthropic.com; docs.anthropic.com

**Gemini (Google DeepMind)**: Gemini 1.0 (December 2023), 1.5 (million-token context, 2024), 2.5 (reasoning, 2025), Gemini 3 (November 2025), Gemini 4 Argon (announced September 2026). Documentation: deepmind.google/models/gemini; ai.google.dev

**Grok (xAI)**: Grok (November 2023), Grok 4 (July 2025), Grok 4.7 (September 2026). Documentation: x.ai

**Others**: Meta Muse Spark; ByteDance Doubao; Baidu ERNIE; Tencent Hunyuan; Amazon Nova; Microsoft MAI; Cohere Command.

## Image, Video and Speech Models

- **Images:** GPT Image (OpenAI); Nano Banana family (Google); Midjourney V8; FLUX.2 (Black Forest Labs, with open-weight versions); Stable Diffusion (Stability AI, open).
- **Video:** Veo 3 and 3.1 (Google); Runway Gen-4.5; Kling 3.0 (Kuaishou); Seedance 2.0 (ByteDance); Luma Ray. Sora (OpenAI) was discontinued in 2026.
- **Speech:** Whisper (OpenAI, open); real-time voice modes in ChatGPT, Gemini and others; ElevenLabs voices.
- **Music:** Suno; Udio.
