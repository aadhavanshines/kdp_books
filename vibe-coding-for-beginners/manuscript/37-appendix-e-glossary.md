# Appendix E: Glossary

**Accessibility.** Designing apps so people with disabilities can use them, for example with screen readers, keyboards, zoom, or voice control.

**Agent.** An AI system that takes a goal, decides on steps, uses tools to carry them out, checks the results, and repeats until done. Claude Code is an agent.

**Android App Bundle (AAB).** The file format Google Play requires for new apps; Google builds the final app for each device from it.

**API (application programming interface).** An agreed set of requests and responses that lets one program use another, such as a web page asking a server for data.

**API key.** A secret string that identifies you to a paid service, such as the Claude API. Treat it like a password.

**Application ID.** An app's permanent identifier in the app stores: the package name on Android and the bundle identifier on iOS, such as `com.vibecodingbook.sip`.

**Auto memory.** Notes Claude Code saves for itself about your preferences and project, loaded in future sessions.

**Auto mode.** A permission mode in which Claude acts without asking, while a separate safety checker reviews its actions.

**Backend-as-a-service.** A platform, such as Firebase or Supabase, that provides sign-in, a database, server code, and storage, so you don't have to build them yourself.

**Back end.** The part of an app that runs on a server: it stores data and enforces rules.

**Branch.** A separate line of work in Git, so changes can be made without affecting the main version.

**Bug.** A mistake in software that makes it behave differently from what was intended.

**Build number.** A whole number that must increase with every upload of an app to a store, separate from the version users see.

**Changelog.** A file listing the notable changes in each version of a project.

**Checkpoint.** A snapshot Claude Code takes before changing files, which you can rewind to.

**CI (continuous integration).** Automatically running tests on every change, for example with GitHub Actions.

**CLAUDE.md.** A file of project instructions that Claude Code reads at the start of every session.

**Command line (terminal).** A text window for typing commands to your computer.

**Commit.** A saved snapshot of a project in Git, with a message describing the change.

**Content-Security-Policy (CSP).** A header that tells the browser exactly where a page may load scripts, styles, images, and frames from, blocking everything else.

**Context window.** Everything the AI can see at once: the conversation, files it has read, and command output.

**Contrast ratio.** How different two colors are in brightness. WCAG AA asks for at least 4.5:1 for normal text.

**Cross-platform.** Built from one codebase to run on several platforms, such as iPhone and Android.

**CSS.** The language that controls how web pages look.

**Database.** An organized store of data that survives restarts. SQLite keeps a database in a single file.

**Dependency.** A package your project needs in order to run.

**Deploy.** To put an app on a server so others can use it.

**Design system.** The shared tokens (colors, type, spacing) and components that make every screen of an app look like one product.

**Diff.** A line-by-line view of what changed between two versions of a file.

**EAS (Expo Application Services).** Expo's cloud service for building, signing, and submitting mobile apps.

**Edge case.** An unusual input or situation, such as an empty list or a date at midnight, where bugs often hide.

**Effort.** A Claude Code setting, from low to max, for how much the model thinks before and during each step.

**Environment (staging, production).** A separate copy of an app for a purpose: development for building, staging for testing, production for real users.

**Environment variable.** A named setting passed to programs by the system, often used for secrets and configuration.

**Expo.** A popular set of tools for building React Native apps for iPhone, Android, and the web.

**Firestore.** Firebase's document database, protected by security rules.

**Front end.** The part of an app you see and interact with, usually running in a browser.

**GitHub Actions.** GitHub's automation system, which runs workflows such as tests on events like a push.

**GitHub.** A website for storing Git repositories, collaborating, and running automation.

**Git.** The most widely used version control system.

**Headless mode.** Running Claude Code once without a conversation, with `claude -p`.

**HMAC.** A signature computed from a message and a secret key; payment providers use HMAC-SHA256 to prove a message really came from them.

**Hook.** A script Claude Code runs automatically at a specific moment, such as before an edit or when Claude finishes.

**HTML.** The language that describes the structure and content of web pages.

**Idempotency.** The property that doing something twice has the same effect as doing it once, essential for payment messages.

**JavaScript.** The programming language that makes web pages interactive.

**JSON.** A text format for structured data, readable by both people and programs.

**KYC (know your customer).** The identity and business checks a payment provider makes before it activates your account.

**localhost.** Your own computer, as seen by a web browser. Apps you run locally appear at addresses like `http://localhost:5000`.

**localStorage.** A small storage area a browser gives each website, on one device.

**MCP (Model Context Protocol).** An open standard for connecting AI applications to tools and data through MCP servers.

**Model.** The AI system that generates text and code, such as Claude Opus or Claude Sonnet.

**Native app.** An app written with a platform's own tools and language, such as Swift for iPhone or Kotlin for Android.

**Package.** Reusable code published for others to install, such as Flask or pytest.

**Parameterized query.** A database query that keeps user data separate from the query text, preventing SQL injection.

**Permission mode.** A setting that controls which actions Claude Code may take without asking.

**Persistent disk (volume).** Storage on a hosting service that survives redeploys.

**Plan mode.** A permission mode in which Claude explores and writes a plan but makes no changes until you approve.

**Plugin.** An installable bundle of skills, subagents, hooks, and MCP servers.

**Port.** A numbered "door" a program listens on, such as 5000 in `localhost:5000`.

**Preview channel.** A temporary Firebase Hosting address where a pull request is deployed for testing before it's merged.

**Privacy policy.** A public document explaining what data an app collects and how it's used. Both app stores require one.

**Prompt injection.** An attack where instructions hidden in content the AI reads try to make it do something you didn't ask.

**Prompt.** The request or instructions you give an AI.

**Pull request.** A proposal on GitHub to merge one branch into another, with a place to review changes.

**Pure function.** A function whose output depends only on its inputs, with no side effects, making it easy to test.

**Python.** A popular, readable programming language used for tools, servers, and data.

**React Native.** A framework for building iPhone and Android apps with JavaScript or TypeScript.

**Refactoring.** Restructuring code to make it clearer without changing what it does.

**Repository (repo).** A project folder tracked by Git.

**Row Level Security (RLS).** Postgres rules, used by Supabase, that decide which rows each user can read or change.

**Screen reader.** Software that reads the screen aloud, such as VoiceOver on Apple devices and TalkBack on Android.

**SDK (software development kit).** A library that makes it easier to use a service from code, such as Anthropic's Python SDK.

**SDLC (software development lifecycle).** The repeating stages of making software: plan, design, build, test, release, and maintain.

**Secret manager.** A service that stores keys and passwords securely and gives them only to the server code that needs them.

**Semantic versioning (semver).** A version numbering scheme, MAJOR.MINOR.PATCH, where each number signals the kind of change.

**Server.** A computer, or a program on one, that serves apps or data to others.

**Skill.** A reusable set of instructions for Claude Code, stored in a `SKILL.md` file and run with a slash command.

**Spec (specification).** A document describing what to build: features, rules, and what's out of scope.

**SQL injection.** An attack that changes a database query by smuggling commands into user input.

**Static site.** A website made only of files the browser runs, with no server-side code.

**Structured output.** An AI response guaranteed to follow a defined format, such as a JSON schema.

**Subagent.** A specialist helper in Claude Code with its own instructions, tools, and context.

**System prompt.** Instructions given to an AI model by an app, defining its role and rules.

**Tag.** A permanent Git label on one commit, often used to mark a release such as `v1.1.0`.

**Test.** Code that checks whether other code works as intended.

**TestFlight.** Apple's system for sending test versions of an app to testers before it's released.

**Token.** The unit AI models use to measure text, roughly three-quarters of a word.

**Touch target.** The area of the screen that responds to a tap. Aim for at least 44 by 44 points.

**Traceback.** Python's error report, listing where an error happened. Read it from the bottom up.

**TypeScript.** JavaScript with types, which catch many mistakes before the code runs.

**UI (user interface).** What people see and touch in an app.

**UX (user experience).** How using an app feels: whether it's clear, quick, and forgiving.

**Version control.** Keeping a history of every change to a project.

**Vibe coding.** Building software by describing what you want in natural language and letting an AI write the code.

**Virtual environment.** A private set of Python packages for one project.

**WCAG (Web Content Accessibility Guidelines).** The international standard for accessible web content; level AA is the usual target.

**Webhook.** A message one service sends to another's server when something happens, such as a payment succeeding.

**Worktree.** A separate working copy of a Git repository on its own branch, used for parallel work.

**XSS (cross-site scripting).** An attack where malicious code is injected into a web page through user input.
