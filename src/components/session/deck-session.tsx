import { useMemo, useState } from "react";
import { ArrowLeft, RotateCcw, Volume2 } from "lucide-react";
import type { DeckLesson, FlashCard } from "@/data/lesson-types";
import type { CardState, Grade } from "@/lib/srs";
import { LADDER, isMature } from "@/lib/srs";

const SESSION_SIZE = 8;

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = "en-GB";
  u.rate = 0.9;
  const v = window.speechSynthesis.getVoices().find((x) => x.lang === "en-GB");
  if (v) u.voice = v;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(u);
}

type Props = {
  lesson: DeckLesson;
  title: string;
  cards: Record<string, CardState>;
  /** chỉ lấy các thẻ tới hạn, tối đa n thẻ */
  limit?: number;
  /** thẻ tự tạo của người học, trộn chung vào phiên */
  mixCards?: FlashCard[];
  onGrade: (cardId: string, grade: Grade) => void;
  onClose: () => void;
};

const GRADES: { g: Grade; label: string; cls: string }[] = [
  { g: "forgot", label: "Quên", cls: "border-destructive text-destructive" },
  { g: "vague", label: "Mơ hồ", cls: "border-border text-foreground" },
  { g: "known", label: "Nhớ rõ", cls: "border-star-done text-star-done" },
];

export function DeckSession({ lesson, title, cards, limit, mixCards, onGrade, onClose }: Props) {
  const today = new Date().toISOString().slice(0, 10);
  const initial = useMemo(() => {
    const seen = new Set<string>();
    const pool = [...lesson.cards, ...(mixCards ?? [])].filter((c) => {
      if (seen.has(c.id)) return false;
      seen.add(c.id);
      return true;
    });
    const due = pool.filter((c) => {
      const st = cards[c.id];
      return !st || st.due <= today;
    });
    const list = (due.length ? due : pool).slice(0, limit ?? SESSION_SIZE);
    // thẻ đầu tiên luôn là một thẻ đã thuộc (khoảng ôn >= 21 ngày) để thắng nhanh
    const winIdx = list.findIndex((c) => isMature(cards[c.id]));
    if (winIdx > 0) {
      const win = list[winIdx]!;
      list.splice(winIdx, 1);
      list.unshift(win);
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.nodeId]);

  const [queue, setQueue] = useState(initial);
  const [i, setI] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [again, setAgain] = useState<typeof initial>([]);
  const [counts, setCounts] = useState({ known: 0, vague: 0, forgot: 0 });
  const [done, setDone] = useState(false);

  const card = queue[i];

  const grade = (g: Grade) => {
    if (!card) return;
    onGrade(card.id, g);
    setCounts((c) => ({ ...c, [g]: c[g] + 1 }));
    // quên thì hỏi lại cuối phiên
    const nextAgain = g === "forgot" ? [...again, card] : again;
    setAgain(nextAgain);
    setFlipped(false);
    if (i + 1 < queue.length) setI(i + 1);
    else if (nextAgain.length > 0) {
      setQueue(nextAgain);
      setAgain([]);
      setI(0);
    } else setDone(true);
  };

  if (queue.length === 0) {
    return (
      <div className="mx-auto w-full max-w-xl p-6 text-center">
        <p className="text-sm text-muted-foreground">Bộ thẻ này chưa có nội dung.</p>
        <button
          onClick={onClose}
          className="mt-6 rounded-xl border border-border px-4 py-3 text-sm"
        >
          Về bản đồ
        </button>
      </div>
    );
  }

  if (done) {
    return (
      <div className="mx-auto w-full max-w-xl p-6">
        <p className="text-xs uppercase tracking-widest text-muted-foreground">Xong phiên ôn</p>
        <h2 className="mt-2 text-3xl font-bold text-foreground">
          {counts.known} nhớ rõ · {counts.vague} mơ hồ · {counts.forgot} quên
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Thẻ nhớ rõ sẽ được hỏi lại theo lịch {LADDER.join(" – ")} ngày. Sao sáng theo số thẻ đạt
          khoảng ôn từ 21 ngày trở lên.
        </p>
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => {
              setQueue(initial);
              setI(0);
              setDone(false);
              setCounts({ known: 0, vague: 0, forgot: 0 });
            }}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-border px-4 py-3 text-sm"
          >
            <RotateCcw size={15} /> Ôn lại
          </button>
          <button
            onClick={onClose}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground"
          >
            <ArrowLeft size={15} /> Về bản đồ
          </button>
        </div>
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col p-6">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-star-done transition-[width] duration-500"
          style={{ width: `${(i / queue.length) * 100}%` }}
        />
      </div>
      <p className="mt-4 text-xs uppercase tracking-widest text-muted-foreground">
        {title} · Thẻ {i + 1}/{queue.length}
      </p>

      <div className="mt-6 min-h-56 w-full rounded-2xl border border-border bg-card/70 p-8 text-center">
        <button onClick={() => setFlipped(true)} className="w-full text-center">
          <p className="text-2xl font-semibold text-foreground">{card.front}</p>
          {card.ipa && <p className="mt-2 text-sm text-muted-foreground">{card.ipa}</p>}
        </button>
        {(card.speak || card.front) && (
          <button
            onClick={() => speak(card.speak ?? card.front)}
            aria-label="Nghe phát âm"
            className="mx-auto mt-4 flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm text-foreground hover:bg-accent"
          >
            <Volume2 size={16} /> Nghe
          </button>
        )}
        {card.hint && !flipped && <p className="mt-3 text-xs text-muted-foreground">{card.hint}</p>}
        {flipped ? (
          <div className="mt-6 space-y-2 text-left">
            <p className="text-lg leading-relaxed text-star-done">
              {card.pos ? <span className="text-muted-foreground">({card.pos}) </span> : null}
              {card.meaning ?? card.back}
            </p>
            {card.example && <p className="text-sm italic text-foreground">{card.example}</p>}
            {card.topic && (
              <span className="inline-block rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                {card.topic}
              </span>
            )}
          </div>
        ) : (
          <button
            onClick={() => setFlipped(true)}
            className="mt-6 w-full text-sm text-muted-foreground"
          >
            Bấm để lật thẻ
          </button>
        )}
      </div>

      {flipped && (
        <div className="mt-6 grid grid-cols-3 gap-3">
          {GRADES.map((g) => (
            <button
              key={g.g}
              onClick={() => grade(g.g)}
              className={`rounded-xl border px-3 py-4 text-sm font-semibold hover:bg-accent ${g.cls}`}
            >
              {g.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
