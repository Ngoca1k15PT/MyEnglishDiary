/**
 * Reading practice-test PDFs: text extraction, exam shape, and per-question
 * splitting. Shared so the ingest script and the diagnostic report can never
 * drift apart — a probe that reimplements this logic will disagree with what
 * actually ships, which is exactly how a parsing bug hides.
 */
import fs from "node:fs";

const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs").catch(() => null);

export const hasPdfSupport = Boolean(pdfjs);

/**
 * macOS hands back decomposed (NFD) filenames, where "à" is "a" + a combining
 * mark. Everything downstream that pattern-matches Vietnamese text expects the
 * precomposed form.
 */
export function nfc(input) {
  return input.normalize("NFC");
}

/**
 * The fonts in these worksheets map their f-ligature glyphs to U+0000, so "office"
 * arrives as "o\0ce". One NUL can stand for fi, fl, ffi or ffl, and nothing in the
 * text says which — so the recurring words are listed and everything else falls
 * back to "fi", which covers the large majority (five, find, profits, financial).
 * Without this the text renders with holes in it.
 */
const LIGATURES = [
  ["o\u0000ce", "office"],
  ["o\u0000ine", "offline"],
  ["e\u0000cien", "efficien"],
  ["di\u0000cult", "difficult"],
  ["su\u0000cient", "sufficient"],
  ["tra\u0000c", "traffic"],
  ["sta\u0000ng", "staffing"],
  ["ra\u0000e", "raffle"],
  ["con\u0000ict", "conflict"],
  ["\u0000ying", "flying"],
  ["\u0000ight", "flight"],
  ["\u0000oor", "floor"],
  ["\u0000ow", "flow"],
];

export function fixLigatures(input) {
  if (!input.includes("\u0000")) return input;
  let out = input;
  for (const [broken, fixed] of LIGATURES) out = out.replaceAll(broken, fixed);
  return out.replaceAll("\u0000", "fi");
}

/**
 * Page furniture that would otherwise land inside a question. The bare-number
 * case must be anchored at both ends, or it would also swallow the "1." that
 * starts a question.
 */
function isPageNoise(s) {
  return /^(?:tài\s*liệu\s*ôn\s*thi|https?:\/\/|bit\.ly)/i.test(s) || /^(?:\d{1,3}|00:00)$/.test(s);
}

/** Same visual line when the baselines are this close. */
const ROW_TOLERANCE = 2;
/** Bigger horizontal gap than this means a real space, not a split word. */
const SPACE_GAP = 1.2;

/**
 * Rebuilds visual lines from positioned glyph runs.
 *
 * Some of these worksheets emit each Vietnamese diacritic as its own run, so
 * "phân từ" arrives as "phân t" + "ừ". Joining runs with a space turns that into
 * "phân t ừ"; the gap between a run's end (x + width) and the next run's start is
 * what says whether a space belongs there.
 */
function toLines(items, page) {
  const sorted = items
    .map((it) => ({ y: it.transform[5], x: it.transform[4], w: it.width ?? 0, s: it.str }))
    .filter((it) => it.s !== "")
    .sort((a, b) => b.y - a.y || a.x - b.x);

  const rows = [];
  for (const it of sorted) {
    const row = rows[rows.length - 1];
    if (row && Math.abs(row.y - it.y) <= ROW_TOLERANCE) row.items.push(it);
    else rows.push({ y: it.y, x: it.x, items: [it] });
  }

  return rows
    .map((row) => {
      let text = "";
      let cursor = null;
      for (const it of row.items) {
        if (cursor !== null && it.x - cursor > SPACE_GAP) text += " ";
        text += it.s;
        cursor = it.x + it.w;
      }
      return { s: fixLigatures(nfc(text)).replace(/\s+/g, " ").trim(), y: row.y, x: row.x, page };
    })
    .filter((row) => row.s && !isPageNoise(row.s));
}

/* -------------------------------------------------- answer marks */

const IDENTITY = [1, 0, 0, 1, 0, 0];

function multiply(a, b) {
  return [
    a[0] * b[0] + a[2] * b[1],
    a[1] * b[0] + a[3] * b[1],
    a[0] * b[2] + a[2] * b[3],
    a[1] * b[2] + a[3] * b[3],
    a[0] * b[4] + a[2] * b[5] + a[4],
    a[1] * b[4] + a[3] * b[5] + a[5],
  ];
}

/**
 * These keys mark the right option with a green tick bitmap, a wrong pick with a
 * red cross, and leave the rest an empty circle. Mean colour separates the three
 * cleanly — green (32,147,106), red (173,24,29), empty (0,0,0).
 */
function markKind(image) {
  if (!image?.data) return null;
  const step = image.kind === 3 ? 4 : image.kind === 2 ? 3 : 0;
  if (step === 0) return null;

  let r = 0;
  let g = 0;
  let b = 0;
  let n = 0;
  for (let p = 0; p + step <= image.data.length; p += step) {
    r += image.data[p];
    g += image.data[p + 1];
    b += image.data[p + 2];
    n++;
  }
  if (n === 0) return null;
  r /= n;
  g /= n;
  b /= n;
  if (g > r + 40 && g > b + 20) return "correct";
  if (r > g + 60 && r > b + 60) return "wrong";
  return "empty";
}

/**
 * Positions of the option markers on one page. The transform matrix has to be
 * tracked through save/restore because the marker's placement is what ties it to
 * an option row.
 */
async function pageMarks(page, pageNumber, ops, OPS) {
  const names = Object.fromEntries(Object.entries(OPS).map(([k, v]) => [v, k]));
  const found = [];
  let ctm = IDENTITY;
  const stack = [];

  for (let i = 0; i < ops.fnArray.length; i++) {
    const name = names[ops.fnArray[i]];
    if (name === "save") stack.push([...ctm]);
    else if (name === "restore") ctm = stack.pop() ?? IDENTITY;
    else if (name === "transform") ctm = multiply(ctm, ops.argsArray[i]);
    else if (name === "paintImageXObject") {
      found.push({ objId: ops.argsArray[i][0], x: ctm[4], y: ctm[5], page: pageNumber });
    }
  }

  const kinds = new Map();
  const out = [];
  for (const mark of found) {
    if (!kinds.has(mark.objId)) {
      kinds.set(mark.objId, markKind(await resolveImage(page, mark.objId)));
    }
    const kind = kinds.get(mark.objId);
    if (kind) out.push({ ...mark, kind });
  }
  return out;
}

/**
 * Image data lands in `page.objs` a tick or two after the operator list
 * resolves, and reading it early throws. Nothing in the API signals when it is
 * ready, so this waits a bounded number of ticks — skipping the wait makes
 * answer-key recovery fail silently and intermittently.
 */
async function resolveImage(page, objId) {
  for (let attempt = 0; attempt < 20; attempt++) {
    if (page.objs.has?.(objId)) break;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  try {
    return page.objs.get(objId);
  } catch {
    return null;
  }
}

/**
 * Returns the plain text plus the visual lines in reading order (top to bottom,
 * then left to right), which is what question splitting needs — the raw item
 * order in these PDFs does not follow the visual layout.
 */
export async function pdfText(file) {
  const empty = { text: "", firstPage: "", rows: [], marks: [] };
  if (!pdfjs) return empty;
  try {
    const doc = await pdfjs.getDocument({
      data: new Uint8Array(fs.readFileSync(file)),
      verbosity: 0,
    }).promise;
    const pages = [];
    const rows = [];
    const marks = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      pages.push(
        content.items
          .map((it) => it.str)
          .join(" ")
          .replace(/\s+/g, " "),
      );
      rows.push(...toLines(content.items, i));
      marks.push(...(await pageMarks(page, i, await page.getOperatorList(), pdfjs.OPS)));
    }
    return { text: pages.join(" "), firstPage: pages[0] ?? "", rows, marks };
  } catch {
    // Scanned or malformed PDFs simply yield no metadata.
    return empty;
  }
}

/* -------------------------------------------------- exam shape */

/**
 * The worksheets print the time the original platform allowed ("14m 49s"), which
 * makes a far better default than anything we could guess from the question
 * count. Only page 1 is searched so transcript text can't match.
 */
export function examSeconds(firstPage) {
  const m = firstPage.match(/(\d{1,3})\s*m\s*(\d{1,2})\s*s/i);
  if (!m) return null;
  const seconds = +m[1] * 60 + +m[2];
  return seconds >= 60 && seconds <= 7200 ? seconds : null;
}

/**
 * Reads the shape of a practice test so the reader can draw a matching answer
 * sheet. Only the count and the number of options are taken — which option is
 * correct is marked with raster images in these PDFs, too unreliable to guess
 * when a wrong key would silently corrupt score history.
 */
export function examShape(text) {
  if (text.length < 200) return null;

  // "Câu 1/10" and "Câu 1 - 27 /30" both state the real total; bare "Câu 28"
  // undercounts because the last page groups questions.
  const declared = [...text.matchAll(/C[âa]u\s*\d+\s*(?:[-–]\s*\d+\s*)?\/\s*(\d+)/gi)].map(
    (m) => +m[1],
  );
  const bare = [...text.matchAll(/C[âa]u\s*(\d+)/gi)].map((m) => +m[1]);
  const questions = declared.length
    ? Math.max(...declared)
    : bare.length
      ? Math.max(...bare)
      : null;
  if (!questions || questions < 3 || questions > 200) return null;

  // Part 2 has three options, everything else four. Counting occurrences rather
  // than presence keeps a stray "D." in an explanation from inflating it.
  const counts = { A: 0, B: 0, C: 0, D: 0 };
  for (const m of text.matchAll(/(?:^|[\s(])\(?([A-D])[.)]/g)) counts[m[1]]++;
  const peak = Math.max(...Object.values(counts));
  if (!peak) return null;
  let options = 0;
  for (const letter of ["A", "B", "C", "D"]) {
    if (counts[letter] < peak * 0.4) break;
    options++;
  }
  if (options < 2) return null;

  return { questions, options };
}

/* -------------------------------------------------- per-question extraction */

/**
 * Splits an answer key into individual questions.
 *
 * Two things make this safe rather than best-effort. A new question only opens
 * on a number that continues the sequence, so digits inside an explanation can't
 * start one; and the caller rejects the whole exam unless the numbers come out
 * contiguous. Getting this wrong would pair a stem with someone else's options
 * and teach the wrong answer, so it fails closed.
 */
const MARKER = /^C[âa]u\s*(\d{1,3})\s*(?:$|\/\s*\d+|[-–]\s*\d+\s*\/\s*\d+)/i;

export function parseQuestions(rows, marks = []) {
  /** Whether any marker bitmap sits just left of this row. */
  const isMarked = (row) =>
    marks.some(
      (m) =>
        m.page === row.page &&
        Math.abs(m.y - row.y) <= MARK_ROW_TOLERANCE &&
        m.x < row.x &&
        row.x - m.x <= MARK_LEFT_REACH,
    );

  /**
   * Part 1 and 2 keys number nothing: one header, then a bare option block per
   * question. Only there may a marked "A" stand in for a missing boundary —
   * elsewhere the numbered stems are authoritative, and letting a marker split a
   * question would shift every number after it. Decided per document, since it
   * is a property of the layout rather than of any one row.
   */
  const hasNumberedStems = rows.some((r) => {
    const m = /^(\d{1,3})[.)]/.exec(r.s);
    return m && +m[1] >= 2;
  });
  // A single "Câu 1 - 10 /10" covering the whole paper, versus one marker per
  // question: only the former leaves the boundaries to be inferred.
  const markerRows = rows.filter((r) => MARKER.test(r.s)).length;
  const markDelimited = !hasNumberedStems && markerRows <= 2;

  const found = new Map();
  let cur = null;
  let mode = "stem";

  const hasContent = (q) => Boolean(q && (q.stem || Object.keys(q.options).length));
  const flush = () => {
    if (hasContent(cur)) found.set(cur.n, cur);
    cur = null;
  };
  // The question being built counts as the last one seen; it hasn't been
  // flushed yet when the next boundary arrives.
  let lastSeen = 0;
  const lastNumber = () => cur?.n ?? lastSeen;

  for (const row of rows) {
    const s = row.s;
    // A marker row precedes each question, in one of exactly three forms:
    // "Câu 3" alone, "Câu 3/40", or "Câu 1 - 10 /10". Matching anything looser
    // lets an explanation that mentions "Câu 5" open a question, which shifts
    // every number after it.
    const marker = MARKER.exec(s);
    const numbered = /^(\d{1,3})[.)]\s*(.*)$/.exec(s);
    const boundary = marker ?? numbered;
    const n = boundary ? +boundary[1] : 0;

    // Part 6 blocks are printed twice: once inline in the passage with no
    // markers, then again expanded with them. Re-reading a number is allowed
    // only when the copy already held has no markers at all, which is what
    // distinguishes the inline listing from the real answer block.
    const repeatable = found.has(n) && !found.get(n).marked;

    if (boundary && (n === 1 || n === lastNumber() + 1 || n === cur?.n || repeatable)) {
      const rest = marker ? "" : (numbered[2] ?? "").trim();
      if (n !== cur?.n) flush();
      cur ??= { n, stem: "", options: {}, at: {}, why: "", vi: "", marked: false };
      cur.n = n;
      lastSeen = n;
      if (rest) cur.stem = cur.stem ? `${cur.stem} ${rest}` : rest;
      mode = "stem";
      continue;
    }
    if (!cur) continue;

    // Some keys write options "(a)" instead of "A."
    const option = /^\(?([A-Da-d])[.)]\s*(.*)$/.exec(s);
    if (option) {
      const letter = option[1].toUpperCase();
      const marked = isMarked(row);

      // Part 1 and 2 keys print a marker row only for the first question; the
      // rest are delimited by nothing but their option block. A marked option
      // row appearing after the current question has moved on is therefore the
      // start of the next one.
      // Only "A" may start one: a marked B, C or D belongs to the block already
      // open, and treating it as a boundary shifts every number after it.
      const startsNext =
        markDelimited &&
        marked &&
        letter === "A" &&
        (mode === "why" || mode === "vi" || Boolean(cur.options.A));
      if (startsNext) {
        const n = lastNumber() + 1;
        flush();
        cur = { n, stem: "", options: {}, at: {}, why: "", vi: "", marked: false };
        lastSeen = n;
        mode = "options";
      }

      // Explanations in some keys walk through every option again ("A.Invite:
      // động từ nguyên thể"), so an unmarked lettered line past the options is
      // prose. And requiring option text would skip Part 1 and 2 options, which
      // carry none at all — just "(A)" beside a photo — so a marker counts as
      // proof instead.
      if (mode !== "why" && mode !== "vi" && (option[2] || mode === "options" || marked)) {
        mode = "options";
        cur.options[letter] = option[2].trim();
        // Where the row sits, so the tick bitmap beside it can be found later.
        cur.at[letter] = { y: row.y, x: row.x, page: row.page };
        if (marked) cur.marked = true;
        continue;
      }
    }
    if (/^gi[ảa]i\s*th[íi]ch/i.test(s)) {
      mode = "why";
      // The label is occasionally duplicated ("Giải thích: Giải thích:").
      cur.why = s.replace(/^(?:gi[ảa]i\s*th[íi]ch\s*:?\s*)+/i, "");
      continue;
    }
    // "Dịch:", "Dịch nghĩa" (no colon) and "Dịch/Từ mới:" all appear.
    if (/^d[ịi]ch\s*(?:ngh[ĩi]a|\/\s*t[ừu]\s*m[ớo]i)?\s*:?\s*/i.test(s)) {
      mode = "vi";
      cur.vi = s.replace(/^d[ịi]ch\s*(?:ngh[ĩi]a|\/\s*t[ừu]\s*m[ớo]i)?\s*:?\s*/i, "");
      continue;
    }
    if (mode === "stem") cur.stem = cur.stem ? `${cur.stem} ${s}` : s;
    else if (mode === "why") cur.why += ` ${s}`;
    else if (mode === "vi") cur.vi += ` ${s}`;
  }
  flush();
  return [...found.values()].sort((a, b) => a.n - b.n);
}

/** Vertical slack when tying a marker bitmap to its option row. */
const MARK_ROW_TOLERANCE = 6;
/** The marker sits immediately left of the label, never further than this. */
const MARK_LEFT_REACH = 60;

/**
 * Reads the correct option off the green tick beside it.
 *
 * This is the whole answer key, recovered without anyone typing it. A letter is
 * only accepted when exactly one option on that question carries a tick — two
 * ticks or none means the layout wasn't understood, and guessing there would
 * silently teach the wrong answer.
 */
export function attachAnswers(questions, marks) {
  const correct = marks.filter((m) => m.kind === "correct");

  return questions.map((q) => {
    const ticked = Object.entries(q.at ?? {}).filter(([, at]) =>
      correct.some(
        (m) =>
          m.page === at.page &&
          Math.abs(m.y - at.y) <= MARK_ROW_TOLERANCE &&
          m.x < at.x &&
          at.x - m.x <= MARK_LEFT_REACH,
      ),
    );
    return ticked.length === 1 ? { ...q, answer: ticked[0][0] } : q;
  });
}

/**
 * The blank is written as underscores in most keys and as an ellipsis run
 * ("…………for the money management seminar") in others. Both are normalised to one
 * form so cards read consistently.
 */
const BLANK = /_{2,}|…[….]*|\.{4,}/g;

/**
 * A leading "32." is the question number bleeding into the stem, which happens
 * when the number and the sentence share a text run. Requiring the dot or paren
 * keeps a sentence that genuinely opens with a figure ("30 percent of staff…")
 * intact.
 */
const LEAKED_NUMBER = /^\d{1,3}[.)]\s*/;

const normalise = (questions) =>
  questions.map((q) => ({
    n: q.n,
    stem: q.stem.replace(LEAKED_NUMBER, "").replace(BLANK, " _____ ").replace(/\s+/g, " ").trim(),
    options: q.options,
    why: q.why.replace(/\s+/g, " ").trim(),
    vi: q.vi.replace(/\s+/g, " ").trim(),
    ...(q.answer ? { answer: q.answer } : {}),
  }));

const isUsable = (q) =>
  /_{2,}/.test(q.stem) &&
  q.stem.length >= 12 &&
  q.why.length >= 5 &&
  Object.keys(q.options).length >= 3 &&
  Object.values(q.options).every((v) => v.length > 0);

/**
 * Keeps only fill-in-the-blank questions, which are the ones that stand alone as
 * a flashcard. A listening question ("What will the man do at 2 o'clock?") is
 * unanswerable without its audio, and Part 7 items lose their reading passage —
 * requiring a blank in the stem excludes both without hard-coding part numbers.
 *
 * Returns `{ questions }` on success or `{ reason }` explaining the rejection,
 * so the diagnostic can report why an exam produced no cards.
 */
export function selectQuestions(questions, expected) {
  const parsed = normalise(questions);
  if (parsed.length === 0) return { reason: "no-questions-parsed" };

  // Validate the parse before selecting from it: contiguous numbering covering
  // most of the exam is the signal that no question was skipped or merged.
  // Filtering first would break contiguity on its own and hide real breakage.
  const breakAt = parsed.findIndex((q, i) => q.n !== parsed[0].n + i);
  if (breakAt >= 0) {
    return {
      reason: "numbering-not-contiguous",
      detail: `expected ${parsed[0].n + breakAt}, got ${parsed[breakAt].n} at position ${breakAt + 1} of ${parsed.length}`,
    };
  }
  if (parsed.length / expected < 0.6) {
    return { reason: "too-few-parsed", detail: `${parsed.length}/${expected}` };
  }

  const usable = parsed.filter(isUsable);
  if (usable.length < 5) {
    return { reason: "too-few-usable", detail: `${usable.length}/${parsed.length} have a blank` };
  }

  // Measured over the questions that are actually kept. Counting against every
  // parsed row would penalise exams whose trailing pages parse into stray
  // stem-less entries that were filtered out anyway.
  const answered = usable.filter((q) => q.answer).length;
  return { questions: usable, keyed: answered === usable.length, answered, total: usable.length };
}

/**
 * The whole answer key as one string, positioned so index 0 is question 1 —
 * ready to drop into the answer sheet.
 *
 * Returned only when every single position was recovered. A key with a hole in
 * it would shift every answer after that point and mark a correct paper wrong,
 * so a partial read is worth nothing here.
 */
export function positionalKey(questions, expected) {
  if (!expected || expected < 3) return null;
  const byNumber = new Map(questions.map((q) => [q.n, q]));
  let key = "";
  for (let n = 1; n <= expected; n++) {
    const answer = byNumber.get(n)?.answer;
    if (!answer) return null;
    key += answer;
  }
  return key;
}
