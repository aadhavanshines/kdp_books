from datetime import date, timedelta

import pytest

from app import compute_streaks, create_app

TODAY = date(2025, 3, 2)


@pytest.fixture
def client(tmp_path):
    app = create_app(str(tmp_path / "test.db"), today_func=lambda: TODAY)
    return app.test_client()


def add(client, name="Read"):
    return client.post("/api/habits", json={"name": name})


def toggle(client, hid, d):
    return client.post(f"/api/habits/{hid}/toggle", json={"date": d.isoformat()})


# ---- API ----

def test_list_empty(client):
    r = client.get("/api/habits")
    assert r.status_code == 200 and r.get_json() == []


def test_add_and_list(client):
    r = add(client, "  Drink water ")
    assert r.status_code == 201
    h = r.get_json()
    assert h["name"] == "Drink water"
    assert [d["date"] for d in h["days"]][-1] == TODAY.isoformat()
    assert len(h["days"]) == 7 and h["days"][0]["date"] == "2025-02-24"
    assert h["current_streak"] == 0 and h["best_streak"] == 0
    assert len(client.get("/api/habits").get_json()) == 1


@pytest.mark.parametrize("body", [{}, {"name": ""}, {"name": "   "},
                                  {"name": "x" * 31}, {"name": 5}, [1]])
def test_add_invalid(client, body):
    assert client.post("/api/habits", json=body).status_code == 400


def test_add_not_json(client):
    assert client.post("/api/habits", data="nope").status_code == 400


def test_add_max_length_ok(client):
    assert add(client, "x" * 30).status_code == 201


def test_duplicate_case_insensitive(client):
    assert add(client, "Read").status_code == 201
    assert add(client, "rEAD").status_code == 409


def test_delete(client):
    hid = add(client).get_json()["id"]
    toggle(client, hid, TODAY)
    assert client.delete(f"/api/habits/{hid}").status_code == 204
    assert client.get("/api/habits").get_json() == []
    assert client.delete(f"/api/habits/{hid}").status_code == 404
    # name is reusable and old completions are gone
    h = add(client).get_json()
    assert not any(d["done"] for d in h["days"])


def test_toggle_on_off(client):
    hid = add(client).get_json()["id"]
    r = toggle(client, hid, TODAY)
    assert r.status_code == 200
    assert r.get_json()["days"][-1]["done"] is True
    assert r.get_json()["current_streak"] == 1
    r = toggle(client, hid, TODAY)
    assert r.get_json()["days"][-1]["done"] is False


def test_toggle_errors(client):
    hid = add(client).get_json()["id"]
    assert toggle(client, hid, TODAY + timedelta(days=1)).status_code == 400
    assert toggle(client, 999, TODAY).status_code == 404
    for body in ({}, {"date": "bad"}, {"date": "2025-13-01"}, {"date": 5}):
        r = client.post(f"/api/habits/{hid}/toggle", json=body)
        assert r.status_code == 400


def test_index_page(client):
    r = client.get("/")
    assert r.status_code == 200 and b"Habit" in r.data


# ---- streak rules ----

def D(s):
    return date.fromisoformat(s)


def test_streak_empty():
    assert compute_streaks(set(), TODAY) == (0, 0)


def test_streak_today_counts():
    days = {TODAY, TODAY - timedelta(days=1)}
    assert compute_streaks(days, TODAY) == (2, 2)


def test_streak_survives_unmarked_today():
    days = {D("2025-03-01"), D("2025-02-28")}
    assert compute_streaks(days, TODAY) == (2, 2)


def test_streak_broken_after_missed_day():
    assert compute_streaks({D("2025-02-28")}, TODAY) == (0, 1)


def test_best_streak_longer_than_current():
    days = {D(f"2025-02-{n}") for n in (10, 11, 12, 13, 14)} | {TODAY}
    assert compute_streaks(days, TODAY) == (1, 5)


def test_streak_crosses_month_start():
    days = {D("2025-02-27"), D("2025-02-28"), D("2025-03-01"), D("2025-03-02")}
    assert compute_streaks(days, TODAY) == (4, 4)


def test_streak_crosses_month_start_leap_year():
    days = {D("2024-02-28"), D("2024-02-29"), D("2024-03-01")}
    assert compute_streaks(days, D("2024-03-01")) == (3, 3)


def test_streak_via_api_across_month(client):
    hid = add(client).get_json()["id"]
    for n in range(4):
        r = toggle(client, hid, TODAY - timedelta(days=n))
    h = r.get_json()
    assert (h["current_streak"], h["best_streak"]) == (4, 4)
    assert h["days"][0]["done"] is False and h["days"][-1]["done"] is True


def test_old_days_count_for_best_but_not_shown(client):
    hid = add(client).get_json()["id"]
    for n in range(20, 25):
        r = toggle(client, hid, TODAY - timedelta(days=n))
    h = r.get_json()
    assert h["best_streak"] == 5 and h["current_streak"] == 0
    assert not any(d["done"] for d in h["days"])


# ---- user's own "today" (server runs in UTC) ----

# 8 p.m. Tuesday 4 March in California is already Wednesday 5 March in UTC.
UTC_TODAY = date(2025, 3, 5)
USER_TODAY = date(2025, 3, 4)
HDR = {"X-Client-Date": USER_TODAY.isoformat()}


@pytest.fixture
def utc_client(tmp_path):
    app = create_app(str(tmp_path / "utc.db"), today_func=lambda: UTC_TODAY)
    return app.test_client()


def test_today_is_users_date_not_server_date(utc_client):
    h = utc_client.post("/api/habits", json={"name": "Read"}, headers=HDR).get_json()
    assert h["days"][-1]["date"] == USER_TODAY.isoformat()
    listed = utc_client.get("/api/habits", headers=HDR).get_json()
    assert listed[0]["days"][-1]["date"] == USER_TODAY.isoformat()


def test_ticking_users_today_counts_as_today(utc_client):
    hid = utc_client.post("/api/habits", json={"name": "Read"}, headers=HDR).get_json()["id"]
    r = utc_client.post(f"/api/habits/{hid}/toggle",
                        json={"date": USER_TODAY.isoformat()}, headers=HDR)
    assert r.status_code == 200
    h = r.get_json()
    assert h["days"][-1] == {"date": USER_TODAY.isoformat(), "done": True}
    assert h["current_streak"] == 1


def test_future_is_relative_to_users_date(utc_client):
    hid = utc_client.post("/api/habits", json={"name": "Read"}, headers=HDR).get_json()["id"]
    r = utc_client.post(f"/api/habits/{hid}/toggle",
                        json={"date": UTC_TODAY.isoformat()}, headers=HDR)
    assert r.status_code == 400


@pytest.mark.parametrize("bad", ["garbage", "2025-13-45", "2030-01-01", "1999-01-01"])
def test_bad_client_date_falls_back_to_server_date(utc_client, bad):
    h = utc_client.post("/api/habits", json={"name": "Read"},
                        headers={"X-Client-Date": bad}).get_json()
    assert h["days"][-1]["date"] == UTC_TODAY.isoformat()


# ---- Deployment config ----

def test_database_path_env_var(tmp_path, monkeypatch):
    target = tmp_path / "nested" / "data.db"
    monkeypatch.setenv("DATABASE_PATH", str(target))
    c = create_app(today_func=lambda: TODAY).test_client()
    assert add(c, "Read").status_code == 201
    assert target.exists()
    # A fresh app on the same path (a "restart") still sees the data.
    c2 = create_app(today_func=lambda: TODAY).test_client()
    assert [h["name"] for h in c2.get("/api/habits").get_json()] == ["Read"]
