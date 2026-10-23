# Mixed practice — phase M1 (lane status)

Branch `claude/sweet-newton-c8wrv1-wip-mixed-m1`. Plan: `design/IMPROVEMENT_PLAN.md` §3 (M1 row of §3.5).

| Step | State |
|---|---|
| First build of `interleave()` + mixed arrangement (Opus medium, Q-S7) | done (3d91189, 70d3fd4, 0f8a95a) |
| Q-M1 edits: PAGE_TYPES 5.2, DN-34, DN-31, `anchors.js` | done |
| Critic r1 (Opus medium) | FAIL — S = L page; legacy sub_facts misaligned; repeats in a share |
| Fix r2 (3680a8f) / critic r2 | FAIL — I Can S doubled letters (CL-13); minor: related facts |
| Fix r3 (ddab6d3) / critic r3 | FAIL — exact repeats on the 2-skill S page (last deal pass drops all checks); I Can M = S (size ladder); I Can L fill 0.46 |
| Escalation (§1.7): repeats and the size ladder survived two rounds at medium → loop stopped, root causes named, machine checks required, fresh builder (Opus medium) | r4 in progress |
| Independent critic r4 | — |

Open for other lanes / the owner:
- `subtraction:sub_facts` still draws with the legacy template (`gen-operations.js`), so it cannot join a mixed page.
- CL-4: in the kit `fact` cell the problem ends at 61–63 % of the cell height, not in the top half (owner ruling).

Owner ruling 2026-10-23 (repeats), final: "the big idea is to fill the page or not".
→ One switch `fill` (default ON). ON: unique facts first, then turnarounds (4+1 / 1+4), then exact repeats — the page is
always full. OFF: unique facts only; the page may end early, with a note. Related facts (8×10 / 80÷10, 13−6 / 13−7) are a
separate option `families` (default OFF) and never used to fill when off. Both are appended share-code tokens (absent =
default). The T3 lane adds the controls.

## Owner design list (batched per LESSONS_LEARNED "Process rules" 0 from now on)

| Date | Owner's words | State |
|---|---|---|
| 2026-10-23 | "Repeated facts- should be allowed as an option or inverse facts to fill page" … "inverse facts for multiplication or addition 4+1 1+4 … not for multiplication then division. Although this could be a separate option" … "the big idea is to fill page or not" | built in r4 (`fill`, `families`; codes `F0`, `X1`) — given before the batching rule |
| 2026-10-23 | "do as you think best" (fill-off remainder: follow PG-15 / PT-ENG-7, closed rectangle, blank trailing area, no staircase) | in the r6 fixer |

Critic r4: 14 / 16 pages pass. Critic r5: the 3 changed pages pass (all ≥ 8). Open: spot-check of the weighted 1 : 3 M page (moved to 6 across) and the PG-15 trailing area.
