# Critic: Wave 1 A fix (student-home Start buttons), commits 243236e + ceae77b

Critic: Opus 5.5, medium effort (owner rule: reviewers on Opus medium). Independent; did not build this. No code edited.

## Verdict: FAIL. Scores: C1 4 · C2 8 · C3 8 · C4 7

Cap H2 applies to C1: in dark theme the four Start labels are near-white text on near-white pastel tiles and cannot be read.
Students can reach dark theme from the **Theme** button in their own header.

```json
{"skill":"ui:student-home-start","label":"Student home: Start buttons in Choose Mode","versions":[{"surface":"screen","version":"student-home 1280 + 390, light + dark","scores":{"C1":4,"C2":8,"C3":8,"C4":7},"caps":["H2"],"pass":false}],"pass":false,"summary":"In dark theme the Start labels turn near-white on pastel tiles and cannot be read; set the ink in dark theme and the rest passes."}
```

## What was verified (and holds)

- **Placement.** The four Start tiles and "Your skill" sit inside the "🎮 Choose Mode" section (probe check). At 1280 the tiles land exactly where the original mode cards were at 2e434cd: x 324 / 545 / 766 / 987, 205 × 217 px. That is identical to the original cards and to the penguin's 217 px height.
- **Grid at 390.** The tiles form a 2 × 2 grid (150 × 142 px each), the penguin is below them, and the MAP K-2 / 3-5 / K-5 buttons are below the section at both widths.
- **Colours** match `css/ui-components.css:487-553`: border, 4 px bottom shadow and resting gradient per mode (#5A9DEE, op-add-d, op-sub-d, op-div-d). The hover colours match the `.mode-card:nth-child(n):hover` rules. The hover lift is 7 px, which follows the penguin card; the original mode cards lift 6 px.
- **Shape.** Radius 22 px and 2 px border, the same as `.mq-mascot-card`. Icon above name, 41.6 px icon. Hover is translateY(-3px); press is translateY(3px).
- **Touch targets.** The smallest tile is 150 × 142 px, far above 44 px.
- **Keyboard.** Tab order runs Problems select → Start practice → boss → race → worksheet → MAP K-2 → MAP 3-5, which matches the reading order. Every Start tile gets `:focus-visible`.
- **Onboarding.** Step 1 targets `.student-start-btn`, which resolves to the visible "Start practice" tile (150 × 142 at 390).
- **Nothing else moved.** Game Setup sits at y 499 at 1280 and y 621 at 390, the same as the original. The section is 37 px taller at 1280 because of the "Your skill" line, so MAP moves down by the same amount; that is expected.
- **Teacher view.** Unchanged: the teacher shell covers the home, `body.teacher-mode .student-only` is `display:none !important`, and the probe shows 5 mode cards + Start Game and 0 student tiles.
- **CSS is additive.** Only new rules were appended to `css/screen-cell.css` (1439-1476); no existing rule was edited.
- **Gates.**
  - `wave1-a-probe`: OK, every line PASS.
  - `ws-boot-smoke`: OK.
  - `ws-stamp-assets --check`: OK.
- **Dry-run merge** onto `claude/sweet-newton-c8wrv1` (93d873f): clean, **no conflicts** (`git merge-tree` exit 0).

## Defects (ranked, RUBRIC §6 form)

### D1 · critical · C1 (cap H2 → 4, costs 4) and C4 (costs 1) · dark theme makes the labels illegible
- **Where:** `css/screen-cell.css:1445` sets `color: var(--mq-ink, #1a1a1a)`. In `.dark` / `.dark-theme`, `--mq-ink` becomes `--brand-night-ink` (`css/variables.css:100`).
- **Observed:** with `html.dark` (what `toggleTheme()` sets in `js/modules/ui-core.js:163`), each tile's computed colour is rgb(244,240,251). The background stays `linear-gradient(#FFF → #B5D8FF / #FFB7C2 / #FFCFA8 / #B6E8C9)`. "Start practice", "Start boss battle", "Start car race" and "Start worksheet" are white-on-white and cannot be read. Seen at 1280 and 390 in the critic's dark capture of `.choose-mode-row`.
- **Expected:** label contrast ≥ 4.5 : 1 in both themes. The original mode cards have dark-theme rules (`ui-components.css:559-574`), and the lane-A orange buttons were white on orange. This change therefore regresses dark theme.
- **Fix** (append to `css/screen-cell.css`):
  `.dark .mode-cards .student-start-btn, .dark-theme .mode-cards .student-start-btn { color: #2B2840; }`
  This pins the light-theme ink, so the tiles keep the owner's mode-card pastels in both themes and the hover pastels stay readable too.
- **Check:** in `tests/scripts/wave1-a-probe.cjs`, add `html.dark` and assert that each tile's computed `color` differs from white and has contrast ≥ 4.5 against its gradient's end colour. Re-shoot `student-home-*-dark.png`.

### D2 · minor · C1 (costs 1) · focus ring is the browser default 1 px auto
- **Where:** the `.student-start-btn` rules in `css/screen-cell.css` have no `:focus-visible` rule.
- **Observed:** the computed outline is `1px auto rgb(16,16,16)`. It is visible as a thin dark ring, but it is weaker than the tile's own 2 px coloured border and 4 px shadow. The project's convention is `3px solid #5E3FCC; outline-offset 2px` (`screen-cell.css:496`, `map-mode.css:2065`).
- **Fix:** `.mode-cards .student-start-btn:focus-visible { outline: 3px solid #5E3FCC; outline-offset: 3px; }`
- **Check:** in the probe, Tab onto "Start practice" and assert `outlineWidth === '3px'`.

### D3 · minor · C3 (costs 1) · at 390 the icons in a row are not aligned
- **Where:** 390 px, both rows of the 2 × 2 grid. `justify-content: center` is at `screen-cell.css:1460`.
- **Observed:**
  - "Start boss battle" and "Start worksheet" wrap to two lines, so their icon tops sit at y 1518 / 1675.
  - Their neighbours' icons, "Start practice" and "Start car race", sit at y 1530 / 1686.
  - That is a 12 px step across each row; the labels' first lines also differ.
- **Fix:** inside `@media (max-width:780px)`, use `justify-content: flex-start` with a fixed padding-top, or give `.mode-name` `min-height: 2.4em`, so icons and first lines line up.
- **Check:** in the probe, at 390 assert `.mode-icon` tops are equal within each row (±1 px).

### D4 · minor · C3 (costs 0, nit) · "Your skill" line leaves a lone word at 390
- **Where:** `#studentStartSkill` at 390 is 314 × 50 px and reads "Your skill: Addition Facts (within / 20)".
- **Fix:** add `text-wrap: balance` to `.student-start-wrap #studentStartSkill`, or move it to the existing rule in `index.html`. Better still, put the skill name on its own line so a long name never breaks the label.
- **Check:** in `student-home-390.png`, no line of the label holds a single word.

### D5 · minor · process (no score) · the probe has blind spots
- **Where:** `tests/scripts/wave1-a-probe.cjs`.
- **Observed:**
  - It never tests dark theme, which is how D1 passed unseen.
  - It exempts "practice" from the background check.
  - Its teacher check only swaps body classes instead of opening the real teacher shell.
- **Fix:** add the dark-theme contrast check (D1) and the focus-ring check (D2). Compare practice against the unselected `.mode-card:nth-child(1)` gradient, `#FFF → #B5D8FF`.

## What raises each criterion to 10

- **C1:** fix D1 (lifts the cap, ≥ 8) and D2.
- **C2:** "Your skill" names the skill that Start will play. To reach 10, also make the queue case ("+ N more") show the skill names on hover or focus.
- **C3:** fix D3 and D4.
- **C4:** fix D1, so the tiles are faithful to the mode cards in both themes.

## Not this change (noted, not graded)

- The penguin bubble in dark theme is also light text on a white bubble. This is pre-existing (`ui-components.css:7861`) and worth a separate fix.
- The MAP buttons moved from x 533 / h 64 (at 2e434cd) to x 388 / h 57 earlier in lane A, not in these commits.

---

# Round 2: head da1fb2c (adds 34c91b8 and da1fb2c on top of ceae77b)

Critic: Opus 5.5, medium effort. I did not build this change and I edited no code. Independently of the builder's probe, I ran my own probe in the scratchpad. It switches theme with the real `toggleTheme()`, switches role with the real `setUserRole()`, hovers each tile, and reaches the tiles with real Tab presses.

## Verdict: PASS. Scores: C1 9 · C2 9 · C3 9 · C4 9

```json
{"skill":"ui:student-home-start","label":"Student home: Start buttons in Choose Mode","versions":[{"surface":"screen","version":"student-home 1280 + 390, light + dark","scores":{"C1":9,"C2":9,"C3":9,"C4":9},"caps":[],"pass":true,"defects":[{"criterion":"C1","severity":"minor","where":"css/screen-cell.css:1482, dark theme, 1280 + 390","what":"In dark theme the focus ring #5E3FCC is 2.1:1 against the dark section behind it (≥ 3:1 needed).","fix":".dark .mode-cards .student-start-btn:focus-visible, .dark-theme .mode-cards .student-start-btn:focus-visible { outline-color: #B5A5F4; }"}]}],"pass":true,"summary":"Round-1 defects are fixed in both themes and at both widths; only the dark-theme focus ring is short of 3:1."}
```

## Round-1 defects re-checked

All contrast figures are measured against every stop of the gradient behind the text; the worst stop is shown.

- **D1, dark labels: FIXED.** The label ink is rgb(43,40,64) in both themes.
  - Resting contrast: practice 9.61, boss 8.65, race 9.96, worksheet 10.39 (to 1). The figures are identical at 1280 and 390, in light and in dark.
  - Hover: the ink stays the same. Against the darkest hover stop (#F58A9C), the lowest ratio is about 6.1:1.
  - Penguin bubble: 14.19:1 in both themes.
  - "Your skill" line in dark: 12.9:1, with ink #F4F0FB on the section.
- **D2, focus ring: FIXED.** With a real Tab press onto "Start practice", the ring is `3px solid rgb(94,63,204)`, offset 3px, and `:focus-visible` is true. This holds in both themes and at both widths. The dark-theme residual is listed as R2-D1 below.
- **D3, icons at 390: FIXED.** Icon tops are 1518 / 1518 and 1675 / 1675, and name tops are 1578 / 1578 and 1734 / 1734, so each row lines up exactly. At 1280 all four icons sit at 1141 and all four names at 1201.
- **D4, "Your skill" at 390: FIXED.** `text-wrap: balance` gives "Your skill: Addition / Facts (within 20)" on two lines, with no lone word. At 1280 it fits on one line, 25 px tall.
- **D5, probe: FIXED.**
  - The probe now checks dark contrast for the tiles, the MAP buttons and the bubble, and the icon line-up per row.
  - The practice colour is now compared against #B5D8FF and #5A9DEE.
  - The teacher check calls `setUserRole('teacher')`, and `teacher-home-1280.png` shows the real teacher shell. My own run in dark also shows the real shell, with no student tiles.
  - Nit: the probe still asserts "5 mode cards visible" while those cards sit behind the shell. That assertion proves nothing; see R2-D3.

## Dark-mode MAP buttons (new in da1fb2c)

- **Readable.** Contrast in dark: K-2 #5EEAD4 9.88:1, 3-5 #FDBA74 8.66:1, K-5 #C4B5FD 7.92:1. Each is measured on the new #2A2540 → #221E36 fill.
- **Fits the dark theme.** The fill matches the dark section surface, and the coloured border and bottom shadow are kept. The label colours are the light versions of the same teal, orange and purple, in the same pattern as `--brand-purple-l`. In `student-home-dark-{1280,390}.png` they read as one family with the cards above them.
- **Light mode untouched.** All four new rules are scoped under `.dark` / `.dark-theme` (`screen-cell.css:1491-1494`), and `css/map-mode.css` was not changed.

## Owner requirements (binding): all met

- **Shape.** The tiles have the penguin card's shape: radius 22 px, 2 px border, icon on top and name below.
- **1280.** At 1280 the four tiles sit in one row beside the penguin, each 217 px tall to match the penguin.
- **390.** At 390 they form a 2 × 2 grid with the penguin below.
- **Colours.** Each tile has its own mode-card colour, and the hover gradients are the `.mode-card:hover` pastels.
- **Placement.** "Your skill" sits above the tiles, and MAP K-2 / 3-5 / K-5 sit below the section.
- **Teacher view.** It is unchanged, in light and in dark.

## Gates (run one at a time through /tmp/mq-browser-run.sh)

| Gate | Result |
|---|---|
| `wave1-a-probe` | OK, every line PASS |
| `ws-boot-smoke` | OK |
| `ws-teacher-shell` | OK |
| `ws-stamp-assets --check` | OK |
| `test-wrong-retry-skip` | **Crashed on this branch; passes once merged** (see below) |

- **Why it crashed.** Its 3-5 MAP step got the feedback "❌ Try once more.", which the regex in its own copy of the test does not accept. This is not caused by this change, which touches no JS. The wrong-answer message is picked at random from `WRONG_MESSAGES` in `answer-check.js`, so the old test flakes.
- **Why it passes once merged.** The base branch already fixed the test in 93d873f, which reads that list from the source.
- **Proof.** I ran it on the dry-run merge tree: `OVERALL: PASS`, 0 console errors and 0 page errors.

## Dry-run merge onto claude/sweet-newton-c8wrv1 (93d873f)

`git merge-tree --write-tree` exited 0, tree d821e4f. **No conflicts.**

## Defects (ranked, RUBRIC §6 form)

### R2-D1 · minor · C1 (costs 1) · the dark-theme focus ring is under 3:1
- **Where:** `css/screen-cell.css:1482`, dark theme, at 1280 and 390. Visible in the critic shot `focus-dark-1280`.
- **Observed:**
  - The ring is #5E3FCC on the dark section (about #2A2540), about **2.1:1**.
  - The 3 px offset puts dark section colour on both sides of the ring, so the ring only sits against dark.
  - WCAG 1.4.11 asks for at least 3:1. The ring can be seen, but it is faint.
  - In light theme it is about 7:1, which is fine.
- **Fix** (append):
  `.dark .mode-cards .student-start-btn:focus-visible, .dark-theme .mode-cards .student-start-btn:focus-visible { outline-color: #B5A5F4; }`
  This is `--brand-purple-l`, rated 7.28:1 on night surfaces in `brand.css:22`.
- **Check:** in the probe's dark block, Tab onto "Start practice" and assert that the contrast of `outlineColor` against the section's computed background is ≥ 3.

### R2-D2 · nit · C3 (costs 0) · the race-car emoji looks low in its tile
- **Where:** `student-home-1280.png` and `-390.png`, the "Start car race" tile.
- **Observed:** the icon boxes line up, but 🏎️ is a short, wide glyph. Its ink sits about 10 px lower than 🎓 🐉 📝 in the same row.
- **Fix:** optional. `.student-start-btn[data-mode="race"] .mode-icon { transform: translateY(-6px); }`, or leave it, since the original mode cards have the same glyph.
- **Check:** compare the glyph ink tops by eye in the re-shot PNGs.

### R2-D3 · process (no score) · the teacher assertion and the MAP contrast check in the probe are weak
- **Where:** `tests/scripts/wave1-a-probe.cjs`, the teacher block and the dark contrast block.
- **Observed:**
  - Under the real shell, the teacher check counts `.mode-card` elements with `display != none`, but those cards are behind the shell. The check passes whatever the home looks like.
  - The `stops()` helper reads rgba stops as opaque. In light theme the MAP gradient ends at `rgba(…,0.10)`, which would give false lows. The helper is only used in dark today, so nothing fails yet.
- **Fix:**
  - Assert that the teacher shell is visible and that `#homeView` is hidden or covered.
  - Composite rgba stops over the parent background before measuring contrast.

## What raises each criterion to 10

- **C1:** fix R2-D1.
- **C2:** in the queue case ("+ N more"), show the queued skill names on hover or focus. Carried over from round 1.
- **C3:** fix R2-D2.
- **C4:** fix R2-D1, so focus in dark theme reads like the rest of the dark theme.

## Not this change (noted, not graded)

- **Light-theme MAP labels are under 4.5:1.** K-2 #14B8A6 on near-white is about 2.5:1, 3-5 #E5722B about 3.1:1, and K-5 about 4.1:1. The text is 17.6 px / 900, below the large-text size, so 4.5:1 applies. These rules come from `css/map-mode.css:29-52`, which predates this change, and the owner asked for light mode untouched. Light theme is now the weaker of the two; this is worth a separate owner decision.
- **`test-wrong-retry-skip` on this branch is stale** (see Gates). It is fixed on the base branch, so merging resolves it.
