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

// Node dimensions
const NODE_WIDTH = 200;
const NODE_HEIGHT = 52;

export function ConnectionLine({ edge, nodes }: ConnectionLineProps) {
  // Find node by ID (flat search since Canvas now passes all nodes)
  const findNode = (nodeId: string): ActivityNode | ControlFlowContainer | null => {
    return nodes.find(n => n.id === nodeId) || null;
  };

  const sourceNode = findNode(edge.sourceId);
  const targetNode = findNode(edge.targetId);

  // Calculate path
  const pathData = useMemo(() => {
    if (!sourceNode || !targetNode) {
      return null;
    }

    // Get connection points
    const isSourceContainer = 'children' in sourceNode || 'routes' in sourceNode;
    const isTargetContainer = 'children' in targetNode || 'routes' in targetNode;

    const sourceWidth = isSourceContainer
      ? (sourceNode as ControlFlowContainer).dimensions?.width || 300
      : NODE_WIDTH;
    const targetWidth = isTargetContainer
      ? (targetNode as ControlFlowContainer).dimensions?.width || 300
      : NODE_WIDTH;

    const sourceHeight = NODE_HEIGHT;
    const targetHeight = NODE_HEIGHT;

    // Source point (right side)
    const sx = sourceNode.position.x + sourceWidth;
    const sy = sourceNode.position.y + sourceHeight / 2;

    // Target point (left side)
    const tx = targetNode.position.x;
    const ty = targetNode.position.y + targetHeight / 2;

    // Calculate control points for smooth bezier curve
    const dx = tx - sx;
    const offset = Math.max(50, Math.min(Math.abs(dx) * 0.4, 120));

    const c1x = sx + offset;
    const c1y = sy;
    const c2x = tx - offset;
    const c2y = ty;

    return {
      path: `M ${sx} ${sy} C ${c1x} ${c1y}, ${c2x} ${c2y}, ${tx} ${ty}`,
      source: { x: sx, y: sy },
      target: { x: tx, y: ty },
    };
  }, [sourceNode, targetNode]);

  if (!pathData) {
    return null;
  }

  return (
    <g className="connection-line">
      {/* Main path */}
      <path
        d={pathData.path}
        fill="none"
        stroke="#9ca3af"
        strokeWidth="1.5"
        markerEnd="url(#arrowhead)"
      />
    </g>
  );
}
