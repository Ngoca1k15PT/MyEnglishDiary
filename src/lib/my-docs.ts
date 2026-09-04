import { useCallback, useEffect, useState } from "react";
import type { ConstellationId } from "@/data/ielts-map";

export type DocScope = ConstellationId | "all";

export type MyDoc = {
  id: string;
  label: string;
  url: string;
  scope: DocScope;
};

export const SCOPE_LABEL: Record<DocScope, string> = {
  all: "Mọi ngôi sao",
  base: "Chòm Nền tảng",
  toeic: "Chòm TOEIC",
  ielts: "Chòm IELTS",
};

const KEY = "bdi-my-docs";

function load(): MyDoc[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as MyDoc[];
    return Array.isArray(list) ? list.filter((d) => d && d.url) : [];
  } catch {
    return [];
  }
}

export function useMyDocs() {
  const [docs, setDocs] = useState<MyDoc[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setDocs(load());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(KEY, JSON.stringify(docs));
  }, [docs, hydrated]);

  const add = useCallback((label: string, url: string, scope: DocScope) => {
    const clean = url.trim();
    if (!clean) return;
    const href = /^https?:\/\//i.test(clean) ? clean : `https://${clean}`;
    setDocs((d) => [
      ...d,
      { id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, label: label.trim() || href, url: href, scope },
    ]);
  }, []);

  const remove = useCallback((id: string) => setDocs((d) => d.filter((x) => x.id !== id)), []);

  const forConstellation = useCallback(
    (c: ConstellationId | undefined) =>
      docs.filter((d) => d.scope === "all" || (c ? d.scope === c : false)),
    [docs],
  );

  return { docs, add, remove, forConstellation };
}
