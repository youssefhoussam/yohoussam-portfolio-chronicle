import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ArrowUp } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="py-12 relative border-t border-border/50">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-display font-bold text-gradient mb-2">
                Youssef Houssam
              </h3>
              <p className="text-muted-foreground">
                Ingénieur Logiciel • Backend • Data • Cybersécurité
              </p>
            </div>

            <div className="flex gap-6">
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                href="https://github.com/youssefhoussam"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-3 hover:bg-primary/10 transition-colors"
              >
                <Github className="w-5 h-5 text-primary" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: -5 }}
                href="https://www.linkedin.com/in/youssef-houssam-66b02b357/"
                target="_blank"
                rel="noopener noreferrer"
                className="glass-card p-3 hover:bg-primary/10 transition-colors"
              >
                <Linkedin className="w-5 h-5 text-primary" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.2, rotate: 5 }}
                href="mailto:youssefhoussam88@gmail.com"
                className="glass-card p-3 hover:bg-primary/10 transition-colors"
              >
                <Mail className="w-5 h-5 text-primary" />
              </motion.a>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-border/50 flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Youssef Houssam. Tous droits réservés.
            </p>
            <Button
              onClick={scrollToTop}
              variant="ghost"
              size="icon"
              className="glass-card hover:bg-primary/10"
            >
              <ArrowUp className="w-5 h-5 text-primary" />
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};
