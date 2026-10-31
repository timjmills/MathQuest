// js/modules/sheet/mixed-m2.check.cjs
// THE MIXED PAGE CHECK, M2 (IMPROVEMENT_PLAN 3.3 / 3.4; PAGE_TYPES PT-MIX-5, -7, -9; owner
// 2026-10-31: "mix by section (with specified amount of problems) and also mixed each problem (with
// specified problem distribution)"). Builds real pages through buildSheet in Chromium, of skills of
// DIFFERENT size classes, and holds every one to:
//
//   arranged   a Mixed request of 2+ skills prints 'mixed' (no fallback to sections for a legacy
//              drawing, another count across or taller boxes)
//   runs       no skill runs more than 2 turns in print order (a block of small boxes is one turn),
//              except where the weights win (max(2, ceil(major / (minor + 1))) turns) and the notes
//              say so in plain words
//   counts     exact counts (one section per skill with `count`) print exactly, across pages
//   two        every page holds 2+ problems of each skill on it
//   split      no cell crosses its page's body; every bordered cell holds a problem (PG-15: a short
//              shelf ends in ONE unruled trailing area, to the frame)
//   H13        every cell's drawing (its natural height, measured in the DOM) fills >= 70 % of its box
//   fill       no page under-filled while problems remain: a page other than the last has no room
//              for another shelf; the pages of a split sheet are within half of each other
//   ladder     problems a page, S > M > L, per look, on Mixed AND Sections pages (R1-7, LESSONS L1)
//   key        the key's cells are the pupil page's, in the same order and the same places
//   align      cells of one template in one shelf row line up (first rule y, right edge, 0.3 mm)
//   sections   a Sections page with counts prints them, whole shelves where a count across allows
//
//   node js/modules/sheet/mixed-m2.check.cjs [--quick] [--seeds 2] [--only a,b]
// Prints `mixed-m2 check: OK` / `FAIL` and exits non-zero on a failure. Needs the preinstalled
// Chromium (tests/lib/ws-harness.cjs; MQ_ROOT serves another tree, for the backtest).
const path = require('path');

process.removeAllListeners('warning');
const ROOT = path.resolve(__dirname, '..', '..', '..');
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));

const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const QUICK = process.argv.includes('--quick');
const SEEDS = Math.max(1, Number(arg('seeds', QUICK ? 1 : 2)) || 1);
const ONLY = arg('only', '') ? arg('only', '').split(',') : null;
const sk = (id) => { const [categoryId, skillId] = id.split(':'); return { categoryId, skillId, opts: {} }; };

const SETS = {
    a: ['multiplication:multiply', 'addition:add_facts'],                 // the owner's: a legacy drawing + kit facts
    b: ['addition:add_facts', 'multiplication:mult_2by2_standard'],       // facts + 2-digit x (taller, wider)
    c: ['addition:add_facts', 'addition:add_word_problems'],              // facts + word problems
    d: ['fractions:identify', 'subtraction:subtract'],                    // a visual fraction cell + whole numbers
};
// R1-7 (the shared-roles lane's cases): one-skill and I Can Mixed practice pages whose size ladder broke
const LADDER1 = [
    { set: ['subtraction:sub_100k_regroup'], look: 'daily' }, { set: ['decimals:add_decimal'], look: 'ican' },
    { set: ['subtraction:sub_facts'], look: 'ican' }, { set: ['addition:add_facts', 'fractions:identify'], look: 'ican', strict: true },
];
const SIZES_ = ['S', 'M', 'L'];
const LOOKS_ = QUICK ? ['daily'] : ['daily', 'ican'];
const TOL_MM = 0.3;

// Build one sheet and measure it in the page (run in the browser).
const PAGE_FN = async (req) => {
    const o = await window.buildSheet(req);
    const mm = 96 / 25.4;
    const meta = (o.plan && o.plan.meta) || {};
    const measure = (html) => {
        const host = document.createElement('div');
        host.style.cssText = 'position:absolute;left:-12000px;top:0;width:230mm;visibility:hidden';
        host.innerHTML = html;
        document.body.appendChild(host);
        const pages = [];
        for (const pg of host.querySelectorAll('.ws-page')) {
            const body = pg.querySelector('.ws-body') || pg;
            const bb = body.getBoundingClientRect();
            const cells = [];
            const out = { cells, split: 0, empty: 0, trails: [], h13: [], align: [], free: 0, shelves: [] };
            for (const g of pg.querySelectorAll('.ws-band .ws-grid')) {
                const gr = g.getBoundingClientRect();
                out.shelves.push(gr.height / mm);
                const kids = [...g.children];
                const trails = kids.filter((c) => c.classList.contains('blankrun'));
                out.trails.push({ n: trails.length, last: !trails.length || kids[kids.length - 1] === trails[0], ruled: trails.some((t) => ['Top', 'Bottom', 'Left', 'Right'].some((e) => parseFloat(getComputedStyle(t)[`border${e}Width`]) > 0)), toFrame: trails.every((t) => Math.abs(t.getBoundingClientRect().right - gr.right) < 3) });
                const rows = new Map();
                for (const c of kids.filter((x) => x.classList.contains('ws-cell') && !x.classList.contains('blankrun'))) {
                    const r = c.getBoundingClientRect();
                    const lab = c.querySelector(':scope > .ws-tab, :scope > .ws-letter');
                    const tpl = (c.querySelector('[data-ws-cell]') || c).getAttribute('data-ws-cell') || (c.className.match(/mqt--([\w-]+)/) || [])[1] || '';
                    cells.push({ label: lab ? lab.textContent.trim() : '', place: c.style.gridColumn + '|' + c.style.gridRow, tpl });
                    if (r.bottom > bb.bottom + 1 || r.top < bb.top - 1) out.split++;
                    if (!c.textContent.trim() && !c.querySelector('svg,img,canvas')) out.empty++;
                    // H13: the drawing's natural height (the cell laid out on its own, height auto)
                    const clone = c.cloneNode(true);
                    clone.style.cssText = `${c.style.cssText};position:absolute;visibility:hidden;height:auto;min-height:0;max-height:none;width:${r.width}px;left:0;top:0`;
                    g.appendChild(clone);
                    const nat = clone.getBoundingClientRect().height;
                    clone.remove();
                    out.h13.push({ label: lab ? lab.textContent.trim() : '', fill: nat / r.height, tpl, h: r.height / mm });
                    // alignment: the first ruled element's y and the right edge of the widest text line
                    let ruleY = null;
                    for (const el of c.querySelectorAll('*')) {
                        const cs = getComputedStyle(el);
                        if (parseFloat(cs.borderBottomWidth) >= 1 && el.getBoundingClientRect().width > 8) { ruleY = (el.getBoundingClientRect().bottom - r.top) / mm; break; }
                    }
                    let right = 0;
                    for (const el of c.querySelectorAll('span,div')) {
                        if (el.closest('.ws-tab,.ws-letter,.ws-mixcue')) continue;
                        if (![...el.childNodes].some((t) => t.nodeType === 3 && /\d/.test(t.textContent))) continue;
                        right = Math.max(right, el.getBoundingClientRect().right - r.left);
                    }
                    const key = `${Math.round(r.top)}|${tpl}|${Math.round(r.width)}`;
                    if (!rows.has(key)) rows.set(key, []);
                    rows.get(key).push({ ruleY, right: (r.width - right) / mm });
                }
                for (const [key, xs] of rows) {
                    // (a computation drawn by one template: a fact, a stack - M1 r1 D2; a picture or a
                    // story is laid out by its own content)
                    if (xs.length < 2 || !/^(fact|stack)$/.test(key.split('|')[1])) continue;
                    const ys = xs.map((x) => x.ruleY).filter((y) => y !== null);
                    const rs = xs.map((x) => x.right);
                    if (ys.length > 1 && Math.max(...ys) - Math.min(...ys) > 0.3) out.align.push(`${key.split('|')[1]} rule y ${Math.min(...ys).toFixed(1)}-${Math.max(...ys).toFixed(1)} mm`);
                    if (Math.max(...rs) - Math.min(...rs) > 0.3 && xs.every((x) => x.ruleY !== null)) out.align.push(`${key.split('|')[1]} right edge ${Math.min(...rs).toFixed(1)}-${Math.max(...rs).toFixed(1)} mm`);
                }
            }
            const bands = [...body.querySelectorAll('.ws-band')];
            const lastB = bands.length ? Math.max(...bands.map((b) => b.getBoundingClientRect().bottom)) : bb.top;
            out.free = (bb.bottom - lastB) / mm;
            out.bodyMm = bb.height / mm;
            // cells across each shelf (one-row cells side by side at the grid's top)
            out.across = [...pg.querySelectorAll('.ws-band .ws-grid')].map((g) => { const top = g.getBoundingClientRect().top; return [...g.children].filter((c) => c.classList.contains('ws-cell') && !c.classList.contains('blankrun') && Math.abs(c.getBoundingClientRect().top - top) < 3).length; });
            pages.push(out);
        }
        host.remove();
        return pages;
    };
    const pupil = measure(o.pupilHtml);
    const key = o.keyHtml ? measure(o.keyHtml) : [];
    const per = {};
    for (const it of o.items) per[it.pool] = (per[it.pool] || 0) + 1;
    // the plan's own record: problems a page by pool
    const pagePools = [];
    for (const pg of o.plan.pages || []) {
        const c = {};
        const walk = (p) => { if (!p) return; if (p.kind === 'grid') for (const it of p.items || []) { if (it && it.q && !it.model && !it.nolabel) { const pool = (o.items.find((x) => x.text === String(it.q.text || '')) || {}).pool || '?'; c[pool] = (c[pool] || 0) + 1; } } (p.contents || []).forEach(walk); if (p.content) walk(p.content); };
        (pg.sections || []).forEach(walk);
        pagePools.push(c);
    }
    return {
        arr: o.arrangement, role: o.role, n: o.items.length, per, pages: o.pageCount, keyPages: o.keyPageCount, notes: o.notes || [],
        perPage: o.fits && o.fits.perPage, cols: o.fits && o.fits.cols, m2: meta.m2 || null, longest: meta.interleave ? meta.interleave.longest : null,
        pupil, key, pagePools, maxRows: { S: 9, M: 7, L: 5 }[req.size],
    };
};

function scenarios() {
    const out = [];
    const sets = Object.keys(SETS).filter((k) => !ONLY || ONLY.includes(k));
    for (const arr of ['mixed', 'sections']) for (const k of sets) for (let s = 1; s <= SEEDS; s++) for (const look of LOOKS_) {
        out.push({ kind: 'ladder', arr, set: k, look, seed: 4000 + s * 37, sizes: SIZES_ });
    }
    for (const x of LADDER1) out.push({ kind: 'ladder', arr: 'sections', set: x.set.join('+'), skills: x.set, look: x.look, seed: 4111, sizes: SIZES_, weak: !x.strict });
    // exact counts, mixed problem by problem (the owner's "specified problem distribution")
    out.push({ kind: 'exact', arr: 'mixed', set: 'a', counts: [12, 8], size: 'M', look: 'daily', seed: 501 });
    out.push({ kind: 'exact', arr: 'mixed', set: 'a', counts: [3, 37], size: 'L', look: 'daily', seed: 502 });
    out.push({ kind: 'exact', arr: 'mixed', set: 'a', counts: [12, 28], size: 'L', look: 'ican', seed: 510 });
    out.push({ kind: 'exact', arr: 'mixed', set: 'a', counts: [30, 30], size: 'L', look: 'daily', seed: 503 });
    out.push({ kind: 'exact', arr: 'mixed', set: 'c', counts: [5, 14], size: 'M', look: 'ican', seed: 504 });
    out.push({ kind: 'exact', arr: 'mixed', set: 'd', counts: [6, 9], size: 'S', look: 'daily', seed: 505 });
    // exact counts, by section (no half-empty rows: whole shelves, or one unruled trailing area)
    out.push({ kind: 'exact', arr: 'sections', set: 'a', counts: [2, 10], size: 'L', look: 'daily', seed: 506 });
    out.push({ kind: 'exact', arr: 'sections', set: 'd', counts: [3, 7], size: 'M', look: 'ican', seed: 507 });
    // the practice roles asked for 'mixed'
    out.push({ kind: 'role', role: 'independent', arr: 'mixed', set: 'a', size: 'M', look: 'ican', seed: 508 });
    out.push({ kind: 'role', role: 'more-practice', arr: 'mixed', set: 'd', size: 'L', look: 'ican', seed: 509 });
    return out;
}

async function main() {
    const app = await open({ seed: 12345 });
    const fails = [];
    const warns = [];
    let pages = 0;
    const table = [];
    try {
        for (const sc of scenarios()) {
            const set = sc.skills || SETS[sc.set];
            const sizes = sc.sizes || [sc.size];
            const got = {};
            for (const size of sizes) {
                const sections = sc.counts ? set.map((id, i) => ({ skills: [sk(id)], count: sc.counts[i], ...(sc.pages ? { pages: sc.pages } : {}) })) : [{ skills: set.map(sk) }];
                const req = { role: sc.role || 'mixed-practice', ...(set.length > 1 ? { arrangement: sc.arr } : {}), sections, size, look: sc.look, seed: sc.seed, key: true };
                const id = `${sc.kind} ${sc.role || ''}${sc.arr} ${sc.set}${sc.counts ? ` ${sc.counts.join(':')}` : ''} ${sc.look} ${size} seed ${sc.seed}`;
                const fail = (why) => fails.push(`${id}: ${why}`);
                let r;
                try { r = await app.page.evaluate(PAGE_FN, req); } catch (e) { fail(`build failed: ${String(e.message || e).slice(0, 200)}`); continue; }
                pages += r.pages;
                got[size] = r;
                const notes = r.notes.join(' | ');
                // arranged
                if (sc.arr === 'mixed' && r.arr !== 'mixed') fail(`arranged ${r.arr} (${notes.slice(0, 160)})`);
                if (sc.arr === 'sections' && r.arr !== 'sections') fail(`arranged ${r.arr}`);
                // fits.cols is the count across the page prints (its widest shelf), not the lattice
                const across = Math.max(0, ...r.pupil.flatMap((pg) => pg.across));
                if (r.arr === 'sections' && r.cols && across && r.cols !== across) fail(`fits.cols ${r.cols}, the page prints ${across} across`);
                if (sc.role && r.role !== sc.role) fail(`role ${r.role}`);
                // runs, in turns, against the weights-win cap; a run over 2 is in the notes
                if (r.arr === 'mixed') {
                    if (r.m2) {
                        for (const pr of r.m2.runs || []) for (const [pool, x] of Object.entries(pr)) {
                            // (above the even-spacing ceiling: a shelf of tall boxes forces it - reported, the note is the rule)
                            if (x.run > x.cap) warns.push(`${id}: ${pool} runs ${x.run} turns, even spacing would give ${x.cap}`);
                            if (x.run > 2 && Object.keys(pr).filter((p) => pr[p].turns).length > 1 && !/come in a row/.test(notes)) fail(`${pool} runs ${x.run} turns with no note`);
                        }
                    } else if (r.longest > 2 && !/come in a row/.test(notes)) fail(`a run of ${r.longest} with no note`);
                }
                // exact counts
                if (sc.counts) {
                    const ids = Object.keys(r.per).sort();
                    const want = sc.counts.slice();
                    const have = ids.map((p) => r.per[p]);
                    if (JSON.stringify(have) !== JSON.stringify(want)) fail(`counts ${have.join(':')}, asked ${want.join(':')}`);
                    const printed = r.pagePools.reduce((a, c) => a + Object.values(c).reduce((x, y) => x + y, 0), 0);
                    if (printed !== want.reduce((a, b) => a + b, 0)) fail(`${printed} problems printed, ${want.reduce((a, b) => a + b, 0)} asked`);
                    if (r.pages > 1 && !(sc.pages >= r.pages) && !/pages? (was|were) added|need \d+ pages/.test(notes) && sc.arr === 'mixed') fail(`${r.pages} pages with no note`);
                }
                // two of each on every page a skill is on
                if (r.arr === 'mixed') r.pagePools.forEach((c, i) => { for (const [p, k] of Object.entries(c)) if (k === 1) fail(`page ${i + 1}: ${p} has one problem`); });
                // split / empty / trailing areas / H13 / alignment, pupil page and key
                r.pupil.forEach((pg, i) => {
                    if (pg.split) fail(`page ${i + 1}: ${pg.split} cell(s) cross the page body`);
                    if (pg.empty) fail(`page ${i + 1}: ${pg.empty} bordered cell(s) without a problem`);
                    for (const t of pg.trails) {
                        if (t.n > 1) fail(`page ${i + 1}: ${t.n} trailing areas in one shelf`);
                        if (!t.last) fail(`page ${i + 1}: a trailing area before the shelf's end`);
                        if (t.ruled) fail(`page ${i + 1}: a ruled trailing area`);
                        if (!t.toFrame) fail(`page ${i + 1}: a trailing area short of the frame`);
                    }
                    // (H13 is the mixed packer's to keep; a Sections page's grouped shelves are reported)
                    for (const h of pg.h13) if (h.fill < 0.7 - 0.02 && r.arr !== 'mixed') warns.push(`${id}: page ${i + 1} cell ${h.label} (${h.tpl}) fills ${(h.fill * 100).toFixed(0)} % (Sections, pre-existing grouped shelf)`);
                    for (const h of pg.h13) if (r.arr === 'mixed' && h.fill < 0.7 - 0.02) fail(`page ${i + 1} cell ${h.label} (${h.tpl}): drawing fills ${(h.fill * 100).toFixed(0)} % of a ${h.h.toFixed(1)} mm box (H13 70 %)`);
                    for (const a of pg.align) fail(`page ${i + 1}: ${a}`);
                });
                // the page is full: a page other than the last has no room for another shelf; split pages within half of each other
                if (r.arr === 'mixed' && r.pupil.length) {
                    const loads = r.pagePools.map((c) => Object.values(c).reduce((a, b) => a + b, 0));
                    if (loads.length > 1 && Math.min(...loads) < 0.5 * Math.max(...loads)) fail(`pages hold ${loads.join(' / ')} problems (not rebalanced)`);
                    if (!sc.counts && r.pupil.length === 1) {
                        // a fill page: no blank strip of 20 % of the body or more under the frame (L2,
                        // PRE-FLIGHT 2) - the counts were chosen to fill it
                        const pg = r.pupil[0];
                        if (pg.free > 0.2 * pg.bodyMm) fail(`${pg.free.toFixed(0)} mm free under the frame on a fill page (${((pg.free / pg.bodyMm) * 100).toFixed(0)} % of the body)`);
                    }
                }
                // the key mirrors the pupil page
                if (r.key.length !== r.pupil.length) fail(`key ${r.key.length} pages, pupil ${r.pupil.length}`);
                const seq = (ps) => ps.flatMap((p) => p.cells.map((c) => `${c.label}@${c.place}`)).join(',');
                if (r.key.length && seq(r.key) !== seq(r.pupil)) fail('the key\'s cells are not the pupil page\'s (order or places)');
                table.push(`${id.padEnd(58)} ${String(r.n).padStart(3)} problems ${r.pages}p ${r.arr}${r.m2 ? ` groups ${r.m2.groups.map((g) => `${g.pools.join('+')}:R${g.R}`).join(' ')}` : ''}`);
            }
            // the size ladder: S > M > L problems a page
            if (sc.kind === 'ladder' && got.S && got.M && got.L) {
                const pp = (x) => x.n / Math.max(1, x.pages);
                const ok = sc.weak ? pp(got.S) >= pp(got.M) && pp(got.M) >= pp(got.L) : pp(got.S) > pp(got.M) && pp(got.M) > pp(got.L);
                if (!ok) fails.push(`ladder ${sc.arr} ${sc.set} ${sc.look} seed ${sc.seed}: problems a page S ${pp(got.S)} / M ${pp(got.M)} / L ${pp(got.L)} (S > M > L${sc.weak ? ', one skill: S >= M >= L' : ''})`);
                if (got.S.pages > 1 || got.M.pages > 1 || got.L.pages > 1) fails.push(`ladder ${sc.arr} ${sc.set} ${sc.look} seed ${sc.seed}: a fill page spilled to ${Math.max(got.S.pages, got.M.pages, got.L.pages)} pages`);
            }
        }
    } finally {
        if (app.problems.length) console.log('page problems:', JSON.stringify(app.problems.filter((p) => p.type !== 'requestfailed').slice(0, 5)));
        await app.close();
    }
    if (process.argv.includes('--table')) for (const t of table) console.log(`  ${t}`);
    for (const w of warns.slice(0, 20)) console.log(`  WARN ${w}`);
    for (const f of fails.slice(0, process.argv.includes('--all') ? 1e6 : 60)) console.log(`  FAIL ${f}`);
    console.log(`mixed-m2 check: ${fails.length ? 'FAIL' : 'OK'} (${pages} pages, ${scenarios().length} scenarios${QUICK ? ', quick' : ''}; ${fails.length} failure(s))`);
    process.exit(fails.length ? 1 : 0);
}

main().catch((e) => { console.error(e); process.exit(1); });
