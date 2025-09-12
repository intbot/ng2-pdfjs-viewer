import { Injectable } from '@angular/core';
import { track } from '@vercel/analytics';

@Injectable({
  providedIn: 'root'
})
export class VercelAnalyticsService {
  constructor() {
    // Analytics is automatically initialized via main.ts
  }

  /**
   * Track custom events
   * @param eventName - Name of the event to track
   * @param properties - Optional properties to include with the event
   */
  track(eventName: string, properties?: Record<string, any>): void {
    track(eventName, properties);
  }

  /**
   * Track page views (usually automatic)
   * @param page - Page name or URL
   */
  trackPageView(page: string): void {
    track('page_view', { page });
  }

  /**
   * Track PDF viewer specific events
   * @param action - Action performed (e.g., 'pdf_loaded', 'pdf_error', 'download_clicked')
   * @param details - Additional details about the action
   */
  trackPdfViewerEvent(action: string, details?: Record<string, any>): void {
    track('pdf_viewer_event', {
      action,
      ...details
    });
  }
}
