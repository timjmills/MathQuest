// ws-options-shots backtest fixture (critic-panel-r1 F4, page errors): models a panel that throws while it draws. Each
// time the option panel is opened or redrawn, an uncaught error is thrown (the old gate printed it and passed).
new MutationObserver((recs) => {
    const hit = recs.some((r) => [...r.addedNodes].some((n) => n.nodeType === 1 && (n.id === 'skillOptionsPopover' || (n.closest && n.closest('#skillOptionsPopover')))));
    if (hit) setTimeout(() => { throw new Error('backtest fixture: a page error while the option panel draws'); }, 0);
}).observe(document.body, { childList: true, subtree: true });
