# Critic — shared-link landing pop-up with many skills (commit c550466)

Critic: Opus medium, independent. Date 2026-10-05. Branch `claude/sweet-newton-c8wrv1`.

## Verdict: PASS (the change) — with one MAJOR pre-existing defect on the same screen to fix next

The commit does what the owner asked: past 3 skills the title reads "Ready to Practice N Skills?",
the subtitle adds "Click Start Playing!", the pills fold behind "See the N skills", the pop-up is
capped at the viewport, Start has focus. No regressions found. The dropdown defect below is NOT
caused by this commit (identical on the parent commit) but the brief asked for it to be checked.

## How it was tested

Real links through the URL (`index.html?c=<code>`), not a direct call: 23 skills with fixed settings
(`|T0-N0-D0`), 23 skills with no settings (`|`, so Mode/Timer/Problems dropdowns show), 2 skills
fixed, 4 skills legacy (no pipe). Viewports 340x640, 390x844, 740x360 (landscape phone),
1280x800; light and dark (`prefers-color-scheme`). 32 runs. For each: title/subtitle, Start inside
the modal's visible box and the viewport, `elementFromPoint` hit on Start, horizontal overflow,
focus; then open the list, `scrollIntoView` Start, re-check; then press Enter (even runs) or Space
(odd runs) on the focused Start and check overlay gone, `skillQueue` length, active view. Also the
parent commit (`git archive c550466^`) served via `MQ_ROOT` for comparison. Plus `ws-boot-smoke`
(OK), syntax check (OK), and the builder's probe (all green).

| Check | Result |
|---|---|
| Title / subtitle / summary text (4+ skills) | correct at all sizes, light and dark |
| 1–3 skills unchanged (title, subtitle, no `<details>`) | yes |
| Start visible without scrolling, folded — 340x640, 390x844, 1280x800 | yes, all (fixed and dropdown variants) |
| Start visible without scrolling, folded — 740x360 | fixed settings: yes. With 3 dropdowns: **clipped 16 px** at the modal bottom (centre still visible and tappable) — minor |
| List opened: Start reachable | yes everywhere (modal scrolls; inner list 40vh scrolls) |
| Start focused on open; Enter and Space start play | yes, 32/32; overlay removed, queue = N, `gameView` active |
| Skills load into queue | 23/23, 4/4, 2/2 |
| Console / page errors | none in any run |
| Horizontal overflow | none (the new `box-sizing: border-box` actually fixes a 340 px overflow the parent had: 90 % + 56 px padding) |
| Other `.landing-modal` users | only `showRoundModal` (Round N Complete) — small content, unaffected by max-height/overflow; it also becomes 56 px narrower on desktop via box-sizing, harmless |
| Parent commit, 23 skills at 390x844 | Start not clickable (Puppeteer: "Node is either not clickable") — confirms the original bug and that the fix addresses it |

## Defects

### MAJOR (pre-existing, not this commit) — pupil's dropdown choices are ignored
`startFromLanding()` (js/modules/gamification.js) removes `#studentLandingOverlay` **first**, then
reads `#landingTimer`, `#landingCount`, `#landingMode` — which are inside that overlay and are
therefore gone. Every link without fixed settings starts with the fallbacks: timer 0, 20 problems,
Practice. Reproduced: select Timer 2 min, Problems 10, Mode Boss Battle → `mixedModeSettings`
`{timer: 0, totalProblems: 20}`, `gameMode: 'practice'`. Identical on c550466^ (pre-existing).
Fix: read the three dropdowns before `overlay.remove()` (or move the removal below Step 2). The
brief's "dropdowns still read" check therefore fails, but not because of this change.

### MINOR
1. **740x360 with dropdowns:** Start is cut by 16 px at the bottom of the scroll box when folded
   (button 312–364, modal box ends at 348). Still focused and centre-tappable, but not fully "on
   screen". A `@media (max-height: 420px)` tightening of modal padding / `h2` / `p` / choice margins,
   or a sticky Start at the modal bottom, would close it.
2. **"See the N skills" tap target** is ~35 px tall (0.95rem + 6 px padding), under the project's
   44 px touch floor. Give the summary `min-height: 44px` / more padding.
3. **340x640 opened:** nested scroll (inner list 256 px inside a scrolling modal); Start sits below
   the fold until the pupil scrolls the outer box. Reachable, but the inner list could be ~30vh on
   short screens so Start stays visible after opening.

### NIT
- `.landing-skills.landing-skills-scroll { margin: 6px 0 }` never applies: the div's inline
  `style="margin:12px 0"` wins.
- The builder's probe calls `showStudentLandingModal` directly (not through `?c=`), checks only the
  viewport (not the modal clip box), has no landscape case, and writes its PNGs into
  `tests/scripts/` (untracked litter; I removed the ones my run produced).
- Dark mode skill pills: white text on the light dark-theme `--accent-purple` is low contrast
  (pre-existing inline style; now hidden behind the fold by default).

## Rubric (as it applies to this app-chrome screen)

| Criterion | Score | Why |
|---|---|---|
| C1 Ease of use | 8 | Count + "Click Start Playing!" + focused Start: a pupil can start alone at every size. Landscape clip and small summary target are nits-to-minor. (The pre-existing dropdown bug would cap this screen at 6 if graded as a whole; it is outside this change.) |
| C2 Educational value | 9 | Not a teaching screen; telling the pupil "23 skills" without a wall of names lowers load, list still available. |
| C3 Spacing and layout | 8 | Clean, centred, never taller than the screen; minus the 16 px landscape clip and nested scroll on 340 open. |
| C4 Standard fidelity | 8 | Matches existing app chrome in light and dark; CSS additive at file end; 1–3 skill path unchanged. |

No blocking defect in the change. PASS. Recommended follow-up lane: the dropdown read-order fix
(major, one-line move) plus minors 1–2.
