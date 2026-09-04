import { Sparkles, X } from "lucide-react";

type Props = {
  /** phần độ sáng đang bị nguội ăn mất, 0..1 */
  lost: number;
  onStart: () => void;
  onDecline: () => void;
};

/**
 * Lời mời ân xá — chỉ hiện một lần trong đời tài khoản.
 *
 * Người nghỉ dài quay lại thấy bầu trời tối sầm rất dễ bỏ luôn. Cho không thì
 * mất ý nghĩa của việc học đều, nên đổi bằng đúng một bài test: vừa lấy lại
 * được tất cả, vừa là một buổi học thật.
 */
export function AmnestyCard({ lost, onStart, onDecline }: Props) {
  return (
    <div className="relative rounded-2xl border border-star-done/50 bg-star-done/10 p-4">
      <button
        onClick={onDecline}
        aria-label="Để sau"
        className="absolute right-2 top-2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
      >
        <X size={14} />
      </button>

      <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-star-done">
        <Sparkles size={12} /> Một lần duy nhất
      </p>

      <h2 className="mt-2 text-base font-semibold text-foreground">Thắp lại cả bầu trời</h2>

      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Bạn nghỉ hơi lâu nên các sao đã nguội mất khoảng{" "}
        <span className="font-semibold text-foreground">{Math.round(lost * 100)}%</span> độ sáng.
        Làm xong <span className="font-semibold text-foreground">một bài test</span> bất kỳ là lấy
        lại toàn bộ — coi như chưa từng nghỉ.
      </p>

      <button
        onClick={onStart}
        className="mt-3 inline-flex min-h-[40px] w-full items-center justify-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.01]"
      >
        Làm một bài để lấy lại
      </button>

      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Mỗi tài khoản chỉ được tha một lần. Bấm ✕ là bỏ qua và mất luôn quyền này.
      </p>
    </div>
  );
}
