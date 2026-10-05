# Chapter 12: Copilot, Perplexity, Meta AI, Grok, DeepSeek, and Open Models

Beyond ChatGPT, Claude, and Gemini, many other AI assistants and models are widely used. Each has a different focus. This chapter surveys the most popular, explaining what each is good at and how to adjust your prompts for it.

> **Note:** These products evolve rapidly. Use this chapter to understand each tool's character and strengths, and check current documentation for specifics.

## Microsoft Copilot

Microsoft offers Copilot in two main forms: a consumer assistant available on the web, built into Windows, and on mobile, and **Microsoft 365 Copilot**, which is built into Word, Excel, PowerPoint, Outlook, and Teams and can draw on your organization's data, such as emails, meetings, chats, and files, according to your permissions.

### Prompting Copilot in Microsoft 365

Microsoft's guidance for effective prompts emphasizes four elements: **goal**, **context**, **expectations**, and **source**. Being explicit about the *source* is especially important, because Copilot can search your work data:

```
Goal: Summarize the status of the Larkspur project.
Context: I'm meeting the client tomorrow and need to know what's
changed since our last meeting on March 3.
Expectations: A bulleted summary of under 200 words, plus a list
of open issues.
Source: Use emails and Teams chats from the Larkspur project
channel since March 3, and the latest version of the project plan.
```

App-specific tips:

- **Word:** Ask Copilot to draft from referenced files ("Draft a proposal based on /ClientBrief.docx") or to rewrite selected text.
- **Excel:** Describe the analysis in plain language: "Which region had the largest month-over-month decline in Q2, and why might that be?" Make sure your data is formatted as a table.
- **PowerPoint:** Generate a presentation from a document, then refine slide by slide.
- **Outlook:** Summarize long threads and draft replies with a specific tone and length.
- **Teams:** Ask about a meeting, such as "What decisions were made and who owns each action item?"

> **Tip:** Copilot only sees what you have permission to see. If an answer seems incomplete, check whether the relevant files are shared with you and stored where Copilot can access them.

## Perplexity

**Perplexity** is an AI-powered answer engine designed around search. Each answer is built from web sources with numbered citations. It's excellent for research, fact-finding, and staying current.

Prompting tips:

- **Ask precise questions.** "What did the latest WHO report say about global obesity rates, and how do they compare with ten years earlier?" beats "obesity stats."
- **Specify source types:** "Use peer-reviewed studies and government sources only," or "focus on discussions from practitioners."
- **Set a timeframe:** "Only include information from the past 12 months."
- **Use follow-ups** to drill down, since the conversation keeps context.
- **Open the citations.** Perplexity makes verification easy; use it.

Perplexity also offers deeper research modes and lets you choose among several underlying models on paid plans.

## Meta AI and Llama

**Meta AI** is available in WhatsApp, Instagram, Facebook, Messenger, and on the web. It's convenient for quick questions, ideas, and image generation in everyday apps. Prompts can be casual, but the same rules apply: specific requests with context get better results.

Meta also releases **Llama** models as open-weight models, which developers can download, run, and customize. More about open models below.

## Grok

**Grok**, from xAI, is integrated with the X platform (formerly Twitter) and is also available as a standalone app. Its distinguishing feature is access to real-time posts on X, which makes it useful for tracking breaking news, public sentiment, and trending conversations.

Prompting tips:

- Ask explicitly for real-time or recent information when you want it: "What are people on X saying about the product launch today?"
- Remember that social media reflects opinions and rumors, not verified facts. Ask Grok to distinguish confirmed reports from speculation.
- Grok's default personality is more casual and humorous; specify a tone if you need something professional.

## DeepSeek

**DeepSeek** is a company whose open-weight models, including strong reasoning models, gained wide attention for their high performance and efficiency. DeepSeek's models are available through its own app and API and are hosted by many third-party providers.

Prompting tips for DeepSeek reasoning models:

- Provide clear, complete problem statements; reasoning models do best when the goal is unambiguous.
- Avoid overly prescriptive reasoning instructions and few-shot examples that constrain the model's own approach, unless you have tested them.
- Specify the final output format clearly.

> **Warning:** Before using any AI service for sensitive data, review its privacy policy, data retention practices, and where data is processed. This applies to all providers. Organizations should follow their own data governance and compliance policies when choosing tools.

## Mistral

**Mistral AI**, a European company, offers both open-weight and commercial models, as well as its **Le Chat** assistant. Mistral models are popular with businesses that want efficient models, European data hosting options, or the ability to self-host. Standard prompting best practices apply, and for smaller models, clear structure and examples matter more.

## Open-Weight Models in General

**Open-weight models**, such as Llama, Mistral, DeepSeek, Qwen, and Gemma, can be downloaded and run on your own hardware or cloud, using tools such as Ollama or LM Studio for local use. Reasons to use them include privacy, cost control, offline use, and customization through fine-tuning.

Prompting open models, especially smaller ones, requires a few adjustments:

**1. Be more explicit and structured.** Smaller models have less capacity to infer what you mean. Use clear headings, numbered steps, and simple language.

**2. Use few-shot examples.** Examples help smaller models far more than they help large frontier models.

**3. Keep tasks focused.** Break complex tasks into smaller steps with prompt chaining.

**4. Respect the chat template.** Each model family expects conversations in a specific format with special tokens marking system, user, and assistant turns. Tools like Ollama usually handle this automatically, but if you build prompts manually, use the model's official template, or output quality will suffer.

**5. Check the context length.** Many open models have smaller context windows than flagship commercial models, and running them locally may limit context further due to memory.

**6. Expect more format errors.** Use constrained output or JSON-schema features in your serving tool where available, and validate output in code.

## Choosing the Right Tool

| Need | Strong options |
| --- | --- |
| General writing and thinking | ChatGPT, Claude, Gemini |
| Long documents and careful analysis | Claude, Gemini |
| Research with citations | Perplexity, deep research modes |
| Work data (email, files, meetings) | Microsoft 365 Copilot, Gemini in Workspace |
| Real-time social sentiment | Grok |
| Privacy, self-hosting, customization | Open-weight models |
| Quick help inside social apps | Meta AI |

Many professionals use two or three tools and send the same important prompt to more than one, comparing answers. When models disagree, that's a signal to investigate further.

> **Try It:** Send the same research question to two different assistants. Compare the answers, the sources, and the formatting. Note which strengths and weaknesses you observe; this builds your intuition for choosing the right tool.

## Key Takeaways

- Microsoft 365 Copilot works best when you specify goal, context, expectations, and source.
- Perplexity is built for cited research; ask precise questions and check the sources.
- Grok offers real-time social data; separate opinion from fact.
- Open-weight models need clearer structure, more examples, and the correct chat template.
- Choose tools by task, and compare multiple tools for important questions.
