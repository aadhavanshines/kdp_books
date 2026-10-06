"""Project 2: the to-do app from Chapter 6, checked in a real browser."""
from conftest import PROJECTS

URL = (PROJECTS / "02-todo-app" / "index.html").as_uri()


def add(page, *texts):
    for t in texts:
        page.fill("#new-task", t)
        page.press("#new-task", "Enter")


def labels(page):
    return page.locator("#task-list .task-label").all_text_contents()


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
    page.dblclick("#task-list .task-label >> text=Old text")
    page.fill(".edit-input", "New text")
    page.press(".edit-input", "Enter")
    assert labels(page) == ["New text", "Keep me"]
    page.dblclick("#task-list .task-label >> text=Keep me")
    page.fill(".edit-input", "Changed")
    page.press(".edit-input", "Escape")
    assert labels(page) == ["New text", "Keep me"]
    page.dblclick("#task-list .task-label >> text=New text")
    page.fill(".edit-input", "  ")
    page.press(".edit-input", "Enter")
    assert labels(page) == ["Keep me"]


def test_delete(page):
    page.goto(URL)
    add(page, "One", "Two")
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
    due = {li.locator(".task-label").text_content(): (li.locator(".due").all_text_contents() or [""])[0]
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


# --- Chapter 8: the UX and accessibility redesign -------------------------------------

import os


@pytest.fixture
def phone(browser):
    ctx = browser.new_context(viewport={"width": 390, "height": 844}, has_touch=True, is_mobile=True,
                              locale="en-US")
    page = ctx.new_page()
    page.goto(URL)
    add(page, "Buy milk", "Call the dentist")
    yield page
    ctx.close()


def test_delete_is_visible_on_touchscreens(phone):
    for i in range(phone.locator(".delete").count()):
        assert phone.locator(".delete").nth(i).evaluate("e => getComputedStyle(e).opacity") == "1"


def test_tap_targets_are_at_least_44px(phone):
    for el in phone.locator("button").all():
        box = el.bounding_box()
        assert box["height"] >= 44, el.text_content()
    # The checkbox is drawn at 24 px but sits in a 44 x 44 tap area: taps 18 px away still toggle it.
    cb = phone.locator("#task-list input[type=checkbox]").first
    r = cb.bounding_box()
    cx, cy = r["x"] + r["width"] / 2, r["y"] + r["height"] / 2
    for dx, dy in [(-18, 0), (18, 0), (0, -18), (0, 18)]:
        before = cb.is_checked()
        phone.touchscreen.tap(cx + dx, cy + dy)
        assert cb.is_checked() != before


def test_controls_have_accessible_names(phone):
    assert phone.get_by_label("Due date (optional)").count() == 1
    assert phone.get_by_role("checkbox", name="Buy milk").count() == 1
    assert phone.get_by_role("button", name="Delete Buy milk").count() == 1
    assert phone.get_by_role("button", name="Edit Buy milk").count() == 1


@pytest.mark.skipif(not os.environ.get("AXE_PATH"), reason="set AXE_PATH to axe.min.js from the axe-core package")
def test_no_axe_violations(phone):
    phone.add_script_tag(path=os.environ["AXE_PATH"])
    res = phone.evaluate("async () => await axe.run(document, {runOnly: ['wcag2a','wcag2aa','wcag21aa','best-practice']})")
    assert [v["id"] for v in res["violations"]] == []


def test_enter_saves_and_closes_the_editor(page):
    """Two real-browser regressions from Chapter 8's redesign, both missed by simulated tests."""
    page.goto(URL)
    add(page, "Old text")
    page.dblclick("#task-list .task-label >> text=Old text")   # double-click must open the editor
    assert page.locator(".edit-input").count() == 1
    page.fill(".edit-input", "New text")
    page.press(".edit-input", "Enter")                          # Enter must save AND close it
    assert page.locator(".edit-input").count() == 0
    assert labels(page) == ["New text"]
