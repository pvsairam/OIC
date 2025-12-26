/* ============================================
   OIC Flow Visualizer - State Management
   Zustand store for application state
   ============================================ */

import { create } from 'zustand';
import type {
  IntegrationFlow,
  ViewportState,
  ActivityNode,
  ControlFlowContainer,
  BreadcrumbItem,
} from '../types';

// ============================================
// Canvas Store
// ============================================

interface CanvasStore {
  // Flow data
  flow: IntegrationFlow | null;
  setFlow: (flow: IntegrationFlow | null) => void;

  // Viewport
  viewport: ViewportState;
  setViewport: (viewport: ViewportState) => void;
  pan: (deltaX: number, deltaY: number) => void;
  zoom: (factor: number, centerX?: number, centerY?: number) => void;
  resetViewport: () => void;

  // Selection
  selectedNodeId: string | null;
  selectNode: (nodeId: string | null) => void;

  // Hover
  hoveredNodeId: string | null;
  setHoveredNode: (nodeId: string | null) => void;

  // Interaction states
  isPanning: boolean;
  setIsPanning: (isPanning: boolean) => void;

  // Find node by ID
  findNode: (nodeId: string) => ActivityNode | ControlFlowContainer | null;
}

const DEFAULT_VIEWPORT: ViewportState = {
  x: 0,
  y: 0,
  zoom: 1,
};

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 2;

export const useCanvasStore = create<CanvasStore>((set, get) => ({
  // Flow data
  flow: null,
  setFlow: (flow) => set({ flow, selectedNodeId: null }),

  // Viewport
  viewport: DEFAULT_VIEWPORT,
  setViewport: (viewport) => set({ viewport }),

  pan: (deltaX, deltaY) =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        x: state.viewport.x + deltaX,
        y: state.viewport.y + deltaY,
      },
    })),

  zoom: (factor, centerX = 0, centerY = 0) =>
    set((state) => {
      const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, state.viewport.zoom * factor));
      const zoomRatio = newZoom / state.viewport.zoom;

      return {
        viewport: {
          x: centerX - (centerX - state.viewport.x) * zoomRatio,
          y: centerY - (centerY - state.viewport.y) * zoomRatio,
          zoom: newZoom,
        },
      };
    }),

  resetViewport: () => set({ viewport: DEFAULT_VIEWPORT }),

  // Selection
  selectedNodeId: null,
  selectNode: (nodeId) => set({ selectedNodeId: nodeId }),

  // Hover
  hoveredNodeId: null,
  setHoveredNode: (nodeId) => set({ hoveredNodeId: nodeId }),

  // Interaction
  isPanning: false,
  setIsPanning: (isPanning) => set({ isPanning }),

  // Find node helper
  findNode: (nodeId) => {
    const { flow } = get();
    if (!flow) return null;

    const searchNodes = (
      nodes: (ActivityNode | ControlFlowContainer)[]
    ): ActivityNode | ControlFlowContainer | null => {
      for (const node of nodes) {
        if (node.id === nodeId) return node;
        if ('children' in node && node.children) {
          const found = searchNodes(node.children);
          if (found) return found;
        }
        if ('routes' in node && node.routes) {
          for (const route of node.routes) {
            const found = searchNodes(route.children);
            if (found) return found;
          }
        }
      }
      return null;
    };

    return searchNodes(flow.nodes);
  },
}));

// ============================================
// UI Store
// ============================================

interface UIStore {
  // Side panel
  isSidePanelOpen: boolean;
  toggleSidePanel: () => void;
  openSidePanel: () => void;
  closeSidePanel: () => void;

  // Minimap
  isMiniMapVisible: boolean;
  toggleMiniMap: () => void;

  // File dialog
  isFileDialogOpen: boolean;
  setFileDialogOpen: (isOpen: boolean) => void;

  // Breadcrumbs
  breadcrumbs: BreadcrumbItem[];
  setBreadcrumbs: (breadcrumbs: BreadcrumbItem[]) => void;
  pushBreadcrumb: (item: BreadcrumbItem) => void;
  popBreadcrumb: () => void;

  // Container expansion state
  expandedContainers: Set<string>;
  toggleContainer: (containerId: string) => void;
  expandContainer: (containerId: string) => void;
  collapseContainer: (containerId: string) => void;
  isContainerExpanded: (containerId: string) => boolean;
}

export const useUIStore = create<UIStore>((set, get) => ({
  // Side panel
  isSidePanelOpen: false,
  toggleSidePanel: () => set((state) => ({ isSidePanelOpen: !state.isSidePanelOpen })),
  openSidePanel: () => set({ isSidePanelOpen: true }),
  closeSidePanel: () => set({ isSidePanelOpen: false }),

  // Minimap
  isMiniMapVisible: true,
  toggleMiniMap: () => set((state) => ({ isMiniMapVisible: !state.isMiniMapVisible })),

  // File dialog
  isFileDialogOpen: false,
  setFileDialogOpen: (isOpen) => set({ isFileDialogOpen: isOpen }),

  // Breadcrumbs
  breadcrumbs: [],
  setBreadcrumbs: (breadcrumbs) => set({ breadcrumbs }),
  pushBreadcrumb: (item) =>
    set((state) => ({ breadcrumbs: [...state.breadcrumbs, item] })),
  popBreadcrumb: () =>
    set((state) => ({ breadcrumbs: state.breadcrumbs.slice(0, -1) })),

  // Container expansion
  expandedContainers: new Set<string>(),
  toggleContainer: (containerId) =>
    set((state) => {
      const newSet = new Set(state.expandedContainers);
      if (newSet.has(containerId)) {
        newSet.delete(containerId);
      } else {
        newSet.add(containerId);
      }
      return { expandedContainers: newSet };
    }),
  expandContainer: (containerId) =>
    set((state) => {
      const newSet = new Set(state.expandedContainers);
      newSet.add(containerId);
      return { expandedContainers: newSet };
    }),
  collapseContainer: (containerId) =>
    set((state) => {
      const newSet = new Set(state.expandedContainers);
      newSet.delete(containerId);
      return { expandedContainers: newSet };
    }),
  isContainerExpanded: (containerId) => get().expandedContainers.has(containerId),
}));
