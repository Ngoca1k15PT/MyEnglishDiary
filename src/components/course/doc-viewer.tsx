import { useEffect, useMemo, useRef, useState } from "react";
import { Columns2, Eye, ExternalLink, Lock, Maximize2, Square } from "lucide-react";
import type { CourseItem, CourseItemKind } from "@/data/course-types";
import { KIND_LABEL } from "@/lib/course";

const KIND_DOT: Record<CourseItemKind, string> = {
  theory: "bg-study-article",
  question: "bg-study-practice",
  answer: "bg-study-video",
  audio: "bg-study-audio",
  image: "bg-study-article",
  other: "bg-muted-foreground",
};

type Props = {
  docs: CourseItem[];
  urlOf: (item: CourseItem) => string;
  /** Changes whenever the lesson/group changes, so selection and reveals reset. */
  resetKey: string;
  /**
   * Điều kiện mở tab đáp án. Bỏ trống nghĩa là bài này không có phiếu trả lời
   * nên không có gì để căn cứ — cứ cho mở như cũ.
   */
  answerGate?: AnswerGate | undefined;
};

export type AnswerGate = {
  /** Đã làm và chấm bài chưa. */
  allowed: boolean;
  answered: number;
  total: number;
};

/**
 * Fit-to-width is the readable default for these scanned worksheets, and hiding
 * the thumbnail rail buys back ~25% of the pane (still reachable from the
 * viewer's own toolbar).
 */
function viewerUrl(url: string) {
  return `${url}#view=FitH&navpanes=0`;
}

function Pane({
  doc,
  url,
  revealed,
  onReveal,
  gate,
}: {
  doc: CourseItem;
  url: string;
  revealed: boolean;
  onReveal: () => void;
  gate?: AnswerGate | undefined;
}) {
  if (doc.kind === "answer" && !revealed) {
    // Chưa làm bài thì không mở được — nếu không, tab Đáp án thành đường tắt
    // đi vòng qua chính bài luyện mà người học định làm.
    if (gate && !gate.allowed) {
      return (
        <div className="flex h-full flex-col items-center justify-center gap-4 bg-muted/20 p-8 text-center">
          <Lock size={20} className="text-muted-foreground" />
          <p className="max-w-xs text-sm leading-relaxed text-foreground">Làm bài trước đã.</p>
          <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">
            {gate.answered === 0
              ? `Mở Phiếu trả lời bên phải, chọn đáp án cho ${gate.total} câu rồi bấm “Chấm bài”. Xong mới mở được đáp án.`
              : `Bạn mới trả lời ${gate.answered}/${gate.total} câu. Làm nốt rồi bấm “Chấm bài” trong Phiếu trả lời là đáp án mở ra.`}
          </p>
        </div>
      );
    }

    return (
      <div className="flex h-full flex-col items-center justify-center gap-4 bg-muted/20 p-8 text-center">
        <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
          Đáp án đang được che. Làm xong đề rồi mở ra thì bài luyện mới có giá trị.
        </p>
        <button
          onClick={onReveal}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02]"
        >
          <Eye size={15} /> Hiện đáp án
        </button>
      </div>
    );
  }

  return (
    <iframe
      key={url}
      src={viewerUrl(url)}
      title={doc.label}
      className="h-full w-full border-0 bg-white"
    />
  );
}

export function DocViewer({ docs, urlOf, resetKey, answerGate }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [primary, setPrimary] = useState<string | null>(null);
  const [secondary, setSecondary] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());

  const bySrc = useMemo(() => new Map(docs.map((d) => [d.src, d])), [docs]);

  // Open on something readable: the answer key should never be the landing view.
  useEffect(() => {
    setPrimary((docs.find((d) => d.kind !== "answer") ?? docs[0])?.src ?? null);
    setSecondary(null);
    setRevealed(new Set());
  }, [resetKey, docs]);

  const primaryDoc = primary ? bySrc.get(primary) : undefined;
  const secondaryDoc = secondary ? bySrc.get(secondary) : undefined;

  const reveal = (src: string) => setRevealed((s) => new Set(s).add(src));

  const splitCandidate =
    docs.find((d) => d.src !== primary && d.kind === "answer") ??
    docs.find((d) => d.src !== primary);

  if (docs.length === 0) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
        Bài này chỉ có file nghe — dùng thanh phát ở dưới.
      </div>
    );
  }

  return (
    <div ref={wrapRef} className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex flex-wrap items-center gap-1.5 border-b border-border px-3 py-2">
        {docs.map((d) => (
          <button
            key={d.src}
            onClick={() => setPrimary(d.src)}
            className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] transition-colors ${
              primary === d.src
                ? "border-ring bg-accent text-foreground"
                : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
            }`}
          >
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_DOT[d.kind]}`} />
            <span className="max-w-[11rem] truncate">{d.label}</span>
            <span className="opacity-50">{KIND_LABEL[d.kind]}</span>
          </button>
        ))}

        <span className="ml-auto flex items-center gap-1">
          {splitCandidate && (
            <button
              onClick={() => setSecondary(secondary ? null : splitCandidate.src)}
              title="Chia đôi màn hình để đối chiếu đề với đáp án"
              className={`inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11px] transition-colors ${
                secondary
                  ? "border-ring bg-accent text-foreground"
                  : "border-border text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
            >
              {secondary ? <Square size={12} /> : <Columns2 size={12} />}
              {secondary ? "Một cột" : "Chia đôi"}
            </button>
          )}
          <button
            onClick={() => {
              if (document.fullscreenElement) void document.exitFullscreen();
              else void wrapRef.current?.requestFullscreen();
            }}
            title="Toàn màn hình"
            aria-label="Toàn màn hình"
            className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Maximize2 size={12} />
          </button>
          {primaryDoc && (
            <a
              href={urlOf(primaryDoc)}
              target="_blank"
              rel="noopener noreferrer"
              title="Mở ở tab mới"
              aria-label="Mở ở tab mới"
              className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <ExternalLink size={12} />
            </a>
          )}
        </span>
      </div>

      <div
        className={`min-h-0 flex-1 ${secondaryDoc ? "grid grid-cols-1 gap-px bg-border lg:grid-cols-2" : ""}`}
      >
        {primaryDoc && (
          <Pane
            doc={primaryDoc}
            url={urlOf(primaryDoc)}
            revealed={revealed.has(primaryDoc.src)}
            onReveal={() => reveal(primaryDoc.src)}
            gate={answerGate}
          />
        )}
        {secondaryDoc && (
          <div className="flex min-h-0 flex-col">
            <div className="flex items-center gap-2 border-b border-border bg-card/50 px-3 py-1.5">
              <span
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${KIND_DOT[secondaryDoc.kind]}`}
              />
              <select
                value={secondaryDoc.src}
                onChange={(e) => setSecondary(e.target.value)}
                aria-label="Tài liệu cột phải"
                className="min-w-0 flex-1 bg-transparent text-[11px] text-foreground outline-none"
              >
                {docs.map((d) => (
                  <option key={d.src} value={d.src} className="bg-card">
                    {d.label} · {KIND_LABEL[d.kind]}
                  </option>
                ))}
              </select>
            </div>
            <div className="min-h-0 flex-1">
              <Pane
                doc={secondaryDoc}
                url={urlOf(secondaryDoc)}
                revealed={revealed.has(secondaryDoc.src)}
                onReveal={() => reveal(secondaryDoc.src)}
                gate={answerGate}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
