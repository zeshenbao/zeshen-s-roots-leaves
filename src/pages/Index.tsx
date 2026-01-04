import { Suspense, lazy, useState, useEffect } from 'react';
import { CinematicBackground } from '@/components/CinematicBackground';
import { Navigation } from '@/components/Navigation';
import { BackToTop } from '@/components/BackToTop';
import { SkipLink } from '@/components/SkipLink';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { SkillEcosystemSection } from '@/components/sections/SkillEcosystemSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { AcademicsSection } from '@/components/sections/AcademicsSection';
import { CVSection } from '@/components/sections/CVSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { person } from '@/lib/content';

// Lazy load heavy components to reduce initial bundle
const CommandPalette = lazy(() => import('@/components/CommandPalette').then(m => ({ default: m.CommandPalette })));

// Lightweight loading placeholder (no skeleton - just empty)
function CommandPaletteLoader() {
  return null; // Command palette is hidden by default anyway
}

const Index = () => {
  // Defer WebGL background loading until after initial paint
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    // Wait for initial paint + a short delay before loading WebGL
    const timeoutId = requestIdleCallback 
      ? requestIdleCallback(() => setShowBackground(true), { timeout: 1000 })
      : setTimeout(() => setShowBackground(true), 500);
    
    return () => {
      if (typeof timeoutId === 'number') {
        cancelIdleCallback ? cancelIdleCallback(timeoutId) : clearTimeout(timeoutId);
      }
    };
  }, []);

  return (
    <>
      {/* SEO */}
      <title>{person.name} — Engineering Physics × AI/ML</title>
      <meta name="description" content={`${person.headline}. Portfolio showcasing projects in generative modeling, reinforcement learning, and robotics.`} />
      
      {/* Skip link for keyboard users */}
      <SkipLink targetId="main-content" />
      
      {/* Deferred WebGL background - loads after initial content */}
      {showBackground && <CinematicBackground />}
      
      <Navigation />
      
      {/* Lazy loaded command palette */}
      <Suspense fallback={<CommandPaletteLoader />}>
        <CommandPalette />
      </Suspense>
      
      <BackToTop />
      
      <main 
        id="main-content" 
        className="relative z-10"
        tabIndex={-1}
        role="main"
        aria-label="Main content"
      >
        <HeroSection />
        <AboutSection />
        <SkillEcosystemSection />
        <ProjectsSection />
        <ExperienceSection />
        <AcademicsSection />
        <CVSection />
        <ContactSection />
      </main>
      
      <footer 
        className="relative z-10 py-8 px-6 border-t border-border/50 text-center text-sm text-muted-foreground"
        role="contentinfo"
      >
        <p>© {new Date().getFullYear()} {person.name}. Built with care in Stockholm.</p>
      </footer>
    </>
  );
};

export default Index;
