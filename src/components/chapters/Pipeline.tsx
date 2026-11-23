import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Layers } from "lucide-react";
import { useRef, useState } from "react";
import { ChapterHeader } from "@/components/experience/ChapterHeader";
import { experiences } from "@/data/portfolio";
import { scrollToY } from "@/lib/navigation";
import { cn } from "@/lib/utils";
import { PipelineVisual } from "./PipelineVisual";

const STEPS = [
  { label: "Ingest", tech: "Docling", title: "Parse every document", body: "Documents are parsed with Docling into clean, structured text, tables included." },
  {
    label: "Chunk",
    tech: "Small-to-Big",
    title: "Split small, keep context big",
    body: "Small chunks are matched precisely, then their parent sections are returned for context: the Small-to-Big strategy.",
  },
  { label: "Embed", tech: "vectors", title: "Turn text into vectors", body: "Each chunk becomes an embedding, so similar meanings end up close together in vector space." },
  { label: "Index", tech: "Milvus · MinIO", title: "Index for retrieval", body: "Embeddings are indexed in Milvus, with MinIO as the object storage layer." },
  {
    label: "Retrieve",
    tech: "semantic + BM25 · RRF",
    title: "Hybrid retrieval",
    body: "Semantic search and BM25 keyword search run side by side, then Reciprocal Rank Fusion merges the two rankings.",
  },
  {
    label: "Graph",
    tech: "NetworkX",
    title: "Follow the connections",
    body: "A Graph RAG extension uses NetworkX to bring in related entities that plain similarity search would miss.",
  },
  {
    label: "Generate",
    tech: "vLLM · Gradio",
    title: "Answer from evidence",
    body: "vLLM serves the model, which answers from the retrieved context. Gradio powers the playground interface.",
  },
  {
    label: "Judge",
    tech: "LLM-as-a-Judge",
    title: "Score every answer",
    body: "An LLM-as-a-Judge module evaluates each answer automatically and returns a PASS or FAIL verdict.",
  },
];

const LAYERS = ["Use Cases", "Pipeline", "Engine", "SDK"];

export function Pipeline() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [step, setStep] = useState(0);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ["start start", "end end"] });
  const job = experiences[0];

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setStep(Math.min(STEPS.length - 1, Math.max(0, Math.floor(v * STEPS.length))));
  });

  const goTo = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const scrollable = el.offsetHeight - window.innerHeight;
    scrollToY(top + ((i + 0.5) / STEPS.length) * scrollable);
  };

  const current = STEPS[step];

  return (
    <section id="pipeline" data-debug="<Pipeline />" className="relative pt-28 sm:pt-36">
      <div className="shell">
        <ChapterHeader
          chapter="pipeline"
          title={
            <>
              The flagship:
              <br />
              <em className="text-tracks pr-2">a RAG platform in production.</em>
            </>
          }
          lead={
            <>
              At {job.company} ({job.period}, final-year project) I designed a four-layer modular RAG platform that is now
              deployed in production. Scroll to send a document through it.
            </>
          }
        />
      </div>

      <div ref={trackRef} className="relative" style={{ height: `${100 + STEPS.length * 55}vh` }}>
        <div className="sticky top-0 flex h-[100svh] items-center pt-14">
          <div className="mx-auto grid w-full max-w-[1320px] grid-cols-1 items-center gap-4 px-5 sm:px-8 lg:grid-cols-[210px_minmax(0,1fr)_270px] lg:gap-8 xl:pl-28 xl:pr-12">

            {/* step list (desktop) */}
            <ol className="relative hidden lg:block" aria-label="Pipeline stages">
              <span className="absolute bottom-3 left-[13px] top-3 w-px bg-white/10" />
              <motion.span
                className="absolute left-[13px] top-3 w-px origin-top bg-spring"
                style={{ height: "calc(100% - 24px)", scaleY: scrollYProgress }}
              />
              {STEPS.map((s, i) => (
                <li key={s.label}>
                  <button onClick={() => goTo(i)} className="group relative flex w-full items-center gap-4 py-2 text-left">
                    <span
                      className={cn(
                        "relative z-10 flex h-[27px] w-[27px] items-center justify-center rounded-full border font-mono text-[10px] transition",
                        i === step ? "border-spring bg-spring text-ink" : i < step ? "border-spring/50 bg-ink text-spring" : "border-white/15 bg-ink text-white/40",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className={cn("block text-[15px] transition", i === step ? "text-paper" : "text-dim group-hover:text-paper")}>{s.label}</span>
                      <span className="block font-mono text-[10px] text-white/30">{s.tech}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>

            {/* visual */}
            <div data-solid className="panel relative mx-auto aspect-square w-full max-w-[min(600px,48svh)] p-3 lg:max-w-[min(600px,74svh)]">
              <PipelineVisual step={step} />
            </div>

            {/* caption */}
            <div className="min-h-[150px] lg:min-h-[220px]" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-spring">
                    {String(step + 1).padStart(2, "0")} / {String(STEPS.length).padStart(2, "0")} · {current.tech}
                  </p>
                  <h3 className="mt-2 font-display text-[30px] leading-[1.05] text-paper sm:text-[36px]">{current.title}</h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-dim">{current.body}</p>
                </motion.div>
              </AnimatePresence>
              {/* step dots (mobile) */}
              <div className="mt-5 flex gap-1.5 lg:hidden">
                {STEPS.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => goTo(i)}
                    aria-label={`Go to stage ${i + 1}: ${s.label}`}
                    className={cn("h-1.5 flex-1 rounded-full transition", i <= step ? "bg-spring" : "bg-white/15")}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="shell pb-28 pt-6 sm:pb-36">
        <motion.div
          data-solid
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6 }}
          className="panel grid gap-6 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
        >
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">architecture</p>
            <div className="mt-4 space-y-1.5">
              {LAYERS.map((layer, i) => (
                <div
                  key={layer}
                  className="flex items-center justify-between rounded-lg border border-white/[0.07] px-4 py-2.5"
                  style={{ background: `rgba(167,139,250,${0.04 + (3 - i) * 0.025})`, marginLeft: `${i * 4}%`, marginRight: `${i * 4}%` }}
                >
                  <span className="text-[14px] text-paper">{layer}</span>
                  <span className="font-mono text-[10px] text-white/35">layer {4 - i}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <Layers className="h-6 w-6 text-neural" />
            <h3 className="mt-3 font-display text-[30px] leading-tight text-paper">Bring your own model.</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-dim">
              A BYOM abstraction framework of five abstract base classes makes every component swappable, so the platform stays
              plug-and-play instead of being locked to a single model.
            </p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {job.technologies.map((t) => (
                <li key={t} className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] text-paper/80">
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
