/**
 * Shape of the manifests under `src/data/courses/*.json`, produced by
 * `scripts/ingest-course.mjs`. Keep this file in sync with that script.
 */

/** `question`/`answer` drive the "hide the key until asked" behaviour in the reader. */
export type CourseItemKind = "theory" | "question" | "answer" | "audio" | "image" | "other";

export type CourseItem = {
  kind: CourseItemKind;
  label: string;
  /** Path relative to `Course.base`. */
  src: string;
  bytes: number;
};

/**
 * Shape of a practice test, read off the worksheet during ingest. Which option
 * is correct is not included: these PDFs mark it with raster images, so the key
 * is entered once by hand instead of guessed.
 */
export type CourseExam = {
  questions: number;
  /** 3 for TOEIC Part 2, 4 everywhere else. */
  options: number;
  /** Time limit printed on the worksheet, when it states one. */
  seconds?: number;
  /**
   * How many questions were extracted from the answer key well enough to become
   * review cards. Absent when the key wasn't machine-readable.
   */
  cards?: number;
  /**
   * Correct answers as one string, index 0 being question 1, recovered from the
   * ticks in the answer key. Only present when every position was read, since a
   * key with a hole would shift everything after it.
   */
  key?: string;
};

/** A sub-exercise inside a lesson (BT1, 3.1.Unit 1…). `title` is null for the lesson root. */
export type CourseGroup = {
  title: string | null;
  items: CourseItem[];
  exam?: CourseExam;
};

export type CourseLesson = {
  /** `<sectionId>/<lessonSlug>` — stable across re-ingests, used for progress + deep links. */
  id: string;
  slug: string;
  title: string;
  order: string | null;
  groups: CourseGroup[];
};

export type CourseSection = {
  id: string;
  title: string;
  order: string | null;
  lessons: CourseLesson[];
};

export type CourseStats = {
  sections: number;
  lessons: number;
  docs: number;
  audios: number;
  bytes: number;
  /** Groups that got a detected question count. */
  exams: number;
};

export type Course = {
  id: string;
  title: string;
  base: string;
  generatedAt: string;
  stats: CourseStats;
  sections: CourseSection[];
};
