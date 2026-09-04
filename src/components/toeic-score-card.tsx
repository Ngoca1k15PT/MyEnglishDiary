import { Gauge } from "lucide-react";
import { estimateToeic, TOEIC_PARTS } from "@/data/toeic";
import type { ScoreRecord } from "@/lib/mastery";

export function ToeicScoreCard({
  scores,
  compact,
}: {
  scores: Record<string, ScoreRecord[]>;
  compact?: boolean;
}) {
  const latest: Record<string, number | undefined> = {};
  for (const p of TOEIC_PARTS) {
    const list = scores[p.id] ?? [];
    latest[p.id] = list.length ? list[list.length - 1]!.score : undefined;
  }
  const est = estimateToeic(latest);

  return (
    <div className="rounded-xl border border-border bg-card/70 p-4 backdrop-blur">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
        <Gauge size={13} className="text-star-done" /> Ước tính điểm TOEIC
      </p>

      {!est.hasData ? (
        <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
          Nhập kết quả luyện đề trong panel từng Part để thấy ước tính điểm tổng.
        </p>
      ) : (
        <>
          <p className="mt-2 text-2xl font-bold text-star-done">≈ {est.total}</p>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Listening {est.listeningRaw}/100 ≈ {est.listening} · Reading {est.readingRaw}/100 ≈{" "}
            {est.reading}
          </p>
        </>
      )}

      {!compact && (
        <ul className="mt-3 space-y-1 text-[11px] text-muted-foreground">
          {TOEIC_PARTS.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2">
              <span>{p.label.split(" — ")[0]}</span>
              <span className="text-foreground">
                {latest[p.id] ?? "—"}/{p.questions}
                <span className="ml-1 text-muted-foreground">(mục tiêu {p.goal700})</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
        Bảng quy đổi chỉ là XẤP XỈ (L 55/100 ≈ 300, 70/100 ≈ 375; R 50/100 ≈ 250, 69/100 ≈ 325).
        Điểm thật phụ thuộc từng đề thi.
      </p>
    </div>
  );
}
