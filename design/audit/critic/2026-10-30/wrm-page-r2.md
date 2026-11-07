# White Rose / Lessons teacher screen: critic re-grade (round 2), 2026-10-30

Critic: independent (Opus 5.5, medium effort). Read-only: no source edited, nothing committed.
Tree: worktree `agent-a6f1a0f998879110d`, branch `wrmpage-fix` at `b39988ea`. This is fixes `67472774` and `43418cd4`, merged
with the latest main branch. Brief and criteria: as round 1 (`wrm-page.md`):
- C1 ease;
- C2 value and truth;
- C3 layout;
- C4 fidelity, plain composed words.

8 or more on every criterion passes.

## Verdict: PASS. Lowest score 8

| Screen | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Bookmarks: old numbered, delisted, slug and remembered links | 8 | 8 | 8 | 8 |
| Grade, maths area and list (1366, 390) | 8 | 8 | 8 | 8 |
| Lesson panel and per-lesson / per-area to-make cards | 8 | 8 | 8 | 8 |
| Skills to be made, "How it looks" | 8 | 8 | 8 | 8 |
| MAP spot check | 8 | 8 | 8 | 8 |

## What was checked

**Gates (my runs).** All OK:
- `ws-wrm-page-unit`: M11, M12 and M13 are 0; bookmarks 2,902 / 0 drifted; truth 0; plain words 0.
- `ws-wrm-bookmarks`;
- `ws-stamp-assets --check`.

**Browser gates (the fixer's logs, `scratchpad/wrmfix/logs`, run after the merge 20:50–21:35).** All OK, so W4 is closed:
- `ws-teacher-wrm` in 3 modes;
- `ws-teacher-shell`;
- `ws-teacher-library`;
- `ws-chromebook-fit`;
- `ws-boot-smoke`.

**My Playwright probe** (`scratchpad/wrmr2/*.cjs`, 1366 and 390, light and dark-scheme): 0 console errors and 0 sideways scroll.
Dark is held off on the teacher site by the owner's ruling of 2026-10-23, so the dark shots render light, as designed.

**Bookmarks**
- **W1 fixed.** `#wrm/3/D1/16` opens "Patterns on the multiplication table". The head notice gives the date and offers
  "Divide by 10", and the link is rewritten to the slug. This holds at 1366 and at 390.
- A delisted lesson (`#wrm/3/D1/1`) shows a toast naming the old lesson and opens the area list.
- Slug links open cleanly, with no notice.
- All 962 sequence lessons hash to unique slugs, and each slug resolves back to its own lesson.
- The remembered last lesson is stored as its slug, and the "Next" mark follows it.

**"How it looks"** (all 277 entries, through the app's own module instance)
- **W2 fixed.** No build notes, and no note shown as written.
- **n2 mostly fixed.** The `vis_*` entries now name their drawings or their host skill.

**W3 fixed.** The compare-fractions entries are merged. `frac_same_whole` is kept as distinct work, with its reason given.

**Nits**
- n1 fixed.
- n3 fixed.
- n4 open: the to-make card is still folded at the bottom of the lesson.

## Findings (minor; fix in the next touch, none blocks)

**R1. Links to merged ids open nothing.** `#todo/frac_compare_same_part`, `#todo/compare_kind` and `#todo/roman_numerals` land at
the top of the list, with no entry opened and no notice. `#todo/nosuch` does the same.
- **Fix.** Resolve the `#todo/<id>` hash through `canonicalEntry()`. For an unknown id, show "This entry has been built or removed".
- **Check.** Add to the `ws-wrm-bookmarks` fixture:
  - every `#todo/<id>` link for each version;
  - every `ENTRY_ALIASES` key.

  Each must open its canonical entry.

**R2. Two "How it looks" lines are not sentences.**
- `make_decisions`: "ticks mental or written, then solve".
- `collect_data`: "tallies marks, a table, then a drawn chart".

`answerPhrase()` conjugates only the first verb.
- **Check.** M13 grammar rule: every verb after "the pupil" that follows ", then" or "and" must agree with it. Also fail on the
  noun-list form after a verb (`, a \w+, then`).

**R3. 17 entries (6 %) still read "Black-and-white boxed questions, the same on paper and on screen…".** Examples: `km_m`,
`time_convert`, `compare_calcs`, `metric_calc`.
- In addition, `vis_hundred_square` says "boxed questions on 'Percent Grid (Visual)'" and never says "hundred square".
- The M13 rule ">5 identical lines" is dodged by the varying answer tail.
- **Check.** Count the drawing PREFIX (the text before ";"), not the whole line. Require a drawing noun on every
  `vis_*` / migrate entry.

**R4. The Kind line reads "Option: Pairs: same numerator, same denominator"** (double colon, on 40 entries).
- **Fix.** Write "New setting: pairs with the same numerator or denominator".
- **Check.** The plain-words gate flags two colons in one short field.

**R5. 17 lines use " / " lists**, for example "writes the number / tens and ones" and "ticks odd / even".
- **Fix.** Compose them with "or".
- **Check.** Extend `LOOKS_BUILD_NOTE` to match ` / `.

## Evidence (scratchpad)

Before and after (the before shots are the fixer's):
- `wrmfix-before-old-link-g3-d1-16-1366.png` → `wrmr2-old-g3-d1-16-1366.png`, `wrmr2-old-g3-d1-16-390.png`;
- `wrmfix-before-todo-entry-1366.png` → `wrmr2-todo-entry-1366-dark.png`;
- `wrmr2-gone-direct-390.png` (delisted link);
- `wrmr2-todo-alias-1366.png` (R1);
- `wrmr2/shots.json`, `wrmr2/blooks.json`.

No redesign-passed entry: this is a teacher screen, not a skill.
