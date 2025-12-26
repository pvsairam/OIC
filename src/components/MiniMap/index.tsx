/* ============================================
   MiniMap Navigator Component
   Overview navigation for the canvas
   ============================================ */

import { useRef, useCallback, useMemo } from 'react';
import { useCanvasStore } from '../../store';
import type { ActivityNode, ControlFlowContainer } from '../../types';
import './MiniMap.css';

// Canvas and minimap dimensions
const CANVAS_WIDTH = 2000;
const CANVAS_HEIGHT = 1200;
const MINIMAP_PADDING = 20;

export function MiniMap() {
  const minimapRef = useRef<HTMLDivElement>(null);
  const { flow, viewport, setViewport } = useCanvasStore();

  // Calculate scale factor
  const scale = useMemo(() => {
    if (!minimapRef.current) return 0.1;
    const rect = minimapRef.current.getBoundingClientRect();
    return Math.min(
      (rect.width - MINIMAP_PADDING * 2) / CANVAS_WIDTH,
      (rect.height - MINIMAP_PADDING * 2) / CANVAS_HEIGHT
    );
  }, []);

  // Calculate viewport rectangle in minimap coordinates
  const viewportRect = useMemo(() => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight - 48; // Account for header

    return {
      x: (-viewport.x / viewport.zoom) * scale + MINIMAP_PADDING,
      y: (-viewport.y / viewport.zoom) * scale + MINIMAP_PADDING,
      width: (viewportWidth / viewport.zoom) * scale,
      height: (viewportHeight / viewport.zoom) * scale,
    };
  }, [viewport, scale]);

  // Handle click to pan
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      if (!minimapRef.current) return;

      const rect = minimapRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - MINIMAP_PADDING;
      const y = e.clientY - rect.top - MINIMAP_PADDING;

      // Convert minimap coordinates to canvas coordinates
      const canvasX = x / scale;
      const canvasY = y / scale;

      // Center the viewport on the clicked position
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight - 48;

      setViewport({
        x: -(canvasX - viewportWidth / (2 * viewport.zoom)) * viewport.zoom,
        y: -(canvasY - viewportHeight / (2 * viewport.zoom)) * viewport.zoom,
        zoom: viewport.zoom,
      });
    },
    [scale, viewport.zoom, setViewport]
  );

  if (!flow) return null;

  // Render minimap nodes
  const renderMiniNodes = (nodes: (ActivityNode | ControlFlowContainer)[]) => {
    return nodes.map((node) => {
      const isContainer = 'children' in node || 'routes' in node;
      const width = isContainer
        ? (node as ControlFlowContainer).dimensions.width
        : 180;
      const height = isContainer
        ? (node as ControlFlowContainer).dimensions.height
        : 40;

      return (
        <rect
          key={node.id}
          className={`minimap__node ${isContainer ? 'minimap__node--container' : ''}`}
          x={node.position.x * scale + MINIMAP_PADDING}
          y={node.position.y * scale + MINIMAP_PADDING}
          width={width * scale}
          height={height * scale}
          rx={2}
        />
      );
    });
  };

  return (
    <div ref={minimapRef} className="minimap" onClick={handleClick}>
      <svg className="minimap__canvas" viewBox="0 0 180 120" preserveAspectRatio="xMidYMid meet">
        {/* Background */}
        <rect className="minimap__background" x="0" y="0" width="180" height="120" />

        {/* Nodes */}
        <g className="minimap__nodes">
          {renderMiniNodes(flow.nodes)}
        </g>

        {/* Viewport indicator */}
        <rect
          className="minimap__viewport"
          x={Math.max(0, viewportRect.x)}
          y={Math.max(0, viewportRect.y)}
          width={Math.min(180 - viewportRect.x, viewportRect.width)}
          height={Math.min(120 - viewportRect.y, viewportRect.height)}
          rx={2}
        />
      </svg>
    </div>
  );
}
