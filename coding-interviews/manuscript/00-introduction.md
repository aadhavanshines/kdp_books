# Introduction

Every year, hundreds of thousands of people apply for software engineering jobs at the world's best-known technology companies. Most of them will face the same kind of test: a problem they have never seen, a shared editor or whiteboard, about 45 minutes, and an engineer watching how they think. Some candidates freeze. Others solve the problem and still don't get an offer, because they never explained what they were doing. A smaller group walks in with a plan, recognizes the shape of the problem, talks through their reasoning, writes clean code, tests it, and improves it when asked.

This book is about joining that last group.

## What Makes This Book Different

**Every problem is original.** The 120 problems in this book were written for it. They cover the classic ideas every interviewer draws on, such as hashing, two pointers, graphs and dynamic programming, but with new stories, new data and new wording. You won't find them copied from a website, and you won't find claims that "Company X asked this exact question". Nobody can honestly promise that, and memorizing a list of past questions is not how strong candidates prepare.

**Every solution is tested.** Each problem is a real Python file. Every solution in the book was run on Python 3.12, 3.13, 3.14 and 3.15 against its examples, and then against hundreds of random inputs, compared with a slower brute-force solution that is easy to trust. The examples you see printed were produced by running the code, so the output on the page is what the program really returns. Along the way, those random tests caught real bugs in early drafts. A few of those bugs appear in this book as **Common Mistake** boxes, because they are exactly the bugs you might write under pressure.

**You learn patterns, not answers.** Most interview problems are variations on about twenty ideas. Part II teaches those ideas one chapter at a time, each with a short template you can adapt, the signals that tell you the pattern applies, and six problems from easy to hard.

**It covers the whole interview.** Coding rounds are only part of the process. Part III covers practical coding rounds, object-oriented design, system design, behavioral interviews, AI-assisted interviews and take-home assessments. Part IV puts everything together in four complete mock interviews and a study plan.

## How the Book Is Organized

- **Part I, Getting Ready:** how big technology companies interview today, a six-step method for any coding problem, Big-O analysis without fear, and the parts of Python that matter most in interviews.
- **Part II, The Patterns:** eighteen chapters, from arrays and hashing to designing your own data structures, with 109 problems.
- **Part III, Beyond Algorithms:** practical, "real-world" coding rounds, object-oriented design, system design, behavioral questions, and new formats such as AI-assisted interviews.
- **Part IV, Practice:** four full mock interviews, with the conversation between candidate and interviewer, and a study plan for two, six or twelve weeks.
- **Appendices:** a pattern cheat sheet, a complexity reference, a guide to writing the same solutions in Java and C++, an index of every problem, and a glossary.

## How Each Problem Is Presented

Every problem follows the same structure, so you always know where to look:

1. **The problem**, with a short story, the exact task and the rules.
2. **Examples**, shown as an interactive Python session.
3. **Think first**, a hint to try before reading on.
4. **The brute-force idea**, because in a real interview, a correct slow solution is the starting point.
5. **The better idea**, explained in plain words.
6. **The solution**, the tested code.
7. **Complexity**, the time and space it needs.
8. **Common Mistake** and **Follow-Up** boxes: what goes wrong, and what an interviewer might ask next.

> **Tip:** Don't just read the solutions. Cover the page, set a timer for 25 minutes, and solve each problem yourself first: out loud, as if someone were listening. Then compare. Reading a solution feels like learning; solving a problem is learning.

## The Code

All the code is in Python, the language most candidates choose for interviews because it is short and readable. If your interview will be in Java or C++, read the solutions for the ideas, and use Appendix C to translate the Python tools into their equivalents. Each solution is written the way you would write it in an interview: clear names, short comments where they help, and no clever tricks that you couldn't explain.

A few helper pieces are shared across chapters: a `ListNode` class for linked lists, a `TreeNode` class for trees, and small functions that build them from Python lists. They are introduced where they are first used. The examples for linked-list and tree problems call a small wrapper that builds the structure from a list, runs the solution, and turns the answer back into a list, so that you can read the input and output at a glance.

## A Note on Companies and Dates

This book refers to Google, Meta, Amazon, Apple, Microsoft, SpaceX and other companies when describing how interviews work. Where a company publishes its own guidance for candidates, the book relies on it and says so. Where information comes only from candidates' reports, the book says that too. Interview formats change, especially as AI tools spread, so always confirm the details with your recruiter. The descriptions in this book reflect what was published as of **October 2026**.

Let's start with what actually happens in a technical interview at a large technology company.
