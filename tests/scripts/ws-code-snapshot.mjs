// Share-code safety net. Every shared link, skill code, settings code and mixed-mode code
// decodes through js/modules/skill-codes-frozen.js, so this test fails when an existing
// code or positional index would change.
//
//   node tests/scripts/ws-code-snapshot.mjs            check
//   node tests/scripts/ws-code-snapshot.mjs --update   re-pin the baseline (append-only)
//
// No server or browser needed.
//
// WHAT THE PRINTED COUNT MEANS (owner ruling R1, 2026-09-20). Appending a new skill id is the
// designed, safe path, so the code count RISES whenever ids are appended and the rise is not a
// failure. The count FALLING is, and so is any "changed" / "MOVED" / "DELETED" line. The gate is
// the pinned baseline plus the structural checks below, never the number in the OK line.
//
// WHAT THIS TEST CAUGHT ITSELF ON, 2026-09-20. Until this revision, sections 1 and 2 only ever
// compared the FROZEN tables with the baseline, and read the live order through
// getPositionalSkills(), which rebuilds it FROM the frozen table and substitutes a retired
// placeholder for anything missing. So a deliberate reorder of SKILLS[cat] and a deliberate
// DELETION of a skill from it both passed, silently — the two faults the test exists to catch.
// Section 2a now reads js/modules/data.js's live arrays directly, which is the only way to see
// them. It allows exactly one kind of change: new ids appended after every frozen id.
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

let baseline = null;
try { baseline = JSON.parse(readFileSync(BASELINE, 'utf8')); } catch { /* first pin */ }

// 1. Baseline is append-only: nothing already pinned may change or disappear.
if (process.argv.includes('--update')) {
    if (baseline) {
        for (const [k, v] of Object.entries(baseline.codes)) check(FROZEN_SKILL_CODES[k] === v, `--update would change pinned code ${k}: ${v} -> ${FROZEN_SKILL_CODES[k]}`);
        for (const [c, ids] of Object.entries(baseline.order)) ids.forEach((id, i) => check((FROZEN_CATEGORY_ORDER[c] || [])[i] === id, `--update would move pinned index ${c}[${i}] ${id}`));
    }
    if (!failures.length) {
        writeFileSync(BASELINE, JSON.stringify({ codes: FROZEN_SKILL_CODES, order: FROZEN_CATEGORY_ORDER }, null, 1) + '\n');
        realLog(`Pinned ${Object.keys(FROZEN_SKILL_CODES).length} codes, ${Object.keys(FROZEN_CATEGORY_ORDER).length} categories -> ${BASELINE}`);
    }
} else {
    if (!baseline) { console.error(`ws-code-snapshot: FAILURE - no baseline at ${BASELINE}`); process.exit(1); }
    for (const [k, v] of Object.entries(baseline.codes)) check(FROZEN_SKILL_CODES[k] === v, `frozen code changed: ${k} was ${v}, now ${FROZEN_SKILL_CODES[k]}`);
    for (const [c, ids] of Object.entries(baseline.order)) ids.forEach((id, i) => check((FROZEN_CATEGORY_ORDER[c] || [])[i] === id, `frozen index changed: ${c}[${i}] was ${id}, now ${(FROZEN_CATEGORY_ORDER[c] || [])[i]}`));
    // The count may rise (appended ids) but never fall: a code that disappears is a shared link,
    // a favourite and a printed QR that now open nothing, or the wrong sheet.
    const pinned = Object.keys(baseline.codes).length;
    check(Object.keys(SKILL_CODES).length >= pinned, `the live code count FELL from the pinned ${pinned} to ${Object.keys(SKILL_CODES).length}; ids may be appended, never removed`);
    for (const k of Object.keys(baseline.codes)) check(k in SKILL_CODES, `pinned skill ${k} has no live code any more`);
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

    // 2a. The LIVE array, read directly. Everything above this point goes through
    //     getPositionalSkills(), which reconstructs the order from the frozen table and fills a
    //     gap with a retired placeholder — so it cannot tell a reorder or a deletion from a
    //     tombstone. These three checks can, and they are the ones that allow an append.
    const frozenIds = FROZEN_CATEGORY_ORDER[cat] || [];
    const frozenSet = new Set(frozenIds);
    const liveIds = SKILLS[cat].map(s => s.v);
    const liveSet = new Set(liveIds);

    // (a) nothing frozen may vanish. A retirement keeps the entry and sets retired: true.
    for (const id of frozenIds) {
        check(liveSet.has(id), `frozen skill ${cat}:${id} was DELETED from SKILLS.${cat}. Four positional share-code systems index this array, so the entry must stay: mark it \`retired: true\` in place and redirect it in js/modules/skill-aliases.js.`);
    }
    // (b) the frozen ids must still appear in the frozen order inside the live array.
    const liveFrozenOrder = liveIds.filter(v => frozenSet.has(v));
    frozenIds.filter(id => liveSet.has(id)).forEach((id, i) => {
        check(liveFrozenOrder[i] === id, `SKILLS.${cat} MOVED a frozen skill: frozen position ${i} is ${liveFrozenOrder[i]}, the frozen table says ${id}. Appending is safe; inserting and reordering silently re-point every saved code, favourite and printed link.`);
    });
    // (c) a new id appends. Nothing unfrozen may sit in front of a frozen one.
    const lastFrozenAt = liveIds.reduce((acc, v, i) => (frozenSet.has(v) ? i : acc), -1);
    liveIds.slice(0, lastFrozenAt + 1).forEach((v, i) => {
        check(frozenSet.has(v), `SKILLS.${cat}[${i}] "${v}" is a new skill INSERTED before a frozen id; a new skill goes at the END of the array.`);
    });
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
    // The probe must land after EVERY frozen id. Asserting it is simply last was wrong as soon
    // as a second unfrozen skill existed: getPositionalSkills() lists the unfrozen ones in live
    // order, and this probe is patched in at the FRONT, so a legitimately appended-but-unpinned
    // skill would sort behind it and fail a test that is not about it. (Found 2026-09-20 by
    // appending a skill with no frozen entry, which the frozen file's own header allows.)
    const probeAt = pos.findIndex(s => s.v === '__ws_probe_new_skill');
    check(probeAt >= FROZEN_CATEGORY_ORDER.addition.length, `new skill should sit after all ${FROZEN_CATEGORY_ORDER.addition.length} frozen addition ids, but it is at index ${probeAt}`);
} finally {
    rmSync(tmp, { recursive: true, force: true });
}

// 4. Option-bearing codes (owner, 2026-09-24; design/SHARE_CODES.md). A skill's options ride on its
//    code as "~payload". Two promises are checked here without a browser:
//    (a) a skill at its defaults writes NO payload, so every code shared before options existed is
//        still what a default set writes, and decoding the bare code yields no options;
//    (b) every option every live skill offers survives encode -> decode, alone and all together.
//    The in-app decoders (skill code, MX-, settings code, Quick Start) are exercised end to end by
//    tests/scripts/ws-share-options.cjs.
let optionTrips = 0;
{
    const opt = await quietImport(pathToFileURL(join(ROOT, 'js', 'modules', 'skill-options.js')).href);
    await quietImport(pathToFileURL(join(ROOT, 'js', 'modules', 'skill-options-derived.js')).href);
    const codec = await quietImport(pathToFileURL(join(ROOT, 'js', 'modules', 'skill-option-codec.js')).href);
    const SAFE = /^[A-Z0-9_]*$/;
    for (const cat in SKILLS) {
        if (!Array.isArray(SKILLS[cat])) continue;
        for (const s of SKILLS[cat]) {
            if (s.retired || s.v === 'custom_mixed') continue;
            check(codec.encodeOptionPayload(cat, s.v, {}) === '', `${cat}:${s.v} writes a payload at its defaults`);
            check(Object.keys(codec.decodeOptionPayload(cat, s.v, '')).length === 0, `${cat}:${s.v} decodes options from a bare code`);
            const all = {};
            for (const d of opt.offeredOptionsFor(cat, s.v)) {
                let v;
                if (d.type === 'set') v = d.values.length > 1 ? [d.values[0].v, d.values[d.values.length - 1].v] : [];
                else if (d.type === 'bool') v = !d.default;
                else if (d.type === 'enum') v = d.values.map(x => x.v).find(x => JSON.stringify(x) !== JSON.stringify(d.default));
                if (v === undefined) continue;
                const want = opt.packOptions(cat, s.v, { [d.id]: v });
                if (!Object.keys(want).length) continue;
                Object.assign(all, want);
                const pay = codec.encodeOptionPayload(cat, s.v, want);
                check(SAFE.test(pay), `${cat}:${s.v} payload is not URL-safe: ${pay}`);
                const back = codec.decodeOptionPayload(cat, s.v, pay);
                check(JSON.stringify(back) === JSON.stringify(want), `${cat}:${s.v} ${d.id}: ${JSON.stringify(want)} -> ${pay} -> ${JSON.stringify(back)}`);
                optionTrips++;
            }
            if (Object.keys(all).length) {
                const pay = codec.encodeOptionPayload(cat, s.v, all);
                const back = codec.decodeOptionPayload(cat, s.v, '~' + pay);
                check(JSON.stringify(back) === JSON.stringify(opt.packOptions(cat, s.v, all)), `${cat}:${s.v} combined options did not round-trip: ${pay}`);
            }
        }
    }
    // A later format version (leading digit) and an unknown key are ignored, never misread.
    check(Object.keys(codec.decodeOptionPayload('multiplication', 'mult_facts', '~2C78')).length === 0, 'an unknown payload version was decoded');
    check(JSON.stringify(codec.decodeOptionPayload('multiplication', 'mult_facts', '~Q1_C78')) === '{"constant":[7,8]}', 'an unknown option key broke decoding');
}

if (failures.length) {
    console.error(`ws-code-snapshot: ${failures.length} FAILURE(S)`);
    failures.slice(0, 40).forEach(f => console.error('  - ' + f));
    process.exit(1);
}
const liveCount = Object.keys(SKILL_CODES).length;
const pinnedCount = baseline ? Object.keys(baseline.codes).length : liveCount;
const appended = liveCount - pinnedCount;
realLog(`ws-code-snapshot: OK (${liveCount} codes, ${Object.keys(FROZEN_CATEGORY_ORDER).length} categories, ${appended ? `+${appended} appended since the pinned baseline of ${pinnedCount}` : `baseline of ${pinnedCount} unchanged`}, no frozen code or position moved, no frozen skill deleted, insertion + retirement stable, ${optionTrips} option round trips)`);
