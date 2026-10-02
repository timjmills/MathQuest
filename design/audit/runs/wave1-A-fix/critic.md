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
