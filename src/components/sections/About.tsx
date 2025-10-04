import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Code2, Database, Shield } from "lucide-react";

const highlights = [
  {
    icon: Code2,
    title: "Backend",
    description: "Architecture logicielle et développement avec Java/Spring Boot, Laravel, Django",
  },
  {
    icon: Database,
    title: "Data",
    description: "Gestion de bases de données, ETL et analyse de données",
  },
  {
    icon: Shield,
    title: "Cybersécurité",
    description: "Sécurité des applications et protection des données",
  },
];

export const About = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="about" className="py-20 relative" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            À propos de <span className="text-gradient">moi</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
        </motion.div>

        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="glass-card p-8"
            >
              <h3 className="text-2xl font-display font-semibold mb-6">Profil</h3>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Étudiant ingénieur en 5ème année à l'EMSI Casablanca, je suis passionné par le développement
                backend et l'architecture logicielle avec un fort accent sur Java et Spring Boot.
              </p>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                Je recherche des opportunités dans le backend, la data ou la cybersécurité pour approfondir
                mes compétences techniques et contribuer à des projets ambitieux.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Actuellement à la recherche d'un stage de fin d'études (PFE) avec possibilité d'embauche
                pour valider mon diplôme d'ingénieur et évoluer au sein d'une équipe dynamique.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="space-y-4"
            >
              <div className="glass-card p-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-3xl font-bold text-gradient">5+</div>
                  <div className="text-muted-foreground">Projets réalisés</div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-3xl font-bold text-gradient">10+</div>
                  <div className="text-muted-foreground">Technologies maîtrisées</div>
                </div>
              </div>
              <div className="glass-card p-6">
                <div className="flex items-center gap-4 mb-2">
                  <div className="text-3xl font-bold text-gradient">3</div>
                  <div className="text-muted-foreground">Langues parlées</div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.6 + index * 0.1 }}
                className="glass-card p-8 hover:scale-105 transition-transform duration-300"
              >
                <item.icon className="w-12 h-12 text-primary mb-4" />
                <h4 className="text-xl font-display font-semibold mb-2">{item.title}</h4>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
