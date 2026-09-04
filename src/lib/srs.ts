/** SM-2 rút gọn: 3 mức chấm, khoảng ôn 1 – 3 – 8 – 21 – 58 ngày. */

export const LADDER = [1, 3, 8, 21, 58] as const;
export const MATURE_DAYS = 21;

export type Grade = "forgot" | "vague" | "known";

export type CardState = {
  /** vị trí trên thang khoảng ôn, -1 = chưa học */
  step: number;
  /** khoảng ôn hiện tại (ngày) */
  interval: number;
  /** ngày tới hạn (ISO yyyy-mm-dd) */
  due: string;
  last?: string;
};

export function dayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function addDays(days: number, from = new Date()) {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return dayKey(d);
}

export function daysBetween(a: string, b: string) {
  return Math.round((Date.parse(b) - Date.parse(a)) / 86400000);
}

export function reviewCard(prev: CardState | undefined, grade: Grade): CardState {
  const step = prev?.step ?? -1;
  let next: number;
  if (grade === "known") next = Math.min(step + 1, LADDER.length - 1);
  else if (grade === "vague") next = Math.max(0, step);
  else next = -1;

  const interval = next < 0 ? 0 : LADDER[next]!;
  return {
    step: next,
    interval,
    due: addDays(Math.max(interval, 0)),
    last: dayKey(),
  };
}

export function isMature(c: CardState | undefined) {
  return !!c && c.interval >= MATURE_DAYS;
}

export function isDue(c: CardState | undefined, today = dayKey()) {
  return !c || c.due <= today;
}

/** Số ngày đã quá hạn của một thẻ (0 nếu chưa tới hạn). */
export function overdueDays(c: CardState | undefined, today = dayKey()) {
  if (!c) return 0;
  const n = daysBetween(c.due, today);
  return n > 0 ? n : 0;
}
