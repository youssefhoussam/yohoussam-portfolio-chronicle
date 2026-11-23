import { motion } from "framer-motion";
import { ArrowDown, Copy, Github, Linkedin, Mail } from "lucide-react";
import { Fragment, useState } from "react";
import portrait from "@/assets/youssef.jpg";
import { CLUSTERS, clusterIndex, type ClusterId } from "@/data/chapters";
import { personaCopy } from "@/data/personas";
import { profile } from "@/data/portfolio";
import { useScramble } from "@/hooks/useExperience";
import { actions, useApp } from "@/lib/app";
import { copyText, scrollToChapter } from "@/lib/navigation";
import { AskBox } from "./AskBox";

/** Renders `[[spring:…]]` / `[[rag:…]]` markers as spans that light up their 3D cluster on hover. */
function RichLead({ text }: { text: string }) {
  const parts = text.split(/(\[\[[a-z]+:[^\]]+\]\])/g);
  return (
    <>
      {parts.map((part, i) => {
        const match = part.match(/^\[\[([a-z]+):([^\]]+)\]\]$/);
        if (!match) return <Fragment key={i}>{part}</Fragment>;
        const cluster = match[1] as ClusterId;
        const color = CLUSTERS[clusterIndex(cluster)]?.color ?? "#ecebe7";
        return (
          <span
            key={i}
            onMouseEnter={() => actions.focusCluster(cluster)}
            onMouseLeave={() => actions.focusCluster(null)}
            className="cursor-default text-paper underline decoration-2 underline-offset-[6px] transition-colors"
            style={{ textDecorationColor: `${color}99` }}
          >
            {match[2]}
          </span>
        );
      })}
    </>
  );
}

function Tldr() {
  const [copied, setCopied] = useState(false);
  return (
    <motion.aside
      data-solid
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className="panel w-full p-5 lg:max-w-[340px]"
      aria-label="Summary for recruiters"
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40">tl;dr · for recruiters</p>
      <div className="mt-4 flex items-center gap-3">
        <img src={portrait} alt="" className="h-12 w-12 rounded-full object-cover grayscale" />
        <div>
          <p className="text-[15px] font-medium text-paper">{profile.name}</p>
          <p className="text-[13px] text-dim">{profile.role}</p>
        </div>
      </div>
      <dl className="mt-5 space-y-3 text-[13px]">
        {[
          ["focus", "Spring Boot microservices · AI RAG platforms"],
          ["degree", `${profile.degree} — EMSI, ${profile.graduation}`],
          ["based", profile.location],
          ["open to", "Full-time · relocation · remote-friendly"],
          ["works in", "English-first teams"],
        ].map(([k, v]) => (
          <div key={k} className="grid grid-cols-[72px_1fr] gap-3">
            <dt className="font-mono text-[11px] uppercase tracking-[0.12em] text-white/35">{k}</dt>
            <dd className="text-paper/90">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <a href={`mailto:${profile.email}`} className="btn-primary col-span-2 justify-center">
          <Mail className="h-4 w-4" /> Email Youssef
        </a>
        <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn-ghost justify-center">
          <Linkedin className="h-4 w-4" /> LinkedIn
        </a>
        <button
          onClick={async () => {
            if (await copyText(profile.email)) {
              setCopied(true);
              window.setTimeout(() => setCopied(false), 1600);
            }
          }}
          className="btn-ghost justify-center"
        >
          <Copy className="h-4 w-4" /> {copied ? "Copied" : "Copy email"}
        </button>
      </div>
    </motion.aside>
  );
}

export function Gateway() {
  const persona = useApp((s) => s.persona);
  const phase = useApp((s) => s.phase);
  const copy = personaCopy(persona);
  const ready = phase === "ready";
  const first = useScramble("Youssef", ready, 800);
  const last = useScramble("Houssam", ready, 1150);

  return (
    <section id="gateway" data-debug="<Gateway />" className="relative flex min-h-[100svh] flex-col justify-center pb-28 pt-28">
      <div className="shell grid w-full grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1fr)_auto]">
        <div className="max-w-[41rem]" data-hero-column>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-dim"
            data-solid
          >
            <span className="inline-flex items-center gap-2 text-spring">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-spring opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-spring" />
              </span>
              available · full-time
            </span>
            <span>casablanca, ma</span>
            <span className="hidden sm:inline">open to relocation</span>
          </motion.div>

          <h1 className="font-display text-[clamp(3.8rem,12vw,10rem)] leading-[0.84] tracking-[-0.035em] text-paper" data-solid>
            <span className="sr-only">Youssef Houssam</span>
            <span aria-hidden className="block">
              {first}
            </span>
            <span aria-hidden className="text-tracks block pb-2 pr-3 italic">
              {last}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.45 }}
            className="mt-7 max-w-[40rem] text-[17px] leading-relaxed text-paper/75 sm:text-[19px]"
            data-solid
          >
            <RichLead text={copy.lead} />
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={ready ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: 0.6 }}>
            <AskBox />
          </motion.div>

          {persona !== "recruiter" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={ready ? { opacity: 1 } : {}}
              transition={{ delay: 0.9 }}
              className="mt-6 flex flex-wrap items-center gap-2"
              data-solid
            >
              <a href={profile.github} target="_blank" rel="noreferrer" className="btn-ghost">
                <Github className="h-4 w-4" /> GitHub
              </a>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="btn-ghost">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
              <a href={`mailto:${profile.email}`} className="btn-ghost">
                <Mail className="h-4 w-4" /> Email
              </a>
              <span className="ml-1 hidden font-mono text-[11px] text-white/30 sm:inline">or hover the stars →</span>
            </motion.div>
          )}
        </div>

        {persona === "recruiter" && <Tldr />}
      </div>

      <button
        onClick={() => scrollToChapter("services")}
        className="absolute bottom-7 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/40 transition hover:text-paper"
      >
        trace the request <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
      </button>
    </section>
  );
}
