# Chapter 2: From ELIZA to ChatGPT: Seventy Years in One Chapter

ChatGPT seemed to come out of nowhere in November 2022. In fact, it was the result of more than seventy years of ideas, dead ends, comebacks and lucky breaks, contributed by thousands of people. This chapter tells that story quickly, so that the rest of the book has a map. Along the way, you'll meet the people whose ideas you'll see again and again.

![A timeline of language AI: Turing's imitation game in 1950, ELIZA in 1966, neural language models in 2003, deep learning's breakthrough in 2012, word2vec in 2013, the Transformer in 2017, GPT-3 in 2020, ChatGPT in 2022, reasoning models in 2024, and agents and trillion-parameter open models in 2025 and 2026.](images/diagram-timeline.png)

## Can Machines Think? (1950s)

In 1950, the British mathematician **Alan Turing** published a paper called "Computing Machinery and Intelligence". Instead of arguing about what "thinking" means, he proposed a test he called the **imitation game**: if a person chatting by text can't reliably tell whether they're talking to a human or a machine, we might as well say the machine thinks. Turing's test framed the goal of conversational AI for half a century.

A few years later, in a 1955 proposal for a summer workshop at Dartmouth College held in 1956, **John McCarthy**, **Marvin Minsky**, **Nathaniel Rochester** and **Claude Shannon** coined the term **artificial intelligence**. They were optimistic: they thought a small group working for a summer could make significant progress on getting machines to use language. It took a little longer than that.

## The First Chatbot (1966)

At MIT in 1966, **Joseph Weizenbaum** wrote **ELIZA**, the first famous chatbot. Its best-known script, DOCTOR, imitated a psychotherapist by turning your sentences back into questions: type "I am unhappy" and it might reply "Why do you say you are unhappy?" ELIZA understood nothing. It matched patterns in your words and filled in templates.

> **Did You Know?** Weizenbaum's own secretary, who knew perfectly well that ELIZA was a simple program, asked him to leave the room so she could talk to it in private. Weizenbaum was disturbed by how readily people attributed understanding to a few lines of code, and spent much of the rest of his career warning about it, notably in his 1976 book *Computer Power and Human Reason*. The tendency to see a mind behind fluent text is now called the **ELIZA effect**, and it's worth remembering when talking to today's far more capable systems.

## Rules, Winters and Statistics (1970s to 2000s)

For decades, most language AI was built from **rules** written by hand: grammars, dictionaries and if-then logic. Rule systems worked in narrow domains but broke down on the messiness of real language, and twice, in the 1970s and again in the late 1980s, disappointed funders cut back so sharply that the periods became known as **AI winters**.

Meanwhile, a different approach was quietly gaining ground: **statistics**. Instead of writing rules, let the computer count how words actually follow each other in large collections of text. In the 1990s, teams at IBM showed that machine translation could be learned from millions of sentences in parallel French and English parliamentary records. Statistical "n-gram" models, which predict the next word from the previous two or three, powered speech recognition and early phone keyboards for years.

In 2003, **Yoshua Bengio** and colleagues published "A Neural Probabilistic Language Model", which used a neural network to predict the next word and, crucially, learned a list of numbers to represent each word. Similar words got similar numbers. It was the direct ancestor of every model in this book, but computers of the time were far too slow to take it further.

## Deep Learning Wakes Up (2012 to 2016)

Three things changed in the early 2010s: the internet provided enormous amounts of data, **graphics processing units (GPUs)**, chips originally built for video games, turned out to be superb at the arithmetic neural networks need, and researchers found better ways to train networks with many layers, called **deep learning**.

The turning point came in 2012, when **Alex Krizhevsky**, **Ilya Sutskever** and **Geoffrey Hinton** at the University of Toronto entered a neural network called **AlexNet** in a famous image-recognition competition and beat every other approach by a wide margin, training it on two gaming GPUs. Within a few years, deep learning dominated computer vision and speech recognition.

For language, a landmark came in 2013, when **Tomas Mikolov** and colleagues at Google released **word2vec**, which learned word representations so well that you could do arithmetic with meaning: the numbers for *king*, minus *man*, plus *woman*, landed close to *queen*. (Chapter 4 explains how.) In 2014, **Ilya Sutskever**, **Oriol Vinyals** and **Quoc Le** showed that neural networks could translate whole sentences, and **Dzmitry Bahdanau**, **Kyunghyun Cho** and **Yoshua Bengio** introduced **attention**, a way for the network to look back at the most relevant words as it translated. By 2016, Google Translate had switched to neural networks.

## Attention Is All You Need (2017)

In June 2017, eight researchers at Google, **Ashish Vaswani**, **Noam Shazeer**, **Niki Parmar**, **Jakob Uszkoreit**, **Llion Jones**, **Aidan Gomez**, **Łukasz Kaiser** and **Illia Polosukhin**, published a paper with a cheeky title: "Attention Is All You Need". It introduced the **Transformer**, a design that threw away the older step-by-step machinery and used attention for everything. Transformers could be trained in parallel on many chips at once, which meant they could finally be scaled up. Every model in this book is a Transformer or a close descendant.

> **Did You Know?** The paper's title is a nod to the Beatles song "All You Need Is Love". The eight authors are listed as equal contributors, in random order, and every one of them later left Google, several to found AI companies of their own.

## The GPT Era (2018 to 2021)

In 2018, the San Francisco lab **OpenAI** released **GPT** ("Generative Pre-trained Transformer"), and Google released **BERT**. Both showed the same striking idea: first **pretrain** a Transformer on a large amount of general text, then adapt it to specific tasks. GPT predicted the next word; BERT filled in blanks.

Then came the scaling. **GPT-2** (2019) had 1.5 billion parameters and wrote surprisingly coherent paragraphs.

> **Did You Know?** In February 2019, OpenAI withheld the full GPT-2 over worries it could be used to mass-produce fake news, releasing smaller versions in stages instead, as "an experiment in responsible disclosure". The full model came out in November 2019, by which time OpenAI said it had seen "no strong evidence of misuse". It was the first of many debates about how to release powerful models.

**GPT-3** (2020) had 175 billion parameters, more than a hundred times larger. It could do things it was never explicitly trained for, such as translating, answering questions or writing code, simply by being shown a few examples in its input. Researchers called this **in-context learning**, and it suggested that size alone was unlocking new abilities. In 2020, **Jared Kaplan** and colleagues at OpenAI published **scaling laws** showing that models improved predictably as they got bigger, and the race was on (Chapter 8).

## The Assistant Arrives (2022 to 2023)

A raw GPT-3 was a brilliant text-continuer but a poor assistant: ask it a question and it might write more questions. In early 2022, OpenAI described **InstructGPT**, trained with **reinforcement learning from human feedback (RLHF)**, where people ranked the model's answers and the model learned to give the kind of answers people preferred (Chapter 13). Remarkably, people preferred answers from a 1.3-billion-parameter InstructGPT over the raw 175-billion-parameter GPT-3.

On **30 November 2022**, OpenAI released **ChatGPT**, an assistant trained this way, as a free "research preview". The rest is history. By one estimate, it reached 100 million monthly users in about two months, faster than any consumer app before it.

In 2023, the field exploded. OpenAI released **GPT-4** in March; Anthropic, founded by former OpenAI researchers, released **Claude**; Google released **Bard** and then **Gemini**; and Meta released **Llama**, whose weights anyone could download, sparking a wave of **open models** (Chapter 22). The French start-up **Mistral AI** and Chinese labs including **Alibaba** (Qwen) and **DeepSeek** soon followed.

## Thinking, Seeing and Doing (2024 to 2026)

Three big shifts followed.

**Reasoning.** In September 2024, OpenAI released **o1**, a model trained with reinforcement learning to work through a hidden chain of thought before answering, which made it much better at mathematics and programming. In January 2025, the Chinese lab DeepSeek released **R1**, an open model that matched it on many tests and published how it was trained (Chapter 14).

> **Did You Know?** On 27 January 2025, a week after DeepSeek-R1's release, worries that cheap, efficient models would need fewer chips sent Nvidia's shares down 17% in one day, erasing about $589 billion of market value, at the time the largest one-day loss for any company in stock-market history.

**Seeing and creating.** Models became **multimodal**: able to take in images, audio and video, and to generate them (Part VII).

**Doing.** Models learned to use tools, run code, browse the web and operate computers, becoming **agents** that carry out multi-step tasks (Chapter 20). In November 2024, Anthropic introduced the **Model Context Protocol** as an open way to connect models to tools; a year later it was handed to a new foundation under the Linux Foundation, backed by most of the major AI companies.

By October 2026, when this book was written, the leading labs were on their fifth or sixth generations: Anthropic's **Claude 5** family, OpenAI's **GPT-6**, Google's **Gemini 4**, xAI's **Grok 4** series and Meta's new **Muse** models, while open models from China, Europe and the United States had passed a trillion parameters. Part VI tours them all.

## The Pattern to Remember

Looking back, the story has a clear shape. Good ideas, such as neural language models, word representations and attention, often waited years for enough **data** and **computing power** to make them work. When the Transformer made it possible to use those resources efficiently, progress came from **scale**, and then from **feedback**: teaching models what people actually want. The rest of the book follows exactly that path: data, the network, scale, the hardware that provides it, and the feedback that shapes it.

## Key Takeaways

- The goal of conversational AI dates back to Turing's imitation game in 1950; ELIZA (1966) showed how readily people see minds in text.
- Rules gave way to statistics, and statistics to neural networks, which took off in 2012 thanks to data, GPUs and deep learning.
- The Transformer (2017) made language models scalable; GPT-3 (2020) showed that scale unlocks new abilities.
- Feedback from people (RLHF) turned text-continuers into assistants; ChatGPT (2022) brought them to the world.
- Since 2024, models have learned to reason, to see and create, and to use tools as agents.

## Sources and Further Reading

- A. M. Turing, "Computing Machinery and Intelligence," *Mind* 59 (1950): 433-460.
- J. McCarthy, M. Minsky, N. Rochester, C. Shannon, "A Proposal for the Dartmouth Summer Research Project on Artificial Intelligence," 1955.
- J. Weizenbaum, "ELIZA: A Computer Program for the Study of Natural Language Communication between Man and Machine," *Communications of the ACM* 9 (1966); *Computer Power and Human Reason* (1976).
- Y. Bengio et al., "A Neural Probabilistic Language Model," *Journal of Machine Learning Research* 3 (2003).
- A. Krizhevsky, I. Sutskever, G. Hinton, "ImageNet Classification with Deep Convolutional Neural Networks," NeurIPS 2012.
- T. Mikolov et al., "Efficient Estimation of Word Representations in Vector Space," 2013. arxiv.org/abs/1301.3781
- I. Sutskever, O. Vinyals, Q. Le, "Sequence to Sequence Learning with Neural Networks," 2014. arxiv.org/abs/1409.3215
- D. Bahdanau, K. Cho, Y. Bengio, "Neural Machine Translation by Jointly Learning to Align and Translate," 2014. arxiv.org/abs/1409.0473
- A. Vaswani et al., "Attention Is All You Need," 2017. arxiv.org/abs/1706.03762
- A. Radford et al., "Language Models are Unsupervised Multitask Learners" (GPT-2), 2019; OpenAI, "GPT-2: 1.5B release," November 2019. openai.com/index/gpt-2-1-5b-release
- T. Brown et al., "Language Models are Few-Shot Learners" (GPT-3), 2020. arxiv.org/abs/2005.14165
- L. Ouyang et al., "Training language models to follow instructions with human feedback" (InstructGPT), 2022. arxiv.org/abs/2203.02155
- OpenAI, "Learning to Reason with LLMs" (o1), 12 September 2024. openai.com/index/learning-to-reason-with-llms
- Bloomberg, "Nvidia's $589 Billion DeepSeek Rout Is Largest in Market History," 27 January 2025.
- Anthropic, "Donating the Model Context Protocol and establishing the Agentic AI Foundation," 9 December 2025. anthropic.com/news/donating-the-model-context-protocol-and-establishing-of-the-agentic-ai-foundation
