#!/usr/bin/env node
/*
 * ws-wrm-extract — build data/curriculum/wrm-steps.json, the White Rose Maths small-step inventory.
 *
 *   node tests/scripts/ws-wrm-extract.cjs --site <path to awsajacademymath/index.html>
 *   node tests/scripts/ws-wrm-extract.cjs --site <path> --check   # diff only, write nothing
 *
 * The source is the school curriculum site (repo timjmills/awsajacademymath, one self-contained
 * index.html). Its gzip+base64 `__data` block holds, among others:
 *   RESOURCES  the Google Drive "White Rose Maths Primary" tree the site links to: per school grade
 *              the WRM year folder, its block folders, and per small step the WRM files (lesson PDF,
 *              teaching slides, worksheet, the owner's "Teaching Guide" (Guide D) PDF, video URL).
 *              This is the authoritative step list: year -> block -> step, with Drive ids.
 *   PACING     per school grade and week, the steps taught, keyed by the same (block, step), with
 *              the CCSS codes of the v3 crosswalk (`c`) and the power-standard flag (`p`).
 *   CURRICULUM the v3 crosswalk re-sorted by US grade/domain (the Drive sheet
 *              "WRM_to_CCSS_Mapping_v3 (with Beyond CCSS)" is generated from this same data):
 *              per lesson a flag (native / above / non-ccss / committee) and a tagging note.
 *   EEMAP      the site's CCSS -> Wisconsin Essential Element links.
 *
 * EE codes come from OUR database (data/standards/ccss-math.json -> ee) via each step's CCSS codes;
 * the site's EEMAP is compared and every disagreement is written to meta.disagreements.
 *
 * Grade rule (the school's, and the v3 sheet's): Reception = PK4, WRM Year N = US grade N-1
 * (Year 1 = Kindergarten ... Year 6 = Grade 5). A step's CCSS codes can sit above or below that
 * grade; `flag` says so ("above" = the CCSS code is above the school grade).
 */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..', '..');
const OUT = path.join(ROOT, 'data', 'curriculum', 'wrm-steps.json');
const VOCAB = path.join(ROOT, 'data', 'curriculum', 'wrm-vocab.json');

// Reconciliation of the three sources, checked by hand on 2026-09-25 (Drive listings through the
// Google Drive connector; the v3 sheet read through the same connector). Kept here so a rebuild
// keeps them in the JSON; update them when the sources change.
const RECONCILIATION = [
    'Drive vs site: the site RESOURCES tree is the Drive tree (same folder and file ids). Spot checks against live Drive listings matched: the Year 3 folder (1l9hjSYKWnwYnfwPj7Nui4Re5CDWJfWFi) block folders, the Teaching Guides of Year 3 Spring Block 3 (Fractions A), and the guides for Y3.B2.S21, Y4.B1.S16 and Y6.B1.S4. The Drive connector returns at most 5 files per page, so the 872 steps were not re-listed one by one.',
    'Site pacing vs Drive: every Drive small step is in the site pacing under the same block and step number, with the same title except where the school teaches money in US dollars (the pacing adds "(US: dollars & cents)"; kept as usAdaptation). The pacing also schedules 36 Awsaj-authored "committee" lessons (kept as block supplements, not WRM steps).',
    'v3 sheet vs site: the sheet says it is generated from the same data as the site, and its per-step CCSS codes are the site\'s. Its summary says "913 distinct White Rose small steps (PK4-Grade 5) plus 16 CCSS custom lessons still to be built". Drive has 872 small steps (Reception 119, Y1 116, Y2 124, Y3 134, Y4 129, Y5 136, Y6 114); the site\'s per-grade lesson lists hold 878 distinct titles (a title repeated inside Reception counts once; above-grade steps are listed in two grades) and 36 committee lessons; the sheet\'s lesson tabs have 849 rows. Neither 913 nor 16 could be reproduced from any source; the 872 Drive steps are the inventory used here.',
    'Grade rule: the site and the sheet map Reception to PK4 and WRM Year N to US grade N-1 (the Fluency folder on Drive agrees: "Year 1 = US Kindergarten"). This differs from the rule of thumb "Reception = K"; the school\'s rule is used.',
    'Teaching Guides (Guide D): every step has one (873 files; Y6.B4.S7 has a second copy named after step 6, listed above). Every other guide title equals the Drive lesson title. Both Y6.B4.S7 files are Step 7 guides (their headers say so); the first is the one read for vocabulary. Key vocabulary for all 872 steps is extracted from the guides into data/curriculum/wrm-vocab.json by tests/scripts/ws-wrm-vocab.py.',
];
const args = process.argv.slice(2);
const argv = (n) => { const i = args.indexOf(`--${n}`); return i > -1 ? args[i + 1] : null; };
// Default: a clone of timjmills/awsajacademymath beside the repo (or beside the main checkout when
// this runs in .claude/worktrees/<name>).
const SITE = argv('site') || [path.resolve(ROOT, '..', 'timjmills', 'awsajacademymath', 'index.html'),
    path.resolve(ROOT, '..', '..', '..', '..', 'timjmills', 'awsajacademymath', 'index.html')].find((p) => fs.existsSync(p))
    || 'awsajacademymath/index.html (pass --site <path>)';
const CHECK = args.includes('--check');

const YEARS = [
    { g: 'PK', id: 'R', name: 'Reception', usGrade: 'PK', schoolGrade: 'PK4' },
    { g: 'K', id: 'Y1', name: 'Year 1', usGrade: 'K', schoolGrade: 'Kindergarten' },
    { g: 'G1', id: 'Y2', name: 'Year 2', usGrade: '1', schoolGrade: 'Grade 1' },
    { g: 'G2', id: 'Y3', name: 'Year 3', usGrade: '2', schoolGrade: 'Grade 2' },
    { g: 'G3', id: 'Y4', name: 'Year 4', usGrade: '3', schoolGrade: 'Grade 3' },
    { g: 'G4', id: 'Y5', name: 'Year 5', usGrade: '4', schoolGrade: 'Grade 4' },
    { g: 'G5', id: 'Y6', name: 'Year 6', usGrade: '5', schoolGrade: 'Grade 5' },
];

const norm = (t) => String(t).toLowerCase().replace(/\(us: dollars & cents\)/g, '').replace(/&/g, 'and').replace(/[^a-z0-9]/g, '');
// The site writes sub-standards as 3.NF.A.3.B; the database as 3.NF.A.3b.
const fixCode = (c) => String(c).replace(/^(.+\.\d{1,2})\.([A-Da-d])$/, (m, a, b) => `${a}${b.toLowerCase()}`);
const eeTop = (e) => e.replace(/\.[a-z]$/, '');
const US_MONEY = / \(US: dollars & cents\)$/;

function readSite(file) {
    const html = fs.readFileSync(file, 'utf8');
    const m = html.match(/<script id="__data" type="application\/octet-stream">([\s\S]*?)<\/script>/);
    if (!m) throw new Error(`no __data block in ${file}`);
    return JSON.parse(zlib.gunzipSync(Buffer.from(m[1].trim(), 'base64')).toString('utf8'));
}

/** Title from a WRM file name: "07 Step 7 Fraction of an amount - find the whole.pdf". */
function titleFrom(name) {
    const m = String(name).match(/^\d+\s+Step\s+[\d.]+\s+(.*?)(?:\s+-\s+(?:Teaching Guide|Teaching slides|PowerPoint|Worksheet(?: \(display\))?|Answers|True or false|TA [A-Za-z-]+))?\.(?:pdf|pptx)$/);
    return m ? m[1].trim() : null;
}

function main() {
    const site = readSite(SITE);
    const cc = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/standards/ccss-math.json'), 'utf8'));
    const ccBy = new Map(cc.standards.map((s) => [s.code, s]));
    const disagreements = [];
    const vocab = fs.existsSync(VOCAB) ? JSON.parse(fs.readFileSync(VOCAB, 'utf8')).steps : {};
    const dis = (m) => disagreements.push(m);

    const eeFor = (code) => {
        const s = ccBy.get(code);
        if (!s) return null;
        const top = s.parent ? ccBy.get(s.parent) : s;
        return top.ee || [];
    };

    const years = [];
    let stepTotal = 0, blockTotal = 0;
    for (const Y of YEARS) {
        const res = site.RESOURCES[Y.g];
        const pac = site.PACING.grades[Y.g];
        // pacing: (block, step) -> { n, c, p }
        const paced = new Map();
        const supplements = new Map();
        for (const w of pac.weeks) {
            for (const t of Object.values(w.t)) {
                for (const st of t.st) {
                    if (st.b == null || st.s == null) continue;
                    if (st.s === 'SUP' || st.f === 'committee') {
                        const k = `${st.b}|${st.n}`;
                        if (!supplements.has(k)) supplements.set(k, { block: st.b, title: st.n, ccss: st.c, power: !!st.p, firstWeek: w.wk });
                        continue;
                    }
                    const k = `${st.b}|${st.s}`;
                    if (!paced.has(k)) paced.set(k, { n: st.n, c: st.c, p: !!st.p, wk: w.wk });
                    else if (norm(paced.get(k).n) !== norm(st.n)) dis(`${Y.id} B${st.b} S${st.s}: pacing names it both "${paced.get(k).n}" and "${st.n}"`);
                }
            }
        }
        // CURRICULUM (v3): title -> [{flag, note, ccss, unit}]
        const cur = new Map();
        for (const dom of site.CURRICULUM.grades[Y.g].domains) {
            for (const u of dom.coreUnits) {
                for (const s of u.steps) {
                    const k = norm(s.title);
                    if (!cur.has(k)) cur.set(k, []);
                    cur.get(k).push({ flag: s.flag, note: s.note, ccss: s.ccss, unit: u.name, domain: dom.code });
                }
            }
        }
        const blocks = [];
        const otherFolders = [];
        for (const [bk, b] of Object.entries(res.b).sort((a, z) => Number(a[0]) - Number(z[0]))) {
            const steps = Object.keys(b.s || {}).sort((a, z) => Number(a) - Number(z));
            const fm = b.n.match(/^(\d+)\s+(?:Reception\s+-\s+)?(Autumn|Spring|Summer)\s+(?:-\s+)?Block\s+(\d+)(?:\s+-\s+(.*))?$/);
            if (!steps.length || !fm) { otherFolders.push({ name: b.n, driveFolder: b.f, note: 'no small steps (not a teaching block)' }); continue; }
            const unit = pac.units[bk];
            const name = fm[4] || (unit && unit.n) || b.n;
            if (fm[4] && unit && !norm(unit.n).startsWith(norm(fm[4]))) {
                // names that only differ by "&" / "(to 10,000)" etc. are recorded, not failed
                dis(`${Y.id} B${bk}: Drive folder "${fm[4]}", site pacing unit "${unit.n}"`);
            }
            const block = {
                id: `${Y.id}.B${Number(bk)}`, number: Number(bk), term: fm[2], termBlock: Number(fm[3]), name,
                driveFolder: b.f, steps: [],
            };
            if (unit && unit.n && norm(unit.n) !== norm(name)) block.siteName = unit.n;
            for (const sn of steps) {
                const files = b.s[sn];
                const lesson = files.find((f) => f.k === 'lesson');
                const guides = files.filter((f) => f.k === 'guide');
                const video = files.find((f) => f.k === 'video' && f.u);
                const title = titleFrom(lesson ? lesson.n : (guides[0] || files[0]).n) || (lesson || files[0]).n;
                const p = paced.get(`${bk}|${sn}`);
                const step = { id: `${block.id}.S${Number(sn)}`, number: Number(sn), title };
                if (!p) dis(`${step.id} "${title}": on Drive but not in the site pacing`);
                const siteTitle = p ? p.n.replace(US_MONEY, '') : null;
                if (siteTitle && norm(siteTitle) !== norm(title)) {
                    step.siteTitle = siteTitle;
                    dis(`${step.id}: Drive lesson file "${title}", site pacing "${siteTitle}"`);
                }
                for (const gd of guides) {
                    const gt = titleFrom(gd.n);
                    if (gt && norm(gt) !== norm(title)) dis(`${step.id} "${title}": Teaching Guide file is named "${gd.n}"`);
                }
                if (p && US_MONEY.test(p.n)) step.usAdaptation = 'Taught in US dollars and cents at the school (WRM uses pounds and pence).';
                step.ccss = p ? p.c.map(fixCode) : [];
                const ee = [];
                for (const c of step.ccss) {
                    const e = eeFor(c);
                    if (e === null) { dis(`${step.id}: CCSS ${c} is not in data/standards/ccss-math.json`); continue; }
                    for (const x of e) if (!ee.includes(x)) ee.push(x);
                    const siteE = [...new Set(((site.EEMAP.byCC[c.replace(/[a-d]$/, '')] || {}).ee || []).map(eeTop))];
                    const mine = e.slice().sort().join(',');
                    if (siteE.slice().sort().join(',') !== mine) {
                        const key = `EE ${c}`;
                        if (!disagreements.some((d) => d.startsWith(key))) dis(`${key}: our ee-math.json links [${e.join(', ') || 'none'}], the site EEMAP links [${siteE.join(', ') || 'none'}]`);
                    }
                }
                step.ee = ee;
                if (p && p.p) step.power = true;
                const cands = cur.get(norm(title)) || (siteTitle ? cur.get(norm(siteTitle)) : null) || [];
                const hit = cands.find((x) => x.ccss.map(fixCode).join() === step.ccss.join()) || cands[0];
                if (hit) {
                    step.flag = hit.flag;
                    const note = hit.note && !/^White Rose Block \d+ Step \d+ — added/.test(hit.note) ? hit.note : '';
                    if (note) step.notes = [note];
                    if (hit.ccss.map(fixCode).join() !== step.ccss.join()) dis(`${step.id} "${title}": pacing CCSS [${step.ccss.join(', ')}], v3 curriculum CCSS [${hit.ccss.join(', ')}]`);
                } else step.flag = step.ccss.length ? 'native' : 'non-ccss';
                if (!step.ccss.length) {
                    step.notes = step.notes || [];
                    step.notes.push(Y.g === 'PK' ? 'Beyond CCSS: Reception (PK4) step, Kindergarten readiness.' : 'Beyond CCSS: no CCSS K-5 standard (UK National Curriculum content).');
                }
                step.drive = {};
                if (lesson) step.drive.lesson = lesson.id;
                if (guides.length) step.drive.guide = guides.length === 1 ? guides[0].id : guides.map((x) => x.id);
                if (video) step.drive.video = video.u;
                const v = vocab[step.id];
                step.vocab = (Array.isArray(v) ? v : (v && v.words) || []).slice();
                block.steps.push(step);
            }
            for (const s of supplements.values()) {
                if (String(s.block) !== bk) continue;
                block.supplements = block.supplements || [];
                block.supplements.push({ title: s.title, ccss: s.ccss.map(fixCode), ee: [...new Set(s.ccss.map(fixCode).flatMap((c) => eeFor(c) || []))], note: 'Awsaj-authored lesson that closes a CCSS standard WRM does not teach (site flag "committee"). Not a WRM small step.' });
            }
            blocks.push(block);
            blockTotal += 1;
            stepTotal += block.steps.length;
        }
        years.push({ id: Y.id, name: Y.name, usGrade: Y.usGrade, schoolGrade: Y.schoolGrade, driveFolder: res.y, blocks, otherFolders });
    }

    const out = {
        meta: {
            title: 'White Rose Maths small steps (Reception to Year 6), with the v3 CCSS crosswalk and Wisconsin Essential Elements',
            generatedBy: 'node tests/scripts/ws-wrm-extract.cjs --site <awsajacademymath/index.html>',
            sources: [
                'School curriculum site https://timjmills.github.io/awsajacademymath/ (repo timjmills/awsajacademymath, index.html): RESOURCES (the Drive tree), PACING (per-step CCSS), CURRICULUM (v3 flags and notes), EEMAP.',
                'Google Drive shared drive "White Rose Maths Primary" (1bsCJFujsEghicw7Kk9D8a1KiaVdtqdtv): year and block folders; step titles are the WRM lesson file names.',
                'Google Sheet WRM_to_CCSS_Mapping_v3 (with Beyond CCSS) (13w-fpwh0mrlXPC6qJ4Y8ZcNIcdWtRM1AbQa5Smh4ygs): generated from the same site data (its own header says so).',
                'Wisconsin Essential Elements: data/standards/ee-math.json, linked through data/standards/ccss-math.json.',
            ],
            gradeRule: 'The school rule, followed by the v3 sheet: Reception = PK4 (Kindergarten readiness, no CCSS of its own); WRM Year N = US grade N-1 (Year 1 = K, Year 2 = Grade 1, ... Year 6 = Grade 5). A step\'s CCSS codes may sit above that grade (flag "above") or have none (flag "non-ccss", Beyond CCSS).',
            idFormat: '<year>.B<block>.S<step>: year R, Y1 ... Y6; block = the WRM block folder number within the year (01..), step = the WRM small-step number. Example: Y4.B1.S3 = Year 4, Autumn Block 1 (Place value), Step 3.',
            fields: {
                ccss: 'v3 crosswalk codes for the step (site PACING), primary first',
                ee: 'Wisconsin Essential Elements linked to those CCSS codes in our database',
                flag: 'v3 flag: native (CCSS at the school grade), above (CCSS above the grade), non-ccss (Beyond CCSS)',
                power: 'the step teaches a school power standard',
                siteTitle: 'the site pacing title where it differs from the WRM Drive file name',
                drive: 'Drive file ids: lesson PDF, owner Teaching Guide (Guide D) PDF(s), WRM teaching video',
                vocab: 'key vocabulary from the step\'s Teaching Guide: the "Pre-teach" words (data/curriculum/wrm-vocab.json, which also holds meanings, stems and the key model; empty = not extracted)',
                supplements: 'Awsaj-authored lessons placed in the block to close CCSS standards WRM does not teach; not WRM small steps',
            },
            counts: { years: years.length, blocks: blockTotal, steps: stepTotal },
            disagreements,
            reconciliation: RECONCILIATION,
        },
        years,
    };
    const text = `${JSON.stringify(out, null, 1)}\n`;
    if (CHECK) {
        const same = fs.existsSync(OUT) && fs.readFileSync(OUT, 'utf8') === text;
        console.log(same ? 'ws-wrm-extract: up to date' : 'ws-wrm-extract: data/curriculum/wrm-steps.json differs from the site');
        process.exit(same ? 0 : 1);
    }
    fs.mkdirSync(path.dirname(OUT), { recursive: true });
    fs.writeFileSync(OUT, text);
    console.log(`wrote ${path.relative(ROOT, OUT)}: ${years.length} years, ${blockTotal} blocks, ${stepTotal} steps, ${disagreements.length} disagreements`);
}

main();
