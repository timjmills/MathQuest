// Chromebook fit (owner, 2026-10-09): pupils mostly play on Chromebooks, ~1366 x 650 or 1280 x 600
// of visible page. During PUPIL PLAY (the practice card, the online worksheet, the quiz) the app's
// chrome above the problem used to take ~420 px, so the answer box sat below the fold.
//
// This module only keeps two flags current; the look lives in css/play-compact.css, which acts on
// short screens only (tall screens, the home screen, teacher screens and print are unchanged):
//   html.mq-play     a pupil-play view is the active view
//   html.mq-navopen  the compact header's Menu is open (the full app controls drop down from it)
// and adds the Menu button the compact header shows in place of the row of app controls.
// Every control stays reachable: role toggle, XP, MAP Test, Pop-ups, Voice, Sound, Adaptive,
// Reset and Theme are one tap away in the Menu, keyboard reachable, and Escape closes it.

const PLAY_VIEWS = ['gameView', 'worksheetView', 'quizTakeView'];

function inPlay() {
    const v = document.querySelector('.view.active');
    return !!v && PLAY_VIEWS.includes(v.id);
}

function setMenu(open) {
    const root = document.documentElement;
    const btn = document.getElementById('mqPlayMenuBtn');
    root.classList.toggle('mq-navopen', !!open);
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
}

function sync() {
    const play = inPlay();
    document.documentElement.classList.toggle('mq-play', play);
    if (!play) setMenu(false);
}

export function togglePlayMenu(force) {
    const open = typeof force === 'boolean' ? force : !document.documentElement.classList.contains('mq-navopen');
    setMenu(open);
    if (open) {
        const first = document.querySelector('#navStats button, #navStats input');
        if (first && typeof first.focus === 'function') { try { first.focus({ preventScroll: true }); } catch (e) { /* ignore */ } }
    }
}

export function installPlayCompact() {
    if (typeof document === 'undefined') return;
    const nav = document.querySelector('.container > .nav-bar');
    const stats = nav && nav.querySelector('.nav-stats');
    if (nav && stats && !document.getElementById('mqPlayMenuBtn')) {
        if (!stats.id) stats.id = 'navStats';
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'mqPlayMenuBtn';
        btn.className = 'mq-play-menu-btn';
        btn.setAttribute('aria-controls', stats.id);
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-label', 'Menu: settings and app controls');
        btn.title = 'Menu';
        btn.innerHTML = '<span aria-hidden="true">☰</span> Menu';
        btn.addEventListener('click', (e) => { e.stopPropagation(); togglePlayMenu(); });
        nav.insertBefore(btn, stats);
        // a tap outside the open menu closes it; a tap inside (a toggle, the voice picker) does not
        document.addEventListener('click', (e) => {
            if (!document.documentElement.classList.contains('mq-navopen')) return;
            if (stats.contains(e.target) || btn.contains(e.target)) return;
            setMenu(false);
        });
        document.addEventListener('keydown', (e) => {
            if (e.key !== 'Escape' || !document.documentElement.classList.contains('mq-navopen')) return;
            setMenu(false);
            try { btn.focus({ preventScroll: true }); } catch (err) { /* ignore */ }
        });
    }
    // Views are switched in several places (showView, the quiz, the MAP test); watching the class of
    // every .view catches them all without touching each caller.
    const mo = new MutationObserver(sync);
    document.querySelectorAll('.view').forEach(v => mo.observe(v, { attributes: true, attributeFilter: ['class'] }));
    sync();
}
