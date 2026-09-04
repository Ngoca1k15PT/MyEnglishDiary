import type { DeckLesson, FlashCard } from "./lesson-types";
import type { VocabWord } from "./vocabulary";

/**
 * Từ vựng theo chủ đề Speaking — viết riêng cho app.
 *
 * Ba tầng trong `vocabulary.ts` xếp theo tần suất và thiên về từ học thuật dùng
 * cho Writing. Phần này lấp chỗ còn thiếu: cụm từ người ta THỰC SỰ nói khi trả
 * lời Part 1/2/3, gom theo đúng những chủ đề hay ra đề.
 *
 * Ưu tiên cụm (collocation) và cách diễn đạt tự nhiên thay vì từ đơn — giám khảo
 * chấm Lexical Resource nhìn vào chỗ đó, và đó cũng là thứ khó tra từ điển nhất.
 *
 * Định dạng mỗi dòng: word|ipa|pos|meaning|example|topic
 */

const SPEAKING_TOPICS = `
a place of my own|/ə pleɪs əv maɪ əʊn/|phr|chỗ ở riêng|I'm saving up for a place of my own.|Nhà ở
move out|/muːv aʊt/|phr v|dọn ra ở riêng|I moved out when I started university.|Nhà ở
spacious|/ˈspeɪʃəs/|adj|rộng rãi|The living room is surprisingly spacious.|Nhà ở
cramped|/kræmpt/|adj|chật chội|My old flat was really cramped.|Nhà ở
cosy|/ˈkəʊzi/|adj|ấm cúng|It's small but very cosy.|Nhà ở
within walking distance|/wɪˈðɪn ˈwɔːkɪŋ ˈdɪstəns/|phr|đi bộ là tới|The market is within walking distance.|Nhà ở
do up|/duː ʌp/|phr v|sửa sang lại|We did up the kitchen last year.|Nhà ở
neighbourhood|/ˈneɪbəhʊd/|n|khu dân cư|It's a quiet neighbourhood.|Nhà ở
rent|/rent/|n/v|tiền thuê; thuê|The rent is quite reasonable.|Nhà ở
settle in|/ˈsetl ɪn/|phr v|ổn định chỗ mới|It took me a month to settle in.|Nhà ở

be into|/bi ˈɪntuː/|phr|mê, thích|I'm really into photography.|Sở thích
take up|/teɪk ʌp/|phr v|bắt đầu chơi/học|I took up yoga last spring.|Sở thích
unwind|/ˌʌnˈwaɪnd/|v|thư giãn, xả hơi|I read to unwind after work.|Sở thích
in my spare time|/ɪn maɪ speə taɪm/|phr|lúc rảnh|In my spare time I cook.|Sở thích
get hooked on|/ɡet hʊkt ɒn/|phr|nghiện, mê tít|I got hooked on chess.|Sở thích
pick up|/pɪk ʌp/|phr v|học lỏm được|I picked up guitar from YouTube.|Sở thích
kill time|/kɪl taɪm/|phr|giết thời gian|I scroll my phone to kill time.|Sở thích
rewarding|/rɪˈwɔːdɪŋ/|adj|đáng công, cho lại nhiều|Gardening is really rewarding.|Sở thích
on and off|/ɒn ənd ɒf/|phr|lúc có lúc không|I've played badminton on and off.|Sở thích
a change of pace|/ə tʃeɪndʒ əv peɪs/|phr|đổi không khí|Hiking is a nice change of pace.|Sở thích

keep up with|/kiːp ʌp wɪð/|phr v|theo dõi, cập nhật|I keep up with the news online.|Tin tức
headline|/ˈhedlaɪn/|n|tiêu đề tin|I only read the headlines.|Tin tức
breaking news|/ˈbreɪkɪŋ njuːz/|n|tin nóng|It was breaking news that morning.|Tin tức
biased|/ˈbaɪəst/|adj|thiên vị, một chiều|Some coverage is clearly biased.|Tin tức
reliable source|/rɪˈlaɪəbl sɔːs/|phr|nguồn đáng tin|I stick to reliable sources.|Tin tức
misleading|/ˌmɪsˈliːdɪŋ/|adj|gây hiểu sai|The title was misleading.|Tin tức
go viral|/ɡəʊ ˈvaɪrəl/|phr|lan truyền chóng mặt|The clip went viral overnight.|Tin tức
current affairs|/ˈkʌrənt əˈfeəz/|n|thời sự|I follow current affairs loosely.|Tin tức
coverage|/ˈkʌvərɪdʒ/|n|việc đưa tin|The coverage was quite thorough.|Tin tức
scroll through|/skrəʊl θruː/|phr v|lướt xem|I scroll through the news at breakfast.|Tin tức

get together|/ɡet təˈɡeðə(r)/|phr v|tụ họp|The whole family gets together at Tet.|Lễ Tết
reunion|/riːˈjuːniən/|n|cuộc đoàn tụ|Tet is really a family reunion.|Lễ Tết
lunar calendar|/ˈluːnə ˈkælɪndə(r)/|phr|âm lịch|It follows the lunar calendar.|Lễ Tết
hand out|/hænd aʊt/|phr v|phát, trao|Adults hand out lucky money.|Lễ Tết
tradition|/trəˈdɪʃn/|n|truyền thống|It's a tradition we still keep.|Lễ Tết
decorate|/ˈdekəreɪt/|v|trang trí|We decorate the house with peach blossom.|Lễ Tết
festive|/ˈfestɪv/|adj|có không khí lễ hội|The streets feel really festive.|Lễ Tết
look forward to|/lʊk ˈfɔːwəd tuː/|phr v|háo hức chờ|I look forward to it all year.|Lễ Tết
pass down|/pɑːs daʊn/|phr v|truyền lại|These customs are passed down.|Lễ Tết
homesick|/ˈhəʊmsɪk/|adj|nhớ nhà|I get homesick around Tet.|Lễ Tết

nine-to-five|/naɪn tə faɪv/|adj|giờ hành chính|I work a normal nine-to-five.|Công việc
work-life balance|/wɜːk laɪf ˈbæləns/|n|cân bằng công việc-cuộc sống|Work-life balance matters to me.|Công việc
demanding|/dɪˈmɑːndɪŋ/|adj|đòi hỏi cao, vất vả|It's a demanding role.|Công việc
deadline|/ˈdedlaɪn/|n|hạn chót|We're under a tight deadline.|Công việc
get promoted|/ɡet prəˈməʊtɪd/|phr|được thăng chức|She got promoted last month.|Công việc
colleague|/ˈkɒliːɡ/|n|đồng nghiệp|My colleagues are easy to work with.|Công việc
work from home|/wɜːk frəm həʊm/|phr|làm việc tại nhà|I work from home twice a week.|Công việc
burn out|/bɜːn aʊt/|phr v|kiệt sức|A lot of people burn out young.|Công việc
career path|/kəˈrɪə pɑːθ/|n|con đường sự nghiệp|I'm still figuring out my career path.|Công việc
hands-on|/hændz ɒn/|adj|thực hành trực tiếp|I prefer hands-on work.|Công việc

cram|/kræm/|v|học nhồi|I used to cram the night before.|Học hành
get the hang of|/ɡet ðə hæŋ əv/|phr|quen tay, nắm được|It took a week to get the hang of it.|Học hành
fall behind|/fɔːl bɪˈhaɪnd/|phr v|tụt lại phía sau|I fell behind in maths.|Học hành
catch up on|/kætʃ ʌp ɒn/|phr v|học bù, theo kịp|I need to catch up on reading.|Học hành
motivated|/ˈməʊtɪveɪtɪd/|adj|có động lực|I stay motivated with small goals.|Học hành
struggle with|/ˈstrʌɡl wɪð/|phr v|vật lộn với|I struggle with pronunciation.|Học hành
pay attention|/peɪ əˈtenʃn/|phr|tập trung chú ý|I pay more attention now.|Học hành
by heart|/baɪ hɑːt/|phr|thuộc lòng|I learned the formulas by heart.|Học hành
a steep learning curve|/ə stiːp ˈlɜːnɪŋ kɜːv/|phr|khó vào lúc đầu|It was a steep learning curve.|Học hành
stick with it|/stɪk wɪð ɪt/|phr|kiên trì|You improve if you stick with it.|Học hành

home-cooked|/həʊm kʊkt/|adj|nấu ở nhà|I prefer home-cooked meals.|Ăn uống
eat out|/iːt aʊt/|phr v|ăn ngoài|We eat out at weekends.|Ăn uống
street food|/striːt fuːd/|n|đồ ăn đường phố|The street food here is amazing.|Ăn uống
fussy eater|/ˈfʌsi ˈiːtə(r)/|n|người kén ăn|I'm not a fussy eater.|Ăn uống
mouth-watering|/ˈmaʊθ wɔːtərɪŋ/|adj|ngon nhìn là thèm|It smelled mouth-watering.|Ăn uống
have a sweet tooth|/hæv ə swiːt tuːθ/|phr|hảo ngọt|I've got a real sweet tooth.|Ăn uống
balanced diet|/ˈbælənst ˈdaɪət/|n|chế độ ăn cân bằng|I try to keep a balanced diet.|Ăn uống
cut down on|/kʌt daʊn ɒn/|phr v|giảm bớt|I'm cutting down on sugar.|Ăn uống
filling|/ˈfɪlɪŋ/|adj|no lâu, chắc bụng|Pho is cheap and filling.|Ăn uống
grab a bite|/ɡræb ə baɪt/|phr|ăn tạm cái gì|Let's grab a bite after class.|Ăn uống

get away|/ɡet əˈweɪ/|phr v|đi đâu đó nghỉ|I need to get away for a weekend.|Du lịch
off the beaten track|/ɒf ðə ˈbiːtn træk/|phr|ít người biết tới|We stayed off the beaten track.|Du lịch
breathtaking|/ˈbreθteɪkɪŋ/|adj|đẹp ngộp thở|The view was breathtaking.|Du lịch
tourist trap|/ˈtʊərɪst træp/|n|chỗ chặt chém du khách|That street is a tourist trap.|Du lịch
sightseeing|/ˈsaɪtsiːɪŋ/|n|việc đi tham quan|We spent the day sightseeing.|Du lịch
book in advance|/bʊk ɪn ədˈvɑːns/|phr|đặt trước|I always book in advance.|Du lịch
on a budget|/ɒn ə ˈbʌdʒɪt/|phr|với ngân sách hẹp|We travelled on a budget.|Du lịch
jet lag|/dʒet læɡ/|n|lệch múi giờ|The jet lag hit me hard.|Du lịch
scenery|/ˈsiːnəri/|n|phong cảnh|The scenery along the coast is stunning.|Du lịch
make the most of|/meɪk ðə məʊst əv/|phr|tận dụng tối đa|We made the most of two days.|Du lịch

keep in touch|/kiːp ɪn tʌtʃ/|phr|giữ liên lạc|We keep in touch on Zalo.|Công nghệ
addicted to|/əˈdɪktɪd tuː/|adj|nghiện|I'm a bit addicted to my phone.|Công nghệ
user-friendly|/ˈjuːzə ˈfrendli/|adj|dễ dùng|The app is very user-friendly.|Công nghệ
back up|/bæk ʌp/|phr v|sao lưu|I back up my photos monthly.|Công nghệ
screen time|/skriːn taɪm/|n|thời gian nhìn màn hình|I'm trying to cut my screen time.|Công nghệ
log on|/lɒɡ ɒn/|phr v|đăng nhập|I log on first thing at work.|Công nghệ
out of date|/aʊt əv deɪt/|phr|lỗi thời|My laptop is out of date.|Công nghệ
handy|/ˈhændi/|adj|tiện, hữu dụng|Maps apps are really handy.|Công nghệ
crash|/kræʃ/|v|treo, sập (máy)|The app keeps crashing.|Công nghệ
cut down on|/kʌt daʊn ɒn/|phr v|giảm bớt|I'm cutting down on social media.|Công nghệ

work out|/wɜːk aʊt/|phr v|tập thể dục|I work out three times a week.|Sức khoẻ
stay in shape|/steɪ ɪn ʃeɪp/|phr|giữ dáng, giữ sức|Cycling helps me stay in shape.|Sức khoẻ
come down with|/kʌm daʊn wɪð/|phr v|nhiễm bệnh nhẹ|I came down with a cold.|Sức khoẻ
get enough sleep|/ɡet ɪˈnʌf sliːp/|phr|ngủ đủ giấc|I rarely get enough sleep.|Sức khoẻ
stressed out|/strest aʊt/|adj|căng thẳng quá mức|I get stressed out before exams.|Sức khoẻ
sedentary|/ˈsedntri/|adj|ít vận động|Office work is very sedentary.|Sức khoẻ
in moderation|/ɪn ˌmɒdəˈreɪʃn/|phr|ở mức vừa phải|Coffee is fine in moderation.|Sức khoẻ
recover|/rɪˈkʌvə(r)/|v|hồi phục|It took a week to recover.|Sức khoẻ
peace of mind|/piːs əv maɪnd/|phr|sự an tâm|Exercise gives me peace of mind.|Sức khoẻ
put on weight|/pʊt ɒn weɪt/|phr|lên cân|I put on weight during Tet.|Sức khoẻ

get on well with|/ɡet ɒn wel wɪð/|phr v|hợp, thân với|I get on well with my sister.|Gia đình & bạn bè
close-knit|/kləʊs nɪt/|adj|gắn bó khăng khít|We're a close-knit family.|Gia đình & bạn bè
take after|/teɪk ˈɑːftə(r)/|phr v|giống (người thân)|I take after my father.|Gia đình & bạn bè
supportive|/səˈpɔːtɪv/|adj|luôn ủng hộ|My parents are very supportive.|Gia đình & bạn bè
fall out with|/fɔːl aʊt wɪð/|phr v|giận nhau|We fell out over something silly.|Gia đình & bạn bè
have a lot in common|/hæv ə lɒt ɪn ˈkɒmən/|phr|có nhiều điểm chung|We have a lot in common.|Gia đình & bạn bè
grow apart|/ɡrəʊ əˈpɑːt/|phr v|xa dần nhau|We grew apart after school.|Gia đình & bạn bè
reliable|/rɪˈlaɪəbl/|adj|đáng tin cậy|He's the most reliable friend I have.|Gia đình & bạn bè
catch up|/kætʃ ʌp/|phr v|gặp hàn huyên|We catch up every few months.|Gia đình & bạn bè
look up to|/lʊk ʌp tuː/|phr v|ngưỡng mộ|I look up to my grandmother.|Gia đình & bạn bè

keep fit|/kiːp fɪt/|phr|giữ thể lực|I play football to keep fit.|Thể thao
take part in|/teɪk pɑːt ɪn/|phr v|tham gia|I took part in a fun run.|Thể thao
team spirit|/tiːm ˈspɪrɪt/|n|tinh thần đồng đội|Team spirit is what I enjoy.|Thể thao
competitive|/kəmˈpetətɪv/|adj|thích ganh đua|I'm quite competitive.|Thể thao
warm up|/wɔːm ʌp/|phr v|khởi động|Always warm up first.|Thể thao
get injured|/ɡet ˈɪndʒəd/|phr|bị chấn thương|I got injured last season.|Thể thao
spectator|/spekˈteɪtə(r)/|n|khán giả|I'm more of a spectator now.|Thể thao
give it a go|/ɡɪv ɪt ə ɡəʊ/|phr|thử xem sao|I'd give badminton a go.|Thể thao
stamina|/ˈstæmɪnə/|n|sức bền|Running built up my stamina.|Thể thao
support a team|/səˈpɔːt ə tiːm/|phr|cổ vũ một đội|I've supported the same team for years.|Thể thao

on a tight budget|/ɒn ə taɪt ˈbʌdʒɪt/|phr|eo hẹp tiền|I'm on a tight budget this month.|Mua sắm & tiền
a bargain|/ə ˈbɑːɡɪn/|n|món hời|That jacket was a real bargain.|Mua sắm & tiền
save up for|/seɪv ʌp fɔː(r)/|phr v|để dành mua|I'm saving up for a laptop.|Mua sắm & tiền
splash out on|/splæʃ aʊt ɒn/|phr v|mạnh tay chi|I splashed out on a good camera.|Mua sắm & tiền
value for money|/ˈvæljuː fə ˈmʌni/|phr|đáng đồng tiền|It's great value for money.|Mua sắm & tiền
window shopping|/ˈwɪndəʊ ˈʃɒpɪŋ/|n|đi ngắm không mua|I just do window shopping.|Mua sắm & tiền
afford|/əˈfɔːd/|v|đủ tiền mua|I can't afford it right now.|Mua sắm & tiền
impulse buy|/ˈɪmpʌls baɪ/|n|mua bốc đồng|It was an impulse buy.|Mua sắm & tiền
overpriced|/ˌəʊvəˈpraɪst/|adj|đắt quá đáng|The coffee there is overpriced.|Mua sắm & tiền
cut back on|/kʌt bæk ɒn/|phr v|cắt giảm chi|I'm cutting back on eating out.|Mua sắm & tiền

green space|/ɡriːn speɪs/|n|không gian xanh|The city needs more green space.|Thành phố & môi trường
congested|/kənˈdʒestɪd/|adj|tắc nghẽn|The roads get congested at six.|Thành phố & môi trường
air pollution|/eə pəˈluːʃn/|n|ô nhiễm không khí|Air pollution is getting worse.|Thành phố & môi trường
public transport|/ˈpʌblɪk ˈtrænspɔːt/|n|giao thông công cộng|Public transport is improving.|Thành phố & môi trường
cut down on waste|/kʌt daʊn ɒn weɪst/|phr|giảm rác thải|We should cut down on waste.|Thành phố & môi trường
recycle|/ˌriːˈsaɪkl/|v|tái chế|We recycle paper and cans.|Thành phố & môi trường
lively|/ˈlaɪvli/|adj|nhộn nhịp, sôi động|The old quarter is lively at night.|Thành phố & môi trường
cost of living|/kɒst əv ˈlɪvɪŋ/|n|chi phí sinh hoạt|The cost of living keeps rising.|Thành phố & môi trường
run-down|/rʌn daʊn/|adj|xuống cấp|Some buildings look run-down.|Thành phố & môi trường
raise awareness|/reɪz əˈweənəs/|phr|nâng cao nhận thức|Schools should raise awareness.|Thành phố & môi trường

catchy|/ˈkætʃi/|adj|dễ nhớ, bắt tai|The chorus is really catchy.|Giải trí
plot|/plɒt/|n|cốt truyện|The plot was hard to follow.|Giải trí
gripping|/ˈɡrɪpɪŋ/|adj|cuốn không rời|It's a gripping thriller.|Giải trí
overrated|/ˌəʊvəˈreɪtɪd/|adj|được khen quá mức|I found that film overrated.|Giải trí
binge-watch|/bɪndʒ wɒtʃ/|v|cày phim liên tục|I binge-watched the whole series.|Giải trí
soundtrack|/ˈsaʊndtræk/|n|nhạc phim|The soundtrack made the film.|Giải trí
page-turner|/peɪdʒ ˈtɜːnə(r)/|n|sách cuốn hút|It's a real page-turner.|Giải trí
be based on|/bi beɪst ɒn/|phr|dựa trên|It's based on a true story.|Giải trí
put me off|/pʊt miː ɒf/|phr v|làm mất hứng|The ending put me off.|Giải trí
grow on someone|/ɡrəʊ ɒn ˈsʌmwʌn/|phr v|nghe mãi rồi thích|The album grew on me.|Giải trí
`;

function parse(block: string): VocabWord[] {
  return block
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line, i) => {
      const [word, ipa, pos, meaning, example, topic] = line.split("|");
      return {
        id: `vt-${i + 1}`,
        word: word ?? "",
        ipa: ipa ?? "",
        pos: pos ?? "",
        meaning: meaning ?? "",
        example: example ?? "",
        topic: topic ?? "",
        tier: 3 as const,
      };
    });
}

export const VOCAB_TOPIC_WORDS: VocabWord[] = parse(SPEAKING_TOPICS);

/** Các chủ đề có trong bộ này, giữ nguyên thứ tự xuất hiện. */
export const VOCAB_TOPIC_LIST: string[] = [...new Set(VOCAB_TOPIC_WORDS.map((w) => w.topic))];

export const VOCAB_TOPIC_NODE = "v-4";

function toCard(w: VocabWord): FlashCard {
  return {
    id: `${VOCAB_TOPIC_NODE}-${w.id}`,
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

export const VOCAB_TOPIC_DECK: DeckLesson = {
  kind: "deck",
  nodeId: VOCAB_TOPIC_NODE,
  theory: [
    "Học theo cụm, đừng học từ đơn — giám khảo chấm cách bạn ghép từ.",
    "Mỗi chủ đề chọn 5 cụm ưng nhất, tự đặt một câu về CHÍNH bạn.",
    "Nói câu đó thành tiếng: nhớ bằng miệng chắc hơn nhớ bằng mắt.",
    "Một cụm dùng được cho nhiều chủ đề thì học trước.",
  ],
  cards: VOCAB_TOPIC_WORDS.map(toCard),
};
