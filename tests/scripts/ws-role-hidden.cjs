// ws-role-hidden - ROLE-HIDDEN: an option value a signed card HIDES ON A ROLE is never dealt or drawn on that role
// (lead ruling 2026-11-13, chart_120: grid=whole / grid=rows are one chart to a page by design, so they stay offered on
// Independent, More practice and the simple print, and are hidden on Lesson, Guided and Test; on e1389d1f3 the whole
// chart overflowed the Lesson (OVERFLOW 18 / 24) and Guided (8-12) pages and printed one item a page on the Test (LONE-PAGE 3)).
//
//   node tests/scripts/ws-role-hidden.cjs --skill composing:hundreds_chart_fill[,composing:chart_to_120]
//   node tests/scripts/ws-role-hidden.cjs --card design/cards/chartwindow/card.json      # every skill the card covers
//   node tests/scripts/ws-role-hidden.cjs --self-test                                      # the card reader, no browser
//   [--sizes S,M,L] (default L)  [--seed N]   MQ_ROOT=<tree> renders another checkout (ws-backtest commit-pair rows)
//
// THE DECISIONS (generic; read from the cards of THIS tree, so a backtest judges an old app against today's ruling): every
// design/cards/*/card.json `decisions.options` entry with `"d": "hidden"` and a `roles` list is ROLE-SCOPED: the values
// are offered (another entry decides them for the panel) but the named roles must never deal them. A skill is covered
// when the entry's `skills` (else the card's `skills.include`) names it or names the host of its preset
// (js/modules/skill-presets.js).
// THE JUDGE (in the browser, through window.buildSheet, the same seed): for each skill x hidden role x hidden value x size
// the sheet built with {option: value} must be BYTE-IDENTICAL (pupil page and key) to the sheet built with the option's
// default, i.e. the role fell back and the value was never dealt. CONTROL: on one role that offers the value (independent)
// the two sheets must DIFFER, else the value changes nothing and the judge is blind (INCOMPLETE, never OK).
// Last line `ws-role-hidden: OK (...)` / `FAIL - n ...` / `NO-DECISIONS (...)` (exit 4, nothing to check); exit 1 on FAIL.
const fs = require('fs');
const path = require('path');

const HERE = path.resolve(__dirname, '..', '..');
const TOOL = 'ws-role-hidden';
const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const list = (v) => String(v || '').split(',').map((s) => s.trim()).filter(Boolean);

/** Role-scoped hidden decisions of one card.json: [{card, option, values, roles, skills|null}]. Pure. */
function roleHiddenOf(cfg, file = '') {
    const out = [];
    for (const e of ((cfg && cfg.decisions) || {}).options || []) {
        if (e.d !== 'hidden' || !Array.isArray(e.roles) || !e.roles.length) continue;
        const option = e.option || String(e.key || '').split('=')[0];
        const values = e.option ? (e.values || []).map(String) : [String(e.key || '').split('=').slice(1).join('=')];
        out.push({ card: file, option, values, roles: e.roles.map((r) => String(r).replace(/^role:/, '')), skills: e.skills || (cfg.skills && cfg.skills.include) || [] });
    }
    return out;
}
/** 'cat:preset' -> 'cat:host' from skill-presets.js text. Pure. */
function presetHosts(text) {
    const m = new Map();
    for (const x of String(text).matchAll(/'([a-z0-9_]+):([a-z0-9_]+)':\s*\{\s*skill:\s*'([a-z0-9_]+)'/g)) m.set(`${x[1]}:${x[2]}`, `${x[1]}:${x[3]}`);
    return m;
}
function covers(dec, key, hosts) { return dec.skills.includes(key) || (hosts.has(key) && dec.skills.includes(hosts.get(key))); }

if (has('self-test')) {
    const fails = [];
    const t = (c, m) => { if (!c) fails.push(m); };
    const cfg = { skills: { include: ['a:b'] }, decisions: { options: [
        { option: 'grid', values: ['window', 'rows', 'whole'], d: 'offered' },
        { option: 'grid', values: ['rows', 'whole'], d: 'hidden', roles: ['role:lesson', 'test'] },
        { key: 'x=1', d: 'hidden' }] } };
    const d = roleHiddenOf(cfg, 'c');
    t(d.length === 1, 'only the role-scoped hidden entry is read');
    t(d[0] && d[0].roles.join() === 'lesson,test' && d[0].values.join() === 'rows,whole' && d[0].skills.join() === 'a:b', 'roles, values and the card skills');
    const h = presetHosts("    'composing:chart_to_120': { skill: 'hundreds_chart_fill', opts: { band: 120 } },");
    t(h.get('composing:chart_to_120') === 'composing:hundreds_chart_fill', 'preset host');
    t(covers(d[0], 'a:b', h) && !covers(d[0], 'a:c', h), 'covers');
    for (const f of fails) console.log(`  self-test FAIL: ${f}`);
    console.log(fails.length ? `${TOOL}: FAIL - self-test (${fails.length})` : `${TOOL}: OK (self-test, 4 cases)`);
    process.exit(fails.length ? 1 : 0);
}

(async () => {
    const cardsDir = path.join(HERE, 'design', 'cards');
    const files = has('card') ? [path.resolve(HERE, arg('card'))]
        : fs.readdirSync(cardsDir).map((d) => path.join(cardsDir, d, 'card.json')).filter((f) => fs.existsSync(f));
    const decs = files.flatMap((f) => roleHiddenOf(JSON.parse(fs.readFileSync(f, 'utf8')), path.relative(HERE, f)));
    const H = require('../lib/ws-harness.cjs');
    const presetFile = path.join(H.ROOT, 'js', 'modules', 'skill-presets.js');
    const hosts = presetHosts(fs.existsSync(presetFile) ? fs.readFileSync(presetFile, 'utf8') : '');
    let keys = list(arg('skill', arg('skills', '')));
    if (!keys.length) keys = [...new Set(decs.flatMap((d) => d.skills))];
    const jobs = [];
    for (const key of keys) for (const d of decs) if (covers(d, key, hosts)) jobs.push({ key, ...d });
    if (!jobs.length) { console.log(`${TOOL}: NO-DECISIONS (no card hides an option value on a role for ${keys.join(', ') || 'any skill'}; nothing checked)`); process.exit(4); }
    const sizes = list(arg('sizes', 'L'));
    const seed = Number(arg('seed', '424242'));
    const app = await H.open({});
    let res;
    try {
        res = await app.page.evaluate(async ({ jobs, sizes, seed }) => {
            const so = await import('/js/modules/skill-options.js');
            const out = [];
            const build = async (cat, id, role, size, opts) => {
                const r = await window.buildSheet({ role, sections: [{ skills: [{ categoryId: cat, skillId: id, opts }], columns: 'auto' }], size, look: 'auto', paper: 'A4', seed, form: 'A', key: true, anchors: 'off' });
                return { html: `${r.pupilHtml || ''}\n<!--key-->\n${r.keyHtml || ''}`, pages: r.pageCount };
            };
            for (const j of jobs) {
                const [cat, id] = j.key.split(':');
                const def = (so.optionsFor(cat, id) || []).find((o) => o && o.id === j.option);
                if (!def) { out.push({ ...j, verdict: 'FAIL', msg: `the skill has no option "${j.option}"` }); continue; }
                const dflt = def.default;
                for (const v of j.values) {
                    if (String(v) === String(dflt)) { out.push({ key: j.key, role: '-', value: v, verdict: 'FAIL', msg: `the hidden value is the option's default (${dflt}): a role cannot fall back from it` }); continue; }
                    for (const size of sizes) {
                        // control: a role that offers the value draws something else (else the judge is blind)
                        try {
                            const a = await build(cat, id, 'independent', size, { [j.option]: v });
                            const b = await build(cat, id, 'independent', size, { [j.option]: dflt });
                            out.push({ key: j.key, role: 'independent (control)', value: v, size, verdict: a.html !== b.html ? 'ok' : 'INCOMPLETE', msg: a.html !== b.html ? `offered: draws its own page (${a.pages} vs ${b.pages} page(s))` : `${j.option}=${v} draws the same page as ${dflt}: the judge cannot see the value` });
                        } catch (e) { out.push({ key: j.key, role: 'independent (control)', value: v, size, verdict: 'INCOMPLETE', msg: `threw: ${String(e && e.message || e).slice(0, 100)}` }); }
                        for (const role of j.roles) {
                            try {
                                const a = await build(cat, id, role, size, { [j.option]: v });
                                const b = await build(cat, id, role, size, { [j.option]: dflt });
                                const same = a.html === b.html;
                                out.push({ key: j.key, role, value: v, size, verdict: same ? 'ok' : 'FAIL', msg: same ? `falls back to ${j.option}=${dflt} (identical page and key)` : `DEALT: ${j.option}=${v} draws its own page on ${role} (${a.pages} page(s) vs ${b.pages} with ${dflt}); the card hides it there (${j.card})` });
                            } catch (e) { out.push({ key: j.key, role, value: v, size, verdict: 'FAIL', msg: `threw: ${String(e && e.message || e).slice(0, 100)}` }); }
                        }
                    }
                }
            }
            return out;
        }, { jobs, sizes, seed });
    } finally { await app.close(); }
    for (const r of res) console.log(`  ${r.verdict === 'ok' ? 'ok  ' : r.verdict.padEnd(4)} ${r.key.padEnd(34)} ${String(r.role).padEnd(22)} ${String(r.value).padEnd(7)} ${r.size || ''} ${r.msg}`);
    const bad = res.filter((r) => r.verdict === 'FAIL');
    const inc = res.filter((r) => r.verdict === 'INCOMPLETE');
    const judged = res.filter((r) => !/control/.test(r.role)).length;
    if (bad.length) { console.log(`${TOOL}: FAIL - ${bad.length} hidden value(s) dealt on a role that hides them (${judged} judged, ${keys.length} skill(s))`); process.exit(1); }
    if (inc.length) { console.log(`${TOOL}: INCOMPLETE - ${inc.length} control(s) blind (${judged} judged)`); process.exit(2); }
    console.log(`${TOOL}: OK (${judged} role x value x size page(s) fall back, ${res.length - judged} control(s) draw the value; ${keys.length} skill(s))`);
    process.exit(0);
})().catch((e) => { console.log(`${TOOL}: ${e && e.stack || e}`); console.log(`${TOOL}: FAIL - error`); process.exit(2); });
