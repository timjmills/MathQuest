// Inline vocab tooltips — wraps known math terms in question text with a
// hover/tap definition popover. Pulls from data-vocabulary.js so the existing
// 727-card system surfaces in math problems (especially helpful for ELL students
// and primary readers).

import { VOCABULARY_CARDS } from './data-vocabulary.js';

// Build a sorted lookup of terms -> definitions, longest-first so multi-word
// terms ("least common multiple") match before single-word ("least").
let _termIndex = null;
function _buildIndex() {
    if (_termIndex) return _termIndex;
    const map = new Map();
    const terms = [];
    const cards = Array.isArray(VOCABULARY_CARDS) ? VOCABULARY_CARDS : Object.values(VOCABULARY_CARDS || {});
    for (const card of cards) {
        if (!card) continue;
        const wordRaw = card.word || card.term;
        if (!wordRaw) continue;
        const term = String(wordRaw).trim();
        if (term.length < 3) continue;  // skip 1-2 letter terms
        const key = term.toLowerCase();
        if (!map.has(key)) {
            map.set(key, card);
            terms.push(term);
        }
    }
    terms.sort((a, b) => b.length - a.length);  // longest first
    _termIndex = { map, terms };
    return _termIndex;
}

// Wrap matching vocab terms in HTML. Returns the input string with each first
// occurrence of each known term replaced by a tooltip span. Subsequent
// occurrences are left alone to avoid noisy underlining.
//
// Implementation note: definitions themselves contain math words (e.g.,
// "numerator" → "the top number"). After we wrap one term, the next term's
// regex would otherwise match WORDS INSIDE the new `data-vdef="..."` attribute,
// producing a nested-span explosion. Fix: between every term, re-split the
// running text on any already-wrapped `.mq-vocab` span and only run the regex
// on the plain-text portions in between.
const _SPLIT_VOCAB_SPAN = /(<span class="mq-vocab"[^>]*>[^<]*<\/span>)/g;

export function linkVocabInText(html) {
    if (!html || typeof html !== 'string') return html;
    const { map, terms } = _buildIndex();
    const seen = new Set();
    let out = html;

    for (const term of terms) {
        const key = term.toLowerCase();
        if (seen.has(key)) continue;
        const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const re = new RegExp(`(?<![A-Za-z0-9_-])(${escaped})(?![A-Za-z0-9_-])`, 'i');

        // Split the current text on any already-wrapped vocab spans — even
        // indices are plain text we may match into; odd indices are full
        // <span class="mq-vocab" ...>...</span> blocks we leave untouched.
        const parts = out.split(_SPLIT_VOCAB_SPAN);
        let placed = false;
        for (let i = 0; i < parts.length; i += 2) {
            if (placed) break;
            if (re.test(parts[i])) {
                const card = map.get(key);
                const def = (card.definition || card.def || '').replace(/"/g, '&quot;');
                parts[i] = parts[i].replace(re, `<span class="mq-vocab" tabindex="0" data-vdef="${def}">$1</span>`);
                seen.add(key);
                placed = true;
            }
        }
        if (placed) out = parts.join('');
    }

    return out;
}

if (typeof window !== 'undefined') {
    window.linkVocabInText = linkVocabInText;
    // Lazy-init click-outside handler for tap-to-open behavior on touch
    document.addEventListener('click', (e) => {
        const t = e.target;
        if (t && t.classList && t.classList.contains('mq-vocab')) {
            // toggle a "tip-open" class so the tooltip appears on tap
            document.querySelectorAll('.mq-vocab.tip-open').forEach(el => {
                if (el !== t) el.classList.remove('tip-open');
            });
            t.classList.toggle('tip-open');
        } else {
            document.querySelectorAll('.mq-vocab.tip-open').forEach(el => el.classList.remove('tip-open'));
        }
    });
}
