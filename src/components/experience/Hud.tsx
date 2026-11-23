import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Lock, Menu, TerminalSquare } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ACHIEVEMENTS } from "@/data/achievements";
import { CHAPTER_MAP } from "@/data/chapters";
import { PERSONA_ORDER, PERSONAS } from "@/data/personas";
import { useDismiss } from "@/hooks/useExperience";
import { actions, useApp } from "@/lib/app";
import { scrollToChapter } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { GuideButton } from "./Guide";

export function HudButton({
  label,
  onClick,
  children,
  className,
  expanded,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
  className?: string;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      aria-expanded={expanded}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border border-white/10 bg-ink/60 px-3 font-mono text-[11px] text-dim transition hover:border-white/25 hover:text-paper",
        className,
      )}
    >
      {children}
    </button>
  );
}

function PersonaSwitch() {
  const persona = useApp((s) => s.persona);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <HudButton label="Change who you're viewing as" onClick={() => setOpen((o) => !o)} expanded={open}>
        <span className="hidden text-white/35 sm:inline">as</span>
        <span className="text-paper">{persona ? PERSONAS[persona].label : "visitor"}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </HudButton>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-11 w-64 rounded-2xl border border-white/10 bg-ink-2/95 p-1.5 shadow-2xl backdrop-blur-md"
          >
            <p className="px-3 pb-1 pt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">view the site as</p>
            {PERSONA_ORDER.map((p) => (
              <button
                key={p}
                onClick={() => {
                  actions.setPersona(p);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-white/[0.05]",
                  persona === p && "bg-white/[0.04]",
                )}
              >
                <span className={cn("mt-0.5 h-4 w-4 shrink-0", persona === p ? "text-signal" : "text-transparent")}>
                  <Check className="h-4 w-4" />
                </span>
                <span>
                  <span className="block text-[14px] text-paper">{PERSONAS[p].label}</span>
                  <span className="block text-[12px] text-dim">{PERSONAS[p].blurb}</span>
                </span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function AchievementList({ compact = false }: { compact?: boolean }) {
  const unlocked = useApp((s) => s.unlocked);
  return (
    <ul className={cn("grid gap-1", compact ? "grid-cols-1" : "sm:grid-cols-2")}>
      {ACHIEVEMENTS.map((a) => {
        const done = unlocked.includes(a.id);
        const Icon = done ? a.icon : Lock;
        return (
          <li key={a.id} className={cn("flex items-start gap-3 rounded-xl px-3 py-2.5", done ? "bg-signal/[0.06]" : "bg-white/[0.02]")}>
            <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", done ? "text-signal" : "text-white/25")} />
            <span className="min-w-0">
              <span className={cn("block text-[13px]", done ? "text-paper" : "text-white/40")}>{done ? a.title : "???"}</span>
              <span className="block text-[12px] leading-snug text-dim">{done ? a.description : a.hint}</span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function AchievementsMenu() {
  const unlocked = useApp((s) => s.unlocked);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useDismiss(ref, open, () => setOpen(false));
  return (
    <div ref={ref} className="relative">
      <HudButton
        label={`Achievements: ${unlocked.length} of ${ACHIEVEMENTS.length} discovered`}
        onClick={() => setOpen((o) => !o)}
        expanded={open}
      >
        <span className="text-signal">◆</span>
        <span className="tabular-nums text-paper">
          {unlocked.length}
          <span className="text-white/35">/{ACHIEVEMENTS.length}</span>
        </span>
      </HudButton>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-11 max-h-[70vh] w-[min(330px,calc(100vw-2rem))] overflow-y-auto rounded-2xl border border-white/10 bg-ink-2/95 p-2 shadow-2xl backdrop-blur-md"
          >
            <p className="px-3 pb-2 pt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white/35">
              discoveries · {unlocked.length}/{ACHIEVEMENTS.length}
            </p>
            <AchievementList compact />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function Hud() {
  const active = useApp((s) => s.active);
  const menuOpen = useApp((s) => s.menuOpen);
  const [scrolled, setScrolled] = useState(false);
  const clicks = useRef<number[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const onLogo = () => {
    scrollToChapter("gateway");
    const now = Date.now();
    clicks.current = [...clicks.current.filter((t) => now - t < 2000), now];
    if (clicks.current.length >= 5) {
      clicks.current = [];
      actions.replayBoot();
    }
  };

  const chapter = CHAPTER_MAP[active];

  return (
    <header
      data-debug="<Hud />"
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color] duration-300",
        scrolled ? "border-b border-white/[0.06] bg-ink/80 backdrop-blur-md" : "border-b border-transparent",
      )}
    >
      <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
        <button onClick={onLogo} aria-label="Back to the top" className="font-mono text-[15px] font-semibold tracking-tight text-paper">
          yh<span className="animate-blink text-signal">_</span>
        </button>
        <div className="hidden items-center gap-2 font-mono text-[11px] text-dim md:flex" aria-live="polite">
          <span className="h-1.5 w-1.5 rounded-full bg-signal shadow-[0_0_10px_rgba(245,165,36,0.8)]" />
          <span className="text-paper/80">{chapter.route}</span>
          <span className="text-white/25">·</span>
          <span>{chapter.label}</span>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <GuideButton />
          <div className="hidden sm:block">
            <PersonaSwitch />
          </div>
          <HudButton
            label="Open the terminal (shortcut: `)"
            onClick={() => actions.toggleTerminal()}
            className="border-signal/35 text-signal hover:border-signal hover:text-signal"
          >
            <TerminalSquare className="h-4 w-4" />
            <span className="hidden lg:inline">terminal</span>
            <span className="kbd hidden lg:inline-flex">`</span>
          </HudButton>
          <AchievementsMenu />
          <HudButton label="Open the chapter menu" onClick={() => actions.setMenu(true)} className="px-2.5 xl:hidden" expanded={menuOpen}>
            <Menu className="h-4 w-4" />
          </HudButton>
        </div>
      </div>
    </header>
  );
}
