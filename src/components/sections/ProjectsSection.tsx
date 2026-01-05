import { useState, useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { projects, type Project } from '@/lib/content';
import { ExternalLink, FileText, Code, Star, ChevronRight, TrendingUp } from 'lucide-react';
import { ProjectCaseStudyModal } from '@/components/ProjectCaseStudyModal';

export function ProjectsSection() {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  // Sort: featured first, then by date
  const sortedProjects = [...projects].sort((a, b) => {
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });

  const featuredProjects = sortedProjects.filter(p => p.featured);
  const otherProjects = sortedProjects.filter(p => !p.featured);

  const openCaseStudy = (project: Project) => {
    setSelectedProject(project);
    setModalOpen(true);
  };

  return (
    <section ref={sectionRef} id="projects" className="section-container relative overflow-hidden" aria-labelledby="projects-heading">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section-accent"
        >
          <h2 id="projects-heading" className="section-title">
            Projects & Technical Reports
          </h2>
          <p className="section-subtitle mb-12">
            Hands-on work in generative modeling, reinforcement learning, and scientific computing. 
            Click any project for the full case study.
          </p>
        </motion.div>

        {/* Featured Projects */}
        {featuredProjects.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm uppercase tracking-widest text-primary mb-6 flex items-center gap-2">
              <Star className="w-4 h-4" />
              Featured Work
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {featuredProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index}
                  featured
                  onOpenCaseStudy={openCaseStudy}
                />
              ))}
            </div>
          </div>
        )}

        {/* Other Projects */}
        {otherProjects.length > 0 && (
          <div>
            <h3 className="text-sm uppercase tracking-widest text-muted-foreground mb-6">
              Other Projects
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              {otherProjects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  index={index + featuredProjects.length}
                  onOpenCaseStudy={openCaseStudy}
                />
              ))}
            </div>
          </div>
        )}

        <ProjectCaseStudyModal
          project={selectedProject}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </div>
    </section>
  );
}

interface ProjectCardProps {
  project: Project;
  index: number;
  featured?: boolean;
  onOpenCaseStudy: (project: Project) => void;
}

function ProjectCard({ project, index, featured, onOpenCaseStudy }: ProjectCardProps) {
  return (
    <motion.article
      id={`project-${project.id}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="relative rounded-xl"
    >
      <Card
        variant="interactive"
        className={`h-full cursor-pointer group transition-all hover:shadow-lg ${
          featured ? 'ring-1 ring-primary/20' : ''
        }`}
        onClick={() => onOpenCaseStudy(project)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onOpenCaseStudy(project);
          }
        }}
        aria-label={`View case study for ${project.title}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {featured && (
                  <Badge variant="default" className="bg-primary/20 text-primary border-primary/30 text-xs">
                    <Star className="w-3 h-3 mr-1" />
                    Featured
                  </Badge>
                )}
                <Badge variant={project.type === 'technical-report' ? 'root' : 'leaf'} className="text-xs">
                  {project.type === 'technical-report' ? (
                    <><FileText className="w-3 h-3 mr-1" /> Report</>
                  ) : (
                    <><Code className="w-3 h-3 mr-1" /> Project</>
                  )}
                </Badge>
              </div>
              <h3 className="text-lg font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                {project.title}
              </h3>
            </div>
            <span className="text-xs text-muted-foreground whitespace-nowrap flex-shrink-0">
              {project.date}
            </span>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Impact statement */}
          {project.impact && (
            <p className="text-sm text-primary font-medium mb-3 flex items-start gap-2">
              <TrendingUp className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              {project.impact}
            </p>
          )}

          {/* Description - truncated */}
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {project.description}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.skills.slice(0, 3).map(skill => (
              <Badge key={skill} variant="outline" className="text-xs">
                {skill}
              </Badge>
            ))}
            {project.skills.length > 3 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                +{project.skills.length - 3}
              </Badge>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            {/* Links preview */}
            <div className="flex gap-2 text-xs text-muted-foreground">
              {project.links?.slice(0, 2).map(link => (
                <span key={link.label} className="flex items-center gap-1">
                  <ExternalLink className="w-3 h-3" />
                  {link.label}
                </span>
              ))}
            </div>

            {/* View case study hint */}
            <span className="text-xs text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              View details
              <ChevronRight className="w-3 h-3" />
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}
