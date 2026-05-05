// gen-comprehension.js — Question generator for the Comprehension strands.
//
// Public API:
//   generateComprehensionQuestion(skillAtom, mechanicHint?, options?) → Question
//   buildComprehensionDeck(skillAtom, count?, options?)               → Question[]

import { getDecodablePassagesForSet } from './ufli-content.js';

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
        k2_appropriate: true,
    };
}

function _isLowRit(skillAtom) {
    const band = skillAtom.developmental_band || '';
    return /^K|^K-1|^1$|^1-2/.test(band);
}

function _options(arr) {
    return arr.map((label, i) => ({ id: String.fromCharCode(97 + i), label }));
}

function _optionsWithCorrect(correct, distractors, rng) {
    const all = _shuffle([correct, ...distractors], rng);
    const opts = _options(all);
    return { opts, ans: opts.find(o => o.label === correct).id };
}

// ─── Curated passages ───────────────────────────────────────────────────────
//
// Each passage carries baked-in answer hooks so generators can construct
// questions without NLP. Many fields are arrays so different mechanics can
// pick what they need.

const LITERATURE_PASSAGES = [
    {
        id: 'lit_lost_kite',
        text: "Mia took her red kite to the park. The wind blew hard and the string slipped from her hand. The kite flew into a tall oak tree. Mia's brother climbed up and pulled it down. Mia hugged him and smiled.",
        characters: ['Mia', 'Mia\'s brother'],
        main_character: 'Mia',
        setting: 'a park',
        setting_distractors: ['a school', 'a beach', 'a kitchen'],
        problem: 'Her kite got stuck in a tall tree.',
        problem_distractors: ['She lost her shoes.', 'She broke her bike.', 'She forgot her lunch.'],
        solution: 'Her brother climbed up and got the kite.',
        solution_distractors: ['She bought a new kite.', 'She went home crying.', 'A bird brought it down.'],
        theme: 'Family helps each other.',
        theme_distractors: ['Money buys happiness.', 'Always run from the wind.', 'Trees are dangerous.'],
        events: [
            { id: '1', label: 'Mia took her kite to the park.' },
            { id: '2', label: 'The wind pulled the kite away.' },
            { id: '3', label: 'The kite got stuck in a tree.' },
            { id: '4', label: 'Her brother climbed up and got it down.' },
        ],
        inference: 'Mia felt grateful to her brother.',
        inference_distractors: ['Mia hated her brother.', 'Mia was bored at the park.', 'Mia wanted a new kite.'],
        pov: 'third person',
    },
    {
        id: 'lit_jay_pancakes',
        text: "Jay woke up hungry on Saturday. He wanted pancakes, but the kitchen was a mess and there were no eggs. Jay walked to the corner store and bought a carton. Back home, he cleaned the counter and flipped a fluffy stack of pancakes. He ate every bite.",
        characters: ['Jay'],
        main_character: 'Jay',
        setting: 'Jay\'s home and the corner store',
        setting_distractors: ['a school cafeteria', 'a forest cabin', 'a busy airport'],
        problem: 'He had no eggs and the kitchen was messy.',
        problem_distractors: ['He could not find his shoes.', 'The store was closed.', 'He forgot how to cook.'],
        solution: 'He bought eggs and cleaned up so he could cook.',
        solution_distractors: ['He skipped breakfast.', 'He ordered a pizza.', 'He went back to bed.'],
        theme: 'Hard work earns a reward.',
        theme_distractors: ['Pancakes are unhealthy.', 'Stores are always open.', 'Cooking is impossible.'],
        events: [
            { id: '1', label: 'Jay woke up hungry on Saturday.' },
            { id: '2', label: 'He noticed there were no eggs.' },
            { id: '3', label: 'He went to the store to buy eggs.' },
            { id: '4', label: 'He cooked and ate the pancakes.' },
        ],
        inference: 'Jay felt proud after he cooked.',
        inference_distractors: ['Jay was angry at the store.', 'Jay never wanted pancakes again.', 'Jay missed breakfast entirely.'],
        pov: 'third person',
    },
    {
        id: 'lit_my_lost_dog',
        text: "I lost my puppy at the park yesterday. I called her name over and over, but she did not come. I sat on a bench and almost cried. Then I heard a small bark behind a bush. I ran over and there she was, wagging her tail.",
        characters: ['the narrator', 'the puppy'],
        main_character: 'the narrator',
        setting: 'a park',
        setting_distractors: ['a forest', 'a beach', 'a library'],
        problem: 'The narrator\'s puppy was lost.',
        problem_distractors: ['The narrator broke a leash.', 'The narrator could not find a bench.', 'The narrator lost a hat.'],
        solution: 'The narrator heard a bark and found the puppy behind a bush.',
        solution_distractors: ['The narrator went home alone.', 'A stranger gave them a new puppy.', 'The puppy never came back.'],
        theme: 'Do not give up hope.',
        theme_distractors: ['Puppies are dangerous.', 'Parks are always crowded.', 'Crying solves problems.'],
        events: [
            { id: '1', label: 'The narrator lost the puppy.' },
            { id: '2', label: 'The narrator called her name.' },
            { id: '3', label: 'The narrator heard a bark.' },
            { id: '4', label: 'The narrator found the puppy.' },
        ],
        inference: 'The narrator was relieved to find the puppy.',
        inference_distractors: ['The narrator was angry at the puppy.', 'The narrator wanted a different pet.', 'The narrator was bored at the park.'],
        pov: 'first person',
    },
    {
        id: 'lit_fox_grapes',
        text: "A hungry fox spotted a bunch of grapes hanging from a vine. He jumped and jumped, but the grapes were too high. After many tries, the fox gave up. He walked away muttering, \"They were probably sour anyway.\"",
        characters: ['the fox'],
        main_character: 'the fox',
        setting: 'near a grape vine',
        setting_distractors: ['inside a barn', 'on a snowy mountain', 'in a city street'],
        problem: 'The grapes were too high to reach.',
        problem_distractors: ['The fox lost his fur.', 'The vine was on fire.', 'A farmer chased him.'],
        solution: 'The fox gave up and pretended he did not want them.',
        solution_distractors: ['The fox climbed a ladder.', 'The fox shared with friends.', 'The fox bought new grapes.'],
        theme: 'It is easy to dislike what we cannot have.',
        theme_distractors: ['Grapes are always sour.', 'Foxes love climbing.', 'Vines are dangerous.'],
        events: [
            { id: '1', label: 'The fox saw grapes on a vine.' },
            { id: '2', label: 'He jumped many times to reach them.' },
            { id: '3', label: 'He could not reach the grapes.' },
            { id: '4', label: 'He walked away saying they were sour.' },
        ],
        inference: 'The fox was disappointed but did not want to admit it.',
        inference_distractors: ['The fox was full and not hungry.', 'The fox was scared of grapes.', 'The fox forgot why he came.'],
        pov: 'third person',
    },
    {
        id: 'lit_emma_recital',
        text: "Emma practiced piano every day for the recital. The night before, her hands shook. She thought about quitting. But she remembered her teacher's words: \"You have worked too hard to stop now.\" The next day, she played beautifully and the crowd clapped.",
        characters: ['Emma', 'her teacher'],
        main_character: 'Emma',
        setting: 'at home and a recital hall',
        setting_distractors: ['at a soccer field', 'on a beach', 'in a forest'],
        problem: 'Emma was nervous and almost quit.',
        problem_distractors: ['Emma broke her piano.', 'Emma lost her ticket.', 'Emma forgot the song.'],
        solution: 'She remembered her teacher\'s advice and performed.',
        solution_distractors: ['She skipped the recital.', 'A friend played for her.', 'She played a different song.'],
        theme: 'Perseverance pays off.',
        theme_distractors: ['Practice is boring.', 'Crowds are mean.', 'Teachers are unfair.'],
        events: [
            { id: '1', label: 'Emma practiced for the recital.' },
            { id: '2', label: 'She got nervous the night before.' },
            { id: '3', label: 'She remembered her teacher\'s advice.' },
            { id: '4', label: 'She played well at the recital.' },
        ],
        inference: 'Emma felt proud after she performed.',
        inference_distractors: ['Emma decided to quit piano forever.', 'Emma did not care about the recital.', 'Emma was angry at the audience.'],
        pov: 'third person',
    },
    {
        id: 'lit_lost_in_woods',
        text: "We hiked deep into the woods looking for berries. The trail vanished under fallen leaves. I tried to stay calm, but my heart pounded. My sister noticed a bright ribbon tied to a tree. We followed the ribbons all the way back to camp.",
        characters: ['the narrator', 'the narrator\'s sister'],
        main_character: 'the narrator',
        setting: 'the woods',
        setting_distractors: ['a desert', 'a city park', 'a beach'],
        problem: 'They lost the trail in the woods.',
        problem_distractors: ['They ran out of water.', 'They forgot a backpack.', 'They saw a wild bear.'],
        solution: 'They followed ribbons tied to trees back to camp.',
        solution_distractors: ['They built a new trail.', 'They called for help.', 'They camped overnight.'],
        theme: 'Pay attention to small clues.',
        theme_distractors: ['Berries are bad.', 'Sisters are annoying.', 'Camping is dangerous.'],
        events: [
            { id: '1', label: 'They walked into the woods.' },
            { id: '2', label: 'They lost the trail.' },
            { id: '3', label: 'The sister spotted a ribbon.' },
            { id: '4', label: 'They followed ribbons back to camp.' },
        ],
        inference: 'The narrator was scared but trusted their sister.',
        inference_distractors: ['The narrator wanted to keep going deeper.', 'The narrator did not care about getting lost.', 'The narrator was happy the trail was gone.'],
        pov: 'first person',
    },
];

const INFO_PASSAGES = [
    {
        id: 'info_honeybees',
        text: "Honeybees are important insects. They help plants grow by carrying pollen from flower to flower. Bees also make honey, which people have eaten for thousands of years. Without bees, many fruits and vegetables would disappear.",
        topic: 'honeybees',
        main_idea: 'Honeybees are important to plants and people.',
        main_idea_distractors: [
            'Bees only make honey for people.',
            'All insects pollinate flowers.',
            'Honey is the most popular food.',
        ],
        details: [
            'They carry pollen from flower to flower.',
            'They make honey that people eat.',
            'Many fruits and vegetables depend on them.',
        ],
        non_details: [
            'Bees live for a hundred years.',
            'Bees can fly to the moon.',
            'Bees never sting anyone.',
            'Bees lay eggs in the ocean.',
        ],
        purpose: 'inform',
        structure: 'description',
        evidence_sentence_index: 1, // "They help plants grow by carrying pollen..."
        cause: 'plants get pollen carried between flowers',
        effect: 'plants can grow and make fruit',
        why_question: 'Why do many fruits and vegetables depend on bees?',
        why_correct: 'Because bees carry pollen between flowers so plants can grow.',
        why_distractors: [
            'Because bees water the plants daily.',
            'Because bees plant the seeds.',
            'Because bees scare away other insects.',
        ],
    },
    {
        id: 'info_water_cycle',
        text: "The sun heats water in oceans and lakes. The water turns into invisible vapor and rises into the sky. High up, the vapor cools and forms clouds. When the clouds get heavy, rain falls back to earth. This loop is called the water cycle.",
        topic: 'the water cycle',
        main_idea: 'Water moves through the sky and back to earth in a cycle.',
        main_idea_distractors: [
            'Clouds are heavy and dangerous.',
            'Oceans contain all the world\'s water.',
            'Rain only falls in the summer.',
        ],
        details: [
            'The sun heats water until it becomes vapor.',
            'Vapor cools high in the sky and forms clouds.',
            'Heavy clouds release rain back to earth.',
        ],
        non_details: [
            'The moon causes the water cycle.',
            'Trees drink most of the rain.',
            'Snow never falls anywhere.',
            'Vapor is heavier than rocks.',
        ],
        purpose: 'inform',
        structure: 'sequence',
        evidence_sentence_index: 0,
        cause: 'the sun heats water',
        effect: 'water turns into vapor and rises',
        why_question: 'Why does water turn into vapor?',
        why_correct: 'Because the sun heats it until it rises as vapor.',
        why_distractors: [
            'Because clouds push it up.',
            'Because animals drink the rain.',
            'Because the wind freezes it.',
        ],
    },
    {
        id: 'info_recycle',
        text: "We should all recycle every day. Recycling saves trees, cuts down on trash, and saves energy. It only takes a minute to sort a can or a bottle. If everyone recycles, our planet will be cleaner. Please, start today!",
        topic: 'recycling',
        main_idea: 'Everyone should recycle to help the planet.',
        main_idea_distractors: [
            'Recycling takes a long time.',
            'Trash is good for the planet.',
            'Cans are better than bottles.',
        ],
        details: [
            'Recycling saves trees.',
            'Recycling reduces trash.',
            'Recycling saves energy.',
        ],
        non_details: [
            'Recycling makes plants grow taller.',
            'Recycling cures sick animals.',
            'Recycling causes pollution.',
            'Recycling is a kind of dance.',
        ],
        purpose: 'persuade',
        structure: 'problem_solution',
        evidence_sentence_index: 1,
        cause: 'everyone recycles',
        effect: 'the planet stays cleaner',
        why_question: 'Why does the author say we should recycle?',
        why_correct: 'Because it saves trees, cuts trash, and saves energy.',
        why_distractors: [
            'Because trash is more fun than recycling.',
            'Because trees do not need help.',
            'Because cans are heavier than bottles.',
        ],
    },
    {
        id: 'info_dogs_cats',
        text: "Dogs and cats are popular pets, but they are different. Dogs love to play outside and follow their owners everywhere. Cats prefer to be alone and stay near windows. Both animals enjoy treats, however, and both purr or wag when they are happy.",
        topic: 'dogs and cats',
        main_idea: 'Dogs and cats are different but share some things in common.',
        main_idea_distractors: [
            'Cats are better than dogs.',
            'Dogs hate going outside.',
            'Pets do not show their feelings.',
        ],
        details: [
            'Dogs play outside and follow their owners.',
            'Cats prefer to be alone near windows.',
            'Both animals enjoy treats.',
        ],
        non_details: [
            'Both animals can fly short distances.',
            'Cats and dogs only eat fish.',
            'Dogs are silent and never bark.',
            'Cats hate windows.',
        ],
        purpose: 'inform',
        structure: 'compare_contrast',
        evidence_sentence_index: 0,
        cause: 'dogs and cats have different personalities',
        effect: 'they behave differently with their owners',
        why_question: 'Why does the author compare dogs and cats?',
        why_correct: 'To show how they are different and how they are alike.',
        why_distractors: [
            'To prove cats are smarter than dogs.',
            'To show that pets are dangerous.',
            'To explain how to train a fish.',
        ],
    },
    {
        id: 'info_pollution',
        text: "Plastic in the ocean is a big problem. Sea animals can mistake plastic bags for food and get sick. One solution is to use cloth bags instead of plastic ones. Another solution is to recycle bottles. With small changes, we can keep the ocean safer.",
        topic: 'ocean plastic pollution',
        main_idea: 'Ocean plastic is a problem with simple solutions.',
        main_idea_distractors: [
            'Sea animals love eating plastic.',
            'Plastic only harms fish.',
            'Cloth bags are bad for animals.',
        ],
        details: [
            'Animals can eat plastic by mistake.',
            'Cloth bags can replace plastic ones.',
            'Recycling bottles helps the ocean.',
        ],
        non_details: [
            'Plastic bags grow on trees.',
            'Cloth bags are made of plastic.',
            'Animals never eat anything in the ocean.',
            'Bottles can swim by themselves.',
        ],
        purpose: 'persuade',
        structure: 'problem_solution',
        evidence_sentence_index: 2,
        cause: 'plastic ends up in the ocean',
        effect: 'sea animals get sick',
        why_question: 'Why do sea animals get sick from plastic?',
        why_correct: 'Because they mistake plastic bags for food.',
        why_distractors: [
            'Because plastic is too cold to swallow.',
            'Because the ocean is too clean.',
            'Because plastic glows in the dark.',
        ],
    },
    {
        id: 'info_volcanoes',
        text: "A volcano forms when hot melted rock pushes up from deep inside the earth. The pressure builds for years. When the pressure gets too strong, the volcano erupts and lava flows down the sides. After the eruption, ash settles and new land is left behind.",
        topic: 'volcanoes',
        main_idea: 'Volcanoes erupt when underground pressure becomes too strong.',
        main_idea_distractors: [
            'Volcanoes are made of cold rocks.',
            'Lava is harmless to land.',
            'Ash makes pressure stronger.',
        ],
        details: [
            'Hot melted rock pushes up from deep in the earth.',
            'Pressure builds up over time.',
            'Lava flows down after an eruption.',
        ],
        non_details: [
            'Volcanoes are made by rivers.',
            'Volcanoes only erupt at night.',
            'Lava is always frozen.',
            'Ash sinks to the ocean floor.',
        ],
        purpose: 'inform',
        structure: 'cause_effect',
        evidence_sentence_index: 1,
        cause: 'pressure builds up underground',
        effect: 'the volcano erupts',
        why_question: 'Why does a volcano erupt?',
        why_correct: 'Because pressure from hot melted rock becomes too strong.',
        why_distractors: [
            'Because the wind pushes lava up.',
            'Because rain fills the volcano.',
            'Because birds nest inside it.',
        ],
    },
    {
        id: 'info_school_uniforms',
        text: "Our school should have uniforms. Uniforms save families money because students do not need new outfits every week. They also help students focus on learning instead of fashion. Many schools that switched to uniforms saw better grades. Uniforms make school fair for everyone.",
        topic: 'school uniforms',
        main_idea: 'School uniforms have many benefits and should be used.',
        main_idea_distractors: [
            'Fashion is the most important part of school.',
            'Uniforms cost too much money.',
            'Students do not care about clothes.',
        ],
        details: [
            'Uniforms save families money.',
            'Uniforms help students focus.',
            'Schools with uniforms saw better grades.',
        ],
        non_details: [
            'Uniforms are made of paper.',
            'All students hate uniforms.',
            'Schools must wear costumes daily.',
            'Grades only depend on lunch.',
        ],
        purpose: 'persuade',
        structure: 'description',
        evidence_sentence_index: 2,
        cause: 'students wear uniforms',
        effect: 'they focus on learning more',
        why_question: 'Why does the author think uniforms help grades?',
        why_correct: 'Because students focus on learning instead of fashion.',
        why_distractors: [
            'Because uniforms make tests easier.',
            'Because uniforms have answer keys inside.',
            'Because uniforms are required by law.',
        ],
    },
];

// ─── Sentence pools for fact/opinion ─────────────────────────────────────────

const FACT_OPINION_ITEMS = [
    { sentence: 'The Pacific Ocean is the largest ocean on Earth.', is_fact: true },
    { sentence: 'Pizza tastes better than any other food.',         is_fact: false },
    { sentence: 'A triangle has three sides.',                       is_fact: true },
    { sentence: 'Summer is the best season of the year.',            is_fact: false },
    { sentence: 'Water freezes at 32 degrees Fahrenheit.',           is_fact: true },
    { sentence: 'Dogs are nicer than cats.',                          is_fact: false },
    { sentence: 'The Great Wall of China is over 13,000 miles long.', is_fact: true },
    { sentence: 'Math is the most fun subject in school.',           is_fact: false },
    { sentence: 'Plants need sunlight to grow.',                     is_fact: true },
    { sentence: 'Everyone should learn to play guitar.',             is_fact: false },
    { sentence: 'The Moon orbits the Earth.',                        is_fact: true },
    { sentence: 'Reading books is the best hobby.',                   is_fact: false },
];

// ─── Author's Purpose distractor banks ──────────────────────────────────────

const PURPOSE_LABELS = {
    persuade: 'To persuade',
    inform: 'To inform',
    entertain: 'To entertain',
};

const TEXT_STRUCTURE_LABELS = {
    sequence: 'Sequence / chronological',
    cause_effect: 'Cause and effect',
    compare_contrast: 'Compare and contrast',
    problem_solution: 'Problem and solution',
    description: 'Description',
};

// ─── Passage selectors ──────────────────────────────────────────────────────

function _pickLitPassage(skillAtom, rng) {
    if (_isLowRit(skillAtom)) {
        const ufli = getDecodablePassagesForSet('set5') || [];
        if (ufli.length > 0) {
            // Wrap UFLI passage to a minimal lit-passage shape with manufactured questions.
            const p = _pick(ufli, rng);
            return _wrapUfliAsLit(p);
        }
    }
    return _pick(LITERATURE_PASSAGES, rng);
}

function _pickInfoPassage(skillAtom, rng, structureFilter) {
    let pool = INFO_PASSAGES;
    if (structureFilter) {
        pool = INFO_PASSAGES.filter(p => p.structure === structureFilter);
        if (pool.length === 0) pool = INFO_PASSAGES;
    }
    return _pick(pool, rng);
}

function _wrapUfliAsLit(p) {
    const text = (p && p.text) || '';
    const firstWord = (text.split(/\s+/)[0] || 'someone').replace(/[^A-Za-z']/g, '');
    return {
        id: `ufli_${p.lesson || 'x'}`,
        text,
        characters: [firstWord || 'someone'],
        main_character: firstWord || 'the character',
        setting: 'in the story',
        setting_distractors: ['under the sea', 'in outer space', 'on the moon'],
        problem: 'Read the passage to find out what happens.',
        problem_distractors: ['A dragon appears.', 'A spaceship lands.', 'A monster speaks.'],
        solution: 'Read the passage to find out how it ends.',
        solution_distractors: ['Everyone flies away.', 'A robot solves it.', 'Nothing changes ever.'],
        theme: 'Stories teach us new ideas.',
        theme_distractors: ['Stories are boring.', 'Books bite.', 'Words are silent.'],
        events: [
            { id: '1', label: 'The story begins.' },
            { id: '2', label: 'Something happens.' },
            { id: '3', label: 'The story ends.' },
        ],
        inference: 'The reader can imagine the scene.',
        inference_distractors: ['Nothing happens at all.', 'The story is upside down.', 'The reader is sleepy.'],
        pov: /\bI\b|\bmy\b|\bme\b/.test(text) ? 'first person' : 'third person',
    };
}

// ─── Generic passage MC builder ─────────────────────────────────────────────

function _buildPassageMc(skillAtom, passage, stem, correct, distractors, rng, mechanic = 'mctext') {
    const { opts, ans } = _optionsWithCorrect(correct, distractors, rng);
    return {
        id: _qid(skillAtom.skill_id, mechanic),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-text',
        skill_atom: skillAtom,
        stem: `Read this passage:\n\n"${passage.text}"\n\n${stem}`,
        passage: passage.text,
        options: opts,
        ans,
        correct_answer: ans,
        distractor_misconceptions: {},
        hints: ['Re-read the passage and look for clues.'],
        rit_difficulty: 185,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: _isLowRit(skillAtom),
    };
}

// ─── Skill-specific generators ──────────────────────────────────────────────

// Literature ----------------------------------------------------------------

function _genMainCharacter(skillAtom, rng) {
    const p = _pickLitPassage(skillAtom, rng);
    const allCharacters = ['Tom', 'Sara', 'Ben', 'Maya', 'Leo', 'Nina', 'Alex', 'Ruby'];
    const distractorPool = allCharacters.filter(c => !p.characters.includes(c) && c !== p.main_character);
    const distractors = _shuffle(distractorPool, rng).slice(0, 3);
    return _buildPassageMc(skillAtom, p, 'Who is the main character?', p.main_character, distractors, rng);
}

function _genSetting(skillAtom, rng) {
    const p = _pickLitPassage(skillAtom, rng);
    return _buildPassageMc(skillAtom, p, 'Where does this story take place?', p.setting, p.setting_distractors.slice(0, 3), rng);
}

function _genProblem(skillAtom, rng) {
    const p = _pickLitPassage(skillAtom, rng);
    return _buildPassageMc(skillAtom, p, 'What is the problem in the story?', p.problem, p.problem_distractors.slice(0, 3), rng);
}

function _genSolution(skillAtom, rng) {
    const p = _pickLitPassage(skillAtom, rng);
    return _buildPassageMc(skillAtom, p, 'How is the problem solved?', p.solution, p.solution_distractors.slice(0, 3), rng);
}

function _genTheme(skillAtom, rng) {
    const p = _pickLitPassage(skillAtom, rng);
    return _buildPassageMc(skillAtom, p, 'What is the theme or lesson of this story?', p.theme, p.theme_distractors.slice(0, 3), rng);
}

function _genInference(skillAtom, rng) {
    const p = _pickLitPassage(skillAtom, rng);
    return _buildPassageMc(skillAtom, p, 'What can you infer from the passage?', p.inference, p.inference_distractors.slice(0, 3), rng);
}

function _genSummarize(skillAtom, rng) {
    const p = _pickLitPassage(skillAtom, rng);
    const correct = `${p.main_character} faced a problem when ${p.problem.toLowerCase()} ${p.solution}`;
    const distractors = [
        `${p.main_character} avoided every problem and never tried.`,
        `Nothing important happened in the story.`,
        `${p.main_character} ran away and never came back.`,
    ];
    return _buildPassageMc(skillAtom, p, 'Which is the BEST summary of the passage?', correct, distractors, rng);
}

function _genPointOfView(skillAtom, rng) {
    const p = _pickLitPassage(skillAtom, rng);
    const correct = p.pov === 'first person' ? 'First person' : 'Third person';
    const distractors = correct === 'First person'
        ? ['Third person', 'Second person']
        : ['First person', 'Second person'];
    return _buildPassageMc(skillAtom, p, 'What point of view is this story written in?', correct, distractors, rng, 'pov');
}

function _genStorySequence(skillAtom, rng) {
    const p = _pickLitPassage(skillAtom, rng);
    const events = (p.events || []).map(e => ({ id: e.id, label: e.label }));
    if (events.length < 3) {
        return _genMainCharacter(skillAtom, rng);
    }
    return {
        id: _qid(skillAtom.skill_id, 'seq'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'sequence-events',
        skill_atom: skillAtom,
        events: _shuffle(events, rng),
        task_text: `Read the passage, then put the events in the correct order:\n\n"${p.text}"`,
        passage: p.text,
        ans: events.map(e => e.id),
        correct_answer: events.map(e => e.id),
        hints: ['Look for signal words like first, then, next, finally.'],
        rit_difficulty: 180,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: _isLowRit(skillAtom),
    };
}

// Informational --------------------------------------------------------------

function _genMainIdea(skillAtom, rng) {
    const p = _pickInfoPassage(skillAtom, rng);
    return _buildPassageMc(skillAtom, p, 'What is the MAIN idea of this passage?', p.main_idea, p.main_idea_distractors.slice(0, 3), rng);
}

function _genSupportingDetails(skillAtom, rng) {
    const p = _pickInfoPassage(skillAtom, rng);
    const correctDetails = _shuffle(p.details, rng).slice(0, 2);
    const wrongDetails = _shuffle(p.non_details, rng).slice(0, 2);
    const all = _shuffle([...correctDetails, ...wrongDetails], rng);
    const opts = all.map((label, i) => ({ id: String.fromCharCode(97 + i), label }));
    const correctIds = opts.filter(o => correctDetails.includes(o.label)).map(o => o.id);
    return {
        id: _qid(skillAtom.skill_id, 'mms'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'mc-multi-select',
        skill_atom: skillAtom,
        stem: `Read this passage:\n\n"${p.text}"\n\nPick TWO details that support the main idea.`,
        passage: p.text,
        options: opts,
        ans: correctIds,
        correct_answer: correctIds,
        minCorrect: 2,
        hints: ['Look for sentences that explain or prove the main idea.'],
        rit_difficulty: 188,
        grade_level: skillAtom.developmental_band || '2-3',
        has_audio: true,
        k2_appropriate: false,
    };
}

function _genAuthorsPurpose(skillAtom, rng) {
    const p = _pickInfoPassage(skillAtom, rng);
    const correct = PURPOSE_LABELS[p.purpose] || PURPOSE_LABELS.inform;
    const distractors = Object.values(PURPOSE_LABELS).filter(l => l !== correct);
    return _buildPassageMc(skillAtom, p, 'What is the author\'s purpose for writing this passage?', correct, distractors, rng, 'purpose');
}

function _genFactOpinion(skillAtom, rng) {
    const item = _pick(FACT_OPINION_ITEMS, rng);
    const ans = item.is_fact ? 'fact' : 'opinion';
    return {
        id: _qid(skillAtom.skill_id, 'tbb'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'two-button-binary',
        skill_atom: skillAtom,
        subject: item.sentence,
        stem: 'Is this sentence a fact or an opinion?',
        title: 'Fact or Opinion',
        options: [
            { id: 'fact', label: 'Fact' },
            { id: 'opinion', label: 'Opinion' },
        ],
        ans,
        correct_answer: ans,
        audio_text: item.sentence,
        hints: ['A fact can be proven true. An opinion is what someone thinks or feels.'],
        rit_difficulty: 190,
        grade_level: skillAtom.developmental_band || '4-5+',
        has_audio: true,
        k2_appropriate: false,
    };
}

function _genTextStructure(skillAtom, rng, expected) {
    const p = _pickInfoPassage(skillAtom, rng, expected);
    const correct = TEXT_STRUCTURE_LABELS[p.structure] || TEXT_STRUCTURE_LABELS.description;
    const distractors = Object.values(TEXT_STRUCTURE_LABELS).filter(l => l !== correct);
    const pickedDistractors = _shuffle(distractors, rng).slice(0, 3);
    return _buildPassageMc(skillAtom, p, 'What text structure does this passage use?', correct, pickedDistractors, rng, 'struct');
}

function _genCitingEvidence(skillAtom, rng) {
    const p = _pickInfoPassage(skillAtom, rng);
    // Use hot-text-sentence: student picks the sentence that is the strongest evidence.
    const idx = typeof p.evidence_sentence_index === 'number' ? p.evidence_sentence_index : 0;
    return {
        id: _qid(skillAtom.skill_id, 'htsentence'),
        skill_ids: [skillAtom.skill_id],
        question_type: 'hot-text-sentence',
        skill_atom: skillAtom,
        passage: p.text,
        granularity: 'sentence',
        task_text: `Tap the sentence that gives the BEST evidence for this idea: "${p.main_idea}"`,
        correct_indices: [idx],
        multi_select: false,
        hints: ['Look for the sentence that directly proves the main idea.'],
        rit_difficulty: 200,
        grade_level: skillAtom.developmental_band || '4-5+',
        has_audio: true,
        k2_appropriate: false,
    };
}

// ─── Skill router ───────────────────────────────────────────────────────────

const COVERED_SKILLS = {
    // Literature
    'reading_comp_lit_main_character':   _genMainCharacter,
    'reading_comp_lit_setting_identify': _genSetting,
    'reading_comp_lit_story_sequence':   _genStorySequence,
    'reading_comp_lit_inference':        _genInference,
    'reading_comp_lit_problem':          _genProblem,
    'reading_comp_lit_solution':         _genSolution,
    'reading_comp_lit_theme':            _genTheme,
    'reading_comp_lit_summarize':        _genSummarize,
    'reading_comp_lit_point_of_view':    _genPointOfView,
    // Informational
    'reading_comp_info_main_idea':                       _genMainIdea,
    'reading_comp_info_supporting_details':              _genSupportingDetails,
    'reading_comp_info_authors_purpose_pie':             _genAuthorsPurpose,
    'reading_comp_info_fact_opinion':                    _genFactOpinion,
    'reading_comp_info_text_structure_sequence':         (a, r) => _genTextStructure(a, r, 'sequence'),
    'reading_comp_info_text_structure_compare_contrast': (a, r) => _genTextStructure(a, r, 'compare_contrast'),
    'reading_comp_info_text_structure_cause_effect':     (a, r) => _genTextStructure(a, r, 'cause_effect'),
    'reading_comp_info_text_structure_problem_solution': (a, r) => _genTextStructure(a, r, 'problem_solution'),
    'reading_comp_info_citing_evidence':                 _genCitingEvidence,
};

// ─── Mechanic selection (Variety Rule) ──────────────────────────────────────

const STAGE1_FALLBACK = {
    'passage-mc-set':   'mc-text',
    'passage-hot-text': 'hot-text-sentence',
    'claim-evidence':   'hot-text-sentence',
    'open-response-fib': 'fib-auto',
};

function _pickMechanic(skillAtom, mechanicHint, rng) {
    const available = skillAtom.question_types || ['mc-text'];
    if (mechanicHint && available.includes(mechanicHint)) return mechanicHint;
    return _pick(available, rng);
}

// ─── Public API ─────────────────────────────────────────────────────────────

export function generateComprehensionQuestion(skillAtom, mechanicHint = null, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;

    const builder = COVERED_SKILLS[skillAtom.skill_id];
    if (!builder) return _comingSoon(skillAtom);

    // Mechanic is consulted but the per-skill builder picks the actual widget
    // shape. We still resolve a mechanic hint so the deck rotates feels-fresh.
    _pickMechanic(skillAtom, mechanicHint, rng);

    try {
        const q = builder(skillAtom, rng);
        return q || _comingSoon(skillAtom);
    } catch (_e) {
        return _comingSoon(skillAtom);
    }
}

export function buildComprehensionDeck(skillAtom, count = 10, options = {}) {
    const rng = typeof options.rng === 'function' ? options.rng : Math.random;
    const available = skillAtom.question_types || ['mc-text'];
    const window3 = [];
    const deck = [];
    for (let i = 0; i < count; i++) {
        const eligible = available.filter(m => !window3.includes(m));
        const pool = eligible.length > 0 ? eligible : available;
        const mechanic = _pick(pool, rng);
        deck.push(generateComprehensionQuestion(skillAtom, mechanic, { rng }));
        window3.push(mechanic);
        if (window3.length > 3) window3.shift();
    }
    return deck;
}

export default { generateComprehensionQuestion, buildComprehensionDeck };

// Ignore unused import warning for STAGE1_FALLBACK — kept for parity with sibling generators.
void STAGE1_FALLBACK;
