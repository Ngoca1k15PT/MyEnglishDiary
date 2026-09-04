import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export function StoryBody() {
  return (
    <div className="space-y-4 text-sm leading-relaxed text-muted-foreground">
      <p>
        Người viết lộ trình này khởi đầu từ con số gần như bằng không: có lúc còn chưa hiểu IELTS là
        kỳ thi gì, tự làm thử một đề và chỉ được <span className="text-foreground">3.5</span>.
      </p>
      <p>
        Không trung tâm, không thầy kèm — chỉ có một lộ trình tự học kiên trì. Từ 3.5 lên{" "}
        <span className="text-foreground">7.0</span>, rồi{" "}
        <span className="text-foreground">8.0</span>, và sau đó là{" "}
        <span className="text-star-done font-medium">8.5</span>.
      </p>
      <p>
        Bản đồ này là cách kể lại hành trình đó: mỗi mục học là một ngôi sao mờ, học xong thì nó
        sáng lên. Bạn không chạy đua với ai, bạn chỉ đang thắp dần bầu trời của chính mình.
      </p>
    </div>
  );
}

export function WelcomeOverlay({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/85 p-6 backdrop-blur-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="w-full max-w-lg rounded-3xl border border-border bg-card/90 p-8"
          >
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Bản đồ IELTS</p>
            <h2 className="mt-3 text-2xl font-semibold text-foreground">
              Từ 3.5 tự học lên 8.5 — không đi trung tâm
            </h2>
            <div className="mt-5">
              <StoryBody />
            </div>
            <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:brightness-110"
              >
                Bắt đầu thắp sao
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function AboutPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          className="pointer-events-auto w-72 rounded-2xl border border-border bg-card/85 p-5 backdrop-blur-xl"
        >
          <div className="flex items-start justify-between gap-3">
            <h3 className="text-sm font-semibold text-foreground">Giới thiệu</h3>
            <button
              onClick={onClose}
              aria-label="Đóng giới thiệu"
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={15} />
            </button>
          </div>
          <div className="mt-3 text-xs">
            <StoryBody />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
