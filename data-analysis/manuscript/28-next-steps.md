# Chapter 28: Next Steps

You've worked through the whole craft: loading and cleaning data, transforming and combining it, summarizing and charting it, testing whether differences are real, writing SQL, testing your code, and reporting results honestly, in six complete projects. Here's how to keep going.

## Practice on Real Data

The best next step is your own questions about real data. Good free sources:

- **Your country's statistics office and open-data portal:** population, prices, transport, health, weather.
- **Kaggle datasets:** thousands of datasets on every topic, with other people's analyses to learn from.
- **Your own life:** bank statements, fitness trackers, phone screen time, your music history.
- **Your workplace:** with permission, the reports everyone wishes someone would automate.

For each dataset, write down three questions *before* you look at it, then answer them using the six steps from Chapter 1. Publish your best analyses as short write-ups, with code, on a blog or GitHub: they make an excellent portfolio for job applications.

## Skills to Learn Next

- **Interactive charts:** Plotly and Altair make zoomable, hoverable charts for the web.
- **Dashboards:** Streamlit turns a Python script into a simple web app with filters and charts.
- **Statistics and modeling:** the `statsmodels` library for regression and classic tests; `scikit-learn` for machine learning, prediction and clustering.
- **Big data tools:** DuckDB, Polars and cloud data warehouses (Chapter 27).
- **Data engineering:** scheduling pipelines, data quality checks and version control for data.

## Habits That Make a Great Analyst

- Start with the question, and write it down.
- Look at the raw data before trusting any summary.
- Check row counts at every step.
- Compare like with like.
- Show the uncertainty.
- Make it repeatable, with code and tests.
- Say what you don't know.

## Interviewing for Analyst Roles

Analyst interviews usually include SQL questions (Chapter 18), a pandas or spreadsheet exercise, a case question ("Sales dropped 10% last week. How would you investigate?") and a discussion of a past project. For the case questions, use the workflow: clarify the question, ask what data exists, check data quality first (a tracking bug is the most common cause of sudden "drops"), break the number into parts, compare with the same period last year, and only then look for causes.

Thank you for reading. Now go and answer some questions.

## Key Takeaways

- Practice on real data with questions you care about, and publish your best work.
- Next skills: interactive charts, dashboards, statistics and machine learning, big data tools.
- The habits matter more than the tools: question first, check counts, compare like with like, show uncertainty, make it repeatable.
