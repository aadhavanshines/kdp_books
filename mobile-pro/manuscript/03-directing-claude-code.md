# Chapter 3: Directing Claude Code on a Mobile Project

Claude Code can write a whole app in one sitting. Whether that app is any good depends mostly on what you give it before it starts and what you check after it finishes. This chapter shows the documents, prompts and review loop behind the five apps, so you can reuse them on your own projects.

## Three Documents Before the First Prompt

Every session in this book began with Claude reading three documents in the `docs` folder and the repository root.

**`docs/PRD.md`, the product requirements.** For each app it lists the screens and what each one must show and do, in the vocabulary of the category: "filters chips (Rating 4.0+, Fast delivery, Pure veg, Offers)", "veg/non-veg markers, bestseller tag, ADD buttons that turn into steppers", "a floating View cart bar with item count and total". The more precisely the PRD names the patterns users expect, the less Claude has to guess.

**`docs/DESIGN.md`, the design system.** Brand colors per app, the type scale, spacing, radii, elevation, the list of components, motion rules and icon set. It's short: a table and a few lists.

**`CLAUDE.md`, the project guide.** Claude Code reads this file automatically at the start of every session. It's where the project's layout, commands and rules live. Here it is as it stood at the end of the book; Claude itself added the demo login and environment details in session 1, which is exactly what you want from it:

```markdown
@include code/CLAUDE.md
```

Notice what the rules do. "Never hard-code a color in an app" forces every screen through the design system, so all four apps stay consistent and dark mode works. "Every screen works on Android, iOS and web" rules out libraries that would break the screenshots and keeps the apps portable. "Before saying a task is done, run typecheck, lint and tests" turns Claude's "done" into something you can trust. Each rule exists because, without it, an AI agent will cheerfully take the shortcut.

> **Tip:** Write rules as checkable facts, not wishes. "Use the design system" is a wish. "Never hard-code a color; use tokens from `@pro/ui`" is a fact Claude can follow and you can check with a quick search.

## Sessions Sized to One Milestone

The work was split into milestones, each a single Claude Code session:

1. The foundation: workspace, design system, backend and API client.
2. One session per app, in order of complexity: Platter, Cartly, Lumo, Minutely.
3. The TV app.
4. Short follow-up sessions for fixes found in review.

Why not one giant prompt? Because a session has a budget of time and context. Session 3, which built Cartly, ran for two hours and was stopped by the job runner before it finished; the next session had to complete its work. A milestone per session means each one ends with something whole, checked and committed.

## Running a Recorded Session

You'll normally use Claude Code interactively: type a prompt, watch it work, answer its questions, approve its plan. For this book, every session was run non-interactively so its prompt and result could be saved exactly. This small script did it:

```bash
@include sessions/run.sh
```

`claude -p` runs one prompt and exits. `--permission-mode auto` lets Claude work without stopping for approval at each step, while still blocking risky actions; use it only in a project folder you've backed up with Git, and review the results. `--output-format json` returns the final reply along with the number of turns, the duration and the cost, which is where every cost figure in this book comes from.

## Anatomy of a Good Session Prompt

Here is the prompt for session 1, which built the foundation for all four apps:

```text
@include sessions/01-foundation.prompt.md
```

It follows a pattern you'll see in every prompt in this book:

- **Context first:** read the three documents.
- **An ordered list of deliverables**, each with a check: "Build it in this order, and check each step before moving on."
- **Concrete numbers** where quality depends on them: "at least 24 restaurants with full menus, 60 products with reviews."
- **Explicit boundaries:** "Do not create the four apps yet."
- **The definition of done:** typecheck, lint and tests pass.
- **A request for a report:** what was built, the commands, and anything that differs from the docs.

That last item matters more than it looks. Claude's report from session 1 included a section headed "Where I differ from the docs." It explained that ESLint stayed on version 9 because Expo's config didn't support version 10 yet, that the server's order timeline was compressed so a delivery takes about two minutes, and that on an Android emulator the API address must be `10.0.2.2`. Those are exactly the decisions a lead engineer needs to hear about, and asking for them by name is how you get them.

## Make Claude Look at Its Work

Tests catch logic bugs. They don't catch a search hint sitting underneath its icon, or chips stretching across the whole screen. From session 2 onward, every app prompt asked Claude to export the app for the web after each screen, open it in a headless browser at phone size, take a screenshot, and compare it with the spec. The sessions reported what that caught:

- Session 1, rendering the design system: "a search hint under its icon, chips stretching full width".
- Session 2, Platter: tab labels clipped by a short tab bar, and toasts covering the cart bar.
- Session 4, Lumo: a timestamp wrapping onto two lines, and a hard-edged dark band at the top of stories.
- Session 5, Minutely: a header wrapping onto three lines, a search hint reading `Search "Search "bread""`, and a Pay button reading "Pay ₹683UPI".

None of those would have failed a test. All of them would have made the apps look amateur.

## Review Like a Lead

When a session finishes, don't just read "all tests pass" and move on. The review loop used throughout this book:

1. **Read the report,** especially anything Claude says it didn't do or did differently.
2. **Run the checks yourself:** `npm run check`. In this book, a check after session 4 caught one Cartly test failing only when the whole workspace ran in parallel; Claude had seen it pass alone.
3. **Look at every screenshot** at full size, as a picky user would.
4. **Commit** what's good, so the next session starts clean and any mistake is one command away from undone.
5. **Write a short follow-up prompt** for anything wrong, describing what you saw and where, and asking for the root cause rather than a patch.

The follow-up prompt for the flaky test is a good model:

```text
A flaky test. `npm run check` failed once in
apps/cartly/src/test/screens/orders-returns.test.tsx ("Order details ›
tracks the shipment live and lets you cancel before it ships") while the
whole workspace's tests ran in parallel; run alone it passes. Find the real
cause (timing, fake timers, shared state, SSE) and fix it properly, without
skipping the test or just raising timeouts. Prove it with several runs of
the full `npm test` from the root.
```

"Without skipping the test or just raising timeouts" closes the two easy exits an agent might take. "Prove it with several runs" defines done. Claude found the cause, fixed it, ran the full suite four times, and on the way found and fixed a second problem: one test file had been hanging for over a minute because of a background timer left running.

## Key Takeaways

- Give Claude a PRD, a design document and a `CLAUDE.md` before the first prompt; name the patterns users expect, and write rules as checkable facts.
- Size each session to one milestone, and end every session with checks passing and a commit.
- Good prompts give context, ordered deliverables with checks, concrete numbers, boundaries, a definition of done and a request for a report.
- Make Claude look at its screens in a browser at phone size; visual bugs don't fail tests.
- Review every session yourself: report, checks, screenshots, commit, follow-up.
