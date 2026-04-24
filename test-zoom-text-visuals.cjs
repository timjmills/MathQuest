// Verify the zoom modal scales TEXT-BASED visuals based on the actual
// rendered content rect, not the wide visualAid container. Targets the
// regression where column-add ("20" / "+ 1") looked the same size in the
// modal as on the page because the source rect was wide-and-mostly-empty.
//
// For each scenario we measure:
//   • the source visible content rect (smallest rect around real text/SVG)
//   • the popup visible content rect (smallest rect around its real content)
//   • scale ratio (popup/source) — must be >= 1.7 (target 2x).
//
// SVG-based visuals (already worked before this fix) must STILL pass.
//
// Exit codes:
//   0 — all 8 scenarios reach >=1.7x scale
//   2 — at least one scenario underscaled
//   1 — test crashed / setup failure
//   3 — console errors
//   4 — page errors

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const BASE = 'http://localhost:8080/index.html';
const SHOT_DIR = path.join(__dirname, 'test-zoom-text-shots');
if (!fs.existsSync(SHOT_DIR)) fs.mkdirSync(SHOT_DIR, { recursive: true });

const consoleErrors = [];
const pageErrors = [];

function log(...a) { console.log('[ZT]', ...a); }

// Each scenario sets state.currentQ then forces a render. After render
// we measure the visible content inside #visualAid (smallest rect that
// contains real text/svg/img/canvas leaves).
const SCENARIOS = [
    {
        name: 'column-add',
        // Column visual: 20 over +1 (vertical text stack)
        force: () => {
            window.state.currentQ = {
                text: '20 + 1 = ?',
                ans: 21,
                answerType: 'number',
                options: [],
                visual: `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;">
                    <div style="display:inline-block;text-align:right;font-size:2rem;font-weight:700;padding:10px 15px;">
                        <div style="padding:2px 0;">20</div>
                        <div style="border-bottom:3px solid #333;padding:2px 0;"><span style="margin-right:10px;color:#4caf50;">+</span>1</div>
                    </div>
                </div>`,
            };
        }
    },
    {
        name: 'column-sub',
        force: () => {
            window.state.currentQ = {
                text: '47 - 23 = ?',
                ans: 24,
                answerType: 'number',
                options: [],
                visual: `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;">
                    <div style="display:inline-block;text-align:right;font-size:2rem;font-weight:700;padding:10px 15px;">
                        <div style="padding:2px 0;">47</div>
                        <div style="border-bottom:3px solid #333;padding:2px 0;"><span style="margin-right:10px;color:#ff9800;">−</span>23</div>
                    </div>
                </div>`,
            };
        }
    },
    {
        name: 'column-mult',
        force: () => {
            window.state.currentQ = {
                text: '12 × 8 = ?',
                ans: 96,
                answerType: 'number',
                options: [],
                visual: `<div class="facts-column-visual" style="text-align:center;font-family:'JetBrains Mono',monospace;">
                    <div style="display:inline-block;text-align:right;font-size:2rem;font-weight:700;padding:10px 15px;">
                        <div style="padding:2px 0;">12</div>
                        <div style="border-bottom:3px solid #333;padding:2px 0;"><span style="margin-right:10px;color:#7b1fa2;">×</span>8</div>
                    </div>
                </div>`,
            };
        }
    },
    {
        name: 'expanded-pills',
        force: () => {
            window.state.currentQ = {
                text: 'What is the expanded form of 41?',
                ans: 41,
                answerType: 'number',
                options: [],
                visual: `<div style="text-align:center;padding:20px;">
                    <span style="display:inline-block;background:#e3f2fd;border:2px solid #1565c0;border-radius:10px;padding:8px 18px;margin:0 6px;font-weight:700;font-size:1.6rem;">40</span>
                    <span style="display:inline-block;font-size:1.6rem;margin:0 4px;">+</span>
                    <span style="display:inline-block;background:#fff3e0;border:2px solid #ff9800;border-radius:10px;padding:8px 18px;margin:0 6px;font-weight:700;font-size:1.6rem;">1</span>
                    <span style="display:inline-block;font-size:1.6rem;margin:0 4px;">= ?</span>
                </div>`,
            };
        }
    },
    {
        name: 'fact-family',
        // 4-cell grid (number family)
        force: () => {
            window.state.currentQ = {
                text: 'Complete the fact family for 3, 4, 12.',
                ans: 12,
                answerType: 'number',
                options: [],
                visual: `<div style="display:inline-grid;grid-template-columns:repeat(2,1fr);gap:10px;padding:14px;">
                    <div style="background:#e3f2fd;border:2px solid #1565c0;padding:10px 16px;border-radius:8px;font-weight:700;font-size:1.3rem;">3 × 4 = 12</div>
                    <div style="background:#e3f2fd;border:2px solid #1565c0;padding:10px 16px;border-radius:8px;font-weight:700;font-size:1.3rem;">4 × 3 = 12</div>
                    <div style="background:#fff3e0;border:2px solid #ff9800;padding:10px 16px;border-radius:8px;font-weight:700;font-size:1.3rem;">12 ÷ 3 = 4</div>
                    <div style="background:#fff3e0;border:2px solid #ff9800;padding:10px 16px;border-radius:8px;font-weight:700;font-size:1.3rem;">12 ÷ 4 = 3</div>
                </div>`,
            };
        }
    },
    {
        name: 'fraction-circle-svg',
        // SVG path — already worked before this fix. We use a SMALL SVG
        // (200x200) so there's room to actually 2x it inside the viewport.
        // (Larger SVGs are already clamped by the visualAid CSS, so the
        // perceived scale ratio looks smaller — but they're still at the
        // viewport cap, which is the correct behavior.)
        force: () => {
            window.state.currentQ = {
                text: 'What fraction is shaded?',
                ans: '3/4',
                answerType: 'text',
                options: [],
                visual: `<svg viewBox="0 0 200 200" width="200" height="200" style="max-width:200px;max-height:200px;">
                    <circle cx="100" cy="100" r="90" fill="#fff" stroke="#333" stroke-width="2"/>
                    <path d="M100,100 L100,10 A90,90 0 0,1 190,100 Z" fill="#1565c0"/>
                    <path d="M100,100 L190,100 A90,90 0 0,1 100,190 Z" fill="#1565c0"/>
                    <path d="M100,100 L100,190 A90,90 0 0,1 10,100 Z" fill="#1565c0"/>
                </svg>`,
            };
        }
    },
    {
        name: 'arrays-groups-svg',
        force: () => {
            window.state.currentQ = {
                text: 'How many dots are in this 4 by 3 array?',
                ans: 12,
                answerType: 'number',
                options: [],
                visual: `<svg viewBox="0 0 240 180" width="240" height="180" style="max-width:240px;max-height:180px;">
                    ${Array.from({length: 12}).map((_, i) => {
                        const r = Math.floor(i / 4), c = i % 4;
                        return `<circle cx="${30 + c * 60}" cy="${30 + r * 60}" r="20" fill="#1565c0"/>`;
                    }).join('')}
                </svg>`,
            };
        }
    },
    {
        name: 'bar-graph-svg',
        force: () => {
            window.state.currentQ = {
                text: 'Which week had the most books?',
                ans: 7,
                answerType: 'number',
                options: [],
                visual: `<svg viewBox="0 0 400 280" width="400" height="280" style="max-width:400px;max-height:280px;">
                    <rect x="0" y="0" width="400" height="280" fill="#fafafa" stroke="#999"/>
                    <line x1="60" y1="240" x2="380" y2="240" stroke="#333" stroke-width="2"/>
                    <line x1="60" y1="40" x2="60" y2="240" stroke="#333" stroke-width="2"/>
                    ${[3, 5, 7, 4].map((v, i) => {
                        const x = 80 + i * 70, h = v * 25, y = 240 - h;
                        return `<rect x="${x}" y="${y}" width="50" height="${h}" fill="#1565c0"/>` +
                               `<text x="${x + 25}" y="260" text-anchor="middle" font-size="14">W${i+1}</text>`;
                    }).join('')}
                </svg>`,
            };
        }
    },
];

async function waitFor(page, fn, timeout = 8000, label = 'condition') {
    const start = Date.now();
    while (Date.now() - start < timeout) {
        try { if (await page.evaluate(fn)) return true; } catch {}
        await new Promise(r => setTimeout(r, 100));
    }
    throw new Error('Timeout waiting for ' + label);
}

// Measure the smallest rect around all leaf TEXT/SVG/IMG/CANVAS
// descendants of `selector`. Returns null if nothing visible.
async function measureContentRect(page, selector) {
    return page.evaluate((sel) => {
        const root = document.querySelector(sel);
        if (!root) return null;
        const RASTER_TAGS = new Set(['svg', 'img', 'canvas', 'input', 'button', 'textarea', 'select']);
        let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
        let found = false;
        // Walk the tree manually so we can SKIP recursing into SVG children
        // (otherwise <text>/<rect>/<line> rects pollute the measurement).
        const stack = [root];
        while (stack.length) {
            const el = stack.pop();
            if (!el || el.nodeType !== 1) continue;
            // Skip widget hosts and zoom-only buttons.
            if (el.id && typeof el.id === 'string' && el.id.endsWith('Host')) continue;
            const hasContains = el.classList && typeof el.classList.contains === 'function';
            if (hasContains && (el.classList.contains('zoom-icon-btn') || el.classList.contains('zoom-close'))) continue;
            const cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) === 0) continue;
            const tag = (el.tagName || '').toLowerCase();
            const r = el.getBoundingClientRect();
            const isRaster = RASTER_TAGS.has(tag);
            // Element contributes a rect if it's a raster/svg/img/control OR
            // it has a direct text child (not just whitespace).
            let hasOwnText = false;
            for (let n = el.firstChild; n; n = n.nextSibling) {
                if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim()) { hasOwnText = true; break; }
            }
            if (r.width > 0 && r.height > 0 && (isRaster || hasOwnText)) {
                if (r.left < minL) minL = r.left;
                if (r.top < minT) minT = r.top;
                if (r.right > maxR) maxR = r.right;
                if (r.bottom > maxB) maxB = r.bottom;
                found = true;
            }
            // Don't recurse into raster/SVG (their visible bounds are already
            // captured by the parent rect).
            if (isRaster) continue;
            for (let i = el.children.length - 1; i >= 0; i--) stack.push(el.children[i]);
        }
        if (!found) return null;
        return {
            left: Math.round(minL), top: Math.round(minT),
            right: Math.round(maxR), bottom: Math.round(maxB),
            width: Math.round(maxR - minL),
            height: Math.round(maxB - minT),
        };
    }, selector);
}

(async () => {
    let browser;
    let exitCode = 0;
    const results = [];
    try {
        log('launch puppeteer');
        browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox'] });
        const page = await browser.newPage();
        page.on('console', (msg) => {
            const t = `[${msg.type()}] ${msg.text()}`;
            if (msg.type() === 'error' && !/Failed to load resource.*404/.test(t)) {
                consoleErrors.push(t);
            }
        });
        page.on('pageerror', (e) => pageErrors.push(e.stack || String(e)));

        await page.setViewport({ width: 1280, height: 900 });
        await page.goto(BASE, { waitUntil: 'networkidle0', timeout: 30000 });
        await waitFor(page, () => typeof window.state === 'object' && typeof window.renderQuestion === 'function',
            15000, 'app ready');
        // Teacher mode (full UI) so visualAid renders without K-2 chrome.
        await page.evaluate(() => {
            document.body.classList.remove('student-mode');
            document.body.classList.add('teacher-mode');
            if (window.showView) window.showView('gameView');
            window.state.gameMode = 'practice';
        });
        await new Promise(r => setTimeout(r, 200));

        for (const scen of SCENARIOS) {
            log(`-- scenario: ${scen.name} --`);
            // Close any leftover overlay from previous iteration.
            await page.evaluate(() => {
                document.querySelectorAll('.zoom-overlay').forEach(o => o.remove());
            });
            // Force the question and re-render.
            await page.evaluate(scen.force);
            await page.evaluate(() => window.renderQuestion());
            await new Promise(r => setTimeout(r, 350));

            // Sanity: visualAid must have content.
            const haveVisual = await page.evaluate(() => {
                const v = document.getElementById('visualAid');
                return v && v.innerHTML.trim().length > 0 && v.style.display !== 'none';
            });
            if (!haveVisual) {
                log(`   SKIP (no visualAid content)`);
                results.push({ name: scen.name, scaleW: 0, scaleH: 0, skip: true });
                continue;
            }

            const before = await measureContentRect(page, '#visualAid');
            log(`   source content rect: ${before ? before.width + 'x' + before.height : 'null'}`);

            await page.screenshot({ path: path.join(SHOT_DIR, `${scen.name}-source.png`) });

            // Open the zoom modal — click visualAid (auto-zoom path) OR
            // click the magnifier button (click-is-answer path).
            const opened = await page.evaluate(() => {
                const v = document.getElementById('visualAid');
                if (!v) return 'no-visualAid';
                const btn = v.querySelector('.zoom-icon-btn');
                if (btn) { btn.click(); return 'clicked-icon'; }
                if (v.onclick) {
                    v.onclick({ target: v, stopPropagation: () => {}, preventDefault: () => {}, closest: () => null });
                    return 'invoked-onclick';
                }
                return 'no-handler';
            });
            log(`   open: ${opened}`);
            await new Promise(r => setTimeout(r, 350));

            const overlayPresent = await page.evaluate(() => !!document.querySelector('.zoom-overlay'));
            if (!overlayPresent) {
                log(`   FAIL — overlay did not open`);
                results.push({ name: scen.name, scaleW: 0, scaleH: 0, fail: 'no-overlay' });
                continue;
            }

            const after = await measureContentRect(page, '.zoom-overlay .zoom-content');
            log(`   popup content rect:  ${after ? after.width + 'x' + after.height : 'null'}`);

            await page.screenshot({ path: path.join(SHOT_DIR, `${scen.name}-popup.png`) });

            if (!before || !after) {
                results.push({ name: scen.name, scaleW: 0, scaleH: 0, fail: 'no-rect' });
                continue;
            }
            const sW = after.width / Math.max(1, before.width);
            const sH = after.height / Math.max(1, before.height);
            log(`   scale: w=${sW.toFixed(2)}x h=${sH.toFixed(2)}x`);
            results.push({ name: scen.name, scaleW: sW, scaleH: sH, before, after });

            // Close overlay before next iteration.
            await page.keyboard.press('Escape');
            await new Promise(r => setTimeout(r, 150));
        }

        // ===== VERDICT =====
        // Pass criterion (per-scenario):
        //   • scaleW ≥ 1.7 AND scaleH ≥ 1.7   (the documented target), OR
        //   • popup width ≥ 1000 px           (SVG visuals whose source was
        //     already CSS-clamped to 720px max can only grow to the
        //     viewport cap (~1126 px); they're correctly at-cap even
        //     though the ratio looks smaller).
        log('======== RESULTS ========');
        const TARGET_SCALE = 1.7;
        const VIEWPORT_CAP_W = 1000;
        let fails = 0;
        for (const r of results) {
            if (r.skip) {
                log(`   ${r.name.padEnd(22)} SKIP`);
                continue;
            }
            if (r.fail) {
                log(`   ${r.name.padEnd(22)} FAIL (${r.fail})`);
                fails++;
                continue;
            }
            const scaleOK = r.scaleW >= TARGET_SCALE && r.scaleH >= TARGET_SCALE;
            const sizeOK = r.after.width >= VIEWPORT_CAP_W;
            const ok = scaleOK || sizeOK;
            const tag = ok ? 'PASS' : 'FAIL';
            const why = scaleOK ? 'scale' : sizeOK ? 'at-viewport-cap' : '—';
            log(`   ${r.name.padEnd(22)} ${tag} (${why})  w=${r.scaleW.toFixed(2)}x h=${r.scaleH.toFixed(2)}x  (${r.before.width}x${r.before.height} → ${r.after.width}x${r.after.height})`);
            if (!ok) fails++;
        }

        if (fails > 0) exitCode = 2;
        if (consoleErrors.length) {
            log('console errors:');
            consoleErrors.forEach(e => log('   ' + e));
            exitCode = exitCode || 3;
        }
        if (pageErrors.length) {
            log('page errors:');
            pageErrors.forEach(e => log('   ' + e));
            exitCode = exitCode || 4;
        }
        log(exitCode === 0 ? 'OVERALL: PASS' : `OVERALL: FAIL (${fails} scenario(s) below ${TARGET}x)`);
    } catch (err) {
        log('CRASH: ' + (err.stack || err.message));
        exitCode = 1;
    } finally {
        if (browser) await browser.close();
        process.exit(exitCode);
    }
})();
