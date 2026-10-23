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
//   node tests/scripts/ws-spec-card.mjs --check-coverage design/cards/stack/stack.md   (or --all)
//        ... [--findings <csv>] [--require-findings]            the card-coverage test (below)
//   node tests/scripts/ws-spec-card.mjs --check-signed design/cards/stack/stack.md      the build-start gate
//   node tests/scripts/ws-spec-card.mjs --self-test             seeded fixtures, no repo files touched
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
//   1. a rule id a critic cited on a finding for the card's template or families (design/status/defect-findings.csv,
//      columns report,run,round,defect_id,class,kind,carried,severity,rule_ids,family,template,summary; rule_ids
//      ';'-separated) is missing from section 4 of the card;
//   2. a rule on the card no longer exists in the current index, or its excerpt sha changed since the card was
//      generated (the rule changed after signing: regenerate with --resign and have the owner sign again).
// It WARNS (does not fail) on cited ids that are not in the index ("unknown ids": typos in reports) and lists ids
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
const SIGNED_RE = /^Signed: owner, \d{4}-\d{2}-\d{2}\s*$/;
const SHA_LEN = 16;   // a card stores 16 hex digits of each excerpt sha: plenty to see a change, half the bytes

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

/** The findings that concern a card: its template(s) or its families. */
function findingsFor(rows, match) {
    const tpl = new Set((match.templates || []).map((x) => x.toLowerCase()));
    const fam = new Set((match.families || []).map((x) => x.toLowerCase()));
    return rows.filter((r) => splitList(r.template).some((t) => tpl.has(t.toLowerCase()))
        || splitList(r.family).some((f) => fam.has(f.toLowerCase())));
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
    return d;
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

function compactSkills(skills, labels) {
    const byCat = new Map();
    for (const k of skills) { const [c, s] = k.split(':'); if (!byCat.has(c)) byCat.set(c, []); byCat.get(c).push(s); }
    return [...byCat].map(([c, ids]) => `- **${c}** (${ids.length}): ${ids.map((s) => `\`${s}\``).join(', ')}`);
}

/**
 * Render a card. Returns {text, meta, missingRules}. `signedLine` is kept as given.
 */
export function renderCard(cfg, d, idx, { signedLine = UNSIGNED, cited = [] } = {}) {
    const limit = cfg.excerptChars || 240;
    const fullSet = new Set(cfg.fullRules || []);
    // section 4: the card's rules = the configured ones + the ids the template source cites
    const refs = [];
    const seen = new Set();
    const groups = [];
    const addGroup = (title, ids, chars = limit, full = false) => {
        const g = { title, refs: [], chars, full };
        for (const ref of ids) { if (seen.has(ref)) continue; seen.add(ref); refs.push(ref); g.refs.push(ref); }
        if (g.refs.length) groups.push(g);
    };
    for (const g of cfg.ruleGroups || []) addGroup(g.title, g.rules || [], g.chars || limit, !!g.full);
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
    const match = { templates: (cfg.findingsMatch && cfg.findingsMatch.templates) || (tplId ? [tplId] : []), families: (cfg.findingsMatch && cfg.findingsMatch.families) || cfg.families || [] };
    const meta = {
        card: cfg.id, kind: cfg.kind, template: tplId, families: cfg.families || [], match,
        config: `${CARDS_REL}/${cfg.id}/card.json`, indexSha: idx.indexSha,
        citedAtGeneration: cited, rules: metaRules,
    };
    const L = [];
    L.push('<!-- spec-card');
    const { rules: mr, citedAtGeneration: mc, ...mh } = meta;
    L.push(JSON.stringify(mh).replace(/--/g, '- -'));
    L.push(`{"citedAtGeneration":${JSON.stringify(mc)},`);
    L.push(`"rules":${JSON.stringify(mr).replace(/--/g, '- -')}}`);
    L.push('-->');
    L.push(`# Spec card: ${cfg.title}`, '');
    L.push(`Generated by \`node tests/scripts/ws-spec-card.mjs --${cfg.kind} ${cfg.id}\` from \`${CARDS_REL}/${cfg.id}/card.json\` and the repo. Do not edit by hand: edit card.json and regenerate. Builders read this card; critics keep reading the full standards and RUBRIC.`, '');
    if (cfg.summary) L.push(cfg.summary, '');

    // 1
    L.push('## 1. What it teaches', '');
    if (cfg.teaches) L.push(cfg.teaches, '');
    const sk = cfg.skills || {};
    L.push(`**Skills on this ${cfg.kind === 'template' ? 'template' : 'family'}** (${d.skills.length}; ${sk.printFormats ? `\`design/SKILL_CATALOGUE.md\` print formats \`${sk.printFormats}\`` : 'listed in card.json'}${(sk.include || []).length ? ` + ${sk.include.length} listed` : ''}${(sk.excludeCategories || []).length ? `, without the mixed pools ${sk.excludeCategories.join(', ')}` : ''}):`, '');
    L.push(...compactSkills(d.skills, d.labels), '');
    L.push(`**CCSS** (SKILL_STANDARDS of those skills): ${d.standards.ccss.join(', ') || '(none)'}`, '');
    L.push(`**Essential Elements:** ${d.standards.ee.join(', ') || '(none)'}`, '');
    L.push(`**WRM small steps** (SKILL_WRM): ${d.wrm.join(', ') || '(none)'}`, '');

    // 2
    L.push('## 2. Problem types and progression', '');
    if (cfg.research) L.push(`*${cfg.research}*`, '');
    if ((cfg.problemTypes || []).length) { L.push('**Problem types**', ''); L.push(...bullets(cfg.problemTypes), ''); }
    if ((cfg.progression || []).length) { L.push('**Progression** (one new thing per step, P-1)', ''); cfg.progression.forEach((p, i) => L.push(`${i + 1}. ${p}`)); L.push(''); }
    if (d.buildEntries.length) {
        L.push('**Build-list entries on this template** (`js/modules/build-list.js` / `build-specs.js`; full specs in `design/BUILD_LIST.md`)', '');
        for (const e of d.buildEntries) {
            L.push(`- \`${e.id}\` (${e.kind}) ${e.name} — host \`${e.skill}\`${e.standards.length ? `; ${e.standards.join(', ')}` : ''}${e.ladder ? `; ladder ${e.ladder}` : ''}`);
        }
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
    L.push(`Excerpts from the rule-id index (\`${INDEX_REL}\`, sha \`${idx.indexSha.slice(0, 12)}\`). Rules marked ✱ are quoted in full; the rest are cut at a sentence (the group's limit) — open the file for the whole rule. An id written \`ID@SRC\` is defined in more than one standard.`, '');
    for (const g of groups) {
        L.push(`**${g.title}**`, '');
        for (const ref of g.refs) {
            const es = resolveRef(idx, ref);
            if (!es.length) { L.push(`- **${ref}** — NOT IN THE INDEX (fix card.json)`); continue; }
            for (const e of es) {
                const full = g.full || fullSet.has(ref) || fullSet.has(e.key);
                L.push(`- **${es.length > 1 ? e.key : ref}**${full ? ' ✱' : ''} (${e.src}) ${cardExcerpt(e, full, g.chars)}`);
            }
        }
        L.push('');
    }

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

    // 7
    L.push('## 7. Options and presets', '');
    for (const n of cfg.options || []) L.push(`- ${n}`);
    if ((cfg.options || []).length) L.push('');
    if (d.options.length) {
        L.push(`**Options declared today** (\`js/modules/skill-options.js\`, on the ${d.skills.length} skills above):`, '');
        for (const o of d.options) L.push(`- \`${o.id}\` "${o.label}" — ${o.values.length ? o.values.join(' / ') : 'free'} (${o.skills} skill${o.skills === 1 ? '' : 's'})`);
        L.push('');
    }
    L.push(`**Preset skills on these hosts** (\`js/modules/skill-presets.js\`): ${d.presets.length ? d.presets.map((p) => `\`${p.key}\` → \`${p.host}\` ${JSON.stringify(p.opts)}`).join('; ') : '(none)'}`, '');

    // 8
    L.push('## 8. Gates', '');
    for (const g of d.gates) L.push(`- \`${g.cmd}\`${g.exists ? '' : ' — PLANNED (not in the repo yet)'}${g.note ? ` — ${g.note}` : ''}`);
    L.push('');

    // 9
    L.push('## 9. Open questions (recommended answers)', '');
    (cfg.openQuestions || []).forEach((q, i) => L.push(`${i + 1}. **${q.q}** Recommended: ${q.recommended}`));
    if (!(cfg.openQuestions || []).length) L.push('(none)');
    L.push('');
    L.push(signedLine);
    L.push('');
    return { text: L.join('\n'), meta, missingRules };
}

/** Parse a card file: its machine block, its section-4 rule refs and its Signed line. */
export function readCard(text) {
    const m = /^<!-- spec-card\n([\s\S]*?)\n-->/.exec(text);
    if (!m) return null;
    const raw = m[1].replace(/- -/g, '--');
    let meta;
    try { meta = JSON.parse(raw); } catch {   // the current form: a header line, then the cited ids and the rule shas
        const parts = raw.split('\n');
        try { meta = { ...JSON.parse(parts[0]), ...JSON.parse(parts.slice(1).join('\n')) }; } catch { return null; }
    }
    const lines = text.split('\n');
    const signed = [...lines].reverse().find((l) => /^Signed: /.test(l)) || '';
    const s4 = /## 4\. Rules that apply\n([\s\S]*?)\n## 5\./.exec(text);
    const onCard = new Set();
    if (s4) for (const mm of s4[1].matchAll(/^- \*\*([^*\s]+)\*\*/gm)) onCard.add(mm[1]);
    return { meta, signed, isSigned: SIGNED_RE.test(signed), onCard: [...onCard] };
}

/** Compare two cards ignoring the Signed line and the index sha (the index moves when any rule anywhere changes). */
function cardBody(text) {
    return text.split('\n').filter((l) => !/^Signed: /.test(l)).join('\n')
        .replace(/"indexSha":"[0-9a-f]+"/, '"indexSha":""').replace(/sha `[0-9a-f]{12}`/, 'sha ``');
}

/**
 * Generate (or regenerate) one card. Returns {ok, msg, path}.
 * A signed card whose content would change is refused unless resign; then it is written unsigned.
 */
export async function generateCard(root, id, kind, { resign = false, sources = SOURCES, derive = deriveFromRepo, findingsPath = null } = {}) {
    const p = cardPaths(root, id);
    if (!fs.existsSync(p.cfg)) return { ok: false, msg: `no config ${rel(root, p.cfg)}` };
    const cfg = JSON.parse(fs.readFileSync(p.cfg, 'utf8'));
    if (cfg.id !== id) return { ok: false, msg: `card.json id "${cfg.id}" does not match "${id}"` };
    if (cfg.kind !== kind) return { ok: false, msg: `card.json kind is "${cfg.kind}", not "${kind}" (use --${cfg.kind})` };
    const idx = currentIndex(root, sources);
    const d = await derive(root, cfg, idx);
    const f = readFindings(root, findingsPath);
    const tplId = cfg.template ? cfg.template.id : null;
    const match = { templates: (cfg.findingsMatch && cfg.findingsMatch.templates) || (tplId ? [tplId] : []), families: (cfg.findingsMatch && cfg.findingsMatch.families) || cfg.families || [] };
    const cited = f.rows ? citedIds(findingsFor(f.rows, match)) : [];
    const old = fs.existsSync(p.md) ? fs.readFileSync(p.md, 'utf8') : null;
    const oldCard = old ? readCard(old) : null;
    const wasSigned = !!(oldCard && oldCard.isSigned);
    let { text, missingRules } = renderCard(cfg, d, idx, { signedLine: wasSigned ? oldCard.signed : UNSIGNED, cited });
    if (missingRules.length) return { ok: false, msg: `card.json names rules not in the index: ${missingRules.join(', ')}` };
    let note = '';
    if (wasSigned && cardBody(old) !== cardBody(text)) {
        if (!resign) return { ok: false, msg: `${rel(root, p.md)} is SIGNED (${oldCard.signed}) and its content would change; nothing written. Re-run with --resign to reset it to unsigned for the owner to sign again.` };
        text = renderCard(cfg, d, idx, { signedLine: UNSIGNED, cited }).text;
        note = ' — the signature was RESET (--resign): the owner must sign it again';
    } else if (wasSigned) {
        note = ` — still signed (${oldCard.signed.replace(/^Signed: /, '')}); content unchanged`;
    }
    fs.mkdirSync(p.dir, { recursive: true });
    if (old !== text) fs.writeFileSync(p.md, text);
    return { ok: true, path: p.md, msg: `${old === text ? 'unchanged' : 'wrote'} ${rel(root, p.md)} (${Buffer.byteLength(text)} bytes, ${Object.keys(readCard(text).meta.rules).length} rule refs)${note}` };
}

/* ================================================================ checks */

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
        const rows = findingsFor(f.rows, card.meta.match || { templates: [card.meta.template].filter(Boolean), families: card.meta.families });
        const cited = citedIds(rows);
        const known = new Set(idx.rules.map((r) => r.id));
        const keys = new Set(idx.rules.map((r) => r.key));
        const onCardIds = new Set(card.onCard.map(refId));
        const missing = [], unknown = [];
        for (const id of cited) {
            if (!known.has(refId(id)) && !keys.has(id)) { unknown.push(id); continue; }
            if (!onCardIds.has(refId(id)) && !card.onCard.includes(id)) missing.push(id);
        }
        if (missing.length) {
            ok = false;
            for (const id of missing) {
                const where = rows.filter((r) => splitList(String(r.rule_ids).replace(/,/g, ';')).includes(id)).map((r) => `${r.report}${r.defect_id ? `#${r.defect_id}` : ''}`);
                lines.push(`FAIL ${name}: ${id} was cited by a critic (${[...new Set(where)].slice(0, 4).join(', ')}) but is not in section 4`);
            }
        }
        if (unknown.length) lines.push(`WARN ${name}: unknown ids cited in ${f.file} (not in the rule index — typos?): ${unknown.join(', ')}`);
        const since = cited.filter((id) => !(card.meta.citedAtGeneration || []).includes(id));
        if (since.length) lines.push(`NOTE ${name}: ids cited since the card was generated: ${since.join(', ')}`);
        lines.push(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${rows.length} findings for ${[...(card.meta.match.templates || []), ...(card.meta.match.families || [])].join('/')}, ${cited.length} distinct ids cited, ${missing.length} missing from the card, ${Object.keys(card.meta.rules).length} card rules checked against the index`);
    }
    if (!f.rows) lines.push(`${ok ? 'ok  ' : 'FAIL'} ${name}: ${Object.keys(card.meta.rules).length} card rules checked against the index`);
    return { ok, lines };
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

export function checkSigned(cardFile) {
    const card = readCard(fs.readFileSync(cardFile, 'utf8'));
    if (!card) return { ok: false, msg: 'no spec-card block' };
    return card.isSigned ? { ok: true, msg: card.signed } : { ok: false, msg: `not signed (${card.signed || 'no Signed line'}) — the build may not start` };
}

/* ================================================================ self-test */

async function selfTest() {
    const results = [];
    const t = (name, cond) => { results.push({ name, ok: !!cond }); };
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
            ruleGroups: [{ title: 'Core', rules: ['VA-1', 'P-6', 'H1'] }], fullRules: ['VA-1'],
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
        ].join('\n');
        fs.writeFileSync(path.join(root, 'findings.csv'), csv);
        const noDerive = async (r, c, idx) => ({ skills: ['addition:add'], labels: {}, standards: { ccss: ['2.NBT.B.5'], ee: [] }, wrm: [], buildEntries: [], options: [], presets: [], sourceRules: [], capacity: [], gates: [{ cmd: 'node tests/scripts/ws-precritic.cjs --template stack', exists: false }] });
        const opts = { sources: SRC, derive: noDerive, findingsPath: 'findings.csv' };
        const g1 = await generateCard(root, 'mini', 'template', opts);
        const md = path.join(cdir, 'mini.md');
        const c1 = fs.readFileSync(md, 'utf8');
        const g1b = await generateCard(root, 'mini', 'template', opts);
        t('card generation is byte-identical on re-run', g1.ok && g1b.ok && c1 === fs.readFileSync(md, 'utf8'));
        t('card has the nine sections and ends unsigned', [1, 2, 3, 4, 5, 6, 7, 8, 9].every((n) => c1.includes(`\n## ${n}. `)) && c1.trimEnd().endsWith(UNSIGNED));
        const cov1 = checkCoverage(root, md, { sources: SRC, findingsPath: 'findings.csv' });
        t('coverage FAILS when a cited id (VA-2) is missing from the card', !cov1.ok && cov1.lines.some((l) => /VA-2 was cited/.test(l)));
        t('coverage ignores other templates/families (VA-9 not demanded)', !cov1.lines.some((l) => /VA-9 was cited/.test(l)));
        t('unknown cited id (ZZ-99) is a warning', cov1.lines.some((l) => /^WARN .*unknown ids.*ZZ-99/.test(l)));
        cfg.ruleGroups[0].rules.push('VA-2');
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
        // 4. signing
        t('check-signed refuses an unsigned card', !checkSigned(md).ok);
        const signedText = fs.readFileSync(md, 'utf8').replace(UNSIGNED, 'Signed: owner, 2026-10-24');
        fs.writeFileSync(md, signedText);
        t('check-signed accepts a signed card', checkSigned(md).ok);
        const g2 = await generateCard(root, 'mini', 'template', opts);
        t('regenerating an unchanged signed card keeps the signature', g2.ok && fs.readFileSync(md, 'utf8') === signedText);
        cfg.openQuestions.push({ q: 'A new question?', recommended: 'yes' });
        fs.writeFileSync(path.join(cdir, 'card.json'), JSON.stringify(cfg, null, 1));
        const g3 = await generateCard(root, 'mini', 'template', opts);
        t('a signed card is NOT overwritten when its content would change', !g3.ok && fs.readFileSync(md, 'utf8') === signedText);
        const g4 = await generateCard(root, 'mini', 'template', { ...opts, resign: true });
        const after = fs.readFileSync(md, 'utf8');
        t('--resign rewrites it unsigned and says so', g4.ok && /RESET/.test(g4.msg) && after.trimEnd().endsWith(UNSIGNED) && after.includes('A new question?'));
        t('a missing findings file is a warning, or a FAIL with --require-findings',
            checkCoverage(root, md, { sources: SRC, findingsPath: 'nope.csv' }).ok && !checkCoverage(root, md, { sources: SRC, findingsPath: 'nope.csv', requireFindings: true }).ok);
        t('CSV parser handles quoted commas', parseCsv(csv)[0].summary === 'key wrong, on page 2');
    } finally {
        fs.rmSync(root, { recursive: true, force: true });
    }
    for (const r of results) console.log(`${r.ok ? 'ok  ' : 'FAIL'} ${r.name}`);
    const bad = results.filter((r) => !r.ok).length;
    return { ok: !bad, msg: `${results.length - bad}/${results.length} self-test checks` };
}

/* ================================================================ CLI */

async function main(argv) {
    const has = (f) => argv.includes(f);
    const val = (f) => { const i = argv.indexOf(f); return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[i + 1] : null; };
    const findingsPath = val('--findings');
    if (has('--self-test')) return selfTest();
    if (has('--index')) {
        const r = runIndex(REPO, { check: has('--check') });
        if (r.idx.totals.collisions || r.idx.totals.duplicates) console.log(`note: ${r.idx.totals.collisions} cross-file collisions, ${r.idx.totals.duplicates} in-file duplicates, ${r.idx.totals.nearCollisions} near-collisions (see ${INDEX_MD_REL})`);
        return r;
    }
    for (const kind of ['template', 'family']) {
        if (has(`--${kind}`)) {
            const id = val(`--${kind}`);
            if (!id) return { ok: false, msg: `--${kind} needs an id` };
            return generateCard(REPO, id, kind, { resign: has('--resign'), findingsPath });
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
        if (!target) return { ok: false, msg: '--check-signed needs a card path' };
        const r = checkSigned(path.resolve(REPO, target));
        return { ok: r.ok, msg: `${target}: ${r.msg}` };
    }
    console.log('usage: --index [--check] | --template <id> | --family <id> [--resign] | --check-coverage <card>|--all [--findings f] [--require-findings] | --check-signed <card> | --self-test');
    return { ok: false, msg: 'no mode given' };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    main(process.argv.slice(2)).then((r) => {
        console.log(`ws-spec-card: ${r.ok ? 'OK' : 'FAIL'} — ${r.msg}`);
        process.exit(r.ok ? 0 : 1);
    }, (e) => {
        console.error(e && e.stack || e);
        console.log('ws-spec-card: FAIL — crashed');
        process.exit(1);
    });
}
