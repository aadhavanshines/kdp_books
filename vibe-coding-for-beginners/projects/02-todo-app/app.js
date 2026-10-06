// ---------- Grab the elements we need from the page ----------
const input = document.getElementById("new-task");
const dueInput = document.getElementById("new-due");
const list = document.getElementById("task-list");
const countEl = document.getElementById("count");
const clearBtn = document.getElementById("clear-completed");
const filterButtons = document.querySelectorAll(".filters button");

// ---------- App data ----------
// Each task looks like: { id: 123, text: "Buy milk", done: false, due: "2026-10-09" }
// "due" is optional: it is "" (or missing, in tasks saved by older versions) when there is no date.
let tasks = loadTasks();
let filter = "all"; // "all", "active" or "done"

// ---------- Saving and loading (localStorage) ----------
function saveTasks() {
  localStorage.setItem("todo-tasks", JSON.stringify(tasks));
}

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem("todo-tasks"));
    return Array.isArray(saved) ? saved : [];
  } catch (error) {
    return []; // nothing saved yet, or the data was broken
  }
}

// ---------- Changing the data ----------
function addTask(text, due) {
  text = text.trim();
  if (text === "") return; // ignore empty tasks
  tasks.push({ id: Date.now(), text: text, done: false, due: due || "" });
  update();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  task.done = !task.done;
  update();
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  update();
}

function editTask(id, newText) {
  newText = newText.trim();
  if (newText === "") {
    deleteTask(id); // an empty edit removes the task
    return;
  }
  tasks.find((t) => t.id === id).text = newText;
  update();
}

// Save, then redraw the screen. Called after every change.
function update() {
  saveTasks();
  render();
}

// ---------- Due date helpers ----------
// Today as "YYYY-MM-DD" in the user's local time (same format the date picker gives us).
// These strings can be compared with < and > because the format sorts correctly.
function todayString() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return now.getFullYear() + "-" + month + "-" + day;
}

// Turn "2026-10-09" into "Fri, Oct 9" (adds the year if it is not this year)
function formatDate(dateString) {
  const [year, month, day] = dateString.split("-").map(Number);
  const date = new Date(year, month - 1, day); // local time, so no timezone shift
  const options = { weekday: "short", month: "short", day: "numeric" };
  if (year !== new Date().getFullYear()) options.year = "numeric";
  return date.toLocaleDateString("en-US", options);
}

// Text for the line under a task, e.g. "Due Fri, Oct 9"
function dueText(task, overdue) {
  if (task.due === todayString()) return "Due today";
  if (overdue) return "Overdue · " + formatDate(task.due);
  return "Due " + formatDate(task.due);
}

// ---------- Drawing the page ----------
function render() {
  const today = todayString();

  // Keep only the tasks that match the current filter
  const visible = tasks.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  // Rebuild the list from scratch
  list.innerHTML = "";
  for (const task of visible) {
    const li = document.createElement("li");
    li.dataset.id = task.id;
    if (task.done) li.classList.add("done");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = task.done;

    const label = document.createElement("label");
    label.textContent = task.text; // textContent is safe against HTML injection

    // Wrapper so the due date can sit under the task text
    const textBox = document.createElement("div");
    textBox.className = "task-text";
    textBox.appendChild(label);

    // Older saved tasks have no "due", so this is skipped for them
    if (task.due) {
      const overdue = !task.done && task.due < today;
      if (overdue) li.classList.add("overdue");

      const dueEl = document.createElement("small");
      dueEl.className = "due";
      dueEl.textContent = dueText(task, overdue);
      textBox.appendChild(dueEl);
    }

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.textContent = "×";
    deleteBtn.setAttribute("aria-label", "Delete task");

    li.append(checkbox, textBox, deleteBtn);
    list.appendChild(li);
  }

  // "N items left" counts tasks that are not done
  const left = tasks.filter((t) => !t.done).length;
  countEl.textContent = left + (left === 1 ? " item left" : " items left");

  // Highlight the selected filter button
  filterButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.filter === filter);
  });

  // Only show "Clear completed" if there is something to clear
  clearBtn.style.visibility = tasks.some((t) => t.done) ? "visible" : "hidden";
}

// ---------- Editing a task (double-click) ----------
function startEditing(li) {
  const id = Number(li.dataset.id);
  const label = li.querySelector("label");

  // Replace the label with a text box holding the current text
  const editInput = document.createElement("input");
  editInput.type = "text";
  editInput.className = "edit-input";
  editInput.value = label.textContent;
  label.replaceWith(editInput);
  editInput.focus();

  let finished = false; // stops Enter + blur from both running
  function finish(save) {
    if (finished) return;
    finished = true;
    if (save) editTask(id, editInput.value);
    else render(); // Escape: just redraw, throwing away changes
  }

  editInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") finish(true);
    if (e.key === "Escape") finish(false);
  });
  editInput.addEventListener("blur", () => finish(true)); // clicking away saves
}

// ---------- Event listeners ----------
// Press Enter in the main input to add a task
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    addTask(input.value, dueInput.value);
    input.value = "";
    dueInput.value = "";
  }
});

// One listener on the whole list handles every task (even ones added later)
list.addEventListener("click", (e) => {
  const li = e.target.closest("li");
  if (!li) return;
  const id = Number(li.dataset.id);

  if (e.target.matches("input[type=checkbox]")) toggleTask(id);
  if (e.target.matches(".delete")) deleteTask(id);
});

// Double-click a task's text to edit it
list.addEventListener("dblclick", (e) => {
  if (e.target.matches("label")) startEditing(e.target.closest("li"));
});

// Filter buttons
filterButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    filter = btn.dataset.filter;
    render();
  });
});

// "Clear completed" removes every done task
clearBtn.addEventListener("click", () => {
  tasks = tasks.filter((t) => !t.done);
  update();
});

// ---------- Start up: show any saved tasks ----------
render();
