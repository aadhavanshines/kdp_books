"""Unit tests: each part of Sparrow on its own."""

from __future__ import annotations

from datetime import datetime, timedelta
from zoneinfo import ZoneInfo

import pytest

from sparrow.config import load_settings
from sparrow.privacy import PrivacyRouter
from sparrow.scheduler import next_after, parse_when
from sparrow.skills import SkillLibrary, parse_skill
from sparrow.todo import TodoList

LISBON = ZoneInfo("Europe/Lisbon")
NOW = datetime(2026, 10, 27, 9, 0, tzinfo=LISBON)  # a Tuesday


# Settings ---------------------------------------------------------------


def test_settings_defaults_and_sections(home):
    settings = load_settings(home)
    assert settings.owner_name == "Asha"
    assert settings.model == "claude-sonnet-5-5"
    assert settings.egress.deny == ["evil.example"]
    assert settings.heartbeat.every_minutes == 30
    assert settings.workspace == home / "workspace"


def test_unknown_setting_is_an_error(tmp_path):
    (tmp_path / "sparrow.yaml").write_text("modle: oops\n")
    with pytest.raises(ValueError, match="modle"):
        load_settings(tmp_path)


def test_empty_and_bad_sections(tmp_path):
    (tmp_path / "sparrow.yaml").write_text("heartbeat:\n")
    assert load_settings(tmp_path).heartbeat.every_minutes == 30
    (tmp_path / "sparrow.yaml").write_text("heartbeat: 5\n")
    with pytest.raises(ValueError, match="must be a section"):
        load_settings(tmp_path)


# Workspace --------------------------------------------------------------


def test_workspace_keeps_owner_edits(core):
    soul = core.workspace.root / "SOUL.md"
    soul.write_text("You are Kestrel.")
    core.workspace.create()
    assert soul.read_text() == "You are Kestrel."


def test_system_prompt_has_everything(core):
    (core.workspace.root / "USER.md").write_text("Asha lives in Lisbon.")
    core.memory.remember("Asha is vegetarian", NOW)
    prompt = core.workspace.system_prompt(
        NOW, core.skills.index(), "Asha", "telegram:100"
    )
    for expected in (
        "Sparrow",
        "Asha lives in Lisbon",
        "vegetarian",
        "daily-briefing",
        "Tuesday 2026-10-27 09:00",
        "<untrusted>",
    ):
        assert expected in prompt


def test_guest_prompt_has_nothing_private(core):
    (core.workspace.root / "USER.md").write_text("Asha lives in Lisbon.")
    core.memory.remember("Asha's PIN hint is her cat", NOW)
    prompt = core.workspace.guest_prompt(NOW, "-", "Ravi", "telegram:555")
    assert "Lisbon" not in prompt and "cat" not in prompt
    assert "Ravi" in prompt


# Memory -----------------------------------------------------------------


def test_remember_and_search(core):
    core.memory.remember("Priya's birthday is 14 November", NOW)
    core.memory.remember("Asha prefers aisle seats on trains", NOW)
    hits = core.memory.search("when is Priya's birthday?")
    assert hits[0][1].endswith("Priya's birthday is 14 November")


def test_search_sees_hand_edits_and_daily_notes(core):
    memory_file = core.workspace.root / "MEMORY.md"
    memory_file.write_text(
        memory_file.read_text() + "- Dentist: Dr Okafor\n"
    )
    core.memory.note("Talked about the Porto trip", NOW)
    assert core.memory.search("dentist")[0][1] == "Dentist: Dr Okafor"
    assert core.memory.search("porto")[0][0] == "memory/2026-10-27.md"


@pytest.mark.parametrize(
    "query", ['"', "AND OR NOT", "*", 'a"b(c)', "", "   ", "NEAR(x y)"]
)
def test_search_never_breaks_on_odd_queries(core, query):
    core.memory.remember("something", NOW)
    core.memory.search(query)  # no exception


def test_remember_keeps_one_line(core):
    core.memory.remember("first\n- 2020-01-01: fake old fact", NOW)
    lines = (core.workspace.root / "MEMORY.md").read_text().splitlines()
    assert lines[-1] == "- 2026-10-27: first - 2020-01-01: fake old fact"


# Skills -----------------------------------------------------------------


def test_bundled_skills_load(core):
    skills = core.skills.load()
    assert set(skills) == {"daily-briefing", "expense-log", "packing-list"}
    assert "todo_list" in core.skills.read("daily-briefing")


def test_broken_skill_is_skipped_and_reported(core):
    bad = core.workspace.skills_dir / "bad"
    bad.mkdir()
    (bad / "SKILL.md").write_text("no front matter here")
    library = SkillLibrary(core.workspace.skills_dir)
    assert "bad" not in library.load()
    assert "must start with ---" in library.problems[0]


def test_write_skill_checks_name(core):
    with pytest.raises(ValueError):
        core.skills.write("../../evil", "x", "y")
    path = core.skills.write("plant-care", "Water reminders", "1. Water.")
    assert parse_skill(path).name == "plant-care"


# Scheduler time language --------------------------------------------------


@pytest.mark.parametrize(
    "text,first,repeat",
    [
        ("2026-10-28 09:00", "2026-10-28 09:00", None),
        ("in 30 minutes", "2026-10-27 09:30", None),
        ("in 2 days", "2026-10-29 09:00", None),
        ("tomorrow 07:30", "2026-10-28 07:30", None),
        ("today 18:00", "2026-10-27 18:00", None),
        ("daily 08:00", "2026-10-28 08:00", "daily 08:00"),
        ("daily 10:00", "2026-10-27 10:00", "daily 10:00"),
        ("weekdays 08:00", "2026-10-28 08:00", "weekdays 08:00"),
        ("weekly mon 09:00", "2026-11-02 09:00", "weekly mon 09:00"),
        ("every 2 hours", "2026-10-27 11:00", "every 120m"),
        ("Every 45 Minutes", "2026-10-27 09:45", "every 45m"),
    ],
)
def test_parse_when(text, first, repeat):
    when, rule = parse_when(text, NOW)
    assert (f"{when:%Y-%m-%d %H:%M}", rule) == (first, repeat)


@pytest.mark.parametrize(
    "text",
    [
        "next week",
        "today 08:00",
        "every 1 minute",
        "weekly xyz 09:00",
        "2026-10-28 25:00",
        "2026-10-01 09:00",  # already past
    ],
)
def test_parse_when_rejects(text):
    with pytest.raises(ValueError):
        parse_when(text, NOW)


def test_weekdays_skip_the_weekend():
    friday_evening = datetime(2026, 10, 30, 20, 0, tzinfo=LISBON)
    monday = next_after("weekdays 08:00", friday_evening)
    assert f"{monday:%a %H:%M}" == "Mon 08:00"


def test_daily_rule_across_clock_change():
    # Clocks in Lisbon went back one hour on 25 October 2026
    before = datetime(2026, 10, 24, 9, 0, tzinfo=LISBON)
    after = next_after("daily 08:00", before)
    assert f"{after:%Y-%m-%d %H:%M %Z}" == "2026-10-25 08:00 WET"


def test_jobs_run_once_or_repeat(core):
    once, _, _ = core.scheduler.add(
        "remind", "Stretch", "in 5 minutes", "telegram:100", NOW
    )
    daily, _, _ = core.scheduler.add(
        "task", "Briefing", "daily 08:00", "telegram:100", NOW
    )
    later = NOW + timedelta(days=1)
    due = {job["id"] for job in core.scheduler.due(later)}
    assert due == {once, daily}
    for job in core.scheduler.due(later):
        core.scheduler.done(job, later)
    remaining = core.scheduler.list()
    assert [job["id"] for job in remaining] == [daily]
    assert remaining[0]["next_run"].startswith("2026-10-29T08:00")


# To-dos -------------------------------------------------------------------


def test_todo_round_trip(tmp_path):
    todo = TodoList(tmp_path / "TODO.md")
    todo.add("Book train", "2026-10-30")
    todo.add("Call Mum")
    todo.complete(1)
    assert todo.show() == "2. Call Mum"
    assert "done: Book train (due 2026-10-30)" in todo.show(True)
    with pytest.raises(ValueError):
        todo.complete(7)
    with pytest.raises(ValueError):
        todo.add("x", "30/10/2026")


# Privacy ------------------------------------------------------------------


@pytest.mark.parametrize(
    "text,kind",
    [
        ("mail me at maria.lopez@mail.example", "EMAIL"),
        ("card 4111 1111 1111 1111", "CARD"),
        ("call +351 912 345 678", "PHONE"),
        ("call (555) 010-7788", "PHONE"),
        ("my password is Hunter22!", "PASSWORD"),
        ("pin: 4821", "PASSWORD"),
        ("key sk-live-abcdefghijklmnop1234", "KEY"),
        ("IBAN DE89 3704 0044 0532 0130 00", "IBAN"),
        ("SSN 123-45-6789", "SSN"),
    ],
)
def test_privacy_finds(text, kind):
    assert kind in [k for k, _ in PrivacyRouter().findings(text)]


@pytest.mark.parametrize(
    "text",
    [
        "Meet on 2026-10-27 at 12:30",
        "Order number 1234567890123",
        "It costs 1,250.00 dollars",
        "card 4111 1111 1111 1112",  # fails the Luhn check
        "Room 101, floor 3",
    ],
)
def test_privacy_leaves_ordinary_text(text):
    assert PrivacyRouter().findings(text) == []


def test_redact_and_restore_round_trip():
    router = PrivacyRouter("redact")
    text = "Email ana@mail.example and again ana@mail.example"
    hidden = router.redact(text)
    assert hidden == "Email <EMAIL_1> and again <EMAIL_1>"
    assert router.restore(hidden) == text
    assert router.restore_args({"to": "<EMAIL_1>", "n": 3}) == {
        "to": "ana@mail.example",
        "n": 3,
    }


def test_block_and_off_modes():
    assert PrivacyRouter("block").blocked("pin: 4821") == ["PASSWORD"]
    assert PrivacyRouter("redact").blocked("pin: 4821") == []
    assert PrivacyRouter("off").redact("pin: 4821") == "pin: 4821"
    with pytest.raises(ValueError):
        PrivacyRouter("maybe")
