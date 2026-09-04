import { useEffect, useRef, useState } from "react";
import { ArrowLeft, Mic, Square, Play, Timer } from "lucide-react";
import type { SelfLesson } from "@/data/lesson-types";

type Props = {
  lesson: SelfLesson;
  title: string;
  checked: string[];
  onSave: (checks: string[], total: number) => void;
  onClose: () => void;
};

function countWords(s: string) {
  return s.trim() ? s.trim().split(/\s+/).length : 0;
}

export function SelfSession({ lesson, title, checked, onSave, onClose }: Props) {
  const [checks, setChecks] = useState<string[]>(checked);
  const [paras, setParas] = useState<string[]>(() => (lesson.outline ?? []).map(() => ""));

  const total = countWords(paras.join(" "));

  const toggle = (c: string) =>
    setChecks((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]));

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 p-6">
      <div>
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {title} · Tự đánh giá
        </p>
        <h2 className="mt-2 text-xl font-semibold leading-relaxed text-foreground">
          {lesson.prompt}
        </h2>
        <p className="mt-2 inline-flex rounded-full border border-dashed border-border px-3 py-1 text-[11px] text-muted-foreground">
          Phần này máy không chấm được — sao sẽ được đánh dấu là “tự đánh giá”.
        </p>
      </div>

      {lesson.mode === "speaking" && <SpeakingTools lesson={lesson} />}

      {lesson.mode === "writing" && lesson.outline && (
        <section className="space-y-4">
          {lesson.outline.map((o, i) => (
            <div key={o.label}>
              <div className="flex items-baseline justify-between">
                <label className="text-sm font-semibold text-foreground" htmlFor={`p-${i}`}>
                  {o.label}
                </label>
                <span className="text-xs text-muted-foreground">
                  {countWords(paras[i] ?? "")}/{o.minWords} từ
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{o.hint}</p>
              <textarea
                id={`p-${i}`}
                rows={4}
                value={paras[i] ?? ""}
                onChange={(e) =>
                  setParas((p) => p.map((v, idx) => (idx === i ? e.target.value : v)))
                }
                className="mt-2 w-full resize-none rounded-xl border border-border bg-background/60 p-3 text-sm text-foreground outline-none focus:border-ring"
              />
            </div>
          ))}
          <p className="text-sm text-muted-foreground">Tổng: {total} từ</p>
        </section>
      )}

      <section>
        <h3 className="mb-3 text-sm font-semibold text-foreground">Checklist tự chấm</h3>
        <div className="space-y-2">
          {lesson.checklist.map((c) => (
            <button
              key={c}
              onClick={() => toggle(c)}
              className={`flex min-h-11 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm ${
                checks.includes(c)
                  ? "border-star-done bg-star-done/10 text-foreground"
                  : "border-border text-muted-foreground hover:bg-accent"
              }`}
            >
              <span
                className={`h-4 w-4 shrink-0 rounded border ${
                  checks.includes(c) ? "border-star-done bg-star-done" : "border-border"
                }`}
              />
              {c}
            </button>
          ))}
        </div>
      </section>

      <div className="flex gap-3 pb-6">
        <button
          onClick={onClose}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm"
        >
          <ArrowLeft size={15} /> Về bản đồ
        </button>
        <button
          onClick={() => {
            onSave(checks, lesson.checklist.length);
            onClose();
          }}
          className="flex-1 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
        >
          Lưu tự đánh giá ({checks.length}/{lesson.checklist.length})
        </button>
      </div>
    </div>
  );
}

function SpeakingTools({ lesson }: { lesson: SelfLesson }) {
  const [left, setLeft] = useState<number | null>(null);
  const [label, setLabel] = useState<string>("");
  const [recording, setRecording] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const rec = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => {
    if (left === null) return;
    if (left <= 0) return;
    const t = window.setTimeout(() => setLeft((v) => (v === null ? null : v - 1)), 1000);
    return () => clearTimeout(t);
  }, [left]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunks.current = [];
      mr.ondataavailable = (e) => chunks.current.push(e.data);
      mr.onstop = () => {
        setUrl(URL.createObjectURL(new Blob(chunks.current, { type: "audio/webm" })));
        stream.getTracks().forEach((t) => t.stop());
      };
      mr.start();
      rec.current = mr;
      setRecording(true);
    } catch {
      setRecording(false);
    }
  };

  const stop = () => {
    rec.current?.stop();
    setRecording(false);
  };

  return (
    <section className="rounded-2xl border border-border bg-card/60 p-5">
      <div className="flex flex-wrap items-center gap-3">
        {(lesson.timers ?? []).map((t) => (
          <button
            key={t.label}
            onClick={() => {
              setLabel(t.label);
              setLeft(t.seconds);
            }}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-foreground hover:bg-accent"
          >
            <Timer size={15} /> {t.label} {Math.round(t.seconds / 60)} phút
          </button>
        ))}
        {left !== null && (
          <span className="text-lg font-semibold tabular-nums text-star-done">
            {label} {String(Math.floor(left / 60)).padStart(2, "0")}:
            {String(left % 60).padStart(2, "0")}
          </span>
        )}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {!recording ? (
          <button
            onClick={start}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            <Mic size={15} /> Ghi âm
          </button>
        ) : (
          <button
            onClick={stop}
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-destructive px-4 py-2 text-sm font-semibold text-destructive-foreground"
          >
            <Square size={15} /> Dừng
          </button>
        )}
        {url && (
          <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
            <Play size={14} /> Nghe lại bản ghi
          </span>
        )}
      </div>
      {url && <audio className="mt-3 w-full" controls src={url} />}
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Bản ghi chỉ nằm trong máy bạn, không gửi đi đâu cả.
      </p>
    </section>
  );
}
