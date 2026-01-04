# Phase 1: Foundation (Tokens + Test)

**Status**: Ready to Start  
**Objective**: Establish tokens, utility classes, root wrappers, and regression test

---

## Prerequisites

- [x] Feature request document created
- [x] Development plan created
- [ ] Review existing `src/index.css` tokens

---

## Tasks

### 1.1 Audit Existing Tokens
**File**: `src/index.css`

- [ ] Review current `:root` and `.dark` token definitions
- [ ] Identify any missing tokens from the proposed API
- [ ] Consolidate duplicates if any exist

**Expected tokens**:
```css
:root {
  --background: /* HSL */;
  --foreground: /* HSL */;
  --surface: /* HSL */;
  --surface2: /* HSL */;
  --muted: /* HSL */;
  --muted-foreground: /* HSL */;
  --border: /* HSL */;
  --accent: /* forest green HSL */;
  --accent-foreground: /* HSL */;
  --accent2: /* warm amber HSL */;
  --accent2-foreground: /* HSL */;
  --ring: /* HSL */;
}
```

### 1.2 Add Utility Classes (if missing)
**File**: `src/index.css`

Add to `@layer utilities`:
```css
@layer utilities {
  .bg-app { @apply bg-background; }
  .bg-surface { @apply bg-card; }
  .text-app { @apply text-foreground; }
  .text-muted { @apply text-muted-foreground; }
  .border-app { @apply border-border; }
  .text-accent { @apply text-primary; }
  .bg-accent { @apply bg-primary; }
}
```

### 1.3 Update Root Layout
**File**: `src/pages/Index.tsx` or `src/App.tsx`

Ensure root wrapper uses semantic classes:
```tsx
<div className="min-h-screen bg-background text-foreground">
  {/* content */}
</div>
```

### 1.4 Create Color Scan Test (TDD - RED)
**File**: `src/lib/color-scan.test.ts`

```ts
/**
 * Color Regression Scan Test
 * Ensures no ad-hoc colors exist outside allowlisted files
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

const ALLOWLIST = [
  'src/index.css',
  'tailwind.config.ts',
  'src/components/ParallaxForestScene.tsx',
  'src/components/ReadabilityOverlay.tsx',
];

const FORBIDDEN_PATTERNS = [
  /hsl\s*\(/gi,
  /rgb\s*\(/gi,
  /#[0-9a-fA-F]{3,8}\b/g,
  /(text|bg|border)-(red|blue|green|emerald|teal|cyan|purple|pink|orange|yellow)-\d+/gi,
];

describe('Color System Regression', () => {
  it('should not have ad-hoc colors outside allowlist', async () => {
    const files = await glob('src/**/*.{ts,tsx,css}', { ignore: ['node_modules/**'] });
    const violations: { file: string; matches: string[] }[] = [];

    for (const file of files) {
      const relativePath = file.replace(/\\/g, '/');
      if (ALLOWLIST.some(allowed => relativePath.includes(allowed))) continue;

      const content = fs.readFileSync(file, 'utf-8');
      const matches: string[] = [];

      for (const pattern of FORBIDDEN_PATTERNS) {
        const found = content.match(pattern);
        if (found) matches.push(...found);
      }

      if (matches.length > 0) {
        violations.push({ file: relativePath, matches });
      }
    }

    if (violations.length > 0) {
      console.log('Color violations found:');
      violations.forEach(v => {
        console.log(`  ${v.file}: ${v.matches.join(', ')}`);
      });
    }

    expect(violations).toEqual([]);
  });
});
```

### 1.5 Run Test (Expect FAIL)
```bash
npm run test -- color-scan
```

**Expected**: Test FAILS, showing violations in ecosystem/components

---

## Verification Checklist

- [ ] Tokens consolidated in `src/index.css`
- [ ] Utility classes added
- [ ] Root layout uses `bg-background text-foreground`
- [ ] Color scan test created
- [ ] Test runs and reports violations (RED state)

---

## Output

After Phase 1:
- Updated `src/index.css` (if changes needed)
- New `src/lib/color-scan.test.ts`
- List of violations to fix in Phase 2/3

---

## Next Phase

→ [Phase 2: UI Component Refactor](./phase_2.md) *(to be created)*
