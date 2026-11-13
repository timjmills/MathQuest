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
// Cases (lf-partopts, 2026-11-13; PARSE.partOpts):
//   ws-partopts-unit: OK with every expected check line                     -> PASS
//   ws-partopts-unit: OK but a check the scope asks for never printed       -> FAIL (it judged nothing for it)
//   ws-partopts-unit: FAIL                                                  -> FAIL, the per-check rows as findings
//   ws-partopts-unit: ERROR (a check could not run)                         -> FAIL "could not run", never PASS
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

// ---- lane lf-partopts (PARSE.partOpts)
const poGate = { id: 'partopts-unit', script: 'ws-partopts-unit', args: ['--lessons', 'number_sense:nearest_10'], expect: { must: ['PO-2d', 'PO-CAP', 'PO-2w walk'] } };
const poOk = [
    'PO-2w walk: 8 settled states beyond the standard packet in 1 lesson x size cases (depth 1)',
    'PO-2a PASS', 'PO-2d PASS', 'PO-CAP PASS',
    'ws-partopts-unit: OK',
].join('\n');
const poShort = ['PO-2a PASS', 'PO-2d PASS', 'ws-partopts-unit: OK'].join('\n');
const poFail = [
    'PO-2d FAIL 1',
    '   PO-2d EB-PAGE number_sense:nearest_10 M wedo off p2 (lesson-sheet): 39 % of the page body empty under its last block (limit 30 %)',
    'PO-CAP PASS',
    'PO-2w walk: 8 settled states beyond the standard packet in 1 lesson x size cases (depth 1)',
    'ws-partopts-unit: FAIL (1)',
].join('\n');
const poErr = ['  ERROR PO-2a number_sense:nearest_10 M: TypeError x', 'ws-partopts-unit: ERROR (1 check(s) could not run)'].join('\n');
const p1 = PARSE.partOpts(poGate, poOk, 0);
t(p1.result === 'PASS', `partopts OK with every must line: PASS (got ${p1.result} ${p1.findings})`);
const p2 = PARSE.partOpts(poGate, poShort, 0);
t(p2.result === 'FAIL' && /PO-CAP/.test(p2.findings), `partopts OK missing a must line: FAIL naming it (got ${p2.result} ${p2.findings})`);
const p3 = PARSE.partOpts(poGate, poFail, 1);
t(p3.result === 'FAIL' && /EB-PAGE/.test(p3.findings) && p3.explainsExit, `partopts FAIL: the check rows as findings (got ${p3.result} ${p3.findings})`);
const p4 = PARSE.partOpts(poGate, poErr, 2);
t(p4.result === 'FAIL' && /could not run/.test(p4.findings), `partopts ERROR: FAIL "could not run" (got ${p4.result} ${p4.findings})`);

const N = 7;
if (fails.length) { for (const f of fails) console.log(`  FAIL ${f}`); console.log(`ws-precritic-parse: FAIL - ${fails.length} of ${N} case(s)`); process.exit(1); }
console.log(`ws-precritic-parse: OK (${N} cases)`);
