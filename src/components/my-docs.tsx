import { useState } from "react";
import { ExternalLink, FolderPlus, Play, Trash2 } from "lucide-react";
import { handleExternalClick } from "@/lib/external-link";
import { handleWatchClick } from "@/components/video-player";
import { isYouTube } from "@/lib/youtube";
import { SCOPE_LABEL, type DocScope, type MyDoc } from "@/lib/my-docs";

const SCOPES: DocScope[] = ["all", "base", "toeic", "ielts"];

export function MyDocsEditor({
  docs,
  onAdd,
  onRemove,
}: {
  docs: MyDoc[];
  onAdd: (label: string, url: string, scope: DocScope) => void;
  onRemove: (id: string) => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [scope, setScope] = useState<DocScope>("toeic");

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Gắn link tài liệu riêng của bạn (Google Drive, Dropbox, khoá học đã mua…). Link sẽ hiện
        trong panel của mọi ngôi sao thuộc chòm bạn chọn. Link YouTube sẽ phát thẳng trong web.
      </p>
      <p className="rounded-lg border border-border bg-muted/30 p-2 text-[11px] leading-relaxed text-foreground">
        Mở tài liệu của bạn, và khi gặp từ mới thì bấm nút + để thêm thẻ ngay. Thẻ do bạn tự viết
        bằng lời của mình sẽ nhớ lâu hơn thẻ chép sẵn.
      </p>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Nhãn, ví dụ: Sách TOEIC của mình"
        className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-foreground outline-none focus:border-ring"
      />
      <input
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Dán link tại đây"
        className="w-full rounded-lg border border-border bg-background/60 px-3 py-2 text-xs text-foreground outline-none focus:border-ring"
      />
      <p className="text-[11px] text-muted-foreground">
        Link bạn thêm chỉ lưu trên máy bạn, không được chia sẻ hay tải lên đâu cả.
      </p>
      <div className="flex gap-2">
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as DocScope)}
          className="flex-1 rounded-lg border border-border bg-background/60 px-2 py-2 text-xs text-foreground outline-none focus:border-ring"
        >
          {SCOPES.map((s) => (
            <option key={s} value={s}>
              {SCOPE_LABEL[s]}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            onAdd(label, url, scope);
            setLabel("");
            setUrl("");
          }}
          disabled={!url.trim()}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-40"
        >
          <FolderPlus size={13} /> Thêm
        </button>
      </div>

      {docs.length > 0 && (
        <ul className="space-y-1.5">
          {docs.map((d) => (
            <li
              key={d.id}
              className="flex items-center justify-between gap-2 rounded-lg border border-border px-2.5 py-1.5 text-[11px]"
            >
              <span className="min-w-0 flex-1 truncate text-foreground">
                {d.label}
                <span className="ml-1 text-muted-foreground">· {SCOPE_LABEL[d.scope]}</span>
              </span>
              <button
                onClick={() => onRemove(d.id)}
                aria-label={`Xoá ${d.label}`}
                className="shrink-0 rounded p-1 text-muted-foreground hover:text-destructive"
              >
                <Trash2 size={13} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function MyDocsList({ docs }: { docs: MyDoc[] }) {
  if (docs.length === 0) return null;
  return (
    <section>
      <h3 className="mb-1 text-sm font-semibold text-foreground">Tài liệu của tôi</h3>
      <p className="mb-3 text-xs text-muted-foreground">
        Link bạn tự gắn trong Cài đặt cho chòm sao này.
      </p>
      <ul className="space-y-2">
        {docs.map((d) => {
          const inApp = isYouTube(d.url);
          return (
            <li key={d.id}>
              <a
                href={d.url}
                onClick={
                  inApp ? handleWatchClick(d.url, { title: d.label }) : handleExternalClick(d.url)
                }
                target="_blank"
                rel="noreferrer"
                className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-border bg-background/50 px-4 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
              >
                <span className="min-w-0 truncate">{d.label}</span>
                {inApp ? (
                  <Play
                    size={14}
                    aria-label="Phát trong web"
                    className="shrink-0 text-study-video"
                  />
                ) : (
                  <ExternalLink size={14} className="shrink-0 text-muted-foreground" />
                )}
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
