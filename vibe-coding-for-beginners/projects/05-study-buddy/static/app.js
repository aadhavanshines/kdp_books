const $ = (id) => document.getElementById(id);
let cards = [], index = 0, flipped = false;

function showMessage(text) {
  $("message").textContent = text || "";
  $("message").hidden = !text;
}

function render() {
  const c = cards[index];
  $("card-label").textContent = flipped ? "Answer" : "Question";
  $("card-text").textContent = flipped ? c.answer : c.question;
  $("card").classList.toggle("flipped", flipped);
  $("counter").textContent = `${index + 1} of ${cards.length}`;
  $("prev").disabled = index === 0;
  $("next").disabled = index === cards.length - 1;
}

function go(step) {
  index += step;
  flipped = false;
  render();
}

$("notes").addEventListener("input", () => {
  $("count").textContent = `${$("notes").value.length.toLocaleString()} / 20,000`;
});

$("make").addEventListener("click", async () => {
  showMessage("");
  const notes = $("notes").value;
  if (!notes.trim()) return showMessage("Please paste some study notes first.");
  if (notes.length > 20000)
    return showMessage("Your notes are too long. Please keep them under 20,000 characters.");
  $("make").disabled = true;
  $("make").textContent = "Making flashcards…";
  try {
    const res = await fetch("/api/flashcards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error);
    cards = data.flashcards; index = 0; flipped = false;
    $("card-view").hidden = false;
    render();
  } catch (e) {
    $("card-view").hidden = true;
    showMessage(e.message || "Something went wrong. Please try again.");
  } finally {
    $("make").disabled = false;
    $("make").textContent = "Make flashcards";
  }
});

$("card").addEventListener("click", () => { flipped = !flipped; render(); });
$("prev").addEventListener("click", () => go(-1));
$("next").addEventListener("click", () => go(1));
