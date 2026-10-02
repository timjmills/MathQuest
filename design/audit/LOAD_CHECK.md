# Load check: can the site take more students? (MASTER_PLAN 1.10, 2026-10-02)

Site: static files on GitHub Pages (`math.cultivatingthedigital.org`). No back end, no database,
no per-pupil server call. Every pupil's data (progress, settings, sessions) is in their own browser
(cookies, localStorage, IndexedDB). So concurrent pupils cost GitHub Pages' CDN (Fastly) bandwidth
only; there is no server to saturate. Repeat the numbers with `node tests/scripts/ws-load-check.cjs`.

## Measured: cold first load of `index.html` (empty cache, local server, Chromium)

| | Requests | Raw | gzip (what Pages sends) |
|---|---|---|---|
| Our files total | 234 | 9.1 MB | about 2.3 MB |
| JS modules | 208 | 8.2 MB | about 2.1 MB |
| CSS | 25 | 755 KB | about 161 KB |
| index.html | 1 | 152 KB | about 28 KB |
| Third party (fonts, libs) | 7 | about 560 KB | (already compressed or small) |

Largest modules: `print-generate.js` 820 KB (legacy print path, only needed to print),
`gen-operations.js` 465 KB, `gen-fractions.js` 450 KB, `gen-geometry.js` 360 KB, `question-render.js` 358 KB.
Cold load to a usable app: about 1.8 to 3 s on a fast local link; a school link will be slower.
Andika (two files, 275 KB each, 550 KB) is NOT in the first load: it is fetched when the first
practice card draws, with `font-display: swap`.

Third-party at load, all static, none per-pupil:

| Resource | Used for | Size |
|---|---|---|
| fonts.googleapis.com (Manrope, Nunito, JetBrains Mono css) + fonts.gstatic.com woff2 | UI type | about 95 KB |
| cdn.jsdelivr.net lz-string 1.5.0 | share links and shared-quiz URL compression | 4.7 KB |
| cdn.jsdelivr.net html2canvas 1.4.1 | image export (teacher) | 194 KB |
| accounts.google.com/gsi/client | Google Classroom export (teacher only) | 268 KB |

## Per-pupil external calls

Measured: after load, a practice session (questions generated and drawn) made 2 requests, both to our own
origin (the Andika fonts), 0 to another origin. Source audit: the only `fetch` calls to other hosts are in
`google-classroom.js` (googleapis.com, only after a teacher signs in and exports) and
`print-generate.js` (two `force-cache` fetches of our own files). No analytics, no beacon, no XHR.
`ws-load-check.cjs` exits 1 if a practice session ever calls another origin.

## Failure modes

- Fonts (Google) down or blocked: the UI falls back to `system-ui`; `display=swap` means no invisible text.
  Worksheet and question content use self-hosted Andika, so it is unaffected.
- jsdelivr (lz-string, html2canvas) down: the app still boots (measured). Share links and shared quizzes fall
  back to a base64 encoding when `LZString` is missing (`quiz-storage.js`); a compressed `?quiz=` link from
  another browser will not decode. Image export fails.
- jsdelivr SLOW (a school filter that holds the connection open) was the real exposure. Both scripts were
  parser-blocking classic scripts in `<head>`. Measured with the CDN hanging for 8 s: app ready after
  17.3 s before, 8.3 s after the fix below (the page was held once per script, in series).
- accounts.google.com is `async`, so it never blocks. A school that blocks Google just has no Classroom export.

## Cache busting

`ws-stamp-assets` stamps `?v=<hash>` on every CSS and every module through an import map, so a deploy
reaches pupils on their next load, and unchanged files stay cached under their old hash. `--check` is stale
whenever any stamped file changes; run `node tests/scripts/ws-stamp-assets.cjs` before deploying (this lane
did NOT re-stamp, to avoid the one-line index.html conflict between lanes).

## Done in this change (small, verified)

- `defer` on the lz-string and html2canvas `<script>` tags: they no longer block parsing and still run
  before the module entry in document order. Slow-CDN time to ready 17.3 s to 8.3 s; normal load
  2.55 s to 1.80 s in the same harness.

## Recommendations (not done)

1. Biggest cost is 208 module requests. GitHub Pages serves HTTP/2 with gzip, so it is fine for a classroom of
   30 on one school link, but the first visit moves about 2.3 MB. A one-file bundle would cut requests, but the
   plan is no build step; do not bundle unless first load becomes a complaint.
2. Load `html2canvas` and the Google sign-in script only when a teacher opens an export (dynamic
   `import()` or inject on click). Saves about 460 KB on every pupil's first load and removes the two
   remaining third-party scripts from the pupil path. Needs a check of every `html2canvas(` call site.
3. `print-generate.js` (820 KB, about a third of the JS) is only needed on the print screens: dynamic-import it.
   Tied to the legacy print path deletion in the roadmap.
4. Self-host the three Google font families (about 95 KB) so a pupil never depends on Google; or drop
   Manrope if it is unused.
5. Pages sends `Cache-Control: max-age=600`. That is fine because the `?v=` stamp changes the URL on every change;
   keep the stamp step in the deploy checklist (a deploy without it leaves pupils on stale modules for up to
   10 minutes, and an import-map mismatch can mix versions).
6. If many pupils open the site at one instant (a whole school), the first load is the cost, not play. Ask
   pupils to open the page 1 minute before the lesson, or put it in a PWA/service worker later.
