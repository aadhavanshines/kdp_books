# Appendix A: Prompt Library for Vibe Coders

This appendix collects 40 prompts for Claude Code, organized by task. Replace the parts in angle brackets with your own details. Add context generously, and whenever you can, finish with how Claude should check its work.

## Starting a Project

**Prompt 01: Interview me.** *Use when you have an idea but not a clear picture.*

```
I want to build <brief description>. Interview me about it, one
question at a time. Ask about features, users, edge cases, and
anything I might not have considered. When we're done, write a
complete spec to SPEC.md.
```

**Prompt 02: Build from a spec.** *Use when you have a written spec.*

```
Read SPEC.md and build the app it describes. Work in small steps,
with tests for each step. Run the tests after each step and fix
any failures. Finish by starting the app and checking that it
responds.
```

**Prompt 03: A single-file web app.** *Use for quick tools that run in the browser.*

```
Create <app> as a single file called index.html, with no external
libraries. It should <behavior>. It must work well on a phone.
```

**Prompt 04: Plan first.** *Use in plan mode before a multi-file build.*

```
I want to build <app> with <technology>. Features: <bulleted
list>. Make a plan first: the files, how data is stored, and how
you'll test it. Don't write code until I approve.
```

**Prompt 05: Set up the basics.** *Use when starting any new folder.*

```
Set up this folder as a new <language> project: a virtual
environment if needed, a suitable .gitignore, a README with how
to run it, and Git with a first commit.
```

**Prompt 06: Choose an approach.** *Use when you're unsure how to build something.*

```
I want to <goal>. Describe two or three different ways to build
it, with the main advantages and risks of each for a beginner.
Recommend one. Don't write any code yet.
```

## Building Features

**Prompt 07: Add a feature.** *Use for any new behavior.*

```
Add <feature>. It should <behavior>. <Context Claude can't see>.
Don't <constraint>. When you're done, <how to verify>, and show
me the result.
```

**Prompt 08: Keep old data working.** *Use when a feature changes what's stored.*

```
Add <feature>. Data saved by the current version must still load
and work correctly. Test with old-format data.
```

**Prompt 09: Follow existing patterns.** *Use in projects that already have conventions.*

```
Add <new thing> following the same pattern as <existing similar
thing>. Read that first and match its style and structure.
```

**Prompt 10: Improve the design.** *Use when the app works but looks rough.*

```
Make the page look clean and modern: <specific goals, e.g. more
white space, one accent color, larger text on phones>. Keep all
features and the layout structure the same.
```

**Prompt 11: Match a screenshot.** *Use with a pasted image of a design.*

```
Here's a design I like: <paste image>. Restyle the page to match
it as closely as you can. Take a screenshot of the result if you
can, compare, and list any differences.
```

**Prompt 12: Make it accessible.** *Use before sharing any app.*

```
Review this app for accessibility: keyboard use, screen readers,
color contrast, labels, and touch targets on phones. Fix the
important issues and list what you changed.
```

## Understanding Code

**Prompt 13: Project tour.** *Use when opening a project you didn't write.*

```
Give me a tour of this project: what it does, how it's organized,
how to run it and its tests, and which files to read first. Don't
change anything.
```

**Prompt 14: Explain a change.** *Use after every change you don't fully understand.*

```
Explain the changes you just made, file by file, as if I'm new to
coding. Why did you make each one?
```

**Prompt 15: Trace a flow.** *Use to understand how a feature works end to end.*

```
Walk me through what happens, step by step and file by file, when
a user <action>. Don't change anything.
```

**Prompt 16: Quiz me.** *Use to check your own understanding.*

```
Ask me five questions about how this project works, one at a
time. After each answer, tell me what I got right and wrong.
```

**Prompt 17: Explain an error.** *Use when an error message makes no sense.*

```
Explain this error in plain English: what it means, the most
likely cause in this project, and how to fix it. <paste error>
```

## Debugging

**Prompt 18: Fix a bug properly.** *Use for any bug.*

```
Bug: when I <steps>, I expect <expected>, but I see <actual>.
Full error: <paste>. Find the cause. Before changing app code,
write a test that fails because of this bug. Then fix it, run all
the tests, and explain the cause in plain English.
```

**Prompt 19: Hypotheses first.** *Use when a fix didn't work.*

```
Don't change anything yet. List the three most likely causes of
this problem, and how we could test each one. Then test them in
order.
```

**Prompt 20: Add visibility.** *Use when you can't see what's going wrong.*

```
Add temporary logging that shows the values at each step of
<feature>, run it with <input>, and show me the output. Remove the
logging when we're done.
```

**Prompt 21: Find what broke it.** *Use when something used to work.*

```
<Feature> worked a few commits ago and is broken now. Look at the
recent commits and find which one broke it, then explain how.
```

**Prompt 22: Works on my machine.** *Use before deploying, or for bugs only others see.*

```
What could behave differently when this runs on a server, in
another time zone, on a phone, or in another browser? Check the
code for each and list real risks.
```

**Prompt 23: Fresh start.** *Use after two failed attempts, in a new session.*

```
Read NOTES.md, which describes a bug and what we've tried so far.
Investigate it with fresh eyes. Don't repeat approaches that
already failed.
```

## Testing

**Prompt 24: Add tests.** *Use for code without tests.*

```
Write tests for <file or feature>, including edge cases: empty
input, zero and negative numbers, special characters, and dates.
Run them and fix any real bugs they reveal.
```

**Prompt 25: Test first.** *Use before building a feature.*

```
Write tests for <feature> that describe the behavior I want:
<behaviors>. Run them and confirm they fail. Don't implement the
feature yet.
```

**Prompt 26: Make them pass.** *Use after reviewing the tests from Prompt 25.*

```
Implement <feature> so all the tests pass. Don't change the tests.
If you think a test is wrong, stop and explain why.
```

**Prompt 27: Browser tests.** *Use for web apps.*

```
Add Playwright browser tests (Python, pytest) for the most
important user journeys in this app. Set up what's needed, run
them, and show me the results.
```

**Prompt 28: Find the gaps.** *Use to strengthen an existing test suite.*

```
What are the five most important behaviors of this app that have
no test yet? Write tests for them and run them.
```

## Git and GitHub

**Prompt 29: Save a version.** *Use whenever things work.*

```
Commit these changes with a clear message explaining why.
```

**Prompt 30: Undo safely.** *Use when a change went wrong.*

```
Discard all uncommitted changes and remove any new files you
created since the last commit. Show me git status afterwards.
```

**Prompt 31: Open a pull request.** *Use for any finished feature on a branch.*

```
Push this branch and open a pull request with a summary of what
changed, why, and how it was tested.
```

## Security and Quality

**Prompt 32: Security review.** *Use before sharing anything.*

```
Do a security review of this app, assuming it will be <how it
will be used>. Look at secrets, input handling, access control,
dependencies, and error messages. Fix what's important, and list
what you chose not to fix and why.
```

**Prompt 33: Check dependencies.** *Use every few months.*

```
List this project's dependencies, check for outdated or
vulnerable versions, and confirm each one is a real, well-known
package. Recommend updates but don't apply them yet.
```

**Prompt 34: Simplify.** *Use when code has grown messy.*

```
Simplify <file> without changing what it does. Run the tests
before and after each step, and stop if anything fails.
```

**Prompt 35: Second opinion.** *Use with a reviewer subagent before committing.*

```
Use a subagent to review my uncommitted changes for bugs,
security problems, and missing tests. Report only issues that
affect correctness or security.
```

**Prompt 36: Update the memory.** *Use after fixing a tricky bug.*

```
Add a short rule to CLAUDE.md so the mistake we just fixed
doesn't happen again. Keep it to one or two lines.
```

## Deployment and Automation

**Prompt 37: Prepare to deploy.** *Use before putting a dynamic app online.*

```
I want to deploy this app on <host or "a hosting service">. First
explain in plain English what I need to change and what could go
wrong, especially with data and secrets. Then make the changes
and test the production setup locally.
```

**Prompt 38: Pre-launch check.** *Use right before sharing a live app.*

```
Review this app against a pre-launch checklist for a small public
web app: debug mode, secrets, data persistence, backups, rate
limits, costs, privacy, and rollback. Tell me what's missing.
```

**Prompt 39: Add CI.** *Use for any project on GitHub.*

```
Add a GitHub Actions workflow that installs the dependencies and
runs the tests on every push and pull request.
```

**Prompt 40: Write a hook.** *Use for rules that must always be enforced.*

```
Write a Claude Code hook in .claude/settings.json that <rule>.
Write the script in Python so it works on any OS, test it with
sample input, and tell me what it does not cover.
```
