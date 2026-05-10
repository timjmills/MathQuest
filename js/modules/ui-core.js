import { state } from './state.js';
import { setCookie, getCookie } from './storage.js';

// Toast notification
export function showToast(message, type = 'info') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        padding: 14px 24px;
        border-radius: 12px;
        font-weight: 600;
        font-size: 0.95rem;
        z-index: 10000;
        animation: toastSlideUp 0.3s ease;
        box-shadow: 0 4px 20px rgba(0,0,0,0.25);
        ${type === 'success' ? 'background: var(--correct); color: white;' : ''}
        ${type === 'error' ? 'background: var(--incorrect); color: white;' : ''}
        ${type === 'info' ? 'background: var(--accent-purple); color: white;' : ''}
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastSlideDown 0.3s ease forwards';
        setTimeout(() => toast.remove(), 300);
    }, 2500);
}


// Background shapes — drift up across the viewport.
// Distribute horizontally in bands so the left edge gets coverage too
// (pure random left% leaves visible gaps with low counts), and start each
// shape at a random point in its animation so they don't all flock at t=0.
export function createBackgroundShapes() {
    const shapes = ["◯", "△", "□", "☆", "⬡"];
    const container = document.getElementById("bgShapes");
    if (!container) return;
    const COUNT = 40;
    for (let i = 0; i < COUNT; i++) {
        const el = document.createElement("div");
        el.className = "shape";
        el.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        // Striped distribution: each shape lands in its own ~2.5% band, then jitter
        const band = (i / COUNT) * 100;
        const jitter = (Math.random() - 0.5) * (100 / COUNT);
        el.style.left = Math.max(0, Math.min(100, band + jitter)) + "%";
        el.style.fontSize = (Math.random() * 1.8 + 0.8) + "rem";
        const dur = Math.random() * 15 + 12;
        el.style.animationDuration = dur + "s";
        // Negative delay starts mid-cycle so shapes are already on screen at load
        el.style.animationDelay = (-Math.random() * dur) + "s";
        el.style.color = `hsla(${Math.random() * 360}, 70%, 60%, 0.9)`;
        container.appendChild(el);
    }
}


// State persistence
export function loadState() {
    // State is kept in memory only (localStorage not available in iframe)
    updateUI();
    loadSettings(); // Load saved settings
    // Check for saved mixed mode settings and update Play Mixed card
    setTimeout(() => updateMixedPlayCardState(), 100);
}

export function saveState() {
    // State is kept in memory only (localStorage not available in iframe)
}

// Save current settings to cookie
export function saveSettings() {
    const settings = {
        category: document.getElementById("categorySelect")?.value,
        skill: document.getElementById("skillSelect")?.value,
        range: document.getElementById("rangeSelect")?.value,
        decimal: document.getElementById("decimalSelect")?.value || '0',
        timer: document.getElementById("timerSelect")?.value,
        tts: state.ttsEnabled
    };
    setCookie('mathquest_settings', settings);
}

// Load settings from cookie
export function loadSettings() {
    const saved = getCookie('mathquest_settings');
    if (!saved) return;

    try {
        // Apply category first
        const categorySelect = document.getElementById("categorySelect");
        if (saved.category && categorySelect) {
            categorySelect.value = saved.category;
            updateSkillOptions(); // Populate skills for this category
        }

        // Apply skill (after skills are populated)
        const skillSelect = document.getElementById("skillSelect");
        if (saved.skill && skillSelect) {
            // Check if the saved skill exists in current options
            const skillExists = Array.from(skillSelect.options).some(opt => opt.value === saved.skill);
            if (skillExists) {
                skillSelect.value = saved.skill;
            }
        }

        // Apply other settings with null checks
        const rangeSelect = document.getElementById("rangeSelect");
        const decimalSelect = document.getElementById("decimalSelect");
        const timerSelect = document.getElementById("timerSelect");

        if (saved.range && rangeSelect) rangeSelect.value = saved.range;
        if (saved.decimal !== undefined && decimalSelect) decimalSelect.value = saved.decimal;
        if (saved.timer !== undefined && timerSelect) timerSelect.value = saved.timer;
        // TTS intentionally NOT restored from cookie — audio defaults ON every
        // new session so students never miss the read-aloud, even if they
        // toggled it off in a prior session.
        setTTS(true);

        // Update visibility and code
        updateNumberSectionVisibility();
        updateSettingsCode();
    } catch (e) {
        // If loading fails, just use defaults
        console.log('Could not load settings:', e);
    }
}


// UI update & theme
export function updateUI() {
    // Calculate level info
    let levelInfo = { level: 1, xpInLevel: 0, xpForNext: 100 };
    if (typeof window !== 'undefined' && window.calculateLevel) {
        levelInfo = window.calculateLevel(state.xp);
    }
    document.getElementById("totalXp").innerText = `Lv.${levelInfo.level} | ${state.xp} XP`;
    const streakEl = document.getElementById("streakCount");
    if (streakEl) streakEl.innerText = state.streak;

    // Update XP level bar if it exists
    const xpBar = document.getElementById("xpLevelBar");
    if (xpBar) {
        const pct = levelInfo.xpForNext > 0 ? Math.min(100, Math.round((levelInfo.xpInLevel / levelInfo.xpForNext) * 100)) : 100;
        xpBar.style.width = pct + "%";
    }

    // Update tooltips
    if (typeof window !== 'undefined' && window.updateTooltips) {
        window.updateTooltips();
    }
}

export function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    document.documentElement.classList.toggle("dark-theme");
}

// ===== USER ROLE SYSTEM =====

// Confetti — call sites can pass a higher count for streak / level-up moments.
// Plain corrects use confettiSmall() so only the bigger wins feel "big".
export function confetti(count = 30) {
    const colors = ["#FF9F1C","#FF6B6B","#4CC9F0","#06D6A0","#FFD700","#1F5FBF","#7C5CE6"];
    for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.style.position = "fixed";
        el.style.left = Math.random() * 100 + "vw";
        el.style.top = "-10px";
        el.style.width = "10px";
        el.style.height = "14px";
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.opacity = 0.9;
        el.style.pointerEvents = "none";
        el.style.zIndex = 9999;
        document.body.appendChild(el);
        // 0.75s total fall — crisp burst, not a slow drift.
        const duration = 700 + Math.random() * 100;  // 700-800ms
        el.animate([
            { transform: "translateY(0) rotate(0deg)", opacity: 1 },
            { transform: `translateY(110vh) rotate(${Math.random()*720}deg)`, opacity: 0 }
        ], { duration, easing: "cubic-bezier(0.2, 0.6, 0.4, 1)" });
        setTimeout(() => el.remove(), duration + 50);
    }
}

// Smaller confetti burst for plain correct answers — keeps the "big" feel
// of a full confetti() exclusive to streak milestones and level-ups.
export function confettiSmall() {
    confetti(10);
}

// Float-up XP indicator over the question card. Used by every correct-answer
// path in answer-check.js so the student sees the XP they just earned drift
// up and fade out within the 2500ms auto-advance window.
export function flashXpBurst(card, text) {
    if (!card || !text) return;
    try {
        // Make sure the parent positions the absolute child correctly.
        const cs = window.getComputedStyle(card);
        if (cs.position === 'static') card.style.position = 'relative';
        const b = document.createElement('div');
        b.className = 'mq-xp-burst';
        b.textContent = text;
        card.appendChild(b);
        setTimeout(() => { try { b.remove(); } catch (_) {} }, 1600);
    } catch (_) { /* fail-silent */ }
}

// Briefly highlight the score number with a scale + color pulse. Restarts
// the animation cleanly each call by toggling the class with a forced reflow.
export function flashScorePop() {
    const sc = document.getElementById('gameScore');
    if (!sc) return;
    sc.classList.remove('mq-score-pop');
    void sc.offsetWidth;
    sc.classList.add('mq-score-pop');
    setTimeout(() => { sc.classList.remove('mq-score-pop'); }, 650);
}

// Pulse the streak counter when the student crosses a 3+ streak. Orange
// to match the existing "fire" branding in the stats banner.
export function flashStreakPop() {
    const st = document.getElementById('gsbStreak');
    if (!st) return;
    st.classList.remove('mq-streak-pop');
    void st.offsetWidth;
    st.classList.add('mq-streak-pop');
    setTimeout(() => { st.classList.remove('mq-streak-pop'); }, 650);
}

// Apply a horizontal shake to the question card on wrong answers. Animation
// removes itself after 350ms so subsequent wrong answers can re-trigger it.
export function shakeQuestionCard() {
    const card = document.getElementById('questionCard');
    if (!card) return;
    card.classList.remove('mq-shake');
    void card.offsetWidth;
    card.classList.add('mq-shake');
    setTimeout(() => { card.classList.remove('mq-shake'); }, 360);
}

// ========== PRINT WORKSHEET FUNCTIONS ==========

