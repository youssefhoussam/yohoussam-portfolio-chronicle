import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef, useState } from "react";
import { Github, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const projects = [
  {
    title: "StockMaster",
    description: "Gestion de Stock Multi-Tenant",
    fullDescription: "Application web permettant la gestion multi-sites d'inventaires avec isolation complète des données, système d'alertes automatiques, traçabilité complète et exports avancés. Architecture RBAC avec permissions granulaires et tableaux de bord adaptatifs.",
    technologies: ["Laravel 12", "Vue.js 3", "MySQL", "Inertia.js", "Tailwind CSS", "UML"],
    category: "Backend",
    github: "https://github.com/youssefhoussam/Gestion-de-Stock-app",
    demo: "#",
  },
  {
    title: "Trackify",
    description: "Plateforme de Gestion Financière avec IA",
    fullDescription: "Plateforme d'aide à la gestion financière pour TPE avec intégration IA (Gemini) pour analyse financière et recommandations stratégiques. Interface responsive avec visualisation des données en temps réel.",
    technologies: ["Next.js", "React", "Firebase", "Tailwind CSS", "Gemini LLM"],
    category: "Data",
    github: "https://github.com/youssefhoussam/Trackify",
    demo: "https://trackify-grey.vercel.app/dashbord",
  },
  {
    title: "EMSI Smart Presence",
    description: "Application Mobile Académique",
    fullDescription: "Application Android pour enseignants EMSI : gestion des présences étudiantes, consultation des listes par cours, localisation des campus, gestion documentaire et consultation d'emplois du temps. Synchronisation en temps réel via Firebase.",
    technologies: ["Java", "Android Studio", "Firebase", "Google Maps API"],
    category: "Mobile",
    github: "#",
    demo: "#",
  },
  {
    title: "EmsiShop",
    description: "Plateforme E-commerce",
    fullDescription: "Plateforme e-commerce pour commerçants avec gestion des produits physiques, stocks limités/illimités, interface d'administration et suivi des commandes.",
    technologies: ["Python", "Django", "SQLite", "HTML", "CSS", "JavaScript", "Bootstrap"],
    category: "Backend",
    github: "https://github.com/youssefhoussam/projet-python",
    demo: "#",
  },
];

const categories = ["Tous", "Backend", "Data", "Mobile"];

const ProjectCard = ({ project, index, isInView }: any) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="h-[400px] perspective"
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6 }}
        style={{ transformStyle: "preserve-3d" }}
        onHoverStart={() => setIsFlipped(true)}
        onHoverEnd={() => setIsFlipped(false)}
      >
        {/* Front */}
        <div
          className="absolute inset-0 glass-card p-8 flex flex-col backface-hidden"
          style={{ backfaceVisibility: "hidden" }}
        >
          <div className="flex-1">
            <h3 className="text-2xl font-display font-semibold mb-2">{project.title}</h3>
            <p className="text-primary mb-4">{project.description}</p>
            <div className="flex flex-wrap gap-2">
              {project.technologies.slice(0, 4).map((tech: string) => (
                <span
                  key={tech}
                  className="glass px-3 py-1 text-xs border border-primary/30 rounded-full"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-4">
            Survolez pour plus de détails
          </p>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 glass-card p-8 flex flex-col backface-hidden"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
          }}
        >
          <p className="text-sm text-muted-foreground mb-4 flex-1">
            {project.fullDescription}
          </p>
          <div className="flex gap-4">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 glass-card border-primary/50 hover:border-primary"
              asChild
            >
              <a href={project.github} target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                GitHub
              </a>
            </Button>
            <Button
              size="sm"
              className="flex-1 gradient-primary text-white border-0"
              asChild
            >
              <a href={project.demo} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Demo
              </a>
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export const Projects = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [selectedCategory, setSelectedCategory] = useState("Tous");

  const filteredProjects =
    selectedCategory === "Tous"
      ? projects
      : projects.filter((p) => p.category === selectedCategory);

  return (
    <section id="projects" className="py-20 relative" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Mes <span className="text-gradient">Projets</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full mb-8" />

          <div className="flex flex-wrap gap-4 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                className={
                  selectedCategory === category
                    ? "gradient-primary text-white border-0"
                    : "glass-card border-primary/50 hover:border-primary"
                }
              >
                {category}
              </Button>
            ))}
          </div>
        </motion.div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
          {filteredProjects.map((project, index) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={index}
              isInView={isInView}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
