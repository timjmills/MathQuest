# lf-placevalue critic live1 r2: narrow re-grade after the live1 r1 FAIL (independent critic, Opus medium, 2026-11-13)

Tree `/home/user/mq-live1` at e5ae7875 (a12751d8 + brief). BEFORE = read-only worktree at d7a64e5c (the r1 head; its code is
the r1 AFTER, 7bf2bc3f, plus docs). Renders by `ws-grade-render.cjs` (each tree's own copy), one browser command at a time
through `mq-browser-run.sh`. Sizes M and L. Screen hosts rendered with `--no-print --gate --quiz-builder` (card 1280 / 820 /
1024, worksheet and quiz 1280 / 1024 / 820).

## Grade table (C1 ease / C2 teaching / C3 spacing / C4 fidelity)

| Skill | Page | BEFORE | AFTER | Pass |
|---|---|---|---|---|
| number_word_form | Guided M / L, band 1000 | 8/7/8/8 | 9/8/8/8 | yes (N1 fixed) |
| number_word_form | Guided M / L, band 100 + hto | 8/8/8/8 | 9/8/8/8 | yes |
| number_word_form | Guided M / L, band 1000 + hto | - | 9/8/8/8 | yes |
| number_word_form | Guided M / L, to_words | 6/5/8/6 | 8/8/8/8 | yes (N2 fixed) |
| number_word_form | Guided M / L, band 20 + to_words | - | 8/8/8/8 | yes |
| number_word_form | Scripted Model M / L, to_words | 7/5/8/6 | 8/8/8/8 | yes (EB debt not held) |
| number_word_form | Opener M / L, band 20 | 8/7/8/8 | 8/**7**/8/8 | **no** (N3: "twelve") |
| number_word_form | Opener M, to_words | 8/5/8/6 | 8/8/8/8 | yes (EB debt not held) |
| number_word_form | Opener L, to_words (also band 20 + to_words) | 8/5/**6**/6 | 8/8/**6**/**7** | **no** (N7, existed before) |
| number_word_form | Lesson M / L, to_words, page 2 + board | 7/5/8/6 | 7/**6**/8/**7** | **no** (N6) |
| number_word_form | Lesson M / L, band 20, page 2 | 8/7/8/8 | 8/**7**/8/8 | **no** (N6) |
| expand | Card 1280 | 9/8/9/8 | 9/8/9/8 (DOM hash unchanged) | yes |
| expand | Card 820 | 8/8/8/8 | 8/8/8/8 | yes |
| expand | Worksheet 1280 | 8/8/7/8 | 9/8/9/8 | yes (N4 fixed) |
| expand | Worksheet 1024 | 5/8/7/8 | 8/8/8/8 | yes |
| expand | Worksheet 820 | 5/8/7/8 | 8/8/8/8 | yes |
| expand | Quiz 820 / 1024 (--quiz-builder) | 5/8/8/8 | 9/8/8/8 | yes (N5 fixed) |
| unit_form | Worksheet 820 / 1024 | 6/8/8/8 | 8/8/8/8 | yes (N5 fixed) |

r1's passing grades stand for every page not listed.

## N1-N5

- **N1: FIXED.** At band 1000 the Guided hints read `"two hundred": ___ in the hundreds.` and `"nine hundred": ___ in the hundreds.`
  (M and L). With hto boxes at band 1000 they read `"two hundred": ___ in the H box.` At band 100 with hto they read
  `"thirty-five": ___ tens, ___ ones.` No hint names an answer digit outside a gap. Keys are right: 262, 986, 813, 908, 422,
  993, 473 and 112, and the band-100 T O boxes are right too.
- **N2: FIXED.** The to_words Guided Steps are "Say the tens word. / Say the ones word. / Write them with a dash." They fit all of
  53, 26, 99, 82, 91 and 42, and no literal number appears. The hint `26: 2 tens, 6 ones.` is a real first step and holds no answer word.
  The key (twenty-six, ninety-nine, eighty-two, ninety-one, forty-two) is right. At band 20 the Steps are "Say the number. /
  Write its name: one word up to twenty." They fit every item (10, 3, 20, 16, 18, 7).
- **N3: NOT FIXED (the class).** "twenty" is gone. The Model (fifteen) and the Guided band (thirteen, seventeen, **twelve**) are
  all tagged `teen`. But Step 2 says "Find the ones in the word." "twelve" has no ones word (nor has "eleven", in the Independent
  band). A pupil who follows the Steps cannot do Guided item 3. The teen Steps fit 13-19 only. CLAUDE.md lists exactly this
  edge case: "teen numbers shouldn't include 11/12". C2 7 at M and L.
- **N4: FIXED.** The worksheet has 2 columns at 1280 and 1 column at 1024 and 820. Each sentence `424 = [ ] + [ ] + [ ]` sits on one line in every card,
  with boxes of about 103 x 76 px at every width.
- **N5: FIXED.** The `--gate` TOUCH-TARGET reports no small answer box for expand (worksheet and quiz at 820 and 1024) or for unit_form
  (worksheet at 820 and 1024). BEFORE it reported 12 x 62x46 and 3 x 104x46 for expand, and 12 x 50x46 for unit_form. unit_form's boxes are now 52 x 50 and the page is otherwise
  unchanged (it grows 12 px).

## Global touch rule spot-check

The claim holds. These screens are unchanged before and after: add_wp_10 worksheet 820 (the DOM content hash is the same and
no pixel differs by more than 30/255), vocab_grade_pictures worksheet 820 (same hash, and the 66 px that differ are focus-ring
anti-aliasing), and sub_100_no_regroup quiz 1280 (same hash; only the animated background shapes moved).
But see N8.

## New findings

**N6 · number_word_form lesson role (to_words and band 20, M and L): the Guided item is not the Model's kind, and the Rule names
boxes that are not on the page (C2 6 for to_words, C2 7 for band 20).** These are the N3 class on the lesson role. On to_words,
the lesson's Guided item is **11** under the Steps of the Model 39 ("39: 3 tens, 9 ones. / So 39 is thirty-nine."). A pupil who
follows them writes "ten-one". The board and page 2 both carry "Rule: Every box gets a digit." on a page whose answers are
written words on a line, with no box. "Remember: A number name says the hundreds, then the rest." heads a page of two-digit
numbers. At band 20 the Guided band is "zero" and "sixteen" under the Model "six" ("six": 6 ones. / Write 6.), and the
same box Rule appears, with no boxes. The defect existed BEFORE (identical items; BEFORE's Steps were also garbled), so the page
is better, not worse. `oneKindFirst` was put on the Opener only.
*Check:* run `ws-pv-words-pages --pages lesson` over every wordform and band. Tag the lesson's Model and its Guided items with
`wordsKind`, and fail GUIDED-ONE-KIND on any mismatch. Add LESSON-RULE-FITS: fail when the Rule / Remember band names a slot
shape (box, digit box) or a place (hundreds) that no item on the page has.

**N3 check (the class):** make `wordsKind` give 11 and 12 their own kind (`teen-irregular`), or make the teen Steps fit them.
GUIDED-ONE-KIND then fails "twelve" under the fifteen Model. A unit row should assert that every Step's verb applies to every
Guided item: "find the ones in the word" needs a ones word in the item's name.

**N7 · number_word_form Opener L, to_words (also band 20 + to_words): the Model's answer line runs out of its cell, across the
cell's left edge and into the Steps column (C3 6, major).** ws-grade-render itself flags it: `page 1 cell 1: content overflows
its cell` / `<div class="ws-words"> leaves the cell`. It is identical BEFORE, so it is not a regression, but it is on a page
graded this round. The Opener's EB ruling does not cover an overflow.
*Check:* exists already. `ws-grade-render --gate --roles opener` on every value of the skill's wordform option. The lane's precritic
deals only the default way on the opener; add the to_words deal to its `--skill` path.

**N8 (outside this lane, for the lead) · the touch floor did not reach add_wp_10 and vocab_grade_pictures.** Both are passed
skills, and their online worksheets still have 46 x 46 answer inputs at 820, 1024 and 1280 (8 and 9 inputs; `--gate` TOUCH-TARGET
FAIL BEFORE and AFTER). The new rule matches only `.mq-cellbox:has(> input.mq-cellslot)`. Their inputs are not that shape. The
commit message says "every boxed slot input >= 48 px", which overstates what the rule does.
*Check:* run `ws-grade-render --gate` over the 30 passed skills' screen hosts as a sweep. It names every passed skill below
48 px today.

**Minors (no point lost):** At L and band 1000, Step 3 still wraps as "Write / 0.". The to_words Guided Model has no grey first
step. The band-20 to_words hint "3: 3 ones." adds little. At L with hto at band 1000, the third cell of row 2 sits about 8 px higher
than its neighbours. The expand worksheet at 1024 is one column with about 40 % empty width in each card (acceptable).

## Verdicts

- **composing:number_word_form: VERDICT: FAIL.** N1 and N2 are fixed, with the keys right on every deal. N3 is not fixed as a class: "twelve"
  sits under teen Steps that cannot read it. The lesson role (N6) carries the same class plus a false box Rule. The to_words Opener at L
  overflows its Model cell (N7, existed before). This is the round-cap second failure of the one-kind class (N3/N6): root-cause it in `wordsKind` and the
  lesson role before another round.
- **placevalue:expand: VERDICT: PASS.** N4 and N5 are fixed on the worksheet and quiz at every host. The card is unchanged. Print is
  unchanged (not re-graded).
- **placevalue:unit_form: VERDICT: PASS.** N5 is fixed: the worksheet inputs are at least 48 px at 820 and 1024, with no other change.

## PNGs graded

Root `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-live1-r2/`:
- `after-b1000/composing__number_word_form/guided-{M,L}-p1.png`, `guided-M-key-p1.png`
- `after-hto100/.../guided-M-key-p1.png`, `guided-L-p1.png`; `after-hto1000/.../guided-M-key-p1.png`, `guided-L-p1.png`
- `after-towords/.../{guided-M-key,guided-L,scripted-model-M,opener-M,opener-L,lesson-M-p1,lesson-M-p3,lesson-L-p2}*.png`;
  `before-towords/.../{scripted-model-M,opener-L,lesson-L-p2}-p1.png` (lesson-L-p2.png)
- `after-b20/.../{opener-M-key,opener-L,lesson-M-p2}*.png`; `before-b20/.../lesson-M-p2.png`
- `after-b20tw/.../{guided-M-key-p1,lesson-M-p2}.png`
- `after-screens/placevalue__expand/{card-1280,card-820,worksheet-1280,worksheet-1024,worksheet-820,quiz-820,quiz-1024}.png`;
  `after-screens/placevalue__unit_form/worksheet-{820,1024}.png`; `before-screens/placevalue__unit_form/worksheet-820.png`
- the spot-check side-by-sides `cmp-addwp-ws820.png`, `cmp-vocab-ws820.png`, `cmp-sub-quiz1280.png` (BEFORE left, AFTER right)
- the r1 renders under `../critic-live1/` for the BEFORE of band 1000 / default
