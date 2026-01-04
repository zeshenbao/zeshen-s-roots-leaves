import { CinematicBackground } from '@/components/CinematicBackground';
import { Navigation } from '@/components/Navigation';
import { HeroSection } from '@/components/sections/HeroSection';
import { SkillEcosystemSection } from '@/components/sections/SkillEcosystemSection';
import { ProjectsSection } from '@/components/sections/ProjectsSection';
import { ExperienceSection } from '@/components/sections/ExperienceSection';
import { ContactSection } from '@/components/sections/ContactSection';
import { person } from '@/lib/content';

const Index = () => {
  return (
    <>
      {/* SEO */}
      <title>{person.name} | Engineering Physics & AI/ML Portfolio</title>
      <meta name="description" content={`${person.headline}. Portfolio showcasing projects in generative modeling, reinforcement learning, and robotics.`} />
      
      <CinematicBackground />
      <Navigation />
      
      <main className="relative z-10">
        <HeroSection />
        <SkillEcosystemSection />
        <ProjectsSection />
        <ExperienceSection />
        <ContactSection />
      </main>
      
      <footer className="relative z-10 py-8 px-6 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} {person.name}. Built with care in Stockholm.</p>
      </footer>
    </>
  );
};

export default Index;
