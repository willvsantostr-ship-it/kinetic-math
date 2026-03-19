// =============================================
// Kinetic Math - Procedural Question Generator
// 10 Níveis × 50 Questões por Nível
// =============================================

export interface Question {
  id: number;
  category: string;
  level: string;
  question: string;
  options: string[];
  correctIndex: number;
  xpReward: number;
  explanation: string;
}

// --- Utility Helpers ---

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}

function multiLcm(nums: number[]): number {
  return nums.reduce((acc, n) => lcm(acc, n));
}

function multiGcd(nums: number[]): number {
  return nums.reduce((acc, n) => gcd(acc, n));
}

const PERFECT_SQUARES = [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144, 169, 196, 225, 256, 289, 324, 361, 400];
const PERFECT_CUBES = [8, 27, 64, 125, 216, 343, 512, 729, 1000];

/**
 * Build a multiple-choice question. Places the correct answer randomly among 3 distractors.
 */
function buildQuestion(
  id: number,
  category: string,
  levelLabel: string,
  questionText: string,
  correctAnswer: number | string,
  distractors: (number | string)[],
  xpReward: number,
  explanation: string,
): Question {
  const correct = String(correctAnswer);
  const wrongSet = new Set<string>();
  for (const d of distractors) {
    const s = String(d);
    if (s !== correct) wrongSet.add(s);
  }
  const wrongs = Array.from(wrongSet).slice(0, 3);

  // Ensure we have exactly 3 distractors
  while (wrongs.length < 3) {
    const fallback = String(Number(correct) + rand(1, 20) * (Math.random() > 0.5 ? 1 : -1));
    if (fallback !== correct && !wrongs.includes(fallback)) wrongs.push(fallback);
  }

  const labels = ['A', 'B', 'C', 'D'];
  const allAnswers = shuffle([correct, ...wrongs.slice(0, 3)]);
  const correctIndex = allAnswers.indexOf(correct);

  return {
    id,
    category,
    level: levelLabel,
    question: questionText,
    options: allAnswers.map((a, i) => `${labels[i]}) ${a}`),
    correctIndex,
    xpReward,
    explanation,
  };
}

// =============================================
// Level Generator Functions
// =============================================

// --- Level 1: Muito Básico ---
// Tabuada, adição/subtração simples, dobro/triplo
function genLevel1(id: number): Question {
  const xp = 15;
  const type = rand(1, 5);

  if (type === 1) {
    // Adição simples
    const a = rand(1, 20), b = rand(1, 20);
    const ans = a + b;
    return buildQuestion(id, 'aritmética', 'Muito Básico', `Quanto é ${a} + ${b}?`, ans,
      [ans + rand(1, 5), ans - rand(1, 5), ans + rand(2, 8)], xp,
      `${a} + ${b} = ${ans}.`);
  } else if (type === 2) {
    // Subtração simples
    const a = rand(10, 30), b = rand(1, a - 1);
    const ans = a - b;
    return buildQuestion(id, 'aritmética', 'Muito Básico', `Quanto é ${a} - ${b}?`, ans,
      [ans + rand(1, 5), ans - rand(1, 5), ans + rand(2, 10)], xp,
      `${a} - ${b} = ${ans}.`);
  } else if (type === 3) {
    // Tabuada
    const a = rand(2, 10), b = rand(2, 10);
    const ans = a * b;
    return buildQuestion(id, 'aritmética', 'Muito Básico', `Quanto é ${a} × ${b}?`, ans,
      [ans + rand(1, 10), ans - rand(1, 10), a * (b + 1)], xp,
      `${a} × ${b} = ${ans}.`);
  } else if (type === 4) {
    // Dobro
    const a = rand(2, 25);
    const ans = a * 2;
    return buildQuestion(id, 'aritmética', 'Muito Básico', `Qual é o dobro de ${a}?`, ans,
      [a * 3, a + 2, ans + rand(1, 5)], xp,
      `O dobro de ${a} é ${a} × 2 = ${ans}.`);
  } else {
    // Triplo
    const a = rand(2, 15);
    const ans = a * 3;
    return buildQuestion(id, 'aritmética', 'Muito Básico', `Qual é o triplo de ${a}?`, ans,
      [a * 2, a * 4, ans + rand(1, 5)], xp,
      `O triplo de ${a} é ${a} × 3 = ${ans}.`);
  }
}

// --- Level 2: Básico ---
// Multiplicação/divisão, par/ímpar, sequências
function genLevel2(id: number): Question {
  const xp = 20;
  const type = rand(1, 5);

  if (type === 1) {
    // Divisão exata
    const b = rand(2, 12), q = rand(2, 12);
    const a = b * q;
    return buildQuestion(id, 'aritmética', 'Básico', `Quanto é ${a} ÷ ${b}?`, q,
      [q + 1, q - 1, q + rand(2, 5)], xp,
      `${a} ÷ ${b} = ${q}, pois ${b} × ${q} = ${a}.`);
  } else if (type === 2) {
    // Completar sequência
    const start = rand(2, 10), step = rand(2, 5);
    const seq = [start, start + step, start + 2 * step, start + 3 * step];
    const ans = start + 4 * step;
    return buildQuestion(id, 'aritmética', 'Básico',
      `Qual o próximo número da sequência: ${seq.join(', ')}, ...?`, ans,
      [ans + step, ans - step, ans + rand(1, 3)], xp,
      `A sequência cresce de ${step} em ${step}. O próximo é ${seq[3]} + ${step} = ${ans}.`);
  } else if (type === 3) {
    // Multiplicação maior
    const a = rand(11, 25), b = rand(2, 9);
    const ans = a * b;
    return buildQuestion(id, 'aritmética', 'Básico', `Quanto é ${a} × ${b}?`, ans,
      [ans + b, ans - b, (a + 1) * b], xp,
      `${a} × ${b} = ${ans}.`);
  } else if (type === 4) {
    // Metade
    const a = rand(2, 50) * 2; // ensure even
    const ans = a / 2;
    return buildQuestion(id, 'aritmética', 'Básico', `Qual é a metade de ${a}?`, ans,
      [ans + rand(1, 5), ans - rand(1, 5), a / 4], xp,
      `A metade de ${a} é ${a} ÷ 2 = ${ans}.`);
  } else {
    // Soma de 3 números
    const a = rand(5, 20), b = rand(5, 20), c = rand(5, 20);
    const ans = a + b + c;
    return buildQuestion(id, 'aritmética', 'Básico', `Quanto é ${a} + ${b} + ${c}?`, ans,
      [ans + rand(1, 5), ans - rand(1, 5), ans + rand(3, 10)], xp,
      `${a} + ${b} + ${c} = ${ans}.`);
  }
}

// --- Level 3: Fácil ---
// MMC/MDC de 2 números pequenos, potências simples (²,³)
function genLevel3(id: number): Question {
  const xp = 25;
  const type = rand(1, 5);

  if (type === 1) {
    // MMC de 2 números pequenos
    const a = rand(2, 12), b = rand(2, 12);
    const ans = lcm(a, b);
    return buildQuestion(id, 'mmc-mdc', 'Fácil', `Qual é o MMC entre ${a} e ${b}?`, ans,
      [a * b, gcd(a, b), ans + rand(1, 10)], xp,
      `MMC(${a}, ${b}) = ${ans}.`);
  } else if (type === 2) {
    // MDC de 2 números pequenos
    const a = rand(4, 24), b = rand(4, 24);
    const ans = gcd(a, b);
    return buildQuestion(id, 'mmc-mdc', 'Fácil', `Qual é o MDC entre ${a} e ${b}?`, ans,
      [ans + 1, lcm(a, b), Math.max(1, ans - 1)], xp,
      `MDC(${a}, ${b}) = ${ans}.`);
  } else if (type === 3) {
    // Potência ao quadrado
    const base = rand(2, 12);
    const ans = base * base;
    return buildQuestion(id, 'potenciação', 'Fácil', `Quanto vale ${base}²?`, ans,
      [base * 2, base * base + base, (base + 1) * (base + 1)], xp,
      `${base}² = ${base} × ${base} = ${ans}.`);
  } else if (type === 4) {
    // Potência ao cubo
    const base = rand(2, 6);
    const ans = base ** 3;
    return buildQuestion(id, 'potenciação', 'Fácil', `Quanto vale ${base}³?`, ans,
      [base * 3, base ** 2, (base + 1) ** 3], xp,
      `${base}³ = ${base} × ${base} × ${base} = ${ans}.`);
  } else {
    // Raiz quadrada simples
    const root = rand(2, 10);
    const ans = root;
    const n = root * root;
    return buildQuestion(id, 'radiciação', 'Fácil', `Qual é a raiz quadrada de ${n}?`, ans,
      [ans + 1, ans - 1, ans + 2], xp,
      `√${n} = ${ans}, pois ${ans} × ${ans} = ${n}.`);
  }
}

// --- Level 4: Fácil-Médio ---
// MMC/MDC de números maiores, raiz de quadrados perfeitos maiores
function genLevel4(id: number): Question {
  const xp = 30;
  const type = rand(1, 5);

  if (type === 1) {
    // MMC de 2 números médios
    const a = rand(8, 30), b = rand(8, 30);
    const ans = lcm(a, b);
    return buildQuestion(id, 'mmc-mdc', 'Fácil-Médio', `Calcule o MMC entre ${a} e ${b}.`, ans,
      [a * b, gcd(a, b), ans + rand(1, 20)], xp,
      `MMC(${a}, ${b}) = ${ans}.`);
  } else if (type === 2) {
    // MDC de 2 números médios
    const factor = rand(2, 8);
    const a = factor * rand(2, 10), b = factor * rand(2, 10);
    const ans = gcd(a, b);
    return buildQuestion(id, 'mmc-mdc', 'Fácil-Médio', `Calcule o MDC entre ${a} e ${b}.`, ans,
      [factor, ans * 2, Math.max(1, ans - factor)], xp,
      `MDC(${a}, ${b}) = ${ans}.`);
  } else if (type === 3) {
    // Raiz quadrada de quadrados perfeitos maiores
    const root = rand(10, 20);
    const n = root * root;
    const ans = root;
    return buildQuestion(id, 'radiciação', 'Fácil-Médio', `Qual é a √${n}?`, ans,
      [ans + 1, ans - 1, ans + 2], xp,
      `√${n} = ${ans}, pois ${ans}² = ${n}.`);
  } else if (type === 4) {
    // Potência de 2
    const exp = rand(4, 8);
    const ans = 2 ** exp;
    return buildQuestion(id, 'potenciação', 'Fácil-Médio', `Quanto vale 2${superscript(exp)}?`, ans,
      [2 ** (exp - 1), 2 ** (exp + 1), 2 * exp], xp,
      `2${superscript(exp)} = ${ans}.`);
  } else {
    // Operação combinada simples
    const a = rand(2, 10), b = rand(2, 10), c = rand(1, 5);
    const ans = a * b + c;
    return buildQuestion(id, 'aritmética', 'Fácil-Médio', `Quanto é ${a} × ${b} + ${c}?`, ans,
      [a * (b + c), a * b - c, ans + rand(1, 5)], xp,
      `${a} × ${b} + ${c} = ${a * b} + ${c} = ${ans}.`);
  }
}

// --- Level 5: Médio ---
// MMC/MDC de 3 números, potenciação com bases maiores
function genLevel5(id: number): Question {
  const xp = 35;
  const type = rand(1, 5);

  if (type === 1) {
    // MMC de 3 números
    const a = rand(2, 15), b = rand(2, 15), c = rand(2, 15);
    const ans = multiLcm([a, b, c]);
    return buildQuestion(id, 'mmc-mdc', 'Médio', `Calcule o MMC entre ${a}, ${b} e ${c}.`, ans,
      [a * b * c, multiGcd([a, b, c]), ans + rand(5, 30)], xp,
      `MMC(${a}, ${b}, ${c}) = ${ans}.`);
  } else if (type === 2) {
    // MDC de 3 números
    const factor = rand(2, 6);
    const a = factor * rand(2, 8), b = factor * rand(2, 8), c = factor * rand(2, 8);
    const ans = multiGcd([a, b, c]);
    return buildQuestion(id, 'mmc-mdc', 'Médio', `Calcule o MDC entre ${a}, ${b} e ${c}.`, ans,
      [factor, ans + factor, multiLcm([a, b, c])], xp,
      `MDC(${a}, ${b}, ${c}) = ${ans}.`);
  } else if (type === 3) {
    // Potência com base maior
    const base = rand(3, 8), exp = rand(3, 4);
    const ans = base ** exp;
    return buildQuestion(id, 'potenciação', 'Médio', `Quanto vale ${base}${superscript(exp)}?`, ans,
      [base ** (exp - 1), base ** (exp + 1), base * exp], xp,
      `${base}${superscript(exp)} = ${ans}.`);
  } else if (type === 4) {
    // Expressão numérica simples
    const a = rand(2, 8), b = rand(2, 5);
    const sq = a ** 2;
    const ans = sq + b;
    return buildQuestion(id, 'expressões', 'Médio', `Quanto vale ${a}² + ${b}?`, ans,
      [a * 2 + b, sq - b, ans + rand(1, 10)], xp,
      `${a}² + ${b} = ${sq} + ${b} = ${ans}.`);
  } else {
    // Divisibilidade
    const divisor = rand(3, 9);
    const multiple = divisor * rand(5, 20);
    const wrong1 = multiple + rand(1, divisor - 1);
    const wrong2 = multiple - rand(1, divisor - 1);
    const wrong3 = multiple + divisor + rand(1, divisor - 1);
    return buildQuestion(id, 'aritmética', 'Médio',
      `Qual destes números é divisível por ${divisor}?`, multiple,
      [wrong1, wrong2, wrong3], xp,
      `${multiple} ÷ ${divisor} = ${multiple / divisor} (divisão exata).`);
  }
}

// --- Level 6: Médio-Difícil ---
// Propriedades de potências, radiciação, expressões numéricas
function genLevel6(id: number): Question {
  const xp = 40;
  const type = rand(1, 5);

  if (type === 1) {
    // Multiplicação de potências com mesma base: a^m × a^n = a^(m+n)
    const base = rand(2, 5), m = rand(2, 4), n = rand(2, 4);
    const ans = base ** (m + n);
    return buildQuestion(id, 'potenciação', 'Médio-Difícil',
      `Simplifique: ${base}${superscript(m)} × ${base}${superscript(n)}`, ans,
      [base ** m * base, base ** (m * n), base ** Math.abs(m - n)], xp,
      `${base}${superscript(m)} × ${base}${superscript(n)} = ${base}${superscript(m + n)} = ${ans}.`);
  } else if (type === 2) {
    // Divisão de potências: a^m ÷ a^n = a^(m-n)
    const base = rand(2, 5), m = rand(4, 7), n = rand(1, 3);
    const ans = base ** (m - n);
    return buildQuestion(id, 'potenciação', 'Médio-Difícil',
      `Simplifique: ${base}${superscript(m)} ÷ ${base}${superscript(n)}`, ans,
      [base ** m / base, base ** (m + n), base ** (m * n)], xp,
      `${base}${superscript(m)} ÷ ${base}${superscript(n)} = ${base}${superscript(m - n)} = ${ans}.`);
  } else if (type === 3) {
    // Expressão com parênteses
    const a = rand(2, 8), b = rand(1, 5), c = rand(2, 4);
    const ans = (a + b) * c;
    return buildQuestion(id, 'expressões', 'Médio-Difícil',
      `Quanto vale (${a} + ${b}) × ${c}?`, ans,
      [a + b * c, a * c + b, ans + rand(1, 10)], xp,
      `(${a} + ${b}) × ${c} = ${a + b} × ${c} = ${ans}.`);
  } else if (type === 4) {
    // √(a²) simplificação
    const a = rand(2, 15);
    const n = a * a;
    return buildQuestion(id, 'radiciação', 'Médio-Difícil',
      `Simplifique √(${a}²).`, a,
      [a * 2, a * a, a + 2], xp,
      `√(${a}²) = ${a}.`);
  } else {
    // MMC de números com fatores grandes
    const a = rand(10, 30), b = rand(10, 30);
    const ans = lcm(a, b);
    return buildQuestion(id, 'mmc-mdc', 'Médio-Difícil',
      `Calcule o MMC entre ${a} e ${b} usando decomposição.`, ans,
      [a * b, gcd(a, b), ans + rand(5, 20)], xp,
      `MMC(${a}, ${b}) = ${ans}.`);
  }
}

// --- Level 7: Difícil ---
// MMC/MDC de 3+ números grandes, expoentes negativos, frações
function genLevel7(id: number): Question {
  const xp = 50;
  const type = rand(1, 5);

  if (type === 1) {
    // MMC de 3 números maiores
    const a = rand(12, 36), b = rand(12, 36), c = rand(12, 36);
    const ans = multiLcm([a, b, c]);
    return buildQuestion(id, 'mmc-mdc', 'Difícil',
      `Calcule o MMC entre ${a}, ${b} e ${c}.`, ans,
      [multiGcd([a, b, c]), a * b, ans + rand(10, 50)], xp,
      `MMC(${a}, ${b}, ${c}) = ${ans}.`);
  } else if (type === 2) {
    // Expoente zero
    const base = rand(2, 100);
    return buildQuestion(id, 'potenciação', 'Difícil',
      `Quanto vale ${base}⁰?`, 1,
      [0, base, -1], xp,
      `Qualquer número (exceto 0) elevado a zero é igual a 1. ${base}⁰ = 1.`);
  } else if (type === 3) {
    // Potência de potência: (a^m)^n = a^(m×n)
    const base = rand(2, 4), m = rand(2, 3), n = rand(2, 3);
    const ans = base ** (m * n);
    return buildQuestion(id, 'potenciação', 'Difícil',
      `Simplifique: (${base}${superscript(m)})${superscript(n)}`, ans,
      [base ** (m + n), base ** m * n, base ** m + base ** n], xp,
      `(${base}${superscript(m)})${superscript(n)} = ${base}${superscript(m * n)} = ${ans}.`);
  } else if (type === 4) {
    // Expressão com potências
    const a = rand(2, 5), b = rand(2, 5);
    const ans = a ** 2 + b ** 2;
    return buildQuestion(id, 'expressões', 'Difícil',
      `Calcule: ${a}² + ${b}²`, ans,
      [(a + b) ** 2, a ** 2 * b ** 2, a * b * 2], xp,
      `${a}² + ${b}² = ${a ** 2} + ${b ** 2} = ${ans}.`);
  } else {
    // MDC de 3 números maiores
    const factor = rand(3, 12);
    const a = factor * rand(3, 10), b = factor * rand(3, 10), c = factor * rand(3, 10);
    const ans = multiGcd([a, b, c]);
    return buildQuestion(id, 'mmc-mdc', 'Difícil',
      `Calcule o MDC entre ${a}, ${b} e ${c}.`, ans,
      [factor * 2, ans + factor, multiLcm([a, b, c])], xp,
      `MDC(${a}, ${b}, ${c}) = ${ans}.`);
  }
}

// --- Level 8: Avançado ---
// Expressões com múltiplas operações, potência de potência, combinações
function genLevel8(id: number): Question {
  const xp = 60;
  const type = rand(1, 5);

  if (type === 1) {
    // (a^m)^n ÷ a^p
    const base = rand(2, 3), m = rand(2, 3), n = rand(2, 3), p = rand(1, 3);
    const totalExp = m * n - p;
    const ans = base ** totalExp;
    return buildQuestion(id, 'potenciação', 'Avançado',
      `Simplifique: (${base}${superscript(m)})${superscript(n)} ÷ ${base}${superscript(p)}`, ans,
      [base ** (m * n + p), base ** (m + n - p), base ** p], xp,
      `(${base}${superscript(m)})${superscript(n)} ÷ ${base}${superscript(p)} = ${base}${superscript(m * n)} ÷ ${base}${superscript(p)} = ${base}${superscript(totalExp)} = ${ans}.`);
  } else if (type === 2) {
    // Expressão com raiz e potência
    const a = rand(2, 8);
    const sq = a * a;
    const b = rand(1, 10);
    const ans = a + b;
    return buildQuestion(id, 'expressões', 'Avançado',
      `Calcule: √${sq} + ${b}`, ans,
      [sq + b, a * b, ans + rand(1, 5)], xp,
      `√${sq} + ${b} = ${a} + ${b} = ${ans}.`);
  } else if (type === 3) {
    // a^m × b^m = (a×b)^m
    const a = rand(2, 5), b = rand(2, 5), m = rand(2, 3);
    const ans = (a * b) ** m;
    return buildQuestion(id, 'potenciação', 'Avançado',
      `Calcule: ${a}${superscript(m)} × ${b}${superscript(m)}`, ans,
      [a ** m + b ** m, (a + b) ** m, a * b * m], xp,
      `${a}${superscript(m)} × ${b}${superscript(m)} = (${a} × ${b})${superscript(m)} = ${a * b}${superscript(m)} = ${ans}.`);
  } else if (type === 4) {
    // MMC de 4 números
    const a = rand(2, 12), b = rand(2, 12), c = rand(2, 12), d = rand(2, 12);
    const ans = multiLcm([a, b, c, d]);
    return buildQuestion(id, 'mmc-mdc', 'Avançado',
      `Calcule o MMC entre ${a}, ${b}, ${c} e ${d}.`, ans,
      [multiGcd([a, b, c, d]), a * b * c, ans + rand(10, 50)], xp,
      `MMC(${a}, ${b}, ${c}, ${d}) = ${ans}.`);
  } else {
    // Expressão combinada
    const a = rand(2, 6), b = rand(2, 6), c = rand(1, 5);
    const ans = a ** 2 - b * c;
    return buildQuestion(id, 'expressões', 'Avançado',
      `Calcule: ${a}² − ${b} × ${c}`, ans,
      [a * 2 - b * c, (a - b) * c, a ** 2 + b * c], xp,
      `${a}² − ${b} × ${c} = ${a ** 2} − ${b * c} = ${ans}.`);
  }
}

// --- Level 9: Muito Avançado ---
// Problemas contextualizados, simplificação de radicais
function genLevel9(id: number): Question {
  const xp = 75;
  const type = rand(1, 5);

  if (type === 1) {
    // Problema contextualizado MMC
    const a = rand(3, 12), b = rand(3, 12);
    const ans = lcm(a, b);
    return buildQuestion(id, 'mmc-mdc', 'Muito Avançado',
      `Dois ônibus passam no mesmo ponto: um a cada ${a} minutos e outro a cada ${b} minutos. Se passaram juntos agora, em quantos minutos passarão juntos novamente?`, ans,
      [a * b, a + b, gcd(a, b)], xp,
      `Precisamos do MMC(${a}, ${b}) = ${ans} minutos.`);
  } else if (type === 2) {
    // Problema contextualizado MDC
    const factor = rand(3, 8);
    const a = factor * rand(3, 8), b = factor * rand(3, 8);
    const ans = gcd(a, b);
    return buildQuestion(id, 'mmc-mdc', 'Muito Avançado',
      `Uma floricultura tem ${a} rosas e ${b} margaridas. Quer fazer buquês iguais, o maior possível. Quantas flores terá cada buquê?`, ans,
      [lcm(a, b), factor * 2, Math.max(1, ans - factor)], xp,
      `Precisamos do MDC(${a}, ${b}) = ${ans} flores por buquê.`);
  } else if (type === 3) {
    // Expressão com raiz e potência combinadas
    const a = rand(2, 5);
    const sq = a * a;
    const b = rand(2, 4);
    const ans = a * (b ** 2);
    return buildQuestion(id, 'expressões', 'Muito Avançado',
      `Calcule: √${sq} × ${b}²`, ans,
      [sq * b, a + b ** 2, (a * b) ** 2], xp,
      `√${sq} × ${b}² = ${a} × ${b ** 2} = ${ans}.`);
  } else if (type === 4) {
    // Potência fracionária conceito
    const base = rand(2, 6);
    const sq = base ** 2;
    return buildQuestion(id, 'potenciação', 'Muito Avançado',
      `Se ${base}² = ${sq}, quanto vale ${sq}^(1/2)?`, base,
      [sq / 2, base ** 2, base + 1], xp,
      `${sq}^(1/2) = √${sq} = ${base}.`);
  } else {
    // Expressão complexa
    const a = rand(2, 4), b = rand(2, 4), c = rand(2, 3);
    const ans = (a ** c + b ** c);
    return buildQuestion(id, 'expressões', 'Muito Avançado',
      `Calcule: ${a}${superscript(c)} + ${b}${superscript(c)}`, ans,
      [(a + b) ** c, a * b * c, a ** c * b ** c], xp,
      `${a}${superscript(c)} + ${b}${superscript(c)} = ${a ** c} + ${b ** c} = ${ans}.`);
  }
}

// --- Level 10: Expert ---
// Problemas de competição, combinação de todas as habilidades
function genLevel10(id: number): Question {
  const xp = 100;
  const type = rand(1, 5);

  if (type === 1) {
    // Problema combinado MMC + contexto
    const a = rand(4, 15), b = rand(4, 15), c = rand(4, 15);
    const ans = multiLcm([a, b, c]);
    return buildQuestion(id, 'mmc-mdc', 'Expert',
      `Três sinais luminosos piscam a cada ${a}s, ${b}s e ${c}s. Piscaram juntos agora. Depois de quantos segundos piscarão juntos de novo?`, ans,
      [a * b * c, multiGcd([a, b, c]), ans + rand(10, 50)], xp,
      `MMC(${a}, ${b}, ${c}) = ${ans} segundos.`);
  } else if (type === 2) {
    // Expressão de competição
    const a = rand(2, 4), m = rand(2, 4), n = rand(2, 3);
    const num = a ** (m * n);
    const den = a ** m;
    const ans = num / den;
    return buildQuestion(id, 'potenciação', 'Expert',
      `Simplifique: (${a}${superscript(m)})${superscript(n)} ÷ ${a}${superscript(m)}`, ans,
      [a ** (m + n), a ** n, a ** (m * n + m)], xp,
      `(${a}${superscript(m)})${superscript(n)} ÷ ${a}${superscript(m)} = ${a}${superscript(m * n)} ÷ ${a}${superscript(m)} = ${a}${superscript(m * n - m)} = ${ans}.`);
  } else if (type === 3) {
    // Multi-step problem
    const a = rand(2, 5), b = rand(2, 5);
    const left = a ** 3;
    const right = b ** 2;
    const ans = left - right;
    return buildQuestion(id, 'expressões', 'Expert',
      `Calcule: ${a}³ − ${b}²`, ans,
      [a * 3 - b * 2, (a - b) ** 2, left + right], xp,
      `${a}³ − ${b}² = ${left} − ${right} = ${ans}.`);
  } else if (type === 4) {
    // Problema envolvendo múltiplos e divisores
    const factor = rand(4, 12);
    const a = factor * rand(3, 8), b = factor * rand(3, 8), c = factor * rand(3, 8);
    const mdcVal = multiGcd([a, b, c]);
    const mmcVal = multiLcm([a, b, c]);
    const ans = mmcVal / mdcVal;
    return buildQuestion(id, 'mmc-mdc', 'Expert',
      `Sendo MMC(${a},${b},${c}) = ${mmcVal} e MDC(${a},${b},${c}) = ${mdcVal}, calcule MMC ÷ MDC.`, ans,
      [mmcVal + mdcVal, mmcVal * mdcVal, ans + rand(5, 30)], xp,
      `MMC ÷ MDC = ${mmcVal} ÷ ${mdcVal} = ${ans}.`);
  } else {
    // Expressão mista avançada
    const a = rand(2, 6), b = rand(2, 6);
    const sqA = a * a;
    const cubeB = b ** 3;
    const ans = sqA + cubeB;
    return buildQuestion(id, 'expressões', 'Expert',
      `Calcule: ${a}² + ${b}³`, ans,
      [(a + b) ** 2, a ** 2 * b ** 3, sqA * cubeB], xp,
      `${a}² + ${b}³ = ${sqA} + ${cubeB} = ${ans}.`);
  }
}

// --- Superscript Helper ---
function superscript(n: number): string {
  const map: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  };
  return String(n).split('').map(c => map[c] || c).join('');
}

// =============================================
// Main Export
// =============================================

const GENERATORS: Record<number, (id: number) => Question> = {
  1: genLevel1,
  2: genLevel2,
  3: genLevel3,
  4: genLevel4,
  5: genLevel5,
  6: genLevel6,
  7: genLevel7,
  8: genLevel8,
  9: genLevel9,
  10: genLevel10,
};

const LEVEL_NAMES: Record<number, string> = {
  1: 'Muito Básico',
  2: 'Básico',
  3: 'Fácil',
  4: 'Fácil-Médio',
  5: 'Médio',
  6: 'Médio-Difícil',
  7: 'Difícil',
  8: 'Avançado',
  9: 'Muito Avançado',
  10: 'Expert',
};

const LEVEL_DESCRIPTIONS: Record<number, string> = {
  1: 'Adição, subtração, tabuada, dobro e triplo',
  2: 'Multiplicação, divisão, sequências e metade',
  3: 'MMC/MDC simples e potências básicas (², ³)',
  4: 'MMC/MDC maiores, raízes e potências de 2',
  5: 'MMC/MDC de 3 números e expressões simples',
  6: 'Propriedades de potências e expressões',
  7: 'MMC/MDC avançado, expoente zero, potência de potência',
  8: 'Expressões combinadas e MMC de 4 números',
  9: 'Problemas contextualizados e radicais',
  10: 'Problemas de competição e combinações avançadas',
};

export function generateQuestionsForLevel(level: number): Question[] {
  const gen = GENERATORS[level];
  if (!gen) return [];
  const questions: Question[] = [];
  for (let i = 0; i < 50; i++) {
    questions.push(gen(i + 1));
  }
  return questions;
}

export function getLevelName(level: number): string {
  return LEVEL_NAMES[level] || `Nível ${level}`;
}

export function getLevelDescription(level: number): string {
  return LEVEL_DESCRIPTIONS[level] || '';
}

export function getXpPerLevel(level: number): number {
  return 10 + level * 5;
}
