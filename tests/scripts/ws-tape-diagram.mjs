// ws-tape-diagram — the tape diagram (algebra:tape_diagram) draws every part label INSIDE its part (lf-algebra, 2026-11-13;
// lf-engine roles critic 8266326ba N4: "Leo needs 186 shells ... has 9" drew the part 9 as a sliver with its digit outside the
// bar). Owner rule: the finding is a check before its fix lands. Browser.
//
//   node tests/scripts/ws-tape-diagram.mjs [--skill cat:a,...] [--root DIR] [--seeds 24] [--sizes S,M,L]
//
//   TAPE-LABEL-INSIDE  on the printed Independent page at S / M / L (--seeds seeds each; the tape alone and in the critic's
//                      mixed set compare + add_facts + tape + perimeter_intro) and on the screen visual at the phone
//                      card (342 px) and the desktop card (760 px) widths, every part of the bar - a boxed element (border or
//                      fill) whose own text is its number or "?" - holds that text's ink inside its box (0.5 px tolerance) with
//                      at least a quarter of its font size clear each side (a 30 px part round a 17 px "9" is the sliver). A part too narrow for its digits is the defect, whatever its share of the
//                      whole; shrinking the digits to fit is NOT the fix (content never shrinks to fit).
// Skills outside the tape diagram print OK (n/a). Prints `ws-tape-diagram: OK` / `FAIL`.
import { createRequire } from 'node:module';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const TOOL = 'ws-tape-diagram';
const args = process.argv.slice(2);
const arg = (f, d) => { const i = args.indexOf(f); return i >= 0 && i + 1 < args.length ? args[i + 1] : d; };
const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(arg('--root', process.env.MQ_ROOT || join(HERE, '..', '..')));
const SCOPE = ['algebra:tape_diagram'];
const only = String(arg('--skill', arg('--skills', ''))).split(',').map((s) => s.trim()).filter(Boolean);
const mine = only.length ? SCOPE.filter((k) => only.includes(k) || only.includes(k.split(':')[1])) : SCOPE;
if (!mine.length) { console.log(`${TOOL}: OK (n/a: algebra:tape_diagram not in scope)`); process.exit(0); }
const SEEDS = Math.max(1, Number(arg('--seeds', 24)) || 24);
const SIZES = String(arg('--sizes', 'S,M,L')).split(',').map((x) => x.trim()).filter(Boolean);
if (ROOT !== resolve(join(HERE, '..', '..')) && !process.env.MQ_ROOT) process.env.MQ_ROOT = ROOT;
const H = createRequire(import.meta.url)(join(HERE, '..', 'lib', 'ws-harness.cjs'));

/** In the page: every part of every tape in `root` -> {t, box, ink} (px). A part is a boxed element (a border or a fill) whose
 *  own text is a number or "?"; the item tabs / letters (data-ws-label) are not parts. */
const partsOf = (root) => {
    const out = [];
    for (const e of root.querySelectorAll('*')) {
        if (e.closest('[data-ws-label]')) continue;
        const own = [...e.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim());
        if (own.length !== 1) continue;
        const t = own[0].textContent.trim();
        if (!/^(\d[\d,]*|\?)$/.test(t)) continue;
        const st = getComputedStyle(e);
        const bordered = ['Top', 'Right', 'Bottom', 'Left'].filter((s) => parseFloat(st[`border${s}Width`]) > 0 && st[`border${s}Style`] !== 'none').length >= 3;
        const filled = st.backgroundColor && !/rgba\(0, 0, 0, 0\)|transparent/.test(st.backgroundColor);
        if (!bordered && !filled) continue;
        if (st.display === 'none' || st.visibility === 'hidden') continue;
        const b = e.getBoundingClientRect();
        if (b.height < 1) continue;
        const rg = document.createRange(); rg.selectNodeContents(own[0]);
        const k = rg.getBoundingClientRect();
        out.push({ t, fs: parseFloat(st.fontSize) || 16, box: { l: b.left, r: b.right, w: b.width }, ink: { l: k.left, r: k.right, w: k.width } });
    }
    return out;
};

const out = [];
const bad = (msg) => out.push(msg);
const judge = (where, parts) => {
    for (const p of parts) {
        const inside = p.ink.l >= p.box.l - 0.5 && p.ink.r <= p.box.r + 0.5;
        const clear = Math.min(p.ink.l - p.box.l, p.box.r - p.ink.r);
        const need = 0.25 * p.fs;
        if (!inside || clear < need) bad(`${where}: part "${p.t}" is ${p.box.w.toFixed(1)} px wide, its label ${p.ink.w.toFixed(1)} px (${inside ? `${clear.toFixed(1)} px clear, under ${need.toFixed(1)} (a quarter of its ${p.fs.toFixed(1)} px digits)` : 'the label runs outside the part'})`);
    }
};

const app = await H.open({});
let partsSeen = 0;
let sheet = null;
try {
    // the tape alone, and in the critic's mixed set (lf-engine roles critic: compare + add_facts + tape + perimeter_intro)
    const MIX = [['placevalue', 'compare'], ['addition', 'add_facts'], ['algebra', 'tape_diagram'], ['area_perimeter', 'perimeter_intro']];
    for (const mix of [false, true]) for (const size of SIZES) for (let seed = 1; seed <= SEEDS; seed++) {
        // the printable document (sheetDocument, as ws-grade-render prints it), in its own tab under print media
        const html = await app.page.evaluate(async (a) => {
            const skills = a.mix ? a.MIX.map(([c, k]) => ({ categoryId: c, skillId: k })) : [{ categoryId: 'algebra', skillId: 'tape_diagram' }];
            const s = await window.buildSheet({ role: 'independent', sections: [{ skills, columns: 'auto' }], size: a.size, look: 'auto', paper: 'A4', seed: a.seed, form: 'A', key: false, anchors: 'off' });
            return '<!doctype html>' + window.sheetDocument(s.pupilHtml, 'tape', { paper: 'A4' });
        }, { size, seed, mix, MIX });
        if (!sheet) { sheet = await app.browser.newPage(); await sheet.setViewport({ width: 900, height: 1200, deviceScaleFactor: 1 }); await sheet.goto(app.page.url(), { waitUntil: 'domcontentloaded' }); await sheet.emulateMediaType('print'); }
        await sheet.setContent(html, { waitUntil: 'load', timeout: 60000 });
        const parts = await sheet.evaluate(async (f) => { await document.fonts.ready; return (0, eval)(`(${f})`)(document.body); }, partsOf.toString());
        partsSeen += parts.length;
        if (process.env.TD_DEBUG) for (const p of parts) if (p.box.w - p.ink.w < 30) console.log('DBG', size, seed, mix, p.t, p.box.w.toFixed(1), p.ink.w.toFixed(1));
        judge(`print independent${mix ? ' (mixed set)' : ''} ${size} seed ${seed}`, parts);
    }
    for (const w of [342, 760]) for (let i = 0; i < SEEDS * 4; i++) {
        const parts = await app.page.evaluate(async (a, f) => {
            const q = window.generateQuestionFor({ category: 'algebra', skill: 'tape_diagram', seed: 7919 * (a.i + 1), itemIndex: a.i % 6 });
            const d = document.createElement('div'); d.style.cssText = `width:${a.w}px;position:absolute;left:0;top:0;`; d.innerHTML = q.visual || '';
            document.body.appendChild(d); await document.fonts.ready;
            const r = (0, eval)(`(${f})`)(d);
            d.remove();
            return { text: q.text, r };
        }, { w, i }, partsOf.toString());
        partsSeen += parts.r.length;
        judge(`screen ${w} px item ${i + 1} ("${String(parts.text).slice(0, 48)}")`, parts.r);
    }
} finally { if (sheet) await sheet.close().catch(() => {}); await app.close(); }
if (!partsSeen) bad('no tape part found (the detector or the drawing changed)');
console.log(`TAPE-LABEL-INSIDE ${out.length ? `FAIL ${out.length}` : 'PASS'} (${partsSeen} parts; print S/M/L x ${SEEDS} seeds, alone and mixed, screen 342 / 760 px x ${SEEDS * 4} items)`);
for (const f of out.slice(0, 25)) console.log(`  ${f}`);
console.log(out.length ? `${TOOL}: FAIL (${out.length} finding(s))` : `${TOOL}: OK (TAPE-LABEL-INSIDE)`);
process.exit(out.length ? 1 : 0);
