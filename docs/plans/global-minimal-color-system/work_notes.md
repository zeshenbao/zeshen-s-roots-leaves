# Work Notes: Global Minimal Color System

**Started**: 2026-01-04  
**Last Updated**: 2026-01-04

---

## Status: ✅ COMPLETE (Revision 2)

All phases finished. Parallax scene rebuilt with rounded tree silhouettes, grounded bonfire, and shaded moon.

---

## Parallax Forest Scene Revision 2 Report

### Changed Files
1. `src/components/ParallaxForestScene.tsx` - Complete rewrite with rounded trees and grounded bonfire

---

### BEFORE Screenshot (Light Mode - Spiky Trees)
![Before](https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/b84e2b9a-c6cf-4c3a-a400-efa9dcfae367/7843c4a7-618d-46f6-b9e3-3b206347a353.lovableproject.com-1767556392745.png)

### AFTER Screenshot (Light Mode - Rounded Trees)
![After](https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8ccef6d9-67e7-46ba-8b4e-2708ba197748/7843c4a7-618d-46f6-b9e3-3b206347a353.lovableproject.com-1767556549641.png)

---

### Key Changes Made

#### 1. Tree Design (NO MORE SPIKES)
Replaced all triangle/tooth patterns with reusable tree components:

**RoundedPine Component:**
- Trunk: `<rect width="22" height="140" rx="10" />`
- Canopy: 4 stacked ellipses decreasing upward:
  - `<ellipse rx="45" ry="30" />` (bottom)
  - `<ellipse rx="38" ry="28" />` 
  - `<ellipse rx="30" ry="24" />`
  - `<ellipse rx="20" ry="18" />` (top)

**BroadleafTree Component:**
- Trunk: `<rect width="28" height="120" rx="12" />`
- Canopy: overlapping ellipses forming a blob:
  - `<ellipse rx="70" ry="50" />` (main)
  - `<ellipse rx="45" ry="38" />` (left)
  - `<ellipse rx="45" ry="38" />` (right)
  - `<ellipse rx="45" ry="35" />` (top)

#### 2. Distant Treeline (Soft Wavy Silhouette)
Replaced spiky tooth pattern with smooth curve:
```
M0,300 C120,280 220,310 340,295 C470,270 560,320 700,292 C820,275 910,310 1000,290 L1000,340 L0,340 Z
```
Plus 8 small rounded ellipse "bumps" on top.

#### 3. Shore/Ground Plane (NEW LAYER)
Added ShoreLayer so bonfire sits on visible ground:
```
M0,430 C200,410 380,450 520,430 C700,400 860,460 1000,440 L1000,600 L0,600 Z
```
- Day: `#C7D9CF`
- Night: `#071B22`

#### 4. Grounded Bonfire (Night Only)
Position: `transform="translate(720, 455)"`

Components:
- **Firepit stones**: 8 circles in ring (r=32), fill `#2B2F33`
- **Log 1**: `<rect width="90" height="16" rx="8" />` rotated -15°, fill `#5B3A24`
- **Log 2**: `<rect width="82" height="14" rx="7" />` rotated +20°, fill `#4A2F1F`
- **Outer flame**: `M0,-50 C-20,-30 -18,-5 0,8 C18,-5 20,-30 0,-50 Z`
- **Inner flame**: `M0,-38 C-12,-24 -10,-6 0,4 C10,-6 12,-24 0,-38 Z`
- **Local glow**: radialGradient r=110, opacity 0.16

#### 5. Moon with Terminator (Night Only)
- Base disc: radialGradient with offset center (cx="35%", cy="35%")
- Terminator: shadow circle offset +6px in x, opacity 0.12
- Craters: 4 faint circles (opacity 0.06-0.08)
- Halo: radialGradient r=65, opacity 0.10

#### 6. Stars (Improved)
- Count: 28 stars
- Size: r=0.8..1.6 (small dots)
- Opacity: 0.15..0.45
- Position: y < 220 only

---

### Exact Color Values Used

#### DAY COLORS
| Element | Hex | Usage |
|---------|-----|-------|
| skyTop | `#F6FAFF` | Sky gradient top |
| skyHorizon | `#FFF2E6` | Sky gradient bottom |
| hills | `#D7E4DA` | Distant hills fill |
| treeline | `#C2D4C7` | Distant treeline |
| midTrees | `#8FA59B` | Mid-ground tree clusters |
| foreground | `#5E6F66` | Foreground framing trees |
| lakeTop | `#DCEFE8` | Lake surface (top) |
| lakeBottom | `#C6DED6` | Lake depth (bottom) |
| shore | `#C7D9CF` | Ground/shore plane |
| sun | `#FFFBE8` | Sun disk (opacity 0.08) |

#### NIGHT COLORS
| Element | Hex | Usage |
|---------|-----|-------|
| skyTop | `#081A2A` | Sky gradient top |
| skyHorizon | `#0C2330` | Sky gradient bottom |
| hills | `#12313A` | Distant hills fill |
| treeline | `#153844` | Distant treeline |
| midTrees | `#0F2B33` | Mid-ground trees |
| foreground | `#0B1F26` | Foreground framing |
| lakeTop | `#0B2630` | Lake surface |
| lakeBottom | `#061A22` | Lake depth |
| shore | `#071B22` | Ground/shore plane |
| moon | `#E8F1FF` | Moon disc |
| stars | `#E8F1FF` | Star fill |
| bonfireCore | `#FFB15C` | Flame core |
| bonfireGlow | `#FFCF8A` | Fire glow |
| bonfireInner | `#FFE4A8` | Inner flame |
| stone | `#2B2F33` | Firepit stones |
| logDark | `#4A2F1F` | Log shadow |
| logLight | `#5B3A24` | Log highlight |

---

### Opacity Values

| Element | Day | Night |
|---------|-----|-------|
| Vignette | **0** (OFF) | **0.06** |
| Moon halo | N/A | **0.10** |
| Moon terminator | N/A | **0.12** |
| Bonfire glow | N/A | **0.16** |
| Lake reflection | **0.10** | **0.18** |
| Sun disk | **0.08** | N/A |

---

### Layer Structure (10 Layers)

1. **Layer A - SkyLayer**: Clean gradient
2. **Layer B - MoonAndStarsLayer**: Sun (day) or moon with terminator + stars (night)
3. **Layer C - DistantHillsLayer**: Low-profile curves
4. **Layer D - DistantTreelineLayer**: Soft wavy silhouette + ellipse bumps
5. **Layer E - LakeLayer**: Clean band y=[310..520] with reflection
6. **Layer F - ShoreLayer**: Ground plane y=[430..600]
7. **Layer G - MidTreesLayer**: Rounded tree clusters, edge only
8. **Layer H - BonfireLayer**: Night only, stones + logs + flame + glow
9. **Layer I - ForegroundFrameTreesLayer**: Rounded trees, edge only
10. **Layer J - UltraSubtleVignette**: Day OFF, Night 0.06

---

### Tree Placement (Center Quiet Window Preserved)

| Layer | Left Range | Right Range | Center Clear |
|-------|------------|-------------|--------------|
| Mid Trees | x=[60..320] | x=[680..940] | ✅ x=[320..680] |
| Foreground | x=[0..220] | x=[780..1000] | ✅ x=[220..780] |

---

### Acceptance Criteria Checklist

| Criterion | Status | Notes |
|-----------|--------|-------|
| No spiky/triangle trees anywhere | ✅ | All trees use ellipse canopy blobs |
| Bonfire on ground at y~455 | ✅ | Stones + logs overlap shore layer |
| Flame is 2-layer shape (outer+inner) | ✅ | Proper flame curves, not waterdrop |
| Moon shows terminator + craters | ✅ | Shadow offset +6px, 4 crater circles |
| Stars are small varied dots | ✅ | r=0.8..1.6, opacity 0.15..0.45 |
| Center quiet window open | ✅ | Trees only at edges |
| Day vignette OFF | ✅ | opacity = 0 |
| Night vignette ≤0.07 | ✅ | opacity = 0.06 |
| Bonfire glow localized ≤0.16 | ✅ | r=110, opacity 0.16 |
| Reduced motion disables parallax + embers | ✅ | offset frozen, embers hidden |
| No console errors | ✅ | Verified clean |

---

### Parallax Factors (Unchanged)

| Layer | X Factor | Y Factor |
|-------|----------|----------|
| Sky | 0.02 | 0.02 |
| Sun/Moon | 0.03 | 0.03 |
| Hills | 0.04 | 0.03 |
| Treeline | 0.05 | 0.04 |
| Lake | 0.06 | 0.05 |
| Shore | 0.07 | 0.055 |
| Mid Trees | 0.08 | 0.06 |
| Bonfire | 0.10 | 0.06 |
| Foreground | 0.12 | 0.08 |

---

## Previous Revision History

### Revision 1 (Earlier Today)
- Initial rebuild with inline SVG
- Issue: Spiky triangle trees, floating bonfire

### Color System Refactor (Phase 1-4)
- Created color scan test
- Fixed CSS variable format
- Refactored rainbow palettes to semantic tokens
- Removed hardcoded colors

---

## Final Status

Parallax forest scene is now:
- ✅ Rounded tree silhouettes (no spikes)
- ✅ Grounded bonfire with firepit stones + crossed logs
- ✅ Proper 2-layer flame shape
- ✅ Shaded moon with terminator + craters
- ✅ Small varied star dots (not sparkles)
- ✅ Clean center quiet window for hero text
- ✅ No fog/haze overlays
- ✅ Reduced-motion compliant
