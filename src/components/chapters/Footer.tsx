import { Github, RotateCcw, TerminalSquare } from "lucide-react";
import { profile } from "@/data/portfolio";
import { actions } from "@/lib/app";

export function Footer() {
  return (
    <footer data-debug="<Footer />" className="relative z-10 border-t border-white/[0.06] bg-ink/80">
      <div className="shell flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-mono text-[15px] font-semibold text-paper">
            yh<span className="text-spring">_</span>
          </p>
          <p className="mt-2 text-[13px] text-dim">
            © {new Date().getFullYear()} {profile.name}. Built with React, Three.js and a tiny BM25 engine. No LLM was harmed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={profile.sourceRepo} target="_blank" rel="noreferrer" className="btn-ghost">
            <Github className="h-4 w-4" /> View source
          </a>
          <button onClick={() => actions.replayBoot()} className="btn-ghost">
            <RotateCcw className="h-4 w-4" /> Replay intro
          </button>
          <button onClick={() => actions.toggleTerminal(true)} className="btn-ghost">
            <TerminalSquare className="h-4 w-4" /> Terminal <span className="kbd">`</span>
          </button>
        </div>
      </div>
    </footer>
  );
}
