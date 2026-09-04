import { useMemo, useState } from "react";
import { Check, X, Volume2, RotateCcw, ArrowLeft } from "lucide-react";
import type { QuizLesson } from "@/data/lesson-types";
import { pickQuestions, type QuizHistory } from "@/lib/quiz-pick";

type Props = {
  lesson: QuizLesson;
  title: string;
  history?: QuizHistory;
  /** Wording for the exit button, for hosts that aren't the star map. */
  closeLabel?: string;
  onFinish: (pct: number, seen: string[], wrong: string[]) => void;
  onClose: () => void;
};

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-GB";
  u.rate = 0.9;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

export function QuizSession({
  lesson,
  title,
  history,
  closeLabel = "Về bản đồ",
  onFinish,
  onClose,
}: Props) {
  const [round, setRound] = useState(0);
  const qs = useMemo(
    () => pickQuestions(lesson.nodeId, lesson.questions, history ?? {}),
    // rút đề mới mỗi lần bấm "Làm lại"
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [lesson.nodeId, lesson.questions, round],
  );
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answers, setAnswers] = useState<number[]>([]);
  const [done, setDone] = useState(false);

  const q = qs[i];
  const correct = useMemo(
    () => answers.filter((a, idx) => a === qs[idx]?.answer).length,
    [answers, qs],
  );
  const pct = qs.length ? correct / qs.length : 0;

  const pick = (idx: number) => {
    if (picked !== null) return;
    setPicked(idx);
    setAnswers((a) => [...a, idx]);
  };

  const next = () => {
    setPicked(null);
    if (i + 1 < qs.length) setI(i + 1);
    else {
      setDone(true);
      const seen = qs.map((qq) => qq.id);
      const wrongIds = qs.filter((qq, idx) => answers[idx] !== qq.answer).map((qq) => qq.id);
      onFinish(pct, seen, wrongIds);
    }
  };

  const restart = () => {
    setRound((r) => r + 1);
    setI(0);
    setPicked(null);
    setAnswers([]);
    setDone(false);
  };

  if (done) {
    const wrong = qs.filter((qq, idx) => answers[idx] !== qq.answer);
    const passed = pct >= lesson.threshold;
    return (
      <div className="mx-auto w-full max-w-2xl p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Kết quả</p>
        <h2 className="mt-2 text-3xl font-bold text-foreground">
          {correct}/{qs.length} câu đúng · {Math.round(pct * 100)}%
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {passed
            ? "Đạt ngưỡng — ngôi sao của bạn vừa sáng thêm. Quay lại sau 3 ngày làm lại để sáng trọn 100%."
            : `Cần ${Math.round(lesson.threshold * 100)}% để thắp sao. Xem lại phần giải thích rồi làm lại nhé.`}
        </p>

        {wrong.length > 0 && (
          <section className="mt-6 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Câu làm sai</h3>
            {wrong.map((w) => (
              <div key={w.id} className="rounded-xl border border-border p-4">
                <p className="text-sm font-medium text-foreground">{w.prompt}</p>
                <p className="mt-1 text-sm text-star-done">Đáp án đúng: {w.options[w.answer]}</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{w.explain}</p>
              </div>
            ))}
          </section>
        )}

        <div className="mt-8 flex gap-3">
          <button
            onClick={restart}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm font-medium text-foreground hover:bg-accent"
          >
            <RotateCcw size={15} /> Làm lại
          </button>
          <button
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            <ArrowLeft size={15} /> {closeLabel}
          </button>
        </div>
      </div>
    );
  }

  if (!q) return null;

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col p-6">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-star-done transition-[width] duration-500"
          style={{ width: `${((i + (picked !== null ? 1 : 0)) / qs.length) * 100}%` }}
        />
      </div>
      <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
        {title} · Câu {i + 1}/{qs.length}
      </p>

      <div className="mt-4 flex items-start gap-3">
        <h2 className="text-xl font-semibold leading-relaxed text-foreground">{q.prompt}</h2>
        {q.speak && (
          <button
            onClick={() => speak(q.speak!)}
            aria-label="Nghe đọc mẫu"
            className="mt-1 shrink-0 rounded-full border border-border p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <Volume2 size={16} />
          </button>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {q.options.map((o, idx) => {
          const isAnswer = idx === q.answer;
          const chosen = picked === idx;
          const state = picked === null ? "idle" : isAnswer ? "right" : chosen ? "wrong" : "idle";
          return (
            <button
              key={o}
              onClick={() => pick(idx)}
              disabled={picked !== null}
              className={`flex w-full items-center justify-between gap-3 rounded-xl border px-5 py-4 text-left text-base transition-colors ${
                state === "right"
                  ? "border-star-done bg-star-done/10 text-foreground"
                  : state === "wrong"
                    ? "border-destructive bg-destructive/10 text-foreground"
                    : "border-border text-foreground hover:bg-accent"
              }`}
            >
              <span>{o}</span>
              {state === "right" && <Check size={18} className="text-star-done" />}
              {state === "wrong" && <X size={18} className="text-destructive" />}
            </button>
          );
        })}
      </div>

      {picked !== null && (
        <div className="mt-6 rounded-xl border border-border bg-card/60 p-4">
          <p className="text-sm font-semibold text-foreground">
            {picked === q.answer ? "Chính xác" : "Chưa đúng"}
          </p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{q.explain}</p>
          <button
            onClick={next}
            className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            {i + 1 < qs.length ? "Câu tiếp theo" : "Xem kết quả"}
          </button>
        </div>
      )}
    </div>
  );
}
