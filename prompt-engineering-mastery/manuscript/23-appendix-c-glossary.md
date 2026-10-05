# Appendix C: Glossary

**Agent:** An AI system that pursues a goal over multiple steps, using tools and observing results until the task is complete.

**API (Application Programming Interface):** A way for software to send requests to an AI model programmatically, with control over parameters, rather than through a chat interface.

**Chain-of-thought (CoT):** Prompting a model to reason through intermediate steps before giving a final answer.

**Chunking:** Splitting documents into smaller passages for storage and retrieval in RAG systems.

**Context engineering:** The practice of deciding what information goes into a model's context window at each step, and in what form.

**Context window:** The maximum amount of text, measured in tokens, a model can consider at once, including the prompt and the response.

**Custom instructions:** Saved preferences that an assistant applies to every conversation.

**Delimiter:** Characters or tags, such as triple quotes or XML tags, used to separate parts of a prompt.

**Embedding:** A numerical representation of text that captures its meaning, used to find semantically similar passages.

**Evaluation (eval):** A systematic test of prompt or model quality using a set of inputs and grading criteria.

**Few-shot prompting:** Including several examples of inputs and desired outputs in a prompt.

**Fine-tuning:** Further training a model on specific data to adjust its behavior.

**Function calling:** See Tool use.

**Grounding:** Basing a model's answer on provided sources rather than its general training knowledge.

**Hallucination:** A false or fabricated statement that a model presents as fact.

**Indirect prompt injection:** Malicious instructions hidden in content, such as web pages, emails, or documents, that a model processes.

**Jailbreak:** An attempt to get a model to violate its safety guidelines.

**Knowledge cutoff:** The date after which a model has no training data.

**Large language model (LLM):** An AI model trained on large amounts of text to understand and generate language.

**LLM-as-judge:** Using a language model to grade the outputs of another model or prompt.

**MCP (Model Context Protocol):** An open standard for connecting AI applications to external tools and data sources.

**Multimodal:** Able to process or generate multiple types of media, such as text, images, audio, and video.

**Negative prompt:** In image generation, a list of elements to exclude from the output.

**Open-weight model:** A model whose trained parameters are publicly released so others can run and modify it.

**Prompt:** All the input a model receives before generating a response.

**Prompt caching:** Reusing the processed form of an identical prompt prefix across requests to reduce cost and latency.

**Prompt chaining:** Splitting a task into a sequence of prompts, each using the previous output.

**Prompt injection:** Text that attempts to override a model's intended instructions.

**RAG (Retrieval-augmented generation):** Retrieving relevant information from a knowledge base and adding it to the prompt so the model can answer from it.

**ReAct:** A pattern in which a model alternates between reasoning and taking actions with tools.

**Reasoning model:** A model designed to think through problems internally before answering.

**Role prompting:** Assigning the model a persona or expertise to shape its responses.

**Self-consistency:** Generating multiple answers and selecting the most common one to improve reliability.

**Structured output:** Model output that follows a defined format, such as a JSON schema.

**System prompt:** Instructions that set a model's overall behavior for a conversation or application.

**Temperature:** A setting that controls randomness in a model's output; lower is more consistent, higher is more varied.

**Token:** A chunk of text, often a word or part of a word, that models process; roughly 750 English words equal 1,000 tokens.

**Tool use:** A model's ability to request that an application run a function, such as a search or a database query, and use the result.

**Zero-shot prompting:** Asking a model to perform a task without providing examples.
