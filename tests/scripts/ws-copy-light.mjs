// ws-copy-light — may a skill take the COPY-LIGHT critic route, and which pages does its narrow critic grade?
// (owner rule 2026-11-13, CLAUDE.md "Fastest-implementation plan" items 2-3; design/plans/FASTEST_PLAN_2026-11-13.md)
//
//   2. COPY-LIGHT REVIEW: the FIRST skill on a template gets the full critic. Every later skill on an ALREADY-PASSED template
//      gets the machine gates plus a NARROW critic on its own content (answers, ladder, words, options) on a SAMPLE of pages.
//   3. BATCH critics: 3-6 same-template skills per critic run.
//
//   node tests/scripts/ws-copy-light.mjs --skill a:b[,c:d]            # one verdict per skill (report: exit 0)
//   node tests/scripts/ws-copy-light.mjs --skill a:b --require         # exit 1 when a skill is not eligible
//   node tests/scripts/ws-copy-light.mjs --batch a:b,c:d,e:f           # one batch: 3-6 eligible skills on ONE passed template
//   ... --sample-out <file.json>   write the page sample for the narrow / batch critic (deterministic)
//   ... --sample-cap N             pages per skill (default 12) or the batch's shared budget (default 24); coverage wins
//   ... --root <tree>              the app tree to read (default MQ_ROOT, else this repository)
//   node tests/scripts/ws-copy-light.mjs --self-test                   # eligibility, batch and sample cases, no app
//
// ELIGIBILITY (per skill S)
//   - S's templates are what its generator emits (the kit cell template: q.cell.template through print-generate's
//     kitCellSpec) on 8 seeded items at its defaults plus 2 seeded items per option value its card offers (ws-card-plan
//     variants; a skill with no card: every non-default value of offeredOptionsFor's set / enum / bool options). A skill
//     whose items draw the legacy cell, or whose generation errors on every item, is not eligible (no kit template passed).
//   - S's roles are the page roles its signed card's §7a offers (ws-card-plan); with no card §7a, every role buildSheet
//     composes (CLAUDE.md: any skill on any page type). Its hosts are the card's offered screen hosts, else the three
//     (practice-card, online-worksheet, quiz).
//   - For EVERY template T that S draws there must be an ANCHOR: a skill A != S in js/modules/redesign-passed.js that draws T
//     (same scan) and whose own signed card offers every role and every host S needs (A passed on those; an anchor with no
//     card §7a has no recorded roles and anchors nothing). Not eligible -> the reason ("template X never passed", "role Y
//     not on the anchor's card", ...): S needs a FULL critic.
// BATCH: 3-6 skills, every one eligible, sharing ONE template that passed (the intersection of what they draw), else FAIL with
//   the reason (mixed templates, a skill not eligible, size). A skill failing its critic never fails the others (the brief).
// THE SAMPLE (JSON; design/lessons-first/briefs/critic-copy-light.md and critic-batch.md read it): per skill a list of pages
//   {n, role, size, seed, host, width, option, value, opts}: every offered role at least once (print pages, host "print", sizes
//   cycling S, L, M), every offered screen host at least once (role null, size null, width alternating 1280 / 820: computer
//   and tablet, plan item 7), every offered option value at least once (attached to a page; a page is added when the values
//   outnumber the pages). Seeds are fnv(skill) + page index: the same tree gives the same sample. In a batch the roles are
//   shared across the skills (each role once in the batch, given to the skill with the fewest pages that offers it), every
//   skill keeps one screen host, all its option values and at least 2 pages. When coverage needs more pages than the cap, the
//   cap is raised to the coverage and the file says so (coverage is never cut).
// Last line `ws-copy-light: OK ...` / `ws-copy-light: FAIL ...`.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const TOOL = 'ws-copy-light';
export const DEFAULT_HOSTS = ['practice-card', 'online-worksheet', 'quiz'];
export const WIDTHS = [1280, 820];
const SIZES = ['S', 'L', 'M'];

/* ============================================================== pure: eligibility */
/** The kit templates an info's scan drew (legacy / error excluded). Pure. */
export const templatesOf = (info) => Object.keys(info.templates || {}).filter((t) => t !== 'legacy' && t !== 'error');

/**
 * The copy-light verdict of one skill. `info` = {key, templates: {tpl: n}, items, roles, hosts, rolesFrom}; `passed` = the
 * infos of every skill in redesign-passed.js (same shape, plus `hasCard`). Pure.
 * -> {skill, eligible, anchors: [{template, anchor}], reasons: [..]}
 */
export function eligibility(info, passed) {
    const reasons = [];
    const t = info.templates || {};
    const tpls = templatesOf(info);
    const legacy = t.legacy || 0, err = t.error || 0;
    if (info.items && err >= info.items) reasons.push(`generation errored on every item (${err}/${info.items}): its template is unknown`);
    if (legacy) reasons.push(`draws the legacy cell on ${legacy}/${info.items || '?'} item(s): no kit template, never passed`);
    if (!tpls.length && !reasons.length) reasons.push('draws no kit template');
    const anchors = [];
    for (const T of tpls) {
        const cands = passed.filter((p) => p.key !== info.key && (p.templates || {})[T] > 0);
        if (!cands.length) { reasons.push(`template ${T} never passed (no skill in redesign-passed.js draws it)`); continue; }
        const judged = cands.map((p) => {
            if (!p.hasCard) return { p, miss: [`anchor ${p.key} has no signed card §7a: the roles and hosts it passed on are not recorded`], n: 1e6 };
            const mr = (info.roles || []).filter((r) => !(p.roles || []).includes(r));
            const mh = (info.hosts || []).filter((h) => !(p.hosts || []).includes(h));
            const miss = [];
            if (mr.length) miss.push(`role${mr.length > 1 ? 's' : ''} ${mr.join(', ')} not on the anchor ${p.key}'s card`);
            if (mh.length) miss.push(`host${mh.length > 1 ? 's' : ''} ${mh.join(', ')} not on the anchor ${p.key}'s card`);
            // prefer an anchor for which T is its most drawn template
            const top = Math.max(...Object.values(p.templates)) === p.templates[T] ? 0 : 0.5;
            return { p, miss, n: mr.length + mh.length + top };
        }).sort((a, b) => a.n - b.n);
        const ok = judged.find((j) => !j.miss.length);
        if (ok) anchors.push({ template: T, anchor: ok.p.key });
        else reasons.push(`template ${T}: ${judged[0].miss.join('; ')}`);
    }
    return { skill: info.key, eligible: !reasons.length, anchors, reasons };
}

/** The batch verdict: {ok, template, reasons}. `verdicts` from eligibility(), `infos` the same skills' infos. Pure. */
export function batchCheck(infos, verdicts) {
    const reasons = [];
    if (infos.length < 3 || infos.length > 6) reasons.push(`a batch is 3-6 skills on one template (owner rule 3); ${infos.length} given`);
    const dup = infos.map((i) => i.key).filter((k, i, a) => a.indexOf(k) !== i);
    if (dup.length) reasons.push(`named twice: ${[...new Set(dup)].join(', ')}`);
    for (const v of verdicts) if (!v.eligible) reasons.push(`${v.skill} is not copy-light eligible (${v.reasons.join('; ')}): it needs a full critic, not a batch`);
    const sets = infos.map((i) => templatesOf(i));
    const shared = sets.length ? sets[0].filter((t) => sets.every((s) => s.includes(t))) : [];
    // the shared template must itself have passed (an anchor for it in every skill's verdict)
    const passedShared = shared.filter((T) => verdicts.every((v) => v.anchors.some((a) => a.template === T)));
    let template = null;
    if (!shared.length) reasons.push(`mixed templates: ${infos.map((i, k) => `${i.key} draws ${sets[k].join('+') || 'none'}`).join('; ')}`);
    else if (!passedShared.length && verdicts.every((v) => v.eligible)) reasons.push(`the shared template${shared.length > 1 ? 's' : ''} ${shared.join(', ')} never passed for every skill`);
    else {
        // the template most drawn across the batch
        template = passedShared.slice().sort((a, b) => infos.reduce((s, i) => s + ((i.templates[b] || 0) - (i.templates[a] || 0)), 0))[0];
    }
    return { ok: !reasons.length, template, shared, reasons };
}

/* ============================================================== pure: the sample */
/** fnv-1a 32 of a string. Pure. */
export function fnv(s) { let h = 0x811c9dc5; for (const c of String(s)) { h ^= c.codePointAt(0); h = Math.imul(h, 0x01000193) >>> 0; } return h >>> 0; }

/**
 * The page sample of one or more skills. `skills` = [{key, roles, hosts, variants: [{option, value, opts}]}]; `cap` = the
 * pages per skill (one skill) or the shared budget (a batch). Pure and deterministic.
 * -> {cap, pages (total), capRaised (reason) | null, skills: [{skill, pages: [...]}]}
 */
export function buildSample(skills, { cap, shared = skills.length > 1 } = {}) {
    const per = skills.map((s) => ({ s, pages: [] }));
    const fewest = (list) => list.slice().sort((a, b) => a.pages.length - b.pages.length || per.indexOf(a) - per.indexOf(b))[0];
    // roles: every skill's roles (one skill) or each role once across the batch
    if (!shared) for (const p of per) for (const r of p.s.roles) p.pages.push({ role: r, host: 'print' });
    else {
        const union = [];
        for (const p of per) for (const r of p.s.roles) if (!union.includes(r)) union.push(r);
        for (const r of union) fewest(per.filter((p) => p.s.roles.includes(r))).pages.push({ role: r, host: 'print' });
    }
    // screen hosts: one skill, every host; a batch, one host each, rotated so every host is seen
    per.forEach((p, i) => {
        const hs = p.s.hosts || [];
        if (!shared) for (const h of hs) p.pages.push({ role: null, host: h });
        else if (hs.length) p.pages.push({ role: null, host: hs[i % hs.length] });
    });
    if (shared) {
        const seen = new Set(per.flatMap((p) => p.pages.filter((x) => x.host !== 'print').map((x) => x.host)));
        for (const h of [...new Set(per.flatMap((p) => p.s.hosts || []))]) if (!seen.has(h)) fewest(per.filter((p) => (p.s.hosts || []).includes(h))).pages.push({ role: null, host: h });
    }
    // option values: each one on a page of its own skill (print pages first), adding pages when they run out
    for (const p of per) {
        const order = [...p.pages.filter((x) => x.host === 'print'), ...p.pages.filter((x) => x.host !== 'print')];
        let k = 0;
        for (const v of p.s.variants || []) {
            let page = order[k++];
            if (!page) { const roles = p.s.roles.length ? p.s.roles : ['independent']; page = { role: roles[(k - 1) % roles.length], host: 'print' }; p.pages.push(page); }
            Object.assign(page, { option: v.option, value: v.value, opts: v.opts });
        }
        // a batch: every skill at least 2 pages
        while (shared && p.pages.length < 2) p.pages.push({ role: p.s.roles.includes('independent') ? 'independent' : (p.s.roles[0] || 'independent'), host: 'print' });
    }
    // sizes, widths, seeds, numbering
    let total = 0;
    for (const p of per) {
        const base = 10000 + (fnv(p.s.key) % 80000);
        let si = 0, wi = 0;
        p.pages = p.pages.map((x, i) => {
            const screen = x.host !== 'print';
            return { n: i + 1, role: x.role, size: screen ? null : SIZES[si++ % 3], seed: base + i, host: x.host, width: screen ? WIDTHS[wi++ % WIDTHS.length] : null, option: x.option || null, value: x.value === undefined ? null : x.value, opts: x.opts || null };
        });
        total += p.pages.length;
    }
    const need = shared ? total : Math.max(0, ...per.map((p) => p.pages.length));
    const capRaised = need > cap ? `coverage needs ${need} page(s)${shared ? ' in the batch' : ''} (every offered role, host and option value at least once): the cap ${cap} is raised to ${need}` : null;
    return { cap: Math.max(cap, need), capAsked: cap, pages: total, capRaised, skills: per.map((p) => ({ skill: p.s.key, pages: p.pages })) };
}

/* ============================================================== self-test */
function selfTest() {
    const bad = [];
    const eq = (name, got, want) => { if (JSON.stringify(got) !== JSON.stringify(want)) bad.push(`${name}: got ${JSON.stringify(got)}, want ${JSON.stringify(want)}`); };
    const R3 = ['independent', 'guided', 'test'];
    const anchor = { key: 'addition:add_facts', templates: { fact: 8 }, roles: [...R3, 'fact-rows'], hosts: DEFAULT_HOSTS, hasCard: true };
    const stackA = { key: 'subtraction:sub_50_no_regroup', templates: { stack: 8 }, roles: R3, hosts: DEFAULT_HOSTS, hasCard: true };
    const noCard = { key: 'division:div_facts_long', templates: { division: 8 }, roles: [], hosts: [], hasCard: false };
    const passed = [anchor, stackA, noCard];
    const sk = (key, templates, roles = R3, hosts = DEFAULT_HOSTS) => ({ key, templates, items: 8, roles, hosts });
    // 1 eligible: a fact-template copy whose roles the anchor's card offers
    const e1 = eligibility(sk('addition:add_facts_copy', { fact: 8 }), passed);
    eq('eligible', [e1.eligible, e1.anchors], [true, [{ template: 'fact', anchor: 'addition:add_facts' }]]);
    // 2 a template that never passed
    const e2 = eligibility(sk('geometry:new_thing', { 'bar-model': 8 }), passed);
    eq('template never passed', [e2.eligible, /template bar-model never passed/.test(e2.reasons[0])], [false, true]);
    // 3 a role the anchor's card does not offer
    const e3 = eligibility(sk('addition:add_facts_wp', { fact: 8 }, [...R3, 'word-problems']), passed);
    eq('role not offered', [e3.eligible, /role word-problems not on the anchor addition:add_facts's card/.test(e3.reasons[0])], [false, true]);
    // 4 a host the anchor's card does not offer
    const e4 = eligibility(sk('addition:add_facts_x', { fact: 8 }, R3, [...DEFAULT_HOSTS, 'boss']), passed);
    eq('host not offered', [e4.eligible, /host boss not on the anchor/.test(e4.reasons[0])], [false, true]);
    // 5 legacy items are never eligible; 6 an anchor with no card anchors nothing; 7 a passed skill is not its own anchor
    eq('legacy cell', eligibility(sk('a:legacy', { fact: 6, legacy: 2 }), passed).eligible, false);
    const e6 = eligibility(sk('division:long_copy', { division: 8 }), passed);
    eq('anchor without a card', [e6.eligible, /has no signed card/.test(e6.reasons[0])], [false, true]);
    eq('not its own anchor', eligibility(sk('addition:add_facts', { fact: 8 }), passed).eligible, false);
    // 8 two templates: each needs its own anchor
    eq('two templates, one unpassed', eligibility(sk('a:two', { fact: 4, ruler: 4 }), passed).eligible, false);
    // batch: mixed templates FAIL, one template OK, size, an ineligible member
    const b1 = [sk('a:f1', { fact: 8 }), sk('a:f2', { fact: 8 }), sk('a:s1', { stack: 8 })];
    const r1 = batchCheck(b1, b1.map((i) => eligibility(i, passed)));
    eq('batch mixed templates', [r1.ok, r1.reasons.some((x) => /^mixed templates/.test(x))], [false, true]);
    const b2 = [sk('a:f1', { fact: 8 }), sk('a:f2', { fact: 8 }), sk('a:f3', { fact: 7, stack: 1 })];
    const r2 = batchCheck(b2, b2.map((i) => eligibility(i, passed)));
    eq('batch one template', [r2.ok, r2.template], [true, 'fact']);
    const b3 = b2.slice(0, 2);
    eq('batch of 2', batchCheck(b3, b3.map((i) => eligibility(i, passed))).ok, false);
    const b4 = [...b2.slice(0, 2), sk('a:f4', { fact: 8 }, [...R3, 'word-problems'])];
    const r4 = batchCheck(b4, b4.map((i) => eligibility(i, passed)));
    eq('batch with an ineligible skill', [r4.ok, r4.reasons.some((x) => /a:f4 is not copy-light eligible/.test(x))], [false, true]);
    // sample: every role, host and option value once; deterministic; cap raised, never cut
    const vs = [{ option: 'band', value: '20', opts: { band: 20 } }, { option: 'support', value: 'touch', opts: { support: 'touch' } }];
    const s1 = buildSample([{ key: 'a:f1', roles: R3, hosts: DEFAULT_HOSTS, variants: vs }], { cap: 12 });
    const pg = s1.skills[0].pages;
    eq('sample covers roles', R3.every((r) => pg.some((p) => p.role === r)), true);
    eq('sample covers hosts', DEFAULT_HOSTS.every((h) => pg.some((p) => p.host === h)), true);
    eq('sample covers option values', vs.every((v) => pg.some((p) => p.option === v.option && p.value === v.value)), true);
    eq('sample sizes S L M', pg.filter((p) => p.size).map((p) => p.size), ['S', 'L', 'M']);
    eq('sample deterministic', JSON.stringify(buildSample([{ key: 'a:f1', roles: R3, hosts: DEFAULT_HOSTS, variants: vs }], { cap: 12 })), JSON.stringify(s1));
    const many = Array.from({ length: 15 }, (_, i) => `r${i}`);
    const s2 = buildSample([{ key: 'a:big', roles: many, hosts: DEFAULT_HOSTS, variants: [] }], { cap: 12 });
    eq('cap raised to coverage', [s2.pages, s2.cap, !!s2.capRaised], [18, 18, true]);
    // batch sample: each role once across the batch, every skill >= 2 pages and its own option values
    const sb = buildSample([{ key: 'a:f1', roles: R3, hosts: DEFAULT_HOSTS, variants: vs }, { key: 'a:f2', roles: R3, hosts: DEFAULT_HOSTS, variants: [] }, { key: 'a:f3', roles: R3, hosts: DEFAULT_HOSTS, variants: [] }], { cap: 24 });
    const all = sb.skills.flatMap((s) => s.pages.map((p) => ({ ...p, skill: s.skill })));
    eq('batch roles once each', R3.map((r) => all.filter((p) => p.role === r).length), [1, 1, 1]);
    eq('batch hosts each seen', DEFAULT_HOSTS.every((h) => all.some((p) => p.host === h)), true);
    eq('batch every skill >= 2 pages', sb.skills.every((s) => s.pages.length >= 2), true);
    eq('batch option values on their skill', vs.every((v) => sb.skills[0].pages.some((p) => p.option === v.option)), true);
    const n = 24;
    for (const b of bad) console.log(`  self-test FAIL: ${b}`);
    console.log(`${TOOL} --self-test: ${bad.length ? `FAIL (${bad.length} of ${n})` : `OK (${n} cases: eligibility 9, batch 4, sample 11)`}`);
    return bad.length ? 1 : 0;
}

/* ============================================================== the app (node, stubbed DOM) */
async function loadApp(root) {
    const M = (p) => pathToFileURL(join(root, 'js', 'modules', p)).href;
    const stub = () => new Proxy(function () {}, { get: (t, k) => (k === Symbol.toPrimitive ? () => '' : k === 'length' ? 0 : k === Symbol.iterator ? undefined : stub()), apply: () => stub(), construct: () => stub(), set: () => true });
    const store = {};
    globalThis.localStorage = { getItem: (k) => (k in store ? store[k] : null), setItem(k, v) { store[k] = String(v); }, removeItem(k) { delete store[k]; } };
    globalThis.sessionStorage = globalThis.localStorage; globalThis.window = globalThis; globalThis.document = stub();
    const quiet = { log: console.log, warn: console.warn, error: console.error, info: console.info, debug: console.debug };
    console.log = console.warn = console.error = console.info = console.debug = () => {};
    try {
        const gq = await import(M('generate-question.js'));
        const data = await import(M('data.js'));
        const pg = await import(M('print-generate.js'));
        const so = await import(M('skill-options.js'));
        const rp = await import(M('redesign-passed.js'));
        const roles = await import(M('sheet/roles/index.js'));
        return { gq, data, pg, so, rp, allRoles: ['independent', 'more-practice', ...Object.keys(roles.ROLE_MODULES)], quiet };
    } finally { Object.assign(console, quiet); }
}

function liveKeys(data) {
    const out = new Set();
    for (const [cat, list] of Object.entries(data.SKILLS)) for (const s of list || []) if (s && s.v && !s.retired && !s.tombstone && !s.hidden) out.add(`${cat}:${s.v}`);
    return out;
}

/** A skill's info: templates drawn (defaults + its option values), roles, hosts, variants, cards. */
async function skillInfo(app, root, key) {
    const CP = await import(pathToFileURL(join(root, 'tests', 'lib', 'ws-card-plan.mjs')).href).catch(() => import(pathToFileURL(join(HERE, '..', 'lib', 'ws-card-plan.mjs')).href));
    const [cat, id] = key.split(':');
    const plan = await CP.cardPlanFor(root, key);
    const cards = CP.cardsFor(root, key);
    const lines = cards.flatMap((c) => CP.readDecisions(c.md));
    const applies = (l) => !l.on || l.on.includes(id);
    const hostLines = lines.filter((l) => l.group === 'hosts' && l.decision === 'offered' && applies(l)).map((l) => l.key);
    const hasCard = plan.roles.length > 0;
    let variants = plan.variants;
    if (!hasCard) {
        // no card §7a: every non-default value of the skill's own set / enum / bool options
        variants = [];
        let defs = [];
        try { defs = app.so.offeredOptionsFor(cat, id) || []; } catch (e) { defs = []; }
        for (const d of defs) {
            if (!['set', 'enum', 'bool'].includes(d.type) || /^(nl[A-Z]|calculator$|skipAfter$)/.test(d.id)) continue;
            const vals = d.type === 'bool' ? [true, false] : (d.values || []).map((x) => (x && typeof x === 'object' ? x.v : x));
            for (const v of vals) {
                if (d.type === 'set' ? (Array.isArray(d.default) && d.default.length === 1 && String(d.default[0]) === String(v)) : String(d.default) === String(v)) continue;
                variants.push({ option: d.id, value: String(v), opts: { [d.id]: d.type === 'set' ? [v] : v } });
            }
        }
    }
    const templates = {};
    let items = 0;
    const scan = (opts, n, seed0) => {
        for (let i = 0; i < n; i++) {
            let t = 'error';
            items++;
            try {
                const q = app.gq.generateQuestionFor({ category: cat, skill: id, opts, seed: seed0 + i, itemIndex: i });
                const r = q && app.pg.kitCellSpec(Object.assign({ skillId: id, categoryId: cat }, q));
                t = r ? r.template : 'legacy';
            } catch (e) { /* counted as error */ }
            templates[t] = (templates[t] || 0) + 1;
        }
    };
    const q = app.quiet; console.log = console.warn = console.error = console.info = console.debug = () => {};
    try {
        scan(undefined, 8, 1000);
        variants.forEach((v, k) => scan(v.opts, 2, 5000 + 10 * k));
    } finally { Object.assign(console, q); }
    return {
        key, templates, items,
        roles: hasCard ? plan.roles : app.allRoles.slice(),
        rolesFrom: hasCard ? `card ${plan.cards.join(', ')}` : cards.length ? `every buildSheet role (card ${cards.map((c) => c.file).join(', ')} has no §7a role lines)` : 'every buildSheet role (no signed card lists it: CLAUDE.md, any skill on any page type)',
        hosts: hostLines.length ? hostLines : DEFAULT_HOSTS.slice(),
        variants, cards: cards.map((c) => c.file), hasCard,
    };
}

/* ============================================================== CLI */
async function main() {
    const a = process.argv.slice(2);
    const get = (k) => { const i = a.indexOf(k); return i >= 0 && i + 1 < a.length && !/^--/.test(a[i + 1]) ? a[i + 1] : null; };
    if (a.includes('--self-test')) process.exit(selfTest());
    const root = resolve(get('--root') || process.env.MQ_ROOT || join(HERE, '..', '..'));
    const batch = (get('--batch') || '').split(',').map((s) => s.trim()).filter(Boolean);
    const skills = [...new Set([...(get('--skill') || '').split(',').map((s) => s.trim()).filter(Boolean), ...batch])];
    const known = new Set(['--self-test', '--root', '--batch', '--skill', '--sample-out', '--sample-cap', '--require', '--json']);
    const unknown = a.filter((x, i) => /^--/.test(x) && !known.has(x) && !(i > 0 && ['--root', '--batch', '--skill', '--sample-out', '--sample-cap', '--json'].includes(a[i - 1])));
    if (unknown.length || !skills.length) { console.log(`${TOOL}: usage: --skill a:b[,c:d] | --batch a:b,c:d,e:f [--sample-out f.json] [--sample-cap N] [--require] [--root dir] | --self-test${unknown.length ? ` (unknown ${unknown.join(' ')})` : ''}`); console.log(`${TOOL}: FAIL (usage)`); process.exit(2); }
    const app = await loadApp(root);
    const live = liveKeys(app.data);
    const notLive = skills.filter((k) => !live.has(k));
    if (notLive.length) { console.log(`${TOOL}: not live skills: ${notLive.join(', ')}`); console.log(`${TOOL}: FAIL (usage)`); process.exit(2); }
    const passedKeys = [...app.rp.REDESIGN_PASSED].filter((k) => live.has(k));
    const cache = new Map();
    const info = async (k) => { if (!cache.has(k)) cache.set(k, await skillInfo(app, root, k)); return cache.get(k); };
    const passed = [];
    for (const k of passedKeys) passed.push(await info(k));
    const infos = [];
    for (const k of skills) infos.push(await info(k));
    const verdicts = infos.map((i) => eligibility(i, passed));
    for (const [k, v] of verdicts.entries()) {
        const i = infos[k];
        const drawn = Object.entries(i.templates).map(([t, n]) => `${t} ${n}/${i.items}`).join(', ');
        console.log(`${v.eligible ? 'ELIGIBLE    ' : 'NOT ELIGIBLE'} ${v.skill}  (draws ${drawn}; roles: ${i.roles.length} from ${i.rolesFrom}; hosts: ${i.hosts.join(', ')}; option values: ${i.variants.length})`);
        if (app.rp.REDESIGN_PASSED.has(v.skill)) console.log(`    note: ${v.skill} is already in redesign-passed.js (it is not its own anchor)`);
        for (const an of v.anchors) console.log(`    anchor: ${an.anchor} passed on template ${an.template} (${(app.rp.REDESIGN_EVIDENCE[an.anchor] || '').slice(0, 110)}…)`);
        for (const r of v.reasons) console.log(`    why not: ${r} -> FULL critic`);
    }
    let bv = null;
    if (batch.length) {
        bv = batchCheck(batch.map((k) => infos[skills.indexOf(k)]), batch.map((k) => verdicts[skills.indexOf(k)]));
        console.log(`BATCH ${bv.ok ? 'OK  ' : 'FAIL'} ${batch.join(', ')}${bv.template ? ` on template ${bv.template}` : ''}`);
        for (const r of bv.reasons) console.log(`    why not: ${r}`);
    }
    const out = get('--sample-out');
    const elig = verdicts.filter((v) => v.eligible).map((v) => v.skill);
    if (out && !(batch.length ? bv.ok : elig.length)) console.log(`sample: none written (${batch.length ? 'the batch is not on one passed template' : 'no eligible skill'}; ${out} not created)`);
    else if (out) {
        const capArg = get('--sample-cap');
        const scope = batch.length ? (bv.ok ? batch : []) : elig;
        const sample = buildSample(scope.map((k) => infos[skills.indexOf(k)]), { cap: capArg ? +capArg : batch.length ? 24 : 12, shared: batch.length > 0 });
        const doc = {
            tool: TOOL, mode: batch.length ? 'batch' : 'copy-light', root,
            rule: 'owner 2026-11-13 (CLAUDE.md Fastest-implementation plan 2-3): the narrow critic grades ONLY the skill\'s own content on these pages; layout and drawing are inherited from the anchor',
            brief: batch.length ? 'design/lessons-first/briefs/critic-batch.md' : 'design/lessons-first/briefs/critic-copy-light.md',
            template: bv ? bv.template : null,
            page: 'role (null on a screen host), size (S / M / L; null on a screen host), seed (generateQuestionFor / buildSheet seed), host (print | practice-card | online-worksheet | quiz), width (screen px), option / value / opts (the option value this page shows; null = the defaults)',
            verdicts: verdicts.map((v, k) => ({ ...v, templates: infos[k].templates, roles: infos[k].roles, hosts: infos[k].hosts, rolesFrom: infos[k].rolesFrom, cards: infos[k].cards })),
            batch: bv,
            ...sample,
        };
        mkdirSync(dirname(resolve(out)), { recursive: true });
        writeFileSync(resolve(out), JSON.stringify(doc, null, 1) + '\n');
        console.log(`sample: ${resolve(out)} (${sample.pages} page(s) for ${sample.skills.length} skill(s), cap ${sample.capAsked}${sample.capRaised ? `; ${sample.capRaised}` : ''})`);
    }
    if (a.includes('--json') && get('--json')) writeFileSync(resolve(get('--json')), JSON.stringify({ verdicts, batch: bv }, null, 1) + '\n');
    const nNot = verdicts.length - elig.length;
    const require = a.includes('--require') || batch.length > 0;
    const fail = batch.length ? !bv.ok : require && nNot > 0;
    const summary = batch.length ? `batch of ${batch.length}${bv.ok ? ` on ${bv.template}` : ''}: ${bv.ok ? 'one passed template' : bv.reasons[0]}` : `${elig.length} eligible, ${nNot} need a full critic${require ? '' : ' (report)'}`;
    console.log(`${TOOL}: ${fail ? 'FAIL' : 'OK'} (${summary})`);
    process.exit(fail ? 1 : 0);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main().catch((e) => { console.log(`${TOOL}: ${e && e.stack || e}`); console.log(`${TOOL}: FAIL (error)`); process.exit(1); });
