"""
Renders the Android TV launcher banner (assets/tv_banner.png, 320x180, the
size Android TV asks for: xhdpi banner) and the app icon (assets/icon.png,
512x512) from HTML: Reelhouse violet -> cyan gradient, the clapper board
art, and the name in Inter Black. Colors are the brand tokens in
src/theme/tokens.ts.

Usage: python3 scripts/make-brand-images.py [--chromium /path/to/chrome]
"""
import argparse
import base64
import os
import pathlib

from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parent.parent


def data_uri(path: pathlib.Path, mime: str) -> str:
    # Inline, because a page made with set_content may not load file:// URLs.
    return f'data:{mime};base64,' + base64.b64encode(path.read_bytes()).decode()


FONT = data_uri(ROOT / 'node_modules/@expo-google-fonts/inter/900Black/Inter_900Black.ttf', 'font/ttf')
ART = data_uri(ROOT / 'src/art/images/clapper-board.webp', 'image/webp')

BASE = f"""
<style>
@font-face {{ font-family: InterBlack; src: url('{FONT}'); }}
html, body {{ margin: 0; }}
.bg {{ position: relative; overflow: hidden;
  background: radial-gradient(120% 140% at 85% 20%, #22D3EE 0%, rgba(34,211,238,0) 45%),
              linear-gradient(135deg, #9B82FF 0%, #7C5CFF 45%, #2A1B6E 100%); }}
.name {{ font-family: InterBlack; color: #FFFFFF; position: absolute; letter-spacing: -0.02em;
  text-shadow: 0 2px 10px rgba(10,10,16,0.45); }}
img {{ position: absolute; }}
</style>
"""

BANNER = BASE + f"""
<div class="bg" style="width:320px;height:180px">
  <img src="{ART}" style="width:128px;height:128px;right:10px;top:28px;transform:rotate(8deg)">
  <div class="name" style="left:22px;top:52px;font-size:46px;line-height:46px">Reel<br>house</div>
  <div class="name" style="left:24px;top:150px;font-size:11px;letter-spacing:0.3em;color:#C3B5FF">STREAMING</div>
</div>
"""

ICON = BASE + f"""
<div class="bg" style="width:512px;height:512px">
  <img src="{ART}" style="width:250px;height:250px;right:40px;bottom:46px;transform:rotate(8deg)">
  <div class="name" style="left:64px;top:40px;font-size:300px;line-height:340px">R</div>
</div>
"""


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--chromium', default=os.environ.get('CHROMIUM_PATH'))
    args = ap.parse_args()
    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=args.chromium) if args.chromium else p.chromium.launch()
        for html, (w, h), out in [(BANNER, (320, 180), 'tv_banner.png'), (ICON, (512, 512), 'icon.png')]:
            page = browser.new_page(viewport={'width': w, 'height': h}, device_scale_factor=1)
            page.set_content(html)
            page.evaluate('document.fonts.ready')
            page.wait_for_timeout(400)
            page.screenshot(path=str(ROOT / 'assets' / out), clip={'x': 0, 'y': 0, 'width': w, 'height': h})
            print('wrote assets/' + out)
        browser.close()


if __name__ == '__main__':
    main()
