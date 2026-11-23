import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { CHAPTER_MAP, type ChapterId } from "@/data/chapters";
import { shortHash } from "@/lib/navigation";

export function ChapterHeader({ chapter, title, lead }: { chapter: ChapterId; title: ReactNode; lead?: ReactNode }) {
  const c = CHAPTER_MAP[chapter];
  const latency = 8 + (parseInt(shortHash(chapter, 4), 16) % 40);
  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="mb-12 max-w-3xl sm:mb-16"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
        <span className="text-signal">{c.index}</span>
        <span className="h-px w-8 bg-white/15" />
        <span>{c.label}</span>
        <span className="normal-case tracking-normal text-white/30">
          {c.route} · <span className="text-signal/80">200</span> · {latency}ms
        </span>
      </div>
      <h2 className="mt-5 font-display text-[clamp(2.4rem,5.6vw,4.6rem)] leading-[0.98] tracking-[-0.045em] text-paper">{title}</h2>
      {lead && <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-dim sm:text-lg">{lead}</p>}
    </motion.header>
  );
}
