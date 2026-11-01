"""
Drives the web build of Reelhouse TV in headless Chromium at 1920x1080
(device scale 1) using only the keys a remote has: arrows, Enter (select)
and Escape (back). Saves screenshots/NN-name.png and prints the focused
element after every step so focus behaviour can be checked from the log.

Usage: npm run export:web, then
  python3 scripts/serve.py 8765 &   # serves dist/
  python3 scripts/screenshots.py [--chromium /path/to/chrome]
"""
import argparse
import os

from playwright.sync_api import sync_playwright

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, '..', 'screenshots')
KEYS = {'U': 'ArrowUp', 'D': 'ArrowDown', 'L': 'ArrowLeft', 'R': 'ArrowRight', 'OK': 'Enter', 'BACK': 'Escape'}


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--url', default='http://localhost:8765/')
    ap.add_argument('--chromium', default=os.environ.get('CHROMIUM_PATH'))
    args = ap.parse_args()
    os.makedirs(OUT, exist_ok=True)

    with sync_playwright() as p:
        browser = p.chromium.launch(executable_path=args.chromium) if args.chromium else p.chromium.launch()
        page = browser.new_page(viewport={'width': 1920, 'height': 1080}, device_scale_factor=1)
        errors = []
        page.on('pageerror', lambda e: errors.append(str(e)))
        page.goto(args.url)
        page.wait_for_timeout(2500)

        def focused():
            return page.evaluate(
                "(() => { const a = document.activeElement; return a ? (a.getAttribute('aria-label') || a.tagName) : null })()"
            )

        def press(seq, pause=450):
            for token in seq.split():
                n = 1
                if '*' in token:
                    token, count = token.split('*')
                    n = int(count)
                for _ in range(n):
                    page.keyboard.press(KEYS[token])
                    page.wait_for_timeout(pause)
            print(f'  {seq:<28} -> {focused()}')

        def shot(name, settle=900):
            page.wait_for_timeout(settle)
            page.screenshot(path=os.path.join(OUT, f'{name}.png'))
            print(f'[{name}] focus: {focused()}')

        shot('01-profiles')
        press('OK')
        shot('02-home-hero', 1200)
        press('D')
        shot('03-home-continue-watching')
        press('D R*2')
        shot('04-home-top10')
        press('D R')
        shot('05-home-live-sports')
        press('D*3 R*2')
        shot('06-home-originals')
        press('OK')
        shot('07-details', 1200)
        press('D D R')
        shot('08-details-episodes')
        press('D')
        shot('09-details-more-like-this')
        press('BACK')
        shot('10-home-focus-restored')
        press('BACK L')
        shot('11-rail-expanded')
        press('U OK')
        press('D*3 OK')
        shot('12-search-keyboard')
        press('R*6')
        shot('13-search-results')
        press('BACK')
        print('  (Back in the rail returns to the page)')
        press('BACK')
        press('D OK')
        shot('14-player-controls', 1200)
        press('U')
        press('R')
        shot('15-player-seek')
        press('D R R OK')
        shot('16-player-audio-subtitles')
        press('BACK')
        page.wait_for_timeout(6500)
        shot('17-player-controls-hidden', 0)
        press('BACK')
        press('R OK')
        shot('18-player-next-episode', 1500)
        press('BACK')
        press('BACK L D*4 OK')
        shot('19-live-tv-guide', 1200)
        press('D*2 R')
        shot('20-live-tv-guide-later')
        press('L OK')
        shot('21-live-sports-player', 1200)
        press('BACK L D OK')
        shot('22-my-list', 1000)
        press('L U*4 OK')
        shot('23-movies', 1200)
        press('L D*5 OK')
        shot('24-settings', 1000)
        press('L U*8 OK')
        press('R*3 OK')
        shot('25-kids-home', 1200)

        if errors:
            print('PAGE ERRORS:', *errors, sep='\n  ')
        browser.close()


if __name__ == '__main__':
    main()
