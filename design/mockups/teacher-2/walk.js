// ?walk=<flow id>: highlights each click of a §2.6 flow in the mock-up and counts the actions taken.
(function () {
  const id = new URLSearchParams(location.search).get('walk'); if (!id) return;
  const f = (window.MQ_FLOWS || []).find(x => x.id === id); if (!f) return;
  const narrow = innerWidth < 820 && f.narrow; const acts = narrow || f.actions;
  let i = 0, clicks = 0;
  const box = document.createElement('div'); box.className = 'walk'; box.setAttribute('role', 'status'); document.body.appendChild(box);
  const visible = (sel) => [...document.querySelectorAll(sel)].find(e => e.offsetParent !== null || getComputedStyle(e).position === 'fixed');
  function paint() {
    document.querySelectorAll('.walk-target').forEach(e => e.classList.remove('walk-target'));
    const steps = Math.max(...acts.map(a => a.step));
    if (i >= acts.length) { box.innerHTML = `<b>Done: ${f.task}</b><span>${clicks} actions, ${steps} step${steps > 1 ? 's' : ''} (the plan: ${f.plan.actions} actions; today ${f.plan.today}).</span><a class="btn" href="flows.html">Back to the flows</a>`; return; }
    const a = acts[i]; const el = visible(a.click || a.type); if (el) el.classList.add('walk-target');
    box.innerHTML = `<b>${f.task}</b><span>Step ${a.step} of ${steps} · action ${i + 1} of ${acts.length}</span><span>${a.say}${a.type ? `: type “${a.text}”` : ''}</span>`;
  }
  document.addEventListener('click', (e) => { const a = acts[i]; if (!a || !a.click) return; const t = e.target.closest(a.click); if (t) { i++; clicks++; setTimeout(paint, 0); } }, true);
  document.addEventListener('input', (e) => { const a = acts[i]; if (a && a.type && e.target.matches(a.type) && e.target.value.trim().toLowerCase() === a.text) { i++; clicks++; setTimeout(paint, 0); } }, true);
  window.addEventListener('mq:render', () => setTimeout(paint, 0));
  paint();
})();
