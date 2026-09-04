import { createServerFn } from "@tanstack/react-start";

/**
 * Link "tìm trên YouTube" và link kênh không nhúng thẳng vào <iframe> được.
 * Hàm này chạy trên máy chủ, đọc trang YouTube tương ứng và lấy ra danh sách
 * videoId — sau đó client nhúng bằng trình phát chính thức của YouTube.
 *
 * Chạy trên máy chủ vì trình duyệt bị CORS chặn. Nếu YouTube đổi cấu trúc
 * trang thì hàm trả về danh sách rỗng, và giao diện tự lùi về mở tab mới.
 */

export type YtVideo = {
  id: string;
  title: string;
  channel: string;
  duration: string;
};

export type YtLookup = {
  /** Playlist để nhúng (chỉ có với link kênh). */
  list?: string | undefined;
  videos: YtVideo[];
};

type LookupInput = { kind: "search" | "channel"; q: string };

const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

/** sp=EgIQAQ%3D%3D là bộ lọc "chỉ video" của YouTube — bỏ kênh và playlist khỏi kết quả. */
const SEARCH_FILTER = "EgIQAQ%3D%3D";

const MAX_RESULTS = 12;
const CACHE_TTL = 6 * 60 * 60 * 1000;
const CACHE_MAX = 200;
const FETCH_TIMEOUT = 8000;

const cache = new Map<string, { at: number; value: YtLookup }>();

function readCache(key: string): YtLookup | null {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() - hit.at > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return hit.value;
}

function writeCache(key: string, value: YtLookup) {
  if (cache.size >= CACHE_MAX) {
    const oldest = cache.keys().next().value;
    if (oldest !== undefined) cache.delete(oldest);
  }
  cache.set(key, { at: Date.now(), value });
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "user-agent": UA,
      "accept-language": "vi-VN,vi;q=0.9,en-US;q=0.8",
      accept: "text/html",
    },
    // Không để một request treo giữ luôn tiến trình dựng trang.
    signal: AbortSignal.timeout(FETCH_TIMEOUT),
  });
  if (!res.ok) throw new Error(`YouTube trả về ${res.status}`);
  return res.text();
}

/**
 * Cắt object JSON đứng sau `marker`.
 *
 * Đường nhanh: blob nằm gọn trong một thẻ <script> và YouTube luôn thoát dấu `<`
 * thành \u003c bên trong chuỗi, nên cắt tới `</script>` là an toàn — và tránh
 * được vòng lặp từng ký tự trên ~500KB (đáng kể khi chạy trên edge worker).
 * Nếu YouTube đổi cách bọc, lùi về đếm ngoặc.
 */
function extractJsonAfter(html: string, marker: string): unknown | null {
  const at = html.indexOf(marker);
  if (at < 0) return null;
  const start = html.indexOf("{", at + marker.length);
  if (start < 0) return null;

  const close = html.indexOf("</script>", start);
  if (close > start) {
    try {
      return JSON.parse(html.slice(start, close).trimEnd().replace(/;$/, ""));
    } catch {
      /* rơi xuống cách đếm ngoặc */
    }
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (inString) {
      if (escaped) escaped = false;
      else if (c === "\\") escaped = true;
      else if (c === '"') inString = false;
      continue;
    }
    if (c === '"') inString = true;
    else if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) {
        try {
          return JSON.parse(html.slice(start, i + 1));
        } catch {
          return null;
        }
      }
    }
  }
  return null;
}

type TextNode = { simpleText?: unknown; runs?: Array<{ text?: unknown }> };

function asObject(node: unknown): Record<string, unknown> | undefined {
  return node !== null && typeof node === "object" && !Array.isArray(node)
    ? (node as Record<string, unknown>)
    : undefined;
}

function dig(node: unknown, ...path: string[]): unknown {
  let current: unknown = node;
  for (const key of path) {
    const o = asObject(current);
    if (!o) return undefined;
    current = o[key];
  }
  return current;
}

function textOf(node: unknown): string {
  const t = node as TextNode | undefined;
  if (!t) return "";
  if (typeof t.simpleText === "string") return t.simpleText;
  if (Array.isArray(t.runs))
    return t.runs.map((r) => (typeof r?.text === "string" ? r.text : "")).join("");
  return "";
}

/* --- Bố cục cũ: videoRenderer & anh em --- */

const RENDERER_KEYS = ["videoRenderer", "gridVideoRenderer", "playlistVideoRenderer"] as const;

function fromRenderer(r: Record<string, unknown>): YtVideo | null {
  const id = r["videoId"];
  if (typeof id !== "string") return null;
  return {
    id,
    title: textOf(r["title"]) || "Video",
    channel: textOf(r["ownerText"]) || textOf(r["shortBylineText"]) || textOf(r["longBylineText"]),
    duration: textOf(r["lengthText"]),
  };
}

/* --- Bố cục mới: lockupViewModel (trang kênh, và dần cả trang tìm kiếm) --- */

const DURATION = /^\d{1,3}(:\d{2})+$/;

/** Thời lượng nằm trong huy hiệu góc ảnh, lồng khá sâu nên phải dò. */
function lockupDuration(node: unknown): string {
  if (node === null || typeof node !== "object") return "";
  if (Array.isArray(node)) {
    for (const child of node) {
      const found = lockupDuration(child);
      if (found) return found;
    }
    return "";
  }
  const o = node as Record<string, unknown>;
  const badge = dig(o, "thumbnailBadgeViewModel", "text");
  if (typeof badge === "string" && DURATION.test(badge)) return badge;
  for (const value of Object.values(o)) {
    const found = lockupDuration(value);
    if (found) return found;
  }
  return "";
}

function fromLockup(lm: Record<string, unknown>): YtVideo | null {
  if (lm["contentType"] !== "LOCKUP_CONTENT_TYPE_VIDEO") return null;
  const id = lm["contentId"];
  if (typeof id !== "string") return null;

  const meta = dig(lm, "metadata", "lockupMetadataViewModel");
  const title = dig(meta, "title", "content");
  // Hàng đầu là tên kênh, hàng sau là lượt xem/ngày đăng. Chỉ một hàng nghĩa là
  // đang ở trang kênh nên không có tên kênh để lấy.
  const rows = dig(meta, "metadata", "contentMetadataViewModel", "metadataRows");
  const channel =
    Array.isArray(rows) && rows.length > 1
      ? dig(rows[0], "metadataParts", "0", "text", "content")
      : undefined;

  return {
    id,
    title: typeof title === "string" && title ? title : "Video",
    channel: typeof channel === "string" ? channel : "",
    duration: lockupDuration(lm["contentImage"]),
  };
}

function collectVideos(data: unknown, limit: number): YtVideo[] {
  const out: YtVideo[] = [];
  const seen = new Set<string>();

  const take = (video: YtVideo | null) => {
    if (!video || seen.has(video.id)) return;
    seen.add(video.id);
    out.push(video);
  };

  const walk = (node: unknown) => {
    if (out.length >= limit || node === null || typeof node !== "object") return;
    if (Array.isArray(node)) {
      for (const child of node) walk(child);
      return;
    }
    const obj = node as Record<string, unknown>;

    for (const key of RENDERER_KEYS) {
      const r = asObject(obj[key]);
      if (r) take(fromRenderer(r));
    }
    const lockup = asObject(obj["lockupViewModel"]);
    if (lockup) take(fromLockup(lockup));
    if (out.length >= limit) return;

    for (const value of Object.values(obj)) walk(value);
  };

  walk(data);
  return out;
}

/** Dự phòng khi ytInitialData không parse được: quét thẳng videoId trong HTML. */
function scrapeIds(html: string, limit: number): YtVideo[] {
  const out: YtVideo[] = [];
  const seen = new Set<string>();
  const re = /"videoId":"([\w-]{11})"/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) && out.length < limit) {
    const id = m[1];
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, title: "Video", channel: "", duration: "" });
  }
  return out;
}

function videosFrom(html: string): YtVideo[] {
  const data = extractJsonAfter(html, "ytInitialData");
  const found = data ? collectVideos(data, MAX_RESULTS) : [];
  return found.length > 0 ? found : scrapeIds(html, MAX_RESULTS);
}

async function lookupSearch(query: string): Promise<YtLookup> {
  const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=${SEARCH_FILTER}`;
  return { videos: videosFrom(await fetchPage(url)) };
}

async function lookupChannel(handle: string): Promise<YtLookup> {
  const path = handle.startsWith("@") || handle.startsWith("UC") ? handle : `c/${handle}`;
  const base = handle.startsWith("UC") ? `channel/${handle}` : path;
  const html = await fetchPage(`https://www.youtube.com/${encodeURI(base)}/videos`);

  const channelId = /"externalId":"(UC[\w-]+)"/.exec(html)?.[1];
  return {
    ...(channelId ? { list: `UU${channelId.slice(2)}` } : {}),
    videos: videosFrom(html),
  };
}

export const lookupYouTube = createServerFn({ method: "GET" })
  .validator((input: LookupInput) => {
    const q = String(input?.q ?? "")
      .slice(0, 200)
      .trim();
    const kind = input?.kind === "channel" ? "channel" : "search";
    return { kind, q } as LookupInput;
  })
  .handler(async ({ data }): Promise<YtLookup> => {
    if (!data.q) return { videos: [] };

    const key = `${data.kind}:${data.q}`;
    const cached = readCache(key);
    if (cached) return cached;

    try {
      const value =
        data.kind === "channel" ? await lookupChannel(data.q) : await lookupSearch(data.q);
      if (value.videos.length > 0 || value.list) writeCache(key, value);
      return value;
    } catch (error) {
      console.error("lookupYouTube", key, error);
      return { videos: [] };
    }
  });
