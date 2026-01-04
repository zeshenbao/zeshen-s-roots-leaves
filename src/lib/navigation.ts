// Navigation utilities for deep linking between sections
// PRIVACY: No grades, no sensitive identifiers

import { useCallback } from 'react';
import { usePortfolioStore } from '@/lib/store';

interface ScrollToOptions {
  offset?: number;
  highlight?: boolean;
  highlightDuration?: number;
}

/**
 * Scroll to an anchor element with smooth scrolling and optional highlight
 */
export function scrollToAnchor(
  id: string, 
  options: ScrollToOptions = {}
): boolean {
  const { offset = 80, highlight = true, highlightDuration = 1500 } = options;
  
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`[Navigation] Element with id "${id}" not found`);
    return false;
  }

  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Calculate scroll position with offset for fixed header
  const elementPosition = element.getBoundingClientRect().top + window.scrollY;
  const offsetPosition = elementPosition - offset;

  // Scroll to element
  window.scrollTo({
    top: offsetPosition,
    behavior: prefersReducedMotion ? 'auto' : 'smooth'
  });

  // Apply temporary highlight effect
  if (highlight && !prefersReducedMotion) {
    element.classList.add('ecosystem-highlight-ring');
    element.setAttribute('tabindex', '-1');
    element.focus({ preventScroll: true });
    
    setTimeout(() => {
      element.classList.remove('ecosystem-highlight-ring');
    }, highlightDuration);
  }

  return true;
}

/**
 * Open the course drawer and scroll to a specific course
 */
export function openCourseDrawer(
  courseId: string,
  openDrawerFn: (isOpen: boolean) => void
): void {
  // Open the drawer first
  openDrawerFn(true);
  
  // Wait for drawer to render, then scroll to course
  setTimeout(() => {
    const courseElement = document.getElementById(`course-${courseId}`);
    if (courseElement) {
      courseElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      courseElement.classList.add('ecosystem-highlight-ring');
      
      setTimeout(() => {
        courseElement.classList.remove('ecosystem-highlight-ring');
      }, 1500);
    }
  }, 300);
}

/**
 * Hook for navigation from Skill Ecosystem to other sections
 */
export function useEcosystemNavigation() {
  const { closeSidePanel } = usePortfolioStore();

  const navigateToProject = useCallback((projectId: string) => {
    closeSidePanel();
    
    // Small delay to allow panel close animation
    setTimeout(() => {
      const success = scrollToAnchor(`project-${projectId}`, { 
        offset: 100,
        highlight: true 
      });
      
      if (!success) {
        // Fallback: scroll to projects section
        scrollToAnchor('projects', { highlight: false });
      }
    }, 150);
  }, [closeSidePanel]);

  const navigateToExperience = useCallback((experienceId: string) => {
    closeSidePanel();
    
    setTimeout(() => {
      const success = scrollToAnchor(`exp-${experienceId}`, { 
        offset: 100,
        highlight: true 
      });
      
      if (!success) {
        // Fallback: scroll to experience section
        scrollToAnchor('experience', { highlight: false });
      }
    }, 150);
  }, [closeSidePanel]);

  const navigateToCourse = useCallback((courseId: string, openDrawerFn: (isOpen: boolean) => void) => {
    closeSidePanel();
    
    setTimeout(() => {
      // First scroll to academics section
      scrollToAnchor('academics', { highlight: false, offset: 100 });
      
      // Then open drawer and scroll to course
      setTimeout(() => {
        openCourseDrawer(courseId, openDrawerFn);
      }, 300);
    }, 150);
  }, [closeSidePanel]);

  const navigateToPublication = useCallback((publicationId: string) => {
    closeSidePanel();
    
    // Publications are typically in the projects section or a dedicated area
    setTimeout(() => {
      const success = scrollToAnchor(`pub-${publicationId}`, { 
        offset: 100,
        highlight: true 
      });
      
      if (!success) {
        // Fallback: scroll to projects section (where publications often appear)
        scrollToAnchor('projects', { highlight: false });
      }
    }, 150);
  }, [closeSidePanel]);

  return {
    navigateToProject,
    navigateToExperience,
    navigateToCourse,
    navigateToPublication,
  };
}

/**
 * Get the navigation target for a leaf node
 */
export function getLeafNavigationTarget(leaf: {
  evidenceType: 'project' | 'experience' | 'publication';
  evidenceId: string;
}): { type: 'project' | 'experience' | 'course' | 'publication'; id: string; sectionId: string } | null {
  switch (leaf.evidenceType) {
    case 'project':
      return { type: 'project', id: leaf.evidenceId, sectionId: 'projects' };
    case 'experience':
      return { type: 'experience', id: leaf.evidenceId, sectionId: 'experience' };
    case 'publication':
      return { type: 'publication', id: leaf.evidenceId, sectionId: 'projects' };
    default:
      return null;
  }
}
