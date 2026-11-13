const http = require('http'); const fs = require('fs'); const path = require('path');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs':'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf' };
function serve(ROOT){ const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split('?')[0]); if (p.endsWith('/')) p += 'index.html'; const f = path.join(ROOT, p); fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(b); }); });
 return new Promise(res=>srv.listen(0,'127.0.0.1',()=>res({srv, base:`http://127.0.0.1:${srv.address().port}`}))); }
const sleep = ms => new Promise(r => setTimeout(r, ms));
async function openPanel(page, c, s){
  await page.evaluate(() => { if (window.closeSkillOptionsPanel) window.closeSkillOptionsPanel(); });
  await page.evaluate(({ c, s }) => { if (!document.body.classList.contains('teacher-mode') && window.toggleUserRole) window.toggleUserRole(); const k = (window.SKILLS[c] || []).find(x => x.v === s); window.UnifiedSkills.clear(); window.UnifiedSkills.add({ domainId: 'x', categoryId: c, skillId: s, skillLabel: k ? k.l : s, categoryIcon: '', categoryName: c, domainColor: '#8b5cf6' }); window.UnifiedSkills._syncAllImmediate(); window.tvGo('sets'); }, { c, s });
  const sel = `.tv-opt-btn[data-key="${c}|${s}"]`; await page.waitForSelector(sel, { timeout: 10000 });
  await page.locator(sel).first().scrollIntoViewIfNeeded(); await page.locator(sel).first().click();
  await page.waitForSelector('#skillOptionsPopover'); await sleep(1500);
}
async function boot(page, base){ await page.goto(base + '/index.html'); await page.waitForFunction(() => window.UnifiedSkills && window.tvGo, null, { timeout: 30000 }); await sleep(800); }
module.exports = { serve, sleep, openPanel, boot };
