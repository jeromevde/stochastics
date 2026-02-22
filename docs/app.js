/* ───── App State ───── */
let state = {
  currentQuestions: [],
  currentIndex: 0,
  score: 0,
  answers: [],          // { questionId, correct }
  chapterId: null,      // null = all
};

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

/* ───── DOM refs ───── */
const $ = (id) => document.getElementById(id);

const landing   = $('landing');
const quizView  = $('quiz');
const resultsView = $('results');
const chapterGrid = $('chapterGrid');

/* ───── Init ───── */
function init() {
  renderChapters();
  $('startAll').addEventListener('click', () => startQuiz(null));
  $('backBtn').addEventListener('click', goLanding);
  $('nextBtn').addEventListener('click', nextQuestion);
  $('numericSubmit').addEventListener('click', submitNumeric);
  $('numericInput').addEventListener('keydown', (e) => { if (e.key === 'Enter') submitNumeric(); });
  $('backToChapters').addEventListener('click', goLanding);
  $('retryWrong').addEventListener('click', retryWrong);

  // Restore progress from localStorage
  loadProgress();
}

/* ───── Progress persistence ───── */
function getProgressKey(chId) { return `sp_progress_${chId ?? 'all'}`; }

function loadProgress() {
  // Update chapter cards with stored best scores
  chapters.forEach(ch => {
    const saved = localStorage.getItem(getProgressKey(ch.id));
    if (saved) {
      const { best, total } = JSON.parse(saved);
      const card = document.querySelector(`[data-ch="${ch.id}"]`);
      if (card) {
        card.querySelector('.bar-fill').style.width = `${(best / total) * 100}%`;
        card.querySelector('.meta').textContent = `${ch.questions.length} questions · Best: ${best}/${total}`;
      }
    }
  });
}

function saveProgress(chId, score, total) {
  const key = getProgressKey(chId);
  const prev = localStorage.getItem(key);
  let best = score;
  if (prev) {
    const old = JSON.parse(prev);
    best = Math.max(old.best, score);
  }
  localStorage.setItem(key, JSON.stringify({ best, total }));
}

/* ───── Render chapter cards ───── */
function renderChapters() {
  chapterGrid.innerHTML = '';
  chapters.forEach(ch => {
    const saved = localStorage.getItem(getProgressKey(ch.id));
    let bestText = '';
    let pct = 0;
    if (saved) {
      const { best, total } = JSON.parse(saved);
      bestText = ` · Best: ${best}/${total}`;
      pct = (best / total) * 100;
    }
    const card = document.createElement('div');
    card.className = 'chapter-card';
    card.dataset.ch = ch.id;
    card.innerHTML = `
      <h3>${ch.title}</h3>
      <p class="meta">${ch.questions.length} questions${bestText}</p>
      <div class="bar-bg"><div class="bar-fill" style="width:${pct}%"></div></div>
    `;
    card.addEventListener('click', () => startQuiz(ch.id));
    chapterGrid.appendChild(card);
  });
}

/* ───── Navigation ───── */
function showView(view) {
  [landing, quizView, resultsView].forEach(v => v.classList.remove('active'));
  view.classList.add('active');
  window.scrollTo(0, 0);
}

function goLanding() {
  renderChapters();
  loadProgress();
  showView(landing);
}

/* ───── Start quiz ───── */
function startQuiz(chapterId) {
  state.chapterId = chapterId;
  if (chapterId === null) {
    state.currentQuestions = chapters.flatMap(ch => ch.questions);
  } else {
    const ch = chapters.find(c => c.id === chapterId);
    state.currentQuestions = ch ? [...ch.questions] : [];
  }
  // shuffle
  shuffle(state.currentQuestions);
  state.currentIndex = 0;
  state.score = 0;
  state.answers = [];
  showView(quizView);
  renderQuestion();
}

function startQuizWithQuestions(questions, chapterId) {
  state.chapterId = chapterId;
  state.currentQuestions = questions;
  shuffle(state.currentQuestions);
  state.currentIndex = 0;
  state.score = 0;
  state.answers = [];
  showView(quizView);
  renderQuestion();
}

/* ───── Render question ───── */
function renderQuestion() {
  const q = state.currentQuestions[state.currentIndex];
  const total = state.currentQuestions.length;

  // Progress
  $('progressBar').style.width = `${((state.currentIndex) / total) * 100}%`;
  $('progressText').textContent = `${state.currentIndex + 1} / ${total}`;
  $('scoreText').textContent = `Score: ${state.score}`;

  // Badge & text
  $('qBadge').textContent = `Q ${q.id}`;
  $('qText').textContent = q.question;

  // Reset UI
  $('explanationWrap').classList.add('hidden');
  $('explanationWrap').className = 'explanation hidden';
  $('nextBtn').classList.add('hidden');
  $('optionsWrap').innerHTML = '';
  $('optionsWrap').classList.remove('hidden');
  $('numericWrap').classList.add('hidden');
  $('numericInput').value = '';

  if (q.type === 'mc') {
    $('numericWrap').classList.add('hidden');
    $('optionsWrap').classList.remove('hidden');
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'option-btn';
      btn.innerHTML = `<span class="letter">${LETTERS[i]}</span><span>${opt}</span>`;
      btn.addEventListener('click', () => selectOption(i));
      $('optionsWrap').appendChild(btn);
    });
  } else {
    $('optionsWrap').classList.add('hidden');
    $('numericWrap').classList.remove('hidden');
    setTimeout(() => $('numericInput').focus(), 100);
  }

  // Render math
  renderMathInElement(document.getElementById('questionCard'), {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false }
    ],
    throwOnError: false
  });
}

/* ───── MC answer ───── */
function selectOption(idx) {
  const q = state.currentQuestions[state.currentIndex];
  const buttons = $('optionsWrap').querySelectorAll('.option-btn');
  const isCorrect = idx === q.answer;

  buttons.forEach((btn, i) => {
    btn.classList.add('disabled');
    if (i === q.answer) btn.classList.add('correct');
    if (i === idx && !isCorrect) btn.classList.add('wrong');
    if (i !== q.answer && i !== idx) btn.classList.add('dimmed');
  });

  recordAnswer(q, isCorrect);
}

/* ───── Numeric answer ───── */
function submitNumeric() {
  const q = state.currentQuestions[state.currentIndex];
  const val = parseFloat($('numericInput').value);
  if (isNaN(val)) return;

  const tol = q.tolerance ?? 0.01;
  const isCorrect = Math.abs(val - q.answer) <= tol;

  $('numericInput').disabled = true;
  $('numericSubmit').classList.add('hidden');

  recordAnswer(q, isCorrect);
}

/* ───── Record & show explanation ───── */
function recordAnswer(q, isCorrect) {
  if (isCorrect) state.score++;
  state.answers.push({ questionId: q.id, correct: isCorrect });

  // Explanation
  const wrap = $('explanationWrap');
  const header = $('explanationHeader');
  wrap.classList.remove('hidden', 'correct-expl', 'wrong-expl');
  header.classList.remove('correct-hdr', 'wrong-hdr');

  if (isCorrect) {
    wrap.classList.add('correct-expl');
    header.classList.add('correct-hdr');
    header.textContent = '✓ Correct!';
  } else {
    wrap.classList.add('wrong-expl');
    header.classList.add('wrong-hdr');
    if (q.type === 'numeric') {
      header.textContent = `✗ Incorrect — the answer is ${q.answer}`;
    } else {
      header.textContent = `✗ Incorrect — the answer is ${LETTERS[q.answer]}`;
    }
  }
  $('explanationText').textContent = q.explanation;
  $('scoreText').textContent = `Score: ${state.score}`;

  // Render math in explanation
  renderMathInElement(wrap, {
    delimiters: [
      { left: '$$', right: '$$', display: true },
      { left: '$', right: '$', display: false }
    ],
    throwOnError: false
  });

  $('nextBtn').classList.remove('hidden');
  $('nextBtn').textContent = state.currentIndex < state.currentQuestions.length - 1 ? 'Next →' : 'See Results';
}

/* ───── Next ───── */
function nextQuestion() {
  state.currentIndex++;
  if (state.currentIndex >= state.currentQuestions.length) {
    showResults();
  } else {
    renderQuestion();
  }
}

/* ───── Results ───── */
function showResults() {
  const total = state.currentQuestions.length;
  const pct = Math.round((state.score / total) * 100);
  $('resultsScore').textContent = `${state.score} / ${total} (${pct}%)`;

  // Save
  saveProgress(state.chapterId, state.score, total);

  // Breakdown by chapter
  const breakdown = $('resultsBreakdown');
  breakdown.innerHTML = '';
  const byChapter = {};
  state.answers.forEach(a => {
    const chId = a.questionId.split('.')[0];
    if (!byChapter[chId]) byChapter[chId] = { correct: 0, total: 0 };
    byChapter[chId].total++;
    if (a.correct) byChapter[chId].correct++;
  });
  Object.keys(byChapter).sort((a, b) => +a - +b).forEach(chId => {
    const ch = chapters.find(c => c.id === +chId);
    const { correct, total } = byChapter[chId];
    const row = document.createElement('div');
    row.className = 'row';
    row.innerHTML = `<span>${ch ? ch.title : 'Ch ' + chId}</span><span>${correct}/${total}</span>`;
    breakdown.appendChild(row);
  });

  // Show/hide retry button
  const wrongCount = state.answers.filter(a => !a.correct).length;
  $('retryWrong').classList.toggle('hidden', wrongCount === 0);

  showView(resultsView);
}

/* ───── Retry wrong ───── */
function retryWrong() {
  const wrongIds = new Set(state.answers.filter(a => !a.correct).map(a => a.questionId));
  const allQ = chapters.flatMap(ch => ch.questions);
  const wrongQ = allQ.filter(q => wrongIds.has(q.id));
  startQuizWithQuestions(wrongQ, state.chapterId);
}

/* ───── Helpers ───── */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

/* ───── Boot ───── */
document.addEventListener('DOMContentLoaded', init);
