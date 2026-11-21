#!/usr/bin/env node
// ws-psc-review — the Pre-skill Check + Quick review checks (card design/cards/psc-review/PSC_REVIEW_CARD.md, signed by the
// lead 2026-11-20). Check first: each FAILS on master (no Quick review band yet); next week's build makes them PASS.
//
//   node tests/scripts/ws-psc-review.mjs                       # fixtures: add_facts M / L, div_facts M / L, mult_facts M / L, sub_wp_20 L
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
// (lf-roles critic qreview r1, 2026-11-21 - each check first:)
// KEYLABEL-GREY: every [data-review-label] prints in the one grey (its computed colour is the --ws-grey token) and is not a key
//   answer (no [data-ws-key-ans] on it or an ancestor: the key ink's !important rule would paint it orange).
// KEYLABEL-WORDS: a label is ONE line and no word of it spans two line boxes (Range rects; "Operat/ions" in a side column).
// REVIEW-TAG-ID: each label's skill text is the label of THAT category + skill in SKILLS (fractions:identify was tagged
//   "Name the Place", placevalue:identify's label); a short tag is the domain name alone.
// REVIEW-INSTR: a review cell whose response is a choice / check / yes-no / shade / draw / circle slot prints its own verb
//   prompt ([data-review-prompt], a print verb first or a question) - "Quick review. Solve each one." does not say what to do.
// PSC-REVIEW-ORDER: every review item's number is after every check item's number (a review band on page 1 of a two-page
//   check was numbered 9-10 with the check's 11-16 on page 2).
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
    // (the ruled cases, lead A24 item 4 and the card: a page whose room under the check is less than the shortest review cell +
    // the band's strip has no band - `reviewFit` {room, strip, cands: [{h4, h3, h2}]}; a check of more than one strip keeps its
    // per-prerequisite scores, so it prints no "Check __/n")
    const fitR = b.reviewFit || null;
    // (a review row is whole - at least two cells across - so the shortest row is the SECOND-shortest candidate at one column count)
    const shortest = fitR ? Math.min(Infinity, ...['h4', 'h3', 'h2'].map((k) => (fitR.cands || []).map((c) => c[k]).filter((h) => Number.isFinite(h)).sort((a, b) => a - b)[1]).filter((h) => Number.isFinite(h))) + 1 : Infinity;
    const noRoom = !(rev && rev.length) && !!fitR && fitR.room - fitR.strip < shortest;
    const strips = (b.bands || []).filter((x) => !x.shared && x.instr && x.instr !== 'Quick review. Solve each one.').length;
    if (noRoom) return out.concat(b.again !== b.pupil ? [{ rule: 'PSC-REVIEW-DOMAINS', msg: 'R4 two builds with the same seed differ' }] : []);
    if (!/Quick review\. Solve each one\./.test(b.pupil || '') || !Array.isArray(rev) || !rev.length) F('PSC-REVIEW-DOMAINS', `R1 no "Quick review" band (instruction "Quick review. Solve each one." and plan.meta.review) on a page with room left under the check${fitR ? ` (room ${fitR.room} mm, strip ${fitR.strip}, shortest cell ${shortest.toFixed(1)} mm)` : ''}`);
    else {
        const why = rotationBad(rev.map((r) => r.domain), allowedDomains(grade));
        if (why) F('PSC-REVIEW-DOMAINS', `R2 ${why}`);
        const bad = rev.filter((r) => own.includes(r.skill));
        if (bad.length) F('PSC-REVIEW-DOMAINS', `R3 review item(s) from the lesson skill or a prerequisite: ${bad.map((r) => r.skill).join(', ')}`);
    }
    if (b.again !== b.pupil) F('PSC-REVIEW-DOMAINS', 'R4 two builds with the same seed differ');
    const ck = /Check\s*__\s*\/\s*(\d+)/.exec(b.pupil || '');
    if (!ck && strips <= 1) F('PSC-SCORES', 'S1 no "Check __/n" score on the page');
    else if (ck && rev && Number(ck[1]) !== items) F('PSC-SCORES', `S1 "Check __/${ck[1]}" but the check has ${items} items`);
    // (lead A24 item 1b: page 1 of a two-page check may carry a review band too - each band scores its own items; they sum to m)
    const rss = [...(b.pupil || '').matchAll(/Review\s*__\s*\/\s*(\d+)/g)].map((x) => Number(x[1]));
    const m = rev ? rev.reduce((t, r) => t + (Number(r.n) || 1), 0) : 0;
    const rsum = rss.reduce((t, x) => t + x, 0);
    if (!rss.length) F('PSC-SCORES', 'S2 no "Review __/m" score on the page');
    else if (rsum !== m) F('PSC-SCORES', `S2 "Review __/${rss.join(' + ')}" but the review has ${m} items`);
    // (a label too long for its one line prints the domain alone - critic qreview r1, lead A32-2; REVIEW-TAG-ID checks its words)
    const labels = ((b.key || '').match(/data-review-label[^>]*>[^<]+</g) || []).length;
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
        // (KEYLABEL-GREY: the grey token resolved to a colour on a probe; KEYLABEL-WORDS: the label's line boxes and any word
        // whose characters lie on two of them)
        const probe = document.createElement('span');
        probe.style.color = 'var(--ws-grey)';
        lab.parentElement.appendChild(probe);
        const grey = getComputedStyle(probe).color;
        probe.remove();
        const tops = new Set();
        const split = [];
        for (const nd of lab.childNodes) {
            if (nd.nodeType !== 3) continue;
            const txt = nd.textContent;
            const rg = document.createRange();
            rg.selectNodeContents(nd);
            for (const q of rg.getClientRects()) if (q.width > 0.5) tops.add(Math.round(q.top));
            const re = /\S+/g;
            let w;
            while ((w = re.exec(txt))) {
                const wr = document.createRange();
                wr.setStart(nd, w.index); wr.setEnd(nd, w.index + w[0].length);
                const wt = new Set([...wr.getClientRects()].filter((q) => q.width > 0.5).map((q) => Math.round(q.top)));
                if (wt.size > 1) split.push(w[0]);
            }
        }
        out.push({ text: lab.textContent.trim(), label: box(lab.getBoundingClientRect()), cell: box(cell.getBoundingClientRect()), ink: ink ? { l: ink.l / mm, t: ink.t / mm, r: ink.r / mm, b: ink.b / mm } : null,
            color: getComputedStyle(lab).color, grey, keyAns: !!lab.closest('[data-ws-key-ans]'), lines: tops.size, split });
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


export const REVIEW_DOMAIN_NAMES = Object.freeze({ CC: 'Counting', OA: 'Operations', NBT: 'Base Ten', NF: 'Fractions', 'MD-m': 'Measurement', 'MD-d': 'Data', G: 'Geometry' });
/** KEYLABEL-GREY over measured labels [{text, color, grey, keyAns}]. Pure. */
export function keyLabelGreyBad(labels, where = '') {
    const out = [];
    for (const [i, l] of labels.entries()) {
        if (l.keyAns) out.push({ rule: 'KEYLABEL-GREY', msg: `${where}label ${i + 1} "${l.text}" is tagged a key answer ([data-ws-key-ans] on it or an ancestor)` });
        if (l.color !== l.grey) out.push({ rule: 'KEYLABEL-GREY', msg: `${where}label ${i + 1} "${l.text}" prints ${l.color}, not the grey ${l.grey}` });
    }
    return out;
}
/** KEYLABEL-WORDS over measured labels [{text, lines, split: [word]}]. Pure. */
export function keyLabelWordsBad(labels, where = '') {
    const out = [];
    for (const [i, l] of labels.entries()) {
        if (l.lines > 1) out.push({ rule: 'KEYLABEL-WORDS', msg: `${where}label ${i + 1} "${l.text}" prints on ${l.lines} lines (one line only)` });
        for (const w of l.split || []) out.push({ rule: 'KEYLABEL-WORDS', msg: `${where}label ${i + 1}: the word "${w}" breaks across two lines` });
    }
    return out;
}
/** REVIEW-TAG-ID: `review` [{skill, tag}], `labelOf(cat, id)` the SKILLS label, `printed` the labels' texts. Pure. */
export function tagIdBad(review, labelOf, printed = [], where = '') {
    const out = [];
    for (const [i, r] of (review || []).entries()) {
        const [c, id] = String(r.skill || '').split(':');
        const want = String(labelOf(c, id) || '').replace(/\s*\([^)]*\)/g, '').trim();
        const got = String(r.tag || '').split(' · ').slice(1).join(' · ').trim();
        if (got !== want) out.push({ rule: 'REVIEW-TAG-ID', msg: `${where}review item ${i + 1} ${r.skill} is tagged "${got}", its label is "${want}"` });
        const p = printed[i];
        const dom = String(r.tag || '').split(' · ')[0];
        if (p !== undefined && p !== r.tag && p !== dom) out.push({ rule: 'REVIEW-TAG-ID', msg: `${where}review item ${i + 1} prints "${p}", neither its tag "${r.tag}" nor its domain "${dom}"` });
    }
    return out;
}
export const PROMPT_VERBS = ['Look', 'Read', 'Say', 'Count', 'Circle', 'Underline', 'Box', 'Cross out', 'Trace', 'Write', 'Draw', 'Shade', 'Mark', 'Match', 'Measure', 'Use', 'Find', 'Fill in', 'Finish', 'Check', 'Fix', 'Think', 'Start', 'Put', 'Move', 'Add', 'Subtract', 'Multiply', 'Divide', 'Solve', 'Round', 'Compare', 'Estimate', 'Regroup', 'Bring down', 'Cut', 'Sort', 'Glue', 'Color', 'Tap', 'Type', 'Drag'];
// (a prompt names the task: one of its sentences starts with a print verb, or it asks a question - "Odd or even? Check one box.")
const verbPrompt = (t) => { const s = String(t || '').trim(); if (!s) return false; const sent = s.split(/(?<=[.?!])\s+/);
    return sent.some((x) => PROMPT_VERBS.some((v) => x.startsWith(`${v} `) || x.startsWith(`${v}.`)) || /\?$/.test(x)); };
/** REVIEW-INSTR over measured review cells [{n, choice: bool, prompt: string|null}]. Pure. */
export function reviewInstrBad(cells, where = '') {
    return cells.filter((c) => c.choice && !verbPrompt(c.prompt))
        .map((c) => ({ rule: 'REVIEW-INSTR', msg: `${where}review cell ${c.n} answers in a choice / check / shade / circle slot with ${c.prompt ? `the prompt "${c.prompt}" (no verb)` : 'no prompt of its own'}` }));
}
/** PSC-REVIEW-ORDER: check numbers and review numbers, as printed. Pure. */
export function reviewOrderBad(checkNs, reviewNs, where = '') {
    const top = Math.max(0, ...checkNs);
    const early = reviewNs.filter((x) => x <= top);
    return early.length ? [{ rule: 'PSC-REVIEW-ORDER', msg: `${where}review item(s) ${early.join(', ')} are numbered inside the check (its last item is ${top})` }] : [];
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
        ['S1 waived on a multi-strip check', judge(Object.assign({}, ok, { pupil: ok.pupil.replace('Check __/12 ', ''), again: ok.pupil.replace('Check __/12 ', ''), bands: [{ instr: 'Add.' }, { instr: 'Subtract.' }] }), [], 1).length, 0],
        ['S1 kept on a one-strip check', judge(Object.assign({}, ok, { pupil: ok.pupil.replace('Check __/12 ', ''), again: ok.pupil.replace('Check __/12 ', ''), bands: [{ instr: 'Add.' }, { instr: 'Add.', shared: true }] }), [], 1).length, 1],
        ['no room: no band is no fault', judge({ plan: { meta: { items: 8 } }, pupil: '__/8', key: '', again: '__/8', reviewFit: { room: 30, strip: 9, cands: [{ h4: null, h3: 30, h2: 15 }, { h2: 25 }] } }, [], 1).length, 0],
        ['room: no band is a fault', judge({ plan: { meta: { items: 8 } }, pupil: '__/8', key: '', again: '__/8', reviewFit: { room: 60, strip: 9, cands: [{ h4: null, h3: 30, h2: 25 }, { h2: 25 }] } }, [], 1).length > 0, true],
        ['GREY orange label fails', keyLabelGreyBad([{ text: 'a', color: 'rgb(194, 65, 12)', grey: 'rgb(102, 102, 102)', keyAns: true }]).length, 2],
        ['GREY grey label passes', keyLabelGreyBad([{ text: 'a', color: 'rgb(102, 102, 102)', grey: 'rgb(102, 102, 102)', keyAns: false }]).length, 0],
        ['WORDS split word fails', keyLabelWordsBad([{ text: 'Operat ions', lines: 2, split: ['Operations'] }]).length, 2],
        ['WORDS one line passes', keyLabelWordsBad([{ text: 'Base Ten', lines: 1, split: [] }]).length, 0],
        ['TAG-ID wrong category label fails', tagIdBad([{ skill: 'fractions:identify', tag: 'Fractions \u00b7 Name the Place' }], () => 'Identify Fractions').length, 1],
        ['TAG-ID own label passes, short tag printed', tagIdBad([{ skill: 'fractions:identify', tag: 'Fractions \u00b7 Identify Fractions' }], () => 'Identify Fractions (Visual)', ['Fractions']).length, 0],
        ['INSTR yes/no cell with no prompt fails', reviewInstrBad([{ n: 9, choice: true, prompt: null }]).length, 1],
        ['INSTR prompt with a verb passes', reviewInstrBad([{ n: 9, choice: true, prompt: 'Shade 1/3.' }, { n: 10, choice: true, prompt: 'Is it a fact family?' }, { n: 11, choice: false, prompt: null }]).length, 0],
        ['ORDER review inside the check fails', reviewOrderBad([1, 2, 11, 12], [9, 10]).length, 1],
        ['ORDER review after the check passes', reviewOrderBad([1, 2, 3], [4, 5]).length, 0],
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
            { k: 'division:div_facts', size: 'L' }, { k: 'multiplication:mult_facts', size: 'M' }, { k: 'multiplication:mult_facts', size: 'L' },
            // (critic qreview r1 PSC-REVIEW-ORDER: a two-page check whose page 1 takes review rows - lead A24 item 1b)
            { k: 'subtraction:sub_wp_20', size: 'L' }];
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
                bands: (meta.bands || []).map((x) => ({ instr: x.instr, shared: !!x.shared })), reviewFit: meta.reviewFit || null,
                // (REVIEW-TAG-ID: each review skill's own label, from SKILLS by category AND id, cleaned as SKILL_FULL_LABELS cleans it)
                labels: (meta.review || []).concat(((meta.reviewFit || {}).cands || []).filter((x) => x.tag)).map((x) => { const [c2, s2] = x.skill.split(':'); const e = ((window.SKILLS || {})[c2] || []).find((y) => y && y.v === s2);
                    return e ? String(e.l || '').replace(/\s*\(Visual\)\s*$/i, '').replace(/\s*\(No Visuals?\)\s*$/i, '').replace(/^[\u{1F7E2}\u{1F7E1}\u{1F7E0}\u{1F534}\u{1F3B2}\u{1F522}\u{1F967}\u{1F4D0}\u{1F4CA}\u{1F524}\u{1F4CF}\u{1F500}\u{1F3AF}\u{1F52C}\u{1F9EE}\u{1F4CD}\u{1F4C8}\u2B1C\u{1F537}\u00BD]+\s*/u, '') : ''; }),
                reviewGrades: (meta.review || []).map((x) => { const [c2, s2] = x.skill.split(':'); return { skill: x.skill, grade: String((window.getSkillGrade && window.getSkillGrade(s2, c2)) || '') }; }),
                grade: (window.getSkillGrade && window.getSkillGrade(a.s)) || '' };
        }, { c: categoryId, s: skillId, size: j.size, seed });
        const own = [j.k].concat(b.plan.meta.prereqs || []);
        const out = judge(b, own, b.grade);
        out.push(...gradeWindowBad(b.reviewGrades, b.grade));
        const candTags = ((b.reviewFit || {}).cands || []).filter((x) => x.tag);
        const labelBy = new Map((b.plan.meta.review || []).concat(candTags).map((r, i) => [r.skill, b.labels[i]]));
        let printed = [];
        // KEYLABEL-CLEAR: the key rendered as printed, every review label against its cell's ink box
        if (b.keyDoc) {
            const kp = await app.browser.newPage();
            try {
                await kp.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 });
                await kp.goto(app.page.url(), { waitUntil: 'domcontentloaded' });
                await kp.setContent(b.keyDoc, { waitUntil: 'networkidle0', timeout: 60000 });
                await kp.waitForFunction(() => document.documentElement.getAttribute('data-ws-fonts') === 'ready', { timeout: 15000 }).catch(() => {});
                await kp.emulateMediaType('print');
                const kl = await kp.evaluate(measureKeyLabels);
                out.push(...keyLabelBad(kl, ''));
                out.push(...keyLabelGreyBad(kl), ...keyLabelWordsBad(kl));
                printed = kl.map((x) => x.text);
                // (the pupil page: the printed numbers and the review cells' own prompts - read as markup, no layout needed)
                const pp = await app.browser.newPage();
                let cells = [];
                try {
                    await pp.goto(app.page.url(), { waitUntil: 'domcontentloaded' });
                    cells = await pp.evaluate((html) => { const d = new DOMParser().parseFromString(html, 'text/html'); return [...d.querySelectorAll('.ws-cell')].map((cell) => { const tab = cell.querySelector('.ws-tab'); const pr = cell.querySelector('[data-review-prompt]');
                        return { n: tab ? Number(String(tab.textContent).trim()) : NaN, review: !!cell.closest('[data-psc-review]'), prompt: pr ? pr.textContent.trim() : null,
                            choice: !!cell.querySelector('[data-ws-shape="choice"], [data-ws-shape="check"], [data-ws-shape="shade"], [data-ws-shape="draw"], [data-ws-shape="circle"], [data-ws-shape="ring"], [data-ws-shape="mark"], [data-k2-check], .ws-choice') || /\bYes\b[\s\S]*\bNo\b/.test(cell.textContent) }; }).filter((c) => Number.isFinite(c.n)); }, b.pupil);
                } finally { await pp.close(); }
                out.push(...reviewOrderBad(cells.filter((c) => !c.review).map((c) => c.n), cells.filter((c) => c.review).map((c) => c.n)));
                out.push(...reviewInstrBad(cells.filter((c) => c.review)));
            } finally { await kp.close(); }
        }
        out.push(...tagIdBad(b.plan.meta.review, (c, id) => labelBy.get(`${c}:${id}`), printed));
        // (and every candidate the band chose from - meta.reviewFit.cands carries each one's tag)
        out.push(...tagIdBad(candTags, (c, id) => labelBy.get(`${c}:${id}`), [], 'candidate: '));
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
