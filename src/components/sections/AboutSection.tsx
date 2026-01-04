import { motion } from 'framer-motion';
import { person } from '@/lib/content';

export function AboutSection() {
  return (
    <section id="about" className="section-container" aria-labelledby="about-heading">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section-accent"
        >
          <h2 
            id="about-heading"
            className="section-title"
          >
            About Me
          </h2>
          <p className="section-subtitle">
            {person.introduction}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
