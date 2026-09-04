import { History, X } from "lucide-react";

type Props = {
  days: string[]; // các ngày có sao được thắp, tăng dần
  active: boolean;
  index: number;
  onToggle: () => void;
  onChange: (i: number) => void;
};

export function JourneySlider({ days, active, index, onToggle, onChange }: Props) {
  if (days.length === 0) return null;
  const label = index >= days.length ? "Hôm nay" : days[index];

  return (
    <div className="pointer-events-auto rounded-2xl border border-border bg-card/75 px-4 py-3 backdrop-blur-xl">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          className="flex items-center gap-1.5 text-xs font-medium text-foreground"
        >
          {active ? <X size={13} /> : <History size={13} className="text-star-done" />}
          {active ? "Thoát xem lại" : "Xem lại hành trình"}
        </button>
        {active && <span className="text-[11px] text-muted-foreground">{label}</span>}
      </div>
      {active && (
        <input
          type="range"
          min={0}
          max={days.length}
          value={index}
          onChange={(e) => onChange(Number(e.target.value))}
          aria-label="Tua lại hành trình"
          className="mt-3 w-72 max-w-full accent-[var(--star-done)]"
        />
      )}
    </div>
  );
}
