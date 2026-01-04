/**
 * 2D Parallax Forest + Lake Scene (Extra-Clean, Recruiter-Professional)
 * 
 * Built entirely from inline SVG shapes/gradients - no external images.
 * Depth through value contrast and composition - NO fog/mist/haze.
 * 
 * LAYER STACK (back → front):
 *   A. SkyLayer - quiet gradient window
 *   B. SunOrMoonLayer - subtle sun (day) or moon with halo (night)
 *   C. DistantHillsLayer - low-profile gentle curves
 *   D. DistantTreelineLayer - simple pine silhouette
 *   E. LakeLayer - clean band with reflection
 *   F. MidTreesLayer - edge clusters only
 *   G. NightBonfireLayer - night only, localized glow
 *   H. ForegroundFrameTreesLayer - darkest, edge-only framing
 *   + UltraSubtleVignette - separate overlay (day: OFF or ≤0.03, night: ≤0.07)
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useThemeStore, usePortfolioStore } from '@/lib/store';

// ============ EXACT COLOR PALETTE ============
// Minimal palette, crisp light mode - per spec

const COLORS = {
  day: {
    skyTop: '#F6FAFF',
    skyHorizon: '#FFF2E6',
    hills: '#D7E4DA',
    treeline: '#C2D4C7',
    midTrees: '#8FA59B',
    foreground: '#5E6F66',
    lakeTop: '#DCEFE8',
    lakeBottom: '#C6DED6',
    sun: '#FFFBE8',
  },
  night: {
    skyTop: '#081A2A',
    skyHorizon: '#0C2330',
    hills: '#12313A',
    treeline: '#153844',
    midTrees: '#0F2B33',
    foreground: '#0B1F26',
    lakeTop: '#0B2630',
    lakeBottom: '#061A22',
    moon: '#E8F1FF',
    moonHalo: '#E8F1FF',
    bonfireCore: '#FFB15C',
    bonfireGlow: '#FFCF8A',
    stars: '#E8F1FF',
  },
};

// ============ PARALLAX FACTORS (per spec) ============
const PARALLAX = {
  sky: { x: 0.02, y: 0.02 },
  sunMoon: { x: 0.03, y: 0.03 },
  hills: { x: 0.04, y: 0.03 },
  treeline: { x: 0.05, y: 0.04 },
  lake: { x: 0.06, y: 0.05 },
  midTrees: { x: 0.08, y: 0.06 },
  bonfire: { x: 0.10, y: 0.06 },
  foreground: { x: 0.12, y: 0.08 },
};

// Clamp values: x ∈ [-18..18], y ∈ [-10..10]
const CLAMP = { x: 18, y: 10 };

// ============ SVG VIEWBOX ============
const VIEWBOX = "0 0 1000 600";

// ============ STAR GENERATION ============
function generateStars(count: number): { x: number; y: number; r: number; opacity: number }[] {
  const seed = 42; // Deterministic
  const random = (i: number) => {
    const x = Math.sin(seed + i * 9973) * 10000;
    return x - Math.floor(x);
  };
  return Array.from({ length: count }, (_, i) => ({
    x: random(i) * 1000,
    y: random(i + 100) * 280, // Upper portion only
    r: random(i + 200) * 1.5 + 0.5,
    opacity: random(i + 300) * 0.4 + 0.2,
  }));
}

// ============ LAYER PROPS ============
interface LayerProps {
  offset: { x: number; y: number };
  isNight: boolean;
  reducedMotion: boolean;
}

// ============ LAYER A: SKY ============
function SkyLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? COLORS.night : COLORS.day;
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.sky.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.sky.y;
  const gradientId = isNight ? 'sky-gradient-night' : 'sky-gradient-day';

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.skyTop} />
          <stop offset="50%" stopColor={isNight ? colors.skyHorizon : colors.skyHorizon} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="600" fill={`url(#${gradientId})`} />
    </svg>
  );
}

// ============ LAYER B: SUN OR MOON ============
function SunOrMoonLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.sunMoon.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.sunMoon.y;

  if (isNight) {
    // Moon at x=820, y=120, r=34 with halo opacity ≤0.12
    return (
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox={VIEWBOX}
        preserveAspectRatio="xMidYMid slice"
        style={{ transform: `translate(${tx}px, ${ty}px)` }}
      >
        <defs>
          <radialGradient id="moon-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.night.moonHalo} stopOpacity="0.12" />
            <stop offset="100%" stopColor={COLORS.night.moonHalo} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="moon-surface" cx="35%" cy="35%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor={COLORS.night.moon} />
          </radialGradient>
        </defs>
        {/* Moon halo */}
        <circle cx="820" cy="120" r="70" fill="url(#moon-glow)" />
        {/* Moon disk */}
        <circle cx="820" cy="120" r="34" fill="url(#moon-surface)" />
      </svg>
    );
  }

  // Day: subtle sun disk at x=820, y=110, r=38, opacity 0.10
  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}
    >
      <defs>
        <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={COLORS.day.sun} stopOpacity="0.10" />
          <stop offset="100%" stopColor={COLORS.day.sun} stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="820" cy="110" r="60" fill="url(#sun-glow)" />
      <circle cx="820" cy="110" r="38" fill={COLORS.day.sun} opacity="0.10" />
    </svg>
  );
}

// ============ LAYER C: DISTANT HILLS ============
function DistantHillsLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? COLORS.night : COLORS.day;
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.hills.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.hills.y;

  // Low profile gentle curves: M0,290 C... as per spec
  const hillPath = "M0,290 C150,250 260,310 380,280 C520,240 620,320 760,285 C860,255 930,300 1000,275 L1000,600 L0,600 Z";

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}
    >
      <path d={hillPath} fill={colors.hills} />
    </svg>
  );
}

// ============ LAYER D: DISTANT TREELINE ============
function DistantTreelineLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? COLORS.night : COLORS.day;
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.treeline.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.treeline.y;

  // Simple repeating "tooth" pine silhouette along y≈285, height 30-45px
  // Lower/subtler in center to maintain quiet window
  const treelinePath = `
    M0,310 
    L0,290 L25,270 L50,290 L75,262 L100,290 L125,268 L150,290 
    L175,272 L200,290 L225,278 L250,290 
    L300,288 L350,292 L400,290 L450,292 L500,290 L550,292 L600,290 L650,292 L700,290 
    L750,288 L775,278 L800,290 L825,272 L850,290 L875,268 L900,290 
    L925,262 L950,290 L975,270 L1000,290 L1000,310 Z
  `;

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}
    >
      <path d={treelinePath} fill={colors.treeline} />
    </svg>
  );
}

// ============ LAYER E: LAKE ============
function LakeLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? COLORS.night : COLORS.day;
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.lake.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.lake.y;
  const gradientId = isNight ? 'lake-gradient-night' : 'lake-gradient-day';

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.lakeTop} />
          <stop offset="100%" stopColor={colors.lakeBottom} />
        </linearGradient>
        {/* Day reflection band */}
        {!isNight && (
          <linearGradient id="lake-reflection-day" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        )}
        {/* Night moon reflection */}
        {isNight && (
          <linearGradient id="moon-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS.night.moon} stopOpacity="0.20" />
            <stop offset="50%" stopColor={COLORS.night.moon} stopOpacity="0.10" />
            <stop offset="100%" stopColor={COLORS.night.moon} stopOpacity="0" />
          </linearGradient>
        )}
      </defs>
      {/* Lake body: y=[310..520] */}
      <rect x="0" y="310" width="1000" height="210" fill={`url(#${gradientId})`} />
      {/* Shoreline highlight at y≈315 */}
      <line x1="50" y1="315" x2="950" y2="315" stroke={colors.lakeTop} strokeWidth="1.5" opacity="0.4" />
      {/* Day reflection band y=[310..350] */}
      {!isNight && (
        <rect x="0" y="310" width="1000" height="40" fill="url(#lake-reflection-day)" />
      )}
      {/* Night moon reflection streak centered at x≈820, width ~110 */}
      {isNight && (
        <rect x="765" y="310" width="110" height="210" fill="url(#moon-reflection)" />
      )}
    </svg>
  );
}

// ============ LAYER F: MID TREES ============
function MidTreesLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? COLORS.night : COLORS.day;
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.midTrees.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.midTrees.y;

  // Left cluster: x=[80..320], height 120-160px - strictly edge
  const leftCluster = `
    M0,520 L0,380 L30,360 L60,380 L90,340 L120,380 
    L150,320 L180,380 L210,350 L240,380 L270,330 L300,380 
    L320,360 L320,520 Z
  `;
  
  // Right cluster: x=[680..920] - strictly edge
  const rightCluster = `
    M680,520 L680,380 L710,360 L740,330 L770,380 
    L800,340 L830,380 L860,320 L890,380 L920,350 L950,380 
    L980,340 L1000,380 L1000,520 Z
  `;

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}
    >
      <path d={leftCluster} fill={colors.midTrees} />
      <path d={rightCluster} fill={colors.midTrees} />
    </svg>
  );
}

// ============ LAYER G: NIGHT BONFIRE ============
function NightBonfireLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.bonfire.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.bonfire.y;

  // Only show at night
  if (!isNight) return null;

  // Bonfire at x=720, y=440
  // Fire core ~24px high, glow r=90 opacity ≤0.18
  // Embers: 4-6 tiny circles (only if not reduced motion)
  const embers = useMemo(() => [
    { id: 0, x: 715, delay: 0 },
    { id: 1, x: 720, delay: 0.3 },
    { id: 2, x: 725, delay: 0.6 },
    { id: 3, x: 718, delay: 0.9 },
    { id: 4, x: 723, delay: 1.2 },
    { id: 5, x: 728, delay: 1.5 },
  ], []);

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}
    >
      <defs>
        <radialGradient id="bonfire-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={COLORS.night.bonfireGlow} stopOpacity="0.18" />
          <stop offset="60%" stopColor={COLORS.night.bonfireGlow} stopOpacity="0.08" />
          <stop offset="100%" stopColor={COLORS.night.bonfireGlow} stopOpacity="0" />
        </radialGradient>
        <radialGradient id="fire-core" cx="50%" cy="80%" r="50%">
          <stop offset="0%" stopColor="#FFF4E0" />
          <stop offset="40%" stopColor={COLORS.night.bonfireCore} />
          <stop offset="100%" stopColor="#CC6600" />
        </radialGradient>
      </defs>
      {/* Local glow - r=90, localized */}
      <circle cx="720" cy="440" r="90" fill="url(#bonfire-glow)" />
      {/* Fire core - small flame shape */}
      <ellipse cx="720" cy="432" rx="10" ry="16" fill="url(#fire-core)" />
      {/* Embers - only if not reduced motion */}
      {!reducedMotion && embers.map((ember) => (
        <motion.circle
          key={ember.id}
          cx={ember.x}
          r="2"
          fill={COLORS.night.bonfireCore}
          initial={{ cy: 430, opacity: 0.8 }}
          animate={{ cy: [430, 400, 370], opacity: [0.8, 0.4, 0] }}
          transition={{
            duration: 2,
            delay: ember.delay,
            repeat: Infinity,
            ease: 'easeOut',
          }}
        />
      ))}
    </svg>
  );
}

// ============ LAYER H: FOREGROUND FRAME TREES ============
function ForegroundFrameTreesLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? COLORS.night : COLORS.day;
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.foreground.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.foreground.y;

  // Left foreground: x=[0..220], y=[120..600] - strictly edge, center OPEN
  const leftTrees = `
    M0,600 L0,160 
    L20,140 L40,180 L60,100 L80,180 L100,120 L120,180 
    L140,90 L160,180 L180,130 L200,180 L220,150 L220,600 Z
  `;

  // Right foreground: x=[780..1000], y=[120..600] - strictly edge
  const rightTrees = `
    M780,600 L780,150 
    L800,180 L820,130 L840,180 L860,90 L880,180 L900,120 
    L920,180 L940,100 L960,180 L980,140 L1000,160 L1000,600 Z
  `;

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}
    >
      <path d={leftTrees} fill={colors.foreground} />
      <path d={rightTrees} fill={colors.foreground} />
    </svg>
  );
}

// ============ STARS (NIGHT ONLY) ============
function StarsLayer({ isNight, reducedMotion }: { isNight: boolean; reducedMotion: boolean }) {
  const stars = useMemo(() => generateStars(30), []);

  if (!isNight) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full"
      viewBox={VIEWBOX}
      preserveAspectRatio="xMidYMid slice"
    >
      {stars.map((star, i) => (
        reducedMotion ? (
          <circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill={COLORS.night.stars}
            opacity={star.opacity}
          />
        ) : (
          <motion.circle
            key={i}
            cx={star.x}
            cy={star.y}
            r={star.r}
            fill={COLORS.night.stars}
            initial={{ opacity: star.opacity * 0.6 }}
            animate={{ opacity: [star.opacity * 0.6, star.opacity, star.opacity * 0.6] }}
            transition={{ duration: 3 + (i % 3), repeat: Infinity, ease: 'easeInOut' }}
          />
        )
      ))}
    </svg>
  );
}

// ============ ULTRA SUBTLE VIGNETTE (separate overlay) ============
function UltraSubtleVignette({ isNight }: { isNight: boolean }) {
  // Day: OFF or opacity ≤0.03
  // Night: opacity ≤0.07
  const opacity = isNight ? 0.07 : 0.03;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse 100% 100% at 50% 50%,
          transparent 50%,
          rgba(0,0,0,${opacity}) 100%
        )`,
      }}
    />
  );
}

// ============ MAIN COMPONENT ============
export function ParallaxForestScene() {
  const { resolvedTheme } = useThemeStore();
  const { featureFlags } = usePortfolioStore();
  const prefersReducedMotion = useReducedMotion();
  const reducedMotion = prefersReducedMotion || featureFlags.reducedMotion;

  const isNight = resolvedTheme === 'night';
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const currentRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>();

  // Mouse parallax (clamped)
  useEffect(() => {
    if (reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const rawX = ((e.clientX - centerX) / centerX) * CLAMP.x;
      const rawY = ((e.clientY - centerY) / centerY) * CLAMP.y;
      targetRef.current = {
        x: Math.max(-CLAMP.x, Math.min(CLAMP.x, rawX)),
        y: Math.max(-CLAMP.y, Math.min(CLAMP.y, rawY)),
      };
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  // Scroll parallax (small addition)
  useEffect(() => {
    if (reducedMotion) return;

    const handleScroll = () => {
      const scrollY = Math.min(window.scrollY * 0.02, 5);
      targetRef.current.y = Math.max(-CLAMP.y, Math.min(CLAMP.y, targetRef.current.y + scrollY));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion]);

  // RAF-based smooth interpolation
  useEffect(() => {
    if (reducedMotion) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const animate = () => {
      const ease = 0.04;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * ease;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * ease;
      setOffset({ x: currentRef.current.x, y: currentRef.current.y });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  const layerProps: LayerProps = { offset, isNight, reducedMotion: !!reducedMotion };

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
          transition={{ duration: 0.5 }}
        >
          {/* Layer A: Sky */}
          <SkyLayer {...layerProps} />
          {/* Stars (night only, behind moon) */}
          <StarsLayer isNight={isNight} reducedMotion={!!reducedMotion} />
          {/* Layer B: Sun or Moon */}
          <SunOrMoonLayer {...layerProps} />
          {/* Layer C: Distant Hills */}
          <DistantHillsLayer {...layerProps} />
          {/* Layer D: Distant Treeline */}
          <DistantTreelineLayer {...layerProps} />
          {/* Layer E: Lake */}
          <LakeLayer {...layerProps} />
          {/* Layer F: Mid Trees */}
          <MidTreesLayer {...layerProps} />
          {/* Layer G: Night Bonfire */}
          <NightBonfireLayer {...layerProps} />
          {/* Layer H: Foreground Frame Trees */}
          <ForegroundFrameTreesLayer {...layerProps} />
          {/* Ultra Subtle Vignette */}
          <UltraSubtleVignette isNight={isNight} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
