import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  PHASES,
  PHASE_ITEM_IDS,
  ALL_ITEM_IDS,
  CONSTELLATION_ITEM_IDS,
  type ConstellationId,
} from "@/data/ielts-map";
import { dayKey, reviewCard, type CardState, type Grade } from "@/lib/srs";
import {
  allMastery,
  type LearningData,
  type Mastery,
  type QuizRecord,
  type ScoreRecord,
  type SelfRecord,
  brightnessLost,
} from "@/lib/mastery";
import { daysBetween } from "@/lib/srs";
import { useMyCardsVersion } from "@/lib/my-cards";
import { LIT_THRESHOLD, amnestyEligible } from "@/lib/decay";
import { useCloudProgress } from "@/lib/cloud-progress";

export type Status = "todo" | "doing" | "done";

export type ProgressState = {
  version: 2;
  notes: Record<string, string>;
  days: string[];
  freezes: string[];
  seenIntro: boolean;
  /** sao ĐANG sáng (>=80%) và ngày thắp gần nhất — bỏ ôn thì bị gỡ khỏi đây */
  doneAt: Record<string, string>;
  /** mốc thắp lần đầu, chỉ ghi thêm không bao giờ xoá — nuôi thanh xem lại hành trình */
  everLit: Record<string, string>;
  quiz: Record<string, QuizRecord>;
  cards: Record<string, CardState>;
  self: Record<string, SelfRecord>;
  scores: Record<string, ScoreRecord[]>;
  /** Ngày được ân xá — mốc để tính lại độ nguội. Chỉ có khi thực sự nhận. */
  amnestyAt?: string;
  /** Đã tiêu quyền ân xá: nhận rồi HOẶC đã từ chối. Tách khỏi amnestyAt để
   *  người bấm "để sau" không bị hỏi lại mãi. */
  amnestyUsed?: boolean;
};

const KEY = "ban-do-ielts:v2";
const LEGACY_KEY = "ban-do-ielts:v1";

const EMPTY: ProgressState = {
  version: 2,
  notes: {},
  days: [],
  freezes: [],
  seenIntro: false,
  doneAt: {},
  everLit: {},
  quiz: {},
  cards: {},
  self: {},
  scores: {},
};

function load(): ProgressState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      const p = JSON.parse(raw) as Partial<ProgressState>;
      return { ...EMPTY, ...p, version: 2 };
    }
    // nâng cấp từ schema v1: giữ ghi chú, lịch sử ngày và streak
    const old = window.localStorage.getItem(LEGACY_KEY);
    if (old) {
      const p = JSON.parse(old) as Record<string, unknown>;
      return {
        ...EMPTY,
        notes: (p["notes"] as Record<string, string>) ?? {},
        days: (p["days"] as string[]) ?? [],
        freezes: (p["freezes"] as string[]) ?? [],
        seenIntro: Boolean(p["seenIntro"]),
      };
    }
  } catch {
    /* bỏ qua dữ liệu hỏng */
  }
  return EMPTY;
}

export { dayKey };

function shift(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return dayKey(d);
}

export function streakFrom(days: string[], freezes: string[] = []) {
  const set = new Set([...days, ...freezes]);
  let n = 0;
  const d = new Date();
  if (!set.has(dayKey(d))) d.setDate(d.getDate() - 1);
  for (;;) {
    const key = dayKey(d);
    if (!set.has(key)) break;
    n += 1;
    d.setDate(d.getDate() - 1);
  }
  return n;
}

export function useProgress(opts?: { ieltsEarly?: boolean; uid?: string | null }) {
  const [state, setState] = useState<ProgressState>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setState(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, hydrated]);

  /** Nhận bản trên mây và gộp vào bản đang có ở máy. */
  const applyRemote = useCallback(
    (merge: (local: ProgressState) => ProgressState) => setState((s) => merge(s)),
    [],
  );

  const cloud = useCloudProgress(opts?.uid ?? null, state, hydrated, applyRemote);

  const touchDay = (s: ProgressState): ProgressState => {
    const t = dayKey();
    return s.days.includes(t) ? s : { ...s, days: [...s.days, t] };
  };

  const data: LearningData = useMemo(
    () => ({
      quiz: state.quiz,
      cards: state.cards,
      self: state.self,
      scores: state.scores,
      amnestyAt: state.amnestyAt,
    }),
    [state.quiz, state.cards, state.self, state.scores, state.amnestyAt],
  );

  // thêm/xoá thẻ tự tạo cũng làm đổi độ sáng sao "Từ của tôi"
  const myCardsVersion = useMyCardsVersion();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const mastery: Record<string, Mastery> = useMemo(() => allMastery(data), [data, myCardsVersion]);

  const brightness: Record<string, number> = useMemo(
    () => Object.fromEntries(Object.entries(mastery).map(([id, m]) => [id, m.brightness])),
    [mastery],
  );

  const selfReported = useMemo(
    () =>
      new Set(
        Object.values(mastery)
          .filter((m) => m.verification === "self")
          .map((m) => m.nodeId),
      ),
    [mastery],
  );

  // Đồng bộ tập "sao đang sáng". Sao nguội xuống dưới ngưỡng thì bị gỡ dấu —
  // litCount giảm, sao trên bản đồ tối lại. Mốc thắp lần đầu vẫn giữ ở everLit
  // để thanh xem lại hành trình không mất lịch sử.
  useEffect(() => {
    if (!hydrated) return;
    const lit = new Set(ALL_ITEM_IDS.filter((id) => (brightness[id] ?? 0) >= LIT_THRESHOLD));
    const added = [...lit].filter((id) => !state.doneAt[id]);
    const removed = Object.keys(state.doneAt).filter((id) => !lit.has(id));
    if (added.length === 0 && removed.length === 0) return;

    setState((s) => {
      const doneAt = { ...s.doneAt };
      const everLit = { ...s.everLit };
      const t = dayKey();
      added.forEach((id) => {
        doneAt[id] = t;
        everLit[id] ??= t;
      });
      removed.forEach((id) => delete doneAt[id]);
      return { ...s, doneAt, everLit };
    });
  }, [brightness, hydrated, state.doneAt, state.everLit]);

  /* ---------- ân xá một lần, đổi bằng một bài test ---------- */

  const lost = useMemo(() => brightnessLost(mastery), [mastery]);
  const amnestyOffer = amnestyEligible({ used: state.amnestyUsed === true, lost });
  // recordQuiz nằm trong useCallback không phụ thuộc state, nên đọc qua ref để
  // luôn thấy giá trị mới nhất mà không phải tạo lại hàm.
  const offerRef = useRef(false);
  offerRef.current = amnestyOffer;

  /** Bấm "để sau": tiêu quyền nhưng không đặt mốc — độ sáng giữ nguyên như đang có. */
  const declineAmnesty = useCallback(
    () => setState((s) => (s.amnestyUsed === true ? s : { ...s, amnestyUsed: true })),
    [],
  );

  /* ---------- cập nhật kết quả học ---------- */

  const recordQuiz = useCallback(
    (
      nodeId: string,
      pct: number,
      threshold: number,
      seen: string[] = [],
      wrongIds: string[] = [],
    ) => {
      setState((s) => {
        const prev = s.quiz[nodeId];
        const at = dayKey();
        // câu làm đúng lần này thì gỡ khỏi danh sách "từng sai"
        const keepWrong = (prev?.wrong ?? []).filter(
          (id) => !seen.includes(id) || wrongIds.includes(id),
        );
        const rec: QuizRecord = {
          best: Math.max(prev?.best ?? 0, pct),
          attempts: [...(prev?.attempts ?? []), { at, pct }].slice(-30),
          lastSeen: seen,
          wrong: Array.from(new Set([...keepWrong, ...wrongIds])),
          ...(prev?.passedAt ? { passedAt: prev.passedAt } : {}),
          ...(prev?.confirmedAt ? { confirmedAt: prev.confirmedAt } : {}),
        };
        if (pct >= threshold) {
          if (!rec.passedAt) rec.passedAt = at;
          else if (!rec.confirmedAt && daysBetween(rec.passedAt, at) >= 3) rec.confirmedAt = at;
        }
        const next = touchDay({ ...s, quiz: { ...s.quiz, [nodeId]: rec } });
        // Làm xong một bài test là đủ để đổi lấy quyền ân xá — nhưng chỉ khi
        // lời mời đang hiện, để không tiêu mất quyền vào lúc chưa cần.
        return offerRef.current && next.amnestyUsed !== true
          ? { ...next, amnestyAt: at, amnestyUsed: true }
          : next;
      });
    },
    [],
  );

  const gradeCard = useCallback((cardId: string, grade: Grade) => {
    setState((s) =>
      touchDay({ ...s, cards: { ...s.cards, [cardId]: reviewCard(s.cards[cardId], grade) } }),
    );
  }, []);

  const recordSelf = useCallback((nodeId: string, checks: string[], total: number) => {
    setState((s) =>
      touchDay({
        ...s,
        self: {
          ...s.self,
          [nodeId]: { checks, ratio: total ? checks.length / total : 0, at: dayKey() },
        },
      }),
    );
  }, []);

  const recordScore = useCallback((nodeId: string, score: number, target: number) => {
    setState((s) =>
      touchDay({
        ...s,
        scores: {
          ...s.scores,
          [nodeId]: [
            ...(s.scores[nodeId] ?? []),
            { at: dayKey(), score, target, pass: score >= target },
          ].slice(-30),
        },
      }),
    );
  }, []);

  const setNote = useCallback((id: string, note: string) => {
    setState((s) => ({ ...s, notes: { ...s.notes, [id]: note } }));
  }, []);

  const markIntroSeen = useCallback(() => setState((s) => ({ ...s, seenIntro: true })), []);

  const reset = useCallback(() => setState({ ...EMPTY, seenIntro: true }), []);

  const freezeAvailable = !state.freezes.some((f) => f >= shift(6));
  const useFreeze = useCallback(() => {
    setState((s) => {
      if (s.freezes.some((f) => f >= shift(6))) return s;
      const set = new Set([...s.days, ...s.freezes]);
      for (let i = 1; i <= 7; i += 1) {
        const key = shift(i);
        if (!set.has(key)) return { ...s, freezes: [...s.freezes, key] };
      }
      return s;
    });
  }, []);

  /* ---------- tổng hợp ---------- */

  const avg = (ids: string[]) =>
    ids.length
      ? Math.round((ids.reduce((n, id) => n + (brightness[id] ?? 0), 0) / ids.length) * 100)
      : 0;

  const percent = avg(ALL_ITEM_IDS);
  const phasePercent: Record<string, number> = Object.fromEntries(
    Object.entries(PHASE_ITEM_IDS).map(([pid, ids]) => [pid, avg(ids)]),
  );

  const constellationPercent: Record<ConstellationId, number> = {
    base: avg(CONSTELLATION_ITEM_IDS.base),
    toeic: avg(CONSTELLATION_ITEM_IDS.toeic),
    ielts: avg(CONSTELLATION_ITEM_IDS.ielts),
  };

  const unlocked: Record<string, boolean> = {};
  PHASES.forEach((p) => {
    const need = p.requiresPercent ?? 70;
    if (p.requiresConstellation) {
      const early = opts?.ieltsEarly && p.constellation === "ielts";
      unlocked[p.id] = Boolean(early) || constellationPercent[p.requiresConstellation] >= need;
    } else if (p.requires) {
      unlocked[p.id] = (phasePercent[p.requires] ?? 0) >= need && unlocked[p.requires] === true;
    } else {
      unlocked[p.id] = true;
    }
  });

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const key = shift(6 - i);
    return { key, active: state.days.includes(key), frozen: state.freezes.includes(key) };
  });

  const litCount = ALL_ITEM_IDS.filter((id) => (brightness[id] ?? 0) >= 0.8).length;

  return {
    state,
    data,
    hydrated,
    mastery,
    brightness,
    selfReported,
    recordQuiz,
    gradeCard,
    recordSelf,
    recordScore,
    setNote,
    reset,
    markIntroSeen,
    useFreeze,
    freezeAvailable,
    last7,
    litCount,
    total: ALL_ITEM_IDS.length,
    percent,
    phasePercent,
    constellationPercent,
    unlocked,
    streak: streakFrom(state.days, state.freezes),
    syncStatus: cloud.status,
    lastSaved: cloud.lastSaved,
    amnestyOffer,
    amnestyLost: lost,
    declineAmnesty,
  };
}

export type ProgressApi = ReturnType<typeof useProgress>;
