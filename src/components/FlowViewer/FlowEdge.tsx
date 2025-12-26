/* ============================================
   Flow Edge Component
   Connection line between nodes
   ============================================ */

import { useMemo } from 'react';
import type { ConnectionEdge, ActivityNode, ControlFlowContainer } from '../../types';

interface FlowEdgeProps {
  edge: ConnectionEdge;
  nodes: (ActivityNode | ControlFlowContainer)[];
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 56;

export function FlowEdge({ edge, nodes }: FlowEdgeProps) {
  const sourceNode = nodes.find((n) => n.id === edge.sourceId);
  const targetNode = nodes.find((n) => n.id === edge.targetId);

  const pathData = useMemo(() => {
    if (!sourceNode || !targetNode) return null;

    // Source point (right side of node)
    const sx = sourceNode.position.x + NODE_WIDTH;
    const sy = sourceNode.position.y + NODE_HEIGHT / 2;

    // Target point (left side of node)
    const tx = targetNode.position.x;
    const ty = targetNode.position.y + NODE_HEIGHT / 2;

    // Control points for smooth bezier
    const dx = tx - sx;
    const offset = Math.max(40, Math.min(Math.abs(dx) * 0.4, 100));

    return {
      path: `M ${sx} ${sy} C ${sx + offset} ${sy}, ${tx - offset} ${ty}, ${tx} ${ty}`,
    };
  }, [sourceNode, targetNode]);

  if (!pathData) return null;

  return (
    <path
      className="flow-edge"
      d={pathData.path}
      fill="none"
      stroke="#94a3b8"
      strokeWidth="2"
      markerEnd="url(#arrow)"
    />
  );
}
