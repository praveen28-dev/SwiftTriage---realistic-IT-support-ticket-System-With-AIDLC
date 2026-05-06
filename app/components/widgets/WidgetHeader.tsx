/**
 * Widget Header Component
 * Header bar with title, drag handle, and menu controls
 */

'use client';

import React, { useState } from 'react';
import { GripVertical, MoreHorizontal, Edit, Trash2, RefreshCw, Download } from 'lucide-react';

interface WidgetHeaderProps {
  title: string;
  dragHandleProps?: any;
  onEdit?: () => void;
  onRemove?: () => void;
  onRefresh?: () => void;
  onExport?: () => void;
}

export function WidgetHeader({
  title,
  dragHandleProps,
  onEdit,
  onRemove,
  onRefresh,
  onExport,
}: WidgetHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200 rounded-t-lg">
      <div className="flex items-center space-x-2">
        {/* Drag Handle */}
        <button
          {...dragHandleProps}
          className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-200 rounded transition-colors"
          title="Drag to reorder"
        >
          <GripVertical className="w-5 h-5 text-gray-400" />
        </button>
        
        {/* Title */}
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
      </div>

      {/* Menu */}
      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
          title="Widget menu"
        >
          <MoreHorizontal className="w-5 h-5 text-gray-600" />
        </button>

        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Dropdown Menu */}
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              {onRefresh && (
                <button
                  onClick={() => {
                    onRefresh();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Refresh Data</span>
                </button>
              )}
              
              {onEdit && (
                <button
                  onClick={() => {
                    onEdit();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit Widget</span>
                </button>
              )}
              
              {onExport && (
                <button
                  onClick={() => {
                    onExport();
                    setIsMenuOpen(false);
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Data</span>
                </button>
              )}
              
              {onRemove && (
                <>
                  <div className="border-t border-gray-200 my-1" />
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to remove this widget?')) {
                        onRemove();
                      }
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Remove Widget</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
