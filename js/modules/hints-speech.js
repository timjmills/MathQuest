import { state } from './state.js';

export function showHint() {
    const q = state.currentQ;
    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";
    feedback.className = "feedback-area hint";
    feedback.innerHTML = q.hint || "Try your best!";
    // Skill-specific visual hint cues. perimeter_grid: glow the outside
    // perimeter line so kids physically SEE that perimeter = outside.
    const _qCard = document.getElementById("questionCard");
    if (_qCard && (
        state.skill === 'perimeter_grid' || q.printFormat === 'perimeter-grid' ||
        state.skill === 'perimeter' || q.printFormat === 'geometry-perimeter'
    )) {
        _qCard.classList.add('show-perim-hint');
    }
    // fraction_of_set: tokens render NEUTRAL by default (so the answer is
    // not given away). On hint, color the first (num*mult) tokens to reveal
    // which portion of the set the fraction represents.
    if (q.printFormat === 'fraction-of-set' || q.printFormat === 'fraction-of-set-hard'
        || state.skill === 'fraction_of_set' || state.skill === 'fraction_of_set_hard') {
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

// Show geometry-specific hints for dual answer problems
export function showGeometryHint(hintType) {
    const q = state.currentQ;
    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";
    feedback.className = "feedback-area hint";
    
    if (hintType === 'perimeter' && q.perimeterHint) {
        feedback.innerHTML = `<strong>📐 Perimeter Hint:</strong><br>${q.perimeterHint}`;
    } else if (hintType === 'area' && q.areaHint) {
        feedback.innerHTML = `<strong>📏 Area Hint:</strong><br>${q.areaHint}`;
    } else {
        feedback.innerHTML = q.hint || "Try your best!";
    }
}

export function showWordProblemHint() {
    const q = state.currentQ;
    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";
    feedback.className = "feedback-area hint";
    
    let hintHTML = `<strong>💡 Help:</strong><br>`;
    if (q.expectedType === 'area') {
        hintHTML += `This is an <strong>AREA</strong> problem (covering/filling a surface).<br>`;
        hintHTML += `Area = length × width`;
    } else {
        hintHTML += `This is a <strong>PERIMETER</strong> problem (going around the edge).<br>`;
        hintHTML += `Perimeter = 2 × (length + width)`;
    }
    
    feedback.innerHTML = hintHTML;
}

// Show step-by-step solution popup (wrapper for button)
export function showSolution() {
    showSolutionPopup();
}

export function resizeInput(el) {
    el.style.width = Math.max(140, (el.value.length + 3) * 16) + "px";
}

// Convert raw question/option text into a speakable string.
// Strips HTML tags, collapses whitespace, swaps math symbols for words.
function _toSpeakable(raw) {
    if (raw == null) return "";
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
        _safeSpeak(utterance);
    }

    // Read each answer choice sequentially when this is a multiple-choice item.
    // SpeechSynthesis queues utterances, so they play in order with a natural
    // pause between them. Widgets without text options (numpad, ten-frame,
    // dnd, hot-spot, clock-set, etc.) just get the question text.
    if (Array.isArray(q.options) && q.options.length > 0) {
        q.options.forEach((opt, i) => {
            const label = (opt && typeof opt === "object")
                ? (opt.label || opt.text || String(opt))
                : opt;
            const cleanOpt = _toSpeakable(label);
            if (!cleanOpt) return;
            const ou = new SpeechSynthesisUtterance(`Option ${String.fromCharCode(65 + i)}: ${cleanOpt}`);
            ou.rate = 0.9;
            ou.pitch = 1.0;
            _safeSpeak(ou);
        });
    }
}

// Speak an answer option on hover
export function speakAnswerOption(option) {
    if (!state.ttsEnabled || !("speechSynthesis" in window)) return;

    const spokenText = _toSpeakable(option);
    if (!spokenText) return;

    try { window.speechSynthesis.cancel(); } catch (_) {}
    const utterance = new SpeechSynthesisUtterance(spokenText);
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

