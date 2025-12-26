/* ============================================
   Node Panel Component
   Side panel showing node details
   ============================================ */

import { useAppStore } from '../../store';
import type { ActivityNode, ControlFlowContainer } from '../../types';

export function NodePanel() {
  const { selectedNodeId, findNode, closeSidePanel } = useAppStore();

  const node = selectedNodeId ? findNode(selectedNodeId) : null;

  if (!node) return null;

  const isActivity = !('children' in node || 'routes' in node);
  const activity = isActivity ? (node as ActivityNode) : null;
  const container = !isActivity ? (node as ControlFlowContainer) : null;

  return (
    <aside className="node-panel">
      <header className="node-panel__header">
        <h2>Properties</h2>
        <button className="node-panel__close" onClick={closeSidePanel}>
          <svg viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </header>

      <div className="node-panel__content">
        {/* Name */}
        <div className="node-panel__section">
          <h3 className="node-panel__name">{node.displayName || node.name}</h3>
          <span className="node-panel__type">
            {activity ? getActivityTypeLabel(activity.type) : getContainerTypeLabel(container!.type)}
          </span>
        </div>

        {/* Description */}
        {activity?.description && (
          <div className="node-panel__section">
            <label>Description</label>
            <p>{activity.description}</p>
          </div>
        )}

        {/* Properties */}
        <div className="node-panel__section">
          <label>Configuration</label>
          <div className="node-panel__props">
            <div className="node-panel__prop">
              <span className="node-panel__prop-key">ID</span>
              <span className="node-panel__prop-value">{node.id}</span>
            </div>

            {activity?.adapter && (
              <div className="node-panel__prop">
                <span className="node-panel__prop-key">Adapter</span>
                <span className="node-panel__prop-value">{activity.adapter}</span>
              </div>
            )}

            {activity?.operation && (
              <div className="node-panel__prop">
                <span className="node-panel__prop-key">Operation</span>
                <span className="node-panel__prop-value">{activity.operation}</span>
              </div>
            )}

            {activity?.endpoint && (
              <div className="node-panel__prop">
                <span className="node-panel__prop-key">Endpoint</span>
                <span className="node-panel__prop-value node-panel__prop-value--code">{activity.endpoint}</span>
              </div>
            )}

            {container?.condition && (
              <div className="node-panel__prop">
                <span className="node-panel__prop-key">Condition</span>
                <span className="node-panel__prop-value node-panel__prop-value--code">{container.condition}</span>
              </div>
            )}

            {container?.expression && (
              <div className="node-panel__prop">
                <span className="node-panel__prop-key">Expression</span>
                <span className="node-panel__prop-value node-panel__prop-value--code">{container.expression}</span>
              </div>
            )}
          </div>
        </div>

        {/* Additional properties */}
        {activity?.properties && Object.keys(activity.properties).length > 0 && (
          <div className="node-panel__section">
            <label>Additional Properties</label>
            <div className="node-panel__props">
              {Object.entries(activity.properties).map(([key, value]) => (
                <div key={key} className="node-panel__prop">
                  <span className="node-panel__prop-key">{formatKey(key)}</span>
                  <span className="node-panel__prop-value node-panel__prop-value--code">
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function getActivityTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    start: 'Trigger Activity',
    end: 'Return Activity',
    map: 'Map Activity',
    invoke: 'Invoke Activity',
    stageFile: 'Stage File Activity',
    assign: 'Assign Activity',
    lookup: 'Lookup Activity',
    notification: 'Notification Activity',
    callback: 'Callback Activity',
    wait: 'Wait Activity',
    throw: 'Throw Fault Activity',
    javascript: 'JavaScript Activity',
    logger: 'Logger Activity',
  };
  return labels[type] || type;
}

function getContainerTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    switch: 'Switch Container',
    forEach: 'For Each Loop',
    scope: 'Scope Container',
    while: 'While Loop',
    parallel: 'Parallel Container',
  };
  return labels[type] || type;
}

function formatKey(key: string): string {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());
}
