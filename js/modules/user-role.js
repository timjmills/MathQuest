import { state } from './state.js';
import { setCookie, getCookie } from './storage.js';

let _lastRoleToggle = 0;
export function toggleUserRole() {
    // Debounce: prevent accidental rapid toggles
    const now = Date.now();
    if (now - _lastRoleToggle < 500) return;
    _lastRoleToggle = now;

    // Don't toggle if search is active (prevents accidental toggles during search interaction)
    const searchInput = document.getElementById('skillSearchInput');
    const searchResults = document.getElementById('skillSearchResults');
    if (searchInput === document.activeElement || (searchResults && searchResults.style.display !== 'none')) {
        return;
    }

    const currentRole = document.body.classList.contains('teacher-mode') ? 'teacher' : 'student';
    const newRole = currentRole === 'teacher' ? 'student' : 'teacher';
    setUserRole(newRole);
}

export function setUserRole(role, { persist = true } = {}) {
    // Guard: if already in the requested role, skip all DOM/UI work
    const currentRole = document.body.classList.contains('teacher-mode') ? 'teacher' : 'student';
    if (role === currentRole) return;

    const toggle = document.getElementById('roleToggle');
    const slider = document.getElementById('roleToggleSlider');

    const label = document.getElementById('roleToggleLabel');
    if (role === 'teacher') {
        document.body.classList.remove('student-mode');
        document.body.classList.add('teacher-mode');
        if (toggle) toggle.classList.add('teacher-mode');
        if (slider) slider.textContent = '👩‍🏫';
        if (label) label.textContent = 'Teacher View';
        // Initialize inline dropdowns when switching to teacher mode
        window.initInlineDropdowns?.();
    } else {
        document.body.classList.remove('teacher-mode');
        document.body.classList.add('student-mode');
        if (toggle) toggle.classList.remove('teacher-mode');
        if (slider) slider.textContent = '👨‍🎓';
        if (label) label.textContent = 'Student View';
    }
    
    // Save preference (not for a pupil link's one-off student view; see loadUserRole)
    if (persist) localStorage.setItem('mathquest_user_role', role);
    
    // Update UI based on role (but preserve skills/settings)
    updateUIForRole(role);
    
    // Refresh all skill displays to show in correct format for role
    window.UnifiedSkills?.updateAllUI?.();
    window.updateQuickSkillCards?.();
    window.renderFavorites?.();
}

// Link parameters that are addressed to a pupil (skill code, MX- code, Quick Start, MAP test, quiz).
const PUPIL_LINK_PARAMS = ['c', 'code', 'qs', 'map', 'quiz'];

export function loadUserRole() {
    // A pupil link always opens in student view, even on a device last used as a teacher;
    // otherwise the teacher shell covers the game the link starts. It is not saved, so the
    // device's own role comes back on the next plain visit.
    let pupilLink = false;
    try {
        const params = new URLSearchParams(window.location.search);
        pupilLink = PUPIL_LINK_PARAMS.some((k) => params.get(k));
    } catch (e) { /* no location */ }
    const savedRole = localStorage.getItem('mathquest_user_role') || 'student';
    // The teacher's "Open board view in new window" link (?c=…&board=1) opens the whole-class
    // board on a teacher device; on any other device it is an ordinary pupil link.
    let board = false;
    try { board = new URLSearchParams(window.location.search).get('board') === '1'; } catch (e) { /* no location */ }
    if (pupilLink && board && savedRole === 'teacher') {
        setUserRole('teacher', { persist: false });
        return;
    }
    if (pupilLink) { setUserRole('student', { persist: false }); return; }
    setUserRole(savedRole);
}

export function updateUIForRole(role) {
    // Update quick skills visibility - now visible in both modes
    const quickSkillsSection = document.getElementById('quickSkillsSection');
    if (quickSkillsSection) {
        quickSkillsSection.style.display = 'block'; // Always show
    }
    
    // Show/hide edit button based on role
    const editQuickSkillsBtn = document.getElementById('editQuickSkillsBtn');
    if (editQuickSkillsBtn) {
        editQuickSkillsBtn.style.display = role === 'teacher' ? 'inline-flex' : 'none';
    }
}
// ===== END USER ROLE SYSTEM =====

// ===== QUICK SKILL FUNCTIONS (Student Mode) =====
