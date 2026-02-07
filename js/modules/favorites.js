import { state } from './state.js';
import { setCookie, getCookie } from './storage.js';

export function loadFavorites() {
    // Favorites are now part of Quick Start - no separate loading needed
    // The old favorites localStorage is deprecated, skills are now in window.customQuickSkills with source='student'
}

export function saveFavorites() {
    // Favorites are now saved as part of Quick Start
    saveQuickSkills();
}

export function addFavorite(categoryId, skillId, skillLabel, categoryIcon, categoryName) {
    // Decode HTML entities
    const decodeHtml = (str) => {
        const txt = document.createElement('textarea');
        txt.innerHTML = str;
        return txt.value;
    };
    const decodedLabel = decodeHtml(skillLabel);
    const decodedCategoryName = decodeHtml(categoryName);
    
    // Add to Quick Start with source='student'
    addToQuickSkills(categoryId, skillId, decodedLabel, categoryIcon, decodedCategoryName, 'student');
}

export function removeFavorite(categoryId, skillId) {
    // Remove from Quick Start (only if source='student')
    const index = window.customQuickSkills.findIndex(s => s.skillId === skillId && s.categoryId === categoryId && s.source === 'student');
    if (index > -1) {
        window.customQuickSkills.splice(index, 1);
        saveQuickSkills();
        renderQuickSkillsGrid();
        showNotification('Removed starred skill', 'info');
    }
}

export function toggleFavorite(categoryId, skillId, skillLabel, categoryIcon, categoryName) {
    // Check if already in Quick Start as student-added
    const existsAsStudent = window.customQuickSkills.some(s => s.skillId === skillId && s.categoryId === categoryId && s.source === 'student');
    if (existsAsStudent) {
        removeFavorite(categoryId, skillId);
    } else {
        addFavorite(categoryId, skillId, skillLabel, categoryIcon, categoryName);
    }
    // Refresh search results to update star appearance
    const searchInput = document.getElementById('skillSearchInput');
    if (searchInput && searchInput.value.length >= 2) {
        handleSkillSearch(searchInput.value);
    }
    // Update quick skill cards
    updateQuickSkillCards();
}

export function isFavorite(categoryId, skillId) {
    // Check if in Quick Start as student-added
    return window.customQuickSkills.some(s => s.skillId === skillId && s.categoryId === categoryId && s.source === 'student');
}

export function clearFavorites() {
    // Remove all student-added skills from Quick Start
    const studentSkills = window.customQuickSkills.filter(s => s.source === 'student');
    if (studentSkills.length === 0) {
        showNotification('No starred skills to clear', 'info');
        return;
    }
    if (confirm('Clear all starred skills?')) {
        window.customQuickSkills = window.customQuickSkills.filter(s => s.source !== 'student');
        saveQuickSkills();
        renderQuickSkillsGrid();
        showNotification('Starred skills cleared', 'info');
    }
}

export function renderFavorites() {
    // Favorites are now rendered as part of Quick Start - no separate rendering needed
    renderQuickSkillsGrid();
}

export function updateFavoriteCards() {
    // Favorites are now part of Quick Start
    renderQuickSkillsGrid();
}
// ===== END FAVORITE SKILLS SYSTEM =====

// ===== SETTINGS PANEL =====
