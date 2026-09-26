// Skill options travel with a skill set: share codes, links, play and print.  (owner, 2026-09-24)
//
//   node tests/scripts/ws-share-options.cjs            unit + end-to-end
//   node tests/scripts/ws-share-options.cjs --unit     codec / schema checks only
//   node tests/scripts/ws-share-options.cjs --shots    also write screenshots of the options UI
//
// UNIT (in the real app, so every table is the live one)
//   1. Every live skill has an option schema whose default is legal, and a normalised default.
//   2. OLD CODES DO NOT MOVE: every live skill's plain 2-char code, a weighted one, a 7-char
//      settings code and an MX- code without options decode exactly to the skill they always
//      named, with no options — and a set at its defaults writes exactly the old code.
//   3. Round trip: for every live skill and every offered option, a non-default value survives
//      encode -> decode, alone and all together, through the skill code, MX- and settings code.
//   4. The payload is URL-safe and never contains a character a parser splits on.
//   5. Forward compatibility: an unknown version or key is ignored, not misread.
//
// END TO END (the owner's case)
//   A teacher builds the set { mult_facts with Times 7 and 8 (written across), add_facts at its
//   defaults } through the share panel's Options UI, makes a Quick Start link and an MX- code.
//   Each is opened in a FRESH browser as a pupil, who answers 12 items; every multiplication item
//   must be x7 or x8. Then the teacher prints the set, and every printed x item must be too.
const fs = require('fs');
const path = require('path');
const { ROOT, open, waitFor, hideOverlays } = require('../lib/ws-harness.cjs');

const has = k => process.argv.includes('--' + k);
const SHOTS = has('shots');
const SHOT_DIR = path.join(ROOT, 'tests', 'compliance', 'shots', 'share-options');   // git-ignored
const failures = [];
const check = (ok, msg) => { if (!ok) failures.push(msg); };
const log = (...a) => console.log(...a);

async function unit(page) {
    const r = await page.evaluate(() => {
        const out = { fails: [], stats: { skills: 0, offered: 0, withOwn: 0, roundTrips: 0, byOption: {} } };
        const fail = (m) => { if (out.fails.length < 60) out.fails.push(m); };
        const W = window;
        const live = [];
        for (const [cat, list] of Object.entries(W.SKILLS)) {
            if (!Array.isArray(list)) continue;
            for (const s of list) if (!s.retired && s.v !== 'custom_mixed') live.push({ cat, id: s.v });
        }
        const SAFE = /^[A-Z0-9_]*$/;
        for (const { cat, id } of live) {
            out.stats.skills++;
            // 1. schema + default
            const defs = W.optionsFor(cat, id);
            if (!defs.length) fail(`${cat}:${id} has no option schema`);
            const dflt = {};
            for (const d of defs) {
                if (!['int', 'enum', 'bool', 'set'].includes(d.type)) fail(`${cat}:${id} option ${d.id} bad type ${d.type}`);
                if (!('default' in d)) fail(`${cat}:${id} option ${d.id} has no default`);
                dflt[d.id] = d.default;
            }
            const norm = W.normalizeOptions(cat, id, dflt);
            if (JSON.stringify(norm) !== JSON.stringify(dflt)) fail(`${cat}:${id} default is not a legal value: ${JSON.stringify(dflt)} -> ${JSON.stringify(norm)}`);
            if (Object.keys(W.packOptions(cat, id, {})).length) fail(`${cat}:${id} packs a non-empty default`);
            const offered = W.offeredOptionsFor(cat, id);
            if (offered.length) out.stats.offered++;
            for (const d of offered) out.stats.byOption[d.id] = (out.stats.byOption[d.id] || 0) + 1;

            // 2. old codes decode exactly as before
            const code = W.SKILL_CODES[`${cat}:${id}`];
            if (code) {
                const a = W.parseSkillCodeParts(code);
                if (a.length !== 1 || a[0].categoryId !== cat || a[0].skillId !== id || Object.keys(a[0].opts).length || a[0].weight !== 0) fail(`old code ${code} no longer decodes to ${cat}:${id}: ${JSON.stringify(a)}`);
                const b = W.parseSkillCodeParts(code + '5');
                if (b.length !== 1 || b[0].weight !== 5 || b[0].skillId !== id) fail(`weighted code ${code}5 changed: ${JSON.stringify(b)}`);
            }

            // 3. round trip every offered option
            const all = {};
            for (const d of offered) {
                let v;
                if (d.type === 'set') v = d.values.length > 1 ? [d.values[d.values.length - 1].v] : [];
                else if (d.type === 'bool') v = !d.default;
                else if (d.type === 'enum') v = d.values.map(x => x.v).find(x => JSON.stringify(x) !== JSON.stringify(d.default));
                else v = (d.min ?? 0) + 1;
                if (v === undefined) continue;
                const want = W.packOptions(cat, id, { [d.id]: v });
                if (!Object.keys(want).length) continue;
                all[d.id] = v;
                const pay = W.encodeOptionPayload(cat, id, want);
                if (!SAFE.test(pay)) fail(`${cat}:${id} ${d.id} payload not URL-safe: ${pay}`);
                const back = W.decodeOptionPayload(cat, id, pay);
                if (JSON.stringify(back) !== JSON.stringify(want)) fail(`${cat}:${id} ${d.id}: ${JSON.stringify(want)} -> "${pay}" -> ${JSON.stringify(back)}`);
                out.stats.roundTrips++;
            }
            if (Object.keys(all).length > 1) {
                const want = W.packOptions(cat, id, all);
                const pay = W.encodeOptionPayload(cat, id, want);
                const back = W.decodeOptionPayload(cat, id, '~' + pay.toLowerCase());   // codes are upper-cased by every parser; accept either
                if (JSON.stringify(back) !== JSON.stringify(want)) fail(`${cat}:${id} combined: ${JSON.stringify(want)} -> "${pay}" -> ${JSON.stringify(back)}`);
                if (code) {
                    const c = W.parseSkillCodeParts(code + '3~' + pay);
                    if (c.length !== 1 || c[0].weight !== 3 || JSON.stringify(c[0].opts) !== JSON.stringify(want)) fail(`${cat}:${id} skill code with options: ${JSON.stringify(c)}`);
                }
            }
        }

        // 2b. a set at its defaults writes exactly the old code; with options, only the suffix differs
        W.clearSetOptions();
        W.UnifiedSkills.clear();
        W.UnifiedSkills.add({ categoryId: 'multiplication', skillId: 'mult_facts', skillLabel: 'x' });
        W.UnifiedSkills.add({ categoryId: 'addition', skillId: 'add_facts', skillLabel: '+' });
        const plain = W.generateSkillCode();
        if (plain !== `${W.SKILL_CODES['multiplication:mult_facts']}-${W.SKILL_CODES['addition:add_facts']}`) fail(`a default set wrote ${plain}, not the old code`);
        W.setSetOptions('multiplication', 'mult_facts', { constant: [7, 8] });
        const withOpts = W.generateSkillCode();
        if (withOpts !== `${W.SKILL_CODES['multiplication:mult_facts']}~C78-${W.SKILL_CODES['addition:add_facts']}`) fail(`options set wrote ${withOpts}`);
        out.codes = { plain, withOpts };

        // 2c. MX- : an old code (no options, 5 settings chars) decodes as before
        const mxOld = 'MX-T00.A00-40MSP';
        const s1 = W.parseMixedCodeForPlay(mxOld);
        if (JSON.stringify(s1.selectedSkills) !== JSON.stringify({ multiplication: ['mult_facts'], addition: ['add_facts'] })
            || s1.range !== 100 || s1.mode !== 'practice' || Object.keys(s1.skillOptions).length || s1.totalProblemsEnabled !== undefined) fail(`old MX code changed: ${JSON.stringify(s1)}`);
        const mx = W.buildMixedCode({ skills: [{ categoryId: 'multiplication', skillId: 'mult_facts', opts: { constant: [7, 8] } }, { categoryId: 'addition', skillId: 'add_facts', opts: {} }], range: 100, decimals: 0, timer: 'S', mode: 'practice', totalProblems: 12 }).code;
        if (mx !== 'MX-T00~C78.A00-40MSP1200') fail(`buildMixedCode wrote ${mx}`);
        const s2 = W.parseMixedCodeForPlay(mx);
        if (JSON.stringify(s2.skillOptions) !== JSON.stringify({ 'multiplication:mult_facts': { constant: [7, 8] } }) || s2.totalProblems !== 12) fail(`MX round trip: ${JSON.stringify(s2)}`);
        out.codes.mx = mx;

        // 2d. 7-char settings code: old decodes unchanged, options ride after it
        const single = W.parseSingleSkillCodeForPlay('T00403M');
        if (JSON.stringify(single.selectedSkills) !== JSON.stringify({ multiplication: ['mult_facts'] }) || Object.keys(single.skillOptions).length) fail(`old settings code changed: ${JSON.stringify(single)}`);
        const single2 = W.parseSingleSkillCodeForPlay('T00403M~C78');
        if (JSON.stringify(single2.skillOptions) !== JSON.stringify({ 'multiplication:mult_facts': { constant: [7, 8] } })) fail(`settings code with options: ${JSON.stringify(single2)}`);
        const sel = document.getElementById('categorySelect');
        if (sel) {
            document.getElementById('domainSelect').value = 'number_operations';
            W.updateCategoryOptions(); sel.value = 'multiplication'; W.updateSkillOptions();
            document.getElementById('skillSelect').value = 'mult_facts';
            const sc = W.generateSettingsCode();
            if (!/^T00.{4}~C78$/.test(sc || '')) fail(`generateSettingsCode wrote ${sc}`);
            out.codes.settings = sc;
        }

        // 5. forward compatibility
        if (Object.keys(W.decodeOptionPayload('multiplication', 'mult_facts', '2C78')).length) fail('an unknown payload version was not ignored');
        if (JSON.stringify(W.decodeOptionPayload('multiplication', 'mult_facts', 'Q9_C78')) !== JSON.stringify({ constant: [7, 8] })) fail('an unknown key was not skipped');
        if (!W.isSkillCodeWithOptions('EA~C78-AY') || W.isSkillCodeWithOptions('MX-T00~C78-40MSP') || W.isSkillCodeWithOptions('EA-AY')) fail('isSkillCodeWithOptions misroutes');

        // Generation honours the set store in plain generateQuestion()
        W.state.adaptiveModeEnabled = false;
        const saved = { c: W.state.category, s: W.state.skill, o: W.state.skillOptions };
        W.state.category = 'multiplication'; W.state.skill = 'mult_facts'; W.state.skillOptions = undefined;
        for (let i = 0; i < 40; i++) {
            const q = W.generateQuestion();
            const m = String(q.text).match(/(\d+)\s*×\s*(\d+)/);
            if (!m || !(['7', '8'].includes(m[1]) || ['7', '8'].includes(m[2]))) { fail(`plain generateQuestion ignored the set: ${q.text}`); break; }
        }
        // ...and so does the online worksheet's path: generateQuestionFor with no opts, through a
        // custom_mixed pool, the way worksheet.js _wsGenerate calls it.
        const savedMixed = W.state.mixedModeSettings;
        W.state.mixedModeSettings = { selectedSkills: { multiplication: ['mult_facts'] } };
        for (let i = 0; i < 24; i++) {
            const q = W.generateQuestionFor({ category: 'all_mixed', skill: 'custom_mixed', opts: W.state.skillOptions, seed: 500 + i, itemIndex: i, gameMode: 'worksheet' });
            const m = String(q && q.text).match(/(\d+)\s*×\s*(\d+)/);
            if (!m || !(['7', '8'].includes(m[1]) || ['7', '8'].includes(m[2]))) { fail(`worksheet path ignored the set: ${q && q.text}`); break; }
        }
        W.state.mixedModeSettings = savedMixed;
        W.state.category = saved.c; W.state.skill = saved.s; W.state.skillOptions = saved.o;
        W.UnifiedSkills.clear();
        return out;
    });
    r.fails.forEach(f => check(false, f));
    log(`unit: ${r.stats.skills} live skills, ${r.stats.offered} offer at least one option, ${r.stats.roundTrips} option round trips; offered by option: ${JSON.stringify(r.stats.byOption)}`);
    log(`unit: codes ${JSON.stringify(r.codes)}`);
    return r;
}

// ---------------------------------------------------------------------------------------------
// End to end
// ---------------------------------------------------------------------------------------------
const MULT_OK = (text) => {
    const m = String(text).replace(/<[^>]+>/g, ' ').match(/(\d+)\s*[×x*]\s*(\d+)/);
    return m ? (['7', '8'].includes(m[1]) || ['7', '8'].includes(m[2])) : null;
};

async function buildSetAsTeacher(page) {
    // Teacher mode opens the teacher view (teacher-shell.js); its Sets screen is where a set is
    // built, and its Options button opens the shared editor (window.openSkillOptionsPanel).
    await page.evaluate(() => {
        if (!document.body.classList.contains('teacher-mode') && window.toggleUserRole) window.toggleUserRole();
        window.UnifiedSkills.clear();
        window.UnifiedSkills.add({ domainId: 'number_operations', categoryId: 'multiplication', skillId: 'mult_facts', skillLabel: '✖️ Multiplication Facts (1-12)', categoryIcon: '✖️', categoryName: 'Multiplication', domainColor: '#8b5cf6' });
        window.UnifiedSkills.add({ domainId: 'number_operations', categoryId: 'addition', skillId: 'add_facts', skillLabel: '➕ Addition Facts', categoryIcon: '➕', categoryName: 'Addition', domainColor: '#8b5cf6' });
        window.UnifiedSkills._syncAllImmediate();
        window.tvGo('sets');
    });
    const BTN = '.tv-opt-btn[data-key="multiplication|mult_facts"]';
    await waitFor(page, () => !!document.querySelector('.tv-opt-btn[data-key="multiplication|mult_facts"]'), 10000, 'teacher Sets screen Options button');
    await page.click(BTN);
    await waitFor(page, () => !!document.getElementById('skillOptionsPopover'), 5000, 'options popover');
    const clickSet = async (label, text) => page.evaluate(({ label, text }) => {
        const panel = document.getElementById('skillOptionsPopover');
        const block = [...panel.querySelectorAll(':scope > div')].find(el => el.textContent.includes(label) && el.querySelector('input'));
        if (text === 'None' || text === 'All') {
            [...block.querySelectorAll('button')].find(x => x.textContent.trim() === text).click();
            return true;
        }
        const row = [...block.querySelectorAll('label')].find(l => l.querySelector('span') && l.querySelector('span').textContent.trim().startsWith(text));
        row.querySelector('input').click();
        return true;
    }, { label, text });
    await clickSet('Times', 'None');
    await clickSet('Times', '7');
    await clickSet('Times', '8');
    await clickSet('How it is written', 'Across');
    await clickSet('How it is written', 'Stacked');
    return page.evaluate(() => {
        const item = [...document.querySelectorAll('.tv-set-item')].find(el => /Multiplication/.test(el.textContent));
        return item ? item.querySelector('.tv-skill-meta').textContent : '';
    }).then(summary => {
        check(/Times: 7, 8/.test(summary), `teacher Sets screen summary should read "Times: 7, 8…", got "${summary}"`);
        return summary;
    });
}

async function answerTwelve(page, label) {
    const seen = [];
    for (let i = 0; i < 12; i++) {
        await waitFor(page, () => window.state.currentQ && document.getElementById('answerInput'), 10000, `${label} item ${i + 1}`);
        const q = await page.evaluate(() => ({ text: String(window.state.currentQ.text || ''), ans: window.state.currentQ.ans, skillId: window.state.currentQ.skillId, n: window.state.qCount }));
        seen.push(q);
        await page.evaluate((ans) => {
            const inp = document.getElementById('answerInput');
            inp.value = String(ans);
            window.submitAnswer();
        }, q.ans);
        // Advance: wait for a new question; nudge with nextQuestion() if the mode waits for a click.
        const moved = await page.waitForFunction((n) => window.state.qCount !== n, { timeout: 4000 }, q.n).then(() => true).catch(() => false);
        if (!moved) await page.evaluate(() => { if (typeof window.nextQuestion === 'function') window.nextQuestion(); });
    }
    const mult = seen.filter(q => /×/.test(q.text));
    const bad = mult.filter(q => !MULT_OK(q.text));
    check(mult.length > 0, `${label}: no multiplication item in 12 — the set did not deal mult_facts`);
    check(bad.length === 0, `${label}: ${bad.length} x-items not x7/x8: ${bad.map(q => q.text).join(' | ')}`);
    check(seen.every(q => /[+×]/.test(q.text)), `${label}: an item outside the set: ${seen.map(q => q.text).join(' | ')}`);
    log(`${label}: 12 answered — ${mult.length} x items (${mult.map(q => q.text.replace(/\s+/g, ' ').replace(' = ?', '')).join(', ')}), ${seen.length - mult.length} + items`);
}

async function e2e() {
    // ---- teacher builds the set and the two share forms ----
    const teacher = await open({ viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    const tp = teacher.page;
    await tp.evaluate(() => { window.state.adaptiveModeEnabled = false; });
    await buildSetAsTeacher(tp);
    if (SHOTS) {
        fs.mkdirSync(SHOT_DIR, { recursive: true });
        await tp.screenshot({ path: path.join(SHOT_DIR, 'teacher-sets-options-1280.png') });
        await tp.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
        await tp.evaluate(() => { window.closeSkillOptionsPanel(); window.tvGo('sets'); });
        await new Promise(r => setTimeout(r, 300));
        await tp.click('.tv-opt-btn[data-key="multiplication|mult_facts"]');
        await new Promise(r => setTimeout(r, 400));
        await tp.screenshot({ path: path.join(SHOT_DIR, 'teacher-sets-options-390.png') });
        await tp.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    }
    await tp.evaluate(() => window.closeSkillOptionsPanel());
    // The links come from the teacher Send screen itself: pick the link type, press Create link,
    // read the link it shows.
    const sendLink = async (type) => {
        await tp.click(`#tvSendPanel [data-act="type"][data-type="${type}"]`);
        await tp.click('#tvSendPanel [data-act="create"]');
        await waitFor(tp, () => !!document.querySelector('#tvSendPanel .tv-result .tv-code-block'), 5000, 'Send screen result');
        return tp.evaluate(() => {
            const blocks = document.querySelectorAll('#tvSendPanel .tv-result .tv-code-block');
            const cap = [...document.querySelectorAll('#tvSendPanel .tv-result .tv-cap')].map(e => e.textContent).join(' ');
            return { link: blocks[0].textContent.trim(), code: blocks[1].textContent.trim(), cap };
        });
    };
    const qsOut = await sendLink('qs');
    const directOut = await sendLink('direct');
    const qsLink = qsOut.link, directLink = directOut.link;
    check(/and options/.test(qsOut.cap), `Send screen does not say the code carries options: "${qsOut.cap}"`);
    check(/~C78_NA/.test(qsOut.code) && /~C78_NA/.test(directOut.code), `Send screen codes lack the options: ${qsOut.code} / ${directOut.code}`);
    // The same set through the three generators the Send screen and the legacy share panel use.
    const gens = await tp.evaluate(() => ({ enhanced: window.generateEnhancedSkillCode(), plain: window.generateSkillCode() }));
    check(/~C78_NA/.test(gens.enhanced) && /~C78_NA/.test(gens.plain), `skill code generators drop the options: ${JSON.stringify(gens)}`);
    log(`teacher: skill codes ${JSON.stringify(gens)}`);
    if (SHOTS) await tp.screenshot({ path: path.join(SHOT_DIR, 'teacher-send-link-1280.png') });

    // ---- the teacher Print screen: buildSheet is handed the set's options ----
    const sheet = await tp.evaluate(async () => {
        window.tvGo('print');
        await new Promise(r => setTimeout(r, 200));
        // The request shape teacher-print.js builds (requestFor): skills[].opts from the set.
        const skills = window.UnifiedSkills.skills.map(s => ({ categoryId: s.categoryId, skillId: s.skillId, opts: s.opts || {} }));
        const res = await window.buildSheet({ role: 'more-practice', sections: [{ skills, columns: 'auto' }], letters: ['A', 'B'], size: 'standard', paper: 'A4', key: true, seed: 4242 });
        const div = document.createElement('div');
        div.innerHTML = res.pupilHtml;
        // The item labels are the Daily look's number tabs (PT-LOOK-1): a tab "1" beside "7 × 1"
        // would read "17 × 1", so the labels come out before the text is read.
        div.querySelectorAll('[data-ws-label]').forEach((l) => l.remove());
        const txt = div.textContent.replace(/\s+/g, ' ');
        return { pages: res.pageCount, items: txt.match(/\d+\s*×\s*\d+/g) || [], optsSent: skills.map(s => s.skillId + ':' + JSON.stringify(s.opts)) };
    });
    const badSheet = sheet.items.filter(t => !MULT_OK(t));
    check(sheet.items.length >= 3, `buildSheet: expected several x items, found ${sheet.items.length} (${sheet.optsSent.join(' ')})`);
    check(badSheet.length === 0, `buildSheet: ${badSheet.length} x items not x7/x8: ${badSheet.join(' | ')}`);
    log(`buildSheet (teacher Print): ${sheet.pages} pages, ${sheet.items.length} x items — ${sheet.items.join(', ')}`);
    // A row reset to its defaults on the Print screen prints the defaults, not the set's options.
    const resetRow = await tp.evaluate(async () => {
        const res = await window.buildSheet({ role: 'more-practice', sections: [{ skills: [{ categoryId: 'multiplication', skillId: 'mult_facts', opts: {} }], columns: 'auto' }], letters: ['A', 'B'], size: 'standard', paper: 'A4', key: false, seed: 4243 });
        const div = document.createElement('div');
        div.innerHTML = res.pupilHtml;
        // The item labels are the Daily look's number tabs (PT-LOOK-1): a tab "1" beside "7 × 1"
        // would read "17 × 1", so the labels come out before the text is read.
        div.querySelectorAll('[data-ws-label]').forEach((l) => l.remove());
        return div.textContent.replace(/\s+/g, ' ').match(/\d+\s*×\s*\d+/g) || [];
    });
    check(resetRow.some(t => MULT_OK(t) === false), `buildSheet with explicit default options still drilled only x7/x8: ${resetRow.join(', ')}`);
    await tp.evaluate(() => window.tvGo('sets'));
    check(/[?&]qs=[^&]*~C78_NA/.test(decodeURIComponent(qsLink)), `Quick Start link lacks the options: ${qsLink}`);
    check(/~C78_NA/.test(decodeURIComponent(directLink)), `Direct link lacks the options: ${directLink}`);
    log(`teacher: Quick Start link ${decodeURIComponent(qsLink)}`);
    log(`teacher: Direct link      ${decodeURIComponent(directLink)}`);

    // MX- code from the Mixed Settings dialog (the teacher fixes the mode and 12 problems).
    const mx = await tp.evaluate(() => {
        window.openMixedSettings();
        window.setModeChoice('teacher');
        document.getElementById('mixedModeSelect').value = 'practice';
        window.setTimeChoice('teacher');
        document.getElementById('mixedTimerSelect').value = '0';
        const t = document.getElementById('mixedTotalProblemsToggle'); t.checked = true; window.toggleTotalProblems();
        document.getElementById('mixedTotalProblemsInput').value = '12';
        window.updateMixedCode();
        return document.getElementById('mixedCodeDisplay').textContent;
    });
    check(/^MX-T00~C78_NA\.A00-/.test(mx), `Mixed Settings code: ${mx}`);
    log(`teacher: MX- code ${mx}`);
    if (SHOTS) {
        await tp.evaluate(() => { const b = document.querySelector('#mixedSkillsList .sko-gear'); if (b) b.click(); });
        await new Promise(r => setTimeout(r, 300));
        await tp.screenshot({ path: path.join(SHOT_DIR, 'mixed-settings-1280.png') });
        for (const [w, h] of [[390, 844]]) {
            await tp.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
            await new Promise(r => setTimeout(r, 300));
            await tp.screenshot({ path: path.join(SHOT_DIR, `mixed-settings-${w}.png`) });
            await tp.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
        }
    }
    await tp.evaluate(() => { const m = document.getElementById('mixedSettingsModal'); if (m) m.style.display = 'none'; });

    // ---- print the mixed set from the teacher view: the classic dialog is retired there, so
    // Print opens the Print worksheets screen, with the set's options on its skills ----
    await tp.evaluate(() => { window.printSections = []; window.printFromQueue(); });
    await waitFor(tp, () => !!document.querySelector('#teacherMain [data-screen="print"].is-active'), 10000, 'Print screen');
    await waitFor(tp, () => { try { return document.getElementById('tvPreviewFrame').contentDocument.querySelectorAll('.ws-cell').length > 0; } catch (e) { return false; } }, 30000, 'Print screen preview');
    const screenPrinted = await tp.evaluate(() => {
        const d = document.getElementById('tvPreviewFrame').contentDocument;
        return (d.body.innerText.replace(/\s+/g, ' ').match(/\d+\s*×\s*\d+/g) || []);
    });
    const summaries = await tp.evaluate(() => [...document.querySelectorAll('#teacherMain [data-screen="print"] .tv-set-item')].map(e => e.textContent.replace(/\s+/g, ' ').trim()));
    check(summaries.some(t => /Multiplication Facts/.test(t) && /7/.test(t) && /8/.test(t)), `Print screen: the set's x7/x8 options are not on the skill: ${JSON.stringify(summaries)}`);
    check(screenPrinted.filter(t => !MULT_OK(t)).length === 0, `Print screen: printed x items not x7/x8: ${screenPrinted.join(' | ')}`);
    log(`Print screen: ${screenPrinted.length} x items on the page — ${screenPrinted.join(', ')}`);

    // ---- the classic dialog (still the pupil-side path) is seeded the same way: every printed
    // x item is x7 or x8 ----
    await tp.evaluate(() => { const go = window.tvOpenPrintWith; window.tvOpenPrintWith = undefined; try { window.printFromQueue(); } finally { window.tvOpenPrintWith = go; } });
    await waitFor(tp, () => Array.isArray(window.printSections) && window.printSections.length > 0, 10000, 'print dialog');
    const seeded = await tp.evaluate(() => window.printSections.flatMap(s => s.skills).map(s => ({ id: s.skillId, opts: s.opts || {} })));
    const multSeed = seeded.find(s => s.id === 'mult_facts');
    check(multSeed && JSON.stringify(multSeed.opts.constant) === '[7,8]', `print dialog was not seeded with the set's options: ${JSON.stringify(seeded)}`);
    if (SHOTS) {
        await tp.evaluate(() => { const b = document.querySelector('.ps-skill-options-btn'); if (b) b.click(); });
        await new Promise(r => setTimeout(r, 300));
        await tp.screenshot({ path: path.join(SHOT_DIR, 'print-dialog-1280.png') });
    }
    await tp.evaluate(async () => {
        const secs = window.printSections.map(s => ({ ...s, problemCount: 24, countMode: 'problems', groupByType: false }));
        await window.generateWorksheetFromSections(secs, 1, 'Options test', 'color', true, false, true);
    });
    await waitFor(tp, () => { const el = document.getElementById('printPreviewContent'); return el && el.innerHTML.length > 500 && !/Generating worksheet/.test(el.innerHTML); }, 30000, 'print preview');
    const printed = await tp.evaluate(() => {
        const el = document.getElementById('printPreviewContent');
        const key = el.querySelector('.answer-key-section');
        if (key) key.remove();
        const txt = el.innerText.replace(/\s+/g, ' ');
        return (txt.match(/\d+\s*×\s*\d+/g) || []);
    });
    const badPrint = printed.filter(t => !MULT_OK(t));
    check(printed.length >= 3, `print: expected several x items on paper, found ${printed.length}`);
    check(badPrint.length === 0, `print: ${badPrint.length} printed x items not x7/x8: ${badPrint.join(' | ')}`);
    log(`print: ${printed.length} x items on paper — ${printed.join(', ')}`);
    await hideOverlays(tp);
    teacher.problems.filter(p => p.type === 'pageerror').forEach(p => check(false, `teacher page error: ${p.text}`));
    await teacher.close();

    // ---- pupil 1: the Quick Start link, fresh browser ----
    const qsPath = '/index.html' + qsLink.slice(qsLink.indexOf('?'));
    const p1 = await open({ pagePath: qsPath, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    await p1.page.evaluate(() => { window.state.adaptiveModeEnabled = false; });
    await waitFor(p1.page, () => (window.customQuickSkills || []).some(c => c.skillId === 'mult_facts' && c.opts), 10000, 'Quick Start card with options');
    // The pupil taps the two cards, then Practice.
    await p1.page.evaluate(() => {
        for (const id of ['mult_facts', 'add_facts']) {
            const c = window.customQuickSkills.find(x => x.skillId === id);
            window.addQuickSkill(c.categoryId, c.skillId, c.skillLabel, c.categoryIcon, c.categoryName);
        }
    });
    await waitFor(p1.page, () => window.skillQueue.length === 2, 5000, 'pupil set');
    const cardText = await p1.page.evaluate(() => [...document.querySelectorAll('.quick-skill-card')].map(c => c.innerText.replace(/\s+/g, ' ')).find(t => /Times/.test(t)) || '');
    check(/Times: 7, 8/.test(cardText), `Quick Start card should show "Times: 7, 8", got "${cardText}"`);
    if (SHOTS) {
        await p1.page.setViewport({ width: 390, height: 844, deviceScaleFactor: 1 });
        await new Promise(r => setTimeout(r, 400));
        const g = await p1.page.$('#quickSkillsGrid');
        if (g) await g.screenshot({ path: path.join(SHOT_DIR, 'pupil-quickstart-cards-390.png') });
        await p1.page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
    }
    await p1.page.evaluate(() => { window.state.problemCount = 50; window.playSelectedSkills('practice'); });
    await answerTwelve(p1.page, 'pupil via Quick Start link');
    p1.problems.filter(p => p.type === 'pageerror').forEach(p => check(false, `pupil(QS) page error: ${p.text}`));
    await p1.close();

    // ---- pupil 2: the MX- code as a link, fresh browser ----
    const p2 = await open({ pagePath: '/index.html?c=' + mx, viewport: { width: 1280, height: 900, deviceScaleFactor: 1 } });
    await p2.page.evaluate(() => { window.state.adaptiveModeEnabled = false; });
    await answerTwelve(p2.page, 'pupil via MX- code');
    const mxState = await p2.page.evaluate(() => ({ store: window.state.skillOptionsBySkill, goal: window.state.mixedModeSettings && window.state.mixedModeSettings.totalProblems }));
    check(mxState.goal === 12, `MX- code's problem goal not applied: ${JSON.stringify(mxState)}`);
    p2.problems.filter(p => p.type === 'pageerror').forEach(p => check(false, `pupil(MX) page error: ${p.text}`));
    await p2.close();

    // ---- pupil 3: the Direct Play link through the landing modal ----
    const dPath = '/index.html' + directLink.slice(directLink.indexOf('?'));
    const p3 = await open({ pagePath: dPath, viewport: { width: 390, height: 844, deviceScaleFactor: 1 } });
    await p3.page.evaluate(() => { window.state.adaptiveModeEnabled = false; });
    await waitFor(p3.page, () => typeof window.startFromLanding === 'function' && document.getElementById('studentLandingOverlay'), 10000, 'landing modal');
    await p3.page.evaluate(() => {
        const m = document.getElementById('landingMode'); if (m) m.value = 'practice';
        const c = document.getElementById('landingCount'); if (c) c.value = '20';
        window.startFromLanding();
    });
    await answerTwelve(p3.page, 'pupil via Direct link');
    p3.problems.filter(p => p.type === 'pageerror').forEach(p => check(false, `pupil(direct) page error: ${p.text}`));
    await p3.close();
}

(async () => {
    const app = await open();
    await unit(app.page);
    app.problems.filter(p => p.type === 'pageerror').forEach(p => check(false, `page error: ${p.text}`));
    await app.close();
    if (!has('unit')) await e2e();
    if (failures.length) {
        console.error(`ws-share-options: FAIL (${failures.length})`);
        failures.slice(0, 50).forEach(f => console.error('  - ' + f));
        process.exit(1);
    }
    console.log('ws-share-options: OK');
})().catch(e => { console.error(e); process.exit(1); });
