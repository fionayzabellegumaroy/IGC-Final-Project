let overlay = null;

export function createDebugOverlay() {
  if (overlay) return overlay;

  const el = document.createElement('div');
  el.id = 'debug-overlay';
  el.style.position = 'fixed';
  el.style.right = '12px';
  el.style.bottom = '12px';
  el.style.padding = '8px 10px';
  el.style.background = 'rgba(0,0,0,0.6)';
  el.style.color = '#0f0';
  el.style.fontFamily = 'monospace';
  el.style.fontSize = '12px';
  el.style.lineHeight = '1.2';
  el.style.zIndex = '9999';
  el.style.borderRadius = '6px';
  el.style.minWidth = '120px';
  el.style.pointerEvents = 'none';

  document.body.appendChild(el);

  overlay = {
    el,
    history: []
  };

  return overlay;
}

export function updateDebugOverlay(delta, rawDelta, camPos) {
  if (!overlay) return;
  const h = overlay.history;
  h.push(delta);
  if (h.length > 120) h.shift();

  // compute avg fps over history
  const avgDelta = h.reduce((a,b) => a+b, 0) / h.length;
  const fps = (avgDelta > 0) ? (1 / avgDelta) : 0;

  const lastMs = (rawDelta * 1000).toFixed(1);
  const clampedMs = (delta * 1000).toFixed(1);

  overlay.el.innerHTML = `
    <div>FPS: ${fps.toFixed(1)}</div>
    <div>Δ: ${lastMs}ms (clamped ${clampedMs}ms)</div>
    <div>cam: ${camPos ? camPos.map(n => n.toFixed(1)).join(',') : 'n/a'}</div>
  `;
}

export function disposeDebugOverlay() {
  if (!overlay) return;
  try { overlay.el.remove(); } catch (e) {}
  overlay = null;
}

export default {
  createDebugOverlay,
  updateDebugOverlay,
  disposeDebugOverlay
};
