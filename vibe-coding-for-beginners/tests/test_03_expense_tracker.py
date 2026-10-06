"""Project 3: run the expense tracker exactly as Chapter 9 shows, plus Claude's own test suite."""
import shutil
import subprocess
import sys

from conftest import PROJECTS

SRC = PROJECTS / "03-expense-tracker"


def run(tmp, *args):
    r = subprocess.run([sys.executable, "expenses.py", *args], cwd=tmp, capture_output=True, text=True)
    return r.returncode, r.stdout + r.stderr


def test_book_session(tmp_path):
    shutil.copy(SRC / "expenses.py", tmp_path)
    assert run(tmp_path, "add", "12.50", "food", "Lunch with Sam", "--date", "2026-10-06")[0] == 0
    assert run(tmp_path, "add", "40", "transport", "Train pass", "--date", "2026-10-01")[0] == 0
    assert run(tmp_path, "add", "8.25", "Food", "Coffee and cake", "--date", "2026-10-06")[0] == 0
    code, out = run(tmp_path, "summary")
    assert code == 0
    assert out.splitlines() == [
        "transport       40.00",
        "food            20.75",
        "---------------------",
        "TOTAL           60.75",
    ]
    assert run(tmp_path, "summary", "--month", "2026-09") == (0, "No expenses for 2026-09.\n")
    assert (tmp_path / "expenses.csv").read_text().splitlines()[0] == "date,amount,category,description"


def test_friendly_errors(tmp_path):
    shutil.copy(SRC / "expenses.py", tmp_path)
    assert run(tmp_path, "add", "-5", "food") == (1, "Error: Amount must be greater than zero.\n")
    code, out = run(tmp_path, "add", "5", "food", "--date", "10/01/2026")
    assert code == 1 and "Use the format YYYY-MM-DD" in out
    assert "Traceback" not in out
    # Found by the review script in Chapter 29: huge amounts used to crash.
    code, out = run(tmp_path, "add", "1e30", "food")
    assert code == 1 and "Traceback" not in out


def test_claudes_own_suite():
    r = subprocess.run([sys.executable, "-m", "pytest", "-q", "-p", "no:cacheprovider", str(SRC)],
                       capture_output=True, text=True)
    assert r.returncode == 0, r.stdout
