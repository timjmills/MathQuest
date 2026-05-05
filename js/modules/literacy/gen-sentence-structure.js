// gen-sentence-structure.js — Question generator for the Sentence Structure strand.
//
// Public API:
//   generateSentenceStructureQuestion(skillAtom, mechanicHint?, options?) → Question
//   buildSentenceStructureDeck(skillAtom, count?, options?)              → Question[]

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
        rit_difficulty: 180,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: false,
        k2_appropriate: false,
    };
}

function _toOptions(labels, correctLabel) {
    const opts = labels.map((label, i) => ({
        id: String.fromCharCode(97 + i),
        label,
    }));
    const correct = opts.find(o => o.label === correctLabel);
    return { opts, ans: correct ? correct.id : opts[0].id };
}

// ─── Sentence corpus ────────────────────────────────────────────────────────

const COMPLETE_SENTENCES = [
    "The cat sat on the mat.",
    "Birds fly south for winter.",
    "My sister reads every night.",
    "The bus arrived at school.",
    "We baked a cake yesterday.",
    "Sam kicked the soccer ball.",
    "The river runs through the valley.",
    "A small dog barked loudly.",
    "Rain fell on the playground.",
    "Mia painted a bright picture.",
    "The teacher opened the book.",
    "Stars shine above the city.",
    "Leaves change color in fall.",
    "The kettle started to whistle.",
    "Our class visited the museum.",
];

const FRAGMENTS = [
    "The cat on the mat",
    "Running through the park",
    "After the long day",
    "Because she was tired",
    "Under the kitchen table",
    "When the bell rang",
    "A big yellow school bus",
    "The bright morning sun",
    "Without a single word",
    "If we leave early",
    "While I was reading",
    "Across the wide field",
    "The boy with red shoes",
    "Until the rain stopped",
];

const RUN_ON_SENTENCES = [
    {
        runon: "I love pizza I eat it every Friday.",
        fixed: "I love pizza, and I eat it every Friday.",
        clause1: "I love pizza",
        clause2: "I eat it every Friday",
        conj: "and",
    },
    {
        runon: "The bell rang the students lined up.",
        fixed: "The bell rang, so the students lined up.",
        clause1: "The bell rang",
        clause2: "the students lined up",
        conj: "so",
    },
    {
        runon: "She wanted ice cream the truck was gone.",
        fixed: "She wanted ice cream, but the truck was gone.",
        clause1: "She wanted ice cream",
        clause2: "the truck was gone",
        conj: "but",
    },
    {
        runon: "It started to rain we ran inside.",
        fixed: "It started to rain, so we ran inside.",
        clause1: "It started to rain",
        clause2: "we ran inside",
        conj: "so",
    },
    {
        runon: "My dog barks loudly he wags his tail.",
        fixed: "My dog barks loudly, and he wags his tail.",
        clause1: "My dog barks loudly",
        clause2: "he wags his tail",
        conj: "and",
    },
];

// Pairs for combining (two simple → compound or complex)
const COMBINE_PAIRS = [
    { a: "I was hungry.",          b: "I made a sandwich.",       conj: "so",     joined: "I was hungry, so I made a sandwich." },
    { a: "She likes apples.",      b: "She does not like pears.", conj: "but",    joined: "She likes apples, but she does not like pears." },
    { a: "We went to the park.",   b: "We played on the swings.", conj: "and",    joined: "We went to the park, and we played on the swings." },
    { a: "He stayed home.",        b: "He was sick.",             conj: "because",joined: "He stayed home because he was sick." },
    { a: "The lights went out.",   b: "We lit some candles.",     conj: "so",     joined: "The lights went out, so we lit some candles." },
    { a: "I will read a book.",    b: "I finish my homework.",    conj: "when",   joined: "I will read a book when I finish my homework." },
];

// Subordinating conjunction cloze items
const SUBORDINATING_CLOZE = [
    { stem: "We went inside {{slot:0}} it started to rain.",   correct: "because", options: ["because", "and",  "but",  "so"]      },
    { stem: "I will call you {{slot:0}} I get home.",          correct: "when",    options: ["when",    "or",   "but",  "and"]     },
    { stem: "{{slot:0}} it was late, we kept playing.",        correct: "Although",options: ["Although","Because","If","When"]    },
    { stem: "She will be happy {{slot:0}} you visit.",         correct: "if",      options: ["if",      "but",  "and",  "or"]      },
    { stem: "I waited {{slot:0}} the bus arrived.",            correct: "until",   options: ["until",   "and",  "but",  "so"]      },
    { stem: "{{slot:0}} the sun set, the sky turned orange.",  correct: "When",    options: ["When",    "But",  "And",  "Or"]      },
];

// Sentence-purpose corpus: each entry has type and the exact sentence.
const PURPOSE_SENTENCES = [
    { type: "declarative",   text: "Birds fly south for winter." },
    { type: "declarative",   text: "The library closes at six." },
    { type: "declarative",   text: "My sister plays the violin." },
    { type: "declarative",   text: "We had pancakes for breakfast." },
    { type: "interrogative", text: "Where do birds fly in winter?" },
    { type: "interrogative", text: "Did you finish your homework?" },
    { type: "interrogative", text: "What time does the movie start?" },
    { type: "interrogative", text: "Are you coming to the party?" },
    { type: "exclamatory",   text: "What a beautiful sunset!" },
    { type: "exclamatory",   text: "How exciting that game was!" },
    { type: "exclamatory",   text: "I cannot believe we won!" },
    { type: "exclamatory",   text: "That was the best day ever!" },
    { type: "imperative",    text: "Please close the door." },
    { type: "imperative",    text: "Stand quietly in line." },
    { type: "imperative",    text: "Pass the salt, please." },
    { type: "imperative",    text: "Read the next two pages." },
];

// Simple / Compound / Complex / Compound-Complex
const SCC_SENTENCES = [
    { text: "The dog ran fast.",                                            type: "simple"           },
    { text: "Mia smiled at her friend.",                                    type: "simple"           },
    { text: "We picked apples in the orchard.",                             type: "simple"           },
    { text: "I wanted pizza, but my brother wanted pasta.",                 type: "compound"         },
    { text: "She studied hard, and she earned an A.",                       type: "compound"         },
    { text: "The sun came out, so the snow melted.",                        type: "compound"         },
    { text: "Although it was raining, we went for a walk.",                 type: "complex"          },
    { text: "When the bell rang, the students lined up.",                   type: "complex"          },
    { text: "I will read a book because I love stories.",                   type: "complex"          },
    { text: "Although it was late, we kept playing, and we did not stop.",  type: "compound-complex" },
    { text: "When the rain stopped, we went outside, and we played soccer.",type: "compound-complex" },
];

// Independent vs dependent clause sample bank
const CLAUSE_BANK = [
    { text: "the dog barked",          kind: "independent" },
    { text: "she walked to school",    kind: "independent" },
    { text: "the lights flickered",    kind: "independent" },
    { text: "Sam ate his lunch",       kind: "independent" },
    { text: "the team won the game",   kind: "independent" },
    { text: "because it was cold",     kind: "dependent"   },
    { text: "when the bell rang",      kind: "dependent"   },
    { text: "although she was tired",  kind: "dependent"   },
    { text: "if you finish early",     kind: "dependent"   },
    { text: "while we were waiting",   kind: "dependent"   },
    { text: "until the rain stopped",  kind: "dependent"   },
];

// Topic sentence vs detail sentence bank
const TOPIC_SETS = [
    {
        topic:   "Dolphins are remarkable ocean animals.",
        details: [
            "They use clicks and whistles to talk to each other.",
            "Dolphins live in groups called pods.",
            "They can swim very fast to catch fish.",
        ],
    },
    {
        topic:   "Recycling helps our planet in many ways.",
        details: [
            "It saves energy that would be used to make new items.",
            "Recycling keeps trash out of landfills.",
            "It also protects animal habitats.",
        ],
    },
    {
        topic:   "Bees play an important role in nature.",
        details: [
            "They carry pollen from one flower to another.",
            "Bees help fruits and vegetables grow.",
            "Without bees, many plants could not make seeds.",
        ],
    },
];

// ─── Generators per atom ────────────────────────────────────────────────────

// Atom: language_sentence_fragment_vs_sentence
function _genFragmentVsSentence(skillAtom, mechanic, rng) {
    if (mechanic === 'two-button-binary') {
        const isComplete = rng() < 0.5;
        const sentence = isComplete ? _pick(COMPLETE_SENTENCES, rng) : _pick(FRAGMENTS, rng);
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            stem: 'Is this a complete sentence?',
            subject: sentence,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: isComplete ? 'yes' : 'no',
            correct_answer: isComplete ? 'yes' : 'no',
            hints: [
                'A complete sentence has a subject and a predicate and expresses a complete thought.',
                isComplete
                    ? 'This expresses a complete thought.'
                    : 'This is missing either a subject, a predicate, or a complete thought.',
            ],
            rit_difficulty: 185,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: true,
            k2_appropriate: false,
        };
    }
    if (mechanic === 'sort-into-bins') {
        const items = [
            ..._shuffle(COMPLETE_SENTENCES, rng).slice(0, 3).map((t, i) => ({
                id: `c${i}`, label: t, correct_bin: 'sentence',
            })),
            ..._shuffle(FRAGMENTS, rng).slice(0, 3).map((t, i) => ({
                id: `f${i}`, label: t, correct_bin: 'fragment',
            })),
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each group of words. Is it a complete sentence or a fragment?',
            items: _shuffle(items, rng),
            bins: [
                { id: 'sentence', label: 'Complete Sentence', color: '#e8f5e9' },
                { id: 'fragment', label: 'Fragment',          color: '#fff3e0' },
            ],
            ans: items.reduce((m, it) => { m[it.id] = it.correct_bin; return m; }, {}),
            hints: ['A complete sentence must have a subject and a predicate.'],
            rit_difficulty: 188,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }
    // Default: mc-text — pick the complete sentence from 4 options
    const target = _pick(COMPLETE_SENTENCES, rng);
    const distractors = _shuffle(FRAGMENTS, rng).slice(0, 3);
    const labels = _shuffle([target, ...distractors], rng);
    const { opts, ans } = _toOptions(labels, target);
    return {
        id: _qid(skillAtom.skill_id, 'mctext'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: 'Which one is a complete sentence?',
        options: opts,
        ans,
        correct_answer: ans,
        hints: [
            'Look for a subject and a predicate.',
            'A complete sentence expresses a complete thought.',
        ],
        rit_difficulty: 188,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: false,
    };
}

// Atom: language_sentence_run_on
function _genRunOn(skillAtom, mechanic, rng) {
    if (mechanic === 'two-button-binary') {
        const isRunOn = rng() < 0.5;
        const sample = isRunOn
            ? _pick(RUN_ON_SENTENCES, rng).runon
            : _pick(COMPLETE_SENTENCES, rng);
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            stem: 'Is this a run-on sentence?',
            subject: sample,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: isRunOn ? 'yes' : 'no',
            correct_answer: isRunOn ? 'yes' : 'no',
            hints: [
                'A run-on joins two complete thoughts without proper punctuation or a connector.',
                'Listen for two thoughts that should be separated.',
            ],
            rit_difficulty: 190,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: true,
            k2_appropriate: false,
        };
    }
    if (mechanic === 'drop-down-inline') {
        const item = _pick(RUN_ON_SENTENCES, rng);
        const stemTemplate = `${item.clause1}, {{slot:0}} ${item.clause2}.`;
        const distractors = _shuffle(['and', 'but', 'so', 'or', 'because']
            .filter(c => c !== item.conj), rng).slice(0, 3);
        const slotOptions = _shuffle([item.conj, ...distractors], rng);
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem: stemTemplate,
            task_text: 'Choose the conjunction that fixes the run-on.',
            slots: [{ id: 'slot:0', options: slotOptions, correct: item.conj }],
            ans: { 'slot:0': item.conj },
            correct_answer: { 'slot:0': item.conj },
            hints: ['Pick the connector that makes the two thoughts flow logically.'],
            rit_difficulty: 195,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }
    // Default: mc-text — which sentence is a run-on?
    const target = _pick(RUN_ON_SENTENCES, rng).runon;
    const distractors = _shuffle(COMPLETE_SENTENCES, rng).slice(0, 3);
    const labels = _shuffle([target, ...distractors], rng);
    const { opts, ans } = _toOptions(labels, target);
    return {
        id: _qid(skillAtom.skill_id, 'mctext'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: 'Which one is a run-on sentence?',
        options: opts,
        ans,
        correct_answer: ans,
        hints: ['A run-on jams two complete sentences together without a connector or punctuation.'],
        rit_difficulty: 192,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: false,
    };
}

// Atom: language_sentence_simple_compound_complex
function _genSimpleCompoundComplex(skillAtom, mechanic, rng) {
    const pool = SCC_SENTENCES.filter(s => s.type !== 'compound-complex');
    // Re-route non-auto-gradable mechanics into the multi-select variant
    if (mechanic === 'tap-hotspot' || mechanic === 'fib-auto') {
        mechanic = 'mc-multi-select';
    }
    if (mechanic === 'mc-multi-select') {
        // "Select all the COMPOUND sentences" — vary the target type each call
        const targetType = _pick(['simple', 'compound', 'complex'], rng);
        const targets = _shuffle(pool.filter(p => p.type === targetType), rng).slice(0, 2);
        const distractors = _shuffle(pool.filter(p => p.type !== targetType), rng).slice(0, 3);
        const all = _shuffle([...targets, ...distractors], rng);
        const options = all.map((s, i) => ({
            id: `o${i}`, label: s.text, correct: s.type === targetType,
        }));
        const ans = options.filter(o => o.correct).map(o => o.id);
        return {
            id: _qid(skillAtom.skill_id, 'mms'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-multi-select',
            skill_atom: skillAtom,
            stem: `Select ALL the ${targetType} sentences.`,
            options,
            ans,
            correct_answer: ans,
            minCorrect: 1,
            hints: [
                targetType === 'simple'
                    ? 'A simple sentence has one independent clause.'
                    : targetType === 'compound'
                        ? 'A compound sentence joins two independent clauses with FANBOYS (and/but/so/or).'
                        : 'A complex sentence has one independent clause and one dependent clause (because/when/although).',
            ],
            rit_difficulty: 200,
            grade_level: skillAtom.developmental_band || '4-5+',
            has_audio: false,
            k2_appropriate: false,
        };
    }
    if (mechanic === 'sort-into-bins') {
        const sample = [
            ..._shuffle(pool.filter(p => p.type === 'simple'),   rng).slice(0, 2),
            ..._shuffle(pool.filter(p => p.type === 'compound'), rng).slice(0, 2),
            ..._shuffle(pool.filter(p => p.type === 'complex'),  rng).slice(0, 2),
        ];
        const items = sample.map((s, i) => ({
            id: `s${i}`, label: s.text, correct_bin: s.type,
        }));
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each sentence by its type.',
            items: _shuffle(items, rng),
            bins: [
                { id: 'simple',   label: 'Simple',   color: '#e3f2fd' },
                { id: 'compound', label: 'Compound', color: '#fff3e0' },
                { id: 'complex',  label: 'Complex',  color: '#f3e5f5' },
            ],
            ans: items.reduce((m, it) => { m[it.id] = it.correct_bin; return m; }, {}),
            hints: [
                'Simple = one independent clause.',
                'Compound = two independent clauses joined by and/but/so/or.',
                'Complex = one independent clause + one dependent clause (because, when, although).',
            ],
            rit_difficulty: 198,
            grade_level: skillAtom.developmental_band || '4-5+',
            has_audio: false,
            k2_appropriate: false,
        };
    }
    // Default mc-text — classify a single sentence
    const target = _pick(pool, rng);
    const labels = ['simple', 'compound', 'complex'];
    const { opts, ans } = _toOptions(labels, target.type);
    return {
        id: _qid(skillAtom.skill_id, 'mctext'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `What type of sentence is this?\n\n"${target.text}"`,
        options: opts,
        ans,
        correct_answer: ans,
        hints: [
            'Count the independent and dependent clauses.',
            'Look for FANBOYS (compound) or because/when/although (complex).',
        ],
        rit_difficulty: 200,
        grade_level: skillAtom.developmental_band || '4-5+',
        has_audio: false,
        k2_appropriate: false,
    };
}

// Atom: language_sentence_combining
function _genCombining(skillAtom, mechanic, rng) {
    // Re-route fib-auto / open-response-fib to sequence-events for variety
    // (open-ended free-text is not auto-gradable; sequence-events is).
    if (mechanic === 'fib-auto' || mechanic === 'open-response-fib') {
        mechanic = 'sequence-events';
    }
    if (mechanic === 'drop-down-inline') {
        const pair = _pick(COMBINE_PAIRS, rng);
        // Build cloze: clause1, {{slot:0}} clause2.
        const c1 = pair.a.replace(/\.$/, '');
        const c2 = pair.b.replace(/^./, m => m.toLowerCase()).replace(/\.$/, '');
        const stem = `${c1}, {{slot:0}} ${c2}.`;
        const distractors = _shuffle(['and', 'but', 'so', 'because', 'when', 'or']
            .filter(c => c !== pair.conj), rng).slice(0, 3);
        const slotOptions = _shuffle([pair.conj, ...distractors], rng);
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem,
            task_text: 'Choose the best conjunction to combine the two ideas.',
            slots: [{ id: 'slot:0', options: slotOptions, correct: pair.conj }],
            ans: { 'slot:0': pair.conj },
            correct_answer: { 'slot:0': pair.conj },
            hints: [
                'and = adds, but = contrast, so = result, because = reason, when = time.',
            ],
            rit_difficulty: 200,
            grade_level: skillAtom.developmental_band || '4-5+',
            has_audio: false,
            k2_appropriate: false,
        };
    }
    if (mechanic === 'mc-text') {
        const pair = _pick(COMBINE_PAIRS, rng);
        const distractorsPool = COMBINE_PAIRS.filter(p => p.joined !== pair.joined);
        const distractors = _shuffle(distractorsPool, rng).slice(0, 3).map(p => p.joined);
        const labels = _shuffle([pair.joined, ...distractors], rng);
        const { opts, ans } = _toOptions(labels, pair.joined);
        return {
            id: _qid(skillAtom.skill_id, 'mctext'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'mc-text',
            skill_atom: skillAtom,
            stem: `Which sentence best combines these two?\n\n"${pair.a}" + "${pair.b}"`,
            options: opts,
            ans,
            correct_answer: ans,
            hints: ['Look for the connector that fits the meaning.'],
            rit_difficulty: 200,
            grade_level: skillAtom.developmental_band || '4-5+',
            has_audio: false,
            k2_appropriate: false,
        };
    }
    if (mechanic === 'sequence-events') {
        // Rearrange logical chunks of the combined sentence in order.
        // Build 3-4 phrase tiles whose ids are 1..N to drive deterministic order.
        const pair = _pick(COMBINE_PAIRS, rng);
        // Split the joined sentence into a few logical chunks
        const parts = pair.joined.replace(/\.$/, '').split(/,\s+/);
        // If only one chunk (no comma), fall back to splitting on the conjunction
        let chunks = parts.length > 1
            ? parts
            : pair.joined.replace(/\.$/, '').split(new RegExp(`\\s+${pair.conj}\\s+`)).map((p, i, a) =>
                i === a.length - 1 ? `${pair.conj} ${p}` : p);
        const events = chunks.map((label, i) => ({
            id: String(i + 1),
            label: label.trim(),
        }));
        return {
            id: _qid(skillAtom.skill_id, 'seq'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sequence-events',
            skill_atom: skillAtom,
            events,
            task_text: 'Drag the parts of the combined sentence into the correct order.',
            ans: events.map(e => e.id),
            correct_answer: events.map(e => e.id),
            hints: ['Start with the first idea, then the connector, then the second idea.'],
            rit_difficulty: 200,
            grade_level: skillAtom.developmental_band || '4-5+',
            has_audio: false,
            k2_appropriate: false,
        };
    }
    // Default: sentence-build — assemble the joined sentence from word tiles
    const pair = _pick(COMBINE_PAIRS, rng);
    const tiles = pair.joined.split(/\s+/);
    return {
        id: _qid(skillAtom.skill_id, 'sb'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'sentence-build',
        skill_atom: skillAtom,
        target_sentence: pair.joined,
        word_tiles: tiles,
        task_text: `Combine these two sentences:\n"${pair.a}" + "${pair.b}"\nDrag the tiles to build the combined sentence.`,
        ans: pair.joined,
        correct_answer: pair.joined,
        hints: [`Use the conjunction "${pair.conj}" to join the ideas.`],
        rit_difficulty: 202,
        grade_level: skillAtom.developmental_band || '4-5+',
        has_audio: false,
        k2_appropriate: false,
    };
}

// Atom: language_sentence_dependent_clause
function _genDependentClause(skillAtom, mechanic, rng) {
    if (mechanic === 'tap-hotspot') {
        // Tap the subordinating conjunction in a complex sentence.
        const items = [
            { sentence: "We went inside because it started to rain.",  target: "because"  },
            { sentence: "I will call you when I get home.",             target: "when"     },
            { sentence: "Although it was late, we kept playing.",       target: "Although" },
            { sentence: "She will be happy if you visit.",              target: "if"       },
            { sentence: "I waited until the bus arrived.",              target: "until"    },
            { sentence: "We sang while we walked home.",                target: "while"    },
        ];
        const item = _pick(items, rng);
        // Build hotspots: every word, only the conjunction is correct.
        const words = item.sentence.split(/\s+/);
        const hotspots = words.map((w, i) => {
            const cleaned = w.replace(/[.,!?;:]/g, '');
            return { id: `w${i}`, label: cleaned, correct: cleaned === item.target };
        });
        const correctHs = hotspots.find(h => h.correct);
        return {
            id: _qid(skillAtom.skill_id, 'tap'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'tap-hotspot',
            skill_atom: skillAtom,
            passage: item.sentence,
            hotspots,
            ans: correctHs.id,
            correct_answer: correctHs.id,
            multi_select: false,
            stem: 'Tap the subordinating conjunction.',
            hints: ['Subordinating conjunctions: because, when, although, if, since, until, while.'],
            rit_difficulty: 198,
            grade_level: skillAtom.developmental_band || '4-5+',
            has_audio: false,
            k2_appropriate: false,
        };
    }
    if (mechanic === 'drop-down-inline') {
        const item = _pick(SUBORDINATING_CLOZE, rng);
        return {
            id: _qid(skillAtom.skill_id, 'ddi'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'drop-down-inline',
            skill_atom: skillAtom,
            stem: item.stem,
            task_text: 'Choose the subordinating conjunction that best fits.',
            slots: [{ id: 'slot:0', options: _shuffle(item.options, rng), correct: item.correct }],
            ans: { 'slot:0': item.correct },
            correct_answer: { 'slot:0': item.correct },
            hints: [
                'Subordinating conjunctions: because, when, although, if, since, until, while.',
            ],
            rit_difficulty: 200,
            grade_level: skillAtom.developmental_band || '4-5+',
            has_audio: false,
            k2_appropriate: false,
        };
    }
    // Default: mc-text — which is a dependent clause?
    const target = _pick(CLAUSE_BANK.filter(c => c.kind === 'dependent'), rng).text;
    const distractors = _shuffle(
        CLAUSE_BANK.filter(c => c.kind === 'independent'),
        rng,
    ).slice(0, 3).map(c => c.text);
    const labels = _shuffle([target, ...distractors], rng);
    const { opts, ans } = _toOptions(labels, target);
    return {
        id: _qid(skillAtom.skill_id, 'mctext'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: 'Which one is a dependent clause?',
        options: opts,
        ans,
        correct_answer: ans,
        hints: ['A dependent clause cannot stand alone — it usually starts with a subordinating word.'],
        rit_difficulty: 200,
        grade_level: skillAtom.developmental_band || '4-5+',
        has_audio: false,
        k2_appropriate: false,
    };
}

// Atom: language_sentence_independent_clause
function _genIndependentClause(skillAtom, mechanic, rng) {
    if (mechanic === 'two-button-binary') {
        const isIndependent = rng() < 0.5;
        const pool = CLAUSE_BANK.filter(c => c.kind === (isIndependent ? 'independent' : 'dependent'));
        const sample = _pick(pool, rng).text;
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            stem: 'Is this an independent clause (can it stand alone)?',
            subject: sample,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: isIndependent ? 'yes' : 'no',
            correct_answer: isIndependent ? 'yes' : 'no',
            hints: [
                'An independent clause has a subject and predicate AND expresses a complete thought.',
            ],
            rit_difficulty: 195,
            grade_level: skillAtom.developmental_band || '4-5+',
            has_audio: true,
            k2_appropriate: false,
        };
    }
    // Default: mc-text
    const target = _pick(CLAUSE_BANK.filter(c => c.kind === 'independent'), rng).text;
    const distractors = _shuffle(CLAUSE_BANK.filter(c => c.kind === 'dependent'), rng)
        .slice(0, 3).map(c => c.text);
    const labels = _shuffle([target, ...distractors], rng);
    const { opts, ans } = _toOptions(labels, target);
    return {
        id: _qid(skillAtom.skill_id, 'mctext'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: 'Which one is an independent clause?',
        options: opts,
        ans,
        correct_answer: ans,
        hints: ['Look for a clause that could stand alone as a sentence.'],
        rit_difficulty: 195,
        grade_level: skillAtom.developmental_band || '4-5+',
        has_audio: false,
        k2_appropriate: false,
    };
}

// Atom: language_sentence_compound_complex
function _genCompoundComplex(skillAtom, mechanic, rng) {
    if (mechanic === 'two-button-binary') {
        const isCC = rng() < 0.5;
        const pool = SCC_SENTENCES.filter(s => isCC
            ? s.type === 'compound-complex'
            : s.type !== 'compound-complex');
        const sample = _pick(pool, rng);
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            stem: 'Is this a compound-complex sentence?',
            subject: sample.text,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: isCC ? 'yes' : 'no',
            correct_answer: isCC ? 'yes' : 'no',
            hints: [
                'Compound-complex = at least 2 independent clauses + at least 1 dependent clause.',
            ],
            rit_difficulty: 205,
            grade_level: skillAtom.developmental_band || '4-5+',
            has_audio: false,
            k2_appropriate: false,
        };
    }
    // Default: mc-text — pick the compound-complex from 4 options
    const target = _pick(SCC_SENTENCES.filter(s => s.type === 'compound-complex'), rng).text;
    const distractors = _shuffle(SCC_SENTENCES.filter(s => s.type !== 'compound-complex'), rng)
        .slice(0, 3).map(s => s.text);
    const labels = _shuffle([target, ...distractors], rng);
    const { opts, ans } = _toOptions(labels, target);
    return {
        id: _qid(skillAtom.skill_id, 'mctext'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: 'Which sentence is compound-complex?',
        options: opts,
        ans,
        correct_answer: ans,
        hints: ['Look for two independent clauses AND a dependent clause (because/when/although).'],
        rit_difficulty: 205,
        grade_level: skillAtom.developmental_band || '4-5+',
        has_audio: false,
        k2_appropriate: false,
    };
}

// Shared helper for purpose atoms (declarative/interrogative/exclamatory/imperative)
function _genPurposeAtom(skillAtom, mechanic, rng, targetType, prettyName) {
    const targetPool = PURPOSE_SENTENCES.filter(s => s.type === targetType);
    const otherPool  = PURPOSE_SENTENCES.filter(s => s.type !== targetType);

    if (mechanic === 'two-button-binary') {
        const isTarget = rng() < 0.5;
        const sample = isTarget ? _pick(targetPool, rng) : _pick(otherPool, rng);
        return {
            id: _qid(skillAtom.skill_id, 'tbb'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'two-button-binary',
            skill_atom: skillAtom,
            stem: `Is this a ${prettyName} sentence?`,
            subject: sample.text,
            options: [
                { id: 'yes', label: 'Yes' },
                { id: 'no',  label: 'No'  },
            ],
            ans: isTarget ? 'yes' : 'no',
            correct_answer: isTarget ? 'yes' : 'no',
            hints: [
                _purposeHint(targetType),
            ],
            rit_difficulty: 162,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: true,
            k2_appropriate: true,
        };
    }
    if (mechanic === 'sort-into-bins') {
        const sample = [
            ..._shuffle(targetPool, rng).slice(0, 2).map((s, i) => ({
                id: `t${i}`, label: s.text, correct_bin: targetType,
            })),
            ..._shuffle(otherPool, rng).slice(0, 4).map((s, i) => ({
                id: `o${i}`, label: s.text, correct_bin: 'other',
            })),
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: `Sort the sentences. Which ones are ${prettyName}?`,
            items: _shuffle(sample, rng),
            bins: [
                { id: targetType, label: prettyName.charAt(0).toUpperCase() + prettyName.slice(1), color: '#e3f2fd' },
                { id: 'other',    label: 'Not ' + prettyName, color: '#fff3e0' },
            ],
            ans: sample.reduce((m, it) => { m[it.id] = it.correct_bin; return m; }, {}),
            hints: [_purposeHint(targetType)],
            rit_difficulty: 165,
            grade_level: skillAtom.developmental_band || 'K-1',
            has_audio: false,
            k2_appropriate: false,
        };
    }
    // Default: mc-text — pick the matching sentence from 4 options
    const target = _pick(targetPool, rng).text;
    const distractors = _shuffle(otherPool, rng).slice(0, 3).map(s => s.text);
    const labels = _shuffle([target, ...distractors], rng);
    const { opts, ans } = _toOptions(labels, target);
    return {
        id: _qid(skillAtom.skill_id, 'mctext'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `Which sentence is ${prettyName}?`,
        options: opts,
        ans,
        correct_answer: ans,
        hints: [_purposeHint(targetType)],
        rit_difficulty: 165,
        grade_level: skillAtom.developmental_band || 'K-1',
        has_audio: true,
        k2_appropriate: true,
    };
}

function _purposeHint(type) {
    switch (type) {
        case 'declarative':   return 'A declarative sentence makes a statement and ends with a period.';
        case 'interrogative': return 'An interrogative sentence asks a question and ends with a question mark.';
        case 'exclamatory':   return 'An exclamatory sentence shows strong feeling and ends with an exclamation point.';
        case 'imperative':    return 'An imperative sentence gives a command — the subject "you" is implied.';
        default:              return 'Look at the meaning and the end punctuation.';
    }
}

// Atom: language_sentence_topic_sentence_structure
function _genTopicSentence(skillAtom, mechanic, rng) {
    const set = _pick(TOPIC_SETS, rng);
    // Re-route non-auto-gradable mechanics to hot-text-sentence
    if (mechanic === 'fib-auto') mechanic = 'hot-text-sentence';
    if (mechanic === 'hot-text-sentence') {
        // Build a paragraph (topic first, then 2 details). Correct sentence index = 0.
        const passage = [set.topic, set.details[0], set.details[1]].join(' ');
        return {
            id: _qid(skillAtom.skill_id, 'hts'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'hot-text-sentence',
            skill_atom: skillAtom,
            passage,
            granularity: 'sentence',
            task_text: 'Highlight the topic sentence (the main idea of the paragraph).',
            correct_indices: [0],
            multi_select: false,
            hints: ['The topic sentence states the controlling idea — usually first.'],
            rit_difficulty: 192,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }
    if (mechanic === 'sort-into-bins') {
        const items = [
            { id: 't0', label: set.topic, correct_bin: 'topic' },
            ...set.details.map((d, i) => ({ id: `d${i}`, label: d, correct_bin: 'detail' })),
        ];
        return {
            id: _qid(skillAtom.skill_id, 'sort'),
            skill_ids: [skillAtom.skill_id],
            question_type: 'sort-into-bins',
            skill_atom: skillAtom,
            task_text: 'Sort each sentence: is it the TOPIC sentence or a DETAIL sentence?',
            items: _shuffle(items, rng),
            bins: [
                { id: 'topic',  label: 'Topic Sentence',  color: '#e8f5e9' },
                { id: 'detail', label: 'Detail Sentence', color: '#e3f2fd' },
            ],
            ans: items.reduce((m, it) => { m[it.id] = it.correct_bin; return m; }, {}),
            hints: [
                'The topic sentence states the main idea of the paragraph.',
                'Detail sentences give facts or examples about the main idea.',
            ],
            rit_difficulty: 192,
            grade_level: skillAtom.developmental_band || '2-3',
            has_audio: false,
            k2_appropriate: false,
        };
    }
    // Default: mc-text — find the topic sentence from 4 options
    const target = set.topic;
    const distractors = set.details.slice(0, 3);
    const labels = _shuffle([target, ...distractors], rng);
    const { opts, ans } = _toOptions(labels, target);
    return {
        id: _qid(skillAtom.skill_id, 'mctext'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: 'Which sentence is the TOPIC sentence (the main idea)?',
        options: opts,
        ans,
        correct_answer: ans,
        hints: ['The topic sentence states the controlling idea — the others give details about it.'],
        rit_difficulty: 192,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: false,
        k2_appropriate: false,
    };
}

// ─── Public API ─────────────────────────────────────────────────────────────

// Generic stage-1 fallback (used in generateSentenceStructureQuestion BEFORE
// dispatch). Per-atom dispatchers may further reroute mechanics they want to
// handle specially (e.g. SCC routes fib-auto → mc-multi-select internally).
// Keep this list small; let dispatchers own the auto-gradable fallback.
const STAGE1_FALLBACK = {
    'word-tagger':      'mc-text',
    'hot-text-word':    'mc-text',
    'dnd-linked':       'sort-into-bins',
};

function _pickMechanic(skillAtom, mechanicHint, rng) {
    const available = Array.isArray(skillAtom.question_types) && skillAtom.question_types.length > 0
        ? skillAtom.question_types
        : ['mc-text'];
    if (mechanicHint && available.includes(mechanicHint)) return mechanicHint;
    return _pick(available, rng);
}

const SUPPORTED_DISPATCH = {
    'language_sentence_fragment_vs_sentence':       _genFragmentVsSentence,
    'language_sentence_run_on':                     _genRunOn,
    'language_sentence_simple_compound_complex':    _genSimpleCompoundComplex,
    'language_sentence_combining':                  _genCombining,
    'language_sentence_dependent_clause':           _genDependentClause,
    'language_sentence_independent_clause':         _genIndependentClause,
    'language_sentence_compound_complex':           _genCompoundComplex,
    'language_sentence_declarative':                (a, m, r) => _genPurposeAtom(a, m, r, 'declarative',   'declarative'),
    'language_sentence_interrogative':              (a, m, r) => _genPurposeAtom(a, m, r, 'interrogative', 'interrogative'),
    'language_sentence_exclamatory':                (a, m, r) => _genPurposeAtom(a, m, r, 'exclamatory',   'exclamatory'),
    'language_sentence_imperative':                 (a, m, r) => _genPurposeAtom(a, m, r, 'imperative',    'imperative'),
    'language_sentence_topic_sentence_structure':   _genTopicSentence,
};

export function generateSentenceStructureQuestion(skillAtom, mechanicHint = null, options = {}) {
    if (!skillAtom || !skillAtom.skill_id) return _comingSoon(skillAtom || {});
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;

    const dispatch = SUPPORTED_DISPATCH[skillAtom.skill_id];
    if (!dispatch) return _comingSoon(skillAtom);

    const mechanic = _pickMechanic(skillAtom, mechanicHint, rng);
    const widget   = STAGE1_FALLBACK[mechanic] || mechanic;

    return dispatch(skillAtom, widget, rng);
}

export function buildSentenceStructureDeck(skillAtom, count = 10, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    const available = Array.isArray(skillAtom.question_types) && skillAtom.question_types.length > 0
        ? skillAtom.question_types
        : ['mc-text'];

    const deck = [];
    const window3 = [];
    for (let i = 0; i < count; i++) {
        const eligible = available.filter(m => !window3.includes(m));
        const pool = eligible.length > 0 ? eligible : available;
        const mechanic = _pick(pool, rng);
        deck.push(generateSentenceStructureQuestion(skillAtom, mechanic, { ...options, rng }));
        window3.push(mechanic);
        if (window3.length > 3) window3.shift();
    }
    return deck;
}

export default { generateSentenceStructureQuestion, buildSentenceStructureDeck };
