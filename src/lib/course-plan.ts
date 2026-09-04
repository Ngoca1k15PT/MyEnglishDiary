import type { Course } from "@/data/course-types";
import { examTopic, type ExamAttempt, type TopicStat } from "@/lib/course-exam";

/** A miss rate below this isn't worth pulling you away from new material. */
const WEAK_TOPIC_RATE = 0.3;
/** Below this many questions the rate is noise. */
const MIN_TOPIC_SAMPLE = 10;

export type PlanAction =
  | {
      kind: "quiz";
      /** Why this is being suggested, in the user's terms. */
      reason: string;
      label: string;
      topic: string;
      examIds: string[];
    }
  | {
      kind: "exam";
      reason: string;
      label: string;
      lessonId: string;
      groupIndex: number;
      autoKey: boolean;
    }
  | { kind: "lesson"; reason: string; label: string; lessonId: string };

type ExamEntry = {
  examId: string;
  lessonId: string;
  groupIndex: number;
  title: string;
  sectionTitle: string;
  topic: string;
  questions: number;
  cards: number;
  autoKey: boolean;
};

/** Flattens the manifest down to the practice tests, which is what plans act on. */
export function examEntries(course: Course): ExamEntry[] {
  const out: ExamEntry[] = [];
  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      lesson.groups.forEach((group, groupIndex) => {
        if (!group.exam) return;
        out.push({
          examId: `${lesson.id}:${groupIndex}`,
          lessonId: lesson.id,
          groupIndex,
          title: lesson.title,
          sectionTitle: section.title,
          topic: examTopic(section.title, lesson.title),
          questions: group.exam.questions,
          cards: group.exam.cards ?? 0,
          autoKey: Boolean(group.exam.key),
        });
      });
    }
  }
  return out;
}

/**
 * Ranks what to do next, worst-understood first.
 *
 * Each suggestion carries the evidence for itself so it can be shown rather than
 * just asserted — a recommendation you can't sanity-check is one you learn to
 * ignore.
 */
export function planActions(
  course: Course,
  {
    topics,
    attempts,
    doneLessons,
  }: { topics: TopicStat[]; attempts: ExamAttempt[]; doneLessons: Set<string> },
): PlanAction[] {
  const exams = examEntries(course);
  const examsByTopic = new Map<string, ExamEntry[]>();
  for (const e of exams) {
    if (e.cards > 0) examsByTopic.set(e.topic, [...(examsByTopic.get(e.topic) ?? []), e]);
  }

  const actions: PlanAction[] = [];

  // 1. The topic you miss most, when there are questions to drill it with.
  const weak = topics.find(
    (t) =>
      t.rate >= WEAK_TOPIC_RATE &&
      t.questions >= MIN_TOPIC_SAMPLE &&
      (examsByTopic.get(t.topic)?.length ?? 0) > 0,
  );
  if (weak) {
    actions.push({
      kind: "quiz",
      reason: `Sai ${Math.round(weak.rate * 100)}% ở chủ đề này (${weak.wrong}/${weak.questions} câu)`,
      label: `Luyện 10 câu về ${weak.topic}`,
      topic: weak.topic,
      examIds: (examsByTopic.get(weak.topic) ?? []).map((e) => e.examId),
    });
  }

  // 2. The first test never graded, preferring one that needs no key typed.
  const graded = new Set(attempts.map((a) => a.examId));
  const untried = exams.filter((e) => !graded.has(e.examId));
  const nextExam = untried.find((e) => e.autoKey) ?? untried[0];
  if (nextExam) {
    actions.push({
      kind: "exam",
      reason: nextExam.autoKey
        ? `Chưa làm · ${nextExam.questions} câu, app tự chấm sẵn`
        : `Chưa làm · ${nextExam.questions} câu, cần nhập đáp án`,
      label: nextExam.title,
      lessonId: nextExam.lessonId,
      groupIndex: nextExam.groupIndex,
      autoKey: nextExam.autoKey,
    });
  }

  // 3. Otherwise just carry on down the course.
  const nextLesson = course.sections
    .flatMap((s) => s.lessons)
    .find((l) => !doneLessons.has(l.id) && l.id !== nextExam?.lessonId);
  if (nextLesson) {
    actions.push({
      kind: "lesson",
      reason: "Bài kế tiếp chưa đánh dấu đã học",
      label: nextLesson.title,
      lessonId: nextLesson.id,
    });
  }

  return actions;
}

/* -------------------------------------------------- bản rút gọn cho trang chủ */

const SUMMARY_KEY = "bdi-course-plan";

/**
 * The home page shouldn't pull in the whole course manifest for one line of
 * text, so the course page leaves behind just the headline. Only the course page
 * can change the data this is derived from, so it can't go stale behind your
 * back.
 */
export type PlanSummary = {
  label: string;
  reason: string;
  /** Deep link back into the reader, when the action points at a lesson. */
  lessonId?: string;
};

export function writePlanSummary(summary: PlanSummary | null) {
  if (typeof window === "undefined") return;
  const next = summary ? JSON.stringify(summary) : null;
  if (window.localStorage.getItem(SUMMARY_KEY) === next) return;
  if (next) window.localStorage.setItem(SUMMARY_KEY, next);
  else window.localStorage.removeItem(SUMMARY_KEY);
}

export function readPlanSummary(): PlanSummary | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SUMMARY_KEY);
    return raw ? (JSON.parse(raw) as PlanSummary) : null;
  } catch {
    return null;
  }
}
