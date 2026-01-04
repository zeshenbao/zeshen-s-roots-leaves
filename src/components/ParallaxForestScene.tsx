/**
 * 2D Parallax Forest + Lake Scene (Clean, Recruiter-Professional)
 * 
 * Built from inline SVG with ROUNDED tree silhouettes (no spikes).
 * Grounded bonfire with firepit stones + logs + proper flame.
 * Shaded moon with terminator + craters.
 * Soft distant treeline silhouette.
 */

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import { useThemeStore, usePortfolioStore } from '@/lib/store';

// ============ EXACT COLOR PALETTE ============
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
    shore: '#C7D9CF',
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
    stars: '#E8F1FF',
    shore: '#071B22',
    bonfireCore: '#FFB15C',
    bonfireGlow: '#FFCF8A',
    bonfireInner: '#FFE4A8',
    stone: '#2B2F33',
    logDark: '#4A2F1F',
    logLight: '#5B3A24',
  },
};

// ============ PARALLAX FACTORS ============
const PARALLAX = {
  sky: { x: 0.02, y: 0.02 },
  sunMoon: { x: 0.03, y: 0.03 },
  hills: { x: 0.04, y: 0.03 },
  treeline: { x: 0.05, y: 0.04 },
  lake: { x: 0.06, y: 0.05 },
  shore: { x: 0.07, y: 0.055 },
  midTrees: { x: 0.08, y: 0.06 },
  bonfire: { x: 0.10, y: 0.06 },
  foreground: { x: 0.12, y: 0.08 },
};

const CLAMP = { x: 18, y: 10 };
const VIEWBOX = "0 0 1000 600";

// ============ STAR GENERATION (small dots, low opacity) ============
function generateStars(count: number): { x: number; y: number; r: number; opacity: number }[] {
  const seed = 42;
  const random = (i: number) => {
    const x = Math.sin(seed + i * 9973) * 10000;
    return x - Math.floor(x);
  };
  return Array.from({ length: count }, (_, i) => ({
    x: random(i) * 1000,
    y: random(i + 100) * 220, // Only y < 220
    r: random(i + 200) * 0.8 + 0.8, // r=0.8..1.6
    opacity: random(i + 300) * 0.3 + 0.15, // 0.15..0.45
  }));
}

// ============ REUSABLE TREE COMPONENTS ============

// Rounded Pine: trunk + 4 stacked ellipse canopy blobs
interface TreeProps {
  x: number;
  y: number;
  scale?: number;
  color: string;
}

function RoundedPine({ x, y, scale = 1, color }: TreeProps) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Trunk */}
      <rect x="-11" y="-30" width="22" height="140" rx="10" fill={color} />
      {/* Canopy blobs - stacked ellipses decreasing upward */}
      <ellipse cx="0" cy="-40" rx="45" ry="30" fill={color} />
      <ellipse cx="0" cy="-70" rx="38" ry="28" fill={color} />
      <ellipse cx="0" cy="-95" rx="30" ry="24" fill={color} />
      <ellipse cx="0" cy="-115" rx="20" ry="18" fill={color} />
    </g>
  );
}

// Broadleaf Tree: thicker trunk + wider canopy blob
function BroadleafTree({ x, y, scale = 1, color }: TreeProps) {
  return (
    <g transform={`translate(${x}, ${y}) scale(${scale})`}>
      {/* Trunk - thicker */}
      <rect x="-14" y="-25" width="28" height="120" rx="12" fill={color} />
      {/* Canopy - overlapping ellipses forming a blob */}
      <ellipse cx="0" cy="-50" rx="70" ry="50" fill={color} />
      <ellipse cx="-25" cy="-35" rx="45" ry="38" fill={color} />
      <ellipse cx="25" cy="-35" rx="45" ry="38" fill={color} />
      <ellipse cx="0" cy="-85" rx="45" ry="35" fill={color} />
    </g>
  );
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
    <svg className="absolute inset-0 w-full h-full" viewBox={VIEWBOX} preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.skyTop} />
          <stop offset="60%" stopColor={colors.skyHorizon} />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="1000" height="600" fill={`url(#${gradientId})`} />
    </svg>
  );
}

// ============ LAYER B: MOON + STARS (night only) ============
function MoonAndStarsLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.sunMoon.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.sunMoon.y;
  const stars = useMemo(() => generateStars(28), []);

  if (!isNight) {
    // Day: subtle sun disk
    return (
      <svg className="absolute inset-0 w-full h-full" viewBox={VIEWBOX} preserveAspectRatio="xMidYMid slice"
        style={{ transform: `translate(${tx}px, ${ty}px)` }}>
        <defs>
          <radialGradient id="sun-glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={COLORS.day.sun} stopOpacity="0.12" />
            <stop offset="100%" stopColor={COLORS.day.sun} stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="820" cy="110" r="55" fill="url(#sun-glow)" />
        <circle cx="820" cy="110" r="30" fill={COLORS.day.sun} opacity="0.08" />
      </svg>
    );
  }

  // Night: moon with terminator + craters + stars
  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VIEWBOX} preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}>
      <defs>
        {/* Moon surface gradient - slightly offset center for shading */}
        <radialGradient id="moon-surface" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="50%" stopColor="#F0F6FF" />
          <stop offset="100%" stopColor={COLORS.night.moon} />
        </radialGradient>
        {/* Moon halo */}
        <radialGradient id="moon-halo" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={COLORS.night.moon} stopOpacity="0.10" />
          <stop offset="100%" stopColor={COLORS.night.moon} stopOpacity="0" />
        </radialGradient>
      </defs>
      
      {/* Stars - small varied dots */}
      {stars.map((star, i) => (
        reducedMotion ? (
          <circle key={i} cx={star.x} cy={star.y} r={star.r} fill={COLORS.night.stars} opacity={star.opacity} />
        ) : (
          <motion.circle key={i} cx={star.x} cy={star.y} r={star.r} fill={COLORS.night.stars}
            initial={{ opacity: star.opacity * 0.7 }}
            animate={{ opacity: [star.opacity * 0.7, star.opacity, star.opacity * 0.7] }}
            transition={{ duration: 2.5 + (i % 3), repeat: Infinity, ease: 'easeInOut' }}
          />
        )
      ))}
      
      {/* Moon halo */}
      <circle cx="820" cy="120" r="65" fill="url(#moon-halo)" />
      
      {/* Moon base disc */}
      <circle cx="820" cy="120" r="32" fill="url(#moon-surface)" />
      
      {/* Terminator shadow overlay - offset +6px in x */}
      <circle cx="826" cy="120" r="32" fill="#0A1520" opacity="0.12" />
      
      {/* Subtle craters - very faint */}
      <circle cx="812" cy="112" r="5" fill="#C0D0E0" opacity="0.07" />
      <circle cx="828" cy="126" r="4" fill="#C0D0E0" opacity="0.06" />
      <circle cx="815" cy="130" r="3" fill="#C0D0E0" opacity="0.08" />
      <circle cx="832" cy="110" r="2.5" fill="#C0D0E0" opacity="0.06" />
    </svg>
  );
}

// ============ LAYER C: DISTANT HILLS ============
function DistantHillsLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? COLORS.night : COLORS.day;
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.hills.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.hills.y;

  // Low profile gentle curves
  const hillPath = "M0,295 C150,260 260,310 380,280 C520,245 620,315 760,285 C860,255 930,300 1000,275 L1000,600 L0,600 Z";

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VIEWBOX} preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}>
      <path d={hillPath} fill={colors.hills} />
    </svg>
  );
}

// ============ LAYER D: DISTANT TREELINE (soft wavy silhouette) ============
function DistantTreelineLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? COLORS.night : COLORS.day;
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.treeline.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.treeline.y;

  // Soft wavy silhouette path (no spiky teeth)
  const treelinePath = "M0,300 C120,280 220,310 340,295 C470,270 560,320 700,292 C820,275 910,310 1000,290 L1000,340 L0,340 Z";

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VIEWBOX} preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}>
      <path d={treelinePath} fill={colors.treeline} />
      {/* Small rounded tree bumps on top */}
      <ellipse cx="80" cy="285" rx="18" ry="14" fill={colors.treeline} />
      <ellipse cx="150" cy="290" rx="22" ry="16" fill={colors.treeline} />
      <ellipse cx="220" cy="295" rx="20" ry="14" fill={colors.treeline} />
      <ellipse cx="380" cy="285" rx="18" ry="12" fill={colors.treeline} />
      <ellipse cx="560" cy="295" rx="24" ry="16" fill={colors.treeline} />
      <ellipse cx="700" cy="282" rx="20" ry="14" fill={colors.treeline} />
      <ellipse cx="820" cy="280" rx="22" ry="15" fill={colors.treeline} />
      <ellipse cx="920" cy="290" rx="18" ry="13" fill={colors.treeline} />
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
    <svg className="absolute inset-0 w-full h-full" viewBox={VIEWBOX} preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}>
      <defs>
        <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={colors.lakeTop} />
          <stop offset="100%" stopColor={colors.lakeBottom} />
        </linearGradient>
        {!isNight && (
          <linearGradient id="lake-reflection-day" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </linearGradient>
        )}
        {isNight && (
          <linearGradient id="moon-reflection" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={COLORS.night.moon} stopOpacity="0.18" />
            <stop offset="50%" stopColor={COLORS.night.moon} stopOpacity="0.08" />
            <stop offset="100%" stopColor={COLORS.night.moon} stopOpacity="0" />
          </linearGradient>
        )}
      </defs>
      {/* Lake body: y=[310..520] */}
      <rect x="0" y="310" width="1000" height="210" fill={`url(#${gradientId})`} />
      {/* Shoreline highlight */}
      <line x1="30" y1="312" x2="970" y2="312" stroke={colors.lakeTop} strokeWidth="1" opacity="0.35" />
      {/* Day reflection band */}
      {!isNight && <rect x="0" y="310" width="1000" height="35" fill="url(#lake-reflection-day)" />}
      {/* Night moon reflection streak */}
      {isNight && <rect x="765" y="310" width="110" height="210" fill="url(#moon-reflection)" />}
    </svg>
  );
}

// ============ LAYER F: SHORE/GROUND PLANE ============
function ShoreLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? COLORS.night : COLORS.day;
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.shore.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.shore.y;

  // Ground plane path y=430..600
  const shorePath = "M0,430 C200,410 380,450 520,430 C700,400 860,460 1000,440 L1000,600 L0,600 Z";

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VIEWBOX} preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}>
      <path d={shorePath} fill={colors.shore} />
      {/* Thin shoreline highlight */}
      <path d="M0,430 C200,410 380,450 520,430 C700,400 860,460 1000,440" 
        fill="none" stroke={isNight ? '#1A4050' : '#E8F4EE'} strokeWidth="2" opacity={isNight ? 0.08 : 0.10} />
    </svg>
  );
}

// ============ LAYER G: MID TREES (rounded silhouettes) ============
function MidTreesLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? COLORS.night : COLORS.day;
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.midTrees.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.midTrees.y;

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VIEWBOX} preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}>
      {/* Left cluster: x=[60..320] */}
      <RoundedPine x={90} y={480} scale={0.9} color={colors.midTrees} />
      <BroadleafTree x={170} y={490} scale={0.85} color={colors.midTrees} />
      <RoundedPine x={240} y={475} scale={0.95} color={colors.midTrees} />
      <BroadleafTree x={310} y={495} scale={0.8} color={colors.midTrees} />
      
      {/* Right cluster: x=[680..940] */}
      <BroadleafTree x={700} y={485} scale={0.85} color={colors.midTrees} />
      <RoundedPine x={780} y={480} scale={0.9} color={colors.midTrees} />
      <RoundedPine x={860} y={470} scale={1.0} color={colors.midTrees} />
      <BroadleafTree x={940} y={490} scale={0.8} color={colors.midTrees} />
    </svg>
  );
}

// ============ LAYER H: BONFIRE (night only, grounded) ============
function BonfireLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.bonfire.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.bonfire.y;

  if (!isNight) return null;

  // Firepit stones positions (ring radius ~32)
  const stones = [
    { x: 0, y: 28, r: 10 },
    { x: 22, y: 20, r: 9 },
    { x: 30, y: 0, r: 11 },
    { x: 22, y: -18, r: 8 },
    { x: 0, y: -26, r: 10 },
    { x: -22, y: -18, r: 9 },
    { x: -30, y: 0, r: 11 },
    { x: -22, y: 20, r: 8 },
  ];

  // Embers
  const embers = useMemo(() => [
    { id: 0, xOffset: -5, delay: 0 },
    { id: 1, xOffset: 0, delay: 0.4 },
    { id: 2, xOffset: 5, delay: 0.8 },
    { id: 3, xOffset: -3, delay: 1.2 },
  ], []);

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VIEWBOX} preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}>
      <defs>
        {/* Localized glow - r=110, opacity ≤0.16 */}
        <radialGradient id="bonfire-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={COLORS.night.bonfireGlow} stopOpacity="0.16" />
          <stop offset="50%" stopColor={COLORS.night.bonfireGlow} stopOpacity="0.06" />
          <stop offset="100%" stopColor={COLORS.night.bonfireGlow} stopOpacity="0" />
        </radialGradient>
        {/* Flame gradients */}
        <linearGradient id="flame-outer" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#CC4400" />
          <stop offset="50%" stopColor={COLORS.night.bonfireCore} />
          <stop offset="100%" stopColor="#FFCC66" />
        </linearGradient>
        <linearGradient id="flame-inner" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor={COLORS.night.bonfireCore} />
          <stop offset="60%" stopColor={COLORS.night.bonfireInner} />
          <stop offset="100%" stopColor="#FFFEF0" />
        </linearGradient>
      </defs>
      
      <g transform="translate(720, 455)">
        {/* Local glow */}
        <circle cx="0" cy="-10" r="110" fill="url(#bonfire-glow)" />
        
        {/* Firepit stones */}
        {stones.map((stone, i) => (
          <circle key={i} cx={stone.x} cy={stone.y} r={stone.r} fill={COLORS.night.stone} />
        ))}
        
        {/* Log 1 - rotated */}
        <g transform="rotate(-15)">
          <rect x="-45" y="-8" width="90" height="16" rx="8" fill={COLORS.night.logLight} />
          <rect x="-42" y="-7" width="84" height="3" rx="1.5" fill="#7A5A3A" opacity="0.12" />
        </g>
        
        {/* Log 2 - rotated opposite */}
        <g transform="rotate(20)">
          <rect x="-41" y="-7" width="82" height="14" rx="7" fill={COLORS.night.logDark} />
          <rect x="-38" y="-6" width="76" height="2.5" rx="1.2" fill="#6A4A3A" opacity="0.12" />
        </g>
        
        {/* Outer flame - proper flame shape */}
        <path d="M0,-50 C-20,-30 -18,-5 0,8 C18,-5 20,-30 0,-50 Z" fill="url(#flame-outer)" />
        
        {/* Inner flame */}
        <path d="M0,-38 C-12,-24 -10,-6 0,4 C10,-6 12,-24 0,-38 Z" fill="url(#flame-inner)" />
        
        {/* Flame core highlight */}
        <ellipse cx="0" cy="-15" rx="5" ry="12" fill="#FFF8E0" opacity="0.7" />
        
        {/* Embers - only if not reduced motion */}
        {!reducedMotion && embers.map((ember) => (
          <motion.circle
            key={ember.id}
            cx={ember.xOffset}
            r={1.5 + ember.id * 0.2}
            fill={COLORS.night.bonfireCore}
            initial={{ cy: -20, opacity: 0.9 }}
            animate={{ cy: [-20, -35, -55], opacity: [0.9, 0.5, 0] }}
            transition={{
              duration: 1.8,
              delay: ember.delay,
              repeat: Infinity,
              ease: 'easeOut',
            }}
          />
        ))}
      </g>
    </svg>
  );
}

// ============ LAYER I: FOREGROUND FRAMING TREES (rounded) ============
function ForegroundFrameTreesLayer({ offset, isNight, reducedMotion }: LayerProps) {
  const colors = isNight ? COLORS.night : COLORS.day;
  const tx = reducedMotion ? 0 : offset.x * PARALLAX.foreground.x;
  const ty = reducedMotion ? 0 : offset.y * PARALLAX.foreground.y;

  return (
    <svg className="absolute inset-0 w-full h-full" viewBox={VIEWBOX} preserveAspectRatio="xMidYMid slice"
      style={{ transform: `translate(${tx}px, ${ty}px)` }}>
      {/* Left edge: x=[0..220] */}
      <RoundedPine x={40} y={550} scale={1.3} color={colors.foreground} />
      <BroadleafTree x={130} y={560} scale={1.2} color={colors.foreground} />
      <RoundedPine x={200} y={540} scale={1.4} color={colors.foreground} />
      
      {/* Right edge: x=[780..1000] */}
      <RoundedPine x={820} y={545} scale={1.35} color={colors.foreground} />
      <BroadleafTree x={900} y={555} scale={1.25} color={colors.foreground} />
      <RoundedPine x={970} y={550} scale={1.3} color={colors.foreground} />
    </svg>
  );
}

// ============ ULTRA SUBTLE VIGNETTE ============
function UltraSubtleVignette({ isNight }: { isNight: boolean }) {
  // Day: OFF (opacity 0), Night: opacity ≤0.07
  const opacity = isNight ? 0.06 : 0;

  if (opacity === 0) return null;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background: `radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,${opacity}) 100%)`,
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

  // Mouse parallax
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

  // Scroll parallax
  useEffect(() => {
    if (reducedMotion) return;

    const handleScroll = () => {
      const scrollY = Math.min(window.scrollY * 0.015, 4);
      targetRef.current.y = Math.max(-CLAMP.y, Math.min(CLAMP.y, scrollY));
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [reducedMotion]);

  // Smooth animation loop
  useEffect(() => {
    if (reducedMotion) {
      setOffset({ x: 0, y: 0 });
      return;
    }

    const animate = () => {
      const lerp = 0.08;
      currentRef.current.x += (targetRef.current.x - currentRef.current.x) * lerp;
      currentRef.current.y += (targetRef.current.y - currentRef.current.y) * lerp;
      setOffset({ x: currentRef.current.x, y: currentRef.current.y });
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [reducedMotion]);

  const layerProps: LayerProps = { offset, isNight, reducedMotion };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isNight ? 'night' : 'day'}
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Layer A: Sky */}
        <SkyLayer {...layerProps} />
        
        {/* Layer B: Moon + Stars / Sun */}
        <MoonAndStarsLayer {...layerProps} />
        
        {/* Layer C: Distant Hills */}
        <DistantHillsLayer {...layerProps} />
        
        {/* Layer D: Distant Treeline */}
        <DistantTreelineLayer {...layerProps} />
        
        {/* Layer E: Lake */}
        <LakeLayer {...layerProps} />
        
        {/* Layer F: Shore/Ground Plane */}
        <ShoreLayer {...layerProps} />
        
        {/* Layer G: Mid Trees */}
        <MidTreesLayer {...layerProps} />
        
        {/* Layer H: Bonfire (night only) */}
        <BonfireLayer {...layerProps} />
        
        {/* Layer I: Foreground Framing Trees */}
        <ForegroundFrameTreesLayer {...layerProps} />
        
        {/* Layer J: Ultra Subtle Vignette */}
        <UltraSubtleVignette isNight={isNight} />
      </motion.div>
    </AnimatePresence>
  );
}
