# Chapter 4: Networking and APIs for Designers

Every design in this book starts with a client sending a request over a network. You don't need to be a networking expert for a system design interview, but you do need to know what happens between a tap on a phone and a response, which protocol fits which job, and how to design an API that still works when there are millions of clients and things go wrong.

## The Life of a Request

When a user opens `https://app.example/feed`:

1. **DNS** translates `app.example` into an IP address. Results are cached by the operating system, the browser and resolvers, which is why DNS changes take time to spread, and why DNS can also route users to the nearest region.
2. **TCP** opens a connection with a three-way handshake: one network round trip.
3. **TLS** negotiates encryption: one more round trip with TLS 1.3.
4. **HTTP** sends the request; the response comes back.
5. Usually the request first reaches a **CDN** edge server or a **load balancer**, not the application directly.

Each round trip costs time proportional to distance: within a data center, well under a millisecond; across a continent, tens of milliseconds; around the world, 150 milliseconds or more. That's why reusing connections, serving content from nearby edge servers, and reducing the number of sequential calls matter so much for latency.

**Real-World Story:** On October 21, 2016, an attack from tens of millions of IP addresses, many of them cameras and video recorders infected with the Mirai malware, flooded Dyn, a large DNS provider. For hours, many people couldn't reach Twitter, GitHub, Netflix, Reddit and other popular sites. The sites themselves were running; their names just couldn't be looked up. DNS is the first step of every request, so treat it as a dependency like any other, which is why some large sites spread their DNS across more than one provider.

## HTTP Versions in One Paragraph Each

- **HTTP/1.1** sends one request at a time per connection; browsers open several connections to work around it.
- **HTTP/2** multiplexes many requests over one TCP connection, with compressed headers. A lost packet still stalls every request on that connection, because TCP delivers bytes in order.
- **HTTP/3** runs over **QUIC**, a transport built on UDP (standardized in RFC 9000 in 2021, with HTTP/3 in RFC 9114 in 2022). Each request stream is independent, so one lost packet stalls only its own stream, and connections can survive a change of network, such as walking from Wi-Fi to mobile data.

For interview purposes: HTTP/2 or HTTP/3 between clients and the edge; HTTP/2-based protocols such as gRPC between internal services.

## Choosing an API Style

| Style | Strengths | Weaknesses | Typical use |
| --- | --- | --- | --- |
| REST over HTTP + JSON | Simple, cacheable, universal tooling | Chatty for complex screens; loose contracts | Public APIs, web and mobile clients |
| gRPC (HTTP/2 + Protocol Buffers) | Compact, fast, typed contracts, streaming | Less friendly for browsers; harder to inspect by hand | Service-to-service calls |
| GraphQL | Client asks for exactly the fields it needs in one round trip | Caching and rate limiting are harder; expensive queries possible | Complex client screens with many data sources |

In an interview, REST is the default for client APIs unless there's a reason to choose otherwise; gRPC is a good default between internal services.

## Real-Time Updates: Polling, SSE and WebSockets

Many designs push data to clients: chat messages, notifications, live scores, a driver's location.

- **Short polling:** the client asks "anything new?" every few seconds. Simple, but wasteful and slow to notice changes.
- **Long polling:** the server holds the request open until there's news or a timeout, then the client immediately asks again. Works everywhere, but each message costs a new request.
- **Server-Sent Events (SSE):** one long-lived HTTP response through which the server streams events. One-way (server to client) and simple.
- **WebSockets (RFC 6455):** a persistent, two-way connection upgraded from HTTP. The usual choice for chat and collaborative editing.

Persistent connections change the architecture: a server holding 100,000 open connections must be tracked ("which gateway is user 42 connected to?"), and deploying new code means draining connections gracefully. Chapter 23 covers this in detail.

## Designing APIs That Scale

### Pagination: Use Cursors

Lists are returned in pages. The obvious design, `?page=3` or `?offset=60`, breaks when the list changes between requests: if new items arrive at the top of a feed, every item shifts down, and the next page repeats items the user has already seen (or, for deletions, skips some). A **cursor** fixes this by asking for "the items after the last one I saw":

```python
@include code/ch04/n01_pagination.py::offset_pages,cursor_pages
```

Here, two new items arrive between each page load:

```
@include code/ch04/n01_pagination.demo.txt
```

The offset version shows 19, 18 and 17 more than once; the cursor version shows each item exactly once. Cursors are also faster for databases: "WHERE id < cursor ORDER BY id DESC LIMIT 20" uses an index, while a large OFFSET forces the database to count past all the skipped rows. In a real API, encode the cursor as an opaque string so clients don't depend on its contents.

### Idempotency

Networks fail in the worst possible place: after the server has done the work but before the client receives the answer. The client can't tell, so it retries. For reads that's harmless; for "charge the card" it's a disaster. The fix is an **idempotency key**: the client sends a unique ID with each logical operation, and the server stores the result under that key and returns the same result on a retry instead of repeating the work. Chapter 29 implements this for payments.

### Other Details Worth Mentioning

- **Versioning** (`/v1/...`) so old clients keep working when the API changes.
- **Rate limits**, with responses that tell clients when to retry (HTTP 429 with a `Retry-After` header). Chapter 11.
- **Timeouts** on every call, and clear error codes that distinguish "retry later" (503) from "your request is wrong" (400).
- **Authentication** with short-lived tokens; never send secrets in URLs, which end up in logs.

## Content Delivery Networks

A CDN is a network of edge servers close to users that caches static content: images, video segments, scripts, style sheets. Users get the content from a server a few milliseconds away instead of crossing an ocean, and your origin servers see a fraction of the traffic. The trade-off is **staleness**: when content changes, cached copies remain until they expire or you purge them. Use long cache lifetimes for content that never changes (give each version a new URL, such as `logo.3f9a.png`) and short ones for content that does.

## Key Takeaways

- Latency is dominated by round trips and distance; reuse connections and serve content from the edge.
- REST for public client APIs, gRPC between services, GraphQL when clients need flexible queries.
- WebSockets for two-way real-time features; SSE for one-way streams; long polling as a fallback.
- Paginate with cursors, not offsets; offsets repeat or skip items when the data changes.
- Make every non-read operation idempotent with a client-supplied key.
