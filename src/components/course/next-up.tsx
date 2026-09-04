import { ArrowRight, ClipboardCheck, Dumbbell, Sparkles } from "lucide-react";
import type { PlanAction } from "@/lib/course-plan";

const ICON = {
  quiz: Dumbbell,
  exam: ClipboardCheck,
  lesson: ArrowRight,
} as const;

type Props = {
  actions: PlanAction[];
  onPick: (action: PlanAction) => void;
};

export function NextUp({ actions, onPick }: Props) {
  if (actions.length === 0) return null;
  const [first, ...rest] = actions;

  return (
    <section className="border-b border-border p-3">
      <h2 className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        <Sparkles size={11} className="text-star-done" /> Nên làm tiếp
      </h2>

      <button
        onClick={() => onPick(first!)}
        className="mt-2 w-full rounded-xl border border-star-done/40 bg-card/60 p-2.5 text-left transition-colors hover:bg-accent"
      >
        <span className="block text-[10px] leading-relaxed text-muted-foreground">
          {first!.reason}
        </span>
        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-foreground">
          {(() => {
            const Icon = ICON[first!.kind];
            return <Icon size={12} className="shrink-0 text-star-done" />;
          })()}
          <span className="min-w-0 flex-1 truncate">{first!.label}</span>
        </span>
      </button>

      {rest.length > 0 && (
        <ul className="mt-1.5 space-y-0.5">
          {rest.map((action) => {
            const Icon = ICON[action.kind];
            return (
              <li key={`${action.kind}:${action.label}`}>
                <button
                  onClick={() => onPick(action)}
                  title={action.reason}
                  className="flex w-full items-center gap-1.5 rounded-lg px-1.5 py-1 text-left text-[10px] text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <Icon size={10} className="shrink-0" />
                  <span className="min-w-0 flex-1 truncate">{action.label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
