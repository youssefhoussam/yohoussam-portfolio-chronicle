import { AnimatePresence, motion } from "framer-motion";
import { ArrowDown, ArrowUp, BookOpen, Check, TerminalSquare, X } from "lucide-react";
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

function useJourney() {
  const active = useApp((s) => s.active);
  const progress = useApp((s) => s.progress);
  const index = CHAPTERS.findIndex((c) => c.id === active);
  return {
    index,
    chapter: CHAPTERS[index],
    next: CHAPTERS[index + 1] ?? null,
    overall: Math.min(1, (index + progress[active]) / CHAPTERS.length),
  };
}

const counter = (i: number) => `${String(i + 1).padStart(2, "0")}/${String(CHAPTERS.length).padStart(2, "0")}`;

/** Large screens: an always-visible journey rail, so visitors know how much story is left. */
export function TraceNav() {
  const { index, next, overall } = useJourney();
  const traceId = useMemo(() => Math.random().toString(16).slice(2, 8), []);
  const elapsed = useElapsed();

  return (
    <nav aria-label="Your journey through the site" data-debug="<TraceNav />" className="fixed left-4 top-1/2 z-30 hidden w-[212px] -translate-y-1/2 xl:block">
      <div className="rounded-2xl border border-white/[0.08] bg-ink/85 p-3 shadow-[0_24px_70px_rgba(0,0,0,0.55)] backdrop-blur-md">
        <div className="flex items-baseline justify-between px-1">
          <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.22em] text-signal">your journey</p>
          <p className="font-mono text-[11px] tabular-nums text-paper">
            {String(index + 1).padStart(2, "0")}
            <span className="text-white/35">/{String(CHAPTERS.length).padStart(2, "0")}</span>
          </p>
        </div>
        <div className="mx-1 mt-2.5 h-1 overflow-hidden rounded-full bg-white/10" aria-hidden>
          <div className="h-full rounded-full bg-signal transition-[width] duration-300" style={{ width: `${Math.max(overall, 0.02) * 100}%` }} />
        </div>
        <ol className="mt-3 space-y-0.5">
          {CHAPTERS.map((c, i) => {
            const state = i < index ? "done" : i === index ? "active" : "todo";
            return (
              <li key={c.id}>
                <button
                  onClick={() => scrollToChapter(c.id)}
                  aria-current={state === "active" ? "step" : undefined}
                  className={cn(
                    "group flex w-full items-center gap-2.5 rounded-lg px-1.5 py-[5px] text-left transition hover:bg-white/[0.05]",
                    state === "active" && "bg-signal/10 hover:bg-signal/[0.14]",
                  )}
                >
                  <span
                    className={cn(
                      "flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full border font-mono text-[9px] font-semibold transition",
                      state === "done" && "border-signal/50 bg-signal/15 text-signal",
                      state === "active" && "border-signal bg-signal text-ink shadow-[0_0_0_4px_rgba(245,165,36,0.15)]",
                      state === "todo" && "border-white/15 text-white/45 group-hover:border-white/35",
                    )}
                  >
                    {state === "done" ? <Check className="h-3 w-3" strokeWidth={3} /> : c.index}
                  </span>
                  <span
                    className={cn(
                      "truncate text-[13px] transition",
                      state === "active" ? "font-semibold text-paper" : state === "done" ? "text-paper/65" : "text-dim group-hover:text-paper",
                    )}
                  >
                    {c.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
        {next ? (
          <button
            onClick={() => scrollToChapter(next.id)}
            className="group mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-signal/35 bg-signal/[0.07] px-3 py-2 text-left transition hover:border-signal/70 hover:bg-signal/[0.12]"
          >
            <span className="min-w-0">
              <span className="block font-mono text-[9px] uppercase tracking-[0.22em] text-signal">up next</span>
              <span className="block truncate text-[13px] font-semibold text-paper">{next.title}</span>
            </span>
            <ArrowDown className="animate-nudge h-4 w-4 shrink-0 text-signal" />
          </button>
        ) : (
          <p className="mt-3 rounded-xl border border-signal/35 bg-signal/[0.07] px-3 py-2 text-[12px] leading-snug text-paper">
            <span className="font-semibold text-signal">200 OK.</span> You reached the end. Thanks for exploring!
          </p>
        )}
        <p className="px-1 pt-2.5 font-mono text-[9px] tabular-nums text-white/30">
          trace {traceId} · ⏱ {fmt(elapsed)}
        </p>
      </div>
    </nav>
  );
}

/** Phones and tablets: a slim journey bar pinned to the bottom of the screen. */
export function JourneyBar() {
  const { index, chapter, next, overall } = useJourney();
  const hidden = useApp((s) => s.phase !== "ready" || s.menuOpen || s.terminalOpen || s.guideOpen);

  return (
    <AnimatePresence>
      {!hidden && (
        <motion.nav
          aria-label="Your journey through the site"
          data-debug="<JourneyBar />"
          initial={{ y: 90, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 90, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed inset-x-3 bottom-3 z-40 xl:hidden"
        >
          <div className="mx-auto flex max-w-md items-center gap-1.5 overflow-hidden rounded-2xl border border-white/10 bg-ink-2/[0.92] p-1.5 shadow-[0_20px_60px_rgba(0,0,0,0.65)] backdrop-blur-md">
            <button
              onClick={() => actions.setMenu(true)}
              className="flex min-w-0 flex-1 items-center gap-3 rounded-xl px-2.5 py-1.5 text-left transition hover:bg-white/[0.04]"
              aria-label={`Chapter ${index + 1} of ${CHAPTERS.length}: ${chapter.title}. Open the chapter list`}
            >
              <span className="font-mono text-[12px] font-semibold tabular-nums text-signal">{counter(index)}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-semibold text-paper">{chapter.title}</span>
                <span className="mt-1 block h-[3px] overflow-hidden rounded-full bg-white/10">
                  <span className="block h-full rounded-full bg-signal transition-[width] duration-300" style={{ width: `${Math.max(overall, 0.03) * 100}%` }} />
                </span>
              </span>
            </button>
            {next ? (
              <button
                onClick={() => scrollToChapter(next.id)}
                className="flex shrink-0 items-center gap-1.5 rounded-xl bg-signal px-3.5 py-2.5 text-[13px] font-semibold text-ink transition active:scale-[0.97]"
                aria-label={`Next chapter: ${next.title}`}
              >
                Next <ArrowDown className="animate-nudge h-4 w-4" />
              </button>
            ) : (
              <button
                onClick={() => scrollToChapter("gateway")}
                className="flex shrink-0 items-center gap-1.5 rounded-xl border border-signal/50 px-3.5 py-2.5 text-[13px] font-semibold text-signal"
              >
                Top <ArrowUp className="h-4 w-4" />
              </button>
            )}
          </div>
        </motion.nav>
      )}
    </AnimatePresence>
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
                    <span className={cn("font-mono text-[11px]", c.id === active ? "text-signal" : "text-white/35")}>{c.index}</span>
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
                    persona === p ? "border-signal/60 bg-signal/10 text-paper" : "border-white/10 text-dim",
                  )}
                >
                  {PERSONAS[p].label}
                </button>
              ))}
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={() => actions.toggleGuide(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-signal/50 bg-signal/10 py-3 text-[13px] font-semibold text-signal"
              >
                <BookOpen className="h-4 w-4" /> Usage guide
              </button>
              <button
                onClick={() => actions.toggleTerminal(true)}
                className="flex items-center justify-center gap-2 rounded-xl border border-white/10 py-3 text-[13px] font-semibold text-paper"
              >
                <TerminalSquare className="h-4 w-4 text-signal" /> Terminal
              </button>
            </div>

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
