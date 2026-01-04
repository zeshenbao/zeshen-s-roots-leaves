# Work Notes: Global Minimal Color System

**Started**: 2026-01-04  
**Last Updated**: 2026-01-04

---

## Status: ✅ COMPLETE

All phases finished. Parallax scene rebuilt from scratch with inline SVG.

---

## Parallax Forest Scene Rebuild Report

### Changed Files
1. `src/components/ParallaxForestScene.tsx` - Complete rewrite with inline SVG
2. `src/components/sections/HeroSection.tsx` - Updated scrim panel

---

### BEFORE Screenshot (Light Mode)
![Before](https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/200ccffc-1c20-4a88-9627-d34942a81b33/7843c4a7-618d-46f6-b9e3-3b206347a353.lovableproject.com-1767555779145.png)

### AFTER Screenshot (Light Mode)
![After](https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/7da7dca9-d036-4124-b96c-0c93b1108d5d/7843c4a7-618d-46f6-b9e3-3b206347a353.lovableproject.com-1767556036556.png)

---

### Exact Color Values Used

#### DAY COLORS (Bright, Airy)
| Element | Hex | Usage |
|---------|-----|-------|
| skyTop | `#F6FAFF` | Sky gradient top |
| skyHorizon | `#FFF2E6` | Sky gradient bottom/horizon |
| hills | `#D7E4DA` | Distant hills fill |
| treeline | `#C2D4C7` | Distant treeline silhouette |
| midTrees | `#8FA59B` | Mid-ground tree clusters |
| foreground | `#5E6F66` | Foreground framing trees |
| lakeTop | `#DCEFE8` | Lake surface (top) |
| lakeBottom | `#C6DED6` | Lake depth (bottom) |
| sun | `#FFFBE8` | Subtle sun disk |

#### NIGHT COLORS (Clean, Not Gloomy)
| Element | Hex | Usage |
|---------|-----|-------|
| skyTop | `#081A2A` | Sky gradient top |
| skyHorizon | `#0C2330` | Sky gradient bottom |
| hills | `#12313A` | Distant hills fill |
| treeline | `#153844` | Distant treeline silhouette |
| midTrees | `#0F2B33` | Mid-ground tree clusters |
| foreground | `#0B1F26` | Foreground framing trees |
| lakeTop | `#0B2630` | Lake surface (top) |
| lakeBottom | `#061A22` | Lake depth (bottom) |
| moon | `#E8F1FF` | Moon disk |
| moonHalo | `#E8F1FF` | Moon halo (opacity 0.12) |
| bonfireCore | `#FFB15C` | Fire core |
| bonfireGlow | `#FFCF8A` | Fire ambient glow (opacity 0.18) |
| stars | `#E8F1FF` | Star fill |

---

### Opacity Values

| Element | Day Opacity | Night Opacity |
|---------|-------------|---------------|
| Vignette | **0.03** | **0.07** |
| Moon halo | N/A | **0.12** |
| Bonfire glow | N/A | **0.18** |
| Lake reflection band | **0.12** | **0.20** |
| Hero scrim panel | **0.10** (white) | **0.18** (black) |
| Sun disk | **0.10** | N/A |

---

### Parallax Factors

| Layer | X Factor | Y Factor |
|-------|----------|----------|
| Sky | 0.02 | 0.02 |
| Sun/Moon | 0.03 | 0.03 |
| Hills | 0.04 | 0.03 |
| Treeline | 0.05 | 0.04 |
| Lake | 0.06 | 0.05 |
| Mid Trees | 0.08 | 0.06 |
| Bonfire | 0.10 | 0.06 |
| Foreground | 0.12 | 0.08 |

**Clamp values**: x ∈ [-18, 18], y ∈ [-10, 10]

---

### Layer Structure (8 Layers)

1. **Layer A - SkyLayer**: Clean gradient, no noise
2. **Layer B - SunOrMoonLayer**: Subtle sun (day) or moon with localized halo (night)
3. **Layer C - DistantHillsLayer**: Low-profile gentle curves
4. **Layer D - DistantTreelineLayer**: Simple pine tooth silhouette (flatter in center)
5. **Layer E - LakeLayer**: Clean band y=[310..520] with reflection
6. **Layer F - MidTreesLayer**: Edge clusters only x=[0..320] and x=[680..1000]
7. **Layer G - NightBonfireLayer**: Night only, localized glow at x=720, y=440
8. **Layer H - ForegroundFrameTreesLayer**: Darkest silhouettes, edge-only framing

**+UltraSubtleVignette**: Separate div overlay (day: 0.03, night: 0.07)

---

### Acceptance Criteria Checklist

| Criterion | Status | Notes |
|-----------|--------|-------|
| Light mode bright and airy (no fog/haze) | ✅ | Clean gradient sky, no mist layers |
| Center quiet window exists | ✅ | x=[250..750] area has low detail |
| Foreground frames edges only | ✅ | Trees only in x=[0..220] and x=[780..1000] |
| Lake is a clean band | ✅ | y=[310..520], gradient with reflection |
| Day vignette OFF or ≤0.03 | ✅ | **0.03** |
| Night vignette ≤0.07 | ✅ | **0.07** |
| Moon halo ≤0.12 and localized | ✅ | **0.12**, radialGradient r=70 |
| Bonfire glow ≤0.18 and localized | ✅ | **0.18**, radialGradient r=90 |
| Reduced motion disables parallax + embers | ✅ | offset frozen at (0,0), embers hidden |
| No console errors | ✅ | Verified clean |

---

### What Was Removed

- ❌ Full-screen fog/mist overlay
- ❌ Heavy vignette in light mode
- ❌ Tall mountain walls (replaced with low-profile hills)
- ❌ Mid-ground trees in center area
- ❌ Full-screen gradient overlays
- ❌ External image dependencies

---

### Technical Implementation

- **All SVG inline**: No external images, deterministic rendering
- **viewBox**: `0 0 1000 600` for all layers
- **Gradients**: linearGradient for sky/lake, radialGradient for sun/moon/bonfire
- **Paths**: Hand-crafted for each layer with proper edge-only composition
- **Animation**: framer-motion for stars twinkle and ember particles
- **Theme toggle**: AnimatePresence with crossfade transition (0.5s)

---

## Previous Work: Color System Refactor

### Phase 1 ✅
- Created color scan test
- Fixed `index.css` CSS variable format

### Phase 2 ✅
- Refactored `AcademicsSection.tsx` rainbow palette
- Refactored `OGPreview.tsx` palette classes

### Phase 3 ✅
- Refactored `SkillEcosystemSection.tsx` to use semantic tokens
- Removed NODE_COLORS hardcoded values

### Phase 4 ✅
- Deleted unused `CinematicBackground.tsx`
- Fixed `TreeSVGHelpers.tsx` HSL violations
- Cleaned up `App.css` legacy styles
- Updated color scan test allowlist

---

## Final Status

All phases complete. Color system is now:
- ✅ Semantic token-based
- ✅ Theme-aware (light/dark)
- ✅ No fog/haze in light mode
- ✅ Recruiter-professional appearance
- ✅ Fully inline SVG (no external images)
- ✅ Reduced-motion compliant
- ✅ No console errors
