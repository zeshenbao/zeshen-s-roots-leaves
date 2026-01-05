import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { person } from '@/lib/content';
import { useThemeStore } from '@/lib/store';

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { resolvedTheme } = useThemeStore();
  const isNight = resolvedTheme === 'night';
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  
  const contentY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [20, -20]
  );

  // Text shadow for readability
  const textShadow = isNight
    ? '0 2px 16px rgba(0,0,0,0.6)'
    : '0 2px 16px rgba(255,255,255,0.8)';

  return (
    <section 
      ref={sectionRef} 
      id="about" 
      className="section-container relative overflow-hidden" 
      aria-labelledby="about-heading"
    >
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
            style={{ textShadow }}
          >
            About Me
          </h2>
          <p 
            className="section-subtitle"
            style={{ textShadow }}
          >
            {person.introduction}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
