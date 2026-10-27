# Chapter 27: Where to Go Next

Sparrow is deliberately small. Every feature it lacks is a reasonable next step, and the way it's built tells you where each one goes and how to test it. This chapter sketches the most useful extensions, then the lessons worth taking to any agent you build.

## More Channels

Every channel is a class with a `name`, a `send` method and a way of receiving messages that produces `Inbound` objects (Chapter 10). Adding one never touches the gateway.

- **Signal, WhatsApp, Slack, Discord, Matrix, email.** Each has its own API or bridge, and each needs the same three decisions as Telegram: how messages arrive (polling, a webhook, a socket), which conversations to accept (private ones only, to start), and how owners are identified (a stable user ID, never a display name).
- **Voice.** A channel can turn speech into text before calling the gateway, and text into speech when sending. Keep the conversion inside the channel, so the rest of Sparrow never knows.

Test each new channel the way Chapter 11 tested Telegram: a fake of the service's API, and the real channel code talking to it.

## More Tools

New tools go in the `TOOLS` list (Chapter 6), and every one passes through `call_tool`, so permissions, privacy, scrubbing and the audit log apply automatically. Before adding one, ask the questions from the threat model:

- **Calendar and email** are the most requested. Reading is like `read_file`: the content is untrusted and should be wrapped. *Sending* is new: it's external communication, the third leg of the lethal trifecta. Make every send need an approval at first, with the recipient and the full text in the notice, and only relax that for narrow cases once you trust it.
- **Smart home** controls, such as lights or a thermostat, are actions in the physical world. Keep them to a short allowlist of devices and actions, and consider an approval for anything that unlocks, opens or heats.
- **Payments** are where an agent can do the most damage. If you add them, make every payment need an approval showing the amount and payee, put a daily limit in code, and make sure no retry can ever pay twice (Chapter 4).

For each new tool, write the security unit tests first: what must it refuse, as if asked by a fully fooled model? Then add a red-team scenario.

## Better Memory

- **Embeddings.** Add a second index that stores an embedding for each memory line and finds lines by meaning rather than by words. Search both, and give the model the best results of each. Keep the Markdown files as the source of truth, as now.
- **Summaries.** Once a week, a scheduled task can ask Sparrow to summarize the week's daily notes into a few lines for `MEMORY.md`, as a person keeping a diary might.
- **Forgetting.** Let the owner say "forget that," with a tool that removes a line from `MEMORY.md` and today's note. A personal agent should be as easy to correct as it is to teach.

## Stronger Privacy

Sparrow's privacy router hides values with a recognizable shape. Names, addresses and health details written in words still reach the model. Two extensions combine well:

- **A local model for sensitive turns**, as NemoClaw does: route a turn to a model running on your own hardware when the message or its context is sensitive. The brain interface makes this a second `Brain` class; the gateway chooses which one to call.
- **A local model as a detector:** a small local model reads each outgoing prompt and marks names, places and health terms for the privacy router to replace, extending placeholders beyond patterns.

## Stronger Isolation

- **Run the whole gateway sandboxed**, not just the commands, with read-write access only to `~/.sparrow` and network access only to the model provider, Telegram and allowed sites. That's closer to OpenShell's design, where the whole agent lives inside the sandbox.
- **A network proxy for egress**, so the policy is enforced outside Sparrow's process. Then even a bug in Sparrow's own code couldn't reach a denied host.
- **Signed skills.** Accept skills only with a signature from a key you trust, and show the signer in the approval notice.

## Lessons for Any Agent

Whatever you build next, these are the habits this book has tried to show:

1. **The model asks; the code decides.** Enforce anything that must always hold in code, below the model, at one choke point every action passes through.
2. **Assume the model will be fooled sometimes,** and limit what a fooled model can do: least privilege, sandboxing, deny-by-default networking, secrets it never sees, approvals for risky and rare actions.
3. **Keep state in plain, inspectable files,** so people can see and correct what their agent knows.
4. **Separate testing the code from testing the model.** Test the code exactly with a scripted brain that can play a perfectly fooled model; test the model statistically, grading effects, with several runs.
5. **See every security test fail once** before you trust it to pass.
6. **Never leave the user hanging,** and record everything, so that when something surprising happens, you can find out why.

Sparrow began as a promise in the Introduction: a personal agent you understand completely, because you wrote every line and tested every part. You now have one. Make it yours: give it a better personality, teach it your routines, add the tools you need, and keep its tests green.

## Key Takeaways

- New channels and tools fit into existing interfaces; the safety checks apply to them automatically.
- Treat any tool that sends, buys or acts in the physical world as the most dangerous kind: approvals, limits, no double execution.
- Embeddings, summaries, forgetting, local models and stronger isolation are natural next steps.
- Write the security tests for a new capability before the capability.
- The habits matter more than the code: decide in code, limit the damage, keep state visible, and test both the code and the model.
