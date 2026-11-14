# On-screen keypad: design card (DESIGN ONLY, unsigned)

Lane: lf-tools-keypad · designer: Opus medium · 2026-11-14 · status: **DRAFT, awaiting owner sign-off**
Mock: `design/status/lf-checks/keypad/mock.html` (the app's real CSS; the proposed `css/keypad.css` is inline in it).
Screenshots (deviceScaleFactor 2): `class-1366x768.png`, `class-1024x768.png`, `practice-sign-1366x768.png`,
`practice-fraction-1366x768.png` (all beside the mock).

## 1. What it is

Owner request: in the class view (teacher-launched play on the whiteboard or projector, e.g. Boss Battle "Add. 6 + 4 = [ ]"),
pupils have no keyboard. A large calculator-style keypad sits beside the card (or below it when the window is too narrow),
never on top of it. Typing on it is the same as typing on a keyboard: it fills the focused answer box and moves on.

The keypad is **chrome, not paper**. The black-and-white cell is not touched. Digits on the keys use Andika, so the pupil sees
the same glyphs as in the cell. The extra keys a question needs sit in a grey column (the single grey). ✓ Check is the one accent.

## 2. Hosts

| Host | Where in code | When it counts | Key size | Pad position |
|---|---|---|---|---|
| **Class view** | `#gameView` with `body.teacher-mode` (Run practice: Practice / Boss / Race) | teacher-launched play | **72 px** at ≥ 1200 px wide, **66 px** at 900–1199 px (both ≥ 64) | right of the card |
| Board display | `body.tv-bigboard` (launch-chrome.js) | the class answers aloud, so there is no answer box | none | **hidden**, toggle hidden (see Q2) |
| Practice card | `#gameView`, pupil | pupil play | 56 px on a computer, **48 px minimum** on a tablet | right of the card at ≥ 900 px, below it otherwise |
| Online worksheet | `#worksheetView` `.problems-grid` | pupil or teacher | 48 px | docked strip at the bottom of the view. The grid gets `padding-bottom` equal to the strip height, so no cell is ever under it. The strip follows the focused cell. |
| Quiz | `#quizTakeView` `.qt-answer-area` | pupil | 48–56 px | below the answer area, centred |

**Layout per width** (class view and practice). A grid wrapper `.mq-kp-host` holds `[card | pad]` as `minmax(0,1fr) auto`.

- **1366×768:** the pad is 276 px wide (3 columns × 72 + gaps), or 358 px with an extra column. The card keeps about 1040 px.
- **1024×768:** keys are 66 px and the pad is 246/320 px. The card keeps about 700 px.
- **< 900 px** (tablet portrait 820): the grid becomes one column and the pad is centred under the card.

The board-fit zoom (`fitBoard`, launch-chrome.js) measures the card inside the wrapper, so its fit still holds. Phone width (390) is
out of scope (FASTEST_PLAN rule 7).

**Anatomy, top to bottom:**
- the digit rows `7 8 9` / `4 5 6` / `1 2 3`;
- `0` (two columns wide) and `⌫`;
- an optional 4th column for the question's extra keys (grey);
- **✓ Check**, the full width of the pad and 1.1 × the key height.

The digit layout is the calculator layout, not the phone layout (Q1).

## 3. Key set per answer type

The keys come from the **focused box first, then the question**. That way a cell with mixed boxes (a function table's sign circle
plus number boxes) changes its column as focus moves. The base set is always `0–9 ⌫ ✓`. `Next →` appears whenever the item has
two or more boxes.

| Answer type / box | Extra keys (grey column) | Notes |
|---|---|---|
| `number` (whole) | none | `−` is added when `q.ans < 0` or the category is `integers` |
| decimal (`.` in `q.ans`, `state.decimalPlaces > 0`, decimals/money skills) | `.` | one `.` per box. A second press is ignored, as `_slotChars` would ignore it. |
| `text` (free word answer) | **no pad** | words come from the card's word bank, or the keyboard. The pad shows a one-line "Type with the keyboard" note when it is toggled on. |
| `fraction-input` (`#fiNum` / `#fiDen`) | `/`, `Next →` | `/` in the numerator box moves to the denominator. In a whole box (mixed number) `/` moves to the numerator. |
| single-box fraction text (`3/4` typed) | `/`, `space` | `space` separates the whole part of a mixed number |
| `dual`, `dual-fraction` | `Next →` (+ `/` for dual-fraction) | |
| sign circle `mq-slot--circle` with `data-mq-signs` | those signs | e.g. `= ≠`. The card's sign tiles (`.mq-signbank`) stay. |
| sign circle, operation (`signsFor(q)` gives + − × ÷) | `+ − × ÷` | |
| compare circle (`signsFor` gives < = >) | `< = >` | |
| cell slot `data-mq-kind="sign"` / `"rule"` | `+ − × ÷` (rule: also `space`) | |
| cell slot `data-mq-kind="word"` | **no pad** for that box | |
| `coord-input`, `coordinate-multi` | `−`, `Next →` | x then y |
| time answers (`:` in `q.ans`) | `:` | |
| `inline-blanks`, `inline-cloze`, `area-model`, `number-family`, `fact-family`, `interactive`/`expanded`, stack digit boxes (`mq-digit`) | `Next →` | stack digits fill right to left. The pad sends the same `input` event, so the existing leftward advance runs. |
| count-by list rows (`join === ','`) | `Next →` (acts as the list's Space) | |
| `multiple-choice`, `clock-choice`, `ten-frame-build`, `pv-digit-drag`, `multi-select-check`, `tchart-drag`, `divisibility-sort`, `number-line-place`, `odd-even-select`, `interactive` ordering, `.mq-wordbank` | **no pad** | answers are tapped on the card. The pad collapses and the toggle stays. |

`keySetFor(q, input)` is a **pure function** (`js/modules/keypad-keys.js`, no DOM). It returns `{show, extra: [...], next: bool}`.
An answer type it does not know returns `show:false` **and** fails gate KEYPAD-1, so a new type cannot silently get no keys.

## 4. Focus and advance

- **The target** is the last focused answer box in the host's answer region: `#answerInputArea`, the question paper's slots,
  `ws_input_N`, `#qtAnswerInput` and the cell slots. It is tracked with `focusin`. If nothing is focused yet, the first empty box
  is the target, which the hosts already focus on render.
- **Keys never steal focus.** Each key uses `pointerdown` + `preventDefault()`, then acts on `click`. The caret stays in the box.
- **Typing a character.** The pad calls `setRangeText(ch, selStart, selEnd, 'end')` and then
  `dispatchEvent(new InputEvent('input', {bubbles:true, inputType:'insertText', data:ch}))`. Every existing per-widget listener
  then runs unchanged:
  - `_slotChars` filtering;
  - stack right-to-left advance;
  - cell-slot compose;
  - `autoCheckOnInput`;
  - `resizeInput`.
  
  If the box is at `maxlength` and a next box exists, the pad moves to the next box first. This is the same digit run-over the
  keyboard path has.
- **⌫** first sends a synthetic `keydown` Backspace. Widgets that move left on an empty box handle it and `preventDefault`. If no
  widget handled it, the pad deletes the character before the caret and sends `input`.
- **`Next →` and `/`** in multi-box items send `keydown` Enter / Tab-equivalent to the box. If nothing handles it, the pad focuses
  the next box in DOM order inside the same cell.
- **✓ Check** sends `keydown` Enter on the target. If that is not handled, it calls the host's check:
  - practice: `submitAnswer()`;
  - worksheet: the focused cell's check, which is what Enter does there today, never Check All;
  - quiz: the Enter path in quiz-take.
- **While the pad is on**, answer inputs get `inputmode="none"`, with the old value kept in `data-mq-kp-im`. This stops a tablet's
  own keyboard from rising over the card. The old value is restored when the pad is turned off.
- **After an answer**, while `state.hasAnswered` is true or the input is disabled, digit keys do nothing. ✓ becomes **Next →**,
  which calls `nextQuestion()`, so the class can move on without the mouse.

## 5. When it shows, and the toggle

The setting is `mq_keypad`: `auto` (default) | `on` | `off`. It is stored in localStorage per device, wrapped in try/catch.

- **auto** turns the pad on when `matchMedia('(any-pointer: coarse)')` matches and `matchMedia('(any-pointer: fine)')` does not,
  meaning a touch-only device. An interactive whiteboard usually reports a *fine* pointer (it acts as a mouse), so auto alone will
  often leave the pad off on the board. **Proposal:** in the class view (`body.teacher-mode #gameView`) auto means **on** (Q3).
- **The toggle lives in four places:**
  - **class view:** a `Keypad: On/Off` button (`.mq-kp-toggle`, `aria-pressed`) at the right of `#gameView .game-header`, in the
    chrome and off the card;
  - **practice card:** the same button;
  - **worksheet:** in `#worksheetView .game-header`, beside Check All;
  - **quiz:** in the quiz header.
- **The settings panel** gets a row "On-screen keypad: Auto · On · Off". The header button flips between on and off. "Auto" comes
  back only from the settings panel.

## 6. CSS: additive only

All rules go in a **new** `css/keypad.css`, linked after `play-compact.css`. The rule set is in the mock.

- The classes are new: `.mq-kp-host`, `.mq-kp`, `.mq-kp-key`, `--op`, `--wide`, `--del`, `--next`, `.mq-kp-check` and
  `.mq-kp-toggle`.
- Size comes from one custom property, `--kp-key`. Class view sets 72/66 px and the other hosts set 56/48 px.
- No existing selector is restyled. Saved quiz HTML in IndexedDB holds none of these classes.
- `.mq-kp-host` is a wrapper that keypad.js adds **around** `#questionCard` only while the pad is on, and removes when it is off.
  With the pad off, the DOM and the pixels are the same as master (gate KEYPAD-8).

## 7. Files to change

| File | Change |
|---|---|
| `js/modules/keypad-keys.js` (new) | pure `keySetFor(q, input)` + `KEYPAD_TYPES` registry (Layer 0, testable in node) |
| `js/modules/keypad.js` (new) | mount/unmount per host, focus tracking, key actions, inputmode swap, setting + toggle (Layer 2) |
| `css/keypad.css` (new) | section 6 |
| `index.html` | link `css/keypad.css`; toggle buttons in the game, worksheet and quiz headers; the settings row; then run `ws-stamp-assets` |
| `js/globals.js` | import; `window.toggleKeypad`, `window.syncKeypad` |
| `js/modules/question-render.js` | call `syncKeypad(q, 'practice')` at the end of `renderQuestion` |
| `js/modules/worksheet.js` | `syncKeypad(null, 'worksheet')` after the grid renders (key set per focused cell) |
| `js/modules/quiz-take.js` | `syncKeypad(q, 'quiz')` after each question renders |
| `js/modules/launch-chrome.js` | hide the pad and the toggle under `tv-bigboard`; `fitBoard` measures with the pad present |
| `js/modules/settings-panel.js` | Auto / On / Off row |
| `tests/scripts/ws-keypad.mjs` (new) + `ws-precritic` path | the gates below |

## 8. Checks to write FIRST (KEYPAD)

These checks are written before the build, and each must fail on master (`ws-backtest` rule):

- **KEYPAD-1 (node, no browser):** every answer type the renderer dispatches, and every slot kind, is in `KEYPAD_TYPES` with a key
  set or an explicit `none`. The list is scraped from `question-render.js` / `screen-cell.js` `answerType ===` and `data-mq-kind`.
  Any unknown type fails.
- **KEYPAD-2 (needed keys):** for one seeded item per live skill (`generateQuestionFor`), every character of the normalised
  `q.ans` is either a digit or a key on the shown pad, and pad-less types are exactly the `none` set.
  - `−` counts for a negative answer.
  - `.` counts for a decimal answer.
  - `/` or two fraction boxes count for a fraction answer.
  - The signs count for a sign or compare circle.
- **KEYPAD-3 (each key hits its box):** the same sample is answered **with pad clicks only**:
  1. focus the first box;
  2. click the keys that spell the answer, using `Next →` between boxes;
  3. click ✓.

  The item must be marked correct, and the box values must equal what `page.keyboard.type` gives on the same seed.
  `document.activeElement` must stay an answer input after every click.
- **KEYPAD-4 (size):** every `.mq-kp-key` is ≥ 64×64 px in the class view at 1366×768 and 1024×768. It is ≥ 48×48 px on the
  practice card, worksheet and quiz at 1280, 1024 and 820 widths.
- **KEYPAD-5 (never covers):** the pad's rect does not intersect `#questionPaper`, any answer input or `.mq-signbank` /
  `.mq-wordbank`. There is no horizontal scroll and the board fit still has no vertical scroll. On the worksheet, no cell lies
  under the docked strip after scrolling to the end.
- **KEYPAD-6 (shows when):**
  - auto with a touch-only context (Playwright `hasTouch`) shows the pad;
  - auto with a mouse hides it, except in the class view (Q3);
  - the toggle flips it and survives a reload;
  - `tv-bigboard` never shows it.
- **KEYPAD-7 (no OS keyboard):** with the pad on, every answer input has `inputmode="none"`. With the pad off, the original
  `inputmode` is back.
- **KEYPAD-8 (additive):** with the pad off, screenshots of the practice card, worksheet and quiz are pixel-identical to master.

`ws-boot-smoke` must stay clean, with no console errors.

## 9. Open questions for the owner

- **Q1:** the digit order. The calculator order (7-8-9 on top) is drawn here; the phone order puts 1-2-3 on top. Which does the
  class know?
- **Q2:** the Board display (whole class answers aloud) has no answer box. Should the keypad stay hidden there?
- **Q3:** a whiteboard usually reports a mouse-like pointer. Should the class view default to keypad **on** whatever the device?
- **Q4:** sign questions show the sign tiles on the card **and** the same signs on the pad. Keep both, or drop the pad's sign
  column when the card has tiles?
