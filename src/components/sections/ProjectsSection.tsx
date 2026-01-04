import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { projects } from '@/lib/content';
import { ExternalLink, FileText, Code } from 'lucide-react';

export function ProjectsSection() {
  return (
    <section id="projects" className="py-24 px-6 bg-muted/10" aria-labelledby="projects-heading">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 id="projects-heading" className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-4">
            Projects & Technical Reports
          </h2>
          <p className="text-muted-foreground mb-12 max-w-2xl">
            Hands-on work in generative modeling, reinforcement learning, and scientific computing.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <Card variant="interactive" className="h-full">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Badge variant={project.type === 'technical-report' ? 'root' : 'leaf'} className="mb-3">
                        {project.type === 'technical-report' ? (
                          <><FileText className="w-3 h-3 mr-1" /> Technical Report</>
                        ) : (
                          <><Code className="w-3 h-3 mr-1" /> Project</>
                        )}
                      </Badge>
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                    </div>
                    <span className="text-sm text-muted-foreground whitespace-nowrap">{project.date}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4 text-sm leading-relaxed">
                    {project.description}
                  </CardDescription>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.skills.map(skill => (
                      <Badge key={skill} variant="outline" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                  {project.links && (
                    <div className="flex gap-3 text-sm">
                      {project.links.map(link => (
                        <span key={link.label} className="flex items-center gap-1 text-primary">
                          <ExternalLink className="w-3 h-3" />
                          {link.label}
                        </span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
