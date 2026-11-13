// ws-capacity-pin - CAPACITY-NO-DROP (lf-roles critic r1 R3, lead 2026-11-13): the number of items a page prints, per
// skill x role x size, never FALLS against the pinned before-page (follow_given_rule True or False? L fell 4 -> 3 when a
// role change made its frame wrap; nothing measured it). A rise, or a fall a ruling allows (--allow k), is reported, not failed.
//
//   node tests/scripts/ws-capacity-pin.cjs --write [--pin file]              # pin this tree (run on master)
//   node tests/scripts/ws-capacity-pin.cjs --check [--pin file] [--skills a:b,..] [--roles r,..]
//   default pin design/audit/baselines/capacity.json; skills: js/modules/redesign-passed.js; roles: the shared thinking /
//   practice roles; sizes S,M,L; seed: ws-cell-checks' (fnv of "cat__skill:role"). MQ_ROOT=<tree> measures another checkout.
// Last line `ws-capacity-pin: OK (...)` / `FAIL - n drop(s)`; exit 1 on FAIL.
const fs = require('fs');
const path = require('path');
const H = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);
const PIN = path.resolve(arg('pin', path.join(__dirname, '..', '..', 'design', 'audit', 'baselines', 'capacity.json')));
const ROLES = list(arg('roles', 'true-false,reason-it,error-analysis,pre-skill-check,review,test,independent,more-practice'));
const SIZES = list(arg('sizes', 'S,M,L'));
const ALLOW = new Set(list(arg('allow', '')));

(async () => {
    if (!has('write') && !has('check')) { console.log('usage: --write | --check [--pin f] [--skills ..] [--roles ..]'); console.log('ws-capacity-pin: FAIL (usage)'); process.exit(2); }
    const passed = [...new Set((fs.readFileSync(path.join(H.ROOT, 'js/modules/redesign-passed.js'), 'utf8').match(/'[a-z_]+:[a-z_0-9]+'/g) || []).map((x) => x.slice(1, -1)))];
    // RULED capacities (lead rulings): a page whose items are taller than the page allows is pinned by design with its reason; the
    // critic treats it as by design. Measured when the skill is in this tree (lf-algebra's skills join on their merge).
    const ruled = has('check') && fs.existsSync(PIN) ? (JSON.parse(fs.readFileSync(PIN, 'utf8')).ruled || {}) : {};
    const ruledSkills = [...new Set(Object.keys(ruled).map((k) => k.split(' ')[0]))];
    const skills = [...new Set([...(list(arg('skills', '')).length ? list(arg('skills', '')) : passed), ...(list(arg('skills', '')).length ? [] : ruledSkills)])];
    const app = await H.open({});
    const now = await app.page.evaluate(async ({ skills, ROLES, SIZES }) => {
        const hash = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
        const out = {};
        for (const k of skills) for (const role of ROLES) for (const size of SIZES) {
            const [cat, id] = k.split(':');
            try {
                const r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: cat, skillId: id }], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed: hash(`${cat}__${id}:${role}`) % 1000000, form: 'A', key: true, anchors: 'off' });
                const m = r.plan && r.plan.meta;
                const items = m && Number.isFinite(Number(m.items)) ? Number(m.items) : (r.items || []).length;
                out[`${k} ${role} ${size}`] = { items, pages: r.pageCount };
            } catch (e) { out[`${k} ${role} ${size}`] = { na: String((e && e.message) || e).slice(0, 80) }; }
        }
        return out;
    }, { skills, ROLES, SIZES });
    await app.close();
    if (has('write')) {
        fs.mkdirSync(path.dirname(PIN), { recursive: true });
        fs.writeFileSync(PIN, JSON.stringify({ note: 'ws-capacity-pin: items a page per skill x role x size (CAPACITY-NO-DROP); rewrite only on master or with a ruling', written: new Date().toISOString().slice(0, 10), pages: now }, null, 1) + '\n');
        console.log(`ws-capacity-pin: OK (wrote ${Object.keys(now).length} pages to ${path.relative(process.cwd(), PIN)})`);
        process.exit(0);
    }
    const pin = JSON.parse(fs.readFileSync(PIN, 'utf8')).pages || {};
    const drops = [], rises = [], allowed = [];
    let seen = 0;
    for (const [k, v] of Object.entries(now)) {
        const b = pin[k];
        if (!b || b.na || v.na || ruled[k]) continue;
        seen++;
        if (v.items < b.items) (ALLOW.has(k) ? allowed : drops).push(`${k}: ${b.items} -> ${v.items} items (${b.pages} -> ${v.pages} page(s))`);
        else if (v.items > b.items) rises.push(`${k}: ${b.items} -> ${v.items}`);
    }
    // a ruled page must print at least its ruled count; a page not in this tree is noted, never failed
    const ruledNotes = [];
    for (const [k, r] of Object.entries(ruled)) {
        const v = now[k];
        if (!v || v.na) { ruledNotes.push(`${k}: not in this tree (ruled ${r.items}: ${r.reason})`); continue; }
        if (v.items < r.items) drops.push(`${k}: ${v.items} items, under its RULED ${r.items} (${r.reason})`);
        else ruledNotes.push(`${k}: ${v.items} items (ruled ${r.items}, by design: ${r.reason})`);
    }
    for (const n of ruledNotes) console.log(`  ruled ${n}`);
    // SIZE-ORDER (critic r2 N2, "Size S ignored" L1): a smaller size never prints FEWER items than a larger one (S >= M >= L)
    const order = [];
    const groups = {};
    for (const [k, v] of Object.entries(now)) { if (v.na) continue; const m = /^(.*) ([SML])$/.exec(k); (groups[m[1]] = groups[m[1]] || {})[m[2]] = v.items; }
    for (const [g, z] of Object.entries(groups)) {
        if (z.S !== undefined && z.M !== undefined && z.S < z.M) order.push(`${g}: S ${z.S} < M ${z.M} items (SIZE-ORDER)`);
        if (z.M !== undefined && z.L !== undefined && z.M < z.L) order.push(`${g}: M ${z.M} < L ${z.L} items (SIZE-ORDER)`);
    }
    drops.push(...order);
    for (const d of drops) console.log(`  FAIL ${d}`);
    for (const d of allowed) console.log(`  allowed ${d}`);
    for (const d of rises) console.log(`  rise ${d}`);
    console.log(drops.length ? `ws-capacity-pin: FAIL - ${drops.length} drop(s) in ${seen} pinned page(s)` : `ws-capacity-pin: OK (${seen} pinned page(s), ${rises.length} rise(s), ${allowed.length} allowed)`);
    process.exit(drops.length ? 1 : 0);
})();
