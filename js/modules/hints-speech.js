import { state } from './state.js';

export function showHint() {
    const q = state.currentQ;
    const feedback = document.getElementById("feedbackArea");
    feedback.style.display = "block";
    feedback.className = "feedback-area hint";
    feedback.innerHTML = q.hint || "Try your best!";
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

// Auto-read the current question + (if multiple-choice) each answer option.
// Gated by state.ttsEnabled — when off, this is a no-op so existing
// on-hover/manual TTS behavior is unchanged.
export function speakQuestion() {
    if (!state.ttsEnabled || !("speechSynthesis" in window) || !state.currentQ) return;
    const q = state.currentQ;

    // Cancel any in-flight speech so a fresh question doesn't pile on top.
    window.speechSynthesis.cancel();

    const spokenText = _toSpeakable(q.text);
    if (spokenText) {
        const utterance = new SpeechSynthesisUtterance(spokenText);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
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
            window.speechSynthesis.speak(ou);
        });
    }
}

// Speak an answer option on hover
export function speakAnswerOption(option) {
    if (!state.ttsEnabled || !("speechSynthesis" in window)) return;

    const spokenText = _toSpeakable(option);
    if (!spokenText) return;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// Stop speaking (for when mouse leaves)
export function stopSpeaking() {
    if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
    }
}

