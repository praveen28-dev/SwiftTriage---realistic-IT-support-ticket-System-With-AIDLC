/**
 * useWidgetConfig Hook
 * Manage user's dashboard widget configuration
 */

import useSWR from 'swr';

interface WidgetConfig {
  id: string;
  userId: string;
  widgetType: string;
  title: string;
  gridPosition: number;
  gridColumn: number;
  gridRow: number;
  queryConfig: any;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WidgetConfigResponse {
  widgets: WidgetConfig[];
  count: number;
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('Failed to fetch widget configuration');
  return res.json();
});

export function useWidgetConfig() {
  const { data, error, isLoading, mutate } = useSWR<WidgetConfigResponse>(
    '/api/v1/dashboard/widgets',
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
    }
  );

  const createWidget = async (widgetData: {
    widgetType: string;
    title: string;
    gridPosition: number;
    gridColumn?: number;
    gridRow?: number;
    queryConfig?: any;
    isVisible?: boolean;
  }) => {
    const response = await fetch('/api/v1/dashboard/widgets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...widgetData,
        queryConfig: widgetData.queryConfig ? JSON.stringify(widgetData.queryConfig) : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create widget');
    }

    const result = await response.json();
    mutate(); // Revalidate the widget list
    return result.widget;
  };

  const updateWidget = async (
    widgetId: string,
    updates: {
      title?: string;
      gridPosition?: number;
      gridColumn?: number;
      gridRow?: number;
      queryConfig?: any;
      isVisible?: boolean;
    }
  ) => {
    const response = await fetch(`/api/v1/dashboard/widgets/${widgetId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...updates,
        queryConfig: updates.queryConfig ? JSON.stringify(updates.queryConfig) : undefined,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update widget');
    }

    const result = await response.json();
    mutate(); // Revalidate the widget list
    return result.widget;
  };

  const deleteWidget = async (widgetId: string) => {
    const response = await fetch(`/api/v1/dashboard/widgets/${widgetId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to delete widget');
    }

    mutate(); // Revalidate the widget list
  };

  const reorderWidgets = async (
    widgets: Array<{ id: string; gridPosition: number }>
  ) => {
    const response = await fetch('/api/v1/dashboard/widgets/reorder', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ widgets }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to reorder widgets');
    }

    mutate(); // Revalidate the widget list
  };

  return {
    widgets: data?.widgets || [],
    count: data?.count || 0,
    isLoading,
    error,
    mutate,
    createWidget,
    updateWidget,
    deleteWidget,
    reorderWidgets,
  };
}
