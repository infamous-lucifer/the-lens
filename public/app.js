// ============================================================
//  THE LENS — Frontend Application
// ============================================================

const $ = (sel) => document.querySelector(sel);

// DOM refs
const input       = $('#question-input');
const charCount   = $('#char-count');
const analyzeBtn  = $('#analyze-btn');
const heroSection = $('.hero');
const resultsSection = $('#results-section');
const errorSection   = $('#error-section');
const errorMessage   = $('#error-message');
const cardsGrid      = $('#cards-grid');
const resultsQuestion = $('#results-question');
const shareAllBtn    = $('#share-all-btn');
const newQuestionBtn = $('#new-question-btn');
const retryBtn       = $('#retry-btn');
const toast          = $('#toast');

const MAX_CHARS = 300;
const WARN_THRESHOLD = 250;
let lastQuestion = '';

// ============================================================
//  Input Handling
// ============================================================

input.addEventListener('input', () => {
  const len = input.value.length;
  charCount.textContent = `${len} / ${MAX_CHARS}`;

  charCount.classList.remove('warning', 'danger');
  if (len >= MAX_CHARS) {
    charCount.classList.add('danger');
  } else if (len >= WARN_THRESHOLD) {
    charCount.classList.add('warning');
  }

  const trimmed = input.value.trim();
  const valid = trimmed.length >= 5 && trimmed.length <= MAX_CHARS;
  analyzeBtn.disabled = !valid;
  analyzeBtn.setAttribute('aria-disabled', String(!valid));
});

// Cmd/Ctrl + Enter to submit
input.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
    e.preventDefault();
    if (!analyzeBtn.disabled) analyze();
  }
});

analyzeBtn.addEventListener('click', analyze);
retryBtn.addEventListener('click', () => analyze(lastQuestion));
newQuestionBtn.addEventListener('click', resetToInput);

shareAllBtn.addEventListener('click', () => {
  const url = buildShareableURL(lastQuestion);
  copyToClipboard(url, 'Link copied — share it anywhere.');
});

// ============================================================
//  Core Analysis Flow
// ============================================================

async function analyze(questionOverride) {
  const question = typeof questionOverride === 'string' ? questionOverride : input.value.trim();
  if (!question || question.length < 5) return;

  lastQuestion = question;

  setLoadingState(true);
  showSection('loading');
  updateURL(question);

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong. Try again.');
    }

    if (data.error) {
      throw new Error(data.message || 'Try asking a genuine question.');
    }

    renderResults(question, data.results);
    showSection('results');

  } catch (err) {
    showError(err.message || 'Something went wrong. Try again.');
    showSection('error');
  } finally {
    setLoadingState(false);
  }
}

// ============================================================
//  Rendering
// ============================================================

function renderResults(question, results) {
  resultsQuestion.textContent = `"${question}"`;
  cardsGrid.innerHTML = '';

  results.forEach((school, index) => {
    const card = createCard(school, index);
    cardsGrid.appendChild(card);
  });
}

function createCard(school, index) {
  const article = document.createElement('article');
  article.className = 'philosophy-card';
  article.setAttribute('role', 'listitem');
  article.style.setProperty('--card-accent', school.accentColor);
  article.style.animationDelay = `${index * 60}ms`;

  // Card copy button SVG
  const copyIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`;

  article.innerHTML = `
    <div class="card-header">
      <div>
        <div class="card-school">${escapeHTML(school.name)}</div>
        <div class="card-origin">${escapeHTML(school.origin)}</div>
        <div class="card-philosopher">${escapeHTML(school.philosopher)}</div>
      </div>
      <button
        class="card-copy-btn"
        aria-label="Copy ${escapeHTML(school.name)} perspective"
        title="Copy this perspective"
      >${copyIcon}</button>
    </div>
    <p class="card-stance">${escapeHTML(school.stance)}</p>
    <p class="card-principle">${escapeHTML(school.principle)}</p>
  `;

  // Wire copy button
  const copyBtn = article.querySelector('.card-copy-btn');
  copyBtn.addEventListener('click', () => {
    const text = formatCardForCopy(school, lastQuestion);
    copyToClipboard(text, 'Copied to clipboard.');
    copyBtn.classList.add('copied');
    setTimeout(() => copyBtn.classList.remove('copied'), 2000);
  });

  return article;
}

function formatCardForCopy(school, question) {
  return `${school.name} (${school.origin})
On: "${question}"

${school.stance}

"${school.principle}"

— Analyzed by The Lens | thelens.vercel.app`;
}

// ============================================================
//  Skeleton Loaders
// ============================================================

function renderSkeletons() {
  cardsGrid.innerHTML = '';
  for (let i = 0; i < 10; i++) {
    const skeleton = document.createElement('div');
    skeleton.className = 'card-skeleton';
    skeleton.setAttribute('aria-hidden', 'true');
    skeleton.innerHTML = `
      <div class="skeleton-line short"></div>
      <div class="skeleton-line medium"></div>
      <div class="skeleton-line full"></div>
      <div class="skeleton-line long"></div>
      <div class="skeleton-line full"></div>
      <div class="skeleton-line medium"></div>
    `;
    cardsGrid.appendChild(skeleton);
  }
}

// ============================================================
//  UI State Management
// ============================================================

function showSection(state) {
  // Hide all
  heroSection.hidden = false;
  resultsSection.hidden = true;
  errorSection.hidden = true;

  if (state === 'loading') {
    heroSection.hidden = true;
    resultsSection.hidden = false;
    resultsQuestion.textContent = '...';
    renderSkeletons();
  } else if (state === 'results') {
    heroSection.hidden = true;
    resultsSection.hidden = false;
    errorSection.hidden = true;
  } else if (state === 'error') {
    heroSection.hidden = true;
    resultsSection.hidden = true;
    errorSection.hidden = false;
  } else {
    // 'home'
    heroSection.hidden = false;
    resultsSection.hidden = true;
    errorSection.hidden = true;
  }
}

function setLoadingState(isLoading) {
  analyzeBtn.classList.toggle('loading', isLoading);
  analyzeBtn.disabled = isLoading;
  input.disabled = isLoading;
}

function showError(msg) {
  errorMessage.textContent = msg;
}

function resetToInput() {
  input.value = '';
  charCount.textContent = '0 / 300';
  charCount.classList.remove('warning', 'danger');
  analyzeBtn.disabled = true;
  analyzeBtn.setAttribute('aria-disabled', 'true');
  clearURL();
  showSection('home');
  input.focus();
}

// ============================================================
//  Shareable URL
// ============================================================

function buildShareableURL(question) {
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set('q', question);
  return url.toString();
}

function updateURL(question) {
  const url = buildShareableURL(question);
  history.pushState({ question }, '', url);
}

function clearURL() {
  history.pushState({}, '', window.location.pathname);
}

function loadFromURL() {
  const params = new URLSearchParams(window.location.search);
  const q = params.get('q');
  if (q && q.trim().length >= 5 && q.trim().length <= 300) {
    input.value = q;
    charCount.textContent = `${q.length} / ${MAX_CHARS}`;
    analyzeBtn.disabled = false;
    analyzeBtn.setAttribute('aria-disabled', 'false');
    analyze(q.trim());
  }
}

// Handle browser back/forward
window.addEventListener('popstate', (e) => {
  if (e.state?.question) {
    analyze(e.state.question);
  } else {
    resetToInput();
  }
});

// ============================================================
//  Utilities
// ============================================================

function copyToClipboard(text, successMsg) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).then(() => showToast(successMsg));
  } else {
    // Fallback for older browsers
    const el = document.createElement('textarea');
    el.value = text;
    el.style.position = 'fixed';
    el.style.opacity = '0';
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    showToast(successMsg);
  }
}

function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.appendChild(document.createTextNode(str));
  return div.innerHTML;
}

// ============================================================
//  Init
// ============================================================

function init() {
  loadFromURL();

  // Focus input on desktop
  if (window.innerWidth > 768) {
    input.focus();
  }
}

init();
