import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import * as d3 from 'd3-force';
import { zoom, zoomIdentity, ZoomBehavior, ZoomTransform } from 'd3-zoom';
import { select } from 'd3-selection';
import 'd3-transition';
import { useInView } from 'react-intersection-observer';
import { 
  treeRoots, treeTrunk, treeBranches, treeLeaves, treeEdges,
  getLeavesByBranch, getLeafEvidence,
  type RootNode, type TrunkNode, type BranchNode, type LeafNode
} from '@/lib/content';
import { usePortfolioStore } from '@/lib/store';
import { useEcosystemNavigation, getLeafNavigationTarget } from '@/lib/navigation';
import {
  getVisibleGraph,
  getConnectedRootsForLeaf,
  getConnectedLeavesForRoot,
  getBranchForLeaf,
  getNodeType,
  type ViewMode,
  type VisibleGraph
} from '@/lib/ecosystem-graph';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  X, Sparkles, GitBranch, Leaf, CircleDot, RotateCcw, Command, Eye, EyeOff, 
  FileText, Briefcase, BookOpen, ZoomIn, ZoomOut, ExternalLink, ArrowUpRight,
  ChevronRight, Layers, Focus
} from 'lucide-react';
import {
  generateRootPath,
  generateTrunkPath,
  generateBranchPath,
  generateTwigPath,
  LeafShape,
  GlowFilter,
} from '@/components/ecosystem/TreeSVGHelpers';

// ============ TYPES ============
interface VisualNode {
  id: string;
  name: string;
  type: 'root' | 'trunk' | 'branch' | 'leaf';
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
  layer: number;
  color: string;
  isFruit?: boolean;
  data: RootNode | TrunkNode | BranchNode | LeafNode;
  branchIndex?: number;
  leafIndex?: number;
}

interface VisualLink {
  source: string;
  target: string;
  type: 'feeds' | 'produces';
}

// Semantic token-based colors - using CSS variables
// All node types use the same tokens for consistency
// Node differentiation via shape/icon, not rainbow colors
const NODE_STYLES = {
  // All roots use primary token
  root: 'hsl(var(--primary))',
  // Trunk uses muted earth tone
  trunk: 'hsl(var(--muted-foreground) / 0.6)',
  // Branches use primary at lower opacity
  branch: 'hsl(var(--primary) / 0.8)',
  // Leaves use primary
  leaf: 'hsl(var(--primary))',
  // Fruits (featured) use secondary (amber accent)
  fruit: 'hsl(var(--secondary))',
};

// Get node fill color - unified approach
const getNodeColor = (type: 'root' | 'trunk' | 'branch' | 'leaf', isFruit?: boolean): string => {
  if (isFruit) return NODE_STYLES.fruit;
  return NODE_STYLES[type];
};

const STROKE_WIDTHS = {
  root: 8,
  trunk: 16,
  branch: 6,
  twig: 2,
};

// ============ COMPONENT ============
export function SkillEcosystemSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  const [dimensions, setDimensions] = useState({ width: 900, height: 700 });
  const [nodes, setNodes] = useState<VisualNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'growing' | 'blooming' | 'glowing' | 'complete'>('idle');
  const [isInitialized, setIsInitialized] = useState(false);
  const [transform, setTransform] = useState<ZoomTransform>(zoomIdentity);
  
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [showAllWhileFocused, setShowAllWhileFocused] = useState(false);
  
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const { navigateToProject, navigateToExperience } = useEcosystemNavigation();
  
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  
  useEffect(() => {
    if (inView && !isInitialized) {
      const timeoutId = setTimeout(() => setIsInitialized(true), 100);
      return () => clearTimeout(timeoutId);
    }
  }, [inView, isInitialized]);
  
  const { 
    selectedRoot, 
    setSelectedRoot, 
    selectedLeaf, 
    setSelectedLeaf,
    featureFlags,
    performanceTier,
    sidePanelOpen,
    openSidePanel,
    closeSidePanel,
    sidePanelContent
  } = usePortfolioStore();

  // Layout dimensions
  const soilY = dimensions.height - 100;
  const trunkBaseY = soilY - 10;
  const trunkTopY = dimensions.height * 0.45;
  const branchY = dimensions.height * 0.38;
  const canopyY = dimensions.height * 0.18;

  // Build initial nodes
  const initialNodes = useMemo<VisualNode[]>(() => {
    const allNodes: VisualNode[] = [];
    const { width } = dimensions;
    const centerX = width / 2;

    // Roots
    treeRoots.forEach((root, i) => {
      const xSpacing = width / (treeRoots.length + 1);
      allNodes.push({
        id: root.id,
        name: root.name,
        type: 'root',
        x: xSpacing * (i + 1),
        y: soilY + 40,
        layer: 0,
        color: getNodeColor('root'),
        data: root,
      });
    });

    // Trunk
    allNodes.push({
      id: treeTrunk.id,
      name: treeTrunk.name,
      type: 'trunk',
      x: centerX,
      y: trunkTopY,
      layer: 1,
      color: getNodeColor('trunk'),
      data: treeTrunk,
    });

    // Branches
    treeBranches.forEach((branch, i) => {
      const angleSpread = Math.PI * 0.8;
      const startAngle = -Math.PI / 2 - angleSpread / 2;
      const angle = startAngle + (i / (treeBranches.length - 1 || 1)) * angleSpread;
      const radius = width * 0.22;
      
      allNodes.push({
        id: branch.id,
        name: branch.name,
        type: 'branch',
        x: centerX + Math.cos(angle) * radius,
        y: branchY + Math.sin(angle) * 30,
        layer: 2,
        color: getNodeColor('branch'),
        data: branch,
        branchIndex: i,
      });
    });

    // Leaves
    const leafCountByBranch: Record<string, number> = {};
    treeLeaves.forEach((leaf) => {
      leafCountByBranch[leaf.branchId] = (leafCountByBranch[leaf.branchId] || 0) + 1;
    });

    const leafIndexByBranch: Record<string, number> = {};
    treeLeaves.forEach((leaf, globalIndex) => {
      const branchIndex = treeBranches.findIndex(b => b.id === leaf.branchId);
      if (branchIndex === -1) return;

      const branch = treeBranches[branchIndex];
      const branchNode = allNodes.find(n => n.id === branch.id);
      if (!branchNode) return;

      leafIndexByBranch[leaf.branchId] = (leafIndexByBranch[leaf.branchId] || 0);
      const leafIndex = leafIndexByBranch[leaf.branchId]++;
      const totalLeavesInBranch = leafCountByBranch[leaf.branchId];

      const arcSpread = Math.PI * 0.5;
      const branchAngle = Math.atan2(branchNode.y - trunkTopY, branchNode.x - centerX);
      const leafAngle = branchAngle - arcSpread / 2 + (leafIndex / Math.max(1, totalLeavesInBranch - 1)) * arcSpread;
      
      const radiusBase = 90 + leafIndex * 35;
      const radius = radiusBase + Math.sin(globalIndex * 1.5) * 25;

      const leafColor = getNodeColor('leaf', leaf.isFruit);

      allNodes.push({
        id: leaf.id,
        name: leaf.name,
        type: 'leaf',
        x: branchNode.x + Math.cos(leafAngle) * radius,
        y: canopyY + Math.sin(leafAngle + Math.PI / 2) * 40 + leafIndex * 20,
        layer: 3,
        color: leafColor,
        isFruit: leaf.isFruit,
        data: leaf,
        branchIndex,
        leafIndex,
      });
    });

    return allNodes;
  }, [dimensions, soilY, trunkTopY, branchY, canopyY]);

  // Build visual links
  const links = useMemo<VisualLink[]>(() => {
    return treeEdges.map(edge => ({
      source: edge.source,
      target: edge.target,
      type: edge.type === 'produces' ? 'produces' : 'feeds',
    }));
  }, []);

  // Update dimensions
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: Math.max(rect.width, 320), 
          height: Math.min(Math.max(rect.height, 550), 800) 
        });
      }
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Pan/zoom setup
  useEffect(() => {
    if (!svgRef.current || !isInitialized) return;

    const svg = select(svgRef.current);
    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.6, 2.5])
      .on('zoom', (event) => setTransform(event.transform));

    svg.call(zoomBehavior);
    zoomBehaviorRef.current = zoomBehavior;

    return () => { svg.on('.zoom', null); };
  }, [isInitialized]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 1.3);
  }, []);

  const handleZoomOut = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.scaleBy, 0.7);
  }, []);

  const handleZoomReset = useCallback(() => {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select(svgRef.current).transition().duration(300).call(zoomBehaviorRef.current.transform, zoomIdentity);
  }, []);

  // Force simulation
  useEffect(() => {
    if (featureFlags.reducedMotion || prefersReducedMotion) {
      setNodes(initialNodes);
      setAnimationPhase('complete');
      return;
    }

    const nodesCopy = initialNodes.map(n => ({ ...n }));
    nodesCopy.forEach(node => {
      if (node.type !== 'leaf') node.fy = node.y;
    });

    const simulation = d3.forceSimulation(nodesCopy as any)
      .force('collide', d3.forceCollide().radius((d: any) => {
        if (d.type === 'leaf') return 40;
        if (d.type === 'branch') return 50;
        return 35;
      }).strength(0.8))
      .force('x', d3.forceX((d: any) => d.x).strength(0.1))
      .force('y', d3.forceY((d: any) => d.y).strength(0.15))
      .alpha(0.4)
      .alphaDecay(0.03);

    simulation.on('tick', () => {
      setNodes(nodesCopy.map(n => ({
        ...n,
        x: Math.max(60, Math.min(dimensions.width - 60, n.x)),
        y: n.fy ?? Math.max(40, Math.min(dimensions.height - 40, n.y)),
      })));
    });

    simulation.on('end', () => {
      if (!featureFlags.reducedMotion && !prefersReducedMotion) {
        setAnimationPhase('growing');
        setTimeout(() => setAnimationPhase('blooming'), 800);
        setTimeout(() => setAnimationPhase('glowing'), 1400);
        setTimeout(() => setAnimationPhase('complete'), 2400);
      }
    });

    return () => { simulation.stop(); };
  }, [initialNodes, dimensions, featureFlags.reducedMotion, prefersReducedMotion]);

  // Compute visible graph based on current state
  const visibleGraph = useMemo<VisibleGraph | null>(() => {
    const selectedNodeId = selectedLeaf || selectedRoot;
    const selectedNodeType = selectedNodeId ? getNodeType(selectedNodeId) : null;
    
    return getVisibleGraph({
      viewMode,
      selectedNodeId,
      selectedNodeType,
      showAllWhileFocused,
    });
  }, [viewMode, selectedLeaf, selectedRoot, showAllWhileFocused]);

  // Check if a node is visible
  const isNodeVisible = useCallback((nodeId: string): boolean => {
    if (!visibleGraph) return true; // null means show all
    return visibleGraph.nodeIds.has(nodeId);
  }, [visibleGraph]);

  // Check if an edge is visible
  const isEdgeVisible = useCallback((edgeId: string): boolean => {
    if (!visibleGraph) return true;
    return visibleGraph.edgeIds.has(edgeId);
  }, [visibleGraph]);

  // Handle node click - auto-switch to focus mode
  const handleNodeClick = useCallback((node: VisualNode) => {
    if (node.type === 'root') {
      const isDeselecting = selectedRoot === node.id;
      setSelectedRoot(isDeselecting ? null : node.id);
      setSelectedLeaf(null);
      if (!isDeselecting) {
        setViewMode('focus');
        openSidePanel({ type: 'root', id: node.id });
      } else {
        closeSidePanel();
      }
    } else if (node.type === 'leaf') {
      const isDeselecting = selectedLeaf === node.id;
      setSelectedLeaf(isDeselecting ? null : node.id);
      setSelectedRoot(null);
      if (!isDeselecting) {
        setViewMode('focus');
        openSidePanel({ type: 'leaf', id: node.id });
      } else {
        closeSidePanel();
      }
    } else if (node.type === 'branch') {
      setSelectedRoot(null);
      setSelectedLeaf(null);
      setViewMode('focus');
      openSidePanel({ type: 'branch', id: node.id });
    }
  }, [selectedRoot, selectedLeaf, setSelectedRoot, setSelectedLeaf, openSidePanel, closeSidePanel]);

  // Reset view
  const resetView = useCallback(() => {
    setSelectedRoot(null);
    setSelectedLeaf(null);
    setHoveredNode(null);
    setViewMode('overview');
    closeSidePanel();
    handleZoomReset();
  }, [setSelectedRoot, setSelectedLeaf, closeSidePanel, handleZoomReset]);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetView]);

  // Click-away handler
  useEffect(() => {
    if (!sidePanelOpen) return;
    
    const handleClickAway = (e: MouseEvent) => {
      const target = e.target as Element;
      if (panelRef.current?.contains(target)) return;
      if (target.closest('.node-interactive')) return;
      if (target.closest('.ecosystem-controls')) return;
      
      resetView();
    };
    
    const timeoutId = setTimeout(() => {
      document.addEventListener('click', handleClickAway);
    }, 100);
    
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleClickAway);
    };
  }, [sidePanelOpen, resetView]);

  // Panel data
  const panelData = useMemo(() => {
    if (!sidePanelContent) return null;
    
    if (sidePanelContent.type === 'root') {
      const root = treeRoots.find(r => r.id === sidePanelContent.id);
      if (root) {
        const leaves = getConnectedLeavesForRoot(root.id);
        return { nodeType: 'root' as const, root, leaves };
      }
    } else if (sidePanelContent.type === 'branch') {
      const branch = treeBranches.find(b => b.id === sidePanelContent.id);
      if (branch) {
        const roots = treeRoots.filter(r => branch.rootIds.includes(r.id));
        const leaves = getLeavesByBranch(branch.id);
        return { nodeType: 'branch' as const, branch, roots, leaves };
      }
    } else {
      const leaf = treeLeaves.find(l => l.id === sidePanelContent.id);
      if (leaf) {
        const evidence = getLeafEvidence(leaf);
        const branch = getBranchForLeaf(leaf.id);
        const roots = getConnectedRootsForLeaf(leaf.id);
        return { nodeType: 'leaf' as const, leaf, evidence, branch, roots };
      }
    }
    return null;
  }, [sidePanelContent]);

  // Trunk geometry
  const trunkGeometry = useMemo(() => {
    return generateTrunkPath(dimensions.width / 2, trunkBaseY, dimensions.width / 2, trunkTopY, 24, 12);
  }, [dimensions.width, trunkBaseY, trunkTopY]);

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'project': return FileText;
      case 'experience': return Briefcase;
      case 'publication': return BookOpen;
      default: return Leaf;
    }
  };

  const handleDeepLink = useCallback((leaf: LeafNode) => {
    const target = getLeafNavigationTarget(leaf);
    if (!target) return;
    
    switch (target.type) {
      case 'project':
        navigateToProject(target.id);
        break;
      case 'experience':
        navigateToExperience(target.id);
        break;
    }
  }, [navigateToProject, navigateToExperience]);

  const hasSelection = selectedRoot || selectedLeaf;
  const isFocusMode = viewMode === 'focus' && hasSelection;

  return (
    <section 
      id="ecosystem" 
      ref={inViewRef}
      className="relative section-container-alt min-h-screen"
      aria-labelledby="ecosystem-heading"
    >
      <div className="section-inner">
        {/* Header */}
        <div className="section-header-centered mb-6">
          <h2 id="ecosystem-heading" className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
            Skill Ecosystem
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mx-auto text-center max-w-2xl leading-relaxed">
            Click any node to focus on its connections. 
            <span className="text-primary ml-1">★ Golden leaves are top outcomes.</span>
          </p>
        </div>

        {/* Loading */}
        {!isInitialized && (
          <div className="relative w-full h-[600px] md:h-[700px] glass-card rounded-2xl overflow-hidden flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading skill tree...</p>
            </div>
          </div>
        )}

        {/* Main Visualization */}
        {isInitialized && (
          <div 
            ref={containerRef}
            className="relative w-full h-[600px] md:h-[700px] glass-card rounded-2xl overflow-hidden"
            style={{ border: '1px solid hsl(var(--border) / 0.3)' }}
          >
            {/* Controls */}
            <div className="ecosystem-controls absolute top-4 right-4 z-20 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-lg p-1.5 shadow-sm border border-border/30">
              {/* View mode toggle */}
              <div className="flex items-center border-r border-border/30 pr-2 mr-1">
                <Button
                  variant={viewMode === 'overview' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    setViewMode('overview');
                    setSelectedRoot(null);
                    setSelectedLeaf(null);
                    closeSidePanel();
                  }}
                  className="text-xs h-8 gap-1"
                  aria-label="Overview mode"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Overview</span>
                </Button>
                <Button
                  variant={viewMode === 'focus' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('focus')}
                  className="text-xs h-8 gap-1"
                  aria-label="Focus mode"
                  disabled={!hasSelection}
                >
                  <Focus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Focus</span>
                </Button>
              </div>

              {/* Show all toggle (only in focus mode) */}
              {isFocusMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllWhileFocused(!showAllWhileFocused)}
                  className="text-xs gap-1.5 h-8"
                  aria-label={showAllWhileFocused ? 'Hide unrelated nodes' : 'Show all nodes'}
                >
                  {showAllWhileFocused ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  <span className="hidden sm:inline">{showAllWhileFocused ? 'Hide others' : 'Show all'}</span>
                </Button>
              )}

              {/* Zoom controls */}
              <div className="flex items-center border-l border-border/30 pl-2 ml-1">
                <Button variant="ghost" size="icon" onClick={handleZoomIn} className="h-8 w-8" aria-label="Zoom in">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleZoomOut} className="h-8 w-8" aria-label="Zoom out">
                  <ZoomOut className="w-4 h-4" />
                </Button>
              </div>
              
              <Button variant="ghost" size="sm" onClick={resetView} className="text-xs gap-1.5 h-8" aria-label="Reset view">
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </Button>
              
              <div className="text-xs text-muted-foreground px-2 hidden lg:flex items-center gap-1">
                <Command className="w-3 h-3" />K
              </div>
            </div>

            {/* Legend - using semantic token classes */}
            <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-3 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-border/30">
              <div className="flex items-center gap-1.5">
                <CircleDot className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">Roots</span>
              </div>
              <div className="flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-primary/80" />
                <span className="font-medium">Branches</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium">Leaves</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-secondary" />
                <span className="font-medium">Top</span>
              </div>
            </div>

            {/* Focus mode indicator */}
            {isFocusMode && (
              <div className="absolute bottom-4 left-4 z-20 bg-primary/10 border border-primary/30 text-primary text-xs px-3 py-1.5 rounded-lg flex items-center gap-2">
                <Focus className="w-3.5 h-3.5" />
                Focus mode: showing connected path only
              </div>
            )}

            <svg
              ref={svgRef}
              width={dimensions.width}
              height={dimensions.height}
              className="w-full h-full cursor-grab active:cursor-grabbing"
              role="img"
              aria-label="Skill ecosystem tree visualization"
            >
              <defs>
                {/* Gradients use muted earth tones - scene-specific art (allowlisted) */}
                <linearGradient id="soil-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="hsl(var(--muted))" stopOpacity="0.4" />
                  <stop offset="40%" stopColor="hsl(var(--muted))" stopOpacity="0.6" />
                  <stop offset="100%" stopColor="hsl(var(--muted))" stopOpacity="0.8" />
                </linearGradient>
                
                <linearGradient id="trunk-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--muted-foreground) / 0.5)" />
                  <stop offset="50%" stopColor="hsl(var(--muted-foreground) / 0.4)" />
                  <stop offset="100%" stopColor="hsl(var(--muted-foreground) / 0.3)" />
                </linearGradient>
                
                <linearGradient id="branch-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="hsl(var(--primary) / 0.6)" />
                  <stop offset="100%" stopColor="hsl(var(--primary) / 0.8)" />
                </linearGradient>

                {/* Glow filters using semantic tokens */}
                <GlowFilter id="glow-primary" color="hsl(var(--primary))" />
                <GlowFilter id="glow-fruit" color="hsl(var(--secondary))" />
                <GlowFilter id="glow-selection" color="hsl(var(--secondary))" />
                <GlowFilter id="glow-path" color="hsl(var(--primary))" />
                
                <filter id="leaf-shadow">
                  <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.25" />
                </filter>
              </defs>

              <g ref={gRef} transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
                {/* Soil */}
                <rect x="0" y={soilY} width={dimensions.width} height={dimensions.height - soilY} fill="url(#soil-gradient)" />
                <line x1="0" y1={soilY} x2={dimensions.width} y2={soilY} stroke="hsl(var(--border))" strokeWidth="3" strokeDasharray="12 6" opacity="0.5" />

                {/* Root paths - only render if visible */}
                <g className="roots">
                  {nodes.filter(n => n.type === 'root').map((rootNode, i) => {
                    const trunkNode = nodes.find(n => n.type === 'trunk');
                    if (!trunkNode) return null;
                    
                    // In focus mode, hide non-visible nodes completely
                    if (isFocusMode && !showAllWhileFocused && !isNodeVisible(rootNode.id)) {
                      return null;
                    }
                    
                    const isHighlighted = isNodeVisible(rootNode.id);
                    const path = generateRootPath(rootNode.x, rootNode.y, dimensions.width / 2, trunkBaseY + 10, i);

                    return (
                      <motion.path
                        key={`root-path-${rootNode.id}`}
                        d={path}
                        fill="none"
                        stroke={rootNode.color}
                        strokeWidth={isHighlighted ? STROKE_WIDTHS.root + 2 : STROKE_WIDTHS.root}
                        strokeLinecap="round"
                        strokeOpacity={isHighlighted ? 1 : 0.3}
                        filter={isFocusMode && isHighlighted ? 'url(#glow-path)' : undefined}
                        initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeInOut' }}
                      />
                    );
                  })}
                </g>

                {/* Trunk - always visible as orientation but dimmed if not in path */}
                {(viewMode === 'overview' || isNodeVisible('trunk') || showAllWhileFocused) && (
                  <motion.path
                    d={trunkGeometry.fillPath}
                    fill="url(#trunk-gradient)"
                    stroke="hsl(var(--border))"
                    strokeWidth={2}
                    opacity={isNodeVisible('trunk') ? 1 : 0.2}
                    filter={isFocusMode && isNodeVisible('trunk') ? 'url(#glow-path)' : undefined}
                    initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scaleY: 0 }}
                    animate={{ opacity: isNodeVisible('trunk') ? 1 : 0.2, scaleY: 1 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                    style={{ transformOrigin: `${dimensions.width / 2}px ${trunkBaseY}px` }}
                  />
                )}

                {/* Branch paths */}
                <g className="branches">
                  {nodes.filter(n => n.type === 'branch').map((branchNode, i) => {
                    if (isFocusMode && !showAllWhileFocused && !isNodeVisible(branchNode.id)) {
                      return null;
                    }
                    
                    const isHighlighted = isNodeVisible(branchNode.id);
                    const path = generateBranchPath(dimensions.width / 2, trunkTopY, branchNode.x, branchNode.y, 0.25 + i * 0.05);

                    return (
                      <motion.path
                        key={`branch-path-${branchNode.id}`}
                        d={path}
                        fill="none"
                        stroke="url(#branch-gradient)"
                        strokeWidth={isHighlighted ? STROKE_WIDTHS.branch + 2 : STROKE_WIDTHS.branch}
                        strokeLinecap="round"
                        strokeOpacity={isHighlighted ? 1 : 0.3}
                        filter={isFocusMode && isHighlighted ? 'url(#glow-path)' : undefined}
                        initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
                      />
                    );
                  })}
                </g>

                {/* Twigs */}
                <g className="twigs">
                  {nodes.filter(n => n.type === 'leaf').map((leafNode, i) => {
                    if (isFocusMode && !showAllWhileFocused && !isNodeVisible(leafNode.id)) {
                      return null;
                    }
                    
                    const leafData = leafNode.data as LeafNode;
                    const branchNode = nodes.find(n => n.id === leafData.branchId);
                    if (!branchNode) return null;
                    if (isFocusMode && !showAllWhileFocused && !isNodeVisible(branchNode.id)) return null;

                    const isHighlighted = isNodeVisible(leafNode.id);
                    const path = generateTwigPath(branchNode.x, branchNode.y, leafNode.x, leafNode.y, i);

                    return (
                      <motion.path
                        key={`twig-${leafNode.id}`}
                        d={path}
                        fill="none"
                        stroke="hsl(var(--primary) / 0.5)"
                        strokeWidth={isHighlighted ? STROKE_WIDTHS.twig + 1 : STROKE_WIDTHS.twig}
                        strokeLinecap="round"
                        strokeOpacity={isHighlighted ? 0.9 : 0.3}
                        filter={isFocusMode && isHighlighted ? 'url(#glow-path)' : undefined}
                        initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ delay: 1 + i * 0.03, duration: 0.3 }}
                      />
                    );
                  })}
                </g>

                {/* Root nodes */}
                <g className="root-nodes">
                  {nodes.filter(n => n.type === 'root').map((node) => {
                    if (isFocusMode && !showAllWhileFocused && !isNodeVisible(node.id)) {
                      return null;
                    }
                    
                    const isHighlighted = isNodeVisible(node.id);
                    const isSelected = selectedRoot === node.id;

                    return (
                      <motion.g
                        key={node.id}
                        className="node-interactive"
                        initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: isHighlighted ? 1 : 0.3, x: node.x, y: node.y }}
                        transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => { setHoveredNode(node.id); setTooltipPos({ x: node.x, y: node.y - 50 }); }}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => handleNodeClick(node)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Root: ${node.name}`}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNodeClick(node); } }}
                      >
                        <circle
                          r={isSelected ? 26 : 22}
                          fill={node.color}
                          stroke={isSelected ? 'hsl(var(--secondary))' : 'hsl(var(--border))'}
                          strokeWidth={isSelected ? 3 : 2}
                          filter={isSelected ? 'url(#glow-selection)' : undefined}
                        />
                        <text textAnchor="middle" dy="0.35em" fontSize={10} fill="hsl(var(--primary-foreground))" fontWeight={600} style={{ pointerEvents: 'none' }}>
                          {node.name.length > 10 ? node.name.slice(0, 9) + '…' : node.name}
                        </text>
                      </motion.g>
                    );
                  })}
                </g>

                {/* Branch nodes */}
                <g className="branch-nodes">
                  {nodes.filter(n => n.type === 'branch').map((node, i) => {
                    if (isFocusMode && !showAllWhileFocused && !isNodeVisible(node.id)) {
                      return null;
                    }
                    
                    const isHighlighted = isNodeVisible(node.id);

                    return (
                      <motion.g
                        key={node.id}
                        className="node-interactive"
                        initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: isHighlighted ? 1 : 0.3, x: node.x, y: node.y }}
                        transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => { setHoveredNode(node.id); setTooltipPos({ x: node.x, y: node.y - 40 }); }}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => handleNodeClick(node)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Branch: ${node.name}`}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNodeClick(node); } }}
                      >
                        <ellipse rx={36} ry={14} fill={node.color} stroke="hsl(var(--border))" strokeWidth={1.5} />
                        <text textAnchor="middle" dy="0.35em" fontSize={10} fill="hsl(var(--primary-foreground))" fontWeight={500} style={{ pointerEvents: 'none' }}>
                          {node.name.length > 14 ? node.name.slice(0, 13) + '…' : node.name}
                        </text>
                      </motion.g>
                    );
                  })}
                </g>

                {/* Leaf nodes */}
                <g className="leaf-nodes">
                  {nodes.filter(n => n.type === 'leaf').map((node, i) => {
                    if (isFocusMode && !showAllWhileFocused && !isNodeVisible(node.id)) {
                      return null;
                    }
                    
                    const leafData = node.data as LeafNode;
                    const isHighlighted = isNodeVisible(node.id);
                    const isSelected = selectedLeaf === node.id;
                    const EvidenceIcon = getEvidenceIcon(leafData.evidenceType);

                    return (
                      <motion.g
                        key={node.id}
                        className="node-interactive"
                        initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: isHighlighted ? 1 : 0.3 }}
                        transition={{ delay: prefersReducedMotion ? 0 : 1.2 + i * 0.04, duration: 0.4, type: 'spring', stiffness: 200 }}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => { setHoveredNode(node.id); setTooltipPos({ x: node.x, y: node.y - 55 }); }}
                        onMouseLeave={() => setHoveredNode(null)}
                        onClick={() => handleNodeClick(node)}
                        role="button"
                        tabIndex={0}
                        aria-label={`${leafData.evidenceType}: ${node.name}`}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleNodeClick(node); } }}
                      >
                        <LeafShape
                          x={node.x}
                          y={node.y}
                          width={node.isFruit ? 22 : 20}
                          height={node.isFruit ? 32 : 28}
                          rotation={(node.leafIndex || 0) * 15 - 20}
                          fill={node.color}
                          isSelected={isSelected}
                          isFruit={node.isFruit}
                          filter={isSelected ? 'url(#glow-selection)' : node.isFruit ? 'url(#glow-fruit)' : 'url(#leaf-shadow)'}
                        />
                        <text x={node.x} y={node.y + 28} textAnchor="middle" fontSize={9} fill="currentColor" className="text-foreground" fontWeight={isSelected ? 600 : 500} style={{ pointerEvents: 'none' }}>
                          {isSelected || hoveredNode === node.id 
                            ? (node.name.length > 20 ? node.name.slice(0, 19) + '…' : node.name)
                            : (node.name.length > 14 ? node.name.slice(0, 13) + '…' : node.name)
                          }
                        </text>
                        <g transform={`translate(${node.x + 14}, ${node.y - 20})`}>
                          <circle r={8} fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth={1} />
                          <foreignObject x={-6} y={-6} width={12} height={12}>
                            <EvidenceIcon className="w-3 h-3 text-muted-foreground" />
                          </foreignObject>
                        </g>
                      </motion.g>
                    );
                  })}
                </g>

                {/* Glow animation */}
                {animationPhase === 'glowing' && performanceTier !== 'low' && (
                  <motion.g initial={{ opacity: 0 }} animate={{ opacity: [0, 0.6, 0] }} transition={{ duration: 1.5, ease: 'easeInOut' }}>
                    <motion.path d={trunkGeometry.fillPath} fill="none" stroke="hsl(var(--primary))" strokeWidth={4} filter="url(#glow-primary)" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2 }} />
                  </motion.g>
                )}
              </g>
            </svg>

            {/* Tooltip */}
            <AnimatePresence>
              {hoveredNode && !sidePanelOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute pointer-events-none bg-popover/95 backdrop-blur-sm border border-border rounded-lg px-4 py-3 shadow-xl max-w-xs z-30"
                  style={{ 
                    left: Math.min(Math.max(tooltipPos.x * transform.k + transform.x, 120), dimensions.width - 120), 
                    top: Math.max(tooltipPos.y * transform.k + transform.y, 80),
                    transform: 'translateX(-50%)'
                  }}
                >
                  {(() => {
                    const node = nodes.find(n => n.id === hoveredNode);
                    if (!node) return null;
                    
                    const Icon = node.type === 'root' ? CircleDot : node.type === 'branch' ? GitBranch : node.isFruit ? Sparkles : Leaf;
                    
                    return (
                      <>
                        <div className="flex items-center gap-2 mb-1.5">
                          <Icon className="w-4 h-4 text-primary" />
                          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">{node.type}</span>
                        </div>
                        <p className="font-semibold text-foreground text-sm leading-snug">{node.name}</p>
                        {node.type === 'root' && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{(node.data as RootNode).description}</p>}
                        {node.type === 'branch' && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{(node.data as BranchNode).description}</p>}
                        {node.type === 'leaf' && <p className="text-xs text-muted-foreground mt-1.5 line-clamp-2">{(node.data as LeafNode).summary}</p>}
                        <p className="text-xs text-primary mt-2">Click to focus</p>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Side Panel */}
        <AnimatePresence>
          {sidePanelOpen && panelData && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-background/60 backdrop-blur-sm z-40 lg:hidden"
                onClick={resetView}
              />
              
              <motion.div
                ref={panelRef}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                className="fixed right-0 top-0 h-full w-full max-w-md bg-card/98 backdrop-blur-xl border-l border-border z-50 overflow-y-auto shadow-2xl"
              >
                <div className="p-6">
                  <button onClick={resetView} className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors" aria-label="Close panel (Escape)">
                    <X className="w-5 h-5" />
                  </button>

                  {panelData.nodeType === 'root' && panelData.root && (
                    <>
                      <Badge variant="outline" className="mb-4 border-primary/50 text-xs">
                        <CircleDot className="w-3 h-3 mr-1.5" />
                        Foundation
                      </Badge>
                      <h3 className="text-2xl font-display font-bold text-foreground mb-3">{panelData.root.name}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">{panelData.root.description}</p>
                      
                      {panelData.leaves && panelData.leaves.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-primary" />
                            Connected Outcomes ({panelData.leaves.length})
                          </h4>
                          <div className="space-y-2">
                            {panelData.leaves.map(leaf => (
                              <div 
                                key={leaf.id} 
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${leaf.isFruit ? 'bg-secondary/20 border border-secondary/30 hover:bg-secondary/30' : 'bg-muted/50 hover:bg-muted'}`}
                                onClick={() => { setSelectedLeaf(leaf.id); setSelectedRoot(null); openSidePanel({ type: 'leaf', id: leaf.id }); }}
                              >
                                <div className="flex items-center gap-2">
                                  {leaf.isFruit && <Sparkles className="w-4 h-4 text-secondary" />}
                                  <p className="font-medium text-foreground text-sm">{leaf.name}</p>
                                  <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{leaf.summary}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {panelData.nodeType === 'branch' && panelData.branch && (
                    <>
                      <Badge variant="outline" className="mb-4 border-secondary/50 text-xs">
                        <GitBranch className="w-3 h-3 mr-1.5" />
                        Branch
                      </Badge>
                      <h3 className="text-2xl font-display font-bold text-foreground mb-3">{panelData.branch.name}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">{panelData.branch.description}</p>
                      
                      {panelData.roots && panelData.roots.length > 0 && (
                        <div className="mb-6">
                          <h4 className="text-sm font-semibold text-foreground mb-3">Built on {panelData.roots.length} foundation{panelData.roots.length > 1 ? 's' : ''}</h4>
                          <div className="flex flex-wrap gap-2">
                            {panelData.roots.map(root => (
                              <Badge key={root.id} variant="secondary" className="cursor-pointer hover:bg-secondary/80" onClick={() => { setSelectedRoot(root.id); setSelectedLeaf(null); openSidePanel({ type: 'root', id: root.id }); }}>
                                {root.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {panelData.leaves && panelData.leaves.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Leaf className="w-4 h-4 text-primary" />
                            Produces ({panelData.leaves.length})
                          </h4>
                          <div className="space-y-2">
                            {panelData.leaves.map(leaf => (
                              <div 
                                key={leaf.id} 
                                className={`p-3 rounded-lg cursor-pointer transition-colors ${leaf.isFruit ? 'bg-secondary/20 border border-secondary/30 hover:bg-secondary/30' : 'bg-muted/50 hover:bg-muted'}`}
                                onClick={() => { setSelectedLeaf(leaf.id); setSelectedRoot(null); openSidePanel({ type: 'leaf', id: leaf.id }); }}
                              >
                                <div className="flex items-center gap-2">
                                  {leaf.isFruit && <Sparkles className="w-4 h-4 text-secondary" />}
                                  <p className="font-medium text-foreground text-sm">{leaf.name}</p>
                                  <ChevronRight className="w-3 h-3 text-muted-foreground ml-auto" />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">{leaf.summary}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {panelData.nodeType === 'leaf' && panelData.leaf && (
                    <>
                      <Badge variant="outline" className={panelData.leaf.isFruit ? 'mb-4 border-secondary bg-secondary/10 text-xs' : 'mb-4 text-xs'}>
                        {panelData.leaf.isFruit ? <Sparkles className="w-3 h-3 mr-1.5" /> : <Leaf className="w-3 h-3 mr-1.5" />}
                        {panelData.leaf.evidenceType}
                      </Badge>
                      <h3 className="text-2xl font-display font-bold text-foreground mb-3">{panelData.leaf.name}</h3>
                      <p className="text-muted-foreground leading-relaxed mb-6">{panelData.leaf.summary}</p>
                      
                      <Button onClick={() => handleDeepLink(panelData.leaf!)} className="w-full mb-6 gap-2" variant="default">
                        <ArrowUpRight className="w-4 h-4" />
                        View {panelData.leaf.evidenceType === 'project' ? 'Project' : panelData.leaf.evidenceType === 'experience' ? 'Experience' : 'Publication'} Details
                        <ExternalLink className="w-3 h-3 ml-auto opacity-60" />
                      </Button>
                      
                      {panelData.evidence && (
                        <div className="p-4 rounded-lg bg-muted/50 mb-6">
                          {'description' in panelData.evidence && (
                            <>
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Overview</h4>
                              <p className="text-sm text-muted-foreground leading-relaxed">{panelData.evidence.description}</p>
                            </>
                          )}
                          {'bullets' in panelData.evidence && panelData.evidence.bullets && (
                            <>
                              <h4 className="font-semibold text-foreground mb-2 text-sm">Key Points</h4>
                              <ul className="text-sm text-muted-foreground space-y-1.5">
                                {panelData.evidence.bullets.slice(0, 3).map((bullet, i) => (
                                  <li key={i} className="flex gap-2"><span className="text-primary mt-0.5">•</span><span>{bullet}</span></li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      )}
                      
                      {panelData.roots && panelData.roots.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-foreground mb-3">Connected Foundations ({panelData.roots.length})</h4>
                          <div className="flex flex-wrap gap-2">
                            {panelData.roots.map(root => (
                              <Badge key={root.id} variant="secondary" className="cursor-pointer hover:bg-secondary/80" onClick={() => { setSelectedRoot(root.id); setSelectedLeaf(null); openSidePanel({ type: 'root', id: root.id }); }}>
                                {root.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
