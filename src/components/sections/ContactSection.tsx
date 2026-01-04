import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { person, publications, languages } from '@/lib/content';
import { Mail, Phone, MapPin, ExternalLink, Globe, Code } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function ContactSection() {
  return (
    <section id="contact" className="py-24 px-6" aria-labelledby="contact-heading">
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h2 id="contact-heading" className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-4">
            Get in Touch
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Open to opportunities in AI/ML research and engineering.
          </p>
        </motion.div>
        
        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Card variant="glass" className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">Contact Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <a href={`mailto:${person.email}`} className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  {person.email}
                </a>
                <a href={`tel:${person.phone}`} className="flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Phone className="w-4 h-4 text-primary" />
                  </div>
                  {person.phone}
                </a>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="p-2 rounded-lg bg-muted">
                    <MapPin className="w-4 h-4" />
                  </div>
                  {person.location}
                </div>
                
                <div className="pt-4 border-t border-border/50">
                  <p className="text-sm text-muted-foreground mb-3">Languages</p>
                  <div className="flex flex-wrap gap-2">
                    {languages.spoken.map(lang => (
                      <Badge key={lang.name} variant="outline" className="text-xs">
                        <Globe className="w-3 h-3 mr-1" />
                        {lang.name} ({lang.level})
                      </Badge>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {languages.programming.map(lang => (
                      <Badge key={lang.name} variant="root" className="text-xs">
                        <Code className="w-3 h-3 mr-1" />
                        {lang.name} ({lang.level})
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card variant="glass" className="h-full">
              <CardHeader>
                <CardTitle className="text-xl">Publication</CardTitle>
              </CardHeader>
              <CardContent>
                {publications.map(pub => (
                  <div key={pub.title} className="space-y-3">
                    <p className="text-sm leading-relaxed">
                      <span className="text-muted-foreground">{pub.authors}</span>
                    </p>
                    <p className="font-medium text-foreground">{pub.title}</p>
                    <p className="text-sm text-muted-foreground">{pub.venue} ({pub.year})</p>
                    {pub.doi && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={pub.doi} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View DOI
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
