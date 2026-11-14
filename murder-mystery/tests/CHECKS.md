# Pre-Publication Checks

```
python3 build/gen.py      # generate the 60 cases into build/cases.json (fixed seed)
python3 build/verify.py   # independent brute-force check of every case
python3 build/book.py     # interior PDF
python3 build/cover.py    # wrap cover and front JPEG
python3 build/check.py    # page size, margins, embedded fonts
```

## Puzzle correctness

`verify.py` re-reads `cases.json` and tries every possible answer for every case, without using the generator's own solver:

- cross-off cases: exactly one suspect fits all the evidence, and no clue is unnecessary;
- grid cases: exactly one arrangement of rooms and objects satisfies the clues, and the Crime Scene Report then names one suspect;
- one-liar cases: exactly one arrangement has exactly one false statement, and its speaker is the killer.

It also checks the story side:

- every suspect's first name suits a role that implies a man or a woman (actress, nephew, miller's wife and so on);
- no two suspects in a case share a first name, none shares one with the victim, and all 300 full names differ;
- no cross-off case has evidence that contradicts itself (a room that is shut off is never also named as a way in);
- no solution step is vague or missing.

Last run: `60 cases checked, 0 failed; levels: {'A': 18, 'B': 18, 'C': 14, 'D': 10}`.

## Solutions

The generator only accepts a grid case if its own solver finishes it using a short list of named rules, one clue at a time: plain facts, "only these two", "only two choices", the two-people-two-objects rule, single squares left in a row or column, and, in one-liar cases, statements the grid already proves true or false. Each printed step is the sentence the solver wrote when it used that rule. In every one-liar case the clues alone do not finish the grid, so the statements are needed.

## Print files

Last run of `check.py`: `154 pages, 6 x 9 in. Smallest gutter 0.799 in (KDP minimum 0.5); smallest outer margin 0.387 in (minimum 0.25). OK`. All fonts embedded. `book.py` stops the build if a grid would run into the verdict box or its squares would be smaller than 19 pt.

Cover: 12.597 x 9.250 in for a 0.347 in spine (154 pages, white paper); barcode area clear on the back.

## Not checked here

- A human test-solve for difficulty and timing (the solver proves each case has one answer and can be solved without guessing).
- A printed proof.
