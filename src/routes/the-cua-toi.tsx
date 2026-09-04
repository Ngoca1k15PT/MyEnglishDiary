import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ArrowLeft, Download, FileUp, Plus, Save, Trash2 } from "lucide-react";
import {
  addMyCards,
  downloadCsv,
  getMyCards,
  parseCsv,
  removeMyCard,
  SCOPE_LABEL,
  updateMyCard,
  useMyCards,
  type MyCard,
} from "@/lib/my-cards";
import { setQuickAddMode } from "@/lib/quick-add-bus";
import { useProgress } from "@/lib/progress";
import type { ConstellationId } from "@/data/ielts-map";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/the-cua-toi")({
  head: () => ({
    meta: [
      { title: "Thẻ của tôi — Bản đồ TOEIC & IELTS" },
      {
        name: "description",
        content:
          "Quản lý toàn bộ thẻ từ vựng bạn tự tạo từ tài liệu riêng: tìm kiếm, lọc theo chòm, sửa, xoá, xuất và nhập lại CSV.",
      },
      { property: "og:title", content: "Thẻ của tôi — Bản đồ TOEIC & IELTS" },
      {
        property: "og:description",
        content: "Tự tạo thẻ từ tài liệu riêng và sao lưu ra CSV để không bao giờ mất dữ liệu.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MyCardsPage,
});

type Sort = "new" | "old" | "hard";
type Filter = ConstellationId | "all";

function MyCardsPage() {
  const { cards, meta } = useMyCards();
  const uid = useAuth().user?.uid ?? null;
  const p = useProgress({ uid });
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("new");
  const [editing, setEditing] = useState<MyCard | null>(null);
  const [imported, setImported] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const list = useMemo(() => {
    const key = q.trim().toLowerCase();
    const out = cards.filter(
      (c) =>
        (filter === "all" || c.scope === filter) &&
        (!key || c.word.toLowerCase().includes(key) || c.meaning.toLowerCase().includes(key)),
    );
    const hardness = (c: MyCard) => p.state.cards[c.id]?.step ?? -1;
    out.sort((a, b) => {
      if (sort === "hard") return hardness(a) - hardness(b);
      const cmp = a.createdAt.localeCompare(b.createdAt);
      return sort === "new" ? -cmp : cmp;
    });
    return out;
  }, [cards, q, filter, sort, p.state.cards]);

  const onFile = async (file: File | undefined) => {
    if (!file) return;
    const rows = parseCsv(await file.text());
    const n = addMyCards(
      rows.map((r) => ({
        word: r.word,
        meaning: r.meaning,
        ...(r.example ? { example: r.example } : {}),
        scope: (r.scope ?? "toeic") as ConstellationId,
      })),
    );
    setImported(n);
  };

  return (
    <main className="min-h-[100dvh] bg-background px-4 py-8 md:px-8">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={13} /> Về bản đồ
        </Link>

        <h1 className="mt-4 text-2xl font-bold text-foreground">Thẻ của tôi</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {cards.length} thẻ bạn tự tạo. Dữ liệu nằm trong trình duyệt này — xoá lịch sử trình duyệt
          là mất, nên hãy tải bản sao lưu thường xuyên.
          {meta.lastBackup
            ? ` Lần sao lưu gần nhất: ${meta.lastBackup}.`
            : " Bạn chưa sao lưu lần nào."}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => downloadCsv(getMyCards())}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
          >
            <Download size={14} /> Sao lưu ra CSV
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-accent"
          >
            <FileUp size={14} /> Nhập lại từ CSV
          </button>
          <input
            ref={fileRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <button
            onClick={() => setQuickAddMode("dialog")}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-foreground hover:bg-accent"
          >
            <Plus size={14} /> Thêm thẻ
          </button>
          {imported !== null && (
            <span className="self-center text-xs text-star-done">Đã nhập {imported} thẻ</span>
          )}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm từ hoặc nghĩa…"
            className="min-w-48 flex-1 rounded-lg border border-border bg-card/60 px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Filter)}
            aria-label="Lọc theo chòm"
            className="rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-foreground"
          >
            <option value="all">Mọi chòm</option>
            <option value="base">Nền tảng</option>
            <option value="toeic">TOEIC</option>
            <option value="ielts">IELTS</option>
          </select>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as Sort)}
            aria-label="Sắp xếp"
            className="rounded-lg border border-border bg-card/60 px-3 py-2 text-xs text-foreground"
          >
            <option value="new">Mới thêm trước</option>
            <option value="old">Cũ nhất trước</option>
            <option value="hard">Khó nhớ nhất trước</option>
          </select>
        </div>

        <ul className="mt-4 space-y-2">
          {list.map((c) => {
            const st = p.state.cards[c.id];
            const isEdit = editing?.id === c.id;
            return (
              <li key={c.id} className="rounded-xl border border-border bg-card/60 p-3">
                {isEdit ? (
                  <div className="space-y-2">
                    <input
                      value={editing.word}
                      onChange={(e) => setEditing({ ...editing, word: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                    />
                    <input
                      value={editing.meaning}
                      onChange={(e) => setEditing({ ...editing, meaning: e.target.value })}
                      className="w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-sm text-foreground outline-none focus:border-ring"
                    />
                    <input
                      value={editing.example ?? ""}
                      onChange={(e) => setEditing({ ...editing, example: e.target.value })}
                      placeholder="Câu ví dụ"
                      className="w-full rounded-lg border border-border bg-background/70 px-3 py-2 text-xs text-foreground outline-none focus:border-ring"
                    />
                    <div className="flex gap-2">
                      <select
                        value={editing.scope}
                        onChange={(e) =>
                          setEditing({ ...editing, scope: e.target.value as ConstellationId })
                        }
                        className="rounded-lg border border-border bg-background/70 px-2 py-1.5 text-xs text-foreground"
                      >
                        <option value="base">Nền tảng</option>
                        <option value="toeic">TOEIC</option>
                        <option value="ielts">IELTS</option>
                      </select>
                      <button
                        onClick={() => {
                          updateMyCard(c.id, {
                            word: editing.word,
                            meaning: editing.meaning,
                            example: editing.example ?? "",
                            scope: editing.scope,
                          });
                          setEditing(null);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                      >
                        <Save size={13} /> Lưu
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted-foreground"
                      >
                        Huỷ
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <button onClick={() => setEditing(c)} className="flex-1 text-left">
                      <p className="text-sm font-semibold text-foreground">{c.word}</p>
                      <p className="text-sm text-muted-foreground">{c.meaning}</p>
                      {c.example && (
                        <p className="mt-1 text-xs italic text-muted-foreground">{c.example}</p>
                      )}
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {SCOPE_LABEL[c.scope]} · thêm {c.createdAt} ·{" "}
                        {st ? `khoảng ôn ${st.interval} ngày` : "chưa học"}
                      </p>
                    </button>
                    <button
                      onClick={() => removeMyCard(c.id)}
                      aria-label={`Xoá thẻ ${c.word}`}
                      className="rounded-lg p-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>

        {list.length === 0 && (
          <p className="mt-8 text-sm text-muted-foreground">
            Chưa có thẻ nào khớp. Bấm nút + ở góc dưới bên phải để thêm từ đầu tiên.
          </p>
        )}
      </div>
    </main>
  );
}
