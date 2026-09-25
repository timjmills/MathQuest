# Option Panel Rubric — 1 to 10, per skill

**Version 1 · 2026-09-25.** Owner request: "make sure there is an option audit as well for each
skill so the options make sense and can go easier/harder, more support/less support" and "each
option panel needs to have an 8/10 or above. And all parts of the option need to be made sure it's
working for both print and screen as applicable."

This rubric grades a skill's **option panel**: the controls a teacher sees for that skill
(`offeredOptionsFor()` in `js/modules/skill-options.js`, drawn by `js/modules/skill-options-ui.js`).
It is a companion to `RUBRIC.md` (which grades the rendered page and card). A skill passes this
rubric when **every criterion O1–O5 scores 8 or more and no cap applies.** One criterion at 7 is a
fail.

| Gate | Reads | Catches |
|---|---|---|
| `ws-options-verify` | generated items, `buildSheet` output, the option store, share codes | an option value that does nothing, breaks its promise, or does not survive a link (feeds O4 and part of O5) |
| `ws-options-derive` | generated items | which Max Number / Decimals / Support levels a generator really reads (feeds the measured options) |
| **this rubric** | the verifier report, the live panel (teacher mode), `PEDAGOGY_STANDARD.md` | whether the panel is the right panel for this skill |

Governing rules the critic applies (they outrank general design advice):

- **An option lives on the skill** and travels into every page role, on screen and in print, and in
  a share link (P-AT-10, P-31).
- **The default is the stand-alone value** (ruling R2): what the teacher gets from the dialog having
  chosen nothing. A ladder step supplies other values explicitly.
- **"Within N" / a band bounds the answer**, never the operands.
- **One delta per step** (P-1): one control moves one thing. A control that changes the number size
  *and* the scaffold at once breaks P-1.
- **Structural scaffolds persist, hint scaffolds fade** (PEDAGOGY 4.1): digit grids, regroup boxes,
  place-value letters, frames are *structural*; pictures, dot cues, captions, traces, arrows are
  *hints*. Support level 3→0 removes hints; removing a structural scaffold is its own option.
- **An option a generator ignores is worse than no option** (skill-options.js header).

---

## 1. The five criteria

### O1 · Sense — is every option meaningful here, and is nothing essential missing?

- Every control shown changes something a teacher of *this* skill would want to change.
- No control is irrelevant to the maths (a Decimal places control on a whole-number counting skill;
  a Max Number that only moves a distractor).
- Nothing the skill's **name family** obviously needs is missing. The "should have" list per
  family is in `OPTIONS-AUDIT.md` §3; typical essentials:
  - fact drills: the fact **constant** and the fact **band** (facts to 5 / 10 / 20);
  - multi-digit + / −: **regrouping** (none / some / always) and, for −, **across zeros**;
  - multi-step or visual skills: the **representation** (picture / number line / none);
  - word problems: the **number size** and the **unknown position**;
  - counting / comparing: the **count range** (to 5 / 10 / 20 / 100) and the **objects** (dots / pictures / ten frame).
- A skill with **no options at all** scores O1 ≤ 3 when its family has an essential option
  (above), and O1 = 8 only when the critic can say in one sentence why it genuinely has nothing to
  configure (a fixed-domain identification skill, a one-off vocabulary match).

### O2 · Difficulty — can the teacher make it easier or harder, in sensible steps?

- There is at least one **number-size** control (band, Max Number, fact set, place) whose values
  form a ladder: small steps at the bottom (5, 10, 20), bigger ones higher up (100, 1,000, …).
- There is at least one **complexity** control where the skill has one (regroup, steps, unknown
  position, number of terms, mixed operations).
- Each step changes **one thing** (P-1). A control that makes the numbers bigger as it removes
  support scores O2 ≤ 6.
- No value lies outside the skill's name ("Add within 20" offering "Up to 1,000").
- The easy end is really easy for a K-2 ELL / SPED pupil and the hard end reaches the grade's
  standard.

### O3 · Support — can the teacher give more or less support?

- A **Support level** (3 worked-traced · 2 hints · 1 structure only · 0 bare) or an equivalent
  per-skill scaffold control (pictures on/off, number line on/off, cut line / line / none, think box).
- Levels fade **hints**, never structure; a separate control (or none) removes structure.
- Several ticked levels build a fading page (most support first).
- A level that draws nothing different must not be offered (`levelSubset`).
- Scoring: a skill with no support control at all scores O3 ≤ 5 when its representation has a hint
  scaffold to fade (pictures, dots, number line, trace); O3 = 8 is possible without a control only
  when the skill has no hint scaffold by nature (a bare fact probe, a compare-two-numbers item).

### O4 · Works — does every value really change the items, everywhere?

Checked by `node tests/scripts/ws-options-verify.cjs` for every value of every shown option:

| Surface | What must hold |
|---|---|
| gen | seeded `generateQuestionFor` items differ from the default and satisfy the option's predicate |
| print | `buildSheet` pupil page differs, the predicate holds on the printed items, the key carries the answers |
| screen | the set's option store drives the online worksheet and live practice (and so the quiz builder and boss / race) the same way; the practice card renders |
| trip | `optionSuffix` → `decodeOptionPayload` round-trips the value (share link, MX- code) |

Score: 10 = every value passes every surface; 9 = warnings only; 8 = one value fails a soft
predicate on one surface; 7 or less = any hard failure (see caps).

### O5 · Clarity — plain wording, sensible defaults, no dead or duplicate controls

- Labels are plain teacher English ("Numbers to", "Regrouping", "How it is written"); no internal
  jargon ("band", "responseScope", "Level 5" for a feature name).
- Each value label says what the pupil will see ("Across (8 + 7 = __)"), not a code.
- The default is the stand-alone value a teacher printing a quick page would want (R2), and the
  panel shows which value is the default.
- No two controls do the same thing (a Max Number beside a "Numbers to"; a Support level beside a
  "Pictures" that the level also removes).
- The help line says honestly what the control does, including exceptions ("multi-digit stays
  stacked").
- The panel fits: ≤ 5 controls, a set with > 8 values offers "All" / "None".

---

## 2. Anchors

| Score | Meaning |
|---|---|
| 10 | A specialist teacher would configure every step of the ladder from this panel and change nothing. |
| 9 | One cosmetic nit (a label a word too long). |
| **8** | **Pass.** Every control is right and works; a teacher can go easier/harder and more/less support. |
| 7 | One real defect: one missing essential option, one value that is a dead end, one misleading label. |
| 6 | Several real defects, or one that sends a wrong page to a pupil. |
| 5 | Usable only with the author explaining it. |
| 4 | A shown control is ignored by the generator, or an essential option is missing. |
| 3 | The panel is mostly dead or mostly missing. |
| 1–2 | No panel where the family needs one; or the panel crashes. |

Score down when in doubt. A score of 8+ must be defensible in one sentence.

---

## 3. Hard caps (automatic)

| Id | Condition | Cap |
|---|---|---|
| OC1 | A shown option value does nothing on **every** surface (verifier: gen, print and screen all identical to the default) | O4 ≤ 3 |
| OC2 | An option is shown for a skill whose generator ignores it (all its values OC1) | O1 ≤ 4 and O5 ≤ 5 |
| OC3 | A value works on screen but not in print, or in print but not on screen | O4 ≤ 5 |
| OC4 | A value breaks its own promise (a fact outside the ticked constant; a number over "Numbers to"; decimals with "Whole numbers") | O4 ≤ 4 |
| OC5 | A value does not survive a share link (round trip fails) | O4 ≤ 6 |
| OC6 | A value only works after the teacher raises a setting that is not on the panel (**gated** by Max Number) or is refused at the default setting | O4 ≤ 6, O5 ≤ 7 |
| OC7 | One control moves two things at once (number size and support) — P-1 | O2 ≤ 6 |
| OC8 | A support level removes a **structural** scaffold, or a hint scaffold cannot be faded at all | O3 ≤ 5 |
| OC9 | The family's essential option (§1 O1 list) is missing | O1 ≤ 6 |
| OC10 | No option is shown at all and the skill has both a number size and a hint scaffold | O1 ≤ 3, O2 ≤ 3, O3 ≤ 3 |
| OC11 | Two controls duplicate each other, or a value label repeats | O5 ≤ 6 |
| OC12 | A value makes the generator throw, return nothing, or hang | O4 ≤ 2 |

---

## 4. What the critic returns

One row per skill in `OPTIONS-AUDIT.md`:

```
| skill | O1 | O2 | O3 | O4 | O5 | caps | pass |
```

and, for every score below 10, a defect line: criterion, the concrete defect, and the fix, grouped
by the generator file that must change (fix agents own files, not skills).

Rules for the critic:
- **Evidence or nothing.** O4 comes from the verifier report; O1–O3 and O5 from the live panel and
  the generated items.
- **No praise, no hedging.** Report problems.
- **Grade what is shown to the teacher,** not the option model: an option in `SKILL_OPTIONS` that
  `offeredOptionsFor` hides does not count, and a measured option that is shown does.
