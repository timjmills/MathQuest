# Critic: W0-defects lane (mq-opus-medium)

Branch `claude/sweet-newton-c8wrv1-wip-w0-defects` @ 3454b55, base bfdbd90. Critic start 2026-10-23T14:33:27Z, end 2026-10-23T15:05:50Z (32 min). No app code was edited and nothing was committed. Every browser run went through `/tmp/mq-browser-run.sh`, except one viewport run that I started outside it by mistake and stopped after about 30 s; I then ran it again through the runner.

## Verdict

| # | Fix | Verdict |
|---|---|---|
| 1 | Viewport: question top under the sticky header | **PASS** |
| 2 | Dark mode: skill pill and the active worksheet problem number | **PASS** (one older dark-only defect found in the quiz, not caused by this lane) |
| 3 | Big board fit | **PASS for the change.** The Board display at 1366×768 still fails for the 2 pinned skills (older defect, now pinned) |
| 4 | `numberFamilyData` of null | **PASS** |

## Gates on HEAD

- `ws-boot-smoke`: OK.
- `ws-code-snapshot`: OK. 722 codes, 35 categories, no code moved or deleted.
- `ws-viewport-check --baseline design/audit/baselines/viewport-check.json`, full default run: **64 sessions, 0 findings** (not just 0 new). It found 0 BOX-OUT and 0 CHECK-OUT.
  - Backtest on bfdbd90 (`--skills add_word_problems,long_div_2digit --sizes 1366x768,1280x600`): 6 UNDER-HEADER findings. So the check catches the defect and the fix removes it.
  - At phone and tablet sizes (390×844, 820×1180), HEAD and base give the same 14 CHECK-OUT lines. Nothing new comes from this lane. These sizes are outside what the check was built for.
- `ws-screen-slots --dark --baseline design/audit/baselines/screen-slots.json`, shards 1/3, 2/3 and 3/3 (the whole sample, both roles, 234 renders): OK, 0 low-contrast hosts. Shard 1/3 on bfdbd90 shows the old 2.55:1 pill and 1.59:1 number findings.
- `ws-chromebook-fit --bigboard --baseline tests/fixtures/precritic/sweep-sample.json --shots`: OK. The 2 pinned failures were seen, 0 new.
- `ws-chromebook-fit --skills addition:add_sub_fact_family --hosts card,worksheet,quiz`:
  - HEAD: OK, no page error.
  - bfdbd90: FAIL with 2× `[pageerror] Cannot read properties of null (reading 'numberFamilyData')`.
- `support-numberline --quick`: FAIL on both HEAD and bfdbd90, with the **same 18 "does not fit but offers nlOn…" lines** (diff is empty). **These were there before this lane.**

## Fix 1: viewport (`_clearRefLineOfHeader` for every skill)

**Evidence**
- Viewport check is clean, and the base backtest fails (see Gates).
- The R8-D1 timed-header cases in support-numberline still hold scroll 0.

**Fighting the user** (`probe-vp.cjs`, add_word_problems at 1366×768, T0 and T300)
- A pupil's mouse-wheel scroll right after a render is not undone. The guard stops on the wheel event:
  - wheel down 300 px → scrollY 80 (the bottom), and it stays there;
  - wheel up → scrollY 0, and it stays there.
- Nit: a scroll with no wheel, touch, pointer or key event inside the 1.5 s window after a render is pulled back to the "question clear" position. In my probe this was a programmatic `scrollTo(end)` and a smooth scroll, both pulled back to 61 px. It only happens while the box and Check still fit, so nothing is hidden. This design was already there (nl-r8); this lane only widened it to every skill.

**Cannot hide the box or Check**
- `fits()` checks the box against the bottom bars and Check against innerHeight.
- 0 BOX-OUT and 0 CHECK-OUT in 64 sessions.
- A problem that is too tall is left alone: at 1366×650, add_word_problems still scrolls with its top under the header. That is the accepted ruling, and the check does not count it as a finding.

**Performance**
- The `body *` sweep covers about 1,470 elements and takes 3.8–6.4 ms per call in this container (4.6–4.8 ms with style made dirty first).
- It runs only at render, on the next frame, and on scroll events inside the 1.5 s window. Scroll events fire at most once per frame, and the smooth-scroll probe fired 3.
- On a low-end Chromebook this could be about 15–25 ms per scroll event, but only in that 1.5 s window. Acceptable.
- Suggested follow-up, not required: work out the header bottom once per render, or limit the sweep to `.nav-bar *, #gameView > *, #myStatsBar, .mq-play-menu-btn` plus fixed elements.

**Practice card grades** (light; Chromebook 1366×768, 1366×650, 1280×720, 1280×600)
- C1 **9**: the question top is clear of the bar, and the box and Check are in view.
- C2 **9**: the task is unchanged.
- C3 **8**: the over-tall word problem still scrolls, as ruled.
- C4 **9**.

## Fix 2: dark mode (pupil)

**Measured computed colours** (`probe-dark.cjs`, student role, add_facts, sub_100_regroup and frac_quarters, 1280×900)

| Element | Light | Dark |
|---|---|---|
| Practice card pill `#skillLabel` | #7C5CE6 on #F4EFFF, **4.11:1** (unchanged) | #B5A5F4 on #3A3258, **5.43:1** |
| Worksheet pill `#worksheetSkillPill` | 4.11:1 (unchanged) | **5.43:1** |
| Worksheet number, **active** card | #4F4B6B on #FFFBE0, **7.89:1** | **7.89:1** |
| Worksheet number, **non-active** cards | 8.23:1 on white | #CBC6E0 on #2A2640, **8.76:1** |

- The teacher pill keeps its own `body.teacher-mode … #skillLabel.mq-skill-pill` rule, which has higher specificity.
- Light mode is unchanged: same values as before.
- Both rules are additive (appended at the end of each file, using new selectors).
- The light pill at 4.11:1 is below 4.5:1, but it was like this before and light mode was out of this lane's scope.
- I looked at the screenshots: the dark pill reads clearly, and "1" on the cream active card reads clearly.

**Older dark-only defect found (not this lane)**
- In the quiz, the current-question dot `.qt-q-dot.current` is white on #B5A5F4: **2.18:1** at 12 px in dark mode. In light mode it is ≥ 4.5:1.
- `ws-screen-slots --dark` misses it because its legibility scan only covers `.qt-question-card`.
- Required follow-up:
  - In dark mode, give the current dot dark ink (#1F1B33 or `--brand-night-card`) on the light accent; that is about 9:1.
  - Widen the gate's dark scan to the whole host view (`#quizTakeView`, the worksheet header).
- Other text below 4.5:1 is the same or worse in light mode, so it is a palette issue and not a dark-mode one:
  - Check button: white on #FF8A3D, 2.35:1.
  - Hint button: #E5722B, 3.71:1 in dark and 2.76:1 in light.

**Grades**

| Screen | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| Practice card, dark | 9 | 9 | 9 | 8 |
| Online worksheet, dark (active and non-active) | 9 | 9 | 9 | 8 |
| Quiz, dark (lane did not touch it) | 7 | 9 | 9 | 8 |
| Light, all three hosts | unchanged | | | |

The quiz C1 of 7 is the older current-dot defect above.

## Fix 3: Board display (`fitBoard`)

**Code**
- The cap is read from the CSS zoom with the fitted class removed.
- The fitted zoom is the largest that fits, and never below 1.
- The MutationObserver watches only childList, subtree and characterData. The fit itself changes only the class and a style property, so it cannot trigger itself in a loop.
- It also re-runs on resize, `fonts.ready` and reveal. `leaveBoard` clears it.
- The CSS rule is additive.

**1366×768**
- 37 of 39 sample skills fit.
- The zoom is matched to the question: 1.6 for short ones, and for example 1.28 for compare_groups, 1.06 for arrays_groups, 1.16 for long_div_2digit, 1.12 for temperature, and 1.0 for function_table_easy.

**1920×1080**: 39 of 39 fit.

**Screenshots I looked at**
- div_facts (1366×768) and count_sequence (1920×1080): full 1.6×, big and centred.
- arrays_groups (1366×768): whole item on the board, readable.
- add_sub_fact_family at 1920×1080: whole and big.

**Still failing (pinned, older defect): 1366×768**

| Skill | Scrolls by | What is cut off |
|---|---|---|
| add_sub_fact_family | 81 px | the 4th fact row (20 − 13 =) |
| add_word_problems | 33 px | the unit-bank row |

- These two get **C3 7** on the Board display: a teacher would notice it.
- Required follow-up: at board heights ≤ 800 px, make the board frame tighter (all additive in play-teacher.css). This gains about 64–72 px:
  - card padding 32 → 12 px;
  - frame padding 20 → 12 px;
  - gap 16 → 8 px.
- Also let the board fit go down to about 0.9. The board is a projected display, so that is still bigger than the practice card. Or ask the owner whether "never below 1" applies to the board.

**Board grades** (1366×768 and 1920×1080)

| Skills | C1 | C2 | C3 | C4 |
|---|---|---|---|---|
| The 37 that fit | 8 | 9 | 8 | 8 |
| The 2 pinned skills at 1366×768 | 8 | 9 | **7** | 8 |

- Nits (older): the pupil's yellow active-box highlight still shows on the board, where nobody types.

**The unexplained "board controls off screen (bottom 772 of 768)" is now explained**
- I reproduced it on 1 of 6 runs: count_objects and count_sequence at 1366×768 failed, with overflow 0/0.
- Cause:
  - `#gameView` is a `.view`, and `.view` has the entrance animation `fadeSlide 0.4s` (translateY 24px → 0, css/ui-components.css:167–173).
  - `probe-ctl.cjs` samples each frame. While the animation is pending or at currentTime 0, `#gameView` has `matrix(…, 0, 24)` and `#tvBoardCtl` reads bottom **772**, which is 748 + 24. It reads 769 at 50 ms and ≤ 768 after that.
  - The sweep measured during a delayed animation start.
- It is not a layout defect. Transforms do not change scrollHeight or clientHeight, so `fitBoard` is not affected either.
- Required fix is in the check: before `BOARD()`, wait until `document.getElementById('gameView').getAnimations().every(a => a.playState === 'finished')`, or emulate `prefers-reduced-motion`.

## Fix 4: number-family listeners

**Code**
- The listeners capture `nfQ = state.currentQ` and judge only while `state.currentQ === nfQ`.
- Every path that reassigns `currentQ` (review jump, resume of the live question, MAP review) re-renders and attaches fresh listeners, so nothing goes stale.

**Live checking still works** (`probe-nf.cjs`, 3 rounds, real keystrokes)
- A wrong first box turns red at once (`var(--incorrect)`).
- Typing the right family turns the boxes green, and sets `hasAnswered` and `lastAnswerCorrect` to true.
- After that, typing in a focused box, moving to the worksheet and clicking away gives 0 page errors.
- In round 0 the score text reads "0 Correct" 900 ms after answering, and the same happens on base. It is a display-timing quirk that was already there.

**Practice card and number-family grades**: C1 9, C2 9, C3 9, C4 9.

## Probes
All under `/tmp/claude-0/-home-user-MathQuest/4e2682a4-988c-5e1a-82ad-51f8a66da3e0/scratchpad/`:
- `probe-vp.cjs`, `probe-dark.cjs`, `probe-nf.cjs`, `probe-ctl.cjs`
- outputs: `vp.txt`, `vp-base.txt`, `vp-mobile*.txt`, `dark.json`, `dark/*.png`, `bb.txt`, `bb/*.png`, `nf-fit*.txt`, `nl-head.txt`, `nl-base.txt`

The base worktree is at `/tmp/w0base` (detached at bfdbd90). Remove it with `git worktree remove /tmp/w0base` when no longer needed.
