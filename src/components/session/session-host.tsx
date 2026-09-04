import { X } from "lucide-react";
import { lessonFor } from "@/data/lessons";
import { QuizSession } from "./quiz-session";
import { DeckSession } from "./deck-session";
import { SelfSession } from "./self-session";
import { ScoreSession } from "./score-session";
import type { ProgressApi } from "@/lib/progress";
import { myFlashCards } from "@/lib/my-cards";
import { ITEM_CONSTELLATION } from "@/data/ielts-map";

type Props = {
  nodeId: string | null;
  title: string;
  p: ProgressApi;
  /** phiên ôn nhanh: chỉ lấy 5 thẻ tới hạn */
  quickReview?: boolean;
  onClose: () => void;
};

export function SessionHost({ nodeId, title, p, quickReview, onClose }: Props) {
  if (!nodeId) return null;
  const lesson = lessonFor(nodeId);

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-y-auto no-scrollbar bg-background">
      <div className="flex justify-end p-4">
        <button
          onClick={onClose}
          aria-label="Đóng phiên làm bài"
          className="rounded-full p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X size={18} />
        </button>
      </div>

      {lesson.kind === "quiz" && (
        <QuizSession
          lesson={lesson}
          title={title}
          history={{
            ...(p.state.quiz[nodeId]?.lastSeen
              ? { lastSeen: p.state.quiz[nodeId]!.lastSeen! }
              : {}),
            ...(p.state.quiz[nodeId]?.wrong ? { wrong: p.state.quiz[nodeId]!.wrong! } : {}),
          }}
          onFinish={(pct, seen, wrongIds) =>
            p.recordQuiz(nodeId, pct, lesson.threshold, seen, wrongIds)
          }
          onClose={onClose}
        />
      )}

      {lesson.kind === "deck" && (
        <DeckSession
          lesson={lesson}
          title={title}
          cards={p.state.cards}
          {...(quickReview ? { limit: 5 } : {})}
          {...(nodeId.startsWith("my-")
            ? {}
            : { mixCards: myFlashCards(ITEM_CONSTELLATION[nodeId] ?? "base") })}
          onGrade={p.gradeCard}
          onClose={onClose}
        />
      )}

      {lesson.kind === "self" && (
        <SelfSession
          lesson={lesson}
          title={title}
          checked={p.state.self[nodeId]?.checks ?? []}
          onSave={(checks, total) => p.recordSelf(nodeId, checks, total)}
          onClose={onClose}
        />
      )}

      {lesson.kind === "score" && (
        <ScoreSession
          lesson={lesson}
          title={title}
          history={p.state.scores[nodeId] ?? []}
          onSave={(score, target) => p.recordScore(nodeId, score, target)}
          onClose={onClose}
        />
      )}
    </div>
  );
}
