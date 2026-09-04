import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Brain, TrendingDown, Clock } from "lucide-react";
import { useProgress } from "@/lib/progress";
import { dueCards } from "@/lib/mastery";
import { isMature } from "@/lib/srs";
import { PHASES, PHASE_ITEM_IDS, ITEM_BY_ID } from "@/data/ielts-map";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/nang-luc")({
  head: () => ({
    meta: [
      { title: "Năng lực — Bản đồ IELTS" },
      {
        name: "description",
        content:
          "Bảng năng lực: số từ nhớ lâu dài, tỷ lệ đúng theo chủ đề, điểm yếu nhất và các thẻ tới hạn ôn.",
      },
      { property: "og:title", content: "Năng lực — Bản đồ IELTS" },
      {
        property: "og:description",
        content: "Theo dõi năng lực thật của bạn thay vì đếm số nút đã bấm.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NangLuc,
});

function NangLuc() {
  const uid = useAuth().user?.uid ?? null;
  const p = useProgress({ uid });

  const mature = Object.values(p.state.cards).filter(isMature).length;
  const totalCards = Object.keys(p.state.cards).length;
  const due = p.hydrated ? dueCards(p.data).length : 0;

  const attempts = Object.values(p.state.quiz).flatMap((q) => q.attempts);
  const avgQuiz = attempts.length
    ? Math.round((attempts.reduce((n, a) => n + a.pct, 0) / attempts.length) * 100)
    : 0;

  const weakest = Object.entries(p.state.quiz)
    .map(([id, q]) => ({ id, best: q.best }))
    .sort((a, b) => a.best - b.best)
    .slice(0, 5);

  return (
    <main className="min-h-[100dvh] bg-night text-foreground">
      <div className="mx-auto max-w-3xl px-5 py-10">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft size={15} /> Về bản đồ
        </Link>

        <h1 className="mt-6 text-3xl font-bold">Năng lực của bạn</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Số liệu ở đây đến từ bài bạn thực sự làm, không phải từ số nút đã bấm. Sao sẽ mờ dần nếu
          bạn không ôn lại — đó là cách bản đồ phản ánh trí nhớ thật.
        </p>

        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          <Stat
            icon={<Brain size={16} />}
            label="Từ nhớ lâu dài"
            value={`${mature}`}
            sub={`trong ${totalCards} thẻ đã học`}
          />
          <Stat
            icon={<TrendingDown size={16} />}
            label="Tỷ lệ đúng trung bình"
            value={`${avgQuiz}%`}
            sub={`${attempts.length} lượt luyện`}
          />
          <Stat
            icon={<Clock size={16} />}
            label="Thẻ tới hạn ôn"
            value={`${due}`}
            sub="ôn hôm nay để giữ sao sáng"
          />
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Độ sáng theo giai đoạn</h2>
          <div className="mt-4 space-y-3">
            {PHASES.map((ph) => (
              <div key={ph.id}>
                <div className="flex items-center justify-between text-sm">
                  <span>{ph.label}</span>
                  <span className="text-muted-foreground">
                    {p.phasePercent[ph.id] ?? 0}% · {PHASE_ITEM_IDS[ph.id]?.length ?? 0} sao
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-star-done transition-[width] duration-700"
                    style={{ width: `${p.phasePercent[ph.id] ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-lg font-semibold">Điểm yếu nhất</h2>
          {weakest.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">
              Chưa có dữ liệu — hãy làm thử một bài luyện trong bản đồ.
            </p>
          ) : (
            <ul className="mt-4 space-y-2">
              {weakest.map((w) => (
                <li
                  key={w.id}
                  className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm"
                >
                  <span>{ITEM_BY_ID[w.id]?.label ?? w.id}</span>
                  <span className="text-muted-foreground">
                    tốt nhất {Math.round(w.best * 100)}%
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}

function Stat({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-5">
      <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
        {icon} {label}
      </p>
      <p className="mt-3 text-3xl font-bold text-star-done">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}
