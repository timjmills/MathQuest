#!/usr/bin/env node
// ws-pacing-seed — one-off seed of data/curriculum/pacing/<YYYY-YY>.json from the school site's week table
// (data/curriculum/wrm-sequence.json: grades[].units[].weeks "W07–W11" and grades[].weeks[W].weekOf "18–22 Oct").
// design/cards/lessons-browser 0b. Never invents a date: a unit whose weeks the sequence does not give, or whose weeks
// carry no weekOf, stays UNDATED ({ unit, start: null, end: null }); a grade with no dated unit is left out. When two units
// share a boundary week (W07 ends D1 and starts D3), the week goes to the earlier unit and the next unit starts the
// following week. The owner checks and edits the file each year (a week can be split by day by hand).
//
//   node tests/scripts/ws-pacing-seed.mjs [--year 2026-27] [--write]   (prints the JSON; --write saves it)
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > -1 ? process.argv[i + 1] : d; };
const YEAR = arg('year', '2026-27');
const y0 = +YEAR.slice(0, 4);
const MON = { jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5, jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11 };
const iso = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
const yearOf = (m) => (m >= 7 ? y0 : y0 + 1);

/** "6–10 Sep" / "27 Sep–1 Oct" -> { start, end } ISO, or null. */
export function weekDates(weekOf) {
    const m = /(\d+)\s*(?:([A-Za-z]{3})[a-z]*)?\s*[–-]\s*(\d+)\s*([A-Za-z]{3})/.exec(String(weekOf || ''));
    if (!m) return null;
    const endM = MON[m[4].toLowerCase()];
    const startM = m[2] ? MON[m[2].toLowerCase()] : endM;
    if (endM == null || startM == null) return null;
    return { start: iso(yearOf(startM), startM, +m[1]), end: iso(yearOf(endM), endM, +m[3]) };
}
const wn = (w) => +String(w).replace(/\D/g, '');

export function seed(seq) {
    const grades = {};
    for (const g of seq.grades) {
        const weeks = g.weeks || {};
        const units = g.units.map((u, i) => {
            const ws = (String(u.weeks || '').match(/W\d+/g) || []).map(wn);
            return { unit: u.id, i, a: ws[0] || 0, b: ws[ws.length - 1] || 0 };
        });
        const dated = units.filter((u) => u.a && u.b).sort((x, y) => x.a - y.a || x.i - y.i);
        // the boundary week goes to the earlier unit
        for (let k = 1; k < dated.length; k++) if (dated[k].a <= dated[k - 1].b) dated[k].a = dated[k - 1].b + 1;
        const key = (n) => `W${String(n).padStart(2, '0')}`;
        const rows = dated.map((u) => {
            const s = weekDates((weeks[key(u.a)] || {}).weekOf);
            const e = weekDates((weeks[key(u.b)] || {}).weekOf);
            return s && e && u.a <= u.b ? { unit: u.unit, start: s.start, end: e.end } : { unit: u.unit, start: null, end: null };
        });
        const undated = units.filter((u) => !rows.some((r) => r.unit === u.unit)).map((u) => ({ unit: u.unit, start: null, end: null }));
        if (!rows.some((r) => r.start)) continue;
        grades[g.id] = [...rows.filter((r) => r.start), ...rows.filter((r) => !r.start), ...undated];
    }
    return {
        schoolYear: YEAR,
        source: `Seeded ${new Date().toISOString().slice(0, 10)} by tests/scripts/ws-pacing-seed.mjs from data/curriculum/wrm-sequence.json (the school site's unit weeks and week dates); undated units have no weeks on the site; the owner checks and edits it each year`,
        grades,
    };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) {
    const out = seed(JSON.parse(readFileSync(resolve(ROOT, 'data/curriculum/wrm-sequence.json'), 'utf8')));
    const txt = `${JSON.stringify(out, null, 1)}\n`;
    if (process.argv.includes('--write')) {
        mkdirSync(resolve(ROOT, 'data/curriculum/pacing'), { recursive: true });
        writeFileSync(resolve(ROOT, `data/curriculum/pacing/${YEAR}.json`), txt);
        console.log(`ws-pacing-seed: wrote data/curriculum/pacing/${YEAR}.json (${Object.keys(out.grades).length} grades)`);
    } else process.stdout.write(txt);
}
