// scripts/fix-fluency-commas.mjs
// Fixes missing trailing commas on lines before voice_memo_min_seconds

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, '..', 'data', 'literacy-skills', 'reading', 'fluency.js');

let src = readFileSync(FILE, 'utf8');

// Find lines immediately before voice_memo_min_seconds that don't end with a comma
// Pattern: a line ending with ] or ) or a quote, followed by newline, then voice_memo_min_seconds
src = src.replace(/(["'\])\d)])\n(\s+voice_memo_min_seconds:)/g, '$1,\n$2');

writeFileSync(FILE, src, 'utf8');
console.log('Done.');
