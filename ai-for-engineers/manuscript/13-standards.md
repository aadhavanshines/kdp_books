# Chapter 13: Working With Standards Responsibly

Engineers in regulated industries work under standards: ISO 26262 for functional safety of road vehicles, Automotive SPICE for development processes, ISO/SAE 21434 for cybersecurity, IEC 61508 and its sector versions elsewhere, and quality management standards such as ISO 9001 and IATF 16949. Sooner or later someone asks whether AI tools are "allowed" under them, or asks an AI to explain a clause. This chapter gives practical guidance on both. It describes the standards only in general terms, in its own words; for anything you'll rely on, read the standard itself, and talk to your safety and quality managers.

> **Note:** Standards are copyrighted documents, sold by the organisations that publish them. Don't paste a standard's text into an AI service unless your licence allows it, and don't expect an AI model to quote a standard correctly from memory. This book reproduces no standard text.

## What AI Is Good For, and Not, With Standards

| Use | Good idea? | Why |
| --- | --- | --- |
| Explaining a concept you're learning ("what is an ASIL?") | Yes, as a start | Useful orientation; check the details in the standard |
| Quoting a clause | No | Models misquote, mix versions and invent clause numbers; copyright too |
| Mapping your process to a standard's requirements | Draft only | Useful as a checklist draft; an expert must verify every line against the standard |
| Checking a work product against your company's templates and rules | Yes | Your own rules are text you own, and the check is verifiable |
| Deciding whether something is compliant | No | A judgement that needs an accountable person and the real text |
| Drafting work products that the standard requires (test specifications, analyses, reports) | Yes, with review | That's what this book does; the review and the record are what count |

The pattern is the same as everywhere in this book. Use Claude for drafting, explaining and checking against text you control. Keep compliance decisions with people who have read the standard.

## The Question Behind "Is It Allowed?"

Functional safety standards don't ban particular tools. They ask you to show that the tools you use in development can't introduce an error into a safety-related product without someone noticing. In ISO 26262, that topic is called confidence in the use of software tools. In outline, without reproducing the standard's tables, it asks two questions about each use of a tool:

1. **If the tool made a mistake, could it put an error into the product, or let an error go undetected?** A tool whose output a person reviews in full can still make mistakes, but they're less likely to get through than a tool whose output goes straight into a release decision.
2. **How likely is it that such a mistake would be caught?** By a review, by a later test, or by a check built into the process.

The answers decide how much evidence you need that the tool works, from none, for tools whose errors can't matter or are reliably caught, up to formal qualification for tools whose errors could slip through unnoticed. The standard lists the kinds of evidence that can count, such as experience from previous use, an assessment of how the tool was developed, or **validation of the tool** against known answers.

That last kind of evidence should sound familiar. **Every grader in this book is tool validation evidence.** A requirements reviewer measured against an engineer's labels, a log analyzer measured against hand measurements on two nights, a test case generator whose every limit is traced by code: that is exactly the kind of record a safety assessor will want to see.

> **Warning:** This section describes the idea, not the method. How your organisation classifies and qualifies tools is defined in its safety plan and tool qualification procedure, written by people who have the standard in front of them. Use those, not this book, for real decisions.

## The Ten Projects Through That Lens

Here is one way a safety team might reason about the book's tools. It's an example of the reasoning, not a classification:

| Tool | Could its error reach the product or hide an error? | How would the error be caught? | Evidence in this book |
| --- | --- | --- | --- |
| Requirements Reviewer | Only by missing a problem | Normal requirements reviews continue; findings are suggestions | Recall and precision on labels, five runs |
| Test Case Generator | Yes: a wrong limit in a test could pass a faulty product | Code checks every limit against the requirement; engineer review | Coverage and limit checks on every run |
| Spec Change Impact | Yes: a missed affected test leaves a change unverified | Affected tests found by code from the traces; Claude only judges actions | 26 of 26 on every run |
| HIL Log Analyzer | Yes: a wrong verdict could release a fault | Hand measurements, a new night, code review, edge-case logs | 12/12 verdicts, 28/28 values, two nights |
| Test Report Writer | Only through wrong text; verdicts come from the analyzer | Every number and ID checked by code; engineer reads it | Number checks on every run |
| Defect Triage | Yes: a severity too low could delay a safety fix | Severity is a suggestion; S1 decisions stay with people | Confusion matrix, five runs |
| FMEA Assistant | Yes: a missed failure mode | Expected list, engineer review, team workshop | Coverage against 16 expected modes |
| Knowledge Assistant | Only by misleading a person | Every quote checked against its source | Graded answers, quote checks |
| Test Database MCP Server | Only by a wrong answer to a person | Read-only access; answers checkable by SQL | Graded against SQL |
| Nightly Validation Assistant | Through its parts | The checks of each part, plus a person reviewing drafts | Graded on two nights |

The design choices of the earlier chapters now look like safety measures, because they are. The log analyzer, which has the highest potential impact, is plain code that can be reviewed, tested and versioned like any test tool; the AI was used to write it, not to run in it. The change impact analyzer uses code for the traceability that matters most. Wherever an error could reach the product, there's a code check or a hand-measured truth behind it.

## Process Standards: Evidence and Traceability

Process assessment models such as Automotive SPICE look at how work is done: are requirements analysed, are test cases derived from them and traced, are results recorded and reviewed, is consistency between work products ensured? AI tools change how the work products are made, not what the process needs. In practice that means:

- **Traceability must still be real.** A generated test case is traced to its requirement by an ID the code checked, not by a sentence the model wrote. Project 2's checks exist for this.
- **Reviews must still happen and be recorded.** "Generated by AI" is not a review. Record who reviewed the draft, when, and what they changed.
- **Records must show how a work product was created.** Keep the inputs, the prompt version, the model, the output and the check results, as every project in this book saves in its `output` folder.
- **Tools must be under control.** Prompts, schemas, checks and graders are part of the tool. Version them, and record which version produced which work product.

## When the Model Changes

A traditional software tool changes only when you install a new version. A tool built on an AI model can change when the provider releases a new model, or when you switch models to save cost. For a validated tool, that's a change to the tool. Treat it like one:

1. Pin the model ID in the code (every project in this book names its model explicitly).
2. Before changing it, rerun the grader with the new model and compare. Chapter 16 shows how.
3. Record the result and the decision.

The same goes for prompt changes. Every prompt change in this book was followed by a grading run; that habit is also your change-control evidence.

## Cybersecurity and AI Tools

Cybersecurity engineering asks you to consider threats to the development environment as well as to the product. AI tools add a few:

- **Prompt injection** through documents: a defect report or a supplier document containing instructions. Every prompt in this book treats documents as data, and the drafting tools have no tools of their own, so the worst case is a wrong draft, which the checks and reviews catch.
- **Over-broad permissions** for agents that can run commands. Chapter 8 showed that allowing `python3` is close to allowing everything; use a sandbox or a container.
- **Data leaving the company.** Chapter 3's rules apply.

## AI Regulation Itself

Laws about AI systems themselves are developing in many places, such as the European Union's AI Act. Whether and how they apply to internal engineering tools depends on the use and the jurisdiction, and it's a question for your legal team. Tools like the ones in this book, which draft for people who decide, are generally easier to justify than systems that make decisions on their own, and their records make that justification easier to show.

## Key Takeaways

- Use AI to explain, draft and check against text you control; don't use it to quote standards or to decide compliance.
- Safety standards ask for confidence in development tools in proportion to the harm their errors could cause and the chance of catching them. The graders in this book are tool validation evidence.
- Design so that high-impact steps are plain code or are checked by code, with AI used to write that code or to draft for review.
- Keep traceability real, reviews recorded, records complete and tools, including prompts, models and graders, under version control.
- Treat a model change as a tool change: rerun the graders before you switch.
