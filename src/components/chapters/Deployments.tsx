import { AnimatePresence, motion } from "framer-motion";
import { Github } from "lucide-react";
import { useState, type CSSProperties, type PointerEvent } from "react";
import { ChapterHeader } from "@/components/experience/ChapterHeader";
import { projects, type Project, type Track } from "@/data/portfolio";
import { prefersReducedMotion } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const FILTERS: { id: Track | "all"; flag: string }[] = [
  { id: "all", flag: "--all" },
  { id: "spring-boot", flag: "--track=spring-boot" },
  { id: "ai-rag", flag: "--track=ai-rag" },
  { id: "web", flag: "--track=web" },
  { id: "mobile", flag: "--track=mobile" },
];

const TRACK_COLORS: Record<Track, string> = {
  "spring-boot": "#a3e635",
  "ai-rag": "#a78bfa",
  web: "#7dd3fc",
  mobile: "#5eead4",
};

function DeploymentCard({ project, index }: { project: Project; index: number }) {
  const color = TRACK_COLORS[project.tracks[0]];
  const onMove = (e: PointerEvent<HTMLElement>) => {
    if (e.pointerType !== "mouse" || prefersReducedMotion()) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty("--mx", `${x * 100}%`);
    el.style.setProperty("--my", `${y * 100}%`);
    el.style.setProperty("--rx", `${(0.5 - y) * 4}deg`);
    el.style.setProperty("--ry", `${(x - 0.5) * 5}deg`);
  };
  const onLeave = (e: PointerEvent<HTMLElement>) => {
    e.currentTarget.style.setProperty("--rx", "0deg");
    e.currentTarget.style.setProperty("--ry", "0deg");
  };

  return (
    <motion.article
      layout
      data-solid
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.15 } }}
      transition={{ duration: 0.45, delay: index * 0.05 }}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={cn("group", project.featured && "md:col-span-2")}
      style={{ "--accent": color } as CSSProperties}
    >
      <div className="deploy-card panel relative h-full overflow-hidden p-6 sm:p-7">
      <div className="spotlight pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-[11px]">
          <span className="inline-flex items-center gap-2 text-paper/80">
            <span className="relative flex h-2 w-2">
              {project.live && <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: color }} />}
              <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: project.live ? color : "#ffffff40" }} />
            </span>
            {project.slug}
          </span>
          <span className={cn("ml-auto rounded-full border px-2 py-0.5 uppercase tracking-[0.14em]", project.live ? "text-ink" : "text-dim")} style={project.live ? { background: color, borderColor: color } : { borderColor: "#ffffff1a" }}>
            {project.status}
          </span>
        </div>

        <h3 className={cn("mt-5 font-display leading-[1.02] text-paper", project.featured ? "text-[40px] sm:text-[52px]" : "text-[32px]")}>{project.title}</h3>
        <p className="mt-1.5 text-[14px]" style={{ color }}>
          {project.subtitle}
        </p>
        <p className={cn("mt-4 leading-relaxed text-paper/80", project.featured ? "max-w-3xl text-[16px]" : "text-[15px]")}>{project.description}</p>
        <p className="mt-3 text-[14px] leading-relaxed text-dim">{project.details}</p>

        {project.featured && (
          <div className="mt-6 flex flex-wrap items-center gap-2 font-mono text-[11px] text-paper/80">
            {["SDK", "Engine", "Pipeline", "Use Cases"].map((layer, i) => (
              <span key={layer} className="inline-flex items-center gap-2">
                {i > 0 && <span className="text-white/25">→</span>}
                <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-1">{layer}</span>
              </span>
            ))}
            <span className="ml-1 text-white/35">+ BYOM · hybrid retrieval · Graph RAG · LLM-as-a-Judge</span>
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
          <ul className="flex flex-wrap gap-1.5">
            {project.technologies.map((t) => (
              <li key={t} className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[11px] text-paper/75">
                {t}
              </li>
            ))}
          </ul>
          {project.github && (
            <a href={project.github} target="_blank" rel="noreferrer" className="btn-ghost">
              <Github className="h-4 w-4" /> Source
            </a>
          )}
        </div>
      </div>
      </div>
    </motion.article>
  );
}

export function Deployments() {
  const [filter, setFilter] = useState<Track | "all">("all");
  const flag = FILTERS.find((f) => f.id === filter)?.flag ?? "--all";
  const visible = filter === "all" ? projects : projects.filter((p) => p.tracks.includes(filter));

  return (
    <section id="deployments" data-debug="<Deployments />" className="relative py-28 sm:py-36">
      <div className="shell">
        <ChapterHeader
          chapter="deployments"
          title={
            <>
              Things I&apos;ve
              <br />
              <em className="text-tracks pr-2">shipped.</em>
            </>
          }
          lead="Five deployments across Spring Boot microservices, AI retrieval, web and mobile. Filter them like a cluster."
        />

        <div className="mb-6 flex flex-col gap-3" data-solid>
          <p className="font-mono text-[12px] text-dim">
            <span className="text-spring">$</span> yh deploy ls <span className="text-paper">{flag}</span>{" "}
            <span className="text-white/30">
              · {visible.length} {visible.length === 1 ? "deployment" : "deployments"}
            </span>
          </p>
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                aria-pressed={filter === f.id}
                className={cn(
                  "rounded-full border px-3 py-1.5 font-mono text-[11px] transition",
                  filter === f.id ? "border-spring bg-spring text-ink" : "border-white/10 text-dim hover:border-white/25 hover:text-paper",
                )}
              >
                {f.flag}
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <AnimatePresence mode="popLayout">
            {visible.map((p, i) => (
              <DeploymentCard key={p.id} project={p} index={i} />
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
}
