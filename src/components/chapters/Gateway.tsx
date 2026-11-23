import { motion } from "framer-motion";
import { ArrowDown, ArrowRight, Copy, Github, Linkedin, Mail, TerminalSquare } from "lucide-react";
import { Fragment, useEffect, useState } from "react";
import portrait from "@/assets/youssef.jpg";
import type { ClusterId } from "@/data/chapters";
import { personaCopy } from "@/data/personas";
import { profile } from "@/data/portfolio";
import { useScramble } from "@/hooks/useExperience";
import { actions, useApp } from "@/lib/app";
import { copyText, prefersReducedMotion, scrollToChapter } from "@/lib/navigation";
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
        return (
          <span
            key={i}
            onMouseEnter={() => actions.focusCluster(cluster)}
            onMouseLeave={() => actions.focusCluster(null)}
            className="cursor-default font-semibold text-paper underline decoration-2 underline-offset-[6px] transition-colors"
            style={{ textDecorationColor: "rgba(245,165,36,0.75)" }}
          >
            {match[2]}
          </span>
        );
      })}
    </>
  );
}

const DEMO_COMMANDS = ["help", "fetch", "ask what is BYOM?", "git log", "sudo hire youssef"];

/** Types real terminal commands on a loop, like a shell waiting for you. */
function useTypedCommands(active: boolean) {
  const [text, setText] = useState("");
  useEffect(() => {
    if (!active) return;
    if (prefersReducedMotion()) {
      setText("help · fetch · sudo hire youssef");
      return;
    }
    let command = 0;
    let chars = 0;
    let deleting = false;
    let timer = 0;
    const step = () => {
      const target = DEMO_COMMANDS[command];
      if (!deleting) {
        chars++;
        setText(target.slice(0, chars));
        if (chars === target.length) {
          deleting = true;
          timer = window.setTimeout(step, 1500);
          return;
        }
        timer = window.setTimeout(step, 70 + Math.random() * 60);
      } else {
        chars--;
        setText(target.slice(0, chars));
        if (chars === 0) {
          deleting = false;
          command = (command + 1) % DEMO_COMMANDS.length;
          timer = window.setTimeout(step, 350);
          return;
        }
        timer = window.setTimeout(step, 28);
      }
    };
    timer = window.setTimeout(step, 900);
    return () => window.clearTimeout(timer);
  }, [active]);
  return text;
}

function TerminalCta({ ready }: { ready: boolean }) {
  const typed = useTypedCommands(ready);
  return (
    <motion.button
      type="button"
      data-solid
      initial={{ opacity: 0, y: -10 }}
      animate={ready ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: 0.15 }}
      onClick={() => actions.toggleTerminal(true)}
      aria-label="Explore by terminal: open the interactive terminal"
      className="animate-beacon group mb-9 flex w-full max-w-[33rem] items-center gap-3.5 rounded-2xl border border-signal/60 bg-signal/[0.08] p-2 pr-4 text-left transition hover:border-signal hover:bg-signal/[0.13]"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-signal text-ink shadow-[0_8px_30px_rgba(245,165,36,0.35)]">
        <TerminalSquare className="h-6 w-6" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="text-[16px] font-bold tracking-[-0.01em] text-paper sm:text-[17px]">Explore by terminal</span>
          <span className="rounded-full border border-signal/40 px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.18em] text-signal">
            interactive
          </span>
        </span>
        <span className="mt-1 block truncate font-mono text-[12.5px] text-dim">
          <span className="text-signal">visitor@yh:~$</span> {typed}
          <span className="animate-blink ml-px text-signal">▍</span>
        </span>
      </span>
      <span className="hidden items-center gap-1.5 font-mono text-[11px] text-dim sm:flex">
        press <span className="kbd">`</span>
      </span>
      <ArrowRight className="h-5 w-5 shrink-0 text-signal transition group-hover:translate-x-1" />
    </motion.button>
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
          <TerminalCta ready={ready} />

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mb-7 flex flex-wrap items-center gap-x-5 gap-y-2 font-mono text-[11px] uppercase tracking-[0.18em] text-dim"
            data-solid
          >
            <span className="inline-flex items-center gap-2 text-signal">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-signal opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-signal" />
              </span>
              available · full-time
            </span>
            <span>casablanca, ma</span>
            <span className="hidden sm:inline">open to relocation</span>
          </motion.div>

          <h1 className="font-display text-[clamp(3.4rem,10.5vw,8.4rem)] font-black leading-[0.9] tracking-[-0.055em] text-paper" data-solid>
            <span className="sr-only">Youssef Houssam</span>
            <span aria-hidden className="block">
              {first}
            </span>
            <span aria-hidden className="block text-signal">
              {last}
              <span className="text-paper">.</span>
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
        className="absolute bottom-7 left-1/2 hidden -translate-x-1/2 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.24em] text-white/40 transition hover:text-paper xl:inline-flex"
      >
        trace the request <ArrowDown className="h-3.5 w-3.5 animate-bounce" />
      </button>
    </section>
  );
}
