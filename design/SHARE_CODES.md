# Share codes and the skill options they carry

Owner request, 2026-09-24: *"On the quick links that you send to students the skill options need
to be available ... so that you can pick specific things like only work on multiplying 8s and 7s
in the mixed skill code and mixed skill print. Right now it's all or nothing."*

Every share form names its skills one at a time. A skill's chosen options ride on the skill they
belong to, as an optional suffix. Code: `js/modules/skill-option-codec.js`.

## The option suffix (format version 1)

```
skill-ref [ "~" payload ]
payload = field *( "_" field )
field   = KEY value            KEY: one letter (table below), or a digit + a letter (the registry)
```

Every key and every value token is allocated in ONE registry, `js/modules/skill-option-keys.js`
(see "The key registry" below). The table below is the original one-letter set.

| Option id (skill-options.js) | KEY | Value written as |
|---|---|---|
| `constant` (fact set)     | `C` | set: one base-36 char per ticked value — `{7,8}` → `78`, `{10,11}` → `AB` |
| `notation`                | `N` | set: `S` stacked · `A` across · `B` bracket · `F` fraction |
| `level` (support level)   | `L` | set: `0`–`3` |
| `response`                | `R` | `S` standard · `W` which-numbers · `A` array-builder |
| `range` (Max Number)      | `M` | decimal digits — `M20`, `M1000` |
| `decimals`                | `D` | decimal digit — `D2` |
| `wordform`                | `W` | set: `N` to number · `W` to words |
| `regroup`                 | `G` | `N` · `A` · `M` |
| `orientation`             | `O` | `V` · `H` |
| `unknown`                 | `U` | `A` · `F` · `S` · `M` |
| `simplestForm`            | `S` | `1` / `0` |
| `pictures`                | `P` | `1` / `0` |
| `band`                    | `B` | decimal digits |

An empty set field (`C` alone) means "none ticked", which the option model reads as *no
restriction*. A field that is absent means the option is at its default.

**Only what differs from the skill's default is written** (`packOptions`). A skill at its defaults
writes no suffix at all, so every code a set produced before this existed is still produced, and
still decoded, byte for byte.

**Characters.** `A–Z 0–9 ~ _` only. All share parsers upper-case the code and split on `-`, `|`
and `.`; none of those appear in a payload. `~` and `_` are unreserved in URLs, so a link with
options needs no escaping.

**Versioning.** A payload whose first character is a digit names a later format version; version 1
(this one) has no version digit. A decoder that meets an unknown version ignores the whole payload
(the skill loads at its defaults) rather than misreading it. Unknown keys inside a v1 payload are
skipped, so new options join v1 without a bump. Values are written **by value, never by list
position**, so an option can gain values later without moving any existing code. Keys and value
tokens are append-only.

**Old apps, new codes.** The pre-existing parsers read a skill part as "2 characters + digits":
`EA~C78` still yields `EA`, and `parseInt('~C78')` is `NaN` → weight 0. An old copy of the app
opening a new link gets the right skills at their default options — never a different skill.

## The key registry (`js/modules/skill-option-keys.js`)

All 26 one-letter keys are taken (`C N L R M D W G O U S P B T I K Z X E A V Q H F Y J`). Every
later option id gets a **two-character key: a digit, then a letter**. Each digit is a **block**
owned by one wave, 26 keys a block, and a wave takes only the next letter of its own block:

| Block | Owner | Status | Keys |
|---|---|---|---|
| `0` | P9 place value (second wave) | reserved | `0A`–`0Q` |
| `1` | P10 time and money | reserved | `1A`–`1M` (its thirteen keys, renumbered from its own `0x` scheme) |
| `2` | count-by, patterns, multiplication chart | reserved | `2A`–`2F` (renumbered from `9A`–`9F`) |
| `3` | function tables | reserved | none yet (value tokens only today) |
| `4` | supports | assigned | `touch` 4A · `cover` 4B · `mix` 4C · `anchors` 4D (ids reserved; no skill declares them yet) |
| `5` | P12 every other family | assigned | `members` 5A · `forms` 5B · `denoms` 5C · `model` 5D · `labels` 5E · `precision` 5F · `coins` 5G · `shapes` 5H · `points` 5I · `scale` 5J · `digits` 5K · `units` 5L · `parts` 5M |
| `6`–`9` | — | spare | claim a whole block in `KEY_BLOCKS` first |

P12's keys were `XA`–`XM` while unshipped; they moved to block 5 before anything was deployed, so no
link ever carried an `X`-pair key. `X` is `op` and nothing else.

**Rules.**
1. **Reading.** A field is a two-character key exactly when it matches `^\d[A-Z]` (`MULTI_KEY_RE`);
   otherwise its first character is the key.
2. **Writing.** The encoder writes the one-letter fields first, then the two-character ones. When
   only two-character fields remain it writes a **leading empty field**: `~_5B01`, never `~5B01`.
   A payload that starts with a digit is still, and always, "a later format version".
3. **Old apps.** The deployed decoder takes a field's first character as its key. No one-letter key
   is a digit, so it skips every `5B…` field as an unknown option and the skill loads with that
   option at its default; it skips the empty field; and because the payload never starts with a
   digit it never throws the one-letter fields away. `ws-codec-registry` proves this by running the
   deployed decoder itself (`tests/fixtures/deployed-skill-option-codec.mjs`, copied verbatim from
   `origin/master`) against every code the new encoder writes: it must read exactly the one-letter
   options, or the defaults — never another option.
4. **Value tokens: one UNION table per option id.** An id shared by several skills has ONE table
   covering every value any of them takes, each value its own character (`A–Z 0–9`). String values
   are listed in `VALUE_TOKENS`; members of a numeric set are written as themselves in base 36 and
   listed in `NUMERIC_SET_VALUES` (so `constant`'s 10–13 own `A`–`D`, and no string of `constant`
   may take them); a numeric scalar is written as decimal digits, a bool as `1` / `0`
   (`SCALAR_ONLY`); `members` carries its own two-character position tokens on the def.
   `tokenUnion(id)` builds the table and throws on a collision.
5. **Append-only, pinned.** `tests/baselines/codec-registry.snapshot.json` pins every key, block
   and token. A changed or deleted entry fails `ws-codec-registry`; a new one is reported and is
   pinned with `node tests/scripts/ws-codec-registry.mjs --pin` in the same change (`--pin` only
   ever appends).
6. **A new option id** — take the next free key of your wave's block (a comment in `MULTI_KEYS`
   names it), add its string tokens to `VALUE_TOKENS` and its numeric set members to
   `NUMERIC_SET_VALUES`, run `ws-codec-registry --pin`. A reserved block's owner fills in its ids
   when it merges; nobody else takes a key in a reserved block.

The union token tables today (value → character; numeric set members in base 36):

| Id | Tokens |
|---|---|
| `notation` | stacked S · across A · bracket B · fraction F |
| `response` | standard S · which-numbers W · array-builder A · write R · circle-all C |
| `regroup` | none N · always A · mixed M |
| `orientation` | vertical V · horizontal H · rows R · line L · scattered S |
| `unknown` | answer A · first F · second S · mixed M · 0 1 2 |
| `wordform` | to_number N · to_words W |
| `dir` | more M · less L · both B · fewer F · same S · mixed X · forward W · back K · 0 1 |
| `task` | read R · count C · compute P · closest N · reasonable E · length L · height H · thickness T · all A · 0–3 |
| `zeroPlace` | none N · some S · always A |
| `op` | x M · / D |
| `order` | largest L · scrambled S |
| `midpoint` | never N · seeded S · only O |
| `support` | cut C · line L · none N · labels B · chart T · tile D · frame R · skip K · array A · think H · bar M · label E |
| `objects` | shapes S · pictures P · frame F · dice D |
| `model` | none N · area A · bar B · circle C · line L · set S · grid G · blocks K · analog H · digital D |
| `labels` | all A · some S · none N |
| `precision` | hour H · half F · quarter Q · five V · one O · 0–3 |
| `coins` | p P · n N · d D · q Q |
| `units` | metric M · customary C · mixed X · 0–2 |
| `power` | 10 → 1 · 100 → 2 · 1000 → 3 |
| `places` | 1 → 0 · 10 → 1 · 100 → 2 · 1000 → 3 · 10000 → 4 · 100000 → 5 |
| `constant` | 0–13 (`0`–`9`, `A`–`D`) |
| `level` · `scale` · `forms` · `shapes` | 0–3 · 0–3 · 0–4 · 0–4 |
| `step` · `parts` · `points` · `digits` · `denoms` | 0–2 · 0–2 · 0–1 · 1–2 · 2 3 5 7 |
| scalar (`SCALAR_ONLY`) | `range` `decimals` `band` `tiles` `place` decimal digits · `simplestForm` `pictures` 1/0 · `members` def tokens · `touch` `cover` `mix` `anchors` reserved |

The registry file is the source of truth; this table is a reading copy.

## Where the suffix goes

| Form | Example | Written by | Read by |
|---|---|---|---|
| Skill code | `EA~C78-AY` | `generateSkillCode` | `parseSkillCodeParts` / `applySkillCode` |
| Direct Play link | `?c=EA~C78-AY\|T300-N20` | `generateEnhancedSkillCode` | landing modal → `applySkillCode` |
| Quick Start link | `?qs=EA~C78-AY\|Q1` | `generateQuickStartLink` | `setQuickSkillsFromCode` (the card keeps `opts`) |
| MX- mixed code / link | `MX-T00~C78.A00-40MSS2000` | `buildMixedCode` (Mixed Settings) | `applyMixedCode`, `parseMixedCodeForPlay`, `?c=MX-…` |
| 7-char settings code | `T00403M~C78` | `generateSettingsCode` | `applySettingsCode`, `parseSingleSkillCodeForPlay` |

Weight digits sit before the suffix: `EA3~C78`.

**MX- codes** are now what the Mixed Settings dialog shows (the compact `M` bitfield it showed
before read a checkbox tree that is no longer on the page and always encoded zero skills; it also
cannot hold a category of more than ten skills). Format:
`MX-<skill>.<skill>…-<range><dec><diff><timer><mode>[<TT><CC>]`, a skill being its settings-code
category letter plus its frozen two-digit position. The optional `TT CC` are the problem goals
(total problems, correct goal; `00` = off). A 5-character settings part — every MX code written
before 2026-09-24 — has no goals and decodes as it always did. Compact `M` codes still decode
unchanged; nothing writes them any more.

## Where the options live while the app runs

`state.skillOptionsBySkill['categoryId:skillId']` — one map for the whole set (the home queue, the
Skills Navigator queue, the Mixed Settings list, the Add Skills list and the print dialog are all
copies of the one set). `js/modules/skill-option-store.js`. It lives for the session only; what
must survive a reload does so on its own carrier: a Quick Start card's `opts`, saved mixed
settings' `skillOptions`, a print section's `opts`.

Plain `generateQuestion()` consults this map whenever the caller set no options of its own, so
practice, boss, race, the online worksheet, mixed play and the quiz builder honour a set's options
with no change to any of them. `generateQuestionFor({ opts })` (print, preview, audits) passes its
own and wins.

## The editor, and the teacher view

`js/modules/skill-options-ui.js` is the one options editor. Lists that show a set draw it inline
(`skillOptionsGearHTML` / `skillOptionsPanelHTML`); screens that keep options on their own rows —
the teacher view's Sets and Print screens — call

```js
window.openSkillOptionsPanel(categoryId, skillId, anchorEl, { opts, onChange(nextPackedOpts) })
```

which opens the same controls in a popover beside the button (a bottom sheet under 600px) and
reports every change as packed options (`null` at the defaults). A queue item's `opts` property
(UnifiedSkills) is a live view of the store entry: reading it returns the stored options, assigning
it writes the store, so `item.opts = next` in the teacher view reaches the share code and play.
Only the options the generator honours are shown (`offeredOptionsFor`).

The teacher Print screen always hands `buildSheet` an explicit `skills[].opts` object (`{}` at the
defaults), so a row reset on that screen prints the defaults instead of falling back to the set.

`generateQuestionFor()` called WITHOUT `opts` (undefined / null) also takes the skill's options from
the set — the online worksheet generates that way. Inside a mixed pool (`custom_mixed`) each picked
skill takes its own options, never the pool's.

## Tests

- `node tests/scripts/ws-code-snapshot.mjs` — no frozen code or position moves (unchanged gate).
- `node tests/scripts/ws-codec-registry.mjs` — the key registry is append-only (pinned), well
  formed, covers every live option, and the DEPLOYED decoder skips every digit + letter key.
- `node tests/scripts/ws-share-options.cjs` — codec round-trips for every live skill's options,
  old codes decode exactly as before, every live skill has a valid schema and default, and the
  end-to-end pupil test (Quick Start link and MX- code, 12 answered items, then print).
