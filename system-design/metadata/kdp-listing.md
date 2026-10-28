# KDP Listing Details: The System Design Interview Playbook

Copy these values into the KDP "Details" page for the Kindle eBook and the paperback. Use the same values for both formats so Amazon links them.

## Language

English

## Book Title

The System Design Interview Playbook

## Subtitle

A Step-by-Step Framework, 20 Worked Designs, Tested Building Blocks and Mock Interviews to Prepare for Senior Engineering Interviews at Top Tech Companies

> **Trademark note.** Company names (Google, Meta, Amazon) and product names (Redis, Kafka, Cassandra and others) appear only in the body, to describe published or reported hiring practices and widely used technologies, and the copyright page carries a "not affiliated" notice. Keep them out of the title, subtitle and keywords, as KDP requires. Never describe the designs as any company's real system or the prompts as "real" questions from any company.

## Series

Optional: an interview-preparation series together with *The Coding Interview Playbook*.

## Edition Number

1

## Author

- First name: Aadhavan
- Last name: Muthurengan

## Contributors

None

## Description

Paste the following into the description box. KDP supports basic HTML such as `<b>`, `<i>`, `<ul>`, and `<li>`.

```html
<b>Design systems out loud, with numbers, trade-offs and confidence.</b>

<p>Senior engineering interviews at top technology companies include a system design round: an open-ended, 45-minute conversation in which you design a large system, explain your choices and adapt when the interviewer pushes back. Memorizing diagrams doesn't work. This book teaches a repeatable way to think, the building blocks every design is made of, and how to defend each trade-off with numbers.</p>

<p><b>Every building block is tested, not just described.</b> Load balancing, caches, LSM-trees, quorums, consistent hashing, rate limiters, Bloom filters, HyperLogLog, retries with jitter, circuit breakers and more are runnable Python models, tested on Python 3.12 to 3.15. When the book says consistent hashing moves about 1/N of the keys, or that full jitter prevents a retry storm, you can run the code and see it.</p>

<p><b>Inside, you will learn:</b></p>
<ul>
<li>What interviewers evaluate at mid-level, senior and staff levels, using companies' own published guidance where it exists</li>
<li>A seven-step framework: requirements, estimates, API, data model, high-level design, deep dives and wrap-up</li>
<li>Back-of-the-envelope estimation that drives decisions, with a numbers cheat sheet</li>
<li>Scaling, caching, databases, replication, partitioning, queues and logs, rate limiting, IDs and clocks, probabilistic data structures, reliability, observability and security</li>
<li>20 complete worked designs: link shortener, distributed rate limiter, key-value store, unique ID generator, web crawler, notifications, news feed, chat, autocomplete, video streaming, file sync, nearby places, ride matching, payments, ticket booking, metrics and alerting, job scheduler, leaderboard, collaborative editing and a distributed message queue</li>
<li>Real-world stories throughout, from famous outages to published designs, and a chapter retelling eight well-known incidents and the lessons they teach, each checked against the company's own postmortem</li>
</ul>

<p><b>Practice like the real thing.</b> Four full mock interviews, from mid-level to staff, show the whole conversation, including the missteps and how to recover, with the interviewer's notes. A chapter of common mistakes, two- and six-week study plans, a building-blocks reference, a one-page design template, a design index and a glossary complete the book.</p>

<p>Current as of October 2026.</p>

<p><i>This book is independent and is not affiliated with, sponsored by, or endorsed by any company it mentions. The designs are generic teaching designs, not descriptions of any company's systems, and no prompt is claimed to have been asked by any particular company.</i></p>
```

## Author Bio (for Amazon Author Central)

> Aadhavan Muthurengan is an automation and artificial intelligence professional with more than 15 years of experience in the automotive industry. Throughout a career focused on product development and validation, Aadhavan has designed and built a wide range of in-house tools that automate complex engineering workflows, speed up testing, and help teams deliver reliable, high-quality results. Aadhavan is the author of *Prompt Engineering Mastery*, *Vibe Coding for Beginners*, *Building AI Agents with Claude*, *Python Programming Hands-On*, *How Large Language Models Are Made*, *The Coding Interview Playbook* and *The System Design Interview Playbook*.

## Publishing Rights

"I own the copyright and I hold the necessary publishing rights."

## Primary Audience

- Sexually explicit content: No
- Reading age: leave the minimum blank, or 16+

## Primary Marketplace

Amazon.com

## Categories (choose up to 3)

Pick the closest available matches in KDP's category browser:

1. Computers & Technology > Computer Science > Systems Analysis & Design
2. Computers & Technology > Networking & Cloud Computing > Cloud Computing (or Distributed Systems)
3. Business & Money > Job Hunting & Careers > Job Hunting (or Careers > Interviewing)

## Keywords (7 boxes)

1. system design interview preparation
2. distributed systems for software engineers
3. senior software engineer interview book
4. scalable architecture design examples
5. backend system design trade-offs
6. software architecture interview questions
7. microservices caching sharding replication

## AI-Generated Content Disclosure (required)

KDP asks whether the book contains AI-generated content. The manuscript text, code, diagrams and cover were produced with AI assistance, so answer **Yes**:

- Text: **AI-generated**. Select the option that matches how much you edited it.
- Images (cover and diagrams): **AI-generated**.
- Translations: None.

Answering this accurately is a KDP content-guideline requirement. The disclosure is not shown to customers.

## Kindle eBook Settings

- DRM: Your choice.
- Manuscript: upload `dist/the-system-design-interview-playbook.epub`
- Cover: upload `dist/ebook-cover.jpg` (1600 x 2560 px). A white-background version, `dist/ebook-cover-white.jpg`, is also available.
- ISBN: not required for Kindle
- KDP Select: optional (90-day exclusivity, Kindle Unlimited royalties)
- Territories: All territories
- Royalty: 70% (requires a price from $2.99 to $12.99 on Amazon.com)
- Suggested list price: **$9.99 USD**

## Paperback Settings

- ISBN: choose "Get a free KDP ISBN"
- Print options:
  - Ink and paper type: Black & white interior with white paper
  - Trim size: 6 x 9 in (15.24 x 22.86 cm)
  - Bleed settings: **No bleed**
  - Paperback cover finish: Glossy (suits the dark cover) or Matte
- Manuscript: upload `dist/paperback-interior-6x9.pdf`
- Cover: choose "Upload a cover you already have" and upload `dist/paperback-cover.pdf`
- Suggested list price: **$24.99 USD**. Check the royalty calculator on the pricing page before publishing, since printing costs change.

> The paperback cover is sized for exactly the page count in `dist/build-info.json`. KDP's free ISBN barcode is printed automatically in the white box on the back cover. If you edit the manuscript and the page count changes, rebuild so the spine width updates.

## Keep It Current

Chapter 1 describes interview formats as of October 2026. For a later edition, re-check the companies' own career pages listed in `research/facts.md`, update that chapter, rerun the tests and rebuild. The real-world stories describe past events and don't go out of date, but check that the source links in Appendix F still work.
