import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { CLUSTERS } from "@/data/chapters";
import { PERSONA_ORDER, PERSONAS, type Persona } from "@/data/personas";
import { actions, app } from "@/lib/app";
import { engine } from "@/lib/engine";
import { prefersReducedMotion } from "@/lib/navigation";
import { load } from "@/lib/persist";

const BANNER = [" __   __ _   _", " \\ \\ / /| | | |", "  \\ V / | |_| |", "   | |  |  _  |", "   |_|  |_| |_|"];

interface Line {
  tag: string;
  text: string;
  ok?: boolean;
}

function bootLines(): Line[] {
  const { stats } = engine;
  return [
    { tag: "boot", text: "yh-portfolio · build 2026.11 · profile=production" },
    { tag: "runtime", text: "react 18 · three.js · framer-motion" },
    { tag: "kb", text: `loaded ${stats.chunks} knowledge chunks across ${CLUSTERS.length} clusters` },
    { tag: "index", text: `bm25 index ready · ${stats.terms} terms · built in ${stats.buildMs.toFixed(1)} ms` },
    { tag: "vectors", text: `char-trigram space · ${stats.dims.toLocaleString("en-US")} dimensions · tf-idf weighted` },
    { tag: "judge", text: "grounding check armed · abstains without evidence" },
    { tag: "services", text: "spring-boot ✓   ai-rag ✓   gateway ✓" },
  ];
}

export function BootSequence() {
  const lines = useMemo(bootLines, []);
  const reduce = useMemo(() => prefersReducedMotion(), []);
  // Returning visitors get a fast boot with their saved persona; a replay always asks again.
  const returning = useMemo(() => app.get().bootCount === 0 && !!app.get().persona && load("visited", false), []);
  const [shown, setShown] = useState(reduce ? lines.length : 0);
  const [stamps, setStamps] = useState<number[]>(() => lines.map(() => performance.now()));
  const [ready, setReady] = useState<number | null>(reduce ? performance.now() : null);
  const [asking, setAsking] = useState(reduce && !returning);
  const firstOption = useRef<HTMLButtonElement>(null);
  const done = useRef(false);

  const finish = (persona?: Persona | null) => {
    if (done.current) return;
    done.current = true;
    actions.finishBoot(persona);
  };

  useEffect(() => {
    if (reduce) {
      if (returning) {
        const t = window.setTimeout(() => finish(app.get().persona), 400);
        return () => window.clearTimeout(t);
      }
      return;
    }
    const step = returning ? 70 : 230;
    const timers = lines.map((_, i) =>
      window.setTimeout(() => {
        setShown(i + 1);
        setStamps((prev) => prev.map((v, j) => (j === i ? performance.now() : v)));
      }, 350 + i * step),
    );
    const end = 350 + lines.length * step;
    timers.push(window.setTimeout(() => setReady(performance.now()), end));
    timers.push(
      window.setTimeout(
        () => {
          if (returning) finish(app.get().persona);
          else setAsking(true);
        },
        end + (returning ? 500 : 450),
      ),
    );
    return () => timers.forEach((t) => window.clearTimeout(t));
    // The sequence runs once per mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (asking) firstOption.current?.focus();
  }, [asking]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return finish(null);
      if (!asking) return;
      const index = ["1", "2", "3"].indexOf(e.key);
      if (index >= 0) finish(PERSONA_ORDER[index]);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [asking]);

  const t0 = stamps[0] ?? 0;

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Boot sequence"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-ink px-5 py-10"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: reduce ? 0 : 0.7, ease: [0.4, 0, 0.2, 1] } }}
    >
      <div className="w-full max-w-2xl font-mono text-[12px] leading-relaxed sm:text-[13px]">
        <pre aria-hidden className="mb-1 text-[11px] leading-[1.15] text-signal sm:text-[13px]">
          {BANNER.join("\n")}
        </pre>
        <p className="mb-6 text-dim">
          <span className="text-paper">:: youssef houssam ::</span>&nbsp;&nbsp;spring boot × ai rag&nbsp;&nbsp;
          <span className="text-white/30">(v2026)</span>
        </p>

        <ol className="space-y-1" aria-live="polite">
          {lines.slice(0, shown).map((line, i) => (
            <li key={line.tag} className="flex gap-3 text-dim">
              <span className="shrink-0 tabular-nums text-white/25">[{((stamps[i] - t0) / 1000).toFixed(3).padStart(7, " ")}]</span>
              <span className="w-[4.5rem] shrink-0 text-signal">{line.tag}</span>
              <span className="min-w-0 text-paper/80">{line.text}</span>
            </li>
          ))}
          {ready !== null && (
            <li className="flex gap-3">
              <span className="shrink-0 tabular-nums text-white/25">[{((ready - t0) / 1000).toFixed(3).padStart(7, " ")}]</span>
              <span className="w-[4.5rem] shrink-0 text-signal">ready</span>
              <span className="text-signal">Started YoussefHoussam in {(ready / 1000).toFixed(3)} seconds</span>
            </li>
          )}
        </ol>

        {asking ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8">
            <p id="boot-question" className="mb-4 text-paper">
              <span className="text-signal">❯</span> who&apos;s exploring today?
            </p>
            <div role="group" aria-labelledby="boot-question" className="grid gap-2 sm:grid-cols-3">
              {PERSONA_ORDER.map((persona, i) => (
                <button
                  key={persona}
                  ref={i === 0 ? firstOption : undefined}
                  onClick={() => finish(persona)}
                  className="group rounded-xl border border-white/10 bg-white/[0.02] p-4 text-left transition hover:border-signal/60 hover:bg-signal/[0.06] focus-visible:border-signal/60"
                >
                  <span className="flex items-center justify-between">
                    <span className="text-[14px] font-medium text-paper">{PERSONAS[persona].label}</span>
                    <span className="kbd">{i + 1}</span>
                  </span>
                  <span className="mt-1.5 block font-sans text-[13px] text-dim group-hover:text-paper/80">{PERSONAS[persona].blurb}</span>
                </button>
              ))}
            </div>
            <p className="mt-4 text-[11px] text-white/30">The site adapts to your answer. You can switch any time from the top bar.</p>
          </motion.div>
        ) : (
          <p className="mt-6 h-4 text-signal">
            <span className="animate-blink">▍</span>
          </p>
        )}
      </div>

      <button
        onClick={() => finish(null)}
        className="fixed bottom-5 right-5 rounded-full border border-white/10 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-dim transition hover:border-white/30 hover:text-paper"
      >
        skip intro <span className="ml-1 text-white/30">esc</span>
      </button>
    </motion.div>
  );
}
