import type { QuizLesson } from "./lesson-types";

/**
 * Bài học chiến thuật cho các dạng bài Listening / Reading.
 * Quiz kiểu tình huống: "gặp tình huống này thì xử lý thế nào".
 * Mỗi kho ≥12 câu, mỗi lần test rút ngẫu nhiên 10 câu.
 */
export const STRATEGY_LESSONS: QuizLesson[] = [
  {
    kind: "quiz",
    nodeId: "l2-1",
    threshold: 0.8,
    theory: [
      "Form / Note / Table Completion luôn có giới hạn số từ — đọc dòng chữ in hoa trước khi làm bất cứ gì.",
      "Trước khi audio chạy, dự đoán loại thông tin của mỗi chỗ trống: số, tên riêng, danh từ, ngày tháng.",
      "Chính tả và số nhiều sai là mất trọn điểm, dù bạn nghe đúng.",
    ],
    questions: [
      {
        id: "l21-q1",
        prompt:
          "Đề ghi NO MORE THAN TWO WORDS AND/OR A NUMBER. Bạn nghe được “a large wooden table”. Điền gì?",
        options: ["a large wooden table", "wooden table", "large wooden", "a wooden table"],
        answer: 1,
        explain:
          "Chỉ được hai từ. Giữ lại phần mang thông tin phân biệt nhất và bỏ mạo từ: “wooden table”.",
      },
      {
        id: "l21-q2",
        prompt: "Bạn lỡ mất một câu vì còn phân vân. Nên làm gì?",
        options: [
          "Dừng lại nghĩ cho ra rồi mới nghe tiếp",
          "Bỏ trống tạm, bám ngay vào câu kế tiếp",
          "Tua lại trong đầu và đoán bừa cả hai câu",
          "Bỏ luôn cả phần đó",
        ],
        answer: 1,
        explain:
          "Audio chỉ chạy một lần. Bám nhịp là ưu tiên số một; câu bỏ lỡ sẽ đoán lại lúc chép đáp án.",
      },
      {
        id: "l21-q3",
        prompt: "Trước khi audio chạy, việc quan trọng nhất trong 30 giây chuẩn bị là gì?",
        options: [
          "Đọc lướt câu hỏi và dự đoán loại từ cần điền",
          "Viết sẵn đáp án đoán mò",
          "Đọc lại phần vừa làm",
          "Nhắm mắt thư giãn",
        ],
        answer: 0,
        explain: "Dự đoán loại thông tin (số, tên, danh từ) giúp tai bắt đúng chỗ khi audio chạy.",
      },
      {
        id: "l21-q4",
        prompt: "Đề giới hạn ONE WORD ONLY. Bạn nghe “twenty dollars”. Điền gì?",
        options: ["twenty dollars", "$20", "twenty", "20 dollars"],
        answer: 1,
        explain: "$20 tính là một đơn vị số/ký hiệu, an toàn khi chỉ được một từ.",
      },
      {
        id: "l21-q5",
        prompt: "Người nói: “It's on Tuesday… sorry, actually on Thursday.” Đáp án là gì?",
        options: ["Tuesday", "Thursday", "Cả hai", "Không xác định"],
        answer: 1,
        explain: "Thông tin sửa lại luôn là đáp án; bẫy tự sửa rất phổ biến trong Listening.",
      },
      {
        id: "l21-q6",
        prompt: "Bạn nghe rõ từ nhưng không chắc chính tả. Nên làm gì?",
        options: [
          "Bỏ trống cho an toàn",
          "Viết theo cách phát âm gần nhất và kiểm tra lại lúc chép đáp án",
          "Viết bằng tiếng Việt",
          "Viết cả hai cách trong ô",
        ],
        answer: 1,
        explain: "Bỏ trống chắc chắn 0 điểm; viết gần đúng vẫn có cơ hội, và có thời gian sửa sau.",
      },
      {
        id: "l21-q7",
        prompt: "Trong Section 1, thông tin thường bị bẫy nhất là gì?",
        options: ["Số điện thoại, tên riêng đánh vần", "Ý kiến của người nói", "Kết luận nghiên cứu", "Từ nối"],
        answer: 0,
        explain: "Section 1 là bối cảnh giao dịch: số, địa chỉ, tên đánh vần — nghe từng ký tự.",
      },
      {
        id: "l21-q8",
        prompt: "Câu hỏi có chỗ trống đứng sau “a” — đáp án nhiều khả năng là gì?",
        options: ["Danh từ số nhiều", "Danh từ số ít đếm được", "Động từ", "Trạng từ"],
        answer: 1,
        explain: "Mạo từ a báo hiệu danh từ số ít; điền số nhiều là sai ngữ pháp và mất điểm.",
      },
      {
        id: "l21-q9",
        prompt: "Với Multiple Choice trong Listening, chiến thuật tốt nhất là gì?",
        options: [
          "Gạch chân từ khoá khác biệt giữa các phương án trước khi nghe",
          "Chờ nghe xong rồi mới đọc phương án",
          "Chọn phương án dài nhất",
          "Chọn phương án chứa từ vừa nghe thấy",
        ],
        answer: 0,
        explain: "Bài nghe thường nhắc tới cả ba phương án; điểm khác biệt mới quyết định đáp án.",
      },
      {
        id: "l21-q10",
        prompt: "Với Map / Plan Labelling, việc cần làm trước khi nghe là gì?",
        options: [
          "Xác định điểm mốc và hướng bắt đầu trên bản đồ",
          "Học thuộc mọi tên trong bản đồ",
          "Đoán trước đáp án",
          "Đọc transcript",
        ],
        answer: 0,
        explain: "Người nói dẫn đường từ một điểm mốc; xác định trước giúp bạn không lạc.",
      },
      {
        id: "l21-q11",
        prompt: "Đề ghi NO MORE THAN THREE WORDS. Bạn viết 4 từ dù nội dung đúng. Kết quả?",
        options: ["Vẫn được điểm", "Mất điểm hoàn toàn", "Được nửa điểm", "Tuỳ giám khảo"],
        answer: 1,
        explain: "Vượt giới hạn từ là sai, không có điểm một phần trong IELTS Listening.",
      },
      {
        id: "l21-q12",
        prompt: "10 phút chép đáp án cuối bài nên ưu tiên làm gì trước?",
        options: [
          "Điền các ô còn trống bằng phỏng đoán hợp lý",
          "Kiểm tra lại chữ đẹp",
          "Đọc lại toàn bộ câu hỏi",
          "Nghỉ ngơi",
        ],
        answer: 0,
        explain: "Không bị trừ điểm khi đoán sai, nên tuyệt đối không để ô nào trống.",
      },
      {
        id: "l21-q13",
        prompt: "Đáp án trong bảng ghi “fee: £___ per month”, bạn nghe “fifteen pounds fifty”. Điền gì?",
        options: ["15.50", "£15.50", "fifteen pounds fifty", "15 pounds 50"],
        answer: 0,
        explain: "Ký hiệu £ đã có sẵn trong đề nên chỉ điền con số: 15.50.",
      },
    ],
  },
  {
    kind: "quiz",
    nodeId: "r2-1",
    threshold: 0.8,
    theory: [
      "True / False / Not Given xét thông tin TRONG bài, không xét kiến thức đời thường của bạn.",
      "False = bài nói ngược lại. Not Given = bài không hề nhắc tới.",
      "Bám vào từ hạn định: all, only, always, never — chúng thường tạo ra False.",
    ],
    questions: [
      {
        id: "r21-q1",
        prompt:
          "Bài viết: “Some researchers support the theory.” Nhận định: “All researchers support the theory.”",
        options: ["True", "False", "Not Given", "Không đủ dữ kiện để xét"],
        answer: 1,
        explain: "“Some” và “all” mâu thuẫn trực tiếp nên đáp án là False, không phải Not Given.",
      },
      {
        id: "r21-q2",
        prompt: "Bài viết không nhắc gì tới chi phí. Nhận định: “The project was expensive.”",
        options: ["True", "False", "Not Given", "Partly true"],
        answer: 2,
        explain: "Bài không đưa thông tin để khẳng định hay bác bỏ, nên là Not Given.",
      },
      {
        id: "r21-q3",
        prompt: "Bài: “The museum opens daily except Monday.” Nhận định: “The museum is closed on Mondays.”",
        options: ["True", "False", "Not Given", "Không xác định"],
        answer: 0,
        explain: "Diễn đạt khác nhưng nội dung trùng khớp hoàn toàn → True.",
      },
      {
        id: "r21-q4",
        prompt: "Với dạng Yes / No / Not Given, bạn đang xét điều gì?",
        options: ["Sự thật khách quan", "Quan điểm của tác giả", "Ý kiến của bạn", "Số liệu thống kê"],
        answer: 1,
        explain: "Yes/No/Not Given xét quan điểm, niềm tin của tác giả; True/False xét thông tin.",
      },
      {
        id: "r21-q5",
        prompt: "Chiến thuật đúng cho Matching Headings là gì?",
        options: [
          "Đọc câu đầu và câu cuối mỗi đoạn để nắm ý chính",
          "Đọc kỹ từng câu trong đoạn",
          "Chọn heading có từ trùng với đoạn",
          "Chọn theo thứ tự cho sẵn",
        ],
        answer: 0,
        explain: "Heading là ý chính; từ trùng lặp thường là bẫy đặt ở đoạn khác.",
      },
      {
        id: "r21-q6",
        prompt: "Bạn còn 5 phút và chưa làm 6 câu. Nên làm gì?",
        options: [
          "Đọc kỹ để làm đúng 2 câu",
          "Điền phỏng đoán tất cả rồi rà nhanh những câu dễ",
          "Bỏ trống các câu chưa làm",
          "Làm lại từ đầu",
        ],
        answer: 1,
        explain: "Không bị trừ điểm khi sai, nên luôn điền hết; TFNG đoán vẫn có ~33% cơ hội.",
      },
      {
        id: "r21-q7",
        prompt: "Với Matching Information (which paragraph contains…), lưu ý quan trọng nhất là gì?",
        options: [
          "Đáp án không theo thứ tự và một đoạn có thể dùng nhiều lần",
          "Đáp án luôn theo thứ tự",
          "Mỗi đoạn chỉ dùng một lần",
          "Chỉ cần đọc đoạn đầu",
        ],
        answer: 0,
        explain: "Đây là dạng tốn thời gian nhất, nên làm sau cùng vì thứ tự bị xáo trộn.",
      },
      {
        id: "r21-q8",
        prompt: "Trong Sentence Completion, đáp án bắt buộc phải thế nào?",
        options: [
          "Lấy đúng từ trong bài, không đổi dạng",
          "Paraphrase lại bằng từ của bạn",
          "Dịch sang từ đồng nghĩa",
          "Viết đầy đủ câu",
        ],
        answer: 0,
        explain: "Dạng completion yêu cầu từ nguyên văn trong bài; đổi dạng từ là sai.",
      },
      {
        id: "r21-q9",
        prompt: "Bài: “Critics argue the policy failed.” Nhận định: “The policy failed.”",
        options: ["True", "False", "Not Given", "Yes"],
        answer: 2,
        explain: "Bài chỉ nêu ý kiến của nhóm phê bình, không khẳng định sự thật → Not Given.",
      },
      {
        id: "r21-q10",
        prompt: "Kỹ thuật scanning dùng để làm gì?",
        options: [
          "Tìm nhanh thông tin cụ thể như số, tên riêng",
          "Nắm ý chính toàn bài",
          "Đọc hiểu từng câu",
          "Học từ mới",
        ],
        answer: 0,
        explain: "Scanning là quét tìm chi tiết; skimming mới là đọc lướt lấy ý chính.",
      },
      {
        id: "r21-q11",
        prompt: "Gặp từ mới không hiểu trong đoạn chứa đáp án, bạn nên làm gì?",
        options: [
          "Đoán nghĩa qua ngữ cảnh và cấu trúc câu",
          "Dừng lại tra từ điển trong đầu thật lâu",
          "Bỏ qua cả câu hỏi",
          "Chọn phương án chứa từ đó",
        ],
        answer: 0,
        explain: "Ngữ cảnh xung quanh thường đủ để suy ra vai trò của từ; không cần hiểu 100%.",
      },
      {
        id: "r21-q12",
        prompt: "Phân bổ thời gian hợp lý cho 3 passage trong 60 phút là gì?",
        options: [
          "20 - 20 - 20 phút",
          "30 - 20 - 10 phút",
          "10 - 20 - 30 phút",
          "Làm hết passage 1 thật kỹ rồi tính tiếp",
        ],
        answer: 0,
        explain: "Mỗi passage 13 - 14 câu, giá trị điểm như nhau; chia đều là an toàn nhất.",
      },
      {
        id: "r21-q13",
        prompt: "Nhận định chứa “only” trong khi bài nêu nhiều nguyên nhân. Đáp án nhiều khả năng là gì?",
        options: ["True", "False", "Not Given", "Yes"],
        answer: 1,
        explain: "Từ hạn định tuyệt đối (only, never, all) thường mâu thuẫn với nội dung bài → False.",
      },
    ],
  },
];
