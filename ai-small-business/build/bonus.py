"""Build the downloadable bonus files from the manuscript, so they always match the book.

bonus/
  Prompt-Library.md       every workflow prompt, grouped by chapter, ready to copy
  Prompt-Library.txt      the same as plain text
  Workflow-Index.csv      number, title, chapter, use-it-when, time saved (for a spreadsheet)
  templates/*.md          fill-in templates referred to in the book
"""
import csv
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MS = ROOT / "manuscript"
OUT = ROOT / "bonus"


def workflows():
    """Yield dicts for each workflow, in book order."""
    out = []
    for f in sorted(MS.glob("*.md")):
        text = f.read_text()
        chap = re.search(r"^# Chapter \d+: (.+)$", text, re.M)
        for m in re.finditer(r"^## Workflow (\d+): (.+)$", text, re.M):
            start = m.end()
            nxt = re.search(r"^## ", text[start:], re.M)
            body = text[start:start + nxt.start()] if nxt else text[start:]
            use = re.search(r"\*\*Use it when:\*\* (.+)", body)
            saved = re.search(r"\*\*Time Saved:\*\* (.+)", body)
            prompt = re.search(r"^```\n(.*?)\n```", body, re.M | re.S)
            better = re.search(r"\*\*Make it better:\*\* (.+)", body)
            assert use and saved and prompt and better, f"workflow {m.group(1)} is missing a part"
            flat = "\n\n".join(" ".join(l.strip() for l in para.split("\n")) for para in prompt.group(1).split("\n\n"))
            out.append(dict(num=int(m.group(1)), title=m.group(2).strip(), chapter=chap.group(1) if chap else "",
                            use=use.group(1).strip(), saved=saved.group(1).strip(), prompt=flat,
                            better=better.group(1).strip()))
    nums = [w["num"] for w in out]
    assert nums == list(range(1, len(nums) + 1)), f"workflow numbers out of order: {nums}"
    return out


TEMPLATES = {
    "01-Business-Profile.md": """# Business Profile

Paste this, filled in, into your Claude Project's instructions (Chapter 2).

**Business name:**
**What we do (one sentence):**
**Where we are / where we serve:**
**Opening hours:**
**Products or services, with prices:**
-
-
**Our typical customers:**
**What makes us different:**
**How we sound (tone of voice):**
**Words and phrases we use:**
**Words and phrases we never use:**
**Things the assistant must never say, promise or offer:**
- (for example: discounts over 15%, delivery outside our area, allergy guarantees)
**Useful links (website, booking page, review page):**
""",
    "02-Brand-Voice-Guide.md": """# Brand Voice Guide

**Our voice in three words:** (for example: warm, plain, playful)

**We sound like:** (a person, not a company: "a friendly neighbor who knows bread")

**Do:**
- Use short sentences.
-
-

**Don't:**
- Use jargon such as
-
-

**Example of us at our best (paste a real email or post):**

**Example of what we never want to sound like:**
""",
    "03-Customer-FAQ-Sheet.md": """# Customer FAQ Sheet

Give this to Claude with customer-service workflows (Chapter 8), so replies use your real answers.

| Question | Our answer | Last checked |
| --- | --- | --- |
| What are your opening hours? | | |
| Do you deliver? Where and how much? | | |
| What is your returns / refund policy? | | |
| How do I book or order? | | |
| What payment methods do you take? | | |
| Do you offer gift cards? | | |
| (add your own) | | |
""",
    "04-Reply-Rules.md": """# Customer Reply Rules

Paste these rules into your Project or at the top of a customer-service chat.

- Always thank the customer for getting in touch.
- Apologize once, sincerely, when we got something wrong. No groveling.
- We CAN offer: (for example: a replacement, a credit up to $20, a free delivery)
- We CANNOT offer without the owner's OK: (for example: refunds over $50, compensation)
- Never admit legal liability or blame a staff member by name.
- Never give medical, allergy or safety guarantees.
- Sign off as: (name or "The [Business] team")
- Every reply is read by a person before it is sent.
""",
    "05-Weekly-Planner.md": """# Weekly Planner (for Workflow 82)

**Week of:**

**The three things that matter most this week:**
1.
2.
3.

**Appointments and deadlines:**

**Marketing this week:** (newsletter? posts? offer?)

**Money this week:** (invoices to send, bills to pay, receipts to sort)

**People this week:** (staff, suppliers, customers to call back)

**One thing to stop doing:**
""",
    "06-AI-Use-Policy.md": """# AI Use Policy (draft - adapt for your business)

1. **What we use AI for:** drafting emails, posts, documents and summaries; organizing information; ideas.
2. **Never paste into AI tools:** passwords, card or bank details, ID numbers, customers' or staff health information, anything marked confidential.
3. **A person reads everything** before it is sent to a customer, posted or used in a decision.
4. **Honesty:** no fake reviews or testimonials; never present AI as a named human in a live chat.
5. **Money, law, tax and HR:** AI helps prepare; a qualified person decides.
6. **Questions:** ask (name).

Last reviewed:
""",
    "07-Monthly-Review.md": """# Monthly Business Review (for Workflow 90)

**Month:**

**Sales this month vs last month:**
**Best-selling products or services:**
**Marketing that worked / didn't:**
**Customer feedback (themes):**
**Problems and how we solved them:**
**Money: cash in the bank, unpaid invoices, big costs coming:**
**Next month's three priorities:**
""",
    "08-Hiring-Scorecard.md": """# Interview Scorecard (for Workflow 64)

**Role:**   **Candidate (initials):**   **Interviewer:**   **Date:**

| Skill or quality | Question asked | Evidence heard | Score 1-5 |
| --- | --- | --- | --- |
| | | | |
| | | | |
| | | | |
| | | | |

**Overall notes:**
**Recommend for next stage?** Yes / No / Unsure

Score every candidate on the same criteria, with evidence, before discussing them.
""",
}


def write_index_appendix(ws):
    """Appendix B in the book is generated from the same data, so it can never drift."""
    lines = ["# Appendix B: Workflow Index", "",
             "All 100 workflows at a glance, grouped by chapter. The same list is in the bonus file "
             "Workflow-Index.csv, which you can sort and filter in a spreadsheet.", ""]
    chapter = None
    for w in ws:
        if w["chapter"] != chapter:
            chapter = w["chapter"]
            lines += ["", f"## {chapter}", "", "| No. | Workflow | Use it when |"]
        use = w["use"].rstrip(".")
        lines.append(f"| {w['num']} | {w['title']} | {use[0].upper() + use[1:]} |")
    (MS / "21-appendix-b-index.md").write_text("\n".join(lines) + "\n")


def build_bonus():
    ws = workflows()
    OUT.mkdir(exist_ok=True)
    (OUT / "templates").mkdir(exist_ok=True)
    md = ["# Claude AI for Small Business: Prompt Library", "",
          "Every prompt from the book, in order. Replace each [bracket] with your own details.", ""]
    txt = ["CLAUDE AI FOR SMALL BUSINESS - PROMPT LIBRARY", "",
           "Every prompt from the book. Replace each [bracket] with your own details.", ""]
    chapter = None
    for w in ws:
        if w["chapter"] != chapter:
            chapter = w["chapter"]
            md += [f"## {chapter}", ""]
            txt += ["=" * 60, chapter.upper(), "=" * 60, ""]
        md += [f"### Workflow {w['num']}: {w['title']}", "", f"*Use it when:* {w['use']}", "",
               "```", w["prompt"], "```", "", f"*Make it better:* {w['better']}", ""]
        txt += [f"WORKFLOW {w['num']}: {w['title'].upper()}", f"Use it when: {w['use']}", "",
                w["prompt"], "", f"Make it better: {w['better']}", "", "-" * 60, ""]
    (OUT / "Prompt-Library.md").write_text("\n".join(md))
    (OUT / "Prompt-Library.txt").write_text("\n".join(txt))
    with open(OUT / "Workflow-Index.csv", "w", newline="") as fh:
        wr = csv.writer(fh)
        wr.writerow(["Workflow", "Title", "Chapter", "Use it when", "Time saved"])
        for w in ws:
            wr.writerow([w["num"], w["title"], w["chapter"], w["use"], w["saved"]])
    for name, body in TEMPLATES.items():
        (OUT / "templates" / name).write_text(body)
    (OUT / "README.md").write_text(
        "# Bonus Files: Claude AI for Small Business\n\n"
        "Free downloads for readers of *Claude AI for Small Business: 100 Ready-to-Use Workflows to Automate "
        "Emails, Marketing, Admin and Customer Service, No Coding Needed* by Aadhavan Muthurengan.\n\n"
        "To save everything at once, click the green **Code** button and choose **Download ZIP**.\n\n"
        "- `Prompt-Library.md` / `.txt`: all 100 prompts, ready to copy.\n"
        "- `Workflow-Index.csv`: open in any spreadsheet to sort and filter the workflows.\n"
        "- `templates/`: business profile, brand voice guide, FAQ sheet, reply rules, weekly planner, "
        "AI use policy, monthly review and interview scorecard.\n\n"
        "You may use and adapt these files in your own business. Please don't republish or sell them.\n\n"
        "This book and these files are independent and are not affiliated with or endorsed by Anthropic. "
        "Claude is a trademark of Anthropic, PBC.\n")
    write_index_appendix(ws)
    print(f"bonus: {len(ws)} workflows, {len(TEMPLATES)} templates")
    return ws


if __name__ == "__main__":
    build_bonus()
