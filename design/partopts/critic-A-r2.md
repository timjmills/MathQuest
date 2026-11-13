# lf-partopts step A, critic round 2 (independent, Opus medium)

Branch `claude/sweet-newton-c8wrv1-lf-partopts` @ e3898ae (fix round 40244f0..7cab5fc). I rendered everything myself.
- **UI:** Playwright drove the real Print screen (`tvOpenPrintWith([{role:'lesson', lessonId}])`, then real clicks) at 1280 and 390 px, device scale 1.
- **Packets:** `buildSheet` with `partOpts` went through the screen's own settle loop (build, `normalizePartOpts` to the returned limits, build again). Every pupil page and every key page was rendered in print media and measured with `ws-empty-band` `measureCells` / `judge`, plus the page-foot fill and overlap.
- **Scripts:** `critic-A-r2/ui.log` and `critic-A-r2/pk.log` hold the raw output. The screenshots are in `design/partopts/critic-A-r2/`.

Lessons used:
- Y4.B1.S14 `nearest_10`
- Y1.B2.S9 `add_facts`
- **`skill:addition:add_wp_10`** (a story lesson the builder did not screenshot)
- **Y4.B2.S5 `sub_10k_no_regroup`** (not screenshotted by the builder)

Each was printed at M and L in five combinations:
1. everything at its min
2. Vocabulary 0 with We Do off
3. Remember off with rows 0
4. Practice and Mixed at max with the chart at its min
5. a mid Practice total with Vocabulary at n−1

On the screen I walked every stepper from its max down to 0 and back up. I then reached the combination Vocabulary 0 → Remember off → We Do down → Practice max by real clicks, carried it to 390, swapped the skill, and pressed every New numbers.

## Gates (final lines)

| Gate | Result |
|---|---|
| `node tests/scripts/ws-partopts-unit.cjs` | PO-4, PO-2a, PO-2b, PO-2c, PO-2d PASS · PO-2e PASS, coverage We Do 7/52, Practice 52/52 (floors 13 % / 90 %) · 877 builds, 1306 s · **`ws-partopts-unit: OK`** |
| `node tests/scripts/ws-partopts-shots.cjs` (`--out` set to scratch so the builder's `shots-A2` stay as committed) | **`ws-partopts-shots: OK`** |
| `node tests/scripts/ws-code-snapshot.mjs` | **`ws-code-snapshot: OK (732 codes, 35 categories, +160 appended …, 3203 option round trips)`** |
| `node tests/scripts/ws-boot-smoke.cjs` | **`ws-boot-smoke: OK`** |
| Default identity: master d34311d worktree `ws-lesson-baseline --all-lessons --write <scratch>/base-d34311d.json`, then `--check` on HEAD | **`ws-lesson-baseline: OK (1556 hashes identical)`** |
| `ws-detailed-lesson --check --repeats`, 7 lessons | OK for g2-nbt3, g3-oa5, g3-oa9 ×2, g4-nbt1. FAIL for g1-oa1 (E9 overflow P6, E35) and g3-oa8 (E35), the same as on master. |

## Scores

| Criterion | UI 1280 | UI 390 | Packets (4 lessons × M/L × 5 combinations) |
|---|---|---|---|
| Clarity (UI) / C1 Ease of use | 7 | 7 | 8 |
| Correctness (UI) / C2 Educational value | **7** | **7** | **7** |
| Layout (UI) / C3 Spacing and layout | 8 | 8 | **7** |
| Consistency with mock and tokens (UI) / C4 Standard fidelity | 8 | 8 | 8 |

**VERDICT: FAIL (6 of 12 cells at 7, none lower).** The step is much improved. Ten of the twelve r1 findings are fixed. The six 7s come from four lane-made defects: N1 to N4.

## r1 findings re-checked

| r1 | Status | Evidence |
|---|---|---|
| F1 lower counts blank the sheet foot | **Mostly fixed.** The worst lane-made lesson-sheet foot I measured is 26–27 %; r1 had 23–77 %. The freed height does flow to rows in some lessons: Y4.B2.S5 M with Vocabulary 0 and We Do off grows the rows to 9 cells (`sub10k-M-vocab0-wedooff-pupil-p2.png`). It does not in others: see **N1**. | `pk.log` |
| F2 counts fixed almost everywhere | Accepted by the lead (decision c). Practice has a real range in every case I saw. Mixed now has 1–2 pages (e.g. 15/30, 8/16). We Do has a real range where offered (Y4.B1.S14 L reaches 2, and the 2 cells re-flow wider: `r14-L-ui-combo-sheet1.png`). | `ui.log` walks |
| F3 settings carry across a skill swap | **Fixed.** With Vocabulary 0 and Practice 30, removing the skill and adding "Subtract within 100 (with regrouping)" brings Vocabulary back to 3 and Practice to 6, with no Reset link. Reopening the lesson is also clean. | `ui.log`, `Y4_B1_S14-1280-after-swap.png` |
| F4 dead steppers | **Fixed.** Every walk moved one value per click and none was dead. At 0, + is live and ticks the part again; − is disabled at the first value. | `ui.log` "walk" lines |
| F5 390 overlap | **Fixed.** No boxes overlap in any part row and there is no sideways scroll (scrollWidth − innerWidth = 0) for all three lessons. | `*-390-*.png` |
| F6 count written twice | **Fixed** for fixed counts ("Fixed: n (why)"). A leftover appears in N6. | |
| F7 "no room" rows with a tick | **Fixed:** no tick and no New numbers. But the claim itself is sometimes false (N1). | |
| F8 Supports pills | **Fixed:** plain "Standard". | |
| F9 no table at 1280 | **Fixed:** a full-width table card under the columns, about 690 px tall. | `Y4_B1_S14-1280-default.png` |
| F10 two New numbers for one sheet | **Fixed.** Each New numbers changed only its own sheet's pages in the live preview: chart → p1; lesson sheet → its 1–2 pages; Practice → its page; Mixed → its 1–2 pages. | `ui.log` |
| F11 pre-existing | Unchanged. Two more pre-existing defects were found: see P1 and P2. | |
| F12 gate judged relative / one part at a time | **Fixed in kind.** The gate now judges absolutely and builds combinations. The coverage gap that remains is in N7. | |

What else holds:
- The key follows the pupil page in all 40 packets. Each key page matches its pupil page by sheet and cell count, and it is a facsimile (`sub10k-M-vocab0-wedooff-key-p2.png`).
- No page overflows, no cells overlap, and no cell is split.
- Rounded Practice totals land on equal pages; the last practice page is at 6–7 % (`r14-M-practice75-last-page.png`).

## Findings

**N1 · MEDIUM · packets C3, UI correctness: freed height does not go back to rows on some sheets, and the screen says "no room" where a row fits (DESIGN §8b).**
- **Repro:** Y4.B1.S14 at L, Vocabulary 0 (alone, or with Remember off and We Do 2, as reached on screen).
- **What prints:** the lesson sheet is one page whose foot is **26 % (62–63 mm) empty**. Shots: `r14-L-vocab0-sheet1.png`, `r14-L-ui-combo-sheet1.png`.
- **Why a row fits:** an Independent row of this lesson at L is about 29 mm tall plus its 9 mm band head (`r14-L-standard-sheet-p3.png`).
- **What the screen says:** "Lesson practice rows: Not on this lesson sheet (no room)", and the limits it returns are `rows {none: true, max: 0}`.
- **Second case:** `add_wp_10` at L with Vocabulary 0 leaves 27 % (64 mm) with rows "no room" (`wp10-L-vocab0-sheet1.png`).
- **Why the gate passes it:** it stays under PO-2d's 30 % line.
- **Fix:** where the foot holds at least one row of the lesson's Independent cell, deal that row. The "no room" note may only be written when the free height is less than one row.
- **Check:** add **EB-ROWFIT** to PO-2d. On any lesson sheet with rows 0 or `none`, fail when the empty foot is at least one Independent row's height plus its band head. Also assert that the "no room" note is true: free height < row height.

**N2 · MEDIUM · UI correctness: unticking Remember does not remove the rule; it moves it.**
- **Repro:** Y4.B1.S14 at L or M, Vocabulary 0, then untick Remember. The "Rule: 5 or more, round up. 4 or less, round down." band leaves the top and prints again in bold under the We Do Steps (`r14-L-ui-combo-sheet1.png` against `r14-L-vocab0-sheet1.png`).
- **Effect:** the tick reads as "do not print Remember", but the page still prints it. Y4.B2.S5 does drop its Remember line, so the behaviour differs between lessons.
- **Fix:** either Remember off removes the rule everywhere, or the Remember row says "The rule stays in the We Do Steps" and cannot be ticked off.
- **Check:** in PO-2b, when `remember` is off, the lesson's Remember text must not occur in the pupil HTML of the lesson sheet (a string test against `lessonData(...).remember`).

**N3 · MEDIUM · UI correctness: the Parts table states things about the standard sheet that are false.**
- **Repro:** Y4.B1.S14 at L, the default packet. The group caption reads "Vocabulary, Remember, We Do and practice rows: **one page**", and the rows say "Fixed: 2 (**fills the page**)".
- **What prints:** the lesson sheet prints on **two** pages, each 38–39 % empty (`r14-L-standard-sheet-p2.png`, `-p3.png`). The page layout is the same on master (P1), but the text is new in this lane.
- **Second case:** `add_wp_10` L Mixed reads "10, or 0 to leave it off" with no pages note, but it prints on 2 pages and the last is 72 % empty (P2). Practice, by contrast, gets "· 1 page of 4".
- **Fix:**
  - Derive the caption from the build ("one page" / "two pages").
  - Write "fills the page" only when it does.
  - Give every multi-page part its pages note.
- **Check:** a lint in `ws-partopts-shots` that the caption's page count equals the lesson-sheet pages in the live preview (`#tvPreviewFrame` `data-ws-sheet` count). PO-2 should also measure the standard packet whenever the screen writes "fills" about it.

**N4 · MINOR · packets C2: Vocabulary can be set to 1, which prints a one-pair "Draw a line to match".**
Y1.B2.S9 M, Vocabulary 1 prints "+" over "plus" and asks the pupil to match them, in a band about 40 mm tall (`fact-M-vocab1-sheet1.png`). With one pair, matching is not a task, and the band is mostly white.
- **Fix:** where the vocabulary task is a match, the offered minimum is 2 (or 1 renders as "Read and say", with no matching instruction).
- **Check:** in PO-4, `offeredValues(vocab)` never includes 1 when the lesson's vocab task is a match.

**N5 · MINOR · UI clarity: a locked tick gives its reason only in a hover title for We Do and rows.**
Remember shows "Needed to fill the lesson sheet" as visible text. We Do and Lesson practice rows show only a pale ticked box; the reason is a `title` attribute (`teacher-print.js:705`). The pale purple box still looks pressable, including at 390, where there is no hover (`Y4_B2_S5-390-combo.png`, rows).
- **Fix:** show the reason as visible text on every locked row.
- **Check:** a lint in `ws-partopts-shots` that every disabled `[data-act="part-on"]` has a visible `.tv-part-range` text in its row.

**N6 · MINOR · consistency of range texts.**
- The Vocabulary range reads "3, or 0 to leave it off" in one lesson and "1 to 3 words" (no 0) in another, although both steppers reach 0.
- Mixed still says "15 to 30 problems, **15 a page**" (the phrase r1 F6 named).
- At 390, "… 5 pages of 6" wraps a lone "6" onto its own line.

**Check:** extend the F6 string lint to every range text: no "<n> a page", and "or 0 to leave it off" wherever 0 is on the stepper.

**N7 · PROCESS · PO-2 builds combinations in one shot; the screen reaches them in steps.**
- The gate asks for "everything at its min" all at once, and the settle loop snaps most of it back. For example, Y4.B1.S14 M "everything at min" prints only `{chart: 1}` (`pk.log`).
- The screen gets further. After Vocabulary 0, Remember unlocks and We Do opens to 2, so a teacher reaches states (Vocabulary 0 + Remember off + We Do 2) that the gate never builds. N1 and N2 live in exactly those states.
- **Check:** PO-2 walks the screen's state machine. From the standard packet, apply each offered single-step change, re-read the limits, and recurse to depth 3 (breadth-first, de-duplicated by the normalised partOpts). Judge every state reached.

**Pre-existing (identical on master d34311d, not scored against this lane; for the lead's F11 list):**
- **P1:** Y4.B1.S14 at L: the standard lesson sheet runs to 2 pages, 38 % and 39 % empty (`r14-L-standard-sheet-p2/p3.png`). Master probe: `lesson-sheet[4c 38%] lesson-sheet[9c 39%]`.
- **P2:** `add_wp_10` at L: the standard Mixed runs to 2 pages, and the last holds 6 cells with 72 % of the page empty (`wp10-L-mixed-last-page.png`). This breaks H5 (a last page under half used).
- **P3:** Practice and Mixed cells of Y4.B1.S14 and others carry EB-BAND 33–37 %, as r1 F11b found. The lane's totals print more of these pages, but each page is the standard one.

## Summary for the builder

Fix N1, N2 and N3, and add the four checks (EB-ROWFIT, the Remember-text test, the caption/pages lint and the step-walk in PO-2). N4 to N6 are small. Everything else in step A now works on the screen and on paper, and the defaults are byte-identical.
