// tests/lib/ws-drawing-variants.mjs - which of a skill's option values CHANGE THE DRAWING, one representative each
// (lf-ops critic cbt r2, root cause: precritic --skill linted only the Independent page at defaults; the machine fix runs
// print-lint, empty-band and raster-fit on every role the signed card offers at M and L AND under every option value that
// changes the drawing - this file says which values those are, in node, in seconds).
//
//   node tests/lib/ws-drawing-variants.mjs --skill multiplication:count_by_tables [--root <tree>] [--items 6]
//     -> [{skill, roles, rolesFrom, variants: [{option, value, opts, why}], same: [{option, value, as}], all: N}]
//
// The candidate values are ws-copy-light's: the signed card's offered option values (tests/lib/ws-card-plan.mjs) or, with no
// card, every non-default value of the skill's own set / enum / bool options (the universal number line and play controls
// left out). A value CHANGES THE DRAWING when, on the same seeded items (seed 7000 + i, itemIndex i), any item's rendered cell
// skeleton (ws-drawing-skeleton drawingKey: template + tags, classes, slot kinds, glyphs; digits and words masked) differs from
// the defaults' - or when the option is a PAGE option (group "layout": onePage), which changes the page and not the cell.
// Values with the SAME per-item skeleton list as an earlier kept value are one drawing: only the first is rendered (missing
// 70 / 80 / 90 draw what missing 20 draws). A value whose items fail to generate is kept (why "generation error"), never
// dropped. Roles: the card's offered roles, else every buildSheet role.
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const NO_CARD_SKIP = /^(nl[A-Z]|calculator$|skipAfter$)/;

export async function loadApp(root) {
    const M = (p) => pathToFileURL(join(root, 'js', 'modules', p)).href;
    const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === Symbol.iterator ? undefined : stub()), apply: () => stub(), construct: () => stub(), set: () => true });
    const store = {};
    globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
    globalThis.sessionStorage = globalThis.localStorage; globalThis.window = globalThis; globalThis.document = stub();
    const quiet = { ...console };
    console.log = console.warn = console.error = console.info = console.debug = () => {};
    try {
        const gq = await import(M('generate-question.js'));
        const pg = await import(M('print-generate.js'));
        const so = await import(M('skill-options.js'));
        const roles = await import(M('sheet/roles/index.js'));
        const kit = await import(M('sheet/index.js'));
        const sk = await import(pathToFileURL(join(HERE, 'ws-drawing-skeleton.mjs')).href);
        const cp = await import(pathToFileURL(join(HERE, 'ws-card-plan.mjs')).href);
        return { gq, pg, so, kit, sk, cp, allRoles: ['independent', 'more-practice', ...Object.keys(roles.ROLE_MODULES)], quiet };
    } finally { Object.assign(console, quiet); }
}

/** Pure: group candidate values by their per-item drawing list. `sig(opts)` -> string[] (one key per item) or null (error). */
export function pickDrawingVariants(candidates, sig, pageOption = () => false) {
    const base = sig(undefined);
    const seen = new Map();
    const variants = [], same = [];
    for (const v of candidates) {
        const s = sig(v.opts);
        if (s === null) { variants.push({ ...v, why: 'generation error (kept)' }); continue; }
        const key = s.join('|');
        if (pageOption(v.option)) {
            const k2 = `page:${v.option}=${v.value}`;
            variants.push({ ...v, why: 'page option (layout group)' }); seen.set(k2, `${v.option}=${v.value}`); continue;
        }
        if (base && key === base.join('|')) { same.push({ option: v.option, value: v.value, as: 'defaults' }); continue; }
        if (seen.has(key)) { same.push({ option: v.option, value: v.value, as: seen.get(key) }); continue; }
        seen.set(key, `${v.option}=${v.value}`);
        const add = base ? s.filter((x) => !base.includes(x)).length : s.length, gone = base ? base.filter((x) => !s.includes(x)).length : 0;
        variants.push({ ...v, why: `draws ${add} element kind(s) the defaults do not${gone ? `, drops ${gone}` : ''}` });
    }
    return { variants, same };
}

export async function drawingVariantsFor(app, root, key, items = 6) {
    const [cat, id] = key.split(':');
    const plan = await app.cp.cardPlanFor(root, key);
    const hasCard = plan.roles.length > 0;
    let candidates = plan.variants;
    let defs = [];
    try { defs = app.so.offeredOptionsFor(cat, id) || []; } catch (e) { defs = []; }
    if (!hasCard) {
        candidates = [];
        for (const d of defs) {
            if (!['set', 'enum', 'bool'].includes(d.type) || NO_CARD_SKIP.test(d.id)) continue;
            const vals = d.type === 'bool' ? [true, false] : (d.values || []).map((x) => (x && typeof x === 'object' ? x.v : x));
            for (const v of vals) {
                if (d.type === 'set' ? (Array.isArray(d.default) && d.default.length === 1 && String(d.default[0]) === String(v)) : String(d.default) === String(v)) continue;
                candidates.push({ option: d.id, value: String(v), opts: { [d.id]: d.type === 'set' ? [v] : v } });
            }
        }
    }
    const group = Object.fromEntries(defs.map((d) => [d.id, d.group || '']));
    const sig = (opts) => {
        const out = [];
        const vocab = new Set();
        const sizes = [];
        for (let i = 0; i < items; i++) {
            try {
                const q = app.gq.generateQuestionFor({ category: cat, skill: id, opts, seed: 7000 + i, itemIndex: i });
                const full = Object.assign({ skillId: id, categoryId: cat }, q);
                const c = q && app.pg.kitCellSpec(full);
                const sk = c ? app.sk.cellSkeleton(app.kit, c.template, c.payload, full) : null;
                out.push(c ? `${c.template}:${sk === null ? 'fallback' : 'ok'}` : 'legacy');
                if (sk) for (const t of sk.split(/[(),*|]+/)) if (t) vocab.add(t);
                if (c) sizes.push((String(app.kit.renderCell(Object.assign({}, full, { cell: { template: c.template, payload: c.payload } }), { size: 'M', mode: 'print', state: 'blank' })).match(/<[a-zA-Z]/g) || []).length);
            } catch (e) { return null; }
        }
        // ... and its SIZE class: the median element count of a printed cell in steps of x1.25 (15 numbers a row where there
        // were 12 is a longer row, a new line - critic cbt r2 E4 - though every element kind is the same)
        sizes.sort((x, y) => x - y);
        if (sizes.length) out.push(`size~${Math.round(Math.log(Math.max(1, sizes[sizes.length >> 1])) / Math.log(1.25))}`);
        // the drawing VOCABULARY: every element signature the items draw, in any order or count (a count row with more
        // or fewer blanks, another table, a shuffled order is the same drawing; a times label, a circle, a third line is not)
        return [...new Set(out), ...[...vocab].sort()];
    };
    const q = { ...console };
    console.log = console.warn = console.error = console.info = console.debug = () => {};
    let r;
    try { r = pickDrawingVariants(candidates, sig, (o) => group[o] === 'layout'); } finally { Object.assign(console, q); }
    return {
        skill: key, hasCard, cards: plan.cards,
        roles: hasCard ? plan.roles : app.allRoles.slice(),
        rolesFrom: hasCard ? `card ${plan.cards.join(', ')}` : 'every buildSheet role (no signed card lists it)',
        variants: r.variants, same: r.same, all: candidates.length,
    };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const a = process.argv.slice(2);
    const get = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
    if (a.includes('--self-test')) {
        // pure grouping: a value equal to the defaults is dropped, two equal values keep the first, a page option is kept
        const S = { d: ['a'], x: ['a', 'b'], y: ['a', 'b'], z: ['a'], p: ['a'] };
        const c = ['x', 'y', 'z', 'p'].map((k) => ({ option: k === 'p' ? 'onePage' : 'o', value: k, opts: { k } }));
        const r = pickDrawingVariants(c, (o) => S[o ? o.k : 'd'], (o) => o === 'onePage');
        const ok = r.variants.map((v) => v.value).join(',') === 'x,p' && r.same.map((s) => `${s.value}:${s.as}`).join(',') === 'y:o=x,z:defaults';
        console.log(`ws-drawing-variants --self-test: ${ok ? 'OK (defaults-equal dropped, equal values merged, page option kept)' : `FAIL (${JSON.stringify(r)})`}`);
        process.exit(ok ? 0 : 1);
    }
    const root = resolve(get('--root') || process.env.MQ_ROOT || join(HERE, '..', '..'));
    const skills = (get('--skill') || '').split(',').filter(Boolean);
    const app = await loadApp(root);
    const out = [];
    for (const s of skills) out.push(await drawingVariantsFor(app, root, s, +(get('--items') || 6)));
    process.stdout.write(JSON.stringify(out) + '\n');
}
