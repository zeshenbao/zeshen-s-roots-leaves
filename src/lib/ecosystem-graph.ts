/**
 * Ecosystem Graph Utilities
 * Clean graph traversal logic for the Skill Ecosystem
 * PRIVACY: No grades, no sensitive identifiers
 */

import {
  treeRoots, treeTrunk, treeBranches, treeLeaves, treeEdges,
  type RootNode, type TrunkNode, type BranchNode, type LeafNode, type TreeEdge
} from '@/lib/content';

// ============ TYPES ============

export type ViewMode = 'overview' | 'focus';

export interface GraphNode {
  id: string;
  type: 'root' | 'trunk' | 'branch' | 'leaf';
}

export interface GraphState {
  viewMode: ViewMode;
  selectedNodeId: string | null;
  selectedNodeType: 'root' | 'trunk' | 'branch' | 'leaf' | null;
  showAllWhileFocused: boolean;
}

export interface VisibleGraph {
  nodeIds: Set<string>;
  edgeIds: Set<string>;
}

// ============ ADJACENCY MAPS (built once) ============

// Map: nodeId -> Set of parent node IDs (upstream)
const parentMap = new Map<string, Set<string>>();

// Map: nodeId -> Set of child node IDs (downstream)
const childMap = new Map<string, Set<string>>();

// Map: nodeId -> Set of edge IDs connected to this node
const nodeEdgesMap = new Map<string, Set<string>>();

// Map: edgeId -> edge object
const edgeMap = new Map<string, TreeEdge>();

// Build adjacency maps on module load
function buildAdjacencyMaps() {
  // Initialize maps for all nodes
  const allNodeIds = [
    ...treeRoots.map(r => r.id),
    treeTrunk.id,
    ...treeBranches.map(b => b.id),
    ...treeLeaves.map(l => l.id),
  ];

  allNodeIds.forEach(id => {
    parentMap.set(id, new Set());
    childMap.set(id, new Set());
    nodeEdgesMap.set(id, new Set());
  });

  // Process edges
  treeEdges.forEach(edge => {
    edgeMap.set(edge.id, edge);
    
    // Parent relationship: target's parent is source
    parentMap.get(edge.target)?.add(edge.source);
    
    // Child relationship: source's child is target
    childMap.get(edge.source)?.add(edge.target);
    
    // Edge connections
    nodeEdgesMap.get(edge.source)?.add(edge.id);
    nodeEdgesMap.get(edge.target)?.add(edge.id);
  });
}

// Initialize on module load
buildAdjacencyMaps();

// ============ GRAPH TRAVERSAL ============

/**
 * Get all nodes upstream from a given node (toward roots)
 * Used when a leaf is selected - shows only the path to its foundations
 * IMPORTANT: For leaves, only include roots that are in the branch's rootIds
 */
export function getUpstreamSubgraph(nodeId: string): VisibleGraph {
  const nodeIds = new Set<string>([nodeId]);
  const edgeIds = new Set<string>();
  
  const nodeType = getNodeType(nodeId);
  
  // Special handling for leaves - only show roots connected via branch.rootIds
  if (nodeType === 'leaf') {
    const leaf = treeLeaves.find(l => l.id === nodeId);
    if (!leaf) return { nodeIds, edgeIds };
    
    const branch = treeBranches.find(b => b.id === leaf.branchId);
    if (!branch) return { nodeIds, edgeIds };
    
    // Add branch
    nodeIds.add(branch.id);
    
    // Add leaf -> branch edge
    treeEdges.forEach(edge => {
      if (edge.source === branch.id && edge.target === nodeId) {
        edgeIds.add(edge.id);
      }
    });
    
    // Add trunk
    nodeIds.add('trunk');
    
    // Add trunk -> branch edge
    treeEdges.forEach(edge => {
      if (edge.source === 'trunk' && edge.target === branch.id) {
        edgeIds.add(edge.id);
      }
    });
    
    // Add ONLY the roots specified in branch.rootIds
    branch.rootIds.forEach(rootId => {
      nodeIds.add(rootId);
      
      // Add root -> trunk edge
      treeEdges.forEach(edge => {
        if (edge.source === rootId && edge.target === 'trunk') {
          edgeIds.add(edge.id);
        }
      });
    });
    
    return { nodeIds, edgeIds };
  }
  
  // For non-leaf nodes, use standard BFS upstream
  const queue = [nodeId];
  
  while (queue.length > 0) {
    const currentId = queue.shift()!;
    const parents = parentMap.get(currentId);
    
    if (parents) {
      parents.forEach(parentId => {
        if (!nodeIds.has(parentId)) {
          nodeIds.add(parentId);
          queue.push(parentId);
        }
        
        // Find the edge connecting parent -> current
        treeEdges.forEach(edge => {
          if (edge.source === parentId && edge.target === currentId) {
            edgeIds.add(edge.id);
          }
        });
      });
    }
  }
  
  return { nodeIds, edgeIds };
}

/**
 * Get all nodes downstream from a given node (toward leaves)
 * Used when a root is selected - shows all its connected outcomes
 */
export function getDownstreamSubgraph(nodeId: string): VisibleGraph {
  const nodeIds = new Set<string>([nodeId]);
  const edgeIds = new Set<string>();
  
  // For roots, we need to go through trunk first
  // Check if this is a root - if so, include trunk as starting point
  const isRoot = treeRoots.some(r => r.id === nodeId);
  
  if (isRoot) {
    // Root connects to trunk, then to branches that reference this root
    nodeIds.add('trunk');
    
    // Find edge from root to trunk
    treeEdges.forEach(edge => {
      if (edge.source === nodeId && edge.target === 'trunk') {
        edgeIds.add(edge.id);
      }
    });
    
    // Find branches that have this root in their rootIds
    treeBranches.forEach(branch => {
      if (branch.rootIds.includes(nodeId)) {
        nodeIds.add(branch.id);
        
        // Add trunk -> branch edge
        treeEdges.forEach(edge => {
          if (edge.source === 'trunk' && edge.target === branch.id) {
            edgeIds.add(edge.id);
          }
        });
        
        // Add all leaves of this branch
        treeLeaves.forEach(leaf => {
          if (leaf.branchId === branch.id) {
            nodeIds.add(leaf.id);
            
            // Add branch -> leaf edge
            treeEdges.forEach(edge => {
              if (edge.source === branch.id && edge.target === leaf.id) {
                edgeIds.add(edge.id);
              }
            });
          }
        });
      }
    });
  } else {
    // Standard BFS downstream
    const queue = [nodeId];
    
    while (queue.length > 0) {
      const currentId = queue.shift()!;
      const children = childMap.get(currentId);
      
      if (children) {
        children.forEach(childId => {
          if (!nodeIds.has(childId)) {
            nodeIds.add(childId);
            queue.push(childId);
          }
          
          // Find the edge connecting current -> child
          treeEdges.forEach(edge => {
            if (edge.source === currentId && edge.target === childId) {
              edgeIds.add(edge.id);
            }
          });
        });
      }
    }
  }
  
  return { nodeIds, edgeIds };
}

/**
 * Get subgraph for a branch selection (both upstream and downstream)
 */
export function getBranchSubgraph(branchId: string): VisibleGraph {
  const upstream = getUpstreamSubgraph(branchId);
  const downstream = getDownstreamSubgraph(branchId);
  
  return {
    nodeIds: new Set([...upstream.nodeIds, ...downstream.nodeIds]),
    edgeIds: new Set([...upstream.edgeIds, ...downstream.edgeIds]),
  };
}

/**
 * Get the visible graph based on current state
 */
export function getVisibleGraph(state: GraphState): VisibleGraph | null {
  // In overview mode or with showAll enabled, show everything
  if (state.viewMode === 'overview' || state.showAllWhileFocused) {
    return null; // null means show all
  }
  
  // In focus mode with a selection
  if (state.viewMode === 'focus' && state.selectedNodeId) {
    switch (state.selectedNodeType) {
      case 'leaf':
        return getUpstreamSubgraph(state.selectedNodeId);
      case 'root':
        return getDownstreamSubgraph(state.selectedNodeId);
      case 'branch':
        return getBranchSubgraph(state.selectedNodeId);
      case 'trunk':
        // Trunk selected: show everything connected (all)
        return null;
      default:
        return null;
    }
  }
  
  return null;
}

// ============ HELPER FUNCTIONS ============

/**
 * Get connected roots for a specific leaf (only the ones actually feeding it)
 */
export function getConnectedRootsForLeaf(leafId: string): RootNode[] {
  const leaf = treeLeaves.find(l => l.id === leafId);
  if (!leaf) return [];
  
  const branch = treeBranches.find(b => b.id === leaf.branchId);
  if (!branch) return [];
  
  return treeRoots.filter(root => branch.rootIds.includes(root.id));
}

/**
 * Get connected leaves for a specific root
 */
export function getConnectedLeavesForRoot(rootId: string): LeafNode[] {
  const connectedBranches = treeBranches.filter(b => b.rootIds.includes(rootId));
  const branchIds = new Set(connectedBranches.map(b => b.id));
  
  return treeLeaves.filter(leaf => branchIds.has(leaf.branchId));
}

/**
 * Get the branch for a leaf
 */
export function getBranchForLeaf(leafId: string): BranchNode | null {
  const leaf = treeLeaves.find(l => l.id === leafId);
  if (!leaf) return null;
  
  return treeBranches.find(b => b.id === leaf.branchId) || null;
}

/**
 * Get node type from ID
 */
export function getNodeType(nodeId: string): 'root' | 'trunk' | 'branch' | 'leaf' | null {
  if (treeRoots.some(r => r.id === nodeId)) return 'root';
  if (treeTrunk.id === nodeId) return 'trunk';
  if (treeBranches.some(b => b.id === nodeId)) return 'branch';
  if (treeLeaves.some(l => l.id === nodeId)) return 'leaf';
  return null;
}
