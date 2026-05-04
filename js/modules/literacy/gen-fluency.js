// gen-fluency.js — Question generator for the Fluency strand.
//
// Produces Question objects for:
//   - reading_fluency_roll_and_read_*  (UFLI roll-and-read word grids)
//   - reading_fluency_decodable_passage_*  (UFLI decodable passages)
//
// Falls back to the coming-soon sentinel for fluency atoms whose content
// strategy is not yet implemented (LNF/LSF/PSF/NWF/ORF probes).
//
// Public API:
//   generateFluencyQuestion(skillAtom, mechanicHint?, options?) → Question
//   buildFluencyDeck(skillAtom, count?, options?)               → Question[]

import {
    getDecodablePassagesForSet,
    getRollReadWordsForSet,
    getRollReadWordsForPattern,
    getWordChainsForPattern,
    getSentencesForPattern,
} from './ufli-content.js';

// ─── Helpers ────────────────────────────────────────────────────────────────

function _qid(skillId, mechanic) {
    return `${skillId}_${mechanic}_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
}

function _shuffle(arr, rng = Math.random) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

function _pick(arr, rng = Math.random) {
    return arr[Math.floor(rng() * arr.length)];
}

function _comingSoon(skillAtom) {
    return {
        id: _qid(skillAtom.skill_id, 'comingsoon'),
        skill_ids: [skillAtom.skill_id],
        question_type: '__coming_soon__',
        skill_atom: skillAtom,
        rit_difficulty: 150,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: false,
        k2_appropriate: true,
    };
}

// ─── Roll-and-read parsing ──────────────────────────────────────────────────

const ROLL_READ_SUFFIX_TO_SET = {
    short_a:     { setKey: 'set2',  prompt: 'short a',
                   pattern: 'short_a' },
    digraph:     { setKey: 'set5',  prompt: 'a digraph (sh, ch, th, wh)',
                   pattern: 'digraph_sh' },
    vce:         { setKey: 'set9',  prompt: 'silent-e long vowel',
                   pattern: 'long_a_vce' },
    vowel_team:  { setKey: 'set11', prompt: 'a vowel team',
                   pattern: 'vowel_team_ai_ay' },
};

const ROLL_READ_PATTERN_TESTS = {
    short_a: (w) => /^[bcdfghjklmnpqrstvwxyz]?[bcdfghjklmnpqrstvwxyz]?a[bcdfghjklmnpqrstvwxyz]+$/i.test(w),
    digraph: (w) => /(sh|ch|th|wh|ph)/i.test(w),
    vce:     (w) => /[aeiou][bcdfghjklmnpqrstvwxyz]e\b/i.test(w),
    vowel_team: (w) => /(ai|ay|ee|ea|oa|ow|oi|oy|ie|ue|ew|igh|oo|au|aw)/i.test(w),
};

function _suffixFromRollReadId(skillId) {
    // reading_fluency_roll_and_read_<suffix>
    return skillId.replace(/^reading_fluency_roll_and_read_/, '');
}

function _suffixFromDecodableId(skillId) {
    // reading_fluency_decodable_passage_<setKey>
    return skillId.replace(/^reading_fluency_decodable_passage_/, '');
}

// ─── Roll-and-read generators ───────────────────────────────────────────────

function _rollReadMcText(skillAtom, words, prompt, rng) {
    if (!words || words.length < 4) return _comingSoon(skillAtom);

    const target = _pick(words, rng);
    const distractorPool = words.filter(w => w !== target);
    const distractors = _shuffle(distractorPool, rng).slice(0, 3);
    const opts = _shuffle([target, ...distractors], rng).map((w, i) => ({
        id: String.fromCharCode(97 + i),  // 'a','b','c','d'
        label: w,
    }));
    const ans = opts.find(o => o.label === target).id;

    return {
        id: _qid(skillAtom.skill_id, 'mctext'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `Read these words. Which one is "${target}"?`,
        options: opts,
        ans,
        correct_answer: ans,
        distractor_misconceptions: {},
        hints: [
            `Look at each word carefully and listen for the sounds.`,
            `The target word is "${target}".`,
        ],
        rit_difficulty: 155,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: true,
        k2_appropriate: true,
        ufli_source: { setKey: prompt, target },
    };
}

function _rollReadFibAuto(skillAtom, words, rng) {
    const target = _pick(words, rng);
    return {
        id: _qid(skillAtom.skill_id, 'fibauto'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'fib-auto',
        skill_atom: skillAtom,
        stem: `Type this word: "${target}"`,
        ans: target,
        correct_answer: target,
        accepted_answers: [target.toLowerCase()],
        case_insensitive: true,
        hints: [
            `Sound out each part of the word.`,
            `The word is "${target}".`,
        ],
        rit_difficulty: 160,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: true,
        k2_appropriate: true,
        ufli_source: { target },
    };
}

function _rollReadTapHotspot(skillAtom, words, suffix, rng) {
    const tester = ROLL_READ_PATTERN_TESTS[suffix];
    const sample = _shuffle(words, rng).slice(0, 9);
    if (sample.length < 4) return _rollReadMcText(skillAtom, words, suffix, rng);

    let target = sample.find(w => tester && tester(w));
    if (!target) target = sample[0];

    const hotspots = sample.map((w, i) => ({
        id: `h${i}`,
        x: 10 + (i % 3) * 30,
        y: 10 + Math.floor(i / 3) * 30,
        radius: 12,
        label: w,
        is_target: w === target,
    }));

    return {
        id: _qid(skillAtom.skill_id, 'taphotspot'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'tap-hotspot',
        skill_atom: skillAtom,
        stem: `Tap the word that says "${target}".`,
        image: null,
        hotspots,
        ans: hotspots.find(h => h.is_target).id,
        correct_answer: hotspots.find(h => h.is_target).id,
        hints: [`The word "${target}" is in this grid.`],
        rit_difficulty: 150,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: true,
        k2_appropriate: true,
    };
}

function _rollReadWordChain(skillAtom, meta, rng) {
    // Use UFLI HomePractice word chains for the same pattern.
    const chains = getWordChainsForPattern(meta.pattern);
    if (!chains || chains.length === 0) return null;
    const chain = _pick(chains, rng);
    if (!chain || chain.length < 2) return null;
    return {
        id: _qid(skillAtom.skill_id, 'wordchain'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'word-chain',
        skill_atom: skillAtom,
        stem: 'Read each word in the chain. Tap each word as you read it.',
        chain,
        ans: chain[chain.length - 1],
        correct_answer: chain[chain.length - 1],
        hints: ['Each word changes by one sound or letter.', `The chain ends with "${chain[chain.length - 1]}".`],
        rit_difficulty: 165,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
        ufli_source: { chain, pattern: meta.pattern },
    };
}

function _rollReadSentence(skillAtom, meta, rng) {
    const sentences = getSentencesForPattern(meta.pattern);
    if (!sentences || sentences.length === 0) return null;
    const target = _pick(sentences, rng);
    return {
        id: _qid(skillAtom.skill_id, 'sentence'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `Read this sentence:\n\n"${target}"\n\nWhat is the FIRST word in the sentence?`,
        options: (() => {
            const firstWord = (target.split(/\s+/)[0] || '').replace(/[^a-zA-Z']/g, '');
            const allWords = target.split(/\s+/).map(w => w.replace(/[^a-zA-Z']/g, '')).filter(w => w && w !== firstWord);
            const distractors = _shuffle(allWords, rng).slice(0, 3);
            return _shuffle([firstWord, ...distractors], rng).map((w, i) => ({
                id: String.fromCharCode(97 + i), label: w,
            }));
        })(),
        ans: 'a',  // patched below
        correct_answer: 'a',
        hints: [`Look at the very beginning of the sentence.`],
        rit_difficulty: 158,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: true,
        ufli_source: { sentence: target },
        _patchAns: true,
    };
}

function _generateRollReadQuestion(skillAtom, mechanic, rng) {
    const suffix = _suffixFromRollReadId(skillAtom.skill_id);
    const meta = ROLL_READ_SUFFIX_TO_SET[suffix];
    if (!meta) return _comingSoon(skillAtom);

    const words = getRollReadWordsForSet(meta.setKey);
    if (!words || words.length < 4) return _comingSoon(skillAtom);

    switch (mechanic) {
        case 'word-chain': {
            const q = _rollReadWordChain(skillAtom, meta, rng);
            return q || _rollReadMcText(skillAtom, words, meta.prompt, rng);
        }
        case 'fib-auto':    return _rollReadFibAuto(skillAtom, words, rng);
        case 'tap-hotspot': return _rollReadTapHotspot(skillAtom, words, suffix, rng);
        case 'mc-audio':
        case 'mc-text':
        default:
            return _rollReadMcText(skillAtom, words, meta.prompt, rng);
    }
}

// ─── Decodable passage generators ───────────────────────────────────────────

const STOPWORDS = new Set([
    'a','an','the','and','or','but','is','was','are','were','be','been','being',
    'i','you','he','she','it','we','they','this','that','these','those','of',
    'to','for','in','on','at','with','as','by','from','up','out','if','so',
    'do','does','did','has','have','had','will','can','could','would','should',
    'said','says','say','my','your','his','her','its','our','their',
]);

const PASSAGE_PATTERNS = {
    set5:  /(sh|ch|th|wh|ck)/i,
    set9:  /[aeiou][bcdfghjklmnpqrstvwxyz]e\b/i,
    set11: /(ai|ay|ee|ea|oa|ow|oi|oy)/i,
};

function _cleanWord(token) {
    return String(token).toLowerCase().replace(/[^a-z'-]/g, '');
}

function _passageWords(passage) {
    if (!passage || !passage.text) return [];
    return passage.text
        .split(/\s+/)
        .map(_cleanWord)
        .filter(w => w.length > 0);
}

function _patternWordsInPassage(passage, regex) {
    if (!regex) return [];
    return Array.from(new Set(
        _passageWords(passage).filter(w => regex.test(w) && !STOPWORDS.has(w))
    ));
}

function _decodableMcText(skillAtom, passage, suffix, rng) {
    // Pick a real word from the passage that matches the pattern as the target,
    // and 3 close-but-wrong distractors from the same passage.
    const regex = PASSAGE_PATTERNS[suffix];
    const matches = _patternWordsInPassage(passage, regex);
    const others  = Array.from(new Set(
        _passageWords(passage).filter(w => !matches.includes(w) && !STOPWORDS.has(w))
    ));

    if (matches.length === 0 || others.length < 3) {
        // Fallback: ask "which word appears in this passage?"
        const realWords = Array.from(new Set(_passageWords(passage).filter(w => !STOPWORDS.has(w))));
        if (realWords.length < 4) return _comingSoon(skillAtom);
        const target = _pick(realWords, rng);
        const fakes = ['plip','grond','sneef'].filter(w => !realWords.includes(w));
        const opts  = _shuffle([target, ...fakes.slice(0, 3)], rng).map((w, i) => ({
            id: String.fromCharCode(97 + i), label: w,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'mctext'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Read this passage:\n\n"${passage.text}"\n\nWhich word appears in the passage?`,
            options: opts,
            ans: opts.find(o => o.label === target).id,
            correct_answer: opts.find(o => o.label === target).id,
            hints: [`Re-read the passage and look for each word.`],
            rit_difficulty: 165,
            grade_level: skillAtom.developmental_band || '1',
            has_audio: true,
            k2_appropriate: false,
            ufli_source: { lesson: passage.lesson, set: passage.set },
        };
    }

    const target = _pick(matches, rng);
    const distractors = _shuffle(others, rng).slice(0, 3);
    const opts = _shuffle([target, ...distractors], rng).map((w, i) => ({
        id: String.fromCharCode(97 + i), label: w,
    }));

    return {
        id: _qid(skillAtom.skill_id, 'mctext'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `Read this passage:\n\n"${passage.text}"\n\nWhich word from the passage uses the target spelling pattern?`,
        options: opts,
        ans: opts.find(o => o.label === target).id,
        correct_answer: opts.find(o => o.label === target).id,
        hints: [
            `Look at the spelling of each word.`,
            `The pattern matches words like "${target}".`,
        ],
        rit_difficulty: 170,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: false,
        ufli_source: { lesson: passage.lesson, set: passage.set, target },
    };
}

function _decodableHotText(skillAtom, passage, suffix, rng) {
    const regex = PASSAGE_PATTERNS[suffix];
    if (!regex) return _decodableMcText(skillAtom, passage, suffix, rng);

    // Tokenize the passage the same way the hot-text widget does, and capture
    // 0-based word indices for tokens that match the pattern.
    const tokens = passage.text.split(/(\s+)/);
    const correctIndices = [];
    let tokenIndex = 0;
    for (const part of tokens) {
        if (/^\s+$/.test(part) || part.length === 0) continue;
        const cleaned = _cleanWord(part);
        if (cleaned && regex.test(cleaned) && !STOPWORDS.has(cleaned)) {
            correctIndices.push(tokenIndex);
        }
        tokenIndex++;
    }

    if (correctIndices.length === 0) {
        return _decodableMcText(skillAtom, passage, suffix, rng);
    }

    return {
        id: _qid(skillAtom.skill_id, 'hottextword'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'hot-text-word',
        skill_atom: skillAtom,
        passage: passage.text,
        granularity: 'word',
        task_text: 'Tap every word in the passage that uses the target spelling pattern.',
        correct_indices: correctIndices,
        multi_select: true,
        hints: [
            'Look for the pattern letters together (e.g., sh, ch, ee, ai).',
            `There are ${correctIndices.length} words that match.`,
        ],
        rit_difficulty: 175,
        grade_level: skillAtom.developmental_band || '1',
        has_audio: true,
        k2_appropriate: false,
        ufli_source: { lesson: passage.lesson, set: passage.set },
    };
}

function _generateDecodableQuestion(skillAtom, mechanic, rng) {
    const suffix = _suffixFromDecodableId(skillAtom.skill_id);
    const passages = getDecodablePassagesForSet(suffix);
    if (!passages || passages.length === 0) return _comingSoon(skillAtom);

    const passage = _pick(passages, rng);

    switch (mechanic) {
        case 'hot-text-word':
        case 'passage-hot-text':
            return _decodableHotText(skillAtom, passage, suffix, rng);
        case 'passage-mc-set':
        case 'mc-text':
        default:
            return _decodableMcText(skillAtom, passage, suffix, rng);
    }
}

// ─── Public API ─────────────────────────────────────────────────────────────

const STAGE1_FALLBACK = {
    'passage-hot-text': 'hot-text-word',
    'passage-mc-set':   'mc-text',
};

function _pickMechanic(skillAtom, mechanicHint, rng) {
    const available = skillAtom.question_types || ['mc-text'];
    if (mechanicHint && available.includes(mechanicHint)) return mechanicHint;
    return _pick(available, rng);
}

/**
 * Generate a single fluency question.
 * @param {SkillAtom} skillAtom
 * @param {string|null} mechanicHint
 * @param {{ rng?: () => number }} [options]
 * @returns {Question}
 */
export function generateFluencyQuestion(skillAtom, mechanicHint = null, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widget   = STAGE1_FALLBACK[mechanic] || mechanic;

    if (skillAtom.skill_id.startsWith('reading_fluency_roll_and_read_')) {
        return _generateRollReadQuestion(skillAtom, widget, rng);
    }
    if (skillAtom.skill_id.startsWith('reading_fluency_decodable_passage_')) {
        return _generateDecodableQuestion(skillAtom, widget, rng);
    }

    // LNF / LSF / PSF / NWF / ORF probes — Phase 3+
    return _comingSoon(skillAtom);
}

/**
 * Build a deck for a fluency atom, rotating mechanics per the Variety Rule.
 */
export function buildFluencyDeck(skillAtom, count = 10, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    const available = skillAtom.question_types || ['mc-text'];
    const window3 = [];
    const deck = [];
    for (let i = 0; i < count; i++) {
        const eligible = available.filter(m => !window3.includes(m));
        const pool = eligible.length > 0 ? eligible : available;
        const mechanic = _pick(pool, rng);
        deck.push(generateFluencyQuestion(skillAtom, mechanic, { rng }));
        window3.push(mechanic);
        if (window3.length > 3) window3.shift();
    }
    return deck;
}

export default { generateFluencyQuestion, buildFluencyDeck };
