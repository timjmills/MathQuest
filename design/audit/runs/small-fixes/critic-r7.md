# Small fixes lane: independent critic, round 7

Branch `claude/sweet-newton-c8wrv1-wip-small-fixes` at `c8299e9d`. The round-7 fix under review is `c8299e9d`. Between the r6 tree
(`7f0116b4`) and `c8299e9d` only these 3 files change:
- `count-row.js` adds `tightGeom` for the Opener's Guided and Independent rows, which are print-only (`tightRows`, not `wrapToCell`,
  not the screen twin). In those rows:
  - every answer slot is at least `chars × 0.55 × Hw` wide (up to 4 mm more);
  - the givens print at ≥ 11 pt and keep S ≤ M ≤ L;
  - a row wraps to more lines instead of shrinking under TY-10a;
  - rows of 3+ lines keep 2 mm between lines (1.5 mm with Lines).
- `opener.js` counts the Say band at its drawn height and reserves the M "Independent Practice:" wrap.
- `small-fixes-model-pages` gets N15 checks (slot, givens, S ≤ M ≤ L) and the N16 fix.

I ran one browser at a time; another session was running gates in `/home/user/mq-numberline` at the same time. My scripts and logs
are in the critic scratchpad (`scripts/sweep7.cjs`, `scripts/screenparity.cjs`, `r7/`). The scratch trees were:
- `main72`, the archive of `72e05d7`, the gate's base;
- `r6tree`, the archive of `7f0116b4`, with the new gate copied in.

The evidence is in `r7/`.

## Gates and probes

- **`small-fixes-model-pages`** (`MQ_BASE_ROOT` = `main72`): **OK**, 180 sheets. That covers:
  - the N15 lines: given numbers 11 / 14.1 / 17.9 pt at S / M / L on every boxes and Lines option set, and 16 pt on the one-page
    sets;
  - S ≤ M ≤ L on all 30 option-set and paper pairs;
  - no page count rises, and the scripted model is byte-identical to the base.

  Log: `r7/gate-model-pages-head.log`.
- **Is the gate real?** The same gate run on the r6 tree (`7f0116b4`) **FAILS**: 56 failing lines. Examples:
  - "answer slot 15.5 mm < 6 characters × 0.55 × 6 mm = 19.8 mm (15.5 mm for "16,000")";
  - "given numbers at 10.2 pt (< 11 pt)";
  - and the 100,000 / 25,000 sheets.

  Log: `r7/gate-model-pages-on-7f0116b4.log`. It passes on HEAD, so the check is real.
- **N16:** when `rowMm` is missing, the gate now pushes "no rowMm in the plan fits" as an error. It no longer falls back to the
  drawn height silently. Fixed.
- **The gate does not check the key's clear space.** It measures each slot's width against the answer's length, not whether the
  typeset answer sits inside its box. I measured that myself in every key, on 360 sheets (4 seeds):
  - The smallest clear space either side of a typeset answer is **1.34 mm**, on the 9 mm one-page boxes holding 2 digits.
  - It is **6.8 to 11.5 mm** on the 100,000 rows.
  - 0 answers are wider than their box.

  `r7/key-opener-100000-L-a4.png`: "1,300,000" sits in a 51 mm box with 11 mm clear each side (r6: edge to edge in 15.8 mm).
- **Print sweep** (`scripts/sweep7.cjs`):
  - Coverage: 15 option sets × S/M/L × A4/Letter, seed 4242, with PNGs, on HEAD and on the r6 tree, plus seeds 1, 99 and 2026 on
    HEAD (270 sheets).
  - Results: 0 errors, every page and every key on 1 page, 0 empty cells, 0 ink outside a cell, no band ≥ 30 %, no footer
    overrun, no answer wider than its key box, and every practice given ≥ 11 pt.

  The r6 / r7 comparison is in `r7/sweep-r6-vs-r7-seed4242.txt`. I looked at the PNGs myself.
- **The screen hosts are untouched.** `tightRows` is set only by `print-sheet.js` for roles with `TIGHT_ROWS` (the Opener), and
  `tightPractice` excludes the screen twin. I checked this with `scripts/screenparity.cjs`:
  - It mounted the practice card, the online worksheet and the quiz at 1366x650 and 1280x600, with 6 option sets: default, by 7,
    by 25 Lines, 25,000, 100,000 and 100,000 Lines.
  - I hashed each host's cell HTML on HEAD and on the r6 tree: **36 of 36 identical**.
  - There is no horizontal scroll, and the inputs are ≥ 44 px tall.
- **`small-fixes-countrow-caret`:** OK, 304/304. r6's one unreproduced skip (O5) did not recur.
- `ws-boot-smoke`: **OK**.
- `ws-code-snapshot`: **OK** (608 codes, 35 categories, +36 appended, nothing moved or deleted).
- `ws-content-audit --category multiplication`: **OK** (27 skills, 0 failing).
- **`ws-print-lint --source kit --roles opener`:**
  - `count_by_tables#opener` has **0 findings**, at the default size L and again at S
    (`--skills multiplication:count_by_tables`).
  - The full opener run FAILs with 510 findings in 86 documents. That output is **byte-identical on the r6 tree**: other skills,
    not this lane.
- Non-browser units, all **OK**:

  | Gate | Result |
  |---|---|
  | `ws-anchors-unit` | 322 |
  | `ws-ink-unit` | 185 |
  | `ws-layout-unit` | 535 |
  | `ws-panes-unit` | 202,727 |
  | `ws-providers-unit` | 105,162 |
  | `ws-supports-unit` | 257 |
  | `ws-content-audit --self-test` | 121 |

  `node --input-type=module --check` passes on `count-row.js` and `opener.js`.
- The gate's screenshots: the runs rewrote none (`git status` stayed clean after every run).

## N15 status: FIXED

I measured the pupil pages and the keys, seed 4242. The answer box is the narrowest practice box. "Needed" is
`chars × 0.55 × Hw`, so mm per character = box ÷ characters:

| Row | Size | r6 box (mm) | r7 box (mm) | Needed (mm) | r6 givens (pt) | r7 givens (pt) |
|---|---|---|---|---|---|---|
| 100,000 (9 characters) | S / M / L | 17.8 / 16.8 / 15.8 | **30.9 / 41.7 / 51.0** | 29.7 / 39.6 / 49.5 | 9.0 | **11 / 14.1 / 17.9** |
| 100,000 + Lines | S / M / L | 19.1 / 18.1 / 17.1 | **32.0 / 42.7 / 50.5** | 29.7 / 39.6 / 49.5 | 9.0–9.4 | **11 / 14.1 / 17.9** |
| 25,000 (7 characters) | S / M / L | 16.6 / 17.4 / 16.5 | **23.4 / 32.2 / 41.0** | 23.1 / 30.8 / 38.5 | 10.2–11.1 | **11 / 14.1 / 17.9** |
| 1,000 from 14,000 (6 characters) | S / M / L | 15.5 / 17.9 / 17.2 | **21.1 / 30.7 / 35.5** | 19.8 / 26.4 / 33.0 | 10.2–13.4 | **11 / 14.1 / 17.9** |
| one page, 25,000 (prints at S) | – | 17.7 | **28.5** | 23.1 | 11.4 | **16** |

- The givens grow with the size and are never smaller than the Model's.
- At L the digits are again the largest thing in the practice band.
- The rows wrap (3 + 3 + 3 + 3 at L for 100,000; 4 + 4 + 4 for 14,000 at M) instead of shrinking.

See `r7/print-opener-100000-M-a4-N15-FIXED.png`: 2 Guided rows, 42 mm boxes and 14 pt givens (r6:
`r6/N15-100000-L-a4-model-vs-guided-boxes.png`).

The r6 "what a fix must do" items:
- **Slots from the widest answer at Hw.** Done.
- **Givens at the working size.** Done.
- **The Opener re-fits rows.** Done.
- **A gate check that fails on the old tree.** Done, and real.

## The builder's trade-offs, judged

**1. Fewer rows on wide sheets.** The rows each sheet now gets, compared with r6:

| Sheet | Rows r6 → r7 (guided + independent) | Blank foot (mm) |
|---|---|---|
| 100,000, S A4 | 2+2 → 1+2 | 8 |
| 100,000, S Letter | 1+2 → 1+1 | 22 |
| 100,000, M A4 | 1+2 → **2+0** | 8 |
| 100,000, M Letter | 1+1 → **1+0** | 41 |
| 100,000, L A4 | 2+0 → 1+0 | 14 |
| 100,000, L Letter | 1+0 → 1+0 | 1 |
| 100,000 + Lines, M Letter | 1+1 → **1+0** | 50 |
| 25,000, S A4 | 2+2 → 1+2 | 15 |
| 25,000, M | 1+2 → 1+1 | 33 A4, 16 Letter |
| 25,000, L A4 | 1+1 → **1+0** | **52** |
| 25,000, L Letter | 1+1 → **1+0** | 34 |
| 14,000, M | 1+2 → 1+1 | 33 A4, 16 Letter |
| 14,000, L A4 | 1+1 → 2+0 | 1 |
| 14,000, L Letter | 1+1 → **1+0** | 38 |
| 14,000 / 25,000 + one page, A4 | 2+2 → 1+2 | 8 |
| 14,000 / 25,000 + one page, Letter | 1+2 → 1+1 | 28–33 |

- **Is a row missing that PT-ENG-3 would allow?** No. I checked each long-foot sheet with the plan's own `rowMm` and `growMm` (free
  = room + grow − 4):

  | Sheet | Free (mm) | One more row (mm) |
  |---|---|---|
  | 25,000 L A4 | 53.4 | 64.9 |
  | 100,000 + Lines M Letter | 43.4 | 48.7 |
  | 100,000 M Letter | 41.9 | 56.2 |
  | 14,000 L Letter | 39 | 61.1 |
  | 14,000 M A4 | 36.7 | 43.7 |
  | 25,000 + one page Letter | 37.9 | 46.3 |

  In every case the next row does not fit. The gate's missing-row checks agree.
- **Would another layout give more practice without shrinking?** Not under the current rules:
  - At L a 7-character answer needs 38.5 mm. Four slots a line need 4 × 38.8 + 3 × 4.2 + the 7.5 mm tab lane + the 7.5 mm turn
    lane = 183 mm, which is more than the 176.5 mm line. So 3 a line, and 12 numbers is 4 lines.
  - The only ways to more practice are a shorter Independent row (6 numbers, 2 lines of 3) or a third page band. Both change the
    owner's "every count-by row is 12 numbers" (TY-10a) or PT-OPN-7.
- **Is a page with 1 Guided row and no Independent row acceptable for PT-OPN?** Yes, by the letter: PT-OPN-7 adds Independent rows
  "only while whole rows fit … if none fit, Score is omitted", and PT-OPN-6's second Guided row does not fit.
  - The pupil gets 8 writable blanks, where r6 gave 16 blanks that could not be written in at 2.4 mm a character.
  - Against the rubric it is the weakest page in the lane. On 25,000 L A4 the bottom 52 mm (about 21 % of the body) is blank, and
    there is no scored independent check.
  - I score its C3 at 8 on the same basis as r4–r6's spec-required feet (77–95 mm under full 2 + 2 Lines sheets): the page holds
    every whole row the rules allow, at a size a pupil can write in. A fuller page needs an owner ruling: owner question Q1.

**2. The long blank feet.** They are as above and spec-forced. No foot is a page < 50 % used (H5), and no band in a cell is ≥ 30 %
(H13). The worst are:

| Sheet | Foot (mm) | Rows |
|---|---|---|
| 25,000 L A4 | 52 | 1 + 0 |
| 100,000 + Lines M Letter | 50 | 1 + 0 |
| 100,000 M Letter | 41 | 1 + 0 |
| 14,000 L Letter | 38 | 1 + 0 |

All four are owner question Q1.

**3. The short 2.2 mm jump arrows.** These are the one-page arrow, `COMPACT_ARROW_MM`, owner-set on 2026-10-03. Where they show:
- On 100,000 at L and on the one-page 25,000 / 14,000 rows, the in-row arrows are 2.2 mm.
- The given numbers there are narrower than their slots, so each small arrow sits in about 10 mm of white.
- The row's entry arrows on the left are about 4 mm, so one row shows two arrow sizes.
- The arrows are still clearly arrows and still mark every jump. That makes this a nit (N17), not a C1 or C2 cost
  (`r7/key-opener-100000-L-a4.png`, `r7/print-opener-25000-onepage-letter-short-arrows.png`).

**4. The half-width Model now prints smaller than the practice rows on wide counts.** This is unchanged from r6:
- The Model givens are 10.85 pt for 25,000 at M and L, 12.65 pt for 14,000 at M and L, and 15 pt for 100,000 at L.
- The practice rows are now 14.1 / 17.9 pt.
- The Model is still under TY-10a (floor 9 pt) and is worked with the teacher. Its numbers are 0.6 pt under the 11 pt of TY-11 at
  M and L for 25,000.
- The inversion reads oddly at L (`r7/print-opener-25000-L-a4-1plus0-foot52.png`). It does not stop the lesson.
- PT-OPN-4's full-width worked row would fix it, but it would cost the Guided row on these sheets. Owner question Q3; not scored
  down.

**5. Departure from TY-10a on the Opener practice rows.** TY-10a is an owner exception that *allows* a shrink to 9 pt. It does not
require one. The lane's rows now keep the working size and wrap, which is what TY-11 and H9 ask for, and which r6 required.
- The "two lines of six" wording of TY-10a no longer describes the Opener's wide practice rows (3 + 3 + 3 + 3; 4 + 4 + 4). The
  standard should say so.
- The slot rule `chars × 0.55 × Hw` sits about 8–13 % under SL-1's general blank width B(n) (`n × 0.75 × Hw + 2`, counting
  digits). For example, "1,300,000" at L gets 51 mm against B(7) ≈ 55.5 mm. That is acceptable: commas take little room and
  the key shows 11 mm clear.
- The amendment is owner question Q2.

## r7 compared with r6, the other sheets (seed 4242; seeds 1 / 99 / 2026 the same)

- **Default, by 25, times under each, one page, Lines, Lines + one page, by 25 + Lines + one page, times under each + Lines:** the
  rows are the same as r6 on every sheet. The changes:
  - The Lines slots widen from 7 / 8 to 9.0 / 9.7 mm (2 characters at S and M now meet 0.55 × Hw).
  - The S givens rise from 10.2 to 11 pt.
  - The feet are within ±2.3 mm of r6.
  - The one exception is times under each at L. A4 changes 2 + 0 → 1 + 1 (a scored row, the PT-OPN-7 tie rule accepted in r6), and
    Letter changes 1 + 0 → **2 + 0** (the foot falls 41.6 → 1.4 mm). Both are better.
- **The by 25 + one page rows:**
  - They now wrap to 2 lines at 16 pt, with 15.9 mm boxes (r6: 1 line at 14.4 pt, 10.3 mm boxes).
  - The foot falls from 57 / 40 mm to 8 mm on A4 and Letter.
  - This is better.
- **N12 / N13 are not reopened:**
  - No sheet has fewer than 2 Independent rows where the budget holds one more.
  - No single-column Guided band has one row where a second fits (the gate's checks, and my PT-ENG-3 arithmetic above).
- **N14:** no letter overlaps a step tab on any of 360 sheets. The smallest gap fell, though:

  | Sheets | Letter to tab, r6 → r7 |
  |---|---|
  | times under each, L A4 (1 + 1 now) | **0.54 mm** |
  | default and step 25, M Letter | 4.9 → 0.83 mm |
  | Lines and times under each + Lines, M | 3.1 → 0.85 mm |

  It is clear but tight (`r7/N18-letter-vs-tab-times-each-L-a4.png`): nit N18.

## Score table (C1 ease · C2 teaching · C3 spacing · C4 fidelity)

| # | Fix | Host / version | C1 | C2 | C3 | C4 | Verdict |
|---|---|---|---|---|---|---|---|
| 1 | Count-row caret: move-on keys, row-wide digit count, overflow, green hand-on | Quiz 1366/1280, mouse and touch | 8 | 8 | 8 | 8 | pass (HTML identical to r6) |
| 1 | | Practice card 1366/1280, mouse and touch | 8 | 8 | 8 | 8 | pass |
| 1 | | Online worksheet 1366/1280, mouse and touch | 8 | 8 | 8 | 8 | pass (caret 304/304; O5 did not recur) |
| 1 | | Phone 390 (gate, basic) | 8 | 8 | 8 | 8 | ok |
| 2 | Word hint in flow, "Listen" text button | Card 1366/1280 | 8 | 8 | 8 | 8 | pass (untouched) |
| 3 | Unknown-id "Simplify a/b" num/den boxes | Card / worksheet / quiz | 8 | 8 | 8 | 8 | pass (untouched) |
| 4 | Quiz word rows: restore, partial by row, live dots | Quiz 1366/1280 | 8 | 8 | 8 | 8 | pass (untouched) |
| 5 | +XP burst | Card / boss / race | 8 | 8 | 8 | 8 | pass (untouched) |
| 6 | No start toast | Card / boss / race / worksheet | 9 | 8 | 9 | 8 | pass (untouched) |
| 7 | Scripted model | 15 gate variants × S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (byte-identical to the base) |
| 7 | Opener, rows with boxes: default, by 25, times under each | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (N18 nit) |
| 7 | Opener, 1,000 from 14,000 (boxes, Lines, one page) | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (r6's 2.9 mm-a-character nit is gone: 3.5–5.9 mm; the 38 mm L Letter foot is Q1) |
| 7 | Opener, 100,000 from 1,000,000, boxes and Lines | S/M/L × A4/Letter | **8** | 8 | **8** | 8 | **pass (N15 fixed; 41 / 50 mm M Letter feet are Q1; N17 nit)** |
| 7 | Opener, by 25,000 (boxes, Lines, one page) | S/M/L × A4/Letter | **8** | 8 | 8 | 8 | **pass (N15 fixed; the 52 mm L A4 foot is Q1; Model smaller than practice is Q3)** |
| 7 | Opener + one page (boxes) | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass |
| 7 | Opener, Lines | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (2 + 2 at S and M, so the foot is spec-required) |
| 7 | Opener, Lines + one page (default step) | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass (the 77–95 mm foot is spec-required with 2 + 2 rows, r6 O8) |
| 7 | Opener, by 25 + Lines + one page | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass |
| 7 | Opener, times under each + Lines | S/M/L × A4/Letter | 8 | 8 | 8 | 8 | pass |

Why the wide rows score 8:
- **C1 8:** every box holds its answer handwritten at the size's writing height (≥ 0.55 Hw a character; the key shows 7–11 mm
  clear), and the givens are 11 / 14 / 18 pt.
- **C3 8:** the page holds every whole row PT-ENG-3 allows, with no band ≥ 30 % and no overrun.
- **The nits:** the short arrows (N17) and the thin letter gap (N18).

What would raise them to 10:
- Q1: a scored Independent row on every Opener, with no 40–50 mm feet.
- Q3: a Model no smaller than its practice rows.
- One arrow size per row.

## New defects

**N17 · Low (nit, does not fail) · Fix 7, Opener practice rows on 100,000 at L and on the one-page 25,000 / 14,000 rows: the in-row
jump arrows are 2.2 mm while the row's entry arrows are about 4 mm.** Each small arrow floats in about 10 mm of white between given
numbers.

Repro: `buildSheet({role:'opener', sections:[{skills:[{categoryId:'multiplication', skillId:'count_by_tables',
opts:{rows:[{step:100000, start:'custom', at:1000000}]}}]}], size:'L', paper:'A4', seed:4242})`, or `{rows:[{step:25000}],
onePage:true}` on Letter.

Evidence: `r7/key-opener-100000-L-a4.png` and `r7/print-opener-25000-onepage-letter-short-arrows.png`.

*What a fix must do:*
- Where the gap between two numbers on a `tightGeom` row is wider than the arrow needs, draw the standard arrow, the same length
  as the row's entry arrow.
- Keep `COMPACT_ARROW_MM` only where the gap is genuinely 4.2 mm between two boxes.
- Nothing else may change: no row, slot or page count.

**N18 · Low (nit, does not fail) · Fix 7: the gap from the quiet letter to the step tab fell to 0.54 mm (times under each, L A4) and
0.83–0.85 mm (default / step 25 at M Letter, Lines and times under each + Lines at M).** The r6 minimum was 1.12 mm. There is no
overlap, so N14 is not reopened, but at L the "a." period nearly touches the tab's top corner.

Evidence: `r7/N18-letter-vs-tab-times-each-L-a4.png`.

*What a fix must do:* keep ≥ 1 mm between the letter and the tab on every Opener sheet (for example the r6 1.5 mm inset, or a
letter line above the tab). Add the minimum to `small-fixes-model-pages`, since the sweep measures it (`.ws-letter` against
`.k2-steptab`).

## Owner questions

**Q1 · Wide counts on the Opener: may an Independent row be shorter than 12 numbers when a full row does not fit?**

On 25,000 L A4, 100,000 M Letter, 100,000 + Lines M Letter, 14,000 L Letter and 25,000 L Letter, the page prints the Model and one
Guided row (8 blanks), no Independent row and no Score. It then ends in a 34–52 mm blank foot, because a 12-number row of 6- to
9-character numbers at writing size is 49–65 mm tall (4 lines of 3 at L).

*Recommended answer: yes.* When no full Independent row fits, the Opener adds one Independent row of **6 numbers** (2 lines of 3:
the start and 5 more, 2–3 blanks), lettered and scored, so every Opener ends in a scored independent check. Do not shrink the digits
to fit 12 (that is N15 again), and do not add a second page.

**Q2 · Amend TY-10a for the Opener's practice rows.**

TY-10a says every count-by row is "exactly two lines of six" and shrinks to a 9 pt floor. The Opener's Guided and Independent rows
now never shrink: they wrap (3 + 3 + 3 + 3, 4 + 4 + 4), with each slot at least `characters × 0.55 × Hw`. That is slightly under
SL-1's B(n), but the key shows ≥ 6.8 mm clear on every wide row.

*Recommended answer: yes.* Ratify it in `WORKSHEET_DESIGN_STANDARD.md` (TY-10a): "On the Opener's practice rows, a count-by row
keeps the size's digit size and writing width and wraps to more lines; the shrink applies only to the Model zone, the other roles
and the screen." Keep 0.55 × Hw a character, rather than B(n), as the count-row slot rule.

**Q3 · Should the Model of a wide count stay half-width when it prints smaller than the practice rows?**

On 25,000 the half-width Model prints its numbers at 10.85 pt at M and L, while the rows under it print at 14.1 / 17.9 pt.

*Recommended answer: keep the half-width Model.* It is teacher-led, TY-10a covers it, and PT-OPN-4's full-width worked row costs
the only Guided row on these sheets. If the owner wants the Model never smaller than the practice rows, the fix is PT-OPN-4's
full-width Model for counts whose numbers would print under the practice size, and it needs Q1 so the page still has an
Independent row.

## Out of lane / observations

- **O1, O3 and O4:** unchanged from r4–r6.
- **O5:** not seen (304/304).
- **O6:** not re-checked; the screen HTML is identical to r6.
- **O8:** unchanged; the 2 + 2 feet are spec-required.
- **O9 · screen hosts, wide counts (pre-existing, byte-identical to r6, not this commit).** On the online worksheet at 1366x650 a
  100,000 row:
  - prints its givens at about 11 px and its boxes 52 px wide, for 9-character answers;
  - shows the "Swipe for more boxes" cue at desktop width.

  The card and the quiz give 77–79 px boxes and about 16 px givens (`r7/screen-1366-worksheet-100000-O9.png`). This is the screen
  half of N15: TY-10a's shrink on screen. It was never in a scored row of this lane. I queued it as a separate task ("Size wide
  count-by rows for typing on screen").
- **The opener-wide `ws-print-lint` FAIL** (510 findings in 86 documents, other skills) is identical on the r6 tree. It is not this
  lane.

## Verdict

**PASS.** Every row of the score table is ≥ 8, and no cap applies.

**What passes:**
- **N15 is fixed:** wide Opener practice rows give 0.55 Hw or more a character (100,000: 31 / 42 / 51 mm at S / M / L), the givens
  print at 11 / 14 / 18 pt, and the keys show 7–11 mm clear.
- **The gate is real:** it fails 56 lines on `7f0116b4` and passes 180 sheets on `c8299e9d`.
- **N16 is fixed.**
- **N12, N13 and N14 are not reopened**, and no row PT-ENG-3 allows is missing.
- **The screen hosts are byte-identical to r6.**
- **Every gate is green.**

**What remains:** two nits (N17, N18) and three owner questions (Q1–Q3). Q1 decides whether wide-count Openers can carry an
Independent row instead of a 34–52 mm blank foot.
