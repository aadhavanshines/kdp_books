"""Shared fixtures: a headless Chromium page for testing the book's web projects."""
from pathlib import Path

import os

import pytest
from playwright.sync_api import sync_playwright

PROJECTS = Path(__file__).resolve().parent.parent / "projects"


@pytest.fixture(scope="session")
def browser():
    with sync_playwright() as p:
        # Use a system Chromium when one is provided (CHROMIUM_PATH); otherwise Playwright's own.
        exe = os.environ.get("CHROMIUM_PATH") or None
        b = p.chromium.launch(executable_path=exe)
        yield b
        b.close()


@pytest.fixture
def page(browser):
    ctx = browser.new_context(locale="en-US", viewport={"width": 390, "height": 844})
    pg = ctx.new_page()
    errors = []
    pg.on("pageerror", lambda e: errors.append(str(e)))
    yield pg
    ctx.close()
    assert not errors, f"JavaScript errors on the page: {errors}"
