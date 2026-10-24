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

### Anchor engine fixes (pilot E1–E3) — critic round 1, 2026-10-23: FAIL

Side pages of add_10k / add_1k 8 on every criterion (E1, E2, E3 fixed there); 6 of 16 pages ≤ 7, all defects pre-existing
on anchor-mode pages. Rebuild at Opus medium (failed round).

**Automatic checks**

| Finding | Proposed check (backtest) | Existing check? |
|---|---|---|
| Sections-anchor problems centred down the cell (CL-4) | E5 top start and E3 bands in sections mode too | E5 existed but ran on side only — scoping gap |
| A skill with no workedSteps changes the page in anchor mode (sub_1k: forced 2 columns, 4 columns for 6 items) | plan(anchors, no examples) == plan(off) | No — `anchors.check` skipped these pages (`if (!r.n) continue`) |
| mult_chart_easy side pair overflows the page by 80–90 mm | Any overflow > 0.5 mm FAILS; no `KNOWN_E2_SIDE` allow-list | E2 existed but its allow-list downgraded it to WARN — allow-lists must not hold overflows |
| The key's bold leaks onto the anchor (not a facsimile) | Computed weight / colour of `.mq-anchor` glyphs equal on pupil and key | No (L-ANCHOR checks markup, not computed style) |
| Step lines wrap before "=" | No rendered step line starts with "=" (Range line boxes) | No |
| Empty grid area in a section with fewer items than columns × rows | Grid-hole check | No |
| Kit-wide: stack cells centre content vertically on every page type (CL-4, owner ruling) | A kit-wide top-start rule in `ws-print-lint` | No — raised with the lead (not this lane's to change) |

**Speed-ups**

| Cost | Smallest change |
|---|---|
| Only M rendered; S and L could not be graded (rubric grades S and L in full) | Render S, M and L in the same run, every time (now in the r2 brief) |
| Scope proof by eye | Hand the critic a before/after pixel-diff box per page and the per-cell band numbers (`bands.py`) |
| No anchors-off baseline to compare a no-example skill against | Render an anchors='off' baseline per skill |
| The round-1 fixer built at low on an uncertified pair (anchors side layout) | Rule 0a: first builds on an uncertified pair run at medium |

Owner rulings via the lead, 2026-10-23 22:55 (anchors; the lead asked for them in the current medium rebuild):
- the six low-fill skills on side-anchor pages (add, add_50_no_regroup, sub_50_no_regroup, shade_fraction, money_count,
  place_value_10x) get a four-column [twin | problem | twin | problem] side layout;
- a twin matches the pupil's problem exactly (no place headings or boxed answer row the pupil's stack lacks);
- model step text ≈ 9.2 pt at M is accepted for read-only model text; TY-11's 11 pt applies to text the pupil acts on;
- S5 grey vs black: the standard wins (grey if S5 says so; else black and logged).
- Kit-wide top alignment (CL-4) still pending: the owner wants an example first; anchor pages only meanwhile.

Owner ruling CL-4b (lead, 2026-10-23 23:07; WORKSHEET_DESIGN_STANDARD.md, 12ed112f): top of the box by default on every page
type; centred down the cell where the pupil writes ABOVE the problem (long division, regrouping), decided per cell from
content. Anchor pages follow it in the current rebuild (it supersedes the earlier "always top" note). Queued after the
anchor rebuild passes: the kit-wide change (additive CSS in the cell / stack drawing), pins re-taken for every changed page
with the sibling comparison, and an independent critic on a sample at S and L (long division, a regroup stack, a
no-regroup stack, facts, a visual cell). W0-A builds the print-lint check.

Owner instruction via the lead, 2026-10-23 23:08: "stop after this work, don't try anything new". Finish only what is in
flight: the anchor rebuild (with the 22:55 rulings), its critic, and the D8 / fact-rows patches; then report and stop.
**The kit-wide CL-4b change is CANCELLED** until a later go. If the anchor critic fails: report and stop, no further round.

Lead, 2026-10-23 23:40: owner ruling CL-11a (9e614e21): item labels are only the black number tab; letters are gone (this
supersedes M1's "numbered tabs past 26 on I Can" switch — merge in favour of CL-11a). CL-4b (including facts) is now done
kit-wide by a builder on the lead's branch and is OUT of this lane entirely: the anchor rebuild drops its top-alignment
work. HD-5a (6e94116f, strand-tab box removed), 9e614e21 and the CL-4b commit are merged here before the anchor critic.

Logged for the next round (lead, 2026-10-24 00:57, information only — not widened into the current round): the pilot stopped
on side-anchor pages at L. Side mode lays the twin and the pupil problem out 50 / 50 (`anchors.js` ~260: footprint wMm 88 /
maxCols 2; `print-sheet.js` ~2150–2153: colsList [1, 2]), so a narrow stack leaves an empty band ≥ 30 % and a 5–6-digit twin
pushes the pupil problem to full width; reproduces on sub_100_regroup and add_50_no_regroup. Proposed: size the pair's
columns from content (pupil column = widest stack + 2 × 3 mm + label box; twin takes the rest). Whether the current rebuild
(content-sized `auto auto` columns, the four-column layout) already fixes it: to be recorded when it reports.
