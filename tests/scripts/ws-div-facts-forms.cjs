// div_facts "How it is written" (`divForm`, owner 2026-10-03): Standard (default) / Long division /
// Fraction / Vertical / Mix. Each form draws the SAME kit cell on paper and on screen.
//
// Checks
//   paper   every form at S / M / L: every item on the form's template (standard + vertical: fact,
//           long: division, fraction: equation), the pupil page draws that form, the key is printed
//           with every answer; Vertical also on a 10-column fact-rows page at S / M / L.
//   screen  the practice card at 390 and 1280 draws the same form (same template markers), and a
//           right answer typed into it scores.
//   mix     a 6- and a 9-item Mix page is exactly one third each of standard / long / fraction; the
//           same page reproduces from its seed; Vertical never appears in Mix.
//   mixed   inside a mixed-practice page (div_facts + mult_facts) the default deals all Standard,
//           and Mix deals one third each of the division items.
//   codes   every value round-trips through the share-code option payload.
//   roles   every form + Mix on EVERY role buildSheet composes (SHEET_ROLES), key built: it builds,
//           the pupil page draws the item in its chosen form (or the role's documented fallback:
//           fact-rows prints Long division / Fraction across, stretch and word-problems rewrite
//           the item), the key prints the answers, and Error analysis / True or False / Reason it
//           carry their verdicts (ticks) on the key only, never on the pupil page.
//   hosts   the online worksheet and the quiz draw each form and a right answer scores (driven by
//           ws-screen-answer.cjs --opts, the screen round-trip every redone skill passes).
//
// Run: /tmp/mq-browser-run.sh node tests/scripts/ws-div-facts-forms.cjs
const { open } = require('../lib/ws-harness.cjs');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let fails = 0;
const check = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fails++; };

const FORMS = ['standard', 'long', 'fraction', 'vertical'];
const TEMPLATE = { standard: 'equation', vertical: 'fact', long: 'division', fraction: 'equation' };
// What the form looks like in the drawn HTML (paper and screen).
const MARK = {
    standard: (h) => /class="ws-eq"|mq-hfact|ws-fact-across|data-ws-across/.test(h) || /÷[^<]*<\/span>[^]*=/.test(h),
    long: (h) => /data-ws-ops="division"|class="mq-ldiv"/.test(h),
    fraction: (h) => /data-ws-notation="fraction"/.test(h),
    vertical: (h) => /ws-fact\b/.test(h) && !/data-ws-notation="fraction"/.test(h),
};

(async () => {
    const app = await open({ seed: 1, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const { page } = app;
    try {
        // ---------------------------------------------------------------- paper
        for (const form of FORMS) {
            for (const size of ['S', 'M', 'L']) {
                const r = await page.evaluate(async (form, size) => {
                    const res = await window.buildSheet({ role: 'independent', size, seed: 4242, key: true,
                        sections: [{ skills: [{ categoryId: 'division', skillId: 'div_facts', opts: { divForm: form } }], count: 6 }] });
                    return { templates: res.items.map((i) => i.template), answers: res.items.map((i) => String(i.ans)), pupil: res.pupilHtml, key: res.keyHtml };
                }, form, size);
                check(r.templates.length === 6 && r.templates.every((t) => t === TEMPLATE[form]), `paper ${form} ${size}: all ${TEMPLATE[form]} (${r.templates.join(',')})`);
                check(MARK[form](r.pupil), `paper ${form} ${size}: pupil page draws the ${form} form`);
                check(!!r.key && r.answers.every((a) => r.key.includes(`>${a}<`) || r.key.includes(a)), `paper ${form} ${size}: key prints every answer`);
                if (form === 'standard') check(!/ws-fact\b[^"]*"[^>]*>\s*<span[^>]*>\d+<\/span>\s*<span[^>]*>÷/.test(r.pupil) && !/data-ws-ops="division"|data-ws-notation="fraction"/.test(r.pupil), `paper standard ${size}: no other form on the page`);
            }
        }
        for (const size of ['S', 'M', 'L']) {
            const r = await page.evaluate(async (size) => {
                const res = await window.buildSheet({ role: 'fact-rows', size, seed: 99, key: true,
                    sections: [{ skills: [{ categoryId: 'division', skillId: 'div_facts', opts: { divForm: 'vertical' } }], columns: 10 }] });
                const two = await window.buildSheet({ role: 'fact-rows', size, seed: 99, key: true,
                    sections: [{ skills: [{ categoryId: 'division', skillId: 'div_facts', opts: { divForm: 'vertical', constant: [2, 5] } }], columns: 10 }] });
                const big = res.items.some((i) => /\d{3}/.test(i.text));
                return { cols: res.fits && res.fits.cols, big, n: res.items.length, note: (res.fits && res.fits.note) || '',
                    cols2: two.fits && two.fits.cols, big2: two.items.some((i) => /\d{3}/.test(i.text)), note2: (two.fits && two.fits.note) || '' };
            }, size);
            check(r.big ? (r.cols >= 5 && r.cols < 10) : r.cols === 10, `paper vertical fact-rows ${size}, tables to 12: ${r.cols} columns (${r.big ? '3-digit dividends: fewer columns, same digits' : '10'}), ${r.n} facts`);
            check(r.cols2 === 10 && !r.big2, `paper vertical fact-rows ${size}, 2-digit dividends: 10 columns (${r.cols2})`);
            check(!/Digits \d+ pt so/.test(r.note + r.note2), `paper vertical fact-rows ${size}: no shrink ("${r.note}" / "${r.note2}")`);
        }


        // ---------------------------------------------------------------- every role
        const ROLES = await page.evaluate(async () => (await import('/js/modules/print-sheet.js')).SHEET_ROLES);
        // Roles that rewrite the item (no single fact left to draw in a form) - see their comments.
        const REWRITE = new Set(['stretch', 'word-problems']);
        for (const role of ROLES) {
            for (const form of [...FORMS, 'mix']) {
                const r = await page.evaluate(async (role, form) => {
                    try {
                        const res = await window.buildSheet({ role, size: 'M', seed: 4242, key: true,
                            sections: [{ skills: [{ categoryId: 'division', skillId: 'div_facts', opts: { divForm: form } }], count: 6 }] });
                        // the item's kit template (count-row: the Review page's own warm-up rows)
                        const forms = res.items.map((i) => i.template).filter((t) => t !== 'count-row');
                        const p = res.pupilHtml || '', k = res.keyHtml || '';
                        const txt = (h) => { const d = document.createElement('div'); d.innerHTML = h.replace(/<style[^]*?<\/style>/g, ''); return d.textContent; };
                        return { n: res.items.length, forms, pupil: p, key: k, keyText: txt(k), answers: res.items.map((i) => String(i.ans)),
                            pupilSaid: /The answer is\s*\d/.test(txt(p)), keySaid: /The answer is\s*\d/.test(txt(k)),
                            pupilTicks: (txt(p).match(/✓/g) || []).length, keyTicks: (txt(k).match(/✓/g) || []).length };
                    } catch (e) { return { err: String(e && e.message || e) }; }
                }, role, form);
                const tag = `role ${role} ${form}`;
                if (r.err) { check(false, `${tag}: builds (${r.err})`); continue; }
                check(r.n > 0 && !!r.key, `${tag}: builds with its key (${r.n} items)`);
                if (REWRITE.has(role)) check(true, `${tag}: dealt (${r.forms[0]})`);
                else if (form !== 'mix') check(r.forms.every((f) => f === TEMPLATE[form]), `${tag}: every item dealt on the ${TEMPLATE[form]} template`);
                else check(r.forms.every((f) => f === 'division' || f === 'equation') && (r.n < 3 || new Set(r.forms).size === 2), `${tag}: Mix deals bracket and one-line cells (${[...new Set(r.forms)].join(',')})`);
                const long = (r.pupil.match(/data-ws-ops="division"/g) || []).length;
                const frac = (r.pupil.match(/data-ws-notation="fraction"/g) || []).length;
                const vert = (r.pupil.match(/class="ws-fact"/g) || []).length;
                if (REWRITE.has(role)) check(true, `${tag}: role rewrites the item (documented fallback)`);
                else if (form === 'long') check(long > 0 && frac === 0 && vert === 0, `${tag}: draws the bracket (${long})`);
                else if (form === 'fraction') check(frac > 0 && long === 0 && vert === 0, `${tag}: draws the fraction bar (${frac})`);
                else if (form === 'vertical') check(vert > 0 && long === 0 && frac === 0, `${tag}: draws vertical facts (${vert})`);
                else if (form === 'standard') check(vert === 0 && long === 0 && frac === 0 && /÷/.test(r.pupil), `${tag}: draws across, nothing stacked`);
                else if (r.n < 3) check(long + frac > 0 && vert === 0, `${tag}: one worked item, drawn in a Mix form`);
                else check(long > 0 && frac > 0 && vert === 0, `${tag}: draws both bracket and fraction (${long}/${frac})`);
                if (['error-analysis', 'true-false'].includes(role)) check(r.pupilTicks === 0 && r.keyTicks > 0, `${tag}: the verdicts are on the key only (pupil ${r.pupilTicks}, key ${r.keyTicks})`);
                if (role === 'reason-it') check(!r.pupilSaid && r.keySaid, `${tag}: "The answer is __" is written on the key only`);
                // the key carries the answers (a role prints a subset of the dealt items, so at least one)
                check(r.answers.some((a) => r.keyText.includes(a)), `${tag}: key prints answers`);
            }
        }

        // ---------------------------------------------------------------- screen (practice card)
        for (const form of FORMS) {
            for (const w of [390, 1280]) {
                await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1 });
                await page.reload({ waitUntil: 'networkidle2' });
                await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
                await page.evaluate((form) => {
                    window.clearSetOptions({ silent: true });
                    window.setSetOptions('division', 'div_facts', { divForm: form }, { silent: true });
                    const st = window.state; st.quizMode = false; st.category = 'division'; st.skill = 'div_facts'; st.gameMode = 'practice'; st.isMixedMode = false; st.hasAnswered = false;
                    window.showView('gameView'); st.currentQ = window.generateQuestion(); window.renderQuestion();
                }, form);
                await sleep(500);
                const s = await page.evaluate(() => ({ html: document.getElementById('questionPaper').innerHTML, form: window.state.currentQ.divForm, tpl: window.state.currentQ.cell && window.state.currentQ.cell.template, ans: window.state.currentQ.ans }));
                check(s.form === form && s.tpl === TEMPLATE[form], `screen ${form} ${w}: item is ${s.form} on ${s.tpl}`);
                check(MARK[form](s.html), `screen ${form} ${w}: the card draws the ${form} form`);
                const instr = await page.evaluate(() => { const e = document.querySelector('#questionText .mq-instr-text'); return e ? e.textContent.trim() : (document.getElementById('questionText') || {}).textContent; });
                check(instr === 'Divide.', `D9 screen ${form} ${w}: the card's line is "Divide." (${instr})`);
                // Answer it through the boxes the card draws.
                const before = await page.evaluate(() => window.state.score || 0);
                await page.evaluate((ans) => {
                    const root = document.getElementById('questionPaper');
                    const digits = Array.from(root.querySelectorAll('input')).filter((i) => i.offsetParent !== null && !i.disabled && i.type !== 'hidden');
                    const A = String(ans);
                    if (digits.length > 1) {
                        // digit boxes (the long-division quotient strip): right-aligned
                        const pad = A.padStart(digits.length, ' ');
                        digits.forEach((el, i) => { el.value = pad[i] === ' ' ? '' : pad[i]; el.dispatchEvent(new Event('input', { bubbles: true })); });
                    } else if (digits[0]) { digits[0].value = A; digits[0].dispatchEvent(new Event('input', { bubbles: true })); }
                }, s.ans);
                await sleep(200);
                await page.evaluate(() => { const b = document.querySelector('#qcCheckBtn'); if (b) b.click(); else if (window.submitAnswer) window.submitAnswer(); });
                await sleep(600);
                const after = await page.evaluate(() => window.state.score || 0);
                check(after > before, `screen ${form} ${w}: right answer scores`);
            }
        }


        // ---------------------------------------------------------------- online worksheet + quiz: drawn in form
        await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
        for (const form of [...FORMS, 'mix']) {
            await page.reload({ waitUntil: 'networkidle2' });
            await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS, { timeout: 30000 });
            await page.evaluate((form) => {
                window.clearSetOptions({ silent: true });
                window.setSetOptions('division', 'div_facts', { divForm: form }, { silent: true });
                const st = window.state; st.category = 'division'; st.skill = 'div_facts'; st.gameMode = 'worksheet'; st.isMixedMode = false; st.problemCount = 6;
                window.initWorksheet();
            }, form);
            await page.waitForFunction(() => { const g = document.getElementById('worksheetGrid'); return !!g && g.dataset.mqLaidOut === '1'; }, { timeout: 30000 });
            const w = await page.evaluate(() => window.state.worksheetQs.map((q, i) => ({ f: q.divForm, html: (document.getElementById('ws_card_' + i) || {}).innerHTML || '' })));
            const okW = w.length > 0 && w.every((c) => (form === 'mix' ? ['standard', 'long', 'fraction'].includes(c.f) : c.f === form) && MARK[c.f](c.html));
            check(okW, `worksheet ${form}: every card drawn in its form (${w.map((c) => c.f).join(',')})`);
            // D9: every card says "Divide." (no across restatement); D10: one digit size on the page
            const scr = await page.evaluate(() => {
                const cards = Array.from(document.querySelectorAll('#worksheetGrid .problem-card'));
                const instr = cards.map((c) => { const e = c.querySelector('.mq-instr-text, .ws-instr, .problem-instr, .ws-card-instr'); return e ? e.textContent.trim() : ''; });
                const sizes = cards.map((c) => Math.max(0, ...Array.from(c.querySelectorAll('.ws-cell *')).filter((e) => !e.children.length && /^\d+$/.test(e.textContent.trim()) && e.offsetParent).map((e) => parseFloat(getComputedStyle(e).fontSize))));
                const said = cards.map((c) => (c.innerText || '').replace(/\s+/g, ' '));
                return { instr, sizes, said };
            });
            check(scr.said.every((t) => !/\d+ ÷ \d+ = \?/.test(t)), `D9 worksheet ${form}: no "a ÷ b = ?" restatement on a card`);
            const sz = scr.sizes.filter((x) => x > 0);
            check(sz.length && Math.max(...sz) / Math.min(...sz) <= 1.1, `D10 worksheet ${form}: one digit size across the cards (${[...new Set(sz)].join(', ')} px)`);
            await page.evaluate(() => { Array.from(document.body.children).filter((e) => getComputedStyle(e).position === 'fixed' && getComputedStyle(e).zIndex === '9999').forEach((e) => e.remove()); });
            const qz = await page.evaluate((form) => {
                const questions = [];
                for (let i = 0; i < 3; i++) {
                    const q = window.generateQuestionFor({ category: 'division', skill: 'div_facts', seed: 300 + i, itemIndex: i, opts: { divForm: form } });
                    questions.push({ id: i, skillId: 'div_facts', points: 1, questionData: window.quizQuestionData(q) });
                }
                const test = { id: null, name: 'Forms', sections: [{ id: 0, label: 'A', layout: { columns: 2, spacing: 'normal' }, instructions: '', questions }],
                    settings: { timeLimit: null, randomOrder: false, showFeedback: 'end', allowRetry: false, passingScore: 70, sectionMode: 'sequential', shuffleWithinSections: false, printVersions: 1 } };
                window.handleQuizURL(window.compressTestForURL(test));
                const name = document.getElementById('qtStudentName'); name.value = 'A'; name.dispatchEvent(new Event('input'));
                window.startQuizTest();
                const cell = document.querySelector('#quizTakeView .qt-cell');
                return { f: window.generateQuestionFor({ category: 'division', skill: 'div_facts', seed: 300, itemIndex: 0, opts: { divForm: form } }).divForm, html: cell ? cell.innerHTML : '' };
            }, form);
            check((form === 'mix' ? ['standard', 'long', 'fraction'].includes(qz.f) : qz.f === form) && !!qz.f && MARK[qz.f](qz.html), `quiz ${form}: the question draws its form (${qz.f})`);
            await page.evaluate(() => { try { window.state.quizMode = false; } catch (e) {} });
        }


        // ---------------------------------------------------------------- critic R1 defects (D1-D14)
        const build = (req) => page.evaluate(async (req) => {
            const res = await window.buildSheet(req);
            const tmp = document.createElement('div');
            const txt = (h) => { tmp.innerHTML = h.replace(/<style[^]*?<\/style>/g, ''); return tmp.textContent; };
            return { pupil: res.pupilHtml, key: res.keyHtml, n: res.items.length, pages: res.pageCount, keyText: txt(res.keyHtml), pupilText: txt(res.pupilHtml),
                fits: res.fits, items: res.items.map((i) => ({ t: i.template, text: i.text, ans: String(i.ans) })) };
        }, req);
        const one = (form, role, size, extra = {}) => build(Object.assign({ role, size, seed: 4242, key: true,
            sections: [Object.assign({ skills: [{ categoryId: 'division', skillId: 'div_facts', opts: { divForm: form } }] }, extra)] }));
        // D1: every answer line on a page is one width (the band's, never the answer's own)
        for (const form of ['standard', 'fraction', 'mix']) for (const size of ['S', 'L']) {
            const r = await one(form, 'independent', size);
            const ws = [...new Set((r.pupil.match(/class="ws-line[^"]*" style="--w:[^;"]+/g) || []).map((m) => m.replace(/^.*--w:/, '')))];
            check(ws.length === 1, `D1 ${form} ${size}: every answer line one width (${ws.join(' | ')})`);
            // D2: the key's written answer at the digit size, bold (not the line's caption size)
            check(/class="ws-line[^"]*" style="[^"]*font-size:1em;font-weight:700/.test(r.key), `D2 ${form} ${size}: key answers drawn at the digit size`);
            if (form !== 'standard') check(/border-bottom:1\.5pt solid #000/.test(r.pupil) && /data-ws-notation="fraction" style="align-items:center"/.test(r.pupil), `D3 ${form} ${size}: fraction bar 1.5 pt, "=" and the line on its axis`);
        }
        // D4: Standard packs at its one-line height - S holds more than L, and more than the old 12
        {
            const S = await one('standard', 'independent', 'S'), L = await one('standard', 'independent', 'L');
            check(S.n > L.n && S.n > 12 && S.pages === 1 && L.pages === 1, `D4 standard: S ${S.n} > L ${L.n} items, one page each`);
        }
        // D5: fact rows draw every form; Mix one third each
        for (const size of ['S', 'L']) for (const form of ['long', 'fraction', 'mix']) {
            const r = await one(form, 'fact-rows', size);
            const long = (r.pupil.match(/data-ws-ops="division"/g) || []).length, frac = (r.pupil.match(/data-ws-notation="fraction"/g) || []).length;
            const ok = form === 'long' ? long === r.n : form === 'fraction' ? frac === r.n : (long === r.n / 3 && frac === r.n / 3);
            check(ok && r.pages === 1, `D5 fact rows ${form} ${size}: every fact in its form (${r.n} facts, ${long} bracket, ${frac} fraction)`);
        }
        // D6: a probe is ONE page in every form at every size
        for (const form of ['standard', 'long', 'fraction', 'vertical', 'mix']) for (const size of ['S', 'M', 'L']) {
            const r = await one(form, 'fact-probe', size);
            check(r.pages === 1 && r.n === 20, `D6 probe ${form} ${size}: 20 facts on ${r.pages} page(s)`);
        }
        // D7: a Mix lesson models all three forms; Mix Guided leads with a Model of each form
        {
            const r = await page.evaluate(async () => {
                const res = await window.buildSheet({ role: 'lesson', size: 'L', seed: 4242, key: true, sections: [{ skills: [{ categoryId: 'division', skillId: 'div_facts', opts: { divForm: 'mix' } }] }] });
                return res.pupilHtml;
            });
            const chart = r.split(/Guided Practice:/)[0];
            check(/data-ws-ops="division"/.test(chart) && /data-ws-notation="fraction"/.test(chart) && /class="ws-eq"(?! data-ws-notation)/.test(chart), 'D7 Mix lesson: the anchor chart shows the fact in all three forms');
            const g = await one('mix', 'guided', 'L');
            const models = (g.pupil.match(/mq-modelcell/g) || []).length;
            check(models >= 3, `D7 Mix guided: one Model per form (${models} model cells)`);
        }
        // D8: lesson Long / Fraction: the lesson sheet's Independent rows fill the page (more than 6)
        for (const form of ['long', 'fraction']) {
            const r = await page.evaluate(async (form) => {
                const res = await window.buildSheet({ role: 'lesson', size: 'L', seed: 4242, key: true, sections: [{ skills: [{ categoryId: 'division', skillId: 'div_facts', opts: { divForm: form } }] }] });
                const m = /(\d+) independent/.exec((res.fits && res.fits.note) || '');
                return { indep: m ? Number(m[1]) : 0, practice: res.items.filter((i) => i.part === 'practice').length };
            }, form);
            check(r.indep > 6 && r.practice > 6, `D8 lesson ${form}: the lesson sheet's Independent and the practice page hold more than 6 (${JSON.stringify(r)})`);
        }
        // D11: one label sequence per page (aa. after z.)
        for (const form of ['long', 'fraction', 'mix']) {
            const r = await one(form, 'independent', 'S');
            const pages = r.pupil.split(/class="ws-page\b/).slice(1);
            const dup = pages.some((pg) => { const l = (pg.match(/data-ws-label="letter">([a-z]+)\./g) || []).map((x) => x.replace(/^.*>/, '')); return new Set(l).size !== l.length; });
            check(!dup, `D11 ${form} S: no repeated label on a page`);
        }
        // D12: guided Long / Fraction keep the times-fact hint; the steps never name other numbers
        for (const form of ['long', 'fraction']) {
            const r = await one(form, 'guided', 'L');
            check(/mq-thinkcue/.test(r.pupil) && !/Read the division: 24 ÷ 6/.test(r.pupilText), `D12 guided ${form}: the times-fact hint kept, number-free steps`);
        }
        // D13: no quotient boxes on Independent / Test bracket cells; the Guided ones keep them
        for (const role of ['independent', 'test']) {
            const r = await one('long', role, 'L');
            check(!/data-ws-slot="q-\d+" data-ws-shape="box"/.test(r.pupil) && /data-ws-slot="q-\d+" data-ws-shape="open"/.test(r.pupil), `D13 ${role}: the quotient is written on the bracket, no boxes`);
        }
        {
            const r = await one('long', 'guided', 'L');
            check(/data-ws-slot="q-\d+" data-ws-shape="box"/.test(r.pupil), 'D13 guided: the quotient boxes stay (VA-61)');
        }
        // D14: Mix at L holds at least 12, one page
        {
            const r = await one('mix', 'independent', 'L');
            check(r.n >= 12 && r.pages === 1, `D14 Mix L: ${r.n} items on ${r.pages} page(s)`);
        }

        // ---------------------------------------------------------------- mix
        // A page's forms, counted from what it draws: the bracket, the fraction bar, the rest across.
        const formsOf = (r) => {
            const long = (r.pupil.match(/data-ws-ops="division"/g) || []).length;
            const fraction = (r.pupil.match(/data-ws-notation="fraction"/g) || []).length;
            return { standard: r.n - long - fraction, long, fraction };
        };
        for (const n of [6, 9]) {
            const r = await page.evaluate(async (n) => {
                const one = async () => window.buildSheet({ role: 'independent', size: 'M', seed: 777, key: true,
                    sections: [{ skills: [{ categoryId: 'division', skillId: 'div_facts', opts: { divForm: 'mix' } }], count: n }] });
                const x = await one(), y = await one();
                return { n: x.items.length, t: x.items.map((i) => i.template + ':' + i.text), t2: y.items.map((i) => i.template + ':' + i.text), pupil: x.pupilHtml, key: x.keyHtml,
                    rows: Array.from(new Set((x.pupilHtml.match(/data-ws-cell="[a-z-]+"/g) || []))), fits: x.fits && x.fits.sections && x.fits.sections.length };
            }, n);
            const c = formsOf(r);
            check(r.n === n && c.standard === n / 3 && c.long === n / 3 && c.fraction === n / 3, `mix ${n}: one third each (${JSON.stringify(c)})`);
            check(r.t.join() === r.t2.join(), `mix ${n}: reproduces from its seed`);
            check(r.fits === 1, `mix ${n}: one section, one grid (aligned cells; ${r.fits} section(s))`);
            check((r.key.match(/data-ws-ops="division"/g) || []).length === c.long && (r.key.match(/data-ws-notation="fraction"/g) || []).length === c.fraction, `mix ${n}: the key draws each cell in its own form`);
        }
        // the page's own count (one page) at every size: Mix stays one page, in dealt order (the
        // tall-first H13 sort would put every Standard fact at the foot, or overleaf)
        for (const size of ['S', 'M', 'L']) {
            const r = await page.evaluate(async (size) => {
                const res = await window.buildSheet({ role: 'independent', size, seed: 69559, key: true,
                    sections: [{ skills: [{ categoryId: 'division', skillId: 'div_facts', opts: { divForm: 'mix' } }] }] });
                return { pages: res.pageCount, n: res.items.length, order: res.items.map((i) => i.template[0]).join(''), kinds: (res.pupilHtml.match(/data-ws-ops="division"|data-ws-notation="fraction"|÷/g) || []).length };
            }, size);
            const firstHalf = r.order.slice(0, Math.ceil(r.n / 2));
            check(r.pages === 1 && /d/.test(firstHalf) && /e/.test(firstHalf), `mix ${size}, the page's own count: one page, forms interleaved (${r.n} items, ${r.pages} page(s), ${r.order})`);
        }
        const forms = await page.evaluate(() => {
            const out = [];
            for (let i = 0; i < 30; i++) { const q = window.generateQuestionFor({ category: 'division', skill: 'div_facts', opts: { divForm: 'mix' }, seed: 50 + i, itemIndex: i }); out.push(q.divForm); }
            return out;
        });
        check(!forms.includes('vertical') && [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].every((b) => new Set(forms.slice(b * 3, b * 3 + 3)).size === 3), 'mix: every block of three is one of each, never Vertical');
        const orders = await page.evaluate(() => [1, 2, 3, 4, 5, 6].map((s) => [0, 1, 2].map((i) => window.generateQuestionFor({ category: 'division', skill: 'div_facts', opts: { divForm: 'mix' }, seed: s * 1000 + i, itemIndex: i }).divForm).join('')));
        check(new Set(orders).size > 1, `mix: the order follows the seed (${orders.join(' ')})`);

        // ---------------------------------------------------------------- mixed practice
        for (const [opts, want] of [[{}, 'standard'], [{ divForm: 'mix' }, 'mix']]) {
            const r = await page.evaluate(async (opts) => {
                const res = await window.buildSheet({ role: 'independent', size: 'M', seed: 31, key: true,
                    sections: [{ skills: [{ categoryId: 'division', skillId: 'div_facts', opts }, { categoryId: 'multiplication', skillId: 'mult_facts', opts: {} }], count: 12 }] });
                return { n: res.items.filter((i) => /÷/.test(i.text)).length, pupil: res.pupilHtml };
            }, opts);
            const c = formsOf(r);
            if (want === 'standard') check(r.n > 0 && c.long === 0 && c.fraction === 0, `mixed page, default: every division fact Standard (${JSON.stringify(c)})`);
            else check(r.n > 0 && r.n % 3 === 0 && c.standard === r.n / 3 && c.long === r.n / 3 && c.fraction === r.n / 3, `mixed page, Mix: one third each of ${r.n} (${JSON.stringify(c)})`);
        }
        const notes = await page.evaluate(() => [0, 1, 2, 3].map((i) => window.generateQuestionFor({ category: 'division', skill: 'div_facts', opts: {}, seed: 9 + i, itemIndex: i }).divForm));
        check(notes.every((f) => f === 'standard'), 'default form is Standard');

        // ---------------------------------------------------------------- share codes
        const codes = await page.evaluate(async () => {
            const m = await import('/js/modules/skill-option-codec.js');
            return ['standard', 'long', 'fraction', 'vertical', 'mix'].map((v) => {
                const p = m.encodeOptionPayload('division', 'div_facts', { divForm: v });
                const back = m.decodeOptionPayload('division', 'div_facts', p);
                return { v, p, back: back && back.divForm };
            });
        });
        codes.forEach((c) => check(c.back === c.v || (c.v === 'standard' && (c.back === undefined || c.back === 'standard')), `share code ${c.v}: "${c.p}" -> ${c.back}`));

        // ---------------------------------------------------------------- critic R2 defects (D-A ... R-2)
        // Built at the SAME seeds and counts as the evidence pages (ws-grade-render: seed =
        // hash('<category>__<skill>:<role>') % 1e6, the role's own count), and measured on the INK
        // (tests/lib/ws-ink.cjs: the rendered page's dark pixels per cell), not on element boxes.
        // Bands: the critic's calibration reads up to 0.33 as normal (a passed Standard fact-rows page
        // measures 0.30-0.31); H13 is 0.30 of a cell with its label.
        // The evidence pages are built with no stored option (the screen sections above store a
        // div_facts form, which would deal another skill's warm-up in it).
        await page.evaluate(() => { try { window.clearSetOptions({ silent: true }); } catch (e) { /* none stored */ } });
        const hashS = (s) => { let h = 2166136261; for (const c of String(s)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
        const evSeed = (role, sk = 'division__div_facts') => hashS(`${sk}:${role}`) % 1000000;
        const evBuild = (role, size, opts, { skill = ['division', 'div_facts'], seed } = {}) => page.evaluate(async (a) => {
            const r = await window.buildSheet({ role: a.role, size: a.size, seed: a.seed, form: 'A', key: true, anchors: 'off',
                sections: [{ skills: [{ categoryId: a.skill[0], skillId: a.skill[1], opts: a.opts }] }] });
            return { doc: window.sheetDocument(r.pupilHtml, 'x'), pupil: r.pupilHtml, n: r.items.length, pages: r.pageCount,
                note: (r.fits && (r.fits.note || r.fits.line)) || '', forms: r.items.map((i) => i.template) };
        }, { role, size, opts, skill, seed: seed === undefined ? evSeed(role, skill.join('__')) : seed });
        const { inkScan, worst } = require('../lib/ws-ink.cjs');
        const f2 = (x) => (x === null || x === undefined ? '-' : x.toFixed(2));
        const BAND = 0.33;
        // (bands are compared at the critic's reporting precision, two decimals)
        const r2 = (x) => Math.round(x * 100) / 100;
        // Side bands (critic R3 N-1): a bracket with a ONE-digit dividend is drawn tight, as the Long
        // form draws it, and keeps its cell's own side margin - it is held to being centred, never to
        // the band (a drawing is never stretched to pass it). Every other cell is held to the band.
        const sideOf = (cells) => Math.max(0, ...cells.filter((c) => !c.empty && c.brk !== 1).map((c) => Math.max(c.left, c.right)));
        const offCentre = (cells) => Math.max(0, ...cells.filter((c) => !c.empty && c.brk === 1).map((c) => Math.abs(c.left - c.right)));
        const rowsEven = (pg) => { const hs = pg.cells.map((c) => c.h); return Math.max(...hs) / Math.min(...hs) <= 1.05; };
        // D-A: Mix at L (and S) - one cell size, no wide side bands, the page full
        for (const size of ['L', 'S']) {
            for (const role of ['independent', 'test']) {
                const r = await evBuild(role, size, { divForm: 'mix' });
                const ink = await inkScan(page, r.doc);
                const pg = ink.pages[0], w = worst(pg);
                check(r.pages === 1 && rowsEven(pg), `D-A mix ${role} ${size}: one page, every row one height (${w.rowsH.join('/')} px)`);
                check(r2(sideOf(pg.cells)) <= BAND && r2(w.bottom) <= 0.35 && offCentre(pg.cells) <= 0.06, `D-A mix ${role} ${size}: ink side band ${f2(sideOf(pg.cells))} <= ${BAND} (one-digit brackets centred, off by ${f2(offCentre(pg.cells))}), bottom ${f2(w.bottom)} <= 0.35`);
                check(w.strip < 0.2, `D-A mix ${role} ${size}: page strip under the grid ${f2(w.strip)} < 0.20`);
                if (role === 'independent') check(r.n >= (size === 'L' ? 15 : 27), `D-A mix independent ${size}: ${r.n} items (>= ${size === 'L' ? 15 : 27})`);
                if (role === 'test') check(r.n === (size === 'L' ? 12 : 20), `D-A mix test ${size}: the Test's ceiling, ${r.n}`);
            }
            const ls = await evBuild('lesson', size, { divForm: 'mix' });
            const li = await inkScan(page, ls.doc);
            // pages 2 and 3: the lesson sheet's Independent grid and the practice page
            for (const k of [1, 2]) {
                const pg = li.pages[k];
                if (!pg) { check(false, `D-A mix lesson ${size} p${k + 1}: exists`); continue; }
                const grids = pg.cells.filter((c) => !c.empty);
                // the practice cells: the most common cell height on the page (Guided / warm-up bands differ)
                const tally = new Map();
                grids.forEach((c) => tally.set(Math.round(c.h), (tally.get(Math.round(c.h)) || 0) + 1));
                const hMain = [...tally.entries()].sort((a, b) => b[1] - a[1])[0][0];
                const prac = grids.filter((c) => Math.abs(c.h - hMain) <= 3);
                const side = sideOf(prac), bottom = Math.max(...prac.map((c) => c.bottom));
                const wide = prac.filter((c) => c.w > 300).length;
                check(prac.length >= 9 && wide === 0 && r2(side) <= BAND && r2(bottom) <= 0.35, `D-A mix lesson ${size} p${k + 1}: ${prac.length} practice cells of one height, none a half-page cell (${wide}), side ${f2(side)}, bottom ${f2(bottom)}`);
            }
        }
        // D-B: the Standard Test holds its ceiling (20 / 12), the page filled, the bottom band held
        for (const size of ['S', 'L']) {
            const r = await evBuild('test', size, { divForm: 'standard' });
            const w = worst((await inkScan(page, r.doc)).pages[0]);
            check(r.n === (size === 'S' ? 20 : 12) && r.pages === 1, `D-B standard test ${size}: ${r.n} items on ${r.pages} page`);
            check(w.strip < 0.2 && r2(w.bottom) <= 0.35, `D-B standard test ${size}: strip ${f2(w.strip)} < 0.20, ink bottom band ${f2(w.bottom)} <= 0.35`);
        }
        // D-C: Mix fact rows and probe - the across facts at the Standard rows' rung, bands held, a
        // two-digit dividend read as one number
        for (const size of ['S', 'L']) {
            const std = await evBuild('fact-rows', size, { divForm: 'standard' }, { seed: evSeed('fact-rows') });
            const stdPt = Number((/Digits (\d+) pt/.exec(std.note) || [])[1]) || 20;
            for (const role of ['fact-rows', 'fact-probe']) {
                const r = await evBuild(role, size, { divForm: 'mix' });
                const ink = await inkScan(page, r.doc);
                const w = worst(ink.pages[0]);
                check(r.pages === 1 && (role === 'fact-rows' || r.n === 20), `D-C mix ${role} ${size}: one page (${r.n} facts)`);
                check(r2(w.bottom) <= 0.32 && r2(sideOf(ink.pages[0].cells)) <= BAND && offCentre(ink.pages[0].cells) <= 0.06 && rowsEven(ink.pages[0]), `D-C mix ${role} ${size}: ink bottom ${f2(w.bottom)} <= 0.32, side ${f2(sideOf(ink.pages[0].cells))} <= ${BAND}, one-digit brackets centred, rows one height (${w.rowsH.join('/')} px)`);
                const pts = [...new Set((r.pupil.match(/--ws-digit:(\d+)pt/g) || []).map((m) => Number(m.replace(/\D/g, ''))))];
                check(pts.length === 1 && pts[0] >= stdPt, `D-C mix ${role} ${size}: every form at ${pts.join('/')} pt (Standard rows ${stdPt} pt)`);
                const gaps = await page.evaluate((html) => {
                    const host = document.createElement('div');
                    host.className = 'ws-sheet';
                    host.style.cssText = 'position:absolute;left:0;top:0;width:210mm;visibility:hidden';
                    host.innerHTML = html;
                    document.body.appendChild(host);
                    const out = [];
                    for (const d of host.querySelectorAll('[data-ws-ops="division"]')) {
                        const digits = Array.from(d.querySelectorAll('span')).filter((s) => /border-top/.test(s.getAttribute('style') || '') && /^\d$/.test(s.textContent.trim()));
                        for (let i = 1; i < digits.length; i++) {
                            const rg = (el) => { const r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); };
                            const a = rg(digits[i - 1]), b = rg(digits[i]);
                            out.push((b.left - a.right) / a.width);
                        }
                    }
                    host.remove();
                    return out;
                }, r.pupil);
                check(gaps.length > 0 && Math.max(...gaps) <= 1, `D-C mix ${role} ${size}: dividend digit gap <= 1 digit width (worst ${f2(Math.max(...gaps))} of a digit)`);
            }
        }
        // D-D: a Mix Guided page models every form (3 Models), every problem in its own box
        for (const size of ['S', 'L']) for (const seed of [evSeed('guided'), 11, 2026]) {
            const r = await evBuild('guided', size, { divForm: 'mix' }, { seed });
            const models = (r.pupil.match(/class="[^"]*\bmq-modelcell\b/g) || []).length;
            const kinds = { long: /data-ws-ops="division"/.test(r.pupil), fraction: /data-ws-notation="fraction"/.test(r.pupil), across: /class="ws-eq(?: ws-eq-below)?"(?! data-ws-notation)/.test(r.pupil) };
            const over = await page.evaluate(async (doc) => {
                const fr = document.createElement('iframe');
                fr.style.cssText = 'position:absolute;left:-3000px;top:0;width:900px;height:1300px';
                document.body.appendChild(fr);
                fr.srcdoc = doc;
                await new Promise((ok) => { fr.onload = ok; });
                await fr.contentDocument.fonts.ready;
                const bad = [];
                for (const c of fr.contentDocument.querySelectorAll('.ws-grid > .ws-cell:not(.blankrun)')) {
                    const cr = c.getBoundingClientRect();
                    for (const e of c.querySelectorAll('*')) {
                        const er = e.getBoundingClientRect();
                        if (er.height && (er.bottom > cr.bottom + 1 || er.top < cr.top - 1)) { bad.push(c.textContent.trim().slice(0, 20)); break; }
                    }
                }
                fr.remove();
                return bad;
            }, r.doc);
            check(models === 3 && kinds.long && kinds.fraction && kinds.across, `D-D mix guided ${size} seed ${seed}: 3 Models, every form dealt (${models}; ${JSON.stringify(kinds)})`);
            check(over.length === 0, `D-D mix guided ${size} seed ${seed}: every problem inside its own box (${over.join(' | ')})`);
        }
        // R-1: the div_remainders lesson at L stays on its pages; R-2: the divide lesson's warm-up holds 3
        for (const size of ['S', 'L']) {
            const r = await evBuild('lesson', size, {}, { skill: ['division', 'div_remainders'] });
            const ink = await inkScan(page, r.doc);
            const over = ink.pages.filter((pg) => pg.gridBottom !== null && pg.footTop !== null && pg.gridBottom > pg.footTop - 2).length;
            check(over === 0, `R-1 div_remainders lesson ${size}: no page runs into its footer (${over})`);
            const d = await evBuild('lesson', size, {}, { skill: ['division', 'divide'] });
            const m = /(\d+) warm-up, (\d+) guided and (\d+) independent/.exec(d.note) || [];
            check(Number(m[1]) === 3, `R-2 divide lesson ${size}: the warm-up holds 3 (${m.slice(1).join('/')})`);
            const strip = (await inkScan(page, d.doc)).pages[1].strip;
            check(strip !== null && strip < 0.35, `R-2 divide lesson ${size} p2: page strip ${f2(strip)} < 0.35 (parent 0.37)`);
        }
        // R-2: one across look - the div_facts equation cell's "÷" advance matches the fact rows'
        {
            const adv = async (role) => {
                const r = await evBuild(role, 'L', { divForm: 'standard' });
                return page.evaluate((html) => {
                    const host = document.createElement('div');
                    host.className = 'ws-sheet';
                    host.style.cssText = 'position:absolute;left:0;top:0;width:210mm;visibility:hidden';
                    host.innerHTML = html;
                    document.body.appendChild(host);
                    const out = [];
                    const tw = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
                    for (let n = tw.nextNode(); n; n = tw.nextNode()) {
                        const t = n.textContent;
                        const k = t.indexOf('÷');
                        if (k < 0) continue;
                        const rg = document.createRange();
                        rg.setStart(n, k); rg.setEnd(n, k + 1);
                        const g = rg.getBoundingClientRect();
                        // the digit before the sign: in this text node, else the previous digit text
                        let prev = null;
                        const all = document.createTreeWalker(host, NodeFilter.SHOW_TEXT);
                        for (let m2 = all.nextNode(); m2 && m2 !== n; m2 = all.nextNode()) if (/\d\s*$/.test(m2.textContent)) prev = m2;
                        let dr;
                        const before = t.slice(0, k).replace(/\s+$/, '');
                        if (/\d$/.test(before)) { const r2 = document.createRange(); r2.setStart(n, before.length - 1); r2.setEnd(n, before.length); dr = r2.getBoundingClientRect(); }
                        else if (prev) { const s = prev.textContent.replace(/\s+$/, ''); const r2 = document.createRange(); r2.setStart(prev, s.length - 1); r2.setEnd(prev, s.length); dr = r2.getBoundingClientRect(); }
                        if (!dr) continue;
                        const fs = parseFloat(getComputedStyle(n.parentElement).fontSize);
                        out.push((g.left - dr.right) / fs);
                        if (out.length >= 6) break;
                    }
                    host.remove();
                    return out.length ? out.reduce((a, b) => a + b, 0) / out.length : null;
                }, r.pupil);
            };
            const a = await adv('independent'), b = await adv('fact-rows');
            check(a !== null && b !== null && Math.abs(a - b) <= 0.1 * Math.max(a, b) + 0.02, `R-2 one across look: digit-to-"÷" space ${f2(a)} em on Independent, ${f2(b)} em on fact rows`);
        }

        // ---------------------------------------------------------------- critic R3 defects (N-1 ... R-3)
        // A page's drawn geometry, measured in a frame the size of the printed page.
        const inFrame = (doc, fnSrc) => page.evaluate(async (doc, fnSrc) => {
            const fr = document.createElement('iframe');
            fr.style.cssText = 'position:absolute;left:-3000px;top:0;width:900px;height:1300px';
            document.body.appendChild(fr);
            fr.srcdoc = doc;
            await new Promise((ok) => { fr.onload = ok; });
            // the sheet's fonts loaded and laid out (a measure taken before Andika arrives is a
            // fallback face's geometry)
            for (let i = 0; i < 100 && fr.contentDocument.documentElement.getAttribute('data-ws-fonts') !== 'ready'; i++) await new Promise((ok) => setTimeout(ok, 50));
            await fr.contentDocument.fonts.ready;
            await new Promise((ok) => setTimeout(ok, 150));
            const out = (new Function('doc', 'win', fnSrc))(fr.contentDocument, fr.contentWindow);
            fr.remove();
            return out;
        }, doc, fnSrc);
        // N-1: every bracket on a Mix page is the Long form's drawing - its vinculum no longer than its
        // dividend's own tracks, the first dividend digit next to the bracket.
        const BRACKETS = `
            const out = [];
            for (const g of doc.querySelectorAll('[data-ws-ops="division"] [role="group"]')) {
                const kids = Array.from(g.children);
                const st = (x) => x.getAttribute('style') || '';
                const digits = kids.filter((x) => /grid-row:\\s*2\\b/.test(st(x)) && /border-top/.test(st(x)) && /^\\d$/.test(x.textContent.trim()));
                const arc = kids.find((x) => x.querySelector('svg'));
                const rule = kids.find((x) => /border-top:[^;]*solid (#000|rgb\\(0, 0, 0\\)|black)/.test(st(x)) && !x.textContent.trim()) ;
                if (!digits.length || !arc) continue;
                const rg = (el) => { const r = doc.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); };
                const first = rg(digits[0]);
                const tracks = digits.reduce((a, d) => a + d.getBoundingClientRect().width, 0);
                out.push({ n: digits.length, gap: (first.left - arc.getBoundingClientRect().right) / first.width,
                    // the bar runs from the arc's top stroke (15 % into its track) over the dividend tracks
                    over: rule ? rule.getBoundingClientRect().width - tracks - 0.85 * arc.getBoundingClientRect().width : 0 });
            }
            return out;`;
        for (const size of ['S', 'L']) {
            for (const role of ['independent', 'test', 'fact-rows', 'fact-probe', 'guided']) {
                const r = await evBuild(role, size, { divForm: 'mix' });
                const b = await inFrame(r.doc, BRACKETS);
                const worstGap = Math.max(...b.map((x) => x.gap)), worstOver = Math.max(...b.map((x) => x.over));
                check(b.length > 0 && worstGap <= 0.5 && worstOver <= 1, `N-1 mix ${role} ${size}: ${b.length} brackets drawn tight - bracket to first digit ${f2(worstGap)} digit (<= 0.5), vinculum past the dividend tracks ${f2(worstOver)} px (<= 1)`);
            }
            const lr = await evBuild('independent', size, { divForm: 'long' });
            const lb = await inFrame(lr.doc, BRACKETS);
            check(lb.length > 0 && Math.max(...lb.map((x) => x.gap)) <= 0.5, `N-1 long independent ${size}: the Long form's bracket the same tight drawing`);
        }
        // N-2: one across look on every page of the Standard lesson, and the line where the stand-alone
        // Independent page puts it (beside). N-3: the lesson sheet at S is full and holds at least L's.
        {
            const indepAt = {};
            for (const size of ['S', 'L']) {
                const r = await evBuild('lesson', size, { divForm: 'standard' });
                const pages = r.pupil.split(/class="ws-page\b/).slice(1);
                const looks = pages.map((pg) => ({ below: (pg.match(/class="ws-eq ws-eq-below"/g) || []).length, beside: (pg.match(/class="ws-eq" style="gap:0\.18em"/g) || []).length }));
                check(looks.every((l) => l.below === 0 || l.beside === 0), `N-2 standard lesson ${size}: one across look per page (${looks.map((l) => `${l.beside} beside / ${l.below} under`).join(', ')})`);
                const ind = await evBuild('independent', size, { divForm: 'standard' });
                const indBelow = /class="ws-eq ws-eq-below"/.test(ind.pupil);
                check(looks.slice(1).every((l) => (indBelow ? l.beside === 0 : l.below === 0)), `N-2 standard lesson ${size}: pages 2-3 put the line where the Independent page does (${indBelow ? 'under' : 'beside'})`);
                const m = /(\d+) independent/.exec(r.note) || [];
                indepAt[size] = Number(m[1]) || 0;
                const strip = (await inkScan(page, r.doc)).pages[1].strip;
                check(strip < 0.2, `N-3 standard lesson ${size} p2: page strip ${f2(strip)} < 0.20 (${indepAt[size]} Independent)`);
            }
            check(indepAt.S >= indepAt.L, `N-3 standard lesson: S holds at least L's Independent (${indepAt.S} >= ${indepAt.L})`);
        }
        // No lesson page of any form runs into its footer (the 18-21 Independent rows at S, N-3).
        for (const form of ['standard', 'long', 'fraction', 'vertical', 'mix']) for (const size of ['S', 'L']) {
            const r = await evBuild('lesson', size, { divForm: form });
            const ink = await inkScan(page, r.doc);
            const over = ink.pages.map((pg, i) => (pg.gridBottom !== null && pg.footTop !== null && pg.gridBottom > pg.footTop - 2 ? i + 1 : 0)).filter(Boolean);
            check(over.length === 0, `N-3 ${form} lesson ${size}: no page runs into its footer (${over.join(',') || 'none'})`);
        }
        // R-3: a lesson's warm-up band - one digit size, one answer place, labels clear of the ink.
        const WARM = `
            const band = Array.from(doc.querySelectorAll('.ws-band')).find((b) => /Warm-up:/.test(b.textContent));
            if (!band) return null;
            const cells = Array.from(band.querySelectorAll('.ws-cell')).filter((c) => !c.classList.contains('blankrun'));
            return cells.map((c) => {
                const eq = c.querySelector('.ws-eq');
                if (!eq) return null;
                const tw = doc.createTreeWalker(eq, NodeFilter.SHOW_TEXT);
                let first = null;
                for (let n = tw.nextNode(); n; n = tw.nextNode()) if (/\\d/.test(n.textContent)) { first = n; break; }
                if (!first) return null;
                const k = first.textContent.search(/\\d/);
                const r = doc.createRange(); r.setStart(first, k); r.setEnd(first, k + 1);
                const d = r.getBoundingClientRect();
                const slot = eq.querySelector('.ws-line, .ws-slot, [data-ws-slot]');
                const sr = slot ? slot.getBoundingClientRect() : null;
                const lab = c.querySelector('.ws-letter');
                const lr = lab ? lab.getBoundingClientRect() : null;
                return { fs: parseFloat(win.getComputedStyle(first.parentElement).fontSize), under: sr ? sr.top >= d.bottom - 0.1 * d.height : null,
                    clear: lr ? (d.left >= lr.right + 3.7 || d.top >= lr.bottom + 3.7) : true };
            }).filter(Boolean);`;
        // (the screen sections above left a div_facts form in the option store: a teacher's stored
        // form deals a warm-up in it. These pages are the evidence's, built with no stored option.)
        await page.evaluate(() => { try { window.clearSetOptions({ silent: true }); } catch (e) { /* none stored */ } });
        for (const [cat, sk] of [['division', 'div_remainders'], ['division', 'divide'], ['division', 'div_facts']]) for (const size of ['S', 'L']) {
            const r = await evBuild('lesson', size, {}, { skill: [cat, sk] });
            const w = await inFrame(r.doc, WARM);
            if (!w || !w.length) { check(true, `R-3 ${sk} lesson ${size}: no across warm-up band`); continue; }
            const fs = w.map((x) => x.fs);
            check(Math.max(...fs) - Math.min(...fs) <= 1.4 && new Set(w.map((x) => x.under)).size === 1 && w.every((x) => x.clear),
                `R-3 ${sk} lesson ${size} warm-up: one digit size (${[...new Set(fs.map((x) => Math.round(x)))].join('/')} px), one answer place (${[...new Set(w.map((x) => (x.under ? 'under' : 'beside')))].join('/')}), labels clear (${w.filter((x) => !x.clear).length} touch)`);
        }

        check(app.problems.filter((p) => p.type !== 'requestfailed').length === 0, `no console errors (${app.problems.map((p) => p.text).slice(0, 3).join(' | ')})`);
    } catch (e) {
        check(false, 'threw: ' + (e && e.stack || e));
    } finally {
        await app.close();
    }
    // Right answers score on the online worksheet and the quiz (and the card), each form: the same
    // round-trip ws-screen-answer.cjs runs for every redone skill, with the form as the skill option.
    const { execFileSync } = require('child_process');
    for (const form of [...FORMS, 'mix']) {
        let out = '';
        try {
            out = execFileSync(process.execPath, [require('path').join(__dirname, 'ws-screen-answer.cjs'), '--skills', 'division:div_facts', '--hosts', 'worksheet,quiz', '--opts', JSON.stringify({ divForm: form })], { encoding: 'utf8', timeout: 300000 });
        } catch (e) { out = String((e.stdout || '') + (e.stderr || e.message)); }
        const line = (out.match(/^division:div_facts.*$/m) || [''])[0].replace(/\s+/g, ' ');
        check(/worksheet ok/.test(line) && /quiz ok/.test(line) && /ws-screen-answer: OK/.test(out), `hosts ${form}: right answers score (${line})`);
    }
    console.log(fails ? `ws-div-facts-forms: FAIL (${fails})` : 'ws-div-facts-forms: OK');
    process.exit(fails ? 1 : 0);
})();
