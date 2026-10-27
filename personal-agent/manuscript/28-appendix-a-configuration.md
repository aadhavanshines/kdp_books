# Appendix A: Configuration Reference

Sparrow reads its settings from `sparrow.yaml` in its home folder (`~/.sparrow` unless you pass `--home` or set `SPARROW_HOME`). Every setting has a default, so the file needs only the lines you change. An unknown setting stops Sparrow with an error naming it (Chapter 5).

## Top-Level Settings

| Setting | Default | Meaning |
| --- | --- | --- |
| `owner_name` | `Owner` | Your name, as Sparrow tells strangers to ask you |
| `owners` | `[]` | Your identities, such as `["telegram:812345678"]`; the terminal and web chat are always owners |
| `model` | `claude-sonnet-5-5` | Model for conversations and tasks |
| `heartbeat_model` | `claude-haiku-4-5` | Model for heartbeat checks |
| `timezone` | `UTC` | Your time zone, such as `Europe/Lisbon`; used for every time and reminder |
| `history_turns` | `12` | Recent exchanges sent with each message |
| `daily_budget_usd` | `2.00` | Spending limit per day; turns stop when it's reached |
| `privacy` | `redact` | `redact` (placeholders), `block` (refuse private data) or `off` |
| `secrets_for_hosts` | `{}` | For each host, headers to add, with `${NAME}` for a secret from the vault |

## Sections

**`telegram`**

| Setting | Default | Meaning |
| --- | --- | --- |
| `enabled` | `false` | Run the Telegram channel |
| `token_env` | `SPARROW_TELEGRAM_TOKEN` | Name of the secret holding the bot token |
| `api_url` | `https://api.telegram.org` | Bot API address (changed only for testing) |

**`webchat`**

| Setting | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Run the web chat |
| `host` | `127.0.0.1` | Address to listen on; keep it local |
| `port` | `8765` | Port to listen on |
| `token_env` | `SPARROW_WEB_TOKEN` | Name of the secret holding the web chat token (16+ characters) |

**`heartbeat`**

| Setting | Default | Meaning |
| --- | --- | --- |
| `every_minutes` | `30` | Minutes between heartbeat checks |
| `active_hours` | `[8, 22]` | Hours (start, end) when the heartbeat may run |

**`sandbox`**

| Setting | Default | Meaning |
| --- | --- | --- |
| `enabled` | `true` | Allow `run_command`, in the sandbox; `false` refuses all commands |
| `timeout_seconds` | `20` | Wall-clock and CPU time limit per command |
| `memory_mb` | `512` | Memory limit per command |
| `max_output_chars` | `4000` | Output kept per command; the rest is cut |

**`egress`**

| Setting | Default | Meaning |
| --- | --- | --- |
| `allow` | `[]` | Hosts Sparrow may fetch; `*.example.com` allows subdomains |
| `deny` | `[]` | Hosts never fetched, including their subdomains; beats `allow` |
| `unknown` | `ask` | For other hosts: `ask` for approval, or `deny` |

## A Complete Example

```
owner_name: Asha
owners: ["telegram:812345678"]
model: claude-sonnet-5-5
heartbeat_model: claude-haiku-4-5
timezone: Europe/Lisbon
history_turns: 12
daily_budget_usd: 2.00
privacy: redact
telegram:
  enabled: true
webchat:
  enabled: true
  port: 8765
heartbeat:
  every_minutes: 30
  active_hours: [8, 22]
sandbox:
  timeout_seconds: 20
  memory_mb: 512
egress:
  allow: [en.wikipedia.org, "*.wikipedia.org",
          api.weather.example]
  deny: []
  unknown: ask
secrets_for_hosts:
  api.weather.example:
    Authorization: "Bearer ${WEATHER_KEY}"
```

## Files in the Home Folder

| Path | Contents | Edit it? |
| --- | --- | --- |
| `sparrow.yaml` | Settings | Yes |
| `workspace/SOUL.md` | Personality | Yes |
| `workspace/USER.md` | About you | Yes |
| `workspace/AGENTS.md` | House rules | Yes, carefully |
| `workspace/MEMORY.md` | Long-term facts | Yes |
| `workspace/HEARTBEAT.md` | Heartbeat checklist | Yes |
| `workspace/TODO.md` | To-do list | Yes |
| `workspace/memory/` | Daily notes | Yes |
| `workspace/skills/` | Skills, one folder each | Yes |
| `workspace/files/` | Your documents (the sandbox's `/work`) | Yes |
| `state/secrets.env` | Tokens and keys, `NAME=value` (`chmod 600`) | Yes, to add secrets |
| `state/model.env` | `ANTHROPIC_API_KEY` for the service (`chmod 600`) | Yes |
| `state/approved-hosts.txt` | Sites you approved, one per line | To remove one |
| `state/sparrow.db` | Jobs, approvals, guests, spending | No |
| `state/memory-index.db` | Search index (rebuilt if deleted) | No |
| `state/sessions/` | Conversation transcripts | No |
| `state/audit/` | Audit log, one file per day | No |
