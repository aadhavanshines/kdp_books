# Introduction

Engineers write a great deal that isn't engineering. A validation engineer on a typical automotive program spends hours each week reviewing requirements, writing test cases, reading test logs, writing reports, sorting defect reports, and preparing for FMEA workshops. That work is necessary and must be careful. Much of it is also repetitive, and that is exactly where an AI model can help.

It is also where an AI model can do damage. A test case with an invented limit, a report with a number that isn't in the data, or an FMEA that quietly leaves out the worst failure mode will pass a quick glance and fail an audit, or worse, a vehicle. Engineering work has to be right, traceable and defensible. "The AI said so" is not a defence.

This book shows you how to get the help without the damage. You'll use **Claude** on real engineering work, and for every result you'll build a check that a reviewer would accept.

## What Makes This Book Different

**One product, the whole V.** Every project works on the same fictional product: the **WLC-200**, a smart window-lift controller made by **Ardent Drive Systems**, a fictional tier-1 supplier. It has an electric motor, anti-pinch protection, thermal protection, CAN messages and diagnostic trouble codes. The book creates its whole engineering record: two versions of a requirements specification, test suites with traces, two nights of hardware-in-the-loop (HIL) bench logs, thirty defect reports, an FMEA structure, lessons learned and a test database. You'll follow it from requirements to nightly test reports.

**Everything is real.** Every tool in this book was run for real while the book was being written, usually several times and with three different Claude models. The outputs you see are from those runs, shortened in places but not rewritten. When a tool failed, you'll see it fail, and you'll see what fixed it. Several of the most useful lessons came from those failures: an FMEA draft that turned into a defect list, a checker that couldn't tell a test point from a limit, a report that drew a wrong conclusion from a missing fact, and an answer file of mine that was wrong where the AI was right.

**Everything is checked by code.** Every project has a grader: a short program that compares the tool's output with answers an engineer worked out in advance. Requirements reviews are compared with an engineer's labels. Test cases are checked for coverage and for invented limits. Log measurements are recomputed. Report numbers are traced back to the data. FMEA ratings are never trusted for arithmetic: code computes every risk priority number. You'll see the scores, including the bad ones.

> **Note:** Claude's answers vary from run to run, even with the same instructions and data. Your results will differ in wording, and sometimes in substance, from those printed here. That is exactly why every project in this book is measured over several runs instead of trusted after one good one.

## Who This Book Is For

- **Validation, test and systems engineers** who want to automate the routine parts of their work without losing rigour.
- **Quality and safety engineers** who are asked whether AI can help with FMEAs, audits and lessons learned, and want an honest answer.
- **Engineering managers** who must decide where AI belongs in their process, how to measure it, and how to roll it out.
- **Software and tools engineers** who build the in-house tools their colleagues use every day.

The examples come from automotive electronics, but the methods apply to any regulated hardware or embedded product: medical devices, industrial controls, aerospace, rail or consumer electronics.

**Part I needs no programming.** From Part II onwards, the projects are short Python programs. If you can read a 50-line script and run it from a terminal, you can follow them. Each chapter explains the code it shows.

## What You'll Build

| Project | What it does | You'll learn |
| --- | --- | --- |
| 1. Requirements Reviewer | Finds ambiguous, untestable, conflicting and duplicate requirements | Labels, graders, precision and recall, quotes checked by code |
| 2. Test Case Generator | Writes traced test cases for every requirement | Coverage checks, catching invented limits, structured output |
| 3. Spec Change Impact | Finds what changed between versions and which tests are affected | Code for the facts, AI for the judgement |
| 4. HIL Log Analyzer | Measures pass/fail and anomalies from bench logs | Having Claude Code write the analysis, then proving it |
| 5. Test Report Writer | Writes a Word report with tables and trend charts | Fact sheets, checking every number in AI text |
| 6. Defect Triage | Suggests component, severity and duplicates | Confusion matrices, where a person must decide |
| 7. FMEA Assistant | Drafts design FMEA rows for a team workshop | Method over memory, code for RPN, engineer review |
| 8. Knowledge Assistant | Answers questions from lessons learned and procedures | Verified quotes, saying "the documents don't say" |
| 9. Test Database MCP Server | Lets Claude query the test database safely | MCP, read-only tools, answers checked by SQL |
| 10. Nightly Validation Assistant | Turns a night of logs into a report and defect drafts | Putting it together, running it every night |

## How This Book Is Organized

**Part I: Foundations** explains where AI helps engineering work and where it doesn't, the ways to use Claude, what you may and may not send to an AI service, and how to prompt for precise engineering work. No code is needed.

**Part II: The Requirements-to-Test Chain** builds the first three projects: reviewing requirements, generating traced test cases, and analysing the impact of a specification change.

**Part III: Test Data and Results** works with what the test bench produces: logs, reports and defects.

**Part IV: Safety and Knowledge** covers FMEA, a knowledge assistant for lessons learned, and how to work with standards such as ISO 26262 and Automotive SPICE responsibly.

**Part V: Tools for the Team** turns the projects into tools other people can use: an MCP server for the test database, a nightly validation assistant, a method for evaluating engineering AI that will stand up in a review, and a plan for rolling it out.

The appendices hold a prompt library, checklists, troubleshooting, a glossary, resources and a guide to the sample data.

Each chapter starts with a level label (Beginner, Intermediate, Advanced or All levels), so you always know where you are.

## What You Need

- A computer running Windows, macOS or Linux.
- Python 3.10 or newer.
- A Claude account. Part I works with a chat account; the projects need either an Anthropic API key or Claude Code. Chapter 2 explains the options.
- The book's project files, which include all the sample data. Appendix F describes them.

Running every project in this book once with Claude Sonnet 5.5 costs about two US dollars at October 2026 prices. Each chapter reports the cost of its own runs.

## A Word About Responsibility

The tools in this book draft, suggest and check. They don't approve. Every requirement review, test case, report, defect, FMEA row and answer in this book is a draft for an engineer who remains responsible for it. That isn't a legal disclaimer added at the end; it is the design principle of every project, and Chapter 17 shows how to keep it true when the tools are used by a whole team.

Let's start with the question every engineering manager asks first: where does AI belong in engineering work, and where doesn't it?
