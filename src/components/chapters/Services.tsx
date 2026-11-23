import { motion } from "framer-motion";
import { Boxes, BrainCircuit } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import portrait from "@/assets/youssef.jpg";
import { ChapterHeader } from "@/components/experience/ChapterHeader";
import { profile, skillNamespaces, type NamespaceId } from "@/data/portfolio";
import { useSeen } from "@/hooks/useExperience";
import { actions } from "@/lib/app";
import { NamespaceButtons, ServiceMesh } from "./ServiceMesh";

const FACTS: [string, string][] = [
  ["status", "Open to full-time roles"],
  ["degree", `${profile.degree} — EMSI, ${profile.graduation}`],
  ["base", profile.location],
  ["mobility", "Open to relocation · remote-friendly"],
  ["teams", "English-first, international"],
];

const TRACKS = [
  {
    cluster: "spring" as const,
    icon: Boxes,
    color: "#a3e635",
    kicker: "track 01 · spring boot",
    title: "Backends that scale",
    points: [
      "Spring Boot microservices and REST APIs",
      "Clean, service-oriented architecture",
      "A four-service start-up incubation platform on PostgreSQL",
      "Java · Python · Laravel · ASP.NET Core",
    ],
  },
  {
    cluster: "rag" as const,
    icon: BrainCircuit,
    color: "#a78bfa",
    kicker: "track 02 · ai rag",
    title: "AI that retrieves the right answer",
    points: [
      "A production RAG platform at OCP Solutions",
      "Hybrid retrieval: semantic + BM25, fused with RRF",
      "Graph RAG with NetworkX",
      "LLM-as-a-Judge evaluation with PASS/FAIL scoring",
    ],
  },
];

function IdentityCard() {
  return (
    <motion.figure
      data-solid
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="panel group overflow-hidden"
    >
      <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/5] lg:aspect-[4/5]">
        <img
          src={portrait}
          alt="Portrait of Youssef Houssam"
          loading="lazy"
          className="h-full w-full object-cover grayscale contrast-[1.08] transition duration-700 group-hover:scale-[1.02] group-hover:grayscale-0"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_45%,rgba(6,7,10,0.92))]" />
        <div className="scanline pointer-events-none absolute inset-x-0 top-0 h-24" />
        <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4 font-mono text-[11px] text-paper/80">
          <span>identity-service</span>
          <span className="inline-flex items-center gap-1.5 text-spring">
            <span className="h-1.5 w-1.5 rounded-full bg-spring" /> healthy
          </span>
        </figcaption>
      </div>
      <dl className="divide-y divide-white/[0.06] px-4">
        {FACTS.map(([k, v]) => (
          <div key={k} className="grid grid-cols-[84px_1fr] gap-3 py-2.5 text-[13px]">
            <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/35">{k}</dt>
            <dd className="text-paper/90">{v}</dd>
          </div>
        ))}
      </dl>
    </motion.figure>
  );
}

export function Services() {
  const [selected, setSelected] = useState<NamespaceId | null>(null);
  const meshRef = useRef<HTMLDivElement>(null);
  const seen = useSeen(meshRef, "-25% 0px");
  const ns = skillNamespaces.find((n) => n.id === selected) ?? null;

  // The first time the mesh scrolls into view, fire a request at the Spring Boot namespace.
  useEffect(() => {
    if (!seen) return;
    const t = window.setTimeout(() => setSelected((s) => s ?? "backend"), 500);
    return () => window.clearTimeout(t);
  }, [seen]);

  const latency = ns ? 12 + ns.skills.length * 3 : 0;

  return (
    <section id="services" data-debug="<Services />" className="relative py-28 sm:py-36">
      <div className="shell">
        <ChapterHeader
          chapter="services"
          title={
            <>
              Two tracks.
              <br />
              <em className="text-tracks pr-2">One engineer.</em>
            </>
          }
          lead={
            <>
              I&apos;m a State Engineer in Computer Science (EMSI, 2026). I work where backend engineering meets applied AI:
              Spring Boot services that scale, and RAG platforms that retrieve the right answer, and can prove it.
            </>
          }
        />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
          <IdentityCard />

          <motion.div
            ref={meshRef}
            data-solid
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="panel flex min-w-0 flex-col overflow-hidden"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 font-mono text-[11px] text-dim">
              <span>
                service-mesh · {skillNamespaces.length} namespaces ·{" "}
                {skillNamespaces.reduce((n, s) => n + s.skills.length, 0)} services
              </span>
              <span className="hidden text-white/30 sm:inline">drag the nodes · click a hub</span>
            </div>
            <div className="px-2 pt-2 sm:px-4">
              <ServiceMesh selected={selected} onRequest={setSelected} />
            </div>
            <div className="border-t border-white/[0.06] p-4">
              <NamespaceButtons selected={selected} onRequest={setSelected} />
              <div className="mt-4 min-h-[132px]" aria-live="polite">
                {ns ? (
                  <>
                    <p className="font-mono text-[11px] text-dim">
                      <span className="text-spring">HTTP/1.1 200 OK</span> · {ns.skills.length} services · {latency}ms ·{" "}
                      <span style={{ color: ns.color }}>{ns.title}</span>
                    </p>
                    <ul className="mt-3 grid gap-x-6 gap-y-1.5 sm:grid-cols-2">
                      {ns.skills.map((s) => (
                        <li key={s.name} className="flex items-baseline gap-2 text-[14px]">
                          <span className="h-1.5 w-1.5 shrink-0 translate-y-[-2px] rounded-full" style={{ background: ns.color }} />
                          <span className="text-paper">{s.name}</span>
                          {s.note && <span className="truncate text-[12px] text-dim">· {s.note}</span>}
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <p className="font-mono text-[11px] text-white/35">// send a request to a namespace to list its services</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
          {TRACKS.map((track, i) => (
            <motion.article
              key={track.cluster}
              data-solid
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              onMouseEnter={() => actions.focusCluster(track.cluster)}
              onMouseLeave={() => actions.focusCluster(null)}
              className="panel group relative overflow-hidden p-6 sm:p-7"
            >
              <div
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full opacity-20 blur-3xl transition-opacity duration-500 group-hover:opacity-40"
                style={{ background: track.color }}
              />
              <track.icon className="h-6 w-6" style={{ color: track.color }} />
              <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: track.color }}>
                {track.kicker}
              </p>
              <h3 className="mt-2 font-display text-[34px] leading-[1.02] text-paper">{track.title}</h3>
              <ul className="mt-5 space-y-2">
                {track.points.map((p) => (
                  <li key={p} className="flex gap-3 text-[15px] text-paper/80">
                    <span className="font-mono text-[12px] leading-6" style={{ color: track.color }}>
                      +
                    </span>
                    {p}
                  </li>
                ))}
              </ul>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
