import { Suspense, lazy, useState, useEffect } from 'react';
import { ParallaxForestScene } from '@/components/ParallaxForestScene';
import { GlobalReadabilityOverlay } from '@/components/ReadabilityOverlay';
import { Navigation } from '@/components/Navigation';
import { BackToTop } from '@/components/BackToTop';
import { SkipLink } from '@/components/SkipLink';
import { SEOHead } from '@/components/SEOHead';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { SkillEcosystemSection } from '@/components/sections/SkillEcosystemSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { AcademicsSection } from '@/components/sections/AcademicsSection';
import { CVSection } from '@/components/sections/CVSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { person } from '@/lib/content';
import { useThemeStore } from '@/lib/store';

// Lazy load heavy components to reduce initial bundle
const CommandPalette = lazy(() => import('@/components/CommandPalette').then(m => ({ default: m.CommandPalette })));

// Lightweight loading placeholder (no skeleton - just empty)
function CommandPaletteLoader() {
  return null; // Command palette is hidden by default anyway
}

const Index = () => {
  const { resolvedTheme } = useThemeStore();
  const isNight = resolvedTheme === 'night';

  return (
    <>
      {/* SEO - JSON-LD schemas, canonical URL */}
      <SEOHead />
      
      {/* Skip link for keyboard users */}
      <SkipLink targetId="main-content" />
      
      {/* 2D Parallax Forest Scene - lightweight */}
      <ParallaxForestScene />
      
      {/* Global readability overlay for text contrast */}
      <GlobalReadabilityOverlay />
      
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
        className="relative z-10 py-8 px-6 border-t border-border/30 text-center"
        role="contentinfo"
        style={{
          background: isNight 
            ? 'hsl(220 25% 8% / 0.8)'
            : 'hsl(45 30% 98% / 0.85)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} {person.name}. 
          <span className="hidden sm:inline"> Built with care in Stockholm.</span>
        </p>
        <p className="text-xs text-muted-foreground/60 mt-2 hover:text-muted-foreground transition-colors">
          Engineering Physics × AI/ML
        </p>
      </footer>
    </>
  );
};

export default Index;
