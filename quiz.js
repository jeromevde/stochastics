/* ── Quiz Runner ── */
(function () {
  const QUIZ_SIZE = 10;
  const SEEN_PREFIX = 'stoch_seen_';

  /* ── State ── */
  let questionIds = [];
  let currentIndex = 0;
  let score = 0;
  let answers = [];   // { id, correct }
  let chapterId = null;

  /* ── DOM ── */
  const $ = id => document.getElementById(id);
  const quizView    = $('quizView');
  const resultsView = $('resultsView');
  const iframe      = $('questionFrame');
  const progressBar = $('progressBar');
  const progressTxt = $('progressText');
  const scoreTxt    = $('scoreText');
  const nextBtn     = $('nextBtn');
  const retryBtn    = $('retryWrong');

  /* ── Init ── */
  function init() {
    const params = new URLSearchParams(location.search);
    chapterId = params.get('chapter');

    // Determine pool of question IDs
    let pool;
    if (chapterId && chapterId !== 'all') {
      const ch = chapters.find(c => c.id === parseInt(chapterId));
      pool = ch ? ch.questions : [];
      document.title = `${ch ? ch.title : 'Quiz'} — Stochastic Processes`;
    } else {
      pool = chapters.flatMap(c => c.questions);
      chapterId = 'all';
    }

    questionIds = pickQuestions(pool, chapterId);
    currentIndex = 0;
    score = 0;
    answers = [];

    nextBtn.addEventListener('click', nextQuestion);
    retryBtn.addEventListener('click', retryWrong);
    window.addEventListener('message', onMessage);

    loadQuestion();
  }

  /* ── Pick questions, prioritising unseen ── */
  function pickQuestions(pool, chId) {
    const seenKey = SEEN_PREFIX + chId;
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem(seenKey) || '[]'); } catch (_) {}

    const unseen = pool.filter(id => !seen.includes(id));
    const seenPool = pool.filter(id => seen.includes(id));

    // If everything has been seen, reset
    if (unseen.length === 0) {
      localStorage.removeItem(seenKey);
      return shuffle([...pool]).slice(0, Math.min(QUIZ_SIZE, pool.length));
    }

    let selected = shuffle([...unseen]).slice(0, QUIZ_SIZE);
    if (selected.length < QUIZ_SIZE) {
      const extra = shuffle([...seenPool]).slice(0, QUIZ_SIZE - selected.length);
      selected = [...selected, ...extra];
    }
    return shuffle(selected);
  }

  /* ── Load current question in iframe ── */
  function loadQuestion() {
    nextBtn.classList.add('hidden');
    const id = questionIds[currentIndex];
    const filename = id.replace('.', '-') + '.html';
    iframe.src = 'questions/' + filename;
    updateProgress();
  }

  /* ── Listen for postMessage from question iframe ── */
  function onMessage(e) {
    if (!e.data || typeof e.data !== 'object') return;

    if (e.data.type === 'answered') {
      const { id, correct } = e.data;
      if (correct) score++;
      answers.push({ id, correct });

      // Mark as seen
      markSeen(id);

      scoreTxt.textContent = `Score: ${score}`;
      nextBtn.textContent = currentIndex < questionIds.length - 1 ? 'Next →' : 'See Results';
      nextBtn.classList.remove('hidden');
    }

    if (e.data.type === 'resize') {
      iframe.style.height = e.data.height + 'px';
    }
  }

  /* ── Mark question as seen in localStorage ── */
  function markSeen(id) {
    const seenKey = SEEN_PREFIX + (chapterId || 'all');
    let seen = [];
    try { seen = JSON.parse(localStorage.getItem(seenKey) || '[]'); } catch (_) {}
    if (!seen.includes(id)) {
      seen.push(id);
      localStorage.setItem(seenKey, JSON.stringify(seen));
    }
  }

  /* ── Next question ── */
  function nextQuestion() {
    currentIndex++;
    if (currentIndex >= questionIds.length) {
      showResults();
    } else {
      loadQuestion();
    }
  }

  /* ── Progress bar ── */
  function updateProgress() {
    const total = questionIds.length;
    progressBar.style.width = `${(currentIndex / total) * 100}%`;
    progressTxt.textContent = `${currentIndex + 1} / ${total}`;
    scoreTxt.textContent = `Score: ${score}`;
  }

  /* ── Results ── */
  function showResults() {
    quizView.classList.remove('active');
    resultsView.classList.add('active');

    const total = questionIds.length;
    const pct = Math.round((score / total) * 100);
    $('resultsScore').textContent = `${score} / ${total}  (${pct}%)`;

    // Save best score
    saveBest(chapterId, score, total);

    // Breakdown by chapter
    const bd = $('resultsBreakdown');
    bd.innerHTML = '';
    const byChapter = {};
    answers.forEach(a => {
      const chNum = a.id.split('.')[0];
      if (!byChapter[chNum]) byChapter[chNum] = { correct: 0, total: 0 };
      byChapter[chNum].total++;
      if (a.correct) byChapter[chNum].correct++;
    });
    Object.keys(byChapter).sort((a, b) => +a - +b).forEach(chNum => {
      const ch = chapters.find(c => c.id === +chNum);
      const { correct, total } = byChapter[chNum];
      const row = document.createElement('div');
      row.className = 'row';
      row.innerHTML = `<span>${ch ? ch.title : 'Ch ' + chNum}</span><span>${correct}/${total}</span>`;
      bd.appendChild(row);
    });

    // Show/hide retry
    const wrongCount = answers.filter(a => !a.correct).length;
    retryBtn.classList.toggle('hidden', wrongCount === 0);
  }

  function saveBest(chId, score, total) {
    const key = 'stoch_best_' + chId;
    try {
      const prev = JSON.parse(localStorage.getItem(key) || '{}');
      const best = Math.max(prev.best || 0, score);
      localStorage.setItem(key, JSON.stringify({ best, total }));
    } catch (_) {}
  }

  /* ── Retry wrong answers ── */
  function retryWrong() {
    const wrongIds = answers.filter(a => !a.correct).map(a => a.id);
    questionIds = shuffle(wrongIds);
    currentIndex = 0;
    score = 0;
    answers = [];
    resultsView.classList.remove('active');
    quizView.classList.add('active');
    loadQuestion();
  }

  /* ── Helpers ── */
  function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  init();
})();
