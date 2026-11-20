# Card critic r4 (final): Mixed review (lf-mixreview @ f10f5cea)

Independent critic, Opus medium. I did not write this card or grade rounds 1–3.

## Runs

All four modes are OK: default (15 props, 50 fixtures, all 33 FAIL fixtures caught), `--fill` (0 / 0 / 0), `--trace` (117 sentences), and `--table`, whose output equals §3.

My own probes used scratchpad copies. The dealer was not changed.
- **Code round trip** (encode → decode → replayInput → deal), on 10 pools × N × M/L × 3 orders × 300 seeds: **501 of 108,000 sheets re-deal a different sheet.**
  - pool-kinds at M: N = 15 fails 52/300, N = 20 fails 36/300.
  - pool-large at L fails too.
  - Example: `?c=BD3-BC3-BA2-BE2|V1-N10-SD-Zm` deals 3+2+3+2 on 2 pages, but replays as 4 long-division items on page 1.
  - Replaying the replay is always stable (146 of 146 cases).
  - Day codes: 0 bad of 14,400.
- **Trace detector**, with untagged sentences planted:
  - Passes: "No page holds more than 9 items." (in §2 and in §3), "Pages should not exceed 9", "A shelf cannot split", "Only the last page may be short", "The dealer refuses …".
  - Passes: "… [P:h]. a page holds at most 3 skills." The splitter merges it into the tagged sentence before it.
  - Widening NORM finds 18 orphans already in the card, for example §7a Compatibility, Adapt, Weekly set and Order modes. Keyword-free rules are also untagged: Header "Score ___ / N", "Key pages = …".
- **Comeback**: the dealer is right on 3,410 days. Prop f does not check it.

## Scores

| K1 | K2 | K3 | K4 | K5 |
|---|---|---|---|---|
| 8 | 5 | 7 | 6 | 8 |

**Verdict: FAIL (minimum 5, K2).**

## Round 3 re-check

| # | Status |
|---|---|
| 1 V1 freeze | FIXED (4 sha pins, 20 golden codes, frozen table). New issue: defect 6 |
| 2 lone item | FIXED (l, `--fill` 0) |
| 3 flat one | FIXED (j2) |
| 4 kind → class | PARTLY: the dealer is fixed, the plan is not (defect 5) |
| 5 seed formula | PARTLY: §2 and §7a are fixed; §9b step 3 still says "try r = `deriveSeed('mixed-review', S, day, i, r)`" |
| 6 trusts report | PARTLY: c, e and k recompute; f, g, h and j do not (defect 3) |
| 7 no-S | FIXED |
| 8 two codecs | FIXED as a step-1 deferral (acceptable); `~opts` decided |

## Defects

1. **The identical mix does not hold (K2; the owner rule).** A single-sheet code replays through the dealt list alone, so the dealer re-chooses with a smaller cycle. In 0.46 % of sheets the pupil's or printed sheet differs from the teacher's preview. The rate is up to 17 % on kind pools. §2 rule 8 [P:a] and §7a "Identical" are false.
   - **Fix:** `deal()` returns the replay of its own code. That is: deal, then `encode`, then `replayInput` over the dealt rows, then re-deal; this is one pass, and it was stable in all 146 cases. Assert `deal(replay(code(x))) == deal(x)`, and pin it.
2. **Prop a is never swept (K4).** It runs on 2–6 seeds a fixture, and none of the 501 failures falls in them.
   - **Fix:** add prop a, plus the code's counts versus the replay's counts, to `--fill` (every pool × N × size × order × 300 seeds + weeks). Add a FAIL fixture `fail-a-replay-drift`: the mutation drops the fixed-point pass, using a seed from the list above.
3. **Properties that trust the dealer (K4).**
   - f exempts whatever `d.comeback` the dealer reports, and does not check days 1–2.
   - g leaves out whatever skills the dealer lists in `p.topUp`.
   - h and j read `D.SHELF` and `D.SHELF_MAX`, although the file header says "never the dealer's".
   - **Fix:**
     - f recomputes the comeback as the first skill of day d − 2 not on day d − 1. It asserts that the comeback is `pages[0].skills[0]` and is null on days 1–2.
     - g recomputes the top-ups as the skills added after the page's opening group.
     - Add `OWN_SHELF` = {m: 3/3/1, l: 4/2/1} and `OWN_SHELF_MAX` 7/5. Add one FAIL fixture for each (`lieComeback`, `lieTopUp`, `shelf`).
4. **The trace misses common normative forms (K4).**
   - **Fix:**
     - Invert the default: every sentence of a §2/§3 bullet, every §7a bullet and every §7a Decision cell is normative unless it is marked `[I]` (informational).
     - Split before lowercase or digits after `]. `.
     - Tag the 18 orphans found, plus Header and Key pages.
     - Add trace FAIL fixtures "No page holds more than 9 items." and "… [P:h]. a page holds …".
5. **Step 2 bypasses KIND_CLASS (K2, K3).** §9b step 2 builds registry rows `{id, code, grade, area, fc}` "from the skill's footprint class". A row with `fc` is used as is (`rowOf`), so the live footprint, not V1's frozen kind table, would class the skills.
   - **Fix:** the rows carry `kind` (the `StaticFootprint.kind`), never `fc`. MIX-REVIEW-POOL fails on a product row with `fc`.
6. **The V1 table's code source (K2).** Step 2 generates codes "from `data.js`". Unpinned `SKILL_CODES` are auto-assigned and can move (skill-codes-frozen.js header). The fixture table's codes also contradict `FROZEN_SKILL_CODES`: AA is `counting:count_objects` there, but `addition:within_10` in the table. The §7a examples read as if they were real codes.
   - **Fix:**
     - Build the table from `FROZEN_SKILL_CODES`. Any pool skill without a pinned code is pinned (appended) first.
     - The step-2 check asserts row.code === FROZEN_SKILL_CODES[id].
     - Mark the proto codes "synthetic" in §7a.
7. **"Placement grade" is false (K2).** §2 easyhard and area modes, and the §7a Order modes, say "placement grade". The dealer and prop d sort by the table's `grade`. The table has no placement, and placement moves with the pacing file.
   - **Fix:** say "the frozen V1 table's grade", which keeps replay stable.
8. **§9b step 3 seed formula (K2):** replace it with the §7a wording (try 0 = `item.seed`, four parts; try r ≥ 1 = five parts, S′).
9. **Step 1 core mapping is incomplete (K1).** "b, c, d, e, h, j, k → COUNT" leaves out j2 and l, and m and n are not mapped.
   - **Fix:** copy the §8 V1-core column into step 1.
10. **Minor (K2):** 12.1 sets word-problem rows at L to "2 if 4–5 lines", but KIND_CAP has 3.
   - **Fix:** add a `word-problem-long` kind with a cap of 2 at L, or state that the ruling waives it.

## The builder's unproven items

- Two-codec equality at step 1: acceptable. It needs the app path, and defect 6 adds a Node assert that can run now.
- Shelf-k engine match in the browser: acceptable. It is named `count-shelf-k-differs`.
- The X-tagged checks unbuilt: acceptable. They are named in §8 with a FAIL state each, and step 1 lands them first.
- The fixture-only registry: acceptable at card stage, provided defect 6's source rule and marking go in.

None of these is the failure. The failure is defect 1: a promise the prototype breaks, which its check cannot see (defect 2).
