// Chromebook fit (owner, 2026-10-09): pupils mostly play on Chromebooks, ~1366 x 650 or 1280 x 600
// of visible page. During PUPIL PLAY (the practice card, boss, race, the online worksheet, the quiz)
// the app's chrome above the problem used to take ~420 px, so the answer box sat below the fold.
//
// The look lives in css/play-compact.css, which acts on short, laptop-wide screens in student mode
// only (tall screens, the home screen, teacher screens and print are unchanged). This module:
//   - keeps html.mq-play current (a pupil-play view is the active view);
//   - adds the Menu button of the compact play bar, and html.mq-navopen while its menu is open: the
//     stats chips and every app control (role, XP, MAP Test, Pop-ups, Voice, Sound, Adaptive,
//     Reset, Theme) drop down from it, keyboard reachable, Escape or a tap outside closes it;
//   - while the compact bar is in use, moves the row of app controls to just after the Menu button
//     and the stats chips, so the Tab order follows the screen, and puts it back after play.

const PLAY_VIEWS = ['gameView', 'worksheetView', 'quizTakeView'];
const SHORT = '(max-height: 860px) and (min-width: 700px)';
let mql = null;
let home = null;   // where the row of app controls lives outside compact play: { parent, next }

function inPlay() {
    const v = document.querySelector('.view.active');
    return !!v && PLAY_VIEWS.includes(v.id);
}

function closeVoice() {
    const voice = document.getElementById('voicePickerPopover');
    if (voice && typeof window.closeVoicePopover === 'function' && getComputedStyle(voice).display !== 'none') {
        try { window.closeVoicePopover(); } catch (e) { /* ignore */ }
    }
}

function setMenu(open) {
    const root = document.documentElement;
    const was = root.classList.contains('mq-navopen');
    root.classList.toggle('mq-navopen', !!open);
    const btn = document.getElementById('mqPlayMenuBtn');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (was && !open) {
        // closing the menu closes what was opened from it
        const map = document.getElementById('mapNavWrap');
        if (map) map.classList.remove('open');
        closeVoice();
    }
}

// The row of app controls sits after the Menu button and the stats chips while the compact bar is in
// use, and back in the nav bar otherwise.
function placeControls(compact) {
    const stats = document.getElementById('navStats');
    const btn = document.getElementById('mqPlayMenuBtn');
    if (!stats || !btn || !home) return;
    if (compact) {
        const banner = document.getElementById('studentBanner');
        const after = banner && banner.parentNode === btn.parentNode && (btn.compareDocumentPosition(banner) & Node.DOCUMENT_POSITION_FOLLOWING) ? banner : btn;
        if (after.nextSibling !== stats) after.parentNode.insertBefore(stats, after.nextSibling);
    } else if (stats.parentNode !== home.parent) {
        home.parent.insertBefore(stats, home.next && home.next.parentNode === home.parent ? home.next : null);
    }
}

function sync() {
    const play = inPlay();
    document.documentElement.classList.toggle('mq-play', play);
    const compact = play && !!mql && mql.matches && document.body.classList.contains('student-mode');
    placeControls(compact);
    if (!compact) setMenu(false);
}

export function togglePlayMenu(force) {
    const open = typeof force === 'boolean' ? force : !document.documentElement.classList.contains('mq-navopen');
    setMenu(open);
}

export function installPlayCompact() {
    if (typeof document === 'undefined') return;
    const nav = document.querySelector('.container > .nav-bar');
    const stats = nav && nav.querySelector('.nav-stats');
    if (nav && stats && !document.getElementById('mqPlayMenuBtn')) {
        if (!stats.id) stats.id = 'navStats';
        home = { parent: stats.parentNode, next: stats.nextSibling };
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'mqPlayMenuBtn';
        btn.className = 'mq-play-menu-btn';
        btn.setAttribute('aria-controls', stats.id);
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Menu: my stats, settings and app controls');
        btn.title = 'Menu';
        btn.innerHTML = '<span aria-hidden="true">☰</span> Menu';
        btn.addEventListener('click', (e) => { e.stopPropagation(); togglePlayMenu(); });
        // after My Stats, so the Tab order follows the bar on screen (… My Stats, Menu)
        const myStats = document.getElementById('myStatsBar');
        if (myStats && myStats.parentNode === nav.parentNode) nav.parentNode.insertBefore(btn, myStats.nextSibling);
        else nav.insertBefore(btn, stats);
        // a tap outside the open menu closes it; a tap inside (a toggle, the voice picker) does not
        document.addEventListener('click', (e) => {
            if (!document.documentElement.classList.contains('mq-navopen')) return;
            const banner = document.getElementById('studentBanner');
            if (stats.contains(e.target) || btn.contains(e.target) || (banner && banner.contains(e.target))) return;
            setMenu(false);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape' || !document.documentElement.classList.contains('mq-navopen')) return;
            setMenu(false);
            try { btn.focus({ preventScroll: true }); } catch (err) { /* ignore */ }
        });
        // one pop-up of the menu at a time: the MAP list and the voice picker close each other
        const mapBtn = stats.querySelector('.map-nav-btn');
        const voiceBtn = document.getElementById('voicePickerBtn');
        if (mapBtn) mapBtn.addEventListener('click', closeVoice, true);
        if (voiceBtn) voiceBtn.addEventListener('click', () => {
            const map = document.getElementById('mapNavWrap');
            if (map) map.classList.remove('open');
        }, true);
    }
    if (typeof window !== 'undefined' && window.matchMedia) {
        mql = window.matchMedia(SHORT);
        if (mql.addEventListener) mql.addEventListener('change', sync);
    }
    // Views are switched in several places (showView, the quiz, the MAP test); watching the class of
    // every .view (and of body, for the role) catches them all without touching each caller.
    const mo = new MutationObserver(sync);
    document.querySelectorAll('.view').forEach(v => mo.observe(v, { attributes: true, attributeFilter: ['class'] }));
    mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    sync();
}
