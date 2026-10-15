# Chapter 26: Project: Automating Everyday Tasks

Many people learn Python for one reason: to stop doing boring things by hand. Renaming a hundred files, finding duplicates, turning a spreadsheet into a web page, backing up a folder every day, emailing a report: each takes minutes by hand and seconds with a script, every time. In this project you'll write a toolbox of small automation scripts, each built safely, with a way to see what it would do before it does it.

## Safety First

Automation does exactly what you tell it, very quickly, including the wrong thing. A script that renames files can overwrite them; one that deletes old backups can delete new ones. Every script in this chapter follows three rules:

- **Show before doing.** A **dry run** prints what would happen and changes nothing. You add an option such as `--apply` only when the plan looks right.
- **Never overwrite silently.** Check whether a target already exists.
- **Practice on copies.** The chapter folder has sample folders for each script. Try scripts on copies of real folders until you trust them.

## Tidying File Names

Downloads arrive with names like `Scan 1.PDF` and `holiday photo (1).jpg`. This script gives them a consistent form: lower case, hyphens instead of spaces, no brackets:

```
@include code/ch26/tidy_names.py
```

`tidy` works out the new name with string methods and regular expressions from Chapter 9. `plan_renames` builds a list of changes without touching anything, skipping any rename that would overwrite an existing file. Only with `--apply` does the script rename. This short program runs it twice on the sample `downloads` folder, first as a dry run, then for real:

```
@include code/ch26/tidy_names_demo.py
```

```
@include code/ch26/tidy_names_demo.out
```

## Reporting on a Folder

Before cleaning up a folder, find out what's in it. This report counts files by type, adds up their sizes, lists the largest, and finds files with identical contents:

```
@include code/ch26/folder_report.py
```

```
@include code/ch26/folder_report.out
```

To find duplicates, the script computes a **hash** of each file's contents with `hashlib.sha256`: a fingerprint, 64 hexadecimal characters long, that's the same for identical contents and, in practice, different for any other contents. Files are grouped by fingerprint, whatever they're called, so `shopping-copy.txt` is found to be a copy of `shopping.txt`. This works just as well for large photos and videos, and is much faster than comparing every file with every other.

## From CSV to a Web Page

Here's a reading log, kept as a CSV file:

```
@include code/ch26/reading_log.csv
```

This script turns it into an HTML page that you can open in any browser or put on a website:

```
@include code/ch26/csv_to_html.py
```

```
@include code/ch26/csv_to_html.out
```

An f-string builds the page, with doubled braces `{{ }}` where the page's style rules need real braces. Everything that comes from the data goes through `html.escape`, which turns `&`, `<` and `>` into codes that a browser shows as text. Without it, the ampersand in *Pride & Prejudice* would be misread, and a title containing `<script>` could run code in the reader's browser. Escape data whenever you put it into HTML, just as you put values through placeholders in SQL in Chapter 23.

## Backups with Rotation

This script zips a folder into a file named by date and keeps only the newest three backups. To show the rotation in one run, it pretends to run on five days in a row:

```
@include code/ch26/backup.py
```

```
@include code/ch26/backup.out
```

`zipfile` creates the archive; each file is stored with its path relative to the folder's parent, so the archive unpacks into a `documents` folder. Because the names use ISO dates, sorting them alphabetically sorts them by date, and `backups[:-KEEP]` is every backup except the newest three. `testzip` reads every file back and checks it, returning `None` if all is well. A backup you haven't checked isn't a backup.

## Running Tasks on a Schedule

Some tasks should run regularly. The standard library's `sched` module runs functions at set times within a running program:

```
@include code/ch26/scheduler.py
```

```
@include code/ch26/scheduler.out
```

`enterabs` books a task at an exact time on the `time.monotonic` clock, a clock that only ever moves forward, and each run books the next one. Scheduling from a fixed start time, rather than "0.1 seconds after the last run finished", stops small delays from adding up over hours.

For real schedules, like a backup every night, it's usually better to let the operating system start your script: **Task Scheduler** on Windows, or **cron** on macOS and Linux. Then nothing needs to keep running between jobs, and the job still runs after a restart. A cron line like `0 2 * * * /path/to/.venv/bin/python /path/to/backup.py` runs the backup at 2:00 every night, using the virtual environment's Python.

## Sending Email

The last script builds an email with the reading log attached, and sends it only when asked:

```
@include code/ch26/email_report.py
```

Without `--send`, it shows the message it would send:

```
@include code/ch26/email_report.out
```

`EmailMessage` builds the message: headers, a plain-text body, and the CSV file as an attachment. To send it, `smtplib` connects to a mail server, encrypts the connection with `starttls`, logs in and sends. The server's address, username and password come from **environment variables**, never from the code, so the script can be shared and committed safely. Most email providers require an app-specific password for scripts; check your provider's help pages.

Sending needs a real mail account, so for this book the sending code was tested without one. The test below replaces `smtplib.SMTP` with a fake class that records what it's asked to do, using pytest's `monkeypatch` fixture, which undoes the change after the test. `runpy.run_path` runs the script as if from the command line:

```
@include code/ch26/test_email_report.py
```

```
@include code/ch26/test_email_report.out
```

The test confirms the order that matters for security: the connection is encrypted before the password is sent. Replacing a piece of a program with a fake for a test is called **mocking**, and it's the standard way to test code that talks to mail servers, web APIs, payment services and anything else you can't or shouldn't use in a test.

## Try It

1. Run `tidy_names.py` on a copy of your own downloads folder, without `--apply`. Do you agree with every rename?
2. Change `folder_report.py` to report on a folder of yours and list the ten largest files.
3. Add a column to `reading_log.csv` and check that `csv_to_html.py` shows it without any change to the code.

## Exercises

1. **Log summary.** Write `log_summary(path)`, which reads a log file like `app.log` (each line has a date, a time, a level and a message), and returns a `Counter` of the levels and a `Counter` of the error messages.
2. **Sort by type.** Write `sort_by_type(folder, apply=False)`, which plans moves of each file into a subfolder by type (documents, pictures, spreadsheets or other), returns the plan, and makes the moves only when `apply` is true.
3. **Text table.** Write `text_table(rows)`, which formats a list of dictionaries, such as rows from `csv.DictReader`, as a plain-text table, with each column as wide as its widest value.

## Key Takeaways

- Automation scripts should show a dry run first, never overwrite silently, and be tried on copies.
- `pathlib`, `re`, `hashlib`, `csv`, `html`, `zipfile`, `sched`, `email` and `smtplib`, all in the standard library, cover most everyday automation.
- Escape data that goes into HTML with `html.escape`. Keep passwords in environment variables.
- Let the operating system schedule regular jobs. Test code that talks to outside services with mocks.
