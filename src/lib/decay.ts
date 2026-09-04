import { dayKey, daysBetween } from "@/lib/srs";

/**
 * Không ôn thì nguội dần.
 *
 * Mỗi ngôi sao nhớ ngày cuối cùng bạn thực sự làm gì đó với nó (làm quiz, chấm
 * thẻ, tự đánh giá, nhập điểm). Quá hạn ân hạn thì độ sáng nhân với hệ số giảm
 * dần theo ngày, chạm sàn thì dừng — không bao giờ mất trắng, để người nghỉ dài
 * quay lại vẫn còn chỗ bấu víu.
 *
 * Cấu hình "Vừa": ân hạn 2 ngày, mỗi ngày sau đó −6%, sàn 25%.
 */

export const DECAY = {
  /** Số ngày được nghỉ mà chưa bị trừ gì. */
  graceDays: 2,
  /** Mỗi ngày quá hạn trừ bao nhiêu phần độ sáng. */
  perDay: 0.06,
  /** Hệ số thấp nhất — độ sáng không xuống dưới mức này. */
  floor: 0.25,
} as const;

/** Sao coi là "đã thắp" khi độ sáng từ mức này trở lên. */
export const LIT_THRESHOLD = 0.8;

/** Dưới mức này thì phần lý thuyết bị gấp lại, phải chủ động mở ra ôn. */
export const COLD_THRESHOLD = 0.6;

export type DecayInfo = {
  /** Hệ số nhân vào độ sáng, 0.25 … 1. */
  factor: number;
  /** Số ngày không đụng tới sao này. */
  idleDays: number;
  /** Số ngày đã vượt quá ân hạn (0 nếu còn trong ân hạn). */
  overGrace: number;
  /** Đang bị trừ điểm. */
  decaying: boolean;
  /** Đã chạm sàn, không giảm thêm được nữa. */
  atFloor: boolean;
};

const NEUTRAL: DecayInfo = {
  factor: 1,
  idleDays: 0,
  overGrace: 0,
  decaying: false,
  atFloor: false,
};

/**
 * @param lastAt   ngày hoạt động gần nhất của sao (yyyy-mm-dd), undefined = chưa học
 * @param amnestyAt ngày được ân xá — mọi sao coi như vừa ôn hôm đó
 */
export function decayFor(
  lastAt: string | undefined,
  today = dayKey(),
  amnestyAt?: string | undefined,
): DecayInfo {
  // Ân xá xoá sạch nợ cũ: tính từ mốc được tha, không tính từ lần học cuối.
  const from = amnestyAt && (!lastAt || amnestyAt > lastAt) ? amnestyAt : lastAt;
  if (!from) return NEUTRAL;

  const idleDays = Math.max(0, daysBetween(from, today));
  const overGrace = Math.max(0, idleDays - DECAY.graceDays);
  if (overGrace === 0) return { ...NEUTRAL, idleDays };

  const raw = 1 - overGrace * DECAY.perDay;
  const factor = Math.max(DECAY.floor, raw);
  return {
    factor,
    idleDays,
    overGrace,
    decaying: true,
    atFloor: raw <= DECAY.floor,
  };
}

/** Còn bao nhiêu ngày nữa mới bắt đầu bị trừ. Null nếu đang bị trừ rồi. */
export function daysUntilDecay(lastAt: string | undefined, today = dayKey()): number | null {
  if (!lastAt) return null;
  const left = DECAY.graceDays - Math.max(0, daysBetween(lastAt, today));
  return left > 0 ? left : null;
}

/** Câu mô tả ngắn để hiện trong panel. */
export function decayLabel(d: DecayInfo): string | null {
  if (!d.decaying) return null;
  const pct = Math.round((1 - d.factor) * 100);
  if (d.atFloor) return `Nguội hẳn — ${d.idleDays} ngày chưa ôn, đã mất ${pct}% độ sáng`;
  return `Đang nguội — ${d.idleDays} ngày chưa ôn, mất ${pct}% độ sáng`;
}

/* ---------------- Ân xá một lần ---------------- */

/**
 * Mỗi tài khoản được tha một lần duy nhất, và phải đổi bằng một bài test —
 * không cho không. Dành cho người quay lại sau thời gian dài thấy bầu trời tối
 * sầm: thay vì bỏ cuộc, họ làm một bài để lấy lại tất cả.
 */
export const AMNESTY = {
  /** Phải tụt ít nhất chừng này mới đáng mời, tránh làm phiền người chỉ nghỉ vài hôm. */
  minLoss: 0.15,
} as const;

/** Đủ điều kiện mời ân xá chưa? */
export function amnestyEligible(opts: {
  used: boolean;
  /** độ sáng đã mất vì nguội, 0..1 */
  lost: number;
}) {
  return !opts.used && opts.lost >= AMNESTY.minLoss;
}
