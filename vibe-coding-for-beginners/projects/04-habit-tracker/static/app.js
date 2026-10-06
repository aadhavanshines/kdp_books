const list = document.getElementById("habits");
const empty = document.getElementById("empty");
const errorBox = document.getElementById("error");
const form = document.getElementById("add-form");
const nameInput = document.getElementById("name");

// The user's own calendar date; the server may be in a different timezone.
function localToday() {
  const n = new Date();
  const pad = (v) => String(v).padStart(2, "0");
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}

async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json", "X-Client-Date": localToday() },
    ...options,
  });
  const body = res.status === 204 ? null : await res.json();
  if (!res.ok) throw new Error((body && body.error) || "Request failed");
  return body;
}

function showError(msg) {
  errorBox.textContent = msg || "";
}

function dayLabel(iso) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, { weekday: "short" });
}

function render(habits) {
  list.replaceChildren();
  empty.hidden = habits.length > 0;
  for (const h of habits) {
    const li = document.createElement("li");
    li.className = "habit";

    const head = document.createElement("div");
    head.className = "habit-head";
    const name = document.createElement("span");
    name.className = "habit-name";
    name.textContent = h.name;
    const del = document.createElement("button");
    del.className = "delete";
    del.textContent = "Delete";
    del.addEventListener("click", () => removeHabit(h));
    const edit = document.createElement("button");
    edit.className = "rename";
    edit.textContent = "Rename";
    edit.addEventListener("click", () => renameHabit(h));
    const actions = document.createElement("div");
    actions.className = "habit-actions";
    actions.append(edit, del);
    head.append(name, actions);

    const days = document.createElement("div");
    days.className = "days";
    h.days.forEach((d, i) => {
      const b = document.createElement("button");
      b.className = "day" + (d.done ? " done" : "") + (i === h.days.length - 1 ? " today" : "");
      b.title = d.date;
      b.setAttribute("aria-pressed", d.done);
      const label = document.createElement("span");
      label.textContent = dayLabel(d.date);
      const mark = document.createElement("span");
      mark.className = "mark";
      mark.textContent = d.done ? "✓" : "·";
      b.append(label, mark);
      b.addEventListener("click", () => toggleDay(h.id, d.date));
      days.append(b);
    });

    const streaks = document.createElement("div");
    streaks.className = "streaks";
    streaks.textContent = `Current streak: ${h.current_streak} · Best streak: ${h.best_streak}`;

    li.append(head, days, streaks);
    list.append(li);
  }
}

async function load() {
  try {
    render(await api("/api/habits"));
  } catch (e) {
    showError(e.message);
  }
}

async function toggleDay(id, date) {
  try {
    showError("");
    await api(`/api/habits/${id}/toggle`, { method: "POST", body: JSON.stringify({ date }) });
    await load();
  } catch (e) {
    showError(e.message);
  }
}

async function renameHabit(h) {
  const input = prompt("Rename habit:", h.name);
  if (input === null || input.trim() === h.name) return;
  try {
    showError("");
    await api(`/api/habits/${h.id}`, { method: "PATCH", body: JSON.stringify({ name: input }) });
    await load();
  } catch (e) {
    showError(e.message);
  }
}

async function removeHabit(h) {
  if (!confirm(`Delete "${h.name}" and all its history?`)) return;
  try {
    showError("");
    await api(`/api/habits/${h.id}`, { method: "DELETE" });
    await load();
  } catch (e) {
    showError(e.message);
  }
}

form.addEventListener("submit", async (ev) => {
  ev.preventDefault();
  try {
    showError("");
    await api("/api/habits", { method: "POST", body: JSON.stringify({ name: nameInput.value }) });
    nameInput.value = "";
    await load();
  } catch (e) {
    showError(e.message);
  }
});

load();
