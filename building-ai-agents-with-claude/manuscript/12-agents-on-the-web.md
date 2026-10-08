# Chapter 12: Putting an Agent on the Web

A support desk that only works in your terminal isn't much use to customers. This chapter puts it on a web page: a chat window for customers, with a side panel that shows exactly what the agent did, and a private page where Amudha sees refunds, tickets and the audit log. Then it covers what changes when strangers on the internet can reach your agent, and the protections the web version needs that the terminal version didn't.

## The Pieces

The web version has three parts, all in the support desk's project folder:

- **`app.py`**, a small web server built with **FastAPI**, a popular Python web framework. It serves the pages and passes chat messages to the agent.
- **`static/index.html`**, the customer chat page: plain HTML, CSS and a little JavaScript.
- **`static/owner.html`**, Amudha's page, which shows refunds, tickets and the audit log.

The agent itself is unchanged. It's the same `Desk` from Chapter 10, with the same tools, rules and tests. That's worth noticing: the web is just another way to deliver messages to an agent you've already built and tested.

Install FastAPI and Uvicorn, the program that runs it:

```
pip install fastapi uvicorn
```

## One Agent per Chat

A web server handles many customers at once. Each needs their own conversation, and their own `Desk`, so that one customer's verified orders never leak into another's. The server keeps a dictionary of open chats, keyed by a random chat id:

```
@include projects/06-support-desk/app.py::client_for
```

The first message from a new chat creates a `ClaudeSDKClient` with a fresh `Desk`. Later messages with the same chat id go to the same client, so the conversation continues. Because every open chat keeps an agent running, the server caps them at 50 and closes the oldest when a new one arrives. In a real deployment you'd also close chats that have been quiet for a while.

## The Chat Endpoint

When the page sends a message, this function runs:

```
@include projects/06-support-desk/app.py::chat
```

It sends the customer's message to the agent, collects the reply, and also collects every tool call into a list called `actions`. The page shows those actions in a panel beside the chat. Customers wouldn't normally see this, but while you're building and testing, it's invaluable: you can see at a glance that the agent verified the order before refunding it.

The message itself is checked before the agent sees it. `ChatIn` requires between 1 and 2,000 characters; anything else is rejected with an error and never reaches Claude, so it never costs anything:

```
@include projects/06-support-desk/app.py::ChatIn
```

## Run It

```
python store.py
OWNER_PASSWORD=choose-a-password uvicorn app:app --port 8000
```

On Windows PowerShell, set the password on its own line first with `$env:OWNER_PASSWORD = "choose-a-password"`. Then open `http://localhost:8000` in your browser and talk to the desk. Here's a real conversation, run in a browser while this chapter was being written:

![The support desk in a browser. The customer reports a squashed cake; the agent asks for the phone digits, verifies the order, checks the 24-hour rule and refunds Rs. 1,800. The panel on the right shows the two tools it used.](images/shot-support-chat.png)

And here's what happened when someone tried the oldest trick in the book:

![A customer pretends to be a developer and orders a Rs. 50,000 refund. The agent refuses, explains that chat messages can't change the policy, and offers to help with a real problem. The panel on the right is empty: it never called a tool.](images/shot-support-injection.png)

The empty panel is the important part. The agent didn't even look up the order. It recognised the message as an attempt at manipulation and declined. If it had tried, the refund tool's own checks would have stopped any payment over the order's Rs. 1,800 value, and refused a second refund on top of the first.

## The Owner's Page

Amudha's page at `/owner` shows three tables: refunds with their status, tickets waiting for her, and the last twenty entries of the audit log.

![The owner's page: refunds (one paid, one pending from before), tickets, and the audit log showing every tool call the agent made, with its inputs.](images/shot-support-owner.png)

This page shows private data: customers' orders, refunds and complaints. In the first version it had no protection at all, which is fine on your own computer and dangerous anywhere else. The current version needs a password:

```
@include projects/06-support-desk/app.py::owner_only
```

Three details matter. The password comes from an environment variable, never from the code. If no password is set, the owner pages are switched off entirely, rather than open to everyone. And the comparison uses `secrets.compare_digest`, which takes the same time whether the guess is nearly right or completely wrong, so an attacker can't learn the password one character at a time by measuring response times.

The book's tests check all of this without calling the model:

```
@include tests/test_web_app.py::test_owner_pages_need_the_right_password
```

## What Changes on the Internet

Running the desk on your laptop is one thing. Putting it on the internet, where anyone can type anything, changes the risks. Before you go live, work through this list.

**Cost.** Every message costs money, and anyone can send messages. Keep `max_budget_usd` on every agent, set a spending limit in the Console (Chapter 2), and add **rate limiting**: a cap on how many messages one visitor can send per minute. Web hosts and gateways such as Cloudflare offer rate limiting without changing your code.

**Abuse.** Some visitors will try to make your agent write essays, insult people or reveal its instructions. The desk's system prompt keeps it on topic, and the "off-topic request" test checks that it does. Expect to add more tests as you see what real visitors try.

**Privacy.** Customers will type phone numbers, addresses and complaints. Decide how long you keep chat logs and who can read them, tell customers in a short privacy notice, and follow your local law. In India that's the Digital Personal Data Protection Act; in Europe, the GDPR.

**Security basics.** Serve the site over HTTPS, keep the owner pages behind a password (or better, your company's login), keep your API key in an environment variable on the server, and never send it to the browser. The chat page never talks to Claude directly; only your server does.

**People.** Make it easy to reach a human. The desk escalates anything it can't handle to Amudha, and it tells customers what will happen next. An agent that traps customers in a loop does more damage to a business than having no agent at all.

> **Warning:** Never put your Anthropic API key in browser JavaScript, a mobile app, or any code that runs on a customer's device. Anyone can read it there. Keep the key on your server and let the browser talk only to your server.

## What This Version Doesn't Do

This web app is a teaching example, and an honest list of its limits is part of the lesson:

- Open chats live in the server's memory. If the server restarts, conversations end. Chapter 15 shows how to save and resume sessions.
- There's no rate limiting in the code; use your host's.
- It runs a single server process. For many customers at once, you'd run several, and then the chats need to be stored somewhere they can all reach.
- The owner page uses a single shared password. A real business should use proper accounts.

None of these change the agent. They're the ordinary work of running any web service, and they're where Part V picks up.

## Key Takeaways

- The web is just another way to deliver messages to an agent you've already tested. Keep the agent and the web code separate.
- Give every chat its own agent and its own state, and cap how many can be open.
- Check input size before it reaches the agent; rejected messages cost nothing.
- Protect private pages with a password from an environment variable, turn them off when no password is set, and compare passwords with `secrets.compare_digest`.
- On the internet, plan for cost, abuse, privacy and security, and always offer a way to reach a person.
- Never expose your API key to the browser.
