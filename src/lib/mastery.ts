import { lessonFor } from "@/data/lessons";
import { verificationOf, type Verification } from "@/data/lesson-types";
import { LADDER, dayKey, daysBetween, isMature, overdueDays, type CardState } from "@/lib/srs";
import { DECAY, decayFor, type DecayInfo } from "@/lib/decay";
import { ALL_ITEM_IDS } from "@/data/ielts-map";
import { VOCAB_TIER_BY_NODE, TIER_UNLOCK_RATIO } from "@/data/vocabulary";

export type QuizRecord = {
  best: number; // 0..1
  attempts: { at: string; pct: number }[];
  passedAt?: string;
  confirmedAt?: string;
  /** id các câu đã gặp ở lần làm gần nhất */
  lastSeen?: string[];
  /** id các câu từng làm sai, ưu tiên hỏi lại */
  wrong?: string[];
};

export type SelfRecord = { ratio: number; at: string; checks: string[] };

export type ScoreRecord = { at: string; score: number; target: number; pass: boolean };

export type LearningData = {
  quiz: Record<string, QuizRecord>;
  cards: Record<string, CardState>;
  self: Record<string, SelfRecord>;
  scores: Record<string, ScoreRecord[]>;
  /** Ngày được ân xá một lần — mọi sao tính như vừa ôn hôm đó. */
  amnestyAt?: string | undefined;
};

export type Mastery = {
  nodeId: string;
  brightness: number; // 0..1
  verification: Verification;
  /** đang mờ dần vì tới hạn ôn mà chưa ôn */
  fading: boolean;
  detail: string;
  /** độ sáng trước khi trừ hao vì bỏ ôn — dùng để nói "đã mất bao nhiêu" */
  peak: number;
  decay: DecayInfo;
};

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export function cardScore(c: CardState | undefined) {
  if (!c || c.step < 0) return { value: 0, fading: false };
  const base = isMature(c) ? 1 : (c.step + 1) / LADDER.length;
  const od = overdueDays(c);
  // Thẻ nhớ càng lâu thì trừ càng chậm — quá hạn 3 ngày trên thẻ 58 ngày gần
  // như không đáng gì, nhưng trên thẻ 1 ngày thì đáng. Ân hạn và sàn dùng
  // chung với phần còn lại của app.
  const over = Math.max(0, od - DECAY.graceDays);
  const decay = over === 0 ? 1 : Math.max(DECAY.floor, 1 - over / (Math.max(c.interval, 1) * 3));
  return { value: clamp01(base * decay), fading: over > 0 };
}

/** Ngày gần nhất người học thực sự làm gì đó với ngôi sao này. */
export function lastActiveOf(nodeId: string, d: LearningData): string | undefined {
  const lesson = lessonFor(nodeId);

  if (lesson.kind === "quiz") {
    const r = d.quiz[nodeId];
    const last = r?.attempts?.[r.attempts.length - 1]?.at;
    return last ?? r?.confirmedAt ?? r?.passedAt;
  }

  if (lesson.kind === "deck") {
    // Thẻ tự quản hạn ôn riêng nên deck không dùng mốc này để trừ hao,
    // chỉ để hiển thị "lần cuối bạn động vào".
    let latest: string | undefined;
    for (const c of lesson.cards) {
      const at = d.cards[c.id]?.last;
      if (at && (!latest || at > latest)) latest = at;
    }
    return latest;
  }

  if (lesson.kind === "self") return d.self[nodeId]?.at;

  const list = d.scores[nodeId] ?? [];
  return list[list.length - 1]?.at;
}

export function nodeMastery(nodeId: string, d: LearningData): Mastery {
  const lesson = lessonFor(nodeId);
  const verification = verificationOf(lesson.kind);
  const lastAt = lastActiveOf(nodeId, d);
  const decay = decayFor(lastAt, dayKey(), d.amnestyAt);

  /** Bọc kết quả: nhân hệ số nguội vào độ sáng và giữ lại mức đỉnh. */
  const withDecay = (peak: number, detail: string, fading = false): Mastery => ({
    nodeId,
    brightness: clamp01(peak * decay.factor),
    verification,
    fading: fading || decay.decaying,
    detail,
    peak: clamp01(peak),
    decay,
  });

  if (lesson.kind === "quiz") {
    const r = d.quiz[nodeId];
    if (!r) return withDecay(0, "Chưa luyện");
    if (r.confirmedAt) return withDecay(1, "Đã củng cố sau 3 ngày");
    if (r.passedAt) {
      const age = daysBetween(r.passedAt, dayKey());
      const ready = age >= 3;
      return withDecay(
        0.7,
        ready ? "Làm lại để sáng trọn 100%" : `Đạt ${Math.round(r.best * 100)}%`,
      );
    }
    return withDecay(
      r.best,
      `Cao nhất ${Math.round(r.best * 100)}% — đọc lại phần lý thuyết rồi làm lại (cần ${Math.round(
        lesson.threshold * 100,
      )}%)`,
    );
  }

  if (lesson.kind === "deck") {
    if (lesson.cards.length === 0) return withDecay(0, "Chưa có thẻ");
    let sum = 0;
    let fading = false;
    let mature = 0;
    for (const c of lesson.cards) {
      const s = cardScore(d.cards[c.id]);
      sum += s.value;
      if (s.fading) fading = true;
      if (isMature(d.cards[c.id])) mature += 1;
    }
    const vocabTier = VOCAB_TIER_BY_NODE[nodeId] || nodeId.startsWith("my-");
    const peak = vocabTier ? mature / lesson.cards.length : sum / lesson.cards.length;
    // Từng thẻ đã tự trừ hao theo hạn ôn của nó rồi, cộng thêm lần nữa là phạt kép.
    return {
      nodeId,
      brightness: clamp01(peak),
      verification,
      fading,
      detail: `${mature}/${lesson.cards.length} thẻ nhớ lâu (≥21 ngày)`,
      peak: clamp01(peak),
      decay: { ...decay, factor: 1, decaying: false, atFloor: false },
    };
  }

  if (lesson.kind === "self") {
    const r = d.self[nodeId];
    if (!r) return withDecay(0, "Chưa tự đánh giá");
    return withDecay(r.ratio, `Tự đánh giá ${Math.round(r.ratio * 100)}%`);
  }

  const list = d.scores[nodeId] ?? [];
  let streak = 0;
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (list[i]!.pass) streak += 1;
    else break;
  }
  return withDecay(streak / 3, list.length ? `${streak}/3 lần đạt liên tiếp` : "Chưa nhập điểm");
}

/** Tầng từ vựng bị khoá khi tầng trước chưa sáng đủ 75% (trừ khi mở sớm). */
export function vocabTierLocked(nodeId: string, d: LearningData, unlockAll = false) {
  const tier = VOCAB_TIER_BY_NODE[nodeId];
  if (!tier || tier === 1 || unlockAll) return false;
  const prevNode = tier === 2 ? "v-1" : "v-2";
  return nodeMastery(prevNode, d).brightness < TIER_UNLOCK_RATIO;
}

export function allMastery(d: LearningData): Record<string, Mastery> {
  const out: Record<string, Mastery> = {};
  for (const id of ALL_ITEM_IDS) out[id] = nodeMastery(id, d);
  return out;
}

/**
 * Người học đã mất bao nhiêu phần độ sáng TỪNG CÓ, 0..1.
 *
 * Chia cho tổng đỉnh chứ không chia cho số sao trên bản đồ: người mới học 3 mục
 * mà mất sạch cả 3 thì với họ là mất 100%, dù 3 mục chỉ chiếm 3% bản đồ. Chia
 * cho cả bản đồ sẽ ra ~2% và không bao giờ chạm ngưỡng mời.
 */
export function brightnessLost(m: Record<string, Mastery>): number {
  let peak = 0;
  let lost = 0;
  for (const x of Object.values(m)) {
    peak += x.peak;
    lost += Math.max(0, x.peak - x.brightness);
  }
  return peak > 0 ? lost / peak : 0;
}

/** Thẻ tới hạn ôn trên toàn bộ bộ thẻ. */
export function dueCards(d: LearningData) {
  const today = dayKey();
  const out: { nodeId: string; cardId: string }[] = [];
  for (const id of ALL_ITEM_IDS) {
    const lesson = lessonFor(id);
    if (lesson.kind !== "deck") continue;
    for (const c of lesson.cards) {
      const st = d.cards[c.id];
      if (!st || st.due <= today) out.push({ nodeId: id, cardId: c.id });
    }
  }
  return out;
}
