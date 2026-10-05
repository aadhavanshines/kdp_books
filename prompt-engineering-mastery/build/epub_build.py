"""Build the Kindle eBook as EPUB 3 (KDP accepts EPUB uploads directly)."""
import html
import re

from ebooklib import epub

CSS = """
body { font-family: serif; line-height: 1.45; margin: 0 4%; }
h1 { font-family: sans-serif; color: #1F3A5F; font-size: 1.7em; margin: 1.6em 0 0.2em; line-height: 1.2; }
h1.part { text-align: center; margin-top: 30%; font-size: 2em; }
p.partnum, p.chapnum { font-family: sans-serif; color: #555; letter-spacing: 0.08em; margin: 2em 0 0; font-size: 0.9em; }
p.partnum { text-align: center; margin-top: 25%; }
h2 { font-family: sans-serif; color: #1F3A5F; font-size: 1.25em; margin: 1.4em 0 0.4em; }
h3 { font-family: sans-serif; font-size: 1.05em; margin: 1.2em 0 0.3em; }
p { margin: 0 0 0.7em; text-indent: 0; }
pre { font-family: monospace; font-size: 0.8em; background: #F1F3F6; border: 1px solid #B8C2CF;
      padding: 0.6em; white-space: pre-wrap; word-wrap: break-word; }
code { font-family: monospace; font-size: 0.9em; }
div.callout { background: #EAF0F7; border-left: 4px solid #1F3A5F; padding: 0.5em 0.8em; margin: 0.8em 0 1em; }
div.callout p { margin: 0; }
table { border-collapse: collapse; width: 100%; margin: 0.6em 0 1em; font-size: 0.85em; }
th { background: #1F3A5F; color: #fff; font-family: sans-serif; text-align: left; padding: 0.3em; }
td { border: 1px solid #B8C2CF; padding: 0.3em; vertical-align: top; }
li { margin-bottom: 0.3em; }
.center { text-align: center; }
.title { font-family: sans-serif; color: #1F3A5F; font-size: 2.2em; text-align: center; margin-top: 25%; }
.subtitle { font-style: italic; text-align: center; color: #555; }
.author { font-family: sans-serif; text-align: center; font-size: 1.3em; margin-top: 3em; }
.small { font-size: 0.8em; }
"""


def inline(text):
    parts = re.split(r"(`[^`]+`)", text)
    out = []
    for part in parts:
        if part.startswith("`") and part.endswith("`") and len(part) > 1:
            out.append(f"<code>{html.escape(part[1:-1])}</code>")
        else:
            t = html.escape(part, quote=False)
            t = re.sub(r"\*\*(.+?)\*\*", r"<strong>\1</strong>", t)
            t = re.sub(r"(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])", r"<em>\1</em>", t)
            out.append(t)
    return "".join(out)


def blocks_to_html(blocks):
    out = []
    for b in blocks:
        kind = b[0]
        if kind == "part":
            num, title = b[1].split(":", 1)
            out.append(f'<p class="partnum">{html.escape(num.strip().upper())}</p>')
            out.append(f'<h1 class="part">{html.escape(title.strip())}</h1>')
        elif kind == "chapter":
            m = re.match(r"^Chapter (\d+): (.*)$", b[1])
            if m:
                out.append(f'<p class="chapnum">CHAPTER {m.group(1)}</p>')
                out.append(f"<h1>{html.escape(m.group(2))}</h1>")
            else:
                out.append(f"<h1>{html.escape(b[1])}</h1>")
        elif kind in ("h2", "h3"):
            out.append(f"<{kind}>{inline(b[1])}</{kind}>")
        elif kind == "p":
            out.append(f"<p>{inline(b[1])}</p>")
        elif kind in ("ul", "ol"):
            items = "".join(f"<li>{inline(i)}</li>" for i in b[1])
            out.append(f"<{kind}>{items}</{kind}>")
        elif kind == "code":
            out.append(f"<pre>{html.escape(b[1])}</pre>")
        elif kind == "callout":
            label = f"<strong>{b[1]}:</strong> " if b[1] else ""
            out.append(f'<div class="callout"><p>{label}{inline(b[2])}</p></div>')
        elif kind == "table":
            rows = b[1]
            head = "".join(f"<th>{inline(c)}</th>" for c in rows[0])
            body = "".join("<tr>" + "".join(f"<td>{inline(c)}</td>" for c in r) + "</tr>" for r in rows[1:])
            out.append(f"<table><thead><tr>{head}</tr></thead><tbody>{body}</tbody></table>")
    return "\n".join(out)


def split_parts(manuscript):
    """Split files that start with a Part heading into a part page and the chapter."""
    sections = []
    for fname, blocks in manuscript:
        if blocks and blocks[0][0] == "part":
            sections.append((fname.replace(".md", "-part"), blocks[0][1], [blocks[0]], True))
            blocks = blocks[1:]
        title = next(b[1] for b in blocks if b[0] == "chapter")
        sections.append((fname.replace(".md", ""), title, blocks, False))
    return sections


def build_epub(meta, manuscript, cover_jpg, out_path):
    book = epub.EpubBook()
    book.set_identifier(meta["identifier"])
    book.set_title(meta["title"])
    book.set_language(meta["language"])
    book.add_author(meta["author"])
    book.add_metadata("DC", "description", meta["subtitle"])
    book.add_metadata("DC", "rights", f"Copyright {meta['year']} {meta['author']}. All rights reserved.")
    book.set_cover("cover.jpg", open(cover_jpg, "rb").read(), create_page=False)

    style = epub.EpubItem(uid="style", file_name="style/book.css", media_type="text/css",
                          content=CSS.encode())
    book.add_item(style)

    def page(uid, title, body):
        c = epub.EpubHtml(uid=uid, title=title, file_name=f"{uid}.xhtml", lang=meta["language"])
        c.content = body
        c.add_item(style)
        book.add_item(c)
        return c

    title_page = page("title", "Title Page",
                      f'<p class="title">{html.escape(meta["title"])}</p>'
                      f'<p class="subtitle">{html.escape(meta["subtitle"])}</p>'
                      f'<p class="author">{html.escape(meta["author"])}</p>')
    copyright_page = page("copyright", "Copyright",
                          f'<div class="small"><p>Copyright &#169; {meta["year"]} {html.escape(meta["author"])}. '
                          "All rights reserved.</p><p>No part of this publication may be reproduced, "
                          "distributed, or transmitted in any form without the prior written permission of "
                          "the author, except for brief quotations in reviews. Readers may freely use and "
                          "adapt the example prompts in this book for their own work.</p>"
                          "<p><strong>Disclaimer.</strong> This book is for educational purposes only. AI "
                          "products, features, and policies change frequently; verify current details with "
                          "each provider. Nothing in this book is legal, medical, financial, or other "
                          "professional advice.</p><p><strong>Trademarks.</strong> All product names, "
                          "including ChatGPT, Claude, Gemini, Copilot, Midjourney, and others mentioned, "
                          "are trademarks of their respective owners. This book is independent and not "
                          "affiliated with, sponsored by, or endorsed by any of these companies.</p>"
                          "<p><strong>Examples.</strong> All companies, products, people, and data in the "
                          "examples are fictional. Any resemblance to real organizations or persons is "
                          "coincidental.</p>"
                          f"<p>First edition, {meta['year']}.</p></div>")

    spine = [title_page, copyright_page, "nav"]
    toc = []
    current_part = None
    for uid, title, blocks, is_part in split_parts(manuscript):
        uid = re.sub(r"[^a-z0-9-]", "-", uid.lower())
        uid = "s" + uid
        c = page(uid, title, blocks_to_html(blocks))
        spine.append(c)
        if is_part:
            current_part = (epub.Section(title, href=c.file_name), [])
            toc.append(current_part)
        elif current_part is not None and title.startswith("Chapter"):
            current_part[1].append(c)
        else:
            current_part = None
            toc.append(c)

    book.toc = toc
    book.add_item(epub.EpubNcx())
    nav = epub.EpubNav()
    nav.add_item(style)
    book.add_item(nav)
    book.spine = spine
    epub.write_epub(str(out_path), book)
