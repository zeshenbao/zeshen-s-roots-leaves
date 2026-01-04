import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, Search, Filter, BookOpen, ChevronUp } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { courses, courseThemeNames, type CourseTheme, type Course } from '@/lib/content';

interface CourseDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTheme?: CourseTheme | 'all';
  initialSearch?: string;
}

const themeColors: Record<CourseTheme, string> = {
  'mathematics': 'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'physics': 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  'ml-ai': 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'computing': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
  'control': 'bg-orange-500/20 text-orange-300 border-orange-500/30',
  'engineering': 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'research': 'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'other': 'bg-slate-500/20 text-slate-300 border-slate-500/30',
};

const themeFilters: { key: CourseTheme | 'all'; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'mathematics', label: 'Math' },
  { key: 'physics', label: 'Physics' },
  { key: 'ml-ai', label: 'ML/AI' },
  { key: 'computing', label: 'Computing' },
  { key: 'control', label: 'Control' },
  { key: 'engineering', label: 'Engineering' },
  { key: 'research', label: 'Research' },
];

// Get unique first letters for jump-to navigation
function getAlphabetIndex(coursesList: Course[]): string[] {
  const letters = new Set<string>();
  coursesList.forEach(course => {
    const firstLetter = course.nameEn.charAt(0).toUpperCase();
    if (/[A-Z]/.test(firstLetter)) {
      letters.add(firstLetter);
    }
  });
  return Array.from(letters).sort();
}

export function CourseDrawer({ isOpen, onClose, initialTheme = 'all', initialSearch = '' }: CourseDrawerProps) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedTheme, setSelectedTheme] = useState<CourseTheme | 'all'>(initialTheme);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  const drawerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const prefersReducedMotion = useReducedMotion();

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = searchQuery === '' || 
        course.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTheme = selectedTheme === 'all' || course.theme === selectedTheme;
      return matchesSearch && matchesTheme;
    }).sort((a, b) => a.nameEn.localeCompare(b.nameEn));
  }, [searchQuery, selectedTheme]);

  const filteredCredits = useMemo(() => {
    return filteredCourses.reduce((sum, c) => sum + c.credits, 0);
  }, [filteredCourses]);

  // Alphabet index for jump navigation
  const alphabetIndex = useMemo(() => getAlphabetIndex(filteredCourses), [filteredCourses]);

  // Group courses by first letter
  const groupedCourses = useMemo(() => {
    const groups: Record<string, Course[]> = {};
    filteredCourses.forEach(course => {
      const letter = course.nameEn.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(course);
    });
    return groups;
  }, [filteredCourses]);

  // Handle scroll to show/hide scroll-top button
  const handleScroll = useCallback(() => {
    if (contentRef.current) {
      setShowScrollTop(contentRef.current.scrollTop > 300);
    }
  }, []);

  // Jump to letter
  const jumpToLetter = useCallback((letter: string) => {
    const element = document.getElementById(`course-group-${letter}`);
    if (element && contentRef.current) {
      element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    }
  }, [prefersReducedMotion]);

  // Scroll to top
  const scrollToTop = useCallback(() => {
    if (contentRef.current) {
      contentRef.current.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    }
  }, [prefersReducedMotion]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTheme('all');
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus search input when drawer opens
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Focus trap
  useEffect(() => {
    if (!isOpen || !drawerRef.current) return;

    const focusableElements = drawerRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleTab);
    return () => document.removeEventListener('keydown', handleTab);
  }, [isOpen]);

  // Sync initial values when drawer opens
  useEffect(() => {
    if (isOpen) {
      setSelectedTheme(initialTheme);
      setSearchQuery(initialSearch);
    }
  }, [isOpen, initialTheme, initialSearch]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
            className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer */}
          <motion.div
            ref={drawerRef}
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={prefersReducedMotion 
              ? { duration: 0 }
              : { type: 'spring', damping: 30, stiffness: 300 }
            }
            role="dialog"
            aria-modal="true"
            aria-label="Browse all courses"
            className="fixed right-0 top-0 z-50 h-full w-full sm:w-[480px] md:w-[560px] lg:w-[640px] bg-background border-l border-border shadow-dramatic flex flex-col"
          >
            {/* Sticky Header */}
            <div className="flex-shrink-0 border-b border-border bg-background/95 backdrop-blur-sm p-4 space-y-4">
              {/* Title row */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display font-semibold text-foreground">
                    All Courses
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {filteredCourses.length} courses • {filteredCredits} hp
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onClose}
                  aria-label="Close course browser"
                  className="hover:bg-muted"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  ref={searchInputRef}
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-card/50 border-border/50"
                  aria-label="Search courses"
                />
              </div>

              {/* Theme filters */}
              <div className="flex flex-wrap gap-2">
                {themeFilters.map(({ key, label }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedTheme(key)}
                    className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                      selectedTheme === key
                        ? 'bg-primary/20 border-primary/50 text-primary'
                        : 'bg-card/50 border-border/50 text-muted-foreground hover:bg-card hover:text-foreground'
                    }`}
                  >
                    {label}
                  </button>
                ))}
                {(searchQuery || selectedTheme !== 'all') && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-1.5 text-xs rounded-full border border-destructive/30 text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-1"
                  >
                    <Filter className="w-3 h-3" />
                    Clear
                  </button>
                )}
              </div>

              {/* Jump to letter (mobile dropdown) */}
              <div className="flex items-center gap-2 md:hidden">
                <span className="text-xs text-muted-foreground">Jump to:</span>
                <select
                  onChange={(e) => jumpToLetter(e.target.value)}
                  className="px-2 py-1 text-xs rounded bg-card border border-border text-foreground"
                  aria-label="Jump to letter"
                >
                  <option value="">Select...</option>
                  {alphabetIndex.map(letter => (
                    <option key={letter} value={letter}>{letter}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Content with scroll */}
            <div className="flex flex-1 overflow-hidden">
              {/* Course list */}
              <div 
                ref={contentRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin"
              >
                {Object.keys(groupedCourses).length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    No courses found matching your search.
                  </div>
                ) : (
                  Object.entries(groupedCourses).map(([letter, letterCourses]) => (
                    <div key={letter} id={`course-group-${letter}`} className="scroll-mt-4">
                      <h3 className="text-sm font-semibold text-primary mb-2 sticky top-0 bg-background/95 backdrop-blur-sm py-1 z-10">
                        {letter}
                      </h3>
                      <div className="space-y-2">
                        {letterCourses.map((course) => (
                          <Card key={course.id} variant="glass" className="hover:bg-card/60 transition-colors">
                            <CardContent className="p-3 flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />
                                <div className="min-w-0">
                                  <p className="font-medium text-foreground text-sm truncate">{course.nameEn}</p>
                                  <p className="text-xs text-muted-foreground truncate">{course.name}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <Badge 
                                  variant="outline" 
                                  className={`${themeColors[course.theme]} border text-xs`}
                                >
                                  {courseThemeNames[course.theme]}
                                </Badge>
                                <span className="text-xs font-semibold text-foreground w-10 text-right">
                                  {course.credits} hp
                                </span>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* A-Z rail (desktop only) */}
              <div className="hidden md:flex flex-col items-center py-4 px-2 border-l border-border/50 bg-card/30">
                <span className="text-[10px] text-muted-foreground mb-2">A-Z</span>
                <div className="flex flex-col gap-0.5">
                  {alphabetIndex.map(letter => (
                    <button
                      key={letter}
                      onClick={() => jumpToLetter(letter)}
                      className="w-6 h-6 text-xs text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-colors flex items-center justify-center"
                      aria-label={`Jump to ${letter}`}
                    >
                      {letter}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Scroll to top button */}
            <AnimatePresence>
              {showScrollTop && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={scrollToTop}
                  className="absolute bottom-4 right-4 md:right-14 p-2 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-glow transition-shadow"
                  aria-label="Scroll to top"
                >
                  <ChevronUp className="w-5 h-5" />
                </motion.button>
              )}
            </AnimatePresence>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
