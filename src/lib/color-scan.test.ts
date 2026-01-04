/**
 * Color Regression Scan Test
 * Ensures no ad-hoc colors exist outside allowlisted files
 * TDD: This test should FAIL initially (RED), then PASS after refactor (GREEN)
 */

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

// Files that are allowed to contain raw color values
const ALLOWLIST = [
  'index.css',
  'tailwind.config.ts',
  'ParallaxForestScene.tsx', // Scene-specific art colors
  'ReadabilityOverlay.tsx', // Scrim gradients
  'color-scan.test.ts', // This test file
];

// Patterns that indicate ad-hoc colors
const FORBIDDEN_PATTERNS: { pattern: RegExp; description: string }[] = [
  { pattern: /hsl\s*\(\s*\d/gi, description: 'hsl() color' },
  { pattern: /rgb\s*\(\s*\d/gi, description: 'rgb() color' },
  { pattern: /rgba\s*\(\s*\d/gi, description: 'rgba() color' },
  { pattern: /#[0-9a-fA-F]{3,8}\b/g, description: 'hex color' },
  { 
    pattern: /(text|bg|border|ring)-(red|blue|green|emerald|teal|cyan|purple|pink|orange|yellow|indigo|violet|fuchsia|rose|lime|sky|amber)-\d+/gi, 
    description: 'Tailwind palette class' 
  },
];

// Recursively get all files in a directory
function getAllFiles(dirPath: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        // Skip node_modules and other non-source directories
        if (!['node_modules', 'dist', '.git', 'public'].includes(item)) {
          files.push(...getAllFiles(fullPath, extensions));
        }
      } else if (stat.isFile()) {
        const ext = path.extname(item);
        if (extensions.includes(ext)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Directory doesn't exist or can't be read
  }
  
  return files;
}

// Check if a file is in the allowlist
function isAllowlisted(filePath: string): boolean {
  const fileName = path.basename(filePath);
  return ALLOWLIST.some(allowed => 
    filePath.includes(allowed) || fileName === allowed
  );
}

// Scan a file for forbidden patterns
function scanFile(filePath: string): { file: string; violations: { match: string; description: string; line: number }[] } | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  const violations: { match: string; description: string; line: number }[] = [];
  
  lines.forEach((line, lineIndex) => {
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) return;
    
    for (const { pattern, description } of FORBIDDEN_PATTERNS) {
      // Reset regex state
      pattern.lastIndex = 0;
      const matches = line.match(pattern);
      
      if (matches) {
        matches.forEach(match => {
          violations.push({
            match,
            description,
            line: lineIndex + 1,
          });
        });
      }
    }
  });
  
  return violations.length > 0 ? { file: filePath, violations } : null;
}

describe('Color System Regression', () => {
  it('should not have ad-hoc colors outside allowlist', () => {
    const srcPath = path.resolve(__dirname, '..');
    const files = getAllFiles(srcPath, ['.ts', '.tsx', '.css']);
    
    const allViolations: { file: string; violations: { match: string; description: string; line: number }[] }[] = [];
    
    for (const file of files) {
      if (isAllowlisted(file)) continue;
      
      const result = scanFile(file);
      if (result) {
        allViolations.push(result);
      }
    }
    
    // Log violations for debugging
    if (allViolations.length > 0) {
      console.log('\n🎨 COLOR VIOLATIONS FOUND:\n');
      console.log('=' .repeat(60));
      
      let totalCount = 0;
      
      for (const { file, violations } of allViolations) {
        const relativePath = file.replace(srcPath, 'src');
        console.log(`\n📄 ${relativePath}`);
        
        for (const { match, description, line } of violations) {
          console.log(`   Line ${line}: "${match}" (${description})`);
          totalCount++;
        }
      }
      
      console.log('\n' + '=' .repeat(60));
      console.log(`\n❌ Total: ${totalCount} violations in ${allViolations.length} files\n`);
      console.log('To fix: Replace with semantic tokens (--primary, --accent, etc.)\n');
    }
    
    // This assertion will fail if violations exist (RED state)
    expect(allViolations, 'Ad-hoc colors found outside allowlist').toEqual([]);
  });

  it('should have required tokens defined in index.css', () => {
    const indexCssPath = path.resolve(__dirname, '..', 'index.css');
    const content = fs.readFileSync(indexCssPath, 'utf-8');
    
    const requiredTokens = [
      '--background',
      '--foreground',
      '--primary',
      '--secondary',
      '--muted',
      '--accent',
      '--border',
    ];
    
    const missingTokens = requiredTokens.filter(token => !content.includes(token));
    
    if (missingTokens.length > 0) {
      console.log('\n⚠️ Missing tokens in index.css:', missingTokens.join(', '));
    }
    
    expect(missingTokens, 'Required tokens missing from index.css').toEqual([]);
  });
});
