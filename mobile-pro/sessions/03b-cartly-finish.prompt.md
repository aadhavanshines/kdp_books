The previous session built Cartly (apps/cartly) from docs/PRD.md section 2
and was cut off by a time limit before it finished. It had also started
moving shared pieces out of apps/platter into @pro/ui and @pro/api (see
`git status` and `git diff`); that refactor may be half done.

Finish the job:
1. Review the uncommitted changes and complete the refactor so Platter and
   Cartly both use the shared pieces, with nothing duplicated and nothing
   left broken.
2. Run typecheck, lint and tests for the whole workspace and fix every
   problem.
3. Re-export both apps for web and recapture any screenshot in
   apps/platter/screenshots or apps/cartly/screenshots whose screen changed.
4. Write a summary of what Cartly contains, what moved into the shared
   packages, and anything still missing from the PRD.
