import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, Award } from "lucide-react";

const education = [
  {
    degree: "Cycle d'Ingénieur en Informatique",
    school: "EMSI Casablanca",
    period: "2020 - 2025",
    description: "Spécialisation en développement logiciel, architecture des systèmes et cybersécurité",
  },
];

const certifications = [
  {
    name: "Software Design & Project Management",
    issuer: "Coursera",
    year: "2024",
  },
  {
    name: "Design Patterns",
    issuer: "Coursera",
    year: "2024",
  },
  {
    name: "React Basics",
    issuer: "Meta",
    year: "2024",
  },
  {
    name: "Python Programming",
    issuer: "University of Michigan",
    year: "2023",
  },
];

export const Education = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="education" className="py-20 relative" ref={ref}>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Formation & <span className="text-gradient">Certifications</span>
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
        </motion.div>

        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12">
          {/* Education */}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl font-display font-semibold mb-8 flex items-center gap-2"
            >
              <GraduationCap className="w-8 h-8 text-primary" />
              Formation
            </motion.h3>

            {education.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                className="glass-card p-8 mb-6 hover:scale-[1.02] transition-transform duration-300"
              >
                <h4 className="text-xl font-display font-semibold mb-2">{item.degree}</h4>
                <p className="text-primary mb-2">{item.school}</p>
                <p className="text-sm text-muted-foreground mb-3">{item.period}</p>
                <p className="text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Certifications */}
          <div>
            <motion.h3
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-2xl font-display font-semibold mb-8 flex items-center gap-2"
            >
              <Award className="w-8 h-8 text-primary" />
              Certifications
            </motion.h3>

            <div className="space-y-4">
              {certifications.map((cert, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 50 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.8, delay: 0.3 + index * 0.1 }}
                  className="glass-card p-6 hover:scale-[1.02] transition-transform duration-300"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-display font-semibold mb-1">{cert.name}</h4>
                      <p className="text-sm text-muted-foreground">{cert.issuer}</p>
                    </div>
                    <span className="text-sm text-primary font-medium">{cert.year}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
