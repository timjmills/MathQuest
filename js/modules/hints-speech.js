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

export function speakQuestion() {
    if (!state.ttsEnabled || !("speechSynthesis" in window) || !state.currentQ) return;
    const spokenText = state.currentQ.text
        .replace(/×/g, " times ")
        .replace(/÷/g, " divided by ")
        .replace(/−/g, " minus ")
        .replace(/-/g, " minus ")
        .replace(/\+/g, " plus ")
        .replace(/=/g, " equals ");
    const utterance = new SpeechSynthesisUtterance(spokenText);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
}

// Speak an answer option on hover
export function speakAnswerOption(option) {
    if (!state.ttsEnabled || !("speechSynthesis" in window)) return;

    // Convert option to speakable text
    let spokenText = String(option)
        .replace(/×/g, " times ")
        .replace(/÷/g, " divided by ")
        .replace(/−/g, " minus ")
        .replace(/-/g, " minus ")
        .replace(/\+/g, " plus ")
        .replace(/=/g, " equals ")
        .replace(/\//g, " over "); // For fractions like 1/2

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

