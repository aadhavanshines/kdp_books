# Habit Tracker: Specification

## Goal
A small web app to track daily habits, such as "Drink water" or
"Read 20 pages", and see streaks.

## Tech
- Python 3 with Flask, and SQLite (Python's built-in sqlite3).
- Plain HTML, CSS, and a little JavaScript. No front-end framework.
- Data is stored in habits.db. Tables are created automatically.

## Features
1. Add a habit by name (1 to 30 characters). Names are unique,
   ignoring upper and lower case.
2. Delete a habit, after a confirmation.
3. Each habit shows the last 7 days (oldest on the left, today on
   the right). Clicking a day marks it done or not done.
4. Each habit shows its current streak and its best streak.
5. Rename a habit. Its history and streaks are kept. The same rules as
   adding apply to the new name:
   - Leading and trailing spaces are removed; the result must be 1 to 30
     characters, so an empty or all-space name is rejected (400).
   - The name must not match another habit, ignoring upper and lower
     case (409). Renaming a habit to its own name, or changing only its
     capitalisation (e.g. "excercise" to "Excercise"), is allowed.
   - Renaming a habit that doesn't exist gives 404.
   - A rejected rename changes nothing.

## Streak rules
- The current streak is the number of days in a row, ending today,
  that are marked done.
- If today isn't marked yet, the streak ends yesterday instead, so
  it doesn't drop to 0 until the day is over.
- The best streak is the longest run of days in a row ever.

## API (JSON)
- GET    /api/habits              list habits with last 7 days and streaks
- POST   /api/habits              body {"name": "..."}; 201, 400, or 409
- DELETE /api/habits/<id>         204 or 404
- PATCH  /api/habits/<id>         body {"name": "..."}; 200 with the updated
  habit (same shape as in the list), or 400, 404, or 409
- POST   /api/habits/<id>/toggle  body {"date": "YYYY-MM-DD"}; 200
  Dates in the future are rejected with 400.

## Files
app.py, templates/index.html, static/style.css, static/app.js,
test_app.py, requirements.txt, README.md

## Testing
pytest tests using Flask's test client and a temporary database.
Cover the API, validation errors, and the streak rules, including
a streak that crosses the start of a month.

## Out of scope
User accounts, reminders.
