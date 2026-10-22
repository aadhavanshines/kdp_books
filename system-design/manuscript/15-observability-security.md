# Chapter 15: Observability and Security Essentials

Two topics come up at the end of almost every design interview: "how would you know it's working?" and "how would you keep it secure?" Neither needs a long answer, but having a crisp one shows that you think about systems the way operators and security engineers do.

## The Three Signals

- **Metrics:** numbers over time, such as request rate, error rate, latency and queue length. Cheap to store and ideal for dashboards and alerts.
- **Logs:** records of individual events, with context. Essential for investigating what happened to one request.
- **Traces:** the path of one request through many services, with the time spent in each. The fastest way to find which service makes a request slow.

For every service, watch the **rate** of requests, the rate of **errors**, and their **duration**. Add **saturation** (how full the service's resources are: CPU, memory, connection pools, queue length) and you can spot most problems before users report them.

## Why Averages Lie

Latency should be reported as **percentiles**, not averages. The model below generates 100,000 request latencies where 98% are fast (20 to 40 ms) and 2% take a slow path such as a cache miss to disk (800 to 1,200 ms):

```python
@include code/ch15/b01_percentiles.py::percentile
```

```
@include code/ch15/b01_percentiles.demo.txt
```

The average is 49 ms, which describes no real request. The median (p50) is 30 ms, and so is the experience of most requests, but the 99th percentile is about a second. If a page makes 50 backend calls, the chance that at least one hits the slow path is 1 - 0.98⁵⁰, about 64%: most page loads are slow even though the average looks excellent. That's why service objectives are written for p99 or p99.9, and why reducing tail latency matters so much in large systems.

## SLIs, SLOs and Error Budgets

- A **service level indicator (SLI)** is a measurement: the fraction of requests that succeed within 300 ms, for example.
- A **service level objective (SLO)** is a target for it: 99.9% over 30 days.
- The **error budget** is what the SLO allows to fail. The demo above computes it for three common targets: 99% allows about 7 hours of total outage in 30 days, 99.9% about 43 minutes, and 99.99% about 4 minutes.

The error budget turns reliability into a decision rule: while budget remains, ship features; when it's spent, focus on reliability. Every extra "nine" costs much more than the last, so choose targets that users actually need.

## Alerting

Alert on **symptoms users feel** (error rate, latency, failed checkouts), not on every cause (one server's CPU), and require a condition to last for a few minutes so a single spike doesn't wake someone at night. Chapter 31 designs a metrics and alerting system and shows this rule in code.

## Security Essentials for Designers

You won't be expected to design cryptography, but you should cover these basics:

- **Authentication** (who is calling): sessions or short-lived tokens for users; mutual TLS or signed tokens between services. Never put secrets in URLs or logs.
- **Authorization** (what they may do): check permissions on every request, server-side, for every object. "User 42 may read document 7" must be checked, not assumed from the URL.
- **Encryption:** TLS for data in transit, everywhere, including inside the data center; encryption at rest for stored data, with keys in a managed key service.
- **Least privilege:** each service gets only the permissions and network access it needs.
- **Input validation and abuse prevention:** validate everything from clients, rate limit (Chapter 11), and protect expensive endpoints such as sign-up and search from automated abuse.
- **Secrets management:** credentials in a secrets manager, rotated regularly, never in code.
- **Privacy:** collect only what you need, delete it when you no longer need it, and know which data is personal. Regulations such as the EU's GDPR give users rights over their data, which affects designs that copy data into many systems.

> **Interviewer's View:** A thirty-second wrap-up that covers "dashboards on rate, errors and p99 latency; alerts on SLO burn; TLS everywhere; per-object authorization checks; secrets in a manager" is usually all that's needed, unless the prompt is security-sensitive, such as payments or authentication.

## Key Takeaways

- Watch rate, errors, duration and saturation for every service; use traces to find slow components.
- Report latency as percentiles; tails dominate the experience in systems with many calls.
- Set SLOs from user needs and manage reliability with error budgets.
- Alert on user-facing symptoms that persist, not on every spike.
- Cover authentication, per-object authorization, encryption, least privilege and secrets in every design.
