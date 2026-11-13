# lf-vocab: narrow critic r15 + r16 brief

You are the INDEPENDENT CRITIC of lane lf-vocab's rounds 15 and 16, on branch claude/lf-vocab-r16 (cut from deployed master
a3eb9d25). You did not build them. Step: a narrow critic (Opus medium). Do NOT edit any repo file. Write only
RENDERS_DIR/critic-r16-narrow.md.

## Read
- design/audit/RUBRIC.md (C1-C4, hard caps, screen-host rows).
- design/cards/vocabulary/vocabulary.md (the signed card).
- design/lanes/lf-vocab/critic-r14-narrow.md (its minors 1-3) and critic-r5.md (its "Nit" lines).
- design/status/lf-vocab.md, the r15 and r16 sections.

## What changed
- **r15 (critic r14 minors):**
  1. sequence is redrawn 4, 7, 10, and the Grade 4 first term [30], 26, 22 (V-ONES);
  2. the hundred chart key's focal part is its middle row, with underlays inside the cells (V-KEY);
  3. a repeated Match 3 trio takes a new picture order on the page (V-PAGE).
- **r16 (critic r5 nits):**
  1. the Match 3 letter sits at one anchor, the top-left of its picture (V-LETTER);
  2. the card-390 letter boxes sit in one column (V-BOX390);
  3. no Error Analysis page repeats a pupil name (V-NAMES);
  4. one caption size per picture row (V-CAPTION);
  5. guided pick3 write lines sit at one y in each row (V-GLINE);
  6. guided rows are equal (V18M);
  7. Match 3 review L stays inside its 50 mm footprint, and the r15 baseline pin is removed.

## Grade the renders in RENDERS_DIR
- hosts/: card-390/820/1280, worksheet-1280, quiz-1280 and independent keys. Check the letter anchor, the card-390 box
  column, the blue next box, and that wrong answers are red.
- answered/: right and wrong answers, with the explanations.
- roles/S and roles/L: independent, guided, error-analysis and review for both skills (with keys). Check the letter
  anchor, the caption sizes, the pupil names, the guided line y and row heights, and that the review L fits.
- sets/: every set changed since a3eb9d25 (sets 6 and 7), with manifest.json (all dealt banks, with marks). For each
  changed bank: could a pupil defend another of its words?
- r15/hundred-chart/: the hundred chart key.
- lesson/: the identify lesson's vocabulary band.
- pictures/pics-40.png: the library.

## Out of scope
- Print pages and sets that did not change since a3eb9d25, which passed critic r14.
- The 4 ruled SIZE-REF findings.
- The open ruling on Guided at L.

## Output
For each group give:
- C1-C4 (integers);
- the hard caps hit;
- the re-check of each r14 minor and r5 nit: FIXED, PARTLY fixed or PERSISTS;
- numbered defects, each with a fix and the automatic check that would catch it.

Verdict: PASS only if every criterion is >= 8 everywhere you graded.

Keep it under 1,000 words. In your final message, return the verdict, the minimum score and the defects.
