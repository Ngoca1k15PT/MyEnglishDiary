/**
 * Đẩy media khoá học lên Cloud Storage.
 *
 * Chỉ các object dưới tiền tố `course/` được đặt ACL công khai. Bucket này dùng
 * chung với app iOS "My English" — thư mục `audio/` của nó KHÔNG bị đụng tới và
 * vẫn riêng tư. Đừng bật uniform bucket-level access cho bucket này, vì làm vậy
 * là mất khả năng phân quyền theo từng file và buộc phải mở công khai cả bucket.
 *
 * Chạy: npm run deploy:course-media
 */
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";

const BUCKET = "my-english-14fa9.firebasestorage.app";
const PREFIX = "course/";
const ROOT = path.join(process.cwd(), "public/course");
const CONCURRENCY = 8;
const TYPE = { ".pdf": "application/pdf", ".m4a": "audio/mp4", ".mp3": "audio/mpeg" };

/** Ưu tiên gcloud; không có thì mượn phiên đăng nhập của firebase-tools. */
async function accessToken() {
  try {
    return execSync("gcloud auth print-access-token", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim();
  } catch {
    /* không có gcloud, thử firebase-tools */
  }
  const cfg = path.join(os.homedir(), ".config/configstore/firebase-tools.json");
  if (!fs.existsSync(cfg)) {
    throw new Error("Chưa đăng nhập. Chạy `firebase login` hoặc `gcloud auth login` trước.");
  }
  const refresh = JSON.parse(fs.readFileSync(cfg, "utf8"))?.tokens?.refresh_token;
  if (!refresh) throw new Error("Không tìm thấy refresh token — chạy lại `firebase login`.");
  // Client id/secret công khai của firebase-tools, không phải bí mật.
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
      client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
      refresh_token: refresh,
      grant_type: "refresh_token",
    }),
  });
  const j = await res.json();
  if (!j.access_token) throw new Error("Không đổi được token: " + JSON.stringify(j).slice(0, 200));
  return j.access_token;
}

function listFiles(dir) {
  const out = [];
  (function walk(d) {
    for (const e of fs.readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      e.isDirectory() ? walk(p) : out.push(p);
    }
  })(dir);
  return out.sort();
}

if (!fs.existsSync(ROOT)) {
  console.error(`Không thấy ${ROOT}. Chạy \`npm run ingest:course\` trước.`);
  process.exit(1);
}

const token = await accessToken();
const files = listFiles(ROOT);
const total = files.reduce((s, f) => s + fs.statSync(f).size, 0);
console.log(
  `Đẩy ${files.length} file · ${(total / 1024 / 1024).toFixed(1)} MB → gs://${BUCKET}/${PREFIX}`,
);

let done = 0;
let sent = 0;
const failed = [];
const started = Date.now();

async function upload(local) {
  const rel = path.relative(ROOT, local).split(path.sep).join("/");
  const body = fs.readFileSync(local);
  const contentType = TYPE[path.extname(local)] ?? "application/octet-stream";

  // Phải dùng uploadType=multipart để gửi kèm metadata. Với uploadType=media,
  // GCS BỎ QUA header cache-control và object sẽ nhận mặc định 1 giờ — trình
  // duyệt tải lại liên tục và tiền băng thông đội lên đúng chỗ mình định tiết kiệm.
  const meta = {
    cacheControl: "public, max-age=31536000, immutable",
    contentType,
  };
  const boundary = "bdi" + Math.random().toString(36).slice(2);
  const multipart = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\ncontent-type: application/json; charset=UTF-8\r\n\r\n` +
        JSON.stringify(meta) +
        `\r\n--${boundary}\r\ncontent-type: ${contentType}\r\n\r\n`,
    ),
    body,
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const url =
    `https://storage.googleapis.com/upload/storage/v1/b/${BUCKET}/o` +
    `?uploadType=multipart&name=${encodeURIComponent(PREFIX + rel)}&predefinedAcl=publicRead`;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: {
          authorization: "Bearer " + token,
          "content-type": `multipart/related; boundary=${boundary}`,
        },
        body: multipart,
        signal: AbortSignal.timeout(180_000),
      });
      if (r.ok) {
        done++;
        sent += body.length;
        if (done % 50 === 0) {
          const s = ((Date.now() - started) / 1000).toFixed(0);
          console.log(`  ${done}/${files.length} · ${(sent / 1024 / 1024).toFixed(0)} MB · ${s}s`);
        }
        return;
      }
      if (attempt === 2) failed.push([rel, r.status, (await r.text()).slice(0, 120)]);
    } catch (e) {
      if (attempt === 2) failed.push([rel, "network", String(e).slice(0, 80)]);
    }
  }
}

let next = 0;
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (next < files.length) await upload(files[next++]);
  }),
);

const secs = ((Date.now() - started) / 1000).toFixed(0);
console.log(`\nXong ${done}/${files.length} · ${(sent / 1024 / 1024).toFixed(1)} MB · ${secs}s`);
if (failed.length) {
  console.error(`Lỗi ${failed.length} file:`);
  failed.slice(0, 10).forEach((f) => console.error("  ✗", ...f));
  process.exit(1);
}
