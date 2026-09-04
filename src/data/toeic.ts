import type { ItemNode, LinkRef } from "./ielts-map";
import type { DeckLesson, Lesson, ScoreLesson, SelfLesson } from "./lesson-types";
import { TOEIC_PART5_QUIZ_LESSON } from "./toeicPart5";
import { TOEIC_VOCAB_CARDS } from "./toeicVocab";

const LT: LinkRef = {
  label: "Đề TOEIC mẫu (ETS)",
  url: "https://www.ets.org/toeic/test-takers/listening-reading/prepare.html",
};
const LY: LinkRef = {
  label: "Tìm video hướng dẫn trên YouTube",
  url: "https://www.youtube.com/results?search_query=TOEIC+listening+reading+strategy",
};

export type ToeicPart = {
  id: string;
  label: string;
  section: "listening" | "reading";
  questions: number;
  /** số câu đúng mục tiêu cho mốc 550 và 700 */
  goal550: number;
  goal700: number;
  desc: string;
  tips: string[];
};

export const TOEIC_PARTS: ToeicPart[] = [
  {
    id: "t-p1",
    label: "Part 1 — Photographs",
    section: "listening",
    questions: 6,
    goal550: 4,
    goal700: 5,
    desc: "Nghe 4 câu mô tả một bức ảnh, chọn câu đúng nhất. 6 câu, thuộc phần Listening.",
    tips: [
      "Nhìn ảnh TRƯỚC khi audio bắt đầu: ai đang làm gì, đồ vật ở đâu.",
      "Nghe kỹ động từ và thì. Bẫy hay gặp: is being + V3 (đang được làm) và has been + V3 (đã được làm) rất dễ nhầm.",
      "Loại ngay câu có từ nghe giống nhưng nghĩa khác: walking và working, chair và share.",
      "Nếu ảnh không có người, đáp án gần như chắc chắn không có động từ chỉ hành động của người.",
      "Đừng chọn câu chỉ vì nghe được một từ đúng trong ảnh.",
    ],
  },
  {
    id: "t-p2",
    label: "Part 2 — Question-Response",
    section: "listening",
    questions: 25,
    goal550: 15,
    goal700: 18,
    desc: "Nghe một câu hỏi và 3 câu trả lời, chọn câu phù hợp nhất. KHÔNG có đề in sẵn.",
    tips: [
      "Nghe kỹ TỪ ĐẦU TIÊN. Who/When/Where/Why/How quyết định loại đáp án.",
      "Câu hỏi Wh- thì đáp án Yes/No gần như luôn SAI.",
      "Bẫy lớn nhất: đáp án lặp lại từ trong câu hỏi hoặc dùng từ nghe na ná. Nghe thấy từ quen thì cảnh giác, đừng mừng.",
      'Câu trả lời gián tiếp rất hay đúng: hỏi "When will the report be ready?" đáp "I\'m still working on it".',
      "Part này không có đề nhìn, nên tuyệt đối không được lơ đãng. Sai một câu là mất luôn, không quay lại được.",
    ],
  },
  {
    id: "t-p3",
    label: "Part 3 — Conversations",
    section: "listening",
    questions: 39,
    goal550: 20,
    goal700: 27,
    desc: "13 đoạn hội thoại, mỗi đoạn 3 câu hỏi. Có đề in sẵn.",
    tips: [
      "ĐỌC TRƯỚC 3 câu hỏi trong lúc audio đang đọc phần hướng dẫn. Đây là kỹ năng quyết định điểm Part 3-4.",
      "Thứ tự đáp án bám theo thứ tự hội thoại: câu 1 ở đầu, câu 2 ở giữa, câu 3 ở cuối.",
      'Câu hỏi "What will the man probably do next?" luôn nằm ở câu cuối đoạn.',
      "Có đồ thị/bảng biểu kèm theo: nhìn bảng trước, thông tin trong bảng thường KHÔNG được đọc ra trong audio.",
      "Không nghe kịp thì bỏ, chuyển sang đọc trước câu hỏi đoạn sau. Đừng cố cứu một câu mà mất ba câu.",
    ],
  },
  {
    id: "t-p4",
    label: "Part 4 — Talks",
    section: "listening",
    questions: 30,
    goal550: 16,
    goal700: 20,
    desc: "10 bài nói một người, mỗi bài 3 câu hỏi.",
    tips: [
      "Cùng kỹ thuật đọc trước câu hỏi như Part 3.",
      "Nhận dạng loại bài từ câu đầu: thông báo trên loa, tin nhắn thoại, quảng cáo, bản tin thời tiết, giới thiệu diễn giả. Mỗi loại có bố cục quen thuộc.",
      'Câu hỏi "Where is the announcement being made?" trả lời được từ 1-2 câu đầu.',
      "Số điện thoại, giá tiền, ngày giờ thường là bẫy: có nhiều số được đọc, phải bắt đúng số nào.",
    ],
  },
  {
    id: "t-p5",
    label: "Part 5 — Incomplete Sentences",
    section: "reading",
    questions: 30,
    goal550: 17,
    goal700: 22,
    desc: "Điền một từ vào chỗ trống trong câu. 30 câu, thuộc phần Reading.",
    tips: [
      "Đây là Part LÀM NHANH NHẤT, mục tiêu 10-12 phút cho cả 30 câu để dành thời gian cho Part 7.",
      "Nhìn 4 phương án trước. Nếu chúng là 4 dạng của cùng một từ (succeed / success / successful / successfully) thì đây là câu TỪ LOẠI — chỉ cần nhìn vị trí trống, không cần đọc hiểu cả câu.",
      "Câu từ loại chiếm khoảng 1/3 Part 5 và là điểm dễ ăn nhất.",
      "Nếu phương án là các giới từ hoặc liên từ khác nhau thì phải đọc hiểu nghĩa.",
      "Không hiểu câu thì đoán rồi đi tiếp. Không câu nào đáng quá 40 giây.",
    ],
  },
  {
    id: "t-p6",
    label: "Part 6 — Text Completion",
    section: "reading",
    questions: 16,
    goal550: 8,
    goal700: 11,
    desc: "4 đoạn văn, mỗi đoạn 4 chỗ trống. Có 1 chỗ trống điền cả câu.",
    tips: [
      "Khác Part 5 ở chỗ: phải đọc cả đoạn, không điền được chỉ bằng ngữ pháp câu đó.",
      "Câu hỏi về THÌ của động từ phải căn cứ vào mốc thời gian ở câu khác trong đoạn.",
      "Câu điền nguyên một câu: đọc câu trước và câu sau chỗ trống, tìm câu nối được ý hai bên.",
      "Từ nối (however, therefore, in addition) phụ thuộc quan hệ ý giữa hai câu.",
    ],
  },
  {
    id: "t-p7",
    label: "Part 7 — Reading Comprehension",
    section: "reading",
    questions: 54,
    goal550: 25,
    goal700: 36,
    desc: "Đọc hiểu: đoạn đơn, đoạn đôi, đoạn ba. Email, quảng cáo, thông báo, bài báo, tin nhắn chat.",
    tips: [
      "Đây là Part quyết định điểm Reading. Phải còn ít nhất 55 phút khi bắt đầu Part 7.",
      "ĐỌC CÂU HỎI TRƯỚC rồi mới quét bài tìm thông tin. Đừng đọc hết bài rồi mới xem câu hỏi.",
      "Nhìn tiêu đề và loại văn bản trước: email khác quảng cáo khác thông báo, biết loại là đoán được bố cục.",
      "Đoạn đôi và đoạn ba: câu hỏi liên kết thông tin từ hai văn bản khác nhau, đây là câu khó nhất.",
      'Câu hỏi kiểu "In which of the following..." với bốn vị trí đánh dấu [1][2][3][4] là câu chèn câu vào đoạn.',
      "Hết giờ thì tô hết các câu còn lại, TOEIC không trừ điểm câu sai.",
    ],
  },
];

export const TOEIC_PART_BY_ID: Record<string, ToeicPart> = Object.fromEntries(
  TOEIC_PARTS.map((p) => [p.id, p] as const),
);

const STRATEGY_TIPS = [
  "Listening 45 phút chạy liên tục, không dừng được. Reading 75 phút tự phân bổ.",
  "Phân bổ Reading khuyến nghị: Part 5 trong 12 phút, Part 6 trong 8 phút, Part 7 trong 55 phút.",
  "KHÔNG BỎ TRỐNG CÂU NÀO. TOEIC không trừ điểm câu sai, bỏ trống là mất trắng.",
  "Trong lúc Listening đọc hướng dẫn, hãy đọc trước câu hỏi Part 3-4.",
  "Không được lật sang Reading khi đang thi Listening.",
  "Quy đổi điểm chỉ là ước lượng, mỗi đề thi thật lệch đôi chút.",
];

const partItems: ItemNode[] = TOEIC_PARTS.map((p) => ({
  id: p.id,
  label: p.label,
  desc: `${p.desc} Mục tiêu: 550 → ${p.goal550}/${p.questions} · 700 → ${p.goal700}/${p.questions}.`,
  tips: p.tips,
  links: [LT, LY],
}));

export const TOEIC_LISTENING_ITEMS = partItems.filter((i) =>
  ["t-p1", "t-p2", "t-p3", "t-p4"].includes(i.id),
);
export const TOEIC_READING_ITEMS = partItems.filter((i) =>
  ["t-p5", "t-p6", "t-p7"].includes(i.id),
);

export const TOEIC_EXTRA_ITEMS: ItemNode[] = [
  {
    id: "t-vocab",
    label: "Từ vựng công sở",
    desc: "Bộ 180 từ vựng văn phòng, thư tín, hợp đồng, lịch họp — nền của toàn bộ đề TOEIC.",
    tips: [
      "Học theo tình huống: email, cuộc họp, đơn hàng, nhân sự, du lịch công tác.",
      "Mỗi từ ghi kèm một cụm hay đi cùng (place an order, meet a deadline).",
      "Phiên 8 thẻ: ưu tiên ôn lại thẻ đã nhớ lâu để tạo đà chiến thắng.",
    ],
    links: [LY],
  },
  {
    id: "t-strategy",
    label: "Chiến lược phòng thi",
    desc: "Cách phân bổ thời gian và giữ nhịp trong 2 tiếng thi TOEIC Listening & Reading (200 câu, thang 10-990).",
    tips: STRATEGY_TIPS,
    links: [LT],
  },
];

/* ---------- bài học trong app ---------- */

const partLessons: ScoreLesson[] = TOEIC_PARTS.map((p) => ({
  kind: "score",
  nodeId: p.id,
  theory: p.tips,
  target: p.goal700,
  max: p.questions,
  unit: "câu đúng",
}));

const vocabDeck: DeckLesson = {
  kind: "deck",
  nodeId: "t-vocab",
  theory: TOEIC_EXTRA_ITEMS[0]!.tips,
  cards: TOEIC_VOCAB_CARDS,
};

const strategyLesson: SelfLesson = {
  kind: "self",
  nodeId: "t-strategy",
  mode: "writing",
  theory: STRATEGY_TIPS,
  prompt:
    "Tự rà lại kế hoạch làm bài của bạn cho một buổi thi TOEIC đầy đủ, rồi tích những điều bạn đã thực sự làm được trong lần luyện đề gần nhất.",
  checklist: [
    "Không bỏ trống câu nào, kể cả khi hết giờ",
    "Đọc trước câu hỏi Part 3-4 trong lúc nghe hướng dẫn",
    "Làm xong Part 5 trong 12 phút",
    "Làm xong Part 6 trong 8 phút",
    "Còn ít nhất 55 phút khi bắt đầu Part 7",
    "Không lật sang Reading khi đang thi Listening",
  ],
};

export const TOEIC_LESSONS: Lesson[] = [
  ...partLessons,
  vocabDeck,
  strategyLesson,
  TOEIC_PART5_QUIZ_LESSON,
];

/* ---------- quy đổi điểm (XẤP XỈ) ---------- */

const L_TABLE: [number, number][] = [
  [0, 5],
  [55, 300],
  [70, 375],
  [100, 495],
];
const R_TABLE: [number, number][] = [
  [0, 5],
  [50, 250],
  [69, 325],
  [100, 495],
];

function interp(table: [number, number][], raw: number) {
  const x = Math.max(0, Math.min(100, raw));
  for (let i = 1; i < table.length; i += 1) {
    const [x0, y0] = table[i - 1]!;
    const [x1, y1] = table[i]!;
    if (x <= x1) return Math.round((y0 + ((x - x0) / (x1 - x0)) * (y1 - y0)) / 5) * 5;
  }
  return 495;
}

export const listeningScore = (raw: number) => interp(L_TABLE, raw);
export const readingScore = (raw: number) => interp(R_TABLE, raw);

export type ToeicEstimate = {
  listeningRaw: number;
  readingRaw: number;
  listening: number;
  reading: number;
  total: number;
  /** đã nhập điểm cho part nào chưa */
  hasData: boolean;
};

/** Ước tính điểm tổng từ kết quả luyện đề gần nhất của từng Part. */
export function estimateToeic(latest: Record<string, number | undefined>): ToeicEstimate {
  let l = 0;
  let r = 0;
  let has = false;
  for (const p of TOEIC_PARTS) {
    const v = latest[p.id];
    if (v === undefined) continue;
    has = true;
    if (p.section === "listening") l += v;
    else r += v;
  }
  const listening = listeningScore(l);
  const reading = readingScore(r);
  return {
    listeningRaw: l,
    readingRaw: r,
    listening,
    reading,
    total: listening + reading,
    hasData: has,
  };
}
