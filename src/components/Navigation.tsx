import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Command, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { person } from '@/lib/content';
import { usePortfolioStore } from '@/lib/store';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useActiveSection } from '@/hooks/useActiveSection';

const navItems = [
  { label: 'Home', href: '#home', id: 'home' },
  { label: 'About', href: '#about', id: 'about' },
  { label: 'Skills', href: '#ecosystem', id: 'ecosystem' },
  { label: 'Projects', href: '#projects', id: 'projects' },
  { label: 'Experience', href: '#experience', id: 'experience' },
  { label: 'Academics', href: '#academics', id: 'academics' },
  { label: 'CV', href: '#cv', id: 'cv' },
  { label: 'Contact', href: '#contact', id: 'contact' },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { setCommandPaletteOpen } = usePortfolioStore();
  const activeSection = useActiveSection();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-background/80 backdrop-blur-xl border-b border-border/50' : ''
      }`}
      role="banner"
    >
      <nav className="container max-w-6xl mx-auto px-6 py-4 flex items-center justify-between" role="navigation">
        <a href="#home" className="font-display text-xl font-medium text-foreground hover:text-primary transition-colors duration-200">
          {person.name.split(' ')[0]}
        </a>
        
        {/* Desktop navigation */}
        <div className="hidden md:flex items-center gap-6">
          <ul className="flex items-center gap-6" role="list">
            {navItems.map(item => (
              <li key={item.href}>
                <a
                  href={item.href}
                  className={`text-sm transition-colors link-underline ${
                    activeSection === item.id 
                      ? 'text-primary font-medium' 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  aria-current={activeSection === item.id ? 'page' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          
          {/* Search button */}
          <button
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-200 text-sm hover:scale-[1.02] active:scale-[0.98]"
            aria-label="Search (Cmd+K)"
          >
            <Search className="w-4 h-4" />
            <span className="hidden lg:inline">Search</span>
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-background/50 rounded text-xs border border-border/30">
              <Command className="w-3 h-3" />K
            </kbd>
          </button>
          
          {/* Theme toggle */}
          <ThemeToggle />
        </div>
        
        {/* Mobile: Theme toggle + menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </nav>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border"
          >
            <ul className="container px-6 py-4 space-y-2">
              {navItems.map(item => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className={`block py-3 px-2 rounded-lg text-lg transition-colors ${
                      activeSection === item.id 
                        ? 'text-primary font-medium bg-primary/10' 
                        : 'text-foreground hover:bg-muted'
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                    aria-current={activeSection === item.id ? 'page' : undefined}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
