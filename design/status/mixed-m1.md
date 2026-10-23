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

Owner ruling 2026-10-23 (repeats): "Repeated facts should be allowed as an option, or inverse facts to fill the page."
→ Default: when a skill's facts run short, the page fills with inverse / related facts (13−6 beside 13−7, 8×10 beside
80÷10); exact repeats and turnarounds stay out. A teacher option (request field `repeats: 'allow'`, appended code token,
absent = off) lets exact repeats fill the page once unique and inverse facts are used up. The T3 lane adds the control.
