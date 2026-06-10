(function() {
  'use strict';
  
  // All outgoing postMessages target '/' (same-origin). The component requires
  // the viewer assets to be served from the host app's origin (it reaches into
  // the iframe document directly), so a cross-origin parent is unsupported and
  // must not receive viewer state.
  const PARENT_ORIGIN = '/';

  // #region URL Security Validation
  let originalFileUrl = null;
  let urlValidationEnabled = true;

  // Read the urlValidation flag and baseline the file URL for THIS document
  // load. The baseline is deliberately not persisted across navigations: every
  // legitimate load (pdfSrc change, refresh) navigates the iframe and re-runs
  // this script, so a persisted baseline only produces false "tampered" alerts.
  // What we can and do detect is tampering WITHIN a load (hash/history changes).
  try {
    const __urlParams = new URLSearchParams(window.location.search);
    const __uv = __urlParams.get('urlValidation');
    if (__uv !== null) {
      const lowered = String(__uv).toLowerCase();
      urlValidationEnabled = !(lowered === '0' || lowered === 'false' || lowered === 'off');
    }
    originalFileUrl = __urlParams.get('file');
  } catch (_) {
    // ignore
  }

  function validateCurrentUrl() {
    if (!urlValidationEnabled || !originalFileUrl) {
      return true; // Skip validation if disabled or no original URL
    }

    const currentFileParam = new URLSearchParams(window.location.search).get('file');
    if (currentFileParam !== originalFileUrl) {
      showSecurityError('Unauthorized file access detected. The file URL has been tampered with.');
      return false;
    }

    return true;
  }

  function showSecurityError(message) {
    log(`Security warning: ${message}`, 'warn');

    // Send notification to parent window for Angular template handling
    if (window.parent && window.parent !== window) {
      window.parent.postMessage({
        type: 'ng2-pdfjs-viewer-security-warning',
        message: message,
        originalUrl: originalFileUrl,
        currentUrl: new URLSearchParams(window.location.search).get('file')
      }, PARENT_ORIGIN);
    }
  }

  // Detect in-document URL tampering (hash change / history manipulation)
  window.addEventListener('hashchange', validateCurrentUrl);
  window.addEventListener('popstate', validateCurrentUrl);
  // #endregion

  // Readiness entry points (observer-free). PDF.js dispatches 'webviewerloaded'
  // on parent.document for same-origin embeds (the Angular component listens
  // there itself) and falls back to this document for cross-origin parents.
  // Either way, window.PDFViewerApplication is assigned before that dispatch,
  // and module scripts have run by DOMContentLoaded - so both hooks below see
  // the application object.
  document.addEventListener('webviewerloaded', () => checkViewerReadiness());
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof PDFViewerApplication !== 'undefined') {
      checkViewerReadiness();
    }
  });
  
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
  let diagnosticLogs = false; // Default to false for production
  // #endregion

  // #region Utility Functions
  function log(message, level = 'info') {
    if (!diagnosticLogs) return; // Only log when diagnostic logs are enabled
    
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

  // Set diagnostic logs mode
  function setDiagnosticLogs(enabled) {
    diagnosticLogs = enabled;
  }

  // Button visibility control helper (consolidated from separate module)
  function toggleButtonVisibility(primaryId, secondaryId, visible) {
    const primary = document.getElementById(primaryId);
    const secondary = secondaryId ? document.getElementById(secondaryId) : null;
    if (primary) primary.classList.toggle('hidden', !visible);
    if (secondary) secondary.classList.toggle('hidden', !visible);
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

  // Toolbar section visibility control that preserves layout
  function toggleToolbarSectionVisibility(elementId, visible) {
    const el = document.getElementById(elementId);
    if (!el) {
      log(`Toolbar section not found for visibility toggle: ${elementId}`, 'warn');
      return;
    }
    
    // Use CSS class instead of inline styles (CSP-safe)
    el.classList.toggle('ng2-hidden-section', !visible);
  }
  
  // Readiness state management. Fires only on increases; announces each
  // increase at EVENTBUS_READY or above to the parent (which gates queued
  // actions on the reported level).
  function setReadiness(readiness) {
    if (readiness <= currentReadiness) {
      return;
    }
    log(`Readiness state changed: ${currentReadiness} → ${readiness}`);
    currentReadiness = readiness;
    if (currentReadiness >= ViewerReadiness.EVENTBUS_READY) {
      initializePostMessageAPI();
    }
  }
  
  // Note: Density styles now loaded from external ng2-customization.css (CSP-safe)
  
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

      window.parent.postMessage(message, PARENT_ORIGIN);
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

      window.parent.postMessage(message, PARENT_ORIGIN);
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
      }, PARENT_ORIGIN);
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
          
          // NOTE: State change notifications are sent by the bidirectional event listeners
          // when the actual mode change occurs in PDF.js, not immediately when we dispatch
          // This prevents infinite loops and ensures we only notify on actual changes
        } else {
          log(`Unknown ${propertyName} mode: ${modeValue}`, 'warn');
        }
      } catch (error) {
        log(`Error updating ${propertyName} mode: ${error.message}`, 'error');
      }
    }
  };
  // #endregion

  // #region Initialization and Setup
  
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
        setReadiness(ViewerReadiness.VIEWER_INITIALIZED);
        
        // Check if event bus is ready
        if (app.eventBus && typeof app.eventBus.dispatch === 'function') {
          setReadiness(ViewerReadiness.EVENTBUS_READY);
          
          // Check if key components are available
          if (app.pdfViewer && app.pdfCursorTools) {
            setReadiness(ViewerReadiness.COMPONENTS_READY);
            
            // CSS zoom setting is now handled via PostMessage configuration
            // No need to check global window variables
          }
        }
      }).catch(error => {
        log(`PDFViewerApplication initialization failed: ${error.message}`, 'error');
      });
    } else if (app.initialized) {
      // Fallback for synchronous check (though this should be async)
      setReadiness(ViewerReadiness.VIEWER_INITIALIZED);
      
      // Check if event bus is ready
      if (app.eventBus && typeof app.eventBus.dispatch === 'function') {
        setReadiness(ViewerReadiness.EVENTBUS_READY);
        
        // Check if key components are available
        if (app.pdfViewer && app.pdfCursorTools) {
          setReadiness(ViewerReadiness.COMPONENTS_READY);
          
          // CSS zoom setting is now handled via PostMessage configuration
          // No need to check global window variables
        }
      }
    }
  }
  
  let apiInitialized = false; // One-time setup guard

  function initializePostMessageAPI() {
    if (!apiInitialized) {
      apiInitialized = true;

      // Add message listener
      window.addEventListener('message', handleControlMessage);

      // Expose API for external access
      window.Ng2PdfJsViewerAPI = {
        updateControl: updateControl,
        getState: getState,
        isReady: () => currentReadiness >= ViewerReadiness.EVENTBUS_READY,
        getReadiness: () => currentReadiness
      };

      // Set up event listeners for readiness changes
      setupReadinessEventListeners();
    }

    // Announce every readiness increase - the parent gates queued actions
    // (e.g. document-level ones) on the reported level.
    window.parent.postMessage({
      type: 'postmessage-ready',
      timestamp: Date.now(),
      readiness: currentReadiness
    }, PARENT_ORIGIN);
  }
  
  function setupReadinessEventListeners() {
    const app = PDFViewerApplication;
    if (!app || !app.eventBus) return;
    
    // Set up error event listeners immediately (before document loads)
    setupErrorEventListeners();
    
    // Loading state integration for overlay control
    // MUST be set up early (before document loading begins) to catch documentinit/pagesinit events
    // Event-driven only; idempotent notifications, no flags or polling
    app.eventBus.on('documentinit', () => sendStateChangeNotification('loading', true, 'system'));
    app.eventBus.on('pagesinit', () => sendStateChangeNotification('loading', true, 'system'));
    app.eventBus.on('pagerendered', () => sendStateChangeNotification('loading', false, 'system'));
    app.eventBus.on('pagesloaded', () => sendStateChangeNotification('loading', false, 'system'));
    
    // Listen for document loaded event
    app.eventBus.on('documentloaded', () => {
      setReadiness(ViewerReadiness.DOCUMENT_LOADED);
      
      // Set up bidirectional event listeners once document is loaded
      setupBidirectionalEventListeners();
    });
    
    // Listen for pages loaded event
    app.eventBus.on('pagesloaded', () => {
      // Ensure we're at least at components ready level
      if (currentReadiness < ViewerReadiness.COMPONENTS_READY) {
        setReadiness(ViewerReadiness.COMPONENTS_READY);
      }
    });
  }
  // #endregion

  // #region Message Handling
  function handleControlMessage(event) {
    // Accept control messages only from the embedding window. Anything else
    // (other iframes, extensions, unrelated broadcasts) must not drive the
    // viewer - and null/foreign data must not throw on destructuring.
    if (event.source !== window.parent || !event.data) {
      return;
    }

    const { type, action, payload, id } = event.data;

    if (type === 'control-update') {
      try {
        
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
      // Note: Density styles loaded from external ng2-customization.css (CSP-safe)
      switch (action) {
        // Button visibility controls (using consolidated helper function)
        case 'show-download':
          toggleButtonVisibility('downloadButton', 'secondaryDownload', payload);
          break;
        case 'show-print':
          toggleButtonVisibility('printButton', 'secondaryPrint', payload);
          break;
        case 'show-fullscreen':
          toggleButtonVisibility('presentationMode', null, payload);
          break;
        case 'show-find':
          toggleButtonVisibility('viewFindButton', null, payload);
          break;
        case 'show-bookmark':
          toggleButtonVisibility('viewBookmark', null, payload);
          break;
        case 'show-openfile':
          toggleButtonVisibility('openFile', 'secondaryOpenFile', payload);
          break;
        case 'show-annotations':
          toggleAnnotations(payload);
          break;
        
        case 'set-toolbar-density': {
          // Apply compact/comfortable density by toggling a class on #toolbarContainer
          const container = document.getElementById('toolbarContainer');
          if (container) {
            container.classList.remove('density-default','density-compact','density-comfortable');
            const density = typeof payload === 'string' ? payload : 'default';
            container.classList.add(`density-${density}`);
          }
          break;
        }
        case 'set-sidebar-width': {
          // Use CSS variable only (CSP-safe) - width applied via ng2-customization.css
          const outer = document.getElementById('outerContainer');
          if (outer && typeof payload === 'string' && payload.trim() !== '') {
            outer.style.setProperty('--sidebar-width', payload);
          }
          break;
        }
        case 'set-toolbar-position': {
          const outer = document.getElementById('outerContainer');
          if (outer) {
            outer.classList.remove('toolbar-bottom');
            if (payload === 'bottom') outer.classList.add('toolbar-bottom');
          }
          break;
        }
        case 'set-sidebar-position': {
          const outer = document.getElementById('outerContainer');
          if (outer) {
            outer.classList.remove('sidebar-right');
            if (payload === 'right') outer.classList.add('sidebar-right');
          }
          break;
        }
        case 'set-responsive-breakpoint': {
          const value = typeof payload === 'number' ? `${payload}px` : `${payload}`;
          const outer = document.getElementById('outerContainer');
          if (outer && value) {
            outer.style.setProperty('--ng2-responsive-breakpoint', value);
          }
          break;
        }
        
        case 'show-toolbar-left':
          toggleToolbarSectionVisibility('toolbarViewerLeft', payload);
          break;
        case 'show-toolbar-middle':
          toggleToolbarSectionVisibility('toolbarViewerMiddle', payload);
          break;
        case 'show-toolbar-right':
          toggleToolbarSectionVisibility('toolbarViewerRight', payload);
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
          // The eventBus dispatch makes PDF.js set pdfViewer.scrollMode itself
          ControlUtils.updateModeViaEventBus('switchscrollmode', payload,
            { 'VERTICAL': 0, 'V': 0, 'HORIZONTAL': 1, 'H': 1, 'WRAPPED': 2, 'W': 2, 'PAGE': 3, 'P': 3 },
            'scroll mode');
          break;
        case 'set-spread':
          ControlUtils.updateModeViaEventBus('switchspreadmode', payload,
            { 'NONE': 0, 'N': 0, 'ODD': 1, 'O': 1, 'EVEN': 2, 'E': 2 },
            'spread mode');
          break;
        
        // Navigation controls
        case 'set-page':
          // Universal Dispatcher guarantees PDFViewerApplication.initialized at readiness level 5
          const pageNumber = parseInt(payload, 10);
          if (pageNumber > 0 && pageNumber <= PDFViewerApplication.pagesCount) {
            PDFViewerApplication.page = pageNumber;
          } else {
            log(`Invalid page number: ${payload}`, 'warn');
          }
          break;
        case 'set-rotation':
          // Universal Dispatcher guarantees PDFViewerApplication.initialized at readiness level 5
          const rotation = parseInt(payload, 10);
          if ([0, 90, 180, 270].includes(rotation)) {
            // Set rotation on pdfViewer to trigger proper refresh
            PDFViewerApplication.pdfViewer.pagesRotation = rotation;
            // Note: No need to send state change notification here - 
            // PDF.js will fire 'rotationchanging' event which we handle separately
          } else {
            log(`Invalid rotation: ${payload}`, 'warn');
          }
          break;
        case 'go-to-last-page':
          if (payload === true) {
            // Universal Dispatcher guarantees PDFViewerApplication.initialized at readiness level 5
            const lastPage = PDFViewerApplication.pagesCount;
            PDFViewerApplication.page = lastPage;
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
          break;
        case 'update-page-mode':
          // Universal Dispatcher guarantees PDFViewerApplication.eventBus at readiness level 4
          const mode = payload ? payload.toLowerCase() : 'none';
          PDFViewerApplication.eventBus.dispatch('pagemode', { mode });
          break;
        
        // Configuration actions
        case 'set-download-filename':
          setDownloadFilename(payload);
          break;

        // Auto actions - Universal Dispatcher guarantees eventBus availability at readiness level 5
        case 'trigger-download':
          if (payload === true) {
            PDFViewerApplication.eventBus.dispatch('download');
          }
          break;
        case 'trigger-print':
          if (payload === true) {
            PDFViewerApplication.eventBus.dispatch('print');
          }
          break;
        case 'trigger-rotate-cw':
          if (payload === true) {
            PDFViewerApplication.eventBus.dispatch('rotatecw');
          }
          break;
        case 'trigger-rotate-ccw':
          if (payload === true) {
            PDFViewerApplication.eventBus.dispatch('rotateccw');
          }
          break;
        
        // CSS zoom
        case 'set-css-zoom':
          setCssZoom(payload);
          break;

        // Theme & Visual Customization Actions
        case 'set-theme':
          setTheme(payload);
          break;
        case 'set-primary-color':
          setPrimaryColor(payload);
          break;
        case 'set-background-color':
          setBackgroundColor(payload);
          break;
        case 'set-page-border-color':
          setPageBorderColor(payload);
          break;
        case 'set-page-spacing':
          if (payload) {
            setPageSpacing(payload.margin, payload.spreadMargin, payload.border);
          }
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
          // Handle both old format (string) and new format (object with nonce)
          if (typeof payload === 'string') {
            setCustomCSS(payload, null);
          } else if (payload && typeof payload === 'object') {
            setCustomCSS(payload.css, payload.nonce);
          }
          break;
        
        case 'set-diagnostic-logs':
          setDiagnosticLogs(payload);
          break;
        case 'set-url-validation':
          urlValidationEnabled = payload === true;
          log(`URL validation ${urlValidationEnabled ? 'enabled' : 'disabled'}`);
          break;

        case 'configure': {
          // Batched configuration snapshot: payload is [{action, payload}].
          // Steps are isolated so one bad property cannot abort the rest;
          // failures surface in the control response (and are logged by the
          // inner updateControl call).
          const failed = [];
          for (const step of Array.isArray(payload) ? payload : []) {
            try {
              updateControl(step.action, step.payload);
            } catch (_) {
              failed.push(step.action);
            }
          }
          if (failed.length > 0) {
            throw new Error(`configure failed for: ${failed.join(', ')}`);
          }
          break;
        }

        default: {
          // Event enablement: 'enable-page-rendered' -> eventEnablement.pageRendered
          if (action.startsWith('enable-')) {
            const key = action.slice(7).replace(/-([a-z])/g, (_, c) => c.toUpperCase());
            if (key in eventEnablement) {
              eventEnablement[key] = payload === true;
              // Idle tracking installs document-wide activity listeners - only
              // pay for them while idle events are actually enabled.
              if (key === 'idle') {
                if (payload === true) {
                  setupIdleDetection();
                } else {
                  cleanupIdleDetection();
                }
              }
              break;
            }
          }
          // 'set-error-message' / 'set-error-override' / 'set-error-append' are
          // composed entirely in the Angular component; tolerate them silently
          // for older component builds that still dispatch them.
          if (!action.startsWith('set-error-')) {
            log(`Unknown action: ${action}`, 'warn');
          }
        }
      }
    } catch (error) {
      log(`Error in updateControl for action ${action}: ${error.message}`, 'error');
      throw error;
    }
  }
  // #endregion

  // #region Mode Control Functions
  function toggleAnnotations(visible) {
    const app = PDFViewerApplication;

    // Drive PDF.js itself where possible: mode -1 (DISABLE) tears down the
    // editing UI, 0 (NONE) restores it. Requires a loaded document with an
    // editor UI manager; otherwise fall back to the visual toggle below.
    try {
      const mode = visible ? 0 : -1;
      if (app?.eventBus && app?.pdfViewer?.pdfDocument && app.pdfViewer.annotationEditorMode !== mode) {
        app.eventBus.dispatch('switchannotationeditormode', { source: null, mode });
      }
    } catch (_) {
      // editor unavailable (document permissions / not loaded yet)
    }

    // Mirror PDF.js's own hiding: both the button group and its separator
    toggleElementVisibilityById('editorModeButtons', visible);
    toggleElementVisibilityById('editorModeSeparator', visible);
  }

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
          app.eventBus.dispatch('switchcursortool', {
            tool: toolId
          });
      } else {
        log('EventBus not available for cursor update', 'warn');
      }
    } catch (error) {
      log(`Error updating cursor: ${error.message}`, 'error');
    }
  }

  // #endregion

  // #region CSS Zoom Functions

  function setCssZoom(useCssZoom) {
    try {
      if (PDFViewerApplication && PDFViewerApplication.pdfViewer) {
        // Set CSS zoom mode
        PDFViewerApplication.pdfViewer.useOnlyCssZoom = useCssZoom === true;
      } else {
        // CSS zoom will be set when viewer becomes ready via readiness-based dispatch
        // No need to store in global variables
      }
    } catch (error) {
      log(`Error setting CSS zoom: ${error.message}`, 'error');
    }
  }

  function setDownloadFilename(filename) {
    try {
      if (filename && PDFViewerApplication) {
        // Ensure filename ends with .pdf if not already present
        const processedFilename = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
        
        // Set the content disposition filename that PDF.js uses for downloads
        PDFViewerApplication._contentDispositionFilename = processedFilename;
      } else {
        log('Cannot set download filename - invalid filename or PDFViewerApplication not available', 'warn');
      }
    } catch (error) {
      log(`Error setting download filename: ${error.message}`, 'error');
    }
  }
  // #endregion

  // #region Event Configuration Functions
  // Event enablement state stored locally (not in global window variables)
  // This follows v5-upgrade.md principles while maintaining functionality
  
  // Local state for event enablement
  const eventEnablement = {
    beforePrint: false,
    afterPrint: false,
    pagesLoaded: false,
    pageChange: false,
    // documentError defaults ON: a fast first-load failure (e.g. 404) fires
    // 'documenterror' before the enable round-trip arrives, and losing that
    // event permanently is worse than an unsolicited one.
    documentError: true,
    documentInit: false,
    pagesInit: false,
    presentationModeChanged: false,
    openFile: false,
    find: false,
    updateFindMatchesCount: false,
    metadataLoaded: false,
    outlineLoaded: false,
    pageRendered: false,
    annotationLayerRendered: false,
    bookmarkClick: false,
    idle: false
  };
  
  // Enablement is written table-driven from the 'enable-*' actions in
  // updateControl's default branch.
  // #endregion

  // #region Theme & Visual Customization Functions
  
  // Theme management variables
  let currentTheme = 'light';
  
  function setTheme(theme) {
    currentTheme = theme || 'light';
    
    // Apply theme-specific CSS classes (CSP-safe)
    const body = document.body;
    if (body) {
      // Remove ALL theme classes including active states
      body.classList.remove('ng2-theme-light', 'ng2-theme-dark', 'ng2-theme-auto', 
                           'ng2-theme-dark-active', 'ng2-theme-light-active');
      
      // Add new theme class
      body.classList.add(`ng2-theme-${currentTheme}`);
      
      // Apply auto theme detection
      if (currentTheme === 'auto') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const activeClass = prefersDark ? 'ng2-theme-dark-active' : 'ng2-theme-light-active';
        body.classList.add(activeClass);
        
        // Listen for theme changes
        if (!window.ng2ThemeMediaListener) {
          const mediaListener = window.matchMedia('(prefers-color-scheme: dark)');
          mediaListener.addListener((e) => {
            if (currentTheme === 'auto') {
              body.classList.remove('ng2-theme-dark-active', 'ng2-theme-light-active');
              const newActiveClass = e.matches ? 'ng2-theme-dark-active' : 'ng2-theme-light-active';
              body.classList.add(newActiveClass);
            }
          });
          window.ng2ThemeMediaListener = mediaListener;
        }
      }
      
      // Force style recalculation
      body.offsetHeight; // Trigger reflow
    }
    
    // Note: Theme styles now loaded from external ng2-customization.css (CSP-safe)
  }
  
  function setPrimaryColor(color) {
    setCSSVariable('--ng2-primary-color', color);
  }
  
  function setBackgroundColor(color) {
    setCSSVariable('--ng2-background-color', color);
  }
  
  function setPageSpacing(margin, spreadMargin, border) {
    if (margin !== undefined) {
      setCSSVariable('--page-margin', margin);
    }
    if (spreadMargin !== undefined) {
      setCSSVariable('--spreadHorizontalWrapped-margin-LR', spreadMargin);
    }
    if (border !== undefined) {
      setCSSVariable('--page-border', border);
    }
  }
  
  function setPageBorderColor(color) {
    setCSSVariable('--ng2-page-border-color', color);
  }
  
  function setToolbarColor(color) {
    setCSSVariable('--ng2-toolbar-color', color);
  }
  
  function setTextColor(color) {
    setCSSVariable('--ng2-text-color', color);
  }
  
  function setBorderRadius(radius) {
    setCSSVariable('--ng2-border-radius', radius);
  }
  
  function setCustomCSS(css, nonce) {
    // Remove existing custom CSS
    const existingStyle = document.getElementById('ng2-custom-css');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Apply new custom CSS with optional nonce for CSP support
    if (css) {
      const style = document.createElement('style');
      style.id = 'ng2-custom-css';
      style.textContent = css;
      
      // Add nonce if provided (CSP support)
      if (nonce) {
        style.setAttribute('nonce', nonce);
      }
      
      document.head.appendChild(style);
    }
  }
  
  // Helper function to set CSS custom properties
  function setCSSVariable(property, value) {
    if (value) {
      document.documentElement.style.setProperty(property, value);
      // Also set on body for better compatibility
      document.body.style.setProperty(property, value);
    } else {
      document.documentElement.style.removeProperty(property);
      document.body.style.removeProperty(property);
    }
  }
  
  // Note: Theme styles now loaded from external ng2-customization.css (CSP-safe)
  
  // #endregion

  // #region Error Event Listeners (Early Setup)
  let errorListenersSetup = false; // Flag to prevent multiple setups
  
  function setupErrorEventListeners() {
    // Prevent multiple setups
    if (errorListenersSetup) {
      return;
    }
    
    const app = PDFViewerApplication;
    if (!app || !app.eventBus) {
      log('Cannot setup error listeners: EventBus not available', 'warn');
      return;
    }

    // Listen for document errors (including file origin errors)
    app.eventBus.on('documenterror', (event) => {
      log(`🔴 DOCUMENT ERROR EVENT FIRED: ${event.message}`, 'error');
      // Always hide loading spinner on document error
      sendStateChangeNotification('loading', false, 'system');
      
      // Send error state notification for custom error display
      const errorMessage = event.message || 'An error occurred while loading the PDF.';
      sendStateChangeNotification('error', errorMessage, 'system');
      
      // Send document error events only if enabled
      if (eventEnablement.documentError) {
        log(`Document error event received: ${event.message}`);
        const errorData = {
          message: event.message || 'Unknown document error',
          source: event.source ? 'PDFViewerApplication' : 'unknown',
          name: event.name || 'DocumentError'
        };
        sendEventNotification('documentError', errorData);
      }
    });

    // Listen for other potential error events
    app.eventBus.on('loaderror', (event) => {
      log(`🔴 LOAD ERROR EVENT FIRED: ${event.message}`, 'error');
      // Hide loading spinner on load error
      sendStateChangeNotification('loading', false, 'system');
    });

    app.eventBus.on('error', (event) => {
      log(`🔴 GENERIC ERROR EVENT FIRED: ${event.message}`, 'error');
      // Hide loading spinner on any error
      sendStateChangeNotification('loading', false, 'system');
    });

    errorListenersSetup = true;
    log('Error event listeners set up successfully', 'info');
  }

  // #region Bidirectional Event Listeners
  let bidirectionalListenersSetup = false; // Flag to prevent multiple setups
  
  function setupBidirectionalEventListeners() {
    // Prevent multiple setups
    if (bidirectionalListenersSetup) {
      return;
    }

    // Add global error handler for iframe-level errors
    window.addEventListener('error', (event) => {
      log(`🔴 GLOBAL ERROR: ${event.message}`, 'error');
      // Hide loading spinner on any global error
      sendStateChangeNotification('loading', false, 'system');
    });

    window.addEventListener('unhandledrejection', (event) => {
      log(`🔴 UNHANDLED PROMISE REJECTION: ${event.reason}`, 'error');
      // Hide loading spinner on unhandled promise rejection
      sendStateChangeNotification('loading', false, 'system');
    });
    
    bidirectionalListenersSetup = true;
    const app = PDFViewerApplication;
    if (!app || !app.eventBus) {
      log('Cannot setup bidirectional listeners: EventBus not available', 'warn');
      return;
    }

    // Zoom changes are reported via the 'scalechanging' event listener below;
    // sidebar/page-mode changes via 'sidebarviewchanged'. No property or
    // method monkey-patching - PDF.js's event bus already covers both.

    // Listen for additional PDF.js events that might indicate property changes
    if (app.eventBus) {
      
      // Listen for scale changing events with intelligent user vs programmatic detection
      app.eventBus.on('scalechanging', (event) => {

        
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

          sendStateChangeNotification('zoom', zoomValue, 'user');
      } else {
          log('Skipping zoom notification - not identified as user-initiated');
        }
      });

      // Listen for other relevant events
      app.eventBus.on('switchscrollmode', (event) => {
        
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
        log(`Rotation changed via event to: ${event.pagesRotation}`);
        sendStateChangeNotification('rotation', event.pagesRotation, 'user');
      });

      // Note: Error event listeners are set up earlier in setupErrorEventListeners()

      app.eventBus.on('documentinit', (event) => {
        // Send document init events only if enabled
        if (eventEnablement.documentInit) {
          sendEventNotification('documentInit', null);
        }
      });

      app.eventBus.on('pagesinit', (event) => {
        // Send pages init events only if enabled
        if (eventEnablement.pagesInit) {
          const pageCount = app.pagesCount || 0;
          const pagesData = {
            pagesCount: pageCount
          };
          sendEventNotification('pagesInit', pagesData);
        }
      });

      app.eventBus.on('presentationmodechanged', (event) => {
        // Send presentation mode events only if enabled
        if (eventEnablement.presentationModeChanged) {
          // Map PDF.js PresentationModeState to boolean
          // FULLSCREEN = 3, CHANGING = 2, NORMAL = 1, UNKNOWN = 0
          const isActive = event.state === 3; // PresentationModeState.FULLSCREEN
          const isChanging = event.state === 2; // PresentationModeState.CHANGING
          const presentationData = {
            active: isActive,
            switchInProgress: isChanging
          };
          sendEventNotification('presentationModeChanged', presentationData);
        }
      });

      app.eventBus.on('fileinputchange', (event) => {
        // Send open file events only if enabled
        if (eventEnablement.openFile) {
          sendEventNotification('openFile', null);
        }
      });

      app.eventBus.on('find', (event) => {
        // Send find events only if enabled
        if (eventEnablement.find) {
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
        // Send find matches count events only if enabled
        if (eventEnablement.updateFindMatchesCount) {
          const countData = {
            current: event.matchesCount?.current || 0,
            total: event.matchesCount?.total || 0
          };
          sendEventNotification('updateFindMatchesCount', countData);
        }
      });

      app.eventBus.on('metadataloaded', (event) => {
        // Send metadata loaded events only if enabled
        if (eventEnablement.metadataLoaded) {
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
        // Send outline loaded events only if enabled
        if (eventEnablement.outlineLoaded) {
          const outlineData = {
            items: [], // Outline items are not available in the event, but consumers can check hasOutline
            hasOutline: (event.outlineCount || 0) > 0
          };
          sendEventNotification('outlineLoaded', outlineData);
        }
      });

      app.eventBus.on('pagerendered', (event) => {
        // Send page rendered events only if enabled
        if (eventEnablement.pageRendered) {
          const renderData = {
            pageNumber: event.pageNumber || 1,
            // Don't include source as it contains canvas element that can't be cloned
        timestamp: Date.now()
          };
          sendEventNotification('pageRendered', renderData);
        }
      });

      // Note: Loading state listeners are now set up earlier in setupReadinessEventListeners()
      // to ensure they catch documentinit/pagesinit events that fire before documentloaded

      // New high-value events
      
      // Annotation Layer Rendered - Native PDF.js event
      app.eventBus.on('annotationlayerrendered', (event) => {
        // Send annotation layer rendered events only if enabled
        if (eventEnablement.annotationLayerRendered) {
          const renderData = {
            pageNumber: event.pageNumber || 1,
            error: event.error || null,
            // Epoch ms, same base as every other event timestamp
            timestamp: Date.now()
          };
          sendEventNotification('annotationLayerRendered', renderData);
        }
      });
      
      // Reset idle timer when the PDF document changes; no-ops while idle
      // events are disabled (resetIdleTimer checks the flag).
      app.eventBus.on('documentloaded', resetIdleTimer);
    }

    // Initialize custom event implementations
    initializeCustomEvents(app);
  }

  // Initialize custom event implementations
  function initializeCustomEvents(app) {
    // Idle detection installs document-wide activity listeners; defer until
    // 'enable-idle' actually arrives (see updateControl's default branch).
    if (eventEnablement.idle) {
      setupIdleDetection();
    }
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
    // Set up idle timer only if enabled
    if (eventEnablement.idle) {
      idleTimer = setTimeout(() => {
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
        
        // Intercept bookmark clicks only if enabled
        if (eventEnablement.bookmarkClick) {
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
      };
      
      bookmarkInterceptionSetup = true;

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

  // Readiness is normally kicked off by the webviewerloaded intercept above.
  // Belt-and-braces fallback for exotic load orderings.
  window.addEventListener('load', () => {
    if (currentReadiness === ViewerReadiness.NOT_LOADED && typeof PDFViewerApplication !== 'undefined') {
      checkViewerReadiness();
    }
  });
})();