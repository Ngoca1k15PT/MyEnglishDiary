import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  FileUp,
  ListPlus,
  Maximize2,
  Minimize2,
  Plus,
  Settings2,
  X,
} from "lucide-react";
import type { ConstellationId } from "@/data/ielts-map";
import {
  addMyCard,
  addMyCards,
  downloadCsv,
  getMyCards,
  hasWord,
  needsBackupReminder,
  overwriteMyCard,
  parseBulk,
  parseCsv,
  setMyCardsMeta,
  SCOPE_LABEL,
  useMyCards,
  type ParsedRow,
} from "@/lib/my-cards";
import { dayKey } from "@/lib/srs";
import { setQuickAddMode, useQuickAddMode } from "@/lib/quick-add-bus";
import { useIsMobile } from "@/hooks/use-mobile";

const SCOPES: ConstellationId[] = ["base", "toeic", "ielts"];
const SCOPE_KEY = "bdi-quick-add-scope";

function readScope(): ConstellationId {
  if (typeof window === "undefined") return "toeic";
  const v = window.localStorage.getItem(SCOPE_KEY);
  return v === "base" || v === "ielts" || v === "toeic" ? v : "toeic";
}

/* -------------------------------------------------- form nhanh */

function ScopePicker({
  scope,
  onChange,
}: {
  scope: ConstellationId;
  onChange: (s: ConstellationId) => void;
}) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-background/60 p-1">
      {SCOPES.map((s) => (
        <button
          key={s}
          type="button"
          tabIndex={-1}
          onClick={() => onChange(s)}
          className={`flex-1 rounded-md px-2 py-1 text-[11px] transition-colors ${
            scope === s
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent hover:text-foreground"
          }`}
        >
          {SCOPE_LABEL[s]}
        </button>
      ))}
    </div>
  );
}

function QuickForm({ compact, autoFocus }: { compact?: boolean; autoFocus?: boolean }) {
  const [word, setWord] = useState("");
  const [meaning, setMeaning] = useState("");
  const [example, setExample] = useState("");
  const [showExample, setShowExample] = useState(false);
  const [scope, setScope] = useState<ConstellationId>("toeic");
  const [count, setCount] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const wordRef = useRef<HTMLInputElement>(null);
  const meaningRef = useRef<HTMLInputElement>(null);

  useEffect(() => setScope(readScope()), []);
  useEffect(() => {
    if (autoFocus) wordRef.current?.focus();
  }, [autoFocus]);

  const pickScope = (s: ConstellationId) => {
    setScope(s);
    window.localStorage.setItem(SCOPE_KEY, s);
    wordRef.current?.focus();
  };

  const save = () => {
    const card = addMyCard({ word, meaning, example, scope });
    if (!card) {
      if (!word.trim()) wordRef.current?.focus();
      else meaningRef.current?.focus();
      return;
    }
    setCount((c) => c + 1);
    setFlash(card.word);
    window.setTimeout(() => setFlash(null), 1200);
    setWord("");
    setMeaning("");
    setExample("");
    wordRef.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      save();
    }
  };

  const dup = word.trim() && hasWord(word);

  return (
    <div className={compact ? "space-y-2" : "space-y-3"}>
      <input
        ref={wordRef}
        value={word}
        onChange={(e) => setWord(e.target.value)}
        onKeyDown={onKey}
        placeholder="Từ tiếng Anh"
        aria-label="Từ tiếng Anh"
        autoComplete="off"
        className="w-full rounded-lg border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none focus:border-ring"
      />
      <input
        ref={meaningRef}
        value={meaning}
        onChange={(e) => setMeaning(e.target.value)}
        onKeyDown={onKey}
        placeholder="Nghĩa tiếng Việt"
        aria-label="Nghĩa tiếng Việt"
        autoComplete="off"
        className="w-full rounded-lg border border-border bg-background/70 px-3 py-2.5 text-sm text-foreground outline-none focus:border-ring"
      />
      {showExample ? (
        <input
          value={example}
          onChange={(e) => setExample(e.target.value)}
          onKeyDown={onKey}
          placeholder="Câu ví dụ (tuỳ chọn)"
          aria-label="Câu ví dụ"
          className="w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-xs text-foreground outline-none focus:border-ring"
        />
      ) : (
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowExample(true)}
          className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          <ChevronDown size={12} /> Thêm câu ví dụ
        </button>
      )}

      <ScopePicker scope={scope} onChange={pickScope} />

      {dup && (
        <p className="text-[11px] text-star-doing">
          Bạn đã có thẻ cho từ này rồi — lưu sẽ tạo thêm một thẻ nữa.
        </p>
      )}

      <button
        type="button"
        onClick={save}
        className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground hover:brightness-110"
      >
        Lưu thẻ · Enter
      </button>

      <p className="text-center text-[11px] text-muted-foreground">
        {flash ? (
          <span className="inline-flex items-center gap-1 text-star-done">
            <Check size={12} /> Đã lưu “{flash}”
          </span>
        ) : (
          `Đã thêm ${count} từ trong phiên này`
        )}
      </p>
    </div>
  );
}

/* -------------------------------------------------- dán danh sách */

type Row = ParsedRow & { skip?: boolean; overwrite?: boolean };

function BulkPanel({ onDone }: { onDone: () => void }) {
  const [text, setText] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [scope, setScope] = useState<ConstellationId>("toeic");
  const [saved, setSaved] = useState(0);

  useEffect(() => setScope(readScope()), []);

  const preview = () => setRows(parseBulk(text).map((r) => ({ ...r })));

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const content = await file.text();
    const parsed = parseCsv(content);
    setText(parsed.map((r) => [r.word, r.meaning, r.example ?? ""].join(" | ")).join("\n"));
    setRows(
      parsed.map((r) => ({
        word: r.word,
        meaning: r.meaning,
        ...(r.example ? { example: r.example } : {}),
      })),
    );
  };

  const save = () => {
    const list = rows ?? [];
    let n = 0;
    const fresh: { word: string; meaning: string; example?: string; scope: ConstellationId }[] = [];
    list.forEach((r) => {
      if (r.skip) return;
      const row = {
        word: r.word,
        meaning: r.meaning,
        ...(r.example ? { example: r.example } : {}),
        scope,
      };
      if (hasWord(r.word)) {
        if (r.overwrite) {
          overwriteMyCard(row);
          n += 1;
        }
        return;
      }
      fresh.push(row);
    });
    n += addMyCards(fresh);
    setSaved(n);
    setRows(null);
    setText("");
    onDone();
  };

  const dupCount = (rows ?? []).filter((r) => hasWord(r.word)).length;

  return (
    <div className="space-y-3">
      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Dán nhiều dòng, mỗi dòng một từ. Tự nhận dấu <b>|</b>, tab hoặc dấu phẩy đầu tiên.
        <br />
        <code className="text-foreground">schedule | lịch trình | The meeting is scheduled.</code>
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={7}
        placeholder={"schedule | lịch trình\nrevenue, doanh thu"}
        className="w-full resize-y rounded-lg border border-border bg-background/70 p-3 text-xs text-foreground outline-none focus:border-ring"
      />
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={preview}
          className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          Xem trước
        </button>
        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-accent">
          <FileUp size={13} /> Tải file CSV
          <input
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
        {saved > 0 && <span className="text-xs text-star-done">Đã lưu {saved} thẻ</span>}
      </div>

      <div className="w-full">
        <ScopePicker
          scope={scope}
          onChange={(s) => {
            setScope(s);
            window.localStorage.setItem(SCOPE_KEY, s);
          }}
        />
      </div>

      {rows && (
        <div className="space-y-2">
          <p className="text-[11px] text-muted-foreground">
            Tách được {rows.length} dòng{dupCount > 0 ? ` · ${dupCount} dòng trùng thẻ đã có` : ""}.
          </p>
          <div className="max-h-64 space-y-2 overflow-y-auto no-scrollbar rounded-lg border border-border p-2">
            {rows.map((r, i) => {
              const dup = hasWord(r.word);
              return (
                <div key={i} className="space-y-1 rounded-md bg-background/50 p-2">
                  <div className="flex gap-2">
                    <input
                      value={r.word}
                      onChange={(e) =>
                        setRows((v) =>
                          v!.map((x, j) => (j === i ? { ...x, word: e.target.value } : x)),
                        )
                      }
                      className="w-1/2 rounded border border-border bg-background/70 px-2 py-1 text-xs text-foreground outline-none focus:border-ring"
                    />
                    <input
                      value={r.meaning}
                      onChange={(e) =>
                        setRows((v) =>
                          v!.map((x, j) => (j === i ? { ...x, meaning: e.target.value } : x)),
                        )
                      }
                      className="w-1/2 rounded border border-border bg-background/70 px-2 py-1 text-xs text-foreground outline-none focus:border-ring"
                    />
                    <button
                      type="button"
                      aria-label="Bỏ dòng này"
                      onClick={() => setRows((v) => v!.filter((_, j) => j !== i))}
                      className="rounded p-1 text-muted-foreground hover:text-destructive"
                    >
                      <X size={13} />
                    </button>
                  </div>
                  {dup && (
                    <div className="flex items-center gap-2 text-[11px] text-star-doing">
                      Trùng thẻ đã có:
                      <button
                        type="button"
                        onClick={() =>
                          setRows((v) =>
                            v!.map((x, j) =>
                              j === i ? { ...x, skip: true, overwrite: false } : x,
                            ),
                          )
                        }
                        className={`rounded border px-2 py-0.5 ${r.skip ? "border-star-done text-star-done" : "border-border text-muted-foreground"}`}
                      >
                        Bỏ qua
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setRows((v) =>
                            v!.map((x, j) =>
                              j === i ? { ...x, skip: false, overwrite: true } : x,
                            ),
                          )
                        }
                        className={`rounded border px-2 py-0.5 ${r.overwrite ? "border-star-done text-star-done" : "border-border text-muted-foreground"}`}
                      >
                        Ghi đè
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <button
            type="button"
            onClick={save}
            className="w-full rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Lưu {rows.filter((r) => !r.skip).length} thẻ vào chòm {SCOPE_LABEL[scope]}
          </button>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------- nhắc sao lưu */

function BackupReminder() {
  const { cards, meta } = useMyCards();
  const [dismissed, setDismissed] = useState(false);
  const show = !dismissed && needsBackupReminder(cards, meta);
  if (!show) return null;

  const later = () => {
    setMyCardsMeta({ lastRemind: dayKey() });
    setDismissed(true);
  };

  return (
    <div className="fixed bottom-24 right-4 z-[70] w-72 rounded-xl border border-border bg-card/95 p-4 text-left shadow-lg backdrop-blur">
      <p className="text-xs leading-relaxed text-foreground">
        Bạn có {cards.length} thẻ tự tạo. Tải bản sao lưu để khỏi mất nhé.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => {
            downloadCsv(getMyCards());
            setDismissed(true);
          }}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
        >
          <Download size={13} /> Tải ngay
        </button>
        <button
          onClick={later}
          className="rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-accent"
        >
          Để sau
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------- lớp tổng */

export function QuickAddLayer() {
  const mode = useQuickAddMode();
  const isMobile = useIsMobile();
  const { cards } = useMyCards();
  const [tab, setTab] = useState<"one" | "bulk">("one");
  const [barOpen, setBarOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setQuickAddMode(mode === "dialog" ? "closed" : "dialog");
      }
      if (e.key === "Escape" && mode === "dialog") setQuickAddMode("closed");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [mode]);

  const total = cards.length;
  const manageLink = useMemo(
    () => (
      <Link
        to="/the-cua-toi"
        className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground"
      >
        <Settings2 size={12} /> Quản lý {total} thẻ
      </Link>
    ),
    [total],
  );

  /* chế độ vừa xem vừa ghi — trên điện thoại là thanh mỏng ở đáy */
  if (mode === "sidecar" && isMobile) {
    return (
      <>
        <div className="fixed inset-x-0 bottom-0 z-[65] border-t border-border bg-card/95 p-3 backdrop-blur">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-[11px] font-medium text-foreground">Thêm thẻ nhanh</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setBarOpen((v) => !v)}
                className="text-[11px] text-muted-foreground"
              >
                {barOpen ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
              </button>
              <button
                onClick={() => setQuickAddMode("closed")}
                aria-label="Thoát chế độ vừa xem vừa ghi"
                className="text-muted-foreground"
              >
                <Maximize2 size={14} />
              </button>
            </div>
          </div>
          {barOpen ? <QuickForm compact autoFocus /> : manageLink}
        </div>
        <BackupReminder />
      </>
    );
  }

  if (mode === "sidecar") {
    return (
      <>
        <aside className="fixed right-0 top-0 z-[65] flex h-[100dvh] w-80 flex-col gap-3 overflow-y-auto no-scrollbar border-l border-border bg-card/95 p-4 backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">Vừa xem vừa ghi</h2>
            <button
              onClick={() => setQuickAddMode("closed")}
              aria-label="Phóng to lại app"
              className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <Maximize2 size={14} />
            </button>
          </div>
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Mở tài liệu của bạn ở nửa màn hình bên trái, gặp từ mới thì gõ thẳng vào đây. Enter là
            lưu và ô trống sẵn cho từ tiếp theo.
          </p>
          <QuickForm autoFocus />
          <div className="mt-auto pt-3">{manageLink}</div>
        </aside>
        <BackupReminder />
      </>
    );
  }

  return (
    <>
      {mode === "dialog" && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 p-4 pt-16 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-5 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex gap-1 rounded-lg border border-border p-1">
                {(
                  [
                    { id: "one", label: "Thêm nhanh" },
                    { id: "bulk", label: "Dán danh sách" },
                  ] as const
                ).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`rounded-md px-2.5 py-1 text-[11px] ${
                      tab === t.id
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-accent"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setQuickAddMode("sidecar")}
                  aria-label="Chế độ vừa xem vừa ghi"
                  className="rounded-lg border border-border p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <Minimize2 size={14} />
                </button>
                <button
                  onClick={() => setQuickAddMode("closed")}
                  aria-label="Đóng"
                  className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  <X size={15} />
                </button>
              </div>
            </div>

            {tab === "one" ? <QuickForm autoFocus /> : <BulkPanel onDone={() => undefined} />}

            <div className="mt-3 flex items-center justify-between">
              {manageLink}
              <span className="text-[10px] text-muted-foreground">Ctrl/Cmd + K</span>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={() => setQuickAddMode("dialog")}
        aria-label="Thêm thẻ nhanh"
        title="Thêm thẻ nhanh (Ctrl/Cmd + K)"
        className="fixed bottom-5 right-5 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105"
      >
        <Plus size={22} />
      </button>

      <BackupReminder />
    </>
  );
}

export const QUICK_ADD_HINT_ICON = ListPlus;
