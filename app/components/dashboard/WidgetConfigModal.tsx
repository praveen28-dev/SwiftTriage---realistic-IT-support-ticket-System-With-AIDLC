/**
 * Widget Configuration Modal
 * Add and configure dashboard widgets
 */

'use client';

import React, { useState } from 'react';
import { X, Plus, BarChart3, PieChart as PieChartIcon, Activity, AlertTriangle } from 'lucide-react';

interface WidgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWidget: (widgetType: string, title: string) => Promise<void>;
  existingWidgets: Array<{ widgetType: string }>;
}

const AVAILABLE_WIDGETS = [
  {
    type: 'tickets_by_status',
    title: 'Tickets by Status',
    description: 'Pie chart showing ticket distribution by status',
    icon: PieChartIcon,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    type: 'tickets_by_priority',
    title: 'Tickets by Priority',
    description: 'Priority level distribution with alerts',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-600',
  },
  {
    type: 'tickets_by_category',
    title: 'Tickets by Category',
    description: 'Donut chart of ticket categories',
    icon: PieChartIcon,
    color: 'bg-indigo-100 text-indigo-600',
  },
  {
    type: 'tickets_by_tech_group',
    title: 'Tickets by Tech Group',
    description: 'Workload distribution across tech teams',
    icon: PieChartIcon,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    type: 'tickets_by_alert_level',
    title: 'Tickets by Alert Level',
    description: 'SLA alert status monitoring',
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    type: 'tickets_by_request_type',
    title: 'Tickets by Request Type',
    description: 'Horizontal bar chart of request types',
    icon: BarChart3,
    color: 'bg-green-100 text-green-600',
  },
  {
    type: 'ticket_activity',
    title: 'Ticket Activity',
    description: 'Real-time feed of ticket changes',
    icon: Activity,
    color: 'bg-teal-100 text-teal-600',
  },
  {
    type: 'tickets_by_alert_condition',
    title: 'Tickets by Alert Condition',
    description: 'SLA breach monitoring',
    icon: AlertTriangle,
    color: 'bg-red-100 text-red-600',
  },
  {
    type: 'customer_satisfaction',
    title: 'Customer Satisfaction',
    description: 'Average CDI rating with trend',
    icon: Activity,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    type: 'ticket_trends',
    title: 'Ticket Trends',
    description: 'Line chart showing volume over time',
    icon: BarChart3,
    color: 'bg-cyan-100 text-cyan-600',
  },
];

export function WidgetConfigModal({
  isOpen,
  onClose,
  onAddWidget,
  existingWidgets,
}: WidgetConfigModalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddWidget = async (widgetType: string, title: string) => {
    setIsAdding(true);
    try {
      await onAddWidget(widgetType, title);
      setSelectedWidget(null);
    } catch (error) {
      console.error('Error adding widget:', error);
      alert('Failed to add widget. Please try again.');
    } finally {
      setIsAdding(false);
    }
  };

  const isWidgetAdded = (widgetType: string) => {
    return existingWidgets.some(w => w.widgetType === widgetType);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Configure Dashboard</h2>
            <p className="text-gray-600 mt-1">Add widgets to customize your dashboard</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {AVAILABLE_WIDGETS.map((widget) => {
              const Icon = widget.icon;
              const isAdded = isWidgetAdded(widget.type);

              return (
                <div
                  key={widget.type}
                  className={`border rounded-lg p-4 transition-all ${
                    isAdded
                      ? 'border-gray-200 bg-gray-50 opacity-60'
                      : 'border-gray-300 hover:border-blue-400 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-3 rounded-lg ${widget.color}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {widget.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {widget.description}
                      </p>
                      {isAdded ? (
                        <span className="inline-flex items-center text-sm text-gray-500">
                          ✓ Already added
                        </span>
                      ) : (
                        <button
                          onClick={() => handleAddWidget(widget.type, widget.title)}
                          disabled={isAdding}
                          className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Add Widget</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Tips Section */}
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">💡 Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Drag widgets to reorder them on your dashboard</li>
              <li>• Click the menu icon on any widget to edit, refresh, or remove it</li>
              <li>• Click on chart elements to drill down into filtered ticket views</li>
              <li>• Export widget data as CSV using the widget menu</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
