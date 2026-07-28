import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const skillCategories = [
  {
    category: "Backend & Frameworks",
    skills: ["Java", "Spring Boot", "Microservices", "Python", "FastAPI", "Django", "Laravel", "C#", "ASP.NET Core"],
  },
  {
    category: "AI & Data",
    skills: ["RAG pipelines", "LLM integration", "Vector search", "BM25", "Graph RAG", "LLM-as-a-Judge", "Docling", "vLLM", "Milvus"],
  },
  {
    category: "Frontend",
    skills: ["Vue.js", "React", "Next.js", "JavaScript", "TypeScript", "Tailwind CSS"],
  },
  {
    category: "Data & Infrastructure",
    skills: ["MySQL", "PostgreSQL", "MongoDB", "Firebase", "Oracle PL/SQL", "Docker", "Git", "GitHub", "Azure", "CI/CD"],
  },
];

export const Skills = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="skills" className="relative py-20" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-primary">Skills</p>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Tools and stack for <span className="text-gradient">modern delivery</span>
          </h2>
          <div className="mx-auto mb-6 h-1 w-20 rounded-full bg-primary" />
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">A practical mix of backend architecture, AI engineering, and modern web tooling.</p>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          {skillCategories.map((category, categoryIndex) => (
            <motion.div key={category.category} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: categoryIndex * 0.1 }} whileHover={{ y: -6, scale: 1.01 }} className="glass-card p-8">
              <h3 className="mb-6 text-2xl font-semibold text-gradient">{category.category}</h3>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill) => (
                  <span key={skill} className="rounded-full border border-primary/20 bg-primary/10 px-3 py-2 text-sm text-muted-foreground">
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
