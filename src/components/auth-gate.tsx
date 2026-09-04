import { LogIn, Loader2, TriangleAlert } from "lucide-react";
import { useAuth } from "@/lib/auth";
import type { ReactNode } from "react";

/** Logo Google chính chủ — dùng ảnh ngoài sẽ bị chặn, nên vẽ thẳng bằng SVG. */
function GoogleMark() {
  return (
    <svg width="17" height="17" viewBox="0 0 48 48" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M45.1 24.5c0-1.6-.1-3.2-.4-4.7H24v8.9h11.8c-.5 2.7-2 5-4.4 6.6v5.5h7.1c4.1-3.8 6.6-9.4 6.6-16.3z"
      />
      <path
        fill="#34A853"
        d="M24 46c5.9 0 10.9-2 14.5-5.3l-7.1-5.5c-2 1.3-4.5 2.1-7.4 2.1-5.7 0-10.5-3.8-12.2-9H4.5v5.7C8.1 41.2 15.5 46 24 46z"
      />
      <path
        fill="#FBBC05"
        d="M11.8 28.3c-.4-1.3-.7-2.7-.7-4.3s.3-2.9.7-4.3v-5.7H4.5A22 22 0 0 0 2 24c0 3.6.9 6.9 2.5 9.9l7.3-5.6z"
      />
      <path
        fill="#EA4335"
        d="M24 10.7c3.2 0 6.1 1.1 8.4 3.3l6.3-6.3C34.9 4.1 29.9 2 24 2 15.5 2 8.1 6.8 4.5 13.8l7.3 5.7c1.7-5.2 6.5-8.8 12.2-8.8z"
      />
    </svg>
  );
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10">
      <div className="w-full max-w-sm text-center">{children}</div>
    </main>
  );
}

export function AuthGate({ children }: { children: ReactNode }) {
  const { user, loading, unavailable, error, signIn } = useAuth();

  if (loading) {
    return (
      <Shell>
        <Loader2 size={20} className="mx-auto animate-spin text-muted-foreground" />
        <p className="mt-3 text-sm text-muted-foreground">Đang mở bầu trời của bạn…</p>
      </Shell>
    );
  }

  // Thiếu cấu hình Firebase thì chặn đăng nhập sẽ khoá luôn cả app — cho học tiếp
  // ở chế độ chỉ lưu trên máy còn hơn là màn hình trắng.
  if (unavailable) {
    return (
      <>
        {/* fixed chứ không nằm trong luồng: các trang đều dùng h-[100dvh], một
            dải chiếm chỗ ở trên sẽ đẩy cả khung xuống và đáy trang tụt khỏi màn
            hình — mọi thứ neo theo bottom sẽ nằm ngoài tầm nhìn. */}
        <div className="pointer-events-none fixed inset-x-0 top-0 z-[75] flex items-center justify-center gap-2 border-b border-border bg-muted/90 px-4 py-2 text-xs text-muted-foreground backdrop-blur">
          <TriangleAlert size={13} />
          Chưa cấu hình Firebase — tiến trình chỉ lưu trên máy này.
        </div>
        {children}
      </>
    );
  }

  if (user) return <>{children}</>;

  return (
    <Shell>
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Bản đồ IELTS</p>
      <h1 className="mt-3 text-2xl font-semibold text-foreground">
        Đăng nhập để giữ bầu trời của bạn
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Tiến trình học được lưu vào tài khoản, không nằm trên một chiếc máy. Đổi điện thoại hay xoá
        trình duyệt thì chuỗi ngày, thẻ ôn và những ngôi sao đã thắp vẫn còn nguyên.
      </p>

      <button
        onClick={() => void signIn()}
        className="mt-7 inline-flex min-h-[46px] w-full items-center justify-center gap-2.5 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
      >
        <span className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-white">
          <GoogleMark />
        </span>
        Đăng nhập bằng Google
      </button>

      {error && (
        <p className="mt-3 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-xs leading-relaxed text-foreground">
          {error}
        </p>
      )}

      <p className="mt-6 flex items-start gap-2 text-left text-[11px] leading-relaxed text-muted-foreground">
        <LogIn size={13} className="mt-0.5 shrink-0" />
        <span>
          Bầu trời sẽ mờ dần nếu bạn nghỉ quá 2 ngày — ôn lại là sáng lên ngay. Đó là cách app nhắc
          bạn học đều, không phải để phạt.
        </span>
      </p>
    </Shell>
  );
}
