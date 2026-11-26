# Chapter 12: Connectors: Claude in Your Email, Calendar and Files

So far you've brought information *to* Claude by typing, attaching and pasting. **Connectors** let Claude go and get it: read your email, check your calendar, find a file in Google Drive, look something up in Notion. With your permission, some connectors also let Claude *act*: draft or send an email, create a calendar event, save a file.

This is where Claude starts to feel like an assistant rather than a chatbot. It's also where you need to think a little about permissions, so this chapter covers both.

## What a Connector Is

A connector is a secure link between Claude and another app. You sign in to that app once, approve what Claude may access, and from then on Claude can use it when a request needs it. Popular connectors include:

| Connector | What Claude can do with it |
| --- | --- |
| Gmail | Search and read emails, draft replies, send when you allow it |
| Google Calendar | Check your schedule, find free time, create events |
| Google Drive | Find, read and save documents and spreadsheets |
| Microsoft 365 | Outlook email and calendar, OneDrive and SharePoint files |
| Slack | Search messages and channels |
| Notion | Read and update pages and databases |

Many more are in the directory, and new ones are added often. Companies can also build their own **custom connectors**.

## Step 1: Connect an App

1. Click your name, then **Settings**, then **Connectors** (in some versions this sits under **Customize**).
2. Find the app and click **Connect**.
3. A sign-in window for that app opens. Sign in **on that app's own page** (for example, Google's sign-in page) and review what Claude is asking to access.
4. Approve, and you're returned to Claude. The connector now shows as **Connected**.

![Settings > Connectors, as a simplified drawing.](images/fig-connectors.png)

You can also connect some apps straight from the **+** menu. In Chapter 6's screenshot, Google Drive showed **Not connected** with a **Connect** button.

> **Check First:** Only connect your accounts from inside Claude's own Settings or + menu. Never sign in to your email through a link someone sends you claiming to be "Claude setup."

## Step 2: Use It in a Request

Once connected, just ask. Claude decides when to use the connector.

```prompt
Look through my Gmail from the last 7 days and list every email that's waiting for a reply from me, with who it's from, what they need, and how urgent it seems. Most urgent first.
```

```prompt
Find a free hour next week for a call with my sister, avoiding mornings. Suggest three options.
```

```prompt
Find the spreadsheet in my Google Drive called "2026 Budget" and tell me which categories went over in October.
```

You'll see a gray line such as "Searched Gmail" or "Used 3 tools" in the answer. Click it to see exactly what Claude looked at.

## Sending and Saving: The Send Button

When Claude drafts an email, the draft card can offer a **Send via Gmail** button, as you saw in Chapter 3. Nothing is sent until you click it. Claude can also save files it makes into a connected app, such as a document into Google Drive. In late 2026 this "send files to connected apps" ability was rolling out as a beta on paid plans.

## Permissions: Manual and Auto

When a connector can *change* something, such as sending, deleting, booking or editing, you choose how much Claude may do without asking. Look under the message box: you'll see **Manual** or **Auto**.

| Mode | What happens | Use it when |
| --- | --- | --- |
| Manual | Claude asks you before each action in another app | You're new to connectors, or the account matters a lot |
| Auto | Claude acts without asking, except for actions an automated check flags as risky | You trust the task and want it done quickly |

You can also set a single tool to **Always ask** in its connector settings, so Claude asks even in Auto mode. A sensible setup for most people: Auto for reading, **Always ask** for sending email and deleting anything.

> **Safety Tip:** Start with Manual. Watch what Claude asks permission for during the first week. Once you're comfortable, switch to Auto for the tasks you trust, and keep "Always ask" on anything that sends messages or spends money.

## Disconnecting

To remove access, go back to Settings > Connectors, click the connector, and choose **Disconnect**. You can also remove Claude's access from the other app's own security settings, such as your Google account's third-party access page.

## Exercise

1. Connect one app you use every day, such as your calendar.
2. Ask a reading-only question: "What's on my calendar this week that I should prepare for?"
3. Check whether you're in Manual or Auto mode, and decide which you want.

## Key Points

- Connectors let Claude read from, and sometimes act in, your other apps.
- Connect apps in Settings > Connectors, signing in on the app's own page.
- Nothing is sent until you click Send, unless you've allowed Claude to act.
- Manual asks before every action; Auto acts unless a check flags a risk; "Always ask" overrides Auto for one tool.
- Disconnect any time from Settings.
