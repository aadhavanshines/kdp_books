# Prompt Engineering Mastery

**The Complete Beginner-to-Advanced Guide to Getting Better Results from Today's Most Popular AI Chatbots, Coding Assistants, and Image Generators**

by **Aadhavan Muthurengan**

A practical guide of about 35,000 words (195 pages in 6 x 9 paperback, with 12 diagrams) that goes from a reader's first prompt to system prompts, RAG, agents, evaluation, and prompt-injection defense, with chapters on each major AI tool and 50 ready-to-use templates.

## Ready-to-Upload Files (`dist/`)

| File | KDP format | Upload as |
| --- | --- | --- |
| `prompt-engineering-mastery.epub` | Kindle eBook | Manuscript (passes EPUBCheck 5.1 with no errors) |
| `ebook-cover.jpg` | Kindle eBook | Cover, 1600 x 2560 px |
| `paperback-interior-6x9.pdf` | Paperback | Manuscript: 6 x 9 in, no bleed, all fonts embedded, chapters start on right-hand pages |
| `paperback-cover.pdf` | Paperback | Full-wrap cover: back, spine, and front with 0.125 in bleed, 300 DPI |
| `paperback-cover-preview.png` | — | Preview image of the full wrap cover |
| `build-info.json` | — | Page count, word count, and spine width used for the cover |

Listing details (title, description, keywords, categories, pricing, and the AI disclosure answers) are in [`metadata/kdp-listing.md`](metadata/kdp-listing.md).

## Contents

- Introduction
- **Part I: Foundations**: What prompt engineering is; how LLMs read prompts; the six-part prompt blueprint; core techniques
- **Part II: Intermediate Techniques**: Reasoning (chain of thought, reflection); structured output; debugging prompts; everyday prompt patterns
- **Part III: Prompting the Popular AI Tools**: ChatGPT; Claude; Gemini; Copilot, Perplexity, Meta AI, Grok, DeepSeek, Mistral, and open models; coding assistants; prompt engineering for images; prompt engineering for video and audio
- **Part IV: Advanced Prompt Engineering**: System prompts and APIs; RAG and context engineering; agents and tool use; MCP in practice (browser control, files, apps); building custom agents and agent architectures; evaluation; security and ethics; the future
- Appendices: 50-prompt library, troubleshooting table, glossary, about the author

## How to Publish on Amazon KDP

1. Sign in at [kdp.amazon.com](https://kdp.amazon.com) (create an account and complete the tax and payment information if you have not already).
2. **Kindle eBook:** Click **+ Create**, then **Kindle eBook**.
   - *Details:* enter the values from `metadata/kdp-listing.md`. Answer the AI-generated content questions as listed there.
   - *Content:* upload `dist/prompt-engineering-mastery.epub` as the manuscript and `dist/ebook-cover.jpg` as the cover. Open **Launch Previewer** and page through the book.
   - *Pricing:* choose territories, the 70% royalty, and the price, then click **Publish Your Kindle eBook**.
3. **Paperback:** On your Bookshelf, click **+ Create paperback** next to the eBook so the details carry over.
   - *Content:* get a free KDP ISBN; choose black-and-white on white paper, 6 x 9 in, no bleed; upload `dist/paperback-interior-6x9.pdf`; choose **Upload a cover you already have** and upload `dist/paperback-cover.pdf`. Run **Launch Previewer** and fix anything it flags.
   - *Pricing:* set the price, then either order a printed proof (recommended) or click **Publish Your Paperback Book**.
4. Amazon reviews new titles, usually within 72 hours. When both formats are live, Amazon links them on one product page.

## Before You Publish

- **Read the whole manuscript.** You are the author and are responsible for its accuracy. Add your own experience and examples where you can; it makes the book more valuable and distinctive.
- **Review `manuscript/26-about-the-author.md`** with your real background.
- If you change anything, rebuild (see below) so the page count, table of contents, and spine width stay correct.

## Rebuilding

The manuscript lives in `manuscript/` as Markdown, one file per chapter, in reading order. Book metadata is in `book.json`.

```bash
pip install reportlab ebooklib pillow
python3 build/build.py
```

The build regenerates everything in `dist/`. It uses the Liberation and DejaVu fonts found in `/usr/share/fonts/truetype` on most Linux systems (on Ubuntu or Debian: `apt install fonts-liberation fonts-dejavu-core`).
