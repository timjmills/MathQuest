#!/usr/bin/env node
// extract-ufli-content.mjs
//
// Walks Tim's Documents/Literacy Quest/Litearcy Resource Materials/UFLI_Materials/
// and extracts passage text + word lists from every Decodable + RollRead PDF
// using pdftotext. Writes structured JSON to data/literacy-content/reading/ufli/.
//
// Output layout:
//   data/literacy-content/reading/ufli/
//     index.json             — master index of all lessons + patterns
//     decodable/lesson-NN.json    — one per decodable passage
//     roll-read/lesson-NN.json    — one per roll-and-read word grid
//
// Usage: node scripts/extract-ufli-content.mjs

import { execSync } from 'node:child_process';
import { readdirSync, statSync, mkdirSync, writeFileSync, existsSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const EXEC_OPTS_LARGE = { encoding: 'utf-8', maxBuffer: 64 * 1024 * 1024 };

const UFLI_ROOT = "Tim's Documents/Literacy Quest/Litearcy Resource Materials/UFLI_Materials";
const OUT_ROOT = 'data/literacy-content/reading/ufli';

mkdirSync(path.join(OUT_ROOT, 'decodable'), { recursive: true });
mkdirSync(path.join(OUT_ROOT, 'roll-read'), { recursive: true });
mkdirSync(path.join(OUT_ROOT, 'home-practice'), { recursive: true });
mkdirSync(path.join(OUT_ROOT, 'slides'), { recursive: true });

// 7-Zip is required to extract slide XML from .pptx files.
// pptx is a ZIP archive but mingw's bundled `unzip` chokes on PowerPoint's
// non-standard end-of-central-directory layout, so we shell out to 7z.exe.
const SEVEN_ZIP_PATH = process.env.SEVEN_ZIP_PATH
    || 'C:\\Program Files\\7-Zip\\7z.exe';
const SEVEN_ZIP_AVAILABLE = (() => {
    try {
        execSync(`"${SEVEN_ZIP_PATH}" --help`, { stdio: 'ignore' });
        return true;
    } catch { return false; }
})();

const setNameToPattern = (folderName) => {
    const map = {
        'Lessons_A-J_Getting_Ready':            { pattern: 'phonological_awareness', display: 'Getting Ready (PA)' },
        'Lessons_01-34_Alphabet':               { pattern: 'alphabet',                display: 'Alphabet (letter-sound + CVC short vowels)' },
        'Lessons_35-41_Alphabet_Review':        { pattern: 'alphabet_review',         display: 'Alphabet Review + simple decoding' },
        'Lessons_42-53_Digraphs':               { pattern: 'digraphs',                display: 'Consonant Digraphs + welded sounds (-ng / -nk)' },
        'Lessons_54-62_VCe':                    { pattern: 'vce',                     display: 'VCe / Silent-e' },
        'Lessons_63-68':                        { pattern: 'consonant_y_double_l',    display: 'Final-y, Doubled consonants' },
        'Lessons_69-76':                        { pattern: 'soft_c_g_advanced',       display: 'Soft c/g, Three-letter blends' },
        'Lessons_77-83_R-Controlled_Vowels':    { pattern: 'r_controlled',            display: 'R-controlled vowels' },
        'Lessons_84-88_Long_Vowel_Teams':       { pattern: 'long_vowel_teams',        display: 'Long-vowel teams (ai, ay, ee, ea, oa, ow)' },
        'Lessons_89-94_Other_Vowel_Teams':      { pattern: 'other_vowel_teams',       display: 'Other vowel teams (oo, ou, ow, ue, ew)' },
        'Lessons_95-98_Diphthongs_Silent_Letters': { pattern: 'diphthongs_silent_letters', display: 'Diphthongs + silent letters' },
        'Lessons_99-106_Suffixes_Prefixes':     { pattern: 'morphology_basic',        display: 'Suffixes + Prefixes basic' },
        'Lessons_107-110_Suffix_Spelling_Changes': { pattern: 'morphology_advanced',  display: 'Suffix spelling changes' },
        'Lessons_111-118':                      { pattern: 'multisyllabic_basic',     display: 'Multisyllabic words basic' },
        'Lessons_119-128':                      { pattern: 'multisyllabic_advanced',  display: 'Multisyllabic words advanced' },
    };
    return map[folderName] || { pattern: 'unknown', display: folderName };
};

function lessonNumFromFile(filename) {
    // Matches: 52_Decodable_UFLIFoundations.pdf, 13_RollRead_UFLI-Foundations.pdf,
    //         54_HomePractice_UFLI-Foundations.pdf, A_GettingReadyLesson_UFLIFoundations.pptx
    const m = /^([A-J]|\d+)_/.exec(filename);
    return m ? m[1] : null;
}

function fileType(filename) {
    if (/_Decodable[_-]/i.test(filename))         return 'decodable';
    if (/_RollRead[_-]/i.test(filename))          return 'roll_read';
    if (/_HomePractice[_-]/i.test(filename))      return 'home_practice';
    if (/_Slides[_-]/i.test(filename))            return 'slides';
    if (/_GettingReadyLesson/i.test(filename))    return 'getting_ready';
    return 'other';
}

function safeExtract(pdfPath) {
    try {
        const text = execSync(`pdftotext "${pdfPath}" -`, {
            encoding: 'utf-8', stdio: ['ignore', 'pipe', 'ignore'],
            maxBuffer: 64 * 1024 * 1024,
        });
        return text;
    } catch (e) {
        return null;
    }
}

function parseRollRead(text) {
    if (!text) return null;
    // Roll and Read PDFs typically:
    //   "Roll and Read"
    //   "Lesson NN: <pattern>"
    //   <6x6 grid of words>
    //   "© 2022 University of Florida Literacy Institute"
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let lesson = null;
    let pattern = null;
    const words = [];
    for (const line of lines) {
        const lessonMatch = /Lesson\s+(\d+):\s*(.*)/i.exec(line);
        if (lessonMatch) {
            lesson = parseInt(lessonMatch[1], 10);
            pattern = lessonMatch[2].trim();
            continue;
        }
        if (/^©|University of Florida|Roll and Read/i.test(line)) continue;
        // word-grid lines: split on whitespace, keep alphabetic tokens
        const tokens = line.split(/\s+/).filter(t => /^[a-zA-Z][a-zA-Z'-]*$/.test(t));
        words.push(...tokens);
    }
    return { lesson, pattern, words };
}

function parseHomePractice(text) {
    if (!text) return null;
    // UFLI HomePractice PDFs typically contain (one set, often duplicated):
    //   "Home Practice"
    //   "New Concept and Sample Words <pattern> <word> <word> ..."
    //   "New Irregular Words <word>, <word>"
    //   "Word Work Chains"
    //   "1. <chain>  2. <chain>"
    //   "Sample Word Work Chain Script <chain>"
    //   "Sentences <sentence>. <sentence>."
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    const out = {
        sample_words: [],
        irregular_words: [],
        word_chains: [],
        sentences: [],
        pattern: null,
    };
    let mode = null;
    for (const raw of lines) {
        const line = raw;
        if (/Home Practice/i.test(line)) { mode = null; continue; }
        if (/New Concept and Sample Words/i.test(line)) {
            mode = 'sample';
            const after = line.replace(/^.*New Concept and Sample Words\s*/i, '').trim();
            // First chunk is often the pattern (e.g., "ff, ll, ss, zz"), then sample words
            const tokens = after.split(/\s+/);
            // Heuristic: collect leading comma-laden tokens as pattern, rest as sample words
            const patternTokens = [];
            const wordTokens = [];
            let inPattern = true;
            for (const t of tokens) {
                if (inPattern && /[,]/.test(t)) {
                    patternTokens.push(t.replace(/,$/, ''));
                } else {
                    inPattern = false;
                    if (/^[a-zA-Z][a-zA-Z'-]*$/.test(t)) wordTokens.push(t);
                }
            }
            if (patternTokens.length > 0) out.pattern = patternTokens.join(', ');
            out.sample_words.push(...wordTokens);
            continue;
        }
        if (/New Irregular Words/i.test(line)) {
            mode = 'irregular';
            const after = line.replace(/^.*New Irregular Words\s*/i, '').trim();
            const tokens = after.split(/[,\s]+/).map(t => t.replace(/[*\.]/g, '').trim()).filter(Boolean);
            out.irregular_words.push(...tokens.filter(t => /^[a-zA-Z'-]+$/.test(t)));
            continue;
        }
        if (/Word Work Chains/i.test(line)) { mode = 'chain'; continue; }
        if (/Sample Word Work Chain Script/i.test(line)) { mode = null; continue; }
        if (/^Sentences\s+/i.test(line)) {
            mode = 'sentence';
            const after = line.replace(/^Sentences\s+/i, '').trim();
            // Strip leading "N." numerals before splitting on sentence ends.
            const cleaned = after.replace(/(?:^|\s)\d+\.\s*/g, ' ').trim();
            const sentences = cleaned.split(/(?<=[.!?])\s+/)
                .map(s => s.trim())
                .filter(s => s && s.length > 4 && /[a-zA-Z]/.test(s));
            out.sentences.push(...sentences);
            continue;
        }
        if (mode === 'chain') {
            // Lines like "1. fell  tell  sell  spell 2. moss  toss  loss  floss"
            const chains = line.split(/\s*\d+\.\s+/).map(c => c.trim()).filter(Boolean);
            for (const c of chains) {
                const words = c.split(/\s+/).filter(w => /^[a-zA-Z'-]+$/.test(w));
                if (words.length >= 2) out.word_chains.push(words);
            }
        }
    }
    out.sample_words = Array.from(new Set(out.sample_words));
    out.irregular_words = Array.from(new Set(out.irregular_words));
    return out;
}

function parsePptxSlides(pptxPath) {
    if (!SEVEN_ZIP_AVAILABLE) return null;
    // Bulk-extract all slide XMLs to a temp dir in a single 7z call,
    // then read them via fs.  Per-slide 7z spawns are 50× slower.
    const tmpDir = path.join(tmpdir(), `ufli-pptx-${Date.now()}-${Math.floor(Math.random() * 1e6)}`);
    mkdirSync(tmpDir, { recursive: true });
    try {
        // 7-Zip exits non-zero with "Archives with Errors" on UFLI's PPTX
        // (their writer emits a non-standard end-of-central-directory marker)
        // even though the slide files extract cleanly. Swallow the throw
        // and check the temp dir afterward.
        try {
            execSync(
                `"${SEVEN_ZIP_PATH}" e -y -o"${tmpDir}" "${pptxPath}" "ppt\\slides\\slide*.xml" -x!"_rels"`,
                { stdio: ['ignore', 'ignore', 'ignore'], maxBuffer: 64 * 1024 * 1024 }
            );
        } catch {
            /* continue — readdir below tells us what landed */
        }

        const slideFiles = readdirSync(tmpDir).filter(f => /^slide\d+\.xml$/i.test(f));
        if (slideFiles.length === 0) return null;
        slideFiles.sort((a, b) => {
            const na = parseInt(/slide(\d+)\.xml/i.exec(a)?.[1] || '0', 10);
            const nb = parseInt(/slide(\d+)\.xml/i.exec(b)?.[1] || '0', 10);
            return na - nb;
        });

        const slides = [];
        for (const f of slideFiles) {
            const idx = parseInt(/slide(\d+)\.xml/i.exec(f)?.[1] || '0', 10);
            const xml = readFileSync(path.join(tmpDir, f), 'utf-8');
            const textRuns = [];
            const re = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g;
            let m;
            while ((m = re.exec(xml)) !== null) {
                const t = m[1]
                    .replace(/&amp;/g, '&').replace(/&lt;/g, '<')
                    .replace(/&gt;/g, '>').replace(/&quot;/g, '"')
                    .replace(/&apos;/g, "'");
                if (t.trim()) textRuns.push(t);
            }
            if (textRuns.length > 0) {
                slides.push({ index: idx, text: textRuns.join(' | '), runs: textRuns });
            }
        }
        return { slide_count: slideFiles.length, slides };
    } catch {
        return null;
    } finally {
        try { rmSync(tmpDir, { recursive: true, force: true }); } catch { /* ignore */ }
    }
}

function parseDecodable(text) {
    if (!text) return null;
    // Decodable PDFs typically:
    //   "Lesson NN: <pattern>"
    //   <passage paragraphs>
    //   "Heart Words: <word> <word>"
    //   "© 2022 University of Florida Literacy Institute"
    const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
    let lesson = null;
    let pattern = null;
    const heartWords = [];
    const passageLines = [];
    let inHeartWords = false;
    for (const line of lines) {
        const lessonMatch = /Lesson\s+(\d+):\s*(.*)/i.exec(line);
        if (lessonMatch) {
            lesson = parseInt(lessonMatch[1], 10);
            pattern = lessonMatch[2].trim();
            continue;
        }
        if (/Heart Words?:/i.test(line)) {
            inHeartWords = true;
            const after = line.replace(/^.*Heart Words?:\s*/i, '').trim();
            if (after) heartWords.push(...after.split(/\s+/).filter(Boolean));
            continue;
        }
        if (/^©|University of Florida|Decodable Passage|Decodable Sentences/i.test(line)) continue;
        if (inHeartWords) {
            // After "Heart Words:" header, treat remaining short lines as more heart words
            // until a blank or copyright line
            const tokens = line.split(/\s+/).filter(Boolean);
            heartWords.push(...tokens);
            continue;
        }
        passageLines.push(line);
    }
    return {
        lesson,
        pattern,
        text: passageLines.join(' '),
        paragraphs: passageLines,
        heart_words: heartWords,
        word_count: passageLines.join(' ').split(/\s+/).filter(Boolean).length,
    };
}

const index = {
    generated_at: new Date().toISOString(),
    source: UFLI_ROOT,
    sets: {},
    decodable_count: 0,
    roll_read_count: 0,
    home_practice_count: 0,
    slides_count: 0,
    other_count: 0,
};

const setFolders = readdirSync(UFLI_ROOT).filter(f => statSync(path.join(UFLI_ROOT, f)).isDirectory());

for (const setFolder of setFolders) {
    const meta = setNameToPattern(setFolder);
    const setEntry = { display: meta.display, pattern: meta.pattern, lessons: {} };
    const folderPath = path.join(UFLI_ROOT, setFolder);
    const files = readdirSync(folderPath).filter(f => /\.(pdf|pptx)$/i.test(f));
    for (const file of files) {
        const lessonNum = lessonNumFromFile(file);
        const type = fileType(file);
        const fullPath = path.join(folderPath, file);
        if (!setEntry.lessons[lessonNum]) {
            setEntry.lessons[lessonNum] = { lesson: lessonNum, files: {} };
        }
        if (type === 'decodable') {
            const text = safeExtract(fullPath);
            const parsed = parseDecodable(text);
            if (parsed && parsed.text && parsed.text.length > 20) {
                writeFileSync(
                    path.join(OUT_ROOT, 'decodable', `lesson-${lessonNum}.json`),
                    JSON.stringify({ ...parsed, source_file: file, set: setFolder }, null, 2)
                );
                setEntry.lessons[lessonNum].files.decodable = `decodable/lesson-${lessonNum}.json`;
                setEntry.lessons[lessonNum].decodable_words = parsed.word_count;
                index.decodable_count += 1;
            }
        } else if (type === 'roll_read') {
            const text = safeExtract(fullPath);
            const parsed = parseRollRead(text);
            if (parsed && parsed.words && parsed.words.length > 5) {
                writeFileSync(
                    path.join(OUT_ROOT, 'roll-read', `lesson-${lessonNum}.json`),
                    JSON.stringify({ ...parsed, source_file: file, set: setFolder }, null, 2)
                );
                setEntry.lessons[lessonNum].files.roll_read = `roll-read/lesson-${lessonNum}.json`;
                setEntry.lessons[lessonNum].roll_read_word_count = parsed.words.length;
                index.roll_read_count += 1;
            }
        } else if (type === 'home_practice') {
            const text = safeExtract(fullPath);
            const parsed = parseHomePractice(text);
            if (parsed && (parsed.sample_words.length > 0 || parsed.word_chains.length > 0 || parsed.sentences.length > 0)) {
                writeFileSync(
                    path.join(OUT_ROOT, 'home-practice', `lesson-${lessonNum}.json`),
                    JSON.stringify({ lesson: lessonNum, ...parsed, source_file: file, set: setFolder }, null, 2)
                );
                setEntry.lessons[lessonNum].files.home_practice = `home-practice/lesson-${lessonNum}.json`;
                setEntry.lessons[lessonNum].home_practice_sample_words = parsed.sample_words.length;
                setEntry.lessons[lessonNum].home_practice_chain_count = parsed.word_chains.length;
                index.home_practice_count += 1;
            }
        } else if (type === 'slides' && /\.pptx$/i.test(file)) {
            const parsed = parsePptxSlides(fullPath);
            if (parsed && parsed.slides && parsed.slides.length > 0) {
                writeFileSync(
                    path.join(OUT_ROOT, 'slides', `lesson-${lessonNum}.json`),
                    JSON.stringify({ lesson: lessonNum, ...parsed, source_file: file, set: setFolder }, null, 2)
                );
                setEntry.lessons[lessonNum].files.slides = `slides/lesson-${lessonNum}.json`;
                setEntry.lessons[lessonNum].slide_count = parsed.slide_count;
                index.slides_count += 1;
            }
        } else {
            index.other_count += 1;
        }
    }
    index.sets[setFolder] = setEntry;
}

writeFileSync(path.join(OUT_ROOT, 'index.json'), JSON.stringify(index, null, 2));

// ─── Write JS bundle for synchronous browser import ──────────────────────────
//
// Browsers without JSON-import support can't `import data from './x.json'`,
// so we emit a single JS module that exports the entire UFLI corpus as a
// frozen object tree.  gen-fluency.js can then import it synchronously.

const decodableBundle = {};
const decodableDir = path.join(OUT_ROOT, 'decodable');
for (const f of readdirSync(decodableDir)) {
    if (!f.endsWith('.json')) continue;
    const lessonKey = f.replace(/^lesson-/, '').replace(/\.json$/, '');
    const data = JSON.parse(readFileSync(path.join(decodableDir, f), 'utf-8'));
    decodableBundle[lessonKey] = data;
}

const rollReadBundle = {};
const rollReadDir = path.join(OUT_ROOT, 'roll-read');
for (const f of readdirSync(rollReadDir)) {
    if (!f.endsWith('.json')) continue;
    const lessonKey = f.replace(/^lesson-/, '').replace(/\.json$/, '');
    const data = JSON.parse(readFileSync(path.join(rollReadDir, f), 'utf-8'));
    rollReadBundle[lessonKey] = data;
}

const homePracticeBundle = {};
const hpDir = path.join(OUT_ROOT, 'home-practice');
if (existsSync(hpDir)) {
    for (const f of readdirSync(hpDir)) {
        if (!f.endsWith('.json')) continue;
        const lessonKey = f.replace(/^lesson-/, '').replace(/\.json$/, '');
        const data = JSON.parse(readFileSync(path.join(hpDir, f), 'utf-8'));
        homePracticeBundle[lessonKey] = data;
    }
}

// Slides BUNDLE keeps only the lightweight summary (count + first-slide title)
// to keep bundle.js small. Full slide payload stays as per-lesson JSON files
// for lazy-load via fetch() if a future widget needs it.
const slidesBundle = {};
const slidesDir = path.join(OUT_ROOT, 'slides');
if (existsSync(slidesDir)) {
    for (const f of readdirSync(slidesDir)) {
        if (!f.endsWith('.json')) continue;
        const lessonKey = f.replace(/^lesson-/, '').replace(/\.json$/, '');
        const data = JSON.parse(readFileSync(path.join(slidesDir, f), 'utf-8'));
        const firstSlide = (data.slides || [])[0];
        slidesBundle[lessonKey] = {
            lesson: data.lesson,
            slide_count: data.slide_count,
            set: data.set,
            title: firstSlide && firstSlide.runs && firstSlide.runs[0] ? firstSlide.runs[0] : '',
            json_path: `slides/lesson-${lessonKey}.json`,
        };
    }
}

const bundleJs = `// AUTO-GENERATED by scripts/extract-ufli-content.mjs — do not edit by hand.
// Source: ${UFLI_ROOT}
// Generated: ${index.generated_at}
//
// ${Object.keys(decodableBundle).length} decodable passages
// ${Object.keys(rollReadBundle).length} roll-and-read word lists
// ${Object.keys(homePracticeBundle).length} home-practice lessons
// ${Object.keys(slidesBundle).length} slide decks

export const UFLI_DECODABLE = Object.freeze(${JSON.stringify(decodableBundle, null, 2)});

export const UFLI_ROLL_READ = Object.freeze(${JSON.stringify(rollReadBundle, null, 2)});

export const UFLI_HOME_PRACTICE = Object.freeze(${JSON.stringify(homePracticeBundle, null, 2)});

export const UFLI_SLIDES = Object.freeze(${JSON.stringify(slidesBundle, null, 2)});

export const UFLI_INDEX = Object.freeze(${JSON.stringify(index, null, 2)});
`;

writeFileSync(path.join(OUT_ROOT, 'bundle.js'), bundleJs);

console.log(`UFLI extraction complete:`);
console.log(`  ${index.decodable_count} decodable passages`);
console.log(`  ${index.roll_read_count} roll-and-read word lists`);
console.log(`  ${index.home_practice_count} home-practice sheets`);
console.log(`  ${index.slides_count} slide decks`);
console.log(`  ${Object.keys(index.sets).length} lesson sets`);
console.log(`  7-Zip available for PPTX: ${SEVEN_ZIP_AVAILABLE}`);
console.log(`  Bundle: ${OUT_ROOT}/bundle.js (${(bundleJs.length / 1024).toFixed(1)} KB)`);
console.log(`  Output: ${OUT_ROOT}/`);
