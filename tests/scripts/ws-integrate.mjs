#!/usr/bin/env node
// ws-integrate — the lane-manifest integrator (IMPROVEMENT_PLAN §1.6.6, step E5).
//
// No lane edits a shared registry file. Each lane writes design/lanes/<lane>/manifest.json (format:
// design/lanes/README.md and design/lanes/manifest.schema.json); this tool applies the manifests in
// merge order. Every operation it performs on a shared file is an INSERTION of whole lines at a named
// anchor, so share codes stay append-only: an existing line is never edited, moved or removed (the one
// exception is the comma a "$end" insertion adds after a registry's last entry when it has none).
//
//   node tests/scripts/ws-integrate.mjs --apply [--lanes a,b] [--order merge|file] [--manifests <dir>]
//        apply the lanes' manifests to the tree. Idempotent: a manifest already applied is a no-op.
//        Refuses: a skill id that exists with different data, a code already pinned, a SKILLS insertion
//        that is not at the end of its category, anything that moves an existing share code or
//        positional index, a manifest that drops or reorders skills it applied before (the ledger,
//        design/lanes/applied.json, or --ledger <file>), unknown fields (there is no "remove").
//   node tests/scripts/ws-integrate.mjs --apply --preview      apply in a scratch copy, print the diff stat
//   node tests/scripts/ws-integrate.mjs --extract (--skills cat:id,... | --since <commit> | --cut <code>)
//        --out <dir> [--group pins] [--lane <name>]
//        build manifests from entries already in the tree (the dry run, and onboarding a lane). The
//        manifest carries the skills' DATA plus a `layout` section with the exact text of each block,
//        so re-applying reproduces the files byte for byte. --group pins writes one manifest per
//        share-code pin section of skill-codes-frozen.js, in pin order.
//   node tests/scripts/ws-integrate.mjs --peel --manifests <dir> --root <scratch tree>
//        the inverse of --apply for extracted manifests (removes their blocks). Refused on the real
//        repository root: it exists only to make the dry run's base.
//   node tests/scripts/ws-integrate.mjs --regen [--no-catalogue]
//        ws-standards --report, ws-wrm --report-only, ws-catalogue (browser), ws-status-index (if
//        present). The lesson registry has no generator yet (js/modules/lessons/detailed/index.js is
//        written by --apply directly); the run says so.
//   node tests/scripts/ws-integrate.mjs --stamp
//        runs ws-stamp-assets ONLY when passed explicitly; refused with --dry-run, --self-test, --preview
//        and --peel. Lanes never stamp; the deploy does, once.
//   node tests/scripts/ws-integrate.mjs --dry-run [--cut T6] [--no-browser] [--keep] [--record <file>]
//        THE GATE: in a temporary git worktree of HEAD, extract manifests for every skill pinned from
//        --cut on, peel them out of the shared files (the base must still parse), re-apply them in merge
//        order, require `git diff --exit-code` empty, re-apply again (idempotent), then run
//        ws-code-snapshot, ws-standards, ws-search-terms and ws-presets-unit (browser) in the rebuilt
//        worktree. The main working tree is never modified.
//   node tests/scripts/ws-integrate.mjs --self-test
//        seeded fixtures in a temp dir (append-only, idempotence, merge order = combined manifest,
//        conflicting duplicate id, reorder / delete refused, --stamp refused in dry-run, round trip).
//   --root <dir>   the tree to work on (default: the repository this script is in)
//
// Output convention: last line `ws-integrate: OK` or `ws-integrate: FAIL`, non-zero exit on FAIL.
// No dependencies beyond node and git.

import { readFileSync, writeFileSync, existsSync, mkdirSync, mkdtempSync, rmSync, readdirSync, cpSync, symlinkSync, statSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { createHash } from 'node:crypto';

const SELF = fileURLToPath(import.meta.url);
const REPO = resolve(dirname(SELF), '..', '..');
const SCHEMA_VERSION = 1;

// ============================================================================ arguments
const argv = process.argv.slice(2);
const flag = (f) => argv.includes(f);
const opt = (f, d = null) => { const i = argv.indexOf(f); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };

class IntegrateError extends Error {}
const fail = (msg) => { throw new IntegrateError(msg); };

// ============================================================================ the JS literal scanner
// Enough of JavaScript to walk a data literal: strings, template literals, comments, regex literals and
// bracket depth. Returns the top-level items of the `{...}` or `[...]` that opens at `open`.
function skipString(src, i) {
    const q = src[i];
    for (i++; i < src.length; i++) {
        if (src[i] === '\\') { i++; continue; }
        if (src[i] === q) return i + 1;
        if (src[i] === '\n') fail(`unterminated string at ${i}`);
    }
    fail('unterminated string');
}
function skipTemplate(src, i) {
    for (i++; i < src.length; i++) {
        if (src[i] === '\\') { i++; continue; }
        if (src[i] === '`') return i + 1;
        if (src[i] === '$' && src[i + 1] === '{') {
            let depth = 1; i += 2;
            while (i < src.length && depth) {
                const c = src[i];
                if (c === '"' || c === "'") { i = skipString(src, i); continue; }
                if (c === '`') { i = skipTemplate(src, i); continue; }
                if (c === '{') depth++;
                else if (c === '}') depth--;
                i++;
            }
            i--;
        }
    }
    fail('unterminated template');
}
function skipRegex(src, i) {
    let inClass = false;
    for (i++; i < src.length; i++) {
        const c = src[i];
        if (c === '\\') { i++; continue; }
        if (c === '\n') fail(`unterminated regex at ${i}`);
        if (inClass) { if (c === ']') inClass = false; continue; }
        if (c === '[') { inClass = true; continue; }
        if (c === '/') { i++; while (/[a-z]/.test(src[i] || '')) i++; return i; }
    }
    fail('unterminated regex');
}
const REGEX_PREV = new Set(['(', ',', '=', ':', '[', '!', '&', '|', '?', '{', ';', '}']);

function scanLiteral(src, open) {
    const isObj = src[open] === '{';
    const closeCh = isObj ? '}' : ']';
    const items = [];
    const stack = [];
    let i = open + 1, itemStart = -1, colon = -1, lastSigEnd = -1, prev = src[open];
    const push = (end, hasComma) => {
        const valueEnd = lastSigEnd;
        const it = { start: itemStart, end, valueEnd, hasComma };
        if (isObj) {
            if (colon < 0) fail(`object item without a key at ${itemStart}: ${src.slice(itemStart, valueEnd).slice(0, 60)}`);
            it.keyText = src.slice(itemStart, colon).trim();
            it.valueStart = colon + 1;
            while (/\s/.test(src[it.valueStart])) it.valueStart++;
            it.valueText = src.slice(it.valueStart, valueEnd);
        } else {
            it.valueStart = itemStart;
            it.valueText = src.slice(itemStart, valueEnd);
        }
        items.push(it);
    };
    while (i < src.length) {
        const c = src[i];
        if (c === '/' && src[i + 1] === '/') { const n = src.indexOf('\n', i); i = n < 0 ? src.length : n; continue; }
        if (c === '/' && src[i + 1] === '*') { const n = src.indexOf('*/', i + 2); if (n < 0) fail('unterminated comment'); i = n + 2; continue; }
        if (/\s/.test(c)) { i++; continue; }
        if (!stack.length) {
            if (c === closeCh) {
                if (itemStart >= 0) push(lastSigEnd, false);
                return { open, close: i, isObj, items };
            }
            if (c === ',') { if (itemStart < 0) fail(`empty item at ${i}`); push(i + 1, true); itemStart = -1; colon = -1; prev = ','; i++; continue; }
            if (itemStart < 0) itemStart = i;
            if (c === ':' && isObj && colon < 0) { colon = i; prev = ':'; i++; continue; }
        }
        if (c === '"' || c === "'") { i = skipString(src, i); lastSigEnd = i; prev = 'a'; continue; }
        if (c === '`') { i = skipTemplate(src, i); lastSigEnd = i; prev = 'a'; continue; }
        if (c === '/' && REGEX_PREV.has(prev)) { i = skipRegex(src, i); lastSigEnd = i; prev = 'a'; continue; }
        if (c === '(' || c === '[' || c === '{') stack.push(c);
        else if (c === ')' || c === ']' || c === '}') { if (!stack.length) fail(`unbalanced ${c} at ${i}`); stack.pop(); }
        prev = /[\w$]/.test(c) ? 'a' : c;
        lastSigEnd = i + 1;
        i++;
    }
    fail('unterminated literal');
}

// ---------------------------------------------------------------------------- lines
function lineIndex(src) {
    const starts = [0];
    for (let i = 0; i < src.length; i++) if (src[i] === '\n') starts.push(i + 1);
    const lineOf = (pos) => { let lo = 0, hi = starts.length - 1; while (lo < hi) { const m = (lo + hi + 1) >> 1; if (starts[m] <= pos) lo = m; else hi = m - 1; } return lo; };
    return { starts, lineOf, count: starts.length };
}

const unquote = (k) => {
    if (/^(['"]).*\1$/s.test(k)) return Function(`"use strict"; return (${k});`)();
    return k;
};
const evalValue = (text) => Function(`"use strict"; return (${text});`)();
const isJsonSafe = (v) => {
    try { return stable(JSON.parse(JSON.stringify(v))) === stable(v); } catch { return false; }
};
function stable(v) {
    if (v instanceof RegExp) return `RegExp(${v.source}/${v.flags})`;
    if (Array.isArray(v)) return `[${v.map(stable).join(',')}]`;
    if (v && typeof v === 'object') return `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${stable(v[k])}`).join(',')}}`;
    if (v === undefined) return 'undefined';
    if (typeof v === 'function') return 'function';
    return JSON.stringify(v);
}
const sameSet = (a, b) => stable([...a].sort()) === stable([...b].sort());

// ============================================================================ the registries
// Each registry the integrator owns: where it is, how an item maps to a skill, and how a manifest field
// renders as a line. `field` is the manifest skill field; `keyForm` says how the item is keyed.
const F_DATA = 'js/modules/data.js';
const REGISTRIES = [
    { id: 'skills', file: F_DATA, name: 'SKILLS', nested: true, field: 'entry', keyForm: 'v' },
    { id: 'grades', file: F_DATA, name: 'SKILL_GRADES', field: 'grade', keyForm: 'bare', quote: "'" },
    { id: 'timeCategory', file: F_DATA, name: 'SKILL_TIME_CATEGORY', field: 'timeCategory', keyForm: 'bare', quote: '' },
    { id: 'printSize', file: F_DATA, name: 'SKILL_PRINT_SIZE', field: 'printSize', keyForm: 'bare', quote: '' },
    { id: 'mixedPoolExclude', file: F_DATA, name: 'MIXED_POOL_EXCLUDE', field: 'mixedPoolExclude', keyForm: 'pool' },
    { id: 'codes', file: 'js/modules/skill-codes-frozen.js', name: 'FROZEN_SKILL_CODES', field: 'code', keyForm: 'full', quote: '"' },
    { id: 'presets', file: 'js/modules/skill-presets.js', name: 'SKILL_PRESETS', field: 'preset', keyForm: 'full', quote: "'" },
    { id: 'standards', file: 'js/modules/standards.js', name: 'SKILL_STANDARDS', field: 'standards', keyForm: 'full', quote: "'" },
    { id: 'wrm', file: 'js/modules/wrm.js', name: 'SKILL_WRM', field: 'wrm', keyForm: 'full', quote: "'" },
    { id: 'terms', file: 'js/modules/search-terms.js', name: 'SKILL_TERMS', field: 'terms', keyForm: 'full', quote: "'" },
    { id: 'primary', file: 'js/modules/search-terms.js', name: 'PRIMARY_SKILLS', field: 'primaryTerms', keyForm: 'full', quote: "'" },
    { id: 'concepts', file: 'js/modules/search-terms.js', name: 'CONCEPT_RULES', field: 'concepts', keyForm: 'rule' },
    { id: 'dispatch', file: 'js/modules/generate-question.js', name: 'skillCategoryOverride', field: 'generatorCategory', keyForm: 'bare', quote: "'" },
    { id: 'providers', file: 'js/modules/sheet/providers/index.js', imports: 'side', top: 'providers' },
    { id: 'lessonImports', file: 'js/modules/lessons/detailed/index.js', imports: 'default', top: 'lessons' },
    { id: 'lessonEntries', file: 'js/modules/lessons/detailed/index.js', name: 'DETAILED_LESSONS', keyForm: 'computed', top: 'lessons' },
];
const REG = Object.fromEntries(REGISTRIES.map((r) => [r.id, r]));
const SKILL_FIELDS = new Set(['key', 'entry', 'keys', ...REGISTRIES.filter((r) => r.field && r.field !== 'entry').map((r) => r.field)]);
const MANIFEST_FIELDS = new Set(['$schema', 'version', 'lane', 'mergeOrder', 'description', 'skills', 'providers', 'lessons', 'layout']);

// Find a registry's region(s) in a file's source. A region = {sub, open, close, items, openLine, closeLine}.
function locate(reg, src) {
    if (reg.imports) return [locateImports(reg, src)];
    const re = new RegExp(`(?:^|\\n)[ \\t]*(?:export\\s+)?const\\s+${reg.name}\\s*=\\s*`, 'g');
    const m = re.exec(src);
    if (!m) fail(`${reg.file}: cannot find const ${reg.name}`);
    if (re.exec(src)) fail(`${reg.file}: const ${reg.name} appears twice`);
    // the literal itself, or the one inside `Object.freeze(`
    let p = m.index + m[0].length;
    const lead = src.slice(p, p + 40).match(/^(Object\.freeze\(\s*)?[{[]/);
    if (!lead) fail(`${reg.file}: ${reg.name} is not a plain literal`);
    p += lead[0].length - 1;
    const lit = scanLiteral(src, p);
    const L = lineIndex(src);
    const regionOf = (l, sub) => {
        const openLine = L.lineOf(l.open), closeLine = L.lineOf(l.close);
        for (const it of l.items) { it.startLine = L.lineOf(it.start); it.endLine = L.lineOf(it.end - 1); }
        if (l.items.length && (l.items[0].startLine === openLine || l.items[l.items.length - 1].endLine === closeLine)) return { sub, inline: true, ...l, openLine, closeLine, L };
        return { sub, ...l, openLine, closeLine, L };
    };
    if (!reg.nested) return [regionOf(lit, '')];
    return lit.items.map((cat) => {
        const sub = unquote(cat.keyText);
        let q = cat.valueStart;
        if (src[q] !== '[') fail(`SKILLS.${sub} is not an array literal`);
        return regionOf(scanLiteral(src, q), sub);
    });
}
function locateImports(reg, src) {
    const L = lineIndex(src);
    const lines = src.split('\n');
    const re = reg.imports === 'side' ? /^import\s+'([^']+)';\s*(\/\/.*)?$/ : /^import\s+([A-Za-z_$][\w$]*)\s+from\s+'([^']+)';\s*(\/\/.*)?$/;
    const idx = lines.map((l, i) => (re.test(l) ? i : -1)).filter((i) => i >= 0);
    if (!idx.length) fail(`${reg.file}: no import lines`);
    const first = idx[0], last = idx[idx.length - 1];
    const items = idx.map((i) => {
        const m = lines[i].match(re);
        const key = reg.imports === 'side' ? m[1] : m[2];
        return { start: L.starts[i], end: L.starts[i] + lines[i].length, valueEnd: L.starts[i] + lines[i].length, hasComma: true, keyText: JSON.stringify(key), valueText: reg.imports === 'side' ? key : m[1], startLine: i, endLine: i, importBinding: reg.imports === 'side' ? null : m[1] };
    });
    return { sub: '', imports: true, items, openLine: first - 1, closeLine: last + 1, open: L.starts[first], close: L.starts[last] + lines[last].length, L };
}

// The key an item is known by (the anchor name).
function itemKey(reg, it) {
    if (reg.id === 'skills') return evalValue(it.valueText).v;
    if (reg.id === 'concepts') {
        const inner = it.valueText.startsWith('[') ? scanLiteral(it.valueText, 0).items : [];
        if (!inner.length || !inner[0].valueText.startsWith('/')) fail(`CONCEPT_RULES item is not [/re/, ...]: ${it.valueText.slice(0, 60)}`);
        return inner[0].valueText;
    }
    if (reg.imports) return unquote(it.keyText);
    if (reg.keyForm === 'computed') return it.keyText;
    return unquote(it.keyText);
}

// ============================================================================ the tree model
function readTree(root) {
    const files = {};
    const get = (f) => {
        if (!(f in files)) { const p = join(root, f); files[f] = existsSync(p) ? readFileSync(p, 'utf8') : null; }
        return files[f];
    };
    return { root, get, files };
}
// Parse every registry: {regId: [{region, items:[{it, key, value?}]}]}
function parseRegistries(tree, which = REGISTRIES) {
    const out = {};
    for (const reg of which) {
        const src = tree.get(reg.file);
        if (src == null) { out[reg.id] = null; continue; }
        out[reg.id] = locate(reg, src).map((region) => ({ region, items: region.items.map((it) => ({ it, key: itemKey(reg, it) })) }));
    }
    return out;
}
const valueOf = (it) => { if (!('_v' in it)) { try { it._v = evalValue(it.valueText); } catch (e) { it._v = { __unevaluable: String(e.message) }; } } return it._v; };

// Live skills from the parsed SKILLS registry: [{cat, v, l, key, entry}]
function liveSkills(parsed) {
    const out = [];
    for (const { region, items } of parsed.skills) for (const { it } of items) { const e = valueOf(it); out.push({ cat: region.sub, v: e.v, l: e.l, key: `${region.sub}:${e.v}`, entry: e }); }
    return out;
}

// ============================================================================ manifest -> expected entries
// For one manifest: per registry, the entries it must contribute: {reg, sub, key, value, skill}.
function expectedEntries(man) {
    const out = [];
    const add = (regId, sub, key, value, skill) => out.push({ reg: REG[regId], sub, key, value, skill });
    const pools = new Map();
    for (const s of man.skills || []) {
        const [cat, id] = s.key.split(':');
        const keyFor = (regId) => (s.keys && s.keys[regId]) || (REG[regId].keyForm === 'bare' ? id : s.key);
        add('skills', cat, id, s.entry, s);
        for (const reg of REGISTRIES) {
            if (!reg.field || reg.field === 'entry' || !(reg.field in s)) continue;
            if (reg.id === 'mixedPoolExclude') { for (const p of s[reg.field]) { if (!pools.has(p)) pools.set(p, []); pools.get(p).push({ id, s }); } continue; }
            if (reg.id === 'concepts') { add('concepts', '', s.key, s.concepts, s); continue; }
            add(reg.id, '', keyFor(reg.id), s[reg.field], s);
        }
    }
    for (const [p, list] of pools) add('mixedPoolExclude', '', p, list.map((x) => x.id), list[0].s);
    for (const mod of man.providers || []) add('providers', '', mod, mod, null);
    for (const l of man.lessons || []) { add('lessonImports', '', l.module, l.binding, null); add('lessonEntries', '', `[${l.binding}.id]`, l.binding, null); }
    return out;
}

// ---------------------------------------------------------------------------- canonical rendering
const IDENT = /^[A-Za-z_$][\w$]*$/;
function jsLit(v, q = "'") {
    if (typeof v === 'string') return q + v.replace(/\\/g, '\\\\').replace(new RegExp(q, 'g'), '\\' + q).replace(/\n/g, '\\n') + q;
    if (typeof v === 'number' || typeof v === 'boolean' || v === null) return String(v);
    if (Array.isArray(v)) return `[${v.map((x) => jsLit(x, q)).join(', ')}]`;
    const ks = Object.keys(v);
    if (!ks.length) return '{}';
    return `{ ${ks.map((k) => `${IDENT.test(k) ? k : jsLit(k, q)}: ${jsLit(v[k], q)}`).join(', ')} }`;
}
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&');
function renderLine(e, ind) {
    const { reg, key, value, skill } = e;
    switch (reg.id) {
        case 'skills': return `${ind}${jsLit(value, '"')},`;
        case 'concepts': return `${ind}[/^${escRe(skill.key)}$/, ${jsLit(value)}],`;
        case 'standards': return `${ind}'${key}': ${jsLit(value)}, // ${skill.entry.l}`;
        case 'mixedPoolExclude': return `${ind}${IDENT.test(key) ? key : jsLit(key)}: ${jsLit(value)},`;
        case 'providers': return `import '${key}';`;
        case 'lessonImports': return `import ${value} from '${key}';`;
        case 'lessonEntries': return `${ind}${key}: ${value},`;
        default: {
            const k = reg.quote === '' && IDENT.test(key) ? key : jsLit(key, reg.quote || "'");
            return `${ind}${k}: ${jsLit(value, reg.id === 'codes' || reg.quote === '' ? '"' : "'")},`;
        }
    }
}

// Does a parsed item carry the expected entry's data?
function itemMatches(e, item, ctx) {
    const reg = e.reg;
    if (reg.id === 'concepts') return null; // checked semantically
    if (reg.imports) return item.key === e.key && (reg.imports === 'side' || item.it.importBinding === e.value);
    if (reg.id === 'lessonEntries') return item.key === e.key && item.it.valueText.trim() === e.value;
    if (item.key !== e.key) return false;
    const v = valueOf(item.it);
    if (reg.id === 'mixedPoolExclude') return Array.isArray(v) && sameSet(v, e.value);
    return stable(v) === stable(e.value);
}

// ============================================================================ apply
function regionFor(parsed, reg, sub) {
    const list = parsed[reg.id];
    if (!list) fail(`${reg.file} is missing`);
    const r = list.find((x) => x.region.sub === sub);
    if (!r) fail(reg.id === 'skills' ? `unknown category "${sub}" (a new category is not a manifest operation)` : `${reg.id}: no region ${sub}`);
    if (r.region.inline) fail(`${reg.file} ${reg.name}${sub ? '.' + sub : ''} is written on one line; cannot insert lines`);
    return r;
}
// Character offset where a block anchored `after` goes, plus any comma fix.
function insertionPoint(src, reg, r, after) {
    const { region, items } = r;
    const L = region.L;
    if (after === null) return { pos: L.starts[region.openLine + 1] };
    if (after === '$end') {
        if (!items.length) return { pos: L.starts[region.openLine + 1] };
        const last = items[items.length - 1].it;
        return { pos: L.starts[last.endLine + 1], comma: last.hasComma ? null : last.valueEnd };
    }
    const hits = items.filter((x) => x.key === after);
    if (hits.length !== 1) fail(`${reg.id}${region.sub ? '.' + region.sub : ''}: anchor "${after}" ${hits.length ? 'is not unique' : 'not found (apply the lanes it follows first)'}`);
    return { pos: L.starts[hits[0].it.endLine + 1], anchorItem: hits[0] };
}
function blockItems(reg, text, isObjLike) {
    if (reg.imports) return locateImports(reg, text).items.map((it) => ({ it, key: itemKey(reg, it) }));
    const wrapped = (isObjLike ? '{\n' : '[\n') + text + '\n' + (isObjLike ? '}' : ']');
    const lit = scanLiteral(wrapped, 0);
    return lit.items.map((it) => ({ it, key: itemKey(reg, it) }));
}

function loadManifest(file) {
    let man;
    try { man = JSON.parse(readFileSync(file, 'utf8')); } catch (e) { fail(`${file}: not JSON (${e.message})`); }
    validateManifest(man, file);
    return man;
}
function validateManifest(man, where) {
    const bad = (m) => fail(`${where}: ${m}`);
    if (!man || typeof man !== 'object') bad('not an object');
    for (const k of Object.keys(man)) if (!MANIFEST_FIELDS.has(k)) bad(`unknown field "${k}" (a manifest only adds; there is no remove, rename or move)`);
    if (man.version !== SCHEMA_VERSION) bad(`version must be ${SCHEMA_VERSION}`);
    if (typeof man.lane !== 'string' || !/^[a-z0-9][a-z0-9._-]*$/.test(man.lane)) bad('lane must be a lower-case name');
    if (!Number.isInteger(man.mergeOrder)) bad('mergeOrder must be an integer');
    const seen = new Set();
    for (const s of man.skills || []) {
        for (const k of Object.keys(s)) if (!SKILL_FIELDS.has(k)) bad(`skill ${s.key}: unknown field "${k}"`);
        if (!/^[a-z0-9_]+:[A-Za-z0-9_]+$/.test(s.key || '')) bad(`skill key "${s.key}" is not category:skill`);
        if (seen.has(s.key)) bad(`skill ${s.key} listed twice`);
        seen.add(s.key);
        if (!s.entry || s.entry.v !== s.key.split(':')[1] || typeof s.entry.l !== 'string') bad(`skill ${s.key}: entry must be the SKILLS row {v, l, ...} with v = the skill id`);
        if (!/^[A-HJ-NP-Z2-9]{2}$/.test(s.code || '')) bad(`skill ${s.key}: code must be its pinned 2-character share code (every new skill is pinned the moment it is added: an unpinned code depends on SKILLS order)`);
        for (const f of Object.keys(s)) if (!['key', 'keys'].includes(f) && !isJsonSafe(s[f])) bad(`skill ${s.key}: ${f} is not plain data`);
        if (s.keys) for (const [r, k] of Object.entries(s.keys)) { if (!REG[r] || REG[r].keyForm !== 'bare') bad(`skill ${s.key}: keys.${r} is not a bare-keyed registry`); if (k !== s.key) bad(`skill ${s.key}: keys.${r} may only be the full key`); }
    }
    for (const p of man.providers || []) if (!/^\.\/[\w.-]+\.js$/.test(p)) bad(`provider "${p}" must be ./<file>.js`);
    for (const l of man.lessons || []) if (!IDENT.test(l.binding || '') || !/^\.\/[\w.-]+\.js$/.test(l.module || '')) bad(`lesson ${JSON.stringify(l)} needs {binding, module: ./<id>.js}`);
    for (const b of man.layout || []) {
        if (!REG[b.registry]) bad(`layout: unknown registry ${b.registry}`);
        if (!(b.after === null || typeof b.after === 'string')) bad('layout: after must be a key, null (start) or "$end"');
        if (typeof b.text !== 'string' || !b.text.endsWith('\n')) bad('layout: text must be whole lines');
    }
}

function listManifests(dir, lanes) {
    if (!existsSync(dir)) return { picked: [], want: null };
    const out = [];
    for (const d of readdirSync(dir).sort()) {
        const f = join(dir, d, 'manifest.json');
        if (existsSync(f)) out.push({ dir: d, file: f, man: loadManifest(f) });
    }
    if (lanes) {
        const want = lanes.split(',').map((s) => s.trim()).filter(Boolean);
        for (const w of want) if (!out.some((m) => m.man.lane === w || m.dir === w)) fail(`no manifest for lane ${w} in ${dir}`);
        const picked = out.filter((m) => want.includes(m.man.lane) || want.includes(m.dir));
        return { picked, want };
    }
    return { picked: out, want: null };
}
function ordered(list, order, want) {
    if (order === 'file' && want) return want.map((w) => list.find((m) => m.man.lane === w || m.dir === w));
    return [...list].sort((a, b) => a.man.mergeOrder - b.man.mergeOrder || a.man.lane.localeCompare(b.man.lane));
}

// Snapshot of the share codes and positional indexes, read by importing the tree's data.js in a child.
function codeSnapshot(root) {
    const data = join(root, F_DATA);
    if (!existsSync(data)) return null;
    const script = `globalThis.localStorage={getItem:()=>null,setItem(){},removeItem(){}};console.log=()=>{};console.warn=()=>{};
const d=await import(${JSON.stringify(pathToFileURL(data).href)});
process.stdout.write(JSON.stringify({codes:d.SKILL_CODES,order:Object.fromEntries(Object.entries(d.SKILLS).map(([c,a])=>[c,a.map(s=>s.v)]))}));`;
    const r = spawnSync(process.execPath, ['--no-warnings', '--input-type=module', '-e', script], { encoding: 'utf8', maxBuffer: 64e6 });
    if (r.status !== 0) fail(`${F_DATA} does not import: ${(r.stderr || '').split('\n').slice(0, 4).join(' | ')}`);
    return JSON.parse(r.stdout);
}
function compareSnapshots(before, after) {
    const errs = [];
    for (const [k, c] of Object.entries(before.codes)) if (after.codes[k] !== c) errs.push(`share code of ${k} would move: ${c} -> ${after.codes[k]}`);
    for (const [cat, ids] of Object.entries(before.order)) ids.forEach((id, i) => { if ((after.order[cat] || [])[i] !== id) errs.push(`position ${cat}[${i}] ${id} would move`); });
    const seen = new Map();
    for (const [k, c] of Object.entries(after.codes)) { if (seen.has(c)) errs.push(`code ${c} would be shared by ${seen.get(c)} and ${k}`); seen.set(c, k); }
    return errs;
}

const hashOf = (s) => createHash('sha256').update(s).digest('hex').slice(0, 16);

// Apply one manifest to the in-memory tree. Returns {status: 'applied'|'noop', inserted}.
function applyManifest(tree, man, where, log = () => {}) {
    let parsed = parseRegistries(tree);
    const live = liveSkills(parsed);
    const liveKeys = new Set(live.map((s) => s.key));
    const bareCount = new Map();
    for (const s of live) bareCount.set(s.v, (bareCount.get(s.v) || 0) + 1);
    const exp = expectedEntries(man);
    const present = (man.skills || []).filter((s) => liveKeys.has(s.key));
    const providersPresent = (man.providers || []).filter((p) => parsed.providers && parsed.providers[0].items.some((x) => x.key === p));
    const lessonsPresent = (man.lessons || []).filter((l) => parsed.lessonImports && parsed.lessonImports[0].items.some((x) => x.key === l.module));
    const total = (man.skills || []).length + (man.providers || []).length + (man.lessons || []).length;
    const nPresent = present.length + providersPresent.length + lessonsPresent.length;

    // ---- every entry already present with the same data -> no-op; any difference -> conflict
    const findItems = (e) => {
        const list = parsed[e.reg.id] || [];
        return list.filter((x) => x.region.sub === e.sub).flatMap((x) => x.items.filter((i) => i.key === e.key));
    };
    const conceptCheck = (applied) => {
        const rules = parsed.concepts ? parsed.concepts[0].items.map((x) => valueOf(x.it)) : [];
        for (const e of exp.filter((x) => x.reg.id === 'concepts')) {
            const s = e.skill;
            const got = new Set();
            const id = s.key, withLabel = `${id} ${String(s.entry.l || '').toLowerCase()}`;
            for (const r of rules) if (Array.isArray(r) && r[0] instanceof RegExp && r[0].test(r[2] && r[2].label ? withLabel : id)) r[1].forEach((c) => got.add(c));
            const missing = s.concepts.filter((c) => !got.has(c));
            if (missing.length) fail(`${where}: ${s.key} ${applied ? 'exists but lacks' : 'would lack'} concept(s) ${missing.join(', ')}`);
        }
    };
    if (!total) return { status: 'empty', inserted: 0 };
    if (nPresent) {
        if (nPresent !== total) fail(`${where}: partially applied (${nPresent} of ${total} items already in the tree); refusing`);
        for (const e of exp) {
            if (e.reg.id === 'concepts') continue;
            const hits = findItems(e);
            if (hits.length !== 1 || !itemMatches(e, hits[0])) fail(`${where}: ${e.skill ? e.skill.key : e.key} already exists with different data in ${e.reg.name || e.reg.file} (${e.key}): refusing (a manifest never changes an applied skill)`);
        }
        conceptCheck(true);
        return { status: 'noop', inserted: 0 };
    }

    // ---- new: nothing may already be keyed the same, codes unique
    const pinned = parsed.codes ? new Map(parsed.codes[0].items.map((x) => [valueOf(x.it), x.key])) : new Map();
    const manBare = new Map();
    for (const s of man.skills || []) { const id = s.key.split(':')[1]; manBare.set(id, (manBare.get(id) || 0) + 1); }
    for (const e of exp) {
        if (e.reg.id === 'concepts' || e.reg.id === 'lessonEntries') continue;
        if (e.reg.id === 'mixedPoolExclude') {
            if (findItems(e).length) fail(`${where}: MIXED_POOL_EXCLUDE.${e.key} already exists; adding to an existing pool entry is an edit (not a manifest operation)`);
            if (!live.some((s) => s.v === e.key)) fail(`${where}: mixedPoolExclude names unknown pool ${e.key}`);
            continue;
        }
        if (findItems(e).length) fail(`${where}: ${e.skill ? e.skill.key : e.key}: ${e.reg.name || e.reg.file} already has an entry "${e.key}" (duplicate id); refusing`);
        if (e.reg.keyForm === 'bare' && !e.key.includes(':') && ((bareCount.get(e.key) || 0) + (manBare.get(e.key) || 0) > 1)) fail(`${where}: ${e.skill.key}: the bare id "${e.key}" is shared with another skill; give keys.${e.reg.id} = "${e.skill.key}"`);
        if (e.reg.id === 'codes' && pinned.has(e.value)) fail(`${where}: ${e.skill.key}: code ${e.value} is already pinned to ${pinned.get(e.value)}`);
    }
    const codesInMan = (man.skills || []).filter((s) => s.code).map((s) => s.code);
    if (new Set(codesInMan).size !== codesInMan.length) fail(`${where}: two skills share a code`);
    for (const s of man.skills || []) {
        if (s.preset && !(man.skills || []).some((x) => x.key === `${s.key.split(':')[0]}:${s.preset.skill}`) && !liveKeys.has(`${s.key.split(':')[0]}:${s.preset.skill}`)) fail(`${where}: preset ${s.key} names a host ${s.preset.skill} that is not live`);
    }

    // ---- the blocks: given layout first (checked against the data), the rest rendered
    const claimed = new Set();
    const blocks = [];
    for (const b of man.layout || []) {
        const reg = REG[b.registry];
        const items = blockItems(reg, b.text, reg.id !== 'concepts' && reg.id !== 'skills');
        for (const item of items) {
            if (reg.id === 'concepts') continue;
            const hit = exp.findIndex((e, i) => !claimed.has(i) && e.reg === reg && e.sub === (b.category || '') && itemMatches(e, item));
            if (hit < 0) fail(`${where}: layout block in ${reg.name || reg.file}${b.category ? '.' + b.category : ''} holds "${item.key}", which is not this manifest's data (layout text must be the same data as the skills section)`);
            claimed.add(hit);
        }
        blocks.push({ reg, sub: b.category || '', after: b.after, text: b.text, items });
    }
    if ((man.layout || []).some((b) => b.registry === 'concepts')) {
        // concept rules in layout must each match only this manifest's skills
        for (const b of man.layout.filter((x) => x.registry === 'concepts')) for (const item of blocks.find((x) => x.text === b.text).items) {
            const r = valueOf(item.it);
            if (!Array.isArray(r) || !(r[0] instanceof RegExp)) fail(`${where}: concept layout item is not a rule`);
            const mine = (man.skills || []).filter((s) => r[0].test(r[2] && r[2].label ? `${s.key} ${s.entry.l.toLowerCase()}` : s.key));
            const others = live.filter((s) => r[0].test(r[2] && r[2].label ? `${s.key} ${String(s.l).toLowerCase()}` : s.key));
            if (!mine.length || others.length) fail(`${where}: concept rule ${item.key} must match only this manifest's skills`);
        }
        exp.forEach((e, i) => { if (e.reg.id === 'concepts') claimed.add(i); });
    }
    // render the unclaimed entries, grouped by registry/sub, appended at "$end" in manifest order
    const groups = new Map();
    exp.forEach((e, i) => {
        if (claimed.has(i) || (e.reg.id === 'concepts' && !e.value.length)) return;
        const g = `${e.reg.id}|${e.sub}`;
        if (!groups.has(g)) groups.set(g, []);
        groups.get(g).push(e);
    });
    for (const [g, list] of groups) {
        const reg = list[0].reg, sub = list[0].sub;
        const r = regionFor(parsed, reg, sub);
        const ref = r.items.length ? r.items[r.items.length - 1].it : null;
        const src = tree.get(reg.file);
        const ind = reg.imports ? '' : ref ? src.slice(r.region.L.starts[ref.startLine], ref.start).replace(/\S.*$/, '') : '    ';
        const text = list.map((e) => renderLine(e, ind)).join('\n') + '\n';
        blocks.push({ reg, sub, after: '$end', text, rendered: true });
    }

    // ---- insert, re-parsing after each block
    let inserted = 0;
    for (const b of blocks) {
        parsed = parseRegistries(tree, [b.reg].concat(b.reg.id === 'skills' ? [] : []));
        const r = regionFor(parsed, b.reg, b.sub);
        if (b.reg.id === 'skills') {
            const lastKey = r.items.length ? r.items[r.items.length - 1].key : null;
            if (b.after !== '$end' && b.after !== lastKey) fail(`${where}: SKILLS.${b.sub} block anchored after "${b.after}" is not at the end of the category: inserting there would move the share-code positions of every later skill (append only)`);
        }
        const src = tree.get(b.reg.file);
        const at = insertionPoint(src, b.reg, r, b.after);
        let next = src.slice(0, at.pos) + b.text + src.slice(at.pos);
        if (at.comma != null) next = next.slice(0, at.comma) + ',' + next.slice(at.comma);
        tree.files[b.reg.file] = next;
        inserted++;
        log(`  + ${b.reg.name || b.reg.file}${b.sub ? '.' + b.sub : ''} after ${b.after === null ? '(start)' : b.after}: ${b.text.split('\n').length - 1} line(s)${b.rendered ? ' (rendered)' : ''}`);
    }

    // ---- verify: every expected entry now present exactly once with its data; concept rules hold
    parsed = parseRegistries(tree);
    for (const e of exp) {
        if (e.reg.id === 'concepts') continue;
        const hits = findItems(e);
        if (hits.length !== 1 || !itemMatches(e, hits[0])) fail(`${where}: after applying, ${e.reg.name || e.reg.file} entry ${e.key} is ${hits.length ? 'not the manifest data' : 'missing'}${hits.length > 1 ? ' (duplicate)' : ''}`);
    }
    conceptCheck(false);
    return { status: 'applied', inserted };
}

function writeTree(tree) {
    const changed = [];
    for (const [f, text] of Object.entries(tree.files)) {
        if (text == null) continue;
        const p = join(tree.root, f);
        if (readFileSync(p, 'utf8') !== text) { writeFileSync(p, text); changed.push(f); }
    }
    return changed;
}
function syntaxCheck(root, files) {
    for (const f of files) {
        const r = spawnSync(process.execPath, ['--input-type=module', '--check'], { input: readFileSync(join(root, f), 'utf8'), encoding: 'utf8' });
        if (r.status !== 0) fail(`${f} does not parse after the change: ${(r.stderr || '').split('\n').slice(0, 5).join(' | ')}`);
    }
}

// The ledger: what each lane applied, so a later manifest cannot drop or reorder it.
function checkLedger(ledger, man, where) {
    const prev = ledger.lanes[man.lane];
    if (!prev) return;
    const keys = (man.skills || []).map((s) => s.key);
    prev.skills.forEach((k, i) => {
        if (!keys.includes(k)) fail(`${where}: lane ${man.lane} applied ${k} before and the manifest no longer lists it: removal refused (retire with a tombstone and an alias instead)`);
        else if (keys[i] !== k) fail(`${where}: lane ${man.lane} applied ${k} at position ${i}; the manifest reorders it: refused`);
    });
    for (const p of prev.providers || []) if (!(man.providers || []).includes(p)) fail(`${where}: provider ${p} was applied and is no longer listed: removal refused`);
}

function runApply({ root, manifestsDir, lanes, order, ledgerFile, preview, quiet }) {
    const say = quiet ? () => {} : (s) => console.log(s);
    const { picked, want } = listManifests(manifestsDir, lanes);
    const list = ordered(picked, order, want);
    let work = root;
    let tmp = null;
    if (preview) {
        tmp = mkdtempSync(join(process.env.WS_INTEGRATE_SCRATCH || tmpdir(), 'ws-integrate-preview-'));
        for (const f of new Set(REGISTRIES.map((r) => r.file))) if (existsSync(join(root, f))) { mkdirSync(dirname(join(tmp, f)), { recursive: true }); cpSync(join(root, f), join(tmp, f)); }
        for (const f of ['js/modules/skill-codes-frozen.js']) if (existsSync(join(root, f))) cpSync(join(root, f), join(tmp, f));
        work = tmp;
    }
    const ledger = existsSync(ledgerFile) ? JSON.parse(readFileSync(ledgerFile, 'utf8')) : { version: 1, lanes: {} };
    const before = codeSnapshot(work);
    const tree = readTree(work);
    const results = [];
    for (const m of list) {
        const where = relative(REPO, m.file) || m.file;
        checkLedger(ledger, m.man, where);
        say(`ws-integrate: ${m.man.lane} (mergeOrder ${m.man.mergeOrder}, ${(m.man.skills || []).length} skills)`);
        const r = applyManifest(tree, m.man, where, say);
        say(`  ${r.status === 'empty' ? 'nothing to apply' : r.status === 'noop' ? 'already applied: no change' : `applied: ${r.inserted} block(s)`}`);
        results.push({ lane: m.man.lane, ...r });
        ledger.lanes[m.man.lane] = { mergeOrder: m.man.mergeOrder, skills: (m.man.skills || []).map((s) => s.key), providers: m.man.providers || [], lessons: (m.man.lessons || []).map((l) => l.module), hash: hashOf(readFileSync(m.file, 'utf8')) };
    }
    const originals = Object.fromEntries(Object.keys(tree.files).filter((f) => tree.files[f] != null).map((f) => [f, readFileSync(join(work, f), 'utf8')]));
    const changed = writeTree(tree);
    if (changed.length) {
        // a check that fails puts every file back first: a refused run leaves the tree as it was
        const restore = () => { for (const f of changed) writeFileSync(join(work, f), originals[f]); };
        try {
            syntaxCheck(work, changed);
            if (before) { const errs = compareSnapshots(before, codeSnapshot(work)); if (errs.length) fail(errs.slice(0, 10).join('\n')); }
        } catch (e) { restore(); throw e; }
    }
    if (preview) {
        say(`ws-integrate: preview — files that would change: ${changed.length ? changed.join(', ') : 'none'}`);
        for (const f of changed) { const d = spawnSync('diff', ['-u', join(root, f), join(tmp, f)], { encoding: 'utf8' }); say(d.stdout.split('\n').filter((l) => /^[+-][^+-]/.test(l)).map((l) => `  ${f}: ${l}`).join('\n')); }
        rmSync(tmp, { recursive: true, force: true });
    } else if (results.some((r) => r.status === 'applied') || existsSync(ledgerFile)) {
        mkdirSync(dirname(ledgerFile), { recursive: true });
        writeFileSync(ledgerFile, JSON.stringify(ledger, null, 1) + '\n');
    }
    return { results, changed };
}

// ============================================================================ extract
// Who owns an item, given the skills being extracted (key -> group name).
function ownerOf(reg, item, ctx) {
    const { want, bareOwner, live } = ctx;
    const k = item.key;
    switch (reg.keyForm) {
        case 'v': return want.get(`${item.sub}:${k}`) ?? null;
        case 'full': return want.get(k) ?? null;
        case 'bare': return k.includes(':') ? want.get(k) ?? null : bareOwner(k);
        case 'pool': {
            const v = valueOf(item.it);
            if (!Array.isArray(v) || !v.length) return null;
            const owners = new Set(v.map((id) => bareOwner(id)));
            return owners.size === 1 && [...owners][0] ? [...owners][0] : (owners.has(null) ? null : 'MIXED');
        }
        case 'rule': {
            const r = valueOf(item.it);
            if (!Array.isArray(r) || !(r[0] instanceof RegExp)) return null;
            const hits = live.filter((s) => r[0].test(r[2] && r[2].label ? `${s.key} ${String(s.l).toLowerCase()}` : s.key));
            if (!hits.length) return null;
            const owners = new Set(hits.map((s) => want.get(s.key) ?? null));
            return owners.size === 1 ? [...owners][0] : (owners.has(null) ? null : 'MIXED');
        }
        default: return null;
    }
}

function extract({ root, skillKeys, groupOf, groupOrder, laneName }) {
    const tree = readTree(root);
    const parsed = parseRegistries(tree);
    const live = liveSkills(parsed);
    const liveByKey = new Map(live.map((s) => [s.key, s]));
    for (const k of skillKeys) if (!liveByKey.has(k)) fail(`--extract: ${k} is not a live skill`);
    const want = new Map(skillKeys.map((k) => [k, groupOf(k)]));
    const byBare = new Map();
    for (const s of live) { if (!byBare.has(s.v)) byBare.set(s.v, []); byBare.get(s.v).push(s); }
    const bareOwner = (id) => { const l = byBare.get(id) || []; return l.length === 1 ? want.get(l[0].key) ?? null : null; };
    const ctx = { want, bareOwner, live };
    const groups = new Map(groupOrder.map((g) => [g, { skills: new Map(), layout: [] }]));
    for (const k of skillKeys) { const s = liveByKey.get(k); groups.get(want.get(k)).skills.set(k, { key: k, entry: s.entry }); }
    const report = { mixedLines: [], kept: [], unevaluable: [] };

    for (const reg of REGISTRIES) {
        if (reg.imports || reg.id === 'lessonEntries' || !parsed[reg.id]) continue;
        const src = tree.get(reg.file);
        for (const { region, items } of parsed[reg.id]) {
            if (region.inline) continue;
            const L = region.L;
            // owner per item
            for (const x of items) { x.sub = region.sub; x.owner = ownerOf(reg, x, ctx); }
            // owner per line
            const lineOwner = new Map();
            for (const x of items) for (let ln = x.it.startLine; ln <= x.it.endLine; ln++) {
                const o = x.owner === 'MIXED' ? 'MIXED' : x.owner;
                if (!lineOwner.has(ln)) lineOwner.set(ln, o);
                else if (lineOwner.get(ln) !== o) lineOwner.set(ln, 'MIXED');
            }
            for (const [ln, o] of lineOwner) if (o === 'MIXED') {
                const names = items.filter((x) => x.it.startLine <= ln && x.it.endLine >= ln && x.owner).map((x) => x.key);
                report.mixedLines.push(`${reg.file}:${ln + 1} (${reg.name}) mixes ${names.join(', ')} with other owners: those entries stay in the base`);
            }
            // blocks
            let ln = region.openLine + 1;
            const close = region.closeLine;
            const isComment = (l) => !lineOwner.has(l);
            while (ln < close) {
                const o = lineOwner.get(ln);
                if (!o || o === 'MIXED' || o === null) { ln++; continue; }
                // extend upward over comment/blank lines not yet claimed
                let first = ln;
                while (first - 1 > region.openLine && isComment(first - 1) && !(region._claimed && region._claimed.has(first - 1))) first--;
                let last = ln;
                let p = ln + 1;
                while (p < close) {
                    if (lineOwner.get(p) === o) { last = p; p++; continue; }
                    if (isComment(p)) { p++; continue; }
                    break;
                }
                region._claimed = region._claimed || new Set();
                for (let q = first; q <= last; q++) region._claimed.add(q);
                const text = src.slice(L.starts[first], L.starts[last + 1]);
                const before = items.filter((x) => x.it.endLine < first);
                const after = before.length ? before[before.length - 1].key : null;
                const block = { registry: reg.id, ...(reg.nested ? { category: region.sub } : {}), after, text };
                groups.get(o).layout.push(block);
                // data for the skills in the block
                for (const x of items.filter((y) => y.it.startLine >= first && y.it.endLine <= last)) {
                    if (x.owner !== o) continue;
                    const v = valueOf(x.it);
                    if (reg.id === 'skills') continue;
                    if (reg.id !== 'concepts' && !isJsonSafe(v)) { report.unevaluable.push(`${reg.name} ${x.key}`); continue; }
                    const g = groups.get(o);
                    if (reg.id === 'mixedPoolExclude') { for (const id of v) { const s = g.skills.get(byBare.get(id)[0].key); (s.mixedPoolExclude = s.mixedPoolExclude || []).push(x.key); } continue; }
                    if (reg.id === 'concepts') {
                        for (const [k, s] of g.skills) if (v[0].test(v[2] && v[2].label ? `${k} ${s.entry.l.toLowerCase()}` : k)) { s.concepts = s.concepts || []; for (const c of v[1]) if (!s.concepts.includes(c)) s.concepts.push(c); }
                        continue;
                    }
                    const sk = reg.keyForm === 'bare' && !x.key.includes(':') ? byBare.get(x.key)[0].key : x.key;
                    const s = g.skills.get(sk);
                    if (!s) fail(`internal: ${reg.id} ${x.key} owner ${o} has no skill ${sk}`);
                    if (reg.field in s) fail(`${reg.name}: ${sk} has two entries`);
                    s[reg.field] = v;
                    if (reg.keyForm === 'bare' && x.key.includes(':')) (s.keys = s.keys || {})[reg.id] = x.key;
                }
                ln = last + 1;
            }
            delete region._claimed;
        }
    }
    // per skill: which registries hold it in text the extractor left in the base (mixed lines / unowned)
    const manifests = groupOrder.map((g, i) => {
        const G = groups.get(g);
        const skills = [...G.skills.values()].map((s) => {
            const o = { key: s.key, entry: s.entry };
            for (const reg of REGISTRIES) if (reg.field && reg.field !== 'entry' && reg.field in s) o[reg.field] = s[reg.field];
            if (s.keys) o.keys = s.keys;
            return o;
        });
        return { version: SCHEMA_VERSION, lane: laneName ? (groupOrder.length > 1 ? `${laneName}-${String(i + 1).padStart(2, '0')}` : laneName) : g, mergeOrder: (i + 1) * 10, description: `extracted from ${relative(REPO, root) || '.'} (${g})`, skills, layout: G.layout };
    });
    return { manifests, report };
}

// The pin sections of skill-codes-frozen.js: [{title, keys}] in file order, from a pinned code onward.
function pinSections(root, cut) {
    const src = readFileSync(join(root, 'js/modules/skill-codes-frozen.js'), 'utf8');
    const reg = REG.codes;
    const [{ region, items }] = locate(reg, src).map((r) => ({ region: r, items: r.items.map((it) => ({ it, key: itemKey(reg, it) })) }));
    const lines = src.split('\n');
    const sections = [];
    let cur = null, on = !cut, prevEnd = region.openLine;
    for (const x of items) {
        // a "// ---- ... ----" header between the previous item and this one opens a section
        let title = null;
        for (let l = x.it.startLine - 1; l > prevEnd; l--) {
            if (/^\s*\/\/\s*----/.test(lines[l])) { title = lines[l].replace(/^\s*\/\/\s*-+\s*/, '').replace(/\s*-+\s*$/, ''); break; }
        }
        prevEnd = x.it.endLine;
        if (title) { cur = { title, keys: [] }; sections.push(cur); }
        if (cut && valueOf(x.it) === cut) on = true;
        if (on && cur) cur.keys.push(x.key);
    }
    return sections.filter((s) => s.keys.length);
}

// ============================================================================ peel (the inverse, scratch trees only)
function peel(root, mans) {
    if (resolve(root) === REPO) fail('--peel removes registry entries: it runs only in a scratch tree (--root), never on the repository');
    const tree = readTree(root);
    for (const man of [...mans].reverse()) {
        for (const b of [...(man.layout || [])].reverse()) {
            const reg = REG[b.registry];
            const parsed = parseRegistries(tree, [reg]);
            const r = regionFor(parsed, reg, b.category || '');
            const src = tree.get(reg.file);
            if (b.after === '$end') fail('peel needs explicit anchors (extracted manifests have them)');
            const at = insertionPoint(src, reg, r, b.after);
            if (!src.startsWith(b.text, at.pos)) fail(`peel: ${reg.name}${b.category ? '.' + b.category : ''} after ${b.after}: the text is not where the manifest says`);
            tree.files[reg.file] = src.slice(0, at.pos) + src.slice(at.pos + b.text.length);
        }
    }
    return writeTree(tree);
}

// ============================================================================ regen and stamp
function runNode(root, script, args, { env = {}, timeout = 1800e3 } = {}) {
    const t = Date.now();
    const r = spawnSync(process.execPath, [join(root, 'tests/scripts', script), ...args], { cwd: root, encoding: 'utf8', env: { ...process.env, ...env }, timeout, maxBuffer: 256e6 });
    const out = `${r.stdout || ''}${r.stderr || ''}`.trim().split('\n');
    const tail = out.filter((l) => /\b(OK|FAIL|FAILURE|PASS)\b/.test(l)).slice(-1)[0] || out.slice(-1)[0] || '';
    return { ok: r.status === 0, status: r.status, ms: Date.now() - t, tail: tail.trim(), out };
}
function regen(root, { catalogue = true } = {}) {
    const steps = [
        ['ws-standards.cjs', ['--report']],
        ['ws-wrm.cjs', ['--report-only']],
    ];
    if (catalogue) steps.push(['ws-catalogue.cjs', []]);
    if (existsSync(join(root, 'tests/scripts/ws-status-index.mjs'))) steps.push(['ws-status-index.mjs', ['--root', root]]);
    else console.log('ws-integrate: --regen: tests/scripts/ws-status-index.mjs is not in this tree yet (S6): STATUS index skipped');
    console.log('ws-integrate: --regen: the lesson registry (js/modules/lessons/detailed/index.js) has no generator; --apply writes it directly');
    const res = [];
    for (const [s, a] of steps) {
        const r = runNode(root, s, a);
        console.log(`  ${s} ${a.join(' ')}: ${r.ok ? 'ok' : 'FAILED'} (${(r.ms / 1000).toFixed(1)} s) ${r.tail}`);
        res.push({ script: s, ...r });
    }
    return res;
}

// ============================================================================ git helpers
const git = (cwd, args, input) => {
    const r = spawnSync('git', args, { cwd, encoding: 'utf8', input, maxBuffer: 256e6 });
    if (r.status !== 0) fail(`git ${args.join(' ')}: ${(r.stderr || '').trim()}`);
    return r.stdout;
};
function writeManifests(dir, manifests) {
    mkdirSync(dir, { recursive: true });
    for (const m of manifests) { mkdirSync(join(dir, m.lane), { recursive: true }); writeFileSync(join(dir, m.lane, 'manifest.json'), JSON.stringify(m, null, 2) + '\n'); }
}

// ============================================================================ the dry run (the gate)
function dryRun({ cut = 'T6', browser = true, keep = false, record = null }) {
    const T = {}; const t0 = Date.now(); const lap = (k, t) => { T[k] = Date.now() - t; };
    const scratchBase = process.env.WS_INTEGRATE_SCRATCH || tmpdir();
    const work = mkdtempSync(join(scratchBase, 'ws-integrate-dry-'));
    const wt = join(work, 'tree');
    const commit = git(REPO, ['rev-parse', 'HEAD']).trim();
    let t = Date.now();
    git(REPO, ['worktree', 'add', '--detach', wt, commit]);
    const result = { date: new Date().toISOString().slice(0, 10), commit, cut, gates: {}, timings: T };
    try {
        // the browser gate needs puppeteer: use the repository's node_modules when the checkout has none
        if (existsSync(join(REPO, 'node_modules')) && !existsSync(join(wt, 'node_modules'))) symlinkSync(join(REPO, 'node_modules'), join(wt, 'node_modules'));
        lap('worktree', t);
        // (a) extract, one manifest per pin section from the cut on
        t = Date.now();
        const sections = pinSections(wt, cut);
        const groupOf = new Map();
        sections.forEach((s, i) => s.keys.forEach((k) => groupOf.set(k, `s${String(i + 1).padStart(2, '0')}`)));
        const keys = [...groupOf.keys()];
        const groupOrder = sections.map((_, i) => `s${String(i + 1).padStart(2, '0')}`);
        const { manifests, report } = extract({ root: wt, skillKeys: keys, groupOf: (k) => groupOf.get(k), groupOrder, laneName: 'dry' });
        manifests.forEach((m, i) => { m.description = `dry run: ${sections[i].title}`; });
        const mdir = join(work, 'manifests');
        writeManifests(mdir, manifests);
        lap('extract', t);
        const cats = new Set(keys.map((k) => k.split(':')[0]));
        const presetsN = manifests.reduce((n, m) => n + m.skills.filter((s) => s.preset).length, 0);
        const blocks = manifests.reduce((n, m) => n + m.layout.length, 0);
        const fields = {};
        for (const m of manifests) for (const s of m.skills) for (const f of Object.keys(s)) if (f !== 'key') fields[f] = (fields[f] || 0) + 1;
        Object.assign(result, { skills: keys.length, categories: cats.size, presets: presetsN, manifests: manifests.length, blocks, fields, sections: sections.map((s) => `${s.title.slice(0, 70)} (${s.keys.length})`), report });
        console.log(`ws-integrate: dry run at ${commit.slice(0, 10)}: ${keys.length} skills (${presetsN} presets) over ${cats.size} categories, ${manifests.length} manifests, ${blocks} blocks`);
        for (const l of report.mixedLines) console.log(`  note: ${l}`);
        for (const l of report.unevaluable) console.log(`  note: not plain data, left in base: ${l}`);

        // (b) peel: the base
        t = Date.now();
        const peeled = peel(wt, manifests);
        syntaxCheck(wt, peeled);
        const baseSnap = codeSnapshot(wt);
        const baseLeft = keys.filter((k) => { const [c, v] = k.split(':'); return (baseSnap.order[c] || []).includes(v); });
        if (baseLeft.length) fail(`the base still lists ${baseLeft.length} extracted skills in SKILLS`);
        const diffStat = git(wt, ['diff', '--shortstat']).trim();
        result.base = { files: peeled, diffStat };
        const baseSnapGate = runNode(wt, 'ws-code-snapshot.mjs', []);
        result.base.codeSnapshot = baseSnapGate.tail;
        lap('peel', t);
        console.log(`  base: ${peeled.length} files peeled (${diffStat}); base parses; ws-code-snapshot on the base (expected to fail): ${baseSnapGate.tail}`);

        // (c) apply in merge order
        t = Date.now();
        const ledgerFile = join(work, 'applied.json');
        const ap = runApply({ root: wt, manifestsDir: mdir, lanes: null, order: 'merge', ledgerFile, quiet: true });
        lap('apply', t);
        console.log(`  apply: ${ap.results.filter((r) => r.status === 'applied').length} manifests applied, ${ap.results.reduce((n, r) => n + r.inserted, 0)} blocks inserted`);

        // (d) no diff
        const st = spawnSync('git', ['diff', '--exit-code', '--stat'], { cwd: wt, encoding: 'utf8' });
        const porcelain = git(wt, ['status', '--porcelain']).split('\n').filter((l) => l && !/ node_modules$/.test(l));
        result.diffEmpty = st.status === 0 && !porcelain.length;
        console.log(`  git diff --exit-code: ${result.diffEmpty ? 'empty' : 'NOT EMPTY'}`);
        if (!result.diffEmpty) { console.log((st.stdout || '').split('\n').slice(0, 30).join('\n')); console.log(porcelain.slice(0, 20).join('\n')); }

        // idempotent: a second apply changes nothing
        t = Date.now();
        const ap2 = runApply({ root: wt, manifestsDir: mdir, lanes: null, order: 'merge', ledgerFile, quiet: true });
        result.idempotent = ap2.changed.length === 0 && ap2.results.every((r) => r.status === 'noop' || r.status === 'empty');
        lap('reapply', t);
        console.log(`  re-apply: ${result.idempotent ? 'no-op' : 'CHANGED ' + ap2.changed.join(', ')}`);

        // (e) the gates in the rebuilt tree, one at a time
        const gates = [['ws-code-snapshot.mjs', []], ['ws-standards.cjs', []], ['ws-search-terms.cjs', []]];
        if (browser) gates.push(['ws-presets-unit.mjs', []]);
        for (const [g, a] of gates) {
            const r = runNode(wt, g, a);
            result.gates[g] = { ok: r.ok, tail: r.tail, s: +(r.ms / 1000).toFixed(1) };
            T[g] = r.ms;
            console.log(`  ${g}: ${r.ok ? 'green' : 'RED'} (${(r.ms / 1000).toFixed(1)} s) ${r.tail}`);
            if (!r.ok) console.log(r.out.slice(-15).join('\n'));
        }
        if (!browser) result.gates['ws-presets-unit.mjs'] = { ok: null, tail: 'skipped (--no-browser)' };

        // (f) the DATA alone is complete: peel again, apply the manifests with their layout removed (every
        // line rendered by the integrator, appended at the end of its registry, as a new lane's would be),
        // and require the same share codes and positions, every skill's data in place, and the node gates green.
        t = Date.now();
        const headSnap = codeSnapshot(wt);
        peel(wt, manifests);
        const ddir = join(work, 'manifests-data-only');
        writeManifests(ddir, manifests.map((m) => { const { layout, ...rest } = m; return rest; }));
        runApply({ root: wt, manifestsDir: ddir, lanes: null, order: 'merge', ledgerFile: join(work, 'applied-data-only.json'), quiet: true });
        const snapErrs = compareSnapshots(headSnap, codeSnapshot(wt));
        const sameCodes = !snapErrs.length && Object.keys(codeSnapshot(wt).codes).length === Object.keys(headSnap.codes).length;
        const dstat = git(wt, ['diff', '--shortstat']).trim();
        result.dataOnly = { sameCodes, diffStat: dstat, gates: {} };
        console.log(`  data-only rebuild: share codes and positions ${sameCodes ? 'identical to HEAD' : 'DIFFER: ' + snapErrs.slice(0, 3).join('; ')}; layout differs from HEAD by design (${dstat})`);
        const dgates = [['ws-code-snapshot.mjs', []], ['ws-standards.cjs', []], ['ws-search-terms.cjs', []]];
        if (browser) dgates.push(['ws-presets-unit.mjs', []]);
        for (const [g, a] of dgates) {
            const r = runNode(wt, g, a);
            result.dataOnly.gates[g] = { ok: r.ok, tail: r.tail, s: +(r.ms / 1000).toFixed(1) };
            console.log(`    ${g}: ${r.ok ? 'green' : 'RED'} (${(r.ms / 1000).toFixed(1)} s) ${r.tail}`);
            if (!r.ok) console.log(r.out.slice(-15).join('\n'));
        }
        lap('dataOnly', t);
    } finally {
        if (!keep) { spawnSync('git', ['worktree', 'remove', '--force', wt], { cwd: REPO }); spawnSync('git', ['worktree', 'prune'], { cwd: REPO }); rmSync(work, { recursive: true, force: true }); }
        else console.log(`  kept: ${work}`);
    }
    T.total = Date.now() - t0;
    const ok = result.diffEmpty && result.idempotent && Object.values(result.gates).every((g) => g.ok !== false)
        && !!result.dataOnly && result.dataOnly.sameCodes && Object.values(result.dataOnly.gates).every((g) => g.ok !== false);
    result.ok = ok;
    if (record) writeFileSync(record, JSON.stringify(result, null, 1) + '\n');
    console.log(`  timings (s): ${Object.entries(T).map(([k, v]) => `${k} ${(v / 1000).toFixed(1)}`).join(', ')}`);
    return ok;
}

// ============================================================================ self-test
function selfTest() {
    const checks = [];
    const ok = (name, cond, detail = '') => { checks.push({ name, pass: !!cond }); console.log(`  ${cond ? 'pass' : 'FAIL'}  ${name}${!cond && detail ? ' — ' + detail : ''}`); };
    const throwsMsg = (fn) => { try { fn(); return null; } catch (e) { if (!(e instanceof IntegrateError)) throw e; return e.message; } };
    // seeded RNG (mulberry32)
    let seed = 20261023;
    const rnd = () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const word = () => Array.from({ length: 6 }, () => 'abcdefghijklmnopqrstuvwxyz'[Math.floor(rnd() * 26)]).join('');
    const base = mkdtempSync(join(process.env.WS_INTEGRATE_SCRATCH || tmpdir(), 'ws-integrate-selftest-'));
    const files = [...new Set(REGISTRIES.map((r) => r.file))];
    const fixture = (name) => {
        const d = join(base, name);
        for (const f of files) if (existsSync(join(REPO, f))) { mkdirSync(dirname(join(d, f)), { recursive: true }); cpSync(join(REPO, f), join(d, f)); }
        return d;
    };
    const snapshotFiles = (d) => Object.fromEntries(files.filter((f) => existsSync(join(d, f))).map((f) => [f, readFileSync(join(d, f), 'utf8')]));
    const repoHash = hashOf(JSON.stringify(Object.fromEntries(files.filter((f) => existsSync(join(REPO, f))).map((f) => [f, readFileSync(join(REPO, f), 'utf8')]))));
    const sameFiles = (a, b) => { const A = snapshotFiles(a), B = snapshotFiles(b); return Object.keys(A).every((f) => A[f] === B[f]); };
    // free codes, in the auto-assigner's alphabet, not used by any pinned code
    const used = new Set(Object.values(codeSnapshot(REPO).codes));
    const AL = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const free = [];
    for (const a of AL) for (const b of AL) if (!used.has(a + b)) free.push(a + b);
    free.reverse();
    const mkSkill = (cat, host) => {
        const id = `zz_${word()}`;
        const s = { key: `${cat}:${id}`, entry: { v: id, l: `Test Skill ${id}` }, grade: 1 + Math.floor(rnd() * 5), code: free.pop(), standards: { ccss: ['1.OA.A.1'], ee: ['M.EE.1.OA.1'] }, wrm: ['Y1.B1.S1'], terms: [word(), word(), word(), word(), word()], printSize: 'compact', timeCategory: 'quick', concepts: ['addition'] };
        if (host) { s.entry.presetOf = host; s.preset = { skill: host, opts: { range: 20 } }; }
        return s;
    };
    const man = (lane, mergeOrder, skills, extra = {}) => ({ version: 1, lane, mergeOrder, skills, ...extra });
    const putManifests = (dir, list) => { rmSync(dir, { recursive: true, force: true }); writeManifests(dir, list); return dir; };
    const A = [mkSkill('addition'), mkSkill('addition', 'add')];
    const B = [mkSkill('subtraction'), mkSkill('multiplication', 'multiply')];
    const manA = man('lane-a', 10, A, { providers: ['./zz-test-provider.js'] });
    const manB = man('lane-b', 20, B);
    const run = (root, mans, o = {}) => runApply({ root, manifestsDir: putManifests(join(base, 'm-' + Math.floor(rnd() * 1e9)), mans), lanes: o.lanes || null, order: o.order || 'merge', ledgerFile: o.ledger || join(root, 'applied.json'), quiet: true });
    try {
        // 1. apply, then re-apply: idempotent
        const f1 = fixture('f1');
        const pristine = snapshotFiles(f1);
        const r1 = run(f1, [manA]);
        ok('apply adds the lane\'s skills (SKILLS, grade, code, standards, wrm, terms, preset, concepts, provider)', r1.results[0].status === 'applied' && r1.changed.length >= 6, r1.changed.join(','));
        const afterA = snapshotFiles(f1);
        const snapA = codeSnapshot(f1);
        ok('the new skills decode at their pinned codes; no existing code or position moved', A.every((s) => snapA.codes[s.key] === s.code) && compareSnapshots(codeSnapshot(fixture('pristine')), snapA).length === 0);
        const r1b = run(f1, [manA], { ledger: join(f1, 'applied.json') });
        ok('re-applying an applied manifest is a no-op (byte-identical files)', r1b.results[0].status === 'noop' && r1b.changed.length === 0 && sameFiles(f1, f1) && Object.entries(snapshotFiles(f1)).every(([f, t]) => afterA[f] === t));
        ok('only lines were inserted (every pristine line is still there, in order)', Object.keys(pristine).every((f) => { const a = pristine[f].split('\n'); const b = afterA[f].split('\n'); let j = 0; for (const l of b) if (j < a.length && l === a[j]) j++; return j === a.length; }));

        // 2. two lanes in merge order == one combined manifest
        const f2 = fixture('f2'), f3 = fixture('f3');
        run(f2, [manB, manA]); // given out of order: merge order puts lane-a (10) first
        run(f3, [man('combined', 10, [...A, ...B], { providers: ['./zz-test-provider.js'] })]);
        ok('two lanes applied in merge order give the same files as one combined manifest', sameFiles(f2, f3));
        const f2b = fixture('f2b');
        run(f2b, [manA, manB], { lanes: 'lane-b,lane-a', order: 'file' });
        ok('--order file applies in the order given (lane-b first) and still appends only', compareSnapshots(codeSnapshot(fixture('p2')), codeSnapshot(f2b)).length === 0 && !sameFiles(f2b, f3));

        // 3. a conflicting duplicate id fails
        const f4 = fixture('f4');
        run(f4, [manA]);
        const dup = JSON.parse(JSON.stringify(A[0])); dup.entry.l = 'A different label';
        let m = throwsMsg(() => run(f4, [man('lane-c', 30, [dup])]));
        ok('a skill id that exists with different data is refused', m && /different data/.test(m), m || 'no error');
        const dupCode = mkSkill('addition'); dupCode.code = 'AA';
        m = throwsMsg(() => run(fixture('f5'), [man('lane-d', 10, [dupCode])]));
        ok('a share code already pinned is refused', m && /already pinned/.test(m), m || 'no error');
        const real = mkSkill('addition'); real.key = 'addition:add'; real.entry.v = 'add';
        m = throwsMsg(() => run(fixture('f6'), [man('lane-e', 10, [real])]));
        ok('an existing skill id with other data is refused', m && /different data|partially/.test(m), m || 'no error');

        // 4. append-only: reorder and delete refused (ledger), a mid-category SKILLS block refused
        const f7 = fixture('f7');
        const led = join(f7, 'applied.json');
        run(f7, [manA], { ledger: led });
        m = throwsMsg(() => run(f7, [man('lane-a', 10, [A[1], A[0]], { providers: manA.providers })], { ledger: led }));
        ok('a manifest that reorders skills it applied is refused', m && /reorders/.test(m), m || 'no error');
        m = throwsMsg(() => run(f7, [man('lane-a', 10, [A[0]], { providers: manA.providers })], { ledger: led }));
        ok('a manifest that deletes a skill it applied is refused', m && /removal refused/.test(m), m || 'no error');
        m = throwsMsg(() => validateManifest({ ...man('lane-z', 1, []), remove: ['addition:add'] }, 'fixture'));
        ok('a manifest field that would remove or move anything does not exist (unknown field refused)', m && /unknown field/.test(m), m || 'no error');
        const mid = mkSkill('addition');
        const midMan = man('lane-f', 10, [mid], { layout: [{ registry: 'skills', category: 'addition', after: 'add_facts', text: `        { v: "${mid.entry.v}", l: "${mid.entry.l}" },\n` }] });
        const f8 = fixture('f8'); const f8Before = snapshotFiles(f8);
        m = throwsMsg(() => run(f8, [midMan]));
        ok('a SKILLS insertion in the middle of a category (would move share-code positions) is refused', m && /not at the end of the category/.test(m), m || 'no error');
        ok('a refused manifest leaves the tree untouched', Object.entries(snapshotFiles(f8)).every(([f, t]) => f8Before[f] === t));
        const lie = mkSkill('addition');
        const lieMan = man('lane-g', 10, [lie], { layout: [{ registry: 'grades', after: '$end', text: `    '${lie.entry.v}': ${lie.grade + 1},\n` }] });
        m = throwsMsg(() => run(fixture('f9'), [lieMan]));
        ok('layout text that says something other than the skill data is refused', m && /not this manifest's data/.test(m), m || 'no error');

        // an apply that would MOVE an existing share code is refused and rolled back: unpin the last skill of
        // the fixture (its code is then auto-assigned) and let a new skill take that code
        const f11 = fixture('f11');
        const frozenFile = join(f11, 'js/modules/skill-codes-frozen.js');
        const fz = readFileSync(frozenFile, 'utf8');
        const lastPin = [...fz.matchAll(/"([a-z_]+:[A-Za-z0-9_]+)": "([A-Z0-9]{2})",/g)].pop();
        writeFileSync(frozenFile, fz.replace(lastPin[0], ''));
        const f11Before = snapshotFiles(f11);
        const autoCode = codeSnapshot(f11).codes[lastPin[1]];
        const thief = mkSkill('addition'); thief.code = autoCode;
        m = throwsMsg(() => run(f11, [man('lane-h', 10, [thief])]));
        ok(`a new skill that would move an existing share code (${lastPin[1]} ${autoCode}) is refused`, m && /would move/.test(m), m || 'no error');
        ok('... and the files are put back', Object.entries(snapshotFiles(f11)).every(([f, t]) => f11Before[f] === t));
        const nocode = mkSkill('addition'); delete nocode.code;
        m = throwsMsg(() => run(fixture('f12'), [man('lane-i', 10, [nocode])]));
        ok('a new skill without its pinned share code is refused', m && /pinned 2-character share code/.test(m), m || 'no error');

        // 5. extract -> peel -> apply round trip on a fixture
        const f10 = fixture('f10');
        run(f10, [manA, manB]);
        const applied = snapshotFiles(f10);
        const ex = extract({ root: f10, skillKeys: [...A, ...B].map((s) => s.key), groupOf: (k) => (A.some((s) => s.key === k) ? 'a' : 'b'), groupOrder: ['a', 'b'], laneName: 'rt' });
        ok('extract recovers the skills\' data', ex.manifests[0].skills.length === 2 && ex.manifests[1].skills.length === 2 && ex.manifests[0].skills.every((s, i) => s.grade === A[i].grade && s.code === A[i].code && stable(s.standards) === stable(A[i].standards) && sameSet(s.concepts || [], A[i].concepts)));
        peel(f10, ex.manifests);
        const peeledFiles = snapshotFiles(f10);
        const pr = snapshotFiles(fixture('p3'));
        ok('peel restores the base exactly (registries)', REGISTRIES.filter((r) => r.id !== 'providers').every((r) => peeledFiles[r.file] === pr[r.file]));
        const mdir = putManifests(join(base, 'rt'), ex.manifests);
        runApply({ root: f10, manifestsDir: mdir, lanes: null, order: 'merge', ledgerFile: join(f10, 'rt.json'), quiet: true });
        ok('re-applying the extracted manifests rebuilds the files byte for byte', REGISTRIES.filter((r) => r.id !== 'providers').every((r) => snapshotFiles(f10)[r.file] === applied[r.file]));

        // 6. --stamp is refused in dry-run and self-test; the main tree is untouched by the self-test
        for (const extra of [['--dry-run'], ['--self-test'], ['--apply', '--preview'], ['--peel']]) {
            const r = spawnSync(process.execPath, [SELF, '--stamp', ...extra], { encoding: 'utf8' });
            ok(`--stamp with ${extra.join(' ')} is refused before anything runs`, r.status !== 0 && /--stamp is refused/.test(r.stdout + r.stderr), (r.stdout + r.stderr).slice(-200));
        }
        ok('the repository\'s registry files are unchanged by the self-test', hashOf(JSON.stringify(snapshotFiles(REPO))) === repoHash);
    } finally {
        rmSync(base, { recursive: true, force: true });
    }
    const failed = checks.filter((c) => !c.pass);
    console.log(`  ${checks.length - failed.length}/${checks.length} checks pass`);
    return failed.length === 0;
}

// ============================================================================ main
async function main() {
    const root = resolve(opt('--root', REPO));
    const stamp = flag('--stamp');
    if (stamp && (flag('--dry-run') || flag('--self-test') || flag('--preview') || flag('--peel'))) {
        console.log('ws-integrate: --stamp is refused with --dry-run, --self-test, --preview and --peel (lanes never stamp; the deploy stamps index.html once)');
        return false;
    }
    if (flag('--self-test')) return selfTest();
    if (flag('--dry-run')) return dryRun({ cut: opt('--cut', 'T6'), browser: !flag('--no-browser'), keep: flag('--keep'), record: opt('--record') });
    let did = false;
    if (flag('--extract')) {
        did = true;
        const out = opt('--out'); if (!out) fail('--extract needs --out <dir>');
        let keys;
        if (opt('--skills')) keys = opt('--skills').split(',').map((s) => s.trim()).filter(Boolean);
        else if (opt('--since')) {
            const old = git(root, ['show', `${opt('--since')}:${F_DATA}`]);
            const oldKeys = new Set(locate(REG.skills, old).flatMap((r) => r.items.map((it) => `${r.sub}:${evalValue(it.valueText).v}`)));
            keys = liveSkills(parseRegistries(readTree(root), [REG.skills])).map((s) => s.key).filter((k) => !oldKeys.has(k));
        } else if (opt('--cut')) keys = pinSections(root, opt('--cut')).flatMap((s) => s.keys);
        else fail('--extract needs --skills, --since or --cut');
        let groupOf = () => 'all', groupOrder = ['all'];
        if (opt('--group') === 'pins') {
            const secs = pinSections(root, null);
            const g = new Map(); secs.forEach((s, i) => s.keys.forEach((k) => g.set(k, `s${String(i + 1).padStart(2, '0')}`)));
            groupOf = (k) => g.get(k) || 'unpinned';
            groupOrder = [...new Set(keys.map(groupOf))].sort();
        }
        const { manifests, report } = extract({ root, skillKeys: keys, groupOf, groupOrder, laneName: opt('--lane', 'extracted') });
        writeManifests(resolve(out), manifests);
        console.log(`ws-integrate: extracted ${keys.length} skills into ${manifests.length} manifest(s) in ${out}`);
        for (const l of [...report.mixedLines, ...report.unevaluable]) console.log(`  note: ${l}`);
    }
    if (flag('--peel')) {
        did = true;
        const dir = opt('--manifests'); if (!dir) fail('--peel needs --manifests <dir>');
        const { picked } = listManifests(resolve(dir), opt('--lanes'));
        const changed = peel(root, ordered(picked, 'merge').map((m) => m.man));
        syntaxCheck(root, changed);
        console.log(`ws-integrate: peeled ${picked.length} manifest(s): ${changed.join(', ') || 'no change'}`);
    }
    if (flag('--apply')) {
        did = true;
        const r = runApply({ root, manifestsDir: resolve(opt('--manifests', join(root, 'design/lanes'))), lanes: opt('--lanes'), order: opt('--order', 'merge'), ledgerFile: resolve(opt('--ledger', join(root, 'design/lanes/applied.json'))), preview: flag('--preview') });
        if (!flag('--preview')) console.log(`ws-integrate: ${r.results.length} manifest(s); files changed: ${r.changed.join(', ') || 'none'}`);
    }
    if (flag('--regen')) {
        did = true;
        const res = regen(root, { catalogue: !flag('--no-catalogue') });
        if (res.some((r) => !r.ok)) return false;
    }
    if (stamp) {
        did = true;
        const r = runNode(root, 'ws-stamp-assets.cjs', []);
        console.log(`ws-integrate: --stamp: ${r.ok ? 'index.html stamped' : 'FAILED'} ${r.tail}`);
        if (!r.ok) return false;
    }
    if (!did) { console.log('usage: see the header of tests/scripts/ws-integrate.mjs'); return false; }
    return true;
}

let good = false;
try { good = await main(); } catch (e) {
    if (e instanceof IntegrateError) console.log(`ws-integrate: ${e.message}`);
    else console.log(e && e.stack || e);
    good = false;
}
console.log(`ws-integrate: ${good ? 'OK' : 'FAIL'}`);
process.exit(good ? 0 : 1);
