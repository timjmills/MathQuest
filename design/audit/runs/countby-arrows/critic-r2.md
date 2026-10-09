# Critic round 2: count-by short arrows + Lines

- Lane `a91a01fc3e4acb8e8`, head `24b521e`.
- Graded 2026-10-09 by an independent critic. I only read and tested; I changed no code.
- Skill: `multiplication:count_by_tables`. Rubric: `design/audit/RUBRIC.md`. A pass needs 8 or more on C1 to C4.
- Scope: Stretch and thinking pages are out, by owner ruling (Stretch, Reason It, True or False?, Error analysis).
- I graded the screen hosts on a scratch merge of this lane with `claude/sweet-newton-c8wrv1` at `f1dae55`. That merge carries
  the box-full caret move from main.

## Verdict: PASS for this lane's scope

- **D1 to D7 are all closed.**
- **Nothing the lane touches scores below 8.**
- **No new major defect.** I found 5 minor ones (N1 to N5).

### Three page types fail, but not because of this lane

The opener, the scripted model and the lesson anchor chart fail. They fail the same way on main (`f1dae55`). They block the
skill's "8 everywhere" status, so they need their own fix (P1 to P3 below). Treat them as a separate ticket, not a reason to
hold this merge.

## Gates (run one at a time through `/tmp/mq-browser-run.sh`)

| Gate | Result |
|---|---|
| syntax (`count-row.js`, `screen-cell.js`, `skill-options.js`, and every merged JS file) | OK |
| `ws-codec-registry` | OK |
| `ws-boot-smoke` | OK |
| `wave1-c2-onepage` (`MQ_BASE_ROOT` = archive of `efeb910`) | OK, details below |
| `wave1-c2-lines` | OK: S is 1 line of 12; at M and L the digits stay at 14.1 / 17.9 pt and the tabs at 14.8 / 18.8 pt, in 2 lines of 6 |
| `wave1-c2-defaults` | lane digest is **byte-identical** to main `f1dae55` |
| `wave1-c2-phone` | OK |
| `ws-options-verify --skill count_by_tables` | OK (27/27) |
| `ws-print-lint --source kit` | 463 findings in 33 documents, **at the baseline**; count_by_tables has 0 |
| `ws-screen-answer` | OK |
| merge into `claude/sweet-newton-c8wrv1` (`f1dae55`) | code merges cleanly; only 7 gate-run PNGs under `design/audit/runs/wave1-C2/` conflict (binary, regenerate) |

**`wave1-c2-onepage` in detail.** All 12 digests (A4 and Letter) are identical to `efeb910`. The invariants pass on both
papers:

- Boxes: one line per row, the 8 rows at 16 pt keep their columns aligned, and 3-digit rows are no smaller than 14.7 pt.
- Lines: every row keeps one digit size (16.0 pt).
- All 16 chosen-rows checks pass.

**Do the invariants assert the lead's rules?** Mostly. They check one page plus one key page, 12 rows, and one line per row
for Boxes. They check 16 pt for the 1–2 digit rows, a 14.7 pt floor for the 3-digit rows, and column alignment within 1 px
for the rows at the working size. For Lines they check that every row keeps one digit size. Two gaps:

- The Lines check asserts a uniform size but no floor. A sheet uniformly shrunk to 12 pt would pass.
- It does not assert the two-lines-of-6 shape.

See N5. The 3-digit Boxes rows are deliberately not held to alignment (lead decision on D5).

## D1 to D7 re-proved

| # | Was | Now | Proof |
|---|---|---|---|
| D1 | Lines: the input grew past its line, so the yellow highlight and the right/wrong tints covered the arrows | **Closed.** The input stays inside its drawn line (overhang 0 px). I measured the painted area, clipped by `overflow:hidden`, with outlines and outer shadows added. Result: **0 arrow overlaps** in 93 host/case runs (card, worksheet, quiz; 1366x650 and 1280x600, mouse and touch; 390x844 touch). That holds before typing, with the pulsing next box, and after a right and a wrong answer. Minimum clearance is 4–6 px for Lines and 2.3–2.7 px for Boxes. | `evidence-r2/screen-metrics.json`, `zoom-1366x650-worksheet-lines.png`, `screen-1366x650-quiz-lines-typed.png` |
| D2 | Lines on Chromebook: one line of 12 with "Swipe" in the quiz; the card row fell below the fold | **Closed.** Every screen host wraps Lines 6 + 6. The quiz shows no swipe and no row scroll at 1366 and 1280. The card row sits at y 539–638 in a 650 px window, the same as Boxes (539–639). | `screen-1366x650-card-lines-typed.png`, `screen-1366x650-quiz-lines-typed.png` |
| D3 | Lines at M and L shrank 3-digit rows to about 10 pt and shrank their tabs | **Closed.** At M and L every 1–3 digit row keeps the working size: 14.08 pt at M and 17.92 pt at L, with tabs at 14.8 and 18.8 pt. A row that does not fit takes 2 lines of 6. This holds on every non-thinking role, pupil page and key. One-page Lines: 1–2 digit rows are one line at 16 pt, rows 9–12 are 2 lines of 6 at 16 pt, all on 1 page + 1 key page. The one remaining smaller row is the 5-digit row (14,000 by 1,000s) at L, 13.5 pt, which is TY-10a's wide-number rule, not this defect. | `print-metrics.json` (`rowInfo`), `independent-L-lines-3dig-pupil-p1.png`, `independent-S-onepage-lines-pupil-p1.png` |
| D4 | The one-page gate failed (not re-pinned) | **Closed.** Re-pinned to `efeb910`, with invariants that assert the owner-approved rules (see Gates). | gate log |
| D5 | One-page Boxes columns did not line up | **Closed for rows 1–8** (the gate asserts their centres within 1 px). Rows 9–12 (3-digit, 14.7 pt) still print each given number at its glyph width, so their boxes do not line up with rows 1–8. Runs such as "→ 100 → 110 →" and "96 → 108" sit at the 1.0 mm arrow minimum, so the bottom third of the sheet reads denser and less even than the top. It stays legible and nothing collides. Accepted as uneven by the lead. | `independent-S-onepage-pupil-p1.png` |
| D6 | The panel's sample row was clipped | **Closed.** The sample row spans x 322–577 inside a frame of 281–603 (1366x768) and 335–686 inside 281–719 (1280x720). 0 of 27 parts are clipped, for both Boxes and Lines. | `panel-1366x768-open.png`, `panel-1366x768-lines.png`, `panel-1280x720-lines.png` |
| D7 | Docs | **Closed.** SL-3a now says 1.0 mm, the per-size rule and the screen 6 + 6 rule. `design/STATUS.md` lists the 390 Lines tint check under "Phone pass (deferred)". | `WORKSHEET_DESIGN_STANDARD.md`, `design/STATUS.md` |

## What else I checked

- **Arrows in print.** I measured 498 documents: every non-thinking role, at S, M and L, with Boxes, Lines, 3-digit rows,
  wide numbers, times labels and hexagons, plus the one-page sheets, each pupil page and key. Result: **0 collisions**,
  minimum clearance 1.0 mm, and no hop arcs.
- **Next box pulses.** On the card and the worksheet the pulse sits on the first empty box. After a right answer both the
  caret and the pulse move to box 2. A wrong answer keeps the caret, and the box turns red with the mirrored digit. This
  held on every Chromebook run, with mouse and with touch.
- **Box-full caret move (on main now).** It skips count rows by design (`[data-mq-swiperow]`). The card and the worksheet
  use their own right-answer rule.
  - The quiz has no live marks, so the caret stays put. Typing "21" then "28" gives **"2128"** in box 1 (maxlength 4).
    Tab moves on.
  - Main behaves the same, so this is not a lane regression. It is noted again under P4.
- **Basic check at 390.** No sideways page scroll. Boxes and lines are 46–53 px tall and tappable. Typing works. 0 arrow
  overlaps.
- **Teacher panel at 1366x768 and 1280x720, mouse and touch.**
  - The panel docks (`is-docked`) and covers 0 px of the preview or the paper.
  - All 11 option rows have a "?", and a tap shows the tip.
  - Choosing Lines redraws the preview (70 lines).
- **Defaults are unchanged.** The default sheets match main (`wave1-c2-defaults`), and print-lint stays at its baseline.

## New defects (all minor, none blocking)

| # | Sev | Criterion | Where | What |
|---|---|---|---|---|
| N1 | minor | C3, C1 | Print, Lines, Size M (independent, more practice, test) | **One M page mixes two looks.** At 14.1 pt the 1–2 digit rows sometimes fit 12 on one line and sometimes take 2 lines of 6 (the 9 and 12 rows). The one-line rows are tight, with **8 mm write-on lines** for 2-digit answers. The two-line rows are airy, and the page stretches their cells (bands about 30% above and below the row; under the lint's own H13 measure, which does not fire). At M, Lines fits no more rows than Boxes (6 vs 6), so the narrow lines buy nothing there (`independent-M-lines-pupil-p1.png`, `independent-M-lines-3dig-pupil-p1.png`). Owner question 1. |
| N2 | minor | gate / docs | `ws-print-lint` with `--opts '{"spaces":"line"}'` | The lint does not know the SL-3a exception. Every Lines document raises **SL-1 "answer line under 14 mm"**: 90–160 findings per document at S, about 70 at M, none at L. The baseline is unaffected because it lints defaults only. Either exempt `count-row` Lines lines from SL-1 in the lint, citing SL-3a, or get the owner to rule on a width floor (question 1). |
| N3 | minor | C1 (teacher) | Option help, "Answer spaces: Lines" | The tip still says rows "hold 12 numbers on one line where they fit". That is now true only on paper at Size S. Screen, M, L and the one-page sheet use 6 + 6. |
| N4 | minor | C3 | Card, Lines, wide numbers (14,000 by 1,000s), 1366x650 | The step tab moves above the row, making it 147 px tall. Its second line ends at y 686, below the 650 fold. Main with Boxes reaches 673. This is mostly the 420 px chrome (the Chromebook-fit lane), but Lines adds 13 px. |
| N5 | minor | gate | `wave1-c2-onepage` invariants | The Lines invariant asserts one uniform size but no floor (≥ 16 pt) and no shape (1-line or 6 + 6). Add `minPt >= 16 - 0.1` and the line count so a uniform shrink cannot pass. |

## Pre-existing on main: blocking the skill, not this lane

`ws-print-lint --source kit --roles scripted-model,lesson,opener --size M` on main `f1dae55` and on this lane:

| # | Page | Main | Lane |
|---|---|---|---|
| P1 | **Opener**, all sizes, Boxes and Lines | The Model cell's count row sticks out of its half-width cell by about 38 mm and runs over the Steps text (PG-12) | identical |
| P2 | **Lesson anchor chart** | Rows overflow their quadrants by about 37 mm (PG-12 ×10), plus 4 ILLEGIBLE black-on-black overlaps | the same overflow, and **8** ILLEGIBLE overlaps (4 more) |
| P3 | **Scripted model** | Cell 1 overflows (PG-12); the key leaves 15 model-step slots blank (AK-2 critical), 4 + 2 pages | the same findings, now 2 + 1 pages |
| P4 | **Quiz typing** | Count rows never hand the caret on, so the digits of two answers join in one box | identical |

Two smaller notes:

- The card's Check button sits at y 717 in a 650 px window, below the fold (Chromebook-fit lane).
- The online worksheet's 3-column grid makes the count row swipe at 1366 and 1280 for Boxes and Lines alike. This is the
  same on main (scroll 345 px).

Evidence: `opener-L-lines-3dig-pupil-p1.png`, `lesson-M-lines-pupil-p1.png`, and r1's `main-lesson-M-boxes-pupil-p1.png`.

## Scores

| Version | C1 | C2 | C3 | C4 | Pass |
|---|---|---|---|---|---|
| Print, Boxes: independent, more practice, test, guided, review, mixed practice (S/M/L) + keys | 9 | 9 | 8 | 8 | yes |
| Print, one-page Boxes (default and chosen rows) + key | 8 | 9 | 8 | 8 | yes (D5 rows 9–12 uneven, accepted) |
| Print, Lines, S (all non-thinking practice roles) + keys | 8 | 9 | 8 | 8 | yes |
| Print, Lines, M and L, 1–3 digit rows + keys | 8 | 9 | 8 | 8 | yes (N1) |
| Print, one-page Lines + key | 9 | 9 | 8 | 8 | yes |
| Screen, Boxes, card / worksheet / quiz, 1366x650 and 1280x600, mouse and touch | 8 | 9 | 8 | 8 | yes |
| Screen, Lines, card and quiz, Chromebook, mouse and touch | 9 | 9 | 9 | 8 | yes |
| Screen, Lines, online worksheet, Chromebook (swipe as Boxes and main) | 8 | 9 | 8 | 8 | yes |
| Screen, 390 basic check | 8 | 9 | 8 | 8 | yes |
| Teacher options panel and help, 1366x768 and 1280x720 | 9 | n/a | 9 | n/a | yes (N3) |
| Print, opener / scripted model / lesson anchor (pre-existing, main identical) | 4 | 6 | 3 | 6 | **no**: P1–P3, not this lane |

## Owner questions

1. **Lines at M: one look per page?**
   - (a) **Suggested:** at M and L every Lines row takes 2 lines of 6, with write-on lines at least 14 mm (SL-1). The page
     then has one rhythm and room to write. Lines fit no fewer rows than Boxes either way.
   - (b) Keep it as now: 12 on a line where it fits at the working size, with 8 mm lines.
2. **The lint and SL-3a.**
   - (a) **Suggested:** teach `ws-print-lint` the SL-3a exception for `count-row` Lines at S only, and apply the floor from
     question 1 at M and L.
   - (b) Leave the lint as it is.

## Evidence (`evidence-r2/`)

- **Print:** 10 pages, pupil and key.
- **Screen:** 8 shots, including zooms of the arrows with the tints.
- **Panel:** 3 shots.
- **Data:**
  - `screen-metrics.json` (93 host/case runs)
  - `print-metrics.json` (498 documents, with per-row line count, digit pt and tab pt)
  - `cell-bands.txt`
  - `lint-lines-SML.txt`
  - `quiz-caret.txt`
- **Scripts:** `critic-r2-*.cjs`. Run them with `TREE=<checkout> OUT=<dir>`; run screen and panel on a merge with main.
