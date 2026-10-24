# Chapter 16: Describing Data With Statistics

Statistics gives you a vocabulary for "typical", "spread out", "unusual" and "related". You don't need formulas to use it well; you need to know what each measure tells you, and when it misleads. This chapter covers the measures analysts use every day, and two famous traps.

## Typical Values and Spread

```python
@include code/ch16/describe_stats.py
```

```
@include code/ch16/describe_stats.out
```

- The **mean** (average) order is $65.10, but the **median**, the middle value when orders are sorted, is $49.50. Half the orders are worth less than $49.50.
- The **standard deviation** ($57.67) measures how far values typically are from the mean. It's large here because of the long tail of big orders.
- The **interquartile range** (IQR) is the width of the middle half of the values, from the 25th to the 75th percentile: $29 to $80. It ignores the extremes, so it's a steadier measure of spread for skewed data.
- **Skew** is positive (2.94): the tail stretches to the right, as the histogram in Chapter 14 showed.
- The top 1% of orders are worth $288 or more.

> **Tip:** For money, waiting times and anything with a long tail, report the median (and percentiles) rather than, or alongside, the mean. "The typical order is $50" is more honest than "the average order is $65" when a few large orders pull the average up.

## Correlation, and Looking for Delays

**Correlation** (written *r*) measures how closely two measures move together in a straight-line way: +1 is a perfect rising line, 0 no linear relationship, -1 a perfect falling line.

```python
@include code/ch16/correlation.py
```

```
@include code/ch16/correlation.out
```

The program correlates daily clinic visits in Brightwater with pollution on the same day, the day before, two days before, and so on, using `shift`. Same-day correlation is modest (0.43), but pollution two days earlier gives a strong 0.76. The effect takes time to show up, and you'd miss it entirely by only looking at the same day.

Correlation is a starting point, not a conclusion. It doesn't prove that one thing causes the other: both might be driven by a third factor, such as the season. Here the data was generated with a two-day delay built in, so you know the answer; with real data, a result like this is a reason to look closer, not proof.

## Simpson's Paradox

Sometimes a comparison reverses when you split the data into groups:

```python
@include code/ch16/simpson.py
```

```
@include code/ch16/simpson.out
```

Overall, the Red team solves 86% of its tickets and the Blue team 67%. Red looks better. But split by difficulty, Blue is better at *both* kinds: 95% against 90% for easy tickets, and 60% against 50% for hard ones. The reversal happens because Blue handles mostly hard tickets (80 of its 100), which have lower success rates for everyone. Comparing overall rates mixes "how good is the team" with "how hard is its work".

**Real-World Story:** In 1973, the University of California, Berkeley, admitted about 44% of male applicants to its graduate programs but only about 35% of female applicants. When statisticians Peter Bickel, Eugene Hammel and J. W. O'Connell looked department by department, they found that women did as well as or better than men in most departments. Women had applied in larger numbers to the departments that were hardest to get into. Their 1975 paper in *Science* made this one of the best-known examples of Simpson's paradox.

The defense: whenever you compare groups, ask whether they differ in some other way that affects the outcome, and compare within like-for-like subgroups.

## Look at the Data, Not Just the Numbers

**Interesting Fact:** In 1973, the statistician Francis Anscombe published four small datasets, now called **Anscombe's quartet**, that have almost identical means, variances and correlations, yet look completely different when plotted: one is a neat line, one a curve, and two are thrown off by a single outlier. Summary statistics can hide very different realities. Always chart your data before trusting a summary.

## Exercises

1. **Coffee spending.** Describe the household's cafe purchases in `budget.csv`: how many, and the mean, median and spread of the amounts. (The amounts are negative; flip their sign first.)
2. **Two ratings.** How strongly are the survey's satisfaction and recommend scores correlated?

## Key Takeaways

- Report medians and percentiles for skewed data; the mean is pulled by long tails.
- The IQR measures spread without being thrown by extremes.
- Correlation measures linear association; check delayed effects with `shift`, and never read it as proof of cause.
- Simpson's paradox: overall comparisons can reverse within groups. Compare like with like.
- Chart the data before trusting any summary.
