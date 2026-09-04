import type { ConstellationId } from "@/data/ielts-map";
import { upsertMyCards } from "@/lib/my-cards";

/** One fill-in-the-blank question lifted out of an answer key during ingest. */
export type CourseQuestion = {
  /** 1-based position in the test, matching the answer sheet. */
  n: number;
  stem: string;
  /** Letter -> option text. */
  options: Record<string, string>;
  /** Vietnamese explanation of the answer. */
  why: string;
  /** Vietnamese translation of the sentence. */
  vi: string;
  /**
   * Correct option letter, read off the green tick in the answer key during
   * ingest. Absent when the marker couldn't be tied to exactly one option.
   */
  answer?: string;
};

/** Keyed by `<lessonId>:<groupIndex>`, same id the answer sheet uses. */
export type QuestionBank = Record<string, CourseQuestion[]>;

export type LoadQuestionBank = () => Promise<QuestionBank>;

export type ReviewCard = {
  word: string;
  meaning: string;
  example?: string;
  scope: ConstellationId;
};

/**
 * A cloze card: the sentence with its blank on the front, the right option plus
 * the explanation on the back, the translation as the example.
 */
export function reviewCard(
  q: CourseQuestion,
  letter: string,
  scope: ConstellationId = "toeic",
): ReviewCard {
  const answer = q.options[letter];
  return {
    word: q.stem,
    meaning: answer ? `${letter}. ${answer} — ${q.why}` : q.why,
    scope,
    ...(q.vi ? { example: q.vi } : {}),
  };
}

/**
 * Cards for the questions missed on a graded worksheet.
 *
 * The correct letter is taken from `key` — what you typed in — rather than from
 * `q.answer`, because the answer sheet grades against your key and the card has
 * to agree with the score it just showed you.
 */
export function reviewCardsFor(
  questions: CourseQuestion[],
  wrong: number[],
  key: string[],
  scope: ConstellationId = "toeic",
): ReviewCard[] {
  const byNumber = new Map(questions.map((q) => [q.n, q]));
  const out: ReviewCard[] = [];

  for (const n of wrong) {
    const q = byNumber.get(n);
    const letter = key[n - 1];
    if (q && letter) out.push(reviewCard(q, letter, scope));
  }
  return out;
}

/**
 * Replaces rather than skips cards for questions already saved. The back of the
 * card names the letter from your key, so fixing a mistyped key and pressing the
 * button again has to repair the existing cards.
 */
export function saveReviewCards(cards: ReviewCard[]) {
  return upsertMyCards(cards);
}
