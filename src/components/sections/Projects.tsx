import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ExternalLink, Github, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
  {
    title: "OCPS RAG Playground",
    subtitle: "AI Knowledge Management Platform",
    description: "Modular RAG platform with hybrid retrieval, Graph RAG, and LLM-as-a-Judge evaluation.",
    fullDescription: "A four-layer modular RAG platform deployed in production at OCP Solutions, built with BYOM abstractions and a plug-and-play architecture for knowledge workflows.",
    technologies: ["Python", "Docling", "Milvus", "MinIO", "vLLM", "Gradio", "NetworkX"],
    category: "AI",
    github: "#",
    demo: "#",
    featured: true,
    status: "Live in Production",
  },
  {
    title: "Start-up Incubation Platform with AI",
    subtitle: "Microservices + AI matching",
    description: "A four-service platform using AI to generate pitch decks and support investor-startup matching.",
    fullDescription: "An AI-assisted startup incubation platform built on a Spring Boot microservices architecture with intelligent matching workflows.",
    technologies: ["Spring Boot", "Microservices", "PostgreSQL", "Gemini AI"],
    category: "Backend",
    github: "#",
    demo: "#",
    featured: false,
    status: "Architecture",
  },
  {
    title: "StockMaster",
    subtitle: "Multi-tenant inventory system",
    description: "SaaS inventory platform for 4+ industrial sites with data isolation, RBAC, alerts, and reporting.",
    fullDescription: "A multi-tenant inventory management system focused on secure data isolation, role-based access, automated alerts, and operational reporting.",
    technologies: ["Laravel 12", "Vue.js 3", "MySQL", "Tailwind CSS"],
    category: "Full-Stack",
    github: "https://github.com/youssefhoussam/Gestion-de-Stock-app",
    demo: "#",
    featured: false,
    status: "Industrial SaaS",
  },
  {
    title: "EMSI Smart Presence",
    subtitle: "Campus attendance app",
    description: "Mobile application for faculty attendance tracking with real-time sync and campus navigation.",
    fullDescription: "A practical Android app for attendance management, campus navigation, and document access using real-time Firebase synchronization.",
    technologies: ["Java", "Android Studio", "Firebase", "Google Maps API"],
    category: "Mobile",
    github: "#",
    demo: "#",
    featured: false,
    status: "Campus tool",
  },
  {
    title: "EmsiShop",
    subtitle: "E-commerce platform",
    description: "A merchant-focused storefront with stock control, admin management, and order tracking.",
    fullDescription: "An e-commerce platform for merchants with physical product management, stock handling, and an admin interface for order processing.",
    technologies: ["Python", "Django", "SQLite", "Bootstrap"],
    category: "Backend",
    github: "https://github.com/youssefhoussam/projet-python",
    demo: "#",
    featured: false,
    status: "Completed",
  },
];

const categories = ["All", "AI", "Backend", "Mobile", "Full-Stack"];

const ProjectCard = ({ project, index, isInView }: { project: typeof projects[number]; index: number; isInView: boolean }) => {
  return (
    <motion.article initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.7, delay: index * 0.08 }} whileHover={{ y: -8, scale: 1.01 }} className={`glass-card p-8 ${project.featured ? "md:col-span-2 border-primary/40 shadow-[0_0_50px_rgba(45,212,191,0.12)]" : ""}`}>
      <div className="mb-6 flex items-center justify-between">
        <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs uppercase tracking-[0.3em] text-primary">
          {project.category}
        </span>
        {project.featured ? (
          <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
            <Sparkles className="h-3.5 w-3.5" />
            {project.status}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">{project.status}</span>
        )}
      </div>

      <h3 className="mb-2 text-2xl font-semibold">{project.title}</h3>
      <p className="mb-4 text-primary">{project.subtitle}</p>
      <p className="mb-6 leading-relaxed text-muted-foreground">{project.description}</p>

      <div className="mb-6 flex flex-wrap gap-2">
        {project.technologies.map((tech) => (
          <span key={tech} className="rounded-full border border-border/70 bg-background/50 px-3 py-1 text-xs text-muted-foreground">
            {tech}
          </span>
        ))}
      </div>

      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">{project.fullDescription}</p>

      <div className="flex flex-wrap gap-3">
        {project.github !== "#" ? (
          <a href={project.github} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full border border-border/70 px-3 py-2 text-sm text-muted-foreground transition hover:border-primary hover:text-primary">
            <Github className="h-4 w-4" /> GitHub
          </a>
        ) : null}
        {project.demo !== "#" ? (
          <a href={project.demo} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-sm font-medium text-white transition hover:opacity-90">
            <ExternalLink className="h-4 w-4" /> Preview
          </a>
        ) : null}
      </div>
    </motion.article>
  );
};

export const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredProjects = selectedCategory === "All" ? projects : projects.filter((project) => project.category === selectedCategory);

  return (
    <section id="projects" className="relative py-20" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-primary">Projects</p>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Featured <span className="text-gradient">builds</span> and product work
          </h2>
          <div className="mx-auto mb-8 h-1 w-20 rounded-full bg-primary" />

          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <Button key={category} variant={selectedCategory === category ? "default" : "outline"} onClick={() => setSelectedCategory(category)} className={selectedCategory === category ? "gradient-primary border-0 text-white" : "glass-card border-primary/40 hover:border-primary hover:bg-primary/10"}>
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-2">
          {filteredProjects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} isInView={isInView} />
          ))}
        </div>
      </div>
    </section>
  );
};
