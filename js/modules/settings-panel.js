import { state } from './state.js';
import { setCookie, getCookie } from './storage.js';

export function toggleSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('settingsPanelOverlay');
    
    if (panel.classList.contains('active')) {
        closeSettingsPanel();
    } else {
        openSettingsPanel();
    }
}

export function openSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('settingsPanelOverlay');
    
    panel.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

export function closeSettingsPanel() {
    const panel = document.getElementById('settingsPanel');
    const overlay = document.getElementById('settingsPanelOverlay');
    
    panel.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = ''; // Restore scrolling
}
// ===== END SETTINGS PANEL =====

export function setTTS(enabled) {
    state.ttsEnabled = enabled;
    const onEl = document.getElementById("ttsToggleOn");
    const offEl = document.getElementById("ttsToggleOff");
    if (onEl) onEl.classList.toggle("active", enabled);
    if (offEl) offEl.classList.toggle("active", !enabled);
    // Sync nav bar toggle
    const navToggle = document.getElementById("voiceToggle");
    if (navToggle) navToggle.checked = enabled;
    saveSettings(); // Save when TTS changes
    saveSettingsToStorage(); // Also save to localStorage
}

// ===== SETTINGS PERSISTENCE =====
// Save settings bar values to localStorage (persists across tabs and sessions)
export function saveSettingsToStorage() {
    try {
        const settings = {
            range: document.getElementById('rangeSelect')?.value || '100',
            decimals: document.getElementById('decimalSelect')?.value || '0',
            timer: document.getElementById('timerSelect')?.value || '180',
            problemCount: document.getElementById('problemCountSelect')?.value || '20',
            ttsEnabled: state.ttsEnabled,
            timestamp: Date.now()
        };
        localStorage.setItem('mathQuestSettings', JSON.stringify(settings));
        console.log('Settings saved:', settings);
    } catch (e) {
        console.warn('Could not save settings to localStorage:', e);
    }
}

// Load settings from localStorage
export function loadSettingsFromStorage() {
    try {
        const saved = localStorage.getItem('mathQuestSettings');
        if (saved) {
            const settings = JSON.parse(saved);
            console.log('Loading saved settings:', settings);
            
            // Apply settings to dropdowns
            const rangeSelect = document.getElementById('rangeSelect');
            const decimalSelect = document.getElementById('decimalSelect');
            const timerSelect = document.getElementById('timerSelect');
            const problemCountSelect = document.getElementById('problemCountSelect');

            if (rangeSelect && settings.range) rangeSelect.value = settings.range;
            // Decimals always start at 0 each session (unless overridden by shared link)
            if (decimalSelect) decimalSelect.value = '0';
            if (timerSelect && settings.timer) timerSelect.value = settings.timer;
            if (problemCountSelect && settings.problemCount) problemCountSelect.value = settings.problemCount;
            
            // TTS defaults ON every session per user spec — students can
            // toggle it off mid-session via the audio button, but the
            // preference is NOT persisted across sessions so audio always
            // starts on (matching MAP-mode behavior).
            setTTS(true);
            
            // Update state
            state.range = parseInt(settings.range) || 100;
            // decimalPlaces always defaults to 0 each session (shared links override via startFromLanding)
            state.timerDuration = parseInt(settings.timer) || 180;
            state.problemCount = parseInt(settings.problemCount) || 20;
            
            return true;
        }
    } catch (e) {
        console.warn('Could not load settings from localStorage:', e);
    }
    return false;
}
// ===== END SETTINGS PERSISTENCE =====

// Update category dropdown based on selected domain
