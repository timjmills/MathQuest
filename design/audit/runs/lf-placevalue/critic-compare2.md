# lf-placevalue critic compare r2: `placevalue:compare`, plus the changed passed pages (B1–B3)

Independent critic (Opus medium). I graded and fixed nothing. Tree: `claude/lf-placevalue-w2` at ae799fbf (the brief commit on top
of 0a078a73). Renders:
- `ws-grade-render --gate` for every role at S / M / L with its key, and the screen hosts. Gate OK: no overflow, no target under 44 px.
- The options band=999999 (S/M/L), lengths=mixed (S/L), band=99 (S/L) and closeness=close + band 999999 (S/L).
- BEFORE pages from a read-only worktree at 023cafca. The B1 Guided pages were also rendered on master deploy-4 (e4d12d6a), to
  find out whose change they show.

Browser commands ran one at a time through `mq-browser-run.sh`. A node probe of the compare dealer (`gen-pv.js`, 120 items per
option value, plus 16 simulated live sessions) gave the deal statistics quoted below.

Rulings applied: D3 ENGINE-ROLES (marked `E`, graded, not held), CL-2c, PT-ENG-6, CL-4d (the one-line cells are centred in
stretched rows; I saw none at the top of a stretched row).

## VERDICTS

- **compare: `VERDICT: FAIL`**: N1, N2 and N3 hold it. N3 reaches the default lesson.
- **B1 (12 Guided pages): PASS**
- **B2 (identify Review / Test / pre-skill check, quiz): PASS**
- **B3 (number_word_form "1 one" / "1 ten"): PASS**

## r1 findings

| r1 | Status | Evidence |
|---|---|---|
| F1: reason-it band=999999 numerals overflow | **FIXED** | `b6/reason-it-S`: the answers lie under A and B. `b6/reason-it-L`: A stacks over B. No numeral crosses a rule. The gate is OK. |
| F2: chant and worked steps do not teach the decision | **FIXED** (one residual, N6) | Chant "More digits wins. Then first different digit." decides every item the lesson deals: same-length items by its 2nd clause, the p3 mixed block by its 1st. Worked steps: "Both have three digits." / "The tens digits differ: 1 < 3." with the two digits boxed / the bigger number underlined. Each state draws its own mark. Residual: the p2 "Remember: More digits is the bigger number." decides none of the 12 same-length items on p2 (N6). |
| F3: M6 is not the error shown | **FIXED** | Every wrong item on EA, TF and RI, S/M/L, at the default, band 99 and band 999999, is M-C2 (last digits), e.g. 584 < 508, 129 > 574, 503,044 > 950,450. lengths=mixed shows M-C3: EA 178 < 60 and 4 > 343, TF 635 < 71, RI 8 > 952. The fix lowered the TF false share (N1). |
| F4: "=" pinned to item 1 in live play | **FIXED** (mechanism); minor residue N7 | `_liveRun` is drawn per session. In 16 simulated sessions the first "=" fell at positions 1–6. Opener, scripted-model and guided Models are never "=" (782 > 464, 733 > 535, 934 < 991). Residue: the worksheet render shows "=" at Q1 and Q6 (2 of 6); the quiz shows "=" at Q1; the first Guided practice item is "620 = 620" (N7). |
| F5: close items always decided at the 2nd digit | **FIXED** | close + band 999999 deals deciding places 2..6 evenly (21/23/18/21/17 of 100). `close6/independent-L`: places 3, 6, 4, 5, 3, 6, 4, 2, 5. |
| F6: mixed = mostly 1-digit vs 3-digit | **FIXED** | 1v3 is now 1 in 6 (20/120; `mix/independent-S` 5/30); 2v3 is 100/120. The two-digit gap is the far "ord 0" item by design (4v6 at band 999999). |
| F9: 3-across digits about 4 mm from the cell rules at L | **NOT FIXED** (minor) | independent-L: 4.8 mm / 4.5 mm across a rule (pixel scan). It is legible, but a side-pad of 5 mm or more is not met. The Reason It L panels are tighter (N5). |

## New findings

### N1 (major; C2 7 on True or False? S/M/L): only 12–33 % of statements are false (PT-TOF-1 wants 40–60 %)
- **Pages:**

  | Page | False statements |
  |---|---|
  | `base/true-false-S-key` | 2 of 8 (639 > 712, 815 > 880) |
  | `-M-key` | 2 of 6 |
  | `-L-key` | 1 of 4 (637 < 528) |
  | `b6/true-false-S-key` | 2 of 8 |
  | `b99/true-false-S-key` | **1 of 8** |

  r1's S page had 4 of 8. lengths=mixed gives 4 of 8: every mixed item has a named error.
- **Cause:**
  - `wrongFlags` (compose.js `wrongPattern`) flags half the slots false.
  - Compare's `wrongAnswer` now returns null for any item M6 gets right: "=", or a pair the ones place decides (364 > 363, 992 > 991, 33 < 36).
  - `true-false.js` prepare then makes the flagged slot TRUE (`isFalse = wrong && info.wrong`) instead of skipping it, as error-analysis.js:461 does.
  - The provider comment ("it is never dealt to a True or False?... page") is not what happens.
- **A pupil who ticks True on every item scores 75–88 %.**
- **Check that would catch it:** ws-roles-unit or cell-checks `TOF-SHARE`: for each skill × S/M/L × offered option value, the rendered
  `meta.falseShare` of a True or False? page is 0.4–0.6. The meta field already exists; nothing reads it. Also a provider check:
  `wrongAnswer` non-null on at least 60 % of dealt items, or the role skips the null slot.

### N2 (major; C4 7 on lesson p1 S/M/L, scripted-model S/M/L): the deciding-digit box is drawn over the neighbouring digits
- **Pages:** `lesson-S-p1` anchor states 2–3 (417 / 432) and `scripted-model-L-key` states 2–3 (733 / 535).
- **What I saw:** the box around the deciding digit is the width of that digit's own advance.
  - Its left and right rules run through the ink of the digits beside it: the "4" and the "7" of 417 are cut by the box around 1; "535" and "733" in the scripted model the same.
  - Crops: `crop-lesson-S.png`, `crop-sm-L.png`.
  - The digits stay readable, but this is the lesson's central picture, and the clean drawing it should be (CL / VQ) is not met.
- **Fix direction:** give the boxed digit its own side gap (letter-spacing or a padded span) inside the numeral, or draw the box outside the digit's advance.
- **Check that would catch it:** cell-checks `MARK-CLEAR`: each mark rect (`digits` box, `win` underline) keeps at least 0.5 mm from every ink box of glyphs it does not mark (Range.getClientRects per character), on the anchor, the scripted-model and the Guided Model at S/M/L.

### N3 (major; C2 6, answer given away: lesson p3 default S/M/L, every lengths=mixed page): mixed-length answers strictly alternate > < > <
- **What I saw:**
  - `mix/independent-S-key` items 1–30 read >, <, >, <, … without a break.
  - `lesson-S-key-p3` items 13–20 alternate, so in its 2-column block **the left column is all ">" and the right column all "<"**.
  - `mix/guided-S-key` shows the same columns.
- **Probe:** 24 items × 3 seeds × 2 bands give `> < > < …` every time.
- **Cause:** `comparePair` (mixed) always returns [longer, shorter], and `genCompare` swaps on `slot(2) === 1`. The sign is therefore the item's index parity.
- **Fix direction:** swap on a mixed per-block order (as `blockOrder` does) or on a seeded coin, never on the index's parity.
- **Check that would catch it:** a dealer check `SIGN-PARITY` per option value: over 120 seeded items the share of ">" at odd indices and at even indices each stays within 0.25–0.75, and no run of more than 8 strict alternations. It would also have caught r1's "=" every sixth item.

### N4 (minor; C2 8): the Guided Model can be an item the ones place decides
- **Pages:** `b6/guided-S-key` and `-L-key`. The Model is 992,323 > 992,321.
- **Why it matters:** this is the one kind of pair where the M6 habit (compare the last digits) also gives the right sign, so the only worked example on the page does not separate the rule from the error. The default band's Model (934 < 991) is fine.
- **Check that would catch it:** `MODEL-ITEM`: a compare Model is an item whose `compareM6` gives a wrong sign (named error non-null).

### N5 (minor, ENGINE-ROLES, lf-roles Reason It panel geometry; C3 7E): the Reason It L panels hug the numerals
- **Page:** `base/reason-it-L`.
- **Measurements:** the numerals sit 1.6–2.6 mm from the A/B panel rules (pixel scan at 96 dpi: 9 / 7 / 10 / 6 px), and the page is 2 items with about 60 % white.
- **Check that would catch it:** a side pad of at least 3 mm inside a Reason It panel in ws-slot-clip, or ABTAG's sibling.

### N6 (minor; C2 8): the lesson p2 "Remember:" names the length rule only, and p2 deals no different-length item
- **Page:** `lesson-S-p2`. The page holds the warm-up compares, 2 Guided and 6 Independent items, all of one length.
- **Check that would catch it:** extend LESSON-CHANT-FIT to the Remember band. The concept it shows must decide at least one item on its page, or the band shows the chant.

### N7 (minor; C2 8): "=" density inside short sets and the first Guided item
- **What I saw:**
  - Opener Independent items 2 and 3 are both "=" (2 of 6).
  - Lesson p2 Independent items 8 and 12 are "=" (2 of 6).
  - The worksheet render has Q1 and Q6 "=" (2 of 6).
  - Test S/M/L item 1 is "724 = 724".
  - Guided's first practice item (the one with the cue) is "620 = 620" at every size and band. Its cue is "Both have three digits.", which does not decide it ("Every digit is the same." would).
- **Check that would catch it:**
  - Per printed section of n items, the "=" count is at most ceil(n/6).
  - Item 1 of a Test or Guided set is not "=".
  - For an "=" item, hintOf takes step 2.

### N8 (note, harness): the grade-render quiz host bypasses the quiz builder
- **What I saw:** `b2/placevalue__identify/quiz-1280.png` still draws the H T O heads.
- **Why:** `renderQuiz` builds questions with `generateQuestion` directly, so the builder's `roleOptions('test', …)` is never applied.
- **The real quiz is right:** `ws-pv-identify-heads` PV-HEADS-QUIZ (builder path) is OK, with 0 headed items. I judged B2's quiz from that gate.
- **Fix:** make grade-render's quiz host deal through `addMultipleQuestions`, or apply `roleOptions('test')`, so the critic's quiz PNG is the real one.

### Notes (no point)
- lengths=mixed deals no "=" at all (the card's step 5 says "=" one in six). It is a different-length option, so I accept it.
- Test S/M/L: 52 % / 27 % / 53 % white under the grid (r1 F7, combine precedent, C3 8).

## Grade table: compare (C1-C2-C3-C4; `E` = ENGINE-ROLES, not held)

| Version | S | M | L | Notes |
|---|---|---|---|---|
| independent + key | 9-8-8-9 | 9-8-8-9 | 9-8-8-9 | Keys right (30/30 S). "=" 5/30. F9 minor at L. |
| more-practice + key | 9-8-8-9 | 9-8-8-9 | 9-8-8-9 | |
| test + key | 9-8-8-9 | 9-8-8-9 | 9-8-8-9 | Keys right. Item 1 "=" (N7). F7 white. |
| review + key | 9-8-7E-9 | 9-8-7E-9 | 9-8-7E-9 | Review band D3. Worth items right (800, 5, 80, 500). |
| true-false + key | 8-**7**-6E-8 | 8-**7**-6E-8 | 8-**7**-6E-8 | **N1** false share 25 / 33 / 25 %. The shown errors are M6. |
| reason-it + key (default) | 8-8-7E-8 | 8-8-7E-8 | 8-8-**7E**-8 | All wrongs M-C2. N5 at L. |
| reason-it band=999999 | 9-8-8-8 | - | 9-8-7E-8 | F1 fixed: under at S, A over B at L. |
| error-analysis + key | 8-8-6E-8 | 8-8-6E-8 | 8-8-7E-8 | 3/6 and 2/4 wrong, all M6. Out of the pass bar. PUPILTAG is D3. |
| opener + key | 8-8-5E-8 | - | 8-8-5E-8 | Model 782 > 464. Two "=" in a row in Independent (N7). |
| scripted-model + key | 8-8-5E-**7** | 8-8-5E-**7** | 8-8-5E-**7** | Steps now mark the decision (F2 fixed). **N2** box over the neighbouring digits. L step 2 wraps "7 >" / "5." |
| guided + key | 8-8-6E-8 | 8-8-6E-8 | 8-8-6E-8 | Model never "=". First practice item "=" with a non-deciding cue (N7). M cue wraps "9 >" / "5." |
| guided band=999999 | 8-8-6E-8 | - | 8-8-6E-8 | N4 Model decided at the ones place. |
| mixed-practice + key | 9-8-7E-9 | 9-8-7E-9 | 9-8-7E-9 | Keys right. |
| pre-skill-check + key | 8-8-8-8 | 8-8-8-8 | 8-8-5E-8 | L page 2 is pagination, D3. |
| lesson (3 p) + key | 8-**6**-8-**7** | 8-**6**-8-**7** | 8-**6**-8-**7** | **N3**: p3 2-column mixed block, left column all >, right all <. **N2**: anchor box over the digits. N6. |
| option band=99 (independent, RI, TF) | 9-8-8-9 / TF 8-**7**-6E-8 | - | 9-8-8-9 | TF 1/8 false (N1). |
| option closeness=close b6 | 9-8-8-9 | - | 9-8-8-9 | F5 fixed. |
| option lengths=mixed (independent, EA, TF, RI, guided) | 9-**6**-8-9 | - | 9-**6**-8-9 | **N3** strict > < alternation. M-C3 shown. 1v3 = 1 in 6. |
| practice card 1280 / 820 / 390 | 9-8-8-8 | | | 198 / 275, 433 / 438, 438 / 433. Targets OK (gate). |
| online worksheet 1280 | 9-8-8E-8 | | | Q1 and Q6 "=" (N7, minor). 29 px digits are SCREEN-DIGIT, D3. |
| quiz 1280 | 9-8-8-8 | | | Q1 "488 = 488" (N7, minor). |

The teaching points the brief names:
- **Chant vs. the deal:** fits.
- **Worked steps mark the deciding digits:** yes, but the mark is drawn over the neighbouring digits (N2).
- **M6 is the error shown, with a first-digit case on lengths=mixed:** yes.
- **"=" not pinned and never the Model:** yes, with the N7 residue.
- **The deciding place spreads on close items:** yes.
- **Mixed lengths differ by one digit:** 5 of 6 do, by design.

## B. Changed passed pages (BEFORE 023cafca vs AFTER)

### B1: Guided pages: PASS
- **What changed:** combine S/M/L, expand S/M/L and unit_form S/M/L (pupil + key). value S/M/L and identify S/M/L are pixel-identical.
- **Whose change it is:** every AFTER page is pixel-identical to master deploy-4 (e4d12d6a). The change is lf-roles' merged
  Guided `tightRows`, not a pv code change; the lane's guided reserve commits (5b8c77ca, 06b1fb15, f0d0ac7d) leave these pages as master has them.
- **The change is a fix:** rows are held to their ink and the empty in-cell bands under one-line items are gone (H13).
- **Grades (AFTER):**

  | Page | Grade | Note |
  |---|---|---|
  | combine S | 9-8-8-9 | 41 % white under the grid (BEFORE 27 %): minor, the F7 precedent |
  | combine M | 9-8-8-9 | |
  | combine L | 9-8-8-9 | |
  | expand S/M/L | 9-8-8-9 | |
  | unit_form S/M/L | 9-8-8-9 | |
  | value S/M/L and identify S/M/L | unchanged | |

- **Model, cues and keys:** unchanged and right.

### B2: identify Review / Test / pre-skill check: PASS
- **Heads:** the H T O heads are gone from every "name the place" numeral on Review, Test and the pre-skill check, at S/M/L. The underline still marks one digit clearly.
- **The chart place names:** removing them is **right**. identify's answer is the place name, so a head over the underlined digit
  printed the answer above the item on the pages that test it unaided. The heads stay on independent and mixed-practice (PV-HEADS-TAUGHT OK).
- **Test L:** now 3 × 4 = 12 items (BEFORE 2 × 5 = 10). The bank wraps "ones tens / hundreds" onto 2 lines at 3 across. That is legible, and the page fills. Keys are right (263 → tens 60, 455 → 400, 583 → 3).
- **Review S/M/L:** the same item content, with heads off.
- **Pre-skill check:** the L pagination changed from 5 + 1 (a lone item, 72 % white on page 2) to 4 + 2. That is an engine
  rebalance (D3), not identify content: this pre-skill check deals no identify item.
- **Quiz:** see N8. The builder path is clean.
- **Grades:** 9-8-8-9 (Review 9-8-7E-9; pre-skill check L 8-8-6E-8, D3).

### B3: number_word_form steps: PASS
- `ws-words-checks`: OK. WORDS-STEPS-PLURAL finds 0 "1 ones / tens" in 1,322 steps over bands 20 / 100 / 1,000, line and HTO.
- The diff (pv.js:1323-1331) makes only the plural follow the count; "0 tens, 0 ones" stays plural.
- Scripted-model and Guided at band 1,000, S and L, are pixel-identical BEFORE and AFTER at this seed. Example: "The rest is 49: 4 tens 9 ones."
- In the detailed lesson g2-nbt3, pages 5, 12 and 23 differ only by master's vocabulary pictures (472 ring, H T O chart; lf-vocab
  deploy), not by this change. No page prints "1 ones".
- **Grade:** unchanged from the passed grades (≥ 8).

## PNGs graded
Root `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-compare2/`:
- `after/base/placevalue__compare/`: {independent, more-practice, test, review, true-false, reason-it, error-analysis, opener,
  scripted-model, guided, mixed-practice, pre-skill-check}-{S,M,L}{,-key}-p1.png, pre-skill-check-L{,-key}-p2.png,
  lesson-{S,M,L}{,-key}-p{1,2,3}.png, card-1280/820/390.png, worksheet-1280.png, quiz-1280.png
- `after/b6/placevalue__compare/`: {independent, true-false, reason-it, error-analysis, guided}-{S,M,L}{,-key}-p1.png (band 999999)
- `after/mix/placevalue__compare/`: the same roles at S and L (lengths=mixed)
- `after/b99/placevalue__compare/`: {independent, reason-it, true-false}-{S,L}{,-key}-p1.png
- `after/close6/placevalue__compare/`: {independent, error-analysis}-{S,L}{,-key}-p1.png
- `{before,after,master}/b1/placevalue__{combine,expand,unit_form,value,identify}/guided-{S,M,L}{,-key}-p1.png`
- `{before,after}/b2/placevalue__identify/{review,test,pre-skill-check}-{S,M,L}{,-key}-p*.png`, quiz-1280.png
- `{before,after}/b3/composing__number_word_form/{scripted-model,guided}-{S,L}{,-key}-p1.png`, `{before,after}/b3-lesson/page-NN.png`
- Side-by-sides `sbs-*.png`; crops `crop-lesson-S.png`, `crop-sm-L.png`
