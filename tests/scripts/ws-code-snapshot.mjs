// Share-code safety net. Every shared link, skill code, settings code and mixed-mode code
// decodes through js/modules/skill-codes-frozen.js, so this test fails when an existing
// code or positional index would change.
//
//   node tests/scripts/ws-code-snapshot.mjs            check
//   node tests/scripts/ws-code-snapshot.mjs --update   re-pin the baseline (append-only)
//
// No server or browser needed.
import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { pathToFileURL, fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import { tmpdir } from 'node:os';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const DATA = join(ROOT, 'js', 'modules', 'data.js');
const FROZEN = join(ROOT, 'js', 'modules', 'skill-codes-frozen.js');
const BASELINE = join(ROOT, 'tests', 'baselines', 'skill-codes.snapshot.json');

// data.js touches localStorage at import time and logs its code count.
globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
const realLog = console.log;
const quietImport = async (url) => {
    console.log = () => {};
    try { return await import(url); } finally { console.log = realLog; }
};

const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };

const frozen = await quietImport(pathToFileURL(FROZEN).href);
const data = await quietImport(pathToFileURL(DATA).href);
const { FROZEN_SKILL_CODES, FROZEN_CATEGORY_ORDER } = frozen;
const { SKILLS, SKILL_CODES, CODE_TO_SKILL, getPositionalSkills } = data;

// 1. Baseline is append-only: nothing already pinned may change or disappear.
if (process.argv.includes('--update')) {
    let old = null;
    try { old = JSON.parse(readFileSync(BASELINE, 'utf8')); } catch { /* first pin */ }
    if (old) {
        for (const [k, v] of Object.entries(old.codes)) check(FROZEN_SKILL_CODES[k] === v, `--update would change pinned code ${k}: ${v} -> ${FROZEN_SKILL_CODES[k]}`);
        for (const [c, ids] of Object.entries(old.order)) ids.forEach((id, i) => check((FROZEN_CATEGORY_ORDER[c] || [])[i] === id, `--update would move pinned index ${c}[${i}] ${id}`));
    }
    if (!failures.length) {
        writeFileSync(BASELINE, JSON.stringify({ codes: FROZEN_SKILL_CODES, order: FROZEN_CATEGORY_ORDER }, null, 1) + '\n');
        realLog(`Pinned ${Object.keys(FROZEN_SKILL_CODES).length} codes, ${Object.keys(FROZEN_CATEGORY_ORDER).length} categories -> ${BASELINE}`);
    }
} else {
    const base = JSON.parse(readFileSync(BASELINE, 'utf8'));
    for (const [k, v] of Object.entries(base.codes)) check(FROZEN_SKILL_CODES[k] === v, `frozen code changed: ${k} was ${v}, now ${FROZEN_SKILL_CODES[k]}`);
    for (const [c, ids] of Object.entries(base.order)) ids.forEach((id, i) => check((FROZEN_CATEGORY_ORDER[c] || [])[i] === id, `frozen index changed: ${c}[${i}] was ${id}, now ${(FROZEN_CATEGORY_ORDER[c] || [])[i]}`));
}

// 2. The live tables honour the frozen ones and round-trip.
const seen = new Map();
for (const [key, code] of Object.entries(SKILL_CODES)) {
    check(/^[A-HJ-NP-Z2-9]{2}$/.test(code), `bad code shape ${key}: ${code}`);
    check(!seen.has(code), `duplicate code ${code}: ${seen.get(code)} and ${key}`);
    seen.set(code, key);
    const back = CODE_TO_SKILL[code];
    check(back && `${back.categoryId}:${back.skillId}` === key, `code ${code} does not decode back to ${key}`);
}
for (const [key, code] of Object.entries(FROZEN_SKILL_CODES)) check(SKILL_CODES[key] === code, `live code for ${key} is ${SKILL_CODES[key]}, frozen says ${code}`);
for (const cat in SKILLS) {
    if (!Array.isArray(SKILLS[cat])) continue;
    const positional = getPositionalSkills(cat).map(s => s.v);
    (FROZEN_CATEGORY_ORDER[cat] || []).forEach((id, i) => check(positional[i] === id, `positional index ${cat}[${i}] is ${positional[i]}, frozen says ${id}`));
    for (const s of SKILLS[cat]) {
        check(positional.includes(s.v), `live skill ${cat}:${s.v} missing from the positional list`);
        if (s.v !== 'custom_mixed') check(!!SKILL_CODES[`${cat}:${s.v}`], `live skill ${cat}:${s.v} has no code`);
    }
}

// 3. Insertion stability: a new skill added at the FRONT of a category, and one retired from
//    the middle, must not move any existing code or index. Runs against a patched temp copy.
const tmp = mkdtempSync(join(tmpdir(), 'mq-codes-'));
try {
    let src = readFileSync(DATA, 'utf8').replace("'./skill-codes-frozen.js'", JSON.stringify(pathToFileURL(FROZEN).href));
    const marker = /(\n\s*addition:\s*\[)/;
    check(marker.test(src), 'could not find the addition category to patch');
    src = src.replace(marker, `$1\n        { v: "__ws_probe_new_skill", l: "probe" },`);
    const retired = FROZEN_CATEGORY_ORDER.addition[3];
    src = src.replace(new RegExp(`\\{\\s*v:\\s*"${retired}"[^}]*\\},?`), '');
    const patchedPath = join(tmp, 'data.patched.mjs');
    writeFileSync(patchedPath, src);
    const patched = await quietImport(pathToFileURL(patchedPath).href);
    check(!patched.SKILLS.addition.some(s => s.v === retired), `patch failed to retire ${retired}`);
    for (const [key, code] of Object.entries(FROZEN_SKILL_CODES)) check(patched.SKILL_CODES[key] === code, `after insert/retire, ${key} moved to ${patched.SKILL_CODES[key]}`);
    const probeCode = patched.SKILL_CODES['addition:__ws_probe_new_skill'];
    check(!!probeCode && !Object.values(FROZEN_SKILL_CODES).includes(probeCode), `new skill got a clashing or missing code: ${probeCode}`);
    const pos = patched.getPositionalSkills('addition');
    FROZEN_CATEGORY_ORDER.addition.forEach((id, i) => check(pos[i].v === id, `after insert/retire, addition[${i}] is ${pos[i].v}, expected ${id}`));
    check(pos[3].retired === true, 'retired skill should stay as a placeholder');
    check(pos[pos.length - 1].v === '__ws_probe_new_skill', 'new skill should be appended after the frozen ids');
} finally {
    rmSync(tmp, { recursive: true, force: true });
}

if (failures.length) {
    console.error(`ws-code-snapshot: ${failures.length} FAILURE(S)`);
    failures.slice(0, 40).forEach(f => console.error('  - ' + f));
    process.exit(1);
}
realLog(`ws-code-snapshot: OK (${Object.keys(SKILL_CODES).length} codes, ${Object.keys(FROZEN_CATEGORY_ORDER).length} categories, insertion + retirement stable)`);
