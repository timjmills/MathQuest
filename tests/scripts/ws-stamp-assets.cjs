#!/usr/bin/env node
/*
 * ws-stamp-assets — cache-bust every local script and stylesheet in index.html.
 *
 * GitHub Pages serves everything with `cache-control: max-age=600` and the app has no build
 * step, so for ten minutes after a deploy a browser can run a NEW index.html against OLD cached
 * modules (or the reverse). A half-old module tree is how the teacher sidebar once showed with
 * none of its buttons wired. This stamps a content hash onto every asset URL so one index.html
 * always loads one consistent set of files:
 *
 *   - each <link rel="stylesheet" href="css/..."> gets ?v=<hash of that file>;
 *   - the entry <script type="module" src="js/globals.js"> gets ?v=<hash>;
 *   - an inline <script type="importmap" id="mq-asset-map"> maps every js/**.js URL to its
 *     ?v=<hash> twin, so static and dynamic imports between modules are versioned too.
 *
 * Only files whose content changed get a new URL, so a deploy re-downloads only what changed.
 *
 *   node tests/scripts/ws-stamp-assets.cjs           # rewrite index.html
 *   node tests/scripts/ws-stamp-assets.cjs --check   # exit 1 if index.html is stale (run before deploy)
 */
'use strict';
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const INDEX = path.join(ROOT, 'index.html');
const CHECK = process.argv.includes('--check');

const hashOf = (rel) => crypto.createHash('sha1').update(fs.readFileSync(path.join(ROOT, rel))).digest('hex').slice(0, 10);

function walk(dir, out = []) {
    for (const e of fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true })) {
        const rel = `${dir}/${e.name}`;
        if (e.isDirectory()) walk(rel, out);
        else if (e.name.endsWith('.js')) out.push(rel);
    }
    return out;
}

const src = fs.readFileSync(INDEX, 'utf8');
let html = src;

// Stylesheets: href="css/x.css" or href="css/x.css?v=old".
html = html.replace(/(<link\b[^>]*\bhref=")(css\/[^"?]+\.css)(?:\?v=[0-9a-f]+)?(")/g,
    (m, a, rel, b) => fs.existsSync(path.join(ROOT, rel)) ? `${a}${rel}?v=${hashOf(rel)}${b}` : m);

// The module tree.
const modules = walk('js').sort();
const imports = {};
for (const rel of modules) imports[`./${rel}`] = `./${rel}?v=${hashOf(rel)}`;
const mapTag = `<script type="importmap" id="mq-asset-map">${JSON.stringify({ imports })}</script>`;

// The entry script's src must equal the map's target so the module is not loaded twice.
html = html.replace(/(<script type="module" src=")js\/globals\.js(?:\?v=[0-9a-f]+)?(")/,
    `$1js/globals.js?v=${hashOf('js/globals.js')}$2`);

if (/<script type="importmap" id="mq-asset-map">[\s\S]*?<\/script>/.test(html)) {
    html = html.replace(/<script type="importmap" id="mq-asset-map">[\s\S]*?<\/script>/, mapTag);
} else {
    // An import map must come before the first module script; put it at the end of <head>.
    html = html.replace(/<\/head>/, `    ${mapTag}\n</head>`);
}

if (!/js\/globals\.js\?v=/.test(html) || !html.includes('id="mq-asset-map"')) {
    console.error('ws-stamp-assets: FAIL (could not find the entry script or </head> in index.html)');
    process.exit(1);
}

if (CHECK) {
    if (html !== src) {
        console.error('ws-stamp-assets: FAIL (index.html is stale; run node tests/scripts/ws-stamp-assets.cjs)');
        process.exit(1);
    }
    console.log(`ws-stamp-assets: OK (${modules.length} modules and every stylesheet stamped)`);
} else {
    if (html !== src) fs.writeFileSync(INDEX, html);
    console.log(`ws-stamp-assets: ${html !== src ? 'stamped' : 'already current'} (${modules.length} modules)`);
}
