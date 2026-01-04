# Feature Request: Global Minimal Color System

**Date**: 2026-01-04  
**Priority**: High  
**Affects**: Theme tokens, Tailwind usage, all UI components (Nav, Hero, Ecosystem, Projects, Experience, Academics, Modals/Drawers, Tooltips)

## Summary
Enforce a single, minimal, theme-aware color system across the entire site using semantic tokens (CSS variables). Remove ad-hoc component colors so the UI looks clean and consistent in both light and dark mode.

## Problem Statement
The site currently uses inconsistent colors across components (e.g., Academics tags were updated but other sections still use different hues and hard-coded colors). This creates a messy look and makes light mode feel unpolished compared to dark mode.

### Current Behavior
- Some components use hard-coded colors (HSL/hex or Tailwind palette classes like `text-blue-*`, `bg-emerald-*`, etc.)
- Ecosystem nodes/edges use multiple distinct colors per type.
- Badges/tags differ in palette across sections.
- Light mode lacks a cohesive neutral + accent strategy.

### Why This Is a Problem
- Inconsistent branding and reduced professional feel.
- Light mode readability and aesthetics degrade.
- Maintenance burden: new components introduce new colors and regress the palette.

## Proposed Solution
Implement semantic color tokens (CSS variables) for both light and dark themes, map them to reusable utility classes, refactor all components to use token-based classes only, and add scan tests to prevent regression.

### Design Goals
1. Minimal palette: neutrals + one forest-green accent + one warm amber accent (sparingly).
2. Excellent contrast in both light and dark mode.
3. Zero ad-hoc colors in components (use tokens only).
4. Easy to maintain: one source of truth + regression tests.

### Proposed API / Interface

#### CSS Tokens (single source of truth)
Define the following tokens in `src/index.css` (HSL triples):
- `--bg`, `--surface`, `--surface2`
- `--text`, `--muted`
- `--border`
- `--accent`, `--accent2`
- `--ring`
- `--shadow` (optional)

Define defaults in `:root` (light) and overrides in `.dark`.

#### Utility Classes (token-based)
In `src/index.css` using `@layer utilities`, define:
- `.bg-app`, `.bg-surface`, `.bg-surface2`
- `.text-app`, `.text-muted`
- `.border-app`
- `.text-accent`, `.text-accent2`
- `.bg-accent`, `.bg-accent2`
- `.ring-app`
- `.shadow-app`
- `.scrim` (local hero readability scrim, subtle; NOT fog)

### BEFORE / AFTER (must include)

#### Before (example of ad-hoc colors)
```tsx
// Before: ad-hoc colors / random palette
<a className="text-blue-600 hover:text-blue-800">Link</a>
<span className="bg-emerald-100 text-emerald-800">Tag</span>
```

#### After (token-based, consistent)
```tsx
// After: token-based classes only
<a className="text-accent hover:text-accent/80">Link</a>
<span className="bg-accent/10 text-accent">Tag</span>
```

#### Before (ecosystem node colors)
```ts
// Before: per-type hard-coded colors
color: leaf.type === 'project' ? 'hsl(38 55% 50%)' : 'hsl(210 50% 50%)'
```

#### After (ecosystem token-based)
```ts
// After: no per-type fill colors; use shapes/icons + token borders
// Node styling is derived from tokens in CSS classes (bg-surface2, border-app, text-app)
// Highlight path uses --accent for stroke/glow, not a different palette per type.
```

## Implementation Notes

### Invariants to Respect

* **INV-PRIV-1**: Never show explicit grades anywhere.
* **INV-PRIV-2**: Never store/display/commit personnummer-like identifiers.
* **INV-UI-1**: Minimal palette (neutrals + accent + accent2 only).
* **INV-UI-2**: No ad-hoc colors in components (tokens only).

### Related Components

| Component                                           | Impact                                                               |
| --------------------------------------------------- | -------------------------------------------------------------------- |
| `src/index.css`                                     | Add tokens + utility classes                                         |
| `tailwind.config.ts`                                | Ensure Tailwind doesn't inject conflicting base colors; keep minimal |
| `src/components/Navigation.tsx`                     | Replace palette classes with tokens                                  |
| `src/components/sections/*`                         | Replace palette classes with tokens                                  |
| `src/components/sections/SkillEcosystemSection.tsx` | Remove type-color mapping, use token-based highlight/glow            |
| `src/components/ui/*`                               | Ensure UI components use tokens                                      |
| `tests/*` or `scripts/*`                            | Add regression scan for forbidden colors                             |

### Migration Path

1. Phase 1: Add tokens + utilities. Switch root layout wrappers to `.bg-app .text-app`.
2. Phase 2: Refactor UI components to use token utilities (Nav, Buttons, Badges, Cards, Panels).
3. Phase 3: Refactor Ecosystem colors + glows to tokens and remove per-type palette.
4. Phase 4: Add regression scan tests and make CI fail on violations.

## Acceptance Criteria

* [ ] Light mode looks intentional and premium (not "dark theme inverted").
* [ ] Dark mode remains strong using the same token system.
* [ ] Only TWO accents exist site-wide: `--accent` (forest) and `--accent2` (amber, sparingly).
* [ ] No component contains hard-coded color values (`hsl(`, `rgb(`, hex `#...`) except in token definitions.
* [ ] No Tailwind palette classes like `text-blue-*`, `bg-emerald-*`, `border-purple-*` exist in `src/**`.
* [ ] Ecosystem nodes do not use multiple fill colors; node types are differentiated by shape/icon, not palette.
* [ ] Ecosystem highlight path uses `--accent` (and optional `--accent2` only for featured), not extra colors.
* [ ] Buttons, badges, tooltips, drawers, side panels, command palette all use the same tokens.
* [ ] Added tests/scripts fail the build if forbidden colors are reintroduced.

## Testing Requirements

1. **Color regression scan**:

   * Scan `src/**` for forbidden patterns:

     * `/hsl\(/i`, `/rgb\(/i`, `/#[0-9a-f]{3,8}/i`
     * `/(text|bg|border)-(red|blue|green|emerald|teal|cyan|purple|pink|orange|yellow)-/i`
   * Allowlist ONLY:

     * token definitions file(s) like `src/index.css`
     * `tailwind.config.ts`
2. **Build verification**:

   * `npm run build` passes after refactor.
3. **Visual verification checklist** (manual):

   * Light: Hero, Ecosystem, Projects, Academics drawer
   * Dark: same

## Notes

This request is about consistency, not new features. Keep changes systematic and avoid introducing new brand colors.
