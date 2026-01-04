import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, FileText, Code, Star, Lightbulb, Target, TrendingUp, BookOpen } from 'lucide-react';
import type { Project } from '@/lib/content';

interface ProjectCaseStudyModalProps {
  project: Project | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectCaseStudyModal({ project, open, onOpenChange }: ProjectCaseStudyModalProps) {
  if (!project) return null;

  const hasCaseStudy = project.caseStudy;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            {project.featured && (
              <Badge variant="default" className="bg-primary/20 text-primary border-primary/30">
                <Star className="w-3 h-3 mr-1" />
                Featured
              </Badge>
            )}
            <Badge variant={project.type === 'technical-report' ? 'root' : 'leaf'}>
              {project.type === 'technical-report' ? (
                <><FileText className="w-3 h-3 mr-1" /> Technical Report</>
              ) : (
                <><Code className="w-3 h-3 mr-1" /> Project</>
              )}
            </Badge>
          </div>
          <DialogTitle className="text-xl font-display">{project.title}</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {project.date} {project.role && `• ${project.role}`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Impact statement */}
          {project.impact && (
            <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-sm font-medium text-primary flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                {project.impact}
              </p>
            </div>
          )}

          {/* Description */}
          <div>
            <p className="text-muted-foreground leading-relaxed">{project.description}</p>
          </div>

          {/* Case Study sections */}
          {hasCaseStudy && (
            <div className="space-y-5">
              <CaseStudySection
                icon={<Target className="w-4 h-4" />}
                title="Problem"
                content={project.caseStudy!.problem}
              />
              <CaseStudySection
                icon={<Code className="w-4 h-4" />}
                title="Approach"
                content={project.caseStudy!.approach}
              />
              <CaseStudySection
                icon={<TrendingUp className="w-4 h-4" />}
                title="Results"
                content={project.caseStudy!.results}
              />
              <CaseStudySection
                icon={<Lightbulb className="w-4 h-4" />}
                title="What I Learned"
                content={project.caseStudy!.learnings}
              />
            </div>
          )}

          {/* Skills */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Technologies & Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.skills.map(skill => (
                <Badge key={skill} variant="outline" className="text-xs">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>

          {/* Links */}
          {project.links && project.links.length > 0 && (
            <div className="flex gap-3 pt-2 border-t border-border/50">
              {project.links.map(link => (
                <Button
                  key={link.label}
                  variant="outline"
                  size="sm"
                  asChild={!!link.url}
                  disabled={!link.url}
                  className="gap-2"
                >
                  {link.url ? (
                    <a href={link.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-3 h-3" />
                      {link.label}
                    </a>
                  ) : (
                    <span className="opacity-50">
                      <ExternalLink className="w-3 h-3" />
                      {link.label} (Coming Soon)
                    </span>
                  )}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CaseStudySection({ icon, title, content }: { icon: React.ReactNode; title: string; content: string }) {
  return (
    <div>
      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      <p className="text-sm text-muted-foreground leading-relaxed pl-6">{content}</p>
    </div>
  );
}
