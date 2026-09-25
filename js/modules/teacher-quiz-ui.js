// teacher-quiz-ui.js — small shared pieces for the quiz screens in the teacher style
// (quiz builder, quiz settings, quiz results, live monitor). The screens themselves are
// styled by css/teacher-quiz.css with the --tv-* tokens of css/teacher.css.
//
//   isTeacher()           body.teacher-mode is on
//   note(msg, type)       the teacher toast in teacher mode, the app toast otherwise
//   backHTML(label, js)   the "← Quizzes" ghost button every quiz screen starts with
//   goQuizzes()           back to the teacher Quizzes screen (or the pupil home)
//   tvqMenu(btn)          opens / closes the .tv-menu that follows a "More" button;
//                         a click outside or Escape closes it (window.tvqMenu)

import { icon, toast } from './teacher-ui.js';

export const isTeacher = () => typeof document !== 'undefined' && document.body.classList.contains('teacher-mode');

export function note(msg, type) {
    if (isTeacher() && document.getElementById('tvToast')) toast(msg);
    else if (window.showToast) window.showToast(msg, type);
}

export function backHTML(label, action) {
    return `<button type="button" class="tv-btn tv-btn-ghost tvq-back" onclick="${action}">${icon('back', 18)}<span>${label}</span></button>`;
}

export function goQuizzes() {
    if (isTeacher() && window.tvGo) window.tvGo('quizzes');
    else if (window.openMyQuizzes) window.openMyQuizzes();
    else window.showView('homeView');
}

let open = null;

function closeMenu(focusBtn) {
    if (!open) return;
    const { btn, menu } = open;
    menu.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    open = null;
    if (focusBtn && btn.isConnected) btn.focus();
}

export function tvqMenu(btn) {
    const menu = btn && btn.parentElement ? btn.parentElement.querySelector('.tv-menu') : null;
    if (!menu) return;
    if (open && open.menu === menu) { closeMenu(false); return; }
    closeMenu(false);
    menu.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    open = { btn, menu };
    const first = menu.querySelector('button:not([disabled])');
    if (first) first.focus();
}

if (typeof document !== 'undefined') {
    document.addEventListener('click', (e) => {
        if (!open) return;
        if (open.btn.contains(e.target)) return;
        // A choice in the menu runs its own handler, then the menu closes.
        closeMenu(false);
    }, true);
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && open) closeMenu(true);
    });
}
