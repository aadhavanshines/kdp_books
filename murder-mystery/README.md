# Who Killed the Lighthouse Keeper?

*60 Murder Mystery Logic Puzzles: Suspects, Clues and One Killer Every Time*, by Aadhavan Muthurengan. Black-and-white 6 x 9 in paperback, 136 pages.

Four kinds of case: 18 cross-off warm-ups, 18 four-suspect logic grids, 14 five-suspect grids and 10 "one liar" cases, ending with the title case. Every case is generated and verified by code to have exactly one solution, and the solutions section gives the killer, the full grid, the reasoning and the motive.

| Folder | Contents |
| --- | --- |
| `build/settings.py` | The 60 settings: victim, scene, suspects' roles, rooms, objects. |
| `build/logic.py` | What each kind of clue means and how it reads. |
| `build/gen.py` | Generates the cases into `cases.json` (fixed seed, so the book is reproducible). |
| `build/verify.py` | Independent brute-force check of every case. |
| `build/book.py`, `cover.py`, `check.py` | Interior PDF, wrap cover, print checks. |
| `fonts/` | Playfair Display (OFL), Special Elite (Apache 2.0). |
| `metadata/`, `tests/` | KDP listing and checks. |
| `dist/` | Upload-ready interior and cover. |
