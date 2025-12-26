/* ============================================
   Side Panel Component
   Metadata and properties panel for selected nodes
   ============================================ */

import { useMemo } from 'react';
import { useCanvasStore } from '../../store';
import { ActivityIcon } from '../Icons/ActivityIcon';
import { ContainerIcon } from '../Icons/ContainerIcon';
import type { ActivityNode, ControlFlowContainer, ActivityType, ContainerType } from '../../types';
import './SidePanel.css';

interface SidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidePanel({ isOpen, onClose }: SidePanelProps) {
  const { selectedNodeId, findNode, flow } = useCanvasStore();

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null;
    return findNode(selectedNodeId);
  }, [selectedNodeId, findNode]);

  if (!isOpen) return null;

  const isContainer = selectedNode && ('children' in selectedNode || 'routes' in selectedNode);

  return (
    <aside className={`side-panel ${isOpen ? 'side-panel--open' : ''}`}>
      {/* Header */}
      <div className="side-panel__header">
        <h2 className="side-panel__title">
          {selectedNode ? 'Properties' : 'Details'}
        </h2>
        <button
          className="side-panel__close"
          onClick={onClose}
          aria-label="Close panel"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="side-panel__content">
        {selectedNode ? (
          isContainer ? (
            <ContainerDetails container={selectedNode as ControlFlowContainer} />
          ) : (
            <ActivityDetails node={selectedNode as ActivityNode} />
          )
        ) : flow ? (
          <FlowDetails flow={flow} />
        ) : (
          <EmptyState />
        )}
      </div>
    </aside>
  );
}

// Activity details component
function ActivityDetails({ node }: { node: ActivityNode }) {
  return (
    <div className="node-details">
      {/* Node header */}
      <div className="node-details__header">
        <div className={`node-details__icon node-details__icon--${node.type}`}>
          <ActivityIcon type={node.type} />
        </div>
        <div className="node-details__header-content">
          <h3 className="node-details__name">{node.displayName || node.name}</h3>
          <span className="node-details__type">{getActivityTypeLabel(node.type)}</span>
        </div>
      </div>

      {/* Description */}
      {node.description && (
        <div className="node-details__section">
          <p className="node-details__description">{node.description}</p>
        </div>
      )}

      {/* Properties */}
      <div className="node-details__section">
        <h4 className="node-details__section-title">Configuration</h4>

        <dl className="property-list">
          <div className="property-list__item">
            <dt className="property-list__label">ID</dt>
            <dd className="property-list__value property-list__value--mono">{node.id}</dd>
          </div>

          {node.adapter && (
            <div className="property-list__item">
              <dt className="property-list__label">Adapter</dt>
              <dd className="property-list__value">{node.adapter}</dd>
            </div>
          )}

          {node.operation && (
            <div className="property-list__item">
              <dt className="property-list__label">Operation</dt>
              <dd className="property-list__value">{node.operation}</dd>
            </div>
          )}

          {node.endpoint && (
            <div className="property-list__item">
              <dt className="property-list__label">Endpoint</dt>
              <dd className="property-list__value property-list__value--mono">{node.endpoint}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Additional properties */}
      {node.properties && Object.keys(node.properties).length > 0 && (
        <div className="node-details__section">
          <h4 className="node-details__section-title">Properties</h4>
          <dl className="property-list">
            {Object.entries(node.properties).map(([key, value]) => (
              <div key={key} className="property-list__item">
                <dt className="property-list__label">{formatPropertyKey(key)}</dt>
                <dd className="property-list__value property-list__value--mono">
                  {formatPropertyValue(value)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Position */}
      <div className="node-details__section">
        <h4 className="node-details__section-title">Position</h4>
        <dl className="property-list property-list--inline">
          <div className="property-list__item">
            <dt className="property-list__label">X</dt>
            <dd className="property-list__value property-list__value--mono">{node.position.x}</dd>
          </div>
          <div className="property-list__item">
            <dt className="property-list__label">Y</dt>
            <dd className="property-list__value property-list__value--mono">{node.position.y}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

// Container details component
function ContainerDetails({ container }: { container: ControlFlowContainer }) {
  const childCount = container.children?.length || 0;
  const routeCount = container.routes?.length || 0;

  return (
    <div className="node-details">
      {/* Header */}
      <div className="node-details__header">
        <div className={`node-details__icon node-details__icon--container`}>
          <ContainerIcon type={container.type} />
        </div>
        <div className="node-details__header-content">
          <h3 className="node-details__name">{container.displayName || container.name}</h3>
          <span className="node-details__type">{getContainerTypeLabel(container.type)}</span>
        </div>
      </div>

      {/* Properties */}
      <div className="node-details__section">
        <h4 className="node-details__section-title">Configuration</h4>
        <dl className="property-list">
          <div className="property-list__item">
            <dt className="property-list__label">ID</dt>
            <dd className="property-list__value property-list__value--mono">{container.id}</dd>
          </div>

          {container.condition && (
            <div className="property-list__item">
              <dt className="property-list__label">Condition</dt>
              <dd className="property-list__value property-list__value--mono">{container.condition}</dd>
            </div>
          )}

          {container.expression && (
            <div className="property-list__item">
              <dt className="property-list__label">Expression</dt>
              <dd className="property-list__value property-list__value--mono">{container.expression}</dd>
            </div>
          )}

          {container.variableName && (
            <div className="property-list__item">
              <dt className="property-list__label">Variable</dt>
              <dd className="property-list__value property-list__value--mono">{container.variableName}</dd>
            </div>
          )}

          {childCount > 0 && (
            <div className="property-list__item">
              <dt className="property-list__label">Children</dt>
              <dd className="property-list__value">{childCount} activities</dd>
            </div>
          )}

          {routeCount > 0 && (
            <div className="property-list__item">
              <dt className="property-list__label">Routes</dt>
              <dd className="property-list__value">{routeCount} branches</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Dimensions */}
      <div className="node-details__section">
        <h4 className="node-details__section-title">Dimensions</h4>
        <dl className="property-list property-list--inline">
          <div className="property-list__item">
            <dt className="property-list__label">Width</dt>
            <dd className="property-list__value property-list__value--mono">{container.dimensions.width}</dd>
          </div>
          <div className="property-list__item">
            <dt className="property-list__label">Height</dt>
            <dd className="property-list__value property-list__value--mono">{container.dimensions.height}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

// Flow details when no node is selected
function FlowDetails({ flow }: { flow: any }) {
  return (
    <div className="node-details">
      <div className="node-details__header">
        <div className="node-details__icon node-details__icon--flow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M4 12h16M12 4v16" strokeLinecap="round" />
            <circle cx="4" cy="12" r="2" fill="currentColor" />
            <circle cx="20" cy="12" r="2" fill="currentColor" />
          </svg>
        </div>
        <div className="node-details__header-content">
          <h3 className="node-details__name">{flow.displayName || flow.name}</h3>
          <span className="node-details__type">Integration Flow</span>
        </div>
      </div>

      {flow.description && (
        <div className="node-details__section">
          <p className="node-details__description">{flow.description}</p>
        </div>
      )}

      <div className="node-details__section">
        <h4 className="node-details__section-title">Information</h4>
        <dl className="property-list">
          <div className="property-list__item">
            <dt className="property-list__label">ID</dt>
            <dd className="property-list__value property-list__value--mono">{flow.id}</dd>
          </div>
          {flow.version && (
            <div className="property-list__item">
              <dt className="property-list__label">Version</dt>
              <dd className="property-list__value">{flow.version}</dd>
            </div>
          )}
          {flow.triggerType && (
            <div className="property-list__item">
              <dt className="property-list__label">Trigger</dt>
              <dd className="property-list__value">{flow.triggerType}</dd>
            </div>
          )}
          <div className="property-list__item">
            <dt className="property-list__label">Activities</dt>
            <dd className="property-list__value">{flow.nodes?.length || 0}</dd>
          </div>
          <div className="property-list__item">
            <dt className="property-list__label">Connections</dt>
            <dd className="property-list__value">{flow.edges?.length || 0}</dd>
          </div>
        </dl>
      </div>

      <div className="node-details__hint">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
        </svg>
        <span>Click on any activity to view its properties</span>
      </div>
    </div>
  );
}

// Empty state
function EmptyState() {
  return (
    <div className="side-panel__empty">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M9 9h6M9 12h6M9 15h4" strokeLinecap="round" />
      </svg>
      <p>Load an integration flow to view details</p>
    </div>
  );
}

// Helper functions
function getActivityTypeLabel(type: ActivityType): string {
  const labels: Record<ActivityType, string> = {
    map: 'Data Mapping',
    invoke: 'Invoke Activity',
    stageFile: 'Stage File Activity',
    assign: 'Assign Activity',
    lookup: 'Lookup Table',
    notification: 'Notification Activity',
    start: 'Start Activity',
    end: 'End Activity',
    callback: 'Callback Activity',
    wait: 'Wait Activity',
    throw: 'Throw Fault',
    javascript: 'JavaScript Action',
    logger: 'Logger Activity',
  };
  return labels[type] || type;
}

function getContainerTypeLabel(type: ContainerType): string {
  const labels: Record<ContainerType, string> = {
    switch: 'Switch Container',
    route: 'Route',
    otherwise: 'Otherwise Route',
    forEach: 'For Each Loop',
    scope: 'Scope Container',
    while: 'While Loop',
    parallel: 'Parallel Container',
  };
  return labels[type] || type;
}

function formatPropertyKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

function formatPropertyValue(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(value);
}
