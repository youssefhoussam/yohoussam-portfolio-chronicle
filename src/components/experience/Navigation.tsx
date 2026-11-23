import { AnimatePresence, motion } from "framer-motion";
import { TerminalSquare, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CHAPTERS } from "@/data/chapters";
import { PERSONA_ORDER, PERSONAS } from "@/data/personas";
import { useScrollLock } from "@/hooks/useExperience";
import { actions, useApp } from "@/lib/app";
import { scrollToChapter } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { AchievementList } from "./Hud";

const fmt = (seconds: number) => `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;

function useElapsed() {
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setElapsed(Math.floor(performance.now() / 1000)), 1000);
    return () => window.clearInterval(id);
  }, []);
  return elapsed;
}

/** Desktop navigation, drawn as a distributed-tracing waterfall: one span per chapter. */
export function TraceNav() {
  const active = useApp((s) => s.active);
  const progress = useApp((s) => s.progress);
  const traceId = useMemo(() => Math.random().toString(16).slice(2, 8), []);
  const elapsed = useElapsed();

  return (
    <nav aria-label="Chapters" data-debug="<TraceNav />" className="group/trace fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 xl:block">
      <div className="rounded-2xl border border-white/[0.06] bg-ink/70 p-2 backdrop-blur-md">
        <p className="px-1.5 pb-1.5 pt-1 font-mono text-[9px] uppercase tracking-[0.2em] text-white/30">
          trace <span className="text-dim">{traceId}</span>
        </p>
        <ol>
          {CHAPTERS.map((c) => {
            const p = progress[c.id];
            const isActive = c.id === active;
            return (
              <li key={c.id}>
                <button
                  onClick={() => scrollToChapter(c.id)}
                  aria-current={isActive ? "step" : undefined}
                  className="flex w-full items-center gap-2 rounded-lg px-1.5 py-[7px] text-left transition hover:bg-white/[0.05]"
                >
                  <span className={cn("font-mono text-[10px] tabular-nums transition-colors", isActive ? "text-spring" : "text-white/35")}>{c.index}</span>
                  <span className="relative h-[3px] w-9 overflow-hidden rounded-full bg-white/10">
                    <span
                      className={cn("absolute inset-y-0 left-0 rounded-full", isActive ? "bg-spring" : "bg-white/35")}
                      style={{ width: `${Math.max(p, p > 0 ? 0.06 : 0) * 100}%` }}
                    />
                  </span>
                  <span
                    className={cn(
                      "max-w-0 overflow-hidden whitespace-nowrap font-mono text-[11px] opacity-0 transition-all duration-300 group-focus-within/trace:max-w-[150px] group-focus-within/trace:opacity-100 group-hover/trace:max-w-[150px] group-hover/trace:opacity-100",
                      isActive ? "text-paper" : "text-dim",
                    )}
                  >
                    {c.label}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        <p className="px-1.5 pb-1 pt-1.5 font-mono text-[9px] tabular-nums text-white/30">⏱ {fmt(elapsed)}</p>
      </div>
    </nav>
  );
}

/** Phone and tablet navigation sheet. */
export function MobileMenu() {
  const open = useApp((s) => s.menuOpen);
  const active = useApp((s) => s.active);
  const persona = useApp((s) => s.persona);
  const closeRef = useRef<HTMLButtonElement>(null);
  useScrollLock(open);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") actions.setMenu(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (id: (typeof CHAPTERS)[number]["id"]) => {
    actions.setMenu(false);
    window.setTimeout(() => scrollToChapter(id), 60);
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Chapters"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[80] overflow-y-auto bg-ink/[0.97] px-5 pb-10 pt-4 backdrop-blur-md xl:hidden"
        >
          <div className="mx-auto max-w-lg">
            <div className="flex h-10 items-center justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/35">trace · 9 spans</span>
              <button
                ref={closeRef}
                onClick={() => actions.setMenu(false)}
                aria-label="Close the menu"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-paper"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ol className="mt-4 divide-y divide-white/[0.06] border-y border-white/[0.06]">
              {CHAPTERS.map((c, i) => (
                <motion.li key={c.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.025 }}>
                  <button onClick={() => go(c.id)} className="flex w-full items-baseline gap-4 py-3.5 text-left">
                    <span className={cn("font-mono text-[11px]", c.id === active ? "text-spring" : "text-white/35")}>{c.index}</span>
                    <span className="font-display text-[28px] leading-none text-paper">{c.title}</span>
                    <span className="ml-auto font-mono text-[10px] text-white/30">{c.label}</span>
                  </button>
                </motion.li>
              ))}
            </ol>

            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">view the site as</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {PERSONA_ORDER.map((p) => (
                <button
                  key={p}
                  onClick={() => actions.setPersona(p)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-[13px] transition",
                    persona === p ? "border-spring/60 bg-spring/10 text-paper" : "border-white/10 text-dim",
                  )}
                >
                  {PERSONAS[p].label}
                </button>
              ))}
            </div>

            <button
              onClick={() => actions.toggleTerminal(true)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-3 font-mono text-[12px] text-paper"
            >
              <TerminalSquare className="h-4 w-4 text-spring" /> open the terminal
            </button>

            <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">discoveries</p>
            <div className="mt-3">
              <AchievementList compact />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
