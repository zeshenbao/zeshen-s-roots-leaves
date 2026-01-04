import { useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Search, GraduationCap, BookOpen, Filter, ChevronRight, ArrowDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { courses, courseThemeNames, getCourseStats, type CourseTheme, type Course } from '@/lib/content';
import { CourseDrawer } from '@/components/CourseDrawer';

const themeIcons: Record<CourseTheme, string> = {
  'mathematics': '∫',
  'physics': '⚛',
  'ml-ai': '🧠',
  'computing': '💻',
  'control': '⚙',
  'engineering': '🔧',
  'research': '🔬',
  'other': '📚',
};

// Semantic token-based styling - minimal palette
// All themes use primary/secondary tokens for consistency
// Differentiated by icons, not rainbow colors
const themeColors: Record<CourseTheme, string> = {
  'mathematics': 'bg-primary/10 text-primary border-primary/20',
  'physics': 'bg-primary/10 text-primary border-primary/20',
  'ml-ai': 'bg-primary/15 text-primary border-primary/25',
  'computing': 'bg-primary/10 text-primary border-primary/20',
  'control': 'bg-muted text-muted-foreground border-border',
  'engineering': 'bg-muted text-muted-foreground border-border',
  'research': 'bg-primary/15 text-primary border-primary/25',
  'other': 'bg-muted text-muted-foreground border-border',
};

const PREVIEW_COUNT = 6;

export function AcademicsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<CourseTheme | 'all'>('all');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const stats = useMemo(() => getCourseStats(), []);
  
  const themes = useMemo(() => {
    return Object.entries(stats.byTheme)
      .sort((a, b) => b[1] - a[1])
      .map(([theme, credits]) => ({
        theme: theme as CourseTheme,
        credits,
        name: courseThemeNames[theme as CourseTheme],
      }));
  }, [stats.byTheme]);
  
  // Filtered courses for preview
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = searchQuery === '' || 
        course.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTheme = selectedTheme === 'all' || course.theme === selectedTheme;
      return matchesSearch && matchesTheme;
    });
  }, [searchQuery, selectedTheme]);
  
  // Only show preview (first N courses)
  const previewCourses = useMemo(() => {
    return filteredCourses.slice(0, PREVIEW_COUNT);
  }, [filteredCourses]);
  
  const filteredCredits = useMemo(() => {
    return filteredCourses.reduce((sum, c) => sum + c.credits, 0);
  }, [filteredCourses]);

  const hasMoreCourses = filteredCourses.length > PREVIEW_COUNT;

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  return (
    <>
      <section id="academics" className="section-container-alt" aria-labelledby="academics-heading">
        <div className="section-inner">
          {/* Skip link for accessibility */}
          <a 
            href="#cv" 
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors mb-4 group"
          >
            <ArrowDown className="w-3 h-3 group-hover:translate-y-0.5 transition-transform" aria-hidden="true" />
            Skip to CV section
          </a>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="section-header-centered"
          >
            <h2 id="academics-heading" className="section-title">
              Academic Foundation
            </h2>
            <p className="section-subtitle mx-auto text-center max-w-2xl">
              Coursework spanning mathematics, physics, machine learning, and engineering — 
              building a rigorous foundation for research and innovation.
            </p>
            <div className="flex items-center justify-center gap-2 mt-4">
              <GraduationCap className="w-5 h-5 text-primary" aria-hidden="true" />
              <span className="text-xl font-semibold text-foreground">{stats.totalCredits} hp</span>
              <span className="text-muted-foreground">total credits</span>
            </div>
          </motion.div>

          {/* Theme Cards - Compact grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6"
          >
            {themes.map(({ theme, credits, name }) => (
              <button
                key={theme}
                onClick={() => setSelectedTheme(selectedTheme === theme ? 'all' : theme)}
                className={`p-3 rounded-xl border transition-all text-left ${
                  selectedTheme === theme
                    ? 'bg-primary/20 border-primary/50 ring-2 ring-primary/30'
                    : 'bg-card/50 border-border/50 hover:bg-card/80 hover:border-border'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{themeIcons[theme]}</span>
                  <span className="text-xs font-medium text-foreground truncate">{name}</span>
                </div>
                <div className="text-xl font-bold text-foreground">{credits} hp</div>
              </button>
            ))}
          </motion.div>

          {/* Search and Filter */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-3 mb-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-card/50 border-border/50"
                aria-label="Search courses"
              />
            </div>
            {selectedTheme !== 'all' && (
              <button
                onClick={() => setSelectedTheme('all')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Filter className="w-4 h-4" aria-hidden="true" />
                Clear filter
              </button>
            )}
          </motion.div>

          {/* Results summary */}
          <div className="text-sm text-muted-foreground mb-4">
            Showing {Math.min(previewCourses.length, filteredCourses.length)} of {filteredCourses.length} courses ({filteredCredits} hp)
            {selectedTheme !== 'all' && (
              <span> in <span className="text-foreground">{courseThemeNames[selectedTheme]}</span></span>
            )}
          </div>

          {/* Course Preview List - Only shows first N courses */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            {previewCourses.map((course) => (
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
                      className={`${themeColors[course.theme]} border text-xs hidden sm:inline-flex`}
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
          </motion.div>

          {filteredCourses.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No courses found matching your search.
            </div>
          )}

          {/* Browse All CTA */}
          {hasMoreCourses && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center"
            >
              <Button
                variant="hero"
                size="lg"
                onClick={openDrawer}
                className="gap-2"
                aria-haspopup="dialog"
              >
                Browse all courses ({filteredCourses.length})
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Opens a searchable drawer with A-Z navigation
              </p>
            </motion.div>
          )}

          {/* Show all button even when not filtered, if there are courses */}
          {!hasMoreCourses && filteredCourses.length > 0 && courses.length > PREVIEW_COUNT && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-6 text-center"
            >
              <Button
                variant="heroOutline"
                size="lg"
                onClick={openDrawer}
                className="gap-2"
                aria-haspopup="dialog"
              >
                Browse all courses ({courses.length})
                <ChevronRight className="w-4 h-4" aria-hidden="true" />
              </Button>
            </motion.div>
          )}
        </div>
      </section>

      {/* Course Drawer */}
      <CourseDrawer
        isOpen={isDrawerOpen}
        onClose={closeDrawer}
        initialTheme={selectedTheme}
        initialSearch={searchQuery}
      />
    </>
  );
}
