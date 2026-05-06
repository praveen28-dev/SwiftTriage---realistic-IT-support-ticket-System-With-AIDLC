/**
 * Dashboard Demo Page
 * Test page for widget system with mock data
 */

'use client';

import React, { useState } from 'react';
import { WidgetGrid } from '@/app/components/widgets/WidgetGrid';
import { TicketsByStatusWidget } from '@/app/components/widgets/TicketsByStatusWidget';
import { TicketsByTechGroupWidget } from '@/app/components/widgets/TicketsByTechGroupWidget';
import { TicketsByAlertLevelWidget } from '@/app/components/widgets/TicketsByAlertLevelWidget';
import { TicketsByRequestTypeWidget } from '@/app/components/widgets/TicketsByRequestTypeWidget';
import { TicketActivityWidget } from '@/app/components/widgets/TicketActivityWidget';
import { TicketsByAlertConditionWidget } from '@/app/components/widgets/TicketsByAlertConditionWidget';

// Mock data for testing
const MOCK_STATUS_DATA = [
  { label: 'Open', value: 'open', count: 33, color: '#007bff' },
  { label: 'Closed', value: 'closed', count: 10, color: '#fd7e14' },
  { label: 'Resolved', value: 'resolved', count: 1, color: '#10b981' },
  { label: 'Approved', value: 'approved', count: 3, color: '#dc3545' },
  { label: 'Pending', value: 'pending', count: 2, color: '#17a2b8' },
];

const MOCK_TECH_GROUP_DATA = [
  { label: 'IT Desktop Support', value: 'desktop', count: 13, color: '#1e3a8a' },
  { label: 'IT Network Support', value: 'network', count: 9, color: '#3b82f6' },
  { label: 'Facilities', value: 'facilities', count: 9, color: '#fd7e14' },
  { label: 'IT Hardware Support', value: 'hardware', count: 9, color: '#ffc107' },
  { label: 'Human Resources', value: 'hr', count: 7, color: '#10b981' },
];

const MOCK_ALERT_LEVEL_DATA = [
  { label: 'No Alerts', value: 'no_alerts', count: 2, color: '#1e3a8a' },
  { label: 'Second Alert Level', value: 'second', count: 18, color: '#f97316' },
  { label: 'Third Alert Level', value: 'third', count: 23, color: '#3b82f6' },
];

const MOCK_REQUEST_TYPE_DATA = [
  { label: 'Upgrade Request', value: 'upgrade', count: 7, color: '#007bff' },
  { label: 'Installation Request', value: 'installation', count: 5, color: '#fd7e14' },
  { label: 'Web', value: 'web', count: 3, color: '#10b981' },
  { label: 'Insurance', value: 'insurance', count: 2, color: '#dc3545' },
  { label: 'Phones', value: 'phones', count: 2, color: '#17a2b8' },
];

const MOCK_ALERT_CONDITION_DATA = [
  { label: 'No Alerts', value: 'no_alerts', count: 2, color: '#10b981' },
  { label: 'Not Completed', value: 'not_completed', count: 41, color: '#dc3545' },
];

const MOCK_ACTIVITIES = [
  {
    id: '1',
    ticket_id: '456abc',
    ticket_number: '#35000953',
    action_type: 'status_change',
    action_detail: 'De-escalated to Joe Admin',
    comment_snippet: 'Schedule change - postponing release',
    user_id: '789def',
    user_name: 'Joe Admin',
    timestamp: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    relative_time: '6 days ago',
    is_expandable: true,
    expanded_content: 'Full details: The release has been postponed due to scheduling conflicts with the infrastructure team. New target date is next Monday.',
  },
  {
    id: '2',
    ticket_id: '789xyz',
    ticket_number: '#35000954',
    action_type: 'comment',
    action_detail: 'Added comment',
    comment_snippet: 'Customer confirmed the issue is resolved',
    user_id: '123abc',
    user_name: 'Sarah Tech',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    relative_time: '2 hours ago',
    is_expandable: false,
  },
];

export default function DashboardDemoPage() {
  const [widgets, setWidgets] = useState([
    { id: 'widget-1', type: 'status' },
    { id: 'widget-2', type: 'request_type' },
    { id: 'widget-3', type: 'activity' },
    { id: 'widget-4', type: 'alert_level' },
    { id: 'widget-5', type: 'tech_group' },
    { id: 'widget-6', type: 'alert_condition' },
  ]);

  const handleReorder = (activeId: string, overId: string) => {
    const activeIndex = widgets.findIndex(w => w.id === activeId);
    const overIndex = widgets.findIndex(w => w.id === overId);

    if (activeIndex === -1 || overIndex === -1) return;

    const newWidgets = [...widgets];
    const [movedWidget] = newWidgets.splice(activeIndex, 1);
    newWidgets.splice(overIndex, 0, movedWidget);

    setWidgets(newWidgets);
  };

  const handleRemove = (widgetId: string) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const handleRefresh = () => {
    console.log('Refreshing widget data...');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Widget System Demo</h1>
        <p className="text-gray-600 mt-1">
          Test drag-and-drop functionality and widget interactions
        </p>
      </div>

      {/* Instructions */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">🎯 Test Instructions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Drag-and-Drop:</strong> Click and drag the grip icon (⋮⋮) to reorder widgets</li>
          <li>• <strong>Widget Menu:</strong> Click the three dots (⋯) to access widget options</li>
          <li>• <strong>Drill-Down:</strong> Click on chart elements or legend items to test navigation</li>
          <li>• <strong>Export:</strong> Use the widget menu to export data as CSV</li>
          <li>• <strong>Remove:</strong> Delete widgets using the menu option</li>
        </ul>
      </div>

      {/* Widget Grid */}
      <WidgetGrid
        widgetIds={widgets.map(w => w.id)}
        onReorder={handleReorder}
      >
        {widgets.map(widget => {
          switch (widget.type) {
            case 'status':
              return (
                <TicketsByStatusWidget
                  key={widget.id}
                  id={widget.id}
                  data={MOCK_STATUS_DATA}
                  onRemove={() => handleRemove(widget.id)}
                  onRefresh={handleRefresh}
                />
              );
            case 'tech_group':
              return (
                <TicketsByTechGroupWidget
                  key={widget.id}
                  id={widget.id}
                  data={MOCK_TECH_GROUP_DATA}
                  onRemove={() => handleRemove(widget.id)}
                  onRefresh={handleRefresh}
                />
              );
            case 'alert_level':
              return (
                <TicketsByAlertLevelWidget
                  key={widget.id}
                  id={widget.id}
                  data={MOCK_ALERT_LEVEL_DATA}
                  onRemove={() => handleRemove(widget.id)}
                  onRefresh={handleRefresh}
                />
              );
            case 'request_type':
              return (
                <TicketsByRequestTypeWidget
                  key={widget.id}
                  id={widget.id}
                  data={MOCK_REQUEST_TYPE_DATA}
                  onRemove={() => handleRemove(widget.id)}
                  onRefresh={handleRefresh}
                />
              );
            case 'activity':
              return (
                <TicketActivityWidget
                  key={widget.id}
                  id={widget.id}
                  activities={MOCK_ACTIVITIES}
                  onRemove={() => handleRemove(widget.id)}
                  onRefresh={handleRefresh}
                />
              );
            case 'alert_condition':
              return (
                <TicketsByAlertConditionWidget
                  key={widget.id}
                  id={widget.id}
                  data={MOCK_ALERT_CONDITION_DATA}
                  onRemove={() => handleRemove(widget.id)}
                  onRefresh={handleRefresh}
                />
              );
            default:
              return null;
          }
        })}
      </WidgetGrid>

      {/* Widget Count */}
      <div className="mt-6 text-center text-gray-600">
        <p>Currently displaying {widgets.length} widget{widgets.length !== 1 ? 's' : ''}</p>
      </div>
    </div>
  );
}
