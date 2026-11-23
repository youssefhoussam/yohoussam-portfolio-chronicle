import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Gamepad2,
  Gem,
  Hand,
  MessageSquareText,
  Route,
  TerminalSquare,
  Timer,
  X,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ACHIEVEMENTS } from "@/data/achievements";
import { CHAPTERS } from "@/data/chapters";
import { useScrollLock } from "@/hooks/useExperience";
import { actions, app, useApp } from "@/lib/app";
import { scrollToChapter } from "@/lib/navigation";
import { load, save } from "@/lib/persist";
import { cn } from "@/lib/utils";

const closeThen = (fn: () => void) => {
  actions.toggleGuide(false);
  window.setTimeout(fn, 180);
};

function Step({
  n,
  icon: Icon,
  title,
  children,
  action,
}: {
  n: number;
  icon: LucideIcon;
  title: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <li className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4 sm:p-5">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-signal/[0.12] text-signal">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">step {String(n).padStart(2, "0")}</p>
        <h3 className="mt-1 font-display text-[19px] font-bold leading-tight tracking-[-0.02em] text-paper">{title}</h3>
        <div className="mt-1.5 text-[14px] leading-relaxed text-dim">{children}</div>
        {action && <div className="mt-3 flex flex-wrap gap-2">{action}</div>}
      </div>
    </li>
  );
}

const Kbd = ({ children }: { children: ReactNode }) => <span className="kbd mx-0.5 align-middle">{children}</span>;

function GuideDialog() {
  const unlocked = useApp((s) => s.unlocked.length);
  const closeRef = useRef<HTMLButtonElement>(null);
  useScrollLock(true);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") actions.toggleGuide(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      previous?.focus?.();
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-[96] flex items-end justify-center bg-black/60 backdrop-blur-sm sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) actions.toggleGuide(false);
      }}
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="guide-title"
        initial={{ opacity: 0, y: 30, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98, transition: { duration: 0.15 } }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
        className="flex max-h-[92svh] w-full max-w-3xl flex-col overflow-hidden rounded-t-3xl border border-white/10 bg-ink-2 shadow-[0_40px_120px_rgba(0,0,0,0.7)] sm:rounded-3xl"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.07] px-5 pb-4 pt-5 sm:px-7 sm:pt-6">
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-signal">
              <BookOpen className="h-3.5 w-3.5" /> usage guide
            </p>
            <h2 id="guide-title" className="mt-2 font-display text-[30px] leading-[1.02] text-paper sm:text-[38px]">
              How to explore <span className="text-signal">this site.</span>
            </h2>
            <p className="mt-2 max-w-xl text-[14px] leading-relaxed text-dim">
              This portfolio is a small working RAG system, told as a journey in {CHAPTERS.length} chapters. Here is everything you can
              do with it, in about 30 seconds.
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={() => actions.toggleGuide(false)}
            aria-label="Close the guide"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 text-paper transition hover:border-white/30"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-7">
          <ol className="grid gap-3">
            <Step
              n={1}
              icon={MessageSquareText}
              title="Ask anything"
              action={
                <button
                  className="btn-primary h-9 px-3.5 text-[13px]"
                  onClick={() =>
                    closeThen(() => {
                      scrollToChapter("gateway");
                      actions.ask("How does your hybrid retrieval work?");
                    })
                  }
                >
                  Try a question <ArrowRight className="h-4 w-4" />
                </button>
              }
            >
              Type a question in the search box at the top. The stars behind it light up with the facts used to answer, and a judge
              refuses to answer when it finds no evidence, just like a production RAG system should.
            </Step>
            <Step
              n={2}
              icon={Route}
              title="Follow the journey"
              action={
                <button className="btn-ghost h-9 px-3.5 text-[13px]" onClick={() => closeThen(() => scrollToChapter("services"))}>
                  Start chapter 02 <ArrowRight className="h-4 w-4" />
                </button>
              }
            >
              The story runs through {CHAPTERS.length} chapters, from profile to contact. The journey panel (on the left on large
              screens, at the bottom on phones) shows where you are and what comes next. Just keep scrolling.
            </Step>
            <Step n={3} icon={Hand} title="Touch everything">
              Hover and click the stars in the hero, drag the nodes of the skills network, and scroll slowly through the RAG pipeline
              to watch a document go from PDF to verified answer. Most things react.
            </Step>
            <Step
              n={4}
              icon={TerminalSquare}
              title="Explore by terminal"
              action={
                <button className="btn-ghost h-9 px-3.5 text-[13px]" onClick={() => closeThen(() => actions.toggleTerminal(true))}>
                  Open the terminal <ArrowRight className="h-4 w-4" />
                </button>
              }
            >
              Prefer a shell? Press <Kbd>`</Kbd> at any time. Try <span className="font-mono text-paper">help</span>,{" "}
              <span className="font-mono text-paper">fetch</span> or <span className="font-mono text-paper">sudo hire youssef</span>.
            </Step>
            <Step
              n={5}
              icon={Gamepad2}
              title="Play the mini-game"
              action={
                <button className="btn-ghost h-9 px-3.5 text-[13px]" onClick={() => closeThen(() => scrollToChapter("judge"))}>
                  Go to chapter 06 <ArrowRight className="h-4 w-4" />
                </button>
              }
            >
              In &ldquo;Spot the hallucination&rdquo; you are the LLM-as-a-Judge: six claims about me, some true and some made up.
            </Step>
            <Step n={6} icon={Gem} title="Collect discoveries">
              There are {ACHIEVEMENTS.length} hidden discoveries (you have {unlocked}). The <span className="text-signal">◆</span> counter in
              the top bar lists them, and locked ones show a hint.
            </Step>
            <Step
              n={7}
              icon={Timer}
              title="In a hurry?"
              action={
                <>
                  <button
                    className="btn-ghost h-9 px-3.5 text-[13px]"
                    onClick={() =>
                      closeThen(() => {
                        actions.setPersona("recruiter");
                        scrollToChapter("gateway");
                      })
                    }
                  >
                    Recruiter view
                  </button>
                  <button className="btn-ghost h-9 px-3.5 text-[13px]" onClick={() => closeThen(() => scrollToChapter("response"))}>
                    Jump to contact
                  </button>
                </>
              }
            >
              Switch to the recruiter view for a one-card summary, or go straight to the contact details.
            </Step>
          </ol>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-2xl border border-white/[0.07] px-4 py-3 text-[12px] text-dim">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">shortcuts</span>
            <span>
              <Kbd>`</Kbd> terminal
            </span>
            <span>
              <Kbd>?</Kbd> this guide
            </span>
            <span>
              <Kbd>Esc</Kbd> close
            </span>
            <span>
              <Kbd>P</Kbd>/<Kbd>F</Kbd> judge
            </span>
            <button
              className="ml-auto font-mono text-[11px] text-white/40 underline decoration-white/20 underline-offset-4 hover:text-paper"
              onClick={() => closeThen(() => actions.replayBoot())}
            >
              replay the intro
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Guide() {
  const open = useApp((s) => s.guideOpen);
  return <AnimatePresence>{open && <GuideDialog key="guide" />}</AnimatePresence>;
}

/** The header button that opens the guide, plus a one-time pointer that draws attention to it. */
export function GuideButton() {
  const phase = useApp((s) => s.phase);
  const guideOpen = useApp((s) => s.guideOpen);
  const [hint, setHint] = useState(false);

  useEffect(() => {
    if (phase !== "ready" || load("guide-seen", false)) return;
    // On phones, wait for the first discovery toast to clear so the screen never feels crowded.
    const delay = window.innerWidth < 640 ? 5200 : 1800;
    const show = window.setTimeout(() => setHint(true), delay);
    const hide = window.setTimeout(() => setHint(false), delay + 14000);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [phase]);

  useEffect(() => {
    if (guideOpen) setHint(false);
  }, [guideOpen]);

  const dismiss = () => {
    setHint(false);
    save("guide-seen", true);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => actions.toggleGuide()}
        aria-label="Open the usage guide (shortcut: ?)"
        title="Usage guide (?)"
        aria-expanded={guideOpen}
        className={cn(
          "inline-flex h-9 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition",
          hint ? "animate-beacon border-signal bg-signal text-ink" : "border-signal/40 bg-signal/10 text-signal hover:border-signal",
        )}
      >
        <BookOpen className="h-4 w-4" />
        Guide
      </button>
      <AnimatePresence>
        {hint && !guideOpen && app.get().phase === "ready" && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="absolute left-0 top-[52px] z-50 w-[228px] sm:w-[248px]"
          >
            <div className="relative rounded-2xl border border-signal/60 bg-ink-2/95 p-3.5 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-md sm:p-4">
              <span className="absolute -top-[7px] left-7 h-3 w-3 rotate-45 border-l border-t border-signal/60 bg-ink-2" />
              <p className="text-[14px] font-semibold text-paper">Need help exploring?</p>
              <p className="mt-1 text-[12.5px] leading-relaxed text-dim">
                <span className="hidden sm:inline">This site hides a lot. </span>The guide shows you everything in 30 seconds.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <button onClick={() => actions.toggleGuide(true)} className="btn-primary h-8 px-3 text-[12px]">
                  Open the guide
                </button>
                <button onClick={dismiss} className="h-8 rounded-full px-2.5 text-[12px] text-dim transition hover:text-paper">
                  Got it
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
