import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { BrainCircuit, Code2, Globe2 } from "lucide-react";

const highlights = [
  {
    icon: Code2,
    title: "Backend engineering",
    description: "Building reliable systems with Spring Boot, APIs, and service-oriented architecture.",
  },
  {
    icon: BrainCircuit,
    title: "AI systems",
    description: "Designing modular RAG platforms with retrieval, graph augmentation, and evaluation layers.",
  },
  {
    icon: Globe2,
    title: "International mindset",
    description: "Focused on English-first collaboration, remote-friendly teams, and growth in global environments.",
  },
];

export const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="relative py-20" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-primary">About me</p>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Building <span className="text-gradient">real systems</span> with modern engineering
          </h2>
          <div className="mx-auto mb-6 h-1 w-20 rounded-full bg-primary" />
          <p className="mx-auto max-w-3xl text-lg text-muted-foreground">
            I am a software engineer focused on backend architecture, AI platform development, and thoughtful product delivery.
          </p>
        </motion.div>

        <div className="mx-auto max-w-6xl">
          <div className="mb-16 grid items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
            <motion.div initial={{ opacity: 0, x: -50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }} className="glass-card p-8 md:p-10">
              <h3 className="mb-6 text-2xl font-semibold">Profile</h3>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                State Engineer in Computer Science (EMSI 2026) with hands-on experience building production-grade backend systems and AI platforms. Specialized in Spring Boot microservices and RAG-based AI infrastructure.
              </p>
              <p className="mb-4 leading-relaxed text-muted-foreground">
                I am currently seeking a full-time position in an English-first environment with international teams, remote-friendly companies, or organizations where English is the primary working language.
              </p>
              <p className="leading-relaxed text-muted-foreground">Open to relocation and eager to contribute in high-impact engineering teams.</p>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 50 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.4 }} className="grid gap-4">
              <div className="glass-card p-6">
                <div className="text-3xl font-bold text-gradient">3</div>
                <div className="mt-2 text-muted-foreground">professional experiences</div>
              </div>
              <div className="glass-card p-6">
                <div className="text-3xl font-bold text-gradient">5</div>
                <div className="mt-2 text-muted-foreground">projects delivered across web, AI, and mobile</div>
              </div>
              <div className="glass-card p-6">
                <div className="text-3xl font-bold text-gradient">1</div>
                <div className="mt-2 text-muted-foreground">flagship production RAG platform</div>
              </div>
            </motion.div>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {highlights.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }} whileHover={{ y: -8, scale: 1.01 }} className="glass-card p-8">
                <item.icon className="mb-4 h-12 w-12 text-primary" />
                <h4 className="mb-2 text-xl font-semibold">{item.title}</h4>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
