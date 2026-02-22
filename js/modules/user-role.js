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

export function setUserRole(role) {
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
    
    // Save preference
    localStorage.setItem('mathquest_user_role', role);
    
    // Update UI based on role (but preserve skills/settings)
    updateUIForRole(role);
    
    // Refresh all skill displays to show in correct format for role
    window.UnifiedSkills?.updateAllUI?.();
    window.updateQuickSkillCards?.();
    window.renderFavorites?.();
}

export function loadUserRole() {
    const savedRole = localStorage.getItem('mathquest_user_role') || 'student';
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
