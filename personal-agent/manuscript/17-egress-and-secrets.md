# Chapter 17: Network Egress Policy and Secret Injection

The sandbox keeps commands off the network entirely. But Sparrow itself needs the network: to read web pages for you and to call services such as a weather API. This chapter controls that traffic with an **egress policy**, the rules for what may leave your machine and where it may go, and keeps API keys away from the model with a **vault** that adds them to requests at the last moment.

## Why Egress Matters

Go back to the lethal trifecta from Chapter 13: private data, untrusted content, and a way to communicate. The egress policy controls the third leg. If a web page tricks Sparrow into "summarizing" your memory into a URL such as `https://collector.example/save?data=...`, the damage happens the moment that request is sent. Sparrow doesn't need to be fooled into anything dramatic; one innocent-looking fetch is enough.

So outgoing requests follow three rules:

1. **Deny by default.** Only sites on the allowlist, or that you've approved, are reached.
2. **Ask about new sites.** A site that isn't allowed or denied produces an approval request (Chapter 15), unless you've set `unknown: deny`.
3. **Never the local network.** Private, loopback and link-local addresses are always denied, unless you explicitly allow one.

## The Policy

`sparrow/egress.py` starts with two helpers:

```python
@include sparrow/egress.py#L1-L58
```

`host_matches` compares a host with a pattern: `example.com` matches only itself, and `*.example.com` matches its subdomains. Notice that `*.example.com` does *not* match `example.com.evil.example`: the check is `endswith(".example.com")`, which needs the dot. Comparing hosts with a careless `in` or `startswith` is one of the oldest bugs in allowlists, and one of the tests tries exactly that address.

`is_private` uses Python's `ipaddress` module to recognize any address that isn't a public internet address: `127.0.0.1` and `::1` (this computer), `10.x`, `192.168.x` and `172.16-31.x` (your home or office network), and `169.254.x`, the **link-local** range. That last one matters on cloud servers, where `169.254.169.254` is the metadata service that hands out the server's credentials to anything that asks. Attacks that trick a server into requesting internal addresses are called **server-side request forgery (SSRF)**, and an agent that fetches URLs on request is an SSRF waiting to happen unless it checks.

An address can be written in more ways than you'd think. `http://2130706433/`, `http://0x7f000001/` and `http://127.1/` all mean `127.0.0.1`: the operating system still accepts the old shorthand forms of IPv4 addresses, as a single number, in hexadecimal or with parts left out. `ipaddress` recognizes only the standard form, so `literal_ip` also asks `socket.inet_aton`, which accepts the old forms too, for any host made only of digits, dots, `x` and hexadecimal letters. These forms weren't caught in the first version of Sparrow; a reviewer found them, and the egress tests now include all three.

A name can also lead to a private address. `localtest.me`, for example, is a public name whose DNS record points at `127.0.0.1`, and anyone can create a name that points at your router. Checking the name's text can't catch that, so the fetcher checks where the name actually leads, using `system_resolve`, which asks DNS for every address of a name.

```python
@include sparrow/egress.py#L60-L94
```

`EgressPolicy` combines the settings' allow and deny lists with the hosts you've approved, which are kept one per line in `state/approved-hosts.txt`, readable and editable. `decide` checks, in order:

- **The scheme.** Only `http` and `https`; `file:///etc/passwd`, `ftp:` and anything else are denied.
- **The deny list.** A denied name also denies all its subdomains, so denying `evil.example` covers `cdn.evil.example` too. The deny list is checked before the allow list, so a deny always wins.
- **The allow list and approved hosts.**
- **Private addresses,** denied unless allowed explicitly above.
- **Unknown hosts:** `ask` or `deny`, as configured.

It returns a verdict and a reason, and the reason is written to the audit log, so you can always see why a request was or wasn't made.

## Fetching Safely

```python
@include sparrow/egress.py#L97-L104
```

`html_to_text` turns a page into readable text without any HTML library: it removes scripts, styles and comments entirely (so instructions hidden in an HTML comment don't reach the model), turns paragraph and line breaks into newlines, strips the remaining tags, decodes entities such as `&amp;`, and drops blank lines. Pages get much shorter, which saves tokens.

```python
@include sparrow/egress.py#L107-L171
```

The `Fetcher` is where the policy is enforced. It takes a `resolve` function, the real DNS by default; the tests give it a pretend one, so they can play both an ordinary site and a name that leads to `127.0.0.1` without any network. Before each request, `private_target` resolves the name and refuses it if any of its addresses is private, unless you listed the host in the settings' allow list yourself (approving a site in chat doesn't count, because a fooled model might ask for exactly that site). A name that doesn't resolve at all becomes an `error`.

> **Note:** A determined attacker who controls a name's DNS can answer the check with a public address and the request a moment later with a private one, a trick called **DNS rebinding**. Closing that gap fully means connecting to the exact address that was checked, through a proxy that enforces the policy, as NemoClaw does outside the agent (Chapter 27). Sparrow's check stops the simple and common cases.

The other important detail is **redirects**. A web server can answer "this page has moved to `https://elsewhere.example/`," and most HTTP clients follow that automatically. If Sparrow let the client follow redirects, an allowed site, or an attacker who controls a page on one, could bounce the request to any address at all, including a denied one or `169.254.169.254`. So the fetcher turns automatic redirects off and follows them itself, **checking the policy again for every hop**, at most four times.

For allowed requests, the vault adds any headers this host should get (next section). The response is **streamed**: the fetcher reads it a piece at a time and stops downloading at 300 KB, so a page of several gigabytes costs no more than a small one. (The first version downloaded the whole page and then kept the first 300 KB, which a reviewer rightly pointed out.) The text is converted from HTML if it's HTML, scrubbed of secrets, and cut to 8,000 characters. A failed request becomes an `error` result with the reason, never an exception that would end the turn.

## The Vault

Some sites need an API key. If you put the key in the system prompt, or let the model add it to a URL, the model has seen it, and anything the model has seen, a prompt injection can ask it to repeat. NemoClaw's answer is **credential injection**: the agent never holds the key; the runtime adds it to the request, and only for the endpoint it belongs to. Sparrow's vault does the same.

```python
@include sparrow/vault.py#L1-L30
```

Secrets live in `state/secrets.env`, one `NAME=value` per line. The vault refuses to start if that file can be read by anyone but you: `stat.S_IMODE` gets the permission bits, and `0o077` is any permission for the group or others. The error tells you exactly how to fix it. That check catches a common accident, copying the file with permissions that make it readable to every user on the machine.

```python
@include sparrow/vault.py#L32-L48
```

`get` looks a secret up in the file, then in the environment. `headers_for` builds the headers for one host from the settings. With this in `sparrow.yaml`:

```
secrets_for_hosts:
  api.weather.example:
    Authorization: "Bearer ${WEATHER_KEY}"
```

a request to `api.weather.example` gets an `Authorization` header with the real key filled in, and a request to any other host gets nothing. The model only ever sees the URL. A missing secret raises an error naming it, which the fetcher reports.

```python
@include sparrow/vault.py#L50-L61
```

`scrub` replaces every secret value that appears in a piece of text with a label such as `[secret WEATHER_KEY]`. It's applied to web pages before the model sees them (some APIs echo your key back in errors or debug output), to every tool result in `call_tool`, and to every line of the audit log. Very short values are skipped, because replacing every occurrence of, say, `abc` would mangle ordinary text and a three-character value isn't a real secret anyway.

> **Tip:** Scrubbing is a second line of defense, not the first. The first is never giving the secret to the model or writing it anywhere. Scrubbing catches the cases you didn't foresee, like an API that reflects your key in an error message, which is exactly what one of the tests in Chapter 23 simulates.

## Allowing Sites

The starter `sparrow.yaml` allows Wikipedia and asks about everything else:

```
egress:
  allow: [en.wikipedia.org, "*.wikipedia.org"]
  deny: []
  unknown: ask
```

Add the sites you use often, such as your local transport authority's timetable site, to `allow`, so Sparrow doesn't ask about them. Put sites you never want contacted in `deny`. If you'd rather Sparrow never visit anything unlisted, set `unknown: deny`; it will then tell you a site isn't allowed instead of asking.

## Key Takeaways

- Control what leaves your machine: deny by default, ask about new sites, and never reach private addresses.
- Match hosts exactly or by a dot-separated suffix; check the deny list first.
- Recognize every way of writing a private address, and check where a name actually leads, not just how it's spelled.
- Follow redirects yourself and check the policy at every hop, and stream downloads so you can stop at a size limit.
- Keep API keys in a vault the model can't read; add them to requests only for their own host.
- Scrub secrets from everything going back to the model or into logs, and refuse a secrets file others can read.
