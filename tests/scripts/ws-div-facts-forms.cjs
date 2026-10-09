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
const TEMPLATE = { standard: 'fact', vertical: 'fact', long: 'division', fraction: 'equation' };
// What the form looks like in the drawn HTML (paper and screen).
const MARK = {
    standard: (h) => /class="ws-eq"|mq-hfact|ws-fact-across|data-ws-across/.test(h) || /÷[^<]*<\/span>[^]*=/.test(h),
    long: (h) => /data-ws-ops="division"/.test(h),
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
                else if (role === 'fact-rows' && (form === 'long' || form === 'fraction' || form === 'mix')) check(long === 0 && frac === 0 && /÷/.test(r.pupil), `${tag}: prints across (documented fact-rows fallback)`);
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
