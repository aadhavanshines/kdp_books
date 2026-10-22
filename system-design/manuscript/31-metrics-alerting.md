# Chapter 31: Metrics and Alerting

**The prompt:** "Design a monitoring system that collects metrics from all of a company's servers, shows dashboards, and alerts engineers when something is wrong."

It's a write-heavy design with a long tail of storage: millions of time series written every few seconds, read mostly as aggregates over time ranges, and kept for years at decreasing resolution.

## Requirements

**Functional:**

1. Collect numeric metrics (CPU, request counts, latencies) from many services, each with labels such as service, host and region.
2. Query and graph them over time ranges, with aggregation (sum, average, percentiles) across labels.
3. Alert rules that notify on-call engineers.

**Non-functional:**

- 100 million active time series, one point every 10 seconds.
- Recent data queryable within seconds of being written.
- Raw data for about two weeks; downsampled data for years.
- The monitoring system must stay up when the systems it monitors are failing.

## Estimates

```
@include code/ch31/estimate.demo.txt
```

Ten million points per second. Time-series compression is very effective (consecutive timestamps and values are similar, so a point can compress to a couple of bytes), which keeps two weeks of raw data around 26 TB. Notice that one year of one-minute rollups (841 TB) costs far more than the raw data, so keep fine-grained rollups for months, not years, and hourly rollups for the long term (70 TB for five years).

## High-Level Design

![Metrics system: agents send points to ingestion services that write to a log; storage nodes consume the log into a partitioned time-series database; rollup jobs downsample; the query service serves dashboards; the alert evaluator runs rules and sends notifications.](images/diagram-metrics.png)

1. **Agents** on each host collect metrics and send them in batches.
2. **Ingestion services** validate and write points to a partitioned **log** (Chapter 10), which buffers bursts and lets several consumers read.
3. **Storage nodes** consume the log into a **time-series database**, partitioned by series (a hash of the metric name and labels) and organized in time blocks.
4. **Rollup jobs** compute downsampled series.
5. The **query service** serves dashboards, choosing raw or rolled-up data based on the time range.
6. The **alert evaluator** runs rules every minute and sends alerts to the notification service (Chapter 21).

## Deep Dive 1: Downsampling Without Losing Meaning

Averaging raw points into one-minute averages loses information: a spike disappears into an average, and an average of averages is wrong when buckets have different numbers of points. Keep **count, sum, minimum and maximum** per bucket instead; averages, totals and extremes can then be computed exactly at any coarser level:

```python
@include code/ch31/d01_rollup.py::rollup
```

```
@include code/ch31/d01_rollup.examples.txt
```

The test compares the rollup with a brute-force version that rescans the raw points for each bucket, on thousands of random series. Percentiles can't be combined this way; for latency, store a histogram or a quantile sketch per bucket instead.

## Deep Dive 2: Alerts That Don't Cry Wolf

An alert that fires on every spike trains engineers to ignore alerts. Good rules require a condition to **hold for a duration** and target **symptoms** (Chapter 15):

```python
@include code/ch31/d01_rollup.py::alert_times
```

A CPU series with a one-minute spike at minute 3, and a real, sustained problem from minute 10:

```
@include code/ch31/d01_rollup.demo.txt
```

Alerting on any minute above 90% fires twice, once for the harmless spike; requiring five consecutive minutes fires once, at minute 14, for the real problem. Real systems add error-budget burn-rate alerts, which fire quickly for fast budget burn and slowly for slow burn.

## Deep Dive 3: Cardinality

Each unique combination of labels is a separate series. A label with unbounded values, such as user ID or request ID, can turn thousands of series into billions and overwhelm the system. Enforce limits per service, reject or drop high-cardinality labels at ingestion, and put per-request detail in logs and traces instead.

## Wrap-Up

- **Independence:** run monitoring on separate infrastructure, and monitor the monitoring (a "dead man's switch" alert that fires if no data arrives).
- **Hot queries:** dashboards refreshing every few seconds; cache recent query results and precompute common aggregates.
- **Retention tiers:** raw for weeks on fast storage, rollups for years on cheaper storage.

## Follow-Up Questions

- "Pull or push collection?" Pull (the server scrapes targets) makes it easy to see which targets are down; push suits short-lived jobs. Many systems support both.
- "Global view across regions." Store per region; federate queries or replicate rollups centrally.
- "Anomaly detection." Compare current values with the same time last week, or with a forecast, and alert on large deviations.

## Key Takeaways

- Metrics are write-heavy: buffer ingestion through a log and partition storage by series.
- Downsample with count, sum, min and max so aggregates stay exact; use histograms for percentiles.
- Alert on persistent, user-facing symptoms, not on single spikes.
- Control label cardinality; it's the most common way to break a metrics system.
