# Introduction

A few years ago, building an app meant months of learning a programming language before you could make anything useful. Today you can open a terminal, type "Build me a tip calculator that works on my phone," and have a working app twenty seconds later.

That shift has a name: **vibe coding**. You describe what you want in plain language, an AI writes the code, and you steer by trying the result and saying what to change. In 2025, Collins Dictionary chose "vibe coding" as its Word of the Year, because millions of people, most of whom had never written a line of code, had started building software this way.

This book teaches you to vibe code well, using **Claude Code**, Anthropic's AI coding tool. "Well" is the important word. It is easy to get an AI to produce code. It is harder to get code that actually works, keeps working when you change it, doesn't leak your passwords, and does what you meant rather than what you typed. The difference between those two outcomes is a set of skills, and those skills are what this book is about.

## What Makes This Book Different

**Everything is real.** Every prompt in the project chapters was run in Claude Code while this book was being written. The replies you see are Claude's actual words, shortened in places to save space but not rewritten. When Claude made a mistake, said it hadn't tested something, or worked around a safety rule, you'll see that too, because those moments teach more than any perfect demo.

**Everything is tested.** All six apps you'll build were checked independently: in a real web browser, on phone-sized screens, with an accessibility checker, in different time zones, through the real Anthropic software library, and by running the production server. The code listings in this book are printed directly from those tested files.

**It goes from basic to advanced.** You'll start by learning what a file and a terminal are. By the end, you'll be teaching Claude your project's rules, building custom commands and AI reviewers, adding automatic safety checks, connecting Claude to a web browser, putting apps online, building a mobile app for iPhone and Android, preparing it for the app stores, and managing releases like a professional team.

> **Note:** Claude's replies vary from run to run, even for the same prompt. Your code and wording will differ from what's printed here. That's normal. What matters is the process: how you ask, how you check, and how you correct course.

## Who This Book Is For

- **Complete beginners** who have an idea for an app and no idea where to start.
- **Students** who want to build projects for school, a portfolio, or fun.
- **Professionals** in any field (marketing, finance, healthcare, engineering, teaching) who want to build their own tools instead of waiting for someone else to.
- **Founders and makers** who want to turn ideas into working prototypes quickly.
- **Developers new to AI tools** who want a structured tour of Claude Code's features, from basic prompting to hooks, skills, subagents, and MCP.

You don't need any programming experience. You do need curiosity, patience for the occasional error message, and a willingness to test what the AI gives you.

## What You'll Build

| Project | What it does | You'll learn |
| --- | --- | --- |
| 1. Tip Calculator | Splits a restaurant bill on your phone | Your first app, iterating, asking Claude to check its work |
| 2. To-Do App | A task list that remembers your tasks, with due dates | Plan mode, multi-file apps, saving data in the browser |
| 3. Expense Tracker | A command-line tool that tracks spending | Python, automated tests, friendly error messages |
| 4. Habit Tracker | A full web app with a database and streaks | Specs, back ends, debugging, deployment, guardrails |
| 5. Study Buddy | Turns your notes into flashcards using Claude | Calling an AI from your own app, API keys, security |
| 6. Sip | A water tracker app for iPhone and Android | Mobile apps with Expo, testing on phone-sized screens, app store submission |

## How This Book Is Organized

**Part I: Getting Started** explains what vibe coding is, how software works (just enough to be dangerous), how to install Claude Code, and how to have your first conversation with it.

**Part II: Building Real Apps** walks through the first four projects, plus the core skills of good prompting, UI and UX design with accessibility, debugging, testing, and saving your work with Git.

**Part III: Ship It and Level Up** covers building an AI-powered app, putting apps online, and Claude Code's power features: project memory, skills, subagents, hooks, and MCP.

**Part IV: Mobile Apps** builds an app for Android and iPhone from one codebase, and takes it through the release process for Google Play and the Apple App Store.

**Part V: Working Like a Pro** covers the software development lifecycle (from idea to versioned release and maintenance), automation, larger codebases, security, and the habits that turn a vibe coder into a builder.

The **appendices** contain a best practices checklist, a library of 40 prompts, a troubleshooting guide, a Claude Code cheat sheet, a glossary, and a list of official resources.

## Choose Your Reading Path

| If you are... | Read |
| --- | --- |
| New to coding | Every chapter, in order. Don't skip Chapter 2. |
| Comfortable with computers but new to coding | Skim Chapter 2, then read in order from Chapter 3. |
| A developer new to Claude Code | Chapters 3, 4, and 7, then Parts III to V. |
| Mainly interested in AI apps | Chapters 1 to 7, then Chapter 14. |
| Mainly interested in mobile apps | Chapters 1 to 8, then Chapters 20 and 21. |

## Conventions Used in This Book

Prompts you type into Claude Code appear in shaded boxes:

```
Create a tip calculator as a single file called index.html.
```

Claude's real replies appear in boxes labeled "Claude's reply":

```
Claude's reply:
I created index.html in the project directory. I haven't opened
it in a browser, so it's untested.
```

Commands you type into your computer's terminal also appear in shaded boxes. Type them exactly as shown, then press Enter:

```
claude --version
```

Inside a prompt, text in angle brackets such as `<your app idea>` is a placeholder: replace it, brackets included, with your own words.

You'll also see four kinds of notes:

> **Tip:** A shortcut or a better way to do something.

> **Try It:** A short exercise. Doing these is the fastest way to learn.

> **Warning:** A mistake that can cost you time, money, or data.

> **Note:** Useful background or context.

## A Note on Time and Change

AI tools change quickly. This book describes Claude Code as it was in October 2026 (version 2.1). Menus get renamed, commands get added, and models get smarter. The skills in this book (describing clearly, planning, verifying, and staying safe) don't expire. When something on your screen looks different from the book, type `/help` in Claude Code or check the official documentation listed in Appendix F.

## What You'll Need

- A computer running macOS, Windows, or Linux.
- An internet connection.
- A paid Claude plan that includes Claude Code, or an Anthropic Console account with API credits. Chapter 3 explains the options.
- A few hours a week. Each project chapter takes an evening or two.

Let's start building.
