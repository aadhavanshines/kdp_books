# Build Your Own AI Personal Agent: outline

Working title: *Build Your Own AI Personal Agent: An Always-On Assistant That
Chats Where You Do, Remembers, Learns Skills, Works on a Schedule and Runs
Safely in a Sandbox, Built and Tested End to End in Python*

The reader builds **Sparrow**, a self-hosted personal agent in the style of
OpenClaw (gateway, channels, workspace memory, skills, heartbeat) with the
safety layer that NemoClaw and OpenShell add (sandbox, egress policy,
credential injection, privacy routing). The brain is Claude through the
Claude Agent SDK for Python. Every part is tested: unit and functional tests
with a scripted brain, graded end-to-end runs with the real model, and
security, reliability and performance tests.

## Part I: Understanding Personal Agents
1. What a personal agent is (chatbot, agent, personal agent; OpenClaw and
   NemoClaw; what Sparrow will do)
2. The architecture (gateway, channels, brain, tools, memory, skills,
   heartbeat, sandbox, policy)
3. Setting up

## Part II: Building Sparrow
4. The brain: one turn with the Agent SDK
5. The workspace: personality, owner profile and house rules
6. Tools: giving Sparrow hands
7. Memory that lasts
8. Skills
9. The gateway and sessions
10. Channels: terminal and web chat
11. A Telegram channel
12. Heartbeat and scheduled jobs

## Part III: Making It Safe
13. The threat model
14. Who may talk to Sparrow: pairing and allowlists
15. Approvals for risky actions
16. The sandbox
17. Network egress policy and secret injection
18. The privacy router
19. Audit log and spending limits

## Part IV: Testing It Completely
20. A test strategy for agents
21. Functional tests
22. End-to-end evaluations with the real model
23. Security testing and red-teaming
24. Reliability and performance testing

## Part V: Running It
25. Deploying
26. Operating and maintaining
27. Where to go next

## Appendices
A. Configuration reference; B. Tool reference; C. Test report;
D. Troubleshooting; E. Glossary; F. Sources; About the Author;
More Books by the Author
