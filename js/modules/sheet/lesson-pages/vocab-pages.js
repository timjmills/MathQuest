// js/modules/sheet/lesson-pages/vocab-pages.js
// LESSON PART "vocab-page": THE VOCABULARY PAGE THAT OPENS A LESSON (owner design 2026-10-25;
// design/cards/vocabulary/vocabulary.md §2, §7a; lane lf-vocab 2026-11-07). Registered as a part
// (lessons-phase0 decision D2: a part is a plug-in, roles/lesson.js is not edited); the lesson
// role's partPlan() frames it (title, tab "Vocabulary", tags) and calls `plan` below.
//
// One page, the lesson's six words (vocab-words.js VOCAB_SETS, the set the lesson record names in
// `vocabSet`), drawn from the SAME library pictures as the vocabulary practice skills:
//   band 1  "Match the pictures."   two Match 3 pictures cells: words 1-3, then words 4-6
//   band 2  "Name the picture."     1 picture, 3 words cells for the set's later words (the Match band's last), the
//                                   grade's count for half a page (K-1 2, grades 2-3 2, grades 4-5 4)
// Every item has its answer key (AK-1): the key page is the same plan in the answered state.
//
// A lesson whose record has no `vocabSet` prints no vocabulary page (inPacket), so every lesson
// that passed before this part existed renders byte-identical.
//
// Pure module (SCC-01).

import { planItem, gridPart, instructionText, bandMetrics, layoutHeader, rng, deriveSeed, shuffle, labelStyleOf } from '../roles/compose.js';
import { renderCell, getCell } from '../registry.js';
import '../cells/vocab-match3.js';
import '../cells/vocab-pick3.js';
import { gradeClass } from '../cells/vocab-pick3.js';
import { VOCAB_SETS, vocabSetFor, vocabSetAt, compatible } from './vocab-words.js';

/** The lesson's word set: the record's `vocabSet` (a BUILD lesson's site id or a set index), or null. */
export function lessonVocabSet(data) {
    const v = data && data.vocabSet;
    if (v === undefined || v === null || v === '') return null;
    return typeof v === 'number' || /^\d+$/.test(String(v)) ? vocabSetAt(Number(v)) : vocabSetFor(v);
}

/** Two trios of the six words that may each sit together (words 1-3 / 4-6 when they can). */
function trios(words, r) {
    const a = words.slice(0, 3), b = words.slice(3, 6);
    if (b.length === 3 && compatible(a) && compatible(b)) return [a, b];
    for (let t = 0; t < 40; t++) {
        const s = shuffle(r, words.slice());
        if (compatible(s.slice(0, 3)) && compatible(s.slice(3, 6))) return [s.slice(0, 3), s.slice(3, 6)];
    }
    return [a, b.length === 3 ? b : a];
}

/** One plan item from a kit cell (the same render draws the pupil page and the key). */
function cellItem(template, payload) {
    const cell = { template, v: 1, payload };
    const key = getCell(template).answerKey(payload);
    return { q: null, render: (c) => renderCell({ cell }, c), key, drawsAnswer: true, visual: true, cellCls: 'mq-lvcenter' };
}

/** The part's pages (lesson-pages/index.js registerLessonPart `plan`): one page. */
export function planVocabPage(input, ctx, frame) {
    const set = lessonVocabSet(input.lesson && input.lesson.data);
    if (!set) return [];
    const r = rng(deriveSeed(input.seed === undefined ? 0 : input.seed, 'vocab-page', set.lesson));
    const m = bandMetrics(ctx, layoutHeader(frame.header));
    const [t1, t2] = trios(set.words, r);
    const match = [t1, t2].map((words) => cellItem('vocab-match3', { words, order: r() < 0.5 ? [1, 2, 0] : [2, 0, 1], grade: set.grade }));
    const gc = gradeClass(set.grade);
    const nPick = gc === 2 ? 4 : 2;
    // the set's LATER words (the first are the Match band's first trio; critic r1 D16: even / odd matched, then named again)
    const pickWords = set.words.slice(-nPick).reverse();
    const pick = pickWords.map((w) => {
        const others = shuffle(r, set.words.filter((x) => x !== w && compatible([w, x])));
        let bank = [w, ...others.slice(0, 2)];
        for (let i = 0; i < others.length && !compatible(bank); i++) bank = [w, ...others.filter((_, j) => j !== i).slice(0, 2)];
        return cellItem('vocab-pick3', { word: w, bank: shuffle(r, bank), grade: set.grade });
    });
    // heights: the page body less the two band strips, shared half and half
    // (a band's label and instruction share its strip: m.strip is the whole strip, BD-3)
    const avail = m.budget - 2 * m.strip - m.gap;
    const matchH = Math.floor(Math.min(62, avail / 2 / 2) * 10) / 10;
    const pickRows = Math.ceil(nPick / 2);
    const pickH = Math.floor(((avail - 2 * matchH) / pickRows) * 10) / 10;
    let start = 1;
    const g1 = gridPart(match.map((it) => planItem(it, { cols: 1 })), { cols: 1, rows: 2, cellH: matchH, labels: labelStyleOf(ctx.look, input.labels), start });
    start += match.length;
    const g2 = gridPart(pick.map((it) => planItem(it, { cols: 2 })), { cols: 2, rows: pickRows, cellH: pickH, labels: labelStyleOf(ctx.look, input.labels), start });
    return [{
        header: frame.header,
        sections: [
            { kind: 'band', label: 'Match the pictures:', instr: instructionText('vocab-letter'), content: g1 },
            { kind: 'band', label: 'Name the picture:', instr: instructionText('vocab-word'), content: g2 },
        ],
    }];
}

/** The part's registry entry (lesson-pages/index.js: `registerLessonPart(VOCAB_PAGE_PART)`). */
export const VOCAB_PAGE_PART = Object.freeze({
    id: 'vocab-page', order: 7, role: 'lesson', name: 'Vocabulary', sheet: 'lesson-vocab-page', offset: 23671,
    inPacket: (n) => !!lessonVocabSet(n && n.lessonData),
    plan: planVocabPage,
});

export default { VOCAB_PAGE_PART, planVocabPage, lessonVocabSet, VOCAB_SETS };
