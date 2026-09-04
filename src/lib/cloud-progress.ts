import { useEffect, useRef, useState } from "react";
import { getDb } from "@/lib/firebase";
import { mergeProgress } from "@/lib/sync";
import type { ProgressState } from "@/lib/progress";

/**
 * Đưa tiến trình lên Firestore ở `bdi_users/{uid}`.
 *
 * KHÔNG dùng `users/{uid}`: đường dẫn đó đã thuộc về app iOS "My English" chạy
 * chung project này, và rules của nó cấm client ghi. Dùng collection riêng để
 * hai app không giẫm lên nhau.
 *
 * Luồng: đăng nhập → kéo bản trên mây về, gộp với bản ở máy, ghi bản gộp xuống
 * cả hai. Sau đó mọi thay đổi được gom lại và đẩy lên sau một nhịp nghỉ, để chấm
 * 20 thẻ liên tiếp không thành 20 lượt ghi.
 */

export type SyncStatus = "idle" | "loading" | "saving" | "synced" | "error";

/** Collection riêng của app này. Xem ghi chú ở đầu file về lý do không dùng "users". */
const COLLECTION = "bdi_users";

/** Gom thay đổi trong 2,5 giây rồi mới ghi — vừa đủ để không tốn lượt ghi vô ích. */
const DEBOUNCE_MS = 2500;

export function useCloudProgress(
  uid: string | null,
  state: ProgressState,
  hydrated: boolean,
  applyRemote: (merge: (local: ProgressState) => ProgressState) => void,
) {
  const [status, setStatus] = useState<SyncStatus>("idle");
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  /** Chỉ bắt đầu ghi lên sau khi đã kéo về xong, tránh đè bản trên mây bằng bản rỗng. */
  const pulled = useRef<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  // Kéo về + gộp, mỗi lần đổi tài khoản làm lại một lần.
  useEffect(() => {
    if (!uid || !hydrated) return;
    let alive = true;
    setStatus("loading");

    (async () => {
      try {
        const db = await getDb();
        const { doc, getDoc } = await import("firebase/firestore");
        const snap = await getDoc(doc(db, COLLECTION, uid));
        if (!alive) return;

        if (snap.exists()) {
          const remote = snap.data()["progress"] as ProgressState | undefined;
          if (remote) applyRemote((local) => mergeProgress(local, remote));
        }
        pulled.current = uid;
        setStatus("synced");
      } catch (e) {
        console.error("Không kéo được tiến trình từ Firestore", e);
        if (alive) setStatus("error");
      }
    })();

    return () => {
      alive = false;
      pulled.current = null;
    };
  }, [uid, hydrated, applyRemote]);

  // Đẩy lên sau mỗi thay đổi, có gom nhịp.
  useEffect(() => {
    if (!uid || !hydrated || pulled.current !== uid) return;

    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try {
        setStatus("saving");
        const db = await getDb();
        const { doc, setDoc, serverTimestamp } = await import("firebase/firestore");
        await setDoc(
          doc(db, COLLECTION, uid),
          { progress: state, updatedAt: serverTimestamp() },
          { merge: true },
        );
        setStatus("synced");
        setLastSaved(
          new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        );
      } catch (e) {
        console.error("Không lưu được tiến trình lên Firestore", e);
        setStatus("error");
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer.current);
  }, [uid, state, hydrated]);

  return { status, lastSaved };
}
