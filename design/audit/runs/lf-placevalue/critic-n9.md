# Critic N9: composing:number_word_form, the band-1000 thousand kind (narrow look)

Critic: independent, Opus medium. Tree `/home/user/mq-live1`, branch `claude/lf-placevalue-live2` at 80a6da65 (not pulled). Grade only.
Scope: N9 from `critic-live2.md`, where at band 1000 "one thousand" was dealt under the hundreds Steps with the hint
`"one thousand hundred": ___ in the hundreds.`.

## What was rendered (`ws-grade-render`, one browser run at a time, through `mq-browser-run.sh`)

Root `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-n9/`:
- `s913052/` Guided, band 1000, M and L, pupil and key, to_number and to_words, seed 913052 (the N9 seed).
- `default-to_number/`, `default-to_words/` Guided and Independent, band 1000, M and L, pupil and key, default seed (857619).
- `s2/` Opener, Lesson and Independent at M, band 1000, seed 913052, both ways. These are the pages that deal 1,000.

Gates: `ws-pv-words-pages` (8 seeds plus seed 913052; guided, opener, lesson and scripted-model; M and L; 11 deals) gave
**OK** on 1,496 sheets, 6,163 items and 282 hints. `ws-words-checks.mjs` (seed-free, every name from 0 to 1,000, 6,807
worked steps) gave **OK**. `ws-grade-render` reported no overflow problems on any page.

## Grades

| Page (band 1000) | Size | C1 Ease | C2 Teach | C3 Space | C4 Fidelity |
|---|---|---|---|---|---|
| Guided to_number, seed 913052, pupil + key | M | 9 | 9 | 8 | 9 |
| Guided to_number, seed 913052, pupil + key | L | 9 | 9 | 8 | 9 |
| Guided to_words, seed 913052, pupil + key | M | 9 | 8 | 8 | 9 |
| Guided to_words, seed 913052, pupil + key | L | 9 | 8 | 8 | 9 |
| Guided to_number, default seed, pupil + key | M / L | 9 | 9 | 8 | 9 |
| Guided to_words, default seed, pupil + key | M / L | 9 | 8 | 8 | 9 |
| Opener to_number, seed 913052 (1,000 in the Independent band) | M | 9 | 8 | 8 | 9 |
| Independent to_number, seed 913052 (1,000 as item 3) | M | 9 | 8 | 8 | 9 |

## N9: FIXED

- **The Steps fit every item.** At seed 913052, 10 items are dealt, and 1,000 is the third. `oneKindFirst` now gives 1,000 its
  own kind, so it moves behind the hundreds items and off the 9-cell Guided page. The page reads 233 (Model), then 915, 945,
  339, 734, 849, 116, 421 and 779, all hundreds names under the hundreds Steps, both ways at M and L. The score is /8 at M and
  /5 at L, which matches the items printed.
- **No garbled hint, and no hint gives the answer.** The to_number hints are `"nine hundred": ___ in the hundreds.` The
  to_words hint is `915: 9 hundreds, then the rest, 15.`, which gives no word of the answer. "thousand hundred" appears on
  no page.
- **The thousands Steps teach truthfully.** I checked the code (`js/modules/sheet/providers/pv.js` lines 1326–1327 and
  1389, 1397 and 1415) and `ws-words-checks`. The words-to-number Steps read "Read the thousands word. / No hundreds, tens or
  ones words? Write 0, 0, 0. / Write the digits." The number-to-words Steps read "Say the thousands word. / No hundreds, tens
  or ones? Write the thousands word alone." The Remember line is "One thousand is 10 hundreds." The worked steps are
  `"one thousand": 1 thousand.`, then 0 hundreds 0 tens 0 ones, then Write 1000. All of these are true. At band 1000, 1,000
  is the only thousand-kind name. It can never be the majority kind, so these Steps never lead a printed page. That is the
  right outcome, because a page of only "one thousand" would be pointless.
- **The keys are right.** Every key answer on every rendered page matches its name, including 1000 for "one thousand" on the
  Opener and the Independent page.

## Findings

- **Minor (no point lost):** On the Opener at seed 913052 (to_number, M), "one thousand" is Independent item 6. The hundreds
  Steps sit above it on the same page. This follows the shared opener rule ("other kinds go to the Independent band"). The
  pupil does that band alone, and the key is right (1000). Step 3 "No tens or ones word? Write 0." nearly covers it, but not
  the leading 1 thousand. A later round could keep 1,000 out of an Opener's Independent band when that band sits under
  hundreds Steps. It does not block.
- **Unchanged from r2 (recorded, not held):** The to_words Opener has 1 Guided item and no Independent band, so the page is
  about 55 % empty. The to_words I Can title reads "write a number from its name".

## VERDICT: PASS

N9 is FIXED at band 1000 on the Guided page: seed 913052 and the default seed, M and L, pupil and key, both ways. Every grade
is 8 or more, and the 8-seed page gate and the seed-free words check are green.
