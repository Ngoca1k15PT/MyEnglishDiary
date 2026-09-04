import { useCallback, useEffect, useState } from "react";
import type { QuizQuestion } from "@/data/lesson-types";
import { LETTERS } from "@/lib/course-exam";
import type { CourseQuestion, QuestionBank } from "@/lib/course-questions";

/**
 * Practising straight from the extracted questions, with no PDF and no key to
 * type: the correct option was read off the green tick in the answer key during
 * ingest, so only questions that carry one can be used here.
 */
export function toQuizQuestions(
  bank: QuestionBank,
  examIds: string[],
): { questions: QuizQuestion[]; byId: Map<string, CourseQuestion> } {
  const questions: QuizQuestion[] = [];
  const byId = new Map<string, CourseQuestion>();

  for (const examId of examIds) {
    for (const q of bank[examId] ?? []) {
      if (!q.answer) continue;
      const letters = LETTERS.filter((l) => q.options[l] !== undefined);
      const answer = letters.indexOf(q.answer as (typeof LETTERS)[number]);
      if (answer < 0) continue;

      const id = `${examId}#${q.n}`;
      questions.push({
        id,
        prompt: q.stem,
        speak: q.stem.replace(/_+/g, "blank"),
        options: letters.map((l) => q.options[l]!),
        answer,
        explain: [q.why, q.vi].filter(Boolean).join(" — "),
      });
      byId.set(id, q);
    }
  }
  return { questions, byId };
}

/* -------------------------------------------------- lịch sử luyện */

type PoolHistory = { lastSeen: string[]; wrong: string[] };
type Store = Record<string, PoolHistory>;

const KEY = "bdi-course-quiz";
const EMPTY: PoolHistory = { lastSeen: [], wrong: [] };

function load(): Store {
  if (typeof window === "undefined") return {};
  try {
    return (JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Store) ?? {};
  } catch {
    return {};
  }
}

/**
 * Kept separate from the star map's own quiz records. These sets exist so a
 * retry re-asks what you got wrong; the map's stars are lit by the timed answer
 * sheet, and folding untimed repeatable practice into that would inflate it.
 */
export function useQuizHistory() {
  const [store, setStore] = useState<Store>({});
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setStore(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(KEY, JSON.stringify(store));
  }, [store, hydrated]);

  const historyFor = useCallback((poolKey: string) => store[poolKey] ?? EMPTY, [store]);

  const record = useCallback((poolKey: string, seen: string[], wrong: string[]) => {
    setStore((s) => {
      const prev = s[poolKey] ?? EMPTY;
      // Answering correctly this time clears it from the retry list.
      const fixed = new Set(seen.filter((id) => !wrong.includes(id)));
      const nextWrong = [...new Set([...prev.wrong.filter((id) => !fixed.has(id)), ...wrong])];
      return { ...s, [poolKey]: { lastSeen: seen, wrong: nextWrong } };
    });
  }, []);

  return { hydrated, historyFor, record };
}
