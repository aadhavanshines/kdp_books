"""Project 4: the habit tracker from Chapter 10. Runs Claude's tests, then drives the real page."""
import shutil
import socket
import subprocess
import sys
import time
import urllib.request

import pytest
from conftest import PROJECTS

SRC = PROJECTS / "04-habit-tracker"


def test_claudes_own_suite():
    r = subprocess.run([sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", str(SRC)],
                       capture_output=True, text=True, cwd=SRC)
    assert r.returncode == 0, r.stdout


@pytest.fixture
def server(tmp_path):
    shutil.copytree(SRC, tmp_path / "app")
    with socket.socket() as s:
        s.bind(("127.0.0.1", 0))
        port = s.getsockname()[1]
    proc = subprocess.Popen([sys.executable, "app.py"], cwd=tmp_path / "app",
                            env={"PORT": str(port), "PATH": "/usr/bin:/bin"},
                            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    url = f"http://127.0.0.1:{port}"
    for _ in range(50):
        try:
            urllib.request.urlopen(url + "/api/habits")
            break
        except OSError:
            time.sleep(0.1)
    yield url
    proc.terminate()
    proc.wait()


def test_page_add_toggle_delete(page, server):
    page.goto(server)
    assert page.is_visible("#empty")
    page.fill("#name", "Drink water")
    page.press("#name", "Enter")
    habit = page.locator(".habit", has_text="Drink water")
    habit.wait_for()
    assert habit.locator(".day").count() == 7
    habit.locator(".day.today").click()
    page.wait_for_selector(".day.today.done")
    assert "Current streak: 1" in habit.locator(".streaks").text_content()
    # Duplicate names are rejected with a friendly message (409 from the API).
    page.fill("#name", "drink WATER")
    page.press("#name", "Enter")
    page.wait_for_selector("#error:has-text('already exists')")
    # Delete asks for confirmation first.
    page.once("dialog", lambda d: d.accept())
    habit.locator(".delete").click()
    page.wait_for_selector("#empty:not([hidden])")


def test_today_is_the_users_today(browser, server):
    """The Chapter 9 bug: 8 p.m. in California is already tomorrow in UTC."""
    import datetime as dt
    server_today = dt.datetime.now(dt.timezone.utc).date()  # the test server runs in UTC
    # 3 a.m. UTC on the server's date is 8 p.m. the previous evening in California.
    utc_3am = dt.datetime.combine(server_today, dt.time(3, 0), tzinfo=dt.timezone.utc)
    ctx = browser.new_context(locale="en-US", timezone_id="America/Los_Angeles")
    page = ctx.new_page()
    page.clock.set_fixed_time(utc_3am)
    page.goto(server)
    page.fill("#name", "Read 20 pages")
    page.press("#name", "Enter")
    page.wait_for_selector(".day.today")
    users_today = (server_today - dt.timedelta(days=1)).isoformat()
    assert page.get_attribute(".day.today", "title") == users_today
    page.click(".day.today")
    page.wait_for_selector(".day.today.done")
    assert "Current streak: 1" in page.text_content(".streaks")
    ctx.close()


def test_rename_keeps_the_streak_and_version_shows(page, server):
    """Chapter 22: the rename feature request, released as 1.1.0."""
    page.goto(server)
    assert page.text_content("footer").strip().endswith("v1.1.0")
    page.fill("#name", "Excercise")
    page.press("#name", "Enter")
    habit = page.locator(".habit").first
    habit.locator(".day.today").click()
    page.wait_for_selector(".day.today.done")
    page.once("dialog", lambda d: d.accept("Exercise"))
    habit.locator(".rename").click()
    page.wait_for_selector(".habit-name:text-is('Exercise')")
    assert "Excercise" not in page.text_content("#habits")
    assert "Current streak: 1" in page.locator(".habit").first.locator(".streaks").text_content()
    # A name that's too long is refused, and the old name stays.
    page.once("dialog", lambda d: d.accept("x" * 31))
    page.locator(".habit .rename").first.click()
    page.wait_for_selector("#error:has-text('30 characters')")
    assert page.locator(".habit-name").first.text_content().strip() == "Exercise"
