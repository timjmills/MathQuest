import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fig = await import(pathToFileURL(path.join(ROOT, 'js/modules/sheet/cells/shape-figure.js')).href);
const poly = JSON.parse(process.argv[2]);
const edges = poly.map((_, i) => ({ i, v: Math.hypot(poly[(i + 1) % poly.length][0] - poly[i][0], poly[(i + 1) % poly.length][1] - poly[i][1]), show: true }));
for (const size of ['L']) {
    const r = fig.figureSVG({ poly, edges, unit: '', grid: 'none' }, { size, scaffoldLevel: 1, state: 'blank' });
    console.log(size, r.W.toFixed(1), r.gap.toFixed(2), JSON.stringify(r.labels.map((l) => [l.v, l.edge, +l.x.toFixed(1), +l.y.toFixed(1), l.forced])));
}
