# Part III: 50 Real Workflows

# Chapter 16: Writing and Email

Every workflow in Part III follows the same pattern: what it's for, what you'll use, the exact request, Claude's answer (trimmed where marked), what to do next, and how to make it repeatable. Change the details in the requests to fit your own situation; the structure is what does the work.

## Workflow 1: Reply to a Difficult Email Without Making It Worse

**For:** an angry, pushy or upsetting email you don't want to answer in the heat of the moment. **You'll use:** a normal chat. **Time:** 3 minutes.

1. Copy the email you received.
2. Paste it with this request.

```prompt
Here's an email from a parent at the dance studio where I'm the manager. She's angry that her daughter wasn't picked for the spring showcase. I want to stay kind and calm, explain that places were based on attendance (her daughter missed 6 of 12 classes), and offer a meeting. Don't apologize for the decision itself. Under 150 words.

[paste the email here]
```

```result
Subject: Re: Spring Showcase

Dear Mrs. Alvarez,

Thank you for writing, and I understand how disappointing this news is for you and for Sofia. She clearly loves to dance.

Showcase places were based on class attendance this term, so that every dancer on stage has learned the full routine. Sofia attended 6 of the 12 classes, which was below the level we needed for this performance.

I'd be glad to meet with you to talk about how Sofia can be ready for the summer showcase, which has open places. Would Tuesday or Thursday after 5pm suit you?

Warm regards,
Dana Mitchell
Studio Manager
```

**Next:** If you're still upset, ask: "Read my reply as the parent. Is there anything that might come across as cold?" **Make it repeatable:** In a "Studio Admin" project, add your studio's policies as context, so every reply quotes them correctly.

## Workflow 2: A Complaint Letter That Gets Results

**For:** a refund, a repair, a billing mistake. **You'll use:** a chat, plus a photo or PDF of the receipt or bill. **Time:** 5 minutes.

```prompt
Write a firm, polite complaint email to Brightline Appliances. I bought a dishwasher on September 2 for $649 (order 55120). It has stopped draining twice; a technician visited on October 20 and November 14 and it failed again on November 21. I want a replacement or a full refund, not a third repair. Mention that it's still under the 1-year warranty. Ask for a reply within 10 business days. Include a short timeline. Under 200 words.
```

Claude produces an email with a subject line, a three-line timeline of dates, a clear request and a deadline. Attach the receipt photo and ask "check my dates and amounts against this receipt" before sending.

**Tip:** Ask Claude "What would a customer service team need to say yes quickly?" It often suggests adding an order number, a photo or a specific preferred outcome. **Make it repeatable:** Save the request in a note with blanks for company, dates and outcome.

## Workflow 3: A Thank-You or Sympathy Note

**For:** notes that matter, where a template feels wrong. **You'll use:** a chat. **Time:** 2 minutes.

```prompt
Help me write a short handwritten sympathy card to my coworker Ray, whose mother died last week. I met her once at our team picnic, where she brought homemade lemon bars and told funny stories about Ray as a kid. Warm, simple, not religious, 4 or 5 sentences. Give me two versions.
```

```result
Version 1
Dear Ray, I was so sorry to hear about your mom. I'll always remember meeting her at the picnic, with her lemon bars and her stories about you as a kid. She was so clearly proud of you. Please take all the time you need, and let me know if there's anything I can do. Thinking of you, Priya

Version 2
Ray, I'm so sorry for your loss. Your mom made our team picnic brighter, and I still smile thinking about her stories and those lemon bars. I hope the memories of her bring you some comfort in the weeks ahead. With love and sympathy, Priya
```

**Why it works:** one real detail (the lemon bars) turns a generic message into a personal one. Always give Claude one true memory. **Make it repeatable:** Not needed; these should stay personal.

## Workflow 4: A Cover Letter Tailored to the Job

**For:** job applications. **You'll use:** a Project called "Job Search" with your résumé as context. **Time:** 10 minutes per application.

1. Create a Job Search project. Add your résumé and instructions: your target roles, location and the tone you like.
2. For each job, start a chat in the project and paste the job ad.

```prompt
Here's the job ad for Operations Coordinator at Lakeside Health. Write a cover letter under 300 words that matches my three strongest experiences to their top three requirements, using a specific number or result for each. No clichés like "I am writing to express my interest." End with a confident, specific closing line.

[paste job ad]
```

**Next:** Ask "Which requirement in the ad is my weakest match, and how should I address it in the interview?" **Make it repeatable:** The project already makes it repeatable. Each new job takes one paste.

## Workflow 5: A Short Bio for Any Occasion

**For:** a LinkedIn "About" section, a conference program, a website, a club newsletter. **You'll use:** a chat. **Time:** 3 minutes.

```prompt
Write three bios for me: 25 words (for a conference badge list), 75 words (for a speaker page) and 150 words (for LinkedIn, first person). Facts: Leila Haddad, 12 years as a pediatric nurse, now trains new nurses at St. Mark's Hospital in Phoenix, speaks Arabic and Spanish, volunteers teaching CPR at community centers, loves desert hiking. Warm and professional; no buzzwords.
```

You get three ready-to-use bios. Ask for "a more playful version of the 150-word bio" if the audience is informal. **Make it repeatable:** Save your facts list in your profile instructions; next time, just ask "Write me a 50-word bio for a gardening club newsletter."

## Workflow 6: Rough Notes into a Polished Message

**For:** when you know what you want to say, but it's a jumble. **You'll use:** a chat, or dictation on your phone. **Time:** 2 minutes.

Dictate or type your thoughts in any order, then:

```prompt
Turn my rambling notes into a clear message to the team. Lead with the decision, then the reasons, then what each person needs to do and by when. Short paragraphs.

Notes: ok so we're moving the launch from the 3rd to the 10th, mainly because the printer can't do the brochures in time, also Tom is out sick, the website stays the same, Jen please tell the venue, Ali update the social posts, everyone else nothing changes, sorry for the shuffle
```

```result
Hi all,

We're moving the launch from the 3rd to the 10th.

Why: the printer can't deliver the brochures in time, and Tom is out sick this week.

What changes:
- Jen: please let the venue know about the new date.
- Ali: please update the social posts.
- Everyone else: nothing changes for you, and the website stays as it is.

Thanks for rolling with the change.
```

**Make it repeatable:** This is perfect for voice dictation on your phone (Chapter 15).

## Workflow 7: A Post for a Local Event

**For:** a club, school, church, small shop or community group. **You'll use:** a chat; optionally a photo. **Time:** 3 minutes.

```prompt
Write a Facebook post and a shorter Instagram caption for our library's free family movie night: Friday 12 December, 6pm, Maple Street Library community room, showing a G-rated holiday film, free popcorn, bring a blanket, no booking needed. Friendly and excited, 3 hashtags max for Instagram, no emoji.
```

**Next:** "Now write the reminder post for the morning of the event." **Make it repeatable:** In a "Library Events" project, add your past posts as examples, and every new post will match your voice.

## Workflow 8: Proofread and Check the Tone Before You Send

**For:** anything important: an application, a message to your boss, a public post. **You'll use:** a chat. **Time:** 1 minute.

```prompt
Proofread this email to my manager. First, list any spelling, grammar or clarity mistakes in a table (original, fix, reason). Then tell me in one sentence how it's likely to come across. Don't rewrite the whole thing; I want to keep my voice.

[paste email]
```

The table format matters: you see every change and decide which to accept, instead of getting a rewritten email that no longer sounds like you. **Make it repeatable:** Turn it into a skill called "Proofread, keep my voice" (Chapter 13).
