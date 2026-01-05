/**
 * Minimal Readability Overlay
 * Only top gradient for nav - no heavy vignettes or side overlays
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
      {/* Top edge only - nav readability */}
      <div 
        className="absolute top-0 left-0 right-0 h-20"
        style={{
          background: isNight 
            ? `linear-gradient(180deg, 
                hsl(220 20% 8% / 0.7) 0%,
                hsl(220 20% 8% / 0.3) 60%,
                transparent 100%
              )`
            : `linear-gradient(180deg, 
                hsl(45 30% 95% / 0.7) 0%,
                hsl(45 30% 95% / 0.3) 60%,
                transparent 100%
              )`,
        }}
      />
    </div>
  );
}

/**
 * Section Scrim - simplified glass variant only
 */
interface SectionScrimProps {
  className?: string;
  children?: React.ReactNode;
}

export function SectionScrim({ className = '', children }: SectionScrimProps) {
  const { resolvedTheme } = useThemeStore();
  const isNight = resolvedTheme === 'night';
  
  return (
    <div 
      className={`relative transition-all duration-300 rounded-2xl ${className}`}
      style={{
        background: isNight 
          ? 'hsl(220 20% 10% / 0.85)'
          : 'hsl(45 25% 96% / 0.88)',
        backdropFilter: 'blur(16px)',
        border: isNight 
          ? '1px solid hsl(220 15% 20% / 0.5)'
          : '1px solid hsl(40 20% 85% / 0.6)',
      }}
    >
      {children}
    </div>
  );
}
