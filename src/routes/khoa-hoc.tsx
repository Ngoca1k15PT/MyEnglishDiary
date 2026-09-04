import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Dumbbell,
  Keyboard,
  ListMusic,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
  X,
} from "lucide-react";
import type { Course } from "@/data/course-types";
import raw from "@/data/courses/toeic-550-700-mai-phuong.json";
import { AnswerSheet } from "@/components/course/answer-sheet";
import { AudioDock, type AudioDockHandle } from "@/components/course/audio-dock";
import { DocViewer } from "@/components/course/doc-viewer";
import { ErrorLog } from "@/components/course/error-log";
import { NextUp } from "@/components/course/next-up";
import { QuizOverlay, type QuizTarget } from "@/components/course/quiz-overlay";
import { audioByQuestion } from "@/lib/course-audio";
import { planActions, writePlanSummary, type PlanAction } from "@/lib/course-plan";
import { examTopic, toeicNodeFor, useExam, useExamLog } from "@/lib/course-exam";
import type { QuestionBank } from "@/lib/course-questions";
import { useProgress } from "@/lib/progress";
import {
  flattenLessons,
  formatBytes,
  searchLessons,
  useCourseProgress,
  useCourseSource,
} from "@/lib/course";
import { useIsBelow, useIsMobile } from "@/hooks/use-mobile";
import { useAuth } from "@/lib/auth";

const course = raw as Course;

/** Split out of the main bundle: only fetched when review cards are requested. */
const loadQuestions = () =>
  import("@/data/courses/toeic-550-700-mai-phuong.questions.json").then(
    (m) => m.default as QuestionBank,
  );

export const Route = createFileRoute("/khoa-hoc")({
  head: () => ({
    meta: [
      { title: `${course.title} — học ngay trong app` },
      {
        name: "description",
        content:
          "Đọc tài liệu, làm đề và nghe file audio của khoá học ngay trong app, không cần mở thêm tab hay tải file về máy.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  // Optional key (not `bai: string | undefined`) so plain <Link to="/khoa-hoc"> stays valid.
  validateSearch: (search: Record<string, unknown>): { bai?: string } =>
    typeof search["bai"] === "string" ? { bai: search["bai"] } : {},
  component: CoursePage,
});

const SHORTCUTS = [
  ["Space", "Phát / dừng file nghe"],
  ["← →", "Lùi / tiến 5 giây"],
  ["Shift + ← →", "File nghe trước / sau"],
  ["[ ]", "Bài trước / bài sau"],
  ["Ctrl/Cmd + K", "Thêm thẻ từ vựng"],
];

function CoursePage() {
  const { bai } = Route.useSearch();
  const navigate = Route.useNavigate();
  const isMobile = useIsMobile();
  // Phiếu trả lời chuyển sang dạng ngang dưới màn hình ở mốc lg (1024px) —
  // phải khớp đúng class lg:block/lg:hidden bên dưới, không dùng chung mốc
  // 768px của isMobile, kẻo có dải màn hình không bật được phiếu.
  const sheetNarrow = useIsBelow(1024);
  const progress = useCourseProgress(course);
  const source = useCourseSource(course);
  // Star-map progress, so a graded test here lights the matching TOEIC part.
  const uid = useAuth().user?.uid ?? null;
  const starMap = useProgress({ uid });
  const examLog = useExamLog();

  const flat = useMemo(() => flattenLessons(course), []);
  const byId = useMemo(() => new Map(flat.map((f) => [f.lesson.id, f])), [flat]);

  // Which bank entries belong to each topic, so the review log can start a
  // practice run pooled across every test that drilled it.
  const examIdsByTopic = useMemo(() => {
    const out = new Map<string, string[]>();
    for (const section of course.sections) {
      for (const lesson of section.lessons) {
        lesson.groups.forEach((group, index) => {
          if (!group.exam?.cards) return;
          const topic = examTopic(section.title, lesson.title);
          out.set(topic, [...(out.get(topic) ?? []), `${lesson.id}:${index}`]);
        });
      }
    }
    return out;
  }, []);

  const [query, setQuery] = useState("");
  const [sideTab, setSideTab] = useState<"lessons" | "log">("lessons");
  // Desktop keeps the list docked; mobile opens it as an overlay.
  const [collapsed, setCollapsed] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set());
  const [groupIndex, setGroupIndex] = useState(0);
  const [sky, setSky] = useState<"night" | "day">("night");
  const [showKeys, setShowKeys] = useState(false);
  // Docked beside the worksheet on desktop; an overlay on phones, where both
  // can't share the width.
  const [sheetOpen, setSheetOpen] = useState(true);
  const [mobileSheet, setMobileSheet] = useState(false);
  const [quiz, setQuiz] = useState<QuizTarget | null>(null);
  // Non-null when the player has been narrowed to the recordings for the
  // questions just missed.
  const [audioQueue, setAudioQueue] = useState<number[] | null>(null);
  const [pendingPlay, setPendingPlay] = useState<string | null>(null);
  const dockRef = useRef<AudioDockHandle | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem("bdi-sky");
    if (stored === "day" || stored === "night") setSky(stored);
  }, []);

  const setSkyPersist = (next: "night" | "day") => {
    setSky(next);
    window.localStorage.setItem("bdi-sky", next);
  };

  const active =
    (bai ? byId.get(bai) : undefined) ??
    (progress.last ? byId.get(progress.last) : undefined) ??
    flat[0]!;
  const lesson = active.lesson;
  const sectionId = active.section.id;
  const { remember } = progress;

  // Set when navigating straight to a specific exercise inside a lesson, so the
  // reset below lands on it instead of snapping back to the first group.
  const pendingGroup = useRef<number | null>(null);

  useEffect(() => {
    remember(lesson.id);
    setGroupIndex(pendingGroup.current ?? 0);
    pendingGroup.current = null;
    setOpenSections((s) => (s.has(sectionId) ? s : new Set(s).add(sectionId)));
  }, [lesson.id, sectionId, remember]);

  // A filter from the previous exercise would otherwise keep playing the wrong
  // clips (or none) after you move on.
  useEffect(() => {
    setAudioQueue(null);
    setPendingPlay(null);
  }, [lesson.id, groupIndex]);

  const open = useCallback(
    (lessonId: string) => {
      void navigate({ search: { bai: lessonId } });
      setMobileNav(false);
    },
    [navigate],
  );

  const registerDock = useCallback((handle: AudioDockHandle | null) => {
    dockRef.current = handle;
  }, []);

  const plan = useMemo(
    () =>
      progress.hydrated && examLog.hydrated
        ? planActions(course, {
            topics: examLog.topics,
            attempts: examLog.attempts,
            doneLessons: new Set(Object.keys(progress.done)),
          })
        : [],
    [progress.hydrated, progress.done, examLog.hydrated, examLog.topics, examLog.attempts],
  );

  // Leaves the headline where the home page can read it without importing the
  // whole manifest.
  useEffect(() => {
    const top = plan[0];
    writePlanSummary(
      top
        ? {
            label: top.label,
            reason: top.reason,
            ...(top.kind === "quiz" ? {} : { lessonId: top.lessonId }),
          }
        : null,
    );
  }, [plan]);

  const runAction = useCallback(
    (action: PlanAction) => {
      if (action.kind === "quiz") {
        setQuiz({
          title: `Luyện: ${action.topic}`,
          poolKey: `topic:${action.topic}`,
          examIds: action.examIds,
        });
        return;
      }
      if (action.kind === "exam") {
        pendingGroup.current = action.groupIndex;
        setGroupIndex(action.groupIndex);
      }
      open(action.lessonId);
    },
    [open],
  );

  const stepLesson = useCallback(
    (delta: number) => {
      const next = flat[active.index + delta];
      if (next) open(next.lesson.id);
    },
    [flat, active.index, open],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT"))
        return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.code === "Space") {
        e.preventDefault();
        dockRef.current?.toggle();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (e.shiftKey) dockRef.current?.step(-1);
        else dockRef.current?.seekBy(-5);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (e.shiftKey) dockRef.current?.step(1);
        else dockRef.current?.seekBy(5);
      } else if (e.key === "[") {
        stepLesson(-1);
      } else if (e.key === "]") {
        stepLesson(1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [stepLesson]);

  const group = lesson.groups[Math.min(groupIndex, lesson.groups.length - 1)];
  const docs = useMemo(() => (group?.items ?? []).filter((i) => i.kind !== "audio"), [group]);
  const allTracks = useMemo(() => (group?.items ?? []).filter((i) => i.kind === "audio"), [group]);
  const questionAudio = useMemo(
    () => audioByQuestion(group?.items ?? [], group?.exam?.questions ?? 0),
    [group],
  );

  // Deduped and in playing order, since one Part 4 talk covers three questions.
  const tracks = useMemo(() => {
    if (!audioQueue) return allTracks;
    const wanted = new Set(
      audioQueue.map((q) => questionAudio.get(q)?.src).filter((src): src is string => Boolean(src)),
    );
    const narrowed = allTracks.filter((t) => wanted.has(t.src));
    return narrowed.length > 0 ? narrowed : allTracks;
  }, [audioQueue, allTracks, questionAudio]);
  const urlOf = useCallback((item: { src: string }) => `${source.base}/${item.src}`, [source.base]);

  // Runs after `tracks` has been rebuilt, so the file is actually in the player
  // by the time it's asked to play. Route effects run after the dock's own.
  useEffect(() => {
    if (!pendingPlay) return;
    dockRef.current?.playSrc(pendingPlay);
    setPendingPlay(null);
  }, [pendingPlay, tracks]);

  const results = useMemo(() => searchLessons(flat, query), [flat, query]);
  const isDone = Boolean(progress.done[lesson.id]);

  // Gọi ở đây, một lần duy nhất cho cả trang: phiếu trả lời và cửa che đáp án
  // phải nhìn vào CÙNG một trạng thái, và useExam không chịu được hai bản.
  const examId = `${lesson.id}:${groupIndex}`;
  const exam = useExam(examId, group?.exam);

  /**
   * Điều kiện phòng thi: bài đã bắt đầu mà chưa nộp thì thoát ra là mất.
   *
   * Ba đường thoát đều dẫn tới cùng một kết quả — đổi sang bài khác, tải lại
   * trang, hoặc đóng tab. Nếu cho giữ lại thì đồng hồ mất hết ý nghĩa: ai cũng
   * có thể tạm thoát, tra đáp án, rồi quay vào làm tiếp.
   */
  const abandon = exam.abandonExam;

  // Tải lại trang hay mở lại tab: phiên khác nghĩa là đã thoát ra ngoài.
  useEffect(() => {
    if (exam.fromOtherSession && !exam.submitted) abandon(examId);
  }, [exam.fromOtherSession, exam.submitted, abandon, examId]);

  // Chuyển sang bài khác: huỷ bài vừa bỏ dở.
  const dangThi = exam.inProgress;
  const boDoRef = useRef<{ id: string; dangThi: boolean }>({ id: examId, dangThi: false });
  useEffect(() => {
    const truoc = boDoRef.current;
    if (truoc.id !== examId) {
      if (truoc.dangThi) abandon(truoc.id);
      boDoRef.current = { id: examId, dangThi };
    } else {
      boDoRef.current.dangThi = dangThi;
    }
  }, [examId, dangThi, abandon]);

  // Nhắc trước khi đóng tab, để không mất bài vì lỡ tay.
  useEffect(() => {
    if (!dangThi) return;
    const canh = (ev: BeforeUnloadEvent) => ev.preventDefault();
    window.addEventListener("beforeunload", canh);
    return () => window.removeEventListener("beforeunload", canh);
  }, [dangThi]);

  /**
   * Đáp án chỉ mở sau khi thật sự làm bài. Chép đáp án trước khi làm thì buổi
   * luyện thành vô nghĩa, mà chính người học là người thiệt.
   */
  const answerGate = group?.exam
    ? {
        allowed: exam.submitted,
        answered: Object.keys(exam.answers).length,
        total: exam.questions,
      }
    : undefined;

  const answerSheet = group?.exam ? (
    <AnswerSheet
      e={exam}
      examId={examId}
      exam={group.exam}
      sectionId={sectionId}
      topic={examTopic(active.section.title, lesson.title)}
      nodeId={toeicNodeFor(sectionId, lesson.title)}
      onRecordScore={starMap.recordScore}
      onLogAttempt={examLog.log}
      loadQuestions={loadQuestions}
      audio={questionAudio}
      onPlayQuestion={(question) => {
        const clip = questionAudio.get(question);
        if (!clip) return;
        // Clearing the filter changes the track list, so the play has to wait
        // for that to land — see the effect below.
        setAudioQueue(null);
        setPendingPlay(clip.src);
      }}
      onQueueQuestions={(questions) => {
        setAudioQueue(questions);
        const first = questions.map((q) => questionAudio.get(q)?.src).find(Boolean);
        if (first) setPendingPlay(first);
      }}
    />
  ) : null;

  const sidebar = (
    <div className="flex h-full min-h-0 flex-col bg-sidebar">
      <div className="flex gap-1 border-b border-border p-2">
        {(
          [
            { id: "lessons", label: "Bài học" },
            {
              id: "log",
              label: examLog.overall.tests
                ? `Nhật ký lỗi · ${examLog.overall.tests}`
                : "Nhật ký lỗi",
            },
          ] as const
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setSideTab(t.id)}
            className={`flex-1 rounded-md px-2 py-1.5 text-[11px] transition-colors ${
              sideTab === t.id
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <NextUp actions={plan} onPick={runAction} />

      {sideTab === "log" ? (
        <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
          <ErrorLog
            topics={examLog.topics}
            overall={examLog.overall}
            onPickTopic={(topic) => {
              setQuery(topic);
              setSideTab("lessons");
            }}
            quizableTopics={examIdsByTopic}
            onQuizTopic={(topic) =>
              setQuiz({
                title: `Luyện: ${topic}`,
                poolKey: `topic:${topic}`,
                examIds: examIdsByTopic.get(topic) ?? [],
              })
            }
            onClear={examLog.clear}
          />
        </div>
      ) : (
        <>
          <div className="border-b border-border p-3">
            <div className="relative">
              <Search
                size={14}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm bài, ví dụ: part 5 gioi tu"
                aria-label="Tìm bài học"
                className="w-full rounded-lg border border-border bg-background/70 py-2 pl-9 pr-8 text-xs text-foreground outline-none focus:border-ring"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  aria-label="Xoá từ khoá"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  <X size={13} />
                </button>
              )}
            </div>
            <p className="mt-2 text-[11px] text-muted-foreground">
              {query
                ? `${results.length} bài khớp`
                : `${progress.doneCount}/${course.stats.lessons} bài đã học · ${progress.percent}%`}
            </p>
          </div>

          <nav className="min-h-0 flex-1 overflow-y-auto no-scrollbar p-2">
            {query ? (
              <ul className="space-y-0.5">
                {results.map((f) => (
                  <li key={f.lesson.id}>
                    <LessonButton
                      label={`${f.section.title} · ${f.lesson.order ?? ""} ${f.lesson.title}`.trim()}
                      active={f.lesson.id === lesson.id}
                      done={Boolean(progress.done[f.lesson.id])}
                      onClick={() => open(f.lesson.id)}
                    />
                  </li>
                ))}
              </ul>
            ) : (
              course.sections.map((section) => {
                const expanded = openSections.has(section.id);
                return (
                  <div key={section.id} className="mb-1">
                    <button
                      onClick={() =>
                        setOpenSections((s) => {
                          const next = new Set(s);
                          if (next.has(section.id)) next.delete(section.id);
                          else next.add(section.id);
                          return next;
                        })
                      }
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:bg-accent"
                    >
                      <ChevronDown
                        size={13}
                        className={`shrink-0 transition-transform ${expanded ? "" : "-rotate-90"}`}
                      />
                      <span className="flex-1 truncate">{section.title}</span>
                      <span className="shrink-0 text-[10px] font-normal tabular-nums text-muted-foreground">
                        {progress.sectionPercent[section.id]}%
                      </span>
                    </button>
                    <span className="mx-2 block h-0.5 overflow-hidden rounded-full bg-muted">
                      <span
                        className="block h-full rounded-full bg-star-done transition-[width] duration-500"
                        style={{ width: `${progress.sectionPercent[section.id]}%` }}
                      />
                    </span>
                    {expanded && (
                      <ul className="mt-1 space-y-0.5 pl-2">
                        {section.lessons.map((l) => (
                          <li key={l.id}>
                            <LessonButton
                              label={`${l.order ? `${l.order}. ` : ""}${l.title}`}
                              active={l.id === lesson.id}
                              done={Boolean(progress.done[l.id])}
                              onClick={() => open(l.id)}
                            />
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                );
              })
            )}
          </nav>
        </>
      )}

      <div className="border-t border-border p-3 text-[11px] leading-relaxed text-muted-foreground">
        {course.stats.docs} tài liệu · {course.stats.audios} file nghe ·{" "}
        {formatBytes(course.stats.bytes)}
        {source.state === "remote" && <span className="block">Đang phát từ CDN</span>}
      </div>
    </div>
  );

  return (
    <main
      className={`flex h-[100dvh] w-screen overflow-hidden bg-background ${sky === "day" ? "day" : ""}`}
    >
      {!collapsed && (
        <aside className="hidden w-72 shrink-0 border-r border-border md:block">{sidebar}</aside>
      )}

      {mobileNav && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="w-[85vw] max-w-sm border-r border-border">{sidebar}</div>
          <button
            className="flex-1 bg-black/50"
            aria-label="Đóng danh sách bài"
            onClick={() => setMobileNav(false)}
          />
        </div>
      )}

      <section className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2.5">
          <button
            onClick={() => (isMobile ? setMobileNav((v) => !v) : setCollapsed((v) => !v))}
            aria-label="Danh sách bài học"
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {collapsed || isMobile ? <PanelLeftOpen size={14} /> : <PanelLeftClose size={14} />}
          </button>

          <Link
            to="/"
            className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft size={13} /> Bản đồ sao
          </Link>

          <h1 className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {course.title}
          </h1>

          {group?.exam?.cards && (
            <button
              onClick={() =>
                setQuiz({
                  title: `Luyện: ${lesson.title}`,
                  poolKey: `exam:${lesson.id}:${groupIndex}`,
                  examIds: [`${lesson.id}:${groupIndex}`],
                })
              }
              title="Luyện 10 câu rút từ đề này, không cần mở PDF"
              className="inline-flex items-center gap-1.5 rounded-lg border border-star-done/50 px-2.5 py-1.5 text-[11px] text-foreground transition-colors hover:bg-accent"
            >
              <Dumbbell size={13} className="text-star-done" /> Luyện
            </button>
          )}
          {group?.exam && (
            <button
              onClick={() => (sheetNarrow ? setMobileSheet((v) => !v) : setSheetOpen((v) => !v))}
              title="Phiếu trả lời"
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[11px] transition-colors ${
                (sheetNarrow ? mobileSheet : sheetOpen)
                  ? "border-ring bg-accent text-foreground"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <ClipboardCheck size={13} /> {group.exam.questions} câu
            </button>
          )}
          <button
            onClick={() => setShowKeys((v) => !v)}
            aria-label="Phím tắt"
            title="Phím tắt"
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Keyboard size={14} />
          </button>
          <button
            onClick={() => setSkyPersist(sky === "night" ? "day" : "night")}
            aria-label="Đổi giao diện Đêm / Ngày"
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {sky === "night" ? <Sun size={14} /> : <Moon size={14} />}
          </button>
        </header>

        {showKeys && (
          <div className="grid gap-x-6 gap-y-1 border-b border-border bg-card/50 px-4 py-3 text-[11px] sm:grid-cols-2 lg:grid-cols-3">
            {SHORTCUTS.map(([key, desc]) => (
              <p key={key} className="flex items-center gap-2 text-muted-foreground">
                <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-sans text-[10px] text-foreground">
                  {key}
                </kbd>
                {desc}
              </p>
            ))}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 border-b border-border px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] text-muted-foreground">
              {active.section.title} · bài {active.index + 1}/{course.stats.lessons}
            </p>
            <h2 className="truncate text-base font-semibold text-foreground">
              {lesson.order ? `${lesson.order}. ` : ""}
              {lesson.title}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => stepLesson(-1)}
              disabled={active.index === 0}
              aria-label="Bài trước"
              className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-35"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={() => stepLesson(1)}
              disabled={active.index >= flat.length - 1}
              aria-label="Bài sau"
              className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-35"
            >
              <ChevronRight size={15} />
            </button>
            <button
              onClick={() => progress.toggleDone(lesson.id)}
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                isDone
                  ? "border-star-done bg-star-done/15 text-star-done"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              <Check size={14} /> {isDone ? "Đã học" : "Đánh dấu đã học"}
            </button>
          </div>
        </div>

        {lesson.groups.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-4 py-2">
            <span className="text-[11px] text-muted-foreground">Phần trong bài:</span>
            {lesson.groups.map((g, i) => {
              const counts = g.items.filter((it) => it.kind === "audio").length;
              return (
                <button
                  key={g.title ?? "root"}
                  onClick={() => setGroupIndex(i)}
                  className={`inline-flex min-h-[30px] items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] transition-colors ${
                    i === groupIndex
                      ? "border-ring bg-accent text-foreground"
                      : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                  }`}
                >
                  {g.title ?? "Tài liệu chung"}
                  {counts > 0 && (
                    <span className="inline-flex items-center gap-0.5 opacity-60">
                      <ListMusic size={11} />
                      {counts}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {source.state === "missing" ? (
          <div className="flex min-h-0 flex-1 items-center justify-center p-8">
            <p className="max-w-md text-center text-xs leading-relaxed text-muted-foreground">
              Không tìm thấy tài liệu ở <code>public/course/{course.id}</code> hay trên CDN. Danh
              sách bài vẫn còn — chạy{" "}
              <code>
                npm run ingest:course -- --src "&lt;thư mục khoá học&gt;" --id {course.id}
              </code>{" "}
              trên máy có file gốc để nạp lại.
            </p>
          </div>
        ) : (
          <>
            <div className="flex min-h-0 flex-1">
              <div className="min-h-0 min-w-0 flex-1">
                {source.base && (
                  <DocViewer docs={docs} urlOf={urlOf} resetKey={examId} answerGate={answerGate} />
                )}
              </div>
              {answerSheet && sheetOpen && (
                <div className="hidden w-72 shrink-0 lg:block">{answerSheet}</div>
              )}
            </div>

            {answerSheet && mobileSheet && (
              <div className="h-[55dvh] shrink-0 lg:hidden">{answerSheet}</div>
            )}

            {source.base && (
              <AudioDock
                tracks={tracks}
                urlOf={urlOf}
                resetKey={`${lesson.id}:${groupIndex}`}
                queueLabel={audioQueue ? `Câu sai (${audioQueue.length})` : undefined}
                onClearQueue={() => setAudioQueue(null)}
                onPlay={exam.autoStartTimer}
                onRegister={registerDock}
              />
            )}
          </>
        )}
      </section>

      {quiz && (
        <QuizOverlay target={quiz} loadQuestions={loadQuestions} onClose={() => setQuiz(null)} />
      )}
    </main>
  );
}

function LessonButton({
  label,
  active,
  done,
  onClick,
}: {
  label: string;
  active: boolean;
  done: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left text-[11px] leading-snug transition-colors ${
        active
          ? "bg-primary/15 text-foreground"
          : "text-muted-foreground hover:bg-accent hover:text-foreground"
      }`}
    >
      <span
        className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${done ? "bg-star-done" : "bg-muted-foreground/35"}`}
      />
      <span className="min-w-0 flex-1">{label}</span>
    </button>
  );
}
