// ws-envelope: the engine modules, the structural fingerprint and the envelope of a certifiable
// (template, kind of worksheet) pair. design/IMPROVEMENT_PLAN.md §1.6.2 "Two fingerprints, kept
// apart" and §1.6.7 E1. Pure node: no browser, no server.
//
//   node tests/scripts/ws-envelope.mjs --engine [<kind>|<template>|all] [--json] [--out f.json] [--explain <file>]
//        the engine module list of every certifiable pair, computed BINDING BY BINDING (below);
//        with --json: {"<template>--<kind>": {files: [...], fingerprint}} plus the per-role lists;
//        --explain sheet/paginate.js prints, per walk, which of its bindings are used and the chain
//        of statements that first needed it (or "not reached")
//   node tests/scripts/ws-envelope.mjs --fingerprint <template>--<kind> [--geometry '{...}']
//        the structural fingerprint: hash(engine module bytes of the pair) + the geometry class
//   node tests/scripts/ws-envelope.mjs --diff <commitA> <commitB> [--json]
//   node tests/scripts/ws-envelope.mjs --voids <commitA>..<commitB> [--json]
//        which pairs' engine fingerprints change between two commits (files read with git)
//   node tests/scripts/ws-envelope.mjs --envelope <template>--<kind> [--out f.json]
//        [--skills cat:skill,...] [--items N]
//        the envelope (sizes, the kind's options, the template's skills and their option values,
//        keys, screen hosts) and a greedy all-pairs sample over it, written as JSON
//   node tests/scripts/ws-envelope.mjs --self-test [--declare-leaf <file>]
//        the walker on fixture module graphs, the leaf rule on fixture leaves, and every declared
//        data leaf of the tree; --declare-leaf adds a file to the declared leaves for that run
//   --root <dir>   read the tree from another checkout (default: this one)
//   --report-only  never exit non-zero
//
// Prints `ws-envelope: OK` or `ws-envelope: FAIL (n)` last and exits non-zero on FAIL.
//
// HOW THE ENGINE LIST IS COMPUTED
//   A whole-file import graph from `sheet/roles/independent.js` reaches about 90 files, because
//   `sheet/index.js` (the kit barrel) imports every template and provider. The walk here follows
//   NAMES, not files: every module is tokenized (a small hand-written ES tokenizer: node has no
//   bundler, esprima 4 cannot read the tree's syntax, and @babel in node_modules is only
//   code-frame), split into top-level statements, and each statement records the names it
//   declares and the identifiers it references. A root (the role or template module) has all of
//   its statements included; an included statement needs every top-level name it references;
//   a name declared in the module includes its declaring statement; an imported name is resolved
//   through `export {..} from`, `export * from`, `export * as` and aliases to the module that
//   DEFINES it. A module whose bindings are used also has its top-level side-effect statements
//   included (they run when it loads). Bare `import './x.js'` (the barrel's template
//   registrations) is NOT followed: a template is its own pair. A module that only passes names
//   through (a barrel) is not listed. Conservative choices: a namespace import that is used
//   (`import * as ns`) needs every export of its module; an identifier that a local shadows still
//   counts as a reference. Both can only add files, never drop one.
//
//   A pair's engine = the template's walk + the walk of every role its kind uses (KINDS) + the
//   bridge's render call into the kit (BRIDGE_ROOTS: practice.js `renderPlan`, `SHEET_ENGINE_CSS`)
//   + `print-sheet.js` hashed whole (BRIDGE_WHOLE). Against the plan's lists (2026-10-23, printed
//   on every --engine run): Single skill (independent.js) 17 = SAME; `stack` 18 = SAME; Mixed
//   practice 17, not 18: `sheet/paginate.js` is not reached. Evidence (`--engine mixed --explain
//   sheet/paginate.js`): mixed-practice.js and compose.js import nothing from paginate.js; in
//   practice.js its callers are `composeSheet` / `composePractice`, the Single skill and Sections
//   composer, which the mixed role does not use (it uses skillWords, levelLine,
//   sectionInstructionKey … and, through the bridge, renderPlan / decorate); the bridge's own
//   `paginate()` call (print-sheet.js, the Independent / More Practice letters) is in the hashed
//   bridge bytes. The plan's Mixed list was written as "the same plus compose.js and
//   mixed-practice.js", which overstates it by that one file.
//
// DECLARED DATA LEAVES (`DATA_LEAVES` below): the walk stops at a declared leaf. Its changes are
//   instance data, found by output (the coverage matrix), and void no certificate. `--self-test`
//   fails if a declared leaf exports anything but frozen plain tables (no functions, no imports,
//   no classes); a leaf that does not exist yet (sheet/instructions.js until M3) is reported and
//   skipped.
//
// HOOKS LEFT FOR LATER (not built here)
//   - M3 (row-2 lane): `contract.js` stops importing `presetOf` from `skill-presets.js` (the
//     lookup is registered by `js/modules/kit-setup.js`) and `INSTRUCTION_LIBRARY` moves to
//     `sheet/instructions.js`. The walk needs no change for the first: the edge disappears from
//     the source, so `skill-presets.js` drops out of every list by itself. For the second,
//     `sheet/instructions.js` is already declared in DATA_LEAVES; once it exists, the self-test
//     holds it to frozen plain tables. `kit-setup.js` must not be added as a root.
//   - M4 (row-2 lane): `print-sheet.js` is hashed WHOLE (BRIDGE_WHOLE) until its measuring and
//     key path moves into a module of its own; then that module replaces it in BRIDGE_WHOLE (or
//     becomes a walked root). The anchors modes `top` and `first` are read from `ANCHOR_MODES` in
//     `sheet/anchors.js`, so the envelope picks them up when they land; until then they are
//     listed as pending. Record / replay digests (`buildSheet` record mode, the coverage matrix's
//     `--digest`) are NOT part of this tool: the structural fingerprint here decides inheritance
//     and voiding only; the content hash and the replay digests belong to S4 / ws-coverage-matrix.
//   - `ws-grade-render --envelope <template>--<kind>` and the critic sample read the JSON that
//     `--envelope` writes (`sample.print`, `sample.screen`).
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync, mkdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { dirname, join, resolve, relative, posix } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
// The app's modules have no package.json "type"; node warns once per typeless ES module it loads.
const nodeWarn = process.listeners('warning');
process.removeAllListeners('warning');
process.on('warning', (w) => { if (w.code !== 'MODULE_TYPELESS_PACKAGE_JSON') nodeWarn.forEach((f) => f(w)); });
const argv = process.argv.slice(2);
const has = (k) => argv.includes('--' + k);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
const args = (k) => argv.flatMap((a, i) => (a === '--' + k && i + 1 < argv.length ? [argv[i + 1]] : []));
const ROOT = resolve(arg('root', join(HERE, '..', '..')));
const REPORT_ONLY = has('report-only');

/** Module paths are repo-relative posix paths; printed relative to js/modules. */
const MOD = 'js/modules';
const short = (p) => (p.startsWith(MOD + '/') ? p.slice(MOD.length + 1) : p);
const full = (p) => (p.startsWith(MOD + '/') || p.startsWith('tests/') ? p : `${MOD}/${p}`);

/* ================================================================== configuration */

/** The kinds of worksheet (IMPROVEMENT_PLAN §2.5) and the page roles each one uses. */
export const KINDS = {
    single: {
        label: 'Single skill',
        primary: 'sheet/roles/independent.js',
        // the page count / Faded packet, the short key, and the three Layout options
        roles: ['sheet/roles/independent.js', 'sheet/roles/more-practice.js', 'sheet/roles/key-short.js',
            'sheet/roles/fact-rows.js', 'sheet/roles/fact-probe.js', 'sheet/roles/todays-number.js'],
    },
    sections: {
        label: 'Sections',
        primary: 'sheet/roles/independent.js',        // today's sections: req.sections on the practice roles
        roles: ['sheet/roles/independent.js', 'sheet/roles/more-practice.js', 'sheet/roles/key-short.js'],
    },
    mixed: {
        label: 'Mixed practice',
        primary: 'sheet/roles/mixed-practice.js',
        roles: ['sheet/roles/mixed-practice.js', 'sheet/roles/key-short.js'],
    },
};
const KIND_ALIASES = { 'single-skill': 'single', independent: 'single', 'mixed-practice': 'mixed' };

/** Hashed whole, not walked, until its measuring and key path moves into a module (M4). */
export const BRIDGE_WHOLE = ['print-sheet.js'];

/**
 * The kit bindings the bridge itself calls to turn EVERY kind's PagePlan into pages
 * (`print-sheet.js`: `renderPlan(plan, {key})` after `mod.plan(input)`, and the engine stylesheet
 * it puts in the document). The bridge's bytes are hashed whole, but what it calls in the kit is
 * walked binding by binding like a role: without these roots the Mixed practice walk would miss
 * the render path (answer-key.js, frame.js, grid.js, paginate.js), because mixed-practice.js
 * itself only imports `skillWords` from practice.js. The bridge's measuring imports (refline,
 * layout helpers) join at M4, when that path moves into a module of its own (§1.6.3 step 3).
 */
export const BRIDGE_ROOTS = ['sheet/roles/practice.js#renderPlan', 'sheet/roles/practice.js#SHEET_ENGINE_CSS'];

/** Declared data leaves: the walk stops here. Must export frozen plain tables only. */
export const DATA_LEAVES = ['sheet/instructions.js'];   // exists from M3 (row-2 lane)

/** The lists the plan computed on 2026-10-23 (IMPROVEMENT_PLAN §1.6.2), compared on every --engine. */
const PLAN_LISTS = {
    'role:sheet/roles/independent.js': ['sheet/roles/independent.js', 'sheet/roles/practice.js', 'sheet/roles/answer-key.js',
        'sheet/anchors.js', 'sheet/adapters.js', 'sheet/cell.js', 'sheet/contract.js', 'sheet/frame.js', 'sheet/grid.js',
        'sheet/layout.js', 'sheet/lesson-css.js', 'sheet/lesson-icons.js', 'sheet/paginate.js', 'sheet/registry.js',
        'sheet/rng.js', 'sheet/tokens.js', 'skill-presets.js'],
    'role:sheet/roles/mixed-practice.js': ['sheet/roles/mixed-practice.js', 'sheet/roles/compose.js', 'sheet/roles/practice.js',
        'sheet/roles/answer-key.js', 'sheet/anchors.js', 'sheet/adapters.js', 'sheet/cell.js', 'sheet/contract.js',
        'sheet/frame.js', 'sheet/grid.js', 'sheet/layout.js', 'sheet/lesson-css.js', 'sheet/lesson-icons.js',
        'sheet/paginate.js', 'sheet/registry.js', 'sheet/rng.js', 'sheet/tokens.js', 'skill-presets.js'],
    'template:stack': ['sheet/cells/stack.js', 'sheet/cell.js', 'sheet/registry.js', 'sheet/steps.js', 'sheet/tokens.js',
        'sheet/supports.js', 'sheet/support-draw.js', 'sheet/touch-glyphs.js', 'sheet/touchdots.js', 'sheet/cells/pv.js',
        'sheet/cells/k2kit.js', 'sheet/cells/panes/index.js', 'sheet/cells/panes/extras.js', 'sheet/cells/panes/hand-art.js',
        'sheet/cells/panes/k2.js', 'sheet/cells/panes/kit.js', 'sheet/cells/panes/models.js', 'sheet/cells/panes/place.js'],
};

/* ================================================================== readers */

/** Reads the working tree. */
export function fsReader(root) {
    return {
        id: 'fs:' + root,
        exists: (p) => { try { return statSync(join(root, p)).isFile(); } catch { return false; } },
        read: (p) => readFileSync(join(root, p)),
        list: (dir) => {
            const out = [];
            const walkDir = (d) => {
                let ents = [];
                try { ents = readdirSync(join(root, d), { withFileTypes: true }); } catch { return; }
                for (const e of ents) {
                    const p = posix.join(d, e.name);
                    if (e.isDirectory()) walkDir(p); else out.push(p);
                }
            };
            walkDir(dir);
            return out.sort();
        },
    };
}

/** A reader with some files replaced or appended to (the self-test's voiding check, no git needed). */
export function overlayReader(base, overrides) {
    return {
        id: base.id + '+overlay',
        exists: (p) => p in overrides || base.exists(p),
        read: (p) => (p in overrides ? Buffer.from(typeof overrides[p] === 'function' ? overrides[p](base.read(p)) : overrides[p]) : base.read(p)),
        list: (dir) => [...new Set([...base.list(dir), ...Object.keys(overrides).filter((p) => p.startsWith(dir + '/'))])].sort(),
    };
}

const git = (...a) => execFileSync('git', ['-C', ROOT, ...a], { maxBuffer: 1 << 30 });

/** Reads one commit through git: one ls-tree, then every blob in one cat-file --batch. */
export function gitReader(commit) {
    const sha = git('rev-parse', '--verify', commit + '^{commit}').toString().trim();
    const tree = new Map();
    for (const line of git('ls-tree', '-r', sha, '--', MOD).toString().split('\n')) {
        const m = /^\d+ blob ([0-9a-f]+)\t(.+)$/.exec(line);
        if (m) tree.set(m[2], m[1]);
    }
    const blobs = new Map();
    const want = [...tree.entries()].filter(([p]) => p.endsWith('.js'));
    if (want.length) {
        const out = execFileSync('git', ['-C', ROOT, 'cat-file', '--batch'],
            { input: want.map(([, b]) => b).join('\n') + '\n', maxBuffer: 1 << 30 });
        let off = 0;
        for (const [p] of want) {
            const nl = out.indexOf(10, off);
            const size = Number(out.slice(off, nl).toString().split(' ')[2]);
            blobs.set(p, out.slice(nl + 1, nl + 1 + size));
            off = nl + 1 + size + 1;
        }
    }
    return {
        id: 'git:' + sha, sha,
        exists: (p) => tree.has(p),
        read: (p) => {
            if (blobs.has(p)) return blobs.get(p);
            if (!tree.has(p)) throw new Error(`${p} not in ${sha}`);
            return git('cat-file', 'blob', tree.get(p));
        },
        list: (dir) => [...tree.keys()].filter((p) => p.startsWith(dir + '/')).sort(),
    };
}

/* ================================================================== tokenizer */

const ID_START = /[\p{ID_Start}$_#\\]/u;
const ID_PART = /[\p{ID_Continue}$\u200c\u200d\\]/u;
const PUNCTS = ['>>>=', '...', '===', '!==', '**=', '<<=', '>>=', '>>>', '&&=', '||=', '??=', '=>', '==', '!=', '<=',
    '>=', '&&', '||', '??', '?.', '++', '--', '+=', '-=', '*=', '/=', '%=', '&=', '|=', '^=', '<<', '>>', '**'];
const KW_BEFORE_EXPR = new Set(['return', 'typeof', 'instanceof', 'in', 'of', 'new', 'delete', 'void', 'throw',
    'case', 'do', 'else', 'yield', 'await', 'export', 'default', 'extends']);
const NUM_RE = /(?:0[xXoObB][\da-fA-F_]+n?|(?:\d[\d_]*\.?[\d_]*|\.\d[\d_]*)(?:[eE][+-]?\d[\d_]*)?n?)/y;
const WS = new Set([' ', '\t', '\r', '\f', '\v', '\ufeff', '\u00a0', '\u2028', '\u2029']);

/**
 * Tokens: {t: 'id'|'str'|'tpl'|'num'|'re'|'p', v, line, nl}. `nl` = first token on its line.
 * Template literals give 'tpl' pieces with their `${` ... `}` code tokenized in between
 * (the opener is the punctuator '${').
 */
export function tokenize(src) {
    const toks = [];
    const n = src.length;
    const braces = [];             // '{' or 'tpl', to know where a template resumes
    let i = 0; let line = 1; let nl = true;
    const push = (t, v) => { toks.push({ t, v, line, nl }); nl = false; };
    const regexOk = () => {
        const p = toks[toks.length - 1];
        if (!p) return true;
        if (p.t === 'num' || p.t === 'str' || p.t === 'tpl' || p.t === 're') return false;
        if (p.t === 'id') return KW_BEFORE_EXPR.has(p.v);
        return !(p.v === ')' || p.v === ']' || p.v === '}' || p.v === '++' || p.v === '--');
    };
    const readTemplate = (j) => {
        let s = '';
        while (j < n) {
            const c = src[j];
            if (c === '\\') { s += src.slice(j, j + 2); if (src[j + 1] === '\n') line++; j += 2; continue; }
            if (c === '`') { push('tpl', s); return j + 1; }
            if (c === '$' && src[j + 1] === '{') { push('tpl', s); push('p', '${'); braces.push('tpl'); return j + 2; }
            if (c === '\n') line++;
            s += c; j++;
        }
        throw new Error(`unterminated template literal (line ${line})`);
    };
    while (i < n) {
        const c = src[i];
        if (c === '\n') { line++; nl = true; i++; continue; }
        if (WS.has(c)) { i++; continue; }
        if (c === '/' && src[i + 1] === '/') { while (i < n && src[i] !== '\n') i++; continue; }
        if (c === '/' && src[i + 1] === '*') {
            const e = src.indexOf('*/', i + 2);
            const end = e < 0 ? n : e + 2;
            for (let k = i; k < end; k++) if (src[k] === '\n') { line++; nl = true; }
            i = end; continue;
        }
        if (c === '#' && i === 0 && src[1] === '!') { while (i < n && src[i] !== '\n') i++; continue; }
        if (c === '"' || c === "'") {
            let j = i + 1; let s = '';
            while (j < n && src[j] !== c) {
                if (src[j] === '\\') { s += src[j + 1]; if (src[j + 1] === '\n') line++; j += 2; continue; }
                if (src[j] === '\n') throw new Error(`unterminated string (line ${line})`);
                s += src[j]; j++;
            }
            push('str', s); i = j + 1; continue;
        }
        if (c === '`') { const l0 = line; push('tpl', ''); toks.pop(); line = l0; i = readTemplate(i + 1); continue; }
        if (c === '}' && braces.length && braces[braces.length - 1] === 'tpl') {
            braces.pop(); push('p', '}'); i = readTemplate(i + 1); continue;
        }
        if (/[0-9]/.test(c) || (c === '.' && /[0-9]/.test(src[i + 1] || ''))) {
            NUM_RE.lastIndex = i; const m = NUM_RE.exec(src);
            push('num', m[0]); i += m[0].length; continue;
        }
        if (ID_START.test(c)) {
            let j = i + 1;
            while (j < n && ID_PART.test(src[j])) j++;
            push('id', src.slice(i, j)); i = j; continue;
        }
        if (c === '/' && regexOk()) {
            let j = i + 1; let cls = false;
            while (j < n) {
                const d = src[j];
                if (d === '\\') { j += 2; continue; }
                if (d === '\n') throw new Error(`unterminated regex (line ${line})`);
                if (d === '[') cls = true; else if (d === ']') cls = false; else if (d === '/' && !cls) break;
                j++;
            }
            j++;
            while (j < n && ID_PART.test(src[j])) j++;
            push('re', src.slice(i, j)); i = j; continue;
        }
        let p = PUNCTS.find((q) => src.startsWith(q, i));
        // `?.` followed by a digit is `? .5`, not optional chaining
        if (p === '?.' && /[0-9]/.test(src[i + 2] || '')) p = null;
        p = p || c;
        if (p === '{') braces.push('{');
        else if (p === '}') braces.pop();
        push('p', p); i += p.length;
    }
    if (braces.length) throw new Error(`unbalanced braces at end of file (${braces.length} open)`);
    return toks;
}

/* ================================================================== statements */

const OPENERS = new Set(['(', '[', '{', '${']);
const CLOSERS = new Set([')', ']', '}']);
const NO_ASI_WORDS = new Set(['in', 'instanceof', 'of', 'else', 'catch', 'finally', 'as', 'from']);

/** Top-level statements, with ASI approximated at line starts (identifier after a complete value). */
export function splitStatements(toks) {
    const out = []; let cur = []; let depth = 0;
    for (const t of toks) {
        if (depth === 0 && cur.length && t.nl && t.t === 'id' && !NO_ASI_WORDS.has(t.v)) {
            const prev = cur[cur.length - 1];
            const ends = prev.t !== 'p' || [')', ']', '}', '++', '--'].includes(prev.v);
            const contKw = prev.t === 'id' && KW_BEFORE_EXPR.has(prev.v);
            if (ends && !contKw) { out.push(cur); cur = []; }
        }
        cur.push(t);
        if (t.t === 'p') {
            if (OPENERS.has(t.v)) depth++;
            else if (CLOSERS.has(t.v)) depth--;
            else if (t.v === ';' && depth === 0) { out.push(cur); cur = []; }
        }
        if (depth < 0) throw new Error(`unbalanced closer on line ${t.line}`);
    }
    if (cur.length) out.push(cur);
    return out;
}

/** The identifiers an expression / declaration references (not property names, keys or method names). */
function refsOf(toks, from = 0, to = toks.length) {
    const refs = new Set();
    const stack = [];
    for (let k = from; k < to; k++) {
        const t = toks[k];
        if (t.t === 'p') {
            if (OPENERS.has(t.v)) stack.push(t.v); else if (CLOSERS.has(t.v)) stack.pop();
            continue;
        }
        if (t.t !== 'id' || t.v.startsWith('#')) continue;
        const prev = toks[k - 1]; const next = toks[k + 1];
        if (prev && prev.t === 'p' && (prev.v === '.' || prev.v === '?.')) continue;   // member
        if (t.v === 'import' && next && next.t === 'p' && next.v === '.') continue;      // import.meta
        const inBrace = stack[stack.length - 1] === '{';
        const atElemStart = prev && prev.t === 'p' && (prev.v === '{' || prev.v === ',' || prev.v === '}' || prev.v === ';');
        if (inBrace && next && next.t === 'p' && next.v === ':' && atElemStart) continue;  // object key / label
        if (inBrace && next && next.t === 'p' && next.v === '(') {                       // method definition?
            let d = 0; let j = k + 1;
            for (; j < to; j++) {
                const u = toks[j];
                if (u.t !== 'p') continue;
                if (OPENERS.has(u.v)) d++; else if (CLOSERS.has(u.v)) { d--; if (d === 0) break; }
            }
            const after = toks[j + 1];
            const prevWord = prev && prev.t === 'id' && ['get', 'set', 'async', 'static'].includes(prev.v);
            if (after && after.t === 'p' && after.v === '{' && (atElemStart || prevWord || (prev && prev.t === 'p' && prev.v === '*'))) continue;
        }
        refs.add(t.v);
    }
    return refs;
}

/** Binding names in a declarator pattern: identifiers not used as keys and not defaults' values. */
function patternNames(toks, from, to) {
    const names = []; let depth = 0;
    for (let k = from; k < to; k++) {
        const t = toks[k];
        if (t.t === 'p') {
            if (OPENERS.has(t.v)) depth++; else if (CLOSERS.has(t.v)) depth--;
            if (t.v === '=' && depth > 0) {   // a default value: skip to the next , or closer at this depth
                let d = 0; k++;
                for (; k < to; k++) {
                    const u = toks[k];
                    if (u.t === 'p' && OPENERS.has(u.v)) d++;
                    else if (u.t === 'p' && CLOSERS.has(u.v)) { if (d === 0) { k--; break; } d--; }
                    else if (u.t === 'p' && u.v === ',' && d === 0) { k--; break; }
                }
            }
            continue;
        }
        if (t.t !== 'id') continue;
        const next = toks[k + 1];
        if (next && next.t === 'p' && next.v === ':') continue;
        names.push(t.v);
    }
    return names;
}

/** The declarators of a const/let/var statement body: [{names, init: [from, to]}]. */
function declarators(toks, from, to) {
    const out = []; let start = from; let depth = 0;
    const flush = (end) => {
        if (end <= start) return;
        let eq = -1; let d = 0;
        for (let k = start; k < end; k++) {
            const t = toks[k];
            if (t.t === 'p' && OPENERS.has(t.v)) d++; else if (t.t === 'p' && CLOSERS.has(t.v)) d--;
            else if (t.t === 'p' && t.v === '=' && d === 0) { eq = k; break; }
        }
        const patEnd = eq < 0 ? end : eq;
        const names = toks[start].t === 'id' ? [toks[start].v] : patternNames(toks, start, patEnd);
        out.push({ names, refs: refsOf(toks, eq < 0 ? end : eq + 1, end), patternRefs: toks[start].t === 'id' ? new Set() : refsOf(toks, start, patEnd) });
    };
    for (let k = from; k < to; k++) {
        const t = toks[k];
        if (t.t === 'p' && OPENERS.has(t.v)) depth++;
        else if (t.t === 'p' && CLOSERS.has(t.v)) depth--;
        else if (t.t === 'p' && t.v === ',' && depth === 0) { flush(k); start = k + 1; }
        else if (t.t === 'p' && t.v === ';' && depth === 0) { flush(k); start = k + 1; return out; }
    }
    flush(to);
    return out;
}

/** `{ a, b as c, default as d }` specifiers from toks[k] === '{'. Returns [list, index after '}']. */
function specList(toks, k) {
    const list = []; k++;
    while (k < toks.length && !(toks[k].t === 'p' && toks[k].v === '}')) {
        const a = toks[k];
        if (a.t === 'p' && a.v === ',') { k++; continue; }
        let local = a.v;
        let alias = a.v;
        if (toks[k + 1] && toks[k + 1].t === 'id' && toks[k + 1].v === 'as') { alias = toks[k + 2].v; k += 3; } else k++;
        list.push({ name: local, alias });
    }
    return [list, k + 1];
}

/**
 * One module: its statements, imports, exports and where each top-level name is declared.
 * @returns {{stmts, imports: Map, exports: Map, stars: string[], declared: Map, side: number[],
 *            bare: string[], dynamic: string[]}}
 */
export function parseModule(src) {
    const toks = tokenize(src);
    const raw = splitStatements(toks);
    const mod = { stmts: [], imports: new Map(), exports: new Map(), stars: [], declared: new Map(), side: [], bare: [], dynamic: [] };
    const declare = (name, idx) => { if (!mod.declared.has(name)) mod.declared.set(name, []); mod.declared.get(name).push(idx); };
    const isP = (t, v) => t && t.t === 'p' && t.v === v;
    const isId = (t, v) => t && t.t === 'id' && (v === undefined || t.v === v);
    for (const s of raw) {
        const idx = mod.stmts.length;
        const st = { kind: 'side', refs: new Set(), line: s[0].line, declares: [] };
        mod.stmts.push(st);
        // dynamic import() anywhere in the statement
        for (let k = 0; k < s.length - 2; k++) {
            if (isId(s[k], 'import') && isP(s[k + 1], '(') && !isP(s[k - 1], '.')) {
                mod.dynamic.push(s[k + 2].t === 'str' ? s[k + 2].v : '<expr>');
            }
        }
        const t0 = s[0]; const t1 = s[1];
        if (isP(t0, ';')) { st.kind = 'empty'; continue; }
        // ---------------------------------------------------------------- import
        if (isId(t0, 'import') && !isP(t1, '(') && !isP(t1, '.')) {
            st.kind = 'import';
            if (t1.t === 'str') { mod.bare.push(t1.v); continue; }
            const fromAt = s.findIndex((t, k) => k > 0 && isId(t, 'from') && s[k + 1] && s[k + 1].t === 'str');
            const spec = s[fromAt + 1].v;
            let k = 1;
            while (k < fromAt) {
                const t = s[k];
                if (isP(t, ',')) { k++; continue; }
                if (isP(t, '{')) {
                    const [list, nk] = specList(s, k);
                    for (const { name, alias } of list) mod.imports.set(alias, { spec, imported: name });
                    k = nk; continue;
                }
                if (isP(t, '*')) { mod.imports.set(s[k + 2].v, { spec, imported: '*' }); k += 3; continue; }
                if (isId(t)) { mod.imports.set(t.v, { spec, imported: 'default' }); k++; continue; }
                k++;
            }
            continue;
        }
        // ---------------------------------------------------------------- export
        if (isId(t0, 'export')) {
            if (isP(t1, '*')) {                               // export * from / export * as ns from
                st.kind = 'reexport';
                if (isId(s[2], 'as')) mod.exports.set(s[3].v, { spec: s[5].v, imported: '*' });
                else mod.stars.push(s[3].v);
                continue;
            }
            if (isP(t1, '{')) {
                const [list, nk] = specList(s, 1);
                if (isId(s[nk], 'from')) {
                    st.kind = 'reexport';
                    for (const { name, alias } of list) mod.exports.set(alias, { spec: s[nk + 1].v, imported: name });
                } else {
                    st.kind = 'exportlist';
                    for (const { name, alias } of list) mod.exports.set(alias, { local: name });
                }
                continue;
            }
            if (isId(t1, 'default')) {
                st.kind = 'decl';
                let k = 2;
                if (isId(s[k], 'async')) k++;
                if ((isId(s[k], 'function') || isId(s[k], 'class'))) {
                    let j = k + 1; if (isP(s[j], '*')) j++;
                    if (isId(s[j])) { st.declares.push(s[j].v); declare(s[j].v, idx); mod.exports.set('default', { local: s[j].v }); st.refs = refsOf(s, j + 1); continue; }
                }
                st.declares.push('*default*'); declare('*default*', idx);
                mod.exports.set('default', { local: '*default*' });
                st.refs = refsOf(s, 2);
                continue;
            }
            analyseDecl(s, 1, st, idx, true);
            continue;
        }
        analyseDecl(s, 0, st, idx, false);
    }
    function analyseDecl(s, k, st, idx, exported) {
        let j = k;
        if (isId(s[j], 'async') && isId(s[j + 1], 'function')) j++;
        if (isId(s[j], 'function') || isId(s[j], 'class')) {
            let n = j + 1; if (isP(s[n], '*')) n++;
            if (isId(s[n])) {
                st.kind = 'decl'; st.declares.push(s[n].v); declare(s[n].v, idx);
                if (exported) mod.exports.set(s[n].v, { local: s[n].v });
                st.refs = refsOf(s, n + 1);
                // a function declaration followed by an expression on the same split (no ASI) stays one statement
                return;
            }
        }
        if (isId(s[j], 'const') || isId(s[j], 'let') || isId(s[j], 'var')) {
            st.kind = 'decl';
            const decls = declarators(s, j + 1, s.length);
            // each declarator becomes its own pseudo-statement so `const a = f(), b = g()` stays binding-precise
            const first = decls.shift();
            const assign = (target, d) => {
                for (const nm of d.names) { target.declares.push(nm); declare(nm, mod.stmts.indexOf(target)); if (exported) mod.exports.set(nm, { local: nm }); }
                target.refs = new Set([...d.refs, ...d.patternRefs].filter((r) => !d.names.includes(r)));
            };
            if (first) assign(st, first);
            for (const d of decls) {
                const extra = { kind: 'decl', refs: new Set(), line: st.line, declares: [] };
                mod.stmts.push(extra);
                assign(extra, d);
            }
            return;
        }
        st.kind = 'side';
        st.refs = refsOf(s, k);
        mod.side.push(idx);
    }
    return mod;
}

/* ================================================================== the binding walk */

/** Resolve an import specifier against the importing file (repo-relative posix). */
function resolveSpec(fromFile, spec) {
    if (!spec.startsWith('./') && !spec.startsWith('../') && !spec.startsWith('/')) return null;   // bare: external
    return posix.normalize(posix.join(posix.dirname(fromFile), spec));
}

/** A parse cache keyed by file content hash, shared across readers (commits). */
const PARSE_CACHE = new Map();
const sha256 = (buf) => createHash('sha256').update(buf).digest('hex');

export function makeWalker(reader, { leaves = DATA_LEAVES.map(full) } = {}) {
    const mods = new Map();
    const leafSet = new Set(leaves);
    const mod = (file) => {
        if (mods.has(file)) return mods.get(file);
        let m = null;
        if (reader.exists(file)) {
            const buf = reader.read(file);
            const h = sha256(buf);
            if (!PARSE_CACHE.has(h)) {
                try { PARSE_CACHE.set(h, parseModule(buf.toString('utf8'))); }
                catch (e) { throw new Error(`${file}: ${e.message}`); }
            }
            m = PARSE_CACHE.get(h);
        }
        mods.set(file, m);
        return m;
    };
    /** Does `file` export `name`, directly or through `export *`? */
    const exportsName = (file, name, seen = new Set()) => {
        if (seen.has(file)) return false; seen.add(file);
        const m = mod(file); if (!m) return false;
        if (m.exports.has(name)) return true;
        if (name === 'default') return false;
        return m.stars.some((sp) => { const t = resolveSpec(file, sp); return t && exportsName(t, name, seen); });
    };
    const allExportNames = (file, seen = new Set()) => {
        if (seen.has(file)) return new Set(); seen.add(file);
        const m = mod(file); if (!m) return new Set();
        const names = new Set(m.exports.keys());
        for (const sp of m.stars) {
            const t = resolveSpec(file, sp); if (!t) continue;
            for (const nm of allExportNames(t, seen)) if (nm !== 'default') names.add(nm);
        }
        return names;
    };

    /** Walk from roots; returns {files: sorted short paths, leaves, warnings, external, dynamic}. */
    return function walk(roots) {
        const included = new Map();          // file -> Set(stmt idx)
        const localsDone = new Set();        // file\0name
        const exportsDone = new Set();       // file\0name
        const leafHits = new Set(); const warnings = []; const external = new Set(); const dynamic = new Set();
        const work = [];
        const firstWhy = new Map();          // file -> the statement that first needed it
        const labelOf = (file, idx) => {
            const st = mod(file).stmts[idx];
            return `${short(file)}:${st.declares.length ? st.declares.join(',') : `<top-level statement, line ${st.line}>`}`;
        };
        const includeStmt = (file, idx, why) => {
            if (!included.has(file)) {
                included.set(file, new Set());
                firstWhy.set(short(file), why);
                const m = mod(file);
                for (const sp of m.dynamic) dynamic.add(`${short(file)} -> ${sp}`);
                for (const sIdx of m.side) work.push(() => includeStmt(file, sIdx, `${short(file)} loads`));
            }
            const set = included.get(file);
            if (set.has(idx)) return;
            set.add(idx);
            const st = mod(file).stmts[idx];
            const me = labelOf(file, idx);
            for (const r of st.refs) work.push(() => needLocal(file, r, me));
        };
        const needLocal = (file, name, why) => {
            const key = file + '\0' + name;
            if (localsDone.has(key)) return; localsDone.add(key);
            const m = mod(file);
            const decl = m.declared.get(name);
            if (decl) { for (const idx of decl) includeStmt(file, idx, why); return; }
            const imp = m.imports.get(name);
            if (imp) {
                const target = resolveSpec(file, imp.spec);
                if (!target) { external.add(imp.spec); return; }
                needExport(target, imp.imported, file, why);
            }
            // otherwise a global (window, Math …) or a local of an inner scope: nothing to follow
        };
        const needExport = (file, name, via, why) => {
            const key = file + '\0' + name;
            if (exportsDone.has(key)) return; exportsDone.add(key);
            if (leafSet.has(file)) { leafHits.add(short(file)); return; }
            const m = mod(file);
            if (!m) { warnings.push(`${short(via)} imports ${name} from missing ${short(file)}`); return; }
            if (name === '*') { for (const nm of allExportNames(file)) needExport(file, nm, via, why); return; }
            const e = m.exports.get(name);
            if (e) {
                if ('local' in e) { needLocal(file, e.local, why); return; }
                const target = resolveSpec(file, e.spec);
                if (!target) { external.add(e.spec); return; }
                needExport(target, e.imported, file, why);
                return;
            }
            for (const sp of m.stars) {
                const target = resolveSpec(file, sp);
                if (target && exportsName(target, name)) { needExport(target, name, file, why); return; }
            }
            warnings.push(`${short(via)} imports '${name}' that ${short(file)} does not export`);
        };
        for (const r of roots) {
            const [rf, binding] = r.split('#');
            const file = full(rf);
            if (binding) { work.push(() => needExport(file, binding, file, `root ${r}`)); continue; }   // one binding of a module
            if (leafSet.has(file)) { leafHits.add(short(file)); continue; }
            const m = mod(file);
            if (!m) { warnings.push(`root ${short(file)} is missing`); continue; }
            m.stmts.forEach((st, idx) => { if (st.kind === 'decl' || st.kind === 'side') work.push(() => includeStmt(file, idx, `root ${r}`)); });
            for (const [, e] of m.exports) if ('local' in e) work.push(() => needLocal(file, e.local, `root ${r}`));
        }
        // breadth-first, so each file's first reason is a short chain
        for (let w = 0; w < work.length; w++) work[w]();
        const files = [...included.keys()].filter((f) => included.get(f).size > 0).map(short).sort();
        const explain = {};
        for (const [f, set] of included) {
            if (!set.size) continue;
            explain[short(f)] = { why: firstWhy.get(short(f)), uses: [...set].sort((a, b) => a - b).map((i) => labelOf(f, i).split(':').slice(1).join(':')) };
        }
        return { files, leaves: [...leafHits].sort(), warnings, external: [...external].sort(), dynamic: [...dynamic].sort(), explain };
    };
}

/* ================================================================== templates and pairs */

/** template id -> the module that registers it (the template's root). */
export function templateRoots(reader) {
    const out = new Map();
    for (const f of reader.list(`${MOD}/sheet`)) {
        if (!f.endsWith('.js')) continue;
        const src = reader.read(f).toString('utf8');
        const consts = new Map();
        for (const m of src.matchAll(/(?:export\s+)?const\s+([A-Za-z_$][\w$]*)\s*=\s*(['"])([\w-]+)\2/g)) consts.set(m[1], m[3]);
        let loose = false;
        for (const m of src.matchAll(/(?:^|[^\w.])register(?:Cell)?\(\s*(?:(['"])([\w-]+)\1|([A-Za-z_$][\w$]*))\s*,/gm)) {
            if (/registry\.js$/.test(f)) continue;
            const id = m[2] || consts.get(m[3]);
            if (id) out.set(id, f); else loose = true;
        }
        if (loose) {   // registered in a loop over a *_TEMPLATE_IDS table of the same file
            for (const m of src.matchAll(/export\s+const\s+\w*TEMPLATE_IDS\s*=\s*(?:Object\.freeze\()?\[([^\]]*)\]/g)) {
                for (const q of m[1].matchAll(/(['"])([\w-]+)\1/g)) if (!out.has(q[2])) out.set(q[2], f);
            }
        }
    }
    return new Map([...out.entries()].sort((a, b) => a[0].localeCompare(b[0])));
}

/** The engine of every pair: per-role lists, per-template lists, and each pair's union + hash. */
export function engineLists(reader, { templates = null, kinds = Object.keys(KINDS) } = {}) {
    const walk = makeWalker(reader);
    const roots = templateRoots(reader);
    const roles = {}; const tpls = {};
    for (const k of kinds) for (const r of KINDS[k].roles) if (!roles[r]) roles[r] = walk([r]);
    roles.bridge = walk(BRIDGE_ROOTS);
    const tplIds = templates || [...roots.keys()];
    for (const id of tplIds) {
        if (!roots.has(id)) throw new Error(`unknown template '${id}' (known: ${[...roots.keys()].join(', ')})`);
        tpls[id] = { root: short(roots.get(id)), ...walk([short(roots.get(id))]) };
    }
    const pairs = {};
    for (const id of tplIds) {
        for (const k of kinds) {
            const files = new Set([...tpls[id].files, ...BRIDGE_WHOLE.filter((b) => reader.exists(full(b)))]);
            for (const r of [...KINDS[k].roles, 'bridge']) for (const f of roles[r].files) files.add(f);
            const list = [...files].sort();
            pairs[`${id}--${k}`] = { files: list, fingerprint: hashFiles(reader, list) };
        }
    }
    return { roles, templates: tpls, pairs };
}

/** sha256 over the files in sorted order: path NUL byte-length NUL bytes, per file. */
export function hashFiles(reader, files) {
    const h = createHash('sha256');
    for (const f of [...files].sort()) {
        const buf = reader.read(full(f));
        h.update(f); h.update('\0'); h.update(String(buf.length)); h.update('\0'); h.update(buf);
    }
    return h.digest('hex');
}

/* ================================================================== geometry class */

const GEOMETRY_FIELDS = {
    size: { values: ['S', 'M', 'L'], dflt: 'M' },
    look: { values: ['ican', 'daily'], dflt: 'ican' },
    columns: { dflt: 'auto' },                                   // 'auto' or 1..10
    sizeClasses: { dflt: [] },                                   // the size class of each cell / the set on the page
    examples: { values: ['off', 'side', 'sections', 'top', 'first'], dflt: 'off' },
    fade: { values: ['none', 'problems', 'page', 'packet'], dflt: 'none' },
    layout: { values: ['standard', 'fact-rows', 'timed', 'todays-number'], dflt: 'standard' },
    options: { dflt: {} },                                       // geometry-changing option values
};

export function geometryClass(template, kind, g = {}) {
    const unknown = Object.keys(g).filter((k) => !(k in GEOMETRY_FIELDS) && k !== 'template' && k !== 'kind');
    if (unknown.length) throw new Error(`unknown geometry field(s): ${unknown.join(', ')} (known: ${Object.keys(GEOMETRY_FIELDS).join(', ')})`);
    const out = { template, kind }; const defaulted = [];
    for (const [k, spec] of Object.entries(GEOMETRY_FIELDS)) {
        let v = g[k];
        if (v === undefined) { v = spec.dflt; defaulted.push(k); }
        if (spec.values && !spec.values.includes(v)) throw new Error(`geometry.${k} = ${JSON.stringify(v)}; one of ${spec.values.join(', ')}`);
        if (k === 'columns' && v !== 'auto' && !(Number.isInteger(v) && v >= 1 && v <= 10)) throw new Error('geometry.columns: auto or 1..10');
        if (k === 'sizeClasses') v = [...new Set([].concat(v).map(String))].sort();
        if (k === 'options') v = Object.fromEntries(Object.entries(v || {}).sort(([a], [b]) => a.localeCompare(b)));
        out[k] = v;
    }
    return { geometry: out, defaulted };
}

export function structuralFingerprint(engineFingerprint, geometry) {
    return sha256(Buffer.from(JSON.stringify({ engine: engineFingerprint, geometry })));
}

/* ================================================================== leaves */

/** Static + live check that a declared leaf exports frozen plain tables only. Returns problems. */
export async function checkLeaf(absPath) {
    const problems = [];
    let src;
    try { src = readFileSync(absPath, 'utf8'); } catch { return null; }   // missing: caller reports
    let m;
    try { m = parseModule(src); } catch (e) { return [`does not parse: ${e.message}`]; }
    if (m.imports.size || m.bare.length || m.dynamic.length) problems.push('imports another module');
    if (m.stars.length || [...m.exports.values()].some((e) => 'spec' in e)) problems.push('re-exports another module');
    const toks = tokenize(src);
    for (let k = 0; k < toks.length; k++) {
        const t = toks[k];
        if (t.t === 'id' && (t.v === 'function' || t.v === 'class')) problems.push(`declares a ${t.v} (line ${t.line})`);
        if (t.t === 'p' && t.v === '=>') problems.push(`declares an arrow function (line ${t.line})`);
        if (t.t === 'id' && (t.v === 'let' || t.v === 'var')) problems.push(`declares a mutable binding '${t.v}' (line ${t.line})`);
        if (t.t === 'id' && t.v === 'new') problems.push(`constructs an object with new (line ${t.line})`);
    }
    if (problems.length) return [...new Set(problems)];
    // live: import it (it imports nothing, so this runs no other code) and check every value
    let ns;
    try { ns = await import(pathToFileURL(absPath).href + '?leaf=' + Date.now()); }
    catch (e) { return [`does not load: ${e.message}`]; }
    const seen = new Set();
    const plain = (v, path) => {
        if (v === null || ['string', 'number', 'boolean', 'undefined'].includes(typeof v)) return;
        if (typeof v === 'function') { problems.push(`${path} is a function`); return; }
        if (typeof v !== 'object') { problems.push(`${path} is a ${typeof v}`); return; }
        if (seen.has(v)) return; seen.add(v);
        const proto = Object.getPrototypeOf(v);
        if (!Array.isArray(v) && proto !== Object.prototype && proto !== null) problems.push(`${path} is not a plain object or array`);
        if (!Object.isFrozen(v)) problems.push(`${path} is not frozen`);
        for (const k of Reflect.ownKeys(v)) {
            const d = Object.getOwnPropertyDescriptor(v, k);
            if (d.get || d.set) { problems.push(`${path}.${String(k)} is an accessor`); continue; }
            plain(d.value, `${path}.${String(k)}`);
        }
    };
    for (const k of Object.keys(ns)) plain(ns[k], k);
    return problems;
}

/* ================================================================== envelope + all-pairs */

/** The name of one pair of values, the same whichever dimension order or skill it comes from. */
export const pairKey = (n1, v1, n2, v2) => {
    const a = `${n1}=${JSON.stringify(v1)}`; const b = `${n2}=${JSON.stringify(v2)}`;
    return a < b ? `${a}|${b}` : `${b}|${a}`;
};

/**
 * Greedy all-pairs: rows covering every pair of values across the dimensions at least once.
 * `shared` (optional Set of pairKey) holds pairs already covered elsewhere — another skill with the
 * same option — which are not covered again; the pairs this call covers are added to it.
 */
export function allPairs(dims, seed = 1, shared = null) {
    const names = Object.keys(dims).filter((k) => dims[k].length);
    const vals = names.map((k) => dims[k]);
    const uncovered = new Set();
    const gk = (a, i, b, j) => pairKey(names[a], vals[a][i], names[b], vals[b][j]);
    for (let a = 0; a < names.length; a++) for (let b = a + 1; b < names.length; b++)
        for (let i = 0; i < vals[a].length; i++) for (let j = 0; j < vals[b].length; j++) {
            if (!shared || !shared.has(gk(a, i, b, j))) uncovered.add(`${a}:${i}|${b}:${j}`);
        }
    if (names.length === 1) return vals[0].map((v) => ({ [names[0]]: v }));
    const rows = [];
    let s = seed >>> 0;
    const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    while (uncovered.size) {
        let best = null; let bestGain = -1;
        for (let attempt = 0; attempt < 30; attempt++) {
            // start from one uncovered pair, then fill each other dimension with the value covering most
            const pick = [...uncovered][Math.floor(rand() * uncovered.size)];
            const [[a, i], [b, j]] = pick.split('|').map((x) => x.split(':').map(Number));
            const row = new Array(names.length).fill(-1); row[a] = i; row[b] = j;
            const order = names.map((_, d) => d).filter((d) => row[d] < 0).sort(() => rand() - 0.5);
            for (const d of order) {
                let bv = 0; let bg = -1;
                for (let v = 0; v < vals[d].length; v++) {
                    let g = 0;
                    for (let e = 0; e < names.length; e++) {
                        if (e === d || row[e] < 0) continue;
                        const key = e < d ? `${e}:${row[e]}|${d}:${v}` : `${d}:${v}|${e}:${row[e]}`;
                        if (uncovered.has(key)) g++;
                    }
                    if (g > bg || (g === bg && rand() < 0.3)) { bg = g; bv = v; }
                }
                row[d] = bv;
            }
            let gain = 0;
            for (let x = 0; x < names.length; x++) for (let y = x + 1; y < names.length; y++) if (uncovered.has(`${x}:${row[x]}|${y}:${row[y]}`)) gain++;
            if (gain > bestGain) { bestGain = gain; best = row; }
        }
        for (let x = 0; x < names.length; x++) for (let y = x + 1; y < names.length; y++) {
            uncovered.delete(`${x}:${best[x]}|${y}:${best[y]}`);
            if (shared) shared.add(gk(x, best[x], y, best[y]));
        }
        rows.push(Object.fromEntries(names.map((k, d) => [k, vals[d][best[d]]])));
    }
    return rows;
}

/** Every pair of values covered? (the check the critic sample relies on) */
export function coversAllPairs(dims, rows) {
    const names = Object.keys(dims).filter((k) => dims[k].length);
    const key = (v) => JSON.stringify(v);
    for (let a = 0; a < names.length; a++) for (let b = a + 1; b < names.length; b++) {
        const got = new Set(rows.map((r) => key(r[names[a]]) + '|' + key(r[names[b]])));
        for (const x of dims[names[a]]) for (const y of dims[names[b]]) if (!got.has(key(x) + '|' + key(y))) return `${names[a]}=${key(x)} with ${names[b]}=${key(y)}`;
    }
    return null;
}

/** The anchors modes the tree has today (ANCHOR_MODES in sheet/anchors.js). */
function anchorModes(reader) {
    const src = reader.read(full('sheet/anchors.js')).toString('utf8');
    const m = /export\s+const\s+ANCHOR_MODES\s*=\s*(?:Object\.freeze\()?\[([^\]]*)\]/.exec(src);
    return m ? [...m[1].matchAll(/(['"])([\w-]+)\1/g)].map((q) => q[2]) : [];
}

/** The kind's own options (§2.5), restricted to what the engine supports today. */
function kindDimensions(kind, reader) {
    const modes = anchorModes(reader);
    const want = {
        single: ['off', 'top', 'sections', 'side'],      // None, top of each page, start each group, with each problem
        sections: ['off', 'top', 'first'],
        mixed: ['off', 'top', 'sections', 'first'],
    }[kind];
    const examples = want.filter((m) => modes.includes(m));
    const pending = want.filter((m) => !modes.includes(m)).map((m) => ({ option: 'examples', value: m, waitsFor: 'M4 (anchors mode not in ANCHOR_MODES yet)' }));
    const dims = { size: ['S', 'M', 'L'], pages: [1, 2, 3], examples };
    if (kind === 'single') {
        Object.assign(dims, { fade: ['none', 'problems', 'page', 'packet'], layout: ['standard', 'fact-rows', 'timed', 'todays-number'] });
    } else if (kind === 'sections') {
        Object.assign(dims, { weights: ['equal', 'one-more', 'one-less'], fade: ['none', 'problems'], sections: ['per-skill', 'grouped', 'parts'], bringBack: [false, true] });
        pending.push({ option: 'sections', value: 'grouped|parts', waitsFor: 'M4 (req.sections[i].title)' });
    } else {
        Object.assign(dims, { weights: ['equal', 'one-more', 'one-less'], bringBack: [false, true] });
    }
    dims.key = ['copy/end', 'copy/after-page', 'short/end', 'short/after-page'];   // normKeyOptions: style x placement
    return { dims, pending };
}

/** The values of one skill option the envelope samples. */
function optionValues(def) {
    // hidden (folded) options and the online-play group (calculator, skip after …) change no drawing
    if (def.hidden || def.group === 'play') return null;
    switch (def.type) {
    case 'enum': return (def.values || []).map((v) => v.v);
    case 'bool': return [false, true];
    case 'int': {
        const lo = def.min ?? def.default; const hi = def.max ?? def.default;
        return [...new Set([lo, def.default, hi].filter((v) => v !== undefined && v !== null))];
    }
    case 'set': {
        const all = (def.values || []).map((v) => v.v);
        const out = [{ set: 'default' }];
        if (all.length) { out.push({ set: [all[0]] }); out.push({ set: [all[all.length - 1]] }); out.push({ set: 'all' }); }
        return out;
    }
    default: return [{ value: 'default' }];   // 'rows' and anything new: its default only
    }
}

async function loadApp(root) {
    globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem() {}, removeItem() {} };
    if (!globalThis.window) globalThis.window = globalThis;
    const quiet = console.log; console.log = () => {};
    try {
        const url = (p) => pathToFileURL(join(root, MOD, p)).href;
        const [gq, data, so] = await Promise.all([import(url('generate-question.js')), import(url('data.js')), import(url('skill-options.js'))]);
        return { gq, data, so };
    } finally { console.log = quiet; }
}

/** Which skills draw `template`, found by generating seeded items in node (defaults + one option at a time). */
async function skillsDrawing(template, app, { items = 6, only = null } = {}) {
    const found = [];
    const cats = Object.keys(app.data.SKILLS);
    const warn = console.warn; const err = console.error; const log = console.log;
    console.warn = () => {}; console.error = () => {}; console.log = () => {};
    try {
        for (const cat of cats) {
            for (const s of app.data.SKILLS[cat]) {
                const key = `${cat}:${s.v}`;
                if (s.retired || (only && !only.includes(key))) continue;
                const defs = (app.so.optionsFor(cat, s.v) || []).filter((d) => !d.hidden);
                const trials = [{}];
                for (const d of defs) for (const v of optionValues(d) || []) {
                    if (v && typeof v === 'object' && 'set' in v) { if (v.set !== 'default') trials.push({ [d.id]: v.set === 'all' ? (d.values || []).map((x) => x.v) : v.set }); }
                    else if (!(v && typeof v === 'object')) trials.push({ [d.id]: v });
                }
                let hits = 0; const via = new Set();
                for (const opts of trials) {
                    for (let i = 0; i < items; i++) {
                        let q = null;
                        try { q = app.gq.generateQuestionFor({ category: cat, skill: s.v, opts, seed: 7000 + i * 13, itemIndex: i, itemCount: items }); } catch { q = null; }
                        const t = (q && q.cell && q.cell.template) || (q && q.cellTemplate) || 'legacy';
                        if (t === template) { hits++; via.add(Object.keys(opts).length ? JSON.stringify(opts) : 'defaults'); }
                    }
                }
                if (hits) found.push({ skill: key, defs, via: [...via] });
            }
        }
    } finally { console.warn = warn; console.error = err; console.log = log; }
    return found;
}

export async function buildEnvelope(pairId, reader, { only = null, items = 6 } = {}) {
    const [template, kindRaw] = pairId.split('--');
    const kind = KIND_ALIASES[kindRaw] || kindRaw;
    if (!KINDS[kind]) throw new Error(`unknown kind '${kindRaw}' (single, sections, mixed)`);
    const app = await loadApp(ROOT);
    const skills = await skillsDrawing(template, app, { items, only });
    const { dims, pending } = kindDimensions(kind, reader);
    const hosts = ['practice-card', 'online-worksheet', 'quiz'];
    // the print sample: all pairs over the kind's options x the skill; then each skill's own options
    // paired with size and with each other (a skill option only means something on its own skill).
    // A pair of option values shared by several skills (the same option id and value) is covered
    // once: skills are taken with the most options first, and later skills add rows only for
    // pairs not yet covered.
    const printDims = { ...dims, skill: skills.map((s) => s.skill) };
    const base = skills.length ? allPairs(printDims, 11) : [];
    const perSkill = [];
    const envelopeSize = Object.values(dims).reduce((n, v) => n * Math.max(1, v.length), 1);
    let envelopeTotal = 0;
    const shared = new Set();
    const optDims = (s) => {
        const od = {};
        for (const d of s.defs) { const v = optionValues(d); if (v && v.length > 1) od['opt:' + d.id] = v; }
        return od;
    };
    const order = skills.map((s, i) => [i, Object.keys(optDims(s)).length]).sort((a, b) => b[1] - a[1] || a[0] - b[0]).map(([i]) => i);
    const rowsBySkill = new Map();
    for (const i of order) {
        const s = skills[i]; const od = optDims(s);
        rowsBySkill.set(i, Object.keys(od).length ? allPairs({ size: dims.size, ...od }, 17, shared) : []);
    }
    for (let i = 0; i < skills.length; i++) {
        const s = skills[i]; const od = optDims(s);
        perSkill.push({ skill: s.skill, drawsVia: s.via, options: Object.fromEntries(Object.entries(od).map(([k, v]) => [k.slice(4), v])), rows: rowsBySkill.get(i).map((r) => ({ skill: s.skill, ...r })) });
        envelopeTotal += envelopeSize * Object.values(od).reduce((n, v) => n * v.length, 1);
    }
    // every pair any one skill can make is covered by some row (of that skill or another with the option)
    const coveredKeys = new Set();
    for (const p of perSkill) for (const r of p.rows) {
        const ks = Object.keys(r).filter((k) => k !== 'skill');
        for (let a = 0; a < ks.length; a++) for (let b = a + 1; b < ks.length; b++) coveredKeys.add(pairKey(ks[a], r[ks[a]], ks[b], r[ks[b]]));
    }
    let perSkillGap = null;
    for (const p of perSkill) {
        const d = { size: dims.size, ...Object.fromEntries(Object.entries(p.options).map(([k, v]) => ['opt:' + k, v])) };
        const ks = Object.keys(d);
        for (let a = 0; a < ks.length && !perSkillGap; a++) for (let b = a + 1; b < ks.length && !perSkillGap; b++)
            for (const x of d[ks[a]]) for (const y of d[ks[b]]) if (!perSkillGap && !coveredKeys.has(pairKey(ks[a], x, ks[b], y))) perSkillGap = `${p.skill}: ${pairKey(ks[a], x, ks[b], y)}`;
    }
    const printRows = [...base, ...perSkill.flatMap((p) => p.rows)];
    const screenDims = { host: hosts, size: dims.size, skill: skills.map((s) => s.skill) };
    const screenRows = skills.length ? allPairs(screenDims, 23) : [];
    return {
        pair: `${template}--${kind}`, template, kind, kindLabel: KINDS[kind].label,
        generated: new Date().toISOString().slice(0, 10),
        skillsSource: only ? 'given (--skills), confirmed by generating items' : `generated in node: every live skill, ${items} seeded items at the defaults and at each option value one at a time`,
        envelope: { dimensions: dims, pendingValues: pending, skills: perSkill.map(({ rows, ...p }) => p), screenHosts: hosts, size: envelopeTotal },
        sample: {
            print: printRows, screen: screenRows,
            checks: {
                printBaseCoversAllPairs: skills.length ? coversAllPairs(printDims, base) === null : null,
                screenCoversAllPairs: skills.length ? coversAllPairs(screenDims, screenRows) === null : null,
                perSkillCoversAllPairs: perSkillGap === null,
                ...(perSkillGap ? { perSkillFirstGap: perSkillGap } : {}),
            },
        },
    };
}

/* ================================================================== main */

const failures = [];
const fail = (m) => failures.push(m);
const pad = (s, n) => String(s).padEnd(n);

async function main() {
    const t0 = process.hrtime.bigint();
    const ms = () => Number(process.hrtime.bigint() - t0) / 1e6;
    const json = has('json');
    const out = arg('out', null);
    const reader = fsReader(ROOT);
    let printed = null;

    if (has('self-test')) {
        await selfTest();
    } else if (has('engine')) {
        const target = (() => { const v = arg('engine', 'all'); return v && !v.startsWith('--') ? v : 'all'; })();
        const roots = templateRoots(reader);
        let kinds = Object.keys(KINDS); let templates = null;
        if (target !== 'all') {
            if (KINDS[KIND_ALIASES[target] || target]) { kinds = [KIND_ALIASES[target] || target]; templates = ['stack']; }
            else if (roots.has(target)) templates = [target];
            else throw new Error(`--engine ${target}: not a kind (${Object.keys(KINDS).join(', ')}) or a template`);
        }
        const res = engineLists(reader, { templates, kinds });
        const comparison = comparePlan(res);
        if (json) {
            printed = {
                pairs: res.pairs,
                roles: Object.fromEntries(Object.entries(res.roles).map(([r, w]) => [r, { files: w.files, fingerprint: hashFiles(reader, w.files), leaves: w.leaves }])),
                templates: Object.fromEntries(Object.entries(res.templates).map(([t, w]) => [t, { root: w.root, files: w.files, fingerprint: hashFiles(reader, w.files), leaves: w.leaves }])),
                bridgeWhole: BRIDGE_WHOLE, dataLeaves: DATA_LEAVES, planComparison: comparison,
            };
        } else {
            console.log(`ws-envelope --engine ${target}  (${ROOT === resolve(HERE, '..', '..') ? 'this tree' : ROOT})\n`);
            console.log('PER ROLE (binding walk from the role module)');
            for (const [r, w] of Object.entries(res.roles)) {
                console.log(`  ${r}  ${w.files.length} files${w.leaves.length ? `  (stops at leaves: ${w.leaves.join(', ')})` : ''}`);
                console.log('    ' + w.files.join('\n    '));
            }
            console.log('\nPER TEMPLATE (binding walk from the module that registers it)');
            for (const [t, w] of Object.entries(res.templates)) {
                console.log(`  ${pad(t, 16)} ${w.root}  ${w.files.length} files`);
                if (templates || t === 'stack') console.log('    ' + w.files.join('\n    '));
            }
            console.log(`\nPAIRS (template x kind = template list + every role of the kind + ${BRIDGE_WHOLE.join(', ')} hashed whole)`);
            for (const [p, v] of Object.entries(res.pairs)) console.log(`  ${pad(p, 34)} ${String(v.files.length).padStart(3)} files  ${v.fingerprint.slice(0, 16)}`);
            console.log('\nAGAINST THE PLAN (IMPROVEMENT_PLAN §1.6.2, 2026-10-23)');
            for (const c of comparison) console.log(`  ${pad(c.list, 40)} plan ${c.plan}  walk ${c.walk}  ${c.same ? 'SAME' : `DIFFERS  +[${c.onlyWalk.join(', ')}]  -[${c.onlyPlan.join(', ')}]`}`);
            const ex = arg('explain', null);
            if (ex) {
                console.log(`\nEXPLAIN ${ex}`);
                for (const [name, w] of [...Object.entries(res.roles), ...Object.entries(res.templates).filter(([t]) => !templates || templates.includes(t)).map(([t, w]) => ['template ' + t, w])]) {
                    const e = w.explain[ex];
                    if (!e) { console.log(`  ${pad(name, 34)} not reached`); continue; }
                    const chain = []; let why = e.why; const seen = new Set();
                    while (why && !why.startsWith('root') && !seen.has(why)) {
                        seen.add(why); chain.push(why);
                        const f = why.split(':')[0].replace(/ loads$/, '');
                        why = w.explain[f] && w.explain[f].why;
                    }
                    if (why) chain.push(why);
                    console.log(`  ${pad(name, 34)} uses ${e.uses.join(', ')}\n  ${' '.repeat(34)} needed by ${chain.join('  <-  ')}`);
                }
            }
            const warn = [...new Set(Object.values({ ...res.roles, ...res.templates }).flatMap((w) => [...w.warnings, ...w.dynamic.map((d) => 'dynamic import ' + d)]))];
            if (warn.length) console.log('\nWARNINGS\n  ' + warn.join('\n  '));
            for (const w of warn) if (/missing|does not export/.test(w)) fail(w);
        }
        console.error(`ws-envelope: --engine computed in ${ms().toFixed(0)} ms`);
    } else if (has('fingerprint')) {
        const pairId = arg('fingerprint');
        const [template, kindRaw] = String(pairId).split('--');
        const kind = KIND_ALIASES[kindRaw] || kindRaw;
        if (!KINDS[kind]) throw new Error(`--fingerprint <template>--<kind>; kind one of ${Object.keys(KINDS).join(', ')}`);
        const res = engineLists(reader, { templates: [template], kinds: [kind] });
        const pair = res.pairs[`${template}--${kind}`];
        const { geometry, defaulted } = geometryClass(template, kind, JSON.parse(arg('geometry', '{}')));
        const fp = structuralFingerprint(pair.fingerprint, geometry);
        printed = { pair: `${template}--${kind}`, structuralFingerprint: fp, engineFingerprint: pair.fingerprint, engineFiles: pair.files, geometry, defaulted };
        if (!json) {
            console.log(`pair                 ${template}--${kind}`);
            console.log(`engine fingerprint   ${pair.fingerprint}  (${pair.files.length} files)`);
            console.log(`geometry class       ${JSON.stringify(geometry)}`);
            if (defaulted.length) console.log(`  defaulted          ${defaulted.join(', ')}`);
            console.log(`structural           ${fp}`);
            printed = null;
        }
    } else if (has('diff') || has('voids')) {
        let a; let b;
        if (has('diff')) { const i = argv.indexOf('--diff'); a = argv[i + 1]; b = argv[i + 2]; }
        else { [a, b] = String(arg('voids')).split(/\.\.\.?/); }
        if (!a || !b) throw new Error('--diff <commitA> <commitB>  or  --voids <A>..<B>');
        const ra = gitReader(a); const rb = gitReader(b);
        const ea = engineLists(ra); const eb = engineLists(rb);
        const voided = []; const kept = [];
        for (const p of new Set([...Object.keys(ea.pairs), ...Object.keys(eb.pairs)])) {
            const x = ea.pairs[p]; const y = eb.pairs[p];
            if (!x || !y) { voided.push({ pair: p, why: !x ? 'new pair' : 'pair gone' }); continue; }
            if (x.fingerprint === y.fingerprint) { kept.push(p); continue; }
            const added = y.files.filter((f) => !x.files.includes(f)); const removed = x.files.filter((f) => !y.files.includes(f));
            const changed = y.files.filter((f) => x.files.includes(f) && sha256(ra.read(full(f))) !== sha256(rb.read(full(f))));
            voided.push({ pair: p, changed, added, removed });
        }
        const changedFiles = rb.list(MOD).filter((f) => f.endsWith('.js') && (!ra.exists(f) || sha256(ra.read(f)) !== sha256(rb.read(f)))).map(short);
        const goneFiles = ra.list(MOD).filter((f) => f.endsWith('.js') && !rb.exists(f)).map(short);
        printed = { from: ra.sha, to: rb.sha, changedFiles, goneFiles, voided, unchanged: kept.length };
        if (!json) {
            console.log(`ws-envelope --diff ${ra.sha.slice(0, 10)} -> ${rb.sha.slice(0, 10)}`);
            console.log(`  js/modules files changed: ${changedFiles.join(', ') || '(none)'}${goneFiles.length ? `; removed: ${goneFiles.join(', ')}` : ''}`);
            console.log(`  pairs voided: ${voided.length} of ${voided.length + kept.length}`);
            for (const v of voided) console.log(`    ${pad(v.pair, 34)} ${v.why || [v.changed.length ? 'changed ' + v.changed.join(', ') : '', v.added.length ? 'added ' + v.added.join(', ') : '', v.removed.length ? 'removed ' + v.removed.join(', ') : ''].filter(Boolean).join('; ')}`);
            printed = null;
        }
        console.error(`ws-envelope: --diff computed in ${ms().toFixed(0)} ms`);
    } else if (has('envelope')) {
        const pairId = arg('envelope');
        const only = args('skills').flatMap((s) => s.split(',')).filter(Boolean);
        const env = await buildEnvelope(pairId, reader, { only: only.length ? only : null, items: Number(arg('items', 6)) });
        const file = out || join(ROOT, 'tests', 'fixtures', 'precritic', 'envelope', 'out', `${env.pair}.json`);
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, JSON.stringify(env, null, 1) + '\n');
        const s = env.envelope;
        console.log(`ws-envelope --envelope ${env.pair}`);
        console.log(`  kind options       ${Object.entries(s.dimensions).map(([k, v]) => `${k} ${v.length}`).join(' · ')}`);
        if (s.pendingValues.length) console.log(`  pending            ${s.pendingValues.map((p) => `${p.option}=${p.value} (${p.waitsFor})`).join('; ')}`);
        console.log(`  skills drawing it  ${s.skills.length}${s.skills.length ? ': ' + s.skills.map((x) => x.skill).join(', ') : ''}`);
        const dropped = only.filter((k) => !s.skills.some((x) => x.skill === k));
        if (dropped.length) console.log(`  not drawing it     ${dropped.join(', ')} (given with --skills; no sampled item drew '${env.template}')`);
        console.log(`  skill options      ${s.skills.reduce((n, x) => n + Object.keys(x.options).length, 0)} options, ${s.skills.reduce((n, x) => n + Object.values(x.options).reduce((m, v) => m + v.length, 0), 0)} values`);
        console.log(`  screen hosts       ${s.screenHosts.join(', ')}`);
        console.log(`  full envelope      ${s.size.toLocaleString('en-US')} combinations (kind options x each skill's options)`);
        const optRows = env.sample.print.filter((r) => Object.keys(r).some((k) => k.startsWith('opt:'))).length;
        console.log(`  all-pairs sample   print ${env.sample.print.length} rows (kind options x skill ${env.sample.print.length - optRows} + each skill's own options x size ${optRows}), screen ${env.sample.screen.length} rows`);
        console.log(`  pairwise checks    ${JSON.stringify(env.sample.checks)}`);
        console.log(`  written            ${relative(ROOT, file)}`);
        for (const [k, v] of Object.entries(env.sample.checks)) if (v === false) fail(`${k} is false`);
        if (!s.skills.length) fail(`no skill draws template '${env.template}'`);
        console.error(`ws-envelope: --envelope computed in ${ms().toFixed(0)} ms`);
    } else {
        console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).slice(0, 26).map((l) => l.slice(3)).join('\n'));
        return;
    }
    if (printed) {
        const text = JSON.stringify(printed, null, 1);
        if (out) { mkdirSync(dirname(resolve(out)), { recursive: true }); writeFileSync(resolve(out), text + '\n'); console.error(`ws-envelope: written ${out}`); } else console.log(text);
    }
}

function comparePlan(res) {
    const out = [];
    for (const [k, plan] of Object.entries(PLAN_LISTS)) {
        const [type, id] = k.split(/:(.+)/);
        let w = type === 'role' ? res.roles[id] : res.templates[id];
        if (!w) continue;
        // a role is compared with the bridge's render path added (the plan's lists include it)
        if (type === 'role') w = { files: [...new Set([...w.files, ...res.roles.bridge.files])].sort() };
        const onlyWalk = w.files.filter((f) => !plan.includes(f)); const onlyPlan = plan.filter((f) => !w.files.includes(f));
        out.push({ list: type === 'role' ? k + ' + bridge' : k, plan: plan.length, walk: w.files.length, same: !onlyWalk.length && !onlyPlan.length, onlyWalk, onlyPlan });
    }
    return out;
}

/* ================================================================== self-test */

const FIX = join(ROOT, 'tests', 'fixtures', 'precritic', 'envelope');

async function selfTest() {
    let checks = 0;
    const ok = (c, m) => { checks++; if (!c) fail(m); return c; };
    const eq = (got, want, m) => ok(JSON.stringify(got) === JSON.stringify(want), `${m}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`);

    // 1. tokenizer edge cases
    const tk = (s) => tokenize(s).map((t) => t.t + ':' + t.v);
    eq(tk('a = b / c / d'), ['id:a', 'p:=', 'id:b', 'p:/', 'id:c', 'p:/', 'id:d'], 'division is not a regex');
    eq(tk('x = /[/]\\/x/g.test(y)').slice(0, 3), ['id:x', 'p:=', 're:/[/]\\/x/g'], 'regex with / in a class');
    eq(tk('`a${ {b: `c${d}`}.b }e`').filter((t) => t.startsWith('id:')), ['id:b', 'id:d', 'id:b'], 'nested template literals');
    eq(tk("'it''s' // c\n/* x */ z").length, 3, 'strings and comments');
    ok((() => { try { tokenize('a = `x${'); return false; } catch { return true; } })(), 'an unterminated template must throw');

    // 2. the walker on fixture graphs
    const fxReader = fsReader(ROOT);
    const leafFile = 'tests/fixtures/precritic/envelope/graph/data-leaf.js';
    const walk = makeWalker(fxReader, { leaves: [leafFile] });
    const G = 'tests/fixtures/precritic/envelope/graph/';
    const r = walk([G + 'root.js']);
    const want = ['a.js', 'aliased.js', 'b.js', 'boot.js', 'grp.js', 'helper.js', 'helper2.js', 'ns.js', 'root.js', 'side-effect-user.js', 'star-deep.js'].map((f) => G + f);
    eq(r.files, want, 'binding walk over the fixture graph');
    for (const f of ['unused.js', 'dead.js', 'side.js', 'barrel.js', 'chain1.js', 'never.js']) ok(!r.files.includes(G + f), `${f} must not be in the walk`);
    eq(r.leaves, [leafFile], 'the walk stops at the declared leaf');
    eq(r.warnings, [], 'no walker warnings on the fixture graph');
    // a whole-file graph would reach more: prove the binding walk is narrower
    const whole = new Set(); const q = [G + 'root.js'];
    while (q.length) {
        const f = q.pop(); if (whole.has(f) || !fxReader.exists(f)) continue; whole.add(f);
        const m = parseModule(fxReader.read(f).toString());
        for (const s of [...[...m.imports.values()].map((x) => x.spec), ...m.bare, ...m.stars, ...[...m.exports.values()].filter((e) => e.spec).map((e) => e.spec)]) q.push(posix.normalize(posix.join(posix.dirname(f), s)));
    }
    ok(whole.size > r.files.length + 4, `the whole-file graph (${whole.size}) should be wider than the binding walk (${r.files.length})`);

    // 3. statement parsing details
    const pm = parseModule('export const a = 1, b = c(); function f() { return { g: 1, h() { return k; } }; }\nexport { f as default };\nregister("x", { draw() { return a; } })');
    eq([...pm.declared.keys()].sort(), ['a', 'b', 'f'], 'declared names');
    eq([...pm.stmts[1].refs], ['c'], 'second declarator refs');
    eq([...pm.stmts[pm.declared.get('f')[0]].refs].includes('h') || [...pm.stmts[pm.declared.get('f')[0]].refs].includes('g'), false, 'keys and method names are not refs');
    ok([...pm.stmts[pm.declared.get('f')[0]].refs].includes('k'), 'a body reference is a ref');
    eq(pm.side.length, 1, 'one side-effect statement');
    eq(pm.exports.get('default'), { local: 'f' }, 'export { f as default }');

    // 4. leaves: the good fixture passes, the bad ones are caught
    const leafDir = join(FIX, 'leaves');
    const good = await checkLeaf(join(leafDir, 'good-leaf.js'));
    eq(good, [], 'good-leaf.js is a frozen plain table');
    for (const [f, why] of [['bad-leaf-function.js', /function/], ['bad-leaf-import.js', /imports/], ['bad-leaf-unfrozen.js', /not frozen/], ['bad-leaf-arrow.js', /arrow/]]) {
        const p = await checkLeaf(join(leafDir, f));
        ok(p && p.length && p.some((x) => why.test(x)), `${f} must be caught (${why}); got ${JSON.stringify(p)}`);
    }

    // 5. all-pairs
    const dims = { a: [1, 2, 3], b: ['x', 'y'], c: [true, false], d: ['p', 'q', 'r', 's'] };
    const rows = allPairs(dims, 3);
    ok(coversAllPairs(dims, rows) === null, 'allPairs covers every pair');
    ok(rows.length < 3 * 2 * 2 * 4, `allPairs is smaller than the full product (${rows.length})`);
    const shared = new Set();
    const r1 = allPairs({ size: ['S', 'M'], band: [10, 20] }, 5, shared);
    const r2 = allPairs({ size: ['S', 'M'], band: [10, 20] }, 5, shared);
    const r3 = allPairs({ size: ['S', 'M'], band: [10, 20], pictures: [false, true] }, 5, shared);
    ok(r1.length === 4 && r2.length === 0, `a pair covered by one skill is not covered again (${r1.length}, ${r2.length})`);
    ok(r3.length >= 2 && r3.length <= 4 && r3.every((r) => 'pictures' in r), `a new option adds only the rows its pairs need (${r3.length})`);

    // 6. voiding, on the tree with one file changed in memory: layout.js voids stack x Single skill;
    //    a provider and a template the pair does not reach void nothing
    const append = (txt) => (buf) => Buffer.concat([buf, Buffer.from(txt)]);
    const fpOf = (rd) => engineLists(rd, { templates: ['stack'], kinds: ['single'] }).pairs['stack--single'].fingerprint;
    const base = fpOf(fxReader);
    const cases = [
        ['sheet/layout.js', true], ['sheet/providers/addition.js', false], ['sheet/cells/clock.js', false],
        ['sheet/cells/stack.js', true], ['print-sheet.js', true], ['skill-presets.js', true],   // presets: engine until M3
    ];
    for (const [f, voids] of cases) {
        const fp = fpOf(overlayReader(fxReader, { [full(f)]: append('\n// envelope self-test\n') }));
        ok((fp !== base) === voids, `a change to ${f} should ${voids ? '' : 'not '}void stack--single`);
    }

    // 7. the tree: every declared data leaf, and the tree parses
    const leaves = [...DATA_LEAVES.map(full), ...args('declare-leaf')];
    for (const l of leaves) {
        const abs = resolve(ROOT, l);
        const p = await checkLeaf(abs);
        if (p === null) { console.log(`  declared leaf ${l}: not in the tree yet (skipped)`); continue; }
        ok(!p.length, `declared data leaf ${l} exports something other than frozen plain tables: ${p.join('; ')}`);
        console.log(`  declared leaf ${l}: ${p.length ? 'FAIL ' + p.join('; ') : 'frozen plain tables'}`);
    }
    let parsed = 0;
    for (const f of fxReader.list(MOD).filter((x) => x.endsWith('.js'))) {
        try { parseModule(fxReader.read(f).toString('utf8')); parsed++; } catch (e) { fail(`tree: ${short(f)} does not parse: ${e.message}`); }
        checks++;
    }
    console.log(`  self-test: ${checks} checks, ${parsed} tree modules parsed`);
}

try {
    await main();
} catch (e) {
    fail(e.message);
    if (process.env.DEBUG) console.error(e.stack);
}
// with --json on stdout, the verdict goes to stderr so stdout stays one JSON document
const say = has('json') && !arg('out', null) ? console.error : console.log;
if (failures.length) {
    for (const f of failures) say(`  FAIL ${f}`);
    say(`ws-envelope: FAIL (${failures.length})`);
    if (!REPORT_ONLY) process.exitCode = 1;
} else if (!argv.length || argv.every((a) => a.startsWith('--root') || a === ROOT)) {
    // usage printed
} else {
    say('ws-envelope: OK');
}
