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
  // Init-time AppOptions from the host component (&pjsOptions=<json>). Must be
  // applied in the 'webviewerloaded' window: the viewer module has evaluated
  // (PDFViewerApplicationOptions exists) but run()/initialize() has not read
  // the options yet. Allowlisted - the URL is attacker-reachable surface.
  const PJS_OPTION_ALLOWLIST = new Set([
    'enableSignatureEditor', 'enableComment', 'enableXfa', 'enableScripting',
    'enablePermissions', 'enableAutoLinking', 'enableHighlightFloatingButton',
    'forcePageColors', 'pageColorsBackground', 'pageColorsForeground',
    'highlightEditorColors', 'defaultZoomValue', 'viewOnLoad',
    'sidebarViewOnLoad', 'scrollModeOnLoad', 'spreadModeOnLoad',
    'cursorToolOnLoad', 'printResolution', 'maxCanvasPixels', 'textLayerMode',
    'disablePageLabels', 'ignoreDestinationZoom', 'historyUpdateUrl',
    'disableHistory',
    // Page organization (views-manager editing: reorder/delete/extract/merge)
    'enableMerge', 'enableSplitMerge', 'enableUpdatedAddImage',
  ]);
  let initOptionsApplied = false;

  function applyInitTimeOptions() {
    if (initOptionsApplied || typeof PDFViewerApplicationOptions === 'undefined') {
      return;
    }
    initOptionsApplied = true;
    try {
      const raw = new URLSearchParams(window.location.search).get('pjsOptions');
      if (!raw) return;
      const parsed = JSON.parse(raw);
      for (const key of Object.keys(parsed)) {
        const value = parsed[key];
        const okType = ['string', 'number', 'boolean'].includes(typeof value);
        if (PJS_OPTION_ALLOWLIST.has(key) && okType) {
          PDFViewerApplicationOptions.set(key, value);
        } else {
          log(`Ignoring pjsOptions key outside allowlist: ${key}`, 'warn');
        }
      }
    } catch (error) {
      log(`Failed to apply init-time options: ${error.message}`, 'error');
    }
  }

  const onWebviewerLoaded = (event) => {
    // The parent document hears this event from every embedded viewer; only
    // react to the dispatch coming from this window.
    if (event.detail && event.detail.source && event.detail.source !== window) {
      return;
    }
    applyInitTimeOptions();
    // Must land before _initializeViewerComponents destructures
    // externalServices - i.e. before run() proceeds past this event.
    patchSignatureStorage();
    checkViewerReadiness();
  };
  // For same-origin embeds (the normal ng2-pdfjs-viewer case) PDF.js dispatches
  // 'webviewerloaded' on parent.document, NOT on this document - listening only
  // here would miss it and the options would be applied after run() has already
  // read them. Register on both; the parent registration is best-effort
  // (cross-origin parents throw, and there PDF.js falls back to this document).
  document.addEventListener('webviewerloaded', onWebviewerLoaded);
  try {
    if (window.parent !== window && window.parent.document) {
      window.parent.document.addEventListener('webviewerloaded', onWebviewerLoaded);
      window.addEventListener('pagehide', () => {
        try {
          window.parent.document.removeEventListener('webviewerloaded', onWebviewerLoaded);
        } catch (_) { /* parent already gone */ }
      });
    }
  } catch (_) {
    // Cross-origin parent: PDF.js dispatches on this document instead.
  }
  document.addEventListener('DOMContentLoaded', () => {
    if (typeof PDFViewerApplication !== 'undefined') {
      applyInitTimeOptions();
      patchSignatureStorage();
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

    // Form widget edit relay for [(formData)] two-way binding
    installFormChangeRelay();

    // Page-organization relay (reorder/delete/extract/merge via the views
    // manager when enablePageEditing is on)
    app.eventBus.on('pagesedited', (evt) => {
      // PDF.js dispatches { source, pagesMapper, type } where type is the
      // operation name ('move', 'delete', 'copy', 'extract', ...).
      sendEventNotification('pagesEdited', {
        operation: (evt && (evt.type || evt.operation)) || 'edit',
        pagesCount: app.pagesCount,
      });
    });

    // Watermark virtualized pages as they render
    app.eventBus.on('pagerendered', (evt) => {
      if (watermarkConfig && evt && evt.source && evt.source.div) {
        applyWatermarkToPage(evt.source.div);
      }
    });

    // Print blocking must wrap the viewer's own window.print replacement,
    // which exists only after the viewer module ran - hence installed here.
    if (!window._ng2PrintWrapped) {
      window._ng2PrintWrapped = true;
      const viewerPrint = window.print.bind(window);
      window.print = function () {
        if (protectionState.blockPrint) {
          log('Printing blocked by content protection', 'warn');
          return;
        }
        viewerPrint();
      };
    }

    // Annotation editor state relay (PDF.js 5.4+ event name). Carries the
    // undo/redo/empty/edit flags hosts need for save-button UX. PDF.js nests
    // the flags under evt.details ({ source, details: {...} }); only plain
    // fields are forwarded - the event object itself is not cloneable.
    app.eventBus.on('editingstateschanged', (evt) => {
      const state = (evt && evt.details) || evt || {};
      sendEventNotification('annotationEditorStateChange', {
        isEditing: state.isEditing === true,
        isEmpty: state.isEmpty === true,
        hasSomethingToUndo: state.hasSomethingToUndo === true,
        hasSomethingToRedo: state.hasSomethingToRedo === true,
        hasSelectedEditor: state.hasSelectedEditor === true,
      });
    });

    // Mode switches (user clicking editor toolbar buttons) relay so [annotationEditor]
    // two-way consumers can track the active editor.
    app.eventBus.on('switchannotationeditormode', (evt) => {
      const names = { '-1': 'disable', 0: 'none', 3: 'freetext', 9: 'highlight', 13: 'stamp', 15: 'ink', 101: 'signature', 102: 'comment' };
      sendEventNotification('annotationEditorModeChange', {
        mode: names[String(evt.mode)] ?? 'none',
      });
    });

    // Password-protected documents never reach documentinit/pagesloaded until
    // unlocked, so the host spinner would cover the password dialog forever
    // (issue #303). PDF.js exposes no eventBus event for the prompt, so wrap
    // its open() to drop the loading overlay and tell the host app.
    try {
      const prompt = app.passwordPrompt;
      if (prompt && typeof prompt.open === 'function' && !prompt._ng2OpenPatched) {
        const originalOpen = prompt.open.bind(prompt);
        prompt.open = function (...args) {
          sendStateChangeNotification('loading', false, 'system');
          sendEventNotification('passwordPrompt', {});
          return originalOpen(...args);
        };
        prompt._ng2OpenPatched = true;
      }
    } catch (_) {
      // prompt unavailable (non-standard build) - spinner keeps default behavior
    }
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

    if (type === 'host-response') {
      // Reply to a wrapper-initiated request (e.g. signature storage hooks)
      const pending = pendingHostRequests.get(event.data.requestId);
      if (pending) {
        pendingHostRequests.delete(event.data.requestId);
        if (event.data.error) {
          pending.reject(new Error(event.data.error));
        } else {
          pending.resolve(event.data.data);
        }
      }
      return;
    }

    if (type === 'control-update') {
      try {
        // Universal Dispatcher has already verified readiness - just execute.
        // Query actions return data (possibly a Promise); plain actions
        // return undefined and keep the original response shape.
        const result = updateControl(action, payload);
        Promise.resolve(result).then(
          (data) => sendResponse(
            id,
            data !== undefined
              ? { success: true, action, data }
              : { success: true, action, payload }
          ),
          (error) => {
            const errorMsg = `Error processing ${action}: ${error.message}`;
            log(errorMsg, 'error');
            sendResponse(id, { success: false, error: errorMsg });
          }
        );
      } catch (error) {
        const errorMsg = `Error processing ${action}: ${error.message}`;
        log(errorMsg, 'error');
        sendResponse(id, { success: false, error: errorMsg });
      }
    }
  }
  // #endregion

  // #region Host Signature Storage
  // When the host app provides a [signatureStorage] hook, saved signatures
  // round-trip to the parent (server/per-user persistence) instead of this
  // iframe's localStorage. The PDF.js factory is patched at webviewerloaded;
  // the returned storage delegates per call, so the host can enable the hook
  // any time before the user first opens the signature dialog.
  let hostSignatureStorageEnabled = false;
  let hostRequestSeq = 0;
  const pendingHostRequests = new Map();

  function requestFromHost(action, payload) {
    return new Promise((resolve, reject) => {
      const requestId = 'host-' + (++hostRequestSeq);
      pendingHostRequests.set(requestId, { resolve, reject });
      window.parent.postMessage({
        type: 'host-request',
        requestId: requestId,
        action: action,
        payload: payload,
        timestamp: Date.now()
      }, PARENT_ORIGIN);
      setTimeout(() => {
        if (pendingHostRequests.delete(requestId)) {
          reject(new Error('Host request timed out: ' + action));
        }
      }, 10000);
    });
  }

  let signatureUuidCounter = 0;
  function generateSignatureUuid() {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      const bytes = crypto.getRandomValues(new Uint8Array(8));
      let hex = '';
      for (let i = 0; i < bytes.length; i++) {
        hex += bytes[i].toString(16).padStart(2, '0');
      }
      return 'sig-' + hex;
    }
    // Last resort for environments without Web Crypto: this id is only a
    // storage key for a saved signature, never a security token.
    return 'sig-' + Date.now().toString(36) + '-' + (++signatureUuidCounter).toString(36);
  }

  let signatureStoragePatched = false;
  function patchSignatureStorage() {
    if (signatureStoragePatched) {
      return;
    }
    const app = typeof PDFViewerApplication !== 'undefined' ? PDFViewerApplication : null;
    const services = app && app.externalServices;
    if (!services || typeof services.createSignatureStorage !== 'function') {
      return;
    }
    signatureStoragePatched = true;
    const origFactory = services.createSignatureStorage.bind(services);
    services.createSignatureStorage = (eventBus, signal) => {
      const stock = origFactory(eventBus, signal);
      // Same surface as PDF.js's SignatureStorage (all async); the 5-signature
      // cap matches the stock UI's expectations. Every host round-trip is
      // guarded: PDF.js awaits these in unprotected paths (dialog open, add
      // button), so a hook failure/timeout must degrade gracefully, never
      // reject into the viewer UI.
      return {
        async getAll() {
          if (!hostSignatureStorageEnabled) {
            return stock.getAll();
          }
          try {
            const obj = await requestFromHost('signature-storage-get-all', null);
            return new Map(Object.entries(obj || {}));
          } catch (e) {
            log('signatureStorage getAll failed: ' + e.message, 'warn');
            return new Map();
          }
        },
        async size() {
          if (!hostSignatureStorageEnabled) {
            return stock.size();
          }
          return (await this.getAll()).size; // getAll never rejects
        },
        async isFull() {
          if (!hostSignatureStorageEnabled) {
            return stock.isFull();
          }
          return (await this.size()) >= 5;
        },
        async create(data) {
          if (!hostSignatureStorageEnabled) {
            return stock.create(data);
          }
          try {
            if (await this.isFull()) {
              return null;
            }
            const uuid = generateSignatureUuid();
            await requestFromHost('signature-storage-save', { uuid: uuid, data: data });
            return uuid;
          } catch (e) {
            // PDF.js treats a null create as 'not stored' and carries on
            log('signatureStorage save failed: ' + e.message, 'warn');
            return null;
          }
        },
        async delete(uuid) {
          if (!hostSignatureStorageEnabled) {
            return stock.delete(uuid);
          }
          try {
            await requestFromHost('signature-storage-delete', { uuid: uuid });
            return true;
          } catch (e) {
            log('signatureStorage delete failed: ' + e.message, 'warn');
            return false;
          }
        }
      };
    };
  }
  // #endregion

  // #region Annotation Restore
  // Rebuild editor annotations from their serialized form (the exact format
  // 'get-annotations' returns) by riding PDF.js's own page-clone machinery:
  // entries written to annotationStorage with isClone are picked up by
  // findClonesForPage() whenever a page's editor layer renders. isCopy makes
  // render() paint content for editors without an annotationElementId, and
  // isClone also suppresses the paste offset, so annotations land exactly
  // where they were exported. For pages whose editor layer is already
  // rendered, findClonesForPage is invoked directly.
  function countPendingRestores(storage) {
    // Raw clone data still waiting for its page to render (deserialized
    // editors are class instances and expose serialize()). AnnotationStorage
    // is iterable as [id, value] pairs - the same iteration
    // findClonesForPage uses.
    let pending = 0;
    try {
      for (const pair of storage) {
        const value = pair && pair[1];
        if (value && value.isClone === true && typeof value.serialize !== 'function') {
          pending++;
        }
      }
    } catch (_) {
      // Not iterable in this PDF.js build - report none pending
    }
    return pending;
  }

  // Best-effort input points for signature strokes: the non-copy serialized
  // form carries bezier outlines ('lines': [NaN,NaN,NaN,NaN, x1,y1, then
  // (c1x,c1y,c2x,c2y,x,y) triples]) but no input points, while PDF.js's draw
  // deserializer requires paths.{lines,points}. Derive the on-curve points
  // from each line - the same data the deserializer's own !lines branch
  // round-trips from.
  function pointsFromLine(line) {
    const pts = [line[4], line[5]];
    for (let i = 6; i + 5 < line.length; i += 6) {
      pts.push(line[i + 4], line[i + 5]);
    }
    return pts;
  }

  function sanitizeRestoreItem(data) {
    const clean = {};
    for (const key of Object.keys(data)) {
      // An own '__proto__'/'constructor' key (possible through structured
      // clone) would mutate the copy's prototype via [[Set]] - drop them.
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      clean[key] = data[key];
    }
    if (clean.isSignature === true && !clean.paths && Array.isArray(clean.lines)) {
      clean.paths = {
        lines: clean.lines,
        points: clean.lines.map(pointsFromLine),
      };
    }
    return clean;
  }

  function restoreEditorAnnotations(list) {
    const app = PDFViewerApplication;
    const storage = app.pdfDocument.annotationStorage;
    const layerProps = app.pdfViewer && app.pdfViewer._layerProperties;
    const uiManager = layerProps && layerProps.annotationEditorUIManager;
    if (!uiManager || typeof uiManager.getId !== 'function' ||
        typeof uiManager.findClonesForPage !== 'function') {
      // Without the editor UI manager nothing can ever pick the entries up,
      // and non-editor ids would silently corrupt save-document output.
      throw new Error('Annotation editor is not initialized - cannot restore annotations');
    }
    const pageIndexes = new Set();
    const pendingBefore = countPendingRestores(storage);
    let queued = 0;
    let rejected = 0;
    for (const data of list) {
      // An out-of-range pageIndex would make PDF.js's save path reject for
      // the rest of the session - validate instead of queueing blindly.
      if (!data || !Number.isInteger(data.pageIndex) ||
          data.pageIndex < 0 || data.pageIndex >= app.pagesCount) {
        rejected++;
        continue;
      }
      const clean = sanitizeRestoreItem(data);
      const id = uiManager.getId();
      storage.setValue(id, Object.assign(clean, {
        id: id,
        isCopy: true,
        isClone: true
      }));
      pageIndexes.add(clean.pageIndex);
      queued++;
    }
    const pulls = [];
    for (const pageIndex of pageIndexes) {
      const pageView = app.pdfViewer.getPageView(pageIndex);
      const builder = pageView && pageView.annotationEditorLayer;
      const layer = builder && builder.annotationEditorLayer;
      if (layer && layer.div) {
        pulls.push(
          Promise.resolve(uiManager.findClonesForPage(layer)).then(() => {
            // layer.render() recomputes div.hidden, but a direct pull does
            // not - unhide layers that just gained their first editors
            // (mode 'none' keeps empty layers hidden).
            layer.div.hidden = layer.isEmpty;
          }).catch(() => {})
        );
      }
    }
    return Promise.all(pulls).then(() => {
      // Diff against the pre-call snapshot so leftovers from earlier calls
      // are not billed to this one (approximate when a pull consumes an old
      // pending entry on the same page - clamped to stay sane).
      const pending = Math.max(0, countPendingRestores(storage) - pendingBefore);
      return {
        restored: Math.max(0, queued - pending),
        pending: pending,
        rejected: rejected,
      };
    });
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
          // Use CSS variable only (CSP-safe) - width applied via ng2-customization.css.
          // #viewsManager defines its own --sidebar-width locally, so the value is
          // carried on a dedicated inherited variable and re-mapped there.
          const outer = document.getElementById('outerContainer');
          if (outer && typeof payload === 'string' && payload.trim() !== '') {
            outer.style.setProperty('--ng2-sidebar-width', payload);
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
          // PDF.js 5.4+ replaced #sidebarContainer with the #viewsManager panel;
          // also hide its toolbar toggle so a hidden sidebar can't be reopened.
          toggleElementVisibilityById('viewsManager', payload);
          toggleElementVisibilityById('viewsManagerToggleButton', payload);
          break;
        case 'show-sidebar-left':
          // Old #toolbarSidebarLeft (view-switch buttons) maps to the views
          // selector dropdown in the redesigned sidebar header.
          toggleElementVisibilityById('viewsManagerSelector', payload);
          break;
        case 'show-sidebar-right':
          // Old #toolbarSidebarRight (current-outline button) equivalent.
          toggleElementVisibilityById('viewsManagerCurrentOutlineButton', payload);
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
            if (!PDFViewerApplication.isInitialViewSet) {
              // 'documentloaded' (level 5) fires BEFORE PDF.js applies its
              // initial view, so a direct page assignment here would be
              // overridden by setInitialView (history restore / default).
              // initialBookmark is PDF.js's native initial-page channel and
              // takes precedence over stored history (issue #309).
              PDFViewerApplication.initialBookmark = `page=${pageNumber}`;
            } else {
              PDFViewerApplication.page = pageNumber;
            }
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
        case 'set-external-link-target': {
          // PDFLinkService reads externalLinkTarget from AppOptions only at
          // construction, so post-init changes go straight to the instance.
          const targets = { none: 0, self: 1, blank: 2, parent: 3, top: 4 };
          const targetKey = typeof payload === 'string' ? payload.toLowerCase() : 'blank';
          if (targetKey in targets && PDFViewerApplication.pdfLinkService) {
            PDFViewerApplication.pdfLinkService.externalLinkTarget = targets[targetKey];
          } else {
            log(`Invalid external link target: ${payload}`, 'warn');
          }
          break;
        }
        case 'set-remember-last-view':
          // viewOnLoad: 0 = restore previous position (PDF.js default),
          // 1 = always open at the initial view. Read during document load,
          // so the level-3 dispatch lands in time.
          if (typeof PDFViewerApplicationOptions !== 'undefined') {
            PDFViewerApplicationOptions.set('viewOnLoad', payload === false ? 1 : 0);
          }
          break;
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

        // Annotation editing
        case 'set-annotation-editor-mode': {
          const modes = {
            disable: -1, none: 0, freetext: 3, highlight: 9,
            stamp: 13, ink: 15, signature: 101, comment: 102,
          };
          const modeKey = typeof payload === 'string' ? payload.toLowerCase() : 'none';
          if (!(modeKey in modes)) {
            throw new Error(`Invalid annotation editor mode: ${payload}`);
          }
          app.eventBus.dispatch('switchannotationeditormode', {
            source: null,
            mode: modes[modeKey],
          });
          break;
        }
        case 'set-highlight-editor-colors':
          // Read when the highlight editor initializes - level 3 dispatch
          // lands before the first document opens.
          if (typeof payload === 'string' && payload.trim() !== '' &&
              typeof PDFViewerApplicationOptions !== 'undefined') {
            PDFViewerApplicationOptions.set('highlightEditorColors', payload);
          }
          break;
        case 'get-annotations': {
          // Serialized state of every editor-created/modified annotation.
          // Plain JSON-safe objects (bitmaps are excluded by PDF.js's own
          // serialization for transfer).
          const storage = app.pdfDocument && app.pdfDocument.annotationStorage;
          if (!storage) {
            throw new Error('No document loaded');
          }
          const serializable = storage.serializable;
          const all = serializable && serializable.map
            ? Array.from(serializable.map.values())
            : [];
          // Only editor-created annotations are exported: form-field values
          // and comment-popup edits also live in annotationStorage but have
          // no pageIndex and cannot round-trip through set-annotations.
          const list = all.filter((item) =>
            item && typeof item.pageIndex === 'number');
          // Make the payload JSON-safe: typed arrays (ink/highlight/signature
          // geometry is Float32Array in serialized form) become plain arrays
          // so the data survives the round-trip intact; ImageBitmaps (stamp
          // images) cannot be serialized and are dropped.
          return JSON.parse(JSON.stringify(list, (key, value) => {
            if (typeof value === 'object' && value !== null &&
                typeof ImageBitmap !== 'undefined' && value instanceof ImageBitmap) {
              return undefined;
            }
            return ArrayBuffer.isView(value) ? Array.from(value) : value;
          }));
        }
        case 'set-signature-storage':
          // Route saved-signature persistence through the host's
          // [signatureStorage] hook instead of iframe localStorage.
          hostSignatureStorageEnabled = payload === true;
          break;
        case 'set-annotations': {
          // Restore previously exported annotations (get-annotations format)
          // into the live editor. Resolves with { restored, pending } -
          // 'pending' items apply as their pages' editor layers render.
          if (!app.pdfDocument) {
            throw new Error('No document loaded');
          }
          return restoreEditorAnnotations(Array.isArray(payload) ? payload : []);
        }
        case 'save-document': {
          // Full document bytes including annotation/form edits.
          if (!app.pdfDocument) {
            throw new Error('No document loaded');
          }
          return app.pdfDocument.saveDocument().then((bytes) => ({
            bytes,
            filename: app._contentDispositionFilename || 'document.pdf',
          }));
        }

        // Whole-toolbar visibility (recipe for fully custom host toolbars;
        // recurring user ask). The outerContainer class reclaims the height.
        case 'show-toolbar': {
          const outer = document.getElementById('outerContainer');
          if (outer) {
            outer.classList.toggle('ng2-toolbar-hidden', payload === false);
          }
          break;
        }

        // Document text extraction (BYO-AI integrations, host-side search UX)
        case 'get-document-text':
          return getDocumentText(payload || {});

        // Read-aloud via Web Speech over the extracted page text
        case 'read-aloud':
          return handleReadAloud(payload || {});

        // Form support
        case 'get-form-data':
          return getFormData();
        case 'set-form-data':
          return setFormFields(payload || {});
        case 'set-form-field':
          if (!payload || typeof payload.name !== 'string') {
            throw new Error('set-form-field requires { name, value }');
          }
          return setFormFields({ [payload.name]: payload.value });

        // Content protection (deterrence, not DRM - documented as such)
        case 'set-content-protection':
          applyContentProtection(payload || {});
          break;
        case 'set-watermark':
          setWatermark(payload);
          break;

        // Programmatic find/search
        case 'search':
          return runSearch(payload);
        case 'search-next':
          return continueSearch(false);
        case 'search-previous':
          return continueSearch(true);
        case 'clear-search':
          app.eventBus.dispatch('findbarclose', { source: null });
          lastFindState = null;
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

  // #region Document Text & Read-Aloud
  // Extract page text via the pdf.js text API. Used by host apps for BYO-AI
  // chat/summarization and by the read-aloud feature below. {from, to} are
  // 1-based and clamped to the document.
  function getDocumentText(options) {
    const app = PDFViewerApplication;
    const doc = app.pdfDocument;
    if (!doc) {
      return Promise.reject(new Error('No document loaded'));
    }
    const from = Math.max(1, options.from || 1);
    const to = Math.min(doc.numPages, options.to || doc.numPages);
    const tasks = [];
    for (let pageNumber = from; pageNumber <= to; pageNumber++) {
      tasks.push(
        doc.getPage(pageNumber).then((page) =>
          page.getTextContent().then((content) => ({
            page: pageNumber,
            text: content.items.map((item) => item.str).join(' ')
              .replace(/\s+/g, ' ').trim(),
          }))
        )
      );
    }
    return Promise.all(tasks);
  }

  // Read-aloud state machine on the iframe's speechSynthesis. Reads sentence
  // by sentence (one utterance each - also dodges Chrome's long-utterance
  // stalls), page by page from the given/current page, advancing the visible
  // page and highlighting the sentence being read in the text layer.
  // 'session' invalidates in-flight async chains (text-layer waits, utterance
  // callbacks) when reading restarts or stops - without it a quick
  // start-while-active spawns parallel reading chains.
  const readAloud = { active: false, page: 0, rate: 1, highlighted: [], session: 0 };

  function sendReadAloudState(status, sentence) {
    sendEventNotification('readAloudStateChange', {
      status,
      page: readAloud.page,
      sentence: sentence || undefined,
    });
  }

  function clearTtsHighlight() {
    for (const el of readAloud.highlighted) {
      el.classList.remove('ng2-tts-current');
    }
    readAloud.highlighted = [];
  }

  function getTextLayerDiv(pageNumber) {
    const app = PDFViewerApplication;
    const pageView = app.pdfViewer && app.pdfViewer.getPageView(pageNumber - 1);
    const textLayer = pageView && pageView.textLayer;
    return (textLayer && textLayer.div) || null;
  }

  // Resolve with the page's text layer div once it has content, or null on
  // timeout (text layer disabled / page not rendered) - callers fall back to
  // plain text extraction without highlighting.
  function waitForTextLayer(pageNumber, timeoutMs) {
    const existing = getTextLayerDiv(pageNumber);
    if (existing && existing.childNodes.length > 0) {
      return Promise.resolve(existing);
    }
    return new Promise((resolve) => {
      const app = PDFViewerApplication;
      let settled = false;
      const finish = () => {
        if (settled) return;
        settled = true;
        app.eventBus.off('textlayerrendered', handler);
        resolve(getTextLayerDiv(pageNumber));
      };
      const handler = (evt) => {
        if (evt && evt.pageNumber === pageNumber) finish();
      };
      app.eventBus.on('textlayerrendered', handler);
      setTimeout(finish, timeoutMs);
    });
  }

  // Leaf spans of the text layer that carry visible text, in reading order
  function collectTextSpans(layerDiv) {
    const spans = [];
    layerDiv.querySelectorAll('span').forEach((s) => {
      if (s.firstElementChild) return; // only leaves hold text directly
      const t = s.textContent;
      if (t && t.trim() !== '') spans.push(s);
    });
    return spans;
  }

  const SENTENCE_RE = /[^.!?]+[.!?]+["')\]]*\s*|[^.!?]+$/g;

  // Split the page into sentences, each knowing which text-layer spans it
  // covers (span granularity - a boundary span highlights with both
  // neighbors, which reads naturally).
  function buildSentencesFromSpans(spans) {
    let full = '';
    const ranges = [];
    for (const el of spans) {
      const start = full.length;
      full += el.textContent;
      ranges.push({ start, end: full.length, el });
      full += ' ';
    }
    const sentences = [];
    let m;
    while ((m = SENTENCE_RE.exec(full)) !== null) {
      const text = m[0].replace(/\s+/g, ' ').trim();
      if (!text) continue;
      const start = m.index;
      const end = m.index + m[0].length;
      const els = [];
      for (const r of ranges) {
        if (r.start < end && r.end > start) els.push(r.el);
      }
      sentences.push({ text, els });
    }
    return sentences;
  }

  function splitPlainSentences(text) {
    const out = [];
    let m;
    while ((m = SENTENCE_RE.exec(text)) !== null) {
      const t = m[0].replace(/\s+/g, ' ').trim();
      if (t) out.push({ text: t, els: [] });
    }
    return out;
  }

  function ttsSessionLive(session) {
    return readAloud.active && readAloud.session === session;
  }

  function speakSentence(pageNumber, sentences, index, session) {
    if (!ttsSessionLive(session)) return;
    if (index >= sentences.length) {
      clearTtsHighlight();
      speakPage(pageNumber + 1, session);
      return;
    }
    const sentence = sentences[index];
    clearTtsHighlight();
    for (const el of sentence.els) {
      el.classList.add('ng2-tts-current');
    }
    readAloud.highlighted = sentence.els.slice();
    const utterance = new SpeechSynthesisUtterance(sentence.text);
    utterance.rate = readAloud.rate;
    utterance.onend = () => {
      if (ttsSessionLive(session)) speakSentence(pageNumber, sentences, index + 1, session);
    };
    utterance.onerror = (event) => {
      // speechSynthesis.cancel() reports the cut-off utterance as an error
      // ('interrupted'/'canceled') — that's a deliberate stop, not a failure.
      const reason = event && event.error;
      if (!ttsSessionLive(session) || reason === 'interrupted' || reason === 'canceled') return;
      readAloud.active = false;
      clearTtsHighlight();
      sendReadAloudState('error');
    };
    sendReadAloudState('reading', sentence.text);
    window.speechSynthesis.speak(utterance);
  }

  function speakPage(pageNumber, session) {
    const app = PDFViewerApplication;
    if (!ttsSessionLive(session)) return;
    if (!app.pdfDocument || pageNumber > app.pagesCount) {
      readAloud.active = false;
      clearTtsHighlight();
      sendReadAloudState('finished');
      return;
    }
    readAloud.page = pageNumber;
    if (app.page !== pageNumber) {
      app.page = pageNumber; // follow the reading position
    }
    // Prefer the rendered text layer (enables sentence highlighting); fall
    // back to raw extraction when it isn't available in time.
    waitForTextLayer(pageNumber, 1500).then((layerDiv) => {
      if (!ttsSessionLive(session)) return;
      if (layerDiv) {
        const sentences = buildSentencesFromSpans(collectTextSpans(layerDiv));
        if (sentences.length === 0) {
          speakPage(pageNumber + 1, session);
          return;
        }
        speakSentence(pageNumber, sentences, 0, session);
        return;
      }
      getDocumentText({ from: pageNumber, to: pageNumber }).then((pages) => {
        if (!ttsSessionLive(session)) return;
        const text = pages[0] && pages[0].text;
        if (!text) {
          speakPage(pageNumber + 1, session);
          return;
        }
        const sentences = splitPlainSentences(text);
        if (sentences.length === 0) {
          speakPage(pageNumber + 1, session);
          return;
        }
        speakSentence(pageNumber, sentences, 0, session);
      }).catch(() => {
        if (!ttsSessionLive(session)) return;
        readAloud.active = false;
        clearTtsHighlight();
        sendReadAloudState('error');
      });
    });
  }

  function handleReadAloud(payload) {
    const synth = window.speechSynthesis;
    if (!synth) {
      return Promise.reject(new Error('Speech synthesis not supported in this browser'));
    }
    const command = payload.command || 'start';
    switch (command) {
      case 'start': {
        synth.cancel();
        // cancel() does not clear a global paused state left by pause() -
        // without this the new utterances queue silently into a paused synth
        synth.resume();
        readAloud.active = true;
        readAloud.session++;
        readAloud.rate = typeof payload.rate === 'number' ? payload.rate : 1;
        const fromPage = Math.max(1, payload.fromPage || PDFViewerApplication.page || 1);
        speakPage(fromPage, readAloud.session);
        break;
      }
      case 'pause':
        synth.pause();
        sendReadAloudState('paused');
        break;
      case 'resume':
        synth.resume();
        sendReadAloudState('reading');
        break;
      case 'stop':
        readAloud.active = false;
        readAloud.session++;
        synth.cancel();
        synth.resume(); // clear any lingering paused state (see 'start')
        clearTtsHighlight();
        sendReadAloudState('stopped');
        break;
      default:
        return Promise.reject(new Error(`Unknown read-aloud command: ${command}`));
    }
    return Promise.resolve({ status: command, page: readAloud.page });
  }
  // #endregion

  // #region Form Support
  // AcroForm field access. Values live in PDF.js's annotationStorage (the
  // source of truth for save/print); visible widgets are synced through the
  // DOM so PDF.js's own input listeners do the storage bookkeeping when the
  // page is rendered, with a direct storage write as the fallback for pages
  // that have not rendered yet.
  function getFormData() {
    const app = PDFViewerApplication;
    if (!app.pdfDocument) {
      return Promise.reject(new Error('No document loaded'));
    }
    return app.pdfDocument.getFieldObjects().then((fields) => {
      const storage = app.pdfDocument.annotationStorage;
      const data = {};
      for (const name of Object.keys(fields || {})) {
        for (const obj of fields[name]) {
          let value = obj.value;
          try {
            const stored = storage.getRawValue(obj.id);
            if (stored && stored.value !== undefined) {
              value = stored.value;
            }
          } catch (_) { /* unmodified field */ }
          data[name] = value === undefined ? null : value;
        }
      }
      return data;
    });
  }

  function setFormFields(values) {
    const app = PDFViewerApplication;
    if (!app.pdfDocument) {
      return Promise.reject(new Error('No document loaded'));
    }
    return app.pdfDocument.getFieldObjects().then((fields) => {
      if (!fields) {
        throw new Error('Document has no form fields');
      }
      const storage = app.pdfDocument.annotationStorage;
      const unknown = [];
      let applied = 0;
      for (const name of Object.keys(values)) {
        const objs = fields[name];
        if (!objs) {
          unknown.push(name);
          continue;
        }
        for (const obj of objs) {
          applyFieldValue(storage, obj, values[name]);
        }
        applied++;
      }
      if (unknown.length > 0) {
        log(`Unknown form fields ignored: ${unknown.join(', ')}`, 'warn');
      }
      return { applied, unknown };
    });
  }

  function applyFieldValue(storage, obj, value) {
    const section = document.querySelector(`[data-annotation-id="${obj.id}"]`);
    const element = section && section.querySelector('input, textarea, select');

    if (obj.type === 'checkbox') {
      const checked = value === true || value === 'true' ||
        (typeof value === 'string' && value !== 'false' && value === obj.exportValues);
      if (element && element.type === 'checkbox') {
        element.checked = checked;
        element.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        storage.setValue(obj.id, { value: checked });
      }
    } else if (obj.type === 'radiobutton') {
      const selected = value === obj.exportValues;
      if (element && element.type === 'radio') {
        if (selected) {
          element.checked = true;
          element.dispatchEvent(new Event('change', { bubbles: true }));
        }
      } else {
        storage.setValue(obj.id, { value: selected });
      }
    } else if (element) {
      element.value = value === null || value === undefined ? '' : String(value);
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      storage.setValue(obj.id, {
        value: value === null || value === undefined ? '' : String(value),
      });
    }
  }

  // Relay user edits in form widgets to the host (debounced; powers
  // [(formData)] two-way binding). Programmatic writes via the synthetic
  // events above also land here - the component suppresses no-op echoes.
  let formChangeTimer = null;
  function installFormChangeRelay() {
    document.addEventListener('change', onFormWidgetEvent, true);
    document.addEventListener('input', onFormWidgetEvent, true);
  }
  function onFormWidgetEvent(event) {
    const target = event.target;
    if (!target || !target.closest || !target.closest('.annotationLayer')) {
      return;
    }
    clearTimeout(formChangeTimer);
    formChangeTimer = setTimeout(() => {
      getFormData().then(
        (data) => sendStateChangeNotification('formData', data, 'user'),
        () => { /* document closed mid-debounce */ }
      );
    }, 150);
  }
  // #endregion

  // #region Content Protection
  const protectionState = { blockPrint: false, blockDownload: false };

  function protectionKeyHandler(event) {
    if (!event.ctrlKey && !event.metaKey) return;
    const key = (event.key || '').toLowerCase();
    if ((protectionState.blockPrint && key === 'p') ||
        (protectionState.blockDownload && key === 's')) {
      event.preventDefault();
      event.stopPropagation();
    }
  }
  window.addEventListener('keydown', protectionKeyHandler, true);

  function applyContentProtection(config) {
    protectionState.blockPrint = config.blockPrint === true;
    protectionState.blockDownload = config.blockDownload === true;
    const viewer = document.getElementById('viewerContainer');
    if (viewer) {
      viewer.classList.toggle('ng2-no-text-select', config.disableTextSelection === true);
    }
  }

  // Watermark overlays: one per rendered page, driven by pagerendered so
  // virtualized pages get theirs on first render.
  let watermarkConfig = null;

  function setWatermark(config) {
    watermarkConfig = (config && typeof config.text === 'string' && config.text.trim() !== '')
      ? config
      : null;
    document.querySelectorAll('.ng2-watermark').forEach((el) => el.remove());
    if (watermarkConfig) {
      document.querySelectorAll('.pdfViewer .page').forEach((page) => applyWatermarkToPage(page));
    }
  }

  function applyWatermarkToPage(page) {
    if (!watermarkConfig || page.querySelector('.ng2-watermark')) {
      return;
    }
    const overlay = document.createElement('div');
    overlay.className = 'ng2-watermark';
    const label = document.createElement('span');
    label.textContent = watermarkConfig.text;
    if (watermarkConfig.color) overlay.style.setProperty('--ng2-watermark-color', watermarkConfig.color);
    if (watermarkConfig.opacity !== undefined) overlay.style.setProperty('--ng2-watermark-opacity', String(watermarkConfig.opacity));
    if (watermarkConfig.fontSize) overlay.style.setProperty('--ng2-watermark-font-size', watermarkConfig.fontSize);
    if (watermarkConfig.rotation !== undefined) overlay.style.setProperty('--ng2-watermark-rotation', `${watermarkConfig.rotation}deg`);
    overlay.appendChild(label);
    page.appendChild(overlay);
  }
  // #endregion

  // #region Programmatic Find
  // State of the last programmatic search so search-next/previous can reissue
  // the query the way PDF.js's own findbar does ('again' dispatches).
  let lastFindState = null;

  function buildFindResult() {
    const app = PDFViewerApplication;
    const ctrl = app.findController;
    const matchesPerPage = (ctrl && ctrl.pageMatches)
      ? ctrl.pageMatches.map((m) => (m ? m.length : 0))
      : [];
    const pagesWithMatches = [];
    for (let i = 0; i < matchesPerPage.length; i++) {
      if (matchesPerPage[i] > 0) pagesWithMatches.push(i + 1);
    }
    const selected = ctrl && ctrl.selected ? ctrl.selected : null;
    return {
      total: matchesPerPage.reduce((a, b) => a + b, 0),
      current: selected && selected.pageIdx >= 0
        ? { page: selected.pageIdx + 1, matchIndex: selected.matchIdx }
        : null,
      matchesPerPage,
      pagesWithMatches,
    };
  }

  // Dispatch a find and resolve once the controller goes quiet. The find
  // controller reports progressively (state/match-count events per page as
  // text extraction completes), so "first non-pending state" would return
  // page-1-only counts. A short quiet period after the last progress event
  // captures the full-document result; a hard cap bounds pathological cases.
  function dispatchFindAndWait(findPayload) {
    const app = PDFViewerApplication;
    const QUIET_MS = 300;
    const MAX_WAIT_MS = 10000;
    return new Promise((resolve, reject) => {
      let settled = false;
      let quietTimer = null;
      const cleanup = () => {
        app.eventBus.off('updatefindcontrolstate', onProgress);
        app.eventBus.off('updatefindmatchescount', onProgress);
        clearTimeout(quietTimer);
        clearTimeout(capTimer);
      };
      const finish = () => {
        if (settled) return;
        settled = true;
        cleanup();
        resolve(buildFindResult());
      };
      const onProgress = () => {
        clearTimeout(quietTimer);
        quietTimer = setTimeout(finish, QUIET_MS);
      };
      const capTimer = setTimeout(finish, MAX_WAIT_MS);
      app.eventBus.on('updatefindcontrolstate', onProgress);
      app.eventBus.on('updatefindmatchescount', onProgress);
      // Arm the quiet timer up front: a query with zero matches may produce
      // few or no further progress events.
      quietTimer = setTimeout(finish, QUIET_MS * 3);
      try {
        app.eventBus.dispatch('find', findPayload);
      } catch (error) {
        settled = true;
        cleanup();
        reject(error);
      }
    });
  }

  function runSearch(options) {
    const app = PDFViewerApplication;
    if (!app.pdfDocument) {
      return Promise.reject(new Error('No document loaded'));
    }
    const opts = (typeof options === 'string') ? { query: options } : (options || {});
    if (!opts.query || (typeof opts.query === 'string' && opts.query.trim() === '')) {
      return Promise.reject(new Error('Search query is required'));
    }
    lastFindState = {
      source: null,
      type: '',
      query: opts.query,
      caseSensitive: opts.caseSensitive === true,
      entireWord: opts.entireWord === true,
      highlightAll: opts.highlightAll !== false,
      matchDiacritics: opts.matchDiacritics === true,
      findPrevious: false,
    };
    return dispatchFindAndWait(lastFindState);
  }

  function continueSearch(previous) {
    if (!lastFindState) {
      return Promise.reject(new Error('No active search - call search() first'));
    }
    const payload = Object.assign({}, lastFindState, {
      type: 'again',
      findPrevious: previous === true,
    });
    return dispatchFindAndWait(payload);
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

    // Before PDF.js applies its initial view, a live scalechanged dispatch
    // would be overridden by setInitialView ('auto' default or history
    // restore). defaultZoomValue is the native channel for the initial scale
    // and wins over history-stored zoom in both setInitialView branches
    // (issue #294). Live updates after that point keep the dispatch path.
    if (!app.isInitialViewSet && typeof PDFViewerApplicationOptions !== 'undefined') {
      try {
        PDFViewerApplicationOptions.set('defaultZoomValue', String(zoom));
        return;
      } catch (_) {
        // fall through to the live dispatch below
      }
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

  // PDF.js 5.4+ removed pdfViewer.useOnlyCssZoom; maxCanvasPixels = 0 is the
  // supported equivalent (pages are never re-rendered above their initial
  // canvas size, so zooming scales via CSS only). The option is read when page
  // views are created, so this must run before the document is opened — which
  // the initial configure batch guarantees.
  let defaultMaxCanvasPixels = null;

  function setCssZoom(useCssZoom) {
    try {
      if (typeof PDFViewerApplicationOptions !== 'undefined' && PDFViewerApplicationOptions) {
        if (defaultMaxCanvasPixels === null) {
          defaultMaxCanvasPixels = PDFViewerApplicationOptions.get('maxCanvasPixels');
        }
        PDFViewerApplicationOptions.set(
          'maxCanvasPixels',
          useCssZoom === true ? 0 : defaultMaxCanvasPixels
        );
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
    idle: false,
    sidebarViewChanged: false,
    layersChanged: false,
    namedAction: false,
    documentProperties: false
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

      // Sidebar view switches (thumbnails/outline/attachments/layers panel).
      // PDF.js SidebarView enum: -1 unknown, 0 none, 1 thumbs, 2 outline,
      // 3 attachments, 4 layers.
      app.eventBus.on('sidebarviewchanged', (event) => {
        if (eventEnablement.sidebarViewChanged) {
          const names = { 0: 'none', 1: 'thumbs', 2: 'outline', 3: 'attachments', 4: 'layers' };
          sendEventNotification('sidebarViewChanged', {
            view: names[event.view] || 'unknown'
          });
        }
      });

      // Optional-content (layers) lifecycle: 'loaded' when the layers panel is
      // populated for a layered PDF, 'changed' on every visibility toggle.
      app.eventBus.on('layersloaded', (event) => {
        if (eventEnablement.layersChanged) {
          sendEventNotification('layersChanged', {
            reason: 'loaded',
            layersCount: event.layersCount || 0
          });
        }
      });
      app.eventBus.on('optionalcontentconfigchanged', () => {
        if (eventEnablement.layersChanged) {
          sendEventNotification('layersChanged', { reason: 'changed' });
        }
      });

      // Embedded named actions (GoToPage, Print, NextPage, ...) triggered by
      // links/JavaScript inside the document itself.
      app.eventBus.on('namedaction', (event) => {
        if (eventEnablement.namedAction) {
          sendEventNotification('namedAction', { action: event.action || '' });
        }
      });

      // User opened the document-properties dialog.
      app.eventBus.on('documentproperties', () => {
        if (eventEnablement.documentProperties) {
          sendEventNotification('documentProperties', {});
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