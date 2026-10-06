"""Chapter 4: the first page Claude made, checked in a browser on a fixed date."""
import datetime as dt

from conftest import PROJECTS


def test_greets_and_shows_date(browser):
    ctx = browser.new_context(locale="en-US", timezone_id="Europe/London")
    page = ctx.new_page()
    page.clock.set_fixed_time(dt.datetime(2026, 10, 6, 9, 0, tzinfo=dt.timezone.utc))
    page.goto((PROJECTS / "00-hello" / "hello.html").as_uri())
    assert page.text_content("h1") == "Hello, Sam!"
    assert page.text_content("p") == "Today is Tuesday, October 6, 2026."
    ctx.close()
