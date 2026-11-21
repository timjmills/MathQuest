#!/usr/bin/env node
// ws-pacing — PACING-FILE gate (design/cards/lessons-browser 0b). The school-year unit dates that the Lessons screen's
// "By unit / date" view reads (data/curriculum/pacing/<YYYY-YY>.json, listed in data/curriculum/pacing/index.json).
//
//   node tests/scripts/ws-pacing.mjs            exit 1 on any problem; prints `ws-pacing: OK` / `ws-pacing: FAIL (n)`
//   MQ_ROOT=<tree>                              check another tree (ws-backtest commit-pair rows)
//
// Rules: index.json lists exactly the files in the folder (at least one); every file parses; `schoolYear` equals the file
// name; every grade is a WRM_SEQUENCE grade (data/curriculum/wrm-sequence.json) and every unit id exists in it; each grade
// lists every unit of the grade exactly once; a unit is dated (start and end, ISO, start <= end) or undated (both null)
// and an undated unit is one the school site gives no weeks; dated units come first; no two dated units of a grade overlap
// by a day; the dated units' order equals their order by start week in wrm-sequence.json (the teaching order); every date
// falls inside the school year (1 Aug - 31 Jul).
// Node only (no browser).
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.env.MQ_ROOT ? resolve(process.env.MQ_ROOT) : resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const DIR = join(ROOT, 'data/curriculum/pacing');
const bad = [];
const fail = (m) => bad.push(m);
const ISO = /^\d{4}-\d{2}-\d{2}$/;
const okDate = (s) => ISO.test(s) && !Number.isNaN(Date.parse(`${s}T00:00:00Z`)) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
const nextDay = (s) => { const d = new Date(`${s}T00:00:00Z`); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); };
const wn = (w) => +String(w).replace(/\D/g, '');

if (!existsSync(DIR)) fail('data/curriculum/pacing/ does not exist');
else {
    const seq = JSON.parse(readFileSync(join(ROOT, 'data/curriculum/wrm-sequence.json'), 'utf8'));
    const files = readdirSync(DIR).filter((f) => f !== 'index.json' && f.endsWith('.json')).sort();
    let idx = null;
    try { idx = JSON.parse(readFileSync(join(DIR, 'index.json'), 'utf8')); } catch (e) { fail(`index.json: ${e.message}`); }
    const listed = idx && Array.isArray(idx.years) ? idx.years.map((y) => `${y}.json`).sort() : [];
    if (idx && JSON.stringify(listed) !== JSON.stringify(files)) fail(`index.json lists ${listed.join(', ') || 'nothing'}; the folder holds ${files.join(', ') || 'nothing'}`);
    if (!files.length) fail('no pacing file');
    for (const f of files) {
        let d;
        try { d = JSON.parse(readFileSync(join(DIR, f), 'utf8')); } catch (e) { fail(`${f}: does not parse (${e.message})`); continue; }
        const year = f.replace(/\.json$/, '');
        const m = /^(\d{4})-(\d{2})$/.exec(year);
        if (!m || (+m[1] + 1) % 100 !== +m[2]) { fail(`${f}: the file name is not a school year YYYY-YY`); continue; }
        if (d.schoolYear !== year) fail(`${f}: schoolYear "${d.schoolYear}" is not the file's year ${year}`);
        if (!d.source || typeof d.source !== 'string') fail(`${f}: no source line`);
        const lo = `${m[1]}-08-01`, hi = `${+m[1] + 1}-07-31`;
        if (!d.grades || typeof d.grades !== 'object') { fail(`${f}: no grades`); continue; }
        for (const [gid, list] of Object.entries(d.grades)) {
            const g = seq.grades.find((x) => x.id === gid);
            const tag = `${f} grade ${gid}`;
            if (!g) { fail(`${tag}: not a WRM_SEQUENCE grade`); continue; }
            if (!Array.isArray(list)) { fail(`${tag}: not a list`); continue; }
            const ids = list.map((x) => x && x.unit);
            for (const id of ids) if (!g.units.some((u) => u.id === id)) fail(`${tag}: unit ${id} is not a unit of the grade`);
            for (const u of g.units) { const n = ids.filter((x) => x === u.id).length; if (n !== 1) fail(`${tag}: unit ${u.id} listed ${n} times (exactly once)`); }
            let seenUndated = false;
            const dated = [];
            for (const x of list) {
                if (!x) continue;
                const und = x.start == null && x.end == null;
                if (und) {
                    seenUndated = true;
                    const u = g.units.find((y) => y.id === x.unit);
                    if (u && /W\d+/.test(String(u.weeks || ''))) fail(`${tag}: unit ${x.unit} is undated but the school site gives it weeks ${u.weeks}`);
                    continue;
                }
                if (seenUndated) fail(`${tag}: dated unit ${x.unit} after an undated one (dated units first)`);
                if (!okDate(x.start) || !okDate(x.end)) { fail(`${tag}: unit ${x.unit} dates ${x.start} / ${x.end} are not ISO dates`); continue; }
                if (x.start > x.end) fail(`${tag}: unit ${x.unit} starts ${x.start} after it ends ${x.end}`);
                if (x.start < lo || x.end > hi) fail(`${tag}: unit ${x.unit} ${x.start}..${x.end} is outside the school year ${lo}..${hi}`);
                dated.push(x);
            }
            const byStart = dated.slice().sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
            for (let i = 1; i < byStart.length; i++) if (byStart[i].start < nextDay(byStart[i - 1].end)) fail(`${tag}: units ${byStart[i - 1].unit} (to ${byStart[i - 1].end}) and ${byStart[i].unit} (from ${byStart[i].start}) overlap`);
            if (dated.map((x) => x.unit).join() !== byStart.map((x) => x.unit).join()) fail(`${tag}: the dated units are not in date order`);
            const teach = g.units.filter((u) => dated.some((x) => x.unit === u.id))
                .map((u, i) => ({ id: u.id, i, w: wn((String(u.weeks || '').match(/W\d+/) || ['W999'])[0]) }))
                .sort((a, b) => a.w - b.w || a.i - b.i).map((u) => u.id);
            if (dated.map((x) => x.unit).join() !== teach.join()) fail(`${tag}: order ${dated.map((x) => x.unit).join(', ')} is not the school's teaching order by start week ${teach.join(', ')}`);
        }
    }
}
for (const b of bad) console.log(`  FAIL ${b}`);
console.log(bad.length ? `ws-pacing: FAIL (${bad.length})` : 'ws-pacing: OK');
process.exit(bad.length ? 1 : 0);
