import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { Github, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export const Contact = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="contact" className="relative py-20" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 50 }} animate={isInView ? { opacity: 1, y: 0 } : {}} transition={{ duration: 0.8 }} className="mb-16 text-center">
          <p className="mb-3 text-sm uppercase tracking-[0.35em] text-primary">Contact</p>
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Let&apos;s build <span className="text-gradient">something impactful</span>
          </h2>
          <div className="mx-auto h-1 w-20 rounded-full bg-primary" />
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <motion.div initial={{ opacity: 0, x: -40 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.2 }} className="glass-card p-8">
            <h3 className="mb-6 text-2xl font-semibold">Get in touch</h3>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
                  <Mail className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="mb-1 font-semibold">Email</h4>
                  <a href="mailto:youssefhoussam88@gmail.com" className="text-muted-foreground transition hover:text-primary">youssefhoussam88@gmail.com</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="mb-1 font-semibold">Phone</h4>
                  <a href="tel:+212664352796" className="text-muted-foreground transition hover:text-primary">+212 664 352 796</a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="rounded-2xl border border-primary/20 bg-primary/10 p-3">
                  <MapPin className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h4 className="mb-1 font-semibold">Location</h4>
                  <p className="text-muted-foreground">Casablanca, Morocco</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 40 }} animate={isInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.8, delay: 0.35 }} className="glass-card p-8">
            <h3 className="mb-6 text-2xl font-semibold">Connect online</h3>
            <div className="space-y-4">
              <a href="https://github.com/youssefhoussam" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/50 p-4 transition hover:border-primary hover:text-primary">
                <Github className="h-5 w-5" />
                <span>github.com/youssefhoussam</span>
              </a>
              <a href="https://www.linkedin.com/in/youssef-houssam-66b02b357/" target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/50 p-4 transition hover:border-primary hover:text-primary">
                <Linkedin className="h-5 w-5" />
                <span>linkedin.com/in/youssefhoussam</span>
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
