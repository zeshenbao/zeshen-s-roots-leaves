import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { person } from '@/lib/content';

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  
  const contentY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [30, -30]
  );

  return (
    <section ref={sectionRef} id="about" className="section-container relative overflow-hidden" aria-labelledby="about-heading">
      {/* Subtle parallax background accent */}
      <motion.div 
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          y: useTransform(scrollYProgress, [0, 1], prefersReducedMotion ? [0, 0] : [-20, 20]),
        }}
      >
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-3xl" />
      </motion.div>
      
      <div className="section-inner">
        <motion.div
          style={{ y: contentY }}
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
