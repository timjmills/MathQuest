// ws-patterns-cells — node checks of the patterns family's own cells against what a page asks of them (lane lf-algebra r10,
// after critic r2). No browser, about a second.
//
//   node tests/scripts/ws-patterns-cells.mjs [--skill cat:a,...] [--root DIR]
//
//   LABEL-REF  (critic r2 G5) every choice letter Error analysis prints in its Fix-it row for a feature item (A, B, C - the
//              letters roles/error-analysis.js choicesOf gives a choice list of long sentences) is printed inside the item:
//              the feature cell in its 'wrong' state carries one data-ws-letter per sentence, A.. in order, on paper and screen.
//   TILE-CARD  (critic r2 G6) the feature track's tiles, where the Test leaves them for the pupil to write in, are the card's
//              size: design/cards/patterns/patterns.md "feature track tiles a / b / c mm (S / M / L)", width and height.
//   ROW2-S     (critic r2 G8) a growing cell at S keeps its four terms on one row in a half-width (two-across) cell: the
//              root's left keep-out shrinks (a clamp to 0) so that row + keep-out never exceeds the 2-column cell, and the
//              row itself fits the 2-column content width the bridge measures (86 mm at S, critic r2 probe).
// Only skills of the patterns card are in scope; --skill with none of them prints OK (n/a).
import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const TOOL = 'ws-patterns-cells';
const args = process.argv.slice(2);
const arg = (f, d) => { const i = args.indexOf(f); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const ROOT = resolve(arg('--root', process.env.MQ_ROOT || join(dirname(fileURLToPath(import.meta.url)), '..', '..')));
const SCOPE = ['patterns:notice_patterns', 'patterns:pattern_features', 'patterns:growing_shape_patterns'];
const only = String(arg('--skill', arg('--skills', ''))).split(',').map((s) => s.trim()).filter(Boolean);
const mine = only.length ? SCOPE.filter((k) => only.includes(k) || only.includes(k.split(':')[1])) : SCOPE;
if (!mine.length) { console.log(`${TOOL}: OK (n/a: no patterns-card skill in scope)`); process.exit(0); }

const kit = await import(pathToFileURL(join(ROOT, 'js', 'modules', 'sheet', 'index.js')).href);
const fails = [];
const SIZES = ['S', 'M', 'L'];
const ctxOf = (size, extra = {}) => Object.assign({ size, look: 'ican', metrics: kit.metricsFor ? kit.metricsFor(size) : undefined }, extra);
const feature = { task: 'feature', start: 3, step: 5, terms: [3, 8, 13, 18, 23, 28], choices: ['Every number ends in 3.', 'The ones digits go 3, 8, 3, 8.', 'Every number is odd.'], correct: 1, show: false };

if (mine.some((k) => /notice_patterns|pattern_features/.test(k))) {
    const cell = kit.getCell('notice');
    // LABEL-REF
    for (const size of SIZES) {
        for (const twin of [false, true]) {
            const ctx = ctxOf(size, { state: 'wrong', wrong: { value: feature.choices[0] } });
            if (twin) ctx.options = { twin: true };
            let html = '';
            try { html = cell.render(feature, ctx); } catch (e) { fails.push(`LABEL-REF ${size}${twin ? ' screen' : ''}: render threw ${e.message}`); continue; }
            const got = [...html.matchAll(/data-ws-letter="([A-Z])"/g)].map((m) => m[1]).join('');
            const want = 'ABCDEF'.slice(0, feature.choices.length);
            if (got !== want) fails.push(`LABEL-REF ${size}${twin ? ' screen' : ''}: the sentences carry letters "${got}", the Fix-it row offers ${want.split('').join(' / ')}`);
        }
    }
    // TILE-CARD
    const card = readFileSync(join(ROOT, 'design', 'cards', 'patterns', 'patterns.md'), 'utf8');
    const m = /feature track tiles ([\d.]+) \/ ([\d.]+) \/ ([\d.]+) mm/.exec(card);
    if (!m) fails.push('TILE-CARD: the card no longer states "feature track tiles a / b / c mm"');
    else {
        SIZES.forEach((size, i) => {
            const want = Number(m[i + 1]);
            const html = cell.render(feature, ctxOf(size, { state: 'blank', scaffoldLevel: 0 }));
            const tiles = [...html.matchAll(/class="mq-nt-tile"[^>]*data-ws-slot="w\d"[^>]*style="[^"]*?width:([\d.]+)mm;height:([\d.]+)mm/g)];
            if (!tiles.length) { fails.push(`TILE-CARD ${size}: no working tile on the Test-state track`); return; }
            const bad = tiles.filter((t) => Number(t[1]) < want - 0.05 || Number(t[2]) < want - 0.05);
            if (bad.length) fails.push(`TILE-CARD ${size}: working tiles ${bad[0][1]} x ${bad[0][2]} mm, the card says ${want} mm`);
        });
    }
}

if (mine.includes('patterns:growing_shape_patterns')) {
    const cell = kit.getCell('growing-pattern');
    const p = { fam: 'rows2', e: 0, shape: 'dots', ask: 'next', step: 2, counts: [2, 4, 6, 8], count10: 20, show: true, unit: 'dots' };
    const html = cell.render(p, ctxOf('S', { state: 'blank' }));
    const box = Number((/class="mq-gp-box"[^>]*?width:([\d.]+)mm/.exec(html) || [])[1]);
    const gap = Number((/class="mq-gp-pair" style="[^"]*?gap:([\d.]+)mm/.exec(html) || [])[1]);
    const pad = /padding:0 0 0 ([^;]+);box-sizing/.exec(html);
    const CONTENT_2COL_S = 86;   // the bridge's measured content width of a 2-column cell at S (critic r2 probe: 4 cols 40.0, 5 cols 30.8)
    const row = 4 * box + 3 * gap;
    if (!Number.isFinite(row)) fails.push('ROW2-S: cannot read the growing row geometry (mq-gp-box / mq-gp-pair)');
    else {
        if (row > CONTENT_2COL_S) fails.push(`ROW2-S: the 4-term row is ${row.toFixed(1)} mm, wider than a 2-column cell at S (${CONTENT_2COL_S} mm)`);
        const padMin = pad && /^clamp\(0mm,/.test(pad[1]) ? 0 : pad ? Number((/([\d.]+)mm/.exec(pad[1]) || [])[1]) + 1 : 0;
        if (row + padMin > CONTENT_2COL_S) fails.push(`ROW2-S: row ${row.toFixed(1)} mm + a fixed ${padMin.toFixed(1)} mm keep-out (${pad ? pad[1] : '-'}) is over the 2-column cell (${CONTENT_2COL_S} mm): the row wraps 2 + 2 and S prints one cell a row`);
    }
}

for (const f of fails) console.log(`  ${f}`);
console.log(fails.length ? `${TOOL}: FAIL (${fails.length})` : `${TOOL}: OK (${mine.join(', ')})`);
process.exit(fails.length ? 1 : 0);
