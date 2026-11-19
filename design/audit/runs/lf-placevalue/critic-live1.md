# lf-placevalue critic live1: narrow re-grade of the live-defect fixes (independent critic, Opus medium, 2026-11-13)

Tree `/home/user/mq-live1` at 7bf2bc3f (brief commit 44a5c5d8); BEFORE = `/home/user/mq-base` (ffcba24b). Renders by
`ws-grade-render.cjs` (each tree's own copy), one browser command at a time through `mq-browser-run.sh`. Sizes M and L.
Machine check run: `ws-pv-words-pages` -> OK (24 Guided pages, 180 items, 48 hints), but it reads only the to_number
deals (see N1, N2).

## Grade table (C1 ease / C2 teaching / C3 spacing / C4 fidelity)

| Skill | Version | BEFORE | AFTER | Pass |
|---|---|---|---|---|
| number_word_form | Guided M, default (21-99) | 8/7/6/8 | 9/8/8/8 | yes |
| number_word_form | Guided L, default | 8/7/6/8 | 9/8/8/8 | yes |
| number_word_form | Guided M / L, band 20 | - | 8/8/8/8 | yes |
| number_word_form | Guided M / L, band 100 + answerSlot hto | - | 8/8/8/8 | yes |
| number_word_form | Guided M / L, band 1000 | 8/7/6/8 | 8/**7**/8/8 | **no** (N1) |
| number_word_form | Guided M / L, to_words | 6/5/7/6 | **6/5**/8/**6** | **no** (N2) |
| number_word_form | Opener M / L, band 20 | 8/6/8/8 | 8/**7**/8/8 | **no** (N3) |
| number_word_form | Scripted Model M / L, band 20 | 8/6/8/8 | 8/8/8/8 | yes |
| expand | Print Independent M / L + keys | - | byte-identical to BEFORE (unchanged) | carried |
| expand | Card 1280 | 8/8/7/8 | 9/8/9/8 | yes |
| expand | Card 820 | 8/8/7/8 | 8/8/8/8 | yes |
| expand | Worksheet 1280 | 8/8/7/8 | 8/8/**7**/8 | **no** (N4) |
| expand | Worksheet 820 / 1024 | not rendered by BEFORE tool | **5**/8/**7**/8 | **no** (N4, N5) |
| expand | Quiz 1280 (--quiz-builder) | 8/8/7/8 | 9/8/8/8 | yes |
| expand | Quiz 820 / 1024 | not rendered by BEFORE tool | **5**/8/8/8 | **no** (N5) |

The white under the Guided grid (r8b D1, ruled to lf-roles) is graded but not held: about 31 % of the body at M and 40 % at L
on the default deal.

## The r8b items and the expand items

- **D2 (rows sized to content): FIXED** on every deal viewed. Row 1 of the default page at M is 195 px with about 21 % free;
  rows 2 and 3 are 118 px with about 24 % free (before: 270 / 165 px with 35-50 % free). The Model writes its first step in grey
  (`"fifty-three": 5 tens, 3 ones.`). The row-1 tries sit clear of the Model tab (n6). Each count stays on one line with its place
  word (n3): `___ ones.` never splits. One exception: on the hto deal the Model has no grey first step (nit).
- **D3 (the hint holds none of the answer): FIXED for to_number at 20 / default / 100 / hto. NOT FIXED at band 1000 (N1) or
  on to_words (N2).**
- **D4 (one kind per page, the Steps fit every item): FIXED on the Guided page for to_number at every band** (default:
  two-word only, eleven gone; band 20: one-word only, with Steps "Read the word. Write its digit."; band 1000: hundreds only).
  **NOT FIXED on to_words (N2).** On the band-20 Opener the Steps fit the Model but not every Guided item (N3).
- **Opener / Scripted Model at band 20: Scripted Model FIXED** (2 Steps that fit "five"; before, 3 tens/ones Steps).
  **Opener PARTLY FIXED** (N3).
- **expand: the number sentence at digit size: FIXED** on the card (1280: about 56 px; 820: about 48 px, one line, each
  operator next to its box) and the quiz (1280: about 56 px). On the worksheet it is now 29 px bold. **Print unchanged:
  FIXED** (independent M / L pupil and key PNGs byte-identical to BEFORE). **Worksheet: NEW DEFECTS (N4, N5).**

## Findings

**N1 · number_word_form Guided, band 1000, M and L: the hint gives away the hundreds digit (C2 7, major; D3 not fixed on
this deal).** The hints read `"two hundred": 2 in the hundreds.` under 262 and `"nine hundred": 9 in the hundreds.` under 986.
They are not gapped frames. The 2 and the 9 are answer digits. PT §2.3 says the hint holds none of the answer, and r8b gave the
allowed form: a Step-1 frame with a gap (`"two hundred": ___ in the hundreds.`). The page did not change from BEFORE apart
from its row heights.
*Check:* GUIDED-HINT-LEAK in `ws-pv-words-pages` fails only when a hint names EVERY digit of the answer. Tighten it to PT's
wording: fail when a hint names ANY answer digit outside a ruled gap. It would catch 262 / 986 here (the 1000 band is already
one of its deals).

**N2 · number_word_form Guided, wordform to_words, M and L: the Steps and the hint are wrong for every item (C2 5, C4 6 by
H17, C1 6; D3 and D4 not fixed).** The page deals 53, 26, 99, 82, 91 (two-digit numbers). The Steps are "Say the hundreds:
three hundred." and "Say the last two digits as one number." Neither item has a hundreds digit, and "three hundred" is a
literal from the provider. The grey hint reads `26: the no is in the hundreds place.` That sentence does not parse ("the no").
The page is the same as BEFORE apart from its row heights. (The 4 tries at M in a 1 x 5 column are content-sized, so C3 is 8.)
*Check:* `ws-pv-words-pages` reads only to_number pages (its DEALS hold no `wordform`, and `nameValue` reads number NAMES in
the prompt). Add the to_words deal: read each prompt's numeral, tag its kind, and fail GUIDED-ONE-KIND when the Steps name a
place (hundreds) that no item has. Fail GUIDED-HINT-GARBLE when a hint is not one of the provider's frame templates filled
(or by a word list: "the no is").

**N3 · number_word_form Opener, band 20, M and L: the Guided band's "twenty" does not fit the teen Steps (C2 7).** The Steps
are now "Eleven to nineteen: 1 ten. / Find the ones in the word. / Write 1, then the ones." The Model (fifteen) and two of the
three Guided items (thirteen, seventeen) fit. "twenty" does not: a pupil following Step 3 would write 1-something. This is
better than BEFORE, where the tens/ones Steps fitted neither the Model nor the two teens, but the band still mixes kinds.
(The Independent band also mixes eight, one and the teens. That is acceptable for practice.)
*Check:* extend GUIDED-ONE-KIND to the Opener's Guided band (`ws-pv-words-pages --roles opener`): tag the Model and the
Guided-band items, and fail when an item's kind is not the Model's kind.

**N4 · expand worksheet, 1280 / 1024 / 820: every card breaks the sentence over two lines and the boxes shrank (C3 7).** The
grid is now 3 columns at 1280 and 2 at 820 (BEFORE: 2 columns at 1280, one line). Each card reads `424 = [ ] + [ ]` and then
`+ [ ]` alone, centred on a second line, in 6 of 6 cards. The operator does stay with its box (WS-WRAP-OP holds), but the
number sentence is split in every cell. The answer inputs went from 103 x 76 px (BEFORE, 1280, measured on the PNG) to
62 x 46 px (meta), so the screen slot is now smaller than the digits around it.
*Check:* WS-ONE-LINE in `ws-pv-screen-numeral`: on the worksheet at 1280 / 1024 / 820, fail when the `.mq-ibnum` line's
inputs sit on more than one line box (compare the input rects' `top`) for a sentence of 4 or fewer parts. Also fail when an
input's height drops below the BEFORE capture (a ratchet on the expand slot size).

**N5 · expand worksheet and quiz at the tablets (820, 1024): the answer inputs are 46 px tall (H6, C1 5, major).** Measured
in meta: worksheet-820 and worksheet-1024 `input.mq-cellslot` 62 x 46 (12 inputs each); quiz-820 and quiz-1024 104 x 46
(3 each). The owner's floor is 48 px for an answer box on a tablet. On the worksheet this is a regression from the 76 px boxes
before. The same `mq-cellslot` class fails on unit_form (lf-tools r1 A1), so the root may be shared.
*Check:* already exists: `ws-grade-render --gate` TOUCH-TARGET renders the worksheet and quiz at 820 / 1024 and fails
these 30 inputs. The lane's precritic did not run it on placevalue:expand's screen hosts. Rule: when a change touches a screen
host, precritic runs `ws-grade-render --gate --skills <skill> --quiz-builder` for that skill.

**Nits (no point lost):** band-20 Guided hints read `"seven": ___ tens, ___ ones.` while the Steps say "Read the word. Write
its digit.", so the hint uses a frame the Steps do not. The band-20 Scripted Model uses "five", the easiest item, rather than
an item that uses every Step. At L, band-1000 Step 3 wraps as "Write / 0.", leaving the 0 alone on its own line. The key leaves
the grey hint gaps unfilled (they are not scored).

## Verdicts

- **composing:number_word_form: VERDICT: FAIL.** The default, band-20, band-100 / hto Guided pages and the band-20 Scripted
  Model pass. Band 1000 (N1), to_words (N2) and the band-20 Opener (N3) are below 8.
- **placevalue:expand: VERDICT: FAIL.** The card, the 1280 quiz and print pass. The worksheet splits the sentence and shrank
  the boxes (N4), and the worksheet and quiz answer inputs are 46 px on the tablets (N5).

## PNGs graded

Root `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-live1/`:
- `after-default/composing__number_word_form/{guided,opener,scripted-model}-{M,L}-p1.png`, `guided-M-key-p1.png`;
  `before-default/.../guided-{M,L}-p1.png`
- `after-b20/.../{guided-M,opener-M,opener-L,scripted-model-M}-p1.png`; `before-b20/.../{opener-M,scripted-model-M}-p1.png`
- `after-b1000/.../guided-M-p1.png`, `guided-L-key-p1.png`; `before-b1000/.../guided-M-p1.png`
- `after-hto/.../guided-L-p1.png`
- `after-towords/.../guided-M-p1.png`; `before-towords/.../guided-M-p1.png`
- `after-expand/placevalue__expand/{card-1280,card-820,worksheet-1280,worksheet-820,quiz-1280,quiz-820}.png` + `meta.json`;
  `before-expand/placevalue__expand/{card-820,worksheet-1280,quiz-1280}.png`; independent M / L pupil and key compared by `cmp`
