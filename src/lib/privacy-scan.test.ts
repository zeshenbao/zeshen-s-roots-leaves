/**
 * Privacy & Security Enforcement Tests
 * These tests fail if grades, sensitive identifiers, or unsafe external links are found
 */

import { describe, it, expect } from 'vitest';
import { scanContent, scanForUnsafeExternalLinks } from './privacy-scan';
import { courses, person, education, experiences, projects, publications } from './content';

describe('Privacy Enforcement', () => {
  describe('Grade Detection', () => {
    it('should detect explicit grades in parentheses', () => {
      const result = scanContent('Course completed (A)');
      expect(result.isClean).toBe(false);
      expect(result.violations[0].type).toBe('grade');
    });

    it('should detect "Grade:" pattern', () => {
      const result = scanContent('Grade: A');
      expect(result.isClean).toBe(false);
    });

    it('should detect Swedish "betyg" pattern', () => {
      const result = scanContent('betyg: B');
      expect(result.isClean).toBe(false);
    });

    it('should allow clean content', () => {
      const result = scanContent('Completed advanced mathematics course');
      expect(result.isClean).toBe(true);
    });
  });

  describe('Personnummer Detection', () => {
    it('should detect YYMMDD-XXXX format', () => {
      const result = scanContent('ID: 901231-1234');
      expect(result.isClean).toBe(false);
      expect(result.violations[0].type).toBe('personnummer');
    });

    it('should detect YYYYMMDD-XXXX format', () => {
      const result = scanContent('19901231-1234');
      expect(result.isClean).toBe(false);
    });

    it('should not flag normal dates', () => {
      const result = scanContent('Date: 2024-01-15');
      expect(result.isClean).toBe(true);
    });

    it('should not flag years', () => {
      const result = scanContent('Published in 2023');
      expect(result.isClean).toBe(true);
    });
  });

  describe('Content.ts Validation', () => {
    it('should not have grades in courses', () => {
      const courseData = JSON.stringify(courses);
      const result = scanContent(courseData, 'courses export');
      expect(result.isClean).toBe(true);
    });

    it('should not have grades in person data', () => {
      const personData = JSON.stringify(person);
      const result = scanContent(personData, 'person export');
      expect(result.isClean).toBe(true);
    });

    it('should not have grades in education', () => {
      const eduData = JSON.stringify(education);
      const result = scanContent(eduData, 'education export');
      expect(result.isClean).toBe(true);
    });

    it('should not have grades in experiences', () => {
      const expData = JSON.stringify(experiences);
      const result = scanContent(expData, 'experiences export');
      expect(result.isClean).toBe(true);
    });

    it('should not have grades in projects', () => {
      const projData = JSON.stringify(projects);
      const result = scanContent(projData, 'projects export');
      expect(result.isClean).toBe(true);
    });

    it('should not have grades in publications', () => {
      const pubData = JSON.stringify(publications);
      const result = scanContent(pubData, 'publications export');
      expect(result.isClean).toBe(true);
    });

    it('should not have personnummer in any content', () => {
      const allContent = JSON.stringify({
        courses,
        person,
        education,
        experiences,
        projects,
        publications,
      });
      const result = scanContent(allContent, 'all content');
      const personnummerViolations = result.violations.filter(
        v => v.type === 'personnummer'
      );
      expect(personnummerViolations).toHaveLength(0);
    });
  });

  describe('Course Structure Validation', () => {
    it('courses should not have a grade field', () => {
      for (const course of courses) {
        expect(course).not.toHaveProperty('grade');
        expect(course).not.toHaveProperty('betyg');
      }
    });

    it('courses should only have allowed fields', () => {
      const allowedFields = ['id', 'name', 'nameEn', 'credits', 'date', 'theme'];
      for (const course of courses) {
        const courseKeys = Object.keys(course);
        for (const key of courseKeys) {
          expect(allowedFields).toContain(key);
        }
      }
    });
  });

  describe('External Link Security', () => {
    it('should detect target="_blank" without rel="noopener noreferrer"', () => {
      const unsafeLink = '<a href="https://example.com" target="_blank">Link</a>';
      const result = scanForUnsafeExternalLinks(unsafeLink);
      expect(result.isClean).toBe(false);
      expect(result.violations[0].type).toBe('unsafe-external-link');
    });

    it('should detect target="_blank" with only noopener', () => {
      const partiallySecure = '<a href="https://example.com" target="_blank" rel="noopener">Link</a>';
      const result = scanForUnsafeExternalLinks(partiallySecure);
      expect(result.isClean).toBe(false);
    });

    it('should detect target="_blank" with only noreferrer', () => {
      const partiallySecure = '<a href="https://example.com" target="_blank" rel="noreferrer">Link</a>';
      const result = scanForUnsafeExternalLinks(partiallySecure);
      expect(result.isClean).toBe(false);
    });

    it('should allow target="_blank" with rel="noopener noreferrer"', () => {
      const safeLink = '<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>';
      const result = scanForUnsafeExternalLinks(safeLink);
      expect(result.isClean).toBe(true);
    });

    it('should allow internal links without rel attribute', () => {
      const internalLink = '<a href="#projects">View Projects</a>';
      const result = scanForUnsafeExternalLinks(internalLink);
      expect(result.isClean).toBe(true);
    });

    it('should allow mailto links without rel attribute', () => {
      const mailtoLink = '<a href="mailto:test@example.com">Email</a>';
      const result = scanForUnsafeExternalLinks(mailtoLink);
      expect(result.isClean).toBe(true);
    });
  });
});
