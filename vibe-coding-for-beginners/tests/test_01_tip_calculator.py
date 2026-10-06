"""Project 1: the tip calculator from Chapter 5, checked in a real browser."""
from conftest import PROJECTS

URL = (PROJECTS / "01-tip-calculator" / "index.html").as_uri()


def fill(page, bill, people, tip="18%"):
    page.goto(URL)
    page.fill("#bill", str(bill))
    page.get_by_role("button", name=tip, exact=True).click()
    page.fill("#people", str(people))


def test_default_split(page):
    fill(page, 100, 3)
    assert page.text_content("#tipAmt") == "$18.00"
    assert page.text_content("#total") == "$118.00"
    assert page.text_content("#each") == "$39.33"


def test_round_up_each_share(page):
    fill(page, 100, 3)
    page.check("#roundUp")
    assert page.is_visible("#extraRow")
    assert page.text_content("#extraAmt") == "$2.00"
    assert page.text_content("#total") == "$120.00"
    assert page.text_content("#each") == "$40.00"


def test_round_up_odd_amounts(page):
    fill(page, 33.33, 7, tip="10%")
    page.check("#roundUp")
    assert page.text_content("#extraAmt") == "$5.34"
    assert page.text_content("#total") == "$42.00"
    assert page.text_content("#each") == "$6.00"


def test_custom_tip_and_stepper(page):
    page.goto(URL)
    page.fill("#bill", "50")
    page.get_by_role("button", name="Custom").click()
    page.fill("#custom", "25")
    page.click("#plus")  # 1 -> 2 people
    assert page.input_value("#people") == "2"
    assert page.text_content("#tipAmt") == "$12.50"
    assert page.text_content("#each") == "$31.25"


def test_bad_input_is_safe(page):
    fill(page, -40, 0)
    assert page.text_content("#total") == "$0.00"
    page.click("#minus")
    assert page.input_value("#people") == "1"
