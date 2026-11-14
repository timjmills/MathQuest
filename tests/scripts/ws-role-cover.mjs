#!/usr/bin/env node
// ws-role-cover — print-lint, empty-band and raster-fit on EVERY page role a skill offers, at M and L, AND under every option
// value that changes the drawing (lf-ops critic cbt r2, root cause of the round loss: precritic --skill linted only the
// Independent page at defaults; six of count_by_tables' 13 offered roles were never machine-gated and three of them - E3
// Scripted Model L, E5 Opener, E6 Error analysis - were already red in plain ws-print-lint).
//
//   node tests/scripts/ws-role-cover.mjs --skill multiplication:count_by_tables --plan        # the plan + its estimate, no browser
//   node tests/scripts/ws-role-cover.mjs --skill a:b [--shard 1/2] [--out dir]               # run (inside ONE browser slot)
//   node tests/scripts/ws-role-cover.mjs --skill a:b --tools lint --roles opener,error-analysis --defaults-only
//   node tests/scripts/ws-role-cover.mjs --root <tree> ...                                     # plan and run another checkout
//   node tests/scripts/ws-role-cover.mjs --self-test                                          # the plan, shards, pins (no browser)
//
// THE PLAN (tests/lib/ws-drawing-variants.mjs): roles = the signed card's offered roles (ws-card-plan), else EVERY buildSheet role
// (CLAUDE.md: any skill on any page type); variants = the card's offered option values (else the skill's own set / enum / bool
// values) that CHANGE THE DRAWING (another drawing vocabulary or size class on the same seeded items, or a page option), one
// value per distinct drawing. Units = role x size (M, L) at the defaults + role x size under each variant. A unit another
// precritic --skill row already renders is left out, so nothing renders twice (--with-covered keeps them):
//   lint    independent and lesson at M and L, defaults (print-lint-kit, print-lint-kit-M, print-lint-lesson-L / -M)
//   band    the card's roles (no card: ws-empty-band's default roles) at M and L, defaults (the empty-band row)
//   raster  scripted-model and guided at M and L, defaults (the raster-fit row)
// RENDERS: lint is ONE ws-print-lint --jobs process a shard (one browser start, one document a unit); band and raster are one
// ws-empty-band / ws-grade-render --raster-fit process per (skill, variant) group. The three tools measure different things
// in different documents (DOM under print emulation, the measured cells, the printed PDF), so each renders its own unit; no
// unit renders twice for one tool. This tool holds NO browser slot itself: precritic runs each shard through
// /tmp/mq-browser-run.sh, and the tools inside run in that slot (a nested runner call would wait on itself).
// PINS: a lint document at the defaults is judged against the size's print-lint pin (design/audit/baselines/print-lint.json,
// print-lint.M.json; id cat:skill#role) - a (lint, rule) count may not rise; a document the pin does not hold, and every
// variant document, must be clean. ws-empty-band reads its own pin. A role the card offers that buildSheet cannot compose
// is a FAIL (lint NA on a card role); with no card it is a note.
// SHARDS: --shard i/n takes every n-th (skill, variant) group by estimated cost (greedy, deterministic).
// Prints `  FAIL <tool> <unit>: <finding>` lines and `ws-role-cover: OK|FAIL (...)`; exit 0 / 1 (2 usage).
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TOOL = 'ws-role-cover';
const HERE = dirname(fileURLToPath(import.meta.url));
const A = process.argv.slice(2);
const has = (f) => A.includes(`--${f}`);
const get = (f, d = null) => { const i = A.indexOf(`--${f}`); return i >= 0 && i + 1 < A.length ? A[i + 1] : d; };
const list = (f) => (get(f) || '').split(',').map((s) => s.trim()).filter(Boolean);

export const SIZES = ['M', 'L'];
// what the other precritic --skill rows already render at the defaults (kept in step with ws-precritic.cjs buildPlan)
export const COVERED = {
    lint: (role, size) => ['independent', 'lesson'].includes(role) && SIZES.includes(size),
    band: (role, size, ctx) => (ctx.hasCard ? ctx.cardRoles : EB_DEFAULT_ROLES).includes(role) && SIZES.includes(size),
    raster: (role, size) => ['scripted-model', 'guided'].includes(role) && SIZES.includes(size),
};
export const EB_DEFAULT_ROLES = ['independent', 'more-practice', 'guided', 'error-analysis', 'review', 'test', 'true-false', 'reason-it', 'lesson'];
// seconds, measured on count_by_tables in this container (2026-11-14, see design/status/lf-checks.md); a planning estimate only
export const COST = { start: 12, lint: 5, band: 4, raster: 9 };
export const TOOLS = ['lint', 'band', 'raster'];

/** The units of one skill's plan. Pure. p = ws-drawing-variants' record; o = {tools, roles?, sizes, defaultsOnly, withCovered}. */
export function unitsOf(p, o) {
    const ctx = { hasCard: p.hasCard, cardRoles: p.roles };
    const roles = o.roles && o.roles.length ? p.roles.filter((r) => o.roles.includes(r)).concat(o.roles.filter((r) => !p.roles.includes(r))) : p.roles;
    const groups = [];
    // --variants opt=value,..: only those variants (and no defaults group), for a cheap focused run of one escape
    const pick = o.variants && o.variants.length ? p.variants.filter((v) => o.variants.includes(`${v.option}=${v.value}`)) : null;
    const vs = pick ? pick : [null, ...(o.defaultsOnly ? [] : p.variants)];
    for (const v of vs) {
        const g = { skill: p.skill, variant: v ? `${v.option}=${v.value}` : null, opts: v ? v.opts : null, units: {} };
        for (const t of o.tools) {
            g.units[t] = [];
            for (const role of roles) for (const size of o.sizes) {
                if (!v && !o.withCovered && COVERED[t](role, size, ctx)) continue;
                g.units[t].push({ role, size });
            }
        }
        if (Object.values(g.units).some((u) => u.length)) groups.push(g);
    }
    return groups;
}
/** (critic roles r1 D1) print-lint runs L-SUPPORT (S2: the answer zone, a support showing the answer) only with --supports, so a
 *  support variant lints with --supports <its values>, not --opts alone (which draws the support and never checks it). Pure. */
export function supportArgs(opts) {
    const v = opts && opts.support;
    const vals = (Array.isArray(v) ? v : v ? [v] : []).map(String).filter((x) => x && x !== 'none');
    return vals.length ? ['--supports', vals.join(',')] : [];
}
/** Estimated seconds of a group. Pure. */
export function costOf(g) {
    let s = 0;
    for (const t of TOOLS) { const n = (g.units[t] || []).length; if (n) s += COST[t] * n + (t === 'lint' ? 0 : COST.start); }
    return s;
}
/** Greedy, deterministic shards: the costliest group first onto the lightest shard. Pure. */
export function shard(groups, n) {
    const out = Array.from({ length: n }, () => ({ groups: [], cost: 0 }));
    const order = groups.map((g, i) => ({ g, i, c: costOf(g) })).sort((a, b) => b.c - a.c || a.i - b.i);
    for (const x of order) { const s = out.reduce((m, s2, k) => (s2.cost < out[m].cost ? k : m), 0); out[s].groups.push(x.g); out[s].cost += x.c; }
    for (const s of out) { if (s.groups.some((g) => (g.units.lint || []).length)) s.cost += COST.start; s.groups.sort((a, b) => groups.indexOf(a) - groups.indexOf(b)); }
    return out;
}
export const docId = (g, u) => `${g.skill}#${u.role}@${u.size}${g.variant ? `~${g.variant}` : ''}`;
/** The pin id of a lint document: defaults only (variants are never pinned). Pure. */
export const pinId = (g, u) => (g.variant ? null : u.role === 'independent' ? g.skill : `${g.skill}#${u.role}`);
/** (lint rule) counts above the pin. Pure. doc = print-lint --json document; pin = a pinned document or null. */
export function rises(doc, pin) {
    const count = (fs) => { const m = new Map(); for (const f of fs || []) if (!f.waived) { const k = `${f.lint} ${f.rule}`; m.set(k, (m.get(k) || 0) + 1); } return m; };
    const a = count(doc.findings), b = count(pin && pin.findings);
    const out = [];
    for (const [k, n] of a) if (n > (b.get(k) || 0)) out.push({ k, n, pinned: b.get(k) || 0, ex: (doc.findings.find((f) => `${f.lint} ${f.rule}` === k) || {}).msg || '' });
    return out;
}

/** ws-empty-band's failing rules with their detail lines: `RULE FAIL n` then indented lines -> 'RULE: detail'. Pure. */
export function bandFindings(out) {
    const res = [];
    let rule = null;
    for (const l of String(out).split('\n')) {
        const m = /^((?:EB|MOD)-[A-Z]+)\s+(PASS|FAIL)\b/.exec(l);
        if (m) { rule = m[2] === 'FAIL' ? m[1] : null; continue; }
        if (rule && /^\s{2,}\S/.test(l)) res.push(`${rule} ${l.trim()}`);
        else if (!/^\s/.test(l)) rule = null;
    }
    return res;
}

function run(cmd, args, cwd, logFile) {
    return new Promise((res) => {
        const ch = spawn(cmd, args, { cwd, env: { ...process.env, MQ_ROOT: cwd }, stdio: ['ignore', 'pipe', 'pipe'] });
        let out = '';
        ch.stdout.on('data', (d) => { out += d; }); ch.stderr.on('data', (d) => { out += d; });
        ch.on('close', (code) => { if (logFile) writeFileSync(logFile, out); res({ code, out }); });
    });
}
const verdict = (out, name) => { const m = [...String(out).matchAll(new RegExp(`^${name}(?: --[\\w-]+)*: (OK|FAIL|WOULD FAIL)\\b.*$`, 'gm'))]; return m.length ? m[m.length - 1] : null; };

async function selfTest() {
    const bad = [];
    const eq = (n, a, b) => { if (JSON.stringify(a) !== JSON.stringify(b)) bad.push(`${n}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`); };
    const p = { skill: 'a:b', hasCard: true, roles: ['independent', 'opener', 'scripted-model', 'lesson'], variants: [{ option: 'x', value: '1', opts: { x: 1 } }] };
    const g = unitsOf(p, { tools: TOOLS, sizes: SIZES });
    // defaults: lint leaves out independent / lesson (already on precritic's path), keeps opener + scripted-model at M and L
    eq('lint defaults', g[0].units.lint.map((u) => `${u.role}@${u.size}`), ['opener@M', 'opener@L', 'scripted-model@M', 'scripted-model@L']);
    eq('band defaults (card roles already in the empty-band row)', g[0].units.band, []);
    eq('raster defaults', g[0].units.raster.map((u) => u.role), ['independent', 'independent', 'opener', 'opener', 'lesson', 'lesson']);
    eq('variant: every role x size, every tool', [g[1].variant, g[1].units.lint.length, g[1].units.band.length, g[1].units.raster.length], ['x=1', 8, 8, 8]);
    const nc = unitsOf({ ...p, hasCard: false, roles: ['independent', 'opener', 'stretch'] , variants: [] }, { tools: ['band'], sizes: SIZES });
    eq('no card: band covers what ws-empty-band\'s default roles leave', nc[0].units.band.map((u) => u.role), ['opener', 'opener', 'stretch', 'stretch']);
    eq('--with-covered keeps them', unitsOf(p, { tools: ['lint'], sizes: SIZES, withCovered: true, defaultsOnly: true })[0].units.lint.length, 8);
    eq('--roles narrows', unitsOf(p, { tools: ['lint'], sizes: ['L'], roles: ['opener'], defaultsOnly: true })[0].units.lint.map((u) => u.role), ['opener']);
    const sh = shard([...g, ...g.map((x) => ({ ...x, variant: 'y' }))], 2);
    eq('shards hold every group once', sh.reduce((n, s) => n + s.groups.length, 0), 4);
    eq('pin ids', [pinId(g[0], { role: 'independent' }), pinId(g[0], { role: 'opener' }), pinId(g[1], { role: 'opener' })], ['a:b', 'a:b#opener', null]);
    const F = (lint, rule) => ({ lint, rule, msg: 'm' });
    eq('ratchet: a pinned count holds, a rise fails', rises({ findings: [F('L-INK', 'CL40-INK'), F('L-INK', 'CL40-INK'), F('L-KEY', 'AK-2')] }, { findings: [F('L-INK', 'CL40-INK'), F('L-INK', 'CL40-INK')] }).map((r) => r.k), ['L-KEY AK-2']);
    eq('ratchet: unpinned must be clean', rises({ findings: [F('L-TOPSTART', 'CL-4b')] }, null).length, 1);
    const PT = '  [browser] x — tests/scripts/mq-browser-run.sh node tests/scripts/ws-role-cover.mjs --skill a:b --shard 1/1\nws-precritic role cover: a:b 3 roles (card c; roles=independent,opener,lesson) + 0 drawing variant(s)\nws-precritic role cover size: 4 print-lint + 0 empty-band + 4 raster-fit unit(s) in 1 shard(s); est 1.2 min of slot time';
    eq('plan-check: planned', planCheck(PT, ['a:b'], ['opener']), []);
    eq('plan-check: a role off the plan, the old plan', [planCheck(PT, ['a:b'], ['scripted-model']).length, planCheck('  [browser] ws-print-lint --roles lesson a:b', ['a:b'], ['opener']).length], [1, 3]);
    eq('band findings: only FAIL rules, with their detail', bandFindings('EB-BAND  PASS\nEB-VOCAB FAIL 1\n   a:b lesson M p2 vocab cell 1: 38 %\nEB-PAGE  PASS\n(1 skill(s))\nws-empty-band: FAIL (1)'), ['EB-VOCAB a:b lesson M p2 vocab cell 1: 38 %']);
    // (critic roles r1 D1) the plan holds a named variant; --variants focuses a run on it
    const PV = 'ws-precritic role cover: a:b 3 roles (card c; roles=independent,guided) + 2 drawing variant(s) of 9 offered value(s) [notation=across, support=frame]';
    eq('plan-check: variant planned / missing', [planCheck(PV, ['a:b'], [], ['support=frame']).length, planCheck(PV, ['a:b'], [], ['support=tile']).length, planCheck(PV.replace(', support=frame', ''), ['a:b'], [], ['support=frame']).length], [2, 3, 3]);   // 2 = this snippet has no row and no size line
    eq('--variants focuses', unitsOf({ ...p, variants: [{ option: 'x', value: '1' }, { option: 's', value: 'frame' }] }, { tools: ['lint'], sizes: ['L'], roles: ['opener'], variants: ['s=frame'] }).map((x) => `${x.variant}:${x.units.lint.length}`), ['s=frame:1']);
    eq('support variant lints with --supports', [supportArgs({ support: ['frame'] }), supportArgs({ support: ['touchall', 'tile'] }), supportArgs({ notation: ['across'] }), supportArgs(null)], [['--supports', 'frame'], ['--supports', 'touchall,tile'], [], []]);
    // (critic roles r1 D1, live) add_facts support=frame is drawn by buildSheet, not the generator: it must be a variant
    try {
        const DV = await import(pathToFileURL(join(HERE, '..', 'lib', 'ws-drawing-variants.mjs')).href);
        const root = resolve(join(HERE, '..', '..'));
        const r = await DV.drawingVariantsFor(await DV.loadApp(root), root, 'addition:add_facts');
        eq('live: add_facts support=frame is a drawing variant', r.variants.some((v) => v.option === 'support' && v.value === 'frame'), true);
    } catch (e) { bad.push(`live add_facts: ${e.message}`); }
    console.log(`${TOOL} --self-test: ${bad.length ? `FAIL (${bad.length})` : 'OK (18 cases)'}`);
    for (const b of bad) console.log(`  - ${b}`);
    return bad.length ? 1 : 0;
}

/** --plan-check: does a ws-precritic --dry-run text (stdin) plan the role cover of `skills` on `roles`? Pure. -> [missing] */
export function planCheck(text, skills, roles, variants = []) {
    const miss = [];
    // (critic roles r1 D1) a variant the plan must hold, e.g. support=frame: a buildSheet-drawn option is a drawing variant
    for (const k of skills) for (const v of variants) {
        const line = String(text).split('\n').find((l) => / role cover: /.test(l) && l.includes(k)) || '';
        const seg = line.slice(line.indexOf(k)).split(/; [a-z_]+:[a-z_0-9]+ \d+ roles/)[0];
        if (!new RegExp(`[\\[ ,]${v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[,\\]]`).test(seg)) miss.push(`${k}: variant ${v} not in the role cover`);
    }
    for (const k of skills) {
        if (!String(text).split('\n').some((l) => l.includes('tests/scripts/ws-role-cover.') && l.includes(k))) miss.push(`${k}: no ws-role-cover row`);
        const m = new RegExp(`role cover: .*?${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')} \\d+ roles \\([^\\n]*?roles=([^;)\\s]+)`).exec(text);
        const have = m ? m[1].split(',') : [];
        for (const r of roles) if (!have.includes(r)) miss.push(`${k}: role ${r} not in the role cover`);
    }
    if (!/role cover size: [1-9]\d* print-lint \+ \d+ empty-band \+ [1-9]\d* raster-fit unit\(s\) in \d+ shard\(s\); est [\d.]+ min/.test(text)) miss.push('no "role cover size: ... est N min" line');
    return miss;
}

async function main() {
    if (has('self-test')) process.exit(await selfTest());
    if (has('plan-check')) {
        // (backtest precritic-role-cover-plan) node tests/scripts/ws-precritic.cjs --skill X --dry-run | ws-role-cover --plan-check --skill X --roles r,..
        let t = ''; for await (const c of process.stdin) t += c;
        const miss = planCheck(t, list('skill'), list('roles'), list('variant'));
        console.log(`${TOOL} --plan-check: ${miss.length ? `FAIL (${miss.join('; ')})` : `OK (${list('skill').join(', ')}: ${list('roles').join(', ') || 'the plan'} under print-lint, empty-band and raster-fit at M and L)`}`);
        process.exitCode = miss.length ? 1 : 0;
        return;
    }
    const root = resolve(get('root') || process.env.MQ_ROOT || join(HERE, '..', '..'));
    const skills = list('skill');
    if (!skills.length) { console.log(`usage: ${TOOL} --skill cat:skill[,..] [--plan] [--shard i/n] [--tools lint,band,raster] [--roles r,..] [--sizes M,L] [--defaults-only] [--with-covered] [--out dir] [--root dir] [--eb-args "--vocab-ink --page-fill"] | --self-test`); console.log(`${TOOL}: FAIL (usage)`); process.exit(2); }
    const tools = list('tools').length ? list('tools') : TOOLS;
    if (tools.some((t) => !TOOLS.includes(t))) { console.log(`${TOOL}: FAIL (usage: --tools takes ${TOOLS.join(',')})`); process.exit(2); }
    const sizes = list('sizes').length ? list('sizes') : SIZES;
    const DV = await import(pathToFileURL(join(HERE, '..', 'lib', 'ws-drawing-variants.mjs')).href);
    const loadApp = DV.loadApp;
    const app = await loadApp(root);
    const plans = [];
    for (const k of skills) plans.push(await DV.drawingVariantsFor(app, root, k));
    const o = { tools, sizes, roles: list('roles'), variants: list('variants'), defaultsOnly: has('defaults-only'), withCovered: has('with-covered') };
    const groups = plans.flatMap((p) => unitsOf(p, o));
    const [si, sn] = (get('shard') || '1/1').split('/').map(Number);
    if (!(sn >= 1 && si >= 1 && si <= sn)) { console.log(`${TOOL}: FAIL (usage: --shard i/n)`); process.exit(2); }
    const shards = shard(groups, sn);
    const mine = shards[si - 1];
    const n = (gs, t) => gs.reduce((s, g) => s + (g.units[t] || []).length, 0);
    const total = shards.reduce((s, x) => s + x.cost, 0);
    if (has('plan')) {
        const out = {
            skills: plans.map((p) => ({ skill: p.skill, roles: p.roles.length, roleList: p.roles, rolesFrom: p.rolesFrom, variants: p.variants.map((v) => `${v.option}=${v.value}`), sameAs: p.same.length, candidates: p.all })),
            units: Object.fromEntries(tools.map((t) => [t, n(groups, t)])), groups: groups.length,
            shards: shards.map((s) => ({ groups: s.groups.length, units: Object.fromEntries(tools.map((t) => [t, n(s.groups, t)])), estMin: +(s.cost / 60).toFixed(1) })),
            estMin: +(total / 60).toFixed(1), wallMin: +(Math.max(...shards.map((s) => s.cost), total / 2) / 60).toFixed(1),   // two browser slots
        };
        if (has('json')) { process.stdout.write(JSON.stringify(out) + '\n'); return; }
        for (const p of out.skills) console.log(`${p.skill}: ${p.roles} roles (${p.rolesFrom}); ${p.variants.length} drawing variant(s) of ${p.candidates} offered value(s): ${p.variants.join(', ') || 'none'}`);
        console.log(`units: ${tools.map((t) => `${t} ${out.units[t]}`).join(', ')}; ${groups.length} group(s); ${sn} shard(s): ${out.shards.map((s, i) => `#${i + 1} ~${s.estMin} min`).join(', ')}`);
        console.log(`${TOOL}: OK (plan: ${tools.map((t) => `${out.units[t]} ${t}`).join(' + ')} units, est ${out.estMin} min of slot time, ~${out.wallMin} min wall on two slots, ${sn} shard(s))`);
        return;
    }
    const outDir = resolve(get('out') || join('/tmp', 'mq-role-cover', `${Date.now()}-${si}of${sn}`));
    mkdirSync(outDir, { recursive: true });
    const t0 = Date.now();
    const fails = [], notes = [], done = { lint: 0, band: 0, raster: 0 };
    const S = (p) => join(root, 'tests', 'scripts', p);
    const planOf = Object.fromEntries(plans.map((p) => [p.skill, p]));
    console.log(`${TOOL}: shard ${si}/${sn} of ${groups.length} group(s) on ${root}: ${tools.map((t) => `${t} ${n(mine.groups, t)}`).join(', ')} unit(s), est ${(mine.cost / 60).toFixed(1)} min -> ${outDir}`);
    // ---- lint: one --jobs process for the shard
    if (tools.includes('lint') && n(mine.groups, 'lint')) {
        const jobs = [], meta = {};
        for (const g of mine.groups) for (const u of g.units.lint || []) {
            const id = docId(g, u);
            meta[id] = { g, u };
            jobs.push({ id, args: ['--skills', g.skill, '--roles', u.role, '--size', u.size, ...(g.opts ? ['--opts', JSON.stringify(g.opts)] : []), ...supportArgs(g.opts)] });
        }
        const jf = join(outDir, 'lint-jobs.json'), jo = join(outDir, 'lint.json');
        writeFileSync(jf, JSON.stringify(jobs));
        const t = Date.now();
        const r = await run(process.execPath, [S('ws-print-lint.cjs'), '--source', 'kit', '--jobs', jf, '--json', jo, '--report-only'], root, join(outDir, 'lint.log'));
        let res = null;
        try { res = JSON.parse(readFileSync(jo, 'utf8')); } catch (e) { fails.push(`lint: no --json output (exit ${r.code}): ${String(r.out).trim().split('\n').slice(-2).join(' | ').slice(0, 200)}`); }
        if (res) {
            const pins = { L: join(root, 'design/audit/baselines/print-lint.json'), M: join(root, 'design/audit/baselines/print-lint.M.json') };
            const pinDocs = {};
            for (const [sz, f] of Object.entries(pins)) { try { pinDocs[sz] = new Map(JSON.parse(readFileSync(f, 'utf8')).documents.map((d) => [d.id, d])); } catch (e) { pinDocs[sz] = new Map(); } }
            for (const d of res.documents || []) {
                const m = meta[d.id]; if (!m) continue;
                done.lint++;
                if (d.error) { fails.push(`lint ${d.id}: did not render (${String(d.error).slice(0, 140)})`); continue; }
                const pid = pinId(m.g, m.u);
                for (const x of rises(d, pid ? pinDocs[m.u.size].get(pid) : null)) fails.push(`lint ${d.id}: ${x.k} x${x.n}${x.pinned ? ` (pinned ${x.pinned})` : ''} - ${String(x.ex).slice(0, 120)}`);
            }
            for (const x of res.na || []) { const m = meta[x.id]; if (!m) continue; done.lint++; (planOf[m.g.skill].hasCard ? fails : notes).push(`lint ${x.id}: not composed (${String(x.reason || '').slice(0, 120)})${planOf[m.g.skill].hasCard ? ' - the card offers this role' : ''}`); }
            for (const x of res.pending || []) { const m = meta[x.id]; if (!m) continue; done.lint++; notes.push(`lint ${x.id}: pending (${String(x.reason || '').slice(0, 120)})`); }
            const missing = jobs.filter((j) => !(res.documents || []).some((d) => d.id === j.id) && !(res.na || []).some((d) => d.id === j.id) && !(res.pending || []).some((d) => d.id === j.id));
            for (const j of missing) fails.push(`lint ${j.id}: no document in the output`);
        }
        console.log(`  lint: ${jobs.length} document(s) in ${((Date.now() - t) / 1000).toFixed(0)} s`);
    }
    // ---- band and raster: one process a (skill, variant) group
    const ebArgs = (get('eb-args') || '').split(/\s+/).filter(Boolean);
    for (const g of mine.groups) {
        const tag = `${g.skill}${g.variant ? ` ~${g.variant}` : ''}`;
        const fn = `${g.skill.replace(':', '_')}${g.variant ? `~${g.variant.replace(/[^\w=.-]/g, '_')}` : ''}`;
        if (tools.includes('band') && (g.units.band || []).length) {
            const roles = [...new Set(g.units.band.map((u) => u.role))], szs = [...new Set(g.units.band.map((u) => u.size))];
            const t = Date.now();
            const r = await run(process.execPath, [S('ws-empty-band.cjs'), '--skill', g.skill, '--roles', roles.join(','), '--sizes', szs.join(','), '--hosts', 'none', ...(g.opts ? ['--opts', JSON.stringify(g.opts)] : []), ...ebArgs], root, join(outDir, `band-${fn}.log`));
            const v = verdict(r.out, 'ws-empty-band');
            done.band += g.units.band.length;
            if (!v) fails.push(`band ${tag}: no verdict (exit ${r.code})`);
            else if (v[1] !== 'OK' || r.code) for (const l of bandFindings(r.out).slice(0, 12)) fails.push(`band ${tag}: ${l.slice(0, 200)}`);
            if (v && v[1] !== 'OK' && !fails.some((f) => f.startsWith(`band ${tag}`))) fails.push(`band ${tag}: ${v[0].slice(0, 160)}`);
            console.log(`  band ${tag}: ${roles.length} role(s) x ${szs.join('/')} ${v ? v[1] : 'no verdict'} in ${((Date.now() - t) / 1000).toFixed(0)} s`);
        }
        if (tools.includes('raster') && (g.units.raster || []).length) {
            const roles = [...new Set(g.units.raster.map((u) => u.role))], szs = [...new Set(g.units.raster.map((u) => u.size))];
            const t = Date.now();
            const r = await run(process.execPath, [S('ws-grade-render.cjs'), '--skills', g.skill, '--roles', roles.join(','), '--size', szs.join(','), '--no-screen', '--raster-fit', ...(g.opts ? ['--opts', JSON.stringify(g.opts)] : []), '--out', join(outDir, `raster-${fn}`)], root, join(outDir, `raster-${fn}.log`));
            const v = verdict(r.out, 'ws-grade-render');
            done.raster += g.units.raster.length;
            if (!v) fails.push(`raster ${tag}: no verdict (exit ${r.code})`);
            else if (v[1] !== 'OK' || r.code) {
                const ls = String(r.out).split('\n').filter((x) => /\bRR-[A-Z]+\b|ERROR|leaves the/.test(x)).slice(0, 12);
                for (const l of ls.length ? ls : [v[0]]) fails.push(`raster ${tag}: ${l.trim().slice(0, 200)}`);
            }
            console.log(`  raster ${tag}: ${roles.length} role(s) x ${szs.join('/')} ${v ? v[1] : 'no verdict'} in ${((Date.now() - t) / 1000).toFixed(0)} s`);
        }
    }
    for (const x of notes) console.log(`  note ${x}`);
    for (const f of fails) console.log(`  FAIL ${f}`);
    const sec = (Date.now() - t0) / 1000;
    const units = tools.map((t) => `${done[t]} ${t}`).join(' + ');
    console.log(`${TOOL}: ${fails.length ? `FAIL (${fails.length} finding(s); ${units} unit(s) of ${skills.join(', ')}, shard ${si}/${sn}, ${(sec / 60).toFixed(1)} min)` : `OK (${units} unit(s) of ${skills.join(', ')}, shard ${si}/${sn}, ${(sec / 60).toFixed(1)} min)`}`);
    process.exitCode = fails.length ? 1 : 0;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => { console.error(e); console.log(`${TOOL}: FAIL (${String(e && e.message || e).slice(0, 160)})`); process.exitCode = 1; });
