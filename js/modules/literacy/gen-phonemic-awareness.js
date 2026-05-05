// gen-phonemic-awareness.js — Question generator for the Phonemic Awareness strand.
//
// Public API:
//   generatePhonemicAwarenessQuestion(skillAtom, mechanicHint?, options?) → Question
//   buildPhonemicAwarenessDeck(skillAtom, count?, options?)               → Question[]

import { PHONEMES, WORD_PHONEMES, decomposeWord } from './phoneme-tts.js';

// ─── Helpers ───────────────────────────────────────────────────────────────

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

function _sample(arr, n, rng = Math.random) {
    return _shuffle(arr, rng).slice(0, n);
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

function _ipa(phonemeKey) {
    const p = PHONEMES[phonemeKey];
    return p ? p.ipa : `/${phonemeKey}/`;
}

function _phonemeLabel(phonemeKey) {
    const p = PHONEMES[phonemeKey];
    if (!p) return `/${phonemeKey}/`;
    return p.ipa;
}

// ─── Word banks (drawn from WORD_PHONEMES) ─────────────────────────────────

const ALL_WORDS = Object.keys(WORD_PHONEMES);

const CVC_WORDS = ALL_WORDS.filter(w => {
    const p = WORD_PHONEMES[w];
    return p.length === 3 && /^[a-z]{3}$/i.test(w);
});

const TWO_PHONEME_WORDS = ALL_WORDS.filter(w => WORD_PHONEMES[w].length === 2);
const THREE_PHONEME_WORDS = ALL_WORDS.filter(w => WORD_PHONEMES[w].length === 3);
const FOUR_PHONEME_WORDS = ALL_WORDS.filter(w => WORD_PHONEMES[w].length === 4);

// Sentence bank for word counting (2-5 words each)
const WORD_COUNT_SENTENCES = [
    'I run.',
    'The dog barks.',
    'Cats like milk.',
    'She is happy.',
    'I see a cat.',
    'We play in snow.',
    'Birds can fly.',
    'He has a pen.',
    'Mom drives the car.',
    'The sun is bright.',
    'My friend likes pie.',
    'A fish swims fast.',
    'I love to read.',
    'Dogs and cats play.',
    'The boy ran home.',
    'We eat warm soup.',
];

// Multi-syllable word bank for syllable_clap_count
const MULTI_SYLL_WORDS = [
    { word: 'cat',       syllables: 1 },
    { word: 'dog',       syllables: 1 },
    { word: 'sun',       syllables: 1 },
    { word: 'apple',     syllables: 2 },
    { word: 'pencil',    syllables: 2 },
    { word: 'rabbit',    syllables: 2 },
    { word: 'pancake',   syllables: 2 },
    { word: 'cupcake',   syllables: 2 },
    { word: 'rainbow',   syllables: 2 },
    { word: 'sunshine',  syllables: 2 },
    { word: 'butter',    syllables: 2 },
    { word: 'happy',     syllables: 2 },
    { word: 'banana',    syllables: 3 },
    { word: 'elephant',  syllables: 3 },
    { word: 'tomato',    syllables: 3 },
    { word: 'computer',  syllables: 3 },
    { word: 'dinosaur',  syllables: 3 },
    { word: 'butterfly', syllables: 3 },
    { word: 'umbrella',  syllables: 3 },
    { word: 'family',    syllables: 3 },
    { word: 'alligator', syllables: 4 },
    { word: 'caterpillar', syllables: 4 },
    { word: 'watermelon', syllables: 4 },
];

// Rhyme families — each set rhymes within itself
const RHYME_FAMILIES = [
    ['cat',  'hat',  'bat',  'mat',  'rat',  'sat'],
    ['pig',  'big',  'dig',  'wig',  'fig'],
    ['dog',  'log',  'fog',  'hog',  'jog'],
    ['sun',  'run',  'fun',  'bun',  'pun'],
    ['bed',  'red',  'led',  'fed',  'wed'],
    ['cake', 'lake', 'bake', 'make', 'rake'],
    ['ride', 'side', 'hide', 'wide', 'tide'],
    ['rope', 'hope', 'cope', 'mope', 'slope'],
    ['ship', 'chip', 'flip', 'trip', 'drip'],
    ['top',  'hop',  'pop',  'mop',  'shop'],
    ['ten',  'pen',  'hen',  'men',  'when'],
    ['bug',  'mug',  'rug',  'hug',  'jug'],
    ['tree', 'see',  'bee',  'free', 'knee'],
    ['snow', 'blow', 'grow', 'low',  'show'],
];

// Initial-sound word bank — words grouped by initial phoneme
const INITIAL_PHONEME_WORDS = {
    'b':  ['ball', 'bat', 'bed', 'big', 'bug', 'box', 'bird', 'bone'],
    'c':  ['cat', 'cap', 'can', 'cup', 'corn', 'cake', 'car'],
    'k':  ['cat', 'cap', 'can', 'cup', 'corn', 'cake', 'car', 'kite'],
    'd':  ['dog', 'duck', 'dad', 'dip', 'desk'],
    'f':  ['fish', 'fan', 'fox', 'fun', 'fork', 'five'],
    'g':  ['goat', 'gum', 'gas', 'game'],
    'h':  ['hat', 'hop', 'hen', 'hot', 'hand', 'house'],
    'j':  ['jam', 'jet', 'jug', 'jump'],
    'l':  ['log', 'leg', 'lid', 'lip', 'lion'],
    'm':  ['mop', 'man', 'map', 'moon', 'mom', 'milk'],
    'n':  ['net', 'nap', 'nose', 'nest', 'nut'],
    'p':  ['pig', 'pan', 'pen', 'pot', 'pup', 'park'],
    'r':  ['rat', 'red', 'run', 'rug', 'rope', 'rain'],
    's':  ['sun', 'sit', 'sad', 'sock', 'soup', 'seal'],
    't':  ['top', 'tap', 'ten', 'tub', 'toy', 'time'],
    'v':  ['van', 'vet', 'vine'],
    'w':  ['win', 'wet', 'web', 'wind', 'water'],
    'z':  ['zoo', 'zip', 'zebra'],
};

// Final-sound word bank
const FINAL_PHONEME_WORDS = {
    't':  ['cat', 'hat', 'bat', 'pot', 'sit', 'wet', 'net'],
    'p':  ['cap', 'map', 'top', 'cup', 'hop', 'tap'],
    'g':  ['bag', 'pig', 'dog', 'log', 'bug', 'rug'],
    'n':  ['can', 'pan', 'pen', 'sun', 'man', 'fun'],
    'd':  ['bed', 'red', 'mad', 'mud', 'lid'],
    'k':  ['rock', 'sock', 'duck', 'book'],
    'm':  ['gum', 'ham', 'jam'],
    's':  ['bus', 'gas', 'kiss'],
};

// ─── Question builders (reusable) ──────────────────────────────────────────

function _mcText(skillAtom, stem, correctLabel, distractorLabels, opts = {}) {
    const labels = _shuffle([correctLabel, ...distractorLabels].slice(0, 4));
    const options = labels.map((label, i) => ({
        id: String.fromCharCode(97 + i),
        label,
    }));
    const ans = options.find(o => o.label === correctLabel).id;
    return {
        id: _qid(skillAtom.skill_id, 'mctext'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem,
        options,
        ans,
        correct_answer: ans,
        distractor_misconceptions: opts.distractors || {},
        hints: opts.hints || [],
        rit_difficulty: opts.rit || 145,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: true,
        k2_appropriate: true,
        audio_text: opts.audio_text || stem,
    };
}

function _twoButtonBinary(skillAtom, subject, stem, yesIsCorrect, opts = {}) {
    const options = [
        { id: 'yes', label: opts.yesLabel || 'Yes' },
        { id: 'no',  label: opts.noLabel  || 'No'  },
    ];
    const ans = yesIsCorrect ? 'yes' : 'no';
    return {
        id: _qid(skillAtom.skill_id, 'tbb'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'two-button-binary',
        skill_atom: skillAtom,
        subject,
        stem,
        options,
        ans,
        correct_answer: ans,
        audio_text: opts.audio_text || subject || stem,
        skillLabel: opts.skillLabel || skillAtom.skill_statement,
        title: skillAtom.skill_statement,
        hints: opts.hints || [],
        rit_difficulty: opts.rit || 142,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: true,
        k2_appropriate: true,
    };
}

// ─── Skill-specific generators ─────────────────────────────────────────────

function _genWordCountInSentence(skillAtom, mechanic, rng) {
    const sentence = _pick(WORD_COUNT_SENTENCES, rng);
    const wordCount = sentence.replace(/[.,!?]/g, '').trim().split(/\s+/).length;
    const choices = _shuffle([wordCount, wordCount + 1, Math.max(1, wordCount - 1), wordCount + 2], rng)
        .filter((v, i, a) => a.indexOf(v) === i)
        .slice(0, 4);
    if (!choices.includes(wordCount)) choices[0] = wordCount;
    const stem = `Listen to the sentence: "${sentence}"\n\nHow many words do you hear?`;
    const labels = _shuffle(choices, rng).map(String);
    const options = labels.map((label, i) => ({ id: String.fromCharCode(97 + i), label }));
    const ans = options.find(o => o.label === String(wordCount)).id;
    return {
        id: _qid(skillAtom.skill_id, 'wordcount'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem,
        audio_text: sentence,
        options,
        ans,
        correct_answer: ans,
        distractor_misconceptions: {},
        hints: [
            'Tap or clap once for each word as you say it.',
            `The sentence has ${wordCount} word${wordCount === 1 ? '' : 's'}.`,
        ],
        rit_difficulty: 138,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: true,
        k2_appropriate: true,
    };
}

function _genSyllableCount(skillAtom, mechanic, rng) {
    const candidates = MULTI_SYLL_WORDS.filter(w => w.syllables <= 3);
    const target = _pick(candidates, rng);
    if (mechanic === 'two-button-binary') {
        const wrongCount = target.syllables === 1 ? 2 : (Math.random() < 0.5 ? target.syllables - 1 : target.syllables + 1);
        const claim = Math.random() < 0.5 ? target.syllables : wrongCount;
        return _twoButtonBinary(
            skillAtom,
            target.word,
            `Does "${target.word}" have ${claim} syllable${claim === 1 ? '' : 's'}?`,
            claim === target.syllables,
            {
                hints: [
                    'Clap once for each syllable.',
                    `"${target.word}" has ${target.syllables} syllable${target.syllables === 1 ? '' : 's'}.`,
                ],
                audio_text: target.word,
                rit: 140,
            }
        );
    }
    const distractors = [target.syllables - 1, target.syllables + 1, target.syllables + 2]
        .filter(n => n >= 1 && n !== target.syllables);
    return _mcText(
        skillAtom,
        `How many syllables are in "${target.word}"?`,
        String(target.syllables),
        distractors.slice(0, 3).map(String),
        {
            audio_text: target.word,
            hints: [
                'Clap once for each syllable as you say the word.',
                `"${target.word}" has ${target.syllables} syllable${target.syllables === 1 ? '' : 's'}.`,
            ],
            rit: 140,
        }
    );
}

function _genSyllableClapCount(skillAtom, mechanic, rng) {
    const target = _pick(MULTI_SYLL_WORDS, rng);
    const distractors = [target.syllables - 1, target.syllables + 1, target.syllables + 2]
        .filter(n => n >= 1 && n !== target.syllables);
    return _mcText(
        skillAtom,
        `Clap the syllables in "${target.word}". How many claps do you hear?`,
        String(target.syllables),
        distractors.slice(0, 3).map(String),
        {
            audio_text: target.word,
            hints: [
                'Clap once each time your chin drops as you say the word.',
                `"${target.word}" has ${target.syllables} claps.`,
            ],
            rit: 142,
        }
    );
}

function _genRhymeIdentify(skillAtom, mechanic, rng) {
    const family = _pick(RHYME_FAMILIES, rng);
    const [w1, w2] = _sample(family, 2, rng);
    const isRhyme = Math.random() < 0.5;
    let pair;
    if (isRhyme) {
        pair = [w1, w2];
    } else {
        const otherFamily = _pick(RHYME_FAMILIES.filter(f => f !== family), rng);
        pair = [w1, _pick(otherFamily, rng)];
    }
    return _twoButtonBinary(
        skillAtom,
        `${pair[0]} ... ${pair[1]}`,
        `Listen carefully. Do "${pair[0]}" and "${pair[1]}" rhyme?`,
        isRhyme,
        {
            hints: [
                'Rhyming words end with the same sound.',
                isRhyme
                    ? `"${pair[0]}" and "${pair[1]}" both end with the same sound.`
                    : `"${pair[0]}" and "${pair[1]}" end with different sounds.`,
            ],
            audio_text: `${pair[0]}. ${pair[1]}.`,
            rit: 140,
        }
    );
}

function _genRhymeProduce(skillAtom, mechanic, rng) {
    const family = _pick(RHYME_FAMILIES, rng);
    const target = _pick(family, rng);
    const correctRhyme = _pick(family.filter(w => w !== target), rng);
    const otherFamilies = RHYME_FAMILIES.filter(f => !f.includes(target));
    const distractors = _sample(
        otherFamilies.flatMap(f => f).filter(w => !family.includes(w)),
        3,
        rng
    );
    return _mcText(
        skillAtom,
        `Which word rhymes with "${target}"?`,
        correctRhyme,
        distractors,
        {
            audio_text: `Which word rhymes with ${target}?`,
            hints: [
                `Rhyming words end with the same sound as "${target}".`,
                `"${target}" rhymes with "${correctRhyme}".`,
            ],
            rit: 144,
        }
    );
}

function _genPhonemeIsolationInitial(skillAtom, mechanic, rng) {
    const phonemes = Object.keys(INITIAL_PHONEME_WORDS);
    const target = _pick(phonemes, rng);
    const ipa = _ipa(target);
    const correctWord = _pick(INITIAL_PHONEME_WORDS[target], rng);
    const distractorPhonemes = _sample(phonemes.filter(p => p !== target), 3, rng);
    const distractors = distractorPhonemes.map(p => _pick(INITIAL_PHONEME_WORDS[p], rng));
    return _mcText(
        skillAtom,
        `Which word starts with the ${ipa} sound?`,
        correctWord,
        distractors,
        {
            audio_text: `Which word starts with the ${ipa} sound?`,
            hints: [
                `Listen to the very first sound of each word.`,
                `"${correctWord}" begins with ${ipa}.`,
            ],
            rit: 145,
        }
    );
}

function _genPhonemeIsolationFinal(skillAtom, mechanic, rng) {
    const phonemes = Object.keys(FINAL_PHONEME_WORDS);
    const target = _pick(phonemes, rng);
    const ipa = _ipa(target);
    const correctWord = _pick(FINAL_PHONEME_WORDS[target], rng);
    const distractorPhonemes = _sample(phonemes.filter(p => p !== target), 3, rng);
    const distractors = distractorPhonemes.map(p => _pick(FINAL_PHONEME_WORDS[p], rng));
    return _mcText(
        skillAtom,
        `Which word ends with the ${ipa} sound?`,
        correctWord,
        distractors,
        {
            audio_text: `Which word ends with the ${ipa} sound?`,
            hints: [
                `Listen to the last sound of each word.`,
                `"${correctWord}" ends with ${ipa}.`,
            ],
            rit: 148,
        }
    );
}

function _genPhonemeIsolationMedial(skillAtom, mechanic, rng) {
    const cvcPool = THREE_PHONEME_WORDS.filter(w => /^[a-z]{3}$/.test(w));
    const target = _pick(cvcPool, rng);
    const phs = WORD_PHONEMES[target];
    const medial = phs[1];
    const ipa = _ipa(medial);
    const distractors = ['æ', 'ɛ', 'ɪ', 'ɒ', 'ʌ']
        .filter(v => v !== medial)
        .slice(0, 3)
        .map(v => _ipa(v));
    return _mcText(
        skillAtom,
        `Listen to the word "${target}". What is the middle sound?`,
        ipa,
        distractors,
        {
            audio_text: target,
            hints: [
                'The middle sound is the vowel sound between the first and last sounds.',
                `The middle sound in "${target}" is ${ipa}.`,
            ],
            rit: 150,
        }
    );
}

function _genInitialSoundMatch(skillAtom, mechanic, rng) {
    const phonemes = Object.keys(INITIAL_PHONEME_WORDS).filter(p => INITIAL_PHONEME_WORDS[p].length >= 3);
    const target = _pick(phonemes, rng);
    const [anchor, correctMatch] = _sample(INITIAL_PHONEME_WORDS[target], 2, rng);
    const distractorPhonemes = _sample(phonemes.filter(p => p !== target), 3, rng);
    const distractors = distractorPhonemes.map(p => _pick(INITIAL_PHONEME_WORDS[p], rng));
    return _mcText(
        skillAtom,
        `Which word starts with the same sound as "${anchor}"?`,
        correctMatch,
        distractors,
        {
            audio_text: `Which word starts with the same sound as ${anchor}?`,
            hints: [
                `Say "${anchor}" slowly. Listen to the first sound.`,
                `"${anchor}" and "${correctMatch}" both start with ${_ipa(target)}.`,
            ],
            rit: 144,
        }
    );
}

function _genPhonemeBlending2(skillAtom, mechanic, rng) {
    const target = _pick(TWO_PHONEME_WORDS, rng);
    const phs = WORD_PHONEMES[target];
    const ipaSeq = phs.map(p => _ipa(p)).join(' ');
    const distractorPool = TWO_PHONEME_WORDS.filter(w => w !== target);
    const distractors = _sample(distractorPool, 3, rng);
    return _mcText(
        skillAtom,
        `Blend these sounds: ${ipaSeq}. What word is it?`,
        target,
        distractors,
        {
            audio_text: `Blend these sounds: ${phs.map(p => (PHONEMES[p] && PHONEMES[p].tts) || p).join(' ... ')}. What word?`,
            hints: [
                'Push the sounds together quickly to make a word.',
                `${ipaSeq} blends to "${target}".`,
            ],
            rit: 142,
        }
    );
}

function _genPhonemeBlending3(skillAtom, mechanic, rng) {
    const target = _pick(THREE_PHONEME_WORDS, rng);
    const phs = WORD_PHONEMES[target];
    const ipaSeq = phs.map(p => _ipa(p)).join(' ');
    const distractorPool = THREE_PHONEME_WORDS.filter(w => w !== target);
    const distractors = _sample(distractorPool, 3, rng);
    return _mcText(
        skillAtom,
        `Blend these sounds: ${ipaSeq}. What word is it?`,
        target,
        distractors,
        {
            audio_text: `Blend these sounds: ${phs.map(p => (PHONEMES[p] && PHONEMES[p].tts) || p).join(' ... ')}. What word?`,
            hints: [
                'Push the sounds together to make a word.',
                `${ipaSeq} blends to "${target}".`,
            ],
            rit: 148,
        }
    );
}

function _genPhonemeCountCvc(skillAtom, mechanic, rng) {
    const pool = ALL_WORDS.filter(w => {
        const len = WORD_PHONEMES[w].length;
        return len >= 2 && len <= 4 && /^[a-z]+$/.test(w);
    });
    const target = _pick(pool, rng);
    const phonemeCount = WORD_PHONEMES[target].length;

    if (mechanic === 'sound-box') {
        return {
            id: _qid(skillAtom.skill_id, 'sbcount'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sound-box',
            skill_atom: skillAtom,
            word: target,
            phoneme_count: phonemeCount,
            audio_text: target,
            task: 'count_phonemes',
            stem: `How many sounds do you hear in "${target}"?`,
            ans: phonemeCount,
            correct_answer: phonemeCount,
            hints: [
                'Tap your finger for each sound.',
                `"${target}" has ${phonemeCount} sounds.`,
            ],
            rit_difficulty: 152,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: true,
            k2_appropriate: true,
        };
    }

    const choices = [phonemeCount - 1, phonemeCount, phonemeCount + 1, phonemeCount + 2]
        .filter(n => n >= 1);
    const labels = _shuffle(choices, rng).map(String);
    return _mcText(
        skillAtom,
        `How many sounds do you hear in "${target}"?`,
        String(phonemeCount),
        labels.filter(l => l !== String(phonemeCount)).slice(0, 3),
        {
            audio_text: target,
            hints: [
                'Slowly stretch the word and count each sound.',
                `"${target}" has ${phonemeCount} sound${phonemeCount === 1 ? '' : 's'}.`,
            ],
            rit: 152,
        }
    );
}

function _genPhonemeDelete(skillAtom, mechanic, rng) {
    // Pairs: original word → word after removing initial phoneme
    const pairs = [
        { full: 'cat',  remove: 'k', result: 'at',  ipa: '/k/' },
        { full: 'sit',  remove: 's', result: 'it',  ipa: '/s/' },
        { full: 'bat',  remove: 'b', result: 'at',  ipa: '/b/' },
        { full: 'hat',  remove: 'h', result: 'at',  ipa: '/h/' },
        { full: 'pin',  remove: 'p', result: 'in',  ipa: '/p/' },
        { full: 'hand', remove: 'h', result: 'and', ipa: '/h/' },
        { full: 'sand', remove: 's', result: 'and', ipa: '/s/' },
        { full: 'mice', remove: 'm', result: 'ice', ipa: '/m/' },
        { full: 'farm', remove: 'f', result: 'arm', ipa: '/f/' },
        { full: 'sit',  remove: 't', result: 'si',  ipa: '/t/' },
        { full: 'cap',  remove: 'p', result: 'ca',  ipa: '/p/' },
        { full: 'dad',  remove: 'd', result: 'ad',  ipa: '/d/' },
    ];
    const target = _pick(pairs, rng);
    const distractorPool = pairs
        .filter(p => p.result !== target.result && p.full !== target.full)
        .map(p => p.result);
    const distractors = _sample(distractorPool, 3, rng);
    return _mcText(
        skillAtom,
        `Say "${target.full}" without the ${target.ipa} sound. What word is left?`,
        target.result,
        distractors,
        {
            audio_text: `Say ${target.full} without the ${target.ipa} sound.`,
            hints: [
                `Take away the ${target.ipa} from "${target.full}".`,
                `"${target.full}" without ${target.ipa} is "${target.result}".`,
            ],
            rit: 162,
        }
    );
}

function _genPhonemeSubstitute(skillAtom, mechanic, rng) {
    // Substitute initial phoneme to make new word
    const items = [
        { full: 'cat', oldP: '/k/', newP: '/h/', result: 'hat' },
        { full: 'cat', oldP: '/k/', newP: '/b/', result: 'bat' },
        { full: 'hat', oldP: '/h/', newP: '/m/', result: 'mat' },
        { full: 'pig', oldP: '/p/', newP: '/b/', result: 'big' },
        { full: 'pig', oldP: '/p/', newP: '/d/', result: 'dig' },
        { full: 'log', oldP: '/l/', newP: '/d/', result: 'dog' },
        { full: 'sun', oldP: '/s/', newP: '/r/', result: 'run' },
        { full: 'sun', oldP: '/s/', newP: '/f/', result: 'fun' },
        { full: 'red', oldP: '/r/', newP: '/b/', result: 'bed' },
        { full: 'top', oldP: '/t/', newP: '/h/', result: 'hop' },
        { full: 'top', oldP: '/t/', newP: '/m/', result: 'mop' },
        { full: 'bug', oldP: '/b/', newP: '/r/', result: 'rug' },
        { full: 'bug', oldP: '/b/', newP: '/m/', result: 'mug' },
        { full: 'cap', oldP: '/k/', newP: '/m/', result: 'map' },
        { full: 'pan', oldP: '/p/', newP: '/m/', result: 'man' },
    ];
    const target = _pick(items, rng);
    const distractorPool = items
        .filter(i => i.result !== target.result && i.full !== target.result)
        .map(i => i.result);
    const distractors = _sample(distractorPool, 3, rng);
    return _mcText(
        skillAtom,
        `Take "${target.full}" and change the ${target.oldP} sound to ${target.newP}. What new word do you get?`,
        target.result,
        distractors,
        {
            audio_text: `Change the ${target.oldP} in ${target.full} to ${target.newP}. What word?`,
            hints: [
                `Swap the ${target.oldP} sound for the ${target.newP} sound.`,
                `"${target.full}" with ${target.newP} instead becomes "${target.result}".`,
            ],
            rit: 165,
        }
    );
}

function _genSoundCategorize(skillAtom, mechanic, rng) {
    // Three words, two share an initial phoneme, one is the odd one out
    const phonemes = Object.keys(INITIAL_PHONEME_WORDS).filter(p => INITIAL_PHONEME_WORDS[p].length >= 2);
    const matchPhoneme = _pick(phonemes, rng);
    const [w1, w2] = _sample(INITIAL_PHONEME_WORDS[matchPhoneme], 2, rng);
    const oddPhonemes = phonemes.filter(p => p !== matchPhoneme);
    const oddPh = _pick(oddPhonemes, rng);
    const odd = _pick(INITIAL_PHONEME_WORDS[oddPh], rng);

    // 4 options: the three words plus one extra mismatch from yet another phoneme
    const extraPh = _pick(oddPhonemes.filter(p => p !== oddPh), rng);
    const extra = _pick(INITIAL_PHONEME_WORDS[extraPh], rng);

    const stem = `Which word does NOT begin with the same sound as the others?\n\n"${w1}", "${w2}", "${odd}", "${extra}"`;
    const labels = _shuffle([w1, w2, odd, extra], rng);
    const options = labels.map((label, i) => ({ id: String.fromCharCode(97 + i), label }));
    // Two odd ones (odd, extra). Accept either as correct.
    const ans = options.find(o => o.label === odd).id;
    return {
        id: _qid(skillAtom.skill_id, 'oddout'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `Which word does NOT begin with the same sound as "${w1}" and "${w2}"?`,
        audio_text: `Which word does not begin with the same sound as ${w1} and ${w2}?`,
        options: _shuffle([w1, w2, odd], rng).map((label, i) => ({ id: String.fromCharCode(97 + i), label })),
        ans: '',
        correct_answer: '',
        hints: [
            `Listen to the first sound of each word.`,
            `"${w1}" and "${w2}" both start with ${_ipa(matchPhoneme)}, but "${odd}" starts with ${_ipa(oddPh)}.`,
        ],
        rit_difficulty: 153,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: true,
        k2_appropriate: true,
        // patch ans to actual odd word
        _patchOdd: odd,
    };
}

function _genSoundCategorizeFixed(skillAtom, mechanic, rng) {
    const q = _genSoundCategorize(skillAtom, mechanic, rng);
    if (q._patchOdd && Array.isArray(q.options)) {
        const ansOpt = q.options.find(o => o.label === q._patchOdd);
        if (ansOpt) {
            q.ans = ansOpt.id;
            q.correct_answer = ansOpt.id;
        }
        delete q._patchOdd;
    }
    return q;
}

// ─── Skill dispatcher ──────────────────────────────────────────────────────

const SKILL_GENERATORS = {
    'reading_pa_word_count_in_sentence':    _genWordCountInSentence,
    'reading_pa_syllable_count':            _genSyllableCount,
    'reading_pa_syllable_clap_count':       _genSyllableClapCount,
    'reading_pa_rhyme_identify':            _genRhymeIdentify,
    'reading_pa_rhyme_produce':             _genRhymeProduce,
    'reading_pa_rhyme_supply_word':         _genRhymeProduce,
    'reading_pa_phoneme_isolation_initial': _genPhonemeIsolationInitial,
    'reading_pa_phoneme_isolation_final':   _genPhonemeIsolationFinal,
    'reading_pa_phoneme_isolation_medial':  _genPhonemeIsolationMedial,
    'reading_pa_initial_sound_match':       _genInitialSoundMatch,
    'reading_pa_phoneme_blending_2':        _genPhonemeBlending2,
    'reading_pa_phoneme_blending_3':        _genPhonemeBlending3,
    'reading_pa_phoneme_count_cvc':         _genPhonemeCountCvc,
    'reading_pa_phoneme_delete':            _genPhonemeDelete,
    'reading_pa_phoneme_substitute':        _genPhonemeSubstitute,
    'reading_pa_sound_categorize':          _genSoundCategorizeFixed,
};

function _pickMechanic(skillAtom, mechanicHint, rng) {
    const available = skillAtom.question_types || ['mc-text'];
    if (mechanicHint && available.includes(mechanicHint)) return mechanicHint;
    return _pick(available, rng);
}

import { adaptMechanic } from './_mechanic-adapter.js';

export function generatePhonemicAwarenessQuestion(skillAtom, mechanicHint = null, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    const gen = SKILL_GENERATORS[skillAtom.skill_id];
    if (!gen) return _comingSoon(skillAtom);
    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const q = gen(skillAtom, mechanic, rng);
    return adaptMechanic(q, mechanic);
}

export function buildPhonemicAwarenessDeck(skillAtom, count = 10, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    const available = skillAtom.question_types || ['mc-text'];
    const window3 = [];
    const deck = [];
    for (let i = 0; i < count; i++) {
        const eligible = available.filter(m => !window3.includes(m));
        const pool = eligible.length > 0 ? eligible : available;
        const mechanic = _pick(pool, rng);
        deck.push(generatePhonemicAwarenessQuestion(skillAtom, mechanic, { rng }));
        window3.push(mechanic);
        if (window3.length > 3) window3.shift();
    }
    return deck;
}

export default { generatePhonemicAwarenessQuestion, buildPhonemicAwarenessDeck };
