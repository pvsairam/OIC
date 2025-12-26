/* ============================================
   Activity Card Component
   Visual representation of integration activities
   ============================================ */

import { useCallback } from 'react';
import { useCanvasStore, useUIStore } from '../../store';
import { ActivityIcon } from '../Icons/ActivityIcon';
import type { ActivityNode } from '../../types';
import './ActivityCard.css';

interface ActivityCardProps {
  node: ActivityNode;
  isSelected?: boolean;
  compact?: boolean;
}

export function ActivityCard({ node, isSelected = false, compact = false }: ActivityCardProps) {
  const { selectNode, setHoveredNode, hoveredNodeId } = useCanvasStore();
  const { openSidePanel } = useUIStore();

  const isHovered = hoveredNodeId === node.id;

  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      selectNode(node.id);
      openSidePanel();
    },
    [node.id, selectNode, openSidePanel]
  );

  const handleMouseEnter = useCallback(() => {
    setHoveredNode(node.id);
  }, [node.id, setHoveredNode]);

  const handleMouseLeave = useCallback(() => {
    setHoveredNode(null);
  }, [setHoveredNode]);

  const displayName = node.displayName || node.name;
  const subtitle = node.adapter || node.operation || getActivityLabel(node.type);

  return (
    <div
      className={`activity-card activity-card--${node.type} ${isSelected ? 'activity-card--selected' : ''} ${isHovered ? 'activity-card--hovered' : ''} ${compact ? 'activity-card--compact' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      aria-label={`${displayName} activity`}
      aria-selected={isSelected}
    >
      {/* Connection ports */}
      <div className="activity-card__port activity-card__port--input" />
      <div className="activity-card__port activity-card__port--output" />

      {/* Icon */}
      <div className={`activity-card__icon activity-card__icon--${node.type}`}>
        <ActivityIcon type={node.type} />
      </div>

      {/* Content */}
      <div className="activity-card__content">
        <span className="activity-card__name">{displayName}</span>
        {!compact && subtitle && (
          <span className="activity-card__subtitle">{subtitle}</span>
        )}
      </div>

      {/* Type indicator */}
      <div className={`activity-card__type-indicator activity-card__type-indicator--${node.type}`} />
    </div>
  );
}

function getActivityLabel(type: string): string {
  const labels: Record<string, string> = {
    map: 'Data Mapping',
    invoke: 'Invoke Connection',
    stageFile: 'Stage File',
    assign: 'Assign Variable',
    lookup: 'Lookup Table',
    notification: 'Send Notification',
    start: 'Start',
    end: 'End',
    callback: 'Callback',
    wait: 'Wait',
    throw: 'Throw Fault',
    javascript: 'JavaScript Action',
    logger: 'Logger',
  };
  return labels[type] || type;
}
