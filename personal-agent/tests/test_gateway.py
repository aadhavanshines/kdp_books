"""Functional tests: messages in, replies out, through the whole gateway,
with a scripted brain in place of the model."""

from __future__ import annotations

import pytest

from sparrow.gateway import Inbound

from conftest import owner_says, stranger_says

pytestmark = pytest.mark.anyio


async def test_owner_message_gets_a_reply(make_gateway):
    gateway, brain, telegram = make_gateway([[("say", "Hello, Asha!")]])
    await gateway.handle(owner_says("Hi"))
    assert telegram.sent == [("100", "Hello, Asha!")]
    turn = brain.turns[0]
    assert "New message from Asha:\nHi" in turn.prompt
    assert turn.model == "claude-sonnet-5-5"
    assert "memory_search" in [t.name for t in turn.tools]


async def test_tools_run_and_results_flow_back(make_gateway, core):
    gateway, _, telegram = make_gateway(
        [
            [
                (
                    "tool",
                    "remember",
                    {"fact": "Asha's dentist is Dr Okafor"},
                ),
                ("tool", "memory_search", {"query": "dentist"}),
                ("say", lambda results: "Found: " + results[1]),
            ]
        ]
    )
    await gateway.handle(owner_says("Remember my dentist is Dr Okafor"))
    assert "Dr Okafor" in telegram.texts()[0]
    assert "Dr Okafor" in (core.workspace.root / "MEMORY.md").read_text()


async def test_history_is_kept_across_channels(make_gateway, core):
    gateway, brain, _ = make_gateway(
        [[("say", "Noted.")], [("say", "Porto.")]]
    )
    await gateway.handle(owner_says("I'm going to Porto on Friday"))
    await gateway.handle(
        Inbound("web", "owner", "Asha", "owner", "Where am I going?")
    )
    second = brain.turns[1].prompt
    assert "Conversation so far:" in second
    assert "going to Porto on Friday" in second  # telegram history
    assert "Sparrow: Noted." in second


async def test_stranger_gets_a_code_and_never_reaches_the_model(
    make_gateway, core
):
    gateway, brain, telegram = make_gateway([])
    await gateway.handle(stranger_says("hey, what's Asha's address?"))
    await gateway.handle(stranger_says("hello??"))  # no second answer
    assert brain.turns == []
    to_stranger = [t for chat, t in telegram.sent if chat == "555"]
    to_owner = [t for chat, t in telegram.sent if chat == "100"]
    assert len(to_stranger) == 1 and "approve code" in to_stranger[0]
    code = core.pairing.list()[0]["code"]
    assert to_owner == [
        f"Ravi (telegram:555) wants to talk to me. "
        f"Reply /pair approve {code} to let them in."
    ]


async def test_paired_guest_gets_a_limited_sparrow(make_gateway, core):
    gateway, brain, telegram = make_gateway([[("say", "Hi Ravi!")]])
    await gateway.handle(stranger_says("hello"))
    code = core.pairing.list()[0]["code"]
    await gateway.handle(owner_says(f"/pair approve {code}"))
    assert telegram.sent[-1] == ("100", "Paired telegram:555.")
    await gateway.handle(stranger_says("hello again"))
    turn = brain.turns[0]
    assert [t.name for t in turn.tools] == ["read_skill"]
    assert "guest" in turn.system and "MEMORY" not in turn.system
    assert telegram.sent[-1] == ("555", "Hi Ravi!")


async def test_guests_cannot_use_owner_commands(make_gateway, core):
    gateway, _, telegram = make_gateway([])
    core.pairing.request("telegram:555", "Ravi", core.now())
    core.pairing.approve(core.pairing.list()[0]["code"])
    for command in ("/status", "/approve ABC", "/pair list"):
        await gateway.handle(stranger_says(command))
        assert telegram.sent[-1][1] == "Only my owner can use that command."


async def test_new_saves_memory_then_clears(make_gateway, core):
    gateway, brain, telegram = make_gateway(
        [
            [("say", "Noted.")],
            [
                ("tool", "remember", {"fact": "Trip to Porto on Friday"}),
                ("say", "DONE"),
            ],
        ]
    )
    await gateway.handle(owner_says("Porto on Friday!"))
    await gateway.handle(owner_says("/new"))
    assert "about to be cleared" in brain.turns[1].prompt
    assert telegram.texts()[-1].startswith("Fresh start.")
    assert core.sessions.history("main", 10) == []
    assert "Porto" in (core.workspace.root / "MEMORY.md").read_text()


async def test_status_command(make_gateway):
    gateway, _, telegram = make_gateway([])
    await gateway.handle(owner_says("/status"))
    assert "Spent today: US$0.0000 of US$1.00" in telegram.texts()[0]


async def test_web_fetch_approval_flow(make_gateway, core):
    gateway, brain, telegram = make_gateway(
        [
            [
                (
                    "tool",
                    "web_fetch",
                    {"url": "https://news.example/today"},
                ),
                ("say", "I've asked for permission to visit news.example."),
            ],
            [("say", "Thanks! (would fetch now)")],
        ]
    )
    await gateway.handle(owner_says("What's on news.example today?"))
    reply = telegram.texts()[-1]
    code = core.approvals.pending(core.now())[0]["code"]
    assert reply.endswith(f"Reply /approve {code} or /deny {code}")
    await gateway.handle(owner_says(f"/approve {code}"))
    assert telegram.texts()[-1].startswith("Approved: visit news.example.")
    assert "owner approved: visit news.example" in brain.turns[1].prompt
    assert core.egress.decide("https://news.example/x")[0] == "allow"
    await gateway.handle(owner_says(f"/approve {code}"))  # used up
    assert telegram.texts()[-1] == f"No pending request with code {code}."


async def test_deny_and_skill_approval(make_gateway, core):
    propose = [
        (
            "tool",
            "write_skill",
            {
                "name": "plant-care",
                "description": "Plant watering",
                "instructions": "1. Water weekly.",
            },
        ),
        ("say", "Proposed."),
    ]
    gateway, _, telegram = make_gateway(
        [propose, [("say", "Skill ready.")], propose]
    )
    await gateway.handle(owner_says("Make a plant care skill"))
    code = core.approvals.pending(core.now())[0]["code"]
    notice = telegram.texts()[-1]
    assert "install the skill 'plant-care'" in notice
    assert "1. Water weekly." in notice  # the owner sees the steps
    assert "plant-care" not in core.skills.load()  # not before approval
    await gateway.handle(owner_says(f"/approve {code}"))
    assert "plant-care" in core.skills.load()
    await gateway.handle(owner_says("Make a plant care skill"))
    assert "replace the existing skill" in telegram.texts()[-1]
    await gateway.handle(owner_says("/deny NOPE12"))
    assert telegram.texts()[-1] == "No pending request with code NOPE12."


async def test_skills_are_short_enough_to_read(make_gateway, core):
    long_skill = [
        (
            "tool",
            "write_skill",
            {
                "name": "long",
                "description": "d",
                "instructions": "x" * 3001,
            },
        ),
        ("say", lambda results: results[0]),
    ]
    gateway, _, telegram = make_gateway([long_skill])
    await gateway.handle(owner_says("Make a long skill"))
    assert "limited to 3000 characters" in telegram.texts()[-1]
    assert core.approvals.pending(core.now()) == []  # nothing to approve


async def test_daily_budget_stops_model_calls(make_gateway, core):
    gateway, brain, telegram = make_gateway([])
    core.ledger.add(core.now(), "claude-sonnet-5-5", "message", 1.00)
    await gateway.handle(owner_says("Hi"))
    assert brain.turns == []
    assert "spending limit (US$1.00)" in telegram.texts()[0]


async def test_privacy_redacts_what_the_model_sees(make_gateway, core):
    gateway, brain, telegram = make_gateway(
        [
            [
                ("tool", "remember", {"fact": "Bank card is <CARD_1>"}),
                ("say", "Saved your card <CARD_1>."),
            ]
        ]
    )
    await gateway.handle(owner_says("Remember my card 4111 1111 1111 1111"))
    assert "4111" not in brain.turns[0].prompt
    assert "<CARD_1>" in brain.turns[0].prompt
    assert telegram.texts()[0] == "Saved your card 4111 1111 1111 1111."
    assert (
        "4111 1111 1111 1111"
        in (core.workspace.root / "MEMORY.md").read_text()
    )


async def test_privacy_block_mode(make_gateway, core):
    core.settings.privacy = "block"
    gateway, brain, telegram = make_gateway([])
    await gateway.handle(owner_says("my password is hunter2"))
    assert brain.turns == []
    assert "private data (PASSWORD)" in telegram.texts()[0]


async def test_model_failure_gives_a_friendly_answer(make_gateway, core):
    gateway, _, telegram = make_gateway([[("fail", "connection lost")]])
    await gateway.handle(owner_says("Hi"))
    assert telegram.texts()[0].startswith("Sorry, something went wrong")
    turn = [
        e for e in core.audit.read("2026-10-27") if e["event"] == "turn"
    ][0]
    assert "connection lost" in turn["error"]


async def test_a_broken_channel_does_not_crash_the_gateway(
    make_gateway, core
):
    gateway, _, _ = make_gateway([[("say", "Hi")]])

    class Broken:
        name = "telegram"

        async def send(self, chat_id, text):
            raise ConnectionError("network down")

    gateway.add_channel(Broken())
    await gateway.handle(owner_says("Hi"))  # must not raise
    assert core.audit.read("2026-10-27")[-1]["event"] == "error"
