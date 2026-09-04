import { GRAMMAR_LESSONS } from "./grammar";
import { PRONUNCIATION_LESSONS } from "./pronunciation";
import { STRATEGY_LESSONS } from "./strategies";
import { READING_TYPE_LESSONS } from "./reading-types";
import { VOCABULARY_DECKS } from "./vocabulary";
import { VOCAB_TOPIC_DECK } from "./vocab-topics";
import { PARAPHRASE_DECKS } from "./paraphrase";
import { TOEIC_LESSONS } from "./toeic";
import { ITEM_BY_ID } from "./ielts-map";
import type { Lesson, SelfLesson, ScoreLesson } from "./lesson-types";
import { myFlashCards, scopeOfMyNode } from "@/lib/my-cards";

const EXPLICIT: Lesson[] = [
  ...PRONUNCIATION_LESSONS,
  ...GRAMMAR_LESSONS,
  ...VOCABULARY_DECKS,
  VOCAB_TOPIC_DECK,
  ...PARAPHRASE_DECKS,
  ...STRATEGY_LESSONS,
  ...READING_TYPE_LESSONS,
  ...TOEIC_LESSONS,
];

const BY_ID: Record<string, Lesson> = Object.fromEntries(EXPLICIT.map((l) => [l.nodeId, l]));

/** Loại bài học suy ra từ id nút — dùng khi chưa có dữ liệu chi tiết. */
export function lessonKindFor(nodeId: string): Lesson["kind"] {
  if (nodeId.startsWith("my-")) return "deck";
  if (nodeId === "t-strategy") return "self";
  if (nodeId === "t-vocab") return "deck";
  if (nodeId.startsWith("t-p")) return "score";
  if (nodeId.startsWith("s2-")) return "self";
  if (nodeId.startsWith("w2-")) return "self";
  if (nodeId.startsWith("l3-") || nodeId.startsWith("r3-") || nodeId.startsWith("f-"))
    return "score";
  if (nodeId === "rule-1") return "score";
  if (nodeId.startsWith("v-") || nodeId === "para-1") return "deck";
  return "quiz";
}

function speakingLesson(nodeId: string): SelfLesson {
  const item = ITEM_BY_ID[nodeId];
  return {
    kind: "self",
    nodeId,
    mode: "speaking",
    theory: item?.tips ?? [],
    prompt:
      nodeId === "s2-2"
        ? "Describe a place you often go to. You should say: where it is, how often you go there, what you do there, and explain why you like it."
        : "Nói tự do về chủ đề của phần này trong 1–2 phút, bám sát cấu trúc trả lời đã học.",
    timers: [
      { label: "Chuẩn bị", seconds: 60 },
      { label: "Nói", seconds: 120 },
    ],
    checklist: [
      "Nói liên tục, không dừng quá 3 giây",
      "Trả lời đủ mọi ý trong cue card",
      "Dùng ít nhất 3 từ vựng chủ đề đã học",
      "Có ít nhất 2 cấu trúc ngữ pháp phức",
      "Phát âm rõ âm cuối",
    ],
  };
}

function writingLesson(nodeId: string): SelfLesson {
  const item = ITEM_BY_ID[nodeId];
  return {
    kind: "self",
    nodeId,
    mode: "writing",
    theory: item?.tips ?? [],
    prompt:
      "Some people think that governments should invest more in public transport. To what extent do you agree or disagree?",
    outline: [
      { label: "Mở bài", hint: "Paraphrase đề + nêu quan điểm", minWords: 40 },
      { label: "Thân bài 1", hint: "Ý chính + giải thích + ví dụ", minWords: 90 },
      { label: "Thân bài 2", hint: "Ý chính thứ hai + giải thích", minWords: 90 },
      { label: "Kết bài", hint: "Tóm lại quan điểm, không thêm ý mới", minWords: 30 },
    ],
    checklist: [
      "Trả lời đúng và đủ yêu cầu của đề",
      "Đủ số từ tối thiểu (150 / 250)",
      "Mỗi đoạn có một ý chính rõ ràng",
      "Có từ nối hợp lý, không lạm dụng",
      "Đọc lại và sửa lỗi ngữ pháp cơ bản",
    ],
  };
}

function scoreLesson(nodeId: string): ScoreLesson {
  const item = ITEM_BY_ID[nodeId];
  const reading = nodeId.startsWith("r3-") || nodeId === "f-2";
  return {
    kind: "score",
    nodeId,
    theory: item?.tips ?? [],
    target: reading ? 10 : 8,
    max: reading ? 13 : 10,
    unit: "câu đúng",
  };
}

/** Bài học của một nút. Luôn trả về một bài học (bản mẫu nếu chưa có dữ liệu thật). */
export function lessonFor(nodeId: string): Lesson {
  const myScope = scopeOfMyNode(nodeId);
  if (myScope) {
    return {
      kind: "deck",
      nodeId,
      theory: ITEM_BY_ID[nodeId]?.tips ?? [],
      cards: myFlashCards(myScope),
    };
  }
  const explicit = BY_ID[nodeId];
  if (explicit) return explicit;
  const kind = lessonKindFor(nodeId);
  const item = ITEM_BY_ID[nodeId];
  if (kind === "self")
    return nodeId.startsWith("w2-") ? writingLesson(nodeId) : speakingLesson(nodeId);
  if (kind === "score") return scoreLesson(nodeId);
  if (kind === "deck") return { kind: "deck", nodeId, theory: item?.tips ?? [], cards: [] };
  return { kind: "quiz", nodeId, theory: item?.tips ?? [], threshold: 0.8, questions: [] };
}

/** Có nội dung để luyện ngay trong app hay chưa. */
export function lessonReady(nodeId: string): boolean {
  const l = lessonFor(nodeId);
  if (l.kind === "quiz") return l.questions.length > 0;
  if (l.kind === "deck") return l.cards.length > 0;
  return true;
}

export const LESSON_NODE_IDS = EXPLICIT.map((l) => l.nodeId);
