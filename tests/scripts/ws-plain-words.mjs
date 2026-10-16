// ws-plain-words.mjs — generate js/modules/plain-words-db.js, the plain-word ALLOWLIST every teacher-facing
// line on the White Rose, Skills to be made and MAP task screens is checked against (js/modules/plain-words.js).
//
//   node tests/scripts/ws-plain-words.mjs            write the db
//   node tests/scripts/ws-plain-words.mjs --check    exit 1 when the committed db is stale
//
// The words come only from text a teacher already reads in MathQuest or in the school's own documents:
//   skill labels (data.js), option labels and value labels (skill-options.js), White Rose step titles
//   (wrm-db.js), the school sequence's lesson and unit names (wrm-sequence-db.js), the visible text of
//   index.html and of the teacher screens' templates (js/modules/teacher-*.js), the instruction library (sheet/contract.js), the CCSS and Essential Element wording
//   (data/standards), the Teaching Guides' key vocabulary (data/curriculum/wrm-vocab.json), and the hand list
//   data/curriculum/plain-words-hand.txt (common English and maths words, read by a person, one per line).
// DENY in plain-words.js always wins, so a build word that slips into a source still fails.
import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
globalThis.localStorage = globalThis.localStorage || { getItem: () => null, setItem() {}, removeItem() {} };

const root = new URL('../../', import.meta.url);
const rd = (p) => readFileSync(new URL(p, root), 'utf8');
const texts = [];

const DATA = await import('../../js/modules/data.js');
const OPT = await import('../../js/modules/skill-options.js');
for (const [cat, list] of Object.entries(DATA.SKILLS)) {
    for (const s of list || []) {
        if (!s || !s.v) continue;
        texts.push(String(s.l || ''));
        let defs = [];
        try { defs = OPT.optionsFor(cat, s.v); } catch (e) { defs = []; }
        for (const d of defs) {
            texts.push(String(d.label || ''), String(d.allLabel || ''), String(d.nullLabel || ''));
            for (const v of d.values || []) texts.push(String(v.l || ''));
        }
    }
}
for (const d of Object.values(DATA.DOMAINS || {})) texts.push(String(d.name || d.label || ''));
const { WRM_STEPS, WRM_BLOCKS } = await import('../../js/modules/wrm-db.js');
for (const s of WRM_STEPS) texts.push(String(s.title || ''));
for (const b of WRM_BLOCKS) texts.push(String(b.title || b.name || ''));
const { WRM_SEQUENCE } = await import('../../js/modules/wrm-sequence-db.js');
for (const g of WRM_SEQUENCE) for (const u of g.units) { texts.push(String(u.name || '')); for (const l of u.lessons) texts.push(String(l[0] || '')); }
const html = rd('index.html').replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ');
texts.push(html);
// the teacher screens' own words: text between tags in their templates, and quoted sentences (toasts, labels)
for (const f of readdirSync(new URL('js/modules/', root)).filter((x) => /^teacher-.*\.js$/.test(x))) {
    const src = rd(`js/modules/${f}`).replace(/\/\/.*$/gm, ' ').replace(/\/\*[\s\S]*?\*\//g, ' ');
    for (const m of src.matchAll(/>([^<>{}$`]{3,})</g)) texts.push(m[1]);
    for (const m of src.matchAll(/(['"])([A-Z][a-z][^'"\n]*? [^'"\n]*?)\1/g)) texts.push(m[2]);
    for (const m of src.matchAll(/(['"])([A-Z][a-z]+)\1/g)) texts.push(m[2]);   // one-word labels: 'Thumbnails', 'Print'
}
const { INSTRUCTION_LIBRARY } = await import('../../js/modules/sheet/contract.js');
texts.push(...Object.values(INSTRUCTION_LIBRARY).map((x) => String(x).replace(/_/g, ' ')));
const ccss = JSON.parse(rd('data/standards/ccss-math.json'));
for (const s of Object.values(ccss.standards || {})) texts.push(String(s.text || ''), String(s.clusterText || ''), String(s.domainName || ''));
const ee = JSON.parse(rd('data/standards/ee-math.json'));
const walk = (o) => { if (typeof o === 'string') texts.push(o); else if (o && typeof o === 'object') for (const [k, v] of Object.entries(o)) if (!/^(?:source|sources|url|file|id|code|meta)$/i.test(k)) walk(v); };
walk(ee.essentialElements);
const vocab = JSON.parse(rd('data/curriculum/wrm-vocab.json'));
for (const s of Object.values(vocab.steps || {})) { texts.push(...(s.words || []), ...Object.entries(s.glossary || {}).flat(), ...(s.stems || [])); }
const handFile = new URL('data/curriculum/plain-words-hand.txt', root);
const hand = existsSync(handFile) ? readFileSync(handFile, 'utf8').split('\n').map((l) => l.replace(/#.*$/, '').trim()).filter(Boolean) : [];
texts.push(...hand);

const { DENY } = await import('../../js/modules/plain-words.js');
const words = new Set();
for (const t of texts) {
    for (const m of String(t).match(/[A-Za-z]+(?:['’][A-Za-z]+)?/g) || []) {
        const raw = m.replace(/['’]s$/i, '');
        if (raw.length < 2 && raw.toLowerCase() !== 'a') continue;
        if (/[A-Z]/.test(raw.slice(1))) continue;            // camelCase or an acronym never becomes a plain word
        const w = raw.toLowerCase().replace(/['’]/g, '');
        if (!DENY.has(w)) words.add(w);
    }
}
const list = [...words].sort();
const out = `// GENERATED by tests/scripts/ws-plain-words.mjs — never hand-edit. Add a plain word to
// data/curriculum/plain-words-hand.txt and regenerate. ${list.length} words.
export const PLAIN_WORDS = ${JSON.stringify(list.join(' '))};
`;
const dbUrl = new URL('js/modules/plain-words-db.js', root);
if (process.argv.includes('--check')) {
    const cur = existsSync(dbUrl) ? readFileSync(dbUrl, 'utf8') : '';
    const okk = cur === out;
    console.log(`ws-plain-words: ${okk ? 'OK' : 'FAIL (stale: run node tests/scripts/ws-plain-words.mjs)'} — ${list.length} words`);
    process.exit(okk ? 0 : 1);
}
writeFileSync(dbUrl, out);
console.log(`ws-plain-words: wrote js/modules/plain-words-db.js — ${list.length} words (${hand.length} from the hand list)`);
