# Chapter 10: Prompting Claude

Claude, from Anthropic, is known for strong writing quality, careful reasoning, coding ability, and its skill with long documents. It's a favorite of writers, analysts, and developers. This chapter covers how to prompt Claude effectively.

> **Note:** Claude is available in a family of models of different sizes and speeds, and features evolve frequently. Check Anthropic's documentation for current model names and capabilities.

## Claude's Strengths

Claude is particularly well suited to:

- **Long documents:** It can work with very large inputs, such as entire reports, contracts, books, or codebases, and answer detailed questions about them.
- **Writing:** It produces natural, nuanced prose and can match a wide range of voices.
- **Following detailed instructions:** Claude pays close attention to exactly what you ask, which rewards precise prompting.
- **Coding and agentic work:** Claude models are widely used for software development, including through Claude Code, Anthropic's agentic coding tool.
- **Extended thinking:** Claude can think through hard problems before answering, with adjustable effort in many settings.

## Be Explicit: Claude Does What You Ask

Recent Claude models are trained to follow instructions precisely. This is a strength, but it means you get what you ask for, not necessarily what you meant. If you want Claude to go beyond the literal request, say so.

- Instead of: "Make a packing list for my trip."
- Try: "Make a packing list for my 10-day hiking trip in Scotland in October. Be thorough: think about weather changes, first aid, navigation, and things first-timers usually forget, and group the items by category."

Similarly, if you want Claude to take action, such as editing a file, rather than suggesting changes, say "Make these changes" rather than "Can you suggest some changes?"

## Use XML Tags to Structure Prompts

XML tags are a well-established way to organize complex prompts for Claude, and Anthropic's documentation encourages them for organizing complex prompts. Tags help Claude separate instructions, context, examples, and data, and they make outputs easier to parse.

```
<context>
We are a nonprofit that runs coding bootcamps for adults changing
careers. Our audience is people aged 30-55 with no technical
background.
</context>

<task>
Write the landing page copy for our new data analytics course.
</task>

<requirements>
- Address the fear of "being too old to learn tech".
- Mention the 16-week length, evening schedule, and job support.
- Avoid jargon; explain any technical term you use.
</requirements>

<format>
Headline, subheadline, 3 benefit sections with short headings,
an FAQ with 4 questions, and a call to action.
</format>
```

Tag names are not special keywords. Use clear, consistent names and refer to them in your instructions, such as "using the information in `<context>`."

## Working with Long Documents

Claude excels at long-context tasks. To get the best results:

1. **Put documents first, questions last.** Place long documents near the top of the prompt and your instructions and question at the end.
2. **Wrap each document in its own tags and label it** with an ID, a title, and a type, so you and Claude can refer to it precisely:

```
<documents>
  <doc id="A" title="Board meeting minutes, May" type="minutes">
  ...
  </doc>
  <doc id="B" title="Supplier contract renewal" type="contract">
  ...
  </doc>
</documents>
```

3. **Ask for relevant quotes first.** For complex questions, ask Claude to extract the relevant quotes before answering. This focuses its attention and lets you verify the answer:

```
First, find quotes from the documents that are relevant to the
question and place them in <quotes> tags. Then answer the question
in <answer> tags, referring to the quotes.
```

## Explain the "Why"

Claude responds especially well to context about why an instruction exists. Instead of a bare rule, give the reason:

- Less effective: "Keep every answer under 3 sentences."
- More effective: "Keep every answer under 3 sentences, because our customers read these replies on a smartwatch screen."

With the reason, Claude can generalize correctly to related cases, such as also avoiding wide tables and long links that would not fit on a small screen.

## Projects and Styles

**Projects** in Claude let you store documents and custom instructions that apply to every conversation within the project. Use them for ongoing work: a book manuscript, a client's brand guidelines, a codebase's documentation, or a course syllabus.

Claude also lets you choose or create **styles** that shape the tone and format of responses, and it supports personal preferences that apply across conversations. Set these up once to avoid repeating yourself.

## Extended Thinking

For difficult problems, enable Claude's extended thinking. Prompting tips:

- **Start with high-level instructions.** "Think deeply about this problem and consider multiple approaches" often works better than prescribing exact steps.
- **Ask it to verify.** "Before finishing, check your solution against the test cases" encourages self-correction.
- **Use examples of reasoning sparingly.** If you show example reasoning, Claude will tend to follow that style.

## Controlling Format and Style

- **Say what to do, not what not to do.** "Write your answer as connected paragraphs of plain prose" works better than "No bullet points or headings."
- **Write the prompt the way you want the answer written.** A request written in plain paragraphs, with few bullets or headings, tends to get plain paragraphs back.
- **Use format tags:** "Write the body of the essay in `<essay>` tags."

## Artifacts and Building with Claude

In the Claude apps, **artifacts** let Claude create standalone content, such as documents, code, interactive web pages, diagrams, and small apps, in a dedicated panel you can iterate on. To get great artifacts, describe the purpose, the users, the key features, and the visual style you want.

## Claude for Coding

Claude Code and other coding tools built on Claude work best with:

- **Clear goals and acceptance criteria:** "Add password reset. Done means: email is sent, link expires in 1 hour, tests pass."
- **Project context:** A `CLAUDE.md` file in your repository can store project conventions, commands, and architecture notes that Claude Code reads automatically.
- **Verification:** Ask it to run tests, linters, or the app itself to confirm its changes work.

Chapter 13 covers prompting coding assistants in more depth.

## Example: Analyzing a Contract

```
You are an experienced commercial lawyer reviewing a contract for
a small business owner who is not a lawyer.

<contract>
<paste contract>
</contract>

<instructions>
1. Extract quotes for every clause about payment terms,
   termination, liability, and intellectual property. Put them
   in <quotes> tags.
2. Explain each clause in plain English.
3. Flag any clause that is unusual or unfavorable to the client,
   rated High, Medium, or Low concern, with your reasoning.
4. Suggest specific questions the client should ask their own
   lawyer.
</instructions>

This is for initial understanding only; the client will consult a
licensed attorney before signing.
```

> **Warning:** AI contract review is a starting point for understanding, not legal advice. Always have important contracts reviewed by a qualified professional.

## Key Takeaways

- Claude follows instructions precisely; ask explicitly for ambitious or proactive behavior.
- Use XML tags to structure complex prompts.
- For long documents, place content first, questions last, and ask for supporting quotes.
- Explain the reasons behind instructions so Claude can generalize correctly.
- Use Projects, styles, extended thinking, and artifacts for ongoing and complex work.
