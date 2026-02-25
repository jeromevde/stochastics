/* ── Shared logic for every self-contained question page ── */
document.addEventListener('DOMContentLoaded', () => {
  const container = document.querySelector('.q-container');
  if (!container) return;

  const qId        = container.dataset.id;
  const qType      = container.dataset.type;           // "mc" | "numeric"
  const correctIdx = qType === 'mc' ? parseInt(container.dataset.answer) : null;
  const numAnswer  = qType === 'numeric' ? parseFloat(container.dataset.answer) : null;
  const tolerance  = parseFloat(container.dataset.tolerance || '0.01');
  let answered     = false;

  /* ── KaTeX auto-render (fires once script loads) ── */
  function renderMath() {
    if (!window.renderMathInElement) return false;
    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$',  right: '$',  display: false }
      ],
      throwOnError: false
    });
    return true;
  }
  // The auto-render script has an onload that calls renderMathInElement,
  // but we also trigger it here for safety.
  let mathTries = 0;
  const mathRetry = setInterval(() => {
    mathTries++;
    if (renderMath() || mathTries > 50) clearInterval(mathRetry);
  }, 100);
  window.addEventListener('load', () => { if (renderMath()) clearInterval(mathRetry); });

  /* ── MC click handler ── */
  document.querySelectorAll('.q-option').forEach(btn => {
    btn.addEventListener('click', () => {
      if (answered) return;
      answered = true;
      const idx = parseInt(btn.dataset.idx);
      const correct = idx === correctIdx;
      // Mark all buttons
      document.querySelectorAll('.q-option').forEach(b => {
        b.classList.add('disabled');
        if (parseInt(b.dataset.idx) === correctIdx) b.classList.add('correct');
        if (parseInt(b.dataset.idx) === idx && !correct) b.classList.add('wrong');
        if (parseInt(b.dataset.idx) !== correctIdx && parseInt(b.dataset.idx) !== idx) b.classList.add('dimmed');
      });
      showResult(correct);
    });
  });

  /* ── Numeric submit ── */
  const submitBtn = document.querySelector('.q-submit');
  const numInput  = document.querySelector('.q-input');
  if (submitBtn) {
    submitBtn.addEventListener('click', handleNumeric);
  }
  if (numInput) {
    numInput.addEventListener('keydown', e => { if (e.key === 'Enter') handleNumeric(); });
  }

  function handleNumeric() {
    if (answered) return;
    const val = parseFloat(numInput.value);
    if (isNaN(val)) return;
    answered = true;
    const correct = Math.abs(val - numAnswer) <= tolerance;
    numInput.disabled = true;
    if (submitBtn) submitBtn.style.display = 'none';
    showResult(correct);
  }

  /* ── Show explanation + notify parent ── */
  function showResult(correct) {
    const expl = document.querySelector('.q-explanation');
    expl.classList.add('visible', correct ? 'correct' : 'wrong');

    // Insert result header
    const header = document.createElement('div');
    header.className = 'q-result-header ' + (correct ? 'correct' : 'wrong');
    if (correct) {
      header.textContent = '✓ Correct!';
    } else if (qType === 'numeric') {
      header.textContent = `✗ Incorrect — the answer is ${numAnswer}`;
    } else {
      header.textContent = `✗ Incorrect — the answer is ${'ABCDEF'[correctIdx]}`;
    }
    expl.insertBefore(header, expl.firstChild);

    // Re-render KaTeX inside explanation
    renderMath();

    // Notify parent frame
    try {
      window.parent.postMessage({ type: 'answered', id: qId, correct: correct }, '*');
    } catch (_) { /* standalone mode */ }

    // Report height so parent can resize iframe
    reportHeight();
  }

  /* ── Report content height to parent ── */
  let lastReportedHeight = 0;
  let heightTimer = null;

  function reportHeight() {
    const h = document.documentElement.scrollHeight;
    if (h === lastReportedHeight) return;   // no change — skip
    lastReportedHeight = h;
    try {
      window.parent.postMessage({ type: 'resize', height: h }, '*');
    } catch (_) {}
  }

  function debouncedReportHeight() {
    if (heightTimer) clearTimeout(heightTimer);
    heightTimer = setTimeout(reportHeight, 100);
  }

  // Report height on load and on resize
  window.addEventListener('load', () => setTimeout(reportHeight, 200));
  window.addEventListener('resize', debouncedReportHeight);

  // Observe DOM changes (KaTeX rendering) but debounce + auto-disconnect
  const observer = new MutationObserver(debouncedReportHeight);
  observer.observe(document.body, { childList: true, subtree: true });
  // Stop observing after 5 seconds — KaTeX will have finished by then
  setTimeout(() => { observer.disconnect(); reportHeight(); }, 5000);

  /* ── Build issue link dynamically ── */
  const issueBtn = document.querySelector('.q-issue-btn');
  if (issueBtn && !issueBtn.href) {
    const qText = document.querySelector('.q-text')?.textContent || '';
    const title = encodeURIComponent(`Question ${qId}: ${qText}`);
    issueBtn.href = `https://github.com/jeromevde/stochastics/issues/new?title=${title}`;
  }
});
