// TTS voice picker — lets the user choose from the browser's installed
// speech-synthesis voices and persists the choice to localStorage so it
// survives across sessions on this computer.
//
// Public API (also exposed on window):
//   getAvailableVoices()       → SpeechSynthesisVoice[] (sorted)
//   getSelectedVoiceURI()      → string | null
//   setSelectedVoiceURI(uri)   → void (writes to localStorage)
//   applyVoice(utterance)      → void (sets utterance.voice from saved choice)
//   populateVoicePicker(el)    → fills a <select> with the voice list
//   testSelectedVoice()        → speaks a short sample with the chosen voice
//   openVoicePopover()         → toggles the in-nav popover open/close

const STORAGE_KEY = 'mathquest_voice_uri';

export function getAvailableVoices() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return [];
    let voices = [];
    try { voices = window.speechSynthesis.getVoices() || []; } catch (_) { return []; }
    // Sort: English-default first, then by language, then by name.
    return [...voices].sort((a, b) => {
        const aEn = (a.lang || '').toLowerCase().startsWith('en') ? 0 : 1;
        const bEn = (b.lang || '').toLowerCase().startsWith('en') ? 0 : 1;
        if (aEn !== bEn) return aEn - bEn;
        if (a.lang !== b.lang) return (a.lang || '').localeCompare(b.lang || '');
        return (a.name || '').localeCompare(b.name || '');
    });
}

export function getSelectedVoiceURI() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (_) { return null; }
}

export function setSelectedVoiceURI(uri) {
    try {
        if (uri) localStorage.setItem(STORAGE_KEY, uri);
        else localStorage.removeItem(STORAGE_KEY);
    } catch (_) { /* non-fatal */ }
}

// Apply the user's saved voice choice to an utterance, if any.
// Falls through silently if no choice or no matching voice — caller still
// gets the browser default.
export function applyVoice(utterance) {
    if (!utterance) return;
    const uri = getSelectedVoiceURI();
    if (!uri) return;
    const voices = getAvailableVoices();
    const match = voices.find(v => v.voiceURI === uri);
    if (match) {
        utterance.voice = match;
        // Some browsers (Edge) need both .voice AND .lang to actually switch.
        if (match.lang) utterance.lang = match.lang;
    }
}

export function populateVoicePicker(selectEl) {
    if (!selectEl) return;
    const voices = getAvailableVoices();
    const currentURI = getSelectedVoiceURI();
    selectEl.innerHTML = '';
    // First option = browser default (no override).
    const def = document.createElement('option');
    def.value = '';
    def.textContent = '— Browser default —';
    if (!currentURI) def.selected = true;
    selectEl.appendChild(def);
    if (!voices.length) {
        const empty = document.createElement('option');
        empty.value = '';
        empty.textContent = '(loading voices…)';
        empty.disabled = true;
        selectEl.appendChild(empty);
        return;
    }
    for (const v of voices) {
        const opt = document.createElement('option');
        opt.value = v.voiceURI;
        const flag = (v.lang || '').slice(0, 2).toUpperCase();
        opt.textContent = `${v.name} — ${flag}${v.localService ? '' : ' (online)'}`;
        if (v.voiceURI === currentURI) opt.selected = true;
        selectEl.appendChild(opt);
    }
}

export function testSelectedVoice(text) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try { window.speechSynthesis.cancel(); } catch (_) {}
    const u = new SpeechSynthesisUtterance(text || 'Hello! This is your math practice voice.');
    u.rate = 0.95;
    u.pitch = 1.0;
    applyVoice(u);
    try { window.speechSynthesis.speak(u); } catch (_) {}
}

// ── Top-nav popover behavior ─────────────────────────────────────────
// Opens/closes the picker panel attached to a button in the top nav.
// HTML is expected to contain #voicePickerPopover and #voicePickerSelect.

export function openVoicePopover() {
    const pop = document.getElementById('voicePickerPopover');
    if (!pop) return;
    const selectEl = document.getElementById('voicePickerSelect');
    populateVoicePicker(selectEl);
    pop.classList.toggle('open');
}

export function closeVoicePopover() {
    const pop = document.getElementById('voicePickerPopover');
    if (pop) pop.classList.remove('open');
}

// Document-level click handler to close the popover when clicking outside.
function _initOutsideClick() {
    if (typeof document === 'undefined') return;
    document.addEventListener('click', (e) => {
        const pop = document.getElementById('voicePickerPopover');
        const wrap = document.getElementById('voicePickerWrap');
        if (!pop || !pop.classList.contains('open')) return;
        if (wrap && wrap.contains(e.target)) return;
        pop.classList.remove('open');
    });
}

// Re-populate the picker when the browser's voice list finally loads
// (Chrome/Edge return [] synchronously and emit `voiceschanged` when ready).
function _initVoicesChanged() {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
        window.speechSynthesis.getVoices();  // prime the list
        window.speechSynthesis.addEventListener('voiceschanged', () => {
            const sel = document.getElementById('voicePickerSelect');
            if (sel) populateVoicePicker(sel);
        });
    } catch (_) { /* non-fatal */ }
}

if (typeof window !== 'undefined') {
    window.getAvailableVoices = getAvailableVoices;
    window.getSelectedVoiceURI = getSelectedVoiceURI;
    window.setSelectedVoiceURI = setSelectedVoiceURI;
    window.applyVoice = applyVoice;
    window.populateVoicePicker = populateVoicePicker;
    window.testSelectedVoice = testSelectedVoice;
    window.openVoicePopover = openVoicePopover;
    window.closeVoicePopover = closeVoicePopover;
    _initOutsideClick();
    _initVoicesChanged();
}
