// Critic r2 attack: per cell, align key text / svg marks against the pupil twin; report
// given content in key ink and added (answer) content left black.
const path = require('path');
const fs = require('fs');
const ROOT = process.env.MQ_ROOT;
const { open } = require(path.join(ROOT, 'tests/lib/ws-harness.cjs'));
const OUT = process.env.OUT || path.join(__dirname, 'attack.json');
const ROLES = (process.env.ROLES || 'lesson,scripted-model,guided,independent,more-practice,mixed-practice,review,test,opener,word-problems,fact-rows,pre-skill-check').split(',');
const PLACE = process.env.PLACE || 'end';

(async () => {
    const app = await open({ seed: 1 });
    const { page } = app;
    page.setDefaultTimeout(0);
    try {
        // one skill per template
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
        const extra = (process.env.EXTRA || '').split(',').filter(Boolean).map((s) => s.split(':'));
        const FAM = [];
        for (const [t, list] of Object.entries(pick)) { if (t === 'err' || t === 'none') continue; FAM.push(list[0]); if (list.length > 6) FAM.push(list[Math.floor(list.length / 2)]); }
        FAM.push(...extra);
        if (process.env.ALL) { FAM.length = 0; for (const list of Object.values(pick)) FAM.push(...list); }
        console.log('templates', Object.keys(pick).map((t) => `${t}:${pick[t].length}`).join(' '));
        const results = []; const FAM0 = FAM.slice();
        for (const role of ROLES) {
          for (let ch = 0; ch < FAM0.length; ch += 20) { const FAM = FAM0.slice(ch, ch + 20);
            const r = await page.evaluate(async ({ role, FAM, PLACE }) => {
                const out = [];
                const f = document.createElement('iframe'); f.style.cssText = 'position:absolute;left:-3000px;width:900px;height:1200px'; document.body.appendChild(f);
                const ORANGE = 'rgb(194, 65, 12)';
                const lcs = (a, b) => {   // returns Set of matched indices in b
                    const n = a.length, m = b.length; const dp = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
                    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
                    const got = new Set(); let i = 0, j = 0;
                    while (i < n && j < m) { if (a[i] === b[j]) { got.add(j); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; }
                    return got;
                };
                const lcsMap = (a, b) => { const n = a.length, m = b.length; const dp = Array.from({ length: n + 1 }, () => new Int16Array(m + 1));
                    for (let i = n - 1; i >= 0; i--) for (let j = m - 1; j >= 0; j--) dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
                    const got = new Map(); let i = 0, j = 0; while (i < n && j < m) { if (a[i] === b[j]) { got.set(j, i); i++; j++; } else if (dp[i + 1][j] >= dp[i][j + 1]) i++; else j++; } return got; };
                for (const [categoryId, skillId] of FAM) {
                    const req = { role, sections: [{ skills: [{ categoryId, skillId }] }], letters: role === 'more-practice' ? ['A', 'B'] : undefined, size: 'L', paper: 'A4', seed: 4242, key: { on: true, placement: PLACE, style: 'copy' } };
                    let res;
                    try { res = await window.buildSheet(req); } catch (e) { out.push({ skillId, skip: String(e && e.message || e).slice(0, 60) }); continue; }
                    f.srcdoc = window.sheetDocument(res.docHtml, 'x'); await new Promise((ok) => { f.onload = ok; });
                    const d = f.contentDocument, w = f.contentWindow;
                    const pupil = [...d.querySelectorAll('section.ws-page[data-ws-mode="print"]')];
                    const keys = [...d.querySelectorAll('section.ws-page[data-ws-mode="key"]')];
                    let shortRes = null; try { shortRes = await window.buildSheet(Object.assign({}, req, { key: { on: true, placement: PLACE, style: 'short' } })); } catch (e) {}
                    const srows = (shortRes && shortRes.shortRows) || [];
                    const rec = { skillId, miss: [], heads: srows.map((r) => r.heading), pupilN: pupil.length, keyN: keys.length, given: [], black: [], svgGiven: [], svgBlack: [], svgPartial: [], ringBlack: [], textStroke: [], tagged: 0, orangeTxt: 0 };
                    const vis = (el) => { const cs = w.getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && el.getClientRects().length; };
                    const texts = (cell) => { const tw = d.createTreeWalker(cell, NodeFilter.SHOW_TEXT); const o = []; let n; while ((n = tw.nextNode())) { const s = n.textContent.replace(/\s+/g, ' ').trim(); if (s && n.parentElement && vis(n.parentElement)) o.push({ s, el: n.parentElement }); } return o; };
                    const svgs = (cell) => [...cell.querySelectorAll('svg line, svg path, svg circle, svg polyline, svg polygon, svg rect, svg ellipse')].filter(vis).map((el) => ({ el, s: [el.tagName, ...['d', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'points', 'x', 'y', 'width', 'height', 'fill', 'stroke', 'stroke-dasharray'].map((a) => el.getAttribute(a) || '')].join('|') }));
                    const top = (pg) => [...pg.querySelectorAll('[data-ws-cell]')].filter((c) => !c.parentElement.closest('[data-ws-cell]'));
                    keys.forEach((kp, ki) => {
                        const pp = pupil[ki]; if (!pp) return;
                        rec.tagged += kp.querySelectorAll('[data-ws-key-ans]').length;
                        const kc = top(kp), pc = top(pp);
                        kc.forEach((cell, ci) => {
                            const pcell = pc[ci]; if (!pcell) return;
                            const K = texts(cell), P = texts(pcell);
                            const m = lcs(P.map((x) => x.s), K.map((x) => x.s));
                            K.forEach((x, j) => {
                                const or = w.getComputedStyle(x.el).color === ORANGE;
                                if (or) rec.orangeTxt++;
                                const where = `p${ki + 1}c${ci + 1}`;
                                if (m.has(j) && or) rec.given.push(`${where} "${x.s.slice(0, 30)}"`);
                                if (!m.has(j) && !or) rec.black.push(`${where} "${x.s.slice(0, 30)}"`);
                            });
                            const added = K.filter((x, j) => !m.has(j)).map((x) => x.s).filter((t) => /\d|True|False|Correct|Fix/.test(t) && !/^[a-z]\.$/.test(t));
                            const row = srows[ki]; const it = row && row.items.find((i) => i.cell === ci + 1);
                            const nz = (v) => String(v).replace(/[\s,]/g, '').replace(/−/g, '-');
                            if (it && added.length) { const lost = added.filter((t) => !nz(it.text).includes(nz(t))); if (lost.length) rec.miss.push(`p${ki + 1}c${ci + 1} ${it.label} "${String(it.text).slice(0, 40)}" lacks ${lost.slice(0, 3).join('/')}`); }
                            if (!it && added.length && srows.length) rec.miss.push(`p${ki + 1}c${ci + 1} no short entry for ${added.slice(0, 3).join('/')}`);
                            const KS = svgs(cell), PS = svgs(pcell);
                            const ms = lcs(PS.map((x) => x.s), KS.map((x) => x.s));
                            KS.forEach((x, j) => {
                                const cs = w.getComputedStyle(x.el);
                                const st = cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0 ? cs.stroke : '';
                                const fi = cs.fill !== 'none' && !/rgb\(255, 255, 255\)|rgba\(0, 0, 0, 0\)/.test(cs.fill) ? cs.fill : '';
                                if (!st && !fi) return;
                                const or = st === ORANGE || fi === ORANGE;
                                const where = `p${ki + 1}c${ci + 1}`;
                                if (ms.has(j) && or) rec.svgGiven.push(`${where} ${x.el.tagName}`);
                                if (!ms.has(j) && or && ((st && st !== ORANGE) || (fi && fi !== ORANGE))) rec.svgPartial.push(`${where} ${x.el.tagName} st=${st} fi=${fi} ${(x.el.getAttribute('class') || '')}`);
                                if (!ms.has(j) && !or) rec.svgBlack.push(`${where} ${x.el.tagName} st=${st} fi=${fi} ${(x.el.getAttribute('class') || '')}`);
                            });
                            // boxes: given borders turned orange; added html marks (bg / border) left black
                            const els = (c) => [...c.querySelectorAll('*')].filter((e) => !(e instanceof w.SVGElement) && vis(e));
                            const esig = (e) => [e.tagName, e.getAttribute('class') || '', e.getAttribute('data-ws-slot') || '', e.getAttribute('data-ws-shape') || ''].join('|');
                            const KE = els(cell), PE = els(pcell);
                            const me = lcsMap(PE.map(esig), KE.map(esig));
                            const bord = (cs) => ['Top', 'Right', 'Bottom', 'Left'].some((s) => cs['border' + s + 'Style'] !== 'none' && parseFloat(cs['border' + s + 'Width']) > 0) ? cs.borderTopColor + '/' + cs.borderBottomColor : '';
                            KE.forEach((e, j) => {
                                const cs = w.getComputedStyle(e); const b = bord(cs);
                                const bg = cs.backgroundColor; const hasBg = bg && !/rgba\(0, 0, 0, 0\)|rgb\(255, 255, 255\)/.test(bg);
                                const where = `p${ki + 1}c${ci + 1}`;
                                if (me.has(j)) { const pe = PE[me.get ? me.get(j) : -1]; if (b && !b.includes(ORANGE)) { const pcs = pe && w.getComputedStyle(pe); if (pcs && !bord(pcs)) rec.ringBlack.push(`${where} ${e.tagName}.${(e.getAttribute('class') || '').slice(0, 30)} ${e.textContent.trim().slice(0, 25)}`); } if (b.includes(ORANGE) && !e.hasAttribute('data-ws-key-mark')) rec.given.push(`${where} border ${e.tagName}.${(e.getAttribute('class') || '').slice(0, 30)}`); }
                                else {
                                    if (hasBg && bg !== ORANGE && !e.closest('.mq-pupil')) rec.black.push(`${where} bg ${bg} ${e.tagName}.${(e.getAttribute('class') || '').slice(0, 30)}`);
                                }
                            });
                            [...cell.querySelectorAll('svg text, svg tspan')].forEach((t) => { const cs = w.getComputedStyle(t); if (cs.stroke !== 'none' && parseFloat(cs.strokeWidth) > 0 && t.textContent.trim()) rec.textStroke.push(`p${ki + 1}c${ci + 1} "${t.textContent.trim().slice(0, 8)}" ${cs.stroke} ${cs.strokeWidth}`); });
                            // outlines (circled choices)
                            const ko = [...cell.querySelectorAll('.ws-choice, [data-ws-shape]')], po = [...pcell.querySelectorAll('.ws-choice, [data-ws-shape]')];
                            ko.forEach((el, j) => {
                                const a = w.getComputedStyle(el), b = po[j] && w.getComputedStyle(po[j]);
                                const has = (c) => c && c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0;
                                if (has(a) && !has(b) && a.outlineColor !== ORANGE) rec.black.push(`p${ki + 1}c${ci + 1} outline ${el.className}`);
                                if (has(a) && has(b) && a.outlineColor === ORANGE) rec.given.push(`p${ki + 1}c${ci + 1} outline given`);
                            });
                        });
                    });
                    out.push(rec);
                }
                f.remove();
                return out;
            }, { role, FAM, PLACE });
            for (const x of r) {
                x.role = role; results.push(x);
                if (x.skip) { console.log(`${role} ${x.skillId}: skip ${x.skip}`); continue; }
                const flag = x.ringBlack.length || x.textStroke.length || x.svgPartial.length || x.given.length || x.svgGiven.length || x.black.length || x.svgBlack.length || x.miss.length || x.pupilN !== x.keyN;
                console.log(`${flag ? '!!' : 'ok'} ${role} ${x.skillId}: P${x.pupilN} K${x.keyN} tagged ${x.tagged} orangeTxt ${x.orangeTxt} | given-orange ${x.given.length} ${x.given.slice(0, 3).join('; ')} | answer-black ${x.black.length} ${x.black.slice(0, 4).join('; ')} | svgGiven ${x.svgGiven.length} ${x.svgGiven.slice(0, 2).join('; ')} | svgBlack ${x.svgBlack.length} ${x.svgBlack.slice(0, 2).join('; ')} | ringBlack ${x.ringBlack.length} ${x.ringBlack.slice(0, 2).join('; ')} | textStroke ${x.textStroke.length} ${x.textStroke.slice(0, 2).join('; ')} | svgPartial ${x.svgPartial.length} ${x.svgPartial.slice(0, 2).join('; ')} | shortMiss ${x.miss.length} ${x.miss.slice(0, 2).join('; ')} | heads ${x.heads.slice(0, 3).join(' / ')}`);
            }
          }
        }
        fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
    } finally { await app.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
