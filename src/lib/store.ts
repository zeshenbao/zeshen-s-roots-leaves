import { create } from 'zustand';

interface FeatureFlags {
  backgroundEnabled: boolean;
  skillTreeEnabled: boolean;
  reducedMotion: boolean;
}

interface PortfolioState {
  // Navigation
  activeSection: string;
  setActiveSection: (section: string) => void;
  
  // Skill Tree
  selectedRoot: string | null;
  selectedLeaf: string | null;
  hoveredNode: string | null;
  setSelectedRoot: (id: string | null) => void;
  setSelectedLeaf: (id: string | null) => void;
  setHoveredNode: (id: string | null) => void;
  
  // Command palette
  commandPaletteOpen: boolean;
  setCommandPaletteOpen: (open: boolean) => void;
  
  // Side panel
  sidePanelOpen: boolean;
  sidePanelContent: { type: 'root' | 'leaf'; id: string } | null;
  openSidePanel: (content: { type: 'root' | 'leaf'; id: string }) => void;
  closeSidePanel: () => void;
  
  // Feature flags
  featureFlags: FeatureFlags;
  toggleFeatureFlag: (flag: keyof FeatureFlags) => void;
  
  // Performance tier
  performanceTier: 'low' | 'medium' | 'high';
  setPerformanceTier: (tier: 'low' | 'medium' | 'high') => void;
}

// Detect reduced motion preference
const prefersReducedMotion = typeof window !== 'undefined' 
  ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
  : false;

// Detect performance capabilities
const detectPerformanceTier = (): 'low' | 'medium' | 'high' => {
  if (typeof navigator === 'undefined') return 'medium';
  
  const memory = (navigator as any).deviceMemory;
  const cores = navigator.hardwareConcurrency;
  
  if (memory && memory < 4) return 'low';
  if (cores && cores < 4) return 'low';
  if (memory && memory >= 8 && cores && cores >= 8) return 'high';
  
  return 'medium';
};

export const usePortfolioStore = create<PortfolioState>((set) => ({
  // Navigation
  activeSection: 'home',
  setActiveSection: (section) => set({ activeSection: section }),
  
  // Skill Tree
  selectedRoot: null,
  selectedLeaf: null,
  hoveredNode: null,
  setSelectedRoot: (id) => set({ selectedRoot: id }),
  setSelectedLeaf: (id) => set({ selectedLeaf: id }),
  setHoveredNode: (id) => set({ hoveredNode: id }),
  
  // Command palette
  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  
  // Side panel
  sidePanelOpen: false,
  sidePanelContent: null,
  openSidePanel: (content) => set({ sidePanelOpen: true, sidePanelContent: content }),
  closeSidePanel: () => set({ sidePanelOpen: false, sidePanelContent: null }),
  
  // Feature flags
  featureFlags: {
    backgroundEnabled: !prefersReducedMotion,
    skillTreeEnabled: true,
    reducedMotion: prefersReducedMotion,
  },
  toggleFeatureFlag: (flag) => set((state) => ({
    featureFlags: {
      ...state.featureFlags,
      [flag]: !state.featureFlags[flag],
    },
  })),
  
  // Performance tier
  performanceTier: detectPerformanceTier(),
  setPerformanceTier: (tier) => set({ performanceTier: tier }),
}));

// Analytics hook placeholder (no tracking by default)
export const useAnalytics = () => {
  const trackEvent = (event: string, properties?: Record<string, any>) => {
    // Analytics disabled by default - implement when needed
    if (import.meta.env.DEV) {
      console.log('[Analytics]', event, properties);
    }
  };
  
  return { trackEvent };
};
