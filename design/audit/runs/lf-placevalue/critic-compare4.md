# lf-placevalue critic compare r4: the narrow re-grade of N9 (`placevalue:compare` lesson, scripted-model, guided)

Independent critic (Opus medium). I graded only and changed no code. Tree: `claude/lf-placevalue-w2` at 53fe8c24 (the brief commit on
top of 1c08b6bc; fixes 1ee84d71 and 7fdfd0f4). Sizes: M and L only (print size S is dropped). No 390 px.

**Renders.** Every browser command ran one at a time through `mq-browser-run.sh`. Each run was
`ws-grade-render --skills placevalue:compare --roles lesson,scripted-model,guided --size M,L --no-screen --gate`, and every run printed
`ws-grade-render: OK` (no overflow on any role page or key):
- band=999999: `--opts '{"band":999999}'` (32 pages);
- closeness=close + band 999999: `--opts '{"band":999999,"closeness":"close"}'` (32 pages);
- band=9999: `--opts '{"band":9999}'` (24 pages);
- the default (20 pages).

**Machine check:** `ws-pv-compare-pages --only WRAP-SIGN` (scripted-model, guided and lesson at M and L, under the default, band 9999,
band 999999 and close): `OK`.

**Process note.** `ws-grade-render.cjs` has no `--help` handler: `--help` starts a default full render. I stopped it after about 2.5
minutes, and it wrote nothing into the repo. The flags are documented in the file's header comment.

## N9: FIXED

- **band=999999, L p1, step 3** (`b6/placevalue__compare/lesson-L-p1.png`): "Write" / "501,765 > 179,619." The relation is one
  unit on one line. The only break is before it, after "Write", which is an allowed break.
- **close + 999999, M p1, step 3** (`close6/placevalue__compare/lesson-M-p1.png`): "Write" / "322,389 < 329,757." Same result.
- **The keys of both pages** match the pupil pages.
- **The step-strip heading** "Write <, > or =." breaks only after "Write" ("Write" / "<, > or =."). The sign list stays together.
- **What changed against r3:** pixel-diffed against the r3 renders, only the step-3 text panel of p1 differs (bbox x 496-705,
  y 722-894). Every other page at b6 / close6 is byte-identical to r3.
- **Scripted model and guided** at every band put the relation on one line:
  - "Write 434,359 < 806,848." and "Write 247,194 < 247,600." on the scripted model;
  - "The ones digits differ: 1 < 3." as the Guided cue.

## The overflow risk of the fix: none

I measured the widest case, "Write 999,999 > 999,999.", against its panel.
- **Width.** Andika's digits are tabular. Measured in Chrome at 100 px, every 6-digit relation is the same width:
  "501,765 > 179,619.", "999,999 > 999,999.", "999,999 = 999,999." and "888,888 > 888,888." all measure 910.2 px. So the rendered
  "501,765 > 179,619." line is the widest case exactly.
- **Space at M (96 dpi).** That line's ink runs from x=497 to x=675 (179 px). The panel's right rule is at x=746, so it clears the rule
  by 71 px (18.8 mm). L renders the lesson anchor at the same geometry, with the same numbers.
- **The whole sentence.** "Write" + the unit does not fit on one line, so the line breaks once, after "Write", and nothing overflows. The
  `--gate` overflow probe agrees on all 108 pages.

## New findings

None.
- The "Write" / relation break is the intended break point, not a defect.
- N10 (box grazes its own digit at L, minor, C4 8), N11 (lesson L p2 Guided pad 3.2 mm, minor, C3 8) and N12 (b6 lesson L pagination,
  E) stand unchanged: their pages are byte-identical to r3.

## Regression check against r3

- **Default:** all 20 pages (lesson p1-p3 with keys, scripted-model, guided, at M and L) are byte-identical to r3's renders.
- **band 999999 and close:** only the two N9 p1 panels changed (above).
- **band 9999** (not rendered in r3) is clean:
  - **lesson anchor:** 3,668 > 3,629, decided at the tens. Its key and Say line are right.
  - **Guided Model:** 3,068 < 8,675. The cue reads "The tens digits differ: 3 < 5."
  - **SM Model:** 4,343 < 6,970.
  - **"=" share:** 1 of 20 on the practice pages, never item 1.
  - **Keys:** right on every item I read.
- **Keys I read in full:**
  - b6 lesson L/M: all 20 practice items, Guided and Independent;
  - close6 lesson L/M: all 20 practice items, Guided and Independent;
  - guided M/L at b6 and close6.
  Every one is right.

## Grade table: compare, M and L (C1-C2-C3-C4; `E` = ruled, not held)

| Version | M | L | Notes |
|---|---|---|---|
| lesson (3 p) + key, default | 8-8-8-8 | 8-8-8-8 | Byte-identical to r3. N11 minor at L. |
| scripted-model + key, default | 8-8-5E-8 | 8-8-5E-8 | Byte-identical to r3. Model 359 < 434. N10 minor at L. |
| guided + key, default | 8-8-6E-8 | 8-8-6E-8 | Byte-identical to r3. Model 308 < 986. |
| band=999999 lesson + key | 8-8-5E-**8** | 8-8-5E-**8** | **N9 fixed** (r3: C4 7). N12 pagination stays E. |
| band=999999 scripted-model, guided + key | 9-8-8-9 | 9-8-8-8 | Byte-identical to r3. |
| closeness=close (+999999) lesson + key | 8-8-5E-**8** | 8-8-5E-**8** | **N9 fixed** on the M anchor (r3: C4 7). |
| closeness=close (+999999) scripted-model, guided + key | 9-8-8-9 | 9-8-8-8 | Model 247,194 < 247,600 (M6 gets it wrong). Cue on one line. |
| band=9999 lesson + key | 8-8-8-8 | 8-8-8-8 | New this round. Anchor 3,668 > 3,629. Keys right. |
| band=9999 scripted-model, guided + key | 8-8-8-8 | 8-8-8-8 | Model 4,343 < 6,970. Guided cue "3 < 5." on one line. |

r3's grades stand for every other compare page and host. Below 8 there are only ruled `E` marks (C3 opener / scripted-model / guided
bands, N12 pagination).

**VERDICT: PASS**: `placevalue:compare` (N9 FIXED; no 7 anywhere; r3's grades stand for the other pages).

## Checks that would catch the class

`ws-pv-compare-pages` WRAP-SIGN now runs under the default, band 9999, band 999999 and close at M/L. It is OK, and it covers this
class. No new check is needed.

## PNGs graded

Root `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-compare4/`:
- `b6/placevalue__compare/`: `lesson-{M,L}{,-key}-p{1..6}.png`, `scripted-model-{M,L}{,-key}-p1.png`,
  `guided-{M,L}{,-key}-p1.png`;
- `close6/placevalue__compare/`: the same set;
- `b4/placevalue__compare/`: `lesson-{M,L}{,-key}-p{1..4}.png`, `scripted-model-*`, `guided-*`;
- `base/placevalue__compare/`: `lesson-{M,L}{,-key}-p{1..3}.png`, `scripted-model-*`, `guided-*`;
- contact sheets `cs-{b6,close6,b4,base}-{lesson-keys,sm-guided}.png`.

The measurement script is
`/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/c4tools/measure.cjs`.
