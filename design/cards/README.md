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
| `<id>/<id>.md` | GENERATED. The card. Edit `card.json`, never the card, except its Signed line when the owner signs. |

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
     Every other group goes to **4b** as ids only, grouped under the heading of the standard that defines them;
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
5 Owner rulings · 6 Misconceptions · 7 Options and presets (with **7a**, the hosts / roles / options decisions) · 8 Gates
· 9 Open questions with recommended answers — then the line `Signed: (not yet signed)`, then the informational block
**§7b What the repo offers today** (see "The signed part and the informational block"). Section 4 has two parts: **4a
Core rules** (quoted, at most 5 KB) and **4b Also applies** (every other rule that applies, as ids grouped by heading;
the full text is in `rule-index.json`). Both parts count as "on the card" for coverage. A machine block at the top (an
HTML comment) records the card id, the rule-index sha, the **bodySha** (sha of the signed part without its Signed line),
`format: 2`, the **configSha** (sha of the parsed card.json), the ids critics had cited at generation (`cited`), the
6-hex sha of every rule on the card (`rules`: `REF SHA …`, a ref that shares the previous ref's prefix written as its
number only: `VA-1 12d322 2 26885a` = VA-1, VA-2) and the 6-hex sha of every signed ruling, notOffered entry and
decision (`entries`: `R:<id>`, `N:<id>`, `D:<key>[@skills]`).

## Hosts, roles and options (§7a decisions, §7b listing)

The pilot lost most of its critic points to things the card never decided (the inherited Across control, the option
help, lesson data, the screen comma path). So every card lists, from the repo (`deriveSurface`; nothing hand-listed):

- **option values**: every value `offeredOptionsFor(cat, skill)` returns on the card's skills, the `_ap4*` patches, the
  universal level / play controls and the number-line controls included (they are applied when `skill-options.js`
  loads), one line `option=value` (`option=*` for a free number) with the skills that offer it;
- **page roles**: every role `buildSheet` accepts (`print-sheet.js` SHEET_ROLES + `sheet/roles/index.js`
  ROLE_MODULES, aliases from ROLE_ALIASES), one line `role:<id>` with its data source: the lesson data
  (`lessons/prereqs.js` LESSONS, or the FALLBACK), the earlier skills (data.js order), the provider members the role
  reads (`workedSteps`, `wrongAnswer`, `stories`, …: real or default, per skill);
- **screen hosts**: every host the screen gates drive (ws-envelope's list and the `arg('hosts', …)` defaults of the
  screen gates, card = practice-card, worksheet = online-worksheet) and the display modes they take (`--dark`,
  `--bigboard`), one line `host:<id>`.

Each line needs a decision in card.json `decisions` `{options, roles, hosts}`:
`{"key": "notation=across", "d": "offered" | "hidden" | "out of scope", "why", "source", "skills"?, "proposed"?}`, or
`{"option": "nlStep", "values": [...], "d": …}` for several values of one option (values are listed, never wildcarded,
so a new value is an undecided line). **offered** = shown and graded on every page type and host it reaches; **hidden**
= must not be offered (each hidden option becomes a `N-D-<option>` notOffered entry of the rulings block, which
`ws-card-rulings --check offered` holds the panel to); **out of scope** = offered by the app but not graded on this card
(say where it is graded). `skills` limits a decision to some skills (it beats an all-skills decision for them).
`proposed: true` marks a decision pre-filled for the lead from existing rulings and status: it prints `(PROPOSED)` and
`--check-signed` NOTEs it; signing the card accepts it. The decisions print signed in §7a; the live listing, each line
with its marker (`[offered]`, `[hidden, PROPOSED]`, `[UNDECIDED]`), prints in the informational §7b.

## The signed part and the informational block

A correct build changes the repo: it adds the options the card asked for, adds preset skills, tags them, deletes its
built entry from the build list, lands a planned gate. If those listings sat in the signed body, every correct build
would break the signature (the subtraction pilot found this: its §7 listed the options declared today; W0-B fix
02c5308e, ported here). So the card is split in two:

- **The signed part** — everything above and including the Signed line: the card.json content, the rules and their
  excerpts, the rulings block (rulings, notOffered), the owner rulings, the misconceptions, the open questions, the
  gates, and in §7 the options the card asks for and the §7a decisions. `bodySha` covers exactly this part.
- **The informational block** — below the Signed line, between `<!-- informational: not signed. … -->` and
  `<!-- /informational -->`: §7b, the live listing with its markers, and the options / presets declared today. It is
  not hashed, not compared and never read by a check (check 5 re-derives the listing from the repo). It may not fake
  signed content: `--check-signed` fails when the fence does not sit right after the Signed line, when there is more
  than one fence or text after the closing one, or when the block holds a rule line, a rulings block or any heading
  other than §7b.

Regenerating a signed card whose only changes are repo-derived (§1 skill list and tags, §2 build-list lines, §8 PLANNED
markers, the rulings block's derived `skills` line) keeps the signed part byte for byte and refreshes §7b. An older card
without the fences (format 1) is read compatibly: its old §7 live listing is masked in check 4 (it stays hashed).

## Signing

The owner answers section 9 and the PROPOSED decisions (answers go into `card.json` and the card is regenerated), then
replaces the Signed line (just above the informational §7b) with `Signed: owner, YYYY-MM-DD`. The build-start gate:

```bash
node tests/scripts/ws-spec-card.mjs --check-signed design/cards/<id>/<id>.md   # [--findings <csv>] [--require-findings]
node tests/scripts/ws-spec-card.mjs --check-signed --skill cat:skill[,...]    # every card that covers these skills
```

It passes only when **all five** hold, and prints every one that fails with its fix:

1. the Signed line is `Signed: owner, YYYY-MM-DD`, a real calendar date, not after today;
2. the card was not edited by hand: the signed part (without the Signed line) still matches the `bodySha`, and the
   informational block is well formed;
3. the card-coverage test (below) passes against the **current** rule index: a rule on the card that changed or was
   deleted after signing fails by id, and so does a rule a critic cited for the card's skills that is not on it;
4. `card.json` and the repo still generate the same **signed content**: any card.json change fails (`configSha`), a
   signed ruling, notOffered entry or decision that was changed, removed or added since signing fails BY NAME
   (`entries`: W0-A critic r7 D2, a weakened ruling voids the signature), and so does any change to rules, rulings,
   misconceptions, the options and decisions the card declares, gates or open questions. The repo-derived listings a
   correct build changes are masked and reported as NOTE lines; a skill or tag signed on the card that is gone FAILS.
5. every line the repo offers today (§7b, re-derived at check time) has a decision on every skill: a new option, value,
   role or host FAILS as UNDECIDED; PROPOSED decisions and decided lines the repo no longer offers are NOTEs; a listing
   the tool could not read FAILS.

Exit codes of `--check-signed`: 0 OK; 1 a SIGNED card fails; 4 `NO-CARD` (with `--skill`: no card covers the skills);
5 an UNSIGNED card ("needs owner signature", with its other problems listed). The fix for 2–5 is the same: edit
`card.json` if needed, run `--template <id> --resign` (or `--family`), and have the owner sign the new card.

**In ws-precritic** (row `spec-card-signed`, `--skill`): exit 0 PASS; 4 N/A; 5 **INCOMPLETE (unsigned card)** — the
lane may run and the critic may grade, but it is not a pass and a `--strict` run fails, so an unsigned card can never
reach a merge unnoticed; 1 FAIL (a signed card is broken: an undecided line, a weakened ruling, a hand edit, a stale
rule). An unsigned card is a draft the lead has not signed, so its problems are the lead's to finish, not the lane's
defect; a signed card that fails is a build that changed the repo without the card.

Regenerating keeps the Signed line when nothing in the signed part changes. If the content of a **signed** card would
change, the tool refuses and writes nothing; `--resign` writes it and resets the line to `Signed: (not yet signed)`, so
the owner signs the new version. `--fixture <file.mjs>` runs the gate on a seeded state (ws-backtest rows
`card-gate-decisions`, `card-gate-rulings`).

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

## The rulings block (machine-readable rulings)

Every generated card carries a second HTML comment right after the spec-card comment:

```
<!-- rulings
{"v": 1, "card": "subtraction",
"skills": ["subtraction:sub_100_no_regroup", ...],
"rulings": [
 {"id":"R-BAND-100","source":"§9.2; §5.1 (...)","skills":["subtraction:sub_100_no_regroup"],"assert":"range","of":"a","min":51,"max":99},
 ...
],
"notOffered": [
 {"id":"N-BAND","source":"§7 (...)","option":"band"}
],
"todo": [
 {"id":"T-5.2","source":"§5.2","text":"Pupil-facing text says \"regroup\", never \"borrow\" ..."},
 ...
]
}
-->
```

The format (assert kinds `range`, `digits`, `noRegroup`, `boxes`, `maxShare`, `minShare`; predicates `zeroCase`,
`columnZero`, `ansShorter`, `{"eq": [field, value]}`; `notOffered` with an optional `values` list) is defined in the
header of `tests/scripts/ws-card-rulings.mjs`, the tool that checks it.

- **`skills`** — derived: the card's skills (section 1), plus any skill an authored ruling names (e.g. a proposed
  preset such as `sub_2d_1d`).
- **`rulings` / `notOffered`** — copied from `card.json` `"rulings": {"rulings": [...], "notOffered": [...]}`, plus one `N-D-<option>` notOffered entry per hidden option decision (§7a, source `§7a (decision …)`). Every
  entry's `source` cites the card section it encodes: `§5.n` = owner ruling n, `§9.n` = open question n (its recommended
  answer), `§1` / `§3` / `§7` for the name, drawing and options.
- **`todo`** — derived: every owner ruling (`§5.n`) and open question (`§9.n`) that no entry's `source` cites. These
  rulings exist only as prose; they are listed so the gap is visible, never checked and never counted as a pass.

**Adding a ruling:** write the entry into `card.json` `rulings` with an id, the `§` source it encodes and its assert, then
write the block with `node tests/scripts/ws-spec-card.mjs --family <id> --rulings-only` (or `--template`). Its `§`
citation takes that ruling off `todo`. `--rulings-only` writes only the block into the existing card: every other byte stays as it is and bodySha is
refreshed. The block is SIGNED content (W0-A critic r7 D2): on a signed card whose block would change, `--rulings-only`
writes nothing unless `--resign` is given, and then the Signed line is reset; a full regeneration that changes the block
is refused the same way. A new ruling on a signed card is therefore a new signature.

**How precritic uses it:** `ws-precritic` runs `ws-card-rulings --skill <key> --check rulings` and `--check offered`. The
tool samples 300 seeded items per ruling through `generateQuestionFor` and reads `offeredOptionsFor`; a broken ruling is
FAIL. It also prints `<card>: rulings block present, N prose ruling(s) not machine-checked (§…)` for every block in scope.
A skill whose blocks hold no entry of the kind checked ends `NO-RULINGS` (exit 4), which precritic reports as SKIPPED,
never PASS.
