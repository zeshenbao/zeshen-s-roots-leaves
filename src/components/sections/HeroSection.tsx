import { motion } from 'framer-motion';
import { ArrowDown, Download, Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { person, education } from '@/lib/content';

export function HeroSection() {
  return (
    <section 
      id="home" 
      className="relative min-h-screen flex items-center justify-center px-6 pt-20"
      aria-label="Introduction"
    >
      <div className="container max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          <Badge variant="glass" className="mb-6">
            <MapPin className="w-3 h-3 mr-1" />
            {person.location}
          </Badge>
          
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium text-foreground mb-6 leading-tight">
            {person.name}
          </h1>
          
          <p className="text-xl sm:text-2xl text-primary font-medium mb-4">
            {person.headline}
          </p>
          
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8 text-base sm:text-lg leading-relaxed">
            {education[0].degree} at {education[0].institution}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
            <Button variant="hero" size="lg" asChild>
              <a href="#projects">
                View Projects
              </a>
            </Button>
            <Button variant="heroOutline" size="lg" asChild>
              <a href={`mailto:${person.email}`}>
                <Mail className="w-4 h-4 mr-2" />
                Contact
              </a>
            </Button>
          </div>
          
          <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
            <a href={`mailto:${person.email}`} className="flex items-center gap-2 hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
              {person.email}
            </a>
            <a href={`tel:${person.phone}`} className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-4 h-4" />
              {person.phone}
            </a>
          </div>
        </motion.div>
        
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 10, 0] }}
          transition={{ delay: 1, duration: 2, repeat: Infinity }}
        >
          <ArrowDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </div>
    </section>
  );
}
