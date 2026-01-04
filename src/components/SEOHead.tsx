import { useEffect } from 'react';
import { person, education, experiences } from '@/lib/content';

// Canonical domain - update this when deploying to production
const SITE_URL = 'https://zeshenbao.lovable.app';

interface SEOHeadProps {
  title?: string;
  description?: string;
  path?: string;
}

export function SEOHead({ 
  title = `${person.name} — Engineering Physics × AI/ML`,
  description = `${person.headline}. Portfolio showcasing projects in generative modeling, reinforcement learning, and robotics.`,
  path = '/'
}: SEOHeadProps) {
  
  useEffect(() => {
    // Create JSON-LD Person schema
    const personSchema = {
      "@context": "https://schema.org",
      "@type": "Person",
      "name": person.name,
      "url": SITE_URL,
      "email": `mailto:${person.email}`,
      "telephone": person.phone,
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Stockholm",
        "addressCountry": "Sweden"
      },
      "alumniOf": education.map(edu => ({
        "@type": "EducationalOrganization",
        "name": edu.institution
      })),
      "jobTitle": "Engineering Physics Student",
      "knowsAbout": [
        "Machine Learning",
        "Artificial Intelligence", 
        "Physics",
        "Robotics",
        "Reinforcement Learning",
        "Generative Modeling"
      ],
      "sameAs": [] // Add social profiles here when available
    };

    // Create JSON-LD WebSite schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": `${person.name} Portfolio`,
      "url": SITE_URL,
      "description": description,
      "author": {
        "@type": "Person",
        "name": person.name
      }
    };

    // Create JSON-LD ProfilePage schema
    const profilePageSchema = {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "mainEntity": {
        "@type": "Person",
        "name": person.name,
        "description": person.headline
      },
      "dateCreated": "2024-01-01",
      "dateModified": new Date().toISOString().split('T')[0]
    };

    // Inject or update JSON-LD scripts
    const schemas = [
      { id: 'json-ld-person', data: personSchema },
      { id: 'json-ld-website', data: websiteSchema },
      { id: 'json-ld-profile', data: profilePageSchema }
    ];

    schemas.forEach(({ id, data }) => {
      let script = document.getElementById(id) as HTMLScriptElement;
      if (!script) {
        script = document.createElement('script');
        script.id = id;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(data);
    });

    // Set canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = `${SITE_URL}${path}`;

    // Cleanup on unmount
    return () => {
      schemas.forEach(({ id }) => {
        const script = document.getElementById(id);
        if (script) script.remove();
      });
    };
  }, [description, path]);

  return null;
}
