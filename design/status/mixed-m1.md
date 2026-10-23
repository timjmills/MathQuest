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
- CL-4 — owner ruling 2026-10-23 (via the lead): fact problems stay at the TOP of their box with writing room below, never vertically centred. That is how they print today (the problem ends at 61–63 % of the height because the writing room is below it); no fix may move them (the anchors fix checks it).
- CL-32: tab width varies with the label's digits within a section (pre-existing, every page).
- `per-page` arrangement is stored and encoded but not acted on; the teacher controls for arrangement / fill / families are T3's.

## Engine defects from the pilot (lead, 2026-10-23) — fix after M1 passes, before M4; each with a backtest that fails today and passes after

| # | Defect | Where | State |
|---|---|---|---|
| E1 | TY-11: step numbers print at 7.0 pt (minimum 8 pt); also on `addition:add_10k_regroup` | `sheet/anchors.js` `lineHtml` | queued |
| E2 | The anchor cell reserves no height for its step text, so longer worked steps overflow instead of growing the cell (content never overflows or shrinks); needs a machine check | `sheet/anchors.js` | queued |
| E3 | L-DENSITY H13: columns forced to 2 with side anchors pin a narrow stack to one side of a 92 mm cell; also `addition:add_1k_regroup`, `subtraction:sub_1k_regroup` | anchors side layout | E1–E3 fixed with `sheet/anchors.check.cjs` (5443377, 52886b2); fixing the add_10k side page that went 2 → 3 pages |
| E4 | D8 (pilot su-c): Mixed-practice band heading picks the host skill, not the preset — proposed `.find((s) => first && first.q && s.skillId === (first.q.presetId \|\| first.q.skillId))` | `sheet/roles/mixed-practice.js:225` | queued after E1–E3 |
| E5 | fact-rows ILLEGIBLE / PG-12: 5–6-digit non-division facts overflow; drop columns in `factRowsLayout` (also sub_100k_regroup, sub_1m_regroup) | `sheet/roles/fact-rows.js` | queued after E1–E3 |

## Per-round findings (critic rounds r1–r6)

Written in full in `design/status/speed-audit.md` ("Per-round findings" → "Mixed practice M1").
### Mixed practice M1 — rounds r1–r6 (lane `mixed-m1`, 2026-10-23)

Result: PASS at r6 (16 pages, all ≥ 8). Target was ≤ 2 rounds; it took 6 (r1–r3 FAIL, r4 14/16, r5 and r6 PASS on the changed pages).

**Automatic checks** (finding → proposed check; did an existing check exist that should have caught it?)

| Round | Finding | Proposed check (backtest) | Existing check? |
|---|---|---|---|
| r1 | Size S printed the L page (20 problems, the same as L, fewer than M) — LESSONS L1 | Problems S > M > L per look, on every multi-size render — **built**: `sheet/mixed-page.check.cjs` (size ladder) | No. L1 is known but has no general machine check; `ws-print-lint` does not compare sizes. Should become a print-lint rule for every role |
| r1 | Two templates (legacy `sub_facts` and kit `fact`) in one band; rule 3.7 mm lower, ones off by 2.4 mm | One template per mixed band; rule y and right digit edge equal within 0.3 mm across a shelf — **built** (mixed-page check; `mixedClass` refuses legacy) | No |
| r1 | Repeated answers and turnarounds in one skill's share (L10) | `pageRepeats(items)` (exact / turnaround / related) — **built** (pure, in `sheet/interleave.js`, used by the mixed-page check) | No; L10 has no machine check outside this lane — should be a print-lint rule for every page |
| r2 | Doubled quiet letters `aa.`…`pp.` past 26 items (CL-13) | Label regex `/^([a-z])\1+\.$/` fails — **built** (mixed-page check). Belongs in `ws-print-lint` for every role | No |
| r2 | Related facts give each other away (13−6 / 13−7; 8×10 / 80÷10) | Family keys in `pageRepeats` — **built** | No |
| r3 | Exact repeats on the 2-skill S page: the deal's last pass dropped every uniqueness rule silently | `pageRepeats` on every mixed render + per-rung counts (`dealtAs`) — **built** | No — the r2 fix was checked on 20 seeds of the *critic set* only, not on a small-supply page; the check scenarios now include a small pool |
| r3 | I Can M printed the S page (k chosen with no digit floor) | Digit pt ≥ the size's working digits (TY-30 floor) — **built** | No |
| r3 | I Can L 3 across, fill 0.46 (TY-31) | Fill within 55–75 % or a note — **built** | No |
| r3 | Track count from the probe, not the dealt items | Tracks = widest number on the page — **built** | No |
| r3 | Tabs 4 mm / 8 pt at 20 pt digits (CL-31) | Tab size from the ladder digit size — **built** | No |
| r4 | Fill-on repeats clustered (one fact 4 times, twins on one shelf) | Per-skill fact-pair counts differ by ≤ 1; no identical fact twice on a shelf — **built** | No |
| r4 | Empty bordered cell on a short page (PG-15) | Every bordered cell holds a problem; trailing area unruled, inside a rectangular frame — **built**. L-CELL (PG-15) exists in `ws-print-lint` but did not flag it: **it should have** — check why L-CELL missed a bordered empty `ws-cell` | Yes (L-CELL / PG-15), missed it |
| r4 | Daily M 5 across vs I Can M 6 across (least-overfill rule) | Same k across looks when the lattice allows; rule gap ≥ 6 mm — **built** (gap) | No |
| r5 | Note wording / fill figure disagreed between meta, table and drawing | Note figures equal the drawn measurement within 0.5 % — **built** (`drawnFill`) | No |
| r5 | A page moved by a rule change (weighted 1:3 M) after it had passed | Re-render every page whose plan hash changed since the last critic; the critic sees only fresh renders — **process**: hash plans per page, list "changed since last grade" | No |
| r6 | CL-32: tab width varies with the label's digits within a section (pre-existing, every page) | Equal tab widths per section — proposed for `ws-print-lint` (checks owner) | No |

**Speed-ups** (what cost time → smallest change)

| Round | Cost | Smallest change |
|---|---|---|
| r1 | Critic could not run `ws-grade-render` (auto-mode denied it: the script deletes temp PDFs; no `--help`, so `--help` ran a real render) | Give `ws-grade-render` a `--help` that exits, and keep temp files in the scratchpad; critics grade builder renders by default (done from r2) |
| r1–r3 | Three rounds on the same defect classes (repeats, size ladder) because each fix was verified on the critic set only | Brief every first build with the scenario matrix up front (small supply, both looks, all sizes); the lane now has `mixed-page.check.cjs` — it should exist *before* the first critic, written from §3.4 |
| r1 | The critic set was not available (only the four operations share a size class; one was legacy) — found by the builder measuring ~180 skills | The plan's critic case assumed four families share a class; record per-template size classes in the catalogue so a lane can pick a critic set in one lookup |
| r3→r4 | The §1.7 stop came one round late (repeats survived r1→r3) | Count defect *classes* per round in the status file as they come in; stop at the second survival automatically |
| r4 | `mixed-page.check.cjs` takes ≈ 1 h serially | Run it in 3 parallel parts (done); give it `--quick` (5 seeds, one look) for fix rounds and the full run before the critic |
| r4–r5 | Owner rulings arrived mid-round (fill, families, PG-15) and were applied mid-round | Process rule 0 (batch design decisions) — now in force |
| r5 | One page changed after its pass and was not re-rendered, costing a follow-up spot-check | Plan-hash diff before each critic (above) |
| r6 | Fixer edited note wording after its last full check; the lead re-ran the fill scenarios (≈ 50 min) | A fixer's last commit must be followed by the quick check; the report states the commit the check ran on |
