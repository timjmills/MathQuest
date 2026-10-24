// ws-spec-card.mjs — spec cards (design/IMPROVEMENT_PLAN.md §1.3 "Spec cards instead of the full standards",
// §1.4 S3 and "Spec card format"). A spec card is the short, signed brief one template or family is built from:
// the exact rule excerpts by rule id, owner rulings, capacity rows, options, gates and open questions. Builders
// read the card; critics keep reading the full standards and RUBRIC.
//
//   node tests/scripts/ws-spec-card.mjs --index                 rebuild design/cards/rule-index.json + RULE_INDEX.md
//   node tests/scripts/ws-spec-card.mjs --index --check         exit 1 when the committed index is stale
//   node tests/scripts/ws-spec-card.mjs --template stack        write design/cards/stack/stack.md from
//                                                               design/cards/stack/card.json (+ what it derives)
//   node tests/scripts/ws-spec-card.mjs --family addition       the same for a family card
//        ... --resign                                           allow a SIGNED card to change (it becomes unsigned)
//        ... --rulings-only                                     write only the machine rulings block into the existing card
//                                                               (the rest byte-identical, a signature kept); see design/cards/README.md
//   node tests/scripts/ws-spec-card.mjs --check-coverage design/cards/stack/stack.md   (or --all)
//        ... [--findings <csv>] [--require-findings]            the card-coverage test (below)
//   node tests/scripts/ws-spec-card.mjs --check-signed design/cards/stack/stack.md      the build-start gate: signed with a
//        real date not after today, body unchanged since generation (bodySha), coverage green against the current
//        rule index, and card.json still generates the same card
//   node tests/scripts/ws-spec-card.mjs --check-signed --skill cat:skill[,...]   the same gate on every card that covers
//        those skills (ws-precritic's row): exit 0 OK, 1 a SIGNED card fails, 4 NO-CARD (none covers them), 5 an
//        UNSIGNED card ("needs owner signature"; its other problems listed)
//   node tests/scripts/ws-spec-card.mjs --fixture tests/fixtures/precritic/card-gate.fail.mjs   the gate on a seeded
//        state (ws-backtest): generate, sign, move the repo, --check-signed (runFixture)
//   node tests/scripts/ws-spec-card.mjs --self-test             seeded fixtures, no repo files touched
//
// HOSTS, ROLES AND OPTIONS (W0-B2; pilot-su-c: "the card did not decide what the critic graded"): every card lists,
// from the repo, every value offeredOptionsFor() returns on its skills (inherited `_ap4*` patches included), every role
// buildSheet accepts with its data source (prereqs.js lesson data or the fallback, earlier skills, provider members)
// and every screen host the screen gates drive (deriveSurface). card.json "decisions" gives each line offered /
// hidden / out of scope (signed, §7a; a hidden option becomes a notOffered entry of the rulings block); the live
// listing with each line's marker is informational (§7b, after the Signed line, not hashed: W0-B fix 02c5308e).
// --check-signed FAILS while a live line has no decision, and when a signed ruling, notOffered entry or decision was
// changed, removed or added in card.json (W0-A critic r7 D2: the rulings block is signed content; --rulings-only no
// longer refreshes a signed card's bodySha over a changed block).
//
// The RULE-ID INDEX reads the four standards (WORKSHEET_DESIGN_STANDARD.md, PEDAGOGY_STANDARD.md,
// design/PAGE_TYPES.md, design/SKILL_CELL_CONTRACT.md), design/PROBLEM_TYPES.md, and the ids critics cite from
// design/audit/RUBRIC.md (C1-C4, H1-H13), design/audit/OPTIONS-RUBRIC.md (O1-O6, OC1-OC15) and
// design/audit/LESSONS_LEARNED.md (L1-L11). A rule is DEFINED (not merely cited) where its id opens
//   - a bullet            `- **VA-1** ...`, `- **PT-FPR-4. Title** ...`   (excerpt: the bullet + its continuation)
//   - a paragraph         `**P-6 Title.** ...`                            (excerpt: to the blank line)
//   - a table row         `| P-PR-1 | ... |`, `| H1 | ... |`              (excerpt: the row)
//   - a heading           `#### L-1 ...`, `### C1 · ...`                  (excerpt: to the next heading of that level)
// Each entry records file, line, heading path, excerpt (bounded: 60 lines / 4000 characters) and the sha1 of the
// excerpt. An id defined in two files is a COLLISION and an id defined twice in one file a DUPLICATE: both are kept
// (keys `ID@SRC`, `ID@SRC.n`) and reported, never merged. An id that is defined in prose AND listed again as the first
// cell of a table in the same file (the lint appendices) keeps the prose definition; the table row is counted as a
// "table mention". Ids that differ only by a hyphen or a leading zero (RP-3 / RP-03, L-1 / L1) are reported as
// near-collisions. The index is sorted and carries no timestamp, so a re-run is byte-identical.
//
// The CARD-COVERAGE TEST (--check-coverage) FAILS when
//   1. a rule id a critic cited on a finding for the card (design/status/defect-findings.csv, columns
//      report,run,round,defect_id,class,kind,carried,severity,rule_ids,family,template,summary; rule_ids ';'-separated)
//      is missing from section 4 (4a core or 4b ids only). A finding is the card's when its family is a category of the
//      card's own skills (section 1) or a card family, its template is the card's, or its run / summary names a card
//      skill (findingsFor);
//   2. a rule on the card no longer exists in the current index, or its excerpt sha changed since the card was
//      generated (the rule changed after signing: regenerate with --resign and have the owner sign again).
// It WARNS (does not fail) on cited ids that are not in the index ("unknown ids": typos in reports; KNOWN_TYPOS says
// why), NOTES ids defined outside the indexed standards (KNOWN_EXTERNAL: the lesson rules LR-1..18), and lists ids
// cited since the card was generated. A missing findings file is a warning unless --require-findings is given.
//
// Prints `ws-spec-card: OK` or `ws-spec-card: FAIL (...)` and exits non-zero on FAIL. No browser, no dependencies.

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

// The app's modules are ES modules in a package.json without "type": node says so once per import. Keep other warnings.
process.removeAllListeners('warning');
process.on('warning', (w) => { if (w && w.code !== 'MODULE_TYPELESS_PACKAGE_JSON') console.error(`${w.name}: ${w.message}`); });

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

/** The sources of the rule-id index, in a fixed order (the order breaks ties when sorting). */
export const SOURCES = [
    { key: 'WDS', file: 'WORKSHEET_DESIGN_STANDARD.md' },
    { key: 'PED', file: 'PEDAGOGY_STANDARD.md' },
    { key: 'PAGE', file: 'design/PAGE_TYPES.md' },
    { key: 'SCC', file: 'design/SKILL_CELL_CONTRACT.md' },
    { key: 'PROB', file: 'design/PROBLEM_TYPES.md' },
    { key: 'RUBRIC', file: 'design/audit/RUBRIC.md' },
    { key: 'ORUBRIC', file: 'design/audit/OPTIONS-RUBRIC.md' },
    { key: 'LL', file: 'design/audit/LESSONS_LEARNED.md' },
];
const INDEX_REL = 'design/cards/rule-index.json';
const INDEX_MD_REL = 'design/cards/RULE_INDEX.md';
const FINDINGS_REL = 'design/status/defect-findings.csv';
const CARDS_REL = 'design/cards';
const MAX_LINES = 60;
const MAX_CHARS = 4000;
const UNSIGNED = 'Signed: (not yet signed)';
const SIGNED_RE = /^Signed: owner, (\d{4}-\d{2}-\d{2})\s*$/;
const SHA_LEN = 6;    // a card stores 6 hex digits of each rule's excerpt sha: enough to see a change (1 in 16 M misses)
const BODY_SHA_LEN = 16;
const CORE_BYTES = 5120;   // section 4 (a), the rules quoted for the builder, is at most 5 KB (IMPROVEMENT_PLAN §1.2 row 8)

/**
 * Ids critics cite that are defined OUTSIDE the indexed standards. They are reported as a NOTE, not as an unknown id.
 * LR-1..LR-18 are the lesson rules of design/LESSON_RULES.md, which lives on origin/claude/sweet-newton-c8wrv1-wip-lessons
 * (not on this branch; design/lesson-planner/Atomisation_Lesson_Planner_V22.md cites them). Index that file here when it
 * is merged, and drop the entry.
 */
export const KNOWN_EXTERNAL = [
    { re: /^LR-(\d+)$/, ok: (m) => Number(m[1]) >= 1 && Number(m[1]) <= 18, where: 'design/LESSON_RULES.md (lesson rules LR-1..LR-18; on origin/claude/sweet-newton-c8wrv1-wip-lessons, not on this branch)' },
];
/** Ids that are known misreadings in the findings tally: they stay WARNINGS (the tally should drop them). */
export const KNOWN_TYPOS = {
    H0: 'not a rule: the tally read "H0.32" / "H0.37" (a measured empty-band ratio in guided-r1 grade-run summaries) as a rule id',
};
const externalOf = (id) => { for (const x of KNOWN_EXTERNAL) { const m = x.re.exec(id); if (m && x.ok(m)) return x.where; } return null; };

/** A YYYY-MM-DD date that exists on the calendar. */
function validDate(s) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
    const d = new Date(`${s}T00:00:00Z`);
    return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === s;
}
/** Today in the local time zone, YYYY-MM-DD. */
function localToday() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const sha1 = (s) => crypto.createHash('sha1').update(String(s), 'utf8').digest('hex');
const rel = (root, p) => path.relative(root, p).split(path.sep).join('/');

/* ================================================================ rule ids */

/** A token is a rule id: upper-case segments joined by hyphens, ending in a number (optionally one letter). */
export function isRuleId(t) {
    return typeof t === 'string' && t.length <= 20 && /^[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)*[a-z]?$/.test(t)
        && /\d[A-Za-z]?$/.test(t)
        && !/^[AB]\d$/.test(t);   // never paper sizes (A4, B5)
}
/** The prefix an id is counted under: VA-13a -> VA, PT-KEY-1a -> PT-KEY, SCC-Q3 -> SCC-Q, OC15 -> OC, L-5Z -> L. */
export function prefixOf(id) {
    return id.replace(/-?\d+[A-Za-z]?$/, '').replace(/-$/, '') || id;
}
/** The near-collision form: no hyphens, no leading zeros in digit runs. */
const normId = (id) => id.replace(/-/g, '').replace(/(^|[^0-9])0+(?=\d)/g, '$1').toUpperCase();
/** Natural sort key for ids: VA-2 < VA-10 < VA-10a. */
function idCompare(a, b) {
    const ta = a.split(/(\d+)/), tb = b.split(/(\d+)/);
    for (let i = 0; i < Math.max(ta.length, tb.length); i++) {
        const x = ta[i] ?? '', y = tb[i] ?? '';
        if (x === y) continue;
        if (/^\d+$/.test(x) && /^\d+$/.test(y)) return Number(x) - Number(y) || x.length - y.length;
        return x < y ? -1 : 1;
    }
    return 0;
}

/* ================================================================ the parser */

const FENCE = /^\s*(```|~~~)/;
const HEADING = /^(#{1,6})\s+(.*?)\s*#*\s*$/;
const BULLET_ID = /^ {0,3}[-*+]\s+\*\*([^*\s|]+?)[.:]?(?:\*\*|\s)/;
const PARA_ID = /^\*\*([^*\s|]+?)[.:]?(?:\*\*|\s)/;
const TABLE_ID = /^\|\s*(?:\*\*)?([^|*\s]+?)(?:\*\*)?[.:]?\s*\|/;
const NEW_BLOCK = /^(?:[-*+]\s|#{1,6}\s|\||\*\*[^*\s]|\d+\.\s|>)/;

function bound(lines) {
    let out = lines.map((l) => l.replace(/\s+$/, ''));
    let truncated = false;
    if (out.length > MAX_LINES) { out = out.slice(0, MAX_LINES); truncated = true; }
    let text = out.join('\n').replace(/\s+$/, '');
    if (text.length > MAX_CHARS) { text = text.slice(0, MAX_CHARS).replace(/\s+\S*$/, ''); truncated = true; }
    return { text, truncated };
}

/** A rule's own definition-line test, used to stop a tail at the next rule. */
function definesRule(l) {
    const m = BULLET_ID.exec(l) || PARA_ID.exec(l) || TABLE_ID.exec(l);
    return !!(m && isRuleId(m[1]));
}
/**
 * A rule whose text ends with ':' introduces the table or list right under it (P-31's defaults table,
 * BD-11's verb list): that block belongs to the rule. Appends it to `body` in place.
 */
function colonTail(lines, j, inFence, body) {
    const last = body.filter((l) => l.trim()).pop() || '';
    if (!/:\s*$/.test(last)) return;
    let k = j;
    if (k < lines.length && !lines[k].trim()) k++;
    if (k >= lines.length || inFence[k] || !/^\s*(?:\||[-*+]\s|\d+\.\s)/.test(lines[k]) || definesRule(lines[k])) return;
    if (k > j) body.push('');
    for (; k < lines.length && !inFence[k] && lines[k].trim() && !definesRule(lines[k]) && !HEADING.test(lines[k]); k++) body.push(lines[k]);
}

/**
 * Every rule DEFINITION in one markdown text. Returns [{id, line, heading, form, excerpt, truncated}], line 1-based.
 */
export function parseRules(text) {
    const lines = text.split(/\r?\n/);
    const inFence = new Array(lines.length).fill(false);
    let f = false;
    for (let i = 0; i < lines.length; i++) {
        if (FENCE.test(lines[i])) { inFence[i] = true; f = !f; continue; }
        inFence[i] = f;
    }
    const out = [];
    const heads = [];
    const path_ = () => heads.filter((h) => h.lvl > 1).map((h) => h.text).join(' > ');
    for (let i = 0; i < lines.length; i++) {
        if (inFence[i]) continue;
        const ln = lines[i];
        const h = HEADING.exec(ln);
        if (h) {
            const lvl = h[1].length;
            while (heads.length && heads[heads.length - 1].lvl >= lvl) heads.pop();
            const token = h[2].split(/[\s.:·—,(]/)[0];
            if (isRuleId(token)) {
                let j = i + 1;
                for (; j < lines.length; j++) {
                    if (inFence[j]) continue;
                    const hh = HEADING.exec(lines[j]);
                    if (hh && hh[1].length <= lvl) break;
                }
                const b = bound(lines.slice(i, j));
                out.push({ id: token, line: i + 1, heading: path_(), form: 'heading', excerpt: b.text, truncated: b.truncated });
            }
            heads.push({ lvl, text: h[2] });
            continue;
        }
        let m = BULLET_ID.exec(ln);
        if (m && isRuleId(m[1])) {
            const body = [ln];
            for (let j = i + 1; j < lines.length && !inFence[j]; j++) {
                const l = lines[j];
                if (!l.trim()) {
                    // a blank line ends the rule unless indented continuation follows
                    if (j + 1 < lines.length && /^(?: {2,}|\t)\S/.test(lines[j + 1])) { body.push(''); continue; }
                    break;
                }
                if (/^ {0,1}[-*+]\s/.test(l) || NEW_BLOCK.test(l) && !/^\s/.test(l)) break;
                body.push(l);
            }
            colonTail(lines, i + body.length, inFence, body);
            const b = bound(body);
            out.push({ id: m[1], line: i + 1, heading: path_(), form: 'bullet', excerpt: b.text, truncated: b.truncated });
            continue;
        }
        m = PARA_ID.exec(ln);
        if (m && isRuleId(m[1])) {
            const body = [ln];
            for (let j = i + 1; j < lines.length && !inFence[j]; j++) {
                const l = lines[j];
                if (!l.trim() || HEADING.test(l) || /^\|/.test(l) || /^[-*+]\s/.test(l) || PARA_ID.test(l)) break;
                body.push(l);
            }
            colonTail(lines, i + body.length, inFence, body);
            const b = bound(body);
            out.push({ id: m[1], line: i + 1, heading: path_(), form: 'paragraph', excerpt: b.text, truncated: b.truncated });
            continue;
        }
        m = TABLE_ID.exec(ln);
        if (m && isRuleId(m[1])) {
            const b = bound([ln]);
            out.push({ id: m[1], line: i + 1, heading: path_(), form: 'table', excerpt: b.text, truncated: b.truncated });
        }
    }
    return out;
}

/* ================================================================ the index */

/**
 * Build the index object from {key, file, text} sources. Pure: no file access.
 */
export function buildIndex(sources) {
    const rules = [];
    const tableMentions = [];
    const perSource = [];
    for (const [si, s] of sources.entries()) {
        const defs = parseRules(s.text);
        // prose definitions win over a table row of the same id in the same file (lint appendices)
        const prose = new Set(defs.filter((d) => d.form !== 'table').map((d) => d.id));
        let n = 0;
        for (const d of defs) {
            if (d.form === 'table' && prose.has(d.id)) { tableMentions.push({ id: d.id, src: s.key, file: s.file, line: d.line }); continue; }
            rules.push({ ...d, src: s.key, file: s.file, order: si });
            n++;
        }
        perSource.push({ key: s.key, file: s.file, rules: n });
    }
    // keys: the bare id when it is defined once; ID@SRC (ID@SRC.n for a duplicate inside one file) otherwise
    const byId = new Map();
    for (const r of rules) { if (!byId.has(r.id)) byId.set(r.id, []); byId.get(r.id).push(r); }
    const collisions = [];
    const duplicates = [];
    for (const [id, list] of byId) {
        if (list.length === 1) { list[0].key = id; continue; }
        const srcs = [...new Set(list.map((r) => r.src))];
        for (const sKey of srcs) {
            const inSrc = list.filter((r) => r.src === sKey).sort((a, b) => a.line - b.line);
            inSrc.forEach((r, k) => { r.key = inSrc.length > 1 ? `${id}@${sKey}.${k + 1}` : `${id}@${sKey}`; });
            if (inSrc.length > 1) duplicates.push({ id, src: sKey, file: inSrc[0].file, lines: inSrc.map((r) => r.line) });
        }
        if (srcs.length > 1) collisions.push({ id, entries: list.map((r) => ({ key: r.key, file: r.file, line: r.line })) });
    }
    const near = new Map();
    for (const id of byId.keys()) { const k = normId(id); if (!near.has(k)) near.set(k, new Set()); near.get(k).add(id); }
    const nearCollisions = [];
    for (const [norm, ids] of near) {
        if (ids.size < 2) continue;
        nearCollisions.push({ norm, ids: [...ids].sort(idCompare).map((id) => ({ id, files: [...new Set(byId.get(id).map((r) => r.file))] })) });
    }
    rules.sort((a, b) => idCompare(a.id, b.id) || a.order - b.order || a.line - b.line);
    const out = rules.map((r) => ({
        key: r.key, id: r.id, src: r.src, file: r.file, line: r.line, heading: r.heading, form: r.form,
        prefix: prefixOf(r.id), sha1: sha1(r.excerpt), truncated: r.truncated, excerpt: r.excerpt,
    }));
    const byPrefix = {};
    for (const r of out) { const k = `${r.src} ${r.prefix}`; byPrefix[k] = (byPrefix[k] || 0) + 1; }
    const prefixCounts = Object.keys(byPrefix).sort((a, b) => {
        const [sa, pa] = a.split(' '), [sb, pb] = b.split(' ');
        return sources.findIndex((s) => s.key === sa) - sources.findIndex((s) => s.key === sb) || idCompare(pa, pb);
    }).map((k) => ({ src: k.split(' ')[0], prefix: k.split(' ')[1], rules: byPrefix[k] }));
    collisions.sort((a, b) => idCompare(a.id, b.id));
    duplicates.sort((a, b) => idCompare(a.id, b.id) || (a.src < b.src ? -1 : 1));
    nearCollisions.sort((a, b) => (a.norm < b.norm ? -1 : a.norm > b.norm ? 1 : 0));
    tableMentions.sort((a, b) => idCompare(a.id, b.id) || (a.src < b.src ? -1 : 1) || a.line - b.line);
    // the index sha covers what a rule SAYS (key + excerpt sha), never where it sits (line numbers move)
    const indexSha = sha1(out.map((r) => `${r.key}\t${r.sha1}`).join('\n'));
    return {
        version: 1,
        generatedBy: 'node tests/scripts/ws-spec-card.mjs --index',
        note: 'GENERATED - do not edit by hand. Keys are bare ids, or ID@SRC when an id is defined in more than one place.',
        indexSha,
        sources: perSource,
        totals: { rules: out.length, collisions: collisions.length, duplicates: duplicates.length, nearCollisions: nearCollisions.length, tableMentions: tableMentions.length },
        prefixCounts,
        collisions, duplicates, nearCollisions,
        tableMentions,
        rules: out,
    };
}

/** One rule per line (diffs stay readable); everything else indented. */
function indexJson(idx) {
    const { rules, ...head } = idx;
    const top = JSON.stringify(head, null, 1).replace(/\n}$/, '');
    return `${top},\n "rules": [\n${rules.map((r) => `  ${JSON.stringify(r)}`).join(',\n')}\n ]\n}\n`;
}

function indexMarkdown(idx) {
    const L = [];
    L.push('# Rule-id index (generated)', '');
    L.push('Generated by `node tests/scripts/ws-spec-card.mjs --index` from the standards below; the full records (file, line,');
    L.push('heading path, excerpt, sha1) are in `design/cards/rule-index.json`. Do not edit by hand; `--index --check` fails when stale.', '');
    L.push(`Index sha: \`${idx.indexSha}\` · ${idx.totals.rules} rules · ${idx.totals.collisions} cross-file collisions · ${idx.totals.duplicates} duplicates inside one file · ${idx.totals.nearCollisions} near-collisions · ${idx.totals.tableMentions} table mentions of prose rules`, '');
    L.push('## Rules per file', '', '| Source | File | Rules |', '|---|---|---|');
    for (const s of idx.sources) L.push(`| ${s.key} | \`${s.file}\` | ${s.rules} |`);
    L.push('', '## Rules per prefix', '', '| Source | Prefix | Rules |', '|---|---|---|');
    for (const p of idx.prefixCounts) L.push(`| ${p.src} | ${p.prefix} | ${p.rules} |`);
    L.push('', '## Collisions (one id defined in two files; cite them as `ID@SRC`)', '');
    if (!idx.collisions.length) L.push('None.');
    else { L.push('| Id | Defined in |', '|---|---|'); for (const c of idx.collisions) L.push(`| ${c.id} | ${c.entries.map((e) => `\`${e.key}\` (${e.file}:${e.line})`).join(', ')} |`); }
    L.push('', '## Duplicates (one id defined twice in one file)', '');
    if (!idx.duplicates.length) L.push('None.');
    else { L.push('| Id | File | Lines |', '|---|---|---|'); for (const d of idx.duplicates) L.push(`| ${d.id} | \`${d.file}\` | ${d.lines.join(', ')} |`); }
    L.push('', '## Near-collisions (ids that differ only by a hyphen or a leading zero)', '');
    if (!idx.nearCollisions.length) L.push('None.');
    else { L.push('| Form | Ids |', '|---|---|'); for (const n of idx.nearCollisions) L.push(`| ${n.norm} | ${n.ids.map((x) => `${x.id} (${x.files.join(', ')})`).join('; ')} |`); }
    L.push('', '## Ids cited outside this index', '');
    L.push('The card-coverage test reads the ids critics cite (`design/status/defect-findings.csv`). These are not in the index:', '');
    L.push('| Id | Status | Where |', '|---|---|---|');
    for (const x of KNOWN_EXTERNAL) L.push(`| \`${x.re.source.replace(/^\^|\$$/g, '').replace('(\\d+)', 'n')}\` | external (NOTE, not a warning) | ${x.where} |`);
    for (const [id, why] of Object.entries(KNOWN_TYPOS)) L.push(`| \`${id}\` | known typo in the tally (stays a WARNING) | ${why} |`);
    L.push('');
    return L.join('\n');
}

function readSources(root, sources = SOURCES) {
    return sources.map((s) => ({ ...s, text: fs.readFileSync(path.join(root, s.file), 'utf8') }));
}

/** Rebuild (or with check: compare) the committed index. Returns {ok, msg}. */
export function runIndex(root, { check = false, sources = SOURCES } = {}) {
    const idx = buildIndex(readSources(root, sources));
    const j = indexJson(idx), md = indexMarkdown(idx);
    const jp = path.join(root, INDEX_REL), mp = path.join(root, INDEX_MD_REL);
    if (check) {
        const cj = fs.existsSync(jp) ? fs.readFileSync(jp, 'utf8') : '';
        const cm = fs.existsSync(mp) ? fs.readFileSync(mp, 'utf8') : '';
        const stale = [cj !== j && INDEX_REL, cm !== md && INDEX_MD_REL].filter(Boolean);
        return { ok: !stale.length, idx, msg: stale.length ? `stale: ${stale.join(', ')} (run --index)` : `index current (${idx.totals.rules} rules)` };
    }
    fs.mkdirSync(path.dirname(jp), { recursive: true });
    fs.writeFileSync(jp, j);
    fs.writeFileSync(mp, md);
    return { ok: true, idx, msg: `wrote ${INDEX_REL} and ${INDEX_MD_REL} (${idx.totals.rules} rules, ${idx.totals.collisions} collisions, ${idx.totals.duplicates} duplicates, ${idx.totals.nearCollisions} near-collisions)` };
}

/** The current index, built fresh from the sources (never the committed file, so a stale file cannot hide a change). */
function currentIndex(root, sources = SOURCES) { return buildIndex(readSources(root, sources)); }

/** All index entries a card rule reference names: a bare id names every entry of that id; a key names one. */
function resolveRef(idx, ref) {
    const byKey = idx.rules.filter((r) => r.key === ref);
    if (byKey.length) return byKey;
    return idx.rules.filter((r) => r.id === ref);
}
const refSha = (entries) => (entries.length === 1 ? entries[0].sha1 : sha1(entries.map((e) => `${e.key}\t${e.sha1}`).join('\n')));
const refId = (ref) => ref.split('@')[0];

/* ================================================================ findings (S8 tally) */

export function parseCsv(text) {
    const rows = [];
    let row = [], cell = '', q = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (q) {
            if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c;
        } else if (c === '"') q = true;
        else if (c === ',') { row.push(cell); cell = ''; }
        else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i++;
            row.push(cell); cell = '';
            if (row.length > 1 || row[0] !== '') rows.push(row);
            row = [];
        } else cell += c;
    }
    if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
    if (!rows.length) return [];
    const head = rows[0].map((h) => h.trim());
    return rows.slice(1).map((r) => Object.fromEntries(head.map((h, k) => [h, (r[k] ?? '').trim()])));
}

const splitList = (s) => String(s || '').split(/[;,]/).map((x) => x.trim()).filter(Boolean);

/**
 * The findings that concern a card. The findings CSV's family / template / run / summary fields are free text, so a
 * finding counts when
 *   - its `family` is one of the card's categories (the categories of its own skills) or listed families, or
 *   - its `template` is one of the card's templates, or
 *   - its `run` or `summary` names one of the card's skills: `cat:skill` anywhere, or the bare skill id when it holds an
 *     underscore (`add_100_mixed`); a bare id without one (`add`, `multiply`) is an ordinary word and needs the `cat:`.
 * `match` = {templates, families, skills}; skills are `category:skill` keys.
 */
export function findingsFor(rows, match) {
    const tpl = new Set((match.templates || []).map((x) => x.toLowerCase()));
    const skills = (match.skills || []).map((k) => k.toLowerCase());
    const fam = new Set([...(match.families || []), ...skills.map((k) => k.split(':')[0])].map((x) => x.toLowerCase()));
    const keys = new Set(skills);
    const bare = new Set(skills.map((k) => k.split(':')[1]).filter((s) => s && s.includes('_')));
    const namesSkill = (text) => {
        if (!keys.size && !bare.size) return false;
        for (const m of String(text || '').toLowerCase().matchAll(/[a-z0-9_]+(?::[a-z0-9_]+)?/g)) {
            if (keys.has(m[0])) return true;
            for (const part of m[0].split(':')) if (bare.has(part)) return true;
        }
        return false;
    };
    return rows.filter((r) => splitList(r.template).some((t) => tpl.has(t.toLowerCase()))
        || splitList(r.family).some((f) => fam.has(f.toLowerCase()))
        || namesSkill(r.run) || namesSkill(r.summary));
}
function citedIds(rows) {
    const out = new Set();
    for (const r of rows) for (const id of splitList(String(r.rule_ids || '').replace(/,/g, ';'))) out.add(id.replace(/^\*+|\*+$/g, ''));
    return [...out].sort(idCompare);
}
function readFindings(root, findingsPath) {
    const p = findingsPath ? path.resolve(root, findingsPath) : path.join(root, FINDINGS_REL);
    if (!fs.existsSync(p)) return { rows: null, file: rel(root, p) };
    const shown = rel(root, p).startsWith('..') ? p : rel(root, p);
    return { rows: parseCsv(fs.readFileSync(p, 'utf8')), file: shown };
}

/* ================================================================ repo derivations (read-only imports) */

async function importRepo(root, file) {
    return import(pathToFileURL(path.join(root, file)).href);
}

/** Skills whose catalogue print formats match, plus the card's include list, minus its exclude list. */
function catalogueSkills(root, printFormatsRe) {
    const p = path.join(root, 'design/SKILL_CATALOGUE.md');
    if (!printFormatsRe || !fs.existsSync(p)) return [];
    const re = new RegExp(printFormatsRe);
    const out = [];
    let cat = '';
    for (const ln of fs.readFileSync(p, 'utf8').split('\n')) {
        const h = /^### ([a-z_0-9]+)\s*$/.exec(ln);
        if (h) { cat = h[1]; continue; }
        const m = /^\| `([a-z0-9_]+)` [^|]*\|[^|]*\|[^|]*\|[^|]*\|([^|]*)\|/.exec(ln);
        if (!m || !cat) continue;
        if (m[2].split(',').map((x) => x.trim()).some((f) => re.test(f))) out.push(`${cat}:${m[1]}`);
    }
    return out;
}

async function deriveFromRepo(root, cfg, idx) {
    const d = { skills: [], labels: {}, standards: { ccss: [], ee: [] }, wrm: [], buildEntries: [], options: [], presets: [], sourceRules: [], capacity: [], gates: [] };
    const sel = cfg.skills || {};
    const set = new Set(catalogueSkills(root, sel.printFormats));
    for (const k of sel.include || []) set.add(k);
    for (const k of sel.exclude || []) set.delete(k);
    for (const k of [...set]) if ((sel.excludeCategories || []).includes(k.split(':')[0])) set.delete(k);
    d.skills = [...set].sort();
    let DATA = null;
    try { DATA = await importRepo(root, 'js/modules/data.js'); } catch { DATA = null; }
    if (DATA && DATA.SKILLS) {
        for (const [cat, list] of Object.entries(DATA.SKILLS)) for (const s of list || []) if (s && s.v) d.labels[`${cat}:${s.v}`] = s.l || s.v;
    }
    try {
        const ST = await importRepo(root, 'js/modules/standards.js');
        const ccss = new Set(), ee = new Set();
        for (const k of d.skills) { const e = ST.SKILL_STANDARDS[k]; if (e) { (e.ccss || []).forEach((c) => ccss.add(c)); (e.ee || []).forEach((c) => ee.add(c)); } }
        d.standards = { ccss: [...ccss].sort(idCompare), ee: [...ee].sort(idCompare) };
    } catch { /* standards not loadable: section 1 says so */ }
    try {
        const W = await importRepo(root, 'js/modules/wrm.js');
        const steps = new Set();
        for (const k of d.skills) for (const s of W.SKILL_WRM[k] || []) steps.add(typeof s === 'string' ? s : `${s.step} (part)`);
        d.wrm = [...steps].sort(idCompare);
    } catch { /* idem */ }
    try {
        const BL = await importRepo(root, 'js/modules/build-list.js');
        const tpl = cfg.template && cfg.template.id;
        const fams = new Set(cfg.families || []);
        d.buildEntries = BL.buildList().filter((e) => (tpl && ((e.templates || []).includes(tpl) || (e.newTemplates || []).includes(tpl)))
            || (cfg.kind === 'family' && fams.has(String(e.skill).split(':')[0])))
            .map((e) => ({ id: e.id, kind: e.kind, source: e.source, skill: e.skill, name: e.name, standards: e.standards || [], wrmSteps: e.wrmSteps || [],
                problemTypes: e.problemTypes || [], answer: e.answer || '', ladder: e.ladder || '', misconceptions: e.misconceptions || [] }))
            .sort((a, b) => (a.id < b.id ? -1 : 1));
    } catch { /* idem */ }
    try {
        const SO = await importRepo(root, 'js/modules/skill-options.js');
        const opt = new Map();
        for (const k of d.skills) for (const o of SO.SKILL_OPTIONS[k] || []) {
            const key = `${o.id}|${o.label}`;
            if (!opt.has(key)) opt.set(key, { id: o.id, label: o.label, values: (o.values || []).map((v) => (v && typeof v === 'object' ? (v.v === null || v.v === undefined ? `(${v.l || 'default'})` : String(v.v)) : String(v))), skills: 0 });
            opt.get(key).skills++;
        }
        d.options = [...opt.values()].sort((a, b) => b.skills - a.skills || (a.id < b.id ? -1 : 1));
        const SP = await importRepo(root, 'js/modules/skill-presets.js');
        for (const [key, p] of Object.entries(SP.SKILL_PRESETS)) {
            const host = `${key.split(':')[0]}:${p.skill}`;
            if (d.skills.includes(host)) d.presets.push({ key, host, opts: p.opts || {} });
        }
        d.presets.sort((a, b) => (a.key < b.key ? -1 : 1));
    } catch { /* idem */ }
    // rule ids the template's own source cites (its header and comments)
    if (cfg.template && cfg.template.source && fs.existsSync(path.join(root, cfg.template.source))) {
        const src = fs.readFileSync(path.join(root, cfg.template.source), 'utf8');
        const ids = new Set();
        const known = new Set(idx.rules.map((r) => r.id));
        for (const m of src.matchAll(/\b([A-Z]{1,4}(?:-[A-Z0-9]{1,5})*-\d+[a-z]?)(?:\s*(?:\.\.|to|–)\s*([A-Z]{1,4}-)?(\d+))?/g)) {
            if (known.has(m[1])) ids.add(m[1]);
            if (m[3]) {   // a range: VA-10..VA-13
                const pre = m[1].replace(/\d+[a-z]?$/, ''), from = Number(m[1].match(/(\d+)[a-z]?$/)[1]), to = Number(m[3]);
                for (let n = from; n <= to && to - from < 20; n++) if (known.has(`${pre}${n}`)) ids.add(`${pre}${n}`);
            }
        }
        d.sourceRules = [...ids].sort(idCompare);
    }
    // capacity rows: the table under a bold label in a standard
    for (const c of (cfg.drawing && cfg.drawing.capacity) || []) {
        const p = path.join(root, c.file);
        if (!fs.existsSync(p)) { d.capacity.push({ ...c, missing: true, lines: [] }); continue; }
        const lines = fs.readFileSync(p, 'utf8').split('\n');
        const at = lines.findIndex((l) => l.trim() === `**${c.label}**` || l.startsWith(`**${c.label}**`));
        if (at < 0) { d.capacity.push({ ...c, missing: true, lines: [] }); continue; }
        const out = [lines[at], ''];
        let j = at + 1;
        while (j < lines.length && !lines[j].trim()) j++;
        for (; j < lines.length && lines[j].startsWith('|'); j++) out.push(lines[j]);
        // the one note paragraph after the table, when it is not the next label
        while (j < lines.length && !lines[j].trim()) j++;
        if (j < lines.length && !/^(\*\*|#|-|\|)/.test(lines[j])) out.push('', lines[j]);
        d.capacity.push({ ...c, lines: out });
    }
    for (const g of cfg.gates || []) {
        const script = (/tests\/scripts\/[\w.-]+/.exec(g.cmd) || [])[0];
        d.gates.push({ ...g, exists: script ? fs.existsSync(path.join(root, script)) : true });
    }
    d.surface = await deriveSurface(root, d.skills);
    return d;
}

/** A source file without its comments (so a role's data needs are read from code, not prose). */
const stripComments = (src) => String(src).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`\\])\/\/[^\n]*/g, '$1');
/** The provider members a role module reads (in its code or its header), and what each role's data comes from. */
const ROLE_MEMBERS = ['workedSteps', 'wrongAnswer', 'wrongAnswers', 'stories', 'misconceptions'];
/** The screen-host names the gates use, mapped to one id (ws-envelope's names win). */
const HOST_ALIASES = { card: 'practice-card', worksheet: 'online-worksheet' };

/**
 * The live surface of the card's skills (W0-B2), read from the repo (nothing hand-listed):
 *   options  every value offeredOptionsFor(cat, skill) returns (js/modules/skill-options.js, with the derived table, the
 *            pools and the presets loaded, as ws-card-rulings loads them): one line per option=value, the skills that
 *            offer it, its label and whether the value is the default;
 *   roles    every role buildSheet accepts: the ids print-sheet.js SHEET_ROLES lists before its spread plus
 *            sheet/roles/index.js ROLE_MODULES (aliases from ROLE_ALIASES), each with its data source: lesson data
 *            (lessons/prereqs.js LESSONS) or the fallback, the earlier skills (data.js order), and the provider members
 *            the role module reads (sheet/contract.js getProvider: real or default, per skill);
 *   hosts    every screen host the screen gates drive: ws-envelope's host list and the `arg('hosts', '...')` defaults of
 *            the tests/scripts screen gates (card = practice-card, worksheet = online-worksheet), plus the display modes
 *            those gates take as flags (`--dark`, `--bigboard`).
 * A part that cannot be read (a tree without the module) is an empty list plus a `problems` entry, never a guess.
 */
async function deriveSurface(root, skills) {
    const s = { options: [], roles: [], hosts: [], problems: [] };
    if (!skills.length) return s;
    const short = (k) => k.split(':')[1];
    // ---- options
    try {
        const SO = await importRepo(root, 'js/modules/skill-options.js');
        for (const side of ['skill-options-derived.js', 'skill-options-pools.js', 'skill-presets.js']) {
            if (fs.existsSync(path.join(root, 'js/modules', side))) { try { await importRepo(root, `js/modules/${side}`); } catch { /* optional */ } }
        }
        const lines = new Map();
        for (const k of skills) {
            const [cat, id] = k.split(':');
            let defs = [];
            try { defs = SO.offeredOptionsFor(cat, id) || []; } catch (e) { s.problems.push(`offeredOptionsFor(${k}) threw: ${e.message}`); continue; }
            for (const def of defs) {
                const isSet = def.type === 'set';
                const dflt = isSet ? (Array.isArray(def.default) ? def.default.map(String) : []) : [String(def.default)];
                let vals;
                if (def.type === 'bool') vals = ['true', 'false'];
                else if (Array.isArray(def.values) && def.values.length) vals = def.values.map((v) => (v && typeof v === 'object' ? String(v.v) : String(v)));
                else vals = ['*'];
                for (const v of vals) {
                    const key = `${def.id}=${v}`;
                    if (!lines.has(key)) lines.set(key, { key, option: def.id, value: v, label: def.label || def.id, group: def.group || '', skills: [], dflt: [] });
                    const ln = lines.get(key);
                    ln.skills.push(k);
                    if (v !== '*' && dflt.includes(v)) ln.dflt.push(k);
                }
            }
        }
        for (const ln of lines.values()) {
            const dl = ln.dflt.length === ln.skills.length ? ', default' : ln.dflt.length ? `, default on ${ln.dflt.map(short).join(', ')}` : '';
            s.options.push({ key: ln.key, skills: ln.skills, text: `${ln.label}${ln.group ? ` [${ln.group}]` : ''}${dl}` });
        }
    } catch (e) { s.problems.push(`skill-options.js: ${e.message}`); }
    // ---- roles
    try {
        const RI = await importRepo(root, 'js/modules/sheet/roles/index.js');
        const ps = fs.readFileSync(path.join(root, 'js/modules/print-sheet.js'), 'utf8');
        const m = /SHEET_ROLES\s*=\s*Object\.freeze\(\[([^\]]*)\]\)/.exec(ps);
        const lead = m ? [...m[1].split('...')[0].matchAll(/'([\w-]+)'/g)].map((x) => x[1]) : ['independent', 'more-practice'];
        if (!m) s.problems.push('print-sheet.js: SHEET_ROLES not found; took independent, more-practice');
        const roles = [...new Set([...lead, ...Object.keys(RI.ROLE_MODULES || {})])];
        const aliases = RI.ROLE_ALIASES || {};
        let LS = null, K = null;
        try { LS = await importRepo(root, 'js/modules/lessons/prereqs.js'); } catch { LS = null; }
        try { K = await importRepo(root, 'js/modules/sheet/index.js'); if (fs.existsSync(path.join(root, 'js/modules/sheet/providers/index.js'))) await importRepo(root, 'js/modules/sheet/providers/index.js'); } catch { K = null; }
        const prov = (k) => { try { return K && K.getProvider ? K.getProvider(...k.split(':')) : null; } catch { return null; } };
        for (const r of roles) {
            const f = path.join(root, 'js/modules/sheet/roles', `${r}.js`);
            const full = fs.existsSync(f) ? fs.readFileSync(f, 'utf8') : '';
            const code = stripComments(full);
            const parts = [];
            if (r === 'lesson') {
                const has = skills.filter((k) => LS && LS.LESSONS && LS.LESSONS[k]);
                parts.push(`lesson data: prereqs.js ${has.length}/${skills.length}${has.length < skills.length ? ` (FALLBACK, warm-up from the earlier skills in data.js order, on ${skills.filter((k) => !has.includes(k)).map(short).join(', ')})` : ''}`);
            } else if (/\bearlier\b/.test(code)) parts.push('earlier skills: data.js order (print-sheet.js earlierSkills)');
            // the members a role names, in code or in its header (a role that reads a member through the host or
            // compose.js documents it there: true-false "each from `wrongAnswer(q)`")
            const used = ROLE_MEMBERS.filter((mm) => new RegExp(`\\b${mm}\\b`).test(full));
            for (const mm of used) {
                const real = skills.filter((k) => { const p = prov(k); return p && (p.real || []).includes(mm); });
                parts.push(`provider ${mm}: real ${real.length}/${skills.length}${real.length < skills.length ? ` (default on ${skills.filter((k) => !real.includes(k)).map(short).join(', ')})` : ''}`);
            }
            if (!parts.length) parts.push("the skill's own items");
            const al = Object.entries(aliases).filter(([, v]) => v === r).map(([a]) => a);
            s.roles.push({ key: `role:${r}`, skills: skills.slice(), text: `${al.length ? `(also ${al.join(', ')}) ` : ''}— ${parts.join('; ')}` });
        }
    } catch (e) { s.problems.push(`roles: ${e.message}`); }
    // ---- hosts
    try {
        const dir = path.join(root, 'tests/scripts');
        const hosts = new Map();
        const addH = (h, from) => { const id = HOST_ALIASES[h] || h; if (!hosts.has(id)) hosts.set(id, new Set()); hosts.get(id).add(from); };
        const env = path.join(dir, 'ws-envelope.mjs');
        if (fs.existsSync(env)) { const mm = /const hosts = \[([^\]]*)\]/.exec(fs.readFileSync(env, 'utf8')); if (mm) for (const q of mm[1].matchAll(/'([\w-]+)'/g)) addH(q[1], 'ws-envelope'); }
        for (const f of fs.existsSync(dir) ? fs.readdirSync(dir).filter((x) => /^ws-.*\.(c|m)?js$/.test(x)).sort() : []) {
            const src = fs.readFileSync(path.join(dir, f), 'utf8');
            const mm = /const HOSTS = \(arg\('hosts',(.*)$/m.exec(src);
            if (!mm) continue;
            const name = f.replace(/\.(c|m)?js$/, '');
            for (const q of mm[1].replace(/\bhas\('[^']*'\)/g, '').matchAll(/'([\w,-]+)'/g)) for (const h of q[1].split(',')) if (h) addH(h, name);
            if (/\bhas\('dark'\)/.test(src)) addH('mode-dark', name);
            if (/\bhas\('bigboard'\)/.test(src)) addH('mode-bigboard', name);
        }
        for (const [h, from] of [...hosts].sort((a, b) => (a[0] < b[0] ? -1 : 1))) s.hosts.push({ key: `host:${h}`, skills: skills.slice(), text: `— driven by ${[...from].sort().join(', ')}` });
    } catch (e) { s.problems.push(`hosts: ${e.message}`); }
    return s;
}

/* ================================================================ the card */

function cardPaths(root, id) {
    const dir = path.join(root, CARDS_REL, id);
    return { dir, cfg: path.join(dir, 'card.json'), md: path.join(dir, `${id}.md`) };
}

/** A rule's excerpt for the card: its text without the leading id marker, collapsed, cut at a sentence when long. */
function cardExcerpt(r, full, limit) {
    let t = r.excerpt;
    if (r.form === 'table') {
        t = t.replace(/^\|/, '').replace(/\|\s*$/, '').split('|').map((x) => x.trim()).slice(1).join(' — ');
    } else {
        t = t.replace(/^#{1,6}\s+/, '').replace(/^ {0,3}[-*+]\s+/, '');
        t = t.replace(new RegExp(`^\\*\\*${r.id.replace(/[-]/g, '\\-')}[.:]?\\*\\*\\s*`), '').replace(new RegExp(`^\\*\\*${r.id.replace(/[-]/g, '\\-')}[.:]?\\s*`), '**');
        t = t.replace(new RegExp(`^${r.id.replace(/[-]/g, '\\-')}\\s*[·.:]?\\s*`), '');
    }
    t = t.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim();
    if (full || t.length <= limit) return t;
    const cut = t.slice(0, limit);
    const stop = Math.max(cut.lastIndexOf('. '), cut.lastIndexOf('; '));
    return `${(stop > limit * 0.5 ? cut.slice(0, stop + 1) : cut.replace(/\s+\S*$/, '')).trim().replace(/\s*[-–—:,;(]$/, '')} …`;
}

function bullets(list, fmt = (x) => x) { return list.length ? list.map((x) => `- ${fmt(x)}`) : ['- (none)']; }

/** Natural order for size tokens: 10 < 20 < 100 < 1k < 10k < 1m; otherwise idCompare. */
function sizeKey(t) { const m = /^(\d+)(k|m)?$/.exec(t); return m ? Number(m[1]) * (m[2] === 'k' ? 1e3 : m[2] === 'm' ? 1e6 : 1) : null; }
const tokCompare = (a, b) => { const x = sizeKey(a), y = sizeKey(b); return x !== null && y !== null ? x - y : idCompare(a, b); };
/**
 * Skill ids of one category, written compactly: ids `stem_rest` that share a two-token stem collapse to
 * `stem_{r1,r2,...}` (at least 3), and those patterns that differ only in their second token collapse again:
 * `add_{10,20,100}_{mixed,no_regroup,regroup}`. `expandBraces` is the inverse (readCard uses it).
 */
export function compressIds(ids) {
    const byStem = new Map();
    const single = [];
    for (const id of ids) {
        const t = id.split('_');
        if (t.length < 3) { single.push(id); continue; }
        const stem = `${t[0]}_${t[1]}`;
        if (!byStem.has(stem)) byStem.set(stem, []);
        byStem.get(stem).push(t.slice(2).join('_'));
    }
    const pats = [];
    for (const [stem, rests] of byStem) {
        if (rests.length < 3) { for (const r of rests) single.push(`${stem}_${r}`); continue; }
        pats.push({ head: stem.split('_')[0], mid: stem.split('_')[1], tail: `{${[...rests].sort(idCompare).join(',')}}` });
    }
    const byShape = new Map();
    for (const p of pats) { const k = `${p.head}\t${p.tail}`; if (!byShape.has(k)) byShape.set(k, []); byShape.get(k).push(p.mid); }
    const out = [...single];
    for (const [k, mids] of byShape) {
        const [head, tail] = k.split('\t');
        out.push(mids.length > 1 ? `${head}_{${mids.sort(tokCompare).join(',')}}_${tail}` : `${head}_${mids[0]}_${tail}`);
    }
    return out.sort((a, b) => idCompare(a.replace(/[{}]/g, ''), b.replace(/[{}]/g, '')));
}
export function expandBraces(p) {
    const m = /\{([^{}]*)\}/.exec(p);
    if (!m) return [p];
    return m[1].split(',').flatMap((alt) => expandBraces(p.slice(0, m.index) + alt + p.slice(m.index + m[0].length)));
}
function compactSkills(skills) {
    const byCat = new Map();
    for (const k of skills) { const [c, s] = k.split(':'); if (!byCat.has(c)) byCat.set(c, []); byCat.get(c).push(s); }
    return [...byCat].map(([c, ids]) => `- **${c}** (${ids.length}): ${compressIds(ids).map((s) => `\`${s}\``).join(', ')}`);
}
/** WRM steps grouped by year and block: `Y1.B2 S8, S15, S17 (part)`. */
function compactSteps(steps) {
    const by = new Map();
    for (const s of steps) { const m = /^(Y\d+\.B\d+)\.(S\d+.*)$/.exec(s); const k = m ? m[1] : ''; if (!by.has(k)) by.set(k, []); by.get(k).push(m ? m[2] : s); }
    return [...by].map(([k, v]) => (k ? `${k} ${v.join(', ')}` : v.join(', '))).join('; ');
}

/**
 * The rule-sha list in the machine block, compact: "REF SHA REF SHA ...", where a ref that shares the previous ref's
 * prefix is written as its number only ("VA-1 12d322 2 26885a" = VA-1, VA-2). unpackRules also reads the older
 * {ref: sha} object.
 */
const idParts = (ref) => { const m = /^([A-Za-z][A-Za-z0-9-]*?-?)(\d+[a-z]?)$/.exec(ref); return m ? { pre: m[1], num: m[2] } : null; };
function packRules(o) {
    const out = [];
    let prev = null;
    for (const [k, v] of Object.entries(o)) {
        const p = idParts(k);
        out.push(p && prev && p.pre === prev ? p.num : k, v);
        prev = p ? p.pre : null;
    }
    return out.join(' ');
}
function unpackRules(v) {
    if (v && typeof v === 'object') return v;
    const out = {};
    const t = String(v || '').split(/\s+/).filter(Boolean);
    let prev = null;
    for (let i = 0; i + 1 < t.length; i += 2) {
        const ref = /^\d+[a-z]?$/.test(t[i]) && prev !== null ? `${prev}${t[i]}` : t[i];
        out[ref] = t[i + 1];
        const p = idParts(ref);
        prev = p ? p.pre : null;
    }
    return out;
}
const cardMatch = (cfg) => {
    const tplId = cfg.template ? cfg.template.id : null;
    const fm = cfg.findingsMatch || {};
    return { templates: fm.templates || (tplId ? [tplId] : []), families: [...new Set([...(fm.families || []), ...(cfg.families || [])])] };
};
/** The last heading of a rule's heading path, plain and short (for the ids-only list). */
function shortHeading(h) {
    const t = String(h || '').split(' > ').pop().replace(/\*\*|`/g, '').replace(/\s+/g, ' ').trim() || '(top)';
    const u = t.replace(/\s*\([^)]*\)\s*$/, '').replace(/^Appendix [A-Z]\s*[—:-]\s*/, '');
    return u.length > 36 ? `${u.slice(0, 34).replace(/\s+\S*$/, '')} …` : u;
}
/*
 * The informational block (card format 2; W0-B fix 02c5308e, ported). Everything the owner signs sits ABOVE the Signed
 * line. The live listing of what the repo offers today (§7b: every option value offeredOptionsFor() returns, every
 * role buildSheet takes and every screen host, each with the decision card.json gives it, plus the options and
 * presets declared in skill-options.js / skill-presets.js) sits BELOW it, between these two fences: it is not hashed
 * (bodySha), not compared (--check-signed (d)), and never read by any check (rules, skills, the Signed line are all
 * parsed from the signed part only; the decision check (e) re-derives the live listing from the repo). A card without
 * the fences is format 1 (the whole text is the signed part).
 */
const INFO_OPEN = '<!-- informational: not signed. Not hashed, not compared, never read by any check. -->';
const INFO_CLOSE = '<!-- /informational -->';
/** {signedPart, info, format}: the signed part ends with the Signed line and one newline. */
export function splitCard(text) {
    const at = text.indexOf(`\n${INFO_OPEN}\n`);
    if (at < 0) return { signedPart: text, info: null, format: 1 };
    return { signedPart: `${text.slice(0, at).replace(/\n+$/, '')}\n`, info: text.slice(at + 1), format: 2 };
}
/** Why a format-2 card's informational block is malformed (it may not hide signed content or carry rules). */
function infoProblems(text) {
    const { signedPart, info, format } = splitCard(text);
    if (format === 1) return [];
    const out = [];
    const last = signedPart.trimEnd().split('\n').pop();
    if (!/^Signed: /.test(last)) out.push('the informational block does not start right after the Signed line (signed content may not be fenced off)');
    if (info.split(INFO_OPEN).length !== 2 || info.split(INFO_CLOSE).length !== 2) out.push('the informational block has more than one fence');
    else if (info.slice(info.indexOf(INFO_CLOSE) + INFO_CLOSE.length).trim()) out.push('text after the informational block (the card must end with it)');
    if (/^\s*- \*\*[A-Za-z]/m.test(info) || /^#{1,6} (?!7b\. )/m.test(info) || /<!-- rulings/.test(info)) out.push('the informational block carries a rule, a rulings block or a section heading (only §7b may sit there)');
    return out;
}
/** sha of a card's signed part without its Signed line and without the bodySha value itself (hand edits change it). */
function bodyShaOf(text) {
    const t = splitCard(text).signedPart.split('\n').filter((l) => !/^Signed: /.test(l)).join('\n').replace(/"bodySha":"[0-9a-f]*"/, '"bodySha":""');
    return sha1(t).slice(0, BODY_SHA_LEN);
}
const INFO_POINTER = 'What the repo offers today (every option value, role and screen host, each with its decision) and the options and preset skills declared in the repo are listed after the Signed line (§7b, informational, not signed).';
/** sha of the parsed card.json (whitespace-insensitive): any config change after signing fails --check-signed. */
function configShaOf(cfg) { return sha1(JSON.stringify(cfg)).slice(0, 12); }

/* ---------------------------------------------------------------- hosts, roles and options: the decisions (§7a) */
/*
 * W0-B2 "card hosts and roles" (pilot-su-c: the card did not decide what the critic graded). The repo is read for three
 * listings (deriveSurface): every value offeredOptionsFor() returns on each card skill (the `_ap4*` patches and the
 * universal / number-line / play controls included, since they are applied to SKILL_OPTIONS when skill-options.js
 * loads), every role buildSheet accepts with the data it reads, and every screen host the screen gates drive. Each LINE
 * has a key: `option=value` (`option=*` for a free number, `rows=*` for a rows editor), `role:<id>`, `host:<id>`. The
 * DECISIONS live in card.json `decisions` {options, roles, hosts}: arrays of
 *   {"key": "notation=across", "d": "offered"|"hidden"|"out of scope", "why": "...", "source": "§5.8",
 *    "skills": ["cat:skill", ...]?   only these skills (a decision for one skill beats one for all),
 *    "proposed": true?}              pre-filled for the lead, not yet confirmed: signing the card accepts it
 * or {"option": "nlStep", "values": ["1", "2", ...], "d": ...} for several values of one option at once (values are
 * listed, never wildcarded, so a NEW value is an undecided line; "*" is the free-number line's own value). The
 * decisions print signed in §7a and feed the rulings block: every `hidden` option decision becomes a notOffered entry
 * (`N-D-<option>`), which ws-card-rulings --check offered then holds the panel to. --check-signed (e) FAILS while a live
 * line has no decision (a new option, value, role or host appeared) and NOTEs proposed decisions and decided lines the
 * repo no longer has.
 */
export const DECISIONS = Object.freeze(['offered', 'hidden', 'out of scope']);
const DEC_GROUPS = Object.freeze([['options', 'Option values (offeredOptionsFor)'], ['roles', 'Page roles (buildSheet)'], ['hosts', 'Screen hosts']]);
/** The decision entries of card.json, expanded: one {group, key, d, why, source, skills, proposed} per line key. */
export function expandDecisions(cfg) {
    const dec = (cfg && cfg.decisions) || {};
    const out = [];
    for (const [g] of DEC_GROUPS) {
        for (const e of dec[g] || []) {
            const keys = e.option ? (e.values || []).map((v) => `${e.option}=${v}`) : [g === 'options' ? e.key : `${g === 'roles' ? 'role' : 'host'}:${String(e.key).replace(/^(role|host):/, '')}`];
            for (const key of keys) out.push({ group: g, key, d: e.d, why: e.why || '', source: e.source || '', skills: e.skills || null, proposed: !!e.proposed });
        }
    }
    return out;
}
/** Problems with the decision entries themselves (an unknown decision word, a key with no value). */
function decisionProblems(cfg) {
    const out = [];
    for (const e of expandDecisions(cfg)) {
        if (!DECISIONS.includes(e.d)) out.push(`decision "${e.key}": "${e.d}" is not one of ${DECISIONS.join(' / ')}`);
        if (e.group === 'options' && !/^[\w-]+=.+$/.test(e.key)) out.push(`decision "${e.key}": an option decision is "option=value" (or {option, values})`);
    }
    return out;
}
/** The decision for one live line on one skill: the most specific entry (skills named beats all skills), else null. */
function decisionFor(decs, key, skill) {
    const hit = decs.filter((e) => e.key === key);
    return hit.find((e) => e.skills && e.skills.includes(skill)) || hit.find((e) => !e.skills) || null;
}
/**
 * Every live line with the decision for each of its skills: [{group, key, text, skills, by: {skill: decision|null}}].
 * A line on several skills can carry different decisions (one entry with `skills`, one without).
 */
export function decideSurface(cfg, surface) {
    const decs = expandDecisions(cfg);
    const out = [];
    for (const [g] of DEC_GROUPS) {
        for (const ln of (surface && surface[g]) || []) {
            const by = {};
            for (const s of ln.skills) by[s] = decisionFor(decs, ln.key, s);
            out.push({ group: g, ...ln, by });
        }
    }
    return out;
}
/** The marker a §7b line carries: `[offered]`, `[hidden, PROPOSED]`, `[UNDECIDED]`, or per skill when they differ. */
function markerOf(line) {
    const tag = (d) => (d ? `${d.d}${d.proposed ? ', PROPOSED' : ''}` : 'UNDECIDED');
    const vals = [...new Set(Object.values(line.by).map(tag))];
    if (vals.length === 1) return `[${vals[0]}]`;
    const per = new Map();
    for (const [s, d] of Object.entries(line.by)) { const k = tag(d); if (!per.has(k)) per.set(k, []); per.get(k).push(s.split(':')[1]); }
    return `[${[...per].map(([k, ss]) => `${k}: ${ss.join(', ')}`).join('; ')}]`;
}
/** notOffered entries the `hidden` option decisions add to the rulings block (one per option and skill scope). */
export function hiddenNotOffered(cfg) {
    const by = new Map();
    for (const e of expandDecisions(cfg)) {
        if (e.group !== 'options' || e.d !== 'hidden') continue;
        const [opt, ...rest] = e.key.split('='); const v = rest.join('=');
        const scope = (e.skills || []).slice().sort().join(',');
        const k = `${opt}|${scope}`;
        if (!by.has(k)) by.set(k, { id: `N-D-${opt}${scope ? `-${by.size + 1}` : ''}`, source: `§7a (decision${e.proposed ? ', PROPOSED' : ''}: ${e.source || 'card'})`, option: opt, values: [], ...(e.skills ? { skills: e.skills.slice().sort() } : {}), any: false });
        const x = by.get(k);
        if (v === '*') x.any = true; else x.values.push(v);
        // a hidden on/off control (both values) is the whole control hidden: notOffered names the option alone
        if (x.values.includes('true') && x.values.includes('false')) x.any = true;
        if (e.proposed && !/PROPOSED/.test(x.source)) x.source = x.source.replace('(decision', '(decision, PROPOSED');
    }
    return [...by.values()].map(({ any, values, ...x }) => (any || !values.length ? x : { ...x, values }));
}
/** sha (6 hex) of every signed rulings / notOffered / decision entry, keyed R:id, N:id, D:key[@skills]. */
function signedEntriesOf(cfg) {
    const r = cfg.rulings || {};
    const out = {};
    for (const x of r.rulings || []) out[`R:${x.id}`] = sha1(JSON.stringify(x)).slice(0, SHA_LEN);
    for (const x of r.notOffered || []) out[`N:${x.id}`] = sha1(JSON.stringify(x)).slice(0, SHA_LEN);
    for (const e of expandDecisions(cfg)) out[`D:${e.key}${e.skills ? `@${e.skills.slice().sort().join(',')}` : ''}`] = sha1(JSON.stringify([e.d, e.proposed])).slice(0, SHA_LEN);
    return out;
}
/** §7a: the signed decisions, from card.json, one line per entry (several values of one option on one line). */
function decisionsSection(cfg) {
    const dec = cfg.decisions || {};
    const L = ['### 7a. Hosts, roles and options — the decisions (signed)', ''];
    L.push(`What the critic grades and the panel may show. Each live line in §7b needs one of: **offered** (shown and graded on every page type and host it reaches), **hidden** (must not be offered on these skills: becomes a notOffered entry of the rulings block, checked by ws-card-rulings --check offered), **out of scope** (offered by the app but not graded on this card; say where it is graded). PROPOSED = pre-filled for the lead from existing rulings and status; signing the card accepts it.`, '');
    let n = 0;
    for (const [g, title] of DEC_GROUPS) {
        const list = dec[g] || [];
        if (!list.length) continue;
        L.push(`**${title}**`, '');
        for (const e of list) {
            n++;
            const key = e.option ? `${e.option}=${(e.values || []).join(' | ')}` : String(e.key);
            L.push(`- \`${key}\` — **${e.d}**${e.proposed ? ' (PROPOSED)' : ''}${e.skills ? ` on ${e.skills.map((s) => `\`${s.split(':')[1]}\``).join(', ')}` : ''}${e.why ? ` — ${e.why}` : ''}${e.source ? ` (${e.source})` : ''}`);
        }
        L.push('');
    }
    if (!n) L.push('(no decisions yet: every line in §7b is UNDECIDED, and --check-signed fails until card.json `decisions` decides each)', '');
    return L;
}
/** §7b body: every live line with its marker, grouped. */
function surfaceListing(cfg, d) {
    const L = [];
    const lines = decideSurface(cfg, d.surface || {});
    const nSk = (d.skills || []).length;
    for (const [g, title] of DEC_GROUPS) {
        const ls = lines.filter((x) => x.group === g);
        L.push(`**${title}** (${ls.length} line${ls.length === 1 ? '' : 's'}${ls.length ? `; ${ls.filter((x) => Object.values(x.by).some((v) => !v)).length} undecided` : ''})`, '');
        if (!ls.length) L.push('- (none found in the repo)');
        for (const x of ls) {
            const who = x.skills.length === nSk ? `all ${nSk}` : x.skills.map((s) => s.split(':')[1]).join(', ');
            L.push(`- \`${x.key}\` ${x.text ? `${x.text} ` : ''}(${who}) ${markerOf(x)}`);
        }
        L.push('');
    }
    return L;
}
const packEntries = (o) => Object.entries(o).map(([k, v]) => `${encodeURIComponent(k)} ${v}`).join(' ');
const unpackEntries = (s) => { const out = {}; const t = String(s || '').split(/\s+/).filter(Boolean); for (let i = 0; i + 1 < t.length; i += 2) out[decodeURIComponent(t[i])] = t[i + 1]; return out; };

/**
 * The card's machine-readable RULINGS block (the format of tests/scripts/ws-card-rulings.mjs, which precritic runs as
 * `--check rulings` / `--check offered`). Always present, so a card is never silently unruled:
 *   skills      the card's skills (derived) plus any skill an authored ruling names (e.g. a proposed preset);
 *   rulings / notOffered   copied from card.json "rulings" {rulings, notOffered}: each entry cites the card section it
 *               encodes in "source" (§5.n = owner ruling n, §9.n = open question n, §1 / §3 / §7 ...);
 *   todo        every prose ruling (§5.n, §9.n) that no entry's source cites — listed, never machine-checked.
 */
export function rulingsBlock(cfg, d) {
    const r = cfg.rulings || {};
    const rulings = r.rulings || [], notOffered = [...(r.notOffered || []), ...hiddenNotOffered(cfg)];
    const named = [...rulings, ...notOffered].flatMap((x) => x.skills || []);
    const skills = [...new Set([...(d.skills || []), ...named])].sort();
    const cites = new Set([...rulings, ...notOffered].flatMap((x) => [...String(x.source || '').matchAll(/§(\d+\.\d+)/g)].map((m) => m[1])));
    const clip = (t) => { const s = String(t).replace(/\s+/g, ' '); return s.length > 90 ? `${s.slice(0, 87)}...` : s; };
    const todo = [];
    (cfg.ownerRulings || []).forEach((o, i) => { if (!cites.has(`5.${i + 1}`)) todo.push({ id: `T-5.${i + 1}`, source: `§5.${i + 1}`, text: clip(o.ruling) }); });
    (cfg.openQuestions || []).forEach((q, i) => { if (!cites.has(`9.${i + 1}`)) todo.push({ id: `T-9.${i + 1}`, source: `§9.${i + 1}`, text: clip(q.q) }); });
    const j = (x) => JSON.stringify(x).replace(/--/g, '\\u002d-');   // no "--" inside an HTML comment
    const list = (name, xs, last) => [`"${name}": [`, ...xs.map((x, i) => ` ${j(x)}${i < xs.length - 1 ? ',' : ''}`), `]${last ? '' : ','}`];
    return ['<!-- rulings', `{"v": 1, "card": ${j(cfg.id)},`, `"skills": ${j(skills)},`,
        ...list('rulings', rulings), ...list('notOffered', notOffered), ...list('todo', todo, true), '}', '-->'];
}

/**
 * Render a card. Returns {text, meta, missingRules, coreBytes}. `signedLine` is kept as given.
 * Section 4 has two parts: (a) the CORE rules (groups with "core": true in card.json) quoted for the builder, at most
 * CORE_BYTES (card.json "coreBytes" may lower it); (b) every other rule that applies, as ids grouped under the heading
 * of the standard that defines them. Coverage counts the ids of both parts.
 */
export function renderCard(cfg, d, idx, { signedLine = UNSIGNED, cited = [] } = {}) {
    const limit = cfg.excerptChars || 240;
    const fullSet = new Set(cfg.fullRules || []);
    // section 4: the card's rules = the configured ones + the ids the template source cites
    const refs = [];
    const seen = new Set();
    const groups = [];
    const addGroup = (title, ids, chars = limit, full = false, core = false) => {
        const g = { title, refs: [], chars, full, core };
        for (const ref of ids) { if (seen.has(ref)) continue; seen.add(ref); refs.push(ref); g.refs.push(ref); }
        if (g.refs.length) groups.push(g);
    };
    // core groups first, so a rule named in a core group and again later is quoted, not listed
    const cfgGroups = (cfg.ruleGroups || []).map((g, i) => ({ g, i })).sort((x, y) => (!!y.g.core - !!x.g.core) || x.i - y.i).map((x) => x.g);
    for (const g of cfgGroups) addGroup(g.title, g.rules || [], g.chars || limit, !!g.full, !!g.core);
    // ids the template source cites: skipped when the card already names that id (bare or ID@SRC); an id defined in
    // two standards is taken from the first source in SOURCES order (the design standard before PROBLEM_TYPES)
    const onCardIds = new Set(refs.map(refId));
    const fromSource = [];
    for (const id of d.sourceRules || []) {
        if (onCardIds.has(id)) continue;
        const es = resolveRef(idx, id);
        fromSource.push(es.length > 1 ? es[0].key : id);
    }
    addGroup('Also cited in the template source', fromSource, cfg.sourceChars || limit);
    const missingRules = refs.filter((ref) => !resolveRef(idx, ref).length);
    const metaRules = {};
    for (const ref of refs) { const e = resolveRef(idx, ref); if (e.length) metaRules[ref] = refSha(e).slice(0, SHA_LEN); }
    const tplId = cfg.template ? cfg.template.id : null;
    const match = cardMatch(cfg);
    const meta = {
        card: cfg.id, kind: cfg.kind, template: tplId, families: cfg.families || [], match: { templates: match.templates },
        config: `${CARDS_REL}/${cfg.id}/card.json`, indexSha: idx.indexSha, bodySha: '',
        format: 2, configSha: configShaOf(cfg), cited, rules: metaRules, entries: signedEntriesOf(cfg),
    };
    const L = [];
    L.push('<!-- spec-card');
    const { rules: mr, cited: mc, entries: me, ...mh } = meta;
    L.push(JSON.stringify(mh).replace(/--/g, '- -'));
    L.push(JSON.stringify({ cited: mc.join(' '), rules: packRules(mr), entries: packEntries(me) }).replace(/--/g, '- -'));
    L.push('-->');
    L.push(...rulingsBlock(cfg, d));
    L.push(`# Spec card: ${cfg.title}`, '');
    L.push(`Generated by \`node tests/scripts/ws-spec-card.mjs --${cfg.kind} ${cfg.id}\` from \`${CARDS_REL}/${cfg.id}/card.json\` and the repo. Do not edit by hand: edit card.json and regenerate. Builders read this card; critics keep reading the full standards and RUBRIC.`, '');
    if (cfg.summary) L.push(cfg.summary, '');

    // 1
    L.push('## 1. What it teaches', '');
    if (cfg.teaches) L.push(cfg.teaches, '');
    const sk = cfg.skills || {};
    L.push(`**Skills on this ${cfg.kind === 'template' ? 'template' : 'family'}** (${d.skills.length}; ${sk.printFormats ? `\`design/SKILL_CATALOGUE.md\` print formats \`${sk.printFormats}\`` : 'listed in card.json'}${(sk.include || []).length ? ` + ${sk.include.length} listed` : ''}${(sk.excludeCategories || []).length ? `, without the mixed pools ${sk.excludeCategories.join(', ')}` : ''}):`, '');
    L.push(...compactSkills(d.skills), '');
    L.push(`**CCSS** (SKILL_STANDARDS of those skills): ${d.standards.ccss.join(', ') || '(none)'}`, '');
    L.push(`**Essential Elements:** ${d.standards.ee.join(', ') || '(none)'}`, '');
    L.push(`**WRM small steps** (SKILL_WRM): ${compactSteps(d.wrm) || '(none)'}`, '');

    // 2
    L.push('## 2. Problem types and progression', '');
    if (cfg.research) L.push(`*${cfg.research}*`, '');
    if ((cfg.problemTypes || []).length) { L.push('**Problem types**', ''); L.push(...bullets(cfg.problemTypes), ''); }
    if ((cfg.progression || []).length) { L.push('**Progression** (one new thing per step, P-1)', ''); cfg.progression.forEach((p, i) => L.push(`${i + 1}. ${p}`)); L.push(''); }
    if (d.buildEntries.length) {
        L.push('**Build-list entries on this template** (standards, ladder and full spec of each in `design/BUILD_LIST.md`)', '');
        for (const e of d.buildEntries) L.push(`- \`${e.id}\` (${e.kind}) ${e.name.replace(/\s*\(option\)$/, '')} — host \`${e.skill}\``);
        L.push('');
    }

    // 3
    L.push('## 3. The drawing', '');
    if (cfg.template) L.push(`Template \`${cfg.template.id}\` — \`${cfg.template.source}\`${cfg.template.also ? `; also ${cfg.template.also}` : ''}.`, '');
    if (cfg.drawing && cfg.drawing.sizes) L.push(`**Sizes S / M / L:** ${cfg.drawing.sizes}`, '');
    for (const n of (cfg.drawing && cfg.drawing.notes) || []) L.push(`- ${n}`);
    if (((cfg.drawing && cfg.drawing.notes) || []).length) L.push('');
    for (const c of d.capacity) {
        if (c.missing) { L.push(`**${c.label}** — NOT FOUND in \`${c.file}\` (the capacity table moved or was renamed).`, ''); continue; }
        L.push(`From \`${c.file}\`:`, '', ...c.lines, '');
    }

    // 4
    L.push('## 4. Rules that apply', '');
    L.push(`From the rule-id index (\`${INDEX_REL}\`, sha \`${idx.indexSha.slice(0, 12)}\`). An id written \`ID@SRC\` is defined in more than one standard.`, '');
    const core = groups.filter((g) => g.core);
    const rest = groups.filter((g) => !g.core);
    const coreLines = [];
    for (const g of core) {
        coreLines.push(`**${g.title}**`, '');
        for (const ref of g.refs) {
            const es = resolveRef(idx, ref);
            if (!es.length) { coreLines.push(`- **${ref}** — NOT IN THE INDEX (fix card.json)`); continue; }
            for (const e of es) {
                const full = g.full || fullSet.has(ref) || fullSet.has(e.key);
                coreLines.push(`- **${es.length > 1 ? e.key : ref}**${full ? ' ✱' : ''} (${e.src}) ${cardExcerpt(e, full, g.chars)}`);
            }
        }
        coreLines.push('');
    }
    const coreBytes = Buffer.byteLength(coreLines.join('\n'));
    const nCore = core.reduce((n, g) => n + g.refs.length, 0);
    L.push(`### 4a. Core rules — apply every one (${nCore} rules; ✱ = quoted in full, the rest cut at a sentence)`, '');
    L.push(...coreLines);
    const listed = new Map();
    let nRest = 0;
    for (const g of rest) {
        for (const ref of g.refs) {
            const es = resolveRef(idx, ref);
            nRest++;
            if (!es.length) { const k = 'NOT IN THE INDEX (fix card.json)'; if (!listed.has(k)) listed.set(k, []); listed.get(k).push(ref); continue; }
            for (const e of es) {
                const k = `${e.src} · ${shortHeading(e.heading)}`;
                if (!listed.has(k)) listed.set(k, []);
                const shown = es.length > 1 ? e.key : ref;
                if (!listed.get(k).includes(shown)) listed.get(k).push(shown);
            }
        }
    }
    L.push(`### 4b. Also applies — ids only (${nRest} rules)`, '');
    L.push(`Each id's full text is in \`${INDEX_REL}\` (look it up by id) and in the standard it names; open it when the rule is in play. Grouped by the heading that defines them:`, '');
    if (!listed.size) L.push('- (none)');
    const srcOrder = (k) => { const i = SOURCES.findIndex((x) => k.startsWith(`${x.key} · `)); return i < 0 ? SOURCES.length : i; };
    const secNum = (k) => (/· (\d+(?:\.\d+)*)/.exec(k) || [, '999'])[1];
    const sorted = [...listed].sort((a, b) => srcOrder(a[0]) - srcOrder(b[0]) || idCompare(secNum(a[0]), secNum(b[0])) || (a[0] < b[0] ? -1 : 1));
    for (const [k, ids] of sorted) L.push(`- ${k} — ${ids.sort(idCompare).map((x) => `\`${x}\``).join(' ')}`);
    L.push('');

    // 5
    L.push('## 5. Owner rulings', '');
    L.push(...bullets(cfg.ownerRulings || [], (r) => `**${r.date}** — ${r.ruling}${r.source ? ` (\`${r.source}\`)` : ''}`), '');

    // 6
    L.push('## 6. Misconceptions', '');
    L.push('For answer keys, `wrongAnswer`, error analysis, True or False? and Reason It (P-TH-13).', '');
    L.push(...bullets(cfg.misconceptions || [], (m) => (typeof m === 'string' ? m : `**${m.id}** ${m.error}${m.wrong ? ` — e.g. ${m.wrong}` : ''}`)));
    const fams = new Set(cfg.families || []);
    const blm = [...new Set(d.buildEntries.filter((e) => fams.has(String(e.skill).split(':')[0])).flatMap((e) => e.misconceptions))];
    if (blm.length) L.push(`- From the build list (entries hosted on ${[...fams].join(' / ')}): ${blm.join('; ')}`);
    L.push('');

    // 7: what the card itself declares, asks for and DECIDES is signed; the live listing goes to §7b below the Signed line
    L.push('## 7. Options and presets', '');
    for (const n of cfg.options || []) L.push(`- ${n}`);
    if ((cfg.options || []).length) L.push('');
    L.push(INFO_POINTER, '');
    L.push(...decisionsSection(cfg));

    // 8
    L.push('## 8. Gates', '');
    const PRE = 'node tests/scripts/';
    if (d.gates.some((g) => g.cmd.startsWith(PRE))) L.push(`Each runs as \`${PRE}<script> …\`.`, '');
    for (const g of d.gates) L.push(`- \`${g.cmd.startsWith(PRE) ? g.cmd.slice(PRE.length) : g.cmd}\`${g.exists ? '' : ' — PLANNED (not in the repo yet)'}${g.note ? ` — ${g.note}` : ''}`);
    L.push('');

    // 9
    L.push('## 9. Open questions (recommended answers)', '');
    (cfg.openQuestions || []).forEach((q, i) => L.push(`${i + 1}. **${q.q}** Recommended: ${q.recommended}`));
    if (!(cfg.openQuestions || []).length) L.push('(none)');
    L.push('');
    L.push(signedLine);
    L.push('');
    // 7b: informational, after the Signed line, between fences (not signed, not hashed, not compared)
    L.push(INFO_OPEN);
    L.push('## 7b. What the repo offers today (informational, not signed)', '');
    L.push('Listed from the repo at generation. The decisions are signed in §7a; `--check-signed` re-derives this listing from the repo and FAILS on any line without a decision (`[UNDECIDED]`). Not part of the signed card.', '');
    L.push(...surfaceListing(cfg, d));
    for (const p of (d.surface && d.surface.problems) || []) L.push(`NOT READ: ${p}`, '');
    if (d.options.length) {
        L.push(`**Options declared today** (\`js/modules/skill-options.js\`; id, label, values, skills that declare it):`, '');
        for (const o of d.options) L.push(`- \`${o.id}\` ${o.label}: ${o.values.length ? o.values.join(' / ') : 'free'} (${o.skills})`);
        L.push('');
    }
    L.push(`**Preset skills on these hosts** (\`js/modules/skill-presets.js\`): ${d.presets.length ? d.presets.map((p) => `\`${p.key}\` → \`${p.host}\` ${JSON.stringify(p.opts)}`).join('; ') : '(none)'}`);
    L.push(INFO_CLOSE);
    L.push('');
    let text = L.join('\n');
    meta.bodySha = bodyShaOf(text);
    text = text.replace('"bodySha":""', `"bodySha":"${meta.bodySha}"`);
    return { text, meta, missingRules, coreBytes };
}

/** Parse a card file: its machine block, its skills (section 1), its section-4 rule refs and its Signed line. */
export function readCard(fullText) {
    const text = splitCard(fullText).signedPart;
    const m = /^<!-- spec-card\n([\s\S]*?)\n-->/.exec(text);
    if (!m) return null;
    const raw = m[1].replace(/- -/g, '--');
    let meta;
    try { meta = JSON.parse(raw); } catch {   // the current form: a header line, then the cited ids and the rule shas
        const parts = raw.split('\n');
        try { meta = { ...JSON.parse(parts[0]), ...JSON.parse(parts.slice(1).join('\n')) }; } catch { return null; }
    }
    meta.rules = unpackRules(meta.rules);
    meta.entries = meta.entries === undefined ? null : unpackEntries(meta.entries);
    if (typeof meta.cited === 'string') meta.cited = meta.cited.split(/\s+/).filter(Boolean);
    meta.cited = meta.cited || meta.citedAtGeneration || [];
    const lines = text.split('\n');
    const signed = [...lines].reverse().find((l) => /^Signed: /.test(l)) || '';
    const s4 = /## 4\. Rules that apply\n([\s\S]*?)\n## 5\./.exec(text);
    const onCard = new Set();
    if (s4) {
        for (const mm of s4[1].matchAll(/^- \*\*([^*\s]+)\*\*/gm)) onCard.add(mm[1]);
        const b4 = /### 4b\.[^\n]*\n([\s\S]*)$/.exec(s4[1]);
        if (b4) for (const ln of b4[1].split('\n')) {
            if (!/^- /.test(ln) || ln.lastIndexOf(' — ') < 0) continue;
            for (const t of ln.slice(ln.lastIndexOf(' — ') + 3).matchAll(/`([^`\s]+)`/g)) onCard.add(t[1]);
        }
    }
    const skills = [];
    const s1 = /## 1\. What it teaches\n([\s\S]*?)\n## 2\./.exec(text);
    if (s1) for (const mm of s1[1].matchAll(/^- \*\*([a-z0-9_]+)\*\* \(\d+\): (.*)$/gm)) for (const t of mm[2].matchAll(/`([a-z0-9_{},]+)`/g)) for (const x of expandBraces(t[1])) skills.push(`${mm[1]}:${x}`);
    const sm = SIGNED_RE.exec(signed);
    return { meta, signed, isSigned: !!sm, signedDate: sm ? sm[1] : null, onCard: [...onCard], skills };
}

/** Compare two cards' SIGNED parts ignoring the Signed line, the index sha (it moves when any rule anywhere changes), the
 *  body sha and the ids cited at generation (a record of the tally, not card content). The machine rulings block IS
 *  compared (W0-A critic r7 D2: a ruling weakened or a notOffered entry emptied under a signature voids it). */
function cardBody(text) {
    return splitCard(text).signedPart.split('\n').filter((l) => !/^Signed: /.test(l)).join('\n')
        .replace(/"indexSha":"[0-9a-f]+"/, '"indexSha":""').replace(/"bodySha":"[0-9a-f]*"/, '"bodySha":""')
        .replace(/"cited":"[^"]*"/, '"cited":""').replace(/sha `[0-9a-f]{12}`/, 'sha ``');
}
/** The card without its rulings block (spliceRulings: nothing but the block may change). */
const stripRulings = (text) => cardBody(text).replace(/^<!-- rulings\n[\s\S]*?\n-->\n/m, '');

/**
 * cardBody with the REPO-DERIVED listings a correct build changes masked out (README "What a build may change"):
 * §1 the skill list and its CCSS / EE / WRM tags (checked separately: nothing signed may disappear), the rulings block's
 * derived "skills" line (the same list), §2 the build-list lines (a built entry is deleted from the build list), §7 the
 * format-1 live options / presets listing (now §7b), §8 the PLANNED marker of a gate whose script has landed, and the
 * machine-block fields format 2 added. Everything else — card.json content, rules and excerpts, rulings and notOffered,
 * misconceptions, the options and decisions the card itself declares, gates, open questions — is compared byte for
 * byte, and configSha catches any card.json change in a format-2 card.
 */
function comparableBody(text) {
    const sec = (t, n, fn) => t.replace(new RegExp(`(\\n## ${n}\\. [^\\n]*\\n)([\\s\\S]*?)(?=\\n## \\d\\. )`), (m, h, b) => h + fn(b));
    let t = cardBody(text).replace(/,"format":2,"configSha":"[0-9a-f]*"/, '').replace(/,"entries":"[^"]*"/, '')
        .replace(/^("skills": )\[[^\n]*\],$/m, '$1#,');
    t = sec(t, 1, (b) => b.replace(/^(\*\*Skills on this (?:template|family)\*\* \()\d+;/m, '$1#;')
        .split('\n').filter((l) => !/^- \*\*[a-z0-9_]+\*\* \(\d+\): /.test(l)).join('\n')
        .replace(/^(\*\*CCSS\*\* \(SKILL_STANDARDS of those skills\):).*$/m, '$1 #')
        .replace(/^(\*\*Essential Elements:\*\*).*$/m, '$1 #')
        .replace(/^(\*\*WRM small steps\*\* \(SKILL_WRM\):).*$/m, '$1 #'));
    t = sec(t, 2, (b) => b.replace(/^\*\*Build-list entries[^\n]*\n\n(?:- `[^\n]*\n)*\n?/m, ''));
    t = sec(t, 7, (b) => b.replace(/^\*\*Options declared today\*\*[^\n]*\n\n(?:- `[^\n]*\n)*\n?/m, '')
        .replace(/^\*\*Preset skills on these hosts\*\*[^\n]*\n\n?/m, '').split(`${INFO_POINTER}\n\n`).join('').split(`${INFO_POINTER}\n`).join('').replace(/^\n+$/, ''));
    return t.replace(/ — PLANNED \(not in the repo yet\)/g, '');
}
/** The signed §1 tags of a card: {ccss, ee, wrm}, parsed back from its lines. */
function signedTags(text) {
    const s1 = (/## 1\. What it teaches\n([\s\S]*?)\n## 2\./.exec(splitCard(text).signedPart) || [, ''])[1];
    const list = (re) => { const m = re.exec(s1); return m && m[1].trim() !== '(none)' ? m[1].split(/,\s*/).map((x) => x.trim()).filter(Boolean) : []; };
    const wrm = [];
    const wl = (/^\*\*WRM small steps\*\* \(SKILL_WRM\): (.*)$/m.exec(s1) || [, ''])[1];
    if (wl.trim() !== '(none)') for (const g of wl.split(/;\s*/).filter(Boolean)) { const m = /^(Y\d+\.B\d+) (.*)$/.exec(g); for (const x of (m ? m[2] : g).split(/,\s*/)) wrm.push(m ? `${m[1]}.${x}` : x); }
    return { ccss: list(/^\*\*CCSS\*\* \(SKILL_STANDARDS of those skills\): (.*)$/m), ee: list(/^\*\*Essential Elements:\*\* (.*)$/m), wrm };
}
/** The build-list ids a card's §2 lists. */
function signedBuildIds(text) {
    const s2 = (/## 2\. Problem types and progression\n([\s\S]*?)\n## 3\./.exec(splitCard(text).signedPart) || [, ''])[1];
    const b = (/\*\*Build-list entries[^\n]*\n\n((?:- `[^\n]*\n?)*)/.exec(s2) || [, ''])[1];
    return [...b.matchAll(/^- `([^`]+)`/gm)].map((m) => m[1]);
}

/** Section byte sizes of a card: machine block, header, sections 1-9 (4 split into 4a / 4b). */
export function sectionSizes(text) {
    const out = [];
    const end = text.indexOf('\n-->') + 4;
    out.push(['machine block', Buffer.byteLength(text.slice(0, end + 1))]);
    const rest = text.slice(end + 1);
    for (const part of rest.split(/\n(?=## \d\. |## 7b\. |### 4[ab]\. |### 7a\. )/)) {
        const h = /^(## (\d|7b)\.|### (4[ab]|7a)\.)/.exec(part);
        out.push([h ? (h[2] ? `§${h[2]}` : `§${h[3]}`) : 'title', Buffer.byteLength(part) + 1]);
    }
    out.push(['total', Buffer.byteLength(text)]);
    return out;
}

/**
 * Build a card's text in memory from its card.json and the repo, the way --template / --family would write it
 * (unsigned). Returns {ok, msg} or {ok: true, cfg, text, coreBytes, paths}.
 */
async function buildCard(root, id, kind, { sources = SOURCES, derive = deriveFromRepo, findingsPath = null } = {}) {
    const p = cardPaths(root, id);
    if (!fs.existsSync(p.cfg)) return { ok: false, msg: `no config ${rel(root, p.cfg)}` };
    const cfg = JSON.parse(fs.readFileSync(p.cfg, 'utf8'));
    if (cfg.id !== id) return { ok: false, msg: `card.json id "${cfg.id}" does not match "${id}"` };
    if (cfg.kind !== kind) return { ok: false, msg: `card.json kind is "${cfg.kind}", not "${kind}" (use --${cfg.kind})` };
    const idx = currentIndex(root, sources);
    const d = await derive(root, cfg, idx);
    const f = readFindings(root, findingsPath);
    const cited = f.rows ? citedIds(findingsFor(f.rows, { ...cardMatch(cfg), skills: d.skills })) : [];
    const r = renderCard(cfg, d, idx, { signedLine: UNSIGNED, cited });
    if (r.missingRules.length) return { ok: false, msg: `card.json names rules not in the index: ${r.missingRules.join(', ')}` };
    const cap = cfg.coreBytes || CORE_BYTES;
    if (r.coreBytes > cap) return { ok: false, msg: `section 4a (core rules) is ${r.coreBytes} bytes, over its ${cap}-byte cap: move rules out of the "core" groups of card.json (they stay on the card as ids in 4b), or lower their "chars"` };
    return { ok: true, cfg, d, idx, cited, text: r.text, coreBytes: r.coreBytes, paths: p };
}
const withSigned = (text, line) => text.replace(new RegExp(`^${UNSIGNED.replace(/[()]/g, '\\$&')}$`, 'm'), line);

/**
 * Generate (or regenerate) one card. Returns {ok, msg, path}.
 * A signed card whose content would change is refused unless resign; then it is written unsigned.
 */
export async function generateCard(root, id, kind, { resign = false, rulingsOnly = false, ...opts } = {}) {
    const b = await buildCard(root, id, kind, opts);
    if (!b.ok) return b;
    const p = b.paths;
    const old = fs.existsSync(p.md) ? fs.readFileSync(p.md, 'utf8') : null;
    if (rulingsOnly) return spliceRulings(root, p.md, old, b.text, { resign });
    const oldCard = old ? readCard(old) : null;
    const wasSigned = !!(oldCard && oldCard.isSigned);
    let text = b.text;
    let note = '';
    const keepSigned = wasSigned && cardBody(old) !== cardBody(text) && !resign && comparableBody(old) === comparableBody(text)
        && (!oldCard.meta.configSha || oldCard.meta.configSha === configShaOf(b.cfg)) && !infoProblems(old).length;
    if (keepSigned) {
        // only repo-derived listings moved (a build tagged a skill, deleted a built entry, added options): the signed
        // part stays byte for byte as the owner signed it; only the informational block is refreshed
        text = `${splitCard(old).signedPart}\n${splitCard(text).info}`;
        note = ` — still signed (${oldCard.signed.replace(/^Signed: /, '')}); the signed part is kept as signed, only the informational §7b was refreshed (run --check-signed for the repo changes since signing)`;
    } else if (wasSigned && cardBody(old) !== cardBody(text)) {
        if (!resign) return { ok: false, msg: `${rel(root, p.md)} is SIGNED (${oldCard.signed}) and its content would change; nothing written. Re-run with --resign to reset it to unsigned for the owner to sign again.` };
        note = ' — the signature was RESET (--resign): the owner must sign it again';
    } else if (wasSigned) {
        text = withSigned(text, oldCard.signed);
        note = ` — still signed (${oldCard.signed.replace(/^Signed: /, '')}); content unchanged`;
    }
    fs.mkdirSync(p.dir, { recursive: true });
    if (old !== text) fs.writeFileSync(p.md, text);
    const sizes = sectionSizes(text).map(([k, v]) => `${k} ${v}`).join(', ');
    return { ok: true, path: p.md, msg: `${old === text ? 'unchanged' : 'wrote'} ${rel(root, p.md)} (${Buffer.byteLength(text)} bytes, ${Object.keys(readCard(text).meta.rules).length} rule refs; bytes: ${sizes})${note}` };
}

/**
 * --rulings-only: write ONLY the machine rulings block into an existing card (added after the spec-card comment, or
 * replacing the old block), leave every other byte as it is, and refresh bodySha. The block is SIGNED content (W0-A
 * critic r7 D2: refreshing bodySha over a changed block let a signed card's rulings be weakened unnoticed): on a SIGNED
 * card whose block would change, nothing is written unless --resign is given, and then the Signed line is reset.
 * (configSha still records the card.json of the last full generation, so --check-signed also asks for a full
 * regeneration before a new signature.)
 */
function spliceRulings(root, mdPath, old, fresh, { resign = false } = {}) {
    if (old == null) return { ok: false, msg: `${rel(root, mdPath)} does not exist: generate it first (without --rulings-only)` };
    const BLK = /^<!-- rulings\n[\s\S]*?\n-->\n/m;
    const blk = BLK.exec(fresh)[0];
    let text = BLK.test(old) ? old.replace(BLK, blk) : old.replace(/^(<!-- spec-card\n[\s\S]*?\n-->\n)/, `$1${blk}`);
    if (text === old && !BLK.test(old)) return { ok: false, msg: `${rel(root, mdPath)}: no spec-card comment to put the block after` };
    const oc = readCard(old);
    let note = '';
    if (text !== old && oc && oc.isSigned) {
        if (!resign) return { ok: false, msg: `${rel(root, mdPath)} is SIGNED (${oc.signed}) and its rulings block would change: the rulings and notOffered entries are signed content; nothing written. Re-run with --resign (the card becomes unsigned for the owner to sign again).` };
        text = text.replace(new RegExp(`^${oc.signed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'm'), UNSIGNED);
        note = ' — the signature was RESET (--resign): the owner must sign it again';
    }
    text = text.replace(/"bodySha":"[0-9a-f]*"/, `"bodySha":"${bodyShaOf(text)}"`);
    if (stripRulings(text) !== stripRulings(old)) return { ok: false, msg: `${rel(root, mdPath)}: splicing the block would change other content; nothing written` };
    if (old !== text) fs.writeFileSync(mdPath, text);
    const c = readCard(text);
    return { ok: true, path: mdPath, msg: `${old === text ? 'unchanged' : 'wrote the rulings block into'} ${rel(root, mdPath)}; the rest of the card is byte-identical${c && c.isSigned ? ` and still signed (${c.signed.replace(/^Signed: /, '')})` : ''}${note}` };
}

/* ================================================================ checks */

/** What a card's findings are matched on: its templates, its families, and its own skills (section 1). */
function coverageMatch(card) {
    const m = card.meta.match || {};
    return { templates: m.templates || [card.meta.template].filter(Boolean), families: [...new Set([...(m.families || []), ...(card.meta.families || [])])], skills: card.skills || [] };
}

/** The card-coverage test for one card file. Returns {ok, lines}. */
export function checkCoverage(root, cardFile, { sources = SOURCES, findingsPath = null, requireFindings = false } = {}) {
    const lines = [];
    const text = fs.readFileSync(cardFile, 'utf8');
    const card = readCard(text);
    if (!card) return { ok: false, lines: [`${rel(root, cardFile)}: no spec-card block`] };
    const idx = currentIndex(root, sources);
    let ok = true;
    const name = rel(root, cardFile);
    // (2) every rule on the card still exists and says what it said at generation
    for (const [ref, sha] of Object.entries(card.meta.rules)) {
        const es = resolveRef(idx, ref);
        if (!es.length) { ok = false; lines.push(`FAIL ${name}: rule ${ref} is no longer in the rule index`); continue; }
        if (refSha(es).slice(0, SHA_LEN) !== sha) { ok = false; lines.push(`FAIL ${name}: rule ${ref} changed since the card was generated (${es.map((e) => `${e.file}:${e.line}`).join(', ')}) — regenerate with --resign and have the owner sign again`); }
    }
    // (1) every id a critic cited for this template / family is on the card
    const f = readFindings(root, findingsPath);
    if (!f.rows) {
        if (requireFindings) { ok = false; lines.push(`FAIL ${name}: no findings file ${f.file}`); } else lines.push(`WARN ${name}: no findings file ${f.file} yet — the report check was skipped (the rule-change check ran)`);
    } else {
        const match = coverageMatch(card);
        const rows = findingsFor(f.rows, match);
        const cited = citedIds(rows);
        const known = new Set(idx.rules.map((r) => r.id));
        const keys = new Set(idx.rules.map((r) => r.key));
        const onCardIds = new Set(card.onCard.map(refId));
        const missing = [], unknown = [], external = [];
        for (const id of cited) {
            if (!known.has(refId(id)) && !keys.has(id)) { (externalOf(id) ? external : unknown).push(id); continue; }
            if (!onCardIds.has(refId(id)) && !card.onCard.includes(id)) missing.push(id);
        }
        if (missing.length) {
            ok = false;
            for (const id of missing) {
                const where = rows.filter((r) => splitList(String(r.rule_ids).replace(/,/g, ';')).includes(id)).map((r) => `${r.report}${r.defect_id ? `#${r.defect_id}` : ''}`);
                lines.push(`FAIL ${name}: ${id} was cited by a critic (${[...new Set(where)].slice(0, 4).join(', ')}) but is not in section 4`);
            }
        }
        if (unknown.length) lines.push(`WARN ${name}: unknown ids cited in ${f.file} (not in the rule index — typos?): ${unknown.map((id) => (KNOWN_TYPOS[id] ? `${id} (known: ${KNOWN_TYPOS[id]})` : id)).join(', ')}`);
        if (external.length) lines.push(`NOTE ${name}: ids defined outside the indexed standards (not demanded on the card): ${external.map((id) => `${id} — ${externalOf(id)}`).join('; ')}`);
        const since = cited.filter((id) => !(card.meta.cited || []).includes(id));
        if (since.length) lines.push(`NOTE ${name}: ids cited since the card was generated: ${since.join(', ')}`);
        const fams = [...new Set([...match.families, ...match.skills.map((k) => k.split(':')[0])])];
        lines.push(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${rows.length} findings for template ${match.templates.join('/') || '—'}, families ${fams.join('/')} or ${match.skills.length} card skills named in run/summary; ${cited.length} distinct ids cited, ${missing.length} missing from the card, ${Object.keys(card.meta.rules).length} card rules checked against the index`);
    }
    if (!f.rows) lines.push(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${Object.keys(card.meta.rules).length} card rules checked against the index`);
    return { ok, lines };
}

/** The cards whose skills (section 1, or the rulings block) include any of `keys` (cat:skill; a bare id matches too). */
export function cardsCovering(root, keys) {
    const want = (k) => keys.some((x) => x === k || (!x.includes(':') && k.endsWith(`:${x}`)));
    return allCards(root).filter((f) => {
        const text = fs.readFileSync(f, 'utf8');
        const c = readCard(text);
        const blk = /<!-- rulings\n([\s\S]*?)\n-->/.exec(splitCard(text).signedPart);
        let bs = [];
        try { bs = blk ? JSON.parse(blk[1].replace(/\\u002d/g, '-')).skills || [] : []; } catch { bs = []; }
        return [...(c ? c.skills : []), ...bs].some(want);
    });
}
function allCards(root) {
    const dir = path.join(root, CARDS_REL);
    if (!fs.existsSync(dir)) return [];
    const out = [];
    for (const e of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => (a.name < b.name ? -1 : 1))) {
        if (!e.isDirectory()) continue;
        const md = path.join(dir, e.name, `${e.name}.md`);
        if (fs.existsSync(md)) out.push(md);
    }
    return out;
}

/**
 * The build-start gate. A card passes only when ALL of these hold:
 *   (a) its last Signed line is `Signed: owner, YYYY-MM-DD`, a real calendar date, not after today;
 *   (b) its body (everything but the Signed line) is what the tool generated: the bodySha in the machine block matches;
 *   (c) the card-coverage test passes against the CURRENT rule index (a rule on the card changed or deleted since it
 *       was generated fails, by id; a rule a critic cited for the card's skills that is missing from section 4 fails);
 *   (d) card.json and the repo still generate the same card (a config change after signing fails).
 * Returns {ok, lines, msg}.
 */
export async function checkSigned(root, cardFile, { today = localToday(), sources = SOURCES, derive = deriveFromRepo, findingsPath = null, requireFindings = false } = {}) {
    const name = rel(root, cardFile);
    const FIX = (id, kind) => `fix: edit design/cards/${id}/card.json if needed, run \`node tests/scripts/ws-spec-card.mjs --${kind} ${id} --resign\`, and have the owner sign the new card`;
    if (!fs.existsSync(cardFile)) return { ok: false, lines: [], msg: `${name}: no such card` };
    const text = fs.readFileSync(cardFile, 'utf8');
    const card = readCard(text);
    if (!card) return { ok: false, lines: [], msg: `${name}: no spec-card block (not a generated card)` };
    const id = card.meta.card, kind = card.meta.kind;
    const lines = [];
    const fail = (why, fix) => lines.push(`FAIL ${name}: ${why}${fix ? ` — ${fix}` : ''}`);
    // (a)
    if (!card.signed) fail('no Signed line — the build may not start', 'the owner answers section 9 and replaces the Signed line (above the informational §7b) with `Signed: owner, YYYY-MM-DD`');
    else if (!card.isSigned) fail(`not signed (${card.signed}) — the build may not start`, 'the owner answers section 9 and replaces the Signed line (above the informational §7b) with `Signed: owner, YYYY-MM-DD`');
    else if (!validDate(card.signedDate)) fail(`"${card.signed}": ${card.signedDate} is not a real calendar date`, 'the owner writes the real date');
    else if (card.signedDate > today) fail(`"${card.signed}": ${card.signedDate} is in the future (today is ${today})`, 'the owner writes the date of signing');
    const unsigned = !card.isSigned;
    // (b) the informational block may not hide signed content or carry rules
    for (const why of infoProblems(text)) fail(why, FIX(id, kind));
    if (!card.meta.bodySha) fail('the machine block has no bodySha (generated by an older tool)', FIX(id, kind));
    else if (bodyShaOf(text) !== card.meta.bodySha) fail('the card was edited by hand after generation (its body no longer matches the bodySha in the machine block)', FIX(id, kind));
    // (c)
    const cov = checkCoverage(root, cardFile, { sources, findingsPath, requireFindings });
    for (const l of cov.lines) if (/^FAIL /.test(l)) lines.push(`${l}${/--resign/.test(l) ? '' : ` — ${FIX(id, kind)}`}`);
    // (d) the signed content is still what card.json and the repo generate; the repo-derived listings a correct build
    // changes are masked (comparableBody) and reported as NOTE lines, except that nothing signed may disappear
    const b = await buildCard(root, id, kind, { sources, derive, findingsPath });
    const notes = [];
    if (!b.ok) fail(`card.json no longer generates a card: ${b.msg}`, FIX(id, kind));
    else {
        if (card.meta.configSha && card.meta.configSha !== configShaOf(b.cfg)) fail('card.json changed after the card was generated (configSha)', FIX(id, kind));
        // the signed rulings / notOffered / decision entries, one by one (W0-A r7 D2: a weakened ruling is named)
        if (card.meta.entries) {
            const now = signedEntriesOf(b.cfg), was = card.meta.entries;
            const changed = Object.keys(was).filter((k) => k in now && now[k] !== was[k]);
            const gone = Object.keys(was).filter((k) => !(k in now));
            const added = Object.keys(now).filter((k) => !(k in was));
            if (changed.length) fail(`signed rulings / notOffered / decisions CHANGED in card.json since signing (a weakened ruling voids the signature): ${changed.join(', ')}`, FIX(id, kind));
            if (gone.length) fail(`signed rulings / notOffered / decisions REMOVED from card.json since signing: ${gone.join(', ')}`, FIX(id, kind));
            if (added.length) fail(`rulings / notOffered / decisions ADDED to card.json since signing (not signed yet): ${added.join(', ')}`, FIX(id, kind));
        } else if (!card.meta.entries && card.meta.format === 2) fail('the machine block has no signed-entry list (entries)', FIX(id, kind));
        if (comparableBody(b.text) !== comparableBody(text)) {
            const a1 = comparableBody(text).split('\n'), b1 = comparableBody(b.text).split('\n');
            let k = 0; while (k < a1.length && a1[k] === b1[k]) k++;
            fail(`card.json or the repo now generates a different card (first difference at line ${k + 1} of the compared body: "${(b1[k] || '(end)').slice(0, 80)}")`, FIX(id, kind));
        }
        const live = b.d, tags = signedTags(text);
        const diff = (label, signed, now, removalFails) => {
            const gone = signed.filter((x) => !now.includes(x)), added = now.filter((x) => !signed.includes(x));
            if (gone.length && removalFails) fail(`${label} signed on the card no longer in the repo: ${gone.join(', ')}`, FIX(id, kind));
            else if (gone.length) notes.push(`${label} gone since signing: ${gone.join(', ')}`);
            if (added.length) notes.push(`${label} added since signing (not signed; listed for the next re-sign): ${added.join(', ')}`);
        };
        diff('§1 skills', card.skills, live.skills, true);
        diff('§1 CCSS', tags.ccss, live.standards.ccss, true);
        diff('§1 EE', tags.ee, live.standards.ee, true);
        diff('§1 WRM steps', tags.wrm, live.wrm, true);
        diff('§2 build-list entries (a built entry is deleted from the build list)', signedBuildIds(text), live.buildEntries.map((e) => e.id), false);
        const planned = (t) => [...splitCard(t).signedPart.matchAll(/^- `([^`]+)`[^\n]* — PLANNED \(not in the repo yet\)/gm)].map((m) => m[1]);
        diff('§8 gates PLANNED', planned(text), planned(b.text), false);
        if (splitCard(text).format === 1 && /\*\*Options declared today\*\*|\*\*Preset skills on these hosts\*\*/.test(text)) notes.push('format-1 card: its §7 live options / presets listing is not compared (it moved to the informational §7b); regenerate to refresh it without touching the signature');
        // (e) hosts, roles and options: every line the repo offers today has a decision (W0-B2)
        const dec = checkDecisions(b.cfg, live);
        for (const f of dec.fails) fail(f, `decide it in design/cards/${id}/card.json "decisions" (offered / hidden / out of scope), run \`node tests/scripts/ws-spec-card.mjs --${kind} ${id} --resign\`, and have the owner sign`);
        notes.push(...dec.notes);
    }
    for (const n of notes) lines.push(`NOTE ${name}: ${n}`);
    const fails = lines.filter((l) => /^FAIL /.test(l));
    const ok = !fails.length;
    // only the signature is missing: the lane may run (precritic reports it INCOMPLETE), the build may not be accepted
    const onlyUnsigned = unsigned && fails.length === 1;
    return { ok, onlyUnsigned, unsigned, lines, msg: ok ? `${name}: ${card.signed}; body as generated; coverage green against the current rule index; card.json generates the same signed content; every host, role and option value decided${notes.length ? ` (${notes.length} note(s), not failures)` : ''} — the build may start` : onlyUnsigned ? `${name}: needs owner signature (everything else green) — the build may not start` : `${name}: ${fails.length} problem(s) — the build may not start` };
}

/** (e): {fails, notes} — every live line decided on every skill; proposed decisions and stale decisions noted. */
export function checkDecisions(cfg, d) {
    const fails = [], notes = [];
    for (const p of decisionProblems(cfg)) fails.push(p);
    for (const p of (d.surface && d.surface.problems) || []) fails.push(`the repo listing (§7b) could not be read: ${p}`);
    const lines = decideSurface(cfg, d.surface || {});
    const undKeys = [...new Set(lines.filter((x) => Object.values(x.by).some((v) => !v)).map((x) => x.key))];
    if (undKeys.length) fails.push(`${undKeys.length} host / role / option line(s) the repo offers have no decision (UNDECIDED: a new option, value, role or host, or never decided): ${undKeys.slice(0, 40).join(', ')}${undKeys.length > 40 ? ` … ${undKeys.length - 40} more` : ''}`);
    const proposed = [...new Set(lines.flatMap((x) => Object.values(x.by).filter((v) => v && v.proposed).map(() => x.key)))];
    if (proposed.length) notes.push(`${proposed.length} live line(s) carry a PROPOSED decision (pre-filled for the lead; signing the card accepts them): ${proposed.join(', ')}`);
    const liveKeys = new Set(lines.map((x) => x.key));
    const stale = [...new Set(expandDecisions(cfg).filter((e) => !liveKeys.has(e.key)).map((e) => `${e.key} (${e.d})`))];
    if (stale.length) notes.push(`${stale.length} decided line(s) the repo does not offer today (a hidden one the build removed, or one still to build): ${stale.join(', ')}`);
    const n = lines.length;
    if (n) notes.push(`decisions: ${n} live line(s) — ${['offered', 'hidden', 'out of scope'].map((k) => `${lines.filter((x) => Object.values(x.by).every((v) => v && v.d === k)).length} ${k}`).join(', ')}, ${lines.filter((x) => new Set(Object.values(x.by).map((v) => (v ? v.d : '?'))).size > 1).length} mixed by skill, ${undKeys.length} undecided; ${proposed.length} PROPOSED`);
    return { fails, notes };
}

/* ================================================================ self-test */

async function selfTest() {
    const results = [];
    const t = (name, cond) => { results.push({ name, ok: !!cond }); };
    {   // the rulings block: authored entries copied, uncited prose rulings listed as todo, valid JSON in an HTML comment
        const rb = rulingsBlock({ id: 'x', ownerRulings: [{ ruling: 'a' }, { ruling: 'b --c' }], openQuestions: [{ q: 'q1' }, { q: 'q2' }],
            rulings: { rulings: [{ id: 'R1', source: '§9.2; §5.1', skills: ['p:z'], assert: 'range', of: 'a', min: 1, max: 9 }], notOffered: [{ id: 'N1', source: '§7', option: 'band' }] } },
            { skills: ['p:y'] }).join('\n');
        const j = JSON.parse(/^<!-- rulings\n([\s\S]*?)-->$/.exec(rb)[1]);
        t('rulings block: skills = derived + named, entries copied', j.skills.join() === 'p:y,p:z' && j.rulings[0].id === 'R1' && j.notOffered[0].option === 'band');
        t('rulings block: uncited prose rulings (§5.2, §9.1) become todo; no "--" in the comment', j.todo.map((x) => x.source).join() === '§5.2,§9.1' && !/--/.test(rb.slice(4, -3)));
    }
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-spec-card-'));
    try {
        const SRC = [{ key: 'STD', file: 'std.md' }, { key: 'RUB', file: 'rub.md' }];
        const std = [
            '# Mini standard', '', '## 1. Stacks', '',
            '- **VA-1** Track count: T = d + 1.',
            '  The operator track is extra.',
            '- **VA-2** **Operator track**: the leftmost track.', '',
            '**P-6 The format never changes.** Same cell anatomy.', '*Test:* template ids match.', '',
            '| Id | Rule |', '|---|---|', '| P-PR-1 | One idea at a time. |', '',
            '#### L-1 One-digit addition', 'Steps one to three.', '',
            '## 17. Appendix', '| VA-1 | lint L-TRACK |', '',
            '```', '- **XX-9** inside a fence, not a rule', '```', '',
            '- **RP-3** Minimum sizes.', '- **RP-03** Look-alike id.', '- **A4** paper, not a rule.', '',
            '**P-31 Options, not policy.** Defaults:', '', '| Option | Default |', '|---|---|', '| Hints on tests | off |', '',
            '- **BD-11** Verbs:', '- Write', '- Circle', '- **BD-12** Never tap.',
        ].join('\n');
        const rub = ['# Rubric', '', '| Id | Condition | Cap |', '|---|---|---|', '| H1 | Key wrong | C2 ≤ 3 |', '| H5 | Page wasted | C3 ≤ 5 |', '', '### C1 · Ease of use', 'Can the pupil do it alone?', '', '- **RP-3** collides with the standard.'].join('\n');
        fs.writeFileSync(path.join(root, 'std.md'), std);
        fs.writeFileSync(path.join(root, 'rub.md'), rub);
        // 1. index: the expected ids, stable, collisions reported
        const i1 = runIndex(root, { sources: SRC });
        const j1 = fs.readFileSync(path.join(root, INDEX_REL), 'utf8');
        const i2 = runIndex(root, { sources: SRC });
        const j2 = fs.readFileSync(path.join(root, INDEX_REL), 'utf8');
        t('index re-run is byte-identical', j1 === j2 && i1.ok && i2.ok);
        t('index --check passes on a fresh index', runIndex(root, { sources: SRC, check: true }).ok);
        const ids = i1.idx.rules.map((r) => r.key);
        t('bullet, paragraph, table and heading rules found', ['VA-1', 'VA-2', 'P-6', 'P-PR-1', 'L-1', 'H1', 'H5', 'C1'].every((k) => ids.includes(k)));
        t('fenced and non-rule tokens ignored (XX-9, A4)', !ids.some((k) => /^XX-9|^A4/.test(k)));
        const ex = (k) => (i1.idx.rules.find((r) => r.key === k) || {}).excerpt || '';
        t('a rule ending in ":" keeps the table or list under it (P-31, BD-11), stopping at the next rule',
            /Hints on tests/.test(ex('P-31')) && /- Circle/.test(ex('BD-11')) && !/Never tap/.test(ex('BD-11')) && ids.includes('BD-12'));
        t('bullet excerpt keeps its continuation line', /operator track is extra/.test(i1.idx.rules.find((r) => r.key === 'VA-1').excerpt));
        t('appendix table row is a table mention, not a duplicate', i1.idx.tableMentions.some((m) => m.id === 'VA-1') && !i1.idx.duplicates.length);
        t('cross-file collision reported and keyed ID@SRC', i1.idx.collisions.some((c) => c.id === 'RP-3') && ids.includes('RP-3@STD') && ids.includes('RP-3@RUB'));
        t('near-collision RP-3 / RP-03 reported', i1.idx.nearCollisions.some((n) => n.ids.map((x) => x.id).join() === 'RP-03,RP-3' || n.ids.map((x) => x.id).join() === 'RP-3,RP-03'));
        // 2. a card, a findings file, coverage
        const cfg = {
            id: 'mini', kind: 'template', title: 'Mini stack', template: { id: 'stack', source: 'none.js' }, families: ['addition'],
            ruleGroups: [{ title: 'Core', core: true, rules: ['VA-1', 'P-6'] }, { title: 'Caps', rules: ['H1'] }], fullRules: ['VA-1'],
            openQuestions: [{ q: 'Carry under the line?', recommended: 'no, top by default' }],
        };
        const cdir = path.join(root, CARDS_REL, 'mini');
        fs.mkdirSync(cdir, { recursive: true });
        fs.writeFileSync(path.join(cdir, 'card.json'), JSON.stringify(cfg, null, 1));
        const csv = [
            'report,run,round,defect_id,class,kind,carried,severity,rule_ids,family,template,summary',
            'r1,run-a,1,D1,KEY,machine,no,major,H1,addition,stack,"key wrong, on page 2"',
            'r1,run-a,1,D2,SLOT,machine,no,major,VA-2;H1,addition,stack,slot too small',
            'r2,run-b,2,D3,OTHER,judgment,no,minor,ZZ-99,subtraction,stack,typo id',
            'r3,run-c,1,D4,SIZE,machine,no,major,VA-9,geometry,shape-grid,not ours',
            'r4,lessons/x,1,D5,PATTERN,machine,no,minor,LR-4,lessons,stack,lesson rule (external)',
            'r5,guided-r1/addition:add,1,U1,SPACE,machine,no,major,BD-11,wrm-page,,named by its cat:skill in run',
            'r6,run-e,1,D6,SPACE,machine,no,major,RP-03,wrm-page,,the word add alone does not name the skill',
        ].join('\n');
        fs.writeFileSync(path.join(root, 'findings.csv'), csv);
        const fx = { skills: ['addition:add'], standards: { ccss: ['2.NBT.B.5'], ee: [] }, options: [], presets: [], gates: [{ cmd: 'node tests/scripts/ws-precritic.cjs --template stack', exists: false }], surface: { options: [], roles: [], hosts: [] } };
        const noDerive = async (r, c, idx) => ({ labels: {}, wrm: [], buildEntries: [], sourceRules: [], capacity: [], ...JSON.parse(JSON.stringify(fx)) });
        const opts = { sources: SRC, derive: noDerive, findingsPath: 'findings.csv' };
        const g1 = await generateCard(root, 'mini', 'template', opts);
        const md = path.join(cdir, 'mini.md');
        const c1 = fs.readFileSync(md, 'utf8');
        const g1b = await generateCard(root, 'mini', 'template', opts);
        t('card generation is byte-identical on re-run', g1.ok && g1b.ok && c1 === fs.readFileSync(md, 'utf8'));
        t('card has the nine sections and its signed part ends unsigned', [1, 2, 3, 4, 5, 6, 7, 8, 9].every((n) => c1.includes(`\n## ${n}. `)) && splitCard(c1).signedPart.trimEnd().endsWith(UNSIGNED));
        const cov1 = checkCoverage(root, md, { sources: SRC, findingsPath: 'findings.csv' });
        t('coverage FAILS when a cited id (VA-2) is missing from the card', !cov1.ok && cov1.lines.some((l) => /VA-2 was cited/.test(l)));
        t('coverage ignores other templates/families (VA-9 not demanded)', !cov1.lines.some((l) => /VA-9 was cited/.test(l)));
        t('unknown cited id (ZZ-99) is a warning', cov1.lines.some((l) => /^WARN .*unknown ids.*ZZ-99/.test(l)));
        t('D6: a finding whose run names a card skill (cat:skill) counts, whatever its family (BD-11 demanded)', cov1.lines.some((l) => /BD-11 was cited/.test(l)));
        t('D6: a bare skill id without "_" in a summary ("add") does not name the skill (RP-03 not demanded)', !cov1.lines.some((l) => /RP-03 was cited/.test(l)));
        t('N4: an external lesson-rule id (LR-4) is a NOTE, not an unknown id', !cov1.lines.some((l) => /^WARN .*LR-4/.test(l)) && cov1.lines.some((l) => /^NOTE .*LR-4 — design\/LESSON_RULES\.md/.test(l)));
        t('D7: section 4 has the core part (quoted) and the ids-only part', /### 4a\. Core rules[\s\S]*- \*\*VA-1\*\* ✱[\s\S]*### 4b\. Also applies[\s\S]*`H1`/.test(c1) && !/- \*\*H1\*\*/.test(c1));
        t('D7: ids listed in 4b count as on the card', readCard(c1).onCard.includes('H1') && readCard(c1).onCard.includes('VA-1'));
        cfg.ruleGroups[1].rules.push('VA-2', 'BD-11');
        fs.writeFileSync(path.join(cdir, 'card.json'), JSON.stringify(cfg, null, 1));
        await generateCard(root, 'mini', 'template', opts);
        const cov2 = checkCoverage(root, md, { sources: SRC, findingsPath: 'findings.csv' });
        t('coverage PASSES once the cited id is added', cov2.ok);
        // 3. a changed excerpt is caught
        fs.writeFileSync(path.join(root, 'std.md'), std.replace('the leftmost track.', 'the leftmost track, never boxed.'));
        const cov3 = checkCoverage(root, md, { sources: SRC, findingsPath: 'findings.csv' });
        t('a rule changed after generation FAILS coverage', !cov3.ok && cov3.lines.some((l) => /VA-2 changed since/.test(l)));
        t('index --check reports the stale index', !runIndex(root, { sources: SRC, check: true }).ok);
        // a rule that disappears is caught too
        fs.writeFileSync(path.join(root, 'std.md'), std.replace(/^- \*\*VA-2\*\*.*$/m, ''));
        const cov3b = checkCoverage(root, md, { sources: SRC, findingsPath: 'findings.csv' });
        t('a rule removed from the standards FAILS coverage', !cov3b.ok && cov3b.lines.some((l) => /VA-2 is no longer/.test(l)));
        fs.writeFileSync(path.join(root, 'std.md'), std);
        // 4. signing: the build-start gate (D5)
        const sOpts = { ...opts, today: '2026-10-23' };
        const cs0 = await checkSigned(root, md, sOpts);
        t('check-signed refuses an unsigned card, saying how to sign', !cs0.ok && cs0.lines.some((l) => /not signed .*Signed: owner, YYYY-MM-DD/.test(l)));
        const unsignedText = fs.readFileSync(md, 'utf8');
        const signedText = unsignedText.replace(UNSIGNED, 'Signed: owner, 2026-10-20');
        fs.writeFileSync(md, signedText);
        const cs1 = await checkSigned(root, md, sOpts);
        t('check-signed accepts a valid signed card (OK)', cs1.ok && !cs1.lines.length);
        const signAs = async (line) => { fs.writeFileSync(md, unsignedText.replace(UNSIGNED, line)); return checkSigned(root, md, sOpts); };
        const cs2 = await signAs('Signed: owner, 2026-02-30');
        t('check-signed FAILS an impossible date (2026-02-30)', !cs2.ok && cs2.lines.some((l) => /not a real calendar date/.test(l)));
        const cs2b = await signAs('Signed: owner, 2026-99-99');
        t('check-signed FAILS an impossible date (2026-99-99)', !cs2b.ok && cs2b.lines.some((l) => /not a real calendar date/.test(l)));
        const cs3 = await signAs('Signed: owner, 2026-10-24');
        t('check-signed FAILS a future date', !cs3.ok && cs3.lines.some((l) => /in the future/.test(l)));
        fs.writeFileSync(md, signedText.replace(/^- \*\*P-6\*\*.*\n/m, ''));
        const cs4 = await checkSigned(root, md, sOpts);
        t('check-signed FAILS a signed card with a rule hand-deleted (body sha), naming the fix', !cs4.ok && cs4.lines.some((l) => /edited by hand.*--resign/.test(l)));
        fs.writeFileSync(md, signedText.replace(/`BD-11`/, ''));
        const cs4b = await checkSigned(root, md, sOpts);
        t('check-signed FAILS a signed card with an ids-only rule hand-deleted (body sha + coverage)', !cs4b.ok && cs4b.lines.some((l) => /edited by hand/.test(l)) && cs4b.lines.some((l) => /BD-11 was cited/.test(l)));
        fs.writeFileSync(md, signedText);
        fs.writeFileSync(path.join(root, 'std.md'), std.replace('the leftmost track.', 'the leftmost track, never boxed.'));
        const cs5 = await checkSigned(root, md, sOpts);
        t('check-signed FAILS a signed card whose rule changed after signing, naming the id', !cs5.ok && cs5.lines.some((l) => /rule VA-2 changed since/.test(l)));
        fs.writeFileSync(path.join(root, 'std.md'), std.replace(/^- \*\*VA-2\*\*.*$/m, ''));
        const cs5b = await checkSigned(root, md, sOpts);
        t('check-signed FAILS a signed card whose rule was deleted from the standard, naming the id', !cs5b.ok && cs5b.lines.some((l) => /rule VA-2 is no longer/.test(l)));
        fs.writeFileSync(path.join(root, 'std.md'), std);
        const cfgText = fs.readFileSync(path.join(cdir, 'card.json'), 'utf8');
        fs.writeFileSync(path.join(cdir, 'card.json'), JSON.stringify({ ...cfg, summary: 'changed after signing' }, null, 1));
        const cs6 = await checkSigned(root, md, sOpts);
        t('check-signed FAILS when card.json changed after signing (it generates a different card)', !cs6.ok && cs6.lines.some((l) => /generates a different card/.test(l)));
        fs.writeFileSync(path.join(cdir, 'card.json'), cfgText);
        t('check-signed is OK again once everything is restored', (await checkSigned(root, md, sOpts)).ok);
        // 4b. (02c5308e, ported) the signed part vs the informational §7b: a correct build changes the repo listings
        t('format 2: the live listing sits after the Signed line, between the fences', splitCard(signedText).format === 2 && /^Signed: owner, 2026-10-20$/m.test(splitCard(signedText).signedPart) && /## 7b\. What the repo offers/.test(splitCard(signedText).info) && !/## 7b/.test(splitCard(signedText).signedPart));
        fx.options = [{ id: 'lengths', label: 'Number lengths', values: ['same', 'ragged'], skills: 1 }];
        fx.presets = [{ key: 'addition:add_ragged', host: 'addition:add', opts: { lengths: 'ragged' } }];
        const cs7 = await checkSigned(root, md, sOpts);
        t('BACKTEST 02c: sign, add an option and a preset to the repo, --check-signed stays OK', cs7.ok);
        const g7 = await generateCard(root, 'mini', 'template', opts);
        const t7 = fs.readFileSync(md, 'utf8');
        t('BACKTEST 02c: regenerating after the option lands keeps the signed part byte for byte and refreshes §7b', g7.ok && splitCard(t7).signedPart === splitCard(signedText).signedPart && /`lengths` Number lengths: same \/ ragged/.test(splitCard(t7).info) && (await checkSigned(root, md, sOpts)).ok);
        fx.skills = ['addition:add', 'addition:add_ragged']; fx.standards = { ccss: ['2.NBT.B.5', '2.NBT.B.6'], ee: [] }; fx.gates = [{ ...fx.gates[0], exists: true }];
        const cs8 = await checkSigned(root, md, sOpts);
        t('BACKTEST 02c: a build that adds a preset skill, tags it and lands a PLANNED gate stays OK, with NOTE lines', cs8.ok && cs8.lines.some((l) => /^NOTE .*§1 skills added since signing.*add_ragged/.test(l)) && cs8.lines.some((l) => /^NOTE .*§8 gates PLANNED gone/.test(l)));
        fx.skills = []; fx.standards = { ccss: [], ee: [] };
        const cs8b = await checkSigned(root, md, sOpts);
        t('BACKTEST 02c: a skill or tag signed on the card that disappears from the repo FAILS', !cs8b.ok && cs8b.lines.some((l) => /§1 skills signed on the card no longer in the repo: addition:add/.test(l)) && cs8b.lines.some((l) => /§1 CCSS signed/.test(l)));
        fx.skills = ['addition:add']; fx.standards = { ccss: ['2.NBT.B.5'], ee: [] };
        fs.writeFileSync(md, t7.replace('Carry under the line?', 'Carry above the line?'));
        const cs9 = await checkSigned(root, md, sOpts);
        t('BACKTEST 02c: sign, hand-edit a signed section (open question), FAIL', !cs9.ok && cs9.lines.some((l) => /edited by hand/.test(l)));
        fs.writeFileSync(md, t7.replace('Number lengths', 'Number lengths (hand note)').replace('Not part of the signed card', 'Hand edit: not part of the signed card'));
        t('BACKTEST 02c: edit only the informational block, still OK', (await checkSigned(root, md, sOpts)).ok);
        fs.writeFileSync(md, t7.replace('**Options declared today**', '- **VA-9** a rule smuggled in\n\n**Options declared today**'));
        t('the informational block may not carry a rule (FAIL)', !(await checkSigned(root, md, sOpts)).ok);
        fs.writeFileSync(md, t7.replace('## 5. Owner rulings', `${INFO_OPEN}\n## 5. Owner rulings`));
        t('a fence moved up to hide signed content FAILS', !(await checkSigned(root, md, sOpts)).ok);
        fs.writeFileSync(md, `${t7}trailing text\n`);
        t('text after the informational block FAILS', !(await checkSigned(root, md, sOpts)).ok);
        fs.writeFileSync(md, t7);
        fs.writeFileSync(path.join(root, 'std.md'), std.replace('the leftmost track.', 'the leftmost track, never boxed.'));
        const cs11 = await checkSigned(root, md, sOpts);
        t('BACKTEST 02c: change a rule after signing (options added meanwhile), still FAIL', !cs11.ok && cs11.lines.some((l) => /rule VA-2 changed since/.test(l)));
        fs.writeFileSync(path.join(root, 'std.md'), std);
        fs.writeFileSync(path.join(cdir, 'card.json'), JSON.stringify({ ...cfg, options: ['asks for `zeros`'] }, null, 1));
        const cs12 = await checkSigned(root, md, sOpts);
        t('an option the CARD asks for is signed content: changing it in card.json FAILS', !cs12.ok && cs12.lines.some((l) => /configSha/.test(l)));
        fs.writeFileSync(path.join(cdir, 'card.json'), cfgText);
        // format 1 (cards signed before §7b existed): the live §7 listing inside the signed body
        const legacy = (txt, optLines) => {
            const o = splitCard(txt).signedPart.replace(/,"format":2,"configSha":"[0-9a-f]*"/, '').replace(/,"entries":"[^"]*"/, '')
                .replace(`${INFO_POINTER}\n\n`, `**Options declared today** (x):\n\n${optLines}\n**Preset skills on these hosts** (y): (none)\n\n`);
            return o.replace(/"bodySha":"[0-9a-f]*"/, `"bodySha":"${bodyShaOf(o)}"`);
        };
        const old1 = legacy(t7, '- `band` Numbers to: 10 (1)\n');
        fs.writeFileSync(md, old1);
        const cs13 = await checkSigned(root, md, sOpts);
        t('BACKTEST 02c format 1: a signed card whose live §7 options changed since stays OK, with a NOTE', cs13.ok && cs13.lines.some((l) => /^NOTE .*format-1 card/.test(l)));
        fs.writeFileSync(md, old1.replace('Carry under the line?', 'Carry above the line?'));
        t('format 1: a hand edit to its signed content still FAILS', !(await checkSigned(root, md, sOpts)).ok);
        fs.writeFileSync(md, old1.replace('- `band` Numbers to: 10 (1)', '- `band` Numbers to: 20 (1)'));
        t('format 1: a hand edit inside its old §7 listing FAILS (it was signed, so it stays hashed)', !(await checkSigned(root, md, sOpts)).ok);
        fx.options = []; fx.presets = []; fx.gates = [{ ...fx.gates[0], exists: false }];
        fs.writeFileSync(md, signedText);
        // 4c. W0-B2: hosts, roles and options — every live line needs a decision
        const live = (o) => ({ options: (o.options || []).map((k) => ({ key: k, skills: ['addition:add'], text: '' })), roles: (o.roles || []).map((k) => ({ key: `role:${k}`, skills: ['addition:add'], text: '' })), hosts: (o.hosts || []).map((k) => ({ key: `host:${k}`, skills: ['addition:add'], text: '' })) });
        const setCfg = (c) => fs.writeFileSync(path.join(cdir, 'card.json'), JSON.stringify(c, null, 1));
        const signNow = async () => { const g = await generateCard(root, 'mini', 'template', { ...opts, resign: true }); const tx = fs.readFileSync(md, 'utf8').replace(UNSIGNED, 'Signed: owner, 2026-10-20'); fs.writeFileSync(md, tx); return { g, tx }; };
        fx.surface = live({ options: ['notation=stacked', 'notation=across'], roles: ['independent'], hosts: ['quiz'] });
        const cs14 = await checkSigned(root, md, sOpts);
        t('B2: a live option / role / host line with no decision FAILS (UNDECIDED, named)', !cs14.ok && cs14.lines.some((l) => /no decision \(UNDECIDED.*notation=across.*role:independent.*host:quiz/.test(l)));
        const decided = { ...cfg, decisions: {
            options: [{ key: 'notation=stacked', d: 'offered' }, { key: 'notation=across', d: 'hidden', why: 'across is its own page', proposed: true }, { option: 'lengths', values: ['same', 'shorter'], d: 'offered' }],
            roles: [{ key: 'independent', d: 'offered' }], hosts: [{ key: 'quiz', d: 'offered' }, { key: 'race', d: 'out of scope', why: 'graded as the card' }] } };
        setCfg(decided);
        const s15 = await signNow();
        const cs15 = await checkSigned(root, md, sOpts);
        t('B2: every live line decided: OK; a PROPOSED decision is a NOTE, not a failure; decided lines not live are noted', s15.g.ok && cs15.ok && cs15.lines.some((l) => /^NOTE .*1 live line\(s\) carry a PROPOSED decision.*notation=across/.test(l)) && cs15.lines.some((l) => /^NOTE .*not offer today.*lengths=same/.test(l)));
        t('B2: the decisions print signed in §7a and the markers in the informational §7b', /### 7a\.[\s\S]*`notation=across` — \*\*hidden\*\* \(PROPOSED\)/.test(splitCard(s15.tx).signedPart) && /`notation=across` \(all 1\) \[hidden, PROPOSED\]/.test(splitCard(s15.tx).info));
        const blk15 = JSON.parse(/<!-- rulings\n([\s\S]*?)\n-->/.exec(s15.tx)[1]);
        t('B2: a hidden option decision becomes a notOffered entry of the rulings block', blk15.notOffered.some((x) => x.id === 'N-D-notation' && x.option === 'notation' && x.values.join() === 'across'));
        fx.surface = live({ options: ['notation=stacked', 'notation=across', 'zeros=on'], roles: ['independent'], hosts: ['quiz'] });
        const cs16 = await checkSigned(root, md, sOpts);
        t('B2 BACKTEST: a NEW option appears in the repo after signing: FAIL naming it', !cs16.ok && cs16.lines.some((l) => /UNDECIDED.*zeros=on/.test(l)) && !cs16.lines.some((l) => /UNDECIDED.*notation/.test(l)));
        fx.surface = live({ options: ['notation=stacked', 'notation=across', 'notation=vertical'], roles: ['independent', 'lesson'], hosts: ['quiz', 'boss'] });
        const cs16b = await checkSigned(root, md, sOpts);
        t('B2: a new value of a decided option, a new role and a new host each FAIL', !cs16b.ok && cs16b.lines.some((l) => /UNDECIDED.*notation=vertical.*role:lesson.*host:boss/.test(l)));
        fx.surface = live({ options: ['notation=stacked', 'notation=across', 'lengths=same', 'lengths=shorter'], roles: ['independent'], hosts: ['quiz'] });
        fx.options = [{ id: 'lengths', label: 'Number lengths', values: ['same', 'shorter'], skills: 1 }];
        const cs17 = await checkSigned(root, md, sOpts);
        t('B2 BACKTEST: a correct build adds an option the card already decides (lengths): OK', cs17.ok && !cs17.lines.some((l) => /UNDECIDED/.test(l)));
        fx.options = [];
        const sk18 = { ...decided, decisions: { ...decided.decisions, options: [...decided.decisions.options, { key: 'notation=across', d: 'offered', skills: ['addition:add'] }] } };
        t('B2: a decision naming the skill beats the one for all skills', decideSurface(sk18, live({ options: ['notation=across'] }))[0].by['addition:add'].d === 'offered');
        t('B2: an unknown decision word is refused', checkDecisions({ decisions: { options: [{ key: 'notation=across', d: 'maybe' }] } }, { surface: live({ options: ['notation=across'] }) }).fails.some((f) => /not one of offered/.test(f)));
        t('B2: a repo listing that could not be read FAILS (never a silent empty listing)', checkDecisions(decided, { surface: { options: [], roles: [], hosts: [], problems: ['skill-options.js: boom'] } }).fails.some((f) => /could not be read: skill-options\.js: boom/.test(f)));
        // 4d. W0-A critic r7 D2: the rulings and notOffered are signed content
        const ruled = { ...decided, rulings: { rulings: [{ id: 'R-BAND', source: '§9.1', assert: 'range', of: 'a', min: 10, max: 99 }], notOffered: [{ id: 'N-BAND', source: '§7', option: 'band' }] } };
        setCfg(ruled);
        const s19 = await signNow();
        t('D2: a signed card with rulings checks OK', s19.g.ok && (await checkSigned(root, md, sOpts)).ok);
        const weak = JSON.parse(JSON.stringify(ruled)); weak.rulings.rulings[0].max = 999;
        setCfg(weak);
        const cs20 = await checkSigned(root, md, sOpts);
        t('D2 BACKTEST: weaken a ruling in card.json under a signature: FAIL naming it', !cs20.ok && cs20.lines.some((l) => /CHANGED in card\.json since signing.*R:R-BAND/.test(l)));
        const r20 = await generateCard(root, 'mini', 'template', { ...opts, rulingsOnly: true });
        t('D2 BACKTEST: --rulings-only on a SIGNED card refuses to write a weakened block (no bodySha refresh)', !r20.ok && /SIGNED/.test(r20.msg) && fs.readFileSync(md, 'utf8') === s19.tx);
        const empty = JSON.parse(JSON.stringify(ruled)); empty.rulings.notOffered = [];
        setCfg(empty);
        const cs21 = await checkSigned(root, md, sOpts);
        t('D2 BACKTEST: empty notOffered in card.json under a signature: FAIL naming it', !cs21.ok && cs21.lines.some((l) => /REMOVED from card\.json since signing.*N:N-BAND/.test(l)));
        setCfg(ruled);
        const forged = s19.tx.replace(/,"max":99\}/, ',"max":999}');
        fs.writeFileSync(md, forged);
        t('D2: a hand-weakened block in the card FAILS (body sha)', !(await checkSigned(root, md, sOpts)).ok);
        fs.writeFileSync(md, forged.replace(/"bodySha":"[0-9a-f]*"/, `"bodySha":"${bodyShaOf(forged)}"`));
        const cs22 = await checkSigned(root, md, sOpts);
        t('D2: a hand-weakened block with its bodySha recomputed still FAILS (card.json generates a different block)', !cs22.ok && cs22.lines.some((l) => /generates a different card/.test(l)));
        fs.writeFileSync(md, s19.tx);
        setCfg(weak);
        const r23 = await generateCard(root, 'mini', 'template', { ...opts, rulingsOnly: true, resign: true });
        const t23 = fs.readFileSync(md, 'utf8');
        t('D2: --rulings-only --resign writes the block and resets the signature', r23.ok && /RESET/.test(r23.msg) && !readCard(t23).isSigned && /"max":999/.test(t23));
        setCfg(cfg);
        fx.surface = { options: [], roles: [], hosts: [] };
        await generateCard(root, 'mini', 'template', { ...opts, resign: true });
        fs.writeFileSync(md, fs.readFileSync(md, 'utf8').replace(UNSIGNED, 'Signed: owner, 2026-10-20'));
        t('restored: the mini card checks OK again', (await checkSigned(root, md, sOpts)).ok);
        const cs24 = await checkSigned(root, md, sOpts);
        fs.writeFileSync(md, fs.readFileSync(md, 'utf8').replace('Signed: owner, 2026-10-20', UNSIGNED));
        const cs25 = await checkSigned(root, md, sOpts);
        t('an unsigned card whose only problem is the signature reports onlyUnsigned ("needs owner signature")', cs24.ok && !cs25.ok && cs25.onlyUnsigned && /needs owner signature/.test(cs25.msg));
        fs.writeFileSync(md, signedText);
        const g2 = await generateCard(root, 'mini', 'template', opts);
        t('regenerating an unchanged signed card keeps the signature', g2.ok && fs.readFileSync(md, 'utf8') === signedText);
        cfg.openQuestions.push({ q: 'A new question?', recommended: 'yes' });
        fs.writeFileSync(path.join(cdir, 'card.json'), JSON.stringify(cfg, null, 1));
        const g3 = await generateCard(root, 'mini', 'template', opts);
        t('a signed card is NOT overwritten when its content would change', !g3.ok && fs.readFileSync(md, 'utf8') === signedText);
        const g4 = await generateCard(root, 'mini', 'template', { ...opts, resign: true });
        const after = fs.readFileSync(md, 'utf8');
        t('--resign rewrites it unsigned and says so', g4.ok && /RESET/.test(g4.msg) && splitCard(after).signedPart.trimEnd().endsWith(UNSIGNED) && after.includes('A new question?'));
        t('a missing findings file is a warning, or a FAIL with --require-findings',
            checkCoverage(root, md, { sources: SRC, findingsPath: 'nope.csv' }).ok && !checkCoverage(root, md, { sources: SRC, findingsPath: 'nope.csv', requireFindings: true }).ok);
        t('CSV parser handles quoted commas', parseCsv(csv)[0].summary === 'key wrong, on page 2');
        // D7: the core part has a byte cap
        fs.writeFileSync(path.join(cdir, 'card.json'), JSON.stringify({ ...cfg, coreBytes: 100 }, null, 1));
        const g5 = await generateCard(root, 'mini', 'template', { ...opts, resign: true });
        t('D7: a core part over its byte cap refuses to generate', !g5.ok && /over its 100-byte cap/.test(g5.msg));
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
    for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name}`);
    const bad = results.filter((r) => !r.ok).length;
    return { ok: !bad, msg: `${results.length - bad}/${results.length} self-test checks` };
}

/**
 * --fixture <file.mjs>: the card gate on a seeded state (ws-backtest fixture rows; no repo files touched). The module's
 * default export: {card: card.json object, std?: a mini standard (markdown), signedOn: 'YYYY-MM-DD', today?,
 * atSign: {surface, options?, skills?}, now?: {surface?, card?}}. The card is generated in a temp tree from `card` with
 * the repo listing `atSign`, signed, then the repo (and card.json) move to `now`, and --check-signed runs.
 */
async function runFixture(file) {
    const fx = (await import(pathToFileURL(path.resolve(file)).href)).default;
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ws-spec-card-fx-'));
    try {
        const SRC = [{ key: 'STD', file: 'std.md' }];
        fs.writeFileSync(path.join(root, 'std.md'), fx.std || '# Std\n\n## 1. Stacks\n\n- **VA-1** Track count: T = d + 1.\n');
        const id = fx.card.id, kind = fx.card.kind;
        const cdir = path.join(root, CARDS_REL, id);
        fs.mkdirSync(cdir, { recursive: true });
        fs.writeFileSync(path.join(cdir, 'card.json'), JSON.stringify(fx.card, null, 1));
        let state = fx.atSign || {};
        const derive = async () => ({ labels: {}, wrm: [], buildEntries: [], sourceRules: [], capacity: [], gates: [], presets: [], standards: { ccss: [], ee: [] },
            skills: state.skills || [...new Set(Object.values(state.surface || {}).flatMap((ls) => (ls || []).flatMap((x) => x.skills || [])))].sort(),
            options: state.options || [], surface: state.surface || { options: [], roles: [], hosts: [] } });
        const o = { sources: SRC, derive, findingsPath: 'none.csv' };
        const g = await generateCard(root, id, kind, o);
        if (!g.ok) return g;
        const md = path.join(cdir, `${id}.md`);
        fs.writeFileSync(md, fs.readFileSync(md, 'utf8').replace(UNSIGNED, `Signed: owner, ${fx.signedOn || '2026-10-20'}`));
        if (fx.now) {
            state = { ...state, ...fx.now, surface: fx.now.surface || state.surface };
            if (fx.now.card) fs.writeFileSync(path.join(cdir, 'card.json'), JSON.stringify(fx.now.card, null, 1));
        }
        const r = await checkSigned(root, md, { ...o, today: fx.today || '2026-10-24' });
        r.lines.filter((l) => !/^NOTE .*no findings file/.test(l)).forEach((l) => console.log(l.replace(root + path.sep, '')));
        return { ok: r.ok, msg: `fixture ${path.basename(file)}: ${r.msg.replace(root + path.sep, '')}` };
    } finally { fs.rmSync(root, { recursive: true, force: true }); }
}

/* ================================================================ CLI */

async function main(argv) {
    const has = (f) => argv.includes(f);
    const val = (f) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };
    const findingsPath = val('--findings');
    if (has('--self-test')) return selfTest();
    if (has('--fixture')) { const f = val('--fixture'); if (!f) return { ok: false, msg: '--fixture needs a file' }; return runFixture(f); }
    if (has('--index')) {
        const r = runIndex(REPO, { check: has('--check') });
        if (r.idx.totals.collisions || r.idx.totals.duplicates) console.log(`note: ${r.idx.totals.collisions} cross-file collisions, ${r.idx.totals.duplicates} in-file duplicates, ${r.idx.totals.nearCollisions} near-collisions (see ${INDEX_MD_REL})`);
        return r;
    }
    for (const kind of ['template', 'family']) {
        if (has(`--${kind}`)) {
            const id = val(`--${kind}`);
            if (!id) return { ok: false, msg: `--${kind} needs an id` };
            return generateCard(REPO, id, kind, { resign: has('--resign'), rulingsOnly: has('--rulings-only'), findingsPath });
        }
    }
    if (has('--check-coverage')) {
        const target = val('--check-coverage');
        const files = has('--all') || target === null ? allCards(REPO) : [path.resolve(REPO, target)];
        if (!files.length) return { ok: false, msg: 'no cards found' };
        let ok = true;
        for (const f of files) {
            const r = checkCoverage(REPO, f, { findingsPath, requireFindings: has('--require-findings') });
            r.lines.forEach((l) => console.log(l));
            ok = ok && r.ok;
        }
        return { ok, msg: `${files.length} card(s) checked` };
    }
    if (has('--check-signed')) {
        const target = val('--check-signed');
        const keys = argv.flatMap((a, i) => (a === '--skill' && argv[i + 1] ? argv[i + 1].split(',') : [])).map((x) => x.trim()).filter(Boolean);
        if (!target && !keys.length) return { ok: false, msg: '--check-signed needs a card path, or --skill cat:skill[,...] (the cards that cover those skills)' };
        const files = target ? [path.resolve(REPO, target)] : cardsCovering(REPO, keys);
        if (!files.length) return { ok: true, verdict: 'NO-CARD', code: 4, msg: `no spec card under ${CARDS_REL} covers ${keys.join(', ')} (section 1 or the rulings block): nothing to check` };
        const res = [];
        for (const f of files) {
            const r = await checkSigned(REPO, f, { findingsPath, requireFindings: has('--require-findings') });
            r.lines.forEach((l) => console.log(l));
            console.log(`${r.ok ? 'ok  ' : r.onlyUnsigned ? 'UNSIGNED' : 'FAIL'} ${r.msg}`);
            res.push({ f, ...r });
        }
        // A SIGNED card that fails is a broken build gate: exit 1. An UNSIGNED card is a draft the owner has not signed:
        // exit 5 (ws-precritic reports it INCOMPLETE "needs owner signature", never PASS), its other problems listed.
        const names = (xs) => xs.map((r) => `${rel(REPO, r.f)}${r.onlyUnsigned ? '' : ` (also ${r.lines.filter((l) => /^FAIL /.test(l)).length - 1} other problem(s))`}`).join(', ');
        const bad = res.filter((r) => !r.ok && !r.unsigned), uns = res.filter((r) => !r.ok && r.unsigned);
        if (bad.length) return { ok: false, msg: files.length === 1 ? bad[0].msg : `${bad.length} of ${files.length} SIGNED card(s) failing: ${bad.map((r) => rel(REPO, r.f)).join(', ')}${uns.length ? `; needs owner signature: ${names(uns)}` : ''}` };
        if (uns.length) return { ok: false, code: 5, msg: `needs owner signature: ${names(uns)}${uns.every((r) => r.onlyUnsigned) ? ' (everything else green)' : ''}` };
        return { ok: true, msg: files.length === 1 ? res[0].msg : `${files.length} card(s) signed and green: ${names(res)}` };
    }
    console.log('usage: --index [--check] | --template <id> | --family <id> [--resign | --rulings-only] | --check-coverage <card>|--all [--findings f] [--require-findings] | --check-signed <card> | --check-signed --skill cat:skill[,...] | --self-test');
    return { ok: false, msg: 'no mode given' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main(process.argv.slice(2)).then((r) => {
        console.log(`ws-spec-card: ${r.verdict || (r.ok ? 'OK' : 'FAIL')} — ${r.msg}`);
        process.exit(r.code !== undefined ? r.code : r.ok ? 0 : 1);
    }, (e) => {
        console.error(e && e.stack || e);
        console.log('ws-spec-card: FAIL — crashed');
        process.exit(1);
    });
}
