// Validation helper functions
(function() {
  'use strict';
  
  // Common validation and execution pattern
  function validateAndExecute(condition, action, errorMessage) {
    if (condition) {
      action();
    } else {
      console.warn(`[PostMessage] ${errorMessage}`);
    }
  }

  // Validation for PDFViewerApplication availability
  function validatePDFApp(callback) {
    validateAndExecute(
      PDFViewerApplication?.initialized,
      callback,
      'PDFViewerApplication not ready'
    );
  }

  // Validation for EventBus availability  
  function validateEventBus(callback) {
    validateAndExecute(
      PDFViewerApplication?.eventBus,
      callback,
      'EventBus not available'
    );
  }

  // Combined validation for both PDFApp and EventBus
  function validatePDFAppAndEventBus(callback) {
    validateAndExecute(
      PDFViewerApplication?.initialized && PDFViewerApplication.eventBus,
      callback,
      'PDFViewerApplication and EventBus not ready'
    );
  }

  // Export helpers for use in main wrapper
  window.ValidationHelpers = {
    validateAndExecute: validateAndExecute,
    validatePDFApp: validatePDFApp,
    validateEventBus: validateEventBus,
    validatePDFAppAndEventBus: validatePDFAppAndEventBus
  };
})(); 