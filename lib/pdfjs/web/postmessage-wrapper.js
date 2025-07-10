(function() {
  'use strict';
  
  // 🟢 TEST LOG - Build verification (BUILD_ID: placeholder)
  console.log('🟢 postmessage-wrapper.js: TEST LOG - BUILD_ID:', '2025-07-09T22-09-51-000Z');
  
  // Readiness state management
  const ViewerReadiness = {
    NOT_LOADED: 0,
    VIEWER_LOADED: 1,      // PDFViewerApplication exists
    VIEWER_INITIALIZED: 2, // PDFViewerApplication.initialized = true
    EVENTBUS_READY: 3,     // Event bus is available and ready
    COMPONENTS_READY: 4,   // All required components available
    DOCUMENT_LOADED: 5     // PDF document fully loaded
  };
  
  let currentReadiness = ViewerReadiness.NOT_LOADED;
  let readinessCallbacks = [];
  
  // Action classification based on requirements
  const IMMEDIATE_ACTIONS = [
    'show-download', 'show-print', 'show-fullscreen', 'show-find', 
    'show-bookmark', 'show-openfile', 'show-annotations',
    'set-error-message', 'set-error-override', 'set-error-append', 
    'set-locale', 'set-css-zoom'
  ];
  
  const VIEWER_READY_ACTIONS = [
    'set-cursor', 'set-scroll', 'set-spread', 'set-zoom',
    'update-page-mode'
  ];
  
  const DOCUMENT_LOADED_ACTIONS = [
    'set-page', 'set-rotation', 'go-to-last-page', 'go-to-named-dest',
    'trigger-download', 'trigger-print', 'trigger-rotate-cw', 'trigger-rotate-ccw'
  ];
  
  // Diagnostic logging function
  function log(message, level = 'info') {
    if (window.parent && window.parent.diagnosticLogs) {
      const prefix = '🔍 Ng2PdfJsViewer:';
      switch (level) {
        case 'error':
          console.error(prefix, message);
          break;
        case 'warn':
          console.warn(prefix, message);
          break;
        default:
          console.log(prefix, message);
      }
    }
  }
  
  log('PostMessage wrapper script loaded');
  
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
  
  // Component availability verification with async initialization awareness
  function verifyComponentAvailability(action) {
    const app = PDFViewerApplication;
    if (!app) return false;
    
    // Check if viewer is properly initialized
    if (!app.initialized && !app.initializedPromise) {
      log(`Component verification failed: PDFViewerApplication not initialized for action: ${action}`, 'warn');
      return false;
    }
    
    switch (action) {
      case 'set-cursor':
        return !!(app.pdfCursorTools || app.eventBus);
      case 'set-scroll':
      case 'set-spread':
      case 'set-zoom':
        return !!app.pdfViewer;
      case 'set-page':
      case 'set-rotation':
        return !!app.pdfViewer && app.pdfDocument;
      case 'trigger-download':
      case 'trigger-print':
        return !!app.pdfDocument;
      default:
        return true; // Default to true for unknown actions
    }
  }
  
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

  function handleControlMessage(event) {
    const { type, action, payload, id } = event.data;
    
    if (type === 'control-update') {
      try {
        log(`Processing control update: ${action} = ${payload} (readiness: ${currentReadiness})`);
        
        // Check if action can be executed at current readiness level
        const requiredReadiness = getRequiredReadiness(action);
        if (currentReadiness < requiredReadiness) {
          const error = `Action ${action} requires readiness level ${requiredReadiness}, but current level is ${currentReadiness}`;
          log(error, 'warn');
          sendResponse(id, { success: false, error });
          return;
        }
        
        // Verify component availability
        if (!verifyComponentAvailability(action)) {
          const error = `Required components not available for action: ${action}`;
          log(error, 'warn');
          sendResponse(id, { success: false, error });
          return;
        }
        
        updateControl(action, payload);
        sendResponse(id, { success: true, action, payload });
      } catch (error) {
        log(`Error updating control ${action}: ${error.message}`, 'error');
        sendResponse(id, { success: false, error: error.message });
      }
    }
  }
  
  function getRequiredReadiness(action) {
    if (IMMEDIATE_ACTIONS.includes(action)) {
      return ViewerReadiness.EVENTBUS_READY;
    } else if (VIEWER_READY_ACTIONS.includes(action)) {
      return ViewerReadiness.COMPONENTS_READY;
    } else if (DOCUMENT_LOADED_ACTIONS.includes(action)) {
      return ViewerReadiness.DOCUMENT_LOADED;
    } else {
      return ViewerReadiness.EVENTBUS_READY; // Default
    }
  }

  function updateControl(action, payload) {
    const app = PDFViewerApplication;
    
    // Validate that PDFViewerApplication is available
    if (!app) {
      log('PDFViewerApplication not available', 'error');
      return;
    }
    
    try {
      switch (action) {
        // Button visibility controls
        case 'show-download':
          updateDownloadButton(payload);
          break;
        case 'show-print':
          updatePrintButton(payload);
          break;
        case 'show-fullscreen':
          updateFullScreenButton(payload);
          break;
        case 'show-find':
          updateFindButton(payload);
          break;
        case 'show-bookmark':
          updateBookmarkButton(payload);
          break;
        case 'show-openfile':
          updateOpenFileButton(payload);
          break;
        case 'show-annotations':
          updateAnnotationsButton(payload);
          break;
        
        // Mode controls
        case 'set-zoom':
          updateZoom(payload);
          break;
        case 'set-cursor':
          updateCursor(payload);
          break;
        case 'set-scroll':
          updateScroll(payload);
          break;
        case 'set-spread':
          updateSpread(payload);
          break;
        
        // Navigation controls
        case 'set-page':
          updatePage(payload);
          break;
        case 'set-rotation':
          updateRotation(payload);
          break;
        case 'go-to-last-page':
          if (payload === true) {
            goToLastPage();
          }
          break;
        case 'go-to-named-dest':
          goToNamedDestination(payload);
          break;
        case 'update-page-mode':
          updatePageMode(payload);
          break;
        
        // Auto actions
        case 'trigger-download':
          if (payload === true) {
            triggerDownload();
          }
          break;
        case 'trigger-print':
          console.log('🔍 Ng2PdfJsViewer: trigger-print action received with payload:', payload);
          if (payload === true) {
            triggerPrint();
          }
          break;
        case 'trigger-rotate-cw':
          if (payload === true) {
            triggerRotateCW();
          }
          break;
        case 'trigger-rotate-ccw':
          if (payload === true) {
            triggerRotateCCW();
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
        
        default:
          log(`Unknown action: ${action}`, 'warn');
      }
    } catch (error) {
      log(`Error in updateControl for action ${action}: ${error.message}`, 'error');
      throw error;
    }
  }

  // Button visibility functions
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

  // Mode control functions
  function updateZoom(zoom) {
    const app = PDFViewerApplication;
    if (!app || !app.pdfViewer || !app.eventBus) {
      log('PDFViewerApplication, pdfViewer, or eventBus not ready for zoom update', 'warn');
      return;
    }

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
    
    // Check if it's a valid numeric zoom
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
  }

  function updateCursor(cursor) {
    const app = PDFViewerApplication;
    
    // Readiness check is already done in handleControlMessage
    if (!app) {
      log('PDFViewerApplication not available for cursor update', 'error');
      return;
    }
    
    // Ensure viewer is properly initialized
    if (!app.initialized && !app.initializedPromise) {
      log('PDFViewerApplication not initialized for cursor update', 'warn');
      return;
    }
    
    try {
      const cursorTool = cursor ? cursor.toUpperCase() : 'SELECT';
      log(`Attempting to update cursor to: ${cursorTool} (readiness: ${currentReadiness})`);
      
      let toolId = 0; // Default to SELECT
      switch (cursorTool) {
        case 'HAND':
        case 'H':
          toolId = 1;
            break;
        case 'SELECT':
        case 'S':
          toolId = 0;
            break;
        case 'ZOOM':
        case 'Z':
          toolId = 2;
            break;
          default:
          log(`Unknown cursor type: ${cursor}, defaulting to SELECT`, 'warn');
          toolId = 0;
      }
      
      log(`Cursor set to ${cursorTool} (tool: ${toolId})`);
      
      let success = false;
      
      // Primary method: Use event bus dispatch (most reliable)
      if (app.eventBus && typeof app.eventBus.dispatch === 'function') {
        try {
          app.eventBus.dispatch('switchcursortool', {
            tool: toolId
          });
          log(`Cursor updated via event bus to: ${cursorTool} (tool: ${toolId})`);
          success = true;
        } catch (eventError) {
          log(`Event bus cursor update failed: ${eventError.message}`, 'warn');
        }
      } else {
        log('EventBus not available for cursor update', 'warn');
      }
      
      // Fallback: Direct access to cursor tools
      if (!success && app.pdfCursorTools) {
        try {
          app.pdfCursorTools.switchTool(toolId);
          log(`Cursor updated via direct access to: ${cursorTool} (tool: ${toolId})`);
          success = true;
        } catch (directError) {
          log(`Direct cursor update failed: ${directError.message}`, 'warn');
        }
      }
      
      // Additional fallback: Update toolbar button states
      if (app.toolbar && app.toolbar.items) {
        try {
          const toolbarItems = app.toolbar.items;
          const handButton = toolbarItems.find(item => item.id === 'handTool');
          const selectButton = toolbarItems.find(item => item.id === 'selectTool');
          const zoomButton = toolbarItems.find(item => item.id === 'zoomTool');
          
          if (handButton) handButton.pressed = (toolId === 1);
          if (selectButton) selectButton.pressed = (toolId === 0);
          if (zoomButton) zoomButton.pressed = (toolId === 2);
          
          log(`Toolbar button states updated for cursor: ${cursorTool}`);
        } catch (toolbarError) {
          log(`Toolbar cursor update failed: ${toolbarError.message}`, 'warn');
        }
      }
      
      if (success) {
        log(`Cursor update completed successfully for: ${cursorTool}`);
      } else {
        log(`Cursor update failed for: ${cursorTool} - no available method worked`, 'error');
      }
    } catch (error) {
      log(`Error updating cursor: ${error.message}`, 'error');
    }
  }

  function updateScroll(scroll) {
    const app = PDFViewerApplication;
    if (!app || (!app.initialized && !app.initializedPromise)) {
      log('PDFViewerApplication not ready for scroll update', 'warn');
      return;
    }
    
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
            log(`Unknown scroll mode: ${scroll}`, 'warn');
        }
      } else {
        log('EventBus not available for scroll mode', 'error');
      }
      
      // Also try direct property access as fallback
      if (PDFViewerApplication.pdfViewer) {
        try {
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
          log(`Scroll mode updated via direct access to: ${scrollMode}`);
        } catch (directError) {
          log(`Direct scroll mode update failed: ${directError.message}`, 'warn');
        }
      }
      
      log(`Scroll mode update completed for: ${scrollMode}`);
    } catch (error) {
      log(`Error updating scroll mode: ${error.message}`, 'error');
    }
  }

  function updateSpread(spread) {
    const app = PDFViewerApplication;
    if (!app || (!app.initialized && !app.initializedPromise)) {
      log('PDFViewerApplication not ready for spread update', 'warn');
      return;
    }
    
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
            log(`Unknown spread mode: ${spread}`, 'warn');
        }
      } else {
        log('EventBus not available for spread mode', 'error');
      }
      
      // Also try direct property access as fallback
      if (PDFViewerApplication.pdfViewer) {
        try {
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
          log(`Spread mode updated via direct access to: ${spreadMode}`);
        } catch (directError) {
          log(`Direct spread mode update failed: ${directError.message}`, 'warn');
        }
      }
      
      log(`Spread mode update completed for: ${spreadMode}`);
    } catch (error) {
      log(`Error updating spread mode: ${error.message}`, 'error');
    }
  }

  // Navigation functions
  function updatePage(page) {
    if (!PDFViewerApplication || !PDFViewerApplication.initialized) {
      log('PDFViewerApplication not ready for page update', 'warn');
      return;
    }
    
    try {
      const pageNumber = parseInt(page, 10);
      if (pageNumber > 0 && pageNumber <= PDFViewerApplication.pagesCount) {
        // Use PDF.js v4.x page property setter
        PDFViewerApplication.page = pageNumber;
        log(`Page updated to: ${pageNumber}`);
      } else {
        log(`Invalid page number: ${page}`, 'warn');
      }
    } catch (error) {
      log(`Error updating page: ${error.message}`, 'error');
    }
  }

  function updateRotation(rotation) {
    if (!PDFViewerApplication || !PDFViewerApplication.initialized) {
      log('PDFViewerApplication not ready for rotation update', 'warn');
      return;
    }
    
    try {
      const rotationValue = parseInt(rotation, 10);
      if (rotationValue % 90 === 0) {
        // Use PDF.js v4.x pagesRotation property
        PDFViewerApplication.pdfViewer.pagesRotation = rotationValue;
        log(`Rotation updated to: ${rotationValue}`);
      } else {
        log(`Invalid rotation value: ${rotation}`, 'warn');
      }
    } catch (error) {
      log(`Error updating rotation: ${error.message}`, 'error');
    }
  }

  function goToLastPage() {
    if (!PDFViewerApplication || !PDFViewerApplication.initialized) {
      log('PDFViewerApplication not ready for last page navigation', 'warn');
      return;
    }
    
    try {
      const lastPage = PDFViewerApplication.pagesCount;
      PDFViewerApplication.page = lastPage;
      log(`Navigated to last page: ${lastPage}`);
    } catch (error) {
      log(`Error navigating to last page: ${error.message}`, 'error');
    }
  }

  function goToNamedDestination(destination) {
    if (!PDFViewerApplication || !PDFViewerApplication.initialized) {
      log('PDFViewerApplication not ready for named destination navigation', 'warn');
      return;
    }
    
    try {
      if (PDFViewerApplication.pdfLinkService) {
        PDFViewerApplication.pdfLinkService.goToDestination(destination);
        log(`Navigated to named destination: ${destination}`);
      }
      } catch (error) {
      log(`Error navigating to named destination: ${error.message}`, 'error');
      }
  }

  function updatePageMode(pageMode) {
    if (!PDFViewerApplication || !PDFViewerApplication.initialized) {
      log('PDFViewerApplication not ready for page mode update', 'warn');
      return;
    }
    
    try {
      const mode = pageMode ? pageMode.toLowerCase() : 'none';
      if (PDFViewerApplication.eventBus) {
        // Use PDF.js v4.x event bus dispatch for page mode
        PDFViewerApplication.eventBus.dispatch('pagemode', {
          mode: mode
        });
        log(`Page mode updated to: ${mode}`);
      }
    } catch (error) {
      log(`Error updating page mode: ${error.message}`, 'error');
    }
  }

  // Auto action functions
  function triggerDownload() {
    if (!PDFViewerApplication || !PDFViewerApplication.initialized) {
      log('PDFViewerApplication not ready for download', 'warn');
      return;
    }
    
    try {
      if (PDFViewerApplication.eventBus) {
        PDFViewerApplication.eventBus.dispatch('download');
        log('Download triggered');
        }
      } catch (error) {
      log(`Error triggering download: ${error.message}`, 'error');
    }
  }

  function triggerPrint() {
    if (!PDFViewerApplication || !PDFViewerApplication.initialized) {
      log('PDFViewerApplication not ready for print', 'warn');
      return;
    }
    
    try {
      if (PDFViewerApplication.eventBus) {
        PDFViewerApplication.eventBus.dispatch('print');
        log('Print triggered');
        }
      } catch (error) {
      log(`Error triggering print: ${error.message}`, 'error');
    }
  }

  function triggerRotateCW() {
    if (!PDFViewerApplication || !PDFViewerApplication.initialized) {
      log('PDFViewerApplication not ready for rotation', 'warn');
      return;
    }
    
    try {
      if (PDFViewerApplication.eventBus) {
        PDFViewerApplication.eventBus.dispatch('rotatecw');
        log('Rotated clockwise');
      }
    } catch (error) {
      log(`Error rotating clockwise: ${error.message}`, 'error');
    }
  }

  function triggerRotateCCW() {
    if (!PDFViewerApplication || !PDFViewerApplication.initialized) {
      log('PDFViewerApplication not ready for rotation', 'warn');
      return;
    }
    
    try {
      if (PDFViewerApplication.eventBus) {
        PDFViewerApplication.eventBus.dispatch('rotateccw');
        log('Rotated counter-clockwise');
      }
    } catch (error) {
      log(`Error rotating counter-clockwise: ${error.message}`, 'error');
    }
  }

  // Error handling functions
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

  // Locale and CSS zoom functions
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

  // Event configuration functions
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

  // Start the initialization process
  waitForViewer();
})(); 