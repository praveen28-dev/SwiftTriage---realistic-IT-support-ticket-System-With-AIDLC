/**
 * Enhanced Enterprise Dashboard Page
 * Customizable dashboard with drag-and-drop widgets
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { EnterpriseLayout } from '@/app/components/layout/EnterpriseLayout';
import { WidgetGrid } from '@/app/components/widgets/WidgetGrid';
import { TicketsByStatusWidget } from '@/app/components/widgets/TicketsByStatusWidget';
import { TicketsByTechGroupWidget } from '@/app/components/widgets/TicketsByTechGroupWidget';
import { TicketsByAlertLevelWidget } from '@/app/components/widgets/TicketsByAlertLevelWidget';
import { TicketsByRequestTypeWidget } from '@/app/components/widgets/TicketsByRequestTypeWidget';
import { TicketActivityWidget } from '@/app/components/widgets/TicketActivityWidget';
import { TicketsByAlertConditionWidget } from '@/app/components/widgets/TicketsByAlertConditionWidget';
import { useWidgetConfig } from '@/hooks/useWidgetConfig';
import { useTicketStats } from '@/hooks/useTicketStats';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import { WidgetConfigModal } from '@/app/components/dashboard/WidgetConfigModal';
import { WidgetEditModal } from '@/app/components/dashboard/WidgetEditModal';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { Plus, Settings } from 'lucide-react';

// Default widget configuration for new users
const DEFAULT_WIDGETS = [
  { widgetType: 'tickets_by_status', title: 'Tickets by Status', gridPosition: 0 },
  { widgetType: 'tickets_by_request_type', title: 'Tickets by Request Type', gridPosition: 1 },
  { widgetType: 'ticket_activity', title: 'Ticket Activity', gridPosition: 2 },
  { widgetType: 'tickets_by_alert_level', title: 'Tickets by Alert Level', gridPosition: 3 },
  { widgetType: 'tickets_by_tech_group', title: 'Tickets by Tech Group', gridPosition: 4 },
  { widgetType: 'tickets_by_alert_condition', title: 'Tickets by Alert Condition', gridPosition: 5 },
];

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWidget, setEditingWidget] = useState<any>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  const { widgets, isLoading: widgetsLoading, createWidget, updateWidget, reorderWidgets, deleteWidget } = useWidgetConfig();

  // Fetch data for all widget types
  const statusStats = useTicketStats({ groupBy: 'status' });
  const techGroupStats = useTicketStats({ groupBy: 'tech_group' });
  const alertLevelStats = useTicketStats({ groupBy: 'alert_level' });
  const requestTypeStats = useTicketStats({ groupBy: 'request_type' });
  const alertConditionStats = useTicketStats({ groupBy: 'alert_condition' });
  const activityFeed = useActivityFeed({ limit: 5 });

  // Redirect if not authenticated or not IT staff
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && (session?.user as any)?.role !== 'it_staff') {
      router.push('/');
    }
  }, [status, session, router]);

  // Initialize default widgets for new users
  useEffect(() => {
    const initializeWidgets = async () => {
      if (!widgetsLoading && widgets.length === 0 && session) {
        try {
          // Create default widgets
          for (const widget of DEFAULT_WIDGETS) {
            await createWidget(widget);
          }
        } catch (error) {
          console.error('Error initializing default widgets:', error);
        }
      }
      setIsInitializing(false);
    };

    if (status === 'authenticated') {
      initializeWidgets();
    }
  }, [widgetsLoading, widgets.length, session, status]);

  if (status === 'loading' || widgetsLoading || isInitializing) {
    return (
      <EnterpriseLayout>
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="lg" />
        </div>
      </EnterpriseLayout>
    );
  }

  if (!session || (session.user as any)?.role !== 'it_staff') {
    return null;
  }

  const handleReorder = async (activeId: string, overId: string) => {
    const activeIndex = widgets.findIndex(w => w.id === activeId);
    const overIndex = widgets.findIndex(w => w.id === overId);

    if (activeIndex === -1 || overIndex === -1) return;

    // Create new order
    const newWidgets = [...widgets];
    const [movedWidget] = newWidgets.splice(activeIndex, 1);
    newWidgets.splice(overIndex, 0, movedWidget);

    // Update positions
    const updates = newWidgets.map((widget, index) => ({
      id: widget.id,
      gridPosition: index,
    }));

    try {
      await reorderWidgets(updates);
    } catch (error) {
      console.error('Error reordering widgets:', error);
    }
  };

  const handleRefresh = (widgetType: string) => {
    // Trigger data refresh based on widget type
    switch (widgetType) {
      case 'tickets_by_status':
        statusStats.mutate();
        break;
      case 'tickets_by_tech_group':
        techGroupStats.mutate();
        break;
      case 'tickets_by_alert_level':
        alertLevelStats.mutate();
        break;
      case 'tickets_by_request_type':
        requestTypeStats.mutate();
        break;
      case 'tickets_by_alert_condition':
        alertConditionStats.mutate();
        break;
      case 'ticket_activity':
        activityFeed.mutate();
        break;
    }
  };

  const handleAddWidget = async (widgetType: string, title: string) => {
    const nextPosition = widgets.length;
    await createWidget({
      widgetType,
      title,
      gridPosition: nextPosition,
    });
  };

  const handleEditWidget = (widget: any) => {
    setEditingWidget(widget);
    setShowEditModal(true);
  };

  const handleSaveWidget = async (updates: any) => {
    if (editingWidget) {
      await updateWidget(editingWidget.id, updates);
      // Refresh the widget data
      handleRefresh(editingWidget.widgetType);
    }
  };

  const renderWidget = (widget: any) => {
    const commonProps = {
      id: widget.id,
      onEdit: () => handleEditWidget(widget),
      onRemove: () => deleteWidget(widget.id),
      onRefresh: () => handleRefresh(widget.widgetType),
    };

    // Apply custom filters from queryConfig
    const queryConfig = widget.queryConfig || {};
    const dateRange = queryConfig.dateRange || 'all';
    const limit = queryConfig.limit || 20;
    const sortOrder = queryConfig.sortOrder || 'desc';

    switch (widget.widgetType) {
      case 'tickets_by_status':
        return (
          <TicketsByStatusWidget
            {...commonProps}
            data={statusStats.data}
          />
        );
      case 'tickets_by_tech_group':
        return (
          <TicketsByTechGroupWidget
            {...commonProps}
            data={techGroupStats.data}
          />
        );
      case 'tickets_by_alert_level':
        return (
          <TicketsByAlertLevelWidget
            {...commonProps}
            data={alertLevelStats.data}
          />
        );
      case 'tickets_by_request_type':
        return (
          <TicketsByRequestTypeWidget
            {...commonProps}
            data={requestTypeStats.data}
          />
        );
      case 'ticket_activity':
        return (
          <TicketActivityWidget
            {...commonProps}
            activities={activityFeed.activities}
          />
        );
      case 'tickets_by_alert_condition':
        return (
          <TicketsByAlertConditionWidget
            {...commonProps}
            data={alertConditionStats.data}
          />
        );
      default:
        return null;
    }
  };

  // Sort widgets by grid position
  const sortedWidgets = [...widgets].sort((a, b) => a.gridPosition - b.gridPosition);

  // Calculate quick stats
  const totalTickets = statusStats.data?.reduce((sum: number, item: any) => sum + item.count, 0) || 0;
  const openTickets = statusStats.data?.find((item: any) => item.status === 'OPEN')?.count || 0;
  const inProgressTickets = statusStats.data?.find((item: any) => item.status === 'IN_PROGRESS')?.count || 0;
  const resolvedToday = activityFeed.activities?.filter((activity: any) => {
    const today = new Date().toDateString();
    return new Date(activity.timestamp).toDateString() === today && activity.type === 'status_change' && activity.newValue === 'RESOLVED';
  }).length || 0;

  return (
    <EnterpriseLayout>
      <div className="p-8" style={{ backgroundColor: 'var(--gray-100)' }}>
        {/* Welcome Banner */}
        <div className="card p-6 mb-6" style={{
          background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
          color: 'white'
        }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black mb-2">
                Welcome back, {session.user?.name}! 👋
              </h1>
              <p className="text-white/90 text-lg">
                Here's what's happening with your IT support today
              </p>
            </div>
            <div className="hidden md:block">
              <svg className="w-24 h-24 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Tickets */}
          <div className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, var(--primary-500) 0%, var(--primary-600) 100%)'
              }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="badge badge-info">All Time</span>
            </div>
            <h3 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>
              {totalTickets}
            </h3>
            <p className="text-sm" style={{ color: 'var(--gray-600)' }}>Total Tickets</p>
          </div>

          {/* Open Tickets */}
          <div className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, var(--warning-500) 0%, var(--warning-600) 100%)'
              }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="badge badge-warning">Pending</span>
            </div>
            <h3 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>
              {openTickets}
            </h3>
            <p className="text-sm" style={{ color: 'var(--gray-600)' }}>Open Tickets</p>
          </div>

          {/* In Progress */}
          <div className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, var(--info-500) 0%, var(--info-600) 100%)'
              }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="badge badge-info">Active</span>
            </div>
            <h3 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>
              {inProgressTickets}
            </h3>
            <p className="text-sm" style={{ color: 'var(--gray-600)' }}>In Progress</p>
          </div>

          {/* Resolved Today */}
          <div className="card p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{
                background: 'linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%)'
              }}>
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="badge badge-success">Today</span>
            </div>
            <h3 className="text-3xl font-black mb-1" style={{ color: 'var(--gray-900)' }}>
              {resolvedToday}
            </h3>
            <p className="text-sm" style={{ color: 'var(--gray-600)' }}>Resolved Today</p>
          </div>
        </div>

        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--gray-900)' }}>
              Your Widgets
            </h2>
            <p style={{ color: 'var(--gray-600)' }}>
              Customize your dashboard by adding, removing, or rearranging widgets
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowConfigModal(true)}
              className="btn flex items-center gap-2"
              style={{
                backgroundColor: 'var(--white)',
                color: 'var(--gray-700)',
                border: `2px solid var(--gray-300)`
              }}
            >
              <Settings className="w-5 h-5" />
              <span>Configure</span>
            </button>
            <button
              onClick={() => setShowConfigModal(true)}
              className="btn flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                color: 'white'
              }}
            >
              <Plus className="w-5 h-5" />
              <span>Add Widget</span>
            </button>
          </div>
        </div>

        {/* Widget Grid */}
        {sortedWidgets.length > 0 ? (
          <WidgetGrid
            widgetIds={sortedWidgets.map(w => w.id)}
            onReorder={handleReorder}
          >
            {sortedWidgets.map(widget => {
              // Apply grid column span from widget config
              const gridColumnClass = widget.gridColumn === 3
                ? 'lg:col-span-3'
                : widget.gridColumn === 2
                ? 'lg:col-span-2'
                : '';

              return (
                <div key={widget.id} className={gridColumnClass}>
                  {renderWidget(widget)}
                </div>
              );
            })}
          </WidgetGrid>
        ) : (
          <div className="card text-center py-16">
            <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{
              background: 'linear-gradient(135deg, var(--primary-100) 0%, var(--primary-200) 100%)'
            }}>
              <Settings className="w-10 h-10" style={{ color: 'var(--primary-600)' }} />
            </div>
            <h3 className="text-2xl font-bold mb-2" style={{ color: 'var(--gray-900)' }}>
              No widgets configured
            </h3>
            <p className="text-lg mb-6" style={{ color: 'var(--gray-600)' }}>
              Add widgets to customize your dashboard and start tracking metrics
            </p>
            <button
              onClick={() => setShowConfigModal(true)}
              className="btn inline-flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, var(--primary-600) 0%, var(--primary-700) 100%)',
                color: 'white'
              }}
            >
              <Plus className="w-5 h-5" />
              <span>Add Your First Widget</span>
            </button>
          </div>
        )}

        {/* Configuration Modal */}
        <WidgetConfigModal
          isOpen={showConfigModal}
          onClose={() => setShowConfigModal(false)}
          onAddWidget={handleAddWidget}
          existingWidgets={widgets}
        />

        {/* Edit Modal */}
        {editingWidget && (
          <WidgetEditModal
            isOpen={showEditModal}
            onClose={() => {
              setShowEditModal(false);
              setEditingWidget(null);
            }}
            onSave={handleSaveWidget}
            widget={editingWidget}
          />
        )}
      </div>
    </EnterpriseLayout>
  );
}
