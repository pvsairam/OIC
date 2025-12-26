/* ============================================
   Sample Integration Flow Data
   Simple horizontal flow for testing
   ============================================ */

import type { IntegrationFlow } from '../types';

export const sampleIntegration: IntegrationFlow = {
  id: 'order-processing-integration',
  name: 'OrderProcessingIntegration',
  displayName: 'Order Processing Integration',
  description: 'Processes incoming orders from e-commerce platform, validates inventory, and syncs with ERP system',
  version: '2.1.0',
  triggerType: 'app-driven',

  nodes: [
    // Start
    {
      id: 'start-1',
      type: 'start',
      name: 'ReceiveOrder',
      displayName: 'Receive Order',
      position: { x: 60, y: 200 },
      adapter: 'REST Adapter',
      operation: 'POST /orders',
      description: 'Receives incoming order from e-commerce platform',
    },

    // Map
    {
      id: 'map-1',
      type: 'map',
      name: 'MapOrderRequest',
      displayName: 'Map Order Request',
      position: { x: 310, y: 200 },
      description: 'Maps incoming order to canonical format',
      properties: {
        sourceSchema: 'OrderRequest',
        targetSchema: 'CanonicalOrder',
      },
    },

    // Lookup
    {
      id: 'lookup-1',
      type: 'lookup',
      name: 'LookupCustomer',
      displayName: 'Lookup Customer',
      position: { x: 560, y: 200 },
      adapter: 'Database Adapter',
      operation: 'CustomerLookup',
      description: 'Retrieves customer information from database',
    },

    // Invoke
    {
      id: 'invoke-1',
      type: 'invoke',
      name: 'CreateERPOrder',
      displayName: 'Create ERP Order',
      position: { x: 810, y: 200 },
      adapter: 'SAP ERP Adapter',
      operation: 'createSalesOrder',
      endpoint: '/sap/api/orders',
      description: 'Creates order in ERP system',
    },

    // Stage File
    {
      id: 'stage-1',
      type: 'stageFile',
      name: 'StageOrderFile',
      displayName: 'Archive Order',
      position: { x: 1060, y: 200 },
      adapter: 'FTP Adapter',
      operation: 'write',
      endpoint: '/orders/archive/',
      description: 'Archives processed order to file storage',
    },

    // Notification
    {
      id: 'notification-1',
      type: 'notification',
      name: 'SendConfirmation',
      displayName: 'Send Confirmation',
      position: { x: 1310, y: 200 },
      adapter: 'Email Adapter',
      operation: 'sendEmail',
      description: 'Sends order confirmation to customer',
    },

    // End
    {
      id: 'end-1',
      type: 'end',
      name: 'ReturnResponse',
      displayName: 'Return Response',
      position: { x: 1560, y: 200 },
      description: 'Returns order confirmation response',
    },
  ],

  edges: [
    { id: 'edge-1', sourceId: 'start-1', targetId: 'map-1' },
    { id: 'edge-2', sourceId: 'map-1', targetId: 'lookup-1' },
    { id: 'edge-3', sourceId: 'lookup-1', targetId: 'invoke-1' },
    { id: 'edge-4', sourceId: 'invoke-1', targetId: 'stage-1' },
    { id: 'edge-5', sourceId: 'stage-1', targetId: 'notification-1' },
    { id: 'edge-6', sourceId: 'notification-1', targetId: 'end-1' },
  ],
};
