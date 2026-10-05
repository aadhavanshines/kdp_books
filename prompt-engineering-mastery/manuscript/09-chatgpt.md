# Part III: Prompting the Popular AI Tools

# Chapter 9: Prompting ChatGPT

ChatGPT, from OpenAI, is the assistant that brought generative AI into the mainstream, and it remains one of the most widely used. This chapter covers how to get the most from it. Everything you learned in Parts I and II applies here; the focus now is on ChatGPT's particular features and habits.

> **Note:** ChatGPT's model lineup, plan tiers, and feature names change often. The techniques below apply across versions. Check OpenAI's help center for the current details of any feature.

## Understanding ChatGPT's Modes

ChatGPT typically offers a choice between faster models for everyday tasks and reasoning ("thinking") models for complex problems, often with an automatic option that picks for you. It also integrates several tools:

- **Web search** for current information with linked sources.
- **File uploads** for documents, spreadsheets, PDFs, and images.
- **Data analysis**, where ChatGPT writes and runs code to analyze data and create charts.
- **Image generation and editing** from text descriptions.
- **Voice mode** for spoken conversations.
- **Deep research**, which performs multi-step research across many sources and produces a cited report.
- **Agent capabilities** that can browse websites and complete multi-step tasks on your behalf.

Good prompting starts with choosing the right mode for the task. Quick writing and brainstorming suit the fast model. Hard analysis, math, and complex code suit a reasoning model. Current events need search. Large research questions suit deep research.

## Custom Instructions and Personalization

**Custom instructions** let you tell ChatGPT about yourself and how you want it to respond, and they apply to every new chat. This is the single highest-value setting for regular users. Good custom instructions include:

**About you:**

```
I'm a marketing manager at a mid-sized B2B software company.
I write a lot of emails, campaign briefs, and reports for
executives. I'm based in the UK and use British spelling.
```

**How to respond:**

```
- Be concise. Lead with the answer, then the explanation.
- Use British spelling.
- Avoid filler phrases like "Great question!" and generic
  disclaimers.
- When I ask for writing, give one strong version, not several,
  unless I ask for options.
- If my request is ambiguous, ask one clarifying question
  before answering.
- When you're unsure about a fact, say so.
```

ChatGPT also offers **memory**, which lets it remember details across conversations. Memory is convenient, but review what it has saved periodically in settings, and remember that saved details influence future answers. You can also ask it directly: "What do you remember about me?" or "Forget that I work at Company X."

## Custom GPTs

A **custom GPT** is a version of ChatGPT configured with your own instructions, knowledge files, and capabilities, designed for a specific purpose. You can build one without code through the GPT builder. Examples:

- A brand-voice writer loaded with your style guide.
- A customer-support assistant loaded with your product documentation.
- A study tutor for a specific course, loaded with lecture notes.

Writing the instructions for a custom GPT is system prompt design, which Chapter 15 covers in depth. A solid structure is:

```
# Role and purpose
You are <role> who helps <users> with <tasks>.

# How to work
1. <step-by-step workflow>
2. ...

# Knowledge
Use the attached files as your primary source for <topics>.
If the files don't contain the answer, say so.

# Style
<tone, length, formatting>

# Boundaries
<what to decline, when to refer to a human>
```

> **Tip:** Test your custom GPT with realistic and tricky requests before sharing it. Ask a colleague to try to confuse it. Every failure reveals an instruction you need to add or clarify.

## Projects

**Projects** group related chats, files, and instructions together. Use them for ongoing work, such as a book you're writing, a client account, or a course you're taking, so every conversation in the project starts with the right context and files.

## Prompting Tips Specific to ChatGPT

**It follows explicit formatting instructions well.** Specify headings, tables, lengths, and styles clearly and ChatGPT will generally comply.

**It can over-format.** ChatGPT often defaults to headings and bullet points. If you want natural prose, say: "Write in flowing paragraphs without headings or bullet lists."

**Use the data analysis tool for numbers.** Upload a spreadsheet and ask it to analyze it. Because it runs real code, calculations are far more reliable than in-text arithmetic. Ask it to show the code if you want to verify the method.

**Use canvas for long documents and code.** ChatGPT's canvas lets you edit a document or code side by side with the AI and ask for targeted changes to selected sections, which is useful for iterative writing.

**Steer reasoning models with goals, not steps.** For reasoning models, describe the problem, constraints, and desired output clearly, and let the model plan its own approach.

**Branch instead of fighting.** If a conversation goes off track, edit your earlier message to try a different direction instead of piling up corrections.

## Example: From Basic to Advanced

**Basic:**

```
Give me a workout plan.
```

**Better:**

```
Create a 4-week workout plan for a beginner who wants to build
strength. I can train 3 days a week, 45 minutes per session, at
home with a pair of adjustable dumbbells and a resistance band.
Format as a table per week.
```

**Advanced:**

```
You are a certified strength coach who designs programs for busy
beginners.

Create a 4-week progressive strength plan.
About me: 38 years old, desk job, no injuries, but stiff lower
back after sitting. Never followed a structured program.
Equipment: adjustable dumbbells (2.5-25 kg), resistance band,
yoga mat.
Schedule: Mon/Wed/Fri, 45 minutes including warm-up.
Goal: get stronger and build a consistent habit; I don't care
about bodybuilding.

Requirements:
- Include a 5-minute warm-up targeting hips and lower back.
- Progress the plan each week and explain how.
- For each exercise: sets, reps, rest, and one form cue.
- Offer an easier alternative for any exercise.

Format: one table per week, then a short section on how to tell
if I should increase the weight.
Before you write the plan, ask me any questions you need answered.
```

The advanced prompt includes a role, personal context, constraints, goals, explicit requirements, format, and an invitation to ask questions. It produces a plan designed for one specific person.

Because the prompt invites questions, the first reply is not the plan but an interview:

```
Example output:
Before I build your plan, a few quick questions:
1. Can you do push-ups and bodyweight squats with good form now?
   Roughly how many?
2. Is your lower-back stiffness worse in the morning, or after
   long periods of sitting?
3. Do you have anything to do pull or row movements with, like a
   sturdy table edge or a door anchor for the band?
4. Do you prefer full-body sessions, or upper/lower splits?
```

Answering these four questions takes a minute and turns a generic plan into one designed for you.

## Key Takeaways

- Choose the right mode: fast, reasoning, search, data analysis, or deep research.
- Set up custom instructions; they improve every conversation.
- Use custom GPTs and Projects for repeated, specialized work.
- Tell ChatGPT explicitly when you want prose instead of bullet points.
- Use the data analysis tool for any real calculation.
