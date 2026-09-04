/**
 * Nhận diện mọi kiểu link YouTube và đổi sang link nhúng, để video phát thẳng
 * trong web thay vì bắt người học thoát ra tab khác.
 *
 * Link video và playlist nhúng được ngay. Link kênh và link tìm kiếm thì phải
 * hỏi máy chủ (xem `youtube-lookup.ts`) — trừ những kênh đã biết sẵn ở dưới.
 */

export type YouTubeTarget =
  | { kind: "video"; videoId: string; list?: string | undefined; start?: number | undefined }
  | { kind: "playlist"; list: string }
  | { kind: "channel"; handle: string }
  | { kind: "search"; query: string };

/**
 * Playlist "uploads" của các kênh mà app dẫn link. YouTube đặt id playlist này
 * bằng id kênh với UC đổi thành UU, nên nhúng được mà không cần gọi máy chủ.
 */
const KNOWN_UPLOADS: Record<string, string> = {
  "@ieltsnguyenhuyen": "UUZZJjVYHNsvOQ92Vumm_Itw",
  "@bbclearningenglish": "UUHaHD477h-FeBbVh9Sh7syA",
  "@toeiccômaiphương": "UUz8OqKPzxJvHMTda70HBmMw",
  covumaiphuong: "UU747JODOhQNNjDh2ol3qs_Q",
};

const VIDEO_ID = /^[\w-]{11}$/;

function safeDecode(value: string) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

/** "90", "1m30s", "1h2m3s" → số giây. */
function parseStart(raw: string | null): number | undefined {
  if (!raw) return undefined;
  if (/^\d+$/.test(raw)) return Number(raw);
  const m = /^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/.exec(raw);
  if (!m || !m[0]) return undefined;
  const secs = Number(m[1] ?? 0) * 3600 + Number(m[2] ?? 0) * 60 + Number(m[3] ?? 0);
  return secs || undefined;
}

function uploadsOf(channelId: string) {
  return channelId.startsWith("UC") ? `UU${channelId.slice(2)}` : null;
}

/** Trả về mục tiêu phát được, hoặc null nếu link không phải YouTube. */
export function parseYouTube(raw: string): YouTubeTarget | null {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\.|^m\./, "").toLowerCase();
  const isShort = host === "youtu.be";
  if (!isShort && host !== "youtube.com" && host !== "youtube-nocookie.com") return null;

  const list = url.searchParams.get("list") ?? undefined;
  const start = parseStart(url.searchParams.get("t") ?? url.searchParams.get("start"));
  const segments = url.pathname.split("/").filter(Boolean);

  if (isShort) {
    const id = segments[0] ?? "";
    return VIDEO_ID.test(id) ? { kind: "video", videoId: id, list, start } : null;
  }

  const [first, second] = segments;

  if (first === "watch") {
    const id = url.searchParams.get("v") ?? "";
    if (VIDEO_ID.test(id)) return { kind: "video", videoId: id, list, start };
    return list ? { kind: "playlist", list } : null;
  }

  if (first === "embed" || first === "shorts" || first === "live" || first === "v") {
    if (second === "videoseries") return list ? { kind: "playlist", list } : null;
    return second && VIDEO_ID.test(second) ? { kind: "video", videoId: second, list, start } : null;
  }

  if (first === "playlist") return list ? { kind: "playlist", list } : null;

  if (first === "results") {
    const query = url.searchParams.get("search_query") ?? url.searchParams.get("q");
    return query ? { kind: "search", query } : null;
  }

  if (first === "channel" && second) {
    const uploads = uploadsOf(second);
    return uploads ? { kind: "playlist", list: uploads } : { kind: "channel", handle: second };
  }

  // /@handle, /c/ten, /user/ten, /ten
  const handleRaw = first?.startsWith("@")
    ? first
    : (first === "c" || first === "user") && second
      ? second
      : first;
  if (!handleRaw) return null;
  if (["feed", "hashtag", "shorts", "gaming", "premium", "about"].includes(handleRaw)) return null;

  const key = safeDecode(handleRaw).toLowerCase();
  const known = KNOWN_UPLOADS[key];
  if (known) return { kind: "playlist", list: known };
  return { kind: "channel", handle: safeDecode(handleRaw) };
}

export const isYouTube = (url: string) => parseYouTube(url) !== null;

const EMBED_HOST = "https://www.youtube-nocookie.com/embed";

/** Link nhúng cho <iframe>. Không có videoId thì phát cả playlist. */
export function embedSrc(opts: {
  videoId?: string | undefined;
  list?: string | undefined;
  start?: number | undefined;
  autoplay?: boolean | undefined;
}) {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    hl: "vi",
    cc_lang_pref: "vi",
    autoplay: opts.autoplay === false ? "0" : "1",
  });
  if (opts.list) params.set("list", opts.list);
  if (opts.start) params.set("start", String(opts.start));
  return `${EMBED_HOST}/${opts.videoId ?? "videoseries"}?${params.toString()}`;
}

/** Link YouTube thật, dùng cho nút "Mở trên YouTube". */
export function watchUrl(opts: {
  videoId?: string | undefined;
  list?: string | undefined;
  fallback: string;
}) {
  if (opts.videoId) {
    const params = new URLSearchParams({ v: opts.videoId });
    if (opts.list) params.set("list", opts.list);
    return `https://www.youtube.com/watch?${params.toString()}`;
  }
  if (opts.list) return `https://www.youtube.com/playlist?list=${opts.list}`;
  return opts.fallback;
}

export const thumbUrl = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;
