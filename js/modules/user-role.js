import { state } from './state.js';
import { setCookie, getCookie } from './storage.js';

export function toggleUserRole() {
    const currentRole = document.body.classList.contains('teacher-mode') ? 'teacher' : 'student';
    const newRole = currentRole === 'teacher' ? 'student' : 'teacher';
    setUserRole(newRole);
}

export function setUserRole(role) {
    const toggle = document.getElementById('roleToggle');
    const slider = document.getElementById('roleToggleSlider');
    
    // Skills and settings are already preserved in skillQueue and state
    // Just update the UI classes
    
    if (role === 'teacher') {
        document.body.classList.remove('student-mode');
        document.body.classList.add('teacher-mode');
        if (toggle) toggle.classList.add('teacher-mode');
        if (slider) slider.textContent = '👩‍🏫';
        // Initialize inline dropdowns when switching to teacher mode
        window.initInlineDropdowns?.();
    } else {
        document.body.classList.remove('teacher-mode');
        document.body.classList.add('student-mode');
        if (toggle) toggle.classList.remove('teacher-mode');
        if (slider) slider.textContent = '👨‍🎓';
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
