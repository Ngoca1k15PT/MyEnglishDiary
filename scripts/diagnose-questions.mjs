#!/usr/bin/env node
/**
 * Reports why each practice test did or did not yield review cards, using the
 * same extraction code the ingest runs. Point it at a course id:
 *
 *   node scripts/diagnose-questions.mjs toeic-550-700-mai-phuong [--section part-5-6] [--verbose]
 */
import fs from "node:fs";
import path from "node:path";
import process from "node:process";

import {
  attachAnswers,
  parseQuestions,
  pdfText,
  positionalKey,
  selectQuestions,
} from "./lib/course-pdf.mjs";

const ROOT = path.resolve(import.meta.dirname, "..");
const [courseId, ...flags] = process.argv.slice(2);
if (!courseId) {
  console.error(
    "Usage: node scripts/diagnose-questions.mjs <course-id> [--section <id>] [--verbose]",
  );
  process.exit(1);
}
const only = flags.includes("--section") ? flags[flags.indexOf("--section") + 1] : null;
const verbose = flags.includes("--verbose");

const manifest = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src", "data", "courses", `${courseId}.json`), "utf8"),
);

const reasons = new Map();
const rows = [];

for (const section of manifest.sections) {
  if (only && section.id !== only) continue;
  for (const lesson of section.lessons) {
    for (const [index, group] of lesson.groups.entries()) {
      if (!group.exam) continue;
      const answer = group.items.find((i) => i.kind === "answer");
      const blank = { section: section.id, lesson, gaps: [], marks: 0, detail: "" };
      if (!answer) {
        rows.push({ ...blank, reason: "no-answer-pdf" });
        continue;
      }

      const { rows: lines, marks } = await pdfText(
        path.join(ROOT, "public", "course", courseId, answer.src),
      );
      if (lines.length === 0) {
        rows.push({ ...blank, reason: "no-text-layer", detail: "scanned" });
        continue;
      }

      const parsed = attachAnswers(parseQuestions(lines, marks), marks);
      const result = selectQuestions(parsed, group.exam.questions);
      const key = positionalKey(parsed, group.exam.questions);

      // Which positions of the key are missing, and why each one failed.
      const byNumber = new Map(parsed.map((q) => [q.n, q]));
      const gaps = [];
      for (let n = 1; n <= group.exam.questions; n++) {
        const q = byNumber.get(n);
        if (q?.answer) continue;
        gaps.push(
          !q
            ? `${n}:unparsed`
            : Object.keys(q.options).length === 0
              ? `${n}:no-options`
              : `${n}:no-tick`,
        );
      }

      rows.push({
        section: section.id,
        lesson,
        index,
        key,
        gaps,
        marks: marks.filter((m) => m.kind === "correct").length,
        reason: result.questions ? "ok" : result.reason,
        detail: result.questions ? `${result.questions.length} cards` : (result.detail ?? ""),
        parsed,
      });
    }
  }
}

for (const r of rows) reasons.set(r.reason, (reasons.get(r.reason) ?? 0) + 1);

console.log("reason                    count");
for (const [reason, n] of [...reasons].sort((a, b) => b[1] - a[1])) {
  console.log(`${reason.padEnd(25)} ${String(n).padStart(5)}`);
}

const keyed = rows.filter((r) => r.key).length;
console.log(`\nanswer keys: ${keyed}/${rows.length} complete`);
for (const r of rows.filter((r) => !r.key)) {
  console.log(
    `${r.section.padEnd(9)} ticks=${String(r.marks).padStart(3)} gaps=${r.gaps.length} [${r.gaps.slice(0, 8).join(" ")}${r.gaps.length > 8 ? " …" : ""}]  ${r.lesson.title.slice(0, 36)}`,
  );
}

console.log("\ncard failures by section:");
const failures = rows.filter((r) => r.reason !== "ok");
for (const r of failures) {
  console.log(
    `${r.section.padEnd(9)} ${r.reason.padEnd(24)} ${r.detail.padEnd(20)} ${r.lesson.title.slice(0, 40)}`,
  );
}

if (verbose) {
  for (const r of failures.slice(0, 3)) {
    console.log(`\n===== ${r.lesson.title} (${r.reason}: ${r.detail})`);
    for (const q of (r.parsed ?? []).slice(0, 6)) {
      console.log(
        `  [${q.n}] stem=${JSON.stringify(q.stem.slice(0, 80))} opts=${Object.keys(q.options).join("")} why=${q.why.length}`,
      );
    }
  }
}
