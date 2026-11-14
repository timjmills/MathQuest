# Critic: lf-ops "divarray r2" (last round under the cap)

- **Frozen tree:** /home/user/mq-critic-divarray, detached at a4d6d970e.
- **Critic:** independent, Opus medium.
- **Rubric:** design/audit/RUBRIC.md.
- **Rulings graded:** facts card §5.9 / §5.10 and the r2 rulings (signed 2026-11-13).
- **Scope:** print at M and L only; screen at 1366, 1280, 1024 and 820 only.
- **Renders:** all mine, in this folder.

## Verdict: FAIL

**r1's D1-D4 are gone.**
- D1: the × 0 frame is now the band frame.
- D2: Review touch now prints 16 (S is out of scope).
- D3: Test = Independent on every support.
- D4: one frame per band; no H13 band under a × array.

**div_facts passes on paper.** Every page type at M and L passes, in both the 12s and the 10s band, except one Scripted Model L overflow (D6).

**This round still has defects at 7 or below:**
- The mult_facts array support breaks three page types the card offers: Scripted Model, Fact probe and Opener M.
- The Guided hint contradicts the turned array.
- The div_facts online worksheet at 820 mixes two cell layouts.
- The mult_facts and add_facts online worksheets miss the brief's digit floor. Read Q1 before acting on this one.

**Lowest score: 5.** It occurs in two places:
- mult_facts array, Scripted Model M and L, both bands: C2 = 5 and C4 = 5. The array is shrunk to a pitch of about 1 mm (D1).
- mult_facts array, Fact probe M, 12s band: C3 = 5 (H5). Page 4 holds 2 of 20 facts and 55 % of it is empty (D2).

## Gates run (this tree, one at a time)

| Gate | Result |
|---|---|
| ws-screen-support-eq --skills mult_facts,div_facts | **OK**. The array dot ratio is paper 0.245 / 0.312 against screen 0.36-0.49. |
| ws-screen-slots --screen-digit --digit-widths 1366,1280,1024,820 (div / mult / add facts) | **8 misses.** mult_facts and add_facts online worksheet numerals are 40 px at every width (the brief wants 56 / 56 / 48 / 48). div_facts, every card and every quiz pass. 0 doubled answer areas. |
| ws-screen-ink-size (div / mult / add, every support) | **OK** (216 renders). No screen mark is smaller than print. |
| ws-print-lint --source kit --supports array, 11 roles, div + mult, M | **FAIL**, 27 findings. Opener PAGEFILL 27-37 %; mult Guided SCC-T10; Scripted Model WRAP-OP and AK-2; True or False AK-2; Reason It TOPSTART. |
| ws-print-lint, the same at L | **FAIL**, 23 findings. Also mult Fact probe PAGEFILL 33 % on p2. |

Note: print-lint ran on the default options. The div_facts array draws only on the 2-4 tables (dividends ≤ 50), so its div rows are mostly support-off.

## The brief's specific checks

| Check | Result |
|---|---|
| Every array of 2+ rows is landscape | **YES** on every page and host graded. ÷ draws divisor rows. × draws min(a, b) rows of max(a, b). n × n is square, as ruled. |
| Band frame consistent within a band | **YES** on paper and screen, except Scripted Model (D1), where the frame is miniaturised. |
| No support box looks like an answer slot | **YES on paper and worksheet**: the × 0 frame is the frame its neighbours draw. Nit N4 on the single-item card and quiz. |
| Captions honest | **YES** on every screen caption read, e.g. "1 row of 7, for 7 × 1", "0 rows of 4, for 4 × 0", "9 rows of 10" style. **NO in the printed Guided hint** (D3). |
| Nothing given away | **YES.** |
| Keys correct and equal to the pupil page | **YES** on every key graded: Independent, Test, Review, Guided, Mixed, True or False and Reason It, both bands. True or False leaves the True items' sentence blank; this was ruled (N5). |
| No clipping or overlap | **NO** on div_facts Scripted Model L, 10s band (D6). |
| Paper = screen | **YES** for the arrays (same frame, top-left, same caption). |
| M ≥ L where cells measure smaller | **NO** on two pages: mult Opener M (D4) and mult Mixed practice M (D5). mult array Independent M = L = 8 (N2). |
| Test = Independent | **YES** everywhere checked. div 12s band 15 / 10; div 10s band 12 / 8; mult 12s band 8 / 8; mult 2s band 12 / 10; touch 20 / 12; skip 12 / 12. |
| No lone item on a last page | **NO** on mult Fact probe M, 12s band (D2). |
| Screen dots never smaller than print | **YES.** Screen dots are 3.7-7.2 mm against print 2.42 mm (M). |
| Screen support labels ≥ text floor | **YES.** Skip-strip terms are 24-33 px. |
| Content starts at the top (CL-4b) | **YES** for fact cells. TOPSTART flags Reason It (shared). |
| H13 ≤ 33 % | **YES** on the fact cells. See D2 / D4 for the page-level strips. |

## Score table (C1 ease, C2 teaching, C3 spacing, C4 fidelity)

"sh" marks a shared page-type defect. The card ruling of 2026-10-31 says these do not gate the fact family (Scripted Model, lesson Steps, Pre-skill check, Reason It, Guided H13, Opener cue). They are listed with their score, but they do not decide the verdict.

### div_facts, support = array

12s band: tables 2-4 to 144. 10s band: tables 2-5 to 100.

| Page type | M | L |
|---|---|---|
| Independent + key (both bands) | 9 9 8 9 | 9 9 8 9 |
| More practice + key | 9 9 8 9 | 9 9 8 9 |
| Test + key | 9 9 8 9 | 9 9 8 9 |
| Review + key (N3) | 8 8 8 9 | 8 8 8 9 |
| Guided + key | 9 9 8 9 | 9 9 8 9 |
| Scripted Model, 12s band | 8 8 8 8 | 8 8 8 8 |
| Scripted Model, 10s band | 8 8 7sh 8 | **7 8 6 8** (D6) |
| Mixed practice + key | 9 9 8 9 | 9 9 8 9 |
| Opener + key | 8 8 8 8 | 8 8 8 8 |
| True or False / Reason It + key | 8 8 8 8 | 8 8 8 8 (Reason It TOPSTART: sh) |
| Fact rows / Fact probe (no array drawn) | 8 8 8 8 | 8 8 8 8 |
| Word problems / Stretch / Pre-skill check / Lesson | 8 8 8 8; Pre-skill check 7sh (4 items) | same |

| Screen host | 1366 | 1280 | 1024 | 820 |
|---|---|---|---|---|
| Practice card | 9 9 8 9 | 9 9 8 9 | 9 9 8 9 | 9 9 8 9 |
| Online worksheet | 9 9 8 9 | 9 9 8 9 | 9 9 8 9 | **7 9 7 9** (D7) |
| Quiz | 9 9 8 9 | 9 9 8 9 | 9 9 8 9 | 9 9 8 9 |

### mult_facts, support = array, 12s band (12 × 12 frame)

| Page type | M | L |
|---|---|---|
| Independent + key | 8 8 8 8 (N2: M = L = 8) | 8 8 8 8 |
| More practice + key | 8 8 8 8 | 8 8 8 8 |
| Test + key (8 = Independent) | 8 8 8 8 | 8 8 8 8 |
| Review + key (6 + 3) | 8 8 8 8 | 8 8 8 8 |
| Guided + key | 8 **7** 8 8 (D3) | 8 **7** 8 8 (D3) |
| Scripted Model + key | **6 5 7 5** (D1) | **6 5 7 5** (D1) |
| Mixed practice + key | 8 8 **7** 8 (D5) | 8 8 8 8 |
| Opener + key | 8 **7 6** 8 (D4) | 8 8 8 8 |
| Fact probe + key | 8 **7 5** 8 (D2) | 8 **7 6** 8 (D2) |
| True or False / Reason It + key | 8 8 8 8 | 8 8 8 8 |
| Fact rows / Word problems / Stretch / Lesson (no array) | 8 8 8 8 | 8 8 8 8 |

### mult_facts, support = array, 2s band (2 × 12 frame)

| Page type | M | L |
|---|---|---|
| Independent + key (12 / 10) | 8 8 8 8 | 8 8 8 8 |
| Test + key (12 / 10) | 8 8 8 8 | 8 8 8 8 |
| Review / More practice / Mixed / Opener + key | 8 8 8 8 | 8 8 8 8 |
| Guided + key ("4 × 2 is 4 groups of 2" under 2 rows of 4) | 8 **7** 8 8 (D3) | 8 **7** 8 8 |
| Scripted Model + key | **6 5 7 5** (D1) | **6 5 7 5** (D1) |
| Fact probe + key (12 + 8) | 8 8 **7** 8 (D2) | 8 8 8 8 |
| True or False / Reason It | 8 8 8 8 | 8 8 8 8 |

### mult_facts array, screen (both bands)

| Host | 1366 | 1280 | 1024 | 820 |
|---|---|---|---|---|
| Practice card | 8 8 8 8 | 8 8 8 8 | 8 8 8 8 | 8 8 8 8 |
| Online worksheet | 8 8 **7** 8 (D8) | 8 8 **7** 8 | 8 8 **7** 8 | 8 8 **7** 8 |
| Quiz | 8 8 8 8 (N4) | 8 8 8 8 | 8 8 8 8 | 8 8 8 8 |

### mult_facts touch / skip

| Version | Score |
|---|---|
| Print: Independent / Test / More practice / Review / Guided / Mixed, M and L | 8 8 8 8. Skip M = L (N2). |
| Print: Fact probe M, skip (12 + 8; p2 32 % empty) | 8 8 **7** 8 (D2) |
| Practice card, every width | 8 8 8 8 |
| Quiz, every width | 8 8 8 8 |
| Online worksheet, touch, every width | 8 8 **7** 8 (D8, D9) |
| Online worksheet, skip, every width | 8 8 **7** 8 (D8) |

### add_facts touch / tile / frame (screen size and labels only)

| Host | Score |
|---|---|
| Practice card, every width | 8 8 8 8 |
| Quiz, every width | 8 8 8 8 |
| Online worksheet, every width | 8 8 **7** 8 (D8) |

## Defects

### D1 (critical): mult_facts Scripted Model draws the array miniaturised

- **Scores:** C2 5, C4 5, C1 6.
- **Where:**
  - mult144/…/scripted-model-M-p1.png and -p2, and -L the same: every cell, e.g. "8 × 10".
  - mult2/…/scripted-model-M-p1.png and -L.
  - Zoom: view/crop-m144-sm-M.png, view/zoom-sm-array.png.
- **What:** the band frame (12 × 12, or 2 × 12) is squeezed into a slot about 12.7 mm wide.
  - The dot pitch is about 1.0 mm and the dots about 0.5 mm, against 3.2 mm pitch / 2.42 mm dots on the Independent page.
  - That is below RP-81's 1.5 mm minimum pitch.
  - The 8 rows of 10 cannot be counted, so the model's "8 groups of 10 / count by 10" step has no usable picture.
- **The rulings it breaks:**
  - "never smaller than the print dot"
  - "content never shrinks to fit"
  - "frame sized from the page's size"
- **div_facts is not affected:** its Scripted Model arrays print at full size.
- **Fix:** in the Scripted Model composer (`sheet/roles/scripted-model.js` with the `fact.js` array path), give the × array cell the band frame's declared size. Either put the frame under the stack at full width, as the Guided cells do, or drop to one example per page. Never pass a max-width that scales the svg.
- **Check:** PRINT-NO-SHRINK (the lane's own proposal). For every kit support svg on every role, rendered width = declared mm within 2 %. Plus ARRAY-DOT-MIN on paper: every array dot is ≥ that size's Independent dot. Run it on scripted-model, opener, guided, true-false, reason-it and fact-probe, not only Independent.
- **Class:** SIZE-INK / content-shrunk.

### D2 (critical at M, 12s band): mult_facts Fact probe with the array support spills over 3-4 pages

- **Scores:** C3 5 (H5), C2 7.
- **Where:**
  - mult144 fact-probe-M: 6 / 6 / 6 / 2 facts per page; p4 is 55 % empty.
  - mult144 fact-probe-L: 8 / 6 / 6; p2 and p3 have 32 % empty strips (PAGEFILL 33 %).
  - mult2 fact-probe-M: 12 / 8, p2 32 % empty.
  - mult-skip fact-probe-M / L: 12 / 8, p2 32 % empty.
- **What:**
  - A fact probe is one page of 20 facts (WDS 12.1).
  - The div_facts probe in the same render draws no array and stays at 20 on one page.
  - The mult probe draws 12 × 12 frames, so it becomes a 4-page booklet with a near-lone last page, and the cell size changes between pages.
  - SCC-T10 also fires: the answer zone moves between cells.
- **Fix:** do one of these:
  - (a) the probe draws no picture support, as div_facts' probe does (a probe measures recall, so the support defeats it);
  - (b) rebalance the pages, e.g. 7 / 7 / 6, and keep each page's rows full.
- **Check:** L-DENSITY PAGEFILL and the PG-23 orphan run on fact-probe with supports (`--fill-roles` must include fact-probe). Add "no probe page under 50 % used".
- **Class:** SPACE / H5.

### D3 (major): the Guided worked hint contradicts the turned array

- **Score:** C2 7.
- **Where:**
  - mult144 guided-M-p1.png and -L, model cell 2: "10 × 9 is 10 groups of 9.", printed under an array of 9 rows of 10 (crop-m144-guided-M-model.png).
  - mult2 guided-M cell 3: "4 × 2 is 4 groups of 2.", printed under 2 rows of 4.
  - The Steps strip "Read 3 × 4 as 3 groups of 4" sits over every turned array (6 × 5 drawn 5 rows of 6) on Guided, Opener and Lesson.
- **What:**
  - Ruling §5.10: "the drawing's caption / Say names what is drawn honestly (3 rows of 7. 7 × 3 = 21. Turn it: 3 × 7.)".
  - The provider's workedSteps (`sheet/providers/multiplication.js:42-44`) always say "a groups of b". When a > b, the picture shows b rows of a.
  - A pupil who counts the groups gets 9 groups of 10 while the page says 10 groups of 9.
- **Fix:** when the array support is on, build the hint from the drawing:
  - "9 rows of 10, for 10 × 9", or the ruling's "Turn it" frame;
  - the Steps strip: "Count the rows. Count the dots in a row."
- **Check:** ARRAY-CAPTION on paper. Every printed jot or hint naming "N groups of M" or "N rows of M" in a cell with an array must match the drawn rows × columns.
- **Class:** H14-adjacent / CAPTION.

### D4 (major): mult_facts Opener M (12s band) has no Independent section and a 25 % empty foot

- **Scores:** C2 7, C3 6.
- **Where:** mult144 opener-M-p1.png (meta: "1 model, 3 guided, 0 independent"). PAGEFILL: 63 mm, 27 %.
- **What:**
  - The 12 × 12 frames are too tall for the "you do" section, so the opener loses it at M.
  - L keeps 2 independent items, so M < L.
  - The page has no Score.
- **Fix:** at M, put the frame beside the stack, as Independent M does, so the Independent rows fit; or drop to 2 guided items and keep 3 independent.
- **Check:** an opener page must hold ≥ 1 independent item, and Opener M count ≥ L count (ws-capacity-pin SIZE-ORDER on the opener with options).
- **Class:** SPACE / L1.

### D5 (major): mult_facts Mixed practice M (12s band) prints 6 against L 8

- **Score:** C3 7.
- **Where:** mult144 mixed-practice-M-p1.png: 2 shelves, a 14 % empty foot. L is 4 shelves of 8.
- **What:** at M the frame drops under the fact, so each shelf is twice as tall. M < L breaks "M ≥ L where cells measure smaller".
- **Fix:** keep the frame beside at M (the M Independent page fits it beside at 2 columns), or measure the shelf height with the frame beside.
- **Check:** SIZE-ORDER on mixed-practice with `{support:[array]}`.
- **Class:** L1.

### D6 (major): div_facts Scripted Model L (10s band) clips the trace jots into the cell rule

- **Scores:** C3 6, C1 7.
- **Where:** div100 scripted-model-L-p1 and -p2, cells 3-4 (crop-div100-sm-L-p2.png). meta: 16 overflow problems ("mq-mjots ws-trace leaves the cell").
- **What:** the 5-row frame at the L pitch of 4.4 mm pushes the 3-line grey jot ("15 ÷ 3 / 3 × __ = 15 / 3 × 5 = 15") onto and past the cell's bottom rule, while 30 % of the page under the grid is empty.
- **Fix:** grow the Scripted Model rows to the measured content (there is room), or draw the L frame at its M pitch on this role.
- **Check:** ws-grade-render `--gate` overflow on scripted-model at L with supports. This already reports "OVERFLOW"; put it on precritic's path for `--role scripted-model --skill division:div_facts --supports array`.
- **Class:** OVERFLOW.

### D7 (major): the div_facts online worksheet at 820 mixes two cell layouts

- **Scores:** C1 7, C3 7.
- **Where:** screen/div144-worksheet-820-s5.png (view/div144-ws820-top.png, -bot.png) and -s11.
- **What:** with the 48 px floor in place:
  - Cards with a one-digit dividend put the answer line beside "=" (kit cell 212 or 255 px).
  - Cards with a two-digit dividend wrap the answer line under the equation (269 px).
  - So one sheet has three cell heights, the answer place moves between cards, and the short cells leave a 22 % band (4 ÷ 4, 3 ÷ 3, 8 ÷ 2).
- **Why it is this round's:** the digit floor commit 898f800d7. At 1366 / 1280 / 1024 every card is uniform.
- **Fix:** on one worksheet, choose one answer placement for all cards (the wrap, if any card needs it), as SCREEN-SUPPORT-PLACE does for the support.
- **Check:** SCREEN-ANSWER-PLACE in ws-screen-support-eq. On one worksheet, every card's input / answer line sits in the same place relative to its equation, and the kit cell heights are equal within 5 %.
- **Class:** LAYOUT-CONSISTENCY.

### D8 (major; see Q1): mult_facts and add_facts online worksheet digits miss the brief's floor

- **Score:** C3 7.
- **Where:** ws-screen-slots: mult_facts and add_facts worksheet numerals are 40 px at 1366 / 1280 (want ≥ 56) and at 1024 / 820 (want ≥ 48). It holds for every support (array, touch, skip, tile, frame).
- **What:** only div_facts got the floor (898f800d7). A teacher sees the ÷ worksheet at 56 px and the × / + worksheets at 40 px.
- **Fix:** apply the same host floor in `worksheet.js` to mult_facts and add_facts (sub_facts too).
- **Check:** ws-screen-slots `--screen-digit --digit-widths 1366,1280,1024,820` with `--rule-skills` for all four fact skills, on precritic's path.
- **Class:** SIZE.

### D9 (major): the mult_facts touch worksheet shrinks two-digit facts

- **Score:** C3 7.
- **Where:** screen/multtouch-worksheet-1280-s11.png (view/mt-ws1280.png), cards 1 "11 × 10" and 12 "11 × 12".
- **What:**
  - A fact with no touch dots is drawn at a 29 px digit with no caption, beside 40 px neighbours; its card is 21 % empty.
  - One sheet holds two card types, and the content shrinks.
  - Probably pre-existing; not checked on master.
- **Fix:** draw every card of the sheet at one digit size whether or not it carries dots.
- **Check:** ws-screen-slots `--uniform` (one digit size per worksheet) on mult_facts `{support:[touch]}`.
- **Class:** LAYOUT-CONSISTENCY.

### Minor (lint-found, cost 0-1, not decisive)

- **L-SUPPORT SCC-T10, mult Guided M / L:** the answer zone moves 26.7 → 31.2 mm between cells. The model cells carry a hint line. Align the rule.

## Nits and notes (no score effect)

- **N1 (lead observation):** the 12 × 12 band frame makes a 2 × 3 array a corner of a large empty square. On the practice card it adds about 270 px, and at 1280 × 900 the Check button sits below the fold (the plain card's Check is also below the fold there, at 939 > 900). This is the ruled design, so it is not scored.
- **N2:** mult array Independent / More practice / Test print the same 8 at M and L, and skip prints 12 at both. The L dot pitch is only 3 % above M (3.3 against 3.2 mm), so L's array is not larger. M ≥ L holds.
- **N3:** the div_facts Review "Mixed Review" is "count by 12" strips on a "dividing by 2-4" page; the 10s-band Review L totals 7. Carried from r1; not this lane's.
- **N4:** on the single-item quiz and card, the × 0 frame (474 × 85 px, empty, beside the stack) has no neighbours on screen. It is clearly not the blue input, but a pupil sees a large empty box.
- **N5:** print-lint L-KEY AK-2 on True or False keys (3 of 18 blank) is a ruled design: lf-roles r4 R5 leaves the True items' key frame empty. The lint and the instruction "Finish the sentence." disagree with it, so the page-types lane should align the lint or the instruction.
- **N6 (shared, not gating):**
  - Scripted Model pages have a 28-31 % empty foot.
  - Pre-skill check holds 4 items on about 30 % of the page.
  - Reason It fails TOPSTART.
  - Lesson anchor pages have a large empty foot.

## Questions for the lead

- **Q1:** LEAD_DECISIONS 2026-11-13 sets the online worksheet digit floor at 29 px, with a passed raise pinned as a ratchet. This brief sets 56 / 48 for the worksheet. I graded D8 by the brief. If the floor for mult_facts and add_facts is 29, D8 drops to a nit, and the verdict is still FAIL on D1-D7.

## PNGs graded

All under /tmp/claude-0/-home-user-MathQuest/447a1d04-e24b-5c13-8aba-a33c056c9d3a/scratchpad/critic-divarray-r2/.

**Print (each role -M-p1 / -L-p1 plus -key-p1; multi-page roles -p2…):**
- div144/division__div_facts/: 16 roles × M / L (76 pages).
- div100/division__div_facts/: 11 roles × M / L (48).
- mult144/multiplication__mult_facts/: 16 roles × M / L (86).
- mult2/multiplication__mult_facts/: 16 roles × M / L (80).
- mult-touch/ and mult-skip/multiplication__mult_facts/: independent, more-practice, test, review, guided, mixed-practice and fact-probe at M / L.

**Contact sheets read:** view/*.png, including:
- view/div144-{test,review,guided,mixed-practice}-{M,L}.png
- view/div144-misc{1,2,3}.png, view/div144-lesson.png
- view/m144-{independent,test,review}-{M,L}.png
- view/m144-set{1..4}.png, view/m144-probeL.png, view/m144-tf-M.png
- view/m2-*.png, view/div100-*.png
- view/touch-print.png, view/skip-print.png
- view/crop-*.png, view/zoom-*.png

**Screen (screen/):**
- div144-, mult144-, mult2-: card-{1366,1280,1024,820}-<item>.png, worksheet-{1366,1280,1024,820}-s{11,5}.png, quiz-{1366,1280,1024,820}-{1..4}.png.
- multtouch-, multskip-, addtouch-, addtile-, addframe-: card / worksheet / quiz at the four widths.
- fold-*.png.

**Logs:** log-*.txt, covering the renders, screens, support-eq, slots, ink-size and lint-array-{M,L}.

**Harness:** tools/screens.cjs, tools/fold.cjs.
