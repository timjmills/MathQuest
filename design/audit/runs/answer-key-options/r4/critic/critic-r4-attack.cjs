// Critic r4 attack: per cell, align every key element (HTML and SVG) with its pupil twin by
// STRUCTURE (tag, class, slot, shape; SVG geometry), never by text. Then judge:
//  text  : twin with same own text (not traced) must be black; new/changed own text must be orange;
//          traced twin -> black on a Model cell, orange elsewhere.
//  border: only sides with style != none, width > 0, colour not transparent. A side the twin also
//          shows must keep black (unless data-ws-key-mark); a side the key adds must be orange.
//  svg   : shapes as r3 (given orange / added black / partial); text stroke the twin lacks.
const path = require('path');
const fs = require('fs');
const ROOT = process.env.MQ_ROOT;
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const OUT = process.env.OUT || path.join(__dirname, 'attack.json');
const ROLES = (process.env.ROLES || 'independent').split(',');
const PLACE = process.env.PLACE || 'end';
const SIZE = process.env.SIZE || 'L';

(async () => {
    const app = await open({ seed: 1 });
    const { page } = app;
    page.setDefaultTimeout(0);
    try {
        const pick = await page.evaluate(() => {
            const by = {};
            for (const [cat, list] of Object.entries(window.SKILLS)) for (const s of list) {
                if (!s || !s.v || /^mixed/.test(s.v)) continue;
                let t = 'none';
                try { const q = window.generateQuestionFor({ category: cat, skill: s.v, seed: 3 }); t = (q && q.cell && q.cell.template) || 'legacy'; } catch (e) { t = 'err'; }
                (by[t] = by[t] || []).push([cat, s.v]);
            }
            return by;
        });
        let FAM = [];
        if (process.env.ALL) { for (const list of Object.values(pick)) FAM.push(...list); }
        else { for (const [t, list] of Object.entries(pick)) { if (t === 'err' || t === 'none') continue; FAM.push(list[0]); if (list.length > 6) FAM.push(list[Math.floor(list.length / 2)]); } }
        if (process.env.ONLY) FAM = process.env.ONLY.split(',').map((s) => s.split(':'));
        console.log('skills', FAM.length, 'templates', Object.keys(pick).map((t) => `${t}:${pick[t].length}`).join(' '));
        const results = [];
        for (const role of ROLES) {
          for (let ch = 0; ch < FAM.length; ch += 15) { const CH = FAM.slice(ch, ch + 15);
            const r = await page.evaluate(async ({ role, CH, PLACE, SIZE }) => {
                const out = [];
                const f = document.createElement('iframe'); f.style.cssText = 'position:absolute;left:-3000px;width:900px;height:1200px'; document.body.appendChild(f);
                const ORANGE = 'rgb(194, 65, 12)';
                const lcsMap = (a, b) => { const n = a.length, m = b.length; const dp = Array.from({ length: n + 1 }, () => new Int32Array(m + 1));
                    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
                    const got = new Map(); let i = 0, j = 0; while (i < n && j < m) { if (a[i] === b[j]) { got.set(j, i); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; } return got; };
                for (const [categoryId, skillId] of CH) {
                    const req = { role, sections: [{ skills: [{ categoryId, skillId }] }], letters: role === 'more-practice' ? ['A', 'B'] : undefined, size: SIZE, paper: 'A4', seed: 4242, key: { on: true, placement: PLACE, style: 'copy' } };
                    let res;
                    try { res = await window.buildSheet(req); } catch (e) { out.push({ skillId, skip: String(e && e.message || e).slice(0, 60) }); continue; }
                    f.srcdoc = window.sheetDocument(res.docHtml, 'x'); await new Promise((ok) => { f.onload = ok; });
                    const d = f.contentDocument, w = f.contentWindow;
                    const pupil = [...d.querySelectorAll('section.ws-page[data-ws-mode="print"]')];
                    const keys = [...d.querySelectorAll('section.ws-page[data-ws-mode="key"]')];
                    const rec = { skillId, cat: categoryId, pupilN: pupil.length, keyN: keys.length, givenText: [], ansBlack: [], givenBorder: [], addBorderBlack: [], traceModelOrange: [], traceGuidedBlack: [], svgGiven: [], svgBlack: [], svgPartial: [], textStroke: [], bgBlack: [], tagged: 0 };
                    const vis = (el) => { const cs = w.getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && el.getClientRects().length; };
                    const own = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
                    const isSvg = (e) => e instanceof w.SVGElement;
                    const GEO = ['d', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'points', 'x', 'y', 'width', 'height', 'transform'];
                    const sig = (e) => isSvg(e) ? [e.tagName, e.getAttribute('class') || '', ...GEO.map((a) => e.getAttribute(a) || '')].join('|')
                        : [e.tagName, (e.getAttribute('class') || ''), e.getAttribute('data-ws-slot') || '', e.getAttribute('data-ws-shape') || ''].join('|');
                    const sides = (cs) => { const o = {}; for (const s of ['Top', 'Right', 'Bottom', 'Left']) { const c = cs['border' + s + 'Color']; if (cs['border' + s + 'Style'] !== 'none' && cs['border' + s + 'Style'] !== 'hidden' && parseFloat(cs['border' + s + 'Width']) > 0 && !/rgba\(\d+, \d+, \d+, 0\)|transparent/.test(c)) o[s] = c; }
                        if (cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 && !/rgba\(\d+, \d+, \d+, 0\)|transparent/.test(cs.outlineColor)) o.Outline = cs.outlineColor; return o; };
                    const top = (pg) => [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]'));
                    const lab = (e) => `${e.tagName}.${String(e.getAttribute('class') || '').slice(0, 24)}`;
                    keys.forEach((kp, ki) => {
                        const pp = pupil[ki]; if (!pp) return;
                        rec.tagged += kp.querySelectorAll('[data-ws-key-ans],[data-ws-key-add],[data-ws-key-mark],[data-ws-key-fill]').length;
                        const kc = top(kp), pc = top(pp);
                        kc.forEach((cell, ci) => {
                            const pcell = pc[ci]; if (!pcell) return;
                            const model = cell.hasAttribute('data-ws-key-model') || !!cell.closest('[data-ws-key-model]') || !!cell.querySelector('[data-ws-key-model]');
                            const where = `p${ki + 1}c${ci + 1}${model ? 'M' : ''}`;
                            // the key's own text-only wrapper spans are not structure
                            const els = (c) => [c, ...c.querySelectorAll('*')].filter((e) => !e.hasAttribute('data-ws-key-text') && vis(e));
                            const KE = els(cell), PE = els(pcell);
                            const mp = lcsMap(PE.map(sig), KE.map(sig));
                            KE.forEach((e, j) => {
                                if (e.closest('.mq-pupil')) return;
                                const twin = mp.has(j) ? PE[mp.get(j)] : null;
                                const cs = w.getComputedStyle(e);
                                // own text: include the key's text-only wrapper child
                                const wrap = [...e.children].filter((x) => x.hasAttribute('data-ws-key-text'));
                                const t = (own(e) + wrap.map((x) => x.textContent).join('')).replace(/\s+/g, ' ').trim();
                                const svgText = isSvg(e) && /^(text|tspan)$/i.test(e.tagName);
                                if (t && (!isSvg(e) || svgText)) {
                                    const colEl = wrap[0] || e;
                                    const ccs = w.getComputedStyle(colEl);
                                    const col = svgText ? ccs.fill : ccs.color;
                                    const or = col === ORANGE;
                                    const traced = twin && twin.closest('[data-ws-ink="trace"]');
                                    const tt = twin ? own(twin) : null;
                                    if (traced) { if (model && or) rec.traceModelOrange.push(`${where} "${t.slice(0, 20)}"`); if (!model && !or && /\S/.test(t)) rec.traceGuidedBlack.push(`${where} "${t.slice(0, 20)}" ${col}`); }
                                    else if (twin && tt === t) { if (or) rec.givenText.push(`${where} ${lab(e)} "${t.slice(0, 20)}"`); }
                                    else if (!or && !model) rec.ansBlack.push(`${where} ${lab(e)} "${t.slice(0, 20)}"${twin ? ` was "${String(tt).slice(0, 12)}"` : ' (new)'}`);
                                    else if (!or && model) rec.ansBlack.push(`${where} MODEL ${lab(e)} "${t.slice(0, 20)}"${twin ? ` was "${String(tt).slice(0, 12)}"` : ' (new)'}`);
                                }
                                if (!isSvg(e)) {
                                    const ks = sides(cs), ps = twin ? sides(w.getComputedStyle(twin)) : {};
                                    for (const [s, c] of Object.entries(ks)) {
                                        if (twin && ps[s]) { if (c === ORANGE && !e.hasAttribute('data-ws-key-mark') && !(twin.closest('[data-ws-ink="trace"]') && !model)) rec.givenBorder.push(`${where} ${s} ${lab(e)}`); }
                                        else if (c !== ORANGE && !model) rec.addBorderBlack.push(`${where} ${s} ${lab(e)} ${c}${twin ? ' (twin lacks side)' : ' (new el)'}`);
                                    }
                                    const bg = cs.backgroundColor, pbg = twin ? w.getComputedStyle(twin).backgroundColor : '';
                                    if (bg !== pbg && !/rgba\(0, 0, 0, 0\)|rgb\(255, 255, 255\)/.test(bg) && bg !== ORANGE && !model) rec.bgBlack.push(`${where} ${lab(e)} ${bg}`);
                                } else if (svgText) {
                                    const tcs = twin ? w.getComputedStyle(twin) : null;
                                    const st = cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0 ? cs.stroke : '';
                                    const pst = tcs && tcs.stroke !== 'none' && parseFloat(tcs.strokeWidth) > 0 ? tcs.stroke : '';
                                    if (st && st !== pst && !(twin && pst)) rec.textStroke.push(`${where} "${(e.textContent || '').slice(0, 8)}" ${st}`);
                                } else if (!/^(svg|g|defs|text|tspan|clipPath|marker|pattern|title)$/i.test(e.tagName)) {
                                    const st = cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0 ? cs.stroke : '';
                                    const fi = cs.fill !== 'none' && !/rgb\(255, 255, 255\)|rgba\(0, 0, 0, 0\)/.test(cs.fill) ? cs.fill : '';
                                    if (!st && !fi) return;
                                    const or = st === ORANGE || fi === ORANGE;
                                    const tw = twin ? w.getComputedStyle(twin) : null;
                                    const same = twin && tw.fill === cs.fill || (twin && !or);
                                    if (twin && or) {
                                        // twin had a different (grey) fill and only the fill turned orange = answer shading, ok
                                        const pfi = tw.fill; const pst = tw.stroke;
                                        const traced = twin.closest('[data-ws-ink="trace"]');
                                        if (!traced && st === ORANGE && pst !== ORANGE) rec.svgGiven.push(`${where} ${e.tagName} stroke`);
                                        if (!traced && fi === ORANGE && pfi !== 'none' && !/148, 148, 148|rgb\(255, 255, 255\)|rgba\(0, 0, 0, 0\)/.test(pfi) && pfi !== ORANGE) rec.svgGiven.push(`${where} ${e.tagName} fill was ${pfi}`);
                                        if (traced && model) rec.traceModelOrange.push(`${where} ${e.tagName}`);
                                    }
                                    if (!twin && !or && !model) rec.svgBlack.push(`${where} ${e.tagName} st=${st} fi=${fi}`);
                                    if (!twin && or && ((st && st !== ORANGE) || (fi && fi !== ORANGE))) rec.svgPartial.push(`${where} ${e.tagName} st=${st} fi=${fi}`);
                                }
                            });
                        });
                    });
                    out.push(rec);
                }
                f.remove();
                return out;
            }, { role, CH, PLACE, SIZE });
            for (const x of r) {
                x.role = role; results.push(x);
                if (x.skip) { console.log(`${role} ${x.skillId}: skip ${x.skip}`); continue; }
                const keysF = ['givenText', 'ansBlack', 'givenBorder', 'addBorderBlack', 'traceModelOrange', 'traceGuidedBlack', 'svgGiven', 'svgBlack', 'svgPartial', 'textStroke', 'bgBlack'];
                const flag = keysF.some((k) => x[k].length) || x.pupilN !== x.keyN;
                console.log(`${flag ? '!!' : 'ok'} ${role} ${x.cat}:${x.skillId} P${x.pupilN} K${x.keyN} tagged ${x.tagged} ` + keysF.filter((k) => x[k].length).map((k) => `| ${k} ${x[k].length} ${x[k].slice(0, 3).join('; ')}`).join(' '));
            }
          }
        }
        fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
    } finally { await app.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
