/**
 * Analytics Utilities
 * Google Analytics 4 event tracking and page view tracking
 */

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string,
      config?: Record<string, any>
    ) => void;
    dataLayer: any[];
  }
}

// Google Analytics Measurement ID (replace with your actual ID)
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-XXXXXXXXXX';

// Page view tracking
export const pageview = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Event tracking
interface EventParams {
  action: string;
  category: string;
  label?: string;
  value?: number;
  [key: string]: any;
}

export const event = ({ action, category, label, value, ...params }: EventParams) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
      ...params,
    });
  }
};

// Predefined event tracking functions

// Button click tracking
export const trackButtonClick = (buttonName: string, location: string) => {
  event({
    action: 'click',
    category: 'Button',
    label: `${buttonName} - ${location}`,
  });
};

// Form submission tracking
export const trackFormSubmission = (formName: string, success: boolean) => {
  event({
    action: success ? 'submit_success' : 'submit_error',
    category: 'Form',
    label: formName,
  });
};

// Ticket submission tracking
export const trackTicketSubmission = (category: string, urgency: number) => {
  event({
    action: 'ticket_submitted',
    category: 'Ticket',
    label: category,
    value: urgency,
  });
};

// Login tracking
export const trackLogin = (method: string, role: string) => {
  event({
    action: 'login',
    category: 'Authentication',
    label: method,
    user_role: role,
  });
};

// Widget interaction tracking
export const trackWidgetInteraction = (widgetType: string, action: string) => {
  event({
    action: action,
    category: 'Widget',
    label: widgetType,
  });
};

// Dashboard customization tracking
export const trackDashboardCustomization = (action: string, widgetType?: string) => {
  event({
    action: action,
    category: 'Dashboard',
    label: widgetType || 'general',
  });
};

// Search tracking
export const trackSearch = (searchTerm: string, resultsCount: number) => {
  event({
    action: 'search',
    category: 'Search',
    label: searchTerm,
    value: resultsCount,
  });
};

// Navigation tracking
export const trackNavigation = (destination: string, source: string) => {
  event({
    action: 'navigate',
    category: 'Navigation',
    label: `${source} -> ${destination}`,
  });
};

// Error tracking
export const trackError = (errorType: string, errorMessage: string, location: string) => {
  event({
    action: 'error',
    category: 'Error',
    label: `${errorType} - ${location}`,
    error_message: errorMessage,
  });
};

// Performance tracking
export const trackPerformance = (metric: string, value: number, page: string) => {
  event({
    action: 'performance',
    category: 'Performance',
    label: `${metric} - ${page}`,
    value: Math.round(value),
  });
};

// Conversion tracking
export const trackConversion = (conversionType: string, value?: number) => {
  event({
    action: 'conversion',
    category: 'Conversion',
    label: conversionType,
    value: value,
  });
};

// Social share tracking
export const trackSocialShare = (platform: string, contentType: string) => {
  event({
    action: 'share',
    category: 'Social',
    label: `${platform} - ${contentType}`,
  });
};

// Video tracking (if applicable)
export const trackVideo = (action: 'play' | 'pause' | 'complete', videoTitle: string, progress?: number) => {
  event({
    action: `video_${action}`,
    category: 'Video',
    label: videoTitle,
    value: progress,
  });
};

// Download tracking
export const trackDownload = (fileName: string, fileType: string) => {
  event({
    action: 'download',
    category: 'Download',
    label: `${fileName} (${fileType})`,
  });
};

// Outbound link tracking
export const trackOutboundLink = (url: string, linkText: string) => {
  event({
    action: 'click',
    category: 'Outbound Link',
    label: linkText,
    outbound_url: url,
  });
};

// User engagement tracking
export const trackEngagement = (engagementType: string, duration?: number) => {
  event({
    action: 'engagement',
    category: 'Engagement',
    label: engagementType,
    value: duration,
  });
};

// Feature usage tracking
export const trackFeatureUsage = (featureName: string, action: string) => {
  event({
    action: 'feature_used',
    category: 'Feature',
    label: `${featureName} - ${action}`,
  });
};
