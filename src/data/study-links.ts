import { ITEM_BY_ID } from "@/data/ielts-map";

export type StudyKind = "video" | "article" | "practice" | "audio";

export type StudyLink = {
  kind: StudyKind;
  source: string;
  desc: string;
  url: string;
  time?: string;
};

export const KIND_META: Record<StudyKind, { icon: string; label: string; cls: string }> = {
  video: { icon: "🎥", label: "Video", cls: "study-video" },
  article: { icon: "📄", label: "Bài viết", cls: "study-article" },
  practice: { icon: "📝", label: "Đề luyện", cls: "study-practice" },
  audio: { icon: "🔊", label: "Nghe phát âm", cls: "study-audio" },
};

/* ---------- Link đã xác minh ---------- */

export const VERIFIED = {
  huyenChannel: "https://www.youtube.com/@IELTSNguyenHuyen",
  roadmapVideo: "https://youtu.be/PkGgT4EN2MM",
  voHoc: "https://ielts-nguyenhuyen.com/vo-hoc/",
  aboutMe: "https://ielts-nguyenhuyen.com/about-me/",
  bbc44: "https://www.youtube.com/playlist?list=PLD6B222E02447DC07",
  bbcChannel: "https://www.youtube.com/@bbclearningenglish",
  lizHome: "https://ieltsliz.com/",
  lizListening: "https://ieltsliz.com/ielts-listening/",
  lizReading: "https://ieltsliz.com/free-ielts-reading-lessons/",
  lizSpeaking: "https://ieltsliz.com/ielts-speaking-free-lessons-essential-tips/",
  lizSpeakingTopics: "https://ieltsliz.com/ielts-speaking-topics-2026/",
  bcTests:
    "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests",
  bcReading:
    "https://takeielts.britishcouncil.org/take-ielts/prepare/free-ielts-english-practice-tests/reading",
  cambridgeDict: "https://dictionary.cambridge.org/dictionary/english/",
  mpToeicChannel: "https://www.youtube.com/@TOEICC%C3%B4MaiPh%C6%B0%C6%A1ng",
  mpOfficialChannel: "https://www.youtube.com/covumaiphuong",
  mpFacebook: "https://www.facebook.com/VuMaiPhuong.toeic/",
  mpApp: "https://play.google.com/store/apps/details?id=com.youredu.mptoeic",
  blogListening: "https://ielts-nguyenhuyen.com/category/listening/",
  blogListeningPractice: "https://ielts-nguyenhuyen.com/category/listening-practice/",
  blogReading: "https://ielts-nguyenhuyen.com/category/reading/",
  blogReadingPractice: "https://ielts-nguyenhuyen.com/category/reading-practice/",
  blogSpeaking: "https://ielts-nguyenhuyen.com/category/speaking/",
  blogSpeakingP2: "https://ielts-nguyenhuyen.com/category/speaking-part-2/",
  blogWriting1: "https://ielts-nguyenhuyen.com/category/writing-task-1/",
  blogWriting2: "https://ielts-nguyenhuyen.com/category/writing-task-2/",
  blogVocab: "https://ielts-nguyenhuyen.com/category/vocabulary/",
  blogParaphrase: "https://ielts-nguyenhuyen.com/category/paraphrasing/",
};

/** Link tìm kiếm YouTube — không bao giờ chết, luôn trả về video mới nhất. */
export const yt = (query: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(query).replace(/%20/g, "+")}`;

const ytSearch = (query: string, desc: string, time?: string): StudyLink => ({
  kind: "video",
  source: "Tìm trên YouTube",
  desc,
  url: yt(query),
  ...(time ? { time } : {}),
});

const cambridge: StudyLink = {
  kind: "audio",
  source: "Cambridge Dictionary",
  desc: "Tra phát âm chuẩn Anh - Mỹ, nghe và nhại lại từng từ.",
  url: VERIFIED.cambridgeDict,
  time: "khoảng 5 phút",
};

const bbc44: StudyLink = {
  kind: "video",
  source: "BBC Learning English — 44 âm",
  desc: "Playlist dạy trọn 44 âm của bảng phiên âm quốc tế.",
  url: VERIFIED.bbc44,
  time: "khoảng 20-30 phút",
};

/* ---------- Ngữ pháp: tên tiếng Anh theo đúng thứ tự g-1..g-18 ---------- */

const GRAMMAR_EN = [
  "verb to be",
  "present simple",
  "present continuous",
  "past simple",
  "past continuous",
  "present perfect",
  "future tenses will be going to",
  "articles a an the",
  "quantifiers some any much many",
  "comparatives and superlatives",
  "modal verbs",
  "conditionals type 0 1 2",
  "relative clauses",
  "passive voice",
  "prepositions in on at",
  "gerunds and infinitives",
  "question formation",
  "adverbs of frequency",
];

/* ---------- Bộ link chung theo nhóm ---------- */

const pronExtra: Record<string, string> = {
  "p-ipa": "bảng phiên âm IPA tiếng Anh đầy đủ",
  "p-vowel": "luyện nguyên âm tiếng Anh minimal pairs",
  "p-consonant": "luyện phụ âm và âm cuối tiếng Anh",
  "p-stress": "trọng âm từ word stress tiếng Anh",
  "p-linking": "nối âm linking sounds tiếng Anh",
};

const cleanLabel = (label: string) => label.replace(/\s*\(mục tiêu.*?\)/, "").trim();

function phase34Links(): StudyLink[] {
  return [
    {
      kind: "practice",
      source: "British Council",
      desc: "Bộ đề luyện IELTS miễn phí đủ 4 kỹ năng, có đáp án.",
      url: VERIFIED.bcTests,
      time: "khoảng 60 phút mỗi đề",
    },
    {
      kind: "article",
      source: "Vở học — IELTS Nguyễn Huyền",
      desc: "Mẫu vở take notes để ghi lỗi sai và điểm từng lần làm đề.",
      url: VERIFIED.voHoc,
      time: "khoảng 10 phút",
    },
    {
      kind: "video",
      source: "Kênh IELTS Nguyễn Huyền",
      desc: "Kênh YouTube chữa đề và chia sẻ kinh nghiệm tự học.",
      url: VERIFIED.huyenChannel,
    },
  ];
}

/** Danh sách link "Học ngay" cho một nút bất kỳ trên bản đồ. */
export function getStudyLinks(nodeId: string): StudyLink[] {
  if (nodeId === "center") {
    return [
      {
        kind: "video",
        source: "Video lộ trình gốc",
        desc: "Xem video lộ trình gốc trước khi bắt đầu.",
        url: VERIFIED.roadmapVideo,
        time: "khoảng 20 phút",
      },
      {
        kind: "article",
        source: "Giới thiệu tác giả",
        desc: "Câu chuyện tự học từ 3.5 lên 8.5 của cô Huyền.",
        url: VERIFIED.aboutMe,
        time: "khoảng 5 phút",
      },
      {
        kind: "article",
        source: "Vở học",
        desc: "Tải mẫu vở ghi chép đi kèm lộ trình.",
        url: VERIFIED.voHoc,
      },
    ];
  }

  const item = ITEM_BY_ID[nodeId];
  const label = item ? cleanLabel(item.label) : "";

  // Phát âm
  if (nodeId.startsWith("p-")) {
    return [
      bbc44,
      ytSearch(
        pronExtra[nodeId] ?? "luyện phát âm tiếng Anh cơ bản",
        "Video tiếng Việt hướng dẫn chi tiết phần này.",
        "khoảng 10-15 phút",
      ),
      cambridge,
    ];
  }

  // Ngữ pháp
  if (/^g-\d+$/.test(nodeId)) {
    const idx = Number(nodeId.slice(2)) - 1;
    const en = GRAMMAR_EN[idx] ?? label;
    return [
      ytSearch(
        `${label} ngữ pháp tiếng Anh giải thích chi tiết`,
        "Video tiếng Việt giảng kỹ lý thuyết và ví dụ.",
        "khoảng 15-20 phút",
      ),
      ytSearch(
        `${en} English grammar lesson`,
        "Bài giảng tiếng Anh để vừa học ngữ pháp vừa luyện nghe.",
        "khoảng 10-15 phút",
      ),
    ];
  }

  // Từ vựng
  if (nodeId.startsWith("v-")) {
    return [
      {
        kind: "article",
        source: "Blog Vocabulary",
        desc: "Kho từ vựng IELTS theo chủ đề của IELTS Nguyễn Huyền.",
        url: VERIFIED.blogVocab,
        time: "khoảng 15 phút",
      },
      {
        kind: "article",
        source: "Blog Paraphrasing",
        desc: "Cách diễn đạt lại từ vựng — học từ đi đôi với dùng từ.",
        url: VERIFIED.blogParaphrase,
        time: "khoảng 10 phút",
      },
      ytSearch(
        "học từ vựng IELTS theo chủ đề",
        "Video hướng dẫn cách nhớ từ vựng IELTS theo chủ đề.",
        "khoảng 15 phút",
      ),
    ];
  }

  // Listening — dạng bài
  if (nodeId.startsWith("l2-")) {
    return [
      {
        kind: "article",
        source: "IELTS Liz — Listening",
        desc: "Bài học và mẹo làm từng dạng Listening bằng tiếng Anh.",
        url: VERIFIED.lizListening,
        time: "khoảng 10 phút",
      },
      {
        kind: "article",
        source: "Blog Listening Practice",
        desc: "Bài luyện nghe kèm chữa chi tiết tiếng Việt.",
        url: VERIFIED.blogListeningPractice,
        time: "khoảng 20 phút",
      },
      ytSearch(
        `IELTS Listening ${label} cách làm`,
        "Video hướng dẫn chiến thuật cho đúng dạng bài này.",
        "khoảng 15 phút",
      ),
    ];
  }

  // Reading — dạng bài
  if (nodeId.startsWith("r2-")) {
    return [
      {
        kind: "article",
        source: "IELTS Liz — Reading",
        desc: "Bài học miễn phí cho từng dạng câu hỏi Reading.",
        url: VERIFIED.lizReading,
        time: "khoảng 10 phút",
      },
      {
        kind: "article",
        source: "Blog Reading Practice",
        desc: "Bài đọc luyện tập có phân tích đáp án bằng tiếng Việt.",
        url: VERIFIED.blogReadingPractice,
        time: "khoảng 20 phút",
      },
      ytSearch(
        `IELTS Reading ${label} cách làm`,
        "Video hướng dẫn cách xử lý dạng bài này.",
        "khoảng 15 phút",
      ),
    ];
  }

  // Speaking
  if (nodeId.startsWith("s2-")) {
    const part = nodeId.slice(-1);
    return [
      {
        kind: "article",
        source: "IELTS Liz — Speaking",
        desc: "Mẹo và bài mẫu cho cả 3 phần thi nói.",
        url: VERIFIED.lizSpeaking,
        time: "khoảng 10 phút",
      },
      {
        kind: "article",
        source: "IELTS Liz — Chủ đề Speaking",
        desc: "Bộ chủ đề Speaking mới nhất để luyện nói mỗi ngày.",
        url: VERIFIED.lizSpeakingTopics,
        time: "khoảng 10 phút",
      },
      {
        kind: "article",
        source: "Blog Speaking Part 2",
        desc: "Bài mẫu và dàn ý cue card bằng tiếng Việt.",
        url: VERIFIED.blogSpeakingP2,
        time: "khoảng 15 phút",
      },
      ytSearch(
        `IELTS Speaking Part ${part} cách trả lời`,
        "Video hướng dẫn cách trả lời và bài mẫu có chấm điểm.",
        "khoảng 15 phút",
      ),
    ];
  }

  // Writing
  if (nodeId.startsWith("w2-")) {
    const isTask1 = label.startsWith("Task 1");
    const taskNo = isTask1 ? "1" : "2";
    const type = label.replace(/^Task [12] — /, "");
    return [
      {
        kind: "article",
        source: isTask1 ? "Blog Writing Task 1" : "Blog Writing Task 2",
        desc: isTask1
          ? "Bài mẫu và từ vựng mô tả biểu đồ cho Task 1."
          : "Dàn ý và bài mẫu Task 2 theo từng dạng đề.",
        url: isTask1 ? VERIFIED.blogWriting1 : VERIFIED.blogWriting2,
        time: "khoảng 20 phút",
      },
      ytSearch(
        `IELTS Writing Task ${taskNo} ${type} cách viết`,
        "Video hướng dẫn viết từng đoạn cho dạng đề này.",
        "khoảng 20 phút",
      ),
    ];
  }

  // Paraphrase
  if (nodeId === "para-1") {
    return [
      {
        kind: "article",
        source: "Blog Paraphrasing",
        desc: "Kỹ thuật diễn đạt lại dùng cho cả 4 kỹ năng.",
        url: VERIFIED.blogParaphrase,
        time: "khoảng 15 phút",
      },
      {
        kind: "article",
        source: "Blog Vocabulary",
        desc: "Nguồn từ đồng nghĩa theo chủ đề để dựng keyword table.",
        url: VERIFIED.blogVocab,
      },
      ytSearch(
        "paraphrase IELTS cách diễn đạt lại câu",
        "Video hướng dẫn paraphrase không làm sai nghĩa.",
        "khoảng 15 phút",
      ),
    ];
  }

  // TOEIC
  if (nodeId.startsWith("t-")) {
    const mpToeic: StudyLink = {
      kind: "video",
      source: "YouTube TOEIC Cô Mai Phương",
      desc: "Kênh TOEIC chính thức của cô Vũ Mai Phương, bài giảng miễn phí.",
      url: VERIFIED.mpToeicChannel,
    };
    const mpOfficial: StudyLink = {
      kind: "video",
      source: "YouTube Cô Vũ Mai Phương Official",
      desc: "Kênh chính thức, video ngữ pháp và luyện nghe nói miễn phí.",
      url: VERIFIED.mpOfficialChannel,
    };
    const mpFb: StudyLink = {
      kind: "article",
      source: "Facebook 990 TOEIC — Cô Mai Phương",
      desc: "Trang chính thức, chia sẻ mẹo làm bài và đề luyện miễn phí.",
      url: VERIFIED.mpFacebook,
    };
    const mpApp: StudyLink = {
      kind: "practice",
      source: "Ứng dụng chính thức (Google Play)",
      desc: "App luyện TOEIC chính chủ của cô Vũ Mai Phương.",
      url: VERIFIED.mpApp,
    };

    if (nodeId === "t-strategy") {
      return [mpToeic, mpOfficial, mpFb, mpApp];
    }

    const partSearch: Record<string, string> = {
      "t-p1": "TOEIC Part 1 cách làm mẹo",
      "t-p2": "TOEIC Part 2 cách làm bẫy thường gặp",
      "t-p3": "TOEIC Part 3 kỹ năng đọc trước câu hỏi",
      "t-p4": "TOEIC Part 4 dạng bài thường gặp",
      "t-p5": "TOEIC Part 5 từ loại cách làm nhanh",
      "t-p6": "TOEIC Part 6 cách làm",
      "t-p7": "TOEIC Part 7 chiến thuật đọc hiểu",
      "t-vocab": "từ vựng TOEIC theo chủ đề",
    };
    const pairs: Record<string, StudyLink[]> = {
      "t-p1": [mpToeic, mpApp],
      "t-p2": [mpToeic, mpApp],
      "t-p3": [mpToeic, mpOfficial],
      "t-p4": [mpToeic, mpOfficial],
      "t-p5": [mpToeic, mpFb],
      "t-p6": [mpToeic, mpFb],
      "t-p7": [mpToeic, mpApp],
      "t-vocab": [mpOfficial, mpFb],
    };
    const search = partSearch[nodeId];
    return [
      ...(pairs[nodeId] ?? [mpToeic, mpFb]),
      ...(search
        ? [ytSearch(search, "Video hướng dẫn mới nhất cho phần này.", "khoảng 15 phút")]
        : []),
    ];
  }


  // Giai đoạn 3 & 4
  if (nodeId.startsWith("l3-") || nodeId.startsWith("r3-") || nodeId.startsWith("f-") || nodeId === "rule-1") {
    const extra: StudyLink[] = [];
    if (nodeId.startsWith("r3-") || nodeId === "f-2") {
      extra.push({
        kind: "practice",
        source: "British Council — Reading",
        desc: "Đề Reading miễn phí có đáp án, làm đúng 60 phút.",
        url: VERIFIED.bcReading,
        time: "khoảng 60 phút",
      });
    }
    return [...phase34Links(), ...extra];
  }

  // Nút giai đoạn / chòm sao
  if (nodeId === "phase3" || nodeId === "phase4" || nodeId.startsWith("g-l3") || nodeId.startsWith("g-r3") || nodeId === "g-full") {
    return phase34Links();
  }

  return [
    {
      kind: "video",
      source: "Kênh IELTS Nguyễn Huyền",
      desc: "Kênh gốc của lộ trình này, có video cho hầu hết chủ đề.",
      url: VERIFIED.huyenChannel,
    },
    {
      kind: "article",
      source: "IELTS Liz",
      desc: "Trang học IELTS miễn phí đầy đủ cả 4 kỹ năng.",
      url: VERIFIED.lizHome,
    },
  ];
}
