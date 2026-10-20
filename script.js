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

// Animations are opt-in, pausable, and stop when scrolled out of view.
const flowDescriptions = {"training": ["Pair visual content with localization queries.", "Learn phrase, box, Grid\u2013Cell, and rejection tokens from supervised examples.", "Sample predictions and use task-specific rewards to refine localization.", "Return grounded phrases and boxes, or reject queries with no target."], "data": ["Start with annotated objects in COCO train2017 images.", "Generate attribute, state, relation, set-logic, and non-existence queries.", "Link expressions to annotated instances and parse the target sets.", "Collect complex referring examples and explicit non-existence queries."]};
const pauseAnimations = [];
for (const flow of document.querySelectorAll('[data-flow]')) {
  const play = flow.querySelector('.flow-play');
  const nodes = [...flow.querySelectorAll('.flow-node')];
  const descriptions = flowDescriptions[flow.id.replace('-flow', '')];
  let step = 0, timer;
  function showStep(index) {
    step = index;
    nodes.forEach((node, i) => { node.classList.toggle('is-active', i === step); node.setAttribute('aria-pressed', String(i === step)); });
    flow.querySelector('.flow-counter').textContent = `0${step + 1} / 04`;
    flow.querySelector('.flow-description p').textContent = descriptions[step];
  }
  function pause() {
    clearInterval(timer); timer = undefined;
    play.textContent = '▶ Play flow'; play.setAttribute('aria-pressed', 'false'); flow.classList.remove('is-playing');
  }
  play.addEventListener('click', () => {
    if (timer !== undefined) { pause(); return; }
    play.textContent = 'Ⅱ Pause'; play.setAttribute('aria-pressed', 'true'); flow.classList.add('is-playing');
    timer = setInterval(() => showStep((step + 1) % nodes.length), 2200);
  });
  nodes.forEach((node, i) => node.addEventListener('click', () => { pause(); showStep(i); }));
  new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pause(); }, {threshold: .1}).observe(flow);
  pauseAnimations.push(pause);
}
const coordinatePlay = document.querySelector('#play-coordinate');
const coordinateCanvas = document.querySelector('.demo-canvas');
let coordinateTimer;
function pauseCoordinate() {
  clearInterval(coordinateTimer); coordinateTimer = undefined;
  coordinatePlay.textContent = '▶ Play example'; coordinatePlay.setAttribute('aria-pressed', 'false'); coordinateCanvas.classList.remove('is-playing');
}
coordinatePlay.addEventListener('click', () => {
  if (coordinateTimer !== undefined) { pauseCoordinate(); return; }
  coordinatePlay.textContent = 'Ⅱ Pause example'; coordinatePlay.setAttribute('aria-pressed', 'true'); coordinateCanvas.classList.add('is-playing');
  const start = performance.now(), sx = Number(xSlider.value), sy = Number(ySlider.value);
  const targets = [[sx, sy], [3220, 790], [2820, 3290], [720, 2660], [sx, sy]];
  coordinateTimer = setInterval(() => {
    const t = ((performance.now() - start) / 2800) % 4, i = Math.floor(t), blend = (1 - Math.cos((t - i) * Math.PI)) / 2;
    xSlider.value = String(Math.round(targets[i][0] + (targets[i + 1][0] - targets[i][0]) * blend));
    ySlider.value = String(Math.round(targets[i][1] + (targets[i + 1][1] - targets[i][1]) * blend));
    updateCoordinate();
  }, 80);
});
xSlider.addEventListener('input', pauseCoordinate); ySlider.addEventListener('input', pauseCoordinate);
new IntersectionObserver(entries => { if (!entries[0].isIntersecting) pauseCoordinate(); }, {threshold:.1}).observe(coordinateCanvas);
pauseAnimations.push(pauseCoordinate);
document.addEventListener('visibilitychange', () => { if (document.hidden) pauseAnimations.forEach(pause => pause()); });
