// ws-redesign-passed.mjs — GATE: js/modules/redesign-passed.js (THE one place that records the skills that passed the 8/10
// redesign, owner 2026-10-25) lists only live skills, each with its evidence. Exit 1 on an unknown id or a missing evidence line.
//   node tests/scripts/ws-redesign-passed.mjs
import { REDESIGN_PASSED, REDESIGN_EVIDENCE } from '../../js/modules/redesign-passed.js';
// data.js reads localStorage at load: a tiny in-memory stand-in for node
globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem() {}, removeItem() {} };
const { SKILLS } = await import('../../js/modules/data.js');

const live = new Set();
for (const [cat, list] of Object.entries(SKILLS)) for (const s of list || []) if (s && (s.v || s.id)) live.add(`${cat}:${s.v || s.id}`);
const bad = [];
for (const k of REDESIGN_PASSED) {
    if (!live.has(k)) bad.push(`${k}: not a live skill (data.js SKILLS)`);
    if (!String(REDESIGN_EVIDENCE[k] || '').trim()) bad.push(`${k}: no evidence line`);
}
for (const k of Object.keys(REDESIGN_EVIDENCE)) if (!REDESIGN_PASSED.has(k)) bad.push(`${k}: evidence without a REDESIGN_PASSED entry`);
if (bad.length) { console.log(bad.join('\n')); console.log(`ws-redesign-passed: FAIL (${bad.length})`); process.exit(1); }
console.log(`ws-redesign-passed: OK (${REDESIGN_PASSED.size} skills passed the 8/10 redesign)`);
