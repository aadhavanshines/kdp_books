# Part I: Getting Started

# Chapter 1: What Data Analysis Is

Data analysis is the work of answering questions with data. Not "playing with data" or "finding insights", but answering specific questions, such as which products make money, whether a new web page sells more, or when pollution is worst, and then explaining the answer clearly enough that someone can act on it.

This chapter describes the workflow you'll follow throughout the book and gives you a first taste of what a few lines of Python can do.

## The Workflow

Almost every analysis, large or small, follows the same six steps:

1. **Ask a question.** "How are sales?" is not a question you can answer; "Which product categories grew in the second half of the year, and which shrank?" is. A sharp question tells you what data you need and when you're done.
2. **Get the data.** From a CSV export, a spreadsheet, a database or a web service. Note where it came from and when.
3. **Clean it.** Real data has missing values, typos, duplicates, inconsistent spellings and numbers stored as text. Cleaning often takes more time than everything else together.
4. **Explore.** Count, sort, group and summarize; look at distributions and outliers; check that the data says what you think it says.
5. **Analyze and visualize.** Compare groups, follow trends over time, test whether a difference could be chance, and draw charts that make the answer visible.
6. **Communicate.** A short, honest summary with one or two charts, the numbers that matter, and what you're unsure about.

The steps loop back on each other. Exploring often reveals more cleaning to do; a chart often raises a better question. That's normal.

## Four Kinds of Questions

It helps to know which kind of question you're answering:

| Kind | Question | Example |
| --- | --- | --- |
| Descriptive | What happened? | Revenue by month last year |
| Diagnostic | Why did it happen? | Garden sales fell after June because of the season |
| Predictive | What will happen? | Expected December orders |
| Prescriptive | What should we do? | Which checkout page to keep |

This book concentrates on the first two and on the careful comparisons, such as A/B tests, that support the fourth. Those are the bread and butter of everyday analysis, and they're where most mistakes are made.

## A First Taste

Here's what a few lines of Python with **pandas**, the library at the heart of this book, can do with a year of orders from Larkspur Home, the fictional shop whose data you'll use throughout:

```python
@include code/ch01/first_look.py
```

```
@include code/ch01/first_look.out
```

In a dozen lines, the program read 5,833 orders, computed each order's revenue (quantity times price, less any discount), added it all up and summarized it by category. Bedding and Lighting bring in the most money; Decor the least. Doing the same in a spreadsheet takes a formula column, a pivot table and some clicking, and you'd have to repeat it all next month. The program just runs again.

Don't worry about the details yet: `read_csv`, `groupby` and the rest each get their own chapter.

## Why Python?

Spreadsheets are excellent for small, one-off jobs, and you'll still use them. Python earns its place when:

- **The data is big.** A modern Excel worksheet holds at most 1,048,576 rows. pandas handles millions of rows on a laptop.
- **The work repeats.** A program runs the same steps, the same way, every month.
- **You need to show your work.** Code is a precise, reviewable record of exactly what was done to the data.
- **You want more than sums.** Statistics, joins across many files, text processing and charts are all a few lines away.

**Real-World Story:** In 2010, two Harvard economists published an influential paper suggesting that countries with very high public debt grow much more slowly. In 2013, a graduate student, Thomas Herndon, tried to reproduce it and found, among other issues, that an averaging formula in the authors' spreadsheet stopped five rows short, leaving Australia, Austria, Belgium, Canada and Denmark out of one key calculation. The authors acknowledged the error. A calculation hidden in a cell is easy to get wrong and hard for anyone to check; a short program that someone else can read and rerun is much harder to get wrong unnoticed.

## What You'll Need

- Basic Python: variables, lists, dictionaries, loops and functions.
- A computer with Python 3.12 or newer, and about 300 MB of disk space for the libraries.
- Curiosity about the data. The best analysts keep asking "Is that really true?" and "Compared with what?"

## Key Takeaways

- Data analysis answers specific questions with data and communicates the answer honestly.
- The workflow is question, data, clean, explore, analyze and visualize, communicate, with plenty of looping back.
- Know whether you're describing, diagnosing, predicting or recommending.
- Python makes analysis repeatable, checkable and able to handle data far beyond a spreadsheet's limits.
