# Part II: The Ingredients

# Chapter 5: Data: Feeding the Machine

A language model can only be as good as what it reads. Everything it knows, every fact, every turn of phrase, every bias, comes from its training data. That makes data selection one of the most important, and most secretive, parts of building a model. Companies publish details of their chips and their designs, but often say little about exactly what text they used. This chapter opens the box: where the text comes from, how it is cleaned, how much is needed, who does the hidden human work, and the fights over who owns it.

## How Much Text Is "a Lot"?

Modern models are trained on staggering amounts of text. GPT-3 (2020) was trained on about 300 billion tokens. Llama 3 (2024) used about 15 trillion; Qwen3 (2025), 36 trillion.

Fifteen trillion tokens is roughly 11 trillion words. A person reading 250 words a minute, without ever stopping to eat or sleep, would need about **85,000 years** to read that much. Reading eight hours a day, it would take more than 250,000 years. A model "reads" it in a few months, though, as you'll see, it takes thousands of chips to do so.

## Where the Text Comes From

Training data is a mixture from many sources:

- **The web.** By far the largest source. Most labs use **Common Crawl**, a non-profit that has been archiving the public web since 2008 and makes its archives freely available. Each crawl captures a few billion web pages, and the archive holds well over 250 billion pages in total. Many labs also run their own web crawlers.
- **Books.** Long, carefully edited text teaches models to follow an argument over many pages.
- **Encyclopedias and reference works**, such as Wikipedia, in many languages.
- **Scientific papers**, from open archives such as arXiv and PubMed Central.
- **Code**, from public repositories, which, interestingly, seems to help models reason more carefully in general.
- **Mathematics**: textbooks, worked solutions and specially collected problem sets.
- **Conversations and forums**, such as question-and-answer sites, which show how people ask and answer questions.
- **Synthetic data**: text written by other AI models, increasingly important, and discussed below.

Labs blend these sources in carefully tuned proportions. For Llama 3, Meta reported a final mix of roughly 50% general knowledge, 25% mathematics and reasoning, 17% code and 8% text in languages other than English. Getting this recipe right is part art, part science, and one of the most closely guarded secrets in the field.

## From Raw Web to Training Data

The raw web is a mess: menus, adverts, cookie notices, spam, duplicate pages, machine-generated gibberish, pornography, personal information and pages in hundreds of languages. Turning it into good training data is a pipeline of filters, where each step throws a large share of the text away:

![The data pipeline as a funnel: raw web pages pass through text extraction, language identification, quality filtering, removal of duplicates, safety and privacy filtering, and decontamination, leaving a much smaller set of clean training text that is mixed with books, code, math and other sources.](images/diagram-data-funnel.png)

1. **Extract the text.** Strip the HTML code, menus and boilerplate, keeping the main content of each page.
2. **Identify the language**, so that each language can be handled and balanced separately.
3. **Filter for quality.** Simple rules remove pages that are mostly symbols, have very short lines, or repeat the same phrase. Then, increasingly, **AI models judge quality**: for example, for the FineWeb-Edu dataset, Hugging Face had a large Llama 3 model rate pages for educational value and kept only the best, 1.3 trillion tokens out of 15 trillion.
4. **Remove duplicates.** The web is full of copies: syndicated news, mirrored sites, templates. Training on the same text many times wastes computation and encourages the model to memorize it word for word. Techniques such as **MinHash** find near-duplicate documents efficiently by comparing compact "fingerprints" of their contents rather than the whole text.
5. **Filter for safety and privacy.** Remove toxic content, illegal material and personal information such as email addresses and phone numbers.
6. **Decontaminate.** Remove copies of the test questions that will later be used to measure the model (Chapter 15). If the answers to the exam are in the textbook, a high score proves nothing.

> **Did You Know?** In 2024, Hugging Face released **FineWeb**, 15 trillion tokens of cleaned web text built from 96 Common Crawl snapshots, together with a detailed description of every filtering step. It showed that careful filtering alone could produce better models than earlier datasets, and it became one of the most widely used open datasets in the world.

## Open Datasets

Most companies don't publish their training data. A few groups have published theirs, so that researchers can study and reproduce the whole process:

| Dataset | Creator | Year | Size |
| --- | --- | --- | --- |
| The Pile | EleutherAI | 2020 | 825 GiB of text from 22 sources |
| Dolma | Allen Institute for AI | 2023 | About 3 trillion tokens |
| FineWeb | Hugging Face | 2024 | 15 trillion tokens |
| Dolma 3 | Allen Institute for AI | 2025 | About 6 trillion tokens (used for OLMo 3) |

Open datasets made it possible for universities and smaller labs to train serious models, and for outsiders to examine what models are actually taught.

## Quality Beats Quantity

For years, the rule was "more data". Then researchers found that *better* data could matter even more. In 2023, Microsoft's **Phi** project trained a small coding model largely on "textbook quality" data, much of it written by another AI, under the title "Textbooks Are All You Need", and it outperformed much larger models. In 2024, Phi-4, with 14 billion parameters, was trained mostly on synthetic data: about 400 billion tokens of generated text across some 50 kinds of dataset, from math puzzles to rewritten web pages.

Today, frontier labs use other AI models extensively: to rate quality, to rewrite messy text into cleaner forms, to generate practice problems with checked answers, and to translate material into more languages.

## Will We Run Out?

There is only so much human writing. In 2024, the research group **Epoch AI** estimated the total stock of high-quality, public, human-written text at around **300 trillion tokens** (with a wide range of uncertainty, from 100 to 1,000 trillion), and projected that the largest training runs could use it all up sometime **between 2026 and 2032**.

That doesn't mean progress stops. Labs are responding by squeezing more learning from each token (training on good data several times), licensing private text, using other kinds of data such as video and audio, and generating synthetic data.

Synthetic data has its own trap. In 2024, **Ilia Shumailov** and colleagues showed in *Nature* that if models are trained repeatedly on the output of earlier models, generation after generation, without fresh human data, they degrade: rare facts and unusual styles vanish first, and output becomes repetitive. They called it **model collapse**. The lesson isn't that synthetic data is bad, but that it must be checked, filtered and mixed with genuine human data. As AI-written text spreads across the web, authentic human writing is becoming more valuable.

## The Hidden Human Work

Training data isn't only scraped; much of it is made by people. Thousands of workers around the world label examples, write model answers, rank responses and flag harmful content, often through outsourcing companies.

> **Did You Know?** In January 2023, a *TIME* investigation reported that workers in Kenya employed by an outsourcing firm, Sama, were paid between about $1.32 and $2 an hour to read and label graphic descriptions of violence and abuse, to help build a filter that made ChatGPT less toxic. Some described lasting psychological harm. Sama ended the contract early, in February 2022. The story drew attention to the human cost hidden behind "automatic" AI.

Today, data work ranges from low-paid labeling to well-paid specialists: doctors, lawyers and mathematicians hired to write and check expert-level examples.

## Whose Words Are They?

Training on the web raises hard questions. Authors, artists, news organizations and programmers have asked: was it fair to use their work without permission or payment?

- **Opting out.** Many websites now use the `robots.txt` file to tell AI companies' crawlers not to collect their pages, and most major labs say their crawlers respect it.
- **Licensing.** Some publishers, news agencies and online communities now license their content to AI companies for payment.
- **Lawsuits.** Dozens of lawsuits have been filed. In June 2025, in a case brought by authors against Anthropic (*Bartz v. Anthropic*), Judge William Alsup ruled that training on books the company had bought was "fair use" under US law, but that downloading millions of pirated books from so-called shadow libraries was not. In September 2025, Anthropic agreed to a **$1.5 billion settlement**, about $3,000 for each of roughly 480,000 books, and to destroy the pirated copies: the largest copyright settlement in US history. Other cases, including *The New York Times* against OpenAI and Microsoft, filed in December 2023, were still being argued as this book was written.

The law differs between countries and is still being settled. What's clear is that where data comes from is no longer just a technical question.

## Key Takeaways

- Models are trained on trillions of tokens: Llama 3 on about 15 trillion, which would take a person roughly 85,000 years of nonstop reading.
- Data comes from the web (mostly via Common Crawl), books, reference works, papers, code, math, conversations and, increasingly, synthetic data.
- Raw web text goes through a funnel: extraction, language identification, quality filtering, de-duplication, safety and privacy filtering, and decontamination.
- Quality matters as much as quantity; AI models now help rate, rewrite and generate training data, but training only on AI output leads to **model collapse**.
- Human workers label and write much of the data, and the use of copyrighted work is being decided in courts, licenses and opt-outs.

## Sources and Further Reading

- Llama Team, Meta, "The Llama 3 Herd of Models," 2024 (15T tokens; data mix, section 3.1.2). arxiv.org/abs/2407.21783
- An Yang et al., "Qwen3 Technical Report," 2025 (36T tokens). arxiv.org/abs/2505.09388
- Common Crawl. commoncrawl.org
- Guilherme Penedo et al., "The FineWeb Datasets: Decanting the Web for the Finest Text Data at Scale," NeurIPS 2024. arxiv.org/abs/2406.17557
- Leo Gao et al., "The Pile: An 800GB Dataset of Diverse Text for Language Modeling," 2020. arxiv.org/abs/2101.00027
- Luca Soldaini et al., "Dolma: an Open Corpus of Three Trillion Tokens for Language Model Pretraining Research," 2024. arxiv.org/abs/2402.00159
- Allen Institute for AI, "Olmo 3," November 2025. allenai.org/olmo
- Suriya Gunasekar et al., "Textbooks Are All You Need," 2023. arxiv.org/abs/2306.11644
- Marah Abdin et al., "Phi-4 Technical Report," 2024. arxiv.org/abs/2412.08905
- Pablo Villalobos et al., "Will we run out of data? Limits of LLM scaling based on human-generated data," Epoch AI, 2024. epoch.ai/blog/will-we-run-out-of-data-limits-of-llm-scaling-based-on-human-generated-data
- Ilia Shumailov et al., "AI models collapse when trained on recursively generated data," *Nature* 631 (2024): 755-759.
- Billy Perrigo, "OpenAI Used Kenyan Workers on Less Than $2 Per Hour to Make ChatGPT Less Toxic," *TIME*, 18 January 2023.
- *Bartz v. Anthropic PBC*, US District Court for the Northern District of California: order on fair use (June 2025) and settlement (September 2025).
- *The New York Times Co. v. Microsoft Corp. and OpenAI*, filed December 2023, Southern District of New York.
