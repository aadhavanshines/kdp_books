# Appendix A: Best Practices Checklist

This appendix collects the book's best practices in one place, grouped by stage of work. Use it as a checklist before you start a project, before you share it, and before every release. The chapter numbers show where each topic is explained in detail.

## Prompting and Planning (Chapters 6, 7, and 22)

- Picture the result first: who uses it, where, with what inputs and outputs.
- Include the four ingredients: goal, context, constraints, and what "done" looks like.
- Give Claude a way to check its own work: tests, examples, or a command to run.
- For anything bigger than a small fix, explore and plan before building, in plan mode.
- Write requirements down, with edge cases, in a spec or an issue.
- Let Claude interview you when the idea is still vague.
- After two failed corrections, rewind, `/clear`, and write a better first prompt.

## Building (Chapters 5 to 10)

- Build in thin slices, and commit after each one that works.
- Ask for backward compatibility whenever stored data changes shape.
- Keep tricky logic (dates, money, totals) in small pure functions that are easy to test.
- Follow the project's existing patterns; point Claude at them.
- Read what Claude says it didn't test, and test that yourself.
- Ask "why?" until you understand each change.

## UI, UX, and Accessibility (Chapter 8)

- Name the users and their situations: phones, screen readers, poor eyesight.
- Aim for WCAG 2.2 AA: text contrast of at least 4.5:1, labels on every control.
- Make touch targets at least 44 by 44 pixels (or points), and measure them.
- Never rely on color alone to carry meaning.
- Check layouts at 320 and 390 pixels wide, and at 200 percent zoom.
- Make destructive actions forgiving: confirmation, or better, Undo.
- Match accessibility labels to the visible text so voice control works.
- Spend five minutes with a screen reader and a keyboard before you share.

## Testing (Chapters 11 and 12)

- Write a failing test before fixing a bug, and keep it.
- Test the awkward cases: empty input, zero, huge numbers, special characters, other time zones, midnight, old data.
- Test real interactions in a real browser, not only simulated ones.
- Freeze or pass in the clock so date tests are repeatable.
- Automate measurable rules: target sizes, axe-core, contrast.
- Run the tests before and after every change, and in CI on every push.
- Never let Claude change a test just to make it pass without explaining why.

## Debugging (Chapter 11)

- Reproduce first, with exact steps and the full error message.
- Ask for hypotheses before changes when a fix didn't work.
- Fix the cause, not the symptom, and prove it with a test.
- Start a fresh session with notes when a conversation gets cluttered.

## Git and Collaboration (Chapters 13 and 22)

- Commit early and often with clear messages that say why.
- Use one branch per feature or fix, merged through a pull request.
- Write pull request descriptions: what changed, why, and how it was tested.
- Understand every line you submit to someone else's project.
- Use issue templates, and triage new issues regularly.

## Working with Claude Code (Chapters 16 to 19 and 24)

- Keep a short, current CLAUDE.md with commands, rules, and architecture.
- Use `/clear` between unrelated tasks, and `/compact` with a focus when needed.
- Use subagents for heavy reading and for independent reviews.
- Put rules that must always hold in hooks and permission rules, not just instructions, and test them.
- Turn repeated workflows into skills.
- Connect tools through MCP only from sources you trust.

## Security and Privacy (Chapters 14, 15, 21, and 25)

- Never put secrets in code or Git; use environment variables and `.gitignore`.
- Keep API keys on the server, never in the browser or the app.
- Validate all input on the server, and escape output.
- Set limits on anything that costs money, such as AI calls.
- Review security before you share anything, every time.
- Collect as little data as possible, and describe it honestly in a privacy policy.
- Check that every dependency is real, well known, and up to date.

## Deploying Web Apps (Chapter 15)

- Turn off debug mode and use a production server.
- Store data on a persistent disk or a managed database, with backups.
- Keep secrets in the host's environment settings.
- Test the production setup locally before deploying.
- Know how to roll back to the previous version.

## Mobile Apps and App Stores (Chapters 20 and 21)

- Choose deliberately between a mobile web app, cross-platform, and native.
- Respect phone settings: dark mode, text size, screen readers.
- Re-check time-sensitive state when the app returns to the foreground.
- Choose the application ID carefully; it's permanent.
- Request the fewest permissions, and verify them in the generated manifest.
- Answer the stores' privacy questions accurately, including third-party libraries.
- Test the release build on real iPhone and Android devices.
- Start Google Play's closed test early; use TestFlight for iPhone testers.
- Roll out gradually, and watch crash reports.
- Confirm current store rules in the consoles before each submission.

## Releasing and Maintaining (Chapter 22)

- Follow semantic versioning, with the version kept in one place.
- Keep a changelog, updated in the same change as the code.
- Write down the release steps, follow them every time, and tag every release.
- Test in a safe environment (staging, preview, or a testing track) before production.
- Update dependencies regularly and apply security fixes promptly.
- Monitor errors and uptime, back up data, and test a restore.
- Keep README, SPEC.md, CHANGELOG.md, and CLAUDE.md current.
