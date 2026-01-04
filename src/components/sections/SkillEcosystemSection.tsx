import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3-force';
import { 
  treeRoots, treeTrunk, treeBranches, treeLeaves, treeEdges,
  getLeavesByBranch, getBranchesByRoot, getRootsForBranch, getLeafEvidence, getFruitLeaves,
  type RootNode, type TrunkNode, type BranchNode, type LeafNode, type TreeEdge
} from '@/lib/content';
import { usePortfolioStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { X, Sparkles, GitBranch, Leaf, CircleDot } from 'lucide-react';

// ============ TYPES ============
interface VisualNode {
  id: string;
  name: string;
  type: 'root' | 'trunk' | 'branch' | 'leaf';
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
  layer: number; // 0=roots, 1=trunk, 2=branches, 3=leaves
  color: string;
  isFruit?: boolean;
  data: RootNode | TrunkNode | BranchNode | LeafNode;
}

interface VisualLink {
  source: string;
  target: string;
  type: 'feeds' | 'produces';
}

// Color palette for node types
const NODE_COLORS = {
  root: {
    math: 'hsl(145 45% 35%)',      // Deep forest green
    physics: 'hsl(160 40% 30%)',   // Darker teal
    ml: 'hsl(38 50% 40%)',         // Earth brown
    computing: 'hsl(200 40% 35%)', // Steel blue
    'soft-skills': 'hsl(280 30% 40%)', // Muted purple
  },
  trunk: 'hsl(30 35% 28%)',        // Dark bark brown
  branch: 'hsl(35 40% 45%)',       // Lighter branch brown
  leaf: 'hsl(95 45% 45%)',         // Vibrant leaf green
  fruit: 'hsl(38 70% 55%)',        // Golden fruit
};

// ============ COMPONENT ============
export function SkillEcosystemSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 700 });
  const [nodes, setNodes] = useState<VisualNode[]>([]);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  
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

  // Layer Y positions (bottom to top: roots → trunk → branches → leaves)
  const getLayerY = useCallback((layer: number, height: number) => {
    const soilLine = height - 80;
    const layers = [
      soilLine + 30,  // 0: roots (below soil)
      soilLine - 60,  // 1: trunk (at soil line)
      height * 0.4,   // 2: branches (middle)
      height * 0.15,  // 3: leaves (top canopy)
    ];
    return layers[layer] || height / 2;
  }, []);

  // Build visual nodes from tree data
  const initialNodes = useMemo<VisualNode[]>(() => {
    const allNodes: VisualNode[] = [];
    const { width, height } = dimensions;
    
    // Layer 0: Roots (spread across bottom)
    treeRoots.forEach((root, i) => {
      const xSpacing = width / (treeRoots.length + 1);
      allNodes.push({
        id: root.id,
        name: root.name,
        type: 'root',
        x: xSpacing * (i + 1),
        y: getLayerY(0, height),
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
      x: width / 2,
      y: getLayerY(1, height),
      layer: 1,
      color: NODE_COLORS.trunk,
      data: treeTrunk,
    });
    
    // Layer 2: Branches (spread out from center)
    treeBranches.forEach((branch, i) => {
      const angle = (i / treeBranches.length) * Math.PI - Math.PI / 2;
      const radius = width * 0.25;
      allNodes.push({
        id: branch.id,
        name: branch.name,
        type: 'branch',
        x: width / 2 + Math.cos(angle) * radius,
        y: getLayerY(2, height) + Math.sin(angle) * 30,
        layer: 2,
        color: NODE_COLORS.branch,
        data: branch,
      });
    });
    
    // Layer 3: Leaves (distributed in canopy)
    treeLeaves.forEach((leaf, i) => {
      // Position leaves above their parent branch
      const parentBranch = treeBranches.findIndex(b => b.id === leaf.branchId);
      const branchAngle = (parentBranch / treeBranches.length) * Math.PI - Math.PI / 2;
      const leafOffset = (i % 3 - 1) * 60;
      const radius = width * 0.35;
      
      allNodes.push({
        id: leaf.id,
        name: leaf.name,
        type: 'leaf',
        x: width / 2 + Math.cos(branchAngle) * radius + leafOffset,
        y: getLayerY(3, height) + Math.random() * 50 - 25,
        layer: 3,
        color: leaf.isFruit ? NODE_COLORS.fruit : NODE_COLORS.leaf,
        isFruit: leaf.isFruit,
        data: leaf,
      });
    });
    
    return allNodes;
  }, [dimensions, getLayerY]);

  // Build visual links
  const links = useMemo<VisualLink[]>(() => {
    return treeEdges.map(edge => ({
      source: edge.source,
      target: edge.target,
      type: edge.type === 'produces' ? 'produces' : 'feeds',
    }));
  }, []);

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: Math.max(rect.width, 320), 
          height: Math.min(Math.max(rect.height, 500), 800) 
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Run force simulation with layer constraints
  useEffect(() => {
    if (featureFlags.reducedMotion) {
      // Static layout for reduced motion
      setNodes(initialNodes);
      return;
    }

    const nodesCopy = initialNodes.map(n => ({ ...n }));
    
    // Fix Y position for each layer
    nodesCopy.forEach(node => {
      node.fy = getLayerY(node.layer, dimensions.height);
    });

    const simulation = d3.forceSimulation(nodesCopy as any)
      .force('link', d3.forceLink(links.map(l => ({ ...l })))
        .id((d: any) => d.id)
        .distance(80)
        .strength(0.2))
      .force('charge', d3.forceManyBody().strength(-100))
      .force('collide', d3.forceCollide().radius((d: any) => d.type === 'leaf' ? 40 : 35))
      .force('x', d3.forceX((d: any) => {
        // Pull trunk to center
        if (d.type === 'trunk') return dimensions.width / 2;
        return d.x;
      }).strength((d: any) => d.type === 'trunk' ? 0.8 : 0.02))
      .alpha(performanceTier === 'low' ? 0.1 : 0.3)
      .alphaDecay(0.02);

    simulation.on('tick', () => {
      setNodes([...nodesCopy].map(n => ({
        ...n,
        x: Math.max(60, Math.min(dimensions.width - 60, n.x)),
        y: n.fy || n.y,
      })));
    });

    return () => { simulation.stop(); };
  }, [initialNodes, links, dimensions, featureFlags.reducedMotion, performanceTier, getLayerY]);

  // Get connected node IDs for highlighting
  const getConnectedNodes = useCallback((nodeId: string): Set<string> => {
    const connected = new Set<string>([nodeId]);
    
    // Find all edges containing this node
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

  // Handle node click
  const handleNodeClick = (node: VisualNode) => {
    if (node.type === 'root') {
      setSelectedRoot(selectedRoot === node.id ? null : node.id);
      setSelectedLeaf(null);
      if (selectedRoot !== node.id) {
        openSidePanel({ type: 'root', id: node.id });
      } else {
        closeSidePanel();
      }
    } else if (node.type === 'leaf') {
      setSelectedLeaf(selectedLeaf === node.id ? null : node.id);
      setSelectedRoot(null);
      if (selectedLeaf !== node.id) {
        openSidePanel({ type: 'leaf', id: node.id });
      } else {
        closeSidePanel();
      }
    } else if (node.type === 'branch') {
      // Show branch details
      openSidePanel({ type: 'root', id: node.id }); // Reuse root type for branches
    }
  };

  // Get highlighted nodes
  const highlightedNodes = useMemo(() => {
    if (selectedRoot) return getConnectedNodes(selectedRoot);
    if (selectedLeaf) return getConnectedNodes(selectedLeaf);
    if (hoveredNode) return getConnectedNodes(hoveredNode);
    return new Set<string>();
  }, [selectedRoot, selectedLeaf, hoveredNode, getConnectedNodes]);

  // Get side panel content
  const panelData = useMemo(() => {
    if (!sidePanelContent) return null;
    
    if (sidePanelContent.type === 'root') {
      const root = treeRoots.find(r => r.id === sidePanelContent.id);
      const branch = treeBranches.find(b => b.id === sidePanelContent.id);
      
      if (root) {
        const branches = getBranchesByRoot(root.id);
        const leaves = branches.flatMap(b => getLeavesByBranch(b.id));
        return { nodeType: 'root' as const, root, branches, leaves };
      }
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

  // Generate organic curved path between nodes
  const getCurvedPath = (source: VisualNode, target: VisualNode) => {
    const midX = (source.x + target.x) / 2;
    const midY = (source.y + target.y) / 2;
    const curveOffset = (target.y - source.y) * 0.3;
    
    return `M${source.x},${source.y} Q${midX - curveOffset},${midY} ${target.x},${target.y}`;
  };

  // Soil line Y position
  const soilY = dimensions.height - 80;

  return (
    <section 
      id="ecosystem" 
      className="relative py-24 px-6 min-h-screen"
      aria-label="Skill Ecosystem - Interactive tree visualization"
    >
      <div className="container max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-widest text-primary mb-2">Ecosystem Loaded ✓</p>
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
            Skill <span className="text-gradient">Ecosystem</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            <strong>Roots</strong> (foundations) feed into a <strong>trunk</strong> (identity), which branches into specialized areas, 
            each producing <strong>leaves</strong> (projects, research, publications). 
            <span className="text-secondary"> ★ Golden nodes are top outcomes.</span>
          </p>
        </div>

        {/* Main Tree Visualization */}
        <div 
          ref={containerRef}
          className="relative w-full h-[600px] md:h-[700px] glass-card rounded-2xl overflow-hidden"
          style={{ border: '1px solid hsl(var(--border) / 0.3)' }}
        >
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full"
            role="img"
            aria-label="Multi-layer skill tree: roots at bottom, trunk, branches, and leaves at top"
          >
            {/* Definitions */}
            <defs>
              <linearGradient id="soil-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(30 25% 20%)" stopOpacity="0.4" />
                <stop offset="100%" stopColor="hsl(25 30% 15%)" stopOpacity="0.7" />
              </linearGradient>
              <linearGradient id="trunk-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="hsl(30 35% 25%)" />
                <stop offset="100%" stopColor="hsl(35 40% 35%)" />
              </linearGradient>
              <filter id="glow-strong">
                <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <filter id="leaf-shadow">
                <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.3"/>
              </filter>
            </defs>

            {/* Soil band at bottom */}
            <rect
              x="0"
              y={soilY}
              width={dimensions.width}
              height={dimensions.height - soilY}
              fill="url(#soil-gradient)"
            />
            <line
              x1="0"
              y1={soilY}
              x2={dimensions.width}
              y2={soilY}
              stroke="hsl(30 20% 25%)"
              strokeWidth="2"
              strokeDasharray="8 4"
              opacity="0.5"
            />

            {/* Edges/Links */}
            <g className="links">
              {links.map((link) => {
                const sourceNode = nodes.find(n => n.id === link.source);
                const targetNode = nodes.find(n => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                const isHighlighted = highlightedNodes.has(link.source) && highlightedNodes.has(link.target);
                const isActive = selectedRoot === link.source || selectedLeaf === link.target;

                return (
                  <motion.path
                    key={`${link.source}-${link.target}`}
                    d={getCurvedPath(sourceNode, targetNode)}
                    fill="none"
                    stroke={isActive ? 'hsl(95 50% 50%)' : 'hsl(35 30% 40%)'}
                    strokeWidth={isHighlighted ? 2.5 : link.type === 'feeds' ? 1.5 : 1}
                    strokeOpacity={highlightedNodes.size > 0 && !isHighlighted ? 0.1 : isHighlighted ? 0.8 : 0.25}
                    initial={false}
                    animate={{
                      strokeOpacity: highlightedNodes.size > 0 && !isHighlighted ? 0.1 : isHighlighted ? 0.8 : 0.25,
                      strokeWidth: isHighlighted ? 2.5 : link.type === 'feeds' ? 1.5 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                  />
                );
              })}
            </g>

            {/* Nodes */}
            <g className="nodes">
              {nodes.map(node => {
                const isHighlighted = highlightedNodes.size === 0 || highlightedNodes.has(node.id);
                const isSelected = selectedRoot === node.id || selectedLeaf === node.id;

                return (
                  <motion.g
                    key={node.id}
                    initial={false}
                    animate={{ 
                      x: node.x, 
                      y: node.y,
                      opacity: isHighlighted ? 1 : 0.25,
                    }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={() => {
                      setHoveredNode(node.id);
                      setTooltipPos({ x: node.x, y: node.y - 60 });
                    }}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => handleNodeClick(node)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.type}: ${node.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNodeClick(node);
                      }
                    }}
                  >
                    {node.type === 'root' && (
                      <circle
                        r={isSelected ? 26 : 22}
                        fill={node.color}
                        stroke={isSelected ? 'hsl(45 80% 70%)' : 'hsl(30 20% 15%)'}
                        strokeWidth={isSelected ? 3 : 2}
                        filter={isSelected ? 'url(#glow-strong)' : undefined}
                      />
                    )}
                    {node.type === 'trunk' && (
                      <rect
                        x={-30}
                        y={-20}
                        width={60}
                        height={40}
                        rx={8}
                        fill="url(#trunk-gradient)"
                        stroke={isSelected ? 'hsl(45 80% 70%)' : 'hsl(30 20% 20%)'}
                        strokeWidth={2}
                      />
                    )}
                    {node.type === 'branch' && (
                      <ellipse
                        rx={isSelected ? 38 : 32}
                        ry={isSelected ? 16 : 14}
                        fill={node.color}
                        stroke={isSelected ? 'hsl(45 80% 70%)' : 'transparent'}
                        strokeWidth={2}
                        filter={isSelected ? 'url(#glow-strong)' : undefined}
                      />
                    )}
                    {node.type === 'leaf' && (
                      <>
                        <ellipse
                          rx={node.isFruit ? 42 : 38}
                          ry={node.isFruit ? 14 : 12}
                          fill={node.color}
                          stroke={isSelected ? 'hsl(45 80% 80%)' : node.isFruit ? 'hsl(38 60% 40%)' : 'transparent'}
                          strokeWidth={node.isFruit ? 2 : 1}
                          filter={isSelected ? 'url(#glow-strong)' : 'url(#leaf-shadow)'}
                        />
                        {node.isFruit && (
                          <circle
                            cx={32}
                            cy={-8}
                            r={6}
                            fill="hsl(45 90% 60%)"
                            stroke="hsl(38 70% 45%)"
                            strokeWidth={1}
                          />
                        )}
                      </>
                    )}
                    <text
                      textAnchor="middle"
                      dy="0.35em"
                      fontSize={node.type === 'root' ? 9 : node.type === 'trunk' ? 10 : 8}
                      fill={node.type === 'root' || node.type === 'trunk' ? 'hsl(45 20% 90%)' : 'hsl(220 20% 10%)'}
                      fontWeight={600}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {node.name.length > 14 ? node.name.slice(0, 13) + '…' : node.name}
                    </text>
                  </motion.g>
                );
              })}
            </g>
          </svg>

          {/* Tooltip */}
          <AnimatePresence>
            {hoveredNode && !sidePanelOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute pointer-events-none bg-popover/95 backdrop-blur-sm border border-border rounded-lg px-4 py-3 shadow-xl max-w-xs"
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
                      </div>
                      <p className="font-semibold text-foreground text-sm">{node.name}</p>
                      {node.type === 'root' && (
                        <p className="text-xs text-muted-foreground mt-1">{(node.data as RootNode).description}</p>
                      )}
                      {node.type === 'branch' && (
                        <p className="text-xs text-muted-foreground mt-1">{(node.data as BranchNode).description}</p>
                      )}
                      {node.type === 'leaf' && (
                        <>
                          <p className="text-xs text-muted-foreground mt-1">{(node.data as LeafNode).summary}</p>
                          <Badge variant="outline" className="mt-2 text-xs">
                            {(node.data as LeafNode).evidenceType}
                          </Badge>
                        </>
                      )}
                    </>
                  );
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 text-xs text-muted-foreground bg-background/50 backdrop-blur-sm rounded-lg px-3 py-2">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full" style={{ background: NODE_COLORS.root.math }} />
              <span>Roots (foundations)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-3 rounded" style={{ background: NODE_COLORS.branch }} />
              <span>Branches</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 rounded-full" style={{ background: NODE_COLORS.leaf }} />
              <span>Leaves</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 rounded-full" style={{ background: NODE_COLORS.fruit }} />
              <span>★ Top outcomes</span>
            </div>
          </div>
        </div>

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
                  aria-label="Close panel"
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
                            <Badge key={root.id} variant="secondary">
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
                    
                    {/* Full evidence details */}
                    {panelData.evidence && (
                      <div className="p-4 rounded-lg bg-muted/50 mb-6">
                        {'description' in panelData.evidence && (
                          <>
                            <h4 className="font-semibold text-foreground mb-2">Details</h4>
                            <p className="text-sm text-muted-foreground">
                              {panelData.evidence.description}
                            </p>
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
                    
                    {/* Connected roots */}
                    {panelData.roots && panelData.roots.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-3">
                          Built on these foundations
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
