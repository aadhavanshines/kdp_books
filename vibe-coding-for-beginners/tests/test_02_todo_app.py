"""Project 2: the to-do app from Chapter 6, checked in a real browser."""
from conftest import PROJECTS

URL = (PROJECTS / "02-todo-app" / "index.html").as_uri()


def add(page, *texts):
    for t in texts:
        page.fill("#new-task", t)
        page.press("#new-task", "Enter")


def labels(page):
    return page.locator("#task-list label").all_text_contents()


def test_add_ignores_empty(page):
    page.goto(URL)
    add(page, "Buy milk", "   ", "Call mum")
    assert labels(page) == ["Buy milk", "Call mum"]
    assert page.text_content("#count") == "2 items left"


def test_toggle_filter_and_clear(page):
    page.goto(URL)
    add(page, "A", "B", "C")
    page.locator("#task-list li", has_text="B").locator("input[type=checkbox]").check()
    assert page.text_content("#count") == "2 items left"
    page.click("button[data-filter=done]")
    assert labels(page) == ["B"]
    page.click("button[data-filter=active]")
    assert labels(page) == ["A", "C"]
    page.click("button[data-filter=all]")
    page.click("#clear-completed")
    assert labels(page) == ["A", "C"]


def test_edit_save_cancel_and_empty_deletes(page):
    page.goto(URL)
    add(page, "Old text", "Keep me")
    page.dblclick("#task-list label >> text=Old text")
    page.fill(".edit-input", "New text")
    page.press(".edit-input", "Enter")
    assert labels(page) == ["New text", "Keep me"]
    page.dblclick("#task-list label >> text=Keep me")
    page.fill(".edit-input", "Changed")
    page.press(".edit-input", "Escape")
    assert labels(page) == ["New text", "Keep me"]
    page.dblclick("#task-list label >> text=New text")
    page.fill(".edit-input", "  ")
    page.press(".edit-input", "Enter")
    assert labels(page) == ["Keep me"]


def test_delete(page):
    page.goto(URL)
    add(page, "One", "Two")
    page.locator("#task-list li", has_text="One").hover()
    page.locator("#task-list li", has_text="One").locator(".delete").click()
    assert labels(page) == ["Two"]


def test_survives_refresh(page):
    page.goto(URL)
    add(page, "Persist me")
    page.locator("#task-list input[type=checkbox]").check()
    page.reload()
    assert labels(page) == ["Persist me"]
    assert page.locator("#task-list input[type=checkbox]").is_checked()


def test_html_is_not_injected(page):
    page.goto(URL)
    add(page, "<b>bold?</b>")
    assert labels(page) == ["<b>bold?</b>"]
    assert page.locator("#task-list b").count() == 0


import datetime as dt
from zoneinfo import ZoneInfo

import pytest


@pytest.mark.parametrize("tz", ["America/Los_Angeles", "Asia/Tokyo"])
def test_due_dates_in_any_timezone(browser, tz):
    # Freeze the clock at 9 p.m. on Tue, Oct 6, 2026 local time, when many date bugs appear.
    ctx = browser.new_context(locale="en-US", timezone_id=tz)
    page = ctx.new_page()
    # The time zone must be explicit: a bare 9 p.m. would mean 9 p.m. on the test machine.
    page.clock.set_fixed_time(dt.datetime(2026, 10, 6, 21, 0, tzinfo=ZoneInfo(tz)))
    page.goto(URL)
    for text, due in [("Past", "2026-10-03"), ("Today", "2026-10-06"), ("Future", "2026-10-09"),
                      ("Next year", "2027-01-05"), ("No date", "")]:
        page.fill("#new-task", text)
        page.fill("#new-due", due)
        page.press("#new-task", "Enter")
    due = {li.locator("label").text_content(): (li.locator(".due").all_text_contents() or [""])[0]
           for li in page.locator("#task-list li").all()}
    assert due == {
        "Past": "Overdue · Sat, Oct 3",
        "Today": "Due today",
        "Future": "Due Fri, Oct 9",
        "Next year": "Due Tue, Jan 5, 2027",
        "No date": "",
    }
    assert page.locator("li.overdue").count() == 1
    page.locator("#task-list li", has_text="Past").locator("input[type=checkbox]").check()
    assert page.locator("li.overdue").count() == 0
    ctx.close()


def test_old_saved_tasks_still_load(page):
    page.goto(URL)
    page.evaluate("""localStorage.setItem('todo-tasks',
        JSON.stringify([{id: 1, text: 'From v1', done: false}]))""")
    page.reload()
    assert labels(page) == ["From v1"]
    assert page.locator(".due").count() == 0
