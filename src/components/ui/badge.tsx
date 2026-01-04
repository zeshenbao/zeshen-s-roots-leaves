import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-soft",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline: "border-border text-foreground",
        // Skill ecosystem variants
        root: "border-primary/30 bg-primary/10 text-primary",
        leaf: "border-secondary/30 bg-secondary/10 text-secondary",
        // Grade variants
        gradeA: "border-primary/50 bg-primary/20 text-primary font-semibold",
        gradeB: "border-tertiary/50 bg-tertiary/20 text-tertiary",
        gradeC: "border-muted-foreground/30 bg-muted text-muted-foreground",
        // Theme badges
        mathematics: "border-primary/30 bg-primary/10 text-primary",
        physics: "border-tertiary/30 bg-tertiary/10 text-tertiary",
        mlAi: "border-secondary/30 bg-secondary/10 text-secondary",
        computing: "border-primary/30 bg-primary/10 text-primary",
        // Subtle glass
        glass: "border-border/30 bg-card/50 backdrop-blur-sm text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
