"""Preview sheets: every step of each subject in a category, as one PNG."""
import sys, importlib, cairosvg
sys.path.insert(0, __file__.rsplit("/", 1)[0])
from draw import step_svg

def sheet(mod_name, out):
    mod = importlib.import_module(mod_name)
    subs = mod.SUBJECTS
    cell, cols = 150, 7
    rows = len(subs)
    parts = []
    for i, s in enumerate(subs):
        n = len(s["steps"])
        parts.append(f'<text x="6" y="{i*cell+16}" font-family="Fredoka Light" font-weight="700" font-size="14">{s["name"]}</text>')
        for j in range(n):
            body = step_svg(s["steps"], j, final=False)
            parts.append(f'<g transform="translate({j*cell} {i*cell+10}) scale(0.7)">{body}</g>')
        body = step_svg(s["steps"], n-1, final=True)
        parts.append(f'<g transform="translate({6*cell} {i*cell+10}) scale(0.7)">{body}</g>')
        parts.append(f'<line x1="0" x2="{cols*cell}" y1="{(i+1)*cell}" y2="{(i+1)*cell}" stroke="#ddd"/>')
    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" width="{cols*cell}" height="{rows*cell}">'
           f'<rect width="100%" height="100%" fill="#fff"/>{"".join(parts)}</svg>')
    cairosvg.svg2png(bytestring=svg.encode(), write_to=out)

if __name__ == "__main__":
    sheet(sys.argv[1], sys.argv[2])
