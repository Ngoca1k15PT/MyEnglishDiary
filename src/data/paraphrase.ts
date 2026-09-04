import type { DeckLesson } from "./lesson-types";

/** Drill cặp từ / cụm đồng nghĩa, chấm bằng lặp lại ngắt quãng như từ vựng. */
export const PARAPHRASE_DECKS: DeckLesson[] = [
  {
    kind: "deck",
    nodeId: "para-1",
    theory: [
      "Paraphrase là kỹ năng dùng chung cho cả 4 kỹ năng: đề bài luôn được nói lại bằng cách khác.",
      "Ba cách chính: đổi từ đồng nghĩa, đổi loại từ, đổi cấu trúc câu.",
      "Mỗi thẻ là một cặp — nhìn vế trái, tự nói vế phải trước khi lật thẻ.",
    ],
    cards: [
      { id: "pa-c1", front: "important", back: "significant / crucial / vital" },
      { id: "pa-c2", front: "children", back: "youngsters / the younger generation" },
      { id: "pa-c3", front: "a lot of people think", back: "it is widely believed that" },
      { id: "pa-c4", front: "solve the problem", back: "tackle / address the issue" },
    ],
  },
];
