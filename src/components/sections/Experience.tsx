import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Calendar } from "lucide-react";

const experiences = [
  {
    title: "AI & Backend Engineering Intern — PFE",
    company: "OCP Solutions",
    location: "Casablanca, Morocco",
    period: "February 2026 — July 2026",
    description: [
      "Designed a four-layer modular RAG platform (SDK, Engine, Pipeline, Use Cases) deployed in production.",
      "Built the BYOM abstraction framework with five abstract base classes for full component swappability.",
      "Implemented hybrid retrieval (semantic + BM25, RRF, Small-to-Big) and Graph RAG extension.",
      "Developed an LLM-as-a-Judge evaluation module with automated PASS/FAIL scoring.",
    ],
    technologies: ["Python", "Docling", "Milvus", "MinIO", "vLLM", "Gradio", "NetworkX"],
  },
  {
    title: "Full-Stack Engineering Intern",
    company: "OCP Maintenance Solutions",
    location: "Casablanca, Morocco",
    period: "July 2025 — September 2025",
    description: [
      "Built StockMaster, a multi-tenant SaaS inventory platform for 4+ industrial sites.",
      "Implemented 3-level RBAC, real-time alerts, audit trail, and advanced exports.",
    ],
    technologies: ["Laravel 12", "Vue.js 3", "MySQL", "Inertia.js", "Tailwind CSS"],
  },
  {
    title: "Software Development Intern",
    company: "EMSI Research Lab",
    location: "Casablanca, Morocco",
    period: "July 2024",
    description: [
      "Built EmsiShop, an e-commerce platform with product management, stock control, and order tracking.",
    ],
    technologies: ["Python", "Django", "SQLite", "Bootstrap"],
  },
];

export const Experience = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="relative py-20" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-primary">Experience</p>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            A timeline of <span className="text-gradient">hands-on work</span>
          </h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-primary" />
        </motion.div>

        <div className="mx-auto max-w-5xl">
          {experiences.map((exp, index) => (
            <motion.div key={exp.title} initial={{ opacity: 0, x: -40 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: index * 0.16 }} className="relative mb-8 border-l-2 border-primary/30 pl-8 pb-6 last:pb-0">
              <div className="absolute left-0 top-0 h-4 w-4 -translate-x-1/2 rounded-full bg-primary shadow-[0_0_0_8px_rgba(45,212,191,0.16)]" />

              <div className="glass-card p-8 transition-transform duration-300 hover:-translate-y-1">
                <div className="mb-4 flex items-start gap-4">
                  <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="mb-2 text-2xl font-semibold">{exp.title}</h3>
                    <p className="mb-1 text-lg text-primary">{exp.company}</p>
                    <p className="mb-2 text-sm text-muted-foreground">{exp.location}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {exp.period}
                    </div>
                  </div>
                </div>

                <ul className="mb-6 space-y-2 text-muted-foreground">
                  {exp.description.map((item, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="mt-1 text-primary">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech) => (
                    <span key={tech} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm text-primary">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
