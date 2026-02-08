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
    document.getElementById("ttsToggleOn").classList.toggle("active", enabled);
    document.getElementById("ttsToggleOff").classList.toggle("active", !enabled);
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
            if (decimalSelect && settings.decimals) decimalSelect.value = settings.decimals;
            if (timerSelect && settings.timer) timerSelect.value = settings.timer;
            if (problemCountSelect && settings.problemCount) problemCountSelect.value = settings.problemCount;
            
            // Apply TTS setting
            if (settings.ttsEnabled !== undefined) {
                setTTS(settings.ttsEnabled);
            }
            
            // Update state
            state.range = parseInt(settings.range) || 100;
            state.decimalPlaces = parseInt(settings.decimals) || 0;
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
