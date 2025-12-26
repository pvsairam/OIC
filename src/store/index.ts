/* ============================================
   OIC Flow Visualizer - State Management
   ============================================ */

import { create } from 'zustand';
import type { IntegrationFlow, ViewportState, ActivityNode, ControlFlowContainer } from '../types';

// ============================================
// Types
// ============================================

export type AppView = 'dashboard' | 'flow';

export interface StoredIntegration {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  version?: string;
  importedAt: string;
  nodeCount: number;
  flow: IntegrationFlow;
}

// ============================================
// App Store
// ============================================

interface AppStore {
  // View navigation
  currentView: AppView;
  setView: (view: AppView) => void;

  // Integrations list
  integrations: StoredIntegration[];
  addIntegration: (flow: IntegrationFlow) => StoredIntegration;
  removeIntegration: (id: string) => void;

  // Current integration being viewed
  currentIntegration: StoredIntegration | null;
  openIntegration: (id: string) => void;
  closeIntegration: () => void;

  // Node selection
  selectedNodeId: string | null;
  selectNode: (id: string | null) => void;
  findNode: (id: string) => ActivityNode | ControlFlowContainer | null;

  // Side panel
  isSidePanelOpen: boolean;
  openSidePanel: () => void;
  closeSidePanel: () => void;

  // Viewport for canvas
  viewport: ViewportState;
  pan: (dx: number, dy: number) => void;
  zoom: (factor: number, cx?: number, cy?: number) => void;
  resetViewport: () => void;

  // Panning state
  isPanning: boolean;
  setIsPanning: (v: boolean) => void;
}

const DEFAULT_VIEWPORT: ViewportState = { x: 60, y: 60, zoom: 1 };

// Count all nodes including nested
function countNodes(nodes: (ActivityNode | ControlFlowContainer)[]): number {
  let count = 0;
  for (const node of nodes) {
    count++;
    if ('children' in node && node.children) {
      count += countNodes(node.children);
    }
    if ('routes' in node && node.routes) {
      for (const route of node.routes) {
        count += countNodes(route.children);
      }
    }
  }
  return count;
}

export const useAppStore = create<AppStore>((set, get) => ({
  // View
  currentView: 'dashboard',
  setView: (view) => set({ currentView: view }),

  // Integrations
  integrations: [],

  addIntegration: (flow) => {
    const integration: StoredIntegration = {
      id: `${flow.id || 'int'}-${Date.now()}`,
      name: flow.name,
      displayName: flow.displayName || flow.name,
      description: flow.description,
      version: flow.version,
      importedAt: new Date().toISOString(),
      nodeCount: countNodes(flow.nodes),
      flow,
    };
    set((state) => ({
      integrations: [integration, ...state.integrations],
    }));
    return integration;
  },

  removeIntegration: (id) =>
    set((state) => ({
      integrations: state.integrations.filter((i) => i.id !== id),
      currentIntegration: state.currentIntegration?.id === id ? null : state.currentIntegration,
    })),

  // Current integration
  currentIntegration: null,

  openIntegration: (id) => {
    const integration = get().integrations.find((i) => i.id === id);
    if (integration) {
      set({
        currentIntegration: integration,
        currentView: 'flow',
        selectedNodeId: null,
        viewport: DEFAULT_VIEWPORT,
      });
    }
  },

  closeIntegration: () =>
    set({
      currentIntegration: null,
      currentView: 'dashboard',
      selectedNodeId: null,
    }),

  // Node selection
  selectedNodeId: null,
  selectNode: (id) => set({ selectedNodeId: id }),

  findNode: (nodeId) => {
    const integration = get().currentIntegration;
    if (!integration) return null;

    const search = (nodes: (ActivityNode | ControlFlowContainer)[]): ActivityNode | ControlFlowContainer | null => {
      for (const node of nodes) {
        if (node.id === nodeId) return node;
        if ('children' in node && node.children) {
          const found = search(node.children);
          if (found) return found;
        }
        if ('routes' in node && node.routes) {
          for (const route of node.routes) {
            const found = search(route.children);
            if (found) return found;
          }
        }
      }
      return null;
    };

    return search(integration.flow.nodes);
  },

  // Side panel
  isSidePanelOpen: false,
  openSidePanel: () => set({ isSidePanelOpen: true }),
  closeSidePanel: () => set({ isSidePanelOpen: false }),

  // Viewport
  viewport: DEFAULT_VIEWPORT,
  pan: (dx, dy) =>
    set((state) => ({
      viewport: { ...state.viewport, x: state.viewport.x + dx, y: state.viewport.y + dy },
    })),
  zoom: (factor, cx = 0, cy = 0) =>
    set((state) => {
      const newZoom = Math.max(0.3, Math.min(2, state.viewport.zoom * factor));
      const ratio = newZoom / state.viewport.zoom;
      return {
        viewport: {
          x: cx - (cx - state.viewport.x) * ratio,
          y: cy - (cy - state.viewport.y) * ratio,
          zoom: newZoom,
        },
      };
    }),
  resetViewport: () => set({ viewport: DEFAULT_VIEWPORT }),

  // Panning
  isPanning: false,
  setIsPanning: (v) => set({ isPanning: v }),
}));
