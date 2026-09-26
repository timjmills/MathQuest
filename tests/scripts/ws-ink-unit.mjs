// Unit tests for js/modules/print-ink.js — the one function that puts legacy print markup into
// ink (WORKSHEET_DESIGN_STANDARD.md INK-1..INK-5, LS-2, INK-10).
//
//   node tests/scripts/ws-ink-unit.mjs
//
// Prints `ws-ink-unit: OK` or `ws-ink-unit: FAIL` and exits non-zero on failure.
import { inkHTML, inkResidue, classifyColor, inkFill, inkStroke, inkText } from '../../js/modules/print-ink.js';
import { stripSegStyle } from '../../js/modules/sheet/tokens.js';

let pass = 0, fail = 0;
const eq = (name, got, want) => {
    if (got === want) { pass++; return; }
    fail++;
    console.log(`  FAIL ${name}\n     got:  ${got}\n     want: ${want}`);
};
const ok = (name, cond, detail = '') => { if (cond) pass++; else { fail++; console.log(`  FAIL ${name} ${detail}`); } };
const has = (name, html, needle) => ok(name, html.includes(needle), `\n     ${html}\n     lacks ${needle}`);
const lacks = (name, html, needle) => ok(name, !html.includes(needle), `\n     ${html}\n     still has ${needle}`);

/* ------------------------------------------------------------ classification */
eq('hex strong', classifyColor('#3b82f6').kind, 'strong');
eq('hex short white', classifyColor('#fff').kind, 'white');
eq('pastel is light', classifyColor('#e3f2fd').kind, 'light');
eq('near white f5', classifyColor('#f5f5f5').kind, 'white');
eq('#333 is black', classifyColor('#333').kind, 'black');
eq('#999 is grey', classifyColor('#999').kind, 'grey');
eq('#ccc is light', classifyColor('#ccc').kind, 'light');
ok('rgba wash is paper-ish', ['light', 'white'].includes(classifyColor('rgba(76,175,80,0.2)').kind));
eq('rgba white 0.4', classifyColor('rgba(255,255,255,0.4)').kind, 'white');
eq('rgba zero alpha', classifyColor('rgba(0,0,0,0)').kind, 'none');
eq('hsl', classifyColor('hsl(210, 80%, 50%)').kind, 'strong');
eq('named blue', classifyColor('blue').kind, 'strong');
eq('named white', classifyColor('white').kind, 'white');
eq('var accent', classifyColor('var(--accent-cyan)').kind, 'strong');
eq('var accent with fallback', classifyColor('var(--accent-pink, #e91e63)').kind, 'strong');
eq('var text', classifyColor('var(--text-bright)').kind, 'black');
eq('var bg', classifyColor('var(--bg-card)').kind, 'white');
eq('unknown var falls back', classifyColor('var(--nope, #fff)').kind, 'white');
eq('glued alpha tint', classifyColor('var(--accent-orange)20').kind, 'light');
eq('currentColor', classifyColor('currentColor').kind, 'current');
eq('none', classifyColor('none').kind, 'none');
eq('url', classifyColor('url(#bwHatch)').kind, 'url');
eq('dark navy is black', classifyColor('#1a1a2e').kind, 'black');
eq('the grey itself', classifyColor('#949494').kind, 'grey');

/* ------------------------------------------------------------ the role maps */
eq('strong fill -> grey', inkFill('var(--accent-green)'), '#949494');
eq('pastel fill -> paper', inkFill('#e3f2fd'), '#fff');
eq('black fill kept', inkFill('#212121'), '#000');
eq('none fill untouched', inkFill('none'), null);
eq('url fill untouched', inkFill('url(#p)'), null);
eq('strong stroke -> ink', inkStroke('#1565c0'), '#000');
eq('light stroke -> grey', inkStroke('#ddd'), '#949494');
eq('dark grey stroke -> ink', inkStroke('#555'), '#000');
eq('mid grey stroke -> grey', inkStroke('#999'), '#949494');
eq('text colour -> ink', inkText('var(--accent-purple)', null), '#000');
eq('white text on paper -> ink', inkText('white', 'white'), '#000');
eq('white text on a black tab kept', inkText('#fff', 'black'), null);
eq('ink text untouched', inkText('#000', null), null);

/* ------------------------------------------------------------ whole elements */

// 1. The owner's black place-value disk: accent background, white label, translucent white ring.
{
    const disk = `<div style="width:92px;height:92px;border-radius:50%;background:var(--accent-orange);display:flex;color:white;font-weight:800;border:4px solid rgba(255,255,255,0.4);box-shadow:0 3px 8px rgba(0,0,0,0.10);">100</div>`;
    const out = inkHTML(disk);
    has('disk: paper', out, 'background:#fff');
    has('disk: ink label', out, 'color:#000');
    has('disk: ink ring capped at 1.5pt', out, 'border:2px solid #000');
    has('disk: no shadow', out, 'box-shadow:none');
    has('disk: keeps its label', out, '>100</div>');
    eq('disk: no residue', inkResidue(out).join(' | '), '');
}
// 2. A coloured chip with no border gains one, so it does not vanish on white paper.
{
    const out = inkHTML(`<span style="background:#3b82f6;color:#fff;padding:2px 6px;">7</span>`);
    has('chip: outline added', out, 'border:1px solid #000');
    has('chip: ink text', out, 'color:#000');
}
// 3. A thin coloured rule stays a rule (ink), it does not become an outlined box.
{
    const out = inkHTML(`<div style="height:3px;background:var(--accent-cyan);"></div>`);
    has('rule: ink', out, 'background:#000');
    lacks('rule: no outline', out, 'border');
}
// 4. A number tab: small black box with white numeral is legal (INK-5) and stays.
{
    const src = `<span class="ws-tab" style="min-width:6mm;height:6mm;background:#000;color:#fff;">3</span>`;
    const out = inkHTML(src);
    has('tab stays black', out, 'background:#000');
    has('tab numeral stays white past the print rule', out, 'color:#fff !important');
    eq('tab idempotent', inkHTML(out), out);
}
// 5. A big dark panel (legacy digital clock) is not a legal black shape: paper + outline, ink digits.
{
    const out = inkHTML(`<div style="display:inline-block;background:#1a1a2e;color:#fff;padding:10px 15px;border-radius:8px;border:3px solid #333;">7:45</div>`);
    has('panel: paper', out, 'background:#fff');
    has('panel: ink digits', out, 'color:#000');
    has('panel: heavy edge capped', out, 'border:2px solid #000');
}
// 6. SVG fraction bar: shaded parts grey, empty parts paper, partitions ink, faded opacity undone.
{
    const bar = `<svg width="200" height="36"><rect x="0" y="0" width="50" height="36" fill="var(--accent-cyan)" stroke="var(--text-bright)" stroke-width="1.5" opacity="1"/><rect x="50" y="0" width="50" height="36" fill="var(--bg-card)" stroke="var(--text-bright)" stroke-width="1.5" opacity="0.3"/></svg>`;
    const out = inkHTML(bar);
    has('frac: shaded grey', out, 'fill="#949494"');
    has('frac: empty paper', out, 'fill="#fff"');
    has('frac: partitions ink', out, 'stroke="#000"');
    lacks('frac: no faded part', out, 'opacity="0.3"');
    eq('frac: no residue', inkResidue(out).join(' | '), '');
}
// 7. White partition lines survive on a grey part but turn ink on a paper part.
{
    const a = inkHTML(`<rect fill="#3b82f6" stroke="white"/>`);
    has('white stroke on grey kept', a, 'stroke="white"');
    const b = inkHTML(`<rect fill="#e3f2fd" stroke="#fff"/>`);
    has('white stroke on paper -> ink', b, 'stroke="#000"');
}
// 8. SVG text is ink, never grey or white-on-paper.
{
    const out = inkHTML(`<text x="1" y="2" fill="white" font-size="12">5</text><text fill="#666">6</text>`);
    ok('svg text ink', (out.match(/fill="#000"/g) || []).length === 2, out);
}
// 9. Dashed borders become solid (LS-2) except the missing-digit box and a cut line.
{
    has('dashed -> solid', inkHTML(`<div style="border:2px dashed #1565c0;"></div>`), 'border:2px solid #000');
    const unknown = `<span data-ws-shape="box-unknown" style="border:0.75pt dashed #000;"></span>`;
    eq('missing-digit box keeps its dash', inkHTML(unknown), unknown);
    const cut = `<div data-ws-cut="1" style="border-top:0.75pt dashed #000;"></div>`;
    eq('cut line keeps its dash', inkHTML(cut), cut);
}
// 10. Gradients, shadows and filters go (INK-2).
{
    const out = inkHTML(`<div style="background:linear-gradient(180deg,var(--accent-green),var(--accent-cyan));box-shadow:0 2px 4px #000;filter:drop-shadow(0 0 2px red);text-shadow:1px 1px #f00;">x</div>`);
    lacks('gradient gone', out, 'gradient');
    has('shadow gone', out, 'box-shadow:none');
    has('filter gone', out, 'filter:none');
    has('text shadow gone', out, 'text-shadow:none');
}
// 11. `class="... filled"` means a shaded part (fracBarHTML) -> grey, not paper.
{
    const out = inkHTML(`<div class="frac-bar-segment filled" style="width:40px;height:40px;background:var(--accent-cyan);border-color:#999;"></div>`);
    has('filled segment grey', out, 'background:#949494');
    has('segment edge grey', out, 'border-color:#949494');
}
// 12. Already-compliant markup is byte-identical, and the function is idempotent.
{
    const clean = `<div class="k2-cell" style="text-align:center;color:#000000;font-family:'Andika',sans-serif;"><svg viewBox="0 0 10 10"><rect fill="none" stroke="#000000" stroke-width="1.5"/><circle fill="#000000"/><rect fill="#949494"/></svg></div>`;
    eq('compliant unchanged', inkHTML(clean), clean);
    const messy = `<div style="background:var(--accent-green);color:white;border:3px dashed #e91e63">1</div><svg><rect fill="#ff9800" stroke="#ccc"/></svg>`;
    const once = inkHTML(messy);
    eq('idempotent', inkHTML(once), once);
}
// 13. Entities and quoted fonts inside a style attribute survive the split.
{
    const src = `<span style="font-family:&quot;Andika&quot;, sans-serif;color:var(--accent-purple);">A</span>`;
    const out = inkHTML(src);
    has('entity kept', out, 'font-family:&quot;Andika&quot;, sans-serif');
    has('colour inked', out, 'color:#000');
}
// 14. <style> blocks inside a visual are inked too.
{
    const out = inkHTML(`<style>.x{color:#e53935;background:#fff3e0;border:2px solid #1565c0}</style><div class="x">1</div>`);
    has('style color', out, 'color:#000');
    has('style bg', out, 'background:#fff');
    has('style border', out, 'border:2px solid #000');
}
// 15. !important survives.
has('important kept', inkHTML(`<div style="color:#1565c0 !important">x</div>`), 'color:#000 !important');
// 16. A background image is left alone.
{
    const src = `<div style="background:url(data:image/png;base64,AAAA) no-repeat;">x</div>`;
    eq('image bg untouched', inkHTML(src), src);
}
// 17. Attribute values containing '>' do not derail the tag scanner.
{
    const out = inkHTML(`<div data-x="a>b" style="color:red">1</div>`);
    has('gt in attr', out, 'data-x="a>b"');
    has('gt in attr: still inked', out, 'color:#000');
}
// 18. Light decorative borders become the one grey, dark ones ink.
{
    const out = inkHTML(`<div style="border:1px solid #e0e0e0;border-bottom:2px solid #555;"></div>`);
    has('light border grey', out, 'border:1px solid #949494');
    has('dark border ink', out, 'border-bottom:2px solid #000');
}
// 19. Coloured counters become solid black counters (INK-5 allows <= 7 mm; RP-11), not grey.
{
    const out = inkHTML(`<svg><circle cx="5" cy="5" r="4" fill="#4a90d9"/><circle cx="50" cy="50" r="40" fill="#4a90d9"/></svg>`);
    has('small svg counter solid', out, 'r="4" fill="#000"');
    has('big svg circle, no paper parts: hollow', out, 'r="40" fill="#fff" stroke="#000"');
    const dot = inkHTML(`<span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#43a047;"></span>`);
    has('html counter solid', dot, 'background:#000');
    lacks('html counter no outline added', dot, 'border:1px');
    const chip = inkHTML(`<span style="width:22px;height:22px;border-radius:50%;background:#e53935;color:#fff;">3</span>`);
    has('white numeral on a black counter kept, forced past the print rule', chip, 'color:#fff !important');
}
// 20. A dashed closed shape (the legacy "unknown") becomes solid (LS-3); dots and open guides stay.
{
    const out = inkHTML(`<circle r="32" fill="none" stroke="#000" stroke-dasharray="6,4"/><line stroke="#000" stroke-dasharray="4 3"/><rect stroke="#000" stroke-dasharray="0.01 3.39" stroke-linecap="round"/>`);
    has('dashed circle solid', out, 'stroke-dasharray="none"');
    has('open guide kept', out, 'stroke-dasharray="4 3"');
    has('dots kept', out, 'stroke-dasharray="0.01 3.39"');
    const unk = `<rect data-ws-shape="box-unknown" stroke="#000" stroke-dasharray="4.25 2.83"/>`;
    eq('missing-digit rect keeps its dash', inkHTML(unk), unk);
}
// 21. A grey that comes from a custom property has no rgb to measure: it must not throw.
eq('var grey stroke', inkStroke('var(--mq-muted)'), '#949494');
has('var grey border', inkHTML(`<div style="border:1px solid var(--mq-muted)"></div>`), 'border:1px solid #949494');
// 22. A coloured strike or underline becomes ink.
{
    const out = inkHTML(`<span style="text-decoration:line-through;text-decoration-color:#d33;">x</span><u style="text-decoration:underline #1565c0">y</u>`);
    has('strike colour ink', out, 'text-decoration-color:#000');
    has('underline shorthand ink', out, 'text-decoration:underline #000');
    has('strike kept', out, 'text-decoration:line-through;');
}
// 23. A small coloured polygon is a marker (arrow tip, pointer): ink. A big one is a shaded part: grey.
{
    const out = inkHTML(`<polygon points="0,0 10,0 5,12" fill="var(--accent-orange)"/><polygon points="0,0 80,0 40,60" fill="#3b82f6"/>`);
    has('marker ink', out, 'points="0,0 10,0 5,12" fill="#000"');
    has('big polygon grey', out, 'points="0,0 80,0 40,60" fill="#949494"');
}
// 24. Big coloured circles: hollow ink counters when the drawing has no paper parts (an array),
//     grey when it does (a shaded set).
{
    const arr = inkHTML(`<svg><circle r="15" fill="#4a90d9"/><circle r="15" fill="#4a90d9"/></svg>`);
    has('array dot hollow', arr, 'fill="#fff" stroke="#000" stroke-width="1.5"');
    const set = inkHTML(`<svg><circle r="15" fill="#4a90d9"/><circle r="15" fill="#fff" stroke="#333"/></svg>`);
    has('shaded set grey', set, 'r="15" fill="#949494"');
    eq('hollow idempotent', inkHTML(arr), arr);
    const onPaper = inkHTML(`<svg><rect width="100" height="100" fill="#fff"/><circle r="15" fill="#4a90d9"/></svg>`);
    has('array on a paper backdrop still hollow', onPaper, 'r="15" fill="#fff" stroke="#000"');
}
// 26. SL-11 / SL-12 (owner ruling 2026-09-25): a digit strip survives the ink pass untouched -
//     the rounded ends, the missing right edge of every inner segment (so dividers never double)
//     and a divider thinner than the outline are all ink geometry, not colour.
{
    for (const pos of ['only', 'first', 'mid', 'last']) {
        const seg = `<span data-ws-seg="${pos}" style="display:block;width:33px;height:34px;${stripSegStyle(pos, { r: 1.25 })}"></span>`;
        eq(`strip ${pos} segment unchanged`, inkHTML(seg), seg);
    }
    const thin = `<span data-ws-seg="mid" style="${stripSegStyle('mid', { r: '0.18em', w: '1.5px', dw: '1px', color: '#000' })}"></span>`;
    eq('strip divider thinner than outline unchanged', inkHTML(thin), thin);
    // A coloured legacy write-in box keeps its (new) radius while its colour becomes ink.
    const legacy = inkHTML(`<div style="border:2px solid #555;border-radius:4px;background:#fff;"></div>`);
    has('legacy box keeps its radius', legacy, 'border-radius:4px');
}
// 27. The operations templates (P8c) draw in ink already: black, white and the one grey only,
//     so the legacy ink pass has nothing left to change in them, in any state.
{
    const { renderCell } = await import('../../js/modules/sheet/index.js');
    const T = (template, payload) => ({ cell: { template, v: 1, payload } });
    const cells = [
        T('division', { dividend: 715, divisor: 13 }), T('area-model', { multiplier: 4, parts: [300, 40, 5] }),
        T('mult-chart', { r0: 8, c0: 8, blanks: [{ i: 0, j: 2 }] }), T('arrays', { kind: 'equal_groups', rows: 3, cols: 4 }),
        T('remainder', { dividend: 19, divisor: 3 }), T('number-line', { max: 20, start: 7, add: 9 }),
        T('fact-family', { a: 8, b: 3 }), T('cloze-bank', { sum: 12, a: 5, b: 7, banks: [[3, 5, 8], [2, 6, 7]] }),
        T('fact', { a: 7, b: 12, op: '*' }), T('stack', { operands: [24, 66, 92, 57], op: '+', regroup: 'add' }),
    ];
    for (const q of cells) {
        for (const state of ['blank', 'answered', 'traced']) {
            const html = renderCell(q, { mode: 'print', size: 'L', state });
            const colours = [...html.matchAll(/#[0-9a-fA-F]{3,6}\b/g)].map((m) => m[0].toLowerCase());
            ok(`${q.cell.template} ${state}: ink, paper and the one grey`, colours.every((c) => ['#000', '#000000', '#fff', '#ffffff', '#949494'].includes(c)), colours.join(','));
            eq(`${q.cell.template} ${state}: no residue`, inkResidue(html).length, 0);
        }
    }
    // Critic guided-r1: the worked cell carries the working its Steps name, in the Model's ink.
    const rings = (s) => (renderCell(T('remainder', { dividend: 19, divisor: 3 }), { mode: 'print', size: 'L', state: s }).match(/data-mq-ring="group"/g) || []).length;
    const remT = renderCell(T('remainder', { dividend: 19, divisor: 3 }), { mode: 'print', size: 'L', state: 'traced' });
    const groupPaths = remT.match(/<path[^>]*data-mq-ring="group"[^>]*>/g) || [];
    ok('remainder traced: a ring round each of the 6 groups (a wrapped group is two)', groupPaths.length >= 6 && groupPaths.length <= 12, String(groupPaths.length));
    ok('remainder traced: rings in trace grey', groupPaths.every((p) => /#949494/.test(p) && /data-ws-ink="trace"/.test(p)));
    eq('remainder blank: no rings', rings('blank'), 0);
    const sub = T('stack', { operands: [21, 4], op: '-', regroup: 'sub' });
    const subT = renderCell(sub, { mode: 'print', size: 'L', state: 'traced', scaffoldLevel: 3 });
    ok('stack sub traced: the regrouped digits crossed out in grey', /class="ws-strike ws-trace"/.test(subT));
    ok('stack sub traced: the new numbers 1 and 11 in grey', /data-ws-ink="trace">1<\/span>/.test(subT) && /data-ws-ink="trace">11<\/span>/.test(subT));
    const add3 = T('stack', { operands: [468, 275], op: '+', regroup: 'add', workUpTo: 1 });
    const addT = renderCell(add3, { mode: 'print', size: 'L', state: 'traced', scaffoldLevel: 3 });
    eq('stack add traced workUpTo 1: only the ten carried from the ones', (addT.match(/mq-rgink" data-ws-ink="trace">/g) || []).length, 1);
}
// 26. Critic round 2 (C4): the key's digits keep the sheet's open 4 (cv04) at Andika 700, never
//     cv01 (TY-4), and the role CSS stays in the ink set.
{
    const { SHEET_ENGINE_CSS } = await import('../../js/modules/sheet/roles/practice.js');
    ok('key answers keep cv04', /\[data-ws-ink="solid"\][^{]*\{font-feature-settings:"cv04" 1\}/.test(SHEET_ENGINE_CSS));
    ok('TY-4: no cv01 / cv06 anywhere in the role CSS', !/cv0[16]"/.test(SHEET_ENGINE_CSS));
    ok('key answers are Andika 700', /\.ws-key \[data-ws-ink="solid"\][^{]*\{font-weight:700\}/.test(SHEET_ENGINE_CSS));
    ok('pupil ink (error analysis) is the one grey', /\.mq-pupil,[^{]*\.mq-pupil \*\{color:#949494!important\}/.test(SHEET_ENGINE_CSS));
    // INK-30 (owner ruling 2026-09-25): lesson pages may carry ONE accent colour, and only there. The
    // engine CSS minus the lesson layer stays ink / paper / grey; the lesson layer may add the accent,
    // and only in rules whose selector names a lesson-only element (.mq-l* / .mq-c*).
    const { LESSON_CSS } = await import('../../js/modules/sheet/lesson-css.js');
    const { LESSON_ACCENT } = await import('../../js/modules/sheet/tokens.js');
    const INKSET = ['#000', '#000000', '#fff', '#ffffff', '#949494'];
    const hexes = (css) => [...css.matchAll(/#[0-9a-fA-F]{3,6}\b/g)].map((m) => m[0].toLowerCase());
    // The accent is DEFINED once as a custom property on the page; defining it colours nothing.
    const DEF = /--mq-lesson-accent:\s*#[0-9a-fA-F]{3,6}/g;
    const colours = hexes(SHEET_ENGINE_CSS.replace(LESSON_CSS, '').replace(DEF, ''));
    ok('role CSS: ink, paper and the one grey only', colours.every((c) => INKSET.includes(c)), colours.join(','));
    ok('lesson CSS: ink set plus the one lesson accent only', hexes(LESSON_CSS).every((c) => INKSET.includes(c) || c === LESSON_ACCENT.toLowerCase()), hexes(LESSON_CSS).join(','));
    const accentRules = [...LESSON_CSS.matchAll(/([^{}]*)\{([^{}]*)\}/g)].filter((m) => m[2].toLowerCase().includes(LESSON_ACCENT.toLowerCase()) || /var\(--mq-lesson-accent/.test(m[2]));
    ok('lesson accent only on lesson-only elements', accentRules.every((m) => /\.mq-[lc][a-z-]*/.test(m[1]) || /^\s*--mq-lesson-accent:[^;]*;?\s*$/.test(m[2])), accentRules.map((m) => m[1].trim()).join(' | '));
    const { dotTile } = await import('../../js/modules/sheet/roles/guided.js');
    const tile = dotTile(7);
    eq('dot tile: seven dots', (tile.match(/<circle/g) || []).length, 7);
    ok('dot tile: trace grey only', [...tile.matchAll(/#[0-9a-fA-F]{3,6}\b/g)].every((m) => ['#949494', '#fff'].includes(m[0].toLowerCase())));
}
// 25. Residue finder sees what is left.
ok('residue finds colour', inkResidue(`<div style="color:#1565c0"></div>`).length === 1);

if (fail) { console.log(`ws-ink-unit: FAIL (${fail} failed, ${pass} passed)`); process.exit(1); }
console.log(`ws-ink-unit: OK (${pass} checks)`);
