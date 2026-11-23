import { AnimatePresence, motion } from "framer-motion";
import { Award, GraduationCap, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ChapterHeader } from "@/components/experience/ChapterHeader";
import { personaCopy } from "@/data/personas";
import { certifications, education } from "@/data/portfolio";
import { useApp } from "@/lib/app";
import { prefersReducedMotion } from "@/lib/navigation";
import { cn } from "@/lib/utils";

interface Dep {
  groupId: string;
  artifactId: string;
  version: string;
  title: string;
  issuer: string;
  period: string;
  description?: string;
  kind: "education" | "certification";
}

const DEPS: Dep[] = [
  ...education.map((e) => ({
    groupId: e.groupId,
    artifactId: e.artifactId,
    version: e.version,
    title: e.degree,
    issuer: e.school,
    period: e.period,
    description: e.description,
    kind: "education" as const,
  })),
  ...certifications.map((c) => ({
    groupId: c.groupId,
    artifactId: c.artifactId,
    version: c.year,
    title: c.name,
    issuer: c.issuer,
    period: c.year,
    kind: "certification" as const,
  })),
];

const Tag = ({ name, children }: { name: string; children: string }) => (
  <>
    <span className="text-signal">&lt;{name}&gt;</span>
    <span className="text-paper">{children}</span>
    <span className="text-signal">&lt;/{name}&gt;</span>
  </>
);

function PomView({ active, setActive }: { active: number; setActive: (i: number) => void }) {
  return (
    <div className="overflow-x-auto font-mono text-[12.5px] leading-[1.75]">
      <div className="min-w-[560px] px-5 py-4">
        <p className="text-white/35">&lt;!-- pom.xml · what youssef-houssam is built on --&gt;</p>
        <p>
          <span className="text-signal">&lt;dependencies&gt;</span>
        </p>
        {DEPS.map((d, i) => (
          <button
            key={d.artifactId}
            onMouseEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => setActive(i)}
            className={cn(
              "-mx-2 block w-[calc(100%+1rem)] rounded-lg px-2 py-1 text-left transition",
              active === i ? "bg-signal/[0.07] ring-1 ring-signal/30" : "hover:bg-white/[0.03]",
            )}
          >
            <span className="block pl-4">
              <span className="text-signal">&lt;dependency&gt;</span>
              {d.kind === "education" && <span className="ml-2 text-white/30">&lt;!-- {d.period} --&gt;</span>}
            </span>
            <span className="block pl-8">
              <Tag name="groupId">{d.groupId}</Tag>
            </span>
            <span className="block pl-8">
              <Tag name="artifactId">{d.artifactId}</Tag>
            </span>
            <span className="block pl-8">
              <Tag name="version">{d.version}</Tag>
            </span>
            {d.kind === "education" && (
              <span className="block pl-8">
                <Tag name="scope">compile</Tag>
              </span>
            )}
            <span className="block pl-4">
              <span className="text-signal">&lt;/dependency&gt;</span>
            </span>
          </button>
        ))}
        <p>
          <span className="text-signal">&lt;/dependencies&gt;</span>
        </p>
      </div>
    </div>
  );
}

function CardsView() {
  return (
    <div className="grid gap-3 p-4 sm:grid-cols-2 sm:p-5">
      {DEPS.map((d) => (
        <div key={d.artifactId} className={cn("rounded-xl border border-white/[0.07] bg-white/[0.02] p-4", d.kind === "education" && "sm:col-span-2")}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[15px] text-paper">{d.title}</p>
              <p className="text-[13px] text-signal">{d.issuer}</p>
            </div>
            <span className="shrink-0 font-mono text-[11px] text-dim">{d.period}</span>
          </div>
          {d.description && <p className="mt-2 text-[14px] leading-relaxed text-dim">{d.description}</p>}
        </div>
      ))}
    </div>
  );
}

function ResolveLog({ run }: { run: number }) {
  const lines = [
    "[INFO] Scanning for projects…",
    "[INFO] Building youssef-houssam:engineer:2026",
    ...DEPS.map((d) => `[INFO] ✓ resolved ${d.groupId}:${d.artifactId}:${d.version}`),
    "[INFO] ------------------------------------------------",
    `[INFO] BUILD SUCCESS · ${DEPS.length} dependencies · 0 conflicts`,
    "[INFO] Total time: 2.026 s",
  ];
  const [count, setCount] = useState(0);
  const timer = useRef(0);
  useEffect(() => {
    if (!run) return;
    if (prefersReducedMotion()) {
      setCount(lines.length);
      return;
    }
    setCount(0);
    let n = 0;
    timer.current = window.setInterval(() => {
      n++;
      setCount(n);
      if (n >= lines.length) window.clearInterval(timer.current);
    }, 140);
    return () => window.clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run]);
  if (!run) return null;
  return (
    <div className="border-t border-white/[0.06] bg-black/30 px-5 py-3 font-mono text-[11.5px] leading-relaxed" aria-live="polite">
      {lines.slice(0, count).map((l) => (
        <p key={l} className={l.includes("SUCCESS") ? "text-signal" : l.includes("✓") ? "text-paper/80" : "text-dim"}>
          {l}
        </p>
      ))}
    </div>
  );
}

export function Dependencies() {
  const persona = useApp((s) => s.persona);
  const [view, setView] = useState<"pom" | "cards">(personaCopy(persona).pom ? "pom" : "cards");
  const [active, setActive] = useState(0);
  const [run, setRun] = useState(0);
  const dep = DEPS[active];

  useEffect(() => {
    setView(personaCopy(persona).pom ? "pom" : "cards");
  }, [persona]);

  return (
    <section id="dependencies" data-debug="<Dependencies />" className="relative py-28 sm:py-36">
      <div className="shell">
        <ChapterHeader
          chapter="dependencies"
          title={
            <>
              Built on
              <br />
              <em className="text-signal pr-2">solid dependencies.</em>
            </>
          }
          lead="Every Spring Boot app declares what it depends on. These are mine: a State Engineering degree and the certifications along the way."
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <motion.div
            data-solid
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="panel overflow-hidden"
          >
            <div className="flex flex-wrap items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
              <div className="flex rounded-full border border-white/10 p-0.5 font-mono text-[11px]" role="tablist" aria-label="View">
                {(["pom", "cards"] as const).map((v) => (
                  <button
                    key={v}
                    role="tab"
                    aria-selected={view === v}
                    onClick={() => setView(v)}
                    className={cn("rounded-full px-3 py-1 transition", view === v ? "bg-paper text-ink" : "text-dim hover:text-paper")}
                  >
                    {v === "pom" ? "pom.xml" : "cards"}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setRun((r) => r + 1)}
                className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-signal/40 px-3 py-1 font-mono text-[11px] text-signal transition hover:bg-signal/10"
              >
                <Play className="h-3 w-3" /> mvn dependency:resolve
              </button>
            </div>
            {view === "pom" ? <PomView active={active} setActive={setActive} /> : <CardsView />}
            <ResolveLog run={run} />
          </motion.div>

          <div className="lg:sticky lg:top-24 lg:self-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={view === "pom" ? dep.artifactId : "summary"}
                data-solid
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="panel p-6"
              >
                {view === "pom" ? (
                  <>
                    {dep.kind === "education" ? <GraduationCap className="h-6 w-6 text-signal" /> : <Award className="h-6 w-6 text-signal" />}
                    <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                      {dep.kind} · {dep.period}
                    </p>
                    <h3 className="mt-2 font-display text-[30px] leading-[1.05] text-paper">{dep.title}</h3>
                    <p className="mt-1 text-[14px] text-signal">{dep.issuer}</p>
                    {dep.description && <p className="mt-3 text-[15px] leading-relaxed text-dim">{dep.description}</p>}
                    <p className="mt-5 font-mono text-[11px] text-white/30">
                      {dep.groupId}:{dep.artifactId}:{dep.version}
                    </p>
                  </>
                ) : (
                  <>
                    <GraduationCap className="h-6 w-6 text-signal" />
                    <h3 className="mt-4 font-display text-[30px] leading-[1.05] text-paper">State Engineer, Computer Science</h3>
                    <p className="mt-1 text-[14px] text-signal">EMSI Casablanca · 2021 — 2026</p>
                    <p className="mt-3 text-[15px] leading-relaxed text-dim">
                      Specialized in Software Engineering and Networks, plus {certifications.length} certifications in software design,
                      design patterns, React and Python.
                    </p>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
