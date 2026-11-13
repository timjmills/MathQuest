// tests/lib/ws-card-plan.mjs - what a signed spec card says the critic grades, as a render plan (lane lf-ops critic r1,
// speed-up 3 / check 2: "generate precritic's plan from the signed card's §7a offered list x the option values, not from a
// fixed role list"; most of r1's reds sat in roles and option values precritic never rendered).
//
//   node tests/lib/ws-card-plan.mjs --skill multiplication:mult_properties [--root <tree>]
//     -> {"skill", "cards": [...], "roles": [...offered page roles], "variants": [{"option","value","opts"}], "skipped": [...]}
//
// Reads every design/cards/*/*.md whose rulings block lists the skill; from its §7a takes
//   - every page role line marked **offered** (on this skill, or with no "on" list), minus a **hidden** line for it;
//   - every option line marked **offered** for this skill, with listed values: each value other than the skill's default
//     (js/modules/skill-options.js offeredOptionsFor) becomes one opts variant ({id: [v]} for a set option, {id: v} else).
// Values written `*`, options the skill does not declare (a derived Max Number) and out-of-scope lines are skipped (listed).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));

/** The §7a decision lines of a card body: [{group, key, decision, on: [ids] | null}]. Pure. */
export function readDecisions(md) {
    const s = md.indexOf('### 7a.');
    if (s < 0) return [];
    const e = md.indexOf('\n## ', s + 5);
    const sec = md.slice(s, e < 0 ? undefined : e);
    const out = [];
    let group = '';
    for (const line of sec.split('\n')) {
        const g = /^\*\*(Option values|Page roles|Screen hosts)/.exec(line);
        if (g) { group = g[1] === 'Option values' ? 'options' : g[1] === 'Page roles' ? 'roles' : 'hosts'; continue; }
        const m = /^- `([^`]+)` — \*\*(offered|hidden|out of scope)\*\*(?: on ((?:`[^`]+`(?:, )?)+))?/.exec(line);
        if (!m || !group) continue;
        const on = m[3] ? [...m[3].matchAll(/`([^`]+)`/g)].map((x) => x[1]) : null;
        // (some cards write their role and host keys `role:independent`, `host:quiz`)
        out.push({ group, key: group === 'roles' ? m[1].replace(/^role:/, '') : group === 'hosts' ? m[1].replace(/^host:/, '') : m[1], decision: m[2], on });
    }
    return out;
}

/** The cards whose rulings block lists `skillKey`: [{file, md}]. */
export function cardsFor(root, skillKey) {
    const dir = join(root, 'design', 'cards');
    const out = [];
    if (!existsSync(dir)) return out;
    for (const d of readdirSync(dir, { withFileTypes: true })) {
        if (!d.isDirectory()) continue;
        for (const f of readdirSync(join(dir, d.name))) {
            if (!/\.md$/.test(f) || /^README/i.test(f)) continue;
            const md = readFileSync(join(dir, d.name, f), 'utf8');
            const r = /<!-- rulings\s*([\s\S]*?)-->/.exec(md);
            if (!r) continue;
            let j; try { j = JSON.parse(r[1]); } catch (e) { continue; }
            if ((j.skills || []).includes(skillKey)) out.push({ file: `design/cards/${d.name}/${f}`, md });
        }
    }
    return out;
}

const applies = (line, id) => !line.on || line.on.includes(id);

export async function cardPlanFor(root, skillKey) {
    let [cat, id] = skillKey.split(':');
    let cards = cardsFor(root, skillKey);
    // A PRESET skill (skill-presets.js: the host skill with option values set) is graded on its host's signed card: every
    // role and host the card offers, with the preset's values as the base and the host's other option values as variants
    // (lf-builds chart_120 fix: composing:chart_to_120 fell back to the 9 default roles and no option values, so its
    // pre-skill-check, opener, scripted-model ... pages and its whole chart at 12 rows were never rendered before a critic; L25).
    let preset = null;
    if (!cards.length) {
        try {
            const PR = await import(pathToFileURL(join(root, 'js', 'modules', 'skill-presets.js')).href);
            const p = PR.presetOf ? PR.presetOf(cat, id) : null;
            if (p) { preset = { host: `${p.categoryId}:${p.skillId}`, opts: p.opts }; id = p.skillId; cards = cardsFor(root, preset.host); }
        } catch (e) { /* no presets in this tree */ }
    }
    const lines = cards.flatMap((c) => readDecisions(c.md));
    const roles = [];
    for (const l of lines.filter((x) => x.group === 'roles' && applies(x, id))) {
        if (l.decision === 'offered' && !roles.includes(l.key)) roles.push(l.key);
    }
    const hidden = lines.filter((x) => x.group === 'roles' && x.decision === 'hidden' && applies(x, id)).map((x) => x.key);
    const SO = await import(pathToFileURL(join(root, 'js', 'modules', 'skill-options.js')).href);
    let defs = [];
    try { defs = SO.offeredOptionsFor(cat, id) || []; } catch (e) { defs = []; }
    const variants = [];
    const skipped = [];
    for (const l of lines.filter((x) => x.group === 'options' && x.decision === 'offered' && applies(x, id))) {
        const eq = l.key.indexOf('=');
        const oid = l.key.slice(0, eq), vals = l.key.slice(eq + 1).split('|').map((v) => v.trim());
        const def = defs.find((d) => d.id === oid);
        if (!def) { skipped.push(`${oid}: not an option ${skillKey} declares`); continue; }
        if (preset && Object.prototype.hasOwnProperty.call(preset.opts || {}, oid)) { skipped.push(`${oid}: set by the preset (${JSON.stringify(preset.opts[oid])})`); continue; }
        if (vals.includes('*') || !['set', 'enum', 'bool'].includes(def.type)) { skipped.push(`${oid}: values ${vals.join('|')} (type ${def.type})`); continue; }
        const typed = (v) => {
            if (def.type === 'bool') return v === 'true';
            const hit = (def.values || []).map((x) => (x && typeof x === 'object' ? x.v : x)).find((x) => String(x) === v);
            return hit === undefined ? (v === 'null' ? null : v) : hit;
        };
        const dflt = def.default;
        // a set option of three values or more is also printed with every value at once (a mixed page: its title, Rule
        // and vocabulary must name all of them; critic r1 graded mult_properties forms [2,3])
        if (def.type === 'set' && vals.length > 2) variants.push({ option: oid, value: vals.join('+'), opts: { [oid]: vals.map(typed) } });
        for (const v of vals) {
            const tv = typed(v);
            if (def.type === 'set') {
                if (Array.isArray(dflt) && dflt.length === 1 && String(dflt[0]) === String(tv)) continue;
                variants.push({ option: oid, value: v, opts: { [oid]: [tv] } });
            } else {
                if (String(dflt) === String(tv)) continue;
                variants.push({ option: oid, value: v, opts: { [oid]: tv } });
            }
        }
    }
    const out = { skill: skillKey, cards: cards.map((c) => c.file), roles: roles.filter((r) => !hidden.includes(r)), hidden, variants, skipped };
    if (preset) out.preset = preset;
    return out;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const a = process.argv.slice(2);
    const get = (k) => { const i = a.indexOf(k); return i >= 0 ? a[i + 1] : null; };
    const root = resolve(get('--root') || process.env.MQ_ROOT || join(HERE, '..', '..'));
    const skills = (get('--skill') || '').split(',').filter(Boolean);
    if (a.includes('--self-test')) {
        const md = '### 7a. x\n\n**Option values (offeredOptionsFor)**\n\n- `forms=0 | 1` — **offered** on `a_b` — x\n- `nlOn=true | false` — **out of scope** — y\n\n**Page roles (buildSheet)**\n\n- `independent` — **offered** — p\n- `word-problems` — **hidden** on `a_b` — q\n\n## 8. Gates\n';
        const d = readDecisions(md);
        const ok = d.length === 4 && d[0].on[0] === 'a_b' && d[2].key === 'independent' && d[3].decision === 'hidden';
        // a preset skill is planned from its host's card: every role it offers, the preset's own option never a variant
        // (lf-builds chart_120 fix: composing:chart_to_120 fell back to the 9 default roles; skipped in a tree without it)
        let okP = true, noteP = 'preset case n/a';
        if (existsSync(join(root, 'design', 'cards', 'chartwindow', 'chartwindow.md'))) {
            const pp = await cardPlanFor(root, 'composing:chart_to_120').catch(() => null);
            const hp = await cardPlanFor(root, 'composing:hundreds_chart_fill').catch(() => null);
            if (pp && hp && hp.cards.length) {
                okP = !!pp.preset && pp.cards.join() === hp.cards.join() && pp.roles.join() === hp.roles.join() && !pp.variants.some((v) => v.option === 'band');
                noteP = `preset case ${okP ? 'ok' : 'FAIL'} (${pp.roles.length} roles, ${pp.variants.length} variants)`;
            }
        }
        console.log(`ws-card-plan --self-test: ${ok && okP ? 'OK' : 'FAIL'} (${d.length} lines; ${noteP})`);
        process.exit(ok && okP ? 0 : 1);
    }
    const out = [];
    for (const s of skills) out.push(await cardPlanFor(root, s));
    process.stdout.write(JSON.stringify(out) + '\n');
}
