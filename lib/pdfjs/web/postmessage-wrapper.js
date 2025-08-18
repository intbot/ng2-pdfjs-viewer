(function() {
  'use strict';
  
  // 🟢 TEST LOG - Build verification (BUILD_ID: placeholder)
  console.log('🟢 postmessage-wrapper.js: TEST LOG - BUILD_ID:', '2025-08-17T23-02-43-000Z');
  
  // #region Constants and Configuration
  // Command tracking for zoom to prevent infinite loops
  const ZoomCommandTracker = {
    activeZoomCommand: false,
    
    markZoomCommandStart() {
      this.activeZoomCommand = true;
    },
    
    markZoomCommandEnd() {
      this.activeZoomCommand = false;
    },
    
    isZoomCommandActive() {
      return this.activeZoomCommand;
    }
  };
  
  // Readiness state management
  const ViewerReadiness = {
    NOT_LOADED: 0,
    VIEWER_LOADED: 1,      // PDFViewerApplication exists
    VIEWER_INITIALIZED: 2, // PDFViewerApplication.initialized = true
    EVENTBUS_READY: 3,     // Event bus is available and ready
    COMPONENTS_READY: 4,   // All required components available
    DOCUMENT_LOADED: 5     // PDF document fully loaded
  };
  
  // Pure event-driven architecture - no action categorization needed
  // All actions are dispatched at required readiness levels by Universal Dispatcher
  // #endregion

  // #region State Management
  let currentReadiness = ViewerReadiness.NOT_LOADED;
  let readinessCallbacks = [];
  // #endregion

  // #region Utility Functions
  // Diagnostic logging function
  function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = '[PostMessage]';
    
      switch (level) {
        case 'error':
        console.error(`${prefix} ${timestamp} ERROR: ${message}`);
          break;
        case 'warn':
        console.warn(`${prefix} ${timestamp} WARN: ${message}`);
          break;
        default:
        console.log(`${prefix} ${timestamp} INFO: ${message}`);
    }
  }

  // Button visibility control helper (consolidated from separate module)
  function toggleButtonVisibility(primaryId, secondaryId, visible) {
    const primary = document.getElementById(primaryId);
    const secondary = secondaryId ? document.getElementById(secondaryId) : null;
    if (primary) primary.classList.toggle('hidden', !visible);
    if (secondary) secondary.classList.toggle('hidden', !visible);
    log(`${primaryId} visibility set to: ${visible}`);
  }

  // Generic element visibility control for toolbar/sidebar groups
  function toggleElementVisibilityById(elementId, visible) {
    const el = document.getElementById(elementId);
    if (!el) {
      log(`Element not found for visibility toggle: ${elementId}`, 'warn');
      return;
    }
    el.classList.toggle('hidden', !visible);
  }
  
  // Readiness state management
  function setReadiness(readiness) {
    if (readiness > currentReadiness) {
      log(`Readiness state changed: ${currentReadiness} → ${readiness}`);
      currentReadiness = readiness;
      
      // Execute callbacks for this readiness level
      readinessCallbacks.forEach(callback => {
        if (callback.readiness <= readiness && !callback.executed) {
          callback.executed = true;
          callback.callback();
        }
      });
    }
  }
  
  function onReadiness(readiness, callback) {
    if (currentReadiness >= readiness) {
      callback();
    } else {
      readinessCallbacks.push({ readiness, callback, executed: false });
    }
  }
  
  // Inject minimal CSS for density classes without touching core files
  function ensureDensityStyles() {
    if (document.getElementById('ng2-density-styles')) return;
    const style = document.createElement('style');
    style.id = 'ng2-density-styles';
    style.textContent = `
      /* Toolbar positions */
      body #outerContainer.toolbar-bottom #toolbarContainer { position: absolute; bottom: 0; top: auto; }
      body #outerContainer.toolbar-bottom #viewerContainer { top: 0; bottom: var(--toolbar-height, 40px); }
      
      body #outerContainer.sidebar-right #sidebarContainer { inset-inline-start: auto; inset-inline-end: 0; }
      body #outerContainer.sidebar-right #sidebarResizer { inset-inline-start: auto; inset-inline-end: var(--sidebar-width, 200px); }
      
      #toolbarContainer.density-compact .toolbarButton,
      #toolbarContainer.density-compact .toolbarField,
      #toolbarContainer.density-compact select { height: 28px; font-size: 12px; }
      #toolbarContainer.density-compact #scaleSelect { height: 28px; }
      #toolbarContainer.density-compact { --toolbar-height: 32px; }
      #toolbarContainer.density-comfortable .toolbarButton,
      #toolbarContainer.density-comfortable .toolbarField,
      #toolbarContainer.density-comfortable select { height: 32px; }
      #toolbarContainer.density-comfortable { --toolbar-height: 40px; }
    `;
    document.head.appendChild(style);
  }
  
  // Enhanced zoom transformation function
  function transformZoomFromViewer(scale, app) {
    if (typeof scale === 'string') {
      return scale;
    }
    
    if (app?.pdfViewer) {
      const viewer = app.pdfViewer;
      
      // Check for special zoom modes
      const specialModes = ['page-fit', 'page-width', 'page-actual', 'auto'];
      if (specialModes.includes(viewer.currentScaleValue)) {
        return viewer.currentScaleValue;
      }
      
      // Check predefined zoom levels
      const predefinedZooms = {
        0.5: '0.5', 0.75: '0.75', 1: '1', 1.25: '1.25', 
        1.5: '1.5', 2: '2', 3: '3', 4: '4'
      };
      
      for (const [zoomLevel, zoomValue] of Object.entries(predefinedZooms)) {
        if (Math.abs(scale - parseFloat(zoomLevel)) < 0.01) {
          return zoomValue;
        }
      }
    }
    
    return typeof scale === 'number' ? `${Math.round(scale * 100)}%` : 'auto';
  }

  // Send state change notifications to Angular component
  function sendStateChangeNotification(property, value, source = 'user') {
    try {
      const message = {
        type: 'state-change',
        property: property,
        value: value,
        source: source,
        timestamp: Date.now()
      };
      
      log(`Sending state change notification: ${property} = ${value} (source: ${source})`);
      window.parent.postMessage(message, '*');
    } catch (error) {
      log(`Failed to send state change notification: ${error.message}`, 'error');
    }
  }

  // Send event notifications to Angular component
  function sendEventNotification(eventName, eventData) {
    try {
      const message = {
        type: 'event-notification',
        eventName: eventName,
        eventData: eventData,
        timestamp: Date.now()
      };
      
      log(`Sending event notification: ${eventName}`);
      window.parent.postMessage(message, '*');
    } catch (error) {
      log(`Failed to send event notification: ${error.message}`, 'error');
    }
  }

  function sendResponse(id, response) {
    if (id && window.parent) {
      window.parent.postMessage({
        type: 'control-response',
        id: id,
        ...response,
        timestamp: Date.now()
      }, '*');
    }
  }

  function getState() {
    const app = PDFViewerApplication;
    if (!app) {
      return { ready: false };
    }
    
    return {
      ready: app.initialized,
      page: app.page,
      pagesCount: app.pagesCount,
      currentScale: app.pdfViewer ? app.pdfViewer.currentScale : null,
      currentScaleValue: app.pdfViewer ? app.pdfViewer.currentScaleValue : null,
      pagesRotation: app.pdfViewer ? app.pdfViewer.pagesRotation : null,
      scrollMode: app.pdfViewer ? app.pdfViewer.scrollMode : null,
      spreadMode: app.pdfViewer ? app.pdfViewer.spreadMode : null
    };
  }

  // Common control update utilities
  const ControlUtils = {
    // Common button visibility update pattern
    updateButtonVisibility: function(buttonId, secondaryId, visible) {
      const button = document.getElementById(buttonId);
      const secondaryButton = secondaryId ? document.getElementById(secondaryId) : null;
      
      if (button) {
        button.classList.toggle('hidden', !visible);
      }
      if (secondaryButton) {
        secondaryButton.classList.toggle('hidden', !visible);
      }
      
      log(`${buttonId} visibility set to: ${visible}`);
    },

    // Common mode update pattern with event bus
    updateModeViaEventBus: function(eventName, modeValue, modeMap, propertyName) {
      const app = PDFViewerApplication;
      if (!app?.eventBus) {
        log('EventBus not available for mode update', 'error');
        return;
      }

      try {
        const upperMode = typeof modeValue === 'string' ? modeValue.toUpperCase() : modeValue;
        const mode = modeMap[upperMode];
        
        if (mode !== undefined) {
          app.eventBus.dispatch(eventName, { mode });
          log(`${propertyName} updated via event bus to: ${upperMode} (mode: ${mode})`);
          
          // NOTE: State change notifications are sent by the bidirectional event listeners
          // when the actual mode change occurs in PDF.js, not immediately when we dispatch
          // This prevents infinite loops and ensures we only notify on actual changes
        } else {
          log(`Unknown ${propertyName} mode: ${modeValue}`, 'warn');
        }
      } catch (error) {
        log(`Error updating ${propertyName} mode: ${error.message}`, 'error');
      }
    },

    // Common direct property update pattern
    updatePropertyDirectly: function(propertyPath, value, propertyName) {
      const app = PDFViewerApplication;
      if (!app?.pdfViewer) {
        log(`PDFViewer not available for ${propertyName} update`, 'warn');
        return;
      }

      try {
        // Navigate to nested property
        const pathParts = propertyPath.split('.');
        let target = app;
        
        for (let i = 0; i < pathParts.length - 1; i++) {
          target = target[pathParts[i]];
          if (!target) {
            log(`Property path ${propertyPath} not found for ${propertyName}`, 'warn');
            return;
          }
        }
        
        target[pathParts[pathParts.length - 1]] = value;
        log(`${propertyName} updated via direct access to: ${value}`);
      } catch (error) {
        log(`Direct ${propertyName} update failed: ${error.message}`, 'warn');
      }
    },

    // Common validation pattern
    validateAndExecute: function(condition, action, errorMessage) {
      if (condition) {
        action();
      } else {
        log(errorMessage, 'warn');
      }
    }
  };
  // #endregion

  // #region Initialization and Setup
  log('PostMessage wrapper script loaded');
  
  // Enhanced readiness checking with proper async initialization handling
  function checkViewerReadiness() {
    const app = PDFViewerApplication;
    
    if (!app) {
      setReadiness(ViewerReadiness.NOT_LOADED);
      return;
    }
    
    setReadiness(ViewerReadiness.VIEWER_LOADED);
    
    // Handle async initialization properly
    if (app.initializedPromise) {
      app.initializedPromise.then(() => {
        log('PDFViewerApplication initialization completed');
        setReadiness(ViewerReadiness.VIEWER_INITIALIZED);
        
        // Check if event bus is ready
        if (app.eventBus && typeof app.eventBus.dispatch === 'function') {
          setReadiness(ViewerReadiness.EVENTBUS_READY);
          
          // Check if key components are available
          if (app.pdfViewer && app.pdfCursorTools) {
            setReadiness(ViewerReadiness.COMPONENTS_READY);
          }
        }
      }).catch(error => {
        log(`PDFViewerApplication initialization failed: ${error.message}`, 'error');
      });
    } else if (app.initialized) {
      // Fallback for synchronous check (though this should be async)
      log('Using synchronous initialization check (fallback)');
      setReadiness(ViewerReadiness.VIEWER_INITIALIZED);
      
      // Check if event bus is ready
      if (app.eventBus && typeof app.eventBus.dispatch === 'function') {
        setReadiness(ViewerReadiness.EVENTBUS_READY);
        
        // Check if key components are available
        if (app.pdfViewer && app.pdfCursorTools) {
          setReadiness(ViewerReadiness.COMPONENTS_READY);
        }
      }
    }
  }
  
  // Wait for PDF.js viewer to be ready with event-driven approach
  function waitForViewer() {
    // Use MutationObserver to detect when PDFViewerApplication becomes available
    const observer = new MutationObserver((mutations, obs) => {
      if (typeof PDFViewerApplication !== 'undefined') {
        log('PDFViewerApplication found via DOM observation, starting readiness check');
        obs.disconnect(); // Stop observing
        checkViewerReadiness();
        
        // Set up event-driven readiness monitoring
        setupEventDrivenReadinessMonitoring();
      }
    });
    
    // Start observing DOM changes
    observer.observe(document, {
      childList: true,
      subtree: true
    });
    
    // Also check immediately in case it's already available
    if (typeof PDFViewerApplication !== 'undefined') {
      log('PDFViewerApplication already available, starting readiness check');
      observer.disconnect();
      checkViewerReadiness();
      setupEventDrivenReadinessMonitoring();
    }
  }
  
  // Set up event-driven readiness monitoring
  function setupEventDrivenReadinessMonitoring() {
    // Use a custom event system for readiness changes
    const readinessEventTarget = new EventTarget();
    
    // Override setReadiness to emit events
    const originalSetReadiness = setReadiness;
    setReadiness = function(readiness) {
      originalSetReadiness(readiness);
      
      // Emit custom event for readiness change
      readinessEventTarget.dispatchEvent(new CustomEvent('readiness-change', {
        detail: { readiness, previousReadiness: currentReadiness }
      }));
    };
    
    // Listen for readiness changes
    readinessEventTarget.addEventListener('readiness-change', (event) => {
      const { readiness } = event.detail;
      
      if (readiness >= ViewerReadiness.EVENTBUS_READY) {
        log('EventBus ready via event, initializing PostMessage API');
        initializePostMessageAPI();
      }
    });
    
    // Check initial readiness
    if (currentReadiness >= ViewerReadiness.EVENTBUS_READY) {
      log('EventBus already ready, initializing PostMessage API');
      initializePostMessageAPI();
    }
  }

  function initializePostMessageAPI() {
    // Add message listener
    window.addEventListener('message', handleControlMessage);
    
    // Expose API for external access
    window.Ng2PdfJsViewerAPI = {
      updateControl: updateControl,
      getState: getState,
      isReady: () => currentReadiness >= ViewerReadiness.EVENTBUS_READY,
      getReadiness: () => currentReadiness
    };
    
    log(`PostMessage API initialized at readiness level: ${currentReadiness}`);
    
    // Notify parent that PostMessage API is ready
    window.parent.postMessage({
      type: 'postmessage-ready',
      timestamp: Date.now(),
      readiness: currentReadiness
    }, '*');
    
    // Set up event listeners for readiness changes
    setupReadinessEventListeners();
  }
  
  function setupReadinessEventListeners() {
    const app = PDFViewerApplication;
    if (!app || !app.eventBus) return;
    
    // Listen for document loaded event
    app.eventBus.on('documentloaded', () => {
      log('Document loaded event received');
      setReadiness(ViewerReadiness.DOCUMENT_LOADED);
      
      // Set up bidirectional event listeners once document is loaded
      setupBidirectionalEventListeners();
    });
    
    // Listen for pages loaded event
    app.eventBus.on('pagesloaded', () => {
      log('Pages loaded event received');
      // Ensure we're at least at components ready level
      if (currentReadiness < ViewerReadiness.COMPONENTS_READY) {
        setReadiness(ViewerReadiness.COMPONENTS_READY);
      }
    });
  }
  // #endregion

  // #region Message Handling
  function handleControlMessage(event) {
    const { type, action, payload, id } = event.data;
    
    if (type === 'control-update') {
      try {
        log(`Processing control update: ${action} = ${payload} (readiness: ${currentReadiness})`);
        
        // Universal Dispatcher has already verified readiness - just execute
        updateControl(action, payload);
        sendResponse(id, { success: true, action, payload });
      } catch (error) {
        const errorMsg = `Error processing ${action}: ${error.message}`;
        log(errorMsg, 'error');
        sendResponse(id, { success: false, error: errorMsg });
      }
    }
  }
  // #endregion

  // #region Control Update Functions
  function updateControl(action, payload) {
    const app = PDFViewerApplication;
    
    // Validate that PDFViewerApplication is available
    if (!app) {
      log('PDFViewerApplication not available', 'error');
      return;
    }
    
    try {
      // Ensure density styles exist before applying related actions
      ensureDensityStyles();
      switch (action) {
        // Button visibility controls (using consolidated helper function)
        case 'show-download':
          toggleButtonVisibility('downloadButton', 'secondaryDownload', payload);
          break;
        case 'show-print':
          toggleButtonVisibility('printButton', 'secondaryPrint', payload);
          break;
        case 'show-fullscreen':
          toggleButtonVisibility('presentationModeButton', null, payload);
          break;
        case 'show-find':
          toggleButtonVisibility('viewFind', null, payload);
          break;
        case 'show-bookmark':
          toggleButtonVisibility('viewBookmark', null, payload);
          break;
        case 'show-openfile':
          toggleButtonVisibility('openFile', 'secondaryOpenFile', payload);
          break;
        case 'show-annotations':
          // Handle annotations button visibility
          // This might need to be implemented based on the specific annotation system
          log(`Annotations button visibility set to: ${payload}`);
          break;
        
        // Phase D: Layout & density
        case 'set-toolbar-density': {
          // Apply compact/comfortable density by toggling a class on #toolbarContainer
          const container = document.getElementById('toolbarContainer');
          if (container) {
            container.classList.remove('density-default','density-compact','density-comfortable');
            const density = typeof payload === 'string' ? payload : 'default';
            container.classList.add(`density-${density}`);
            log(`Toolbar density set to: ${density}`);
          }
          break;
        }
        case 'set-sidebar-width': {
          const sidebar = document.getElementById('sidebarContainer');
          if (sidebar && typeof payload === 'string' && payload.trim() !== '') {
            sidebar.style.width = payload;
            // Adjust viewer container to respect new sidebar width via CSS variable if available
            const outer = document.getElementById('outerContainer');
            if (outer) outer.style.setProperty('--sidebar-width', payload);
            log(`Sidebar width set to: ${payload}`);
          }
          break;
        }
        case 'set-toolbar-position': {
          const outer = document.getElementById('outerContainer');
          if (outer) {
            outer.classList.remove('toolbar-bottom');
            if (payload === 'bottom') outer.classList.add('toolbar-bottom');
            log(`Toolbar position set to: ${payload}`);
          }
          break;
        }
        case 'set-sidebar-position': {
          const outer = document.getElementById('outerContainer');
          if (outer) {
            outer.classList.remove('sidebar-right');
            if (payload === 'right') outer.classList.add('sidebar-right');
            log(`Sidebar position set to: ${payload}`);
          }
          break;
        }
        case 'set-responsive-breakpoint': {
          const value = typeof payload === 'number' ? `${payload}px` : `${payload}`;
          const outer = document.getElementById('outerContainer');
          if (outer && value) {
            outer.style.setProperty('--ng2-responsive-breakpoint', value);
            log(`Responsive breakpoint set to: ${value}`);
          }
          break;
        }
        
        // Phase C: Toolbar/Sidebar group visibility
        case 'show-toolbar-left':
          toggleElementVisibilityById('toolbarViewerLeft', payload);
          break;
        case 'show-toolbar-middle':
          toggleElementVisibilityById('toolbarViewerMiddle', payload);
          break;
        case 'show-toolbar-right':
          toggleElementVisibilityById('toolbarViewerRight', payload);
          break;
        case 'show-secondary-toolbar-toggle':
          toggleElementVisibilityById('secondaryToolbarToggle', payload);
          break;
        case 'show-sidebar':
          toggleElementVisibilityById('sidebarContainer', payload);
          break;
        case 'show-sidebar-left':
          toggleElementVisibilityById('toolbarSidebarLeft', payload);
          break;
        case 'show-sidebar-right':
          toggleElementVisibilityById('toolbarSidebarRight', payload);
          break;
        
        // Mode controls
        case 'set-zoom':
          updateZoom(payload);
          break;
        case 'set-cursor':
          updateCursor(payload);
          break;
        case 'set-scroll':
          ControlUtils.updateModeViaEventBus('switchscrollmode', payload, 
            { 'VERTICAL': 0, 'V': 0, 'HORIZONTAL': 1, 'H': 1, 'WRAPPED': 2, 'W': 2, 'PAGE': 3, 'P': 3 }, 
            'scroll mode');
          ControlUtils.updatePropertyDirectly('pdfViewer.scrollMode', 
            ({ 'VERTICAL': 0, 'V': 0, 'HORIZONTAL': 1, 'H': 1, 'WRAPPED': 2, 'W': 2, 'PAGE': 3, 'P': 3 })[payload?.toUpperCase()] || 0, 
            'scroll mode');
          break;
        case 'set-spread':
          ControlUtils.updateModeViaEventBus('switchspreadmode', payload, 
            { 'NONE': 0, 'N': 0, 'ODD': 1, 'O': 1, 'EVEN': 2, 'E': 2 }, 
            'spread mode');
          ControlUtils.updatePropertyDirectly('pdfViewer.spreadMode', 
            ({ 'NONE': 0, 'N': 0, 'ODD': 1, 'O': 1, 'EVEN': 2, 'E': 2 })[payload?.toUpperCase()] || 0, 
            'spread mode');
          break;
        
        // Navigation controls
        case 'set-page':
          // Universal Dispatcher guarantees PDFViewerApplication.initialized at readiness level 5
          const pageNumber = parseInt(payload, 10);
          if (pageNumber > 0 && pageNumber <= PDFViewerApplication.pagesCount) {
            PDFViewerApplication.page = pageNumber;
            log(`Page updated to: ${pageNumber}`);
          } else {
            log(`Invalid page number: ${payload}`, 'warn');
          }
          break;
        case 'set-rotation':
          // Universal Dispatcher guarantees PDFViewerApplication.initialized at readiness level 5
          const rotation = parseInt(payload, 10);
          if ([0, 90, 180, 270].includes(rotation)) {
            PDFViewerApplication.pagesRotation = rotation;
            log(`Rotation updated to: ${rotation}`);
          } else {
            log(`Invalid rotation: ${payload}`, 'warn');
          }
          break;
        case 'go-to-last-page':
          if (payload === true) {
            // Universal Dispatcher guarantees PDFViewerApplication.initialized at readiness level 5
            const lastPage = PDFViewerApplication.pagesCount;
            PDFViewerApplication.page = lastPage;
            log(`Navigated to last page: ${lastPage}`);
          }
          break;
        case 'go-to-named-dest':
          // Validate that payload is not empty or null before processing
          if (!payload || typeof payload !== 'string' || payload.trim() === '') {
            log(`Skipping invalid named destination: "${payload}"`);
            break;
          }
          
          // Universal Dispatcher guarantees PDFViewerApplication.pdfLinkService at readiness level 5
          PDFViewerApplication.pdfLinkService.goToDestination(payload);
          log(`Navigated to named destination: ${payload}`);
          break;
        case 'update-page-mode':
          // Universal Dispatcher guarantees PDFViewerApplication.eventBus at readiness level 4
          const mode = payload ? payload.toLowerCase() : 'none';
          PDFViewerApplication.eventBus.dispatch('pagemode', { mode });
          log(`Page mode updated to: ${mode}`);
          break;
        
        // Auto actions - Universal Dispatcher guarantees eventBus availability at readiness level 5
        case 'trigger-download':
          if (payload === true) {
            PDFViewerApplication.eventBus.dispatch('download');
            log('Download triggered');
          }
          break;
        case 'trigger-print':
          if (payload === true) {
            PDFViewerApplication.eventBus.dispatch('print');
            log('Print triggered');
          }
          break;
        case 'trigger-rotate-cw':
          if (payload === true) {
            PDFViewerApplication.eventBus.dispatch('rotatecw');
            log('Rotated clockwise');
          }
          break;
        case 'trigger-rotate-ccw':
          if (payload === true) {
            PDFViewerApplication.eventBus.dispatch('rotateccw');
            log('Rotated counter-clockwise');
          }
          break;
        
        // Error handling
        case 'set-error-message':
          setErrorMessage(payload);
          break;
        case 'set-error-override':
          setErrorOverride(payload);
          break;
        case 'set-error-append':
          setErrorAppend(payload);
          break;
        
        // Locale and CSS zoom
        case 'set-locale':
          setLocale(payload);
          break;
        case 'set-css-zoom':
          setCssZoom(payload);
          break;
        
        // Event enablement
        case 'enable-before-print':
          enableBeforePrint(payload);
          break;
        case 'enable-after-print':
          enableAfterPrint(payload);
          break;
        case 'enable-pages-loaded':
          enablePagesLoaded(payload);
          break;
        case 'enable-page-change':
          enablePageChange(payload);
          break;
        
        // New high-value event enablement
        case 'enable-document-error':
          enableDocumentError(payload);
          break;
        case 'enable-document-init':
          enableDocumentInit(payload);
          break;
        case 'enable-pages-init':
          enablePagesInit(payload);
          break;
        case 'enable-presentation-mode-changed':
          enablePresentationModeChanged(payload);
          break;
        case 'enable-open-file':
          enableOpenFile(payload);
          break;
        case 'enable-find':
          enableFind(payload);
          break;
        case 'enable-update-find-matches-count':
          enableUpdateFindMatchesCount(payload);
          break;
        case 'enable-metadata-loaded':
          enableMetadataLoaded(payload);
          break;
        case 'enable-outline-loaded':
          enableOutlineLoaded(payload);
          break;
        case 'enable-page-rendered':
          enablePageRendered(payload);
          break;
        
        // New high-value events (Phase 2)
        case 'enable-annotation-layer-rendered':
          enableAnnotationLayerRendered(payload);
          break;
        case 'enable-bookmark-click':
          enableBookmarkClick(payload);
          break;
        case 'enable-idle':
          enableIdle(payload);
          break;
        
        // Theme & Visual Customization Actions (Phase 1)
        case 'set-theme':
          log(`Processing theme action: ${action} with payload: ${payload}`, 'info');
          setTheme(payload);
          break;
        case 'set-primary-color':
          setPrimaryColor(payload);
          break;
        case 'set-background-color':
          setBackgroundColor(payload);
          break;
        case 'set-page-background-color':
          setPageBackgroundColor(payload);
          break;
        case 'set-toolbar-color':
          setToolbarColor(payload);
          break;
        case 'set-text-color':
          setTextColor(payload);
          break;
        case 'set-border-radius':
          setBorderRadius(payload);
          break;
        case 'set-custom-css':
          setCustomCSS(payload);
          break;
        
        default:
          log(`Unknown action: ${action}`, 'warn');
      }
    } catch (error) {
      log(`Error in updateControl for action ${action}: ${error.message}`, 'error');
      throw error;
    }
  }
  // #endregion

  // #region Button Visibility Functions
  function updateDownloadButton(visible) {
    const button = document.getElementById('downloadButton');
    const secondaryButton = document.getElementById('secondaryDownload');
    if (button) {
      button.classList.toggle('hidden', !visible);
    }
    if (secondaryButton) {
      secondaryButton.classList.toggle('hidden', !visible);
      }
    log(`Download button visibility set to: ${visible}`);
  }

  function updatePrintButton(visible) {
    const button = document.getElementById('printButton');
    const secondaryButton = document.getElementById('secondaryPrint');
    if (button) {
      button.classList.toggle('hidden', !visible);
    }
    if (secondaryButton) {
      secondaryButton.classList.toggle('hidden', !visible);
      }
    log(`Print button visibility set to: ${visible}`);
  }

  function updateFullScreenButton(visible) {
    const button = document.getElementById('presentationModeButton');
    if (button) {
      button.classList.toggle('hidden', !visible);
      }
    log(`FullScreen button visibility set to: ${visible}`);
  }

  function updateFindButton(visible) {
    const button = document.getElementById('viewFind');
    if (button) {
      button.classList.toggle('hidden', !visible);
      }
    log(`Find button visibility set to: ${visible}`);
  }

  function updateBookmarkButton(visible) {
    const button = document.getElementById('viewBookmark');
    if (button) {
      button.classList.toggle('hidden', !visible);
      }
    log(`Bookmark button visibility set to: ${visible}`);
  }

  function updateOpenFileButton(visible) {
    const button = document.getElementById('openFile');
    const secondaryButton = document.getElementById('secondaryOpenFile');
    if (button) {
      button.classList.toggle('hidden', !visible);
    }
    if (secondaryButton) {
      secondaryButton.classList.toggle('hidden', !visible);
      }
    log(`OpenFile button visibility set to: ${visible}`);
  }

  function updateAnnotationsButton(visible) {
    // Handle annotations button visibility
    // This might need to be implemented based on the specific annotation system
    log(`Annotations button visibility set to: ${visible}`);
  }
  // #endregion

  // #region Mode Control Functions
  function updateZoom(zoom) {
    const app = PDFViewerApplication;
    if (!app || !app.pdfViewer || !app.eventBus) {
      log('PDFViewerApplication, pdfViewer, or eventBus not ready for zoom update', 'warn');
      return;
    }

    // Mark zoom command as active to prevent infinite loop
    ZoomCommandTracker.markZoomCommandStart();
    
    try {
      // Acceptable values: "auto", "page-fit", "page-width", "page-actual", "page-height", or a number/string number like "1.25"
      const validStringZooms = ['auto', 'page-actual', 'page-fit', 'page-width', 'page-height'];
      
      // Check if it's a valid string zoom
      if (validStringZooms.includes(zoom)) {
        // Dispatch the scalechanged event exactly like the UI does
        app.eventBus.dispatch("scalechanged", {
          source: app.toolbar,  // Use toolbar as source, just like the UI does
          value: zoom
        });
        log(`Zoom set via scalechanged event: ${zoom}`);
        return;
      }
      
      // Check if it's a valid numeric zoom (including decimal strings like "1.25")
      const numericZoom = Number(zoom);
      if (!isNaN(numericZoom) && numericZoom > 0) {
        // Dispatch the scalechanged event exactly like the UI does
        app.eventBus.dispatch("scalechanged", {
          source: app.toolbar,  // Use toolbar as source, just like the UI does
          value: zoom
        });
        log(`Zoom set via scalechanged event: ${zoom}`);
        return;
      }
      
      // If we get here, it's invalid
      log(`Invalid zoom value: ${zoom}`, 'warn');
    } finally {
      // Always clear the command flag, even if there's an error
      ZoomCommandTracker.markZoomCommandEnd();
    }
  }

  function updateCursor(cursor) {
    // Universal Dispatcher guarantees PDFViewerApplication availability at readiness level 4
    const app = PDFViewerApplication;
    
    try {
      const cursorTool = cursor ? cursor.toUpperCase() : 'SELECT';
      log(`Attempting to update cursor to: ${cursorTool} (readiness: ${currentReadiness})`);
      
      let toolId = 0; // Default to SELECT
      switch (cursorTool) {
        case 'HAND':
        case 'H':
          toolId = 1; // HAND
            break;
        case 'SELECT':
        case 'S':
          toolId = 0; // SELECT
            break;
        case 'ZOOM':
        case 'Z':
          toolId = 2; // ZOOM  
            break;
          default:
          log(`Unknown cursor tool: ${cursorTool}, defaulting to SELECT`, 'warn');
          toolId = 0;
      }
      
      // Update cursor using event bus dispatch (PDF.js v4.x)
      if (app.eventBus && typeof app.eventBus.dispatch === 'function') {
        log(`Dispatching switchcursortool with toolId: ${toolId}`);
          app.eventBus.dispatch('switchcursortool', {
            tool: toolId
          });
        log(`Cursor tool updated to: ${cursorTool} (toolId: ${toolId})`);
      } else {
        log('EventBus not available for cursor update', 'warn');
      }
    } catch (error) {
      log(`Error updating cursor: ${error.message}`, 'error');
    }
  }

  function updateScroll(scroll) {
    // Universal Dispatcher guarantees PDFViewerApplication availability at readiness level 4
    
    try {
      const scrollMode = scroll ? scroll.toUpperCase() : 'VERTICAL';
      log(`Attempting to update scroll mode to: ${scrollMode}`);
      
      if (PDFViewerApplication.eventBus) {
        // Use PDF.js v4.x event bus dispatch for scroll mode switching
        switch (scrollMode) {
          case 'VERTICAL':
          case 'V':
            log('Dispatching switchscrollmode with VERTICAL mode');
            PDFViewerApplication.eventBus.dispatch('switchscrollmode', {
              mode: 0 // ScrollMode.VERTICAL
            });
            break;
          case 'HORIZONTAL':
          case 'H':
            log('Dispatching switchscrollmode with HORIZONTAL mode');
            PDFViewerApplication.eventBus.dispatch('switchscrollmode', {
              mode: 1 // ScrollMode.HORIZONTAL
            });
            break;
          case 'WRAPPED':
          case 'W':
            log('Dispatching switchscrollmode with WRAPPED mode');
            PDFViewerApplication.eventBus.dispatch('switchscrollmode', {
              mode: 2 // ScrollMode.WRAPPED
            });
            break;
          case 'PAGE':
          case 'P':
            log('Dispatching switchscrollmode with PAGE mode');
            PDFViewerApplication.eventBus.dispatch('switchscrollmode', {
              mode: 3 // ScrollMode.PAGE
            });
            break;
          default:
            log(`Unknown scroll mode: ${scrollMode}, defaulting to VERTICAL`, 'warn');
            PDFViewerApplication.eventBus.dispatch('switchscrollmode', {
              mode: 0
            });
        }
      } else {
        // Fallback to direct property setting if event bus not available
      if (PDFViewerApplication.pdfViewer) {
          switch (scrollMode) {
            case 'VERTICAL':
            case 'V':
              PDFViewerApplication.pdfViewer.scrollMode = 0;
              break;
            case 'HORIZONTAL':
            case 'H':
              PDFViewerApplication.pdfViewer.scrollMode = 1;
              break;
            case 'WRAPPED':
            case 'W':
              PDFViewerApplication.pdfViewer.scrollMode = 2;
              break;
            case 'PAGE':
            case 'P':
              PDFViewerApplication.pdfViewer.scrollMode = 3;
              break;
          }
        }
      }
      
      log(`Scroll mode update completed for: ${scrollMode}`);
    } catch (error) {
      log(`Error updating scroll mode: ${error.message}`, 'error');
    }
  }

  function updateSpread(spread) {
    // Universal Dispatcher guarantees PDFViewerApplication availability at readiness level 4
    
    try {
      const spreadMode = spread ? spread.toUpperCase() : 'NONE';
      log(`Attempting to update spread mode to: ${spreadMode}`);
      
      if (PDFViewerApplication.eventBus) {
        // Use PDF.js v4.x event bus dispatch for spread mode switching
        switch (spreadMode) {
          case 'NONE':
          case 'N':
            log('Dispatching switchspreadmode with NONE mode');
            PDFViewerApplication.eventBus.dispatch('switchspreadmode', {
              mode: 0 // SpreadMode.NONE
            });
            break;
          case 'ODD':
          case 'O':
            log('Dispatching switchspreadmode with ODD mode');
            PDFViewerApplication.eventBus.dispatch('switchspreadmode', {
              mode: 1 // SpreadMode.ODD
            });
            break;
          case 'EVEN':
          case 'E':
            log('Dispatching switchspreadmode with EVEN mode');
            PDFViewerApplication.eventBus.dispatch('switchspreadmode', {
              mode: 2 // SpreadMode.EVEN
            });
            break;
          default:
            log(`Unknown spread mode: ${spreadMode}, defaulting to NONE`, 'warn');
            PDFViewerApplication.eventBus.dispatch('switchspreadmode', {
              mode: 0
            });
        }
      } else {
        // Fallback to direct property setting if event bus not available
      if (PDFViewerApplication.pdfViewer) {
          switch (spreadMode) {
            case 'NONE':
            case 'N':
              PDFViewerApplication.pdfViewer.spreadMode = 0;
              break;
            case 'ODD':
            case 'O':
              PDFViewerApplication.pdfViewer.spreadMode = 1;
              break;
            case 'EVEN':
            case 'E':
              PDFViewerApplication.pdfViewer.spreadMode = 2;
              break;
          }
        }
      }
      
      log(`Spread mode update completed for: ${spreadMode}`);
    } catch (error) {
      log(`Error updating spread mode: ${error.message}`, 'error');
    }
  }
  // #endregion

  // Note: Legacy navigation and auto-action functions removed.
  // All functionality now handled through the main updateControl switch statement
  // which trusts the Universal Dispatcher's readiness guarantees.

  // #region Error Handling Functions
  function setErrorMessage(message) {
    if (typeof message === 'string' && message.trim()) {
      // Store error message for later use
      window.ng2PdfJsViewerErrorMessage = message;
      log(`Error message set to: ${message}`);
    }
  }

  function setErrorOverride(override) {
    window.ng2PdfJsViewerErrorOverride = override === true;
    log(`Error override set to: ${override}`);
  }

  function setErrorAppend(append) {
    window.ng2PdfJsViewerErrorAppend = append === true;
    log(`Error append set to: ${append}`);
  }
  // #endregion

  // #region Locale and CSS Zoom Functions
  function setLocale(locale) {
    if (typeof locale === 'string' && locale.trim()) {
      try {
        log(`Attempting to set locale to: ${locale}`);
        
        // Use PDF.js v4.x AppOptions API to set locale
        if (typeof AppOptions !== 'undefined') {
          AppOptions.set('localeProperties', {
            lang: locale
          });
          log(`Locale set via AppOptions to: ${locale}`);
          
          // Try to reinitialize the l10n system if available
          if (PDFViewerApplication && PDFViewerApplication.l10n) {
            try {
              // Recreate the l10n instance with new locale
              PDFViewerApplication.l10n._setL10n(null);
              PDFViewerApplication.l10n = new (PDFViewerApplication.l10n.constructor)(locale);
              log(`L10n system reinitialized with locale: ${locale}`);
            } catch (l10nError) {
              log(`L10n reinitialization failed: ${l10nError.message}`, 'warn');
            }
          }
          
          // Also try to update the UI language if available
          if (PDFViewerApplication.eventBus) {
            try {
              PDFViewerApplication.eventBus.dispatch('localechanged', {
                locale: locale
              });
              log(`Locale change event dispatched: ${locale}`);
            } catch (eventError) {
              log(`Locale event dispatch failed: ${eventError.message}`, 'warn');
            }
          }
        } else {
          // Fallback: store for later use when viewer is ready
          window.ng2PdfJsViewerLocale = locale;
          log(`Locale stored for later use: ${locale}`);
        }
        
        // Also try to update the document title and other UI elements
        try {
          document.documentElement.lang = locale;
          log(`Document language attribute set to: ${locale}`);
        } catch (uiError) {
          log(`UI locale update failed: ${uiError.message}`, 'warn');
        }
        
      } catch (error) {
        log(`Error setting locale: ${error.message}`, 'error');
    }
    } else {
      log(`Invalid locale value: ${locale}`, 'warn');
    }
  }

  function setCssZoom(useCssZoom) {
    try {
      if (PDFViewerApplication && PDFViewerApplication.pdfViewer) {
        // Set CSS zoom mode
        PDFViewerApplication.pdfViewer.useOnlyCssZoom = useCssZoom === true;
        log(`CSS zoom set to: ${useCssZoom}`);
      } else {
        // Store for later use when viewer is ready
        window.ng2PdfJsViewerUseCssZoom = useCssZoom === true;
        log(`CSS zoom stored for later use: ${useCssZoom}`);
      }
    } catch (error) {
      log(`Error setting CSS zoom: ${error.message}`, 'error');
    }
  }
  // #endregion

  // #region Event Configuration Functions
  function enableBeforePrint(enable) {
    window.ng2PdfJsViewerEnableBeforePrint = enable === true;
    log(`Before print event enabled: ${enable}`);
  }

  function enableAfterPrint(enable) {
    window.ng2PdfJsViewerEnableAfterPrint = enable === true;
    log(`After print event enabled: ${enable}`);
  }

  function enablePagesLoaded(enable) {
    window.ng2PdfJsViewerEnablePagesLoaded = enable === true;
    log(`Pages loaded event enabled: ${enable}`);
  }

  function enablePageChange(enable) {
    window.ng2PdfJsViewerEnablePageChange = enable === true;
    log(`Page change event enabled: ${enable}`);
  }

  // New high-value event enable functions
  function enableDocumentError(enable) {
    window.ng2PdfJsViewerEnableDocumentError = enable === true;
    log(`Document error event enabled: ${enable}`);
  }

  function enableDocumentInit(enable) {
    window.ng2PdfJsViewerEnableDocumentInit = enable === true;
    log(`Document init event enabled: ${enable}`);
  }

  function enablePagesInit(enable) {
    window.ng2PdfJsViewerEnablePagesInit = enable === true;
    log(`Pages init event enabled: ${enable}`);
  }

  function enablePresentationModeChanged(enable) {
    window.ng2PdfJsViewerEnablePresentationModeChanged = enable === true;
    log(`Presentation mode changed event enabled: ${enable}`);
  }

  function enableOpenFile(enable) {
    window.ng2PdfJsViewerEnableOpenFile = enable === true;
    log(`Open file event enabled: ${enable}`);
  }

  function enableFind(enable) {
    window.ng2PdfJsViewerEnableFind = enable === true;
    log(`Find event enabled: ${enable}`);
  }

  function enableUpdateFindMatchesCount(enable) {
    window.ng2PdfJsViewerEnableUpdateFindMatchesCount = enable === true;
    log(`Update find matches count event enabled: ${enable}`);
  }

  function enableMetadataLoaded(enable) {
    window.ng2PdfJsViewerEnableMetadataLoaded = enable === true;
    log(`Metadata loaded event enabled: ${enable}`);
  }

  function enableOutlineLoaded(enable) {
    window.ng2PdfJsViewerEnableOutlineLoaded = enable === true;
    log(`Outline loaded event enabled: ${enable}`);
  }

  function enablePageRendered(enable) {
    window.ng2PdfJsViewerEnablePageRendered = enable === true;
    log(`Page rendered event enabled: ${enable}`);
  }

  // New high-value events (Phase 2)
  function enableAnnotationLayerRendered(enable) {
    window.ng2PdfJsViewerEnableAnnotationLayerRendered = enable === true;
    log(`Annotation layer rendered event enabled: ${enable}`);
  }

  function enableBookmarkClick(enable) {
    window.ng2PdfJsViewerEnableBookmarkClick = enable === true;
    log(`Bookmark click event enabled: ${enable}`);
  }

  function enableIdle(enable) {
    window.ng2PdfJsViewerEnableIdle = enable === true;
    log(`Idle event enabled: ${enable}`);
  }
  // #endregion

  // #region Theme & Visual Customization Functions (Phase 1)
  
  // Theme management variables
  let currentTheme = 'light';
  let appliedStyles = new Set();
  
  function setTheme(theme) {
    log(`🎨 THEME: setTheme called with: ${theme}`, 'warn');
    currentTheme = theme || 'light';
    log(`Theme set to: ${currentTheme}`, 'info');
    
          // Apply theme-specific CSS classes and variables
      const body = document.body;
      if (body) {
        // Remove ALL theme classes including active states
        body.classList.remove('ng2-theme-light', 'ng2-theme-dark', 'ng2-theme-auto', 
                             'ng2-theme-dark-active', 'ng2-theme-light-active');
        
        // Add new theme class
        body.classList.add(`ng2-theme-${currentTheme}`);
        log(`Applied theme class: ng2-theme-${currentTheme}`, 'info');
        
        // Apply auto theme detection
        if (currentTheme === 'auto') {
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const activeClass = prefersDark ? 'ng2-theme-dark-active' : 'ng2-theme-light-active';
          body.classList.add(activeClass);
          log(`Auto theme detected: ${activeClass}`, 'info');
          
          // Listen for theme changes
          if (!window.ng2ThemeMediaListener) {
            window.ng2ThemeMediaListener = window.matchMedia('(prefers-color-scheme: dark)');
            window.ng2ThemeMediaListener.addListener((e) => {
              if (currentTheme === 'auto') {
                body.classList.remove('ng2-theme-dark-active', 'ng2-theme-light-active');
                const newActiveClass = e.matches ? 'ng2-theme-dark-active' : 'ng2-theme-light-active';
                body.classList.add(newActiveClass);
                log(`Auto theme changed: ${newActiveClass}`, 'info');
              }
            });
          }
        }
        
        // Force style recalculation
        body.offsetHeight; // Trigger reflow
      }
    
    // Apply base theme styles
    applyBaseThemeStyles();
  }
  
  function setPrimaryColor(color) {
    log(`Primary color set to: ${color}`);
    setCSSVariable('--ng2-primary-color', color);
  }
  
  function setBackgroundColor(color) {
    log(`Background color set to: ${color}`);
    setCSSVariable('--ng2-background-color', color);
  }
  
  function setPageBackgroundColor(color) {
    log(`Page background color set to: ${color}`);
    setCSSVariable('--ng2-page-background-color', color);
  }
  
  function setToolbarColor(color) {
    log(`Toolbar color set to: ${color}`);
    setCSSVariable('--ng2-toolbar-color', color);
  }
  
  function setTextColor(color) {
    log(`Text color set to: ${color}`);
    setCSSVariable('--ng2-text-color', color);
  }
  
  function setBorderRadius(radius) {
    log(`Border radius set to: ${radius}`);
    setCSSVariable('--ng2-border-radius', radius);
  }
  
  function setCustomCSS(css) {
    log(`Custom CSS applied: ${css ? css.substring(0, 100) + '...' : 'none'}`);
    
    // Remove existing custom CSS
    const existingStyle = document.getElementById('ng2-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Apply new custom CSS
    if (css) {
      const style = document.createElement('style');
      style.id = 'ng2-custom-css';
      style.textContent = css;
      document.head.appendChild(style);
    }
  }
  
  // Helper function to set CSS custom properties
  function setCSSVariable(property, value) {
    log(`Setting CSS variable: ${property} = ${value}`, 'info');
    if (value) {
      document.documentElement.style.setProperty(property, value);
      // Also set on body for better compatibility
      document.body.style.setProperty(property, value);
    } else {
      document.documentElement.style.removeProperty(property);
      document.body.style.removeProperty(property);
    }
  }
  
  // Apply base theme styles
  function applyBaseThemeStyles() {
    log('🎨 THEME: applyBaseThemeStyles called', 'warn');
    const styleId = 'ng2-base-theme-styles';
    
    // Remove existing base styles
    const existingStyle = document.getElementById(styleId);
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Create base theme styles
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      /* Base theme styles */
      .ng2-theme-light {
        --ng2-default-bg: #ffffff;
        --ng2-default-text: #000000;
        --ng2-default-toolbar: #f9f9f9;
        --ng2-default-border: #cccccc;
      }
      
      .ng2-theme-dark,
      .ng2-theme-dark-active {
        --ng2-default-bg: #1e1e1e;
        --ng2-default-text: #ffffff;
        --ng2-default-toolbar: #333333;
        --ng2-default-border: #555555;
      }
      
      .ng2-theme-light-active {
        --ng2-default-bg: #ffffff;
        --ng2-default-text: #000000;
        --ng2-default-toolbar: #f9f9f9;
        --ng2-default-border: #cccccc;
      }
      
      /* Apply theme variables to PDF.js viewer */
      #viewerContainer {
        background-color: var(--ng2-background-color, var(--ng2-default-bg)) !important;
        color: var(--ng2-text-color, var(--ng2-default-text)) !important;
      }
      
      #outerContainer {
        background-color: var(--ng2-background-color, var(--ng2-default-bg)) !important;
      }
      
      #mainContainer {
        background-color: var(--ng2-background-color, var(--ng2-default-bg)) !important;
      }
      
      /* Toolbar styling */
      #toolbarContainer, .toolbar, .findbar, .secondaryToolbar {
        background-color: var(--ng2-toolbar-color, var(--ng2-default-toolbar)) !important;
        color: var(--ng2-text-color, var(--ng2-default-text)) !important;
        border-color: var(--ng2-default-border) !important;
      }
      
      /* PDF page styling */
      .page, .pdfViewer .page {
        background-color: var(--ng2-page-background-color, #ffffff) !important;
        border-radius: var(--ng2-border-radius, 0) !important;
        box-shadow: 0 0 0 1px var(--ng2-default-border) !important;
      }
      
      /* Canvas within pages */
      .page canvas {
        border-radius: var(--ng2-border-radius, 0) !important;
      }
      
      /* Text layer styling */
      .textLayer {
        color: var(--ng2-text-color, var(--ng2-default-text)) !important;
      }
      
      /* All toolbar buttons */
      .toolbarButton, .secondaryToolbarButton, .dropdownToolbarButton > select,
      .toolbarButton::before, .secondaryToolbarButton::before {
        color: var(--ng2-text-color, var(--ng2-default-text)) !important;
        border-radius: var(--ng2-border-radius, 3px) !important;
      }
      
      /* Hover state with primary color */
      .toolbarButton:hover, .secondaryToolbarButton:hover,
      .toolbarButton:focus, .secondaryToolbarButton:focus {
        background-color: var(--ng2-primary-color, rgba(0, 0, 0, 0.1)) !important;
        color: #ffffff !important;
      }
      
      /* Active/checked state */
      .toolbarButton.toggled, .secondaryToolbarButton.toggled {
        background-color: var(--ng2-primary-color, rgba(0, 0, 0, 0.2)) !important;
        color: #ffffff !important;
      }
      
      /* Split and dropdown buttons */
      .splitToolbarButton, .splitToolbarButtonSeparator {
        border-radius: var(--ng2-border-radius, 3px) !important;
      }
      
      .dropdownToolbarButton {
        border-radius: var(--ng2-border-radius, 3px) !important;
        background-color: var(--ng2-toolbar-color, var(--ng2-default-toolbar)) !important;
        color: var(--ng2-text-color, var(--ng2-default-text)) !important;
      }
      
      /* Sidebar styling */
      #sidebarContainer, #sidebarContent {
        background-color: var(--ng2-toolbar-color, var(--ng2-default-toolbar)) !important;
        color: var(--ng2-text-color, var(--ng2-default-text)) !important;
      }
      
      /* Input fields */
      .toolbarField {
        background-color: var(--ng2-background-color, #ffffff) !important;
        color: var(--ng2-text-color, #000000) !important;
        border-color: var(--ng2-default-border) !important;
        border-radius: var(--ng2-border-radius, 3px) !important;
      }
      
      /* Dark theme specific overrides */
      .ng2-theme-dark #viewer, .ng2-theme-dark-active #viewer {
        background-color: var(--ng2-background-color, #1e1e1e) !important;
      }
      
      .ng2-theme-dark .page, .ng2-theme-dark-active .page {
        filter: invert(1) hue-rotate(180deg);
      }
      
      .ng2-theme-dark .page canvas, .ng2-theme-dark-active .page canvas {
        filter: invert(1) hue-rotate(180deg);
      }
      
      /* Force override PDF.js default styles */
      body {
        --toolbar-bg-color: var(--ng2-toolbar-color, var(--ng2-default-toolbar)) !important;
        --body-bg-color: var(--ng2-background-color, var(--ng2-default-bg)) !important;
        --page-bg-color: var(--ng2-page-background-color, #ffffff) !important;
        --main-color: var(--ng2-text-color, var(--ng2-default-text)) !important;
        --field-bg-color: var(--ng2-background-color, #ffffff) !important;
        --field-color: var(--ng2-text-color, #000000) !important;
        --button-hover-color: var(--ng2-primary-color, rgba(0, 0, 0, 0.1)) !important;
      }
      
      /* Additional specificity for stubborn elements */
      body #outerContainer #mainContainer #viewerContainer {
        background-color: var(--ng2-background-color, var(--ng2-default-bg)) !important;
      }
      
      body #toolbarViewer #toolbarContainer {
        background-color: var(--ng2-toolbar-color, var(--ng2-default-toolbar)) !important;
      }
      
      body .pdfViewer .page {
        background-color: var(--ng2-page-background-color, #ffffff) !important;
        border-radius: var(--ng2-border-radius, 0) !important;
      }
    `;
    
    document.head.appendChild(style);
    
    // Debug: Check if styles are actually applied (event-driven approach)
    const debugThemeApplication = () => {
      const testElement = document.querySelector('.page');
      if (testElement) {
        const computedStyle = window.getComputedStyle(testElement);
        log(`🎨 DEBUG: Page background-color: ${computedStyle.backgroundColor}`, 'warn');
        log(`🎨 DEBUG: Page border-radius: ${computedStyle.borderRadius}`, 'warn');
      }
      
      const toolbar = document.querySelector('#toolbarContainer');
      if (toolbar) {
        const computedStyle = window.getComputedStyle(toolbar);
        log(`🎨 DEBUG: Toolbar background-color: ${computedStyle.backgroundColor}`, 'warn');
      }
      
      // Check CSS variables on root
      const rootStyle = window.getComputedStyle(document.documentElement);
      log(`🎨 DEBUG: CSS Var --ng2-primary-color: ${rootStyle.getPropertyValue('--ng2-primary-color')}`, 'warn');
      log(`🎨 DEBUG: CSS Var --ng2-background-color: ${rootStyle.getPropertyValue('--ng2-background-color')}`, 'warn');
      log(`🎨 DEBUG: CSS Var --ng2-border-radius: ${rootStyle.getPropertyValue('--ng2-border-radius')}`, 'warn');
    };
    
    // Execute immediately
    debugThemeApplication();
  }
  
  // #endregion

  // #region Bidirectional Event Listeners
  let bidirectionalListenersSetup = false; // Flag to prevent multiple setups
  
  function setupBidirectionalEventListeners() {
    // Prevent multiple setups
    if (bidirectionalListenersSetup) {
      log('Bidirectional event listeners already set up, skipping');
      return;
    }
    
    bidirectionalListenersSetup = true;
    const app = PDFViewerApplication;
    if (!app || !app.eventBus) {
      log('Cannot setup bidirectional listeners: EventBus not available', 'warn');
      return;
    }

    log('Setting up bidirectional event listeners for state synchronization');
    
    // Test sending a state change notification immediately
    log('Testing state change notification system...');
    sendStateChangeNotification('test', 'initial-setup', 'system');

    // Cursor tool changes are handled via switchcursortool event listener only

    // Note: Scroll and spread mode changes are handled via event listeners
    // No method interception needed for PDF.js v5.3.93
    if (app.pdfViewer) {
      log('pdfViewer available - scroll/spread mode changes handled via events');
      
      // Monitor scroll mode changes - setScrollMode doesn't exist in v5.3.93
      // The scroll mode changes are handled via event listeners instead
      log('pdfViewer scroll mode changes handled via switchscrollmode event');

      // Spread mode changes are handled via switchspreadmode event listener only

      // Monitor zoom changes via currentScale property
      let lastKnownScale = app.pdfViewer.currentScale;
      const originalSetCurrentScale = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(app.pdfViewer), 'currentScale');
      if (originalSetCurrentScale && originalSetCurrentScale.set) {
        log('pdfViewer.currentScale setter found, setting up interception');
        Object.defineProperty(app.pdfViewer, 'currentScale', {
          get: originalSetCurrentScale.get,
          set: function(scale) {
            const result = originalSetCurrentScale.set.call(this, scale);
            
            if (scale !== lastKnownScale) {
              lastKnownScale = scale;
              
              // Use enhanced zoom transformation
              const zoomValue = transformZoomFromViewer(scale, app);
              
              log(`Zoom changed via currentScale to: ${zoomValue} (scale: ${scale}, currentScaleValue: ${app.pdfViewer.currentScaleValue})`);
              sendStateChangeNotification('zoom', zoomValue, 'user');
            }
            
            return result;
          },
          configurable: true,
          enumerable: true
        });
      } else {
        log('pdfViewer.currentScale setter not found', 'warn');
      }
    } else {
      log('pdfViewer not available', 'warn');
    }

    // Listen for sidebar/page mode changes
    if (app.pdfSidebar) {
      log('Setting up pdfSidebar method interception...');
      
      // Monitor sidebar view changes
      const originalSetView = app.pdfSidebar.setView;
      if (originalSetView) {
        log('pdfSidebar.setView method found, setting up interception');
        app.pdfSidebar.setView = function(view) {
          const result = originalSetView.apply(this, arguments);
          
          // Map PDF.js sidebar view numbers to our page mode names
          const pageModeMap = {
            0: 'none',        // SidebarView.NONE
            1: 'thumbs',      // SidebarView.THUMBS
            2: 'bookmarks',   // SidebarView.OUTLINE
            3: 'attachments', // SidebarView.ATTACHMENTS
            4: 'layers'       // SidebarView.LAYERS
          };
          
          const pageModeName = pageModeMap[view] || 'none';
          log(`Page mode changed to: ${pageModeName} (view: ${view})`);
          sendStateChangeNotification('pageMode', pageModeName, 'user');
          
          return result;
        };
      } else {
        log('pdfSidebar.setView method not available in PDF.js v5.3.93 - using event-based approach', 'info');
      }
    } else {
      log('pdfSidebar not available', 'warn');
    }

    // Listen for additional PDF.js events that might indicate property changes
    if (app.eventBus) {
      log('Setting up additional event listeners...');
      
      // Listen for scale changing events with intelligent user vs programmatic detection
      app.eventBus.on('scalechanging', (event) => {
        log(`Scale changing event received: scale=${event.scale}, presetValue=${event.presetValue}, commandActive=${ZoomCommandTracker.isZoomCommandActive()}`);
        
        // Skip notification if this is from our own zoom command
        if (ZoomCommandTracker.isZoomCommandActive()) {
          log('Skipping zoom notification - programmatic change from our command');
          return;
        }
        
        // Use event context to determine if this is a user-initiated change
        let isUserInitiated = false;
        let zoomValue;
        
        if (event.presetValue && typeof event.presetValue === 'string') {
          // User clicked zoom buttons (Page Fit, Page Width, Auto, etc.)
          log('User clicked zoom button');
          isUserInitiated = true;
          zoomValue = event.presetValue;
        } else if (typeof event.scale === 'number' && !event.presetValue) {
          // Could be mouse wheel (user) or other programmatic change
          // For now, assume it's user-initiated (mouse wheel, etc.)
          // Future enhancement: could add more sophisticated detection
          log('Assuming user-initiated scale change (mouse wheel, etc.)');
          isUserInitiated = true;
          zoomValue = transformZoomFromViewer(event.scale, app);
        }
        
        if (isUserInitiated) {
          log(`Zoom changed via user interaction to: ${zoomValue}`);
          sendStateChangeNotification('zoom', zoomValue, 'user');
        } else {
          log('Skipping zoom notification - not identified as user-initiated');
        }
      });

      // Listen for other relevant events
      app.eventBus.on('switchscrollmode', (event) => {
        log(`Switch scroll mode event received: ${event.mode}`);
        
        const scrollMap = {
          0: 'vertical',   // ScrollMode.VERTICAL
          1: 'horizontal', // ScrollMode.HORIZONTAL
          2: 'wrapped',    // ScrollMode.WRAPPED
          3: 'page'        // ScrollMode.PAGE
        };
        
        const scrollName = scrollMap[event.mode] || 'vertical';
        log(`Scroll mode changed via event to: ${scrollName}`);
        sendStateChangeNotification('scroll', scrollName, 'user');
      });

      app.eventBus.on('switchspreadmode', (event) => {
        log(`Switch spread mode event received: ${event.mode}`);
        
        const spreadMap = {
          0: 'none', // SpreadMode.NONE
          1: 'odd',  // SpreadMode.ODD
          2: 'even'  // SpreadMode.EVEN
        };
        
        const spreadName = spreadMap[event.mode] || 'none';
        log(`Spread mode changed via event to: ${spreadName}`);
        sendStateChangeNotification('spread', spreadName, 'user');
      });

      app.eventBus.on('switchcursortool', (event) => {
        log(`Switch cursor tool event received: ${event.tool}`);
        
        const cursorMap = {
          0: 'select', // CursorTool.SELECT
          1: 'hand',   // CursorTool.HAND
          2: 'zoom'    // CursorTool.ZOOM
        };
        
        const cursorName = cursorMap[event.tool] || 'select';
        log(`Cursor changed via event to: ${cursorName}`);
        sendStateChangeNotification('cursor', cursorName, 'user');
      });

      app.eventBus.on('sidebarviewchanged', (event) => {
        log(`Sidebar view changed event received: ${event.view}`);
        
        const pageModeMap = {
          0: 'none',        // SidebarView.NONE
          1: 'thumbs',      // SidebarView.THUMBS
          2: 'bookmarks',   // SidebarView.OUTLINE
          3: 'attachments', // SidebarView.ATTACHMENTS
          4: 'layers'       // SidebarView.LAYERS
        };
        
        const pageModeName = pageModeMap[event.view] || 'none';
        log(`Page mode changed via event to: ${pageModeName}`);
        sendStateChangeNotification('pageMode', pageModeName, 'user');
      });

      // Listen for rotation changes (when user rotates via UI or programmatically)
      app.eventBus.on('rotationchanging', (event) => {
        log(`Rotation changing event received: ${event.pagesRotation}`);
        log(`Rotation changed via event to: ${event.pagesRotation}`);
        sendStateChangeNotification('rotation', event.pagesRotation, 'user');
      });

      // New high-value event listeners
      app.eventBus.on('documenterror', (event) => {
        if (window.ng2PdfJsViewerEnableDocumentError) {
          log(`Document error event received: ${event.message}`);
          const errorData = {
            message: event.message || 'Unknown document error',
            source: event.source,
            name: event.name
          };
          sendEventNotification('documentError', errorData);
        }
      });

      app.eventBus.on('documentinit', (event) => {
        if (window.ng2PdfJsViewerEnableDocumentInit) {
          log('Document init event received');
          sendEventNotification('documentInit', null);
        }
      });

      app.eventBus.on('pagesinit', (event) => {
        if (window.ng2PdfJsViewerEnablePagesInit) {
          const pageCount = app.pagesCount || 0;
          log(`Pages init event received: ${pageCount} pages`);
          const pagesData = {
            pagesCount: pageCount
          };
          sendEventNotification('pagesInit', pagesData);
        }
      });

      app.eventBus.on('presentationmodechanged', (event) => {
        if (window.ng2PdfJsViewerEnablePresentationModeChanged) {
          // Map PDF.js PresentationModeState to boolean
          // FULLSCREEN = 3, CHANGING = 2, NORMAL = 1, UNKNOWN = 0
          const isActive = event.state === 3; // PresentationModeState.FULLSCREEN
          const isChanging = event.state === 2; // PresentationModeState.CHANGING
          log(`Presentation mode changed event received: state=${event.state}, active=${isActive}`);
          const presentationData = {
            active: isActive,
            switchInProgress: isChanging
          };
          sendEventNotification('presentationModeChanged', presentationData);
        }
      });

      app.eventBus.on('fileinputchange', (event) => {
        if (window.ng2PdfJsViewerEnableOpenFile) {
          log('File input change event received (open file)');
          sendEventNotification('openFile', null);
        }
      });

      app.eventBus.on('find', (event) => {
        if (window.ng2PdfJsViewerEnableFind) {
          log(`Find event received: query="${event.query}"`);
          const findData = {
            query: event.query || '',
            phraseSearch: false, // Not available in PDF.js v5.3.93
            caseSensitive: event.caseSensitive || false,
            entireWord: event.entireWord || false,
            highlightAll: event.highlightAll || false,
            findPrevious: event.findPrevious || false
          };
          sendEventNotification('find', findData);
        }
      });

      app.eventBus.on('updatefindmatchescount', (event) => {
        if (window.ng2PdfJsViewerEnableUpdateFindMatchesCount) {
          log(`Update find matches count event received: ${event.matchesCount.current}/${event.matchesCount.total}`);
          const countData = {
            current: event.matchesCount?.current || 0,
            total: event.matchesCount?.total || 0
          };
          sendEventNotification('updateFindMatchesCount', countData);
        }
      });

      app.eventBus.on('metadataloaded', (event) => {
        if (window.ng2PdfJsViewerEnableMetadataLoaded) {
          log('Metadata loaded event received');
          const info = app.documentInfo;
          const metadataData = {
            title: info?.Title,
            author: info?.Author,
            subject: info?.Subject,
            keywords: info?.Keywords,
            creator: info?.Creator,
            producer: info?.Producer,
            creationDate: info?.CreationDate,
            modificationDate: info?.ModDate,
            pdfFormatVersion: info?.PDFFormatVersion,
            isLinearized: info?.IsLinearized,
            isAcroFormPresent: info?.IsAcroFormPresent,
            isXFAPresent: info?.IsXFAPresent,
            isCollectionPresent: info?.IsCollectionPresent
          };
          sendEventNotification('metadataLoaded', metadataData);
        }
      });

      app.eventBus.on('outlineloaded', (event) => {
        if (window.ng2PdfJsViewerEnableOutlineLoaded) {
          log(`Outline loaded event received: ${event.outlineCount} items`);
          const outlineData = {
            items: [], // Outline items are not available in the event, but consumers can check hasOutline
            hasOutline: (event.outlineCount || 0) > 0
          };
          sendEventNotification('outlineLoaded', outlineData);
        }
      });

      app.eventBus.on('pagerendered', (event) => {
        if (window.ng2PdfJsViewerEnablePageRendered) {
          log(`Page rendered event received: page ${event.pageNumber}`);
          const renderData = {
            pageNumber: event.pageNumber || 1,
            // Don't include source as it contains canvas element that can't be cloned
            timestamp: Date.now()
          };
          sendEventNotification('pageRendered', renderData);
        }
      });

      // Loading state integration for overlay control (Phase 2)
      // Event-driven only; idempotent notifications, no flags or polling
      app.eventBus.on('documentinit', () => sendStateChangeNotification('loading', true, 'system'));
      app.eventBus.on('pagesinit', () => sendStateChangeNotification('loading', true, 'system'));
      app.eventBus.on('pagerendered', () => sendStateChangeNotification('loading', false, 'system'));
      app.eventBus.on('pagesloaded', () => sendStateChangeNotification('loading', false, 'system'));

      // New high-value events (Phase 2)
      
      // Annotation Layer Rendered - Native PDF.js event
      app.eventBus.on('annotationlayerrendered', (event) => {
        if (window.ng2PdfJsViewerEnableAnnotationLayerRendered) {
          log(`Annotation layer rendered: page ${event.pageNumber}`);
          const renderData = {
            pageNumber: event.pageNumber || 1,
            error: event.error || null,
            timestamp: performance.now()
          };
          sendEventNotification('annotationLayerRendered', renderData);
        }
      });
      
      // Reset idle timer when PDF document changes (event-driven approach)
      if (window.ng2PdfJsViewerEnableIdle) {
        app.eventBus.on('documentloaded', () => {
          if (typeof resetIdleTimer === 'function') {
            resetIdleTimer();
            log('Idle timer reset on document load');
          }
        });
      }
    }

    // Initialize custom event implementations
    initializeCustomEvents(app);

    log('Bidirectional event listeners setup completed');
  }

  // Initialize custom event implementations
  function initializeCustomEvents(app) {
    setupIdleDetection();
    interceptOutlineClicks(app);
  }

  // Idle Detection - Custom activity tracking
  let idleTimer = null;
  let idleListenersSetup = false;
  let idleCleanupListeners = []; // Track listeners for cleanup
  const IDLE_TIMEOUT = 30000; // 30 seconds default

  function resetIdleTimer() {
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    if (window.ng2PdfJsViewerEnableIdle) {
      idleTimer = setTimeout(() => {
        log('User idle detected');
        sendEventNotification('idle', null);
      }, IDLE_TIMEOUT);
    }
  }

  function cleanupIdleDetection() {
    // Clear timer
    if (idleTimer) {
      clearTimeout(idleTimer);
      idleTimer = null;
    }
    
    // Remove all tracked event listeners
    idleCleanupListeners.forEach(({ element, event, handler, options }) => {
      element.removeEventListener(event, handler, options);
    });
    idleCleanupListeners = [];
    idleListenersSetup = false;
    
    log('Idle detection cleanup completed');
  }

  function setupIdleDetection() {
    // Prevent multiple setups
    if (idleListenersSetup) {
      log('Idle detection already setup, skipping');
      return;
    }
    
    idleListenersSetup = true;
    
    // Helper to add and track event listeners
    const addTrackedListener = (element, event, handler, options) => {
      element.addEventListener(event, handler, options);
      idleCleanupListeners.push({ element, event, handler, options });
    };

    // Track mouse activity
    addTrackedListener(document, 'mousemove', resetIdleTimer, { passive: true });
    addTrackedListener(document, 'mousedown', resetIdleTimer, { passive: true });
    addTrackedListener(document, 'click', resetIdleTimer, { passive: true });
    
    // Track keyboard activity  
    addTrackedListener(document, 'keydown', resetIdleTimer, { passive: true });
    addTrackedListener(document, 'keypress', resetIdleTimer, { passive: true });
    
    // Track scroll activity
    addTrackedListener(document, 'scroll', resetIdleTimer, { passive: true });
    addTrackedListener(document, 'wheel', resetIdleTimer, { passive: true });
    
    // Track touch activity
    addTrackedListener(document, 'touchstart', resetIdleTimer, { passive: true });
    addTrackedListener(document, 'touchmove', resetIdleTimer, { passive: true });
    
    // Start initial timer
    resetIdleTimer();

    // Cleanup on document unload
    const unloadHandler = () => {
      cleanupIdleDetection();
    };
    addTrackedListener(window, 'beforeunload', unloadHandler, { passive: true });

    log('Idle detection setup completed');
  }

  // Bookmark Click - Intercept outline item clicks
  let bookmarkInterceptionSetup = false;
  
  function interceptOutlineClicks(app) {
    // Prevent multiple setups
    if (bookmarkInterceptionSetup) {
      log('Bookmark click interception already setup, skipping');
      return;
    }
    
    // Check if PDF outline viewer is available immediately
    if (app && app.pdfOutlineViewer && app.pdfOutlineViewer._bindLink) {
      const originalBindLink = app.pdfOutlineViewer._bindLink;
      
      app.pdfOutlineViewer._bindLink = function(element, params) {
        // Call original bind method first
        originalBindLink.call(this, element, params);
        
        // Only intercept if bookmark click events are enabled
        if (window.ng2PdfJsViewerEnableBookmarkClick) {
          const originalOnClick = element.onclick;
          element.onclick = function(evt) {
            // Extract bookmark data
            const bookmarkData = {
              title: element.textContent?.trim() || 'Unknown',
              dest: params.dest || null,
              action: params.action || undefined,
              url: params.url || undefined,
              pageNumber: undefined, // Will be resolved by linkService
              isCurrentItem: element.classList.contains('currentTreeItem')
            };
            
            log(`Bookmark clicked: ${bookmarkData.title}`);
            sendEventNotification('bookmarkClick', bookmarkData);
            
            // Call original handler to preserve navigation functionality
            if (originalOnClick) {
              return originalOnClick.call(this, evt);
            }
            return false;
          };
        }
        // If events not enabled, original onclick remains intact
      };
      
      bookmarkInterceptionSetup = true;
      log('Bookmark click interception setup completed');
    } else {
      // If outline viewer is not available yet, defer setup using event-driven approach
      // Hook into outlineloaded event to retry when outline becomes available
      if (app && app.eventBus) {
        const outlineLoadedHandler = () => {
          if (!bookmarkInterceptionSetup) {
            interceptOutlineClicks(app); // Retry when outline is loaded
          }
        };
        app.eventBus.on('outlineloaded', outlineLoadedHandler);
        log('Bookmark click interception deferred until outline loads');
      } else {
        log('Unable to setup bookmark click interception - event bus not available', 'warn');
      }
    }
  }
  // #endregion

  // Start the initialization process
  waitForViewer();
})(); 