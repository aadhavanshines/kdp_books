# Chapter 13: Skills, Plugins and Design Systems

By now you've noticed a pattern: once you find a way of working that produces great results, you want to repeat it exactly. You can save requests in a document and paste them, or put instructions in a Project. Claude also has three features made for repeating good work: **skills**, **plugins** and **design systems**.

## Skills: Saved Ways of Working

A **skill** is a packaged set of instructions, and sometimes example files or templates, that teaches Claude how to do one kind of task your way. When a request matches, Claude loads the skill and follows it.

For example, a "Weekly report" skill might contain:

- the four headings your manager wants, in order
- a rule to keep it under 300 words
- a sample of a report your manager liked
- a checklist Claude runs before handing it over

Once that skill exists, "Write this week's report from these notes" produces a report in exactly that shape, every time, in any chat.

### Using skills

Some skills come built in. For example, the skills that let Claude make Word, Excel and PowerPoint files are what made Chapter 7 possible. You don't need to do anything to use them.

In the message box, type **/** to see skills you can call by name. The home screen's placeholder text even says so: "Type / for skills."

### Making your own skill

The easiest way to make a skill is to ask Claude to make one from a conversation that went well:

```prompt
That report came out exactly how my manager likes it. Turn the way we just did it into a skill called "Weekly report": the headings, the length, the tone, and the checks you ran. Include this report as the example.
```

Claude writes the skill and shows it to you. Review it, then save it. You can see, edit and turn off your skills in the **Customize** area of Claude (the Skills section).

> **Tip:** Good skills are specific. "Write well" is not a skill. "Turn meeting notes into minutes with decisions, owners and dates, in this exact table" is.

## Plugins: Bundles for a Job

A **plugin** is a ready-made bundle that can include several skills, connectors and settings for one kind of work, such as sales, marketing, finance, legal review or design. Instead of building ten skills yourself, you install a plugin made by Anthropic, another company or your own organization.

Click **Plugins** in the sidebar to browse what's available, see what each one includes, and turn it on. In a chat, the **+** menu's **Plugins** option lets you choose which plugins are active for that conversation.

> **Check First:** A plugin can give Claude new abilities in your connected apps. Install plugins only from sources you trust, and read what a plugin includes before turning it on, just as you would with an app on your phone.

## Design Systems: Your Look, Every Time

When Claude makes slide decks, one-pagers and designs (Chapter 7), it picks a clean style. If you want everything to match your brand, such as your school's colors, your company's fonts or your logo, set up a **design system**.

Open the **+** menu and choose **Design system**. You can describe your style, or attach examples such as a logo, a brand guide or a deck you like. From then on, choose that design system when you ask for a deck or design, and Claude uses your colors, fonts and layout.

```prompt
Create a design system for "Harborview Swim Club": navy (#1F3A5F) and coral (#F2705B), a rounded sans-serif font, lots of white space, and the logo I've attached in the top left of every slide.
```

## Which One Do I Need?

| Situation | Use |
| --- | --- |
| Same background for one ongoing topic | A Project (Chapter 9) |
| Same way of doing one kind of task, everywhere | A skill |
| A whole area of work, with tools and several skills | A plugin |
| Same visual look on everything Claude designs | A design system |
| Something about you Claude should always know | Your profile instructions or memory |

## Exercise

1. Type **/** in a new chat and see which skills are listed.
2. Think of a task you do every week in the same format. Do it once with Claude until it's right, then ask Claude to turn it into a skill.
3. Open **Plugins** in the sidebar and read what one plugin includes.

## Key Points

- A skill saves a way of working, so Claude repeats it exactly.
- Type / to see skills; ask Claude to turn a good conversation into a skill.
- A plugin bundles several skills and connections for one area of work.
- A design system keeps decks and designs in your colors and fonts.
- Install plugins only from sources you trust.
