import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Fuse from 'fuse.js';
import { treeRoots, treeBranches, treeLeaves, type RootNode, type BranchNode, type LeafNode } from '@/lib/content';
import { usePortfolioStore } from '@/lib/store';
import { CircleDot, GitBranch, Leaf, Sparkles, Search, Command } from 'lucide-react';

interface SearchItem {
  id: string;
  name: string;
  description: string;
  type: 'root' | 'branch' | 'leaf';
  isFruit?: boolean;
  data: RootNode | BranchNode | LeafNode;
}

// Build searchable items from tree data
const searchItems: SearchItem[] = [
  ...treeRoots.map(root => ({
    id: root.id,
    name: root.name,
    description: root.description,
    type: 'root' as const,
    data: root,
  })),
  ...treeBranches.map(branch => ({
    id: branch.id,
    name: branch.name,
    description: branch.description,
    type: 'branch' as const,
    data: branch,
  })),
  ...treeLeaves.map(leaf => ({
    id: leaf.id,
    name: leaf.name,
    description: leaf.summary,
    type: 'leaf' as const,
    isFruit: leaf.isFruit,
    data: leaf,
  })),
];

// Fuse.js configuration
const fuse = new Fuse(searchItems, {
  keys: ['name', 'description'],
  threshold: 0.4,
  includeScore: true,
  minMatchCharLength: 1,
});

export function CommandPalette() {
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    openSidePanel,
    setSelectedRoot,
    setSelectedLeaf,
  } = usePortfolioStore();

  // Search results
  const results = useMemo(() => {
    if (!query.trim()) {
      // Show all items grouped by type when no query
      return searchItems;
    }
    return fuse.search(query).map(result => result.item);
  }, [query]);

  // Reset state when opening
  useEffect(() => {
    if (commandPaletteOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Focus input after a short delay for animation
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandPaletteOpen]);

  // Keyboard shortcut to open (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!commandPaletteOpen);
      }
      if (e.key === 'Escape' && commandPaletteOpen) {
        e.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [commandPaletteOpen, setCommandPaletteOpen]);

  // Handle selection
  const handleSelect = useCallback((item: SearchItem) => {
    // Scroll to ecosystem section
    const ecosystemSection = document.getElementById('ecosystem');
    if (ecosystemSection) {
      ecosystemSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Set selection and open panel
    if (item.type === 'root') {
      setSelectedRoot(item.id);
      setSelectedLeaf(null);
      openSidePanel({ type: 'root', id: item.id });
    } else if (item.type === 'branch') {
      setSelectedRoot(null);
      setSelectedLeaf(null);
      openSidePanel({ type: 'root', id: item.id }); // Branches use root panel type
    } else {
      setSelectedLeaf(item.id);
      setSelectedRoot(null);
      openSidePanel({ type: 'leaf', id: item.id });
    }

    setCommandPaletteOpen(false);
  }, [openSidePanel, setSelectedRoot, setSelectedLeaf, setCommandPaletteOpen]);

  // Keyboard navigation within list
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (results[selectedIndex]) {
          handleSelect(results[selectedIndex]);
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (e.shiftKey) {
          setSelectedIndex(prev => Math.max(prev - 1, 0));
        } else {
          setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
        }
        break;
    }
  }, [results, selectedIndex, handleSelect]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
      selectedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  // Reset index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results.length]);

  const getIcon = (item: SearchItem) => {
    if (item.type === 'root') return CircleDot;
    if (item.type === 'branch') return GitBranch;
    if (item.isFruit) return Sparkles;
    return Leaf;
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'root': return 'Foundation';
      case 'branch': return 'Branch';
      case 'leaf': return 'Evidence';
      default: return type;
    }
  };

  return (
    <AnimatePresence>
      {commandPaletteOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
            onClick={() => setCommandPaletteOpen(false)}
            aria-hidden="true"
          />

          {/* Palette */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.15 }}
            className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-lg z-[101]"
            role="dialog"
            aria-modal="true"
            aria-label="Command palette - search skills and projects"
          >
            <div className="bg-card border border-border rounded-xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
                <Search className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search roots, branches, and leaves..."
                  className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground outline-none text-base"
                  aria-label="Search"
                  autoComplete="off"
                  spellCheck="false"
                />
                <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-xs text-muted-foreground">
                  <Command className="w-3 h-3" />K
                </kbd>
              </div>

              {/* Results list */}
              <div 
                ref={listRef}
                className="max-h-[60vh] overflow-y-auto py-2"
                role="listbox"
                aria-label="Search results"
              >
                {results.length === 0 ? (
                  <div className="px-4 py-8 text-center text-muted-foreground">
                    <p>No results found for "{query}"</p>
                  </div>
                ) : (
                  results.map((item, index) => {
                    const Icon = getIcon(item);
                    const isSelected = index === selectedIndex;
                    
                    return (
                      <div
                        key={item.id}
                        data-index={index}
                        role="option"
                        aria-selected={isSelected}
                        className={`
                          flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors
                          ${isSelected ? 'bg-primary/10' : 'hover:bg-muted/50'}
                        `}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        <div className={`
                          flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
                          ${item.type === 'root' ? 'bg-primary/20 text-primary' : 
                            item.type === 'branch' ? 'bg-secondary/20 text-secondary' : 
                            item.isFruit ? 'bg-secondary/30 text-secondary' : 'bg-muted text-muted-foreground'}
                        `}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`font-medium truncate ${isSelected ? 'text-foreground' : 'text-foreground/90'}`}>
                              {item.name}
                            </span>
                            {item.isFruit && (
                              <span className="text-xs text-secondary">★</span>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {item.description}
                          </p>
                        </div>
                        
                        <span className="flex-shrink-0 text-xs text-muted-foreground uppercase tracking-wider">
                          {getTypeLabel(item.type)}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer hints */}
              <div className="flex items-center justify-between px-4 py-2 border-t border-border bg-muted/30 text-xs text-muted-foreground">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">↑↓</kbd>
                    navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">↵</kbd>
                    select
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-muted rounded">esc</kbd>
                    close
                  </span>
                </div>
                <span>{results.length} items</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
