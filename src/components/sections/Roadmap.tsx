import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Brain, Globe2, Rocket } from "lucide-react";

const roadmap = [
  {
    icon: Rocket,
    title: "Build systems that ship",
    description: "From backend services to AI-powered platforms, I focus on reliable architecture and production-ready delivery.",
    points: ["Spring Boot microservices", "RAG infrastructure", "Production deployment"],
  },
  {
    icon: Brain,
    title: "Create intelligent products",
    description: "I enjoy pairing software engineering with modern AI workflows to build tools that feel useful and measurable.",
    points: ["Hybrid retrieval", "Graph RAG", "LLM evaluation"],
  },
  {
    icon: Globe2,
    title: "Grow in global teams",
    description: "My next step is contributing in English-first environments where strong engineering and clear communication matter.",
    points: ["Remote-friendly collaboration", "Open to relocation", "Full-time opportunities"],
  },
];

export const Roadmap = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="roadmap" className="py-20 relative" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <p className="text-sm uppercase tracking-[0.35em] text-primary mb-3">Career roadmap</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Where I’m <span className="text-gradient">heading next</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            I’m building toward high-impact engineering roles where backend systems, AI platforms, and thoughtful product work meet.
          </p>
        </motion.div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-6">
          {roadmap.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7, delay: index * 0.12 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="glass-card p-8 rounded-3xl border border-primary/20"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-sm text-primary">0{index + 1}</span>
                </div>
                <h3 className="text-xl font-display font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground mb-5 leading-relaxed">{step.description}</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {step.points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <ArrowRight className="w-4 h-4 text-primary" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
