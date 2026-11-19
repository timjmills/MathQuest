// ws-precritic-clean — a lane's "Clean for the critic" list may name only pages that are really clean (lane lf-algebra r10,
// lead rule after critic r2 of lf-algebra: precritic r9 listed the npr / fgr card and worksheet as clean while critic r1 F2 -
// the screen count-row train - was still open, and listed reason-it / error-analysis / test pages that no page-fill lint
// had run on, so critic r2 found G4 (one item a page) and G1 there).
//
//   node tests/scripts/ws-precritic-clean.mjs [--status design/status/<lane>.md] [--skill cat:a,cat:b] [--root DIR]
//
// It reads the lane's status file (default: the file under design/status/ whose "Branch:" line names the current git branch)
// and checks the LATEST "## Precritic rN" section's "Clean for the critic" paragraph against:
//   OPEN   every finding of the latest "## Critic rN" section - its finding blocks (**G1. ...**, **F2. ...**) and the rows of
//          its re-check table marked OPEN - is open until a "## Fixes after critic rN" section lists it as `- <ID> fixed`.
//          A claimed-clean (skill, page) that an open finding names is a violation. A finding that names no skill names every
//          skill; one that names no page names every page of its skills.
//   LINT   a claimed-clean print role must have a page-fill lint in that precritic run: a row of the section's gate table
//          whose name holds "print-lint" and the role. A claimed-clean screen host needs a row naming a screen gate.
// --skill limits the check to those skills. Prints the excluded pages, then `ws-precritic-clean: OK` / `FAIL (n)`; exits 1 on
// FAIL. No status file, or no clean claim, is OK (nothing claimed).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOL = 'ws-precritic-clean';
const args = process.argv.slice(2);
const arg = (f, d) => { const i = args.indexOf(f); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const ROOT = resolve(arg('--root', process.env.MQ_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..', '..')));

/** The page roles and hosts a sentence can name, with the words that name them. */
export const PAGES = [
    ['independent', /\bindependent\b/i], ['more-practice', /\bmore[- ]practice\b/i], ['test', /\btests?\b/i],
    ['error-analysis', /\berror[- ]analysis\b|\bEA\b/i], ['true-false', /\btrue[- ](?:or[- ])?false\b/i], ['reason-it', /\breason[- ]it\b/i],
    ['lesson', /\blesson\b|\banchor\b|\bwarm-up\b/i], ['scripted-model', /\bscripted[- ]model\b|\bmodel\b/i], ['guided', /\bguided\b/i],
    ['review', /\breview\b/i], ['pre-skill-check', /\bpre[- ]skill[- ]check\b/i],
    // "card" as a scale reference ("55 % of the card", a quiz finding) is not a claim about the card page
    ['card', /(?<!of (?:the|a) )\b(?:practice )?card(?:[- ]\d{3,4})?\b(?!\s*(?:§|'s|roles|rulings|file|\.md))/i], ['worksheet', /\b(?:online )?worksheet\b/i],
    ['quiz', /\bquiz\b/i], ['panel', /\b(?:option[- ])?panels?\b/i],
];
const HOSTS = new Set(['card', 'worksheet', 'quiz', 'panel']);
const STOP_WORDS = new Set(['pattern', 'patterns', 'number', 'numbers', 'function', 'follow', 'add', 'subtract', 'multiply', 'divide', 'find']);

/** Every way a status file names a skill: the full key, the bare id, its initials (and initials less the last). Pure. */
export function skillAliases(keys) {
    const firsts = keys.map((k) => k.split(':').pop().split('_')[0]);
    return keys.map((k) => {
        const id = k.split(':').pop();
        const parts = id.split('_');
        const ini = parts.map((p) => p[0]).join('');
        const al = new Set([k, id, ini]);
        // ("ft" for function_table_easy: a level suffix is dropped; never "np" for number_patterns_rule)
        if (ini.length >= 3 && /^(easy|basic|simple|intro|hard|level\d*)$/.test(parts[parts.length - 1])) al.add(ini.slice(0, -1));
        if (!STOP_WORDS.has(parts[0]) && parts[0].length >= 5 && firsts.filter((f) => f === parts[0]).length === 1) al.add(parts[0]);
        if (id.includes('_')) al.add(id.replace(/_/g, ' '));
        return { key: k, re: new RegExp(`(?<![\\w:])(?:${[...al].map((a) => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})(?![\\w])`, 'i') };
    });
}
const skillsIn = (text, aliases) => aliases.filter((a) => a.re.test(text)).map((a) => a.key);
const pagesIn = (text) => PAGES.filter(([, re]) => re.test(text)).map(([p]) => p);

/** The `## <title>` sections of a markdown file: [{title, n, body}]. Pure. */
export function sections(md) {
    const out = [];
    const lines = String(md).split('\n');
    let cur = null;
    for (const l of lines) {
        const m = /^##\s+(.*)$/.exec(l);
        if (m) { cur = { title: m[1], body: [] }; out.push(cur); continue; }
        if (cur) cur.body.push(l);
    }
    return out.map((s) => Object.assign(s, { body: s.body.join('\n') }));
}
const latest = (secs, re) => secs.map((s) => ({ s, m: re.exec(s.title) })).filter((x) => x.m).sort((a, b) => Number(b.m[1]) - Number(a.m[1]))[0];

/** The open findings of a critic section: [{id, text}]. Pure. */
export function openFindings(critic, fixesBody) {
    const fixed = new Set([...String(fixesBody || '').matchAll(/^\s*[-|]\s*\**([A-Z]\d+[a-z]?)\**[^\n]{0,12}?\bfixed\b/gim)].map((m) => m[1]));
    const out = [];
    // finding blocks: a paragraph or bullet starting **G1. / **F2. (to the next block, heading or "Minors")
    const body = critic.body;
    const starts = [...body.matchAll(/^(?:-\s+)?\*\*([A-Z]\d+[a-z]?)[.\s(]/gm)];
    starts.forEach((m, i) => {
        const end = i + 1 < starts.length ? starts[i + 1].index : body.length;
        let text = body.slice(m.index, end);
        const cut = text.search(/\n(?:#|Minors|\| r\d|### )/);
        if (cut > 0) text = text.slice(0, cut);
        // what the finding is ON: its title, text and PNGs - not its proposed check or why a gate missed it (those name
        // other roles: "the precritic plan lints the lesson and independent roles only")
        const why = text.search(/\*\*Check:|\bCheck:|Why it got through|Existing checks? that missed/);
        if (why > 0) text = text.slice(0, why);
        out.push({ id: m[1], text });
    });
    // the re-check table: | F2 | **OPEN** | evidence |
    for (const row of body.split('\n')) {
        const m = /^\|\s*\**([A-Z]\d+[a-z]?)\**([^|]*)\|([^|]*)\|(.*)$/.exec(row);
        if (m && /\bOPEN\b/.test(m[3])) out.push({ id: m[1], text: `${m[2]} ${m[3]} ${m[4]}` });
    }
    return out.filter((f) => !fixed.has(f.id));
}

/** The (skill, page) pairs a "Clean for the critic" paragraph claims. Pure. */
export function cleanClaims(para, aliases) {
    const head = String(para).split(/\bNOT clean\b/)[0].replace(/^Clean for the critic[^:]*:/i, '');
    const out = [];
    for (const clause of head.split(';')) {
        const buts = [...clause.matchAll(/\((?:but|except)\b([^)]*)\)/gi)].map((m) => m[1]);
        const main = clause.replace(/\((?:but|except)\b[^)]*\)/gi, ' ');
        const sk = skillsIn(main, aliases);
        const pg = pagesIn(main.split(/\bon\b/i)[0] || main);
        for (const s of sk) for (const p of pg) {
            if (buts.some((b) => skillsIn(b, aliases).includes(s) && pagesIn(b).includes(p))) continue;
            out.push({ skill: s, page: p });
        }
    }
    return out;
}

/** The pages a precritic section's gate table page-fill-linted, and whether it ran a screen gate. Pure. */
export function lintCover(body) {
    const names = String(body).split('\n').filter((l) => /^\|/.test(l)).map((l) => l.split('|')[1] || '');
    const linted = new Set();
    for (const n of names) if (/print-lint/i.test(n)) for (const p of pagesIn(n)) linted.add(p);
    const screen = names.some((n) => /\bscreen\b|screen-|chromebook|phone-card|card 1280|card \/ worksheet/i.test(n));
    return { linted, screen };
}

/** Every cat:skill key a status file names. Pure. */
export function keysIn(md) {
    return [...new Set([...String(md).matchAll(/\b([a-z][a-z0-9]*:[a-z][a-z0-9_]*)\b/g)].map((m) => m[1]).filter((k) => !/^(https?|node|claude|file|data):/.test(k)))];
}

export function audit(md, only = []) {
    const secs = sections(md);
    // the aliases of EVERY skill the file names, so a finding about other skills never falls back to "names no skill";
    // `only` (--skill) limits the claims checked
    const aliases = skillAliases([...new Set([...keysIn(md), ...only])]);
    const pre = latest(secs, /^Precritic r(\d+)\b/i);
    if (!pre) return { violations: [], note: 'no Precritic rN section' };
    const para = (pre.s.body.split(/\n\s*\n/).find((p) => /^Clean for the critic/im.test(p)) || '').replace(/\s+/g, ' ');
    if (!para) return { violations: [], note: `Precritic r${pre.m[1]}: no "Clean for the critic" claim` };
    const claims = cleanClaims(para.slice(para.search(/Clean for the critic/i)), aliases).filter((c) => !only.length || only.includes(c.skill));
    const crit = latest(secs, /^Critic r(\d+)\b/i);
    const fixes = crit ? secs.filter((s) => new RegExp(`^Fixes after critic r${crit.m[1]}\\b`, 'i').test(s.title)).map((s) => s.body).join('\n') : '';
    const open = crit ? openFindings(crit.s, fixes) : [];
    const cover = lintCover(pre.s.body);
    const violations = [];
    for (const c of claims) {
        const hit = [...new Set(open.filter((f) => {
            const fs = skillsIn(f.text, aliases);
            const fp = pagesIn(f.text);
            return (fs.length ? fs.includes(c.skill) : true) && (fp.length ? fp.includes(c.page) : true);
        }).map((f) => f.id))];
        if (hit.length) violations.push(`OPEN ${c.skill} ${c.page}: critic r${crit.m[1]} ${hit.join(', ')} open (none listed "- <ID> fixed" under "## Fixes after critic r${crit.m[1]}")`);
        if (HOSTS.has(c.page) ? c.page !== 'panel' && !cover.screen : !cover.linted.has(c.page)) {
            violations.push(`LINT ${c.skill} ${c.page}: no ${HOSTS.has(c.page) ? 'screen gate' : `print-lint row for ${c.page}`} in the Precritic r${pre.m[1]} gate table`);
        }
    }
    return { violations: [...new Set(violations)], note: `Precritic r${pre.m[1]} claims ${claims.length} (skill, page) pair(s); critic r${crit ? crit.m[1] : '-'} has ${open.length} open finding(s)` };
}

function statusFile() {
    const given = arg('--status', null);
    if (given) return resolve(ROOT, given);
    const br = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).stdout.trim();
    const dir = join(ROOT, 'design', 'status');
    if (!br || !existsSync(dir)) return null;
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.md'))) {
        const head = readFileSync(join(dir, f), 'utf8').split('\n').slice(0, 15).join('\n');
        if (new RegExp(`^Branch:\\s*${br.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*$`, 'm').test(head)) return join(dir, f);
    }
    return null;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    const file = statusFile();
    if (!file || !existsSync(file)) { console.log(`${TOOL}: OK (no lane status file for this branch: nothing claimed)`); process.exit(0); }
    const md = readFileSync(file, 'utf8');
    const keys = String(arg('--skill', arg('--skills', ''))).split(',').map((s) => s.trim()).filter((s) => s.includes(':'));
    const r = audit(md, keys);
    console.log(`${TOOL}: ${file.replace(ROOT + '/', '')}: ${r.note}`);
    for (const v of r.violations) console.log(`  ${v}`);
    console.log(r.violations.length ? `${TOOL}: FAIL (${r.violations.length})` : `${TOOL}: OK`);
    process.exit(r.violations.length ? 1 : 0);
}
