import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import type { ScoreLesson } from "@/data/lesson-types";
import type { ScoreRecord } from "@/lib/mastery";

type Props = {
  lesson: ScoreLesson;
  title: string;
  history: ScoreRecord[];
  onSave: (score: number, target: number) => void;
  onClose: () => void;
};

export function ScoreSession({ lesson, title, history, onSave, onClose }: Props) {
  const [value, setValue] = useState("");
  const n = Number(value);
  const valid = value !== "" && !Number.isNaN(n) && n >= 0 && n <= lesson.max;

  let streak = 0;
  for (let i = history.length - 1; i >= 0; i -= 1) {
    if (history[i]!.pass) streak += 1;
    else break;
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 p-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {title} · Nhập điểm luyện đề
        </p>
        <h2 className="mt-2 text-xl font-semibold text-foreground">
          Mục tiêu: {lesson.target}/{lesson.max} {lesson.unit}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Luật 3 lần liên tiếp: chỉ khi đạt mục tiêu ba lần liên tiếp thì ngôi sao mới sáng trọn.
          Một lần trượt là đếm lại từ đầu.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 p-5">
        <label htmlFor="score" className="text-sm font-medium text-foreground">
          Số {lesson.unit} lần này
        </label>
        <input
          id="score"
          inputMode="numeric"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={`0 – ${lesson.max}`}
          className="mt-3 w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-base text-foreground outline-none focus:border-ring"
        />
        <button
          disabled={!valid}
          onClick={() => {
            onSave(n, lesson.target);
            setValue("");
          }}
          className="mt-4 w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-40"
        >
          Lưu kết quả
        </button>
        <p className="mt-3 text-sm text-star-done">Chuỗi đạt hiện tại: {streak}/3</p>
      </div>

      {history.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Lịch sử gần đây</h3>
          <ul className="space-y-2">
            {[...history]
              .slice(-8)
              .reverse()
              .map((h, i) => (
                <li
                  key={`${h.at}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-border px-4 py-2 text-sm"
                >
                  <span className="text-muted-foreground">{h.at}</span>
                  <span className={h.pass ? "text-star-done" : "text-muted-foreground"}>
                    {h.score}/{lesson.max} {h.pass ? "· đạt" : "· chưa đạt"}
                  </span>
                </li>
              ))}
          </ul>
        </section>
      )}

      <button
        onClick={onClose}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm"
      >
        <ArrowLeft size={15} /> Về bản đồ
      </button>
    </div>
  );
}
