import { useEffect, useState, useCallback } from 'react';
import { useReducedMotion } from 'framer-motion';

interface ParallaxOptions {
  speed?: number; // Multiplier for parallax effect (0.1 = slow, 1 = match scroll)
  direction?: 'up' | 'down';
  clamp?: boolean; // Limit the range of movement
  maxOffset?: number; // Maximum offset in pixels
}

export function useParallax(options: ParallaxOptions = {}) {
  const { 
    speed = 0.3, 
    direction = 'up',
    clamp = true,
    maxOffset = 200 
  } = options;
  
  const prefersReducedMotion = useReducedMotion();
  const [offset, setOffset] = useState(0);

  const handleScroll = useCallback(() => {
    if (prefersReducedMotion) return;
    
    const scrollY = window.scrollY;
    let calculatedOffset = scrollY * speed * (direction === 'up' ? -1 : 1);
    
    if (clamp) {
      calculatedOffset = Math.max(-maxOffset, Math.min(maxOffset, calculatedOffset));
    }
    
    setOffset(calculatedOffset);
  }, [speed, direction, clamp, maxOffset, prefersReducedMotion]);

  useEffect(() => {
    if (prefersReducedMotion) return;
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial calculation
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll, prefersReducedMotion]);

  return prefersReducedMotion ? 0 : offset;
}

// Hook for element-based parallax (relative to element position)
export function useElementParallax(
  elementRef: React.RefObject<HTMLElement>,
  options: ParallaxOptions = {}
) {
  const { speed = 0.2, direction = 'up', maxOffset = 100 } = options;
  const prefersReducedMotion = useReducedMotion();
  const [offset, setOffset] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    if (prefersReducedMotion || !elementRef.current) return;

    const handleScroll = () => {
      const element = elementRef.current;
      if (!element) return;

      const rect = element.getBoundingClientRect();
      const windowHeight = window.innerHeight;
      
      // Calculate how far the element is from the center of the viewport
      const elementCenter = rect.top + rect.height / 2;
      const viewportCenter = windowHeight / 2;
      const distanceFromCenter = elementCenter - viewportCenter;
      
      // Calculate parallax offset
      let calculatedOffset = distanceFromCenter * speed * (direction === 'up' ? -1 : 1);
      calculatedOffset = Math.max(-maxOffset, Math.min(maxOffset, calculatedOffset));
      
      // Calculate fade based on position
      const fadeStart = windowHeight * 1.2;
      const fadeEnd = -rect.height * 0.5;
      const fadeProgress = Math.max(0, Math.min(1, (rect.top - fadeEnd) / (fadeStart - fadeEnd)));
      
      setOffset(calculatedOffset);
      setOpacity(fadeProgress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [elementRef, speed, direction, maxOffset, prefersReducedMotion]);

  return { offset: prefersReducedMotion ? 0 : offset, opacity };
}
