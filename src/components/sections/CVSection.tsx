import { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, ExternalLink, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { generateResumePDF, generateResumePDFBlob } from '@/lib/generate-resume';
import { person } from '@/lib/content';
import { useInView } from 'react-intersection-observer';

export function CVSection() {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const { ref: sectionRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });

  // Generate PDF blob URL when section comes into view (lazy load)
  useEffect(() => {
    if (inView && !pdfUrl && !isGenerating) {
      setIsGenerating(true);
      // Use requestIdleCallback for non-blocking generation
      const generatePdf = () => {
        try {
          const blob = generateResumePDFBlob();
          const url = URL.createObjectURL(blob);
          setPdfUrl(url);
        } catch (error) {
          console.error('Failed to generate PDF preview:', error);
        } finally {
          setIsGenerating(false);
        }
      };
      
      if ('requestIdleCallback' in window) {
        (window as Window).requestIdleCallback(generatePdf);
      } else {
        setTimeout(generatePdf, 100);
      }
    }
  }, [inView, pdfUrl, isGenerating]);

  // Cleanup blob URL on unmount
  useEffect(() => {
    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [pdfUrl]);

  const handleDownload = useCallback(() => {
    generateResumePDF();
  }, []);

  const handleOpenInNewTab = useCallback(() => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      // Generate on demand if not yet available
      const blob = generateResumePDFBlob();
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
    }
  }, [pdfUrl]);

  return (
    <section 
      id="cv" 
      ref={sectionRef}
      className="py-24 px-6 bg-muted/10" 
      aria-labelledby="cv-heading"
    >
      <div className="container max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <h2 
            id="cv-heading"
            className="font-display text-3xl sm:text-4xl font-medium text-foreground mb-4"
          >
            Curriculum Vitae
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Download my full CV or preview it below. Generated from the same data shown throughout this portfolio.
          </p>
          
          {/* Primary Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Button 
              variant="hero" 
              size="lg" 
              onClick={handleDownload}
              className="gap-2"
            >
              <Download className="w-4 h-4" />
              Download CV (PDF)
            </Button>
            <Button 
              variant="heroOutline" 
              size="lg" 
              onClick={handleOpenInNewTab}
              className="gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              Open in New Tab
            </Button>
          </div>
        </motion.div>

        {/* PDF Preview - Desktop */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden md:block"
        >
          <Card variant="glass" className="overflow-hidden">
            <CardContent className="p-0">
              {isGenerating ? (
                <div className="h-[700px] flex items-center justify-center bg-muted/20">
                  <div className="text-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Generating preview...</p>
                  </div>
                </div>
              ) : pdfUrl ? (
                <iframe
                  src={pdfUrl}
                  title={`${person.name} CV Preview`}
                  className="w-full h-[700px] border-0"
                  loading="lazy"
                />
              ) : (
                <div className="h-[700px] flex items-center justify-center bg-muted/20">
                  <div className="text-center">
                    <FileText className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">Preview will load when section is visible</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Mobile - Show toggle for preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="md:hidden"
        >
          <Card variant="glass">
            <CardContent className="p-6 text-center">
              <FileText className="w-12 h-12 text-primary/50 mx-auto mb-4" />
              <h3 className="font-medium text-foreground mb-2">CV Preview</h3>
              <p className="text-sm text-muted-foreground mb-4">
                For the best experience, download the PDF or open it in a new tab.
              </p>
              
              {showPreview && pdfUrl ? (
                <div className="mt-4">
                  <iframe
                    src={pdfUrl}
                    title={`${person.name} CV Preview`}
                    className="w-full h-[400px] border border-border rounded-lg"
                    loading="lazy"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowPreview(false)}
                    className="mt-3"
                  >
                    Hide Preview
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowPreview(true)}
                  disabled={isGenerating}
                  className="gap-2"
                >
                  {isGenerating ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4" />
                  )}
                  Show Preview
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
