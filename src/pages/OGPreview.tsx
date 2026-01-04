/**
 * OG Image Preview Page
 * Developer-only route to preview OpenGraph images
 * Access via /og-preview
 */

const OGPreview = () => {
  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">
            OpenGraph Image Preview
          </h1>
          <p className="text-muted-foreground">
            Preview OG images at actual size (1200×630). These are used for social media link previews.
          </p>
        </header>

        {/* Light OG Image */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-primary/20 border border-primary/40" />
            <h2 className="text-xl font-semibold text-foreground">OG Light</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              /og/og-light.png
            </span>
          </div>
          <div className="rounded-xl overflow-hidden border border-border shadow-lg">
            <img 
              src="/og/og-light.png" 
              alt="OG Light - Forest valley with subtle physics motifs"
              className="w-full h-auto"
              loading="eager"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Theme:</strong> Bright forest valley, morning light, subtle geometric/physics patterns.
            <br />
            <strong>Use case:</strong> Default OG image for social sharing (Facebook, LinkedIn, Discord, etc.)
          </p>
        </section>

        {/* Dark OG Image */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-4 h-4 rounded-full bg-muted border border-border" />
            <h2 className="text-xl font-semibold text-foreground">OG Dark</h2>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
              /og/og-dark.png
            </span>
          </div>
          <div className="rounded-xl overflow-hidden border border-border shadow-lg">
            <img 
              src="/og/og-dark.png" 
              alt="OG Dark - Moonlit forest with bonfire and stars"
              className="w-full h-auto"
              loading="eager"
            />
          </div>
          <p className="text-sm text-muted-foreground">
            <strong>Theme:</strong> Night forest, moonlight, bonfire glow, glimmering stars.
            <br />
            <strong>Use case:</strong> Alternative for dark-themed contexts or manual sharing preference.
          </p>
        </section>

        {/* Meta Info */}
        <section className="p-6 rounded-xl bg-card border border-border">
          <h3 className="text-lg font-semibold text-foreground mb-4">Implementation Details</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <div className="flex gap-2">
              <span className="font-medium text-foreground w-32">Default OG:</span>
              <code className="bg-muted px-2 py-0.5 rounded">/og/og-light.png</code>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-foreground w-32">Alt OG:</span>
              <code className="bg-muted px-2 py-0.5 rounded">/og/og-dark.png</code>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-foreground w-32">Size:</span>
              <span>1200 × 630 pixels (standard OG ratio)</span>
            </div>
            <div className="flex gap-2">
              <span className="font-medium text-foreground w-32">Meta tags:</span>
              <span>og:image, twitter:image pointing to og-light.png</span>
            </div>
          </div>
        </section>

        {/* Back link */}
        <div className="text-center">
          <a 
            href="/" 
            className="text-primary hover:underline text-sm"
          >
            ← Back to Portfolio
          </a>
        </div>
      </div>
    </div>
  );
};

export default OGPreview;
