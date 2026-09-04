import { useSyncExternalStore } from "react";

/** Điều khiển form "Thêm thẻ nhanh" từ bất cứ đâu (Cài đặt, phím tắt…). */
export type QuickAddMode = "closed" | "dialog" | "sidecar";

const KEY = "bdi-quick-add-mode";
let mode: QuickAddMode | null = null;
const listeners = new Set<() => void>();

function read(): QuickAddMode {
  if (typeof window === "undefined") return "closed";
  const v = window.localStorage.getItem(KEY);
  return v === "sidecar" ? "sidecar" : "closed";
}

export function getQuickAddMode(): QuickAddMode {
  if (typeof window === "undefined") return "closed";
  if (mode === null) mode = read();
  return mode;
}

export function setQuickAddMode(next: QuickAddMode) {
  mode = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, next === "sidecar" ? "sidecar" : "closed");
  }
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useQuickAddMode() {
  return useSyncExternalStore(subscribe, getQuickAddMode, () => "closed" as QuickAddMode);
}
