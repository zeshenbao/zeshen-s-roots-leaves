/**
 * 2D Parallax Forest Scene
 * Lightweight multi-layer parallax with day/night modes
 * Includes: sky, mountains, lake, trees, and night-only bonfire/moon
 */

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useThemeStore, usePortfolioStore } from '@/lib/store';

// ============ PARALLAX CONFIGURATION ============
const PARALLAX_FACTORS = {
  sky: 0.02,
  mountains: 0.05,
  mist: 0.08,
  lake: 0.1,
  midTrees: 0.15,
  foreground: 0.25,
  bonfire: 0.18,
};

const LAYER_POSITIONS = {
  sky: { zIndex: 1 },
  stars: { zIndex: 2 },
  moon: { zIndex: 3 },
  mountains: { zIndex: 4 },
  mist: { zIndex: 5 },
  lake: { zIndex: 6 },
  midTrees: { zIndex: 7 },
  bonfire: { zIndex: 8 },
  foreground: { zIndex: 9 },
  vignette: { zIndex: 10 },
};

// ============ THEME COLORS ============
const THEME_COLORS = {
  day: {
    skyTop: 'hsl(200 60% 85%)',
    skyBottom: 'hsl(45 40% 92%)',
    mountains: 'hsl(160 25% 55%)',
    mountainsShadow: 'hsl(160 20% 45%)',
    lake: 'hsl(180 30% 75%)',
    lakeReflection: 'hsl(180 35% 85%)',
    treeMid: 'hsl(145 35% 35%)',
    treeFore: 'hsl(145 40% 22%)',
    mist: 'hsl(45 20% 95%)',
  },
  night: {
    skyTop: 'hsl(220 40% 8%)',
    skyBottom: 'hsl(200 35% 15%)',
    mountains: 'hsl(200 25% 18%)',
    mountainsShadow: 'hsl(200 20% 12%)',
    lake: 'hsl(200 30% 12%)',
    lakeReflection: 'hsl(200 40% 20%)',
    treeMid: 'hsl(160 30% 12%)',
    treeFore: 'hsl(160 25% 6%)',
    mist: 'hsl(200 20% 15%)',
    moonGlow: 'hsl(45 80% 95%)',
    bonfireGlow: 'hsl(25 90% 50%)',
    starColor: 'hsl(45 80% 95%)',
  },
};

// ============ SVG TREE SHAPES ============
function generateTreePath(x: number, height: number, width: number, variant: number = 0): string {
  const baseY = 100;
  const tipY = 100 - height;
  const halfW = width / 2;
  
  // Create organic tree silhouette with slight variations
  const wobble = Math.sin(variant * 2.5) * 2;
  
  return `
    M ${x} ${baseY}
    L ${x - halfW * 0.3} ${baseY}
    C ${x - halfW * 0.6 + wobble} ${tipY + height * 0.7},
      ${x - halfW * 0.8} ${tipY + height * 0.4},
      ${x - halfW * 0.15 + wobble} ${tipY + height * 0.15}
    L ${x} ${tipY}
    L ${x + halfW * 0.15 - wobble} ${tipY + height * 0.15}
    C ${x + halfW * 0.8} ${tipY + height * 0.4},
      ${x + halfW * 0.6 - wobble} ${tipY + height * 0.7},
      ${x + halfW * 0.3} ${baseY}
    Z
  `;
}

// Generate multiple tree paths for a forest row
function generateForestRow(count: number, heightRange: [number, number], widthRange: [number, number]): string[] {
  const trees: string[] = [];
  const spacing = 100 / (count + 1);
  
  for (let i = 0; i < count; i++) {
    const x = spacing * (i + 1) + (Math.sin(i * 3.7) * spacing * 0.3);
    const height = heightRange[0] + Math.random() * (heightRange[1] - heightRange[0]);
    const width = widthRange[0] + Math.random() * (widthRange[1] - widthRange[0]);
    trees.push(generateTreePath(x, height, width, i));
  }
  
  return trees;
}

// ============ STAR GENERATION ============
function generateStars(count: number): { x: number; y: number; size: number; opacity: number; delay: number }[] {
  return Array.from({ length: count }, (_, i) => ({
    x: Math.random() * 100,
    y: Math.random() * 50, // Only in upper half
    size: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.3,
    delay: Math.random() * 3,
  }));
}

// ============ LAYER COMPONENTS ============

interface LayerProps {
  offset: { x: number; y: number };
  isNight: boolean;
  reducedMotion: boolean;
}

// Sky gradient layer
function SkyLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? THEME_COLORS.night : THEME_COLORS.day;
  const parallaxY = reducedMotion ? 0 : offset.y * PARALLAX_FACTORS.sky;
  
  return (
    <div 
      className="absolute inset-0 transition-all duration-500"
      style={{
        zIndex: LAYER_POSITIONS.sky.zIndex,
        transform: `translateY(${parallaxY}px)`,
        background: `linear-gradient(180deg, ${colors.skyTop} 0%, ${colors.skyBottom} 100%)`,
      }}
    />
  );
}

// Stars layer (night only)
function StarsLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const stars = useMemo(() => generateStars(80), []);
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
            r={star.size * 0.15}
            fill={THEME_COLORS.night.starColor}
            initial={{ opacity: star.opacity * 0.5 }}
            animate={reducedMotion ? {} : {
              opacity: [star.opacity * 0.5, star.opacity, star.opacity * 0.5],
            }}
            transition={{
              duration: 2 + star.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </svg>
    </div>
  );
}

// Moon layer (night only)
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
      {/* Moon */}
      <div 
        className="absolute w-16 h-16 md:w-20 md:h-20 rounded-full"
        style={{
          top: '12%',
          right: '18%',
          background: `radial-gradient(circle at 40% 40%, ${THEME_COLORS.night.moonGlow} 0%, hsl(45 60% 85%) 50%, hsl(45 40% 75%) 100%)`,
          boxShadow: `
            0 0 40px 15px hsl(45 60% 90% / 0.3),
            0 0 80px 30px hsl(200 50% 70% / 0.15),
            0 0 120px 50px hsl(200 40% 60% / 0.1)
          `,
        }}
      />
      {/* Moonlight beam on lake */}
      <div 
        className="absolute left-1/2 bottom-[30%] w-8 h-[25%] -translate-x-1/2"
        style={{
          background: `linear-gradient(180deg, 
            hsl(45 60% 90% / 0) 0%,
            hsl(45 60% 90% / 0.15) 50%,
            hsl(45 60% 90% / 0.3) 100%
          )`,
          filter: 'blur(20px)',
        }}
      />
    </div>
  );
}

// Mountain silhouettes
function MountainsLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? THEME_COLORS.night : THEME_COLORS.day;
  const parallaxX = reducedMotion ? 0 : offset.x * PARALLAX_FACTORS.mountains;
  const parallaxY = reducedMotion ? 0 : offset.y * PARALLAX_FACTORS.mountains;
  
  return (
    <div 
      className="absolute inset-0 transition-colors duration-500"
      style={{
        zIndex: LAYER_POSITIONS.mountains.zIndex,
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
        <defs>
          <linearGradient id="mountain-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.mountains} />
            <stop offset="100%" stopColor={colors.mountainsShadow} />
          </linearGradient>
        </defs>
        {/* Distant mountain range */}
        <path
          d="M -5 100 L -5 70 Q 10 55 20 65 L 30 50 Q 40 40 50 52 L 60 45 Q 70 38 80 48 L 90 55 Q 100 60 105 55 L 105 100 Z"
          fill="url(#mountain-grad)"
          opacity={isNight ? 0.9 : 0.7}
        />
        {/* Second layer */}
        <path
          d="M -5 100 L -5 75 Q 15 62 25 70 L 40 58 Q 55 50 65 60 L 85 65 Q 95 68 105 62 L 105 100 Z"
          fill={colors.mountainsShadow}
          opacity={isNight ? 0.95 : 0.8}
        />
      </svg>
    </div>
  );
}

// Mist/haze layer
function MistLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? THEME_COLORS.night : THEME_COLORS.day;
  const parallaxX = reducedMotion ? 0 : offset.x * PARALLAX_FACTORS.mist;
  const parallaxY = reducedMotion ? 0 : offset.y * PARALLAX_FACTORS.mist;
  
  return (
    <div 
      className="absolute inset-0 transition-opacity duration-500"
      style={{
        zIndex: LAYER_POSITIONS.mist.zIndex,
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
      }}
    >
      <div 
        className="absolute w-full h-1/3 bottom-1/3"
        style={{
          background: `linear-gradient(180deg, 
            transparent 0%,
            ${colors.mist}40 30%,
            ${colors.mist}60 50%,
            ${colors.mist}40 70%,
            transparent 100%
          )`,
          filter: 'blur(20px)',
        }}
      />
    </div>
  );
}

// Lake with reflection
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
          <linearGradient id="lake-grad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={colors.lakeReflection} />
            <stop offset="50%" stopColor={colors.lake} />
            <stop offset="100%" stopColor={colors.lake} />
          </linearGradient>
        </defs>
        {/* Lake body */}
        <ellipse
          cx="50"
          cy="78"
          rx="55"
          ry="12"
          fill="url(#lake-grad)"
          opacity={0.9}
        />
        {/* Subtle shore line */}
        <ellipse
          cx="50"
          cy="76"
          rx="52"
          ry="10"
          fill="none"
          stroke={colors.lakeReflection}
          strokeWidth="0.3"
          opacity={0.5}
        />
      </svg>
    </div>
  );
}

// Mid-ground trees
function MidTreesLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? THEME_COLORS.night : THEME_COLORS.day;
  const parallaxX = reducedMotion ? 0 : offset.x * PARALLAX_FACTORS.midTrees;
  const parallaxY = reducedMotion ? 0 : offset.y * PARALLAX_FACTORS.midTrees;
  
  const treePaths = useMemo(() => generateForestRow(12, [25, 40], [6, 12]), []);
  
  return (
    <div 
      className="absolute inset-0 transition-colors duration-500"
      style={{
        zIndex: LAYER_POSITIONS.midTrees.zIndex,
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
        {treePaths.map((path, i) => (
          <path
            key={i}
            d={path}
            fill={colors.treeMid}
            opacity={0.85 + (i % 3) * 0.05}
          />
        ))}
      </svg>
    </div>
  );
}

// Bonfire (night only)
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
      {/* Bonfire glow */}
      <div 
        className="absolute left-[35%] bottom-[22%] w-24 h-16"
        style={{
          background: `radial-gradient(ellipse at 50% 100%,
            ${THEME_COLORS.night.bonfireGlow}80 0%,
            ${THEME_COLORS.night.bonfireGlow}40 30%,
            hsl(35 80% 50% / 0.15) 60%,
            transparent 100%
          )`,
          filter: 'blur(8px)',
        }}
      />
      {/* Fire core */}
      <motion.div 
        className="absolute left-[35%] bottom-[22%] w-6 h-8"
        style={{
          marginLeft: '36px',
          background: `radial-gradient(ellipse at 50% 80%,
            hsl(45 95% 70%) 0%,
            hsl(30 90% 55%) 40%,
            hsl(15 85% 45%) 70%,
            transparent 100%
          )`,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
        }}
        animate={reducedMotion ? {} : {
          scaleY: [1, 1.1, 0.95, 1.05, 1],
          scaleX: [1, 0.95, 1.05, 0.98, 1],
        }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      {/* Embers */}
      {!reducedMotion && (
        <div className="absolute left-[35%] bottom-[25%] w-16 h-20 ml-6">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full"
              style={{
                left: `${30 + Math.sin(i * 2) * 30}%`,
                backgroundColor: 'hsl(35 90% 60%)',
              }}
              initial={{ bottom: 0, opacity: 0.8 }}
              animate={{
                bottom: ['0%', '100%'],
                opacity: [0.8, 0],
                x: [0, Math.sin(i * 3) * 15],
              }}
              transition={{
                duration: 2 + i * 0.3,
                repeat: Infinity,
                delay: i * 0.4,
                ease: 'easeOut',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Foreground trees (darkest silhouettes)
function ForegroundTreesLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? THEME_COLORS.night : THEME_COLORS.day;
  const parallaxX = reducedMotion ? 0 : offset.x * PARALLAX_FACTORS.foreground;
  const parallaxY = reducedMotion ? 0 : offset.y * PARALLAX_FACTORS.foreground;
  
  const leftTrees = useMemo(() => generateForestRow(4, [45, 65], [10, 16]).map(p => p.replace(/(\d+)/g, (m) => String(parseFloat(m) * 0.4))), []);
  const rightTrees = useMemo(() => generateForestRow(4, [45, 65], [10, 16]).map(p => p.replace(/(\d+)/g, (m) => String(parseFloat(m) * 0.4 + 60))), []);
  
  return (
    <div 
      className="absolute inset-0 transition-colors duration-500"
      style={{
        zIndex: LAYER_POSITIONS.foreground.zIndex,
        transform: `translate(${parallaxX}px, ${parallaxY}px)`,
      }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="xMidYMax slice">
        {/* Left cluster */}
        <path
          d="M -5 100 L -5 55 Q 0 45 5 55 L 8 40 Q 12 30 16 42 L 20 50 Q 25 55 30 52 L 30 100 Z"
          fill={colors.treeFore}
        />
        {/* Right cluster */}
        <path
          d="M 70 100 L 70 52 Q 75 55 80 50 L 84 42 Q 88 30 92 40 L 95 55 Q 100 45 105 55 L 105 100 Z"
          fill={colors.treeFore}
        />
      </svg>
    </div>
  );
}

// Vignette and grain overlay
function VignetteLayer({ isNight }: { isNight: boolean }) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: LAYER_POSITIONS.vignette.zIndex }}
    >
      {/* Vignette */}
      <div 
        className="absolute inset-0 transition-opacity duration-500"
        style={{
          background: `radial-gradient(ellipse at 50% 50%,
            transparent 30%,
            ${isNight ? 'hsl(220 30% 5% / 0.4)' : 'hsl(45 20% 10% / 0.15)'} 100%
          )`,
        }}
      />
      {/* Subtle grain texture */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
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
        x: (e.clientX - centerX) / centerX * 30,
        y: (e.clientY - centerY) / centerY * 20,
      };
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);
  
  // Scroll-based parallax for mobile
  useEffect(() => {
    if (reducedMotion) return;
    
    const handleScroll = () => {
      setScrollOffset(window.scrollY * 0.1);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion]);
  
  // RAF-based smooth interpolation
  useEffect(() => {
    if (reducedMotion) return;
    
    const animate = () => {
      const ease = 0.05;
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
          <MountainsLayer {...layerProps} />
          <MistLayer {...layerProps} />
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
