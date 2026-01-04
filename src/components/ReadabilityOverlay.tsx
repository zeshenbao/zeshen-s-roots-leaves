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
      {/* Top edge darkening for nav readability */}
      <div 
        className="absolute top-0 left-0 right-0 h-32"
        style={{
          background: isNight 
            ? `linear-gradient(180deg, 
                hsl(220 25% 6% / 0.7) 0%,
                hsl(220 25% 6% / 0.3) 50%,
                transparent 100%
              )`
            : `linear-gradient(180deg, 
                hsl(45 30% 97% / 0.6) 0%,
                hsl(45 30% 97% / 0.2) 50%,
                transparent 100%
              )`,
        }}
      />
      
      {/* Main content area overlay - very subtle */}
      <div 
        className="absolute inset-0"
        style={{
          background: isNight 
            ? `radial-gradient(ellipse at 50% 30%,
                hsl(220 20% 8% / 0.3) 0%,
                hsl(220 20% 8% / 0.5) 50%,
                hsl(220 20% 8% / 0.6) 100%
              )`
            : `radial-gradient(ellipse at 50% 30%,
                hsl(45 20% 98% / 0.2) 0%,
                hsl(45 20% 98% / 0.4) 50%,
                hsl(45 20% 98% / 0.5) 100%
              )`,
        }}
      />
      
      {/* Bottom edge for footer readability */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-48"
        style={{
          background: isNight 
            ? `linear-gradient(0deg, 
                hsl(220 25% 6% / 0.85) 0%,
                hsl(220 25% 6% / 0.4) 60%,
                transparent 100%
              )`
            : `linear-gradient(0deg, 
                hsl(45 30% 97% / 0.8) 0%,
                hsl(45 30% 97% / 0.3) 60%,
                transparent 100%
              )`,
        }}
      />
      
      {/* Side vignettes for framing */}
      <div 
        className="absolute inset-y-0 left-0 w-32"
        style={{
          background: isNight 
            ? `linear-gradient(90deg, hsl(220 25% 6% / 0.3) 0%, transparent 100%)`
            : `linear-gradient(90deg, hsl(45 30% 97% / 0.2) 0%, transparent 100%)`,
        }}
      />
      <div 
        className="absolute inset-y-0 right-0 w-32"
        style={{
          background: isNight 
            ? `linear-gradient(270deg, hsl(220 25% 6% / 0.3) 0%, transparent 100%)`
            : `linear-gradient(270deg, hsl(45 30% 97% / 0.2) 0%, transparent 100%)`,
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
            ? `radial-gradient(ellipse at 50% 50%,
                hsl(220 25% 8% / 0.7) 0%,
                hsl(220 25% 8% / 0.5) 50%,
                hsl(220 25% 8% / 0.3) 80%,
                transparent 100%
              )`
            : `radial-gradient(ellipse at 50% 50%,
                hsl(45 30% 98% / 0.75) 0%,
                hsl(45 30% 98% / 0.5) 50%,
                hsl(45 30% 98% / 0.25) 80%,
                transparent 100%
              )`,
          backdropFilter: 'blur(2px)',
        };
      case 'glass':
        return {
          background: isNight 
            ? 'hsl(220 25% 10% / 0.6)'
            : 'hsl(45 30% 98% / 0.7)',
          backdropFilter: 'blur(12px)',
          border: isNight 
            ? '1px solid hsl(220 20% 20% / 0.3)'
            : '1px solid hsl(45 20% 90% / 0.5)',
          borderRadius: '1rem',
        };
      case 'content':
      default:
        return {
          background: isNight 
            ? `linear-gradient(180deg,
                hsl(220 25% 8% / 0.4) 0%,
                hsl(220 25% 8% / 0.6) 50%,
                hsl(220 25% 8% / 0.4) 100%
              )`
            : `linear-gradient(180deg,
                hsl(45 30% 98% / 0.3) 0%,
                hsl(45 30% 98% / 0.5) 50%,
                hsl(45 30% 98% / 0.3) 100%
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
