// ws-frame-title — the teacher's page-title option (lf-roles, owner request 2026-11-13): the custom title text and its
// placement ABOVE or BELOW the Name / Date / Score line, on every page role and its answer key.
//
//   node tests/scripts/ws-frame-title.cjs                          # every check, the default sample, every role, M and L
//   node tests/scripts/ws-frame-title.cjs --skills a:b,c:d          # the skills (default: three redesign-passed skills)
//   node tests/scripts/ws-frame-title.cjs --roles independent,guided,test   # the roles (default: every buildSheet role of
//                                                                  # sheet/roles/index.js ROLE_IDS; the key of each with it)
//   node tests/scripts/ws-frame-title.cjs --sizes M,L               # sizes (default M,L: plan item 9, print is M and L only)
//   node tests/scripts/ws-frame-title.cjs --only ident,geom,long    # a subset of the checks
//   node tests/scripts/ws-frame-title.cjs --hashes-out f.json       # write the hashes of the NO-OPTION renders (pupil + key)
//   node tests/scripts/ws-frame-title.cjs --hashes-against f.json   # TITLE-IDENT: every no-option render byte-identical to
//                                                                  # the pinned hashes (written on origin/master)
//   node tests/scripts/ws-frame-title.cjs --png-dir dir --png-roles independent,guided,test   # also screenshot page 1
//
// The checks:
//   TITLE-IDENT   with no option (and with the option at its defaults: titlePos 'below', titleText ''), every role's pupil
//                 page and key is byte-identical to the no-option render (and to --hashes-against when given)
//   TITLE-PLACE   titlePos 'above' draws the title BEFORE the Name / Date / Score row, 'below' after it; neither overlaps or
//                 clips: title, field row, (strand tab if any), the header rule and the first row of the body are each clear
//                 of the next, at M and L, on the pupil page and the key
//   TITLE-LONG    a custom title: printed (or truncated at a word with "…" past two lines, and reported in res.titleFit for
//                 the dialog); its font is the size's title token (never shrinks); at most two lines; inside the header band
//
// Prints `ws-frame-title: OK (...)` / `ws-frame-title: FAIL (n)`; exits 1 on FAIL.
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { open } = require('../lib/ws-harness.cjs');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i > -1 && i + 1 < argv.length ? argv[i + 1] : d; };
const SKILLS = (arg('skills', 'addition:add_facts,subtraction:sub_100_no_regroup,addition:add_wp_10')).split(',').map((s) => s.trim()).filter(Boolean);
const ROLES_ARG = arg('roles', '');
const SIZES = arg('sizes', 'M,L').split(',');
const ONLY = new Set(arg('only', 'ident,geom,long').split(','));
const HOUT = arg('hashes-out', null);
const HAGAINST = arg('hashes-against', null);
const PNG_DIR = arg('png-dir', null);
const PNG_ROLES = new Set(arg('png-roles', 'independent,guided,test').split(','));
const SEED = 4242;
const sha = (s) => crypto.createHash('sha1').update(String(s)).digest('hex');

// A title that wraps to exactly two lines at L and at M, and one that runs past two lines (truncated).
const TWO_LINE = 'I Can add two-digit numbers and check each answer by counting on along the number line';
const LONG = 'I Can add and subtract two-digit numbers with and without regrouping, explain each step aloud to a partner, and check every single answer with the inverse operation before I hand it in';

const fails = [];
const fail = (s) => fails.push(s);

async function build(page, req) {
    return page.evaluate(async (req) => {
        try {
            const r = await window.buildSheet(req);
            return { pupil: r.pupilHtml || '', key: r.keyHtml || '', titleFit: r.titleFit || null };
        } catch (e) { return { error: String((e && e.message) || e), unsupported: !!(e && e.unsupported) }; }
    }, req);
}

/** Measure every titled page of a document in an iframe: the header parts' boxes, in mm. */
async function measure(page, html, size) {
    return page.evaluate(async ({ html, size }) => {
        const doc = window.sheetDocument(html, 'Title check', { paper: 'A4' });
        const ifr = document.createElement('iframe');
        ifr.style.cssText = 'position:fixed;left:0;top:0;width:1000px;height:1400px;border:0;visibility:hidden';
        document.body.appendChild(ifr);
        await new Promise((res) => { ifr.onload = res; ifr.srcdoc = doc; });
        const d = ifr.contentDocument;
        try { await d.fonts.ready; } catch (e) { /* */ }
        await new Promise((r) => setTimeout(r, 50));
        const pxmm = 96 / 25.4;
        const R = (el) => { const b = el.getBoundingClientRect(); return { l: b.left / pxmm, t: b.top / pxmm, r: b.right / pxmm, b: b.bottom / pxmm, w: b.width / pxmm, h: b.height / pxmm }; };
        const out = [];
        [...d.querySelectorAll('.ws-page')].forEach((pg, i) => {
            const head = pg.querySelector(':scope > .ws-head');
            const title = head && head.querySelector('.ws-title');
            if (!title) return;
            const rowA = head.querySelector('.ws-rowA');
            const fields = [...rowA.querySelectorAll('.ws-field')].map(R);
            const tab = rowA.querySelector('.ws-tabbox');
            const rule = head.querySelector('.ws-headrule');
            const body = pg.querySelector(':scope > .ws-body');
            // the first drawn thing of the body (the instruction line or the first row)
            let first = null;
            if (body) {
                const kids = [...body.querySelectorAll('*')].filter((el) => { const b = el.getBoundingClientRect(); return b.height > 0.5 && b.width > 0.5 && getComputedStyle(el).visibility !== 'hidden'; });
                if (kids.length) first = kids.map(R).reduce((a, x) => (x.t < a.t ? x : a));
            }
            const cs = getComputedStyle(title);
            const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
            // the title's own text lines (a range over its text: the box can be taller than the text)
            const rg = d.createRange(); rg.selectNodeContents(title);
            const lineTops = new Set([...rg.getClientRects()].filter((b) => b.width > 0.5).map((b) => Math.round(b.top)));
            const tok = parseFloat(getComputedStyle(pg).getPropertyValue('--ws-title')) || 0;
            out.push({
                page: i + 1, key: pg.classList.contains('ws-key'), size: pg.getAttribute('data-ws-size'),
                order: [...head.children].map((c) => c.className.split(' ')[0]),
                title: R(title), fields, tab: tab ? R(tab) : null, rule: R(rule), body: body ? R(body) : null, first, head: R(head), pageBox: R(pg),
                fontPt: parseFloat(cs.fontSize) * 72 / 96, tokenPt: tok, lines: lineTops.size, lhMm: lh / pxmm,
                // clipped only where the box hides its overflow (a visible overflow of the glyphs' content area is not a clip)
                clipW: cs.overflowX !== 'visible' ? title.scrollWidth - title.clientWidth : 0, clipH: cs.overflowY !== 'visible' ? title.scrollHeight - title.clientHeight : 0,
                textBox: (() => { const rs = [...rg.getClientRects()].filter((b) => b.width > 0.5); if (!rs.length) return null; return { l: Math.min(...rs.map((b) => b.left)) / pxmm, r: Math.max(...rs.map((b) => b.right)) / pxmm, t: Math.min(...rs.map((b) => b.top)) / pxmm, b: Math.max(...rs.map((b) => b.bottom)) / pxmm }; })(),
                text: title.textContent.replace(/\s+/g, ' ').trim(),
                pageOver: pg.scrollHeight - pg.clientHeight,
            });
        });
        ifr.remove();
        return out;
    }, { html, size });
}

async function shot(page, html, file) {
    await page.evaluate(async (html) => {
        const doc = window.sheetDocument(html, 'Title check', { paper: 'A4' });
        let ifr = document.getElementById('__wsft');
        if (!ifr) { ifr = document.createElement('iframe'); ifr.id = '__wsft'; document.body.appendChild(ifr); }
        ifr.style.cssText = 'position:fixed;left:0;top:0;width:820px;height:1140px;border:0;z-index:2147483647;background:#fff';
        await new Promise((res) => { ifr.onload = res; ifr.srcdoc = doc; });
        try { await ifr.contentDocument.fonts.ready; } catch (e) { /* */ }
        ifr.contentDocument.body.style.padding = '0';
        await new Promise((r) => setTimeout(r, 150));
    }, html);
    const el = await page.$('#__wsft');
    await el.screenshot({ path: file });
    await page.evaluate(() => { const f = document.getElementById('__wsft'); if (f) f.remove(); });
}

const EPS = 0.25;  // mm
const clear = (a, b) => a.r <= b.l + EPS || b.r <= a.l + EPS || a.b <= b.t + EPS || b.b <= a.t + EPS;

function geomCheck(m, where, pos, expectText) {
    for (const p of m) {
        const at = `${where} ${p.key ? 'key' : 'pupil'} p${p.page}`;
        const iTitle = p.order.indexOf('ws-title'), iRow = p.order.indexOf('ws-rowA');
        if (pos === 'above' && !(iTitle > -1 && iTitle < iRow)) fail(`TITLE-PLACE ${at}: titlePos above, but the title is not before the Name/Date/Score row (${p.order.join(' > ')})`);
        if (pos === 'below' && !(iTitle > iRow)) fail(`TITLE-PLACE ${at}: titlePos below, but the title is not after the Name/Date/Score row (${p.order.join(' > ')})`);
        for (const f of p.fields) if (!clear(p.title, f)) fail(`TITLE-PLACE ${at}: the title overlaps a Name/Date/Score field (title ${p.title.t.toFixed(1)}-${p.title.b.toFixed(1)} mm, field ${f.t.toFixed(1)}-${f.b.toFixed(1)} mm)`);
        if (p.tab && !clear(p.title, p.tab)) fail(`TITLE-PLACE ${at}: the title overlaps the strand tab`);
        if (p.title.b > p.rule.t + EPS) fail(`TITLE-PLACE ${at}: the title runs into the header rule (${p.title.b.toFixed(2)} > ${p.rule.t.toFixed(2)} mm)`);
        for (const f of p.fields) if (f.b > p.rule.t + EPS) fail(`TITLE-PLACE ${at}: a field runs into the header rule`);
        if (p.first && p.first.t < p.rule.b - EPS) fail(`TITLE-PLACE ${at}: the first row of the body starts above the header rule (${p.first.t.toFixed(2)} < ${p.rule.b.toFixed(2)} mm)`);
        if (p.textBox && (p.textBox.l < p.head.l - EPS || p.textBox.r > p.head.r + EPS)) fail(`TITLE-PLACE ${at}: the title's text runs outside the header band (${p.textBox.l.toFixed(1)}-${p.textBox.r.toFixed(1)} mm, band ${p.head.l.toFixed(1)}-${p.head.r.toFixed(1)} mm)`);
        if (p.title.l < p.pageBox.l - EPS || p.title.r > p.pageBox.r + EPS) fail(`TITLE-PLACE ${at}: the title is wider than the page`);
        if (p.clipW > 1 || p.clipH > 1) fail(`TITLE-PLACE ${at}: the title is clipped (scroll ${p.clipW} x ${p.clipH} px over its box)`);
        if (p.pageOver > 1) fail(`TITLE-PLACE ${at}: the page overflows by ${p.pageOver} px`);
        // TITLE-LONG (every titled page): never shrinks, at most two lines
        if (Math.abs(p.fontPt - p.tokenPt) > 0.2) fail(`TITLE-LONG ${at}: the title is ${p.fontPt.toFixed(1)} pt, not the size's title token ${p.tokenPt} pt (a title never shrinks)`);
        if (p.lines > 2) fail(`TITLE-LONG ${at}: the title takes ${p.lines} lines (at most two)`);
        if (expectText !== undefined && p.text !== expectText) fail(`TITLE-LONG ${at}: printed "${p.text.slice(0, 60)}${p.text.length > 60 ? '…' : ''}", asked "${expectText.slice(0, 60)}${expectText.length > 60 ? '…' : ''}"`);
    }
}

(async () => {
    const app = await open({ seed: 1, lock: 'ws-frame-title' });
    const { page } = app;
    page.setDefaultTimeout(0);
    const hashes = {};
    let builds = 0, measured = 0, skipped = [];
    try {
        const roleIds = await page.evaluate(async () => (await import('./js/modules/sheet/roles/index.js')).ROLE_IDS.filter((r) => r !== 'answer-key'));
        const ROLES = ROLES_ARG ? ROLES_ARG.split(',') : roleIds;
        for (const r of ROLES) if (!roleIds.includes(r)) fail(`usage: role ${r} is not in sheet/roles/index.js ROLE_IDS`);
        if (PNG_DIR) fs.mkdirSync(PNG_DIR, { recursive: true });
        for (const role of ROLES) for (const sk of SKILLS) for (const size of SIZES) {
            const [categoryId, skillId] = sk.split(':');
            const base = { role, sections: [{ skills: [{ categoryId, skillId }] }], size, paper: 'A4', seed: SEED, key: true };
            const id = `${sk}/${role}/${size}`;
            const r0 = await build(page, base); builds++;
            if (r0.error) {
                // a role that does not take this skill (a fact layout of a non-fact skill) says so: skipped, not failed
                if (r0.unsupported) { skipped.push(id); continue; }
                fail(`${id}: build failed: ${r0.error}`); continue;
            }
            hashes[`${id}/pupil`] = sha(r0.pupil);
            hashes[`${id}/key`] = sha(r0.key);
            if (ONLY.has('ident')) {
                const rd = await build(page, Object.assign({}, base, { header: { titlePos: 'below', titleText: '' } })); builds++;
                if (rd.pupil !== r0.pupil) fail(`TITLE-IDENT ${id}: the option at its defaults (below, no text) changes the pupil page`);
                if (rd.key !== r0.key) fail(`TITLE-IDENT ${id}: the option at its defaults changes the key`);
            }
            if (ONLY.has('geom') || ONLY.has('long')) {
                const variants = [];
                if (ONLY.has('geom')) variants.push(['default', null, 'below'], ['above', { titlePos: 'above' }, 'above'], ['below', { titlePos: 'below' }, 'below']);
                if (ONLY.has('long')) variants.push(['two-line-above', { titleText: TWO_LINE, titlePos: 'above' }, 'above', TWO_LINE], ['long', { titleText: LONG }, 'below', 'trunc'], ['long-above', { titleText: LONG, titlePos: 'above' }, 'above', 'trunc']);
                for (const [vn, hdr, pos, want] of variants) {
                    const r = hdr ? await build(page, Object.assign({}, base, { header: hdr })) : r0;
                    if (hdr) builds++;
                    if (r.error) { fail(`${id}/${vn}: build failed: ${r.error}`); continue; }
                    let expect;
                    if (want === 'trunc') {
                        const tf = r.titleFit;
                        if (!tf || !tf.truncated) fail(`TITLE-LONG ${id}/${vn}: a title past two lines is not reported truncated in res.titleFit (the dialog warns from it)`);
                        else if (!/…$/.test(tf.text) || !LONG.startsWith(tf.text.slice(0, -1).trim())) fail(`TITLE-LONG ${id}/${vn}: the truncated title "${tf.text}" is not the asked title cut at a word with "…"`);
                        expect = (tf && tf.text) || undefined;
                    } else if (want) {
                        expect = want;
                        if (!r.titleFit || r.titleFit.truncated || r.titleFit.lines !== 2) fail(`TITLE-LONG ${id}/${vn}: res.titleFit should say 2 lines, not truncated (${JSON.stringify(r.titleFit)})`);
                    }
                    for (const [which, html] of [['pupil', r.pupil], ['key', r.key]]) {
                        const m = await measure(page, html, size); measured += m.length;
                        if (!m.length && role !== 'lesson') { /* a role may print no titled page (a title switched off by the role) */ }
                        geomCheck(m, `${id}/${vn}/${which}`, pos, expect);
                    }
                    if (PNG_DIR && PNG_ROLES.has(role) && sk === SKILLS[0]) await shot(page, r.pupil.split(/(?=<section class="ws-page)/).find((s) => /ws-title/.test(s)) || r.pupil, path.join(PNG_DIR, `${role}-${size}-${vn}.png`));
                }
            }
        }
        if (app.problems.length) for (const p of app.problems.slice(0, 5)) fail(`console: ${p.type} ${p.text}`);
    } finally { await app.close(); }
    if (HOUT) fs.writeFileSync(HOUT, JSON.stringify(hashes, null, 1) + '\n');
    if (HAGAINST) {
        const pin = JSON.parse(fs.readFileSync(HAGAINST, 'utf8'));
        let same = 0;
        for (const [k, v] of Object.entries(hashes)) {
            if (!(k in pin)) { fail(`TITLE-IDENT ${k}: not in the pinned hashes`); continue; }
            if (pin[k] !== v) fail(`TITLE-IDENT ${k}: differs from the pinned no-option render`); else same++;
        }
        for (const k of Object.keys(pin)) if (!(k in hashes) && SKILLS.some((s) => k.startsWith(s + '/')) && (!ROLES_ARG || ROLES_ARG.split(',').some((r) => k.includes(`/${r}/`)))) fail(`TITLE-IDENT ${k}: pinned but not rendered`);
        console.log(`  TITLE-IDENT: ${same} of ${Object.keys(hashes).length} hashes identical to ${path.basename(HAGAINST)}`);
    }
    for (const f of fails.slice(0, 60)) console.log(`  ${f}`);
    if (fails.length > 60) console.log(`  ... and ${fails.length - 60} more`);
    if (skipped.length) console.log(`  skipped (role does not take the skill): ${skipped.length}`);
    console.log(fails.length ? `ws-frame-title: FAIL (${fails.length})` : `ws-frame-title: OK (${builds} builds, ${measured} titled pages measured, ${Object.keys(hashes).length} hashes, ${SKILLS.length} skills x ${SIZES.join('/')})`);
    process.stdout.write('', () => process.exit(fails.length ? 1 : 0));
})().catch((e) => { console.log(`ws-frame-title: FAIL (${e && e.stack || e})`); process.exit(1); });
