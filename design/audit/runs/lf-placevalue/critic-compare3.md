# lf-placevalue critic compare r3: `placevalue:compare`, plus the changed passed pages (B1–B3)

Independent critic (Opus medium). I graded and fixed nothing. Tree: `claude/lf-placevalue-w2` at ce574c27 (the brief commit on top of
a5d1cb2d). BEFORE pages: a read-only worktree at 6d1ffb80 (removed after use).

**Sizes: M and L only.** The coordinator relayed the new owner rule (CLAUDE.md plan item 9) mid-round: print size S is dropped. S findings
do not count toward the verdict; the few S observations are listed under "S (no longer counted)". Screen hosts: print, the practice card at
1280 and 820, the online worksheet 1280 and the quiz 1280 (through `--quiz-builder`). No 390 px.

Renders (`ws-grade-render --gate`, every run `OK`: no overflow, no target under 44 px), one browser command at a time through
`mq-browser-run.sh`:
- default: all 13 roles at S/M/L with keys, plus card 1280 / 820, worksheet 1280, quiz 1280 (`--quiz-builder`);
- band=999999 and lengths=mixed: independent, test, true-false, reason-it, error-analysis, guided, scripted-model, lesson (S, L);
- band=99: independent, test, true-false, reason-it, guided, scripted-model, lesson (S, L);
- closeness=close + band=999999: independent, test, true-false, error-analysis, guided, scripted-model, lesson (M, L);
- B1: `ws-detailed-lesson --lesson g2-nbt3-read-write-1000 --check` AFTER and BEFORE (both `OK`);
- B2/B3: identify, unit_form, value Review / Test at S, L with the screen hosts AFTER and BEFORE; identify with `support:["chart"]`.

Rulings applied (graded, marked `E`, not held): opener / scripted-model / review / mixed / pre-skill-check bands; PG-23 / DN-2 pagination;
the EA "Name wrote:" PUPILTAG; the opener L 999,999 overflow; the worksheet's 29 px digits; N5 (Reason It panel geometry); CL-2c; PT-ENG-6;
CL-4d.

## VERDICTS

- **compare: `VERDICT: FAIL`**: one 7, N9 (the wrap is NOT FIXED on the lesson anchor at band=999999, M and L). Everything else r2 found is fixed.
- **B1 (lesson 1 g2-nbt3, Number sense compare at minNum 21): `VERDICT: PASS`**
- **B2 (identify Review / Test; screen numeral): `VERDICT: PASS`**
- **B3 (unit_form / value screen word size): `VERDICT: PASS`**

## r2 findings

| r2 | Status | Evidence (M / L) |
|---|---|---|
| N1 TOF false share | **FIXED** | Default: M 3/6, L 2/4. band 999999 L 2/4; band 99 L 2/4; close+999999 M 3/6. Every false statement is the named error (528 > 637, 572 < 216, 639 > 712, 525,535 > 528,000, 42 > 80). |
| N2 mark over neighbours | **FIXED** | Box clears the neighbours by about 2.2–2.4 mm (scripted-model L b6: box right rule x=227, next "3" x=236; lesson L "4[1]7"). A residue on the boxed digit's own ink: N10. |
| N3 sign parity | **FIXED** | lesson M/L p3 mixed block: < < > < < > > <, columns mixed. mix independent L, test L: no runs of alternation. |
| N4 Guided Model decided at the ones | **FIXED** | b6 Guided Model 306,987 < 756,676; close6 306,759 < 306,985; band 99 39 < 67; default M 308 < 986. M6 gets every one wrong. |
| N6 Remember line | **FIXED** | lesson M p2 "Remember: More digits wins. Same count: the first different digit decides." L p2 prints the chant as "Rule:". |
| N7 "=" density / first item | **FIXED** | Each section ≤ ceil(n/6): independent L 3/18, more-practice M 3/24, test M 2/16, L 1/12, review M 1/9, mixed M 3/21, L 1/10, lesson p3 block 1/12. Test item 1 and the first Guided try are never "=". Quiz Q1 486 < 895; worksheet "=" at Q3 only. |
| the wrap ("7 >" / "5.") | **NOT FIXED** at band 999999 (N9) | Fixed for the "differ" step (no-break spaces) and at the default band. The lesson anchor's step 3 still breaks at band 999999 and close: "Write 501,765 >" / "179,619." (L), "Write 322,389 <" / "329,757." (M). |
| F9 3-across side pad at L | **FIXED** | test-L / independent-L: first ink 23 px (6.1 mm) inside the left rule, 23 px (6.1 mm) from the right one. |
| N8 quiz host bypasses the builder | **FIXED** | `--quiz-builder` deals through the builder; identify's quiz-1280 has no H T O heads; `quiz-1280.html` written. |

## New findings

### N9 (major; C4 7 on the lesson at band=999999 and closeness=close, M and L): the anchor's "Write a < b." wraps after the sign
- **Pages:** `after/b6/placevalue__compare/lesson-L-p1.png` step 3: "Write 501,765 >" / "179,619." `after/close6/placevalue__compare/lesson-M-p1.png`
  step 3: "Write 322,389 <" / "329,757." The default band (3 digits) fits on one line.
- **Why it costs a point:** the step sentence is the number sentence the pupil copies; at 6 digits the narrow text column breaks it after
  the sign, the exact defect r2 asked to fix. A teacher would notice it on the lesson's central page.
- **Cause:** `js/modules/sheet/providers/pv.js:729` and `:741` build `` `Write ${A} ${q.ans} ${B}.` `` with plain spaces. Only the "differ"
  step (`:740`) has the ` ` joins.
- **Fix:** join `A`, the sign and `B` with ` ` in both "Write" steps (729, 736 for "=", 741).
- **Check that would catch it:** `ws-pv-compare-pages` WRAP-SIGN builds only `opts null` (line 269-270). Run it on band 9999, 99999 and
  999999 and on closeness=close too (the option list line 181 already uses), for scripted-model, guided and lesson at M / L.

### N10 (minor; C4 8): the deciding-digit box grazes its own digit's ink at L
- **Pages:** `after/b6/placevalue__compare/scripted-model-L-key-p1.png` state 3: box left rule x=203-204, the "4" ink from x=206 (1 px, about
  0.3 mm). `after/b99/placevalue__compare/lesson-L-p1.png`: the boxed "3" of 34 sits about 1 px from the right rule, 4 px from the left.
- **Effect:** legible; the box looks tight and lopsided round wide digits. It does not cut a neighbour (N2 is fixed).
- **Check that would catch it:** MARK-CLEAR measures the box against the character boxes it does not mark. Add a raster test that the box
  keeps at least 0.5 mm from its OWN digit's ink on each side (or centre the digit in the frame).

### N11 (minor; C3 8): the lesson L p2 Guided cells sit about 3.2 mm from their rules
- **Page:** `after/base/placevalue__compare/lesson-L-p2.png`, the Guided row (429 / 488 with the "3 digits" cue, 714 ○ 175, 817 ○ 817): the
  first ink is 12 px (3.2 mm) inside the left rule, the last 12 px (3.2 mm) from the right rule. F9's bar for 3-across compare cells is 5 mm.
- **Check that would catch it:** SIDE-PAD covers only `independent` at L. Run it on the lesson's Guided and Independent rows at L too.

### N12 (E, PG-23 / DN-2 pagination, not held): band=999999 lesson L practice pages are half empty, and p2 deals 1 Guided + 1 Independent
- **Pages:** `after/b6/placevalue__compare/lesson-L-key-p2.png` … `-p6.png`. The practice pages hold 4 / 4 / 8 / 4 items. Pages 1/4, 2/4 and
  4/4 are about 50 % white, though page 3/4 shows that 8 items fit. Lesson p2 holds one Guided item and one Independent item (item 7).
- **Graded** C3 5E (H5 territory): pagination is under the PG-23 / DN-2 ruling, so it is not held against compare. The lead should note
  it, because the default band does not show it.
- **Check that would catch it:** EB-GRIDFOOT / L-DENSITY on the lesson practice pages at every option band, with a lone-section rule
  (a lesson section of 1 item).

### Notes (no point)
- lengths=mixed deals no "=" (accepted in r2).
- band=99 lesson p3 mixed block: three of eight items start with 7 (7 < 40, 7 < 13, 7 < 20). The items still vary.
- Test M / L: 25 % / 52 % white under the grid (F7 precedent, C3 8).

### S (no longer counted)
- lesson-S band 999999: practice pages 1/4, 2/4, 4/4 hold 4 items each (the N12 pagination).
- lesson-S band 999999 p1: the N9 wrap ("Write 501,765 >" / "179,619.").
- Otherwise S was clean: TOF S 4/8 false, the Guided S cue, independent S "=" 4/30, keys right.

## Grade table: compare, M and L (C1-C2-C3-C4; `E` = ruled, not held)

| Version | M | L | Notes |
|---|---|---|---|
| independent + key | 9-8-8-9 | 9-8-8-9 | Keys right; "=" 3/18 (L); side pad 6 mm (F9 fixed). |
| more-practice + key | 9-8-8-9 | 9-8-8-9 | "=" 3/24 (M). |
| test + key | 9-8-8-9 | 9-8-8-9 | Item 1 never "="; 2/16, 1/12. Keys right. White under the grid (F7). |
| review + key | 9-8-7E-9 | 9-8-7E-9 | Review band (D3). Worth items 800 / 5 / 80. |
| true-false + key | 9-8-6E-8 | 9-8-6E-8 | **N1 fixed**: 50 % false. The false statements are M6. |
| reason-it + key | 8-8-7E-8 | 8-8-7E-8 | All wrongs M6 (826 > 913, 574 < 129). N5 ruled. |
| error-analysis + key | 8-8-6E-8 | 8-8-7E-8 | Out of the pass bar; PUPILTAG D3. |
| opener + key | 8-8-5E-8 | 8-8-5E-8 | Model 380 > 321 (M6 wrong). One "=" in 6. |
| scripted-model + key | 8-8-5E-8 | 8-8-5E-8 | N2 fixed; "3 < 4." no longer splits; N10 minor at L. Model 359 < 434. |
| guided + key | 8-8-6E-8 | 8-8-6E-8 | Model 308 < 986; the first try is not "="; the cue decides it. |
| mixed-practice + key | 9-8-7E-9 | 9-8-7E-9 | "=" 3/21, 1/10. |
| pre-skill-check + key | 8-8-8-8 | 8-8-5E-8 | L p2 pagination, D3. |
| lesson (3 p) + key, default | 8-8-8-8 | 8-8-8-8 | N3 / N2 / N6 fixed. N11 minor at L. |
| option band=999999 (independent, test, TF, RI, EA, guided, SM) | 9-8-8-9 | 9-8-8-8 | Guided Model 306,987 < 756,676. |
| option band=999999 lesson | 8-8-5E-**7** | 8-8-5E-**7** | **N9** wrap on the anchor; N12 pagination (E). |
| option closeness=close (+ 999999) | 9-8-8-9; lesson 8-8-5E-**7** | 9-8-8-8; lesson 8-8-5E-**7** | The deciding place spreads; TF 3/6; **N9** on the lesson M anchor. |
| option band=99 | — | 9-8-8-8 | TF 2/4; SM Model 78 > 19; lesson anchor 34 > 19, N10 at L. |
| option lengths=mixed | — | 9-8-8-9 | N3 fixed; M-C3 shown (95 > 787, 343 < 4); Guided cue "94 has two digits. 992 has three." |
| practice card 1280 / 820 | 9-8-8-8 | | 198 / 275, 438 / 433; gate targets OK. |
| online worksheet 1280 | 9-8-8E-8 | | One "=" (Q3) in 6. 29 px digits ruled. |
| quiz 1280 (builder) | 9-8-8-8 | | Q1 486 < 895. |

The teaching checks the brief names:
- **TOF 40–60 % false:** yes, 50 % on every page I graded.
- **The deciding-digit mark clears its neighbours:** yes (N10 is its own digit, minor).
- **The signs are not patterned:** yes.
- **The Model is an item M6 gets wrong:** yes, on every Model, scripted model, opener and lesson anchor.
- **"=" at most ceil(n/6) and never item 1 of a Test or quiz:** yes.
- **The chant and the Remember line fit what the page deals:** yes.
- **The keys are right:** yes, every key I read.

## B. Changed passed pages (BEFORE 6d1ffb80 vs AFTER)

### B1: lesson 1 (g2-nbt3) Number sense compare: PASS
- **What differs:** 4 of 30 rendered pages (page-04, -09, -20, -30). The rest are identical.
- **The changes:**
  - P1 Band A compare: 56 ○ 62 → 83 ○ 53.
  - Band B: **35 ○ 35** (an "=" dealt as the "close" item) → 94 ○ 98.
  - The teacher page's spaced-retrieval ask: "Which is bigger: **51 or 51**?" (no answer) → "Which is bigger: 24 or 28?" (28).
  - Answers-at-a-glance: "< · … · =" → "> · … · <".
- **Verdict:** every change is a fix. BEFORE asked "which is bigger" of two equal numbers, and Band B "close" was an "=". AFTER keeps both
  numbers at 21 or more, the B item is harder (decided at the ones place), and the keys agree on all three pages.
- **Grade:** 9-9-8-9, unchanged or better. `ws-detailed-lesson --check`: OK.

### B2: identify Review / Test: PASS
- **Print, default:** byte-identical to BEFORE (8 pages). No heads on Review / Test at S or L, and the keys are unchanged.
- **support=chart:** the Hundreds / Tens / Ones chart comes back on every Review and Test item at S and L.
  - Review S 8+2, L 3+2; Test S 16, L 9 (4 fewer at S: the chart's height).
  - It fits with no overflow. It is the teacher's choice (lead ruling 14:24), so it is not held.
- **Screen:**
  - **card 1280:** the numeral grows from about 30 px to the 56 px desktop digit, with the H T O heads still over it (the taught host).
  - **quiz 1280:** the heads are gone and the numeral is at 56 px. The underline marks one digit.
  - **worksheet:** the digit size is unchanged (29 px, ruled).
- **Grade:** Review 9-8-7E-9; Test 9-8-8-9; card 9-8-8-8; quiz 9-8-8-8.

### B3: unit_form / value screen words: PASS
- **Worksheet 1280:**
  - "hundreds / tens / ones" (unit_form) and "worth" (value) go from about 14 pt to 16 pt (about 21 px).
  - The cells still hold one item each, and the input stays beside its word.
- **Card 820 and quiz 1280:** changed by less than a visible amount.
- **Print:** byte-identical.
- **Grade:** 9-8-8-9 on the worksheet, unchanged elsewhere.

## PNGs graded
Root `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-compare3/`:
- `after/base/placevalue__compare/`:
  - the 13 roles at {S,M,L}, pupil and key: `{role}-{size}{,-key}-p1.png`;
  - `lesson-{S,M,L}{,-key}-p{1,2,3}.png` and `pre-skill-check-L{,-key}-p2.png`;
  - `card-1280.png`, `card-820.png`, `worksheet-1280.png`, `quiz-1280.png` and `quiz-1280.html`.
- `after/b6/placevalue__compare/`: band 999999, S and L, the lesson p1–p6.
- `after/mix/placevalue__compare/`: lengths=mixed, S and L.
- `after/b99/placevalue__compare/`: band 99, S and L.
- `after/close6/placevalue__compare/`: closeness=close + band 999999, M and L.
- `{before,after}/b1-lesson/page-NN.png` and side-by-sides `sbs-b1-{04,09,20,30}.png`.
- `{before,after}/b2/placevalue__{identify,unit_form,value}/`: review / test {S,L}{,-key}, card-1280 / 820, worksheet-1280, quiz-1280.
- `after/b2chart/placevalue__identify/`: review / test {S,L}{,-key}.
- Side-by-sides `sbs-b2-*.png`. Contact sheets `cs-*.png`.
- Crops:
  - `crop-b6-lessonS-anchor3.png`, `crop-sm6L-s3.png`, `crop-b99-lessonL-s3.png` (N9, N10);
  - `crop-lesson-ML-p2-guided.png`, `crop-L-p2-g3.png` (N11);
  - `crop-testL-row1.png` (F9).
