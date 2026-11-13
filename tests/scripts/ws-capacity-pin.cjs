// ws-capacity-pin - CAPACITY-NO-DROP (lf-roles critic r1 R3, lead 2026-11-13): the number of items a page prints, per
// skill x role x size, never FALLS against the pinned before-page (follow_given_rule True or False? L fell 4 -> 3 when a
// role change made its frame wrap; nothing measured it). A rise, or a fall a ruling allows (--allow k), is reported, not failed.
//
//   node tests/scripts/ws-capacity-pin.cjs --write [--pin file]              # pin this tree (run on master)
//   node tests/scripts/ws-capacity-pin.cjs --check [--pin file] [--skills a:b,..] [--roles r,..] [--test-eq-ind]
//   SIZE-ORDER-OPT (critic divarray r1 D3): the pin's `sizeOrderOpts` option pages are measured at S/M/L; an option page
//     whose cells measure smaller at S must fit MORE at S (strict S > L), never the same page at every size.
//   --test-eq-ind (critic divarray r1 Q1, OFF by default pending the lead's ruling): the pin's `testEqOpts` option pages'
//     Test count must equal their Independent count on each support (TEST-EQ-IND; live for div_facts in the role code).
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
    const ruledSkills = [...new Set(Object.keys(ruled).filter((k) => !/ \{/.test(k)).map((k) => k.split(' ')[0]))];
    // A ruled page may name the skill's options after its size, as JSON ('cat:skill review S {"support":["touch"]}', lf-ops
    // 2026-11-13): it is measured with those options (a support page's count is not the default page's).
    const ruledOpts = Object.keys(ruled).map((k) => /^(\S+) (\S+) ([SML]) (\{.*\})$/.exec(k)).filter(Boolean)
        .map((m) => ({ key: m[0], skill: m[1], role: m[2], size: m[3], opts: JSON.parse(m[4]) }));
    const pinJson = has('check') && fs.existsSync(PIN) ? JSON.parse(fs.readFileSync(PIN, 'utf8')) : {};
    // SIZE-ORDER on option pages (critic divarray r1 D3): the ruled option pages were left out of SIZE-ORDER, so
    // mult_facts {support:array} printed the same count at S / M / L unnoticed. Each is measured at S/M/L and judged.
    const sizeOrderOpts = (has('check') ? (pinJson.sizeOrderOpts || []) : []);
    // TEST-EQ-IND (critic divarray r1 Q1, pending the lead's ruling): a fact skill's Test count follows its Independent
    // count on each support. OFF unless --test-eq-ind (it is live for div_facts in the role code; this generalises the
    // MEASURE to mult_facts behind a flag).
    const testEqOpts = (has('check') && has('test-eq-ind') ? (pinJson.testEqOpts || []) : []);
    const onlyFilter = list(arg('skills', ''));
    const inFilter = (sk) => !onlyFilter.length || onlyFilter.includes(sk);
    const skills = [...new Set([...(list(arg('skills', '')).length ? list(arg('skills', '')) : passed), ...(list(arg('skills', '')).length ? [] : ruledSkills)])];
    const app = await H.open({});
    const now = await app.page.evaluate(async ({ skills, ROLES, SIZES, ruledOpts, sizeOrderOpts, testEqOpts }) => {
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
        for (const j of ruledOpts) {
            const [cat, id] = j.skill.split(':');
            try {
                const r = await window.buildSheet({ role: j.role, sections: [{ skills: [{ categoryId: cat, skillId: id, opts: j.opts }], columns: 'auto' }], size: j.size, look: 'auto', paper: 'A4', seed: hash(`${cat}__${id}:${j.role}`) % 1000000, form: 'A', key: true, anchors: 'off' });
                const m = r.plan && r.plan.meta;
                out[j.key] = { items: m && Number.isFinite(Number(m.items)) ? Number(m.items) : (r.items || []).length, pages: r.pageCount, opts: true };
            } catch (e) { out[j.key] = { na: String((e && e.message) || e).slice(0, 80) }; }
        }
        // SIZE-ORDER option pages (D3) + TEST-EQ-IND option pages: each measured at S / M / L (+ Test for TEST-EQ)
        const probes = [
            ...sizeOrderOpts.map((x) => ({ ...x, role: x.role || 'independent' })),
            ...testEqOpts.flatMap((x) => [{ ...x, role: 'independent', eq: true }, { ...x, role: 'test', eq: true }]),
        ];
        for (const j of probes) {
            const [cat, id] = j.skill.split(':');
            for (const size of SIZES) {
                const key = `${j.eq ? 'EQ' : 'OPT'} ${j.skill} ${j.role} ${size} ${JSON.stringify(j.opts)}`;
                if (out[key]) continue;
                try {
                    const r = await window.buildSheet({ role: j.role, sections: [{ skills: [{ categoryId: cat, skillId: id, opts: j.opts }], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed: hash(`${cat}__${id}:${j.role}`) % 1000000, form: 'A', key: true, anchors: 'off' });
                    const m = r.plan && r.plan.meta;
                    out[key] = { items: m && Number.isFinite(Number(m.items)) ? Number(m.items) : (r.items || []).length, pages: r.pageCount, optProbe: true, skill: j.skill, role: j.role, size, opts: JSON.stringify(j.opts), eq: !!j.eq };
                } catch (e) { out[key] = { na: String((e && e.message) || e).slice(0, 80), optProbe: true }; }
            }
        }
        return out;
    }, { skills, ROLES, SIZES, ruledOpts, sizeOrderOpts, testEqOpts });
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
    for (const [k, v] of Object.entries(now)) { if (v.na || v.opts) continue; const m = /^(.*) ([SML])$/.exec(k); (groups[m[1]] = groups[m[1]] || {})[m[2]] = v.items; }
    for (const [g, z] of Object.entries(groups)) {
        if (z.S !== undefined && z.M !== undefined && z.S < z.M) order.push(`${g}: S ${z.S} < M ${z.M} items (SIZE-ORDER)`);
        if (z.M !== undefined && z.L !== undefined && z.M < z.L) order.push(`${g}: M ${z.M} < L ${z.L} items (SIZE-ORDER)`);
    }
    // SIZE-ORDER-OPT (critic divarray r1 D3): the ruled OPTION pages (a support ticked) were excluded from SIZE-ORDER, so
    // mult_facts {support:array} printed 10 / 10 / 10 at S / M / L unseen. An option page whose cells measure smaller at S
    // must fit MORE at S (strict S > L), never the same page at every size.
    const optGroups = {};
    for (const [k, v] of Object.entries(now)) {
        if (!v.optProbe || v.na || v.eq) continue;
        const m = /^OPT (\S+) (\S+) ([SML]) (\{.*\})$/.exec(k); if (!m) continue;
        const g = `${m[1]} ${m[2]} ${m[4]}`; (optGroups[g] = optGroups[g] || {})[m[3]] = v.items;
    }
    for (const [g, z] of Object.entries(optGroups)) {
        if (!inFilter(g.split(' ')[0])) continue;
        if (z.S !== undefined && z.M !== undefined && z.S < z.M) order.push(`${g}: S ${z.S} < M ${z.M} items (SIZE-ORDER-OPT)`);
        if (z.M !== undefined && z.L !== undefined && z.M < z.L) order.push(`${g}: M ${z.M} < L ${z.L} items (SIZE-ORDER-OPT)`);
        if (z.S !== undefined && z.L !== undefined && z.S <= z.L) order.push(`${g}: S ${z.S} not greater than L ${z.L} items - the option page is the same at every size (SIZE-ORDER-OPT, D3)`);
    }
    drops.push(...order);
    // TEST-EQ-IND (critic divarray r1 Q1; OFF unless --test-eq-ind, pending the lead's ruling): a fact skill's Test count
    // follows its Independent count on each support (live for div_facts in the role code; this measures it for mult_facts too).
    if (has('test-eq-ind')) {
        const indBy = {}, testBy = {};
        for (const [k, v] of Object.entries(now)) {
            if (!v.optProbe || !v.eq || v.na) continue;
            const m = /^EQ (\S+) (\S+) ([SML]) (\{.*\})$/.exec(k); if (!m) continue;
            const g = `${m[1]} ${m[4]} ${m[3]}`;
            (m[2] === 'test' ? testBy : indBy)[g] = v.items;
        }
        for (const g of Object.keys(indBy)) {
            if (!inFilter(g.split(' ')[0])) continue;
            if (testBy[g] !== undefined && testBy[g] !== indBy[g]) drops.push(`${g}: Test ${testBy[g]} != Independent ${indBy[g]} items (TEST-EQ-IND)`);
        }
    }
    for (const d of drops) console.log(`  FAIL ${d}`);
    for (const d of allowed) console.log(`  allowed ${d}`);
    for (const d of rises) console.log(`  rise ${d}`);
    console.log(drops.length ? `ws-capacity-pin: FAIL - ${drops.length} drop(s) in ${seen} pinned page(s)` : `ws-capacity-pin: OK (${seen} pinned page(s), ${rises.length} rise(s), ${allowed.length} allowed)`);
    process.exit(drops.length ? 1 : 0);
})();
