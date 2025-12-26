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

  // Pan handling with space key
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 1 || (e.button === 0 && (e.target === canvasRef.current || e.target === contentRef.current))) {
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

  // Collect all nodes including nested ones for edge rendering
  const getAllNodes = (nodes: (ActivityNode | ControlFlowContainer)[]): (ActivityNode | ControlFlowContainer)[] => {
    const result: (ActivityNode | ControlFlowContainer)[] = [];
    for (const node of nodes) {
      result.push(node);
      if ('children' in node && node.children) {
        result.push(...getAllNodes(node.children));
      }
      if ('routes' in node && node.routes) {
        for (const route of node.routes) {
          result.push(...getAllNodes(route.children));
        }
      }
    }
    return result;
  };

  const allNodes = getAllNodes(flow.nodes);

  // Render node
  const renderNode = (node: ActivityNode | ControlFlowContainer) => {
    if ('children' in node || 'routes' in node) {
      return (
        <Container
          key={node.id}
          container={node as ControlFlowContainer}
          isExpanded={expandedContainers.has(node.id)}
          isSelected={selectedNodeId === node.id}
        />
      );
    } else {
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
            id="grid-dots"
            width={20}
            height={20}
            patternUnits="userSpaceOnUse"
          >
            <circle cx="10" cy="10" r="1" fill="#e0e0e0" />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#grid-dots)"
          style={{
            transform: `translate(${viewport.x % 20}px, ${viewport.y % 20}px)`
          }}
        />
      </svg>

      {/* Canvas content with transform */}
      <div
        ref={contentRef}
        className="canvas-content"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
        }}
      >
        {/* Connection lines SVG - large fixed size */}
        <svg
          className="canvas-connections"
          width="5000"
          height="3000"
          style={{ position: 'absolute', top: 0, left: 0, overflow: 'visible', pointerEvents: 'none' }}
        >
          <defs>
            <marker
              id="arrowhead"
              markerWidth="8"
              markerHeight="6"
              refX="7"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 8 3, 0 6" fill="#9ca3af" />
            </marker>
          </defs>
          {flow.edges.map((edge) => (
            <ConnectionLine
              key={edge.id}
              edge={edge}
              nodes={allNodes}
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
