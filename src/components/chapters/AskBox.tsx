import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, CornerDownLeft, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CHAPTER_MAP } from "@/data/chapters";
import { personaCopy } from "@/data/personas";
import { actions, app, useApp } from "@/lib/app";
import { prefersReducedMotion, scrollToChapter } from "@/lib/navigation";
import { RRF_K, type Retrieval } from "@/lib/retrieval";
import { cn } from "@/lib/utils";

/** Reveals the answer like a streamed LLM response (instantly with reduced motion). */
function Streamed({ text }: { text: string }) {
  const [count, setCount] = useState(() => (prefersReducedMotion() ? text.length : 0));
  useEffect(() => {
    if (prefersReducedMotion()) {
      setCount(text.length);
      return;
    }
    setCount(0);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const n = Math.min(text.length, Math.floor((now - start) / 9));
      setCount(n);
      if (n < text.length) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text]);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.slice(0, count)}
        {count < text.length && <span className="ml-0.5 inline-block h-[1.05em] w-[0.5ch] translate-y-[0.15em] bg-signal/80" />}
      </span>
    </>
  );
}

function JudgeBadge({ result }: { result: Retrieval }) {
  const pass = result.verdict === "PASS";
  const Icon = pass ? ShieldCheck : ShieldAlert;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em]",
        pass ? "border-signal/40 bg-signal/10 text-signal" : "border-rose-300/40 bg-rose-300/10 text-rose-200",
      )}
    >
      <Icon className="h-3.5 w-3.5" />
      judge · {pass ? (result.inspected ? "direct read" : `pass · grounded in ${Math.min(3, result.hits.length)}`) : "fail · abstained"}
    </span>
  );
}

export function AnswerCard({ result, onClose }: { result: Retrieval; onClose: () => void }) {
  const persona = useApp((s) => s.persona);
  const debug = personaCopy(persona).showDebug;
  const sources = result.verdict === "PASS" ? result.hits.slice(0, 3) : [];
  const ref = useRef<HTMLDivElement>(null);

  // If the answer lands below the fold, bring its first lines into view.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const t = window.setTimeout(() => {
      const top = el.getBoundingClientRect().top;
      if (top > window.innerHeight - 160) {
        window.scrollBy({ top: top - window.innerHeight * 0.45, behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
    }, 120);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <motion.div
      ref={ref}
      data-solid
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="panel mt-5 p-5 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-auto font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
          {result.inspected ? "chunk" : "answer"} · {result.inspected ? "read from the vector space" : `${result.tookMs.toFixed(2)} ms · local`}
        </span>
        <JudgeBadge result={result} />
        <button
          onClick={onClose}
          aria-label="Dismiss the answer"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-dim transition hover:bg-white/10 hover:text-paper"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mt-4 text-[17px] leading-relaxed text-paper">
        <Streamed text={result.answer} />
      </p>

      {sources.length > 0 && (
        <div className="mt-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">sources</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {sources.map((h) => {
              return (
                <li key={h.chunk.id}>
                  <button
                    onClick={() => scrollToChapter(h.chunk.chapter)}
                    className="group inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1.5 pl-2.5 pr-3 text-[13px] text-paper/90 transition hover:border-white/25"
                  >
                    <span className="h-2 w-2 rounded-full bg-signal shadow-[0_0_10px_rgba(245,165,36,0.8)]" />
                    {h.chunk.title}
                    <span className="font-mono text-[10px] text-white/35 group-hover:text-paper/70">
                      {CHAPTER_MAP[h.chunk.chapter].label}
                    </span>
                    <ArrowRight className="h-3 w-3 text-white/35 transition group-hover:translate-x-0.5 group-hover:text-paper" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {result.verdict === "FAIL" && (
        <p className="mt-4 text-[13px] text-dim">
          That&apos;s the point: a RAG system should say &ldquo;I don&apos;t know&rdquo; instead of hallucinating. The judge in my production platform does the same.
        </p>
      )}

      {debug && !result.inspected && result.hits.length > 0 && (
        <div className="mt-5 overflow-x-auto rounded-xl border border-white/[0.06]">
          <table className="w-full min-w-[460px] font-mono text-[11px]">
            <thead className="text-left text-white/40">
              <tr className="border-b border-white/[0.06]">
                <th className="px-3 py-2 font-normal">#</th>
                <th className="px-3 py-2 font-normal">chunk</th>
                <th className="px-3 py-2 text-right font-normal">bm25</th>
                <th className="px-3 py-2 text-right font-normal">cosine</th>
                <th className="px-3 py-2 text-right font-normal">rrf</th>
              </tr>
            </thead>
            <tbody>
              {result.hits.map((h, i) => (
                <tr key={h.chunk.id} className="border-b border-white/[0.04] last:border-0 text-paper/80">
                  <td className="px-3 py-1.5 text-white/40">{i + 1}</td>
                  <td className="px-3 py-1.5">{h.chunk.id}</td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {h.bm25.toFixed(2)} <span className="text-white/30">#{h.bm25Rank ?? "–"}</span>
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums">
                    {h.cosine.toFixed(2)} <span className="text-white/30">#{h.cosineRank ?? "–"}</span>
                  </td>
                  <td className="px-3 py-1.5 text-right tabular-nums text-signal">{h.rrf.toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="border-t border-white/[0.06] px-3 py-2 font-mono text-[10px] text-white/35">
            terms: {result.terms.join(" · ") || "∅"} · coverage {(result.coverage * 100).toFixed(0)}% · rrf k={RRF_K}, cosine weight 0.6
          </p>
        </div>
      )}

      <p className="mt-5 font-mono text-[10px] leading-relaxed text-white/30">
        BM25 + tf-idf char-trigram vectors · fused with Reciprocal Rank Fusion · runs in your browser · no LLM involved
      </p>
    </motion.div>
  );
}

export function AskBox() {
  const persona = useApp((s) => s.persona);
  const answer = useApp((s) => s.answer);
  const live = useApp((s) => s.live);
  const copy = personaCopy(persona);
  const [query, setQuery] = useState("");
  const [placeholder, setPlaceholder] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const id = window.setInterval(() => setPlaceholder((p) => (p + 1) % copy.suggestions.length), 3400);
    return () => window.clearInterval(id);
  }, [copy.suggestions.length]);

  // Answers can also come from a clicked star, the guide or the terminal: keep the box in sync.
  useEffect(() => {
    if (answer) setQuery(answer.query);
  }, [answer]);

  const onChange = (value: string) => {
    setQuery(value);
    actions.typeQuery(value);
    if (!value.trim() && app.get().answer) actions.clearAnswer();
  };

  const submit = (text: string) => {
    setQuery(text);
    actions.ask(text);
  };

  const top = live && !live.inspected && query.trim() ? live.hits[0] : null;

  return (
    <div className="mt-9">
      <form
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          submit(query);
        }}
        className="group relative flex items-center rounded-2xl border border-white/[0.12] bg-ink-2/80 shadow-[0_20px_70px_rgba(0,0,0,0.45)] transition focus-within:border-signal/50 focus-within:shadow-[0_0_0_4px_rgba(245,165,36,0.08),0_20px_70px_rgba(0,0,0,0.45)]"
      >
        <label htmlFor="ask" className="sr-only">
          Ask the portfolio a question
        </label>
        <span aria-hidden className="pl-4 font-mono text-[15px] text-signal">
          ❯
        </span>
        <input
          id="ask"
          ref={inputRef}
          value={query}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Ask: ${copy.suggestions[placeholder % copy.suggestions.length]}`}
          autoComplete="off"
          spellCheck={false}
          className="min-w-0 flex-1 bg-transparent px-3 py-4 text-[16px] text-paper outline-none placeholder:text-white/30 sm:text-[17px]"
        />
        {copy.showDebug && top && (
          <span className="mr-2 hidden max-w-[220px] truncate font-mono text-[10px] text-white/40 md:inline">
            top: <span className="text-paper/70">{top.chunk.id}</span> · {top.relevance.toFixed(2)}
          </span>
        )}
        <button
          type="submit"
          className="m-1.5 inline-flex items-center gap-2 rounded-xl bg-signal px-4 py-2.5 text-[14px] font-medium text-ink transition hover:bg-[#ffb84a] disabled:opacity-40"
          disabled={!query.trim()}
        >
          Ask <CornerDownLeft className="h-4 w-4" />
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {copy.suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => submit(s)}
            className="rounded-full border border-white/10 bg-ink/50 px-3 py-1.5 text-[13px] text-dim transition hover:border-white/25 hover:text-paper"
          >
            {s}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {answer && (
          <AnswerCard
            key={`${answer.query}-${answer.verdict}-${answer.inspected ? "i" : "q"}`}
            result={answer}
            onClose={() => {
              actions.clearAnswer();
              setQuery("");
              inputRef.current?.focus();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
