import { createFileRoute, Link } from "@tanstack/react-router";
import { handleExternalClick } from "@/lib/external-link";
import { handleWatchClick } from "@/components/video-player";
import { isYouTube } from "@/lib/youtube";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import { VERIFIED } from "@/data/study-links";

export const Route = createFileRoute("/nguon-tai-lieu")({
  head: () => ({
    meta: [
      { title: "Nguồn tài liệu — Bản đồ IELTS" },
      {
        name: "description",
        content:
          "Danh sách nguồn học IELTS miễn phí dùng trong Bản đồ IELTS: IELTS Nguyễn Huyền, BBC Learning English, IELTS Liz, British Council.",
      },
      { property: "og:title", content: "Nguồn tài liệu — Bản đồ IELTS" },
      {
        property: "og:description",
        content: "Toàn bộ nguồn học miễn phí được dẫn link trong Bản đồ IELTS.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResourcesPage,
});

type Group = {
  name: string;
  note: string;
  links: { label: string; url: string; desc: string }[];
};

const GROUPS: Group[] = [
  {
    name: "IELTS Nguyễn Huyền",
    note: "Tác giả của lộ trình 4 giai đoạn mà bản đồ này mô phỏng. Cảm ơn cô Huyền vì kho tài liệu tiếng Việt miễn phí.",
    links: [
      {
        label: "Video lộ trình gốc",
        url: VERIFIED.roadmapVideo,
        desc: "Video giải thích trọn lộ trình tự học.",
      },
      {
        label: "Kênh YouTube",
        url: VERIFIED.huyenChannel,
        desc: "Bài giảng và chữa đề theo từng kỹ năng.",
      },
      {
        label: "Vở học / take notes",
        url: VERIFIED.voHoc,
        desc: "Mẫu vở ghi chép đi kèm lộ trình.",
      },
      {
        label: "Giới thiệu tác giả",
        url: VERIFIED.aboutMe,
        desc: "Hành trình tự học từ 3.5 lên 8.5.",
      },
      {
        label: "Blog Listening",
        url: VERIFIED.blogListening,
        desc: "Chiến thuật nghe theo từng dạng.",
      },
      {
        label: "Listening Practice",
        url: VERIFIED.blogListeningPractice,
        desc: "Bài nghe luyện tập có chữa.",
      },
      { label: "Blog Reading", url: VERIFIED.blogReading, desc: "Chiến thuật đọc theo từng dạng." },
      {
        label: "Reading Practice",
        url: VERIFIED.blogReadingPractice,
        desc: "Bài đọc luyện tập có chữa.",
      },
      { label: "Blog Speaking", url: VERIFIED.blogSpeaking, desc: "Mẹo và bài mẫu nói." },
      { label: "Speaking Part 2", url: VERIFIED.blogSpeakingP2, desc: "Bài mẫu cue card." },
      { label: "Writing Task 1", url: VERIFIED.blogWriting1, desc: "Bài mẫu và từ vựng biểu đồ." },
      { label: "Writing Task 2", url: VERIFIED.blogWriting2, desc: "Dàn ý và bài mẫu luận." },
      { label: "Vocabulary", url: VERIFIED.blogVocab, desc: "Từ vựng theo chủ đề." },
      { label: "Paraphrasing", url: VERIFIED.blogParaphrase, desc: "Kỹ thuật diễn đạt lại." },
    ],
  },
  {
    name: "BBC Learning English",
    note: "Cảm ơn BBC Learning English vì bộ video phát âm miễn phí kinh điển.",
    links: [
      { label: "Playlist 44 âm", url: VERIFIED.bbc44, desc: "Dạy trọn bảng phiên âm quốc tế." },
      { label: "Kênh YouTube", url: VERIFIED.bbcChannel, desc: "Video học tiếng Anh hằng ngày." },
    ],
  },
  {
    name: "IELTS Liz",
    note: "Cảm ơn IELTS Liz vì các bài học tiếng Anh miễn phí cho từng dạng câu hỏi.",
    links: [
      { label: "Trang chủ", url: VERIFIED.lizHome, desc: "Tổng hợp bài học cả 4 kỹ năng." },
      { label: "Listening", url: VERIFIED.lizListening, desc: "Bài học và mẹo phần nghe." },
      { label: "Reading", url: VERIFIED.lizReading, desc: "Bài học miễn phí phần đọc." },
      { label: "Speaking", url: VERIFIED.lizSpeaking, desc: "Mẹo cốt lõi phần nói." },
      {
        label: "Chủ đề Speaking",
        url: VERIFIED.lizSpeakingTopics,
        desc: "Bộ chủ đề nói cập nhật.",
      },
    ],
  },
  {
    name: "British Council",
    note: "Cảm ơn British Council vì bộ đề luyện miễn phí sát đề thi thật.",
    links: [
      { label: "Đề luyện miễn phí", url: VERIFIED.bcTests, desc: "Đề đủ 4 kỹ năng, có đáp án." },
      { label: "Đề Reading", url: VERIFIED.bcReading, desc: "Đề đọc riêng theo từng passage." },
    ],
  },
  {
    name: "TOEIC — Cô Vũ Mai Phương",
    note: "Kênh và trang chính thức của cô Vũ Mai Phương, nội dung miễn phí. Web này chỉ dẫn link.",
    links: [
      {
        label: "YouTube TOEIC Cô Mai Phương",
        url: VERIFIED.mpToeicChannel,
        desc: "Bài giảng TOEIC theo từng Part.",
      },
      {
        label: "YouTube Cô Vũ Mai Phương Official",
        url: VERIFIED.mpOfficialChannel,
        desc: "Kênh chính thức, ngữ pháp và luyện nghe nói.",
      },
      {
        label: "Facebook 990 TOEIC",
        url: VERIFIED.mpFacebook,
        desc: "Mẹo làm bài và tài liệu miễn phí.",
      },
      {
        label: "Ứng dụng trên Google Play",
        url: VERIFIED.mpApp,
        desc: "App luyện TOEIC chính chủ.",
      },
    ],
  },
  {
    name: "Cambridge Dictionary",
    note: "Dùng để tra nghĩa, phiên âm và nghe phát âm chuẩn.",
    links: [
      {
        label: "Từ điển Cambridge",
        url: VERIFIED.cambridgeDict,
        desc: "Tra từ kèm phát âm Anh - Mỹ.",
      },
    ],
  },
];

function ResourcesPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-10 text-foreground md:px-10">
      <div className="mx-auto max-w-3xl">
        <Link
          to="/"
          className="inline-flex min-h-[44px] items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft size={16} /> Về bản đồ sao
        </Link>

        <h1 className="mt-4 text-3xl font-semibold">Nguồn tài liệu</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          Toàn bộ tài liệu dẫn trong Bản đồ IELTS đều là nội dung miễn phí của bên thứ ba. Web này
          chỉ dẫn link — mọi nội dung, bản quyền và công sức đều thuộc về tác giả gốc. Xin cảm ơn
          IELTS Nguyễn Huyền, BBC Learning English, IELTS Liz và British Council.
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Với những chủ đề không có link cố định, bản đồ dùng link tìm kiếm YouTube để bạn luôn thấy
          video mới nhất thay vì một video có thể bị gỡ. Video phát thẳng trong web này bằng trình
          phát chính thức của YouTube, nên lượt xem vẫn về đúng kênh của tác giả.
        </p>

        <div className="mt-6 space-y-2 rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
          <p>
            Các bài giảng miễn phí của cô Vũ Mai Phương có trên kênh YouTube và Facebook chính thức
            ở trên. Khoá học trả phí đầy đủ được bán độc quyền tại ngoaingu24h.vn.
          </p>
          <p>
            Nếu bạn có tài liệu riêng đã mua, hãy dùng mục “Tài liệu của tôi” trong Cài đặt để gắn
            link — chỉ bạn xem được, và bạn vừa xem vừa tự tạo thẻ bằng lời của mình. Ứng dụng này
            không chứa nội dung khoá học của bất kỳ ai; mọi nội dung học trong app đều được viết
            riêng cho ứng dụng.
          </p>
        </div>

        <div className="mt-10 space-y-10">
          {GROUPS.map((g) => (
            <section key={g.name}>
              <h2 className="text-xl font-semibold">{g.name}</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{g.note}</p>
              <div className="mt-4 flex flex-col gap-2">
                {g.links.map((l) => {
                  const inApp = isYouTube(l.url);
                  return (
                    <a
                      key={l.url}
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={
                        inApp
                          ? handleWatchClick(l.url, { title: l.label })
                          : handleExternalClick(l.url)
                      }
                      className="flex min-h-[44px] items-center justify-between gap-3 rounded-xl border border-border px-4 py-3 transition-colors hover:bg-accent"
                    >
                      <span>
                        <span className="block text-sm font-medium">{l.label}</span>
                        <span className="block text-xs text-muted-foreground">{l.desc}</span>
                      </span>
                      {inApp ? (
                        <Play
                          size={14}
                          aria-label="Phát trong web"
                          className="shrink-0 text-study-video"
                        />
                      ) : (
                        <ExternalLink size={14} className="shrink-0 text-muted-foreground" />
                      )}
                    </a>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
