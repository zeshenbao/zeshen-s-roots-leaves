import { motion } from 'framer-motion';
import { person } from '@/lib/content';

export function AboutSection() {
  return (
    <section id="about" className="py-24 px-6" aria-labelledby="about-heading">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 
            id="about-heading"
            className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-6"
          >
            About Me
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
            {person.introduction}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
