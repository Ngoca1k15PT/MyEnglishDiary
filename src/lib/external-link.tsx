import { useCallback, useEffect, useSyncExternalStore, useState } from "react";
import { Copy, Check, ExternalLink as ExternalIcon, X } from "lucide-react";

/* ---------------- opened links store ---------------- */

const OPENED_KEY = "bdi.opened-links";
const BANNER_KEY = "bdi.iframe-banner-dismissed";

let opened: Set<string> = new Set();
let openedSnapshot: string[] = [];
const listeners = new Set<() => void>();

function emit() {
  openedSnapshot = Array.from(opened);
  listeners.forEach((l) => l());
}

function loadOpened() {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(OPENED_KEY);
    opened = new Set(raw ? (JSON.parse(raw) as string[]) : []);
    openedSnapshot = Array.from(opened);
  } catch {
    opened = new Set();
  }
}
loadOpened();

export function markOpened(url: string) {
  if (opened.has(url)) return;
  opened.add(url);
  try {
    localStorage.setItem(OPENED_KEY, JSON.stringify(Array.from(opened)));
  } catch {
    /* ignore */
  }
  emit();
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

const EMPTY: string[] = [];

export function useOpenedLinks() {
  const list = useSyncExternalStore(
    subscribe,
    () => openedSnapshot,
    () => EMPTY,
  );
  return useCallback((url: string) => list.includes(url), [list]);
}

/* ---------------- iframe detection ---------------- */

export function isEmbedded() {
  if (typeof window === "undefined") return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function useIsEmbedded() {
  const [embedded, setEmbedded] = useState(false);
  useEffect(() => setEmbedded(isEmbedded()), []);
  return embedded;
}

/* ---------------- fallback dialog state ---------------- */

let blockedUrl: string | null = null;
const blockedListeners = new Set<() => void>();

function setBlocked(url: string | null) {
  blockedUrl = url;
  blockedListeners.forEach((l) => l());
}

function useBlockedUrl() {
  return useSyncExternalStore(
    (cb) => {
      blockedListeners.add(cb);
      return () => blockedListeners.delete(cb);
    },
    () => blockedUrl,
    () => null,
  );
}

/* ---------------- openExternal ---------------- */

export function openExternal(url: string) {
  markOpened(url);
  if (typeof window === "undefined") return;

  if (isEmbedded()) {
    try {
      const w = window.top?.open(url, "_blank", "noopener,noreferrer");
      if (w) return;
    } catch {
      /* fall through */
    }
  }

  try {
    const win = window.open(url, "_blank", "noopener,noreferrer");
    if (win) {
      try {
        win.opener = null;
      } catch {
        /* ignore */
      }
      return;
    }
  } catch {
    /* fall through */
  }

  setBlocked(url);
}

/** onClick handler cho thẻ <a> thật. */
export function handleExternalClick(url: string) {
  return (e: React.MouseEvent<HTMLAnchorElement>) => {
    // Tôn trọng chuột giữa / ctrl / cmd / shift — để trình duyệt tự xử lý
    if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) {
      markOpened(url);
      return;
    }
    e.preventDefault();
    openExternal(url);
  };
}

/* ---------------- UI layer ---------------- */

export function ExternalLinkLayer() {
  const embedded = useIsEmbedded();
  const blocked = useBlockedUrl();
  const [dismissed, setDismissed] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setDismissed(localStorage.getItem(BANNER_KEY) === "1");
    } catch {
      setDismissed(false);
    }
  }, []);

  useEffect(() => setCopied(false), [blocked]);

  const copy = async () => {
    if (!blocked) return;
    try {
      await navigator.clipboard.writeText(blocked);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <>
      {embedded && !dismissed && (
        <div className="fixed inset-x-0 top-0 z-[70] flex flex-wrap items-center justify-center gap-2 border-b border-border bg-card/95 px-4 py-2 text-xs text-foreground backdrop-blur">
          <span>
            Bạn đang xem trong khung xem trước. Link ngoài có thể bị chặn — mở ở tab riêng để dùng
            đầy đủ.
          </span>
          <button
            onClick={() => {
              const here = window.location.href;
              const w = window.open(here, "_blank", "noopener,noreferrer");
              if (!w) {
                try {
                  if (window.top) window.top.location.href = here;
                } catch {
                  setBlocked(here);
                }
              }
            }}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground"
          >
            <ExternalIcon size={12} /> Mở ở tab riêng
          </button>
          <button
            aria-label="Đóng thông báo"
            onClick={() => {
              setDismissed(true);
              try {
                localStorage.setItem(BANNER_KEY, "1");
              } catch {
                /* ignore */
              }
            }}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {blocked && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4"
          onClick={() => setBlocked(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-2xl"
          >
            <h2 className="text-sm font-semibold text-foreground">
              Trình duyệt đang chặn mở tab mới
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Bạn có thể sao chép link dưới đây và dán vào tab mới.
            </p>
            <p className="mt-3 select-all break-all rounded-lg border border-border bg-background px-3 py-2 text-[13px] leading-relaxed text-foreground">
              {blocked}
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={copy}
                className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground"
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? "Đã sao chép" : "Sao chép link"}
              </button>
              <button
                onClick={() => {
                  const u = blocked;
                  setBlocked(null);
                  openExternal(u);
                }}
                className="inline-flex min-h-[40px] items-center rounded-lg border border-border px-3 text-xs font-semibold text-foreground hover:bg-accent"
              >
                Thử mở lại
              </button>
              <button
                onClick={() => setBlocked(null)}
                className="inline-flex min-h-[40px] items-center rounded-lg px-3 text-xs text-muted-foreground hover:text-foreground"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
