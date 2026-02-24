#!/usr/bin/env node
/**
 * build_questions.js
 * Reads docs/questions.js and generates:
 *   - docs/questions/*.html  (one self-contained HTML file per question)
 *   - docs/registry.js       (chapter metadata with question ID lists)
 */

const fs   = require('fs');
const path = require('path');

/* ── 1. Load question data ── */
const srcPath = path.join(__dirname, '..', 'docs', 'questions.js');
const code = fs.readFileSync(srcPath, 'utf8').replace('const chapters', 'var chapters');
eval(code);  // defines `chapters`

/* ── 2. Unicode → LaTeX conversion ── */
const CHAR_MAP = {
  // Greek letters
  'σ': '\\sigma',  'Σ': '\\Sigma',  'Ω': '\\Omega',  'ω': '\\omega',
  'ε': '\\varepsilon', 'ϵ': '\\epsilon',
  'κ': '\\kappa',  'θ': '\\theta',  'Θ': '\\Theta',
  'μ': '\\mu',     'ρ': '\\rho',    'ξ': '\\xi',
  'τ': '\\tau',    'λ': '\\lambda', 'Λ': '\\Lambda',
  'π': '\\pi',     'φ': '\\varphi', 'ψ': '\\psi',
  'α': '\\alpha',  'β': '\\beta',   'γ': '\\gamma',  'Γ': '\\Gamma',
  'δ': '\\delta',  'Δ': '\\Delta',  'χ': '\\chi',    'ν': '\\nu',
  'η': '\\eta',
  // Calligraphic / Blackboard
  '𝓕': '\\mathcal{F}', '𝓖': '\\mathcal{G}', '𝓗': '\\mathcal{H}',
  'ℬ': '\\mathcal{B}',
  'ℝ': '\\mathbb{R}',  'ℕ': '\\mathbb{N}',  'ℤ': '\\mathbb{Z}', 'ℚ': '\\mathbb{Q}',
  'ℰ': '\\mathcal{E}',
  // Relations / operators
  '∈': '\\in',     '∉': '\\notin',
  '⊂': '\\subset', '⊆': '\\subseteq', '⊃': '\\supset',
  '∅': '\\emptyset','∞': '\\infty',
  '∩': '\\cap',    '∪': '\\cup',
  '≥': '\\geq',    '≤': '\\leq',
  '≠': '\\neq',    '≈': '\\approx',
  '→': '\\to',     '←': '\\leftarrow',
  '⟺': '\\iff',   '⟹': '\\Rightarrow', '⇒': '\\Rightarrow',
  '×': '\\times',  '·': '\\cdot',
  '∂': '\\partial',
  '±': '\\pm',
  // Integrals / sums
  '∫': '\\int',    '∑': '\\sum',    '∏': '\\prod',
  // Fractions
  '½': '\\tfrac{1}{2}', '⅓': '\\tfrac{1}{3}', '⅔': '\\tfrac{2}{3}', '¼': '\\tfrac{1}{4}',
};

const SUBSCRIPTS = {
  'ₜ': '_t', 'ₛ': '_s', 'ₙ': '_n', 'ₖ': '_k',
  '₀': '_0', '₁': '_1', '₂': '_2', '₃': '_3',
  'ₐ': '_{\\alpha}', 'ₓ': '_x',
  '₊': '_+', '₋': '_-',
  'ᵢ': '_i', 'ⱼ': '_j',
};

const SUPERSCRIPTS = {
  '²': '^2', '³': '^3', '⁻': '^{-', '¹': '1}',
  'ᵗ': '^t', 'ⁿ': '^n',
};

function texify(text) {
  if (!text) return escapeHtml(text || '');

  // Pre-process: attach ASCII letter before subscript/superscript into the character
  // Xₜ → mark so both get pulled into math mode
  // We do this by inserting a zero-width joiner that our math detector sees
  let preproc = text;
  // Replace patterns like "Xₜ" → add letter to CHAR_MAP temporarily
  // Easier: convert letter+subscript/superscript to a placeholder that IS in the map
  // Actually simplest: just do regex pre-substitution for letter+sub/sup
  const subMap = {'ₜ':'_t','ₛ':'_s','ₙ':'_n','ₖ':'_k','₀':'_0','₁':'_1','₂':'_2','₃':'_3','ₐ':'_{\\\\alpha}','ₓ':'_x','₊':'_+','₋':'_-','ᵢ':'_i','ⱼ':'_j'};
  const supMap = {'²':'^2','³':'^3','ᵗ':'^t','ⁿ':'^n'};
  // Convert letter+subscript: Xₜ → §X_t§  (§ = placeholder for $)
  for (const [uc, lat] of Object.entries(subMap)) {
    preproc = preproc.replace(new RegExp('([A-Za-z])' + uc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      (_, letter) => '§' + letter + lat + '§');
  }
  for (const [uc, lat] of Object.entries(supMap)) {
    // letter or ) followed by superscript
    preproc = preproc.replace(new RegExp('([A-Za-z)])' + uc.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'),
      (_, letter) => '§' + letter + lat + '§');
  }

  // Use Array.from to properly handle surrogate pairs (𝓕, 𝓖, 𝓗 etc.)
  const chars = Array.from(preproc);

  const mathChars = new Set([
    ...Object.keys(CHAR_MAP),
    ...Object.keys(SUBSCRIPTS),
    ...Object.keys(SUPERSCRIPTS),
  ]);

  let result = '';
  let i = 0;
  while (i < chars.length) {
    if (chars[i] === '§') {
      // Already-converted math placeholder — collect until closing §
      i++; // skip opening §
      let math = '';
      while (i < chars.length && chars[i] !== '§') {
        math += chars[i];
        i++;
      }
      if (i < chars.length) i++; // skip closing §
      result += '$' + math + '$';
    } else if (mathChars.has(chars[i])) {
      // Start of a math region — accumulate
      let math = '';
      while (i < chars.length && chars[i] !== '§' && (mathChars.has(chars[i]) || isMathGlueArr(chars, i, mathChars))) {
        const ch = chars[i];
        if (CHAR_MAP[ch])       { math += CHAR_MAP[ch]; }
        else if (SUBSCRIPTS[ch]){ math += SUBSCRIPTS[ch]; }
        else if (SUPERSCRIPTS[ch]){ math += SUPERSCRIPTS[ch]; }
        else                    { math += ch; }
        i++;
      }
      result += '$' + math + '$';
    } else {
      result += escapeHtml(chars[i]);
      i++;
    }
  }

  // Merge adjacent inline $…$ blocks: $A$$B$ → $A\,B$
  result = result.replace(/\$\$/g, '\\,');

  // Clean up thin-space before subscripts/superscripts: \,_ → just _
  result = result.replace(/\\,([_^])/g, '$1');
  // Also \, at start of a block: $\,X → $X
  result = result.replace(/\$\\,/g, '$');

  return result;
}

/** Is chars[i] a "glue" character that continues a math region? */
function isMathGlueArr(chars, i, mathChars) {
  const ch = chars[i];
  if (!/[A-Za-z0-9()\[\]{},;:=+\-*/^_.|!<>' ⁻¹]/.test(ch)) return false;
  if (ch === ' ') {
    for (let j = i + 1; j < chars.length && j < i + 4; j++) {
      if (chars[j] !== ' ') return mathChars.has(chars[j]);
    }
    return false;
  }
  for (let j = i + 1; j < chars.length && j < i + 4; j++) {
    if (mathChars.has(chars[j])) return true;
  }
  return false;
}

function escapeHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ── 3. HTML template ── */
function questionHTML(q) {
  const id = q.id;
  const fileId = id.replace('.', '-');
  const type = q.type;
  const answer = q.answer;
  const tolerance = q.tolerance !== undefined ? q.tolerance : 0.01;

  const questionText = texify(q.question);

  let bodyContent = '';
  if (type === 'mc') {
    const opts = q.options.map((opt, idx) => {
      const letter = 'ABCDEF'[idx];
      return `      <button class="q-option" data-idx="${idx}"><span class="q-letter">${letter}</span><span>${texify(opt)}</span></button>`;
    }).join('\n');
    bodyContent = `    <div class="q-options">\n${opts}\n    </div>`;
  } else {
    bodyContent = `    <div class="q-numeric">
      <label>Your answer:</label>
      <input type="number" step="any" class="q-input">
      <button class="q-submit">Submit</button>
    </div>`;
  }

  const explText = texify(q.explanation);
  const issueTitle = encodeURIComponent(('Question ' + id + ': ' + q.question).slice(0, 120));
  const issueUrl = 'https://github.com/jeromevde/stochastics/issues/new?title=' + issueTitle;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css">
  <link rel="stylesheet" href="../question-frame.css">
</head>
<body>
  <div class="q-container" data-id="${id}" data-type="${type}" data-answer="${answer}"${type === 'numeric' ? ` data-tolerance="${tolerance}"` : ''}>
    <div class="q-text">${questionText}</div>
${bodyContent}
    <div class="q-explanation">${explText}</div>
    <a class="q-issue-btn" href="${issueUrl}" target="_blank" rel="noopener">&#9872; Report issue</a>
  </div>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/contrib/auto-render.min.js"
    onload="renderMathInElement(document.body,{delimiters:[{left:'$$',right:'$$',display:true},{left:'$',right:'$',display:false}],throwOnError:false})"></script>
  <script src="../question-frame.js"></script>
</body>
</html>
`;
}

/* ── 4. Generate files ── */
const outDir = path.join(__dirname, '..', 'docs', 'questions');
fs.mkdirSync(outDir, { recursive: true });

let count = 0;
const registry = [];

chapters.forEach(ch => {
  const qIds = [];
  ch.questions.forEach(q => {
    const filename = q.id.replace('.', '-') + '.html';
    fs.writeFileSync(path.join(outDir, filename), questionHTML(q));
    qIds.push(q.id);
    count++;
  });
  registry.push({ id: ch.id, title: ch.title, questions: qIds });
});

/* ── 5. Write registry.js ── */
const registryCode = 'const chapters = ' + JSON.stringify(registry, null, 2) + ';\n';
fs.writeFileSync(path.join(__dirname, '..', 'docs', 'registry.js'), registryCode);

console.log(`✓ Generated ${count} question HTML files in docs/questions/`);
console.log(`✓ Generated docs/registry.js with ${registry.length} chapters`);
