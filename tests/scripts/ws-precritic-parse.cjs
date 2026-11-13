#!/usr/bin/env node
// ws-precritic-parse — unit cases for ws-precritic's output parsers (PARSE), with no browser and no gate run.
//
//   node tests/scripts/ws-precritic-parse.cjs              # this tree's tests/scripts/ws-precritic.cjs
//   MQ_ROOT=<tree> node tests/scripts/ws-precritic-parse.cjs   # another checkout's precritic (ws-backtest commit-pair)
//
// Cases (lf-placevalue, lead ruling R2 2026-11-07):
//   card-not-offered on a card WITH a rulings block and no notOffered entry -> N/A (every §7a option offered)
//   card-not-offered on a card with NO rulings block                        -> SKIPPED (no rulings), unchanged
//   card-rulings (--check rulings) NO-RULINGS                               -> SKIPPED (no rulings), unchanged
// Cases (lf-partopts, the options-shots row, 2026-11-13):
//   options-shots: both skills ok at 1280, 1366, 1024 and 820                -> PASS
//   options-shots: one skill ok, one `skip ...: no options panel`            -> PASS, the skipped skill named
//   options-shots: every skill skipped (no options panel)                    -> N/A
//   options-shots: a `FAIL <key> @<w>` line, verdict FAIL, exit 1            -> FAIL, explained by the findings
//   options-shots: verdict OK but a scope skill checked at one width only    -> FAIL (checked something else)
// Last line `ws-precritic-parse: OK (...)` or `ws-precritic-parse: FAIL - ...`.
'use strict';
const path = require('path');
const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : path.resolve(__dirname, '..', '..');
const { PARSE } = require(path.join(ROOT, 'tests', 'scripts', 'ws-precritic.cjs'));

const offeredGate = { id: 'card-not-offered', args: ['--skill', 'placevalue:expand', '--check', 'offered'] };
const rulingsGate = { id: 'card-rulings', args: ['--skill', 'placevalue:expand', '--check', 'rulings'] };
const withBlock = [
    'ws-card-rulings: design/cards/pv/pv.md on this tree; 1 skill(s), 300 items per ruling',
    '  design/cards/pv/pv.md: rulings block present, 5 prose ruling(s) not machine-checked (§5.1)',
    '  no notOffered entry applies to placevalue:expand (not checked)',
    'ws-card-rulings: NO-RULINGS (the blocks hold no notOffered entries for the skills in scope; nothing checked)',
].join('\n');
const noBlock = [
    'ws-card-rulings: no card under design/cards has a rulings block for placevalue:expand',
    'ws-card-rulings: NO-RULINGS (no rulings block for the skills in scope; nothing checked)',
].join('\n');

const fails = [];
const t = (ok, msg) => { if (!ok) fails.push(msg); };
const r1 = PARSE.cardRulings(offeredGate, withBlock, 4);
t(r1.result === 'N/A', `offered row, block present, no notOffered: N/A (got ${r1.result})`);
const r2 = PARSE.cardRulings(offeredGate, noBlock, 4);
t(r2.result === 'SKIPPED (no rulings)', `offered row, no block: SKIPPED (got ${r2.result})`);
const r3 = PARSE.cardRulings(rulingsGate, noBlock, 4);
t(r3.result === 'SKIPPED (no rulings)', `rulings row, no block: SKIPPED (got ${r3.result})`);

let N = 3;
if (PARSE.optionsShots) {
    const keys = ['patterns:pattern_features', 'patterns:growing_shape_patterns'];
    const W4 = [1280, 1366, 1024, 820];   // the panel's widths (owner scope 2026-11-13; 390 dropped)
    const osGate = { id: 'options-shots', keys, expect: { skills: 2, widths: W4 } };
    const all = (k) => W4.map((w) => ok(k, w));
    const ok = (k, w) => `ok   ${k} @${w}: ink 3.27 %, covers 26.7 %`;
    const both = [...keys.flatMap((k) => all(k)), '  2 skills × 4 widths (1280, 1366, 1024, 820 px), 1 worker(s), 28 s', 'ws-options-shots: OK (2 skills × 4 widths)'].join('\n');
    const oneSkip = [`skip ${keys[1]}: no options panel (not checked)`, ...all(keys[0]), 'ws-options-shots: OK (1 skills × 4 widths; 1 skipped, no options panel)'].join('\n');
    const allSkip = [`skip ${keys[0]}: no options panel (not checked)`, `skip ${keys[1]}: no options panel (not checked)`, '  0 skills × 4 widths (1280, 1366, 1024, 820 px), 1 worker(s), 3 s', 'ws-options-shots: OK (0 skills × 4 widths; 2 skipped, no options panel)'].join('\n');
    const red = [`FAIL ${keys[0]} @1280: stage (-193,-205) 119×126 is neither inside the 398×140 frame nor over 90 % of it (covers 0.0 %)`, ...all(keys[1]), `FAIL ${keys[0]} @820: the frame's visible crop holds 0.00 % dark pixels (needs > 0.5 %)`, 'ws-options-shots: FAIL (2)'].join('\n');
    const half = [...all(keys[0]), ok(keys[1], 1280), ok(keys[1], 1366), ok(keys[1], 1024), 'ws-options-shots: OK (2 skills × 4 widths)'].join('\n');
    const o1 = PARSE.optionsShots(osGate, both, 0);
    t(o1.result === 'PASS', `options-shots, both checked: PASS (got ${o1.result} ${o1.findings})`);
    const o2 = PARSE.optionsShots(osGate, oneSkip, 0);
    t(o2.result === 'PASS' && o2.findings.includes(keys[1]), `options-shots, one skipped: PASS naming it (got ${o2.result} ${o2.findings})`);
    const o3 = PARSE.optionsShots(osGate, allSkip, 0);
    t(o3.result === 'N/A', `options-shots, all skipped: N/A (got ${o3.result} ${o3.findings})`);
    const o4 = PARSE.optionsShots(osGate, red, 1);
    t(o4.result === 'FAIL' && o4.explainsExit && /2 panel sample/.test(o4.findings), `options-shots, FAIL lines: FAIL explained (got ${o4.result} ${o4.findings})`);
    const o5 = PARSE.optionsShots(osGate, half, 0);
    t(o5.result === 'FAIL' && o5.findings.includes(keys[1]), `options-shots, one width missing: FAIL naming it (got ${o5.result} ${o5.findings})`);
    N += 5;
}

if (fails.length) { for (const f of fails) console.log(`  FAIL ${f}`); console.log(`ws-precritic-parse: FAIL - ${fails.length} of ${N} case(s)`); process.exit(1); }
console.log(`ws-precritic-parse: OK (${N} cases)`);
