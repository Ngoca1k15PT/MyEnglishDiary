#!/usr/bin/env node
/**
 * Ingest a folder of course material (PDF + MP3) into `public/course/<id>` and
 * emit a manifest at `src/data/courses/<id>.json`.
 *
 * Layout expected in the source folder: <Section>/<Lesson>/[<Group>/]<file>
 * Deeper nesting is folded into the group label. Container folders whose name
 * only means "audio here" or "material here" (File nghe, Audio, Tài liệu) are
 * dropped from the group label so exercise folders stay meaningful.
 *
 *   node scripts/ingest-course.mjs --src "<dir>" --id my-course --title "My course"
 *
 * Flags:
 *   --copy          real copies instead of hardlinks
 *   --force         rewrite files that already exist
 *   --audio <rate>  transcode audio to mono AAC (.m4a) at <rate>, e.g. 48k.
 *                   Lecture audio is usually stereo-encoded speech, so mono AAC
 *                   cuts it by ~4x — worth it when serving from a bucket.
 */
import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  attachAnswers,
  examSeconds,
  examShape,
  hasPdfSupport,
  nfc,
  parseQuestions,
  pdfText,
  positionalKey,
  selectQuestions,
} from "./lib/course-pdf.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const MEDIA_EXT = new Set([".pdf", ".mp3", ".m4a", ".mp4", ".png", ".jpg", ".jpeg", ".webp"]);
const AUDIO_EXT = new Set([".mp3", ".m4a"]);

function parseArgs(argv) {
  const out = { copy: false, force: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--copy") out.copy = true;
    else if (a === "--force") out.force = true;
    else if (a.startsWith("--")) out[a.slice(2)] = argv[++i];
  }
  return out;
}

const DIACRITICS = {
  đ: "d",
  Đ: "D",
};

/** Vietnamese-aware ASCII fold: NFD strips tone marks, the map handles đ/Đ. */
function fold(input) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, (c) => DIACRITICS[c])
    .toLowerCase();
}

function slug(input, fallback = "x") {
  const s = fold(input)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return s || fallback;
}

/** Natural order so "9." sorts before "10." and "Câu 4 - 6" before "Câu 10 - 12". */
const collator = new Intl.Collator("vi", { numeric: true, sensitivity: "base" });

function naturalSort(a, b) {
  return collator.compare(a, b);
}

/** "01. (Part 1). Photo of people" -> { order: "01", title: "(Part 1). Photo of people" } */
function splitOrder(name) {
  const clean = nfc(name).trim();
  const m = /^(\d+(?:\.\d+)*)\s*[.)\-–]*\s*(.*)$/.exec(clean);
  if (!m || !m[2]) return { order: null, title: clean };
  return { order: m[1], title: m[2].trim() };
}

/** Folders that only signal "media lives here" — dropped from the group label. */
function isContainerFolder(name) {
  const f = fold(name).trim();
  return /^(file\s*)?nghe\b/.test(f) || /^audio\b/.test(f) || /^tai\s*lieu\b/.test(f);
}

/**
 * Kind drives the reader tabs: answers are hidden until asked for, questions and
 * theory sit side by side.
 */
function classify(ext, stem) {
  if (AUDIO_EXT.has(ext)) return "audio";
  if (!MEDIA_EXT.has(ext)) return "other";
  if (ext !== ".pdf") return "image";

  const f = fold(stem).trim();
  if (/^(da|dap\s*an)([\s.\-_(]|$)/.test(f) || /\bkey\b/.test(f)) return "answer";
  if (/^de([\s.\-_(]|pdf|$)/.test(f)) return "question";
  if (/(thi\s*online|bai\s*thi|practice|practive|exercise)/.test(f)) return "question";
  if (/^bt\s*\d/.test(f)) return "question";
  return "theory";
}

/** MP3 stems in this pack often keep a stray ".mp3" mid-name ("BT 1.mp3 (01)"). */
function cleanLabel(stem) {
  return (
    nfc(stem)
      .replace(/\.(mp3|pdf|m4a)\b/gi, "")
      .replace(/\s+/g, " ")
      .trim() || nfc(stem)
  );
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else if (MEDIA_EXT.has(path.extname(entry.name).toLowerCase())) out.push(full);
  }
  return out;
}

/** Apple's AudioToolbox encoder beats ffmpeg's native AAC; fall back when absent. */
const AAC_ENCODER = (() => {
  try {
    const list = execFileSync("ffmpeg", ["-hide_banner", "-encoders"], { encoding: "utf8" });
    return list.includes("aac_at") ? "aac_at" : "aac";
  } catch {
    return null;
  }
})();

function transcodeAudio(srcFile, destFile, bitrate) {
  execFileSync(
    "ffmpeg",
    [
      "-hide_banner",
      "-loglevel",
      "error",
      "-y",
      "-i",
      srcFile,
      "-vn",
      "-ac",
      "1",
      "-ar",
      "44100",
      "-c:a",
      AAC_ENCODER,
      "-b:a",
      bitrate,
      "-movflags",
      "+faststart",
      destFile,
    ],
    { stdio: ["ignore", "ignore", "pipe"] },
  );
}

function place(srcFile, destFile, { copy, force, audio }) {
  const srcStat = fs.statSync(srcFile);
  const transcode = Boolean(audio) && AUDIO_EXT.has(path.extname(srcFile).toLowerCase());

  if (!force && fs.existsSync(destFile)) {
    const destStat = fs.statSync(destFile);
    // Transcoded output has a different size by design, so trust the mtime instead.
    const unchanged = transcode
      ? destStat.mtimeMs >= srcStat.mtimeMs
      : destStat.size === srcStat.size;
    if (unchanged) return { bytes: destStat.size, skipped: true };
  }

  fs.mkdirSync(path.dirname(destFile), { recursive: true });
  fs.rmSync(destFile, { force: true });

  if (transcode) {
    transcodeAudio(srcFile, destFile, audio);
  } else if (copy) {
    fs.copyFileSync(srcFile, destFile);
  } else {
    try {
      fs.linkSync(srcFile, destFile);
    } catch {
      fs.copyFileSync(srcFile, destFile);
    }
  }

  return { bytes: fs.statSync(destFile).size, skipped: false };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (!args.src || !args.id) {
    console.error(
      'Usage: node scripts/ingest-course.mjs --src "<dir>" --id <course-id> [--title "..."]',
    );
    process.exit(1);
  }

  const src = path.resolve(args.src);
  if (!fs.existsSync(src)) {
    console.error(`Source not found: ${src}`);
    process.exit(1);
  }
  if (args.audio && !AAC_ENCODER) {
    console.error("--audio needs ffmpeg on PATH");
    process.exit(1);
  }
  if (!hasPdfSupport) {
    console.warn("pdfjs-dist not installed — answer sheets and review cards will be skipped");
  }

  const courseId = slug(args.id);
  const publicBase = path.join(ROOT, "public", "course", courseId);
  const files = walk(src).sort(naturalSort);

  // sectionSlug -> { title, order, lessons: Map<lessonSlug, lesson> }
  const sections = new Map();
  let placedBytes = 0;
  let placed = 0;
  let skippedFiles = 0;
  const usedPaths = new Set();

  for (const file of files) {
    const rel = path.relative(src, file);
    const segments = rel.split(path.sep);
    if (segments.length < 2) {
      skippedFiles++;
      continue; // loose file at the root: no section/lesson to attach it to
    }

    const [sectionName, lessonName, ...rest] = segments;
    const fileName = rest.pop();
    const ext = path.extname(fileName).toLowerCase();
    const stem = path.basename(fileName, path.extname(fileName));

    const sectionSlug = slug(sectionName);
    if (!sections.has(sectionSlug)) {
      const { order, title } = splitOrder(sectionName);
      sections.set(sectionSlug, { id: sectionSlug, title, order, lessons: new Map() });
    }
    const section = sections.get(sectionSlug);

    const lessonSlug = slug(lessonName);
    if (!section.lessons.has(lessonSlug)) {
      const { order, title } = splitOrder(lessonName);
      section.lessons.set(lessonSlug, {
        id: `${sectionSlug}/${lessonSlug}`,
        slug: lessonSlug,
        title,
        order,
        sortKey: lessonName,
        groups: new Map(),
      });
    }
    const lesson = section.lessons.get(lessonSlug);

    const groupParts = rest.filter((s) => !isContainerFolder(s)).map(nfc);
    const groupTitle = groupParts.join(" / ") || null;
    const groupKey = groupTitle ?? "";
    if (!lesson.groups.has(groupKey)) {
      lesson.groups.set(groupKey, { title: groupTitle, items: [] });
    }
    const group = lesson.groups.get(groupKey);

    // Mirror the source shape in the URL so collisions are structural, not accidental.
    const outExt = args.audio && AUDIO_EXT.has(ext) ? ".m4a" : ext;
    const dirParts = [sectionSlug, lessonSlug, ...groupParts.map((p) => slug(p))];
    let relPublic = [...dirParts, `${slug(stem, "file")}${outExt}`].join("/");
    if (usedPaths.has(relPublic)) {
      const tag = createHash("sha1").update(rel).digest("hex").slice(0, 6);
      relPublic = [...dirParts, `${slug(stem, "file")}-${tag}${outExt}`].join("/");
    }
    usedPaths.add(relPublic);

    const { bytes, skipped } = place(file, path.join(publicBase, relPublic), args);
    placedBytes += bytes;
    if (!skipped) placed++;

    group.items.push({
      kind: classify(ext, stem),
      label: cleanLabel(stem),
      src: relPublic,
      bytes,
      sortKey: fileName,
    });
  }

  const KIND_ORDER = { theory: 0, question: 1, answer: 2, audio: 3, image: 4, other: 5 };
  const stats = { sections: 0, lessons: 0, docs: 0, audios: 0, bytes: placedBytes };

  const sectionList = [...sections.values()]
    .sort((a, b) => naturalSort(a.id, b.id))
    .map((section) => {
      const lessons = [...section.lessons.values()]
        .sort((a, b) => naturalSort(a.sortKey, b.sortKey))
        .map((lesson) => {
          const groups = [...lesson.groups.values()]
            .sort((a, b) => naturalSort(a.title ?? "", b.title ?? ""))
            .map((group) => ({
              title: group.title,
              items: group.items
                .sort(
                  (a, b) =>
                    KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || naturalSort(a.sortKey, b.sortKey),
                )
                .map(({ sortKey: _sortKey, ...item }) => item),
            }));
          for (const g of groups) {
            for (const it of g.items) {
              if (it.kind === "audio") stats.audios++;
              else stats.docs++;
            }
          }
          stats.lessons++;
          const { sortKey: _sortKey, groups: _groups, ...rest } = lesson;
          return { ...rest, groups };
        });
      stats.sections++;
      const { lessons: _lessons, ...rest } = section;
      return { ...rest, lessons };
    });

  // Second pass: read the shape of each practice test, and where the answer key
  // is machine-readable, the individual questions too.
  let exams = 0;
  let questionCount = 0;
  let keyed = 0;
  const bank = {};

  for (const section of sectionList) {
    for (const lesson of section.lessons) {
      for (const [index, group] of lesson.groups.entries()) {
        // The two PDFs are authoritative about different things: the answer key
        // covers every question so its count is trustworthy, while the time
        // limit is only printed on the question paper.
        const read = async (kind) => {
          const item = group.items.find((i) => i.kind === kind);
          return item
            ? pdfText(path.join(publicBase, item.src))
            : { text: "", firstPage: "", rows: [], marks: [] };
        };
        const answer = await read("answer");
        const question = await read("question");

        const shape = examShape(answer.text) ?? examShape(question.text);
        if (!shape) continue;
        const seconds = examSeconds(question.firstPage) ?? examSeconds(answer.firstPage);
        group.exam = seconds ? { ...shape, seconds } : shape;
        exams++;

        // The key and the card set are independent: a test can have every answer
        // recovered while none of its questions works as a standalone flashcard.
        const parsed = attachAnswers(parseQuestions(answer.rows, answer.marks), answer.marks);
        const key = positionalKey(parsed, shape.questions);
        if (key) {
          group.exam.key = key;
          keyed++;
        }

        const selected = selectQuestions(parsed, shape.questions);
        if (selected.questions) {
          bank[`${lesson.id}:${index}`] = selected.questions;
          questionCount += selected.questions.length;
          group.exam.cards = selected.questions.length;
        }
      }
    }
  }

  const manifest = {
    id: courseId,
    title: args.title ?? courseId,
    base: `/course/${courseId}`,
    generatedAt: new Date().toISOString(),
    stats: { ...stats, exams },
    sections: sectionList,
  };

  const outFile = path.join(ROOT, "src", "data", "courses", `${courseId}.json`);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, `${JSON.stringify(manifest, null, 2)}\n`);

  // Kept out of the manifest and loaded on demand: it is several times larger
  // and only needed once a test has actually been graded.
  const bankFile = path.join(ROOT, "src", "data", "courses", `${courseId}.questions.json`);
  fs.writeFileSync(bankFile, `${JSON.stringify(bank)}\n`);

  const mb = (n) => `${(n / 1024 / 1024).toFixed(1)} MB`;
  console.log(`course     ${courseId}`);
  console.log(`sections   ${stats.sections}`);
  console.log(`lessons    ${stats.lessons}`);
  console.log(`documents  ${stats.docs}`);
  console.log(`audio      ${stats.audios}`);
  console.log(`exams      ${exams} group(s) with a detected question count`);
  console.log(
    `questions  ${questionCount} extracted from ${Object.keys(bank).length} answer key(s)`,
  );
  console.log(`keys       ${keyed} exam(s) with a complete answer key recovered`);
  console.log(`media      ${mb(stats.bytes)} -> public/course/${courseId}`);
  console.log(`manifest   ${path.relative(ROOT, outFile)}`);
  console.log(`questions  ${path.relative(ROOT, bankFile)}`);
  if (placed) console.log(`${args.copy ? "copied" : "linked"}     ${placed} new file(s)`);
  if (skippedFiles) console.log(`ignored    ${skippedFiles} file(s) outside Section/Lesson depth`);
}

await main();
