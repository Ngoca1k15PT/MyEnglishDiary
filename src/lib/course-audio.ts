import type { CourseItem } from "@/data/course-types";

/**
 * Works out which questions each recording covers, from its file name.
 *
 * These packs name listening files three ways: a bare number for one question
 * ("07.mp3", "01-1.mp3"), a range for a Part 4 talk ("Câu 7 - 9.mp3"), or nothing
 * positional at all for a whole-test recording ("Test 01_mp3.mp3"). The last kind
 * is left unmapped rather than guessed at.
 */
export function audioByQuestion(items: CourseItem[], questions: number) {
  const out = new Map<number, CourseItem>();

  for (const item of items) {
    if (item.kind !== "audio") continue;
    const label = item.label.trim();

    // "Câu 7 - 9", "câu 10 - 12", "Câu 1- 3"
    const range = /^c[âa]u\s*(\d{1,3})\s*[-–]\s*(\d{1,3})/i.exec(label);
    if (range) {
      const from = +range[1]!;
      const to = +range[2]!;
      for (let n = from; n <= to && n <= questions; n++) out.set(n, item);
      continue;
    }

    // "07", "01-1", "01 (1)", "Câu 5"
    const single = /^(?:c[âa]u\s*)?0*(\d{1,3})\s*(?:[-(]|$)/i.exec(label);
    if (single) {
      const n = +single[1]!;
      if (n >= 1 && n <= questions && !out.has(n)) out.set(n, item);
    }
  }
  return out;
}
