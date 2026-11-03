#!/usr/bin/env node
/*
 * ws-ink-parity — the live mono pass (screen-cell.js monoCell, INK-1) inks the same colours as another checkout.
 *
 * Chromebook speed lane (2026-11-02): inkTree was rewritten from one-element-at-a-time (a restyle per element) to
 * batched phases. This renders the same seeded questions on the practice card in BOTH trees and compares, for every
 * element of #questionCard, the computed colour, background, border colours / styles, outline colour, fill and stroke.
 *
 *   node tests/scripts/ws-ink-parity.cjs --base /path/to/old/checkout [--every 4] [--settle 1200] [--geometry] [--skills a:b,c:d]
 * --geometry also compares every element's box, for the layout passes (wireSwipeRows' level(), the same lane).
 * Exit 1 on any difference (printed per skill). `ws-ink-parity: OK` / `FAIL`.
 */
'use strict';
const path = require('path');
const { chromium } = require('playwright');
const { startServer } = require('../lib/perf-server.cjs');

const argv = process.argv.slice(2);
const arg = (k, d = null) => { const i = argv.indexOf(k); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const BASE = arg('--base');
const NEW = path.resolve(arg('--root', path.resolve(__dirname, '..', '..')));
const EVERY = Number(arg('--every', '4'));
const SETTLE = Number(arg('--settle', '1200'));
const GEOMETRY = argv.includes('--geometry');   // also compare every element's box (rounded to 1 px): the layout passes
const ONLY_SKILLS = arg('--skills') ? arg('--skills').split(',') : null;   // cat:skill,cat:skill (else every --every-th skill)
if (!BASE) { console.error('usage: ws-ink-parity.cjs --base <old checkout>'); process.exit(2); }

async function sweep(root, skills) {
    const srv = await startServer({ root: path.resolve(root) });
    const browser = await chromium.launch({ args: ['--ignore-certificate-errors'] });
    const ctx = await browser.newContext({ ignoreHTTPSErrors: true, viewport: { width: Number(arg('--width', '1366')), height: 900 } });
    await ctx.addInitScript(() => { try { localStorage.setItem('mathquest_onboarded', '1'); } catch (e) { /* */ } });
    const page = await ctx.newPage();
    await page.goto(srv.url + '/index.html', { waitUntil: 'load' });
    await page.waitForFunction(() => window.__mqBooted || (window.generateQuestion && window.SKILLS), null, { timeout: 60000 });
    await page.waitForTimeout(1000);
    if (!skills && ONLY_SKILLS) skills = ONLY_SKILLS;
    if (!skills) {
        skills = await page.evaluate(() => {
            const out = [];
            for (const [cat, list] of Object.entries(window.SKILLS || {})) for (const s of (list || [])) if (s && s.v && !s.retired && !s.tombstone && !/^mixed_/.test(s.v)) out.push(`${cat}:${s.v}`);
            return out;
        });
        skills = skills.filter((_, i) => i % EVERY === 0);
    }
    const sigs = {};
    for (const key of skills) {
        const [categoryId, skillId] = key.split(':');
        const r = await page.evaluate(({ categoryId, skillId, seed }) => {
            let a = seed >>> 0;
            Math.random = () => { a |= 0; a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
            try {
                const st = window.state;
                st.category = categoryId; st.skill = skillId; st.range = 100; st.decimalPlaces = 0;
                st.gameMode = 'practice'; st.isMixedMode = false;
                window.showView && window.showView('gameView');
                const q = window.generateQuestion();
                st.currentQ = q;
                window.renderQuestion();
                return { ok: true };
            } catch (e) { return { err: String(e && e.message || e) }; }
        }, { categoryId, skillId, seed: [...key].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) });
        if (r.err) { sigs[key] = { err: r.err }; continue; }
        await page.waitForTimeout(SETTLE);
        sigs[key] = await page.evaluate((GEOMETRY) => {
            const card = document.getElementById('questionCard');
            if (!card) return { err: 'no card' };
            const rows = [];
            for (const el of card.querySelectorAll('*')) {
                if (el.getAnimations && el.getAnimations().length) { rows.push(el.tagName.toLowerCase() + ' (animated)'); continue; }   // the active box pulses
                const cs = getComputedStyle(el);
                const b = ['top', 'right', 'bottom', 'left'].map((s) => parseFloat(cs.getPropertyValue(`border-${s}-width`)) ? `${cs.getPropertyValue(`border-${s}-style`)} ${cs.getPropertyValue(`border-${s}-color`)}` : '-').join('|');
                rows.push(`${el.tagName.toLowerCase()}.${(typeof el.className === 'string' ? el.className : '').split(/\s+/).slice(0, 2).join('.')} c=${cs.color} bg=${cs.backgroundColor} b=${b} o=${parseFloat(cs.outlineWidth) ? cs.outlineColor : '-'}${el instanceof SVGElement ? ` f=${cs.fill} s=${cs.stroke}` : ''}${GEOMETRY ? ` @${['left', 'top', 'width', 'height'].map((k) => Math.round(el.getBoundingClientRect()[k])).join(',')}` : ''}`);
            }
            return { rows };
        }, GEOMETRY);
    }
    await browser.close();
    await srv.close();
    return { skills, sigs };
}

(async () => {
    const a = await sweep(BASE, null);
    const b = await sweep(NEW, a.skills);
    let diffs = 0, cells = 0;
    for (const key of a.skills) {
        const x = a.sigs[key], y = b.sigs[key];
        if (x.err || y.err) { if ((x.err || '') !== (y.err || '')) { diffs++; console.log(`  ${key}: error base=${x.err || '-'} new=${y.err || '-'}`); } continue; }
        if (x.rows.length) cells++;
        if (x.rows.length !== y.rows.length) { diffs++; console.log(`  ${key}: ${x.rows.length} vs ${y.rows.length} elements`); continue; }
        const bad = x.rows.map((r, i) => r === y.rows[i] ? null : `      base ${r}\n      new  ${y.rows[i]}`).filter(Boolean);
        if (bad.length) { diffs++; console.log(`  ${key}: ${bad.length} element(s) differ\n${bad.slice(0, 3).join('\n')}`); }
    }
    console.log(`ws-ink-parity: ${a.skills.length} skills, ${cells} with a kit cell, ${diffs} differing`);
    console.log(diffs ? 'ws-ink-parity: FAIL' : 'ws-ink-parity: OK');
    process.exit(diffs ? 1 : 0);
})();
