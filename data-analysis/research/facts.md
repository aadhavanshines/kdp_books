# Research log: Data Analysis with Python, Hands-On (checked October 2026)

## Software versions
The book was tested with numpy 2.5.4, pandas 3.0.6, matplotlib 3.11.2, openpyxl 3.1.5 and pytest 9.1.1 on Python 3.12, 3.13, 3.14 and 3.15 (see `requirements.txt`). pandas 3 uses a dedicated string dtype (`str`) by default; the book's outputs show it.

## Real-world stories and facts
Only figures confirmed by the sources are used; disputed details are marked as such in the text.

- Reinhart and Rogoff spreadsheet error (2013): an averaging formula stopped short of the last rows, leaving Australia, Austria, Belgium, Canada and Denmark out of one calculation. Source: Herndon, Ash and Pollin, "Does High Public Debt Consistently Stifle Economic Growth?", University of Massachusetts Amherst PERI working paper, April 2013; Reinhart and Rogoff's response, 2013.
- Public Health England, October 2020: 15,841 positive COVID-19 cases from 25 September to 2 October were left out of the daily counts because of a problem in the data load process. Reports attributed it to an Excel size limit; PHE did not publish the exact mechanism, and whether rows or columns were the limit is disputed, so the book says "a spreadsheet size limit, according to press reports". Sources: PHE statement, 4 October 2020; The Register and The Guardian, 5 October 2020.
- Gene names converted to dates: about one-fifth of papers with Excel gene lists in leading genomics journals contained such errors (704 articles confirmed). Source: Ziemann, Eren and El-Osta, "Gene name errors are widespread in the scientific literature", Genome Biology, 2016. In 2020 the HGNC renamed affected genes (SEPT1 to SEPTIN1, MARCH1 to MARCHF1). Source: Bruford et al., "Guidelines for human gene nomenclature", Nature Genetics, 2020.
- Berkeley admissions, 1973: about 44% of men and 35% of women were admitted overall, but within most departments women did as well or better; women applied more to departments that were harder to enter. Source: Bickel, Hammel and O'Connell, "Sex Bias in Graduate Admissions: Data from Berkeley", Science, 1975.
- Challenger, 1986: a chart shown before launch included only flights with O-ring incidents; plotting all flights against temperature shows the risk more clearly. Sources: Report of the Presidential Commission on the Space Shuttle Challenger Accident (Rogers Commission), 1986; Edward Tufte, Visual Explanations, 1997. The book notes that Tufte's account has critics.
- WHO Global Air Quality Guidelines (2021): PM2.5 annual mean 5 micrograms per cubic meter; 24-hour mean 15. Source: WHO, 2021.
- Net Promoter Score: introduced by Frederick Reichheld, "The One Number You Need to Grow", Harvard Business Review, December 2003; promoters 9-10, passives 7-8, detractors 0-6. Later research questions how well it predicts growth (Keiningham et al., Journal of Marketing, 2007).
- pandas: started by Wes McKinney at AQR Capital Management in 2008, open-sourced in 2009. Source: pandas project history; McKinney's talks.
- Bootstrap: introduced by Bradley Efron, "Bootstrap Methods: Another Look at the Jackknife", Annals of Statistics, 1979.
- Excel's worksheet limits since Excel 2007: 1,048,576 rows by 16,384 columns (65,536 rows in the older .xls format). Source: Microsoft documentation.

## Data
All datasets are fictional and made by `code/data/make_data.py` with a fixed seed. Company, product, city and ticker names are invented. `tests/check_data.py` regenerates them on every Python version and checks the files are identical.
- Anscombe's quartet: F. J. Anscombe, "Graphs in Statistical Analysis", The American Statistician, 27(1), 1973.
