/* ============================================
   Flow Viewer Component
   Displays integration flow with canvas
   ============================================ */

import { useRef, useCallback, useEffect } from 'react';
import { useAppStore } from '../../store';
import { FlowNode } from './FlowNode';
import { FlowEdge } from './FlowEdge';
import { NodePanel } from './NodePanel';
import type { ActivityNode, ControlFlowContainer } from '../../types';
import './FlowViewer.css';

export function FlowViewer() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const {
    currentIntegration,
    closeIntegration,
    selectedNodeId,
    selectNode,
    isSidePanelOpen,
    openSidePanel,
    closeSidePanel,
    viewport,
    pan,
    zoom,
    resetViewport,
    isPanning,
    setIsPanning,
  } = useAppStore();

  // Pan handling
  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button === 0 && (e.target === canvasRef.current || e.target === contentRef.current)) {
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

  // Zoom
  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      zoom(e.deltaY > 0 ? 0.95 : 1.05, cx, cy);
    },
    [zoom]
  );

  // Click canvas to deselect
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current || e.target === contentRef.current) {
        selectNode(null);
        closeSidePanel();
      }
    },
    [selectNode, closeSidePanel]
  );

  // Node click
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      selectNode(nodeId);
      openSidePanel();
    },
    [selectNode, openSidePanel]
  );

  // Keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedNodeId) {
          selectNode(null);
          closeSidePanel();
        } else {
          closeIntegration();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodeId, selectNode, closeSidePanel, closeIntegration]);

  // Event listeners
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handleMouseMove, handleMouseUp, handleWheel]);

  if (!currentIntegration) return null;

  const { flow } = currentIntegration;

  // Flatten all nodes for edge rendering
  const getAllNodes = (nodes: (ActivityNode | ControlFlowContainer)[]): (ActivityNode | ControlFlowContainer)[] => {
    const result: (ActivityNode | ControlFlowContainer)[] = [];
    for (const node of nodes) {
      result.push(node);
      if ('children' in node && node.children) {
        result.push(...getAllNodes(node.children as (ActivityNode | ControlFlowContainer)[]));
      }
      if ('routes' in node && node.routes) {
        for (const route of node.routes) {
          result.push(...getAllNodes(route.children as (ActivityNode | ControlFlowContainer)[]));
        }
      }
    }
    return result;
  };

  const allNodes = getAllNodes(flow.nodes);

  return (
    <div className="flow-viewer">
      {/* Header */}
      <header className="flow-viewer__header">
        <button className="flow-viewer__back" onClick={closeIntegration}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>

        <div className="flow-viewer__title">
          <h1>{currentIntegration.displayName}</h1>
          {currentIntegration.version && <span className="flow-viewer__version">v{currentIntegration.version}</span>}
        </div>

        <div className="flow-viewer__controls">
          <button onClick={() => zoom(0.9)} title="Zoom out">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M5 8a1 1 0 011-1h4a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          </button>
          <span className="flow-viewer__zoom">{Math.round(viewport.zoom * 100)}%</span>
          <button onClick={() => zoom(1.1)} title="Zoom in">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M8 5a1 1 0 011 1v1h1a1 1 0 110 2H9v1a1 1 0 11-2 0V9H6a1 1 0 110-2h1V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
          <button onClick={resetViewport} title="Reset view">
            <svg viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className={`flow-viewer__canvas ${isPanning ? 'flow-viewer__canvas--panning' : ''}`}
        onMouseDown={handleMouseDown}
        onClick={handleCanvasClick}
      >
        {/* Grid */}
        <svg className="flow-viewer__grid">
          <defs>
            <pattern id="dots" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1" fill="#ddd" />
            </pattern>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="url(#dots)"
            style={{ transform: `translate(${viewport.x % 24}px, ${viewport.y % 24}px)` }}
          />
        </svg>

        {/* Content */}
        <div
          ref={contentRef}
          className="flow-viewer__content"
          style={{
            transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          }}
        >
          {/* Edges */}
          <svg className="flow-viewer__edges" width="4000" height="2000">
            <defs>
              <marker id="arrow" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#94a3b8" />
              </marker>
            </defs>
            {flow.edges.map((edge) => (
              <FlowEdge key={edge.id} edge={edge} nodes={allNodes} />
            ))}
          </svg>

          {/* Nodes */}
          <div className="flow-viewer__nodes">
            {flow.nodes.map((node) => (
              <FlowNode
                key={node.id}
                node={node}
                isSelected={selectedNodeId === node.id}
                onClick={handleNodeClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Node Panel */}
      {isSidePanelOpen && <NodePanel />}
    </div>
  );
}
