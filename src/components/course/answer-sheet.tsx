import { useState } from "react";
import {
  Check,
  Eraser,
  Headphones,
  KeyRound,
  Layers,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Send,
  Timer,
  ClipboardCheck,
  Undo2,
} from "lucide-react";
import type { CourseExam, CourseItem } from "@/data/course-types";
import { formatTime } from "@/lib/course";
import { LETTERS, scaleToPart, type ExamAttempt, type ExamState } from "@/lib/course-exam";
import { reviewCardsFor, saveReviewCards, type LoadQuestionBank } from "@/lib/course-questions";

type Props = {
  /** Trạng thái bài thi, do trang cha giữ — xem ghi chú ở ExamState. */
  e: ExamState;
  /** Stable per lesson + group so answers survive navigation. */
  examId: string;
  exam: CourseExam | undefined;
  sectionId: string;
  /** Grammar point or part this test drills, used to group the review log. */
  topic: string;
  /** TOEIC part node this test feeds, e.g. "t-p2". */
  nodeId: string | null;
  onRecordScore: (nodeId: string, score: number, target: number) => void;
  onLogAttempt: (attempt: ExamAttempt) => void;
  /** Lazy: the question text is a few hundred KB, only needed to make cards. */
  loadQuestions: LoadQuestionBank;
  /** Question number -> the recording that covers it, where one is identifiable. */
  audio: Map<number, CourseItem>;
  onPlayQuestion: (question: number) => void;
  /** Narrows the player down to the recordings for these questions. */
  onQueueQuestions: (questions: number[]) => void;
};

export function AnswerSheet({
  e,
  examId,
  exam,
  sectionId,
  topic,
  nodeId,
  onRecordScore,
  onLogAttempt,
  loadQuestions,
  audio,
  onPlayQuestion,
  onQueueQuestions,
}: Props) {
  const [keyOpen, setKeyOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [cardState, setCardState] = useState<"idle" | "working" | string>("idle");

  const scaled = e.result && nodeId ? scaleToPart(nodeId, e.result.correct, e.result.total) : null;
  const wrongSet = new Set(e.result?.wrong ?? []);
  const answered = Object.keys(e.answers).length;
  const limit = exam?.seconds ?? 0;
  const remaining = limit ? limit - e.elapsed : 0;
  const overtime = limit > 0 && remaining < 0;

  if (!e.hydrated) return null;

  // Một vùng cuộn duy nhất cho cả phiếu. Trước đây danh sách câu có scroll
  // riêng, nên khối kết quả ở dưới nở ra là bóp nghẹt nó — chấm xong 10 câu
  // thì chỉ còn nhìn thấy 9. Giờ đầu phiếu dính lại, phần còn lại cuộn chung.
  return (
    <div className="h-full w-full overflow-y-auto no-scrollbar overscroll-contain border-l border-border bg-card/40">
      <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-card/95 px-3 py-2 backdrop-blur">
        <h3 className="flex-1 text-xs font-semibold text-foreground">Phiếu trả lời</h3>
        <button
          onClick={() => e.setQuestions(e.questions - 1)}
          aria-label="Giảm số câu"
          className="rounded border border-border p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Minus size={11} />
        </button>
        <span className="text-[11px] tabular-nums text-muted-foreground">{e.questions} câu</span>
        <button
          onClick={() => e.setQuestions(e.questions + 1)}
          aria-label="Tăng số câu"
          className="rounded border border-border p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <Plus size={11} />
        </button>
      </div>

      <div className="flex items-center gap-1.5 border-b border-border px-3 py-2">
        {/* Đang thi thì không cho dừng — dừng được nghĩa là đồng hồ vô nghĩa. */}
        {e.inProgress ? (
          <span
            title="Đang trong giờ làm bài — nộp bài thì đồng hồ mới dừng"
            className="inline-flex items-center gap-1.5 rounded-lg border border-star-doing/50 bg-star-doing/10 px-2 py-1 text-[11px] font-medium text-star-doing"
          >
            <Timer size={11} /> Đang thi
          </span>
        ) : (
          <button
            onClick={() => (e.running ? e.pauseTimer() : e.startTimer())}
            className={`inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
              e.running
                ? "bg-primary text-primary-foreground"
                : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            {e.running ? <Pause size={11} /> : <Play size={11} />}
            {e.running ? "Dừng" : e.elapsed ? "Tiếp" : "Bắt đầu"}
          </button>
        )}

        <span
          className={`flex-1 text-right text-sm font-semibold tabular-nums ${
            overtime
              ? "text-destructive"
              : remaining > 0 && remaining <= 60
                ? "text-star-doing"
                : "text-foreground"
          }`}
        >
          {limit
            ? `${overtime ? "-" : ""}${formatTime(Math.abs(remaining))}`
            : formatTime(e.elapsed)}
        </span>

        {!e.inProgress && (
          <button
            onClick={e.resetTimer}
            aria-label="Đặt lại đồng hồ"
            className="rounded border border-border p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <RotateCcw size={11} />
          </button>
        )}
      </div>

      {e.inProgress ? (
        <p className="border-b border-border bg-star-doing/5 px-3 pb-2 pt-1 text-[10px] leading-relaxed text-muted-foreground">
          Đã vào giờ làm bài, không dừng được nữa. Thoát ra hay tải lại trang là mất bài, phải làm
          lại từ đầu — nộp bài xong thì đồng hồ mới dừng.
        </p>
      ) : e.elapsed === 0 && !e.running ? (
        <p className="border-b border-border px-3 pb-2 text-[10px] leading-relaxed text-muted-foreground">
          Đồng hồ tự chạy khi bạn bật file nghe hoặc chọn đáp án đầu tiên
          {limit > 0 ? ` — đề gốc cho ${formatTime(limit)}.` : "."}
        </p>
      ) : (
        limit > 0 && (
          <p className="border-b border-border px-3 pb-2 text-[10px] text-muted-foreground">
            {overtime
              ? `Quá giờ ${formatTime(-remaining)} — đề gốc cho ${formatTime(limit)}.`
              : `Đề gốc cho ${formatTime(limit)} · đã dùng ${formatTime(e.elapsed)}`}
          </p>
        )
      )}

      <div className="px-2 py-2">
        {Array.from({ length: e.questions }, (_, i) => i + 1).map((q) => {
          const picked = e.answers[q];
          const graded = e.result !== null && picked !== undefined;
          const isWrong = wrongSet.has(q);
          const clip = audio.get(q);
          return (
            <div key={q} className="flex items-center gap-1.5 py-1">
              <span
                className={`w-5 shrink-0 text-right text-[11px] tabular-nums ${
                  graded
                    ? isWrong
                      ? "text-destructive"
                      : "text-star-done"
                    : "text-muted-foreground"
                }`}
              >
                {q}
              </span>
              {clip ? (
                <button
                  onClick={() => onPlayQuestion(q)}
                  aria-label={`Nghe câu ${q}`}
                  title={clip.label}
                  className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Play size={11} />
                </button>
              ) : (
                <span className="w-[16px] shrink-0" aria-hidden />
              )}
              {LETTERS.slice(0, e.options).map((letter) => {
                const active = picked === letter;
                const isKey = e.result !== null && e.key[q - 1] === letter;
                return (
                  <button
                    key={letter}
                    onClick={() => e.setAnswer(q, letter)}
                    aria-label={`Câu ${q} chọn ${letter}`}
                    className={`h-9 flex-1 rounded-md text-xs font-medium transition-colors ${
                      active
                        ? isWrong
                          ? "bg-destructive text-destructive-foreground"
                          : "bg-primary text-primary-foreground"
                        : isKey
                          ? "border border-star-done text-star-done"
                          : "border border-border text-muted-foreground hover:bg-accent hover:text-foreground"
                    }`}
                  >
                    {letter}
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* pb-16: chừa chỗ cho nút + nổi ở góc phải dưới, không thì nó che mất dòng cuối. */}
      <div className="space-y-2 border-t border-border p-3 pb-16">
        {e.result ? (
          <>
            <p className="text-sm font-semibold text-foreground">
              {e.result.correct}/{e.result.total} đúng · {e.result.percent}%
            </p>
            {e.result.blank.length > 0 && (
              <p className="text-[11px] text-muted-foreground">
                Bỏ trống {e.result.blank.length} câu — TOEIC không trừ điểm câu sai, đừng để trống.
              </p>
            )}
            {e.result.wrong.length > 0 && (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Sai câu {e.result.wrong.join(", ")}. Mở tab Đáp án để đọc giải thích.
              </p>
            )}
            {(() => {
              const replay = e.result.wrong.filter((q) => audio.has(q));
              if (replay.length === 0) return null;
              return (
                <button
                  onClick={() => onQueueQuestions(replay)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <Headphones size={13} /> Nghe lại {replay.length} câu sai
                </button>
              );
            })()}
            {scaled && (
              <button
                onClick={() => {
                  e.pauseTimer();
                  onRecordScore(nodeId!, scaled.score, scaled.target);
                  onLogAttempt({
                    at: new Date().toISOString(),
                    examId,
                    sectionId,
                    topic,
                    correct: e.result!.correct,
                    total: e.result!.total,
                    ...(e.elapsed > 0 ? { seconds: e.elapsed } : {}),
                  });
                  setSaved(true);
                  window.setTimeout(() => setSaved(false), 2500);
                }}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:brightness-110"
              >
                {saved ? (
                  <>
                    <Check size={13} /> Đã lưu
                  </>
                ) : (
                  <>
                    <Send size={13} /> Lưu · {scaled.score}/{scaled.part.questions} cho{" "}
                    {scaled.part.label.split(" — ")[0]}
                  </>
                )}
              </button>
            )}
            {exam?.cards && e.result.wrong.length > 0 && (
              <button
                onClick={async () => {
                  setCardState("working");
                  const bank = await loadQuestions();
                  const cards = reviewCardsFor(bank[examId] ?? [], e.result!.wrong, e.key);
                  const { added, updated } = saveReviewCards(cards);
                  setCardState(
                    added || updated
                      ? [
                          added ? `Đã thêm ${added} thẻ` : "",
                          updated ? `cập nhật ${updated} thẻ` : "",
                        ]
                          .filter(Boolean)
                          .join(", ")
                      : "Các câu sai này chưa bóc được từ file đáp án",
                  );
                }}
                disabled={cardState === "working"}
                className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
              >
                <Layers size={13} />
                {cardState === "working"
                  ? "Đang tạo…"
                  : cardState === "idle"
                    ? `Tạo thẻ ôn từ ${e.result.wrong.length} câu sai`
                    : cardState}
              </button>
            )}
            {scaled && (
              <p className="text-[10px] leading-relaxed text-muted-foreground">
                Đề này {e.result.total} câu còn {scaled.part.label.split(" — ")[0]} thi thật{" "}
                {scaled.part.questions} câu, nên tỉ lệ đúng được quy đổi sang thang đó. Cần{" "}
                {scaled.target}/{scaled.part.questions} để tính là đạt. Lưu cũng ghi lỗi vào nhật ký
                chủ đề “{topic}”.
              </p>
            )}
          </>
        ) : (
          <>
            {e.keyReady ? (
              <>
                <button
                  onClick={e.submit}
                  disabled={answered === 0}
                  className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:brightness-110 disabled:opacity-40"
                >
                  <ClipboardCheck size={13} />
                  {answered === 0
                    ? "Chọn đáp án rồi chấm"
                    : `Chấm bài · ${answered}/${e.questions}`}
                </button>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Đáp án đúng chỉ hiện sau khi bấm chấm — làm xong hãy chấm để còn biết mình sai ở
                  đâu.
                </p>
              </>
            ) : (
              <p className="text-[11px] leading-relaxed text-muted-foreground">
                Làm bài rồi dán đáp án đúng vào đây để tự chấm. Nhập một lần, lần sau app tự chấm.
              </p>
            )}
          </>
        )}

        {e.usingAuto && (
          <p className="text-[10px] leading-relaxed text-muted-foreground">
            Đáp án lấy tự động từ file đáp án của đề này. Nếu thấy lệch, bấm “Sửa đáp án đúng” để
            nhập tay — bản nhập tay luôn được ưu tiên.
          </p>
        )}

        {keyOpen || !e.keyReady ? (
          <div className="space-y-1.5">
            <label htmlFor={`key-${examId}`} className="text-[11px] font-medium text-foreground">
              Đáp án đúng ({e.keyLength}/{e.questions})
            </label>
            <textarea
              id={`key-${examId}`}
              value={e.keyText}
              onChange={(ev) => e.setKeyText(ev.target.value)}
              rows={2}
              placeholder="CABDA… hoặc 1.C 2.A 3.B"
              className="w-full resize-y rounded-lg border border-border bg-background/70 p-2 font-mono text-[11px] text-foreground outline-none focus:border-ring"
            />
            <p className="text-[10px] leading-relaxed text-muted-foreground">
              Chỉ chữ A–D được đọc, số và dấu bị bỏ qua — gõ liền hay có số thứ tự đều được.
            </p>
          </div>
        ) : (
          <button
            onClick={() => setKeyOpen(true)}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <KeyRound size={12} /> Sửa đáp án đúng
          </button>
        )}

        {e.submitted && (
          <button
            onClick={e.unsubmit}
            className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
          >
            <Undo2 size={12} /> Giấu đáp án, làm tiếp
          </button>
        )}

        <button
          onClick={e.clearAnswers}
          className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <Eraser size={12} /> Xoá lựa chọn để làm lại
          {e.inProgress && <span className="text-muted-foreground/70">· đồng hồ vẫn chạy</span>}
        </button>
      </div>
    </div>
  );
}
