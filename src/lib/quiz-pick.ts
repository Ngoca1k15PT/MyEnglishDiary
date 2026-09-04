import type { QuizQuestion } from "@/data/lesson-types";

/** Mỗi bài test ra đúng 10 câu. */
export const QUIZ_SIZE = 10;
/** Kho câu hỏi tối thiểu để lần làm lại gặp câu khác. */
export const MIN_POOL = 12;

export type QuizHistory = {
  /** id các câu đã gặp ở lần làm gần nhất */
  lastSeen?: string[];
  /** id các câu từng làm sai */
  wrong?: string[];
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Xáo trộn 4 phương án và cập nhật lại chỉ số đáp án đúng. */
function shuffleOptions(q: QuizQuestion): QuizQuestion {
  const idx = shuffle(q.options.map((_, i) => i));
  return {
    ...q,
    options: idx.map((i) => q.options[i]!),
    answer: idx.indexOf(q.answer),
  };
}

/**
 * Rút 10 câu từ kho của một chủ đề.
 * Ưu tiên: câu từng làm sai → câu chưa gặp lần trước → còn lại.
 */
export function pickQuestions(
  nodeId: string,
  pool: QuizQuestion[],
  history: QuizHistory = {},
): QuizQuestion[] {
  if (pool.length === 0) return [];
  if (pool.length < MIN_POOL) {
    console.warn(
      `[quiz] Kho câu hỏi của "${nodeId}" chỉ có ${pool.length} câu (< ${MIN_POOL}). Cần bổ sung để lần làm lại không lặp câu cũ.`,
    );
  }

  const seen = new Set(history.lastSeen ?? []);
  const wrong = new Set(history.wrong ?? []);

  const wrongOnes = shuffle(pool.filter((q) => wrong.has(q.id)));
  const fresh = shuffle(pool.filter((q) => !wrong.has(q.id) && !seen.has(q.id)));
  const rest = shuffle(pool.filter((q) => !wrong.has(q.id) && seen.has(q.id)));

  const picked = [...wrongOnes, ...fresh, ...rest].slice(0, Math.min(QUIZ_SIZE, pool.length));
  return shuffle(picked).map(shuffleOptions);
}
