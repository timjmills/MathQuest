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


// Background shapes
export function createBackgroundShapes() {
    const shapes = ["◯", "△", "□", "☆", "⬡"];
    const container = document.getElementById("bgShapes");
    for (let i = 0; i < 24; i++) {
        const el = document.createElement("div");
        el.className = "shape";
        el.textContent = shapes[Math.floor(Math.random() * shapes.length)];
        el.style.left = Math.random() * 100 + "%";
        el.style.fontSize = (Math.random() * 1.8 + 0.8) + "rem";
        el.style.animationDuration = (Math.random() * 15 + 12) + "s";
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
        if (saved.tts !== undefined) setTTS(saved.tts);

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
    document.getElementById("totalXp").innerText = `${state.xp} XP`;
    document.getElementById("streakCount").innerText = state.streak;
}

export function toggleTheme() {
    document.documentElement.classList.toggle("dark");
    document.documentElement.classList.toggle("dark-theme");
}

// ===== USER ROLE SYSTEM =====

// Confetti
export function confetti(count = 30) {
    const colors = ["#FF9F1C","#FF6B6B","#4CC9F0","#06D6A0","#FFD700"];
    for (let i = 0; i < count; i++) {
        const el = document.createElement("div");
        el.style.position = "fixed";
        el.style.left = Math.random() * 100 + "vw";
        el.style.top = "-10px";
        el.style.width = "10px";
        el.style.height = "14px";
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.opacity = 0.9;
        el.style.zIndex = 9999;
        document.body.appendChild(el);
        el.animate([
            { transform: "translateY(0) rotate(0deg)", opacity: 1 },
            { transform: `translateY(100vh) rotate(${Math.random()*720}deg)`, opacity: 0 }
        ], { duration: Math.random() * 1500 + 1500, easing: "ease-out" });
        setTimeout(() => el.remove(), 3000);
    }
}

// ========== PRINT WORKSHEET FUNCTIONS ==========

