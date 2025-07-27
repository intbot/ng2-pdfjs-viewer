// Button visibility control helper functions
(function() {
  'use strict';
  
  // Helper function to toggle button visibility 
  function toggleButtonVisibility(primaryId, secondaryId, visible) {
    const primary = document.getElementById(primaryId);
    const secondary = secondaryId ? document.getElementById(secondaryId) : null;
    
    if (primary) {
      primary.classList.toggle('hidden', !visible);
    }
    if (secondary) {
      secondary.classList.toggle('hidden', !visible);
    }
    
    console.log(`[PostMessage] ${primaryId} visibility set to: ${visible}`);
  }

  // Export helper for use in main wrapper
  window.ButtonControlHelpers = {
    toggleButtonVisibility: toggleButtonVisibility
  };
})(); 