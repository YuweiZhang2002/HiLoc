'use strict';
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
    image.src = trigger.dataset.zoom; image.alt = trigger.dataset.zoomAlt || trigger.querySelector('img')?.alt || 'Paper figure';
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
// Figure 4: illustrative referring expressions, including a negative query.
const expressionExamples = [
  {type:'ATTRIBUTE', text:'The blue circle.', targets:[0]},
  {type:'RELATION', text:'The shape to the left of the orange triangle.', targets:[0]},
  {type:'SET LOGIC', text:'All shapes except the blue circle.', targets:[1,2]},
  {type:'NON-EXISTENCE', text:'The purple triangle.', targets:[]}
];
let expressionIndex = 0, expressionTimer;
const expressionPlay = document.querySelector('#play-expressions');
function showExpression(index) {
  expressionIndex = index; const item = expressionExamples[index];
  document.querySelector('#expression-type').textContent = item.type;
  document.querySelector('#expression-text').textContent = `“${item.text}”`;
  document.querySelector('#expression-result').textContent = item.targets.length ? `${item.targets.length} target instance${item.targets.length > 1 ? 's' : ''}` : 'No target → <no_box>';
  for (const box of document.querySelectorAll('.target-box')) box.setAttribute('opacity', item.targets.includes(Number(box.dataset.target)) ? '1' : '0');
}
function stopExpressions() { clearInterval(expressionTimer); expressionTimer = undefined; expressionPlay.textContent = '▶ Play examples'; expressionPlay.setAttribute('aria-pressed','false'); }
expressionPlay.addEventListener('click', () => { if (expressionTimer !== undefined) { stopExpressions(); return; } expressionPlay.textContent = 'Ⅱ Pause examples'; expressionPlay.setAttribute('aria-pressed','true'); expressionTimer = setInterval(() => showExpression((expressionIndex + 1) % expressionExamples.length), 2600); });
document.querySelector('#next-expression').addEventListener('click', () => { stopExpressions(); showExpression((expressionIndex + 1) % expressionExamples.length); });
new IntersectionObserver(entries => { if (!entries[0].isIntersecting) stopExpressions(); }, {threshold:.1}).observe(document.querySelector('.data-example'));
pauseAnimations.push(stopExpressions);

// Start each diagram once as it enters view; respect reduced-motion preferences.
if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const animatedEntrances = new Map([
    [document.querySelector('#data-flow'), ['#data-flow .flow-play']],
    [document.querySelector('.data-example'), ['#play-expressions']]
  ]);
  const startOnView = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (entry.intersectionRatio < .3) continue;
      for (const selector of animatedEntrances.get(entry.target)) {
        const button = document.querySelector(selector);
        if (button.getAttribute('aria-pressed') !== 'true') button.click();
      }
      startOnView.unobserve(entry.target);
    }
  }, {threshold:.3});
  for (const target of animatedEntrances.keys()) startOnView.observe(target);
}

document.addEventListener('visibilitychange', () => { if (document.hidden) pauseAnimations.forEach(pause => pause()); });
