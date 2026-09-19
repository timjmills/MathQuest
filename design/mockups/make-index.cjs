// Writes out/index.html: the review hub for the printable mock-up pack.
//   node design/mockups/make-index.cjs
// Scans out/*.html (one file per group), reads each group's <title> and its per-page notes
// (.ws-note, one in front of each .ws-page), and lists the PDF and the PNG previews that exist.
// Safe to re-run at any time; groups that are not built yet are simply left out.
const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const OUT = path.join(DIR, 'out');
const INDEX = 'index.html';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const exists = p => { try { return fs.statSync(p).isFile(); } catch { return false; } };
const href = p => p.split('/').map(encodeURIComponent).join('/');

// Keep <b> only; every other tag goes, and any stray angle bracket is escaped.
function cleanNote(html) {
  const s = html.split(/(<\/?b\b[^>]*>)/i).map((part, k) => k % 2
    ? (part[1] === '/' ? '</b>' : '<b>')
    : part.replace(/<\/?[a-zA-Z][^>]*>/g, '').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  ).join('').replace(/\s+/g, ' ').trim();
  const open = (s.match(/<b>/g) || []).length - (s.match(/<\/b>/g) || []).length;
  return open > 0 ? s + '</b>'.repeat(open) : s;
}
const plain = s => s.replace(/<[^>]+>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').replace(/&quot;/g, '"');

// Walks the built HTML in document order; a note belongs to the next .ws-page after it.
function readPages(html) {
  const pages = [];
  const re = /<div\b[^>]*\bclass="[^"]*\bws-note\b[^"]*"[^>]*>|<section\b[^>]*\bclass="[^"]*\bws-page\b[^"]*"/g;
  let pending = '', m;
  while ((m = re.exec(html))) {
    if (m[0].startsWith('<section')) { pages.push(pending); pending = ''; continue; }
    const start = re.lastIndex;
    const div = /<(\/?)div\b[^>]*>/g;
    div.lastIndex = start;
    let depth = 1, d, end = html.length;
    while ((d = div.exec(html))) { depth += d[1] ? -1 : 1; if (!depth) { end = d.index; break; } }
    pending = cleanNote(html.slice(start, end));
    re.lastIndex = end;
  }
  return pages;
}

function pngSize(file) {
  try {
    const fd = fs.openSync(file, 'r'); const b = Buffer.alloc(24);
    fs.readSync(fd, b, 0, 24, 0); fs.closeSync(fd);
    if (b.toString('ascii', 1, 4) !== 'PNG') return null;
    return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  } catch { return null; }
}

function readGroup(file) {
  const name = file.replace(/\.html$/, '');
  const html = fs.readFileSync(path.join(OUT, file), 'utf8');
  const t = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  const notes = readPages(html);
  const pages = notes.map((note, i) => {
    const png = `png/${name}-p${i + 1}.png`;
    const has = exists(path.join(OUT, png));
    return { n: i + 1, note, png: has ? png : null, size: has ? pngSize(path.join(OUT, png)) : null };
  });
  return {
    name, file, pages,
    title: t ? plain(t[1].replace(/\s+/g, ' ').trim()) : name,
    pdf: exists(path.join(OUT, 'pdf', `${name}.pdf`)) ? `pdf/${name}.pdf` : null,
    built: fs.statSync(path.join(OUT, file)).mtime,
  };
}

const when = d => d.toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function renderGroup(g) {
  const figs = g.pages.map(p => {
    const label = `${g.title}, page ${p.n}`;
    const cap = p.note || `<span class="meta">No note for this page.</span>`;
    const dims = p.size ? ` width="${p.size.w}" height="${p.size.h}"` : '';
    const thumb = p.png
      ? `<a class="thumb" href="${href(p.png)}"><img src="${href(p.png)}" alt="${esc(label)}"${dims} loading="lazy" decoding="async"></a>`
      : `<div class="thumb none">Preview not built yet</div>`;
    return `      <figure>${thumb}<figcaption><span class="pg">p${p.n}</span> ${cap}</figcaption></figure>`;
  }).join('\n');
  return `  <section class="group" id="g-${esc(g.name)}" aria-labelledby="h-${esc(g.name)}">
    <div class="ghead">
      <div><h2 id="h-${esc(g.name)}">${esc(g.title)}</h2>
      <p class="meta">${g.pages.length} page${g.pages.length === 1 ? '' : 's'} · built ${esc(when(g.built))}</p></div>
      <p class="links">${g.pdf ? `<a class="btn primary" href="${href(g.pdf)}">PDF to print</a>` : `<span class="btn off">PDF not built yet</span>`}<a class="btn" href="${href(g.file)}">View on screen</a></p>
    </div>
${g.pages.length ? `    <div class="pages">\n${figs}\n    </div>` : `    <p class="meta">No pages in this file yet.</p>`}
  </section>`;
}

const CSS = `
:root{color-scheme:light;--ink:#1a1a1a;--soft:#555;--line:#ddd;--link:#0a4fa8}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%}
body{margin:0;background:#fff;color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
.wrap{max-width:1200px;margin:0 auto;padding:32px 24px 64px}
h1{font-size:28px;line-height:1.2;margin:0 0 4px;text-wrap:balance}
h2{font-size:20px;line-height:1.3;margin:0;text-wrap:balance}
h3{font-size:16px;margin:0 0 6px}
p{margin:0}
a{color:var(--link)}
a:focus-visible,.thumb:focus-visible{outline:2px solid var(--link);outline-offset:2px}
.count{color:var(--soft)}
.how{margin:20px 0 0;padding:16px 20px;border:1px solid var(--line);border-radius:8px;max-width:75ch}
.how p{text-wrap:pretty}
.jump{margin:24px 0 0;padding:0;list-style:none;display:flex;flex-wrap:wrap;gap:8px}
.jump a{display:block;padding:6px 12px;border:1px solid var(--line);border-radius:6px;color:var(--ink);text-decoration:none;font-size:14px}
.jump a:hover{border-color:var(--ink)}
.group{margin-top:40px;padding-top:24px;border-top:1px solid var(--line);scroll-margin-top:8px}
.ghead{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:12px 24px}
.meta{color:var(--soft);font-size:14px}
.links{display:flex;flex-wrap:wrap;gap:8px}
.btn{display:inline-block;padding:8px 14px;border:1px solid var(--ink);border-radius:6px;font-size:14px;font-weight:600;line-height:1.3;color:var(--ink);text-decoration:none;background:#fff}
.btn:hover{background:#f2f2f2}
.btn.primary{background:var(--ink);color:#fff}
.btn.primary:hover{background:#000}
.btn.off{border-color:var(--line);color:var(--soft);font-weight:400}
.btn.off:hover{background:#fff}
.pages{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:24px 20px;margin-top:20px}
figure{margin:0;min-width:0}
.thumb{display:block;border:1px solid var(--line);background:#fff}
.thumb:hover{border-color:var(--ink)}
.thumb img{display:block;width:100%;height:auto}
.thumb.none{aspect-ratio:210/297;display:grid;place-items:center;color:var(--soft);font-size:14px;text-align:center;padding:12px}
figcaption{margin-top:8px;font-size:13px;line-height:1.45;color:#333;overflow-wrap:anywhere}
figcaption b{color:var(--ink)}
.pg{display:inline-block;padding:0 5px;margin-right:2px;border:1px solid var(--line);border-radius:4px;font-size:12px;color:var(--soft)}
.empty{margin-top:32px;padding:24px;border:1px solid var(--line);border-radius:8px;max-width:75ch}
footer{margin-top:48px;padding-top:16px;border-top:1px solid var(--line);color:var(--soft);font-size:13px}
code{font:13px/1.4 ui-monospace,Consolas,monospace}
@media (max-width:480px){.wrap{padding:20px 16px 48px}h1{font-size:24px}.how{padding:14px 16px}.pages{grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:20px 12px}.links{width:100%}}
@media print{.jump,.links{display:none}.group{break-inside:avoid-page}}
`;

function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });
  const files = fs.readdirSync(OUT).filter(f => f.endsWith('.html') && f !== INDEX).sort();
  const groups = [];
  for (const f of files) {
    try { groups.push(readGroup(f)); } catch (e) { console.warn(`skipped ${f}: ${e.message}`); }
  }
  const built = new Set(groups.map(g => g.name));
  const pagesDir = path.join(DIR, 'pages');
  const waiting = fs.existsSync(pagesDir)
    ? fs.readdirSync(pagesDir).filter(f => f.endsWith('.mjs')).map(f => f.replace(/\.mjs$/, '')).filter(n => !built.has(n)).sort()
    : [];
  const pageCount = groups.reduce((n, g) => n + g.pages.length, 0);

  const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Worksheet mock-up pack — review hub</title>
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>${CSS}</style></head>
<body><div class="wrap">
  <header>
    <h1>Worksheet mock-up pack</h1>
    <p class="count">${groups.length} group${groups.length === 1 ? '' : 's'} · ${pageCount} page${pageCount === 1 ? '' : 's'} built so far${waiting.length ? ` · still to build: ${esc(waiting.join(', '))}` : ''}</p>
    <div class="how">
      <h3>How to review this pack</h3>
      <p>Print the PDFs on A4 at <b>100% (“Actual size”)</b>, not “Fit to page”, so every digit and writing space comes out at its true size. Mark the pages up with a pen as you go, and fill in the <a href="../REVIEW-CHECKLIST.md">review checklist</a> (REVIEW-CHECKLIST.md in the design/mockups folder). Then photocopy one printed page that has grey or shaded parts and check the copy: the grey, the thin lines and the dotted digits should all still be easy to see. The pictures below are only for finding your way around; judge the look from the paper, not the screen.</p>
    </div>
${groups.length > 1 ? `    <nav aria-label="Groups"><ul class="jump">\n${groups.map(g => `      <li><a href="#g-${esc(g.name)}">${esc(g.title)}</a></li>`).join('\n')}\n    </ul></nav>` : ''}
  </header>
  <main>
${groups.length ? groups.map(renderGroup).join('\n') : `  <div class="empty"><p><b>Nothing has been built yet.</b> Run <code>node design/mockups/build.cjs</code>, then run <code>node design/mockups/make-index.cjs</code> again.</p></div>`}
  </main>
  <footer>Hub written ${esc(when(new Date()))}. To refresh it after a rebuild, run <code>node design/mockups/make-index.cjs</code>.</footer>
</div></body></html>
`;
  fs.writeFileSync(path.join(OUT, INDEX), html);
  console.log(`wrote ${path.relative(process.cwd(), path.join(OUT, INDEX))}: ${groups.length} groups, ${pageCount} pages${waiting.length ? `, not built yet: ${waiting.join(', ')}` : ''}`);
}

main();
