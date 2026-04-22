// MAP Test Practice — results report and Ready-to-Learn (Phase 1A stub).

export function renderMapResults() {
    console.log('[MAP] renderMapResults stub');
}

export function printMapSession() {
    console.log('[MAP] printMapSession stub');
}

export function restartMapSession() {
    console.log('[MAP] restartMapSession stub');
    if (typeof window.showView === 'function') {
        window.showView('mapSelectorView');
    }
}
