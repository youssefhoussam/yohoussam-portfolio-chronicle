import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail, MapPin, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import youssefPic from "@/assets/youssef.jpg";

const quickFacts = ["Open to relocation", "English-first focus", "Casablanca, Morocco"];

export const Hero = () => {
  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToProjects = () => {
    document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="relative min-h-screen overflow-hidden pt-24 pb-16">
      <div className="absolute inset-0 gradient-hero opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.16),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.12),transparent_35%)]" />

      <div className="container relative z-10 mx-auto px-4">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div
            className="order-2 flex justify-center lg:order-1 lg:justify-start"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full max-w-md">
              <div className="absolute -inset-6 rounded-[2rem] bg-primary/20 blur-3xl" />
              <div className="relative aspect-[3/4] overflow-hidden rounded-[2rem] border border-primary/20 bg-background/70 shadow-[0_25px_80px_rgba(0,0,0,0.35)] backdrop-blur">
                <img src={youssefPic} alt="Youssef Houssam" className="h-full w-full object-cover" />
              </div>
            </div>
          </motion.div>

          <motion.div
            className="order-1 text-center lg:order-2 lg:text-left"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Software Engineer — Backend & AI Systems
            </div>

            <h1 className="mb-6 text-5xl font-bold leading-tight md:text-7xl">
              Youssef <span className="text-gradient">Houssam</span>
            </h1>

            <p className="mb-8 max-w-2xl text-lg text-muted-foreground md:text-xl">
              State Engineer in Computer Science (EMSI 2026) with hands-on experience building production-grade backend systems and AI platforms. Specialized in Spring Boot microservices and RAG-based AI infrastructure.
            </p>

            <div className="mb-10 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              {quickFacts.map((fact) => (
                <span key={fact} className="rounded-full border border-border/70 bg-background/60 px-3 py-2 text-sm text-muted-foreground">
                  {fact}
                </span>
              ))}
            </div>

            <div className="mb-10 flex flex-wrap justify-center gap-4 lg:justify-start">
              <Button size="lg" onClick={scrollToContact} className="gradient-primary border-0 text-white">
                Let&apos;s connect
              </Button>
              <Button size="lg" variant="outline" onClick={scrollToProjects} className="glass-card border-primary/40 hover:border-primary hover:bg-primary/10">
                Explore projects
              </Button>
            </div>

            <div className="mb-8 flex flex-wrap items-center justify-center gap-4 lg:justify-start">
              <a href="https://github.com/youssefhoussam" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-primary">
                <Github className="h-4 w-4" /> GitHub
              </a>
              <a href="https://www.linkedin.com/in/youssef-houssam-66b02b357/" target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-primary">
                <Linkedin className="h-4 w-4" /> LinkedIn
              </a>
              <a href="mailto:youssefhoussam88@gmail.com" className="flex items-center gap-2 rounded-full border border-border/70 bg-background/60 px-4 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-primary">
                <Mail className="h-4 w-4" /> Email
              </a>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-background/60 p-4 text-sm text-muted-foreground shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur">
              <div className="flex items-center gap-2 font-medium text-foreground">
                <MapPin className="h-4 w-4 text-primary" /> Casablanca, Morocco
              </div>
              <p className="mt-2">Seeking a full-time role in an English-first environment, with openness to relocation and remote-friendly teams.</p>
            </div>
          </motion.div>
        </div>

        <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ArrowDown className="h-6 w-6 text-primary" />
        </motion.div>
      </div>
    </section>
  );
};
