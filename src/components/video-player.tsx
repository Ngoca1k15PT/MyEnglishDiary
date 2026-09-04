import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { ExternalLink, Loader2, Play, X } from "lucide-react";
import { handleExternalClick, markOpened, openExternal } from "@/lib/external-link";
import { embedSrc, parseYouTube, thumbUrl, watchUrl, type YouTubeTarget } from "@/lib/youtube";
import { lookupYouTube, type YtVideo } from "@/lib/youtube-lookup";

/* ---------------- store ---------------- */

export type WatchRequest = {
  url: string;
  title?: string | undefined;
  /** Gọi khi người học đóng trình phát — dùng để nhắc đánh dấu đã học. */
  onClose?: (() => void) | undefined;
};

let request: WatchRequest | null = null;
const listeners = new Set<() => void>();

function setRequest(next: WatchRequest | null) {
  request = next;
  listeners.forEach((l) => l());
}

function useRequest() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => request,
    () => null,
  );
}

/** Mở trình phát trong web. Link không phải YouTube thì mở tab mới như cũ. */
export function openVideo(req: WatchRequest) {
  if (!parseYouTube(req.url)) {
    openExternal(req.url);
    return;
  }
  markOpened(req.url);
  setRequest(req);
}

export function closeVideo() {
  const done = request?.onClose;
  setRequest(null);
  done?.();
}

/**
 * onClick cho thẻ <a>: video YouTube phát trong web, link khác giữ nguyên hành
 * vi cũ. Chuột giữa / cmd / ctrl vẫn mở tab mới như người dùng mong đợi.
 */
export function handleWatchClick(url: string, opts?: Omit<WatchRequest, "url">) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
      markOpened(url);
      return;
    }
    if (!parseYouTube(url)) {
      handleExternalClick(url)(e);
      return;
    }
    e.preventDefault();
    openVideo({ url, ...opts });
  };
}

/* ---------------- player ---------------- */

type Resolved = {
  status: "ready" | "loading" | "error";
  videoId?: string | undefined;
  list?: string | undefined;
  start?: number | undefined;
  videos: YtVideo[];
};

function useResolved(target: YouTubeTarget | null): Resolved {
  const [remote, setRemote] = useState<Resolved>({ status: "loading", videos: [] });

  const key = target ? JSON.stringify(target) : "";
  const needsLookup = target?.kind === "search" || target?.kind === "channel";

  useEffect(() => {
    if (!needsLookup || !target) return;
    let alive = true;
    setRemote({ status: "loading", videos: [] });

    lookupYouTube({
      data:
        target.kind === "search"
          ? { kind: "search", q: target.query }
          : { kind: "channel", q: target.handle },
    })
      .then((res) => {
        if (!alive) return;
        if (res.videos.length === 0 && !res.list) {
          setRemote({ status: "error", videos: [] });
          return;
        }
        setRemote({
          status: "ready",
          videoId: res.videos[0]?.id,
          list: res.videos.length > 0 ? undefined : res.list,
          videos: res.videos,
        });
      })
      .catch(() => alive && setRemote({ status: "error", videos: [] }));

    return () => {
      alive = false;
    };
    // key gói trọn nội dung target; target là object mới mỗi lần render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, needsLookup]);

  if (!target) return { status: "loading", videos: [] };
  if (target.kind === "video")
    return {
      status: "ready",
      videoId: target.videoId,
      list: target.list,
      start: target.start,
      videos: [],
    };
  if (target.kind === "playlist") return { status: "ready", list: target.list, videos: [] };
  return remote;
}

function Rail({
  videos,
  activeId,
  onPick,
}: {
  videos: YtVideo[];
  activeId?: string | undefined;
  onPick: (id: string) => void;
}) {
  return (
    <div className="flex min-h-0 flex-1 flex-col border-t border-border lg:w-80 lg:flex-none lg:border-l lg:border-t-0">
      <p className="border-b border-border px-3 py-2 text-[11px] font-medium text-muted-foreground">
        {videos.length} video liên quan — chọn video khác nếu chưa hợp
      </p>
      <ul className="min-h-0 flex-1 overflow-y-auto no-scrollbar overscroll-contain p-2">
        {videos.map((v) => (
          <li key={v.id}>
            <button
              onClick={() => onPick(v.id)}
              className={`flex w-full gap-2.5 rounded-lg p-1.5 text-left transition-colors ${
                v.id === activeId ? "bg-accent" : "hover:bg-accent/60"
              }`}
            >
              <span className="relative shrink-0">
                <img
                  src={thumbUrl(v.id)}
                  alt=""
                  loading="lazy"
                  className="h-[3.4rem] w-24 rounded-md object-cover"
                />
                {v.duration && (
                  <span className="absolute bottom-0.5 right-0.5 rounded bg-black/80 px-1 text-[10px] font-medium text-white">
                    {v.duration}
                  </span>
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="line-clamp-2 text-[12px] font-medium leading-snug text-foreground">
                  {v.title}
                </span>
                {v.channel && (
                  <span className="mt-0.5 block truncate text-[11px] text-muted-foreground">
                    {v.channel}
                  </span>
                )}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

function PlayerBody({ req }: { req: WatchRequest }) {
  const target = useMemo(() => parseYouTube(req.url), [req.url]);
  const resolved = useResolved(target);
  const [picked, setPicked] = useState<string | undefined>();

  useEffect(() => setPicked(undefined), [req.url]);

  const videoId = picked ?? resolved.videoId;
  const src =
    resolved.status === "ready" && (videoId || resolved.list)
      ? embedSrc({ videoId, list: picked ? undefined : resolved.list, start: resolved.start })
      : null;

  const external = watchUrl({ videoId, list: resolved.list, fallback: req.url });
  // Với link tìm kiếm, tên video thật rõ ràng hơn nhãn chung "Tìm trên YouTube".
  const heading = resolved.videos.find((v) => v.id === videoId)?.title ?? req.title ?? "Video học";

  return (
    <>
      <header className="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2">
        <Play size={14} className="shrink-0 text-study-video" />
        <h2
          className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground"
          title={heading}
        >
          {heading}
        </h2>
        <a
          href={external}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleExternalClick(external)}
          className="inline-flex min-h-[32px] items-center gap-1.5 rounded-lg border border-border px-2.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ExternalLink size={12} /> Mở trên YouTube
        </a>
        <button
          onClick={closeVideo}
          aria-label="Đóng trình phát"
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X size={16} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="flex w-full shrink-0 items-center justify-center bg-black lg:min-h-0 lg:w-auto lg:flex-1 lg:shrink">
          {src ? (
            <iframe
              key={src}
              src={src}
              title={heading}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              className="aspect-video h-auto max-h-full w-full border-0"
            />
          ) : resolved.status === "loading" ? (
            <p className="flex min-h-[12rem] items-center justify-center gap-2 p-8 text-sm text-white/70">
              <Loader2 size={16} className="animate-spin" /> Đang tìm video…
            </p>
          ) : (
            <div className="flex min-h-[12rem] max-w-xs flex-col justify-center p-8 text-center">
              <p className="text-sm leading-relaxed text-white/80">
                Không lấy được video để phát trong web. Bạn mở thẳng trên YouTube nhé.
              </p>
              <button
                onClick={() => {
                  openExternal(req.url);
                  closeVideo();
                }}
                className="mt-4 inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
              >
                <ExternalLink size={13} /> Mở trên YouTube
              </button>
            </div>
          )}
        </div>

        {resolved.videos.length > 1 && (
          <Rail videos={resolved.videos} activeId={videoId} onPick={setPicked} />
        )}
      </div>
    </>
  );
}

export function VideoPlayerLayer() {
  const req = useRequest();

  const onKey = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") closeVideo();
  }, []);

  useEffect(() => {
    if (!req) return;
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [req, onKey]);

  if (!req) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-0 backdrop-blur-sm sm:p-4"
      onClick={closeVideo}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={req.title ?? "Video học"}
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full flex-col overflow-hidden border-border bg-card shadow-2xl sm:h-[min(88vh,52rem)] sm:max-w-5xl sm:rounded-2xl sm:border"
      >
        <PlayerBody req={req} />
      </div>
    </div>
  );
}
