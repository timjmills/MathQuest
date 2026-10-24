# Wave 0 lane B (process tools): independent critic, round 2

Critic profile: mq-opus-medium. I am not the builder and not the round-1 critic. Graded tree: `9cae670` (branch
`claude/sweet-newton-c8wrv1-wip-wave0-process`), lane commits `85f5078..HEAD`, including the fix commits `dd42943` (D9),
`f0eca7b` (tools) and `9cae670` (tally). Graded against `design/IMPROVEMENT_PLAN.md` §1.1, §1.3, §1.4 (S3, S6, S7, S8,
"Spec card format"), §1.6.3 step 6, §1.6.6, §1.6.7 E5, §1.7 and §4.2. I used r1's method with fresh random samples.

## Verdict: PASS

| Criterion | Score |
|---|---|
| 1 Accuracy of the tally | **8** |
| 2 Usability of the tools | **8** |
| 3 Fidelity to the plan | **8** |

Every r1 defect is fixed. Five new minor defects remain (D1–D5) and none is blocking. They should be fixed before the
stack card goes to the owner to sign (D1, D2) and before the first lane copies the README manifest (D5).

### 1. Accuracy of the tally: 8

**Reproduction**
- `python3 design/status/tally-src/g7/build.py` and then `merge.py` run with no `git diff`.
- `merge.py` reports 7,878 findings, 219 report rounds and 219 report rows. Every round now has its own row: Y5 r1 and
  r2 are in `reports-extra.csv`, and wave1-E r1 is recomputed to `n_open` 5.
- `metrics.py` reproduces `metrics.md`:
  - machine share 82.6 % (all findings) and 80.7 % (narrative reports);
  - rounds to PASS over 36 lanes: median 4, quartiles 2.25–6, range 1–15, mean 4.8;
  - the class ranking.
- `hours.py <full clone>` gives output identical to `hours-output.txt`, apart from its 2-line command header. The
  hours table, 3.8 h median, 113/7 = 16.1 and 81 lane-weeks all trace to it. The middle value (25 lane-weeks) is
  labelled as a reading of STATUS, not a script.
- `ws-wrm --report-only` gives 513/872, 149 partial, 210 gap, 392 tagged and 162 proposals, the same as `metrics.md`.
  `git status` stayed clean.

**Sample.** I drew 31 rows at random (seed 9917): 4 each from G1–G6 and 7 from G7. I checked each against its
source report or `grades.jsonl`.
- The defect exists and is open in that round: 31/31.
- Severity and `carried`: 31/31 (for example, G4 1221 "Open (nit)" is `carried=yes`).
- `rule_ids`: 31/31. G7 2527 now has an empty `rule_ids` and `caps=H3;H4`. G7 4233 has L10, cited in its text.
  G2 442 has WRM-rule-7, which the report cites as "rule 7".
- Class: 28 clean and 1 debatable (G4 959, wrm-page B8, "index.json lists no years", classed PROCESS where MISSING
  fits better). Two rows misfit:
  - G1 65: R-Y1 U17, "pre seq_10 is noise", classed UNTRUE_TEXT. It is a padded pre link, which is TAG_LINK (D3).
  - G7 6955: regrade3 arrays_groups U513, "'Solve.' and stray '.'", classed CLARITY. The same defect is U506
    INSTRUCTION on another host and U511 VISUAL_DESIGN on a third (D4).
- **Full-row agreement: 29/31 (94 %)**, against 82 % in r1.

**D1 check across all 5,832 G7 rows.**
- `rule_ids` are set on 1,711 rows; `caps` holds the version caps on 2,590 rows.
- H4 sits on a non-INK_FONT class in only 5 rows. All 5 cite "(H4)" in their own text.
- H13 sits on 380 rows: 374 are SPACE.
- I checked 10 random rows whose ids are not visible in the 120-character summary. Each id is either cited later in
  the full text or a cap whose condition is that same defect (the RUBRIC "Tag every finding" rule).

**Completeness.** I counted the defects in six reports and found nothing missed:
- div-facts-forms CRITIC-R1: D1–D14, 14/14.
- skip-count critic-r1: D1–D6 and N1–N3. N4 says "works and is not scored", so it is rightly left out.
- search-terms critic: 14/14.
- wave1-E: r1 D1–D5 after the drop rule; r2 R1–R4.
- pulse-fix: rounds 1–6, carried D5 counted each round.
- OPTIONS-CRITIC-R2: §5 items 1–24.

**Why 8, not higher.** Two class faults remain, both small next to 7,878 rows:
- About 20 wrm-tagging rows are padded or weak pre/related links ("noise", "weak pre", "not the same idea", "later
  step"). They stay UNTRUE_TEXT because merge rule 2 skips UNTRUE_TEXT when it matches by words (D3).
- G7 classes the same defect differently on different hosts (D4).

### 2. Usability of the tools: 8

**Commands that ran green**
- `ws-spec-card`: `--self-test` 40/40, `--index --check` (1,566 rules), `--check-coverage --all --require-findings`.
  It matched 1,201 findings and found 0 missing ids. The only remaining note is LR-4/LR-6, explained as
  `KNOWN_EXTERNAL`; H0 is no longer warned.
- `ws-status-index`: `--self-test`, `--check`, `--owner-go --json` (prints `[]`) and `--verify-lines 85f5078` (609/609,
  byte-for-byte suffix).
- `ws-integrate`, with `WS_INTEGRATE_SCRATCH` set:
  - `--self-test` 26/26;
  - `--dry-run` green in 31.5 s, `git diff` empty, re-apply a no-op;
  - code-snapshot, standards, search-terms and presets-unit green in both rebuilds.
- `ws-boot-smoke: OK`; `ws-code-snapshot: OK` with 722 codes.
- `node --input-type=module --check` passes on all three scripts.
- `git status` is clean after every run. All scratch copies are removed.

`--check-signed design/cards/stack/stack.md` FAILs as unsigned, which is correct.

**Adversarial runs on a `git archive` copy**

`--check-signed`:

| Case | Result |
|---|---|
| Card signed `Signed: owner, 2026-10-23` | OK |
| One word changed in the body | FAIL (bodySha and regeneration) |
| One character changed in a quoted rule | FAIL |
| AK-2 changed in WORKSHEET_DESIGN_STANDARD (a 4a rule) | FAIL by id |
| VA-30 changed (a 4b ids-only rule) | FAIL by id |
| Dates `2026-99-99`, `2026-02-30`, `2027-01-01`, `2026-1-5`, `Owner,` | FAIL |
| A field changed in `card.json` | FAIL |
| A trailing line after the Signed line | FAIL |
| Date `1999-01-01`, before the card was generated | OK (nit) |

`ws-status-index --root`, go lines:

| Line | Result |
|---|---|
| `Owner go: addition, 2026-10-23` | OK |
| `Owner go: stack, 2026-10-22` | OK |
| Unknown family | FAIL |
| Future date | FAIL |
| 2026-02-29 | FAIL |
| `Addition` | FAIL |
| Trailing text | FAIL |
| Lower-case `owner go` | FAIL |
| Bullet prefix | FAIL |
| No spaces | FAIL |
| Lane id as family | FAIL |
| Prefixed sentence | FAIL |
| Go line outside the section | FAIL |

`ws-integrate --apply --root`, manifests:

| Manifest | Result |
|---|---|
| README example | OK, 8 blocks |
| Quotes, backslash or `*/` in the label; newline in a term | OK, escaped; every touched file still parses |
| Provider path traversal | refused |
| Lower-case code | refused |
| `entry.v` ≠ key | refused |
| Missing preset host | refused |
| Unknown category | refused (misleading message, nit) |
| Grade 13 | accepted (nit) |
| CCSS `9.ZZ.Z.9` | accepted; `ws-standards` fails afterwards |

**The stack card as a builder brief.** It is 25,503 bytes, about 6.5 k tokens. Section 4a is 4,818 bytes, quoting
15 rules, and 4b lists 121 rules as ids only. The token target (≈ 10 k) and the 3–5 KB core are met. The core is the
right one for the drawing: the VA stack geometry, AK-2, TY-21 and SP-23. Section 3 carries the capacity tables.

But the rules most often cited on this card's own findings are all ids-only in 4b: H4 59, H6 36, H5 35, H8 25,
H2 22, H13 20, L1 7. A builder must look each one up in an 870 KB `rule-index.json`. That file has one rule per line,
so `grep '"H13"'` works (D1). The card also tells the builder that TY-10a and SL-3a "also apply", while `card.json`
says they do not apply to the stack (D2).

The READMEs (`design/cards`, `design/status`, `design/lanes`, `DRY_RUN.md`) are followable. The one trap: the lanes
README example manifest uses an EE that does not exist (D5).

### 3. Fidelity to the plan: 8

What matches:
- The 9 card sections and the Signed line.
- §1.3 is now enforced at build start: `--check-signed` re-runs coverage against the current index and checks the
  body hash and regeneration.
- S6:
  - lane files;
  - the generated STATUS index;
  - go lines validated against SKILLS, cards and `families.txt` (§1.6.3 step 6);
  - STATUS fully preserved (`--verify-lines` 609/609).
- S7 rules in LESSONS_LEARNED and RUBRIC, the same texts r1 checked:
  - template first;
  - one model per pair;
  - the order of checks in 6 steps;
  - flakes;
  - Q-S4 graded/inherited;
  - batch critic safeguards (20 %, a full grade when the code path differs);
  - near-miss on the minimum;
  - the benchmark;
  - "Tag every finding", now with `class` and `rule_ids` in the JSON example (N3).
- CLAUDE.md gains exactly 2 lines.
- Outside the lane's own folders, `git diff --name-only 85f5078..HEAD` touches only:
  - CLAUDE.md, LESSONS_LEARNED.md and RUBRIC.md (the S7 text);
  - STATUS.md (the generated index region, re-run on r1's D9 instruction).
- §4.2 RUBRIC row: written in at S7.
- E5:
  - the integrator stamps only on an explicit `--stamp`;
  - manifests carry skills, providers and lessons (bodies stay lane code, as the README says);
  - `--regen` covers the catalogue, the coverage reports and the STATUS index; the lesson registry is written by
    `--apply`, as stated.

**Dry-run scope (r1 D8).** `DRY_RUN.md` and the README "The gate" now say plainly:
- it rebuilds 150 of 722 skills, all appended since the codes were frozen (36 real skills and 114 presets);
- why the 572 frozen skills are the base: packed, non-uniform lines that a peel would cut in half;
- what a full rebuild would need: a layout-only reflow approved by the owner, then `--cut AA`.

Step (f), the data-only rebuild, shows the manifests' data is enough. Every skill a lane can add is append-only, so
this covers everything a manifest will ever carry. For the E5 gate, that meets "rebuilds today's tree from manifests"
well enough, now that it is honestly scoped.

**What falls short.** Section 4 of the plan's card format is "rule ids **with excerpts**", and 121 of the card's 136
rules (89 %) have no excerpt on the card (D1).

## Round-1 defects

| r1 | Status | Evidence |
|---|---|---|
| D1 grade-run `rule_ids` carry version caps | **fixed** | `build.py` takes the ids from the defect's own `what`/`fix`/`where`/`cap`, plus a cap only when `CAP_FITS` matches. Caps are in their own `caps` column. Only 5 non-INK_FONT rows have H4, all self-cited. Rows 2402/6695-style cases now have empty `rule_ids`. Coverage is re-run and green. |
| D2 class misfits | **fixed** | `overrides.csv` (28 rows, each asserted to hit exactly one row with its old value). The DATA_SHAPE class is added. REPEAT is scoped to page or packet. r1 rows 137 → DATA_SHAPE, 795 → PLAIN_WORDS and 1866 → VIEWPORT. |
| D3 Y5 rounds without report rows; wave1-E `n_open` | **fixed** | `reports-extra.csv` adds Y5 r1 and r2. `merge.py` asserts every round with findings has a row and recomputes `n_open`. 219 rounds = 219 rows; wave1-E r1 `n_open` is 5. |
| D4 hours and lane-weeks not reproducible | **fixed** | `hours.py` reproduces `hours-output.txt` identically on the full clone. |
| D5 `--check-signed` reads only the last line | **fixed** | All four checks (date, bodySha, coverage against the current index, regeneration). Every tamper case above FAILs. |
| D6 coverage ignores the card's multiplication skills | **fixed** | Families are derived from the card's 64 skills, and findings also match by `cat:skill` or an underscored bare id in `run`/`summary`. With multiplication in, the result is 0 missing. Family matching itself is the plan's wording (§1.3 "for that family"). |
| D7 rules section 17 KB | **fixed (size)** | 4a is 4,818 B with a 5 KB cap enforced by generation (self-test "a core part over its byte cap refuses"); the card is 25.5 KB. See new D1 for the side effect. |
| D8 dry-run scope overstated | **fixed** | `DRY_RUN.md` "What it rebuilds (and what it does not)" and README "The gate". |
| D9 lane status file stale | **fixed** | `wave0-b.md` State `fix`, Critic rounds `1, FAIL`, Now and Log current. `--check` is green. |
| N1 unknown families and future dates on go lines | **fixed** | See the go-line table. |
| N2 impossible signed dates | **fixed** | `2026-99-99` and `2026-02-30` FAIL. |
| N3 RUBRIC JSON example | **fixed** | `"class": "SPACE", "rule_ids": ["H5"]`. |
| N4 LR-4, LR-6, H0 warned | **fixed** | `KNOWN_EXTERNAL` and the `RULE_INDEX.md` table. LR-4/LR-6 are a note; H0 is explained. |
| N5 commit count and "723 skills" | **fixed** | `metrics.md` §0 says "722 codes (ws-code-snapshot), not 723 skills". |

## New defects

**D1 · minor · MISSING · §1.4 "Spec card format" item 4 ("rule ids with excerpts"), §1.2 row 8 ("the right
rules").** Section 4b of `design/cards/stack/stack.md` lists 121 of its 136 rules as bare ids.
- The rules most cited on the card's own findings are all excerpt-free: H4 59, H6 36, H5 35, H8 25, H2 22, H13 20,
  L1 7 citations (SPACE is the top class there, 187 rows).
- A builder reading only the card does not see the text of the caps that produced most of this template's past
  defects.
- One-sentence excerpts (about 90 characters) for 121 rules add about 11 KB. The card would stay about 9–10 k
  tokens, inside the plan's builder-brief target.
- **Fix:** render 4b with a one-sentence excerpt per id; the tool already supports this through `chars`. Or promote
  the hard caps the card's findings cite most (H2, H4, H5, H6, H8, H13, L1) into a short 4a group. Then regenerate.

**D2 · minor · UNTRUE_TEXT · §1.3 (card-coverage test).** `card.json` titles a group "Owner exceptions cited on the
multiplication family (count rows only; they do not apply to the stack)". In the generated card, TY-10a and SL-3a
appear under "4b. Also applies" with no qualifier. A rule kept only to satisfy coverage is presented as applying.
- **Fix:** let a group carry `"applies": false`. List those ids in 4b under "Cited on this family, does not apply to
  this template" (they still count for coverage). Or narrow the finding match for count-row findings.

**D3 · minor · OTHER (class assignment) · `defect-classes.md` TAG_LINK.** `merge.py` rule 2 moves pre/related
findings to TAG_LINK by word match only when the class is not UNTRUE_TEXT. About 20 wrm-tagging rows that are padded,
weak or later-week links stay UNTRUE_TEXT. Examples (G1/G2 rows):
- R-Y1 U17 "pre seq_10 is noise" (row 65);
- R-Y1 U33;
- R-Y1-r2 U23 and U30;
- R-Y1-r3 U20 and U34;
- Y2-Y3 S4, S6 and S8k;
- Y2-Y3-r3 U3 and U19.

A false why-line remains UNTRUE_TEXT. A padded, weak, too-big or later link is TAG_LINK by the table's own words.
- **Fix:** add these rows to `overrides.csv`. Alternatively, extend rule 2 with a "noise|weak|padded|not the same
  idea|later step|cites a later" pattern for UNTRUE_TEXT.

**D4 · minor · OTHER (class assignment) · S8 class ranking.** G7 classes one defect differently on each host it was
graded on. In regrade3 `multiplication:arrays_groups`, the "'Solve.' and a broken sentence frame" defect is:
- U506 INSTRUCTION;
- U509 CLARITY;
- U511 VISUAL_DESIGN;
- U513 CLARITY.

Per-host rows are right under the counting rule, but the class should be the same. Split classes move counts between
machine and judgment classes.
- **Fix:** in `g7/build.py`, after the overrides, take one class per (run, skill, normalised defect text), using the
  most frequent class or the first host's. Or add `ov.txt` entries, then re-run `merge.py` and `metrics.py`.

**D5 · minor · UNTRUE_TEXT · §1.6.6 (READMEs followable by a new lane).** The example manifest in
`design/lanes/README.md` tags `"ee": ["M.EE.1.OA.6"]`. `data/standards/ee-math.json` has no such EE (1.OA has 1, 2,
5, 5.a, 5.b and 7). A lane that copies the example passes `ws-integrate --apply` and then fails `ws-standards`
("names M.EE.1.OA.6, which is not in ee-math.json").
- **Fix:** use a real EE (for example `M.EE.1.OA.5.a` or `M.EE.1.NBT.4`). Optionally, have `--apply` validate CCSS
  and EE ids against `standards-db.js` and WRM step ids against `wrm-db.js`.

## Nits

- `--check-signed` accepts a signing date before the card was generated (`1999-01-01`). The bodySha makes this
  harmless, but a date before the card's generation is never real.
- `ws-integrate --apply` accepts `grade: 13`; CLAUDE.md allows K, 1–6 and M.
- An unknown category is refused with "preset … names a host add that is not live" instead of "unknown category".
- The README's lead workflow (`--apply`, `--regen`, `--stamp`) does not say to run `ws-standards`, `ws-search-terms`
  and `ws-code-snapshot` after `--apply`. Only the dry run runs them.
- The stack card §7 prints raw option values (`task` Operation: 0 / 1; `tiles` 21 / 31) where labels would read
  better.
- The headline "≈ 0.2 skills per lane-week" in `metrics.md` §4 uses the middle value of 25 lane-weeks, which is a
  reading, not a script. The range 0.06–0.9 is scripted.
