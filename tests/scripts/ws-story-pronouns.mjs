// ws-story-pronouns — a story's pronoun agrees with its name (lf-algebra, 2026-11-13; lf-engine roles critic 8266326ba N4:
// "Mia needs 187 shells. He already has ...", "Lily needs 60 books. He ..."). Owner rule: the finding is a check before its fix
// lands. No browser.
//
//   node tests/scripts/ws-story-pronouns.mjs [--skill cat:a,...] [--root DIR] [--n 30] [--self-test]
//
//   STATIC-PRONOUN  over every js/modules/**/*.js: no template literal interpolates a NAME variable (`${name}`, `${tdName}`,
//                   `${msName}` ...) and also hard-codes a gendered pronoun (He / She / his / her / him ...): the name is
//                   picked from a mixed list, so a fixed pronoun is wrong for half of them. Repeat the name instead
//                   (PEDAGOGY P-WP-19: no pronoun chains), or pick the pronoun with the name.
//   PRONOUN-AGREE   sampled with generateQuestionFor (--n items a skill; every skill, or --skill): in a story whose named
//                   people are all one gender (the NAMES map below), every gendered pronoun is that gender.
//   PRONOUN-ONE     a story with one named person never uses both a he-pronoun and a she-pronoun (one name, one pronoun -
//                   holds for the names the map calls either, e.g. Kai).
//   UNMAPPED        a sampled story with a gendered pronoun names someone the map does not know (add the name to NAMES),
//                   so a new name can never slip past PRONOUN-AGREE.
// Prints `ws-story-pronouns: OK` / `FAIL`.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TOOL = 'ws-story-pronouns';
const args = process.argv.slice(2);
const arg = (f, d) => { const i = args.indexOf(f); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(arg('--root', process.env.MQ_ROOT || join(HERE, '..', '..')));
const N = Math.max(5, Number(arg('--n', 30)) || 30);
const only = String(arg('--skill', arg('--skills', ''))).split(',').map((s) => s.trim()).filter(Boolean);

const F = 'Aisha Amira Ana Anna Ava Aya Chloe Ella Emma Eva Fatima Grace Hana Isla Layla Leila Lena Lily Maria Mei Mia Mila Nadia Nina Noor Olivia Priya Rosa Sara Sarah Sofia Sophia Zara Zoe Lucy Amy Ruby Hannah Jade Maya Yara';
const M = 'Adam Ahmed Ali Ben Carlos Diego Ethan Finn Hugo Jack Jake James Kofi Leo Liam Lucas Luis Mason Max Noah Omar Owen Raj Ravi Ryan Sam Theo Tom Yusuf Jamal Kian Joe Dan Tim Oscar Arjun Mateo';
const EITHER = 'Kai Alex Yuki Jordan Taylor Rio';
const NAMES = new Map([...F.split(' ').map((n) => [n, 'f']), ...M.split(' ').map((n) => [n, 'm']), ...EITHER.split(' ').map((n) => [n, 'x'])]);
const PRON = { he: 'm', him: 'm', his: 'm', himself: 'm', she: 'f', her: 'f', hers: 'f', herself: 'f' };
const STOP = new Set('The A An Each Every There This That These Those In On At How What Which Who If After Before When Then Write Find Solve Use Look Read Draw Fill Circle Count Choose Some All One Two Three Four Five Six Seven Eight Nine Ten Is Are Was Were Do Does Did Can It They We You I Mr Mrs Ms Dr'.split(' '));

/** The verdicts on one story text: [] when it is fine. */
export function judgeStory(text) {
    const t = String(text || '');
    const pr = [...t.matchAll(/\b(he|him|his|himself|she|her|hers|herself)\b/gi)].map((m) => PRON[m[1].toLowerCase()]);
    if (!pr.length) return [];
    const names = [...new Set([...t.matchAll(/\b[A-Z][a-z]+\b/g)].map((m) => m[0]).filter((w) => NAMES.has(w)))];
    const out = [];
    if (!names.length) {
        const first = (t.match(/^\s*([A-Z][a-z]+)\b/) || [])[1];
        if (first && !STOP.has(first)) out.push(['UNMAPPED', `"${first}" with a gendered pronoun is not in the NAMES map`]);
        return out;
    }
    const g = [...new Set(names.map((n) => NAMES.get(n)).filter((x) => x !== 'x'))];
    if (g.length === 1 && pr.some((p) => p !== g[0])) out.push(['PRONOUN-AGREE', `${names.join(' / ')} (${g[0] === 'f' ? 'she' : 'he'}) with a ${g[0] === 'f' ? 'he' : 'she'}-pronoun`]);
    else if (names.length === 1 && new Set(pr).size > 1) out.push(['PRONOUN-ONE', `${names[0]} is both he and she`]);
    return out;
}

function selfTest() {
    const cases = [['Mia needs 187 shells. He already has 9.', 'PRONOUN-AGREE'], ['Mia needs 187 shells. Mia already has 9.', null],
        ['Liam types 60 words. How many words does he type?', null], ['Kai had 5. He gave 2. She has 3.', 'PRONOUN-ONE'],
        ['Zed had 5. He gave 2.', 'UNMAPPED'], ['Each bag has 3. How many does she have?', null], ['Ben gave her 3 coins.', 'PRONOUN-AGREE']];
    const bad = cases.filter(([s, want]) => { const r = judgeStory(s); return want ? !r.some((x) => x[0] === want) : r.length; });
    const fx = '`${tdName} had ${whole} ${tdItem}. He gave ${knownPart} away.`';
    const okFx = '`${tdName} had ${whole} ${tdItem}. ${tdName} gave ${knownPart} away.`';
    if (!staticHits(fx, 'fx').length) bad.push(['static', 'missed']);
    if (staticHits(okFx, 'fx').length) bad.push(['static ok', 'flagged']);
    console.log(bad.length ? `${TOOL}: FAIL (self-test: ${bad.map((b) => b[0]).join(' | ')})` : `${TOOL}: OK (self-test, ${cases.length + 2} cases)`);
    process.exit(bad.length ? 1 : 0);
}

function staticHits(src, file) {
    const out = [];
    const re = /`([^`]*)`/g; let m;
    while ((m = re.exec(src))) {
        const vars = [...m[1].matchAll(/\$\{\s*([A-Za-z_$][\w$.]*)\s*\}/g)].map((x) => x[1]);
        const nameVars = vars.filter((v) => /name|person/i.test(v) && !/pron|item|unit|noun|label|class|file|shape|skill|var|tag|key|col|field|cat/i.test(v));
        if (!nameVars.length) continue;
        const plain = m[1].replace(/\$\{[^}]*\}/g, ' X ');
        const pr = plain.match(/\b(He|She|he|she|his|her|him|hers|himself|herself)\b/g);
        if (pr) out.push(`${file}:${src.slice(0, m.index).split('\n').length} \${${nameVars[0]}} with "${pr.join('", "')}": ${m[1].replace(/\s+/g, ' ').slice(0, 90)}`);
    }
    return out;
}

if (args.includes('--self-test')) selfTest();

const fails = [];
// ---- STATIC-PRONOUN
const walk = (d) => readdirSync(d).flatMap((f) => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') ? [p] : []; });
for (const f of walk(join(ROOT, 'js', 'modules'))) for (const h of staticHits(readFileSync(f, 'utf8'), relative(ROOT, f))) fails.push(['STATIC-PRONOUN', h]);

// ---- sampled
const { loadApp, fnv } = await import(pathToFileURL(join(HERE, 'ws-card-rulings.mjs')).href);
const app = await loadApp(ROOT);
const SK = app.data.SKILLS;
const strip = (h) => String(h || '').replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const storyOf = (q) => {
    const parts = [strip(q && q.text)];
    const p = q && q.cell && q.cell.payload;
    if (p) for (const k of ['story', 'text', 'question']) if (typeof p[k] === 'string') parts.push(strip(p[k]));
    return parts.filter(Boolean);
};
let items = 0, skills = 0;
const quiet = {}; for (const k of ['log', 'warn', 'error', 'info']) { quiet[k] = console[k]; console[k] = () => {}; }
try {
    for (const cat of Object.keys(SK)) for (const s of SK[cat] || []) {
        if (!s || !s.v || s.tombstone || s.retired) continue;
        const key = `${cat}:${s.v}`;
        if (only.length && !only.includes(key) && !only.includes(s.v)) continue;
        skills++;
        const seen = new Set();
        for (let i = 0; i < N; i++) {
            let q; try { q = app.gq.generateQuestionFor({ category: cat, skill: s.v, seed: (fnv(key) ^ Math.imul(i + 1, 2654435761)) >>> 0, itemIndex: i % 6 }); } catch (e) { continue; }
            items++;
            for (const t of storyOf(q)) for (const [rule, msg] of judgeStory(t)) {
                const k = `${rule}|${msg}`; if (seen.has(k)) continue; seen.add(k);
                fails.push([rule, `${key}: ${msg} - "${t.slice(0, 110)}"`]);
            }
        }
    }
} finally { for (const k of Object.keys(quiet)) console[k] = quiet[k]; }
for (const r of ['STATIC-PRONOUN', 'PRONOUN-AGREE', 'PRONOUN-ONE', 'UNMAPPED']) { const n = fails.filter((f) => f[0] === r).length; console.log(`${r.padEnd(15)} ${n ? `FAIL ${n}` : 'PASS'}`); }
for (const [r, m] of fails.slice(0, 40)) console.log(`  ${r} ${m}`);
console.log(fails.length ? `${TOOL}: FAIL (${fails.length} finding(s); ${skills} skill(s), ${items} items)` : `${TOOL}: OK (${skills} skill(s), ${items} items; STATIC-PRONOUN, PRONOUN-AGREE, PRONOUN-ONE, UNMAPPED)`);
process.exit(fails.length ? 1 : 0);
