'use strict';
const xSlider = document.querySelector('#x-coordinate');
const ySlider = document.querySelector('#y-coordinate');
function updateCoordinate() {
  const x = Number(xSlider.value), y = Number(ySlider.value);
  const gx = Math.floor(x / 64), gy = Math.floor(y / 64), cx = x % 64, cy = y % 64;
  document.querySelector('#x-value').textContent = String(x);
  document.querySelector('#y-value').textContent = String(y);
  document.querySelector('#grid-output').textContent = `<grid> <${gx}> <${gy}> </grid>`;
  document.querySelector('#cell-output').textContent = `<cell> <${cx}> <${cy}> </cell>`;
  const px = (x + .5) / 8, py = (y + .5) / 8;
  const cell = document.querySelector('#grid-selection');
  cell.setAttribute('x', gx * 8); cell.setAttribute('y', gy * 8);
  for (const id of ['point-dot', 'point-halo']) {
    const dot = document.getElementById(id); dot.setAttribute('cx', px); dot.setAttribute('cy', py);
  }
  document.querySelector('#crosshair').setAttribute('d', `M${px} 0V512M0 ${py}H512`);
  document.querySelector('#coordinate-grid').setAttribute('aria-label', `Point (${x}, ${y}): Grid (${gx}, ${gy}), Cell (${cx}, ${cy}), at resolution 4096.`);
}
xSlider.addEventListener('input', updateCoordinate);
ySlider.addEventListener('input', updateCoordinate);
updateCoordinate();
const tabs = [...document.querySelectorAll('[role="tab"]')];
function selectTab(tab) {
  for (const t of tabs) {
    const active = t === tab;
    t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1;
    document.getElementById(t.dataset.panel).hidden = !active;
  }
}
for (const [i, tab] of tabs.entries()) {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', e => {
    let next;
    if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next !== undefined) { e.preventDefault(); selectTab(tabs[next]); tabs[next].focus(); }
  });
}
document.querySelector('#copy-citation').addEventListener('click', async () => {
  const citation = document.querySelector('#bibtex');
  try {
    await navigator.clipboard.writeText(citation.textContent);
    document.querySelector('#copy-status').textContent = 'Citation copied.';
  } catch {
    const range = document.createRange(); range.selectNodeContents(citation);
    const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
    document.querySelector('#copy-status').textContent = 'Citation selected. Press Ctrl+C or ⌘C to copy.';
  }
});
const dialog = document.querySelector('#figure-dialog');
for (const trigger of document.querySelectorAll('[data-zoom]')) {
  trigger.addEventListener('click', () => {
    const image = document.querySelector('#zoomed-figure');
    image.src = trigger.dataset.zoom; image.alt = trigger.querySelector('img').alt;
    dialog.showModal();
  });
}
document.querySelector('#close-figure').addEventListener('click', () => dialog.close());
dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
