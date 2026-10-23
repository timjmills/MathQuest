# Mixed practice — phase M1 (lane status)

Branch `claude/sweet-newton-c8wrv1-wip-mixed-m1`. Plan: `design/IMPROVEMENT_PLAN.md` §3 (M1 row of §3.5).

| Step | State |
|---|---|
| First build of `interleave()` + mixed arrangement (Opus medium, Q-S7) | done (3d91189, 70d3fd4, 0f8a95a) |
| Q-M1 edits: PAGE_TYPES 5.2, DN-34, DN-31, `anchors.js` | done |
| Critic r1 (Opus medium) | FAIL — S = L page; legacy sub_facts misaligned; repeats in a share |
| Fix r2 (3680a8f) / critic r2 | FAIL — I Can S doubled letters (CL-13); minor: related facts |
| Fix r3 (ddab6d3) / critic r3 | FAIL — exact repeats on the 2-skill S page (last deal pass drops all checks); I Can M = S (size ladder); I Can L fill 0.46 |
| Escalation (§1.7): repeats and the size ladder survived two rounds at medium → loop stopped, root causes named, machine checks required (`sheet/mixed-page.check.cjs`), fresh builder (Opus medium) | done (r4: a306a11, 01d4db4, a434655) |
| Critic r4 (fresh, Opus medium) | 14 / 16 pass; fill-on repeats clustered, fill-off empty box |
| Fix r5 (e694195) / critic r5 | the 3 changed pages pass |
| Fix r6 (5a13a58, Opus low): PG-15 trailing area, option-named notes, one fill figure / critic r6 | **PASS — all 16 pages ≥ 8 on every criterion, pupil and key** |

Open for other lanes / the owner:
- `subtraction:sub_facts` still draws with the legacy template (`gen-operations.js`), so it cannot join a mixed page.
- CL-4: in the kit `fact` cell the problem ends at 61–63 % of the cell height, not in the top half (owner ruling).

Owner ruling 2026-10-23 (repeats), final: "the big idea is to fill the page or not".
→ One switch `fill` (default ON). ON: unique facts first, then turnarounds (4+1 / 1+4), then exact repeats — the page is
always full. OFF: unique facts only; the page may end early, with a note. Related facts (8×10 / 80÷10, 13−6 / 13−7) are a
separate option `families` (default OFF) and never used to fill when off. Both are appended share-code tokens (absent =
default). The T3 lane adds the controls.

## Owner design list (batched per LESSONS_LEARNED "Process rules" 0 from now on)

| Date | Owner's words | State |
|---|---|---|
| 2026-10-23 | "Repeated facts- should be allowed as an option or inverse facts to fill page" … "inverse facts for multiplication or addition 4+1 1+4 … not for multiplication then division. Although this could be a separate option" … "the big idea is to fill page or not" | built in r4 (`fill`, `families`; codes `F0`, `X1`) — given before the batching rule |
| 2026-10-23 | "do as you think best" (fill-off remainder: follow PG-15 / PT-ENG-7, closed rectangle, blank trailing area, no staircase) | in the r6 fixer |

Critic r4: 14 / 16 pages pass. Critic r5: the 3 changed pages pass (all ≥ 8). 

## M1 result

Done: `interleave()` + self-test (13 pass, 1 pending for M4), `sheet/mixed-page.check.cjs` (repeats, size ladder, digits, fill,
tabs, PG-15), the `arrangement` field (`W` token), `fill` (`F0`) and `families` (`X1`), Mixed practice for one size class
(kit `fact` cells), the Q-M1 edits (PAGE_TYPES 5.2, DN-34, DN-31, `anchors.js`). Gates green; grouped / lesson / single-skill
output byte-identical (19 / 19); print-lint kit 458 / 33 with identical per-document counts.

Open, for other lanes or the owner:
- `subtraction:sub_facts` still draws with the legacy template, so it cannot join a mixed page (refused with a note).
- TY-32 in `fact.js`: 3-digit facts add a track, so fill is 78–80 % at S / M (noted on the page); TY-32 would not fix
  3-digit dividends (132 ÷ 12).
- CL-4: the fact cell's problem ends at 61–63 % of the cell height (owner ruling).
- CL-32: tab width varies with the label's digits within a section (pre-existing, every page).
- `per-page` arrangement is stored and encoded but not acted on; the teacher controls for arrangement / fill / families are T3's.
