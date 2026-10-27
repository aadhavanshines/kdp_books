# Appendix F: Sources

The Real-World Story and Interesting Fact boxes, and the facts about OpenClaw, NemoClaw and the tools Sparrow uses, come from the following public sources, checked in October 2026. Reports from 2026 sometimes give different numbers for the same event; where they differ, the book uses the figures from the earliest primary report and says that later counts were higher.

| Chapter | Story or fact | Source |
| --- | --- | --- |
| 1, 14 | OpenClaw's design: gateway, channels, workspace files, skills, heartbeat, pairing | OpenClaw documentation, docs.openclaw.ai; the openclaw/openclaw repository on GitHub |
| 1 | OpenClaw's creator and its renaming from Clawdbot to Moltbot (January 27, 2026) and OpenClaw (January 30, 2026); the move to a foundation | "OpenClaw," Wikipedia; project announcements and press coverage, January and February 2026 |
| 1, 8 | 341 malicious skills among 2,857 on ClawHub, 335 delivering Atomic Stealer through fake prerequisites (the ClawHavoc campaign); VirusTotal scanning afterward | Koi Security research, early February 2026, as reported by The Hacker News, "Researchers Find 341 Malicious ClawHub Skills," February 2026; Palo Alto Networks Unit 42, "OpenClaw AI Supply Chain Risk" |
| 1, 10 | CVE-2026-25253: token theft through an unchecked gateway address, one-click remote code execution, CVSS 8.8, fixed in 2026.1.29 | The CVE record for CVE-2026-25253; advisories and write-ups by SOCRadar and others, February 2026 |
| 1, 14 | Tens of thousands of OpenClaw gateways reachable from the internet | Internet scanning studies reported in early 2026; counts vary by study and date |
| 1, 17, 18 | NemoClaw announced at GTC on March 16, 2026; Apache 2.0; OpenShell sandbox, network policy with operator approval, credential injection, privacy routing to local models | NVIDIA newsroom, "NVIDIA Announces NemoClaw for the OpenClaw Community," March 16, 2026; the NVIDIA/NemoClaw and NVIDIA/OpenShell repositories on GitHub |
| 1 | NemoClaw does not stop prompt injection | Cloud Security Alliance, research note on the NemoClaw security assessment, March 27, 2026 |
| 7, 12 | `MEMORY.md` and dated daily notes; a memory flush before compaction; `HEARTBEAT_OK` | OpenClaw documentation, "Memory" and "Heartbeat" |
| 13 | The lethal trifecta | Simon Willison, "The lethal trifecta for AI agents: private data, untrusted content, and external communication," simonwillison.net, June 2025 |
| 16 | Claude Code's sandbox uses bubblewrap on Linux | Claude Code documentation, "Sandboxing," code.claude.com |
| 16 | bubblewrap and its use by Flatpak | The containers/bubblewrap repository on GitHub; Flatpak documentation |
| 3, 4 | Claude Agent SDK, models and prices | Anthropic documentation, platform.claude.com: Agent SDK, models overview and pricing pages |
| 11 | Telegram Bot API: getUpdates, long polling, offsets, the 4,096-character message limit, BotFather | Telegram, "Telegram Bot API" and "Bots: An introduction for developers," core.telegram.org |
| 17 | Server-side request forgery and cloud metadata addresses | OWASP Top 10, "Server-Side Request Forgery" |
| 18 | The Luhn algorithm for card numbers | ISO/IEC 7812-1, identification cards: numbering system |
| 13, 23 | Prompt injection as a top risk for applications built on language models | OWASP Top 10 for Large Language Model Applications, genai.owasp.org |
