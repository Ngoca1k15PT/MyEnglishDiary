import { useEffect, useState } from "react";
import {
  ExternalLink,
  Clock,
  Sparkles,
  Video,
  FileText,
  PenLine,
  Volume2,
  Check,
  Play,
} from "lucide-react";
import { handleExternalClick, useOpenedLinks } from "@/lib/external-link";
import { handleWatchClick } from "@/components/video-player";
import { isYouTube } from "@/lib/youtube";
import { getStudyLinks, KIND_META, type StudyLink } from "@/data/study-links";

const KIND_ICON = {
  video: Video,
  article: FileText,
  practice: PenLine,
  audio: Volume2,
} as const;

const KIND_CLASS: Record<StudyLink["kind"], string> = {
  video: "text-study-video border-study-video/40 bg-study-video/10",
  article: "text-study-article border-study-article/40 bg-study-article/10",
  practice: "text-study-practice border-study-practice/40 bg-study-practice/10",
  audio: "text-study-audio border-study-audio/40 bg-study-audio/10",
};

type Props = { nodeId: string; highlightFirst?: boolean; showBackHint?: boolean };

export function StudyLinks({ nodeId, highlightFirst, showBackHint = true }: Props) {
  const links = getStudyLinks(nodeId);
  const [clicked, setClicked] = useState(false);
  const [backHint, setBackHint] = useState(false);
  const wasOpened = useOpenedLinks();

  useEffect(() => {
    setClicked(false);
    setBackHint(false);
  }, [nodeId]);

  useEffect(() => {
    if (!clicked || !showBackHint) return;
    const onBack = () => {
      if (document.visibilityState === "visible") setBackHint(true);
    };
    document.addEventListener("visibilitychange", onBack);
    window.addEventListener("focus", onBack);
    return () => {
      document.removeEventListener("visibilitychange", onBack);
      window.removeEventListener("focus", onBack);
    };
  }, [clicked, showBackHint]);

  if (links.length === 0) return null;

  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
        <Sparkles size={15} className="text-star-done" />
        Học ngay
      </h3>

      <div className="flex flex-col gap-2">
        {links.map((l, i) => {
          const meta = KIND_META[l.kind];
          const featured = highlightFirst && i === 0;
          // Video YouTube phát ngay trong web; link khác vẫn mở tab mới.
          const inApp = isYouTube(l.url);
          return (
            <a
              key={l.url + i}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => {
                setClicked(true);
                if (inApp) {
                  handleWatchClick(l.url, {
                    title: l.source,
                    onClose: () => showBackHint && setBackHint(true),
                  })(e);
                } else {
                  handleExternalClick(l.url)(e);
                }
              }}
              className={`flex min-h-[44px] items-start gap-3 rounded-xl border px-3 py-3 transition-colors hover:bg-accent ${
                featured ? "border-star-done/50 bg-star-done/10" : "border-border"
              }`}
            >
              <span
                aria-hidden
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border ${KIND_CLASS[l.kind]}`}
              >
                {(() => {
                  const Icon = KIND_ICON[l.kind];
                  return <Icon size={15} />;
                })()}
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="text-sm font-semibold text-foreground">{l.source}</span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${KIND_CLASS[l.kind]}`}
                  >
                    {meta.label}
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                  {l.desc}
                </span>
                {l.time && (
                  <span className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                    <Clock size={11} /> {l.time}
                  </span>
                )}
              </span>
              {wasOpened(l.url) ? (
                <Check size={15} aria-label="Đã mở" className="mt-1 shrink-0 text-star-done/60" />
              ) : inApp ? (
                <Play
                  size={14}
                  aria-label="Phát trong web"
                  className="mt-1 shrink-0 text-study-video"
                />
              ) : (
                <ExternalLink size={14} className="mt-1 shrink-0 text-muted-foreground" />
              )}
            </a>
          );
        })}
      </div>

      {backHint && (
        <p className="mt-3 rounded-lg border border-star-done/40 bg-star-done/10 px-3 py-2 text-xs text-foreground">
          Học xong rồi chứ? Đánh dấu nhé.
        </p>
      )}

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Tài liệu miễn phí của bên thứ ba. Video YouTube phát thẳng trong web bằng trình phát chính
        thức của YouTube — mục nào có nhiều lựa chọn thì bạn đổi video ngay trong khung phát. Link
        không phải video vẫn mở ở tab mới.
      </p>
    </section>
  );
}
