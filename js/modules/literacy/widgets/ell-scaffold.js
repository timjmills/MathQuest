// ell-scaffold.js — ELL differentiation layer for Literacy Quest items.
//
// Exports a single function:
//   applyEllScaffold(q, container)
//
// When state.literacyEllScaffold === true, this function:
//   1. Pre-teaches Tier 1 vocabulary (wraps matched words with hover definitions + audio)
//   2. Sets audio pacing to 1.5x (slower) via state.audio_pacing
//   3. Injects an L1 cognate badge if q.l1_cognates is present
//   4. Adds sentence frames for FIB production items if q.sentence_frame is present

import { state } from '../../state.js';

// ─── Tier 1 high-frequency word list (~200 words) ────────────────────────────
// Drawn from Dolch Pre-Primer through Grade 1 + Beck/McKeown Tier 1 core list.
// Keys are lowercase words; values are brief child-friendly definitions.

const TIER1_WORDS = {
    the: 'a word used before a noun',
    a: 'one of something',
    an: 'one of something (before a vowel sound)',
    is: 'a form of "be" — happening now',
    are: 'a form of "be" — more than one',
    was: 'a form of "be" — in the past',
    were: 'a form of "be" — more than one, in the past',
    has: 'owns or holds',
    have: 'own or hold',
    had: 'owned or held (past)',
    do: 'carry out an action',
    does: 'carries out an action',
    did: 'carried out (past)',
    go: 'move from one place to another',
    went: 'moved (past of go)',
    come: 'move toward',
    came: 'moved toward (past)',
    see: 'use your eyes to look at something',
    saw: 'used eyes to look (past)',
    look: 'use your eyes',
    find: 'discover or locate',
    found: 'discovered (past)',
    make: 'create or build',
    made: 'created (past)',
    get: 'receive or obtain',
    got: 'received (past)',
    give: 'hand something to someone',
    gave: 'handed (past)',
    take: 'pick up or carry',
    took: 'picked up (past)',
    put: 'place something somewhere',
    run: 'move fast on foot',
    ran: 'moved fast (past)',
    say: 'speak words',
    said: 'spoke (past)',
    know: 'have information about something',
    think: 'use your mind',
    tell: 'share information with words',
    call: 'speak to someone; give a name',
    try: 'attempt',
    ask: 'request information',
    need: 'require something',
    feel: 'sense an emotion or touch',
    become: 'start to be',
    leave: 'go away from',
    show: 'make visible; demonstrate',
    want: 'desire',
    use: 'work with a tool or thing',
    turn: 'rotate or change direction',
    begin: 'start',
    keep: 'hold onto; continue',
    change: 'become different',
    help: 'assist',
    play: 'take part in a game or activity',
    move: 'go from one place to another',
    live: 'be alive; dwell in a place',
    bring: 'carry toward',
    hold: 'grip or contain',
    write: 'put letters or words on paper',
    read: 'look at and understand written words',
    hear: 'sense sound through your ears',
    stop: 'no longer move or continue',
    stand: 'be upright on your feet',
    sit: 'rest on a seat',
    eat: 'consume food',
    drink: 'consume liquid',
    sleep: 'rest your body with eyes closed',
    open: 'not closed; to undo a closure',
    close: 'shut; to move toward shut',
    big: 'large in size',
    small: 'little in size',
    large: 'bigger than usual',
    little: 'small',
    long: 'greater than usual in length',
    short: 'less than usual in length or height',
    old: 'having existed for many years',
    new: 'just made or just arrived',
    good: 'of high quality; positive',
    bad: 'of low quality; negative',
    right: 'correct; the direction opposite of left',
    wrong: 'not correct',
    fast: 'moving quickly',
    slow: 'not moving quickly',
    hot: 'having high temperature',
    cold: 'having low temperature',
    happy: 'feeling joy',
    sad: 'feeling unhappy',
    up: 'toward a higher place',
    down: 'toward a lower place',
    in: 'inside',
    out: 'outside or away from inside',
    on: 'touching the surface of',
    off: 'away from; not on',
    over: 'above; across',
    under: 'below',
    here: 'in this place',
    there: 'in that place',
    now: 'at this moment',
    then: 'at that time',
    day: 'a period of 24 hours; the light part',
    night: 'the dark time when the sun is down',
    time: 'the ongoing sequence of events',
    year: 'a period of 365 days',
    home: 'the place where you live',
    school: 'a place where you learn',
    friend: 'a person you like and trust',
    family: 'your parents, siblings, and relatives',
    water: 'a clear liquid needed to survive',
    food: 'what you eat for energy',
    animal: 'a living thing that is not a plant',
    plant: 'a living thing that makes food from sunlight',
    people: 'more than one person',
    place: 'a particular location',
    thing: 'an object or item',
    word: 'a unit of language',
    name: 'what something or someone is called',
    number: 'a symbol used for counting or measuring',
    first: 'before all others; number one in order',
    last: 'after all others; final',
    next: 'coming immediately after',
    every: 'each one of a group',
    some: 'an unspecified number or amount',
    many: 'a large number of',
    few: 'a small number of',
    more: 'a greater amount',
    most: 'the greatest amount',
    same: 'identical; not different',
    different: 'not the same',
    other: 'not this one; additional',
    because: 'for the reason that',
    but: 'however; except',
    and: 'connects two things or ideas',
    or: 'presents a choice between things',
    if: 'on the condition that',
    when: 'at the time that',
    where: 'at the place that',
    which: 'used to ask about or identify one from a group',
    who: 'used to ask about a person',
    what: 'used to ask about a thing',
    how: 'in what way',
    why: 'for what reason',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function _esc(s) {
    return String(s)
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

/**
 * Wraps Tier 1 words in `text` with .lq-ell-pretaught spans.
 * Uses a word-boundary regex so partial matches (e.g., "is" inside "this") are skipped.
 *
 * @param {string} text — HTML string (stem text)
 * @returns {string} HTML string with spans inserted
 */
function _wrapTier1Words(text) {
    // Build a regex from dictionary keys, longest-first to avoid partial shadowing.
    const keys = Object.keys(TIER1_WORDS).sort((a, b) => b.length - a.length);
    // Iterate word-by-word via regex to avoid double-wrapping.
    return text.replace(/\b([A-Za-z]+)\b/g, (match) => {
        const lower = match.toLowerCase();
        if (TIER1_WORDS[lower]) {
            const def = _esc(TIER1_WORDS[lower]);
            const word = _esc(match);
            return `<span class="lq-ell-pretaught" tabindex="0" role="note"
                         data-def="${def}"
                         aria-label="${word}: ${def}">${word}<span class="lq-ell-def-tooltip">${def}</span></span>`;
        }
        return match;
    });
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Applies ELL scaffold layer to a rendered literacy item.
 *
 * @param {object} q         — question object from the literacy generator
 * @param {HTMLElement} container — the DOM node containing the rendered item
 */
export function applyEllScaffold(q, container) {
    if (!state.literacyEllScaffold) return;

    // 1. Pacing: slow audio to 1.5x (Web Speech rate is divided by 1.5)
    state.audio_pacing = 1.5;

    // 2. Wrap Tier 1 words in the stem element.
    const stemEl = container.querySelector('.lq-stem, .lq-card-stem, [data-lq-stem]');
    if (stemEl && stemEl.textContent) {
        stemEl.innerHTML = _wrapTier1Words(stemEl.innerHTML);
    }

    // 3. L1 cognate badge (Arabic + Spanish).
    if (q.l1_cognates && typeof q.l1_cognates === 'object') {
        const { arabic, spanish } = q.l1_cognates;
        const badge = document.createElement('div');
        badge.className = 'lq-ell-cognate-badge';
        badge.setAttribute('aria-label', 'Cognate hints');
        let inner = '<span class="lq-ell-cognate-label">Cognates:</span> ';
        if (spanish) inner += `<span class="lq-ell-cognate lq-ell-cognate--es" lang="es" title="Spanish">${_esc(spanish)}</span>`;
        if (arabic)  inner += `<span class="lq-ell-cognate lq-ell-cognate--ar" lang="ar" dir="rtl" title="Arabic">${_esc(arabic)}</span>`;
        badge.innerHTML = inner;
        container.prepend(badge);
    }

    // 4. Sentence frame for FIB / open-response items.
    if (q.sentence_frame) {
        const fibEl = container.querySelector('.lq-fib-input, [data-lq-fib]');
        if (fibEl) {
            fibEl.setAttribute('placeholder', _esc(q.sentence_frame));
            fibEl.setAttribute('aria-describedby', fibEl.id + '-sf');
            const hint = document.createElement('span');
            hint.id = (fibEl.id || 'fib') + '-sf';
            hint.className = 'lq-ell-sentence-frame lq-sr-only';
            hint.textContent = 'Try: ' + q.sentence_frame;
            fibEl.insertAdjacentElement('afterend', hint);
        }
    }
}
