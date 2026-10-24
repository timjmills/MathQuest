# Critic r7: Wave 0 part A, the five precritic checks from the pilot-su-c critic r1 (fix r6)

Critic: independent, mq-opus-medium. Round 7, 2026-10-23. Branch `claude/sweet-newton-c8wrv1-wip-wave0-gates` at 83093783.

Scope:
- `ws-sibling-compare`, `ws-slot-clip`, `ws-phone-card` and `ws-card-rulings`, and how `ws-precritic` wires them in.
- The `tests/fixtures/precritic` fixtures and the eight `*-pilot` backtest rows.
- The spec-card rulings block: `ws-spec-card` `rulingsBlock` / `--rulings-only`, the README section, and the subtraction `card.json` rulings.

I edited no tracked file. Scratch work went to a detached worktree, since removed. The git tree is clean, and no `mq-slotclip-*` or `mq-sibling-*` temp directory leaked from my runs. Five `mq-slotclip-*` directories from 20:24–20:29 are left over from before fix r6.

## Verdict: FAIL

| Criterion | Score |
|---|---|
| 1. Does what the lead asked | 7 |
| 2. The backtests are real | 9 |
| 3. Usable by a builder | 7 |

## What I ran

**Backtests.** `ws-backtest --row` on the eight pilot rows: **8/8 PASS**, 307 s.

**Self-tests:**
- `ws-sibling-compare`: 13 cases
- `ws-card-rulings`: 22 cases
- `ws-spec-card`: 42 checks
- `ws-phone-card`: 7 fixture pages
- `ws-slot-clip`: 4 fixture pages

**The r6 defects, each with its original reproduce:**

| r6 defect | Reproduce | Result |
|---|---|---|
| D1 (unpinned skill never compared) | `state-run bad.state.json`, `ws-sibling-compare --skills subtraction:sub_2d_1d --rows single/ex-group --sizes S --run-siblings` | **FIXED.** FAIL, "1 PENDING(no-baseline)" row compared. ABOVE H13 16 vs 0 and TY-11 12 vs 8 (paired siblings add_100_regroup and sub_100_regroup) |
| D2 (phone-card FOCUS false FAIL) | `ws-phone-card --skills subtraction:sub_1m_regroup,addition:add_10k_regroup,subtraction:sub_100_regroup --items 2` | **FIXED.** OK at both sizes; the ones box is found by `data-col` or by place attribute. A14 clean |
| D2, BAD state | the same tool on the r1 tree | FAIL for the r1 reasons: FOCUS on place 3 and place 5, CLIP-X 13 / 17 px on sub_1m. A14 is clean on that tree too, so the FAIL is the lane's own |
| D3 (partial rulings scope read OK) | `--rulings pilot-su-c/rulings.json --skill subtraction:sub_100_no_regroup,addition:add_100_regroup --check rulings` | **FIXED.** `INCOMPLETE - not checked: addition:add_100_regroup`, exit 2. `PARSE.cardRulings` reads it as `INCOMPLETE (partial rulings)` |

**Card rulings on the real card.** `ws-card-rulings --skill subtraction:sub_100_no_regroup` now runs on the real card:
- `--check rulings` FAILs on three rulings:
  - R-BAND-100: 118/300 items outside 51..99
  - R-SAME-LENGTH: 40/300
  - R-ZERO-NOT-SEEDED: 44.3 % against at most 10 %
- `--check offered` FAILs on N-BAND (band is offered).
- All four are real defects of the generator against the card (§9.2–9.4 and §7). They are the pilot's to fix.
- `--rulings-only` is idempotent on both cards.

**Precritic.** `ws-precritic --skill subtraction:sub_100_no_regroup --browser-jobs 1` gave FAIL: 4 FAIL, 13 PASS, 1 N/A of 18. The failing rows are sibling-compare, slot-clip, card-rulings and card-not-offered. I judge each FAIL under "Is the precritic FAIL real?" below.

**The heads backtest.** On the extra/supports-on page at S:

| State | Result |
|---|---|
| BAD | FAIL |
| `good.patch` alone | still FAIL, 24 overlapping pairs |
| `good-d7` | OK |

## Are the backtests honest?

**The two sibling rows scoped to `--rules H13`: honest.** I re-ran the GOOD state without `--rules`. It still FAILs on exactly one count: `single/ex-group S TY-11 12` against the paired 8. That is a real remaining r1 defect: 7 pt step numbers on two worked examples. `good.patch` does not touch it, and the lead's own `sibling-compare.txt` lists it. Scoping each row to the defect it was built for is fair, and the row's `state` text says so.

**The D7 seeded stand-in: honest, and labelled as such.** `good-d7.patch` widens the tracks to 1.3 em only for a stack with heads at t ≥ 6.
- The probe goes quiet for a geometric reason: the head count probed drops from 192 to 144 because fewer cells fit a page. Nothing is hidden.
- The state file says plainly that it is not a design decision.
- Caveat: the only "fixed" state is a fix no one approved. Replace it with the pilot's real fix when that lands.

**`card-rulings-partial-pilot`: honest.** The partial file is `rulings.json` minus `sub_2d_1d`, removed from `skills` and from its two rulings, and nothing else.

## Is the precritic FAIL real?

**sibling-compare** lists three counts ABOVE the paired siblings:

| Row | Count | Verdict |
|---|---|---|
| `single/ex-group S` | TY-11 16 vs 8 | **real**. A single-skill row, the lane's own |
| `mixed/defaults S` | L-OVERFLOW PG-12 2 vs 0 | **not the lane's** (D1 below). It is a partner's legacy cell |
| `sections/ex-each L` | H13 6 vs 4 | **unattributed**. A 4-skill row; the comparison cannot say whose band it is (D1) |

**slot-clip.** It FAILs on the same `mixed/defaults S` PG-12 2 vs 0, so it is not real for the same reason (D1).

**card-rulings and card-not-offered.** Both are real.

## Blocking defects

### D1. Rule 0b compares multi-skill rows with unattributed counts, so a partner skill's defect FAILs the lane

The precritic on `sub_100_no_regroup` fails on a partner's cell, and STATUS calls it the pilot's to fix.

**Where:**
- `tests/scripts/ws-sibling-compare.cjs` `compare()` (l. 84-110) counts every finding of the row, whichever skill drew the cell. A `mixed` or `sections` row draws the lane skill beside three fixed partners: `addition:add_facts`, `algebra:tape_diagram` and `area_perimeter:perimeter_intro`.
- `ws-slot-clip` judges the extra rows the same way (l. ~374-398).
- The partners' items are seeded from the row's skill set. So the lane's page and the sibling's page deal **different partner items**.

**Reproduce:**
1. Run `node tests/scripts/ws-slot-clip.cjs --skills subtraction:sub_100_no_regroup --rows mixed/defaults --sizes S --no-extra --keep --run-siblings --report-only`.
   - It gives `L-OVERFLOW PG-12 2 above the siblings' 0`.
   - The kept `out-0.json` names the element: `<div.ws-legacy.print-edition> "Lily needs 83 cards. He alre..."`, page 2 and page 4, cell 4, 2.2 mm out of a 45.8 mm cell.
   - That is `algebra:tape_diagram`'s legacy cell, not the lane's stack.
2. Run the same command for `addition:add_100_regroup --keep`. The sibling's mixed page deals other tape items ("Kai had 190 books", "Lily has 97 stickers…") and has 0 PG-12.

**Effect:**
- The pilot is blocked by a legacy tape-diagram overflow it does not own, both in sibling-compare and in slot-clip.
- The fix-r6 STATUS line "3 counts above … real, the pilot's to fix (rule 0b), not a tool defect" is wrong for `mixed/defaults`, and unproven for `sections/ex-each`.
- The reverse also holds. A lane cell's defect can hide on a multi-skill row when a partner's different item happens to raise the sibling's count. That would make it ENGINE.

**Fix (either):**
- (a) Attribute each finding to its cell. The cell carries `data-ws-cell` (template), and print-lint reports page and cell. Compare only the lane skill's cells. List the partner findings as non-blocking `PARTNER`.
- (b) Make partner items identical across the lane's page and the siblings' pages: seed partners by `(partner, row)`, not by the skill set. Then the counts are comparable.

Then add a backtest: a fixture mixed row whose only above-sibling finding is in a partner cell must not FAIL.

### D2. The rulings block can be weakened without any gate noticing

The lead asked whether the block can be weakened silently. It can.

**Where:**
- `tests/scripts/ws-spec-card.mjs` `spliceRulings` (l. 1000-1010) refreshes `bodySha`.
- `checkSigned` (d) (l. ~1113-1118) compares `cardBody()`, which strips the rulings block (l. 926).
- So a change to `card.json` `rulings` followed by `--rulings-only` keeps the card "still signed" and passes (b) and (d).
- The README (l. 156-158) says a ruling whose meaning changes "is re-signed as usual". Nothing enforces it.
- The `checkSigned` doc's own (d) says "a config change after signing fails". This change is not caught.

**Reproduce** (detached worktree at HEAD):
1. In `design/cards/subtraction/card.json`, set R-ZERO-NOT-SEEDED `max` from 0.1 to 0.6 and empty `notOffered`.
2. `ws-spec-card --family subtraction --rulings-only` prints "byte-identical and still signed (owner, 2026-10-23)".
3. `--check-signed` output is **identical** to before the edit (the same three pre-existing DN-34 / coverage lines; nothing about rulings).
4. `ws-card-rulings` turns R-ZERO-NOT-SEEDED from FAIL to `ok … (44.3 %; at most 60 %)`.
5. `--check offered` becomes NO-RULINGS. ws-precritic treats that as SKIPPED, which ends **OK** without `--strict`.
6. The §9.4 citation stays, so the loosened ruling does not even appear on `todo`.

A hand edit of the block itself *is* caught by `--check-signed` (bodySha mismatch), but precritic never runs `--check-signed`.

**Effect.** A builder facing card-rulings FAIL can make it PASS by editing one config number. The only trace is a `card.json` diff that a reviewer may or may not read.

**Fix.** Sign the block:
- Put a `rulingsSha` (of the rulings and notOffered entries) in the signed text, or keep the block inside `cardBody`.
- Let `--rulings-only` on a signed card only ADD entries. Loosening or removing one needs `--resign`.
- Have ws-card-rulings (or precritic) FAIL when the block's entries differ from those at the last signature.

## Nits

- **N1.** A partial rulings scope (INCOMPLETE) and a scope with no rulings (SKIPPED) still end `ws-precritic: OK` without `--strict`. They are named in the line, as decided at r5/r6. The lead should still make `--strict` (or a full block) a condition of "clean before the critic"; r6 N3 is still open.
- **N2.** `ws-card-rulings --report-only` exits 0 on INCOMPLETE. That is consistent with its FAIL behaviour, but say so in the header.
- **N3.** The `good-d7` stand-in at 1.3 em costs density (144 heads probed instead of 192: fewer cells a page). Swap in the pilot's real D7 fix when it lands. The engine finding on approved `sub_1m_regroup` (24 pairs at level 3, S) is real, and any sub_1m lane will hit it on HEADS. It needs an owner line in SKILL_UPGRADE_LIST.
- **N4.** `PARSE.siblingCompare` returns plain `PASS` "no printed matrix row with findings". That is correct now that every printed row is compared. It might say how many rows printed clean, so the line is not read as "nothing ran".

## Fixed since r6 (confirmed)

| r6 item | Status |
|---|---|
| D1 | fixed |
| D2 | fixed, with A14 "siblings clean" on 4 approved skills; it runs on the r1 tree too |
| D3 | fixed |
| N1 | paired siblings are now the default |
| N2 | the extras (test, more-practice and supports-on pages) catch the pilot's D7 |
| N4 | temp cleanup works, and slot-clip takes 227 s in precritic |
| N5 | measured / N/A is reported per template |

## To pass round 8

1. Fix D1: attribute findings to the lane's cells, or seed the partners identically. Add a backtest.
2. Fix D2: put the rulings under the signature. Add a backtest in which a loosened ruling made with `--rulings-only` fails.
3. Correct the fix-r6 STATUS line on which precritic FAILs are the pilot's.
