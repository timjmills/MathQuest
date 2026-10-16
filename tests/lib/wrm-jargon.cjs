// wrm-jargon.cjs — the gate's view of js/modules/plain-words.js (fix round 6: a WHITELIST, not a blacklist).
// Every teacher-facing line of the White Rose page, "Skills to be made" and the MAP task notes must be plain
// English by the SAME definition the screens use to decide whether a note is shown: every word in the plain-word
// allowlist (or a number, a standard code, an allowed acronym), balanced brackets and quotes, no fragment, no
// doubled word. Shared by ws-wrm-page-unit.mjs (every line, in Node) and ws-teacher-wrm.cjs (the rendered screens).
//   await ready()            load the ESM check once
//   jargonHit(text, opts)    { name, at, snippet } or null; opts.fragment=false for screen chrome lines
'use strict';
const path = require('path');
const { pathToFileURL } = require('url');

let P = null;
async function ready() {
    if (!P) P = await import(pathToFileURL(path.join(__dirname, '..', '..', 'js', 'modules', 'plain-words.js')).href);
    return P;
}

/** The first reason `text` is not plain, as { name, at, snippet }, or null. */
function jargonHit(text, opts) {
    if (!P) throw new Error('wrm-jargon: await ready() first');
    const r = P.plainProblem(text, opts);
    return r ? { name: r.why, at: r.at, snippet: `[${r.at}] ${String(text).replace(/\s+/g, ' ').slice(0, 110)}` } : null;
}

module.exports = { ready, jargonHit };
