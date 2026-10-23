# Spec cards

A spec card is the short brief one template (or one family) is built from (`design/IMPROVEMENT_PLAN.md` §1.3, §1.4 S3).
It holds the exact rule excerpts by rule id, the owner rulings, the capacity rows, the options, the gates and the open
questions. **Builders read the card. Critics keep reading the full standards and `design/audit/RUBRIC.md`.** A build
starts only after the owner has signed its card.

Tool: `tests/scripts/ws-spec-card.mjs` (node, no browser, no dependencies). It prints `ws-spec-card: OK` / `FAIL`.

## Files

| Path | What it is |
|---|---|
| `rule-index.json` | GENERATED. Every rule id in the four standards (`WORKSHEET_DESIGN_STANDARD.md`, `PEDAGOGY_STANDARD.md`, `design/PAGE_TYPES.md`, `design/SKILL_CELL_CONTRACT.md`), `design/PROBLEM_TYPES.md`, and the ids critics cite from `design/audit/RUBRIC.md` (C1–C4, H1–H13), `design/audit/OPTIONS-RUBRIC.md` (O1–O6, OC1–OC15) and `design/audit/LESSONS_LEARNED.md` (L1–L11): file, line, heading path, form, excerpt and the excerpt's sha1. One rule per line. |
| `RULE_INDEX.md` | GENERATED. Counts per file and prefix, the collisions, duplicates and near-collisions. |
| `<id>/card.json` | The card's config, written by hand (see below). |
| `<id>/<id>.md` | GENERATED. The card. Edit `card.json`, never the card, except its last line when the owner signs. |

## The rule-id index

```bash
node tests/scripts/ws-spec-card.mjs --index            # rebuild
node tests/scripts/ws-spec-card.mjs --index --check    # exit 1 when the committed index is stale
```

A rule is **defined** where its id opens a bullet (`- **VA-1** …`), a paragraph (`**P-6 Title.** …`), a table row
(`| H1 | … |`) or a heading (`#### L-1 …`, `### C1 · …`). A rule whose text ends with `:` keeps the table or list right
under it. Excerpts are bounded at 60 lines / 4,000 characters. An id defined in two files is a **collision** and keeps
both entries as `ID@SRC` (for example `H1@RUBRIC`, the hard cap, and `H1@PED`, the first hint scaffold); an id defined
twice in one file is a **duplicate** (`SF-34@WDS.1`, `SF-34@WDS.2`). Neither is merged. Ids that differ only by a
hyphen or a leading zero (L1 / L-1) are listed as near-collisions. Fix collisions in the standards, not here.

Re-run `--index` after any edit to the sources; the index carries no timestamp, so a re-run is byte-identical.

## Making a card

1. Write `design/cards/<id>/card.json`:
   - `id`, `kind` (`template` or `family`), `title`, `template` {`id`, `source`, `also`}, `families` (categories);
   - `skills`: `printFormats` (a regex over the print formats in `design/SKILL_CATALOGUE.md`), `include`, `exclude`,
     `excludeCategories` (mixed pools);
   - `teaches`, `summary`, `research` (say where it came from), `problemTypes`, `progression`;
   - `drawing`: `sizes`, `notes`, `capacity` (bold table labels in a standard, copied with their table);
   - `ruleGroups`: `{title, rules, chars, full}` — rule ids or `ID@SRC` keys; `full: true` quotes every excerpt whole,
     otherwise it is cut at a sentence near `chars`;
   - `ownerRulings` `{date, ruling, source}`, `misconceptions` `{id, error, wrong}`, `options` (notes), `gates` `{cmd, note}`,
     `openQuestions` `{q, recommended}`; `findingsMatch` `{templates, families}` for the coverage test.
2. Generate it:
   ```bash
   node tests/scripts/ws-spec-card.mjs --template <id>     # or --family <id>
   ```
   The tool adds what it can derive: the skills and their CCSS / EE / WRM tags (`standards.js`, `wrm.js`), the
   build-list entries on the template (`build-list.js`, `build-specs.js`), the options and preset skills declared on
   those skills (`skill-options.js`, `skill-presets.js`), the capacity rows, every rule id the template's source file
   cites (section 4, "Also cited in the template source"), and whether each gate's script exists yet (a missing one is
   marked PLANNED, as `ws-precritic` is until Wave 0 S1 lands).
3. Read it. Re-running gives the same bytes.

The card has nine sections — 1 What it teaches · 2 Problem types and progression · 3 The drawing · 4 Rules that apply ·
5 Owner rulings · 6 Misconceptions · 7 Options and presets · 8 Gates · 9 Open questions with recommended answers — and
ends with `Signed: (not yet signed)`. A machine block at the top (an HTML comment) records the card id, the rule-index
sha, the ids critics had cited at generation and the sha of every rule on the card.

## Signing

The owner answers section 9 (answers go into `card.json` and the card is regenerated), then replaces the last line with
`Signed: owner, YYYY-MM-DD`. The build-start gate:

```bash
node tests/scripts/ws-spec-card.mjs --check-signed design/cards/<id>/<id>.md
```

Regenerating keeps the Signed line when nothing else changes. If the content of a **signed** card would change, the
tool refuses and writes nothing; `--resign` writes it and resets the line to `Signed: (not yet signed)`, so the owner
signs the new version.

## The card-coverage test

```bash
node tests/scripts/ws-spec-card.mjs --check-coverage design/cards/<id>/<id>.md   # or --all
#   [--findings <csv>]  default design/status/defect-findings.csv (the S8 tally)
#   [--require-findings]  fail when the findings file is missing (default: a warning)
```

It FAILS when

1. a rule id a critic cited on a finding for the card's template or families (`rule_ids` of
   `design/status/defect-findings.csv`, matched on its `template` and `family` columns) is not in section 4;
2. a rule on the card is no longer in the current rule index, or its excerpt changed since the card was generated —
   a rule changed after signing. Regenerate with `--resign` and have the owner sign again.

It warns about cited ids that are not in the index (typos in reports) and lists ids cited since the card was generated.
It reads the standards fresh every time (never the committed index), so it is run again when each build starts.
