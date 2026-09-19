// Static lint over the modules (no browser):
//   - every printFormat a generator emits has a print handler and a size entry
//   - every skill has a print size
//   - every alias target exists
// Report-only until a family is marked migrated; pass --strict to exit non-zero on any finding.
//   node tests/scripts/ws-lint-static.mjs [--strict] [--json]
import { readFileSync, readdirSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const MOD = join(ROOT, 'js', 'modules');
const read = f => readFileSync(join(MOD, f), 'utf8');

globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const realLog = console.log;
console.log = () => {};
const data = await import(pathToFileURL(join(MOD, 'data.js')).href);
const aliases = await import(pathToFileURL(join(MOD, 'skill-aliases.js')).href);
console.log = realLog;

const generators = readdirSync(MOD).filter(f => /^gen-.*\.js$/.test(f) || ['generate-question.js', 'tchart-factor.js', 'divisibility-sort.js'].includes(f));
const emitted = new Map(); // format -> files
for (const f of generators) {
    const src = read(f);
    for (const m of src.matchAll(/printFormat\s*[:=]\s*(["'`])([\w-]+)\1/g)) {
        if (!emitted.has(m[2])) emitted.set(m[2], new Set());
        emitted.get(m[2]).add(f);
    }
}

const printSrc = read('print-generate.js');
const handled = new Set();
for (const m of printSrc.matchAll(/printFormat\s*===\s*(["'`])([\w-]+)\1/g)) handled.add(m[2]);
for (const m of printSrc.matchAll(/\[([^\]]{0,4000})\]\.includes\(\s*(?:problem|p|q)\.printFormat\s*\)/g)) {
    for (const s of m[1].matchAll(/(["'`])([\w-]+)\1/g)) handled.add(s[2]);
}

// Handlers that match a family by prefix / suffix, e.g. printFormat.endsWith('-nv')
const prefixes = [...printSrc.matchAll(/printFormat\.startsWith\(\s*(["'`])([\w-]+)\1/g)].map(m => m[2]);
const suffixes = [...printSrc.matchAll(/printFormat\.endsWith\(\s*(["'`])([\w-]+)\1/g)].map(m => m[2]);
for (const fmt of emitted.keys()) {
    if (prefixes.some(p => fmt.startsWith(p)) || suffixes.some(s => fmt.endsWith(s))) handled.add(fmt);
}

const sized = new Set(Object.keys(data.PRINT_FORMAT_SIZE || {}));
const findings = { noHandler: [], noSize: [], skillNoSize: [], badAlias: [] };
for (const [fmt, files] of [...emitted].sort()) {
    if (!handled.has(fmt)) findings.noHandler.push(`${fmt}  (${[...files].join(', ')})`);
    if (!sized.has(fmt)) findings.noSize.push(fmt);
}
const allIds = new Set();
for (const cat in data.SKILLS) {
    if (!Array.isArray(data.SKILLS[cat])) continue;
    for (const s of data.SKILLS[cat]) {
        allIds.add(`${cat}:${s.v}`); allIds.add(s.v);
        if (!data.SKILL_PRINT_SIZE[s.v] && !data.isMixedMetaSkill(s.v)) findings.skillNoSize.push(`${cat}:${s.v}`);
    }
}
for (const [from, to] of Object.entries(aliases.SKILL_ALIASES)) {
    const key = to.categoryId ? `${to.categoryId}:${to.skillId}` : to.skillId;
    if (!allIds.has(key)) findings.badAlias.push(`${from} -> ${key}`);
}

if (process.argv.includes('--json')) {
    realLog(JSON.stringify({ emitted: emitted.size, handled: handled.size, ...findings }, null, 1));
} else {
    realLog(`ws-lint-static: ${emitted.size} printFormats emitted, ${handled.size} handled in print-generate.js`);
    const show = (title, list) => { realLog(`  ${title}: ${list.length}`); list.slice(0, 60).forEach(x => realLog(`    - ${x}`)); };
    show('emitted with NO print handler', findings.noHandler);
    show('emitted with no PRINT_FORMAT_SIZE entry', findings.noSize);
    show('skills with no SKILL_PRINT_SIZE entry', findings.skillNoSize);
    show('alias targets that do not exist', findings.badAlias);
}
const total = Object.values(findings).reduce((n, l) => n + l.length, 0);
process.exit(process.argv.includes('--strict') && total ? 1 : 0);
