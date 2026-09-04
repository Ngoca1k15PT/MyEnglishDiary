import { useCallback, useSyncExternalStore } from "react";
import type { ConstellationId } from "@/data/ielts-map";
import type { FlashCard } from "@/data/lesson-types";
import { dayKey, daysBetween } from "@/lib/srs";

/** Thẻ do người học tự tạo từ tài liệu riêng của họ. */
export type MyCard = {
  id: string;
  word: string;
  meaning: string;
  example?: string;
  scope: ConstellationId;
  createdAt: string;
};

export const SCOPE_LABEL: Record<ConstellationId, string> = {
  base: "Nền tảng",
  toeic: "TOEIC",
  ielts: "IELTS",
};

export const MY_NODE_ID: Record<ConstellationId, string> = {
  base: "my-base",
  toeic: "my-toeic",
  ielts: "my-ielts",
};

export const MY_NODE_IDS = Object.values(MY_NODE_ID);

export function scopeOfMyNode(nodeId: string): ConstellationId | null {
  if (nodeId === "my-base") return "base";
  if (nodeId === "my-toeic") return "toeic";
  if (nodeId === "my-ielts") return "ielts";
  return null;
}

const KEY = "bdi-my-cards";
const META_KEY = "bdi-my-cards-meta";

export type MyCardsMeta = { lastBackup?: string; lastRemind?: string };

const EMPTY: MyCard[] = [];
const EMPTY_META: MyCardsMeta = {};

let cache: MyCard[] | null = null;
let meta: MyCardsMeta | null = null;
const listeners = new Set<() => void>();

function readCards(): MyCard[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    const list = raw ? (JSON.parse(raw) as MyCard[]) : [];
    return Array.isArray(list) ? list.filter((c) => c && c.id && c.word) : [];
  } catch {
    return [];
  }
}

function readMeta(): MyCardsMeta {
  if (typeof window === "undefined") return EMPTY_META;
  try {
    const raw = window.localStorage.getItem(META_KEY);
    return raw ? (JSON.parse(raw) as MyCardsMeta) : {};
  } catch {
    return {};
  }
}

export function getMyCards(): MyCard[] {
  if (typeof window === "undefined") return EMPTY;
  if (!cache) cache = readCards();
  return cache;
}

export function getMyCardsMeta(): MyCardsMeta {
  if (typeof window === "undefined") return EMPTY_META;
  if (!meta) meta = readMeta();
  return meta;
}

function emit() {
  listeners.forEach((l) => l());
}

function writeCards(next: MyCard[]) {
  cache = next;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(next));
  emit();
}

export function setMyCardsMeta(patch: MyCardsMeta) {
  meta = { ...getMyCardsMeta(), ...patch };
  if (typeof window !== "undefined") window.localStorage.setItem(META_KEY, JSON.stringify(meta));
  emit();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

function newId() {
  return `my-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function addMyCard(input: {
  word: string;
  meaning: string;
  example?: string;
  scope: ConstellationId;
}): MyCard | null {
  const word = input.word.trim();
  const meaning = input.meaning.trim();
  if (!word || !meaning) return null;
  const ex = input.example?.trim();
  const card: MyCard = {
    id: newId(),
    word,
    meaning,
    scope: input.scope,
    createdAt: dayKey(),
    ...(ex ? { example: ex } : {}),
  };
  writeCards([...getMyCards(), card]);
  return card;
}

export function addMyCards(rows: Omit<MyCard, "id" | "createdAt">[]) {
  const created = dayKey();
  const list = rows
    .filter((r) => r.word.trim() && r.meaning.trim())
    .map((r) => {
      const ex = r.example?.trim();
      return {
        id: newId(),
        word: r.word.trim(),
        meaning: r.meaning.trim(),
        scope: r.scope,
        createdAt: created,
        ...(ex ? { example: ex } : {}),
      } satisfies MyCard;
    });
  if (list.length) writeCards([...getMyCards(), ...list]);
  return list.length;
}

export function updateMyCard(id: string, patch: Partial<Omit<MyCard, "id">>) {
  writeCards(getMyCards().map((c) => (c.id === id ? { ...c, ...patch } : c)));
}

/**
 * Adds rows, replacing any card with the same word, in a single write. Used when
 * a batch is regenerated from a source that may have changed — re-running it has
 * to correct the existing cards, not silently skip them.
 */
export function upsertMyCards(rows: Omit<MyCard, "id" | "createdAt">[]) {
  const created = dayKey();
  const list = rows.filter((r) => r.word.trim() && r.meaning.trim());
  if (list.length === 0) return { added: 0, updated: 0 };

  const byWord = new Map(list.map((r) => [r.word.trim().toLowerCase(), r]));
  let updated = 0;

  const next = getMyCards().map((card) => {
    const row = byWord.get(card.word.toLowerCase());
    if (!row) return card;
    byWord.delete(card.word.toLowerCase());
    updated += 1;
    const ex = row.example?.trim();
    return {
      ...card,
      meaning: row.meaning.trim(),
      scope: row.scope,
      ...(ex ? { example: ex } : {}),
    } satisfies MyCard;
  });

  const fresh = [...byWord.values()].map((r) => {
    const ex = r.example?.trim();
    return {
      id: newId(),
      word: r.word.trim(),
      meaning: r.meaning.trim(),
      scope: r.scope,
      createdAt: created,
      ...(ex ? { example: ex } : {}),
    } satisfies MyCard;
  });

  writeCards([...next, ...fresh]);
  return { added: fresh.length, updated };
}

export function removeMyCard(id: string) {
  writeCards(getMyCards().filter((c) => c.id !== id));
}

/** Ghi đè thẻ cùng từ (không phân biệt hoa thường) trong cùng chòm. */
export function overwriteMyCard(row: Omit<MyCard, "id" | "createdAt">) {
  const key = row.word.trim().toLowerCase();
  const existing = getMyCards().find((c) => c.word.toLowerCase() === key);
  if (!existing) {
    addMyCards([row]);
    return;
  }
  const ex = row.example?.trim();
  updateMyCard(existing.id, {
    meaning: row.meaning.trim(),
    scope: row.scope,
    ...(ex ? { example: ex } : {}),
  });
}

export function hasWord(word: string) {
  const key = word.trim().toLowerCase();
  return getMyCards().some((c) => c.word.toLowerCase() === key);
}

/* ---------- chuyển sang FlashCard cho phiên học ---------- */

export function toFlashCard(c: MyCard): FlashCard {
  return {
    id: c.id,
    front: c.word,
    back: c.meaning,
    speak: c.word,
    meaning: c.meaning,
    topic: `Từ của tôi · ${SCOPE_LABEL[c.scope]}`,
    ...(c.example ? { example: c.example } : {}),
  };
}

export function myFlashCards(scope: ConstellationId): FlashCard[] {
  return getMyCards()
    .filter((c) => c.scope === scope)
    .map(toFlashCard);
}

/* ---------- nhập / xuất ---------- */

export type ParsedRow = { word: string; meaning: string; example?: string };

/** Tách một dòng: ưu tiên `|`, rồi tab, rồi dấu phẩy đầu tiên. */
export function parseLine(line: string): ParsedRow | null {
  const s = line.trim();
  if (!s) return null;
  let parts: string[];
  if (s.includes("|")) parts = s.split("|");
  else if (s.includes("\t")) parts = s.split("\t");
  else {
    const i = s.indexOf(",");
    if (i < 0) return null;
    parts = [s.slice(0, i), s.slice(i + 1)];
  }
  const [word, meaning, example] = parts.map((p) => p.trim());
  if (!word || !meaning) return null;
  return { word, meaning, ...(example ? { example } : {}) };
}

export function parseBulk(text: string): ParsedRow[] {
  return text
    .split(/\r?\n/)
    .map(parseLine)
    .filter((r): r is ParsedRow => r !== null);
}

function csvCell(v: string) {
  return `"${v.replace(/"/g, '""')}"`;
}

export function toCsv(cards: MyCard[]) {
  const head = "word,meaning,example,scope,createdAt";
  const rows = cards.map((c) =>
    [c.word, c.meaning, c.example ?? "", c.scope, c.createdAt].map(csvCell).join(","),
  );
  return [head, ...rows].join("\n");
}

function splitCsvLine(line: string) {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (quoted) {
      if (ch === '"') {
        if (line[i + 1] === '"') {
          cur += '"';
          i += 1;
        } else quoted = false;
      } else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      out.push(cur);
      cur = "";
    } else cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

export function parseCsv(text: string): (ParsedRow & { scope?: ConstellationId })[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length === 0) return [];
  const first = splitCsvLine(lines[0]!).map((c) => c.toLowerCase());
  const body = first[0] === "word" ? lines.slice(1) : lines;
  const out: (ParsedRow & { scope?: ConstellationId })[] = [];
  for (const line of body) {
    const cells = splitCsvLine(line);
    const word = cells[0] ?? "";
    const meaning = cells[1] ?? "";
    if (!word || !meaning) continue;
    const example = cells[2];
    const raw = cells[3];
    const scope = raw === "base" || raw === "toeic" || raw === "ielts" ? raw : undefined;
    out.push({
      word,
      meaning,
      ...(example ? { example } : {}),
      ...(scope ? { scope } : {}),
    });
  }
  return out;
}

export function downloadCsv(cards: MyCard[]) {
  if (typeof window === "undefined") return;
  const blob = new Blob(["\uFEFF" + toCsv(cards)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `the-cua-toi-${dayKey()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  setMyCardsMeta({ lastBackup: dayKey() });
}

/** Đã hơn 14 ngày chưa sao lưu và có trên 50 thẻ? */
export function needsBackupReminder(cards: MyCard[], m: MyCardsMeta) {
  if (cards.length <= 50) return false;
  const today = dayKey();
  if (m.lastRemind && daysBetween(m.lastRemind, today) < 14) return false;
  if (m.lastBackup && daysBetween(m.lastBackup, today) < 14) return false;
  return true;
}

/* ---------- hook ---------- */

export function useMyCards() {
  const cards = useSyncExternalStore(subscribe, getMyCards, () => EMPTY);
  const cardMeta = useSyncExternalStore(subscribe, getMyCardsMeta, () => EMPTY_META);

  const countByScope = useCallback(
    (scope: ConstellationId) => cards.filter((c) => c.scope === scope).length,
    [cards],
  );

  return { cards, meta: cardMeta, countByScope };
}

/** Số lần thay đổi — dùng để tính lại độ sáng khi thêm/xoá thẻ. */
export function useMyCardsVersion() {
  return useSyncExternalStore(
    subscribe,
    () => getMyCards().length,
    () => 0,
  );
}
