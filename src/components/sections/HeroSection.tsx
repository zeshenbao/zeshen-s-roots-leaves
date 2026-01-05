import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowDown, Download, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { person, education } from '@/lib/content';
import { generateResumePDF } from '@/lib/generate-resume';
import { useThemeStore } from '@/lib/store';

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { resolvedTheme } = useThemeStore();
  const isNight = resolvedTheme === 'night';
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });
  
  // Parallax transforms
  const heroY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 150]
  );
  
  const heroOpacity = useTransform(
    scrollYProgress,
    [0, 0.5],
    prefersReducedMotion ? [1, 1] : [1, 0]
  );
  
  const heroScale = useTransform(
    scrollYProgress,
    [0, 0.5],
    prefersReducedMotion ? [1, 1] : [1, 0.95]
  );
  
  const badgeY = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? [0, 0] : [0, 50]
  );
  
  const arrowOpacity = useTransform(
    scrollYProgress,
    [0, 0.15],
    [1, 0]
  );

  return (
    <section 
      ref={sectionRef}
      id="home" 
      className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden"
      aria-labelledby="hero-heading"
    >
      {/* Hero content scrim for readability - per spec:
          Light: white opacity 0.10
          Dark: black opacity 0.18
          Scrim is max-w container background, not full-screen */}
      <div 
        className="absolute inset-x-0 top-1/2 -translate-y-1/2 mx-auto max-w-4xl h-[420px] pointer-events-none transition-all duration-500 rounded-3xl"
        style={{
          background: isNight 
            ? 'rgba(0, 0, 0, 0.18)'
            : 'rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(1px)',
        }}
      />
      
      <div className="container max-w-5xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ y: heroY, opacity: heroOpacity, scale: heroScale }}
        >
          <motion.div style={{ y: badgeY }}>
            <Badge variant="glass" className="mb-6">
              <MapPin className="w-3 h-3 mr-1" aria-hidden="true" />
              {person.location}
            </Badge>
          </motion.div>
          
          <h1 
            id="hero-heading"
            className="text-display-xl text-foreground mb-6"
          >
            {person.name}
          </h1>
          
          <p className="text-xl sm:text-2xl text-primary font-medium mb-4">
            {person.headline}
          </p>
          
          <p className="text-body-lg max-w-2xl mx-auto mb-8">
            {education[0].degree} at {education[0].institution}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Button variant="hero" size="lg" asChild>
              <a href="#projects">
                View Projects
              </a>
            </Button>
            <Button variant="heroOutline" size="lg" onClick={generateResumePDF}>
              <Download className="w-4 h-4 mr-2" aria-hidden="true" />
              Download CV
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <a href={`mailto:${person.email}`}>
                <Mail className="w-4 h-4 mr-2" aria-hidden="true" />
                Contact
              </a>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm">
            <a href={`mailto:${person.email}`} className="flex items-center gap-2 link-subtle">
              <Mail className="w-4 h-4" aria-hidden="true" />
              {person.email}
            </a>
            <a href={`tel:${person.phone}`} className="flex items-center gap-2 link-subtle">
              <Phone className="w-4 h-4" aria-hidden="true" />
              {person.phone}
            </a>
          </div>
        </motion.div>
        
        {/* Scroll indicator arrow - positioned relative to viewport bottom */}
        <motion.a
          href="#about"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 p-2 rounded-full hover:bg-foreground/5 transition-colors cursor-pointer"
          style={{ opacity: arrowOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{ delay: 1, duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          aria-label="Scroll to about section"
        >
          <ArrowDown className="w-6 h-6 text-muted-foreground" />
        </motion.a>
      </div>
    </section>
  );
}
