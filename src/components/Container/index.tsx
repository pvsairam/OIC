/* ============================================
   Control Flow Container Component
   Visual wrapper for Switch, ForEach, Scope, etc.
   ============================================ */

import { useCallback } from 'react';
import { useCanvasStore, useUIStore } from '../../store';
import { ContainerIcon } from '../Icons/ContainerIcon';
import { ActivityCard } from '../ActivityCard';
import type { ControlFlowContainer, ActivityNode } from '../../types';
import './Container.css';

interface ContainerProps {
  container: ControlFlowContainer;
  isExpanded?: boolean;
  isSelected?: boolean;
}

export function Container({ container, isExpanded = true, isSelected = false }: ContainerProps) {
  const { selectNode, setHoveredNode, hoveredNodeId, selectedNodeId } = useCanvasStore();
  const { toggleContainer, openSidePanel, expandedContainers } = useUIStore();

  const isHovered = hoveredNodeId === container.id;

  const handleHeaderClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectNode(container.id);
      openSidePanel();
    },
    [container.id, selectNode, openSidePanel]
  );

  const handleToggle = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      toggleContainer(container.id);
    },
    [container.id, toggleContainer]
  );

  const handleMouseEnter = useCallback(() => {
    setHoveredNode(container.id);
  }, [container.id, setHoveredNode]);

  const handleMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, [setHoveredNode]);

  // Get container-specific label
  const getConditionLabel = () => {
    if (container.condition) return container.condition;
    if (container.expression) return container.expression;
    if (container.variableName) return `for each ${container.variableName}`;
    return null;
  };

  // Render child nodes
  const renderChildren = (children: (ActivityNode | ControlFlowContainer)[]) => {
    return children.map((child) => {
      if ('children' in child || 'routes' in child) {
        return (
          <Container
            key={child.id}
            container={child as ControlFlowContainer}
            isExpanded={expandedContainers.has(child.id)}
            isSelected={selectedNodeId === child.id}
          />
        );
      }
      return (
        <ActivityCard
          key={child.id}
          node={child as ActivityNode}
          isSelected={selectedNodeId === child.id}
          compact
        />
      );
    });
  };

  // Render routes for Switch container
  const renderRoutes = () => {
    if (!container.routes) return null;

    return (
      <div className="container__routes">
        {container.routes.map((route) => (
          <div
            key={route.id}
            className={`container__route ${route.isOtherwise ? 'container__route--otherwise' : ''}`}
          >
            <div className="container__route-header">
              <span className="container__route-name">{route.name}</span>
              {route.condition && (
                <span className="container__route-condition">{route.condition}</span>
              )}
            </div>
            <div className="container__route-content">
              {renderChildren(route.children)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const displayName = container.displayName || container.name;
  const conditionLabel = getConditionLabel();

  return (
    <div
      className={`container container--${container.type} ${isExpanded ? 'container--expanded' : 'container--collapsed'} ${isSelected ? 'container--selected' : ''} ${isHovered ? 'container--hovered' : ''}`}
      style={{
        left: container.position.x,
        top: container.position.y,
        width: isExpanded ? container.dimensions.width : 'auto',
        height: isExpanded ? container.dimensions.height : 'auto',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Connection ports */}
      <div className="container__port container__port--input" />
      <div className="container__port container__port--output" />

      {/* Header */}
      <div
        className="container__header"
        onClick={handleHeaderClick}
        role="button"
        tabIndex={0}
      >
        <div className={`container__icon container__icon--${container.type}`}>
          <ContainerIcon type={container.type} />
        </div>
        <div className="container__header-content">
          <span className="container__name">{displayName}</span>
          {conditionLabel && (
            <span className="container__condition">{conditionLabel}</span>
          )}
        </div>
        <button
          className="container__toggle"
          onClick={handleToggle}
          aria-label={isExpanded ? 'Collapse container' : 'Expand container'}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isExpanded ? (
              <path d="M18 15l-6-6-6 6" />
            ) : (
              <path d="M6 9l6 6 6-6" />
            )}
          </svg>
        </button>
      </div>

      {/* Content (only when expanded) */}
      {isExpanded && (
        <div className="container__content">
          {container.routes ? renderRoutes() : renderChildren(container.children)}
        </div>
      )}
    </div>
  );
}
