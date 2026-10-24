# Chapter 17: Comparing Groups and A/B Tests

Is the new checkout page better, or did it just get lucky? Is one region's higher average order real, or random noise? When you compare groups, some difference almost always appears by chance. This chapter shows two simple, computer-powered ways to tell real differences from noise: the **bootstrap** and the **permutation test**. Neither needs any formulas, only a loop and a random number generator.

## The Experiment

Larkspur Home tested a new checkout page. Each visitor was randomly shown the old page (A) or the new one (B), and the site recorded whether the visit ended in a purchase:

```python
@include code/ch17/ab_summary.py
```

```
@include code/ch17/ab_summary.out
```

About 10,000 sessions each. A converted 4.01% of sessions and B 4.77%: B converts 19% better, and earns more per session. But with only about 400 to 480 conversions per group, how sure can we be that B is really better?

## The Bootstrap: How Precise Is the Difference?

The **bootstrap** asks: if we ran the experiment again, how much would the result move? It imitates rerunning the experiment by resampling the data you have:

```python
@include code/ch17/bootstrap.py
```

```
@include code/ch17/bootstrap.out
```

Each loop draws a new sample from each group *with replacement* (the same session can be picked more than once), the same size as the original, and records the difference in conversion rates. After 5,000 repetitions, the middle 95% of those differences forms a **95% interval**: here 0.20 to 1.32 percentage points. The interval doesn't include zero, so the data supports B being genuinely better. It also shows how uncertain the size of the improvement is: somewhere from a little to a lot.

**Interesting Fact:** The bootstrap was introduced by the statistician Bradley Efron in 1979. The name comes from the phrase "to pull oneself up by one's bootstraps": the method gets an estimate of its own uncertainty from nothing but the data itself. It only became practical once computers could repeat a calculation thousands of times in seconds.

## The Permutation Test: Could It Be Luck?

The **permutation test** asks a different question: if the page made no difference at all, how often would we see a gap this big just by chance?

```python
@include code/ch17/permutation.py
```

```
@include code/ch17/permutation.out
```

If the page doesn't matter, the A and B labels are meaningless, so shuffling them shouldn't change anything. The program shuffles the labels 5,000 times and counts how often the shuffled difference is at least as large as the real one (0.76 points). That share is the **p-value**: 0.010, or 1%. A gap this large would rarely happen by luck alone.

> **Warning:** A small p-value says the difference is unlikely to be pure chance. It does *not* say the difference is large or important, and a large p-value doesn't prove there's no difference, only that this data can't show one. Report the size of the effect with its interval, not just the p-value.

## Good Habits for Experiments

- **Decide in advance** what you'll measure, for how long, and what difference matters. Stopping the test the moment it "looks significant" inflates false positives.
- **Randomize** who sees which version. Comparing this month's new page with last month's old page mixes in everything else that changed.
- **Check the split.** If A got noticeably more traffic than B, something is broken in the assignment (Chapter 23 shows how to check).
- **Look at segments**, such as mobile and desktop, but be cautious: test enough segments and one will look special by chance.

## Exercises

1. **Mobile only.** Compute a 95% bootstrap interval for the difference in conversion rate (B minus A) using only mobile sessions. Does it include zero?

## Key Takeaways

- Random variation creates differences; check whether yours is bigger than chance would produce.
- The bootstrap resamples your data to estimate a 95% interval for a difference.
- The permutation test shuffles labels to estimate a p-value: how often chance alone gives a gap this big.
- Report effect sizes with intervals, decide on the analysis before the data arrives, and randomize.
