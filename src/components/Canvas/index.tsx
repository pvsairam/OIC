/* ============================================
   Integration Canvas Component
   Main visualization surface with pan/zoom
   ============================================ */

import { useRef, useEffect, useCallback } from 'react';
import { useCanvasStore, useUIStore } from '../../store';
import { ActivityCard } from '../ActivityCard';
import { Container } from '../Container';
import { ConnectionLine } from '../ConnectionLine';
import type { ActivityNode, ControlFlowContainer } from '../../types';
import './Canvas.css';

export function Canvas() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    flow,
    viewport,
    pan,
    zoom,
    isPanning,
    setIsPanning,
    selectNode,
    selectedNodeId,
  } = useCanvasStore();

  const { expandedContainers } = useUIStore();

  // Pan handling
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only start panning on middle mouse button or left button on canvas
      if (e.button === 1 || (e.button === 0 && e.target === canvasRef.current)) {
        e.preventDefault();
        setIsPanning(true);
      }
    },
    [setIsPanning]
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (isPanning) {
        pan(e.movementX, e.movementY);
      }
    },
    [isPanning, pan]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, [setIsPanning]);

  // Wheel zoom handling
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      const centerX = e.clientX - rect.left;
      const centerY = e.clientY - rect.top;
      const zoomFactor = e.deltaY > 0 ? 0.95 : 1.05;

      zoom(zoomFactor, centerX, centerY);
    },
    [zoom]
  );

  // Click on canvas to deselect
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current || e.target === contentRef.current) {
        selectNode(null);
      }
    },
    [selectNode]
  );

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectNode(null);
      }
      // Zoom shortcuts
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=' || e.key === '+') {
          e.preventDefault();
          zoom(1.1);
        } else if (e.key === '-') {
          e.preventDefault();
          zoom(0.9);
        } else if (e.key === '0') {
          e.preventDefault();
          useCanvasStore.getState().resetViewport();
        }
      }
    },
    [zoom, selectNode]
  );

  // Event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('keydown', handleKeyDown);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseMove, handleMouseUp, handleWheel, handleKeyDown]);

  if (!flow) return null;

  // Render nodes
  const renderNode = (node: ActivityNode | ControlFlowContainer, index: number) => {
    if ('children' in node || 'routes' in node) {
      // It's a container
      return (
        <Container
          key={node.id}
          container={node as ControlFlowContainer}
          isExpanded={expandedContainers.has(node.id)}
          isSelected={selectedNodeId === node.id}
        />
      );
    } else {
      // It's an activity
      return (
        <ActivityCard
          key={node.id}
          node={node as ActivityNode}
          isSelected={selectedNodeId === node.id}
        />
      );
    }
  };

  return (
    <div
      ref={canvasRef}
      className={`canvas ${isPanning ? 'canvas--panning' : ''}`}
      onMouseDown={handleMouseDown}
      onClick={handleCanvasClick}
    >
      {/* Grid pattern background */}
      <svg className="canvas-grid" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern
            id="grid-small"
            width={20 * viewport.zoom}
            height={20 * viewport.zoom}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${viewport.x % (20 * viewport.zoom)}, ${viewport.y % (20 * viewport.zoom)})`}
          >
            <circle cx="1" cy="1" r="0.5" fill="var(--color-border-subtle)" />
          </pattern>
          <pattern
            id="grid-large"
            width={100 * viewport.zoom}
            height={100 * viewport.zoom}
            patternUnits="userSpaceOnUse"
            patternTransform={`translate(${viewport.x % (100 * viewport.zoom)}, ${viewport.y % (100 * viewport.zoom)})`}
          >
            <circle cx="1" cy="1" r="1" fill="var(--color-border-default)" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-small)" />
        <rect width="100%" height="100%" fill="url(#grid-large)" />
      </svg>

      {/* Canvas content with transform */}
      <div
        ref={contentRef}
        className="canvas-content"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
      >
        {/* Connection lines (rendered first, behind nodes) */}
        <svg className="canvas-connections">
          {flow.edges.map((edge) => (
            <ConnectionLine
              key={edge.id}
              edge={edge}
              nodes={flow.nodes}
            />
          ))}
        </svg>

        {/* Nodes */}
        <div className="canvas-nodes">
          {flow.nodes.map(renderNode)}
        </div>
      </div>

      {/* Zoom indicator */}
      <div className="canvas-zoom-indicator">
        {Math.round(viewport.zoom * 100)}%
      </div>
    </div>
  );
}
