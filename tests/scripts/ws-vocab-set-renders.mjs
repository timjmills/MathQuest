#!/usr/bin/env node
// ws-vocab-set-renders (lf-vocab r11 item 5; critic r10 speed-up "have the harness render all changed sets every time"):
// every vocabulary lesson set CHANGED since a base commit - its word list, its noPicture, or the meaning / explain /
// notWith of one of its words, or the drawing of one of its words' pictures - is rendered on BOTH picture skills
// (Match 3 pictures, 1 picture, 3 words), independent page at size L, pupil page and key, so the critic never re-renders.
//
//   node tests/scripts/ws-vocab-set-renders.mjs --since 6ae462d1 --out <dir>      # <dir>/set<i>/<skill>/...
//   node tests/scripts/ws-vocab-set-renders.mjs --since 6ae462d1 --list           # the changed sets only
//
// The base tree's js/modules is read from git (git archive into a scratch dir), never checked out. Last line `ws-vocab-set-renders: OK|FAIL`.
import { execFileSync, spawnSync } from 'child_process';
import { mkdtempSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { pathToFileURL } from 'url';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const arg = (k, d = null) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const SINCE = arg('--since', '6ae462d1');
const OUT = arg('--out', null);
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8', maxBuffer: 64 << 20 });
// the base modules, written to a scratch dir with their relative imports intact
const base = mkdtempSync(path.join(tmpdir(), 'mq-vsets-'));
execFileSync('sh', ['-c', `git archive ${SINCE} js/modules | tar -x -C '${base}'`], { cwd: ROOT });
writeFileSync(path.join(base, 'package.json'), '{"type":"module"}');
const imp = (r, rel) => import(pathToFileURL(path.join(r, rel)).href);
const W1 = await imp(ROOT, 'js/modules/sheet/lesson-pages/vocab-words.js');
const P1 = await imp(ROOT, 'js/modules/sheet/graphics/vocab-pictures.js');
let W0 = null, P0 = null;
try { W0 = await imp(base, 'js/modules/sheet/lesson-pages/vocab-words.js'); } catch (e) { console.log(`  (base vocab-words.js unreadable: ${e.message})`); }
try { P0 = await imp(base, 'js/modules/sheet/graphics/vocab-pictures.js'); } catch (e) { console.log(`  (base vocab-pictures.js unreadable: ${e.message})`); }
const svg = (P, id) => { try { return P && P.hasVocabPicture(id) ? P.vocabPictureSVG({}, id, { wMm: 46 }) : ''; } catch (e) { return ''; } };
const wordChanged = (w) => {
    const a = W0 && W0.VOCAB_WORDS[w], b = W1.VOCAB_WORDS[w];
    return !a || JSON.stringify(a) !== JSON.stringify(b) || svg(P0, w) !== svg(P1, w);
};
const changed = [];
W1.VOCAB_SETS.forEach((s, i) => {
    const o = W0 && W0.VOCAB_SETS[i];
    const why = [];
    if (!o || JSON.stringify(o.words) !== JSON.stringify(s.words)) why.push('words');
    if (o && JSON.stringify(o.noPicture || []) !== JSON.stringify(s.noPicture || [])) why.push('noPicture');
    const ws = s.words.filter(wordChanged);
    if (ws.length) why.push(`changed words: ${ws.join(', ')}`);
    if (why.length) changed.push({ i, s, why });
});
console.log(`ws-vocab-set-renders: ${changed.length} of ${W1.VOCAB_SETS.length} sets changed since ${SINCE}`);
for (const c of changed) console.log(`  set ${c.i} ${c.s.title} (grade ${c.s.grade}): ${c.why.join('; ')}`);
if (process.argv.includes('--list') || !OUT) { console.log('ws-vocab-set-renders: OK'); process.exit(0); }
// (r13, critic r11 / r12: the dealt-pairs table) EVERY bank a 1 picture, 3 words item of each set can deal (vocab-words.js
// dealtBanks: the picture plus the other two words of a vetted trio), written to manifest.json so the critic reads them all
// (r14, critic r13 speed-up: a column of the numbers each picture marks and their places, so number readings show without
// opening the picture) marked: the numbers in a heavy box or a ring, read from the drawing; parity / place / run: the
// reader's features (vocabReadFeatures) for them
const marksOf = (id) => {
    const body = svg(P1, id);
    if (!body) return null;
    const texts = [...body.matchAll(/<text([^>]*)>([^<]*)<\/text>/g)].map((m) => ({ x: Number((m[1].match(/ x="([^"]*)"/) || [])[1]), y: Number((m[1].match(/ y="([^"]*)"/) || [])[1]), t: m[2].trim() }));
    const marked = [];
    for (const [, a] of body.matchAll(/<rect([^>]*)\/>/g)) {
        const g = (k) => Number((a.match(new RegExp(` ${k}="([^"]*)"`)) || [])[1]);
        if (!(g('stroke-width') >= 2) || !/fill="none"/.test(a)) continue;
        const inn = texts.filter((t) => t.x > g('x') && t.x < g('x') + g('width') && t.y > g('y') && t.y < g('y') + g('height'));
        marked.push(...inn.filter((t) => /^\d+$/.test(t.t)).map((t) => `${t.t} (box${inn.length > 1 ? ` of ${inn.length}` : ''})`));
    }
    for (const [, a] of body.matchAll(/<circle([^>]*)\/>/g)) {
        if (!/fill="none"/.test(a)) continue;
        const g = (k) => Number((a.match(new RegExp(` ${k}="([^"]*)"`)) || [])[1]);
        const inn = texts.filter((t) => Math.hypot(t.x - g('cx'), t.y - g('cy')) < g('r'));
        if (inn.length === 1 && /^\d+$/.test(inn[0].t)) marked.push(`${inn[0].t} (ring)`);
    }
    const f = P1.vocabReadFeatures(body);
    return { marked, parity: f.filter((x) => /^(marked|all)-/.test(x)), place: f.filter((x) => x.startsWith('place:')).map((x) => x.slice(6)),
        run: f.filter((x) => /-run$|^step:/.test(x)) };
};
const dealt = W1.VOCAB_SETS.map((s, i) => ({ set: i, title: s.title, grade: s.grade, words: s.words.slice(), noPicture: (s.noPicture || []).slice(),
    trios: typeof W1.vettedTrios === 'function' ? W1.vettedTrios(s) : [],
    pictureMarks: Object.fromEntries(s.words.map((w) => [w, marksOf(w)])),
    banks: typeof W1.dealtBanks === 'function' ? W1.dealtBanks(s).map((b) => ({ picture: b.picture, bank: b.bank, marks: marksOf(b.picture) })) : [] }));
execFileSync('mkdir', ['-p', OUT]);
writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify({ since: SINCE, changed: changed.map((c) => ({ set: c.i, title: c.s.title, why: c.why })), dealtBanks: dealt }, null, 1));
console.log(`  dealt-pairs table: ${dealt.reduce((n, d) => n + d.banks.length, 0)} banks over ${dealt.length} sets -> ${path.join(OUT, 'manifest.json')}`);
let bad = 0;
for (const c of changed) {
    for (const skill of ['vocab_grade_pictures', 'vocab_pick3_words']) {
        const out = path.join(OUT, `set${c.i}`);
        const r = spawnSync('node', [path.join(ROOT, 'tests/scripts/ws-grade-render.cjs'), '--skills', `vocabulary:${skill}`, '--roles', 'independent',
            '--size', 'L', '--opts', JSON.stringify({ vocabSet: c.i }), '--no-screen', '--out', out], { cwd: ROOT, encoding: 'utf8', timeout: 600000 });
        const pngs = existsSync(path.join(out, `vocabulary__${skill}`)) ? readdirSync(path.join(out, `vocabulary__${skill}`)).filter((f) => f.endsWith('.png')) : [];
        const ok = r.status === 0 && pngs.length >= 2;
        if (!ok) bad++;
        console.log(`  set ${c.i} ${skill}: ${ok ? 'OK' : 'FAIL'} (${pngs.length} png) ${path.join(out, `vocabulary__${skill}`)}`);
        if (!ok) console.log(String(r.stdout || '').split('\n').slice(-4).join('\n') + String(r.stderr || '').slice(-400));
    }
}
console.log(`ws-vocab-set-renders: ${bad ? 'FAIL' : 'OK'}`);
process.exit(bad ? 1 : 0);
