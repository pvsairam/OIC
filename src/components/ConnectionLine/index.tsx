/* ============================================
   Connection Line Component
   SVG-based edge rendering with smart routing
   ============================================ */

import { useMemo } from 'react';
import type { ConnectionEdge, ActivityNode, ControlFlowContainer, Point } from '../../types';
import './ConnectionLine.css';

interface ConnectionLineProps {
  edge: ConnectionEdge;
  nodes: (ActivityNode | ControlFlowContainer)[];
}

// Node dimensions for calculating connection points
const NODE_WIDTH = 220;
const NODE_HEIGHT = 52;
const CONTAINER_HEADER_HEIGHT = 40;

export function ConnectionLine({ edge, nodes }: ConnectionLineProps) {
  // Find source and target nodes
  const findNode = (
    nodeId: string,
    nodeList: (ActivityNode | ControlFlowContainer)[]
  ): ActivityNode | ControlFlowContainer | null => {
    for (const node of nodeList) {
      if (node.id === nodeId) return node;
      if ('children' in node && node.children) {
        const found = findNode(nodeId, node.children);
        if (found) return found;
      }
      if ('routes' in node && node.routes) {
        for (const route of node.routes) {
          const found = findNode(nodeId, route.children);
          if (found) return found;
        }
      }
    }
    return null;
  };

  const sourceNode = findNode(edge.sourceId, nodes);
  const targetNode = findNode(edge.targetId, nodes);

  // Calculate path
  const path = useMemo(() => {
    if (!sourceNode || !targetNode) return null;

    // Get connection points based on handle positions
    const getConnectionPoint = (
      node: ActivityNode | ControlFlowContainer,
      handle: 'top' | 'right' | 'bottom' | 'left' = 'right',
      isSource: boolean = true
    ): Point => {
      const isContainer = 'children' in node || 'routes' in node;
      const width = isContainer ? (node as ControlFlowContainer).dimensions.width : NODE_WIDTH;
      const height = isContainer ? CONTAINER_HEADER_HEIGHT : NODE_HEIGHT;

      const x = node.position.x;
      const y = node.position.y;

      switch (handle) {
        case 'top':
          return { x: x + width / 2, y };
        case 'right':
          return { x: x + width, y: y + height / 2 };
        case 'bottom':
          return { x: x + width / 2, y: y + height };
        case 'left':
          return { x, y: y + height / 2 };
        default:
          return isSource
            ? { x: x + width, y: y + height / 2 }
            : { x, y: y + height / 2 };
      }
    };

    const sourcePoint = getConnectionPoint(
      sourceNode,
      edge.sourceHandle || 'right',
      true
    );
    const targetPoint = getConnectionPoint(
      targetNode,
      edge.targetHandle || 'left',
      false
    );

    // Calculate smooth bezier curve
    const dx = targetPoint.x - sourcePoint.x;
    const dy = targetPoint.y - sourcePoint.y;

    // Control point offset based on distance
    const offset = Math.min(Math.abs(dx) / 2, 80);

    // Create bezier path for horizontal flow
    const controlPoint1 = {
      x: sourcePoint.x + offset,
      y: sourcePoint.y,
    };
    const controlPoint2 = {
      x: targetPoint.x - offset,
      y: targetPoint.y,
    };

    // Handle vertical connections
    if (edge.sourceHandle === 'bottom' || edge.targetHandle === 'top') {
      const vertOffset = Math.min(Math.abs(dy) / 2, 60);
      controlPoint1.x = sourcePoint.x;
      controlPoint1.y = sourcePoint.y + vertOffset;
      controlPoint2.x = targetPoint.x;
      controlPoint2.y = targetPoint.y - vertOffset;
    }

    return {
      d: `M ${sourcePoint.x} ${sourcePoint.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${targetPoint.x} ${targetPoint.y}`,
      sourcePoint,
      targetPoint,
    };
  }, [sourceNode, targetNode, edge.sourceHandle, edge.targetHandle]);

  if (!path) return null;

  const edgeType = edge.type || 'default';

  return (
    <g className={`connection-line connection-line--${edgeType}`}>
      {/* Background path for hover area */}
      <path
        className="connection-line__hover-area"
        d={path.d}
        fill="none"
        strokeWidth="12"
        stroke="transparent"
      />

      {/* Main path */}
      <path
        className="connection-line__path"
        d={path.d}
        fill="none"
      />

      {/* Arrow marker at target */}
      <polygon
        className="connection-line__arrow"
        points={`${path.targetPoint.x - 6},${path.targetPoint.y - 4} ${path.targetPoint.x},${path.targetPoint.y} ${path.targetPoint.x - 6},${path.targetPoint.y + 4}`}
      />

      {/* Label if present */}
      {edge.label && (
        <text
          className="connection-line__label"
          x={(path.sourcePoint.x + path.targetPoint.x) / 2}
          y={(path.sourcePoint.y + path.targetPoint.y) / 2 - 8}
          textAnchor="middle"
        >
          {edge.label}
        </text>
      )}
    </g>
  );
}
