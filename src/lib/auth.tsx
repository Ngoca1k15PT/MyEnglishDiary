import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { firebaseReady, getFirebaseAuth, type User } from "@/lib/firebase";

export type AuthState = {
  user: User | null;
  /** Chưa biết đã đăng nhập hay chưa — đang hỏi Firebase. */
  loading: boolean;
  /** Cấu hình Firebase thiếu; app chạy offline, không đồng bộ được. */
  unavailable: boolean;
  error: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

/** Thông báo lỗi của Firebase khá kỹ thuật — dịch sang câu người học hiểu được. */
function readableError(code: string): string {
  if (code.includes("popup-closed-by-user") || code.includes("cancelled-popup-request"))
    return "Bạn đã đóng cửa sổ đăng nhập.";
  if (code.includes("popup-blocked"))
    return "Trình duyệt chặn cửa sổ đăng nhập. Cho phép pop-up rồi thử lại nhé.";
  if (code.includes("network-request-failed")) return "Mất mạng. Kiểm tra kết nối rồi thử lại.";
  if (code.includes("unauthorized-domain"))
    return "Tên miền này chưa được cho phép đăng nhập. Thêm nó vào Firebase Console → Authentication → Settings → Authorized domains.";
  if (code.includes("operation-not-allowed"))
    return "Đăng nhập Google chưa được bật trong Firebase Console → Authentication → Sign-in method.";
  return "Đăng nhập không thành công. Thử lại giúp mình nhé.";
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!firebaseReady) {
      setLoading(false);
      return;
    }
    let alive = true;
    let unsub: (() => void) | undefined;

    (async () => {
      try {
        const auth = await getFirebaseAuth();
        const { onAuthStateChanged, getRedirectResult } = await import("firebase/auth");
        // Trên máy chặn pop-up ta rơi về redirect, kết quả quay lại ở đây.
        await getRedirectResult(auth).catch(() => null);
        if (!alive) return;
        unsub = onAuthStateChanged(auth, (u) => {
          setUser(u);
          setLoading(false);
        });
      } catch {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
      unsub?.();
    };
  }, []);

  const signIn = useCallback(async () => {
    setError(null);
    try {
      const auth = await getFirebaseAuth();
      const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } =
        await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });
      try {
        await signInWithPopup(auth, provider);
      } catch (e) {
        const code = String((e as { code?: string })?.code ?? e);
        // Pop-up bị chặn thì thử redirect — trên iOS Safari đây là đường duy nhất.
        if (code.includes("popup-blocked") || code.includes("popup-closed-by-user")) {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw e;
      }
    } catch (e) {
      setError(readableError(String((e as { code?: string })?.code ?? e)));
    }
  }, []);

  const signOut = useCallback(async () => {
    const auth = await getFirebaseAuth();
    const { signOut: fbSignOut } = await import("firebase/auth");
    await fbSignOut(auth);
  }, []);

  const value = useMemo<AuthState>(
    () => ({ user, loading, unavailable: !firebaseReady, error, signIn, signOut }),
    [user, loading, error, signIn, signOut],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth phải nằm trong <AuthProvider>");
  return ctx;
}
