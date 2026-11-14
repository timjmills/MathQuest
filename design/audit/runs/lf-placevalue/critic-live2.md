# lf-placevalue critic live2: FINAL round under round cap 2, number_word_form one-kind class (independent critic, Opus medium, 2026-11-14)

Tree `/home/user/mq-live1`, branch `claude/lf-placevalue-live2` at 839abe6a (code 3532a7cf + brief). BEFORE = read-only worktree at
7dea0448 (the live1 critic r2 head), removed after grading. Renders by each tree's own `ws-grade-render.cjs` (`--roles ... --size M,L
--no-screen --gate --opts ...`), one browser command at a time through `mq-browser-run.sh`. Off-default seeds were built through
`window.buildSheet` with the same request the lane's `ws-pv-words-pages` uses (a scratch helper, `tools/one.cjs`). Sizes M and L.

## Grade table (C1 ease / C2 teaching / C3 spacing / C4 fidelity)

| Page (number_word_form) | BEFORE | AFTER | Pass |
|---|---|---|---|
| Opener M / L, band 20 (to_number) | 8/7/8/8 | 9/8/8/8 | yes (N3 fixed) |
| Guided M / L, band 20 (to_number) | 8/8/8/8 | 9/8/8/8 | yes |
| Guided M / L, band 20 + to_words | 8/8/8/8 | 8/8/8/8 | yes |
| Opener M, band 20 + to_words | 8/8/8/8 | 8/8/8/8 | yes |
| Opener L, band 20 + to_words | 8/8/**6**/7 (`--gate` OVERFLOW x4) | 8/8/8/8 (`--gate` OK) | yes (N7 fixed) |
| Opener L, to_words band 100 | 8/8/6/7 (r2) | 8/8/8/8 | yes (N7 fixed) |
| Opener L, to_words band 1000 | - | 8/8/8/8 | yes (N7 fixed) |
| Opener L, band 20 + to_words, seed 10130 (Model 12, Guided 11) | - | 8/8/8/8 | yes (11 / 12 Steps) |
| Lesson M / L, band 20 (chart + sheet + practice) | 8/7/8/8 | 8/8/8/8 | yes (N6 fixed) |
| Lesson M / L, band 20 + to_words | 7/6/8/7 | 8/8/8/8 | yes (N6 fixed) |
| Lesson M / L, to_words band 100 | 7/6/8/7 | 8/8/8/8 | yes (N6 fixed) |
| Scripted Model M / L, band 20 both ways; to_words band 100 / 1000 | 8/8/8/8 | 8/8/8/8 | yes |
| Lesson M / L default, and band 1000 + hto (unchanged spot-check) | r1 grades | pixel-identical | yes (r1 grades stand) |

Every key read is right (band 20 to_number opener 15 / 13 17 19 / 14 20 12 8 11 1; guided 10 3 7 8 0 2 9 5 1; lesson 0 3 /
16 13 9 6 14 20 and the vocabulary lines; to_words three seven eight zero two, thirteen, eleven, ninety-nine, nine hundred eighty-four).

## N3 / N6 / N7

- **N3: FIXED.** Band-20 Opener: Model fifteen, Steps "Thirteen to nineteen: 1 ten. / Find the ones in the word. / Write 1, then
  the ones.", Guided band thirteen, seventeen, nineteen. Every Guided item fits the Steps, and 11 / 12 have gone to the Independent band,
  which may mix. The band-20 Guided pages (to_number and to_words) deal 0-10 under "Read the word. / Write its number." and "Say the
  number. / Write its word.", which fit every item. Eleven and twelve get their own Steps. When the Model is 12 (seed 10130,
  to_words) the Steps read "Eleven and twelve: say the word. / Write the word." over Guided 11. The to_number set reads "Eleven and
  twelve: 1 ten. / Eleven: 1 one. Twelve: 2 ones. / Write 1, then the ones." Both are honest: they name the two words as words to
  learn and do not claim a ones word inside them. The teen Steps now say "Thirteen to nineteen".
- **N6: FIXED.** Lesson band 20: the Model is five, Guided zero and three, Remember "Zero to ten: each number has its own word.", and
  no box Rule. Lesson band 20 + to_words: Model 5, Guided 0 and 3, the same Remember, and no "Every box gets a digit." (BEFORE printed
  it over a line, with "A number name says the hundreds, then the rest." over 0-20). Lesson to_words band 100: Model 57, Guided 22 and
  82 (two-word, the Model's kind), and Remember "Write the tens word, a dash, then the ones word." No line names hundreds or boxes on
  two-digit pages, and each Remember fits on one line.
- **N7: FIXED.** The to_words Opener at L stays inside its cell at band 20, band 100 and band 1000. "seven hundred forty-five" sits on
  one line at its own size inside the Model cell, and `--gate` reports no overflow (BEFORE: 4 OVERFLOW findings at band 20 + to_words).
  The fix keeps the font and wraps on the line (words.js `max-width:100%`, `overflow-wrap`). No deal I rendered had a name long enough
  to wrap, so I did not see a wrap.

## Also changed

- The Scripted Model reads "five / Read the word. / Write its number." at band 20, and "5 / Say the number. / Write its word." for
  to_words. Each worked example is one kind with its Steps. Pass.
- Minors: "No tens or ones word? Write 0." now uses a non-breaking space. It sits on one line at M at band 1000; I did not re-render it at L.
  The one-word first step is now "Say 5 out loud." in place of "3: 3 ones.", which is better but still thin (no point lost).

## Unchanged spot-check

The default lesson pages and the band 1000 + hto lesson pages are pixel-identical at M and L, pupil and key: 24 PNGs, 0 pixels differ
by more than 30/255. The lane's 30-skill role sweep claim was not re-run.

## New findings

**N9 (major, existed BEFORE, on a page outside this round's set): a band-1000 Guided page puts "one thousand" under the hundreds
Steps, with a garbled false hint.** The lane's own gate finds it with more seeds: `ws-pv-words-pages --seeds 8` FAILS with 8 findings,
all at seed 913052 on the Guided page at band 1000, M and L, both ways. On that page the Steps read "Read the hundreds word. / Read the
last words as one number. / ...". Guided item 3 is "one thousand" (key 1000), and its grey hint reads **`"one thousand hundred": ___
in the hundreds.`** This is the one-kind class again (the Steps do not fit the item), and the hint is not English and teaches a false
place. The BEFORE tree renders the same page, so it is not a regression, and r2's band-1000 Guided grade was for the default seed.
*Check:* precritic runs `ws-pv-words-pages` with 3 seeds, which is why it passed. Run it with `--seeds 8` (or more), or add a
deterministic unit row: deal the band-1000 Guided pool and assert that every item has the Model's `wordsKind`, and that 1,000 is never
dealt to a hundreds Model. Also widen GUIDED-HINT-GARBLE: it read this hint and passed it. "thousand hundred" (two place words
in a row) should fail.

**Minors (no point lost):** The band-20 lesson's Warm-up deals "575 = __ hundreds __ tens __ ones" from the review pool, which is
above the band (engine, lead D3). The opener's to_words page has one Guided item and no Independent band, so about 55 % of the page is
empty. This is unchanged from before and was graded at 8 in r2. The I Can title on to_words still reads "write a number from its name".
That is recorded and not held, as ruled.

## Verdict

**composing:number_word_form on these pages: VERDICT: PASS.** N3, N6 and N7 are fixed on every page the brief names, at M and L,
pupil and key, and every grade is 8 or more. The unchanged lesson pages are pixel-identical. r1 / r2's passing grades stand for every
other page.
**For the lead:** N9 shows the one-kind class is not yet closed everywhere. At band 1000 a Guided page can still deal 1,000 under
hundreds Steps, with a garbled hint. It existed before and lies outside this round's page set, so it does not change this verdict.
Before the skill's mark is final, it should be fixed and the gate's seed count raised.

## PNGs graded

Root `/tmp/claude-0/-home-user-MathQuest/fcbced55-7880-5e43-963b-41551278d007/scratchpad/critic-live2/`:
- `after-b20/composing__number_word_form/{opener,guided,scripted-model,lesson}-{M,L}[-key]-p*.png`
- `after-b20tw/...` and `before-b20tw/...` (same roles; the BEFORE opener-L overflows)
- `after-b100tw/...` (opener, guided, scripted-model and lesson, M / L)
- `after-b1000tw/.../{opener,scripted-model}-{M,L}[-key]-p1.png`
- `after-opener-b20tw-s10130-L[-key].png` (Model 12, Guided 11)
- `after-guided-b1000-s913052-M-key.png`, `before-guided-b1000-s913052-M-key.png` (N9)
- `{after,before}-default/...lesson-*`, `{after,before}-hto1000/...lesson-*` (spot-check, pixel-identical)
