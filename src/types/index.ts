/* ============================================
   OIC Flow Visualizer - Type Definitions
   Core data models for integration flows
   ============================================ */

// ============================================
// Geometry & Position
// ============================================

export interface Point {
  x: number;
  y: number;
}

export interface Dimensions {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

// ============================================
// Activity Types
// ============================================

export type ActivityType =
  | 'map'
  | 'invoke'
  | 'stageFile'
  | 'assign'
  | 'lookup'
  | 'notification'
  | 'start'
  | 'end'
  | 'callback'
  | 'wait'
  | 'throw'
  | 'javascript'
  | 'logger';

export type ContainerType =
  | 'switch'
  | 'route'
  | 'otherwise'
  | 'forEach'
  | 'scope'
  | 'while'
  | 'parallel';

// ============================================
// Activity Node
// ============================================

export interface ActivityNode {
  id: string;
  type: ActivityType;
  name: string;
  displayName?: string;
  description?: string;
  position: Point;

  // Activity-specific metadata
  adapter?: string;
  operation?: string;
  endpoint?: string;

  // Configuration
  properties?: Record<string, unknown>;

  // Visual state
  isSelected?: boolean;
  isHovered?: boolean;
  isCollapsed?: boolean;

  // Connection points
  inputConnectorId?: string;
  outputConnectorId?: string;
}

// ============================================
// Control Flow Container
// ============================================

export interface ControlFlowContainer {
  id: string;
  type: ContainerType;
  name: string;
  displayName?: string;
  position: Point;
  dimensions: Dimensions;

  // Container-specific
  condition?: string;
  expression?: string;
  variableName?: string;

  // Children
  children: (ActivityNode | ControlFlowContainer)[];

  // For switch containers
  routes?: RouteDefinition[];

  // Visual state
  isExpanded: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
}

export interface RouteDefinition {
  id: string;
  name: string;
  condition?: string;
  isOtherwise?: boolean;
  children: (ActivityNode | ControlFlowContainer)[];
}

// ============================================
// Connection Edge
// ============================================

export interface ConnectionEdge {
  id: string;
  sourceId: string;
  targetId: string;
  sourceHandle?: 'top' | 'right' | 'bottom' | 'left';
  targetHandle?: 'top' | 'right' | 'bottom' | 'left';

  // Edge styling
  type?: 'default' | 'conditional' | 'error' | 'loop';
  label?: string;

  // Routing
  waypoints?: Point[];

  // Visual state
  isSelected?: boolean;
  isHovered?: boolean;
}

// ============================================
// Integration Flow
// ============================================

export interface IntegrationFlow {
  id: string;
  name: string;
  displayName?: string;
  description?: string;
  version?: string;

  // Flow metadata
  triggerType?: 'scheduled' | 'app-driven' | 'event-driven';
  triggerConfig?: Record<string, unknown>;

  // Flow structure
  nodes: (ActivityNode | ControlFlowContainer)[];
  edges: ConnectionEdge[];

  // Canvas state
  viewport?: ViewportState;
}

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

// ============================================
// Canvas State
// ============================================

export interface CanvasState {
  flow: IntegrationFlow | null;
  viewport: ViewportState;
  selectedNodeId: string | null;
  hoveredNodeId: string | null;
  isPanning: boolean;
  isZooming: boolean;
}

// ============================================
// Side Panel
// ============================================

export interface SidePanelState {
  isOpen: boolean;
  activeNodeId: string | null;
  activeTab: 'properties' | 'mapping' | 'documentation';
}

// ============================================
// IAR File Structure
// ============================================

export interface IARManifest {
  name: string;
  version: string;
  description?: string;
  created?: string;
  modified?: string;
}

export interface IARFile {
  manifest: IARManifest;
  integrations: IntegrationDefinition[];
  connections: ConnectionDefinition[];
  lookups: LookupDefinition[];
}

export interface IntegrationDefinition {
  id: string;
  name: string;
  flow: IntegrationFlow;
}

export interface ConnectionDefinition {
  id: string;
  name: string;
  type: string;
  adapterType: string;
  properties?: Record<string, unknown>;
}

export interface LookupDefinition {
  id: string;
  name: string;
  columns: string[];
  rows: unknown[][];
}

// ============================================
// UI State
// ============================================

export interface UIState {
  isSidePanelOpen: boolean;
  isMiniMapVisible: boolean;
  isFileDialogOpen: boolean;
  zoomLevel: number;
  breadcrumbs: BreadcrumbItem[];
}

export interface BreadcrumbItem {
  id: string;
  label: string;
  type: 'integration' | 'container' | 'scope';
}

// ============================================
// Event Handlers
// ============================================

export interface NodeEventHandlers {
  onClick?: (nodeId: string) => void;
  onDoubleClick?: (nodeId: string) => void;
  onMouseEnter?: (nodeId: string) => void;
  onMouseLeave?: (nodeId: string) => void;
  onDragStart?: (nodeId: string, position: Point) => void;
  onDrag?: (nodeId: string, position: Point) => void;
  onDragEnd?: (nodeId: string, position: Point) => void;
}

export interface CanvasEventHandlers {
  onPanStart?: (position: Point) => void;
  onPan?: (delta: Point) => void;
  onPanEnd?: () => void;
  onZoom?: (zoom: number, center: Point) => void;
  onSelectionClear?: () => void;
}
