/**
 * Widget Edit Modal
 * Edit widget title, filters, and display options
 */

'use client';

import React, { useState } from 'react';
import { X, Save } from 'lucide-react';

interface WidgetEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (updates: WidgetEditData) => Promise<void>;
  widget: {
    id: string;
    widgetType: string;
    title: string;
    queryConfig?: any;
    gridColumn?: number;
  };
}

interface WidgetEditData {
  title?: string;
  queryConfig?: any;
  gridColumn?: number;
}

export function WidgetEditModal({ isOpen, onClose, onSave, widget }: WidgetEditModalProps) {
  const [title, setTitle] = useState(widget.title);
  const [gridColumn, setGridColumn] = useState(widget.gridColumn || 1);
  const [isSaving, setIsSaving] = useState(false);
  
  // Filter states
  const [dateRange, setDateRange] = useState(widget.queryConfig?.dateRange || 'all');
  const [limit, setLimit] = useState(widget.queryConfig?.limit || 20);
  const [sortOrder, setSortOrder] = useState(widget.queryConfig?.sortOrder || 'desc');

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updates: WidgetEditData = {
        title,
        gridColumn,
        queryConfig: {
          dateRange,
          limit,
          sortOrder,
        },
      };
      await onSave(updates);
      onClose();
    } catch (error) {
      console.error('Error saving widget:', error);
      alert('Failed to save widget. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const getWidgetTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      tickets_by_status: 'Tickets by Status',
      tickets_by_tech_group: 'Tickets by Tech Group',
      tickets_by_alert_level: 'Tickets by Alert Level',
      tickets_by_request_type: 'Tickets by Request Type',
      ticket_activity: 'Ticket Activity',
      tickets_by_alert_condition: 'Tickets by Alert Condition',
      tickets_by_priority: 'Tickets by Priority',
      tickets_by_category: 'Tickets by Category',
    };
    return labels[type] || type;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Edit Widget</h2>
            <p className="text-gray-600 mt-1">{getWidgetTypeLabel(widget.widgetType)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Widget Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter widget title"
            />
          </div>

          {/* Widget Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Widget Width
            </label>
            <select
              value={gridColumn}
              onChange={(e) => setGridColumn(parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1}>Small (1 column)</option>
              <option value={2}>Medium (2 columns)</option>
              <option value={3}>Large (3 columns)</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Controls how many columns the widget spans in the grid
            </p>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Time</option>
              <option value="last_7_days">Last 7 Days</option>
              <option value="last_30_days">Last 30 Days</option>
              <option value="last_90_days">Last 90 Days</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Filter data by time period
            </p>
          </div>

          {/* Limit */}
          {widget.widgetType !== 'ticket_activity' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Items
              </label>
              <input
                type="number"
                value={limit}
                onChange={(e) => setLimit(parseInt(e.target.value))}
                min={5}
                max={50}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                Number of items to display (5-50)
              </p>
            </div>
          )}

          {/* Sort Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sort Order
            </label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="desc">Highest to Lowest</option>
              <option value="asc">Lowest to Highest</option>
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Order items by count
            </p>
          </div>

          {/* Preview Note */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> Changes will take effect immediately after saving. 
              The widget will refresh with your new settings.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
