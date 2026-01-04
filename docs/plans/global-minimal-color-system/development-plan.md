# Development Plan: Global Minimal Color System

**Feature Request**: [global-minimal-color-system.md](../../ai-agent-requests/global-minimal-color-system.md)  
**Created**: 2026-01-04  
**Status**: Planning

---

## Current State Analysis

### Existing Token System
The project already has semantic tokens in `src/index.css`:
- `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--accent`, `--border`, etc.
- Light/dark themes defined via `:root` and `.dark` selectors

### Problems Identified
1. **Inconsistent usage**: Components mix token classes with hard-coded HSL values
2. **Ecosystem colors**: `SkillEcosystemSection.tsx` uses `NODE_COLORS` object with per-type colors
3. **ParallaxForestScene**: Uses inline HSL for scene elements (acceptable for scene-specific art)
4. **Scattered palette classes**: Some files may use Tailwind palette (`text-blue-*`, etc.)

### Files to Analyze
| File | Concern |
|------|---------|
| `src/index.css` | Token definitions - source of truth |
| `tailwind.config.ts` | Tailwind theme extension |
| `src/components/sections/SkillEcosystemSection.tsx` | NODE_COLORS per-type mapping |
| `src/components/Navigation.tsx` | Nav styling |
| `src/components/ui/*.tsx` | UI primitives |
| `src/components/CourseDrawer.tsx` | Drawer/modal styling |
| `src/components/CommandPalette.tsx` | Command palette styling |

---

## Files to Modify

| File | Action | Phase |
|------|--------|-------|
| `src/index.css` | Consolidate tokens, add utility classes | 1 |
| `tailwind.config.ts` | Verify minimal theme, remove unused colors | 1 |
| `src/App.tsx` or `src/pages/Index.tsx` | Apply `bg-background text-foreground` to root | 1 |
| `src/lib/color-scan.test.ts` | Create regression test (TDD - RED first) | 1 |
| `src/components/Navigation.tsx` | Replace any ad-hoc colors | 2 |
| `src/components/ui/badge.tsx` | Verify token usage | 2 |
| `src/components/ui/button.tsx` | Verify token usage | 2 |
| `src/components/CourseDrawer.tsx` | Replace any ad-hoc colors | 2 |
| `src/components/CommandPalette.tsx` | Replace any ad-hoc colors | 2 |
| `src/components/sections/SkillEcosystemSection.tsx` | Remove NODE_COLORS, use tokens | 3 |
| `src/components/ParallaxForestScene.tsx` | Keep scene colors (allowlisted art) | - |

---

## Phases

### Phase 1: Foundation (tokens + test)
**Objective**: Establish tokens, utility classes, root wrappers, and regression test

- [ ] Audit `src/index.css` tokens - consolidate if needed
- [ ] Add utility classes (`bg-app`, `text-app`, etc.) if missing
- [ ] Update root layout to use semantic classes
- [ ] Create `src/lib/color-scan.test.ts` (TDD: write failing test first)
- [ ] Run test - should FAIL (RED) because violations exist

**Deliverables**: 
- Updated `src/index.css`
- `src/lib/color-scan.test.ts`
- Test output showing violations

### Phase 2: UI Component Refactor
**Objective**: Migrate UI components to token-only usage

- [ ] `Navigation.tsx`
- [ ] `badge.tsx`, `button.tsx`, `card.tsx`
- [ ] `CourseDrawer.tsx`, `CommandPalette.tsx`
- [ ] `ProjectCaseStudyModal.tsx`
- [ ] All section components

**Deliverables**:
- Refactored components
- Reduced violations in test output

### Phase 3: Ecosystem Refactor
**Objective**: Remove per-type colors from Skill Ecosystem

- [ ] Remove `NODE_COLORS` mapping
- [ ] Use shapes/icons to differentiate node types
- [ ] Use `--accent` for highlight paths
- [ ] Use `--accent2` sparingly for featured items only

**Deliverables**:
- Simplified Ecosystem styling
- Visual parity in light/dark modes

### Phase 4: Finalize + CI
**Objective**: Pass all tests, add CI enforcement

- [ ] All tests pass (GREEN)
- [ ] Visual verification complete
- [ ] Add to CI pipeline (optional)

---

## TDD Approach

1. **Write test first** (`color-scan.test.ts`)
2. **Run test** → expect FAIL (violations exist)
3. **Refactor components** to remove violations
4. **Run test** → expect PASS

---

## Acceptance Criteria Checklist

- [ ] Light mode looks premium
- [ ] Dark mode uses same tokens
- [ ] Only `--accent` (forest) and `--accent2` (amber) exist
- [ ] No hard-coded HSL/RGB/hex in components (except allowlist)
- [ ] No Tailwind palette classes in `src/**`
- [ ] Ecosystem uses shapes, not colors, for node types
- [ ] All UI components use tokens
- [ ] Regression test passes

---

## Notes

- `ParallaxForestScene.tsx` is allowlisted for scene-specific art colors
- Focus on consistency, not new features
- Maintain privacy invariants (no grades, no sensitive IDs)
