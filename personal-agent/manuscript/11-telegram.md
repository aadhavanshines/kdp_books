# Chapter 11: A Telegram Channel

The terminal and the web chat need you at your computer. A personal agent should be in your pocket. This chapter connects Sparrow to Telegram, so you can message it from your phone anywhere, and it can send you reminders wherever you are. The same pattern works for other messaging apps; Chapter 27 sketches a few.

## Why Telegram

Telegram is the easiest messaging app to connect a personal agent to. Anyone can create a **bot**, an account controlled by a program, in a minute, free, with no business verification. Its Bot API is plain HTTPS with JSON. And it supports **long polling**: your program asks Telegram "anything new?" and Telegram holds the request open until a message arrives or a timeout passes. That means Sparrow needs no public web address, no open port and no certificate. It only makes outgoing requests, which is much safer for a program on your home computer.

## Creating Your Bot

1. In Telegram, open a chat with **@BotFather**, Telegram's official bot for making bots, and send `/newbot`.
2. Choose a display name, such as "Sparrow," and a username ending in `bot`, such as `asha_sparrow_bot`. Usernames are public and must be unique, so you may need a few tries.
3. BotFather replies with a **token**, which looks like `123456789:AAH...`. Anyone with this token controls your bot, so treat it like a password.

Put the token in Sparrow's secrets file, `~/.sparrow/state/secrets.env`, on a new line:

```
SPARROW_TELEGRAM_TOKEN=123456789:AAH...
```

Then turn the channel on in `sparrow.yaml`:

```
telegram:
  enabled: true
```

## Telling Sparrow Who You Are

Sparrow answers only its owners, and identifies you on Telegram by your numeric user ID, not your username (which you can change). The easiest way to find your ID is to let Sparrow tell you. Start Sparrow with `python -m sparrow run`, open your bot in Telegram, tap **Start**, and send any message. You aren't an owner yet, so Sparrow treats you as a stranger and gives you a pairing code. Now, in another terminal:

```
$ python -m sparrow pairing list
telegram:812345678 Asha pending K7P2QX
```

The first column is your identity. Stop Sparrow, add it to `owners` in `sparrow.yaml`, remove the pending entry, and start Sparrow again:

```
owners: ["telegram:812345678"]
```

```
$ python -m sparrow pairing remove telegram:812345678
Removed.
```

Your next message gets a real answer. Run `python -m sparrow doctor` to confirm that the token is set and an owner is listed.

> **Warning:** Never add someone else's ID to `owners`. Owners have every tool: your files, memory and commands. For friends and family, use pairing instead (Chapter 14): they get a chat with Sparrow and nothing of yours.

## The Channel

`sparrow/channels/telegram.py` starts with a helper for long replies:

```python
@include sparrow/channels/telegram.py#L1-L24
```

Telegram limits a message to 4,096 characters. `chunks` splits longer text into pieces of at most 4,000, cutting at a line break when there's one in the second half of the piece, so paragraphs and list items stay whole; otherwise it cuts at the limit. The leading newlines of each following piece are dropped, so no message starts with a blank line.

```python
@include sparrow/channels/telegram.py#L27-L47
```

The Bot API's address includes the token: `https://api.telegram.org/bot<token>/<method>`. The `api_url` can be changed, which is how the tests point the channel at a fake Telegram (more on that below). `send` posts each chunk with `sendMessage` and raises an error if Telegram refuses, which the gateway logs.

## Receiving Messages

```python
@include sparrow/channels/telegram.py#L49-L89
```

`poll_once` calls `getUpdates` with three parameters:

- **`offset`** tells Telegram which updates Sparrow has already seen. Each update has an increasing `update_id`; asking for `offset = last id + 1` both fetches newer updates and confirms the old ones, which Telegram then deletes. If Sparrow restarts, it may see the last batch again, but never misses one.
- **`timeout`** is the long-polling wait: Telegram holds the request for up to 25 seconds if nothing is new, so Sparrow makes about two quiet requests a minute instead of hammering the API. The HTTP request's own timeout is ten seconds longer, so the client doesn't give up first.
- **`allowed_updates`** asks only for new messages, not edits, reactions or other events.

For each update, the offset moves forward *before* anything else, so a message that causes a problem is never fetched again and again. Then the channel ignores anything that isn't a text message in a private chat. Group chats are out because in a group, every member's message would reach your agent; photos and stickers are out because Sparrow has no tool to read them.

Each message becomes its own task. If you send Sparrow something slow, such as a briefing that reads a web page, and a guest sends "hi" meanwhile, the guest doesn't wait for your answer. The gateway's per-session locks still keep each conversation in order. `working` keeps a reference to every task until it's done, both so Python doesn't garbage-collect a running task and so `drain` can wait for all of them, which the tests use to know when every reply has been sent.

## Staying Connected

```python
@include sparrow/channels/telegram.py#L91-L105
```

`run` polls forever. When something goes wrong, such as the network being down, Telegram having a bad moment, or a malformed response, it logs the error and waits before trying again, doubling the wait each time, up to a minute: 1, 2, 4, 8 ... 60 seconds. This **exponential backoff** keeps Sparrow from flooding the API, or your log, while your Wi-Fi is down, and reconnects quickly once it's back. A successful poll resets the wait to one second.

> **Note:** A wrong token makes Telegram answer 401 Unauthorized, which `raise_for_status` turns into an error, so `run` logs it and keeps retrying once a minute. `doctor` checks that a token is set but not that it's right; if Sparrow never answers on Telegram, look for `channel_error` events in the audit log (Chapter 26).

## A Fake Telegram for Testing

You don't want tests that need a real Telegram account, a phone and an internet connection. So `tests/fake_telegram.py` is a stand-in for the Bot API: a small FastAPI app that implements `getUpdates` and `sendMessage`, checks the token, and lets a test play the part of users. Here is its core:

```python
@include tests/fake_telegram.py#L1-L78
```

A test calls `fake.user_says(100, "hello")` to put a message in the queue, then `poll_once` to fetch it. Everything Sparrow sends ends up in `fake.sent`. Because `httpx` can send requests straight to an ASGI app in memory, no server or port is needed; the system test in Chapter 24 runs the same fake as a real server, to test Sparrow from the outside. Chapter 21 shows the Telegram tests: a round trip, ignoring groups and photos, strangers getting a code, long replies being split, and a wrong token being reported.

## Key Takeaways

- A Telegram bot takes a minute to create; long polling means Sparrow needs no public address.
- Keep the bot token in the secrets file; identify owners by numeric user ID.
- Move the offset forward before handling a message, ignore anything but private text messages, and handle each message as its own task.
- Split long replies at line breaks; back off exponentially when the connection fails.
- A fake Bot API lets every Telegram behavior be tested without Telegram.
