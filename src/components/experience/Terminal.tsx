import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { ACHIEVEMENTS } from "@/data/achievements";
import { CHAPTERS } from "@/data/chapters";
import { PERSONA_ORDER, PERSONAS, type Persona } from "@/data/personas";
import { certifications, education, experiences, profile, projects, skillNamespaces } from "@/data/portfolio";
import { actions, app, useApp } from "@/lib/app";
import { copyText, scrollToChapter, shortHash } from "@/lib/navigation";

type Tone = "in" | "out" | "dim" | "ok" | "err" | "accent";

interface Line {
  id: number;
  tone: Tone;
  text: ReactNode;
}

interface Ctx {
  print: (tone: Tone, text: ReactNode) => void;
  clear: () => void;
  close: () => void;
  history: string[];
}

const BANNER = [" __   __ _   _ ", " \\ \\ / /| | | |", "  \\ V / | |_| |", "   | |  |  _  |", "   |_|  |_| |_|", "               "];

const FILES: Record<string, () => string[]> = {
  "about.md": () => [
    `# ${profile.name}`,
    "",
    `${profile.role} · ${profile.tracks}`,
    `${profile.degree} — ${profile.school}, ${profile.graduation}`,
    "",
    "Two tracks, one engineer: Spring Boot microservices that scale,",
    "and RAG platforms that retrieve the right answer, and can prove it.",
    "Looking for a full-time role in an English-first team. Open to relocation.",
  ],
  "experience.log": () =>
    experiences.flatMap((e) => [
      `${shortHash(e.id)}  ${e.period.padEnd(20)} ${e.title} @ ${e.company}`,
      ...e.highlights.map((h) => `         + ${h}`),
    ]),
  "projects.json": () =>
    JSON.stringify(
      projects.map((p) => ({ name: p.slug, status: p.status, stack: p.technologies, ...(p.github ? { source: p.github } : {}) })),
      null,
      2,
    ).split("\n"),
  "skills.yml": () => skillNamespaces.flatMap((ns) => [`${ns.label}:`, ...ns.skills.map((s) => `  - ${s.name}${s.note ? `  # ${s.note}` : ""}`)]),
  "education.xml": () => [
    "<dependencies>",
    ...education.map((e) => `  <dependency>${e.groupId}:${e.artifactId}:${e.version}</dependency>`),
    ...certifications.map((c) => `  <dependency>${c.groupId}:${c.artifactId}:${c.year}</dependency>`),
    "</dependencies>",
  ],
  "contact.txt": () => [
    `email     ${profile.email}`,
    `phone     ${profile.phone}`,
    `linkedin  ${profile.linkedinLabel}`,
    `github    ${profile.githubLabel}`,
    `location  ${profile.location}`,
  ],
  "secrets/konami.txt": () => ["↑ ↑ ↓ ↓ ← → ← → B A", "(type it anywhere outside a text field)"],
  "secrets/outlier.txt": () => [
    "Somewhere in the vector space, one point belongs to no cluster.",
    "It blinks red, up and to the right of the hero. Click it.",
  ],
};

const chapterByLabel = (label: string) => CHAPTERS.find((c) => c.label === label || c.id === label || c.index === label);

function welcome(): Line[] {
  return [
    { id: -3, tone: "accent", text: "yh-shell 2026.11 · connected to youssef-houssam" },
    { id: -2, tone: "dim", text: "Type 'help' to list commands, 'ask <question>' to query the portfolio. Tab completes, ↑ recalls, Esc closes." },
    { id: -1, tone: "dim", text: "" },
  ];
}

const COMMANDS: Record<string, { help: string; hidden?: boolean; run: (args: string[], ctx: Ctx) => void }> = {
  help: {
    help: "list commands",
    run: (_, { print }) => {
      Object.entries(COMMANDS)
        .filter(([, c]) => !c.hidden)
        .forEach(([name, c]) => print("out", `${name.padEnd(13)} ${c.help}`));
      print("dim", "…and a few undocumented ones. Curiosity is rewarded.");
    },
  },
  ask: {
    help: "ask the portfolio a question (hybrid retrieval)",
    run: (args, { print }) => {
      const q = args.join(" ");
      if (!q) return print("err", "usage: ask <question>   e.g. ask how does your hybrid retrieval work?");
      const r = actions.ask(q);
      if (!r) return;
      print(r.verdict === "PASS" ? "ok" : "err", `judge: ${r.verdict} · coverage ${(r.coverage * 100).toFixed(0)}% · ${r.tookMs.toFixed(2)} ms`);
      print("out", r.answer);
      r.hits.slice(0, 3).forEach((h, i) =>
        print("dim", `  [${i + 1}] ${h.chunk.title}  · bm25 ${h.bm25.toFixed(2)} · cos ${h.cosine.toFixed(2)} · rrf ${h.rrf.toFixed(4)}`),
      );
    },
  },
  whoami: {
    help: "who you are, according to the gateway",
    run: (_, { print }) => {
      const p = app.get().persona;
      print("out", p ? `${p} — ${PERSONAS[p].blurb.toLowerCase()}` : "visitor — still deciding (try: persona engineer)");
    },
  },
  about: { help: "the short version", run: (_, { print }) => FILES["about.md"]().forEach((l) => print("out", l)) },
  ls: {
    help: "list files",
    run: (args, { print }) => {
      if (args[0]?.replace(/\/$/, "") === "secrets") return print("out", "konami.txt  outlier.txt");
      print("out", "about.md  experience.log  projects.json  skills.yml  education.xml  contact.txt  secrets/");
    },
  },
  cat: {
    help: "print a file",
    run: (args, { print }) => {
      const name = args[0];
      if (!name) return print("err", "usage: cat <file>");
      if (name.replace(/\/$/, "") === "secrets") return print("err", "cat: secrets: Is a directory");
      const file = FILES[name];
      if (!file) return print("err", `cat: ${name}: No such file or directory`);
      file().forEach((l) => print("out", l));
    },
  },
  goto: {
    help: "jump to a chapter (e.g. goto pipeline)",
    run: (args, { print, close }) => {
      const c = chapterByLabel((args[0] ?? "").toLowerCase());
      if (!c) return print("err", `usage: goto <${CHAPTERS.map((x) => x.label).join("|")}>`);
      print("ok", `→ ${c.route}`);
      close();
      window.setTimeout(() => scrollToChapter(c.id), 120);
    },
  },
  cd: { help: "alias of goto", hidden: true, run: (args, ctx) => COMMANDS.goto.run(args, ctx) },
  git: {
    help: "git log / git status",
    run: (args, { print }) => {
      if (args[0] === "status") {
        print("out", "On branch main");
        print("out", "Your branch is ahead of 'origin/main' by 1 opportunity: yours.");
        print("dim", "  (use \"sudo hire youssef\" to merge)");
        return;
      }
      if (args[0] !== "log") return print("err", "usage: git log | git status");
      print("accent", `* ${shortHash("head")} (HEAD -> main) open to full-time roles · Spring Boot × AI RAG`);
      experiences.forEach((e) => print("out", `* ${shortHash(e.id)} (${e.branch}) ${e.title} @ ${e.company} · ${e.period}`));
      print("out", `* ${shortHash("init")} init: State Engineering Degree — EMSI Casablanca · 2021`);
    },
  },
  skills: { help: "print the skill registry", run: (_, { print }) => FILES["skills.yml"]().forEach((l) => print("out", l)) },
  contact: {
    help: "how to reach Youssef (copies the email)",
    run: (_, { print }) => {
      FILES["contact.txt"]().forEach((l) => print("out", l));
      void copyText(profile.email).then((ok) => ok && print("ok", "✓ email copied to clipboard"));
    },
  },
  persona: {
    help: "switch view: recruiter | engineer | curious",
    run: (args, { print }) => {
      const p = args[0] as Persona;
      if (!PERSONA_ORDER.includes(p)) return print("err", `usage: persona <${PERSONA_ORDER.join("|")}>`);
      actions.setPersona(p);
      print("ok", `✓ now viewing as ${p}`);
    },
  },
  judge: {
    help: "play Spot the Hallucination",
    run: (_, { print, close }) => {
      print("ok", "→ POST /judge");
      close();
      window.setTimeout(() => scrollToChapter("judge"), 120);
    },
  },
  achievements: {
    help: "list your discoveries",
    run: (_, { print }) => {
      const { unlocked } = app.get();
      ACHIEVEMENTS.forEach((a) => print(unlocked.includes(a.id) ? "ok" : "dim", `${unlocked.includes(a.id) ? "◆" : "◇"} ${unlocked.includes(a.id) ? a.title : "???"}  — ${unlocked.includes(a.id) ? a.description : a.hint}`));
    },
  },
  fetch: {
    help: "system info",
    run: (_, { print }) => {
      const uptime = Math.floor(performance.now() / 1000);
      const info = [
        "youssef@houssam",
        "---------------",
        `role      ${profile.role}`,
        `tracks    ${profile.tracks}`,
        `degree    ${profile.degree} · EMSI ${profile.graduation}`,
        `base      ${profile.location}`,
        "open to   full-time · relocation · remote",
        `uptime    ${Math.floor(uptime / 60)}m ${uptime % 60}s`,
      ];
      const rows = Math.max(BANNER.length, info.length);
      for (let i = 0; i < rows; i++) {
        print(
          "out",
          <span>
            <span className="text-signal">{(BANNER[i] ?? "").padEnd(18, " ")}</span>
            {info[i] ?? ""}
          </span>,
        );
      }
    },
  },
  neofetch: { help: "alias of fetch", hidden: true, run: (a, c) => COMMANDS.fetch.run(a, c) },
  sudo: {
    help: "run a command as root",
    hidden: true,
    run: (args, { print, close }) => {
      const cmd = args.join(" ").toLowerCase();
      if (cmd === "hire youssef" || cmd === "hire youssef houssam" || cmd === "hire") {
        print("dim", `[sudo] password for ${app.get().persona ?? "visitor"}: ********`);
        window.setTimeout(() => print("ok", "✓ access granted. excellent judgement."), 450);
        window.setTimeout(() => print("out", "opening a channel to Youssef…"), 900);
        window.setTimeout(() => {
          actions.unlock("sudo");
          actions.prefillComposer("Hi Youssef, we'd like to talk to you about a role on our team.");
          close();
          scrollToChapter("response");
        }, 1500);
        return;
      }
      if (cmd.startsWith("rm")) return print("err", "nice try. this portfolio is in production.");
      print("err", `${app.get().persona ?? "visitor"} is not in the sudoers file. This incident will be reported… to Youssef, who will find it funny.`);
    },
  },
  history: {
    help: "command history",
    hidden: true,
    run: (_, { print, history }) => history.forEach((h, i) => print("dim", `${String(i + 1).padStart(4)}  ${h}`)),
  },
  debug: {
    help: "toggle debug mode",
    hidden: true,
    run: (_, { print }) => {
      actions.toggleDebug();
      print("ok", `debug ${app.get().debug ? "on" : "off"}`);
    },
  },
  guide: {
    help: "open the usage guide",
    run: (_, { print }) => {
      print("ok", "→ opening the guide");
      window.setTimeout(() => actions.toggleGuide(true), 150);
    },
  },
  replay: {
    help: "replay the boot sequence",
    run: (_, { close }) => {
      close();
      window.setTimeout(() => actions.replayBoot(), 150);
    },
  },
  echo: { help: "print text", hidden: true, run: (args, { print }) => print("out", args.join(" ")) },
  pwd: { help: "print working directory", hidden: true, run: (_, { print }) => print("out", "/home/youssef") },
  date: { help: "print the date", hidden: true, run: (_, { print }) => print("out", new Date().toString()) },
  coffee: { help: "", hidden: true, run: (_, { print }) => print("out", "☕ brewing Java… naturally. A Spring Boot developer's preferred fuel.") },
  ping: { help: "", hidden: true, run: (_, { print }) => print("ok", "PONG from youssef-houssam · latency: one email away") },
  curl: {
    help: "",
    hidden: true,
    run: (_, { print }) =>
      JSON.stringify({ status: 200, name: profile.name, email: profile.email, open_to: ["full-time", "relocation", "remote"] }, null, 2)
        .split("\n")
        .forEach((l) => print("out", l)),
  },
  rm: { help: "", hidden: true, run: (_, { print }) => print("err", "rm: refusing to delete anything. This portfolio is in production.") },
  vim: { help: "", hidden: true, run: (_, { print }) => print("dim", "You're safe here: to leave, just type 'exit'. No :q! required.") },
  nano: { help: "", hidden: true, run: (a, c) => COMMANDS.vim.run(a, c) },
  emacs: { help: "", hidden: true, run: (a, c) => COMMANDS.vim.run(a, c) },
  hello: { help: "", hidden: true, run: (_, { print }) => print("out", "Hi! 👋 Try 'fetch', or 'ask what is BYOM?'") },
  clear: { help: "clear the screen", run: (_, { clear }) => clear() },
  exit: { help: "close the terminal", run: (_, { close }) => close() },
};

const TONES: Record<Tone, string> = {
  in: "text-paper",
  out: "text-paper/85",
  dim: "text-dim",
  ok: "text-signal",
  err: "text-rose-300",
  accent: "text-signal",
};

function TerminalWindow() {
  const persona = useApp((s) => s.persona);
  const [lines, setLines] = useState<Line[]>(welcome);
  const [input, setInput] = useState("");
  const history = useRef<string[]>([]);
  const cursor = useRef(-1);
  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    inputRef.current?.focus();
    return () => previous?.focus?.();
  }, []);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [lines]);

  const print = (tone: Tone, text: ReactNode) => setLines((prev) => [...prev, { id: nextId.current++, tone, text }].slice(-400));
  const ctx: Ctx = {
    print,
    clear: () => setLines([]),
    close: () => actions.toggleTerminal(false),
    history: history.current,
  };
  const prompt = `${persona ?? "visitor"}@yh:~$`;

  const run = (raw: string) => {
    const trimmed = raw.trim();
    print("in", (
      <span>
        <span className="text-signal">{prompt}</span> {trimmed}
      </span>
    ));
    if (!trimmed) return;
    history.current.push(trimmed);
    cursor.current = -1;
    const [name, ...args] = trimmed.split(/\s+/);
    const command = COMMANDS[name.toLowerCase()];
    if (!command) return print("err", `command not found: ${name}. Type 'help'.`);
    command.run(args, ctx);
  };

  const complete = (value: string) => {
    const parts = value.split(" ");
    const last = parts[parts.length - 1];
    const pool =
      parts.length === 1
        ? Object.keys(COMMANDS).filter((c) => !COMMANDS[c].hidden)
        : parts[0] === "cat"
          ? Object.keys(FILES)
          : parts[0] === "goto" || parts[0] === "cd"
            ? CHAPTERS.map((c) => c.label)
            : parts[0] === "persona"
              ? PERSONA_ORDER
              : parts[0] === "git"
                ? ["log", "status"]
                : [];
    const options = pool.filter((p) => p.startsWith(last));
    if (options.length === 1) {
      parts[parts.length - 1] = options[0];
      return `${parts.join(" ")}${parts.length === 1 ? " " : ""}`;
    }
    if (options.length > 1) print("dim", options.join("   "));
    return value;
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      run(input);
      setInput("");
    } else if (e.key === "Escape") {
      actions.toggleTerminal(false);
    } else if (e.key === "Tab") {
      e.preventDefault();
      setInput((v) => complete(v));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const h = history.current;
      if (!h.length) return;
      cursor.current = cursor.current < 0 ? h.length - 1 : Math.max(0, cursor.current - 1);
      setInput(h[cursor.current]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const h = history.current;
      if (cursor.current < 0) return;
      cursor.current = cursor.current + 1;
      if (cursor.current >= h.length) {
        cursor.current = -1;
        setInput("");
      } else setInput(h[cursor.current]);
    } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
      e.preventDefault();
      setLines([]);
    } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
      print("dim", `${prompt} ${input}^C`);
      setInput("");
    }
  };

  return (
    <motion.div
      role="dialog"
      aria-label="Terminal"
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 16, scale: 0.98, transition: { duration: 0.16 } }}
      transition={{ type: "spring", stiffness: 380, damping: 32 }}
      className="fixed inset-x-2 bottom-2 z-[95] flex h-[min(72vh,560px)] flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#07080c]/[0.97] shadow-[0_30px_100px_rgba(0,0,0,0.7)] backdrop-blur-md sm:inset-x-auto sm:bottom-6 sm:right-6 sm:w-[min(720px,calc(100vw-3rem))]"
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest("button")) return;
        window.setTimeout(() => {
          if (!window.getSelection()?.toString()) inputRef.current?.focus();
        }, 0);
      }}
    >
      <div className="flex items-center justify-between border-b border-white/[0.07] px-4 py-2.5">
        <span className="font-mono text-[11px] text-dim">
          <span className="text-signal">●</span> yh-shell — ~/youssef
        </span>
        <button
          onClick={() => actions.toggleTerminal(false)}
          aria-label="Close the terminal"
          className="inline-flex h-7 w-7 items-center justify-center rounded-full text-dim hover:bg-white/10 hover:text-paper"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div ref={bodyRef} className="flex-1 overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-[1.65]" aria-live="polite">
        {lines.map((line) => (
          <div key={line.id} className={`${TONES[line.tone]} whitespace-pre-wrap break-words`}>
            {line.text || " "}
          </div>
        ))}
        <div className="flex items-center gap-2">
          <label htmlFor="terminal-input" className="shrink-0 text-signal">
            {prompt}
          </label>
          <input
            id="terminal-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-[16px] text-paper caret-signal outline-none sm:text-[12.5px]"
          />
        </div>
      </div>
    </motion.div>
  );
}

export function Terminal() {
  const open = useApp((s) => s.terminalOpen);
  return <AnimatePresence>{open && <TerminalWindow key="terminal" />}</AnimatePresence>;
}
