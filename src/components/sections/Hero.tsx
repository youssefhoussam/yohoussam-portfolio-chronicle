import { motion } from "framer-motion";
import { ArrowDown, Github, Linkedin, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Hero = () => {
  const scrollToContact = () => {
    document.querySelector("#contact")?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToProjects = () => {
    document.querySelector("#projects")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center relative overflow-hidden pt-20">
      <div className="absolute inset-0 gradient-hero opacity-20" />
      
      <div className="container mx-auto px-4 z-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          {/* Image on the left */}
          <motion.div
            className="order-2 lg:order-1 flex justify-center lg:justify-start"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="relative w-full max-w-md">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden glass-card border border-primary/20">
                {/* Placeholder - user will replace with their image */}
                <img
                  src="/youssef.jpg"
                  alt="Youssef Houssam"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Decorative gradient behind */}
              <div className="absolute -inset-4 gradient-primary opacity-20 blur-3xl -z-10" />
            </div>
          </motion.div>

          {/* Content on the right */}
          <div className="order-1 lg:order-2 text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl md:text-7xl font-display font-bold mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Youssef <span className="text-gradient">Houssam</span>
            </motion.h1>

            <motion.h2
              className="text-2xl md:text-4xl font-display mb-4 text-muted-foreground"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Ingénieur Logiciel
            </motion.h2>

            <motion.p
              className="text-lg md:text-xl mb-8 text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              Backend • Data • Cybersécurité
            </motion.p>

            <motion.p
              className="text-base md:text-lg mb-12 text-muted-foreground/80 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              Étudiant en 5ème année à EMSI, passionné par le développement backend et l'architecture logicielle.
              À la recherche d'un stage PFE pour approfondir mes compétences techniques.
            </motion.p>

            <motion.div
              className="flex flex-wrap gap-4 justify-center lg:justify-start mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1 }}
            >
              <Button
                size="lg"
                onClick={scrollToContact}
                className="gradient-primary text-white border-0 hover:opacity-90 transition-opacity"
              >
                Me contacter
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={scrollToProjects}
                className="glass-card border-primary/50 hover:border-primary hover:bg-primary/10"
              >
                Voir mes projets
              </Button>
            </motion.div>

            <motion.div
              className="flex gap-6 justify-center lg:justify-start"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 1.2 }}
            >
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                href="https://github.com/youssefhoussam"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Github className="w-6 h-6" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: -5 }}
                href="https://www.linkedin.com/in/youssef-houssam-66b02b357/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Linkedin className="w-6 h-6" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                href="mailto:youssefhoussam88@gmail.com"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Mail className="w-6 h-6" />
              </motion.a>
            </motion.div>
          </motion.div>
          </div>
        </div>

        <motion.div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <ArrowDown className="w-6 h-6 text-primary" />
        </motion.div>
      </div>
    </section>
  );
};
