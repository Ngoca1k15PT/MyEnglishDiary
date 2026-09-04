import { Dumbbell, Trash2 } from "lucide-react";
import type { TopicStat } from "@/lib/course-exam";

type Props = {
  topics: TopicStat[];
  overall: { tests: number; questions: number; correct: number; percent: number };
  /** Jumps the lesson list to that topic. */
  onPickTopic: (topic: string) => void;
  /** Topics that have extracted questions behind them, mapped to their exams. */
  quizableTopics: Map<string, string[]>;
  onQuizTopic: (topic: string) => void;
  onClear: () => void;
};

export function ErrorLog({
  topics,
  overall,
  onPickTopic,
  quizableTopics,
  onQuizTopic,
  onClear,
}: Props) {
  if (topics.length === 0) {
    return (
      <div className="p-4 text-[11px] leading-relaxed text-muted-foreground">
        Chưa có đề nào được chấm. Làm một đề trong phiếu trả lời rồi bấm Lưu — mỗi lần lưu, tỉ lệ
        sai của chủ đề đó được cộng vào đây để bạn biết nên ôn phần nào.
      </div>
    );
  }

  const worst = topics.filter((t) => t.rate > 0).slice(0, 3);

  return (
    <div className="space-y-3 p-3">
      <div>
        <p className="text-sm font-semibold text-foreground">
          {overall.correct}/{overall.questions} đúng · {overall.percent}%
        </p>
        <p className="text-[11px] text-muted-foreground">
          {overall.tests} đề đã chấm, gộp theo chủ đề
        </p>
      </div>

      {worst.length > 0 && (
        <p className="rounded-lg border border-border bg-muted/30 p-2 text-[11px] leading-relaxed text-muted-foreground">
          Sai nhiều nhất:{" "}
          <span className="text-foreground">{worst.map((t) => t.topic).join(", ")}</span>. Ôn lại
          phần lý thuyết của những chủ đề này trước khi làm đề mới.
        </p>
      )}

      <ul className="space-y-1.5">
        {topics.map((t) => {
          const percent = Math.round(t.rate * 100);
          const canQuiz = (quizableTopics.get(t.topic)?.length ?? 0) > 0;
          return (
            <li key={t.topic} className="rounded-lg px-2 py-1.5 hover:bg-accent/50">
              <div className="flex items-baseline gap-2">
                <button
                  onClick={() => onPickTopic(t.topic)}
                  title={`Tìm các bài về ${t.topic}`}
                  className="min-w-0 flex-1 truncate text-left text-[11px] text-foreground hover:underline"
                >
                  {t.topic}
                </button>
                <span className="shrink-0 text-[11px] tabular-nums text-muted-foreground">
                  {t.wrong}/{t.questions} sai
                </span>
              </div>

              <div className="mt-1 flex items-center gap-2">
                <span className="h-1 flex-1 overflow-hidden rounded-full bg-muted">
                  <span
                    className={`block h-full rounded-full ${
                      percent >= 40
                        ? "bg-destructive"
                        : percent >= 20
                          ? "bg-star-doing"
                          : "bg-star-done"
                    }`}
                    style={{ width: `${Math.max(percent, 2)}%` }}
                  />
                </span>
                <span className="w-8 shrink-0 text-right text-[10px] tabular-nums text-muted-foreground">
                  {percent}%
                </span>
              </div>

              {canQuiz && (
                <button
                  onClick={() => onQuizTopic(t.topic)}
                  className="mt-1.5 inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Dumbbell size={10} /> Luyện 10 câu
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <button
        onClick={onClear}
        className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground hover:text-destructive"
      >
        <Trash2 size={12} /> Xoá nhật ký
      </button>
    </div>
  );
}
