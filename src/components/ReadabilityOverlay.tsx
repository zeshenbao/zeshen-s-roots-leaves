/**
 * Global Readability Overlay
 * Ensures text is always readable across all sections
 * Provides subtle gradient/vignette overlay that adapts to day/night
 */

import { useThemeStore } from '@/lib/store';

export function GlobalReadabilityOverlay() {
  const { resolvedTheme } = useThemeStore();
  const isNight = resolvedTheme === 'night';
  
  return (
    <div 
      className="fixed inset-0 pointer-events-none transition-all duration-500"
      style={{ zIndex: 5 }}
      aria-hidden="true"
    >
      {/* Top edge - nav readability */}
      <div 
        className="absolute top-0 left-0 right-0 h-28"
        style={{
          background: isNight 
            ? `linear-gradient(180deg, 
                hsl(220 18% 6% / 0.8) 0%,
                hsl(220 18% 6% / 0.4) 60%,
                transparent 100%
              )`
            : `linear-gradient(180deg, 
                hsl(40 25% 97% / 0.85) 0%,
                hsl(40 25% 97% / 0.4) 60%,
                transparent 100%
              )`,
        }}
      />
      
      {/* Main content overlay - very subtle vignette */}
      <div 
        className="absolute inset-0"
        style={{
          background: isNight 
            ? `radial-gradient(ellipse 120% 100% at 50% 30%,
                transparent 0%,
                hsl(220 18% 6% / 0.25) 50%,
                hsl(220 18% 6% / 0.45) 100%
              )`
            : `radial-gradient(ellipse 120% 100% at 50% 30%,
                transparent 0%,
                hsl(40 25% 97% / 0.2) 50%,
                hsl(40 25% 97% / 0.35) 100%
              )`,
        }}
      />
      
      {/* Bottom edge - footer readability */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-40"
        style={{
          background: isNight 
            ? `linear-gradient(0deg, 
                hsl(220 18% 6% / 0.9) 0%,
                hsl(220 18% 6% / 0.5) 50%,
                transparent 100%
              )`
            : `linear-gradient(0deg, 
                hsl(40 25% 97% / 0.9) 0%,
                hsl(40 25% 97% / 0.45) 50%,
                transparent 100%
              )`,
        }}
      />
      
      {/* Side vignettes - subtle framing */}
      <div 
        className="absolute inset-y-0 left-0 w-24"
        style={{
          background: isNight 
            ? `linear-gradient(90deg, hsl(220 18% 6% / 0.25) 0%, transparent 100%)`
            : `linear-gradient(90deg, hsl(40 25% 97% / 0.2) 0%, transparent 100%)`,
        }}
      />
      <div 
        className="absolute inset-y-0 right-0 w-24"
        style={{
          background: isNight 
            ? `linear-gradient(270deg, hsl(220 18% 6% / 0.25) 0%, transparent 100%)`
            : `linear-gradient(270deg, hsl(40 25% 97% / 0.2) 0%, transparent 100%)`,
        }}
      />
    </div>
  );
}

/**
 * Section Scrim Component
 * Reusable scrim for sections that need extra text contrast
 */
interface SectionScrimProps {
  variant?: 'hero' | 'content' | 'glass';
  className?: string;
  children?: React.ReactNode;
}

export function SectionScrim({ variant = 'content', className = '', children }: SectionScrimProps) {
  const { resolvedTheme } = useThemeStore();
  const isNight = resolvedTheme === 'night';
  
  const getScrimStyle = () => {
    switch (variant) {
      case 'hero':
        return {
          background: isNight 
            ? `radial-gradient(ellipse 100% 100% at 50% 50%,
                hsl(220 18% 6% / 0.65) 0%,
                hsl(220 18% 6% / 0.45) 50%,
                hsl(220 18% 6% / 0.2) 80%,
                transparent 100%
              )`
            : `radial-gradient(ellipse 100% 100% at 50% 50%,
                hsl(40 25% 97% / 0.8) 0%,
                hsl(40 25% 97% / 0.55) 50%,
                hsl(40 25% 97% / 0.25) 80%,
                transparent 100%
              )`,
          backdropFilter: 'blur(1px)',
        };
      case 'glass':
        return {
          background: isNight 
            ? 'hsl(220 16% 9% / 0.65)'
            : 'hsl(40 20% 95% / 0.75)',
          backdropFilter: 'blur(12px)',
          border: isNight 
            ? '1px solid hsl(220 14% 18% / 0.4)'
            : '1px solid hsl(220 12% 86% / 0.6)',
          borderRadius: 'var(--radius)',
        };
      case 'content':
      default:
        return {
          background: isNight 
            ? `linear-gradient(180deg,
                hsl(220 18% 6% / 0.35) 0%,
                hsl(220 18% 6% / 0.5) 50%,
                hsl(220 18% 6% / 0.35) 100%
              )`
            : `linear-gradient(180deg,
                hsl(40 25% 97% / 0.3) 0%,
                hsl(40 25% 97% / 0.5) 50%,
                hsl(40 25% 97% / 0.3) 100%
              )`,
        };
    }
  };
  
  return (
    <div 
      className={`relative transition-all duration-300 ${className}`}
      style={getScrimStyle()}
    >
      {children}
    </div>
  );
}
