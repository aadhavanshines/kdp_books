# Part VI: The Model Zoo

# Chapter 21: Open and Closed: Two Ways to Share a Model

Some of the world's most capable models can only be used through a company's website or API: you send a request, they send back an answer, and you never see the model itself. Others can be downloaded by anyone, run on your own computer, studied, modified and built upon. The tension between these two approaches, **closed** and **open**, is one of the defining debates in AI. This chapter explains what "open" really means, how the open-model movement began and the arguments on each side.

## A Spectrum, Not a Switch

"Open" can mean very different things:

| Level | What you get | Examples |
| --- | --- | --- |
| Closed | Access through an app or API only | GPT-6, Claude, Gemini |
| Open weights | Download the trained parameters and run them yourself, under a license | Llama, Qwen, DeepSeek, Gemma, Mistral, gpt-oss |
| Fully open | Weights, plus the training data, code and intermediate checkpoints | OLMo, BLOOM, Pythia |

Most "open" models are really **open-weight** models. You get the finished product, the parameters, but not the recipe: not the training data, which is often the most secret part, and usually not the full training code. You can run, study and fine-tune them, but you couldn't rebuild them from scratch.

> **In Plain Words:** Open weights are like being given a finished cake you can eat, slice up and decorate. Fully open is being given the recipe, the ingredients list and a video of the baking, too.

## Licenses Matter

Open-weight models come with very different licenses:

- **Permissive licenses**, such as Apache 2.0 and MIT, let you use, modify and sell products built on the model with almost no restrictions. Qwen, DeepSeek, Mistral's open models, OpenAI's gpt-oss and, since 2026, Google's Gemma 4 use them.
- **Custom licenses** allow broad use but add conditions. Meta's Llama license, for example, required companies with more than 700 million monthly users to ask Meta for permission, and banned certain uses. Many experts argue such models shouldn't be called "open source".

In October 2024, the **Open Source Initiative**, which maintains the standard definition of open-source software, published its **Open Source AI Definition**. It requires that a model's weights and code be freely available, and that enough information about the training data be published for a skilled person to build a substantially equivalent system. By that standard, very few popular models qualify.

## How the Open Movement Began

Open research has deep roots: Google released BERT openly in 2018, and the volunteer collective **EleutherAI** released GPT-style models and The Pile dataset from 2020 onward. In 2022, the **BigScience** project, led by Hugging Face with more than 1,000 researchers from around the world, trained **BLOOM**, a 176-billion-parameter model in 46 languages, entirely in the open.

The turning point came in 2023.

> **Did You Know?** In February 2023, Meta released its first **LLaMA** models only to approved researchers. Within about a week, the weights had leaked and were being shared openly online through a torrent link posted on the message board 4chan. Instead of fighting it, Meta leaned in: its next model, Llama 2 (July 2023), was released openly for commercial use. The leak arguably kick-started the entire open-model ecosystem.

A wave of community work followed: Stanford's Alpaca, quantized models running on laptops with llama.cpp, thousands of fine-tuned variants. The French startup **Mistral AI**, founded in 2023 by former Meta and Google DeepMind researchers, released its early models as bare torrent links posted on social media, with no announcement or explanation. Then Chinese labs, led by **Alibaba's Qwen** and **DeepSeek**, became the most prolific producers of open models, and by 2025 they were among the most downloaded in the world.

The central hub for all of this is **Hugging Face**, founded in New York in 2016 by **Clément Delangue**, **Julien Chaumond** and **Thomas Wolf**, originally to build a chatbot app for teenagers. Its website now hosts well over two million models and hundreds of thousands of datasets, and its open-source libraries are used by almost everyone in the field.

## The Case for Open

- **Access and cost.** Anyone can use the model, without paying per token, and run it on their own hardware.
- **Privacy and control.** Sensitive data, such as medical records or company secrets, never has to leave your own computers.
- **Customization.** Open models can be fine-tuned, distilled and adapted for any language or task (Chapter 18).
- **Research and scrutiny.** Scientists can study how models work, test their safety and reproduce results. Most interpretability and safety research outside the big labs depends on open models.
- **Competition and sovereignty.** Open models stop a few companies from controlling a crucial technology, and let countries build AI in their own languages.

## The Case for Caution

- **Misuse.** Once weights are released, they can't be recalled, and safety training can be removed by fine-tuning. If a model could meaningfully help someone build a biological weapon, releasing it openly would be irreversible.
- **No monitoring.** A closed provider can detect and block abuse; an open model runs wherever anyone wants.
- **Strategic concerns.** Some argue that open releases hand advantages to geopolitical rivals.

Many labs take a middle path: releasing smaller or older models openly while keeping their most capable ones closed, and testing open models for dangerous capabilities before release. OpenAI's gpt-oss, for example, was tested in a version deliberately fine-tuned to be malicious, to check that even then it didn't reach dangerous capability levels.

## How Big Is the Gap?

For most of AI's recent history, the best closed models have been ahead of the best open ones, typically by somewhere between a few months and about a year, according to analyses by Epoch AI and others. DeepSeek-R1 in January 2025, which matched OpenAI's best reasoning model of a few months earlier, showed how small the gap could become. By 2026, open models from DeepSeek, Qwen, Moonshot, Zhipu, Meta, Mistral, Google and OpenAI covered almost every size and use, from phones to models with over a trillion parameters, though the frontier itself remained, mostly, closed.

## Key Takeaways

- "Open" ranges from **open weights** (downloadable parameters) to **fully open** (weights, data, code and checkpoints).
- Licenses vary: Apache 2.0 and MIT are permissive; custom licenses such as Llama's add conditions. The OSI's 2024 definition sets a high bar.
- Meta's LLaMA leak in 2023 kick-started the open ecosystem; Mistral, Qwen and DeepSeek then became major open-model makers. Hugging Face is the hub.
- Open models offer access, privacy, customization and research; the main concern is irreversible misuse.
- Open models have trailed the closed frontier by months to about a year.

## Sources and Further Reading

- Open Source Initiative, "The Open Source AI Definition 1.0," October 2024. opensource.org/ai/open-source-ai-definition
- BigScience Workshop, "BLOOM: A 176B-Parameter Open-Access Multilingual Language Model," 2022. arxiv.org/abs/2211.05100
- Hugo Touvron et al., "LLaMA: Open and Efficient Foundation Language Models," February 2023. arxiv.org/abs/2302.13971
- James Vincent, "Meta's powerful AI language model has leaked online," *The Verge*, 8 March 2023.
- Meta, Llama 2 and Llama 3 Community License Agreements. llama.com
- Stella Biderman et al., "Pythia: A Suite for Analyzing Large Language Models Across Training and Scaling," 2023. arxiv.org/abs/2304.01373
- Hugging Face, "Models" hub. huggingface.co/models
- OpenAI, "gpt-oss-120b & gpt-oss-20b Model Card" (worst-case fine-tuning tests), August 2025. arxiv.org/abs/2508.10925
- Epoch AI, "How far behind are open models?," 2024. epoch.ai/blog/open-models-report
