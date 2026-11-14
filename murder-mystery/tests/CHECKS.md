# Pre-Publication Checks

```
python3 build/gen.py      # generate the 60 cases into build/cases.json (fixed seed)
python3 build/verify.py   # independent brute-force check of every case
python3 build/book.py     # interior PDF
python3 build/cover.py    # wrap cover and front JPEG
python3 build/check.py    # page size, margins, embedded fonts
```

## Puzzle correctness

`verify.py` re-reads `cases.json` and, without using the generator's own machinery, tries every possible answer for every case:

- cross-off cases: exactly one suspect fits all the evidence, and no clue is unnecessary;
- grid cases: exactly one arrangement of rooms and objects satisfies the clues, and the Crime Scene Report then names one suspect;
- one-liar cases: exactly one arrangement has exactly one false statement, and its speaker is the killer.

Last run: `60 cases checked, 0 failed; levels: {'A': 18, 'B': 18, 'C': 14, 'D': 10}`.

The generator also only accepts grid cases that can be solved one clue at a time (no guessing); the steps it finds are the printed solutions. All 300 suspect names are different.

## Print files

Last run of `check.py`: `136 pages, 6 x 9 in. Smallest gutter 0.799 in (KDP minimum 0.375); smallest outer margin 0.387 in (minimum 0.25). OK`. All fonts embedded.

Cover: 12.556 x 9.250 in for a 0.306 in spine (136 pages, white paper); barcode area clear on the back.

## Not checked here

- A human test-solve of every case (the solver proves each has one answer; difficulty has not been play-tested).
- A printed proof.
