/** Kiểu dữ liệu chung cho mọi bài học nằm TRONG app. */

export type QuizQuestion = {
  id: string;
  prompt: string;
  /** từ/câu đọc mẫu bằng Web Speech API (dùng cho phát âm) */
  speak?: string;
  options: string[];
  answer: number;
  explain: string;
};

export type QuizLesson = {
  kind: "quiz";
  nodeId: string;
  /** đoạn lý thuyết ngắn hiện ngay trong panel */
  theory: string[];
  /** bài lý thuyết đầy đủ, có thẻ <b>/<i>, xuống dòng \n, khối ⚠️ và ❌/✅ */
  richTheory?: string;
  /** ngưỡng đạt, 0..1 */
  threshold: number;
  questions: QuizQuestion[];
};

export type FlashCard = {
  id: string;
  front: string;
  back: string;
  hint?: string;
  /** nội dung đọc bằng Web Speech API (giọng en-GB) */
  speak?: string;
  ipa?: string;
  pos?: string;
  meaning?: string;
  example?: string;
  topic?: string;
};

export type DeckLesson = {
  kind: "deck";
  nodeId: string;
  theory: string[];
  cards: FlashCard[];
};

export type SelfLesson = {
  kind: "self";
  nodeId: string;
  mode: "speaking" | "writing";
  theory: string[];
  prompt: string;
  /** giây — dùng cho cue card Speaking */
  timers?: { label: string; seconds: number }[];
  /** khung bố cục từng đoạn cho Writing */
  outline?: { label: string; hint: string; minWords: number }[];
  checklist: string[];
};

export type ScoreLesson = {
  kind: "score";
  nodeId: string;
  theory: string[];
  /** số câu đúng tối thiểu để tính là ĐẠT */
  target: number;
  max: number;
  unit: string;
};

export type Lesson = QuizLesson | DeckLesson | SelfLesson | ScoreLesson;

/** Sao được chấm bằng bài làm hay chỉ do người học tự khai? */
export type Verification = "verified" | "self";

export function verificationOf(kind: Lesson["kind"]): Verification {
  return kind === "self" ? "self" : "verified";
}
