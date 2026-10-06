"""Project 6: the Sip mobile app (Expo), tested through its web build on a phone-sized screen.

Build first:  cd projects/06-sip && npm install && npx expo export --platform web
Then run with SIP_DIST=projects/06-sip/dist (the tests are skipped otherwise).
"""
import datetime as dt
import functools
import http.server
import os
import threading

import pytest
from conftest import PROJECTS

DIST = os.environ.get("SIP_DIST") or str(PROJECTS / "06-sip" / "dist")
pytestmark = pytest.mark.skipif(not os.path.exists(os.path.join(DIST, "index.html")),
                                reason="build the web version first (see module docstring)")


@pytest.fixture(scope="module")
def site():
    class Quiet(http.server.SimpleHTTPRequestHandler):
        def log_message(self, *args):
            pass
    srv = http.server.ThreadingHTTPServer(("127.0.0.1", 0), functools.partial(Quiet, directory=DIST))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    yield f"http://127.0.0.1:{srv.server_port}"
    srv.shutdown()


def phone(browser, scheme="light"):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True,
                              locale="en-US", color_scheme=scheme, timezone_id="America/New_York")
    return ctx, ctx.new_page()


def today_text(page):
    return page.get_by_label("Today's progress").locator("xpath=..").inner_text()


def test_log_undo_and_persist(browser, site):
    ctx, page = phone(browser)
    page.goto(site)
    page.get_by_role("button", name="+250 ml", exact=True).click()
    page.get_by_role("button", name="+250 ml", exact=True).click()
    page.get_by_role("button", name="+500 ml", exact=True).click()
    page.wait_for_selector("text=1,000 ml")
    assert "50%" in page.inner_text("body")
    page.get_by_role("button", name="Undo last", exact=True).click()
    page.wait_for_selector("text=500 ml")
    page.reload()
    page.wait_for_selector("text=of 2,000 ml goal")
    assert "500 ml" in page.inner_text("body") and "25%" in page.inner_text("body")
    ctx.close()


def test_change_goal_in_settings(browser, site):
    ctx, page = phone(browser)
    page.goto(site)
    page.get_by_role("button", name="+500 ml", exact=True).click()
    page.get_by_role("button", name="Settings").click()
    page.wait_for_url("**/settings")
    box = page.get_by_role("textbox").first
    box.fill("1000")
    page.get_by_role("button").filter(has_text="Save").first.click()
    page.goto(site)
    page.wait_for_selector("text=of 1,000 ml goal")
    assert "50%" in page.inner_text("body")
    ctx.close()


def test_new_day_starts_at_local_midnight(browser, site):
    ctx, page = phone(browser)
    page.clock.install(time=dt.datetime(2026, 10, 6, 23, 58, tzinfo=dt.timezone(dt.timedelta(hours=-4))))
    page.goto(site)
    page.get_by_role("button", name="+500 ml", exact=True).click()
    page.wait_for_selector("text=of 2,000 ml goal · 25%")
    page.clock.run_for("05:00")  # five minutes later it is a new day in New York
    page.reload()
    page.wait_for_selector("text=of 2,000 ml goal · 0%")
    assert page.get_by_label("Yesterday: 500 millilitres").count() == 1
    ctx.close()


def test_touch_targets_and_dark_mode(browser, site):
    ctx, page = phone(browser, "dark")
    page.goto(site)
    page.wait_for_selector("text=of 2,000 ml goal")
    for el in page.get_by_role("button").all() + page.get_by_role("link").all():
        box = el.bounding_box()
        assert box["height"] >= 44 and box["width"] >= 44, el.get_attribute("aria-label")
    bg = page.evaluate("""() => {
        let e = document.querySelector('[aria-label="+250 ml"]');
        while (e) { const c = getComputedStyle(e).backgroundColor;
                    if (c !== 'rgba(0, 0, 0, 0)') return c; e = e.parentElement; }
        return '';}""")
    ctx.close()
    assert bg  # a real color, checked below for darkness in the page background
    ctx, page = phone(browser, "dark")
    page.goto(site)
    page.wait_for_selector("text=of 2,000 ml goal")
    root_bg = page.evaluate("""() => { for (const e of document.querySelectorAll('div')) {
        const c = getComputedStyle(e).backgroundColor; if (c !== 'rgba(0, 0, 0, 0)') return c; } return ''; }""")
    r, g, b_ = [int(x) for x in root_bg[root_bg.index("(") + 1:root_bg.index(")")].split(",")[:3]]
    assert (r + g + b_) / 3 < 80, root_bg  # dark background in dark mode
    ctx.close()


@pytest.mark.skipif(not os.environ.get("AXE_PATH"), reason="set AXE_PATH to axe.min.js")
def test_no_axe_violations(browser, site):
    ctx, page = phone(browser)
    page.goto(site)
    page.wait_for_selector("text=of 2,000 ml goal")
    page.add_script_tag(path=os.environ["AXE_PATH"])
    res = page.evaluate("async () => await axe.run(document, {runOnly: ['wcag2a','wcag2aa','wcag21aa'], rules: {'label-content-name-mismatch': {enabled: true}}})")
    ctx.close()
    assert [(v["id"], len(v["nodes"])) for v in res["violations"]] == []
