import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { ChapterHeader } from "@/components/experience/ChapterHeader";
import { releases } from "@/data/portfolio";
import { scrollToChapter } from "@/lib/navigation";
import { cn } from "@/lib/utils";

const STATUS: Record<(typeof releases)[number]["status"], string> = {
  shipped: "border-white/15 text-dim",
  "in progress": "border-spring/40 bg-spring/10 text-spring",
  next: "border-neural/40 bg-neural/10 text-neural",
};

export function Releases() {
  return (
    <section id="releases" data-debug="<Releases />" className="relative py-28 sm:py-36">
      <div className="shell">
        <ChapterHeader
          chapter="releases"
          title={
            <>
              Release notes
              <br />
              <em className="text-tracks pr-2">for what&apos;s next.</em>
            </>
          }
          lead="The roadmap, written as a changelog: high-impact roles where backend systems, AI platforms and thoughtful product work meet."
        />

        <ol className="relative mx-auto max-w-4xl">
          <span className="absolute bottom-6 left-[7px] top-6 w-px bg-gradient-to-b from-white/5 via-white/15 to-neural/50 sm:left-[123px]" />
          {releases.map((r, i) => (
            <motion.li
              key={r.version}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, delay: i * 0.06 }}
              className="relative grid gap-3 pb-10 pl-8 last:pb-0 sm:grid-cols-[108px_minmax(0,1fr)] sm:gap-8 sm:pl-0"
            >
              <div className="font-mono text-[13px] sm:pt-1 sm:text-right">
                <span className={r.status === "next" ? "text-neural" : "text-paper"}>{r.version}</span>
              </div>
              <span
                className={cn(
                  "absolute left-0 top-1.5 h-[15px] w-[15px] rounded-full border-2 bg-ink sm:left-[116px]",
                  r.status === "next" ? "border-neural shadow-[0_0_14px_rgba(167,139,250,0.6)]" : r.status === "shipped" ? "border-white/40" : "border-spring",
                )}
              />
              <div data-solid className="sm:pl-6">
                <span className={cn("inline-block rounded-full border px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]", STATUS[r.status])}>
                  {r.status}
                </span>
                <h3 className="mt-3 font-display text-[32px] leading-[1.05] text-paper">{r.title}</h3>
                <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-dim">{r.description}</p>
                <ul className="mt-3 flex flex-wrap gap-x-5 gap-y-1">
                  {r.items.map((item) => (
                    <li key={item} className="font-mono text-[12px] text-paper/75">
                      <span className={r.status === "next" ? "text-neural" : "text-spring"}>+</span> {item}
                    </li>
                  ))}
                </ul>
                {r.status === "next" && (
                  <button onClick={() => scrollToChapter("response")} className="btn-primary mt-6">
                    Ship it with your team <ArrowRight className="h-4 w-4" />
                  </button>
                )}
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
