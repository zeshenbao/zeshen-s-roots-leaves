import { CinematicBackground } from '@/components/CinematicBackground';
import { Navigation } from '@/components/Navigation';
import { CommandPalette } from '@/components/CommandPalette';
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

const Index = () => {
  return (
    <>
      {/* SEO */}
      <title>{person.name} — Engineering Physics × AI/ML</title>
      <meta name="description" content={`${person.headline}. Portfolio showcasing projects in generative modeling, reinforcement learning, and robotics.`} />
      
      {/* Skip link for keyboard users */}
      <SkipLink targetId="main-content" />
      
      <CinematicBackground />
      <Navigation />
      <CommandPalette />
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
