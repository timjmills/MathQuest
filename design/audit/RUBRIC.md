# Skill Quality Rubric — print and screen, 1 to 10

**Version 1 · 2026-09-24 · owner-approved rules:** every criterion must score **8 or more** on
**every** graded version of a skill, on paper and on screen. One criterion at 7 anywhere is a fail,
and the skill goes back for redesign until it passes.

This rubric is what the **independent critic** uses. The critic is an agent that did not write the
code it grades. It reads this file, the standards it cites, and the rendered PNGs, and nothing else
about the implementation. It is not shown the author's intent, only the skill's **name** (its
declaration) and the answer key.

It complements the automated gates, it does not replace them:

| Gate | Reads | Catches |
|---|---|---|
| `ws-content-audit` | question objects | the maths contradicting the skill's name |
| `ws-print-lint` (L-INK, L-FONT, L-OVERFLOW, L-SPLIT, L-DENSITY, L-KEY subset) | rendered DOM | colour, font, overflow, split cells, page fill, key/page mismatch |
| **this rubric** | rendered PNGs | whether a pupil can use it, whether it teaches, whether the page is well spaced, whether it looks like the owner's workbooks |

A version that fails an automated gate is not sent to the critic: it is already a fail.

---

## 1. What gets graded

For every skill in scope:

**Print** — every page type the skill can be printed as (`design/PAGE_TYPES.md`), each as a
**pupil page** plus its **answer key**. A multi-page sheet is graded as one version. A skill that
cannot be produced on a page type the standard says it must support (SC-3) scores 1 on that page
type: it is a missing version, not an exempt one.

**Screen** — four hosts:

| Host | Widths |
|---|---|
| Practice card (the single-question game card) | 1280 desktop, 820 tablet, 390 phone |
| Online worksheet grid (`worksheetView`) | 1280 |
| Quiz-taking view | 1280 |

Each graded **version** (one page type, or one host) gets four scores.

---

## 2. The four criteria

Each is scored 1-10 against the anchors in section 3. The critic scores what it can **see**; it
never gives credit for what the code "probably" does.

### C1 · Ease of use — can the pupil do it alone?

The pupil is 5-11, reads with effort (ELL / special education), and holds a pencil or a finger.

Print checks:
- One instruction, above the cells, ≤ 12 words, starting with a print verb (Write, Circle, Check,
  Draw, Color is not allowed — no colour). No screen verbs on paper (click, tap, drag, select, press).
- The pupil can tell **where** to answer and **what kind** of answer (a number, a sign, a check
  box, a circle) from the slot's shape alone. One slot shape per section. No doubled slots (a check
  box and an "Answer: ___" on the same item).
- Writing room: every slot is big enough to write in at the page's size (≥ 14 mm lines; 8-10 mm
  writing height). A "draw it" item has room for everything the answer needs (9 rods need 9 rods of
  space).
- **The task makes sense on paper.** Work it through as the pupil would, with a pencil, for the
  hardest item on the page: is there room to draw the whole model the answer needs (for "build 169
  with place-value disks": 1 hundred, 6 tens and 9 ones, each at least 8 mm across, in their own
  zones)? Is the model zone empty and big enough, not filled with lines, captions and blanks? Does
  every part of the item have a job on paper (no speaker icons, no "drag", no zone that only works
  with a mouse)? Could a pupil who has never seen the screen version do it from the page alone?
- Every label, number and picture needed to act is legible: nothing black-on-black, clipped,
  overlapped, or too small (text a pupil must read ≥ 11 pt; digits the largest thing on the page).
- The same task looks the same in every cell of a section (predictable routine, AX-4).

Screen checks:
- The input is obvious and in the same place the paper slot is; it accepts what the item asks for.
- Touch targets ≥ 44 × 44 px on tablet and phone; digit inputs ≥ 48 px tall.
- No horizontal page scroll; the whole item (picture + input + Check) is reachable without it.
- Screen verbs on screen, print verbs on paper (BD-11 swap map).
- Chrome (XP, Skip, Hint, speaker) does not crowd, cover, or compete with the question.

### C2 · Educational value — does it teach the named skill well?

- The items do what the **name** says, all of them, and nothing else.
- The representation fits the maths (ten frame for making ten, place-value chart for place value,
  a number line where the skill is about position) and is **drawn so it teaches**: parts visible,
  counts countable, the picture matches the answer.
- Items vary sensibly within the band (not six near-identical items; not one trivially easy item
  in a hard set), and include the edge cases the research names.
- Scaffolds suit the page type: structural scaffolds persist, hint scaffolds fade (PEDAGOGY 4).
- Nothing gives the answer away (no answer in the picture, the caption, or the `aria-label`).
- The answer key is correct for every item. One wrong key caps C2 at 3.
- On screen: the task is the same task as on paper (no production item turned into multiple
  choice), and the feedback teaches (shows the right answer or the next step, not only a red X).

### C3 · Spacing and layout — is the page (or screen) well spaced?

Print checks:
- The page is **full but not crowded**: items per page within the ceiling for the page type
  (WORKSHEET_DESIGN_STANDARD 12.1) and at the capacity the table allows. No page holds a lone item
  or a half-empty page when more would fit; a short last page is rebalanced.
- Cells are equal in size across a section, arranged in a regular grid, with ≥ 40 % free area.
  The problem sits in the top half of its cell; the answer in the same place in every cell.
- Nothing is split across a page break; no footer or page-end marker in mid-page; header and
  footer on every page.
- White space is deliberate: no huge empty bands, no cramped rows, no cell with a tiny visual
  floating in a big box, no visual crushed into a corner.
- The answer key has the **same geometry** as the pupil page (a facsimile), not a list.

Screen checks:
- The question is the visual centre of the card: digits large (practice card 40 / 48 / 56 px at
  phone / tablet / desktop; online worksheet 29 px), the visual big enough to read and count.
- The online worksheet grid has even cells, a consistent layout for every item of one skill, and
  no card that is a different "type" from its neighbours.
- Nothing overflows its card; nothing is cut off at 390 px.

### C4 · Standard fidelity — does it look like the owner's workbooks?

Measured against `WORKSHEET_DESIGN_STANDARD.md`, `PEDAGOGY_STANDARD.md`, `design/PAGE_TYPES.md`
and the approved mock-up pack (`design/mockups/out/png/`, section 5 below).

- **Black, white and one grey** inside the sheet and inside the on-screen cell. No colour, gradient,
  drop shadow, emoji, clip-art, or rounded "card" chrome on paper. Solid black fills only up to
  7 mm (INK-5); larger shapes are outlined or grey.
- **Andika** for every character of question content, on paper and in the screen cell. No serif
  fallback, no JetBrains Mono, no Nunito inside the cell.
- The page frame: Name / Date / Score `/N` header, the strand tab (`Level N` · strand · sheet id),
  one "I Can …" title (or the fixed title for that role), a 2.25 pt rule, instruction line, the
  cell grid, a 7 pt teacher footer. No "Part 01" headings, no shadowed heading cards.
- Labels per look: quiet letters (I Can) or black number tabs (Daily), one sequence per sheet.
- Stacked arithmetic on a digit grid (operator in its own track, rule under the full width);
  fractions stacked over a bar, never slashed; true operator glyphs (−, ×, ÷).
- Answer key: facsimile, answers in Andika 700 where the pupil writes, "Answer Key" in the tab.
- Screen: the cell is paper-white with ink in light and dark theme; chrome keeps its colour and
  stays outside the cell (SP-2, SP-30).

---

## 3. Anchors (all four criteria)

| Score | Meaning |
|---|---|
| **10** | Indistinguishable in quality from the approved mock-ups. A specialist would not change anything. |
| **9** | Excellent. One cosmetic nit that no pupil or teacher would notice. |
| **8** | **Classroom-ready (the pass mark).** Nits only; nothing that slows a pupil, misteaches, wastes paper, or breaks the look. |
| **7** | One real defect a teacher would notice and want fixed (a cramped row, one unclear visual, an instruction that says too much, uneven cells). |
| **6** | Several real defects, or one that costs a pupil time or ink (doubled answer slots, half-empty page, visual too small to count). |
| **5** | Usable only with a teacher explaining it. |
| **4** | A defect blocks some items (hidden labels, picture contradicts the key, unreachable input). |
| **3** | Most items are hard to use or teach the wrong thing; or a wrong answer key. |
| **2** | Broken for nearly every item. |
| **1** | Missing, blank, or crashes. |

Score **down** when in doubt. Never round up. A score of 8 or more on a criterion must be
defensible in one sentence naming what is right.

---

## 4. Hard caps (automatic)

A cap sets the **maximum** for the criterion named, whatever else is right.

| Id | Condition | Cap |
|---|---|---|
| H1 | Any item's answer key is wrong, missing, or does not match the pupil's slots | C2 ≤ 3 |
| H2 | Information needed to answer is hidden or illegible (black on black, clipped, overlapped, below 8 pt) | C1 ≤ 4 |
| H3 | An item contradicts the skill's name | C2 ≤ 4 |
| H4 | Colour, gradient, shadow, emoji or a non-Andika face inside a printed sheet or the on-screen cell | C4 ≤ 5 |
| H5 | A page wasted: a page < 50 % used while its role expects more, a lone item on a page, a split cell, a mid-page footer | C3 ≤ 5 |
| H6 | Screen: horizontal page scroll, an input off-screen, a touch target < 44 px on tablet/phone | C1 ≤ 5 |
| H7 | A screen verb on paper or a paper verb on screen | C1 ≤ 6 |
| H8 | A production item turned into multiple choice on screen (SP-3), or a doubled answer slot | C4 ≤ 6 |
| H9 | No room to write or draw the answer | C1 ≤ 5 |
| H10 | Answer key is a list rather than a facsimile of the page | C4 ≤ 6 |
| H11 | A page type the skill must support cannot be produced | all four = 1 for that version |
| H12 | The task does not make sense on paper: the space to draw or build the model is smaller than the hardest item needs, or the item only works with a mouse or finger | C1 ≤ 4, C2 ≤ 5 |

---

## 5. Calibration references

- **What 10 looks like** — the approved mock-up pack, built by `node design/mockups/build.cjs`:
  `01-computation-p1.png` (Daily look, stacked addition), `05-level-k-number-sense-p2.png`
  (I Can look, count and write), `02-fact-fluency-p*.png` (fact rows), `04-lesson-packet-level2-p*.png`
  (opener, guided, independent), `09-thinking-pages-p*.png`, `10-visual-grids-p*.png`.
- **What 3-5 looks like** — the owner's printout of 2026-09-24 (`design/audit/reference/owner-printout-2026-09-24/`):
  black place-value disks with invisible labels (H2), blue disks on paper (H4), solid black
  fraction bars with no parts, "Part 01" shadowed headings holding the wrong strands, pages with
  two items and half the page empty (H5), "Build 90 with base-10 blocks" in a 25 mm box (H9),
  "Build 169 by drawing place value disks" in three 25 mm zones already holding a rule, a caption
  and a "___ disks" blank, so nine ones disks cannot be drawn (H12), a list answer key (H10).

---

## 6. What the critic returns

One JSON object per skill, appended to the run's `grades.jsonl`:

```json
{
  "skill": "addition:add_20_regroup",
  "label": "Add Within 20 (Bridging Ten)",
  "versions": [
    {
      "surface": "print",
      "version": "independent",
      "scores": { "C1": 8, "C2": 9, "C3": 6, "C4": 7 },
      "caps": ["H5"],
      "pass": false,
      "defects": [
        { "criterion": "C3", "severity": "major", "where": "page 2",
          "what": "Page 2 holds 2 of 20 items; 80 % of the page is empty.",
          "fix": "Rebalance the last page or print 18 items (3 full pages)." }
      ]
    }
  ],
  "pass": false,
  "summary": "One sentence: the thing that most needs to change."
}
```

Rules for the critic:
- **Evidence or nothing.** Every score below 10 names at least one defect with its location
  (page, item letter or number, host and width). Every defect names the criterion it costs and a
  concrete fix.
- **Severity:** `critical` (triggers a cap), `major` (costs ≥ 2 points), `minor` (costs 1).
- **No praise, no hedging.** Report problems. "Looks fine" is not a finding.
- **Grade what is rendered,** not what the generator intends. If the PNG shows it, it is real.
- **Do not grade the chrome's colours** on screen (SC-2), only whether the chrome crowds the cell.
- A version passes when all four scores are ≥ 8 and no cap applies. A skill passes when every
  version passes.
