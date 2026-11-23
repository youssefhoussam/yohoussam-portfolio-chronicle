import { useEffect, useRef, useState, type RefObject } from "react";
import { CHAPTERS, type ChapterId } from "@/data/chapters";
import { actions, app } from "@/lib/app";
import { engine } from "@/lib/engine";
import { prefersReducedMotion } from "@/lib/navigation";
import { profile } from "@/data/portfolio";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Tracks which chapter (span) the visitor is in, and how far through each one. */
export function useChapterTracking() {
  useEffect(() => {
    let raf = 0;
    const measure = () => {
      raf = 0;
      const mid = window.innerHeight * 0.5;
      let active: ChapterId = app.get().active;
      const progress = {} as Record<ChapterId, number>;
      for (const chapter of CHAPTERS) {
        const el = document.getElementById(chapter.id);
        if (!el) {
          progress[chapter.id] = 0;
          continue;
        }
        const rect = el.getBoundingClientRect();
        progress[chapter.id] = Math.round(clamp01((mid - rect.top) / rect.height) * 100) / 100;
        if (rect.top <= mid && rect.bottom > mid) active = chapter.id;
      }
      // At the very bottom of the page the last span is complete.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        active = "response";
        progress.response = 1;
      }
      const prev = app.get().progress;
      const changed = CHAPTERS.some((c) => prev[c.id] !== progress[c.id]);
      app.set(changed ? { active, progress } : { active });
      if (active === "response" && app.get().phase === "ready") actions.unlock("full-trace");
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(measure);
    };
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    measure();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);
}

const KONAMI = ["arrowup", "arrowup", "arrowdown", "arrowdown", "arrowleft", "arrowright", "arrowleft", "arrowright", "b", "a"];

const isEditable = (target: EventTarget | null) =>
  target instanceof HTMLElement && (target.isContentEditable || /^(input|textarea|select)$/i.test(target.tagName));

/** Global keyboard secrets: ` opens the terminal, the Konami code toggles debug mode, typing "hire" drops a hint. */
export function useSecrets() {
  useEffect(() => {
    let konami = 0;
    let typed = "";
    const onKey = (e: KeyboardEvent) => {
      if (app.get().phase !== "ready" || e.metaKey || e.ctrlKey || e.altKey) return;
      const key = e.key.toLowerCase();
      if (!isEditable(e.target)) {
        if (e.key === "`" || e.key === "~") {
          e.preventDefault();
          actions.toggleTerminal();
          return;
        }
        konami = key === KONAMI[konami] ? konami + 1 : key === KONAMI[0] ? 1 : 0;
        if (konami === KONAMI.length) {
          konami = 0;
          actions.toggleDebug();
        }
        if (key.length === 1) {
          typed = (typed + key).slice(-8);
          if (typed.endsWith("hire")) {
            typed = "";
            actions.toast("Typing it won't do it…", "…but the terminal might. Press ` and try sudo.");
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
}

/** A note for engineers who open DevTools, plus a tiny console API. */
export function useConsoleGreeting() {
  useEffect(() => {
    const w = window as unknown as { youssef?: unknown };
    if (w.youssef) return;
    const api = {
      hello() {
        actions.unlock("console");
        return "Hey, fellow engineer. Try youssef.ask('How does your hybrid retrieval work?')";
      },
      ask(question: string) {
        actions.unlock("console");
        const r = engine.search(String(question ?? ""));
        return { verdict: r.verdict, answer: r.answer, sources: r.hits.slice(0, 3).map((h) => h.chunk.title) };
      },
      hire() {
        actions.unlock("console");
        return `Excellent decision. ${profile.email}`;
      },
    };
    w.youssef = api;
    console.log(
      "%cyh_%c\nHi! This portfolio is a tiny RAG system.\nType youssef.hello() to say hi, youssef.ask('…') to query it, youssef.hire() for the obvious.",
      "font: 600 28px ui-monospace, monospace; color: #a3e635;",
      "font: 13px ui-monospace, monospace; color: #8b909a; line-height: 1.6;",
    );
  }, []);
}

/** Resolves text from random glyphs, like a decoding signal. */
export function useScramble(text: string, active: boolean, duration = 900) {
  const [output, setOutput] = useState(text);
  useEffect(() => {
    if (!active || prefersReducedMotion()) {
      setOutput(text);
      return;
    }
    const glyphs = "!<>-_\\/[]{}=+*^?#01";
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const revealed = Math.floor(p * text.length);
      let s = "";
      for (let i = 0; i < text.length; i++) {
        s += i < revealed || text[i] === " " ? text[i] : glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      setOutput(s);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, active, duration]);
  return output;
}

/** Close a popover on outside click or Escape. */
export function useDismiss(ref: RefObject<HTMLElement>, open: boolean, onClose: () => void) {
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close.current();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close.current();
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, ref]);
}

/** Locks page scroll while an overlay is open. */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return;
    const root = document.documentElement;
    const prev = root.style.overflow;
    root.style.overflow = "hidden";
    return () => {
      root.style.overflow = prev;
    };
  }, [locked]);
}

/** True once the element has been on screen. */
export function useSeen<T extends Element>(ref: RefObject<T>, margin = "0px") {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { rootMargin: margin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, seen]);
  return seen;
}
