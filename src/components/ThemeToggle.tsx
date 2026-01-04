import { Sun, Moon, Monitor } from 'lucide-react';
import { useThemeStore, ThemeMode } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { useEffect } from 'react';

export function ThemeToggle() {
  const { themeMode, resolvedTheme, cycleTheme, setThemeMode } = useThemeStore();

  // Listen to system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (themeMode === 'system') {
        setThemeMode('system'); // Re-evaluate system theme
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themeMode, setThemeMode]);

  // Initialize theme on mount
  useEffect(() => {
    setThemeMode(themeMode);
  }, []);

  const getIcon = () => {
    if (themeMode === 'system') {
      return <Monitor className="w-4 h-4" />;
    }
    return resolvedTheme === 'day' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />;
  };

  const getAriaLabel = (): string => {
    const labels: Record<ThemeMode, string> = {
      system: 'Currently using system theme. Click to switch to day mode.',
      day: 'Currently using day mode. Click to switch to night mode.',
      night: 'Currently using night mode. Click to switch to system theme.',
    };
    return labels[themeMode];
  };

  const getTooltip = (): string => {
    const tooltips: Record<ThemeMode, string> = {
      system: 'System',
      day: 'Day',
      night: 'Night',
    };
    return tooltips[themeMode];
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycleTheme}
      aria-label={getAriaLabel()}
      title={getTooltip()}
      className="relative w-9 h-9 transition-all duration-200 hover:bg-primary/10 group"
    >
      <span className="sr-only">{getAriaLabel()}</span>
      <div className="transition-all duration-300 ease-out group-hover:scale-110 group-hover:rotate-12 group-active:scale-95">
        {getIcon()}
      </div>
      {themeMode === 'system' && (
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[8px] text-muted-foreground font-medium opacity-70 group-hover:opacity-100 transition-opacity">
          auto
        </span>
      )}
    </Button>
  );
}
