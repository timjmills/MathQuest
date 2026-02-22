import { DOMAINS, SKILLS, getSkillGrade, gradeCircleHTML } from './data.js';

export function buildSkillIndex() {
    const index = [];
    for (const [domainId, domain] of Object.entries(DOMAINS)) {
        for (const category of domain.categories) {
            const skills = SKILLS[category.id];
            if (skills && Array.isArray(skills)) {
                for (const skill of skills) {
                    index.push({
                        domainId: domainId,
                        domainName: domain.name,
                        domainIcon: domain.icon,
                        domainColor: domain.color,
                        categoryId: category.id,
                        categoryName: category.name,
                        categoryIcon: category.icon,
                        skillId: skill.v,
                        skillLabel: skill.l,
                        // Create searchable text
                        searchText: `${domain.name} ${category.name} ${skill.l}`.toLowerCase()
                    });
                }
            }
        }
    }
    return index;
}

let skillIndex = null;

export function getSkillIndex() {
    if (!skillIndex) {
        skillIndex = buildSkillIndex();
    }
    return skillIndex;
}

export function handleSkillSearch(query) {
    const resultsDiv = document.getElementById('skillSearchResults');
    if (!query || query.trim().length < 2) {
        resultsDiv.style.display = 'none';
        return;
    }
    
    const index = getSkillIndex();
    const lowerQuery = query.toLowerCase().trim();
    const terms = lowerQuery.split(/\s+/);
    
    // Find matches - all terms must match
    const matches = index.filter(item => {
        return terms.every(term => item.searchText.includes(term));
    });
    
    if (matches.length === 0) {
        resultsDiv.innerHTML = '<div style="padding:15px;color:var(--text-dim);text-align:center;">No skills found. Try different keywords.</div>';
        resultsDiv.style.display = 'block';
        return;
    }
    
    // Group by domain for better organization
    let html = '';
    let lastDomain = '';
    
    for (const match of matches) {
        if (match.domainId !== lastDomain) {
            if (lastDomain !== '') {
                html += '</div>'; // Close previous domain group
            }
            html += `<div style="padding:8px 12px;background:${match.domainColor}22;font-weight:600;font-size:0.85rem;color:${match.domainColor};border-bottom:1px solid var(--border);">
                ${match.domainIcon} ${match.domainName}
            </div><div>`;
            lastDomain = match.domainId;
        }
        
        // Check if skill is already in queue and if it's a favorite
        const isInQueue = window.UnifiedSkills?.has(match.skillId, match.categoryId) || false;
        const isFav = window.isFavorite ? window.isFavorite(match.categoryId, match.skillId) : false;
        
        // Escape for HTML attributes
        const escapeAttr = (str) => str.replace(/'/g, '&#39;').replace(/"/g, '&quot;');
        const safeSkillLabel = escapeAttr(match.skillLabel);
        const safeCategoryName = escapeAttr(match.categoryName);
        
        html += `<div class="search-result-item" style="display:flex;align-items:center;padding:8px 12px;cursor:pointer;border-bottom:1px solid var(--border);transition:background 0.2s;gap:8px;"
            onmouseover="this.style.background='var(--bg-card-light)'" onmouseout="this.style.background='transparent'">
            <button onclick="event.stopPropagation(); toggleFavorite('${match.categoryId}', '${match.skillId}', '${safeSkillLabel}', '${match.categoryIcon}', '${safeCategoryName}')"
                class="star-btn ${isFav ? 'favorited' : ''}"
                style="color:${isFav ? 'var(--accent-gold)' : 'var(--text-dim)'};"
                title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
                ${isFav ? '⭐' : '☆'}
            </button>
            <div style="flex:1;" onclick="selectSkillFromSearch('${match.domainId}', '${match.categoryId}', '${match.skillId}')">
                <div style="font-weight:500;color:var(--text);display:flex;align-items:center;gap:6px;">${gradeCircleHTML(getSkillGrade(match.skillId, match.categoryId))} ${match.skillLabel}</div>
                <div style="font-size:0.8rem;color:var(--text-dim);">${match.categoryIcon} ${match.categoryName}</div>
            </div>
            <button onclick="event.stopPropagation(); addToSkillQueue('${match.domainId}', '${match.categoryId}', '${match.skillId}', '${safeSkillLabel}', '${match.categoryIcon}', '${safeCategoryName}', '${match.domainColor}')"
                style="width:32px;height:32px;border-radius:50%;border:2px solid ${isInQueue ? 'var(--correct)' : 'var(--accent-purple)'};background:${isInQueue ? 'var(--correct)' : 'transparent'};color:${isInQueue ? 'white' : 'var(--accent-purple)'};cursor:pointer;font-size:1.2rem;display:flex;align-items:center;justify-content:center;transition:all 0.2s;"
                onmouseover="if(!this.classList.contains('added')){this.style.background='var(--accent-purple)';this.style.color='white';}" 
                onmouseout="if(!this.classList.contains('added')){this.style.background='transparent';this.style.color='var(--accent-purple)';}"
                title="${isInQueue ? 'Already in queue' : 'Add to practice/print queue'}"
                ${isInQueue ? 'class="added"' : ''}>
                ${isInQueue ? '✓' : '+'}
            </button>
        </div>`;
    }
    
    if (lastDomain !== '') {
        html += '</div>'; // Close last domain group
    }
    
    html += `<div style="padding:10px;text-align:center;color:var(--text-dim);font-size:0.85rem;background:var(--bg-card-light);">
        Showing ${matches.length} result${matches.length !== 1 ? 's' : ''}.
    </div>`;
    
    // Add queue action buttons at bottom if results found
    html += `<div style="padding:10px 12px;background:linear-gradient(135deg, var(--accent-purple)10, var(--accent-cyan)10);border-top:2px solid var(--border);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
        <span style="font-size:0.8rem;color:var(--text-dim);">☆ Star to save favorite • Click <strong style="color:var(--accent-purple);">+</strong> to add to queue</span>
        <span id="searchQueueCount" style="font-size:0.8rem;color:var(--accent-purple);font-weight:600;">${window.UnifiedSkills?.count || 0} queued</span>
    </div>`;
    
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';
    resultsDiv.style.maxHeight = '400px';
    resultsDiv.style.overflowY = 'auto';
}

export function selectSkillFromSearch(domainId, categoryId, skillId) {
    // Look up skill metadata from the index
    const domain = DOMAINS[domainId];
    const domainColor = domain ? domain.color : '#8b5cf6';
    const category = domain?.categories?.find(c => c.id === categoryId);
    const categoryIcon = category?.icon || '📚';
    const categoryName = category?.name || categoryId;
    const skills = SKILLS[categoryId];
    const skillObj = skills?.find(s => s.v === skillId);
    const skillLabel = skillObj?.l || skillId;

    // Toggle: if already in queue, remove; else add
    if (window.UnifiedSkills?.has(skillId, categoryId)) {
        window.UnifiedSkills.removeBySkillId(skillId);
    } else {
        window.UnifiedSkills?.add({
            domainId, categoryId, skillId, skillLabel, categoryIcon, categoryName, domainColor
        });
    }

    // Clear search
    clearSkillSearch();
}

export function showSearchResults() {
    // Skip if programmatic focus from addToSkillQueue (search was just rebuilt)
    if (window._skipSearchFocus) return;
    const query = document.getElementById('skillSearchInput').value;
    if (query && query.trim().length >= 2) {
        handleSkillSearch(query);
    }
}

export function hideSearchResults() {
    const resultsDiv = document.getElementById('skillSearchResults');
    if (resultsDiv) resultsDiv.style.display = 'none';
}

export function clearSkillSearch() {
    const input = document.getElementById('skillSearchInput');
    const results = document.getElementById('skillSearchResults');
    if (input) input.value = '';
    if (results) results.style.display = 'none';
}

// Close search results when clicking outside
document.addEventListener('click', function(e) {
    const searchInput = document.getElementById('skillSearchInput');
    const searchResults = document.getElementById('skillSearchResults');
    const searchContainer = searchInput?.closest('.skill-search-container') || searchInput?.parentElement;
    
    // Check if click is outside the search input and results
    if (searchResults && searchResults.style.display !== 'none') {
        const clickedInSearch = searchInput?.contains(e.target) || 
                                searchResults?.contains(e.target) ||
                                searchContainer?.contains(e.target);
        if (!clickedInSearch) {
            hideSearchResults();
        }
    }
});

// ===== Mixed Mode Settings Functions =====

// State for mixed settings
let mixedSettingsState = {
    selectedSkills: {}, // { category: [skill1, skill2, ...] }
    timeChoice: 'student', // 'student' or 'teacher'
    modeChoice: 'student'  // 'student' or 'teacher'
};

// Save mixed mode settings to cookie
