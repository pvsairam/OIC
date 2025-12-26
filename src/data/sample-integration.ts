/* ============================================
   Sample Integration Flow Data
   Demonstrates all activity types and containers
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
      position: { x: 50, y: 150 },
      adapter: 'REST Adapter',
      operation: 'POST /orders',
      description: 'Receives incoming order from e-commerce platform',
    },

    // Initial mapping
    {
      id: 'map-1',
      type: 'map',
      name: 'MapOrderRequest',
      displayName: 'Map Order Request',
      position: { x: 300, y: 150 },
      description: 'Maps incoming order to canonical format',
      properties: {
        sourceSchema: 'OrderRequest',
        targetSchema: 'CanonicalOrder',
      },
    },

    // Lookup customer
    {
      id: 'lookup-1',
      type: 'lookup',
      name: 'LookupCustomer',
      displayName: 'Lookup Customer',
      position: { x: 550, y: 150 },
      adapter: 'Database Adapter',
      operation: 'CustomerLookup',
      description: 'Retrieves customer information from database',
    },

    // Assign variables
    {
      id: 'assign-1',
      type: 'assign',
      name: 'SetOrderVariables',
      displayName: 'Set Order Variables',
      position: { x: 800, y: 150 },
      description: 'Initializes processing variables',
      properties: {
        variables: ['orderStatus', 'totalAmount', 'processDate'],
      },
    },

    // Switch for order type
    {
      id: 'switch-1',
      type: 'switch',
      name: 'OrderTypeSwitch',
      displayName: 'Order Type',
      position: { x: 1050, y: 50 },
      dimensions: { width: 600, height: 400 },
      condition: '$orderType',
      routes: [
        {
          id: 'route-standard',
          name: 'Standard',
          condition: "orderType = 'STANDARD'",
          children: [
            {
              id: 'invoke-standard',
              type: 'invoke',
              name: 'ProcessStandardOrder',
              displayName: 'Process Standard Order',
              position: { x: 30, y: 30 },
              adapter: 'ERP Adapter',
              operation: 'createOrder',
            },
          ],
        },
        {
          id: 'route-express',
          name: 'Express',
          condition: "orderType = 'EXPRESS'",
          children: [
            {
              id: 'invoke-express',
              type: 'invoke',
              name: 'ProcessExpressOrder',
              displayName: 'Process Express Order',
              position: { x: 30, y: 30 },
              adapter: 'ERP Adapter',
              operation: 'createPriorityOrder',
            },
            {
              id: 'notify-express',
              type: 'notification',
              name: 'NotifyExpressTeam',
              displayName: 'Notify Express Team',
              position: { x: 280, y: 30 },
              adapter: 'Email Adapter',
              operation: 'sendEmail',
            },
          ],
        },
        {
          id: 'route-otherwise',
          name: 'Otherwise',
          isOtherwise: true,
          children: [
            {
              id: 'logger-unknown',
              type: 'logger',
              name: 'LogUnknownType',
              displayName: 'Log Unknown Type',
              position: { x: 30, y: 30 },
            },
          ],
        },
      ],
      children: [],
    },

    // For Each for order items
    {
      id: 'foreach-1',
      type: 'forEach',
      name: 'ProcessOrderItems',
      displayName: 'Process Order Items',
      position: { x: 1700, y: 100 },
      dimensions: { width: 550, height: 250 },
      variableName: 'orderItem',
      expression: '$order/items',
      children: [
        {
          id: 'lookup-inventory',
          type: 'lookup',
          name: 'CheckInventory',
          displayName: 'Check Inventory',
          position: { x: 30, y: 30 },
          adapter: 'Database Adapter',
          operation: 'inventoryCheck',
        },
        {
          id: 'invoke-reserve',
          type: 'invoke',
          name: 'ReserveStock',
          displayName: 'Reserve Stock',
          position: { x: 280, y: 30 },
          adapter: 'Inventory Adapter',
          operation: 'reserveItem',
        },
      ],
    },

    // Stage file
    {
      id: 'stage-1',
      type: 'stageFile',
      name: 'StageOrderFile',
      displayName: 'Stage Order File',
      position: { x: 2300, y: 150 },
      adapter: 'File Adapter',
      operation: 'write',
      endpoint: '/orders/processed/',
      description: 'Archives processed order to file storage',
    },

    // Final mapping
    {
      id: 'map-2',
      type: 'map',
      name: 'MapOrderResponse',
      displayName: 'Map Order Response',
      position: { x: 2550, y: 150 },
      description: 'Maps result to response format',
    },

    // Notification
    {
      id: 'notification-1',
      type: 'notification',
      name: 'SendConfirmation',
      displayName: 'Send Confirmation',
      position: { x: 2800, y: 150 },
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
      position: { x: 3050, y: 150 },
      description: 'Returns order confirmation response',
    },
  ],

  edges: [
    { id: 'edge-1', sourceId: 'start-1', targetId: 'map-1' },
    { id: 'edge-2', sourceId: 'map-1', targetId: 'lookup-1' },
    { id: 'edge-3', sourceId: 'lookup-1', targetId: 'assign-1' },
    { id: 'edge-4', sourceId: 'assign-1', targetId: 'switch-1' },
    { id: 'edge-5', sourceId: 'switch-1', targetId: 'foreach-1' },
    { id: 'edge-6', sourceId: 'foreach-1', targetId: 'stage-1' },
    { id: 'edge-7', sourceId: 'stage-1', targetId: 'map-2' },
    { id: 'edge-8', sourceId: 'map-2', targetId: 'notification-1' },
    { id: 'edge-9', sourceId: 'notification-1', targetId: 'end-1' },
    // Internal edges for foreach
    { id: 'edge-foreach-1', sourceId: 'lookup-inventory', targetId: 'invoke-reserve' },
    // Internal edges for switch routes
    { id: 'edge-switch-express', sourceId: 'invoke-express', targetId: 'notify-express' },
  ],
};
