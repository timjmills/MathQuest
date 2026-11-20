# Card critic r3: Mixed review (lf-mixreview @ 61952883)

Independent critic, Opus medium. I did not write this card and did not grade r1 or r2.

## Runs

- `check-v1.mjs` gives OK (11 props, 31 fixtures; all 17 FAIL fixtures CAUGHT).
- `--fill` gives OK (0 non-last pages under half full).
- `--table` equals §3.

My own probes, with scratchpad scripts and the dealer unchanged:
- 17,280 sheet round trips and 16,000 day-code round trips, all identical.
- No skill has a sheet total of 1.
- The fill recomputed from the shelves equals the fill the dealer reports, and no page fills more than one page.

The imports are the real `sheet/interleave.js` and `sheet/rng.js`. The codec is the prototype's own, not `skill-codes.js`.

## Scores

| K1 | K2 | K3 | K4 | K5 |
|---|---|---|---|---|
| 8 | 6 | 7 | 7 | 8 |

**Verdict: FAIL (minimum 6, K2).**

## r1 re-check

| # | Status |
|---|---|
| D1, D2, D3, D6, D7, D8, D9, D10, D11, D12 | FIXED |
| D13 | FIXED (named; built in step 1) |
| D4 | FIXED (new small defect 5) |
| D5 | PARTLY (defect 1) |

## r2 re-check

| # | Status |
|---|---|
| N1 | FIXED (pass-wide-single checked) |
| N2 | PARTLY (defects 1 and 4) |
| N3 | FIXED, but the card text is false (defect 3) |
| N4, N5, N7, N8, N9 | FIXED |
| N6 | FIXED (17 proto fixtures; the rest are named for step 1) |

## Defects

1. **The V1 freeze does not freeze the deal (K2, K4).**
   - Prop i hashes only `dealer-v1.mjs`. The deal also depends on things nothing pins:
     - the imported `dealCounts`, `interleave`, `shuffle` and `deriveSeed`, which lf-engine owns and edits;
     - the registry row of each skill (`fc`, `grade`, `area`), read from the app when a code is replayed.
   - So a change to `interleave.js`, or a skill whose footprint class or grade changes, re-pages and re-orders every old V1 code. Prop i still passes.
   - That breaks "skills, counts, pages, order never change under V1".
   - **Fix:**
     - Pin the sha256 of `interleave.js` and `rng.js` in `frozen.json`, or vendor frozen copies under V1.
     - Add a golden fixture: about 20 codes (sheets, weeks, days, M/L, every order) mapped to their pinned item lists. MIX-REVIEW-SHARE asserts it.
     - Freeze a V1 class table (`code → fc, grade, area`; new skills appended) that replay reads instead of live footprints.

2. **A lone item on a page (K2, RUBRIC H5).** With `pool-2mix`, N = 25 at M, 93 of 200 seeds end 4 / 11 / 4 / 5 / **1**. That is one number line alone on page 5.
   - H5 names "a lone item on a page" separately from "under 50 %". Ruling §9.18(a) waives only the second.
   - **Fix:** a rule and a property l: no page holds fewer than 2 items. Rebalance the last two pages, or merge by fill.
   - Add a FAIL fixture with a `noLoneGuard` mutation and a COUNT state `count-lone-item`.

3. **A flat skill gets one item on a page (K2, K5).** With `pool-2mix`, N = 20 at L, seed 1, page 4 is number line · **1 addition item** · number line. That is a one-problem section with its own band strip, between two other tasks.
   - §2 rule 5 says "One item of a skill is allowed only as a wide shelf of 1". The guard in `dealer-v1.mjs` (line 172) exempts the case where the item exhausts R.
   - Prop j allows it, because a 1-cell shelf counts as a "last" shelf.
   - **Fix:** the top-up takes c ≥ 2 for any flat skill with no exception, or skips that skill.
   - Add prop j2: every flat skill on a page holds ≥ 2 items. Add its FAIL fixture.

4. **The footprint to class mapping is not defined, and three classes do not cover 12.1 (K1, K2, K3).**
   - The registry `fc` is "the skill's footprint class", but `StaticFootprint.kind` has 10 kinds: fact, stack, equation, division, visual-half, visual-full, table, text, word-problem, legacy. No mapping exists.
   - 12.1 sets 3 a page at L for plain word-problem rows and 4 for long division. Treated as "typical", they would get 8 at L.
   - Legacy cells: `mixedClass` refuses M1 for them (critic M1 r1 D2). The dealer would still choose `m1` for a page of two legacy compact skills.
   - The frozen `SHELF` k (M compact 3) can also differ from the k the passed engine picks (`factPick`).
   - **Fix:**
     - Write the kind → class table into V1.
     - Add a class for word problems and long division (CAP M 3 / L 3, or the 12.1 values), or map them to wide.
     - Make legacy cells never `m1`.
     - State that SHELF k equals the passed M1 / GROUPED geometry, or that the engine draws the given k within DN-10. Name the check.

5. **The seed formula is false (K2).** The card says "try r = `deriveSeed('mixed-review', S, day, i, r)` (V1 gives r = 0: `deriveSeed('mixed-review', S, day, i)`)".
   - I measured `deriveSeed(…, 3)` = 2992776603 and `deriveSeed(…, 3, 0)` = 2307576231. They differ.
   - Week items are seeded from the day seed, not from S.
   - **Fix:** say "try 0 = `item.seed` (four parts); try r ≥ 1 = five parts". Say "S" or "the day seed" as the dealer does.

6. **Some properties trust the dealer's own report (K4).**
   - k and the 2-up test of e read the reported `p.fill`.
   - c reads `p.skills`.
   - A dealer that reports the wrong thing passes all three.
   - **Fix:** recompute each from `shelves` plus the pool, as h already does for fill > 1.

7. **The no-S FAIL fixture is caught by luck (K4).** `decode` turns a missing S into seed 1. The fixture is caught only because 4242 ≠ 1.
   - **Fix:** refuse a V1 code without S, as Z is refused, and catch it on that error.

8. **Two codecs (K3, K2).**
   - Prop a proves the prototype's `encode` / `decode`. The product codes go through `skill-codes.js`.
   - The card's skills part carries `~option`, but `encode` writes none.
   - **Fix:** MIX-REVIEW-SHARE asserts that `generateEnhancedSkillCode` output equals `D.encode` byte for byte (or the product imports `D.encode`). Decide `~opts`: in the prototype, or dropped from the card.

## Open items

- **Browser checks named but not built:** acceptable at card stage. Step 1 lands them first, as pending backtests, one fixture per state.
- **A pool of exactly 2·k:** the week alternates A/B/A/B/A, as `pool-6` shows. That is sound spaced retrieval: each set comes back 2–3 times and nothing falls on consecutive days. But the comeback becomes a no-op there. State it in "Weekly set". This is not a defect.
- **Research:** a page type is not a skill. Step 2 does it before the move, while no V1 code is in the wild. Acceptable, provided it is done before the V1 pin moves into `js/modules`.

## Round-cap note

Defects 1–4 are the r2 N2 class again: a card sentence that no property asserts. Root-cause check: every normative sentence of §2, §3 and §7a about the deal gets a property id in the card, and check-v1 fails on any rule sentence without one. The four defects above need only the dealer and check changes listed. They are local, and they do not change the engine plan.
