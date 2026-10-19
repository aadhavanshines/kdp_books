# Chapter 19: Long Memory: Context Windows and Retrieval

A model's knowledge is frozen at the end of its training. It doesn't know what happened yesterday, what's in your company's files or what you told it in a different conversation. There are two ways to give it that information: put it directly in front of the model, in its **context window**, or build a system that **retrieves** the right pieces when needed. This chapter explains both.

## The Context Window

The **context window** is the amount of text a model can consider at once: the system prompt, the conversation so far, any documents, and the answer being written. It's measured in tokens, and it has grown spectacularly:

| Model | Year | Context window |
| --- | --- | --- |
| GPT-3 | 2020 | 2,048 tokens (a few pages) |
| GPT-4 | 2023 | 8,192 or 32,768 tokens |
| Claude (100K version) | 2023 | 100,000 tokens (a novel) |
| Gemini 1.5 Pro | 2024 | 1 million tokens, later 2 million |
| Llama 4 Scout | 2025 | 10 million tokens |

As rough illustrations, a million tokens is about 750,000 words of English: several long novels, or a large codebase. Google said a million tokens could hold about an hour of video for Gemini 1.5, though how many tokens video takes depends on how a model encodes its frames and sound.

> **Did You Know?** When Google introduced Gemini 1.5 in February 2024, it demonstrated a striking use of a long context. It gave the model a grammar book and dictionary for **Kalamang**, a language spoken by fewer than 200 people in western New Guinea, with almost no presence on the web. Using only those materials in its context, the model learned to translate English into Kalamang at a level similar to a person who had studied the same materials.

## Why Long Context Was Hard

Chapter 7 explained that attention's cost grows with the square of the length: ten times longer text means a hundred times more attention work. And Chapter 17 showed that the KV cache grows with every token. Long context required many advances at once: more efficient attention (FlashAttention, grouped-query and latent attention, sparse patterns), position methods that work for long lengths (stretching RoPE), dedicated long-context training stages (Chapter 12) and more memory per chip.

## Does the Model Actually Use It All?

Having a long context isn't the same as using it well. A published maximum is the most a model can accept, not a guarantee that it recalls everything in the window equally well.

- **Needle in a haystack.** In 2023, the developer **Greg Kamradt** popularized a simple test: hide one odd sentence, such as a fact about the best thing to do in San Francisco, somewhere in a long document, and ask the model to find it. Early long-context models often missed needles in certain positions; modern models find them almost perfectly. But finding one sentence is much easier than understanding a whole book.
- **Lost in the middle.** In 2023, **Nelson Liu** and colleagues at Stanford found that models used information at the beginning and end of a long context much better than information in the middle, a little like people remembering the start and end of a list.
- **Context rot.** Later studies found that performance on harder tasks, such as connecting several facts or ignoring distracting information, still declines as the input grows longer, even in the latest models.

So long context is powerful, but stuffing everything in isn't always best. It's also expensive: you pay for every token in the context, every time.

## Retrieval-Augmented Generation

The alternative is to keep information outside the model, and fetch just the relevant parts when a question arrives. In 2020, **Patrick Lewis** and colleagues at Facebook AI Research named this **retrieval-augmented generation (RAG)**.

![Retrieval-augmented generation: documents are split into chunks and turned into embeddings stored in a search index. When a question arrives, it is also embedded, the most similar chunks are retrieved, and they are given to the model together with the question, so it can answer using them and cite them.](images/diagram-rag.png)

A typical RAG system works like this:

1. **Prepare the library.** Split documents into chunks of a few paragraphs, turn each chunk into an embedding (Chapter 4) and store them in a search index, often a **vector database**.
2. **Search.** When a question comes in, embed it, and find the chunks whose embeddings are closest in meaning. Many systems also run an old-fashioned keyword search and combine the results, because embeddings can miss exact names, codes and numbers.
3. **Rerank.** A second model reads the top candidates more carefully and picks the best.
4. **Answer.** Give the chosen chunks to the language model along with the question, with an instruction to answer from them and cite them.

RAG has big advantages. The information can be updated at any time without retraining; answers can point to their sources, so people can check them; access permissions can be enforced at the search step; and it reduces, though doesn't eliminate, hallucination.

> **In Plain Words:** RAG is an open-book exam. Instead of relying on memory, the model gets to look up the relevant pages first, and can tell you where it found the answer.

## Searching the Web

The biggest retrieval system of all is the web itself. Most chat assistants can now search the internet, read the results and answer with citations. "Deep research" features, introduced by Google, OpenAI, Anthropic and others from late 2024 onward, go further: the model plans a research strategy, runs dozens or hundreds of searches, reads the sources and writes a long report, over many minutes. This blurs the line between retrieval and the agents of the next chapter.

## Memory Across Conversations

Normally, each conversation starts fresh. Many assistants now offer **memory**: they save notes about you and your preferences, such as your job, your projects or the style you like, and retrieve them in later conversations. Under the hood, this is usually retrieval again: notes are stored outside the model and brought into the context when relevant. Users can usually see, edit and delete what's remembered.

## Which to Use?

- For a **single long document**, such as a contract, a book or a codebase that fits, putting it all in the context is simplest and often best.
- For a **large, changing collection**, such as a company's knowledge base or the web, retrieval is necessary.
- In practice, many systems combine both: retrieve generously, then let a long-context model read everything retrieved.

## Key Takeaways

- The **context window** is how much text a model can consider at once; it grew from 2,048 tokens in 2020 to millions by 2024 and 2025.
- Long context required more efficient attention, better position methods, special training and more memory.
- Models don't use long contexts perfectly: information can get **lost in the middle**, and performance degrades on harder long tasks.
- **Retrieval-augmented generation** fetches relevant chunks at question time, allowing updates, citations and permissions.
- Web search, deep research and memory features are all forms of retrieval.

## Sources and Further Reading

- Gemini Team, Google, "Gemini 1.5: Unlocking multimodal understanding across millions of tokens of context," 2024 (Kalamang translation). arxiv.org/abs/2403.05530
- Anthropic, "Introducing 100K Context Windows," May 2023. anthropic.com/news/100k-context-windows
- Meta AI, "The Llama 4 herd" (10M-token context for Scout), April 2025. ai.meta.com/blog/llama-4-multimodal-intelligence
- Greg Kamradt, "Needle In A Haystack: Pressure Testing LLMs," 2023. github.com/gkamradt/LLMTest_NeedleInAHaystack
- Nelson F. Liu et al., "Lost in the Middle: How Language Models Use Long Contexts," 2023. arxiv.org/abs/2307.03172
- Kelly Hong, Anton Troynikov, Jeff Huber, "Context Rot: How Increasing Input Tokens Impacts LLM Performance," Chroma, 2025. research.trychroma.com/context-rot
- Patrick Lewis et al., "Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks," NeurIPS 2020. arxiv.org/abs/2005.11401
- Bowen Peng et al., "YaRN: Efficient Context Window Extension of Large Language Models," 2023. arxiv.org/abs/2309.00071
