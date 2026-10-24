# Critic r1: SU-C pilot (six no-regroup subtraction skills and the `sub_2d_1d` preset)

Critic: independent, mq-opus-medium. Round 1, 2026-10-23. Branch `claude/sweet-newton-c8wrv1-wip-pilot-su-c` at b3948d8.
Read before grading: RUBRIC (in full), LESSONS_LEARNED, WDS §10 / §12 / §14 / §15, the signed card `design/cards/subtraction/subtraction.md`, and the benchmark `answer-key-options/r2/independent-sub_100_regroup-copy-end-p2.png`. I did not edit any source file.

## Verdict: FAIL

Every skill has at least one criterion below 8 on several page types. Six defects are ours and come from one cause each, so they repeat across pages:

- **D1 (C2).** The 2-digit skills fill the page with zero cases.
- **D2 (C2, C4).** The default page prints no place-value heads.
- **D3 (C1, at S).** The answer boxes are 4.06 mm wide.
- **D4 (C2, H3).** The lessons have no lesson data, so the Warm-up deals regrouping items.
- **D5 (C1, from 4 digits).** On screen the ones box is not focused first, and the across equation replaces "Subtract.". At 390 px the 6-digit cell is clipped.
- **D6 (C2 H3, C4 H4).** The option panel offers the legacy band option, which routes to the legacy cell.

**Pair status.** The stack × single pair is **not certified**. There is no stack golden or certificate in `design/audit/golden/`, and no stack pass is recorded in STATUS. So no page inherits a score. Every score below was graded directly: in full for S and L, and as a spot check for M. Following the lead's Q-S4 process, I batch-read every page for C1 and C2. Pages fell below 8 in round 1. RUBRIC says the instance is then graded in full on every page. The defects are systematic (one generator, one provider, one cell), so the per-version scores apply to every page of that version. Each defect is located on named PNGs.

## Score table (minimum per criterion, over every graded version)

| Skill | C1 | C2 | C3 | C4 | Worst versions |
|---|---|---|---|---|---|
| sub_50_no_regroup | 7 | 4 | 6 | 5 | lesson C2 4 (H3); option panel C2 4 / C4 5; practice at S C1 7; every practice page C2 6 |
| sub_100_no_regroup | 7 | 4 | 6 | 5 | same as sub_50 |
| sub_1k_no_regroup | 7 | 4 | 6 | 5 | lesson C2 4; panel; practice C2 7 (no heads) |
| sub_10k_no_regroup | 6 | 4 | 6 | 5 | screen hosts C1 6 (focus), C4 7; lesson; panel |
| sub_100k_no_regroup | 4 | 4 | 6 | 5 | panel C1 4 (heads overlap with heads on, H2); screens C1 6 |
| sub_1m_no_regroup | 4 | 4 | 6 | 5 | card-390 C1 5 (H6), C3 6; panel C1 4 (H2); side anchors at L C3 6 |
| sub_2d_1d (preset) | 7 | 4 | 6 | 5 | lesson C2 4 (Warm-up is word problems); practice C2 6 |

Per version (all seven skills unless the row says otherwise):

| Version | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Independent, More practice, Test (+ keys) at S | 7 | 6 (2-digit) / 7 | 8 | 7 |
| The same at L, and M (spot check) | 8 | 6 / 7 | 8 | 7 |
| Mixed practice (single skill) at S / M | 8 | 6 / 7 | 8 | 7 |
| Mixed practice at L, 2-digit skills | 8 | 6 | 6 (H13, engine class d) | 7 |
| Lesson packet (+ key) | 7 at S / 8 | 4 (H3) | 6 (H13, engine class a) | 7 |
| card-1280 / 820 / 390, worksheet-1280, quiz-1280, up to 3 digits | 8 | 6 / 7 | 8 | 8 |
| The same hosts from 4 digits | 6 | 7 | 8 | 7 |
| card-390, sub_1m | 5 (H6) | 7 | 6 | 7 |
| Option panel | 8, or 4 at 5-6 digits (H2) | 4 (H3) | 8 | 5 (H4) |

What is right, and stays as it is:

- No item regroups: 0 of 1,920 probe items.
- Minuends sit in the bands the card set: 21-50, 51-99, 100-999 up to 100,000-999,999.
- The box count equals the band's digit count on every item, so it never gives away the answer length.
- Commas print from 5 digits, in a fixed gap that is not a box.
- Keys are correct and reddish-orange (INK-31). They leave leading boxes blank and never write a leading 0.
- No "borrow" wording anywhere.
- The Say line is correct, and the steps go ones first, then each place to the left.
- Up to 3 digits, the ones box is focused first on screen.
- `lengths: shorter` and `zeros: on` keep their promises (probe), and their pages pass print-lint.
- At L, 6-digit items take 2 columns × 3 rows and fit without shrinking.

## Defects (ours)

**D1 · C2 major (−2) · NAME_CONTENT · zero cases flood the 2-digit pages.**
- Where: `sub_50`, `sub_100` and `sub_2d_1d`, on every practice page at every size, the worksheet and the card. Example: `render-S/subtraction__sub_50_no_regroup/independent-p1.png`.
- Observed: 19 of 25 items are a column that leaves 0 or an answer shorter than the minuend. Five items answer 1: 33−32, 32−31, 25−24, 23−22, 24−23. A probe of 120 seeded items found zero cases in 66 of 120 (`sub_50`), 60 of 120 (`sub_100`) and 39 of 120 (`sub_2d_1d`). The worksheet host deals 5 of 6.
- Expected: card §9.4 says within 50 and within 100 "never seed it". Card §2 says zero cases are their own section.
- Cause: in the small branch of `_subNoRegroupPair` (`gen-operations.js`), the bottom digit is `rng(min(1,v), v)`, so the bottom digit equals the top digit with probability 1/v. The top tens are 2-4 for within 50, so this happens a lot.
- Fix: deal each bottom digit as `rng(1, v−1)` when v ≥ 2 (as the 3-digit-and-up branch already does). Allow a 0 ones only under a top 0, and in at most 1 item in 10.
- Check: an options-verify / content-audit predicate that zero cases are at most 10 % of 120 items when `zeros` is off, for all six skills.
- Machine check: none exists. It should have been caught (L4 / L10 family).

**D2 · C2 major (−1), C4 (−1) · VISUAL_DESIGN · no place heads on the default page.**
- Where: every role, every size and every host at support level 1, which is the default.
- Observed: heads appear only at level 2 or higher (`gen-operations.js`, subNoRegroupKit branch: `heads: lvl >= 2`).
- Expected:
  - WDS VA-30 makes heads the default.
  - VA-32 makes them a structural scaffold that leaves a ladder only through a dedicated fade step.
  - Card §2 (steps 1, 4, 6-8) promises T O … HTh heads.
  - Card §9.1 says the move "closes D2 and D5". It does not on the default page.
- Fix: `heads: lvl >= 1`. Add level 0 (or a heads option) as the fade step.
- Check: on a default ws-grade-render page, every cell has a heads row.
- Machine check: none. It should exist, as an options-verify "default page shows structural scaffold" check.

**D3 · C1 major (−1 at S), C4 minor · SLOT · answer boxes too narrow at S; key digits touch the dividers.**
- Where: every I Can page at S. Example: `render-S/.../sub_50_no_regroup/independent-key-p1.png`, crop measured at 4.0 mm per segment.
- Observed: a segment is one 0.72 em track, 4.06 mm wide. TY-21: "a pupil cannot write in a box narrower than about 4.4 mm". The key's Andika 700 digits fill the segment edge to edge at S, M and L. Look at "54" in `render-L/.../sub_100_no_regroup/test-key-p1.png`. The benchmark key has free space around each digit.
- Fix: `sheet/cells/stack.js`. When `answer === 'boxes'`, use the 0.95 em track (the "wide" class), and count it in `footprint()`.
- Check: a new print-lint L-ANSAREA rule, "answer-strip segment ≥ 4.4 mm".
- Machine check: none measures this. It should.

**D4 · C2 critical (H3, cap 4) · NAME_CONTENT + INSTRUCTION · the lessons have no lesson data.**
- Where: `lesson-p2` and its key, all seven skills, S/M/L. The meta note says "No lesson data for this skill yet".
- Observed, Warm-up: on a page titled "(no regrouping)", the Warm-up falls back to `earlierSkills` and deals regrouping items. Examples:
  - `sub_100`: 32−9, 31−4, 23−8, 41−34; the key shows crossings and regroup boxes.
  - `sub_10k`: 250−83, 757−698.
  - `sub_1m`: 52387−47882, printed with no comma.
  - `sub_2d_1d`: two word problems with bar models.
- Observed, Guided: the "Steps:" box prints the anchor example's numbers beside different Guided items (L6). For example, it shows 75 − 11 beside 72−22, 85−23 and 87−62.
- Observed, anchor: the anchor example is picked with no case test, so it is a zero case (`sub_50`: 31−11; `sub_2d_1d`: 74−4). It has no heads and no H T O legend (VA-31).
- Fix: in `js/modules/lessons/prereqs.js`, add a LESSONS entry for each skill, modelled on `sub_100_regroup`:
  - `skills`: the rung below.
  - `steps`: four generic steps.
  - `example.test`: excludes zero cases.
  - `distinctAnswer` and `maxSmall: 1`.
- Check: content-audit run over the lesson Warm-up items, and the L6 instruction-follows-item check.
- Machine check: none caught it. ws-content-audit does not read lesson Warm-ups.

**D5 · C1 major (−2), C4 (−1); card-390 critical (H6) · INTERACTION / SCREEN_PARITY / VIEWPORT · from 4 digits, the screen hosts break.**
- Where: `card-*`, `worksheet-1280` and `quiz-1280` for `sub_10k`, `sub_100k` and `sub_1m`.
- Observed:
  - The first focused box is the leftmost one, not the ones box (SP-20, SCC-T15).
  - The across equation ("4,367 − 2,244 = ?") prints above the stack instead of "Subtract.". This breaks SP-4, and the problem shows twice.
  - At 390 px the 6-digit stack is clipped: the ones column, the rule and the ones box are cut at the cell edge (`card-390.png`).
- Root cause: in `screen-cell.js`, `binaryParts()` matches `\d{1,7}`, which rejects comma-formatted text. `cellKindFor` then returns null and the generic twin draws the item.
- Engine status: the instruction fault also reproduces on approved `sub_10k_regroup`, `sub_1m_regroup` and `add_10k_regroup`, which show a legacy card. Focus and clipping are ours: the siblings focus the ones box and fit at 390.
- Fix: strip thousands commas in `binaryParts()`. Then `stackHTML` draws the cell, with ones-first focus, the "Subtract." line, and the separators counted in the fit.
- Check: a focus probe confirms `activeElement` is `ans-0` on every host, and ws-chromebook-fit / ws-screen-slots confirm every input is inside its cell at 390.
- Machine check: should have been caught by ws-screen-slots / ws-chromebook-fit. Report why it was not.

**D6 · C2 critical (H3), C4 critical (H4) · NAME_CONTENT · the option panel offers the band option.**
- Where: the option panel of all six skills and the preset.
- Observed: "Numbers to" (`band`) is offered; on `sub_1m` it runs 10 … 1,000,000.
  - band 10 or 20 sends 120 of 120 items to the legacy `column-sub` visual, set in JetBrains Mono, with no kit cell.
  - band 100 on "Subtract within 1,000,000" deals 2-digit items.
- Expected: card §7 says the six skills are the number-size ladder.
- Fix: in the P11 loop of `skill-options.js`, drop `band` for subtraction no-regroup skills, or clamp it to the skill's own band.
- Check: an options-verify predicate that every offered value deals kit stack items inside the skill's band.
- Machine check: ws-options-verify should have caught it (OC3).

**D7 · C1 critical (H2, cap 4) · CLIP_OVERLAP · heads collide at 5-6 digits.**
- Where: `sub_100k` and `sub_1m` with heads on (level 2 or 3) at S and L. See `render-opts-S/subtraction__sub_1m_no_regroup/independent-key-p1.png` and `render-opts-L/.../independent-p1.png`.
- Observed: "HTh TTh Th" overlap into one illegible run over 0.72 em tracks. Once D2 is fixed, this lands on the default page.
- Fix: in `stack.js`, use the 0.95 em track when heads are on at 5 digits or more. Never shrink the letters.
- Check: a print-lint overlap rule on `.head` bounding boxes.
- Machine check: none caught it. It should.

**D8 · C2 major (−1) · PEDAGOGY · the `sub_2d_1d` preset deals a narrow, repetitive set.**
- Observed:
  - Minuends run 51-99 only.
  - The bottom number is 1 on about 31 % of items (6 of 12 on the L test).
  - The instruction reads "Solve. Write the answer." where the host says "Subtract.".
  - The Mixed practice section heading reads "Practice".
- Fix:
  - Deal the bottom digit first, uniform 1-9.
  - Let the preset reach minuends 11-99, or record the 51-99 limit on the card.
  - Make the preset use the provider's `subtract` instruction key.
- Check: in the probe, b = 1 on at most 15 % of items, and the instruction is "Subtract." on every role.

**D9 · C2 minor · KEY · `wrongAnswer` faults.**
- Observed:
  - The "added" wrong answer can be longer than the strip: 9752 − 6231 gives 15983, which needs 5 boxes in a strip of 4.
  - "dropped-zero" fires on a trailing 0 and then says "a 0 inside the answer": 420 − 110 gives 31.
- Fix: in `providers/subtraction.js` `noRegroupWrongs`, drop any wrong answer longer than the minuend, and test only `D.slice(1, −1)` for an inside 0.
- Check: providers-unit.

**D10 · C2 minor · PEDAGOGY · worked steps too thin from 4 digits.**
- Observed:
  - From 4 digits, step 3 is "Hundreds to hundred thousands, the same way." It gives no sums at 5-6 digits and rings no digit, so four of the six columns are never modelled.
  - At 2 digits there are 3 steps, where the brief expected 4.
  - The anchor answer prints without its comma ("125 414"), while the key prints "681,324".
- Fix:
  - In `columnSubNoRegroup`, step 3 rings and states the hundreds column.
  - In the `stack.js` trackInk path, write the separator comma.

**D11 · C2 minor · UNTRUE_TEXT · the zeros label promises items it never deals.**
- Observed: the label lists "47 − 47" and "58 − 30". The generator never deals n − n (it requires b < a), and the option applies only from 3 digits.
- Fix: relabel the option in `_subZeros`.

**D12 · C3 critical (H13) · SPACE · `sub_1m` side anchors at L.**
- Observed: `--anchors side` at L gives 4 H13 findings.
- Not engine class (a): approved `add_1k_regroup` and `sub_1m_regroup` print clean at L.
- Fix: in `sheet/anchors.js`, measure the width of a 6-digit stack with its separators.

## Engine-class rulings (lead's pins)

- **(a) H13 "content pinned to one side" when columns are forced to 2 — CONFIRMED as engine.**
  - `--columns 2` at S: `add_1k_regroup` ×16 and `sub_1k_regroup` ×16, against ours at ×20.
  - Side anchors at S: `add_1k_regroup` H13 ×6, against ours `sub_10k` ×6.
  - The Lesson Practice page (6 items, 2 columns) reproduces visually on `sub_1k_regroup` lesson-p3 at S, so it is the same class.
  - **REJECTED for `sub_1m` side anchors at L** (D12): no approved sibling reproduces it at that row and size.
- **(b) TY-11 7 pt step numbers in anchors (`anchors.js` lineHtml) — CONFIRMED.** With `--anchors side` at S: `add_10k_regroup` L-SIZE TY-11 ×28 and `add_1k_regroup` ×22, against ours `sub_10k` ×24. It did not fire at L.
- **(c) fact-rows ILLEGIBLE / PG-12 — CONFIRMED.**
  - `sub_100k_regroup`: ILLEGIBLE ×198, PG-12 ×128.
  - `sub_1m_regroup`: ILLEGIBLE ×224, PG-12 ×128.
  - Ours: ILLEGIBLE ×272 and ×224, PG-12 ×128 and ×128.
- **(d) sections / mixed composer — CONFIRMED.**
  - Sections with `algebra:tape_diagram` at S: PG-12 ×8 on ours and ×8 on `sub_1k_regroup`.
  - Mixed practice at L: H13 on ours `sub_100` ×16, reproduced on `sub_100_regroup` ×12.
- **New engine finding (e): the screen instruction swap from 4 digits.** `binaryParts` rejects comma text; this reproduces on `sub_10k_regroup`, `sub_1m_regroup` and `add_10k_regroup`. The focus and clipping parts are ours (D5).
- **New note: lessons without LESSONS data use an uncertified fallback.** The `sub_1k_regroup` fallback lesson is also flawed: its Steps box is empty and its Warm-up regroups. Lesson pages with no data are outside any certificate.

## Pages graded in full vs batch-read

**Graded in full** (looked at every cell at full scale or as a zoomed crop):

S:
- `sub_50`: independent, independent key, lesson p1-p3, mixed-practice, test, card-1280, card-390, worksheet-1280, quiz-1280.
- `sub_1m`: independent key, mixed-practice (crops), card-390 (crop), card-820, worksheet-1280, quiz-1280.
- `sub_1k`: independent key.
- `sub_100k`: independent.
- `sub_2d_1d`: independent key.
- `sub_10k`: lesson p1.
- card-390 for `sub_1k`, `sub_10k`, `sub_100k`, `sub_100` and `sub_2d_1d`.

L:
- `sub_50`: independent, independent key.
- `sub_1m`: independent, independent key, lesson p1-p3.
- `sub_100`: test, test key, lesson p2, lesson key p2.
- `sub_100k`: more-practice key.
- `sub_2d_1d`: lesson p1.
- `sub_1k`: mixed-practice and its key.

M (spot check): `sub_50` independent key, `sub_1k` mixed-practice, `sub_10k` lesson p2.

Options:
- `render-opts-S`: `sub_1m` independent key with `zeros: on` at level 2.
- `render-opts-L`: `sub_1m` independent at level 2.
- Print-lint: `lengths: shorter` and `zeros: on`.

That is about 50 pages, more than 1 page in 5 of the S and L pages.

**Batch-read for C1 and C2** (contact sheets of all 14 pupil and key pages per skill per size):
- S, all seven skills.
- L: `sub_1k` and `sub_2d_1d`.
- M: the S/M/L pages above, plus the M renders listed under `render-M/`.
- Machine reads: print-lint over all seven skills × 5 roles at S and L, and the 1,920-item content probe.

## Files

- `grades.jsonl`: one object per skill, versions per page, host and size, with defects.
- `render-S/`, `render-L/`, `render-M/`, `render-opts-S/`, `render-opts-L/`: the renders I graded.
