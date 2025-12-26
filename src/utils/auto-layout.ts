/* ============================================
   Auto-Layout Engine
   Automatically positions nodes in a flow
   No manual x,y required - calculates based on structure
   ============================================ */

import type { IntegrationFlow, ActivityNode, ControlFlowContainer, ConnectionEdge } from '../types';

// Layout constants
const NODE_WIDTH = 180;
const NODE_HEIGHT = 56;
const NODE_SPACING_X = 60;
const NODE_SPACING_Y = 80;
const CONTAINER_PADDING = 40;

interface LayoutNode {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Applies automatic layout to an integration flow
 * Positions all nodes based on their connections and structure
 */
export function applyAutoLayout(flow: IntegrationFlow): IntegrationFlow {
  const layoutMap = new Map<string, LayoutNode>();

  // Build adjacency list from edges
  const adjacency = new Map<string, string[]>();
  const inDegree = new Map<string, number>();

  // Get all top-level node IDs
  const nodeIds = new Set<string>();
  flow.nodes.forEach((node) => {
    nodeIds.add(node.id);
    adjacency.set(node.id, []);
    inDegree.set(node.id, 0);
  });

  // Build graph from edges
  flow.edges.forEach((edge) => {
    if (nodeIds.has(edge.sourceId) && nodeIds.has(edge.targetId)) {
      const sources = adjacency.get(edge.sourceId) || [];
      sources.push(edge.targetId);
      adjacency.set(edge.sourceId, sources);
      inDegree.set(edge.targetId, (inDegree.get(edge.targetId) || 0) + 1);
    }
  });

  // Topological sort to determine node order
  const queue: string[] = [];
  inDegree.forEach((degree, nodeId) => {
    if (degree === 0) queue.push(nodeId);
  });

  const sortedNodes: string[] = [];
  while (queue.length > 0) {
    const nodeId = queue.shift()!;
    sortedNodes.push(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    neighbors.forEach((neighbor) => {
      const newDegree = (inDegree.get(neighbor) || 1) - 1;
      inDegree.set(neighbor, newDegree);
      if (newDegree === 0) queue.push(neighbor);
    });
  }

  // If topological sort didn't include all nodes, add remaining
  flow.nodes.forEach((node) => {
    if (!sortedNodes.includes(node.id)) {
      sortedNodes.push(node.id);
    }
  });

  // Calculate positions - horizontal flow
  let currentX = 0;
  const yBase = 0;

  sortedNodes.forEach((nodeId) => {
    const node = flow.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const isContainer = 'children' in node || 'routes' in node;
    const width = isContainer ? calculateContainerWidth(node as ControlFlowContainer) : NODE_WIDTH;
    const height = isContainer ? calculateContainerHeight(node as ControlFlowContainer) : NODE_HEIGHT;

    layoutMap.set(nodeId, {
      id: nodeId,
      x: currentX,
      y: yBase,
      width,
      height,
    });

    currentX += width + NODE_SPACING_X;
  });

  // Apply positions to nodes
  const layoutedNodes = flow.nodes.map((node) => {
    const layout = layoutMap.get(node.id);
    if (!layout) return node;

    const positioned = {
      ...node,
      position: { x: layout.x, y: layout.y },
    };

    // If it's a container, layout children too
    if ('children' in node && node.children) {
      positioned.children = layoutChildrenHorizontally(node.children as ActivityNode[]);
    }

    if ('routes' in node && node.routes) {
      let routeY = 60; // Start below header
      positioned.routes = node.routes.map((route) => {
        const layoutedRoute = {
          ...route,
          children: layoutChildrenHorizontally(route.children as ActivityNode[], 30, routeY),
        };
        routeY += 100; // Space between routes
        return layoutedRoute;
      });
    }

    return positioned;
  });

  return {
    ...flow,
    nodes: layoutedNodes,
  };
}

/**
 * Layout children nodes horizontally within a container
 */
function layoutChildrenHorizontally(
  children: ActivityNode[],
  startX: number = CONTAINER_PADDING,
  startY: number = 60
): ActivityNode[] {
  let x = startX;

  return children.map((child) => ({
    ...child,
    position: {
      x,
      y: startY,
    },
  }));
}

/**
 * Calculate container width based on children
 */
function calculateContainerWidth(container: ControlFlowContainer): number {
  let maxWidth = 300; // Minimum width

  if (container.children && container.children.length > 0) {
    maxWidth = Math.max(
      maxWidth,
      container.children.length * (NODE_WIDTH + 30) + CONTAINER_PADDING * 2
    );
  }

  if (container.routes) {
    container.routes.forEach((route) => {
      const routeWidth = route.children.length * (NODE_WIDTH + 30) + CONTAINER_PADDING * 2;
      maxWidth = Math.max(maxWidth, routeWidth);
    });
  }

  return container.dimensions?.width || maxWidth;
}

/**
 * Calculate container height based on children/routes
 */
function calculateContainerHeight(container: ControlFlowContainer): number {
  let height = 120; // Minimum height

  if (container.routes) {
    height = 60 + container.routes.length * 100; // Header + routes
  } else if (container.children && container.children.length > 0) {
    height = 60 + NODE_HEIGHT + CONTAINER_PADDING * 2;
  }

  return container.dimensions?.height || height;
}

/**
 * Creates a simple linear flow from node data
 * Used when parsing IAR files without position data
 */
export function createLinearFlow(nodes: Omit<ActivityNode, 'position'>[]): {
  nodes: ActivityNode[];
  edges: ConnectionEdge[];
} {
  const positionedNodes: ActivityNode[] = nodes.map((node, index) => ({
    ...node,
    position: {
      x: index * (NODE_WIDTH + NODE_SPACING_X),
      y: 0,
    },
  }));

  const edges: ConnectionEdge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `edge-${i}`,
      sourceId: nodes[i].id,
      targetId: nodes[i + 1].id,
    });
  }

  return { nodes: positionedNodes, edges };
}
