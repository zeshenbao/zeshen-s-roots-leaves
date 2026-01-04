import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { person } from '@/lib/content';

const navItems = [
  { label: 'Home', href: '#home' },
  { label: 'Ecosystem', href: '#ecosystem' },
  { label: 'Projects', href: '#projects' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        <a href="#home" className="font-display text-xl font-medium text-foreground">
          {person.name.split(' ')[0]}
        </a>
        
        {/* Desktop navigation */}
        <ul className="hidden md:flex items-center gap-8" role="list">
          {navItems.map(item => (
            <li key={item.href}>
              <a
                href={item.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors link-underline"
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        
        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>
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
            <ul className="container px-6 py-4 space-y-4">
              {navItems.map(item => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="block text-foreground py-2"
                    onClick={() => setMobileMenuOpen(false)}
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
