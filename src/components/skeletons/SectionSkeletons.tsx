import { Skeleton } from '@/components/ui/skeleton';

export function SkillEcosystemSkeleton() {
  return (
    <section className="relative py-24 px-6 min-h-screen bg-muted/10">
      <div className="container max-w-5xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-64 mx-auto mb-4" />
          <Skeleton className="h-5 w-full max-w-2xl mx-auto" />
        </div>

        {/* Tree visualization skeleton */}
        <div className="relative w-full h-[600px] md:h-[700px] rounded-2xl bg-card/50 border border-border/30 overflow-hidden">
          {/* Soil band */}
          <div className="absolute bottom-0 left-0 right-0 h-1/4 bg-gradient-to-t from-muted/40 to-transparent" />
          
          {/* Central trunk area */}
          <div className="absolute left-1/2 bottom-1/4 -translate-x-1/2 w-4 h-1/3 bg-muted/30 rounded-full" />
          
          {/* Branch hints */}
          <div className="absolute top-1/3 left-1/4 w-20 h-2 bg-muted/20 rounded-full rotate-12" />
          <div className="absolute top-1/3 right-1/4 w-20 h-2 bg-muted/20 rounded-full -rotate-12" />
          
          {/* Leaf placeholders */}
          <div className="absolute top-1/4 left-1/3">
            <Skeleton className="h-8 w-24 rounded-full" />
          </div>
          <div className="absolute top-1/5 right-1/3">
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2">
            <Skeleton className="h-8 w-28 rounded-full" />
          </div>
          
          {/* Loading indicator */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading skill tree...</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CVSectionSkeleton() {
  return (
    <section className="py-24 px-6 bg-muted/10">
      <div className="container max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <Skeleton className="h-10 w-48 mx-auto mb-4" />
          <Skeleton className="h-5 w-full max-w-xl mx-auto mb-8" />
          
          <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-12 w-36" />
          </div>
        </div>

        {/* PDF preview skeleton */}
        <Skeleton className="hidden md:block h-[700px] w-full rounded-xl" />
        
        {/* Mobile skeleton */}
        <div className="md:hidden">
          <Skeleton className="h-48 w-full rounded-xl" />
        </div>
      </div>
    </section>
  );
}

export function BackgroundSkeleton() {
  return (
    <div 
      className="fixed inset-0 z-0 bg-gradient-to-b from-background via-background to-muted/20"
      aria-hidden="true"
    />
  );
}
