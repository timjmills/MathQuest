# Card note: Pre-skill Check + Quick review (PSC-REVIEW)

Signed: lead, 2026-11-20 (owner ruling 2026-11-20, signed by the lead under delegated approval). Lane lf-roles. Build at medium (a new section) next week; card and checks this week.

## Why
A Pre-skill Check is a short check: 12 items at M and 8 at L (lead ruling 1c). On a one-prerequisite fact sheet that leaves
42–61 % of the page white (EB-PAGE on master: add/sub/mult_facts M 42 %, L 60 %; div_facts M 53 %, L 61 %). Neither taller
cells (A) nor rows of 3 (B) fills it without empty bands inside the cells. The owner's ruling is to fill the white with review.

## The page (top to bottom)
1. Header and title as today: "Pre-skill check: <topic>".
2. **Check band(s)**: the prerequisite items, exactly as today (12 M / 8 L ceiling, R13 2+2 for two-page sheets, its
   instruction strip). Cells use capped A: they grow only up to the EB-BAND limit (≤ 30 % band, about 52 mm at M for a fact cell),
   never stretched beyond it. The check's own score: **"Check __/n"**.
3. **"Quick review" band**: a titled band under the check, filling the rest of the LAST page with whole rows only (no stretched
   rows). Its own score: **"Review __/m"**.
   - Items: mixed items from EARLIER skills (previous grades and earlier lessons of the pupil's grade). Rotation: **one item per
     DOMAIN in turn**: Counting & Cardinality, Operations & Algebraic Thinking, Number & Operations in Base Ten, Fractions,
     Measurement & Data (measurement items), Measurement & Data (data items), Geometry. Only the domains the pupil's grade allows
     (K: no Fractions; Fractions from grade 3 onward).
   - Pool order: skills in `redesign-passed.js` (8/10-passed) first, then other live skills at or below the grade.
   - **Never** the lesson's own skill and never its prerequisites, since those are the check.
   - Each item keeps its own skill's option defaults and its own kit cell. The band groups cells by height as the Review role's
     bands do (each band takes the columns and row height of its own items). A cell too tall for the remaining room is passed
     over for the next domain's item. It is never shrunk.
   - Labels continue the check's lettering. The review items are numbered after the check.
   - The band's instruction line names its tasks, "Quick review. Solve each one.", so INSTR-SLOTS passes (lead, at signing).
4. Footer as today.

**Answer key**: a facsimile of the pupil page. Each review answer carries a small grey label giving its skill and domain
(e.g. "Base Ten · Round to 10"). The check's answers are unlabelled, as today.

## Reuse (no new engine)
- Dealing: the existing review / daily-review / mixed sources (`sources(skills, { earlier })`, `poolItems`, the Review role's
  band builder in `roles/review.js` and `compose.js`). Domain tags come from `SKILL_STANDARDS` (CCSS domain of the primary code),
  falling back to `DOMAINS` in `data.js`.
- Seeded through `generateQuestionFor` with the sheet seed. The same request gives the same page, byte for byte.
- Layout: `paginateBands` plus the existing whole-row fill (`fillBands`). The review band is the last band and is never split
  across pages.

## Checks (check first, each must FAIL on master)
- **EB-PAGE on PSC** (commit 6e130f36f on -lf-roles-psc2): every PSC page, including an at-ceiling last page. It fails on master
  9 times and must PASS by the review fill.
- **PSC-REVIEW-DOMAINS** (new, in ws-roles-unit or a node check):
  - the review items rotate across the grade's domains, with no domain repeated before every allowed domain has appeared;
  - no review item's skill is the lesson skill or one of its prerequisites;
  - the items are seeded and reproducible (two builds are identical).
- **PSC-SCORES** (new): the page prints two separate scores, "Check __/n" with n = the check items and "Review __/m" with
  m = the review items. The key labels each review item with skill and domain.
- Existing gates stay green: EB-BAND, EB-SIDE, EB-LASTPAGE, CAP-PARITY, capacity-pin (the review items are new rows, so
  rises), lesson baseline (a lesson that embeds a PSC changes only there, with its reason listed).

## Hosts and roles
- Print: the PSC page at M and L.
- Screen: the PSC page in the online worksheet shows both bands with their two scores.
- Lessons that embed a Pre-skill Check use the same page.

## Out of scope
- No change to the check items themselves or to the ceilings.
- No new cell templates.
- Multi-prerequisite sheets that already fill their pages get a review band only where white is left under the last row.
