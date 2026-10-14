# KDP Listing Details: AI for Engineers

Copy these values into the KDP "Details" page for the Kindle eBook and the paperback. Use the same values for both formats so Amazon links them.

## Language

English

## Book Title

AI for Engineers

## Subtitle

Automate Product Development and Validation with Claude: Requirements, Test Cases, FMEA, Test Logs and Reports, from Your First Prompt to Production Tools

> **Trademark note.** "Claude" is a trademark of Anthropic. It appears in the subtitle to describe what the book is about, and the book carries a clear "not affiliated" notice on its copyright page and in the description. If KDP asks you to change it, use **Automate Product Development and Validation with AI: Requirements, Test Cases, FMEA, Test Logs and Reports, from Your First Prompt to Production Tools**, then update `book.json` and rebuild so the cover matches. Never imply the book is official or endorsed.

## Series

Optional. If you created a series for your earlier books (for example "AI Skills for Everyone"), add this book as number 4.

## Edition Number

1

## Author

- First name: Aadhavan
- Last name: Muthurengan

## Contributors

None

## Description

Paste the following into the description box. KDP supports basic HTML such as `<b>`, `<i>`, `<ul>`, and `<li>`.

```html
<b>AI can draft your test cases. Can you prove they are right?</b>

<p>Engineers spend their days on requirements, test cases, bench logs, reports, defect reports and FMEAs. Much of that work is careful and repetitive, which is exactly where AI helps. It is also where AI can do damage: a test case with an invented limit, a report with a number that isn't in the data, or an FMEA that quietly leaves out the worst failure mode. <i>AI for Engineers</i> shows you how to get the help without the damage.</p>

<p><b>One product, the whole V.</b> Every project works on the same fictional product, the WLC-200 smart window-lift controller with anti-pinch protection, followed from its requirements specification to nightly test reports. You get its whole engineering record: two specification versions, test suites with traces, two nights of HIL bench logs, thirty defect reports, an FMEA structure, lessons learned and a test database.</p>

<p><b>Everything is real, and everything is checked by code.</b> Every tool was run for real, several times and with three Claude models, and graded against answers an engineer worked out in advance. The scores are in the book, including the failures: an FMEA draft that turned into a defect list, a report that drew a wrong conclusion from a missing fact, and an answer file that was wrong where the AI was right.</p>

<p><b>You will build ten tools:</b></p>
<ul>
<li>A requirements reviewer that finds ambiguous, untestable, conflicting and duplicate requirements</li>
<li>A test case generator with traceability, and checks that catch invented limits</li>
<li>A specification change impact analyzer: code for the facts, AI for the judgement</li>
<li>A HIL log analyzer written by Claude Code and proved against hand measurements</li>
<li>A test report writer whose every number is checked against the data</li>
<li>A defect triage tool with duplicates, severity and a confusion matrix</li>
<li>An FMEA assistant that drafts rows while code computes every RPN</li>
<li>A knowledge assistant that quotes its sources and says when they don't know</li>
<li>A read-only MCP server for the test database</li>
<li>A nightly validation assistant that turns a night of logs into a report and defect drafts</li>
</ul>

<p><b>Inside, you will also learn:</b></p>
<ul>
<li>What you may and may not send to an AI service, and how to send less</li>
<li>How to prompt for precise engineering work</li>
<li>How to evaluate engineering AI with labels, graders and several runs</li>
<li>How to think about AI tools under ISO 26262, Automotive SPICE and other standards</li>
<li>How to run a pilot, measure it, train reviewers and govern the tools</li>
</ul>

<p>Part I needs no programming. The projects are short Python programs explained line by line. The examples come from automotive validation, and the methods apply to any regulated hardware or embedded product.</p>

<p>Written by an automation and AI professional with more than 15 years of experience building in-house tools for automotive product development and validation.</p>

<p><i>This book is independent and is not affiliated with, sponsored by, or endorsed by Anthropic, any standards body, or any other company whose products it discusses. Claude, Claude Code and Claude Agent SDK are trademarks of Anthropic.</i></p>
```

## Author Bio (for Amazon Author Central)

> Aadhavan Muthurengan is an automation and artificial intelligence professional with more than 15 years of experience in the automotive industry. Throughout a career focused on product development and validation, Aadhavan has designed and built a wide range of in-house tools that automate complex engineering workflows, speed up testing, and help teams deliver reliable, high-quality results. Aadhavan is the author of *Prompt Engineering Mastery*, *Vibe Coding for Beginners*, *Building AI Agents with Claude* and *AI for Engineers*.

## Publishing Rights

"I own the copyright and I hold the necessary publishing rights."

## Primary Audience

- Sexually explicit content: No
- Reading age: leave the minimum blank, or 18+

## Primary Marketplace

Amazon.com

## Categories (choose up to 3)

Pick the closest available matches in KDP's category browser:

1. Computers & Technology > Computer Science > AI & Machine Learning
2. Engineering & Transportation > Engineering > Automotive (or Industrial, Manufacturing & Operational Systems > Quality Control)
3. Computers & Technology > Software Development > Software Testing

## Keywords (7 boxes)

Trademarked product names are kept out of the keywords.

1. ai for engineers automation
2. test case generation requirements traceability
3. hil test automation python
4. fmea with ai
5. automotive validation engineering
6. ai tools for product development
7. requirements engineering ai review

## AI-Generated Content Disclosure (required)

KDP asks whether the book contains AI-generated content. The manuscript text and the cover were produced with AI assistance, and the book quotes real AI output, so answer **Yes**:

- Text: **AI-generated**. Select the option that matches how much you edited it.
- Images (cover, diagrams and screenshots): **AI-generated**.
- Translations: None.

Answering this accurately is a KDP content-guideline requirement. The disclosure is not shown to customers.

## Kindle eBook Settings

- DRM: Your choice.
- Manuscript: upload `dist/ai-for-engineers.epub`
- Cover: upload `dist/ebook-cover.jpg` (1600 x 2560 px). A white-background version, `dist/ebook-cover-white.jpg`, is also available.
- ISBN: not required for Kindle
- KDP Select: optional (90-day exclusivity, Kindle Unlimited royalties)
- Territories: All territories
- Royalty: 70% (requires a price from $2.99 to $9.99)
- Suggested list price: **$9.99 USD**

## Paperback Settings

- ISBN: choose "Get a free KDP ISBN"
- Print options:
  - Ink and paper type: Black & white interior with white paper
  - Trim size: 6 x 9 in (15.24 x 22.86 cm)
  - Bleed settings: **No bleed**
  - Paperback cover finish: Glossy (suits the dark cover) or Matte
- Manuscript: upload `dist/paperback-interior-6x9.pdf`
- Cover: choose "Upload a cover you already have" and upload `dist/paperback-cover.pdf`
- Suggested list price: **$24.99 USD**. Check the royalty calculator on the pricing page before publishing, since printing costs change.

> The paperback cover is sized for exactly the page count in `dist/build-info.json`. KDP's free ISBN barcode is printed automatically in the white box on the back cover. If you edit the manuscript and the page count changes, rebuild so the spine width updates.
