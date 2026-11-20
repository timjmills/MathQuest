// ws-chart-offer - lead ruling 2026-11-20 (chart blanks, ws-options-verify --render chart_to_120 gaps="row"): at band 120 the
// "Empty squares" value "A run along one row" is NOT offered. Judged without a browser:
//   OFFER   composing:chart_to_120's offered and declared `gaps` values hold no 'row';
//   NOTE    the host's (composing:hundreds_chart_fill) `gaps` help says, for the chart to 120, that a run along a row is not offered.
// Last line `ws-chart-offer: OK` / `FAIL - n finding(s)`; exit 1 on FAIL. MQ_ROOT=<tree> judges another checkout (ws-backtest).
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const ROOT = process.env.MQ_ROOT || path.resolve(path.dirname(new URL(import.meta.url).pathname), '..', '..');
const so = await import(pathToFileURL(path.join(ROOT, 'js/modules/skill-options.js')).href);
const out = [];
for (const fn of ['optionsFor', 'offeredOptionsFor']) {
    const g = (so[fn]('composing', 'chart_to_120') || []).find((o) => o && o.id === 'gaps');
    if (!g) { out.push(`OFFER ${fn}: chart_to_120 has no gaps option`); continue; }
    if (g.values.some((v) => v.v === 'row')) out.push(`OFFER ${fn}: chart_to_120 offers gaps="row" (a run along one row) at band 120`);
}
const h = (so.optionsFor('composing', 'hundreds_chart_fill') || []).find((o) => o && o.id === 'gaps');
if (!h || !/chart to 120[^.]*run along a row is not offered/i.test(String(h.help || ''))) out.push('NOTE hundreds_chart_fill gaps help does not say a run along a row is not offered on the chart to 120');
for (const f of out) console.log('  ' + f);
console.log(`ws-chart-offer: ${out.length ? `FAIL - ${out.length} finding(s)` : 'OK'}`);
process.exit(out.length ? 1 : 0);
