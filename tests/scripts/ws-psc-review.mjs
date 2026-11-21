#!/usr/bin/env node
// ws-psc-review — the Pre-skill Check + Quick review checks (card design/cards/psc-review/PSC_REVIEW_CARD.md, signed by the
// lead 2026-11-20). Check first: both FAIL on master (no Quick review band yet); next week's build makes them PASS.
//
//   node tests/scripts/ws-psc-review.mjs                       # fixtures: add_facts M / L, div_facts M (the half-empty pages)
//   node tests/scripts/ws-psc-review.mjs --skills a:b,c:d --sizes M,L --seed 7
//   node tests/scripts/ws-psc-review.mjs --self-test            # the pure judges on planted plans, no browser
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
// PSC-SCORES: S1 "Check __/n" with n = the check items; S2 "Review __/m" with m = the review items; S3 the key labels every
//   review item with its domain and skill.
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
        : [{ k: 'addition:add_facts', size: 'M' }, { k: 'addition:add_facts', size: 'L' }, { k: 'division:div_facts', size: 'M' }];
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
                grade: (window.getSkillGrade && window.getSkillGrade(a.s)) || '' };
        }, { c: categoryId, s: skillId, size: j.size, seed });
        const own = [j.k].concat(b.plan.meta.prereqs || []);
        const out = judge(b, own, b.grade);
        for (const x of out) console.log(`  FAIL ${x.rule} ${j.k} pre-skill-check ${j.size}: ${x.msg}`);
        fails += out.length;
    }
    await app.close();
    console.log(`ws-psc-review: ${fails ? `FAIL (${fails})` : 'OK'} (${jobs.length} page(s), seed ${seed})`);
    process.exit(fails ? 1 : 0);
}

if (argv.includes('--self-test')) selfTest();
else main().catch((e) => { console.log(`ws-psc-review: FAIL (${String(e && e.message || e).slice(0, 160)})`); process.exit(1); });
