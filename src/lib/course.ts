import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  Course,
  CourseGroup,
  CourseItem,
  CourseItemKind,
  CourseLesson,
  CourseSection,
} from "@/data/course-types";
import { dayKey } from "@/lib/srs";

/**
 * Media is served from `public/course/<id>` when it exists on the machine, and
 * from VITE_COURSE_BASE otherwise. That single fallback covers three cases with
 * no configuration: local dev after an ingest reads from disk (fast, offline), a
 * deployed build reads from the CDN (the media is gitignored), and a fresh clone
 * works before anyone runs the ingest.
 */
const REMOTE_BASE = import.meta.env["VITE_COURSE_BASE"] as string | undefined;

export type CourseSourceState = "checking" | "local" | "remote" | "missing";

export type CourseSource = {
  /** null while checking, or when no source has the media. */
  base: string | null;
  state: CourseSourceState;
};

function remoteBaseFor(course: Course) {
  return REMOTE_BASE ? `${REMOTE_BASE.replace(/\/+$/, "")}/${course.id}` : null;
}

/**
 * The SSR catch-all answers unknown paths with an HTML page, so a 200 alone
 * doesn't prove the file is there — the content type has to be checked too.
 */
async function hasFile(url: string) {
  try {
    const r = await fetch(url, { method: "HEAD" });
    return r.ok && !(r.headers.get("content-type") ?? "").includes("text/html");
  } catch {
    return false;
  }
}

export function useCourseSource(course: Course): CourseSource {
  const sample = course.sections[0]?.lessons[0]?.groups[0]?.items[0]?.src;
  const [source, setSource] = useState<CourseSource>({ base: null, state: "checking" });

  useEffect(() => {
    if (!sample) {
      setSource({ base: course.base, state: "local" });
      return;
    }
    let alive = true;

    void (async () => {
      if (await hasFile(`${course.base}/${sample}`)) {
        if (alive) setSource({ base: course.base, state: "local" });
        return;
      }
      const remote = remoteBaseFor(course);
      if (remote && (await hasFile(`${remote}/${sample}`))) {
        if (alive) setSource({ base: remote, state: "remote" });
        return;
      }
      if (alive) setSource({ base: null, state: "missing" });
    })();

    return () => {
      alive = false;
    };
  }, [course, sample]);

  return source;
}

export const KIND_LABEL: Record<CourseItemKind, string> = {
  theory: "Tài liệu",
  question: "Đề bài",
  answer: "Đáp án",
  audio: "File nghe",
  image: "Hình ảnh",
  other: "Khác",
};

/** Vietnamese-aware fold so "de bai" matches "Đề bài". */
function fold(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}

export type FlatLesson = {
  lesson: CourseLesson;
  section: CourseSection;
  index: number;
};

export function flattenLessons(course: Course): FlatLesson[] {
  const out: FlatLesson[] = [];
  for (const section of course.sections) {
    for (const lesson of section.lessons) {
      out.push({ lesson, section, index: out.length });
    }
  }
  return out;
}

export function searchLessons(flat: FlatLesson[], query: string) {
  const q = fold(query.trim());
  if (!q) return flat;
  const words = q.split(/\s+/);
  return flat.filter((f) => {
    const hay = fold(
      [
        f.section.title,
        f.lesson.order ?? "",
        f.lesson.title,
        ...f.lesson.groups.map((g) => g.title ?? ""),
      ].join(" "),
    );
    return words.every((w) => hay.includes(w));
  });
}

/* -------------------------------------------------- tiến độ */

type ProgressState = {
  /** lessonId -> day the lesson was marked done */
  done: Record<string, string>;
  last: string | null;
};

const EMPTY: ProgressState = { done: {}, last: null };

function storageKey(courseId: string) {
  return `bdi-course-${courseId}`;
}

function load(courseId: string): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(storageKey(courseId));
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<ProgressState>;
    return {
      done: typeof parsed.done === "object" && parsed.done ? parsed.done : {},
      last: typeof parsed.last === "string" ? parsed.last : null,
    };
  } catch {
    return EMPTY;
  }
}

export function useCourseProgress(course: Course) {
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load(course.id));
    setHydrated(true);
  }, [course.id]);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(storageKey(course.id), JSON.stringify(state));
  }, [state, hydrated, course.id]);

  const toggleDone = useCallback((lessonId: string) => {
    setState((s) => {
      const done = { ...s.done };
      if (done[lessonId]) delete done[lessonId];
      else done[lessonId] = dayKey();
      return { ...s, done };
    });
  }, []);

  const remember = useCallback((lessonId: string) => {
    setState((s) => (s.last === lessonId ? s : { ...s, last: lessonId }));
  }, []);

  const reset = useCallback(() => setState(EMPTY), []);

  const sectionPercent = useMemo(() => {
    const out: Record<string, number> = {};
    for (const section of course.sections) {
      const total = section.lessons.length || 1;
      const n = section.lessons.filter((l) => state.done[l.id]).length;
      out[section.id] = Math.round((n / total) * 100);
    }
    return out;
  }, [course.sections, state.done]);

  const doneCount = useMemo(
    () => course.sections.reduce((n, s) => n + s.lessons.filter((l) => state.done[l.id]).length, 0),
    [course.sections, state.done],
  );

  return {
    hydrated,
    done: state.done,
    last: state.last,
    doneCount,
    percent: Math.round((doneCount / (course.stats.lessons || 1)) * 100),
    sectionPercent,
    toggleDone,
    remember,
    reset,
  };
}

/* -------------------------------------------------- vị trí nghe */

const POS_KEY = "bdi-course-audio-pos";

/** Resume long listening files where they were left off. */
export function readAudioPos(src: string): number {
  if (typeof window === "undefined") return 0;
  try {
    const map = JSON.parse(window.localStorage.getItem(POS_KEY) ?? "{}") as Record<string, number>;
    return map[src] ?? 0;
  } catch {
    return 0;
  }
}

export function writeAudioPos(src: string, seconds: number) {
  if (typeof window === "undefined") return;
  try {
    const map = JSON.parse(window.localStorage.getItem(POS_KEY) ?? "{}") as Record<string, number>;
    if (seconds < 5) delete map[src];
    else map[src] = Math.round(seconds);
    window.localStorage.setItem(POS_KEY, JSON.stringify(map));
  } catch {
    /* quota hoặc JSON lỗi — bỏ qua, đây chỉ là tiện ích */
  }
}

export function formatBytes(bytes: number) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export type { Course, CourseGroup, CourseItem, CourseLesson, CourseSection };
