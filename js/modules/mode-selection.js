import { state } from './state.js';

export function selectMode(mode) {
    document.querySelectorAll(".mode-card").forEach(card => card.classList.remove("selected"));
    document.querySelector(`.mode-card[data-mode="${mode}"]`).classList.add("selected");
    state.gameMode = mode;

    // Set default timer based on mode
    const timerSelect = document.getElementById("timerSelect");
    if (mode === "worksheet") {
        timerSelect.value = "0"; // No timer for worksheet
    } else {
        timerSelect.value = "180"; // 3 minutes for practice, boss, race
    }
}

export function shouldShowNextButton() {
    return ["practice", "boss", "race"].includes(state.gameMode);
}

export function showNextButton() {
    if (shouldShowNextButton()) {
        document.getElementById("nextBtnContainer").style.display = "flex";
    }
}

export function hideNextButton() {
    document.getElementById("nextBtnContainer").style.display = "none";
}

