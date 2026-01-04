import { useMemo } from 'react';

// ============ PATH GENERATORS ============

/**
 * Generate an organic root path with natural curves
 */
export function generateRootPath(
  startX: number, 
  startY: number, 
  endX: number, 
  endY: number,
  seed: number = 0
): string {
  const dx = endX - startX;
  const dy = endY - startY;
  
  // Create organic undulation with multiple control points
  const segments = 3;
  let path = `M${startX},${startY}`;
  
  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const prevT = (i - 1) / segments;
    
    const x1 = startX + dx * (prevT + 0.15);
    const y1 = startY + dy * (prevT + 0.1);
    const wobble1 = Math.sin(seed * 3 + i) * 15;
    
    const x2 = startX + dx * (prevT + 0.35);
    const y2 = startY + dy * (prevT + 0.3);
    const wobble2 = Math.cos(seed * 2 + i) * 12;
    
    const x = startX + dx * t;
    const y = startY + dy * t;
    
    path += ` C${x1 + wobble1},${y1} ${x2 + wobble2},${y2} ${x},${y}`;
  }
  
  return path;
}

/**
 * Generate trunk spline path with natural taper effect
 */
export function generateTrunkPath(
  baseX: number,
  baseY: number,
  topX: number,
  topY: number,
  baseWidth: number,
  topWidth: number
): { leftPath: string; rightPath: string; fillPath: string } {
  const height = baseY - topY;
  
  // Slight curve to trunk
  const curve1 = baseX - 8;
  const curve2 = topX + 5;
  
  const leftPath = `M${baseX - baseWidth / 2},${baseY} 
    Q${curve1 - baseWidth / 3},${baseY - height * 0.5} ${topX - topWidth / 2},${topY}`;
  
  const rightPath = `M${baseX + baseWidth / 2},${baseY} 
    Q${curve2 + baseWidth / 3},${baseY - height * 0.5} ${topX + topWidth / 2},${topY}`;
  
  // Closed fill path
  const fillPath = `M${baseX - baseWidth / 2},${baseY} 
    Q${curve1 - baseWidth / 3},${baseY - height * 0.5} ${topX - topWidth / 2},${topY}
    L${topX + topWidth / 2},${topY}
    Q${curve2 + baseWidth / 3},${baseY - height * 0.5} ${baseX + baseWidth / 2},${baseY}
    Z`;
  
  return { leftPath, rightPath, fillPath };
}

/**
 * Generate curved branch path with organic feel
 */
export function generateBranchPath(
  startX: number,
  startY: number,
  endX: number,
  endY: number,
  curve: number = 0.3
): string {
  const dx = endX - startX;
  const dy = endY - startY;
  const midX = startX + dx * 0.5;
  const midY = startY + dy * 0.5;
  
  // Control point offset for natural curve
  const cpX = midX + dy * curve;
  const cpY = midY - Math.abs(dx) * curve * 0.3;
  
  return `M${startX},${startY} Q${cpX},${cpY} ${endX},${endY}`;
}

/**
 * Generate twig path (thinner, connecting branch to leaf)
 */
export function generateTwigPath(
  branchX: number,
  branchY: number,
  leafX: number,
  leafY: number,
  seed: number = 0
): string {
  const wobble = Math.sin(seed * 2) * 10;
  const midX = (branchX + leafX) / 2 + wobble;
  const midY = (branchY + leafY) / 2;
  
  return `M${branchX},${branchY} Q${midX},${midY} ${leafX},${leafY}`;
}

// ============ LEAF SVG SHAPE ============

interface LeafShapeProps {
  x: number;
  y: number;
  width?: number;
  height?: number;
  rotation?: number;
  fill: string;
  stroke?: string;
  strokeWidth?: number;
  isSelected?: boolean;
  isFruit?: boolean;
  filter?: string;
}

export function LeafShape({ 
  x, 
  y, 
  width = 24, 
  height = 36, 
  rotation = 0,
  fill, 
  stroke, 
  strokeWidth = 1,
  isSelected,
  isFruit,
  filter
}: LeafShapeProps) {
  // Leaf-shaped path (pointed at both ends, wider in middle)
  const leafPath = useMemo(() => {
    const w = width;
    const h = height;
    return `
      M 0 ${-h / 2}
      C ${w * 0.6} ${-h * 0.3}, ${w * 0.6} ${h * 0.3}, 0 ${h / 2}
      C ${-w * 0.6} ${h * 0.3}, ${-w * 0.6} ${-h * 0.3}, 0 ${-h / 2}
      Z
    `;
  }, [width, height]);

  // Leaf vein/stem
  const veinPath = useMemo(() => {
    const h = height;
    return `M 0 ${-h / 2 + 4} L 0 ${h / 2 - 4}`;
  }, [height]);

  return (
    <g transform={`translate(${x}, ${y}) rotate(${rotation})`} filter={filter}>
      {/* Main leaf shape */}
      <path
        d={leafPath}
        fill={fill}
        stroke={stroke || (isSelected ? 'hsl(var(--secondary))' : 'hsl(var(--border))')}
        strokeWidth={isSelected ? 2 : strokeWidth}
      />
      {/* Center vein */}
      <path
        d={veinPath}
        fill="none"
        stroke="hsl(var(--border) / 0.4)"
        strokeWidth={1}
      />
      {/* Fruit indicator (small berry) - uses secondary token */}
      {isFruit && (
        <circle
          cx={width * 0.4}
          cy={-height * 0.2}
          r={5}
          fill="hsl(var(--secondary))"
          stroke="hsl(var(--secondary-foreground) / 0.5)"
          strokeWidth={1}
        />
      )}
    </g>
  );
}

// ============ TYPE ICONS ============

export function ProjectIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M2 4a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V4zm2 0v8h8V4H4z"/>
      <path d="M6 6h4v1H6V6zm0 2h4v1H6V8z"/>
    </svg>
  );
}

export function ExperienceIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M6 2a2 2 0 00-2 2v1H3a2 2 0 00-2 2v5a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H6zm0 2h4v1H6V4z"/>
    </svg>
  );
}

export function PublicationIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 2a2 2 0 00-2 2v8a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2H3zm0 2h10v8H3V4z"/>
      <path d="M4 5h8v1H4V5zm0 2h8v1H4V7zm0 2h5v1H4V9z"/>
    </svg>
  );
}

// ============ NOISE TEXTURE FOR SOIL ============
// Note: SoilPattern uses procedural noise - not currently used, keeping for reference
// If used, colors should come from CSS vars passed as props

export function SoilPattern({ id }: { id: string }) {
  return (
    <pattern id={id} patternUnits="userSpaceOnUse" width="100" height="100">
      <rect width="100" height="100" fill="hsl(var(--muted))" />
      {/* Noise dots using muted tones */}
      {Array.from({ length: 50 }).map((_, i) => (
        <circle
          key={i}
          cx={Math.random() * 100}
          cy={Math.random() * 100}
          r={Math.random() * 2 + 0.5}
          fill="hsl(var(--muted-foreground))"
          opacity={0.1 + Math.random() * 0.2}
        />
      ))}
    </pattern>
  );
}

// ============ GLOW ANIMATION FILTER ============

// GlowFilter receives color as prop from parent (which uses CSS vars)
export function GlowFilter({ id, color = 'hsl(var(--primary))' }: { id: string; color?: string }) {
  return (
    <filter id={id} x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
      <feFlood floodColor={color} floodOpacity="0.6" result="color" />
      <feComposite in="color" in2="blur" operator="in" result="coloredBlur" />
      <feMerge>
        <feMergeNode in="coloredBlur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  );
}

// ============ ANIMATION HELPERS ============

export const treeAnimationVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { delay, duration: 0.8, ease: 'easeInOut' },
      opacity: { delay, duration: 0.3 }
    }
  })
};

export const leafBloomVariants = {
  hidden: { scale: 0, opacity: 0 },
  visible: (delay: number = 0) => ({
    scale: 1,
    opacity: 1,
    transition: {
      delay,
      duration: 0.4,
      type: 'spring',
      stiffness: 200,
      damping: 15
    }
  })
};

export const glowPassVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: [0, 1, 0],
    transition: {
      duration: 2,
      times: [0, 0.3, 1],
      ease: 'easeInOut'
    }
  }
};
