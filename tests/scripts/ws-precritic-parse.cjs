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

if (fails.length) { for (const f of fails) console.log(`  FAIL ${f}`); console.log(`ws-precritic-parse: FAIL - ${fails.length} of 3 case(s)`); process.exit(1); }
console.log('ws-precritic-parse: OK (3 cases)');
