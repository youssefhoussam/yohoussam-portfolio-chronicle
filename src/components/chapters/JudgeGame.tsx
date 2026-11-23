import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Check, Gavel, RotateCcw, X } from "lucide-react";
import { useEffect, useState } from "react";
import { ChapterHeader } from "@/components/experience/ChapterHeader";
import { CHAPTER_MAP } from "@/data/chapters";
import { dealClaims, rankFor, ROUNDS, type Claim } from "@/data/judge";
import { actions, app } from "@/lib/app";
import { scrollToChapter } from "@/lib/navigation";
import { cn } from "@/lib/utils";

type Phase = "intro" | "play" | "done";

export function JudgeGame() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [deck, setDeck] = useState<Claim[]>(() => dealClaims());
  const [round, setRound] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [choice, setChoice] = useState<boolean | null>(null);

  const claim = deck[round];
  const score = answers.filter(Boolean).length;
  const revealed = choice !== null;
  const correct = revealed && claim ? choice === claim.grounded : false;

  const start = () => {
    setDeck(dealClaims());
    setRound(0);
    setAnswers([]);
    setChoice(null);
    setPhase("play");
  };

  const judge = (grounded: boolean) => {
    if (revealed || !claim) return;
    setChoice(grounded);
    setAnswers((a) => [...a, grounded === claim.grounded]);
  };

  const next = () => {
    if (round + 1 >= ROUNDS) {
      setPhase("done");
      if (score >= 5) actions.unlock("judge");
      return;
    }
    setRound((r) => r + 1);
    setChoice(null);
  };

  // Keyboard: P = pass, F = fail, Enter = next. Only while this chapter is on screen.
  useEffect(() => {
    if (phase !== "play") return;
    const onKey = (e: KeyboardEvent) => {
      if (app.get().active !== "judge" || app.get().terminalOpen) return;
      const target = e.target as HTMLElement;
      if (/^(input|textarea)$/i.test(target.tagName)) return;
      const k = e.key.toLowerCase();
      if (k === "p") judge(true);
      else if (k === "f") judge(false);
      else if (k === "enter" && revealed) next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const rank = rankFor(score);

  return (
    <section id="judge" data-debug="<JudgeGame />" className="relative py-28 sm:py-36">
      <div className="shell">
        <ChapterHeader
          chapter="judge"
          title={
            <>
              Your turn:
              <br />
              <em className="text-tracks pr-2">spot the hallucination.</em>
            </>
          }
          lead="I built an LLM-as-a-Judge to catch made-up answers. Here, you're the judge. A deliberately unreliable model wrote six claims about me. PASS the grounded ones, FAIL the hallucinations."
        />

        <div data-solid className="panel mx-auto max-w-3xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-3 font-mono text-[11px] text-dim">
            <span className="inline-flex items-center gap-2">
              <Gavel className="h-3.5 w-3.5 text-spring" /> judge-console
            </span>
            {phase === "play" && (
              <span className="flex items-center gap-3">
                <span className="flex gap-1">
                  {Array.from({ length: ROUNDS }, (_, i) => (
                    <span
                      key={i}
                      className={cn(
                        "h-1.5 w-5 rounded-full",
                        i < answers.length ? (answers[i] ? "bg-spring" : "bg-rose-400") : i === round ? "bg-white/40" : "bg-white/10",
                      )}
                    />
                  ))}
                </span>
                <span className="tabular-nums">
                  {score}/{ROUNDS}
                </span>
              </span>
            )}
          </div>

          <div className="relative min-h-[340px] p-6 sm:p-8">
            <AnimatePresence mode="wait">
              {phase === "intro" && (
                <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex min-h-[280px] flex-col items-start justify-center">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">6 rounds · keyboard: P / F / Enter</p>
                  <h3 className="mt-3 max-w-xl font-display text-[36px] leading-[1.05] text-paper sm:text-[44px]">
                    Can you out-judge my judge?
                  </h3>
                  <p className="mt-3 max-w-lg text-[15px] text-dim">
                    Every claim is checked against the facts in this portfolio. Score 5 or more to earn a discovery.
                  </p>
                  <button onClick={start} className="btn-primary mt-7">
                    Start evaluating <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {phase === "play" && claim && (
                <motion.div
                  key={claim.id}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={{ duration: 0.28 }}
                >
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
                    round {round + 1} / {ROUNDS} · model output
                  </p>
                  <blockquote className="mt-4 border-l-2 border-neural/60 pl-5 text-[21px] leading-snug text-paper sm:text-[24px]">
                    &ldquo;{claim.claim}&rdquo;
                  </blockquote>

                  {!revealed ? (
                    <div className="mt-8 grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => judge(true)}
                        className="group flex items-center justify-between rounded-2xl border border-spring/30 bg-spring/[0.06] px-5 py-4 text-left transition hover:border-spring hover:bg-spring/[0.12]"
                      >
                        <span>
                          <span className="block font-mono text-[13px] font-semibold tracking-[0.14em] text-spring">PASS</span>
                          <span className="block text-[13px] text-dim">grounded in the facts</span>
                        </span>
                        <span className="kbd">P</span>
                      </button>
                      <button
                        onClick={() => judge(false)}
                        className="group flex items-center justify-between rounded-2xl border border-rose-400/30 bg-rose-400/[0.06] px-5 py-4 text-left transition hover:border-rose-400 hover:bg-rose-400/[0.12]"
                      >
                        <span>
                          <span className="block font-mono text-[13px] font-semibold tracking-[0.14em] text-rose-300">FAIL</span>
                          <span className="block text-[13px] text-dim">hallucinated</span>
                        </span>
                        <span className="kbd">F</span>
                      </button>
                    </div>
                  ) : (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-8" aria-live="polite">
                      <div
                        className={cn(
                          "rounded-2xl border p-5",
                          correct ? "border-spring/40 bg-spring/[0.07]" : "border-rose-400/40 bg-rose-400/[0.07]",
                        )}
                      >
                        <p className={cn("flex items-center gap-2 font-mono text-[12px] font-semibold uppercase tracking-[0.16em]", correct ? "text-spring" : "text-rose-300")}>
                          {correct ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          {correct ? "correct verdict" : "the model fooled you"}
                        </p>
                        <p className="mt-2 text-[15px] leading-relaxed text-paper/90">{claim.truth}</p>
                        <button
                          onClick={() => scrollToChapter(claim.chapter)}
                          className="mt-3 font-mono text-[11px] text-dim underline decoration-white/20 underline-offset-4 hover:text-paper"
                        >
                          source: {CHAPTER_MAP[claim.chapter].label} →
                        </button>
                      </div>
                      <button onClick={next} className="btn-primary mt-5">
                        {round + 1 >= ROUNDS ? "See your verdict" : "Next claim"} <ArrowRight className="h-4 w-4" />
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}

              {phase === "done" && (
                <motion.div key="done" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="flex min-h-[280px] flex-col items-start justify-center">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">final verdict</p>
                  <p className="mt-3 font-display text-[64px] leading-none text-paper sm:text-[84px]">
                    {score}
                    <span className="text-white/25">/{ROUNDS}</span>
                  </p>
                  <h3 className={cn("mt-3 font-display text-[32px] leading-tight", score >= 5 ? "text-spring" : "text-paper")}>{rank.title}</h3>
                  <p className="mt-2 max-w-lg text-[15px] text-dim">{rank.note}</p>
                  <div className="mt-7 flex flex-wrap gap-2">
                    <button onClick={start} className="btn-ghost">
                      <RotateCcw className="h-4 w-4" /> Play again
                    </button>
                    <button onClick={() => scrollToChapter("response")} className="btn-primary">
                      Hire the original judge <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
