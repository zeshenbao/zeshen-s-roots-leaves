import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import * as d3 from 'd3-force';
import { skillRoots, skillLeaves, getLeavesByRoot, getRootsByLeaf, projects } from '@/lib/content';
import type { SkillRoot, SkillLeaf } from '@/lib/content';
import { usePortfolioStore } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X } from 'lucide-react';

interface TreeNode {
  id: string;
  name: string;
  type: 'root' | 'leaf';
  x: number;
  y: number;
  fx?: number | null;
  fy?: number | null;
  color: string;
  data: SkillRoot | SkillLeaf;
}

interface TreeLink {
  source: string;
  target: string;
}

// Get project details for a leaf
function getProjectDetails(leafId: string) {
  const leaf = skillLeaves.find(l => l.id === leafId);
  if (!leaf) return null;
  
  const project = projects.find(p => 
    p.title.toLowerCase().includes(leaf.name.toLowerCase().split(' ')[0]) ||
    leaf.name.toLowerCase().includes(p.title.toLowerCase().split(' ')[0])
  );
  
  return project;
}

export function SkillEcosystemSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [nodes, setNodes] = useState<TreeNode[]>([]);
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

  // Build links from roots to leaves
  const links = useMemo<TreeLink[]>(() => {
    const result: TreeLink[] = [];
    skillLeaves.forEach(leaf => {
      leaf.rootIds.forEach(rootId => {
        result.push({ source: rootId, target: leaf.id });
      });
    });
    return result;
  }, []);

  // Initialize nodes with positions
  const initialNodes = useMemo<TreeNode[]>(() => {
    const rootNodes: TreeNode[] = skillRoots.map((root, i) => ({
      id: root.id,
      name: root.name,
      type: 'root' as const,
      x: (dimensions.width / (skillRoots.length + 1)) * (i + 1),
      y: dimensions.height - 80,
      color: root.color === 'primary' ? 'hsl(145 40% 45%)' : 
             root.color === 'secondary' ? 'hsl(38 60% 50%)' : 'hsl(210 50% 50%)',
      data: root,
    }));

    const leafNodes: TreeNode[] = skillLeaves.map((leaf, i) => ({
      id: leaf.id,
      name: leaf.name,
      type: 'leaf' as const,
      x: (dimensions.width / (skillLeaves.length + 1)) * (i + 1),
      y: 100 + Math.random() * 100,
      color: leaf.type === 'project' ? 'hsl(38 55% 50%)' : 
             leaf.type === 'course' ? 'hsl(210 50% 50%)' : 'hsl(145 45% 40%)',
      data: leaf,
    }));

    return [...rootNodes, ...leafNodes];
  }, [dimensions]);

  // Update dimensions on mount and resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ 
          width: Math.max(rect.width, 320), 
          height: Math.min(Math.max(rect.height, 400), 700) 
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Run force simulation
  useEffect(() => {
    if (featureFlags.reducedMotion) {
      // Static layout for reduced motion
      setNodes(initialNodes.map((node, i) => ({
        ...node,
        x: node.type === 'root' 
          ? (dimensions.width / (skillRoots.length + 1)) * (skillRoots.findIndex(r => r.id === node.id) + 1)
          : (dimensions.width / (skillLeaves.length + 1)) * (skillLeaves.findIndex(l => l.id === node.id) + 1),
        y: node.type === 'root' ? dimensions.height - 80 : 120,
      })));
      return;
    }

    const nodesCopy = initialNodes.map(n => ({ ...n }));
    
    // Anchor roots at the bottom
    nodesCopy.forEach(node => {
      if (node.type === 'root') {
        node.fy = dimensions.height - 80;
      }
    });

    const simulation = d3.forceSimulation(nodesCopy as any)
      .force('link', d3.forceLink(links.map(l => ({ ...l })))
        .id((d: any) => d.id)
        .distance(120)
        .strength(0.3))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('collide', d3.forceCollide().radius(50))
      .force('y', d3.forceY((d: any) => d.type === 'leaf' ? 150 : dimensions.height - 80).strength(0.5))
      .force('x', d3.forceX(dimensions.width / 2).strength(0.05))
      .alpha(performanceTier === 'low' ? 0.1 : 0.3)
      .alphaDecay(0.02);

    simulation.on('tick', () => {
      setNodes([...nodesCopy].map(n => ({
        ...n,
        x: Math.max(60, Math.min(dimensions.width - 60, n.x)),
        y: Math.max(40, Math.min(dimensions.height - 40, n.y)),
      })));
    });

    return () => { simulation.stop(); };
  }, [initialNodes, links, dimensions, featureFlags.reducedMotion, performanceTier]);

  // Get connected node IDs
  const getConnectedNodes = useCallback((nodeId: string) => {
    const connectedLinks = links.filter(l => l.source === nodeId || l.target === nodeId);
    return new Set(connectedLinks.flatMap(l => [l.source, l.target]));
  }, [links]);

  // Handle node click
  const handleNodeClick = (node: TreeNode) => {
    if (node.type === 'root') {
      setSelectedRoot(selectedRoot === node.id ? null : node.id);
      setSelectedLeaf(null);
      if (selectedRoot !== node.id) {
        openSidePanel({ type: 'root', id: node.id });
      } else {
        closeSidePanel();
      }
    } else {
      setSelectedLeaf(selectedLeaf === node.id ? null : node.id);
      setSelectedRoot(null);
      if (selectedLeaf !== node.id) {
        openSidePanel({ type: 'leaf', id: node.id });
      } else {
        closeSidePanel();
      }
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
      const root = skillRoots.find(r => r.id === sidePanelContent.id);
      const leaves = getLeavesByRoot(sidePanelContent.id);
      return { root, leaves };
    } else {
      const leaf = skillLeaves.find(l => l.id === sidePanelContent.id);
      const roots = getRootsByLeaf(sidePanelContent.id);
      const project = getProjectDetails(sidePanelContent.id);
      return { leaf, roots, project };
    }
  }, [sidePanelContent]);

  return (
    <section 
      id="ecosystem" 
      className="relative py-24 px-6 min-h-screen"
      aria-label="Skill Ecosystem - Interactive visualization of skills and projects"
    >
      <div className="container max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-display font-semibold text-foreground mb-4">
            Skill <span className="text-gradient">Ecosystem</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Foundational <strong>roots</strong> (mathematics, physics, ML theory) branch into applied <strong>leaves</strong> (projects, research, courses). 
            Hover to explore connections, click to see details.
          </p>
        </div>

        {/* Main Tree Visualization */}
        <div 
          ref={containerRef}
          className="relative w-full h-[500px] md:h-[600px] glass-card rounded-2xl overflow-hidden"
        >
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="w-full h-full"
            role="img"
            aria-label="Skill tree visualization showing connections between foundational skills and projects"
          >
            {/* Gradient definitions */}
            <defs>
              <linearGradient id="link-gradient" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="hsl(145 40% 45%)" stopOpacity="0.6" />
                <stop offset="100%" stopColor="hsl(38 60% 50%)" stopOpacity="0.4" />
              </linearGradient>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>

            {/* Links/Edges */}
            <g className="links">
              {links.map((link, i) => {
                const sourceNode = nodes.find(n => n.id === link.source);
                const targetNode = nodes.find(n => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                const isHighlighted = highlightedNodes.has(link.source) && highlightedNodes.has(link.target);
                const isActive = selectedRoot === link.source || selectedLeaf === link.target;

                return (
                  <motion.path
                    key={`${link.source}-${link.target}`}
                    d={`M${sourceNode.x},${sourceNode.y} Q${(sourceNode.x + targetNode.x) / 2},${(sourceNode.y + targetNode.y) / 2 + 30} ${targetNode.x},${targetNode.y}`}
                    fill="none"
                    stroke={isActive ? 'hsl(145 50% 50%)' : 'url(#link-gradient)'}
                    strokeWidth={isHighlighted ? 2.5 : 1}
                    strokeOpacity={highlightedNodes.size > 0 && !isHighlighted ? 0.15 : isHighlighted ? 0.9 : 0.3}
                    initial={false}
                    animate={{
                      strokeOpacity: highlightedNodes.size > 0 && !isHighlighted ? 0.15 : isHighlighted ? 0.9 : 0.3,
                      strokeWidth: isHighlighted ? 2.5 : 1,
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
                      opacity: isHighlighted ? 1 : 0.3,
                    }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                    style={{ cursor: 'pointer' }}
                    onMouseEnter={(e) => {
                      setHoveredNode(node.id);
                      const rect = svgRef.current?.getBoundingClientRect();
                      if (rect) {
                        setTooltipPos({ x: node.x, y: node.y - 50 });
                      }
                    }}
                    onMouseLeave={() => setHoveredNode(null)}
                    onClick={() => handleNodeClick(node)}
                    role="button"
                    tabIndex={0}
                    aria-label={`${node.type === 'root' ? 'Foundation' : 'Project'}: ${node.name}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleNodeClick(node);
                      }
                    }}
                  >
                    {node.type === 'root' ? (
                      <circle
                        r={isSelected ? 28 : 24}
                        fill={node.color}
                        stroke={isSelected ? 'hsl(45 20% 95%)' : 'transparent'}
                        strokeWidth={2}
                        filter={isSelected ? 'url(#glow)' : undefined}
                        style={{ transform: 'translate(0, 0)' }}
                      />
                    ) : (
                      <rect
                        x={-40}
                        y={-16}
                        width={80}
                        height={32}
                        rx={8}
                        fill={node.color}
                        stroke={isSelected ? 'hsl(45 20% 95%)' : 'transparent'}
                        strokeWidth={2}
                        filter={isSelected ? 'url(#glow)' : undefined}
                        style={{ transform: 'translate(0, 0)' }}
                      />
                    )}
                    <text
                      textAnchor="middle"
                      dy={node.type === 'root' ? '0.35em' : '0.35em'}
                      fontSize={node.type === 'root' ? 10 : 9}
                      fill="hsl(220 20% 4%)"
                      fontWeight={600}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {node.name.length > 12 ? node.name.slice(0, 11) + '…' : node.name}
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
                className="absolute pointer-events-none bg-popover/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg max-w-xs"
                style={{ 
                  left: Math.min(tooltipPos.x, dimensions.width - 200), 
                  top: Math.max(tooltipPos.y, 60),
                  transform: 'translateX(-50%)'
                }}
              >
                {(() => {
                  const node = nodes.find(n => n.id === hoveredNode);
                  if (!node) return null;
                  
                  if (node.type === 'root') {
                    const root = node.data as SkillRoot;
                    return (
                      <>
                        <p className="font-semibold text-foreground text-sm">{root.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{root.description}</p>
                        <p className="text-xs text-primary mt-1">
                          {getLeavesByRoot(root.id).length} connected projects
                        </p>
                      </>
                    );
                  } else {
                    const leaf = node.data as SkillLeaf;
                    return (
                      <>
                        <p className="font-semibold text-foreground text-sm">{leaf.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{leaf.evidence}</p>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {leaf.type}
                        </Badge>
                      </>
                    );
                  }
                })()}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Legend */}
          <div className="absolute bottom-4 left-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-4 rounded-full bg-primary" />
              <span>Foundations</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 rounded bg-secondary" />
              <span>Projects</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 rounded bg-tertiary" />
              <span>Courses</span>
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

                {sidePanelContent?.type === 'root' && panelData.root && (
                  <>
                    <Badge 
                      variant="outline" 
                      className="mb-2"
                      style={{ 
                        borderColor: panelData.root.color === 'primary' ? 'hsl(145 40% 45%)' : 
                                     panelData.root.color === 'secondary' ? 'hsl(38 60% 50%)' : 'hsl(210 50% 50%)'
                      }}
                    >
                      Foundation
                    </Badge>
                    <h3 className="text-2xl font-display font-semibold text-foreground mb-2">
                      {panelData.root.name}
                    </h3>
                    <p className="text-muted-foreground mb-6">{panelData.root.description}</p>
                    
                    <h4 className="text-sm font-semibold text-foreground mb-3">Connected Leaves</h4>
                    <div className="space-y-3">
                      {panelData.leaves?.map(leaf => (
                        <Card 
                          key={leaf.id} 
                          className="hover-lift cursor-pointer"
                          onClick={() => {
                            setSelectedLeaf(leaf.id);
                            setSelectedRoot(null);
                            openSidePanel({ type: 'leaf', id: leaf.id });
                          }}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium text-foreground">{leaf.name}</p>
                                <p className="text-sm text-muted-foreground mt-1">{leaf.evidence}</p>
                              </div>
                              <Badge variant="secondary" className="text-xs shrink-0">
                                {leaf.type}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}

                {sidePanelContent?.type === 'leaf' && panelData.leaf && (
                  <>
                    <Badge variant="outline" className="mb-2">
                      {panelData.leaf.type === 'project' ? 'Project' : 
                       panelData.leaf.type === 'course' ? 'Course' : 'Experience'}
                    </Badge>
                    <h3 className="text-2xl font-display font-semibold text-foreground mb-2">
                      {panelData.leaf.name}
                    </h3>
                    <p className="text-muted-foreground mb-4">{panelData.leaf.evidence}</p>

                    {panelData.project && (
                      <Card className="mb-6">
                        <CardHeader>
                          <CardTitle className="text-lg">Project Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <p className="text-sm font-medium text-foreground">Description</p>
                            <p className="text-sm text-muted-foreground mt-1">{panelData.project.description}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">Date</p>
                            <p className="text-sm text-muted-foreground mt-1">{panelData.project.date}</p>
                          </div>
                          {panelData.project.links && panelData.project.links.length > 0 && (
                            <div className="flex gap-2 mt-3">
                              {panelData.project.links.map((link, i) => (
                                <Badge key={i} variant="secondary">
                                  {link.url ? (
                                    <a 
                                      href={link.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="hover:underline"
                                    >
                                      {link.label}
                                    </a>
                                  ) : (
                                    link.label
                                  )}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )}
                    
                    <h4 className="text-sm font-semibold text-foreground mb-3">Connected Roots</h4>
                    <div className="flex flex-wrap gap-2">
                      {panelData.roots?.map(root => (
                        <Badge 
                          key={root.id}
                          variant="outline"
                          className="cursor-pointer hover:bg-muted transition-colors"
                          onClick={() => {
                            setSelectedRoot(root.id);
                            setSelectedLeaf(null);
                            openSidePanel({ type: 'root', id: root.id });
                          }}
                        >
                          {root.name}
                        </Badge>
                      ))}
                    </div>
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
