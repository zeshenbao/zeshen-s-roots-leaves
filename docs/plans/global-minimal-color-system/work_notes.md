# Work Notes: Global Minimal Color System

**Started**: 2026-01-04  
**Last Updated**: 2026-01-04

---

## Session Log

### 2026-01-04 - Planning Phase

**Completed:**
- Created feature request document
- Created development plan with phases
- Created Phase 1 detailed plan

**Discoveries:**
- Project already has semantic tokens in `src/index.css`
- `SkillEcosystemSection.tsx` has `NODE_COLORS` object that needs refactoring
- `ParallaxForestScene.tsx` uses inline HSL for art - this is acceptable and will be allowlisted

**Decisions:**
- Use TDD approach: write color scan test first
- Allowlist: `src/index.css`, `tailwind.config.ts`, `ParallaxForestScene.tsx`
- Phase 1 focuses on foundation before component refactoring

**Blockers:**
- None

---

## Violation Tracking (Phase 1 Scan Results)

| File | Violation Type | Count | Status |
|------|---------------|-------|--------|
| `SkillEcosystemSection.tsx` | Hard-coded HSL colors (NODE_COLORS, gradients, strokes) | ~25+ | Pending Phase 3 |
| `AcademicsSection.tsx` | Tailwind palette classes (bg-blue-*, text-purple-*, etc.) | 8 themes | Pending Phase 2 |
| `CinematicBackground.tsx` | Hex colors throughout | ~20 | Consider removal (unused?) |
| `OGPreview.tsx` | Tailwind palette class (bg-amber-100) | 1 | Pending Phase 2 |

*This table will be populated after running the color scan test*

---

## Visual Verification Log

| Section | Light Mode | Dark Mode | Date |
|---------|------------|-----------|------|
| Hero | ⏳ | ⏳ | - |
| Ecosystem | ⏳ | ⏳ | - |
| Projects | ⏳ | ⏳ | - |
| Academics | ⏳ | ⏳ | - |
| Nav/Modals | ⏳ | ⏳ | - |

Legend: ✅ Pass | ❌ Fail | ⏳ Pending

---

## Questions / Open Items

1. Should `ReadabilityOverlay.tsx` scrim colors be tokenized or kept as scene-specific?
2. Confirm final accent HSL values with design review

---

## Resources

- Feature Request: `docs/ai-agent-requests/global-minimal-color-system.md`
- Development Plan: `docs/plans/global-minimal-color-system/development-plan.md`
- Phase 1 Details: `docs/plans/global-minimal-color-system/phases/phase_1.md`
