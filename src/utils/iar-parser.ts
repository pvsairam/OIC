/* ============================================
   IAR File Parser
   Parses Oracle Integration Cloud archive files
   ============================================ */

import JSZip from 'jszip';
import type { IntegrationFlow, ActivityNode, ControlFlowContainer, ConnectionEdge } from '../types';

export async function parseIARFile(file: File): Promise<IntegrationFlow> {
  const fileName = file.name.toLowerCase();

  // Handle JSON files directly (for development/testing)
  if (fileName.endsWith('.json')) {
    return parseJSONFile(file);
  }

  // Handle IAR/ZIP files
  if (fileName.endsWith('.iar') || fileName.endsWith('.zip')) {
    return parseArchiveFile(file);
  }

  throw new Error('Unsupported file format. Please use .iar, .zip, or .json files.');
}

async function parseJSONFile(file: File): Promise<IntegrationFlow> {
  const text = await file.text();
  try {
    const data = JSON.parse(text);
    return validateAndTransformFlow(data);
  } catch {
    throw new Error('Invalid JSON file format');
  }
}

async function parseArchiveFile(file: File): Promise<IntegrationFlow> {
  try {
    const zip = await JSZip.loadAsync(file);

    // Look for integration definition files
    const integrationFiles = Object.keys(zip.files).filter(
      (name) =>
        name.includes('INTEGRATION') ||
        name.endsWith('.xml') ||
        name.endsWith('.json')
    );

    if (integrationFiles.length === 0) {
      throw new Error('No integration definition found in archive');
    }

    // Try to find and parse the main integration file
    for (const fileName of integrationFiles) {
      const fileContent = await zip.files[fileName].async('text');

      // Try JSON first
      if (fileName.endsWith('.json')) {
        try {
          const data = JSON.parse(fileContent);
          return validateAndTransformFlow(data);
        } catch {
          continue;
        }
      }

      // Try XML
      if (fileName.endsWith('.xml')) {
        try {
          return parseXMLIntegration(fileContent, file.name);
        } catch {
          continue;
        }
      }
    }

    throw new Error('Could not parse integration definition');
  } catch (err) {
    if (err instanceof Error) {
      throw err;
    }
    throw new Error('Failed to read archive file');
  }
}

function parseXMLIntegration(xmlContent: string, fileName: string): IntegrationFlow {
  // Basic XML parsing for OIC integration files
  // In a production environment, this would use a proper XML parser

  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid XML format');
  }

  // Extract integration name from root element or file name
  const root = doc.documentElement;
  const name = root.getAttribute('name') || fileName.replace(/\.(iar|xml)$/i, '');

  // Extract activities
  const nodes: (ActivityNode | ControlFlowContainer)[] = [];
  const edges: ConnectionEdge[] = [];

  // Parse invoke activities
  const invokeElements = doc.querySelectorAll('invoke, Invoke');
  let xPos = 100;

  invokeElements.forEach((el, index) => {
    const id = el.getAttribute('id') || el.getAttribute('name') || `invoke-${index}`;
    const nodeName = el.getAttribute('name') || el.getAttribute('partnerLink') || `Invoke ${index + 1}`;

    nodes.push({
      id,
      type: 'invoke',
      name: nodeName,
      displayName: nodeName,
      position: { x: xPos, y: 100 },
      adapter: el.getAttribute('partnerLink') || undefined,
      operation: el.getAttribute('operation') || undefined,
    });

    xPos += 250;
  });

  // Parse assign activities
  const assignElements = doc.querySelectorAll('assign, Assign');
  assignElements.forEach((el, index) => {
    const id = el.getAttribute('id') || el.getAttribute('name') || `assign-${index}`;
    const nodeName = el.getAttribute('name') || `Assign ${index + 1}`;

    nodes.push({
      id,
      type: 'assign',
      name: nodeName,
      displayName: nodeName,
      position: { x: xPos, y: 100 },
    });

    xPos += 250;
  });

  // Create edges between sequential nodes
  for (let i = 0; i < nodes.length - 1; i++) {
    edges.push({
      id: `edge-${i}`,
      sourceId: nodes[i].id,
      targetId: nodes[i + 1].id,
    });
  }

  return {
    id: name.toLowerCase().replace(/\s+/g, '-'),
    name,
    displayName: name,
    nodes,
    edges,
    version: '1.0',
    triggerType: 'app-driven',
  };
}

function validateAndTransformFlow(data: unknown): IntegrationFlow {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid integration data');
  }

  const flowData = data as Record<string, unknown>;

  // If it's already in the expected format, return it
  if (flowData.nodes && flowData.edges) {
    return flowData as IntegrationFlow;
  }

  // Transform from OIC format if needed
  if (flowData.integration || flowData.flow) {
    return transformOICFormat(flowData);
  }

  throw new Error('Unrecognized integration format');
}

function transformOICFormat(data: Record<string, unknown>): IntegrationFlow {
  const integration = (data.integration || data.flow || data) as Record<string, unknown>;

  const nodes: (ActivityNode | ControlFlowContainer)[] = [];
  const edges: ConnectionEdge[] = [];

  // Transform activities
  const activities = (integration.activities || integration.nodes || []) as unknown[];
  let xPos = 100;
  let yPos = 100;

  activities.forEach((activity, index) => {
    const act = activity as Record<string, unknown>;
    const id = String(act.id || act.name || `node-${index}`);
    const type = mapActivityType(String(act.type || 'invoke'));

    nodes.push({
      id,
      type,
      name: String(act.name || act.displayName || id),
      displayName: String(act.displayName || act.name || id),
      position: { x: xPos, y: yPos },
      adapter: act.adapter as string | undefined,
      operation: act.operation as string | undefined,
      endpoint: act.endpoint as string | undefined,
      properties: act.properties as Record<string, unknown> | undefined,
    });

    xPos += 250;
  });

  // Transform connections
  const connections = (integration.connections || integration.edges || integration.transitions || []) as unknown[];

  connections.forEach((conn, index) => {
    const edge = conn as Record<string, unknown>;
    edges.push({
      id: String(edge.id || `edge-${index}`),
      sourceId: String(edge.sourceId || edge.from || edge.source),
      targetId: String(edge.targetId || edge.to || edge.target),
      label: edge.label as string | undefined,
    });
  });

  // If no edges but multiple nodes, create sequential edges
  if (edges.length === 0 && nodes.length > 1) {
    for (let i = 0; i < nodes.length - 1; i++) {
      edges.push({
        id: `edge-${i}`,
        sourceId: nodes[i].id,
        targetId: nodes[i + 1].id,
      });
    }
  }

  return {
    id: String(integration.id || integration.name || 'integration').toLowerCase().replace(/\s+/g, '-'),
    name: String(integration.name || 'Integration'),
    displayName: String(integration.displayName || integration.name || 'Integration'),
    description: integration.description as string | undefined,
    version: String(integration.version || '1.0'),
    triggerType: (integration.triggerType || 'app-driven') as 'scheduled' | 'app-driven' | 'event-driven',
    nodes,
    edges,
  };
}

function mapActivityType(type: string): ActivityNode['type'] {
  const typeMap: Record<string, ActivityNode['type']> = {
    map: 'map',
    mapping: 'map',
    datamapping: 'map',
    invoke: 'invoke',
    call: 'invoke',
    stage: 'stageFile',
    stagefile: 'stageFile',
    file: 'stageFile',
    assign: 'assign',
    variable: 'assign',
    lookup: 'lookup',
    lookuptable: 'lookup',
    notification: 'notification',
    email: 'notification',
    notify: 'notification',
    start: 'start',
    trigger: 'start',
    end: 'end',
    return: 'end',
    callback: 'callback',
    wait: 'wait',
    delay: 'wait',
    throw: 'throw',
    fault: 'throw',
    error: 'throw',
    javascript: 'javascript',
    script: 'javascript',
    log: 'logger',
    logger: 'logger',
  };

  return typeMap[type.toLowerCase()] || 'invoke';
}
