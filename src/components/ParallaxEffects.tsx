import { useRef, ReactNode } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
  speed?: number; // 0 = no parallax, 1 = full parallax
  direction?: 'up' | 'down';
  fadeOnScroll?: boolean;
}

export function ParallaxContainer({
  children,
  className = '',
  speed = 0.2,
  direction = 'up',
  fadeOnScroll = false,
}: ParallaxContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  
  const yMultiplier = direction === 'up' ? -1 : 1;
  const yRange = prefersReducedMotion 
    ? ['0px', '0px'] 
    : [`${50 * speed * yMultiplier}px`, `${-50 * speed * yMultiplier}px`];
  const y = useTransform(scrollYProgress, [0, 1], yRange);
  
  const opacity = useTransform(
    scrollYProgress,
    [0, 0.2, 0.8, 1],
    fadeOnScroll && !prefersReducedMotion ? [0.5, 1, 1, 0.5] : [1, 1, 1, 1]
  );
  
  return (
    <motion.div
      ref={ref}
      style={{ y, opacity }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface ParallaxLayerProps {
  children: ReactNode;
  speed?: number;
  className?: string;
}

export function ParallaxLayer({ children, speed = 0.3, className = '' }: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  
  const yRange = prefersReducedMotion 
    ? ['0px', '0px'] 
    : [`${100 * speed}px`, `${-100 * speed}px`];
  const y = useTransform(scrollYProgress, [0, 1], yRange);
  
  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  );
}

interface ParallaxBackgroundProps {
  className?: string;
  gradient?: string;
  speed?: number;
}

export function ParallaxBackground({ 
  className = '', 
  gradient,
  speed = 0.1 
}: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });
  
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    prefersReducedMotion ? ['0%', '0%'] : ['0%', `${30 * speed}%`]
  );
  
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    prefersReducedMotion ? [1, 1, 1] : [1.05, 1, 1.05]
  );
  
  return (
    <motion.div
      ref={ref}
      className={`absolute inset-0 -z-10 overflow-hidden ${className}`}
      style={{ y }}
    >
      <motion.div
        className="absolute inset-0"
        style={{ 
          scale,
          background: gradient || 'transparent',
        }}
      />
    </motion.div>
  );
}
