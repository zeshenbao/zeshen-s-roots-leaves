/**
 * Parallax Forest Scene using OG images as backgrounds
 * Switches between light and dark versions based on theme
 */

import { useThemeStore } from '@/lib/store';

export function ParallaxForestScene() {
  const { resolvedTheme } = useThemeStore();
  const isNight = resolvedTheme === 'night';

  return (
    <div 
      className="fixed inset-0 w-full h-full -z-10 transition-opacity duration-700"
      aria-hidden="true"
    >
      {/* Light mode background */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{
          backgroundImage: 'url(/og/og-light.png)',
          opacity: isNight ? 0 : 1,
        }}
      />
      
      {/* Dark mode background */}
      <div
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat transition-opacity duration-700"
        style={{
          backgroundImage: 'url(/og/og-dark.png)',
          opacity: isNight ? 1 : 0,
        }}
      />
    </div>
  );
}

export default ParallaxForestScene;
