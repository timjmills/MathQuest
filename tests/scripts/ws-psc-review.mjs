#!/usr/bin/env node
// ws-psc-review — the Pre-skill Check + Quick review checks (card design/cards/psc-review/PSC_REVIEW_CARD.md, signed by the
// lead 2026-11-20). Check first: each FAILS on master (no Quick review band yet); next week's build makes them PASS.
//
//   node tests/scripts/ws-psc-review.mjs                       # fixtures: add_facts M / L, div_facts M / L, mult_facts M / L
//   node tests/scripts/ws-psc-review.mjs --skills a:b,c:d --sizes M,L --seed 7
//   node tests/scripts/ws-psc-review.mjs --self-test            # the pure judges on planted plans, no browser
//   node tests/scripts/ws-psc-review.mjs --only PSC-SCORES      # judge only these rules (comma list)
//
// THE CONTRACT the build supplies (what these checks read):
//   plan.meta.review   [{skill: 'cat:id', domain: 'CC'|'OA'|'NBT'|'NF'|'MD-m'|'MD-d'|'G', n}] - the review items, in page order
//   plan.meta.checkFor / the request skill, and plan.meta.prereqs (['cat:id']) - the lesson skill and its prerequisites
//   pupil page: a band whose instruction reads "Quick review. Solve each one." and two scores, "Check __/n" and "Review __/m"
//   key page:   one [data-review-label] per review answer, its text "<Domain> · <skill label>"
//
// PSC-REVIEW-DOMAINS (fixture page with room left under the check):
//   R1 a "Quick review" band exists; R2 its items rotate the grade's allowed domains, none repeated before every allowed domain
//   has appeared (K: no NF; NF from grade 3); R3 no item is the lesson skill or a prerequisite; R4 two builds, same seed, identical.
// PSC-SCORES: S1 "Check __/n" with n = the check items; S2 "Review __/m" with m = the review items (summed over the review
//   bands: page 1 of a two-page check may carry one, lead A24 item 1b); S3 the key labels every review item with its domain and skill.
// PSC-REVIEW-GRADE (lead A24 item 5): every review item's grade lies in the pupil's grade down to two grades below.
// KEYLABEL-CLEAR (lead A24 item 5): on the key, each review label's box does not intersect its cell's ink box (the union of the
//   cell's painted parts, the label and the number tab aside), measured in the DOM.
import { createRequire } from 'module';
import path from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf(`--${k}`); return i > -1 ? argv[i + 1] : d; };

export const DOMAIN_ORDER = ['CC', 'OA', 'NBT', 'NF', 'MD-m', 'MD-d', 'G'];
/** The domains a grade allows (card: K has no Fractions; Fractions from grade 3; Counting & Cardinality is K only in CCSS but the
 *  card lists it for every grade as earlier-grade review). Pure. */
export const allowedDomains = (grade) => { const g = grade === 'K' ? 0 : Number(grade) || 0; return DOMAIN_ORDER.filter((d) => !(d === 'NF' && g < 3)); };
/** R2: the first repeat must come only after every allowed domain has appeared. Returns a reason or null. Pure. */
export function rotationBad(domains, allowed) {
    const seen = new Set();
    for (let i = 0; i < domains.length; i++) {
        const d = domains[i];
        if (!allowed.includes(d)) return `item ${i + 1} domain ${d} is not allowed at this grade`;
        if (seen.has(d) && seen.size < allowed.length) return `item ${i + 1} repeats ${d} before ${allowed.filter((a) => !seen.has(a)).join(', ')} appeared`;
        seen.add(d);
        if (seen.size === allowed.length) seen.clear();
    }
    return null;
}
/** The judges over one built page {plan, pupil, key, again}. Returns [{rule, msg}]. Pure. */
export function judge(b, own, grade) {
    const out = [];
    const F = (rule, msg) => out.push({ rule, msg });
    const rev = (b.plan && b.plan.meta && b.plan.meta.review) || null;
    const items = b.plan && b.plan.meta ? Number(b.plan.meta.items) || 0 : 0;
    if (!/Quick review\. Solve each one\./.test(b.pupil || '') || !Array.isArray(rev) || !rev.length) F('PSC-REVIEW-DOMAINS', 'R1 no "Quick review" band (instruction "Quick review. Solve each one." and plan.meta.review) on a page with room left under the check');
    else {
        const why = rotationBad(rev.map((r) => r.domain), allowedDomains(grade));
        if (why) F('PSC-REVIEW-DOMAINS', `R2 ${why}`);
        const bad = rev.filter((r) => own.includes(r.skill));
        if (bad.length) F('PSC-REVIEW-DOMAINS', `R3 review item(s) from the lesson skill or a prerequisite: ${bad.map((r) => r.skill).join(', ')}`);
    }
    if (b.again !== b.pupil) F('PSC-REVIEW-DOMAINS', 'R4 two builds with the same seed differ');
    const ck = /Check\s*__\s*\/\s*(\d+)/.exec(b.pupil || '');
    if (!ck) F('PSC-SCORES', 'S1 no "Check __/n" score on the page');
    else if (rev && Number(ck[1]) !== items) F('PSC-SCORES', `S1 "Check __/${ck[1]}" but the check has ${items} items`);
    // (lead A24 item 1b: page 1 of a two-page check may carry a review band too - each band scores its own items; they sum to m)
    const rss = [...(b.pupil || '').matchAll(/Review\s*__\s*\/\s*(\d+)/g)].map((x) => Number(x[1]));
    const m = rev ? rev.reduce((t, r) => t + (Number(r.n) || 1), 0) : 0;
    const rsum = rss.reduce((t, x) => t + x, 0);
    if (!rss.length) F('PSC-SCORES', 'S2 no "Review __/m" score on the page');
    else if (rsum !== m) F('PSC-SCORES', `S2 "Review __/${rss.join(' + ')}" but the review has ${m} items`);
    const labels = ((b.key || '').match(/data-review-label[^>]*>[^<]*·[^<]*</g) || []).length;
    if (!rev || labels < rev.length) F('PSC-SCORES', `S3 the key labels ${labels} of ${rev ? rev.length : 0} review answers with "<domain> · <skill>"`);
    return out;
}

/** KEYLABEL-CLEAR (lead A24 item 5, 2026-11-21): on every review answer in the key, the grey "<domain> · <skill>" label box
 *  ([data-review-label]) does not intersect the cell's INK box - the union of the cell's painted parts (text, SVG shapes,
 *  pictures, stroked boxes and answer slots), the label and the number tab aside. `cells` [{n, label: {l,t,r,b}, ink: {l,t,r,b}
 *  | null}] in mm. Returns [{rule, msg}]. Pure. */
export function keyLabelBad(cells, where = '') {
    const out = [];
    for (const c of cells) {
        if (!c.ink || !c.label) continue;
        const dx = Math.min(c.label.r, c.ink.r) - Math.max(c.label.l, c.ink.l);
        const dy = Math.min(c.label.b, c.ink.b) - Math.max(c.label.t, c.ink.t);
        if (process.env.KL_DEBUG) console.log(`   dbg ${c.n} ${c.text} top ${(c.ink.t - (c.cell ? c.cell.t : 0)).toFixed(1)} bot ${((c.cell ? c.cell.b : 0) - c.ink.b).toFixed(1)} lab ${(c.label.b - c.label.t).toFixed(1)}x${(c.label.r - c.label.l).toFixed(1)} cellw ${c.cell ? (c.cell.r - c.cell.l).toFixed(1) : ""} inkw ${(c.ink.r - c.ink.l).toFixed(1)} inkL ${(c.ink.l - (c.cell ? c.cell.l : 0)).toFixed(1)} inkR ${((c.cell ? c.cell.r : 0) - c.ink.r).toFixed(1)} labL ${(c.label.l - (c.cell ? c.cell.l : 0)).toFixed(1)} labT ${(c.label.t - (c.cell ? c.cell.t : 0)).toFixed(1)} cellH ${c.cell ? (c.cell.b - c.cell.t).toFixed(1) : ""}`);
        if (dx > 0.05 && dy > 0.05) out.push({ rule: 'KEYLABEL-CLEAR', msg: `${where}review answer ${c.n}: the key label "${c.text || ''}" overlaps the cell's ink by ${dx.toFixed(1)} x ${dy.toFixed(1)} mm` });
        // (clear space is INSIDE the cell: a label running over the cell's border lands on its neighbour)
        if (c.cell && (c.label.l < c.cell.l - 0.05 || c.label.r > c.cell.r + 0.05 || c.label.t < c.cell.t - 0.05 || c.label.b > c.cell.b + 0.05)) out.push({ rule: 'KEYLABEL-CLEAR', msg: `${where}review answer ${c.n}: the key label "${c.text || ''}" runs outside its cell` });
    }
    return out;
}
/** In the key document: every [data-review-label] with its cell's ink box, in mm (runs in the browser). */
function measureKeyLabels() {
    const mm = 96 / 25.4;
    const box = (r) => ({ l: r.left / mm, t: r.top / mm, r: r.right / mm, b: r.bottom / mm });
    const out = [];
    for (const lab of document.querySelectorAll('[data-review-label]')) {
        const cell = lab.closest('[data-ws-cell]') || lab.closest('.ws-cell') || lab.parentElement;
        let ink = null;
        const add = (q) => { if (!q.width || !q.height) return; ink = ink ? { l: Math.min(ink.l, q.left), t: Math.min(ink.t, q.top), r: Math.max(ink.r, q.right), b: Math.max(ink.b, q.bottom) } : { l: q.left, t: q.top, r: q.right, b: q.bottom }; };
        const skip = (d) => d === lab || lab.contains(d) || d.closest('[data-review-label], [data-ws-label], .ws-letter, .ws-tab');
        for (const d of cell.querySelectorAll('*')) {
            if (skip(d)) continue;
            const st = getComputedStyle(d);
            if (st.display === 'none' || st.visibility === 'hidden' || parseFloat(st.opacity || '1') <= 0.05) continue;
            for (const nd of d.childNodes) if (nd.nodeType === 3 && nd.textContent.trim()) { const rg = document.createRange(); rg.selectNodeContents(nd); for (const q of rg.getClientRects()) add(q); }
            const svg = d.namespaceURI === 'http://www.w3.org/2000/svg';
            const tag = d.tagName.toLowerCase();
            const shape = svg && /^(path|rect|circle|ellipse|line|polyline|polygon|text|use|image)$/.test(tag);
            const pic = !svg && /^(img|canvas|input)$/.test(tag);
            const stroked = !svg && ['Top', 'Right', 'Bottom', 'Left'].some((s2) => parseFloat(st[`border${s2}Width`]) > 0 && st[`border${s2}Style`] !== 'none');
            if (shape || pic || stroked || d.hasAttribute('data-ws-slot')) add(d.getBoundingClientRect());
        }
        out.push({ text: lab.textContent.trim(), label: box(lab.getBoundingClientRect()), cell: box(cell.getBoundingClientRect()), ink: ink ? { l: ink.l / mm, t: ink.t / mm, r: ink.r / mm, b: ink.b / mm } : null });
    }
    return out.map((c, i) => Object.assign(c, { n: i + 1 }));
}

/** PSC-REVIEW-GRADE (lead A24 item 5, 2026-11-21): review items come only from the pupil's grade down to two grades below
 *  (a grade-3 page takes grades 1-3, never K counting). `items` [{skill, grade}], `grade` the pupil's. Returns [{rule, msg}]. Pure. */
export const gradeRank = (g) => (g === 'K' || g === 'k' || g === 0 ? 0 : /^\d$/.test(String(g)) ? Number(g) : null);
export function gradeWindowBad(items, grade, where = '') {
    const own = gradeRank(grade);
    if (own === null) return [];
    return (items || []).filter((x) => { const g = gradeRank(x.grade); return g === null || g < own - 2 || g > own; })
        .map((x) => ({ rule: 'PSC-REVIEW-GRADE', msg: `${where}review item ${x.skill} is grade ${x.grade || '?'}, outside the grade-${grade} window (grades ${Math.max(0, own - 2) || 'K'}-${grade})` }));
}

function selfTest() {
    const ok = { plan: { meta: { items: 12, review: [{ skill: 'placevalue:identify', domain: 'NBT' }, { skill: 'geometry:x', domain: 'G' }] } },
        pupil: 'Quick review. Solve each one. Check __/12 Review __/2', key: '<i data-review-label>Base Ten · Place value<i data-review-label>Geometry · Shapes<', again: null };
    ok.again = ok.pupil;
    const t = [
        ['master-like page: R1 + S1 + S2 + S3 fail', judge({ plan: { meta: { items: 12 } }, pupil: '__/12', key: '', again: '__/12' }, [], 1).map((x) => x.msg.slice(0, 2)).join(), 'R1,S1,S2,S3'],
        ['a good page passes', judge(ok, ['addition:add_facts'], 1).length, 0],
        ['R3 own skill', judge(Object.assign({}, ok, { plan: { meta: { items: 12, review: [{ skill: 'addition:add_facts', domain: 'OA' }] } } }), ['addition:add_facts'], 1).some((x) => /^R3/.test(x.msg)), true],
        ['R4 differ', judge(Object.assign({}, ok, { again: 'x' }), [], 1).some((x) => /^R4/.test(x.msg)), true],
        ['R2 repeat before all', rotationBad(['OA', 'OA'], allowedDomains(1)) !== null, true],
        ['R2 full cycle then repeat OK', rotationBad(allowedDomains(1).concat(['OA']), allowedDomains(1)), null],
        ['R2 NF at K not allowed', /not allowed/.test(rotationBad(['NF'], allowedDomains('K')) || ''), true],
        // (KEYLABEL-CLEAR planted states: the label over the ink's top-right corner FAILS; above it, or beside it, passes)
        ['GRADE K item on a grade-3 page fails', gradeWindowBad([{ skill: 'counting:count_objects', grade: 'K' }], 3).length, 1],
        ['GRADE 1 item on a grade-3 page passes', gradeWindowBad([{ skill: 'addition:add_facts', grade: '1' }], 3).length, 0],
        ['GRADE K item on a grade-2 page passes', gradeWindowBad([{ skill: 'counting:count_objects', grade: 'K' }], 2).length, 0],
        ['GRADE above the pupil fails', gradeWindowBad([{ skill: 'x:y', grade: '4' }], 3).length, 1],
        ['KEYLABEL over the ink fails', keyLabelBad([{ n: 1, label: { l: 30, t: 1, r: 45, b: 4 }, ink: { l: 5, t: 3, r: 40, b: 40 } }]).length, 1],
        ['KEYLABEL above the ink passes', keyLabelBad([{ n: 1, label: { l: 30, t: 1, r: 45, b: 4 }, ink: { l: 5, t: 4.5, r: 40, b: 40 } }]).length, 0],
        ['KEYLABEL outside its cell fails', keyLabelBad([{ n: 1, label: { l: 30, t: 41, r: 52, b: 44 }, ink: { l: 5, t: 3, r: 40, b: 30 }, cell: { l: 0, t: 0, r: 46, b: 46 } }]).length, 1],
        ['KEYLABEL beside the ink passes', keyLabelBad([{ n: 1, label: { l: 41, t: 1, r: 45, b: 4 }, ink: { l: 5, t: 0, r: 40, b: 40 } }]).length, 0],
    ];
    const bad = t.filter(([, got, want]) => got !== want);
    for (const [n, got, want] of bad) console.log(`  FAIL ${n}: got ${got}, want ${want}`);
    console.log(`ws-psc-review self-test: ${bad.length ? `FAIL (${bad.length})` : `OK (${t.length})`}`);
    process.exit(bad.length ? 1 : 0);
}

async function main() {
    const H = require(path.join(__dirname, '..', 'lib', 'ws-harness.cjs'));
    const jobs = arg('skills', null)
        ? arg('skills').split(',').flatMap((k) => arg('sizes', 'M,L').split(',').map((size) => ({ k, size })))
        : [{ k: 'addition:add_facts', size: 'M' }, { k: 'addition:add_facts', size: 'L' }, { k: 'division:div_facts', size: 'M' },
            // (lead A24: the L fact pages the 3-column / side rule filled, and the grade-3 window)
            { k: 'division:div_facts', size: 'L' }, { k: 'multiplication:mult_facts', size: 'M' }, { k: 'multiplication:mult_facts', size: 'L' }];
    // (--only R1,R2: the rules to judge - an older backtest row pins the rules it was written for)
    const only = arg('only', null) ? new Set(arg('only').split(',')) : null;
    const seed = Number(arg('seed', '7'));
    const app = await H.open({ seed: 1 });
    let fails = 0;
    for (const j of jobs) {
        const [categoryId, skillId] = j.k.split(':');
        const b = await app.page.evaluate(async (a) => {
            const req = { role: 'pre-skill-check', sections: [{ skills: [{ categoryId: a.c, skillId: a.s }] }], size: a.size, paper: 'A4', seed: a.seed, key: true };
            const r = await window.buildSheet(req); const r2 = await window.buildSheet(req);
            const meta = r.plan && r.plan.meta ? r.plan.meta : {};
            return { plan: { meta: { items: meta.items, review: meta.review || null, prereqs: meta.prereqs || [] } }, pupil: r.pupilHtml, key: r.keyHtml, again: r2.pupilHtml,
                keyDoc: r.keyHtml ? window.sheetDocument(r.keyHtml, 'key', { paper: 'A4' }) : null,
                reviewGrades: (meta.review || []).map((x) => { const [c2, s2] = x.skill.split(':'); return { skill: x.skill, grade: String((window.getSkillGrade && window.getSkillGrade(s2, c2)) || '') }; }),
                grade: (window.getSkillGrade && window.getSkillGrade(a.s)) || '' };
        }, { c: categoryId, s: skillId, size: j.size, seed });
        const own = [j.k].concat(b.plan.meta.prereqs || []);
        const out = judge(b, own, b.grade);
        out.push(...gradeWindowBad(b.reviewGrades, b.grade));
        // KEYLABEL-CLEAR: the key rendered as printed, every review label against its cell's ink box
        if (b.keyDoc) {
            const kp = await app.browser.newPage();
            try {
                await kp.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                await kp.goto(app.page.url(), { waitUntil: 'domcontentloaded' });
                await kp.setContent(b.keyDoc, { waitUntil: 'networkidle0', timeout: 60000 });
                await kp.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                await kp.emulateMediaType('print');
                out.push(...keyLabelBad(await kp.evaluate(measureKeyLabels), ''));
            } finally { await kp.close(); }
        }
        if (process.env.KL_DEBUG) for (const r of b.plan.meta.review || []) console.log('   meta', r.tag, JSON.stringify(r.label));
        if (only) for (let i = out.length - 1; i >= 0; i--) if (!only.has(out[i].rule)) out.splice(i, 1);
        for (const x of out) console.log(`  FAIL ${x.rule} ${j.k} pre-skill-check ${j.size}: ${x.msg}`);
        fails += out.length;
    }
    await app.close();
    console.log(`ws-psc-review: ${fails ? `FAIL (${fails})` : 'OK'} (${jobs.length} page(s), seed ${seed})`);
    process.exit(fails ? 1 : 0);
}

if (argv.includes('--self-test')) selfTest();
else main().catch((e) => { console.log(`ws-psc-review: FAIL (${String(e && e.message || e).slice(0, 160)})`); process.exit(1); });
