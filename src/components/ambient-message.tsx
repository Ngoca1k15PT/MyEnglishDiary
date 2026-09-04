import { AnimatePresence, motion } from "framer-motion";

export function AmbientMessage({ text }: { text: string | null }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={text}
          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -8, filter: "blur(6px)" }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="pointer-events-none fixed inset-x-0 top-1/2 z-40 flex -translate-y-1/2 justify-center px-6"
        >
          <p className="text-center text-xl font-medium tracking-wide text-foreground drop-shadow-[0_0_24px_var(--star-done)] md:text-2xl">
            {text}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
