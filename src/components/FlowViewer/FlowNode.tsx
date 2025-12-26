/* ============================================
   Flow Node Component
   OIC-style activity node
   ============================================ */

import type { ActivityNode, ControlFlowContainer, ActivityType } from '../../types';

interface FlowNodeProps {
  node: ActivityNode | ControlFlowContainer;
  isSelected?: boolean;
  onClick: (id: string) => void;
}

export function FlowNode({ node, isSelected, onClick }: FlowNodeProps) {
  const isActivity = !('children' in node || 'routes' in node);

  if (!isActivity) {
    // For now, just render containers as simple boxes
    const container = node as ControlFlowContainer;
    return (
      <div
        className={`flow-node flow-node--container flow-node--${container.type} ${isSelected ? 'flow-node--selected' : ''}`}
        style={{
          left: node.position.x,
          top: node.position.y,
          width: container.dimensions?.width || 300,
          height: container.dimensions?.height || 150,
        }}
        onClick={(e) => { e.stopPropagation(); onClick(node.id); }}
      >
        <div className="flow-node__container-header">
          <span className="flow-node__container-type">{container.type}</span>
          <span className="flow-node__container-name">{container.displayName || container.name}</span>
        </div>
      </div>
    );
  }

  const activity = node as ActivityNode;
  const Icon = getActivityIcon(activity.type);

  return (
    <div
      className={`flow-node flow-node--${activity.type} ${isSelected ? 'flow-node--selected' : ''}`}
      style={{
        left: node.position.x,
        top: node.position.y,
      }}
      onClick={(e) => { e.stopPropagation(); onClick(node.id); }}
    >
      {/* Connection ports */}
      <div className="flow-node__port flow-node__port--in" />
      <div className="flow-node__port flow-node__port--out" />

      {/* Icon */}
      <div className={`flow-node__icon flow-node__icon--${activity.type}`}>
        {Icon}
      </div>

      {/* Content */}
      <div className="flow-node__content">
        <span className="flow-node__name">{activity.displayName || activity.name}</span>
        <span className="flow-node__type">{getActivityLabel(activity.type)}</span>
      </div>
    </div>
  );
}

function getActivityLabel(type: ActivityType): string {
  const labels: Record<string, string> = {
    start: 'Trigger',
    end: 'Return',
    map: 'Map',
    invoke: 'Invoke',
    stageFile: 'Stage File',
    assign: 'Assign',
    lookup: 'Lookup',
    notification: 'Notification',
    callback: 'Callback',
    wait: 'Wait',
    throw: 'Fault',
    javascript: 'Script',
    logger: 'Logger',
  };
  return labels[type] || type;
}

function getActivityIcon(type: ActivityType): JSX.Element {
  const icons: Record<string, JSX.Element> = {
    start: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
        <path d="M10 8l6 4-6 4V8z" fill="currentColor" />
      </svg>
    ),
    end: (
      <svg viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
        <rect x="9" y="9" width="6" height="6" rx="1" fill="currentColor" />
      </svg>
    ),
    map: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h6M4 12h4M4 18h6M14 6h6M14 12h6M14 18h6" strokeLinecap="round" />
        <path d="M10 6l4 6M8 12l6 6" strokeLinecap="round" />
      </svg>
    ),
    invoke: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="6" width="18" height="12" rx="2" />
        <path d="M9 12h6M12 9v6" strokeLinecap="round" />
      </svg>
    ),
    stageFile: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <path d="M14 2v6h6M12 18v-6M9 15l3 3 3-3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    assign: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <path d="M8 12h8M12 8v8" strokeLinecap="round" />
      </svg>
    ),
    lookup: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="10" cy="10" r="6" />
        <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
        <path d="M7 8h6M7 12h4" strokeLinecap="round" />
      </svg>
    ),
    notification: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 01-3.46 0" />
      </svg>
    ),
    callback: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 12h6m4 0h6M10 12l-3-3m3 3l-3 3M14 12l3-3m-3 3l3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
    wait: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="8" />
        <path d="M12 7v5l3 3" strokeLinecap="round" />
      </svg>
    ),
    throw: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 9v4m0 4h.01" strokeLinecap="round" />
        <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
      </svg>
    ),
    javascript: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 17c0-2 1-3 2-3s2 1 2 3M15 10c2 0 3 1 3 2s-1 2-3 2-3 1-3 2 1 2 3 2" strokeLinecap="round" />
      </svg>
    ),
    logger: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M4 6h16M4 10h16M4 14h12M4 18h8" strokeLinecap="round" />
      </svg>
    ),
  };
  return icons[type] || icons.invoke;
}
