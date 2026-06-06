export type Operation = "plus" | "min" | "keer" | "deel";

export const OPERATIONS: Operation[] = ["plus", "min", "keer", "deel"];

export const OPERATION_LABELS: Record<Operation, string> = {
  plus: "Plus",
  min: "Min",
  keer: "Keer",
  deel: "Deel",
};

export const OPERATION_SYMBOLS: Record<Operation, string> = {
  plus: "+",
  min: "−",
  keer: "×",
  deel: "÷",
};

export type Question = {
  question: string;
  answer: number;
  options: number[];
  operation: Operation;
};

export function getTimeLimit(grade: number): number {
  switch (grade) {
    case 4:
      return 5000;
    case 5:
      return 4000;
    case 6:
      return 3000;
    case 7:
      return 2000;
    case 8:
      return 1500;
    default:
      return 5000;
  }
}

// Approx number of questions for ~10 minutes given grade speed.
export function getSessionLength(grade: number): number {
  switch (grade) {
    case 4:
      return 40;
    case 5:
      return 45;
    case 6:
      return 50;
    case 7:
      return 55;
    case 8:
      return 60;
    default:
      return 40;
  }
}

function rnd(max: number): number {
  // inclusive 0..max
  return Math.floor(Math.random() * (max + 1));
}

export function generateWrongOptions(
  answer: number,
  operation: Operation
): number[] {
  const options = new Set<number>();
  const maxRange = operation === "keer" ? 100 : operation === "deel" ? 10 : 20;
  let guard = 0;
  while (options.size < 3 && guard < 100) {
    guard++;
    const delta = (Math.floor(Math.random() * 5) + 1) * (Math.random() < 0.5 ? -1 : 1);
    const candidate = answer + delta;
    if (candidate < 0 || candidate > maxRange || candidate === answer) continue;
    options.add(candidate);
  }
  // fallback fill if not enough distinct options
  let fill = 0;
  while (options.size < 3) {
    if (fill !== answer && fill >= 0) options.add(fill);
    fill++;
  }
  return Array.from(options);
}

export function generateQuestion(
  operation: Operation,
  _grade: number
): Question {
  let a = rnd(10);
  let b = rnd(10);
  let answer: number;

  switch (operation) {
    case "plus":
      answer = a + b;
      break;
    case "min":
      // ensure non-negative result
      if (b > a) [a, b] = [b, a];
      answer = a - b;
      break;
    case "keer":
      answer = a * b;
      break;
    case "deel":
      // build a clean division: a*b / b = a
      if (b === 0) b = 1;
      {
        const product = a * b;
        answer = a;
        const q = `${product} ${OPERATION_SYMBOLS.deel} ${b} = ?`;
        const options = shuffle([answer, ...generateWrongOptions(answer, operation)]);
        return { question: q, answer, options, operation };
      }
    default:
      answer = a + b;
  }

  const question = `${a} ${OPERATION_SYMBOLS[operation]} ${b} = ?`;
  const options = shuffle([answer, ...generateWrongOptions(answer, operation)]);
  return { question, answer, options, operation };
}

export function unlockedOperations(current: string): Operation[] {
  const idx = OPERATIONS.indexOf(current as Operation);
  if (idx === -1) return [OPERATIONS[0]];
  return OPERATIONS.slice(0, idx + 1);
}

export function nextOperation(current: string): Operation | null {
  const idx = OPERATIONS.indexOf(current as Operation);
  if (idx === -1 || idx >= OPERATIONS.length - 1) return null;
  return OPERATIONS[idx + 1];
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
