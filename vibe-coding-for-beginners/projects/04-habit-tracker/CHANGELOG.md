# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-10-06

### Added
- Rename a habit without losing its history or streaks: new `PATCH /api/habits/<id>`
  endpoint and a "Rename" button on each habit. Names follow the same rules as adding
  (1 to 30 characters, unique ignoring case).

## [1.0.0] - 2026-10-06

First official release.

### Added
- Habit tracker web app: add and delete habits, mark days done, and see the last 7 days
  with current and best streaks (Flask + SQLite, plain HTML/CSS/JS).
- JSON API: `GET/POST /api/habits`, `DELETE /api/habits/<id>`, `POST /api/habits/<id>/toggle`.
- Habit names are unique case-insensitively and limited to 30 characters.
- Production setup for gunicorn and Render (persistent disk via `DATABASE_PATH`), plus
  continuous integration running the tests.
- App version shown at the bottom of the page.

### Changed
- "Today" is now taken from the user's own date (`X-Client-Date` header), so users in
  a different timezone from the server see the correct day.
