# Chapter 16: Prompt Playbooks for 20 Professions & Roles

The techniques in this book work for everyone, but every profession has its own tasks, vocabulary, and risks. This chapter is a set of ready-made playbooks. Find your field, try the prompts on your own work, and read the safety note: the rules for a doctor, a lawyer, and a musician are very different.

Each playbook follows the same pattern: the best uses of AI in that field, two or three prompts you can adapt, and what to watch out for. Many readers wear several hats, such as a parent who runs a small business, so browse more than one.

> **Note:** For every profession, the same golden rule applies: AI drafts, you decide. You remain responsible for anything you send, sign, prescribe, publish, or perform.

| Profession | Top uses |
| --- | --- |
| Programmers | Debugging, tests, documentation |
| Doctors and healthcare | Patient education, literature summaries |
| Dentists | Aftercare instructions, patient communication |
| Marketing | Content calendars, ad and email copy |
| Sales | Outreach, objection handling, call practice |
| Engineers | Requirement reviews, test cases, FMEA |
| Cybersecurity | Alert triage, phishing analysis, incident reports |
| Parents and families | Explaining topics, homework help, meal plans |
| Advocates and legal | Timelines, plain-language explanations, drafts |
| Musicians | Song ideas, practice plans, artist bios |
| Teachers | Lesson plans, rubrics, differentiation |
| Students | Quizzing, study plans, feedback |
| Small business owners | Planning, customer messages, policies |
| Finance and accounting | Variance analysis, commentary, formulas |
| Human resources | Job descriptions, onboarding, policies |
| Writers and creators | Outlines, editing, repurposing content |
| Designers and architects | Design directions, mood boards, briefs |
| Real estate | Listings, client follow-ups |
| Researchers | Literature mapping, paper summaries |
| Nonprofits | Grant applications, donor appeals |

## Programmers and Developers

**Best uses:** explaining unfamiliar code, writing tests, debugging, code review, documentation, learning new languages, and delegating multi-step tasks to coding agents (Chapter 13).

```
I'm a <language> developer. Explain this error, list the three
most likely causes in order of probability, and show how to
confirm each one before changing any code.

Error and the code around it:
<paste error and code>
```

```
Write clear documentation for the function below: a one-line
summary, parameters, return value, errors raised, and one usage
example. Match the style of our existing docs.

<paste function>
```

> **Watch out:** Never paste passwords, API keys, or private customer data into a prompt. Review every AI-written change before merging it, and run the tests.

## Doctors and Healthcare Professionals

**Best uses:** patient education materials in plain language, summarizing medical literature, drafting referral letters and administrative documents, preparing for teaching sessions, and translating instructions into other languages.

```
Write a one-page patient handout explaining <condition> for a
newly diagnosed adult. Use plain language at about a sixth-grade
reading level. Cover: what it is, common symptoms, how it is
usually managed, and when to seek urgent care. End with three
questions patients could ask at their next visit. Do not give
dosages.
```

```
Summarize the key findings, study design, sample size, and main
limitations of the study below in under 200 words for a busy
clinician. Then list what this study does not show.

<paste abstract or article>
```

Here is how the first prompt might begin for type 2 diabetes:

```
Example output:
Understanding Type 2 Diabetes

What is it? Type 2 diabetes means your body has trouble using
insulin, a hormone that moves sugar from your blood into your
cells. Over time, sugar builds up in the blood...

When to get help right away: very high or very low blood sugar
readings, confusion, fainting, or vomiting that won't stop.
```

> **Warning:** Never enter identifiable patient information into a consumer AI tool. Use only tools your organization has approved for clinical data and that meet the privacy laws that apply to you. AI can be confidently wrong about medicine: verify every clinical statement against current guidelines, and never let AI replace clinical judgment.

## Dentists and Dental Teams

**Best uses:** clear post-treatment instructions, explaining treatment options to anxious patients, recall and reminder messages, social media education posts, and practice administration.

```
Write post-treatment instructions for a patient who just had a
tooth extracted. Use short, friendly sentences and a numbered
list. Cover the first 24 hours, eating and drinking, cleaning,
pain and swelling, and the warning signs that mean they should
call the practice. Leave a blank for our phone number.
```

```
A patient is nervous about a root canal. Write a calm, honest
explanation (about 150 words) of what happens during the
procedure, how long it usually takes, and what recovery is like.
Avoid frightening words and medical jargon.
```

A typical response to the first prompt begins:

```
Example output:
After your extraction: what to do
1. Keep biting gently on the gauze for 30-45 minutes.
2. For the first 24 hours, don't rinse hard, spit forcefully,
   or drink through a straw. This protects the blood clot that
   helps you heal.
3. Avoid smoking for as long as possible.
4. Eat soft, cool foods and chew on the other side.
...
Call us at ______ if bleeding won't stop, swelling gets worse
after 3 days, or you have a fever.
```

> **Warning:** Have a dentist review every patient-facing instruction before it's used; standard advice varies by procedure and patient. Keep patient records out of tools that aren't approved for health data.

## Marketing Professionals

**Best uses:** campaign ideas, audience personas, ad and email copy variations, content calendars, SEO outlines, and analyzing campaign results (Chapters 3, 8, and 14).

```
Create a 4-week content calendar for <brand>, which sells
<product> to <audience>. Goal: <goal>. Channels: <channels>.
For each post: date, channel, format, hook, key message, and call
to action. Mix education, social proof, and offers in roughly a
60/20/20 ratio.
```

```
Write 5 versions of a Facebook ad headline for <product>, each
testing a different angle: price, time saved, social proof, fear
of missing out, and curiosity. Under 40 characters each.
```

> **Watch out:** Check every factual claim, statistic, and comparison with competitors before publishing. Follow advertising rules and disclose AI-generated images where platforms require it.

## Sales Professionals

**Best uses:** researching prospects, personalized outreach, call preparation, objection handling, follow-up emails, and proposal drafts.

```
Write a short cold email (under 120 words) to <name>, <role> at
<company>. Our product: <one-line description>. Their likely pain
point: <pain point>. Open with something specific to their
business, not about us. Offer one concrete benefit with a number.
End with a low-pressure question, not a meeting request.
```

```
I sell <product> to <buyer type>. List the 8 most common
objections I'll hear. For each, give: what the buyer is really
worried about, a short empathetic response, and a question that
moves the conversation forward.
```

```
Role-play as a busy procurement manager who is happy with their
current supplier. I'll try to book a meeting. Push back
realistically. After 6 exchanges, tell me what worked and what to
change.
```

> **Watch out:** Personalize with facts you've verified, not details the AI invented about a prospect. Respect privacy and email-marketing laws.

## Engineers

**Best uses:** reviewing requirements for gaps, generating test cases, failure mode analysis, technical documentation, explaining standards in plain language, writing automation scripts, and building in-house tools.

```
Review these requirements for a <system>. For each requirement,
flag anything ambiguous, untestable, or contradictory, and
suggest a clearer rewording. Then list requirements that seem to
be missing.

<paste requirements>
```

```
Generate validation test cases for the requirement below. Include
normal operation, boundary values, invalid inputs, and fault
conditions. Output a table: Test ID, Description, Preconditions,
Steps, Expected Result, Requirement ID.

Requirement: <paste requirement>
```

```
Help me start a failure mode and effects analysis (FMEA) for
<component>. List likely failure modes, their effects, possible
causes, and current controls in a table. Mark severity,
occurrence, and detection as "to be rated by the team".
```

Here is the kind of table the test-case prompt returns for "The wiper motor shall stop within 2 seconds when the switch is turned off":

```
Example output:
| ID   | Description            | Expected Result               |
|------|------------------------|-------------------------------|
| TC01 | Switch off, normal run | Motor stops within 2 s        |
| TC02 | Switch off at max speed| Motor stops within 2 s        |
| TC03 | Off at low supply volt | Stops within 2 s, no restart  |
| TC04 | Rapid on/off toggling  | No stall, final state is off  |
| TC05 | Switch signal lost     | Motor reaches safe stop state |
```

> **Warning:** AI does not replace engineering judgment, certified analysis, or safety standards. Treat its output as a starting checklist for the team, and keep confidential designs out of tools your company hasn't approved.

## Cybersecurity Professionals

**Best uses:** triaging alerts and logs, analyzing suspicious emails, drafting incident reports and post-incident reviews, reviewing code and configurations for security weaknesses, threat modeling, writing security policies, and creating awareness training. This playbook is about defending systems you are responsible for.

```
You are a security analyst. Analyze the email below for signs of
phishing. List each indicator you find (sender, links, urgency,
requests, attachments), rate the overall risk as Low, Medium, or
High, and recommend what the recipient should do. Do not open or
visit any link.

<email>
<paste the email headers and body>
</email>
```

```
Here are firewall and authentication log entries from the last
hour (sanitized): <paste logs>. Summarize what happened in
chronological order, flag anything that looks like an attack or
misconfiguration, and suggest the next 3 investigation steps.
Mark anything you're unsure about.
```

```
Help me threat-model a new <system>, which <description>. Using
the STRIDE categories (spoofing, tampering, repudiation,
information disclosure, denial of service, elevation of
privilege), list the most likely threats, their impact, and a
mitigation for each, in a table.
```

```
Turn these incident notes into a blameless post-incident report
with: summary, timeline, impact, root cause, what went well, what
to improve, and action items with owners. <paste notes>
```

> **Warning:** Remove secrets, credentials, internal hostnames, and personal data from logs before pasting them into any AI tool not approved by your organization. Use AI to assist analysis, not to make final decisions on incidents. Prompts in this playbook are for defending systems you own or are authorized to protect.

## Parents and Families

**Best uses:** explaining hard topics to children, homework help that teaches rather than gives answers, meal planning, family schedules, bedtime stories, and planning trips and celebrations.

```
My <age>-year-old asked me "<child's question>". Help me explain
it honestly in a way they'll understand. Give me a short answer
I can say out loud, and one follow-up activity we can do together.
```

```
Act as a patient tutor for my <age>-year-old's <subject>
homework. Don't give the answers. Ask one guiding question at a
time and celebrate small wins. Today's problem: <problem>
```

```
Plan 5 weekday dinners for a family of 5, including two children
who don't like spicy food. Each meal should take under 30
minutes, and use overlapping ingredients to reduce waste. Then
give me one combined shopping list grouped by store section.
```

A response to the first prompt, for a six-year-old who asked why the sky is blue, might be:

```
Example output:
Say: "Sunlight looks white, but it's really made of all the
colors mixed together. When sunlight comes into the air, the blue
part gets bounced around the most, so blue light reaches our eyes
from every part of the sky."
Activity: Shine a torch through a glass of water with a few drops
of milk, and look at the color from the side.
```

> **Watch out:** Keep children's personal details private, check age guidance in each tool's terms of service, and stay involved when children use AI.

## Advocates and Legal Professionals

**Best uses:** summarizing long documents, first drafts of letters and notices, organizing case facts into timelines, explaining legal concepts to clients in plain language, and preparing questions for witnesses or clients.

```
Organize the facts below into a chronological timeline with
dates, events, people involved, and the source document for each
entry. Flag any dates that conflict between documents. Don't
draw legal conclusions.

<paste facts or documents>
```

```
Explain <legal concept> to a client with no legal background in
under 200 words, using a simple everyday example. Note that the
rules vary by jurisdiction and that this is general information.
```

```
Draft a polite but firm first notice letter to a tenant who is
two months behind on rent. Facts: <facts>. Leave placeholders for
statutory references, which I will add after checking the law
that applies.
```

> **Warning:** AI tools have invented case names, citations, and quotations that do not exist, and lawyers have been sanctioned by courts for filing them. Verify every authority yourself in an official source. Protect client confidentiality: use only tools approved for confidential material, and follow your bar council's or law society's rules on AI use.

## Musicians and Music Creators

**Best uses:** brainstorming song concepts, finding rhymes and imagery, structuring songs, writing practice plans, drafting press kits and bios, planning releases, and creating music with AI generators (Chapter 15).

```
I'm writing a <genre> song about <theme>. Give me 10 fresh
images or metaphors I could use, avoiding common clichés like
"broken heart" and "tears like rain". Then suggest a song
structure with a strong hook idea for the chorus.
```

```
Create a 4-week practice plan for an intermediate <instrument>
player who wants to improve <skill>, with 30 minutes a day. Each
day: warm-up, focus exercise, and a short piece or song to apply
it.
```

```
Write a 100-word artist bio for <name>, a <genre> artist from
<place> whose sound mixes <influences>. Tone: <tone>. Mention
<achievement>. Write in the third person.
```

> **Watch out:** Don't ask AI to imitate a living artist's voice or copy existing lyrics. Check each music generator's terms for commercial rights, and disclose AI involvement where streaming platforms or contests require it. Your own lyrics and ideas are what make your work yours.

## Teachers and Educators

**Best uses:** lesson plans, differentiated worksheets, rubrics, quiz questions, feedback on student work, and parent communication.

```
Create a 45-minute lesson plan on <topic> for grade <grade>.
Include a learning objective, a 5-minute hook, a main activity,
a quick check for understanding, and an exit ticket. Add a
simpler version of the activity for students who need support and
a challenge task for advanced students.
```

```
Write a rubric for <assignment> with 4 criteria and 4 performance
levels. Use language students can understand.
```

> **Watch out:** Check facts and age-appropriateness, protect student privacy, and follow your school's policy on AI use.

## Students

**Best uses:** understanding difficult topics, practice questions, feedback on drafts, study plans, and exam preparation, used to learn, not to avoid learning.

```
I'm studying <topic> for an exam in <weeks> weeks. Quiz me with
one question at a time, starting easy. After each answer, tell me
what I got right, what I missed, and give the next question.
```

> **Watch out:** Follow your institution's rules on AI use and never submit AI-written work as your own. Use AI as a tutor that helps you think, not a ghostwriter.

## Small Business Owners

**Best uses:** business plans, pricing ideas, customer emails, social media posts, simple bookkeeping questions, and policies.

```
I run a <business> in <city> with <number> staff. My biggest
problem this month is <problem>. Suggest 5 low-cost actions I can
take within 30 days, ranked by likely impact, with the first step
for each.
```

> **Watch out:** Confirm tax, legal, and employment questions with a qualified professional.

## Finance and Accounting Professionals

**Best uses:** explaining variances, drafting management commentary, writing spreadsheet formulas, checking reconciliations, and summarizing reports.

```
Here are this quarter's figures and last quarter's: <data>.
Explain the three largest variances in plain language for the
leadership team, show the calculations, and list questions I
should investigate before finalizing the report.
```

> **Watch out:** Recalculate every number yourself or with a spreadsheet, and keep confidential financial data in approved tools.

## Human Resources

**Best uses:** job descriptions, interview questions, onboarding plans, policy drafts, and employee communications.

```
Write an inclusive job description for a <role> at a <company
type>. Separate must-have from nice-to-have requirements, avoid
gendered or exclusionary language, and keep it under 400 words.
```

> **Watch out:** Never let AI make hiring or firing decisions, test for bias (Chapter 23), and follow employment law.

## Writers and Content Creators

**Best uses:** brainstorming, outlines, research questions, editing, titles, repurposing content across formats, and video scripts.

```
Turn the article below into: a 60-second video script, 3 social
posts for different platforms, and a 5-email newsletter series
outline. Keep my voice and key examples.

<paste article>
```

> **Watch out:** Keep your own voice in the final work, check facts, and disclose AI use where publishers or platforms require it.

## Designers and Architects

**Best uses:** concept exploration, mood boards with image generators, design briefs, client presentations, and code for prototypes.

```
I'm designing <project> for <client>. Their brief: <brief>.
Propose 3 distinct design directions, each with a name, a mood
description, a color palette, typography ideas, and an image
generation prompt I can use to create a mood board.
```

> **Watch out:** Respect copyright in reference images, and check that AI-generated concepts meet building codes, accessibility standards, and engineering requirements before relying on them.

## Real Estate Professionals

**Best uses:** property listings, neighborhood guides, client follow-ups, market summaries, and open-house materials.

```
Write a property listing for: <property details>. Lead with the
strongest feature, use specific details rather than vague praise,
keep it under 200 words, and avoid wording that could
discriminate against any group of buyers or renters.
```

> **Watch out:** Every fact in a listing must be accurate; verify sizes, features, and legal details.

## Researchers and Scientists

**Best uses:** literature mapping, summarizing papers, planning experiments, writing code for analysis, and editing grant applications.

```
Here are the abstracts of 10 papers on <topic>: <abstracts>.
Group them by approach, summarize the main finding of each group,
point out where they disagree, and suggest three open questions
that none of them addresses.
```

> **Watch out:** Verify every citation and finding in the original papers, and follow your journal's and funder's rules on AI use.

## Nonprofits and Community Organizers

**Best uses:** grant applications, donor letters, volunteer recruitment, impact reports, and event planning.

```
Write a 300-word donor appeal for <organization>, which <mission>.
Tell the story of one person helped (details: <story>), include
one impact number (<number>), and end with a specific ask: <ask>.
Warm and hopeful, not guilt-driven.
```

> **Watch out:** Get consent before sharing anyone's story, and keep impact figures accurate.

## Adapting a Playbook to Your Own Work

If your profession isn't listed, build your own playbook in four steps:

1. **List the five tasks** that take most of your writing, research, or planning time.
2. **Turn each into a prompt** with the six-part blueprint from Chapter 3: role, task, context, instructions, format, and examples.
3. **Add your field's rules:** privacy, regulations, professional standards, and what must always be checked by a person.
4. **Save the best versions** in your prompt library, or turn them into a custom assistant (Chapter 21).

> **Try It:** Choose the playbook closest to your work. Run one of its prompts on a real task this week, then improve it with one specific change from what you observed. Save the improved version.

## Key Takeaways

- Every profession can benefit from AI, and the same core techniques apply everywhere.
- Each field has its own best uses, vocabulary, and risks; adapt prompts accordingly.
- Healthcare, legal, financial, and HR work carry special duties of privacy, accuracy, and fairness: use approved tools and verify everything.
- Creative fields should protect originality and respect rights and disclosure rules.
- Build your own playbook from your five most time-consuming tasks.
