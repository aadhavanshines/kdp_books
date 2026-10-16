# Appendix D: Credits: Who Invented What

Modern AI was built by thousands of people over decades. This appendix credits the people behind the key ideas in this book. Most landmark papers have many authors; the names here are those listed first or most closely associated with the idea, and "and colleagues" always applies. Full references are in each chapter's sources.

## Foundations

- **Information theory and predicting English text**: Claude Shannon, Bell Labs (1948, 1951).
- **The imitation game (Turing test)**: Alan Turing (1950).
- **The name "artificial intelligence"**: John McCarthy, Marvin Minsky, Nathaniel Rochester and Claude Shannon, Dartmouth proposal (1955).
- **Artificial neuron**: Warren McCulloch and Walter Pitts (1943).
- **Perceptron**: Frank Rosenblatt (1958).
- **ELIZA**: Joseph Weizenbaum, MIT (1966).
- **Backpropagation**: David Rumelhart, Geoffrey Hinton and Ronald Williams (1986), building on earlier work by Paul Werbos, Seppo Linnainmaa and others.
- **Hopfield networks and Boltzmann machines**: John Hopfield; Geoffrey Hinton and Terry Sejnowski (1980s; Nobel Prize in Physics, 2024, to Hopfield and Hinton).
- **"You shall know a word by the company it keeps"**: J. R. Firth (1957).

## Deep Learning and Language Models

- **Neural language model**: Yoshua Bengio and colleagues (2003).
- **CUDA**: NVIDIA, led by Ian Buck (2006).
- **ImageNet**: Fei-Fei Li and colleagues (2009).
- **AlexNet**: Alex Krizhevsky, Ilya Sutskever and Geoffrey Hinton (2012).
- **word2vec**: Tomas Mikolov and colleagues, Google (2013).
- **Sequence-to-sequence learning**: Ilya Sutskever, Oriol Vinyals and Quoc Le, Google (2014).
- **Attention for translation**: Dzmitry Bahdanau, Kyunghyun Cho and Yoshua Bengio (2014).
- **Adam optimizer**: Diederik Kingma and Jimmy Ba (2014).
- **Byte-pair encoding for language**: Rico Sennrich, Barry Haddow and Alexandra Birch (2015), adapting Philip Gage's 1994 compression method.
- **The Transformer**: Ashish Vaswani, Noam Shazeer, Niki Parmar, Jakob Uszkoreit, Llion Jones, Aidan Gomez, Łukasz Kaiser and Illia Polosukhin, Google (2017).
- **Mixture-of-experts layer**: Noam Shazeer and colleagues, Google (2017), building on Robert Jacobs, Michael Jordan and colleagues (1991).
- **GPT**: Alec Radford and colleagues, OpenAI (2018).
- **BERT**: Jacob Devlin and colleagues, Google (2018).
- **Rotary position embedding**: Jianlin Su and colleagues (2021).
- **The Bitter Lesson**: Richard Sutton (2019).

## Scaling and Training

- **Scaling laws**: Jared Kaplan, Sam McCandlish and colleagues, OpenAI (2020).
- **GPT-3 and in-context learning**: Tom Brown and colleagues, OpenAI (2020).
- **Chinchilla**: Jordan Hoffmann and colleagues, DeepMind (2022).
- **Megatron-LM model parallelism**: Mohammad Shoeybi and colleagues, NVIDIA (2019).
- **ZeRO**: Samyam Rajbhandari and colleagues, Microsoft (2019).
- **FlashAttention**: Tri Dao and colleagues, Stanford (2022).
- **The Pile**: Leo Gao and colleagues, EleutherAI (2020).
- **FineWeb**: Guilherme Penedo and colleagues, Hugging Face (2024).
- **Model collapse**: Ilia Shumailov and colleagues (2024).
- **Mamba**: Albert Gu and Tri Dao (2023).

## Post-Training, Reasoning and Safety

- **Learning from human preferences**: Paul Christiano, Jan Leike and colleagues, OpenAI and DeepMind (2017).
- **PPO**: John Schulman and colleagues, OpenAI (2017).
- **InstructGPT (RLHF for language models)**: Long Ouyang and colleagues, OpenAI (2022).
- **Constitutional AI**: Yuntao Bai and colleagues, Anthropic (2022).
- **Direct Preference Optimization**: Rafael Rafailov, Archit Sharma, Eric Mitchell and colleagues, Stanford (2023).
- **Chain-of-thought prompting**: Jason Wei, Denny Zhou and colleagues, Google (2022).
- **"Let's think step by step"**: Takeshi Kojima and colleagues (2022).
- **Reasoning models**: OpenAI o1 team (2024); DeepSeek-R1 team (2025).
- **GRPO**: Zhihong Shao and colleagues, DeepSeek (2024).
- **Prompt injection (the term)**: Simon Willison (2022).
- **Scaling Monosemanticity and attribution graphs**: Adly Templeton, Jack Lindsey, Chris Olah and colleagues, Anthropic (2024, 2025).
- **Alignment faking**: Ryan Greenblatt and colleagues, Anthropic and Redwood Research (2024).
- **"On the Dangers of Stochastic Parrots"**: Emily Bender, Timnit Gebru, Angelina McMillan-Major and Margaret Mitchell (2021).

## Using Models

- **Retrieval-augmented generation**: Patrick Lewis and colleagues, Facebook AI Research (2020).
- **Knowledge distillation**: Geoffrey Hinton, Oriol Vinyals and Jeff Dean, Google (2015).
- **LoRA**: Edward Hu and colleagues, Microsoft (2021).
- **QLoRA**: Tim Dettmers and colleagues, University of Washington (2023).
- **GPTQ quantization**: Elias Frantar and colleagues (2022).
- **llama.cpp**: Georgi Gerganov (2023).
- **PagedAttention and vLLM**: Woosuk Kwon and colleagues, UC Berkeley (2023).
- **Speculative decoding**: Yaniv Leviathan and colleagues, Google (2022); Charlie Chen and colleagues, DeepMind (2023).
- **ReAct**: Shunyu Yao and colleagues, Princeton and Google (2022).
- **Toolformer**: Timo Schick and colleagues, Meta (2023).
- **Model Context Protocol**: David Soria Parra, Justin Spahr-Summers and colleagues, Anthropic (2024).
- **Needle-in-a-haystack test**: Greg Kamradt (2023).
- **Lost in the middle**: Nelson Liu and colleagues, Stanford (2023).

## Evaluation

- **MMLU**: Dan Hendrycks and colleagues (2020).
- **GPQA**: David Rein and colleagues (2023).
- **SWE-bench**: Carlos Jimenez, John Yang and colleagues, Princeton (2023).
- **Chatbot Arena**: Wei-Lin Chiang, Lianmin Zheng and colleagues, UC Berkeley (2023).
- **ARC**: François Chollet (2019).
- **Humanity's Last Exam**: Center for AI Safety and Scale AI, with Long Phan, Dan Hendrycks and nearly a thousand contributors (2025).
- **Elo rating system**: Arpad Elo (1960s).

## Vision, Images, Video and Sound

- **Vision Transformer**: Alexey Dosovitskiy and colleagues, Google (2020).
- **CLIP**: Alec Radford and colleagues, OpenAI (2021).
- **Flamingo**: Jean-Baptiste Alayrac and colleagues, DeepMind (2022).
- **LLaVA**: Haotian Liu, Chunyuan Li, Qingyang Wu and Yong Jae Lee (2023).
- **GANs**: Ian Goodfellow and colleagues, University of Montreal (2014).
- **StyleGAN**: Tero Karras and colleagues, NVIDIA (2018).
- **Diffusion models**: Jascha Sohl-Dickstein and colleagues (2015); Jonathan Ho, Ajay Jain and Pieter Abbeel (2020).
- **Latent diffusion (Stable Diffusion)**: Robin Rombach, Andreas Blattmann, Björn Ommer and colleagues (2021).
- **Classifier-free guidance**: Jonathan Ho and Tim Salimans (2021).
- **Diffusion Transformers**: William Peebles and Saining Xie (2022).
- **Flow matching**: Yaron Lipman and colleagues (2022).
- **ControlNet**: Lvmin Zhang, Anyi Rao and Maneesh Agrawala (2023).
- **WaveNet**: Aäron van den Oord and colleagues, DeepMind (2016).
- **Whisper**: Alec Radford and colleagues, OpenAI (2022).
- **RT-2 (vision-language-action)**: Anthony Brohan and colleagues, Google DeepMind (2023).

## Hardware and Infrastructure

- **NVIDIA**: Jensen Huang, Chris Malachowsky and Curtis Priem (founded 1993).
- **TPU**: Norman Jouppi and colleagues, Google (2015-2017).
- **TSMC**: founded by Morris Chang (1987).
- **EUV lithography**: ASML, with decades of work by many partners and research institutes.
- **Common Crawl**: founded by Gil Elbaz (2008).
- **Hugging Face**: Clément Delangue, Julien Chaumond and Thomas Wolf (founded 2016).
- **Energy and water research**: Emma Strubell and colleagues (2019); David Patterson and colleagues (2021); Alexandra Sasha Luccioni and colleagues (2022); Pengfei Li, Shaolei Ren and colleagues (2023).

## Image Credits

All diagrams in this book were created by the author for this book. They are simplified illustrations of the ideas described, not reproductions of figures from the cited papers.
