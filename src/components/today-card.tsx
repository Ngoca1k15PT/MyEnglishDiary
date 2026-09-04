import { Snowflake, ArrowRight, GraduationCap, Sparkles } from "lucide-react";
import { Link } from "@tanstack/react-router";
import type { ItemNode } from "@/data/ielts-map";
import type { PlanSummary } from "@/lib/course-plan";

type Props = {
  suggestion: { item: ItemNode; groupLabel: string; phaseLabel: string } | null;
  /** Headline left behind by the course reader; null until it's been opened. */
  course?: PlanSummary | null;
  streak: number;
  last7: { key: string; active: boolean; frozen: boolean }[];
  freezeAvailable: boolean;
  onOpen: () => void;
  onFreeze: () => void;
};

export function TodayCard({
  suggestion,
  course,
  streak,
  last7,
  freezeAvailable,
  onOpen,
  onFreeze,
}: Props) {
  return (
    <section className="pointer-events-auto w-full rounded-2xl border border-border bg-card/75 p-4 backdrop-blur-xl">
      <h2 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        <Sparkles size={13} className="text-star-done" /> Hôm nay
      </h2>

      {suggestion ? (
        <div className="mt-3">
          <p className="text-[11px] text-muted-foreground">{suggestion.phaseLabel}</p>
          <p className="mt-1 text-sm font-medium leading-snug text-foreground">
            {suggestion.item.label}
          </p>
          <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {suggestion.item.desc}
          </p>
          <button
            onClick={onOpen}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition-all hover:brightness-110"
          >
            Mở <ArrowRight size={13} />
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Cả bầu trời đã sáng. Cứ quay lại ôn bất kỳ ngôi sao nào bạn muốn.
        </p>
      )}

      {course && (
        <Link
          to="/khoa-hoc"
          search={course.lessonId ? { bai: course.lessonId } : {}}
          className="mt-3 block rounded-xl border border-border p-2.5 transition-colors hover:bg-accent"
        >
          <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
            <GraduationCap size={11} className="text-star-done" /> Khoá học
          </span>
          <span className="mt-1 block text-[11px] font-medium leading-snug text-foreground">
            {course.label}
          </span>
          <span className="mt-0.5 block text-[10px] leading-relaxed text-muted-foreground">
            {course.reason}
          </span>
        </Link>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Chuỗi ngày</span>
          <span className="text-xs font-semibold text-foreground">{streak} ngày</span>
        </div>
        <div className="mt-2 flex gap-1.5">
          {last7.map((d) => (
            <span
              key={d.key}
              title={d.key}
              className={`h-2.5 flex-1 rounded-full ${
                d.active ? "bg-star-done" : d.frozen ? "bg-star-doing/70" : "bg-muted"
              }`}
            />
          ))}
        </div>
        <button
          onClick={onFreeze}
          disabled={!freezeAvailable}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
        >
          <Snowflake size={12} />
          {freezeAvailable ? "Đóng băng chuỗi (1 lần/tuần)" : "Đã dùng đóng băng tuần này"}
        </button>
      </div>
    </section>
  );
}
