(function() {
  'use strict';
  
  // Wait for PDF.js viewer to be ready
  function waitForViewer() {
    if (typeof PDFViewerApplication !== 'undefined' && PDFViewerApplication.initialized) {
      initializePostMessageAPI();
    } else {
      setTimeout(waitForViewer, 100);
    }
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
    
    console.log('🔍 Ng2PdfJsViewer: PostMessage API initialized');
  }

  function handleControlMessage(event) {
    const { type, action, payload, id } = event.data;
    
    if (type === 'control-update') {
      try {
        updateControl(action, payload);
        sendResponse(id, { success: true, action, payload });
      } catch (error) {
        console.error('🔍 Ng2PdfJsViewer: Error updating control:', error);
        sendResponse(id, { success: false, error: error.message });
      }
    }
  }

  function updateControl(action, payload) {
    const app = PDFViewerApplication;
    
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
        goToLastPage();
        break;
      case 'go-to-named-dest':
        goToNamedDestination(payload);
        break;
        
      // Auto actions
      case 'trigger-download':
        triggerDownload();
        break;
      case 'trigger-print':
        triggerPrint();
        break;
      case 'trigger-rotate-cw':
        triggerRotateCW();
        break;
      case 'trigger-rotate-ccw':
        triggerRotateCCW();
        break;
        
      default:
        console.warn('🔍 Ng2PdfJsViewer: Unknown action:', action);
    }
  }

  // Button visibility functions
  function updateDownloadButton(visible) {
    const button = document.getElementById('downloadButton');
    const secondaryButton = document.getElementById('secondaryDownload');
    if (button) {
      if (visible) {
        button.classList.remove('hidden');
      } else {
        button.classList.add('hidden');
      }
      console.log('🔍 Ng2PdfJsViewer: Download button visibility set to', visible);
    }
    if (secondaryButton) {
      if (visible) {
        secondaryButton.classList.remove('hidden');
      } else {
        secondaryButton.classList.add('hidden');
      }
      console.log('🔍 Ng2PdfJsViewer: Secondary download button visibility set to', visible);
    }
  }

  function updatePrintButton(visible) {
    const button = document.getElementById('printButton');
    const secondaryButton = document.getElementById('secondaryPrint');
    if (button) {
      if (visible) {
        button.classList.remove('hidden');
      } else {
        button.classList.add('hidden');
      }
      console.log('🔍 Ng2PdfJsViewer: Print button visibility set to', visible);
    }
    if (secondaryButton) {
      if (visible) {
        secondaryButton.classList.remove('hidden');
      } else {
        secondaryButton.classList.add('hidden');
      }
      console.log('🔍 Ng2PdfJsViewer: Secondary print button visibility set to', visible);
    }
  }

  function updateFullScreenButton(visible) {
    const button = document.getElementById('presentationMode');
    if (button) {
      if (visible) {
        button.classList.remove('hidden');
      } else {
        button.classList.add('hidden');
      }
      console.log('🔍 Ng2PdfJsViewer: FullScreen button visibility set to', visible);
    }
  }

  function updateFindButton(visible) {
    const button = document.getElementById('findbar');
    if (button) {
      if (visible) {
        button.classList.remove('hidden');
      } else {
        button.classList.add('hidden');
      }
      console.log('🔍 Ng2PdfJsViewer: Find button visibility set to', visible);
    }
  }

  function updateBookmarkButton(visible) {
    const button = document.getElementById('viewBookmark');
    if (button) {
      if (visible) {
        button.classList.remove('hidden');
      } else {
        button.classList.add('hidden');
      }
      console.log('🔍 Ng2PdfJsViewer: Bookmark button visibility set to', visible);
    }
  }

  function updateOpenFileButton(visible) {
    const button = document.getElementById('secondaryOpenFile');
    if (button) {
      if (visible) {
        button.classList.remove('hidden');
      } else {
        button.classList.add('hidden');
      }
      console.log('🔍 Ng2PdfJsViewer: Open file button visibility set to', visible);
    }
  }

  // Mode control functions
  function updateZoom(zoom) {
    const app = PDFViewerApplication;
    if (app && app.pdfViewer) {
      let scale = 1.0;
      switch (zoom) {
        case 'page-fit':
          scale = 0;
          break;
        case 'page-width':
          scale = -1;
          break;
        case '0.5':
          scale = 0.5;
          break;
        case '0.75':
          scale = 0.75;
          break;
        case '1':
          scale = 1.0;
          break;
        case '1.25':
          scale = 1.25;
          break;
        case '1.5':
          scale = 1.5;
          break;
        case '2':
          scale = 2.0;
          break;
        default:
          scale = parseFloat(zoom) || 1.0;
      }
      
      app.pdfViewer.currentScale = scale;
      console.log('🔍 Ng2PdfJsViewer: Zoom set to', zoom, '(scale:', scale, ')');
    }
  }

  function updateCursor(cursor) {
    const app = PDFViewerApplication;
    if (app && app.pdfViewer) {
      const cursorType = cursor.toUpperCase();
      if (cursorType === 'HAND' || cursorType === 'H') {
        app.pdfViewer.cursor = 'grab';
      } else if (cursorType === 'SELECT' || cursorType === 'S') {
        app.pdfViewer.cursor = 'default';
      } else if (cursorType === 'ZOOM' || cursorType === 'Z') {
        app.pdfViewer.cursor = 'zoom-in';
      }
      console.log('🔍 Ng2PdfJsViewer: Cursor set to', cursor);
    }
  }

  function updateScroll(scroll) {
    const app = PDFViewerApplication;
    if (app && app.pdfViewer) {
      const scrollType = scroll.toUpperCase();
      if (scrollType === 'VERTICAL' || scrollType === 'V') {
        app.pdfViewer.scrollMode = 0;
      } else if (scrollType === 'HORIZONTAL' || scrollType === 'H') {
        app.pdfViewer.scrollMode = 1;
      } else if (scrollType === 'WRAPPED' || scrollType === 'W') {
        app.pdfViewer.scrollMode = 2;
      }
      console.log('🔍 Ng2PdfJsViewer: Scroll mode set to', scroll);
    }
  }

  function updateSpread(spread) {
    const app = PDFViewerApplication;
    if (app && app.pdfViewer) {
      const spreadType = spread.toUpperCase();
      if (spreadType === 'ODD' || spreadType === 'O') {
        app.pdfViewer.spreadMode = 1;
      } else if (spreadType === 'EVEN' || spreadType === 'E') {
        app.pdfViewer.spreadMode = 2;
      } else if (spreadType === 'NONE' || spreadType === 'N') {
        app.pdfViewer.spreadMode = 0;
      }
      console.log('🔍 Ng2PdfJsViewer: Spread mode set to', spread);
    }
  }

  // Navigation control functions
  function updatePage(page) {
    const app = PDFViewerApplication;
    if (app && app.pdfViewer) {
      app.pdfViewer.currentPageNumber = page;
      console.log('🔍 Ng2PdfJsViewer: Page set to', page);
    }
  }

  function updateRotation(rotation) {
    const app = PDFViewerApplication;
    if (app && app.pdfViewer) {
      app.pdfViewer.pagesRotation = rotation;
      console.log('🔍 Ng2PdfJsViewer: Rotation set to', rotation);
    }
  }

  function goToLastPage() {
    const app = PDFViewerApplication;
    if (app && app.pdfViewer) {
      const lastPage = app.pagesCount;
      app.pdfViewer.currentPageNumber = lastPage;
      console.log('🔍 Ng2PdfJsViewer: Navigated to last page', lastPage);
    }
  }

  function goToNamedDestination(destination) {
    const app = PDFViewerApplication;
    if (app) {
      app.pdfLinkService.navigateTo(destination);
      console.log('🔍 Ng2PdfJsViewer: Navigated to named destination', destination);
    }
  }

  // Auto action functions
  function triggerDownload() {
    const app = PDFViewerApplication;
    if (app) {
      app.download();
      console.log('🔍 Ng2PdfJsViewer: Download triggered');
    }
  }

  function triggerPrint() {
    const app = PDFViewerApplication;
    if (app) {
      app.print();
      console.log('🔍 Ng2PdfJsViewer: Print triggered');
    }
  }

  function triggerRotateCW() {
    const app = PDFViewerApplication;
    if (app && app.pdfViewer) {
      const currentRotation = app.pdfViewer.pagesRotation;
      app.pdfViewer.pagesRotation = (currentRotation + 90) % 360;
      console.log('🔍 Ng2PdfJsViewer: Rotated clockwise');
    }
  }

  function triggerRotateCCW() {
    const app = PDFViewerApplication;
    if (app && app.pdfViewer) {
      const currentRotation = app.pdfViewer.pagesRotation;
      app.pdfViewer.pagesRotation = (currentRotation - 90 + 360) % 360;
      console.log('🔍 Ng2PdfJsViewer: Rotated counter-clockwise');
    }
  }

  // Response handling
  function sendResponse(id, response) {
    if (id) {
      window.parent.postMessage({
        type: 'control-response',
        id,
        ...response
      }, '*');
    }
  }

  // State synchronization
  function getState() {
    const app = PDFViewerApplication;
    if (app && app.pdfViewer) {
      return {
        currentPage: app.pdfViewer.currentPageNumber,
        totalPages: app.pagesCount,
        currentScale: app.pdfViewer.currentScale,
        currentRotation: app.pdfViewer.pagesRotation,
        scrollMode: app.pdfViewer.scrollMode,
        spreadMode: app.pdfViewer.spreadMode
      };
    }
    return null;
  }

  // Start the wrapper
  waitForViewer();
})(); 