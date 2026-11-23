import { AnimatePresence, motion } from "framer-motion";
import { Info } from "lucide-react";
import { useEffect, useState } from "react";
import { ACHIEVEMENT_MAP, ACHIEVEMENTS } from "@/data/achievements";
import { chunks } from "@/data/knowledge";
import { useApp } from "@/lib/app";

export function Toasts() {
  const toasts = useApp((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-4 left-4 right-4 z-[90] flex flex-col items-start gap-2 sm:bottom-6 sm:left-6 sm:right-auto"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const achievement = t.achievement ? ACHIEVEMENT_MAP[t.achievement] : null;
          const Icon = achievement?.icon ?? Info;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: -16, transition: { duration: 0.2 } }}
              className="pointer-events-auto flex w-full max-w-[340px] items-start gap-3 rounded-2xl border border-white/10 bg-ink-2/95 p-3 pr-4 shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-md"
            >
              <span
                className={
                  achievement
                    ? "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-spring/15 text-spring"
                    : "flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white/[0.06] text-paper"
                }
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {achievement ? "discovery unlocked" : "system"}
                </span>
                <span className="block text-[14px] font-medium text-paper">{t.title}</span>
                {t.body && <span className="block text-[12px] leading-snug text-dim">{t.body}</span>}
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

/** Konami-code debug mode: outlines every component and shows live stats. */
export function DebugOverlay() {
  const debug = useApp((s) => s.debug);
  const unlocked = useApp((s) => s.unlocked.length);
  const [fps, setFps] = useState(0);

  useEffect(() => {
    document.documentElement.classList.toggle("debug", debug);
    if (!debug) return;
    let raf = 0;
    let frames = 0;
    let last = performance.now();
    const loop = (now: number) => {
      frames++;
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)));
        frames = 0;
        last = now;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [debug]);

  if (!debug) return null;
  return (
    <div className="fixed right-4 top-16 z-[85] rounded-xl border border-spring/40 bg-ink/90 px-3 py-2 font-mono text-[11px] leading-relaxed text-spring shadow-2xl">
      <p className="text-[10px] uppercase tracking-[0.2em]">debug mode</p>
      <p className="text-paper/80">
        {fps} fps · {chunks.length} chunks · {unlocked}/{ACHIEVEMENTS.length} found
      </p>
      <p className="text-white/35">↑↑↓↓←→←→BA to exit</p>
    </div>
  );
}

/** Subtle film grain over everything. */
export function Grain() {
  return <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[60]" />;
}
