// ws-patterns-cells — node checks of the patterns family's own cells against what a page asks of them (lane lf-algebra r10,
// after critic r2). No browser, about a second.
//
//   node tests/scripts/ws-patterns-cells.mjs [--skill cat:a,...] [--root DIR] [--rules HINT-ON-TEST,...]
//
//   LABEL-REF  (critic r2 G5) every choice letter Error analysis prints in its Fix-it row for a feature item (A, B, C - the
//              letters roles/error-analysis.js choicesOf gives a choice list of long sentences) is printed inside the item:
//              the feature cell in its 'wrong' state carries one data-ws-letter per sentence, A.. in order, on paper and screen.
//   TILE-CARD  (critic r2 G6) the feature track's tiles, where the Test leaves them for the pupil to write in, are the card's
//              size: design/cards/patterns/patterns.md "feature track tiles a / b / c mm (S / M / L)", width and height.
//   ROW2-S     (critic r2 G8) a growing cell at S keeps its four terms on one row in a half-width (two-across) cell: the
//              root's left keep-out shrinks (a clamp to 0) so that row + keep-out never exceeds the 2-column cell, and the
//              row itself fits the 2-column content width the bridge measures (86 mm at S, critic r2 probe).
//   HINT-ON-TEST (critic r1 F1) the fading hint (patShow, default on) never prints on the Test: every dealt item of
//              notice_patterns / pattern_features (each patTask) and growing_shape_patterns, drawn at scaffold level 0 (the
//              test role's level) with its hint ON, carries no hint part (the parity even / odd words mq-nt-hint, the
//              times-table row mq-nt-row, the growing given counts mq-gp-count, a feature track's given tiles past the
//              first); on the screen twin every hint part is marked data-ws-hint="fade" and the quiz hides that mark
//              (css/quiz-mode.css), so a quiz shows none.
//   STATE-PROGRESS (critic r1 F5) the lesson's anchor chart: each panel draws the example as it looks after its step
//              (lesson-pages/chart.js stateDrawing over the provider's worked steps, stateGroups): two adjacent panels never
//              draw the same picture, and a panel whose step says "Write N" shows N in its drawing. Judged on
//              function_table_easy and the patterns skills; number_patterns_rule / follow_given_rule draw through lf-ops'
//              count-row (no stepState yet): their findings print as PINNED (owner lf-ops), not failures, until it lands.
// Only skills of the patterns card (and function_table_easy / the count-row pair for STATE-PROGRESS) are in scope; --skill
// with none of them prints OK (n/a).
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
const STATE_SCOPE = ['algebra:function_table_easy', 'patterns:number_patterns_rule', 'patterns:follow_given_rule', ...SCOPE];
// (STATE-PROGRESS on the count-row pair waits on lf-ops' count-row stepState: reported, owner named, not failed)
const STATE_PINNED = new Set(['patterns:number_patterns_rule', 'patterns:follow_given_rule']);
const mineState = only.length ? STATE_SCOPE.filter((k) => only.includes(k) || only.includes(k.split(':')[1])) : STATE_SCOPE;
if (!mine.length && !mineState.length) { console.log(`${TOOL}: OK (n/a: no patterns-card skill in scope)`); process.exit(0); }

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

// HINT-ON-TEST: dealt items, the hint on, drawn at the Test's level 0 (paper) and as the quiz's twin
if (mine.length) {
    const { loadApp, fnv } = await import(pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'ws-card-rulings.mjs')).href);
    const app = await loadApp(ROOT);
    const quizCss = (() => { try { return readFileSync(join(ROOT, 'css', 'quiz-mode.css'), 'utf8'); } catch (e) { return ''; } })();
    const quizHides = /#quizTakeView\s+\[data-ws-hint="fade"\]\s*\{[^}]*display:\s*none/.test(quizCss);
    const tagsOf = (html, cls) => [...html.matchAll(new RegExp(`<[a-z]+[^>]*class="${cls}(?:\\s[^"]*)?"[^>]*>`, 'g'))].map((m) => m[0]);
    // a hint part that prints something: its tag followed by text that is not blank (the notice Test keeps an EMPTY hint line,
    // a no-break space, so its cell is as tall as the bridge measures - EB-FOOT; that line is no hint)
    const inked = (html, cls) => [...html.matchAll(new RegExp(`<[a-z]+[^>]*class="${cls}(?:\\s[^"]*)?"[^>]*>([\\s\\S]{0,400}?)<\\/`, 'g'))]
        .filter((m) => m[1].replace(/<[^>]*>/g, '').replace(/[\\s\u00a0]/g, '') !== '' || /<(?:span|div)[^>]*class="mq-nt-tile/.test(m[1])).map((m) => m[0]);
    const HINTS = ['mq-nt-hint', 'mq-nt-row', 'mq-gp-count'];
    let read = 0, quizHint = 0;
    for (const key of mine) {
        const sk = key.split(':')[1];
        const tasks = /growing/.test(sk) ? [undefined] : ['parity', 'feature', 'truefalse'];
        for (const task of tasks) {
            for (let i = 0; i < 6; i++) {
                let q = null;
                const opts = Object.assign({ patShow: true }, task ? { patTask: task } : {});
                try { q = app.gq.generateQuestionFor({ category: 'patterns', skill: sk, opts, seed: (fnv(`${key}:hint`) ^ Math.imul(i + 1, 2654435761)) >>> 0, itemIndex: i }); } catch (e) { q = null; }
                if (!q || !q.cell || !q.cell.template) continue;
                const cell = kit.getCell(q.cell.template);
                if (!cell) continue;
                const p = Object.assign({}, q.cell.payload || {}, { show: true });
                read++;
                const tag = `${sk}${task ? ` patTask=${task}` : ''} item ${i}`;
                let paper = '', twin = '';
                try { paper = cell.render(p, ctxOf('M', { mode: 'print', state: 'blank', scaffoldLevel: 0 })); } catch (e) { fails.push(`HINT-ON-TEST ${tag}: the Test render threw ${e.message}`); continue; }
                const on = HINTS.filter((c) => inked(paper, c).length);
                if (on.length) fails.push(`HINT-ON-TEST ${tag}: the Test (scaffold level 0) prints the hint (${on.join(', ')})`);
                const given = tagsOf(paper, 'mq-nt-tile').filter((t) => !/data-ws-slot=/.test(t));
                if (p.task === 'feature' && given.length > 1) fails.push(`HINT-ON-TEST ${tag}: the Test prints ${given.length - 1} track number(s) past the first (the hint)`);
                try { twin = cell.render(p, ctxOf('M', { state: 'blank', options: { twin: true } })); } catch (e) { twin = ''; }
                const unmarked = HINTS.flatMap((c) => tagsOf(twin, c)).filter((t) => !/data-ws-hint="fade"/.test(t));
                const tgiven = p.task === 'feature' ? tagsOf(twin, 'mq-nt-tile').filter((t) => !/data-ws-slot=|<input/.test(t)) : [];
                const tunmarked = tgiven.slice(1).filter((t) => !/data-ws-hint="fade"/.test(t));
                if (HINTS.some((c) => tagsOf(twin, c).length) || tgiven.length > 1) quizHint++;
                if (unmarked.length || tunmarked.length) fails.push(`HINT-ON-TEST ${tag}: the quiz twin shows ${unmarked.length + tunmarked.length} hint part(s) not marked data-ws-hint="fade"`);
                if (fails.length > 40) break;
            }
        }
    }
    if (!read) fails.push('HINT-ON-TEST: no item dealt');
    if (quizHint && !quizHides) fails.push('HINT-ON-TEST: css/quiz-mode.css does not hide [data-ws-hint="fade"] in #quizTakeView, so the quiz shows the hint');
}

// STATE-PROGRESS: the anchor chart's panels, as lesson-pages/chart.js draws them
const pinned = [], noted = [];
const STATE_FAIL = new Set(['algebra:function_table_easy']);
if (mineState.length) {
    const { loadApp, fnv } = await import(pathToFileURL(join(dirname(fileURLToPath(import.meta.url)), 'ws-card-rulings.mjs')).href);
    const app = await loadApp(ROOT);
    let chart = null, common = null, anchors = null;
    try {
        try { await import(pathToFileURL(join(ROOT, 'js', 'modules', 'print-sheet.js')).href); } catch (e) { /* the providers register through the kit too */ }
        chart = await import(pathToFileURL(join(ROOT, 'js', 'modules', 'sheet', 'lesson-pages', 'chart.js')).href);
        common = await import(pathToFileURL(join(ROOT, 'js', 'modules', 'sheet', 'lesson-pages', 'common.js')).href);
        anchors = await import(pathToFileURL(join(ROOT, 'js', 'modules', 'sheet', 'anchors.js')).href);
    } catch (e) { fails.push(`STATE-PROGRESS: the lesson chart modules did not load (${e.message})`); }
    const vis = (html) => String(html || '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/\s+/g, ' ');
    const texts = (html) => [...vis(html).matchAll(/>([^<>]+)</g)].map((m) => m[1].replace(/&nbsp;|\u00a0/g, ' ').trim()).filter(Boolean);
    for (const key of chart && common && anchors ? mineState : []) {
        const [cat, sk] = key.split(':');
        // (critic r1 F5 named function_table_easy and the count-row pair; the patterns cells' "check" steps that mark nothing
        // - notice "10 is even.", growing "Each term has 2 more." - draw a panel like the one before: NOTED for the lead, not
        // failed, since critic r2 graded those lesson pages clean)
        const out = STATE_PINNED.has(key) ? pinned : STATE_FAIL.has(key) ? fails : noted;
        let judged = 0;
        for (let i = 0; i < 4; i++) {
            let q = null;
            try { q = app.gq.generateQuestionFor({ category: cat, skill: sk, seed: (fnv(`${key}:chart`) ^ Math.imul(i + 1, 2654435761)) >>> 0, itemIndex: i }); } catch (e) { q = null; }
            if (!q || !q.cell) continue;
            const qq = Object.assign({}, q, { categoryId: q.categoryId || cat, skillId: q.skillId || sk });
            const it = { q: qq, skill: key, render: (c, o = {}) => kit.renderCell({ cell: qq.cell }, Object.assign({}, c, o.shown !== undefined ? { state: 'traced' } : {})) };
            const steps = anchors.workedStepsOf(it);
            if (steps.length < 2) continue;
            const groups = common.stateGroups(steps);
            const c = { size: 'L', look: 'ican', mode: 'print' };
            const draws = groups.map((g, k) => { try { return chart.stateDrawing(it, steps, groups, k, c); } catch (e) { return `ERR ${e.message}`; } });
            judged++;
            const tag = `${sk} item ${i}`;
            for (let k = 0; k + 1 < draws.length; k++) {
                if (vis(draws[k]) === vis(draws[k + 1])) out.push(`STATE-PROGRESS ${tag}: chart panels ${k + 1} and ${k + 2} draw the same picture (step "${(steps[groups[k + 1].steps[0]] || {}).text || ''}" adds nothing)`);
            }
            groups.forEach((g, k) => {
                for (const si of g.steps) {
                    const t = String((steps[si] || {}).text || '');
                    for (const m of t.matchAll(/\bWrite (\d[\d,]*)\b/g)) {
                        const n = m[1].replace(/,/g, '');
                        if (!texts(draws[k]).some((x) => x.replace(/,/g, '') === n)) out.push(`STATE-PROGRESS ${tag}: panel ${k + 1}'s step says "Write ${m[1]}" but its drawing shows no ${m[1]}`);
                    }
                }
            });
        }
        if (!judged) out.push(`STATE-PROGRESS ${sk}: no item with two or more worked steps`);
    }
}

// --rules A,B: only those rules' findings count (a backtest of one rule on a commit before the others were fixed)
const ONLY = String(arg('--rules', '')).split(',').map((x) => x.trim()).filter(Boolean);
if (ONLY.length) for (let i = fails.length - 1; i >= 0; i--) if (!ONLY.some((r) => fails[i].startsWith(`${r} `) || fails[i].startsWith(`${r}:`))) fails.splice(i, 1);
if (ONLY.length) for (let i = pinned.length - 1; i >= 0; i--) if (!ONLY.some((r) => pinned[i].startsWith(`${r} `))) pinned.splice(i, 1);
for (const f of fails) console.log(`  ${f}`);
if (ONLY.length) for (let i = noted.length - 1; i >= 0; i--) if (!ONLY.some((r) => noted[i].startsWith(`${r} `))) noted.splice(i, 1);
if (noted.length) console.log(`  NOTED (ours, for the lead: a check step that marks nothing draws the panel before it; not a critic finding): ${noted.length}\n${noted.slice(0, 4).map((x) => `    ${x}`).join('\n')}`);
if (pinned.length) console.log(`  PINNED (owner lf-ops: count-row has no anchor-chart stepState; not failures): ${pinned.length}\n${pinned.slice(0, 6).map((x) => `    ${x}`).join('\n')}`);
console.log(fails.length ? `${TOOL}: FAIL (${fails.length})` : `${TOOL}: OK (${[...new Set([...mine, ...mineState])].join(', ')})`);
process.exit(fails.length ? 1 : 0);
