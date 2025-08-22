// Common utility functions for the PDF viewer component
export class ComponentUtils {
  // Common PostMessage action mapping
  static getActionForProperty(propertyName: string): string | null {
    const propertyActionMap: { [key: string]: string } = {
      // Control visibility
      'showOpenFile': 'show-openfile',
      'showDownload': 'show-download',
      'showPrint': 'show-print', 
      'showFullScreen': 'show-fullscreen',
      'showFind': 'show-find',
      'showViewBookmark': 'show-bookmark',
      'showAnnotations': 'show-annotations',
      
      // Mode controls
      'cursor': 'set-cursor',
      'scroll': 'set-scroll',
      'spread': 'set-spread',
      'zoom': 'set-zoom',
      'pageMode': 'update-page-mode',
      
      // Navigation
      'page': 'set-page',
      'rotation': 'set-rotation',
      'namedDest': 'go-to-named-dest',
      
      // Auto-actions
      'downloadOnLoad': 'trigger-download',
      'printOnLoad': 'trigger-print',
      'showLastPageOnLoad': 'go-to-last-page',
      'rotateCW': 'trigger-rotate-cw',
      'rotateCCW': 'trigger-rotate-ccw',
      
      // Error handling
      'errorMessage': 'set-error-message',
      'errorOverride': 'set-error-override',
      'errorAppend': 'set-error-append',
      
      // Configuration
      'locale': 'set-locale',
      'useOnlyCssZoom': 'set-css-zoom',
      'downloadFileName': 'set-download-filename',
      
      // Theme & Visual Customization (Phase 1)
      'theme': 'set-theme',
      'primaryColor': 'set-primary-color',
      'backgroundColor': 'set-background-color',
      'pageBorderColor': 'set-page-border-color',
      'toolbarColor': 'set-toolbar-color',
      'textColor': 'set-text-color',
      'borderRadius': 'set-border-radius',
      'customCSS': 'set-custom-css'
    };

    // Phase C: Toolbar/Sidebar group visibility
    const groupVisibilityMap: { [key: string]: string } = {
      'showToolbarLeft': 'show-toolbar-left',
      'showToolbarMiddle': 'show-toolbar-middle',
      'showToolbarRight': 'show-toolbar-right',
      'showSecondaryToolbarToggle': 'show-secondary-toolbar-toggle',
      'showSidebar': 'show-sidebar',
      'showSidebarLeft': 'show-sidebar-left',
      'showSidebarRight': 'show-sidebar-right'
    };

    // Phase D: Layout & responsive customization
    const layoutMap: { [key: string]: string } = {
      'toolbarDensity': 'set-toolbar-density',
      'sidebarWidth': 'set-sidebar-width',
      'toolbarPosition': 'set-toolbar-position',
      'sidebarPosition': 'set-sidebar-position',
      'responsiveBreakpoint': 'set-responsive-breakpoint'
    };
    
    return propertyActionMap[propertyName] || groupVisibilityMap[propertyName] || layoutMap[propertyName] || null;
  }

  // Event handler cleanup utility
  static cleanupEventHandlers(component: any): void {
    // Clean up webviewerloaded handler
    if ((component as any)._webviewerLoadedHandler) {
      document.removeEventListener("webviewerloaded", (component as any)._webviewerLoadedHandler);
    }
    
    // Clean up PDF.js event handlers
    if ((component as any)._pdfEventHandlers) {
      const handlers = (component as any)._pdfEventHandlers;
      const eventBus = component.PDFViewerApplication?.eventBus;
      
      if (eventBus) {
        Object.keys(handlers).forEach(eventName => {
          eventBus.off(eventName, handlers[eventName]);
        });
      }
    }
  }
} 