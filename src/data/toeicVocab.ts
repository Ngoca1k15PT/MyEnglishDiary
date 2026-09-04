import type { FlashCard } from "./lesson-types";

/**
 * 180 từ vựng công sở cho TOEIC — độc lập với 3 tầng IELTS.
 * Định dạng: word|ipa|pos|meaning|example|topic
 */
export type ToeicVocabWord = {
  id: string;
  word: string;
  ipa: string;
  pos: string;
  meaning: string;
  example: string;
  topic: string;
};

const RAW = `
schedule|/ˈʃedjuːl/|n/v|lịch trình; lên lịch|The meeting is scheduled for Monday.|Office
appointment|/əˈpɔɪntmənt/|n|cuộc hẹn|I have an appointment at 3 p.m.|Office
agenda|/əˈdʒendə/|n|chương trình nghị sự|Please review the agenda before the meeting.|Office
memo|/ˈmeməʊ/|n|bản ghi nhớ nội bộ|The manager sent a memo to all staff.|Office
deadline|/ˈdedlaɪn/|n|hạn chót|We must meet the deadline.|Office
supplies|/səˈplaɪz/|n|vật tư, đồ dùng|Office supplies are stored in the cabinet.|Office
equipment|/ɪˈkwɪpmənt/|n|thiết bị|All equipment must be inspected annually.|Office
facility|/fəˈsɪləti/|n|cơ sở, tiện ích|The new facility opens next month.|Office
premises|/ˈpremɪsɪz/|n|khu nhà, mặt bằng|Smoking is not allowed on the premises.|Office
maintenance|/ˈmeɪntənəns/|n|bảo trì|Routine maintenance is scheduled for Friday.|Office
renovation|/ˌrenəˈveɪʃn/|n|việc cải tạo|The lobby is closed for renovation.|Office
temporarily|/ˈtemprərəli/|adv|tạm thời|The lift is temporarily out of service.|Office
in advance|/ɪn ədˈvɑːns/|phr|trước, sớm|Please book in advance.|Office
on behalf of|/ɒn bɪˈhɑːf əv/|phr|thay mặt cho|I am writing on behalf of my manager.|Office
be responsible for|/rɪˈspɒnsəbl/|phr|phụ trách|She is responsible for payroll.|Office
attend|/əˈtend/|v|tham dự|All managers must attend the meeting.|Meeting
postpone|/pəˈspəʊn/|v|hoãn lại|The meeting was postponed until Thursday.|Meeting
reschedule|/ˌriːˈʃedjuːl/|v|đổi lịch|Can we reschedule for next week?|Meeting
conference|/ˈkɒnfərəns/|n|hội nghị|The annual conference is in Da Nang.|Meeting
attendee|/əˌtenˈdiː/|n|người tham dự|Attendees should register at the desk.|Meeting
minutes|/ˈmɪnɪts/|n|biên bản họp|Please take the minutes.|Meeting
handout|/ˈhændaʊt/|n|tài liệu phát tay|Copies of the handout are on the table.|Meeting
presentation|/ˌprezenˈteɪʃn/|n|bài thuyết trình|Her presentation lasted 20 minutes.|Meeting
briefly|/ˈbriːfli/|adv|một cách ngắn gọn|He briefly explained the changes.|Meeting
adjourn|/əˈdʒɜːn/|v|tạm nghỉ, kết thúc phiên họp|The meeting was adjourned at noon.|Meeting
attach|/əˈtætʃ/|v|đính kèm|Please find the report attached.|Email
enclose|/ɪnˈkləʊz/|v|gửi kèm (thư giấy)|I have enclosed a copy of the invoice.|Email
forward|/ˈfɔːwəd/|v|chuyển tiếp|Could you forward this to the team?|Email
notify|/ˈnəʊtɪfaɪ/|v|thông báo|We will notify you of any changes.|Email
inquiry|/ɪnˈkwaɪəri/|n|thư hỏi, yêu cầu thông tin|Thank you for your inquiry.|Email
confirm|/kənˈfɜːm/|v|xác nhận|Please confirm your attendance.|Email
regarding|/rɪˈɡɑːdɪŋ/|prep|về việc|I am writing regarding your order.|Email
sincerely|/sɪnˈsɪəli/|adv|trân trọng (kết thư)|Sincerely, Nguyen Van A|Email
promptly|/ˈprɒmptli/|adv|nhanh chóng, đúng giờ|Please respond promptly.|Email
at your earliest convenience|/ˈkɒnviːniəns/|phr|sớm nhất có thể|Please reply at your earliest convenience.|Email
applicant|/ˈæplɪkənt/|n|ứng viên|Applicants must submit a resume.|HR
resume|/ˈrezjuːmeɪ/|n|sơ yếu lý lịch|Send your resume by Friday.|HR
qualification|/ˌkwɒlɪfɪˈkeɪʃn/|n|bằng cấp, trình độ|He has the right qualifications.|HR
candidate|/ˈkændɪdət/|n|ứng cử viên|We interviewed five candidates.|HR
recruit|/rɪˈkruːt/|v|tuyển dụng|The firm is recruiting engineers.|HR
hire|/ˈhaɪə(r)/|v|thuê, tuyển|We hired three new staff.|HR
promote|/prəˈməʊt/|v|thăng chức|She was promoted to manager.|HR
supervisor|/ˈsuːpəvaɪzə(r)/|n|người giám sát|Report to your supervisor.|HR
personnel|/ˌpɜːsəˈnel/|n|nhân sự|Contact the personnel department.|HR
benefits|/ˈbenɪfɪts/|n|phúc lợi|The package includes health benefits.|HR
salary increase|/ˈsæləri/|phr|tăng lương|Employees received a salary increase.|HR
overtime|/ˈəʊvətaɪm/|n|làm thêm giờ|Overtime is paid at a higher rate.|HR
leave of absence|/liːv əv ˈæbsəns/|phr|nghỉ phép dài|He took a leave of absence.|HR
retirement|/rɪˈtaɪəmənt/|n|sự nghỉ hưu|She is approaching retirement.|HR
performance review|/pəˈfɔːməns/|phr|đánh giá hiệu suất|Annual performance reviews start in June.|HR
training session|/ˈtreɪnɪŋ/|phr|buổi tập huấn|Attend the training session on Monday.|HR
orientation|/ˌɔːriənˈteɪʃn/|n|buổi định hướng nhân viên mới|New hires attend orientation.|HR
invoice|/ˈɪnvɔɪs/|n|hoá đơn|The invoice is due in 30 days.|Finance
receipt|/rɪˈsiːt/|n|biên lai|Keep your receipt for the refund.|Finance
expense|/ɪkˈspens/|n|chi phí|Submit your expense report monthly.|Finance
budget|/ˈbʌdʒɪt/|n|ngân sách|The project is over budget.|Finance
revenue|/ˈrevənjuː/|n|doanh thu|Revenue rose by 12% last quarter.|Finance
profit|/ˈprɒfɪt/|n|lợi nhuận|The company reported record profits.|Finance
refund|/ˈriːfʌnd/|n/v|hoàn tiền|We offer a full refund within 14 days.|Finance
reimburse|/ˌriːɪmˈbɜːs/|v|hoàn trả chi phí|The company will reimburse travel costs.|Finance
transaction|/trænˈzækʃn/|n|giao dịch|All transactions are recorded.|Finance
quarterly|/ˈkwɔːtəli/|adj/adv|hằng quý|We publish quarterly reports.|Finance
fiscal year|/ˈfɪskl jɪə/|phr|năm tài chính|The fiscal year ends in March.|Finance
estimate|/ˈestɪmət/|n|bản ước tính giá|We sent the client an estimate.|Finance
deposit|/dɪˈpɒzɪt/|n|tiền đặt cọc|A deposit is required to book.|Finance
outstanding balance|/aʊtˈstændɪŋ/|phr|số dư còn nợ|Please settle the outstanding balance.|Finance
promotion|/prəˈməʊʃn/|n|chương trình khuyến mãi|The promotion ends on Sunday.|Marketing
discount|/ˈdɪskaʊnt/|n|giảm giá|Members receive a 10% discount.|Marketing
merchandise|/ˈmɜːtʃəndaɪs/|n|hàng hoá|New merchandise arrives weekly.|Marketing
retail|/ˈriːteɪl/|n|bán lẻ|The retail price is 500,000 dong.|Marketing
wholesale|/ˈhəʊlseɪl/|n|bán buôn|We buy at wholesale prices.|Marketing
launch|/lɔːntʃ/|v/n|ra mắt|The company will launch the product in May.|Marketing
campaign|/kæmˈpeɪn/|n|chiến dịch|The ad campaign was successful.|Marketing
brochure|/ˈbrəʊʃə(r)/|n|tờ rơi giới thiệu|Take a brochure from the desk.|Marketing
subscription|/səbˈskrɪpʃn/|n|thuê bao, đăng ký dài hạn|Your subscription expires in June.|Marketing
complimentary|/ˌkɒmplɪˈmentri/|adj|miễn phí (tặng kèm)|Guests receive a complimentary breakfast.|Marketing
expire|/ɪkˈspaɪə(r)/|v|hết hạn|The coupon expires next week.|Marketing
warranty|/ˈwɒrənti/|n|bảo hành|The device has a two-year warranty.|Marketing
contract|/ˈkɒntrækt/|n|hợp đồng|Both parties signed the contract.|Legal
agreement|/əˈɡriːmənt/|n|thoả thuận|We reached an agreement.|Legal
terms and conditions|/tɜːmz/|phr|điều khoản|Read the terms and conditions carefully.|Legal
clause|/klɔːz/|n|điều khoản (trong hợp đồng)|Clause 5 covers late delivery.|Legal
negotiate|/nɪˈɡəʊʃieɪt/|v|đàm phán|We negotiated a better price.|Legal
comply with|/kəmˈplaɪ/|phr v|tuân thủ|All staff must comply with the policy.|Legal
regulation|/ˌreɡjuˈleɪʃn/|n|quy định|New safety regulations take effect in July.|Legal
liability|/ˌlaɪəˈbɪləti/|n|trách nhiệm pháp lý|The clause limits our liability.|Legal
authorize|/ˈɔːθəraɪz/|v|cho phép chính thức|Only managers can authorize payments.|Legal
prohibit|/prəˈhɪbɪt/|v|cấm|Photography is prohibited in this area.|Legal
mandatory|/ˈmændətəri/|adj|bắt buộc|Attendance is mandatory.|Legal
be subject to|/ˈsʌbdʒɪkt/|phr|phải chịu, tuỳ thuộc vào|Prices are subject to change.|Legal
shipment|/ˈʃɪpmənt/|n|lô hàng|The shipment arrives on Tuesday.|Logistics
delivery|/dɪˈlɪvəri/|n|việc giao hàng|Delivery takes three business days.|Logistics
warehouse|/ˈweəhaʊs/|n|nhà kho|Goods are stored in the warehouse.|Logistics
inventory|/ˈɪnvəntri/|n|hàng tồn kho|We take inventory every month.|Logistics
in stock|/ɪn stɒk/|phr|còn hàng|That model is currently in stock.|Logistics
out of stock|/aʊt əv stɒk/|phr|hết hàng|The item is out of stock.|Logistics
supplier|/səˈplaɪə(r)/|n|nhà cung cấp|We changed suppliers last year.|Logistics
freight|/freɪt/|n|hàng hoá vận chuyển|Freight charges are extra.|Logistics
delay|/dɪˈleɪ/|n/v|sự chậm trễ|The delay was caused by weather.|Logistics
courier|/ˈkʊriə(r)/|n|dịch vụ chuyển phát|Send it by courier.|Logistics
purchase order|/ˈpɜːtʃəs/|phr|đơn đặt hàng|Attach the purchase order number.|Logistics
defective|/dɪˈfektɪv/|adj|bị lỗi|Return any defective items.|Logistics
customer service|/ˈkʌstəmə/|phr|dịch vụ khách hàng|Call customer service for help.|Service
complaint|/kəmˈpleɪnt/|n|khiếu nại|We received a complaint about the delay.|Service
satisfaction|/ˌsætɪsˈfækʃn/|n|sự hài lòng|Customer satisfaction is our priority.|Service
feedback|/ˈfiːdbæk/|n|phản hồi|Your feedback helps us improve.|Service
apologize|/əˈpɒlədʒaɪz/|v|xin lỗi|We apologize for the inconvenience.|Service
inconvenience|/ˌɪnkənˈviːniəns/|n|sự bất tiện|We regret any inconvenience caused.|Service
replacement|/rɪˈpleɪsmənt/|n|hàng thay thế|We will send a replacement free of charge.|Service
assistance|/əˈsɪstəns/|n|sự trợ giúp|Thank you for your assistance.|Service
representative|/ˌreprɪˈzentətɪv/|n|nhân viên đại diện|A representative will contact you.|Service
itinerary|/aɪˈtɪnərəri/|n|lịch trình chuyến đi|Your itinerary is attached.|Travel
reservation|/ˌrezəˈveɪʃn/|n|việc đặt chỗ|I made a reservation for two.|Travel
accommodation|/əˌkɒməˈdeɪʃn/|n|chỗ ở|Accommodation is provided.|Travel
boarding pass|/ˈbɔːdɪŋ/|phr|thẻ lên máy bay|Show your boarding pass at the gate.|Travel
departure|/dɪˈpɑːtʃə(r)/|n|khởi hành|The departure time has changed.|Travel
baggage claim|/ˈbæɡɪdʒ/|phr|khu nhận hành lý|Meet me at baggage claim.|Travel
check-in|/ˈtʃek ɪn/|n|làm thủ tục|Check-in opens two hours before.|Travel
business trip|/ˈbɪznəs trɪp/|phr|chuyến công tác|He is on a business trip.|Travel
shuttle|/ˈʃʌtl/|n|xe đưa đón|A free shuttle runs to the airport.|Travel
approximately|/əˈprɒksɪmətli/|adv|khoảng chừng|Approximately 200 people attended.|Part5
currently|/ˈkʌrəntli/|adv|hiện tại|The office is currently closed.|Part5
previously|/ˈpriːviəsli/|adv|trước đây|He previously worked in sales.|Part5
recently|/ˈriːsntli/|adv|gần đây|We recently upgraded the system.|Part5
immediately|/ɪˈmiːdiətli/|adv|ngay lập tức|Please respond immediately.|Part5
significantly|/sɪɡˈnɪfɪkəntli/|adv|đáng kể|Sales grew significantly.|Part5
efficiently|/ɪˈfɪʃntli/|adv|một cách hiệu quả|The team works efficiently.|Part5
accordingly|/əˈkɔːdɪŋli/|adv|theo đó|Plans were changed accordingly.|Part5
whereas|/weərˈæz/|conj|trong khi (đối lập)|Sales rose, whereas costs fell.|Part5
therefore|/ˈðeəfɔː(r)/|adv|do đó|Therefore, we revised the budget.|Part5
nevertheless|/ˌnevəðəˈles/|adv|tuy nhiên|Nevertheless, the plan went ahead.|Part5
in order to|/ɪn ˈɔːdə tuː/|phr|để mà|We hired staff in order to meet demand.|Part5
due to|/djuː tuː/|prep|do bởi|The delay was due to bad weather.|Part5
despite|/dɪˈspaɪt/|prep|mặc dù (+ danh từ)|Despite the rain, the event went on.|Part5
although|/ɔːlˈðəʊ/|conj|mặc dù (+ mệnh đề)|Although it rained, we continued.|Part5
prior to|/ˈpraɪə tuː/|prep|trước khi|Prior to joining, she taught English.|Part5
upon|/əˈpɒn/|prep|ngay khi|Upon arrival, please sign in.|Part5
within|/wɪˈðɪn/|prep|trong vòng|Reply within five business days.|Part5
throughout|/θruːˈaʊt/|prep|suốt|Offices are located throughout the country.|Part5
alternatively|/ɔːlˈtɜːnətɪvli/|adv|hoặc là|Alternatively, you can email us.|Part5
`;

function slug(word: string) {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parse(raw: string): ToeicVocabWord[] {
  const seen = new Set<string>();
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [word = "", ipa = "", pos = "", meaning = "", example = "", topic = ""] =
        line.split("|");
      let id = `tv-${slug(word)}`;
      let n = 2;
      while (seen.has(id)) id = `tv-${slug(word)}-${n++}`;
      seen.add(id);
      return { id, word, ipa, pos, meaning, example, topic };
    });
}

export const TOEIC_VOCAB_WORDS: ToeicVocabWord[] = parse(RAW);

export function toCard(w: ToeicVocabWord): FlashCard {
  return {
    id: w.id,
    front: w.word,
    back: w.meaning,
    speak: w.word,
    ipa: w.ipa,
    pos: w.pos,
    meaning: w.meaning,
    example: w.example,
    topic: w.topic,
  };
}

export const TOEIC_VOCAB_CARDS: FlashCard[] = TOEIC_VOCAB_WORDS.map(toCard);
