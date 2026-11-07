'use strict';
// ws-lesson-lp — the lesson precritic checks of design/LESSONS_FIRST_PLAN.md §6.3 that read a built detailed lesson pack
// (lane lf-checks, 2026-11-07). Run by `ws-detailed-lesson --lp` (one pack, rendered) and `ws-detailed-lesson --sweep`
// (seeds 1-25, built HTML only, no layout). Everything here is PURE except lpMeasure (it runs in the page) and lpRaster
// (it shells out to PyMuPDF), so the checks run the same on a live render and on a saved packet (--packet <json>).
//
//   LP-FAMILY-REPEAT  E24 keyed on the unordered × / ÷ family {a, b, a·b} (6×4, 24÷6, 24÷4 are one key; spaced-retrieval
//                     facts on a teacher page join the pool) plus the story frame (total + object: "20 marbles"). Any
//                     family or frame on two places of the pack fails (lesson 7 critic r1 D2).
//   LP-TEXT           what a teacher page names resolves to the pupil pages: (a) every page code it names (P0 … P6, P4-1 …)
//                     is a page of the pack; (b) a "no X this time / here / on this page" script line fails when the page it
//                     names prints X (lesson 7 r1 D3); (c) a Check Question writes its choices A, B, C, D … as many as the
//                     word it uses ("Write four answers"), each different; (d) "the Steps are at the top of the page" names
//                     a page that prints a Steps band (lesson 2 r3 D2).
//   LP-GIVEAWAY       no Say band, Steps band or hint on a pupil page holds the key answer of an item on that page, unless
//                     the item prints that value itself (lesson 4 r1 D1, D2); a page with Guided and Independent bands
//                     gives Guided a hint (trace / grey ink) that Independent does not have (lesson 4 r1 D6).
//   LP-MODELLED       every task kind (pool `rep`, and `sit` where the lesson declares situations) dealt on Practice or the
//                     exit slip is on a modelled page before it (anchor chart P2*, the board rows of T4, or Guided P3*)
//                     (lesson 2 r1 D3, lesson 1 r1 D1).
//   LP-NUMBERS        teacher pages: no bare number of 4+ digits without its comma ("4000"; footer seed and © year
//                     excepted); pupil pages: no two near-look numbers on one page (same digit count >= 4, same first two
//                     digits, the rest different: 92,163 / 92,715) (lesson 6 critic r3 n1, n2).
//   LP-FALLBACK       no anchor-chart drawing (`.mq-cdraw`) at zoom < 1 (chartPage's silent fallback, lesson 7 r1 D1); read
//                     from the role's `sizing.mode` when the build reports it, else from the DOM.
//   LP-PREREQ         the Prerequisite Check (P0): each cell has as many answer slots as its key has answers (one slot per
//                     key answer), no scaffold (trace, grey ink, Steps band, Say band) on a check cell (phase 0 r1 D1, D8).
//   LP-MEASURE        every rendered page measured, never the planner's numbers: text >= 8 pt everywhere, every answer slot
//                     >= 8 x 8 mm, and the body's blank foot <= 8 % (H13 at page level) on pupil pages and keys.
//   LP-RASTER         the PDF rasterised at 72 and 93 dpi: every stroked rule (panel rules, the We Do grid, chart icons)
//                     leaves ink at >= 60 % of its sample points (L20: pdfium dropped 3 of 10 rules).
// Each check returns {id, pass, msg, detail[]}.

const LP_IDS = ['LP-FAMILY-REPEAT', 'LP-TEXT', 'LP-GIVEAWAY', 'LP-MODELLED', 'LP-NUMBERS', 'LP-FALLBACK', 'LP-PREREQ', 'LP-MEASURE', 'LP-RASTER'];

/* ------------------------------------------------------------------ in the page */
// Serialisable (no closure): page.evaluate(lpMeasure, {layout}). With layout false (the sweep, a detached document) the
// geometric fields are left out.
function lpMeasure(opt) {
    const layout = !opt || opt.layout !== false;
    const MM = 96 / 25.4, PT = 96 / 72;
    const root = (opt && opt.doc) || document;
    const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
    const grey = (el) => { if (!layout) return /#949494|148,\s*148,\s*148/i.test(el.getAttribute('style') || ''); const c = getComputedStyle(el).color; return /148,\s*148,\s*148/.test(c); };
    const pages = [...root.querySelectorAll('section.ws-page')].filter((pg) => !pg.parentElement || !pg.parentElement.closest('section.ws-page, .dl-thumb'));
    const out = { pages: [] };
    for (const pg of pages) {
        const id = pg.dataset.dlPage || '?', kind = pg.dataset.dlKind || 'pupil';
        const P = { id, kind };
        const body = pg.querySelector(':scope > .ws-body') || pg;
        // visible text without the thumbnails, title, footer
        const tw = (root.createTreeWalker ? root : document).createTreeWalker(body, 4 /* SHOW_TEXT */); const parts = []; let t;
        while ((t = tw.nextNode())) { if (t.parentElement.closest('.dl-thumb, .ws-foot, .ws-copy, style, script')) continue; const v = t.textContent.trim(); if (v) parts.push(v); }
        P.text = parts.join(' | ');
        P.say = [...body.querySelectorAll('.ws-band--say')].filter((e) => !e.closest('.dl-thumb')).map((e) => { const c = e.cloneNode(true); c.querySelectorAll('.ws-line, [data-ws-key-ans], [data-ws-slot]').forEach((x) => x.remove()); return norm(c.textContent); });
        P.steps = [...body.querySelectorAll('[data-mq-lesson-strip]')].filter((e) => !e.closest('.dl-thumb')).map((e) => norm(e.textContent));
        P.bandLabels = [...body.querySelectorAll('.ws-strip > b')].filter((b) => !b.closest('.dl-thumb')).map((b) => norm(b.textContent));
        // bands in order, each with its top-level cells
        const cellsOf = (scope) => [...scope.querySelectorAll('.ws-cell')].filter((c) => !c.closest('.dl-thumb') && !c.parentElement.closest('.ws-cell'));
        const cellInfo = (c) => {
            const lab = c.querySelector('[data-ws-label], .ws-letter');
            const slots = [...c.querySelectorAll('[data-ws-slot]')].filter((e) => !e.closest('.ws-band--say') && !e.closest('[data-work]') && e.getAttribute('data-ws-graded') !== '0');
            const keyAns = [...c.querySelectorAll('[data-ws-key-ans]')].filter((e) => !e.parentElement.closest('[data-ws-key-ans]')).map((e) => norm(e.textContent)).filter(Boolean);
            // (on a key page) a writing slot the key leaves empty: the pupil has two places to write and the key fills one
            // (phase 0 r1 D1); a choice group (rings, ticks) counts once, filled when one choice is marked
            const all = [...c.querySelectorAll('[data-ws-slot]')].filter((e) => !e.closest('.ws-band--say') && !e.closest('[data-work]'));
            const writing = all.filter((e) => !/^(choice|tick)/.test(e.getAttribute('data-ws-slot') || '') && !/ring|tick/.test(e.getAttribute('data-ws-shape') || '') && !e.parentElement.closest('[data-ws-slot]'));
            const filled = (e) => e.hasAttribute('data-ws-key-ans') || !!e.querySelector('[data-ws-key-ans]') || !!norm(e.textContent);
            const keyEmpty = writing.filter((e) => !filled(e)).length;
            const cl = c.cloneNode(true); cl.querySelectorAll('[data-ws-key-ans], [data-ws-label], .ws-letter').forEach((x) => x.remove());
            const traces = c.querySelectorAll('.ws-trace, [data-ws-trace], .ws-ghost').length;
            const greyInk = [...c.querySelectorAll('*')].filter((e) => !e.closest('[data-ws-label], .ws-letter, [data-ws-key-ans]') && e.childNodes.length && [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && grey(e)).length;
            const o = { letter: lab ? norm(lab.textContent).replace(/\.$/, '') : '', text: norm(cl.textContent), slots: slots.length, writing: writing.length, keyEmpty, keyAns, traces, greyInk,
                level: Number(c.getAttribute('data-ws-level') || c.querySelector('[data-ws-level]')?.getAttribute('data-ws-level') || 0),
                say: c.querySelectorAll('.ws-band--say').length, steps: c.querySelectorAll('[data-mq-lesson-strip]').length };
            if (layout) o.slotMm = slots.filter((e) => /^(box|line|open)$/.test(e.getAttribute('data-ws-shape') || 'box')).map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.width / MM * 10) / 10, Math.round(r.height / MM * 10) / 10]; });
            return o;
        };
        P.bands = [...body.querySelectorAll('.ws-band')].filter((b) => !b.closest('.dl-thumb') && !b.parentElement.closest('.ws-band')).map((b) => ({ label: norm((b.querySelector(':scope > .ws-strip > b') || {}).textContent || ''), cells: cellsOf(b).map(cellInfo) }));
        P.cells = cellsOf(body).map(cellInfo);
        // the chart's sizing mode as the DOM shows it (until the role reports sizing.mode): the other examples drawn whole
        // in their own grid = 'final' (floor 0.85), sharing the 3-column grid = 'grid3' (floor 0.8), neither = 'one' / 'row' (1)
        P.chartMode = pg.querySelector('.mq-cfinalgrid') ? 'final' : pg.querySelector('.mq-cfinal') ? 'grid3' : pg.querySelector('.mq-cdraw') ? 'one' : null;
        P.zooms = [...pg.querySelectorAll('.mq-cdraw')].map((e) => parseFloat((e.getAttribute('style') || '').match(/zoom:\s*([\d.]+)/)?.[1] || '1'));
        if (layout) {
            let minPt = 99, minWhere = ''; const w2 = document.createTreeWalker(pg, 4); let n;
            while ((n = w2.nextNode())) { if (!n.textContent.trim() || n.parentElement.closest('.dl-thumb, style, script, [data-ws-label], .ws-letter, .ws-foot, .ws-copy, .ws-tabbox')) continue; const el = n.parentElement, cs = getComputedStyle(el); if (cs.display === 'none' || cs.visibility === 'hidden') continue;
                let z = 1; for (let a = el; a && a !== pg; a = a.parentElement) { const zz = parseFloat(getComputedStyle(a).zoom || '1'); if (zz && zz !== 1) z *= zz; }
                const svg = el.closest('svg'); const scale = svg && el instanceof SVGElement && el.getScreenCTM() ? el.getScreenCTM().a : 1;
                const v = parseFloat(cs.fontSize) * scale / PT; if (v < minPt) { minPt = v; minWhere = n.textContent.trim().slice(0, 30); } }
            P.minPt = Math.round(minPt * 100) / 100; P.minWhere = minWhere;
            const b = body.getBoundingClientRect(); let last = b.top;
            for (const e of body.querySelectorAll('*')) { const r = e.getBoundingClientRect(); if (r.height > 0 && r.width > 0 && getComputedStyle(e).visibility !== 'hidden' && r.bottom <= b.bottom + 2) last = Math.max(last, r.bottom); }
            P.footMm = Math.round((b.bottom - last) / MM * 10) / 10; P.bodyMm = Math.round(b.height / MM * 10) / 10;
        }
        out.pages.push(P);
    }
    const pj = root.getElementById ? root.getElementById('v21-pool') : root.querySelector('#v21-pool'); out.pool = pj ? JSON.parse(pj.textContent) : null;
    return out;
}

/* ------------------------------------------------------------------ helpers (pure) */
const canonOp = (s) => String(s || '').replace(/\s+/g, '').replace(/[x*]/g, '×').replace(/[/]/g, '÷');
/** The unordered × / ÷ family of an item ("6×4", "24÷6") as "4,6,24", or null. */
function family(item) {
    const m = canonOp(item).match(/^(\d+)([×÷])(\d+)$/); if (!m) return null;
    const a = +m[1], b = +m[3];
    if (m[2] === '×') { const [x, y] = [a, b].sort((p, q) => p - q); return `${x},${y},${a * b}`; }
    if (!b || a % b) return null;
    const [x, y] = [b, a / b].sort((p, q) => p - q); return `${x},${y},${a}`;
}
const sing = (w) => String(w).replace(/ies$/, 'y').replace(/(ch|sh|x|ss)es$/, '$1').replace(/([^s])s$/, '$1');
/** Story frames of a text: "Ravi has 20 marbles" -> "20 marble" (total + object, singular). */
function frames(text) {
    const out = new Set();
    for (const m of String(text).matchAll(/\b(?:has|have|had|buys|bakes|makes|picks|collects|gets|finds|sees|sells|packs|puts|takes) (\d+) ([a-z]+)/g)) {
        const noun = sing(m[2]);
        if (['more', 'fewer', 'less', 'each', 'groups', 'group', 'equal', 'of'].includes(m[2])) continue;
        out.add(`${m[1]} ${noun}`);
    }
    return [...out];
}
const pupilPages = (pk) => pk.pages.filter((p) => p.kind === 'pupil');
const teacherPages = (pk) => pk.pages.filter((p) => p.kind === 'teacher');
const keyOf = (pk, id) => pk.pages.find((p) => p.id === `${id}-key`);
const digits = (s) => String(s).replace(/[^0-9]/g, '');
const PAGE_RE = /\bP[0-6](?:[a-z]|-\d)?(?:-key)?\b/g;
/** A section of a teacher page's text names the page it is about: the last page code before position i. */
function pageBefore(text, i, ids) {
    let best = null;
    for (const m of String(text).slice(0, i).matchAll(/\b(P[0-6](?:[a-z]|-\d)?)\b|\b(Word problem|Exit slip|Practice [12]|Anchor chart(?: \d)?|Prerequisite Check|Number sense)\b/g)) best = m;
    if (!best) return null;
    if (best[1]) return ids.includes(best[1]) ? best[1] : null;
    const w = best[2];
    const map = { 'Word problem': 'P5', 'Exit slip': 'P6', 'Practice 1': 'P4-1', 'Practice 2': 'P4-2', 'Prerequisite Check': 'P0', 'Number sense': 'P1', 'Anchor chart': 'P2', 'Anchor chart 1': 'P2', 'Anchor chart 2': 'P2b' };
    return ids.includes(map[w]) ? map[w] : null;
}

/* ------------------------------------------------------------------ the checks (pure) */
function familyRepeat(pk) {
    const places = ((pk.pool && pk.pool.places) || []).filter((x) => !x.copy);
    const seen = new Map(); const probs = [];
    const note = (key, where) => { if (!seen.has(key)) seen.set(key, []); seen.get(key).push(where); };
    for (const x of places) { const f = family(x.item); if (f) note(`family {${f}}`, `${x.page} ${canonOp(x.item)}`); }
    // spaced retrieval on a teacher page joins the pool
    for (const t of teacherPages(pk)) {
        for (const m of String(t.text).matchAll(/[Ss]paced retrieval([\s\S]{0,700})/g)) {
            const seg = m[1].split(/\bChaining bridge\b|\bSection \d|\bI Do\b/)[0];
            for (const f of seg.matchAll(/(\d+) ?([×÷x]) ?(\d+)(?! ?[×÷x])/g)) { const k = family(`${f[1]}${f[2]}${f[3]}`); if (k) note(`family {${k}}`, `${t.id} retrieval ${f[1]}${canonOp(f[2])}${f[3]}`); }
        }
    }
    const fam = [...seen.entries()].filter(([, w]) => new Set(w).size > 1);
    // story frames: once per pupil page (the 2-up exit slip prints each story twice)
    const fr = new Map();
    for (const p of pupilPages(pk)) for (const f of new Set(p.cells.flatMap((c) => frames(c.text)))) { if (!fr.has(f)) fr.set(f, []); fr.get(f).push(p.id); }
    const frRep = [...fr.entries()].filter(([, w]) => w.length > 1);
    for (const [k, w] of fam) probs.push(`${k}: ${[...new Set(w)].join(' / ')}`);
    for (const [k, w] of frRep) probs.push(`frame "${k}": ${w.join(' / ')}`);
    const nf = [...seen.keys()].length;
    return { id: 'LP-FAMILY-REPEAT', pass: !probs.length, msg: probs.length ? probs.slice(0, 8).join('; ') : `${nf} × / ÷ families, ${fr.size} story frames: each on one place`, detail: probs };
}

function textCheck(pk) {
    const ids = pk.pages.map((p) => p.id); const probs = []; let n = 0;
    for (const t of teacherPages(pk)) {
        const text = String(t.text);
        // (a) page codes
        for (const m of text.matchAll(PAGE_RE)) { n++; if (!ids.includes(m[0]) && !ids.some((x) => x.startsWith(`${m[0]}-`))) probs.push(`${t.id} names ${m[0]}, not a page of the pack`); }
        // (b) "no X this time"
        for (const m of text.matchAll(/\b[Nn]o ([a-z]+)(?: ([a-z]+))? (?:this time|here|on this page|today)\b/g)) {
            n++;
            const pid = pageBefore(text, m.index, ids); if (!pid) { probs.push(`${t.id} "${m[0]}": names no page`); continue; }
            const p = pk.pages.find((x) => x.id === pid);
            const stem = sing(m[1]);
            const re = new RegExp(`\\b${stem}(?:e?s)?\\b`, 'i');
            const where = [...p.bandLabels, ...p.cells.map((c) => c.text), ...p.steps, p.text].find((s) => re.test(s));
            if (where) probs.push(`${t.id} says "${m[0]}" but ${pid} prints "${String(where).match(re)[0]}"`);
        }
        // (c) Check Question choices
        for (const m of text.matchAll(/Write (two|three|four|five) answers\.?([\s\S]{0,160})/g)) {
            n++;
            const want = { two: 2, three: 3, four: 4, five: 5 }[m[1]];
            const ch = [];
            for (const x of m[2].matchAll(/\b([A-E]): ?([^·.⏎|]+?)(?= ·|\.|$|\|)/g)) { if (x[1] !== 'ABCDE'[ch.length]) break; ch.push([x[1], x[2].trim()]); }
            const letters = ch.map((x) => x[0]).join('');
            if (ch.length !== want || letters !== 'ABCDE'.slice(0, want)) probs.push(`${t.id} Check Question: "${m[1]} answers" but ${ch.length} written (${letters || 'none'})`);
            else if (new Set(ch.map((x) => x[1])).size !== want) probs.push(`${t.id} Check Question: two choices the same (${ch.map((x) => x.join(' ')).join(', ')})`);
        }
        // (d) "the Steps are at the top of the page"
        for (const m of text.matchAll(/[Tt]he Steps are at the top of the page/g)) {
            n++; const pid = pageBefore(text, m.index, ids); const p = pk.pages.find((x) => x.id === pid);
            if (!p || !p.steps.length) probs.push(`${t.id} "${m[0]}" over ${pid || 'no page'}, which prints no Steps band`);
        }
    }
    return { id: 'LP-TEXT', pass: !probs.length, msg: probs.length ? probs.slice(0, 6).join('; ') : `${n} names (pages, "no X" lines, Check Questions, Steps), all on their pages`, detail: probs };
}

function giveaway(pk) {
    const probs = []; let n = 0;
    const has = (text, v) => { const d = digits(v); if (!d || d.length < 1) return false; const raw = String(v).trim();
        return new RegExp(`(^|[^0-9,])${raw.replace(/[.*+?^$()|[\]\\]/g, '\\$&')}([^0-9,]|$)`).test(text); };
    for (const p of pupilPages(pk)) {
        const k = keyOf(pk, p.id) || { cells: [] };
        // (a Steps band's numbers are step numbers: "Steps:1Write the hundreds." - and a one-digit answer is too common a
        // number to be read as the item's; the class is a band that prints the item's worked RESULT: 28, 44)
        const unstep = (s) => String(s).replace(/Steps?:?\s*/g, ' ').replace(/(^|\s|\.)\d(?=[A-Z])/g, '$1 ').replace(/Step \d/g, ' ');
        const helps = [...p.say.map((s) => ['Say', unstep(s)]), ...p.steps.map((s) => ['Steps', unstep(s)])];
        for (const [i, kc] of k.cells.entries()) {
            const pc = p.cells[i]; if (!pc) continue;
            for (const a of kc.keyAns) {
                if (digits(a).length < 2) continue;
                n++;
                if (has(pc.text, a)) continue; // the item prints the value itself (a given)
                for (const [what, s] of helps) if (has(s, a)) probs.push(`${p.id} ${what} band "${s.slice(0, 50)}" holds item ${kc.letter || i + 1}'s answer ${a}`);
            }
        }
        // Guided vs Independent
        const g = p.bands.filter((b) => /^Guided/i.test(b.label)), ind = p.bands.filter((b) => /^Independent/i.test(b.label));
        if (g.length && ind.length) {
            const hint = (c) => c.traces + c.greyInk + c.level;
            const gH = Math.max(0, ...g.flatMap((b) => b.cells.map(hint))), iH = Math.max(0, ...ind.flatMap((b) => b.cells.map(hint)));
            n++;
            const gT = g.flatMap((b) => b.cells).some((c) => c.traces > 0), iT = ind.flatMap((b) => b.cells).some((c) => c.traces > 0);
            if (gH === 0) probs.push(`${p.id}: Guided cells carry no hint (trace / grey ink), so Guided = Independent`);
            else if (!gT && iH >= gH) probs.push(`${p.id}: Independent carries as much hint as Guided (${iH} vs ${gH}) and Guided traces nothing`);
            else if (gT && iT) probs.push(`${p.id}: Independent cells keep the Guided trace (nothing fades)`);
        }
    }
    return { id: 'LP-GIVEAWAY', pass: !probs.length, msg: probs.length ? probs.slice(0, 6).join('; ') : `${n} key answers and Guided/Independent pairs: nothing given away`, detail: probs };
}

/** A story's situation from its words: the features groups / share / add / take / together / compare, joined. Pure. */
function situation(story) {
    const t = String(story), f = [];
    if (/\b[Ee]ach [a-z]+ (?:has|holds|gets)\b \d|\b(?:groups|rows|bags|boxes) of \d/.test(t) && !/\bshares?\b/.test(t)) f.push('groups');
    if (/\bshares?\b|\bequally\b/.test(t)) f.push('share');
    if (/\bgets? \d+ more\b|\bbuys? \d+ more\b|\bfinds? \d+ more\b|\b\d+ more come\b/.test(t)) f.push('add');
    if (/\bgives? away\b|\beats?\b|\bloses?\b|\bflies away\b|\bleft\?/.test(t)) f.push('take');
    if (/\bin all\b|\baltogether\b|\bin total\b/.test(t)) f.push('together');
    if (/\bhow many (?:more|fewer)\b|\bmore than\b|\bfewer than\b/i.test(t)) f.push('compare');
    return f.join('+');
}
const STORY_RE = /\b[A-Z][a-z]+ has \d+ [a-z]+\.[^?]{0,200}\?/g;
function modelled(pk) {
    const places = ((pk.pool && pk.pool.places) || []).filter((x) => !x.copy);
    // modelled = I Do: the anchor chart(s) P2, P2b (and the board rows of T4); practised = Practice (not the Mixed review,
    // which revisits earlier skills by design), the word problem and the exit slip
    const isModel = (pg) => /^P2[a-z]?$/.test(pg);
    const isPractice = (pg) => /^P4-\d|^P5$|^P6$/.test(pg);
    const skill = (rep) => String(rep).split(':')[0];
    const probs = [], warn = [];
    const modelReps = new Set(places.filter((x) => isModel(x.page)).map((x) => x.rep));
    const modelSkills = new Set([...modelReps].map(skill));
    const checked = new Set();
    for (const x of places.filter((y) => isPractice(y.page) && y.rep && y.rep !== 'story')) {
        checked.add(x.rep);
        if (!modelSkills.has(skill(x.rep))) probs.push(`${x.page} deals ${x.rep} (${x.item}): no anchor chart models ${skill(x.rep)}`);
        else if (!modelReps.has(x.rep)) warn.push(`${x.page} ${x.rep}`);
    }
    // situations (stories): only where the anchor chart itself tells a story
    const storiesOf = (text) => [...String(text).matchAll(STORY_RE)].map((m) => m[0]);
    const pages = (re) => pk.pages.filter((p) => p.kind === 'pupil' && re.test(p.id));
    const modelSits = new Set(pages(/^P2[a-z]?$/).flatMap((p) => p.cells.flatMap((c) => storiesOf(c.text))).map(situation).filter(Boolean));
    let sits = 0;
    if (modelSits.size) {
        for (const t of teacherPages(pk).filter((p) => /^T4/.test(p.id))) for (const st of storiesOf(t.text)) { const k = situation(st); if (k) modelSits.add(k); }
        for (const p of pages(/^P4-\d|^P5$|^P6$/)) for (const c of p.cells) for (const st of storiesOf(c.text)) {
            const k = situation(st); if (!k) continue; sits++;
            if (!modelSits.has(k)) probs.push(`${p.id} story "${st.slice(0, 60)}…" is ${k}, never modelled (I Do models ${[...modelSits].join(', ')})`);
        }
    }
    const u = [...new Set(probs)];
    const w = [...new Set(warn)];
    return { id: 'LP-MODELLED', pass: !u.length, msg: u.length ? u.slice(0, 6).join('; ') : `${checked.size} task kinds and ${sits} stories dealt on Practice / exit, each modelled on the anchor chart first${modelSits.size ? ` (situations ${[...modelSits].join(', ')})` : ''}${w.length ? `; note, task variants of a modelled skill not on the chart: ${w.slice(0, 4).join(', ')}` : ''}`, detail: u };
}

function numbers(pk) {
    const probs = [];
    for (const t of teacherPages(pk)) {
        const text = String(t.text).replace(/seed \d+/g, '').replace(/© ?20\d\d/g, '').replace(/\b20\d\d-\d\d-\d\d\b/g, '');
        for (const m of text.matchAll(/(?<![\d,.:/\-])(\d{4,})(?![\d,])/g)) {
            // a wrong answer quoted on purpose ("80039 for 839") and digits written into a place-value chart ("Write 1000 on
            // the board under Th H T O") are bare by design
            const after = text.slice(m.index + m[1].length, m.index + m[1].length + 60);
            if (/^ for /.test(after) || /\b(?:Th )?H T O\b/.test(after.split(/[.|]/)[0])) continue; if (/^20[2-3]\d$/.test(m[1]) && /\b(19|20)\d\d\b/.test(m[1]) && /year|©/i.test(text.slice(Math.max(0, m.index - 12), m.index))) continue; probs.push(`${t.id}: bare "${m[1]}" (write ${Number(m[1]).toLocaleString('en-US')})`); }
    }
    for (const p of pupilPages(pk)) {
        const nums = [...new Set([...String(p.text).matchAll(/(?<![\d.])\d{1,3}(?:,\d{3})+(?![\d,])|(?<![\d,.])\d{4,}(?![\d,])/g)].map((m) => digits(m[0])))];
        for (let i = 0; i < nums.length; i++) for (let j = i + 1; j < nums.length; j++) {
            const a = nums[i], b = nums[j];
            if (a.length >= 4 && a.length === b.length && a.slice(0, 2) === b.slice(0, 2) && a !== b && !/^(\d)\1*0*$/.test(a.slice(2) + b.slice(2))) {
                // same digits in another order is a deliberate place-value contrast, not a near look
                if ([...a].sort().join('') === [...b].sort().join('')) continue;
                probs.push(`${p.id}: near-look ${Number(a).toLocaleString('en-US')} / ${Number(b).toLocaleString('en-US')}`);
            }
        }
    }
    const u = [...new Set(probs)];
    return { id: 'LP-NUMBERS', pass: !u.length, msg: u.length ? u.slice(0, 6).join('; ') : 'teacher numbers comma-grouped; no near-look pair on a pupil page', detail: u };
}

function fallback(pk) {
    const probs = [];
    const sizing = pk.sizing || null; // the role's sizing.mode once lf-engine returns it
    if (sizing && /fallback/i.test(String(sizing.mode || sizing))) probs.push(`chart sizing mode ${sizing.mode || sizing}`);
    const FLOOR = { final: 0.85, grid3: 0.8, one: 1, row: 1 };
    for (const p of pk.pages) {
        const mode = (sizing && sizing.mode) || p.chartMode || 'one'; const floor = FLOOR[mode] || 1;
        for (const z of p.zooms || []) if (z < floor - 1e-6) { probs.push(`${p.id}: chart drawn at zoom ${z} in mode ${mode} (floor ${floor}: chartPage's fallback)`); break; }
    }
    const charts = pk.pages.filter((p) => (p.zooms || []).length);
    return { id: 'LP-FALLBACK', pass: !probs.length, msg: probs.length ? probs.join('; ') : `${charts.length} chart page(s), every drawing at or above its mode's floor (${charts.map((p) => `${p.id} ${Math.min(...p.zooms)} ${p.chartMode || ''}`).join(', ') || 'no chart drawing'})`, detail: probs };
}

function prereq(pk) {
    const p = pk.pages.find((x) => x.id === 'P0'), k = keyOf(pk, 'P0'); const probs = [];
    if (!p || !k) return { id: 'LP-PREREQ', pass: true, msg: 'no Prerequisite Check page (N/A)', detail: [] };
    p.cells.forEach((c, i) => {
        const kc = k.cells[i]; const lab = c.letter || String(i + 1);
        if (kc && kc.keyEmpty) probs.push(`P0 ${lab}: ${kc.keyEmpty} of ${kc.writing} writing slot(s) left empty on the key (one slot per key answer)`);
        if (c.traces || c.greyInk || c.say || c.steps) probs.push(`P0 ${lab}: scaffold on a check cell (${[c.traces && 'trace', c.greyInk && 'grey ink', c.say && 'Say band', c.steps && 'Steps'].filter(Boolean).join(', ')})`);
    });
    if (p.say.length || p.steps.length) probs.push(`P0 prints ${p.say.length ? 'a Say band' : ''}${p.steps.length ? ' a Steps band' : ''}`);
    return { id: 'LP-PREREQ', pass: !probs.length, msg: probs.length ? probs.slice(0, 6).join('; ') : `P0: ${p.cells.length} cells, every writing slot filled on the key, no scaffold`, detail: probs };
}

function measureCheck(pk) {
    const probs = [];
    const laid = pk.pages.filter((p) => typeof p.minPt === 'number');
    if (!laid.length) return { id: 'LP-MEASURE', pass: false, msg: 'no rendered measurements in the packet (run with layout)', detail: [] };
    for (const p of laid) {
        if (p.minPt < 8 - 0.01) probs.push(`${p.id}: text ${p.minPt} pt ("${p.minWhere}")`);
        if (p.kind !== 'teacher' && p.bodyMm && p.footMm / p.bodyMm > 0.08 && !/^P6/.test(p.id)) probs.push(`${p.id}: blank foot ${p.footMm} mm (${Math.round(p.footMm / p.bodyMm * 100)} % of the body)`);
        for (const c of p.cells) for (const [w, h] of c.slotMm || []) if (w > 0 && h > 0 && (w < 8 || h < 8)) { probs.push(`${p.id} ${c.letter || '?'}: answer slot ${w} × ${h} mm (< 8 mm)`); break; }
    }
    const u = [...new Set(probs)];
    return { id: 'LP-MEASURE', pass: !u.length, msg: u.length ? u.slice(0, 8).join('; ') : `${laid.length} rendered pages: text >= 8 pt, slots >= 8 mm, blank foot <= 8 %`, detail: u };
}

const CHECKS = { 'LP-FAMILY-REPEAT': familyRepeat, 'LP-TEXT': textCheck, 'LP-GIVEAWAY': giveaway, 'LP-MODELLED': modelled, 'LP-NUMBERS': numbers, 'LP-FALLBACK': fallback, 'LP-PREREQ': prereq, 'LP-MEASURE': measureCheck };
/** The pure checks on a packet; `only` limits them. LP-RASTER is run by lpRaster (it needs the PDF). */
function lpChecks(pk, only) {
    const ids = (only && only.length ? only : Object.keys(CHECKS)).filter((id) => CHECKS[id]);
    return ids.map((id) => CHECKS[id](pk));
}

/* ------------------------------------------------------------------ LP-RASTER (PyMuPDF) */
// The rules come from the PDF's vector paths (PyMuPDF get_drawings: dark stroked lines and rectangle edges >= 6 pt, the
// panel rules, the We Do grid and the chart's step icons); the RASTER is pdfium's (Chrome's own PDF engine: L20, the
// facts-print r4 critic counted rules on pdfium's 72 / 93 dpi render). A rule is kept when >= 60 % of its sample points
// have a pixel darker than 215 within 1 px. Without pypdfium2 it falls back to PyMuPDF's raster and says so.
const RASTER_LP_PY = `
import sys, json, pymupdf
src = sys.argv[1]; dpis = [int(x) for x in sys.argv[2].split(',')]
only = set(int(x) for x in sys.argv[3].split(',')) if len(sys.argv) > 3 and sys.argv[3] else None
try:
    import pypdfium2 as pdfium
    pdoc = pdfium.PdfDocument(src); engine = 'pdfium'
except Exception:
    pdoc = None; engine = 'pymupdf'
d = pymupdf.open(src); out = []
for pi, p in enumerate(d):
    if only is not None and pi + 1 not in only: continue
    strokes = []
    for dr in p.get_drawings():
        w = dr.get('width') or 0
        col = dr.get('color')
        if not col or dr.get('type') not in ('s', 'fs') or sum(col) / len(col) > 0.8: continue
        ds = str(dr.get('dashes') or '')
        if ds and not ds.startswith('[] '): continue  # a dashed line (the exit slip's cut line) is broken on purpose
        for it in dr['items']:
            if it[0] == 'l': strokes.append((it[1], it[2], w))
            elif it[0] == 're':
                r = it[1]; strokes += [(r.tl, r.tr, w), (r.tr, r.br, w), (r.br, r.bl, w), (r.bl, r.tl, w)]
    strokes = [s for s in strokes if abs(s[0].x - s[1].x) + abs(s[0].y - s[1].y) >= 6]
    for dpi in dpis:
        z = dpi / 72.0
        if pdoc is not None:
            img = pdoc[pi].render(scale=z, grayscale=True).to_pil().convert('L'); W, H = img.size; px = img.load()
            get = lambda X, Y: px[X, Y]
        else:
            pix = p.get_pixmap(dpi=dpi, colorspace=pymupdf.csGRAY); W, H = pix.width, pix.height
            get = lambda X, Y: pix.pixel(X, Y)[0]
        lost = []
        for a, b, w in strokes:
            n = 0; ink = 0
            L = max(abs(a.x - b.x), abs(a.y - b.y)); k = max(4, int(L / 3))
            for i in range(1, k):
                x = a.x + (b.x - a.x) * i / k; y = a.y + (b.y - a.y) * i / k
                best = 255
                for dx in (-1, 0, 1):
                    for dy in (-1, 0, 1):
                        X = int(x * z) + dx; Y = int(y * z) + dy
                        if 0 <= X < W and 0 <= Y < H: best = min(best, get(X, Y))
                n += 1; ink += best < 215
            if n and ink / n < 0.6: lost.append([round(a.x, 1), round(a.y, 1), round(b.x, 1), round(b.y, 1), w])
        out.append({'page': pi + 1, 'dpi': dpi, 'rules': len(strokes), 'lost': len(lost), 'at': lost[:3], 'engine': engine})
print(json.dumps(out))
`;
/** pages: the 1-based PDF pages to read (the pupil pages and keys; a teacher page's thumbnails are scaled-down pupil pages,
 *  whose rules no pupil sees) - null for every page. */
function lpRaster(pdf, execFileSync, dpis = [72, 93], pages = null) {
    const res = JSON.parse(execFileSync('python3', ['-c', RASTER_LP_PY, pdf, dpis.join(','), pages ? pages.join(',') : ''].filter((x, i) => i < 4 || x), { encoding: 'utf8', maxBuffer: 64 << 20 }).trim().split('\n').pop());
    const bad = res.filter((r) => r.lost > 0);
    const rules = res.filter((r) => r.dpi === dpis[0]).reduce((a, r) => a + r.rules, 0);
    const eng = res.length ? res[0].engine : '?';
    return { id: 'LP-RASTER', pass: rules > 0 && !bad.length, msg: bad.length ? `${eng}: ` + bad.slice(0, 8).map((r) => `page ${r.page} at ${r.dpi} dpi: ${r.lost} of ${r.rules} rules leave no ink (${r.at.map((q) => `${q[0]},${q[1]}→${q[2]},${q[3]} ${q[4]}pt`).join('; ')})`).join('; ') : `${rules} stroked rules on ${res.length / dpis.length} pupil / key pages: all inked at ${dpis.join(' and ')} dpi (${eng})`, detail: bad };
}

/* ------------------------------------------------------------------ self-test */
function selfTest() {
    const bad = []; let n = 0;
    const eq = (name, got, want) => { n++; if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
    eq('family ×', family('6×4'), '4,6,24'); eq('family ÷', family('24÷6'), '4,6,24'); eq('family ÷ other', family('24÷3'), '3,8,24'); eq('family x', family('6 x 4'), '4,6,24'); eq('family +', family('6+4'), null);
    eq('frames', frames('Ravi has 20 marbles. Tom has 20 marbles.'), ['20 marble']);
    const pg = (id, kind, o = {}) => Object.assign({ id, kind, text: '', say: [], steps: [], bandLabels: [], bands: [], cells: [], zooms: [] }, o);
    const cell = (o) => Object.assign({ letter: '', text: '', slots: 1, keyAns: [], traces: 0, greyInk: 0, level: 0, say: 0, steps: 0 }, o);
    const pk = { pool: { places: [{ page: 'P2b', item: '20÷4', rep: 'msw' }, { page: 'P4-2', item: '20÷5', rep: 'msw' }] }, pages: [pg('P2b', 'pupil'), pg('P4-2', 'pupil')] };
    eq('family repeat fails', familyRepeat(pk).pass, false);
    pk.pool.places[1].item = '18÷3'; eq('family fresh passes', familyRepeat(pk).pass, true);
    const t5 = pg('T5', 'teacher', { text: 'Section 9 · P5 Word problem Say "No step boxes this time. Draw it."' });
    const p5 = pg('P5', 'pupil', { bandLabels: ['Step 1:', 'Step 2:'], text: 'Step 1: | Step 2:' });
    eq('no-X fails', textCheck({ pages: [t5, p5] }).pass, false);
    eq('no-X passes', textCheck({ pages: [t5, pg('P5', 'pupil', { text: 'Draw it.' })] }).pass, true);
    eq('CQ count', textCheck({ pages: [pg('T5', 'teacher', { text: 'Write four answers. A: 27 · B: 2 · C: 5.' })] }).pass, false);
    eq('CQ ok', textCheck({ pages: [pg('T5', 'teacher', { text: 'Write four answers. A: 27 · B: 2 · C: 5 · D: 20.' })] }).pass, true);
    eq('giveaway', giveaway({ pages: [pg('P5', 'pupil', { say: ['The answer is 42.'], cells: [cell({ text: '6 × 7 =' })] }), pg('P5-key', 'key', { cells: [cell({ keyAns: ['42'] })] })] }).pass, false);
    eq('given value ok', giveaway({ pages: [pg('P5', 'pupil', { say: ['I start at 42.'], cells: [cell({ text: '42 − 0 =' })] }), pg('P5-key', 'key', { cells: [cell({ keyAns: ['42'] })] })] }).pass, true);
    eq('guided = independent', giveaway({ pages: [pg('P3', 'pupil', { bands: [{ label: 'Guided Practice:', cells: [cell({})] }, { label: 'Independent Practice:', cells: [cell({})] }] })] }).pass, false);
    eq('numbers bare', numbers({ pages: [pg('T3', 'teacher', { text: '4. 4000 · 5. 50 · seed 4242 © 2026' })] }).pass, false);
    eq('numbers comma', numbers({ pages: [pg('T3', 'teacher', { text: '4. 4,000 · 5. 50 · seed 4242 © 2026' })] }).pass, true);
    eq('near look', numbers({ pages: [pg('P4-2', 'pupil', { text: '92,163 | 92,715' })] }).pass, false);
    eq('fallback', fallback({ pages: [pg('P2', 'pupil', { zooms: [0.77] })] }).pass, false);
    eq('prereq slots', prereq({ pages: [pg('P0', 'pupil', { cells: [cell({ slots: 2 })] }), pg('P0-key', 'key', { cells: [cell({ keyAns: ['14'], writing: 2, keyEmpty: 1 })] })] }).pass, false);
    eq('modelled', modelled({ pool: { places: [{ page: 'P2', item: '1', rep: 'a' }, { page: 'P4-1', item: '2', rep: 'b' }] }, pages: [] }).pass, false);
    eq('modelled variant', modelled({ pool: { places: [{ page: 'P2', item: '1', rep: 'a:x' }, { page: 'P4-1', item: '2', rep: 'a:y' }] }, pages: [] }).pass, true);
    eq('situation add', situation('Mia has 6 beads. Mia gets 14 more beads. How many beads does Mia have now?'), 'add');
    eq('situation 2-step', situation('Ravi has 20 marbles. Ravi shares them equally among 4 friends. Each friend gets 8 more. How many?'), 'share+add');
    const sp = (id, t) => pg(id, 'pupil', { cells: [cell({ text: t })] });
    eq('story unmodelled', modelled({ pool: { places: [] }, pages: [sp('P2', 'Omar has 5 marbles. Kofi has 10 marbles. How many marbles do they have in all?'), sp('P4-1', 'Aya has 1 crayon. Aya gets 19 more crayons. How many crayons does Aya have now?')] }).pass, false);
    return { n, bad };
}

module.exports = { LP_IDS, lpMeasure, lpChecks, lpRaster, family, frames, situation, selfTest };
