import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, GraduationCap, BookOpen, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { courses, courseThemeNames, getCourseStats, type CourseTheme, type Course } from '@/lib/content';

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

export function AcademicsSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<CourseTheme | 'all'>('all');
  
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
  
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = searchQuery === '' || 
        course.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTheme = selectedTheme === 'all' || course.theme === selectedTheme;
      return matchesSearch && matchesTheme;
    });
  }, [searchQuery, selectedTheme]);
  
  const filteredCredits = useMemo(() => {
    return filteredCourses.reduce((sum, c) => sum + c.credits, 0);
  }, [filteredCourses]);

  return (
    <section id="academics" className="section-container-alt" aria-labelledby="academics-heading">
      <div className="section-inner">
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

        {/* Theme Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {themes.map(({ theme, credits, name }) => (
            <button
              key={theme}
              onClick={() => setSelectedTheme(selectedTheme === theme ? 'all' : theme)}
              className={`p-4 rounded-xl border transition-all text-left ${
                selectedTheme === theme
                  ? 'bg-primary/20 border-primary/50 ring-2 ring-primary/30'
                  : 'bg-card/50 border-border/50 hover:bg-card/80 hover:border-border'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{themeIcons[theme]}</span>
                <span className="text-sm font-medium text-foreground">{name}</span>
              </div>
              <div className="text-2xl font-bold text-foreground">{credits} hp</div>
            </button>
          ))}
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row gap-4 mb-6"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-card/50 border-border/50"
            />
          </div>
          {selectedTheme !== 'all' && (
            <button
              onClick={() => setSelectedTheme('all')}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted/50 hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Filter className="w-4 h-4" />
              Clear filter
            </button>
          )}
        </motion.div>

        {/* Results summary */}
        <div className="text-sm text-muted-foreground mb-4">
          Showing {filteredCourses.length} courses ({filteredCredits} hp)
          {selectedTheme !== 'all' && (
            <span> in <span className="text-foreground">{courseThemeNames[selectedTheme]}</span></span>
          )}
        </div>

        {/* Course List */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="space-y-2"
        >
          {filteredCourses.map((course, index) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.02 }}
            >
              <Card variant="glass" className="hover:bg-card/60 transition-colors">
                <CardContent className="p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <BookOpen className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <h3 className="font-medium text-foreground truncate">{course.nameEn}</h3>
                      <p className="text-sm text-muted-foreground truncate">{course.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <Badge 
                      variant="outline" 
                      className={`${themeColors[course.theme]} border`}
                    >
                      {courseThemeNames[course.theme]}
                    </Badge>
                    <span className="text-sm font-semibold text-foreground w-12 text-right">
                      {course.credits} hp
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {filteredCourses.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No courses found matching your search.
          </div>
        )}
      </div>
    </section>
  );
}
