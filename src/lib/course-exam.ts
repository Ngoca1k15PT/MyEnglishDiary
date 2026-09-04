import { useCallback, useEffect, useMemo, useState } from "react";
import type { CourseExam } from "@/data/course-types";
import { TOEIC_PART_BY_ID } from "@/data/toeic";

export const LETTERS = ["A", "B", "C", "D"] as const;

const KEY = "bdi-course-exam";

type ExamEntry = {
  /** 1-based question number -> chosen letter */
  answers: Record<string, string>;
  /** Raw text the user pasted for the correct answers; parsed leniently. */
  keyText?: string;
  /** Overrides the detected question count when the PDF was misread. */
  questions?: number;
  /**
   * Thời điểm người học bấm "Chấm bài". Chưa có nghĩa là chưa chấm — và chừng
   * nào chưa chấm thì tuyệt đối không được lộ đáp án đúng ra phiếu.
   */
  submittedAt?: string;
  /**
   * Seconds already spent, plus the epoch ms the clock was last started. Storing
   * both means the clock keeps running across a reload or a trip to another
   * lesson, which is the point of timing yourself.
   */
  spent?: number;
  runningSince?: number | null;
  /**
   * Phiên trang đã khởi động bài này. Tải lại trang hay đóng tab là sinh phiên
   * mới — bài đang dở coi như bỏ, xoá làm lại từ đầu. Đây là điều kiện phòng
   * thi: không có chuyện dừng giữa chừng rồi quay lại làm tiếp.
   */
  sessionId?: string;
};

/** Một lần tải trang là một phiên. Đổi phiên = đã thoát ra ngoài. */
const PAGE_SESSION =
  typeof window === "undefined" ? "" : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

type Store = Record<string, ExamEntry>;

const EMPTY_ENTRY: ExamEntry = { answers: {} };

function load(): Store {
  if (typeof window === "undefined") return {};
  try {
    return (JSON.parse(window.localStorage.getItem(KEY) ?? "{}") as Store) ?? {};
  } catch {
    return {};
  }
}

/**
 * Pulls answer letters out of whatever the user pasted. Digits and punctuation
 * are dropped, so "CABD", "1.C 2.A 3.B" and "C, A, B" all read the same.
 */
export function parseKey(raw: string, questions: number) {
  const letters = (raw.toUpperCase().match(/[A-D]/g) ?? []).slice(0, questions);
  return letters;
}

export type ExamResult = {
  total: number;
  answered: number;
  correct: number;
  /** 1-based question numbers answered wrongly. */
  wrong: number[];
  /** Questions left blank. */
  blank: number[];
  percent: number;
};

/**
 * Reduces a lesson title to the grammar point or part it drills, so repeated
 * attempts on the same topic aggregate in the review log. "Bài thi online 2 -
 * Đại từ (1)" and "Thi online 1. Đại từ (2)" both become "Đại từ".
 */
export function examTopic(sectionTitle: string, lessonTitle: string) {
  // Precomposed form, so the Vietnamese prefixes below actually match.
  const stripped = lessonTitle
    .normalize("NFC")
    // Trailing sequence number, including typos like "Part 2 ()3".
    .replace(/\s*\(\s*\d*\s*\)\s*\d*\s*$/, "")
    .replace(/\s*\(\s*\d+\s*\)\s*$/, "")
    .replace(/^\s*(b[àa]i\s*thi\s*online|thi\s*online|b[àa]i\s*thi|thi\s*th[ửu])\s*/i, "")
    .replace(/^\s*\d+\s*[.\-–]?\s*/, "")
    .replace(/^\s*[-–.]\s*/, "")
    .trim();

  // A plain part test has no topic of its own; label it by the part.
  if (!stripped || /^part\s*[\d\s-]+$/i.test(stripped)) {
    const m = /part\s*(\d)/i.exec(stripped) ?? /part\s*(\d)/i.exec(lessonTitle);
    return m ? `Part ${m[1]}` : sectionTitle;
  }
  return stripped;
}

/**
 * Maps a course section onto the TOEIC part it practises. Part 5 and 6 share a
 * folder in this course, so the lesson title is what separates them.
 */
export function toeicNodeFor(sectionId: string, lessonTitle: string): string | null {
  if (sectionId === "part-5-6") return /part\s*6/i.test(lessonTitle) ? "t-p6" : "t-p5";
  const m = /^part-([1-7])$/.exec(sectionId);
  return m ? `t-p${m[1]}` : null;
}

/**
 * Practice tests here are not full-length parts (10 questions for Part 1 vs 6 in
 * the real exam), so the ratio is what carries over to the score history.
 */
export function scaleToPart(nodeId: string, correct: number, total: number) {
  const part = TOEIC_PART_BY_ID[nodeId];
  if (!part || total <= 0) return null;
  return {
    part,
    score: Math.round((correct / total) * part.questions),
    target: part.goal700,
  };
}

export function useExam(examId: string, detected: CourseExam | undefined) {
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

  const entry = store[examId] ?? EMPTY_ENTRY;
  const questions = entry.questions ?? detected?.questions ?? 0;
  const options = detected?.options ?? 4;

  const update = useCallback(
    (patch: (e: ExamEntry) => ExamEntry) => {
      setStore((s) => ({ ...s, [examId]: patch(s[examId] ?? EMPTY_ENTRY) }));
    },
    [examId],
  );

  /**
   * Đồng hồ tự chạy từ hành động THẬT đầu tiên: bật file nghe hoặc chọn đáp án.
   *
   * Trước đây phải bấm "Bắt đầu" thì mới đếm, nên người học nghe hết cả bài rồi
   * mà đồng hồ vẫn đứng im — con số đo được thành vô nghĩa. Với đề Listening thì
   * file nghe CHÍNH LÀ bài thi, bấm play là đã vào phòng thi rồi.
   *
   * Chỉ tự chạy khi đồng hồ chưa từng chạy (`spent` = 0). Ai đã chủ động bấm
   * dừng thì tôn trọng, không tự bật lại sau lưng họ.
   */
  const autoStartTimer = useCallback(
    () =>
      update((e) =>
        e.runningSince || e.spent ? e : { ...e, runningSince: Date.now(), sessionId: PAGE_SESSION },
      ),
    [update],
  );

  const setAnswer = useCallback(
    (question: number, letter: string) =>
      update((e) => {
        const answers = { ...e.answers };
        if (answers[question] === letter) delete answers[question];
        else answers[question] = letter;
        const batDau =
          e.runningSince || e.spent ? {} : { runningSince: Date.now(), sessionId: PAGE_SESSION };
        return { ...e, answers, ...batDau };
      }),
    [update],
  );

  const setKeyText = useCallback((keyText: string) => update((e) => ({ ...e, keyText })), [update]);

  const setQuestions = useCallback(
    (n: number) => update((e) => ({ ...e, questions: Math.max(1, Math.min(200, n)) })),
    [update],
  );

  /**
   * Xoá lựa chọn để làm lại — nhưng KHÔNG đụng tới đồng hồ.
   *
   * Làm lại bài không có nghĩa là làm lại giờ. Cho reset đồng hồ ở đây thì đó là
   * kẽ hở duy nhất còn lại để lách luật phòng thi: cứ hết giờ là xoá rồi bấm
   * lại. Nếu đã nộp (đồng hồ đang đứng) thì cho chạy tiếp từ số cũ.
   */
  const clearAnswers = useCallback(
    () =>
      update(({ submittedAt: _cleared, ...e }) => {
        const daBatDau = Boolean(e.runningSince || e.spent);
        const chayTiep =
          daBatDau && !e.runningSince ? { runningSince: Date.now(), sessionId: PAGE_SESSION } : {};
        return { ...e, answers: {}, ...chayTiep };
      }),
    [update],
  );

  /**
   * Bỏ bài đang dở: xoá lựa chọn, đồng hồ và trạng thái nộp.
   * Giữ `keyText`/`questions` vì đó là cấu hình của đề, không phải bài làm.
   */
  const abandonExam = useCallback(
    (id: string) =>
      setStore((st) => {
        const e = st[id];
        if (!e) return st;
        const keep: ExamEntry = { answers: {} };
        if (e.keyText !== undefined) keep.keyText = e.keyText;
        if (e.questions !== undefined) keep.questions = e.questions;
        return { ...st, [id]: keep };
      }),
    [],
  );

  const submit = useCallback(
    () =>
      update((e) => ({
        ...e,
        submittedAt: new Date().toISOString(),
        // Phải cộng dồn quãng đang chạy vào `spent` giống pauseTimer. Chỉ xoá
        // runningSince là mất trắng thời gian đã làm: đồng hồ nhảy về nguyên
        // giới hạn, và con số ghi vào nhật ký lỗi cũng sai theo.
        spent:
          (e.spent ?? 0) + (e.runningSince ? Math.floor((Date.now() - e.runningSince) / 1000) : 0),
        runningSince: null,
      })),
    [update],
  );

  /** Quay lại làm tiếp, giữ nguyên lựa chọn nhưng giấu đáp án đi. */
  const unsubmit = useCallback(() => update(({ submittedAt: _cleared, ...e }) => e), [update]);

  /* ---------- đồng hồ ---------- */

  /** Đang trong giờ làm bài: đã bấm giờ và chưa nộp. Lúc này không cho dừng. */
  const inProgress = Boolean((entry.runningSince || entry.spent) && !entry.submittedAt);
  const running = Boolean(entry.runningSince);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);

  const elapsed =
    (entry.spent ?? 0) +
    (entry.runningSince ? Math.floor((Date.now() - entry.runningSince) / 1000) : 0);
  void tick; // the interval exists purely to re-read Date.now()

  const startTimer = useCallback(
    () =>
      update((e) =>
        e.runningSince ? e : { ...e, runningSince: Date.now(), sessionId: PAGE_SESSION },
      ),
    [update],
  );

  const pauseTimer = useCallback(
    () =>
      update((e) =>
        e.runningSince
          ? {
              ...e,
              spent: (e.spent ?? 0) + Math.floor((Date.now() - e.runningSince) / 1000),
              runningSince: null,
            }
          : e,
      ),
    [update],
  );

  const resetTimer = useCallback(
    () => update((e) => ({ ...e, spent: 0, runningSince: null })),
    [update],
  );

  // The key read off the answer PDF during ingest is the default; anything typed
  // here wins, so a misread can always be corrected.
  const autoKey = detected?.key ?? "";
  const usingAuto = !entry.keyText && autoKey.length > 0;
  const keyText = entry.keyText ?? "";
  const key = useMemo(
    () => parseKey(usingAuto ? autoKey : keyText, questions),
    [usingAuto, autoKey, keyText, questions],
  );

  const result = useMemo<ExamResult | null>(() => {
    // Đáp án được nạp sẵn từ file đáp án của đề, nên nếu chấm ngay khi có đủ
    // đáp án thì phiếu sẽ khoe đáp án đúng từ lúc mới mở trang — người học chưa
    // làm gì đã thấy hết. Phải đợi họ chủ động bấm chấm.
    if (!entry.submittedAt) return null;
    if (key.length < questions || questions === 0) return null;
    const wrong: number[] = [];
    const blank: number[] = [];
    let correct = 0;
    for (let q = 1; q <= questions; q++) {
      const picked = entry.answers[q];
      if (!picked) {
        blank.push(q);
        continue;
      }
      if (picked === key[q - 1]) correct++;
      else wrong.push(q);
    }
    return {
      total: questions,
      answered: questions - blank.length,
      correct,
      wrong,
      blank,
      percent: Math.round((correct / questions) * 100),
    };
  }, [key, questions, entry.answers, entry.submittedAt]);

  return {
    hydrated,
    questions,
    options,
    answers: entry.answers,
    keyText,
    /** The key came from the answer PDF rather than being typed in. */
    usingAuto,
    autoKey,
    /** Full key present and long enough to grade against. */
    keyReady: key.length >= questions && questions > 0,
    keyLength: key.length,
    key,
    result,
    submitted: Boolean(entry.submittedAt),
    inProgress,
    /** Phiên trang khác nghĩa là người học đã thoát ra rồi quay lại. */
    fromOtherSession: Boolean(entry.sessionId && entry.sessionId !== PAGE_SESSION),
    abandonExam,
    submit,
    unsubmit,
    elapsed,
    running,
    setAnswer,
    setKeyText,
    setQuestions,
    clearAnswers,
    startTimer,
    autoStartTimer,
    pauseTimer,
    resetTimer,
  };
}

/**
 * Trạng thái một bài thi.
 *
 * `useExam` giữ bản sao của cả store trong state rồi ghi đè xuống localStorage,
 * nên chỉ được gọi ĐÚNG MỘT LẦN cho mỗi màn hình — hai bản sẽ ghi đè lẫn nhau.
 * Nơi nào cần cũng nhận qua prop kiểu này.
 */
export type ExamState = ReturnType<typeof useExam>;

/* -------------------------------------------------- nhật ký lỗi theo chủ đề */

export type ExamAttempt = {
  at: string;
  examId: string;
  sectionId: string;
  topic: string;
  correct: number;
  total: number;
  /** Seconds taken, when the clock was used. */
  seconds?: number;
};

export type TopicStat = {
  topic: string;
  attempts: number;
  questions: number;
  wrong: number;
  /** Share of questions missed, 0..1. */
  rate: number;
};

const LOG_KEY = "bdi-course-log";
const LOG_CAP = 300;

function loadLog(): ExamAttempt[] {
  if (typeof window === "undefined") return [];
  try {
    const list = JSON.parse(window.localStorage.getItem(LOG_KEY) ?? "[]") as ExamAttempt[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function useExamLog() {
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setAttempts(loadLog());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(LOG_KEY, JSON.stringify(attempts));
  }, [attempts, hydrated]);

  const log = useCallback((attempt: ExamAttempt) => {
    // One entry per test: re-grading replaces the old result rather than
    // double-counting the same questions in the topic stats.
    setAttempts((list) =>
      [...list.filter((a) => a.examId !== attempt.examId), attempt].slice(-LOG_CAP),
    );
  }, []);

  const clear = useCallback(() => setAttempts([]), []);

  const topics = useMemo<TopicStat[]>(() => {
    const map = new Map<string, TopicStat>();
    for (const a of attempts) {
      const cur = map.get(a.topic) ?? {
        topic: a.topic,
        attempts: 0,
        questions: 0,
        wrong: 0,
        rate: 0,
      };
      cur.attempts += 1;
      cur.questions += a.total;
      cur.wrong += a.total - a.correct;
      map.set(a.topic, cur);
    }
    return [...map.values()]
      .map((t) => ({ ...t, rate: t.questions ? t.wrong / t.questions : 0 }))
      .sort((a, b) => b.rate - a.rate || b.questions - a.questions);
  }, [attempts]);

  const overall = useMemo(() => {
    const questions = attempts.reduce((n, a) => n + a.total, 0);
    const correct = attempts.reduce((n, a) => n + a.correct, 0);
    return {
      tests: attempts.length,
      questions,
      correct,
      percent: questions ? Math.round((correct / questions) * 100) : 0,
    };
  }, [attempts]);

  return { hydrated, attempts, topics, overall, log, clear };
}
