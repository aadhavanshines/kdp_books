import subprocess
import sys
from datetime import date
from pathlib import Path

import pytest

import expenses


@pytest.fixture
def csv_path(tmp_path):
    return tmp_path / "expenses.csv"


def run(csv_path, *argv):
    return expenses.main(list(argv), path=csv_path)


def test_add_and_list(csv_path, capsys):
    assert run(csv_path, "add", "12.50", "food", "Lunch with Sam", "--date", "2026-10-02") == 0
    capsys.readouterr()
    assert run(csv_path, "list") == 0
    out = capsys.readouterr().out
    assert "2026-10-02" in out and "12.50" in out and "food" in out and "Lunch with Sam" in out


def test_add_defaults_to_today(csv_path):
    run(csv_path, "add", "5", "food")
    assert expenses.load_expenses(csv_path)[0]["date"] == date.today().isoformat()


def test_description_with_comma_and_quotes_roundtrips(csv_path):
    run(csv_path, "add", "5", "food", 'Tea, "large"', "--date", "2026-10-01")
    assert expenses.load_expenses(csv_path)[0]["description"] == 'Tea, "large"'


def test_csv_has_header_once(csv_path):
    run(csv_path, "add", "1", "a")
    run(csv_path, "add", "2", "b")
    lines = csv_path.read_text().splitlines()
    assert lines[0] == "date,amount,category,description"
    assert len(lines) == 3


@pytest.mark.parametrize("amount", ["-5", "0", "abc", "nan", "inf", "1.234", "", "1e30"])
def test_bad_amount(csv_path, capsys, amount):
    assert run(csv_path, "add", amount, "food") == 1
    assert "Error:" in capsys.readouterr().err
    assert not csv_path.exists()


@pytest.mark.parametrize("bad", ["01-10-2026", "2026/10/01", "2026-13-01", "2026-02-30", "tomorrow"])
def test_bad_date(csv_path, capsys, bad):
    assert run(csv_path, "add", "5", "food", "--date", bad) == 1
    assert "YYYY-MM-DD" in capsys.readouterr().err
    assert not csv_path.exists()


def test_bad_month(csv_path, capsys):
    assert run(csv_path, "summary", "--month", "October") == 1
    assert "YYYY-MM" in capsys.readouterr().err


def test_empty_category(csv_path, capsys):
    assert run(csv_path, "add", "5", "  ") == 1
    assert "Category" in capsys.readouterr().err


def test_empty_list_and_summary(csv_path, capsys):
    assert run(csv_path, "list") == 0
    assert run(csv_path, "summary") == 0
    assert capsys.readouterr().out.count("No expenses yet.") == 2


def test_summary_sorted_biggest_first_with_total(csv_path, capsys):
    run(csv_path, "add", "10", "food", "--date", "2026-10-01")
    run(csv_path, "add", "40", "transport", "--date", "2026-10-01")
    run(csv_path, "add", "5.25", "Food", "--date", "2026-10-03")
    capsys.readouterr()
    run(csv_path, "summary")
    lines = capsys.readouterr().out.splitlines()
    assert lines[0].split() == ["transport", "40.00"]
    assert lines[1].split() == ["food", "15.25"]
    assert lines[-1].split() == ["TOTAL", "55.25"]


def test_summary_by_month(csv_path, capsys):
    run(csv_path, "add", "10", "food", "--date", "2026-09-30")
    run(csv_path, "add", "20", "food", "--date", "2026-10-01")
    capsys.readouterr()
    run(csv_path, "summary", "--month", "2026-10")
    out = capsys.readouterr().out
    assert "20.00" in out and "10.00" not in out
    run(csv_path, "summary", "--month", "2025-01")
    assert "No expenses for 2025-01." in capsys.readouterr().out


def test_decimal_totals_are_exact(csv_path, capsys):
    for _ in range(3):
        run(csv_path, "add", "0.10", "x", "--date", "2026-10-01")
    capsys.readouterr()
    run(csv_path, "summary")
    assert capsys.readouterr().out.splitlines()[-1].split() == ["TOTAL", "0.30"]


def test_malformed_csv_gives_friendly_error(csv_path, capsys):
    csv_path.write_text("date,amount,category,description\n2026-10-01,oops,food,x\n")
    assert run(csv_path, "list") == 1
    assert "malformed" in capsys.readouterr().err


def test_cli_uses_csv_next_to_script(tmp_path):
    script = Path(expenses.__file__).resolve()
    copy = tmp_path / "expenses.py"
    copy.write_text(script.read_text())
    r = subprocess.run([sys.executable, str(copy), "add", "3", "food"], cwd="/", capture_output=True, text=True)
    assert r.returncode == 0, r.stderr
    assert (tmp_path / "expenses.csv").exists()


def test_cli_error_has_no_traceback(tmp_path):
    script = Path(expenses.__file__).resolve()
    r = subprocess.run([sys.executable, str(script), "add", "-5", "food"], capture_output=True, text=True)
    assert "Traceback" not in r.stderr
