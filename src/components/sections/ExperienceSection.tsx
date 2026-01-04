import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { experiences, volunteerExperiences } from '@/lib/content';
import { Briefcase, Heart, GraduationCap, FlaskConical } from 'lucide-react';

const categoryIcons = {
  work: Briefcase,
  research: FlaskConical,
  teaching: GraduationCap,
  volunteer: Heart,
};

export function ExperienceSection() {
  const allExperiences = [...experiences, ...volunteerExperiences].sort((a, b) => {
    const getYear = (period: string) => {
      const match = period.match(/\d{4}/);
      return match ? parseInt(match[0]) : 0;
    };
    return getYear(b.period) - getYear(a.period);
  });

  return (
    <section id="experience" className="section-container" aria-labelledby="experience-heading">
      <div className="section-inner">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="section-accent"
        >
          <h2 id="experience-heading" className="section-title">
            Experience
          </h2>
          <p className="section-subtitle mb-12">
            Research, teaching, and leadership roles.
          </p>
        </motion.div>
        
        <div className="relative">
          <div className="timeline-line" />
          
          <div className="space-y-8">
                {allExperiences.map((exp, index) => {
              const Icon = categoryIcons[exp.category];
              return (
                <motion.article
                  id={`exp-${exp.id}`}
                  key={`${exp.title}-${exp.organization}`}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="relative pl-10 rounded-xl"
                >
                  <div className="absolute left-2.5 top-2 timeline-dot" />
                  
                  <Card variant="glass">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-4 flex-wrap">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10" aria-hidden="true">
                            <Icon className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-foreground">{exp.title}</h3>
                            <p className="text-sm text-muted-foreground">{exp.organization}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          <span className="sr-only">Period: </span>
                          {exp.period}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm text-muted-foreground" role="list">
                        {exp.bullets.map((bullet, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-primary mt-1" aria-hidden="true">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                      {exp.advisors && (
                        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50">
                          Advisors: {exp.advisors}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </motion.article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
