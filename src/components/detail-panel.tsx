import { useEffect, useState } from "react";
import { X, Lock, Play, ShieldCheck, PencilLine, Snowflake, ChevronDown } from "lucide-react";
import type { MapNode } from "@/lib/map-layout";
import { PHASES } from "@/data/ielts-map";
import { MyDocsList } from "@/components/my-docs";
import type { MyDoc } from "@/lib/my-docs";
import { setQuickAddMode } from "@/lib/quick-add-bus";
import { StudyLinks } from "@/components/study-links";
import { RichTheory } from "@/components/rich-theory";
import { lessonFor, lessonReady } from "@/data/lessons";
import type { Mastery } from "@/lib/mastery";
import { COLD_THRESHOLD, decayLabel } from "@/lib/decay";

type Props = {
  node: MapNode | null;
  mastery?: Mastery | undefined;
  locked: boolean;
  note: string;
  onClose: () => void;
  onPractice: () => void;
  /** mở phiên phụ cho cùng một nút, ví dụ Part 5 có thêm 30 câu luyện */
  onExtraPractice?: (nodeId: string) => void;
  onNote: (v: string) => void;
  /** link tài liệu riêng của người dùng, đã lọc theo chòm sao của nút */
  myDocs?: MyDoc[];
};

const ACTION: Record<string, string> = {
  quiz: "Luyện — làm bài trắc nghiệm",
  deck: "Luyện — ôn thẻ từ",
  self: "Luyện — làm bài & tự chấm",
  score: "Nhập điểm luyện đề",
};

export function DetailPanel({
  node,
  mastery,
  locked,
  note,
  onClose,
  onPractice,
  onExtraPractice,
  onNote,
  myDocs = [],
}: Props) {
  const open = !!node;
  const phase = node ? PHASES.find((p) => p.id === node.phaseId) : undefined;
  const item = node?.item;
  const lesson = item ? lessonFor(item.id) : null;
  const ready = item ? lessonReady(item.id) : false;
  const rich = lesson && "richTheory" in lesson ? lesson.richTheory : undefined;
  const pct = Math.round((mastery?.brightness ?? 0) * 100);
  // Sao từng sáng nhưng đã nguội thì gấp lý thuyết lại — người học phải chủ động
  // mở ra ôn, chứ không lướt qua như thể vẫn còn nhớ.
  const cold = Boolean(
    mastery && mastery.decay.decaying && mastery.brightness < COLD_THRESHOLD && mastery.peak > 0,
  );
  const [theoryOpen, setTheoryOpen] = useState(false);
  useEffect(() => setTheoryOpen(false), [node?.id]);
  const isSelf = mastery?.verification === "self";

  return (
    <aside
      className={`fixed inset-x-0 bottom-0 z-30 flex max-h-[85dvh] w-full flex-col rounded-t-3xl border-t border-border bg-card/95 backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] md:inset-x-auto md:right-0 md:top-0 md:h-full md:max-h-none md:max-w-md md:rounded-none md:border-l md:border-t-0 ${
        open
          ? "translate-y-0 md:translate-x-0"
          : "translate-y-full md:translate-y-0 md:translate-x-full"
      }`}
      aria-hidden={!open}
    >
      <div className="mx-auto mt-2 h-1 w-10 shrink-0 rounded-full bg-muted md:hidden" />
      {node && (
        <>
          <header className="border-b border-border p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  {phase?.label} · {phase?.duration}
                </p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">{node.label}</h2>
              </div>
              <button
                onClick={onClose}
                aria-label="Đóng"
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X size={18} />
              </button>
            </div>

            {item && (
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    {isSelf ? <PencilLine size={12} /> : <ShieldCheck size={12} />}
                    {isSelf ? "Tự đánh giá" : "Chấm bằng bài làm"}
                  </span>
                  <span className="font-semibold text-star-done">Độ sáng {pct}%</span>
                </div>
                <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className={`h-full rounded-full transition-[width] duration-700 ${
                      isSelf ? "bg-star-doing" : "bg-star-done"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <p className="mt-2 text-[11px] text-muted-foreground">{mastery?.detail}</p>
              </div>
            )}
          </header>

          <div className="flex-1 space-y-6 overflow-y-auto no-scrollbar p-6">
            {locked && (
              <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                <Lock size={16} className="mt-0.5 shrink-0" />
                <span>
                  Phần này còn khoá. Chòm TOEIC mở khi Nền tảng sáng ≥50%, chòm IELTS mở khi TOEIC
                  sáng ≥60% (hoặc tự mở trong Cài đặt).
                </span>
              </div>
            )}

            <p className="text-sm leading-relaxed text-muted-foreground">
              {item?.desc ?? phaseDesc(node)}
            </p>

            {item && lesson && (
              <section>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Học</h3>
                {cold && !theoryOpen ? (
                  <button
                    onClick={() => setTheoryOpen(true)}
                    className="flex w-full items-start gap-3 rounded-lg border border-border bg-muted/40 p-4 text-left transition-colors hover:bg-accent"
                  >
                    <Snowflake size={16} className="mt-0.5 shrink-0 text-study-article" />
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-foreground">
                        Phần này đã nguội
                      </span>
                      <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                        Bạn để {mastery?.decay.idleDays} ngày chưa ôn. Mở ra đọc lại rồi luyện để
                        sao sáng trở lại.
                      </span>
                    </span>
                    <ChevronDown size={15} className="mt-0.5 shrink-0 text-muted-foreground" />
                  </button>
                ) : rich ? (
                  <RichTheory text={rich} />
                ) : (
                  <ul className="space-y-2">
                    {lesson.theory.map((t) => (
                      <li
                        key={t}
                        className="flex gap-2 text-sm leading-relaxed text-muted-foreground"
                      >
                        <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-star-done" />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}

            {item && mastery?.decay.decaying && (
              <p className="rounded-lg border border-study-article/40 bg-study-article/10 p-3 text-xs leading-relaxed text-foreground">
                {decayLabel(mastery.decay)}. Luyện lại một lần là sáng về{" "}
                {Math.round(mastery.peak * 100)}%.
              </p>
            )}

            {item && mastery?.fading && !mastery.decay.decaying && (
              <p className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
                Có thẻ tới hạn ôn nên sao đang mờ nhẹ. Ôn nhanh vài thẻ là sáng lại ngay.
              </p>
            )}

            {item && (
              <section>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Ghi chú của bạn</h3>
                <textarea
                  value={note}
                  onChange={(e) => onNote(e.target.value)}
                  rows={4}
                  placeholder="Ghi lại lỗi hay gặp, từ mới, cảm nhận..."
                  className="w-full resize-none rounded-lg border border-border bg-background/60 p-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring"
                />
              </section>
            )}

            {item && <MyDocsList docs={myDocs} />}

            {item && (
              <section>
                <h3 className="mb-1 text-sm font-semibold text-foreground">Tham khảo thêm</h3>
                <p className="mb-3 text-xs text-muted-foreground">
                  Tài liệu ngoài, chỉ là phần phụ — đường học chính nằm ngay trong app.
                </p>
                <StudyLinks nodeId={node.id} />
              </section>
            )}
          </div>

          {item && lesson && (
            <footer className="space-y-2 border-t border-border p-6">
              <button
                disabled={locked || !ready}
                onClick={onPractice}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-4 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Play size={16} /> {ACTION[lesson.kind]}
              </button>
              {item.id === "t-p5" && onExtraPractice && (
                <button
                  disabled={locked}
                  onClick={() => onExtraPractice("t-p5-quiz")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-accent/50 px-4 py-3 text-sm font-medium text-foreground transition-all hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Play size={15} /> Luyện 30 câu Part 5
                </button>
              )}
              {item.id.startsWith("my-") && (
                <button
                  onClick={() => setQuickAddMode("dialog")}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-accent/50 px-4 py-3 text-sm font-medium text-foreground hover:bg-accent"
                >
                  <Play size={15} /> Thêm thẻ mới
                </button>
              )}
              {!ready && (
                <p className="text-center text-[11px] text-muted-foreground">
                  {item.id.startsWith("my-")
                    ? "Chưa có thẻ nào. Bấm nút + góc dưới bên phải để thêm từ đầu tiên."
                    : "Nội dung bài học của mục này đang được bổ sung."}
                </p>
              )}
            </footer>
          )}
        </>
      )}
    </aside>
  );
}

function phaseDesc(node: MapNode) {
  const phase = PHASES.find((p) => p.id === node.phaseId);
  if (node.kind === "phase") return phase?.desc ?? "";
  return "Nhóm nội dung trong giai đoạn này. Bấm vào từng ngôi sao con để vào học.";
}
