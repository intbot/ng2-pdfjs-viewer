(function() {
  'use strict';
  
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
  
  // Wait for PDF.js viewer to be ready
  function waitForViewer() {
    const maxAttempts = 100; // 10 seconds max wait time
    let attempts = 0;
    
    function checkViewer() {
      attempts++;
      
      if (typeof PDFViewerApplication !== 'undefined' && PDFViewerApplication.initialized) {
        initializePostMessageAPI();
      } else if (attempts < maxAttempts) {
        setTimeout(checkViewer, 100);
      } else {
        log('Timeout waiting for PDFViewerApplication to initialize', 'error');
        // Still try to initialize in case the viewer is partially ready
        if (typeof PDFViewerApplication !== 'undefined') {
          log('Attempting to initialize with partially ready viewer', 'warn');
          initializePostMessageAPI();
        }
      }
    }
    
    checkViewer();
  }

  function initializePostMessageAPI() {
    // Add message listener
    window.addEventListener('message', handleControlMessage);
    
    // Expose API for external access
    window.Ng2PdfJsViewerAPI = {
      updateControl: updateControl,
      getState: getState,
      isReady: () => true
    };
    
    log('PostMessage API initialized');
    
    // Notify parent that PostMessage API is ready
    window.parent.postMessage({
      type: 'postmessage-ready',
      timestamp: Date.now()
    }, '*');
  }

  function handleControlMessage(event) {
    const { type, action, payload, id } = event.data;
    
    if (type === 'control-update') {
      try {
        log(`Processing control update: ${action} = ${payload}`);
        updateControl(action, payload);
        sendResponse(id, { success: true, action, payload });
      } catch (error) {
        log(`Error updating control ${action}: ${error.message}`, 'error');
        sendResponse(id, { success: false, error: error.message });
      }
    }
  }

  function updateControl(action, payload) {
    const app = PDFViewerApplication;
    
    // Validate that PDFViewerApplication is available
    if (!app) {
      log('PDFViewerApplication not available', 'error');
      return;
    }
    
    // Validate that the viewer is initialized for actions that require it
    const requiresInitialization = [
      'set-zoom', 'set-cursor', 'set-scroll', 'set-spread', 
      'set-page', 'set-rotation', 'go-to-last-page', 'go-to-named-dest',
      'update-page-mode', 'trigger-download', 'trigger-print', 
      'trigger-rotate-cw', 'trigger-rotate-ccw'
    ];
    
    if (requiresInitialization.includes(action) && !app.initialized) {
      log(`PDFViewerApplication not initialized for action: ${action}`, 'warn');
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
        
        // Event configuration
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
          throw new Error(`Unknown action: ${action}`);
      }
    } catch (error) {
      log(`Error in updateControl: ${error.message}`, 'error');
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
    if (!PDFViewerApplication || !PDFViewerApplication.initialized) {
      log('PDFViewerApplication not ready for zoom update', 'warn');
      return;
    }
    
    try {
      log(`Attempting to update zoom to: ${zoom}`);
      
      if (PDFViewerApplication.eventBus) {
        // Use PDF.js v4.x event bus dispatch for zoom changes
        PDFViewerApplication.eventBus.dispatch('scalechanged', {
          value: zoom
        });
        log(`Zoom updated via event bus to: ${zoom}`);
      }
      
      // Also try direct property access as fallback
      if (PDFViewerApplication.pdfViewer) {
        try {
          if (zoom === 'auto') {
            PDFViewerApplication.pdfViewer.currentScaleValue = 'auto';
          } else if (typeof zoom === 'number') {
            PDFViewerApplication.pdfViewer.currentScaleValue = zoom;
          } else if (typeof zoom === 'string') {
            // Handle zoom strings like "page-width", "page-height", "page-fit"
            PDFViewerApplication.pdfViewer.currentScaleValue = zoom;
          }
          log(`Zoom updated via direct access to: ${zoom}`);
        } catch (directError) {
          log(`Direct zoom update failed: ${directError.message}`, 'warn');
        }
      }
      
      log(`Zoom update completed for: ${zoom}`);
    } catch (error) {
      log(`Error updating zoom: ${error.message}`, 'error');
    }
  }

  function updateCursor(cursor) {
    if (!PDFViewerApplication || !PDFViewerApplication.initialized) {
      log('PDFViewerApplication not ready for cursor update', 'warn');
      return;
    }
    
    try {
      const cursorTool = cursor ? cursor.toUpperCase() : 'SELECT';
      log(`Attempting to update cursor to: ${cursorTool}`);
      
      if (PDFViewerApplication.eventBus) {
        // Use PDF.js v4.x event bus dispatch for cursor tool switching
        switch (cursorTool) {
          case 'HAND':
          case 'H':
            log('Dispatching switchcursortool with HAND tool');
            PDFViewerApplication.eventBus.dispatch('switchcursortool', {
              tool: 1 // CursorTool.HAND
            });
            break;
          case 'SELECT':
          case 'S':
            log('Dispatching switchcursortool with SELECT tool');
            PDFViewerApplication.eventBus.dispatch('switchcursortool', {
              tool: 0 // CursorTool.SELECT
            });
            break;
          case 'ZOOM':
          case 'Z':
            log('Dispatching switchcursortool with ZOOM tool');
            PDFViewerApplication.eventBus.dispatch('switchcursortool', {
              tool: 2 // CursorTool.ZOOM
            });
            break;
          default:
            log(`Unknown cursor type: ${cursor}`, 'warn');
        }
      } else {
        log('EventBus not available', 'error');
      }
      
      // Also try direct access to cursor tools if available
      if (PDFViewerApplication.pdfCursorTools) {
        try {
          switch (cursorTool) {
            case 'HAND':
            case 'H':
              PDFViewerApplication.pdfCursorTools.switchTool(1);
              break;
            case 'SELECT':
            case 'S':
              PDFViewerApplication.pdfCursorTools.switchTool(0);
              break;
            case 'ZOOM':
            case 'Z':
              PDFViewerApplication.pdfCursorTools.switchTool(2);
              break;
          }
          log(`Cursor updated via direct access to: ${cursorTool}`);
        } catch (directError) {
          log(`Direct cursor update failed: ${directError.message}`, 'warn');
        }
      }
      
      log(`Cursor update completed for: ${cursorTool}`);
    } catch (error) {
      log(`Error updating cursor: ${error.message}`, 'error');
    }
  }

  function updateScroll(scroll) {
    if (!PDFViewerApplication || !PDFViewerApplication.initialized) {
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
    if (!PDFViewerApplication || !PDFViewerApplication.initialized) {
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
        } else {
          // Fallback: store for later use when viewer is ready
          window.ng2PdfJsViewerLocale = locale;
          log(`Locale stored for later use: ${locale}`);
        }
      } catch (error) {
        log(`Error setting locale: ${error.message}`, 'error');
      }
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