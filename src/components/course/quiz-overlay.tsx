import { useEffect, useMemo, useState } from "react";
import { Layers, X } from "lucide-react";
import type { QuizLesson } from "@/data/lesson-types";
import { QuizSession } from "@/components/session/quiz-session";
import {
  reviewCard,
  saveReviewCards,
  type CourseQuestion,
  type LoadQuestionBank,
} from "@/lib/course-questions";
import { toQuizQuestions, useQuizHistory } from "@/lib/course-quiz";

/** Same bar the star map's own quizzes use. */
const THRESHOLD = 0.8;

export type QuizTarget = {
  /** Label shown in the header. */
  title: string;
  /** Stable key for the retry history. */
  poolKey: string;
  /** Bank entries to draw from. */
  examIds: string[];
};

type Props = {
  target: QuizTarget;
  loadQuestions: LoadQuestionBank;
  onClose: () => void;
};

export function QuizOverlay({ target, loadQuestions, onClose }: Props) {
  const [bank, setBank] = useState<Awaited<ReturnType<LoadQuestionBank>> | null>(null);
  const [failed, setFailed] = useState(false);
  const [wrongIds, setWrongIds] = useState<string[] | null>(null);
  const [cardMsg, setCardMsg] = useState<string | null>(null);
  const quizHistory = useQuizHistory();

  useEffect(() => {
    let alive = true;
    loadQuestions().then(
      (b) => alive && setBank(b),
      () => alive && setFailed(true),
    );
    return () => {
      alive = false;
    };
  }, [loadQuestions]);

  const { questions, byId } = useMemo(
    () =>
      bank
        ? toQuizQuestions(bank, target.examIds)
        : { questions: [], byId: new Map<string, CourseQuestion>() },
    [bank, target.examIds],
  );

  const lesson = useMemo<QuizLesson>(
    () => ({
      kind: "quiz",
      nodeId: `course:${target.poolKey}`,
      theory: [],
      threshold: THRESHOLD,
      questions,
    }),
    [target.poolKey, questions],
  );

  const makeCards = () => {
    if (!wrongIds?.length) return;
    const rows = wrongIds
      .map((id) => byId.get(id))
      .filter((q): q is CourseQuestion & { answer: string } => Boolean(q?.answer))
      .map((q) => reviewCard(q, q.answer));
    const { added, updated } = saveReviewCards(rows);
    setCardMsg(
      added || updated
        ? [added ? `Đã thêm ${added} thẻ` : "", updated ? `cập nhật ${updated} thẻ` : ""]
            .filter(Boolean)
            .join(", ")
        : "Không tạo được thẻ",
    );
  };

  return (
    <div className="fixed inset-0 z-[80] flex flex-col bg-background">
      <header className="flex items-center gap-2 border-b border-border px-4 py-2.5">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] text-muted-foreground">Luyện nhanh · không tính vào điểm</p>
          <h2 className="truncate text-sm font-semibold text-foreground">{target.title}</h2>
        </div>

        {wrongIds && wrongIds.length > 0 && (
          <button
            onClick={makeCards}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-[11px] text-foreground transition-colors hover:bg-accent"
          >
            <Layers size={13} /> {cardMsg ?? `Tạo thẻ từ ${wrongIds.length} câu sai`}
          </button>
        )}

        <button
          onClick={onClose}
          aria-label="Đóng phiên luyện"
          className="rounded-lg border border-border p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <X size={15} />
        </button>
      </header>

      <div className="flex min-h-0 flex-1 overflow-y-auto no-scrollbar">
        {failed ? (
          <p className="m-auto max-w-sm p-8 text-center text-sm text-muted-foreground">
            Không tải được kho câu hỏi. Thử lại sau.
          </p>
        ) : !bank || !quizHistory.hydrated ? (
          <p className="m-auto p-8 text-sm text-muted-foreground">Đang tải kho câu hỏi…</p>
        ) : questions.length === 0 ? (
          <p className="m-auto max-w-sm p-8 text-center text-sm leading-relaxed text-muted-foreground">
            Chưa bóc được câu hỏi có đáp án cho phần này. Các đề dạng nghe và Part 7 không tách rời
            được khỏi audio hay bài đọc nên không đưa vào luyện nhanh.
          </p>
        ) : (
          <QuizSession
            lesson={lesson}
            title={`${questions.length} câu trong kho`}
            history={quizHistory.historyFor(target.poolKey)}
            closeLabel="Về khoá học"
            onFinish={(_pct, seen, wrong) => {
              quizHistory.record(target.poolKey, seen, wrong);
              setWrongIds(wrong);
              setCardMsg(null);
            }}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
