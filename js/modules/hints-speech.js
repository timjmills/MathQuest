import { state } from './state.js';
import { applyVoice } from './voice-picker.js';

// ===== Hint popup modal =====
// Builds (or replaces) a centered modal that shows hint text. Closes via:
//   - X button in the corner
//   - "Got it!" button
//   - Click on the dark backdrop (anywhere outside the card)
//   - Escape key
// Auto-cleared when the next question loads (nextQuestion calls closeHintPopup).
function _renderHintModal(titleHTML, bodyHTML) {
    // Replace any existing hint modal so a second click doesn't stack popups.
    closeHintPopup();
    const modal = document.createElement('div');
    modal.id = 'hintModal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Hint');
    modal.style.cssText =
        'position:fixed;top:0;left:0;right:0;bottom:0;' +
        'background:rgba(0,0,0,0.7);display:flex;align-items:center;' +
        'justify-content:center;z-index:10000;padding:20px;' +
        'animation:hintModalFadeIn 0.18s ease-out;';
    modal.innerHTML =
        '<div class="hint-modal-card" style="background:var(--bg-card);border-radius:20px;' +
        'padding:25px 28px;max-width:520px;width:100%;max-height:80vh;overflow-y:auto;' +
        'box-shadow:0 20px 60px rgba(0,0,0,0.35);border:2px solid var(--accent-orange,#ff9800);">' +
            '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px;gap:12px;">' +
                '<h3 style="margin:0;color:var(--accent-orange,#ff9800);font-size:1.25rem;">' + titleHTML + '</h3>' +
                '<button type="button" aria-label="Close hint" onclick="closeHintPopup()" ' +
                    'style="background:none;border:none;font-size:1.7rem;line-height:1;cursor:pointer;' +
                    'color:var(--text-dim,#888);padding:4px 10px;border-radius:8px;">×</button>' +
            '</div>' +
            '<div class="hint-modal-body" style="line-height:1.65;font-size:1.05rem;color:var(--text-main,#222);">' +
                bodyHTML +
            '</div>' +
            '<button type="button" onclick="closeHintPopup()" class="btn btn-primary" ' +
                'style="width:100%;margin-top:18px;">Got it!</button>' +
        '</div>';

    // Backdrop click closes the modal (only when click hits the backdrop itself,
    // not when it bubbles up from a click inside the card).
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeHintPopup();
    });

    document.body.appendChild(modal);

    // ESC closes. Use one-shot listener so we don't leak handlers across opens.
    const onKey = (ev) => {
        if (ev.key === 'Escape' || ev.key === 'Esc') {
            closeHintPopup();
        }
    };
    modal._hintKeyHandler = onKey;
    document.addEventListener('keydown', onKey);
}

export function closeHintPopup() {
    const modal = document.getElementById('hintModal');
    if (!modal) return;
    if (modal._hintKeyHandler) {
        document.removeEventListener('keydown', modal._hintKeyHandler);
    }
    modal.remove();
}

// Generic fallback hint when a skill is missing one. Better than "Try your best!"
// because it nudges the student toward a strategy.
function _genericHintFor(q) {
    const skillId = (q && q.skillId) || state.skill || '';
    if (/word/i.test(skillId)) {
        return 'Read the problem one sentence at a time. Underline the numbers and circle what the question is asking. Then choose: add, subtract, multiply, or divide?';
    }
    if (/frac/i.test(skillId)) {
        return 'Picture the fraction as parts of a whole — the bottom number is total parts, the top number is how many you have. Make denominators match before adding or subtracting.';
    }
    if (/area|perim|geom|shape/i.test(skillId)) {
        return 'Perimeter = add up all the side lengths (going around). Area = length × width (filling inside).';
    }
    if (/time|clock|elapsed/i.test(skillId)) {
        return 'Each big number on a clock is 5 minutes. Count by 5s around the face. For elapsed time, count up from the start time.';
    }
    if (/money/i.test(skillId)) {
        return 'Sort the coins biggest to smallest. Quarter = 25¢, Dime = 10¢, Nickel = 5¢, Penny = 1¢. Skip-count the same kind first.';
    }
    if (/place|round|number_sense/i.test(skillId)) {
        return 'Each digit\'s value depends on its place — ones, tens, hundreds, thousands. Look at the digit to the RIGHT to decide rounding.';
    }
    if (/multiply|product|times|mult/i.test(skillId)) {
        return 'Multiplying is fast adding of equal groups. Try skip-counting, or break a tricky fact into easy parts (like 7×6 = 7×5 + 7).';
    }
    if (/divide|division|quot/i.test(skillId)) {
        return 'Divide means "split into equal groups." Ask: how many groups of the small number fit inside the big number?';
    }
    if (/add|sum|plus/i.test(skillId)) {
        return 'Start with the bigger number and count up. For two-digit numbers, add the ones first, then the tens, and regroup if you go past 9.';
    }
    if (/sub|minus|differ/i.test(skillId)) {
        return 'Take away from the bigger number, or count UP from the smaller to the bigger. Regroup (borrow) when the top digit is too small.';
    }
    return 'Slow down and re-read the problem. Look for a strategy you know — drawing a picture, breaking the numbers apart, or using a model.';
}

export function showHint() {
    const q = state.currentQ;
    const hintBody = (q && q.hint && String(q.hint).trim().length)
        ? q.hint
        : _genericHintFor(q);
    _renderHintModal('💡 Hint', hintBody);

    // Skill-specific visual hint cues. perimeter_grid: glow the outside
    // perimeter line so kids physically SEE that perimeter = outside.
    const _qCard = document.getElementById("questionCard");
    if (_qCard && q && (
        state.skill === 'perimeter_grid' || q.printFormat === 'perimeter-grid' ||
        state.skill === 'perimeter' || q.printFormat === 'geometry-perimeter'
    )) {
        _qCard.classList.add('show-perim-hint');
    }
    // fraction_of_set: tokens render NEUTRAL by default (so the answer is
    // not given away). On hint, color the first (num*mult) tokens to reveal
    // which portion of the set the fraction represents.
    if (q && (q.printFormat === 'fraction-of-set' || q.printFormat === 'fraction-of-set-hard'
        || state.skill === 'fraction_of_set' || state.skill === 'fraction_of_set_hard')) {
        _colorFosTokens();
    }
}

// Walk the visual aid for the current question and paint the highlighted
// fraction-of-set tokens with the cyan/green style. Idempotent.
function _colorFosTokens() {
    const visualAid = document.getElementById('visualAid');
    if (!visualAid) return;
    const fosWrap = visualAid.querySelector('.fos-visual');
    if (!fosWrap) return;
    const num = parseInt(fosWrap.getAttribute('data-fos-num') || '0', 10);
    const den = parseInt(fosWrap.getAttribute('data-fos-den') || '0', 10);
    const mult = parseInt(fosWrap.getAttribute('data-fos-mult') || '0', 10);
    if (!num || !den || !mult) return;
    const shadeGroups = Math.min(num, den);

    // Paint tokens that belong to a highlighted group.
    fosWrap.querySelectorAll('.fos-token').forEach(t => {
        if (t.getAttribute('data-fos-highlight') === '1') {
            t.setAttribute('fill', 'var(--accent-cyan)');
            t.setAttribute('stroke', 'var(--accent-green)');
            t.setAttribute('opacity', '1');
        }
    });

    // Brighten group-row labels for highlighted rows.
    fosWrap.querySelectorAll('.fos-label').forEach(lbl => {
        const fg = parseInt(lbl.getAttribute('data-fos-group') || '-1', 10);
        if (fg >= 0 && fg < shadeGroups) {
            lbl.setAttribute('fill', 'var(--accent-green)');
            lbl.setAttribute('opacity', '1');
        }
    });

    // Inject the subtle row-shade bands behind the tokens (only once).
    const svg = fosWrap.querySelector('svg');
    if (svg && !svg.querySelector('.fos-shade-band')) {
        const fosCircleSize = 52;
        const fosGap = 8;
        const fosRowGap = 18;
        const fosWide = mult > 14;
        const fosBandRows = fosWide ? 2 : 1;
        const fosCols = fosWide ? Math.ceil(mult / 2) : mult;
        const fosSvgW = fosCols * (fosCircleSize + fosGap) + fosGap;
        const ns = 'http://www.w3.org/2000/svg';
        // Insert bottom-most first so paint order keeps band 0 on top of band 1.
        for (let fg = shadeGroups - 1; fg >= 0; fg--) {
            const fbandY = fosGap + fg * fosBandRows * (fosCircleSize + fosGap) + fg * fosRowGap - fosRowGap / 2;
            const fbandH = fosBandRows * (fosCircleSize + fosGap) + fosRowGap - fosGap;
            const rect = document.createElementNS(ns, 'rect');
            rect.setAttribute('class', 'fos-shade-band');
            rect.setAttribute('x', '-30');
            rect.setAttribute('y', String(Math.max(0, fbandY)));
            rect.setAttribute('width', String(fosSvgW + 30));
            rect.setAttribute('height', String(fbandH));
            rect.setAttribute('fill', 'var(--accent-cyan)');
            rect.setAttribute('opacity', '0.07');
            rect.setAttribute('rx', '6');
            svg.insertBefore(rect, svg.firstChild);
        }
    }
}

// Show geometry-specific hints for dual answer problems (perimeter + area)
export function showGeometryHint(hintType) {
    const q = state.currentQ || {};
    let title, body;
    if (hintType === 'perimeter') {
        title = '📐 Perimeter Hint';
        body = q.perimeterHint
            ? q.perimeterHint
            : 'Perimeter is the distance all the way AROUND a shape. Add up every side length.';
    } else if (hintType === 'area') {
        title = '📏 Area Hint';
        body = q.areaHint
            ? q.areaHint
            : 'Area is the space INSIDE a shape, measured in square units. For a rectangle: length × width.';
    } else {
        title = '💡 Hint';
        body = q.hint || _genericHintFor(q);
    }
    _renderHintModal(title, body);
}

export function showWordProblemHint() {
    const q = state.currentQ || {};
    let body;
    if (q.expectedType === 'area') {
        body = 'This is an <strong>AREA</strong> problem — it asks about covering or filling a surface (like tiles on a floor or paint on a wall).<br><br>' +
               '<strong>Area = length × width</strong><br>' +
               'Multiply the two side lengths.';
    } else {
        body = 'This is a <strong>PERIMETER</strong> problem — it asks about going AROUND the edge (like a fence around a yard or a frame around a picture).<br><br>' +
               '<strong>Perimeter = add all the sides</strong><br>' +
               'For a rectangle: 2 × length + 2 × width.';
    }
    _renderHintModal('💡 Help', body);
}

// Show step-by-step solution popup (wrapper for button)
export function showSolution() {
    showSolutionPopup();
}

export function resizeInput(el) {
    el.style.width = Math.max(140, (el.value.length + 3) * 16) + "px";
}

// Robustly extract a human-readable label string from an option value.
// Options may be primitives (string/number) or objects with various shape
// conventions (label, text, value, htmlLabel, name, term, l). Without this
// fallback chain, an object with only htmlLabel/svg falls through to
// String(opt) → "[object Object]" → TTS reads "object object".
export function _extractOptionLabel(opt) {
    if (opt == null) return '';
    if (typeof opt === 'string' || typeof opt === 'number' || typeof opt === 'boolean') {
        return String(opt);
    }
    if (typeof opt !== 'object') return String(opt);
    // Try common fields in order of preference.
    const candidates = [opt.label, opt.text, opt.value, opt.l, opt.htmlLabel, opt.name, opt.term];
    for (const c of candidates) {
        if (c != null && c !== '') {
            // Strip HTML tags so TTS reads only the underlying text.
            return String(c).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
        }
    }
    // Last resort: JSON serialize (still better than "[object Object]").
    try { return JSON.stringify(opt); } catch (_) { return ''; }
}

// Convert raw question/option text into a speakable string.
// Strips HTML tags, collapses whitespace, swaps math symbols for words.
function _toSpeakable(raw) {
    if (raw == null) return "";
    if (typeof raw === 'object') raw = _extractOptionLabel(raw);
    return String(raw)
        .replace(/<[^>]+>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/×/g, " times ")
        .replace(/÷/g, " divided by ")
        .replace(/−/g, " minus ")
        .replace(/-/g, " minus ")
        .replace(/\+/g, " plus ")
        .replace(/=/g, " equals ")
        .replace(/\//g, " over ")
        .replace(/\s+/g, " ")
        .trim();
}

// Speak an utterance with browser-bug workarounds.
//   - Wraps speak() in try/catch so a runtime error on one utterance doesn't
//     break the chain.
//   - If the synthesizer is paused (Chrome bug after backgrounded tabs),
//     resumes it first so the next speak() actually fires.
function _safeSpeak(utterance) {
    if (!utterance) return;
    const synth = window.speechSynthesis;
    if (!synth) return;
    try { if (synth.paused) synth.resume(); } catch (_) {}
    try { synth.speak(utterance); } catch (_) {}
}

// Auto-read the current question + (if multiple-choice) each answer option.
// Gated by state.ttsEnabled — when off, this is a no-op so existing
// on-hover/manual TTS behavior is unchanged.
export function speakQuestion() {
    if (!state.ttsEnabled || !("speechSynthesis" in window) || !state.currentQ) return;
    const q = state.currentQ;

    // Cancel any in-flight speech so a fresh question doesn't pile on top.
    try { window.speechSynthesis.cancel(); } catch (_) {}

    const spokenText = _toSpeakable(q.text);
    if (spokenText) {
        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        applyVoice(utterance);
        _safeSpeak(utterance);
    }

    // Read each answer choice sequentially when this is a multiple-choice item.
    // SpeechSynthesis queues utterances, so they play in order with a natural
    // pause between them. Widgets without text options (numpad, ten-frame,
    // dnd, hot-spot, clock-set, etc.) just get the question text.
    if (Array.isArray(q.options) && q.options.length > 0) {
        q.options.forEach((opt, i) => {
            const label = _extractOptionLabel(opt);
            const cleanOpt = _toSpeakable(label);
            if (!cleanOpt) return;
            const ou = new SpeechSynthesisUtterance(`Option ${String.fromCharCode(65 + i)}: ${cleanOpt}`);
            ou.rate = 0.9;
            ou.pitch = 1.0;
            applyVoice(ou);
            _safeSpeak(ou);
        });
    }
}

// Speak an answer option on hover
export function speakAnswerOption(option) {
    if (!state.ttsEnabled || !("speechSynthesis" in window)) return;

    // If an option object slipped through, extract a readable label first
    // (otherwise _toSpeakable still handles it via its object guard, but
    // being explicit here documents the contract for callers).
    const label = (option && typeof option === 'object') ? _extractOptionLabel(option) : option;
    const spokenText = _toSpeakable(label);
    if (!spokenText) return;

    try { window.speechSynthesis.cancel(); } catch (_) {}
    const utterance = new SpeechSynthesisUtterance(spokenText);
    applyVoice(utterance);
    _safeSpeak(utterance);
}

// Stop speaking (for when mouse leaves)
export function stopSpeaking() {
    if ("speechSynthesis" in window) {
        try { window.speechSynthesis.cancel(); } catch (_) {}
    }
}

// Pre-warm voices at module load. Chrome / some Edge versions return an
// empty getVoices() list until the async 'voiceschanged' event fires; the
// first speak() call that hits before voices are ready can be silently
// dropped. Calling getVoices() once on load primes the voice list, and the
// voiceschanged listener guarantees subsequent speak() calls will work.
if (typeof window !== 'undefined' && "speechSynthesis" in window) {
    try {
        window.speechSynthesis.getVoices();
        // Listening for the event also keeps the synth warm in browsers that
        // suspend it after a long idle (a separate Chrome bug). The listener
        // is a no-op handler — its presence alone is what matters.
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            /* keep synth warm */
        });
    } catch (_) { /* non-fatal */ }
}

