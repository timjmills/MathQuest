// ws-my-worksheets — the My Worksheets checks (signed card design/my-worksheets/CARD.md §8), in a real browser.
//
//   node tests/scripts/ws-my-worksheets.cjs                         # every check, widths 1280,1366,1024,820
//   node tests/scripts/ws-my-worksheets.cjs --widths 1280,820       # TOUCH / WIDTH at these widths only
//   node tests/scripts/ws-my-worksheets.cjs --only SAVE-REPRODUCE,SHEET-CODE
//   node tests/scripts/ws-my-worksheets.cjs --shots /tmp/mws        # screenshots: library, Save dialog, ⋯ menu, Open interactive
//
// Checks (each prints "<ID>: OK" or "<ID>: FAIL n" with its findings):
//   SAVE-REPRODUCE     12 sheets (teacher Print: independent, lesson ×2, Mixed Review, fact rows, more practice, test, M and L;
//                      simple print ×3; the interactive player), each saved through its host's Save, then reprinted from the
//                      stored record: pupil and key HTML byte-identical to the print made before saving. New mix: other items,
//                      the same settings.
//   LIBRARY-ROUNDTRIP  Export → clear → Import gives the same records (deep equal, thumbnails included); Import twice adds
//                      nothing; a version-0 record (no v, size S, unpacked options) loads; Import through the screen's button.
//   SHEET-CODE         every saved sheet's ?sheet= code decodes to its request and prints the same HTML; opened as a teacher
//                      it offers Save and Print; opened as a pupil it plays the page-1 items.
//   INTERACTIVE-SAME   the card's Play (Open interactive) deals page 1's items, in order (text and answer), for 3 hosts.
//   ORGANISE           rename, move, tag, duplicate, delete + Undo, search, both sorts, the default unit folder; all survive
//                      a reload.
//   NO-LOSS            a seeded version-1 database (tests / results) and My sets are unchanged after the upgrade and a save.
//   TOUCH-WIDTH        every control of the screen, the ⋯ menu and the Save dialog ≥ 48 px and hit by a real tap / click at
//                      its centre; no sideways scroll; at 1280 × 1000, 1366 × 768 (mouse), 1024 × 768, 820 × 1180 (touch).
// Prints `ws-my-worksheets: OK` / `ws-my-worksheets: FAIL (n)`; exits 1 on FAIL.
const fs = require('fs');
const os = require('os');
const path = require('path');
const { open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (f, d) => { const i = argv.indexOf(f); return i >= 0 && i + 1 < argv.length ? argv[i + 1] : d; };
const ALL = ['SAVE-REPRODUCE', 'LIBRARY-ROUNDTRIP', 'SHEET-CODE', 'INTERACTIVE-SAME', 'ORGANISE', 'NO-LOSS', 'TOUCH-WIDTH'];
const ONLY = arg('--only', '') ? arg('--only', '').split(',').map((s) => s.trim().toUpperCase().replace(/^TOUCH\/WIDTH$|^TOUCH$/, 'TOUCH-WIDTH')) : ALL;
const WIDTHS = String(arg('--widths', '1280,1366,1024,820')).split(',').map(Number).filter(Boolean);
const SIZE = { 1280: [1280, 1000, false], 1366: [1366, 768, false], 1024: [1024, 768, true], 820: [820, 1180, true] };
const SHOTS = arg('--shots', '');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = {};
const finding = (id, msg) => { (results[id] = results[id] || []).push(msg); };
const want = (id) => ONLY.includes(id);

// The sheets every check uses (card §8: across hosts and page types, M and L)
const ADD = { categoryId: 'addition', skillId: 'add_within_20' };
const CASES = [
    { id: 'tp-independent-M', host: 'tp', ui: { size: 'M', sections: [{ role: 'independent', skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: {} }] }] } },
    { id: 'tp-independent-L', host: 'tp', ui: { size: 'L', sections: [{ role: 'independent', skills: [{ categoryId: 'subtraction', skillId: 'sub_facts', opts: {} }] }] } },
    { id: 'tp-lesson-M', host: 'tp', ui: { size: 'M', sections: [{ role: 'lesson', mixed: true, skills: [{ categoryId: 'number_sense', skillId: 'nearest_10', opts: {} }] }] } },
    { id: 'tp-lesson-L', host: 'tp', ui: { size: 'L', sections: [{ role: 'lesson', mixed: true, skills: [{ categoryId: 'addition', skillId: 'add_wp_10', opts: {} }] }] } },
    { id: 'tp-mixed-review', host: 'tp', ui: { size: 'M', sections: [{ role: 'mixed-practice', skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: {} }, { categoryId: 'multiplication', skillId: 'mult_facts', opts: {} }, { categoryId: 'placevalue', skillId: 'identify', opts: {} }] }] } },
    { id: 'tp-fact-rows', host: 'tp', ui: { size: 'M', sections: [{ role: 'fact-rows', skills: [{ categoryId: 'multiplication', skillId: 'mult_facts', opts: {} }] }] } },
    { id: 'tp-more-practice-L', host: 'tp', ui: { size: 'L', sections: [{ role: 'more-practice', letters: ['A', 'B'], skills: [{ categoryId: 'division', skillId: 'div_facts', opts: {} }] }] } },
    { id: 'tp-test-two-sections', host: 'tp', ui: { size: 'M', sections: [{ role: 'test', skills: [{ categoryId: 'placevalue', skillId: 'identify', opts: {} }] }, { role: 'independent', skills: [ADD] }] } },
    { id: 'sp-sections-M', host: 'sp', skills: [{ categoryId: 'addition', skillId: 'add_facts' }, { categoryId: 'subtraction', skillId: 'sub_facts' }], size: 'M' },
    { id: 'sp-facts-L', host: 'sp', skills: [{ categoryId: 'multiplication', skillId: 'mult_facts' }], size: 'L', pages: true },
    { id: 'sp-one-L', host: 'sp', skills: [{ categoryId: 'placevalue', skillId: 'identify' }], size: 'L' },
    { id: 'player', host: 'pl', skills: [{ categoryId: 'addition', skillId: 'add_facts' }] },
];

(async () => {
    const t0 = Date.now();
    const app = await open({ seed: 7, viewport: { width: 1280, height: 1000, deviceScaleFactor: 1 }, lock: 'ws-my-worksheets', protocolTimeout: 600000 });
    const { page, browser, base, problems } = app;
    page.setDefaultTimeout(120000);
    const shot = async (name) => { if (!SHOTS) return; fs.mkdirSync(SHOTS, { recursive: true }); await page.screenshot({ path: path.join(SHOTS, `${name}.png`) }); };
    const ready = async () => { for (let i = 0; i < 120 && !(await page.evaluate(() => typeof window.tvGo === 'function' && typeof window.setUserRole === 'function' && !!window.tvGo && !window.tvGo.__mqStub).catch(() => false)); i++) await sleep(250); };
    const visit = async (url, teacher = true) => {
        await page.goto(base + url, { waitUntil: 'networkidle0', timeout: 90000 });
        await ready();
        if (teacher) { await page.evaluate(() => window.setUserRole('teacher')); await sleep(300); }
    };
    // the modules, through the page's own import map (the same instances the app uses)
    const L = (fn, ...a) => page.evaluate(async (src, args) => {
        const L = await import('/js/modules/sheet-library.js');
        // eslint-disable-next-line no-new-func
        return new Function('L', 'args', `return (${src})(L, ...args);`)(L, args);
    }, fn.toString(), a);
    const libReady = async () => page.evaluate(async () => { try { await import('/js/modules/sheet-library.js'); return true; } catch (e) { return String(e.message || e); } });
    const go = async (key) => { await page.evaluate((k) => window.tvGo(k), key); await sleep(500); };
    const onSheets = async () => { for (let i = 0; i < 40; i++) { if (await page.evaluate(() => !!document.querySelector('#teacherMain .tv-screen.is-active[data-screen="sheets"] .mws-grid, #teacherMain .tv-screen.is-active[data-screen="sheets"] .mws-empty'))) return true; await sleep(250); } return false; };
    const click = async (sel, touch = false) => {
        const el = await page.$(sel);
        if (!el) throw new Error(`no ${sel}`);
        await el.evaluate((n) => n.scrollIntoView({ block: 'center', inline: 'nearest' }));
        await sleep(80);
        const b = await el.boundingBox();
        if (!b) throw new Error(`${sel} has no box`);
        if (touch) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
        else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2);
        await sleep(250);
    };

    let saved = [];   // [{case, id, before: {pupilHtml, keyHtml}}]
    try {
        await visit('/index.html');
        const lr = await libReady();
        if (lr !== true) {
            for (const id of ONLY) finding(id, `the sheet library does not load: ${String(lr).slice(0, 160)}`);
            throw new Error('no library');
        }

        /* ---------------------------------------------------------------- NO-LOSS (first: it seeds the old database) */
        if (want('NO-LOSS')) {
            await page.goto(base + '/tests/fixtures/', { waitUntil: 'domcontentloaded' }).catch(() => {});
            const seeded = await page.evaluate(async () => {
                await new Promise((r) => { const q = indexedDB.deleteDatabase('mathquest_quizzes'); q.onsuccess = q.onerror = q.onblocked = () => r(); });
                const db = await new Promise((res, rej) => {
                    const q = indexedDB.open('mathquest_quizzes', 1);
                    q.onupgradeneeded = (e) => {
                        const d = e.target.result;
                        d.createObjectStore('tests', { keyPath: 'id' }).createIndex('createdAt', 'createdAt');
                        const rs = d.createObjectStore('results', { keyPath: 'id' }); rs.createIndex('testId', 'testId'); rs.createIndex('completedAt', 'completedAt');
                    };
                    q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error);
                });
                const tests = [{ id: 'old1', name: 'Old quiz', createdAt: 1700000000000, sections: [{ label: 'A', questions: [{ skillId: 'add_facts', questionData: { text: '2 + 3', ans: 5 }, points: 1 }] }], settings: { x: 1 } }];
                const res = [{ id: 'r1', testId: 'old1', completedAt: 1700000100000, score: 4, answers: [1, 2, 3] }];
                await new Promise((r) => { const t = db.transaction(['tests', 'results'], 'readwrite'); tests.forEach((x) => t.objectStore('tests').put(x)); res.forEach((x) => t.objectStore('results').put(x)); t.oncomplete = r; });
                db.close();
                const sets = JSON.stringify([{ id: 'set1', name: 'Old set', skills: [{ categoryId: 'addition', skillId: 'add_facts' }], createdAt: 1 }]);
                localStorage.setItem('mq_teacher_sets', sets);
                return { tests, res, sets };
            });
            await visit('/index.html');
            await go('sheets');
            if (!(await onSheets())) finding('NO-LOSS', 'the My Worksheets screen did not open (tvGo("sheets"))');
            await L(async (L) => L.saveSheet({ host: 'player', req: { paper: 'A4', idx: [0], parts: [{ role: 'independent', sections: [{ skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: {} }], columns: 'auto' }], size: 'M', look: 'auto', paper: 'A4', header: { name: true, date: true, score: true, title: true }, key: { on: true, placement: 'end', style: 'copy', newSheet: false }, seed: 4242 }] } }));
            const after = await page.evaluate(async () => {
                const db = await new Promise((res, rej) => { const q = indexedDB.open('mathquest_quizzes'); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
                const all = (st) => new Promise((r) => { const q = db.transaction(st, 'readonly').objectStore(st).getAll(); q.onsuccess = () => r(q.result); });
                const out = { v: db.version, stores: [...db.objectStoreNames], tests: await all('tests'), res: await all('results'), sheets: (await all('sheets')).length, sets: localStorage.getItem('mq_teacher_sets') };
                return out;
            });
            if (!after.stores.includes('sheets')) finding('NO-LOSS', `no sheets store after the upgrade (stores ${after.stores.join(',')}, version ${after.v})`);
            if (JSON.stringify(after.tests) !== JSON.stringify(seeded.tests)) finding('NO-LOSS', 'the tests store changed');
            if (JSON.stringify(after.res) !== JSON.stringify(seeded.res)) finding('NO-LOSS', 'the results store changed');
            if (after.sets !== seeded.sets) finding('NO-LOSS', 'My sets (mq_teacher_sets) changed');
            if (after.sheets < 1) finding('NO-LOSS', 'the save wrote no sheet');
            const q = await page.evaluate(async () => { const S = await import('/js/modules/quiz-storage.js'); const t = await S.listTests(); return t.map((x) => x.id); });
            if (!q.includes('old1')) finding('NO-LOSS', `the quiz list lost the old quiz (${q.join(',')})`);
        }

        /* ---------------------------------------------------------------- SAVE-REPRODUCE */
        const needSaved = want('SAVE-REPRODUCE') || want('SHEET-CODE') || want('LIBRARY-ROUNDTRIP') || want('INTERACTIVE-SAME') || want('ORGANISE') || want('TOUCH-WIDTH');
        if (needSaved) {
            await L(async (L) => L.clearSheets());
            for (const c of CASES) {
                const r = await page.evaluate(async (c) => {
                    const TP = await import('/js/modules/teacher-print.js');
                    const SP = await import('/js/modules/simple-print.js');
                    const L = await import('/js/modules/sheet-library.js');
                    let draft, before;
                    if (c.host === 'tp') {
                        TP.loadPrintUi(Object.assign({ seed: 271828 }, c.ui));
                        window.tvGo('print');
                        before = await TP.printBuiltNow();
                        draft = TP.printSaveDraft();
                        before = { pupilHtml: before.pupilHtml, keyHtml: before.keyHtml };
                    } else if (c.host === 'sp') {
                        SP.openSimplePrint(c.skills.map((s) => Object.assign({}, s)), { from: 'tray' });
                        const b0 = document.querySelector(`#spRoot [data-sp="size"][data-v="${c.size}"]`);
                        if (b0 && b0.getAttribute('aria-checked') !== 'true') b0.click();
                        if (c.pages) { const h = document.querySelector('#spRoot [data-sp="how"][data-v="pages"]'); if (h && h.getAttribute('aria-checked') !== 'true') h.click(); }
                        const b = await SP.simpleBuiltNow();
                        before = { pupilHtml: b.pupilHtml, keyHtml: b.keyHtml };
                        draft = SP.simpleSaveDraft();
                        SP.closeSimplePrint();
                    } else {
                        // the interactive player, as a teacher: play the skill as an online worksheet, then Save there
                        window.UnifiedSkills.clear();
                        for (const s of c.skills) window.UnifiedSkills.add({ domainId: window.getDomainByCategory(s.categoryId), categoryId: s.categoryId, skillId: s.skillId, skillLabel: s.skillId });
                        window.playSelectedSkills('worksheet');
                        await new Promise((r) => setTimeout(r, 800));
                        const W = await import('/js/modules/worksheet.js');
                        draft = W.playerSaveDraft();
                        const TP2 = await import('/js/modules/teacher-print.js');
                        const b = await TP2.buildPrintRequest(draft.req);
                        before = { pupilHtml: b.pupilHtml, keyHtml: b.keyHtml };
                        window.showView('homeView');
                    }
                    const rec = await L.saveSheet(draft);
                    const again = await L.buildRecord(await L.getSheet(rec.id));
                    const mix = await L.buildRecord(Object.assign({}, rec, { req: L.reseed(rec.host, rec.req, 777001) }));
                    const strip = (rq) => JSON.stringify(rq, (k, v) => (k === 'seed' || k === 'lessonSeeds' ? undefined : v));
                    return {
                        id: rec.id, host: rec.host, pupilSame: before.pupilHtml === again.pupilHtml, keySame: before.keyHtml === again.keyHtml,
                        pupilLen: (before.pupilHtml || '').length, keyLen: (before.keyHtml || '').length,
                        mixDiffers: mix.pupilHtml !== again.pupilHtml, mixSettings: strip(L.reseed(rec.host, rec.req, 777001)) === strip(rec.req),
                        thumb: (rec.thumb || '').length, packed: JSON.stringify(rec.req).length,
                    };
                }, c).catch((e) => ({ error: String(e.message || e).slice(0, 300) }));
                if (r.error) { finding('SAVE-REPRODUCE', `${c.id}: ${r.error}`); continue; }
                saved.push(Object.assign({ case: c.id }, r));
                if (!r.pupilLen) finding('SAVE-REPRODUCE', `${c.id}: the print before saving was empty`);
                if (!r.pupilSame) finding('SAVE-REPRODUCE', `${c.id}: the reprinted pupil pages differ from the print before saving`);
                if (!r.keySame) finding('SAVE-REPRODUCE', `${c.id}: the reprinted key differs from the print before saving`);
                if (!r.mixDiffers) finding('SAVE-REPRODUCE', `${c.id}: New mix printed the same items`);
                if (!r.mixSettings) finding('SAVE-REPRODUCE', `${c.id}: New mix changed a setting besides the seed`);
                if (!r.thumb || r.thumb > 25 * 1024 * 1.37) finding('SAVE-REPRODUCE', `${c.id}: thumbnail ${r.thumb} chars (want a page-1 image, ≤ 25 KB)`);
            }
            // the real Save button and dialog on each host
            const ui = await page.evaluate(async () => {
                const out = [];
                const TP = await import('/js/modules/teacher-print.js');
                TP.loadPrintUi({ seed: 99, size: 'M', sections: [{ role: 'independent', skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: {} }] }] });
                window.tvGo('print');
                await TP.printBuiltNow();
                out.push(!!document.querySelector('#teacherMain [data-screen="print"] [data-act="save-sheet"]'));
                const SP = await import('/js/modules/simple-print.js');
                SP.openSimplePrint([{ categoryId: 'addition', skillId: 'add_facts' }], { from: 'tray' });
                await SP.simpleBuiltNow();
                out.push(!!document.querySelector('#spRoot [data-sp="save"]'));
                SP.closeSimplePrint();
                return out;
            });
            if (!ui[0]) finding('SAVE-REPRODUCE', 'the Print worksheets screen has no Save button');
            if (!ui[1]) finding('SAVE-REPRODUCE', 'the simple print has no Save button for a teacher');
            const n0 = await L(async (L) => (await L.listSheets()).length);
            await click('#teacherMain [data-screen="print"] [data-act="save-sheet"]');
            await page.waitForSelector('#mwsSave:not([hidden])', { timeout: 15000 }).catch(() => {});
            const dlg = await page.evaluate(() => { const n = document.querySelector('#mwsSaveName'); const f = document.querySelector('#mwsSaveFolder'); return { name: n && n.value, folder: f && f.options[f.selectedIndex] && f.options[f.selectedIndex].textContent }; });
            if (!dlg.name || !/^Independent · .+ · \d{1,2} [A-Z][a-z]{2}$/.test(dlg.name)) finding('SAVE-REPRODUCE', `Save dialog name "${dlg.name}" is not "Independent · ‹skill› · ‹date›"`);
            if (!dlg.folder || !/^Year \d · Block \d+ · /.test(dlg.folder)) finding('SAVE-REPRODUCE', `Save dialog folder "${dlg.folder}" is not the unit folder`);
            await shot('save-dialog-1280');
            await click('#mwsSave [data-mws-save="save"]');
            await sleep(800);
            const n1 = await L(async (L) => (await L.listSheets()).length);
            if (n1 !== n0 + 1) finding('SAVE-REPRODUCE', `Save in the dialog stored ${n1 - n0} sheets`);
            // pupils never see Save (card A15 #2)
            const pupil = await page.evaluate(async () => {
                window.setUserRole('student');
                await new Promise((r) => setTimeout(r, 300));
                const SP = await import('/js/modules/simple-print.js');
                SP.openSimplePrint([{ categoryId: 'addition', skillId: 'add_facts' }], { from: 'student' });
                await SP.simpleBuiltNow();
                const sp = !!document.querySelector('#spRoot [data-sp="save"]');
                SP.closeSimplePrint();
                window.UnifiedSkills.clear();
                window.UnifiedSkills.add({ domainId: window.getDomainByCategory('addition'), categoryId: 'addition', skillId: 'add_facts', skillLabel: 'add_facts' });
                window.playSelectedSkills('worksheet');
                await new Promise((r) => setTimeout(r, 800));
                const ws = !!document.querySelector('#worksheetView #wsSaveSheet:not([hidden])');
                window.showView('homeView');
                window.setUserRole('teacher');
                await new Promise((r) => setTimeout(r, 300));
                return { sp, ws };
            });
            if (pupil.sp) finding('SAVE-REPRODUCE', 'a pupil sees Save in the simple print');
            if (pupil.ws) finding('SAVE-REPRODUCE', 'a pupil sees Save on the online worksheet');
            // the 450 warning and the 500 cap (card A15 #3)
            const cap = await page.evaluate(async () => {
                const L = await import('/js/modules/sheet-library.js');
                const keep = await L.exportLibrary();
                const one = (await L.listSheets())[0];
                const now = Date.now();
                const fill = async (n) => { const have = (await L.listSheets()).length; for (let i = have; i < n; i++) await L.putSheet(Object.assign({}, one, { id: `cap_${i}`, thumb: '', updatedAt: now - i })); };
                const { openSaveDialog, closeSaveDialog } = await import('/js/modules/my-worksheets.js');
                await fill(455);
                await openSaveDialog({ host: one.host, req: one.req });
                const warn = (document.querySelector('#mwsSave .mws-cap') || {}).textContent || '';
                closeSaveDialog();
                await fill(500);
                await openSaveDialog({ host: one.host, req: one.req });
                const stop = (document.querySelector('#mwsSave .mws-cap') || {}).textContent || '';
                const dis = (document.querySelector('#mwsSave [data-mws-save="save"]') || {}).disabled;
                closeSaveDialog();
                let threw = false;
                try { await L.saveSheet({ host: one.host, req: one.req }); } catch (e) { threw = !!e.cap; }
                await L.clearSheets();
                await L.importLibrary(keep);
                return { warn, stop, dis, threw };
            });
            if (!/455 of 500/.test(cap.warn) || !/Export library/.test(cap.warn)) finding('SAVE-REPRODUCE', `no 450 warning at 455 sheets ("${cap.warn}")`);
            if (!/500/.test(cap.stop) || !cap.dis || !cap.threw) finding('SAVE-REPRODUCE', `at 500 Save is not stopped (${JSON.stringify(cap)})`);
        }

        /* ---------------------------------------------------------------- LIBRARY-ROUNDTRIP */
        if (want('LIBRARY-ROUNDTRIP')) {
            const r = await L(async (L) => {
                const before = await L.listSheets();
                const file = await L.exportLibrary();
                await L.clearSheets();
                const empty = (await L.listSheets()).length;
                const a = await L.importLibrary(file);
                const after = await L.listSheets();
                const b = await L.importLibrary(file);
                const after2 = await L.listSheets();
                const byId = (l) => JSON.stringify(l.slice().sort((x, y) => (x.id < y.id ? -1 : 1)));
                // a version-0 record: no v, size S, options written out in full, no tags field
                const old = JSON.parse(JSON.stringify(before.find((x) => x.host === 'teacher-print')));
                delete old.v; delete old.tags; delete old.cls; old.id = 'old_v0'; old.req.parts[0].size = 'S';
                old.req.parts[0].sections[0].skills[0].opts = { constant: [] };
                const c = await L.importLibrary(JSON.stringify({ format: 'mqsheets', sheets: [old] }));
                const got = await L.getSheet('old_v0');
                let built = 0;
                try { built = (await L.buildRecord(got)).pupilHtml.length; } catch (e) { built = -1; }
                await L.deleteSheet('old_v0');
                return { n: before.length, empty, a, b, same: byId(before) === byId(after), same2: byId(after) === byId(after2), thumbs: after.filter((x) => x.thumb).length, c, oldOk: !!got && got.v === 1 && got.req.parts[0].size === 'M' && Array.isArray(got.tags), built };
            });
            if (r.empty !== 0) finding('LIBRARY-ROUNDTRIP', `clear left ${r.empty} sheets`);
            if (!r.same) finding('LIBRARY-ROUNDTRIP', `export → clear → import is not the same library (${r.n} sheets; ${JSON.stringify(r.a)})`);
            if (!r.same2 || r.b.added) finding('LIBRARY-ROUNDTRIP', `importing twice changed the library (${JSON.stringify(r.b)})`);
            if (r.thumbs < r.n) finding('LIBRARY-ROUNDTRIP', `only ${r.thumbs} of ${r.n} records kept their thumbnail`);
            if (!r.oldOk || !(r.built > 0)) finding('LIBRARY-ROUNDTRIP', `a version-0 record did not load as version 1 (${JSON.stringify({ c: r.c, oldOk: r.oldOk, built: r.built })})`);
            // the screen's Import button (a real click, a real file)
            await go('sheets'); await onSheets();
            const file = path.join(os.tmpdir(), `mws-import-${process.pid}.mqsheets`);
            const extra = await L(async (L) => { const one = (await L.listSheets())[0]; return JSON.stringify({ format: 'mqsheets', v: 1, sheets: [Object.assign({}, one, { id: 'imported_one', name: 'Imported sheet', updatedAt: Date.now() })] }); });
            fs.writeFileSync(file, extra);
            const [chooser] = await Promise.all([page.waitForFileChooser({ timeout: 10000 }).catch(() => null), click('#teacherMain [data-mws="import"]')]);
            if (!chooser) finding('LIBRARY-ROUNDTRIP', 'Import did not open a file picker');
            else {
                await chooser.accept([file]);
                await sleep(1200);
                const has = await page.evaluate(() => [...document.querySelectorAll('.mws-card .mws-name')].some((n) => n.textContent.includes('Imported sheet')));
                if (!has) finding('LIBRARY-ROUNDTRIP', 'the imported sheet is not on the screen after Import');
                await L(async (L) => L.deleteSheet('imported_one'));
            }
            fs.rmSync(file, { force: true });
            // Export through the button gives the same file the library exports
            const ex = await page.evaluate(async () => {
                let got = null;
                const orig = URL.createObjectURL;
                URL.createObjectURL = (b) => { got = b; return orig.call(URL, b); };
                document.querySelector('#teacherMain [data-mws="export"]').click();
                await new Promise((r) => setTimeout(r, 600));
                URL.createObjectURL = orig;
                const text = got ? await got.text() : '';
                let n = -1; try { n = JSON.parse(text).sheets.length; } catch (e) { n = -1; }
                return n;
            });
            const n = await L(async (L) => (await L.listSheets()).length);
            if (ex !== n) finding('LIBRARY-ROUNDTRIP', `Export library wrote ${ex} sheets of ${n}`);
        }

        /* ---------------------------------------------------------------- SHEET-CODE */
        if (want('SHEET-CODE')) {
            const r = await L(async (L) => {
                const out = [];
                for (const rec of await L.listSheets()) {
                    const code = L.encodeSheetCode(rec);
                    const d = L.decodeSheetCode(L.sheetLink(rec));
                    const same = !!d && JSON.stringify(d.req) === JSON.stringify(rec.req) && d.host === rec.host;
                    let html = false;
                    if (same && out.length < 6) { const a = await L.buildRecord(rec); const b = await L.buildRecord({ host: d.host, req: d.req, name: d.name }); html = a.doc === b.doc; } else html = same;
                    out.push({ id: rec.id, name: rec.name, same, html, len: code.length });
                }
                // append-only: an unknown field is ignored
                const rec = (await L.listSheets())[0];
                const raw = JSON.stringify({ v: 1, n: rec.name, h: 't', req: rec.req, zz: 'future' });
                const b64 = btoa(unescape(encodeURIComponent(raw))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
                return { out, future: !!L.decodeSheetCode('SH1.' + b64), bad: L.decodeSheetCode('SH1.notacode') === null };
            });
            for (const x of r.out) { if (!x.same) finding('SHEET-CODE', `${x.name}: the code does not decode to its request`); else if (!x.html) finding('SHEET-CODE', `${x.name}: the code prints other HTML`); }
            if (!r.future) finding('SHEET-CODE', 'a code with an unknown (future) field does not open');
            if (!r.bad) finding('SHEET-CODE', 'a broken code decodes');
            // as a teacher: Save to My Worksheets and Print are offered
            const tp = saved.find((s) => s.case === 'tp-independent-M') || saved[0];
            const link = await L(async (L, id) => L.encodeSheetCode(await L.getSheet(id)), tp.id);
            const n0 = await L(async (L) => (await L.listSheets()).length);
            await visit(`/index.html?sheet=${link}`);
            await page.waitForSelector('#mwsCodeOpen:not([hidden])', { timeout: 30000 }).catch(() => {});
            const offer = await page.evaluate(() => ({ save: !!document.querySelector('#mwsCodeOpen [data-mws-code="save"]'), print: !!document.querySelector('#mwsCodeOpen [data-mws-code="print"]') }));
            if (!offer.save || !offer.print) finding('SHEET-CODE', `a teacher opening ?sheet= is not offered Save and Print (${JSON.stringify(offer)})`);
            else {
                await click('#mwsCodeOpen [data-mws-code="save"]');
                await sleep(1500);
                const n1 = await L(async (L) => (await L.listSheets()).length);
                if (n1 !== n0 + 1) finding('SHEET-CODE', `Save to My Worksheets from a code stored ${n1 - n0} sheets`);
            }
            // as a pupil (a fresh window, no teacher role): the sheet plays, page 1's items
            const ctx = await browser.createBrowserContext();
            const pp = await ctx.newPage();
            await pp.setViewport({ width: 1280, height: 1000 });
            const sp = saved.find((s) => s.case === 'sp-sections-M') || saved[0];
            const link2 = await L(async (L, id) => L.encodeSheetCode(await L.getSheet(id)), sp.id);
            const want1 = await L(async (L, id) => (await L.pageOneItems(await L.getSheet(id))).map((q) => `${q.text}=${q.ans}`), sp.id);
            await pp.goto(`${base}/index.html?sheet=${link2}`, { waitUntil: 'networkidle0', timeout: 90000 });
            let got = null;
            for (let i = 0; i < 80; i++) {
                got = await pp.evaluate(async () => {
                    if (!document.querySelector('#worksheetView.active')) return null;
                    const { state } = await import('/js/modules/state.js');
                    return { teacher: document.body.classList.contains('teacher-mode'), qs: (state.worksheetQs || []).map((q) => `${q.text}=${q.ans}`) };
                }).catch(() => null);
                if (got && got.qs.length) break;
                await sleep(250);
            }
            if (!got) finding('SHEET-CODE', 'a pupil opening ?sheet= did not get the online worksheet');
            else if (got.teacher) finding('SHEET-CODE', 'the pupil window is in teacher mode');
            else if (JSON.stringify(got.qs) !== JSON.stringify(want1)) finding('SHEET-CODE', `the pupil plays other items (${got.qs.length} vs page 1's ${want1.length}: ${got.qs.slice(0, 2).join(' | ')} vs ${want1.slice(0, 2).join(' | ')})`);
            await ctx.close();
            await visit('/index.html');
        }

        /* ---------------------------------------------------------------- INTERACTIVE-SAME */
        if (want('INTERACTIVE-SAME')) {
            for (const cid of ['tp-independent-M', 'sp-facts-L', 'tp-lesson-M']) {
                const s = saved.find((x) => x.case === cid);
                if (!s) { finding('INTERACTIVE-SAME', `${cid}: not saved`); continue; }
                // the gate's own page-1 walk over the rebuilt plans (independent of the screen's play path)
                const page1 = await L(async (L, id) => {
                    const b = await L.buildRecord(await L.getSheet(id));
                    for (const plan of b.plans) {
                        const sheets = plan && plan.sheets && plan.sheets.length ? plan.sheets : [plan];
                        for (const p of sheets) for (const pg of (p.pages && p.pages.length ? p.pages : [{ sections: p.sections || [] }])) {
                            const out = [];
                            const walk = (part) => { if (!part) return; if (part.kind === 'grid') { (part.items || []).forEach((it) => it && it.q && out.push(`${it.q.text}=${it.q.ans}`)); return; } if (part.content) walk(part.content); (part.contents || []).forEach(walk); (part.parts || []).forEach(walk); };
                            (pg.sections || []).forEach(walk);
                            if (out.length) return out;
                        }
                    }
                    return [];
                }, s.id);
                await go('sheets'); await onSheets();
                await click(`.mws-card[data-id="${s.id}"] [data-mws="play"]`);
                let got = null;
                for (let i = 0; i < 80; i++) {
                    got = await page.evaluate(async () => {
                        if (!document.querySelector('#worksheetView.active')) return null;
                        const { state } = await import('/js/modules/state.js');
                        return (state.worksheetQs || []).map((q) => `${q.text}=${q.ans}`);
                    });
                    if (got && got.length) break;
                    await sleep(250);
                }
                if (cid === 'tp-independent-M') await shot('interactive-1280');
                if (!page1.length) finding('INTERACTIVE-SAME', `${cid}: page 1 has no items to compare`);
                else if (!got) finding('INTERACTIVE-SAME', `${cid}: Play did not open the online worksheet`);
                else if (JSON.stringify(got) !== JSON.stringify(page1)) finding('INTERACTIVE-SAME', `${cid}: the worksheet deals other questions (${got.length} vs ${page1.length}: ${got.slice(0, 2).join(' | ')} vs ${page1.slice(0, 2).join(' | ')})`);
                await page.evaluate(() => window.showView('homeView'));
                await sleep(400);
            }
        }

        /* ---------------------------------------------------------------- ORGANISE */
        if (want('ORGANISE')) {
            await go('sheets'); await onSheets();
            const tp = saved.find((s) => s.case === 'tp-independent-M');
            const card = `.mws-card[data-id="${tp.id}"]`;
            const recOf = (id) => L(async (L, id) => L.getSheet(id), id);
            // the default unit folder (card §4, A15 #4)
            const side = await page.evaluate(() => [...document.querySelectorAll('[data-mws="folder"]')].map((b) => b.textContent.trim()));
            if (!side.some((t) => /^Year \d · Block \d+ · /.test(t) || /^Y\d · B\d+/.test(t))) finding('ORGANISE', `no default unit folder in the side list (${side.slice(0, 6).join(' | ')})`);
            // rename
            await click(`${card} [data-mws="menu"]`);
            await shot('menu-1280');
            await click(`${card} [data-mws="rename"]`);
            await page.evaluate(() => { const i = document.querySelector('#mwsEditName'); i.select(); });
            await page.keyboard.type('Renamed sheet Q');
            await click('#mwsEdit [data-mws-edit="ok"]');
            await sleep(500);
            if ((await recOf(tp.id)).name !== 'Renamed sheet Q') finding('ORGANISE', 'Rename did not rename');
            // a new folder, then move
            await click('#teacherMain [data-mws="new-folder"]');
            await page.keyboard.type('Friday review');
            await click('#mwsEdit [data-mws-edit="ok"]');
            await sleep(500);
            await click(`${card} [data-mws="menu"]`);
            await click(`${card} [data-mws="move"]`);
            await page.evaluate(() => { const s = document.querySelector('#mwsEditFolder'); const o = [...s.options].find((x) => x.textContent === 'Friday review'); s.value = o ? o.value : s.value; s.dispatchEvent(new Event('change', { bubbles: true })); });
            await click('#mwsEdit [data-mws-edit="ok"]');
            await sleep(500);
            const meta = await L(async (L) => L.getMeta());
            const fr = meta.folders.find((f) => f.name === 'Friday review');
            if (!fr || (await recOf(tp.id)).folder !== fr.id) finding('ORGANISE', 'Move did not move the sheet to the new folder');
            // tags and class
            await click(`${card} [data-mws="menu"]`);
            await click(`${card} [data-mws="tags"]`);
            await page.evaluate(() => { document.querySelector('#mwsEditTags').value = ''; document.querySelector('#mwsEditClass').value = ''; });
            await page.focus('#mwsEditTags'); await page.keyboard.type('homework, friday');
            await page.focus('#mwsEditClass'); await page.keyboard.type('5T');
            await click('#mwsEdit [data-mws-edit="ok"]');
            await sleep(500);
            const tg = await recOf(tp.id);
            if (JSON.stringify(tg.tags) !== '["homework","friday"]' || tg.cls !== '5T') finding('ORGANISE', `tags / class not saved (${JSON.stringify([tg.tags, tg.cls])})`);
            // duplicate
            const n0 = await L(async (L) => (await L.listSheets()).length);
            await click(`${card} [data-mws="menu"]`);
            await click(`${card} [data-mws="duplicate"]`);
            await sleep(900);
            const all1 = await L(async (L) => L.listSheets());
            const dup = all1.find((r) => r.id !== tp.id && /Renamed sheet Q/.test(r.name));
            if (all1.length !== n0 + 1 || !dup || JSON.stringify(dup.req) !== JSON.stringify(tg.req)) finding('ORGANISE', 'Duplicate did not make the same sheet');
            // New mix: same settings, new seed
            await click(`${card} [data-mws="menu"]`);
            await click(`${card} [data-mws="newmix"]`);
            await sleep(1500);
            const all2 = await L(async (L) => L.listSheets());
            const mix = all2.find((r) => !all1.some((x) => x.id === r.id));
            const strip = (rq) => JSON.stringify(rq, (k, v) => (k === 'seed' || k === 'lessonSeeds' ? undefined : v));
            if (!mix || strip(mix.req) !== strip(tg.req) || JSON.stringify(mix.req) === JSON.stringify(tg.req)) finding('ORGANISE', 'New mix did not make a sheet with the same settings and a new seed');
            // search
            await page.focus('#mwsSearch'); await page.keyboard.type('Renamed sheet Q');
            await sleep(500);
            const hits = await page.evaluate(() => document.querySelectorAll('.mws-card').length);
            if (hits !== 2 + (mix && /Renamed/.test(mix.name) ? 1 : 0)) finding('ORGANISE', `search for the name shows ${hits} cards`);
            await page.evaluate(() => { const i = document.querySelector('#mwsSearch'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); });
            await page.focus('#mwsSearch'); await page.keyboard.type('5T');
            await sleep(500);
            const hits2 = await page.evaluate(() => [...document.querySelectorAll('.mws-card')].map((c) => c.dataset.id));
            if (!hits2.includes(tp.id)) finding('ORGANISE', 'search for the class does not find the sheet');
            await page.evaluate(() => { const i = document.querySelector('#mwsSearch'); i.value = ''; i.dispatchEvent(new Event('input', { bubbles: true })); });
            await sleep(300);
            // sorts: newest first, by unit
            await click('#teacherMain [data-mws="folder"][data-v=""]');
            const orderDate = await page.evaluate(() => [...document.querySelectorAll('.mws-card')].map((c) => c.dataset.id));
            const wantDate = (await L(async (L) => L.listSheets())).map((r) => r.id);
            if (JSON.stringify(orderDate) !== JSON.stringify(wantDate)) finding('ORGANISE', 'Newest first is not the newest-change order');
            await click('#teacherMain [data-mws="sort"][data-v="unit"]');
            const orderUnit = await page.evaluate(() => [...document.querySelectorAll('.mws-card')].map((c) => c.dataset.id));
            const wantUnit = await L(async (L) => (await L.listSheets()).slice().sort((a, b) => ((a.unit && a.unit.order) || 1e9) - ((b.unit && b.unit.order) || 1e9) || (b.updatedAt - a.updatedAt)).map((r) => r.id));
            if (JSON.stringify(orderUnit) !== JSON.stringify(wantUnit)) finding('ORGANISE', 'By unit is not the unit order');
            await click('#teacherMain [data-mws="sort"][data-v="date"]');
            // delete + Undo (10 s)
            await click(`.mws-card[data-id="${dup.id}"] [data-mws="menu"]`);
            await click(`.mws-card[data-id="${dup.id}"] [data-mws="delete"]`);
            await sleep(500);
            const gone = !(await recOf(dup.id)) && !(await page.$(`.mws-card[data-id="${dup.id}"]`));
            if (!gone) finding('ORGANISE', 'Delete did not delete');
            await sleep(6500);   // the Undo is still there after the shell's 6 s toasts
            const undo = await page.$('#teacherMain [data-mws="undo"]');
            if (!undo) finding('ORGANISE', 'no Undo 7 s after Delete');
            else { await click('#teacherMain [data-mws="undo"]'); await sleep(600); if (!(await recOf(dup.id))) finding('ORGANISE', 'Undo did not bring the sheet back'); }
            // reload: everything kept
            await visit('/index.html');
            await go('sheets'); await onSheets();
            const k = await recOf(tp.id);
            const m2 = await L(async (L) => L.getMeta());
            if (!k || k.name !== 'Renamed sheet Q' || k.cls !== '5T' || !m2.folders.some((f) => f.name === 'Friday review') || k.folder !== (m2.folders.find((f) => f.name === 'Friday review') || {}).id) finding('ORGANISE', 'the changes did not survive a reload');
            const chips = await page.evaluate(() => [...document.querySelectorAll('[data-mws="chip"]')].map((c) => c.textContent.trim()));
            if (!chips.some((t) => /5T/.test(t)) || !chips.some((t) => /homework/.test(t))) finding('ORGANISE', `no class / tag filter chips (${chips.join(' | ')})`);
            else {
                await click('#teacherMain [data-mws="chip"][data-v="tag:homework"]');
                const only = await page.evaluate(() => [...document.querySelectorAll('.mws-card')].map((c) => c.dataset.id));
                if (!only.length || !only.includes(tp.id) || only.length > 3) finding('ORGANISE', `the #homework chip shows ${only.length} cards`);
                await click('#teacherMain [data-mws="chip"][data-v="tag:homework"]');
            }
        }

        /* ---------------------------------------------------------------- TOUCH-WIDTH */
        if (want('TOUCH-WIDTH')) {
            for (const w of WIDTHS) {
                const [W, H, touch] = SIZE[w] || [w, 900, w < 1100];
                await page.setViewport({ width: W, height: H, deviceScaleFactor: 1, hasTouch: touch, isMobile: false });
                await visit('/index.html');
                await go('sheets');
                if (!(await onSheets())) { finding('TOUCH-WIDTH', `${w}: the screen did not open`); continue; }
                await sleep(400);
                const measure = (scope) => page.evaluate((scope) => {
                    const root = document.querySelector(scope);
                    if (!root) return { missing: true };
                    const bad = [], miss = [];
                    const els = [...root.querySelectorAll('button, input, select, a[href], [role="button"]')].filter((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && !e.closest('[hidden]'); });
                    for (const e of els) {
                        const r = e.getBoundingClientRect();
                        const name = (e.getAttribute('aria-label') || e.textContent || e.id || e.name || e.tagName).trim().slice(0, 30);
                        if (r.width < 47.5 || r.height < 47.5) bad.push(`${name} ${Math.round(r.width)}×${Math.round(r.height)}`);
                        if (r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth) {
                            const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
                            if (!hit || !(hit === e || e.contains(hit) || (e.tagName === 'INPUT' && hit.tagName === 'LABEL'))) miss.push(`${name} (under ${hit ? hit.className || hit.tagName : 'nothing'})`);
                        }
                    }
                    return { n: els.length, bad, miss, sideways: document.documentElement.scrollWidth > innerWidth + 1 };
                }, scope);
                const m1 = await measure('#teacherMain .tv-screen.is-active[data-screen="sheets"]');
                if (m1.missing || !m1.n) finding('TOUCH-WIDTH', `${w}: no controls measured`);
                else {
                    if (m1.bad.length) finding('TOUCH-WIDTH', `${w}: under 48 px: ${m1.bad.slice(0, 6).join(', ')}`);
                    if (m1.miss.length) finding('TOUCH-WIDTH', `${w}: not hit at the centre: ${m1.miss.slice(0, 4).join(', ')}`);
                    if (m1.sideways) finding('TOUCH-WIDTH', `${w}: the page scrolls sideways`);
                }
                const narrow = W < 900;
                const picker = await page.evaluate(() => { const p = document.querySelector('#mwsFolderPick'); const s = document.querySelector('.mws-side'); return { pick: !!p && p.getBoundingClientRect().width > 0, side: !!s && s.getBoundingClientRect().width > 0 }; });
                if (narrow && (!picker.pick || picker.side)) finding('TOUCH-WIDTH', `${w}: the folders do not fold into the Folder picker (${JSON.stringify(picker)})`);
                if (!narrow && (picker.pick || !picker.side)) finding('TOUCH-WIDTH', `${w}: the folder list is not down the left (${JSON.stringify(picker)})`);
                if (w === 1280 || w === 820) await shot(`library-${w}`);
                // the ⋯ menu by a real tap / click
                const first = await page.$eval('.mws-card', (c) => c.dataset.id).catch(() => '');
                if (!first) { finding('TOUCH-WIDTH', `${w}: no card`); continue; }
                await click(`.mws-card[data-id="${first}"] [data-mws="menu"]`, touch);
                const open = await page.evaluate((id) => { const m = document.querySelector(`.mws-card[data-id="${id}"] .mws-menu`); return !!m && !m.hidden; }, first);
                if (!open) finding('TOUCH-WIDTH', `${w}: the ⋯ menu did not open on a ${touch ? 'tap' : 'click'}`);
                else {
                    if (w === 820) await shot('menu-820');
                    const m2 = await measure(`.mws-card[data-id="${first}"] .mws-menu`);
                    if (m2.bad && m2.bad.length) finding('TOUCH-WIDTH', `${w}: menu items under 48 px: ${m2.bad.slice(0, 4).join(', ')}`);
                    if (m2.miss && m2.miss.length) finding('TOUCH-WIDTH', `${w}: menu items not hit at the centre: ${m2.miss.slice(0, 4).join(', ')}`);
                    if (m2.sideways) finding('TOUCH-WIDTH', `${w}: the open menu scrolls the page sideways`);
                    await click(`.mws-card[data-id="${first}"] [data-mws="rename"]`, touch);
                    const d = await measure('#mwsEdit');
                    if (d.missing) finding('TOUCH-WIDTH', `${w}: Rename did not open on a ${touch ? 'tap' : 'click'}`);
                    else if (d.bad.length || d.miss.length) finding('TOUCH-WIDTH', `${w}: Rename dialog: ${[...d.bad, ...d.miss].slice(0, 4).join(', ')}`);
                    await click('#mwsEdit [data-mws-edit="cancel"]', touch).catch(() => {});
                }
                // the Save dialog from the Print screen
                await page.evaluate(async () => { const TP = await import('/js/modules/teacher-print.js'); TP.loadPrintUi({ seed: 5, size: 'M', sections: [{ role: 'independent', skills: [{ categoryId: 'addition', skillId: 'add_facts', opts: {} }] }] }); window.tvGo('print'); await TP.printBuiltNow(); });
                await click('#teacherMain [data-screen="print"] [data-act="save-sheet"]', touch);
                await page.waitForSelector('#mwsSave:not([hidden])', { timeout: 15000 }).catch(() => {});
                const sd = await measure('#mwsSave');
                if (sd.missing) finding('TOUCH-WIDTH', `${w}: Save did not open its dialog on a ${touch ? 'tap' : 'click'}`);
                else {
                    if (sd.bad.length) finding('TOUCH-WIDTH', `${w}: Save dialog under 48 px: ${sd.bad.slice(0, 4).join(', ')}`);
                    if (sd.miss.length) finding('TOUCH-WIDTH', `${w}: Save dialog not hit at the centre: ${sd.miss.slice(0, 4).join(', ')}`);
                    if (sd.sideways) finding('TOUCH-WIDTH', `${w}: the Save dialog scrolls sideways`);
                    if (w === 820) await shot('save-dialog-820');
                    await click('#mwsSave [data-mws-save="cancel"]', touch);
                }
                if (w === 820) {
                    await go('sheets'); await onSheets();
                    await click(`.mws-card[data-id="${first}"] [data-mws="play"]`, true);
                    await page.waitForSelector('#worksheetView.active', { timeout: 30000 }).catch(() => {});
                    await sleep(800);
                    await shot('interactive-820');
                    if (!(await page.$('#worksheetView.active'))) finding('TOUCH-WIDTH', '820: Play did not open the online worksheet on a tap');
                    await page.evaluate(() => window.showView('homeView'));
                }
            }
        }
    } catch (e) {
        if (String(e.message) !== 'no library') finding('RUN', String(e.stack || e).slice(0, 400));
    } finally {
        const errs = (problems || []).filter((p) => !/favicon|ERR_ABORTED|net::ERR_FAILED.*(fonts|gsi|jsdelivr)|accounts\.google|cdn\.jsdelivr/.test(p.text));
        if (errs.length) finding('CONSOLE', `${errs.length} console / page errors: ${errs.slice(0, 3).map((p) => p.text.slice(0, 160)).join(' | ')}`);
        await app.close();
    }
    let fails = 0;
    for (const id of [...ONLY, ...Object.keys(results).filter((k) => !ONLY.includes(k))]) {
        const f = results[id] || [];
        if (f.length) fails++;
        console.log(`${id}: ${f.length ? `FAIL ${f.length}` : 'OK'}`);
        for (const x of f.slice(0, 12)) console.log(`  - ${x}`);
    }
    console.log(`(${saved.length} sheets saved; widths ${WIDTHS.join(',')}; ${Math.round((Date.now() - t0) / 1000)} s)`);
    console.log(fails ? `ws-my-worksheets: FAIL (${fails})` : 'ws-my-worksheets: OK');
    process.exit(fails ? 1 : 0);
})();
