import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { JournalPages } from "./JournalPages";

type Stage = "closed" | "opening" | "zooming" | "open";

export function Book() {
  const [stage, setStage] = useState<Stage>("closed");

  useEffect(() => {
    const t1 = setTimeout(() => setStage("opening"), 900);
    const t2 = setTimeout(() => setStage("zooming"), 2400);
    const t3 = setTimeout(() => setStage("open"), 3600);
    return () => {
      [t1, t2, t3].forEach(clearTimeout);
    };
  }, []);

  if (stage === "open") return <JournalPages />;

  const scale = stage === "zooming" ? 4.5 : 1;
  const opacity = stage === "zooming" ? 0 : 1;

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden">
      {/* Ambient glow */}
      <motion.div
        className="absolute h-[600px] w-[600px] rounded-full blur-3xl"
        style={{
          background: "radial-gradient(circle, oklch(0.85 0.1 235 / 0.6), transparent 70%)",
        }}
        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 4, repeat: Infinity }}
      />

      <motion.div
        className="relative animate-float book-intro-stage"
        style={{ perspective: 2000 }}
        animate={{ scale, opacity }}
        transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
      >
        <div className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
          {/* Back cover */}
          <div
            className="absolute inset-0 rounded-r-md rounded-l-sm"
            style={{
              background: "linear-gradient(135deg, var(--book-cover-dark), var(--book-spine))",
              boxShadow: "var(--shadow-book)",
            }}
          />

          {/* Pages stack */}
          <div
            className="paper-texture absolute inset-2 rounded-sm border border-border/40"
            style={{
              boxShadow: "inset 0 0 8px oklch(0.5 0.05 240 / 0.2)",
            }}
          />

          {/* Front cover with rotation */}
          <motion.div
            className="absolute inset-0 origin-left rounded-r-md rounded-l-sm"
            style={{
              background:
                "linear-gradient(135deg, var(--book-cover) 0%, var(--book-cover-dark) 100%)",
              boxShadow:
                "0 10px 40px oklch(0.4 0.1 245 / 0.4), inset 0 0 30px oklch(0.4 0.1 245 / 0.2)",
              transformStyle: "preserve-3d",
            }}
            animate={{
              rotateY: stage === "closed" ? 0 : -160,
            }}
            transition={{ duration: 1.6, ease: [0.65, 0, 0.35, 1] }}
          >
            {/* Cover decorations */}
            <div className="absolute inset-4 rounded-sm border border-[oklch(0.85_0.09_90/0.4)]" />
            <div className="absolute inset-6 rounded-sm border border-[oklch(0.85_0.09_90/0.25)]" />

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
              <div className="mb-3 h-px w-20 bg-[oklch(0.85_0.09_90/0.6)]" />
              <p className="font-script text-3xl text-[oklch(0.95_0.04_90)]">my</p>
              <h1 className="font-display text-5xl font-semibold tracking-wide text-[oklch(0.97_0.02_235)]">
                Portfolio
              </h1>
              <div className="mt-3 h-px w-20 bg-[oklch(0.85_0.09_90/0.6)]" />
              <p className="mt-6 font-serif-body text-xs uppercase tracking-[0.3em] text-[oklch(0.9_0.04_235)]">
                A collection of works
              </p>
            </div>

            {/* Spine highlight */}
            <div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-r from-black/20 to-transparent rounded-l-sm" />
          </motion.div>

          {/* Bookmark ribbon */}
          <motion.div
            className="absolute -top-1 right-[12%] w-3"
            style={{ background: "var(--gold)", height: 120 }}
            animate={{ height: stage === "closed" ? 120 : 160 }}
            transition={{ duration: 1.2 }}
          >
            <div className="absolute bottom-0 left-0 w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-[var(--gold)]" />
          </motion.div>
        </div>
      </motion.div>

      <AnimatePresence>
        {stage === "closed" && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute bottom-16 font-script text-2xl text-[oklch(0.5_0.08_245)]"
          >
            opening...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
