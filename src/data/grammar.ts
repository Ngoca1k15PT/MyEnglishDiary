import type { QuizLesson } from "./lesson-types";
import type { GrammarQuestion, GrammarTopic } from "./grammar-types";
import { GRAMMAR_EXTRA_QUESTIONS } from "./grammar-extra";

/**
 * Dữ liệu thật: 18 chủ đề ngữ pháp. Mỗi chủ đề có kho 12–13 câu
 * (câu gốc + câu bổ sung trong grammar-extra.ts) để mỗi lần test rút ngẫu nhiên 10 câu.
 * `l` là bài lý thuyết có thẻ <b>/<i> và ký tự xuống dòng — render bằng <RichTheory />.
 */
export type { GrammarQuestion, GrammarTopic };


export const GRAMMAR_TOPICS: GrammarTopic[] = [
  {
    "id": "tobe",
    "order": 1,
    "name": "Động từ TO BE (am/is/are)",
    "l": "<b>Công thức</b>\nI <b>am</b> · He/She/It <b>is</b> · You/We/They <b>are</b>\n\nPhủ định: thêm <b>not</b> → I am not / She isn't / They aren't\nCâu hỏi: đảo lên đầu → <b>Are</b> you a student?\n\n⚠️ <b>Lỗi người Việt hay mắc:</b>\nTiếng Việt nói \"Tôi đói\" không cần \"thì/là\". Tiếng Anh <b>bắt buộc</b> có to be:\n❌ I hungry → ✅ I <b>am</b> hungry\n❌ She beautiful → ✅ She <b>is</b> beautiful",
    "qs": [
      {
        "q": "I ___ a student.",
        "o": [
          "am",
          "is",
          "are",
          "be"
        ],
        "a": 0,
        "why": "Chủ ngữ I luôn đi với am."
      },
      {
        "q": "My parents ___ teachers.",
        "o": [
          "am",
          "is",
          "are",
          "be"
        ],
        "a": 2,
        "why": "parents số nhiều → are."
      },
      {
        "q": "___ she your sister?",
        "o": [
          "Am",
          "Is",
          "Are",
          "Do"
        ],
        "a": 1,
        "why": "she số ít ngôi 3 → Is. Đảo to be lên đầu để hỏi."
      },
      {
        "q": "Chọn câu ĐÚNG:",
        "o": [
          "I very tired.",
          "I am very tired.",
          "I very am tired.",
          "Am I very tired."
        ],
        "a": 1,
        "why": "Tiếng Anh bắt buộc có to be trước tính từ."
      },
      {
        "q": "The weather ___ hot today.",
        "o": [
          "am",
          "is",
          "are",
          "do"
        ],
        "a": 1,
        "why": "weather là danh từ không đếm được, số ít → is."
      },
      {
        "q": "They ___ not at home.",
        "o": [
          "is",
          "am",
          "are",
          "does"
        ],
        "a": 2,
        "why": "they → are. Phủ định: are not / aren't."
      }
    ]
  },
  {
    "id": "present_simple",
    "order": 2,
    "name": "Thì hiện tại đơn",
    "l": "<b>Dùng khi:</b> thói quen, sự thật hiển nhiên, lịch trình cố định.\n\n<b>Công thức</b>\nI/You/We/They + <b>V</b>\nHe/She/It + <b>V-s/es</b>\n\nPhủ định: <b>don't</b> / <b>doesn't</b> + V(nguyên thể)\nCâu hỏi: <b>Do</b> / <b>Does</b> + S + V?\n\n⚠️ <b>Lỗi người Việt hay mắc:</b>\n① Quên -s ở ngôi thứ 3 số ít — lỗi số 1 của người Việt\n❌ She go to school → ✅ She go<b>es</b> to school\n② Sau doesn't/don't thì <b>bỏ -s</b>\n❌ He doesn't likes → ✅ He doesn't <b>like</b>",
    "qs": [
      {
        "q": "She ___ to work by bus every day.",
        "o": [
          "go",
          "goes",
          "going",
          "is go"
        ],
        "a": 1,
        "why": "She = ngôi 3 số ít → thêm -es."
      },
      {
        "q": "My brother ___ English at university.",
        "o": [
          "study",
          "studys",
          "studies",
          "studying"
        ],
        "a": 2,
        "why": "Động từ tận cùng phụ âm + y → bỏ y, thêm -ies."
      },
      {
        "q": "He ___ coffee.",
        "o": [
          "doesn't likes",
          "don't like",
          "doesn't like",
          "not like"
        ],
        "a": 2,
        "why": "He → doesn't, và sau doesn't động từ về nguyên thể (bỏ -s)."
      },
      {
        "q": "___ you speak English?",
        "o": [
          "Do",
          "Does",
          "Are",
          "Is"
        ],
        "a": 0,
        "why": "you → Do. Động từ thường dùng Do/Does, không dùng to be."
      },
      {
        "q": "Water ___ at 100 degrees.",
        "o": [
          "boil",
          "boils",
          "is boil",
          "boiling"
        ],
        "a": 1,
        "why": "Sự thật hiển nhiên dùng hiện tại đơn; water số ít → boils."
      },
      {
        "q": "Chọn câu SAI:",
        "o": [
          "I work here.",
          "She works here.",
          "They work here.",
          "He work here."
        ],
        "a": 3,
        "why": "He cần -s: He works here."
      },
      {
        "q": "My sister ___ watch horror films.",
        "o": [
          "don't",
          "doesn't",
          "isn't",
          "not"
        ],
        "a": 1,
        "why": "sister = ngôi 3 số ít → doesn't."
      }
    ]
  },
  {
    "id": "present_cont",
    "order": 3,
    "name": "Thì hiện tại tiếp diễn",
    "l": "<b>Dùng khi:</b> hành động đang xảy ra ngay lúc nói, hoặc giai đoạn hiện tại.\n\n<b>Công thức</b>\nS + <b>am/is/are</b> + <b>V-ing</b>\n\nDấu hiệu: now, at the moment, right now, look!, listen!\n\n⚠️ <b>Lỗi người Việt hay mắc:</b>\n① Quên to be\n❌ I studying → ✅ I <b>am</b> studying\n② Động từ chỉ trạng thái <b>không</b> chia tiếp diễn: like, love, want, need, know, understand, believe\n❌ I am knowing → ✅ I know",
    "qs": [
      {
        "q": "Look! It ___.",
        "o": [
          "rain",
          "rains",
          "is raining",
          "raining"
        ],
        "a": 2,
        "why": "Look! báo hiệu hành động đang diễn ra → is + V-ing."
      },
      {
        "q": "They ___ TV at the moment.",
        "o": [
          "watch",
          "watches",
          "are watching",
          "is watching"
        ],
        "a": 2,
        "why": "they → are + watching."
      },
      {
        "q": "Chọn câu ĐÚNG:",
        "o": [
          "I am wanting a coffee.",
          "I want a coffee.",
          "I wanting a coffee.",
          "I am want a coffee."
        ],
        "a": 1,
        "why": "want là động từ trạng thái, không dùng dạng tiếp diễn."
      },
      {
        "q": "She ___ her homework right now.",
        "o": [
          "do",
          "does",
          "is doing",
          "doing"
        ],
        "a": 2,
        "why": "right now → hiện tại tiếp diễn: is doing."
      },
      {
        "q": "I usually ___ at 7, but today I ___ at 9.",
        "o": [
          "get up / get up",
          "am getting up / get up",
          "get up / am getting up",
          "getting up / get up"
        ],
        "a": 2,
        "why": "usually → hiện tại đơn; today (ngoại lệ tạm thời) → tiếp diễn."
      },
      {
        "q": "We ___ not working today.",
        "o": [
          "do",
          "does",
          "are",
          "is"
        ],
        "a": 2,
        "why": "we → are."
      }
    ]
  },
  {
    "id": "past_simple",
    "order": 4,
    "name": "Thì quá khứ đơn",
    "l": "<b>Dùng khi:</b> việc đã xong hẳn trong quá khứ, có mốc thời gian rõ.\n\n<b>Công thức</b>\nS + <b>V-ed</b> (hoặc động từ bất quy tắc cột 2)\n\nPhủ định: <b>didn't</b> + V(nguyên thể)\nCâu hỏi: <b>Did</b> + S + V(nguyên thể)?\n\nDấu hiệu: yesterday, last week, ago, in 2020\n\n⚠️ <b>Lỗi người Việt hay mắc:</b>\nSau <b>did/didn't</b> thì động từ về NGUYÊN THỂ\n❌ I didn't went → ✅ I didn't <b>go</b>\n❌ Did you saw it? → ✅ Did you <b>see</b> it?",
    "qs": [
      {
        "q": "I ___ to Hanoi last summer.",
        "o": [
          "go",
          "went",
          "gone",
          "going"
        ],
        "a": 1,
        "why": "last summer → quá khứ đơn. go → went."
      },
      {
        "q": "She ___ finish the report.",
        "o": [
          "didn't",
          "doesn't",
          "wasn't",
          "hasn't"
        ],
        "a": 0,
        "why": "Phủ định quá khứ đơn dùng didn't + V nguyên thể."
      },
      {
        "q": "___ you see the film yesterday?",
        "o": [
          "Do",
          "Did",
          "Are",
          "Were"
        ],
        "a": 1,
        "why": "yesterday → Did + S + V nguyên thể."
      },
      {
        "q": "Chọn câu ĐÚNG:",
        "o": [
          "I didn't ate breakfast.",
          "I didn't eat breakfast.",
          "I don't ate breakfast.",
          "I not ate breakfast."
        ],
        "a": 1,
        "why": "Sau didn't, động từ luôn ở dạng nguyên thể."
      },
      {
        "q": "He ___ born in 1998.",
        "o": [
          "is",
          "was",
          "were",
          "did"
        ],
        "a": 1,
        "why": "He số ít + quá khứ → was born."
      },
      {
        "q": "They ___ very tired after the trip.",
        "o": [
          "was",
          "were",
          "are",
          "did"
        ],
        "a": 1,
        "why": "they + quá khứ → were."
      },
      {
        "q": "We ___ dinner at 8 o'clock last night.",
        "o": [
          "have",
          "had",
          "has",
          "having"
        ],
        "a": 1,
        "why": "last night → quá khứ. have → had."
      }
    ]
  },
  {
    "id": "past_cont",
    "order": 5,
    "name": "Thì quá khứ tiếp diễn",
    "l": "<b>Dùng khi:</b> hành động đang diễn ra tại một thời điểm trong quá khứ, thường bị hành động khác cắt ngang.\n\n<b>Công thức</b>\nS + <b>was/were</b> + <b>V-ing</b>\n\n<b>Kết hợp kinh điển:</b>\nWhen + quá khứ đơn (việc ngắn, cắt ngang)\nWhile + quá khứ tiếp diễn (việc dài, nền)\n\nI <b>was cooking</b> <i>when</i> the phone <b>rang</b>.\n<i>While</i> I <b>was cooking</b>, the phone <b>rang</b>.",
    "qs": [
      {
        "q": "I ___ TV when you called.",
        "o": [
          "watch",
          "watched",
          "was watching",
          "were watching"
        ],
        "a": 2,
        "why": "Hành động đang diễn ra thì bị cắt ngang → was + V-ing."
      },
      {
        "q": "They ___ dinner at 7 p.m. yesterday.",
        "o": [
          "was having",
          "were having",
          "have",
          "had been"
        ],
        "a": 1,
        "why": "they → were + having."
      },
      {
        "q": "While she ___, the lights went out.",
        "o": [
          "studies",
          "studied",
          "was studying",
          "is studying"
        ],
        "a": 2,
        "why": "While thường đi với quá khứ tiếp diễn (việc dài làm nền)."
      },
      {
        "q": "He ___ his bike when it started to rain.",
        "o": [
          "rides",
          "rode",
          "was riding",
          "is riding"
        ],
        "a": 2,
        "why": "Việc dài đang diễn ra → was riding; started là việc cắt ngang."
      },
      {
        "q": "Chọn câu ĐÚNG:",
        "o": [
          "When I arrived, she was cooking.",
          "When I was arriving, she cooked.",
          "When I arrive, she was cooking.",
          "When I arrived, she cooking."
        ],
        "a": 0,
        "why": "Việc ngắn (arrived) dùng quá khứ đơn, việc nền (was cooking) dùng tiếp diễn."
      },
      {
        "q": "What ___ you doing at 9 last night?",
        "o": [
          "was",
          "were",
          "did",
          "are"
        ],
        "a": 1,
        "why": "you → were."
      }
    ]
  },
  {
    "id": "present_perfect",
    "order": 6,
    "name": "Thì hiện tại hoàn thành",
    "l": "<b>Dùng khi:</b> việc đã xảy ra nhưng <b>còn liên quan tới hiện tại</b> — không nêu mốc thời gian cụ thể.\n\n<b>Công thức</b>\nS + <b>have/has</b> + <b>V3</b> (quá khứ phân từ)\n\nDấu hiệu: already, yet, just, ever, never, since, for, recently\n\n⚠️ <b>Điểm người Việt hay lẫn:</b>\nCó mốc thời gian rõ → <b>quá khứ đơn</b>\nKhông có mốc / còn liên quan hiện tại → <b>hiện tại hoàn thành</b>\n\nI <b>saw</b> him yesterday. (có mốc)\nI <b>have seen</b> that film. (không nêu khi nào)\n\n<b>since</b> + mốc thời gian (since 2020)\n<b>for</b> + khoảng thời gian (for 3 years)",
    "qs": [
      {
        "q": "I ___ never ___ to Japan.",
        "o": [
          "have / been",
          "has / been",
          "did / go",
          "am / being"
        ],
        "a": 0,
        "why": "I → have; never là dấu hiệu hiện tại hoàn thành; be → been."
      },
      {
        "q": "She ___ here ___ 2019.",
        "o": [
          "works / for",
          "has worked / since",
          "worked / since",
          "has worked / for"
        ],
        "a": 1,
        "why": "2019 là mốc thời gian → since. Việc kéo dài tới nay → has worked."
      },
      {
        "q": "We ___ in Da Nang ___ five years.",
        "o": [
          "have lived / for",
          "have lived / since",
          "lived / for",
          "live / since"
        ],
        "a": 0,
        "why": "five years là khoảng thời gian → for."
      },
      {
        "q": "___ you ever eaten pho?",
        "o": [
          "Do",
          "Did",
          "Have",
          "Are"
        ],
        "a": 2,
        "why": "ever + V3 → Have you ever...?"
      },
      {
        "q": "Chọn câu ĐÚNG:",
        "o": [
          "I have seen him yesterday.",
          "I saw him yesterday.",
          "I have saw him yesterday.",
          "I did seen him yesterday."
        ],
        "a": 1,
        "why": "yesterday là mốc quá khứ rõ ràng → phải dùng quá khứ đơn."
      },
      {
        "q": "He ___ just ___ the report.",
        "o": [
          "have / finish",
          "has / finished",
          "did / finish",
          "is / finishing"
        ],
        "a": 1,
        "why": "He → has; just là dấu hiệu hiện tại hoàn thành; finish → finished."
      },
      {
        "q": "I ___ my keys. I can't open the door.",
        "o": [
          "lose",
          "lost",
          "have lost",
          "was losing"
        ],
        "a": 2,
        "why": "Hậu quả còn kéo dài tới hiện tại → hiện tại hoàn thành."
      }
    ]
  },
  {
    "id": "future",
    "order": 7,
    "name": "Thì tương lai (will / be going to)",
    "l": "<b>WILL</b> — quyết định ngay lúc nói, dự đoán không có căn cứ, lời hứa\nS + <b>will</b> + V(nguyên thể)\n\"The phone is ringing.\" — \"I<b>'ll</b> get it.\"\n\n<b>BE GOING TO</b> — kế hoạch đã định trước, dự đoán CÓ dấu hiệu\nS + <b>am/is/are going to</b> + V\nI<b>'m going to</b> study English this year. (đã quyết từ trước)\nLook at those clouds! It<b>'s going to</b> rain. (có dấu hiệu)\n\n⚠️ Sau <b>will</b> luôn là động từ nguyên thể, không chia\n❌ She will goes → ✅ She will <b>go</b>",
    "qs": [
      {
        "q": "I've decided. I ___ buy a new laptop next month.",
        "o": [
          "will",
          "am going to",
          "would",
          "go to"
        ],
        "a": 1,
        "why": "Đã quyết định từ trước → be going to."
      },
      {
        "q": "That bag looks heavy. I ___ help you.",
        "o": [
          "am going to",
          "will",
          "would",
          "am helping"
        ],
        "a": 1,
        "why": "Quyết định ngay lúc nói → will."
      },
      {
        "q": "Look at the sky! It ___ rain.",
        "o": [
          "will",
          "is going to",
          "would",
          "rains"
        ],
        "a": 1,
        "why": "Có dấu hiệu nhìn thấy được → be going to."
      },
      {
        "q": "She ___ come to the party tomorrow.",
        "o": [
          "will",
          "wills",
          "will to",
          "will comes"
        ],
        "a": 0,
        "why": "will + V nguyên thể, không thêm -s."
      },
      {
        "q": "Chọn câu SAI:",
        "o": [
          "I will call you.",
          "He will helps me.",
          "They will arrive soon.",
          "We will not go."
        ],
        "a": 1,
        "why": "Sau will phải là help, không phải helps."
      },
      {
        "q": "We ___ get married in June. We booked everything already.",
        "o": [
          "will",
          "are going to",
          "would",
          "get"
        ],
        "a": 1,
        "why": "Kế hoạch đã sắp xếp → be going to."
      }
    ]
  },
  {
    "id": "articles",
    "order": 8,
    "name": "Mạo từ A / AN / THE",
    "l": "<b>A / AN</b> — danh từ đếm được số ít, lần đầu nhắc tới\n<b>a</b> + phụ âm: a book, a university (/ju/ — âm phụ âm)\n<b>an</b> + nguyên âm: an apple, an hour (h câm)\n\n<b>THE</b> — người nghe đã biết là cái nào, thứ duy nhất\nI bought <b>a</b> car. <b>The</b> car is red.\n<b>the</b> sun, <b>the</b> internet, <b>the</b> best\n\n<b>Không mạo từ</b> — danh từ số nhiều/không đếm được nói chung\nI like <b>cats</b>. <b>Water</b> is essential.\n\n⚠️ Tiếng Việt không có mạo từ nên người Việt hay quên hẳn\n❌ I am student → ✅ I am <b>a</b> student",
    "qs": [
      {
        "q": "I need ___ umbrella.",
        "o": [
          "a",
          "an",
          "the",
          "-"
        ],
        "a": 1,
        "why": "umbrella bắt đầu bằng nguyên âm → an."
      },
      {
        "q": "She is ___ engineer.",
        "o": [
          "a",
          "an",
          "the",
          "-"
        ],
        "a": 1,
        "why": "engineer bắt đầu bằng nguyên âm → an."
      },
      {
        "q": "I bought a shirt. ___ shirt was expensive.",
        "o": [
          "A",
          "An",
          "The",
          "-"
        ],
        "a": 2,
        "why": "Nhắc lại thứ đã đề cập → the."
      },
      {
        "q": "___ sun rises in the east.",
        "o": [
          "A",
          "An",
          "The",
          "-"
        ],
        "a": 2,
        "why": "Vật duy nhất trên đời → the."
      },
      {
        "q": "I like ___ dogs.",
        "o": [
          "a",
          "an",
          "the",
          "-"
        ],
        "a": 3,
        "why": "Nói về loài nói chung, số nhiều → không dùng mạo từ."
      },
      {
        "q": "He is ___ university student.",
        "o": [
          "a",
          "an",
          "the",
          "-"
        ],
        "a": 0,
        "why": "university đọc là /juːnɪ/ — âm đầu là phụ âm → a."
      },
      {
        "q": "Chọn câu ĐÚNG:",
        "o": [
          "I am teacher.",
          "I am a teacher.",
          "I am the teacher of English.",
          "I am an teacher."
        ],
        "a": 1,
        "why": "Nghề nghiệp số ít bắt buộc có a/an."
      }
    ]
  },
  {
    "id": "quantifiers",
    "order": 9,
    "name": "Some / Any / Much / Many / A lot of",
    "l": "<b>SOME</b> — câu khẳng định · <b>ANY</b> — phủ định & nghi vấn\nI have <b>some</b> money. / I don't have <b>any</b> money. / Do you have <b>any</b> money?\n(Ngoại lệ: lời mời — Would you like <b>some</b> tea?)\n\n<b>MANY</b> + danh từ đếm được số nhiều: many book<b>s</b>\n<b>MUCH</b> + danh từ không đếm được: much water\n<b>A LOT OF</b> — dùng được cho cả hai, tự nhiên nhất trong văn nói\n\n<b>FEW / LITTLE</b> = ít (mang nghĩa tiêu cực)\n<b>A FEW / A LITTLE</b> = một vài, một chút (tích cực)\n\n⚠️ Không đếm được: money, water, information, advice, furniture, news, time",
    "qs": [
      {
        "q": "I don't have ___ time.",
        "o": [
          "some",
          "any",
          "many",
          "a"
        ],
        "a": 1,
        "why": "Câu phủ định → any."
      },
      {
        "q": "How ___ students are there in your class?",
        "o": [
          "much",
          "many",
          "a lot",
          "some"
        ],
        "a": 1,
        "why": "students đếm được số nhiều → many."
      },
      {
        "q": "There isn't ___ water in the bottle.",
        "o": [
          "many",
          "much",
          "a few",
          "some"
        ],
        "a": 1,
        "why": "water không đếm được + phủ định → much."
      },
      {
        "q": "She gave me ___ good advice.",
        "o": [
          "many",
          "a few",
          "some",
          "an"
        ],
        "a": 2,
        "why": "advice không đếm được → dùng some, không dùng many/a few."
      },
      {
        "q": "Would you like ___ coffee?",
        "o": [
          "any",
          "some",
          "many",
          "a"
        ],
        "a": 1,
        "why": "Lời mời dùng some dù là câu hỏi."
      },
      {
        "q": "I have ___ friends in Da Nang.",
        "o": [
          "much",
          "a little",
          "a few",
          "any"
        ],
        "a": 2,
        "why": "friends đếm được → a few."
      },
      {
        "q": "Chọn câu SAI:",
        "o": [
          "I have many books.",
          "I have much money.",
          "There are many people.",
          "I don't have much time."
        ],
        "a": 1,
        "why": "Câu khẳng định thường dùng a lot of money, không dùng much money."
      }
    ]
  },
  {
    "id": "comparison",
    "order": 10,
    "name": "So sánh hơn & So sánh nhất",
    "l": "<b>Tính từ NGẮN</b> (1 âm tiết, hoặc 2 âm tiết tận cùng -y)\nhơn: + <b>-er than</b> → cheaper than, easier than\nnhất: <b>the</b> + <b>-est</b> → the cheapest, the easiest\n\n<b>Tính từ DÀI</b> (2 âm tiết trở lên)\nhơn: <b>more</b> + adj + <b>than</b> → more expensive than\nnhất: <b>the most</b> + adj → the most expensive\n\n<b>So sánh bằng:</b> as + adj + as → as big as\n\n<b>Bất quy tắc:</b>\ngood → better → the best\nbad → worse → the worst\nfar → further → the furthest\n\n⚠️ Không dùng \"more\" chung với \"-er\"\n❌ more cheaper → ✅ cheaper",
    "qs": [
      {
        "q": "This book is ___ than that one.",
        "o": [
          "cheap",
          "cheaper",
          "cheapest",
          "more cheap"
        ],
        "a": 1,
        "why": "Tính từ ngắn → cheaper than."
      },
      {
        "q": "She is ___ student in the class.",
        "o": [
          "intelligent",
          "more intelligent",
          "the most intelligent",
          "intelligentest"
        ],
        "a": 2,
        "why": "Tính từ dài, so sánh nhất → the most intelligent."
      },
      {
        "q": "My English is ___ than last year.",
        "o": [
          "good",
          "better",
          "best",
          "gooder"
        ],
        "a": 1,
        "why": "good là bất quy tắc → better."
      },
      {
        "q": "Hanoi is ___ Da Nang.",
        "o": [
          "bigger than",
          "bigger as",
          "more big than",
          "the biggest"
        ],
        "a": 0,
        "why": "big là tính từ ngắn, gấp đôi phụ âm → bigger than."
      },
      {
        "q": "This exam was ___ I expected.",
        "o": [
          "difficult than",
          "more difficult than",
          "most difficult",
          "difficulter than"
        ],
        "a": 1,
        "why": "difficult là tính từ dài → more difficult than."
      },
      {
        "q": "He runs ___ as his brother.",
        "o": [
          "fast",
          "faster",
          "as fast",
          "the fastest"
        ],
        "a": 2,
        "why": "So sánh bằng: as + adj + as."
      },
      {
        "q": "Chọn câu SAI:",
        "o": [
          "It is hotter today.",
          "It is more hot today.",
          "It is the hottest day.",
          "It is as hot as yesterday."
        ],
        "a": 1,
        "why": "hot là tính từ ngắn → hotter, không dùng more hot."
      }
    ]
  },
  {
    "id": "modals",
    "order": 11,
    "name": "Động từ khuyết thiếu (can, should, must...)",
    "l": "<b>CAN</b> — có thể, biết làm (khả năng) · CAN'T = không thể\n<b>COULD</b> — quá khứ của can; hoặc đề nghị lịch sự\n<b>SHOULD</b> — nên (lời khuyên)\n<b>MUST</b> — phải (bắt buộc từ bên trong, mang tính cá nhân)\n<b>HAVE TO</b> — phải (bắt buộc từ hoàn cảnh, quy định bên ngoài)\n<b>MIGHT / MAY</b> — có thể (không chắc chắn)\n\n<b>Quy tắc vàng:</b> sau modal luôn là V <b>nguyên thể</b>, không to, không -s, không -ed\n❌ She can swims → ✅ She can <b>swim</b>\n❌ You should to go → ✅ You should <b>go</b>\n\n⚠️ <b>mustn't</b> = cấm ≠ <b>don't have to</b> = không cần",
    "qs": [
      {
        "q": "She ___ speak three languages.",
        "o": [
          "can",
          "cans",
          "can to",
          "is can"
        ],
        "a": 0,
        "why": "can + V nguyên thể, bản thân can không chia."
      },
      {
        "q": "You ___ see a doctor about that cough.",
        "o": [
          "should to",
          "should",
          "shoulds",
          "are should"
        ],
        "a": 1,
        "why": "should + V nguyên thể, không có to."
      },
      {
        "q": "I ___ wear a uniform at my school. It's a rule.",
        "o": [
          "have to",
          "should",
          "might",
          "can"
        ],
        "a": 0,
        "why": "Quy định bên ngoài bắt buộc → have to."
      },
      {
        "q": "You ___ smoke here. It's forbidden.",
        "o": [
          "don't have to",
          "mustn't",
          "shouldn't have",
          "couldn't"
        ],
        "a": 1,
        "why": "mustn't = cấm tuyệt đối."
      },
      {
        "q": "It's Sunday, so I ___ get up early.",
        "o": [
          "mustn't",
          "don't have to",
          "can't",
          "shouldn't"
        ],
        "a": 1,
        "why": "Không cần thiết (nhưng vẫn được phép) → don't have to."
      },
      {
        "q": "Chọn câu ĐÚNG:",
        "o": [
          "He must to go now.",
          "He must goes now.",
          "He must go now.",
          "He musts go now."
        ],
        "a": 2,
        "why": "must + V nguyên thể, không to, không -s."
      },
      {
        "q": "I ___ be late tonight. I'm not sure yet.",
        "o": [
          "must",
          "might",
          "can",
          "should"
        ],
        "a": 1,
        "why": "Không chắc chắn → might."
      }
    ]
  },
  {
    "id": "conditionals",
    "order": 12,
    "name": "Câu điều kiện loại 0, 1, 2",
    "l": "<b>Loại 0</b> — sự thật luôn đúng\nIf + <b>hiện tại đơn</b>, <b>hiện tại đơn</b>\nIf you heat water, it <b>boils</b>.\n\n<b>Loại 1</b> — có thật, có khả năng xảy ra ở tương lai\nIf + <b>hiện tại đơn</b>, <b>will</b> + V\nIf it <b>rains</b>, I <b>will stay</b> home.\n\n<b>Loại 2</b> — không có thật ở hiện tại, giả định\nIf + <b>quá khứ đơn</b>, <b>would</b> + V\nIf I <b>had</b> more time, I <b>would learn</b> Japanese.\n(Loại 2 dùng <b>were</b> cho mọi ngôi: If I <b>were</b> you...)\n\n⚠️ <b>Lỗi kinh điển:</b> KHÔNG dùng will ngay sau if ở loại 1\n❌ If it will rain → ✅ If it <b>rains</b>",
    "qs": [
      {
        "q": "If it ___ tomorrow, we will cancel the trip.",
        "o": [
          "will rain",
          "rains",
          "rained",
          "would rain"
        ],
        "a": 1,
        "why": "Loại 1: sau if dùng hiện tại đơn, không dùng will."
      },
      {
        "q": "If I ___ rich, I would travel the world.",
        "o": [
          "am",
          "was",
          "were",
          "will be"
        ],
        "a": 2,
        "why": "Loại 2 giả định dùng were cho mọi ngôi."
      },
      {
        "q": "If you heat ice, it ___.",
        "o": [
          "melt",
          "melts",
          "will melt",
          "would melt"
        ],
        "a": 1,
        "why": "Loại 0: sự thật hiển nhiên, cả hai vế hiện tại đơn."
      },
      {
        "q": "If she studied harder, she ___ better results.",
        "o": [
          "will get",
          "gets",
          "would get",
          "got"
        ],
        "a": 2,
        "why": "Loại 2: if + quá khứ đơn, vế chính would + V."
      },
      {
        "q": "I ___ you if I have time.",
        "o": [
          "call",
          "will call",
          "would call",
          "called"
        ],
        "a": 1,
        "why": "Loại 1: vế chính dùng will + V."
      },
      {
        "q": "Chọn câu SAI:",
        "o": [
          "If I were you, I would apologise.",
          "If it rains, I will stay in.",
          "If you will come, I will cook.",
          "If you heat water, it boils."
        ],
        "a": 2,
        "why": "Không dùng will trong mệnh đề if."
      },
      {
        "q": "If I ___ more time, I would learn the guitar.",
        "o": [
          "have",
          "had",
          "will have",
          "would have"
        ],
        "a": 1,
        "why": "Loại 2 (giả định trái hiện tại) → if + quá khứ đơn."
      }
    ]
  },
  {
    "id": "relative",
    "order": 13,
    "name": "Mệnh đề quan hệ (who / which / that)",
    "l": "Dùng để nối hai câu, tránh lặp từ.\n\n<b>WHO</b> — thay cho <b>người</b>\nThe man <b>who</b> lives next door is a doctor.\n<b>WHICH</b> — thay cho <b>vật, sự việc</b>\nThe book <b>which</b> I bought was cheap.\n<b>THAT</b> — thay được cả người lẫn vật (thân mật hơn)\n<b>WHOSE</b> — chỉ sở hữu: the girl <b>whose</b> bag was stolen\n<b>WHERE</b> — chỉ nơi chốn: the café <b>where</b> we met\n\n⚠️ <b>Lỗi người Việt hay mắc:</b> lặp lại chủ ngữ\n❌ The man who he lives next door...\n✅ The man <b>who</b> lives next door...\n(who đã đóng vai chủ ngữ rồi, không cần he nữa)",
    "qs": [
      {
        "q": "The woman ___ called you is my boss.",
        "o": [
          "which",
          "who",
          "whose",
          "where"
        ],
        "a": 1,
        "why": "Thay cho người làm chủ ngữ → who."
      },
      {
        "q": "This is the phone ___ I bought yesterday.",
        "o": [
          "who",
          "which",
          "whose",
          "where"
        ],
        "a": 1,
        "why": "Thay cho vật → which (hoặc that)."
      },
      {
        "q": "That's the restaurant ___ we had dinner.",
        "o": [
          "which",
          "who",
          "where",
          "whose"
        ],
        "a": 2,
        "why": "Chỉ nơi chốn → where."
      },
      {
        "q": "I met a man ___ brother is a famous singer.",
        "o": [
          "who",
          "which",
          "whose",
          "that"
        ],
        "a": 2,
        "why": "Chỉ quan hệ sở hữu (anh trai của ông ấy) → whose."
      },
      {
        "q": "Chọn câu ĐÚNG:",
        "o": [
          "The book which it is on the table is mine.",
          "The book which is on the table is mine.",
          "The book who is on the table is mine.",
          "The book is on the table which mine."
        ],
        "a": 1,
        "why": "which đã làm chủ ngữ, không lặp lại it."
      },
      {
        "q": "The students ___ passed the exam were very happy.",
        "o": [
          "which",
          "who",
          "whose",
          "where"
        ],
        "a": 1,
        "why": "students là người → who."
      }
    ]
  },
  {
    "id": "passive",
    "order": 14,
    "name": "Câu bị động",
    "l": "Dùng khi muốn nhấn mạnh <b>đối tượng bị tác động</b>, hoặc không biết/không cần nói ai làm.\n\n<b>Công thức</b>\nS + <b>be</b> (chia theo thì) + <b>V3</b> (+ by O)\n\nHiện tại đơn: is/are + V3 → The room <b>is cleaned</b> daily.\nQuá khứ đơn: was/were + V3 → The house <b>was built</b> in 1990.\nHiện tại hoàn thành: has/have been + V3\nTương lai: will be + V3\nModal: can/must be + V3\n\n<b>Cách đổi:</b>\nThey <b>built</b> the bridge. → The bridge <b>was built</b> (by them).\n\n⚠️ Nhớ chia <b>be</b> đúng thì, và động từ chính luôn ở dạng <b>V3</b>",
    "qs": [
      {
        "q": "This house ___ in 1975.",
        "o": [
          "built",
          "was built",
          "is built",
          "has built"
        ],
        "a": 1,
        "why": "Mốc quá khứ 1975 → was + V3."
      },
      {
        "q": "English ___ all over the world.",
        "o": [
          "speaks",
          "is speaking",
          "is spoken",
          "spoke"
        ],
        "a": 2,
        "why": "Sự thật hiện tại, bị động → is + spoken (V3 của speak)."
      },
      {
        "q": "The report ___ tomorrow.",
        "o": [
          "will finish",
          "will be finished",
          "is finishing",
          "finished"
        ],
        "a": 1,
        "why": "Bị động tương lai → will be + V3."
      },
      {
        "q": "My car ___ last week.",
        "o": [
          "stole",
          "was stolen",
          "is stolen",
          "has stolen"
        ],
        "a": 1,
        "why": "last week → quá khứ bị động: was + stolen."
      },
      {
        "q": "Đổi sang bị động: \"Someone cleans the office every day.\"",
        "o": [
          "The office cleans every day.",
          "The office is cleaned every day.",
          "The office was cleaned every day.",
          "The office is cleaning every day."
        ],
        "a": 1,
        "why": "Hiện tại đơn bị động → is + V3."
      },
      {
        "q": "These rules ___ be followed.",
        "o": [
          "must",
          "must to",
          "are must",
          "must be"
        ],
        "a": 0,
        "why": "Câu đã có be followed, chỉ cần modal must đứng trước."
      }
    ]
  },
  {
    "id": "prepositions",
    "order": 15,
    "name": "Giới từ IN / ON / AT",
    "l": "<b>THỜI GIAN</b>\n<b>at</b> + giờ, thời điểm: at 7 o'clock, at night, at the weekend\n<b>on</b> + thứ, ngày cụ thể: on Monday, on 5th May, on my birthday\n<b>in</b> + tháng, năm, mùa, buổi: in July, in 2026, in summer, in the morning\n\n<b>NƠI CHỐN</b>\n<b>at</b> + điểm cụ thể: at the bus stop, at home, at work\n<b>on</b> + bề mặt: on the table, on the wall, on the second floor\n<b>in</b> + không gian bao quanh: in the room, in Da Nang, in Vietnam\n\n💡 Mẹo nhớ: in (to nhất) → on (bề mặt) → at (một điểm)\n\n⚠️ Ngoại lệ hay gặp: <b>at</b> night nhưng <b>in</b> the morning/afternoon/evening",
    "qs": [
      {
        "q": "I was born ___ 1998.",
        "o": [
          "at",
          "on",
          "in",
          "to"
        ],
        "a": 2,
        "why": "Năm → in."
      },
      {
        "q": "The meeting is ___ Monday.",
        "o": [
          "at",
          "on",
          "in",
          "to"
        ],
        "a": 1,
        "why": "Thứ trong tuần → on."
      },
      {
        "q": "I usually study ___ night.",
        "o": [
          "at",
          "on",
          "in",
          "by"
        ],
        "a": 0,
        "why": "Ngoại lệ: at night (nhưng in the morning)."
      },
      {
        "q": "She lives ___ Da Nang.",
        "o": [
          "at",
          "on",
          "in",
          "to"
        ],
        "a": 2,
        "why": "Thành phố (không gian bao quanh) → in."
      },
      {
        "q": "Your book is ___ the table.",
        "o": [
          "at",
          "on",
          "in",
          "to"
        ],
        "a": 1,
        "why": "Trên bề mặt → on."
      },
      {
        "q": "I'll see you ___ 8 o'clock.",
        "o": [
          "at",
          "on",
          "in",
          "by"
        ],
        "a": 0,
        "why": "Giờ cụ thể → at."
      },
      {
        "q": "We have a holiday ___ July.",
        "o": [
          "at",
          "on",
          "in",
          "by"
        ],
        "a": 2,
        "why": "Tháng → in."
      }
    ]
  },
  {
    "id": "gerund",
    "order": 16,
    "name": "V-ing hay TO V?",
    "l": "Sau một số động từ bắt buộc dùng V-ing, số khác bắt buộc to V. Phải học thuộc.\n\n<b>+ V-ing:</b> enjoy, finish, avoid, mind, suggest, practise, keep, give up, look forward to, be good at, be interested in\nI enjoy <b>reading</b>. / I gave up <b>smoking</b>.\n\n<b>+ TO V:</b> want, need, decide, hope, plan, promise, agree, learn, would like, try, afford\nI want <b>to go</b>. / She decided <b>to leave</b>.\n\n<b>Sau GIỚI TỪ luôn là V-ing:</b>\nI'm interested <b>in</b> learn<b>ing</b> English.\nThank you <b>for</b> help<b>ing</b> me.\n\n⚠️ Người Việt hay sai chỗ này nhất:\n❌ I look forward to meet you → ✅ ...to <b>meeting</b> you\n(to ở đây là giới từ, không phải to-infinitive)",
    "qs": [
      {
        "q": "I enjoy ___ books.",
        "o": [
          "read",
          "to read",
          "reading",
          "reads"
        ],
        "a": 2,
        "why": "enjoy + V-ing."
      },
      {
        "q": "She decided ___ abroad.",
        "o": [
          "study",
          "to study",
          "studying",
          "studied"
        ],
        "a": 1,
        "why": "decide + to V."
      },
      {
        "q": "I'm interested in ___ about history.",
        "o": [
          "learn",
          "to learn",
          "learning",
          "learns"
        ],
        "a": 2,
        "why": "Sau giới từ in luôn là V-ing."
      },
      {
        "q": "He gave up ___ two years ago.",
        "o": [
          "smoke",
          "to smoke",
          "smoking",
          "smoked"
        ],
        "a": 2,
        "why": "give up + V-ing."
      },
      {
        "q": "I look forward to ___ from you.",
        "o": [
          "hear",
          "to hear",
          "hearing",
          "heard"
        ],
        "a": 2,
        "why": "look forward TO là giới từ → + V-ing."
      },
      {
        "q": "We need ___ this problem quickly.",
        "o": [
          "solve",
          "to solve",
          "solving",
          "solved"
        ],
        "a": 1,
        "why": "need + to V."
      },
      {
        "q": "Chọn câu SAI:",
        "o": [
          "I want to go home.",
          "I avoid eating late.",
          "I hope to see you.",
          "I finished to write it."
        ],
        "a": 3,
        "why": "finish + V-ing → I finished writing it."
      }
    ]
  },
  {
    "id": "questions",
    "order": 17,
    "name": "Cách đặt câu hỏi",
    "l": "<b>Câu hỏi Yes/No</b>\nCó to be → đảo to be lên trước: <b>Are</b> you ready?\nCó modal → đảo modal: <b>Can</b> you swim?\nĐộng từ thường → mượn <b>do/does/did</b>: <b>Do</b> you like it? / <b>Did</b> she go?\n\n<b>Câu hỏi Wh-</b>\nWh- + trợ động từ + S + V\n<b>What</b> do you do? / <b>Where</b> did she go? / <b>Why</b> are you late?\n\n<b>Ngoại lệ quan trọng:</b> khi từ để hỏi CHÍNH LÀ chủ ngữ, không mượn do/does\n<b>Who</b> called you? (không phải: Who did call you?)\n<b>What</b> happened?\n\n⚠️ Sau do/does/did, động từ về <b>nguyên thể</b>\n❌ Where does she lives? → ✅ Where does she <b>live</b>?",
    "qs": [
      {
        "q": "___ she like coffee?",
        "o": [
          "Do",
          "Does",
          "Is",
          "Are"
        ],
        "a": 1,
        "why": "she + động từ thường ở hiện tại đơn → Does."
      },
      {
        "q": "Where ___ you go last night?",
        "o": [
          "do",
          "does",
          "did",
          "are"
        ],
        "a": 2,
        "why": "last night → quá khứ → did."
      },
      {
        "q": "Chọn câu ĐÚNG:",
        "o": [
          "Where does she lives?",
          "Where does she live?",
          "Where she lives?",
          "Where do she live?"
        ],
        "a": 1,
        "why": "Sau does, động từ về nguyên thể: live."
      },
      {
        "q": "___ told you that?",
        "o": [
          "Who",
          "Who did",
          "Whom did",
          "Who does"
        ],
        "a": 0,
        "why": "Who chính là chủ ngữ → không mượn trợ động từ."
      },
      {
        "q": "___ you a student?",
        "o": [
          "Do",
          "Does",
          "Are",
          "Did"
        ],
        "a": 2,
        "why": "Có to be → đảo are lên trước, không dùng do."
      },
      {
        "q": "What time ___ the film start?",
        "o": [
          "do",
          "does",
          "is",
          "are"
        ],
        "a": 1,
        "why": "the film số ít + động từ thường → does."
      }
    ]
  },
  {
    "id": "adverb_freq",
    "order": 18,
    "name": "Trạng từ tần suất & vị trí trong câu",
    "l": "<b>Thang tần suất</b>\nalways (100%) → usually → often → sometimes → rarely/seldom → never (0%)\n\n<b>Quy tắc vị trí — nhớ 2 điều:</b>\n① <b>TRƯỚC</b> động từ thường\nI <b>always</b> get up at 6.\n② <b>SAU</b> động từ to be\nShe <b>is always</b> late.\n③ Giữa trợ động từ và động từ chính\nI have <b>never</b> been there.\n\n<b>Trật tự trạng ngữ cuối câu:</b> cách thức → nơi chốn → thời gian\nShe sang <b>beautifully</b> <b>at the party</b> <b>last night</b>.\n\n⚠️ <b>Lỗi kinh điển của người Việt:</b> đặt very/always sai chỗ\n❌ I very like it → ✅ I like it <b>very much</b>\n❌ I go always → ✅ I <b>always</b> go",
    "qs": [
      {
        "q": "She ___ late for class.",
        "o": [
          "always is",
          "is always",
          "always",
          "is being always"
        ],
        "a": 1,
        "why": "Trạng từ tần suất đứng SAU động từ to be."
      },
      {
        "q": "I ___ eat breakfast.",
        "o": [
          "never",
          "am never",
          "never am",
          "eat never"
        ],
        "a": 0,
        "why": "Đứng TRƯỚC động từ thường: I never eat."
      },
      {
        "q": "Chọn câu ĐÚNG:",
        "o": [
          "I very like this song.",
          "I like very this song.",
          "I like this song very much.",
          "I am very like this song."
        ],
        "a": 2,
        "why": "very không đứng trước động từ thường; dùng very much ở cuối."
      },
      {
        "q": "He has ___ been to Japan.",
        "o": [
          "never",
          "never has",
          "been never",
          "has never"
        ],
        "a": 0,
        "why": "Đứng giữa trợ động từ has và động từ chính been."
      },
      {
        "q": "They ___ go to the cinema on Fridays.",
        "o": [
          "are usually",
          "usually",
          "usually are",
          "go usually"
        ],
        "a": 1,
        "why": "go là động từ thường → usually đứng trước."
      },
      {
        "q": "Chọn câu ĐÚNG:",
        "o": [
          "I go to work always by bus.",
          "I always go to work by bus.",
          "I go always to work by bus.",
          "Always I go to work by bus."
        ],
        "a": 1,
        "why": "always đứng ngay trước động từ thường go."
      }
    ]
  }
];

// Gộp kho câu hỏi bổ sung vào từng chủ đề (không thay thế câu cũ).
for (const t of GRAMMAR_TOPICS) {
  const extra = GRAMMAR_EXTRA_QUESTIONS[t.id];
  if (extra) t.qs = [...t.qs, ...extra];
}


/** Nút trên bản đồ: g-1 .. g-18 theo đúng thứ tự học. */
export const GRAMMAR_NODE_ID: Record<string, string> = Object.fromEntries(
  GRAMMAR_TOPICS.map((t) => [t.id, `g-${t.order}`]),
);

export const GRAMMAR_TOPIC_BY_NODE: Record<string, GrammarTopic> = Object.fromEntries(
  GRAMMAR_TOPICS.map((t) => [`g-${t.order}`, t]),
);

export const GRAMMAR_LESSONS: QuizLesson[] = GRAMMAR_TOPICS.map((t) => ({
  kind: "quiz",
  nodeId: `g-${t.order}`,
  threshold: 0.8,
  theory: [],
  richTheory: t.l,
  questions: t.qs.map((q, i) => ({
    id: `${t.id}-q${i + 1}`,
    prompt: q.q,
    options: q.o,
    answer: q.a,
    explain: q.why,
  })),
}));
