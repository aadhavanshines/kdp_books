# Chapter 11: Prompting Google Gemini

Gemini is Google's family of AI models and the assistant built on them. Its distinctive strengths are native multimodality (understanding text, images, audio, video, and documents together), very long context, and deep integration with Google products such as Search, Gmail, Docs, Drive, Sheets, and YouTube.

> **Note:** Google frequently updates Gemini's models, apps, and integrations. The principles here apply broadly; check Google's documentation for current features.

## Where You'll Meet Gemini

- **The Gemini app** on the web and mobile, a general-purpose assistant.
- **Gemini in Google Workspace**, built into Gmail, Docs, Sheets, Slides, Drive, and Meet.
- **Google Search** AI features.
- **Google AI Studio and Vertex AI** for developers using the Gemini API.
- **Android**, where Gemini can act as the device assistant.

The same prompting principles apply everywhere, but the context differs. In Workspace, Gemini can draw on your files and emails. In the app, you provide context directly or connect apps.

## Google's Prompting Framework

Google's guidance for Workspace users describes four areas to consider when writing a prompt:

1. **Persona:** Who are you, or who should Gemini be?
2. **Task:** What do you want done?
3. **Context:** What background is relevant?
4. **Format:** How should the output look?

For example:

```
I'm a customer success manager (persona). Draft an email to a
client whose renewal is in 30 days (task). They've had two
support issues this quarter, both resolved, and their usage is
up 40% (context). Keep it under 150 words with a friendly,
confident tone and a suggested call time (format).
```

This maps directly onto the six-part blueprint from Chapter 3. Google's guidance also notes that the most effective prompts are often longer, around a few full sentences, and conversational.

## Multimodal Prompting

Gemini can reason across different types of media in a single prompt. Practical uses include:

- **Images:** "Here's a photo of my fridge contents. Suggest three dinners I can make tonight."
- **Screenshots:** "This is an error message from my accounting software. What does it mean and how do I fix it?"
- **Documents and charts:** "Extract the data from this chart into a table."
- **Video:** "Summarize this 40-minute lecture video and list the key timestamps."
- **Audio:** "Transcribe this interview and identify the main themes."

Tips for multimodal prompts:

- **Refer to the media explicitly:** "In the image above..." or "In the second chart..."
- **Ask the model to describe what it sees first** when accuracy matters: "First describe the diagram in detail, then answer the question." This surfaces misreadings before they affect the answer.
- **Be specific about where to look:** "Focus on the top-right section of the floor plan."
- **For video, ask about timestamps** so you can verify claims.

## Using Workspace Integration

In Gmail, Docs, and Drive, Gemini can work with your own content. Reference files directly:

```
Using @Q3 Sales Report and @Pricing Proposal 2026, draft a one-page
summary for the leadership team that highlights where our pricing
changes are likely to affect Q4 revenue.
```

(The exact way of referencing files, such as typing @ and choosing a file, depends on the interface.)

In Sheets, describe the analysis or formula you need in plain language. In Docs, ask for drafts, rewrites, or summaries of the current document. In Gmail, ask Gemini to summarize long threads or draft replies.

> **Tip:** When Gemini works with your private files and emails, be specific about which sources to use. "Based on the emails from Priya last week" produces a more accurate answer than a general question that searches everything.

## Grounding with Google Search

Gemini can ground its answers in Google Search results, which helps with current events, recent product information, and fact-heavy questions. Ask for sources and check them:

```
What are the current visa requirements for a US citizen visiting
Vietnam for 3 weeks of tourism? Cite the official sources and
note the date of the information.
```

For important matters like travel, legal, or medical information, always confirm with the official source.

## Gems: Custom Gemini Assistants

**Gems** are customized versions of Gemini with saved instructions, similar to custom GPTs. Create Gems for repeated tasks, such as a writing coach, a coding helper with your preferred stack, or a meal planner that knows your dietary needs. Write their instructions using the system prompt principles in Chapter 16.

## Deep Research and Long Context

Gemini offers a **deep research** capability that searches extensively and produces detailed reports with citations. Make research prompts specific about scope, audience, and output:

```
Research the market for plant-based pet food in Europe. Focus on
market size estimates, growth trends, the top 5 brands, and
regulatory issues. I'm an investor evaluating a startup in this
space. Prioritize recent, credible sources and clearly mark
estimates versus confirmed figures.
```

Gemini's long context also makes it effective for analyzing large documents, long videos, or many files at once. As with Claude, put long content first and specific questions at the end.

## Gemini for Developers

Through Google AI Studio and the Gemini API, developers can:

- Write **system instructions** to set behavior.
- Request **structured JSON output** using a response schema.
- Use **function calling** for tool use.
- Configure **thinking** for complex reasoning tasks.
- Send multimodal inputs such as images, audio, video, and PDFs.

AI Studio is a good place to experiment with prompts and settings before building them into an application.

## Example: Multimodal Analysis

```
I've attached a photo of a whiteboard from our planning meeting.
1. Transcribe all the text you can read, preserving the structure
   (columns, arrows, groupings).
2. Mark anything you can't read clearly as [unclear].
3. Turn the content into a clean project plan with tasks, owners
   (if written), and dependencies.
```

```
Example output:
Transcription:
Column "Q1 launch": Landing page (Raj), Email list [unclear],
Pricing page -> needs legal review
...
Project plan:
1. Landing page - Raj - no dependencies
2. Pricing page - owner not written - depends on legal review
3. Email list - owner unclear on the board - start after (1)
```

Notice that the model marked what it couldn't read instead of guessing, because the prompt told it to.

## Key Takeaways

- Gemini is natively multimodal; prompt with images, documents, audio, and video together.
- Use Google's Persona, Task, Context, Format framework.
- In Workspace, reference specific files and emails for accurate, grounded answers.
- Use Search grounding and deep research for current information, and verify the sources.
- Gems store reusable instructions for repeated tasks.
