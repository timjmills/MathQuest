# lf-placevalue critic compare r4: the narrow re-grade after the round-cap root-cause fix (independent critic, Opus medium)

You are an INDEPENDENT critic. Grade only; do not fix.
- Branch `claude/lf-placevalue-w2` at 1c08b6bc. Do not pull.
- Limit: 20 minutes.
- Write output under `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-compare4/`.
- Run every browser command, `--help` included, one at a time through `tests/scripts/mq-browser-run.sh`. For example, `tests/scripts/mq-browser-run.sh node tests/scripts/ws-grade-render.cjs --skills placevalue:compare --roles lesson,scripted-model,guided --size M`; pass options through the tool's opts flag (check `--help`).
- Sizes: **M and L only** (owner: print size S is dropped). No 390 px.

**Read first:**
- `design/audit/RUBRIC.md`
- `design/audit/runs/lf-placevalue/critic-compare3.md`: the r3 grades STAND for every page not listed here. r3 FAILED only on N9.

**What changed since r3** (commits 1ee84d71, 7fdfd0f4):
- Every relation a compare worked step writes ("Write A > B.", "Write A = B.") is joined with no-break spaces.
- The lesson's step strip "Write <, > or =." is one unbreakable unit.
- WRAP-SIGN now also checks band 9999 / 999999 / close.

**Grade:**
- `placevalue:compare` lesson (every page and its key), scripted-model and guided, at M and L, under four option sets:
  - band=999999;
  - closeness=close (band 999999);
  - band=9999;
  - the default.
- Is N9 FIXED?
- Does any line now overflow its cell or panel because a long unbreakable unit cannot wrap? This is the risk of the fix: measure the widest "Write 999,999 > 999,999." against its panel at M.
- Re-check that nothing in r3's passing grades for these pages has regressed.

**Write** `design/audit/runs/lf-placevalue/critic-compare4.md` with:
- the grade table;
- N9 FIXED / NOT FIXED;
- any new finding, with page, size, numbers and the check that would catch it;
- `VERDICT: PASS` / `FAIL` for compare (with r3's grades standing for the other pages);
- the PNG paths you graded.

Edit no other file. Do not commit.
