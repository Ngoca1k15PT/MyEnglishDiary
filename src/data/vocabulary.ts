import type { DeckLesson, FlashCard } from "./lesson-types";

/**
 * Toàn bộ từ vựng thật, 3 tầng.
 * Định dạng mỗi dòng: word|ipa|pos|meaning|example|topic
 * Sao "Tầng N" sáng theo tỉ lệ số từ đạt khoảng ôn >= 21 ngày.
 */
export type VocabWord = {
  id: string;
  word: string;
  ipa: string;
  pos: string;
  meaning: string;
  example: string;
  topic: string;
  tier: 1 | 2 | 3;
};

const TIER_1 = `
be|/biː/|v|thì, là, ở|I am a student.|Động từ
have|/hæv/|v|có|I have two brothers.|Động từ
do|/duː/|v|làm|What do you do every morning?|Động từ
go|/ɡəʊ/|v|đi|I go to work by bike.|Động từ
come|/kʌm/|v|đến|Please come here.|Động từ
get|/ɡet/|v|lấy, nhận được|I got your message.|Động từ
make|/meɪk/|v|làm ra, tạo ra|She made a cake.|Động từ
take|/teɪk/|v|lấy, cầm, mất (thời gian)|It takes 20 minutes.|Động từ
see|/siː/|v|nhìn thấy|I can see the mountain.|Động từ
look|/lʊk/|v|nhìn (chủ động)|Look at this photo.|Động từ
watch|/wɒtʃ/|v|xem (theo dõi)|I watch films at night.|Động từ
hear|/hɪə(r)/|v|nghe thấy|I heard a noise.|Động từ
listen|/ˈlɪsn/|v|lắng nghe|Listen to this song.|Động từ
know|/nəʊ/|v|biết|I know the answer.|Động từ
think|/θɪŋk/|v|nghĩ|I think it's a good idea.|Động từ
want|/wɒnt/|v|muốn|I want a coffee.|Động từ
need|/niːd/|v|cần|I need more time.|Động từ
like|/laɪk/|v|thích|I like Vietnamese food.|Động từ
love|/lʌv/|v|yêu, rất thích|She loves her job.|Động từ
hate|/heɪt/|v|ghét|I hate waking up early.|Động từ
use|/juːz/|v|sử dụng|I use my phone too much.|Động từ
work|/wɜːk/|n/v|công việc; làm việc|I have a lot of work. / I work from home.|Công việc
study|/ˈstʌdi/|v|học|I study English every day.|Động từ
learn|/lɜːn/|v|học được, tiếp thu|I learn ten words a day.|Động từ
teach|/tiːtʃ/|v|dạy|She teaches maths.|Động từ
read|/riːd/|v|đọc|I read before bed.|Động từ
write|/raɪt/|v|viết|Write your name here.|Động từ
speak|/spiːk/|v|nói (ngôn ngữ)|Do you speak English?|Động từ
talk|/tɔːk/|v|nói chuyện|We talked for an hour.|Động từ
say|/seɪ/|v|nói (điều gì)|He said nothing.|Động từ
tell|/tel/|v|kể, bảo (ai đó)|Tell me the truth.|Động từ
ask|/ɑːsk/|v|hỏi, nhờ|Can I ask a question?|Động từ
answer|/ˈɑːnsə(r)/|n/v|câu trả lời; trả lời|I don't know the answer. / Please answer my email.|Học tập
help|/help/|v|giúp đỡ|Can you help me?|Động từ
eat|/iːt/|v|ăn|I eat breakfast at 7.|Động từ
drink|/drɪŋk/|v|uống|I drink a lot of water.|Động từ
cook|/kʊk/|v|nấu ăn|I cook dinner every day.|Động từ
sleep|/sliːp/|v|ngủ|I sleep seven hours.|Động từ
wake up|/weɪk ʌp/|phr v|thức dậy|I wake up at 6 a.m.|Động từ
buy|/baɪ/|v|mua|I bought a new phone.|Động từ
sell|/sel/|v|bán|They sell fresh fruit.|Động từ
pay|/peɪ/|v|trả tiền|I paid by card.|Động từ
give|/ɡɪv/|v|đưa, cho|Give me a minute.|Động từ
bring|/brɪŋ/|v|mang đến|Bring your umbrella.|Động từ
put|/pʊt/|v|đặt, để|Put it on the table.|Động từ
find|/faɪnd/|v|tìm thấy|I can't find my keys.|Động từ
lose|/luːz/|v|mất, thua|I lost my wallet.|Động từ
keep|/kiːp/|v|giữ|Keep the change.|Động từ
try|/traɪ/|v|thử, cố gắng|Try again tomorrow.|Động từ
start|/stɑːt/|v|bắt đầu|The class starts at 8.|Động từ
stop|/stɒp/|v|dừng lại|Stop scrolling and study.|Động từ
finish|/ˈfɪnɪʃ/|v|hoàn thành|I finished the book.|Động từ
open|/ˈəʊpən/|v|mở|Open the window.|Động từ
close|/kləʊz/|v|đóng|Close the door, please.|Động từ
live|/lɪv/|v|sống|I live in Da Nang.|Động từ
stay|/steɪ/|v|ở lại|I stayed at home.|Động từ
leave|/liːv/|v|rời đi, để lại|I leave at 7 every day.|Động từ
meet|/miːt/|v|gặp|Nice to meet you.|Động từ
call|/kɔːl/|v|gọi (điện thoại)|Call me later.|Động từ
send|/send/|v|gửi|I sent you a message.|Động từ
wait|/weɪt/|v|chờ|Wait for me.|Động từ
walk|/wɔːk/|v|đi bộ|I walk to the market.|Động từ
run|/rʌn/|v|chạy|I run every morning.|Động từ
drive|/draɪv/|v|lái xe|She drives to work.|Động từ
travel|/ˈtrævl/|v|đi du lịch|I want to travel more.|Động từ
remember|/rɪˈmembə(r)/|v|nhớ|I can't remember his name.|Động từ
forget|/fəˈɡet/|v|quên|Don't forget your keys.|Động từ
understand|/ˌʌndəˈstænd/|v|hiểu|I don't understand.|Động từ
change|/tʃeɪndʒ/|v|thay đổi|I changed my mind.|Động từ
choose|/tʃuːz/|v|chọn|Choose one option.|Động từ
feel|/fiːl/|v|cảm thấy|I feel tired today.|Động từ
hope|/həʊp/|v|hy vọng|I hope you are well.|Động từ
wear|/weə(r)/|v|mặc, đeo|She wears glasses.|Động từ
wash|/wɒʃ/|v|rửa, giặt|Wash your hands.|Động từ
clean|/kliːn/|adj/v|sạch; dọn dẹp|The room is clean. / I clean my room on Sunday.|Tính từ
move|/muːv/|v|di chuyển, chuyển nhà|We moved to a new house.|Động từ
show|/ʃəʊ/|v|cho xem, chỉ|Show me the photo.|Động từ
happen|/ˈhæpən/|v|xảy ra|What happened?|Động từ
become|/bɪˈkʌm/|v|trở thành|He became a teacher.|Động từ
believe|/bɪˈliːv/|v|tin|I believe you.|Động từ
time|/taɪm/|n|thời gian|I don't have much time.|Thời gian
day|/deɪ/|n|ngày|Have a nice day!|Thời gian
week|/wiːk/|n|tuần|See you next week.|Thời gian
month|/mʌnθ/|n|tháng|I started three months ago.|Thời gian
year|/jɪə(r)/|n|năm|Last year was hard.|Thời gian
hour|/ˈaʊə(r)/|n|giờ (60 phút)|I waited two hours.|Thời gian
minute|/ˈmɪnɪt/|n|phút|Give me five minutes.|Thời gian
morning|/ˈmɔːnɪŋ/|n|buổi sáng|I study in the morning.|Thời gian
afternoon|/ˌɑːftəˈnuːn/|n|buổi chiều|See you this afternoon.|Thời gian
evening|/ˈiːvnɪŋ/|n|buổi tối|I relax in the evening.|Thời gian
night|/naɪt/|n|đêm|I sleep late at night.|Thời gian
today|/təˈdeɪ/|adv|hôm nay|Today is Monday.|Thời gian
tomorrow|/təˈmɒrəʊ/|adv|ngày mai|I'll call you tomorrow.|Thời gian
yesterday|/ˈjestədeɪ/|adv|hôm qua|I saw him yesterday.|Thời gian
weekend|/ˌwiːkˈend/|n|cuối tuần|What do you do at the weekend?|Thời gian
people|/ˈpiːpl/|n|con người, mọi người|Many people study online.|Người
man|/mæn/|n|người đàn ông|That man is my neighbour.|Người
woman|/ˈwʊmən/|n|người phụ nữ|The woman over there is my boss.|Người
child|/tʃaɪld/|n|đứa trẻ|Every child needs to play.|Người
family|/ˈfæməli/|n|gia đình|I live with my family.|Người
friend|/frend/|n|bạn bè|He is my best friend.|Người
parents|/ˈpeərənts/|n|bố mẹ|My parents live in Hue.|Người
brother|/ˈbrʌðə(r)/|n|anh/em trai|I have one brother.|Người
sister|/ˈsɪstə(r)/|n|chị/em gái|My sister is a nurse.|Người
neighbour|/ˈneɪbə(r)/|n|hàng xóm|My neighbour is very kind.|Người
home|/həʊm/|n|nhà (tổ ấm)|I work from home.|Nhà cửa
house|/haʊs/|n|căn nhà|They bought a house.|Nhà cửa
room|/ruːm/|n|căn phòng|My room is small.|Nhà cửa
kitchen|/ˈkɪtʃɪn/|n|nhà bếp|She is in the kitchen.|Nhà cửa
table|/ˈteɪbl/|n|cái bàn|Put it on the table.|Nhà cửa
chair|/tʃeə(r)/|n|cái ghế|This chair is comfortable.|Nhà cửa
door|/dɔː(r)/|n|cửa ra vào|Close the door.|Nhà cửa
window|/ˈwɪndəʊ/|n|cửa sổ|Open the window.|Nhà cửa
key|/kiː/|n|chìa khoá|I lost my keys.|Nhà cửa
school|/skuːl/|n|trường học|I go to school by bus.|Học tập
class|/klɑːs/|n|lớp học|The class starts at 8.|Học tập
teacher|/ˈtiːtʃə(r)/|n|giáo viên|My teacher is very patient.|Học tập
student|/ˈstjuːdnt/|n|học sinh, sinh viên|I'm a student.|Học tập
book|/bʊk/|n|quyển sách|I'm reading a good book.|Học tập
word|/wɜːd/|n|từ|I learn ten words a day.|Học tập
question|/ˈkwestʃən/|n|câu hỏi|Can I ask a question?|Học tập
mistake|/mɪˈsteɪk/|n|lỗi sai|Making mistakes is normal.|Học tập
example|/ɪɡˈzɑːmpl/|n|ví dụ|Give me an example.|Học tập
job|/dʒɒb/|n|việc làm|She has a good job.|Công việc
office|/ˈɒfɪs/|n|văn phòng|The office is downtown.|Công việc
company|/ˈkʌmpəni/|n|công ty|I work for a small company.|Công việc
meeting|/ˈmiːtɪŋ/|n|cuộc họp|The meeting is at 10.|Công việc
money|/ˈmʌni/|n|tiền|I need to save money.|Tiền
price|/praɪs/|n|giá cả|The price is too high.|Tiền
shop|/ʃɒp/|n|cửa hàng|There is a shop nearby.|Tiền
market|/ˈmɑːkɪt/|n|chợ|I buy fruit at the market.|Tiền
food|/fuːd/|n|thức ăn|Vietnamese food is amazing.|Ăn uống
water|/ˈwɔːtə(r)/|n|nước|Drink more water.|Ăn uống
rice|/raɪs/|n|cơm, gạo|We eat rice every day.|Ăn uống
meat|/miːt/|n|thịt|I don't eat much meat.|Ăn uống
vegetable|/ˈvedʒtəbl/|n|rau củ|Eat more vegetables.|Ăn uống
fruit|/fruːt/|n|trái cây|Fruit is good for you.|Ăn uống
breakfast|/ˈbrekfəst/|n|bữa sáng|I skip breakfast sometimes.|Ăn uống
restaurant|/ˈrestrɒnt/|n|nhà hàng|Let's try that restaurant.|Ăn uống
city|/ˈsɪti/|n|thành phố|Da Nang is a beautiful city.|Đi lại
country|/ˈkʌntri/|n|đất nước|Which country are you from?|Đi lại
street|/striːt/|n|đường phố|The street is busy.|Đi lại
car|/kɑː(r)/|n|ô tô|I don't have a car.|Đi lại
bus|/bʌs/|n|xe buýt|I take the bus to work.|Đi lại
train|/treɪn/|n|tàu hoả|The train is late.|Đi lại
plane|/pleɪn/|n|máy bay|The plane leaves at 6.|Đi lại
ticket|/ˈtɪkɪt/|n|vé|I booked a ticket.|Đi lại
hotel|/həʊˈtel/|n|khách sạn|The hotel was cheap.|Đi lại
phone|/fəʊn/|n|điện thoại|My phone is always in my hand.|Đồ vật
computer|/kəmˈpjuːtə(r)/|n|máy tính|I use a computer at work.|Đồ vật
bag|/bæɡ/|n|cái túi|Don't forget your bag.|Đồ vật
clothes|/kləʊðz/|n|quần áo|I need new clothes.|Đồ vật
health|/helθ/|n|sức khoẻ|Sleep is important for health.|Sức khoẻ
doctor|/ˈdɒktə(r)/|n|bác sĩ|I need to see a doctor.|Sức khoẻ
hospital|/ˈhɒspɪtl/|n|bệnh viện|The hospital is far away.|Sức khoẻ
body|/ˈbɒdi/|n|cơ thể|Exercise is good for the body.|Sức khoẻ
head|/hed/|n|cái đầu|I have a headache.|Sức khoẻ
hand|/hænd/|n|bàn tay|Wash your hands.|Sức khoẻ
weather|/ˈweðə(r)/|n|thời tiết|The weather is hot today.|Thời tiết
rain|/reɪn/|n/v|mưa|It rains a lot in October.|Thời tiết
sun|/sʌn/|n|mặt trời|The sun is strong at noon.|Thời tiết
problem|/ˈprɒbləm/|n|vấn đề|That's not a big problem.|Trừu tượng
idea|/aɪˈdɪə/|n|ý tưởng|That's a great idea.|Trừu tượng
reason|/ˈriːzn/|n|lý do|What's the reason?|Trừu tượng
way|/weɪ/|n|cách thức, con đường|There is an easier way.|Trừu tượng
thing|/θɪŋ/|n|thứ, việc|I have a few things to do.|Trừu tượng
place|/pleɪs/|n|nơi chốn|This is my favourite place.|Trừu tượng
life|/laɪf/|n|cuộc sống|Life is busy these days.|Trừu tượng
story|/ˈstɔːri/|n|câu chuyện|Tell me the whole story.|Trừu tượng
habit|/ˈhæbɪt/|n|thói quen|Studying daily is a good habit.|Trừu tượng
good|/ɡʊd/|adj|tốt|This is a good book.|Tính từ
bad|/bæd/|adj|tệ, xấu|The weather is bad today.|Tính từ
big|/bɪɡ/|adj|to, lớn|They live in a big house.|Tính từ
small|/smɔːl/|adj|nhỏ|My room is quite small.|Tính từ
long|/lɒŋ/|adj|dài|It was a long day.|Tính từ
short|/ʃɔːt/|adj|ngắn, thấp|Take a short break.|Tính từ
new|/njuː/|adj|mới|I bought a new laptop.|Tính từ
old|/əʊld/|adj|cũ, già|My phone is very old.|Tính từ
young|/jʌŋ/|adj|trẻ|Young people learn fast.|Tính từ
hot|/hɒt/|adj|nóng|Da Nang is hot in June.|Tính từ
cold|/kəʊld/|adj|lạnh|The water is cold.|Tính từ
easy|/ˈiːzi/|adj|dễ|This exercise is easy.|Tính từ
difficult|/ˈdɪfɪkəlt/|adj|khó|English grammar is difficult.|Tính từ
cheap|/tʃiːp/|adj|rẻ|Street food is cheap here.|Tính từ
expensive|/ɪkˈspensɪv/|adj|đắt|That hotel is expensive.|Tính từ
fast|/fɑːst/|adj|nhanh|He speaks too fast.|Tính từ
slow|/sləʊ/|adj|chậm|My internet is slow.|Tính từ
happy|/ˈhæpi/|adj|vui, hạnh phúc|I'm happy with my progress.|Tính từ
sad|/sæd/|adj|buồn|The film was sad.|Tính từ
tired|/ˈtaɪəd/|adj|mệt|I'm too tired to study.|Tính từ
busy|/ˈbɪzi/|adj|bận rộn|I'm busy this week.|Tính từ
free|/friː/|adj|rảnh, miễn phí|Are you free tonight?|Tính từ
right|/raɪt/|adj|đúng, bên phải|Your answer is right.|Tính từ
wrong|/rɒŋ/|adj|sai|I got two answers wrong.|Tính từ
same|/seɪm/|adj|giống nhau|We have the same problem.|Tính từ
different|/ˈdɪfrənt/|adj|khác nhau|This is completely different.|Tính từ
important|/ɪmˈpɔːtnt/|adj|quan trọng|Consistency is important.|Tính từ
beautiful|/ˈbjuːtɪfl/|adj|đẹp|The beach is beautiful.|Tính từ
dirty|/ˈdɜːti/|adj|bẩn|My shoes are dirty.|Tính từ
full|/fʊl/|adj|đầy, no|The bus is full.|Tính từ
empty|/ˈempti/|adj|trống rỗng|The street was empty.|Tính từ
high|/haɪ/|adj|cao|The price is too high.|Tính từ
low|/ləʊ/|adj|thấp|My energy is low today.|Tính từ
near|/nɪə(r)/|adj|gần|Is there a shop near here?|Tính từ
far|/fɑː(r)/|adj|xa|The station is quite far.|Tính từ
early|/ˈɜːli/|adj|sớm|I wake up early.|Tính từ
late|/leɪt/|adj|muộn|Sorry I'm late.|Tính từ
strong|/strɒŋ/|adj|mạnh|She has a strong accent.|Tính từ
weak|/wiːk/|adj|yếu|My listening is weak.|Tính từ
safe|/seɪf/|adj|an toàn|This area is safe at night.|Tính từ
dangerous|/ˈdeɪndʒərəs/|adj|nguy hiểm|Driving fast is dangerous.|Tính từ
quiet|/ˈkwaɪət/|adj|yên tĩnh|I need a quiet place to study.|Tính từ
noisy|/ˈnɔɪzi/|adj|ồn ào|The café is too noisy.|Tính từ
delicious|/dɪˈlɪʃəs/|adj|ngon|The food was delicious.|Tính từ
hungry|/ˈhʌŋɡri/|adj|đói|I'm hungry already.|Tính từ
interesting|/ˈɪntrəstɪŋ/|adj|thú vị|That's an interesting point.|Tính từ
boring|/ˈbɔːrɪŋ/|adj|nhàm chán|The lesson was boring.|Tính từ
comfortable|/ˈkʌmftəbl/|adj|thoải mái|This chair is comfortable.|Tính từ
possible|/ˈpɒsəbl/|adj|có thể|Is it possible to change the date?|Tính từ
always|/ˈɔːlweɪz/|adv|luôn luôn|I always check my phone first.|Trạng từ
usually|/ˈjuːʒuəli/|adv|thường thường|I usually study at night.|Trạng từ
often|/ˈɒfn/|adv|thường xuyên|I often forget new words.|Trạng từ
sometimes|/ˈsʌmtaɪmz/|adv|thỉnh thoảng|Sometimes I skip a day.|Trạng từ
never|/ˈnevə(r)/|adv|không bao giờ|I never give up.|Trạng từ
very|/ˈveri/|adv|rất|It's very hot today.|Trạng từ
too|/tuː/|adv|quá (mức)|This is too difficult.|Trạng từ
also|/ˈɔːlsəʊ/|adv|cũng|I also study grammar.|Trạng từ
only|/ˈəʊnli/|adv|chỉ|It only takes five minutes.|Trạng từ
still|/stɪl/|adv|vẫn còn|I still remember that word.|Trạng từ
again|/əˈɡen/|adv|lại, lần nữa|Try again tomorrow.|Trạng từ
together|/təˈɡeðə(r)/|adv|cùng nhau|Let's study together.|Trạng từ
maybe|/ˈmeɪbi/|adv|có lẽ|Maybe I'll start tomorrow.|Trạng từ
really|/ˈrɪəli/|adv|thực sự|I really need to focus.|Trạng từ
almost|/ˈɔːlməʊst/|adv|gần như|I almost finished.|Trạng từ
enough|/ɪˈnʌf/|adv|đủ|I don't have enough time.|Trạng từ
because|/bɪˈkɒz/|conj|bởi vì|I stopped because I was tired.|Liên từ
but|/bʌt/|conj|nhưng|I want to study, but I'm lazy.|Liên từ
so|/səʊ/|conj|vì vậy|It was late, so I went home.|Liên từ
if|/ɪf/|conj|nếu|If it rains, I'll stay home.|Liên từ
when|/wen/|conj|khi|Call me when you arrive.|Liên từ
before|/bɪˈfɔː(r)/|prep|trước khi|Study before you sleep.|Liên từ
after|/ˈɑːftə(r)/|prep|sau khi|I relax after work.|Liên từ
while|/waɪl/|conj|trong khi|I listen to podcasts while cooking.|Liên từ
about|/əˈbaʊt/|prep|về, khoảng|It's about 20 minutes.|Liên từ
How are you?|/haʊ ɑː juː/|phr|Bạn khoẻ không?|How are you today?|Giao tiếp
Nice to meet you|/naɪs tə miːt juː/|phr|Rất vui được gặp bạn|Nice to meet you, I'm Nam.|Giao tiếp
Excuse me|/ɪkˈskjuːz miː/|phr|Xin lỗi (làm phiền)|Excuse me, where is the station?|Giao tiếp
I'm sorry|/aɪm ˈsɒri/|phr|Tôi xin lỗi|I'm sorry, I was late.|Giao tiếp
Thank you|/θæŋk juː/|phr|Cảm ơn|Thank you for your help.|Giao tiếp
You're welcome|/jɔː ˈwelkəm/|phr|Không có gì|You're welcome, anytime.|Giao tiếp
Can you help me?|/kən juː help miː/|phr|Bạn giúp tôi được không?|Can you help me with this?|Giao tiếp
I don't understand|/aɪ dəʊnt ˌʌndəˈstænd/|phr|Tôi không hiểu|Sorry, I don't understand.|Giao tiếp
Could you repeat that?|/kʊd juː rɪˈpiːt ðæt/|phr|Bạn nhắc lại được không?|Could you repeat that, please?|Giao tiếp
What does it mean?|/wɒt dʌz ɪt miːn/|phr|Nó nghĩa là gì?|What does this word mean?|Giao tiếp
How much is it?|/haʊ mʌtʃ ɪz ɪt/|phr|Bao nhiêu tiền?|How much is this shirt?|Giao tiếp
I'd like...|/aɪd laɪk/|phr|Tôi muốn... (lịch sự)|I'd like a coffee, please.|Giao tiếp
See you later|/siː juː ˈleɪtə(r)/|phr|Hẹn gặp lại|See you later, take care.|Giao tiếp
No problem|/nəʊ ˈprɒbləm/|phr|Không sao đâu|No problem, I understand.|Giao tiếp
Let me think|/let miː θɪŋk/|phr|Để tôi nghĩ đã|Let me think for a second.|Giao tiếp
`;

const TIER_2 = `
give up|/ɡɪv ʌp/|phr v|từ bỏ|Most people give up after a week.|Phrasal verb
find out|/faɪnd aʊt/|phr v|tìm ra, phát hiện|I found out the truth later.|Phrasal verb
look for|/lʊk fɔː(r)/|phr v|tìm kiếm|I'm looking for a new job.|Phrasal verb
look after|/lʊk ˈɑːftə(r)/|phr v|chăm sóc|She looks after her grandmother.|Phrasal verb
look forward to|/lʊk ˈfɔːwəd tuː/|phr v|mong chờ|I'm looking forward to the trip.|Phrasal verb
get up|/ɡet ʌp/|phr v|thức dậy, đứng dậy|I get up at six.|Phrasal verb
get on with|/ɡet ɒn wɪð/|phr v|hoà hợp với ai|I get on well with my colleagues.|Phrasal verb
come up with|/kʌm ʌp wɪð/|phr v|nghĩ ra (ý tưởng)|She came up with a clever solution.|Phrasal verb
turn down|/tɜːn daʊn/|phr v|từ chối, vặn nhỏ|He turned down the offer.|Phrasal verb
put off|/pʊt ɒf/|phr v|trì hoãn|Stop putting off your study.|Phrasal verb
carry on|/ˈkæri ɒn/|phr v|tiếp tục|Carry on, you're doing well.|Phrasal verb
take part in|/teɪk pɑːt ɪn/|phr v|tham gia|I took part in a speaking club.|Phrasal verb
deal with|/diːl wɪð/|phr v|xử lý, đối phó|How do you deal with stress?|Phrasal verb
figure out|/ˈfɪɡər aʊt/|phr v|hiểu ra, nghĩ ra|I finally figured out the problem.|Phrasal verb
keep up with|/kiːp ʌp wɪð/|phr v|theo kịp|It's hard to keep up with the class.|Phrasal verb
run out of|/rʌn aʊt əv/|phr v|hết (cái gì)|I ran out of time.|Phrasal verb
end up|/end ʌp/|phr v|rốt cuộc lại|I ended up watching videos all night.|Phrasal verb
stick to|/stɪk tuː/|phr v|kiên trì theo|The hardest part is sticking to a plan.|Phrasal verb
cut down on|/kʌt daʊn ɒn/|phr v|cắt giảm|I need to cut down on screen time.|Phrasal verb
make up for|/meɪk ʌp fɔː(r)/|phr v|bù đắp cho|I'll make up for the missed day.|Phrasal verb
achieve|/əˈtʃiːv/|v|đạt được|She achieved her target in a year.|Động từ
improve|/ɪmˈpruːv/|v|cải thiện|Reading improves your vocabulary.|Động từ
develop|/dɪˈveləp/|v|phát triển|You develop skills by practising.|Động từ
reduce|/rɪˈdjuːs/|v|giảm bớt|We should reduce plastic waste.|Động từ
increase|/ɪnˈkriːs/|v|tăng lên|Costs increased last year.|Động từ
avoid|/əˈvɔɪd/|v|tránh|I avoid studying on my phone.|Động từ
allow|/əˈlaʊ/|v|cho phép|My boss allows flexible hours.|Động từ
prefer|/prɪˈfɜː(r)/|v|thích hơn|I prefer tea to coffee.|Động từ
suggest|/səˈdʒest/|v|đề nghị, gợi ý|He suggested a different approach.|Động từ
decide|/dɪˈsaɪd/|v|quyết định|I decided to start today.|Động từ
explain|/ɪkˈspleɪn/|v|giải thích|Can you explain that again?|Động từ
describe|/dɪˈskraɪb/|v|miêu tả|Describe your hometown.|Động từ
compare|/kəmˈpeə(r)/|v|so sánh|Compare the two charts.|Động từ
realise|/ˈriːəlaɪz/|v|nhận ra|I realised my mistake too late.|Động từ
admit|/ədˈmɪt/|v|thừa nhận|I admit I was wrong.|Động từ
complain|/kəmˈpleɪn/|v|phàn nàn|People complain about the traffic.|Động từ
encourage|/ɪnˈkʌrɪdʒ/|v|khuyến khích|My teacher encouraged me a lot.|Động từ
prevent|/prɪˈvent/|v|ngăn chặn|Exercise prevents many diseases.|Động từ
provide|/prəˈvaɪd/|v|cung cấp|The school provides free books.|Động từ
require|/rɪˈkwaɪə(r)/|v|yêu cầu, đòi hỏi|This job requires patience.|Động từ
affect|/əˈfekt/|v|ảnh hưởng tới|Lack of sleep affects your focus.|Động từ
focus on|/ˈfəʊkəs ɒn/|v|tập trung vào|Focus on one thing at a time.|Động từ
manage|/ˈmænɪdʒ/|v|xoay xở, quản lý|I managed to finish on time.|Động từ
waste|/weɪst/|v|lãng phí|I waste hours on my phone.|Động từ
save|/seɪv/|v|tiết kiệm, cứu|Cycling saves money.|Động từ
share|/ʃeə(r)/|v|chia sẻ|She shared her notes with me.|Động từ
solve|/sɒlv/|v|giải quyết|We need to solve this problem.|Động từ
support|/səˈpɔːt/|v|ủng hộ, hỗ trợ|My family supports my decision.|Động từ
opportunity|/ˌɒpəˈtjuːnəti/|n|cơ hội|This is a great opportunity.|Danh từ
experience|/ɪkˈspɪəriəns/|n|kinh nghiệm, trải nghiệm|He has ten years of experience.|Danh từ
skill|/skɪl/|n|kỹ năng|Communication is a key skill.|Danh từ
goal|/ɡəʊl/|n|mục tiêu|Set a small goal first.|Danh từ
progress|/ˈprəʊɡres/|n|sự tiến bộ|I can see real progress.|Danh từ
result|/rɪˈzʌlt/|n|kết quả|The results were surprising.|Danh từ
effort|/ˈefət/|n|nỗ lực|It takes daily effort.|Danh từ
advice|/ədˈvaɪs/|n|lời khuyên|That's good advice.|Danh từ
choice|/tʃɔɪs/|n|sự lựa chọn|You have two choices.|Danh từ
decision|/dɪˈsɪʒn/|n|quyết định|It was a hard decision.|Danh từ
situation|/ˌsɪtʃuˈeɪʃn/|n|tình huống|The situation is improving.|Danh từ
advantage|/ədˈvɑːntɪdʒ/|n|lợi thế|Speaking English is a big advantage.|Danh từ
disadvantage|/ˌdɪsədˈvɑːntɪdʒ/|n|bất lợi|The main disadvantage is the cost.|Danh từ
difference|/ˈdɪfrəns/|n|sự khác biệt|What's the difference?|Danh từ
attention|/əˈtenʃn/|n|sự chú ý|Pay attention to the details.|Danh từ
pressure|/ˈpreʃə(r)/|n|áp lực|I work well under pressure.|Danh từ
stress|/stres/|n|căng thẳng|Exercise helps reduce stress.|Danh từ
routine|/ruːˈtiːn/|n|thói quen hằng ngày|A fixed routine helps me a lot.|Danh từ
motivation|/ˌməʊtɪˈveɪʃn/|n|động lực|Motivation fades; habits don't.|Danh từ
confidence|/ˈkɒnfɪdəns/|n|sự tự tin|Speaking daily builds confidence.|Danh từ
knowledge|/ˈnɒlɪdʒ/|n|kiến thức|He has deep knowledge of history.|Danh từ
information|/ˌɪnfəˈmeɪʃn/|n|thông tin|I need more information.|Danh từ
research|/rɪˈsɜːtʃ/|n|nghiên cứu|Recent research shows the opposite.|Danh từ
society|/səˈsaɪəti/|n|xã hội|Technology has changed society.|Danh từ
government|/ˈɡʌvənmənt/|n|chính phủ|The government raised taxes.|Danh từ
community|/kəˈmjuːnəti/|n|cộng đồng|The local community helped out.|Danh từ
environment|/ɪnˈvaɪrənmənt/|n|môi trường|Plastic harms the environment.|Danh từ
behaviour|/bɪˈheɪvjə(r)/|n|hành vi|Screen time affects behaviour.|Danh từ
available|/əˈveɪləbl/|adj|có sẵn|Free wifi is available here.|Tính từ
necessary|/ˈnesəsəri/|adj|cần thiết|Is that really necessary?|Tính từ
useful|/ˈjuːsfl/|adj|hữu ích|This app is really useful.|Tính từ
effective|/ɪˈfektɪv/|adj|hiệu quả|Spaced repetition is very effective.|Tính từ
popular|/ˈpɒpjələ(r)/|adj|phổ biến|Football is popular here.|Tính từ
common|/ˈkɒmən/|adj|thường gặp|That's a common mistake.|Tính từ
serious|/ˈsɪəriəs/|adj|nghiêm trọng|It's a serious problem.|Tính từ
similar|/ˈsɪmələ(r)/|adj|tương tự|The two words are similar.|Tính từ
responsible|/rɪˈspɒnsəbl/|adj|có trách nhiệm|Parents are responsible for this.|Tính từ
confident|/ˈkɒnfɪdənt/|adj|tự tin|I feel more confident now.|Tính từ
worried|/ˈwʌrid/|adj|lo lắng|I'm worried about the test.|Tính từ
patient|/ˈpeɪʃnt/|adj|kiên nhẫn|You have to be patient.|Tính từ
lazy|/ˈleɪzi/|adj|lười biếng|I feel lazy in the evening.|Tính từ
reliable|/rɪˈlaɪəbl/|adj|đáng tin cậy|He is a reliable friend.|Tính từ
flexible|/ˈfleksəbl/|adj|linh hoạt|My schedule is flexible.|Tính từ
obvious|/ˈɒbviəs/|adj|hiển nhiên|The answer is obvious.|Tính từ
convenient|/kənˈviːniənt/|adj|tiện lợi|Online learning is convenient.|Tính từ
crowded|/ˈkraʊdɪd/|adj|đông đúc|The beach gets crowded.|Tính từ
traditional|/trəˈdɪʃənl/|adj|truyền thống|This is a traditional dish.|Tính từ
modern|/ˈmɒdn/|adj|hiện đại|Modern life is fast.|Tính từ
however|/haʊˈevə(r)/|adv|tuy nhiên|However, there are drawbacks.|Liên kết
therefore|/ˈðeəfɔː(r)/|adv|do đó|Therefore, prices went up.|Liên kết
furthermore|/ˌfɜːðəˈmɔː(r)/|adv|hơn nữa|Furthermore, it saves money.|Liên kết
in addition|/ɪn əˈdɪʃn/|phr|thêm vào đó|In addition, it is free.|Liên kết
as a result|/əz ə rɪˈzʌlt/|phr|kết quả là|As a result, fewer people drive.|Liên kết
for instance|/fər ˈɪnstəns/|phr|ví dụ như|For instance, Japan has low birth rates.|Liên kết
in contrast|/ɪn ˈkɒntrɑːst/|phr|ngược lại|In contrast, sales fell in the south.|Liên kết
on the other hand|/ɒn ði ˈʌðə hænd/|phr|mặt khác|On the other hand, it is risky.|Liên kết
although|/ɔːlˈðəʊ/|conj|mặc dù|Although it rained, we went out.|Liên kết
despite|/dɪˈspaɪt/|prep|bất chấp|Despite the cost, it is worth it.|Liên kết
in fact|/ɪn fækt/|phr|thực tế là|In fact, the opposite is true.|Liên kết
to some extent|/tə sʌm ɪkˈstent/|phr|ở một mức độ nào đó|I agree to some extent.|Liên kết
`;

const TIER_3 = `
curriculum|/kəˈrɪkjələm/|n|chương trình giảng dạy|Life skills should be in the curriculum.|Education
academic performance|/ˌækəˈdemɪk pəˈfɔːməns/|n|thành tích học tập|Sleep affects academic performance.|Education
higher education|/ˈhaɪər ˌedʒuˈkeɪʃn/|n|giáo dục đại học|Higher education is expensive.|Education
tuition fees|/tjuˈɪʃn fiːz/|n|học phí|Tuition fees have risen sharply.|Education
scholarship|/ˈskɒləʃɪp/|n|học bổng|She won a full scholarship.|Education
vocational training|/vəʊˈkeɪʃənl ˈtreɪnɪŋ/|n|đào tạo nghề|Vocational training suits many students.|Education
drop out|/drɒp aʊt/|phr v|bỏ học|Some students drop out early.|Education
lifelong learning|/ˈlaɪflɒŋ ˈlɜːnɪŋ/|n|học tập suốt đời|Lifelong learning keeps skills relevant.|Education
rote learning|/rəʊt ˈlɜːnɪŋ/|n|học vẹt|Rote learning does not build understanding.|Education
critical thinking|/ˈkrɪtɪkl ˈθɪŋkɪŋ/|n|tư duy phản biện|Schools should teach critical thinking.|Education
literacy rate|/ˈlɪtərəsi reɪt/|n|tỷ lệ biết chữ|The literacy rate has improved.|Education
distance learning|/ˈdɪstəns ˈlɜːnɪŋ/|n|học từ xa|Distance learning became normal.|Education
employment|/ɪmˈplɔɪmənt/|n|việc làm|The government wants to boost employment.|Work
unemployment rate|/ˌʌnɪmˈplɔɪmənt reɪt/|n|tỷ lệ thất nghiệp|The unemployment rate fell to 4%.|Work
work-life balance|/wɜːk laɪf ˈbæləns/|n|cân bằng công việc và cuộc sống|Long hours ruin work-life balance.|Work
job satisfaction|/dʒɒb ˌsætɪsˈfækʃn/|n|sự hài lòng với công việc|Pay is not the only source of job satisfaction.|Work
working conditions|/ˈwɜːkɪŋ kənˈdɪʃnz/|n|điều kiện làm việc|Working conditions need improving.|Work
remote work|/rɪˈməʊt wɜːk/|n|làm việc từ xa|Remote work saves commuting time.|Work
promotion|/prəˈməʊʃn/|n|sự thăng chức|She got a promotion last month.|Work
colleague|/ˈkɒliːɡ/|n|đồng nghiệp|I get on well with my colleagues.|Work
salary|/ˈsæləri/|n|lương|He earns a decent salary.|Work
workload|/ˈwɜːkləʊd/|n|khối lượng công việc|My workload is heavy this month.|Work
burnout|/ˈbɜːnaʊt/|n|kiệt sức vì công việc|Burnout is common among nurses.|Work
automation|/ˌɔːtəˈmeɪʃn/|n|tự động hoá|Automation may replace routine jobs.|Work
pollution|/pəˈluːʃn/|n|ô nhiễm|Air pollution is worsening.|Environment
climate change|/ˈklaɪmət tʃeɪndʒ/|n|biến đổi khí hậu|Climate change affects everyone.|Environment
global warming|/ˈɡləʊbl ˈwɔːmɪŋ/|n|nóng lên toàn cầu|Global warming raises sea levels.|Environment
greenhouse gas|/ˈɡriːnhaʊs ɡæs/|n|khí nhà kính|Cars emit greenhouse gases.|Environment
renewable energy|/rɪˈnjuːəbl ˈenədʒi/|n|năng lượng tái tạo|Solar is a renewable energy source.|Environment
fossil fuel|/ˈfɒsl fjuːəl/|n|nhiên liệu hoá thạch|We must burn fewer fossil fuels.|Environment
deforestation|/ˌdiːˌfɒrɪˈsteɪʃn/|n|nạn phá rừng|Deforestation destroys habitats.|Environment
sustainable|/səˈsteɪnəbl/|adj|bền vững|We need sustainable farming.|Environment
conserve|/kənˈsɜːv/|v|bảo tồn, tiết kiệm|Turn off lights to conserve energy.|Environment
recycle|/ˌriːˈsaɪkl/|v|tái chế|Most plastic is never recycled.|Environment
emissions|/ɪˈmɪʃnz/|n|khí thải|Emissions must be cut by half.|Environment
biodiversity|/ˌbaɪəʊdaɪˈvɜːsəti/|n|đa dạng sinh học|Biodiversity is declining fast.|Environment
natural resources|/ˈnætʃrəl rɪˈsɔːsɪz/|n|tài nguyên thiên nhiên|Natural resources are limited.|Environment
endangered species|/ɪnˈdeɪndʒəd ˈspiːʃiːz/|n|loài nguy cấp|Tigers are an endangered species.|Environment
obesity|/əʊˈbiːsəti/|n|béo phì|Childhood obesity is rising.|Health
mental health|/ˈmentl helθ/|n|sức khoẻ tinh thần|Work stress harms mental health.|Health
healthcare system|/ˈhelθkeə ˈsɪstəm/|n|hệ thống y tế|The healthcare system is overloaded.|Health
life expectancy|/laɪf ɪkˈspektənsi/|n|tuổi thọ trung bình|Life expectancy has increased.|Health
sedentary lifestyle|/ˈsedntri ˈlaɪfstaɪl/|n|lối sống ít vận động|A sedentary lifestyle causes health issues.|Health
balanced diet|/ˈbælənst ˈdaɪət/|n|chế độ ăn cân bằng|A balanced diet is essential.|Health
processed food|/ˈprəʊsest fuːd/|n|thực phẩm chế biến sẵn|Processed food is high in salt.|Health
chronic disease|/ˈkrɒnɪk dɪˈziːz/|n|bệnh mãn tính|Diabetes is a chronic disease.|Health
preventive care|/prɪˈventɪv keə(r)/|n|y tế dự phòng|Preventive care reduces costs.|Health
well-being|/ˌwelˈbiːɪŋ/|n|sự khoẻ mạnh, an lành|Exercise improves overall well-being.|Health
artificial intelligence|/ˌɑːtɪˈfɪʃl ɪnˈtelɪdʒəns/|n|trí tuệ nhân tạo|AI may replace some jobs.|Technology
social media|/ˈsəʊʃl ˈmiːdiə/|n|mạng xã hội|Teenagers overuse social media.|Technology
screen time|/skriːn taɪm/|n|thời gian dùng màn hình|Limit your screen time at night.|Technology
digital literacy|/ˈdɪdʒɪtl ˈlɪtərəsi/|n|năng lực số|Digital literacy is now essential.|Technology
privacy|/ˈprɪvəsi/|n|quyền riêng tư|Apps collect data and threaten privacy.|Technology
cybercrime|/ˈsaɪbəkraɪm/|n|tội phạm mạng|Cybercrime is growing rapidly.|Technology
innovation|/ˌɪnəˈveɪʃn/|n|sự đổi mới|Innovation drives the economy.|Technology
addicted to|/əˈdɪktɪd tuː/|adj|nghiện (cái gì)|Many people are addicted to their phones.|Technology
distraction|/dɪˈstrækʃn/|n|thứ gây mất tập trung|My phone is my biggest distraction.|Technology
misinformation|/ˌmɪsɪnfəˈmeɪʃn/|n|thông tin sai lệch|Misinformation spreads fast online.|Technology
urbanisation|/ˌɜːbənaɪˈzeɪʃn/|n|đô thị hoá|Rapid urbanisation strains services.|Society
infrastructure|/ˈɪnfrəstrʌktʃə(r)/|n|cơ sở hạ tầng|The city invested in infrastructure.|Society
traffic congestion|/ˈtræfɪk kənˈdʒestʃən/|n|tắc đường|Traffic congestion wastes hours.|Society
public transport|/ˈpʌblɪk ˈtrænspɔːt/|n|giao thông công cộng|Public transport is cheap here.|Society
the gap between rich and poor|/ðə ɡæp/|phr|khoảng cách giàu nghèo|The gap between rich and poor is widening.|Society
standard of living|/ˈstændəd əv ˈlɪvɪŋ/|n|mức sống|The standard of living has risen.|Society
cost of living|/kɒst əv ˈlɪvɪŋ/|n|chi phí sinh hoạt|The cost of living is a real burden.|Society
ageing population|/ˈeɪdʒɪŋ ˌpɒpjuˈleɪʃn/|n|dân số già hoá|Japan has an ageing population.|Society
crime rate|/kraɪm reɪt/|n|tỷ lệ tội phạm|The crime rate has fallen.|Society
equality|/iˈkwɒləti/|n|sự bình đẳng|Equality of opportunity matters.|Society
discrimination|/dɪˌskrɪmɪˈneɪʃn/|n|sự phân biệt đối xử|Age discrimination still exists.|Society
volunteer|/ˌvɒlənˈtɪə(r)/|n/v|tình nguyện viên; làm tình nguyện|She volunteers at a shelter.|Society
cultural heritage|/ˈkʌltʃərəl ˈherɪtɪdʒ/|n|di sản văn hoá|Hoi An protects its cultural heritage.|Culture
tourist attraction|/ˈtʊərɪst əˈtrækʃn/|n|điểm du lịch|Ba Na Hills is a major tourist attraction.|Culture
globalisation|/ˌɡləʊbəlaɪˈzeɪʃn/|n|toàn cầu hoá|Globalisation affects local culture.|Culture
tradition|/trəˈdɪʃn/|n|truyền thống|Tet is an old tradition.|Culture
scenery|/ˈsiːnəri/|n|phong cảnh|The scenery is breathtaking.|Culture
landmark|/ˈlændmɑːk/|n|địa danh nổi tiếng|The Dragon Bridge is a landmark.|Culture
cuisine|/kwɪˈziːn/|n|ẩm thực|Vietnamese cuisine is famous worldwide.|Culture
advertising|/ˈædvətaɪzɪŋ/|n|quảng cáo|Advertising influences children.|Media
the media|/ðə ˈmiːdiə/|n|giới truyền thông|The media shapes public opinion.|Media
censorship|/ˈsensəʃɪp/|n|sự kiểm duyệt|Censorship limits free speech.|Media
influence|/ˈɪnfluəns/|n/v|ảnh hưởng|Celebrities influence young people.|Media
entertainment|/ˌentəˈteɪnmənt/|n|giải trí|Streaming has changed entertainment.|Media
increase sharply|/ɪnˈkriːs ˈʃɑːpli/|phr|tăng mạnh|Sales increased sharply in 2019.|Task1
decline gradually|/dɪˈklaɪn ˈɡrædʒuəli/|phr|giảm dần|Numbers declined gradually after 2010.|Task1
fluctuate|/ˈflʌktʃueɪt/|v|dao động|Prices fluctuated over the decade.|Task1
remain stable|/rɪˈmeɪn ˈsteɪbl/|phr|giữ ổn định|The figure remained stable at 20%.|Task1
peak at|/piːk æt/|phr|đạt đỉnh ở mức|Sales peaked at 500 units.|Task1
reach a low of|/riːtʃ ə ləʊ əv/|phr|chạm đáy ở mức|It reached a low of 12%.|Task1
account for|/əˈkaʊnt fɔː(r)/|phr v|chiếm (tỷ lệ)|Cars accounted for 40% of trips.|Task1
approximately|/əˈprɒksɪmətli/|adv|khoảng chừng|Approximately one third chose option A.|Task1
significantly|/sɪɡˈnɪfɪkəntli/|adv|một cách đáng kể|Costs rose significantly after 2018.|Task1
slightly|/ˈslaɪtli/|adv|một chút|The figure fell slightly.|Task1
the highest proportion|/ðə ˈhaɪɪst prəˈpɔːʃn/|phr|tỷ lệ cao nhất|Germany had the highest proportion.|Task1
by contrast|/baɪ ˈkɒntrɑːst/|phr|trái lại|By contrast, exports fell.|Task1
overall|/ˌəʊvərˈɔːl/|adv|nhìn chung|Overall, the trend was upward.|Task1
undergo|/ˌʌndəˈɡəʊ/|v|trải qua (quá trình)|The area underwent major changes.|Task1
consequence|/ˈkɒnsɪkwəns/|n|hậu quả|This has long-term consequences.|Task2
drawback|/ˈdrɔːbæk/|n|nhược điểm|The main drawback is the cost.|Task2
solution|/səˈluːʃn/|n|giải pháp|One solution is higher fuel taxes.|Task2
contribute to|/kənˈtrɪbjuːt tuː/|phr v|góp phần gây ra|Traffic contributes to air pollution.|Task2
play a vital role in|/pleɪ ə ˈvaɪtl rəʊl/|phr|đóng vai trò quan trọng|Parents play a vital role in education.|Task2
be responsible for|/rɪˈspɒnsəbl fɔː/|phr|chịu trách nhiệm cho|Factories are responsible for most waste.|Task2
address the issue|/əˈdres ði ˈɪʃuː/|phr|giải quyết vấn đề|Governments must address this issue.|Task2
implement a policy|/ˈɪmplɪment ə ˈpɒləsi/|phr|thực thi chính sách|The city implemented a new policy.|Task2
raise awareness|/reɪz əˈweənəs/|phr|nâng cao nhận thức|Campaigns raise public awareness.|Task2
from my perspective|/frəm maɪ pəˈspektɪv/|phr|theo quan điểm của tôi|From my perspective, both matter.|Task2
it is widely believed that|/ˈwaɪdli bɪˈliːvd/|phr|người ta tin rằng|It is widely believed that money brings happiness.|Task2
outweigh|/ˌaʊtˈweɪ/|v|lớn hơn, vượt trội|The benefits outweigh the drawbacks.|Task2
inevitable|/ɪnˈevɪtəbl/|adj|không thể tránh khỏi|Some change is inevitable.|Task2
controversial|/ˌkɒntrəˈvɜːʃl/|adj|gây tranh cãi|This is a controversial topic.|Task2
off the top of my head|/ɒf ðə tɒp əv maɪ hed/|idiom|nghĩ ngay ra được|Off the top of my head, around twenty.|Speaking
a huge fan of|/ə hjuːdʒ fæn əv/|phr|rất mê cái gì|I'm a huge fan of street food.|Speaking
to be honest|/tə bi ˈɒnɪst/|phr|thật lòng mà nói|To be honest, I rarely do that.|Speaking
it depends on|/ɪt dɪˈpendz ɒn/|phr|còn tuỳ vào|It depends on the weather.|Speaking
I'd say|/aɪd seɪ/|phr|tôi cho là|I'd say about half of them.|Speaking
that's a tough one|/ðæts ə tʌf wʌn/|phr|câu đó khó đấy|That's a tough one, let me think.|Speaking
I'm into|/aɪm ˈɪntuː/|phr|tôi mê cái gì|I'm really into photography.|Speaking
now that I think about it|/naʊ ðət aɪ θɪŋk əˈbaʊt ɪt/|phr|giờ nghĩ lại thì|Now that I think about it, yes.|Speaking
more often than not|/mɔːr ˈɒfn ðən nɒt/|phr|thường là|More often than not, I stay in.|Speaking
used to|/ˈjuːst tuː/|phr|từng (trong quá khứ)|I used to play football a lot.|Speaking
tend to|/tend tuː/|phr|có xu hướng|I tend to study late at night.|Speaking
as far as I'm concerned|/əz fɑːr əz aɪm kənˈsɜːnd/|phr|theo như tôi thấy|As far as I'm concerned, it works.|Speaking
upbringing|/ˈʌpbrɪŋɪŋ/|n|sự nuôi dạy|He had a strict upbringing.|Family
nuclear family|/ˈnjuːkliə ˈfæməli/|n|gia đình hạt nhân|Nuclear families are now the norm.|Family
extended family|/ɪkˈstendɪd ˈfæməli/|n|gia đình nhiều thế hệ|I grew up in an extended family.|Family
generation gap|/ˌdʒenəˈreɪʃn ɡæp/|n|khoảng cách thế hệ|The generation gap causes conflict.|Family
role model|/rəʊl ˈmɒdl/|n|hình mẫu để noi theo|Parents are the first role models.|Family
discipline|/ˈdɪsəplɪn/|n|tính kỷ luật, kỷ luật|Learning a language takes discipline.|Family
independent|/ˌɪndɪˈpendənt/|adj|độc lập, tự lập|Children should become independent.|Family
commit a crime|/kəˈmɪt ə kraɪm/|phr|phạm tội|He committed a serious crime.|Crime
punishment|/ˈpʌnɪʃmənt/|n|hình phạt|Harsh punishment does not always work.|Crime
deterrent|/dɪˈterənt/|n|biện pháp răn đe|Fines act as a deterrent.|Crime
rehabilitation|/ˌriːəˌbɪlɪˈteɪʃn/|n|sự cải tạo, phục hồi|Prisons should focus on rehabilitation.|Crime
law enforcement|/lɔː ɪnˈfɔːsmənt/|n|việc thực thi pháp luật|Law enforcement needs more funding.|Crime
income|/ˈɪnkʌm/|n|thu nhập|Low-income families struggle most.|Money
expenditure|/ɪkˈspendɪtʃə(r)/|n|khoản chi tiêu|Household expenditure rose in 2020.|Money
inflation|/ɪnˈfleɪʃn/|n|lạm phát|Inflation reduces purchasing power.|Money
economic growth|/ˌiːkəˈnɒmɪk ɡrəʊθ/|n|tăng trưởng kinh tế|Economic growth slowed last year.|Money
afford|/əˈfɔːd/|v|đủ khả năng chi trả|I can't afford a new laptop.|Money
invest in|/ɪnˈvest ɪn/|v|đầu tư vào|Governments should invest in education.|Money
poverty|/ˈpɒvəti/|n|sự nghèo đói|Millions still live in poverty.|Money
budget|/ˈbʌdʒɪt/|n|ngân sách|The project went over budget.|Money
physical activity|/ˈfɪzɪkl ækˈtɪvəti/|n|hoạt động thể chất|Daily physical activity is vital.|Sport
competitive|/kəmˈpetətɪv/|adj|có tính cạnh tranh|Sport makes children competitive.|Sport
teamwork|/ˈtiːmwɜːk/|n|làm việc nhóm|Team sports teach teamwork.|Sport
leisure time|/ˈleʒə taɪm/|n|thời gian rảnh rỗi|People have less leisure time now.|Sport
take up|/teɪk ʌp/|phr v|bắt đầu (sở thích mới)|I took up swimming last year.|Sport
accommodation|/əˌkɒməˈdeɪʃn/|n|chỗ ở|Student accommodation is expensive.|Housing
rural area|/ˈrʊərəl ˈeəriə/|n|vùng nông thôn|Young people leave rural areas.|Housing
urban area|/ˈɜːbən ˈeəriə/|n|khu vực đô thị|Urban areas are growing fast.|Housing
residential|/ˌrezɪˈdenʃl/|adj|thuộc khu dân cư|It is a quiet residential street.|Housing
overcrowded|/ˌəʊvəˈkraʊdɪd/|adj|quá đông đúc|The city centre is overcrowded.|Housing
facilities|/fəˈsɪlətiz/|n|cơ sở vật chất, tiện ích|The area lacks basic facilities.|Housing
commute|/kəˈmjuːt/|n/v|đi lại hằng ngày|My commute takes an hour.|Travel
destination|/ˌdestɪˈneɪʃn/|n|điểm đến|Da Nang is a popular destination.|Travel
broaden your horizons|/ˈbrɔːdn jɔː həˈraɪznz/|phr|mở mang tầm nhìn|Travelling broadens your horizons.|Travel
budget airline|/ˈbʌdʒɪt ˈeəlaɪn/|n|hãng bay giá rẻ|Budget airlines made travel accessible.|Travel
`;

function slug(word: string) {
  return word
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseTier(raw: string, tier: 1 | 2 | 3): VocabWord[] {
  const seen = new Set<string>();
  return raw
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const [word = "", ipa = "", pos = "", meaning = "", example = "", topic = ""] =
        line.split("|");
      let id = `v${tier}-${slug(word)}`;
      let n = 2;
      while (seen.has(id)) id = `v${tier}-${slug(word)}-${n++}`;
      seen.add(id);
      return { id, word, ipa, pos, meaning, example, topic, tier };
    });
}

export const VOCAB_TIER_1 = parseTier(TIER_1, 1);
export const VOCAB_TIER_2 = parseTier(TIER_2, 2);
export const VOCAB_TIER_3 = parseTier(TIER_3, 3);
export const VOCAB_WORDS: VocabWord[] = [...VOCAB_TIER_1, ...VOCAB_TIER_2, ...VOCAB_TIER_3];

export const VOCAB_BY_TIER: Record<1 | 2 | 3, VocabWord[]> = {
  1: VOCAB_TIER_1,
  2: VOCAB_TIER_2,
  3: VOCAB_TIER_3,
};

export const VOCAB_NODE_BY_TIER: Record<1 | 2 | 3, string> = { 1: "v-1", 2: "v-2", 3: "v-3" };
export const VOCAB_TIER_BY_NODE: Record<string, 1 | 2 | 3> = { "v-1": 1, "v-2": 2, "v-3": 3 };

/** Tầng sau mở khi tầng trước sáng >= 75% (có thể mở sớm trong Cài đặt). */
export const TIER_UNLOCK_RATIO = 0.75;

function toCard(w: VocabWord): FlashCard {
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

const THEORY: Record<1 | 2 | 3, string[]> = {
  1: [
    "Mặt trước là từ và phiên âm — bấm loa để nghe giọng Anh-Anh trước khi lật thẻ.",
    "Chấm thật thà: Quên / Mơ hồ / Nhớ rõ. Chấm dễ dãi thì sao sáng giả.",
    "Nhớ rõ liên tục thì lịch ôn giãn ra 1 – 3 – 8 – 21 – 58 ngày.",
  ],
  2: [
    "Tầng 2 nâng cấp diễn đạt: phrasal verb, danh từ trừu tượng và từ nối.",
    "Mỗi phiên 8 thẻ, thẻ đầu luôn là thẻ bạn đã thuộc để khởi động nhẹ nhàng.",
    "Thẻ quên sẽ quay lại ngay cuối phiên.",
  ],
  3: [
    "Tầng 3 là từ vựng học thuật theo chủ đề IELTS: Education, Environment, Task 1, Task 2, Speaking...",
    "Ưu tiên dùng lại từ trong bài viết và bài nói của bạn ngay trong ngày.",
    "Sao sáng theo số từ đạt khoảng ôn từ 21 ngày trở lên.",
  ],
};

export const VOCABULARY_DECKS: DeckLesson[] = ([1, 2, 3] as const).map((tier) => ({
  kind: "deck",
  nodeId: VOCAB_NODE_BY_TIER[tier],
  theory: THEORY[tier],
  cards: VOCAB_BY_TIER[tier].map(toCard),
}));
