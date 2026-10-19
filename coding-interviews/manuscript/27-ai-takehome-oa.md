# Chapter 27: AI-Assisted Rounds, Take-Homes and Online Assessments

Not every coding test is a live conversation at a whiteboard. Many candidates meet an **online assessment** before talking to anyone; some roles use a **take-home project**; and a growing number of companies run **AI-assisted rounds**, where using an AI coding assistant is part of the test. Each format rewards slightly different habits. This chapter covers all three.

## Online Assessments

An online assessment (OA) is a timed test on a coding platform, usually taken alone at home: typically two to four problems in 60 to 120 minutes, graded automatically against hidden test cases. They are common for internships, new graduate roles and high-volume hiring, where they decide who gets a live interview.

How to do well:

- **Read every problem first**, then solve the easiest one. Partial credit usually depends on the number of hidden tests passed, so a fully working easy problem beats a half-finished hard one.
- **Check the limits** in the statement. An input of up to 10⁵ items rules out O(n²); up to 20 items invites backtracking. Chapter 3 has a table of what fits.
- **Write a brute force first** if the optimal solution isn't clear; it may pass most tests, and it's useful to check the faster version.
- **Test edge cases yourself**: the empty input, one element, all equal, the maximum size. Hidden tests always include them.
- **Know your language's input handling.** Some platforms give you a function to complete; others make you read standard input. Practice both.
- **Practise in the same conditions**: a timer, no autocomplete, and no outside help unless the instructions allow it.

> **Warning:** Follow the rules of each test exactly. If an assessment says no outside help, using an AI assistant or searching for the problem is cheating. Companies use proctoring, plagiarism checks and follow-up interviews that ask you to explain your submitted code. Being caught ends the process, and a solution you can't explain is worthless in the next round anyway.

## Take-Home Projects

A take-home asks you to build something small, such as a command-line tool, an API endpoint or a data-processing script, over a few hours or days. It's closer to real work than any other format, and it's graded like real work.

What reviewers look at, roughly in order:

1. **Does it work?** Can they run it from your README in two minutes?
2. **Is it tested?** A focused set of tests is a strong signal; none is a red flag.
3. **Is it readable?** Clear structure, names and small functions, as in Chapter 23.
4. **Did you make sensible trade-offs, and explain them?** A short "Design notes" section in the README: what you assumed, what you left out, and what you would do with more time.

> **Tip:** Respect the time limit. If the instructions suggest four hours, a 20-hour masterpiece isn't what's being asked for, and it can raise questions about how you prioritize. Do the core well and list the extensions in the README.

Take-homes are usually followed by a review conversation. Expect "walk me through your design", "why did you choose this library?" and "how would you add feature X?". Re-read your own code before that call.

## AI-Assisted Rounds

Some companies now include an approved AI assistant in technical interviews. Meta's hiring process page says that select roles include an authorized AI assistant within the coding environment during technical interviews, and that candidates can practise in the same tool beforehand. Candidates who have taken such rounds describe a longer session, around an hour, built around a small multi-file codebase and a task with several stages, such as fixing a bug, adding a feature and extending it; they report being judged on problem solving, code quality, how they verify the assistant's output, and communication. Those details come from candidates' reports rather than official descriptions, and formats differ between companies and roles, so ask your recruiter exactly what to expect.

What changes when an assistant is allowed:

- **Typing speed matters less; judgement matters more.** The assistant writes code quickly. Your job is to decide what to ask for, to notice when its answer is wrong, and to keep the overall design coherent.
- **Reading code becomes central.** You must understand an unfamiliar codebase quickly, and review generated code as carefully as a colleague's pull request.
- **Verification is visible.** Interviewers watch whether you run the code, write tests, and check edge cases, or simply accept what the assistant produced.

### A Good Workflow

1. **Understand before you prompt.** Read the task and the relevant files. Say aloud what you think needs to change.
2. **Ask for small, specific pieces**: "write a function that returns the k most frequent tags, ties broken alphabetically", not "solve the problem".
3. **Review every line.** Check edge cases, complexity, and whether the code fits the existing conventions.
4. **Test.** Run the existing tests, and ask the assistant to write new ones, then check that those tests actually test something.
5. **Explain.** Narrate your decisions, including when you reject a suggestion and why.

### Catching an Assistant's Mistake

Here is the kind of moment these rounds are designed to create. A candidate asks for a prefix check on the trie from Chapter 20, and the assistant suggests:

```python
def has_prefix(self, prefix):
    return self._walk(prefix) is not None
```

It looks right, and it passes the obvious tests. A strong candidate tries the edge cases out loud: "What about the empty prefix on an empty trie? `_walk("")` returns the root, which exists, so this says some word starts with the empty string, even though there are no words at all." The fix, `return bool(self._walk(prefix))`, works because the root of an empty trie is an empty dictionary.

This is exactly the bug the book's own random tests found in an early version of Problem 20.1. The lesson for AI-assisted rounds: an assistant makes the same kinds of mistakes people do, especially on edge cases, and your value is in catching them.

> **Interviewer's View:** In an AI-assisted round, "I'd like to check that before we move on" is one of the strongest things you can say. Accepting large blocks of generated code without reading them is one of the weakest.

### How to Practise

- Use an AI coding assistant on the problems in this book, but only *after* solving each problem yourself, then compare and critique its solution.
- Practise reading unfamiliar code: open a small open-source project, pick an issue, and find the relevant files within 15 minutes.
- Use the practice environment the company provides, if there is one, so that the tool itself holds no surprises on the day.

## Key Takeaways

- Online assessments: solve the easy problems fully, respect the limits, and test edge cases yourself.
- Take-homes: working, tested, readable code with a clear README, within the time suggested.
- AI-assisted rounds reward judgement, code reading and verification, not typing.
- Follow every format's rules on outside help exactly.
- In every format, you must be able to explain every line you submit.

## Sources

- Meta careers: hiring process page and software engineering interview preparation pages (authorized AI assistant for select roles; practice environment).
- Descriptions of AI-assisted rounds beyond Meta's own pages are based on candidates' reports published in 2025 and 2026 and may change.
