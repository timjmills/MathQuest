// Column reach gate (owner ruling 2026-09-25): "almost all problem types can fit in at least two
// columns. More operational-style problems can fit into 3, and fast facts into 4 or more. Some
// problems will need to be one column - those keep one."
//
// For every registered cell template (one or two representative skills each) at sizes S / M / L,
// this builds an Independent sheet through window.buildSheet with the teacher's Columns set to the
// template's target and reads the column count the layout actually used (`fits.cols`, the line
// the print dialog shows). A template must reach its target:
//
//   fact                                   4   (fast facts; fact rows go to 5-10 on their own role)
//   stack, equation                        3   (operations)
//   everything else                        2
//
// ONE_COLUMN lists the templates allowed fewer, each with its reason. A template that reaches
// MORE than its allowlisted count is reported as stale (the allowlist only shrinks).
//
//   node tests/scripts/ws-columns.cjs                  # the gate
//   node tests/scripts/ws-columns.cjs --report-only    # print everything, exit 0
//   node tests/scripts/ws-columns.cjs --templates pv,coins --sizes S
//
// ROLE SIZE CHECKS (shared-roles critic r1, R1-7 / R1-8; LESSONS_LEARNED L1 "Size S ignored"):
//   node tests/scripts/ws-columns.cjs --roles mixed-practice [--skills a:b,c:d] [--sets a:b+c:d,...]
//       every skill (and every set, one Mixed practice page of several skills) at S / M / L, in the Daily
//       look (the role's default) and I Can: the problems printed never fall from S to M to L
//       (items S >= M >= L), and the count across the page PRINTS (the widest grid) is the engine's own
//       fits.cols - never a lattice the shelves do not use.
//   node tests/scripts/ws-columns.cjs --roles pre-skill-check [--skills a:b,...]
//       every skill at S / M / L: at most two pages (one when the skills fit it); one scored group of items
//       (a quadrant or a band) a prerequisite skill, at least 3 skills, none of them the page's own skill (or
//       its host / preset); on page 1 the items run down at least half the body (PAGEFILL floor: the last
//       item's foot >= 50 % of the way from the first item's top to the footer); a skill whose items all
//       measure over 110 mm may take a page of its own; and the key has as many pages.
//   Last line `ws-columns: OK` / `ws-columns: FAIL (n)`; --report-only exits 0.
'use strict';
const { open, listSkills } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);

const TARGET = { fact: 4, stack: 3, equation: 3 };
const DEFAULT_TARGET = 2;

/** Templates allowed fewer columns than their target: {template: {cols, why}} (min cols, per size when an object). */
const ONE_COLUMN = {
    wordpic: { cols: 1, why: 'a K picture word problem is a full-width story with its pictures and work box (PT-WPR-1)' },
    'number-line': { cols: 1, why: 'a number line needs the full width for 1 cm ticks and labels (RP number-line minimums)' },
    'hop-line': { cols: 1, why: 'a hop line needs the full width for its arcs and tick labels' },
    timeline: { cols: 1, why: 'an elapsed-time line needs the full width for its hour ticks and hops' },
    // O6 lane AP2 round 3 (critic round 4): WORKSHEET_DESIGN_STANDARD.md section 11.2 gives the
    // ruler and the graph plot one column each, and RP-133 keeps a graph and its question in one cell.
    ruler: { cols: 1, why: 'a ruler prints at true scale only (RP-160): 6 inches is 158 mm, the whole live width (section 11.2: 1 column)' },
    'bar-graph': { cols: 1, why: 'the plot area is 80 x 60 / 90 x 70 / 100 x 80 mm (section 11.2) and its question sits beside it in the same cell (RP-133)' },
    pictograph: { cols: 1, why: 'a graph (section 11.2: 1 column): the table of up to 8 pictures a row, its key, and its question beside it in the same cell (RP-133)' },
    equation: { cols: { S: 3, M: 2, L: 2 }, why: 'at M / L an equation with two 2-digit numbers, a sign circle and a slot is wider than a 3-column cell at the size\'s digit height (DN-11: columns never shrink digits); 2 columns hold it' },
};

const SIZES = (arg('sizes', 'S,M,L')).split(',').filter(Boolean);
const ONLY = (arg('templates', '') || '').split(',').filter(Boolean);

const ROLE_DEFAULT_SKILLS = 'addition:add_facts,subtraction:sub_2d_1d,subtraction:sub_100k_no_regroup,multiplication:mult_facts,division:div_facts,fractions:identify';
const ROLE_DEFAULT_SETS = 'addition:add_facts+multiplication:mult_facts,addition:add_facts+fractions:identify,subtraction:sub_2d_1d+division:div_facts';
const ROLE_SIZES = ['S', 'M', 'L'];

/** One sheet of `role` for `skills` at `size` / `look`, read back: items, fits.cols, printed cols, groups, fill. */
async function roleSheet(page, { role, skills, size, look }) {
    return page.evaluate(async ({ role, skills, size, look }) => {
        try {
            const sk = skills.map((k) => { const [categoryId, skillId] = k.split(':'); return { categoryId, skillId }; });
            const req = { role, sections: [{ skills: sk }], size, paper: 'A4', seed: 5, form: 'A', key: true };
            if (look) req.look = look;
            const r = await window.buildSheet(req);
            const cols = Math.max(0, ...[...String(r.pupilHtml).matchAll(/class="ws-grid[^"]*"[^>]*grid-template-columns:repeat\((\d+),/g)].map((m) => Number(m[1])));
            // (a skill whose every item measures over 110 mm at its narrowest takes a page of its own)
            const tallPools = [...new Set(r.items.map((it) => it.pool))].filter((p) => r.items.filter((it) => it.pool === p).every((it) => {
                const hs = Object.values(it.measured || {}).map((x) => x && x.hMm).filter((h) => Number.isFinite(h));
                return hs.length && Math.min(...hs) > 110;
            })).length;
            const out = { tallPools, pools: new Set(r.items.map((it) => it.pool)).size, items: r.items.length, fitsCols: Number(r.fits && r.fits.cols) || 0, cols, pages: r.pageCount, keyPages: r.keyPageCount, skills: [...new Set(r.items.map((it) => it.skill))] };
            // the page's own skill and its host (a preset deals its host's items)
            out.own = [];
            for (const s of sk) {
                out.own.push(`${s.categoryId}:${s.skillId}`);
                try { const q = window.generateQuestionFor({ category: s.categoryId, skill: s.skillId, seed: 1 }); if (q && q.skillId) out.own.push(`${q.categoryId || s.categoryId}:${q.skillId}`); } catch (e) { /* keep */ }
            }
            if (role === 'pre-skill-check') {
                // the fill of page 1, laid out as it prints (sheetDocument in a frame)
                const frame = document.createElement('iframe');
                frame.style.cssText = 'position:absolute;left:-10000px;top:0;width:230mm;height:320mm;border:0;';
                document.body.appendChild(frame);
                await new Promise((res) => { frame.onload = res; frame.srcdoc = window.sheetDocument(r.pupilHtml, 'check'); setTimeout(res, 8000); });
                await new Promise((res) => setTimeout(res, 150));
                const d = frame.contentDocument;
                out.fills = [];
                out.groups = 0;
                for (const pg of d.querySelectorAll('.ws-page')) {
                    const foot = pg.querySelector('[data-ws-teacher], .ws-foot');
                    const cells = [...pg.querySelectorAll('.ws-cell')].filter((c) => c.getBoundingClientRect().height > 0);
                    const top = cells.length ? Math.min(...cells.map((c) => c.getBoundingClientRect().top)) : 0;
                    const bottom = cells.length ? Math.max(...cells.map((c) => c.getBoundingClientRect().bottom)) : 0;
                    const footTop = foot ? foot.getBoundingClientRect().top : pg.getBoundingClientRect().bottom;
                    out.fills.push(footTop > top ? (bottom - top) / (footTop - top) : 0);
                    out.groups += pg.querySelectorAll('.mq-quadscore').length;
                }
                out.fill = out.fills.length ? out.fills[0] : 0;
                frame.remove();
            }
            return out;
        } catch (e) { return { err: String((e && e.message) || e).slice(0, 160) }; }
    }, { role, skills, size, look });
}

async function roleChecks(roles) {
    const app = await open({ seed: 7 });
    const page = app.page;
    const rows = [];
    const bad = [];
    const skills = arg('skills', ROLE_DEFAULT_SKILLS).split(',').filter(Boolean);
    for (const role of roles) {
        if (role === 'mixed-practice') {
            const sets = skills.map((k) => [k]).concat((has('skills') && !has('sets') ? '' : arg('sets', ROLE_DEFAULT_SETS)).split(',').filter(Boolean).map((x) => x.split('+')));
            for (const set of sets) for (const look of ['daily', 'ican']) {
                const got = {};
                for (const size of ROLE_SIZES) got[size] = await roleSheet(page, { role, skills: set, size, look });
                const name = `${role} ${set.join('+')} ${look}`;
                const err = ROLE_SIZES.filter((z) => got[z].err).map((z) => `${z}: ${got[z].err}`);
                if (err.length) { bad.push(`${name}: ${err.join('; ')}`); rows.push(`FAIL ${name}: ${err.join('; ')}`); continue; }
                const n = ROLE_SIZES.map((z) => got[z].items);
                const why = [];
                if (!(n[0] >= n[1] && n[1] >= n[2])) why.push(`items S ${n[0]} / M ${n[1]} / L ${n[2]} fall from S to L (L1: S >= M >= L)`);
                for (const z of ROLE_SIZES) if (got[z].cols !== got[z].fitsCols) why.push(`${z} prints ${got[z].cols} across but fits.cols says ${got[z].fitsCols}`);
                rows.push(`${why.length ? 'FAIL' : 'ok  '} ${name}  items ${n.join(' / ')}  cols ${ROLE_SIZES.map((z) => `${got[z].cols}(fits ${got[z].fitsCols})`).join(' / ')}`);
                if (why.length) bad.push(`${name}: ${why.join('; ')}`);
            }
        } else if (role === 'pre-skill-check') {
            for (const k of skills) for (const size of ROLE_SIZES) {
                const g = await roleSheet(page, { role, skills: [k], size });
                const name = `${role} ${k} ${size}`;
                if (g.err) { bad.push(`${name}: ${g.err}`); rows.push(`FAIL ${name}: ${g.err}`); continue; }
                const why = [];
                // (one page when the four skills fit it; a check of tall pictures takes a second page, never more)
                if (g.pages > 2 + g.tallPools) why.push(`${g.pages} pages (a check is short, PT 2.10: one page, two when its pictures are tall, plus one a skill whose item is taller than half a page)`);
                if (g.keyPages !== g.pages) why.push(`key ${g.keyPages} page(s) for ${g.pages}`);
                if (g.pools < 3) why.push(`${g.pools} prerequisite skill(s) (PT-PRE-1: four)`);
                // (a dealt skill the pages cannot hold is left out - PG-23 - so the scored groups may be fewer than the skills dealt)
                if (g.groups < 3 || g.groups > g.pools) why.push(`${g.groups} scored group(s) for ${g.pools} skills dealt (PT-PRE-1: one quadrant or band a prerequisite, at least 3)`);
                const self = g.skills.filter((x) => g.own.includes(x));
                if (self.length) why.push(`checks the page's own skill ${self.join(', ')} (PT-PRE-3: its prerequisites)`);
                // (page 1's floor; a later page's share is print-lint's DN-2 / PG-23)
                if (!((g.fills || [0])[0] >= 0.5)) why.push(`page 1: items use ${Math.round(((g.fills || [0])[0] || 0) * 100)} % of the body (PAGEFILL floor 50 %, H5)`);
                rows.push(`${why.length ? 'FAIL' : 'ok  '} ${name}  ${g.items} items, ${g.pages} p, ${g.groups} groups [${g.skills.join(' ')}], fill ${(g.fills || []).map((f) => `${Math.round(f * 100)} %`).join(' / ')}${why.length ? `  - ${why.join('; ')}` : ''}`);
                if (why.length) bad.push(`${name}: ${why.join('; ')}`);
            }
        } else {
            rows.push(`FAIL ${role}: no size check for this role (mixed-practice, pre-skill-check)`);
            bad.push(`${role}: unknown role`);
        }
    }
    await app.close();
    for (const r of rows) console.log(r);
    if (bad.length && !has('report-only')) {
        console.log(`ws-columns: FAIL (${bad.length})`);
        for (const b of bad) console.log(`  - ${b}`);
        process.exit(1);
    }
    console.log(`ws-columns: ${bad.length ? `FAIL (report only, ${bad.length})` : 'OK'} (${rows.length} role checks)`);
}

if (has('roles')) {
    roleChecks(arg('roles', '').split(',').filter(Boolean)).catch((e) => { console.error(e); console.log('ws-columns: FAIL (crashed)'); process.exit(1); });
} else (async () => {
    const app = await open({ seed: 7 });
    const page = app.page;
    const skills = await listSkills(page);
    // One or two representative skills per template.
    const byTpl = await page.evaluate(async (skills) => {
        const out = {};
        for (const s of skills) {
            let tpl = '';
            try {
                const q = window.generateQuestionFor({ category: s.categoryId, skill: s.skillId, seed: 11 });
                tpl = (q && q.cell && q.cell.template) || '';
            } catch (e) { tpl = ''; }
            if (!tpl || tpl === 'legacy') continue;
            (out[tpl] = out[tpl] || []);
            if (out[tpl].length < 2) out[tpl].push({ categoryId: s.categoryId, skillId: s.skillId });
        }
        return out;
    }, skills);
    const rows = [];
    const bad = [];
    const stale = [];
    for (const tpl of Object.keys(byTpl).sort()) {
        if (ONLY.length && !ONLY.includes(tpl)) continue;
        const want = TARGET[tpl] || DEFAULT_TARGET;
        const allow = ONE_COLUMN[tpl];
        for (const size of SIZES) {
            let best = 0;
            const seen = [];
            for (const sk of byTpl[tpl]) {
                const got = await page.evaluate(async ({ sk, size, want }) => {
                    try {
                        const r = await window.buildSheet({ role: 'independent', sections: [{ skills: [sk], count: 6, columns: want }], size, look: 'ican', paper: 'A4', seed: 5, form: 'A', key: false });
                        const f = r.fits || {};
                        return { cols: Number(f.cols) || 0, note: String(f.note || '').slice(0, 120) };
                    } catch (e) { return { cols: 0, note: `error: ${String(e && e.message || e).slice(0, 100)}` }; }
                }, { sk, size, want });
                seen.push(`${sk.categoryId}:${sk.skillId}=${got.cols}`);
                best = Math.max(best, got.cols);
                if (got.cols >= want) break;
            }
            const min = allow ? (typeof allow.cols === 'object' ? allow.cols[size] : allow.cols) : want;
            const ok = best >= min;
            rows.push(`${ok ? 'ok  ' : 'FAIL'} ${tpl.padEnd(16)} ${size}  reaches ${best} (target ${want}${allow ? `, allowlisted ${min}: ${allow.why}` : ''})  [${seen.join(' ')}]`);
            if (!ok) bad.push(`${tpl} at ${size}: reaches ${best} column(s), needs ${min}`);
            if (allow && best > min) stale.push(`${tpl} at ${size}: allowlisted at ${min} but reaches ${best}`);
        }
    }
    await app.close();
    for (const r of rows) console.log(r);
    for (const s of stale) console.log(`note: stale allowlist entry - ${s}`);
    if (bad.length && !has('report-only')) {
        console.log(`ws-columns: FAIL (${bad.length})`);
        for (const b of bad) console.log(`  - ${b}`);
        process.exit(1);
    }
    console.log(`ws-columns: ${bad.length ? 'FAIL (report only)' : 'OK'} (${rows.length} template x size checks)`);
})().catch((e) => { console.error(e); console.log('ws-columns: FAIL (crashed)'); process.exit(1); });
