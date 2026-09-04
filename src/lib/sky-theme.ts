export type Sky = "night" | "day";

type Pair = [string, string];

const PALETTE: Record<
  Sky,
  {
    dim: Pair;
    fill: Pair;
    label: Pair;
    lockedLabel: Pair;
    pill: Pair;
    lineOp: [number, number];
    strokeW: [number, number];
  }
> = {
  night: {
    dim: ["#4A5E8A", "#93AEE6"],
    fill: ["#16203A", "#26375D"],
    label: ["#D6DEF0", "#FFFFFF"],
    lockedLabel: ["#93A3C4", "#C6D2E9"],
    pill: ["#0B1226", "#0A1020"],
    lineOp: [0.22, 0.48],
    strokeW: [2, 2.8],
  },
  day: {
    dim: ["#4B5563", "#1F2937"],
    fill: ["#FFFFFF", "#E7EDF8"],
    label: ["#1F2937", "#0B1220"],
    lockedLabel: ["#5B6675", "#2C3644"],
    pill: ["#FFFFFF", "#FFFFFF"],
    lineOp: [0.35, 0.6],
    strokeW: [2, 2.8],
  },
};

function hex(c: string) {
  const v = c.replace("#", "");
  return [
    parseInt(v.slice(0, 2), 16),
    parseInt(v.slice(2, 4), 16),
    parseInt(v.slice(4, 6), 16),
  ] as const;
}

function mix([a, b]: Pair, t: number) {
  const x = hex(a);
  const y = hex(b);
  const p = (i: 0 | 1 | 2) => Math.round(x[i] + (y[i] - x[i]) * t);
  return `rgb(${p(0)} ${p(1)} ${p(2)})`;
}

/** contrast: 0..1 — tăng độ rõ của các nút chưa học */
export function skyVars(sky: Sky, contrast: number): React.CSSProperties {
  const p = PALETTE[sky];
  const t = Math.max(0, Math.min(1, contrast));
  return {
    "--star-dim": mix(p.dim, t),
    "--star-dim-fill": mix(p.fill, t),
    "--star-label": mix(p.label, t),
    "--star-label-locked": mix(p.lockedLabel, t),
    "--label-pill": mix(p.pill, t),
    "--line-op": String(p.lineOp[0] + (p.lineOp[1] - p.lineOp[0]) * t),
    "--star-stroke-w": String(p.strokeW[0] + (p.strokeW[1] - p.strokeW[0]) * t),
    "--locked-op": String(0.55 + 0.25 * t),
  } as React.CSSProperties;
}
