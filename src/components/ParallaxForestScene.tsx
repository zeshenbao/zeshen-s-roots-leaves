/**
 * 2D Parallax Forest Scene (Extra-Clean)
 * Depth achieved through value contrast and composition - NO fog/mist
 * Storyboard:
 *   Light: Calm Nordic lake, golden hour. Quiet sky window, distant treeline, clean lake, framing pines.
 *   Dark: Moonlit lake, small bonfire, sparse stars, layered silhouettes by value.
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useThemeStore, usePortfolioStore } from '@/lib/store';

// ============ PARALLAX CONFIGURATION ============
const PARALLAX_FACTORS = {
  sky: 0.02,
  mountains: 0.05,
  lake: 0.08,
  midTrees: 0.12,
  foreground: 0.2,
  bonfire: 0.15,
};

const LAYER_POSITIONS = {
  sky: { zIndex: 1 },
  stars: { zIndex: 2 },
  moon: { zIndex: 3 },
  distantTrees: { zIndex: 4 },
  lake: { zIndex: 5 },
  midTrees: { zIndex: 6 },
  bonfire: { zIndex: 7 },
  foreground: { zIndex: 8 },
  vignette: { zIndex: 9 },
};

// ============ THEME COLORS - Extra-clean minimal palette ============
// Depth through VALUE CONTRAST, not fog
const THEME_COLORS = {
  day: {
    // Quiet sky window for text readability
    skyTop: 'hsl(200 35% 85%)',
    skyBottom: 'hsl(40 35% 92%)',
    // Distant treeline - LIGHTER value for atmospheric depth
    distantTrees: 'hsl(150 18% 55%)',
    // Lake - clean reflection
    lake: 'hsl(180 20% 80%)',
    lakeReflection: 'hsl(40 25% 88%)',
    // Mid trees - medium value
    treeMid: 'hsl(145 28% 35%)',
    // Foreground - DARKEST for contrast
    treeFore: 'hsl(145 32% 15%)',
  },
  night: {
    // Deep navy sky - quiet window
    skyTop: 'hsl(220 40% 6%)',
    skyBottom: 'hsl(210 35% 12%)',
    // Distant trees - slightly lighter than foreground
    distantTrees: 'hsl(200 20% 18%)',
    // Lake - dark with reflection path
    lake: 'hsl(210 25% 8%)',
    lakeReflection: 'hsl(210 30% 14%)',
    // Mid trees
    treeMid: 'hsl(160 22% 12%)',
    // Foreground - darkest silhouettes
    treeFore: 'hsl(160 20% 4%)',
    // Moon and bonfire
    moonGlow: 'hsl(45 70% 92%)',
    bonfireCore: 'hsl(35 95% 60%)',
    bonfireGlow: 'hsl(30 85% 50%)',
    starColor: 'hsl(45 60% 90%)',
  },
};

// ============ STAR GENERATION (sparse) ============
function generateStars(count: number): { x: number; y: number; size: number; opacity: number; delay: number }[] {
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 40, // Only in upper portion
    size: Math.random() * 1.2 + 0.4,
    opacity: Math.random() * 0.4 + 0.2,
    delay: Math.random() * 4,
  }));
}

// ============ LAYER COMPONENTS ============

interface LayerProps {
  offset: { x: number; y: number };
  isNight: boolean;
  reducedMotion: boolean;
}

// Sky gradient layer - QUIET WINDOW for text
function SkyLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? THEME_COLORS.night : THEME_COLORS.day;
  const parallaxY = reducedMotion ? 0 : offset.y * PARALLAX_FACTORS.sky;
  
  return (
    <div 
      className="absolute inset-0 transition-all duration-500"
      style={{
        zIndex: LAYER_POSITIONS.sky.zIndex,
        transform: `translateY(${parallaxY}px)`,
        background: `linear-gradient(180deg, ${colors.skyTop} 0%, ${colors.skyBottom} 70%, ${colors.skyBottom} 100%)`,
      }}
    />
  );
}

// Stars layer (night only) - VERY SPARSE
function StarsLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const stars = useMemo(() => generateStars(25), []); // Reduced count
  const parallaxY = reducedMotion ? 0 : offset.y * PARALLAX_FACTORS.sky;
  
  if (!isNight) return null;
  
  return (
    <div 
      className="absolute inset-0 overflow-hidden"
      style={{
        zIndex: LAYER_POSITIONS.stars.zIndex,
        transform: `translateY(${parallaxY}px)`,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        {stars.map((star, i) => (
          <motion.circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.size * 0.12}
            fill={THEME_COLORS.night.starColor}
            initial={{ opacity: star.opacity * 0.6 }}
            animate={reducedMotion ? {} : {
              opacity: [star.opacity * 0.6, star.opacity, star.opacity * 0.6],
            }}
            transition={{
              duration: 3 + star.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
    </div>
  );
}

// Moon layer (night only) - modest size, clean reflection
function MoonLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const parallaxX = reducedMotion ? 0 : offset.x * PARALLAX_FACTORS.mountains;
  const parallaxY = reducedMotion ? 0 : offset.y * PARALLAX_FACTORS.mountains;
  
  if (!isNight) return null;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: LAYER_POSITIONS.moon.zIndex,
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
      }}
    >
      {/* Moon - modest size, off-center */}
      <div 
        className="absolute w-12 h-12 md:w-14 md:h-14 rounded-full"
        style={{
          top: '10%',
          right: '22%',
          background: `radial-gradient(circle at 35% 35%, 
            ${THEME_COLORS.night.moonGlow} 0%, 
            hsl(45 55% 82%) 60%, 
            hsl(45 40% 72%) 100%)`,
          boxShadow: `
            0 0 30px 10px hsl(45 60% 90% / 0.25),
            0 0 60px 20px hsl(200 40% 70% / 0.1)
          `,
        }}
      />
      {/* Single clean moonlight reflection streak on lake */}
      <div 
        className="absolute"
        style={{
          right: '24%',
          bottom: '28%',
          width: '4px',
          height: '18%',
          background: `linear-gradient(180deg, 
            transparent 0%,
            hsl(45 50% 85% / 0.3) 30%,
            hsl(45 55% 90% / 0.5) 50%,
            hsl(45 50% 85% / 0.3) 70%,
            transparent 100%
          )`,
          filter: 'blur(3px)',
        }}
      />
    </div>
  );
}

// Distant treeline - LIGHTER value for depth (no fog needed)
function DistantTreesLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? THEME_COLORS.night : THEME_COLORS.day;
  const parallaxX = reducedMotion ? 0 : offset.x * PARALLAX_FACTORS.mountains;
  const parallaxY = reducedMotion ? 0 : offset.y * PARALLAX_FACTORS.mountains;
  
  return (
    <div 
      className="absolute inset-0 transition-colors duration-500"
      style={{
        zIndex: LAYER_POSITIONS.distantTrees.zIndex,
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
        {/* Distant forest silhouette - horizon line */}
        <path
          d="M -5 100 
             L -5 62 
             Q 5 58 10 61 L 12 56 Q 15 52 18 57 L 22 54 
             Q 28 50 32 55 L 38 51 Q 42 48 46 52 L 50 49 
             Q 55 46 60 51 L 65 48 Q 70 45 75 50 L 80 53 
             Q 85 49 90 54 L 95 57 Q 100 53 105 58 
             L 105 100 Z"
          fill={colors.distantTrees}
          opacity={isNight ? 0.9 : 0.75}
        />
      </svg>
    </div>
  );
}

// Lake with clean reflection strip
function LakeLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? THEME_COLORS.night : THEME_COLORS.day;
  const parallaxX = reducedMotion ? 0 : offset.x * PARALLAX_FACTORS.lake;
  const parallaxY = reducedMotion ? 0 : offset.y * PARALLAX_FACTORS.lake;
  
  return (
    <div 
      className="absolute inset-0 transition-colors duration-500"
      style={{
        zIndex: LAYER_POSITIONS.lake.zIndex,
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="lake-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.lakeReflection} />
            <stop offset="40%" stopColor={colors.lake} />
            <stop offset="100%" stopColor={colors.lake} />
          </linearGradient>
        </defs>
        {/* Lake body - clean ellipse */}
        <ellipse
          cx="50"
          cy="75"
          rx="58"
          ry="14"
          fill="url(#lake-gradient)"
        />
        {/* Subtle shore highlight */}
        <ellipse
          cx="50"
          cy="72"
          rx="54"
          ry="11"
          fill="none"
          stroke={colors.lakeReflection}
          strokeWidth="0.2"
          opacity={0.4}
        />
      </svg>
    </div>
  );
}

// Mid-ground trees - medium value
function MidTreesLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? THEME_COLORS.night : THEME_COLORS.day;
  const parallaxX = reducedMotion ? 0 : offset.x * PARALLAX_FACTORS.midTrees;
  const parallaxY = reducedMotion ? 0 : offset.y * PARALLAX_FACTORS.midTrees;
  
  return (
    <div 
      className="absolute inset-0 transition-colors duration-500"
      style={{
        zIndex: LAYER_POSITIONS.midTrees.zIndex,
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
        {/* Mid-ground forest - slightly darker than distant */}
        <path
          d="M -5 100 
             L -5 68 
             Q 0 62 5 67 L 8 58 Q 12 50 16 60 L 20 55 
             Q 26 48 30 56 L 35 50 Q 40 44 45 52 L 50 48 
             Q 56 42 62 50 L 68 45 Q 74 40 80 48 L 85 52 
             Q 90 46 95 53 L 100 58 Q 105 52 105 60 
             L 105 100 Z"
          fill={colors.treeMid}
          opacity={0.95}
        />
      </svg>
    </div>
  );
}

// Bonfire (night only) - small, warm glow
function BonfireLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const parallaxX = reducedMotion ? 0 : offset.x * PARALLAX_FACTORS.bonfire;
  const parallaxY = reducedMotion ? 0 : offset.y * PARALLAX_FACTORS.bonfire;
  
  if (!isNight) return null;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{
        zIndex: LAYER_POSITIONS.bonfire.zIndex,
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
      }}
    >
      {/* Warm glow on ground */}
      <div 
        className="absolute"
        style={{
          left: '32%',
          bottom: '24%',
          width: '60px',
          height: '30px',
          background: `radial-gradient(ellipse at 50% 100%,
            ${THEME_COLORS.night.bonfireGlow}60 0%,
            ${THEME_COLORS.night.bonfireGlow}25 50%,
            transparent 100%
          )`,
          filter: 'blur(6px)',
        }}
      />
      {/* Fire core */}
      <motion.div 
        className="absolute"
        style={{
          left: 'calc(32% + 22px)',
          bottom: '25%',
          width: '16px',
          height: '20px',
          background: `radial-gradient(ellipse at 50% 80%,
            hsl(50 95% 75%) 0%,
            ${THEME_COLORS.night.bonfireCore} 50%,
            hsl(20 90% 40%) 85%,
            transparent 100%
          )`,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        }}
        animate={reducedMotion ? {} : {
          scaleY: [1, 1.15, 0.9, 1.1, 1],
          scaleX: [1, 0.92, 1.08, 0.96, 1],
        }}
        transition={{
          duration: 0.6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Tiny embers */}
      {!reducedMotion && (
        <div 
          className="absolute" 
          style={{ left: 'calc(32% + 18px)', bottom: '28%', width: '24px', height: '40px' }}
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-0.5 h-0.5 rounded-full"
              style={{
                left: `${40 + Math.sin(i * 2.5) * 35}%`,
                backgroundColor: 'hsl(40 90% 65%)',
              }}
              initial={{ bottom: 0, opacity: 0.7 }}
              animate={{
                bottom: ['0%', '100%'],
                opacity: [0.7, 0],
                x: [0, Math.sin(i * 3) * 10],
              }}
              transition={{
                duration: 1.8 + i * 0.4,
                repeat: Infinity,
                delay: i * 0.5,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Foreground trees - DARKEST silhouettes, frame left/right, center open
function ForegroundTreesLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? THEME_COLORS.night : THEME_COLORS.day;
  const parallaxX = reducedMotion ? 0 : offset.x * PARALLAX_FACTORS.foreground;
  const parallaxY = reducedMotion ? 0 : offset.y * PARALLAX_FACTORS.foreground;
  
  return (
    <div 
      className="absolute inset-0 transition-colors duration-500"
      style={{
        zIndex: LAYER_POSITIONS.foreground.zIndex,
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
        {/* Left pine cluster - framing */}
        <path
          d="M -5 100 
             L -5 50 Q -2 42 2 52 L 5 38 Q 9 28 13 40 L 17 48 
             Q 22 52 26 50 L 26 100 Z"
          fill={colors.treeFore}
        />
        {/* Right pine cluster - framing */}
        <path
          d="M 74 100 
             L 74 50 Q 78 52 83 48 L 87 40 Q 91 28 95 38 L 98 52 
             Q 102 42 105 50 L 105 100 Z"
          fill={colors.treeFore}
        />
      </svg>
    </div>
  );
}

// Subtle vignette only (NO fog, NO heavy grain)
function VignetteLayer({ isNight }: { isNight: boolean }) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: LAYER_POSITIONS.vignette.zIndex }}
    >
      {/* Very subtle vignette - not haze */}
      <div 
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse 120% 100% at 50% 50%,
            transparent 40%,
            ${isNight ? 'hsl(220 35% 4% / 0.3)' : 'hsl(45 15% 15% / 0.08)'} 100%
          )`,
        }}
      />
    </div>
  );
}

// ============ MAIN COMPONENT ============
export function ParallaxForestScene() {
  const { resolvedTheme } = useThemeStore();
  const { featureFlags } = usePortfolioStore();
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion || featureFlags.reducedMotion;
  
  const isNight = resolvedTheme === 'night';
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const [scrollOffset, setScrollOffset] = useState(0);
  const rafRef = useRef<number>();
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  
  // Smooth mouse parallax
  useEffect(() => {
    if (reducedMotion) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      targetRef.current = {
        x: (e.clientX - centerX) / centerX * 25,
        y: (e.clientY - centerY) / centerY * 15,
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);
  
  // Scroll-based parallax for mobile
  useEffect(() => {
    if (reducedMotion) return;
    
    const handleScroll = () => {
      setScrollOffset(window.scrollY * 0.08);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion]);
  
  // RAF-based smooth interpolation
  useEffect(() => {
    if (reducedMotion) return;
    
    const animate = () => {
      const ease = 0.04;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * ease;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * ease;
      
      setMouseOffset({
        x: currentRef.current.x,
        y: currentRef.current.y + scrollOffset,
      });
      
      rafRef.current = requestAnimationFrame(animate);
    };
    
    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion, scrollOffset]);
  
  const layerProps: LayerProps = {
    offset: mouseOffset,
    isNight,
    reducedMotion: !!reducedMotion,
  };
  
  return (
    <div 
      className="fixed inset-0 overflow-hidden pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
      role="presentation"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isNight ? 'night' : 'day'}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
        >
          <SkyLayer {...layerProps} />
          <StarsLayer {...layerProps} />
          <MoonLayer {...layerProps} />
          <DistantTreesLayer {...layerProps} />
          <LakeLayer {...layerProps} />
          <MidTreesLayer {...layerProps} />
          <BonfireLayer {...layerProps} />
          <ForegroundTreesLayer {...layerProps} />
          <VignetteLayer isNight={isNight} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
