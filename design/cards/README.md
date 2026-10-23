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
   - `ruleGroups`: `{title, rules, core, chars, full}` — rule ids or `ID@SRC` keys. Groups with `core: true` are
     section **4a**, the rules the builder must apply, quoted (`full: true` whole, otherwise cut at a sentence near
     `chars`); 4a may not exceed 5 KB (`coreBytes` in card.json may lower the cap; generation refuses a card over it).
     A group with `caps: true` is section **4a+**, quoted beside the core (at most 1.5 KB): the hard caps critics cite
     most on the card. Every other group goes to **4b**, one line per id (the id, then its first sentence cut at about
     100 characters), grouped under the heading of the standard that defines them. A group with `"applies": false` and a
     `reason` (a rule critics cited on the family that does not apply to this template) prints under its own heading,
     **4c** "Cited by critics on this family, but not applying to this template", with the reason; its ids still count
     for coverage;
   - `ownerRulings` `{date, ruling, source}`, `misconceptions` `{id, error, wrong}`, `options` (notes), `gates` `{cmd, note}`,
     `openQuestions` `{q, recommended}`; `findingsMatch` `{templates, families}` for the coverage test (families
     here are extra: the categories of the card's own skills are always matched).
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
ends with `Signed: (not yet signed)`. Section 4 has up to four parts: **4a Core rules** (quoted, at most 5 KB), **4a+ Caps** (quoted in full,
at most 1.5 KB), **4b Also applies** (every other rule that applies, one line per id with its first sentence, grouped by
heading; the full text is in `rule-index.json`) and **4c** (cited on the family, not applying, with the reason). All
parts count as "on the card" for coverage. The machine block also records the `generated` date (kept while the card's
content is unchanged); `--check-signed` refuses a signing date before it. A machine block at the top (an HTML comment) records the card id, the
rule-index sha, the **bodySha** (sha of the generated card without its Signed line), the ids critics had cited at
generation (`cited`) and the 6-hex sha of every rule on the card (`rules`: `REF SHA …`, a ref that shares the
previous ref's prefix written as its number only: `VA-1 12d322 2 26885a` = VA-1, VA-2).

## Signing

The owner answers section 9 (answers go into `card.json` and the card is regenerated), then replaces the last line with
`Signed: owner, YYYY-MM-DD`. The build-start gate:

```bash
node tests/scripts/ws-spec-card.mjs --check-signed design/cards/<id>/<id>.md   # [--findings <csv>] [--require-findings]
```

It passes only when **all four** hold, and prints every one that fails with its fix:

1. the last line is `Signed: owner, YYYY-MM-DD`, a real calendar date, not after today;
2. the card was not edited by hand: the body (everything but the Signed line) still matches the `bodySha` stored at
   generation;
3. the card-coverage test (below) passes against the **current** rule index: a rule on the card that changed or was
   deleted after signing fails by id, and so does a rule a critic cited for the card's skills that is not on it;
4. `card.json` and the repo still generate the same card (a config change after signing fails; a change only to the
   ids cited in the tally does not).

The fix for 2–4 is the same: edit `card.json` if needed, run `--template <id> --resign` (or `--family`), and have the
owner sign the new card.

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

1. a rule id a critic cited on a finding for the card (`rule_ids` of `design/status/defect-findings.csv`) is not in
   section 4 (4a or 4b). The tally's fields are free text, so a finding is the card's when its `family` is a category
   of the card's skills (section 1) or a family in card.json, or its `template` is the card's template, or its `run` /
   `summary` names one of the card's skills (`cat:skill`, or a bare id that holds an underscore);
2. a rule on the card is no longer in the current rule index, or its excerpt changed since the card was generated —
   a rule changed after signing. Regenerate with `--resign` and have the owner sign again.

It warns about cited ids that are not in the index (typos in reports; known ones such as `H0` are explained), notes ids
defined outside the indexed standards (the lesson rules `LR-1`–`LR-18` of `design/LESSON_RULES.md`, not on this branch;
`KNOWN_EXTERNAL` in the tool, listed in `RULE_INDEX.md`), and lists ids cited since the card was generated.
It reads the standards fresh every time (never the committed index), so it is run again when each build starts.
