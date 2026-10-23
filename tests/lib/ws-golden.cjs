// Golden renders (IMPROVEMENT_PLAN §1.3 "Unchanged pages keep their score", §1.4 S4): the helpers
// tests/scripts/ws-grade-render.cjs uses for its golden manifest, its diff and its contact sheets.
//
//   ruleSetVersion()        the ONE definition of the rule-set version: a hash of the files a critic
//                           grades against (RULE_SET_FILES). A change to any of them forces a re-grade.
//   contentHash(html)       sha256 (16 hex) of a canonical DOM serialisation (see canonicalPagesInPage)
//   canonicalPagesInPage    runs IN THE PAGE (pass it to page.evaluate): the canonical HTML of every
//   canonicalHostInPage     printed page / of one screen host. Ids are renamed in document order
//                           (id0, id1 ...) and every reference to them (for, aria-*, href="#..",
//                           url(#..)) follows, so the same content hashes the same across runs;
//                           live input values and focus are not serialised (outerHTML never is).
//   measurePagesInPage      runs IN THE PAGE: per printed page, the numbers a critic reads beside it
//                           (digit size, answer-slot sizes, the largest empty band in a cell, free
//                           space at the foot of the page)
//   scoreStatus(page, ctx)  whether a recorded score still stands (rule set, age in rounds, content)
//   importGrades(...)       match a critic's grades.jsonl records to manifest pages
//
// The content hash shows WHICH PAGES CHANGED since a critic last looked; it never decides
// inheritance (that is the structural fingerprint of IMPROVEMENT_PLAN §1.6.2, ws-envelope).
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const REPO = path.resolve(__dirname, '..', '..');

/** The files that define what a critic grades against: RUBRIC, the standards, LESSONS_LEARNED. */
const RULE_SET_FILES = Object.freeze([
    'design/audit/RUBRIC.md',
    'design/audit/LESSONS_LEARNED.md',
    'WORKSHEET_DESIGN_STANDARD.md',
    'PEDAGOGY_STANDARD.md',
    'design/PAGE_TYPES.md',
    'design/PROBLEM_TYPES.md',
]);

const sha = (s) => crypto.createHash('sha256').update(s).digest('hex');

/**
 * The rule text of a rule-set file: the file with its dated STATUS NOTES removed (critic r1 N9). A status note is a
 * Markdown blockquote whose first line opens with `> **YYYY-MM-DD:**` or `> **Build status ...:**` - a pointer to what
 * is built or planned, not a rule a critic grades against - together with the one blank line that follows it. Plan
 * pointers are added to these files on most planning days; hashing them made every recorded score stale the day it
 * was written. Any other blockquote (an owner scope ruling such as RUBRIC's `> **Scope (owner ruling ...):**`) and every
 * other line still counts, byte for byte, so a file without status notes hashes exactly as before.
 */
const STATUS_NOTE = /^>\s*\*\*(?:\d{4}-\d{2}-\d{2}|Build status\b[^*]*):\*\*/;
function ruleText(buf) {
    const lines = String(buf).split('\n');
    const out = [];
    for (let i = 0; i < lines.length; i++) {
        if (STATUS_NOTE.test(lines[i])) {
            while (i < lines.length && /^>/.test(lines[i])) i++;
            if (i < lines.length && lines[i] === '') continue;   // the blank line after the note
            i--;
            continue;
        }
        out.push(lines[i]);
    }
    return out.join('\n');
}

/** {version, files: {path: sha256-16}} for the rule-set files in `root` (default this checkout). */
function ruleSetVersion(root = REPO) {
    const files = {};
    for (const f of RULE_SET_FILES) {
        const p = path.join(root, f);
        files[f] = fs.existsSync(p) ? sha(ruleText(fs.readFileSync(p, 'utf8'))).slice(0, 16) : 'missing';
    }
    return { version: sha(RULE_SET_FILES.map((f) => `${f}:${files[f]}`).join('\n')).slice(0, 16), files };
}

const contentHash = (html) => sha(String(html)).slice(0, 16);

/** IN THE PAGE. Canonical HTML of `els` (an array of elements): ids renamed in order, refs followed. */
function canonicalPagesInPage(selector) {
    const REF_ATTRS = ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'list', 'headers'];
    const canon = (el) => {
        const c = el.cloneNode(true);
        const map = new Map();
        const all = [c, ...c.querySelectorAll('*')];
        for (const e of all) { const id = e.getAttribute('id'); if (id && !map.has(id)) map.set(id, 'id' + map.size); }
        const sub = (v) => v.replace(/#([A-Za-z_][\w:.-]*)/g, (m, id) => (map.has(id) ? '#' + map.get(id) : m));
        for (const e of all) {
            for (const a of [...e.attributes]) {
                let v = a.value;
                if (a.name === 'id') v = map.get(v) || v;
                else if (REF_ATTRS.includes(a.name)) v = v.split(/\s+/).map((t) => map.get(t) || t).join(' ');
                else if (v.includes('#')) v = sub(v);
                if (v !== a.value) e.setAttribute(a.name, v);
            }
        }
        return c.outerHTML.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
    };
    return [...document.querySelectorAll(selector)].map(canon);
}

/** IN THE PAGE. The canonical HTML of one host root, or '' when it is missing. */
function canonicalHostInPage(selector) {
    const el = document.querySelector(selector);
    if (!el) return '';
    const REF_ATTRS = ['for', 'aria-labelledby', 'aria-describedby', 'aria-controls', 'aria-owns', 'list', 'headers'];
    const c = el.cloneNode(true);
    // layout-pass state flags (worksheet.js data-mq-laid-out) say WHEN, not WHAT
    for (const e of [c, ...c.querySelectorAll('[data-mq-laid-out]')]) e.removeAttribute('data-mq-laid-out');
    // what changes with the clock or the session, not with the content
    c.querySelectorAll('[id*="imer"], [class*="timer"], [class*="Timer"], .xp-display, .streak-display').forEach((t) => { t.textContent = ''; });
    const map = new Map();
    const all = [c, ...c.querySelectorAll('*')];
    for (const e of all) { const id = e.getAttribute('id'); if (id && !map.has(id)) map.set(id, 'id' + map.size); }
    for (const e of all) {
        for (const a of [...e.attributes]) {
            let v = a.value;
            if (a.name === 'id') v = map.get(v) || v;
            else if (REF_ATTRS.includes(a.name)) v = v.split(/\s+/).map((t) => map.get(t) || t).join(' ');
            else if (v.includes('#')) v = v.replace(/#([A-Za-z_][\w:.-]*)/g, (m, id) => (map.has(id) ? '#' + map.get(id) : m));
            if (v !== a.value) e.setAttribute(a.name, v);
        }
    }
    return c.outerHTML.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
}

/**
 * IN THE PAGE. Per `.ws-page`: what the critic reads beside the PNG.
 *   digitPt   {max, median, min} rendered size (pt) of the text holding digits inside the cells
 *             (SVG text scaled by its screen CTM)
 *   slots     {n, minMm: [w, h], sizes: the most common slot sizes in mm}
 *   band      the largest empty band inside one cell: {hPct (of the cell height), wPct, cell}
 *   footPct   the empty strip at the foot of the body, % of the body height
 */
function measurePagesInPage() {
    const PX_MM = 25.4 / 96;
    const out = [];
    const visible = (el) => { const cs = getComputedStyle(el); return cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity !== 0; };
    const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
    const median = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor(s.length / 2)]; };
    const r1 = (x) => Math.round(x * 10) / 10;
    document.querySelectorAll('.ws-page').forEach((pg) => {
        const cells = [...pg.querySelectorAll('[data-ws-cell]')];
        const digits = [];
        let band = { hPct: 0, wPct: 0, cell: null };
        cells.forEach((cell, ci) => {
            const cr = cell.getBoundingClientRect();
            if (!cr.width || !cr.height) return;
            const rects = [];
            for (const el of cell.querySelectorAll('*')) {
                if (!visible(el)) continue;
                const t = ownText(el);
                if (t && /\d/.test(t)) {
                    let px = parseFloat(getComputedStyle(el).fontSize) || 0;
                    if (el instanceof SVGElement && el.getScreenCTM) { const m = el.getScreenCTM(); if (m) px *= Math.hypot(m.a, m.b); }
                    if (px) digits.push(px * 0.75);
                }
                const tag = el.tagName.toLowerCase();
                const leaf = !el.children.length || tag === 'svg' || tag === 'img' || el.hasAttribute('data-ws-slot');
                if (el.closest('svg') && tag !== 'svg') continue;
                const cs = getComputedStyle(el);
                const bordered = ['Top', 'Right', 'Bottom', 'Left'].some((s) => parseFloat(cs['border' + s + 'Width']) > 0 && cs['border' + s + 'Style'] !== 'none');
                if (!leaf && !t && !bordered) continue;
                const r = el.getBoundingClientRect();
                if (!r.width && !r.height) continue;
                rects.push(r);
            }
            const gap = (lo, hi, spans) => {
                const s = spans.map(([a, b]) => [Math.max(lo, a), Math.min(hi, b)]).filter(([a, b]) => b > a).sort((x, y) => x[0] - y[0]);
                let at = lo, best = 0;
                for (const [a, b] of s) { if (a > at) best = Math.max(best, a - at); at = Math.max(at, b); }
                return Math.max(best, hi - at);
            };
            // the cell's own border does not count as content
            const inner = rects.filter((r) => !(Math.abs(r.top - cr.top) < 1 && Math.abs(r.bottom - cr.bottom) < 1 && Math.abs(r.left - cr.left) < 1 && Math.abs(r.right - cr.right) < 1));
            const h = gap(cr.top, cr.bottom, inner.map((r) => [r.top, r.bottom])) / cr.height * 100;
            const w = gap(cr.left, cr.right, inner.map((r) => [r.left, r.right])) / cr.width * 100;
            if (h > band.hPct) band = { hPct: r1(h), wPct: band.wPct, cell: ci + 1 };
            if (w > band.wPct) band.wPct = r1(w);
        });
        const slotSizes = [];
        pg.querySelectorAll('[data-ws-slot]').forEach((s) => {
            if (!visible(s) || s.getAttribute('data-ws-graded') === '0') return;
            const r = s.getBoundingClientRect();
            if (r.width && r.height) slotSizes.push([r1(r.width * PX_MM), r1(r.height * PX_MM)]);
        });
        const count = new Map();
        for (const [w, h] of slotSizes) { const k = `${Math.round(w)}x${Math.round(h)}`; count.set(k, (count.get(k) || 0) + 1); }
        const body = pg.querySelector('.ws-body') || pg;
        const br = body.getBoundingClientRect();
        let bottom = br.top;
        for (const c of cells) bottom = Math.max(bottom, c.getBoundingClientRect().bottom);
        out.push({
            cells: cells.length,
            digitPt: digits.length ? { max: r1(Math.max(...digits)), median: r1(median(digits)), min: r1(Math.min(...digits)) } : null,
            slots: { n: slotSizes.length, minMm: slotSizes.length ? [Math.min(...slotSizes.map((s) => s[0])), Math.min(...slotSizes.map((s) => s[1]))] : null, sizes: [...count.entries()].sort((a, b) => b[1] - a[1]).slice(0, 4).map(([k, n]) => `${k} mm ×${n}`) },
            band,
            footPct: br.height ? r1(Math.max(0, br.bottom - bottom) / br.height * 100) : null,
        });
    });
    return out;
}

/**
 * Does a page's recorded score still stand?
 *   ctx = {ruleSet: current rule-set version, round: current round, maxAge: 2}
 * Returns {state: 'scored'|'ungraded'|'changed'|'stale', why}
 */
function scoreStatus(page, ctx) {
    const s = page.scoreSource;
    if (!page.scores || !s) return { state: 'ungraded', why: 'no recorded score' };
    if (s.contentHash && s.contentHash !== page.contentHash) return { state: 'changed', why: 'content changed since it was graded' };
    if (s.ruleSet !== ctx.ruleSet) return { state: 'stale', why: `rule set changed (${s.ruleSet} -> ${ctx.ruleSet})` };
    const age = Number(ctx.round) - Number(s.round);
    if (Number.isFinite(age) && age > (ctx.maxAge ?? 2)) return { state: 'stale', why: `score is ${age} rounds old (round ${s.round}, now ${ctx.round})` };
    return { state: 'scored', why: `${s.run} round ${s.round}` };
}

const minScore = (sc) => (sc ? Math.min(...['C1', 'C2', 'C3', 'C4'].map((k) => Number(sc[k]))) : null);

/** Deterministic pick of ~pct % of `items` (stable for a seed). */
function seededSample(items, pct, seed) {
    let a = (seed >>> 0) || 1;
    const rnd = () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const idx = items.map((x, i) => [rnd(), i]).sort((p, q) => p[0] - q[0]);
    const n = items.length ? Math.max(1, Math.round(items.length * pct / 100)) : 0;
    return new Set(idx.slice(0, n).map(([, i]) => items[i]));
}

/**
 * Match one critic grade record (design/audit/runs/<run>/grades.jsonl) to manifest pages.
 * Accepted shapes (all seen in past runs):
 *   {"page": "<manifest page id>", "scores": {...}}                         exact
 *   {"skill": "c:s", "kind"|"surface": "print", "version": "independent@M" | "independent-M" | "independent",
 *    "size": "M", "page": "pupil"|"key"}                                    every page of that version
 *   {"skill": "c:s", "kind"|"surface": "screen", "version": "card-1280" | "worksheet-1280" | "quiz-1280"}
 * An optional "opts" object narrows an envelope page set to that option set.
 */
function matchGrade(rec, pages) {
    if (rec.page && pages.some((p) => p.id === rec.page)) return pages.filter((p) => p.id === rec.page);
    if (!rec.skill) return [];
    const kind = rec.kind || rec.surface || (/^(card|worksheet|quiz)-\d+/.test(String(rec.version || '')) ? 'screen' : 'print');
    const own = pages.filter((p) => p.skill === rec.skill);
    if (kind === 'screen') {
        const m = String(rec.version || '').match(/^(card|worksheet|quiz)-(\d+)/);
        const host = rec.host || (m && m[1]);
        const width = Number(rec.width || (m && m[2]));
        return own.filter((p) => p.kind === 'screen' && (!host || p.host === host) && (!width || p.width === width));
    }
    const v = String(rec.version || '');
    const m = v.match(/^([a-z][a-z-]*?)(-key)?(?:[@-]([SML]))?$/);
    if (!m) return [];
    const role = m[1];
    const size = rec.size || m[3] || null;
    const part = m[2] ? 'key' : (rec.page === 'key' || rec.page === 'pupil' ? rec.page : null);
    const optsKey = rec.opts ? contentHash(JSON.stringify(rec.opts)).slice(0, 8) : null;
    return own.filter((p) => p.kind === 'print' && p.role === role && (!size || p.size === size) && (!part || p.part === part) && (!optsKey || p.optsKey === optsKey));
}

module.exports = { REPO, RULE_SET_FILES, ruleSetVersion, contentHash, canonicalPagesInPage, canonicalHostInPage, measurePagesInPage, scoreStatus, minScore, seededSample, matchGrade };
