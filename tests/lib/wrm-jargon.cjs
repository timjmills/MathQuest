// wrm-jargon.cjs — the ONE strict jargon pattern for every teacher-facing line of the White Rose page,
// "Skills to be made" and the MAP task notes (critic r2 M1, r3 M1, r4 M3/M4/m7). Shared by
// ws-wrm-page-unit.mjs (every line of the real link files, in Node) and ws-teacher-wrm.cjs (the
// rendered screens and the print). A hit is a line a teacher would read as code.
'use strict';

const JARGON = [
    ['step id', /\b(?:R|Y\d)\.B\d/],
    ['bare step S', /(^|[^.\w])S\d{1,2}\b/],
    ['bare block B', /(^|[^.\w])B\d{1,2}\b/],
    ['option band', /\bbands?:? ?\d/i],
    ['option id', /\b(?:forms|parts|span|tiles|denoms|power|decimals|mode|pool)\s*[:=]?\s*(?:\d|"|\[)|\b(?:unknown|objects|response|support|level|task|form)\s*[:=]\s*["'[\d]/],
    ['year code', /\bY[1-6]\b|\bY\d\//],
    ['week code', /\bW\d\d\b|\bwk\b/],
    ['braces', /[{}[\]`]/],
    ['snake_case', /\b[a-z]+_[a-z0-9_]+\b/],
    ['skill key', /\b[a-z]{3,}:[a-z_]{3,}\b/],
    ['grade code', /\bGr\.|\bG[1-6K]\b/],
    ['rule N', /\brule \d/i],
    ['leading punctuation', /^\s*[/:;,]/],
    ['stray colon', /(^|[(;,—]|\band|\bor)\s*:(?!\s*\d)/],
    ['file name', /\.(?:md|js|json|cjs|mjs)\b/],
    ['enum list', /'[a-z-]+' \|/],
    ['CONST_NAME', /\b[A-Z]{3,}_[A-Z]/],
    ['opts', /\bopts\b/],
    ['broken', /undefined|NaN|\[object/],
    ['empty parens', /\(\s*\)/],
    ['dangling', /\s[,;]\s|\(\s*[,;:]/],
    ['repeated grade', /\b(?<g>Pre-K|Kindergarten|Grade \d)\s*:?\s*\/\s*\k<g>\b/],
];

/** The first jargon form in `text`, as { name, at, snippet }, or null. */
function jargonHit(text) {
    const t = String(text || '');
    for (const [name, re] of JARGON) {
        const m = re.exec(t);
        if (m) return { name, at: m.index, snippet: t.slice(Math.max(0, m.index - 50), m.index + 40).replace(/\s+/g, ' ') };
    }
    return null;
}

module.exports = { JARGON, jargonHit };
