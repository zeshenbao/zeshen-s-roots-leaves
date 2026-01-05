/**
 * Parallax Forest Scene with theme-specific UX effects
 * - Parallax scroll on background images
 * - Fireflies for night mode
 * - Floating particles (pollen/petals) for day mode
 */

import { useEffect, useState, useMemo } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useThemeStore } from '@/lib/store';

// Firefly component for night mode
function Firefly({ delay, duration, startX, startY }: { 
  delay: number; 
  duration: number; 
  startX: number; 
  startY: number;
}) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{
        left: `${startX}%`,
        top: `${startY}%`,
        width: 4,
        height: 4,
        background: 'radial-gradient(circle, rgba(255,248,180,0.9) 0%, rgba(255,220,100,0.4) 50%, transparent 70%)',
        boxShadow: '0 0 8px 2px rgba(255,240,150,0.6)',
      }}
      animate={{
        x: [0, 30, -20, 40, 0],
        y: [0, -40, -20, -60, 0],
        opacity: [0, 1, 0.6, 1, 0],
        scale: [0.5, 1, 0.8, 1.2, 0.5],
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

// Floating pollen/petal for day mode
function FloatingParticle({ delay, duration, startX, type }: { 
  delay: number; 
  duration: number; 
  startX: number;
  type: 'pollen' | 'petal';
}) {
  const isPetal = type === 'petal';
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: `${startX}%`,
        top: '-5%',
        width: isPetal ? 8 : 3,
        height: isPetal ? 8 : 3,
        borderRadius: isPetal ? '50% 0 50% 50%' : '50%',
        background: isPetal 
          ? 'rgba(255, 200, 210, 0.7)' 
          : 'rgba(255, 250, 220, 0.8)',
        boxShadow: isPetal 
          ? '0 0 4px rgba(255,180,190,0.5)' 
          : '0 0 3px rgba(255,250,200,0.6)',
      }}
      animate={{
        y: ['0vh', '110vh'],
        x: [0, 30, -20, 40, 10],
        rotate: isPetal ? [0, 180, 360, 540, 720] : [0, 0],
        opacity: [0, 0.8, 0.8, 0.6, 0],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: 'linear',
      }}
    />
  );
}

export function ParallaxForestScene() {
  const { resolvedTheme } = useThemeStore();
  const isNight = resolvedTheme === 'night';
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollY } = useScroll();
  
  // Subtle parallax effect - background moves slower than scroll
  const backgroundY = useTransform(
    scrollY,
    [0, 1000],
    prefersReducedMotion ? [0, 0] : [0, 150]
  );
  
  const backgroundScale = useTransform(
    scrollY,
    [0, 1000],
    prefersReducedMotion ? [1, 1] : [1, 1.1]
  );

  // Generate fireflies for night mode
  const fireflies = useMemo(() => {
    if (prefersReducedMotion) return [];
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      delay: Math.random() * 5,
      duration: 4 + Math.random() * 4,
      startX: 10 + Math.random() * 80,
      startY: 40 + Math.random() * 50,
    }));
  }, [prefersReducedMotion]);

  // Generate floating particles for day mode
  const particles = useMemo(() => {
    if (prefersReducedMotion) return [];
    return Array.from({ length: 12 }, (_, i) => ({
      id: i,
      delay: Math.random() * 8,
      duration: 12 + Math.random() * 8,
      startX: Math.random() * 100,
      type: (Math.random() > 0.6 ? 'petal' : 'pollen') as 'petal' | 'pollen',
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
          {fireflies.map((firefly) => (
            <Firefly
              key={firefly.id}
              delay={firefly.delay}
              duration={firefly.duration}
              startX={firefly.startX}
              startY={firefly.startY}
            />
          ))}
        </div>
      )}
      
      {/* Day mode: Floating pollen and petals */}
      {!isNight && !prefersReducedMotion && (
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <FloatingParticle
              key={particle.id}
              delay={particle.delay}
              duration={particle.duration}
              startX={particle.startX}
              type={particle.type}
            />
          ))}
        </div>
      )}
      
      {/* Subtle gradient overlay for better text readability */}
      <div 
        className="absolute inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: isNight
            ? 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 30%, transparent 70%, rgba(0,0,0,0.2) 100%)'
            : 'linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 30%, transparent 70%, rgba(255,255,255,0.1) 100%)',
        }}
      />
    </div>
  );
}

export default ParallaxForestScene;
