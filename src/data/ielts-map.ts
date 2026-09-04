import { TOEIC_LISTENING_ITEMS, TOEIC_READING_ITEMS, TOEIC_EXTRA_ITEMS } from "./toeic";

export type LinkRef = { label: string; url: string };

export type ItemNode = {
  id: string;
  label: string;
  desc: string;
  tips: string[];
  links: LinkRef[];
};

export type GroupNode = {
  id: string;
  label: string;
  items: ItemNode[];
};

export type ConstellationId = "base" | "toeic" | "ielts";

export type PhaseNode = {
  id: string;
  label: string;
  short: string;
  duration: string;
  desc: string;
  groups: GroupNode[];
  /** chòm sao chứa giai đoạn này */
  constellation: ConstellationId;
  requires?: string; // phase id phải đạt requiresPercent
  /** chòm sao phải đạt requiresPercent */
  requiresConstellation?: ConstellationId;
  requiresPercent?: number;
};

const L = {
  listening: { label: "Blog Listening", url: "https://ielts-nguyenhuyen.com/category/listening/" },
  listeningPractice: {
    label: "Listening Practice",
    url: "https://ielts-nguyenhuyen.com/category/listening-practice/",
  },
  reading: { label: "Blog Reading", url: "https://ielts-nguyenhuyen.com/category/reading/" },
  readingPractice: {
    label: "Reading Practice",
    url: "https://ielts-nguyenhuyen.com/category/reading-practice/",
  },
  speaking: { label: "Blog Speaking", url: "https://ielts-nguyenhuyen.com/category/speaking/" },
  speakingP2: {
    label: "Speaking Part 2",
    url: "https://ielts-nguyenhuyen.com/category/speaking-part-2/",
  },
  writing1: {
    label: "Writing Task 1",
    url: "https://ielts-nguyenhuyen.com/category/writing-task-1/",
  },
  writing2: {
    label: "Writing Task 2",
    url: "https://ielts-nguyenhuyen.com/category/writing-task-2/",
  },
  vocab: { label: "Từ vựng", url: "https://ielts-nguyenhuyen.com/category/vocabulary/" },
  paraphrase: {
    label: "Paraphrasing",
    url: "https://ielts-nguyenhuyen.com/category/paraphrasing/",
  },
  tips: { label: "Mẹo chung", url: "https://ielts-nguyenhuyen.com/category/blog/" },
  exp: { label: "Kinh nghiệm", url: "https://ielts-nguyenhuyen.com/category/kinh-nghiem/" },
} satisfies Record<string, LinkRef>;

const item = (
  id: string,
  label: string,
  desc: string,
  tips: string[],
  links: LinkRef[],
): ItemNode => ({ id, label, desc, tips, links });

/** Sao "Từ của tôi" — bộ thẻ người học tự tạo từ tài liệu riêng, luôn mở. */
const myCardsItem = (id: string, where: string): ItemNode =>
  item(
    id,
    "Từ của tôi",
    `Bộ thẻ bạn tự tạo từ tài liệu riêng cho ${where}. Bấm nút + góc dưới bên phải để thêm từ mới bất cứ lúc nào.`,
    [
      "Thẻ tự viết bằng lời của mình nhớ lâu hơn thẻ chép sẵn.",
      "Chỉ cần từ + nghĩa là đủ, câu ví dụ thêm sau cũng được.",
      "Dùng chung lịch ôn 1 – 3 – 8 – 21 – 58 ngày với các tầng từ vựng khác.",
      "Nhớ tải bản sao lưu CSV trong trang Thẻ của tôi.",
    ],
    [],
  );

/* ---------------- Giai đoạn 1 ---------------- */

const pron: ItemNode[] = [
  item(
    "p-ipa",
    "Bảng IPA",
    "Làm quen 44 âm trong bảng phiên âm quốc tế để đọc được phiên âm trong từ điển.",
    [
      "Học theo nhóm âm: 12 nguyên âm đơn, 8 nguyên âm đôi, 24 phụ âm.",
      "Mỗi âm nghe 3 ví dụ, nhại lại và tự thu âm so sánh.",
      "Cài từ điển Cambridge/Oxford, luôn xem phiên âm khi tra từ mới.",
      "Mỗi ngày 15 phút, 1 tuần là xong bảng.",
    ],
    [L.tips, L.exp],
  ),
  item(
    "p-vowel",
    "Nguyên âm",
    "Phân biệt các cặp nguyên âm dễ nhầm của người Việt: /i/ - /iː/, /æ/ - /e/, /ʌ/ - /ɑː/.",
    [
      "Luyện theo cặp tối thiểu (minimal pairs): ship/sheep, bad/bed, cut/cart.",
      "Chú ý độ dài âm — tiếng Việt không phân biệt dài/ngắn nên rất dễ sai.",
      "Thu âm 10 cặp từ mỗi ngày rồi nghe lại.",
    ],
    [L.tips],
  ),
  item(
    "p-consonant",
    "Phụ âm",
    "Tập trung vào âm cuối và các âm tiếng Việt không có: /θ/, /ð/, /ʃ/, /ʒ/, /s/, /z/.",
    [
      "Bật hết âm cuối: -s, -es, -ed, -th. Đây là lỗi nặng nhất của người Việt.",
      "Luyện /θ/ và /ð/ bằng cách đặt lưỡi giữa hai hàm răng.",
      "Đọc to một đoạn 5 câu, gạch chân mọi âm cuối trước khi đọc.",
    ],
    [L.tips],
  ),
  item(
    "p-stress",
    "Trọng âm từ",
    "Đặt đúng trọng âm giúp người nghe hiểu bạn và giúp bạn nghe ra từ khi làm Listening.",
    [
      "Học quy tắc theo hậu tố: -tion, -ic, -ity, -ate...",
      "Mỗi từ vựng mới ghi kèm ký hiệu trọng âm.",
      "Đọc câu theo nhịp: nhấn mạnh từ nội dung, lướt từ chức năng.",
    ],
    [L.tips, L.vocab],
  ),
  item(
    "p-linking",
    "Nối âm",
    "Hiểu cách người bản xứ nối và nuốt âm — chìa khoá để nghe kịp tốc độ nói tự nhiên.",
    [
      "Ba kiểu nối chính: phụ âm + nguyên âm, nguyên âm + nguyên âm, phụ âm giống nhau.",
      "Nghe một câu, chép lại từng chữ (dictation), so sánh với transcript.",
      "Shadowing 5 phút/ngày: nói đuổi theo audio, không dừng.",
    ],
    [L.listening, L.tips],
  ),
];

const grammarItems: [string, string, string[]][] = [
  [
    "To be",
    "Động từ to be ở các thì cơ bản và cách dùng trong câu miêu tả.",
    [
      "Phân biệt am/is/are, was/were.",
      "Luyện viết 10 câu tự giới thiệu.",
      "Chú ý chia to be theo chủ ngữ số nhiều.",
    ],
  ],
  [
    "Hiện tại đơn",
    "Diễn tả sự thật, thói quen — thì dùng nhiều nhất trong Writing Task 2.",
    [
      "Nhớ thêm -s/-es với ngôi thứ ba số ít.",
      "Câu phủ định và nghi vấn với do/does.",
      "Viết 10 câu về thói quen hằng ngày.",
    ],
  ],
  [
    "Hiện tại tiếp diễn",
    "Hành động đang xảy ra và xu hướng hiện tại (rất hợp Writing Task 1).",
    [
      "Cấu trúc be + V-ing.",
      "Dùng cho xu hướng: prices are rising.",
      "Tránh dùng với động từ trạng thái: know, like.",
    ],
  ],
  [
    "Quá khứ đơn",
    "Kể lại sự việc đã kết thúc — dùng nhiều trong Speaking Part 2.",
    [
      "Học 60 động từ bất quy tắc thông dụng nhất.",
      "Phát âm đuôi -ed đúng: /t/, /d/, /ɪd/.",
      "Kể một kỷ niệm 5 câu bằng quá khứ đơn.",
    ],
  ],
  [
    "Quá khứ tiếp diễn",
    "Hành động đang diễn ra thì bị cắt ngang.",
    [
      "Cấu trúc was/were + V-ing.",
      "Kết hợp với when/while.",
      "Dùng để mở đầu câu chuyện trong Speaking.",
    ],
  ],
  [
    "Hiện tại hoàn thành",
    "Nối quá khứ với hiện tại — điểm cộng lớn về độ đa dạng ngữ pháp.",
    [
      "Have/has + V3.",
      "Phân biệt với quá khứ đơn qua dấu hiệu thời gian.",
      "Dùng for/since/already/yet/never đúng chỗ.",
    ],
  ],
  [
    "Tương lai",
    "Will, be going to, hiện tại tiếp diễn chỉ tương lai.",
    [
      "Will cho quyết định tức thì và dự đoán.",
      "Be going to cho kế hoạch đã định.",
      "Luyện nói về dự định 1 năm tới.",
    ],
  ],
  [
    "Mạo từ a/an/the",
    "Lỗi phổ biến nhất của người Việt trong Writing.",
    [
      "A/an cho danh từ đếm được số ít lần đầu nhắc tới.",
      "The khi cả hai bên đã biết hoặc là duy nhất.",
      "Không mạo từ với danh từ chung số nhiều mang nghĩa tổng quát.",
    ],
  ],
  [
    "Some/any/much/many",
    "Lượng từ đi với danh từ đếm được và không đếm được.",
    [
      "Many + đếm được, much + không đếm được.",
      "Some trong câu khẳng định, any trong phủ định/nghi vấn.",
      "Học thêm a lot of, a few, a little.",
    ],
  ],
  [
    "So sánh hơn nhất",
    "So sánh bằng, hơn, nhất — cực kỳ cần cho Writing Task 1.",
    [
      "Tính từ ngắn +er/est, tính từ dài more/most.",
      "Nhớ các dạng bất quy tắc: good/better/best.",
      "Viết 5 câu so sánh số liệu từ một biểu đồ.",
    ],
  ],
  [
    "Modal verbs",
    "Can, could, may, might, should, must — thể hiện thái độ và mức độ chắc chắn.",
    [
      "Modal + V nguyên thể, không chia.",
      "Dùng might/could để nói giảm trong Writing Task 2.",
      "Should dùng cho phần giải pháp.",
    ],
  ],
  [
    "Câu điều kiện 0-1-2",
    "Ba loại câu điều kiện cơ bản, dùng nhiều khi bàn giải pháp.",
    [
      "Loại 0: sự thật hiển nhiên.",
      "Loại 1: có thật ở tương lai.",
      "Loại 2: giả định trái hiện tại — If governments invested..., ... would ...",
    ],
  ],
  [
    "Mệnh đề quan hệ",
    "Who, which, that, where — giúp câu dài và mạch lạc hơn.",
    [
      "Phân biệt mệnh đề xác định và không xác định (có dấu phẩy).",
      "Rút gọn mệnh đề bằng V-ing / V3.",
      "Ghép 10 cặp câu ngắn thành câu có mệnh đề quan hệ.",
    ],
  ],
  [
    "Câu bị động",
    "Rất hay dùng trong Task 1 dạng Process và văn phong học thuật.",
    [
      "Be + V3 (+ by ...).",
      "Dùng khi không cần nêu chủ thể hành động.",
      "Viết lại 10 câu chủ động thành bị động.",
    ],
  ],
  [
    "Giới từ in/on/at",
    "Giới từ thời gian, nơi chốn và trong cụm cố định.",
    [
      "Học theo quy tắc: in (tháng/năm), on (ngày), at (giờ).",
      "Ghi giới từ đi kèm ngay khi học từ mới.",
      "Chú ý cụm cố định: interested in, depend on.",
    ],
  ],
  [
    "V-ing hay to V",
    "Động từ theo sau bởi V-ing hay to V.",
    [
      "Học danh sách động từ thường gặp: enjoy + V-ing, want + to V.",
      "Một số động từ đổi nghĩa: stop, remember, forget.",
      "Viết 10 câu áp dụng.",
    ],
  ],
  [
    "Cách đặt câu hỏi",
    "Câu hỏi Yes/No và Wh- — cần cho Speaking và hiểu đề bài.",
    [
      "Trật tự đảo trợ động từ.",
      "Câu hỏi gián tiếp giữ trật tự câu khẳng định.",
      "Tự đặt 10 câu hỏi cho một chủ đề Speaking Part 1.",
    ],
  ],
  [
    "Trạng từ tần suất",
    "Always, usually, often, rarely — dùng để nói về thói quen.",
    [
      "Đứng trước động từ thường, sau to be.",
      "Kết hợp với hiện tại đơn.",
      "Nói 5 câu về tần suất hoạt động của bạn.",
    ],
  ],
];

const grammar: ItemNode[] = grammarItems.map(([label, desc, tips], i) =>
  item(`g-${i + 1}`, label, desc, tips, [L.tips, L.writing2]),
);

const vocab: ItemNode[] = [
  item(
    "v-1",
    "Tầng 1 — 259 từ nền tảng",
    "Nhóm từ thông dụng nhất, phủ phần lớn hội thoại và đề bài đơn giản.",
    [
      "Mỗi ngày 15 từ, ôn lại theo lịch 1-3-7-14 ngày.",
      "Học từ theo cụm (collocation), không học từ đơn lẻ.",
      "Ghi kèm phiên âm, trọng âm và một câu ví dụ tự đặt.",
      "Dùng flashcard (Anki/Quizlet) để lặp lại ngắt quãng.",
    ],
    [L.vocab],
  ),
  item(
    "v-2",
    "Tầng 2 — 108 từ trung cấp",
    "Từ vựng nâng cấp diễn đạt, giúp thoát khỏi những từ quá cơ bản.",
    [
      "Thay thế dần các từ cơ bản trong bài viết của bạn bằng từ tầng 2.",
      "Mỗi từ tìm 2 collocation thật từ từ điển.",
      "Viết một đoạn 80 từ dùng 5 từ mới mỗi ngày.",
    ],
    [L.vocab, L.paraphrase],
  ),
  item(
    "v-3",
    "Tầng 3 — 157 từ IELTS",
    "Từ vựng học thuật theo chủ đề IELTS: giáo dục, môi trường, công nghệ, sức khoẻ...",
    [
      "Học theo chủ đề, mỗi chủ đề 15-20 từ + cụm.",
      "Với mỗi chủ đề, viết một đoạn ý kiến 100 từ.",
      "Ưu tiên từ dùng được cho cả Writing và Speaking.",
    ],
    [L.vocab, L.writing2],
  ),
];

const vocabTopics: ItemNode = item(
  "v-4",
  "Từ vựng chủ đề Speaking",
  "Cụm từ nói tự nhiên cho 15 chủ đề hay ra đề: nhà ở, sở thích, tin tức, Tết, công việc...",
  [
    "Học theo cụm, đừng học từ đơn — điểm Lexical Resource nằm ở cách ghép từ.",
    "Mỗi chủ đề chọn 5 cụm, tự đặt câu về chính mình rồi nói thành tiếng.",
    "Trước buổi luyện Speaking, lướt lại chủ đề sắp nói trong 2 phút.",
  ],
  [L.vocab, L.speaking],
);

const vocabBase = vocab.filter((v) => v.id !== "v-3");
const vocabIelts = [...vocab.filter((v) => v.id === "v-3"), vocabTopics];

/* ---------------- Giai đoạn 2 ---------------- */

const lsTypes: [string, string, string[]][] = [
  [
    "Form/Note/Table Completion",
    "Điền thông tin vào biểu mẫu, ghi chú hoặc bảng.",
    [
      "Đọc kỹ giới hạn số từ (NO MORE THAN TWO WORDS).",
      "Dự đoán loại thông tin cần điền: số, tên, danh từ.",
      "Cẩn thận chính tả và số nhiều — sai là mất điểm.",
    ],
  ],
  [
    "Multiple Choice",
    "Chọn đáp án đúng trong 3-4 lựa chọn.",
    [
      "Gạch chân từ khoá trong câu hỏi và các lựa chọn trước khi nghe.",
      "Chú ý bẫy: đáp án được nhắc rồi bị phủ định.",
      "Không dừng lại phân vân, bỏ qua để bắt kịp bài nghe.",
    ],
  ],
  [
    "Matching",
    "Nối thông tin với danh sách lựa chọn cho sẵn.",
    [
      "Đọc trước danh sách lựa chọn và paraphrase khả dĩ.",
      "Theo dõi thứ tự câu hỏi — thường theo trình tự bài nghe.",
      "Ghi ký hiệu nhanh, chép lại đáp án sau.",
    ],
  ],
  [
    "Map/Plan Labeling",
    "Điền tên vào bản đồ hoặc sơ đồ.",
    [
      "Xác định vị trí xuất phát và hướng bắc trên bản đồ.",
      "Học từ chỉ phương hướng: opposite, adjacent, at the far end.",
      "Dùng ngón tay lần theo đường đi khi nghe.",
    ],
  ],
  [
    "Sentence Completion",
    "Hoàn thành câu bằng từ nghe được.",
    [
      "Đoán từ loại còn thiếu trước khi nghe.",
      "Chép chính xác từ trong bài, không tự đổi từ.",
      "Kiểm tra ngữ pháp của câu sau khi điền.",
    ],
  ],
  [
    "Short Answer",
    "Trả lời ngắn theo câu hỏi.",
    [
      "Chú ý giới hạn số từ.",
      "Nghe đúng dạng thông tin câu hỏi yêu cầu (What/Where/How many).",
      "Viết đáp án gọn, không thêm chữ thừa.",
    ],
  ],
  [
    "Flow-chart Completion",
    "Điền các bước trong sơ đồ quy trình.",
    [
      "Nắm dòng chảy các bước trước khi nghe.",
      "Chú ý từ nối chỉ trình tự: then, after that, finally.",
      "Đáp án thường là danh từ hoặc động từ nguyên thể.",
    ],
  ],
];

const listening2: ItemNode[] = lsTypes.map(([l, d, t], i) =>
  item(`l2-${i + 1}`, l, d, t, [L.listening, L.listeningPractice]),
);

const rdTypes: [string, string, string[]][] = [
  [
    "True/False/Not Given",
    "Xác định thông tin đúng, sai hay không được nhắc tới.",
    [
      "NOT GIVEN = bài không nói gì, đừng suy diễn.",
      "FALSE = bài nói ngược lại.",
      "Chú ý từ chỉ mức độ: all, only, always.",
    ],
  ],
  [
    "Yes/No/Not Given",
    "Giống T/F/NG nhưng xét quan điểm của tác giả.",
    [
      "Tìm phần thể hiện ý kiến, không phải dữ kiện.",
      "Chú ý các động từ như argue, believe, claim.",
      "Không dùng kiến thức bên ngoài.",
    ],
  ],
  [
    "Matching Headings",
    "Chọn tiêu đề phù hợp cho từng đoạn.",
    [
      "Đọc câu đầu và câu cuối mỗi đoạn trước.",
      "Tìm ý chính, tránh bị hút bởi chi tiết nhỏ.",
      "Loại dần các heading đã dùng.",
    ],
  ],
  [
    "Matching Information",
    "Tìm đoạn chứa thông tin cho trước.",
    [
      "Không theo thứ tự — cần scan toàn bài.",
      "Gạch chân danh từ riêng, số liệu để định vị nhanh.",
      "Làm dạng này sau cùng vì tốn thời gian.",
    ],
  ],
  [
    "Matching Features",
    "Nối đặc điểm/quan điểm với người hoặc nhóm.",
    [
      "Khoanh tròn tên riêng trong bài trước.",
      "Đọc kỹ vùng quanh mỗi tên.",
      "Chú ý một tên có thể dùng nhiều lần.",
    ],
  ],
  [
    "Matching Sentence Endings",
    "Ghép nửa câu cho hoàn chỉnh về nghĩa và ngữ pháp.",
    [
      "Loại đáp án sai ngữ pháp trước.",
      "Tìm vị trí trong bài theo thứ tự câu hỏi.",
      "Kiểm tra nghĩa toàn câu sau khi ghép.",
    ],
  ],
  [
    "Multiple Choice",
    "Chọn đáp án đúng cho câu hỏi về chi tiết hoặc ý chính.",
    [
      "Định vị vùng thông tin trước, đọc kỹ rồi mới xét đáp án.",
      "Loại trừ dần, cẩn thận đáp án đúng một nửa.",
      "Đáp án đúng luôn là paraphrase của bài.",
    ],
  ],
  [
    "Summary Completion",
    "Điền vào chỗ trống của đoạn tóm tắt.",
    [
      "Xác định từ loại cần điền.",
      "Nếu có word box, chú ý các từ đồng nghĩa gây nhiễu.",
      "Nếu lấy từ bài, phải chép nguyên văn.",
    ],
  ],
  [
    "Sentence Completion",
    "Hoàn thành câu bằng từ trong bài.",
    [
      "Tuân thủ giới hạn số từ.",
      "Định vị bằng từ khoá không thể paraphrase (tên, số).",
      "Kiểm tra câu sau khi điền có đúng ngữ pháp không.",
    ],
  ],
  [
    "Diagram Label",
    "Điền nhãn cho sơ đồ, hình vẽ.",
    [
      "Đọc sơ đồ theo chiều mũi tên.",
      "Tìm đoạn văn mô tả cấu tạo/quy trình.",
      "Từ cần điền thường là danh từ.",
    ],
  ],
  [
    "Short Answer",
    "Trả lời câu hỏi bằng vài từ lấy từ bài.",
    [
      "Câu hỏi theo thứ tự bài đọc.",
      "Chỉ chép từ có sẵn trong bài.",
      "Trả lời đúng dạng câu hỏi yêu cầu.",
    ],
  ],
];

const reading2: ItemNode[] = rdTypes.map(([l, d, t], i) =>
  item(`r2-${i + 1}`, l, d, t, [L.reading, L.readingPractice]),
);

const speaking2: ItemNode[] = [
  item(
    "s2-1",
    "Part 1 — Introduction",
    "4-5 phút hỏi đáp về chủ đề quen thuộc: nhà, việc, sở thích.",
    [
      "Trả lời 2-3 câu: ý chính + lý do/ví dụ, đừng trả lời cụt.",
      "Chuẩn bị ý cho 20 chủ đề phổ biến nhất.",
      "Nói tự nhiên, không học thuộc lòng nguyên đoạn.",
    ],
    [L.speaking],
  ),
  item(
    "s2-2",
    "Part 2 — Long turn",
    "1 phút chuẩn bị, nói 2 phút theo cue card.",
    [
      "Dùng 1 phút để ghi từ khoá theo 4 gạch đầu dòng của đề.",
      "Có dàn ý cố định: mở đầu — chi tiết — cảm xúc — kết.",
      "Tập nói đủ 2 phút, bấm giờ mỗi lần luyện.",
      "Xây bộ câu chuyện dùng lại được cho nhiều đề.",
    ],
    [L.speakingP2, L.speaking],
  ),
  item(
    "s2-3",
    "Part 3 — Discussion",
    "Thảo luận trừu tượng, mở rộng từ chủ đề Part 2.",
    [
      "Trả lời theo cấu trúc: quan điểm — lý do — ví dụ — so sánh.",
      "Dùng cách nói giảm: it depends, in most cases, generally speaking.",
      "Cho phép mình dừng nghĩ bằng cụm câu giờ tự nhiên.",
    ],
    [L.speaking, L.tips],
  ),
];

const wrTypes: [string, string, string[], LinkRef][] = [
  [
    "Task 1 — Line/Bar chart",
    "Mô tả xu hướng và so sánh số liệu theo thời gian.",
    [
      "Mở bài paraphrase đề, sau đó viết overview 2 câu về xu hướng lớn nhất.",
      "Nhóm số liệu thay vì liệt kê từng con số.",
      "Học bộ từ xu hướng: rise, plummet, level off, fluctuate.",
    ],
    L.writing1,
  ],
  [
    "Task 1 — Pie/Table",
    "So sánh tỉ lệ và số liệu tĩnh.",
    [
      "Overview nêu hạng mục lớn nhất và nhỏ nhất.",
      "Dùng ngôn ngữ tỉ lệ: accounts for, a quarter of, twice as many.",
      "Chọn lọc số liệu tiêu biểu, không chép hết bảng.",
    ],
    L.writing1,
  ],
  [
    "Task 1 — Process",
    "Mô tả quy trình theo các bước.",
    [
      "Dùng bị động và từ nối trình tự.",
      "Overview nêu số bước và điểm đầu/cuối.",
      "Không dùng số liệu, chỉ mô tả các giai đoạn.",
    ],
    L.writing1,
  ],
  [
    "Task 1 — Map",
    "So sánh bản đồ theo hai mốc thời gian.",
    [
      "Dùng thì quá khứ/hiện tại hoàn thành cho thay đổi.",
      "Từ vựng: was replaced by, was converted into, expanded.",
      "Mô tả theo khu vực địa lý, không nhảy lung tung.",
    ],
    L.writing1,
  ],
  [
    "Task 2 — Opinion",
    "Đề Agree/Disagree — nêu rõ lập trường.",
    [
      "Chọn một lập trường rõ ràng và giữ suốt bài.",
      "Mỗi thân bài: câu chủ đề — giải thích — ví dụ.",
      "Kết bài nhắc lại quan điểm, không thêm ý mới.",
    ],
    L.writing2,
  ],
  [
    "Task 2 — Discussion",
    "Bàn cả hai quan điểm rồi nêu ý kiến của bạn.",
    [
      "Thân bài 1 cho quan điểm A, thân bài 2 cho quan điểm B + ý kiến bạn.",
      "Mở bài phải nêu ý kiến cá nhân ngay.",
      "Cân đối độ dài hai thân bài.",
    ],
    L.writing2,
  ],
  [
    "Task 2 — Problem-Solution",
    "Nêu nguyên nhân/vấn đề và giải pháp.",
    [
      "Ghép cặp: mỗi vấn đề có một giải pháp tương ứng.",
      "Giải pháp cần cụ thể và khả thi.",
      "Dùng modal verbs: should, could, need to.",
    ],
    L.writing2,
  ],
  [
    "Task 2 — Advantages-Disadvantages",
    "Cân nhắc lợi và hại.",
    [
      "Đọc kỹ đề có hỏi 'lợi có lớn hơn hại không' hay không.",
      "Nếu có, phải kết luận rõ bên nào nặng hơn.",
      "Mỗi bên 1-2 ý, phân tích sâu hơn là liệt kê nhiều.",
    ],
    L.writing2,
  ],
  [
    "Task 2 — Two-part question",
    "Đề có hai câu hỏi riêng biệt.",
    [
      "Mỗi thân bài trả lời trọn một câu hỏi.",
      "Đừng bỏ sót câu hỏi thứ hai — lỗi mất điểm nặng.",
      "Mở bài nêu ngắn cả hai hướng trả lời.",
    ],
    L.writing2,
  ],
];

const writing2: ItemNode[] = wrTypes.map(([l, d, t, link], i) =>
  item(`w2-${i + 1}`, l, d, t, [link, L.paraphrase]),
);

/* ---------------- Giai đoạn 3 ---------------- */

const makePractice = (
  id: string,
  label: string,
  target: string,
  desc: string,
  tips: string[],
  links: LinkRef[],
) =>
  item(
    id,
    `${label} (mục tiêu ${target})`,
    desc,
    [...tips, `Chỉ chuyển sang phần sau khi đạt ${target} trong 3 lần liên tiếp.`],
    links,
  );

const practiceListening: ItemNode[] = [
  makePractice(
    "l3-1",
    "Listening Part 1",
    "8/10",
    "Hội thoại đời sống, thường là điền form.",
    [
      "Luyện chép chính tả toàn bộ đoạn sau khi làm.",
      "Ghi lại mọi lỗi chính tả và số nhiều vào sổ lỗi.",
    ],
    [L.listeningPractice, L.listening],
  ),
  makePractice(
    "l3-2",
    "Listening Part 2",
    "7/10",
    "Độc thoại đời sống: mô tả địa điểm, sự kiện.",
    ["Tập trung dạng bản đồ và matching.", "Nghe lại phần sai, đối chiếu transcript."],
    [L.listeningPractice],
  ),
  makePractice(
    "l3-3",
    "Listening Part 3",
    "6/10",
    "Hội thoại học thuật nhiều người, tốc độ nhanh.",
    ["Theo dõi ai nói gì — hay hỏi quan điểm từng người.", "Cẩn thận đáp án bị đổi ý giữa chừng."],
    [L.listeningPractice],
  ),
  makePractice(
    "l3-4",
    "Listening Part 4",
    "6/10",
    "Bài giảng học thuật, không nghỉ giữa chừng.",
    [
      "Đọc trước toàn bộ câu hỏi trong 30 giây đầu.",
      "Mất một câu thì bỏ ngay, bám tiếp bài giảng.",
    ],
    [L.listeningPractice],
  ),
];

const practiceReading: ItemNode[] = [
  makePractice(
    "r3-1",
    "Reading Passage 1",
    "10/13",
    "Bài dễ nhất, nên làm trong 15 phút.",
    [
      "Bấm giờ nghiêm ngặt để dành thời gian cho Passage 3.",
      "Rà lại lỗi: chính tả, số từ vượt giới hạn.",
    ],
    [L.readingPractice, L.reading],
  ),
  makePractice(
    "r3-2",
    "Reading Passage 2",
    "9/13",
    "Độ khó trung bình, thường 20 phút.",
    [
      "Tập kỹ năng scan để định vị nhanh.",
      "Phân tích lại từng câu sai: sai vì từ vựng hay vì bẫy?",
    ],
    [L.readingPractice],
  ),
  makePractice(
    "r3-3",
    "Reading Passage 3",
    "8/14",
    "Bài khó nhất, nhiều từ học thuật.",
    ["Ưu tiên các dạng dễ ăn điểm trước.", "Xây danh sách từ học thuật gặp lại nhiều lần."],
    [L.readingPractice],
  ),
];

/* ---------------- Giai đoạn 4 ---------------- */

const fullTest: ItemNode[] = [
  item(
    "f-1",
    "Full test Listening",
    "Làm trọn 4 part liên tục, không dừng.",
    [
      "Làm đúng điều kiện thi: nghe một lần, không tua.",
      "Chép đáp án trong 10 phút cuối như thi thật (bài thi giấy).",
      "Ghi lại điểm mỗi lần để theo dõi tiến bộ.",
    ],
    [L.listeningPractice, L.exp],
  ),
  item(
    "f-2",
    "Full test Reading",
    "3 passage trong đúng 60 phút.",
    [
      "Chia thời gian 15-20-25 phút.",
      "Không bỏ trống câu nào, luôn đoán.",
      "Sau mỗi test, phân tích lỗi theo dạng bài.",
    ],
    [L.readingPractice, L.exp],
  ),
  item(
    "f-3",
    "Writing có người chữa",
    "Viết Task 1 + Task 2 trong 60 phút và nhờ chữa bài.",
    [
      "20 phút Task 1, 40 phút Task 2.",
      "Nhờ giáo viên hoặc bạn trình độ cao hơn chữa theo 4 tiêu chí chấm.",
      "Viết lại bài sau khi được chữa — đây mới là bước tiến bộ.",
    ],
    [L.writing1, L.writing2],
  ),
  item(
    "f-4",
    "Speaking luyện với bạn",
    "Luyện trọn 3 part với bạn học hoặc giáo viên.",
    [
      "Thu âm mọi buổi luyện và nghe lại.",
      "Chấm chéo theo 4 tiêu chí: Fluency, Lexical, Grammar, Pronunciation.",
      "Ghi lại các lỗi lặp lại và sửa từng lỗi một.",
    ],
    [L.speaking, L.speakingP2],
  ),
  item(
    "f-5",
    "Canh giờ phòng thi",
    "Mô phỏng trọn buổi thi để quen áp lực thời gian.",
    [
      "Làm liên tục Listening → Reading → Writing trong một buổi sáng.",
      "Không dùng điện thoại, không nghỉ giữa các phần.",
      "Ghi nhận mức độ mệt và điều chỉnh chiến thuật phân bổ sức.",
    ],
    [L.exp, L.tips],
  ),
];

export const CONSTELLATIONS: { id: ConstellationId; label: string; desc: string }[] = [
  {
    id: "base",
    label: "Nền tảng",
    desc: "Gốc chung cho cả TOEIC lẫn IELTS: phát âm, ngữ pháp, từ vựng tầng 1 và 2.",
  },
  {
    id: "toeic",
    label: "TOEIC",
    desc: "TOEIC Listening & Reading: 200 câu, khoảng 2 tiếng, thang điểm 10-990.",
  },
  {
    id: "ielts",
    label: "IELTS",
    desc: "Lộ trình IELTS 6.5: dạng bài, luyện từng phần, full test.",
  },
];

export const PHASES: PhaseNode[] = [
  {
    id: "phase1",
    label: "Chòm Nền tảng",
    short: "Nền tảng",
    duration: "1-2 tháng",
    desc: "Xây nền phát âm, ngữ pháp và từ vựng — dùng chung cho cả TOEIC và IELTS.",
    constellation: "base",
    groups: [
      { id: "g-pron", label: "Phát âm", items: pron },
      { id: "g-gram", label: "Ngữ pháp", items: grammar },
      { id: "g-vocab", label: "Từ vựng nền", items: vocabBase },
      { id: "g-my-base", label: "Thẻ tự tạo", items: [myCardsItem("my-base", "phần nền tảng")] },
    ],
  },
  {
    id: "toeic1",
    label: "Chòm TOEIC — Listening & Reading",
    short: "TOEIC",
    duration: "2-3 tháng",
    desc: "7 Part của đề TOEIC, từ vựng công sở và chiến lược phòng thi.",
    constellation: "toeic",
    requiresConstellation: "base",
    requiresPercent: 50,
    groups: [
      { id: "g-t-listen", label: "TOEIC Listening", items: TOEIC_LISTENING_ITEMS },
      { id: "g-t-read", label: "TOEIC Reading", items: TOEIC_READING_ITEMS },
      { id: "g-t-extra", label: "Từ vựng & chiến lược", items: TOEIC_EXTRA_ITEMS },
      {
        id: "g-my-toeic",
        label: "Thẻ tự tạo",
        items: [myCardsItem("my-toeic", "khoá TOEIC của bạn")],
      },
    ],
  },
  {
    id: "phase2",
    label: "IELTS — Dạng bài",
    short: "Dạng bài",
    duration: "~3 tháng",
    desc: "Nắm chiến thuật cho từng dạng câu hỏi của cả 4 kỹ năng.",
    constellation: "ielts",
    requiresConstellation: "toeic",
    requiresPercent: 60,
    groups: [
      { id: "g-vocab3", label: "Từ vựng IELTS", items: vocabIelts },
      { id: "g-my-ielts", label: "Thẻ tự tạo", items: [myCardsItem("my-ielts", "phần IELTS")] },

      { id: "g-l2", label: "Listening", items: listening2 },
      { id: "g-r2", label: "Reading", items: reading2 },
      { id: "g-s2", label: "Speaking", items: speaking2 },
      { id: "g-w2", label: "Writing", items: writing2 },
      {
        id: "g-para",
        label: "Paraphrase",
        items: [
          item(
            "para-1",
            "Paraphrase — Keyword Table",
            "Xây bảng từ khoá và cách diễn đạt lại — kỹ năng lõi của cả 4 phần thi.",
            [
              "Lập bảng: từ gốc | đồng nghĩa | đổi từ loại | đổi cấu trúc.",
              "Mỗi ngày paraphrase 5 câu đề Writing Task 2.",
              "Đừng thay từ máy móc — giữ đúng nghĩa quan trọng hơn dùng từ khó.",
            ],
            [L.paraphrase, L.vocab],
          ),
        ],
      },
    ],
  },
  {
    id: "phase3",
    label: "IELTS — Luyện từng phần",
    short: "Luyện phần",
    duration: "2-3 tháng",
    desc: "Luyện sâu từng part/passage tới khi đạt mục tiêu 3 lần liên tiếp mới đi tiếp.",
    constellation: "ielts",
    requires: "phase2",
    requiresPercent: 70,
    groups: [
      { id: "g-l3", label: "Listening theo part", items: practiceListening },
      { id: "g-r3", label: "Reading theo passage", items: practiceReading },
      {
        id: "g-rule",
        label: "Luật quan trọng",
        items: [
          item(
            "rule-1",
            "Luật 3 lần liên tiếp",
            "Chỉ chuyển sang part/passage kế tiếp khi đạt mục tiêu trong 3 lần làm liên tiếp.",
            [
              "Ghi nhật ký điểm từng lần làm, đánh dấu đạt/không đạt.",
              "Không đạt thì đếm lại từ đầu — kỷ luật này giữ nền vững.",
              "Mỗi lần làm xong bắt buộc phân tích lỗi trước khi làm bài kế tiếp.",
            ],
            [L.exp, L.tips],
          ),
        ],
      },
    ],
  },
  {
    id: "phase4",
    label: "IELTS — Full test",
    short: "Full test",
    duration: "2-3 tháng",
    desc: "Chạy đề trọn vẹn theo điều kiện phòng thi để giữ sức và giữ nhịp.",
    constellation: "ielts",
    requires: "phase3",
    requiresPercent: 70,
    groups: [{ id: "g-full", label: "Full test", items: fullTest }],
  },
];

export const ALL_ITEM_IDS = PHASES.flatMap((p) =>
  p.groups.flatMap((g) => g.items.map((i) => i.id)),
);

export const PHASE_ITEM_IDS: Record<string, string[]> = Object.fromEntries(
  PHASES.map((p) => [p.id, p.groups.flatMap((g) => g.items.map((i) => i.id))]),
);

export const CONSTELLATION_PHASE_IDS: Record<ConstellationId, string[]> = {
  base: PHASES.filter((p) => p.constellation === "base").map((p) => p.id),
  toeic: PHASES.filter((p) => p.constellation === "toeic").map((p) => p.id),
  ielts: PHASES.filter((p) => p.constellation === "ielts").map((p) => p.id),
};

export const CONSTELLATION_ITEM_IDS: Record<ConstellationId, string[]> = {
  base: CONSTELLATION_PHASE_IDS.base.flatMap((id) => PHASE_ITEM_IDS[id] ?? []),
  toeic: CONSTELLATION_PHASE_IDS.toeic.flatMap((id) => PHASE_ITEM_IDS[id] ?? []),
  ielts: CONSTELLATION_PHASE_IDS.ielts.flatMap((id) => PHASE_ITEM_IDS[id] ?? []),
};

export const PHASE_CONSTELLATION: Record<string, ConstellationId> = Object.fromEntries(
  PHASES.map((p) => [p.id, p.constellation] as const),
);

export const ITEM_CONSTELLATION: Record<string, ConstellationId> = Object.fromEntries(
  PHASES.flatMap((p) =>
    p.groups.flatMap((g) => g.items.map((i) => [i.id, p.constellation] as const)),
  ),
);

export const GROUP_ITEM_IDS: Record<string, string[]> = Object.fromEntries(
  PHASES.flatMap((p) => p.groups.map((g) => [g.id, g.items.map((i) => i.id)] as const)),
);

export const GROUP_LABELS: Record<string, string> = Object.fromEntries(
  PHASES.flatMap((p) => p.groups.map((g) => [g.id, g.label] as const)),
);

export const ITEM_PARENT: Record<string, string> = Object.fromEntries(
  PHASES.flatMap((p) => p.groups.flatMap((g) => g.items.map((i) => [i.id, g.id] as const))),
);

export const ITEM_BY_ID: Record<string, ItemNode> = Object.fromEntries(
  PHASES.flatMap((p) => p.groups.flatMap((g) => g.items.map((i) => [i.id, i] as const))),
);
