/**
 * Parallax Forest Scene - Clean day/night backgrounds
 * Subtle parallax scroll effect, no overlays
 */

import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { useThemeStore } from '@/lib/store';

export function ParallaxForestScene() {
  const { resolvedTheme } = useThemeStore();
  const isNight = resolvedTheme === 'night';
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollY } = useScroll();
  
  // Subtle parallax effect - background moves slower than scroll
  const backgroundY = useTransform(
    scrollY,
    [0, 1000],
    prefersReducedMotion ? [0, 0] : [0, 100]
  );
  
  const backgroundScale = useTransform(
    scrollY,
    [0, 1000],
    prefersReducedMotion ? [1, 1] : [1, 1.05]
  );

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
    </div>
  );
}

export default ParallaxForestScene;
