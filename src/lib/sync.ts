import type { ProgressState } from "@/lib/progress";
import type { CardState } from "@/lib/srs";
import type { QuizRecord, ScoreRecord, SelfRecord } from "@/lib/mastery";

/**
 * Gộp tiến trình giữa máy này và bản trên Firestore.
 *
 * Không dùng "bản mới hơn thắng" cho cả cục: người học có thể ôn thẻ trên điện
 * thoại sáng nay rồi mở laptop (dữ liệu cũ từ tuần trước) — ghi đè nguyên khối
 * là mất trắng buổi sáng. Thay vào đó gộp theo từng mục, và với mỗi mục chọn
 * bên nào "học được nhiều hơn", vì mất tiến trình khó chịu hơn nhiều so với
 * việc lỡ giữ lại một kết quả hơi cũ.
 */

const laterOf = (a: string | undefined, b: string | undefined) => (!a ? b : !b ? a : a > b ? a : b);

/** Cột mốc (đạt, củng cố, thắp sao) giữ lần SỚM nhất — đó mới là lịch sử thật. */
const earlierOf = (a: string | undefined, b: string | undefined) =>
  !a ? b : !b ? a : a < b ? a : b;

function mergeQuiz(a: QuizRecord | undefined, b: QuizRecord | undefined): QuizRecord | undefined {
  if (!a) return b;
  if (!b) return a;
  // Gộp lịch sử làm bài theo mốc thời gian, bỏ trùng.
  const seen = new Set<string>();
  const attempts = [...a.attempts, ...b.attempts]
    .filter((x) => {
      const k = `${x.at}:${x.pct}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .sort((x, y) => x.at.localeCompare(y.at))
    .slice(-30);

  const newer =
    (a.attempts[a.attempts.length - 1]?.at ?? "") >= (b.attempts[b.attempts.length - 1]?.at ?? "")
      ? a
      : b;
  const passedAt =
    laterOf(a.passedAt, b.passedAt) &&
    (a.passedAt && b.passedAt
      ? a.passedAt < b.passedAt
        ? a.passedAt
        : b.passedAt // giữ mốc ĐẠT SỚM NHẤT
      : (a.passedAt ?? b.passedAt));

  return {
    best: Math.max(a.best, b.best),
    attempts,
    ...(passedAt ? { passedAt } : {}),
    ...(laterOf(a.confirmedAt, b.confirmedAt)
      ? { confirmedAt: laterOf(a.confirmedAt, b.confirmedAt)! }
      : {}),
    ...(newer.lastSeen ? { lastSeen: newer.lastSeen } : {}),
    wrong: Array.from(new Set([...(a.wrong ?? []), ...(b.wrong ?? [])])),
  };
}

/** Thẻ nào được ôn gần đây hơn thì thắng — lịch ôn của nó mới là lịch đúng. */
function mergeCard(a: CardState | undefined, b: CardState | undefined): CardState | undefined {
  if (!a) return b;
  if (!b) return a;
  const al = a.last ?? "";
  const bl = b.last ?? "";
  if (al !== bl) return al > bl ? a : b;
  // Cùng ngày ôn: giữ bên đi xa hơn trên thang khoảng ôn.
  return a.step >= b.step ? a : b;
}

function mergeRecord<T>(
  a: Record<string, T> = {},
  b: Record<string, T> = {},
  pick: (x: T | undefined, y: T | undefined) => T | undefined,
): Record<string, T> {
  const out: Record<string, T> = {};
  for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const v = pick(a[k], b[k]);
    if (v !== undefined) out[k] = v;
  }
  return out;
}

const uniqSorted = (a: string[] = [], b: string[] = []) => Array.from(new Set([...a, ...b])).sort();

export function mergeProgress(local: ProgressState, remote: ProgressState): ProgressState {
  return {
    version: 2,
    // Ghi chú: bên nào dài hơn thì thường là bên viết thêm. Không bao giờ xoá chữ
    // người học đã viết chỉ vì máy kia chưa thấy.
    notes: mergeRecord(local.notes, remote.notes, (x, y) =>
      x === undefined ? y : y === undefined ? x : x.length >= y.length ? x : y,
    ),
    days: uniqSorted(local.days, remote.days),
    freezes: uniqSorted(local.freezes, remote.freezes),
    seenIntro: local.seenIntro || remote.seenIntro,
    // Quyền ân xá là một lần cho cả tài khoản: máy nào tiêu rồi thì mọi máy đều
    // hết. Nếu lỡ có hai mốc (hai máy cùng offline) thì lấy mốc muộn hơn cho
    // người học đỡ thiệt.
    ...(local.amnestyUsed || remote.amnestyUsed ? { amnestyUsed: true } : {}),
    ...(laterOf(local.amnestyAt, remote.amnestyAt)
      ? { amnestyAt: laterOf(local.amnestyAt, remote.amnestyAt)! }
      : {}),
    // Đang sáng: hợp của hai bên. Vòng tính lại độ sáng ngay sau đó sẽ tự gỡ
    // những sao đã nguội, nên không sợ giữ nhầm.
    doneAt: mergeRecord(local.doneAt, remote.doneAt, (x, y) => laterOf(x, y)),
    // Thắp lần đầu: giữ mốc SỚM nhất, đây là lịch sử.
    everLit: mergeRecord(local.everLit, remote.everLit, earlierOf),
    quiz: mergeRecord(local.quiz, remote.quiz, mergeQuiz),
    cards: mergeRecord(local.cards, remote.cards, mergeCard),
    self: mergeRecord(local.self, remote.self, (x, y) => (!x ? y : !y ? x : x.at >= y.at ? x : y)),
    scores: mergeRecord<ScoreRecord[]>(local.scores, remote.scores, (x, y) => {
      const seen = new Set<string>();
      return [...(x ?? []), ...(y ?? [])]
        .filter((r) => {
          const k = `${r.at}:${r.score}:${r.target}`;
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        })
        .sort((m, n) => m.at.localeCompare(n.at))
        .slice(-30);
    }),
  };
}

export type { SelfRecord };
