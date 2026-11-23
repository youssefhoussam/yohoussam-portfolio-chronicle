import { AnimatePresence, motion } from "framer-motion";
import { ChevronRight, MapPin } from "lucide-react";
import { useState } from "react";
import { ChapterHeader } from "@/components/experience/ChapterHeader";
import { experiences, profile, type Experience } from "@/data/portfolio";
import { useApp } from "@/lib/app";
import { shortHash } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const MAIN = "#f4f1ea";
const LANE0 = 15;
const LANE1 = 43;

/** Gutter for a commit on main: a straight line with a dot. */
function MainGutter({ first, last, head }: { first?: boolean; last?: boolean; head?: boolean }) {
  return (
    <div className="relative w-[58px] shrink-0">
      <span
        className="absolute w-[2px] bg-white/15"
        style={{ left: LANE0 - 1, top: first ? 30 : 0, bottom: last ? "calc(100% - 30px)" : 0 }}
      />
      <span
        className={cn("absolute h-[14px] w-[14px] rounded-full border-2", head ? "bg-signal" : "bg-ink")}
        style={{ left: LANE0 - 7, top: 23, borderColor: head ? "#f5a524" : MAIN, boxShadow: head ? "0 0 0 6px rgba(245,165,36,0.15)" : undefined }}
      />
    </div>
  );
}

/** Gutter for a feature branch: forks off main below, merges back above. */
function BranchGutter({ color }: { color: string }) {
  return (
    <div className="relative w-[58px] shrink-0">
      <span className="absolute inset-y-0 w-[2px] bg-white/15" style={{ left: LANE0 - 1 }} />
      <svg className="absolute left-0 top-0" width="58" height="26" aria-hidden>
        <path d={`M ${LANE0} 0 C ${LANE0} 16, ${LANE1} 10, ${LANE1} 26`} fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.8" />
      </svg>
      <span className="absolute w-[2px]" style={{ left: LANE1 - 1, top: 26, bottom: 26, background: color, opacity: 0.8 }} />
      <svg className="absolute bottom-0 left-0" width="58" height="26" aria-hidden>
        <path d={`M ${LANE1} 0 C ${LANE1} 16, ${LANE0} 10, ${LANE0} 26`} fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.8" />
      </svg>
      <span
        className="absolute h-[14px] w-[14px] rounded-full border-2 bg-ink"
        style={{ left: LANE1 - 7, top: 30, borderColor: color, boxShadow: `0 0 14px ${color}66` }}
      />
    </div>
  );
}

function Tag({ children, color }: { children: string; color: string }) {
  return (
    <span className="rounded-md border px-1.5 py-0.5 font-mono text-[10px]" style={{ color, borderColor: `${color}55`, background: `${color}12` }}>
      {children}
    </span>
  );
}

function FeatureCommit({ exp, open, onToggle, index }: { exp: Experience; open: boolean; onToggle: () => void; index: number }) {
  return (
    <motion.li
      initial={{ opacity: 0, x: -16 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
      className="flex"
    >
      <BranchGutter color={exp.color} />
      <div className="min-w-0 flex-1 pb-7 pt-4">
        <button onClick={onToggle} aria-expanded={open} className="group w-full text-left" data-solid>
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="text-white/40">{shortHash(exp.id)}</span>
            <Tag color={exp.color}>{exp.branch}</Tag>
            <span className="ml-auto text-white/35">{exp.period}</span>
          </div>
          <div className="mt-2 flex items-start gap-2">
            <ChevronRight className={cn("mt-1.5 h-4 w-4 shrink-0 text-white/30 transition", open && "rotate-90 text-paper")} />
            <div>
              <h3 className="font-display text-[26px] leading-tight text-paper sm:text-[30px]">
                {exp.title} <span className="text-white/35">@</span> <span style={{ color: exp.color }}>{exp.company}</span>
              </h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-[13px] text-dim">
                <MapPin className="h-3.5 w-3.5" /> {exp.location}
                {exp.note && <span className="text-white/35">· {exp.note}</span>}
              </p>
            </div>
          </div>
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div data-solid className="mt-4 overflow-hidden rounded-xl border border-white/[0.07] bg-ink-2/80 font-mono text-[12.5px] leading-relaxed">
                <div className="border-b border-white/[0.06] px-4 py-2 text-[11px] text-white/35">
                  diff --career {exp.branch} · {exp.highlights.length} additions
                </div>
                <ul className="px-4 py-3">
                  {exp.highlights.map((h) => (
                    <li key={h} className="flex gap-3 text-paper/85">
                      <span className="select-none text-signal">+</span>
                      <span className="font-sans text-[14px]">{h}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-white/[0.06] px-4 py-2.5 text-[11px] text-dim">
                  <span className="text-signal">deps</span> {exp.technologies.join(" · ")}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.li>
  );
}

export function Commits() {
  const persona = useApp((s) => s.persona);
  const [open, setOpen] = useState<Record<string, boolean>>({ [experiences[0].id]: true });
  const allOpen = experiences.every((e) => open[e.id]);
  const toggleAll = () => setOpen(allOpen ? {} : Object.fromEntries(experiences.map((e) => [e.id, true])));

  return (
    <section id="commits" data-debug="<Commits />" className="relative py-28 sm:py-36">
      <div className="shell">
        <ChapterHeader
          chapter="commits"
          title={
            <>
              Experience,
              <br />
              <em className="text-signal pr-2">as a commit history.</em>
            </>
          }
          lead={
            persona === "recruiter"
              ? "Three internships, newest first. Open any entry to see what shipped."
              : "Each role is a feature branch merged back into main. Open a commit to read its diff."
          }
        />

        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between font-mono text-[11px] text-dim">
            <span>
              <span className="text-signal">$</span> git log --graph --career
            </span>
            <button onClick={toggleAll} className="rounded-full border border-white/10 px-3 py-1 transition hover:border-white/25 hover:text-paper">
              {allOpen ? "collapse all" : "expand all"}
            </button>
          </div>

          <ol>
            <motion.li initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex">
              <MainGutter first head />
              <div className="flex-1 pb-6 pt-4" data-solid>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="text-white/40">{shortHash("head")}</span>
                  <Tag color="#f5a524">HEAD → main</Tag>
                  <span className="ml-auto text-white/35">now</span>
                </div>
                <h3 className="mt-2 font-display text-[26px] leading-tight text-paper sm:text-[30px]">
                  Open to full-time roles · <span className="text-signal">Spring Boot × AI RAG</span>
                </h3>
                <p className="mt-1 text-[13px] text-dim">English-first teams · open to relocation · remote-friendly</p>
              </div>
            </motion.li>

            {experiences.map((exp, i) => (
              <FeatureCommit key={exp.id} exp={exp} index={i} open={!!open[exp.id]} onToggle={() => setOpen((o) => ({ ...o, [exp.id]: !o[exp.id] }))} />
            ))}

            <motion.li initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="flex">
              <MainGutter last />
              <div className="flex-1 pb-2 pt-4" data-solid>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
                  <span className="text-white/40">{shortHash("init")}</span>
                  <Tag color={MAIN}>main</Tag>
                  <span className="ml-auto text-white/35">2021</span>
                </div>
                <h3 className="mt-2 font-display text-[26px] leading-tight text-paper sm:text-[30px]">init: enrolled at {profile.school}</h3>
                <p className="mt-1 text-[13px] text-dim">State Engineering Degree in Computer Science · Software Engineering &amp; Networks</p>
              </div>
            </motion.li>
          </ol>
        </div>
      </div>
    </section>
  );
}
