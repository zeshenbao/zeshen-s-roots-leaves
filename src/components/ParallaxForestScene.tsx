/**
 * Parallax Forest Scene with theme-specific ambient effects
 * - Subtle parallax scroll on background
 * - Fireflies for night mode (gentle, non-distracting)
 * - Floating seeds/dandelions for day mode
 */

import { useMemo } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useThemeStore } from '@/lib/store';

// Firefly - gentle amber glow that drifts slowly
function Firefly({ delay, duration, x, y }: { 
  delay: number; 
  duration: number; 
  x: number; 
  y: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        width: 3,
        height: 3,
        borderRadius: '50%',
        background: '#FFE4A0',
        boxShadow: '0 0 6px 2px rgba(255,220,120,0.5), 0 0 12px 4px rgba(255,200,80,0.2)',
      }}
      animate={{
        x: [0, 15, -10, 20, 0],
        y: [0, -25, -15, -35, 0],
        opacity: [0, 0.8, 0.4, 0.9, 0],
        scale: [0.6, 1, 0.7, 1.1, 0.6],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  );
}

// Floating seed/dandelion for day mode - soft, drifting
function FloatingSeed({ delay, duration, startX }: { 
  delay: number; 
  duration: number; 
  startX: number;
}) {
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${startX}%`,
        top: '-3%',
      }}
      animate={{
        y: ['0vh', '105vh'],
        x: [0, 40, -20, 50, 20],
        rotate: [0, 45, -30, 60, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    >
      {/* Simple dandelion seed shape */}
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <circle cx="6" cy="8" r="1.5" fill="rgba(255,255,255,0.6)" />
        <line x1="6" y1="8" x2="6" y2="2" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
        <line x1="6" y1="2" x2="3" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
        <line x1="6" y1="2" x2="9" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
        <line x1="6" y1="2" x2="6" y2="0" stroke="rgba(255,255,255,0.3)" strokeWidth="0.3" />
      </svg>
    </motion.div>
  );
}

export function ParallaxForestScene() {
  const { resolvedTheme } = useThemeStore();
  const isNight = resolvedTheme === 'night';
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollY } = useScroll();
  
  // Subtle parallax effect
  const backgroundY = useTransform(
    scrollY,
    [0, 1000],
    prefersReducedMotion ? [0, 0] : [0, 80]
  );
  
  const backgroundScale = useTransform(
    scrollY,
    [0, 1000],
    prefersReducedMotion ? [1, 1] : [1, 1.04]
  );

  // Generate fireflies for night mode (fewer, more subtle)
  const fireflies = useMemo(() => {
    if (prefersReducedMotion) return [];
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: Math.random() * 8,
      duration: 6 + Math.random() * 6,
      x: 5 + Math.random() * 90,
      y: 35 + Math.random() * 55,
    }));
  }, [prefersReducedMotion]);

  // Generate floating seeds for day mode
  const seeds = useMemo(() => {
    if (prefersReducedMotion) return [];
    return Array.from({ length: 8 }, (_, i) => ({
      id: i,
      delay: Math.random() * 12,
      duration: 18 + Math.random() * 10,
      startX: Math.random() * 100,
    }));
  }, [prefersReducedMotion]);

  return (
    <div 
      className="fixed inset-0 w-full h-full -z-10 overflow-hidden"
      aria-hidden="true"
    >
      {/* Light mode background with parallax */}
      <motion.div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 origin-center"
        style={{
          backgroundImage: 'url(/og/og-light.png)',
          opacity: isNight ? 0 : 1,
          y: backgroundY,
          scale: backgroundScale,
        }}
      />
      
      {/* Dark mode background with parallax */}
      <motion.div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700 origin-center"
        style={{
          backgroundImage: 'url(/og/og-dark.png)',
          opacity: isNight ? 1 : 0,
          y: backgroundY,
          scale: backgroundScale,
        }}
      />
      
      {/* Night mode: Fireflies */}
      {isNight && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {fireflies.map((f) => (
            <Firefly key={f.id} delay={f.delay} duration={f.duration} x={f.x} y={f.y} />
          ))}
        </div>
      )}
      
      {/* Day mode: Floating dandelion seeds */}
      {!isNight && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {seeds.map((s) => (
            <FloatingSeed key={s.id} delay={s.delay} duration={s.duration} startX={s.startX} />
          ))}
        </div>
      )}
    </div>
  );
}

export default ParallaxForestScene;
