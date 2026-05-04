// scripts/add-voice-memo.mjs
// Inserts voice_memo_min_seconds into fluency atoms.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';
const __dirname = dirname(fileURLToPath(import.meta.url));
const FILE = join(__dirname, '..', 'data', 'literacy-skills', 'reading', 'fluency.js');

const VOICE_MEMO_MAP = new Map([
    // LNF / LSF / PSF / NWF: 5 seconds
    ['reading_fluency_lnf',                5],
    ['reading_fluency_lsf',                5],
    ['reading_fluency_psf',                5],
    ['reading_fluency_nwf',                5],
    // ORF passages by grade: 25 seconds
    ['reading_fluency_orf_grade2',         25],
    ['reading_fluency_orf_grade3',         25],
    ['reading_fluency_orf_grade4',         25],
    ['reading_fluency_orf_grade5',         25],
    ['reading_fluency_orf_grade6',         25],
    // Prosody: 10 seconds
    ['reading_fluency_prosody_phrasing',   10],
    ['reading_fluency_prosody_pause',      10],
    ['reading_fluency_prosody_intonation', 10],
    // Fluency routines
    ['reading_fluency_repeated_reading',   25],
    ['reading_fluency_paired_reading',     25],
    ['reading_fluency_choral_reading',     10],
    ['reading_fluency_phrase_cued',        10],
    ['reading_fluency_readers_theater',    25],
    // Sight word phrase: 5 seconds (single phrase read aloud)
    ['reading_fluency_sight_word_phrase',  5],
]);

let src = readFileSync(FILE, 'utf8');
let changed = 0;
let skipped = 0;
let notFound = [];

for (const [skillId, minSecs] of VOICE_MEMO_MAP) {
    const idStr = `skill_id: "${skillId}"`;
    let idPos = src.indexOf(idStr);
    if (idPos === -1) {
        // Try single quotes
        idPos = src.indexOf(`skill_id: '${skillId}'`);
    }
    if (idPos === -1) {
        notFound.push(skillId);
        continue;
    }

    // Find end of this atom
    const atomEnd = src.indexOf('\n    },', idPos);
    if (atomEnd === -1) {
        notFound.push(skillId + ' (no end)');
        continue;
    }

    const atomSrc = src.slice(idPos, atomEnd);
    if (atomSrc.includes('voice_memo_min_seconds:')) {
        skipped++;
        continue;
    }

    const insertion = `\n        voice_memo_min_seconds: ${minSecs},`;
    src = src.slice(0, atomEnd) + insertion + src.slice(atomEnd);
    changed++;
}

writeFileSync(FILE, src, 'utf8');
console.log(`Done. Added voice_memo_min_seconds to ${changed} atoms; ${skipped} already had it.`);
if (notFound.length) console.warn('Not found:', notFound.join(', '));
