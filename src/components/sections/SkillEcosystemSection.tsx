import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import * as d3 from 'd3-force';
import { useInView } from 'react-intersection-observer';
import { 
  treeRoots, treeTrunk, treeBranches, treeLeaves, treeEdges,
  getLeavesByBranch, getBranchesByRoot, getRootsForBranch, getLeafEvidence, getFruitLeaves,
  type RootNode, type TrunkNode, type BranchNode, type LeafNode
} from '@/lib/content';
import { usePortfolioStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Sparkles, GitBranch, Leaf, CircleDot, RotateCcw, Command, Eye, EyeOff, FileText, Briefcase, BookOpen } from 'lucide-react';
import {
  generateRootPath,
  generateTrunkPath,
  generateBranchPath,
  generateTwigPath,
  LeafShape,
  GlowFilter,
  treeAnimationVariants,
  leafBloomVariants
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

// Color palette
const NODE_COLORS = {
  root: {
    math: 'hsl(145 45% 35%)',
    physics: 'hsl(160 40% 30%)',
    ml: 'hsl(38 50% 40%)',
    computing: 'hsl(200 40% 35%)',
    'soft-skills': 'hsl(280 30% 40%)',
  },
  trunk: 'hsl(30 35% 28%)',
  branch: 'hsl(35 40% 45%)',
  leaf: {
    project: 'hsl(95 50% 42%)',
    experience: 'hsl(145 45% 40%)',
    publication: 'hsl(180 40% 38%)',
  },
  fruit: 'hsl(38 70% 55%)',
};

// Stroke widths by hierarchy
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
  const [dimensions, setDimensions] = useState({ width: 900, height: 700 });
  const [nodes, setNodes] = useState<VisualNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'growing' | 'blooming' | 'glowing' | 'complete'>('idle');
  const [showFruitsOnly, setShowFruitsOnly] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const prefersReducedMotion = useReducedMotion();
  
  // Lazy loading - only initialize when section is in view
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  
  // Initialize heavy simulation only when in view
  useEffect(() => {
    if (inView && !isInitialized) {
      // Small delay to ensure smooth scrolling
      const timeoutId = setTimeout(() => {
        setIsInitialized(true);
      }, 100);
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

  // Build initial nodes with branch-based canopy clustering
  const initialNodes = useMemo<VisualNode[]>(() => {
    const allNodes: VisualNode[] = [];
    const { width, height } = dimensions;
    const centerX = width / 2;

    // Layer 0: Roots (spread underground)
    treeRoots.forEach((root, i) => {
      const xSpacing = width / (treeRoots.length + 1);
      allNodes.push({
        id: root.id,
        name: root.name,
        type: 'root',
        x: xSpacing * (i + 1),
        y: soilY + 40,
        layer: 0,
        color: NODE_COLORS.root[root.category] || NODE_COLORS.root.math,
        data: root,
      });
    });

    // Layer 1: Trunk (center)
    allNodes.push({
      id: treeTrunk.id,
      name: treeTrunk.name,
      type: 'trunk',
      x: centerX,
      y: trunkTopY,
      layer: 1,
      color: NODE_COLORS.trunk,
      data: treeTrunk,
    });

    // Layer 2: Branches (fan out from trunk top)
    const branchCount = treeBranches.length;
    treeBranches.forEach((branch, i) => {
      const angleSpread = Math.PI * 0.8; // 144 degrees
      const startAngle = -Math.PI / 2 - angleSpread / 2;
      const angle = startAngle + (i / (branchCount - 1 || 1)) * angleSpread;
      const radius = width * 0.22;
      
      allNodes.push({
        id: branch.id,
        name: branch.name,
        type: 'branch',
        x: centerX + Math.cos(angle) * radius,
        y: branchY + Math.sin(angle) * 30,
        layer: 2,
        color: NODE_COLORS.branch,
        data: branch,
        branchIndex: i,
      });
    });

    // Layer 3: Leaves (clustered in canopy zones above each branch)
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

      // Get leaf index within its branch
      leafIndexByBranch[leaf.branchId] = (leafIndexByBranch[leaf.branchId] || 0);
      const leafIndex = leafIndexByBranch[leaf.branchId]++;
      const totalLeavesInBranch = leafCountByBranch[leaf.branchId];

      // Distribute leaves in an arc above the branch
      const arcSpread = Math.PI * 0.4;
      const branchAngle = Math.atan2(branchNode.y - trunkTopY, branchNode.x - centerX);
      const leafAngle = branchAngle - arcSpread / 2 + (leafIndex / Math.max(1, totalLeavesInBranch - 1)) * arcSpread;
      
      // Stagger vertical positions
      const radiusBase = 80 + leafIndex * 25;
      const radius = radiusBase + Math.sin(globalIndex * 1.5) * 20;

      const evidenceType = (leaf as LeafNode).evidenceType;
      const leafColor = leaf.isFruit 
        ? NODE_COLORS.fruit 
        : NODE_COLORS.leaf[evidenceType as keyof typeof NODE_COLORS.leaf] || NODE_COLORS.leaf.project;

      allNodes.push({
        id: leaf.id,
        name: leaf.name,
        type: 'leaf',
        x: branchNode.x + Math.cos(leafAngle) * radius,
        y: canopyY + Math.sin(leafAngle + Math.PI / 2) * 30 + leafIndex * 15,
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

  // Run collision avoidance simulation
  useEffect(() => {
    if (featureFlags.reducedMotion || prefersReducedMotion) {
      setNodes(initialNodes);
      setAnimationPhase('complete');
      return;
    }

    const nodesCopy = initialNodes.map(n => ({ ...n }));
    
    // Fix Y for layer bands, allow X to adjust for collision
    nodesCopy.forEach(node => {
      if (node.type !== 'leaf') {
        node.fy = node.y;
      }
    });

    const simulation = d3.forceSimulation(nodesCopy as any)
      .force('collide', d3.forceCollide().radius((d: any) => {
        if (d.type === 'leaf') return 35;
        if (d.type === 'branch') return 45;
        return 30;
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

  // Get connected nodes for highlighting
  const getConnectedNodes = useCallback((nodeId: string): Set<string> => {
    const connected = new Set<string>([nodeId]);
    const addConnections = (id: string, depth: number) => {
      if (depth > 3) return;
      treeEdges.forEach(edge => {
        if (edge.source === id && !connected.has(edge.target)) {
          connected.add(edge.target);
          addConnections(edge.target, depth + 1);
        }
        if (edge.target === id && !connected.has(edge.source)) {
          connected.add(edge.source);
          addConnections(edge.source, depth + 1);
        }
      });
    };
    addConnections(nodeId, 0);
    return connected;
  }, []);

  // Handle node interactions
  const handleNodeClick = useCallback((node: VisualNode) => {
    if (node.type === 'root') {
      const isDeselecting = selectedRoot === node.id;
      setSelectedRoot(isDeselecting ? null : node.id);
      setSelectedLeaf(null);
      if (!isDeselecting) openSidePanel({ type: 'root', id: node.id });
      else closeSidePanel();
    } else if (node.type === 'leaf') {
      const isDeselecting = selectedLeaf === node.id;
      setSelectedLeaf(isDeselecting ? null : node.id);
      setSelectedRoot(null);
      if (!isDeselecting) openSidePanel({ type: 'leaf', id: node.id });
      else closeSidePanel();
    } else if (node.type === 'branch') {
      openSidePanel({ type: 'branch', id: node.id });
    }
  }, [selectedRoot, selectedLeaf, setSelectedRoot, setSelectedLeaf, openSidePanel, closeSidePanel]);

  const resetView = useCallback(() => {
    setSelectedRoot(null);
    setSelectedLeaf(null);
    setHoveredNode(null);
    closeSidePanel();
  }, [setSelectedRoot, setSelectedLeaf, closeSidePanel]);

  // Handle keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        resetView();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resetView]);

  // Computed state
  const highlightedNodes = useMemo(() => {
    if (selectedRoot) return getConnectedNodes(selectedRoot);
    if (selectedLeaf) return getConnectedNodes(selectedLeaf);
    if (hoveredNode) return getConnectedNodes(hoveredNode);
    return new Set<string>();
  }, [selectedRoot, selectedLeaf, hoveredNode, getConnectedNodes]);

  const panelData = useMemo(() => {
    if (!sidePanelContent) return null;
    
    if (sidePanelContent.type === 'root') {
      const root = treeRoots.find(r => r.id === sidePanelContent.id);
      if (root) {
        const branches = getBranchesByRoot(root.id);
        const leaves = branches.flatMap(b => getLeavesByBranch(b.id));
        return { nodeType: 'root' as const, root, branches, leaves };
      }
    } else if (sidePanelContent.type === 'branch') {
      const branch = treeBranches.find(b => b.id === sidePanelContent.id);
      if (branch) {
        const roots = getRootsForBranch(branch.id);
        const leaves = getLeavesByBranch(branch.id);
        return { nodeType: 'branch' as const, branch, roots, leaves };
      }
    } else {
      const leaf = treeLeaves.find(l => l.id === sidePanelContent.id);
      if (leaf) {
        const evidence = getLeafEvidence(leaf);
        const branch = treeBranches.find(b => b.id === leaf.branchId);
        const roots = branch ? getRootsForBranch(branch.id) : [];
        return { nodeType: 'leaf' as const, leaf, evidence, branch, roots };
      }
    }
    return null;
  }, [sidePanelContent]);

  // Trunk path geometry
  const trunkGeometry = useMemo(() => {
    const centerX = dimensions.width / 2;
    return generateTrunkPath(centerX, trunkBaseY, centerX, trunkTopY, 24, 12);
  }, [dimensions.width, trunkBaseY, trunkTopY]);

  // Filter leaves for display
  const visibleNodes = useMemo(() => {
    if (!showFruitsOnly) return nodes;
    return nodes.filter(n => n.type !== 'leaf' || n.isFruit);
  }, [nodes, showFruitsOnly]);

  const getEvidenceIcon = (type: string) => {
    switch (type) {
      case 'project': return FileText;
      case 'experience': return Briefcase;
      case 'publication': return BookOpen;
      default: return Leaf;
    }
  };

  return (
    <section 
      id="ecosystem" 
      ref={inViewRef}
      className="relative py-24 px-6 min-h-screen bg-muted/10"
      aria-labelledby="ecosystem-heading"
    >
      <div className="container max-w-5xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-8">
          <h2 
            id="ecosystem-heading"
            className="font-display text-3xl md:text-4xl font-medium text-foreground mb-4"
          >
            Skill Ecosystem
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-sm leading-relaxed">
            An interactive visualization of interconnected competencies. <strong>Roots</strong> (foundations) 
            feed through the trunk into specialized <strong>branches</strong>, producing <strong>leaves</strong> (projects, research).
            <span className="text-primary ml-1">★ Golden leaves are top outcomes.</span>
          </p>
        </div>

        {/* Loading state before initialization */}
        {!isInitialized && (
          <div className="relative w-full h-[600px] md:h-[700px] glass-card rounded-2xl overflow-hidden flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">Loading skill tree...</p>
            </div>
          </div>
        )}

        {/* Main Tree Visualization - only render when initialized */}
        {isInitialized && (
          <div 
            ref={containerRef}
            className="relative w-full h-[600px] md:h-[700px] glass-card rounded-2xl overflow-hidden"
            style={{ border: '1px solid hsl(var(--border) / 0.3)' }}
          >
          {/* Controls (top-right) */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2 bg-background/70 backdrop-blur-sm rounded-lg p-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFruitsOnly(!showFruitsOnly)}
              className="text-xs gap-1.5"
              aria-label={showFruitsOnly ? 'Show all leaves' : 'Show only top outcomes'}
            >
              {showFruitsOnly ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              {showFruitsOnly ? 'Show All' : 'Highlights'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetView}
              className="text-xs gap-1.5"
              aria-label="Reset view"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
            <div className="text-xs text-muted-foreground px-2 hidden sm:flex items-center gap-1">
              <Command className="w-3 h-3" />K search
            </div>
          </div>

          {/* Legend (top-left) */}
          <div className="absolute top-4 left-4 z-20 flex flex-wrap gap-2 text-xs text-muted-foreground bg-background/70 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5">
              <CircleDot className="w-3.5 h-3.5" style={{ color: NODE_COLORS.root.math }} />
              <span>Roots</span>
            </div>
            <div className="flex items-center gap-1.5">
              <GitBranch className="w-3.5 h-3.5" style={{ color: NODE_COLORS.branch }} />
              <span>Branches</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5" style={{ color: NODE_COLORS.leaf.project }} />
              <span>Leaves</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" style={{ color: NODE_COLORS.fruit }} />
              <span>Top Outcomes</span>
            </div>
          </div>

          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full"
            role="img"
            aria-label="Organic skill tree: roots underground, trunk rising, branches spreading, leaves in canopy"
          >
            {/* Definitions */}
            <defs>
              {/* Soil gradient with noise */}
              <linearGradient id="soil-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(30 30% 22%)" stopOpacity="0.6" />
                <stop offset="40%" stopColor="hsl(25 35% 18%)" stopOpacity="0.85" />
                <stop offset="100%" stopColor="hsl(20 40% 12%)" stopOpacity="0.95" />
              </linearGradient>
              
              {/* Trunk wood gradient */}
              <linearGradient id="trunk-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="hsl(25 40% 22%)" />
                <stop offset="50%" stopColor="hsl(30 35% 28%)" />
                <stop offset="100%" stopColor="hsl(35 30% 35%)" />
              </linearGradient>
              
              {/* Branch gradient */}
              <linearGradient id="branch-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="hsl(30 35% 32%)" />
                <stop offset="100%" stopColor="hsl(35 40% 40%)" />
              </linearGradient>

              {/* Glow filters */}
              <GlowFilter id="glow-primary" color="hsl(145 50% 50%)" />
              <GlowFilter id="glow-fruit" color="hsl(38 70% 55%)" />
              <GlowFilter id="glow-selection" color="hsl(45 80% 60%)" />
              
              {/* Leaf shadow */}
              <filter id="leaf-shadow">
                <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.25" />
              </filter>
            </defs>

            {/* Soil band with gradient */}
            <rect
              x="0"
              y={soilY}
              width={dimensions.width}
              height={dimensions.height - soilY}
              fill="url(#soil-gradient)"
            />
            {/* Soil horizon line */}
            <line
              x1="0"
              y1={soilY}
              x2={dimensions.width}
              y2={soilY}
              stroke="hsl(30 25% 30%)"
              strokeWidth="3"
              strokeDasharray="12 6"
              opacity="0.5"
            />

            {/* Root paths (organic curves underground) */}
            <g className="roots">
              {nodes.filter(n => n.type === 'root').map((rootNode, i) => {
                const trunkNode = nodes.find(n => n.type === 'trunk');
                if (!trunkNode) return null;
                
                const isHighlighted = highlightedNodes.size === 0 || highlightedNodes.has(rootNode.id);
                const path = generateRootPath(
                  rootNode.x, rootNode.y,
                  dimensions.width / 2, trunkBaseY + 10,
                  i
                );

                return (
                  <motion.path
                    key={`root-path-${rootNode.id}`}
                    d={path}
                    fill="none"
                    stroke={rootNode.color}
                    strokeWidth={STROKE_WIDTHS.root}
                    strokeLinecap="round"
                    strokeOpacity={isHighlighted ? 0.8 : 0.2}
                    initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: i * 0.1, duration: 0.8, ease: 'easeInOut' }}
                  />
                );
              })}
            </g>

            {/* Trunk (filled organic shape) */}
            <motion.path
              d={trunkGeometry.fillPath}
              fill="url(#trunk-gradient)"
              stroke="hsl(25 30% 20%)"
              strokeWidth={2}
              initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, scaleY: 0 }}
              animate={{ opacity: 1, scaleY: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              style={{ transformOrigin: `${dimensions.width / 2}px ${trunkBaseY}px` }}
            />

            {/* Branches (curved paths from trunk to branch positions) */}
            <g className="branches">
              {nodes.filter(n => n.type === 'branch').map((branchNode, i) => {
                const isHighlighted = highlightedNodes.size === 0 || highlightedNodes.has(branchNode.id);
                const path = generateBranchPath(
                  dimensions.width / 2, trunkTopY,
                  branchNode.x, branchNode.y,
                  0.25 + i * 0.05
                );

                return (
                  <motion.path
                    key={`branch-path-${branchNode.id}`}
                    d={path}
                    fill="none"
                    stroke="url(#branch-gradient)"
                    strokeWidth={STROKE_WIDTHS.branch}
                    strokeLinecap="round"
                    strokeOpacity={isHighlighted ? 0.9 : 0.25}
                    initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.5, ease: 'easeOut' }}
                  />
                );
              })}
            </g>

            {/* Twigs (connecting branches to leaves) */}
            <g className="twigs">
              {visibleNodes.filter(n => n.type === 'leaf').map((leafNode, i) => {
                const leafData = leafNode.data as LeafNode;
                const branchNode = nodes.find(n => n.id === leafData.branchId);
                if (!branchNode) return null;

                const isHighlighted = highlightedNodes.size === 0 || highlightedNodes.has(leafNode.id);
                const path = generateTwigPath(branchNode.x, branchNode.y, leafNode.x, leafNode.y, i);

                return (
                  <motion.path
                    key={`twig-${leafNode.id}`}
                    d={path}
                    fill="none"
                    stroke="hsl(35 35% 45%)"
                    strokeWidth={STROKE_WIDTHS.twig}
                    strokeLinecap="round"
                    strokeOpacity={isHighlighted ? 0.6 : 0.15}
                    initial={prefersReducedMotion ? { pathLength: 1 } : { pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 1 + i * 0.03, duration: 0.3 }}
                  />
                );
              })}
            </g>

            {/* Root nodes (circular underground) */}
            <g className="root-nodes">
              {nodes.filter(n => n.type === 'root').map((node) => {
                const isHighlighted = highlightedNodes.size === 0 || highlightedNodes.has(node.id);
                const isSelected = selectedRoot === node.id;

                return (
                  <motion.g
                    key={node.id}
                    initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: isHighlighted ? 1 : 0.3,
                      x: node.x,
                      y: node.y 
                    }}
                    transition={{ delay: 0.2, duration: 0.4, type: 'spring' }}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => {
                      setHoveredNode(node.id);
                      setTooltipPos({ x: node.x, y: node.y - 50 });
                    }}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => handleNodeClick(node)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Root: ${node.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNodeClick(node);
                      }
                    }}
                  >
                    <circle
                      r={isSelected ? 24 : 20}
                      fill={node.color}
                      stroke={isSelected ? 'hsl(45 80% 65%)' : 'hsl(25 30% 15%)'}
                      strokeWidth={isSelected ? 3 : 2}
                      filter={isSelected ? 'url(#glow-selection)' : undefined}
                    />
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fontSize={8}
                      fill="hsl(45 20% 92%)"
                      fontWeight={600}
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.name.length > 10 ? node.name.slice(0, 9) + '…' : node.name}
                    </text>
                  </motion.g>
                );
              })}
            </g>

            {/* Branch nodes */}
            <g className="branch-nodes">
              {nodes.filter(n => n.type === 'branch').map((node, i) => {
                const isHighlighted = highlightedNodes.size === 0 || highlightedNodes.has(node.id);

                return (
                  <motion.g
                    key={node.id}
                    initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: isHighlighted ? 1 : 0.3,
                      x: node.x,
                      y: node.y 
                    }}
                    transition={{ delay: 0.6 + i * 0.08, duration: 0.3 }}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => {
                      setHoveredNode(node.id);
                      setTooltipPos({ x: node.x, y: node.y - 40 });
                    }}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => handleNodeClick(node)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Branch: ${node.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNodeClick(node);
                      }
                    }}
                  >
                    <ellipse
                      rx={32}
                      ry={12}
                      fill={node.color}
                      stroke="hsl(30 25% 25%)"
                      strokeWidth={1.5}
                    />
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fontSize={8}
                      fill="hsl(45 15% 95%)"
                      fontWeight={500}
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.name.length > 12 ? node.name.slice(0, 11) + '…' : node.name}
                    </text>
                  </motion.g>
                );
              })}
            </g>

            {/* Leaf nodes (SVG leaf shapes) */}
            <g className="leaf-nodes">
              {visibleNodes.filter(n => n.type === 'leaf').map((node, i) => {
                const leafData = node.data as LeafNode;
                const isHighlighted = highlightedNodes.size === 0 || highlightedNodes.has(node.id);
                const isSelected = selectedLeaf === node.id;
                const EvidenceIcon = getEvidenceIcon(leafData.evidenceType);

                return (
                  <motion.g
                    key={node.id}
                    initial={prefersReducedMotion ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                    animate={{ 
                      scale: 1, 
                      opacity: isHighlighted ? 1 : 0.25
                    }}
                    transition={{ 
                      delay: prefersReducedMotion ? 0 : 1.2 + i * 0.04, 
                      duration: 0.4, 
                      type: 'spring',
                      stiffness: 200 
                    }}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => {
                      setHoveredNode(node.id);
                      setTooltipPos({ x: node.x, y: node.y - 55 });
                    }}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => handleNodeClick(node)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${leafData.evidenceType}: ${node.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNodeClick(node);
                      }
                    }}
                  >
                    <LeafShape
                      x={node.x}
                      y={node.y}
                      width={node.isFruit ? 20 : 18}
                      height={node.isFruit ? 30 : 26}
                      rotation={(node.leafIndex || 0) * 15 - 20}
                      fill={node.color}
                      isSelected={isSelected}
                      isFruit={node.isFruit}
                      filter={isSelected ? 'url(#glow-selection)' : node.isFruit ? 'url(#glow-fruit)' : 'url(#leaf-shadow)'}
                    />
                    {/* Label below leaf */}
                    <text
                      x={node.x}
                      y={node.y + 24}
                      textAnchor="middle"
                      fontSize={7}
                      fill="currentColor"
                      className="text-foreground"
                      fontWeight={500}
                      style={{ pointerEvents: 'none' }}
                    >
                      {node.name.length > 16 ? node.name.slice(0, 15) + '…' : node.name}
                    </text>
                    {/* Type icon badge */}
                    <g transform={`translate(${node.x + 12}, ${node.y - 18})`}>
                      <circle r={7} fill="hsl(var(--background))" stroke="hsl(var(--border))" strokeWidth={1} />
                      <foreignObject x={-5} y={-5} width={10} height={10}>
                        <EvidenceIcon className="w-2.5 h-2.5 text-muted-foreground" />
                      </foreignObject>
                    </g>
                  </motion.g>
                );
              })}
            </g>

            {/* Light-up glow pass (animation overlay) */}
            {animationPhase === 'glowing' && performanceTier !== 'low' && (
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{ duration: 1.5, ease: 'easeInOut' }}
              >
                <motion.path
                  d={trunkGeometry.fillPath}
                  fill="none"
                  stroke="hsl(95 60% 50%)"
                  strokeWidth={4}
                  filter="url(#glow-primary)"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.2 }}
                />
              </motion.g>
            )}
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
                  left: Math.min(Math.max(tooltipPos.x, 120), dimensions.width - 120), 
                  top: Math.max(tooltipPos.y, 80),
                  transform: 'translateX(-50%)'
                }}
              >
                {(() => {
                  const node = nodes.find(n => n.id === hoveredNode);
                  if (!node) return null;
                  
                  const Icon = node.type === 'root' ? CircleDot : 
                               node.type === 'branch' ? GitBranch : 
                               node.isFruit ? Sparkles : Leaf;
                  
                  return (
                    <>
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-4 h-4 text-primary" />
                        <span className="text-xs uppercase tracking-wider text-muted-foreground">{node.type}</span>
                        {node.type === 'leaf' && (
                          <Badge variant="outline" className="text-xs py-0 px-1.5">
                            {(node.data as LeafNode).evidenceType}
                          </Badge>
                        )}
                      </div>
                      <p className="font-semibold text-foreground text-sm">{node.name}</p>
                      {node.type === 'root' && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{(node.data as RootNode).description}</p>
                      )}
                      {node.type === 'branch' && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{(node.data as BranchNode).description}</p>
                      )}
                      {node.type === 'leaf' && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{(node.data as LeafNode).summary}</p>
                      )}
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
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card/95 backdrop-blur-xl border-l border-border z-50 overflow-y-auto"
            >
              <div className="p-6">
                <button
                  onClick={closeSidePanel}
                  className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
                  aria-label="Close panel (Escape)"
                >
                  <X className="w-5 h-5" />
                </button>

                {panelData.nodeType === 'root' && panelData.root && (
                  <>
                    <Badge variant="outline" className="mb-3 border-primary/50">
                      <CircleDot className="w-3 h-3 mr-1" />
                      Foundation
                    </Badge>
                    <h3 className="text-2xl font-display font-semibold text-foreground mb-2">
                      {panelData.root.name}
                    </h3>
                    <p className="text-muted-foreground mb-6">{panelData.root.description}</p>
                    
                    {panelData.branches && panelData.branches.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <GitBranch className="w-4 h-4" />
                          Branches ({panelData.branches.length})
                        </h4>
                        <div className="space-y-2">
                          {panelData.branches.map(branch => (
                            <div key={branch.id} className="p-3 rounded-lg bg-muted/50">
                              <p className="font-medium text-foreground">{branch.name}</p>
                              <p className="text-xs text-muted-foreground">{branch.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {panelData.leaves && panelData.leaves.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Leaf className="w-4 h-4" />
                          Evidence ({panelData.leaves.length})
                        </h4>
                        <div className="space-y-2">
                          {panelData.leaves.map(leaf => (
                            <div 
                              key={leaf.id} 
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                leaf.isFruit ? 'bg-secondary/20 border border-secondary/30' : 'bg-muted/50 hover:bg-muted'
                              }`}
                              onClick={() => openSidePanel({ type: 'leaf', id: leaf.id })}
                            >
                              <div className="flex items-center gap-2">
                                {leaf.isFruit && <Sparkles className="w-4 h-4 text-secondary" />}
                                <p className="font-medium text-foreground">{leaf.name}</p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1">{leaf.summary}</p>
                              <Badge variant="outline" className="mt-2 text-xs">
                                {leaf.evidenceType}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {panelData.nodeType === 'branch' && panelData.branch && (
                  <>
                    <Badge variant="outline" className="mb-3 border-secondary/50">
                      <GitBranch className="w-3 h-3 mr-1" />
                      Branch
                    </Badge>
                    <h3 className="text-2xl font-display font-semibold text-foreground mb-2">
                      {panelData.branch.name}
                    </h3>
                    <p className="text-muted-foreground mb-6">{panelData.branch.description}</p>
                    
                    {panelData.roots && panelData.roots.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-foreground mb-3">
                          Fed by {panelData.roots.length} foundation{panelData.roots.length > 1 ? 's' : ''}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {panelData.roots.map(root => (
                            <Badge 
                              key={root.id} 
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => openSidePanel({ type: 'root', id: root.id })}
                            >
                              {root.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {panelData.leaves && panelData.leaves.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Leaf className="w-4 h-4" />
                          Produces ({panelData.leaves.length})
                        </h4>
                        <div className="space-y-2">
                          {panelData.leaves.map(leaf => (
                            <div 
                              key={leaf.id} 
                              className={`p-3 rounded-lg cursor-pointer transition-colors ${
                                leaf.isFruit ? 'bg-secondary/20 border border-secondary/30' : 'bg-muted/50 hover:bg-muted'
                              }`}
                              onClick={() => openSidePanel({ type: 'leaf', id: leaf.id })}
                            >
                              <div className="flex items-center gap-2">
                                {leaf.isFruit && <Sparkles className="w-4 h-4 text-secondary" />}
                                <p className="font-medium text-foreground">{leaf.name}</p>
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
                    <Badge 
                      variant="outline" 
                      className={panelData.leaf.isFruit ? 'mb-3 border-secondary bg-secondary/10' : 'mb-3'}
                    >
                      {panelData.leaf.isFruit ? <Sparkles className="w-3 h-3 mr-1" /> : <Leaf className="w-3 h-3 mr-1" />}
                      {panelData.leaf.evidenceType}
                    </Badge>
                    <h3 className="text-2xl font-display font-semibold text-foreground mb-2">
                      {panelData.leaf.name}
                    </h3>
                    <p className="text-muted-foreground mb-6">{panelData.leaf.summary}</p>
                    
                    {panelData.evidence && (
                      <div className="p-4 rounded-lg bg-muted/50 mb-6">
                        {'description' in panelData.evidence && (
                          <>
                            <h4 className="font-semibold text-foreground mb-2">Details</h4>
                            <p className="text-sm text-muted-foreground">{panelData.evidence.description}</p>
                          </>
                        )}
                        {'bullets' in panelData.evidence && panelData.evidence.bullets && (
                          <>
                            <h4 className="font-semibold text-foreground mb-2">Key Points</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {panelData.evidence.bullets.map((bullet, i) => (
                                <li key={i} className="flex gap-2">
                                  <span className="text-primary">•</span>
                                  {bullet}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                        {'venue' in panelData.evidence && (
                          <>
                            <h4 className="font-semibold text-foreground mb-2">Publication</h4>
                            <p className="text-sm text-muted-foreground">{panelData.evidence.venue}</p>
                            {panelData.evidence.doi && (
                              <a 
                                href={panelData.evidence.doi}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary text-sm hover:underline mt-2 inline-block"
                              >
                                View Publication →
                              </a>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    
                    {panelData.roots && panelData.roots.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">Built on these foundations</h4>
                        <div className="flex flex-wrap gap-2">
                          {panelData.roots.map(root => (
                            <Badge 
                              key={root.id} 
                              variant="secondary"
                              className="cursor-pointer"
                              onClick={() => openSidePanel({ type: 'root', id: root.id })}
                            >
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
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
