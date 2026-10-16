# Verified facts and sources (research log)

Each fact used in the book is listed with its source. "Verified" means the
number was confirmed in the primary source or in at least two independent
reports of it. Checked October 2026.

## Training scale
- Llama 3 (Meta, July 2024): flagship dense 405B parameters, context up to 128K tokens, pretraining on about 15T (15.6T) multilingual tokens vs 1.8T for Llama 2; trained on up to 16K H100 GPUs (2,048 nodes x 8). Source: Llama Team, "The Llama 3 Herd of Models", arXiv:2407.21783. https://arxiv.org/abs/2407.21783
- DeepSeek-V3 (Dec 2024): MoE, 671B total / 37B active per token; 14.8T training tokens; 2.788M H800 GPU hours total (2.664M pretraining, 119K context extension, 5K post-training), about $5.576M at an assumed $2/GPU-hour; ~180K GPU hours per trillion tokens = 3.7 days on 2,048 H800s. Cost covers final run only, not R&D. Source: arXiv:2412.19437. https://arxiv.org/abs/2412.19437
- DeepSeek-R1: Nature paper (17 Sep 2025) reported about US$294,000 for the R1 reasoning training stage on 512 H800 chips (~80 hours), excluding the ~US$6M base model. Source: Guo et al., Nature 645 (2025), "DeepSeek-R1 incentivizes reasoning in LLMs through reinforcement learning", reported by Reuters. https://www.nature.com/articles/s41586-025-09422-z
- FineWeb (Hugging Face, NeurIPS 2024): 15T tokens from 96 Common Crawl snapshots; FineWeb-Edu 1.3T tokens of educational text. Source: Penedo et al., arXiv:2406.17557. https://arxiv.org/abs/2406.17557

## Energy and water
- Google (Aug 2025): median Gemini Apps text prompt in May 2025 = 0.24 Wh energy, ~0.26 mL water, 0.03 gCO2e. Breakdown: accelerators 0.14 Wh (58%), host CPU+DRAM 0.06 Wh (25%), idle machines 0.02 Wh, data-centre overhead 0.02 Wh. Counting active chips only would give 0.10 Wh (2.4x lower). Not independently verified; critics say some things are excluded. Source: Elsworth et al., "Measuring the environmental impact of delivering AI at Google Scale", arXiv:2508.15734; Google Cloud blog. https://arxiv.org/abs/2508.15734 https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference
- OpenAI (Sam Altman, "The Gentle Singularity", 10 Jun 2025): average ChatGPT query ~0.34 Wh ("an oven in a little over one second") and ~0.000085 gallons of water (~1/15 teaspoon). Method not published. https://blog.samaltman.com/the-gentle-singularity
- IEA, Energy and AI (Apr 2025): data centres used ~415 TWh in 2024 (~1.5% of world electricity); base case ~945 TWh by 2030 (more than double), ~1,200 TWh by 2035 (range 700-1,700). https://www.iea.org/reports/energy-and-ai/executive-summary
- Li, Yang, Islam, Ren, "Making AI Less 'Thirsty'" (2023, arXiv:2304.03271; later in Communications of the ACM): training GPT-3 in Microsoft's US data centres could directly evaporate ~700,000 litres of freshwater (estimate); GPT-3 needs roughly a 500 mL bottle for 10-50 medium-length responses depending on where and when (estimate, includes off-site water for electricity); global AI water withdrawal projected 4.2-6.6 billion m3 in 2027. Distinguishes withdrawal vs consumption and on-site vs off-site water. Contested by later analyses. https://arxiv.org/abs/2304.03271
- Mistral AI life-cycle analysis (with Carbone 4 and ADEME, 2025): Mistral Large 2 after 18 months (to Jan 2025): 20.4 ktCO2e, 281,000 m3 water consumed, 660 kg Sb eq; a 400-token Le Chat response: 1.14 gCO2e, 45 mL water, 0.16 mg Sb eq; training and development = 85.5% of emissions and 91% of water. https://mistral.ai/news/our-contribution-to-a-global-environmental-standard-for-ai
- Note: per-prompt figures differ ~100x between companies because they count different things (on-site vs off-site water, response length, model size, hardware). The book explains this rather than picking one.

## Hardware
- NVIDIA H100 SXM: 80 billion transistors (TSMC 4N), 80 GB HBM3 at 3.35 TB/s, up to 700 W; FP8 ~1,979 TFLOPS dense (3,958 with sparsity); NVLink 900 GB/s total. Source: NVIDIA H100 datasheet; https://www.nvidia.com/en-us/data-center/h100/
- NVIDIA GB200 NVL72: one liquid-cooled rack with 36 Grace CPUs + 72 Blackwell GPUs acting as one NVLink domain, 130 TB/s NVLink bandwidth; ~120 kW per rack (third-party listings). https://www.nvidia.com/en-us/data-center/gb200-nvl72/
- NVIDIA Vera Rubin: NVIDIA said (May/June 2026) it is in full production, first customer shipments in the second half of 2026; HBM4 memory. Exact rack naming varies (NVL144/NVL72). Book will say "announced, shipping from late 2026".
- Google TPU Ironwood (7th gen, TPU7x), announced Apr 2025 at Cloud Next: first TPU designed for inference; pods of 256 or 9,216 liquid-cooled chips; 192 GB HBM per chip (~7.4 TB/s); 4,614 peak FP8 TFLOPS per chip, 42.5 FP8 exaflops per full pod. https://cloud.google.com/tpu/docs/tpu7x https://blog.google/products/google-cloud/ironwood-tpu-age-of-inference/
- xAI Colossus (Memphis): 100,000 H100 cluster brought online July 2024, "122 days" from start to finish per Elon Musk; doubled to ~200,000 GPUs with H200s; later additions of GB200. Exact mix unconfirmed.

## Open models
- gpt-oss (OpenAI, 5 Aug 2025): two open-weight reasoning models under Apache 2.0, text only. gpt-oss-120b: 116.8B total / 5.1B active; gpt-oss-20b: 20.9B total / 3.6B active (MoE). 120b fits a single 80 GB GPU; 20b runs in 16 GB. Source: OpenAI gpt-oss model card, arXiv:2508.10925. https://openai.com/index/introducing-gpt-oss/
- Qwen3 (Alibaba, announced late Apr / report May 2025): dense and MoE, 0.6B to 235B (235B total / 22B active); 36T pretraining tokens; 119 languages and dialects (up from 29 in Qwen2.5); unified thinking / non-thinking modes with a thinking budget; Apache 2.0. arXiv:2505.09388. https://arxiv.org/abs/2505.09388
- Kimi K2 (Moonshot AI, Jul 2025): MoE ~1T total / 32B active, 384 experts (8 per token), 15.5T tokens with the MuonClip optimizer, "zero training instability" (company claim); modified MIT licence. Followed by K2 Thinking (Nov 2025), K2.5 (Jan 2026, vision). https://moonshotai.github.io/Kimi-K2/
- Gemma 4 (Google DeepMind, released 31 Mar / 2 Apr 2026): first Gemma under Apache 2.0; sizes E2B, E4B, 26B A4B (MoE), 31B, plus 12B (3 Jun 2026); 128K context (small) / 256K (medium). https://ai.google.dev/gemma/docs/core/model_card_4
- OLMo (Allen Institute for AI): "fully open": weights, training data, code, checkpoints. OLMo 1 (Feb 2024, 7B); OLMo 2 (up to 32B, 2025); OLMo 3 (20 Nov 2025, 7B and 32B, Base/Instruct/Think/RL Zero, pretrained on Dolma 3, ~6T tokens, checkpoints from every stage); OLMo 3.1 (Dec 2025). https://allenai.org/olmo
- Meta: Llama 1 (Feb 2023), Llama 2 (Jul 2023), Llama 3 (Apr 2024), Llama 3.1 405B (Jul 2024), Llama 4 Scout/Maverick (5 Apr 2025, Meta's first MoE: Scout 17B active/16 experts ~109B total; Maverick 17B active/128 experts ~400B total; distilled from unreleased Behemoth). Meta Superintelligence Labs then launched the Muse family: Muse Spark (Apr 2026, closed), Muse Glimmer (open weights, 10 Aug 2026), Muse Spark Open (15 Oct 2026, MoE 816B total / 42B active, 1M context, natively multimodal, Muse Model License; runs on two M5 Ultra Mac Studios per Meta). Sources: Meta AI blog https://ai.meta.com/blog/llama-4-multimodal-intelligence/ ; VentureBeat 2026; Hugging Face meta-models/Muse-Spark-Open-816B-A42B.
- Mistral AI: Mistral 7B (Sep 2023, Apache 2.0); Mixtral 8x7B (11 Dec 2023, Apache 2.0, sparse MoE: 8 experts per layer, 2 chosen per token, ~47B total / ~13B active; arXiv:2401.04088). Mistral Large 4 previewed 6 Oct 2026 (weights promised later). https://mistral.ai/news/mixtral-of-experts
- Microsoft Phi: Phi-1 "Textbooks Are All You Need" (2023, arXiv:2306.11644); Phi-4 (Dec 2024, 14B, mostly synthetic training data: 50 synthetic dataset types ~400B tokens; MIT licence; arXiv:2412.08905); Phi-4-reasoning (2025).
- BLOOM (BigScience, 2022): 176B parameters, >1,000 volunteer researchers, 46 natural + 13 programming languages, trained on Jean Zay supercomputer (France, mostly nuclear power, 57 gCO2eq/kWh) on 384 A100 80 GB GPUs; final training ~24.7 tCO2eq dynamic power, ~50.5 t including manufacturing and idle (Luccioni et al., JMLR 2023, arXiv:2211.02001). arXiv:2211.05100.

## Frontier (closed) models, status October 2026
- Anthropic: Claude Opus 5.5 ("first model in our new Claude 5.5 family", performs at the level of Claude Fable 5.1 on most work at 40% lower cost than Opus 5; best scores to date on Anthropic's automated behavioral audit), Claude Sonnet 5.5, Claude Haiku 5.5 (cheapest and fastest; ~75% cheaper to run than Haiku 4.5; first Haiku with adjustable effort). Larger models: Claude Fable 5.1, Claude Mythos 5.1 (restricted). Sources: https://www.anthropic.com/claude-opus-5-5 https://www.anthropic.com/claude-haiku-5-5
- OpenAI: GPT-5 (Aug 2025); GPT-6 family staged in 2026: GPT-6 Astra (3 Sep 2026, flagship, phased via cybersecurity programme), GPT-6 Sol and Luna (22 Sep 2026, smaller/cheaper), ChatGPT default from 7 Oct 2026. Sources: openai.com release index; CNBC 3 Sep 2026; TechCrunch 22 Sep 2026; 9to5Mac 7 Oct 2026.
- Google: Gemini 3 (18 Nov 2025: Gemini 3 Pro + Deep Think; Flash 17 Dec 2025; launched with Google Antigravity agent platform). Gemini 4 Argon announced 30 Sep 2026 (first to trusted cyber defenders via the Fairwind Program; wider availability from Oct 2026). https://blog.google/innovation-and-ai/models-and-research/gemini-models/gemini-4-argon/
- xAI: Grok 4 (Jul 2025); Grok 4.7 flagship (21 Sep 2026); Grok 5 announced as in training (Jan 2026), not released as of Oct 2026; "6 trillion parameters" unconfirmed.
- Meta: Muse family (see open models).
Book policy: describe families and ideas; give dates only where confirmed; say "as of October 2026"; avoid ranking claims from aggregator leaderboards.

## Images, video, agents (status October 2026)
- Video: Sora (Feb 2024 preview), Sora 2 + app (30 Sep 2025, synchronized audio). OpenAI discontinued Sora: consumer app closed Apr 2026, API shut down 24 Sep 2026 (secondary sources; verify wording). Google Veo 3 (Google I/O, May 2025): first major video model with native synchronized audio; Veo 3.1 current. Runway Gen-4.5 (Dec 2025), Kling 3.0 (Kuaishou), ByteDance Seedance 2.0, Luma Ray3.
- Images: OpenAI GPT Image 2 (ChatGPT Images), Google Nano Banana 2 / Pro (Gemini Flash/Pro Image; GA 28 May 2026), Midjourney V8.x (V8.2 default 24 Jul 2026), Black Forest Labs FLUX.2 (late 2025, open-weight tiers). Names change fast; book describes families.
- MCP: introduced by Anthropic Nov 2024 as an open standard to connect AI apps to tools/data; donated 9 Dec 2025 to the Agentic AI Foundation (Linux Foundation directed fund co-founded by Anthropic, Block, OpenAI; supported by Google, Microsoft, AWS, Cloudflare, Bloomberg), with goose (Block) and AGENTS.md (OpenAI); >10,000 active public MCP servers. https://www.anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation

## History and interesting facts
- ChatGPT public launch 30 Nov 2022; UBS (Similarweb data) estimated 100M monthly users in Jan 2023, ~2 months after launch; TikTok ~9 months, Instagram ~2.5 years (Sensor Tower). Reuters, 2 Feb 2023. https://www.reuters.com/technology/chatgpt-sets-record-fastest-growing-user-base-analyst-note-2023-02-01/
- Epoch AI (Villalobos et al., 2024): effective stock of quality public human text ~300T tokens (90% CI 100T-1,000T); frontier models could use it up between 2026 and 2032 (modelled interval). https://epoch.ai/blog/will-we-run-out-of-data-limits-of-llm-scaling-based-on-human-generated-data
- Common Crawl: non-profit web archive since 2008; >250 billion pages in total; each crawl ~2-3 billion pages (e.g., Apr 2026 crawl ~2.19B pages, ~379 TB uncompressed). https://commoncrawl.org
- GPT-2 (OpenAI, 14 Feb 2019): full 1.5B model withheld over misuse concerns ("experiment in responsible disclosure"); staged release 124M, 355M, 774M (20 Aug 2019), 1.5B (5 Nov 2019) with "no strong evidence of misuse"; trained on WebText, 8 million web pages (~40 GB) linked from Reddit posts with 3+ karma (per paper). https://openai.com/index/gpt-2-1-5b-release/
- Bartz v. Anthropic: Judge Alsup (Jun 2025) held training on lawfully bought books was fair use, but downloading pirated books from shadow libraries was not; settlement announced 5 Sep 2025: US$1.5 billion, ~US$3,000 per work for ~482,460 works, pirated copies destroyed; preliminary approval 25 Sep 2025; largest copyright settlement in US history. Other cases (NYT v. OpenAI and Microsoft, filed Dec 2023) ongoing.
- Known foundational papers (dates from arXiv / publications):
  - Turing, "Computing Machinery and Intelligence", Mind, 1950 (imitation game).
  - Dartmouth workshop proposal, 1955/1956: term "artificial intelligence" (McCarthy et al.).
  - ELIZA, Joseph Weizenbaum, MIT, 1966 (CACM).
  - Rosenblatt perceptron 1958; Rumelhart, Hinton, Williams, backpropagation, Nature 1986.
  - Shannon, "Prediction and Entropy of Printed English", 1951: next-letter prediction game with humans.
  - Bengio et al., "A Neural Probabilistic Language Model", JMLR 2003.
  - AlexNet (Krizhevsky, Sutskever, Hinton), ImageNet 2012.
  - word2vec (Mikolov et al., 2013, arXiv:1301.3781): king - man + woman ≈ queen.
  - Seq2seq (Sutskever, Vinyals, Le, 2014, arXiv:1409.3215); attention (Bahdanau, Cho, Bengio, 2014, arXiv:1409.0473).
  - BPE for NMT (Sennrich, Haddow, Birch, 2015, arXiv:1508.07909); BPE algorithm Gage 1994.
  - Transformer: Vaswani et al., "Attention Is All You Need", Jun 2017, arXiv:1706.03762, 8 authors at Google (listed as equal contributors, order randomized).
  - GPT-1 (Radford et al., Jun 2018, 117M); BERT (Devlin et al., Oct 2018, arXiv:1810.04805).
  - Kaplan et al., Scaling Laws, Jan 2020, arXiv:2001.08361.
  - GPT-3, Brown et al., May 2020, arXiv:2005.14165: 175B parameters, ~300B training tokens; few-shot in-context learning.
  - Chinchilla, Hoffmann et al., Mar 2022, arXiv:2203.15556: 70B on 1.4T tokens beat 280B Gopher; ~20 tokens per parameter rule of thumb.
  - InstructGPT/RLHF, Ouyang et al., Mar 2022, arXiv:2203.02155: labelers preferred 1.3B InstructGPT outputs over 175B GPT-3.
  - Chain-of-thought prompting, Wei et al., Jan 2022, arXiv:2201.11903.
  - Constitutional AI, Bai et al. (Anthropic), Dec 2022, arXiv:2212.08073.
  - DPO, Rafailov et al., May 2023, arXiv:2305.18290.
  - ReAct, Yao et al., Oct 2022, arXiv:2210.03629; Toolformer, Schick et al., Feb 2023, arXiv:2302.04761.
  - RAG, Lewis et al., 2020, arXiv:2005.11401.
  - Mixture of experts: Shazeer et al. 2017 arXiv:1701.06538; Switch Transformer 2021 arXiv:2101.03961.
  - FlashAttention, Dao et al., 2022, arXiv:2205.14135; vLLM/PagedAttention, Kwon et al., 2023, arXiv:2309.06180; speculative decoding, Leviathan et al., 2022, arXiv:2211.17192.
  - LoRA, Hu et al., 2021, arXiv:2106.09685; QLoRA 2023 arXiv:2305.14314.
  - CLIP, Radford et al., 2021, arXiv:2103.00020 (400M image-text pairs); LLaVA 2023 arXiv:2304.08485; Flamingo 2022 arXiv:2204.14198.
  - GANs, Goodfellow et al., 2014, arXiv:1406.2661; DDPM, Ho et al., 2020, arXiv:2006.11239; Latent Diffusion / Stable Diffusion, Rombach et al., 2021, arXiv:2112.10752 (Stable Diffusion public Aug 2022); DiT, Peebles & Xie, 2022, arXiv:2212.09748.
  - Whisper, Radford et al., 2022, arXiv:2212.04356: 680,000 hours of audio.
  - MMLU, Hendrycks et al., 2020, arXiv:2009.03300; SWE-bench, Jimenez et al., 2023, arXiv:2310.06770; Chatbot Arena, Chiang et al., 2024, arXiv:2403.04132; Humanity's Last Exam, 2025, arXiv:2501.14249.
  - Stochastic Parrots, Bender, Gebru et al., FAccT 2021.
- Llama 3 training reliability (arXiv:2407.21783, sec. 3.3.4): during a 54-day snapshot of pre-training, 466 job interruptions: 47 planned, 419 unexpected; ~78% of unexpected attributed to confirmed or suspected hardware issues; faulty GPUs 148 (30.1% per paper's table), GPU HBM3 memory 72 (17.2%); about one failure every ~3 hours on the 16,384-GPU cluster; >90% effective training time; only 3 significant manual interventions.
- Sora shutdown: OpenAI announced 24 Mar 2026 it would discontinue Sora; app/web ended 26 Apr 2026, API ended 24 Sep 2026; no official reason given (Reuters: shift to coding, enterprise, robotics; heavy compute use). Axios 24 Mar 2026. https://www.axios.com/2026/03/24/openai-discontinue-sora-video-app
- GPT-4 cost: Sam Altman said (MIT event, Apr 2023, reported by Wired) it cost "more than $100 million" to train; Epoch AI estimates $41-78M for the final training compute. Use "reported".
- Tokens: GPT-4's tokenizer splits "strawberry" as str|aw|berry; models don't see letters, one reason for the famous "how many r's" mistake (TechCrunch, 27 Aug 2024). https://techcrunch.com/2024/08/27/why-ai-cant-spell-strawberry/
