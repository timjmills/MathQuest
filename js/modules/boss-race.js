import { state } from './state.js';

export function updateBossVisuals() {
    document.getElementById("heroSprite").style.left = state.heroPos + "%";
    document.getElementById("monsterSprite").style.left = state.monsterPos + "%";
}

export function startBossMonster() {
    if (state.bossInterval) clearInterval(state.bossInterval);
    state.monsterPos = 10;
    state.heroPos = 70;
    updateBossVisuals();

    // Calculate monster speed based on timer duration
    // Monster should reach hero just as timer runs out (if player doesn't answer)
    const intervalMs = 400; // Update every 400ms for smooth movement
    const timerMs = state.timerDuration * 1000;

    // If no timer, default to 60 seconds pace
    const effectiveTimerMs = timerMs > 0 ? timerMs : 60000;

    // Distance monster needs to travel to catch hero
    const distanceToHero = state.heroPos - state.monsterPos - 5; // ~55 units

    // Calculate how many intervals until timer ends
    const totalIntervals = effectiveTimerMs / intervalMs;

    // Speed multiplier based on difficulty
    // Easy: Moderate dinosaur speed
    // Medium: Fast dinosaur, need to keep answering
    // Hard: Very fast dinosaur, must answer quickly!
    const speedMultiplier = 1.4; // Fixed medium difficulty

    // Slow down for harder/larger number ranges (1000+)
    // Larger numbers = harder math = more time needed
    const rangeSlowdown = state.range >= 100000 ? 0.5 :
                          state.range >= 10000 ? 0.6 :
                          state.range >= 1000 ? 0.7 : 1.0;

    // Speed per interval based on difficulty and range
    const monsterSpeed = (distanceToHero / totalIntervals) * speedMultiplier * rangeSlowdown;

    state.bossInterval = setInterval(() => {
        state.monsterPos += monsterSpeed;
        updateBossVisuals();

        // Check if monster caught the hero
        if (state.monsterPos >= state.heroPos - 5) {
            clearInterval(state.bossInterval);
            state.bossInterval = null;
            if (state.timerInterval) clearInterval(state.timerInterval);
            endGame(false, "The dinosaur caught you! 🦖");
        }
    }, intervalMs);
}

export function startRaceCPU() {
    if (state.cpuInterval) clearInterval(state.cpuInterval);
    state.cpuPos = 0;
    updateRaceVisuals();

    // Calculate CPU speed based on timer duration
    // CPU should reach 100% right when timer runs out
    const intervalMs = 300; // Update every 300ms
    const timerMs = state.timerDuration * 1000;

    // If no timer, default to 60 seconds pace
    const effectiveTimerMs = timerMs > 0 ? timerMs : 60000;

    // Calculate how many intervals until timer ends
    const totalIntervals = effectiveTimerMs / intervalMs;

    // Slow down CPU for harder/larger number ranges (1000+)
    // Larger numbers = harder math = more time needed for player
    const rangeSlowdown = state.range >= 100000 ? 0.5 :
                          state.range >= 10000 ? 0.6 :
                          state.range >= 1000 ? 0.7 : 1.0;

    // Slow down CPU for longer timers (more relaxed pace)
    const timerSlowdown = state.timerDuration >= 300 ? 0.6 :  // 5+ minutes
                          state.timerDuration >= 180 ? 0.7 :  // 3+ minutes
                          state.timerDuration >= 120 ? 0.85 : // 2+ minutes
                          1.0;

    // Calculate speed per interval to reach 100% at timer end, adjusted for range and timer
    const cpuSpeed = (100 / totalIntervals) * rangeSlowdown * timerSlowdown;

    state.cpuInterval = setInterval(() => {
        if (state.cpuPos < 100) {
            state.cpuPos += cpuSpeed;
            updateRaceVisuals();

            // Check if CPU won
            if (state.cpuPos >= 100) {
                clearInterval(state.cpuInterval);
                endGame(false, "The computer won!");
            }
        }
    }, intervalMs);
}

export function updateRaceVisuals() {
    document.getElementById("playerCar").style.left = state.racePos + "%";
    document.getElementById("cpuCar").style.left = state.cpuPos + "%";
}

export function getPlayerRaceSpeed() {
    // Calculate player speed based on timer duration
    // Goal: Player should reach finish line near the end of the timer
    // Assumption: Player answers about 7 questions correctly per minute
    const timerSeconds = state.timerDuration > 0 ? state.timerDuration : 60;
    const estimatedCorrectAnswers = Math.ceil((timerSeconds / 60) * 7);
    const speedPerAnswer = 100 / estimatedCorrectAnswers;
    return Math.max(5, Math.min(20, speedPerAnswer)); // Clamp between 5% and 20%
}

