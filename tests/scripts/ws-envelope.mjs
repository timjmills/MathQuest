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
//        keys, screen hosts), the machine all-pairs sample (sample.print / .screen) and the CRITIC
//        sample (sample.critic, D8: the bounded all-pairs set + a random 20 %, total capped at 40 pages; sample.criticStrict for reference)
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
//     `--envelope` writes: `sample.critic` by default, `sample.print` / `sample.screen` with --full-sample.
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
export function allPairs(dims, seed = 1, shared = null, valid = null, defaults = {}) {
    const names = Object.keys(dims).filter((k) => dims[k].length);
    const vals = names.map((k) => dims[k]);
    const uncovered = new Set();
    const gk = (a, i, b, j) => pairKey(names[a], vals[a][i], names[b], vals[b][j]);
    // N5: `valid(rowObject)` (optional) - a pair it rejects is never required, and a value it rejects is never dealt
    const objOf = (row) => Object.fromEntries(names.map((k, d) => [k, row[d], d]).filter(([, i]) => i >= 0).map(([k, i, d]) => [k, vals[d][i]]));
    for (let a = 0; a < names.length; a++) for (let b = a + 1; b < names.length; b++)
        for (let i = 0; i < vals[a].length; i++) for (let j = 0; j < vals[b].length; j++) {
            if (valid && !valid({ [names[a]]: vals[a][i], [names[b]]: vals[b][j] })) continue;
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
                // the fallback when no value is valid: the dimension's default (a conditional option at its default is always valid)
                // (a nullable option whose default, Auto, is not one of its values is left out of the row instead)
                const di = vals[d].findIndex((x) => JSON.stringify(x) === JSON.stringify(defaults[names[d]]));
                let bv = valid ? di : 0; let bg = -1;
                for (let v = 0; v < vals[d].length; v++) {
                    if (valid) { const probe = row.slice(); probe[d] = v; if (!valid(objOf(probe))) continue; }
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
            for (let x = 0; x < names.length; x++) for (let y = x + 1; y < names.length; y++) if (row[x] >= 0 && row[y] >= 0 && uncovered.has(`${x}:${row[x]}|${y}:${row[y]}`)) gain++;
            if (gain > bestGain) { bestGain = gain; best = row; }
        }
        for (let x = 0; x < names.length; x++) for (let y = x + 1; y < names.length; y++) {
            if (best[x] < 0 || best[y] < 0) continue;
            uncovered.delete(`${x}:${best[x]}|${y}:${best[y]}`);
            if (shared) shared.add(gk(x, best[x], y, best[y]));
        }
        if (bestGain <= 0 && valid) break;   // only pairs no valid row can hold are left (none: they were never required)
        rows.push(Object.fromEntries(names.map((k, d) => [k, best[d]]).filter(([, i]) => i >= 0).map(([k, i]) => [k, vals[names.indexOf(k)][i]])));
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

/* ------------------------------------------------------------------ the CRITIC sample (§1.6.2) */
// "A critic sample that covers every pair of option values at least once (all-pairs sampling: tens of
// pages per pair, not thousands), plus a random 20 % of the remaining envelope at full scale, capped at
// 40 pages a pair." The machine sample above (`sample.print`) crosses every skill with the kind options
// and then gives each skill its own pairs: that is what the instance gates and the matrix prove, and it
// is hundreds of rows. The critic sample instead treats the pair's option values as ONE set:
//   - dimensions: the kind's options (size, pages, examples, fade, layout, key ...) and one dimension a
//     distinct skill option id (its values: the union over the skills that offer it);
//   - pairs to cover: kind value x kind value; kind value x option value; option value x option value
//     of two options one skill offers together. A pair of option values shared by several skills is
//     ONE pair (deduped across skills): covering it on any skill that offers both values covers it;
//   - rows: greedy covering, each row one skill (an option value is printed only on a skill offering
//     it), filled dimension by dimension with the value that covers most uncovered pairs; fewer rows win;
//   - a row's pages = its `pages` value (pupil pages; the key follows). Faded packet needs pages >= 2,
//     so the pair (fade packet, pages 1) is not required and never dealt.
// The lower bound of any such set is its largest pair group (dimension A x dimension B): each row covers
// one pair of a group at most. When the strict set exceeds CRITIC_PAGE_BUDGET pages the run says so,
// names the dominant groups, and computes the bounded set the plan could rule for instead
// (the smallest of the measured bounds - boundary classes, size-only pairing, representative skills); by the D8
// ruling that bounded set + the random 20 %, capped at CRITIC_TOTAL_CAP_PAGES in all, IS `sample.critic` (strict: `sample.criticStrict`).
export const CRITIC_PAGE_BUDGET = 60;
export const CRITIC_RANDOM_SHARE = 0.2;
export const CRITIC_RANDOM_CAP_PAGES = 40;
export const CRITIC_TOTAL_CAP_PAGES = 40;   // D8 ruling: the whole critic sample of a pair, all-pairs + random
const rowPages = (r) => Math.max(1, Number(r.pages) || 1);
/** The rows the kit cannot print: Faded packet on one page (ws-print-lint: --fade packet needs --pages >= 2). */
export const criticValid = (r) => !(r.fade === 'packet' && r.pages !== undefined && Number(r.pages) < 2);

/**
 * N5 (critic r2): a row of option values the app could never hold together is never dealt or required.
 * `sk` = {defaults: {id: v}, applies: {id: appliesTo fn}, all: {id: [values]}} (the skill's option defs).
 *  - a CONDITIONAL option (its def has `appliesTo`) at a value other than its default is impossible when appliesTo
 *    is false for the row's choices (the defaults filled in): e.g. nlStep 5 with nlOn off. At its default it is fine
 *    (the row simply does not set it);
 *  - a RANGE: <x>From / <x>To, <x>Min / <x>Max, both numbers, needs From < To (nlFrom 1,000,000 with nlTo -1,000,000
 *    is a degenerate page, not a test).
 * Rows without opt: keys, or a skill without defs, are valid.
 */
export function optionRowValid(row, sk) {
    if (!row) return true;
    const ids = Object.keys(row).filter((k) => k.startsWith('opt:')).map((k) => k.slice(4));
    if (!ids.length) return true;
    const defaults = (sk && sk.defaults) || {};
    const unwrap = (id, v) => (v && typeof v === 'object' && !Array.isArray(v) && 'set' in v ? (Array.isArray(v.set) ? v.set : v.set === 'all' ? ((sk && sk.all && sk.all[id]) || defaults[id]) : defaults[id]) : v);
    const cur = { ...defaults };
    for (const id of ids) cur[id] = unwrap(id, row['opt:' + id]);
    const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
    for (const id of ids) {
        const fn = sk && sk.applies && sk.applies[id];
        if (typeof fn !== 'function' || same(cur[id], defaults[id])) continue;
        let ok = true;
        try { ok = !!fn(cur); } catch (e) { ok = true; }
        if (!ok) return false;
    }
    for (const id of Object.keys(cur)) {
        const m = /^(.*?)(From|Min)$/.exec(id);
        if (!m) continue;
        const a = cur[id], b = cur[m[1] + (m[2] === 'From' ? 'To' : 'Max')];
        if (typeof a === 'number' && typeof b === 'number' && !(a < b)) return false;
    }
    return true;
}
/** The critic's validity with the skills' option rules (N5): the kind rule above AND optionRowValid on the row's skill. */
export const criticValidFor = (skills) => {
    const by = new Map(skills.map((s) => [s.skill, s]));
    return (r) => criticValid(r) && optionRowValid(r, by.get(r.skill));
};

/** The pairs a critic set must cover: Map(pairKey -> {group}) over kind dims and every skill's options. */
export function criticPairs(kdims, skills, valid = criticValid, optionKinds = null) {
    const need = new Map();
    const put = (n1, v1, n2, v2, skill) => {
        if (!valid(skill ? { skill, [n1]: v1, [n2]: v2 } : { [n1]: v1, [n2]: v2 })) return;
        const k = pairKey(n1, v1, n2, v2);
        if (!need.has(k)) need.set(k, { group: [n1, n2].sort().join(' x ') });
    };
    const kn = Object.keys(kdims).filter((k) => kdims[k].length);
    for (let a = 0; a < kn.length; a++) for (let b = a + 1; b < kn.length; b++) for (const x of kdims[kn[a]]) for (const y of kdims[kn[b]]) put(kn[a], x, kn[b], y);
    for (const s of skills) {
        const on = Object.keys(s.options).filter((o) => s.options[o].length);
        for (const o of on) for (const v of s.options[o]) for (const k of kn) if (!optionKinds || optionKinds.includes(k)) for (const x of kdims[k]) put(k, x, 'opt:' + o, v, s.skill);
        for (let a = 0; a < on.length; a++) for (let b = a + 1; b < on.length; b++) for (const x of s.options[on[a]]) for (const y of s.options[on[b]]) put('opt:' + on[a], x, 'opt:' + on[b], y, s.skill);
    }
    return need;
}

/** The pairs one row covers (its skill's options only; `skill` and `part` are not dimensions). */
function rowPairKeys(row) {
    const ks = Object.keys(row).filter((k) => k !== 'skill' && k !== 'part');
    const out = [];
    for (let a = 0; a < ks.length; a++) for (let b = a + 1; b < ks.length; b++) out.push(pairKey(ks[a], row[ks[a]], ks[b], row[ks[b]]));
    return out;
}

/** Greedy covering of criticPairs, deduped across skills. Deterministic for a seed. */
export function criticAllPairs(kdims, skills, seed = 29, valid = criticValid, optionKinds = null) {
    const need = criticPairs(kdims, skills, valid, optionKinds);
    const uncovered = new Set(need.keys());
    const kn = Object.keys(kdims).filter((k) => kdims[k].length);
    let s = seed >>> 0;
    const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const parse = (key) => key.split('|').map((half) => { const i = half.indexOf('='); return [half.slice(0, i), JSON.parse(half.slice(i + 1))]; });
    const offers = (sk, n, v) => !n.startsWith('opt:') ? true : (sk.options[n.slice(4)] || []).some((x) => JSON.stringify(x) === JSON.stringify(v));
    const rows = [];
    while (uncovered.size) {
        const list = [...uncovered];
        let best = null; let bestGain = -1;
        for (let attempt = 0; attempt < 48; attempt++) {
            // one uncovered pair, on one of the skills offering both values (every skill for kind pairs)
            const [[n1, v1], [n2, v2]] = parse(list[Math.floor(rand() * list.length)]);
            const cands = skills.filter((sk) => offers(sk, n1, v1) && offers(sk, n2, v2));
            if (!cands.length) continue;
            const sk = cands[Math.floor(rand() * cands.length)];
            const row = { [n1]: v1, [n2]: v2 };
            const dimsOf = [...kn.map((k) => [k, kdims[k]]), ...Object.entries(sk.options).filter(([, v]) => v.length).map(([o, v]) => ['opt:' + o, v])];
            const order = dimsOf.filter(([n]) => !(n in row)).sort(() => rand() - 0.5);
            for (const [n, vals] of order) {
                // fallback when no value is valid: the option's default (N5), else the first value
                const dflt = n.startsWith('opt:') && sk.defaults ? vals.find((x) => JSON.stringify(x) === JSON.stringify(sk.defaults[n.slice(4)])) : undefined;
                let bv = dflt !== undefined ? dflt : undefined; let bg = -1;
                for (const v of vals) {
                    if (!valid({ skill: sk.skill, ...row, [n]: v })) continue;
                    let g = 0;
                    for (const [e, ev] of Object.entries(row)) if (uncovered.has(pairKey(e, ev, n, v))) g++;
                    // a tie on `pages` keeps the fewer pages (critic time); any other tie is a coin
                    if (g > bg || (g === bg && (n === 'pages' ? Number(v) < Number(bv) : rand() < 0.3))) { bg = g; bv = v; }
                }
                if (bv !== undefined) row[n] = bv;   // N5: no valid value and no default among them: left out (the page prints the default)
            }
            const gain = rowPairKeys(row).filter((k) => uncovered.has(k)).length;
            // fewer pages win a tie: a 1-page row costs less critic time than a 3-page one
            if (gain > bestGain || (gain === bestGain && best && rowPages(row) < rowPages(best.row))) { bestGain = gain; best = { row, skill: sk.skill }; }
        }
        if (!best || bestGain <= 0) throw new Error(`criticAllPairs: ${uncovered.size} pair(s) no skill can print, first ${[...uncovered][0]}`);
        for (const k of rowPairKeys(best.row)) uncovered.delete(k);
        rows.push({ skill: best.skill, ...best.row });
    }
    return { rows, need };
}

/** Null when every required pair is in some row, else the first one missing (the self-test's check). */
export function criticCovers(kdims, skills, rows, valid = criticValid, optionKinds = null) {
    const got = new Set(rows.flatMap(rowPairKeys));
    for (const k of criticPairs(kdims, skills, valid, optionKinds).keys()) if (!got.has(k)) return k;
    return null;
}

/**
 * Lower bounds and the dominant groups. A row covers at most one pair of each (dimension x dimension)
 * group, so the largest group is one bound (`groupBound`). A pair only ONE skill can print (a value no
 * other skill offers) needs a row of that skill, so the sum over skills of each skill's largest group of
 * such exclusive pairs is another (`exclusiveBound`). `lowerBound` is the larger.
 */
export function criticDominance(need, skills = []) {
    const by = new Map();
    for (const { group } of need.values()) by.set(group, (by.get(group) || 0) + 1);
    const groups = [...by.entries()].sort((a, b) => b[1] - a[1]).map(([group, pairs]) => ({ group, pairs }));
    const groupBound = groups.length ? groups[0].pairs : 0;
    const has = (sk, n, v) => !n.startsWith('opt:') || (sk.options[n.slice(4)] || []).some((x) => JSON.stringify(x) === JSON.stringify(v));
    const excl = new Map();
    for (const [key, { group }] of need) {
        const [[n1, v1], [n2, v2]] = key.split('|').map((h) => { const i = h.indexOf('='); return [h.slice(0, i), JSON.parse(h.slice(i + 1))]; });
        if (!n1.startsWith('opt:') && !n2.startsWith('opt:')) continue;
        const owners = skills.filter((sk) => has(sk, n1, v1) && has(sk, n2, v2));
        if (owners.length !== 1) continue;
        const m = excl.get(owners[0].skill) || new Map();
        m.set(group, (m.get(group) || 0) + 1);
        excl.set(owners[0].skill, m);
    }
    const perSkill = [...excl.entries()].map(([skill, m]) => ({ skill, rows: Math.max(...m.values()) })).sort((a, b) => b.rows - a.rows);
    const exclusiveBound = perSkill.reduce((n, x) => n + x.rows, 0);
    return { lowerBound: Math.max(groupBound, exclusiveBound), groupBound, exclusiveBound, exclusiveSkills: perSkill.length, groups: groups.slice(0, 5) };
}

/**
 * The random part: a seeded `share` of the envelope left after the all-pairs rows, each row a uniform draw
 * (a skill, then every kind dimension and that skill's every option), never a row already dealt, until the
 * share is reached or the next row would pass `capPages`.
 */
export function criticRandom(kdims, skills, { seed = 31, share = CRITIC_RANDOM_SHARE, capPages = CRITIC_RANDOM_CAP_PAGES, envelopeSize = Infinity, taken = [], valid = criticValid } = {}) {
    let s = seed >>> 0;
    const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const pick = (a) => a[Math.floor(rand() * a.length)];
    const seen = new Set(taken.map((r) => JSON.stringify(Object.entries(r).filter(([k]) => k !== 'part').sort())));
    const want = Math.ceil(Math.max(0, envelopeSize - taken.length) * share);
    const rows = []; let pages = 0;
    for (let tries = 0; rows.length < want && tries < 20000; tries++) {
        const sk = pick(skills);
        const row = { skill: sk.skill };
        for (const [k, v] of Object.entries(kdims)) if (v.length) row[k] = pick(v);
        for (const [o, v] of Object.entries(sk.options)) if (v.length) row['opt:' + o] = pick(v);
        // N5: an option the row's other choices make meaningless goes back to its default (nlStep with nlOn off)
        if (sk.applies && sk.defaults) for (const o of Object.keys(sk.options)) {
            if (!(('opt:' + o) in row) || !(o in sk.applies)) continue;
            if (optionRowValid({ ['opt:' + o]: row['opt:' + o], ...Object.fromEntries(Object.entries(row).filter(([k]) => k.startsWith('opt:') && !/(From|To|Min|Max)$/.test(k))) }, sk)) continue;
            const d = (sk.options[o] || []).find((x) => JSON.stringify(x) === JSON.stringify(sk.defaults[o]));
            if (d !== undefined) row['opt:' + o] = d; else delete row['opt:' + o];
        }
        if (!valid(row)) continue;
        const id = JSON.stringify(Object.entries(row).sort());
        if (seen.has(id)) continue;
        if (pages + rowPages(row) > capPages) break;
        seen.add(id); rows.push(row); pages += rowPages(row);
    }
    return { rows, pages, want };
}

/**
 * A few skills that between them offer every option id of the pair (greedy set cover: the skill offering
 * most uncovered ids first, ties to the one with more values, then SKILLS order).
 */
export function representativeSkills(skills) {
    const left = new Set(skills.flatMap((s) => Object.keys(s.options)));
    const out = [];
    while (left.size) {
        let best = null; let bg = 0; let bv = -1;
        for (const s of skills) {
            if (out.includes(s)) continue;
            const ids = Object.keys(s.options).filter((o) => left.has(o));
            const vals = ids.reduce((n, o) => n + s.options[o].length, 0);
            if (ids.length > bg || (ids.length === bg && ids.length && vals > bv)) { best = s; bg = ids.length; bv = vals; }
        }
        if (!best) break;
        out.push(best);
        for (const o of Object.keys(best.options)) left.delete(o);
    }
    return out.length ? out : skills.slice(0, 1);
}

/** Options with more than `max` values cut to their first, default and last (the bound proposed to the plan). */
export function boundOptions(skills, max = 4) {
    return skills.map((sk) => ({ ...sk, options: Object.fromEntries(Object.entries(sk.options).map(([o, v]) => {
        if (v.length <= max) return [o, v];
        const def = sk.defaults && o in sk.defaults ? sk.defaults[o] : undefined;
        const mid = v.find((x) => JSON.stringify(x) === JSON.stringify(def)) ?? v[Math.floor(v.length / 2)];
        return [o, [...new Map([v[0], mid, v[v.length - 1]].map((x) => [JSON.stringify(x), x])).values()]];
    })) }));
}

/** The whole critic sample of a pair (all-pairs + random part, the bounded variant when over budget). */
export function criticSample(kdims, skills, { pair = '', hosts = [], envelopeSize = Infinity } = {}) {
    const seedOf = (t) => { let h = 2166136261; for (const c of pair + t) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
    if (!skills.length) return null;
    const valid = criticValidFor(skills);
    const { rows, need } = criticAllPairs(kdims, skills, seedOf(':pairs'), valid);
    const pairsPages = rows.reduce((n, r) => n + rowPages(r), 0);
    const dom = criticDominance(need, skills);
    const rnd = criticRandom(kdims, skills, { seed: seedOf(':random'), envelopeSize, taken: rows, valid });
    // screen: every host x size pair on the skills the print rows use most (the hosts take no print size,
    // so one render a (skill, host); a few skills, not all of them)
    const used = [...new Set(rows.map((r) => r.skill))].slice(0, 5);
    const screen = used.length && hosts.length ? allPairs({ host: hosts, size: kdims.size || ['M'], skill: used }, seedOf(':screen')) : [];
    const out = {
        rule: '§1.6.2: every pair of option values at least once (kind options and skill options as one deduped set), plus a seeded random 20 % of the remaining envelope capped at 40 pages',
        print: [...rows.map((r) => ({ ...r, part: 'pairs' })), ...rnd.rows.map((r) => ({ ...r, part: 'random' }))],
        screen,
        pages: { pairs: pairsPages, random: rnd.pages, total: pairsPages + rnd.pages, budget: CRITIC_PAGE_BUDGET, randomCap: CRITIC_RANDOM_CAP_PAGES },
        rows: { pairs: rows.length, random: rnd.rows.length, randomWanted: Number.isFinite(rnd.want) ? rnd.want : null, screen: screen.length },
        requiredPairs: need.size,
        lowerBound: dom.lowerBound, groupBound: dom.groupBound, exclusiveBound: dom.exclusiveBound, exclusiveSkills: dom.exclusiveSkills,
        dominant: dom.groups,
        overBudget: pairsPages > CRITIC_PAGE_BUDGET,
    };
    if (out.overBudget) {
        // the bounds the plan could rule for, each measured the same way (greedy rows, pupil pages, lower bound)
        const many = [...new Set(skills.flatMap((sk) => Object.entries(sk.options).filter(([, v]) => v.length > 3).map(([o]) => o)))];
        const reps = representativeSkills(skills);
        const variants = [
            { id: 'boundary', rule: 'every option with more than 3 values cut to its first, default and last value (boundary classes); every skill; option values paired with every kind option', skills: boundOptions(skills, 3), optionKinds: null },
            { id: 'boundary-size', rule: 'boundary classes as above; every skill; option values paired with size only (kind options still pair with each other)', skills: boundOptions(skills, 3), optionKinds: ['size'] },
            { id: 'representatives', rule: `boundary classes; only ${reps.length} representative skills that between them offer every option id (${reps.map((r) => r.skill).join(', ')}); option values paired with size and with each other; kind options all-pairs. The other skills' values are instance data: the per-skill machine sample (sample.print) and the matrix rows print them`, skills: boundOptions(reps, 3), optionKinds: ['size'] },
        ].map((v, i) => {
            const b = criticAllPairs(kdims, v.skills, seedOf(':bounded' + i), criticValidFor(v.skills), v.optionKinds);
            const d = criticDominance(b.need, v.skills);
            return { ...v, skills: undefined, rows: b.rows.length, pages: b.rows.reduce((n, r) => n + rowPages(r), 0), lowerBound: d.lowerBound, groupBound: d.groupBound, exclusiveBound: d.exclusiveBound, dominant: d.groups.slice(0, 3), sample: b.rows, need: b.need };
        });
        const pick = variants.slice().sort((a, b) => a.pages - b.pages)[0];
        out.proposal = {
            why: `the strict set is ${pairsPages} pages: at least ${dom.lowerBound} rows, because ${dom.exclusiveBound >= dom.groupBound ? `${dom.exclusiveSkills} skills offer values no other skill offers, so each needs rows of its own (${dom.exclusiveBound} rows between them)` : `the largest pair group ${dom.groups[0].group} has ${dom.groupBound} pairs`}; the options with many values: ${many.map((o) => `${o} ${new Set(skills.flatMap((sk) => (sk.options[o] || []).map((x) => JSON.stringify(x)))).size}`).join(', ')}`,
            options: many,
            variants: variants.map(({ sample, need, ...v }) => v),
            chosen: pick.id,
        };
        out.bounded = pick.sample.map((r) => ({ ...r, part: 'pairs-bounded' }));
        out.boundedRule = pick.rule;
        out.boundedNeed = pick.need;
    }
    return capCritic(out, kdims, skills, { seed: seedOf(':random-capped'), envelopeSize, valid });
}

/**
 * D8 ruling (lead, 2026-10-23): "follow the plan's cap, all-pairs plus 20 %, capped at 40 pages a pair. Use
 * the bounded set, not the strict one." The returned object IS sample.critic: the all-pairs part (the
 * bounded set when the strict set is over budget, else the strict set) plus the seeded random 20 %, the
 * TOTAL capped at CRITIC_TOTAL_CAP_PAGES. Random rows go first; only when the all-pairs part alone is over
 * the cap are its last rows cut, and the pairs left uncovered are reported (`cut`). The strict set
 * rides along as `strict` (sample.criticStrict).
 */
function capCritic(out, kdims, skills, { seed, envelopeSize, valid }) {
    const strict = { rule: out.rule, print: out.print, screen: out.screen, pages: out.pages, rows: out.rows, requiredPairs: out.requiredPairs };
    const bounded = !!out.bounded;
    let base = bounded ? out.bounded : out.print.filter((r) => r.part === 'pairs');
    const need = bounded ? out.boundedNeed : null;
    const basePagesAll = base.reduce((n, r) => n + rowPages(r), 0);
    const rnd = criticRandom(kdims, skills, { seed, envelopeSize, taken: base, valid, capPages: Math.max(0, CRITIC_TOTAL_CAP_PAGES - basePagesAll) });
    const wanted = criticRandom(kdims, skills, { seed, envelopeSize, taken: base, valid, capPages: CRITIC_RANDOM_CAP_PAGES });
    const cutRows = [];
    if (basePagesAll > CRITIC_TOTAL_CAP_PAGES) {
        let pages = 0; const keep = [];
        for (const r of base) { if (pages + rowPages(r) <= CRITIC_TOTAL_CAP_PAGES) { keep.push(r); pages += rowPages(r); } else cutRows.push(r); }
        base = keep;
    }
    const basePages = base.reduce((n, r) => n + rowPages(r), 0);
    const reqKeys = need ? [...need.keys()] : [...criticPairs(kdims, skills, valid).keys()];
    const got = new Set(base.flatMap(rowPairKeys));
    const covered = reqKeys.filter((k) => got.has(k)).length;
    const print = [...base, ...rnd.rows.map((r) => ({ ...r, part: 'random' }))];
    const { bounded: _b, boundedNeed: _n, ...rest } = out;
    return {
        ...rest,
        rule: `D8 ruling: the ${bounded ? `bounded all-pairs set (${out.proposal.chosen}: ${out.boundedRule})` : 'strict all-pairs set (within budget)'} plus a seeded random 20 % of the rest of the envelope, the total capped at ${CRITIC_TOTAL_CAP_PAGES} pages a pair (random rows dropped first)`,
        variant: bounded ? out.proposal.chosen : 'strict',
        print,
        pages: { pairs: basePages, random: rnd.pages, total: basePages + rnd.pages, budget: CRITIC_PAGE_BUDGET, randomCap: CRITIC_RANDOM_CAP_PAGES, totalCap: CRITIC_TOTAL_CAP_PAGES },
        rows: { pairs: base.length, random: rnd.rows.length, randomWanted: Number.isFinite(rnd.want) ? rnd.want : null, screen: out.screen.length },
        // honest coverage: the pairs of the set actually used (the bounded set's pairs when bounded), not the strict set's
        coverage: { of: bounded ? `bounded set (${out.proposal.chosen})` : 'strict set', requiredPairs: reqKeys.length, coveredPairs: covered, strictRequiredPairs: out.requiredPairs },
        cut: { randomRows: wanted.rows.length - rnd.rows.length, randomPages: wanted.pages - rnd.pages, pairsRows: cutRows.length, pairsPages: cutRows.reduce((n, r) => n + rowPages(r), 0), uncoveredPairs: reqKeys.length - covered },
        strict,
    };
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
/** A skill's option rules for optionRowValid (N5): defaults, appliesTo functions, every value of a set option. */
function skillRules(s) {
    const defs = s.defs || [];
    return {
        defaults: Object.fromEntries(defs.map((d) => [d.id, d.default])),
        applies: Object.fromEntries(defs.filter((d) => typeof d.appliesTo === 'function').map((d) => [d.id, d.appliesTo])),
        all: Object.fromEntries(defs.filter((d) => d.type === 'set').map((d) => [d.id, (d.values || []).map((v) => v.v)])),
    };
}

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
    const rulesBy = new Map(skills.map((s) => [s.skill, skillRules(s)]));
    const order = skills.map((s, i) => [i, Object.keys(optDims(s)).length]).sort((a, b) => b[1] - a[1] || a[0] - b[0]).map(([i]) => i);
    const rowsBySkill = new Map();
    for (const i of order) {
        const s = skills[i]; const od = optDims(s);
        const info = rulesBy.get(s.skill);
        rowsBySkill.set(i, Object.keys(od).length ? allPairs({ size: dims.size, ...od }, 17, shared, (r) => optionRowValid(r, info), Object.fromEntries(Object.entries(info.defaults).map(([k, v]) => ['opt:' + k, v]))) : []);
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
            for (const x of d[ks[a]]) for (const y of d[ks[b]]) if (!perSkillGap && optionRowValid({ [ks[a]]: x, [ks[b]]: y }, rulesBy.get(p.skill)) && !coveredKeys.has(pairKey(ks[a], x, ks[b], y))) perSkillGap = `${p.skill}: ${pairKey(ks[a], x, ks[b], y)}`;
    }
    const printRows = [...base, ...perSkill.flatMap((p) => p.rows)];
    const screenDims = { host: hosts, size: dims.size, skill: skills.map((s) => s.skill) };
    const screenRows = skills.length ? allPairs(screenDims, 23) : [];
    // the CRITIC sample (§1.6.2): the pair's option values as one deduped set, plus the random part
    const criticSkills = perSkill.map((p, i) => ({ skill: p.skill, options: p.options, defaults: Object.fromEntries(skills[i].defs.map((d) => [d.id, d.default])), applies: rulesBy.get(p.skill).applies, all: rulesBy.get(p.skill).all }));
    const critic = criticSample(dims, criticSkills, { pair: `${template}--${kind}`, hosts, envelopeSize: envelopeTotal });
    return {
        pair: `${template}--${kind}`, template, kind, kindLabel: KINDS[kind].label,
        generated: new Date().toISOString().slice(0, 10),
        skillsSource: only ? 'given (--skills), confirmed by generating items' : `generated in node: every live skill, ${items} seeded items at the defaults and at each option value one at a time`,
        envelope: { dimensions: dims, pendingValues: pending, skills: perSkill.map(({ rows, ...p }) => p), screenHosts: hosts, size: envelopeTotal },
        sample: {
            // print / screen: the MACHINE sample (every skill, each with its own pairs) for the instance gates;
            // critic: what an independent critic grades (ws-grade-render --envelope reads it by default)
            // (D8 ruling: the bounded all-pairs set + the random 20 %, total capped at 40 pages); criticStrict: the strict set, for reference
            critic: critic ? { ...critic, strict: undefined } : null,
            ...(critic ? { criticStrict: critic.strict } : {}),
            print: printRows, screen: screenRows,
            checks: {
                printBaseCoversAllPairs: skills.length ? coversAllPairs(printDims, base) === null : null,
                screenCoversAllPairs: skills.length ? coversAllPairs(screenDims, screenRows) === null : null,
                perSkillCoversAllPairs: perSkillGap === null,
                ...(perSkillGap ? { perSkillFirstGap: perSkillGap } : {}),
                criticStrictCoversAllPairs: critic ? criticCovers(dims, criticSkills, critic.strict.print.filter((r) => r.part === 'pairs'), criticValidFor(criticSkills)) === null : null,
                criticRandomWithinCap: critic ? critic.pages.random <= CRITIC_RANDOM_CAP_PAGES : null,
                criticWithinTotalCap: critic ? critic.pages.total <= CRITIC_TOTAL_CAP_PAGES : null,
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
        console.log(`  machine sample     print ${env.sample.print.length} rows (kind options x skill ${env.sample.print.length - optRows} + each skill's own options x size ${optRows}), screen ${env.sample.screen.length} rows (sample.print / sample.screen: the instance gates)`);
        const c = env.sample.critic;
        if (c) {
            const st = env.sample.criticStrict;
            console.log(`  CRITIC sample      sample.critic (${c.variant}): all-pairs ${c.rows.pairs} rows = ${c.pages.pairs} pages + random ${c.rows.random} rows = ${c.pages.random} pages (20 % of the rest = ${c.rows.randomWanted === null ? '?' : c.rows.randomWanted.toLocaleString('en-US')} rows) + screen ${c.rows.screen} rows: ${c.pages.total} print pages (cap ${c.pages.totalCap})`);
            console.log(`  critic coverage    ${c.coverage.coveredPairs} of ${c.coverage.requiredPairs} pairs of the ${c.coverage.of} (the strict set needs ${c.coverage.strictRequiredPairs})`);
            console.log(`  cap cut            random ${c.cut.randomRows} rows / ${c.cut.randomPages} pages; all-pairs ${c.cut.pairsRows} rows / ${c.cut.pairsPages} pages (${c.cut.uncoveredPairs} pairs uncovered)`);
            if (st) console.log(`  strict (reference) sample.criticStrict: ${st.rows.pairs} rows = ${st.pages.pairs} pages, ${st.requiredPairs} pairs`);
            console.log(`  dominant pairs     ${c.dominant.map((g) => `${g.group} ${g.pairs}`).join(' · ')}`);
            if (c.overBudget) for (const v of c.proposal.variants) console.log(`  bound ${pad(v.id, 16)} ${v.rows} rows = ${v.pages} pages (lower bound ${v.lowerBound})${v.id === c.proposal.chosen ? '  <- used by sample.critic' : ''}`);
        }
        console.log(`  pairwise checks    ${JSON.stringify(env.sample.checks)}`);
        console.log(`  written            ${relative(ROOT, file)}`);
        for (const [k, v] of Object.entries(env.sample.checks)) if (v === false) fail(`${k} is false`);
        if (!s.skills.length) fail(`no skill draws template '${env.template}'`);
        console.error(`ws-envelope: --envelope computed in ${ms().toFixed(0)} ms`);
    } else {
        console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').filter((l) => l.startsWith('//')).slice(0, 27).map((l) => l.slice(3)).join('\n'));
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

    // 5b. the CRITIC sample (D8): one deduped set of option values, the 20 % / 40-page random part
    const kd = { size: ['S', 'M', 'L'], pages: [1, 2, 3], fade: ['none', 'packet'] };
    const A = { skill: 'a:1', options: { x: [1, 2, 3], y: ['a', 'b'] } };
    const B = { skill: 'b:1', options: { x: [1, 2, 3, 4], z: [true, false] } };
    const cr = criticAllPairs(kd, [A, B], 7);
    ok(criticCovers(kd, [A, B], cr.rows) === null, `critic all-pairs covers every required pair (missing ${criticCovers(kd, [A, B], cr.rows)})`);
    ok(criticCovers(kd, [A, B], cr.rows.slice(1)) !== null, 'the coverage check sees a missing row (greedy rows each cover a new pair)');
    ok(cr.rows.every((r) => criticValid(r)),'critic rows never deal Faded packet on one page');
    ok(!cr.need.has(pairKey('fade', 'packet', 'pages', 1)), 'the pair (fade packet, pages 1) is not required');
    ok(cr.rows.every((r) => Object.keys(r).filter((k) => k.startsWith('opt:')).every((k) => ([A, B].find((s) => s.skill === r.skill).options[k.slice(4)] || []).includes(r[k]))), 'a critic row prints only option values its skill offers');
    ok(cr.rows.some((r) => 'opt:x' in r && r['opt:x'] === 4 && r.skill === 'b:1'), 'a value one skill offers is dealt on that skill');
    const A2 = { skill: 'a:2', options: A.options };
    ok(criticPairs(kd, [A, A2]).size === criticPairs(kd, [A]).size, 'a pair of values two skills share is one pair (deduped across skills)');
    ok(JSON.stringify(criticAllPairs(kd, [A, B], 7).rows) === JSON.stringify(cr.rows), 'the critic all-pairs set is the same for the same seed');
    const dom = criticDominance(cr.need, [A, B]);
    ok(dom.lowerBound <= cr.rows.length && dom.lowerBound >= 9, `lower bound ${dom.lowerBound} <= rows ${cr.rows.length} (size x pages alone needs 9)`);
    const rnd = criticRandom(kd, [A, B], { seed: 3, envelopeSize: 20, taken: cr.rows.slice(0, 5) });
    ok(rnd.want === 3 && rnd.rows.length === 3, `the random part is 20 % of the rest (want ${rnd.want}, got ${rnd.rows.length})`);
    const big = criticRandom(kd, [A, B], { seed: 3, envelopeSize: 1e9, taken: cr.rows });
    ok(big.pages <= CRITIC_RANDOM_CAP_PAGES && big.pages >= CRITIC_RANDOM_CAP_PAGES - 2, `the random part is capped at ${CRITIC_RANDOM_CAP_PAGES} pages (${big.pages})`);
    const takenIds = new Set(cr.rows.map((r) => JSON.stringify(Object.entries(r).sort())));
    ok(big.rows.every((r) => !takenIds.has(JSON.stringify(Object.entries(r).sort()))) && new Set(big.rows.map((r) => JSON.stringify(r))).size === big.rows.length, 'the random part repeats no row');
    const wide = { skill: 'w:1', options: { step: Array.from({ length: 20 }, (_, i) => i + 1), labels: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }, defaults: { step: 5 } };
    const cs = criticSample(kd, [wide, A], { pair: 'fx--single', hosts: ['card'], envelopeSize: 1e9 });
    ok(cs.overBudget && cs.lowerBound >= 140 && cs.dominant[0].group === 'opt:labels x opt:step', `a 20 x 7 option pair is over budget and named (lower bound ${cs.lowerBound}, ${cs.dominant[0].group})`);
    ok(cs.proposal && cs.proposal.variants.length === 3 && cs.rows.pairs < cs.strict.rows.pairs && cs.variant === cs.proposal.chosen, 'over budget: the bounds are measured and the smallest is sample.critic');
    ok(cs.pages.total <= CRITIC_TOTAL_CAP_PAGES, `D8: the critic total is capped at ${CRITIC_TOTAL_CAP_PAGES} pages (${cs.pages.total})`);
    ok(cs.cut.pairsRows === 0 || cs.rows.random === 0, 'D8: random rows are dropped before any all-pairs row');
    ok(cs.coverage.of.startsWith('bounded') && cs.coverage.requiredPairs < cs.coverage.strictRequiredPairs && cs.coverage.coveredPairs + cs.cut.uncoveredPairs === cs.coverage.requiredPairs, `D8: coverage is claimed for the bounded set only (${cs.coverage.coveredPairs}/${cs.coverage.requiredPairs}, strict ${cs.coverage.strictRequiredPairs})`);
    const capped = capCritic({ rule: '', print: [], screen: [], pages: {}, rows: {}, requiredPairs: 0, bounded: Array.from({ length: 30 }, (_, i) => ({ skill: 'a:1', size: 'S', pages: 2, n: i, part: 'pairs-bounded' })), boundedNeed: new Map(), proposal: { chosen: 'x' } }, kd, [A], { seed: 1, envelopeSize: 1e9, valid: criticValid });
    ok(capped.pages.total <= CRITIC_TOTAL_CAP_PAGES && capped.rows.random === 0 && capped.cut.pairsRows === 10 && capped.cut.pairsPages === 20, `D8: an all-pairs part over the cap drops every random row, then cuts and reports all-pairs rows (${capped.cut.pairsRows} rows / ${capped.cut.pairsPages} pages)`);
    const small = criticSample(kd, [A], { pair: 'fx--small', hosts: [], envelopeSize: 1e9 });
    ok(small.variant === 'strict' && small.pages.total <= CRITIC_TOTAL_CAP_PAGES, `D8: a within-budget pair keeps the strict set, total ${small.pages.total} <= ${CRITIC_TOTAL_CAP_PAGES}`);
    ok(boundOptions([wide])[0].options.step.join() === '1,5,20', 'boundary classes: first, default, last');
    // N5 (critic r2): impossible option rows are never required or dealt
    const nlSk = { skill: 'n:1', options: { nlOn: [false, true], nlStep: ['auto', 5, 10], nlFrom: [-1000000, 1000000], nlTo: [-1000000, 1000000] },
        defaults: { nlOn: false, nlStep: 'auto', nlFrom: null, nlTo: null },
        applies: { nlStep: (o) => !!o.nlOn, nlFrom: (o) => !!o.nlOn, nlTo: (o) => !!o.nlOn } };
    ok(!optionRowValid({ 'opt:nlOn': false, 'opt:nlStep': 5 }, nlSk), 'N5: nlStep 5 with nlOn off is impossible');
    ok(optionRowValid({ 'opt:nlOn': false, 'opt:nlStep': 'auto' }, nlSk), 'N5: nlStep at its default with nlOn off is fine');
    ok(!optionRowValid({ 'opt:nlOn': true, 'opt:nlFrom': 1000000, 'opt:nlTo': -1000000 }, nlSk), 'N5: nlFrom above nlTo is impossible');
    ok(optionRowValid({ 'opt:nlOn': true, 'opt:nlFrom': -1000000, 'opt:nlTo': 1000000 }, nlSk), 'N5: nlFrom below nlTo is fine');
    const nlRows = criticAllPairs({ size: ['S', 'M'] }, [nlSk], 5, criticValidFor([nlSk])).rows;
    const bad5 = (r) => (r['opt:nlOn'] === false && ['opt:nlStep', 'opt:nlFrom', 'opt:nlTo'].some((k) => k in r && JSON.stringify(r[k]) !== JSON.stringify(nlSk.defaults[k.slice(4)]))) || (typeof r['opt:nlFrom'] === 'number' && typeof r['opt:nlTo'] === 'number' && r['opt:nlFrom'] >= r['opt:nlTo']);
    ok(nlRows.length && !nlRows.some(bad5), `N5: the critic all-pairs deals no impossible row (${nlRows.filter(bad5).length} of ${nlRows.length})`);
    ok(criticCovers({ size: ['S', 'M'] }, [nlSk], nlRows, criticValidFor([nlSk])) === null, 'N5: and still covers every possible pair');
    const rnd5 = criticRandom({ size: ['S', 'M'] }, [nlSk], { seed: 3, envelopeSize: 200, capPages: 40, valid: criticValidFor([nlSk]) }).rows;
    ok(rnd5.length && !rnd5.some(bad5), `N5: the random part deals no impossible row (${rnd5.filter(bad5).length} of ${rnd5.length})`);
    const ap5 = allPairs({ size: ['S', 'M'], 'opt:nlOn': [false, true], 'opt:nlStep': ['auto', 5], 'opt:nlFrom': [-1000000, 1000000], 'opt:nlTo': [-1000000, 1000000] }, 17, null, (r) => optionRowValid(r, nlSk), { 'opt:nlOn': false, 'opt:nlStep': 'auto' });
    ok(!ap5.some(bad5), `N5: the per-skill machine sample deals no impossible row (${ap5.filter(bad5).length} of ${ap5.length})`);

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
