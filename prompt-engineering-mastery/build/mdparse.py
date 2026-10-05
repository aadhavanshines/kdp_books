"""Minimal Markdown block parser for the manuscript.

Supports exactly the subset the manuscript uses: headings (#, ##, ###),
paragraphs, bullet and numbered lists, fenced code blocks, blockquote
callouts, and pipe tables. Inline markup (**bold**, *italic*, `code`) is
left in the text and converted by each renderer.
"""
import re
from pathlib import Path

CALLOUT_RE = re.compile(r"^\*\*(Tip|Try It|Warning|Note):\*\*\s*(.*)$", re.S)


def parse_blocks(text):
    lines = text.splitlines()
    blocks = []
    i = 0
    n = len(lines)

    def is_special(line):
        s = line.strip()
        return (
            not s
            or s.startswith("#")
            or s.startswith("![")
            or s.startswith("```")
            or s.startswith(">")
            or s.startswith("|")
            or re.match(r"^[-*] ", s)
            or re.match(r"^\d+\. ", s)
        )

    while i < n:
        line = lines[i]
        s = line.strip()
        if not s:
            i += 1
            continue
        if s.startswith("```"):
            i += 1
            code = []
            while i < n and not lines[i].strip().startswith("```"):
                code.append(lines[i])
                i += 1
            i += 1
            blocks.append(("code", "\n".join(code)))
            continue
        m = re.match(r"^!\[(.*)\]\((.+)\)$", s)
        if m:
            blocks.append(("image", m.group(2), m.group(1)))
            i += 1
            continue
        m = re.match(r"^(#{1,3}) (.*)$", s)
        if m:
            level = len(m.group(1))
            title = m.group(2).strip()
            if level == 1 and re.match(r"^Part [IVX]+:", title):
                blocks.append(("part", title))
            elif level == 1:
                blocks.append(("chapter", title))
            else:
                blocks.append((f"h{level}", title))
            i += 1
            continue
        if s.startswith(">"):
            quote = []
            while i < n and lines[i].strip().startswith(">"):
                quote.append(lines[i].strip()[1:].strip())
                i += 1
            body = " ".join(q for q in quote if q)
            cm = CALLOUT_RE.match(body)
            if cm:
                blocks.append(("callout", cm.group(1), cm.group(2)))
            else:
                blocks.append(("callout", "", body))
            continue
        if s.startswith("|"):
            rows = []
            while i < n and lines[i].strip().startswith("|"):
                row = lines[i].strip().strip("|")
                cells = [c.strip() for c in row.split("|")]
                if not all(re.match(r"^:?-+:?$", c) for c in cells):
                    rows.append(cells)
                i += 1
            blocks.append(("table", rows))
            continue
        if re.match(r"^[-*] ", s):
            items = []
            while i < n and re.match(r"^[-*] ", lines[i].strip()):
                item = lines[i].strip()[2:]
                i += 1
                while i < n and lines[i].startswith("  ") and lines[i].strip() and not is_special(lines[i]):
                    item += " " + lines[i].strip()
                    i += 1
                items.append(item)
            blocks.append(("ul", items))
            continue
        if re.match(r"^\d+\. ", s):
            items = []
            while i < n and re.match(r"^\d+\. ", lines[i].strip()):
                item = re.sub(r"^\d+\. ", "", lines[i].strip())
                i += 1
                while i < n and lines[i].startswith("  ") and lines[i].strip() and not is_special(lines[i]):
                    item += " " + lines[i].strip()
                    i += 1
                items.append(item)
            blocks.append(("ol", items))
            continue
        para = [s]
        i += 1
        while i < n and not is_special(lines[i]):
            para.append(lines[i].strip())
            i += 1
        blocks.append(("p", " ".join(para)))
    return blocks


def load_manuscript(manuscript_dir):
    """Return a list of (filename, blocks) in reading order."""
    files = sorted(Path(manuscript_dir).glob("*.md"))
    return [(f.name, parse_blocks(f.read_text(encoding="utf-8"))) for f in files]
