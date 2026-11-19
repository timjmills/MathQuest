// ws-student-opts — the pupil's options sheet (design/student-opts/CARD.md, signed 2026-11-19, §6).
//
//   STUDENT-OPTS-CARRY  as a pupil: select 3 skills from Quick Start (real taps), set a non-default pupil option on 2 of them
//            through the sheet, then start by every host - the sheet's "Play this skill" and "Play all selected (N)", each
//            game style card (.student-start-btn), the bottom Play. 12 questions are dealt per host; every question's skill
//            must be in what that host plays, and the options in force when it was generated (state.skillOptions, captured
//            by a setter at each generate) must equal the options chosen for that skill. STALE: after a first play, a chip's
//            ✕ and a changed option must reach the next play started from a game style card (state.isMixedMode stayed true
//            after a first play, so startGame skipped the rebuild and dealt the OLD selection).
//   STUDENT-OPTS-COUNT  "You will play N skills" (the sheet, the game style row and the bottom row), "Play all selected (N)"
//            and the skills dealt all equal the selection: after adding, after ✕ on a chip, after Clear; N = 1 says
//            "1 skill" and hides "Play all selected".
//   STUDENT-OPTS-PUPIL  the sheet opens folded ("Change how it works" closed); it shows no option outside pupilOptionsFor and
//            none of a layout / appearance / more / nline / play / support group, level or hidden; every control, the ✕ and
//            both buttons are >= 48 x 48 px and take a real tap at their centre (elementFromPoint); the chip ✕ is 48 x 48;
//            the sheet is inside the window (a popover at >= 1024 px, a bottom sheet at 820); a teacher-link option is shown
//            locked and greyed with "Set by your teacher"; Esc puts focus back on the card; no page errors.
//   STUDENT-OPTS-UNIT   (node, also `--unit` alone) pupilOptionsFor on every live skill never returns a layout / appearance /
//            more / nline / play / support / level / hidden / role-gated option, and its counts per group match the pin
//            tests/fixtures/student-opts/pupil-counts.json (`--write-pin` rewrites it after a reviewed change).
//
//   node tests/scripts/ws-student-opts.cjs                    all four, at 1280x1000, 1366x768, 1024x768 (touch), 820x1180 (touch)
//   node tests/scripts/ws-student-opts.cjs --unit             the node unit check only (no browser)
//   node tests/scripts/ws-student-opts.cjs --widths 1280,820  some widths
//   node tests/scripts/ws-student-opts.cjs --shots <dir>      also save screenshots (sheet folded / open, chips, locked)
// Prints `ws-student-opts: OK` / `FAIL (n)`. MQ_ROOT serves another checkout (ws-backtest commit-pair rows).
'use strict';
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && argv[i + 1] !== undefined ? argv[i + 1] : d; };
const has = (k) => argv.includes('--' + k);
const SHOTS = arg('shots', '');
const ROOT = process.env.MQ_ROOT ? path.resolve(process.env.MQ_ROOT) : path.resolve(__dirname, '..', '..');
const PIN = path.resolve(__dirname, '..', 'fixtures', 'student-opts', 'pupil-counts.json');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const ALL_WIDTHS = { 1280: { width: 1280, height: 1000 }, 1366: { width: 1366, height: 768 }, 1024: { width: 1024, height: 768, touch: true }, 820: { width: 820, height: 1180, touch: true } };
const WIDTHS = String(arg('widths', '1280,1366,1024,820')).split(',').map((w) => w.trim()).filter((w) => ALL_WIDTHS[w]);
const BAD_GROUPS = ['layout', 'appearance', 'more', 'nline', 'play', 'support'];

const fails = [];
const F = (t) => fails.push(t);

/* ------------------------------------------------------------------ STUDENT-OPTS-UNIT (node) */
async function unit() {
    const { loadApp } = await import(pathToFileURL(path.join(__dirname, 'ws-card-rulings.mjs')).href);
    const { data, so } = await loadApp(ROOT);
    if (typeof so.pupilOptionsFor !== 'function') { F('UNIT skill-options.js has no pupilOptionsFor (no curated pupil subset)'); return; }
    const group = typeof so.optionGroup === 'function' ? so.optionGroup : (d) => d.group || 'difficulty';
    const counts = { skills: 0, withPupil: 0, byGroup: {}, byId: {} };
    const bad = [];
    for (const [cat, list] of Object.entries(data.SKILLS)) {
        for (const s of list || []) {
            if (!s || !s.v || (data.isTombstone && data.isTombstone(cat, s.v))) continue;
            counts.skills++;
            let defs;
            try { defs = so.pupilOptionsFor(cat, s.v); } catch (e) { bad.push(`${cat}:${s.v} throws ${e.message}`); continue; }
            if (defs.length) counts.withPupil++;
            for (const d of defs) {
                const g = group(d);
                if (BAD_GROUPS.includes(g) || d.id === 'level' || d.hidden || d.hiddenOnRoles || d.offeredAtSize) bad.push(`${cat}:${s.v} ${d.id} (group ${g}${d.hidden ? ', hidden' : ''}${d.hiddenOnRoles ? ', role-gated' : ''})`);
                counts.byGroup[g] = (counts.byGroup[g] || 0) + 1;
                counts.byId[d.id] = (counts.byId[d.id] || 0) + 1;
            }
        }
    }
    if (bad.length) F(`UNIT ${bad.length} teacher option(s) offered to a pupil: ${bad.slice(0, 6).join('; ')}`);
    const sorted = (o) => Object.fromEntries(Object.entries(o).sort(([a], [b]) => (a < b ? -1 : 1)));
    const snap = { skills: counts.skills, withPupil: counts.withPupil, byGroup: sorted(counts.byGroup), byId: sorted(counts.byId) };
    if (has('write-pin')) { fs.mkdirSync(path.dirname(PIN), { recursive: true }); fs.writeFileSync(PIN, JSON.stringify(snap, null, 2) + '\n'); console.log(`  wrote ${path.relative(process.cwd(), PIN)}`); }
    else if (!fs.existsSync(PIN)) F('UNIT no pin tests/fixtures/student-opts/pupil-counts.json (run --unit --write-pin after review)');
    else {
        const pin = JSON.parse(fs.readFileSync(PIN, 'utf8'));
        const diff = [];
        for (const k of ['skills', 'withPupil']) if (pin[k] !== snap[k]) diff.push(`${k} ${pin[k]} -> ${snap[k]}`);
        for (const part of ['byGroup', 'byId']) for (const id of new Set([...Object.keys(pin[part] || {}), ...Object.keys(snap[part])])) if ((pin[part] || {})[id] !== snap[part][id]) diff.push(`${part}.${id} ${(pin[part] || {})[id] || 0} -> ${snap[part][id] || 0}`);
        if (diff.length) F(`UNIT pupil subset moved from the pin (${diff.length}): ${diff.slice(0, 8).join('; ')} (review, then --write-pin)`);
    }
    console.log(`  unit: ${snap.skills} live skills, ${snap.withPupil} with pupil options; groups ${JSON.stringify(snap.byGroup)}`);
}

/* ------------------------------------------------------------------ the browser half */
const SKILLS3 = [
    { categoryId: 'addition', skillId: 'add' },
    { categoryId: 'subtraction', skillId: 'subtract' },
    { categoryId: 'multiplication', skillId: 'mult_facts' },
];
const LOCKED = { categoryId: 'division', skillId: 'div_facts', opts: { band: 225 } };

async function browser() {
    const { open } = require('../lib/ws-harness.cjs');
    const app = await open({ seed: 11, viewport: { width: 1280, height: 1000, deviceScaleFactor: 1 } });
    const { page } = app;
    page.on('dialog', (d) => { d.accept().catch(() => {}); });   // exitGame's "Exit game?" confirm
    try {
        for (const w of WIDTHS) {
            const vp = ALL_WIDTHS[w];
            await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1, isMobile: !!vp.touch, hasTouch: !!vp.touch });
            await page.reload({ waitUntil: 'networkidle2', timeout: 60000 });
            await page.waitForFunction(() => typeof window.generateQuestion === 'function' && !!window.SKILLS && !!window.UnifiedSkills, { timeout: 30000 });
            await sleep(300);
            await atWidth(page, w, !!vp.touch);
        }
        const errs = app.problems.filter((p) => !/favicon/.test(p.text));
        if (errs.length) F(`PUPIL ${errs.length} page error(s): ${errs.slice(0, 3).map((p) => p.type + ' ' + p.text).join(' | ')}`);
    } finally { await app.close(); }
}

/** Reset to the pupil home with our Quick Start cards and nothing selected. */
async function home(page, { fresh = false } = {}) {
    await page.evaluate(({ cards, locked, fresh }) => {
        if (window.exitGame && window.state && window.state.isPlaying) { try { window.exitGame(); } catch (e) { /* */ } }
        document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode');
        if (window.closeStudentOptions) { try { window.closeStudentOptions(); } catch (e) { /* */ } }
        window.state.isPlaying = false;
        if (fresh) {
            window.UnifiedSkills.clear();
            if (window.clearSetOptions) window.clearSetOptions();
            window.state.isMixedMode = false;
            const label = (c, s) => ((window.SKILLS[c] || []).find((x) => x.v === s) || {}).l || s;
            window.customQuickSkills = cards.map((k) => ({ categoryId: k.categoryId, skillId: k.skillId, skillLabel: label(k.categoryId, k.skillId), categoryIcon: '📚', categoryName: k.categoryId, shortName: label(k.categoryId, k.skillId), source: 'default', color: 'qs-pastel-blue' }))
                .concat([{ categoryId: locked.categoryId, skillId: locked.skillId, skillLabel: label(locked.categoryId, locked.skillId), categoryIcon: '📚', categoryName: locked.categoryId, shortName: label(locked.categoryId, locked.skillId), source: 'link', opts: locked.opts, linkOpts: true }]);
        }
        if (window.showView) window.showView('homeView');
        if (window.renderQuickSkillsGrid) window.renderQuickSkillsGrid();
        window.scrollTo(0, 0);
    }, { cards: SKILLS3, locked: LOCKED, fresh });
    await sleep(350);
}

/** A real pointer tap at an element's centre (touch on a touch screen); fails when something else is on top. */
async function tap(page, sel, touch, what, wait = 250) {
    const pt = await page.evaluate((sel) => {
        const el = typeof sel === 'string' ? document.querySelector(sel) : null;
        if (!el) return { err: 'missing' };
        el.scrollIntoView({ block: 'center', inline: 'nearest' });
        const r = el.getBoundingClientRect();
        const x = r.left + r.width / 2, y = r.top + r.height / 2;
        const top = document.elementFromPoint(x, y);
        return { x, y, w: r.width, h: r.height, hit: !!top && (top === el || el.contains(top) || (top.closest && top.closest('label') && top.closest('label').contains(el))) };
    }, sel);
    if (pt.err) return { ok: false, why: `${what}: not found (${sel})` };
    if (!pt.hit) return { ok: false, why: `${what}: a tap at its centre lands on something else` };
    if (touch) await page.touchscreen.tap(pt.x, pt.y); else await page.mouse.click(pt.x, pt.y);
    if (wait) await sleep(wait);
    return { ok: true, ...pt };
}

const cardSel = (i) => `#quickSkillsGrid > .quick-skill-card:nth-child(${i + 1})`;
const sheetOpen = (page) => page.evaluate(() => { const s = document.getElementById('studentOptsSheet'); return !!s && !s.hidden && s.offsetParent !== null; });

/** Deal 12 questions the way the game would and read the options in force at each generate. */
async function deal(page, n = 12) {
    return page.evaluate((n) => {
        const st = window.state;
        if (!window.__soHook) {
            let cur = st.skillOptions;
            window.__soLog = [];
            Object.defineProperty(st, 'skillOptions', { configurable: true, enumerable: true, get() { return cur; },
                set(v) { cur = v; if (v && typeof v === 'object' && st.category !== 'all_mixed') window.__soLog.push({ k: `${st.category}:${st.skill}`, o: JSON.parse(JSON.stringify(v)) }); } });
            window.__soHook = true;
        }
        const out = [];
        // the game's own first question, dealt the moment play started (before the queue's debounced sync could run)
        const g = st.currentQ;
        if (g && g.categoryId) {
            const gk = `${g.categoryId}:${g.requestedSkillId || g.skillId}`;
            out.push({ key: gk, opts: g.skillOptions ? window.normalizeOptions(g.categoryId, g.requestedSkillId || g.skillId, g.skillOptions) : null, game: true });
        }
        for (let i = 0; i < n; i++) {
            window.__soLog = [];
            let q;
            try { q = window.generateQuestion(); } catch (e) { out.push({ err: String(e && e.message || e) }); continue; }
            const key = `${q.categoryId || st.category}:${q.requestedSkillId || q.skillId || st.skill}`;
            const hit = window.__soLog.find((e) => e.k === key);
            const [c, s] = key.split(':');
            out.push({ key, opts: window.normalizeOptions(c, s, hit ? hit.o : {}) });
        }
        return { list: out, mixed: st.isMixedMode, cat: st.category, skill: st.skill };
    }, n);
}

/** The skills and chosen pupil options a play must deal. */
function judgeDeal(host, got, want, chosen) {
    const keys = new Set(want.map((k) => `${k.categoryId}:${k.skillId}`));
    const out = [];
    for (const q of got.list) {
        if (q.err) { out.push(`${host}: generate threw ${q.err}`); continue; }
        if (!keys.has(q.key)) { out.push(`${host}: ${q.game ? 'the game dealt' : 'dealt'} ${q.key}, not in what it plays (${[...keys].join(', ')})`); continue; }
        if (!q.opts) continue;
        for (const [id, v] of Object.entries(chosen[q.key] || {})) {
            if (JSON.stringify(q.opts[id]) !== JSON.stringify(v)) out.push(`${host}: ${q.key} dealt with ${id}=${JSON.stringify(q.opts[id])}, chosen ${JSON.stringify(v)}`);
        }
    }
    return [...new Set(out)];
}

async function backHome(page) {
    await page.evaluate(() => {
        try { if (window.exitGame) window.exitGame(); } catch (e) { /* */ }
        window.state.isPlaying = false;
        window.state.currentQ = null;
        document.body.classList.remove('teacher-mode'); document.body.classList.add('student-mode');
        if (window.showView) window.showView('homeView');
        window.scrollTo(0, 0);
    });
    await sleep(300);
}

/** Choose a non-default value for one option in the open sheet (real tap on its control, then the value). */
async function chooseInSheet(page, optId, touch, w) {
    const info = await page.evaluate((optId) => {
        const s = document.getElementById('studentOptsSheet');
        const d = s && s.querySelector('details.so-more');
        if (d && !d.open) d.querySelector('summary').click();
        const row = s && s.querySelector(`[data-so-opt="${optId}"]`);
        const sel = row && row.querySelector('select:not([disabled])');
        if (!sel) return null;
        const cur = sel.selectedIndex;
        const idx = [...sel.options].findIndex((o, i) => i !== cur && i > 0) >= 0 ? [...sel.options].findIndex((o, i) => i !== cur && i > 0) : (cur === 0 ? 1 : 0);
        sel.setAttribute('data-so-pick', '1');
        return { idx: String(idx) };
    }, optId);
    if (!info) return false;
    const t = await tap(page, '#studentOptsSheet select[data-so-pick]', touch, `@${w} the ${optId} control`);
    if (!t.ok) F(`PUPIL ${t.why}`);
    await page.keyboard.press('Escape').catch(() => {});   // close a native drop-down opened by the tap (the sheet keeps it closed only on a second Esc)
    await sleep(100);
    if (!(await sheetOpen(page))) return 'closed';
    await page.select('#studentOptsSheet select[data-so-pick]', info.idx);
    await sleep(300);
    return true;
}

async function readCounts(page) {
    return page.evaluate(() => {
        const t = (sel) => { const e = document.querySelector(sel); return e && e.offsetParent !== null ? e.textContent.trim() : null; };
        const all = document.querySelector('#studentOptsSheet [data-so-play="all"]');
        return {
            sheet: t('#studentOptsSheet [data-so-count]'),
            start: t('#studentStartCount'),
            bottom: t('#studentPlayCount'),
            allBtn: all && all.offsetParent !== null ? all.textContent.trim() : null,
            selected: (window.skillQueue || []).length,
        };
    });
}
const willPlay = (n) => `You will play ${n} skill${n === 1 ? '' : 's'}`;

async function atWidth(page, w, touch) {
    const at = `@${w}`;
    await home(page, { fresh: true });
    const chosen = {};
    // ---- select the 3 skills by tapping their Quick Start cards; each tap opens the sheet
    for (let i = 0; i < 3; i++) {
        const t = await tap(page, cardSel(i), touch, `${at} Quick Start card ${i + 1}`);
        if (!t.ok) { F(`PUPIL ${t.why}`); continue; }
        await page.waitForFunction(() => { const s = document.getElementById('studentOptsSheet'); return s && !s.hidden; }, { timeout: 5000 }).catch(() => {});
        const open = await sheetOpen(page);
        if (!open) { if (i === 0) F(`CARRY ${at} a Quick Start tap opens no options sheet`); continue; }
        if (i === 0) await pupilChecks(page, w, touch, SKILLS3[0]);
        const k = SKILLS3[i];
        if (i === 0 || i === 2) {
            const r = await chooseInSheet(page, 'band', touch, w);
            if (r !== true) F(`CARRY ${at} could not set the ${k.skillId} band through the sheet (${r})`);
            else {
                const now = await page.evaluate((k) => window.normalizeOptions(k.categoryId, k.skillId, window.getSetOptions(k.categoryId, k.skillId)).band, k);
                chosen[`${k.categoryId}:${k.skillId}`] = { band: now };
                const def = await page.evaluate((k) => { const d = window.offeredOptionsFor(k.categoryId, k.skillId).find((x) => x.id === 'band'); return d ? d.default : null; }, k);
                if (now === def) F(`CARRY ${at} the sheet's ${k.skillId} band change did not reach the store (still the default ${def})`);
            }
        }
        if (SHOTS && i === 0) {
            await page.evaluate(() => { const d = document.querySelector('#studentOptsSheet details.so-more'); if (d) d.open = true; });
            await sleep(150);
            await page.screenshot({ path: path.join(SHOTS, `sheet-open-${w}.png`) });
        }
        await page.evaluate(() => window.closeStudentOptions && window.closeStudentOptions());
        await sleep(150);
    }
    // the baseline has no sheet: select through the card (toggle) and the store, so the play hosts still run
    const n0 = await page.evaluate(() => window.skillQueue.length);
    if (n0 !== 3) {
        await page.evaluate((ks) => { for (const k of ks) if (!window.UnifiedSkills.has(k.skillId, k.categoryId)) window.UnifiedSkills.add({ ...k, skillLabel: k.skillId }); }, SKILLS3);
    }
    for (const [key, v] of Object.entries({ 'addition:add': null, 'multiplication:mult_facts': null })) {
        if (chosen[key]) continue;
        const [c, s] = key.split(':');
        chosen[key] = await page.evaluate((c, s) => { const d = window.offeredOptionsFor(c, s).find((x) => x.id === 'band'); const vals = d.values.map((x) => x.v).filter((x) => x !== d.default); window.setSetOptions(c, s, { band: vals[0] }); return { band: vals[0] }; }, c, s);
        void v;
    }
    chosen['subtraction:subtract'] = await page.evaluate(() => { const d = window.offeredOptionsFor('subtraction', 'subtract').find((x) => x.id === 'band'); return { band: d.default }; });
    await sleep(200);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `chips-${w}.png`) });

    // ---- COUNT after adding
    const c3 = await readCounts(page);
    if (c3.start !== willPlay(3)) F(`COUNT ${at} the game style row reads "${c3.start}", not "${willPlay(3)}"`);
    if (c3.bottom !== willPlay(3)) F(`COUNT ${at} the bottom row reads "${c3.bottom}", not "${willPlay(3)}"`);

    // ---- CARRY: every host
    const hosts = [];
    const sheetHost = async (which) => {
        const snap = await page.evaluate(() => ({ q: window.skillQueue.map((s) => ({ categoryId: s.categoryId, skillId: s.skillId, skillLabel: s.skillLabel })), o: JSON.parse(JSON.stringify(window.state.skillOptionsBySkill || {})) }));
        const t = await tap(page, cardSel(0), touch, `${at} card 1`);
        if (!t.ok || !(await sheetOpen(page))) {
            // no sheet (the card tap toggled the selection instead): put the selection and its options back for the next host
            await page.evaluate((snap) => { window.UnifiedSkills.clear(); for (const s of snap.q) window.UnifiedSkills.add(s); for (const [k, o] of Object.entries(snap.o)) { const [c, s] = k.split(':'); window.setSetOptions(c, s, o); } }, snap);
            await sleep(200);
            return { why: 'no sheet' };
        }
        const c = await readCounts(page);
        if (c.sheet !== willPlay(3)) F(`COUNT ${at} the sheet reads "${c.sheet}", not "${willPlay(3)}"`);
        if (which === 'all' && c.allBtn !== 'Play all selected (3)') F(`COUNT ${at} the sheet's button reads "${c.allBtn}", not "Play all selected (3)"`);
        const b = await tap(page, `#studentOptsSheet [data-so-play="${which}"]`, touch, `${at} sheet ${which}`);
        return b.ok ? {} : { why: b.why };
    };
    hosts.push({ name: 'sheet "Play this skill"', want: [SKILLS3[0]], start: () => sheetHost('one') });
    // (a game style right after "Play this skill" is the stale case of the new host: it must play ALL selected)
    for (const m of ['practice', 'boss', 'race', 'worksheet']) hosts.push({ name: `game style ${m}`, want: SKILLS3, start: async () => { const t = await tap(page, `.student-start-btn[data-mode="${m}"]`, touch, `${at} ${m} card`); return t.ok ? {} : { why: t.why }; } });
    hosts.push({ name: 'sheet "Play all selected"', want: SKILLS3, start: () => sheetHost('all') });
    hosts.push({ name: 'bottom Play', want: SKILLS3, start: async () => { const t = await tap(page, '#studentSelPlayBtn', touch, `${at} bottom Play`); return t.ok ? {} : { why: t.why }; } });
    for (const h of hosts) {
        const s = await h.start();
        if (s.why) { F(`CARRY ${at} ${h.name}: ${s.why}`); await backHome(page); continue; }
        await sleep(500);
        const got = await deal(page);
        for (const f of judgeDeal(`${at} ${h.name}`, got, h.want, chosen).slice(0, 3)) F(`CARRY ${f}`);
        await backHome(page);
    }
    // ---- STALE: a chip ✕ and a changed option after a first play reach the next game-style play, tapped at once (a pupil
    // does not wait for the queue's 150 ms debounced sync; startGame skipped the rebuild while state.isMixedMode stayed true)
    const x = await page.evaluate(() => { const b = [...document.querySelectorAll('#studentSkillsList .sel-chip button[aria-label^="Remove"]')][1]; if (b) b.setAttribute('data-so-x', '1'); return !!b; });
    if (!x) F(`COUNT ${at} no ✕ on the second chip`);
    else {
        const t = await tap(page, '#studentSkillsList [data-so-x]', touch, `${at} chip ✕`, 0);
        if (!t.ok) F(`PUPIL ${t.why}`);
    }
    const n2 = await page.evaluate(() => window.skillQueue.length);
    if (n2 !== 2) { F(`COUNT ${at} after ✕ the selection holds ${n2}, not 2`); await page.evaluate(() => window.UnifiedSkills.removeBySkillId('subtract')); }
    chosen['multiplication:mult_facts'] = await page.evaluate(() => { const d = window.offeredOptionsFor('multiplication', 'mult_facts').find((x) => x.id === 'band'); const cur = window.normalizeOptions('multiplication', 'mult_facts', window.getSetOptions('multiplication', 'mult_facts')).band; const v = d.values.map((y) => y.v).find((y) => y !== cur); window.setSetOptions('multiplication', 'mult_facts', { band: v }); return { band: v }; });
    for (const m of ['practice', 'race']) {
        const t = await tap(page, `.student-start-btn[data-mode="${m}"]`, touch, `${at} ${m} card (after a first play)`, 0);
        if (!t.ok) { F(`CARRY ${t.why}`); continue; }
        await sleep(500);
        const got = await deal(page);
        for (const f of judgeDeal(`${at} STALE game style ${m} after ✕ + a changed option`, got, [SKILLS3[0], SKILLS3[2]], chosen).slice(0, 3)) F(`CARRY ${f}`);
        await backHome(page);
    }
    const c2 = await readCounts(page);
    if (c2.start !== willPlay(2) || c2.bottom !== willPlay(2)) F(`COUNT ${at} after ✕ the rows read "${c2.start}" / "${c2.bottom}", not "${willPlay(2)}"`);
    // ---- COUNT: one skill, then Clear
    await page.evaluate(() => window.UnifiedSkills.removeBySkillId('mult_facts'));
    await sleep(200);
    const c1 = await readCounts(page);
    if (c1.start !== willPlay(1) || c1.bottom !== willPlay(1)) F(`COUNT ${at} with 1 selected the rows read "${c1.start}" / "${c1.bottom}", not "${willPlay(1)}"`);
    const t1 = await tap(page, cardSel(0), touch, `${at} card 1 (1 selected)`);
    if (t1.ok && (await sheetOpen(page))) {
        const c = await readCounts(page);
        if (c.sheet !== willPlay(1)) F(`COUNT ${at} with 1 selected the sheet reads "${c.sheet}"`);
        if (c.allBtn !== null) F(`COUNT ${at} with 1 selected the sheet still shows "${c.allBtn}"`);
        await page.evaluate(() => window.closeStudentOptions && window.closeStudentOptions());
    }
    const clear = await page.evaluate(() => { const b = document.getElementById('clearAllSkillsBtn'); if (b && b.offsetParent !== null) { b.click(); return true; } window.UnifiedSkills.clear(); return false; });
    void clear;
    await sleep(300);
    const c0 = await readCounts(page);
    if (c0.selected !== 0) F(`COUNT ${at} after Clear ${c0.selected} still selected`);
    if (c0.start || c0.bottom) F(`COUNT ${at} after Clear the rows still read "${c0.start}" / "${c0.bottom}"`);

    // ---- PUPIL: a teacher-link option is locked
    const lt = await tap(page, cardSel(3), touch, `${at} the teacher-link card`);
    if (!lt.ok) F(`PUPIL ${lt.why}`);
    else if (!(await sheetOpen(page))) F(`PUPIL ${at} the teacher-link card opens no sheet`);
    else {
        const lk = await page.evaluate(() => {
            const s = document.getElementById('studentOptsSheet');
            const d = s.querySelector('details.so-more'); if (d) d.open = true;
            const row = s.querySelector('[data-so-opt="band"]');
            if (!row) return { err: 'no band row' };
            const ctl = row.querySelector('select, input');
            return { text: row.textContent, disabled: !!ctl && ctl.disabled, locked: row.hasAttribute('data-so-locked') };
        });
        if (lk.err) F(`PUPIL ${at} the teacher-link sheet has ${lk.err}`);
        else if (!/Set by your teacher/.test(lk.text) || !lk.disabled || !lk.locked) F(`PUPIL ${at} the teacher-link option is not locked with "Set by your teacher" (disabled ${lk.disabled})`);
        if (SHOTS) { await sleep(150); await page.screenshot({ path: path.join(SHOTS, `locked-${w}.png`) }); }
        await page.keyboard.press('Escape');
        await sleep(250);
        const back = await page.evaluate(() => ({ open: !document.getElementById('studentOptsSheet') || !document.getElementById('studentOptsSheet').hidden, focus: !!(document.activeElement && document.activeElement.closest && document.activeElement.closest('.quick-skill-card')) }));
        if (back.open && (await sheetOpen(page))) F(`PUPIL ${at} Esc does not close the sheet`);
        if (!back.focus) F(`PUPIL ${at} after Esc focus is not back on the card`);
    }
    await page.evaluate(() => { window.UnifiedSkills.clear(); window.clearSetOptions && window.clearSetOptions(); });
}

/** The sheet as first opened, on skill k: folded, pupil options only, 48 px targets that take a tap, inside the window. */
async function pupilChecks(page, w, touch, k) {
    const at = `@${w}`;
    const first = await page.evaluate((k) => {
        const s = document.getElementById('studentOptsSheet');
        const d = s.querySelector('details.so-more');
        const r = s.getBoundingClientRect();
        const allowed = typeof window.pupilOptionsFor === 'function' ? window.pupilOptionsFor(k.categoryId, k.skillId).map((x) => x.id) : null;
        const ids = [...s.querySelectorAll('[data-so-opt]')].map((x) => x.getAttribute('data-so-opt'));
        const sko = [...s.querySelectorAll('[data-sko-group]')].map((x) => x.getAttribute('data-sko-group'));
        return { folded: !!d && !d.open, hasDetails: !!d, allowed, ids, sko, rect: { l: r.left, t: r.top, r: r.right, b: r.bottom, w: r.width }, vw: window.innerWidth, vh: window.innerHeight,
            summary: d ? d.querySelector('summary').textContent.replace(/\s+/g, ' ').trim() : '' };
    }, k);
    if (!first.hasDetails) F(`PUPIL ${at} the sheet has no "Change how it works" row`);
    else if (!first.folded) F(`PUPIL ${at} the sheet opens with its options unfolded`);
    if (first.hasDetails && !/Change how it works/.test(first.summary)) F(`PUPIL ${at} the folded row reads "${first.summary}"`);
    if (SHOTS) await page.screenshot({ path: path.join(SHOTS, `sheet-folded-${w}.png`) });
    if (!first.allowed) F('PUPIL window.pupilOptionsFor is missing');
    const extra = first.allowed ? first.ids.filter((id) => !first.allowed.includes(id)) : [];
    if (extra.length) F(`PUPIL ${at} the sheet shows options outside pupilOptionsFor: ${extra.join(', ')}`);
    const badG = first.sko.filter((g) => BAD_GROUPS.includes(g));
    if (badG.length) F(`PUPIL ${at} the sheet shows teacher groups: ${badG.join(', ')}`);
    const R = first.rect;
    if (R.l < -0.5 || R.t < -0.5 || R.r > first.vw + 0.5 || R.b > first.vh + 0.5) F(`PUPIL ${at} the sheet leaves the window (${Math.round(R.l)},${Math.round(R.t)})-(${Math.round(R.r)},${Math.round(R.b)}) in ${first.vw}x${first.vh}`);
    if (w >= 1024 && R.w >= first.vw - 1) F(`PUPIL ${at} the sheet is full width (a popover at >= 1024 px)`);
    if (w < 1024 && (Math.abs(R.b - first.vh) > 1 || R.w < first.vw - 1)) F(`PUPIL ${at} the sheet is not a bottom sheet`);
    // open the fold and measure every target; tap each button-like control's centre
    await page.evaluate(() => { const d = document.querySelector('#studentOptsSheet details.so-more'); if (d) d.open = true; });
    await sleep(150);
    const targets = await page.evaluate(() => {
        const s = document.getElementById('studentOptsSheet');
        const els = [...s.querySelectorAll('button, summary, select, input[type="number"], label')].filter((e) => e.offsetParent !== null && !(e.tagName === 'LABEL' && !e.querySelector('input')) && !e.closest('label:not(:scope)') );
        return els.map((e, i) => {
            e.setAttribute('data-so-t', String(i));
            const r = e.getBoundingClientRect();
            const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return { i, tag: e.tagName.toLowerCase(), name: (e.getAttribute('aria-label') || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30), w: r.width, h: r.height, hit: !!top && (top === e || e.contains(top) || (e.tagName === 'LABEL' && top.closest('label') === e)), inView: r.top >= 0 && r.bottom <= window.innerHeight };
        });
    });
    const small = targets.filter((t) => t.w < 48 - 0.5 || t.h < 48 - 0.5);
    if (small.length) F(`PUPIL ${at} ${small.length} sheet target(s) under 48 x 48: ${small.slice(0, 5).map((t) => `${t.tag} "${t.name}" ${Math.round(t.w)}x${Math.round(t.h)}`).join('; ')}`);
    const blocked = targets.filter((t) => t.inView && !t.hit);
    if (blocked.length) F(`PUPIL ${at} ${blocked.length} sheet target(s) covered at their centre: ${blocked.slice(0, 4).map((t) => `${t.tag} "${t.name}"`).join('; ')}`);
    if (!targets.some((t) => /Play this skill/.test(t.name))) F(`PUPIL ${at} the sheet has no "Play this skill" button`);
    const x = await page.evaluate(() => { const b = document.querySelector('#studentSkillsList .sel-chip button[aria-label^="Remove"]'); if (!b) return null; const r = b.getBoundingClientRect(); return { w: r.width, h: r.height }; });
    if (!x) F(`PUPIL ${at} the chip has no ✕`);
    else if (x.w < 47.5 || x.h < 47.5) F(`PUPIL ${at} the chip ✕ is ${Math.round(x.w)}x${Math.round(x.h)}, not 48 x 48`);
    // a real tap on the fold's summary folds it again (it takes a pointer)
    const t = await tap(page, '#studentOptsSheet details.so-more > summary', touch, `${at} the fold`);
    if (!t.ok) F(`PUPIL ${t.why}`);
    else if (await page.evaluate(() => document.querySelector('#studentOptsSheet details.so-more').open)) F(`PUPIL ${at} a tap on "Change how it works" does not fold it`);
    // a chip body tap opens the sheet
    await page.evaluate(() => window.closeStudentOptions && window.closeStudentOptions());
    await sleep(150);
    const cb = await tap(page, '#studentSkillsList .sel-chip-open', touch, `${at} the chip body`);
    if (!cb.ok) F(`PUPIL ${cb.why}`);
    else if (!(await sheetOpen(page))) F(`PUPIL ${at} a tap on the chip body opens no sheet`);
}

(async () => {
    try {
        await unit();
        if (!has('unit')) await browser();
    } catch (e) { F('ERROR ' + (e && e.stack || e)); }
    for (const f of fails) console.error('  FAIL ' + f);
    console.log(fails.length ? `ws-student-opts: FAIL (${fails.length})` : 'ws-student-opts: OK');
    process.exit(fails.length ? 1 : 0);
})();
