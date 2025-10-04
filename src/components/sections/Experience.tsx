import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Calendar } from "lucide-react";

const experiences = [
  {
    title: "Stage Ingénieur Full-Stack",
    company: "OCP Maintenance Solutions",
    location: "Casablanca, Maroc",
    period: "Juillet - Septembre 2025",
    description: [
      "Développement de StockMaster, application web SaaS multi-tenant de gestion d'inventaire",
      "Architecture multi-tenant avec isolation des données pour 4+ sites industriels",
      "Système de contrôle d'accès basé sur les rôles (RBAC) à 3 niveaux",
      "Alertes automatiques en temps réel et exports avancés (Excel, PDF, CSV)",
      "Audit trail complet pour traçabilité et conformité réglementaire",
    ],
    technologies: ["Laravel 12", "Vue.js 3", "MySQL", "Inertia.js", "Tailwind CSS", "Laravel Sanctum"],
  },
];

export const Experience = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="experience" className="py-20 relative" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Mon <span className="text-gradient">Expérience</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {experiences.map((exp, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              className="relative pl-8 pb-12 border-l-2 border-primary/30 last:pb-0"
            >
              <div className="absolute left-0 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary animate-pulse-glow" />
              
              <div className="glass-card p-8 hover:scale-[1.02] transition-transform duration-300">
                <div className="flex items-start gap-4 mb-4">
                  <div className="glass-card p-3">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-display font-semibold mb-2">{exp.title}</h3>
                    <p className="text-lg text-primary mb-1">{exp.company}</p>
                    <p className="text-sm text-muted-foreground mb-2">{exp.location}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {exp.period}
                    </div>
                  </div>
                </div>

                <ul className="space-y-2 mb-6">
                  {exp.description.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-muted-foreground">
                      <span className="text-primary mt-1">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex flex-wrap gap-2">
                  {exp.technologies.map((tech) => (
                    <span
                      key={tech}
                      className="glass px-3 py-1 text-sm text-primary border border-primary/30 rounded-full"
                    >
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
